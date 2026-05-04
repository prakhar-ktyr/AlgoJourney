---
title: Data-Flow Analysis Framework
---

# Data-Flow Analysis Framework

We've seen several data-flow analyses: available expressions, live variables, reaching definitions. They all follow the **same pattern**. The Data-Flow Analysis Framework captures this pattern formally.

---

## The General Framework

Every data-flow analysis is defined by a tuple:

$$(D, \mathcal{V}, \wedge, F, v_{\text{init}})$$

| Component | Meaning |
|-----------|---------|
| $D$ | **Direction** — forward or backward |
| $\mathcal{V}$ | **Domain** — the set of possible data-flow values (a lattice) |
| $\wedge$ | **Meet operator** — combines values from multiple paths |
| $F$ | **Transfer functions** — how values change across a block |
| $v_{\text{init}}$ | **Initial value** — boundary condition |

---

## Forward vs Backward Analysis

### Forward Analysis

Information flows from **entry to exit**, following execution order.

$$\text{in}[B] = \bigwedge_{P \in \text{pred}(B)} \text{out}[P]$$

$$\text{out}[B] = f_B(\text{in}[B])$$

Examples: available expressions, reaching definitions, constant propagation.

### Backward Analysis

Information flows from **exit to entry**, against execution order.

$$\text{out}[B] = \bigwedge_{S \in \text{succ}(B)} \text{in}[S]$$

$$\text{in}[B] = f_B(\text{out}[B])$$

Examples: live variables, very busy expressions.

---

## Transfer Functions

The transfer function describes how a basic block transforms data-flow values.

### General Form (Forward)

$$\text{out}[B] = f_B(\text{in}[B]) = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$$

- **Gen[B]**: information generated (created) by the block
- **Kill[B]**: information destroyed by the block

### General Form (Backward)

$$\text{in}[B] = f_B(\text{out}[B]) = \text{gen}[B] \cup (\text{out}[B] - \text{kill}[B])$$

### Properties Required

Transfer functions must be **monotone**:

$$x \leq y \implies f(x) \leq f(y)$$

This guarantees the algorithm converges.

---

## Meet Operator

The meet operator combines data-flow values at **confluence points** (where multiple paths merge).

### Union ($\cup$) — "Any Path"

Use when information is valid if it holds on **at least one** path.

- Reaching definitions: a definition reaches a point if it reaches via ANY path
- Live variables: a variable is live if used on ANY path from here

### Intersection ($\cap$) — "All Paths"

Use when information is valid only if it holds on **every** path.

- Available expressions: an expression is available only if computed on ALL paths
- Very busy expressions: an expression is busy only if used on ALL paths

---

## Lattice Theory Basics

Data-flow values form a **lattice** — a mathematical structure that guarantees convergence.

### Partial Order

A set $\mathcal{V}$ with a relation $\leq$ that is:

- **Reflexive**: $x \leq x$
- **Antisymmetric**: $x \leq y$ and $y \leq x$ implies $x = y$
- **Transitive**: $x \leq y$ and $y \leq z$ implies $x \leq z$

### Meet and Join

- **Meet** ($\wedge$): greatest lower bound — $a \wedge b$ is the largest element $\leq$ both $a$ and $b$
- **Join** ($\vee$): least upper bound — $a \vee b$ is the smallest element $\geq$ both $a$ and $b$

### Top and Bottom

- **Top** ($\top$): the largest element — $x \leq \top$ for all $x$
- **Bottom** ($\bot$): the smallest element — $\bot \leq x$ for all $x$

### Example: Power Set Lattice

For available expressions with universe $U = \{e_1, e_2, e_3\}$:

```
          {e1, e2, e3}  = ⊤ (top)
         /     |      \
  {e1,e2}  {e1,e3}  {e2,e3}
      |  \  / | \  /  |
     {e1}  {e2}  {e3}
         \   |   /
           ∅         = ⊥ (bottom)
```

- Meet ($\wedge$) = intersection: going DOWN
- Join ($\vee$) = union: going UP
- Analysis starts at $\top$ and moves DOWN (more precise)

---

## The Iterative Fixed-Point Algorithm

