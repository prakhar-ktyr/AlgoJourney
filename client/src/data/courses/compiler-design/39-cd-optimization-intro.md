---
title: Introduction to Code Optimization
---

# Introduction to Code Optimization

Code optimization transforms the intermediate representation to produce faster or smaller code while preserving program semantics. It's one of the most impactful phases of compilation.

---

## What is Optimization?

**Optimization** = transforming code to improve performance (speed, memory, power) without changing its observable behavior.

> "Optimization" is a misnomer — we rarely find the *optimal* solution. A better term is **code improvement**.

### The Golden Rule

$$\text{Optimized program} \equiv \text{Original program}$$

The optimized code must produce the **exact same results** for all valid inputs. Any transformation that changes behavior is a **bug**, not an optimization.

---

## Why Optimize?

| Concern | Example |
|---------|---------|
| Execution speed | Loop runs 10x faster |
| Memory usage | Fewer temporaries allocated |
| Code size | Smaller binary (embedded systems) |
| Power consumption | Fewer instructions = less energy |

Programmers write code for **readability**. The compiler optimizes for **performance**:

```c
// Programmer writes (clear):
for (int i = 0; i < strlen(s); i++) { ... }

// Compiler optimizes to (fast):
int len = strlen(s);
for (int i = 0; i < len; i++) { ... }
```

---

## Levels of Optimization

### 1. Local Optimization

Scope: **within a single basic block** (no branches).

- Constant folding
- Algebraic simplification
- Local common subexpression elimination

### 2. Global (Intraprocedural) Optimization

Scope: **within a single function**, across basic blocks.

- Loop optimizations
- Global dead code elimination
- Global constant propagation

### 3. Interprocedural Optimization

Scope: **across function boundaries**.

- Function inlining
- Interprocedural constant propagation
- Tail call optimization

### 4. Machine-Dependent Optimization

Scope: **target-specific** transformations.

- Register allocation
- Instruction scheduling
- Use of SIMD instructions

```
Source → IR → [Local Opt] → [Global Opt] → [Machine Opt] → Assembly
                   ↑              ↑               ↑
            Basic block      Whole function    Target CPU
```

---

## Basic Blocks

A **basic block** is a maximal sequence of consecutive instructions with:
- **No branches** except possibly at the **end**
- **No branch targets** except possibly at the **beginning**

Once execution enters a basic block, every instruction executes exactly once, in order.

### Identifying Basic Blocks

**Leaders** (first instruction of a block):
1. The first instruction of the program
2. Any instruction that is a **target** of a jump
3. Any instruction immediately **after** a jump

### Example

```
1: x = 1
2: y = 2
3: if x < 10 goto 7
4: z = x + y
5: x = x + 1
6: goto 3
7: a = x + y
8: return a
```

**Leaders**: 1 (first), 4 (after conditional jump), 7 (target of jump at 3), and implicitly 3 (target of goto 6).

Wait — let's redo this carefully:

- Instruction 1: first instruction → leader
- Instruction 3: target of `goto 3` (instruction 6) → leader
- Instruction 4: follows conditional jump (instruction 3) → leader
- Instruction 7: target of jump at instruction 3 → leader

**Basic blocks:**
- B1: {1, 2}
- B2: {3}
- B3: {4, 5, 6}
- B4: {7, 8}

---

## Control Flow Graph (CFG)

A **Control Flow Graph** is a directed graph where:
- **Nodes** = basic blocks
- **Edges** = possible flow of control between blocks

For our example:

```
B1 → B2
B2 → B3 (if x < 10 is false, fall through)
B2 → B4 (if x < 10 is true, goto 7)
B3 → B2 (goto 3)
```

```
    B1
    ↓
    B2 ←──┐
   ↙  ↘   │
  B4   B3 ─┘
```

### Building a CFG from TAC

```python
def build_cfg(instructions):
    # Step 1: Find leaders
    leaders = {0}  # First instruction is always a leader
    for i, instr in enumerate(instructions):
        if instr.is_jump():
            leaders.add(instr.target)
            if i + 1 < len(instructions):
                leaders.add(i + 1)
    
    # Step 2: Create basic blocks
    blocks = []
    sorted_leaders = sorted(leaders)
    for i, start in enumerate(sorted_leaders):
        end = sorted_leaders[i+1] if i+1 < len(sorted_leaders) else len(instructions)
        blocks.append(Block(instructions[start:end]))
    
    # Step 3: Add edges
    for block in blocks:
        last = block.last_instruction()
        if last.is_conditional_jump():
            block.add_edge(block_containing(last.target))
            block.add_edge(block.next_block())  # fall-through
        elif last.is_unconditional_jump():
            block.add_edge(block_containing(last.target))
        elif block.next_block():
            block.add_edge(block.next_block())  # fall-through
```

