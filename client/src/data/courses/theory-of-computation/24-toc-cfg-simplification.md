---
title: Simplification of Context-Free Grammars
---

# Simplification of Context-Free Grammars

Before converting a CFG to a normal form (like Chomsky Normal Form), we must simplify it by removing three types of "impurities": epsilon productions, unit productions, and useless symbols. This lesson covers each elimination algorithm with complete examples.

---

## Why Simplify?

Simplified grammars are:

- Easier to analyze and prove properties about
- Required as input for normal form conversions
- More efficient for parsing algorithms
- Free of redundant or unreachable components

The three simplification steps are:

1. **Eliminate $\varepsilon$-productions** (except possibly $S \to \varepsilon$)
2. **Eliminate unit productions** ($A \to B$)
3. **Eliminate useless symbols** (non-generating or unreachable variables)

---

## Step 1: Eliminate $\varepsilon$-Productions

An **$\varepsilon$-production** is any rule of the form $A \to \varepsilon$ where $A \in V$.

### Nullable Variables

A variable $A$ is **nullable** if $A \Rightarrow^* \varepsilon$ (it can derive the empty string).

### Algorithm to Find Nullable Variables

Build the set $\text{Nullable}$ iteratively:

1. **Base case:** If $A \to \varepsilon$ is a rule, then $A$ is nullable
2. **Inductive step:** If $A \to B_1 B_2 \cdots B_k$ is a rule and every $B_i$ is nullable, then $A$ is nullable
3. Repeat step 2 until no new variables are added

### Algorithm to Eliminate $\varepsilon$-Productions

For each rule $A \to X_1 X_2 \cdots X_n$:

1. Identify which $X_i$ are nullable
2. Add new rules for every combination of including/excluding nullable symbols
3. Do **not** add the rule $A \to \varepsilon$ (unless $A = S$ and $\varepsilon \in L(G)$)
4. Remove all original $\varepsilon$-productions

If the start symbol $S$ is nullable (i.e., $\varepsilon \in L(G)$), add a new start symbol $S'$ with rules:

$$S' \to S \mid \varepsilon$$

### Complete Example

**Original grammar:**

$$S \to ABaC$$
$$A \to BC$$
$$B \to b \mid \varepsilon$$
$$C \to c \mid \varepsilon$$

**Step 1: Find nullable variables**

- $B$ is nullable (rule $B \to \varepsilon$)
- $C$ is nullable (rule $C \to \varepsilon$)
- $A$ is nullable (rule $A \to BC$ and both $B, C$ are nullable)
- $S$ is nullable? $S \to ABaC$ — requires $A, B, C$ nullable, but $a$ is a terminal. Not nullable.

$$\text{Nullable} = \{A, B, C\}$$

**Step 2: Generate new rules**

For $S \to ABaC$ (positions 1, 2, 4 are nullable):

All combinations of including/excluding nullable positions (but not all excluded unless it produces $\varepsilon$):

| Include A | Include B | Include C | Rule |
|-----------|-----------|-----------|------|
| ✓ | ✓ | ✓ | $S \to ABaC$ |
| ✗ | ✓ | ✓ | $S \to BaC$ |
| ✓ | ✗ | ✓ | $S \to AaC$ |
| ✓ | ✓ | ✗ | $S \to ABa$ |
| ✗ | ✗ | ✓ | $S \to aC$ |
| ✗ | ✓ | ✗ | $S \to Ba$ |
| ✓ | ✗ | ✗ | $S \to Aa$ |
| ✗ | ✗ | ✗ | $S \to a$ |

For $A \to BC$ (both positions nullable):

| Include B | Include C | Rule |
|-----------|-----------|------|
| ✓ | ✓ | $A \to BC$ |
| ✗ | ✓ | $A \to C$ |
| ✓ | ✗ | $A \to B$ |
| ✗ | ✗ | (would give $A \to \varepsilon$, skip) |

