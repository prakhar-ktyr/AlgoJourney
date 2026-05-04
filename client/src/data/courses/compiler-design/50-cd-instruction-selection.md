---
title: Instruction Selection
---

# Instruction Selection

In this lesson, you will learn about **instruction selection** — the process of mapping IR operations to specific target machine instructions. The goal is to find a good (or optimal) covering of the IR with available instructions.

---

## The Problem

Given an IR program, there are usually **many ways** to translate each operation into target instructions. The compiler must choose wisely.

### Example: Computing `a + b + 1`

On x86, multiple options exist:

```
; Option A (3 instructions):
mov eax, [a]
add eax, [b]
add eax, 1

; Option B (2 instructions, using LEA):
mov eax, [a]
lea eax, [eax + b + 1]    ; if b is in a register

; Option C (if b = 1, different approach):
mov eax, [a]
add eax, [b]
inc eax
```

Each option has different costs in terms of cycles, code size, and register usage.

---

## IR as Expression Trees

For instruction selection, we often view basic blocks as a sequence of **expression trees** (or DAGs):

```c
// IR:
t1 = a + b
t2 = t1 * 4
t3 = M[t2]        // memory load
```

As a tree:

```
        LOAD
         |
        MUL
       /   \
     ADD    4
    /   \
   a     b
```

Instruction selection **covers** this tree with instruction **tiles** (patterns that match subtrees).

---

## Tree Pattern Matching

Each target instruction matches a **pattern** (subtree of the IR tree):

### Example Instruction Patterns (RISC)

| Instruction | Pattern | Cost |
|-------------|---------|------|
| `LD r, [addr]` | LOAD(addr) | 3 |
| `ADD r1, r2, r3` | ADD(reg, reg) | 1 |
| `ADDI r1, r2, c` | ADD(reg, const) | 1 |
| `MUL r1, r2, r3` | MUL(reg, reg) | 3 |
| `SHL r1, r2, n` | MUL(reg, 2^n) | 1 |
| `LD r, [r2 + r3*4]` | LOAD(ADD(reg, MUL(reg, 4))) | 3 |

### Covering the Tree

A valid **tiling** covers every node in the IR tree with instruction patterns:

```
        LOAD                    Tile 1: LD r3, [r2]    (covers LOAD)
         |
        MUL                     Tile 2: SHL r2, r1, 2  (covers MUL by 4)
       /   \
     ADD    4                   Tile 3: ADD r1, ra, rb  (covers ADD)
    /   \
   a     b                     (a, b are already in registers ra, rb)
```

**Total cost**: 1 + 1 + 3 = 5

But a better tiling might use a complex addressing mode:

```
Tile: LD r1, [ra + rb*4]       (covers LOAD(ADD(reg, MUL(reg, 4))))
Total cost: 3  (single instruction!)
```

This matches the entire tree in **one instruction** — much better!

---

## Maximal Munch Algorithm

**Maximal munch** is a greedy algorithm: at each node, choose the **largest** (most complex) pattern that matches.

### Algorithm

```python
def maximal_munch(node):
    """Greedily tile the tree starting from the root."""
    # Find the largest pattern that matches at this node
    best_tile = None
    for tile in instruction_tiles:
        if matches(tile.pattern, node):
            if best_tile is None or tile.size > best_tile.size:
                best_tile = tile

    # Emit this instruction
    emit(best_tile.instruction)

    # Recursively tile the remaining subtrees (leaves of the tile)
    for child in best_tile.remaining_children(node):
        maximal_munch(child)
```

### Example Walkthrough

IR tree for `M[a + b * 4]`:

```
      LOAD
       |
      ADD
     /   \
    a    MUL
        /   \
       b     4
```

**Step 1**: Start at root (LOAD). Check patterns:
- `LD r, [addr]` matches LOAD(anything) — size 1
- `LD r, [r1 + r2]` matches LOAD(ADD(reg, reg)) — size 2
- `LD r, [r1 + r2*4]` matches LOAD(ADD(reg, MUL(reg, 4))) — size 4 ← **largest!**

**Step 2**: Emit `LD r1, [ra + rb*4]`. Remaining leaves: a (in ra), b (in rb).

**Step 3**: Both a and b are registers — no further tiling needed.

**Result**: Single instruction! Cost = 3.

### Characteristics

| Property | Value |
|----------|-------|
| Optimality | Not guaranteed (greedy) |
| Speed | Fast: $O(n)$ for $n$ nodes |
| Implementation | Simple pattern matching |
| Quality | Usually good in practice |

---

## Dynamic Programming Approach

For **optimal** instruction selection, use dynamic programming on the tree.

### The Idea

For each subtree, compute the **minimum cost** of tiling it. Process the tree **bottom-up**:

$$\text{cost}(n) = \min_{\text{tile } t \text{ matching at } n} \left( \text{cost}(t) + \sum_{\text{leaves } l \text{ of } t} \text{cost}(l) \right)$$

### Algorithm

```python
def optimal_tiling(node):
    """Find minimum-cost tiling using dynamic programming."""
    if node.is_leaf():
        node.min_cost = 0  # Leaves (registers/constants) are free
        node.best_tile = None
        return

    # First, recursively compute costs for all children
    for child in node.children:
        optimal_tiling(child)

    # Now find the best tile at this node
    node.min_cost = float('inf')
    for tile in matching_tiles(node):
        cost = tile.cost
        # Add costs of subtrees NOT covered by this tile
        for leaf_subtree in tile.uncovered_subtrees(node):
            cost += leaf_subtree.min_cost
        if cost < node.min_cost:
            node.min_cost = cost
            node.best_tile = tile

def emit_code(node):
    """Emit instructions for the optimal tiling (top-down)."""
    if node.best_tile is None:
        return  # Leaf node
    # First emit code for uncovered subtrees
    for subtree in node.best_tile.uncovered_subtrees(node):
        emit_code(subtree)
    # Then emit this instruction
    emit(node.best_tile.instruction)
```

### Example

```
      ADD
     /   \
   MUL    c
  /   \
 a     4
```

Available instructions:
- ADD r, r, r (cost 1)
- MUL r, r, r (cost 3)
- SHL r, r, n (cost 1, matches MUL by power of 2)
- ADDI r, r, c (cost 1, matches ADD with constant)

**Bottom-up costs:**
- Node `a`: cost 0 (register)
- Node `4`: cost 0 (constant)
- Node `c`: cost 0 (register)
- Node `MUL(a, 4)`:
  - Tile MUL: cost = 3 + 0 + 0 = 3
  - Tile SHL (matches MUL by 4): cost = 1 + 0 = 1 ← **best!**
- Node `ADD(MUL(a,4), c)`:
  - Tile ADD: cost = 1 + 1 + 0 = 2 ← **best!**

**Optimal tiling:**
```
SHL r1, ra, 2       ; r1 = a * 4 (cost 1)
ADD r2, r1, rc      ; r2 = r1 + c (cost 1)
; Total cost: 2
```

---

## CISC vs RISC Considerations

### RISC (ARM, RISC-V, MIPS)

- Simple, uniform instructions
- Fixed-length encoding (usually 32 bits)
- Load/store architecture: only loads and stores access memory
- Few addressing modes
- Instruction selection is simpler — fewer choices

```
; RISC-V: a = b + c (all in registers)
add  a0, a1, a2     ; single instruction
```

### CISC (x86, x86-64)

- Complex, variable-length instructions
- Memory operands in arithmetic instructions
- Many addressing modes (direct, indirect, indexed, scaled)
- More instruction selection opportunities (and challenges!)

```
; x86-64: multiple ways to add
add  eax, ebx           ; reg + reg
add  eax, [rbx]         ; reg + memory
add  eax, [rbx+rcx*4]   ; reg + scaled indexed memory
lea  eax, [rbx+rcx+5]   ; load effective address (add 3 values!)
```

### Impact on Instruction Selection

| Aspect | RISC | CISC |
|--------|------|------|
| Number of patterns | Few (10s) | Many (100s) |
| Pattern complexity | Simple trees | Complex subtrees |
| Optimal selection | Easier | Harder |
| Maximal munch | Works well | Very effective (big tiles) |

---

## Example: x86 Instruction Selection for Expressions

### Expression: `a[i] = a[i] + 1`

**IR (three-address code):**
```
t1 = i * 4          ; byte offset (int = 4 bytes)
t2 = a + t1         ; address of a[i]
t3 = M[t2]          ; load a[i]
t4 = t3 + 1         ; increment
M[t2] = t4          ; store back
```

**Naive x86 translation (5 instructions):**
```
mov  ecx, [i]           ; load i
shl  ecx, 2             ; i * 4
mov  eax, [a + ecx]     ; load a[i]
add  eax, 1             ; a[i] + 1
mov  [a + ecx], eax     ; store a[i]
```

**Better x86 (using memory operand, 3 instructions):**
```
mov  ecx, [i]           ; load i
shl  ecx, 2             ; i * 4
add  dword [a + ecx], 1 ; increment a[i] in place!
```

The x86 `add [mem], imm` instruction covers STORE(ADD(LOAD(addr), 1), addr) — a complex pattern!

---

## Peephole Optimization After Instruction Selection

After initial instruction selection, a **peephole optimizer** scans small windows of instructions looking for improvements:

### Common Peephole Patterns

