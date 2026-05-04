---
title: Time Complexity
---

# Time Complexity

In this lesson, we shift from the question "**Can** we solve it?" to "**How fast** can we solve it?" Welcome to **complexity theory** — the study of computational resources.

---

## The Big Shift

So far in this course, we've studied **computability**:

- What problems can be solved by Turing machines?
- What problems are undecidable?

Now we enter **complexity theory**:

- Among solvable problems, which ones can be solved *efficiently*?
- What does "efficient" even mean?

---

## Measuring Time

**Definition**: Let $M$ be a deterministic Turing machine that halts on all inputs. The **running time** or **time complexity** of $M$ is the function:

$$
f : \mathbb{N} \to \mathbb{N}
$$

where $f(n)$ is the **maximum** number of steps $M$ takes on any input of length $n$.

$$
f(n) = \max\{t \mid M \text{ takes } t \text{ steps on some input of length } n\}
$$

This is **worst-case** analysis — we measure the hardest input of each size.

---

## Why Worst-Case?

We use worst-case because:

1. It gives a **guarantee**: the algorithm never takes longer than $f(n)$
2. It's **simpler** to analyze than average-case
3. It's the standard in theoretical CS

Other measures (average-case, amortized) are used in practice but are harder to analyze formally.

---

## Asymptotic Notation

We don't care about exact step counts. Why?

- Different TM models count steps differently
- Constant factors depend on implementation details
- What matters is the **growth rate** as $n \to \infty$

### Big-O: Upper Bound

$$
f(n) = O(g(n)) \iff \exists \, c > 0, \, n_0 \in \mathbb{N}: \, \forall n \geq n_0, \, f(n) \leq c \cdot g(n)
$$

**Meaning**: $f$ grows no faster than $g$ (up to a constant factor).

**Examples**:

- $5n^2 + 3n + 7 = O(n^2)$
- $100n = O(n^2)$ (true but not tight)
- $n \log n = O(n^2)$

### Big-$\Omega$: Lower Bound

$$
f(n) = \Omega(g(n)) \iff \exists \, c > 0, \, n_0 \in \mathbb{N}: \, \forall n \geq n_0, \, f(n) \geq c \cdot g(n)
$$

**Meaning**: $f$ grows at least as fast as $g$.

**Examples**:

- $n^2 = \Omega(n)$
- $n \log n = \Omega(n)$

### Big-$\Theta$: Tight Bound

$$
f(n) = \Theta(g(n)) \iff f(n) = O(g(n)) \text{ and } f(n) = \Omega(g(n))
$$

**Meaning**: $f$ grows at exactly the same rate as $g$ (up to constants).

**Examples**:

- $3n^2 + 5n = \Theta(n^2)$
- $n \log n + n = \Theta(n \log n)$

### Little-$o$: Strict Upper Bound

$$
f(n) = o(g(n)) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = 0
$$

**Meaning**: $f$ grows strictly slower than $g$.

**Examples**:

- $n = o(n^2)$ — linear is strictly less than quadratic
- $n^2 = o(n^3)$
- $\log n = o(n)$
- But $n^2 \neq o(n^2)$ — same growth rate, not strictly less

---

## Why Asymptotic Analysis Works

Different computational models (single-tape TM, multi-tape TM, RAM machine) might differ by constant or polynomial factors, but:

- If one model takes $O(n^2)$, another might take $O(n^4)$
- Both are still **polynomial**
- The distinction between polynomial and exponential is robust across all reasonable models

This is why asymptotic notation is the right tool for complexity theory.

---

## Time Complexity Classes

**Definition**: For any function $f : \mathbb{N} \to \mathbb{N}$:

$$
\text{TIME}(f(n)) = \{L \mid L \text{ is decided by a TM in } O(f(n)) \text{ time}\}
$$

This is the class of all languages decidable within time $O(f(n))$.

**Examples**:

- $\text{TIME}(n)$: languages decidable in linear time
- $\text{TIME}(n^2)$: languages decidable in quadratic time
- $\text{TIME}(2^n)$: languages decidable in exponential time

---

## The Linear Speedup Theorem

**Theorem**: For any constant $c > 0$ and any function $f(n)$ where $f(n) \geq n$:

$$
\text{TIME}(f(n)) = \text{TIME}(c \cdot f(n))
$$

### What This Means

Constant factors don't matter! If you can solve a problem in time $100n^2$, you can also solve it in time $n^2$ (by using a bigger tape alphabet to process multiple symbols at once).