For $B \to b \mid \varepsilon$: Keep $B \to b$, remove $B \to \varepsilon$

For $C \to c \mid \varepsilon$: Keep $C \to c$, remove $C \to \varepsilon$

**Result (no $\varepsilon$-productions):**

$$S \to ABaC \mid BaC \mid AaC \mid ABa \mid aC \mid Ba \mid Aa \mid a$$
$$A \to BC \mid B \mid C$$
$$B \to b$$
$$C \to c$$

---

## Step 2: Eliminate Unit Productions

A **unit production** is a rule of the form $A \to B$ where both $A$ and $B$ are single variables.

Unit productions add no structure — they just "rename" one variable to another.

### Unit Pairs

Define the **unit pair** relation: $(A, B)$ is a unit pair if $A \Rightarrow^* B$ using only unit productions.

### Algorithm to Find Unit Pairs

Build the set of unit pairs:

1. **Base:** $(A, A)$ for every variable $A$ (reflexive)
2. **Inductive:** If $(A, B)$ is a unit pair and $B \to C$ is a unit production, then $(A, C)$ is a unit pair
3. Repeat until no new pairs are added

### Algorithm to Eliminate Unit Productions

For each unit pair $(A, B)$ where $A \neq B$:

1. For every non-unit production $B \to \alpha$ (where $\alpha$ is not a single variable), add the rule $A \to \alpha$
2. Remove all unit productions from the grammar

### Complete Example

**Grammar (after $\varepsilon$-elimination):**

$$S \to ABaC \mid BaC \mid AaC \mid ABa \mid aC \mid Ba \mid Aa \mid a$$
$$A \to BC \mid B \mid C$$
$$B \to b$$
$$C \to c$$

**Step 1: Find unit pairs**

Base pairs: $(S, S), (A, A), (B, B), (C, C)$

From $A \to B$: add $(A, B)$
From $A \to C$: add $(A, C)$

No further chaining (no unit productions from $B$ or $C$).

$$\text{Unit pairs} = \{(S,S), (A,A), (B,B), (C,C), (A,B), (A,C)\}$$

**Step 2: Add rules and remove unit productions**

For unit pair $(A, B)$: $B$'s non-unit rules are $B \to b$, so add $A \to b$

For unit pair $(A, C)$: $C$'s non-unit rules are $C \to c$, so add $A \to c$

Remove unit productions $A \to B$ and $A \to C$.

**Result:**

$$S \to ABaC \mid BaC \mid AaC \mid ABa \mid aC \mid Ba \mid Aa \mid a$$
$$A \to BC \mid b \mid c$$
$$B \to b$$
$$C \to c$$

---

## Step 3: Eliminate Useless Symbols

A symbol (variable or terminal) is **useful** if it appears in some derivation $S \Rightarrow^* \alpha X \beta \Rightarrow^* w$ where $w \in \Sigma^*$.

A symbol is useless if it is NOT useful. We eliminate useless symbols in two phases:

### Phase 1: Eliminate Non-Generating Symbols

A variable $A$ is **generating** if $A \Rightarrow^* w$ for some $w \in \Sigma^*$ (it can derive a string of all terminals).

**Algorithm:**

1. **Base:** All terminals are generating
2. **Inductive:** If $A \to X_1 X_2 \cdots X_k$ and every $X_i$ is generating, then $A$ is generating
3. Repeat until no new variables are added
4. Remove all rules containing non-generating variables

### Phase 2: Eliminate Non-Reachable Symbols

A symbol $X$ is **reachable** if $S \Rightarrow^* \alpha X \beta$ for some $\alpha, \beta$ (it appears in some sentential form derivable from $S$).

**Algorithm:**

1. **Base:** $S$ is reachable
2. **Inductive:** If $A$ is reachable and $A \to X_1 X_2 \cdots X_k$ is a rule, then each $X_i$ is reachable
3. Repeat until no new symbols are added
4. Remove all rules containing non-reachable symbols

