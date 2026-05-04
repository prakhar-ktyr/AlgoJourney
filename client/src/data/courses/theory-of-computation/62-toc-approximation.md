---
title: Approximation Algorithms
---

# Approximation Algorithms

We've seen that many important problems are NP-hard — unlikely to have polynomial-time exact solutions. But we still need to solve them in practice! **Approximation algorithms** offer a way: find solutions that are **provably close** to optimal in polynomial time.

---

## The Motivation

When faced with an NP-hard problem, we have several strategies:

| Strategy | Trade-off |
|----------|-----------|
| Exact algorithms | Exponential time |
| Heuristics | No quality guarantee |
| **Approximation algorithms** | **Polynomial time + quality guarantee** |
| Parameterized algorithms | Fast if parameter is small |
| Average-case algorithms | Good on "typical" inputs |

Approximation algorithms give us the best of both worlds: **efficiency** (polynomial time) with **provable guarantees** on solution quality.

---

## Approximation Ratio

### Definition

For an optimization problem, the **approximation ratio** $\rho(n)$ of an algorithm $A$ is defined as:

**For minimization problems:**

$$\frac{C}{C^*} \leq \rho(n)$$

**For maximization problems:**

$$\frac{C^*}{C} \leq \rho(n)$$

Where:
- $C$ = cost of the solution produced by algorithm $A$
- $C^*$ = cost of the optimal solution
- $n$ = input size

### Interpretation

- A **2-approximation** for minimization: our solution costs at most **twice** the optimum
- A **1.5-approximation** for maximization: our solution is at least $\frac{2}{3}$ of the optimum
- Ratio 1 = exact algorithm

> **Note**: The ratio is always $\geq 1$. Closer to 1 means better approximation.

### $\rho(n)$-Approximation Algorithm

An algorithm is a $\rho(n)$-approximation if:
1. It runs in **polynomial time**
2. For every instance, it produces a solution within factor $\rho(n)$ of optimal

---

## Vertex Cover: 2-Approximation

### The Problem

$$\text{VERTEX-COVER} = \{(G, k) \mid G \text{ has a vertex cover of size } \leq k\}$$

A **vertex cover** is a set $S \subseteq V$ such that every edge has at least one endpoint in $S$.

**Optimization version**: Find a minimum-size vertex cover.

This is NP-hard, but we can approximate it within factor 2.

### The Algorithm: APPROX-VERTEX-COVER

```
APPROX-VERTEX-COVER(G = (V, E)):
    C = ∅           // vertex cover (initially empty)
    E' = E          // remaining edges
    while E' ≠ ∅:
        Pick any edge (u, v) from E'
        Add u and v to C
        Remove all edges incident to u or v from E'
    return C
```

### Example

Consider a graph with edges: $\{(a,b), (b,c), (c,d), (d,e)\}$

```
Step 1: Pick edge (a,b). Add a, b to C. Remove (a,b), (b,c).
Step 2: Pick edge (c,d). Add c, d to C. Remove (c,d), (d,e).
Result: C = {a, b, c, d}, size 4

Optimal: {b, d}, size 2
Ratio: 4/2 = 2 ✓
```

### Proof of 2-Approximation

**Theorem**: APPROX-VERTEX-COVER is a 2-approximation algorithm.

**Proof**:

Let $A$ = set of edges picked by the algorithm (the "matching").

**Observation 1**: $|C| = 2|A|$ (we add 2 vertices per edge picked).

**Observation 2**: No two edges in $A$ share an endpoint (once we pick an edge, we remove all incident edges). So $A$ is a **matching**.

**Observation 3**: Any vertex cover must include at least one endpoint of every edge in $A$ (since $A \subseteq E$, every edge must be covered).

Therefore:

$$C^* \geq |A|$$

Combining:

$$|C| = 2|A| \leq 2 \cdot C^*$$

$$\frac{|C|}{C^*} \leq 2 \quad \checkmark$$

### Running Time

The algorithm runs in $O(|V| + |E|)$ — linear time!

### Can We Do Better?

The factor-2 approximation for Vertex Cover has been known since the 1970s. Despite decades of effort:

- No one has found a $(2 - \varepsilon)$-approximation for any $\varepsilon > 0$
- Under the **Unique Games Conjecture** (Khot, 2002): factor 2 is optimal
- This is one of the most frustrating open problems in approximation algorithms
- The gap between the best algorithm (2) and the best hardness ($1.36$, unconditional) remains wide

---

## Traveling Salesman Problem (TSP)

### TSP Definition

Given $n$ cities and distances $d(i,j)$ between them, find the shortest tour visiting all cities exactly once and returning to the start.

### General TSP: No Constant Approximation

**Theorem**: Unless $P = NP$, there is no polynomial-time $\rho$-approximation for general TSP for any constant $\rho$.

