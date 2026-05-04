---
title: The Classes L and NL
---

# The Classes L and NL

So far we've studied polynomial time ($P$, $NP$) and polynomial space ($PSPACE$). But what happens when we restrict space even further — to just **logarithmic** space? This gives us the fascinating classes $L$ and $NL$.

---

## Sub-Linear Space Computation

### The Model

Standard Turing machines use space proportional to input size or more. But many problems need far less working memory. The **log-space model** uses:

1. **Read-only input tape**: contains the input $w$ of length $n$ (cannot be modified)
2. **Work tape**: limited to $O(\log n)$ cells
3. **Write-only output tape** (for function computations)

$$\text{Total work space} = O(\log n)$$

> **Key Insight**: We don't count the input tape toward space usage — only the work tape matters!

---

## Why $\log n$ Space?

With $\log n$ bits of work space, you can:

- Store a **constant number of pointers** into the input (each pointer needs $\lceil \log_2 n \rceil$ bits)
- Store **counters** up to $n$ (a counter to $n$ needs $\log n$ bits)
- Perform **binary arithmetic** on values up to polynomial in $n$

$$\text{A pointer to position } i \in \{1, \ldots, n\} \text{ needs } \lceil \log_2 n \rceil \text{ bits}$$

This is the **minimum useful amount of space** for many interesting problems.

---

## The Class L

### Definition

$$L = \text{SPACE}(\log n)$$

$L$ is the class of languages decidable by a **deterministic** Turing machine using $O(\log n)$ space on the work tape.

### Formal Definition

A language $A \in L$ if there exists a deterministic TM $M$ such that:

1. $M$ decides $A$
2. $M$ uses at most $c \cdot \log n$ cells on the work tape (for some constant $c$)
3. The input tape is read-only

---

## Examples in L

### Example 1: $\{0^k 1^k \mid k \geq 0\}$

**Claim**: This language is in $L$.

**Algorithm**:
1. Count the number of 0s in binary (needs $O(\log n)$ space)
2. Count the number of 1s in binary (needs $O(\log n)$ space)
3. Compare the two counters
4. Accept if equal, reject otherwise

```
Input: 000111
Work tape stores: count_0 = 11 (binary for 3)
                  count_1 = 11 (binary for 3)
Result: ACCEPT (counts match)
```

**Space analysis**: Two binary counters, each using $\lceil \log_2 n \rceil$ bits:

$$\text{Space} = 2 \cdot \lceil \log_2 n \rceil = O(\log n) \checkmark$$

### Example 2: Sorted Array Checking

**Problem**: Is the input array sorted?

**Algorithm**:
1. Store pointer $i$ (to current element)
2. Store pointer $i+1$ (to next element)
3. Compare elements at positions $i$ and $i+1$
4. If out of order, reject
5. Advance $i$, repeat

**Space**: Two pointers = $2 \log n = O(\log n)$

### Example 3: Palindrome Checking (Read-Only Input)

**Problem**: Is $w = w^R$?

**Algorithm**:
1. Store pointer $i$ (front) and pointer $j$ (back)
2. Compare characters at positions $i$ and $n - i + 1$
3. Advance $i$, repeat until middle reached

**Space**: Two pointers + one counter = $O(\log n)$

### Example 4: Addition of Two Binary Numbers

Given two $n$-bit numbers on the input tape, we can compute their sum using $O(\log n)$ work space (just carry bit and position counter).

---

## The Class NL

### Definition

$$NL = \text{NSPACE}(\log n)$$

$NL$ is the class of languages decidable by a **nondeterministic** Turing machine using $O(\log n)$ space.

### How Nondeterminism Helps

A nondeterministic log-space machine can:
- **Guess** bits one at a time
- **Verify** properties while only remembering $O(\log n)$ information
- Essentially: explore paths in a graph by remembering only the current node

---

## The PATH Problem

### Definition

$$\text{PATH} = \{ \langle G, s, t \rangle \mid G \text{ is a directed graph with a path from } s \text{ to } t \}$$

This is the canonical **NL-complete** problem.

### PATH is in NL

**Nondeterministic Algorithm**:

```
Input: Graph G with n nodes, vertices s and t
Work tape: current_node (log n bits), step_counter (log n bits)

1. Set current_node = s
2. Set step_counter = 0
3. Repeat:
   a. If current_node == t, ACCEPT
   b. If step_counter >= n, REJECT
   c. Nondeterministically guess next_node
   d. Verify edge (current_node, next_node) exists in G
   e. Set current_node = next_node
   f. Increment step_counter
```

