---
title: Deterministic Finite Automata
---

# Deterministic Finite Automata (DFA)

A **Deterministic Finite Automaton** (DFA) is the simplest model of computation. It has a fixed number of states, reads input one symbol at a time, and makes exactly one transition per step. Despite its simplicity, DFAs are surprisingly powerful — they underlie regular expressions, lexical analyzers, network protocols, and hardware circuits.

This lesson covers the formal definition, examples, design techniques, and the extended transition function.

---

## Formal Definition

A **DFA** is a 5-tuple:

$$M = (Q, \Sigma, \delta, q_0, F)$$

| Component | Name | Description |
|---|---|---|
| $Q$ | States | A **finite** set of states |
| $\Sigma$ | Input alphabet | A **finite** set of input symbols |
| $\delta$ | Transition function | $\delta : Q \times \Sigma \to Q$ |
| $q_0$ | Start state | $q_0 \in Q$ (where computation begins) |
| $F$ | Accept states | $F \subseteq Q$ (final/accepting states) |

### Key Properties

1. **$Q$ is finite:** The machine has bounded memory (just its state)
2. **$\delta$ is a total function:** For every state $q$ and every symbol $a$, there is exactly one next state $\delta(q, a)$. No ambiguity, no dead ends, no choices.
3. **Deterministic:** Given the current state and the current input symbol, the next state is completely determined. There is exactly one computation path for each input.

---

## How a DFA Processes Input

Given input string $w = a_1 a_2 a_3 \cdots a_n$:

1. Start in state $q_0$
2. Read symbol $a_1$: move to state $\delta(q_0, a_1) = r_1$
3. Read symbol $a_2$: move to state $\delta(r_1, a_2) = r_2$
4. Continue until all symbols are read
5. After reading $a_n$, the machine is in some state $r_n$
6. **Accept** if $r_n \in F$; **Reject** if $r_n \notin F$

### Pseudocode

```
function DFA_RUN(M, w):
    state ← q₀
    for each symbol a in w (left to right):
        state ← δ(state, a)
    if state ∈ F:
        return ACCEPT
    else:
        return REJECT
```

> **Important:** A DFA always halts (after reading all input) and always gives a definite answer (accept or reject). It never gets "stuck" and never loops forever.

---

## Extended Transition Function

The transition function $\delta$ handles one symbol at a time. We extend it to handle entire strings:

### Definition of $\hat{\delta}$

The **extended transition function** $\hat{\delta} : Q \times \Sigma^* \to Q$ is defined recursively:

$$\hat{\delta}(q, \varepsilon) = q$$

$$\hat{\delta}(q, wa) = \delta(\hat{\delta}(q, w), a)$$

where $w \in \Sigma^*$ and $a \in \Sigma$.

### Intuition

- $\hat{\delta}(q, \varepsilon) = q$: Reading no input doesn't change the state
- $\hat{\delta}(q, wa)$: To process string $wa$, first process $w$ (reaching some state), then take one more step on symbol $a$

### Example

Let $\delta(q_0, 0) = q_1$, $\delta(q_0, 1) = q_0$, $\delta(q_1, 0) = q_1$, $\delta(q_1, 1) = q_0$.

Compute $\hat{\delta}(q_0, 010)$:

$$\hat{\delta}(q_0, 010) = \delta(\hat{\delta}(q_0, 01), 0)$$

$$\hat{\delta}(q_0, 01) = \delta(\hat{\delta}(q_0, 0), 1)$$

$$\hat{\delta}(q_0, 0) = \delta(\hat{\delta}(q_0, \varepsilon), 0) = \delta(q_0, 0) = q_1$$

Working back up:

$$\hat{\delta}(q_0, 01) = \delta(q_1, 1) = q_0$$

$$\hat{\delta}(q_0, 010) = \delta(q_0, 0) = q_1$$

---

## Language of a DFA

The **language recognized** by DFA $M$ is:

$$L(M) = \{w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F\}$$

In words: $L(M)$ is the set of all strings that, when processed from the start state, lead to an accept state.

A language $L$ is called **regular** if there exists a DFA $M$ with $L(M) = L$.

---

## Representations of a DFA

### Transition Table

A table with rows for states and columns for input symbols. Entry at row $q$, column $a$ gives $\delta(q, a)$.

**Example:** DFA for strings over $\{0, 1\}$ with even number of 0s:

| State | 0 | 1 |
|---|---|---|
| $\to$ $*q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_0$ | $q_1$ |

Notation: $\to$ marks start state, $*$ marks accept states.

### State Diagram

- Circles for states
- Double circles for accept states
- Arrow from outside pointing to start state
- Labeled arrows for transitions

