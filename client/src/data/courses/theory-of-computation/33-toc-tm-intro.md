---
title: Introduction to Turing Machines
---

# Introduction to Turing Machines

In this lesson, you will meet the **Turing Machine** — the most powerful abstract model of computation ever devised. It captures the full extent of what any algorithm can do, and forms the foundation of computability theory.

---

## Historical Context

In 1936, Alan Turing published his groundbreaking paper *"On Computable Numbers, with an Application to the Entscheidungsproblem"*. In it, he defined a simple abstract machine that could compute anything that is intuitively "computable."

This was years before the first electronic computer was built! Turing's work:

- Formalized the notion of **algorithm** (what it means to compute)
- Answered Hilbert's *Entscheidungsproblem* (decision problem) in the negative
- Proved that some problems are **undecidable** — no algorithm can solve them
- Laid the theoretical foundation for all of computer science

The Turing Machine remains the gold standard definition of computation to this day.

---

## Motivation: Why Do We Need Something More Powerful?

Let's review our computational models so far:

| Model | Memory | Power |
|-------|--------|-------|
| DFA/NFA | None (finite states only) | Regular languages |
| PDA | Stack (LIFO, read only top) | Context-free languages |
| ??? | Unlimited, random access | ??? |

Finite automata have no memory beyond their state. PDAs add a stack, but it's restricted — you can only access the top. Neither can handle languages like:

$$L = \{a^n b^n c^n \mid n \geq 0\}$$

We need a model with **unrestricted memory** — one that can read, write, and move freely across its storage. That model is the **Turing Machine**.

---

## The Turing Machine Model

### Informal Description

Imagine a machine with:

1. **An infinite tape** — divided into cells, each holding one symbol. The tape extends infinitely in both directions (or one direction, with the same power). Initially, the tape contains the input string followed by blanks.

2. **A read/write head** — positioned over one cell at a time. It can:
   - **Read** the symbol in the current cell
   - **Write** a new symbol in the current cell
   - **Move** one cell to the left (L) or right (R)

3. **A finite control** — a finite set of states with a transition function that determines what to do based on current state and symbol under the head.

```
       ┌─────────────────────────────────────────┐
       │  ...  □  □  a  b  b  a  □  □  ...      │  ← infinite tape
       └─────────────────────────────────────────┘
                         ↑
                    ┌────┴────┐
                    │  head   │
                    │ (q₃)   │  ← current state
                    └─────────┘
```

### Everyday Analogy

Think of a Turing Machine like a person with:
- A very long strip of paper (the tape)
- A pencil with an eraser (read/write head)
- A set of written instructions (the transition function)
- A current mental state (the finite control)

The person follows the instructions mechanically:
> "If I'm in state $q_3$ and I see the letter $b$, then erase it and write $X$, move one square to the right, and switch to state $q_5$."

This simple mechanism — despite being incredibly basic — can compute **anything** that any computer can compute.

---

## Key Differences from FA and PDA

| Feature | DFA/NFA | PDA | Turing Machine |
|---------|---------|-----|---------------|
| Memory | None | Stack (LIFO) | Infinite tape (random access) |
| Read/Write | Read only | Read input; push/pop stack | Read AND write tape |
| Movement | Left to right only | Left to right only | Both directions |
| Halting | Always halts | Always halts | May loop forever |
| Power | Regular langs | Context-free langs | All computable langs |

### Critical New Features

1. **Writable memory:** The TM can write symbols on the tape, not just read them. This allows marking, erasing, and transforming the input.

2. **Two-way movement:** The head can go left or right, revisiting earlier parts of the tape. This enables the machine to "remember" by going back.

3. **Infinite storage:** The tape is unbounded, so there's no fixed limit on memory.

4. **Non-halting:** A TM might run forever on some inputs — it's not guaranteed to stop. This is a feature, not a bug — it reflects the reality that some computations don't terminate.

---

## Three Possible Outcomes

When a Turing Machine runs on an input, exactly one of three things happens:

$$\text{TM on input } w \longrightarrow \begin{cases} \text{Accept} & \text{(enters accept state)} \\ \text{Reject} & \text{(enters reject state)} \\ \text{Loop} & \text{(runs forever, never halts)} \end{cases}$$

This is fundamentally different from DFAs and PDAs, which always eventually stop (on finite input). The possibility of looping is what makes the **halting problem** interesting (and undecidable!).

---

## Formal Definition

A **Turing Machine** is a 7-tuple:

$$M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$$

where:

| Component | Description |
|-----------|-------------|
| $Q$ | Finite set of states |
| $\Sigma$ | Input alphabet (finite, does NOT include blank $\sqcup$) |
| $\Gamma$ | Tape alphabet ($\Sigma \subseteq \Gamma$, and $\sqcup \in \Gamma$) |
| $\delta$ | Transition function: $Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$ |
| $q_0$ | Start state ($q_0 \in Q$) |
| $q_{accept}$ | Accept state ($q_{accept} \in Q$) |
| $q_{reject}$ | Reject state ($q_{reject} \in Q$, $q_{reject} \neq q_{accept}$) |

### Important Details

- **$\Gamma$ vs $\Sigma$:** The tape alphabet $\Gamma$ is a superset of the input alphabet $\Sigma$. It includes the blank symbol $\sqcup$ (which fills all tape cells not occupied by input) and possibly additional "work symbols" used during computation.

- **$\delta$ is total on non-halting states:** $\delta(q, a)$ is defined for all $q \notin \{q_{accept}, q_{reject}\}$ and all $a \in \Gamma$. Once the machine enters $q_{accept}$ or $q_{reject}$, it halts immediately.

- **$q_{accept} \neq q_{reject}$:** These must be distinct states. The machine can't simultaneously accept and reject.

---

## Configurations

A **configuration** captures the complete instantaneous state of a TM computation:

- What state the machine is in
- What's written on the tape
- Where the head is positioned

We write a configuration as a string $uqv$ where:
- $u$ is the tape content to the left of the head
- $q$ is the current state (its position in the string indicates the head location)
- $v$ is the tape content at and to the right of the head (starting with the symbol under the head)

### Example

If the tape contains $\ldots \sqcup \sqcup a b \mathbf{c} d \sqcup \sqcup \ldots$ with head on $c$ and state $q_3$:

$$\text{Configuration:} \quad ab\, q_3 \,cd$$

(We omit infinite blanks on both sides.)

### Special Configurations

- **Start configuration** on input $w$: $q_0 w$ (head on leftmost symbol of $w$)
- **Accepting configuration:** any configuration containing $q_{accept}$
- **Rejecting configuration:** any configuration containing $q_{reject}$
- **Halting configuration:** accepting or rejecting

---

## Computation

A **computation** of TM $M$ on input $w$ is a (possibly infinite) sequence of configurations:

$$C_0, C_1, C_2, C_3, \ldots$$

where:
- $C_0 = q_0 w$ (start configuration)
- Each $C_{i+1}$ follows from $C_i$ by one application of $\delta$
- The sequence ends if/when a halting configuration is reached

We say:
- $M$ **accepts** $w$ if the computation reaches an accepting configuration
- $M$ **rejects** $w$ if the computation reaches a rejecting configuration
- $M$ **loops** on $w$ if the computation never reaches a halting configuration

---

## Example 1: TM for $L = \{0^n 1^n \mid n \geq 0\}$

### Algorithm (High-Level)

1. If the tape is empty (all blanks), accept (empty string, $n = 0$).
2. Scan right to find the first unmarked $0$. If no $0$ found, check if all $1$'s are also marked — accept if yes, reject if no.
3. Cross off (mark) the $0$ with an $X$.
4. Scan right to find the first unmarked $1$. If no $1$ found, reject (more $0$'s than $1$'s).
5. Cross off (mark) the $1$ with an $X$.
6. Move head back to the leftmost unmarked symbol and repeat from step 2.

### Implementation-Level Description

States: $q_0$ (start/scan right for 0), $q_1$ (scan right for 1), $q_2$ (scan left back to start), $q_{accept}$, $q_{reject}$.

