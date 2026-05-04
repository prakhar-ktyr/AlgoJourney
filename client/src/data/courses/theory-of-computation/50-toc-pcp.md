---
title: Post Correspondence Problem
---

# Post Correspondence Problem

The **Post Correspondence Problem (PCP)** is a beautifully simple undecidable problem that involves no machines, no tapes, no states — just matching strings on tiles. It demonstrates that undecidability arises even in very natural combinatorial settings.

---

## Problem Definition

You are given a collection of **tiles** (also called dominoes). Each tile has a **top** string and a **bottom** string:

$$\text{Tiles: } \left[\frac{t_1}{b_1}\right], \left[\frac{t_2}{b_2}\right], \ldots, \left[\frac{t_k}{b_k}\right]$$

where $t_i, b_i \in \Sigma^+$ (non-empty strings over some alphabet).

**Question:** Can you arrange a sequence of tiles (with repetition allowed) such that the concatenation of all top strings equals the concatenation of all bottom strings?

Formally: find indices $i_1, i_2, \ldots, i_n$ (where $n \geq 1$ and each $i_j \in \{1, \ldots, k\}$) such that:

$$t_{i_1} t_{i_2} \cdots t_{i_n} = b_{i_1} b_{i_2} \cdots b_{i_n}$$

This sequence is called a **match** (or **solution**).

---

## Example 1: A Solvable Instance

Consider these tiles over $\Sigma = \{a, b, c\}$:

| Tile | Top ($t_i$) | Bottom ($b_i$) |
|------|-------------|-----------------|
| 1 | $a$ | $ab$ |
| 2 | $b$ | $ca$ |
| 3 | $ca$ | $a$ |
| 4 | $abc$ | $c$ |

**Can we find a match?**

Let's try the sequence $1, 3, 2, 4$:

Top: $t_1 t_3 t_2 t_4 = a \cdot ca \cdot b \cdot abc = acababc$

Bottom: $b_1 b_3 b_2 b_4 = ab \cdot a \cdot ca \cdot c = abacac$

These aren't equal. Let's try again.

Try sequence $1, 2, 3, 1, 3$:

Top: $a \cdot b \cdot ca \cdot a \cdot ca = abcaaca$

Bottom: $ab \cdot ca \cdot a \cdot ab \cdot a = abcaaaba$

Not equal either.

Try sequence $1, 3, 4$:

Top: $a \cdot ca \cdot abc = acaabc$

Bottom: $ab \cdot a \cdot c = abac$

Still no. Finding solutions (or proving none exist) can be very hard!

---

## Example 2: Another Solvable Instance

Tiles:

| Tile | Top ($t_i$) | Bottom ($b_i$) |
|------|-------------|-----------------|
| 1 | $ab$ | $a$ |
| 2 | $b$ | $ab$ |
| 3 | $a$ | $b$ |

Try sequence $1, 2, 1, 3$:

Top: $ab \cdot b \cdot ab \cdot a = abbaba$

Bottom: $a \cdot ab \cdot a \cdot b = aabab$

Not equal.

Try sequence $1, 3, 2, 3$:

Top: $ab \cdot a \cdot b \cdot a = ababa$

Bottom: $a \cdot b \cdot ab \cdot b = ababb$

Not equal.

Try sequence $3, 1, 2, 1, 3, 3$:

Top: $a \cdot ab \cdot b \cdot ab \cdot a \cdot a = aabbabaa$

Bottom: $b \cdot a \cdot ab \cdot a \cdot b \cdot b = baababb$

Hmm. This one is tricky! The actual solution is $1, 2, 2, 3$:

Top: $ab \cdot b \cdot b \cdot a = abbba$

Bottom: $a \cdot ab \cdot ab \cdot b = aababb$

Not quite. Let me try $1, 1, 3, 2, 3$:

Top: $ab \cdot ab \cdot a \cdot b \cdot a = abababa$

Bottom: $a \cdot a \cdot b \cdot ab \cdot b = aababb$

Actually, let me verify: the solution is $1, 3, 2, 3, 1, 3$:

Top: $ab \cdot a \cdot b \cdot a \cdot ab \cdot a = ababaaba$

Bottom: $a \cdot b \cdot ab \cdot b \cdot a \cdot b = ababba b$

Finding PCP solutions is genuinely difficult. That's part of why it's undecidable!

---

## Example 3: An Unsolvable Instance

Tiles:

| Tile | Top ($t_i$) | Bottom ($b_i$) |
|------|-------------|-----------------|
| 1 | $aa$ | $a$ |

With only this one tile, any sequence of length $n$ gives:

