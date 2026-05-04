---
title: Global Optimization
---

# Global Optimization

In the previous lessons, we optimized code **within** a single basic block. Now we go further — optimizing **across** basic blocks within an entire function.

Global optimization sees the big picture and finds improvements that local analysis misses.

---

## Why Global Optimization?

Local optimization only looks at one basic block at a time. But many redundancies span multiple blocks:

```c
// Block B1
x = a + b;
if (x > 10) goto B3;

// Block B2
y = a + b;  // Same expression computed again!

// Block B3
z = a + b;  // And again!
```

A local optimizer treats each block independently and misses these cross-block redundancies.

---

## Control Flow Graph (CFG)

The **Control Flow Graph** is the foundation of all global optimization.

### What is a CFG?

A CFG is a directed graph where:

- Each **node** is a basic block
- Each **edge** represents a possible flow of control between blocks

```
Entry
  |
  v
 [B1]
 / \
v   v
[B2] [B3]
 \   /
  v v
 [B4]
  |
  v
Exit
```

### Building a CFG

1. Divide the function into basic blocks (leaders method)
2. Add an edge from block $B_i$ to $B_j$ if:
   - The last instruction of $B_i$ is a jump to the first instruction of $B_j$
   - $B_j$ immediately follows $B_i$ and $B_i$ doesn't end with an unconditional jump

---

## Global Common Subexpression Elimination

An expression `a + b` is a **common subexpression** at point $p$ if:

- It has been computed on **every** path reaching $p$
- Neither `a` nor `b` has been redefined since the last computation

### Example

```c
// Block B1
t1 = a + b;
if (condition) goto B3;

// Block B2
t2 = a + b;   // a+b available from B1
              // Replace with: t2 = t1;

// Block B3 (reached from B1)
t3 = a + b;   // a+b available from B1
              // Replace with: t3 = t1;
```

### Algorithm Sketch

1. Compute **available expressions** at each program point (data-flow analysis)
2. For each expression $e$ computed at point $p$:
   - If $e$ is available at $p$, replace it with the previously computed value
   - Introduce a temporary variable if needed

---

## Global Copy Propagation

