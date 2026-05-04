---
title: NP-Complete Problems
---

# NP-Complete Problems

Now that the Cook-Levin Theorem has established SAT and 3SAT as NP-complete, we can prove many other important problems are NP-complete by **reducing from** known NP-complete problems. This lesson covers the classic NP-complete problems and the reductions connecting them.

---

## The Reduction Strategy

To prove a problem $B$ is NP-complete:

1. **Show $B \in NP$:** Exhibit a polynomial-time verifier (or equivalent NTM)
2. **Pick a known NP-complete problem $A$** (often 3SAT)
3. **Show $A \leq_P B$:** Construct a polynomial-time reduction from $A$ to $B$

For step 3, remember the direction: reduce **FROM** the known hard problem **TO** the new problem. This shows the new problem is at least as hard.

```
Known NP-complete A  ──reduction──>  New problem B
(if you can solve B, you can solve A, so B is hard)
```

---

## CLIQUE

### Problem Definition

**CLIQUE:**
- **Input:** An undirected graph $G = (V, E)$ and a positive integer $k$
- **Question:** Does $G$ contain a **clique** of size $k$?

A **clique** is a subset $S \subseteq V$ where every pair of vertices in $S$ is connected by an edge:

$$\forall u, v \in S, u \neq v: \{u, v\} \in E$$

### Example

```
    1 --- 2
    |   / |
    |  /  |
    | /   |
    3 --- 4
```

Vertices $\{1, 2, 3\}$ form a 3-clique (triangle) since all pairs are connected.

---

### CLIQUE ∈ NP

**Certificate:** A set $S$ of $k$ vertices.

**Verifier:**
1. Check $|S| = k$ → $O(1)$
2. For each pair $(u, v)$ in $S$, check $\{u, v\} \in E$ → $O(k^2)$ checks

Total time: $O(k^2) \leq O(n^2)$. Polynomial. ✓

---

### 3SAT $\leq_P$ CLIQUE

**Reduction:** Given a 3SAT formula $\phi$ with $m$ clauses:

$$\phi = C_1 \land C_2 \land \cdots \land C_m$$

where each $C_j = (l_1^j \lor l_2^j \lor l_3^j)$.

**Construct graph $G = (V, E)$:**

**Vertices:** For each literal in each clause, create a vertex. So we have vertices organized in **groups** (one group per clause):

$$V = \{v_i^j : 1 \leq j \leq m, 1 \leq i \leq 3\}$$

Vertex $v_i^j$ represents the $i$-th literal in clause $C_j$.