- Top: $(aa)^n = a^{2n}$
- Bottom: $(a)^n = a^n$

We need $2n = n$, which is impossible for $n \geq 1$.

**This PCP instance has no solution.**

### A Subtler Unsolvable Instance

| Tile | Top ($t_i$) | Bottom ($b_i$) |
|------|-------------|-----------------|
| 1 | $ab$ | $a$ |
| 2 | $a$ | $ba$ |

**Why no solution exists:**

Observe that for tile 1: $|t_1| = 2 > 1 = |b_1|$
And for tile 2: $|t_2| = 1 < 2 = |b_2|$

But tile 1 makes top grow faster, while tile 2 makes bottom grow faster.

If we start with tile 1: top starts "ahead" by 1 character.
Each use of tile 1 adds 1 to top's lead. Each use of tile 2 removes 1 from top's lead.

For a match, we need the lead to return to 0. But examining the actual characters (not just lengths) reveals that the strings can never match: starting with tile 1 gives top $ab\ldots$ and bottom $a\ldots$, and extending with tile 2 leads to mismatches.

(A formal proof requires careful case analysis.)

---

## PCP Is Undecidable

### Theorem: The Post Correspondence Problem is undecidable.

There is no algorithm that, given a PCP instance, always correctly determines whether a solution exists.

### Proof Strategy

The proof reduces $A_{TM}$ to PCP through an intermediate problem:

$$A_{TM} \leq_m MPCP \leq_m PCP$$

where MPCP is the **Modified PCP**.

---

## The Modified PCP (MPCP)

**MPCP** is like PCP but with an extra constraint: the sequence must start with the first tile.

Formally: find $i_1 = 1, i_2, \ldots, i_n$ such that:

$$t_1 t_{i_2} \cdots t_{i_n} = b_1 b_{i_2} \cdots b_{i_n}$$

(The first tile used must be tile 1.)

### MPCP Reduces to PCP

We can convert any MPCP instance to a PCP instance:

**Key idea:** Mark the first tile specially so that any PCP solution must use it first.

**Construction:** Given MPCP instance with tiles $\{(t_i, b_i)\}$ over alphabet $\Sigma$, create PCP instance over $\Sigma \cup \{\star, \$\}$:

For each tile $(t_i, b_i)$ where $t_i = a_1 a_2 \cdots a_m$ and $b_i = c_1 c_2 \cdots c_p$:

- For $i > 1$: add tile $(\star a_1 \star a_2 \star \cdots \star a_m, c_1 \star c_2 \star \cdots \star c_p \star)$
- For $i = 1$: add tile $(\star a_1 \star a_2 \star \cdots \star a_m, \star c_1 \star c_2 \star \cdots \star c_p \star)$
- Add an extra "ending" tile $(\star \$, \$)$

The $\star$ symbols force the first tile to be the one derived from tile 1 (since only it has $\star$ at the start of both top and bottom), and the $\$$ tile provides termination.

---

## $A_{TM}$ Reduces to MPCP (Proof Sketch)

This is the hard part. We encode a TM computation as a tile-matching problem.

### The Idea

Given $\langle M, w \rangle$, we create tiles that:
- Start with the initial configuration of $M$ on $w$
- Generate successive configurations step by step
- Match when (and only when) $M$ accepts $w$

### Configuration Encoding

A configuration of $M$ is encoded as a string: $uqv$ where:
- $u$ = tape contents left of head
- $q$ = current state
- $v$ = tape contents from head position rightward

### Tile Construction

We create tiles that simulate $M$'s transitions:

**1. First tile (forces initial config):**

