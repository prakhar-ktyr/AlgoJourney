---
title: NFA Design and Examples
---

# NFA Design and Examples

In this lesson, we'll practice designing NFAs for various languages and then formally prove that regular languages are **closed** under union, concatenation, and Kleene star by constructing NFAs for each operation. These closure constructions are elegant, powerful, and foundational to the theory of regular languages.

---

## NFA Design Strategy

When designing an NFA, use these principles:

1. **Guess the key moment:** Identify the critical point in the string (e.g., where a pattern starts) and let the NFA nondeterministically "guess" when it occurs.
2. **Use $\varepsilon$-transitions for branching:** When the language is a union ($L_1 \cup L_2$), branch from the start to handle each case.
3. **Keep it simple:** Don't worry about what happens on "wrong" guesses — those paths just die. Only the correct guess needs to lead to acceptance.
4. **Verify with traces:** Test your NFA on strings that should be accepted AND strings that should be rejected.

---

## Example 1: Second-to-Last Symbol is 1

**Language:** $L = \{w \in \{0, 1\}^* \mid |w| \geq 2 \text{ and the second-to-last symbol is } 1\}$

Examples: $10, 11, 010, 110, 011, 111, 0100, 1101, \ldots$

### Key Insight

The NFA needs to "know" when it's reading the second-to-last symbol. But it doesn't know the string's length in advance! The solution: **guess** when you're at position $|w| - 1$.

### NFA Design

**States:** $q_0, q_1, q_2$

- $q_0$: Waiting to guess (keep looping)
- $q_1$: Guessed that the current position is second-to-last, and it was 1
- $q_2$: One symbol after the guess — done!

**Transitions:**

| State | Read 0 | Read 1 | $\varepsilon$ |
|---|---|---|---|
| $q_0$ | $\{q_0\}$ | $\{q_0, q_1\}$ | $\emptyset$ |
| $q_1$ | $\{q_2\}$ | $\{q_2\}$ | $\emptyset$ |
| $q_2$ | $\emptyset$ | $\emptyset$ | $\emptyset$ |

**Start:** $q_0$ | **Accept:** $\{q_2\}$

### How It Works

- $q_0$ loops on any symbol, acting as a "buffer" that keeps reading.
- When a 1 is read in $q_0$, the NFA also goes to $q_1$ (guessing "this 1 is the second-to-last symbol").
- From $q_1$, exactly one more symbol is read (any symbol), reaching $q_2$.
- $q_2$ has no outgoing transitions — if the string continues, this path dies.
- The path that guessed correctly (at exactly position $|w|-1$) will be the one that ends at $q_2$ with no remaining input.

### Trace: $w = 0100$

| Step | Current States | Symbol | Next States |
|---|---|---|---|
| Init | $\{q_0\}$ | — | — |
| 1 | $\{q_0\}$ | 0 | $\{q_0\}$ |
| 2 | $\{q_0\}$ | 1 | $\{q_0, q_1\}$ |
| 3 | $\{q_0, q_1\}$ | 0 | $\{q_0, q_2\}$ |
| 4 | $\{q_0, q_2\}$ | 0 | $\{q_0\}$ |

Final: $\{q_0\}$ — no accept state → **Reject** ✗

Wait — let's check. "0100": second-to-last is 0, not 1. Correct!

### Trace: $w = 0110$

| Step | Current States | Symbol | Next States |
|---|---|---|---|
| Init | $\{q_0\}$ | — | — |
| 1 | $\{q_0\}$ | 0 | $\{q_0\}$ |
| 2 | $\{q_0\}$ | 1 | $\{q_0, q_1\}$ |
| 3 | $\{q_0, q_1\}$ | 1 | $\{q_0, q_1, q_2\}$ |
| 4 | $\{q_0, q_1, q_2\}$ | 0 | $\{q_0, q_2\}$ |

Final: $\{q_0, q_2\}$ — $q_2 \in F$ → **Accept** ✓

"0110": second-to-last is 1. Correct!

### Why a DFA Is Harder

An equivalent DFA must track the last two symbols at all times, requiring **at least 4** states (for the 4 possible pairs: 00, 01, 10, 11). The NFA does it with just 3 — and with a much cleaner design.

---

## Example 2: Contains "aab" OR "bba"

**Language:** $L = \{w \in \{a, b\}^* \mid w \text{ contains "aab" or "bba" as a substring}\}$

