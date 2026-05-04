---
title: Pushdown Automata
---

# Pushdown Automata (PDA)

In this lesson, you will learn about **Pushdown Automata** — the class of machines that recognize context-free languages by augmenting finite automata with a stack.

---

## Motivation: Why We Need More Than Finite Automata

Recall that finite automata (DFA/NFA) can only recognize **regular languages**. They cannot handle languages that require "memory" of unbounded depth, such as:

$$L = \{a^n b^n \mid n \geq 0\}$$

The problem is that a finite automaton has a **fixed number of states** — it cannot count arbitrarily high. We need a machine with **unlimited memory**.

The solution: add a **stack** to a finite automaton. This gives us a **Pushdown Automaton (PDA)**.

---

## The Idea: FA + Stack = PDA

A PDA is essentially a finite automaton equipped with a stack:

```
         ┌──────────────┐
Input: a a a b b b ──►│  Finite     │
         │  Control     │
         │  (states)    │
         └──────┬───────┘
                │ push/pop
         ┌──────┴───────┐
         │    Stack      │
         │   ┌───┐      │
         │   │ A │ ← top│
         │   ├───┤      │
         │   │ A │      │
         │   ├───┤      │
         │   │ Z │      │
         │   └───┘      │
         └──────────────┘
```

The stack provides **unbounded memory** with one restriction: access is **LIFO** (Last In, First Out). You can only read/write the top of the stack.

---

## Formal Definition

A **pushdown automaton** is a 7-tuple:

$$P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$$

where:

| Symbol | Meaning |
|--------|---------|
| $Q$ | Finite set of states |
| $\Sigma$ | Input alphabet |
| $\Gamma$ | Stack alphabet |
| $\delta$ | Transition function |
| $q_0 \in Q$ | Start state |
| $Z_0 \in \Gamma$ | Initial stack symbol |
| $F \subseteq Q$ | Set of accept (final) states |

### The Transition Function

The transition function $\delta$ is defined as:

$$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)$$

This means: given a state, an input symbol (or $\varepsilon$), and the top of the stack, the PDA can transition to a new state and replace the stack top with a string of stack symbols.

**Reading $\delta(q, a, X) \ni (p, \gamma)$:**
- Current state: $q$
- Input symbol read: $a$ (or $\varepsilon$ for no input consumed)
- Stack top (popped): $X$
- New state: $p$
- String pushed onto stack: $\gamma$ (leftmost symbol becomes new top)

---

## How a PDA Operates

At each step, the PDA:

1. **Reads** the current input symbol (or makes an $\varepsilon$-move without reading)
2. **Pops** the top symbol from the stack
3. Based on (state, input, popped symbol), **chooses** a transition
4. **Pushes** a string onto the stack (possibly empty = just pop)
5. **Moves** to the new state

### Special Cases of Stack Operations

| Push String $\gamma$ | Effect |
|----------------------|--------|
| $\varepsilon$ | Pop only (stack shrinks by 1) |
| $X$ | Stack unchanged (pop $X$, push $X$ back) |
| $YX$ | Push $Y$ on top of $X$ (stack grows by 1) |
| $YZX$ | Push $Y$, $Z$ on top (stack grows by 2) |

**Convention:** When we write "push $YX$", we mean $Y$ is the new top and $X$ is below it.

---

## Instantaneous Description (Configuration)

A **configuration** (or instantaneous description, ID) captures the complete state of a PDA at any moment:

$$(q, w, \gamma)$$

where:
- $q$ = current state
- $w$ = remaining input to be read
- $\gamma$ = current stack contents (leftmost = top)

### Moves Between Configurations

If $\delta(q, a, X) \ni (p, \beta)$, then:

$$(q, aw, X\alpha) \vdash (p, w, \beta\alpha)$$

We read this as: "the PDA moves from configuration $(q, aw, X\alpha)$ to $(p, w, \beta\alpha)$ in one step."

The reflexive-transitive closure $\vdash^*$ denotes zero or more steps.

---

## Acceptance Modes

There are two equivalent ways a PDA can accept a string:

### Mode 1: Acceptance by Final State

$$L(P) = \{w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^* (q_f, \varepsilon, \gamma) \text{ for some } q_f \in F, \gamma \in \Gamma^*\}$$

The PDA accepts $w$ if:
- It starts in $q_0$ with $Z_0$ on the stack
- After reading all of $w$, it reaches some final state $q_f \in F$
- The stack contents don't matter

### Mode 2: Acceptance by Empty Stack

$$N(P) = \{w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^* (q, \varepsilon, \varepsilon) \text{ for some } q \in Q\}$$

The PDA accepts $w$ if:
- It starts in $q_0$ with $Z_0$ on the stack
- After reading all of $w$, the stack is completely empty
- The state doesn't matter (no final states needed)

### Equivalence of Both Modes

**Theorem:** For every PDA $P_1$ that accepts by final state, there exists a PDA $P_2$ that accepts the same language by empty stack, and vice versa.

**Proof sketch (final state → empty stack):**
- Add a new state $q_e$ (the "emptying" state)
- From any final state, add $\varepsilon$-transitions to $q_e$
- In $q_e$, pop everything off the stack

**Proof sketch (empty stack → final state):**
- Add a new bottom marker $X_0$ below $Z_0$
- Add a new start state that pushes $Z_0$ on top of $X_0$
- Add a new final state $q_f$
- If the original PDA would empty its stack, we'll see $X_0$ on top — transition to $q_f$

---

## Example 1: PDA for $\{a^n b^n \mid n \geq 0\}$

### Intuition

- Phase 1: Read $a$'s and push them onto the stack
- Phase 2: Read $b$'s and pop $a$'s for each $b$
- Accept: when input is finished and stack is empty (or back to $Z_0$)

### Formal Definition

$P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ where:

- $Q = \{q_0, q_1, q_2\}$
- $\Sigma = \{a, b\}$
- $\Gamma = \{A, Z_0\}$
- $F = \{q_2\}$

### Transitions

| State | Input | Stack Top | Next State | Push |
|-------|-------|-----------|------------|------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ |
| $q_0$ | $b$ | $A$ | $q_1$ | $\varepsilon$ |
| $q_1$ | $b$ | $A$ | $q_1$ | $\varepsilon$ |
| $q_1$ | $\varepsilon$ | $Z_0$ | $q_2$ | $Z_0$ |

### Trace on Input $aabb$

