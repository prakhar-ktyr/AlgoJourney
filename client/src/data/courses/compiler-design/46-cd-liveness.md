---
title: Liveness Analysis
---

# Liveness Analysis

In this lesson, you will learn about **liveness analysis** — one of the most important data-flow analyses in compiler optimization. It tells us which variables are "alive" at each point in a program.

---

## What Does "Live" Mean?

A variable is **live** at a program point if its current value **may be used** along some path in the future before being redefined.

A variable is **dead** at a program point if it will **never be used** again (or will be redefined before any use).

### Simple Example

```c
int x = 5;    // x is live here (used on line 3)
int y = 10;   // y is live here (used on line 4)
int z = x + 1;  // x is dead after this line
int w = y * 2;  // y is dead after this line
// z and w are live if used later...
```

**Why does this matter?**

- If a variable is dead, we can reuse its register
- If an assignment produces a dead variable, we can eliminate it (dead code)

---

## Liveness Analysis Is Backward

Unlike reaching definitions (which flow forward), liveness flows **backward** through the program:

- We start at the **end** of the program (where nothing is live)
- We propagate liveness information **upward** toward the beginning

This makes intuitive sense: a use of variable `x` at line 10 makes `x` live at lines before 10 (going backward until we find a definition of `x`).

---

## Use and Def Sets

For each basic block $B$, we define two sets:

| Set | Meaning |
|-----|---------|
| $\text{use}[B]$ | Variables **used** in $B$ before any definition in $B$ |
| $\text{def}[B]$ | Variables **defined** in $B$ before any use in $B$ |

### Computing Use and Def

Scan the block **from top to bottom**:

```
For each statement "x = y op z" (in order):
  - If y not in def[B], add y to use[B]
  - If z not in def[B], add z to use[B]
  - Add x to def[B]
```

### Example Block

```c
// Block B2:
a = b + c;   // uses b, c; defines a
d = a * 2;   // uses a; defines d
e = d + b;   // uses d, b; defines e
```

- $\text{use}[B2] = \{b, c\}$ — used before any definition
- $\text{def}[B2] = \{a, d, e\}$ — defined in the block

Note: `a` is not in use[B2] because it is defined before being used. Similarly `d` is defined before its use in `e = d + b`.

---

## Data-Flow Equations

Liveness analysis uses the following equations:

$$\text{in}[B] = \text{use}[B] \cup (\text{out}[B] - \text{def}[B])$$

$$\text{out}[B] = \bigcup_{S \in \text{succ}(B)} \text{in}[S]$$

Where:
- $\text{in}[B]$ = variables live at the **entry** of block $B$
- $\text{out}[B]$ = variables live at the **exit** of block $B$
- $\text{succ}(B)$ = successor blocks of $B$ in the CFG

### Meet Operator

The meet operator is **union** (∪). If a variable is live on **any** path from a point, it is live at that point.

### Direction

- **Backward** analysis: information flows from successors to predecessors
- Initialize: $\text{in}[B_{exit}] = \emptyset$ (nothing live after program ends)

---

## The Algorithm

```python
def liveness_analysis(cfg):
    # Initialize all sets to empty
    for block in cfg.blocks:
        block.live_in = set()
        block.live_out = set()

    changed = True
    while changed:
        changed = False
        # Process blocks in reverse order (backward analysis)
        for block in reversed(cfg.blocks):
            # out[B] = union of in[S] for all successors S
            new_out = set()
            for succ in block.successors:
                new_out = new_out | succ.live_in

            # in[B] = use[B] ∪ (out[B] - def[B])
            new_in = block.use_set | (new_out - block.def_set)

            if new_in != block.live_in or new_out != block.live_out:
                changed = True
                block.live_in = new_in
                block.live_out = new_out

    return cfg
```

---

## Complete Example

Consider this program:

```c
// B1 (Entry):
a = 1;
b = 2;

// B2:
c = a + b;
d = c * a;

// B3 (condition: d > 10):
if (d > 10) goto B4 else goto B5;

// B4:
a = d + 1;
goto B2;

// B5 (Exit):
print(c);
```

### Step 1: Compute Use and Def Sets

| Block | use | def |
|-------|-----|-----|
| B1 | ∅ | {a, b} |
| B2 | {a, b} | {c, d} |
| B3 | {d} | ∅ |
| B4 | {d} | {a} |
| B5 | {c} | ∅ |

### Step 2: Draw the CFG

```
B1 → B2 → B3 → B4
                ↓      ↑
               B5      |
                B4 ----→ B2
```

Successors:
- succ(B1) = {B2}
- succ(B2) = {B3}
- succ(B3) = {B4, B5}
- succ(B4) = {B2}
- succ(B5) = ∅

### Step 3: Iterate (Backward)

**Iteration 1** (process B5, B4, B3, B2, B1):

| Block | out | in |
|-------|-----|----|
| B5 | ∅ | {c} |
| B4 | ∅ | {d} |
| B3 | {c} ∪ {d} = {c, d} | {d} ∪ ({c, d} - ∅) = {c, d} |
| B2 | {c, d} | {a, b} ∪ ({c, d} - {c, d}) = {a, b} |
| B1 | {a, b} | ∅ ∪ ({a, b} - {a, b}) = ∅ |