### NFA Design

Use $\varepsilon$-transitions from the start to split into two parallel sub-NFAs:

**States:** $q_0$ (start), $q_1, q_2, q_3$ (for "aab"), $q_4, q_5, q_6$ (for "bba"), $q_7$ (shared accept)

**Sub-NFA for "aab":**
- $q_1$: Waiting to guess where "aab" starts (loops on $a, b$)
- $q_2$: Saw first $a$ of "aab"
- $q_3$: Saw "aa"

Transitions:
- $\delta(q_1, a) = \{q_1, q_2\}$, $\delta(q_1, b) = \{q_1\}$
- $\delta(q_2, a) = \{q_3\}$
- $\delta(q_3, b) = \{q_7\}$

**Sub-NFA for "bba":**
- $q_4$: Waiting to guess where "bba" starts (loops on $a, b$)
- $q_5$: Saw first $b$ of "bba"
- $q_6$: Saw "bb"

Transitions:
- $\delta(q_4, b) = \{q_4, q_5\}$, $\delta(q_4, a) = \{q_4\}$
- $\delta(q_5, b) = \{q_6\}$
- $\delta(q_6, a) = \{q_7\}$

**Accept state $q_7$** (loops on both symbols):
- $\delta(q_7, a) = \{q_7\}$, $\delta(q_7, b) = \{q_7\}$

**Start:** $q_0$ with $\delta(q_0, \varepsilon) = \{q_1, q_4\}$

**Accept:** $\{q_7\}$

### How It Works

The $\varepsilon$-transitions from $q_0$ immediately split computation:
- One copy searches for "aab"
- Another copy searches for "bba"
- If either finds its pattern, the NFA reaches $q_7$ and accepts.

---

## Example 3: Third-from-End Is $a$

**Language:** $L = \{w \in \{a, b\}^* \mid |w| \geq 3 \text{ and } w_{|w|-2} = a\}$

(The third symbol from the end is $a$.)

### NFA Design

Same guessing strategy as Example 1, but now we need to read exactly 2 more symbols after the guess:

**States:** $q_0, q_1, q_2, q_3$

- $q_0$: Waiting (loops on everything)
- $q_1$: Guessed that the current $a$ is third-from-end
- $q_2$: One symbol after the guess
- $q_3$: Two symbols after the guess — accept!

**Transitions:**

| State | Read $a$ | Read $b$ |
|---|---|---|
| $q_0$ | $\{q_0, q_1\}$ | $\{q_0\}$ |
| $q_1$ | $\{q_2\}$ | $\{q_2\}$ |
| $q_2$ | $\{q_3\}$ | $\{q_3\}$ |
| $q_3$ | $\emptyset$ | $\emptyset$ |

**Start:** $q_0$ | **Accept:** $\{q_3\}$

### Trace: $w = babb$

| Step | States | Symbol | Next |
|---|---|---|---|
| Init | $\{q_0\}$ | — | — |
| 1 | $\{q_0\}$ | $b$ | $\{q_0\}$ |
| 2 | $\{q_0\}$ | $a$ | $\{q_0, q_1\}$ |
| 3 | $\{q_0, q_1\}$ | $b$ | $\{q_0, q_2\}$ |
| 4 | $\{q_0, q_2\}$ | $b$ | $\{q_0, q_3\}$ |

Final: $q_3 \in F$ → **Accept** ✓ (third from end of "babb" is $a$)

### Important: Exponential DFA

An equivalent DFA for this language requires **at least 8 states** (it must track the last 3 symbols: $2^3 = 8$ combinations). In general, "the $n$-th symbol from the end is 1" requires an NFA with $n+1$ states but a DFA with at least $2^n$ states!

---

## Example 4: Union Construction

**Theorem:** If $L_1$ and $L_2$ are regular languages, then $L_1 \cup L_2$ is regular.

**Proof:** Given NFAs $N_1 = (Q_1, \Sigma, \delta_1, s_1, F_1)$ and $N_2 = (Q_2, \Sigma, \delta_2, s_2, F_2)$, construct NFA $N$ for $L_1 \cup L_2$:

### Construction

$$N = (Q_1 \cup Q_2 \cup \{q_0\}, \Sigma, \delta, q_0, F_1 \cup F_2)$$

where $q_0$ is a new start state, and:

