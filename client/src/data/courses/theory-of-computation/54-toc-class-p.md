---
title: The Class P
---

# The Class P

In this lesson, you will learn about **P** — the class of problems solvable in polynomial time. This is one of the most important classes in all of computer science, representing what we consider "efficiently solvable."

---

## Definition of P

**Definition**:

$$
P = \bigcup_{k \geq 0} \text{TIME}(n^k)
$$

In words: $P$ is the class of all languages decidable by a deterministic Turing machine in polynomial time.

A language $L$ is in $P$ if there exists a TM $M$ and a constant $k$ such that:

1. $M$ decides $L$ (correct on all inputs)
2. $M$ runs in time $O(n^k)$ on inputs of length $n$

---

## Why P Is Important

### 1. Robustness

$P$ is the same class regardless of which **deterministic** model you use:

- Single-tape TM
- Multi-tape TM
- RAM (Random Access Machine)
- Any "reasonable" deterministic model

This is because all these models can simulate each other with at most polynomial overhead.

$$
\text{Multi-tape } O(t(n)) \to \text{Single-tape } O(t(n)^2)
$$

Polynomial of polynomial = polynomial. So $P$ is **model-independent**.

### 2. Closure Under Composition

If algorithm $A$ runs in polynomial time and calls subroutine $B$ (also polynomial time) polynomially many times, the result is still polynomial:

$$
O(n^j) \text{ calls to an } O(n^k) \text{ subroutine} = O(n^{j+k}) = \text{polynomial}
$$

This means polynomial-time algorithms can be **composed** freely.

### 3. Corresponds to "Practical"

While $O(n^{100})$ is technically polynomial, in practice:

- Most natural polynomial algorithms are $O(n)$, $O(n^2)$, or $O(n^3)$
- Polynomial algorithms are typically **improvable** — once you find one, you can usually optimize
- No exponential algorithm is practical for large $n$

---

## Problems in P: Examples

### Example 1: PATH

**Problem**: Given a directed graph $G$ and vertices $s, t$, is there a path from $s$ to $t$?

$$
PATH = \{\langle G, s, t \rangle \mid G \text{ has a directed path from } s \text{ to } t\}
$$

**Algorithm**: Breadth-First Search (BFS)

1. Mark $s$
2. Repeat until no change:
   - For each marked vertex $u$:
     - For each edge $(u, v)$: mark $v$
3. Accept if $t$ is marked

**Time**: $O(V + E)$ where $V$ = vertices, $E$ = edges. Since $E \leq V^2$, this is $O(n^2)$ in terms of input length.

$$
PATH \in P
$$

### Example 2: RELPRIME

**Problem**: Given integers $x$ and $y$, is $\gcd(x, y) = 1$?

$$
RELPRIME = \{\langle x, y \rangle \mid \gcd(x, y) = 1\}
$$

**Algorithm**: Euclidean Algorithm

```
GCD(x, y):
  if y = 0: return x
  else: return GCD(y, x mod y)
```

**Time**: Each step reduces the numbers by at least half. If $x$ and $y$ are encoded in $n$ bits:

$$
O(\log(\min(x, y))) = O(n) \text{ iterations, each involving } O(n^2) \text{ division}
$$

Total: $O(n^2)$ (or $O(n \cdot \log^2 n)$ with fast arithmetic).

$$
RELPRIME \in P
$$

### Example 3: Every Context-Free Language

**Theorem**: Every context-free language is in $P$.

**Algorithm**: CYK (Cocke-Younger-Kasami) algorithm

Given a CFG $G$ in Chomsky Normal Form and string $w$ of length $n$:

1. Build a dynamic programming table $T[i][j]$ = set of variables that generate $w_i \cdots w_j$
2. Fill bottom-up: substrings of length 1, then 2, ..., then $n$
3. Accept if start variable $S \in T[1][n]$

**Time**: $O(n^3 \cdot |G|)$. Since $|G|$ is constant for a fixed grammar:

$$
\text{Every CFL} \in \text{TIME}(n^3) \subseteq P
$$