```python
def iterative_dataflow(cfg, direction, meet, transfer, init, top):
    """
    Generic iterative data-flow analysis.
    
    cfg: control flow graph
    direction: 'forward' or 'backward'
    meet: function combining values (union or intersection)
    transfer: dict of transfer functions per block
    init: initial value for boundary (entry or exit)
    top: initial value for all other blocks
    """
    
    if direction == 'forward':
        boundary = cfg.entry
        get_predecessors = lambda B: cfg.predecessors(B)
        in_val = {}
        out_val = {}
        
        # Initialize
        out_val[boundary] = init
        for B in cfg.blocks - {boundary}:
            out_val[B] = top
        
        # Iterate
        changed = True
        while changed:
            changed = False
            for B in cfg.blocks - {boundary}:
                in_val[B] = meet(out_val[P] for P in get_predecessors(B))
                new_out = transfer[B](in_val[B])
                if new_out != out_val[B]:
                    out_val[B] = new_out
                    changed = True
        
        return in_val, out_val
    
    else:  # backward
        boundary = cfg.exit
        get_successors = lambda B: cfg.successors(B)
        in_val = {}
        out_val = {}
        
        # Initialize
        in_val[boundary] = init
        for B in cfg.blocks - {boundary}:
            in_val[B] = top
        
        # Iterate
        changed = True
        while changed:
            changed = False
            for B in cfg.blocks - {boundary}:
                out_val[B] = meet(in_val[S] for S in get_successors(B))
                new_in = transfer[B](out_val[B])
                if new_in != in_val[B]:
                    in_val[B] = new_in
                    changed = True
        
        return in_val, out_val
```

### Why Does It Converge?

**Theorem**: The iterative algorithm converges for any instance of the framework where:

1. The lattice has **finite height** (finite number of descending steps)
2. Transfer functions are **monotone**

**Proof sketch**:
- Values can only move **down** in the lattice (meet can only decrease or stay same)
- Monotone transfer functions preserve this downward movement
- Finite height means we can only go down finitely many times
- Therefore, a fixed point must be reached

### Number of Iterations

For a lattice of height $h$ and a CFG with $n$ blocks:

- **Worst case**: $O(h \times n)$ iterations
- **In practice**: 2-5 iterations for most programs (especially with reverse postorder traversal)

---

## Instances of the Framework

### 1. Reaching Definitions

| Component | Value |
|-----------|-------|
| Direction | Forward |
| Domain | Sets of definitions (bit vectors) |
| Meet ($\wedge$) | Union ($\cup$) |
| Transfer | $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$ |
| Init | $\text{out}[\text{Entry}] = \emptyset$ |
| Top ($\top$) | $\emptyset$ |

"A definition reaches a point if it reaches via **any** path."

### 2. Available Expressions

| Component | Value |
|-----------|-------|
| Direction | Forward |
| Domain | Sets of expressions (bit vectors) |
| Meet ($\wedge$) | Intersection ($\cap$) |
| Transfer | $\text{out}[B] = \text{gen}[B] \cup (\text{in}[B] - \text{kill}[B])$ |
| Init | $\text{out}[\text{Entry}] = \emptyset$ |
| Top ($\top$) | $U$ (all expressions) |

"An expression is available only if computed on **all** paths."

### 3. Live Variables

| Component | Value |
|-----------|-------|
| Direction | Backward |
| Domain | Sets of variables (bit vectors) |
| Meet ($\wedge$) | Union ($\cup$) |
| Transfer | $\text{in}[B] = \text{use}[B] \cup (\text{out}[B] - \text{def}[B])$ |
| Init | $\text{in}[\text{Exit}] = \emptyset$ |
| Top ($\top$) | $\emptyset$ |

"A variable is live if used on **any** path from here."

### 4. Very Busy Expressions

| Component | Value |
|-----------|-------|
| Direction | Backward |
| Domain | Sets of expressions (bit vectors) |
| Meet ($\wedge$) | Intersection ($\cap$) |
| Transfer | $\text{in}[B] = \text{use}[B] \cup (\text{out}[B] - \text{kill}[B])$ |
| Init | $\text{in}[\text{Exit}] = \emptyset$ |
| Top ($\top$) | $U$ (all expressions) |

"An expression is very busy if it **must** be evaluated on **all** paths from here."

---

## Comparison Table

