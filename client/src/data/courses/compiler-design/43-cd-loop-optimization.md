---
title: Loop Optimization
---

# Loop Optimization

Programs spend **90% of their time in 10% of the code** — and that 10% is almost always inside loops. Optimizing loops gives the biggest performance gains.

---

## Why Focus on Loops?

```c
// This innocent-looking loop executes the body 1,000,000 times
for (int i = 0; i < 1000; i++) {
    for (int j = 0; j < 1000; j++) {
        result += matrix[i][j] * scale_factor;
    }
}
```

Even saving one instruction inside the inner loop saves **1,000,000 instructions** total!

---

## Identifying Loops in the CFG

Before optimizing loops, the compiler must **find** them. This requires understanding dominators and back edges.

### Dominators

Node $A$ **dominates** node $B$ (written $A\ \text{dom}\ B$) if every path from the Entry to $B$ must pass through $A$.

Properties:
- Every node dominates itself
- Entry dominates all nodes
- Dominance is transitive: if $A\ \text{dom}\ B$ and $B\ \text{dom}\ C$, then $A\ \text{dom}\ C$

### Computing Dominators

```python
def compute_dominators(cfg):
    dom = {}
    dom[entry] = {entry}
    for B in cfg.blocks - {entry}:
        dom[B] = set(cfg.blocks)  # Initialize to all blocks
    
    changed = True
    while changed:
        changed = False
        for B in cfg.blocks - {entry}:
            new_dom = intersection(dom[P] for P in predecessors(B))
            new_dom = new_dom | {B}  # Node dominates itself
            if new_dom != dom[B]:
                dom[B] = new_dom
                changed = True
    return dom
```

### Back Edges

A **back edge** is an edge $B \to A$ where $A$ dominates $B$.

Back edges indicate loops — the edge "goes back" to a dominating node (the loop header).

```
    [A] ← loop header (dominates B)
     |
     v
    [B]
     |  \
     v   |  ← back edge B → A
    [C]  |
         |
    -----+
```

### Natural Loops

Given a back edge $B \to A$:

- **Loop header**: $A$ (the node that dominates)
- **Loop body**: all nodes that can reach $B$ without going through $A$, plus $A$ itself

```python
def find_natural_loop(header, tail, cfg):
    """Find loop body given back edge tail → header"""
    loop = {header, tail}
    worklist = [tail]
    
    while worklist:
        node = worklist.pop()
        for pred in predecessors(node):
            if pred not in loop:
                loop.add(pred)
                worklist.append(pred)
    
    return loop
```

---

## Loop-Invariant Code Motion (LICM)

Move computations that produce the **same result every iteration** outside the loop.

### Detecting Loop-Invariant Statements

A statement `x = y op z` is loop-invariant if each operand:

1. Is a constant, OR
2. Has all reaching definitions outside the loop, OR
3. Has exactly one reaching definition inside the loop, and that definition is itself loop-invariant

### Algorithm

```python
def find_loop_invariant(loop_body):
    invariant = set()
    changed = True
    
    while changed:
        changed = False
        for stmt in loop_body:
            if stmt not in invariant:
                if all_operands_invariant(stmt, loop_body, invariant):
                    invariant.add(stmt)
                    changed = True
    
    return invariant
```

### Safety Conditions for Motion

A loop-invariant statement `s: x = y op z` can be moved to the **pre-header** if:

1. The block containing `s` dominates **all exits** of the loop
2. `x` is not assigned anywhere else in the loop
3. All uses of `x` in the loop are reached only by this definition

### Pre-Header

A **pre-header** is a new block inserted before the loop header:

```
Before:                After:
    [prev]                [prev]
      |                     |
      v                     v
    [header] ←back      [pre-header]  ← invariant code goes here
      |                     |
      v                     v
    [body]              [header] ←back
      |                     |
                            v
                          [body]
```

### Example

```c
// Before LICM
for (i = 0; i < n; i++) {
    t = x * y;           // Loop-invariant
    s = t + i;           // NOT invariant (uses i)
    a[i] = s;
}

// After LICM
t = x * y;              // Moved to pre-header
for (i = 0; i < n; i++) {
    s = t + i;
    a[i] = s;
}
```

