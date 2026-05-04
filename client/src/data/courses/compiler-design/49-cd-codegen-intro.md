---
title: Introduction to Code Generation
---

# Introduction to Code Generation

In this lesson, you will learn about **code generation** — the final phase of a compiler that translates intermediate representation (IR) into target machine code.

---

## What Is Code Generation?

Code generation is the process of transforming the compiler's IR into the **target language** — typically assembly or machine code for a specific processor.

```
Source Code → [Frontend] → IR → [Optimizer] → IR → [Code Generator] → Target Code
                                                          ↑
                                                    THIS PHASE
```

It is the **last major phase** of compilation. Everything before this point is (mostly) machine-independent; code generation is inherently **machine-dependent**.

---

## Target Code Forms

The code generator can produce different forms of output:

| Form | Description | Example |
|------|-------------|---------|
| Assembly language | Human-readable mnemonics | `mov eax, 5` |
| Relocatable machine code | Binary, needs linker | `.o` / `.obj` files |
| Absolute machine code | Ready to execute | Directly loaded into memory |
| Bytecode | Virtual machine instructions | JVM bytecode, WASM |

### Assembly Example (x86-64)

```c
// C source:
int add(int a, int b) {
    return a + b;
}
```

Generated assembly:
```
add:
    mov eax, edi        ; first argument (a) in edi
    add eax, esi        ; add second argument (b)
    ret                 ; return value in eax
```

---

## Goals of Code Generation

### 1. Correctness (Most Important!)

The generated code must preserve the **semantics** of the source program. A correct but slow program is acceptable; a fast but incorrect program is not.

### 2. Efficiency

Generate code that:
- Runs **fast** (minimize execution time)
- Is **small** (minimize code size)
- Uses **little energy** (important for mobile/embedded)

These goals often conflict — the code generator must balance them.

### 3. Effective Use of Target Resources

- Use all available **registers** (avoid unnecessary memory access)
- Exploit **instruction-level parallelism**
- Use specialized instructions (SIMD, hardware multiply, etc.)

---

## Major Tasks in Code Generation

Code generation involves three major sub-problems:

### 1. Instruction Selection

**Choose which target instructions** to implement each IR operation.

```
IR: t1 = a + b

Possible x86 translations:
  Option A: mov eax, [a]     ; 2 instructions
            add eax, [b]

  Option B: lea eax, [a+b]   ; 1 instruction (if a, b are registers)
```

Different choices affect speed, code size, and register usage.

### 2. Register Allocation

**Decide which values** live in registers vs. memory.

Registers are fast but scarce (x86-64 has 16 general-purpose registers). The code generator must:
- Keep frequently-used values in registers
- **Spill** values to memory when registers run out
- Minimize the number of loads/stores

### 3. Instruction Scheduling

**Order instructions** to maximize performance.

Modern processors can execute multiple instructions per cycle, but they have constraints (pipeline hazards, data dependencies). Reordering instructions can hide latencies:

```
// Before scheduling (stall on line 2):
load r1, [addr1]       ; takes 3 cycles
add r2, r1, r3         ; must wait for r1!
load r4, [addr2]       ; could have been done earlier

// After scheduling (no stall):
load r1, [addr1]       ; takes 3 cycles
load r4, [addr2]       ; fill the latency gap
add r2, r1, r3         ; r1 is ready now
```

---

## Target Machine Model

To generate code, we need a model of the target machine:

### Registers

```
General purpose:  r0, r1, r2, ..., r15  (or named: eax, ebx, ...)
Special purpose:  SP (stack pointer), FP (frame pointer), PC (program counter)
Floating point:   f0, f1, ..., f15  (or xmm0, xmm1, ...)
```

### Instruction Set

A typical RISC instruction set:

| Category | Instructions | Example |
|----------|-------------|---------|
| Arithmetic | ADD, SUB, MUL, DIV | `ADD r1, r2, r3` (r1 = r2 + r3) |
| Load/Store | LD, ST | `LD r1, [r2 + offset]` |
| Comparison | CMP | `CMP r1, r2` |
| Branch | BR, BEQ, BNE | `BEQ r1, r2, label` |
| Logic | AND, OR, XOR, NOT | `AND r1, r2, r3` |
| Shift | SHL, SHR | `SHL r1, r2, 3` |

### Memory Model

```
Registers:  fast (1 cycle access)
L1 Cache:   fast (3-4 cycles)
L2 Cache:   medium (10-20 cycles)
Main Memory: slow (100+ cycles)
```

---

## Simple Code Generation: Template-Based

The simplest approach translates each IR instruction independently using **templates**:

### Three-Address Code Templates

| IR Statement | Generated Code |
|-------------|----------------|
| `x = y + z` | `LD r1, y` / `LD r2, z` / `ADD r3, r1, r2` / `ST x, r3` |
| `x = y - z` | `LD r1, y` / `LD r2, z` / `SUB r3, r1, r2` / `ST x, r3` |
| `x = y` | `LD r1, y` / `ST x, r1` |
| `if x > y goto L` | `LD r1, x` / `LD r2, y` / `CMP r1, r2` / `BGT L` |

### Example

```c
// Source:
a = b + c;
d = a * e;
```

Three-address IR:
```
t1 = b + c
a = t1
t2 = a * e
d = t2
```

Template-based code (naive):
```
LD  r1, b
LD  r2, c
ADD r3, r1, r2
ST  a, r3
LD  r4, a          ; redundant! r3 already has this value
LD  r5, e
MUL r6, r4, r5
ST  d, r6
```

This generates correct but **inefficient** code. Better approaches (next lessons) will eliminate redundant loads/stores.