### Proof Idea

Given a TM $M$ running in time $c \cdot f(n)$:

1. Encode $m$ tape symbols into one "super-symbol" (increase alphabet size)
2. Simulate $m$ steps of $M$ in a constant number of steps
3. Choose $m$ large enough to achieve any desired speedup

### Important Caveat

This only works for constant factors. You **cannot** speed up $n^2$ to $n$ — the polynomial degree matters!

$$
\text{TIME}(n^2) \neq \text{TIME}(n) \quad \text{(believed, and proved for single-tape TMs)}
$$

---

## Single-Tape vs. Multi-Tape TMs

**Theorem**: Every multi-tape TM running in time $t(n)$ can be simulated by a single-tape TM in time $O(t(n)^2)$.

### Why the Quadratic Blowup?

A single-tape TM simulating $k$ tapes must:

- Store all $k$ tapes on one tape (interleaved)
- For each step of the multi-tape TM, scan the entire active portion to find all head positions
- Active portion has length $\leq t(n)$ (at most one cell per step)
- So each simulated step takes $O(t(n))$ time
- Total: $t(n)$ steps $\times$ $O(t(n))$ per step $= O(t(n)^2)$

### Polynomial Relationship

The key point: single-tape and multi-tape TMs are polynomially related.

$$
\text{multi-tape } O(t(n)) \implies \text{single-tape } O(t(n)^2)
$$

A polynomial of a polynomial is still a polynomial. So **polynomial time** is the same for both models.

---

## Example 1: $\{0^k 1^k\}$

**Language**: $L = \{0^k 1^k \mid k \geq 0\}$

### Single-Tape TM: $O(n^2)$

**Algorithm**:
1. Scan to verify the input has form $0^* 1^*$ — $O(n)$
2. Repeatedly cross off one $0$ and one $1$:
   - Scan right to find uncrossed $0$, cross it off
   - Scan right to find uncrossed $1$, cross it off
   - Scan back to the left
3. Accept if all symbols crossed; reject if mismatch

Each pass crosses off one pair and takes $O(n)$ time. There are $n/2$ passes.

$$
\text{Total: } O(n) \times O(n/2) = O(n^2)
$$

### Two-Tape TM: $O(n \log n)$

**Algorithm**:
1. Copy input to tape 2
2. Use tape 2 to count: scan and halve the $0$s and $1$s alternately
3. Count-based approach achieves $O(n \log n)$

Actually, an even simpler two-tape approach:
1. Copy all $0$s to tape 2 — $O(n)$
2. Scan $1$s on tape 1, simultaneously scan tape 2 backward — $O(n)$
3. Both tapes should end at the same time

This gives $O(n)$ on a two-tape TM!

---

## Example 2: PATH Problem

**Language**: $PATH = \{\langle G, s, t \rangle \mid G \text{ is a directed graph with a path from } s \text{ to } t\}$

### Algorithm: Breadth-First Search

1. Mark vertex $s$
2. Repeat until no new vertices are marked:
   - For each edge $(u, v)$ in $G$:
     - If $u$ is marked and $v$ is not: mark $v$
3. Accept if $t$ is marked; reject otherwise

### Time Analysis

Let $|V| = n$ (number of vertices), $|E| = m$ (number of edges).

- At most $n$ rounds (each round marks at least one new vertex, or we stop)
- Each round scans all $m$ edges: $O(m)$ per round
- Total: $O(n \cdot m) = O(n^3)$ (since $m \leq n^2$)

More precisely: BFS runs in $O(V + E) = O(n + m)$ on a multi-tape TM.

$$
PATH \in \text{TIME}(n^2) \subseteq \text{TIME}(n^3)
$$

---

## Example 3: Sorting

**Problem**: Given a list of $n$ numbers, output them in sorted order.

**Best comparison-based algorithms**: $O(n \log n)$

- Merge sort: $O(n \log n)$ time, $O(n)$ space
- Heapsort: $O(n \log n)$ time, $O(1)$ extra space

**Lower bound**: Any comparison-based sort requires $\Omega(n \log n)$ comparisons.

So sorting is in $\Theta(n \log n)$.

---

## The Polynomial Boundary

The most important distinction in complexity theory:

$$
\text{Polynomial time} \quad \text{vs.} \quad \text{Exponential time}
$$