---

## Common Optimization Categories

| Category | Optimizations |
|----------|--------------|
| **Redundancy elimination** | CSE, copy propagation, value numbering |
| **Constant optimizations** | Constant folding, constant propagation |
| **Dead code** | Dead code elimination, unreachable code removal |
| **Loop optimizations** | Loop-invariant code motion, strength reduction, unrolling |
| **Control flow** | Branch elimination, tail merging, jump threading |
| **Procedure** | Inlining, tail call optimization |

---

## Optimization and Correctness

Not all "obvious" optimizations are safe:

```c
// Original
x = a / b;
y = 1;

// Can we reorder?
y = 1;
x = a / b;  // What if b == 0? Exception at different point!
```

Optimizations must respect:
- **Side effects** (I/O, exceptions, volatile access)
- **Aliasing** (two pointers to the same memory)
- **Concurrency** (other threads may observe order)
- **IEEE floating-point** semantics (reordering can change results)

---

## Compiler Optimization Flags

Most compilers offer different optimization levels:

| Flag | Level | Description |
|------|-------|-------------|
| `-O0` | None | No optimization (fast compile, easy debug) |
| `-O1` | Basic | Safe, fast optimizations |
| `-O2` | Standard | Most optimizations (default for release) |
| `-O3` | Aggressive | All of -O2 plus vectorization, inlining |
| `-Os` | Size | Optimize for code size |
| `-Ofast` | Unsafe | May violate language standards |

### What -O2 typically includes:
- Constant folding and propagation
- Dead code elimination
- Common subexpression elimination
- Loop-invariant code motion
- Function inlining (small functions)
- Register allocation optimization

### Example: Impact of Optimization

```c
int sum_array(int* arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum = sum + arr[i];
    }
    return sum;
}
```

**At -O0** (unoptimized):
- `sum`, `i` stored in memory, loaded/stored every iteration
- Bounds check every iteration

**At -O2**:
- `sum`, `i` kept in registers
- Loop unrolling possible
- Memory access patterns optimized

---

## A Taste of Optimization

### Before Optimization

```
t1 = 4
t2 = a * t1
t3 = b + t2
t4 = 4
t5 = a * t4
t6 = t3 + t5
```

### After Optimization

| Optimization | Result |
|-------------|--------|
| Constant folding | `t1 = 4` and `t4 = 4` are constants |
| Common subexpression | `a * 4` computed twice → reuse |
| Copy propagation | Replace `t4` with `4` |
| Dead code elimination | Remove unused `t4` |
| Strength reduction | `a * 4` → `a << 2` |

**Optimized:**
```
t1 = a << 2
t2 = b + t1
t3 = t2 + t1
```

Six instructions reduced to three!

---

## The Phase Ordering Problem

The order in which optimizations are applied matters:

- Constant propagation may enable dead code elimination
- Inlining may enable constant propagation
- Loop unrolling may enable vectorization

There is **no universally best order**. Compilers use carefully tuned sequences, and some run passes multiple times.

---

## Summary

- Optimization = semantics-preserving code improvement
- Levels: local → global → interprocedural → machine-dependent
- Basic block: maximal straight-line code sequence
- CFG: graph of basic blocks + control edges
- Compiler flags: -O0 through -O3 control aggressiveness
- Correctness must never be sacrificed for performance

---

## Exercises

1. **Identify basic blocks and draw the CFG** for:
   ```
   1: i = 1
   2: j = 1
   3: t1 = 10 * i
   4: t2 = t1 + j
   5: a[t2] = 0
   6: j = j + 1
   7: if j <= 10 goto 3
   8: i = i + 1
   9: if i <= 10 goto 2
   10: return
   ```

2. **Classify** each optimization as local, global, interprocedural, or machine-dependent:
   - Replacing `x * 2` with `x << 1`
   - Moving a computation out of a loop
   - Inlining a small function
   - Replacing `if (false)` block with nothing
   - Using SSE instructions for array operations

3. **Explain** why `-O3` is not always better than `-O2`. Give a scenario where aggressive optimization hurts.

4. **Given this CFG**, identify all back edges (edges from a block to a dominator, indicating loops):
   ```
   Entry → A → B → C → D
                B → D
                C → B    (back edge?)
   ```

5. **Determine** which of these transformations are safe:
   - Reorder two independent assignments
   - Remove an assignment whose result is never used
   - Evaluate `x / y` before checking `y != 0`
   - Merge two identical function calls into one

6. **Compile** a small program with `-O0` and `-O2` using `gcc -S`. Compare the generated assembly and identify at least 3 optimizations the compiler applied.