---

## Induction Variables

An **induction variable** is a variable that increases or decreases by a fixed amount each iteration.

### Basic Induction Variable

A variable $i$ is a **basic induction variable** if its only definition in the loop is:

$$i = i \pm c \quad \text{(where } c \text{ is loop-invariant)}$$

### Derived Induction Variable

A variable $j$ is a **derived induction variable** if:

$$j = c_1 \times i + c_2$$

where $i$ is a basic induction variable and $c_1$, $c_2$ are loop-invariant.

### Example

```c
for (i = 0; i < n; i++) {
    j = 4 * i;           // j is derived: j = 4*i + 0
    k = j + 100;         // k is derived: k = 4*i + 100
    a[k] = 0;
}
```

### Induction Variable Elimination

Replace multiplications with additions:

```c
// Before: multiplication each iteration
for (i = 0; i < n; i++) {
    t = 4 * i;
    a[t] = 0;
}

// After: strength reduction + elimination
t = 0;
for (i = 0; i < n; i++) {
    a[t] = 0;
    t = t + 4;          // Replaced 4*i with t = t + 4
}

// Further: eliminate i if only used for loop test
t = 0;
limit = 4 * n;
while (t < limit) {     // Loop test uses t directly
    a[t] = 0;
    t = t + 4;
}
```

---

## Strength Reduction

Replace expensive operations with cheaper ones using the pattern of induction variables.

| Expensive | Cheap Replacement |
|-----------|-------------------|
| `x * constant` | repeated addition |
| `x / power_of_2` | right shift |
| `x % power_of_2` | bitwise AND |
| `x * power_of_2` | left shift |

### Strength Reduction Algorithm

For each derived induction variable $j = c_1 \times i + c_2$:

1. Create a new variable `j_new`
2. Initialize: `j_new = c1 * i_init + c2` (before loop)
3. At each increment of $i$ by $d$: add `j_new = j_new + c1 * d`
4. Replace uses of $j$ with `j_new`

```c
// Before
for (i = 0; i < 100; i++) {
    addr = base + i * 8;    // Multiplication each iteration
    *addr = 0;
}

// After strength reduction
addr = base;
for (i = 0; i < 100; i++) {
    *addr = 0;
    addr = addr + 8;        // Addition instead of multiplication
}
```

---

## Loop Unrolling

Reduce loop overhead by replicating the loop body multiple times.

### Basic Unrolling

```c
// Before: loop overhead every iteration
for (i = 0; i < 100; i++) {
    a[i] = b[i] + c[i];
}

// After: unrolled by factor 4
for (i = 0; i < 100; i += 4) {
    a[i]   = b[i]   + c[i];
    a[i+1] = b[i+1] + c[i+1];
    a[i+2] = b[i+2] + c[i+2];
    a[i+3] = b[i+3] + c[i+3];
}
```

### Benefits

- Reduces branch overhead (fewer comparisons and jumps)
- Increases **instruction-level parallelism** (ILP)
- Enables more register reuse
- Exposes opportunities for other optimizations (CSE, scheduling)

### Handling Non-Divisible Trip Counts

```c
// Unroll by 4, but n might not be divisible by 4
int remainder = n % 4;
for (i = 0; i < remainder; i++) {
    a[i] = b[i] + c[i];          // Handle remainder
}
for (; i < n; i += 4) {
    a[i]   = b[i]   + c[i];      // Unrolled body
    a[i+1] = b[i+1] + c[i+1];
    a[i+2] = b[i+2] + c[i+2];
    a[i+3] = b[i+3] + c[i+3];
}
```

### Trade-offs

- **Pro**: Less overhead, more ILP
- **Con**: Larger code size (instruction cache pressure)
- Typical unroll factor: 2-8 (compiler heuristic)

---

## Loop Fusion and Fission

### Loop Fusion (Jamming)

Combine adjacent loops with the same bounds:

```c
// Before: two loops, two iterations over the range
for (i = 0; i < n; i++)
    a[i] = b[i] + 1;
for (i = 0; i < n; i++)
    c[i] = a[i] * 2;

// After fusion: one loop, better cache locality
for (i = 0; i < n; i++) {
    a[i] = b[i] + 1;
    c[i] = a[i] * 2;    // a[i] still in register/cache!
}
```

**Benefits**: Better data locality, reduced loop overhead.

### Loop Fission (Distribution)

Split one loop into multiple loops:

```c
// Before: large loop body with mixed access patterns
for (i = 0; i < n; i++) {
    a[i] = b[i] + 1;       // Accesses a, b
    c[i] = d[i] * e[i];    // Accesses c, d, e (different arrays)
}

// After fission: each loop has focused access pattern
for (i = 0; i < n; i++)
    a[i] = b[i] + 1;
for (i = 0; i < n; i++)
    c[i] = d[i] * e[i];
```

**Benefits**: Enables vectorization, reduces register pressure in each loop.

---

## Loop Tiling (Blocking)

Restructure loops to improve **cache performance** for nested loops over large arrays.

### The Problem

```c
// Naive matrix multiply: poor cache behavior
for (i = 0; i < N; i++)
    for (j = 0; j < N; j++)
        for (k = 0; k < N; k++)
            C[i][j] += A[i][k] * B[k][j];
// B[k][j] — column access = cache miss every time!
```

### Tiled Version

```c
// Tiled: process in blocks that fit in cache
#define TILE 32

for (ii = 0; ii < N; ii += TILE)
  for (jj = 0; jj < N; jj += TILE)
    for (kk = 0; kk < N; kk += TILE)
      for (i = ii; i < min(ii+TILE, N); i++)
        for (j = jj; j < min(jj+TILE, N); j++)
          for (k = kk; k < min(kk+TILE, N); k++)
            C[i][j] += A[i][k] * B[k][j];
```

The tile size is chosen so that the working set fits in L1 or L2 cache.

---

## Optimization Pipeline for Loops

```
1. Find dominators
2. Identify back edges and natural loops
3. Insert pre-headers
4. Loop-invariant code motion
5. Induction variable detection
6. Strength reduction
7. Induction variable elimination
8. Loop unrolling (if profitable)
9. Loop fusion/fission (if applicable)
```

---

## Exercises

**Exercise 1:** Identify all induction variables and their families:

```c
for (i = 0; i < n; i++) {
    j = i * 3;
    k = j + 7;
    m = i * i;    // Is this an induction variable?
    a[k] = m;
}
```

**Exercise 2:** Apply strength reduction to eliminate the multiplication:

```c
for (i = 0; i < 100; i++) {
    index = i * 12 + base;
    arr[index] = 0;
}
```

**Exercise 3:** Given this CFG, find dominators and identify the natural loop:

```
Entry → B1 → B2 → B3 → B4
                    ↑       |
                    +-------+  (back edge B4 → B2)
B1 → B5 (exit)
```

**Exercise 4:** Can the following loop-invariant statement be safely moved? Why or why not?

```c
while (i < n) {
    if (i > 0)
        x = y / z;    // Loop-invariant, but...
    a[i] = x;
    i++;
}
```

**Exercise 5:** Unroll the following loop by a factor of 2. Handle the case where `n` is odd:

```c
for (i = 0; i < n; i++) {
    sum += a[i];
}
```

**Exercise 6:** Would loop fusion be legal here? Explain:

```c
for (i = 0; i < n; i++)
    a[i] = b[i] + 1;
for (i = 0; i < n; i++)
    b[i] = a[i+1] * 2;   // Note: a[i+1], not a[i]
```

---

## Summary

- **Loops** are the highest-impact optimization targets
- **Dominators** and **back edges** identify natural loops
- **LICM** moves invariant computations to a pre-header
- **Induction variables** enable strength reduction (multiply → add)
- **Loop unrolling** reduces overhead and increases ILP
- **Fusion/fission** trade between locality and parallelism
- **Loop tiling** improves cache performance for nested loops

---

## Next Lesson

Next, we'll study the **Data-Flow Analysis Framework** — the general theory that unifies all the analyses we've been using (available expressions, live variables, reaching definitions, and more).