**Proof sketch**:

Suppose algorithm $A$ is a $\rho$-approximation. We'll solve Hamiltonian Path (NP-complete):

1. Given graph $G = (V, E)$, create TSP instance:
   - $d(i,j) = 1$ if $(i,j) \in E$
   - $d(i,j) = \rho \cdot n + 1$ otherwise

2. If $G$ has a Hamiltonian cycle: optimal tour cost = $n$
3. If not: any tour uses at least one "expensive" edge, cost $> \rho \cdot n$

4. A $\rho$-approximation returns tour $\leq \rho \cdot n$ only if Hamiltonian cycle exists
5. This decides HAM-CYCLE in polynomial time → contradiction!

### TSP with Triangle Inequality: 2-Approximation

When distances satisfy the **triangle inequality** ($d(i,k) \leq d(i,j) + d(j,k)$ for all $i,j,k$), we can do much better.

**Algorithm: MST-based 2-approximation**

```
TSP-APPROX(cities, d):
    1. Compute MST T of the complete graph with distances d
    2. Double every edge in T to get multigraph M (Eulerian!)
    3. Find Eulerian circuit of M
    4. Convert to Hamiltonian cycle by shortcutting repeated vertices
    return the Hamiltonian cycle
```

**Why it works**:

- Cost of MST: $\text{MST} \leq C^*$ (deleting an edge from optimal tour gives a spanning tree)
- Cost of doubled MST: $2 \cdot \text{MST} \leq 2 \cdot C^*$
- Shortcutting only decreases cost (triangle inequality!)

$$\frac{C}{C^*} \leq \frac{2 \cdot \text{MST}}{C^*} \leq 2$$

### Christofides Algorithm: 1.5-Approximation

**Improvement** (Christofides, 1976):

Instead of doubling all MST edges:
1. Find MST $T$
2. Find minimum-weight perfect matching $M$ on odd-degree vertices of $T$
3. Combine $T + M$ (Eulerian graph)
4. Find Eulerian circuit, shortcut

$$\frac{C}{C^*} \leq \frac{3}{2}$$

This was the best known approximation for metric TSP for 45 years!

---

## MAX-3SAT: Randomized 7/8-Approximation

### The Problem

Given a 3-CNF formula (each clause has exactly 3 literals), maximize the number of satisfied clauses.

### The Brilliant Simple Algorithm

```
RANDOM-3SAT(φ):
    For each variable x_i:
        Set x_i = TRUE with probability 1/2
        Set x_i = FALSE with probability 1/2
    return the assignment
```

### Analysis

For any clause $C = (l_1 \vee l_2 \vee l_3)$:

$$\Pr[C \text{ not satisfied}] = \Pr[l_1 = F] \cdot \Pr[l_2 = F] \cdot \Pr[l_3 = F] = \frac{1}{2^3} = \frac{1}{8}$$

$$\Pr[C \text{ satisfied}] = 1 - \frac{1}{8} = \frac{7}{8}$$

If the formula has $m$ clauses:

$$E[\text{satisfied clauses}] = \frac{7}{8} \cdot m \geq \frac{7}{8} \cdot C^*$$

Since $C^* \leq m$, the expected number of satisfied clauses is at least $\frac{7}{8}$ of optimal.

### Derandomization

We can derandomize using the method of **conditional expectations**:
- Set variables one by one
- For each variable, choose the value that maximizes the *conditional* expectation
- Result: deterministic $\frac{7}{8}$-approximation

### Optimality

**Theorem** (Håstad, 1997): It is NP-hard to do better than $\frac{7}{8}$ for MAX-3SAT (assuming $P \neq NP$).

The random algorithm is **optimal** (up to the approximation ratio)!

---

## Set Cover: Greedy $O(\ln n)$-Approximation

### The Problem

- Universe $U = \{1, 2, \ldots, n\}$
- Collection of subsets $S_1, S_2, \ldots, S_m \subseteq U$
- Find minimum number of subsets that cover all of $U$

### Greedy Algorithm

```
GREEDY-SET-COVER(U, S₁, ..., Sₘ):
    C = ∅       // chosen subsets
    Remaining = U
    while Remaining ≠ ∅:
        Pick S_i that covers the most uncovered elements
        Add S_i to C
        Remaining = Remaining \ S_i
    return C
```

### Approximation Guarantee

**Theorem**: GREEDY-SET-COVER achieves approximation ratio:

$$\rho = H(n) = \sum_{k=1}^{n} \frac{1}{k} = \ln n + O(1)$$

Where $H(n)$ is the $n$-th harmonic number.

**Proof sketch**: 

Assign cost $\frac{1}{|S_i \cap \text{Remaining}|}$ to each newly covered element when $S_i$ is chosen. The total cost = number of sets chosen. By a counting argument, the average cost per element is at most $H(|C^*|) \leq H(n)$ times optimal.