**Iteration 2** (B4's out now includes in[B2]):

| Block | out | in |
|-------|-----|----|
| B5 | ∅ | {c} |
| B4 | {a, b} | {d} ∪ ({a, b} - {a}) = {b, d} |
| B3 | {c} ∪ {b, d} = {b, c, d} | {d} ∪ ({b, c, d} - ∅) = {b, c, d} |
| B2 | {b, c, d} | {a, b} ∪ ({b, c, d} - {c, d}) = {a, b} |
| B1 | {a, b} | ∅ |

**Iteration 3**: No changes → **converged!**

### Final Result

| Block | live\_in | live\_out |
|-------|----------|-----------|
| B1 | ∅ | {a, b} |
| B2 | {a, b} | {b, c, d} |
| B3 | {b, c, d} | {b, c, d} |
| B4 | {b, d} | {a, b} |
| B5 | {c} | ∅ |

---

## Live Variable Intervals

A **live interval** (or live range) for a variable is the span from its definition to its last use.

```c
1: a = 5;         // a starts being live
2: b = a + 1;     // a still live, b starts
3: c = b * 2;     // a dead, b still live, c starts
4: print(c);      // b dead, c still live
5: // end          // c dead
```

Live intervals:
- a: [1, 2]
- b: [2, 3]
- c: [3, 4]

Since a and c never overlap, they can share a register!

---

## Applications

### 1. Register Allocation

The primary use of liveness analysis. Two variables that are **never simultaneously live** can share the same register.

```
Variables live at the same time → need different registers
Variables NOT live at the same time → can share a register
```

This is formalized as an **interference graph**:
- Node for each variable
- Edge between two variables if they are both live at some point
- Color the graph with $k$ colors (= $k$ registers)

### 2. Dead Code Elimination

If a variable is **dead** immediately after its definition, that definition is useless:

```c
x = a + b;   // If x is dead after this → remove this statement!
y = c * d;   // y is used later → keep
```

### 3. Detecting Uninitialized Variables

If a variable is live at the entry of the program (in $\text{in}[B_{entry}]$), it means the variable may be used before being defined — a potential bug!

### 4. Memory Management

In garbage-collected languages, liveness information helps identify when objects can be freed.

---

## Liveness at the Statement Level

For finer analysis, compute liveness **within** a basic block (statement by statement), scanning backward:

```python
def statement_level_liveness(block, live_out):
    """Compute live sets before each statement, scanning backward."""
    live = live_out.copy()
    results = []

    for stmt in reversed(block.statements):
        results.append((stmt, live.copy()))
        # Remove defined variables (they are "born" here)
        for v in stmt.defines:
            live.discard(v)
        # Add used variables (they must be live before this point)
        for v in stmt.uses:
            live.add(v)

    results.reverse()
    return results
```

### Example

```c
// Block with live_out = {e}
a = b + c;    // live before: {b, c, e}
d = a * e;    // live before: {a, e}
e = d + 1;    // live before: {d}  ← wait, we said live_out = {e}?
```

Working backward from live\_out = {e}:
- Before `e = d + 1`: remove e (defined), add d (used) → {d}
- Before `d = a * e`: remove d (defined), add a, e (used) → {a, e}
- Before `a = b + c`: remove a (defined), add b, c (used) → {b, c, e}

So live\_in = {b, c, e}.

---

## Comparison with Reaching Definitions

| Property | Reaching Definitions | Liveness |
|----------|---------------------|----------|
| Direction | Forward | Backward |
| Meet operator | Union | Union |
| Transfer function | $\text{out} = \text{gen} \cup (\text{in} - \text{kill})$ | $\text{in} = \text{use} \cup (\text{out} - \text{def})$ |
| Initialization | $\text{out}[entry] = \emptyset$ | $\text{in}[exit] = \emptyset$ |
| Answers | "Which definitions reach here?" | "Which variables are live here?" |

---

## Exercises

**Exercise 1:** Compute use and def sets for each block:

```c
// B1:
x = 1;
y = 2;

// B2:
z = x + y;
x = z * 2;

// B3:
y = x + 1;
print(y, z);
```

**Exercise 2:** Given this CFG with successors B1→B2, B2→B3, B2→B4, B3→B2, B4→exit, perform liveness analysis:

| Block | use | def |
|-------|-----|-----|
| B1 | ∅ | {a, b} |
| B2 | {a, b} | {c} |
| B3 | {c} | {a} |
| B4 | {b, c} | ∅ |

**Exercise 3:** Draw the interference graph for the following live ranges:
- a: lines 1–4
- b: lines 2–6
- c: lines 5–8
- d: lines 3–5

How many registers are needed?

**Exercise 4:** Identify dead code using liveness:

```c
a = read();
b = a + 1;
c = a * 2;
b = c + 3;    // Is the first definition of b dead?
print(b);
```

**Exercise 5:** Write the liveness equations for a block with two successors (like an if-then-else). Explain why the meet operator must be union rather than intersection.

---

## Summary

- A variable is **live** if its value may be used in the future
- Liveness is a **backward** data-flow analysis with **union** as the meet operator
- Transfer function: $\text{in}[B] = \text{use}[B] \cup (\text{out}[B] - \text{def}[B])$
- Primary applications: register allocation, dead code elimination
- The interference graph (built from liveness) drives register allocation

---

## Next Steps

In the next lesson, you will learn about **Constant Propagation and Folding** — optimizations that evaluate expressions at compile time when their values are known.
