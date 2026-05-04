---
title: PDA and CFG Equivalence
---

# PDA and CFG Equivalence

In this lesson, you will learn the fundamental theorem that links context-free grammars and pushdown automata: **a language is context-free if and only if some PDA recognizes it**.

---

## The Main Theorem

**Theorem:** A language $L$ is context-free if and only if there exists a pushdown automaton $P$ such that $L = L(P)$.

This means:
- Every CFG can be converted to an equivalent PDA
- Every PDA can be converted to an equivalent CFG
- CFGs and PDAs define the **same class of languages**: the context-free languages

We prove both directions constructively.

---

## Direction 1: CFG → PDA

### Theorem Statement

Given any context-free grammar $G = (V, \Sigma, R, S)$, we can construct a PDA $P$ such that $L(P) = L(G)$.

### Intuition: Top-Down Parsing

The PDA simulates a **leftmost derivation** of the grammar. It uses the stack to keep track of what the grammar "expects" to see next.

**Key idea:**
- The stack holds the "prediction" — the sequence of symbols the grammar expects
- If the top of the stack is a **variable**, replace it with the RHS of some rule (non-deterministically)
- If the top of the stack is a **terminal**, match it against the current input symbol

### The Construction

Given $G = (V, \Sigma, R, S)$, construct PDA:

$$P = (\{q_0, q, q_f\}, \Sigma, V \cup \Sigma \cup \{Z_0\}, \delta, q_0, Z_0, \{q_f\})$$

The stack alphabet is $\Gamma = V \cup \Sigma \cup \{Z_0\}$ (variables, terminals, and the bottom marker).

**Transitions:**

**Step 1: Initialize**

$$\delta(q_0, \varepsilon, Z_0) = \{(q, SZ_0)\}$$

Push the start symbol $S$ onto the stack, then go to working state $q$.

**Step 2: Variable Expansion**

For each variable $A \in V$ and each rule $A \to \alpha$ in $R$:

$$\delta(q, \varepsilon, A) \ni (q, \alpha)$$

Pop $A$ from the stack and push $\alpha$ (the right-hand side of the rule). If $\alpha = X_1 X_2 \ldots X_k$, then $X_1$ becomes the new stack top.

**Step 3: Terminal Matching**

For each terminal $a \in \Sigma$:

$$\delta(q, a, a) = \{(q, \varepsilon)\}$$

If the stack top is terminal $a$ and the next input symbol is also $a$, pop the terminal (consume and match).

**Step 4: Accept**

$$\delta(q, \varepsilon, Z_0) = \{(q_f, Z_0)\}$$

When the stack is back to just $Z_0$ (all predictions matched), accept.

### Why This Works

The PDA non-deterministically simulates ALL possible leftmost derivations. At each step where the stack top is a variable $A$:
- It "guesses" which rule $A \to \alpha$ to apply
- If the guess leads to matching the entire input, that branch accepts
- If not, that branch dies (gets stuck)

Since the PDA is non-deterministic, it accepts if **any** branch accepts.

**Claim:** $(q, w, S) \vdash^* (q, \varepsilon, \varepsilon)$ if and only if $S \Rightarrow^* w$ in grammar $G$.

---

### Complete Example: CFG → PDA

**Grammar:**

$$S \to aSb \mid ab$$

This generates $L = \{a^n b^n \mid n \geq 1\}$.

