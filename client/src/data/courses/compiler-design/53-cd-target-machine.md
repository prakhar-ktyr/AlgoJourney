---
title: Target Machine Model
---

# Target Machine Model

To generate efficient machine code, the compiler must understand the **target machine**: its instruction set, registers, memory model, and conventions.

---

## Instruction Set Architecture (ISA)

The ISA defines the interface between software and hardware:

- **Instructions**: what operations the CPU can perform
- **Registers**: fast storage locations inside the CPU
- **Memory model**: how memory is addressed and accessed
- **Data types**: integer sizes, floating-point formats

The compiler's code generator translates IR into the specific ISA of the target.

---

## RISC vs CISC

Two major design philosophies:

### RISC (Reduced Instruction Set Computer)

Examples: ARM, RISC-V, MIPS

| Feature | Description |
|---------|-------------|
| Instructions | Simple, uniform, fixed-size (32 bits) |
| Memory access | Only through load/store instructions |
| Registers | Many (32+) general-purpose |
| Execution | Most instructions take 1 cycle |
| Philosophy | Simple hardware, smart compiler |

```c
// RISC-V: add two memory values
lw   t0, 0(a0)      // load word from memory[a0]
lw   t1, 0(a1)      // load word from memory[a1]
add  t2, t0, t1     // add in registers
sw   t2, 0(a2)      // store result to memory[a2]
```

### CISC (Complex Instruction Set Computer)

Examples: x86, x86-64

| Feature | Description |
|---------|-------------|
| Instructions | Complex, variable-length (1-15 bytes) |
| Memory access | Most instructions can access memory directly |
| Registers | Fewer (16 GP on x86-64) |
| Execution | Variable cycles per instruction |
| Philosophy | Powerful instructions, less compiler burden |

```c
// x86-64: add two memory values
mov  eax, [rdi]     // load from memory
add  eax, [rsi]     // add directly from memory!
mov  [rdx], eax     // store result
```

### Compiler Implications

| Aspect | RISC target | CISC target |
|--------|-------------|-------------|
| Instruction selection | Simpler (fewer choices) | Complex (many ways to do same thing) |
| Register allocation | More registers → less spilling | Fewer registers → more pressure |
| Scheduling | Very important (expose ILP) | Less critical (hardware reorders) |

---

## x86-64 Registers

The most common target for desktop/server compilers:

### General-Purpose Registers (64-bit)

```
RAX  - Accumulator, return value
RBX  - Base register (callee-saved)
RCX  - Counter, 4th argument
RDX  - Data, 3rd argument
RSI  - Source index, 2nd argument
RDI  - Destination index, 1st argument
RBP  - Base/frame pointer (callee-saved)
RSP  - Stack pointer
R8   - 5th argument
R9   - 6th argument
R10  - Temporary (caller-saved)
R11  - Temporary (caller-saved)
R12  - Callee-saved
R13  - Callee-saved
R14  - Callee-saved
R15  - Callee-saved
```

### Sub-registers

Each 64-bit register has accessible sub-parts:

```
|63        32|31        16|15    8|7     0|
|            |            |       |       |
|<---------- RAX ----------------------->|
             |<-------- EAX ------------>|
                          |<---- AX ---->|
                          |  AH  |  AL  |
```

```c
// Accessing different sizes:
mov rax, 0x123456789ABCDEF0  // 64-bit
mov eax, 0x12345678           // 32-bit (zeros upper 32!)
mov ax, 0x1234                // 16-bit
mov al, 0x12                  // 8-bit low
```

### SIMD Registers

```
XMM0-XMM15   - 128-bit (SSE)
YMM0-YMM15   - 256-bit (AVX)
ZMM0-ZMM31   - 512-bit (AVX-512)
```

Used for floating-point and vector operations.

---

## ARM Registers (AArch64)

The dominant architecture for mobile and embedded:

```
X0-X7    - Arguments and return values
X8       - Indirect result location
X9-X15   - Temporary (caller-saved)
X16-X17  - Intra-procedure scratch
X18      - Platform register
X19-X28  - Callee-saved
X29 (FP) - Frame pointer
X30 (LR) - Link register (return address)
SP       - Stack pointer (not a GP register)
PC       - Program counter
```

32-bit views: W0-W30 (lower 32 bits of X0-X30)

---

## Addressing Modes

How instructions specify operand locations:

### Immediate

The operand is a constant encoded in the instruction:

```c
mov rax, 42          // rax = 42
add rax, 10          // rax = rax + 10
```

### Register

The operand is in a register:

```c
mov rax, rbx         // rax = rbx
add rax, rcx         // rax = rax + rcx
```

### Direct (Absolute)

The operand is at a fixed memory address:

```c
mov rax, [0x1000]    // rax = memory[0x1000]
```

### Register Indirect

The register holds the address:

```c
mov rax, [rbx]       // rax = memory[rbx]
```

### Base + Displacement

Address = register + constant offset:

```c
mov rax, [rbp - 8]   // rax = memory[rbp - 8]
mov rax, [rsp + 16]  // local variable access
```

### Indexed

Address = base + index × scale + displacement:

$$
\text{address} = \text{base} + \text{index} \times \text{scale} + \text{displacement}
$$

```c
// x86-64 addressing: [base + index*scale + disp]
mov rax, [rbx + rcx*4]       // array access: base + i*4
mov rax, [rbx + rcx*8 + 16]  // struct array: base + i*8 + offset
```

Scale can be 1, 2, 4, or 8 (matching byte, short, int, long sizes).

### Summary Table

| Mode | Syntax (x86-64) | Use Case |
|------|-----------------|----------|
| Immediate | `42` | Constants |
| Register | `rax` | Fast temporaries |
| Direct | `[addr]` | Global variables |
| Indirect | `[rax]` | Pointer dereference |
| Base+Disp | `[rbp-8]` | Local variables |
| Indexed | `[rax+rcx*4]` | Array access |

---

## Instruction Formats

### x86-64 (Variable Length)

Instructions range from 1 to 15 bytes:

```
[Prefixes] [Opcode] [ModR/M] [SIB] [Displacement] [Immediate]
 0-4 bytes  1-3 B    0-1 B   0-1 B    0-4 bytes     0-4 bytes
```

Complex encoding — the assembler/compiler handles this.

### RISC-V (Fixed Length, 32-bit)

Clean, regular encoding:

```
R-type: [funct7 | rs2 | rs1 | funct3 | rd | opcode]
         7 bits  5 b   5 b    3 bits  5 b   7 bits

I-type: [imm[11:0] | rs1 | funct3 | rd | opcode]
         12 bits    5 b    3 bits  5 b   7 bits

S-type: [imm[11:5] | rs2 | rs1 | funct3 | imm[4:0] | opcode]
```

Regular formats make decoding fast and simple.

---

## Calling Conventions

Rules for how functions communicate:

### System V AMD64 ABI (Linux, macOS)

**Argument passing:**

| Argument # | Integer/Pointer | Floating-Point |
|-----------|-----------------|----------------|
| 1st | RDI | XMM0 |
| 2nd | RSI | XMM1 |
| 3rd | RDX | XMM2 |
| 4th | RCX | XMM3 |
| 5th | R8 | XMM4 |
| 6th | R9 | XMM5 |
| 7th+ | Stack | XMM6-7, then stack |

**Return value:** RAX (integer), XMM0 (float)

**Register preservation:**

```
Caller-saved (volatile):    RAX, RCX, RDX, RSI, RDI, R8-R11
Callee-saved (non-volatile): RBX, RBP, R12-R15, RSP
```

### What This Means for the Compiler

```c
int add(int a, int b) { return a + b; }

// Compiler knows:
// a is in EDI (lower 32 of RDI)
// b is in ESI (lower 32 of RSI)
// Result goes in EAX
```

Generated assembly:

```c
add:
    lea eax, [edi + esi]   // eax = edi + esi
    ret
```

---

## Stack Alignment

The System V ABI requires the stack to be **16-byte aligned** before a `call`:

$$
\text{RSP} \mod 16 = 0 \quad \text{(at function entry after call pushes return address)}
$$

After the `call` pushes the 8-byte return address, RSP mod 16 = 8. The callee must adjust.

---

## Memory Model

### Endianness

- **Little-endian** (x86, ARM default): LSB at lowest address
- **Big-endian** (some ARM modes, MIPS): MSB at lowest address

```
Value: 0x12345678

Little-endian memory:
  addr+0: 0x78  (least significant)
  addr+1: 0x56
  addr+2: 0x34
  addr+3: 0x12  (most significant)
```

### Alignment

Data types must be aligned to their natural boundary:

| Type | Size | Alignment |
|------|------|-----------|
| char | 1 byte | 1 |
| short | 2 bytes | 2 |
| int | 4 bytes | 4 |
| long/pointer | 8 bytes | 8 |

Misaligned access may be slow (x86) or cause faults (ARM).

---

## Summary

| Component | x86-64 | ARM (AArch64) | RISC-V |
|-----------|--------|---------------|---------|
| GP registers | 16 | 31 | 32 |
| Instruction size | 1-15 bytes | 4 bytes | 4 bytes |
| Memory access | Any instruction | Load/store only | Load/store only |
| Endianness | Little | Configurable | Little |
| Args in regs | 6 | 8 | 8 |

The compiler must model these differences to generate correct, efficient code for each target.

---

## Exercises

1. Write x86-64 assembly to compute `arr[i] = arr[i] + 5` where `arr` base is in RDI and `i` is in RSI. Use indexed addressing.

2. How many GP registers are available for the register allocator on x86-64, excluding RSP and RBP? What about ARM?

3. Given the function signature `long foo(int a, long b, int *c)`, which registers hold each argument on System V AMD64?

4. Convert this RISC-V code to x86-64:
   ```
   lw   t0, 0(a0)
   lw   t1, 4(a0)
   add  t2, t0, t1
   sw   t2, 8(a0)
   ```

5. Explain why x86-64's variable-length instructions make branch prediction harder than RISC-V's fixed-length instructions.

6. A struct has fields: `char a; int b; char c; long d;`. What is its size and layout on x86-64 with natural alignment? How much padding is inserted?