### Example 4: PRIMES

**Problem**: Given integer $n$, is $n$ prime?

$$
PRIMES = \{\langle n \rangle \mid n \text{ is a prime number}\}
$$

**History**:

- Trial division: $O(\sqrt{n}) = O(2^{n/2})$ — exponential in input length!
- Miller-Rabin (1980): polynomial but **randomized**
- AKS (2002): deterministic polynomial time! $O(\log^{12} n)$

$$
PRIMES \in P \quad \text{(Agrawal, Kayal, Saxena, 2002)}
$$

This was a major breakthrough — primality testing was open for decades.

### Example 5: 2SAT

**Problem**: Given a Boolean formula in CNF with at most 2 literals per clause, is it satisfiable?

$$
2SAT = \{\langle \varphi \rangle \mid \varphi \text{ is a satisfiable 2-CNF formula}\}
$$

**Algorithm**: Implication graph + strongly connected components

1. Build implication graph: for each clause $(a \vee b)$, add edges $\neg a \to b$ and $\neg b \to a$
2. Find strongly connected components (SCCs)
3. Satisfiable iff no variable $x$ is in the same SCC as $\neg x$

**Time**: $O(V + E) = O(n + m)$ where $n$ = variables, $m$ = clauses.

$$
2SAT \in P
$$

### Example 6: 2-COLORING (Bipartiteness)

**Problem**: Given graph $G$, can vertices be colored with 2 colors such that no edge connects same-color vertices?

$$
2\text{-}COLORING = \{\langle G \rangle \mid G \text{ is 2-colorable}\}
$$

**Algorithm**: BFS-based coloring

1. Pick any uncolored vertex, color it RED
2. BFS: color all neighbors BLUE, their neighbors RED, etc.
3. If any edge connects same-color vertices: reject
4. Repeat for each connected component
5. Accept if no conflict found

**Time**: $O(V + E)$

$$
2\text{-}COLORING \in P
$$

**Note**: A graph is 2-colorable iff it is **bipartite** (no odd cycles).

### Example 7: MATCHING

**Problem**: Given a graph $G$, find a maximum matching (largest set of edges with no shared vertices).

**Algorithms**:

- Hopcroft-Karp (bipartite): $O(E\sqrt{V})$
- Edmonds' Blossom (general): $O(V^3)$

$$
MATCHING \in P
$$

### Example 8: Linear Programming

**Problem**: Given linear constraints $Ax \leq b$ and objective $c^T x$, find the maximum.

**Algorithms**:

- Simplex method: exponential worst-case, but fast in practice
- Ellipsoid method (Khachiyan, 1979): $O(n^6)$ — first polynomial algorithm
- Interior point methods (Karmarkar, 1984): $O(n^{3.5})$

$$
LP \in P
$$

---

## Problems NOT Known to Be in P

Here are natural problems with no known polynomial algorithm:

| Problem | Description | Best Known |
|---|---|---|
| CLIQUE | Does graph have a $k$-clique? | $O(n^k)$ for fixed $k$; $O(2^n)$ general |
| HAM-PATH | Is there a Hamiltonian path? | $O(2^n \cdot n^2)$ |
| SAT | Is a Boolean formula satisfiable? | $O(2^n)$ |
| 3-COLORING | Is graph 3-colorable? | $O(2^n)$ |
| TSP | Shortest tour visiting all cities? | $O(2^n \cdot n^2)$ |
| SUBSET-SUM | Is there a subset summing to target? | $O(2^{n/2})$ |
| FACTORING | Find prime factors of $n$ | Sub-exponential but not polynomial |

These are all believed to be **outside** $P$, but nobody has proven it!

---

## What Makes P Problems "Easy"?

Problems in $P$ typically have one or more of:

1. **Greedy structure**: locally optimal choices lead to globally optimal solutions
2. **Dynamic programming**: overlapping subproblems that can be cached
3. **Graph structure**: BFS/DFS-based approaches work
4. **Algebraic structure**: number-theoretic properties enable shortcuts
5. **Divide and conquer**: problem splits into independent subproblems