**Space analysis**:
- `current_node`: $\lceil \log n \rceil$ bits
- `step_counter`: $\lceil \log n \rceil$ bits
- `next_node`: $\lceil \log n \rceil$ bits

$$\text{Total space} = 3 \lceil \log n \rceil = O(\log n) \checkmark$$

**Correctness**:
- If path exists: some nondeterministic branch follows it → accepts
- If no path exists: all branches either exceed $n$ steps or fail → reject

---

## NL-Completeness

### Log-Space Reductions

For NL-completeness, we need reductions computable in log-space:

$$A \leq_L B \text{ means: } \exists \text{ log-space computable function } f \text{ such that } x \in A \iff f(x) \in B$$

**Why log-space reductions?**

- If we used polynomial-time reductions, everything in $P$ would reduce to everything else in $P$
- Log-space reductions are "weaker" → preserve more structure
- A log-space reduction is computed by a machine with read-only input, $O(\log n)$ work space, and write-only output

### Properties of Log-Space Reductions

1. **Composition**: If $A \leq_L B$ and $B \leq_L C$, then $A \leq_L C$
2. **Closure**: If $B \in L$ and $A \leq_L B$, then $A \in L$
3. **Same for NL**: If $B \in NL$ and $A \leq_L B$, then $A \in NL$

### NL-Complete Definition

A language $B$ is **NL-complete** if:
1. $B \in NL$
2. For every $A \in NL$: $A \leq_L B$

### PATH is NL-Complete

**Theorem**: PATH is NL-complete.

**Proof sketch** (hardness):

For any $A \in NL$ decided by NTM $M$ using $O(\log n)$ space:

1. **Build configuration graph** $G_M$:
   - Nodes = configurations of $M$ on input $w$
   - Edge $(C_1, C_2)$ if $M$ can go from $C_1$ to $C_2$ in one step
   - $s$ = start configuration
   - $t$ = accept configuration

2. **Number of configurations**:
$$|\text{Configs}| = |Q| \cdot n \cdot |\Gamma|^{O(\log n)} = \text{polynomial in } n$$

3. **Key**: $w \in A \iff$ there is a path from $s$ to $t$ in $G_M$

4. **The reduction is log-space computable**: We can output edges of $G_M$ by scanning through all possible configuration pairs (only need to store two configs at a time, each $O(\log n)$ bits).

$$w \in A \iff \langle G_M, s, t \rangle \in \text{PATH}$$

---

## Other NL-Complete Problems

| Problem | Description |
|---------|-------------|
| PATH | $s$-$t$ connectivity in directed graphs |
| 2SAT | Satisfiability of 2-CNF formulas |
| Cycle detection | Does directed graph have a cycle? |
| Strongly connected | Is the graph strongly connected? |

### 2SAT is in NL

A 2SAT formula $\phi$ is satisfiable $\iff$ for no variable $x$: both $x$ and $\neg x$ are reachable from each other in the **implication graph**.

