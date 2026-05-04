---
title: PDA Design and Examples
---

# PDA Design and Examples

In this lesson, you will practice designing pushdown automata for various languages. We'll develop systematic strategies and trace computations step by step.

---

## Systematic PDA Design Strategies

Before diving into examples, here are key strategies for designing PDAs:

### Strategy 1: Push-Then-Pop

For languages like $\{a^n b^n\}$ where one part "matches" another:
- **Push** symbols during the first part
- **Pop** and match during the second part
- **Accept** when the stack returns to its initial state

### Strategy 2: Track Difference

For languages where you need to count the difference between two types of symbols:
- Push when one type exceeds the other
- Pop when the balance shifts back
- The stack height represents the absolute difference

### Strategy 3: Non-Deterministic Guessing

For languages where you don't know when to switch phases:
- Use $\varepsilon$-transitions to "guess" transition points
- The non-determinism handles all possibilities simultaneously

### Strategy 4: Multiple Phases

For complex languages, break the recognition into phases:
- Phase 1: Process first part of input
- Phase 2: Transition (possibly non-deterministic)
- Phase 3: Process second part
- Use states to track which phase you're in

---

## Example 1: $L = \{a^i b^j c^k \mid i = j + k\}$

### Analysis

We need the number of $a$'s to equal the sum of $b$'s and $c$'s. Input has the form: some $a$'s, then some $b$'s, then some $c$'s.

**Strategy:** Push all $a$'s, then pop one for each $b$, then pop one for each $c$.

### PDA Design

$P = (\{q_0, q_1, q_2, q_3\}, \{a, b, c\}, \{A, Z_0\}, \delta, q_0, Z_0, \{q_3\})$

States:
- $q_0$: reading $a$'s (pushing phase)
- $q_1$: reading $b$'s (first popping phase)
- $q_2$: reading $c$'s (second popping phase)
- $q_3$: accept state

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | Push first $a$ |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | Push more $a$'s |
| $q_0$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | Switch to $b$'s, pop |
| $q_0$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Skip $b$'s, go to $c$'s |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_3$ | $Z_0$ | Accept $\varepsilon$ (0 = 0 + 0) |
| $q_1$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | Pop for each $b$ |
| $q_1$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Switch to $c$'s, pop |
| $q_1$ | $\varepsilon$ | $Z_0$ | $q_3$ | $Z_0$ | No $c$'s, accept |
| $q_2$ | $c$ | $A$ | $q_2$ | $\varepsilon$ | Pop for each $c$ |
| $q_2$ | $\varepsilon$ | $Z_0$ | $q_3$ | $Z_0$ | Done, accept |

### Trace on Input $aaabbc$ ($i=3, j=2, k=1$, so $3 = 2+1$ ✓)

