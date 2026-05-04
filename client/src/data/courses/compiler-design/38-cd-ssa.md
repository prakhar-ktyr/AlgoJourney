---
title: Static Single Assignment Form
---

# Static Single Assignment Form

**Static Single Assignment (SSA)** is an intermediate representation where every variable is assigned exactly once. SSA simplifies many compiler optimizations and is used in modern compilers like GCC and LLVM.

---

## What is SSA?

In normal code, a variable can be assigned multiple times:

```c
x = 1;
x = x + 1;
x = x * 2;
```

In SSA form, each assignment creates a **new version** of the variable:

```
x1 = 1
x2 = x1 + 1
x3 = x2 * 2
```

**Rule**: Every variable is defined (assigned) exactly once in the static program text.

---

## Why SSA?

SSA makes def-use chains explicit:

| Without SSA | With SSA |
|-------------|----------|
| Hard to tell which definition reaches which use | Each use refers to exactly one definition |
| Need separate data-flow analysis | Relationships are immediate from variable names |

### Benefits for Optimization

1. **Constant propagation** — if `x3 = 5`, replace all uses of `x3` with 5
2. **Dead code elimination** — if `x2` is never used, remove its definition
3. **Common subexpression elimination** — same version = same value
4. **Register allocation** — version lifetimes don't overlap unnecessarily

---

## The Problem at Join Points

What happens when control flow merges?

```c
if (condition) {
    x = 1;
} else {
    x = 2;
}
// Which x is it here?
y = x + 3;
```

In SSA:
```
if condition goto L1 else L2

L1: x1 = 1
    goto L3

L2: x2 = 2
    goto L3

L3: x3 = φ(x1, x2)    ← phi function!
    y1 = x3 + 3
```

---

## Phi Functions

A **phi function** ($\phi$-function) selects the correct value based on which control flow edge was taken:

$$x_3 = \phi(x_1, x_2)$$

Meaning: "if we came from L1, use $x_1$; if from L2, use $x_2$."

Phi functions are **not real instructions** — they are a notational device. They are eliminated before final code generation.

### Properties

- Phi functions always appear at the **beginning** of a basic block
- They have one argument per predecessor block
- Arguments are ordered by predecessor edge

---

## Converting to SSA

### Step 1: Rename Variables

Add version numbers (subscripts) to each definition and its uses:

**Original:**
```c
a = 5;
b = a + 1;
a = b * 2;
c = a + b;
```

**SSA (straight-line code — no phi needed):**
```
a1 = 5
b1 = a1 + 1
a2 = b1 * 2
c1 = a2 + b1
```

### Step 2: Insert Phi Functions at Join Points

For code with branches:

**Original:**
```c
a = 0;
if (flag) {
    a = 1;
    b = a;
} else {
    b = 2;
}
c = a + b;
```

**SSA:**
```
a1 = 0
if flag goto L1 else L2

L1: a2 = 1
    b1 = a2
    goto L3

L2: b2 = 2
    goto L3

L3: a3 = φ(a2, a1)
    b3 = φ(b1, b2)
    c1 = a3 + b3
```

Wait — in the else branch, `a` wasn't assigned, so we use the version from before the if: $a_1$. The phi function selects correctly.

---

## Dominance

To determine **where** to insert phi functions, we need the concept of **dominance**.

### Dominator

Block $A$ **dominates** block $B$ (written $A \text{ dom } B$) if every path from the entry to $B$ must pass through $A$.

### Immediate Dominator

The closest strict dominator. Every block (except entry) has exactly one immediate dominator.

### Dominance Tree

A tree where each node's parent is its immediate dominator:

```
        Entry
       /     \
      B1      B2
     / \       |
    B3  B4    B5
```

### Dominance Frontier

The **dominance frontier** of block $A$ is the set of blocks where $A$'s dominance "ends" — blocks that $A$ does **not** strictly dominate, but $A$ dominates a predecessor of that block.

$$DF(A) = \{B \mid A \text{ dominates a predecessor of } B, \text{ but } A \text{ does not strictly dominate } B\}$$

**Key insight**: If variable `x` is defined in block $A$, we need phi functions for `x` at every block in $DF(A)$.

---

## SSA Construction Algorithm

### Placing Phi Functions

For each variable $v$ defined in block $B$:
1. For each block $D$ in $DF(B)$: insert $\phi$ for $v$ at the start of $D$
2. Since the $\phi$ itself is a new definition of $v$ in $D$, repeat for $DF(D)$
3. Continue until no new phi functions are needed (fixed point)

### Renaming Variables

Use a stack for each variable to track the current version:

```python
def rename(block):
    for phi in block.phi_functions:
        phi.target = new_version(phi.variable)
    
    for instr in block.instructions:
        # Replace uses with current version
        for use in instr.uses:
            use.version = current_version(use.variable)
        # Replace definition with new version
        if instr.defines:
            instr.target = new_version(instr.variable)
    
    # Fill in phi arguments in successor blocks
    for succ in block.successors:
        for phi in succ.phi_functions:
            phi.add_argument(current_version(phi.variable), block)
    
    # Recurse into children in dominance tree
    for child in dominator_tree_children(block):
        rename(child)
    
    # Pop versions added in this block
    pop_versions(block)
```

