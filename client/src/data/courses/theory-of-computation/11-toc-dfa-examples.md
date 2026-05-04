---
title: DFA Design and Examples
---

# DFA Design and Examples

Designing DFAs is both an art and a science. In this lesson, you'll learn a **systematic approach** to DFA design and work through six detailed examples — from simple parity checks to more complex pattern-matching and divisibility problems. By the end, you'll have the tools and intuition to tackle any DFA design challenge.

---

## Systematic Approach to DFA Design

When faced with a language and asked to design a DFA, follow these four steps:

### Step 1: Identify What Information to Track

Ask yourself: **What do I need to remember** about the input read so far to decide whether to accept or reject?

A DFA has finite memory — its states. Each state encodes some "summary" of the input processed. You must identify the minimal set of facts that distinguishes acceptance from rejection.

> **Key Insight:** You don't need to remember the entire input — only the information relevant to the acceptance condition.

### Step 2: Determine the States

Each state represents a **distinct situation** the machine can be in. If you identified $k$ distinct pieces of information to track, you need at most $k$ states (often exactly $k$).

Label your states with **meaningful names** that reflect what situation they represent. For example:

- $q_{even}$ / $q_{odd}$ for parity tracking
- $q_0, q_1, q_2, q_3$ for tracking a value mod 4
- $q_{saw\text{-}nothing}, q_{saw\text{-}1}, q_{saw\text{-}10}, q_{saw\text{-}101}$ for substring searching

### Step 3: Define Transitions for Every (State, Symbol) Pair

For **every** state $q$ and **every** input symbol $a$, you must define $\delta(q, a)$. Ask:

> "If I'm in situation $q$ and I read symbol $a$, what new situation am I in?"

This is where most mistakes happen. Be methodical — fill in a complete transition table.

### Step 4: Identify Start and Accept States

- **Start state:** What situation are you in before reading any input? (Usually the "nothing interesting has happened yet" state.)
- **Accept states:** Which situations correspond to the input being in the language?

---

## Example 1: Odd Number of $a$'s