$$(q_0,\; aaabbc,\; Z_0)$$
$$\vdash (q_0,\; aabbc,\; AZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; abbc,\; AAZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; bbc,\; AAAZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_1,\; bc,\; AAZ_0) \quad \text{[read } b\text{, pop } A \text{]}$$
$$\vdash (q_1,\; c,\; AZ_0) \quad \text{[read } b\text{, pop } A \text{]}$$
$$\vdash (q_2,\; \varepsilon,\; Z_0) \quad \text{[read } c\text{, pop } A \text{]}$$
$$\vdash (q_3,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

**Accepted!** ✓ The stack had 3 $A$'s, and we popped 2 for $b$'s and 1 for $c$.

---

## Example 2: $L = \{w \in \{a,b\}^* \mid \#_a(w) = \#_b(w)\}$

### Analysis

This language contains all strings over $\{a, b\}$ with equal numbers of $a$'s and $b$'s. The symbols can appear in **any order** — this is NOT the same as $a^n b^n$!

Valid strings: $\varepsilon$, $ab$, $ba$, $aabb$, $abba$, $baba$, $abab$, ...

**Strategy:** Use the stack to track the "excess" of one symbol over the other.
- If we've seen more $a$'s than $b$'s, stack contains $A$'s (representing the excess)
- If we've seen more $b$'s than $a$'s, stack contains $B$'s (representing the excess)
- Accept when stack is empty (equal counts)

### PDA Design

$P = (\{q_0, q_f\}, \{a, b\}, \{A, B, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | First $a$, excess = 1 |
| $q_0$ | $b$ | $Z_0$ | $q_0$ | $BZ_0$ | First $b$, excess = 1 |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | More $a$ excess |
| $q_0$ | $b$ | $B$ | $q_0$ | $BB$ | More $b$ excess |
| $q_0$ | $a$ | $B$ | $q_0$ | $\varepsilon$ | $a$ cancels one $b$ excess |
| $q_0$ | $b$ | $A$ | $q_0$ | $\varepsilon$ | $b$ cancels one $a$ excess |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Balanced! Accept |

### Trace on Input $abba$

$$(q_0,\; abba,\; Z_0)$$
$$\vdash (q_0,\; bba,\; AZ_0) \quad \text{[read } a\text{, push } A \text{]}$$
$$\vdash (q_0,\; ba,\; Z_0) \quad \text{[read } b\text{, pop } A \text{ — cancels]}$$
$$\vdash (q_0,\; a,\; BZ_0) \quad \text{[read } b\text{, push } B \text{]}$$
$$\vdash (q_0,\; \varepsilon,\; Z_0) \quad \text{[read } a\text{, pop } B \text{ — cancels]}$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

**Accepted!** ✓ (2 $a$'s and 2 $b$'s)

### Trace on Input $aab$ (Should Reject)

$$(q_0,\; aab,\; Z_0)$$
$$\vdash (q_0,\; ab,\; AZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; b,\; AAZ_0) \quad \text{[push } A \text{]}$$
$$\vdash (q_0,\; \varepsilon,\; AZ_0) \quad \text{[pop one } A \text{]}$$

Input consumed, but stack top is $A$ (not $Z_0$), so we can't reach $q_f$. **Rejected!** ✗

---

## Example 3: $L = \{a^i b^j \mid i \leq j \leq 2i\}$

### Analysis

We need: for every $a$, there are between 1 and 2 $b$'s. So each $a$ "accounts for" 1 or 2 $b$'s.

**Strategy:** For each $a$, non-deterministically push either 1 or 2 markers. Then pop one marker for each $b$.

### PDA Design

$P = (\{q_0, q_1, q_2\}, \{a, b\}, \{A, Z_0\}, \delta, q_0, Z_0, \{q_2\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | Push 1 for $a$ (guess: 1 $b$ will match) |
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AAZ_0$ | Push 2 for $a$ (guess: 2 $b$'s will match) |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | Push 1 more |
| $q_0$ | $a$ | $A$ | $q_0$ | $AAA$ | Push 2 more |
| $q_0$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | Switch to $b$'s |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_2$ | $Z_0$ | Accept $\varepsilon$ |
| $q_1$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | Pop for each $b$ |
| $q_1$ | $\varepsilon$ | $Z_0$ | $q_2$ | $Z_0$ | All matched, accept |

### Non-Determinism Explanation

For input $a^3 b^4$, we need to verify $3 \leq 4 \leq 6$. The PDA might push:
- $a_1$: push 2 (accounting for 2 $b$'s)
- $a_2$: push 1 (accounting for 1 $b$)
- $a_3$: push 1 (accounting for 1 $b$)
- Total pushed: 4, which matches the 4 $b$'s ✓

The non-determinism "guesses" the right distribution.

---

## Example 4: Balanced Parentheses with Multiple Types

### Language

$L = \{w \in \{(, ), [, ]\}^* \mid w \text{ is properly nested}\}$

Valid: `()`, `[]`, `([])`, `()[]`, `[([])]`
Invalid: `(]`, `([)]`, `(()`

### PDA Design

$P = (\{q_0, q_f\}, \{(, ), [, ]\}, \{L, R, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

where $L$ = left paren marker, $R$ = left bracket marker.

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $($ | $Z_0$ | $q_0$ | $LZ_0$ | Push for $( $ |
| $q_0$ | $($ | $L$ | $q_0$ | $LL$ | Push for $( $ |
| $q_0$ | $($ | $R$ | $q_0$ | $LR$ | Push for $( $ |
| $q_0$ | $[$ | $Z_0$ | $q_0$ | $RZ_0$ | Push for $[$ |
| $q_0$ | $[$ | $L$ | $q_0$ | $RL$ | Push for $[$ |
| $q_0$ | $[$ | $R$ | $q_0$ | $RR$ | Push for $[$ |
| $q_0$ | $)$ | $L$ | $q_0$ | $\varepsilon$ | Match $)$ with $($ |
| $q_0$ | $]$ | $R$ | $q_0$ | $\varepsilon$ | Match $]$ with $[$ |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | All matched, accept |

### Key Point: Mismatches Cause Rejection

If we see $)$ but the stack top is $R$ (bracket), there's no transition → **dead end → reject**.
If we see $]$ but the stack top is $L$ (paren), there's no transition → **dead end → reject**.

### Trace on Input $([])$

$$(q_0,\; ([]),\; Z_0)$$
$$\vdash (q_0,\; []),\; LZ_0) \quad \text{[push } L \text{ for }(\text{]}$$
$$\vdash (q_0,\; ]),\; RLZ_0) \quad \text{[push } R \text{ for }[\text{]}$$
$$\vdash (q_0,\; ),\; LZ_0) \quad \text{[pop } R \text{, match }]\text{]}$$
$$\vdash (q_0,\; \varepsilon,\; Z_0) \quad \text{[pop } L \text{, match })\text{]}$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

---

## Example 5: No Prefix Has More $b$'s Than $a$'s

### Language

$$L = \{w \in \{a, b\}^* \mid \text{for every prefix } u \text{ of } w, \#_a(u) \geq \#_b(u)\}$$

This is like "valid sequences of pushes and pops" or "Dyck paths that never go below zero."

### Analysis

At every point during reading, we must have seen at least as many $a$'s as $b$'s. The stack tracks the excess of $a$'s over $b$'s, and we reject (get stuck) if we try to pop when there's no excess.

### PDA Design

$P = (\{q_0, q_f\}, \{a, b\}, \{A, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | $a$ increases excess |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | $a$ increases excess |
| $q_0$ | $b$ | $A$ | $q_0$ | $\varepsilon$ | $b$ decreases excess (OK) |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Accept (at zero or end) |
| $q_0$ | $\varepsilon$ | $A$ | $q_f$ | $A$ | Accept (excess $a$'s OK) |

### Why $b$ with $Z_0$ Rejects

There is **no transition** for $(q_0, b, Z_0)$. If we're in state $q_0$ reading $b$ and the stack only has $Z_0$, the PDA gets stuck. This means a prefix has more $b$'s than $a$'s → reject!

### Trace on Input $aabba$ (Valid: prefixes have counts $1,2,2,2,3$ vs $0,0,1,2,2$)

$$(q_0,\; aabba,\; Z_0)$$
$$\vdash (q_0,\; abba,\; AZ_0) \quad \text{[excess = 1]}$$
$$\vdash (q_0,\; bba,\; AAZ_0) \quad \text{[excess = 2]}$$
$$\vdash (q_0,\; ba,\; AZ_0) \quad \text{[excess = 1]}$$
$$\vdash (q_0,\; a,\; Z_0) \quad \text{[excess = 0]}$$
$$\vdash (q_0,\; \varepsilon,\; AZ_0) \quad \text{[excess = 1]}$$
$$\vdash (q_f,\; \varepsilon,\; AZ_0) \quad \text{[accept!]}$$

### Trace on Input $abb$ (Invalid: after "ab", excess = 0, then $b$ fails)

$$(q_0,\; abb,\; Z_0)$$
$$\vdash (q_0,\; bb,\; AZ_0) \quad \text{[excess = 1]}$$
$$\vdash (q_0,\; b,\; Z_0) \quad \text{[excess = 0]}$$
$$\text{STUCK! No transition for } (q_0, b, Z_0) \quad \text{[reject!]}$$

---

## Example 6: PDA for a CFG

### Given Grammar

$$S \to aSb \mid aSbb \mid \varepsilon$$

This generates $L = \{a^n b^m \mid n \leq m \leq 2n\}$ (same as Example 3!).

### CFG-to-PDA Construction (Top-Down Parsing)

Using the standard construction:
- Single working state $q$
- Push $S$ initially
- If top is a variable, non-deterministically replace with a rule's RHS
- If top is a terminal, match with input

**PDA:** $P = (\{q_0, q, q_f\}, \{a, b\}, \{S, a, b, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $\varepsilon$ | $Z_0$ | $q$ | $SZ_0$ | Initialize: push $S$ |
| $q$ | $\varepsilon$ | $S$ | $q$ | $aSb$ | Apply $S \to aSb$ |
| $q$ | $\varepsilon$ | $S$ | $q$ | $aSbb$ | Apply $S \to aSbb$ |
| $q$ | $\varepsilon$ | $S$ | $q$ | $\varepsilon$ | Apply $S \to \varepsilon$ |
| $q$ | $a$ | $a$ | $q$ | $\varepsilon$ | Match terminal $a$ |
| $q$ | $b$ | $b$ | $q$ | $\varepsilon$ | Match terminal $b$ |
| $q$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Stack empty, accept |

### Trace on Input $aabbb$ (Using $S \to aSbb$ then $S \to aSb$)

$$(q_0,\; aabbb,\; Z_0)$$
$$\vdash (q,\; aabbb,\; SZ_0) \quad \text{[push } S \text{]}$$
$$\vdash (q,\; aabbb,\; aSbbZ_0) \quad \text{[apply } S \to aSbb \text{]}$$
$$\vdash (q,\; abbb,\; SbbZ_0) \quad \text{[match } a \text{]}$$
$$\vdash (q,\; abbb,\; aSbbbZ_0) \quad \text{[apply } S \to aSb \text{]}$$
$$\vdash (q,\; bbb,\; SbbbZ_0) \quad \text{[match } a \text{]}$$
$$\vdash (q,\; bbb,\; bbbZ_0) \quad \text{[apply } S \to \varepsilon \text{]}$$
$$\vdash (q,\; bb,\; bbZ_0) \quad \text{[match } b \text{]}$$
$$\vdash (q,\; b,\; bZ_0) \quad \text{[match } b \text{]}$$
$$\vdash (q,\; \varepsilon,\; Z_0) \quad \text{[match } b \text{]}$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

---

## Common Mistakes in PDA Design

### Mistake 1: Forgetting $\varepsilon$-Transitions for Acceptance

Many beginners forget that after consuming all input, the PDA still needs to check the stack and transition to an accept state. Always include:

$$\delta(q, \varepsilon, Z_0) = \{(q_f, Z_0)\}$$

or similar acceptance transitions.

### Mistake 2: Not Handling the Empty String

If $\varepsilon \in L$, you need a direct path from start to accept without reading anything:

$$\delta(q_0, \varepsilon, Z_0) = \{(q_f, Z_0)\}$$

### Mistake 3: Incorrect Stack Operations

Remember: you must ALWAYS pop the stack top before pushing. If you want to "peek" without changing the stack, pop $X$ and push $X$ back:

$$\delta(q, a, X) = \{(p, X)\} \quad \text{(pop } X \text{, push } X \text{ back)}$$

### Mistake 4: Trying to Read Below the Stack

A PDA can only see the **top** of the stack. You cannot look at or access elements below the top. If you need information about deeper elements, you must pop down to them.

### Mistake 5: Making a DPDA When NPDA is Needed

Some languages (like palindromes) inherently require non-determinism. If your language needs "guessing" (e.g., where the middle is), embrace non-determinism — don't try to force a deterministic solution.

---

## Design Checklist

When designing a PDA, verify:

- [ ] Does it accept all strings in the language?
- [ ] Does it reject all strings NOT in the language?
- [ ] Is the empty string handled correctly?
- [ ] Are all transitions defined for the symbols you expect?
- [ ] Does acceptance work (final state reached / stack emptied)?
- [ ] Are there dead ends for invalid inputs (no transitions = reject)?

---

## Comparing PDA Design Approaches

| Approach | When to Use | Advantage | Disadvantage |
|----------|-------------|-----------|--------------|
| Direct design | Simple languages | Intuitive, efficient | Hard for complex languages |
| From CFG | When grammar is known | Mechanical, always works | Large PDA, many $\varepsilon$-moves |
| Composition | Combining simpler PDAs | Modular | May need more states |

### Direct Design Tips

1. **Identify the "matching" structure**: What needs to be remembered?
2. **Choose stack encoding**: What does each stack symbol represent?
3. **Determine phases**: When does the PDA switch from pushing to popping?
4. **Handle boundaries**: Empty input, single character, transitions between phases

### From CFG (Top-Down Simulation)

Given any CFG $G = (V, \Sigma, R, S)$:
1. Single working state $q$
2. Push start symbol
3. If top is variable $A$: non-deterministically expand using rules
4. If top is terminal $a$: match with input
5. Accept when stack is empty

This always works but produces PDAs with many states and transitions.

---

## Additional Example: $L = \{a^m b^n \mid m \geq 2n\}$

### Analysis

We need at least twice as many $a$'s as $b$'s. Strategy: for each $a$, push half a marker. Or equivalently: push one marker for every two $a$'s, then pop one for each $b$.

Alternative approach: push ONE marker for each $a$, then pop TWO markers for each $b$.

### PDA Design

$P = (\{q_0, q_1, q_2, q_f\}, \{a, b\}, \{A, Z_0\}, \delta, q_0, Z_0, \{q_f\})$

### Transitions

| State | Input | Stack Top | Next State | Push | Comment |
|-------|-------|-----------|------------|------|---------|
| $q_0$ | $a$ | $Z_0$ | $q_0$ | $AZ_0$ | Push for each $a$ |
| $q_0$ | $a$ | $A$ | $q_0$ | $AA$ | Push for each $a$ |
| $q_0$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | First pop for $b$ |
| $q_0$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | No $b$'s, accept (0 ≥ 0) |
| $q_0$ | $\varepsilon$ | $A$ | $q_f$ | $A$ | No $b$'s, excess $a$'s OK |
| $q_1$ | $\varepsilon$ | $A$ | $q_2$ | $\varepsilon$ | Second pop for same $b$ |
| $q_2$ | $b$ | $A$ | $q_1$ | $\varepsilon$ | First pop for next $b$ |
| $q_2$ | $\varepsilon$ | $Z_0$ | $q_f$ | $Z_0$ | Done, accept |
| $q_2$ | $\varepsilon$ | $A$ | $q_f$ | $A$ | Excess $a$'s OK |

### Trace on Input $aaaabb$ ($m=4, n=2$, need $4 \geq 2 \times 2 = 4$ ✓)

$$(q_0,\; aaaabb,\; Z_0)$$
$$\vdash (q_0,\; aaabb,\; AZ_0) \quad \text{[push]}$$
$$\vdash (q_0,\; aabb,\; AAZ_0) \quad \text{[push]}$$
$$\vdash (q_0,\; abb,\; AAAZ_0) \quad \text{[push]}$$
$$\vdash (q_0,\; bb,\; AAAAZ_0) \quad \text{[push]}$$
$$\vdash (q_1,\; b,\; AAAZ_0) \quad \text{[1st pop for 1st } b \text{]}$$
$$\vdash (q_2,\; b,\; AAZ_0) \quad \text{[2nd pop for 1st } b \text{]}$$
$$\vdash (q_1,\; \varepsilon,\; AZ_0) \quad \text{[1st pop for 2nd } b \text{]}$$
$$\vdash (q_2,\; \varepsilon,\; Z_0) \quad \text{[2nd pop for 2nd } b \text{]}$$
$$\vdash (q_f,\; \varepsilon,\; Z_0) \quad \text{[accept!]}$$

---

## Exercises

### Exercise 1

Design a PDA for $L = \{a^i b^j c^k \mid i + k = j\}$.

**Hint:** Push for $a$'s, pop for first batch of $b$'s (matching $a$'s), then push for remaining $b$'s, pop for $c$'s.

### Exercise 2

Design a PDA for $L = \{a^m b^n \mid m \neq n\}$.

**Hint:** This is the complement of $\{a^n b^n\}$ intersected with $a^* b^*$. Use non-determinism to guess whether $m > n$ or $m < n$.

### Exercise 3

Design a PDA for the language of all strings over $\{a, b\}$ that are NOT palindromes.

**Hint:** Non-deterministically guess a position where $w$ differs from $w^R$.

### Exercise 4

Design a PDA for $L = \{a^i b^j c^k \mid i = j \text{ or } j = k\}$.

**Hint:** Non-deterministically choose which condition to verify.

### Exercise 5

Trace the computation of the PDA from Example 2 (equal $a$'s and $b$'s) on the input $baaabb$. Show all configurations.

### Exercise 6

Design a PDA for $L = \{a^i b^j c^k \mid i, j, k \geq 0 \text{ and } i + j = k\}$.

### Exercise 7

Design a PDA for $L = \{w \in \{a,b\}^* \mid \#_a(w) = 2 \cdot \#_b(w)\}$ (twice as many $a$'s as $b$'s).

---

## Summary

In this lesson, you learned:

- **Systematic strategies**: push-then-pop, tracking differences, non-deterministic guessing, multi-phase processing
- **Seven complete PDA examples** with formal definitions and traces
- **Common mistakes** and how to avoid them
- **CFG-to-PDA conversion** applied to a concrete example
- The power of **non-determinism** in PDA design

The key insight is that PDAs use the stack creatively: counting, matching, and comparing parts of the input by pushing markers and popping them at the right times.

---

## Quick Reference: PDA Design Patterns

| Language Pattern | Stack Strategy | States Needed |
|-----------------|----------------|---------------|
| $a^n b^n$ | Push $a$'s, pop for $b$'s | 3 (push, pop, accept) |
| $a^n b^{2n}$ | Push $a$'s, pop 2 per $b$ (or push 2 per $a$) | 3-4 |
| Equal symbols (any order) | Track excess: push/cancel | 2-3 |
| $ww^R$ (palindromes) | Push first half, pop second | 3 + non-determinism |
| Nested matching ($a^n b^m c^n$) | Push, pass-through, pop | 4 |
| $i \leq j \leq 2i$ | Non-deterministic push count | 3 + non-determinism |
| No prefix violation | Push for excess, dead-end on violation | 2-3 |

---

## Key Formulas

| Concept | Formal Notation |
|---------|----------------|
| PDA transition | $\delta(q, a, X) \ni (p, \gamma)$ |
| Push $Y$ on top | Pop $X$, push $YX$: $\delta(q, a, X) = \{(p, YX)\}$ |
| Just pop | $\delta(q, a, X) = \{(p, \varepsilon)\}$ |
| Leave stack unchanged | Pop $X$, push $X$ back: $\delta(q, a, X) = \{(p, X)\}$ |
| Non-deterministic guess | $\delta(q, \varepsilon, X) \ni (p, X)$ alongside other transitions |

---

*Next lesson: We prove the fundamental equivalence between PDAs and context-free grammars!*
