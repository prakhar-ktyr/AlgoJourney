---
title: "Regular Expression to NFA: Thompson's Construction"
---

# Regular Expression to NFA: Thompson's Construction

In this lesson, you'll learn **Thompson's Construction** — a systematic algorithm that converts any regular expression into an equivalent NFA. This is one direction of the proof that regular expressions and finite automata describe the same class of languages.

---

## Goal

Given a regular expression $R$, build an NFA $N$ such that:

$$L(N) = L(R)$$

The NFA accepts exactly the strings described by the regex. Thompson's construction achieves this by building the NFA **recursively**, mirroring the structure of the regex.

---

## Why Thompson's Construction?

- It's **simple and elegant** — each regex operator maps to a small NFA fragment
- It produces NFAs with **predictable structure** (useful for analysis)
- It's **efficient** — the resulting NFA has at most $2|R|$ states, where $|R|$ is the length of the regex
- It's used in **real regex engines** (grep, awk, and many compilers)
- The construction is **compositional** — build small pieces, combine them

---

## The Construction: Base Cases

We start with the simplest regular expressions and show the NFA for each.

### Base Case 1: Empty String $\varepsilon$

The regex $\varepsilon$ matches only the empty string.

**NFA:**

```
→ (q0) ——ε——→ ((q1))
```

- State $q_0$: start state
- State $q_1$: accept state
- Single $\varepsilon$-transition from start to accept

Formally: $N = (\{q_0, q_1\}, \Sigma, \delta, q_0, \{q_1\})$ where $\delta(q_0, \varepsilon) = \{q_1\}$.

### Base Case 2: Single Symbol $a$ (for $a \in \Sigma$)

The regex $a$ matches only the single-character string "a".

**NFA:**

```
→ (q0) ——a——→ ((q1))
```

- State $q_0$: start state
- State $q_1$: accept state
- Single transition on symbol $a$

Formally: $N = (\{q_0, q_1\}, \Sigma, \delta, q_0, \{q_1\})$ where $\delta(q_0, a) = \{q_1\}$.

### Base Case 3: Empty Set $\emptyset$

The regex $\emptyset$ matches **no strings at all**.

**NFA:**

```
→ (q0)          ((q1))
```

- State $q_0$: start state
- State $q_1$: accept state
- **No transitions** — the accept state is unreachable

Formally: $N = (\{q_0, q_1\}, \Sigma, \delta, q_0, \{q_1\})$ where $\delta$ is empty (no transitions defined).

---

## The Construction: Inductive Cases

Now we show how to combine NFAs for subexpressions into larger NFAs.

### Union: $R_1 \cup R_2$

Given NFAs $N_1$ for $R_1$ and $N_2$ for $R_2$, build an NFA for $R_1 \cup R_2$.

**Construction:**

```
              ε → [  N1  ] → ε
→ (q0) ─────┤                    ├────→ ((qf))
              ε → [  N2  ] → ε
```

Steps:
1. Create a **new start state** $q_0$
2. Create a **new accept state** $q_f$
3. Add $\varepsilon$-transition from $q_0$ to the start state of $N_1$
4. Add $\varepsilon$-transition from $q_0$ to the start state of $N_2$
5. Add $\varepsilon$-transition from the accept state of $N_1$ to $q_f$
6. Add $\varepsilon$-transition from the accept state of $N_2$ to $q_f$
7. The old accept states of $N_1$ and $N_2$ are no longer accept states

**Why it works:** From the new start, we non-deterministically choose to enter $N_1$ or $N_2$. If the input matches either pattern, we reach $q_f$.

**Formally:** If $N_1 = (Q_1, \Sigma, \delta_1, s_1, \{f_1\})$ and $N_2 = (Q_2, \Sigma, \delta_2, s_2, \{f_2\})$, then:

$$N = (Q_1 \cup Q_2 \cup \{q_0, q_f\}, \Sigma, \delta, q_0, \{q_f\})$$

