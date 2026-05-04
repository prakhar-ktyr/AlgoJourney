---
title: Turing Machine Formal Definition
---

# Turing Machine Formal Definition

In this lesson, we explore the **formal mathematical details** of Turing Machines in depth — configurations, the yields relation, the crucial distinction between deciders and recognizers, and the language classes they define.

---

## The 7-Tuple Revisited

A Turing Machine is formally defined as:

$$M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$$

| Symbol | Name | Requirements |
|--------|------|-------------|
| $Q$ | State set | Finite, non-empty |
| $\Sigma$ | Input alphabet | Finite, $\sqcup \notin \Sigma$ |
| $\Gamma$ | Tape alphabet | Finite, $\Sigma \subset \Gamma$, $\sqcup \in \Gamma$ |
| $\delta$ | Transition function | $\delta: (Q \setminus \{q_{accept}, q_{reject}\}) \times \Gamma \to Q \times \Gamma \times \{L, R\}$ |
| $q_0$ | Start state | $q_0 \in Q$ |
| $q_{accept}$ | Accept state | $q_{accept} \in Q$ |
| $q_{reject}$ | Reject state | $q_{reject} \in Q$, $q_{reject} \neq q_{accept}$ |

### Key Observations

1. **$\delta$ is undefined on halting states:** The transition function's domain excludes $q_{accept}$ and $q_{reject}$. Once the machine enters either, computation stops immediately.