### Order Matters!

**Always do Phase 1 (generating) before Phase 2 (reachable).**

If you do them in the wrong order, you may miss some useless symbols.

### Example

**Grammar:**

$$S \to AB \mid a$$
$$A \to aA \mid bB$$
$$B \to b$$
$$C \to cC$$
$$D \to dAd$$

**Phase 1: Find generating variables**

Iteration 1 (base): terminals $a, b, c, d$ are generating

Iteration 2: 
- $B \to b$: $b$ generating → $B$ is generating
- $S \to a$: $a$ generating → $S$ is generating

Iteration 3:
- $S \to AB$: need both $A, B$ generating. $B$ yes, $A$?
- $A \to bB$: $b$ generating, $B$ generating → $A$ is generating
- $S \to AB$: both generating → confirmed
- $D \to dAd$: $d, A$ generating → $D$ is generating
- $C \to cC$: need $C$ generating... $C$ only has $C \to cC$, which requires $C$ itself. **Not generating!**

$$\text{Generating} = \{S, A, B, D, a, b, d\}$$

Remove $C$ and all its rules: $C \to cC$ is removed. Terminal $c$ only appeared in $C$'s rules, so it's also removed.

Grammar after Phase 1:

$$S \to AB \mid a$$
$$A \to aA \mid bB$$
$$B \to b$$
$$D \to dAd$$

**Phase 2: Find reachable symbols**

Start with: $\{S\}$

From $S \to AB \mid a$: add $A, B, a$ → $\{S, A, B, a\}$

From $A \to aA \mid bB$: add $b$ (others already in set) → $\{S, A, B, a, b\}$

From $B \to b$: $b$ already in set

$D$ is never reached from $S$!

$$\text{Reachable} = \{S, A, B, a, b\}$$

Remove $D$ and its rules.

**Final grammar:**

$$S \to AB \mid a$$
$$A \to aA \mid bB$$
$$B \to b$$

---

## Complete Simplification Example

Let's apply all three steps to a grammar from scratch.

**Original grammar:**

$$S \to ASB \mid \varepsilon$$
$$A \to aAS \mid a \mid \varepsilon$$
$$B \to SbS \mid A \mid bb$$

### Step 1: Eliminate $\varepsilon$-productions

**Find nullable:**
- $S$ is nullable (rule $S \to \varepsilon$)
- $A$ is nullable (rule $A \to \varepsilon$)
- $B$ is nullable? $B \to A$ and $A$ is nullable, so we need $A \Rightarrow^* \varepsilon$. Yes! $B$ is nullable.
- Also $B \to SbS$ — needs $S, b, S$ all nullable. $b$ is not nullable. So this rule doesn't help.

$$\text{Nullable} = \{S, A, B\}$$

**Generate new rules:**

For $S \to ASB$ (all three positions nullable):

$$S \to ASB \mid AB \mid SB \mid AS \mid S \mid A \mid B$$

(We skip $S \to \varepsilon$ since we handle it separately.)

Since $S$ is nullable and $\varepsilon \in L(G)$: introduce $S_0 \to S \mid \varepsilon$ as new start.

For $A \to aAS$ (positions 2, 3 nullable):

$$A \to aAS \mid aS \mid aA \mid a$$

Keep $A \to a$ (already present).

For $B \to SbS$ (positions 1, 3 nullable):

$$B \to SbS \mid bS \mid Sb \mid b$$

Keep $B \to A$ and $B \to bb$.

**Remove all $\varepsilon$-productions.** Remove $S \to \varepsilon$ and $A \to \varepsilon$.

**Grammar after Step 1:**

$$S_0 \to S \mid \varepsilon$$
$$S \to ASB \mid AB \mid SB \mid AS \mid S \mid A \mid B$$
$$A \to aAS \mid aS \mid aA \mid a$$
$$B \to SbS \mid bS \mid Sb \mid b \mid A \mid bb$$

