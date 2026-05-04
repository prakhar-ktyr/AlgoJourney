---
title: Space Complexity
---

# Space Complexity

So far, we've focused on **time** as our computational resource. But **space** (memory) is equally fundamental. In this lesson, we explore space complexity classes, the surprising relationship between deterministic and nondeterministic space, and the grand hierarchy of complexity classes.

---

## Defining Space Complexity

### Space Used by a Turing Machine

For a deterministic TM $M$ that halts on all inputs:

> The **space complexity** of $M$ is the function $f: \mathbb{N} \to \mathbb{N}$ where $f(n)$ is the maximum number of tape cells $M$ scans on any input of length $n$.

For a nondeterministic TM $N$:

> The **space complexity** of $N$ is $f(n)$ = maximum number of tape cells used on **any branch** of the computation on any input of length $n$.

---

### The Read-Only Input Tape Model

For sub-linear space classes (like logarithmic space), we use a **two-tape model**:

- **Input tape:** read-only (doesn't count toward space)
- **Work tape:** read-write (this is what we measure)

Without this convention, reading the input alone would require $n$ space, making sub-linear space meaningless.

---

## Space Complexity Classes

### Definition

$$\text{SPACE}(f(n)) = \{L : L \text{ is decided by a DTM using } O(f(n)) \text{ space}\}$$

$$\text{NSPACE}(f(n)) = \{L : L \text{ is decided by an NTM using } O(f(n)) \text{ space}\}$$

---

## Key Space Classes

### Logarithmic Space

$$L = \text{SPACE}(\log n)$$

Languages decidable using only $O(\log n)$ work tape cells (with read-only input).

**Examples in L:**
- Checking if a string is a palindrome (using two pointers encoded in $O(\log n)$ bits)
- PATH in directed graphs with out-degree 1 (following a unique path)
- Arithmetic: addition, comparison of numbers

**What can $O(\log n)$ space store?**
- A constant number of pointers into the input (each needs $\log n$ bits)
- A constant number of counters up to $n$
- NOT the entire input (that's $n$ bits)

---

### Nondeterministic Logarithmic Space

$$NL = \text{NSPACE}(\log n)$$

**Key example:** PATH (graph reachability)

- **Input:** Directed graph $G$, vertices $s, t$
- **Question:** Is there a path from $s$ to $t$?

PATH $\in$ NL: nondeterministically walk from $s$, at each step guessing the next vertex. Only need to store current vertex ($O(\log n)$ bits) and a step counter ($O(\log n)$ bits).

In fact, PATH is **NL-complete** (complete for NL under log-space reductions).

---

### Polynomial Space

$$PSPACE = \bigcup_{k \geq 0} \text{SPACE}(n^k)$$

Languages decidable using polynomial space. This is a very powerful class.

### Nondeterministic Polynomial Space

$$NPSPACE = \bigcup_{k \geq 0} \text{NSPACE}(n^k)$$

As we'll see, this equals PSPACE!

### Exponential Space

$$EXPSPACE = \bigcup_{k \geq 0} \text{SPACE}(2^{n^k})$$

---

## Savitch's Theorem

One of the most remarkable results in complexity theory:

> **Savitch's Theorem (1970):** For any function $f(n) \geq \log n$:
>
> $$\text{NSPACE}(f(n)) \subseteq \text{SPACE}(f(n)^2)$$

### Significance

Nondeterministic space can be simulated by deterministic space with only a **quadratic blowup**!

Compare with time: we don't know if $NP \subseteq P$ (only quadratic overhead). For space, we DO know the overhead is at most squaring.

### Immediate Consequence

$$NPSPACE = PSPACE$$

**Proof:** $PSPACE \subseteq NPSPACE$ (trivially). For the other direction: if $L \in NPSPACE$, then $L \in \text{NSPACE}(n^k)$ for some $k$. By Savitch's theorem, $L \in \text{SPACE}(n^{2k}) \subseteq PSPACE$.

---

### Proof Idea: Reachability by Divide-and-Conquer

The key problem is **reachability**: given a graph (the configuration graph of the NTM), is there a path from start to accept?

**REACH**$(c_1, c_2, t)$: Is configuration $c_2$ reachable from $c_1$ in at most $t$ steps?

**Recursive algorithm:**

```
REACH(c₁, c₂, t):
  if t = 0:
    return (c₁ == c₂)
  if t = 1:
    return (c₁ == c₂) or (c₁ →₁ c₂)  // one-step transition
  for each configuration c_mid:
    if REACH(c₁, c_mid, ⌊t/2⌋) and REACH(c_mid, c₂, ⌊t/2⌋):
      return TRUE
  return FALSE
```

**Space analysis:**
- Recursion depth: $\log t = \log(2^{O(f(n))}) = O(f(n))$
- Each recursion level stores: $c_{\text{mid}}$ (size $O(f(n))$) + bookkeeping
- Total space: $O(f(n)) \times O(f(n)) = O(f(n)^2)$

Since the NTM uses $f(n)$ space, the configuration graph has at most $2^{O(f(n))}$ nodes, so we set $t = 2^{O(f(n))}$ and call REACH(start, accept, $t$).

---

## Space-Time Relationships

Space and time are connected by important theorems:

### Time is at Least as Large as Space

$$\text{TIME}(f(n)) \subseteq \text{SPACE}(f(n))$$

**Proof:** A TM running for $f(n)$ steps can visit at most $f(n)$ cells (moving one cell per step). ∎

### Space Gives Exponential Time Bound

$$\text{SPACE}(f(n)) \subseteq \text{TIME}\left(2^{O(f(n))}\right)$$

**Proof:** A TM using $f(n)$ space has at most:

$$|\text{configurations}| = |Q| \cdot n \cdot |\Gamma|^{f(n)} = 2^{O(f(n))}$$

(states × head position × tape contents)

If the TM halts, it cannot repeat a configuration (otherwise it would loop). So it halts in at most $2^{O(f(n))}$ steps. ∎

### Corollary

$$L \subseteq P$$

Proof: $L = \text{SPACE}(\log n) \subseteq \text{TIME}(2^{O(\log n)}) = \text{TIME}(n^{O(1)}) = P$.

---

## The Grand Inclusion Chain

The fundamental relationships between complexity classes form a chain:

$$L \subseteq NL \subseteq P \subseteq NP \subseteq PSPACE \subseteq EXPTIME \subseteq EXPSPACE$$

Let's justify each inclusion:

| Inclusion | Reason |
|-----------|--------|
| $L \subseteq NL$ | Deterministic is a special case of nondeterministic |
| $NL \subseteq P$ | $\text{NSPACE}(\log n) \subseteq \text{SPACE}(\log^2 n) \subseteq \text{TIME}(n^{O(1)})$ |
| $P \subseteq NP$ | Deterministic is a special case of nondeterministic |
| $NP \subseteq PSPACE$ | Verify all certificates using polynomial space |
| $PSPACE \subseteq EXPTIME$ | $\text{SPACE}(n^k) \subseteq \text{TIME}(2^{O(n^k)})$ |
| $EXPTIME \subseteq EXPSPACE$ | Time bounds space |

---

### Why NP ⊆ PSPACE?

Let $L \in NP$ with verifier $V$ running in time $n^k$. To decide $L$ in PSPACE:

```
On input w of length n:
  For each possible certificate c of length ≤ n^k:
    Run V(w, c)
    If V accepts, ACCEPT
  REJECT
```

We enumerate certificates one at a time, reusing space. Each certificate uses $O(n^k)$ space, and we reuse the same space for each new certificate. Total space: $O(n^k)$.

---

## What's Known to Be Strict?

### Hierarchy Theorems Give Us Separations

By the **space hierarchy theorem:**

$$\text{SPACE}(f(n)) \subsetneq \text{SPACE}(g(n)) \text{ when } f(n) = o(g(n))$$

This gives us: $L \subsetneq PSPACE$ and $PSPACE \subsetneq EXPSPACE$.

By the **time hierarchy theorem:**

$$P \subsetneq EXPTIME$$

### What's Open?

The following are all major **open problems**:

| Question | Status |
|----------|--------|
| $L \stackrel{?}{=} NL$ | Open |
| $L \stackrel{?}{=} P$ | Open |
| $P \stackrel{?}{=} NP$ | Open (million-dollar problem!) |
| $NP \stackrel{?}{=} PSPACE$ | Open |
| $P \stackrel{?}{=} PSPACE$ | Open |
| $NL \stackrel{?}{=} P$ | Open |

We know at least ONE of these must be strict (since $L \neq PSPACE$), but we can't pinpoint which ones!

---

## Immerman-Szelepcsényi Theorem

Another remarkable result about nondeterministic space:

> **Theorem (1987):** For $f(n) \geq \log n$:
>
> $$\text{NSPACE}(f(n)) = \text{co-NSPACE}(f(n))$$

This means nondeterministic space classes are **closed under complement**.

**Consequence:** $NL = \text{co-}NL$

This contrasts sharply with time: we don't know if $NP = \text{co-}NP$ (and most believe they differ).

### What This Means

- $\overline{\text{PATH}}$ (non-reachability in directed graphs) is in NL
- This is surprising: how do you nondeterministically verify there's NO path?
- The proof uses an inductive counting technique

---

## Examples of Problems by Space Class

### Problems in L

| Problem | Description |
|---------|-------------|
| Undirected reachability* | Path between two vertices (Reingold 2004) |
| Sorting | Given pointers, check if sequence is sorted |
| Balanced parentheses | Are parentheses properly nested? |

*Reingold's theorem: undirected reachability is in L (surprising and deep!)

### Problems in NL

| Problem | Description |
|---------|-------------|
| PATH | Directed graph reachability |
| 2SAT | Satisfiability of 2-CNF formulas |
| Bipartite testing | Is a graph bipartite? |

### Problems in P (but not known to be in NL)

| Problem | Description |
|---------|-------------|
| Circuit evaluation | Evaluate a Boolean circuit on given input |
| Linear programming | Is there a feasible solution? |
| Primality | Is a number prime? |

### Problems in PSPACE

| Problem | Description |
|---------|-------------|
| TQBF | True quantified Boolean formulas |
| Generalized geography | Two-player game on a graph |
| Regular expression equivalence | With complement operator |
| Generalized chess | On $n \times n$ board |

---

## PSPACE as a Class

PSPACE is remarkably robust — it equals many natural classes:

$$PSPACE = NPSPACE = \text{co-}NPSPACE = AP$$

where $AP$ is **alternating polynomial time** (TMs with both universal and existential states).

PSPACE captures problems that involve:
- **Game-like reasoning** (alternating quantifiers)
- **Exhaustive search** with reusable space
- **Planning** with polynomial-length plans

---

## The Space Hierarchy Theorem

Just as the time hierarchy theorem separates time classes, the space hierarchy theorem separates space classes:

> **Space Hierarchy Theorem:** If $f(n)$ is space-constructible and $g(n) = o(f(n))$, then:
>
> $$\text{SPACE}(g(n)) \subsetneq \text{SPACE}(f(n))$$

### Applications

- $\text{SPACE}(\log n) \subsetneq \text{SPACE}(n)$: logarithmic space is strictly weaker than linear space
- $\text{SPACE}(n) \subsetneq \text{SPACE}(n^2)$: linear space is strictly weaker than quadratic space
- $L \subsetneq PSPACE$: some problems in PSPACE cannot be solved in logarithmic space
- $PSPACE \subsetneq EXPSPACE$: polynomial space is strictly weaker than exponential space

### What It Doesn't Tell Us

The hierarchy theorem requires a **strict** asymptotic gap. It doesn't separate:
- $L$ from $NL$ (same asymptotic: both $O(\log n)$)
- $P$ from $NP$ (different models: deterministic vs nondeterministic)
- $NP$ from $PSPACE$ (different resources: time vs space)

---

## Log-Space Reductions

For sub-polynomial classes like $L$ and $NL$, polynomial-time reductions are too powerful (they could solve the problem!). Instead, we use **log-space reductions**:

$$A \leq_L B$$

means there's a **log-space computable** function $f$ with $w \in A \iff f(w) \in B$.

### NL-Completeness

PATH is **NL-complete** under log-space reductions:
- PATH $\in NL$ (nondeterministic walk)
- Every $NL$ problem log-space reduces to PATH (encode NTM computation as graph reachability)

### P-Completeness

**Circuit Value Problem (CVP)** is **P-complete** under log-space reductions:
- Given a Boolean circuit with inputs, evaluate the output
- CVP $\in P$ (topological evaluation)
- Every $P$ problem reduces to CVP (simulate TM step-by-step as a circuit)

P-complete problems are believed to be inherently sequential — not efficiently parallelizable.

---

## Practical Implications

| If your problem is in... | What it means practically |
|--------------------------|--------------------------|
| $L$ | Extremely memory-efficient algorithms exist |
| $P$ | Efficient algorithms exist |
| $NP$-complete | Likely no efficient algorithm (time) |
| $PSPACE$-complete | Likely even harder — no short certificates |
| $EXPTIME$-complete | Provably requires exponential time |

---

## Summary

| Class | Definition | Key Property |
|-------|-----------|--------------|
| $L$ | $\text{SPACE}(\log n)$ | Pointer-based algorithms |
| $NL$ | $\text{NSPACE}(\log n)$ | Reachability problems |
| $P$ | $\bigcup_k \text{TIME}(n^k)$ | Efficiently solvable |
| $NP$ | Polynomial-time verifiable | Short certificates |
| $PSPACE$ | $\bigcup_k \text{SPACE}(n^k)$ | Game-like problems |
| $EXPTIME$ | $\bigcup_k \text{TIME}(2^{n^k})$ | Provably hard |

Key theorems:
- Savitch: $\text{NSPACE}(f) \subseteq \text{SPACE}(f^2)$ → $PSPACE = NPSPACE$
- Immerman-Szelepcsényi: $\text{NSPACE}(f) = \text{co-NSPACE}(f)$ → $NL = \text{co-}NL$
- Hierarchy: $L \neq PSPACE$, $P \neq EXPTIME$

---

## Exercises

### Exercise 1: Space of a Specific Machine

A TM processes input $w$ of length $n$ by copying $w$ to the work tape, then sorting it using bubble sort. What is its space complexity?

<details>
<summary>Solution</summary>

The work tape needs to hold the entire input plus constant extra space for swapping. Space complexity: $O(n)$.

This TM is in $\text{SPACE}(n) \subseteq PSPACE$ but not necessarily in $L$.
</details>

### Exercise 2: L ⊆ NL

Prove that $L \subseteq NL$.

<details>
<summary>Solution</summary>

Any deterministic TM is a special case of a nondeterministic TM (one that never uses nondeterministic choices). If $M$ is a DTM using $O(\log n)$ space, it's also an NTM using $O(\log n)$ space. Therefore $\text{SPACE}(\log n) \subseteq \text{NSPACE}(\log n)$, i.e., $L \subseteq NL$. ∎
</details>

### Exercise 3: Configuration Counting

A TM has 5 states, tape alphabet of size 3, and uses at most $\log_2 n$ tape cells. How many possible configurations does it have?

<details>
<summary>Solution</summary>

A configuration consists of: state × head position × tape contents.

- States: 5
- Head position on work tape: $\log_2 n$ positions
- Head position on input tape: $n$ positions
- Tape contents: $3^{\log_2 n} = n^{\log_2 3} \approx n^{1.585}$

Total configurations: $5 \cdot \log_2 n \cdot n \cdot n^{\log_2 3} = O(n^{2.585} \log n)$

This is polynomial in $n$, confirming that the machine runs in polynomial time (consistent with $L \subseteq P$).
</details>

### Exercise 4: NP ⊆ PSPACE

Give a detailed proof that $NP \subseteq PSPACE$.

<details>
<summary>Solution</summary>

Let $L \in NP$. Then there exists a polynomial-time verifier $V$ such that $w \in L \iff \exists c$ with $|c| \leq n^k$ and $V(w,c)$ accepts.

**PSPACE algorithm for $L$:**
1. For each string $c$ with $|c| \leq n^k$ (enumerate in lexicographic order):
   a. Simulate $V(w, c)$
   b. If $V$ accepts, ACCEPT
2. REJECT

**Space analysis:**
- Storing current certificate $c$: $O(n^k)$ space
- Simulating $V(w,c)$: $V$ runs in $O(n^k)$ time, so uses $O(n^k)$ space
- After each certificate, we **reuse** the space (erase and try next $c$)

Total space: $O(n^k)$, which is polynomial. So $L \in PSPACE$. ∎
</details>

### Exercise 5: Savitch's Theorem Application

Using Savitch's theorem, what is the deterministic space needed to simulate an NTM that uses $n^2$ space?

<details>
<summary>Solution</summary>

By Savitch's theorem: $\text{NSPACE}(n^2) \subseteq \text{SPACE}((n^2)^2) = \text{SPACE}(n^4)$.

So we need at most $O(n^4)$ deterministic space to simulate an NTM using $n^2$ space.
</details>

### Exercise 6: Reachability in L?

Is the following problem in L? "Given a directed graph $G$ and vertex $s$, does $s$ have out-degree 0?"

<details>
<summary>Solution</summary>

Yes! The algorithm:
1. Scan the edge list
2. For each edge $(u, v)$, check if $u = s$
3. If any edge starts at $s$, reject (out-degree $> 0$)
4. If no edge starts at $s$, accept (out-degree $= 0$)

Space: we only need to store $s$ (given on input tape, read-only) and compare with each edge. Work tape uses $O(1)$ extra space. Since $O(1) \subseteq O(\log n)$, this is in L.
</details>

### Exercise 7: Space vs Time Trade-off

A problem $L$ can be solved in $O(n^2)$ time or $O(n)$ space. What can you conclude about $L$'s complexity class membership?

<details>
<summary>Solution</summary>

From the time bound: $L \in \text{TIME}(n^2) \subseteq P$.

From the space bound: $L \in \text{SPACE}(n) \subseteq PSPACE$.

The time bound is more informative here: $L \in P$ (which already implies $L \in PSPACE$).

From $\text{SPACE}(n) \subseteq \text{TIME}(2^{O(n)})$: the space bound guarantees at most exponential time, but the time bound gives us polynomial — much better.

Key insight: knowing a problem is in P is always at least as strong as knowing it's in PSPACE. The space bound is useful mainly when the time bound is unknown.
</details>

---

## What's Next?

In the next lesson, we'll study **PSPACE-completeness** — the hardest problems solvable with polynomial space — and the fascinating connections to game theory and quantified Boolean formulas.
