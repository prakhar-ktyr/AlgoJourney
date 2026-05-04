---
title: Common Subexpression Elimination
---

# Common Subexpression Elimination

Common Subexpression Elimination (CSE) removes redundant computations by recognizing when an expression has already been computed and its value is still valid.

Global CSE relies on **Available Expressions Analysis** — a classic data-flow problem.

---

## What is an Available Expression?

An expression $e$ is **available** at a program point $p$ if:

1. On **every** path from the entry to $p$, expression $e$ is computed
2. After the last computation of $e$ on each path, **none of its operands** are redefined

### Simple Example

```c
// Point A
t1 = a + b;      // a+b is generated here

// Point B (reached only from A, no redefinition of a or b)
t2 = a + b;      // a+b is AVAILABLE here — redundant!
// Can be replaced with: t2 = t1;
```

### When is an Expression NOT Available?

```c
// Path 1: computes a+b
t1 = a + b;

// Path 2: does NOT compute a+b
// (some other code)

// Merge point
t2 = a + b;    // NOT available! (not computed on Path 2)
```

---

## Available Expressions as a Data-Flow Problem

| Property | Value |
|----------|-------|
| Direction | **Forward** (information flows entry → exit) |
| Domain | Set of all expressions in the program |
| Meet operator | **Intersection** ($\cap$) |
| Transfer function | $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$ |
| Initial value | $\text{out}[\text{Entry}] = \emptyset$; all others = $U$ (universal set) |

### Why Intersection?

An expression is available at a point only if it's available on **ALL** paths reaching that point. Intersection captures this "must" requirement.

---

## Gen and Kill Sets

For each basic block $B$:

### Gen[B]

The set of expressions **generated** (computed) in $B$ whose operands are not subsequently redefined in $B$.

```c
// Block B
a = x + y;    // generates x+y
b = x + y;    // still generates x+y (operands unchanged)
x = 5;        // NOW x+y is killed!
c = x + y;    // generates a NEW x+y (different value of x)
```

$\text{gen}[B] = \{x+y\}$ (the last computation with final operand values)

### Kill[B]

The set of all expressions containing a variable that is **defined** (assigned) in $B$.

```c
// Block B
x = ...;      // Kills ALL expressions containing x
              // e.g., kills: x+y, x*z, a+x, x-1, ...
```

### Computing Gen and Kill

Walk through the block **statement by statement**:

```python
def compute_gen_kill(block, all_expressions):
    gen = set()
    kill = set()
    
    for stmt in block.statements:
        if stmt is assignment "x = y op z":
            # Kill all expressions containing x
            killed = {e for e in all_expressions if x in e.operands}
            gen = gen - killed    # Remove killed from gen
            kill = kill | killed  # Add to kill set
            
            # Generate y op z (if y and z not redefined later)
            gen.add(Expression(y, op, z))
    
    return gen, kill
```

---

## The Iterative Algorithm

```python
def available_expressions(cfg):
    # Step 1: Compute gen and kill for each block
    for B in cfg.blocks:
        compute_gen_kill(B)
    
    # Step 2: Initialize
    out[entry] = set()  # Nothing available at entry
    for B in cfg.blocks - {entry}:
        out[B] = U  # Universal set (all expressions)
    
    # Step 3: Iterate until convergence
    changed = True
    while changed:
        changed = False
        for B in cfg.blocks - {entry}:
            # Meet: intersection of predecessors' out sets
            in_B = intersection(out[P] for P in predecessors(B))
            
            # Transfer function
            new_out = gen[B] | (in_B - kill[B])
            
            if new_out != out[B]:
                out[B] = new_out
                changed = True
    
    return in_sets, out_sets
```

### Why Does It Converge?

- The domain is a **finite set** of expressions
- The transfer function is **monotone** (if input shrinks, output shrinks)
- We initialize with $U$ (maximum) and can only shrink (intersection)
- A finite, monotonically decreasing sequence must reach a fixed point

---

## Complete Example

Consider this CFG:

```
        [Entry]
           |
           v
    [B1: t1 = a+b
         t2 = c+d]
        /       \
       v         v
[B2: t3 = a+b   [B3: c = 5
     t4 = e+f]       t5 = a+b]
       \         /
        v       v
    [B4: t6 = a+b
         t7 = c+d]
```

### Step 1: Identify All Expressions

$U = \{a+b,\ c+d,\ e+f\}$

### Step 2: Compute Gen and Kill

| Block | Gen | Kill |
|-------|-----|------|
| B1 | $\{a+b, c+d\}$ | $\emptyset$ |
| B2 | $\{a+b, e+f\}$ | $\emptyset$ |
| B3 | $\{a+b\}$ | $\{c+d\}$ (c is redefined) |
| B4 | $\{a+b, c+d\}$ | $\emptyset$ |

### Step 3: Iterate

**Initialization:**

$$\text{out}[\text{Entry}] = \emptyset$$
$$\text{out}[B1] = \text{out}[B2] = \text{out}[B3] = \text{out}[B4] = U$$

**Iteration 1:**

For B1:
$$\text{in}[B1] = \text{out}[\text{Entry}] = \emptyset$$
$$\text{out}[B1] = \{a+b, c+d\} \cup (\emptyset - \emptyset) = \{a+b, c+d\}$$

For B2:
$$\text{in}[B2] = \text{out}[B1] = \{a+b, c+d\}$$
$$\text{out}[B2] = \{a+b, e+f\} \cup (\{a+b, c+d\} - \emptyset) = \{a+b, c+d, e+f\}$$

