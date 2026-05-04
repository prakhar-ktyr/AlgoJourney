---
title: Greibach Normal Form
---

# Greibach Normal Form (GNF)

In this lesson, you will learn about **Greibach Normal Form**, a special restricted form for context-free grammars that makes parsing predictable and elegant.

---

## What is Greibach Normal Form?

A context-free grammar $G = (V, \Sigma, R, S)$ is in **Greibach Normal Form (GNF)** if every production rule has the form:

$$A \to a\alpha$$

where:
- $A \in V$ is a variable (non-terminal)
- $a \in \Sigma$ is a terminal symbol
- $\alpha \in V^*$ is a (possibly empty) string of variables

In other words, every rule starts with **exactly one terminal**, followed by **zero or more variables**.

---

## GNF Rules — What's Allowed

| Rule Form | Allowed in GNF? | Example |
|-----------|-----------------|---------|
| $A \to aBC$ | Yes | Terminal first, then variables |
| $A \to a$ | Yes | Terminal only (special case where $\alpha = \varepsilon$) |
| $A \to aB$ | Yes | Terminal + one variable |
| $A \to AB$ | No | Starts with a variable |
| $A \to ab$ | No | Second symbol is a terminal |
| $S \to \varepsilon$ | Only if $S$ doesn't appear on RHS | Special case for empty string |

---

## Why GNF Matters

### Predictable Parsing Length

If a grammar is in GNF, then for any string $w$ with $|w| = n$:

$$\text{Exactly } n \text{ derivation steps are needed}$$

**Why?** Each step applies a rule $A \to a\alpha$, which introduces exactly **one terminal**. To produce $n$ terminals, you need exactly $n$ steps.

This is extremely useful because:
- No rule can "waste" a step without producing output
- The derivation length is bounded and predictable
- Parsing algorithms become simpler

### Connection to Pushdown Automata

GNF grammars directly correspond to pushdown automata transitions. Each rule $A \to a B_1 B_2 \ldots B_k$ translates to:

$$\delta(q, a, A) \ni (q, B_1 B_2 \ldots B_k)$$

This makes PDA construction from a CFG mechanical and straightforward.

---

## Prerequisites: The Grammar Must Be in CNF

Before converting to GNF, we assume the grammar is already in **Chomsky Normal Form (CNF)**. Recall that in CNF, every rule is either:

- $A \to BC$ (two variables), or
- $A \to a$ (single terminal)

If your grammar isn't in CNF yet, convert it first using the techniques from the CNF lesson.

---

## Conversion Algorithm: CNF to GNF

The conversion from CNF to GNF proceeds in several stages:

### Step 1: Order the Variables

Assign a numerical order to all variables:

$$A_1, A_2, A_3, \ldots, A_k$$

where $A_1 = S$ (the start symbol).

### Step 2: Ensure Increasing Order

We want every rule $A_i \to A_j \gamma$ to satisfy $j > i$ (the first symbol on the RHS has a higher index than the LHS variable).

Process variables from $A_1$ to $A_k$ in order. For each $A_i$:
- For each rule $A_i \to A_j \gamma$ where $j < i$:
  - **Substitute**: Replace $A_j$ with all its productions
  - Repeat until all rules for $A_i$ start with $A_j$ where $j \geq i$

### Step 3: Eliminate Left Recursion

After Step 2, some variables $A_i$ may have rules of the form:

$$A_i \to A_i \alpha_1 \mid A_i \alpha_2 \mid \ldots \mid A_i \alpha_m \mid \beta_1 \mid \beta_2 \mid \ldots \mid \beta_p$$

where each $\beta_j$ does NOT start with $A_i$.

**Left recursion elimination**: Introduce a new variable $B_i$ and replace with:

$$A_i \to \beta_1 \mid \beta_2 \mid \ldots \mid \beta_p \mid \beta_1 B_i \mid \beta_2 B_i \mid \ldots \mid \beta_p B_i$$

$$B_i \to \alpha_1 \mid \alpha_2 \mid \ldots \mid \alpha_m \mid \alpha_1 B_i \mid \alpha_2 B_i \mid \ldots \mid \alpha_m B_i$$

### Step 4: Back-Substitute to Get Terminal-First