Tape alphabet: $\Gamma = \{0, 1, X, \sqcup\}$

Transitions:
- $q_0$, read $0$: write $X$, move $R$, go to $q_1$
- $q_0$, read $X$: write $X$, move $R$, stay in $q_0$ (skip marked)
- $q_0$, read $\sqcup$: accept (all matched)
- $q_0$, read $1$: reject (unmatched $1$ on left)

- $q_1$, read $0$ or $X$: move $R$, stay in $q_1$ (scan past)
- $q_1$, read $1$: write $X$, move $L$, go to $q_2$
- $q_1$, read $\sqcup$: reject (no $1$ to match)

- $q_2$, read $0$ or $X$: move $L$, stay in $q_2$
- $q_2$, read $\sqcup$: move $R$, go to $q_0$ (back at start)

### Trace on Input $0011$

| Step | Configuration | Action |
|------|---------------|--------|
| 0 | $q_0\, 0011$ | Read 0, write X, move R, → $q_1$ |
| 1 | $X\, q_1\, 011$ | Read 0, move R, stay $q_1$ |
| 2 | $X0\, q_1\, 11$ | Read 1, write X, move L, → $q_2$ |
| 3 | $X\, q_2\, 0X1$ | Read 0, move L, stay $q_2$ |
| 4 | $q_2\, X0X1$ | Read X, move L, stay $q_2$ |
| 5 | $q_2\, \sqcup X0X1$ | Read $\sqcup$, move R, → $q_0$ |
| 6 | $q_0\, X0X1$ | Read X, move R, stay $q_0$ |
| 7 | $X\, q_0\, 0X1$ | Read 0, write X, move R, → $q_1$ |
| 8 | $XX\, q_1\, X1$ | Read X, move R, stay $q_1$ |
| 9 | $XXX\, q_1\, 1$ | Read 1, write X, move L, → $q_2$ |
| 10 | $XX\, q_2\, XX$ | Read X, move L |
| ... | (scan left to blank) | ... |
| 14 | $q_0\, XXXX$ | Read X, move R ... eventually read $\sqcup$ |
| ... | Accept! | All symbols matched |

---

## Example 2: TM That Adds 1 to a Binary Number

### Problem

Input: binary number on tape (e.g., $1011$).
Output: binary number + 1 on tape (e.g., $1100$).

### Algorithm

1. Move head to the rightmost digit.
2. If it's $0$: change to $1$, done (halt/accept).
3. If it's $1$: change to $0$, move left (carry propagation).
4. If we run off the left end (all digits were $1$): write $1$ in the new position (overflow).

### Transitions

- $q_0$ (move right to end): on $0$ or $1$, move $R$; on $\sqcup$, move $L$, go to $q_1$
- $q_1$ (add): on $0$, write $1$, go to $q_{accept}$; on $1$, write $0$, move $L$, stay $q_1$; on $\sqcup$, write $1$, go to $q_{accept}$

### Trace on $1011$

| Configuration | Action |
|---------------|--------|
| $q_0\, 1011$ | Scan right to end |
| $1011\, q_0\, \sqcup$ | Read blank, move L, → $q_1$ |
| $101\, q_1\, 1$ | Read 1, write 0, move L |
| $10\, q_1\, 10$ | Read 1, write 0, move L |
| $1\, q_1\, 000$ | Read 0, write 1, → $q_{accept}$ |
| $1\, q_{accept}\, 100$ | **Accept!** Tape: $1100$ ✓ |

Indeed $1011_2 = 11$ and $1100_2 = 12$. ✓

---

## State Diagrams for Turing Machines

TM state diagrams are similar to FA diagrams, but transitions are labeled differently:

$$a \to b, D$$

meaning: "If you read $a$, write $b$, and move in direction $D$ (L or R)."

```
        0 → X, R
  ┌───────────────────┐
  │                   ↓
(q₀) ───────────── (q₁)
  ↑    □ → □, R       │
  │                   │
  │   1 → X, L       │
  └───────────────────┘
         (q₂)
```