$$(q_0,\; aabb,\; Z_0)$$
$$\vdash (q_0,\; abb,\; AZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; bb,\; AAZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_1,\; b,\; AZ_0) \quad \text{[pop } A \text{, match } b \text{]}$$
$$\vdash (q_1,\; \varepsilon,\; Z_0) \quad \text{[pop } A \text{, match } b \text{]}$$
$$\vdash (q_2,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

Input consumed, in final state $q_2$. **Accepted!** ✓

### Trace on Input $aab$ (Should Reject)

$$(q_0,\; aab,\; Z_0)$$
$$\vdash (q_0,\; ab,\; AZ_0)$$
$$\vdash (q_0,\; b,\; AAZ_0)$$
$$\vdash (q_1,\; \varepsilon,\; AZ_0)$$

Input consumed but not in a final state (stack still has $A$). **Rejected!** ✗

---

## Example 2: PDA for Even Palindromes $\{ww^R \mid w \in \{a,b\}^*\}$

### Intuition

- Phase 1: Read the first half and push each symbol
- Phase 2: Read the second half (reversed) and pop matching symbols
- **Challenge:** We don't know where the middle is! → Use **non-determinism**

### Formal Definition

$P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ where:

- $Q = \{q_0, q_1, q_2\}$
- $\Sigma = \{a, b\}$
- $\Gamma = \{A, B, Z_0\}$
- $F = \{q_2\}$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | Push in first half |
| $q_0$ | $b$ | $Z_0$ | $q_0$ | $BZ_0$ | Push in first half |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | Push in first half |
| $q_0$ | $a$ | $B$ | $q_0$ | $AB$ | Push in first half |
| $q_0$ | $b$ | $A$ | $q_0$ | $BA$ | Push in first half |
| $q_0$ | $b$ | $B$ | $q_0$ | $BB$ | Push in first half |
| $q_0$ | $\varepsilon$ | any | $q_1$ | same | **Guess middle!** |
| $q_1$ | $a$ | $A$ | $q_1$ | $\varepsilon$ | Match in second half |
| $q_1$ | $b$ | $B$ | $q_1$ | $\varepsilon$ | Match in second half |
| $q_1$ | $\varepsilon$ | $Z_0$ | $q_2$ | $Z_0$ | Accept |

### Key Insight: Non-Determinism

The transition from $q_0$ to $q_1$ on $\varepsilon$ is the **non-deterministic guess** of the middle point. The PDA "tries all possible midpoints" simultaneously (conceptually).

### Trace on Input $abba$

$$(q_0,\; abba,\; Z_0)$$
$$\vdash (q_0,\; bba,\; AZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; ba,\; BAZ_0) \quad \text{[push } B \text{]}$$
$$\vdash (q_1,\; ba,\; BAZ_0) \quad \text{[guess middle here!]}$$
$$\vdash (q_1,\; a,\; AZ_0) \quad \text{[match } b \text{ with } B \text{]}$$
$$\vdash (q_1,\; \varepsilon,\; Z_0) \quad \text{[match } a \text{ with } A \text{]}$$
$$\vdash (q_2,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

---

## Deterministic vs Non-Deterministic PDAs

### Key Difference

| Feature | DPDA | NPDA |
|---------|------|------|
| Transitions | At most one choice | Multiple choices |
| Power | Recognizes DCFLs | Recognizes all CFLs |
| Equivalent? | **NO!** DPDA $\subsetneq$ NPDA | — |

### DPDA $\neq$ NPDA (Unlike DFA = NFA!)

This is a crucial difference from finite automata! For FAs, deterministic and non-deterministic have the same power. But for PDAs:

$$\text{DCFL} \subsetneq \text{CFL}$$

**Example:** The language of even palindromes $\{ww^R\}$ is context-free but NOT deterministic context-free. No DPDA can recognize it because you cannot determine the middle without non-determinism.

### Languages Recognized by DPDAs

DPDAs recognize **deterministic context-free languages (DCFLs)**, which include:
- All regular languages
- $\{a^n b^n \mid n \geq 0\}$
- Most programming language grammars

DCFLs are closed under complement (unlike general CFLs!).

---

## PDA State Diagrams

We draw PDA transitions as:

$$q \xrightarrow{a,\; X \;/\; \gamma} p$$

meaning: in state $q$, reading $a$, with $X$ on top, go to $p$ and replace $X$ with $\gamma$.

Notation:
- $a, X / \gamma$: read $a$, pop $X$, push $\gamma$
- $\varepsilon, X / \gamma$: don't read input, pop $X$, push $\gamma$
- $a, X / \varepsilon$: read $a$, pop $X$, push nothing (net: just pop)
- $a, X / YX$: read $a$, pop $X$, push $YX$ (net: push $Y$ on top)

---

## PDA for a Simple Programming Construct

### Language: Matched Parentheses

$L = \{w \in \{(, )\}^* \mid w \text{ is a balanced sequence of parentheses}\}$

**PDA Design:**
- Push $($ for every $($
- Pop for every $)$
- Accept if stack is back to initial marker

Transitions:
- $\delta(q_0, (, Z_0) = \{(q_0, (Z_0)\}$ — push first $($
- $\delta(q_0, (, () = \{(q_0, (()\}$ — push subsequent $($
- $\delta(q_0, ), () = \{(q_0, \varepsilon)\}$ — pop matching $($... wait, this needs care
- $\delta(q_0, \varepsilon, Z_0) = \{(q_f, Z_0)\}$ — accept when done

Let me redo this cleanly:

| State | Input | Stack Top | Next State | Push |
|-------|-------|-----------|------------|------|
| $q_0$ | $($ | $Z_0$ | $q_0$ | $LZ_0$ |
| $q_0$ | $($ | $L$ | $q_0$ | $LL$ |
| $q_0$ | $)$ | $L$ | $q_0$ | $\varepsilon$ |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ |

where $L$ represents a left parenthesis on the stack.

---

## Summary of PDA Computation

A PDA computation on input $w$:

1. **Starts** in configuration $(q_0, w, Z_0)$
2. **Applies** transitions step by step
3. **Accepts** if it reaches a configuration $(q_f, \varepsilon, \gamma)$ with $q_f \in F$ (final state mode) or $(q, \varepsilon, \varepsilon)$ (empty stack mode)
4. **Rejects** if no accepting computation exists (for non-deterministic PDAs, we reject only if ALL branches reject)

---

## Formal Definition of DPDA

A **deterministic pushdown automaton (DPDA)** is a PDA where for every configuration, there is **at most one** possible move. Formally, for all $q \in Q$, $a \in \Sigma$, $X \in \Gamma$:

1. $|\delta(q, a, X)| + |\delta(q, \varepsilon, X)| \leq 1$

This means: if an $\varepsilon$-transition is available, no input-reading transition can be available for the same state and stack top (and vice versa). And there's at most one choice for any input/stack combination.

### Examples of DPDA-Recognizable Languages

- $\{a^n b^n \mid n \geq 0\}$ — push $a$'s, pop for $b$'s (deterministic!)
- $\{a^n b^{2n} \mid n \geq 0\}$ — push for $a$'s, pop every two $b$'s
- All regular languages (DFA is a DPDA with no stack usage)
- Most programming language constructs

### Not DPDA-Recognizable

- $\{ww^R \mid w \in \{a,b\}^*\}$ — need to guess the middle
- $\{w \in \{a,b\}^* \mid w = w^R\}$ — odd palindromes also need guessing

---

## Multiple Stack Symbols: Encoding Information

The stack alphabet $\Gamma$ can have multiple symbols to encode different types of information:

### Example: Different Markers

For $L = \{a^m b^n c^m d^n \mid m, n \geq 0\}$ (NOT context-free! — this can't be done with a PDA), but for simpler cases like $L = \{a^m b^n c^{m+n}\}$:

- Use marker $A$ for $a$'s
- Use marker $B$ for $b$'s
- Push $A$ for each $a$, push $B$ for each $b$
- Pop (either $A$ or $B$) for each $c$

This way the stack "remembers" the total count $m + n$.

---

## PDA Computation Trees

For non-deterministic PDAs, the computation on an input $w$ can be visualized as a **tree**:

- **Root:** initial configuration $(q_0, w, Z_0)$
- **Children of a node:** all configurations reachable in one step
- **Leaves:** configurations where no transition is possible
- **Accepting leaf:** a leaf where input is consumed and acceptance condition holds

The PDA **accepts** if at least one path from root to an accepting leaf exists.

The PDA **rejects** if ALL paths lead to non-accepting leaves.

---

## Extended Example: PDA for $\{a^n b^m c^n \mid n, m \geq 0\}$

This language requires $a$'s and $c$'s to match, with any number of $b$'s in between.

### PDA Design

$P = (\{q_0, q_1, q_2, q_f\}, \{a, b, c\}, \{A, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | Push for $a$ |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | Push for $a$ |
| $q_0$ | $b$ | $A$ | $q_1$ | $A$ | Switch to $b$'s (keep stack) |
| $q_0$ | $b$ | $Z_0$ | $q_1$ | $Z_0$ | $b$'s with no $a$'s |
| $q_0$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Skip $b$'s, pop for $c$ |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Accept (zero $a$'s and $c$'s) |
| $q_1$ | $b$ | $A$ | $q_1$ | $A$ | More $b$'s (stack unchanged) |
| $q_1$ | $b$ | $Z_0$ | $q_1$ | $Z_0$ | More $b$'s (no $a$'s case) |
| $q_1$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Switch to $c$'s, pop |
| $q_1$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | No $c$'s needed (n=0) |
| $q_2$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Pop for each $c$ |
| $q_2$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Done, accept |

### Trace on Input $aabbbcc$

$$(q_0,\; aabbbcc,\; Z_0)$$
$$\vdash (q_0,\; abbbcc,\; AZ_0)$$
$$\vdash (q_0,\; bbbcc,\; AAZ_0)$$
$$\vdash (q_1,\; bbcc,\; AAZ_0)$$
$$\vdash (q_1,\; bcc,\; AAZ_0)$$
$$\vdash (q_1,\; cc,\; AAZ_0)$$
$$\vdash (q_2,\; c,\; AZ_0)$$
$$\vdash (q_2,\; \varepsilon,\; Z_0)$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

### Key Insight

During the $b$ phase, the stack is **unchanged** — we keep the stack top as is. PDAs can "pass through" input without modifying the stack, preserving information for later matching.

---

## Exercises

### Exercise 1

Design a PDA (by final state) for the language:

$$L = \{a^n b^{2n} \mid n \geq 0\}$$

Give the formal 7-tuple and trace the computation on $aabbbb$.

### Exercise 2

Design a PDA (by empty stack) for:

$$L = \{a^i b^j \mid i > j \geq 0\}$$

### Exercise 3

Consider the PDA with transitions:
- $\delta(q_0, a, Z_0) = \{(q_0, AZ_0)\}$
- $\delta(q_0, a, A) = \{(q_0, AA)\}$
- $\delta(q_0, b, A) = \{(q_1, \varepsilon)\}$
- $\delta(q_1, b, A) = \{(q_1, \varepsilon)\}$
- $\delta(q_1, \varepsilon, Z_0) = \{(q_2, Z_0)\}$

With $F = \{q_2\}$. What language does this PDA recognize?

### Exercise 4

Explain why the language $\{a^n b^n c^n \mid n \geq 0\}$ cannot be recognized by any PDA. (You will prove this formally using the pumping lemma for CFLs in a later lesson.)

### Exercise 5

Convert the following PDA (acceptance by final state) to one that accepts by empty stack:
- States: $\{q_0, q_1, q_f\}$, start: $q_0$, final: $\{q_f\}$
- $\delta(q_0, a, Z_0) = \{(q_0, AZ_0)\}$
- $\delta(q_0, b, A) = \{(q_1, \varepsilon)\}$
- $\delta(q_1, b, A) = \{(q_1, \varepsilon)\}$
- $\delta(q_1, \varepsilon, Z_0) = \{(q_f, Z_0)\}$

### Exercise 6

Design a DPDA for $\{a^n b^n c^m \mid n, m \geq 0\}$. Prove it is deterministic by verifying the DPDA condition for every state/stack combination.

### Exercise 7

Show that the PDA for even palindromes (Example 2) is inherently non-deterministic: prove that no DPDA can recognize $\{ww^R \mid w \in \{a,b\}^+\}$. (Informal argument is acceptable.)

---

## Summary

In this lesson, you learned:

- **PDA = FA + stack**: the stack provides unbounded LIFO memory
- **Formal definition**: $P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$
- **Transitions**: $\delta(q, a, X) \ni (p, \gamma)$ — read $a$, pop $X$, push $\gamma$, change state
- **Configurations**: $(q, w, \gamma)$ — snapshot of PDA state
- **Two acceptance modes**: final state and empty stack (equivalent in power)
- **Non-determinism is essential**: DPDA $\subsetneq$ NPDA (unlike DFA = NFA)
- PDAs recognize exactly the **context-free languages**

---

## Key Formulas

| Concept | Definition |
|---------|-----------|
| PDA | $(Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ |
| Transition | $\delta: Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)$ |
| Configuration | $(q, w, \gamma) \in Q \times \Sigma^* \times \Gamma^*$ |
| Accept (final state) | $(q_0, w, Z_0) \vdash^* (q_f, \varepsilon, \gamma)$ |
| Accept (empty stack) | $(q_0, w, Z_0) \vdash^* (q, \varepsilon, \varepsilon)$ |

---

*Next lesson: We'll practice PDA design with many more examples and learn systematic strategies!*
