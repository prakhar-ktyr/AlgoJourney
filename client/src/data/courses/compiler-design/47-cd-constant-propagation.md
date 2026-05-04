---
title: Constant Propagation and Folding
---

# Constant Propagation and Folding

In this lesson, you will learn about two powerful compile-time optimizations: **constant folding** (evaluating expressions whose operands are all constants) and **constant propagation** (substituting known constant values for variables).

---

## Constant Folding

**Constant folding** evaluates expressions at compile time when all operands are known constants.

### Before Constant Folding

```c
int x = 3 + 4;          // computed at runtime?
int y = 2 * 8;           // computed at runtime?
int z = 100 / 5 + 2;    // computed at runtime?
```

### After Constant Folding

```c
int x = 7;              // folded at compile time!
int y = 16;             // folded at compile time!
int z = 22;             // folded at compile time!
```

The compiler does the arithmetic so the program doesn't have to.

### What Can Be Folded?

| Operation | Example | Result |
|-----------|---------|--------|
| Arithmetic | `3 + 4` | `7` |
| Comparison | `5 > 3` | `true` |
| Logical | `true && false` | `false` |
| String | `"hello" + " world"` | `"hello world"` |
| Type conversion | `(float)5` | `5.0` |

### Algebraic Simplifications (Related)

```c
x * 1  →  x        // identity
x + 0  →  x        // identity
x * 0  →  0        // zero property
x / x  →  1        // (if x ≠ 0)
x - x  →  0
```

---

## Constant Propagation

**Constant propagation** replaces variable uses with their constant values when the variable is known to hold a constant.

### Before

```c
int a = 5;
int b = a + 3;      // we know a = 5
int c = b * a;      // we know a = 5, b = 8
print(c);
```

### After Propagation + Folding

```c
int a = 5;
int b = 8;          // 5 + 3 = 8
int c = 40;         // 8 * 5 = 40
print(40);
```

Constant propagation and folding work together iteratively.

---

## The Lattice for Constant Propagation

Constant propagation uses a **lattice** to track what we know about each variable:

```
        ⊤ (Top = Unknown/Uninitialized)
       / | \
      1  2  3 ... (Constant values)
       \ | /
        ⊥ (Bottom = Not a Constant)
```

| Value | Meaning |
|-------|---------|
| $\top$ (Top) | Variable has not been analyzed yet (optimistic) |
| $c$ (Constant) | Variable is known to equal constant $c$ |
| $\bot$ (Bottom) | Variable is NOT a constant (multiple possible values) |

### Meet Operation (Confluence)

When control flow merges, we combine information:

$$a \wedge b = \begin{cases} a & \text{if } b = \top \\ b & \text{if } a = \top \\ a & \text{if } a = b \text{ (same constant)} \\ \bot & \text{otherwise} \end{cases}$$

### Examples

| $a$ | $b$ | $a \wedge b$ | Reason |
|-----|-----|--------------|--------|
| $\top$ | 5 | 5 | Unknown meets constant → constant |
| 5 | 5 | 5 | Same constant → that constant |
| 5 | 7 | $\bot$ | Different constants → not constant |
| $\bot$ | anything | $\bot$ | Once not-constant, stays not-constant |

---

## Algorithm: Worklist-Based Constant Propagation

```python
def constant_propagation(cfg):
    # Initialize: all variables are Top (unknown)
    val = {v: TOP for v in all_variables}

    # For entry block parameters/inputs: set to Bottom
    for v in cfg.entry.params:
        val[v] = BOTTOM

    worklist = list(cfg.blocks)

    while worklist:
        block = worklist.pop(0)
        for stmt in block.statements:
            if stmt.is_assignment():  # x = expr
                new_val = evaluate(stmt.expr, val)
                if new_val != val[stmt.target]:
                    val[stmt.target] = new_val
                    # Add successor blocks that use this variable
                    for succ in users_of(stmt.target):
                        if succ not in worklist:
                            worklist.append(succ)

    return val


def evaluate(expr, val):
    """Evaluate expression given current variable values."""
    if expr.is_constant():
        return expr.value
    elif expr.is_variable():
        return val[expr.name]
    elif expr.is_binary_op():
        left = evaluate(expr.left, val)
        right = evaluate(expr.right, val)
        if left == BOTTOM or right == BOTTOM:
            return BOTTOM
        elif left == TOP or right == TOP:
            return TOP
        else:
            # Both are constants — fold!
            return compute(expr.op, left, right)
```

---

## Handling Control Flow

At merge points (where multiple paths converge), we must be conservative:

```c
if (condition) {
    x = 5;      // x = 5 on this path
} else {
    x = 7;      // x = 7 on this path
}
// Here: x = 5 meet 7 = ⊥ (not constant)
print(x);
```

But if both paths assign the same value:

```c
if (condition) {
    x = 5;      // x = 5 on this path
} else {
    x = 5;      // x = 5 on this path too!
}
// Here: x = 5 meet 5 = 5 (still constant!)
print(x);       // Can replace with print(5)
```

---

## Sparse Conditional Constant Propagation (SCCP)

Standard constant propagation has a weakness: it assumes **all paths** are executable. SCCP improves this by also tracking which edges in the CFG are actually reachable.

### The Key Insight

```c
x = 5;
if (x > 10) {      // This is always false! (5 > 10 = false)
    y = x + 1;     // This path is UNREACHABLE
} else {
    y = x * 2;     // Only this path is taken
}
// Standard: y = 6 meet 10 = ⊥
// SCCP:     y = 10 (because the true branch is unreachable)
```

### SCCP Algorithm Overview

SCCP maintains two worklists:

1. **CFG worklist**: edges that become executable
2. **SSA worklist**: SSA edges where values change