### Conventions

- Double circle: accept state
- Transitions to reject state often omitted (implicit: any undefined transition leads to reject)
- Arrow labeled $a \to b, D$ on edge from state $p$ to state $q$ means $\delta(p, a) = (q, b, D)$

---

## Why Turing Machines Matter

### The Church-Turing Thesis

The **Church-Turing Thesis** (not a theorem — a thesis/hypothesis) states:

> Any function that can be computed by any "reasonable" model of computation can be computed by a Turing Machine.

This has been validated by decades of research. Every computational model anyone has ever proposed — lambda calculus, recursive functions, register machines, cellular automata, quantum computers (for decidability, not speed) — has been shown to be equivalent to Turing Machines in computational power.

### TMs Model General-Purpose Computers

Your laptop, your phone, any programming language — they can all be simulated by a Turing Machine (given enough time and tape). Conversely, nothing your computer can compute is beyond what a TM can compute.

This makes TMs the **universal benchmark** for what is computable.

### Foundation for Undecidability

Because TMs are the most powerful computational model, proving something can't be done by a TM means it can't be done by **any** computer. This is how we prove problems like the Halting Problem are unsolvable.

---

## The Chomsky Hierarchy (Complete Picture)

With Turing Machines, we can complete the Chomsky Hierarchy:

| Type | Grammar | Automaton | Language Class |
|------|---------|-----------|---------------|
| 3 | Regular (right-linear) | DFA/NFA | Regular |
| 2 | Context-free | PDA | Context-free |
| 1 | Context-sensitive | Linear-bounded automaton | Context-sensitive |
| 0 | Unrestricted | Turing Machine | Recursively enumerable |

Each level strictly contains the one below it:

$$\text{Regular} \subset \text{CFL} \subset \text{CSL} \subset \text{RE}$$

And there are languages not even in RE — they are **undecidable** and **unrecognizable**.

---

## Variants of the Basic TM

Before we move on, let's briefly note that there are several common variations of the TM definition. All are equivalent in computational power:

### One-Way Infinite Tape