### Step 2: Eliminate unit productions

**Unit productions:** $S_0 \to S$, $S \to S$, $S \to A$, $S \to B$, $B \to A$

**Find unit pairs:**

Start with reflexive: $(S_0, S_0), (S, S), (A, A), (B, B)$

- $S_0 \to S$: add $(S_0, S)$
- $S \to A$: add $(S, A)$
- $S \to B$: add $(S, B)$
- $B \to A$: add $(B, A)$
- $S \to S$: already have $(S, S)$
- $(S_0, S)$ and $S \to A$: add $(S_0, A)$
- $(S_0, S)$ and $S \to B$: add $(S_0, B)$

$$\text{Unit pairs} = \{(S_0,S_0), (S,S), (A,A), (B,B), (S_0,S), (S,A), (S,B), (B,A), (S_0,A), (S_0,B)\}$$

**Add non-unit rules for each pair:**

Non-unit rules for each variable:
- $S$: $ASB, AB, SB, AS$
- $A$: $aAS, aS, aA, a$
- $B$: $SbS, bS, Sb, b, bb$

For $(S_0, S)$: add $S_0 \to ASB \mid AB \mid SB \mid AS$

For $(S_0, A)$: add $S_0 \to aAS \mid aS \mid aA \mid a$

For $(S_0, B)$: add $S_0 \to SbS \mid bS \mid Sb \mid b \mid bb$

For $(S, A)$: add $S \to aAS \mid aS \mid aA \mid a$

For $(S, B)$: add $S \to SbS \mid bS \mid Sb \mid b \mid bb$

For $(B, A)$: add $B \to aAS \mid aS \mid aA \mid a$

**Remove all unit productions** ($S_0 \to S$, $S \to S$, $S \to A$, $S \to B$, $B \to A$).

**Grammar after Step 2:**

$$S_0 \to ASB \mid AB \mid SB \mid AS \mid aAS \mid aS \mid aA \mid a \mid SbS \mid bS \mid Sb \mid b \mid bb \mid \varepsilon$$
$$S \to ASB \mid AB \mid SB \mid AS \mid aAS \mid aS \mid aA \mid a \mid SbS \mid bS \mid Sb \mid b \mid bb$$
$$A \to aAS \mid aS \mid aA \mid a$$
$$B \to SbS \mid bS \mid Sb \mid b \mid bb \mid aAS \mid aS \mid aA \mid a$$

### Step 3: Eliminate useless symbols

**Phase 1 (generating):** All variables ($S_0, S, A, B$) can generate terminal strings (e.g., $S \to a$, $A \to a$, $B \to b$). All generating.

**Phase 2 (reachable):** Starting from $S_0$, all of $S, A, B$ appear in rules of $S_0$. All reachable.

No useless symbols to remove. The grammar is now simplified!

---

## Summary of the Simplification Pipeline

The order of steps matters for correctness:

$$\boxed{\text{Eliminate } \varepsilon\text{-productions} \to \text{Eliminate unit productions} \to \text{Eliminate useless symbols}}$$

### Why This Order?

1. **$\varepsilon$-elimination first:** May introduce unit productions (e.g., $A \to BC$ with $C$ nullable becomes $A \to B$)
2. **Unit elimination second:** May make some variables useless (unreachable)
3. **Useless symbol elimination last:** Cleans up any debris from previous steps

---

## Properties After Simplification

After all three steps, the grammar satisfies:

1. No $\varepsilon$-productions (except possibly $S \to \varepsilon$ via new start symbol)
2. No unit productions ($A \to B$)
3. Every variable is generating and reachable
4. Every terminal appears in some rule that's part of a useful derivation

This is the standard starting point for converting to Chomsky Normal Form.

---

## Time Complexity