```python
def sccp(cfg_ssa):
    val = {v: TOP for v in all_variables}
    executable = set()  # executable CFG edges
    cfg_worklist = [(cfg_ssa.entry_edge)]
    ssa_worklist = []

    while cfg_worklist or ssa_worklist:
        # Process executable edges
        while cfg_worklist:
            edge = cfg_worklist.pop()
            if edge not in executable:
                executable.add(edge)
                block = edge.target
                # Evaluate phi functions
                for phi in block.phi_functions:
                    update_phi(phi, val, executable, ssa_worklist)
                # If first time block is reached
                if block.first_visit():
                    for stmt in block.statements:
                        evaluate_stmt(stmt, val, ssa_worklist)
                    propagate_edges(block, val, cfg_worklist)

        # Process value changes
        while ssa_worklist:
            (var, new_val) = ssa_worklist.pop()
            if new_val != val[var]:
                val[var] = meet(val[var], new_val)
                # Re-evaluate uses of var in reachable blocks
                for use in uses_of(var):
                    if is_reachable(use.block, executable):
                        evaluate_stmt(use.stmt, val, ssa_worklist)
                        propagate_edges(use.block, val, cfg_worklist)

    return val
```

---

## Example Walkthrough

Consider this program:

```c
a = 10;
b = 20;
c = a + b;        // c = 30
d = c > 25;       // d = true
if (d) {
    e = c * 2;    // e = 60
} else {
    e = c * 3;    // unreachable (SCCP knows this)
}
f = e + a;        // f = 70
```

### Step-by-Step Analysis

| Variable | After Statement | Value |
|----------|----------------|-------|
| a | `a = 10` | 10 |
| b | `b = 20` | 20 |
| c | `c = a + b` | 30 (10 + 20) |
| d | `d = c > 25` | true (30 > 25) |
| e (true branch) | `e = c * 2` | 60 |
| e (false branch) | unreachable | — |
| e (after merge) | — | 60 (only one reachable definition) |
| f | `f = e + a` | 70 (60 + 10) |

### Optimized Code

```c
a = 10;
b = 20;
c = 30;
d = true;
e = 60;
f = 70;
```

Many of these assignments can then be eliminated by dead code elimination if the variables are only used in the shown expressions.

---

## Constant Propagation on SSA Form

On SSA form, constant propagation becomes simpler because each variable has exactly one definition:

```c
// Original:
x = 5;
x = x + 1;
y = x * 2;

// SSA form:
x1 = 5;
x2 = x1 + 1;    // x2 = 6
y1 = x2 * 2;    // y1 = 12
```

At $\phi$-functions, we apply the meet:

```c
// SSA with phi:
x3 = φ(x1, x2)
// If x1 = 5 and x2 = 5: x3 = 5
// If x1 = 5 and x2 = 7: x3 = ⊥
```

---

## Interprocedural Constant Propagation

We can propagate constants **across function calls**:

```c
int square(int n) {
    return n * n;
}

int main() {
    int x = square(5);    // n = 5 → return 25
    print(x);             // x = 25
}
```

After interprocedural constant propagation:

```c
int main() {
    int x = 25;
    print(25);
}
```

---

## Limitations

1. **Arrays and pointers**: `a[i] = 5` — hard to know which element
2. **Function calls**: side effects may change values
3. **Loops**: values may change each iteration

```c
int x = 0;
while (x < 10) {
    x = x + 1;    // x is NOT constant (changes each iteration)
}
```

For loops, standard analysis quickly reaches $\bot$ for loop variables.

---

## Implementation Tips

### Folding Rules

```python
def fold(op, left, right):
    """Evaluate binary operation on constants."""
    if op == '+': return left + right
    if op == '-': return left - right
    if op == '*': return left * right
    if op == '/' and right != 0: return left // right
    if op == '%' and right != 0: return left % right
    if op == '<': return left < right
    if op == '>': return left > right
    if op == '==': return left == right
    return BOTTOM  # Cannot fold
```

### Conditional Branch Folding

If a branch condition is constant, we can eliminate the branch:

```c
// Before:
if (true) { ... } else { ... }

// After:
{ ... }   // Only the true branch remains
```

---

## Exercises

**Exercise 1:** Apply constant propagation and folding to this code:

```c
a = 3;
b = 4;
c = a + b;
d = c * 2;
e = d - a;
print(e);
```

What is the final value printed?

**Exercise 2:** At the merge point, what is the lattice value of `x`?

```c
if (p) {
    x = 10;
} else {
    x = 10;
}
// x = ?
```

What if the else branch assigned `x = 20`?

**Exercise 3:** Apply SCCP to this code. Which branches are unreachable?

```c
a = 5;
b = 10;
c = a + b;     // c = ?
if (c < 10) {
    d = 1;
} else {
    d = 2;
    if (c > 20) {
        e = 3;
    } else {
        e = 4;
    }
}
```

**Exercise 4:** Explain why the lattice must have a Bottom element. What would happen if we only had Top and constant values?

**Exercise 5:** Write the constant propagation transfer function for the statement `x = y + z` given:
- Case 1: val[y] = 5, val[z] = 3
- Case 2: val[y] = 5, val[z] = ⊤
- Case 3: val[y] = 5, val[z] = ⊥

---

## Summary

- **Constant folding** evaluates known expressions at compile time
- **Constant propagation** substitutes constant values for variables
- The analysis uses a lattice: $\top$ → constant → $\bot$
- **SCCP** combines constant propagation with unreachable code detection
- These optimizations are especially effective on SSA form

---

## Next Steps

In the next lesson, you will learn about **SSA-Based Optimizations** — how the SSA form enables powerful and efficient compiler transformations.