For B3:
$$\text{in}[B3] = \text{out}[B1] = \{a+b, c+d\}$$
$$\text{out}[B3] = \{a+b\} \cup (\{a+b, c+d\} - \{c+d\}) = \{a+b\}$$

For B4:
$$\text{in}[B4] = \text{out}[B2] \cap \text{out}[B3] = \{a+b, c+d, e+f\} \cap \{a+b\} = \{a+b\}$$
$$\text{out}[B4] = \{a+b, c+d\} \cup (\{a+b\} - \emptyset) = \{a+b, c+d\}$$

**Iteration 2:** No changes → converged!

### Step 4: Apply CSE

At entry of B4, $a+b$ is available. So `t6 = a+b` is redundant!

But `c+d` is NOT available at B4's entry (only $\{a+b\}$), so `t7 = c+d` cannot be eliminated.

Similarly in B2: `t3 = a+b` is redundant (available from B1).

---

## Performing the Elimination

Once we know which expressions are available, we eliminate redundant computations:

```c
// Before CSE
// B1:
t1 = a + b;
t2 = c + d;

// B2 (reached from B1):
t3 = a + b;    // Available! Replace.
t4 = e + f;

// After CSE
// B1:
t1 = a + b;
t2 = c + d;

// B2:
t3 = t1;       // Reuse t1's value
t4 = e + f;
```

### When to Introduce Temporaries

Sometimes the original result is stored in different variables on different paths:

```c
// B1 (path 1): x = a + b;
// B2 (path 2): y = a + b;
// B3 (merge):  z = a + b;  // Available on both paths
```

Solution: introduce a temporary `tmp`:

```c
// B1: tmp = a + b; x = tmp;
// B2: tmp = a + b; y = tmp;
// B3: z = tmp;
```

---

## Handling Tricky Cases

### Array References

```c
a[i] = 5;
x = a[j];    // Is a[j] available? Only if we know i ≠ j
```

Conservative approach: any array write kills ALL expressions involving that array.

### Function Calls

```c
x = foo();
y = a + b;   // Is a+b still valid? foo() might modify a or b
```

Conservative approach: function calls kill all expressions involving global variables or pointer-accessible memory.

### Pointer Assignments

```c
*p = 10;
x = a + b;   // *p might alias a or b!
```

Without alias analysis, `*p = 10` kills almost everything.

---

## Complexity

For a program with $n$ blocks and $e$ expressions:

- **Space:** $O(n \times e)$ for bit vectors
- **Time:** $O(n \times e)$ per iteration, typically 2-3 iterations for convergence
- In practice: very fast using bit-vector representations

### Bit-Vector Implementation

Each set of expressions is stored as a bit vector of length $|U|$:

```python
# U = {a+b, c+d, e+f}  →  bits: [0, 1, 2]
# gen[B1] = {a+b, c+d}  →  110
# kill[B3] = {c+d}      →  010

# Intersection: bitwise AND
# Union: bitwise OR
# Difference: bitwise AND NOT
```

This makes the operations extremely fast — a few machine instructions per block.

---

## CSE in Practice

Modern compilers apply CSE at multiple levels:

1. **Local CSE** — within a basic block (simple, using value numbering)
2. **Global CSE** — across blocks within a function (available expressions)
3. **Interprocedural CSE** — across function boundaries (expensive, rare)

### Interaction with Other Optimizations

CSE works best when combined with:

- **Copy propagation** — cleans up introduced temporaries
- **Dead code elimination** — removes original computations that are now unused
- **Constant folding** — may create new common subexpressions

---

## Exercises

**Exercise 1:** Compute gen and kill sets for each block:

```
B1: a = b + c
    d = a - b

B2: e = b + c
    b = e + 1

B3: f = a - b
    g = b + c
```

**Exercise 2:** Given this CFG, compute available expressions at each point:

```
Entry → B1 → B2 → B4
Entry → B1 → B3 → B4

B1: x = a * b;  y = a + c;
B2: z = a * b;
B3: a = 10;     w = a * b;
B4: p = a * b;  q = a + c;
```

Which computations in B4 can be eliminated?

**Exercise 3:** Why do we initialize non-entry blocks with $U$ (all expressions) rather than $\emptyset$? What would happen if we used $\emptyset$?

**Exercise 4:** Implement the available expressions algorithm in Python for this CFG:

```python
# Blocks: B1, B2, B3, B4
# Edges: B1→B2, B1→B3, B2→B4, B3→B4
# Expressions: {e1: a+b, e2: c*d, e3: a-c}
# gen = {B1: {e1,e2}, B2: {e3}, B3: {e1}, B4: {e2}}
# kill = {B1: {}, B2: {e1}, B3: {e2}, B4: {e3}}
```

Show each iteration until convergence.

**Exercise 5:** Consider this code. After CSE, how many fewer arithmetic operations are executed?

```c
if (flag) {
    x = a + b;
    y = (a + b) * c;
} else {
    z = a + b;
}
w = a + b;
```

---

## Summary

- An expression is **available** if computed on all paths and operands unchanged
- Available expressions is a **forward, intersection** data-flow problem
- $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$
- The iterative algorithm converges quickly using bit vectors
- CSE replaces redundant computations with previously computed values
- Conservative assumptions handle arrays, pointers, and function calls

---

## Next Lesson

Next, we explore **Loop Optimization** — where programs spend most of their execution time and where optimizations have the greatest impact.