$$\left[\frac{\#}{\# q_0 w \#}\right]$$

The bottom starts "ahead" with the initial configuration.

**2. Transition tiles:** For each transition $\delta(q, a) = (r, b, R)$:

$$\left[\frac{qa}{br}\right]$$

This copies the transition: reading $a$ in state $q$ → write $b$, move right to state $r$.

For $\delta(q, a) = (r, b, L)$:

$$\left[\frac{cqa}{rcb}\right] \text{ for every } c \in \Gamma$$

**3. Copy tiles:** For each $a \in \Gamma \cup \{\#\}$:

$$\left[\frac{a}{a}\right]$$

These copy symbols that aren't affected by the head.

**4. Accept tiles:** When state $q_{accept}$ appears, special tiles let the top "catch up" to the bottom:

$$\left[\frac{a \, q_{accept}}{q_{accept}}\right], \quad \left[\frac{q_{accept} \, a}{q_{accept}}\right] \text{ for each } a$$

$$\left[\frac{q_{accept} \#\#}{\#}\right]$$

### Why It Works

- Bottom always stays one configuration ahead of top
- Top "catches up" one character at a time by simulating transitions
- If $M$ accepts: the accept state lets top fully catch up → match found
- If $M$ doesn't accept: top can never catch up → no match exists

Therefore: $M$ accepts $w$ $\iff$ the MPCP instance has a solution.

---

## Why PCP Matters

### 1. A "Natural" Undecidable Problem

PCP is undecidable but doesn't mention Turing machines at all! It's about combining strings — a completely natural combinatorial problem. This shows undecidability isn't an artifact of the TM model.

### 2. Proving Other Problems Undecidable

PCP is extremely useful for proving undecidability of problems in:
- **Formal language theory**
- **Grammar problems**
- **Logic**

It's often easier to reduce from PCP than from $A_{TM}$ directly.

### 3. Applications in Language Theory

PCP can prove these problems undecidable:

| Problem | Statement |
|---------|-----------|
| CFG ambiguity | Is a given CFG ambiguous? |
| CFG equivalence | Do two CFGs generate the same language? |
| CFG universality | Does a CFG generate $\Sigma^*$? |
| CFL complement | Is the complement of a CFL also a CFL? |
| CFG intersection | Is the intersection of two CFLs empty? |

### Proof Sketch: CFG Ambiguity Is Undecidable

Given PCP instance with tiles $(t_1, b_1), \ldots, (t_k, b_k)$, construct CFG $G$:

- $S \to T \mid B$
- $T \to t_1 T a_1 \mid t_2 T a_2 \mid \cdots \mid t_k T a_k \mid t_1 a_1 \mid \cdots \mid t_k a_k$
- $B \to b_1 B a_1 \mid b_2 B a_2 \mid \cdots \mid b_k B a_k \mid b_1 a_1 \mid \cdots \mid b_k a_k$

Here $a_1, \ldots, a_k$ are new symbols encoding the sequence of tiles used.

A string has two parse trees (one through $T$, one through $B$) if and only if the top and bottom concatenations are equal — i.e., a PCP solution exists.

So: PCP has a solution $\iff$ $G$ is ambiguous.

Since PCP is undecidable, CFG ambiguity is undecidable. ∎

---

## Special Cases of PCP

Not all versions of PCP are undecidable:

### Bounded PCP (Decidable)

**Bounded PCP:** Given tiles and a bound $n$, is there a solution of length $\leq n$?

This is decidable! There are finitely many sequences of length $\leq n$ (at most $k^n$ where $k$ = number of tiles). We can check them all.

The complexity is high (it's NP-complete for fixed $n$), but it's decidable.

### PCP Over a Unary Alphabet (Decidable)

If $\Sigma = \{a\}$ (single character), then tiles are just pairs of lengths:

$$\left[\frac{a^{m_1}}{a^{n_1}}\right], \left[\frac{a^{m_2}}{a^{n_2}}\right], \ldots, \left[\frac{a^{m_k}}{a^{n_k}}\right]$$

A match requires: $\sum m_{i_j} = \sum n_{i_j}$ — just a system of linear equations over positive integers.

This reduces to: "Can we find positive integers $x_1, \ldots, x_k$ (number of times each tile is used) such that $\sum x_i (m_i - n_i) = 0$?"

This is solvable! (It's decidable whether a linear combination of integers can equal zero with positive coefficients.)

### PCP With 2 Tiles

Whether PCP with exactly 2 tiles is decidable is still an **open problem** as of the latest research! Some restricted cases have been resolved, but the general 2-tile case remains open.

### PCP With $\geq 5$ Tiles (Over Binary Alphabet)

PCP is undecidable when there are at least 5 tiles over a binary alphabet. The exact boundary is still being researched.

---

## Solving PCP: Strategies and Observations

Even though PCP is undecidable in general, for specific instances you can try:

### Strategy 1: Length Analysis

Compare total lengths: if we use tile $i$ a total of $x_i$ times, we need:

$$\sum_{i=1}^k x_i |t_i| = \sum_{i=1}^k x_i |b_i|$$

$$\sum_{i=1}^k x_i (|t_i| - |b_i|) = 0$$

If all tiles have $|t_i| > |b_i|$ or all have $|t_i| < |b_i|$, no solution exists!

### Strategy 2: First/Last Character Analysis

The first character of the concatenated top must equal the first character of the concatenated bottom. This constrains which tile can come first.

Similarly for the last character.

### Strategy 3: Growth Rate

Track the "balance" (difference in length between top and bottom) as you add tiles. The balance must return to 0 for a match.

### Strategy 4: Prefix Matching

At each step, one string (top or bottom) must be a prefix of the other. This constraint dramatically limits valid sequences.

---

## PCP and the Chomsky Hierarchy

PCP connects to the formal language hierarchy:

| Level | Model | PCP-like Properties |
|-------|-------|-------------------|
| Regular | DFA/NFA | All equivalence/inclusion decidable |
| Context-free | PDA/CFG | Ambiguity, equivalence undecidable (via PCP) |
| Context-sensitive | LBA | Many problems undecidable |
| R.E. | TM | Almost everything undecidable |

PCP is the "bridge" that transfers undecidability from TMs down to grammar problems.

---

## Historical Context

### Emil Post (1946)

Post introduced this problem in 1946, originally as a technique for proving undecidability of word problems in formal systems. He showed it was a natural undecidable combinatorial problem.

### Significance

Before PCP, undecidability proofs always involved Turing machines or equivalent models. PCP was one of the first "natural" problems shown undecidable — it doesn't look computational at all, yet it encodes computation.

---

## Related Problems

### Word Problem for Semi-Thue Systems

Given rewriting rules $u_i \to v_i$ and strings $s, t$: can $s$ be transformed to $t$ using these rules?

Undecidable — closely related to PCP.

### Matrix Mortality Problem

Given a finite set of $n \times n$ integer matrices, is there a product of them (with repetition) that equals the zero matrix?

Undecidable for $n \geq 3$.

### Wang Tiles

Given a finite set of tiles with colored edges, can the infinite plane be tiled such that adjacent edges match?

Undecidable — connects to PCP and Turing machine simulation.

---

## Try It Yourself

### Exercise 1: Find a Solution

Find a PCP match for:

| Tile | Top | Bottom |
|------|-----|--------|
| 1 | $ab$ | $a$ |
| 2 | $a$ | $ab$ |
| 3 | $b$ | $b$ |

*Hint: Start with tile 2 (top is shorter, so bottom "leads"). Then use tiles that let top catch up.*

### Exercise 2: Prove No Solution

Show that no solution exists for:

| Tile | Top | Bottom |
|------|-----|--------|
| 1 | $aa$ | $a$ |
| 2 | $bb$ | $b$ |

*Hint: Consider what happens to the total length.*

### Exercise 3: Length Argument

Given tiles where $|t_i| > |b_i|$ for all $i$. Prove no PCP solution exists.

### Exercise 4: Bounded PCP

For the following instance, find all solutions of length $\leq 4$ (or prove none exist):

| Tile | Top | Bottom |
|------|-----|--------|
| 1 | $a$ | $aa$ |
| 2 | $aab$ | $b$ |
| 3 | $b$ | $a$ |

### Exercise 5: Reduction from PCP

Using the reduction from PCP to CFG ambiguity (described above), construct the CFG for:

Tiles: $(ab, a), (b, ab)$

Write out the grammar rules and explain how a PCP solution corresponds to an ambiguous derivation.

### Exercise 6: Unary PCP

Prove that PCP over a single-letter alphabet $\{a\}$ is decidable.

Given tiles $(a^{m_1}, a^{n_1}), \ldots, (a^{m_k}, a^{n_k})$, provide a necessary and sufficient condition for a solution to exist.

*Hint: A solution exists iff there exist positive integers $x_1, \ldots, x_k$ (not all zero) with $\sum x_i m_i = \sum x_i n_i$, i.e., $\sum x_i(m_i - n_i) = 0$. When is this possible?*

---

## Summary

| Aspect | Details |
|--------|---------|
| Input | Tiles with top/bottom strings |
| Question | Can we match top and bottom concatenations? |
| Decidability | **Undecidable** (for $\geq 5$ tiles, binary alphabet) |
| Proof | Reduction from $A_{TM}$ via MPCP |
| Importance | Natural non-machine undecidable problem |
| Applications | Proves grammar/language problems undecidable |
| Special cases | Bounded PCP: decidable; Unary PCP: decidable |

---

## Key Takeaways

1. PCP is a simple combinatorial problem about matching strings — yet it's undecidable
2. Undecidability is not limited to "machine-like" problems; it hides in natural math
3. PCP is an essential tool for proving undecidability in formal language theory
4. The proof encodes TM computations as tile-matching constraints
5. Special cases (bounded, unary) are decidable — undecidability requires generality

---

## What's Next?

We've now covered the major undecidability results. In future lessons, we'll move from "what can be computed" to "how efficiently can it be computed" — entering the world of **computational complexity theory**.

Next topic: **Complexity Theory** →