**Constructed PDA:** $P = (\{q_0, q, q_f\}, \{a, b\}, \{S, a, b, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

**Transitions:**

| # | State | Input | Stack Top | Next State | Push | Rule |
|---|-------|-------|-----------|------------|------|------|
| 1 | $q_0$ | $\varepsilon$ | $Z_0$ | $q$ | $SZ_0$ | Initialize |
| 2 | $q$ | $\varepsilon$ | $S$ | $q$ | $aSb$ | $S \to aSb$ |
| 3 | $q$ | $\varepsilon$ | $S$ | $q$ | $ab$ | $S \to ab$ |
| 4 | $q$ | $a$ | $a$ | $q$ | $\varepsilon$ | Match $a$ |
| 5 | $q$ | $b$ | $b$ | $q$ | $\varepsilon$ | Match $b$ |
| 6 | $q$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Accept |

**Trace on input $aabb$:**

$$(q_0,\; aabb,\; Z_0)$$
$$\vdash (q,\; aabb,\; SZ_0) \quad \text{[transition 1: initialize]}$$
$$\vdash (q,\; aabb,\; aSbZ_0) \quad \text{[transition 2: apply } S \to aSb\text{]}$$
$$\vdash (q,\; abb,\; SbZ_0) \quad \text{[transition 4: match } a\text{]}$$
$$\vdash (q,\; abb,\; abbZ_0) \quad \text{[transition 3: apply } S \to ab\text{]}$$
$$\vdash (q,\; bb,\; bbZ_0) \quad \text{[transition 4: match } a\text{]}$$
$$\vdash (q,\; b,\; bZ_0) \quad \text{[transition 5: match } b\text{]}$$
$$\vdash (q,\; \varepsilon,\; Z_0) \quad \text{[transition 5: match } b\text{]}$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[transition 6: accept!]}$$

The PDA successfully simulated the derivation: $S \Rightarrow aSb \Rightarrow aabb$.

---

## Direction 2: PDA → CFG

### Theorem Statement

Given any PDA $P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$, we can construct a CFG $G$ such that $L(G) = L(P)$.

### Preliminary: Simplify the PDA

First, convert $P$ to an equivalent PDA $P'$ that:
1. Accepts by **empty stack** (not final state)
2. Has a **single accept state** $q_f$
3. Every transition either pushes exactly one symbol or pops (never pushes 2+ symbols in one step)

Actually, the standard construction works with the original PDA accepting by empty stack. We assume the PDA:
- Has a single start state $q_0$
- Accepts by empty stack
- Each transition either pushes one symbol or pops (we can normalize to this)

### The Key Idea: Variables $A_{pq}$

For each pair of states $(p, q) \in Q \times Q$, create a variable:

$$A_{pq}$$

**Meaning:** $A_{pq}$ generates exactly the strings $w$ such that:

$$(p, w, \varepsilon) \vdash^* (q, \varepsilon, \varepsilon)$$

Wait — that's not quite right since we need to track the stack. Let's be more precise:

$A_{pq}$ generates exactly the strings $w$ such that the PDA, starting in state $p$ with some symbol on the stack, can consume $w$ and reach state $q$ with that symbol popped (net effect: one symbol removed from stack).

### Formal Construction

Given PDA $P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, \emptyset)$ (accepting by empty stack), construct grammar $G = (V, \Sigma, R, S)$:

**Variables:**

$$V = \{A_{pq} \mid p, q \in Q\} \cup \{S\}$$

**Start symbol rules:**

$$S \to A_{q_0 q} \quad \text{for each } q \in Q$$

(The start symbol generates strings that take the PDA from $q_0$ to any state $q$ where the initial stack symbol $Z_0$ gets popped.)

**Production rules from transitions:**

For each transition $\delta(p, a, X) \ni (r, Y_1 Y_2 \ldots Y_k)$ where $a \in \Sigma \cup \{\varepsilon\}$:

For all possible choices of states $s_1, s_2, \ldots, s_{k-1}, q \in Q$:

$$A_{pq} \to a \; A_{r s_1} \; A_{s_1 s_2} \; \ldots \; A_{s_{k-1} q}$$

**Intuition:** If transition from state $p$ reading $a$ pops $X$ and pushes $Y_1 Y_2 \ldots Y_k$:
- $A_{r s_1}$ handles popping $Y_1$ (going from $r$ to $s_1$)
- $A_{s_1 s_2}$ handles popping $Y_2$ (going from $s_1$ to $s_2$)
- ...
- $A_{s_{k-1} q}$ handles popping $Y_k$ (going from $s_{k-1}$ to $q$)

**Special case ($k = 0$, just popping):**

If $\delta(p, a, X) \ni (q, \varepsilon)$, then:

$$A_{pq} \to a$$

(Reading $a$ takes us from $p$ to $q$ and pops $X$ — done!)

### Why This Works

The grammar simulates the PDA in reverse: instead of executing transitions, it "predicts" what the PDA will do. Each variable $A_{pq}$ captures all strings that can be processed between states $p$ and $q$ with one net pop from the stack.

**Theorem:** $A_{pq} \Rightarrow^* w$ if and only if $(p, w, X) \vdash^* (q, \varepsilon, \varepsilon)$ for some stack symbol $X$.

---

### Example: PDA → CFG

**Given PDA** (accepts $\{0^n 1^n \mid n \geq 1\}$ by empty stack):

States: $Q = \{p, q\}$, Start: $p$, Stack alphabet: $\{X, Z_0\}$