$$\delta(q, a) = \begin{cases}
\delta_1(q, a) & \text{if } q \in Q_1 \\
\delta_2(q, a) & \text{if } q \in Q_2 \\
\emptyset & \text{if } q = q_0, a \in \Sigma
\end{cases}$$

$$\delta(q_0, \varepsilon) = \{s_1, s_2\}$$

### Diagram

```
              ε → [N₁: s₁ → ... → F₁]
    → (q₀)
              ε → [N₂: s₂ → ... → F₂]
```

### Why It Works

- The NFA starts in $q_0$, then immediately splits (via $\varepsilon$) into $s_1$ and $s_2$.
- One copy simulates $N_1$, the other simulates $N_2$.
- If $w \in L_1$, the copy in $N_1$ reaches an accept state → $N$ accepts.
- If $w \in L_2$, the copy in $N_2$ reaches an accept state → $N$ accepts.
- If $w \notin L_1 \cup L_2$, neither copy accepts → $N$ rejects.

### State Count

$|Q_1| + |Q_2| + 1$ states (just one new state added).

---

## Example 5: Concatenation Construction

**Theorem:** If $L_1$ and $L_2$ are regular, then $L_1 \cdot L_2 = \{xy \mid x \in L_1, y \in L_2\}$ is regular.

**Proof:** Given NFAs $N_1$ and $N_2$, construct NFA $N$ for $L_1 \cdot L_2$:

### Construction

$$N = (Q_1 \cup Q_2, \Sigma, \delta, s_1, F_2)$$

The key modification: add $\varepsilon$-transitions from every accept state of $N_1$ to the start state of $N_2$:

$$\delta(q, a) = \begin{cases}
\delta_1(q, a) & \text{if } q \in Q_1 \setminus F_1 \\
\delta_1(q, a) & \text{if } q \in F_1, a \in \Sigma \\
\delta_1(q, a) \cup \{s_2\} & \text{if } q \in F_1, a = \varepsilon \\
\delta_2(q, a) & \text{if } q \in Q_2
\end{cases}$$

More cleanly: keep all original transitions, and add:

$$\forall q \in F_1: \delta(q, \varepsilon) = \delta_1(q, \varepsilon) \cup \{s_2\}$$

### Diagram

```
→ [N₁: s₁ → ... → F₁] --ε-→ [N₂: s₂ → ... → F₂]
                          (from each state in F₁)
```

### Why It Works

- Start in $s_1$ (start of $N_1$).
- Process input using $N_1$'s transitions.
- Whenever $N_1$ reaches an accept state, the NFA **guesses**: "Is this where $x$ ends and $y$ begins?"
- If yes, take the $\varepsilon$-transition to $s_2$ and continue with $N_2$.
- Accept only in $F_2$ (the accept states of $N_2$).
- If the guess is wrong (not the right split point), that path will die.
- The correct guess (where $x \in L_1$ and the remaining $y \in L_2$) leads to acceptance.

### Important Detail

The accept states of the concatenation NFA are **only** $F_2$, not $F_1$. We don't un-mark $F_1$ as accept states in the NFA's state set — we simply don't include them in the new NFA's accept set. The $\varepsilon$-transitions from $F_1$ ensure the machine can proceed to $N_2$ at the right moment.

**Exception:** What if $\varepsilon \in L_2$? Then $s_2 \in F_2$, and since accept states of the concatenation are $F_2$, this is handled correctly. And if $\varepsilon \in L_1$? Then $s_1 \in F_1$, so there's an $\varepsilon$-transition from $s_1$ to $s_2$ — the NFA can immediately jump to $N_2$.

### State Count

$|Q_1| + |Q_2|$ states (no new states needed, just new transitions).

---

## Example 6: Kleene Star Construction

**Theorem:** If $L$ is regular, then $L^* = \{\varepsilon\} \cup L \cup LL \cup LLL \cup \cdots$ is regular.

**Proof:** Given NFA $N_1 = (Q_1, \Sigma, \delta_1, s_1, F_1)$, construct NFA $N$ for $L^*$:

### Construction

$$N = (Q_1 \cup \{q_0\}, \Sigma, \delta, q_0, \{q_0\})$$

where $q_0$ is a **new** start state (also an accept state), and:

$$\delta(q_0, \varepsilon) = \{s_1\}$$

$$\forall q \in F_1: \delta(q, \varepsilon) = \delta_1(q, \varepsilon) \cup \{s_1\}$$

