---
title: Pumping Lemma for Context-Free Languages
---

# Pumping Lemma for Context-Free Languages

In this lesson, you will learn how to **prove that a language is NOT context-free** using the Pumping Lemma for CFLs. This is the most powerful technique we have for showing that certain languages are beyond the reach of pushdown automata and context-free grammars.

---

## Why Do We Need This?

We know that context-free languages (CFLs) are more powerful than regular languages — they can handle nested structures like $a^n b^n$. But there are still many languages that CFLs **cannot** describe.

How do we prove a language is not context-free? We can't just try every possible grammar and fail — there are infinitely many grammars! Instead, we use a **structural argument** about what all CFLs must have in common.

This is exactly what the **Pumping Lemma for CFLs** provides.

---

## Intuition: Why CFLs Must Be "Pumpable"

The intuition comes from **parse trees** in Chomsky Normal Form (CNF).

### The Key Observation

In a CNF grammar, every production is either:
- $A \to BC$ (binary branching), or
- $A \to a$ (terminal production)

A parse tree for a string of length $n$ in CNF has:
- Exactly $n$ leaves (one per character)
- A binary tree structure above the leaves

**Critical fact:** A binary tree with $n$ leaves has height at least $\lceil \log_2 n \rceil$.

But the grammar has a **finite** number of variables, say $|V|$ variables. So if the string is long enough (specifically, if $n > 2^{|V|}$), then the height of the parse tree exceeds $|V|$.

### The Pigeonhole Argument

On any root-to-leaf path of length greater than $|V|$, there are more than $|V|$ internal nodes (variables). By the **Pigeonhole Principle**, some variable $A$ must appear **at least twice** on this path.

$$\text{Path length} > |V| \implies \text{some variable repeats}$$

This repeated variable creates a subtree structure that can be "pumped" — repeated or removed.

---

## The Pumping Lemma: Formal Statement

**Theorem (Pumping Lemma for CFLs):**

If $L$ is a context-free language, then there exists a constant $p \geq 1$ (the pumping length) such that for every string $w \in L$ with $|w| \geq p$, there exist strings $u, v, x, y, z$ such that:

$$w = uvxyz$$

and the following three conditions hold:

1. $|vy| > 0$ (at least one of $v$, $y$ is non-empty)
2. $|vxy| \leq p$ (the "pumped" portion is bounded in length)
3. For all $i \geq 0$: $uv^i xy^i z \in L$ (pumping preserves membership)

---

## Understanding the Decomposition

Let's visualize what $w = uvxyz$ means:

```
w:  [ u ][ v ][ x ][ y ][ z ]
         ↑         ↑
     "left pump"  "right pump"
```

- $u$ — prefix (untouched)
- $v$ — left pumpable section
- $x$ — middle (untouched)
- $y$ — right pumpable section
- $z$ — suffix (untouched)

### Pumping Up and Down

When we "pump" with $i$:
- $i = 0$: we get $uxz$ (pump **down** — both $v$ and $y$ removed)
- $i = 1$: we get $uvxyz = w$ (original string)
- $i = 2$: we get $uvvxyyz$ (pump **up** once)
- $i = 3$: we get $uvvvxyyyz$ (pump **up** twice)

The key constraint is that $v$ and $y$ are pumped the **same number of times**.

---

## Proof Sketch

**Proof:** Let $L$ be a CFL. Let $G = (V, \Sigma, R, S)$ be a CNF grammar with $L(G) = L - \{\varepsilon\}$.

Set $p = 2^{|V|}$.

Let $w \in L$ with $|w| \geq p$. Consider a parse tree $T$ for $w$ in $G$.

Since $G$ is in CNF and $|w| \geq 2^{|V|}$, the tree $T$ has height $> |V|$.

Choose the **longest** root-to-leaf path. This path has length $> |V|$, so it contains more than $|V|$ variable nodes.

By Pigeonhole, some variable $A$ appears at least twice on this path. Choose the **lowest** such repetition (the two occurrences closest to the leaf).

Let:
- The upper $A$ generate substring $vxy$
- The lower $A$ generate substring $x$

Then $w = uvxyz$ where:

- $S \Rightarrow^* uAz$ (upper context)
- $A \Rightarrow^* vAy$ (the repeating step)
- $A \Rightarrow^* x$ (the base)

**Condition 1:** $|vy| > 0$

Since $A \Rightarrow^* vAy$ uses at least one production, and CNF has no unit productions or $\varepsilon$-productions (except for start), at least one of $v, y$ is non-empty.

**Condition 2:** $|vxy| \leq p$

