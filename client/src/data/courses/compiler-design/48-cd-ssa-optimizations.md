---
title: SSA-Based Optimizations
---

# SSA-Based Optimizations

In this lesson, you will learn how **Static Single Assignment (SSA) form** makes compiler optimizations simpler, more efficient, and more powerful.

---

## Why SSA Makes Optimization Easier

Recall that in SSA form, every variable is assigned **exactly once**. This fundamental property simplifies many analyses:

| Problem | Without SSA | With SSA |
|---------|-------------|----------|
| Finding a variable's definition | Search backward through code | Immediate (follow the one definition) |
| Checking if two uses see the same value | Complex reaching definitions | Same SSA name = same value |
| Detecting dead definitions | Need full liveness analysis | Unused SSA name = dead |

### Example

```c
// Original code:
x = 5;
x = x + 1;
y = x * 2;
x = y + 3;
z = x;

// SSA form:
x1 = 5;
x2 = x1 + 1;
y1 = x2 * 2;
x3 = y1 + 3;
z1 = x3;
```

In SSA: every use of a variable points to **exactly one** definition. This is the def-use chain, built for free.

---

## Dead Code Elimination on SSA

On SSA form, dead code elimination is trivial:

**Rule**: If an SSA variable has **no uses**, its definition is dead (unless it has side effects).

```python
def dead_code_elimination_ssa(program):
    """Remove unused definitions in SSA form."""
    changed = True
    while changed:
        changed = False
        for stmt in program.statements:
            if stmt.is_assignment():
                defined_var = stmt.target
                if not has_uses(defined_var) and not has_side_effects(stmt):
                    program.remove(stmt)
                    changed = True
    return program
```

### Example

```c
// SSA form:
x1 = 5;            // used by x2
x2 = x1 + 1;       // used by y1
y1 = x2 * 2;       // NOT used anywhere → DEAD!
x3 = 10;           // used by z1
z1 = x3;           // used by print
print(z1);
```

After elimination:

```c
x3 = 10;
z1 = x3;
print(z1);
```

We can iterate: now `x1` and `x2` are also dead:

```c
x3 = 10;
z1 = x3;
print(z1);
```

### Why SSA Helps

Without SSA, we need liveness analysis to know if a definition is dead. With SSA, we just count uses of each SSA name — a simple reference count.

---

## Sparse Conditional Constant Propagation (SCCP) on SSA

SCCP (introduced in the previous lesson) is most naturally implemented on SSA form because:

1. Each variable has one definition → one lattice value per variable
2. Use-def chains are explicit → changes propagate directly to uses
3. $\phi$-functions make merge points explicit

### SSA-SCCP Algorithm

```python
def sccp_ssa(program):
    val = {v: TOP for v in program.ssa_variables}
    executable_edges = set()
    ssa_worklist = []     # (variable, new_value) pairs
    cfg_worklist = [program.entry_edge]

    while cfg_worklist or ssa_worklist:
        # Process newly executable edges
        while cfg_worklist:
            edge = cfg_worklist.pop()
            if edge in executable_edges:
                continue
            executable_edges.add(edge)
            block = edge.target

            for phi in block.phi_nodes:
                new_val = evaluate_phi(phi, val, executable_edges)
                if new_val != val[phi.target]:
                    val[phi.target] = new_val
                    ssa_worklist.append(phi.target)

            for stmt in block.statements:
                new_val = evaluate_stmt(stmt, val)
                if new_val != val[stmt.target]:
                    val[stmt.target] = new_val
                    ssa_worklist.append(stmt.target)

            add_executable_successors(block, val, cfg_worklist)

        # Process value changes
        while ssa_worklist:
            var = ssa_worklist.pop()
            for use_stmt in uses_of(var):
                if is_reachable(use_stmt.block, executable_edges):
                    new_val = evaluate_stmt(use_stmt, val)
                    if new_val != val[use_stmt.target]:
                        val[use_stmt.target] = new_val
                        ssa_worklist.append(use_stmt.target)

    return val
```

### Evaluating φ-Functions

```python
def evaluate_phi(phi, val, executable_edges):
    """phi.target = φ(v1, v2, ..., vn) from edges e1, e2, ..., en"""
    result = TOP
    for (v, edge) in zip(phi.operands, phi.incoming_edges):
        if edge in executable_edges:
            result = meet(result, val[v])
    return result
```

---

## Global Value Numbering (GVN) on SSA

**Global Value Numbering** finds expressions that compute the same value and eliminates redundant computations.

