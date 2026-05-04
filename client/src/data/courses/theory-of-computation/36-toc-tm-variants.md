---
title: Variants of Turing Machines
---

# Variants of Turing Machines

In this lesson, you will learn about several **variants** of the standard Turing Machine — and discover a remarkable fact: they are all equivalent in computational power.

---

## Why Study Variants?

A natural question arises: "What if we give a Turing Machine more tapes? Or let the tape extend infinitely in both directions?"

The answer is both surprising and deeply important:

> **Every reasonable variant of a Turing Machine can simulate, and be simulated by, the standard single-tape TM.**

This means the class of problems a TM can solve doesn't depend on the specific hardware details. The model is **robust**.

---

## The Standard TM (Recap)

Recall that a standard Turing Machine has:

- A single **one-way infinite tape** (infinite to the right)
- A single **read/write head**
- A transition function:

$$
\delta: Q \times \Gamma \to Q \times \Gamma \times \{L, R\}
$$

The head reads a symbol, writes a symbol, and moves **Left** or **Right**.

---

## Multi-tape Turing Machine

### Definition

A **multi-tape TM** has $k$ tapes, each with its own independent read/write head.

The transition function becomes:

$$
\delta: Q \times \Gamma^k \to Q \times \Gamma^k \times \{L, R, S\}^k
$$

This means:

- Read the symbols under **all** $k$ heads simultaneously
- Based on the current state and those $k$ symbols, decide:
  - A new state
  - $k$ symbols to write (one per tape)
  - $k$ head movements (each can go Left, Right, or Stay)

### How It Works

1. **Input** is placed on tape 1; all other tapes start blank
2. At each step, the machine reads all $k$ tape heads at once
3. It transitions based on the combined reading
4. Each head moves independently

### Example: 2-Tape Palindrome Checker

To check if $w = w^R$ (palindrome):

**Tape 1:** Input string $w$

**Tape 2:** Used as scratch space

**Strategy:**

1. Copy $w$ from tape 1 to tape 2
2. Move tape 1 head to the start
3. Move tape 2 head to the end
4. Compare characters moving tape 1 right and tape 2 left
5. Accept if all match; reject otherwise

This is much simpler than the single-tape version that required repeated zigzagging!

---

### Simulation by a Single-Tape TM

**Theorem:** Every multi-tape TM can be simulated by a single-tape TM.

**Proof idea:** The single tape stores all $k$ tapes sequentially, separated by a delimiter symbol $\#$:

$$
\#\ \dot{a}_1 a_2 a_3\ \#\ b_1 \dot{b}_2 b_3\ \#\ \dot{c}_1 c_2\ \#
$$

- The dotted symbols (e.g., $\dot{a}_1$) mark the **head positions** on each simulated tape
- We use an extended tape alphabet: for each $\gamma \in \Gamma$, add a "dotted" version $\dot{\gamma}$

**Simulation of one step:**

1. Scan the entire tape from left to right to find all $k$ head markers
2. Record the $k$ symbols being read (store in the finite-state control)
3. Look up the transition in the multi-tape TM's $\delta$
4. Make a second pass to update each head position and write new symbols
5. If any tape needs to grow, shift everything to the right

### Time Complexity of Simulation

If the multi-tape TM runs in $t(n)$ steps, each simulated step requires scanning the entire single tape, which has length at most $O(k \cdot t(n))$.

Therefore the single-tape simulation runs in:

$$
O(t(n)) \text{ steps} \times O(t(n)) \text{ per step} = O(t(n)^2)
$$

> **Quadratic slowdown:** A $k$-tape TM running in time $t(n)$ can be simulated by a single-tape TM in time $O(t(n)^2)$.

---

## Multi-track Turing Machine

### Definition

A **multi-track TM** has a single tape, but each cell is divided into $k$ **parallel tracks**.

Think of it as each cell holding a **tuple** of $k$ symbols instead of one symbol:

$$
\text{Cell content} = (\gamma_1, \gamma_2, \ldots, \gamma_k) \in \Gamma^k
$$