| Before | After | Rule |
|--------|-------|------|
| `mov r1, r2` / `mov r2, r1` | `mov r1, r2` | Redundant copy |
| `add r1, 0` | (remove) | Identity |
| `mul r1, 1` | (remove) | Identity |
| `mul r1, 2` | `shl r1, 1` | Strength reduction |
| `jmp L` / `L:` | `L:` | Jump to next |
| `mov r1, r2` / `op r3, r1, ...` | `op r3, r2, ...` | Copy propagation |

### Example

```
; Before peephole:
mov  eax, ebx
add  eax, 0         ; useless!
mov  ecx, eax       ; just a copy
mul  ecx, 2         ; multiply by 2

; After peephole:
shl  ebx, 1         ; strength reduction + copy propagation
mov  ecx, ebx
```

### Peephole Optimizer Implementation

```python
def peephole_optimize(instructions):
    """Apply peephole rules to a sequence of instructions."""
    changed = True
    while changed:
        changed = False
        i = 0
        while i < len(instructions):
            # Check window of 2-3 instructions
            window = instructions[i:i+3]
            for rule in peephole_rules:
                if rule.matches(window):
                    replacement = rule.apply(window)
                    instructions[i:i+len(window)] = replacement
                    changed = True
                    break
            i += 1
    return instructions
```

---

## Instruction Selection Tools

Modern compilers often use **machine description files** to generate instruction selectors automatically:

### LLVM's TableGen

```
// Define an ADD instruction pattern:
def ADD32rr : I<"add", (outs GR32:$dst),
                        (ins GR32:$src1, GR32:$src2),
               [(set GR32:$dst, (add GR32:$src1, GR32:$src2))]>;
```

The tool generates a tree-matching instruction selector from machine descriptions automatically.

---

## Challenges in Instruction Selection

### 1. Instruction Interactions

Some instructions have implicit operand constraints:

```
; x86 division: uses eax:edx implicitly
div  ebx        ; eax = (edx:eax) / ebx, edx = remainder
```

### 2. Condition Codes

Some instructions set flags as side effects:

```
; x86: SUB sets flags that CMP would also set
sub  eax, ebx   ; eax = eax - ebx AND sets flags
jz   label      ; jump if zero (based on sub result)
; No separate CMP needed!
```

### 3. Multi-Output Instructions

Some instructions produce multiple results:

```
; x86 DIVMOD: produces both quotient and remainder
div  ebx        ; eax = quotient, edx = remainder
```

### 4. Register Constraints

Some instructions require specific registers:

```
; x86 shift: count must be in cl register
shl  eax, cl    ; shift eax left by cl bits
```

---

## Summary of Approaches

| Approach | Quality | Speed | Complexity |
|----------|---------|-------|------------|
| Template (1:1) | Poor | Very fast | Simple |
| Maximal Munch | Good | Fast $O(n)$ | Moderate |
| Dynamic Programming | Optimal (for trees) | $O(n)$ | Moderate |
| BURS (Bottom-Up Rewrite) | Optimal | $O(n)$ | Complex setup |
| Superoptimization | Globally optimal | Very slow | Very complex |

---

## Exercises

**Exercise 1:** Given these instruction tiles, find the optimal tiling for the expression tree `(a + b) * (c + 4)`:

- ADD r, r, r (cost 1)
- ADDI r, r, imm (cost 1)
- MUL r, r, r (cost 3)

Draw the tree and show your tiling.

**Exercise 2:** Apply maximal munch to the tree for `M[base + index * 8]` given:
- LD r, [r] (cost 3, matches LOAD(reg))
- LD r, [r + r] (cost 3, matches LOAD(ADD(reg, reg)))
- LD r, [r + r*8] (cost 3, matches LOAD(ADD(reg, MUL(reg, 8))))
- ADD r, r, r (cost 1)
- MUL r, r, r (cost 3)
- SHL r, r, 3 (cost 1, matches MUL(reg, 8))

What tiling does maximal munch produce? Is it optimal?

**Exercise 3:** Show two different x86 instruction sequences for:
```c
int x = a * 4 + b;
```
Which is better and why?

**Exercise 4:** Identify three peephole optimization opportunities in:
```
mov  eax, ebx
mov  ebx, eax
add  eax, 0
mul  ecx, 1
jmp  L1
L1:  mov  edx, eax
```

**Exercise 5:** Explain why instruction selection on DAGs (not trees) is harder when a node has multiple uses.

---

## Summary

- Instruction selection maps IR operations to target machine instructions
- **Tree pattern matching** covers IR trees with instruction tiles
- **Maximal munch**: greedy, fast, good quality
- **Dynamic programming**: optimal tiling for expression trees
- **CISC** machines offer more complex (and more powerful) tiles
- **Peephole optimization** cleans up after initial selection
- Modern compilers use machine descriptions to automate instruction selection

---

## Next Steps

In the next lesson, you will learn about **Register Allocation** — how the compiler decides which variables live in registers and which must be spilled to memory.