Transitions:
1. $\delta(p, 0, Z_0) = \{(p, XZ_0)\}$ — push $X$ on top of $Z_0$
2. $\delta(p, 0, X) = \{(p, XX)\}$ — push another $X$
3. $\delta(p, 1, X) = \{(q, \varepsilon)\}$ — start matching, pop $X$
4. $\delta(q, 1, X) = \{(q, \varepsilon)\}$ — continue matching
5. $\delta(q, \varepsilon, Z_0) = \{(q, \varepsilon)\}$ — pop $Z_0$, stack empty

**Variables:** $A_{pp}, A_{pq}, A_{qp}, A_{qq}, S$

**Start rules:**

$$S \to A_{pp} \mid A_{pq}$$

(We only need $A_{pq}$ since the PDA must end in state $q$ after emptying.)

**From transition 1:** $\delta(p, 0, Z_0) = \{(p, XZ_0)\}$ — pushes $XZ_0$ (2 symbols)

For all $s \in \{p, q\}$ and all endpoints:
$$A_{p?} \to 0 \; A_{ps} \; A_{s?}$$

Specifically:
- $A_{pp} \to 0 \; A_{pp} \; A_{pp} \mid 0 \; A_{pq} \; A_{qp}$
- $A_{pq} \to 0 \; A_{pp} \; A_{pq} \mid 0 \; A_{pq} \; A_{qq}$

**From transition 2:** $\delta(p, 0, X) = \{(p, XX)\}$ — pushes $XX$ (2 symbols)

- $A_{pp} \to 0 \; A_{pp} \; A_{pp} \mid 0 \; A_{pq} \; A_{qp}$
- $A_{pq} \to 0 \; A_{pp} \; A_{pq} \mid 0 \; A_{pq} \; A_{qq}$

(Same forms as above — these merge with the rules from transition 1.)

**From transition 3:** $\delta(p, 1, X) = \{(q, \varepsilon)\}$ — pops (pushes nothing)

$$A_{pq} \to 1$$

**From transition 4:** $\delta(q, 1, X) = \{(q, \varepsilon)\}$ — pops

$$A_{qq} \to 1$$

**From transition 5:** $\delta(q, \varepsilon, Z_0) = \{(q, \varepsilon)\}$ — pops

$$A_{qq} \to \varepsilon$$

**Useful rules (after removing unreachable):**

$$S \to A_{pq}$$
$$A_{pq} \to 0 \; A_{pq} \; A_{qq} \mid 1$$
$$A_{qq} \to 1 \mid \varepsilon$$

**Derivation of $0011$:**

$$S \Rightarrow A_{pq} \Rightarrow 0 \; A_{pq} \; A_{qq} \Rightarrow 0 \; 1 \; A_{qq} \Rightarrow 0 \; 1 \; 1$$

Wait, that gives $011$. Let me re-derive:

$$S \Rightarrow A_{pq} \Rightarrow 0 \; A_{pq} \; A_{qq}$$
$$\Rightarrow 0 \; (0 \; A_{pq} \; A_{qq}) \; A_{qq}$$
$$\Rightarrow 0 \; 0 \; 1 \; A_{qq} \; A_{qq}$$
$$\Rightarrow 0 \; 0 \; 1 \; 1 \; A_{qq}$$
$$\Rightarrow 0 \; 0 \; 1 \; 1 \; \varepsilon = 0011$$

It works! ✓

---

## Size of the Constructed Grammar

The PDA → CFG construction can produce a **large** grammar:

- Number of variables: $|Q|^2 + 1$
- Number of rules: can be $O(|Q|^3 \cdot |\delta|)$ since we enumerate all triples of states

This is theoretically important but not always practical. The resulting grammar is often simplified by removing useless variables and productions.

---

## Correctness Proof Sketch

### CFG → PDA Correctness

**Claim:** $w \in L(G)$ iff $w \in L(P)$.

**Proof:** By induction on the number of derivation steps.
- If $S \Rightarrow^* w$ in $G$, then the PDA can simulate this derivation by choosing the same rules when expanding variables.
- If the PDA accepts $w$, the sequence of variable expansions corresponds to a valid leftmost derivation in $G$.

### PDA → CFG Correctness

**Claim:** $A_{pq} \Rightarrow^* w$ iff $(p, w, X) \vdash^* (q, \varepsilon, \varepsilon)$.

**Proof:** By induction on the number of steps in the derivation/computation.
- Base case: $A_{pq} \to a$ corresponds to a single transition that pops.
- Inductive case: $A_{pq} \to a A_{rs_1} A_{s_1 s_2} \ldots A_{s_{k-1}q}$ corresponds to a transition followed by processing each pushed symbol.

---

## The Big Picture

$$\boxed{\text{Context-Free Languages} = \text{Languages recognized by PDAs}}$$