```
         1                1
     ┌──────┐        ┌──────┐
     │      │        │      │
     ▼      │        ▼      │
→ ((q₀)) ──────── (q₁)
          0
     (q₁) ──────── ((q₀))
          0
```

---

## Example 1: Strings Ending in "01"

**Design a DFA** for $L = \{w \in \{0, 1\}^* \mid w \text{ ends with } 01\}$.

### Strategy

We need to remember the last two symbols read. The states represent what "suffix" we have seen:

- $q_0$: Haven't seen "01" ending yet (or just started)
- $q_1$: The last symbol read was $0$
- $q_2$: The last two symbols read were $01$ (**accept!**)

### Formal Definition

$$M = (\{q_0, q_1, q_2\}, \{0, 1\}, \delta, q_0, \{q_2\})$$

### Transition Table

| State | 0 | 1 |
|---|---|---|
| $\to q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_1$ | $q_2$ |
| $*q_2$ | $q_1$ | $q_0$ |

### Trace Computation

Input: $w = 1001$

| Symbol read | Current state | Next state |
|---|---|---|
| — | $q_0$ | — |
| $1$ | $q_0$ | $q_0$ |
| $0$ | $q_0$ | $q_1$ |
| $0$ | $q_1$ | $q_1$ |
| $1$ | $q_1$ | $q_2$ |

Final state: $q_2 \in F$ → **Accept** ✓ (string ends in "01")

Input: $w = 010$

| Symbol read | Current state | Next state |
|---|---|---|
| — | $q_0$ | — |
| $0$ | $q_0$ | $q_1$ |
| $1$ | $q_1$ | $q_2$ |
| $0$ | $q_2$ | $q_1$ |

Final state: $q_1 \notin F$ → **Reject** ✓ (string ends in "10", not "01")

---

## Example 2: Even Number of 0s

**Design a DFA** for $L = \{w \in \{0, 1\}^* \mid w \text{ has an even number of 0s}\}$.

(Note: zero is even, so $\varepsilon \in L$ and strings with no 0s are accepted.)

### Strategy

Track the **parity** of 0s seen so far:
- $q_0$ (even): even number of 0s seen (including zero)
- $q_1$ (odd): odd number of 0s seen

### Formal Definition

$$M = (\{q_0, q_1\}, \{0, 1\}, \delta, q_0, \{q_0\})$$

### Transition Table

| State | 0 | 1 |
|---|---|---|
| $\to *q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_0$ | $q_1$ |

### Key Insight

Reading a $1$ doesn't change the parity of 0s, so we stay in the same state. Reading a $0$ flips the parity, so we switch states.

**Verification:**
- $\varepsilon$: start and stay in $q_0$ → Accept ✓ (0 zeros = even)
- $1$: $q_0 \to q_0$ → Accept ✓ (0 zeros)
- $0$: $q_0 \to q_1$ → Reject ✓ (1 zero = odd)
- $00$: $q_0 \to q_1 \to q_0$ → Accept ✓ (2 zeros = even)
- $010$: $q_0 \to q_1 \to q_1 \to q_0$ → Accept ✓ (2 zeros)

---

## Example 3: Strings Containing "aba"

**Design a DFA** for $L = \{w \in \{a, b\}^* \mid w \text{ contains "aba" as a substring}\}$.

### Strategy

Track progress towards seeing "aba":
- $q_0$: Haven't started matching (or match was broken)
- $q_1$: Just saw "$a$" (first character of "aba")
- $q_2$: Saw "$ab$" (first two characters)
- $q_3$: Saw "$aba$" — **DONE!** Stay here forever (accept)

### Transition Table

| State | $a$ | $b$ |
|---|---|---|
| $\to q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_1$ | $q_2$ |
| $q_2$ | $q_3$ | $q_0$ |
| $*q_3$ | $q_3$ | $q_3$ |

### Explanation of Tricky Transitions

- $\delta(q_1, a) = q_1$: If we've seen "$a$" and see another "$a$", the new "$a$" could be the start of "aba"
- $\delta(q_2, b) = q_0$: If we've seen "$ab$" and see "$b$", that gives us "$abb$" — no progress, reset (but careful: no "$a$" just before us either)
- $\delta(q_3, a) = q_3$ and $\delta(q_3, b) = q_3$: Once "aba" is found, we accept regardless of what comes after

---

## Example 4: Binary Numbers Divisible by 3

**Design a DFA** for $L = \{w \in \{0, 1\}^* \mid w \text{ represents a binary number divisible by 3}\}$.

(Reading left to right. Leading zeros are allowed. Empty string represents $0$.)