| Polynomial | Exponential |
|---|---|
| $O(n)$, $O(n^2)$, $O(n^{100})$ | $O(2^n)$, $O(n!)$, $O(n^n)$ |
| Scales reasonably | Blows up catastrophically |
| "Tractable" | "Intractable" |

### Growth Comparison

| $n$ | $n^2$ | $n^3$ | $2^n$ | $n!$ |
|---|---|---|---|---|
| 10 | 100 | 1,000 | 1,024 | 3,628,800 |
| 20 | 400 | 8,000 | 1,048,576 | $\approx 2.4 \times 10^{18}$ |
| 50 | 2,500 | 125,000 | $\approx 10^{15}$ | $\approx 3 \times 10^{64}$ |
| 100 | 10,000 | 1,000,000 | $\approx 10^{30}$ | $\approx 10^{158}$ |

At $n = 100$, even $n^3$ is manageable, but $2^n$ exceeds the number of atoms in the universe!

---

## Cobham's Thesis

**Cobham's Thesis** (1965):

> The problems that can be solved efficiently in practice are exactly those solvable in polynomial time.

This is a **thesis** (not a theorem) — it's a proposed identification:

$$
\text{Efficient} \equiv \text{Polynomial time}
$$

### Justifications

1. Polynomial time is **model-independent** (same class for TMs, RAMs, etc.)
2. Polynomial algorithms are usually **low-degree** ($n^2$, $n^3$), not $n^{100}$
3. Exponential algorithms are **always** impractical for large inputs
4. Polynomial algorithms tend to be **improvable** (practical constant factors)

### Criticisms

- $O(n^{100})$ is "polynomial" but not practical
- Some exponential algorithms work well in practice (e.g., simplex method)
- Heuristics and approximations blur the line

Despite these issues, polynomial time remains the gold standard in theory.

---

## Relationships Between Time Classes

We have the following containments:

$$
\text{TIME}(n) \subseteq \text{TIME}(n^2) \subseteq \text{TIME}(n^3) \subseteq \cdots \subseteq \text{TIME}(2^n)
$$

**Are these strict?** Yes! The **Time Hierarchy Theorem** (next lessons) proves:

$$
\text{TIME}(n^k) \subsetneq \text{TIME}(n^{k+1})
$$

More time genuinely gives you more computational power.

---

## Nondeterministic Time (Preview)

We can also measure time for **nondeterministic** TMs:

$$
\text{NTIME}(f(n)) = \{L \mid L \text{ is decided by an NTM in } O(f(n)) \text{ time}\}
$$

An NTM runs in time $f(n)$ if every branch of its computation tree has depth at most $f(n)$.

The relationship between $\text{TIME}$ and $\text{NTIME}$ is one of the great open problems in CS (P vs NP)!

---

## Common Time Complexities

| Name | Notation | Example |
|---|---|---|
| Constant | $O(1)$ | Array access |
| Logarithmic | $O(\log n)$ | Binary search |
| Linear | $O(n)$ | Finding max in list |
| Log-linear | $O(n \log n)$ | Merge sort |
| Quadratic | $O(n^2)$ | Bubble sort |
| Cubic | $O(n^3)$ | Matrix multiplication (naive) |
| Polynomial | $O(n^k)$ | Many graph algorithms |
| Exponential | $O(2^n)$ | Brute-force subset enumeration |
| Factorial | $O(n!)$ | Brute-force permutations |

---

## Time Complexity and Computability

Note the relationship:

$$
\text{TIME}(f(n)) \subseteq \text{Decidable} \subsetneq \text{Recognizable} \subsetneq \text{All languages}
$$

Complexity theory operates entirely within the decidable languages. We're refining our understanding of what's **feasible** among what's **possible**.

---

## Summary Table

| Concept | Description |
|---|---|
| Time complexity $f(n)$ | Max steps on inputs of length $n$ |
| $O(g(n))$ | Upper bound on growth rate |
| $\Omega(g(n))$ | Lower bound on growth rate |
| $\Theta(g(n))$ | Tight bound (both upper and lower) |
| $\text{TIME}(f(n))$ | Class of languages decidable in $O(f(n))$ time |
| Linear speedup | Constants don't matter: $\text{TIME}(cf(n)) = \text{TIME}(f(n))$ |
| Multi-tape simulation | Multi-tape $t(n) \to$ single-tape $O(t(n)^2)$ |
| Cobham's Thesis | Efficient $\equiv$ polynomial time |

---