### The Idea

Assign a **value number** to each expression. If two expressions get the same value number, they produce the same result.

```c
// SSA form:
a1 = x1 + y1;     // value number: VN(+, VN(x1), VN(y1)) = v1
b1 = x1 + y1;     // same expression! value number = v1
c1 = a1 * 2;
d1 = b1 * 2;      // same as c1!
```

After GVN:

```c
a1 = x1 + y1;
b1 = a1;           // reuse a1
c1 = a1 * 2;
d1 = c1;           // reuse c1
```

### Hash-Based Value Numbering

```python
def global_value_numbering(program):
    """Assign value numbers using hashing."""
    value_table = {}  # maps (op, vn1, vn2) → SSA variable
    vn = {}           # maps SSA variable → value number

    for stmt in program.statements_in_dominator_order():
        if stmt.is_assignment():
            expr_key = make_key(stmt.expr, vn)
            if expr_key in value_table:
                # Redundant! Replace with existing variable
                replace_all_uses(stmt.target, value_table[expr_key])
                remove(stmt)
            else:
                value_table[expr_key] = stmt.target
                vn[stmt.target] = expr_key
```

### Why SSA Helps GVN

- Same SSA name = same value (guaranteed by single definition)
- No need to track "which definition reaches this point"
- Dominator tree provides natural processing order

---

## Copy Propagation on SSA

**Copy propagation** replaces uses of a copy (`x = y`) with the original variable.

On SSA form, this is straightforward:

```c
// Before copy propagation:
x1 = a1;           // x1 is just a copy of a1
y1 = x1 + 5;      // uses x1
z1 = x1 * 2;      // uses x1

// After copy propagation:
y1 = a1 + 5;      // replaced x1 with a1
z1 = a1 * 2;      // replaced x1 with a1
// x1 = a1 is now dead → remove it
```

### Algorithm

```python
def copy_propagation_ssa(program):
    """Replace copies with their source."""
    for stmt in program.statements:
        if stmt.is_copy():  # x = y (simple assignment)
            source = stmt.source
            target = stmt.target
            # Replace all uses of target with source
            replace_all_uses(target, source)
            program.remove(stmt)
```

### Handling φ-Functions

Copies often arise from $\phi$-functions after SSA destruction:

```c
// φ-function:
x3 = φ(x1, x2)

// After SSA destruction, becomes copies:
// In predecessor 1: x3 = x1
// In predecessor 2: x3 = x2
```

Copy propagation can sometimes eliminate these copies.

---

## Strength Reduction on SSA

**Strength reduction** replaces expensive operations with cheaper ones, typically inside loops.

### Classic Example: Multiplication → Addition

```c
// Original loop:
for (i1 = 0; i1 < n; i1 = i1 + 1) {
    t1 = i1 * 4;    // expensive multiplication each iteration
    a[t1] = 0;
}

// After strength reduction:
t1 = 0;
for (i1 = 0; i1 < n; i1 = i1 + 1) {
    a[t1] = 0;
    t1 = t1 + 4;    // cheap addition instead!
}
```

### On SSA Form

SSA makes induction variable detection easier:

```c
// SSA form of a loop:
i1 = 0;
loop:
  i2 = φ(i1, i3)     // i2 is an induction variable
  t1 = i2 * 4;       // derived induction variable
  ...
  i3 = i2 + 1;
  if (i3 < n) goto loop;
```

The pattern `i2 = φ(initial, i3)` with `i3 = i2 + stride` identifies a **basic induction variable**. Then `t1 = i2 * 4` is a **derived induction variable** that can be strength-reduced.

### Operator Strength Reduction Table

| Expensive | Replacement | Condition |
|-----------|-------------|-----------|
| `x * 2` | `x + x` or `x << 1` | — |
| `x * 4` | `x << 2` | — |
| `x * 2^n` | `x << n` | Power of 2 |
| `x / 2^n` | `x >> n` | Unsigned, power of 2 |
| `x % 2^n` | `x & (2^n - 1)` | Unsigned, power of 2 |

---

## Comparison: SSA-Based vs Traditional Optimizations

| Optimization | Traditional Approach | SSA-Based Approach |
|-------------|---------------------|-------------------|
| Constant Propagation | Iterative data-flow on blocks | Sparse: follow use-def chains directly |
| Dead Code Elimination | Liveness analysis + sweep | Count uses of SSA names |
| Common Subexpression | Available expressions analysis | Global Value Numbering with hash table |
| Copy Propagation | Data-flow tracking copies | Direct substitution (single def) |
| Code Motion | Complex loop analysis | Dominator-based placement |