---

## Complete Example

**Original code:**
```c
int x = 1;
int y = 2;
while (x < 10) {
    y = y + x;
    x = x + 1;
}
// use y
```

**Control Flow Graph:**
```
B1: x = 1        →  B2
    y = 2

B2: if x < 10   → B3 (true), B4 (false)

B3: y = y + x   →  B2
    x = x + 1

B4: (use y)
```

**Dominance tree:**
```
B1 → B2 → B3
         → B4
```

**Dominance frontiers:**
- $DF(B3) = \{B2\}$ (B3 doesn't dominate B2, but B3's successor is B2)
- $DF(B1) = \emptyset$

Variables `x` and `y` are defined in B1 and B3, so phi functions needed at $DF(B3) = \{B2\}$.

**SSA form:**
```
B1: x1 = 1
    y1 = 2
    goto B2

B2: x3 = φ(x1, x2)
    y3 = φ(y1, y2)
    if x3 < 10 goto B3 else B4

B3: y2 = y3 + x3
    x2 = x3 + 1
    goto B2

B4: (use y3)
```

Note how the phi functions in B2 merge values from:
- B1 (initial values $x_1$, $y_1$)
- B3 (updated values $x_2$, $y_2$)

---

## SSA-Based Optimizations

### Sparse Conditional Constant Propagation

In SSA, if `x5 = 3`, every use of `x5` can be replaced with 3.

### Dead Code Elimination

If no instruction uses `y2`, we can safely remove `y2 = ...`.

### Global Value Numbering

Two SSA variables with identical definitions (same operator and operands) are guaranteed to have the same value.

### Copy Propagation

After `x2 = x1`, replace all uses of `x2` with `x1`, then remove the copy.

---

## Converting Out of SSA (Phi Elimination)

Before generating machine code, we must eliminate phi functions. The standard approach inserts **copy instructions** along predecessor edges:

**SSA:**
```
B1: ... goto B3
B2: ... goto B3
B3: x3 = φ(x1, x2)
```

**After phi elimination:**
```
B1: ...
    x3 = x1      ← copy inserted
    goto B3

B2: ...
    x3 = x2      ← copy inserted
    goto B3

B3: (use x3)
```

### Critical Edges

A **critical edge** goes from a block with multiple successors to a block with multiple predecessors. We may need to **split** such edges (insert an empty block) to place copies correctly.

```
Before:          After splitting:
B1 → B3          B1 → B1' → B3
B2 → B3          B2 → B2' → B3
(B1 has 2 succs) 
```

---

## SSA in Practice: LLVM IR

LLVM uses SSA as its core IR. Here's an example:

```
define i32 @max(i32 %a, i32 %b) {
entry:
  %cmp = icmp sgt i32 %a, %b
  br i1 %cmp, label %then, label %else

then:
  br label %merge

else:
  br label %merge

merge:
  %result = phi i32 [ %a, %then ], [ %b, %else ]
  ret i32 %result
}
```

Notice the explicit phi instruction with labeled predecessors.

---

## Summary

| Concept | Description |
|---------|-------------|
| SSA | Each variable assigned exactly once |
| Phi function | Merges values at join points: $\phi(v_1, v_2, \ldots)$ |
| Dominance | Block A dominates B if all paths to B go through A |
| Dominance frontier | Where to insert phi functions |
| Phi elimination | Replace phi with copies on predecessor edges |

---

## Exercises

1. **Convert to SSA form:**
   ```c
   x = 5;
   y = x + 1;
   if (y > 3) {
       x = y - 2;
   }
   z = x + y;
   ```
   Show the phi functions and variable versions.

2. **Draw the dominance tree** for this CFG:
   ```
   Entry → B1 → B2 → B4
                B2 → B3 → B4
   B1 → B3
   ```
   Compute $DF(B1)$, $DF(B2)$, $DF(B3)$.

3. **Perform constant propagation** on this SSA code:
   ```
   x1 = 3
   y1 = 5
   z1 = φ(x1, y1)   // assume x1 branch always taken
   w1 = z1 + 2
   ```

4. **Eliminate phi functions** from:
   ```
   B1: a1 = 10, goto B3
   B2: a2 = 20, goto B3
   B3: a3 = φ(a1, a2)
       b1 = a3 + 1
   ```
   Show the copies inserted on each edge.

5. **Explain** why SSA makes dead code elimination trivial compared to non-SSA code.

6. **Convert the following loop** to SSA and identify which phi functions are needed:
   ```c
   sum = 0;
   i = 1;
   while (i <= n) {
       sum = sum + i;
       i = i + 1;
   }
   ```