| Step | Complexity |
|------|-----------|
| Find nullable variables | $O(|G|)$ where $|G|$ = grammar size |
| Eliminate $\varepsilon$-productions | $O(2^k \cdot |G|)$ where $k$ = max rule length |
| Find unit pairs | $O(|V|^2 \cdot |G|)$ |
| Eliminate unit productions | $O(|V|^2 \cdot |G|)$ |
| Find generating symbols | $O(|G|)$ |
| Find reachable symbols | $O(|G|)$ |

In the worst case, $\varepsilon$-elimination can cause exponential blowup (a rule with $k$ nullable symbols produces up to $2^k - 1$ new rules). In practice, rules are short, so this is manageable.

---

## Exercises

### Exercise 1: $\varepsilon$-Elimination

Eliminate $\varepsilon$-productions from:

$$S \to aAb$$
$$A \to aAb \mid \varepsilon$$

---

### Exercise 2: Full Pipeline

Apply all three simplification steps to:

$$S \to ABa$$
$$A \to aab \mid \varepsilon$$
$$B \to A$$
$$C \to bCa$$

---

### Exercise 3: Nullable Detection

Find all nullable variables in:

$$S \to ABC$$
$$A \to BB \mid \varepsilon$$
$$B \to CC$$
$$C \to AA \mid a$$

---

### Exercise 4: Unit Pairs

Find all unit pairs and eliminate unit productions from:

$$S \to A \mid B$$
$$A \to B \mid aA$$
$$B \to A \mid b$$

What problem arises? How do you handle cycles ($A \to B$ and $B \to A$)?

---

### Exercise 5: Useless Symbols

Identify and remove useless symbols from:

$$S \to aB \mid bA$$
$$A \to aS \mid bAA \mid a$$
$$B \to bS \mid aBB \mid b$$
$$C \to AB \mid c$$
$$D \to Da$$

---

### Exercise 6: Complete Example

Starting from:

$$S \to XY \mid Xn \mid p$$
$$X \to mX \mid \varepsilon$$
$$Y \to Xn \mid o$$

Apply all simplification steps and show the grammar at each stage.

---

### Exercise 7: Proof

Prove that eliminating $\varepsilon$-productions does not change the language (except possibly removing $\varepsilon$ if the original start symbol was nullable, which is handled by the new start symbol).

**Hint:** Show by induction on derivation length that every non-empty string derivable in the original grammar is also derivable in the new grammar, and vice versa.

---

### Exercise 8: Order Matters

Give an example showing that if you eliminate useless symbols **before** $\varepsilon$-productions, the final grammar may still contain useless symbols. (Hint: $\varepsilon$-elimination can create new non-generating combinations.)

---

## Common Pitfalls

1. **Forgetting the new start symbol:** When $\varepsilon \in L(G)$, you must add $S_0 \to S \mid \varepsilon$ and use $S_0$ as the new start. Otherwise you lose $\varepsilon$ from the language.

2. **Over-generating during $\varepsilon$-elimination:** When all nullable symbols in a rule are omitted, don't add $A \to \varepsilon$ (that defeats the purpose).

3. **Cycles in unit productions:** If $A \to B$ and $B \to A$, both $(A, B)$ and $(B, A)$ are unit pairs. The non-unit rules of $A$ get copied to $B$ and vice versa. After removing the unit productions, $A$ and $B$ have identical rule sets — they generate the same language.

4. **Doing Phase 2 before Phase 1:** After removing non-generating symbols, new variables may become unreachable. Always do generating first, then reachable.

---

## Summary

| Step | Input | Output |
|------|-------|--------|
| Eliminate $\varepsilon$-productions | Grammar with $A \to \varepsilon$ rules | No $\varepsilon$-productions (except new start) |
| Eliminate unit productions | Grammar with $A \to B$ rules | No single-variable RHS |
| Eliminate useless symbols | Grammar with dead ends | Every symbol is useful |

---

## What's Next?

With the grammar simplified, we're ready to convert it to **Chomsky Normal Form** — a standardized form where every rule is either $A \to BC$ or $A \to a$, enabling efficient parsing algorithms.