All other transitions remain as in $N_1$.

### Diagram

```
                    ε (loop back)
                ┌──────────────────┐
                ▼                  │
→ ((q₀)) --ε-→ [N₁: s₁ → ... → F₁]
```

### Why It Works

- $q_0$ is accepting (handles $\varepsilon \in L^*$).
- $q_0 \xrightarrow{\varepsilon} s_1$: can start matching one copy of $L$.
- From any accept state of $N_1$, $\varepsilon$-transition back to $s_1$: can start matching another copy.
- This allows matching $\varepsilon$, or one copy of $L$, or two copies, etc.

### Why We Need a New Start State

We can't just make $s_1$ accepting (to handle $\varepsilon$), because that might accept strings not in $L^*$. Consider $L = \{ab\}$:
- If we made $s_1$ accepting, the NFA might accept "a" (reach $s_1$ accepting, even though only "ab" is in $L$).
- A separate $q_0$ that's accepting avoids this problem.

### State Count

$|Q_1| + 1$ states.

---

## Closure Properties Summary

These three constructions prove:

> **Theorem:** The class of regular languages is closed under:
> 1. **Union** ($L_1 \cup L_2$)
> 2. **Concatenation** ($L_1 \cdot L_2$)
> 3. **Kleene star** ($L^*$)

| Operation | Construction | New States | New Accept States |
|---|---|---|---|
| $L_1 \cup L_2$ | New start → $\varepsilon$ → both | $|Q_1| + |Q_2| + 1$ | $F_1 \cup F_2$ |
| $L_1 \cdot L_2$ | $\varepsilon$ from $F_1$ to $s_2$ | $|Q_1| + |Q_2|$ | $F_2$ |
| $L^*$ | New start (accept) → $\varepsilon$ → $s_1$; $F_1$ → $\varepsilon$ → $s_1$ | $|Q_1| + 1$ | $\{q_0\}$ |

These are exactly the operations used to build **regular expressions**, which is why regular expressions and finite automata define the same class of languages.

---

## Step-by-Step Trace: Concatenation

Let's trace a concrete concatenation construction.

**$L_1$:** strings ending in $a$ (over $\{a, b\}$)
- NFA $N_1$: states $\{p_0, p_1\}$, start $p_0$, accept $\{p_1\}$
- $\delta_1(p_0, a) = \{p_1\}$, $\delta_1(p_0, b) = \{p_0\}$, $\delta_1(p_1, a) = \{p_1\}$, $\delta_1(p_1, b) = \{p_0\}$

**$L_2$:** strings starting with $b$
- NFA $N_2$: states $\{r_0, r_1\}$, start $r_0$, accept $\{r_1\}$
- $\delta_2(r_0, b) = \{r_1\}$, $\delta_2(r_1, a) = \{r_1\}$, $\delta_2(r_1, b) = \{r_1\}$

**Concatenation NFA** for $L_1 \cdot L_2$ (strings of the form $xb\cdots$ where $x$ ends in $a$):
- States: $\{p_0, p_1, r_0, r_1\}$
- Start: $p_0$, Accept: $\{r_1\}$
- Added: $\delta(p_1, \varepsilon) = \{r_0\}$

### Trace: $w = aab$

| Step | States | Symbol | Next (before ECLOSE) | After ECLOSE |
|---|---|---|---|---|
| Init | — | — | — | ECLOSE($p_0$) = $\{p_0\}$ |
| 1 | $\{p_0\}$ | $a$ | $\{p_1\}$ | ECLOSE($\{p_1\}$) = $\{p_1, r_0\}$ |
| 2 | $\{p_1, r_0\}$ | $a$ | $\delta(p_1, a) \cup \delta(r_0, a) = \{p_1\} \cup \emptyset = \{p_1\}$ | ECLOSE($\{p_1\}$) = $\{p_1, r_0\}$ |
| 3 | $\{p_1, r_0\}$ | $b$ | $\delta(p_1, b) \cup \delta(r_0, b) = \{p_0\} \cup \{r_1\} = \{p_0, r_1\}$ | $\{p_0, r_1\}$ |

Final: $r_1 \in \{r_1\}$ = Accept → **Accept** ✓

String "aab": $x = "aa"$ (ends in $a$), $y = "b"$ (starts with $b$). Correct!

---

## Step-by-Step Trace: Kleene Star