## Key Takeaways

1. Time complexity measures the **worst-case** number of steps as a function of input length
2. Asymptotic notation ($O$, $\Omega$, $\Theta$) ignores constants and focuses on growth rates
3. $\text{TIME}(f(n))$ is the class of languages decidable in $O(f(n))$ time
4. Linear speedup: constant factors are irrelevant to complexity classes
5. Multi-tape TMs are at most quadratically faster than single-tape TMs
6. The polynomial/exponential divide is the fundamental boundary in complexity

---

## Exercises

### Exercise 1: Asymptotic Notation

Classify each function using Big-$\Theta$:

a) $f(n) = 3n^3 + 100n^2 + 5$

b) $f(n) = 2^{n+5}$

c) $f(n) = n \cdot \log_2(n^3)$

d) $f(n) = \sqrt{n} + \log n$

### Exercise 2: Comparing Growth Rates

Arrange in increasing order of growth: $n!$, $2^n$, $n^3$, $n \log n$, $\log n$, $n^n$, $n^2 \log n$

### Exercise 3: Time Complexity of String Operations

What is the time complexity of deciding each language on a single-tape TM?

a) $\{w \mid w \text{ is a palindrome}\}$

b) $\{ww \mid w \in \{0, 1\}^*\}$

c) $\{a^n b^n c^n \mid n \geq 0\}$

### Exercise 4: Linear Speedup

Explain why the linear speedup theorem does NOT imply $\text{TIME}(n^2) = \text{TIME}(n)$. What goes wrong if you try to apply the technique?

### Exercise 5: Multi-Tape Advantage

Design a 2-tape TM that decides $\{0^n 1^n \mid n \geq 0\}$ in $O(n)$ time. Explain why no single-tape TM can do this in $O(n)$ time.

### Exercise 6: Model Independence

Show that $PATH$ is in polynomial time regardless of whether we use a single-tape TM, multi-tape TM, or RAM model. Why does the polynomial relationship between models guarantee this?

### Exercise 7: Exponential Explosion

A brute-force algorithm for SAT (Boolean satisfiability) checks all $2^n$ possible assignments for $n$ variables. If each check takes $O(n)$ time, what is the total time complexity? For a formula with 300 variables, approximately how many operations would this require?

### Exercise 8: Hierarchy of Growth

For each pair, determine whether $f(n) = O(g(n))$, $f(n) = \Omega(g(n))$, or $f(n) = \Theta(g(n))$:

a) $f(n) = n^2 \log n$ and $g(n) = n^3$

b) $f(n) = 2^n$ and $g(n) = 3^n$

c) $f(n) = n!$ and $g(n) = n^n$

d) $f(n) = \log(n!)$ and $g(n) = n \log n$

### Exercise 9: Multi-Tape Simulation Cost

A 3-tape TM runs in time $T(n) = n \log n$. What is the time complexity when simulated on a single-tape TM? Is the result still $O(n^2)$?

---

## Additional Practice: Analyzing Algorithms

### Problem A: Matrix Multiplication

The naive algorithm for multiplying two $n \times n$ matrices uses three nested loops:

$$
C[i][j] = \sum_{k=1}^{n} A[i][k] \cdot B[k][j]
$$

**Time**: $O(n^3)$ multiplications and additions.

**Input length**: The input consists of $2n^2$ numbers. If each number has $b$ bits, input length $= O(n^2 \cdot b)$.

In terms of input length $N = n^2 b$: the algorithm runs in $O(N^{3/2} / b^{3/2} \cdot b) = O(N^{3/2})$ for fixed $b$.

### Problem B: Graph Connectivity

**Algorithm**: Run DFS from vertex 1. Accept if all vertices are visited.

**Time**: $O(V + E)$. For adjacency matrix input of length $n = V^2$: $O(n)$.

For adjacency list input of length $n = V + E$: $O(n)$.

Either way: **linear** in input length!

### Problem C: Two-Sum Problem

Given an array of $n$ integers and target $t$, find two elements summing to $t$.

**Brute force**: Check all pairs — $O(n^2)$

**Sorting approach**: Sort, then use two pointers — $O(n \log n)$

**Hash table**: One pass with hash lookups — $O(n)$ expected

All three are polynomial! But the constants matter enormously in practice.

---

## What's Next?

In the next lesson, we define the class **P** — all problems solvable in polynomial time. We'll see many concrete examples and understand why P represents the boundary of practical computation.