The head reads and writes **all tracks simultaneously**.

### How It Differs from Multi-tape

| Feature | Multi-tape | Multi-track |
|---------|-----------|-------------|
| Number of tapes | $k$ separate tapes | 1 tape |
| Number of heads | $k$ independent heads | 1 head |
| Cell content | 1 symbol per cell per tape | $k$ symbols per cell |
| Head movement | Each head moves independently | Single head moves once |

### Why Multi-track is Useful

Multi-track is a convenient way to store **auxiliary information** alongside the main computation:

- **Track 1:** Actual computation symbols
- **Track 2:** Markers (e.g., "visited" flags)
- **Track 3:** Counter values in unary

### Example: Tracking Head Position

Suppose we need to mark certain cells. Instead of using extra states, we can use a second track:

$$
\begin{array}{|c|c|c|c|c|}
\hline
a & b & b & a & \sqcup \\
\hline
0 & 1 & 0 & 1 & 0 \\
\hline
\end{array}
$$

Track 1 holds the input; track 2 holds marker bits.

### Equivalence to Standard TM

A multi-track TM is trivially equivalent to a standard TM:

- Replace the tape alphabet with $\Gamma^k$ (all tuples)
- The transition function works on tuples
- This is just a standard TM with a larger alphabet!

No simulation overhead is needed — the equivalence is **immediate**.

---

## Two-Way Infinite Tape

### Definition

The tape extends infinitely in **both** directions (left and right).

$$
\ldots\ \sqcup\ \sqcup\ \sqcup\ |\ a\ b\ c\ |\ \sqcup\ \sqcup\ \sqcup\ \ldots
$$

No "left boundary" — the head can always move left.

### Equivalence to One-Way Infinite Tape

**Theorem:** A two-way infinite tape TM is equivalent to a standard (one-way infinite) TM.

**Proof:** Fold the two-way tape in half!

Map the two-way tape:

$$
\ldots, c_{-3}, c_{-2}, c_{-1}, c_0, c_1, c_2, c_3, \ldots
$$

to a 2-track one-way tape:

$$
\begin{array}{|c|c|c|c|}
\hline
c_0 & c_1 & c_2 & c_3 & \ldots \\
\hline
\sqcup & c_{-1} & c_{-2} & c_{-3} & \ldots \\
\hline
\end{array}
$$

- **Top track:** cells $0, 1, 2, 3, \ldots$ (right half)
- **Bottom track:** cells $-1, -2, -3, \ldots$ (left half, reversed)

When the original machine moves left past position 0, the simulation switches to the bottom track and reverses direction.

---

## Stay-Put Option

### Definition

The head can **stay** in place in addition to moving left or right:

$$
\delta: Q \times \Gamma \to Q \times \Gamma \times \{L, R, S\}
$$