Problems NOT in P (as far as we know) seem to require **exhaustive search** — checking exponentially many possibilities.

---

## Encoding Matters!

The complexity class depends on how the input is encoded.

### Example: SUBSET-SUM

**Binary encoding** (standard): numbers written in binary.

- Input length $n \approx k \cdot \log(\max \text{ value})$ for $k$ numbers
- Best known: $O(2^{n/2})$ — **exponential**
- Believed NP-complete (not in P)

**Unary encoding**: number $m$ encoded as $1^m$ (string of $m$ ones).

- Input length $n = \text{sum of all values}$
- Dynamic programming: $O(n \cdot k)$ — **polynomial** in unary input length!
- UNARY-SUBSET-SUM $\in P$

This phenomenon is called **pseudo-polynomial time**. The algorithm is polynomial in the **value** of numbers, not their **length**.

### The Lesson

$$
\text{Complexity depends on encoding!}
$$

Always specify whether numbers are in binary (standard) or unary. In theory, we use binary (most compact reasonable encoding).

---

## P and Polynomial Closure

**Theorem**: P is closed under:

1. **Union**: If $A, B \in P$, then $A \cup B \in P$
2. **Intersection**: If $A, B \in P$, then $A \cap B \in P$
3. **Complement**: If $A \in P$, then $\overline{A} \in P$
4. **Concatenation**: If $A, B \in P$, then $AB \in P$
5. **Kleene star**: If $A \in P$, then $A^* \in P$

### Proof of Complement Closure

If $M$ decides $A$ in polynomial time, build $M'$ that:

1. Runs $M$ on input
2. Flips the answer (accept ↔ reject)

$M'$ decides $\overline{A}$ in the same polynomial time. $\blacksquare$

This is very different from recognizable languages, where complement closure fails!

---

## P vs. Real-World Efficiency

| Theory Says | Practice Shows |
|---|---|
| $O(n^{100})$ is "efficient" | Would be utterly impractical |
| $O(2^n)$ is "inefficient" | Works fine for $n < 30$ |
| Constants don't matter | A factor of $10^6$ hurts! |
| Worst-case dominates | Average case often much better |

Despite these gaps, P captures something real: problems in P have **qualitatively different** algorithmic structure from those outside it.

---

## Historical Context

| Year | Milestone |
|---|---|
| 1965 | Cobham, Edmonds: P as "efficient" |
| 1971 | Cook: NP-completeness (next lessons) |
| 1979 | Khachiyan: LP in P (ellipsoid method) |
| 1987 | Tardos: Min-cost flow in strongly polynomial time |
| 2002 | AKS: PRIMES in P |
| 2004 | Undirected connectivity in log-space |

Each result expanding P is a landmark in CS.

---

## Summary: What's in P?

| In P | Not Known to Be in P |
|---|---|
| PATH, connectivity | HAM-PATH, HAM-CYCLE |
| 2SAT | 3SAT, SAT |
| 2-COLORING | 3-COLORING |
| MATCHING | CLIQUE |
| PRIMES | FACTORING |
| LP | Integer programming |
| Every CFL | Ambiguity of CFGs |
| Sorting, searching | — |
| GCD, primality | — |

---

## Summary Table

| Concept | Description |
|---|---|
| $P$ | $\bigcup_k \text{TIME}(n^k)$ — polynomial-time decidable |
| Robustness | Same class for all reasonable deterministic models |
| Closure | Closed under union, intersection, complement, etc. |
| Cobham's Thesis | $P$ = "efficiently solvable" |
| Encoding | Binary (standard); unary can change complexity |
| Pseudo-polynomial | Polynomial in value, exponential in length |

---

## Key Takeaways

1. $P = \bigcup_{k} \text{TIME}(n^k)$ — the class of polynomial-time decidable languages
2. $P$ is robust: the same for all reasonable deterministic computational models
3. Many important problems are in $P$: PATH, PRIMES, 2SAT, CFL parsing, LP
4. Many important problems are NOT known to be in $P$: SAT, CLIQUE, HAM-PATH
5. Encoding matters: the same problem can be in P or not depending on representation
6. $P$ is closed under complement — unlike recognizable languages