**Edges:** Connect $v_i^j$ to $v_k^l$ if and only if:
1. $j \neq l$ (they are in **different** clauses), AND
2. $l_i^j \neq \neg l_k^l$ (they are **not contradictory** — we don't connect $x$ to $\neg x$)

**Set $k = m$** (number of clauses).

---

### Correctness Proof

**Claim:** $\phi$ is satisfiable $\iff$ $G$ has an $m$-clique.

**($\Rightarrow$):** Suppose $\phi$ is satisfiable under assignment $\sigma$. In each clause $C_j$, at least one literal is TRUE under $\sigma$. Pick one such literal $l_{i_j}^j$ from each clause. The corresponding vertices $\{v_{i_1}^1, v_{i_2}^2, \ldots, v_{i_m}^m\}$ form an $m$-clique:

- They are from different clauses (condition 1 met)
- They are all TRUE under $\sigma$, so no two are contradictory (you can't have both $x_i$ and $\neg x_i$ be TRUE). Condition 2 met.

**($\Leftarrow$):** Suppose $G$ has an $m$-clique $S = \{v_{i_1}^1, v_{i_2}^2, \ldots, v_{i_m}^m\}$. Since clique vertices from different groups are connected, they represent non-contradictory literals. Set these literals to TRUE (and assign remaining variables arbitrarily without contradiction). Each clause has at least one TRUE literal (the one selected), so $\phi$ is satisfied.

---

### Polynomial Time

- $|V| = 3m$ vertices
- $|E| \leq O(m^2)$ edges
- Construction takes $O(m^2)$ time

This is polynomial in the size of $\phi$. ✓

---

## VERTEX-COVER

### Problem Definition

**VERTEX-COVER:**
- **Input:** An undirected graph $G = (V, E)$ and a positive integer $k$
- **Question:** Does $G$ have a **vertex cover** of size $k$?

A **vertex cover** is a set $S \subseteq V$ such that every edge has at least one endpoint in $S$:

$$\forall \{u, v\} \in E: u \in S \lor v \in S$$

---

### VERTEX-COVER ∈ NP

**Certificate:** A set $S$ of $k$ vertices.

**Verifier:** Check that every edge has at least one endpoint in $S$. Time: $O(|E| \cdot k)$. ✓

---

### CLIQUE $\leq_P$ VERTEX-COVER

This reduction uses the **complement graph**. The complement $\bar{G} = (V, \bar{E})$ has an edge between $u$ and $v$ iff the original graph does NOT:

$$\{u, v\} \in \bar{E} \iff \{u, v\} \notin E$$

**Key Theorem:**

> $G$ has a $k$-clique $\iff$ $\bar{G}$ has a vertex cover of size $n - k$ (where $n = |V|$).

**Proof ($\Rightarrow$):** Let $S$ be a $k$-clique in $G$. We claim $V \setminus S$ is a vertex cover in $\bar{G}$.

Take any edge $\{u, v\} \in \bar{E}$. Then $\{u, v\} \notin E$, so $u$ and $v$ are NOT both in $S$ (since $S$ is a clique in $G$). Hence at least one of $u, v$ is in $V \setminus S$. ✓

**Proof ($\Leftarrow$):** Let $T$ be a vertex cover of size $n - k$ in $\bar{G}$. We claim $V \setminus T$ is a $k$-clique in $G$.

Take any $u, v \in V \setminus T$. If $\{u, v\} \notin E$, then $\{u, v\} \in \bar{E}$. But $T$ is a vertex cover of $\bar{G}$, so at least one of $u, v$ must be in $T$. Contradiction. So $\{u, v\} \in E$. ✓

**Reduction:** Given $(G, k)$, output $(\bar{G}, n - k)$.

- Polynomial time: computing complement takes $O(n^2)$. ✓

---

## INDEPENDENT-SET

### Problem Definition

**INDEPENDENT-SET:**
- **Input:** An undirected graph $G = (V, E)$ and a positive integer $k$
- **Question:** Does $G$ have an **independent set** of size $k$?

An **independent set** is a set $S \subseteq V$ with **no edges** between any two vertices in $S$:

$$\forall u, v \in S: \{u, v\} \notin E$$

---

### Relationship to CLIQUE

> $S$ is an independent set in $G$ $\iff$ $S$ is a clique in $\bar{G}$

**Reduction from CLIQUE:** Given $(G, k)$, output $(\bar{G}, k)$.

$G$ has a $k$-clique $\iff$ $\bar{G}$ has a $k$-independent-set.

---

### Relationship to VERTEX-COVER

> $S$ is a vertex cover in $G$ $\iff$ $V \setminus S$ is an independent set in $G$

**Proof:** $S$ is a vertex cover $\iff$ every edge has an endpoint in $S$ $\iff$ no edge has both endpoints in $V \setminus S$ $\iff$ $V \setminus S$ is an independent set.

**Reduction:** Given $(G, k)$ for INDEPENDENT-SET, output $(G, n - k)$ for VERTEX-COVER.

$G$ has $k$-independent-set $\iff$ $G$ has $(n-k)$-vertex-cover.

---

## SUBSET-SUM

### Problem Definition

**SUBSET-SUM:**
- **Input:** A finite set $S = \{s_1, s_2, \ldots, s_n\}$ of positive integers and a target $t$
- **Question:** Is there a subset $T \subseteq S$ such that $\sum_{s \in T} s = t$?

---

### SUBSET-SUM ∈ NP

**Certificate:** The subset $T$.

**Verifier:** Check that $T \subseteq S$ and sum elements of $T$. Time: $O(n)$. ✓

---

### 3SAT $\leq_P$ SUBSET-SUM

**Given:** 3SAT formula $\phi$ with variables $x_1, \ldots, x_n$ and clauses $C_1, \ldots, C_m$.

**Construct:** A set of integers and a target $t$ (all numbers in base 10 with $n + m$ digits).

**Digit positions:** Digits $1, \ldots, n$ correspond to variables; digits $n+1, \ldots, n+m$ correspond to clauses.

**Numbers created:**

For each variable $x_i$, create two numbers $y_i$ (for TRUE) and $z_i$ (for FALSE):
- $y_i$ has digit 1 in position $i$, and digit 1 in position $n + j$ for each clause $C_j$ containing literal $x_i$
- $z_i$ has digit 1 in position $i$, and digit 1 in position $n + j$ for each clause $C_j$ containing literal $\neg x_i$

For each clause $C_j$, create two "slack" numbers $g_j$ and $h_j$:
- $g_j$ has digit 1 only in position $n + j$
- $h_j$ has digit 1 only in position $n + j$

**Target $t$:** Digit 1 in positions $1, \ldots, n$ and digit 3 in positions $n+1, \ldots, n+m$.

**Why it works:**
- Exactly one of $y_i, z_i$ is chosen (corresponding to setting $x_i$ to T or F) — forced by target having 1 in variable positions
- Each clause position must sum to 3: the literals contribute 1-3, and slack variables make up the difference

This construction ensures $\phi$ satisfiable $\iff$ subset sums to $t$. Numbers have $n + m$ digits, so the construction is polynomial.

---

## HAMILTONIAN PATH

### Problem Definition

**HAM-PATH:**
- **Input:** A directed graph $G = (V, E)$ and vertices $s, t \in V$
- **Question:** Is there a **Hamiltonian path** from $s$ to $t$ (a path visiting every vertex exactly once)?

---

### HAM-PATH ∈ NP

**Certificate:** An ordering of vertices $v_1, v_2, \ldots, v_n$ with $v_1 = s$ and $v_n = t$.

**Verifier:** Check all $v_i$ are distinct, $v_1 = s$, $v_n = t$, and $(v_i, v_{i+1}) \in E$ for all $i$. Time: $O(n)$. ✓

---

### 3SAT $\leq_P$ HAM-PATH (Sketch)

This reduction uses elaborate **gadget constructions**:

**Variable gadgets:** For each variable $x_i$, create a "diamond" structure — a path that can be traversed left-to-right (representing $x_i = T$) or right-to-left (representing $x_i = F$).

**Clause gadgets:** For each clause $C_j$, create a special node that must be visited.

**Connections:** The clause node for $C_j$ is accessible from the variable gadget of $x_i$ only via the direction corresponding to the literal that satisfies $C_j$.

The construction ensures a Hamiltonian path exists iff $\phi$ is satisfiable.

---

## 3-COLORING

### Problem Definition

**3-COLORING:**
- **Input:** An undirected graph $G = (V, E)$
- **Question:** Can the vertices be colored with 3 colors such that no two adjacent vertices share the same color?

Formally: Is there $c: V \to \{1, 2, 3\}$ such that $\{u, v\} \in E \implies c(u) \neq c(v)$?

---

### 3-COLORING ∈ NP

**Certificate:** A coloring function $c$.

**Verifier:** Check each edge has different-colored endpoints. Time: $O(|E|)$. ✓

---

### 3SAT $\leq_P$ 3-COLORING (Sketch)

**Gadgets:**

1. **Palette triangle:** Three special vertices $T$, $F$, $B$ (True, False, Base) forming a triangle. They must receive all three colors.

2. **Variable gadgets:** For each $x_i$, create vertex $v_i$ (connected to $B$). Its complement $\bar{v}_i$ is also connected to $B$ and to $v_i$ via a triangle. This forces $v_i$ and $\bar{v}_i$ to take colors $T$ and $F$ (in some order).

3. **Clause gadgets:** For each clause $(l_1 \lor l_2 \lor l_3)$, create an "OR-gadget" subgraph that is 3-colorable iff at least one of $l_1, l_2, l_3$ has color $T$.

The complete graph is 3-colorable iff $\phi$ is satisfiable.

---

## Summary Table of Classic NP-Complete Problems

| Problem | Input | Question | Reduced from |
|---------|-------|----------|-------------|
| SAT | Boolean formula $\phi$ | Is $\phi$ satisfiable? | All of NP (Cook-Levin) |
| 3SAT | 3-CNF formula | Is $\phi$ satisfiable? | SAT |
| CLIQUE | Graph $G$, integer $k$ | Does $G$ have $k$-clique? | 3SAT |
| VERTEX-COVER | Graph $G$, integer $k$ | Does $G$ have $k$-cover? | CLIQUE |
| INDEPENDENT-SET | Graph $G$, integer $k$ | Does $G$ have $k$-ind-set? | CLIQUE |
| SUBSET-SUM | Set $S$, target $t$ | Subset summing to $t$? | 3SAT |
| HAM-PATH | Directed graph, $s, t$ | Ham. path from $s$ to $t$? | 3SAT |
| 3-COLORING | Graph $G$ | Is $G$ 3-colorable? | 3SAT |
| HAM-CYCLE | Graph $G$ | Hamiltonian cycle? | HAM-PATH |
| TSP | Weighted graph, bound $k$ | Tour of cost $\leq k$? | HAM-CYCLE |

---

## The NP-Completeness Web of Reductions

The known reductions form a directed graph:

```
                    SAT
                     |
                   3SAT
                  / | \ \
                /   |   \ \
           CLIQUE  HAM  SUBSET  3-COLOR
            / \    PATH   SUM
           /   \    |
      VERTEX  IND  HAM
      COVER   SET  CYCLE
                     |
                    TSP
```

Every NP-complete problem can reach every other through a chain of polynomial reductions. Proving a new problem NP-complete only requires one reduction from any known NP-complete problem.

---

## Understanding Reduction Direction

A common source of confusion: which way does the reduction go?

### The Rule

To prove $B$ is NP-hard: reduce a **known** NP-complete problem **TO** $B$.

$$\text{Known NP-complete } A \leq_P B$$

### Why This Direction?

$A \leq_P B$ means: "If I had a solver for $B$, I could solve $A$."

Since $A$ is NP-complete (as hard as anything in NP), being able to solve $A$ means being able to solve everything in NP. So if $B$ can solve $A$, then $B$ can solve everything in NP → $B$ is NP-hard.

### The Wrong Direction

$B \leq_P A$ means: "If I had a solver for $A$ (a known hard problem), I could solve $B$."

This only shows $B$ is **no harder** than $A$. Since $A \in NP$, this just confirms $B \in NP$ — not helpful for proving hardness!

---

## Practical Impact of NP-Completeness

When you prove your problem is NP-complete:

1. **Stop looking for efficient exact algorithms** (unless you believe $P = NP$)
2. **Consider approximation algorithms:** Approximate the optimum within a guaranteed factor
3. **Consider parameterized algorithms:** Efficient when a parameter is small (e.g., $O(2^k \cdot n)$ for VERTEX-COVER with parameter $k$)
4. **Use heuristics:** SAT solvers, genetic algorithms, simulated annealing
5. **Exploit special structure:** Many NP-complete problems become polynomial on restricted inputs (e.g., 2-COLORING is in P, 3-COLORING is NP-complete)

---

## Common Patterns in NP-Completeness Proofs

### From 3SAT (Most Common Source)

| Target Problem | Key Technique |
|---------------|---------------|
| CLIQUE | Vertices = literals, edges = non-contradictory pairs |
| 3-COLORING | Gadgets: palette triangle + OR-gadget |
| SUBSET-SUM | Number encoding with digit positions |
| HAM-PATH | Diamond gadgets for variables |

### Between Graph Problems

| Reduction | Technique |
|-----------|-----------|
| CLIQUE → VERTEX-COVER | Complement graph |
| CLIQUE → INDEPENDENT-SET | Complement graph |
| HAM-PATH → HAM-CYCLE | Add extra vertex |
| HAM-CYCLE → TSP | Weight 1 for edges, weight 2 for non-edges |

---

## Exercises

### Exercise 1: CLIQUE Reduction Example

Given the 3SAT formula:

$$\phi = (x_1 \lor \neg x_2 \lor x_3) \land (\neg x_1 \lor x_2 \lor x_3)$$

Construct the graph for the CLIQUE reduction and identify the 2-clique.

<details>
<summary>Solution</summary>

**Vertices:** Group 1: $v_1^1(x_1)$, $v_2^1(\neg x_2)$, $v_3^1(x_3)$. Group 2: $v_1^2(\neg x_1)$, $v_2^2(x_2)$, $v_3^2(x_3)$.

**Edges** (between groups, non-contradictory):
- $v_1^1(x_1)$ — $v_2^2(x_2)$: different groups, not contradictory ✓
- $v_1^1(x_1)$ — $v_3^2(x_3)$: ✓
- $v_1^1(x_1)$ — $v_1^2(\neg x_1)$: contradictory! ✗
- $v_2^1(\neg x_2)$ — $v_1^2(\neg x_1)$: ✓
- $v_2^1(\neg x_2)$ — $v_2^2(x_2)$: contradictory! ✗
- $v_2^1(\neg x_2)$ — $v_3^2(x_3)$: ✓
- $v_3^1(x_3)$ — $v_1^2(\neg x_1)$: ✓
- $v_3^1(x_3)$ — $v_2^2(x_2)$: ✓
- $v_3^1(x_3)$ — $v_3^2(x_3)$: same variable, same literal ✓

Many 2-cliques exist, e.g., $\{v_3^1(x_3), v_3^2(x_3)\}$. This corresponds to setting $x_3 = T$, which satisfies both clauses.
</details>

### Exercise 2: Complement Graph

If $G$ has 5 vertices and 4 edges, how many edges does $\bar{G}$ have?

<details>
<summary>Solution</summary>

A complete graph on 5 vertices has $\binom{5}{2} = 10$ edges. The complement has $10 - 4 = 6$ edges.

In general, $|\bar{E}| = \binom{n}{2} - |E|$.
</details>

### Exercise 3: Verify NP-Completeness Steps

For the PARTITION problem (given a set $S$ of integers, can it be split into two subsets with equal sum?), outline the two steps needed to prove NP-completeness.

<details>
<summary>Solution</summary>

**Step 1: PARTITION ∈ NP.**
Certificate: one of the two subsets $T$. Verifier: check $\sum_{s \in T} s = \sum_{s \in S \setminus T} s$, i.e., $\sum_{s \in T} s = \frac{1}{2}\sum_{s \in S} s$. Polynomial time.

**Step 2: Reduce SUBSET-SUM to PARTITION.**
Given SUBSET-SUM instance $(S, t)$ with $\sum S = \sigma$:
- Add two elements: $\sigma - 2t + 1$ and $1$ (or use another standard construction)
- Or: add elements to make the total sum $2t$, then PARTITION = finding subset summing to $t$

The standard reduction constructs a set whose total is $2t$ so that equal partition ↔ subset summing to $t$.
</details>

### Exercise 4: Why Not Reduce the Other Way?

Why can't we prove CLIQUE is NP-complete by reducing CLIQUE to 3SAT?

<details>
<summary>Solution</summary>

Reducing CLIQUE to 3SAT shows $\text{CLIQUE} \leq_P \text{3SAT}$, meaning "CLIQUE is no harder than 3SAT." This only tells us CLIQUE is in NP (which we already know). It does NOT show CLIQUE is NP-hard.

To show CLIQUE is NP-hard, we need $\text{3SAT} \leq_P \text{CLIQUE}$: if you can solve CLIQUE, you can solve 3SAT (and hence all of NP).
</details>

### Exercise 5: Dominating Set

**DOMINATING-SET:** Given graph $G = (V, E)$ and integer $k$, is there a set $D \subseteq V$ with $|D| \leq k$ such that every vertex is either in $D$ or adjacent to a vertex in $D$?

Prove DOMINATING-SET is in NP.

<details>
<summary>Solution</summary>

**Certificate:** The set $D$.

**Verifier:**
1. Check $|D| \leq k$
2. For each vertex $v \in V$: check if $v \in D$ or if there exists $u \in D$ with $\{u, v\} \in E$

Time: $O(n \cdot k)$ which is $O(n^2)$. Polynomial. ✓

Therefore DOMINATING-SET ∈ NP. (It is also NP-complete, via reduction from VERTEX-COVER, but the reduction is more involved.)
</details>

### Exercise 6: Transitivity Application

Given that 3SAT is NP-complete and 3SAT $\leq_P$ CLIQUE $\leq_P$ VERTEX-COVER, prove VERTEX-COVER is NP-hard.

<details>
<summary>Solution</summary>

For any $A \in NP$: since 3SAT is NP-complete, $A \leq_P \text{3SAT}$.

By transitivity: $A \leq_P \text{3SAT} \leq_P \text{CLIQUE} \leq_P \text{VERTEX-COVER}$.

So $A \leq_P \text{VERTEX-COVER}$ for all $A \in NP$, meaning VERTEX-COVER is NP-hard. ∎
</details>

---

## What's Next?

In the next lesson, we'll practice the **art of polynomial reduction** — learning gadget design, common techniques, and working through detailed reductions step by step.