After eliminating left recursion:
- $A_k$ (the last variable) will have rules starting with terminals (from CNF's $A \to a$ rules)
- Substitute backwards: $A_{k-1}, A_{k-2}, \ldots, A_1$
- Replace leading variables with their productions until every rule starts with a terminal

### Step 5: Fix the $B_i$ Variables

The new $B_i$ variables introduced for left recursion may not start with terminals. Substitute their leading symbols using the now-completed $A_i$ rules.

---

## Complete Worked Example

### Starting Grammar (in CNF)

Let $G$ have variables $A_1 = S$, $A_2 = A$, $A_3 = B$ with rules:

$$S \to AB$$
$$A \to BS \mid a$$
$$B \to SA \mid b$$

### Step 1: Order Variables

$A_1 = S$, $A_2 = A$, $A_3 = B$

### Step 2: Fix Ordering

**Process $A_1 = S$:**
Rule $S \to AB$: first symbol is $A = A_2$, and $2 > 1$. ✓ No change needed.

**Process $A_2 = A$:**
Rule $A \to BS$: first symbol is $B = A_3$, and $3 > 2$. ✓
Rule $A \to a$: starts with terminal. ✓

**Process $A_3 = B$:**
Rule $B \to SA$: first symbol is $S = A_1$, and $1 < 3$. ✗ Must substitute!

Substitute $S \to AB$ into $B \to SA$:

$$B \to ABA$$

Now $B \to ABA$: first symbol is $A = A_2$, and $2 < 3$. ✗ Substitute again!

Substitute $A \to BS \mid a$ into $B \to ABA$:

$$B \to BSBA \mid aBA$$

Also keep $B \to b$.

So $B$'s rules are now: $B \to BSBA \mid aBA \mid b$

### Step 3: Eliminate Left Recursion for $B$

$B$ has left recursion: $B \to BSBA$

Identify:
- Left-recursive: $\alpha_1 = SBA$
- Non-left-recursive: $\beta_1 = aBA$, $\beta_2 = b$

Introduce $B'$:

$$B \to aBA \mid b \mid aBAB' \mid bB'$$

$$B' \to SBA \mid SBAB'$$

### Step 4: Back-Substitute

Now $B$'s rules start with terminals $a$ or $b$. ✓

**Fix $A$:**
$A \to BS \mid a$

Substitute $B$'s rules into $A \to BS$:

$$A \to aBAS \mid bS \mid aBAB'S \mid bB'S \mid a$$

All start with terminals! ✓

**Fix $S$:**
$S \to AB$

Substitute $A$'s rules into $S \to AB$:

$$S \to aBASB \mid bSB \mid aBAB'SB \mid bB'SB \mid aB$$

All start with terminals! ✓

### Step 5: Fix $B'$

$B' \to SBA \mid SBAB'$

Substitute $S$'s rules:

$$B' \to aBASBBA \mid bSBBA \mid aBAB'SBBA \mid bB'SBBA \mid aBBA$$
$$\quad\mid\; aBASBBAB' \mid bSBBAB' \mid aBAB'SBBA B' \mid bB'SBBAB' \mid aBBAB'$$

All start with terminals! ✓

### Final GNF Grammar

Every rule now starts with a terminal followed by zero or more variables. The grammar is in GNF!

---

## The Left Recursion Elimination Technique

This technique is so important it deserves a focused explanation.

### The Problem

A rule like $A \to A\alpha$ causes **infinite loops** in top-down parsing:

$$A \Rightarrow A\alpha \Rightarrow A\alpha\alpha \Rightarrow A\alpha\alpha\alpha \Rightarrow \ldots$$

### The Solution

Given:
$$A \to A\alpha_1 \mid A\alpha_2 \mid \ldots \mid A\alpha_m \mid \beta_1 \mid \beta_2 \mid \ldots \mid \beta_p$$

Transform to:
$$A \to \beta_j \mid \beta_j B \quad \text{(for each } j\text{)}$$
$$B \to \alpha_i \mid \alpha_i B \quad \text{(for each } i\text{)}$$

### Why It Works

Original generates: $\beta_j \alpha_{i_1} \alpha_{i_2} \ldots \alpha_{i_n}$ for any sequence of $\alpha$'s.

New grammar generates the same:
- $A \Rightarrow \beta_j B \Rightarrow \beta_j \alpha_{i_1} B \Rightarrow \ldots \Rightarrow \beta_j \alpha_{i_1} \ldots \alpha_{i_n}$

The languages are identical, but **left recursion is eliminated**.

---

## Simple Example: Converting a Small Grammar

### Given Grammar (already in CNF)

$$S \to AA \mid a$$
$$A \to SA \mid b$$

### Order Variables

$A_1 = S$, $A_2 = A$

### Process $A_2 = A$

Rule $A \to SA$: first symbol is $S = A_1$ with $1 < 2$. Substitute $S$:

$$A \to AAA \mid aA \mid b$$

Now $A$ has left recursion: $A \to AAA$.

Eliminate:
- Left-recursive: $\alpha = AA$
- Non-left-recursive: $\beta_1 = aA$, $\beta_2 = b$

$$A \to aA \mid b \mid aAB \mid bB$$
$$B \to AA \mid AAB$$

### Back-Substitute for $S$

$S \to AA \mid a$

Substitute $A$'s rules into $S \to AA$:

$$S \to aAA \mid bA \mid aABA \mid bBA \mid a$$

All start with terminals! ✓

### Fix $B$

$B \to AA \mid AAB$

Substitute $A$:

$$B \to aAA \mid bA \mid aABA \mid bBA \mid aAAB \mid bAB \mid aABAB \mid bBAB$$

Done! All in GNF! ✓

---

## Properties of GNF

| Property | Description |
|----------|-------------|
| Derivation length | Exactly $|w|$ steps for string $w$ |
| No left recursion | GNF grammars are never left-recursive |
| No $\varepsilon$-rules | Except possibly $S \to \varepsilon$ |
| No unit rules | $A \to B$ is impossible (RHS must start with terminal) |
| PDA construction | Direct and mechanical |

---

## Applications of GNF

### 1. PDA Construction

Given GNF rule $A \to a B_1 B_2 \ldots B_k$, create PDA transition:

$$\delta(q, a, A) \ni (q, B_1 B_2 \ldots B_k)$$

The resulting PDA:
- Has a single state $q$ (plus possibly start/accept states)
- Reads one input symbol per step
- Simulates the grammar by managing the stack

### 2. Parsing Complexity

Since derivations have exactly $|w|$ steps, parsing in GNF has:

$$O(n) \text{ steps per derivation path}$$

Though the non-determinism means worst case is still exponential without additional techniques, GNF makes parsing more structured.

### 3. Proving Theorems

GNF is useful for proving that every CFL (without $\varepsilon$) can be recognized by a PDA with a single state. This simplifies many theoretical arguments.

---

## GNF vs CNF Comparison

| Feature | CNF | GNF |
|---------|-----|-----|
| Rule form | $A \to BC$ or $A \to a$ | $A \to a\alpha$ where $\alpha \in V^*$ |
| Derivation length for $|w| = n$ | $2n - 1$ | $n$ |
| Best for | CYK algorithm | PDA construction |
| Left recursion | May have | Never has |
| Conversion complexity | Moderate | More involved |

---

## Common Mistakes

### Mistake 1: Forgetting to Handle All Variables

When back-substituting, you must process **every** variable, not just the ones with obvious issues.

### Mistake 2: Incomplete Left Recursion Elimination

If $A$ has both direct ($A \to A\alpha$) and indirect ($A \to B\alpha$, $B \to A\beta$) left recursion, you must handle both. The ordering technique resolves indirect recursion through substitution.

### Mistake 3: Leaving Terminals in Non-First Positions

In GNF, only the **first** symbol can be a terminal. If you have $A \to aBb$, this is NOT in GNF because $b$ is a terminal in a non-first position. In CNF→GNF conversion, this doesn't arise because CNF rules only have variables in two-symbol rules.

---

## Detailed Algorithm Summary

Let's write the full conversion algorithm as a clear step-by-step procedure:

**Input:** A context-free grammar $G$ in Chomsky Normal Form.

**Output:** An equivalent grammar $G'$ in Greibach Normal Form.

**Algorithm:**

1. **Number the variables.** Let $V = \{A_1, A_2, \ldots, A_k\}$ where $A_1 = S$.

2. **For $i = 1$ to $k$:** (Ensure ordering property)
   - **For $j = 1$ to $i - 1$:**
     - For every rule $A_i \to A_j \gamma$:
       - Remove this rule
       - For every rule $A_j \to \beta$:
         - Add rule $A_i \to \beta \gamma$
   - **Eliminate left recursion for $A_i$:**
     - Collect all rules $A_i \to A_i \alpha_1 \mid \ldots \mid A_i \alpha_m$ (left-recursive)
     - Collect all rules $A_i \to \beta_1 \mid \ldots \mid \beta_p$ (non-left-recursive)
     - Introduce new variable $B_i$
     - Replace with: $A_i \to \beta_j \mid \beta_j B_i$ for all $j$
     - Add: $B_i \to \alpha_l \mid \alpha_l B_i$ for all $l$

3. **Back-substitute** (from $A_k$ down to $A_1$):
   - For $i = k-1$ down to $1$:
     - For every rule $A_i \to A_j \gamma$ where $j > i$:
       - Substitute $A_j$'s rules to make $A_i$'s rules start with terminals

4. **Fix $B_i$ variables:**
   - For each $B_i$: substitute the leading variable using the now-terminal-first rules of the $A_j$'s

5. **Result:** All rules now have the form $A \to a\alpha$. The grammar is in GNF.

---

## Complexity of the Conversion

The GNF conversion can significantly increase the size of the grammar:

| Measure | CNF | After GNF Conversion |
|---------|-----|---------------------|
| Variables | $k$ | Up to $2k$ (original + $B_i$'s) |
| Rules | $r$ | Up to $O(r \cdot k^2)$ |
| Total size | $O(r)$ | Potentially $O(r \cdot k^2)$ |

This blowup is polynomial, so the conversion is always feasible. However, for practical parsing, we often use other normal forms or techniques.

---

## GNF and LL Parsing

Grammars in GNF have a natural connection to **LL(1) parsing** (Left-to-right, Leftmost derivation, 1 lookahead):

- Each rule starts with a terminal, so the parser can use the current input symbol to choose which rule to apply
- However, GNF alone doesn't guarantee LL(1) — multiple rules for the same variable might start with the same terminal
- When a GNF grammar IS LL(1), parsing is extremely efficient: $O(n)$ time

---

## Exercises

### Exercise 1

Convert the following CNF grammar to GNF:

$$S \to AB$$
$$A \to BS \mid a$$
$$B \to AB \mid b$$

### Exercise 2

Given the grammar:

$$S \to AA$$
$$A \to SA \mid a \mid b$$

Convert to GNF. How many derivation steps are needed to generate the string $aabba$?

### Exercise 3

Explain why the following grammar is NOT in GNF, and convert it:

$$S \to aA \mid bB$$
$$A \to Sb \mid a$$
$$B \to Ba \mid b$$

### Exercise 4

Prove that for any GNF grammar, a string of length $n$ requires exactly $n$ derivation steps.

**Hint:** Show by induction that after $k$ steps, exactly $k$ terminals have been produced.

### Exercise 5

Given a GNF grammar with rules:

$$S \to aAB \mid bB$$
$$A \to aA \mid a$$
$$B \to bB \mid b$$

1. What language does this grammar generate?
2. Construct a PDA that recognizes this language.
3. Trace the PDA on input $aabb$.

### Exercise 6

Starting from the CNF grammar:

$$S \to AB \mid BC$$
$$A \to BA \mid a$$
$$B \to CC \mid b$$
$$C \to AB \mid a$$

Order the variables as $A_1 = S, A_2 = A, A_3 = B, A_4 = C$. Perform the first phase of the algorithm (ensuring the ordering property) for $A_2$ and $A_3$. Show all intermediate steps.

### Exercise 7

Consider a grammar in GNF with 3 variables and 5 rules. What is the maximum length of a derivation tree for a string of length 10? What about the minimum? Explain your reasoning.

---

## Summary

In this lesson, you learned:

- **GNF definition**: every rule has the form $A \to a\alpha$ with $a \in \Sigma$ and $\alpha \in V^*$
- **Key property**: exactly $n$ derivation steps for a string of length $n$
- **Conversion algorithm**: order variables → substitute to fix ordering → eliminate left recursion → back-substitute
- **Left recursion elimination**: $A \to A\alpha \mid \beta$ becomes $A \to \beta \mid \beta B$ and $B \to \alpha \mid \alpha B$
- **Applications**: PDA construction, parsing, theoretical proofs

GNF is a powerful normal form that bridges grammars and automata, making the connection between CFGs and PDAs explicit and constructive.

---

## Key Takeaways

| Concept | Formula/Rule |
|---------|-------------|
| GNF rule form | $A \to a\alpha$, $a \in \Sigma$, $\alpha \in V^*$ |
| Derivation length | $|w| = n \implies n$ steps |
| Left recursion fix | $A \to A\alpha \mid \beta$ → $A \to \beta B$, $B \to \alpha B \mid \alpha$ |
| PDA transition | $A \to a\gamma$ → $\delta(q, a, A) \ni (q, \gamma)$ |

---

*Next lesson: We explore **Pushdown Automata** — the machines that recognize context-free languages!*
