---
title: Reaching Definitions
---

# Reaching Definitions

Reaching Definitions is one of the most fundamental data-flow analyses. It answers: **which definitions of a variable could reach a particular point in the program?**

---

## What is a Reaching Definition?

A definition $d$ of variable $x$ at program point $p_d$ **reaches** a point $p$ if:

1. There exists a path from $p_d$ to $p$ in the CFG
2. Along that path, there is **no other definition** of $x$

### Intuition

```c
d1: x = 5;        // Definition d1 of x
    ...           // No redefinition of x here
    y = x + 1;   // d1 reaches here!
    ...
d2: x = 10;      // Definition d2 of x (kills d1)
    ...
    z = x * 2;   // Only d2 reaches here (d1 is killed)
```

### Formal Definition

$$d: x = \ldots \text{ reaches point } p \iff \exists \text{ path } d \to p \text{ with no definition of } x$$

---

## Framework Instance

Reaching Definitions as an instance of the data-flow framework:

| Component | Value |
|-----------|-------|
| Direction | **Forward** |
| Domain | Sets of definitions (bit vectors) |
| Meet operator | **Union** ($\cup$) |
| Transfer function | $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$ |
| Boundary | $\text{out}[\text{Entry}] = \emptyset$ |
| Initialization | All other $\text{out}[B] = \emptyset$ |

### Why Union?

A definition reaches a point if there exists **any** path along which it's not killed. Union captures this "may" semantics.

---

## Gen and Kill Sets

### Gen[B] — Definitions Generated

$\text{gen}[B]$ = the set of definitions in $B$ that reach the **end** of $B$ (not killed within $B$).

If a variable is defined multiple times in $B$, only the **last** definition is in gen.

```c
// Block B
d1: x = 1;       // Killed by d2 below
d2: y = 2;       // Reaches end of B
d3: x = 3;       // Reaches end of B (last def of x)

// gen[B] = {d2, d3}
```

### Kill[B] — Definitions Killed

$\text{kill}[B]$ = all definitions of variables that are **defined in** $B$, except those in $B$ itself.

If $B$ defines variable $x$, then kill contains ALL definitions of $x$ **in the entire program** (except those in $B$).

```c
// Suppose the program has these definitions of x:
// d1 (in B1): x = 1
// d3 (in B2): x = 3
// d5 (in B3): x = 7

// If B2 defines x (via d3):
// kill[B2] includes d1, d5 (all other defs of x)
```

### Computing Gen and Kill

```python
def compute_gen_kill(block, all_definitions):
    gen = set()
    kill = set()
    
    # Process statements in order
    for stmt in block.statements:
        if stmt.is_definition:
            var = stmt.defined_variable
            defn = stmt.definition_id
            
            # This definition kills all OTHER definitions of var
            other_defs = {d for d in all_definitions 
                        if d.variable == var and d != defn}
            kill = kill | other_defs
            
            # Remove previous defs of same var from gen
            gen = {d for d in gen if d.variable != var}
            
            # Add this definition to gen
            gen.add(defn)
    
    return gen, kill
```

---

## Complete Example

### The Program

```c
// Block B1 (entry)
d1: i = m - 1;
d2: j = n;
d3: a = u1;

// Block B2
d4: i = i + 1;

// Block B3
d5: j = j - 1;

// Block B4
d6: a = u2;

// Block B5 (exit)
// (uses i, j, a)
```

### The CFG

```
    [B1]
      |
      v
    [B2] ←---+
      |       |
      v       |
    [B3] ←-+ |
      |     | |
      v     | |
    [B4]    | |
     / \    | |
    v   v   | |
  [B5] [B3]-+ |
        [B2]---+
```

Simplified edges:
- B1 → B2
- B2 → B3
- B3 → B4
- B4 → B5 (exit)
- B4 → B3 (inner loop back edge)
- B4 → B2 (outer loop back edge)

### Step 1: Gen and Kill Sets

| Block | Gen | Kill |
|-------|-----|------|
| B1 | $\{d_1, d_2, d_3\}$ | $\{d_4, d_5, d_6\}$ |
| B2 | $\{d_4\}$ | $\{d_1\}$ |
| B3 | $\{d_5\}$ | $\{d_2\}$ |
| B4 | $\{d_6\}$ | $\{d_3\}$ |

Explanation:
- B1 defines $i, j, a$ → kills other defs of these: $d_4$ (other $i$), $d_5$ (other $j$), $d_6$ (other $a$)
- B2 defines $i$ → gen = $\{d_4\}$, kill = $\{d_1\}$ (the other def of $i$)
- B3 defines $j$ → gen = $\{d_5\}$, kill = $\{d_2\}$ (the other def of $j$)
- B4 defines $a$ → gen = $\{d_6\}$, kill = $\{d_3\}$ (the other def of $a$)