where $\delta$ includes all transitions from $\delta_1$ and $\delta_2$ plus:
- $\delta(q_0, \varepsilon) = \{s_1, s_2\}$
- $\delta(f_1, \varepsilon) = \{q_f\}$
- $\delta(f_2, \varepsilon) = \{q_f\}$

### Concatenation: $R_1 R_2$

Given NFAs $N_1$ for $R_1$ and $N_2$ for $R_2$, build an NFA for $R_1 R_2$.

**Construction:**

```
→ [  N1  ] ——ε——→ [  N2  ] →
```

Steps:
1. The start state is the start state of $N_1$
2. The accept state is the accept state of $N_2$
3. Add $\varepsilon$-transition from the accept state of $N_1$ to the start state of $N_2$
4. The old accept state of $N_1$ is no longer an accept state

**Why it works:** The NFA first processes the input through $N_1$. When $N_1$ would accept (meaning the prefix matches $R_1$), we $\varepsilon$-transition into $N_2$ and continue processing. We accept only if the remainder matches $R_2$.

**Formally:** If $N_1 = (Q_1, \Sigma, \delta_1, s_1, \{f_1\})$ and $N_2 = (Q_2, \Sigma, \delta_2, s_2, \{f_2\})$, then:

$$N = (Q_1 \cup Q_2, \Sigma, \delta, s_1, \{f_2\})$$

where $\delta$ includes all transitions from $\delta_1$ and $\delta_2$ plus:
- $\delta(f_1, \varepsilon) = \{s_2\}$ (added to any existing $\varepsilon$-transitions from $f_1$)

### Kleene Star: $R_1^*$

Given NFA $N_1$ for $R_1$, build an NFA for $R_1^*$.

**Construction:**

```
              ε
→ (q0) ——ε——→ [  N1  ] ——ε——→ ((qf))
    |              ↑____ε____|         ↑
    |____________________________ε_____|
```

Steps:
1. Create a **new start state** $q_0$
2. Create a **new accept state** $q_f$
3. Add $\varepsilon$-transition from $q_0$ to the start state of $N_1$ (to begin matching)
4. Add $\varepsilon$-transition from $q_0$ to $q_f$ (to accept $\varepsilon$ — zero repetitions)
5. Add $\varepsilon$-transition from the accept state of $N_1$ to the start state of $N_1$ (to loop for more repetitions)
6. Add $\varepsilon$-transition from the accept state of $N_1$ to $q_f$ (to stop repeating)
7. The old accept state of $N_1$ is no longer an accept state

**Why it works:**
- The $q_0 \to q_f$ transition handles zero repetitions ($\varepsilon \in L(R_1^*)$)
- The loop from $N_1$'s accept back to $N_1$'s start allows multiple repetitions
- After any number of successful passes through $N_1$, we can exit to $q_f$

**Formally:** If $N_1 = (Q_1, \Sigma, \delta_1, s_1, \{f_1\})$, then:

$$N = (Q_1 \cup \{q_0, q_f\}, \Sigma, \delta, q_0, \{q_f\})$$

where $\delta$ includes all transitions from $\delta_1$ plus:
- $\delta(q_0, \varepsilon) = \{s_1, q_f\}$
- $\delta(f_1, \varepsilon) = \{s_1, q_f\}$

---

## Properties of Thompson NFAs

NFAs built by Thompson's construction have several nice **structural properties**:

### Property 1: Exactly One Accept State

Every Thompson NFA has exactly **one start state** and exactly **one accept state**. This makes composition easy — we always know where to attach connections.

### Property 2: No Incoming Transitions to Start