### Optimality

**Theorem**: Unless $P = NP$, no polynomial-time algorithm achieves ratio $(1-\varepsilon) \ln n$ for SET-COVER (for any $\varepsilon > 0$).

The greedy algorithm is essentially optimal!

---

## PTAS and FPTAS

### Polynomial-Time Approximation Scheme (PTAS)

A **PTAS** is a family of algorithms $\{A_\varepsilon\}_{\varepsilon > 0}$ where:

- $A_\varepsilon$ runs in polynomial time in $n$ (for fixed $\varepsilon$)
- $A_\varepsilon$ achieves approximation ratio $(1 + \varepsilon)$

$$\text{Running time: } O(n^{f(1/\varepsilon)}) \text{ for some function } f$$

> **Key**: For any desired accuracy $\varepsilon$, there's a polynomial-time algorithm! But the polynomial degree may depend on $\varepsilon$.

**Example**: Time $O(n^{1/\varepsilon})$ — polynomial for fixed $\varepsilon$, but impractical for small $\varepsilon$.

### Fully Polynomial-Time Approximation Scheme (FPTAS)

An **FPTAS** is a PTAS where the running time is polynomial in **both** $n$ **and** $1/\varepsilon$:

$$\text{Running time: } O\left(\text{poly}\left(n, \frac{1}{\varepsilon}\right)\right)$$

**Example**: Time $O(n^2 / \varepsilon)$ — truly efficient even for small $\varepsilon$.

### Hierarchy of Approximability

$$\text{FPTAS} \subset \text{PTAS} \subset \text{APX (constant ratio)} \subset \text{NPO (all NP optimization)}$$

### KNAPSACK Has an FPTAS

**0/1 Knapsack**: Items with weights $w_i$ and values $v_i$, capacity $W$. Maximize total value.

**FPTAS idea**:
1. Round/scale values: $\hat{v}_i = \lfloor v_i \cdot \frac{n}{\varepsilon \cdot v_{\max}} \rfloor$
2. Solve the rounded instance exactly using dynamic programming
3. DP table size is polynomial in $n$ and $1/\varepsilon$

**Running time**: $O(n^3 / \varepsilon)$

**Approximation ratio**: $(1 + \varepsilon)$ for any $\varepsilon > 0$

---

## Inapproximability

### The Big Question

Can every NP-hard problem be well-approximated?

**Answer: NO!**

### The PCP Theorem

**Theorem** (PCP Theorem, Arora-Safra et al., 1992):

$$NP = PCP(O(\log n), O(1))$$

Every NP proof can be verified by reading only $O(1)$ randomly chosen bits!

### Implications for Inapproximability

The PCP theorem implies strong **lower bounds** on approximation:

| Problem | Best Ratio | Inapproximability |
|---------|-----------|-------------------|
| MAX-3SAT | 7/8 | Cannot beat 7/8 |
| SET-COVER | $\ln n$ | Cannot beat $(1-\varepsilon) \ln n$ |
| CLIQUE | $O(n^{1-\varepsilon})$ | Cannot beat $n^{1-\varepsilon}$ |
| Chromatic number | $O(n^{1-\varepsilon})$ | Cannot beat $n^{1-\varepsilon}$ |
| General TSP | None | No constant ratio exists |

### The Gap-Producing Reduction

The PCP theorem works by creating a "gap":
- YES instances have value $\geq c$
- NO instances have value $\leq s < c$
- Distinguishing these is NP-hard
- Any algorithm beating ratio $c/s$ would distinguish them

---

## Approximation Algorithm Design Techniques

### 1. Greedy Algorithms
- Pick locally optimal choice at each step
- Example: Set Cover greedy

### 2. Relaxation and Rounding
- Relax integer program to linear program
- Solve LP in polynomial time
- Round fractional solution to integers
- Example: Weighted Vertex Cover via LP rounding

### 3. Primal-Dual Method
- Simultaneously build primal and dual LP solutions
- Use complementary slackness
- Example: Steiner Tree, facility location

### 4. Local Search
- Start with any feasible solution
- Iteratively improve by local modifications
- Example: K-median local search (constant factor)

### 5. Semidefinite Programming (SDP)
- Relax to SDP, round using random hyperplane
- Example: MAX-CUT (Goemans-Williamson 0.878-approximation)

---

## MAX-CUT: 0.878-Approximation

### The Problem

Given graph $G = (V, E)$, partition $V$ into $S$ and $\bar{S}$ to maximize edges between $S$ and $\bar{S}$.

### Simple Randomized: 1/2-Approximation

Assign each vertex to $S$ or $\bar{S}$ with probability 1/2:

$$E[\text{cut edges}] = \frac{|E|}{2} \geq \frac{C^*}{2}$$