### Step 2: Initialize

$$\text{out}[B1] = \text{out}[B2] = \text{out}[B3] = \text{out}[B4] = \emptyset$$

### Step 3: Iterate

**Iteration 1:**

Block B1 (predecessors: Entry):
$$\text{in}[B1] = \emptyset$$
$$\text{out}[B1] = \{d_1, d_2, d_3\} \cup (\emptyset - \{d_4, d_5, d_6\}) = \{d_1, d_2, d_3\}$$

Block B2 (predecessors: B1, B4):
$$\text{in}[B2] = \text{out}[B1] \cup \text{out}[B4] = \{d_1, d_2, d_3\} \cup \emptyset = \{d_1, d_2, d_3\}$$
$$\text{out}[B2] = \{d_4\} \cup (\{d_1, d_2, d_3\} - \{d_1\}) = \{d_4, d_2, d_3\}$$

Block B3 (predecessors: B2, B4):
$$\text{in}[B3] = \text{out}[B2] \cup \text{out}[B4] = \{d_4, d_2, d_3\} \cup \emptyset = \{d_4, d_2, d_3\}$$
$$\text{out}[B3] = \{d_5\} \cup (\{d_4, d_2, d_3\} - \{d_2\}) = \{d_5, d_4, d_3\}$$

Block B4 (predecessors: B3):
$$\text{in}[B4] = \text{out}[B3] = \{d_5, d_4, d_3\}$$
$$\text{out}[B4] = \{d_6\} \cup (\{d_5, d_4, d_3\} - \{d_3\}) = \{d_6, d_5, d_4\}$$