---

## A Better Approach: Register Descriptors

Track which values are currently in which registers:

```python
class SimpleCodeGenerator:
    def __init__(self):
        self.reg_descriptor = {}   # register → set of variables in it
        self.addr_descriptor = {}  # variable → where its value lives

    def get_reg(self, var):
        """Find or allocate a register for var."""
        # 1. If var is already in a register, use it
        for reg, vars in self.reg_descriptor.items():
            if var in vars:
                return reg

        # 2. If there's an empty register, use it
        for reg in self.all_registers:
            if not self.reg_descriptor[reg]:
                return reg

        # 3. Spill: pick a register, save its value, reuse it
        victim = self.pick_spill_candidate()
        self.spill(victim)
        return victim

    def generate(self, stmt):
        """Generate code for: x = y op z"""
        ry = self.get_reg(stmt.y)
        self.ensure_loaded(ry, stmt.y)

        rz = self.get_reg(stmt.z)
        self.ensure_loaded(rz, stmt.z)

        rx = self.get_reg(stmt.x)
        self.emit(f"{stmt.op} {rx}, {ry}, {rz}")

        # Update descriptors
        self.reg_descriptor[rx] = {stmt.x}
        self.addr_descriptor[stmt.x] = rx
```

---

## Handling Control Flow

### Basic Block Code Generation

Generate code one basic block at a time:

1. At block entry: load needed values into registers
2. Within the block: keep values in registers as long as possible
3. At block exit: ensure live values are stored (if needed by successors)

### Conditional Branches

```c
// IR: if t1 > t2 goto L1 else goto L2
```

Generated code:
```
CMP  r1, r2         ; compare t1 and t2
BGT  L1             ; branch if greater
BR   L2             ; otherwise go to L2
```

### Function Calls

Function calls require following a **calling convention**:

```
// Caller saves registers, passes arguments, calls function
PUSH r1             ; save caller-saved registers
PUSH r2
MOV  r_arg1, val1   ; pass arguments
MOV  r_arg2, val2
CALL function       ; call
MOV  result, r_ret  ; get return value
POP  r2             ; restore registers
POP  r1
```

---

## Addressing Modes

Target machines support various ways to access memory:

| Mode | Syntax | Meaning |
|------|--------|---------|
| Immediate | `#5` | Value 5 |
| Register | `r1` | Value in register r1 |
| Direct | `[1000]` | Value at memory address 1000 |
| Register indirect | `[r1]` | Value at address in r1 |
| Indexed | `[r1 + 8]` | Value at r1 + 8 |
| Scaled | `[r1 + r2*4]` | Array element access |

Choosing the right addressing mode is part of instruction selection.

### Example: Array Access

```c
// C: x = a[i]
// If a is at address 1000, each element is 4 bytes:
// address = 1000 + i * 4
```

```
// Using scaled addressing:
MOV r1, i
MOV r2, [1000 + r1*4]    ; single instruction on x86!
```

---

## Code Generation for Expressions

### Stack-Based Approach

Simple but not optimal — evaluate expressions using a stack:

```c
// Expression: (a + b) * (c - d)
// Postfix: a b + c d - *
```

```
PUSH a         ; stack: [a]
PUSH b         ; stack: [a, b]
ADD            ; stack: [a+b]
PUSH c         ; stack: [a+b, c]
PUSH d         ; stack: [a+b, c, d]
SUB            ; stack: [a+b, c-d]
MUL            ; stack: [(a+b)*(c-d)]
POP result     ; store result
```

### Register-Based Approach

More efficient — keep intermediate values in registers:

```
LD  r1, a
LD  r2, b
ADD r1, r1, r2      ; r1 = a + b
LD  r2, c
LD  r3, d
SUB r2, r2, r3      ; r2 = c - d
MUL r1, r1, r2      ; r1 = (a+b) * (c-d)
ST  result, r1
```

---

## Quality Metrics

How do we measure code generator quality?

| Metric | What It Measures |
|--------|-----------------|
| Static instruction count | Total number of instructions generated |
| Dynamic instruction count | Instructions executed at runtime |
| Register spills | How often values are moved to/from memory |
| Code size | Bytes of generated machine code |
| Execution time | Wall-clock time of generated program |

---

## Exercises

**Exercise 1:** Generate naive (template-based) target code for:

```
t1 = a + b
t2 = t1 * c
t3 = t2 - d
x = t3
```

Use a RISC machine with LD, ST, ADD, MUL, SUB instructions.

**Exercise 2:** The naive code from Exercise 1 has redundant loads/stores. Rewrite it assuming you have 4 registers and values stay in registers across statements.

**Exercise 3:** Generate code for this conditional:

```
if a > b goto L1
t1 = a + 1
goto L2
L1: t1 = b + 1
L2: x = t1
```

**Exercise 4:** Show how the expression `a * 2 + b * 4` can be generated using:
(a) Naive template approach
(b) Using shift instructions for multiplication by powers of 2

**Exercise 5:** Given a machine with only 2 registers, generate code for `t1 = (a + b) * (c + d)`. Where must you spill a value to memory?

**Exercise 6:** Explain why code generation is NP-hard in general (for optimal code). What heuristics make it tractable?

---

## Summary

- Code generation translates IR → target machine code
- Three major sub-tasks: instruction selection, register allocation, instruction scheduling
- Simple approach: template-based (one IR instruction → fixed target code)
- Better approaches track register contents to avoid redundant loads/stores
- Goals: correctness first, then efficiency (speed, size, energy)

---

## Next Steps

In the next lesson, you will learn about **Instruction Selection** — algorithms for choosing the best target instructions to implement each IR operation.