### Goemans-Williamson (1994): 0.878-Approximation

Uses **semidefinite programming** + random hyperplane rounding:

$$\frac{C}{C^*} \geq 0.87856\ldots = \min_{0 \leq \theta \leq \pi} \frac{\theta/\pi}{(1-\cos\theta)/2}$$

This is optimal assuming the Unique Games Conjecture!

---

## Summary of Approximation Results

| Problem | Type | Best Known Ratio | Hardness |
|---------|------|-----------------|----------|
| VERTEX-COVER | Min | 2 | $2 - \varepsilon$ is NP-hard (UGC) |
| TSP (metric) | Min | 1.5 (Christofides) | Better than this is open |
| MAX-3SAT | Max | 7/8 | 7/8 is optimal |
| SET-COVER | Min | $H(n) \approx \ln n$ | $(1-\varepsilon)\ln n$ NP-hard |
| KNAPSACK | Max | FPTAS | — |
| MAX-CUT | Max | 0.878 | $0.878+\varepsilon$ NP-hard (UGC) |
| CLIQUE | Max | $O(n/\log^2 n)$ | $n^{1-\varepsilon}$ NP-hard |

---

## Exercises

### Exercise 1: Approximation Ratio
A minimization algorithm returns a solution of cost 15 when the optimal is 5. What is the approximation ratio for this instance?

### Exercise 2: Vertex Cover Analysis
Run APPROX-VERTEX-COVER on the following graph and determine the approximation ratio achieved:
- $V = \{a, b, c, d, e\}$
- $E = \{(a,b), (a,c), (b,c), (c,d), (d,e)\}$

### Exercise 3: TSP Triangle Inequality
Prove that if distances satisfy the triangle inequality, then the cost of shortcutting a tour never increases.

### Exercise 4: MAX-2SAT
What approximation ratio does random assignment achieve for MAX-2SAT (clauses with exactly 2 literals)?

### Exercise 5: No FPTAS
Explain why the existence of an FPTAS for a strongly NP-hard problem would imply $P = NP$.

### Exercise 6: Greedy Set Cover
Apply the greedy set cover algorithm to:
- $U = \{1, 2, 3, 4, 5, 6\}$
- $S_1 = \{1, 2, 3\}$, $S_2 = \{2, 4, 5\}$, $S_3 = \{3, 5, 6\}$, $S_4 = \{1, 4, 6\}$

What is the ratio achieved vs. optimal?

### Exercise 7: PTAS vs FPTAS
Explain the practical difference between a PTAS with running time $O(n^{1/\varepsilon})$ and an FPTAS with running time $O(n^2/\varepsilon)$ when $\varepsilon = 0.01$.

---

## LP Relaxation and Rounding: Weighted Vertex Cover

### The Technique

Many combinatorial optimization problems can be written as **Integer Linear Programs** (ILP). The key idea:

1. **Formulate** the problem as an ILP
2. **Relax** integrality constraints ($x_i \in \{0,1\}$ → $0 \leq x_i \leq 1$)
3. **Solve** the LP relaxation in polynomial time
4. **Round** the fractional solution to an integer solution

### Weighted Vertex Cover via LP

**ILP formulation**:

$$\min \sum_{v \in V} w_v \cdot x_v$$
$$\text{subject to: } x_u + x_v \geq 1 \quad \forall (u,v) \in E$$
$$x_v \in \{0, 1\} \quad \forall v \in V$$

**LP relaxation**: Replace $x_v \in \{0,1\}$ with $0 \leq x_v \leq 1$.

**Rounding**: Set $x_v = 1$ if LP value $\geq 1/2$, else $x_v = 0$.

**Why it's a valid cover**: If $(u,v) \in E$, then $x_u^* + x_v^* \geq 1$ in the LP, so at least one has value $\geq 1/2$ → at least one is rounded to 1.

**Approximation ratio**: $\leq 2$ (each vertex with LP value $\geq 1/2$ costs at most twice its LP contribution).

---

## Key Takeaways

1. Approximation algorithms provide **guaranteed near-optimal** solutions in polynomial time
2. The **approximation ratio** measures worst-case quality relative to optimum
3. **Vertex Cover** has a simple 2-approximation; improving to $2-\varepsilon$ is a major open problem
4. **General TSP** cannot be approximated; metric TSP has a 1.5-approximation
5. **MAX-3SAT** random assignment gives optimal 7/8-approximation
6. **FPTAS** is the gold standard: polynomial in both $n$ and $1/\varepsilon$
7. The **PCP theorem** proves fundamental limits on approximation
8. Not all NP-hard problems are equally hard to approximate!

---

## What's Next?

In the next lesson, we'll study **Randomized Complexity** — how random coin flips can help computation, and the complexity classes BPP, RP, and ZPP!