### Strategy

Track the **remainder** when dividing by 3. If the number so far has value $n$, and we read bit $b$, the new value is $2n + b$.

The remainder of $2n + b$ divided by 3:
$$\text{new remainder} = (2 \cdot \text{old remainder} + b) \mod 3$$

States represent remainders $\{0, 1, 2\}$:

### Transition Table

| State (remainder) | 0 | 1 |
|---|---|---|
| $\to *q_0$ (rem 0) | $q_0$ | $q_1$ |
| $q_1$ (rem 1) | $q_2$ | $q_0$ |
| $q_2$ (rem 2) | $q_1$ | $q_2$ |

### Derivation of Transitions

From state $q_r$ (current remainder is $r$):
- Read $0$: new remainder = $(2r + 0) \mod 3 = 2r \mod 3$
- Read $1$: new remainder = $(2r + 1) \mod 3$

| $r$ | $2r \mod 3$ (read 0) | $(2r+1) \mod 3$ (read 1) |
|---|---|---|
| 0 | 0 | 1 |
| 1 | 2 | 0 |
| 2 | 1 | 2 |

### Verification

- $\varepsilon$: $q_0$ → Accept (value 0, divisible by 3) ✓
- $11$ (= 3): $q_0 \to q_1 \to q_0$ → Accept ✓
- $110$ (= 6): $q_0 \to q_1 \to q_0 \to q_0$ → Accept ✓
- $101$ (= 5): $q_0 \to q_1 \to q_2 \to q_2$ → Reject ✓
- $1001$ (= 9): $q_0 \to q_1 \to q_2 \to q_1 \to q_0$ → Accept ✓

> This example beautifully shows how a DFA can encode arithmetic properties using states as remainders. The same technique works for divisibility by any fixed number $k$ (using $k$ states).

---

## Dead States (Trap States)

A **dead state** (or trap state) is a non-accepting state that, once entered, can never be left. All transitions from a dead state loop back to itself.

### Why Dead States Exist

Since $\delta$ must be a **total function** (defined for every state-symbol pair), we need transitions even from states where we "know" the string will be rejected. The dead state serves as a "garbage collector."

### Example

DFA for $L = \{ab\}$ (only the string "$ab$"):

| State | $a$ | $b$ |
|---|---|---|
| $\to q_0$ | $q_1$ | $q_{dead}$ |
| $q_1$ | $q_{dead}$ | $q_2$ |
| $*q_2$ | $q_{dead}$ | $q_{dead}$ |
| $q_{dead}$ | $q_{dead}$ | $q_{dead}$ |

$q_{dead}$ is the dead state — once you're there, you can never reach an accept state.

### Convention

In state diagrams, dead states are sometimes omitted for clarity (transitions to them are simply not drawn). But formally, a DFA always has them.

---

## Designing DFAs: Strategy

The key question when designing a DFA is:

> **What information do I need to remember about the input seen so far?**

Each state encodes a distinct "situation" or piece of information. The number of distinct situations you need to track determines the number of states.

### Design Method

1. **Identify what to track:** What property of the input prefix matters for deciding acceptance?
2. **Define states:** One state for each distinct combination of tracked information
3. **Determine transitions:** How does each input symbol update the tracked information?
4. **Mark start state:** What is the initial "information" (before reading anything)?
5. **Mark accept states:** Which states correspond to "yes, accept"?

### Example: Design a DFA for "strings where every 0 is immediately followed by 1"

**What to track:** Have we just seen a $0$ that hasn't been followed by $1$ yet?

**States:**
- $q_0$: Normal state (no pending 0)
- $q_1$: Just read a $0$ (waiting for $1$ to follow)
- $q_{dead}$: Violation detected (0 not followed by 1)

**Transitions:**
- From $q_0$: read $0$ → $q_1$; read $1$ → $q_0$
- From $q_1$: read $1$ → $q_0$; read $0$ → $q_{dead}$ (violation: 0 followed by 0)
- From $q_{dead}$: read anything → $q_{dead}$

**Accept states:** $\{q_0\}$ (not $q_1$ — string can't end with a 0 that hasn't been followed by 1)

---

## DFA Memory Limitations

A DFA has **finite memory** — the number of states is fixed regardless of input length. This has profound consequences:

### What DFAs Can Remember

- Parity (even/odd count of some symbol): 2 states
- Modular count (count mod $k$): $k$ states
- Fixed-length history (last $k$ symbols): $|\Sigma|^k$ states
- Whether a fixed pattern has occurred: states track progress

### What DFAs Cannot Remember