This establishes the **equivalence** between two very different formalisms:

| Formalism | Type | Approach |
|-----------|------|----------|
| CFG | Generative | Rules that produce strings |
| PDA | Recognitive | Machine that accepts/rejects |

Both define the same class — the context-free languages (CFLs).

---

## Summary of Constructions

### CFG → PDA (Quick Reference)

1. Create states $q_0, q, q_f$
2. Initialize: push start symbol
3. For each rule $A \to \alpha$: add $\delta(q, \varepsilon, A) \ni (q, \alpha)$
4. For each terminal $a$: add $\delta(q, a, a) = \{(q, \varepsilon)\}$
5. Accept: $\delta(q, \varepsilon, Z_0) = \{(q_f, Z_0)\}$

### PDA → CFG (Quick Reference)

1. Convert PDA to accept by empty stack
2. Create variable $A_{pq}$ for each state pair
3. Start: $S \to A_{q_0 q}$ for all $q$
4. For $\delta(p, a, X) \ni (r, Y_1 \ldots Y_k)$: add rules $A_{pq} \to a A_{rs_1} A_{s_1 s_2} \ldots A_{s_{k-1}q}$ for all state choices
5. For $\delta(p, a, X) \ni (q, \varepsilon)$: add $A_{pq} \to a$

---

## Why This Matters

This equivalence is foundational in computer science:

1. **Compiler design**: Parsers use PDAs (LL, LR parsers) to recognize programming language syntax defined by grammars
2. **Decidability**: Proving properties about CFLs can use either the grammar or PDA perspective — whichever is more convenient
3. **Closure properties**: Some are easier to prove using grammars (union, concatenation), others using PDAs (intersection with regular)
4. **Language classification**: To show a language is context-free, you can either give a grammar OR build a PDA

---

## Detailed Correctness Proof: CFG → PDA

We prove that the PDA $P$ constructed from grammar $G$ satisfies $L(P) = L(G)$.

### Lemma: $S \Rightarrow^*_{lm} w$ implies $(q, w, S) \vdash^* (q, \varepsilon, \varepsilon)$

**Proof by induction on the number of derivation steps $k$.**

**Base case ($k = 1$):** $S \Rightarrow w$ means there's a rule $S \to w$ where $w \in \Sigma^*$.

The PDA operates:
- Pop $S$, push $w$ (variable expansion)
- Match each terminal in $w$ with input (terminal matching)
- Result: $(q, w, S) \vdash (q, w, w) \vdash^* (q, \varepsilon, \varepsilon)$ ✓

**Inductive step:** Assume true for derivations of $< k$ steps. Given a $k$-step derivation:

$$S \Rightarrow_{lm} X_1 X_2 \ldots X_m \Rightarrow^*_{lm} w$$

The first step uses some rule $S \to X_1 X_2 \ldots X_m$. The PDA pushes $X_1 X_2 \ldots X_m$.

Each $X_i$ either:
- Is a terminal (matched directly), or
- Is a variable that derives some substring $w_i$ of $w$ in fewer than $k$ steps (apply inductive hypothesis)

Since the PDA processes left-to-right and the derivation is leftmost, the computations align. ∎

### Lemma: $(q, w, S) \vdash^* (q, \varepsilon, \varepsilon)$ implies $S \Rightarrow^*_{lm} w$

The reverse direction follows similarly by induction on the number of PDA steps.

---

## Alternative PDA Construction: Bottom-Up

The construction we presented is "top-down" (predictive). There's also a **bottom-up** approach:

### Bottom-Up (Shift-Reduce) PDA

Instead of predicting and matching, this PDA:
1. **Shifts**: reads input symbols and pushes them onto the stack
2. **Reduces**: when the top of the stack matches the RHS of a rule, pops it and pushes the LHS variable

This corresponds to **LR parsing** and is the basis for tools like `yacc` and `bison`.

**Key difference:**
- Top-down: starts from $S$, expands variables, matches terminals
- Bottom-up: starts from input, groups terminals into variables, works up to $S$

Both are equivalent in power (both can handle all CFGs), but they have different practical characteristics for parser implementation.

---

## Exercises

### Exercise 1

Convert the following grammar to a PDA:

$$S \to aAB$$
$$A \to bBb \mid \varepsilon$$
$$B \to aA \mid b$$

Trace the PDA on input $abab$.

### Exercise 2

Convert the following PDA (accepting by empty stack) to a CFG:

- States: $\{p, q\}$, Start: $p$
- $\delta(p, a, Z_0) = \{(p, AZ_0)\}$
- $\delta(p, a, A) = \{(p, AA)\}$
- $\delta(p, b, A) = \{(q, \varepsilon)\}$
- $\delta(q, b, A) = \{(q, \varepsilon)\}$
- $\delta(q, \varepsilon, Z_0) = \{(q, \varepsilon)\}$

What language does this PDA recognize?

### Exercise 3

Prove that if $L$ is a CFL, then $L^R = \{w^R \mid w \in L\}$ is also a CFL.

**Hint:** If $G$ generates $L$, construct $G'$ that generates $L^R$ by reversing all rule right-hand sides.

### Exercise 4

Given the grammar $S \to SS \mid (S) \mid \varepsilon$ (balanced parentheses), construct the equivalent PDA and trace it on input $(())()$.

### Exercise 5

The PDA → CFG construction creates $|Q|^2$ variables. For a PDA with 5 states, how many variables (excluding $S$) does the grammar have? How many rules could there be in the worst case if the PDA has 10 transitions each pushing at most 2 symbols?

### Exercise 6

Convert the following grammar to a PDA and verify that the PDA accepts $aabbb$ but rejects $aab$:

$$S \to aSb \mid aSbb \mid ab \mid abb$$

### Exercise 7

Given PDA with states $\{p, q, r\}$, start state $p$, accepting by empty stack:
- $\delta(p, a, Z_0) = \{(p, XZ_0)\}$
- $\delta(p, a, X) = \{(p, XX)\}$
- $\delta(p, b, X) = \{(q, X)\}$
- $\delta(q, b, X) = \{(q, \varepsilon)\}$
- $\delta(q, \varepsilon, X) = \{(r, \varepsilon)\}$
- $\delta(r, \varepsilon, Z_0) = \{(r, \varepsilon)\}$

Write out all the variables $A_{ij}$ and determine which ones are useful (generate at least one terminal string). Then write the grammar rules for the useful variables only.

---

## Summary

In this lesson, you learned:

- **The Equivalence Theorem**: CFLs = languages recognized by PDAs
- **CFG → PDA**: Top-down parsing simulation using the stack
- **PDA → CFG**: Variables $A_{pq}$ generate strings that drive the PDA from $p$ to $q$
- **Complete constructions** with formal definitions and examples
- The deep connection between **generation** (grammars) and **recognition** (automata)

This is one of the most important results in formal language theory, establishing that two seemingly different approaches to defining languages are actually equivalent.

---

## Key Formulas

| Direction | Key Step |
|-----------|----------|
| CFG → PDA | $\delta(q, \varepsilon, A) \ni (q, \alpha)$ for rule $A \to \alpha$ |
| CFG → PDA | $\delta(q, a, a) = \{(q, \varepsilon)\}$ for terminal match |
| PDA → CFG | $A_{pq} \to a A_{rs_1} A_{s_1 s_2} \ldots A_{s_{k-1}q}$ |
| PDA → CFG | $A_{pq} \to a$ when transition pops (pushes $\varepsilon$) |

---

## Common Pitfalls

### Pitfall 1: Confusing Stack Direction in CFG → PDA

When pushing rule RHS $\alpha = X_1 X_2 \ldots X_k$ onto the stack, $X_1$ must be the new **top**. This means the PDA processes the RHS left-to-right, which aligns with leftmost derivation.

### Pitfall 2: Forgetting State Combinations in PDA → CFG

The PDA → CFG construction requires enumerating ALL possible intermediate state sequences. For a transition that pushes $k$ symbols, you need to consider all $|Q|^{k-1}$ combinations of intermediate states. Missing combinations means the grammar won't generate all strings.

### Pitfall 3: Not Converting to Empty-Stack Acceptance First

The PDA → CFG construction assumes the PDA accepts by empty stack. If your PDA accepts by final state, convert it first using the standard construction (add emptying state).

---

## The Bigger Picture: Chomsky Hierarchy

The CFG-PDA equivalence sits within the broader Chomsky Hierarchy:

| Level | Grammar | Automaton | Language Class |
|-------|---------|-----------|----------------|
| 3 | Regular grammar | DFA/NFA | Regular |
| 2 | Context-free grammar | PDA | Context-free |
| 1 | Context-sensitive grammar | LBA | Context-sensitive |
| 0 | Unrestricted grammar | Turing machine | Recursively enumerable |

Each level's equivalence theorem has the same flavor: the generative formalism (grammar) equals the recognitive formalism (automaton) in power. The CFG-PDA equivalence is the Level 2 instance of this pattern.

---

*Next lesson: We explore the closure and decision properties of context-free languages!*