- Build implication graph: clause $(a \vee b)$ becomes edges $\neg a \to b$ and $\neg b \to a$
- $\phi$ is unsatisfiable $\iff$ $\exists x$ with path $x \to \neg x$ AND path $\neg x \to x$
- Checking reachability is in NL (it's PATH!)
- So UNSAT-2SAT $\in$ NL, meaning 2SAT $\in$ co-NL $=$ NL (by Immerman-Szelepcsényi!)

---

## The Immerman-Szelepcsényi Theorem

### Statement

$$NL = \text{co-NL}$$

Nondeterministic log-space is **closed under complement**.

### Why This is Surprising

- For NP, we don't know if $NP = \text{co-NP}$ (most believe NO)
- For NL, complement closure IS true!
- Proved independently by Immerman and Szelepcsényi in 1987

### What co-NL Means

$$\text{co-NL} = \{ L \mid \overline{L} \in NL \}$$

The complement of PATH is:

$$\overline{\text{PATH}} = \{ \langle G, s, t \rangle \mid \text{there is NO path from } s \text{ to } t \}$$

### Proof Idea

The key challenge: how do you nondeterministically verify that something does **not** exist?

**Step 1**: Count reachable nodes.

Let $c_i$ = number of nodes reachable from $s$ in at most $i$ steps.

**Inductive counting**:
- $c_0 = 1$ (only $s$ is reachable in 0 steps)
- Given $c_i$, compute $c_{i+1}$:
  - For each node $v$, nondeterministically verify if $v$ is reachable in $\leq i+1$ steps
  - Count verified nodes
  - If count equals $c_i$ plus newly reachable nodes → correct

**Step 2**: Verify non-reachability of $t$.

Once we know $c_{n-1}$ (total reachable nodes from $s$):
1. Enumerate all nodes
2. For each reachable node, nondeterministically verify reachability
3. Count verified reachable nodes (must reach exactly $c_{n-1}$)
4. Check that $t$ was never among them
5. If count correct and $t$ not seen → $t$ is unreachable → ACCEPT

**Space**: All counters and pointers fit in $O(\log n)$ space.

### Generalization

**Theorem** (Immerman-Szelepcsényi): For any $s(n) \geq \log n$:

$$\text{NSPACE}(s(n)) = \text{co-NSPACE}(s(n))$$

---

## Relationships Between Classes

### The Known Inclusions

$$L \subseteq NL \subseteq P \subseteq NP \subseteq PSPACE$$

**Proof of $NL \subseteq P$**:

An NL machine has polynomially many configurations (as shown above). We can:
1. Build the configuration graph (polynomial size)
2. Run BFS/DFS to check reachability (polynomial time, polynomial space)

$$\text{Therefore: } NL \subseteq P$$

**Proof of $L \subseteq NL$**: Trivial (deterministic is a special case of nondeterministic).

### Strictness

| Inclusion | Status |
|-----------|--------|
| $L \subseteq NL$ | Believed strict, unproven |
| $NL \subseteq P$ | Believed strict, unproven |
| $L \neq PSPACE$ | Known! (Space hierarchy theorem) |

By the space hierarchy theorem:

$$L \subsetneq PSPACE$$

So at least ONE of the inclusions $L \subseteq NL \subseteq P \subseteq PSPACE$ is strict. We just don't know which one(s)!

---

## Log-Space Hierarchy Summary

$$L \subseteq NL = \text{co-NL} \subseteq P \subseteq NP \subseteq PSPACE$$

Key facts:
- $NL = \text{co-NL}$ (Immerman-Szelepcsényi)
- $NL \subseteq P$ (configuration graph + reachability)
- $L \subsetneq PSPACE$ (hierarchy theorem)
- All other separations open!

---

## Practical Significance

### Why L Matters

Many practical algorithms are actually in $L$:
- Checking sorted order
- Counting elements
- Simple string matching
- Computing basic arithmetic

### Why NL Matters

Graph reachability (NL-complete) underlies:
- Database query evaluation
- Network routing decisions
- Constraint propagation

---

## Log-Space Transducers

A **log-space transducer** is a TM with:
- Read-only input tape
- $O(\log n)$ work tape
- Write-only output tape (unlimited)

These compute functions, not just decisions. Used for log-space reductions.

**Example**: Convert a graph to its transpose (reverse all edges):

```
For each pair (u, v) where u, v ∈ {1,...,n}:
    If edge (u,v) exists in input:
        Output edge (v,u)
```

Space: two pointers = $O(\log n)$. Output can be polynomial size.

---

## Undirected Reachability

### UPATH Problem

$$\text{UPATH} = \{ \langle G, s, t \rangle \mid G \text{ is undirected with path from } s \text{ to } t \}$$

**Theorem** (Reingold, 2004): UPATH $\in L$

This is a breakthrough result! Undirected connectivity can be decided in **deterministic** log-space.

- Uses zig-zag graph products to construct expander graphs
- Expanders have rapid mixing → random walks converge quickly
- Derandomizes the random walk approach

Contrast: Directed PATH is NL-complete (and believed to require nondeterminism in log-space).

---

## Summary Table

| Class | Definition | Complete Problem | Key Property |
|-------|-----------|-----------------|-------------|
| $L$ | Det. $O(\log n)$ space | — | Constant pointers into input |
| $NL$ | Nondet. $O(\log n)$ space | PATH | Nondeterministic reachability |
| $\text{co-NL}$ | Complement of NL | $\overline{\text{PATH}}$ | $= NL$ (Immerman-Szelepcsényi) |

---

## Exercises

### Exercise 1: Membership in L
Show that the following language is in $L$:
$$A = \{ w \in \{a, b\}^* \mid \text{number of } a\text{'s in } w \text{ is even} \}$$

*Hint*: How much space do you need to track parity?

### Exercise 2: Not in L?
Give an intuitive argument for why PALINDROME might not be in $L$ if the input tape is one-way (left-to-right only, no going back).

### Exercise 3: NL-Completeness
Show that the following problem is NL-complete:
$$\text{CYCLE} = \{ \langle G \rangle \mid G \text{ is a directed graph containing a cycle} \}$$

*Hint*: Show it's in NL, then reduce PATH to CYCLE.

### Exercise 4: Log-Space Reduction
Give a log-space reduction from:
$$\{0^k 1^k \mid k \geq 0\} \text{ to } \text{PATH}$$

### Exercise 5: Counting in NL
Explain why the following problem is in NL:
$$\text{REACH-COUNT} = \{ \langle G, s, k \rangle \mid \text{at least } k \text{ nodes are reachable from } s \text{ in } G \}$$

### Exercise 6: Space vs Time
Prove that $\text{SPACE}(f(n)) \subseteq \text{TIME}(2^{O(f(n))})$ for any $f(n) \geq \log n$.

*Hint*: Bound the number of configurations.

### Exercise 7: co-NL Application
Using the fact that $NL = \text{co-NL}$, show that the following is in NL:
$$\text{NO-PATH} = \{ \langle G, s, t \rangle \mid \text{there is no path from } s \text{ to } t \text{ in } G \}$$

---

## Configuration Graphs and Space Complexity

### Why NL ⊆ P (Detailed)

Given an NL machine $M$ on input $w$ of length $n$:

**Step 1**: Enumerate all configurations.

A configuration is: (state, head position on input, work tape content).

- States: $|Q|$ (constant)
- Head position: $n$ possibilities
- Work tape content: $|\Gamma|^{c \log n} = n^{c \log |\Gamma|}$ possibilities

$$\text{Total configurations} = |Q| \cdot n \cdot n^{c \log |\Gamma|} = O(n^k) \text{ (polynomial)}$$

**Step 2**: Build the configuration graph.

- Nodes = all configurations (polynomial many)
- Edges = valid transitions (can compute each in polynomial time)

**Step 3**: Run BFS/DFS from start configuration.

- Polynomial time on a polynomial-size graph
- Accept iff an accepting configuration is reachable

$$\text{Total time} = O(n^{2k}) = \text{polynomial} \implies NL \subseteq P \quad \checkmark$$

### Space Composition

**Theorem**: If $f$ is computable in $O(\log n)$ space and $g$ is computable in $O(\log n)$ space, then $g \circ f$ is computable in $O(\log n)$ space.

This is non-trivial! We can't just store $f(x)$ (it might be polynomial length) and then run $g$ on it.

**Solution**: Compute bits of $f(x)$ on demand:
- When $g$ needs bit $i$ of $f(x)$: recompute $f$ from scratch to get that bit
- Only need $O(\log n)$ space to track position $i$ and run $f$

This is why log-space reductions compose!

---

## Directed vs Undirected: A Key Distinction

| Problem | Complexity |
|---------|-----------|
| Directed $s$-$t$ connectivity | NL-complete |
| Undirected $s$-$t$ connectivity | In L (Reingold 2004) |

The gap between directed and undirected reachability in log-space mirrors the gap between determinism and nondeterminism:

- Undirected graphs have "symmetry" — if you can go $A \to B$, you can go $B \to A$
- This symmetry enables deterministic exploration
- Directed graphs lack this → nondeterminism seems necessary

### Random Walks on Undirected Graphs

Before Reingold's result, we knew:
- Random walks solve undirected connectivity in $O(\log n)$ space (RL)
- Cover time of undirected graphs: $O(n^3)$ steps
- Each step needs $O(\log n)$ space to track current node

Reingold's breakthrough: **derandomize** this random walk using zig-zag graph products!

---

## Key Takeaways

1. **Log-space** = constant number of pointers into the input
2. **L** captures many simple computational tasks (sorting check, counting, arithmetic)
3. **NL** captures graph reachability problems
4. **PATH** is the canonical NL-complete problem
5. **$NL = \text{co-NL}$**: nondeterministic log-space is closed under complement
6. **$NL \subseteq P$**: everything in NL is polynomial-time solvable
7. Undirected reachability is in $L$ (Reingold's theorem)
8. The relationship between $L$, $NL$, and $P$ remains one of complexity theory's mysteries

---

## What's Next?

In the next lesson, we'll explore **Approximation Algorithms** — techniques for finding near-optimal solutions to NP-hard problems in polynomial time!