- Unbounded counts: "equal number of 0s and 1s" requires counting up to $n$
- Comparisons of unbounded quantities: $a^n b^n$ requires comparing $n$'s
- General recursion: balanced parentheses require a stack

### The Pigeonhole Principle Argument

If a DFA has $k$ states and reads an input of length $> k$, it must visit some state **twice** (pigeonhole principle). This means it enters a loop. This loop can be "pumped" (repeated or removed), which is the basis of the **Pumping Lemma** — the main tool for proving a language is NOT regular.

---

## Common Mistakes in DFA Design

### Mistake 1: Forgetting the Dead State

Since $\delta$ must be total, every (state, symbol) pair needs a transition. If you think "this shouldn't happen," add a dead state.

### Mistake 2: Not Handling the Empty String

Consider whether $\varepsilon$ should be accepted. If yes, the start state must be an accept state.

### Mistake 3: States That Don't Encode Useful Information

If two states lead to the same future behavior for all possible remaining inputs, they should be merged (DFA minimization).

### Mistake 4: Confusing "Has Seen" with "Ends With"

"Contains 01" vs "ends with 01" require different DFAs:
- "Contains 01": once found, stay in accept state forever
- "Ends with 01": might leave the accept state if more input comes

### Mistake 5: Making $\delta$ Non-Deterministic

If you have a state with two different transitions on the same symbol, that's an NFA, not a DFA. Each (state, symbol) pair must map to exactly one state.

---

## Exercises

### Exercise 1

Design a DFA for $L = \{w \in \{0, 1\}^* \mid w \text{ has length divisible by 3}\}$.

<details>
<summary><strong>Solution</strong></summary>

Track $|w| \mod 3$:

States: $\{q_0, q_1, q_2\}$ representing remainder $0, 1, 2$.

| State | 0 | 1 |
|---|---|---|
| $\to *q_0$ | $q_1$ | $q_1$ |
| $q_1$ | $q_2$ | $q_2$ |
| $q_2$ | $q_0$ | $q_0$ |

Both $0$ and $1$ simply increment the length counter (mod 3).

Accept state: $q_0$ (length $\equiv 0 \pmod{3}$).

Note: $\varepsilon$ is accepted ($|\varepsilon| = 0$, which is divisible by 3). ✓

</details>

### Exercise 2

Design a DFA for $L = \{w \in \{a, b\}^* \mid w \text{ starts with } a \text{ and ends with } b\}$.

<details>
<summary><strong>Solution</strong></summary>

States:
- $q_0$: start (nothing read yet)
- $q_1$: started with $a$, last symbol is $a$
- $q_2$: started with $a$, last symbol is $b$ (accept)
- $q_{dead}$: started with $b$ (can never accept)

| State | $a$ | $b$ |
|---|---|---|
| $\to q_0$ | $q_1$ | $q_{dead}$ |
| $q_1$ | $q_1$ | $q_2$ |
| $*q_2$ | $q_1$ | $q_2$ |
| $q_{dead}$ | $q_{dead}$ | $q_{dead}$ |

</details>

### Exercise 3

Design a DFA for $L = \{w \in \{0, 1\}^* \mid w \text{ does NOT contain "11"}\}$.

<details>
<summary><strong>Solution</strong></summary>

Track whether we just saw a $1$:

- $q_0$: no $1$ just seen (or haven't started)
- $q_1$: the last symbol was $1$
- $q_{dead}$: "11" has been found (reject forever)

| State | 0 | 1 |
|---|---|---|
| $\to *q_0$ | $q_0$ | $q_1$ |
| $*q_1$ | $q_0$ | $q_{dead}$ |
| $q_{dead}$ | $q_{dead}$ | $q_{dead}$ |

Accept states: $\{q_0, q_1\}$ — accept as long as "11" has NOT appeared.

</details>

### Exercise 4

Give the formal 5-tuple definition of a DFA that accepts all binary strings representing even numbers (in standard binary notation, with possible leading zeros). The string "0" represents $0$ (even).

<details>
<summary><strong>Solution</strong></summary>

A binary number is even iff its last digit is $0$.

$$M = (\{q_0, q_1\}, \{0, 1\}, \delta, q_0, \{q_0\})$$

| State | 0 | 1 |
|---|---|---|
| $\to *q_0$ | $q_0$ | $q_1$ |
| $q_1$ | $q_0$ | $q_1$ |

- $q_0$: last symbol read was $0$ (or nothing yet — $\varepsilon$ represents $0$)
- $q_1$: last symbol read was $1$
- Accept: $q_0$ (last bit is $0$ → even, and $\varepsilon$ → $0$ → even)

Note: $\varepsilon$ is accepted (representing 0, which is even). If you want to require at least one digit, make the start state non-accepting and add another accept state.

</details>

### Exercise 5

How many states does a DFA need to recognize $L = \{w \in \{0,1\}^* \mid \text{the 3rd symbol from the right is 1}\}$? Construct it.

<details>
<summary><strong>Solution</strong></summary>

We need to remember the last 3 symbols. Since each can be $0$ or $1$, we need $2^3 = 8$ states (plus potentially a few states for strings shorter than 3).

States encode the last 3 symbols seen (or fewer if the string is short). Let states be $q_{xyz}$ where $xyz$ are the last 3 symbols.

Actually, the cleanest approach: $8$ states representing all possible 3-bit windows.

States: $\{q_{000}, q_{001}, q_{010}, q_{011}, q_{100}, q_{101}, q_{110}, q_{111}\}$

For a state $q_{abc}$ reading symbol $d$: go to $q_{bcd}$ (shift left, new symbol on right).

Accept states: $\{q_{1xy} \mid x, y \in \{0,1\}\} = \{q_{100}, q_{101}, q_{110}, q_{111}\}$

Start state: $q_{000}$ (assuming we haven't read anything; for strings of length < 3, this handles them correctly by treating "missing" symbols as $0$).

This DFA has **8 states** (and this is minimal for this language).

</details>

### Exercise 6

Prove that $L(M) = \{w \in \{0,1\}^* \mid w \text{ has even number of 0s}\}$ for the DFA $M = (\{q_0, q_1\}, \{0,1\}, \delta, q_0, \{q_0\})$ where $\delta(q_0, 0) = q_1$, $\delta(q_0, 1) = q_0$, $\delta(q_1, 0) = q_0$, $\delta(q_1, 1) = q_1$.

<details>
<summary><strong>Solution</strong></summary>

**Claim:** $\hat{\delta}(q_0, w) = q_0$ iff $|w|_0$ is even.

**Proof by induction on $|w|$:**

**Base case** ($|w| = 0$): $w = \varepsilon$, $\hat{\delta}(q_0, \varepsilon) = q_0$, and $|w|_0 = 0$ (even). ✓

**Inductive Hypothesis:** Assume for all strings of length $k$: $\hat{\delta}(q_0, w) = q_0$ iff $|w|_0$ is even (and $\hat{\delta}(q_0, w) = q_1$ iff $|w|_0$ is odd).

**Inductive Step:** Let $w' = wa$ where $|w| = k$ and $a \in \{0, 1\}$.

**Case $a = 1$:** $\hat{\delta}(q_0, w') = \delta(\hat{\delta}(q_0, w), 1) = \hat{\delta}(q_0, w)$ (since $\delta(q_i, 1) = q_i$). The number of 0s doesn't change, and neither does the state. ✓

**Case $a = 0$:** $\hat{\delta}(q_0, w') = \delta(\hat{\delta}(q_0, w), 0)$. By the IH:
- If $|w|_0$ is even, then $\hat{\delta}(q_0, w) = q_0$, so $\hat{\delta}(q_0, w') = \delta(q_0, 0) = q_1$. And $|w'|_0 = |w|_0 + 1$ is odd. ✓
- If $|w|_0$ is odd, then $\hat{\delta}(q_0, w) = q_1$, so $\hat{\delta}(q_0, w') = \delta(q_1, 0) = q_0$. And $|w'|_0 = |w|_0 + 1$ is even. ✓

Therefore $\hat{\delta}(q_0, w) \in F = \{q_0\}$ iff $|w|_0$ is even. $\square$

</details>

---

## Summary

| Concept | Details |
|---|---|
| DFA Definition | $M = (Q, \Sigma, \delta, q_0, F)$ |
| $\delta$ is total | Exactly one transition for each (state, symbol) pair |
| Processing | Start at $q_0$, follow transitions, accept iff final state $\in F$ |
| $\hat{\delta}$ | Extends $\delta$ to strings: $\hat{\delta}(q, wa) = \delta(\hat{\delta}(q, w), a)$ |
| Language | $L(M) = \{w \mid \hat{\delta}(q_0, w) \in F\}$ |
| Memory | Fixed and finite — only the current state |
| Dead state | Non-accepting state with all self-loops |
| Design key | States = distinct information needed about input history |

---

## What's Next?

DFAs are powerful but sometimes inconvenient to construct. **Non-deterministic Finite Automata (NFA)** allow multiple possible transitions from a state, making design much easier. Remarkably, NFAs are exactly as powerful as DFAs — every NFA can be converted to an equivalent DFA. We explore this in the next lesson.