| Analysis | Direction | Meet | Boundary | Top | Purpose |
|----------|-----------|------|----------|-----|---------|
| Reaching Defs | Forward | $\cup$ | $\emptyset$ | $\emptyset$ | Know what definitions reach each point |
| Available Exprs | Forward | $\cap$ | $\emptyset$ | $U$ | Common subexpression elimination |
| Live Variables | Backward | $\cup$ | $\emptyset$ | $\emptyset$ | Dead code elimination, register alloc |
| Very Busy Exprs | Backward | $\cap$ | $\emptyset$ | $U$ | Code hoisting optimization |

### Pattern

- **Union + empty init**: "may" analysis (optimistic start, grows)
- **Intersection + universal init**: "must" analysis (pessimistic start, shrinks)

---

## Correctness: Safe vs Precise

### Safety (Soundness)

The analysis must be **safe** — it must never cause incorrect optimization.

- For available expressions: better to say "not available" than to wrongly say "available"
- For live variables: better to say "live" than to wrongly say "dead"

### Precision

The analysis should be as **precise** as possible (maximize optimization opportunities) while remaining safe.

The framework guarantees the **Maximum Fixed Point (MFP)** — the most precise safe solution obtainable by the iterative method.

---

## Advanced: Worklist Algorithm

Instead of iterating over ALL blocks each round, use a **worklist**:

```python
def worklist_dataflow(cfg, direction, meet, transfer, init, top):
    # Initialize
    out_val = {B: top for B in cfg.blocks}
    out_val[cfg.entry] = init
    
    # Worklist: blocks whose output changed
    worklist = list(cfg.blocks - {cfg.entry})
    
    while worklist:
        B = worklist.pop(0)  # or use priority queue
        
        in_B = meet(out_val[P] for P in cfg.predecessors(B))
        new_out = transfer[B](in_B)
        
        if new_out != out_val[B]:
            out_val[B] = new_out
            # Only add successors to worklist
            for S in cfg.successors(B):
                if S not in worklist:
                    worklist.append(S)
    
    return out_val
```

**Advantage**: Only re-processes blocks whose inputs actually changed.

---

## Exercises

**Exercise 1:** Classify each analysis into the framework:

| Analysis | Direction | Meet | Init | Top |
|----------|-----------|------|------|-----|
| Constant Propagation | ? | ? | ? | ? |
| Copy Propagation | ? | ? | ? | ? |

Hint: Constant propagation uses a lattice where $\top$ = "undefined", constants are in the middle, and $\bot$ = "not constant".

**Exercise 2:** Prove that intersection is monotone. That is, show:

$$A \subseteq B \implies (A \cap C) \subseteq (B \cap C)$$

**Exercise 3:** A lattice has height 4 and the CFG has 10 blocks. What is the maximum number of iterations the algorithm might need?

**Exercise 4:** For this CFG, set up and solve the reaching definitions framework:

```
Entry → B1 → B2 → B3 → Exit
              ↑         |
              +---------+  (B3 → B2)

B1: d1: x = 5;    d2: y = 3;
B2: d3: z = x + y;
B3: d4: x = z - 1;
```

**Exercise 5:** Show that the transfer function $f(X) = \text{gen} \cup (X - \text{kill})$ is monotone. That is, prove: if $X \subseteq Y$, then $f(X) \subseteq f(Y)$.

**Exercise 6:** Explain the difference between the MFP (Maximum Fixed Point) solution and the MOP (Meet Over all Paths) solution. When are they equal?

---

## Summary

- The data-flow framework unifies all analyses: $(D, \mathcal{V}, \wedge, F, v_{\text{init}})$
- **Forward** analyses compute in-to-out; **backward** analyses compute out-to-in
- Transfer: $\text{out}[B] = f_B(\text{in}[B])$
- Meet: $\text{in}[B] = \bigwedge_{P \in \text{pred}(B)} \text{out}[P]$
- Convergence is guaranteed by **finite lattice + monotone functions**
- Union = "may" (any path); Intersection = "must" (all paths)
- The framework captures reaching defs, available exprs, live vars, and more

---

## Next Lesson

Next, we'll do a deep dive into **Reaching Definitions** — one of the most fundamental analyses, with applications to constant propagation and use-def chains.