### Performance Comparison

| Metric | Traditional | SSA-Based |
|--------|-------------|-----------|
| Time complexity | $O(N^2)$ to $O(N^3)$ per analysis | Often $O(N)$ or $O(N \log N)$ |
| Space | Bit vectors for each block | Per-variable information |
| Precision | May lose information at merges | Exact (one def per variable) |
| Implementation | Multiple separate passes | Often combined into one pass |

---

## Putting It All Together: An Optimization Pipeline

A typical SSA-based optimization pipeline:

```
1. Build SSA form (insert φ-functions, rename variables)
2. SCCP (constant propagation + unreachable code removal)
3. Dead code elimination (remove unused SSA names)
4. Global value numbering (eliminate redundant computations)
5. Copy propagation (remove trivial copies)
6. Loop optimizations (strength reduction, LICM)
7. Dead code elimination (final cleanup)
8. Destroy SSA (insert copies for φ-functions, coalesce)
```

### Example: Full Pipeline

```c
// Original:
x = 5;
y = 5;
if (x == y) {
    a = x + y;
    b = x + y;    // redundant
    c = b * 2;
} else {
    a = 10;       // unreachable
}
print(a, c);
```

**After SSA construction:**
```c
x1 = 5;
y1 = 5;
if (x1 == y1) goto L1 else goto L2;
L1: a1 = x1 + y1;
    b1 = x1 + y1;
    c1 = b1 * 2;
    goto L3;
L2: a2 = 10;
    goto L3;
L3: a3 = φ(a1, a2);
    print(a3, c1);
```

**After SCCP** (x1=5, y1=5, condition is true, L2 unreachable):
```c
x1 = 5;
y1 = 5;
a1 = 10;       // 5 + 5
b1 = 10;       // 5 + 5
c1 = 20;       // 10 * 2
a3 = a1;       // φ reduced (only one reachable input)
print(a3, c1);
```

**After copy propagation + DCE:**
```c
print(10, 20);
```

---

## Challenges

### φ-Function Overhead

$\phi$-functions add complexity:
- They are not real instructions (must be lowered to copies)
- Naive placement inserts too many $\phi$-functions
- Pruned SSA only places $\phi$ where the variable is actually live

### Critical Edges

A **critical edge** goes from a block with multiple successors to a block with multiple predecessors. These must be split for correct $\phi$-function lowering:

```
Before:              After splitting:
A → C               A → X → C
B → C               B → C
(A has 2 succs)     (X is new block for copies)
```

---

## Exercises

**Exercise 1:** Convert this code to SSA and apply dead code elimination:

```c
a = 5;
b = a + 1;
c = a + 1;    // redundant with b?
a = 10;
d = a + 1;
print(d);
```

Which SSA definitions are dead?

**Exercise 2:** Apply GVN to this SSA code:

```c
x1 = a1 + b1;
y1 = a1 + b1;
z1 = x1 * c1;
w1 = y1 * c1;
print(z1, w1);
```

**Exercise 3:** Identify the induction variable and apply strength reduction:

```c
i = 0;
while (i < 100) {
    addr = base + i * 8;
    load(addr);
    i = i + 1;
}
```

**Exercise 4:** Trace through SCCP on this SSA code. What is the final value of `a3`?

```c
x1 = 3;
y1 = 4;
z1 = x1 + y1;
cond1 = z1 > 10;
if (cond1) goto L1 else goto L2;
L1: a1 = z1 * 2; goto L3;
L2: a2 = z1 + 1; goto L3;
L3: a3 = φ(a1, a2);
    print(a3);
```

**Exercise 5:** Compare iterations needed for constant propagation to converge using (a) traditional iterative data-flow and (b) SSA-based sparse propagation on a chain `a=1; b=a+1; c=b+1; d=c+1; e=d+1`.

---

## Summary

- SSA makes optimizations simpler by guaranteeing single definitions
- **Dead code elimination**: unused SSA name → dead definition
- **SCCP**: sparse propagation along use-def chains
- **GVN**: hash-based redundancy elimination
- **Copy propagation**: direct substitution
- **Strength reduction**: induction variable detection via φ-patterns
- SSA-based optimizations are generally faster and more precise than traditional approaches

---

## Next Steps

In the next lesson, you will learn about **Introduction to Code Generation** — the final phase that translates optimized IR into target machine code.