**$L$:** $\{ab\}$ (just the single string "ab")
- NFA $N_1$: states $\{s_0, s_1, s_2\}$, start $s_0$, accept $\{s_2\}$
- $\delta(s_0, a) = \{s_1\}$, $\delta(s_1, b) = \{s_2\}$

**Kleene Star NFA** for $L^* = \{\varepsilon, ab, abab, ababab, \ldots\}$:
- New start: $q_0$ (accepting)
- Added: $\delta(q_0, \varepsilon) = \{s_0\}$, $\delta(s_2, \varepsilon) = \{s_0\}$
- Accept: $\{q_0\}$

### Trace: $w = abab$

| Step | States | Symbol | Next | After ECLOSE |
|---|---|---|---|---|
| Init | — | — | — | ECLOSE($q_0$) = $\{q_0, s_0\}$ |
| 1 | $\{q_0, s_0\}$ | $a$ | $\delta(q_0,a) \cup \delta(s_0,a) = \emptyset \cup \{s_1\}$ | $\{s_1\}$ |
| 2 | $\{s_1\}$ | $b$ | $\{s_2\}$ | ECLOSE($\{s_2\}$) = $\{s_2, s_0\}$ |
| 3 | $\{s_2, s_0\}$ | $a$ | $\delta(s_2,a) \cup \delta(s_0,a) = \emptyset \cup \{s_1\}$ | $\{s_1\}$ |
| 4 | $\{s_1\}$ | $b$ | $\{s_2\}$ | ECLOSE($\{s_2\}$) = $\{s_2, s_0\}$ |

Final: $\{s_2, s_0\}$. Is $q_0$ in this set? No. But wait — is $q_0 \in F$? We need $q_0$ in the current states to accept.

Hmm, let me reconsider. The accept state is $\{q_0\}$, but $q_0$ only appears at initialization. Once we leave via $\varepsilon$ and start reading, $q_0$ can't be reached again unless there's a path back.

We should add: $\delta(s_2, \varepsilon) = \{s_0\}$ — but should it also go back to $q_0$?

Actually, let's reconsider the standard construction: $\delta(s_2, \varepsilon) = \{s_0\}$ (loop back to the start of $N_1$). But the accept set should include states that indicate "we've completed a valid number of repetitions." The clean way: make accept states $\{q_0\} \cup F_1$ where $F_1$'s states get $\varepsilon$-transitions back to $s_0$.

The standard construction sets accept states as $\{q_0\}$ only (for $\varepsilon$), but also adds $F_1$ to the accept set (since after completing any copy, we should accept). Let me use the variant where $F = \{q_0\} \cup F_1$:

With $F = \{q_0, s_2\}$:
- Final states $\{s_2, s_0\}$: $s_2 \in F$ → **Accept** ✓



---

## Exercises

### Exercise 1
Design an NFA for strings over $\{a, b\}$ that end with $aba$.

**Solution:** 4 states: $q_0$ (loop), guess $a$ → $q_1$, see $b$ → $q_2$, see $a$ → $q_3$ (accept). $\delta(q_0, a) = \{q_0, q_1\}$, $\delta(q_0, b) = \{q_0\}$.

### Exercise 2
Using the union construction, build an NFA for "strings starting with $a$" $\cup$ "strings ending with $b$".

**Solution:**

Sub-NFA $N_1$ for "starts with $a$": states $\{p_0, p_1, p_2\}$
- $\delta(p_0, a) = \{p_1\}$, $\delta(p_0, b) = \{p_2\}$ (dead)
- $p_1$ loops on $a, b$. Accept: $\{p_1\}$. Dead state $p_2$ loops.

Sub-NFA $N_2$ for "ends with $b$": states $\{r_0, r_1\}$
- $\delta(r_0, a) = \{r_0\}$, $\delta(r_0, b) = \{r_0, r_1\}$
- Accept: $\{r_1\}$ (no transitions from $r_1$ — path dies if string continues)

Union NFA: new start $q_0$, $\delta(q_0, \varepsilon) = \{p_0, r_0\}$. Accept: $\{p_1, r_1\}$. Total: 6 states.

### Exercise 3
Using the concatenation construction, build an NFA for $\{a, b\}^* \cdot \{ab\}$ (strings ending in $ab$).

**Solution:**

$N_1$ for $\{a,b\}^*$: single state $p_0$ (start and accept), loops on $a, b$.