**Language:** $L = \{w \in \{a, b\}^* \mid w \text{ contains an odd number of } a\text{'s}\}$

### Step 1: What to Track

We need to know whether the number of $a$'s seen so far is **even** or **odd**. That's it — we don't care about $b$'s at all, and we don't need the exact count (just its parity).

### Step 2: States

Two situations:

- $q_{even}$: an even number of $a$'s have been seen (0 is even)
- $q_{odd}$: an odd number of $a$'s have been seen

### Step 3: Transitions

Ask for each state and each symbol:

| Current State | Read $a$ | Read $b$ |
|---|---|---|
| $q_{even}$ | $q_{odd}$ | $q_{even}$ |
| $q_{odd}$ | $q_{even}$ | $q_{odd}$ |

**Reasoning:**
- In $q_{even}$, reading $a$ flips parity → go to $q_{odd}$
- In $q_{even}$, reading $b$ doesn't affect $a$-count → stay in $q_{even}$
- In $q_{odd}$, reading $a$ flips parity → go to $q_{even}$
- In $q_{odd}$, reading $b$ doesn't affect $a$-count → stay in $q_{odd}$

### Step 4: Start and Accept States

- **Start:** $q_{even}$ (before reading anything, we've seen 0 $a$'s, and 0 is even)
- **Accept:** $\{q_{odd}\}$ (we want an odd number of $a$'s)

### Formal Definition

$$M = (\{q_{even}, q_{odd}\}, \{a, b\}, \delta, q_{even}, \{q_{odd}\})$$

### State Diagram

```
        a             a
  ──► (q_even) ⇌ ((q_odd))
        ↺ b           ↺ b
```

Double circle on $q_{odd}$ indicates it is the accept state. Arrow into $q_{even}$ indicates it is the start state.

### Trace: $w = abba$

| Step | State | Remaining Input | Action |
|---|---|---|---|
| 0 | $q_{even}$ | $abba$ | Read $a$ |
| 1 | $q_{odd}$ | $bba$ | Read $b$ |
| 2 | $q_{odd}$ | $ba$ | Read $b$ |
| 3 | $q_{odd}$ | $a$ | Read $a$ |
| 4 | $q_{even}$ | $\varepsilon$ | Done |

Final state: $q_{even} \notin F$ → **Reject** ✗

This is correct: $abba$ has 2 $a$'s (even), so it should be rejected.

### Trace: $w = aba$

| Step | State | Remaining Input | Action |
|---|---|---|---|
| 0 | $q_{even}$ | $aba$ | Read $a$ |
| 1 | $q_{odd}$ | $ba$ | Read $b$ |
| 2 | $q_{odd}$ | $a$ | Read $a$ |
| 3 | $q_{even}$ | $\varepsilon$ | — wait, this has 2 $a$'s |

Hmm — let's recount. $w = aba$ has $a$'s at positions 1 and 3, so 2 $a$'s. Let's try $w = aab$:

| Step | State | Remaining Input |
|---|---|---|
| 0 | $q_{even}$ | $aab$ |
| 1 | $q_{odd}$ | $ab$ |
| 2 | $q_{even}$ | $b$ |
| 3 | $q_{even}$ | $\varepsilon$ |

Result: Reject (2 $a$'s = even). Now $w = a$:

| Step | State | Remaining Input |
|---|---|---|
| 0 | $q_{even}$ | $a$ |
| 1 | $q_{odd}$ | $\varepsilon$ |

Result: **Accept** ✓ (1 $a$ = odd).

---

## Example 2: Contains "101" as Substring

**Language:** $L = \{w \in \{0, 1\}^* \mid w \text{ contains } 101 \text{ as a substring}\}$

### Step 1: What to Track

We need to track **how much of the pattern "101" we've matched** so far. Think of it as a sliding window — at any point, we've seen some prefix of "101" and we're waiting for the rest.

### Step 2: States

Four situations:

| State | Meaning |
|---|---|
| $q_0$ | Haven't started matching "101" (or match was broken) |
| $q_1$ | Last symbol seen was "1" (matched first character) |
| $q_{10}$ | Last two symbols were "10" (matched first two characters) |
| $q_{101}$ | We've seen "101" — accept! (stay here forever) |

### Step 3: Transitions

This requires careful thought. The tricky part is: **when a match fails, we might already have a partial match of a new occurrence.**

| Current State | Read 0 | Read 1 |
|---|---|---|
| $q_0$ | $q_0$ | $q_1$ |
| $q_1$ | $q_{10}$ | $q_1$ |
| $q_{10}$ | $q_0$ | $q_{101}$ |
| $q_{101}$ | $q_{101}$ | $q_{101}$ |

**Reasoning for tricky transitions:**

- $\delta(q_1, 1) = q_1$: We were expecting "0" next but got "1". However, this new "1" could be the start of a fresh "101" match! So we stay in $q_1$.
- $\delta(q_{10}, 0) = q_0$: We had "10" and expected "1" but got "0". The pattern "100" doesn't end with any prefix of "101", so we reset to $q_0$.
- $\delta(q_{101}, 0) = q_{101}$ and $\delta(q_{101}, 1) = q_{101}$: Once we've found "101", we accept no matter what comes after. This is a **trap state** (absorbing accept state).

### Step 4: Start and Accept States

- **Start:** $q_0$ (no part of "101" matched yet)
- **Accept:** $\{q_{101}\}$ (we've seen the substring)

### Formal Definition

$$M = (\{q_0, q_1, q_{10}, q_{101}\}, \{0, 1\}, \delta, q_0, \{q_{101}\})$$

### Trace: $w = 11010$

| Step | State | Remaining | Symbol | Reasoning |
|---|---|---|---|---|
| 0 | $q_0$ | $11010$ | 1 | Start matching "1" |
| 1 | $q_1$ | $1010$ | 1 | Another "1", stay in $q_1$ |
| 2 | $q_1$ | $010$ | 0 | Got "10" prefix |
| 3 | $q_{10}$ | $10$ | 1 | Got "101"! |
| 4 | $q_{101}$ | $0$ | 0 | Already accepted, stay |
| 5 | $q_{101}$ | $\varepsilon$ | — | Done |

Final state: $q_{101} \in F$ → **Accept** ✓

### Trace: $w = 1100$

| Step | State | Remaining | Symbol |
|---|---|---|---|
| 0 | $q_0$ | $1100$ | 1 |
| 1 | $q_1$ | $100$ | 1 |
| 2 | $q_1$ | $00$ | 0 |
| 3 | $q_{10}$ | $0$ | 0 |
| 4 | $q_0$ | $\varepsilon$ | — |

Final state: $q_0 \notin F$ → **Reject** ✓ (no "101" in "1100")

---

## Example 3: Binary Numbers Divisible by 4

**Language:** $L = \{w \in \{0, 1\}^+ \mid w \text{ represents a binary number divisible by 4}\}$

(We use $\{0,1\}^+$ to exclude the empty string, though we could include it if $\varepsilon$ represents 0.)

### Step 1: What to Track

We track the **remainder when dividing by 4**. As we read the binary number from left to right, each new digit updates the value:

If the number so far has value $v$ and we read digit $d$, the new value is $2v + d$.

The new remainder is:

$$(2v + d) \mod 4$$

Since we only care about the remainder, we only need to track $v \mod 4$.

### Step 2: States

Four states for four possible remainders:

| State | Meaning |
|---|---|
| $q_0$ | Value so far $\equiv 0 \pmod{4}$ |
| $q_1$ | Value so far $\equiv 1 \pmod{4}$ |
| $q_2$ | Value so far $\equiv 2 \pmod{4}$ |
| $q_3$ | Value so far $\equiv 3 \pmod{4}$ |

### Step 3: Transitions

The formula is:

$$\delta(q_i, d) = q_{(2i + d) \mod 4}$$

Let's compute each:

| State | Read 0 (i.e., $d = 0$) | Read 1 (i.e., $d = 1$) |
|---|---|---|
| $q_0$ | $q_{(0) \mod 4} = q_0$ | $q_{(1) \mod 4} = q_1$ |
| $q_1$ | $q_{(2) \mod 4} = q_2$ | $q_{(3) \mod 4} = q_3$ |
| $q_2$ | $q_{(4) \mod 4} = q_0$ | $q_{(5) \mod 4} = q_1$ |
| $q_3$ | $q_{(6) \mod 4} = q_2$ | $q_{(7) \mod 4} = q_3$ |

### Step 4: Start and Accept States

- **Start:** $q_0$ (before reading anything, value is 0, and $0 \mod 4 = 0$)
- **Accept:** $\{q_0\}$ (remainder 0 means divisible by 4)

### Formal Definition

$$M = (\{q_0, q_1, q_2, q_3\}, \{0, 1\}, \delta, q_0, \{q_0\})$$

### Trace: $w = 1100$ (binary for 12)

| Step | State | Value | Remaining |
|---|---|---|---|
| 0 | $q_0$ | 0 | $1100$ |
| 1 | $q_1$ | 1 | $100$ |
| 2 | $q_2$ | 2 (= 10 in binary) | $00$ |  <!-- wait, let me redo -->

Wait — let me recompute carefully. Reading left-to-right:

- Start: state $q_0$
- Read 1: $\delta(q_0, 1) = q_1$ (value = 1, $1 \mod 4 = 1$)
- Read 1: $\delta(q_1, 1) = q_3$ (value = 3, $3 \mod 4 = 3$)
- Read 0: $\delta(q_3, 0) = q_2$ (value = 6, $6 \mod 4 = 2$)
- Read 0: $\delta(q_2, 0) = q_0$ (value = 12, $12 \mod 4 = 0$)

Final state: $q_0 \in F$ → **Accept** ✓ (12 is divisible by 4)

### Trace: $w = 101$ (binary for 5)

- $q_0 \xrightarrow{1} q_1 \xrightarrow{0} q_2 \xrightarrow{1} q_1$

Final state: $q_1 \notin F$ → **Reject** ✓ (5 is not divisible by 4)

### Generalization

This technique works for any modulus $m$. To build a DFA checking divisibility by $m$:
- Use $m$ states: $q_0, q_1, \ldots, q_{m-1}$
- Transition: $\delta(q_i, d) = q_{(2i + d) \mod m}$
- Accept state: $q_0$

---

## Example 4: Every $a$ Immediately Followed by $b$

**Language:** $L = \{w \in \{a, b\}^* \mid \text{every } a \text{ in } w \text{ is immediately followed by } b\}$

Examples:
- $\varepsilon \in L$ (vacuously true — no $a$'s to violate the condition)
- $b \in L$, $bb \in L$, $ab \in L$, $abab \in L$, $bab \in L$
- $a \notin L$ ($a$ at end, not followed by $b$)
- $aa \notin L$ (first $a$ followed by $a$, not $b$)
- $aba \notin L$ (second $a$ not followed by $b$)

### Step 1: What to Track

We need to know: **did we just read an $a$ that hasn't been "resolved" by a following $b$?**

Two situations:
1. Everything is fine so far (no unresolved $a$)
2. We just read an $a$ and are waiting for a $b$

Plus a third: the condition has already been violated (we're in a permanent reject state — a "dead state").

### Step 2: States

| State | Meaning |
|---|---|
| $q_{ok}$ | All $a$'s so far are followed by $b$; not currently after an unresolved $a$ |
| $q_{need\_b}$ | We just read an $a$; the next symbol must be $b$ |
| $q_{dead}$ | Violation occurred; reject no matter what follows |

### Step 3: Transitions

| State | Read $a$ | Read $b$ |
|---|---|---|
| $q_{ok}$ | $q_{need\_b}$ | $q_{ok}$ |
| $q_{need\_b}$ | $q_{dead}$ | $q_{ok}$ |
| $q_{dead}$ | $q_{dead}$ | $q_{dead}$ |

**Reasoning:**
- $q_{ok}$, read $a$: now we need a $b$ next → $q_{need\_b}$
- $q_{ok}$, read $b$: still fine → $q_{ok}$
- $q_{need\_b}$, read $b$: the $a$ is resolved → back to $q_{ok}$
- $q_{need\_b}$, read $a$: violation! The previous $a$ wasn't followed by $b$ → $q_{dead}$
- $q_{dead}$, anything: stay dead (once violated, can't un-violate)

### Step 4: Start and Accept States

- **Start:** $q_{ok}$
- **Accept:** $\{q_{ok}\}$ (NOT $q_{need\_b}$ — if we end in $q_{need\_b}$, there's an $a$ at the end with no following $b$!)

### Formal Definition

$$M = (\{q_{ok}, q_{need\_b}, q_{dead}\}, \{a, b\}, \delta, q_{ok}, \{q_{ok}\})$$

### Trace: $w = abb$

$q_{ok} \xrightarrow{a} q_{need\_b} \xrightarrow{b} q_{ok} \xrightarrow{b} q_{ok}$

Accept ✓

### Trace: $w = aba$

$q_{ok} \xrightarrow{a} q_{need\_b} \xrightarrow{b} q_{ok} \xrightarrow{a} q_{need\_b}$

Reject ✗ (ends in $q_{need\_b}$: last $a$ has no following $b$)

### Trace: $w = aab$

$q_{ok} \xrightarrow{a} q_{need\_b} \xrightarrow{a} q_{dead} \xrightarrow{b} q_{dead}$

Reject ✗ (first $a$ not followed by $b$)

---

## Example 5: Same First and Last Symbol

**Language:** $L = \{w \in \{a, b\}^+ \mid w \text{ starts and ends with the same symbol}\}$

Note: We require $|w| \geq 1$. Single-character strings are in $L$ (start = end).

### Step 1: What to Track

We need to remember:
1. What was the **first** symbol?
2. What was the **last** symbol read?

Since both can be $a$ or $b$, we have $2 \times 2 = 4$ combinations, plus an initial state (before reading anything).

### Step 2: States

| State | Meaning |
|---|---|
| $q_0$ | Haven't read anything yet |
| $q_{aa}$ | Started with $a$, last symbol was $a$ |
| $q_{ab}$ | Started with $a$, last symbol was $b$ |
| $q_{ba}$ | Started with $b$, last symbol was $a$ |
| $q_{bb}$ | Started with $b$, last symbol was $b$ |

### Step 3: Transitions

From $q_0$ (first symbol determines the "started with" part):

$$\delta(q_0, a) = q_{aa}, \quad \delta(q_0, b) = q_{bb}$$

From other states (only the "last symbol" part changes):

| State | Read $a$ | Read $b$ |
|---|---|---|
| $q_{aa}$ | $q_{aa}$ | $q_{ab}$ |
| $q_{ab}$ | $q_{aa}$ | $q_{ab}$ |
| $q_{ba}$ | $q_{ba}$ | $q_{bb}$ |
| $q_{bb}$ | $q_{ba}$ | $q_{bb}$ |

**Pattern:** If we started with $a$, reading $a$ takes us to $q_{aa}$ and reading $b$ takes us to $q_{ab}$. Similarly for starting with $b$.

### Step 4: Start and Accept States

- **Start:** $q_0$
- **Accept:** $\{q_{aa}, q_{bb}\}$ (first symbol = last symbol)

### Formal Definition

$$M = (\{q_0, q_{aa}, q_{ab}, q_{ba}, q_{bb}\}, \{a, b\}, \delta, q_0, \{q_{aa}, q_{bb}\})$$

### Trace: $w = abba$

$q_0 \xrightarrow{a} q_{aa} \xrightarrow{b} q_{ab} \xrightarrow{b} q_{ab} \xrightarrow{a} q_{aa}$

Accept ✓ (starts with $a$, ends with $a$)

### Trace: $w = ab$

$q_0 \xrightarrow{a} q_{aa} \xrightarrow{b} q_{ab}$

Reject ✗ (starts with $a$, ends with $b$)

---

## Example 6: At Least Two $a$'s and At Most One $b$

**Language:** $L = \{w \in \{a, b\}^* \mid w \text{ has } \geq 2 \text{ } a\text{'s AND } \leq 1 \text{ } b\}$

### Step 1: What to Track

Two independent counts:
- Number of $a$'s seen: we care about 0, 1, or $\geq 2$ (once we hit 2, more $a$'s don't change anything)
- Number of $b$'s seen: we care about 0, 1, or $\geq 2$ (once we hit 2, we're permanently rejected)

### Step 2: States

We use pairs ($a$-count category, $b$-count category):

$$(\text{a's}: 0, 1, \geq 2) \times (\text{b's}: 0, 1, \geq 2) = 3 \times 3 = 9 \text{ states}$$

Let's name them $q_{ij}$ where $i$ = number of $a$'s seen (capped at 2) and $j$ = number of $b$'s seen (capped at 2):

$$q_{00}, q_{01}, q_{02}, q_{10}, q_{11}, q_{12}, q_{20}, q_{21}, q_{22}$$

### Step 3: Transitions

Reading $a$ increments the first index (capped at 2):

$$\delta(q_{ij}, a) = q_{\min(i+1, 2), j}$$

Reading $b$ increments the second index (capped at 2):

$$\delta(q_{ij}, b) = q_{i, \min(j+1, 2)}$$

Full table:

| State | Read $a$ | Read $b$ |
|---|---|---|
| $q_{00}$ | $q_{10}$ | $q_{01}$ |
| $q_{01}$ | $q_{11}$ | $q_{02}$ |
| $q_{02}$ | $q_{12}$ | $q_{02}$ |
| $q_{10}$ | $q_{20}$ | $q_{11}$ |
| $q_{11}$ | $q_{21}$ | $q_{12}$ |
| $q_{12}$ | $q_{22}$ | $q_{12}$ |
| $q_{20}$ | $q_{20}$ | $q_{21}$ |
| $q_{21}$ | $q_{21}$ | $q_{22}$ |
| $q_{22}$ | $q_{22}$ | $q_{22}$ |

### Step 4: Start and Accept States

- **Start:** $q_{00}$ (no $a$'s, no $b$'s)
- **Accept:** States where $a$-count $\geq 2$ AND $b$-count $\leq 1$: $\{q_{20}, q_{21}\}$

### Trace: $w = aab$

$q_{00} \xrightarrow{a} q_{10} \xrightarrow{a} q_{20} \xrightarrow{b} q_{21}$

Accept ✓ (2 $a$'s, 1 $b$)

### Trace: $w = abba$

$q_{00} \xrightarrow{a} q_{10} \xrightarrow{b} q_{11} \xrightarrow{b} q_{12} \xrightarrow{a} q_{22}$

Reject ✗ (2 $b$'s — too many)

---

## Product Construction

What if you want a DFA that accepts strings in **both** $L_1$ **and** $L_2$ (i.e., $L_1 \cap L_2$)?

If you already have DFAs $M_1 = (Q_1, \Sigma, \delta_1, s_1, F_1)$ and $M_2 = (Q_2, \Sigma, \delta_2, s_2, F_2)$, you can build a **product DFA**:

$$M = (Q_1 \times Q_2, \Sigma, \delta, (s_1, s_2), F_1 \times F_2)$$

where:

$$\delta((p, q), a) = (\delta_1(p, a), \delta_2(q, a))$$

### Intuition

The product DFA simulates **both** $M_1$ and $M_2$ simultaneously. Each state is a pair $(p, q)$ tracking the current state in each machine. It accepts when **both** machines accept.

### State Count

If $M_1$ has $n_1$ states and $M_2$ has $n_2$ states, the product DFA has at most $n_1 \times n_2$ states.

### Variations

- **Intersection** ($L_1 \cap L_2$): Accept states = $F_1 \times F_2$
- **Union** ($L_1 \cup L_2$): Accept states = $(F_1 \times Q_2) \cup (Q_1 \times F_2)$
- **Difference** ($L_1 \setminus L_2$): Accept states = $F_1 \times (Q_2 \setminus F_2)$

### Example

Combine "odd number of $a$'s" (2 states) with "at most one $b$" (3 states):

Product DFA has $2 \times 3 = 6$ states, accepting strings with an odd number of $a$'s AND at most one $b$.

---

## Common Pitfalls

### 1. Forgetting Transitions

Every $(q, a)$ pair must have a defined transition. If you leave one out, it's not a valid DFA.

**Fix:** Always fill in a complete transition table. If a transition "shouldn't happen" or leads to rejection, send it to a dead/trap state.

### 2. Wrong Accept States

A common error: accepting in a state that represents "work in progress" rather than "condition satisfied."

**Example:** In the "every $a$ followed by $b$" DFA, $q_{need\_b}$ should NOT be an accept state even though no violation has occurred yet — the pending $a$ hasn't been resolved.

### 3. Dead States (Trap States)

Sometimes you need a "garbage" state that the machine enters when the string can never be accepted (like $q_{dead}$ in Example 4). Don't forget to:
- Include it in $Q$
- Define all transitions from it (usually self-loops)
- Exclude it from $F$

### 4. Not Considering Overlap in Pattern Matching

When building DFAs for substring matching, be careful about what happens when a match attempt fails. The failed match might overlap with the start of a new match.

**Example:** Looking for "aba" in the string "aaba" — the second 'a' is both part of the failed first attempt AND the start of the successful match.

### 5. Starting in the Wrong State

The start state represents the situation **before reading any input**. This is often a "neutral" or "zero" state, not an accept state (unless the empty string is in the language).

---

## Exercises

### Exercise 1
Design a DFA over $\Sigma = \{0, 1\}$ that accepts strings with an even number of 0's and an even number of 1's.

**Solution:** Use 4 states tracking (parity of 0's, parity of 1's):
- $q_{ee}$: even 0's, even 1's (start and accept)
- $q_{eo}$: even 0's, odd 1's
- $q_{oe}$: odd 0's, even 1's
- $q_{oo}$: odd 0's, odd 1's

Transitions: reading 0 flips first index, reading 1 flips second.

### Exercise 2
Design a DFA over $\Sigma = \{a, b\}$ that accepts strings of length $\geq 3$.

**Solution:** Track length as 0, 1, 2, or $\geq 3$. Four states: $q_0, q_1, q_2, q_3$. Both $a$ and $b$ advance to the next state (capped at $q_3$). Accept: $\{q_3\}$.

### Exercise 3
Design a DFA over $\Sigma = \{0, 1\}$ that accepts strings NOT containing "11".

**Solution:** Three states:
- $q_0$: safe, last symbol wasn't 1 (start, accept)
- $q_1$: safe, last symbol was 1 (accept)
- $q_{dead}$: seen "11" (reject, trap)

Transitions: $\delta(q_0, 0) = q_0$, $\delta(q_0, 1) = q_1$, $\delta(q_1, 0) = q_0$, $\delta(q_1, 1) = q_{dead}$, $\delta(q_{dead}, \cdot) = q_{dead}$.

### Exercise 4
Design a DFA over $\Sigma = \{a, b, c\}$ that accepts strings where every $b$ is preceded by an $a$.

**Hint:** Track whether you're in a state where reading $b$ is "legal" (last symbol was $a$) or not.

**Solution:** Three states:
- $q_0$: start/after $b$ or $c$ (accept — no $b$ has violated)
- $q_a$: last symbol was $a$ (accept)
- $q_{dead}$: violation occurred (reject)

$\delta(q_0, a) = q_a$, $\delta(q_0, b) = q_{dead}$ (b not preceded by a!), $\delta(q_0, c) = q_0$,
$\delta(q_a, a) = q_a$, $\delta(q_a, b) = q_0$ (legal b), $\delta(q_a, c) = q_0$,
$\delta(q_{dead}, \cdot) = q_{dead}$.

Accept: $\{q_0, q_a\}$.

### Exercise 5
Design a DFA over $\Sigma = \{0, 1\}$ for binary numbers divisible by 3.

**Solution:** Same technique as divisibility by 4, but with 3 states:
- $\delta(q_i, d) = q_{(2i + d) \mod 3}$
- Accept: $\{q_0\}$

| State | Read 0 | Read 1 |
|---|---|---|
| $q_0$ | $q_0$ | $q_1$ |
| $q_1$ | $q_2$ | $q_0$ |
| $q_2$ | $q_1$ | $q_2$ |

### Exercise 6
Design a DFA over $\Sigma = \{a, b\}$ that accepts strings where the number of $a$'s is divisible by 3.

**Solution:** Three states tracking $a$-count mod 3. The $b$'s cause self-loops (don't affect the count).

### Exercise 7
Design a DFA that accepts strings over $\{0, 1\}$ that end in "00".

**Solution:** Track the last two symbols. States: $q_{\text{start}}, q_0, q_{00}, q_1$ (or equivalently: "last two not ending in 0", "last one was 0", "last two were 00", etc.)

### Exercise 8
Design a DFA over $\{a, b\}$ that accepts strings containing both "ab" and "ba" as substrings.

**Hint:** Use the product construction. Build DFAs for "contains ab" and "contains ba" separately, then combine.

### Exercise 9
Design a DFA over $\{a, b\}$ accepting strings where $|w| \mod 3 = 0$ (length divisible by 3).

**Solution:** Three states cycling: $q_0 \to q_1 \to q_2 \to q_0$. Both symbols advance the cycle. Accept: $\{q_0\}$.

### Exercise 10
Design a DFA over $\{0, 1\}$ that rejects strings containing three consecutive 1's ("111").

**Solution:** Track how many consecutive 1's we've seen at the tail:
- $q_0$: zero consecutive 1's at end
- $q_1$: one consecutive 1 at end
- $q_2$: two consecutive 1's at end
- $q_{dead}$: seen "111"

Accept: $\{q_0, q_1, q_2\}$. Transition on 0 goes to $q_0$; transition on 1 advances; $\delta(q_2, 1) = q_{dead}$.

---

## Summary

| Concept | Key Point |
|---|---|
| Design approach | Identify info → states → transitions → start/accept |
| Parity tracking | 2 states (even/odd), symbol flips |
| Substring matching | States = progress in pattern; handle overlap |
| Divisibility | States = remainders; formula $\delta(q_i, d) = q_{(2i+d) \mod m}$ |
| Pattern constraints | May need dead states for permanent rejection |
| Product construction | Simulate two DFAs in parallel; $n_1 \times n_2$ states |

---

## What's Next?

In the next lesson, we'll explore **Nondeterministic Finite Automata (NFA)** — machines that can be in multiple states simultaneously. NFAs are often much easier to design than DFAs, and we'll prove they recognize exactly the same class of languages.