**Iteration 2:** (B4's output changed, so re-process)

Block B2 (predecessors: B1, B4):
$$\text{in}[B2] = \{d_1, d_2, d_3\} \cup \{d_6, d_5, d_4\} = \{d_1, d_2, d_3, d_4, d_5, d_6\}$$
$$\text{out}[B2] = \{d_4\} \cup (\{d_1, d_2, d_3, d_4, d_5, d_6\} - \{d_1\}) = \{d_2, d_3, d_4, d_5, d_6\}$$

Block B3 (predecessors: B2, B4):
$$\text{in}[B3] = \{d_2, d_3, d_4, d_5, d_6\} \cup \{d_6, d_5, d_4\} = \{d_2, d_3, d_4, d_5, d_6\}$$
$$\text{out}[B3] = \{d_5\} \cup (\{d_2, d_3, d_4, d_5, d_6\} - \{d_2\}) = \{d_3, d_4, d_5, d_6\}$$

Block B4:
$$\text{in}[B4] = \{d_3, d_4, d_5, d_6\}$$
$$\text{out}[B4] = \{d_6\} \cup (\{d_3, d_4, d_5, d_6\} - \{d_3\}) = \{d_4, d_5, d_6\}$$

**Iteration 3:**

Block B2:
$$\text{in}[B2] = \{d_1, d_2, d_3\} \cup \{d_4, d_5, d_6\} = \{d_1, d_2, d_3, d_4, d_5, d_6\}$$
$$\text{out}[B2] = \{d_2, d_3, d_4, d_5, d_6\}$$ — **no change!**

All other blocks: no change. **Converged!**

### Final Result

| Block | in | out |
|-------|-----|------|
| B1 | $\emptyset$ | $\{d_1, d_2, d_3\}$ |
| B2 | $\{d_1, d_2, d_3, d_4, d_5, d_6\}$ | $\{d_2, d_3, d_4, d_5, d_6\}$ |
| B3 | $\{d_2, d_3, d_4, d_5, d_6\}$ | $\{d_3, d_4, d_5, d_6\}$ |
| B4 | $\{d_3, d_4, d_5, d_6\}$ | $\{d_4, d_5, d_6\}$ |

---

## Applications

### 1. Use-Definition Chains (ud-chains)

For each **use** of a variable, find all definitions that could reach it.

```c
d1: x = 5;
d2: x = 10;
...
y = x + 1;    // ud-chain: {d1, d2} → this use of x
```

ud-chains are essential for:
- Constant propagation: if all reaching defs assign the same constant, the use IS that constant
- Copy propagation: if one reaching def is `x = y`, and it's the ONLY reaching def, replace `x` with `y`

### 2. Constant Propagation

```c
d1: x = 5;       // Only this def reaches the use below
    ...           // No other definition of x
    y = x + 1;   // x is always 5 here → y = 6!
```

If ALL reaching definitions of $x$ at a point assign the **same constant** $c$, then $x = c$ at that point.

### 3. Definition-Use Chains (du-chains)

The reverse: for each **definition**, find all uses it reaches.

Useful for:
- Dead code elimination: if a definition reaches no use, it's dead
- Strength reduction: find where induction variables are used

### 4. Uninitialized Variable Detection

If a use of variable $x$ is reached by **no definition** of $x$ (other than the implicit "undefined" at entry), the variable may be used uninitialized.

```c
int x;            // No initialization
if (condition)
    x = 5;
printf("%d", x);  // Warning: x may be uninitialized!
```

---

## Implementation with Bit Vectors

Each definition gets a unique number. Sets are represented as bit vectors.

```python
# Definitions: d1=0, d2=1, d3=2, d4=3, d5=4, d6=5
# 
# gen[B1] = {d1, d2, d3} = 111000
# kill[B1] = {d4, d5, d6} = 000111
# 
# Transfer: out = gen | (in & ~kill)
# out[B1] = 111000 | (000000 & 111000) = 111000

# Meet (union): bitwise OR
# in[B2] = out[B1] | out[B4] = 111000 | 000111 = 111111
```

Bit vector operations are single machine instructions — extremely fast!

---

## Algorithm Complexity

- **Definitions**: $d$ total definitions in the program
- **Blocks**: $n$ basic blocks
- **Iterations**: typically 2-5 (bounded by loop nesting depth + 1)
- **Per iteration**: $O(n \times d)$ bit operations
- **Total**: $O(n \times d \times \text{iterations})$

For most programs, this completes in milliseconds.

---

## Reaching Definitions vs Available Expressions

| Property | Reaching Definitions | Available Expressions |
|----------|---------------------|---------------------|
| Question | Which definitions reach here? | Which expressions are available? |
| Meet | Union (any path) | Intersection (all paths) |
| Safety | Over-approximate: include extra defs | Under-approximate: exclude uncertain exprs |
| Init others | $\emptyset$ | $U$ |
| Type | "May" analysis | "Must" analysis |

Both are forward analyses with the same transfer function form, but their safety requirements differ.

---

## Exercises

**Exercise 1:** Compute reaching definitions for this program:

```c
B1: d1: x = 1;
    d2: y = 2;
    → B2

B2: d3: z = x + y;
    → B3, B4

B3: d4: x = z;
    d5: y = x + 1;
    → B5

B4: d6: y = z + x;
    → B5

B5: d7: z = x + y;
```

Show gen, kill, and the final in/out sets for each block.

**Exercise 2:** Using the reaching definitions from Exercise 1, determine:
- The ud-chain for the use of `x` in B5 (in $d_7$: `z = x + y`)
- The ud-chain for the use of `y` in B5

**Exercise 3:** A use of variable `w` at point $p$ is reached by definitions $d_1: w = 3$ and $d_2: w = 3$. Can we conclude that `w = 3` at $p$? What if $d_2: w = 5$ instead?

**Exercise 4:** Implement reaching definitions in Python:

```python
# Given:
blocks = ['B1', 'B2', 'B3', 'B4']
predecessors = {
    'B1': [],
    'B2': ['B1', 'B4'],
    'B3': ['B2'],
    'B4': ['B3']
}
gen = {'B1': {1,2}, 'B2': {3}, 'B3': {4}, 'B4': {5}}
kill = {'B1': {3,5}, 'B2': {1}, 'B3': {2}, 'B4': {4}}

# Write code to compute reaching definitions
# and print in/out for each block
```

**Exercise 5:** Explain why reaching definitions uses $\emptyset$ as the initial value for all blocks (not just entry), while available expressions uses $U$ for non-entry blocks. What would go wrong if we swapped them?

**Exercise 6:** How would you modify reaching definitions to handle **function calls**? Consider: `x = foo();` — what definitions might be killed?

---

## Summary

- A definition $d: x = \ldots$ reaches point $p$ if there's a path with no redefinition of $x$
- Forward analysis, meet = union (any-path, "may" analysis)
- $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$
- Gen = last definitions of each variable in the block
- Kill = all other definitions (in the whole program) of variables defined in the block
- Applications: ud-chains, constant propagation, dead code detection, uninitialized variables
- Efficiently implemented with bit vectors

---

## Next Lesson

Next, we'll study **Live Variable Analysis** — a backward data-flow analysis crucial for register allocation and dead code elimination.