The start state has **no incoming transitions**. No arrow ever points back to the start state (the loop in star goes to the *inner* NFA's start, not the outer start).

### Property 3: No Outgoing Transitions from Accept

The accept state has **no outgoing transitions**. Once we reach the accept state, processing stops.

### Property 4: Linear Size

For a regex of length $|R|$ (counting symbols and operators), the Thompson NFA has:

$$\text{Number of states} \leq 2|R|$$

Each base case adds 2 states. Each inductive case adds at most 2 states. So the total is at most $2|R|$ states.

This linear bound is important for efficiency — it means the NFA doesn't blow up in size.

### Property 5: Limited Branching

Each state has at most **two outgoing transitions**:
- Either one transition on a symbol (for base case $a$)
- Or at most two $\varepsilon$-transitions (for union, concat, star)

---

## Complete Example 1: $(a \cup b)^* a b$

Let's build the Thompson NFA for $(a \cup b)^* ab$ step by step, bottom-up.

### Step 1: Build NFA for $a$

```
→ (1) ——a——→ ((2))
```

States: $\{1, 2\}$, start: 1, accept: 2.

### Step 2: Build NFA for $b$

```
→ (3) ——b——→ ((4))
```

States: $\{3, 4\}$, start: 3, accept: 4.

### Step 3: Build NFA for $a \cup b$ (union of Steps 1 and 2)

```
         ε → (1) —a→ (2) —ε
→ (5) ──┤                     ├──→ ((6))
         ε → (3) —b→ (4) —ε
```

States: $\{1, 2, 3, 4, 5, 6\}$, start: 5, accept: 6.

Transitions:
- $\delta(5, \varepsilon) = \{1, 3\}$
- $\delta(1, a) = \{2\}$
- $\delta(3, b) = \{4\}$
- $\delta(2, \varepsilon) = \{6\}$
- $\delta(4, \varepsilon) = \{6\}$

### Step 4: Build NFA for $(a \cup b)^*$ (star of Step 3)

```
→ (7) ——ε——→ (5) ──[union NFA]──→ (6) ——ε——→ ((8))
  |                                      |
  |——————————————ε———————————————————————→|
                  ↑__________ε___________|
                  (6 back to 5)
```

States: $\{1, 2, 3, 4, 5, 6, 7, 8\}$, start: 7, accept: 8.

New transitions:
- $\delta(7, \varepsilon) = \{5, 8\}$ (enter inner NFA or accept $\varepsilon$)
- $\delta(6, \varepsilon) = \{5, 8\}$ (loop back or exit)

### Step 5: Build NFA for $a$ (second occurrence)

```
→ (9) ——a——→ ((10))
```

### Step 6: Build NFA for $b$ (second occurrence)

```
→ (11) ——b——→ ((12))
```

### Step 7: Build NFA for $ab$ (concatenation of Steps 5 and 6)

```
→ (9) ——a——→ (10) ——ε——→ (11) ——b——→ ((12))
```

Start: 9, accept: 12.
New transition: $\delta(10, \varepsilon) = \{11\}$

### Step 8: Build NFA for $(a \cup b)^* ab$ (concatenation of Steps 4 and 7)

```
→ (7) ——ε——→ [...star NFA...] ——→ (8) ——ε——→ (9) ——a——→ (10) ——ε——→ (11) ——b——→ ((12))
```

Start: 7, accept: 12.
New transition: $\delta(8, \varepsilon) = \{9\}$

Wait — but Property 3 says the accept state has no outgoing transitions. Actually, when we concatenate, state 8 is **no longer** the accept state. We connect it to the next part, and only state 12 is the final accept.

### Final NFA Summary

The complete NFA has **12 states** (and $|R| = 7$ symbols/operators, so $2 \times 7 = 14$ is the upper bound — we're under it).

**Verification:** Let's trace the string "aba":
- Start at 7
- $\varepsilon$ to 5 (entering the star)
- $\varepsilon$ to 1 (choosing $a$ branch in union)
- Read 'a': go to 2
- $\varepsilon$ to 6 (exit union)
- $\varepsilon$ to 5 (loop in star)
- $\varepsilon$ to 3 (choosing $b$ branch)
- Read 'b': go to 4
- $\varepsilon$ to 6 (exit union)
- $\varepsilon$ to 8 (exit star — but 8 is no longer accept here)
- $\varepsilon$ to 9
- Read 'a': go to 10
- $\varepsilon$ to 11
- But we have no more input and need to read 'b' to reach 12!

So "aba" is **not** accepted. Correct! The string "ab" would be accepted (skip the star, go straight to the $ab$ part).

Let's verify "ab":
- Start at 7, $\varepsilon$ to 8 (zero repetitions of star), $\varepsilon$ to 9, read 'a' to 10, $\varepsilon$ to 11, read 'b' to 12. Accept! ✓

---

## Complete Example 2: $(01^* \cup 10^*)$

### Step 1: Build NFA for $0$

```
→ (1) ——0——→ ((2))
```

### Step 2: Build NFA for $1$

```
→ (3) ——1——→ ((4))
```

### Step 3: Build NFA for $1^*$ (star of Step 2)

```
→ (5) ——ε——→ (3) ——1——→ (4) ——ε——→ ((6))
  |                         |              ↑
  |————————————ε————————————|——————————————→|
               ↑_____ε_____|
```

Transitions:
- $\delta(5, \varepsilon) = \{3, 6\}$
- $\delta(4, \varepsilon) = \{3, 6\}$

### Step 4: Build NFA for $01^*$ (concatenation of Steps 1 and 3)

```
→ (1) ——0——→ (2) ——ε——→ (5) ——ε——→ (3) ——1——→ (4) ——ε——→ ((6))
                                                    ↑___ε___|
                           |————————————ε————————————————————————→|
```

Start: 1, accept: 6.

### Step 5: Similarly build NFA for $10^*$

```
→ (7) ——1——→ (8) ——ε——→ (9) ——ε——→ (10) ——0——→ (11) ——ε——→ ((12))
                                                      ↑___ε___|
                            |————————————ε—————————————————————————→|
```

Start: 7, accept: 12.

### Step 6: Build NFA for $01^* \cup 10^*$ (union of Steps 4 and 5)

```
          ε → [NFA for 01*] → ε
→ (13) ──┤                        ├──→ ((14))
          ε → [NFA for 10*] → ε
```

Transitions:
- $\delta(13, \varepsilon) = \{1, 7\}$
- $\delta(6, \varepsilon) = \{14\}$
- $\delta(12, \varepsilon) = \{14\}$

Start: 13, accept: 14. Total: **14 states**.

---

## Step-by-Step Walkthrough Strategy

When building Thompson NFAs by hand, follow this systematic approach:

### 1. Parse the Regex

Identify the **outermost** operation (respecting precedence):

- If the outermost is union: split at the $\cup$
- If the outermost is concatenation: split into the two parts
- If the outermost is star: identify the inner expression
- If it's a single symbol or $\varepsilon$ or $\emptyset$: use base case

### 2. Build Bottom-Up

Start with the smallest subexpressions (individual symbols) and work outward.

### 3. Track State Numbers

Number states consecutively as you create them. This avoids confusion.

### 4. Verify

Test a few strings (both accepting and rejecting) by tracing paths through the NFA.

---

## Why Thompson's Construction Powers Real Regex Engines

Many regex implementations use Thompson's construction (or a variant) internally:

1. **Compile** the regex to a Thompson NFA
2. **Simulate** the NFA on input (using subset construction on-the-fly or tracking active states)
3. This gives **$O(nm)$ time** where $n$ = input length, $m$ = regex length

This is much better than backtracking engines (used in Python, Java, JavaScript) which can take **exponential time** on pathological inputs.

**Tools using Thompson-style NFAs:**
- `grep` and `egrep` (original Unix implementation)
- `awk`
- RE2 (Google's regex library)
- Rust's `regex` crate

---

## Formal Theorem

**Theorem:** For every regular expression $R$, there exists an NFA $N$ such that $L(N) = L(R)$.

**Proof:** By structural induction on $R$.

- **Base cases:** We showed NFAs for $\emptyset$, $\varepsilon$, and $a \in \Sigma$.
- **Inductive step:** Assuming we have NFAs $N_1$ and $N_2$ for $R_1$ and $R_2$:
  - Union construction gives NFA for $R_1 \cup R_2$
  - Concatenation construction gives NFA for $R_1 R_2$
  - Star construction gives NFA for $R_1^*$

Each construction preserves the property that $L(N) = L(R)$, which can be proven by showing the accepted strings match in both directions. $\square$

---

## Exercises

### Exercise 1

Convert the regex $a(a \cup b)^*$ to an NFA using Thompson's construction.

**Solution:**

1. NFA for $a$: $(1) \xrightarrow{a} (2)$
2. NFA for inner $a$: $(3) \xrightarrow{a} (4)$
3. NFA for inner $b$: $(5) \xrightarrow{b} (6)$
4. NFA for $a \cup b$: new start (7), $\varepsilon$ to 3 and 5; from 4 and 6, $\varepsilon$ to new accept (8)
5. NFA for $(a \cup b)^*$: new start (9), $\varepsilon$ to 7 and to new accept (10); from 8, $\varepsilon$ to 7 and to 10
6. Concatenate: from 2, $\varepsilon$ to 9. Start: 1, Accept: 10.

Total: 10 states.

### Exercise 2

Convert $(0 \cup 1)^* 0$ to an NFA.

**Solution:**

1. NFA for $0$ (first): $(1) \xrightarrow{0} (2)$
2. NFA for $1$: $(3) \xrightarrow{1} (4)$
3. Union $0 \cup 1$: start (5), $\varepsilon$ to 1 and 3; from 2 and 4, $\varepsilon$ to accept (6)
4. Star $(0 \cup 1)^*$: start (7), $\varepsilon$ to 5 and accept (8); from 6, $\varepsilon$ to 5 and 8
5. NFA for $0$ (second): $(9) \xrightarrow{0} (10)$
6. Concatenate: from 8, $\varepsilon$ to 9. Start: 7, Accept: 10.

Total: 10 states.

### Exercise 3

Convert $(\varepsilon \cup a)b^*$ to an NFA.

**Solution:**

1. NFA for $\varepsilon$: $(1) \xrightarrow{\varepsilon} (2)$
2. NFA for $a$: $(3) \xrightarrow{a} (4)$
3. Union $\varepsilon \cup a$: start (5), $\varepsilon$ to 1 and 3; from 2 and 4, $\varepsilon$ to accept (6)
4. NFA for $b$: $(7) \xrightarrow{b} (8)$
5. Star $b^*$: start (9), $\varepsilon$ to 7 and accept (10); from 8, $\varepsilon$ to 7 and 10
6. Concatenate: from 6, $\varepsilon$ to 9. Start: 5, Accept: 10.

Total: 10 states.

### Exercise 4

How many states does Thompson's construction produce for the regex $(a \cup b \cup c)^*$?

**Solution:**

- $a$: 2 states
- $b$: 2 states
- $a \cup b$: 2 + 2 + 2 (new start and accept) = 6 states
- $c$: 2 states
- $(a \cup b) \cup c$: 6 + 2 + 2 = 10 states
- $((a \cup b) \cup c)^*$: 10 + 2 = 12 states

So 12 states total. The regex has 6 "units" (3 symbols + union + union + star), giving an upper bound of $2 \times 6 = 12$. We hit the bound exactly.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Thompson's construction | Recursive algorithm: regex → NFA |
| Base cases | $\emptyset$, $\varepsilon$, $a$ → 2-state NFAs |
| Union | New start with $\varepsilon$ branches to both sub-NFAs |
| Concatenation | Connect accept of first to start of second via $\varepsilon$ |
| Star | Loop: accept back to start, plus $\varepsilon$ bypass for zero matches |
| Size bound | At most $2|R|$ states |
| Key properties | One accept state, no incoming to start, no outgoing from accept |
| Real-world use | grep, RE2, rust regex crate |

Next, we'll look at the reverse direction: converting a DFA back to a regular expression using **state elimination**.