where $S$ means "stay put" (don't move).

### Equivalence

This is **trivially equivalent** to the standard model.

To simulate $S$ (stay) with only $\{L, R\}$:

1. Move right: $R$
2. Then move left: $L$

The head ends up in the same position! We just need an extra intermediate state.

So $S$ is just syntactic sugar — it doesn't add computational power.

---

## Semi-Infinite Tape TM

### Definition

A **semi-infinite tape** TM has a tape that is infinite only to the right, and the head **cannot move left of the starting position**.

$$
[\ c_0\ |\ c_1\ |\ c_2\ |\ c_3\ |\ \ldots\ \to \infty
$$

If the head is at position 0 and tries to move left, it stays at position 0 (or the machine halts/rejects).

### Equivalence

This is equivalent to the standard one-way infinite TM because the standard TM **already** has this property! The tape extends to the right, and there's a left boundary.

However, sometimes "semi-infinite" means the tape is restricted even further (e.g., no blank space to the right of the input initially). Even so:

- We can always shift the input to make room
- The simulation works with constant overhead

---

## Summary of Variants and Equivalences

| Variant | Equivalent to Standard TM? | Simulation Cost |
|---------|:--------------------------:|:---------------:|
| Multi-tape ($k$ tapes) | Yes | $O(t(n)^2)$ time |
| Multi-track ($k$ tracks) | Yes | No overhead (larger alphabet) |
| Two-way infinite tape | Yes | Constant overhead |
| Stay-put ($S$ move) | Yes | Constant overhead |
| Semi-infinite tape | Yes | Constant overhead |
| Nondeterministic TM | Yes | Exponential time (next lesson) |

---

## Why Equivalence Matters

The equivalence of all these variants demonstrates the **robustness** of the Turing Machine model:

1. **Computability is not fragile** — it doesn't depend on hardware details
2. **The Church-Turing thesis** is strengthened by this robustness
3. **Proofs become easier** — we can use whichever variant is most convenient
4. **Complexity may differ** — while all variants compute the same functions, they may differ in *efficiency*

> **Key Insight:** When proving a language is decidable or recognizable, you can use ANY variant of TM. Pick the one that makes your proof simplest!

---

## A Word on Restricted Models

Not all modifications preserve TM power. **Restricting** the machine can reduce its power:

- **Read-only tape** → Finite automaton (much weaker!)
- **One-way head** (can only move right) → Much weaker than TM
- **Bounded tape** (tape length limited to input length) → Linear Bounded Automaton (weaker, likely)

Adding power never helps (we can't go beyond TM), but restricting can hurt.

---

## Formal Proof: Two-Way Infinite Tape Equivalence

Let $M$ be a TM with a two-way infinite tape. We construct a single-tape TM $S$ with a 2-track tape:

**Alphabet of $S$:** $\Gamma' = (\Gamma \cup \{\sqcup\}) \times (\Gamma \cup \{\sqcup\})$ (pairs of symbols)

**Encoding:** Position $i$ on $S$'s tape stores:

$$
S[i] = \begin{cases}
(M[\text{pos } i], M[\text{pos } {-i}]) & \text{if } i > 0 \\
(M[0], \sqcup) & \text{if } i = 0
\end{cases}
$$

**Simulation rules:**

- $S$ tracks which "virtual tape" (top or bottom) is currently active
- Moving right on the top track = moving right on $M$'s tape
- Moving right on the bottom track = moving LEFT on $M$'s tape (positions $-1, -2, \ldots$)
- Switching tracks happens when $M$ crosses position 0

**State space of $S$:** $Q_S = Q_M \times \{\text{top}, \text{bottom}\}$

This gives a constant-factor overhead — each step of $M$ becomes at most 2 steps of $S$.

$$
\boxed{M \text{ (two-way infinite)} \equiv S \text{ (one-way infinite, 2-track)}}
$$

---

## Formal Proof: Stay-Put Equivalence

**Claim:** A TM with $\{L, R, S\}$ moves is equivalent to a TM with only $\{L, R\}$.

**Proof:** For each transition using $S$ (stay):

$$
\delta(q, a) = (q', b, S)
$$

Replace it with two transitions using an intermediate state $q_{int}$:

$$
\delta(q, a) = (q_{int}, b, R)
$$

$$
\delta(q_{int}, c) = (q', c, L) \quad \text{for all } c \in \Gamma
$$

This moves right then left, returning to the same position. We need $|\Gamma|$ transitions from $q_{int}$ (one for each possible symbol encountered after the right move).

**States added:** At most one new intermediate state per original $S$-transition. Since the original TM has finitely many transitions, we add finitely many states.

**Time overhead:** Each $S$-step becomes 2 steps. So time is at most doubled:

$$
t_{new}(n) \leq 2 \cdot t_{old}(n)
$$

---

## Closure Under Composition

An important consequence of variant equivalence: if $M_1$ and $M_2$ are TMs, we can compose them:

$$
M_1 \circ M_2: \text{ run } M_1 \text{ first, then } M_2 \text{ on the output}
$$

Using a 2-tape TM:

1. Run $M_1$ on tape 1 (input → output on tape 1)
2. Copy tape 1 to tape 2
3. Run $M_2$ on tape 2

Since 2-tape TM $\equiv$ single-tape TM, composition preserves decidability.

---

## Try It Yourself

### Exercise 1: Multi-tape Simulation

Show how a 3-tape TM that computes $f(x) = x + 1$ (on binary strings) would be simulated on a single tape. Draw the single-tape configuration for input $1011$.

### Exercise 2: Two-Way to One-Way

Given a two-way infinite tape with content:

$$
\ldots \sqcup\ \sqcup\ 1\ 0\ \underset{\uparrow}{1}\ 1\ 0\ \sqcup\ \sqcup \ldots
$$

(head at position 0 reading '1'), show the equivalent 2-track one-way tape.

### Exercise 3: Complexity

A multi-tape TM sorts $n$ numbers in $O(n \log n)$ steps. What is the best upper bound for a single-tape TM simulation?

$$
\text{Answer: } O((n \log n)^2) = O(n^2 \log^2 n)
$$

### Exercise 4: Design

Design a 2-tape TM that decides $L = \{a^n b^n c^n \mid n \geq 0\}$.

*Hint:* Use tape 2 as a counter.

**Sketch of solution:**

1. Tape 1: read input
2. For each $a$ read on tape 1, write a mark on tape 2 (count $a$'s)
3. For each $b$ read on tape 1, erase one mark from tape 2 (count $b$'s)
4. If tape 2 isn't empty after all $b$'s → reject ($n_b \neq n_a$)
5. For each $c$ read on tape 1, write a mark on tape 2 (count $c$'s)
6. Compare tape 2 count with original $a$ count

**Time complexity:** $O(n)$ on 2 tapes vs. $O(n^2)$ on single tape!

### Exercise 5: Proof

Prove that a TM with a "jump" instruction (move head to position $i$ in one step) is equivalent to a standard TM.

*Hint:* The standard TM can simulate a "jump to position $i$" by moving one cell at a time. If the current position is $j$, the simulation takes $|i - j|$ steps.

### Exercise 6: Lower Bound Argument

Can you prove that the quadratic slowdown in multi-tape → single-tape simulation is **necessary**? (This is actually an open problem!)

State what is known:

- The palindrome language requires $\Omega(n^2)$ time on a single-tape TM
- It can be solved in $O(n)$ on a 2-tape TM
- This proves that multi-tape can be **strictly faster** for some problems

### Exercise 7: Non-equivalent Variants

Which of the following are NOT equivalent to standard TMs?

(a) TM with 2D tape (grid) — **Equivalent** (encode 2D as 1D)

(b) TM with read-only tape — **Not equivalent** (= finite automaton)

(c) TM where tape is limited to $|w|$ cells — **Not equivalent** (= LBA, probably weaker)

(d) TM with 3 heads on one tape — **Equivalent** (similar to multi-tape)

---

## Key Takeaways

$$
\boxed{
\text{All "reasonable" TM variants} \equiv \text{Standard single-tape TM}
}
$$

1. Multi-tape TMs are equivalent to single-tape TMs with at most quadratic slowdown
2. Multi-track TMs are just standard TMs with a larger alphabet
3. Two-way infinite tapes can be folded into one-way tapes
4. The Stay-put option adds no computational power
5. Robustness of TMs supports the Church-Turing Thesis

---

## What's Next?

In the next lesson, we'll dive deeper into **multi-tape and multi-track TMs** with detailed examples, complete simulation proofs, and complexity analysis.

---

## Quick Reference Table

| Concept | Definition |
|---------|-----------|
| Standard TM | 1 tape, 1 head, $\delta: Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$ |
| Multi-tape TM | $k$ tapes, $k$ heads, $\delta: Q \times \Gamma^k \to Q \times \Gamma^k \times \{L,R,S\}^k$ |
| Multi-track TM | 1 tape, 1 head, cells are $k$-tuples |
| Two-way infinite | Tape extends left and right; fold to simulate |
| Stay-put | $\{L, R, S\}$ moves; $S$ = move right then left |
| Semi-infinite | Standard one-way tape (already the default) |
| Simulation cost | Multi-tape → single-tape: $O(t(n)^2)$ |
| Robustness | All variants compute the same class of functions |

---