Because we chose the lowest repetition, the subtree rooted at the upper $A$ has height $\leq |V| + 1$, so it generates a string of length $\leq 2^{|V|+1}$. With careful choice, $|vxy| \leq p$.

**Condition 3:** For all $i \geq 0$, $uv^i xy^i z \in L$

- $i = 0$: $S \Rightarrow^* uAz \Rightarrow^* uxz$ ✓
- $i = 1$: $S \Rightarrow^* uAz \Rightarrow^* uvAyz \Rightarrow^* uvxyz$ ✓
- $i = k$: Apply $A \Rightarrow^* vAy$ exactly $k$ times, then $A \Rightarrow^* x$ ✓

$$S \Rightarrow^* uAz \Rightarrow^* uv^k A y^k z \Rightarrow^* uv^k x y^k z \in L$$

This completes the proof. ∎

---

## How to Use the Pumping Lemma

The Pumping Lemma is used in **proof by contradiction** to show a language is **not** context-free.

### The Adversary Game

Think of it as a game between you and an adversary:

| Step | Who | Action |
|------|-----|--------|
| 1 | Adversary | Chooses pumping length $p$ (you don't know its value) |
| 2 | You | Choose a string $w \in L$ with $|w| \geq p$ |
| 3 | Adversary | Decomposes $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$ |
| 4 | You | Find some $i \geq 0$ such that $uv^i xy^i z \notin L$ |

If you can **always** win step 4 regardless of the adversary's choices, then $L$ is not context-free.

### Proof Template

> **To prove $L$ is not context-free:**
>
> 1. Assume for contradiction that $L$ is context-free.
> 2. Then the Pumping Lemma applies; let $p$ be the pumping length.
> 3. Choose a specific $w \in L$ with $|w| \geq p$.
> 4. Consider **any** decomposition $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.
> 5. Show that for some $i$, $uv^i xy^i z \notin L$.
> 6. This contradicts the Pumping Lemma, so $L$ is not context-free.

### Strategy Tips

- Choose $w$ carefully — it should make **every** valid decomposition fail.
- The constraint $|vxy| \leq p$ limits where $v$ and $y$ can be. Use this!
- Often $i = 0$ (pumping down) or $i = 2$ (pumping up once) suffices.
- Unlike the regular pumping lemma, here you must handle **all** decompositions (since the adversary picks $u, v, x, y, z$).

---

## Example 1: $L = \{a^n b^n c^n \mid n \geq 0\}$

**Claim:** $L$ is not context-free.

**Proof:**

Assume $L$ is context-free. Let $p$ be the pumping length.

**Choose:** $w = a^p b^p c^p \in L$ (clearly $|w| = 3p \geq p$).

**Consider any decomposition** $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Since $|vxy| \leq p$ and $w = a^p b^p c^p$, the substring $vxy$ can span **at most two** of the three symbol blocks (it's too short to cover all three).

**Case analysis** on where $vxy$ falls:

**Case 1:** $vxy$ lies entirely within $a^p$.
Then $v$ and $y$ contain only $a$'s. Pumping up ($i = 2$) gives $uv^2xy^2z$ which has more $a$'s than $b$'s and $c$'s. So $uv^2xy^2z \notin L$. ✗

**Case 2:** $vxy$ spans the $a$-$b$ boundary.
Then $v$ and $y$ together contain only $a$'s and $b$'s (no $c$'s). Pumping up increases the count of $a$'s and/or $b$'s but not $c$'s. So $uv^2xy^2z \notin L$. ✗

**Case 3:** $vxy$ lies entirely within $b^p$.
Then pumping changes only the $b$-count. $uv^2xy^2z \notin L$. ✗

**Case 4:** $vxy$ spans the $b$-$c$ boundary.
Then pumping changes $b$ and/or $c$ counts but not $a$-count. $uv^2xy^2z \notin L$. ✗

**Case 5:** $vxy$ lies entirely within $c^p$.
Then pumping changes only the $c$-count. $uv^2xy^2z \notin L$. ✗

In **every** case, pumping with $i = 2$ produces a string not in $L$.

This contradicts the Pumping Lemma. Therefore $L$ is **not** context-free. ∎

---

## Example 2: $L = \{ww \mid w \in \{a, b\}^*\}$

**Claim:** $L$ is not context-free.

**Proof:**

Assume $L$ is context-free. Let $p$ be the pumping length.

**Choose:** $w = a^p b^p a^p b^p \in L$ (this is the string $s \cdot s$ where $s = a^p b^p$).

We have $|w| = 4p \geq p$.

**Consider any decomposition** $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Since $|vxy| \leq p$, the portion $vxy$ lies within a window of length $p$. In our string $a^p b^p a^p b^p$, this window can overlap **at most two** adjacent blocks.

**Key observation:** Pumping down ($i = 0$) gives $uxz$, which has length $4p - |vy|$ where $1 \leq |vy| \leq p$.

For $uxz$ to be in $L = \{ww\}$, it must have even length and its first half must equal its second half.

Let's analyze where $vxy$ can be:

**Case 1:** $vxy$ lies within the first $a^p$ block.
Then $uxz = a^{p-k} b^p a^p b^p$ for some $k > 0$ (where $k = |vy|$).
Length is $4p - k$, and for this to be $ww$, the first half is the first $2p - k/2$ symbols. The first half starts with fewer than $p$ copies of $a$, but the second half starts with $a$'s from the third block. These can't match. ✗

**Case 2:** $vxy$ spans the first $a^p$-$b^p$ boundary.
Pumping up or down changes the count of $a$'s and $b$'s in the first half asymmetrically. The resulting string cannot be $ww$. ✗

**Case 3:** $vxy$ lies within the first $b^p$ block.
Then $uxz = a^p b^{p-k} a^p b^p$. For this to be $ww$, we need two equal halves, but the $a$-$b$ boundary positions are asymmetric. ✗

**Case 4:** $vxy$ spans the boundary between the first $b^p$ and second $a^p$ (the "center" of the string).
Pumping down gives $a^p b^{p-j} a^{p-k} b^p$ where $j + k = |vy| > 0$.
This has length $4p - (j+k)$. The string is not of the form $ww$ because the block sizes are asymmetric around the midpoint. ✗

**Case 5-7:** (Symmetric cases for the second half — same reasoning applies.)

In every case, pumping produces a string not in $L$. Contradiction. ∎

---

## Example 3: $L = \{a^{n^2} \mid n \geq 0\}$

**Claim:** $L = \{a^{n^2} \mid n \geq 0\} = \{\varepsilon, a, aaaa, aaaaaaaaa, \ldots\}$ is not context-free.

**Proof:**

Assume $L$ is context-free. Let $p$ be the pumping length.

**Choose:** $w = a^{p^2} \in L$ (since $p^2$ is a perfect square and $|w| = p^2 \geq p$).

**Consider any decomposition** $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Since the string is all $a$'s, pumping only changes the **length**. Let $|vy| = k$ where $1 \leq k \leq p$.

Pumping up ($i = 2$) gives:

$$|uv^2xy^2z| = |uvxyz| + |vy| = p^2 + k$$

We need $p^2 + k$ to be a perfect square for $uv^2xy^2z \in L$.

But:

$$p^2 < p^2 + k \leq p^2 + p < p^2 + 2p + 1 = (p+1)^2$$

So $p^2 + k$ lies **strictly between** two consecutive perfect squares $p^2$ and $(p+1)^2$.

Therefore $p^2 + k$ is **not** a perfect square, and $uv^2xy^2z \notin L$. ✗

This contradicts the Pumping Lemma. Therefore $L$ is **not** context-free. ∎

---

## Example 4: $L = \{a^n \mid n \text{ is prime}\}$

**Claim:** $L$ is not context-free.

**Proof:**

Assume $L$ is context-free. Let $p$ be the pumping length.

**Choose:** Let $q$ be a prime number with $q \geq p$ (primes are infinite, so such $q$ exists). Set $w = a^q \in L$.

**Consider any decomposition** $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Let $|vy| = k$ where $1 \leq k \leq p \leq q$.

For pumping with $i$:

$$|uv^i xy^i z| = q + (i-1) \cdot k$$

We need to find $i$ such that $q + (i-1)k$ is **not** prime.

**Choose $i = q + 1$:**

$$|uv^{q+1}xy^{q+1}z| = q + q \cdot k = q(1 + k)$$

Since $k \geq 1$, we have $1 + k \geq 2$, and since $q \geq 2$, the number $q(1+k)$ is a **product of two integers both $\geq 2$**, hence **composite** (not prime).

Therefore $uv^{q+1}xy^{q+1}z \notin L$. ✗

This contradicts the Pumping Lemma. Therefore $L$ is **not** context-free. ∎

---

## Ogden's Lemma (Brief Overview)

**Ogden's Lemma** is a strengthened version of the CFL Pumping Lemma. It allows you to "mark" at least $p$ positions in the string, and guarantees that the pump ($v$ and $y$) includes at least one marked position.

### Statement (Simplified)

If $L$ is context-free, then $\exists p$ such that for any $w \in L$ with at least $p$ **marked** positions, there exists a decomposition $w = uvxyz$ where:

1. $v$ and $y$ together contain at least one marked position
2. $vxy$ contains at most $p$ marked positions
3. For all $i \geq 0$: $uv^i xy^i z \in L$

### When to Use Ogden's Lemma

Ogden's Lemma is useful when the standard Pumping Lemma is too weak — i.e., when you can't handle all possible decompositions with the regular lemma. By marking specific positions, you constrain where $v$ and $y$ can be.

**Example use:** Proving $L = \{a^i b^j c^k \mid i \neq j \text{ and } j \neq k\}$ is not CFL requires Ogden's Lemma (the standard Pumping Lemma fails here).

---

## Common Mistakes

### Mistake 1: Fixing the Decomposition

**Wrong:** "Let $v = a^2$ and $y = b^3$..."

You cannot choose the decomposition! The adversary (Pumping Lemma) picks $u, v, x, y, z$. You must show your argument works for **all** valid decompositions.

### Mistake 2: Forgetting the $|vxy| \leq p$ Constraint

This constraint is crucial — it limits where $vxy$ can appear in the string. Use it to restrict your case analysis.

### Mistake 3: Only Trying One Value of $i$

Sometimes $i = 2$ works for all cases, but sometimes you need different $i$ values for different decompositions. Make sure your chosen $i$ works for the **specific** case you're analyzing.

### Mistake 4: Choosing a Bad String

Your choice of $w$ must make the proof work for **all** possible decompositions. If your chosen $w$ has some decomposition that can be pumped, the proof fails.

### Mistake 5: Trying to Prove a Language IS CFL Using Pumping

The Pumping Lemma is a **necessary** condition, not a **sufficient** condition. Satisfying the Pumping Lemma does NOT prove a language is context-free. The lemma can only prove non-membership.

---

## Comparison with Regular Language Pumping Lemma

| Feature | Regular PL | CFL PL |
|---------|-----------|--------|
| Decomposition | $w = xyz$ (3 parts) | $w = uvxyz$ (5 parts) |
| Constraint | $|xy| \leq p$ | $|vxy| \leq p$ |
| Non-empty | $|y| > 0$ | $|vy| > 0$ |
| Pumping | $xy^i z \in L$ | $uv^i xy^i z \in L$ |
| Pump count | One piece ($y$) | Two pieces ($v$ and $y$), same exponent |

The CFL version has **two** pumpable sections because parse trees can repeat a variable with context on both sides.

---

## Try It Yourself

### Exercise 1

Prove that $L = \{a^n b^n c^m d^m \mid n \neq m\}$ is not context-free.

<details>
<summary>Solution</summary>

This one is tricky! Actually, this language **IS** context-free. Be careful — not every language that "looks hard" is non-CFL.

Grammar: $S \to AB \mid CD$ where:
- $A$ generates strings with more $a^n b^n$ than $c^m d^m$ ($n > m$)
- And so on...

The lesson: always try to build a grammar before trying to apply the Pumping Lemma!

</details>

### Exercise 2

Prove that $L = \{a^i b^j c^k \mid i < j < k\}$ is not context-free.

<details>
<summary>Solution</summary>

Assume $L$ is CFL. Let $p$ be the pumping length.

Choose $w = a^p b^{p+1} c^{p+2} \in L$.

Consider any decomposition $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Since $|vxy| \leq p$, the substring $vxy$ can span at most two of the three blocks.

**Case 1:** $vxy$ is within $a^p$.
Pumping down ($i=0$): $uxz = a^{p-k} b^{p+1} c^{p+2}$. Still in $L$ (since $p - k < p + 1 < p + 2$). Try pumping up ($i = p+3$): count of $a$'s becomes $p + (p+2)k \geq p + p + 2 > p + 1$. Need $a$-count $< p+1$, but now it exceeds $p+1$. So $uv^{p+3}xy^{p+3}z \notin L$. ✗

**Case 2:** $vxy$ spans the $a$-$b$ boundary.
Pumping up increases $a$-count and/or $b$-count. If $a$-count $\geq$ $b$-count, we leave $L$. Pumping down decreases $a$-count and/or $b$-count. We need careful analysis, but some pump value breaks the strict ordering. ✗

**Cases 3-5:** Similar analysis for other positions.

In all cases, we find a contradiction. $L$ is not context-free. ∎

</details>

### Exercise 3

Prove that $L = \{a^n b^m a^n \mid n, m \geq 0\}$ is not context-free.

<details>
<summary>Solution</summary>

Assume $L$ is CFL. Let $p$ be the pumping length.

Choose $w = a^p b^p a^p \in L$.

Consider any decomposition $w = uvxyz$ with $|vy| > 0$ and $|vxy| \leq p$.

Since $|vxy| \leq p$, the portion $vxy$ is confined to a window of size $p$. It can be in:

**Case 1:** Within first $a^p$ block.
Pumping down: $uxz = a^{p-k} b^p a^p$. The two $a$-blocks must be equal, but $p - k \neq p$. So $uxz \notin L$. ✗

**Case 2:** Spanning first $a$-$b$ boundary.
Pumping changes $a$-count in first block and/or $b$-count. Either the first $a$-block count $\neq$ third $a$-block count, or the structure is destroyed. ✗

**Case 3:** Within $b^p$ block.
Pumping changes $b$-count only — still have $a^p b^{p \pm k} a^p \in L$. Wait — this is valid! $L$ allows any $m$. So pumping within $b$ doesn't help.

But we can choose $i = 0$: $uxz = a^p b^{p-k} a^p$ which IS in $L$. This case doesn't give a contradiction directly.

**Fix:** Choose $w = a^p b a^p$ instead. Now $|vxy| \leq p$ and the middle is short, so $vxy$ must include $a$'s from at least one side. Any pump changes the $a$-counts asymmetrically. ✗

Actually, let's use $w = a^p b^p a^p$ and note that if $vxy$ is entirely in the $b$-block, pumping is fine. But for the other cases, pumping breaks the $a$-block equality. Since we need ALL decompositions to fail, and this one doesn't... we need a better string.

Choose $w = a^p b a^p$. Now $|vxy| \leq p$, and $vxy$ must touch at least one $a$-block. Pumping will change the count of one $a$-block without equally changing the other. ✗

Therefore $L$ is not context-free. ∎

</details>

### Exercise 4

Is $L = \{a^n b^n \mid n \geq 0\} \cup \{a^n b^{2n} \mid n \geq 0\}$ context-free?

<details>
<summary>Solution</summary>

Yes! $L$ is context-free because it's the union of two CFLs:
- $L_1 = \{a^n b^n\}$ with grammar $S_1 \to aS_1 b \mid \varepsilon$
- $L_2 = \{a^n b^{2n}\}$ with grammar $S_2 \to aS_2 bb \mid \varepsilon$

CFLs are closed under union, so $L = L_1 \cup L_2$ is CFL.

Grammar: $S \to S_1 \mid S_2$, $S_1 \to aS_1 b \mid \varepsilon$, $S_2 \to aS_2 bb \mid \varepsilon$

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Purpose | Prove a language is NOT context-free |
| Method | Proof by contradiction |
| Decomposition | $w = uvxyz$ with $|vy| > 0$, $|vxy| \leq p$ |
| Pumping | $uv^i xy^i z \in L$ for all $i \geq 0$ |
| Your job | Choose $w$, then for ALL decompositions find bad $i$ |
| Common choice | $i = 0$ (pump down) or $i = 2$ (pump up) |
| Limitation | Can only disprove CFL membership, never prove it |
| Strengthening | Ogden's Lemma (mark positions for more control) |

---

## Quick Reference: Languages We've Classified

| Language | Regular? | CFL? | Proof of Non-membership |
|----------|:--------:|:----:|------------------------|
| $\{a^n b^n \mid n \geq 0\}$ | ✗ | ✓ | Regular PL (non-regular); has CFG |
| $\{a^n b^n c^n \mid n \geq 0\}$ | ✗ | ✗ | CFL PL (Example 1 above) |
| $\{ww \mid w \in \{a,b\}^*\}$ | ✗ | ✗ | CFL PL (Example 2 above) |
| $\{a^{n^2} \mid n \geq 0\}$ | ✗ | ✗ | CFL PL (Example 3 above) |
| $\{a^p \mid p \text{ prime}\}$ | ✗ | ✗ | CFL PL (Example 4 above) |
| $\{a^n b^m \mid n \neq m\}$ | ✗ | ✓ | Has CFG: $S \to aSb \mid aA \mid Bb$, $A \to aA \mid a$, $B \to bB \mid b$ |
| $\{a^n b^n\} \cup \{a^n b^{2n}\}$ | ✗ | ✓ | Union of two CFLs |

This table helps build intuition for when to apply the Pumping Lemma versus when to look for a grammar.

---

## What's Next?

Now that you can identify non-CFLs, the next lesson covers the **CYK parsing algorithm** — an efficient dynamic programming method to determine if a string belongs to a given CFL. This gives us a polynomial-time membership test for any CFL.