Instead of a tape infinite in both directions, the tape extends only to the right (there's a left boundary). The head cannot move left past position 0.

**Equivalence:** A one-way infinite tape TM can simulate a two-way tape by interleaving the left and right halves on a single right-infinite tape using a track system.

### Stay Option

Some definitions allow the head to **stay** in place ($\delta: Q \times \Gamma \to Q \times \Gamma \times \{L, R, S\}$).

**Equivalence:** A "stay" move can be simulated by moving right then left (or left then right). So this adds no power.

### Multiple Tracks

The tape can be divided into $k$ tracks, each cell holding $k$ symbols simultaneously. The tape alphabet becomes $\Gamma^k$.

**Equivalence:** This is just a notational convenience — it's equivalent to having a larger tape alphabet.

We'll explore more powerful-seeming variants (multi-tape, nondeterministic) in later lessons and prove they're all equivalent.

---

## TMs vs Real Computers

You might wonder: how does this simple machine relate to real computers?

| Feature | Real Computer | Turing Machine |
|---------|--------------|----------------|
| Memory | Finite (RAM + disk) | Infinite tape |
| Speed | Billions of ops/sec | One step at a time |
| I/O | Keyboard, screen, network | Tape input, state output |
| Programs | Stored in memory | Encoded in transition function |
| Power | Bounded by finite memory | Unbounded |

**Key insight:** A real computer with finite memory is actually **weaker** than a TM (it's equivalent to a very large DFA!). But since we can always add more memory (in principle), we model real computation with TMs.

In practice:
- If a TM can solve a problem → a real computer can too (given enough memory)
- If a TM **cannot** solve a problem → no computer can, regardless of speed or memory

This is why TM impossibility results (undecidability) are so profound — they apply to all computers past, present, and future.

---

## Historical Note: Other Models

Turing wasn't the only person thinking about computation in the 1930s:

| Person | Model | Year |
|--------|-------|------|
| Alonzo Church | Lambda calculus | 1936 |
| Alan Turing | Turing Machine | 1936 |
| Emil Post | Post production systems | 1936 |
| Stephen Kleene | Recursive functions | 1936 |
| Haskell Curry | Combinatory logic | 1930s |

All of these models were proven to be **equivalent** in power — they can all compute exactly the same set of functions. This remarkable convergence from completely different starting points is strong evidence for the Church-Turing Thesis.

---

## Try It Yourself

### Exercise 1

Design a TM (high-level description) that recognizes $L = \{w\#w \mid w \in \{0,1\}^*\}$.

<details>
<summary>Hint</summary>

Zig-zag: cross off matching symbols one at a time. Cross off the first unchecked symbol in the left half, remember it, scan right past $\#$ to find the corresponding first unchecked symbol in the right half. If they match, cross it off and go back. Repeat until all symbols are checked.

</details>

### Exercise 2

Design a TM that recognizes $L = \{a^n b^n c^n \mid n \geq 0\}$.

<details>
<summary>Hint</summary>

On each pass: cross off one $a$, one $b$, and one $c$. Verify no characters remain when they should all be gone. This uses the TM's ability to traverse the tape multiple times — something a PDA cannot do!

</details>

### Exercise 3

Can a Turing Machine have a tape alphabet equal to the input alphabet (i.e., $\Gamma = \Sigma$)?

<details>
<summary>Solution</summary>

No! The tape alphabet must contain the blank symbol $\sqcup$, and by definition $\sqcup \notin \Sigma$. So $\Gamma$ must always be a proper superset of $\Sigma$: $\Sigma \subset \Gamma$ (at minimum $\Gamma = \Sigma \cup \{\sqcup\}$).

However, it's a theorem that any TM can be simulated by one with $\Gamma = \Sigma \cup \{\sqcup\}$ (no extra work symbols), though this may increase the number of states.

</details>

### Exercise 4

What's the minimum number of states a TM needs to accept a non-empty language?

<details>
<summary>Solution</summary>

Three states: $q_0$, $q_{accept}$, $q_{reject}$ (and $q_{accept} \neq q_{reject}$).

With the transition $\delta(q_0, a) = (q_{accept}, a, R)$ for some $a \in \Sigma$, the TM accepts any string starting with $a$ in one step. The simplest non-empty language it could accept is something like $\{a\}$ with appropriate transitions.

</details>

### Exercise 5

Describe (high-level) a TM that decides whether a binary string represents an even number.

<details>
<summary>Solution</summary>

On input $w$:
1. Scan right to the last symbol before $\sqcup$.
2. If the last symbol is $0$: accept (even).
3. If the last symbol is $1$: reject (odd).

This is a decider (always halts after one scan). Note that an even simpler approach: the TM only needs to check the rightmost bit!

</details>

### Exercise 6

Can a TM accept a finite language? If so, is it always decidable?

<details>
<summary>Solution</summary>

Yes, a TM can accept any finite language. In fact, every finite language is decidable. Here's why:

For any finite language $L = \{w_1, w_2, \ldots, w_k\}$, we can build a TM that:
1. Compares the input against each $w_i$ (hard-coded in the states).
2. Accepts if it matches any $w_i$, rejects otherwise.

Since there are finitely many strings to check and each comparison takes finite time, this TM always halts. Every finite language is not just decidable but also regular (accepted by a DFA).

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Inventor | Alan Turing (1936) |
| Components | Infinite tape, read/write head, finite control |
| Formal definition | 7-tuple $(Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$ |
| Key power | Can read, write, and move both directions on infinite tape |
| Outcomes | Accept, reject, or loop forever |
| Configuration | $uqv$ — encodes tape content + head position + state |
| vs DFA/PDA | Strictly more powerful (unrestricted memory) |
| Church-Turing Thesis | TMs can compute anything any computer can |
| Importance | Foundation of computability theory |

---

## What's Next?

In the next lesson, we dive deeper into the **formal definition and semantics** of Turing Machines — configurations, the yields relation, the distinction between deciders and recognizers, and the language classes they define.