$N_2$ for $\{ab\}$: states $\{r_0, r_1, r_2\}$. $\delta(r_0, a) = \{r_1\}$, $\delta(r_1, b) = \{r_2\}$. Accept: $\{r_2\}$.

Concatenation: add $\delta(p_0, \varepsilon) = \{r_0\}$ (since $p_0 \in F_1$). Start: $p_0$. Accept: $\{r_2\}$.

Since $p_0$ is always active and always has an $\varepsilon$ to $r_0$, at every step the NFA "guesses" whether to start matching "ab". Total: 4 states.

### Exercise 4
Design an NFA for $(ab \cup ba)^*$ using the Kleene star and union constructions.

**Solution:**

Step 1 — NFA for $\{ab\}$: $s_0 \xrightarrow{a} s_1 \xrightarrow{b} s_2$. Accept: $\{s_2\}$.

Step 2 — NFA for $\{ba\}$: $t_0 \xrightarrow{b} t_1 \xrightarrow{a} t_2$. Accept: $\{t_2\}$.

Step 3 — Union $ab \cup ba$: new start $u_0$, $\delta(u_0, \varepsilon) = \{s_0, t_0\}$. Accept: $\{s_2, t_2\}$. States: 7.

Step 4 — Kleene star $(ab \cup ba)^*$: new start $q_0$ (accepting), $\delta(q_0, \varepsilon) = \{u_0\}$, $\delta(s_2, \varepsilon) = \{u_0\}$, $\delta(t_2, \varepsilon) = \{u_0\}$. Accept: $\{q_0, s_2, t_2\}$. States: 8.

### Exercise 5
How many states does your NFA from Exercise 4 have? How many would a DFA need?

**Solution:** The NFA has 8 states. An equivalent DFA (after subset construction and minimization) needs 5 states: one tracking each possible position within the repetition cycle (start, after-a, after-ab/after-ba, after-b, dead).

---

## Additional Practice Problems

### Problem 1: NFA for Strings Where $|w| \equiv 0 \pmod{2}$ OR $|w| \equiv 0 \pmod{3}$

This is the union of "even length" and "length divisible by 3."

**Construction:** 
- Sub-NFA for even length: 2 states cycling ($p_0, p_1$). Accept: $\{p_0\}$.
- Sub-NFA for div-by-3: 3 states cycling ($r_0, r_1, r_2$). Accept: $\{r_0\}$.
- Union: new start $q_0$ with $\varepsilon$ to both. Total: 6 states.

### Problem 2: NFA for $(a \cup b)^* a (a \cup b)^2$

This is "the third-from-last symbol is $a$" — exactly Example 3 from earlier! The regex translates directly to an NFA via concatenation:
- $(a \cup b)^*$: single looping state
- $a$: single transition
- $(a \cup b)^2$: chain of 2 any-symbol transitions

### Problem 3: Closure Under Complement?

The closure constructions for NFAs handle union, concatenation, and Kleene star. But what about **complement**?

For DFAs, complementation is trivial: just swap accept and reject states. For NFAs, it's **not** that simple! Swapping accept/reject states in an NFA does NOT give the complement language.

**Why?** Because an NFA accepts if ANY path leads to accept. Swapping means: accept if ANY path leads to a (formerly rejecting) state. But this isn't the same as "no path leads to a (formerly accepting) state."

To complement an NFA:
1. Convert to DFA (subset construction)
2. Complement the DFA (swap accept/reject)

This is why complement can cause exponential blowup even when the original NFA is small.

---

## Summary

| Construction | Purpose | Key Idea |
|---|---|---|
| "Guess" technique | Design simpler NFAs | Nondeterministically pick the critical moment |
| Union | $L_1 \cup L_2$ | $\varepsilon$-branch from new start to both sub-NFAs |
| Concatenation | $L_1 \cdot L_2$ | $\varepsilon$ from $F_1$ to $s_2$; accept only in $F_2$ |
| Kleene Star | $L^*$ | New accepting start; loop back from $F_1$ to $s_1$ |
| Complement | $\overline{L}$ | Must convert to DFA first; can't just swap in NFA |

---

## What's Next?

We've seen that NFAs are equivalent in power to DFAs. In the next lesson, we'll prove this formally by showing the **subset construction** — an algorithm that converts any NFA into an equivalent DFA.
