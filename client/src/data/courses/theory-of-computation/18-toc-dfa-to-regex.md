---
title: "DFA to Regular Expression: State Elimination"
---

# DFA to Regular Expression: State Elimination

In this lesson, you'll learn how to convert a DFA into an equivalent regular expression using the **state elimination** method. This completes the equivalence proof:

$$\boxed{\text{DFA} \longleftrightarrow \text{NFA} \longleftrightarrow \text{Regular Expression}}$$

All three formalisms describe the **same** class of languages — the regular languages.

---

## The Goal

Given a DFA $M$ with $L(M) = L$, find a regular expression $R$ such that:

$$L(R) = L(M)$$

This direction (automaton → regex) is often harder for humans than the reverse. The state elimination algorithm provides a **mechanical procedure** that always works.

---

## Generalized NFA (GNFA)

To make state elimination work, we introduce an intermediate representation: the **Generalized NFA** (GNFA).

### What Is a GNFA?

A GNFA is like an NFA, but transitions are labeled with **regular expressions** instead of single symbols or $\varepsilon$.

**Formally:** A GNFA is a 5-tuple $(Q, \Sigma, \delta, q_{start}, q_{accept})$ where:

- $Q$ is a finite set of states
- $\Sigma$ is the alphabet
- $\delta: (Q - \{q_{accept}\}) \times (Q - \{q_{start}\}) \to \mathcal{R}$ maps pairs of states to a regular expression
- $q_{start}$ is the start state
- $q_{accept}$ is the accept state (exactly one)

### GNFA Requirements

A proper GNFA must satisfy:

1. **One start state** with no incoming transitions (arrows only go out)
2. **One accept state** with no outgoing transitions (arrows only go in)
3. Start state $\neq$ accept state
4. Every state (except start and accept) has a transition **to every other state** (except start) and **from every other state** (except accept) — missing transitions are labeled $\emptyset$

### How a GNFA Accepts

A GNFA accepts string $w$ if there exists a sequence of states:

$$q_{start} = s_0, s_1, s_2, \ldots, s_k = q_{accept}$$

and a way to split $w = w_1 w_2 \cdots w_k$ such that:

$$w_i \in L(R_{s_{i-1}, s_i}) \quad \text{for each } i = 1, \ldots, k$$

That is, each piece of the string matches the regex on the corresponding transition.

---

## The State Elimination Algorithm

### Overview

The algorithm works in three phases:

1. **Convert** the DFA to a GNFA (add new start/accept, label transitions)
2. **Eliminate** states one by one until only start and accept remain
3. **Read off** the regex from the single remaining transition

### Phase 1: Convert DFA to GNFA

Given DFA $M = (Q, \Sigma, \delta, q_0, F)$:

**Step 1:** Add a new start state $q_s$ with an $\varepsilon$-transition to the old start state $q_0$.

**Step 2:** Add a new accept state $q_a$ with $\varepsilon$-transitions from all states in $F$ (old accept states).

**Step 3:** If there are multiple transitions between the same pair of states (possible after considering all symbols), combine them with union.

For example, if there are transitions from $q_i$ to $q_j$ on both $a$ and $b$, replace them with a single transition labeled $a \cup b$.

**Step 4:** For any pair of states that has no transition between them, add a transition labeled $\emptyset$ (representing the empty language — effectively no connection).

**Step 5:** The old accept states are no longer accept states. Only $q_a$ is the accept state.

**Result:** A GNFA with states $Q \cup \{q_s, q_a\}$ where every pair has exactly one transition (a regex label).

### Phase 2: Eliminate States

Repeat until only $q_s$ and $q_a$ remain:

**Choose** any state $q_r \in Q - \{q_s, q_a\}$ to eliminate.

**For each pair** $(q_i, q_j)$ where $q_i \in Q - \{q_a, q_r\}$ and $q_j \in Q - \{q_s, q_r\}$:

Update the transition from $q_i$ to $q_j$:

$$\boxed{R_{ij}' = R_{ij} \cup R_{ir}(R_{rr})^* R_{rj}}$$

Where:
- $R_{ij}$ = current label from $q_i$ to $q_j$ (direct path)
- $R_{ir}$ = label from $q_i$ to $q_r$
- $R_{rr}$ = label from $q_r$ to itself (self-loop)
- $R_{rj}$ = label from $q_r$ to $q_j$

**Intuition:** The new label accounts for:
- The **direct path** from $q_i$ to $q_j$ (the old $R_{ij}$), OR
- Going from $q_i$ to $q_r$ (via $R_{ir}$), looping at $q_r$ any number of times (via $(R_{rr})^*$), then going from $q_r$ to $q_j$ (via $R_{rj}$)

After updating all pairs, **remove** state $q_r$ and all its transitions from the GNFA.

### Phase 3: Read the Result

After eliminating all intermediate states, only $q_s$ and $q_a$ remain with a single transition between them. The **label on that transition** is the regular expression for the language.

$$L(M) = L(R_{q_s, q_a})$$

---

## Complete Example 1: Three-State DFA

Consider a DFA over $\Sigma = \{a, b\}$ that accepts strings ending in $b$:

**DFA:**
- States: $\{q_1, q_2\}$
- Start: $q_1$
- Accept: $\{q_2\}$
- Transitions:
  - $\delta(q_1, a) = q_1$
  - $\delta(q_1, b) = q_2$
  - $\delta(q_2, a) = q_1$
  - $\delta(q_2, b) = q_2$

### Step 1: Convert to GNFA

Add new start $q_s$ and new accept $q_a$:

Transitions:
- $q_s \xrightarrow{\varepsilon} q_1$
- $q_1 \xrightarrow{a} q_1$ (self-loop)
- $q_1 \xrightarrow{b} q_2$
- $q_2 \xrightarrow{a} q_1$
- $q_2 \xrightarrow{b} q_2$ (self-loop)
- $q_2 \xrightarrow{\varepsilon} q_a$
- $q_1 \xrightarrow{\emptyset} q_a$ (no direct path from $q_1$ to accept)
- $q_s \xrightarrow{\emptyset} q_2$ (no direct path from new start to $q_2$)
- $q_s \xrightarrow{\emptyset} q_a$ (no direct path from new start to accept)

### Step 2: Eliminate state $q_1$

For each pair $(q_i, q_j)$ not involving $q_1$, update using the formula:

$$R_{ij}' = R_{ij} \cup R_{i,q_1}(R_{q_1,q_1})^* R_{q_1,j}$$

**Pair $(q_s, q_2)$:**

$$R_{s,2}' = R_{s,2} \cup R_{s,q_1}(R_{q_1,q_1})^* R_{q_1,2}$$

$$= \emptyset \cup \varepsilon \cdot a^* \cdot b = a^* b$$

**Pair $(q_s, q_a)$:**

$$R_{s,a}' = R_{s,a} \cup R_{s,q_1}(R_{q_1,q_1})^* R_{q_1,a}$$

$$= \emptyset \cup \varepsilon \cdot a^* \cdot \emptyset = \emptyset$$

**Pair $(q_2, q_2)$:**

$$R_{2,2}' = R_{2,2} \cup R_{2,q_1}(R_{q_1,q_1})^* R_{q_1,2}$$

$$= b \cup a \cdot a^* \cdot b = b \cup a^+ b = (b \cup a^+ b) = (\varepsilon \cup a^+)b = a^* b$$

**Pair $(q_2, q_a)$:**

$$R_{2,a}' = R_{2,a} \cup R_{2,q_1}(R_{q_1,q_1})^* R_{q_1,a}$$

$$= \varepsilon \cup a \cdot a^* \cdot \emptyset = \varepsilon$$

After eliminating $q_1$, the GNFA has:
- $q_s \xrightarrow{a^* b} q_2$
- $q_2 \xrightarrow{a^* b} q_2$ (self-loop)
- $q_2 \xrightarrow{\varepsilon} q_a$
- $q_s \xrightarrow{\emptyset} q_a$

### Step 3: Eliminate state $q_2$

**Pair $(q_s, q_a)$:**

$$R_{s,a}' = R_{s,a} \cup R_{s,q_2}(R_{q_2,q_2})^* R_{q_2,a}$$

$$= \emptyset \cup (a^* b)(a^* b)^* \varepsilon = (a^* b)(a^* b)^* = (a^* b)^+$$

### Result

The regular expression is:

$$\boxed{(a^* b)^+}$$

**Verification:** This matches any non-empty string that ends in $b$, with arbitrary $a$'s before each $b$. That's exactly the language of strings ending in $b$! ✓

We could also write this as $(a \cup b)^* b$, which is equivalent.

---

## Complete Example 2: Even Number of 0s

**DFA** over $\Sigma = \{0, 1\}$ accepting strings with an even number of 0s:

- States: $\{q_E, q_O\}$ (Even, Odd count of 0s seen)
- Start: $q_E$ (zero 0s seen = even)
- Accept: $\{q_E\}$
- Transitions:
  - $\delta(q_E, 0) = q_O$, $\delta(q_E, 1) = q_E$
  - $\delta(q_O, 0) = q_E$, $\delta(q_O, 1) = q_O$

### Step 1: Convert to GNFA

- $q_s \xrightarrow{\varepsilon} q_E$
- $q_E \xrightarrow{1} q_E$ (self-loop)
- $q_E \xrightarrow{0} q_O$
- $q_O \xrightarrow{0} q_E$
- $q_O \xrightarrow{1} q_O$ (self-loop)
- $q_E \xrightarrow{\varepsilon} q_a$
- $q_s \xrightarrow{\emptyset} q_O$, $q_s \xrightarrow{\emptyset} q_a$
- $q_O \xrightarrow{\emptyset} q_a$

### Step 2: Eliminate $q_O$

**Pair $(q_s, q_E)$:**

$$R_{s,E}' = \varepsilon \cup \emptyset \cdot 1^* \cdot 0 = \varepsilon$$

(No change — can't get from $q_s$ to $q_O$ without going through $q_E$.)

**Pair $(q_s, q_a)$:**

$$R_{s,a}' = \emptyset \cup \emptyset \cdot 1^* \cdot \emptyset = \emptyset$$

**Pair $(q_E, q_E)$:**

$$R_{E,E}' = 1 \cup 0 \cdot 1^* \cdot 0 = 1 \cup 01^*0$$

**Pair $(q_E, q_a)$:**

$$R_{E,a}' = \varepsilon \cup 0 \cdot 1^* \cdot \emptyset = \varepsilon$$

After eliminating $q_O$:
- $q_s \xrightarrow{\varepsilon} q_E$
- $q_E \xrightarrow{1 \cup 01^*0} q_E$ (self-loop)
- $q_E \xrightarrow{\varepsilon} q_a$
- $q_s \xrightarrow{\emptyset} q_a$

### Step 3: Eliminate $q_E$

**Pair $(q_s, q_a)$:**

$$R_{s,a}' = \emptyset \cup \varepsilon \cdot (1 \cup 01^*0)^* \cdot \varepsilon = (1 \cup 01^*0)^*$$

### Result

$$\boxed{(1 \cup 01^*0)^*}$$

**Verification:**
- $\varepsilon$: zero 0s (even) ✓
- "11": zero 0s ✓
- "00": two 0s (even) ✓
- "0110": two 0s ✓ (matches $01^*0$ once)
- "010010": four 0s ✓ (matches $01^*0$ twice: "010" and "010")

---

## The Elimination Formula in Detail

The core formula deserves a closer look:

$$R_{ij}' = R_{ij} \cup R_{ir}(R_{rr})^* R_{rj}$$

This captures **all paths** from $q_i$ to $q_j$ that may pass through $q_r$:

| Component | Meaning |
|-----------|---------|
| $R_{ij}$ | Direct path from $q_i$ to $q_j$ (not through $q_r$) |
| $R_{ir}$ | Path from $q_i$ into $q_r$ |
| $(R_{rr})^*$ | Looping at $q_r$ zero or more times |
| $R_{rj}$ | Path from $q_r$ out to $q_j$ |

The union combines the direct path with the "detour through $q_r$" path.

---

## Tips for State Elimination

### Order of Elimination Doesn't Affect Correctness

You can eliminate states in **any order** — the final regex will always describe the same language. However, the **form** of the regex may differ:

- Some orders produce simpler expressions
- Some orders produce more complex (but equivalent) expressions

### Heuristic: Eliminate "Simple" States First

States with few transitions or simple self-loops tend to produce cleaner intermediate expressions.

### Simplify as You Go

After each elimination, simplify the resulting regex labels:

- Replace $R \cup \emptyset$ with $R$
- Replace $R \cdot \varepsilon$ with $R$
- Replace $\emptyset \cdot R$ with $\emptyset$
- Replace $\emptyset^*$ with $\varepsilon$
- Combine common factors

### The Result May Look Different from Expected

State elimination often produces regexes that look unfamiliar. They're equivalent to simpler forms but may need algebraic manipulation to simplify.

---

## Simplifying the Resulting Regex

After state elimination, the regex is often "ugly." Here are simplification techniques:

### Common Simplifications

| Before | After | Rule |
|--------|-------|------|
| $R \cup \emptyset$ | $R$ | $\emptyset$ is identity for union |
| $\emptyset R$ or $R\emptyset$ | $\emptyset$ | $\emptyset$ annihilates |
| $R\varepsilon$ or $\varepsilon R$ | $R$ | $\varepsilon$ is identity for concat |
| $\emptyset^*$ | $\varepsilon$ | Star of empty is $\varepsilon$ |
| $\varepsilon^*$ | $\varepsilon$ | Star of $\varepsilon$ is $\varepsilon$ |
| $(R^*)^*$ | $R^*$ | Double star |
| $RR^*$ | $R^+$ | One or more |
| $R^* R^*$ | $R^*$ | Combining stars |
| $\varepsilon \cup RR^*$ | $R^*$ | Definition of star |

### Factoring

If $R = ST \cup SU$, then $R = S(T \cup U)$ (left factoring).

If $R = TS \cup US$, then $R = (T \cup U)S$ (right factoring).

---

## Correctness of the Algorithm

**Theorem:** The state elimination algorithm produces a regex $R$ with $L(R) = L(M)$.

**Proof sketch:**

We prove by induction on the number of states eliminated that the GNFA at each step accepts the same language as the original DFA.

**Base case:** After converting to GNFA (no eliminations yet), the GNFA accepts the same language as the DFA. This follows because:
- The new start reaches the old start via $\varepsilon$
- The old accept states reach the new accept via $\varepsilon$
- All other transitions preserve their meaning

**Inductive step:** Eliminating state $q_r$ preserves the language because:
- Any accepting path through $q_r$ is captured by the formula $R_{ir}(R_{rr})^*R_{rj}$
- Any accepting path not through $q_r$ is captured by the original $R_{ij}$
- The union covers all possible paths

**Final step:** When only $q_s$ and $q_a$ remain, the single transition label is a regex that matches exactly the strings that took the GNFA from start to accept. $\square$

---

## Complexity

For a DFA with $n$ states:

- The GNFA has $n + 2$ states initially
- We eliminate $n$ states (all original DFA states)
- Each elimination requires updating $O(n^2)$ transition labels
- The regex size can grow **exponentially** in the worst case: $O(4^n)$

This exponential blowup is unavoidable in general — some regular languages require exponentially long regexes relative to their minimal DFA size.

---

## Another Detailed Example: Three-State DFA

Let's work through a more complex example with 3 internal states.

**DFA** over $\Sigma = \{a, b\}$ accepting strings that contain "ab":

- States: $\{q_0, q_1, q_2\}$
- Start: $q_0$ (haven't seen "ab" yet, last char wasn't 'a')
- Accept: $\{q_2\}$ (have seen "ab")
- Transitions:
  - $\delta(q_0, a) = q_1$, $\delta(q_0, b) = q_0$
  - $\delta(q_1, a) = q_1$, $\delta(q_1, b) = q_2$
  - $\delta(q_2, a) = q_2$, $\delta(q_2, b) = q_2$

### Convert to GNFA

Add $q_s$ and $q_a$:
- $q_s \xrightarrow{\varepsilon} q_0$
- $q_0 \xrightarrow{b} q_0$, $q_0 \xrightarrow{a} q_1$
- $q_1 \xrightarrow{a} q_1$, $q_1 \xrightarrow{b} q_2$
- $q_2 \xrightarrow{a \cup b} q_2$, $q_2 \xrightarrow{\varepsilon} q_a$
- All missing transitions labeled $\emptyset$

### Eliminate $q_0$

For pair $(q_s, q_1)$: $R_{s,1}' = \emptyset \cup \varepsilon \cdot b^* \cdot a = b^* a$

For pair $(q_s, q_2)$: $R_{s,2}' = \emptyset \cup \varepsilon \cdot b^* \cdot \emptyset = \emptyset$

For pair $(q_s, q_a)$: $R_{s,a}' = \emptyset \cup \varepsilon \cdot b^* \cdot \emptyset = \emptyset$

For pair $(q_1, q_1)$: $R_{1,1}' = a \cup \emptyset \cdot b^* \cdot a = a$ (no path from $q_1$ to $q_0$... wait)

Actually, $q_1$ has no transition to $q_0$ in the original DFA. So $R_{1,0} = \emptyset$.

$R_{1,1}' = a \cup \emptyset \cdot b^* \cdot a = a$

For pair $(q_1, q_2)$: $R_{1,2}' = b \cup \emptyset \cdot b^* \cdot \emptyset = b$

For pair $(q_1, q_a)$: $R_{1,a}' = \emptyset \cup \emptyset \cdot b^* \cdot \emptyset = \emptyset$

For pair $(q_2, q_1)$: $R_{2,0} = \emptyset$, so $R_{2,1}' = \emptyset \cup \emptyset \cdot b^* \cdot a = \emptyset$

For pair $(q_2, q_2)$: $R_{2,2}' = (a \cup b) \cup \emptyset \cdot b^* \cdot \emptyset = a \cup b$

For pair $(q_2, q_a)$: $R_{2,a}' = \varepsilon \cup \emptyset \cdot b^* \cdot \emptyset = \varepsilon$

After eliminating $q_0$:
- $q_s \xrightarrow{b^* a} q_1$
- $q_1 \xrightarrow{a} q_1$ (self-loop)
- $q_1 \xrightarrow{b} q_2$
- $q_2 \xrightarrow{a \cup b} q_2$ (self-loop)
- $q_2 \xrightarrow{\varepsilon} q_a$

### Eliminate $q_1$

For pair $(q_s, q_2)$: $R_{s,2}' = \emptyset \cup (b^*a) \cdot a^* \cdot b = b^* a \cdot a^* b = b^* a^+ b$

For pair $(q_s, q_a)$: $R_{s,a}' = \emptyset \cup (b^*a) \cdot a^* \cdot \emptyset = \emptyset$

For pair $(q_2, q_2)$: (no path from $q_2$ to $q_1$): $R_{2,2}' = (a \cup b) \cup \emptyset = a \cup b$

For pair $(q_2, q_a)$: $R_{2,a}' = \varepsilon \cup \emptyset = \varepsilon$

After eliminating $q_1$:
- $q_s \xrightarrow{b^* a^+ b} q_2$
- $q_2 \xrightarrow{a \cup b} q_2$ (self-loop)
- $q_2 \xrightarrow{\varepsilon} q_a$

### Eliminate $q_2$

$R_{s,a}' = \emptyset \cup (b^* a^+ b) \cdot (a \cup b)^* \cdot \varepsilon = b^* a^+ b (a \cup b)^*$

### Result

$$\boxed{b^* a^+ b (a \cup b)^*}$$

**Simplification:** $a^+ b = a a^* b$, so this is $b^* a a^* b (a \cup b)^*$.

We can rewrite: $b^* a (a \cup b)^*$ — wait, no. We need at least one $a$ followed by a $b$. Let's verify: $(a \cup b)^* ab (a \cup b)^*$ is the standard regex for "contains ab."

Our answer $b^* a^+ b (a \cup b)^*$ says: some leading $b$'s, then one or more $a$'s, then a $b$, then anything. This is equivalent to $(a \cup b)^* ab (a \cup b)^*$ — both describe strings containing "ab." ✓

---

## Exercises

### Exercise 1

Convert the following DFA to a regex. $\Sigma = \{0, 1\}$, states $\{A, B\}$, start $A$, accept $\{B\}$:

| | 0 | 1 |
|---|---|---|
| A | B | A |
| B | A | B |

(Accepts strings with an odd number of 0s.)

**Solution:**

After GNFA setup and eliminating state $A$:

- $R_{s,B}$: from $q_s$, through $A$, to $B$: $\varepsilon \cdot 1^* \cdot 0 = 1^* 0$
- $R_{B,B}$: self + through $A$: $1 \cup 0 \cdot 1^* \cdot 0 = 1 \cup 01^*0$
- $R_{B,a}$: $\varepsilon \cup 0 \cdot 1^* \cdot \emptyset = \varepsilon$

After eliminating $B$:

$$R = 1^* 0 \cdot (1 \cup 01^*0)^* \cdot \varepsilon = 1^* 0 (1 \cup 01^*0)^*$$

### Exercise 2

Convert this DFA to regex. $\Sigma = \{a, b\}$, states $\{q_0, q_1, q_2\}$, start $q_0$, accept $\{q_0\}$:

| | a | b |
|---|---|---|
| $q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_2$ | $q_0$ |
| $q_2$ | $q_2$ | $q_2$ |

(Accepts strings that don't contain "aa".)

**Solution:**

After converting to GNFA and eliminating $q_2$ first (it's a dead/trap state — eliminating it essentially removes paths through it since $q_2$ has no path to accept):

$R_{q_1, q_a}$: $\emptyset \cup (a \cup b)(a \cup b)^* \emptyset = \emptyset$

So after eliminating $q_2$, the transition from $q_1$ to $q_a$ is still $\emptyset$, and $q_1$'s self-loop remains only through what doesn't go to $q_2$.

After eliminating $q_1$:

- $R_{q_0, q_0}$ (self-loop) = $b \cup a \cdot \emptyset^* \cdot \emptyset \cdot ... $

Since $q_1 \to q_a$ is $\emptyset$, we simplify. The result is:

$$b^*(ab)^*(a \cup \varepsilon) \text{ — wait, let's be more careful.}$$

Actually, the language is "strings not containing 'aa'." A cleaner approach gives:

$$(b \cup ab)^* (a \cup \varepsilon)$$

### Exercise 3

Why might different elimination orders give different-looking (but equivalent) regexes?

**Solution:** Because the formula $R_{ij}' = R_{ij} \cup R_{ir}(R_{rr})^*R_{rj}$ "absorbs" information about $q_r$ into the labels between remaining states. The order determines which state's information gets absorbed first, affecting how subexpressions nest.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| GNFA | NFA with regex-labeled transitions |
| State elimination | Remove states one by one, updating transition labels |
| Core formula | $R_{ij}' = R_{ij} \cup R_{ir}(R_{rr})^*R_{rj}$ |
| Phase 1 | DFA → GNFA (add new start/accept) |
| Phase 2 | Eliminate all intermediate states |
| Phase 3 | Read regex from remaining transition |
| Order | Doesn't affect correctness, may affect simplicity |
| Complexity | Result regex can be exponential in DFA size |

This completes the equivalence proof! We now know that DFA, NFA, and regex all describe exactly the regular languages. Next, we'll explore the **closure and decision properties** of regular languages.
