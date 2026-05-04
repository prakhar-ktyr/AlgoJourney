---
title: Multi-tape and Multi-track Turing Machines
---

# Multi-tape and Multi-track Turing Machines

In this lesson, we explore **multi-tape** and **multi-track** Turing Machines in full detail — with complete examples, the formal simulation theorem, and complexity implications.

---

## Multi-tape TM: Formal Definition

A **$k$-tape Turing Machine** is a 7-tuple:

$$
M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})
$$

where the transition function is:

$$
\delta: Q \times \Gamma^k \to Q \times \Gamma^k \times \{L, R, S\}^k
$$

### Initial Configuration

- **Tape 1:** Contains the input $w = w_1 w_2 \ldots w_n$, head at position 0
- **Tapes 2 through $k$:** All blank ($\sqcup$ everywhere), heads at position 0

### One Step of Computation

Given current state $q$ and symbols $(a_1, a_2, \ldots, a_k)$ under the $k$ heads:

$$
\delta(q, a_1, a_2, \ldots, a_k) = (q', b_1, b_2, \ldots, b_k, D_1, D_2, \ldots, D_k)
$$

The machine:

1. Enters state $q'$
2. Writes $b_i$ on tape $i$ (for each $i = 1, \ldots, k$)
3. Moves head $i$ in direction $D_i \in \{L, R, S\}$

---

## Example 1: Palindrome Checking with 2 Tapes

**Language:** $L = \{w \in \{a, b\}^* \mid w = w^R\}$

### Strategy

- **Tape 1:** Input tape (read-only after copying)
- **Tape 2:** Reversed copy of input

### Algorithm

**Phase 1: Copy input to tape 2**

1. Start in state $q_0$, both heads at the leftmost position
2. Read symbol from tape 1, write it to tape 2
3. Move both heads right
4. Repeat until tape 1 head reads $\sqcup$

**Phase 2: Rewind tape 1, keep tape 2 at end**

5. Move tape 1 head all the way to the left (back to start)
6. Tape 2 head is already at the rightmost character

**Phase 3: Compare**

7. Read from tape 1 (left to right) and tape 2 (right to left)
8. If symbols match, continue
9. If mismatch → **reject**
10. If tape 1 reaches $\sqcup$ → **accept**

### Trace for Input "abba"

| Step | State | Tape 1 | Head 1 | Tape 2 | Head 2 | Action |
|------|-------|--------|--------|--------|--------|--------|
| 0 | $q_0$ | $\underline{a}bba$ | 0 | $\sqcup\sqcup\sqcup\sqcup$ | 0 | Copy |
| 1 | $q_0$ | $a\underline{b}ba$ | 1 | $a\underline{\sqcup}\sqcup\sqcup$ | 1 | Copy |
| 2 | $q_0$ | $ab\underline{b}a$ | 2 | $ab\underline{\sqcup}\sqcup$ | 2 | Copy |
| 3 | $q_0$ | $abb\underline{a}$ | 3 | $abb\underline{\sqcup}$ | 3 | Copy |
| 4 | $q_1$ | $abba\underline{\sqcup}$ | 4 | $abba\underline{\sqcup}$ | 4 | Rewind tape 1 |
| ... | $q_2$ | $\underline{a}bba$ | 0 | $abb\underline{a}$ | 3 | Compare |
| ... | $q_2$ | $a\underline{b}ba$ | 1 | $ab\underline{b}a$ | 2 | Match ✓ |
| ... | $q_2$ | $ab\underline{b}a$ | 2 | $a\underline{b}ba$ | 1 | Match ✓ |
| ... | $q_2$ | $abb\underline{a}$ | 3 | $\underline{a}bba$ | 0 | Match ✓ |
| ... | $q_{acc}$ | — | — | — | — | **Accept** |

### Complexity

- Single-tape palindrome checker: $O(n^2)$ (zigzag)
- 2-tape palindrome checker: $O(n)$ (linear!)

---

## Example 2: Addition with 2 Tapes

**Problem:** Given input $a^m \# a^n$ on tape 1, produce $a^{m+n}$ on tape 2.

### Algorithm

1. Scan tape 1, copying every $a$ before $\#$ to tape 2
2. Skip the $\#$ symbol on tape 1
3. Continue copying every $a$ after $\#$ to tape 2
4. Result: tape 2 contains $a^{m+n}$

### Why This Is Easier with 2 Tapes

On a single tape, computing $a^m \# a^n \to a^{m+n}$ requires:

- Finding and removing the $\#$
- Shifting characters (expensive!)

With 2 tapes, we simply copy selectively — no shifting needed. The algorithm runs in $O(m + n)$ time.

---

## The Simulation Theorem (Detailed Proof)

**Theorem:** For every $k$-tape TM $M$ running in time $t(n)$, there exists a single-tape TM $S$ that simulates $M$ in time $O(t(n)^2)$.

### Construction of Simulator $S$

**Tape alphabet of $S$:** For each symbol $\gamma \in \Gamma$, include:

- $\gamma$ (plain symbol)
- $\dot{\gamma}$ (dotted — marks head position)

Plus a delimiter symbol $\#$.

**Tape layout of $S$:**

$$
\# \underbrace{\dot{a}_1 a_2 a_3 \ldots a_m}_{\text{Tape 1 contents}} \# \underbrace{b_1 \dot{b}_2 b_3 \ldots b_m}_{\text{Tape 2 contents}} \# \ldots \# \underbrace{z_1 z_2 \dot{z}_3 \ldots z_m}_{\text{Tape } k \text{ contents}} \#
$$

The **dot** on a symbol indicates the head position for that simulated tape.

### Simulation of One Step

To simulate one step of $M$, the simulator $S$ does the following:

**Pass 1 (Left-to-right scan):**

1. Start at the leftmost $\#$
2. Scan right, looking for dotted symbols
3. When a dotted symbol $\dot{a}_i$ is found, record $a_i$ in the finite-state control
4. Continue until all $k$ dotted symbols are recorded

After this pass, $S$ knows all $k$ symbols that $M$'s heads are reading.

**Transition lookup:**

5. Using the current state and the $k$ recorded symbols, determine:
   - New state $q'$
   - $k$ symbols to write: $(b_1, \ldots, b_k)$
   - $k$ directions: $(D_1, \ldots, D_k)$

**Pass 2 (Update):**

6. Scan across the tape again
7. At each dotted symbol (say on simulated tape $i$):
   - Replace it with the new symbol $b_i$ (undotted)
   - Move the dot to the adjacent cell according to $D_i$

**Handle tape extension:**

8. If a head moves past the current boundary of its simulated tape, insert a blank symbol and shift everything to the right.

### Time Analysis

- After $t(n)$ steps of $M$, each simulated tape has at most $t(n)$ non-blank cells
- Total length of $S$'s tape: $O(k \cdot t(n))$
- Each simulation step requires 2 passes across the tape: $O(k \cdot t(n))$ per step
- Total time:

$$
\sum_{i=1}^{t(n)} O(k \cdot i) = O\left(k \cdot \frac{t(n)(t(n)+1)}{2}\right) = O(k \cdot t(n)^2)
$$

Since $k$ is a constant (fixed for a given machine):

$$
\boxed{\text{Total simulation time} = O(t(n)^2)}
$$

### Correctness

The simulation is correct because:

1. $S$ faithfully represents all $k$ tapes and head positions
2. Each step of $M$ is correctly looked up and applied
3. $S$ accepts/rejects exactly when $M$ would

---

## Multi-track TM: Detailed Treatment

### Formal Definition

A **$k$-track TM** has tape alphabet $\Gamma^k$ (tuples of $k$ symbols):

$$
\delta: Q \times \Gamma^k \to Q \times \Gamma^k \times \{L, R\}
$$

Each cell stores a $k$-tuple. There is only **one head** that reads/writes all $k$ tracks simultaneously.

### Difference from Multi-tape

The critical difference: in a multi-track TM, all tracks share a **single head** that moves together. In a multi-tape TM, each tape has its own independently moving head.

$$
\text{Multi-track: 1 head, } k \text{ tracks} \quad \neq \quad \text{Multi-tape: } k \text{ heads, } k \text{ tapes}
$$

### Example: Binary Counter Alongside Computation

Suppose we want a TM that processes input on track 1 while maintaining a binary counter on track 2.

**Cell structure:** Each cell holds a pair $(\gamma, b)$ where $\gamma \in \{a, b, \sqcup\}$ and $b \in \{0, 1, \sqcup\}$.

| Position | 0 | 1 | 2 | 3 | 4 |
|----------|---|---|---|---|---|
| Track 1 | $a$ | $b$ | $a$ | $b$ | $\sqcup$ |
| Track 2 | $1$ | $0$ | $1$ | $\sqcup$ | $\sqcup$ |

The counter on track 2 reads: $101_2 = 5$ (we've done 5 iterations).

### Example: Marking Visited Cells

A common pattern uses track 2 as a "visited" flag:

| Position | 0 | 1 | 2 | 3 | 4 |
|----------|---|---|---|---|---|
| Track 1 (data) | $a$ | $b$ | $c$ | $a$ | $b$ |
| Track 2 (visited) | $\checkmark$ | $\checkmark$ | | $\checkmark$ | |

This is much cleaner than encoding visited/unvisited into the symbols themselves.

### Why Multi-track Equals Standard TM

A $k$-track TM with tracks over alphabets $\Gamma_1, \ldots, \Gamma_k$ is just a standard TM with tape alphabet:

$$
\Gamma' = \Gamma_1 \times \Gamma_2 \times \cdots \times \Gamma_k
$$

The number of symbols is $|\Gamma'| = |\Gamma_1| \cdot |\Gamma_2| \cdots |\Gamma_k|$, which is finite.

There is **no simulation overhead** — it's literally the same machine with renamed symbols!

---

## Multi-track vs. Multi-tape: When to Use Which

### Use Multi-track When:

- You need **auxiliary annotations** on cells (marks, flags)
- The auxiliary info is **spatially aligned** with the main data
- You don't need independent head movement

### Use Multi-tape When:

- You need to **compare** data at different positions
- You need **independent traversal** of different data
- You want to achieve better **time complexity**

---

## Time Complexity Implications

### What Changes

| Model | Palindrome | Sorting | String Copying |
|-------|-----------|---------|----------------|
| Single-tape | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ |
| Multi-tape | $O(n)$ | $O(n \log n)$ | $O(n)$ |

Multi-tape can be **polynomially faster** for many problems.

### What Doesn't Change

Multi-tape TMs cannot decide anything that single-tape TMs cannot:

$$
\text{Decidable}_{k\text{-tape}} = \text{Decidable}_{\text{single-tape}}
$$

$$
\text{Recognizable}_{k\text{-tape}} = \text{Recognizable}_{\text{single-tape}}
$$

### Importance for Complexity Theory

The polynomial relationship matters enormously:

- If $M$ is a $k$-tape TM running in time $t(n)$
- The single-tape simulation runs in $O(t(n)^2)$
- So $t(n)$ is polynomial iff $t(n)^2$ is polynomial

This means the complexity class **P** (polynomial time) is the same whether we define it with single-tape or multi-tape TMs!

$$
\text{P}_{\text{single-tape}} = \text{P}_{\text{multi-tape}}
$$

---

## Advanced: Speeding Up Multi-tape Simulation

### Can We Do Better Than $O(t(n)^2)$?

Yes! More clever simulation strategies exist:

**Block simulation:** Group multiple cells into blocks, achieving:

$$
O(t(n) \log t(n))
$$

This uses a technique based on **block transfers** and amortized analysis.

However, for most theoretical purposes, the $O(t(n)^2)$ bound is sufficient.

### Linear-Time Simulation?

An open question in complexity theory:

> Can every multi-tape TM running in $O(n)$ be simulated by a single-tape TM in $O(n)$?

This is widely believed to be **false**, but remains unproven!

---

## Example 3: String Reversal with 2 Tapes

**Problem:** Given input $w = w_1 w_2 \ldots w_n$, produce $w^R = w_n w_{n-1} \ldots w_1$.

### 2-Tape Algorithm

1. **Tape 1:** Input $w$. Scan to the right end.
2. **Tape 2:** Empty initially.
3. Scan tape 1 from right to left, writing each character to tape 2 (moving right):

| Tape 1 (right→left) | Tape 2 (left→right) |
|---------------------|---------------------|
| Read $w_n$ | Write $w_n$ |
| Read $w_{n-1}$ | Write $w_{n-1}$ |
| $\vdots$ | $\vdots$ |
| Read $w_1$ | Write $w_1$ |

4. Result: Tape 2 contains $w_n w_{n-1} \ldots w_1 = w^R$

**Time:** $O(n)$ — just two passes!

**Single-tape comparison:** Reversing in place on a single tape requires $O(n^2)$ (repeated swapping of characters).

---

## Example 4: Binary Multiplication with 3 Tapes

**Problem:** Given binary numbers $x$ and $y$, compute $x \times y$.

### Algorithm Sketch

- **Tape 1:** Number $x$ (multiplicand)
- **Tape 2:** Number $y$ (multiplier), scan bit by bit
- **Tape 3:** Accumulator (running sum)

For each bit $y_i$ of $y$ (from LSB to MSB):

1. If $y_i = 1$: add shifted $x$ to tape 3
2. Shift $x$ left by one position (multiply by 2)
3. Move to next bit of $y$

This is the standard "grade school multiplication" but much cleaner with 3 tapes.

**Time:** $O(n^2)$ for $n$-bit numbers (same as grade school, but simpler transitions).

---

## Formal Theorem Statement

**Theorem (Hennie & Stearns, 1966):** Let $M$ be a $k$-tape TM that halts on all inputs and runs in time $t(n) \geq n$. Then there exists a single-tape TM $S$ that simulates $M$ and runs in time $O(t(n) \log t(n))$.

This improves the naive $O(t(n)^2)$ bound! The technique uses a clever "block" data structure on the single tape.

However, for most theory courses, the $O(t(n)^2)$ simulation is sufficient and easier to understand.

---

## Try It Yourself

### Exercise 1: 2-Tape Design

Design a 2-tape TM that decides:

$$
L = \{w \# w \mid w \in \{0, 1\}^*\}
$$

Describe the algorithm and analyze its time complexity.

**Solution sketch:**

1. Copy everything before $\#$ from tape 1 to tape 2
2. Skip $\#$ on tape 1
3. Compare tape 1 (after $\#$) with tape 2 character by character
4. Accept if all match and both end simultaneously

**Time:** $O(n)$ with 2 tapes. Compare to $O(n^2)$ on single tape!

### Exercise 2: Simulation Trace

Given a 2-tape TM with the configuration:

- Tape 1: $a \underline{b} c$ (head on $b$)
- Tape 2: $\underline{x} y$ (head on $x$)

Show the single-tape representation used in the simulation.

**Answer:**

$$
\# a \dot{b} c \# \dot{x} y \#
$$

### Exercise 3: Multi-track Design

Design a 2-track TM that:

- Track 1: holds input $w \in \{a, b\}^*$
- Track 2: marks positions where $w$ has the character $a$

Give the transition function for the marking phase.

**Answer:** For each cell, if track 1 contains $a$, write $\checkmark$ on track 2:

$$
\delta(q_{mark}, (a, \sqcup)) = (q_{mark}, (a, \checkmark), R)
$$

$$
\delta(q_{mark}, (b, \sqcup)) = (q_{mark}, (b, \sqcup), R)
$$

$$
\delta(q_{mark}, (\sqcup, \sqcup)) = (q_{done}, (\sqcup, \sqcup), S)
$$

### Exercise 4: Complexity Analysis

A 3-tape TM recognizes a certain language in $O(n \log n)$ time. What can you say about:

(a) The time on a single-tape TM?

$$
O((n \log n)^2) = O(n^2 \log^2 n)
$$

(b) Is the language in P?

$$
\text{Yes, because } O(n^2 \log^2 n) \text{ is polynomial in } n.
$$

### Exercise 5: Proof

Prove that a 2-tape TM where tape 2 is **read-only** is strictly weaker than a general 2-tape TM. (Hint: consider space usage.)

### Exercise 6: Alphabet Size

A multi-track TM has 3 tracks, each with alphabet $\{0, 1, \sqcup\}$. How many symbols does the equivalent single-tape TM need?

$$
|\Gamma'| = 3 \times 3 \times 3 = 27 \text{ symbols}
$$

### Exercise 7: Real-World Analogy

Explain how a multi-tape TM is analogous to a computer with multiple hard drives. What corresponds to "independent heads"?

---

## Key Takeaways

$$
\boxed{
k\text{-tape TM} \equiv \text{single-tape TM (with at most quadratic slowdown)}
}
$$

1. Multi-tape TMs read all heads simultaneously and move them independently
2. The single-tape simulation uses interleaving with head markers
3. Multi-track TMs are standard TMs with a product alphabet — no overhead
4. Multi-tape can provide polynomial speedups but not computability differences
5. The class P is robust across single-tape and multi-tape definitions

---

## What's Next?

In the next lesson, we'll study **Nondeterministic Turing Machines** — machines that can "try all possibilities at once" — and prove they too are equivalent to standard TMs.

---