After assignments like `x = y`, replace later uses of `x` with `y` (if `y` hasn't changed).

### How It Works

```c
// Block B1
x = y;

// Block B2 (only reached from B1, y not redefined)
z = x + 1;    // Replace x with y
// Becomes:
z = y + 1;
```

### Requirements

The copy `x = y` must **reach** the use of `x`, and:

- No other definition of `x` reaches that point
- `y` is not redefined on any path from the copy to the use

### Benefits

- Enables further dead code elimination (the copy `x = y` may become dead)
- Reduces register pressure

---

## Global Dead Code Elimination

A variable is **dead** at a point if its value is never used on any path from that point.

### Algorithm

1. Compute **live variables** at each point (backward data-flow analysis)
2. If a definition `x = ...` exists where `x` is not live after the definition:
   - The definition is dead — remove it
   - Exception: keep if it has side effects (function calls, I/O)

### Example

```c
// Block B1
x = a * b;      // x is dead if never used later
y = x + 1;
goto B3;

// Block B2
x = c * d;      // Redefines x — kills B1's definition

// Block B3
print(y);       // Only y is used, not x from B1
```

If `x` from B1 is never used (because B2 always redefines it before use), then `x = a * b` is dead.

---

## Code Motion: Loop-Invariant Code

**Code motion** moves computations out of loops when they produce the same result every iteration.

### Identifying Loop-Invariant Code

A statement `s: x = y op z` inside a loop is **loop-invariant** if for each operand:

- It's a constant, OR
- All definitions that reach `s` are outside the loop, OR
- There's exactly one reaching definition inside the loop that is itself loop-invariant

### Moving Code Out

```c
// Before optimization
for (i = 0; i < n; i++) {
    t = x * x;       // Loop-invariant!
    a[i] = t + i;
}

// After code motion
t = x * x;           // Moved outside the loop
for (i = 0; i < n; i++) {
    a[i] = t + i;
}
```

### Safety Conditions

You can move a statement `s: x = ...` out of a loop only if:

1. The block containing `s` **dominates** all loop exits where `x` is live
2. `x` is not defined elsewhere in the loop
3. `s` dominates all uses of `x` in the loop

---

## Partial Redundancy Elimination (PRE)

PRE is a powerful optimization that subsumes both:

- Common subexpression elimination
- Loop-invariant code motion

### The Idea

An expression is **partially redundant** at a point if it's redundant on **some** (but not all) paths reaching that point.

```
    [B1: t = a+b]     [B2: (no a+b)]
         \                /
          v              v
         [B3: x = a+b]
```

Here `a+b` is redundant on the path through B1, but not through B2.

### How PRE Works

1. Insert a computation of `a+b` at the end of B2
2. Now `a+b` is redundant on ALL paths reaching B3
3. Replace `a+b` in B3 with the precomputed value

```
    [B1: t = a+b]     [B2: t = a+b]  ← inserted
         \                /
          v              v
         [B3: x = t]              ← replaced
```

### Key Principle

PRE inserts computations on paths where the expression isn't available, making it **fully redundant** at the original point.

The challenge is finding the **optimal** placement — insert as late as possible (to avoid unnecessary computation on paths that don't reach the use).

---

## Putting It All Together

A typical global optimization pipeline:

```
1. Build CFG
2. Compute dominators
3. Identify loops (natural loops via back edges)
4. Loop-invariant code motion
5. Global common subexpression elimination
6. Global copy propagation
7. Global dead code elimination
8. Repeat until no changes
```

### Complete Example

```c
// Original function
void process(int a, int b, int n) {
    int i, x, y, z;
    x = a + b;
    for (i = 0; i < n; i++) {
        y = a + b;        // CSE: same as x
        z = x * x;       // Loop-invariant
        arr[i] = y + z + i;
    }
}

// After global optimization
void process(int a, int b, int n) {
    int i, x, z;
    x = a + b;
    z = x * x;           // Moved out of loop
    for (i = 0; i < n; i++) {
        arr[i] = x + z + i;  // y replaced by x (CSE + copy prop)
    }
}
```

---

## Comparison: Local vs Global Optimization

| Feature | Local | Global |
|---------|-------|--------|
| Scope | Single basic block | Entire function (all blocks) |
| Needs CFG? | No | Yes |
| Data-flow analysis? | No | Yes |
| Finds cross-block redundancies? | No | Yes |
| Complexity | Simple | More complex |
| Effectiveness | Limited | Much better |

---

## Exercises

**Exercise 1:** Given the following code, identify all global common subexpressions:

```c
B1: a = x + y;
    if (a > 0) goto B3;

B2: b = x + y;
    c = a + b;
    goto B4;

B3: d = x + y;
    e = d * 2;

B4: f = x + y;
```

**Exercise 2:** In the following loop, identify loop-invariant statements and show the code after motion:

```c
for (i = 0; i < 100; i++) {
    t = a + b;
    u = t * c;
    v = i + u;
    arr[i] = v;
}
```

**Exercise 3:** Draw the CFG for this code and identify dead code:

```c
x = 5;
y = x + 1;
if (y > 3) {
    z = x * 2;
    x = z + 1;
} else {
    w = y + 2;
}
result = y + 10;
```

**Exercise 4:** Apply partial redundancy elimination to:

```
B1: a = p + q;   → B2, B3
B2: (nothing)    → B4
B3: (nothing)    → B4
B4: b = p + q;
```

Show where to insert computations.

**Exercise 5:** Explain why code motion requires dominance conditions. Give an example where moving code without checking dominance produces incorrect results.

---

## Summary

- Global optimization works across basic blocks using the **CFG**
- **Available expressions** enable global CSE
- **Copy propagation** replaces variables with their copied values
- **Dead code elimination** removes unused computations
- **Code motion** moves loop-invariant code outside loops
- **PRE** unifies CSE and code motion into one powerful framework
- These optimizations interact — run them iteratively until convergence

---

## Next Lesson

Next, we'll dive deep into **Common Subexpression Elimination** — the data-flow analysis that finds available expressions across the CFG.