---

## Exercises

### Exercise 1: Proving Membership in P

Show that each language is in $P$ by describing a polynomial-time algorithm:

a) $\{G \mid G \text{ is a connected graph}\}$

b) $\{G \mid G \text{ is a tree}\}$

c) $\{\langle M, w, k \rangle \mid \text{TM } M \text{ accepts } w \text{ within } k \text{ steps}\}$

### Exercise 2: Euclidean Algorithm Analysis

Prove that the Euclidean algorithm for $\gcd(a, b)$ runs in $O(\log(\min(a, b)))$ iterations.

*Hint*: Show that after two iterations, the larger number is reduced by at least half.

### Exercise 3: CYK Algorithm

Trace the CYK algorithm on grammar:

$$
S \to AB \mid BC, \quad A \to BA \mid a, \quad B \to CC \mid b, \quad C \to AB \mid a
$$

and input string $w = baaba$. Show the DP table.

### Exercise 4: Encoding and Complexity

Explain why UNARY-SUBSET-SUM is in $P$ but SUBSET-SUM (with binary encoding) is believed not to be. What changes about the input length?

### Exercise 5: Closure Properties

Prove that if $A \in P$ and $B \in P$, then $A \cup B \in P$.

Give an explicit construction of the polynomial-time TM for $A \cup B$.

### Exercise 6: Is This in P?

For each problem, determine if it's in $P$ (and explain why) or if it's not known to be in $P$:

a) Given a graph $G$ with $n$ vertices, does $G$ have a cycle?

b) Given a graph $G$ with $n$ vertices, does $G$ have a Hamiltonian cycle?

c) Given a 2-CNF formula, is it satisfiable?

d) Given a 3-CNF formula, is it satisfiable?

### Exercise 7: Why Not Just Simulate?

Someone claims: "Every language is in P because we can just simulate the TM."

What's wrong with this argument? Give a specific example of a decidable language not in $P$ (assuming $P \neq \text{EXPTIME}$).

### Exercise 8: Algorithm Design

Design polynomial-time algorithms for:

a) Given a directed graph, find the number of strongly connected components.

b) Given a weighted graph, find the shortest path between two vertices (Dijkstra's algorithm). State the time complexity.

c) Given a sorted array of $n$ integers, determine if a target value is present. What is the optimal time complexity?

### Exercise 9: P and Regular Languages

Prove that every regular language is in $P$.

*Hint*: What is the time complexity of simulating a DFA on an input of length $n$?

---

## Beyond P: A Glimpse

While P captures "efficient" computation, many important variations exist:

| Class | Description |
|---|---|
| $P$ | Deterministic polynomial time |
| $NP$ | Nondeterministic polynomial time (next lesson) |
| $L$ | Logarithmic space |
| $NL$ | Nondeterministic log space |
| $PSPACE$ | Polynomial space |
| $EXP$ | Exponential time: $\bigcup_k \text{TIME}(2^{n^k})$ |

Known relationships:

$$
L \subseteq NL \subseteq P \subseteq NP \subseteq PSPACE \subseteq EXP
$$

We know $L \neq PSPACE$ and $P \neq EXP$, but most other separations remain open!

---

## The Time Hierarchy Theorem (Preview)

**Theorem**: For "nice" functions $f$ and $g$ with $f(n) \cdot \log f(n) = o(g(n))$:

$$
\text{TIME}(f(n)) \subsetneq \text{TIME}(g(n))
$$

This guarantees: more time = more power. In particular:

$$
\text{TIME}(n^k) \subsetneq \text{TIME}(n^{k+1})
$$

So $P$ is a **strict** hierarchy — each polynomial degree adds real power.

---

## What's Next?

In the next lesson, we meet **NP** — the class of problems where solutions can be *verified* in polynomial time, even if we don't know how to *find* them efficiently. This leads to the most famous open problem in computer science: **P vs NP**.