2. **$\delta$ is total on all other states:** For every non-halting state $q$ and every tape symbol $a \in \Gamma$, $\delta(q, a)$ is defined. The machine always knows what to do next (unless it's halted).

3. **Deterministic:** For each $(q, a)$ pair, there is exactly one $(q', b, D)$ — one next state, one symbol to write, one direction to move. (Nondeterministic TMs exist too, covered later.)

---

## Configurations in Detail

A **configuration** is a snapshot of the entire TM state at one moment:

$$\text{Configuration} = \text{(state, tape contents, head position)}$$

### Formal Encoding

We encode a configuration as a string over $Q \cup \Gamma$:

$$u \, q \, v$$

where:
- $u \in \Gamma^*$ — tape content **to the left** of the head
- $q \in Q$ — current state (its position indicates the head)
- $v \in \Gamma^+$ — tape content **starting from the head position** (first symbol of $v$ is under the head)

The state symbol $q$ is placed **between** the cell to the left of the head and the cell under the head.

### Example

Tape: $\ldots \sqcup \sqcup \mathbf{a} \, \mathbf{b} \, \mathbf{c} \, \mathbf{d} \sqcup \sqcup \ldots$, head on $c$, state $q_3$:

$$\text{Configuration:} \quad ab \, q_3 \, cd$$

We write only the "interesting" part of the tape (omitting infinite blanks on both ends), with the convention that the tape extends with blanks as needed.

---

## Types of Configurations

### Start Configuration

On input $w = w_1 w_2 \cdots w_n$:

$$C_{start} = q_0 \, w_1 w_2 \cdots w_n$$

The head starts on the leftmost symbol of the input, in state $q_0$.

If $w = \varepsilon$ (empty input), the start configuration is $q_0 \, \sqcup$ (head on a blank cell).

### Accepting Configuration

Any configuration of the form $u \, q_{accept} \, v$:

$$C_{accept} = u \, q_{accept} \, v \quad \text{for any } u, v$$

The machine has entered $q_{accept}$ — it **accepts** regardless of what's on the tape.

### Rejecting Configuration

Any configuration of the form $u \, q_{reject} \, v$:

$$C_{reject} = u \, q_{reject} \, v \quad \text{for any } u, v$$

The machine has entered $q_{reject}$ — it **rejects** regardless of tape content.

### Halting Configuration

A configuration is **halting** if it is accepting or rejecting:

$$\text{Halting} = \text{Accepting} \cup \text{Rejecting}$$

A non-halting configuration always has a unique successor (since $\delta$ is total on non-halting states).

---

## The Yields Relation

The **yields** relation $\vdash$ describes how one configuration transitions to the next in one step.

### Definition

We write $C_1 \vdash C_2$ (read "$C_1$ yields $C_2$") if $M$ goes from $C_1$ to $C_2$ in a single step according to $\delta$.

### Formal Rules

Let $\delta(q_i, b) = (q_j, c, D)$. We define $\vdash$ by cases:

**Case 1: Moving Right ($D = R$)**

$$u \, a \, q_i \, b \, v \;\vdash\; u \, a \, c \, q_j \, v$$

The head was on $b$, writes $c$, and moves right (now on first symbol of $v$).

More precisely:
- The symbol $b$ under the head is replaced by $c$
- The state changes from $q_i$ to $q_j$
- The head moves one position to the right

**Special case** (right end of recorded tape): If $v = \varepsilon$:

$$u \, a \, q_i \, b \;\vdash\; u \, a \, c \, q_j \, \sqcup$$

The head moves onto a fresh blank cell.

**Case 2: Moving Left ($D = L$)**

$$u \, a \, q_i \, b \, v \;\vdash\; u \, q_j \, a \, c \, v$$

The head was on $b$, writes $c$, and moves left (now on $a$).

**Special case** (left end of tape): If $u = \varepsilon$:

$$q_i \, b \, v \;\vdash\; q_j \, \sqcup \, c \, v$$

The head moves left onto a new blank cell (tape extends left).

### Multi-Step Yields

We use $\vdash^*$ for the reflexive transitive closure:

$$C_1 \vdash^* C_2 \iff C_1 = C_2 \text{ or } \exists C_3: C_1 \vdash C_3 \vdash^* C_2$$

This means "$C_1$ yields $C_2$ in zero or more steps."

---

## Worked Example: Yields Relation

Let $\delta(q_1, a) = (q_2, X, R)$ and $\delta(q_2, b) = (q_3, Y, L)$.

Starting from configuration $q_1 \, abb$:

**Step 1:** $\delta(q_1, a) = (q_2, X, R)$

$$q_1 \, abb \;\vdash\; X \, q_2 \, bb$$

(Read $a$, write $X$, move right; head now on first $b$.)

**Step 2:** $\delta(q_2, b) = (q_3, Y, L)$

$$X \, q_2 \, bb \;\vdash\; q_3 \, X \, Yb$$

(Read $b$, write $Y$, move left; head now on $X$.)

So: $q_1 \, abb \;\vdash^*\; q_3 \, XYb$ (in 2 steps).

---

## Language of a Turing Machine

### Definition

The **language recognized** (or accepted) by TM $M$ is:

$$L(M) = \{ w \in \Sigma^* \mid M \text{ accepts } w \}$$

$$= \{ w \in \Sigma^* \mid q_0 w \vdash^* u \, q_{accept} \, v \text{ for some } u, v \in \Gamma^* \}$$

A string $w$ is in $L(M)$ if and only if the computation of $M$ on $w$ eventually reaches an accepting configuration.

### What About Strings NOT in $L(M)$?

If $w \notin L(M)$, there are two possibilities:
1. $M$ **rejects** $w$: computation reaches $q_{reject}$ (halts, says "no")
2. $M$ **loops** on $w$: computation runs forever (never halts)

This distinction leads to the two most important language classes.

---

## Deciders vs. Recognizers

### Recognizer (Turing-Recognizable Machine)

A TM $M$ is a **recognizer** for language $L$ if $L = L(M)$.

Behavior of a recognizer on input $w$:
- If $w \in L$: $M$ accepts (guaranteed)
- If $w \notin L$: $M$ rejects OR loops (no guarantee which)

The problem with recognizers: if $M$ has been running for a million steps on input $w$ and hasn't halted, we don't know if it will **eventually** halt or run forever. We can't tell the difference between "still computing" and "stuck in an infinite loop."

### Decider (Turing-Decidable Machine)

A TM $M$ is a **decider** if $M$ **halts on every input**:

$$\forall w \in \Sigma^*: \text{$M$ on $w$ either accepts or rejects (never loops)}$$

A decider for language $L$ satisfies:
- If $w \in L$: $M$ accepts
- If $w \notin L$: $M$ rejects

A decider always gives a definitive yes/no answer in finite time.

### The Hierarchy

$$\text{Every decider is a recognizer, but not every recognizer is a decider.}$$

A decider is a recognizer with the additional guarantee of halting on all inputs.

---

## Turing-Recognizable Languages (RE)

A language $L$ is **Turing-recognizable** (also called **recursively enumerable** or **r.e.**) if there exists a TM $M$ such that $L = L(M)$.

$$\text{RE} = \{ L \mid \exists \text{ TM } M: L(M) = L \}$$

Properties:
- Closed under union, intersection, concatenation, Kleene star
- **NOT** closed under complement (in general)
- If $L$ and $\overline{L}$ are both Turing-recognizable, then $L$ is decidable

### Examples

- Every decidable language is also Turing-recognizable
- The halting problem $HALT = \{(M, w) \mid M \text{ halts on } w\}$ is Turing-recognizable but not decidable
- Some languages are not even Turing-recognizable (e.g., $\overline{HALT}$)

---

## Turing-Decidable Languages (Recursive)

A language $L$ is **Turing-decidable** (also called **recursive** or **decidable**) if there exists a **decider** $M$ such that $L = L(M)$.

$$\text{Decidable} = \{ L \mid \exists \text{ decider } M: L(M) = L \}$$

Properties:
- Closed under union, intersection, complement, concatenation, Kleene star
- Every decidable language is also Turing-recognizable
- $L$ is decidable $\iff$ both $L$ and $\overline{L}$ are Turing-recognizable

### Examples of Decidable Languages

- All regular languages (simulate DFA on TM)
- All context-free languages (run CYK on TM)
- $\{a^n b^n c^n \mid n \geq 0\}$
- $\{(G, w) \mid G \text{ is a CFG and } w \in L(G)\}$

---

## The Language Hierarchy

$$\text{Regular} \subset \text{CFL} \subset \text{Decidable} \subset \text{Turing-Recognizable} \subset \mathcal{P}(\Sigma^*)$$

Each inclusion is **strict** — there exist languages in each class that are not in the one below it.

And there are languages that are **not** Turing-recognizable at all! (We'll see examples in later lessons.)

---

## Complete Example: $L = \{w\#w \mid w \in \{0, 1\}^*\}$

### The Language

$L$ consists of strings of the form $w\#w$ where $w$ is any string over $\{0, 1\}$:

$$\varepsilon\#\varepsilon = \#, \quad 01\#01, \quad 110\#110, \quad \text{etc.}$$

### TM Design

**Machine:** $M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$

- $\Sigma = \{0, 1, \#\}$
- $\Gamma = \{0, 1, \#, X, \sqcup\}$
- States: $q_0$ through $q_8$, $q_{accept}$, $q_{reject}$

### Algorithm (Zig-Zag)

1. **$q_0$:** Read the first uncrossed symbol in the left half.
   - If $\sqcup$ or $\#$: all left symbols checked, go verify right half is done.
   - If $0$: mark with $X$, remember "0", go to $q_1$.
   - If $1$: mark with $X$, remember "1", go to $q_2$.

2. **$q_1$ (carrying "0") / $q_2$ (carrying "1"):** Scan right past $\#$ to find corresponding first uncrossed symbol in right half.
   - If it matches (0 for $q_1$, 1 for $q_2$): mark with $X$, go to $q_3$.
   - If it doesn't match: reject.

3. **$q_3$:** Scan left back to just past the $\#$, then continue left to the first $X$ adjacent to an uncrossed symbol, go to $q_0$.

4. **Final check ($q_4$):** After left half is exhausted, scan right past $\#$ and verify all right-half symbols are crossed.

### Formal Transition Table (Partial)

| State | Read | Write | Move | Next State | Comment |
|-------|------|-------|------|------------|---------|
| $q_0$ | $0$ | $X$ | $R$ | $q_1$ | Mark 0, remember it |
| $q_0$ | $1$ | $X$ | $R$ | $q_2$ | Mark 1, remember it |
| $q_0$ | $\#$ | $\#$ | $R$ | $q_4$ | Left half done, check right |
| $q_1$ | $0, 1$ | same | $R$ | $q_1$ | Scan right (skip left half) |
| $q_1$ | $\#$ | $\#$ | $R$ | $q_5$ | Crossed into right half |
| $q_5$ | $X$ | $X$ | $R$ | $q_5$ | Skip crossed symbols |
| $q_5$ | $0$ | $X$ | $L$ | $q_3$ | Match! Mark and go back |
| $q_5$ | $1$ | $1$ | $R$ | $q_{reject}$ | Mismatch |
| $q_5$ | $\sqcup$ | $\sqcup$ | $R$ | $q_{reject}$ | Right side too short |
| $q_2$ | $0, 1$ | same | $R$ | $q_2$ | Scan right |
| $q_2$ | $\#$ | $\#$ | $R$ | $q_6$ | Crossed into right half |
| $q_6$ | $X$ | $X$ | $R$ | $q_6$ | Skip crossed symbols |
| $q_6$ | $1$ | $X$ | $L$ | $q_3$ | Match! |
| $q_6$ | $0$ | $0$ | $R$ | $q_{reject}$ | Mismatch |
| $q_3$ | any | same | $L$ | $q_3$ | Scan left (until start) |
| $q_3$ | $X$ (at left boundary) | $X$ | $R$ | $q_0$ | Restart |
| $q_4$ | $X$ | $X$ | $R$ | $q_4$ | Verify right half is all X |
| $q_4$ | $\sqcup$ | $\sqcup$ | $R$ | $q_{accept}$ | All matched! |
| $q_4$ | $0, 1$ | — | — | $q_{reject}$ | Unmatched right symbols |

### Trace on Input $01\#01$

| Config | Step |
|--------|------|
| $q_0 \, 01\#01$ | Read 0, mark X, → $q_1$ |
| $X \, q_1 \, 1\#01$ | Scan right |
| $X1 \, q_1 \, \#01$ | See #, → $q_5$ |
| $X1\# \, q_5 \, 01$ | See 0, match! Mark X, → $q_3$ |
| $X1 \, q_3 \, \#X1$ | Scan left |
| $X \, q_3 \, 1\#X1$ | Continue left |
| $q_3 \, X1\#X1$ | See X at boundary, → $q_0$ |
| $X \, q_0 \, 1\#X1$ | Read 1, mark X, → $q_2$ |
| ... (similar zig-zag for 1) ... |
| Eventually: all matched, → $q_{accept}$ |

---

## Multi-Level TM Descriptions

In practice, we describe TMs at three levels of detail:

### Level 1: Formal Description

Complete specification of all 7 components: $Q$, $\Sigma$, $\Gamma$, $\delta$ (full table), $q_0$, $q_{accept}$, $q_{reject}$.

This is the most precise but hardest to read. Used in proofs where exact details matter.

### Level 2: Implementation-Level Description

Describes the head movements and tape operations in English without giving every state explicitly:

> "Scan right to find the first $\#$. Then scan right to find the first unmarked symbol. Compare it with the remembered symbol..."

Gives enough detail to construct the formal description if needed.

### Level 3: High-Level Description

Algorithm-style description without reference to tape/head operations:

> "For each position in the left half, check if it matches the corresponding position in the right half. Accept if all match, reject otherwise."

This is the most readable and is sufficient for most purposes. When we say "design a TM for $L$," a high-level description is usually acceptable.

---

## Try It Yourself

### Exercise 1

Give the configuration sequence for the TM with $\delta(q_0, a) = (q_1, b, R)$ and $\delta(q_1, a) = (q_{accept}, a, L)$ on input $aa$.

<details>
<summary>Solution</summary>

- Start: $q_0 \, aa$
- Step 1: $\delta(q_0, a) = (q_1, b, R)$ → $b \, q_1 \, a$
- Step 2: $\delta(q_1, a) = (q_{accept}, a, L)$ → $q_{accept} \, ba$

The machine accepts $aa$ in 2 steps.

</details>

### Exercise 2

Is the following language decidable or only recognizable?

$$L = \{w \in \{a,b\}^* \mid w \text{ contains an equal number of } a\text{'s and } b\text{'s}\}$$

<details>
<summary>Solution</summary>

$L$ is **decidable**. Here's a decider:

1. Scan the tape, counting: increment for each $a$, decrement for each $b$ (use additional tape symbols or marks to maintain the count).
2. After scanning the entire input, accept if count is 0, reject otherwise.

This always halts (we process each symbol exactly once), so it's a decider.

</details>

### Exercise 3

Prove: if $L$ is decidable, then $\overline{L}$ (the complement) is also decidable.

<details>
<summary>Solution</summary>

Let $M$ be a decider for $L$. Construct $M'$ that:
1. Runs $M$ on input $w$.
2. If $M$ accepts, $M'$ rejects.
3. If $M$ rejects, $M'$ accepts.

Since $M$ is a decider, it halts on every input. Therefore $M'$ also halts on every input (it just flips the answer). So $M'$ is a decider for $\overline{L}$. ∎

Note: This does NOT work for recognizers! If $M$ is only a recognizer (might loop), then step 2 above might never be reached (if $M$ loops, we can't flip the answer).

</details>

### Exercise 4

Prove: $L$ is decidable if and only if both $L$ and $\overline{L}$ are Turing-recognizable.

<details>
<summary>Solution</summary>

**($\Rightarrow$)** If $L$ is decidable, then $L$ is Turing-recognizable (every decider is a recognizer). And $\overline{L}$ is decidable (Exercise 3), hence also Turing-recognizable.

**($\Leftarrow$)** Suppose $M_1$ recognizes $L$ and $M_2$ recognizes $\overline{L}$. Construct decider $M$:

On input $w$:
1. Run $M_1$ and $M_2$ **in parallel** (simulate one step of $M_1$, then one step of $M_2$, alternating).
2. If $M_1$ accepts: accept.
3. If $M_2$ accepts: reject.

Since $w \in L \cup \overline{L} = \Sigma^*$, one of $M_1$ or $M_2$ must eventually accept. So this procedure always halts. ∎

</details>

### Exercise 5

Give a complete configuration trace for the TM with:
- $Q = \{q_0, q_1, q_2, q_{accept}, q_{reject}\}$
- $\Sigma = \{a, b\}$, $\Gamma = \{a, b, \sqcup\}$
- $\delta(q_0, a) = (q_1, b, R)$
- $\delta(q_1, b) = (q_2, a, L)$
- $\delta(q_2, b) = (q_{accept}, b, R)$

on input $ab$.

<details>
<summary>Solution</summary>

- Start: $q_0 \, ab$
- Step 1: $\delta(q_0, a) = (q_1, b, R)$ → $b \, q_1 \, b$
- Step 2: $\delta(q_1, b) = (q_2, a, L)$ → $q_2 \, ba$
- Step 3: $\delta(q_2, b) = (q_{accept}, b, R)$ → $b \, q_{accept} \, a$

The machine accepts $ab$ in 3 steps.

Configuration sequence: $q_0 ab \;\vdash\; b q_1 b \;\vdash\; q_2 ba \;\vdash\; b \, q_{accept} \, a$

</details>

### Exercise 6

A TM $M$ has the property that on every input of length $n$, it halts within $2^n$ steps. Is $M$ necessarily a decider?

<details>
<summary>Solution</summary>

Yes! A decider is a TM that halts on every input. If $M$ halts within $2^n$ steps on every input of length $n$, then $M$ halts on **every** input (since every input has some finite length $n$). Therefore $M$ is a decider.

Note: the bound $2^n$ could be replaced with any computable function $f(n)$ — what matters is that $M$ halts on all inputs, not how quickly it halts.

</details>

---

## Common Pitfalls

### Pitfall 1: Confusing Recognizer and Decider

Remember:
- Every decider is a recognizer ✓
- Not every recognizer is a decider ✗
- "Recognizes $L$" and "decides $L$" are different!

A recognizer for $L$ might loop on strings not in $L$. A decider for $L$ must explicitly reject (halt in $q_{reject}$) on strings not in $L$.

### Pitfall 2: Forgetting the Blank Symbol

The tape alphabet $\Gamma$ always includes $\sqcup$. When designing transitions, you must handle the case where the head reads a blank (it will happen whenever the head moves past the input boundaries).

### Pitfall 3: Configuration Notation

In $uqv$:
- The head is on the **first symbol of $v$**
- $u$ is everything **to the left** of the head
- If $v = \varepsilon$, the head is on a blank cell (tape extends)

Common error: writing $q$ at the wrong position and confusing which cell the head is on.

### Pitfall 4: Assuming TMs Always Halt

Unlike DFAs (which always halt because they process one symbol per step and the input is finite), TMs can:
- Move left indefinitely
- Rewrite the same cells forever
- Enter infinite loops

Never assume a TM halts unless you've specifically designed it to (making it a decider).

---

## The Big Picture

Let's summarize the relationships between language classes and machine types:

```
┌─────────────────────────────────────────────┐
│        All Languages (uncountable)          │
│  ┌───────────────────────────────────────┐  │
│  │    Turing-Recognizable (RE)           │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │      Decidable (Recursive)      │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │  Context-Free Languages   │  │  │  │
│  │  │  │  ┌─────────────────────┐  │  │  │  │
│  │  │  │  │  Regular Languages  │  │  │  │  │
│  │  │  │  └─────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

Each inclusion is **strict**:
- $\{a^n b^n \mid n \geq 0\}$ is CFL but not regular
- $\{a^n b^n c^n \mid n \geq 0\}$ is decidable but not CFL
- The Halting Problem is RE but not decidable
- $\overline{HALT}$ is not even RE

---

## Summary

| Concept | Definition |
|---------|-----------|
| Configuration | $uqv$ — encodes tape + state + head position |
| Start config | $q_0 w$ |
| Halting config | Contains $q_{accept}$ or $q_{reject}$ |
| Yields ($\vdash$) | One-step transition between configurations |
| $L(M)$ | $\{w \mid q_0 w \vdash^* u \, q_{accept} \, v\}$ |
| Recognizer | Accepts $L$, may loop on $\overline{L}$ |
| Decider | Halts on all inputs (never loops) |
| Turing-recognizable (RE) | $\exists$ TM that recognizes it |
| Decidable (recursive) | $\exists$ decider that decides it |
| Key theorem | $L$ decidable $\iff$ $L$ and $\overline{L}$ both RE |

---

## What's Next?

Now that we have the formal machinery, the next lesson focuses on **designing Turing Machines** for various languages — building up your TM design skills through progressively more complex examples.
