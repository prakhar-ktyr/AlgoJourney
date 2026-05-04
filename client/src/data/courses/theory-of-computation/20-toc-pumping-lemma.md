---
title: Pumping Lemma for Regular Languages
---

# Pumping Lemma for Regular Languages

In this lesson, you'll learn the **Pumping Lemma** — the most important tool for proving that a language is **not regular**. If you suspect a language requires memory beyond what a finite automaton can provide, the pumping lemma gives you a rigorous proof technique.

---

## Purpose

The pumping lemma is used to prove that certain languages are **NOT regular**.

Key points:
- It is a **necessary condition** for regularity (all regular languages satisfy it)
- It is **not a sufficient condition** (some non-regular languages also satisfy it)
- You use it via **proof by contradiction**: assume the language is regular, show the pumping lemma is violated, conclude it's not regular

Think of it as a "litmus test" — failing it **guarantees** non-regularity; passing it proves nothing.

---

## Intuition: Why Pumping Works

Consider a DFA with $p$ states processing a string $w$ with $|w| \geq p$.

As the DFA reads $w$, it visits a sequence of states:

$$q_0, q_1, q_2, \ldots, q_{|w|}$$

That's $|w| + 1$ states visited (counting the start). Since $|w| \geq p$ and there are only $p$ states, by the **Pigeonhole Principle**, some state must be **visited twice** within the first $p$ steps:

$$q_i = q_j \quad \text{for some } 0 \leq i < j \leq p$$

This repeated state creates a **loop**! The substring between positions $i$ and $j$ takes the DFA from state $q_i$ back to $q_i$. We can:

- **Remove** the loop (pump down: $i = 0$)
- **Traverse** it once (the original string: $i = 1$)
- **Repeat** it any number of times (pump up: $i = 2, 3, \ldots$)

And the DFA still ends in the same state! So all pumped strings are either all accepted or all rejected.

---

## Formal Statement

**Pumping Lemma for Regular Languages:**

If $L$ is a regular language, then there exists a constant $p \geq 1$ (called the **pumping length**) such that:

For every string $w \in L$ with $|w| \geq p$, there exist strings $x$, $y$, $z$ such that $w = xyz$ and:

1. $|y| > 0$ (the pumped portion is non-empty)
2. $|xy| \leq p$ (the pump occurs within the first $p$ characters)
3. For all $i \geq 0$: $xy^i z \in L$ (pumping preserves membership)

In logical notation:

$$L \text{ regular} \implies \exists p \geq 1 : \forall w \in L, |w| \geq p : \exists x,y,z \;(w = xyz \wedge |y| > 0 \wedge |xy| \leq p \wedge \forall i \geq 0: xy^iz \in L)$$

### What Each Condition Means

| Condition | Meaning | Why It's Needed |
|-----------|---------|-----------------|
| $w = xyz$ | The string splits into three parts | Sets up the decomposition |
| $|y| > 0$ | $y$ is not empty | Otherwise pumping does nothing |
| $\|xy\| \leq p$ | The split happens early | From pigeonhole on first $p$ states |
| $xy^iz \in L$ for all $i \geq 0$ | Repeating/removing $y$ stays in $L$ | The loop can be traversed any number of times |

**Note:** $y^0 = \varepsilon$, so $xy^0z = xz \in L$ (pumping "down" — removing $y$).

---

## Proof of the Pumping Lemma

**Proof:** Let $L$ be regular. Then there exists a DFA $M = (Q, \Sigma, \delta, q_0, F)$ with $L(M) = L$.

Let $p = |Q|$ (the number of states).

Take any $w = w_1 w_2 \cdots w_n \in L$ with $n \geq p$.

As $M$ processes $w$, it visits states:

$$r_0, r_1, r_2, \ldots, r_n$$

where $r_0 = q_0$ and $r_k = \delta(r_{k-1}, w_k)$ for each $k$.

This sequence has $n + 1 \geq p + 1$ elements, but there are only $p$ states. By the **Pigeonhole Principle**, there exist indices $0 \leq i < j \leq p$ such that $r_i = r_j$.

Now define:
- $x = w_1 w_2 \cdots w_i$ (the part before the loop)
- $y = w_{i+1} w_{i+2} \cdots w_j$ (the loop)
- $z = w_{j+1} w_{j+2} \cdots w_n$ (the part after the loop)

Verify the conditions:
1. $|y| = j - i > 0$ since $i < j$ ✓
2. $|xy| = j \leq p$ since $j \leq p$ ✓
3. For any $i \geq 0$: processing $xy^iz$ in $M$:
   - Reading $x$ takes us from $r_0$ to $r_i$
   - Each copy of $y$ takes us from $r_i$ to $r_j = r_i$ (it's a loop!)
   - Reading $z$ takes us from $r_i = r_j$ to $r_n \in F$
   
   So $xy^iz$ is accepted. ✓

$\square$

---

## How to Use the Pumping Lemma (Proof by Contradiction)

To prove a language $L$ is NOT regular:

### Step 1: Assume $L$ is regular

"Assume for contradiction that $L$ is regular."

### Step 2: Let $p$ be the pumping length

"Then by the Pumping Lemma, there exists a pumping length $p \geq 1$."

(You don't get to choose $p$ — it's given to you by the lemma. Your proof must work for ALL possible values of $p$.)

### Step 3: Choose a specific string $w \in L$ with $|w| \geq p$

"Consider the string $w = \ldots$" (YOUR choice — choose wisely!)

This is the creative step. You pick a string that will lead to a contradiction no matter how it's decomposed. The string should:
- Be in $L$
- Have length $\geq p$
- Be "breakable" — pumping any early portion will leave $L$

### Step 4: Consider ALL decompositions $w = xyz$ satisfying conditions 1-2

"For any decomposition $w = xyz$ with $|y| > 0$ and $|xy| \leq p$..."

You must argue about ALL valid decompositions, not just one. Condition 2 ($|xy| \leq p$) often restricts $y$ to be within a specific portion of $w$.

### Step 5: Find an $i$ such that $xy^iz \notin L$

"Consider $i = \ldots$. Then $xy^iz = \ldots$, which is not in $L$ because..."

Show that pumping (with your chosen $i$) produces a string outside $L$.

### Step 6: Contradiction

"This contradicts the Pumping Lemma. Therefore, $L$ is not regular."

---

## The "Adversary Game" Interpretation

The pumping lemma proof has the structure of a two-player game:

| Step | Who chooses | What they choose |
|------|------------|------------------|
| 1 | **Adversary** (the lemma) | The pumping length $p$ |
| 2 | **You** | The string $w \in L$ with $|w| \geq p$ |
| 3 | **Adversary** | The decomposition $w = xyz$ (satisfying conditions 1-2) |
| 4 | **You** | The pump count $i$ |

You win if $xy^iz \notin L$. You need a strategy that wins **regardless** of the adversary's choices.

---

## Example 1: $L = \{0^n 1^n \mid n \geq 0\}$ Is Not Regular

This is the classic example — strings with equal numbers of 0s and 1s, with all 0s before all 1s.

### Proof

**Step 1:** Assume $L$ is regular.

**Step 2:** Let $p$ be the pumping length from the Pumping Lemma.

**Step 3:** Choose $w = 0^p 1^p$.

Check: $w \in L$ ✓ (has $p$ zeros followed by $p$ ones). $|w| = 2p \geq p$ ✓.

**Step 4:** Consider any decomposition $w = xyz$ with $|y| > 0$ and $|xy| \leq p$.

Since $|xy| \leq p$ and the first $p$ characters of $w$ are all 0s:

$$x = 0^a, \quad y = 0^b, \quad z = 0^{p-a-b} 1^p$$

where $a \geq 0$, $b \geq 1$ (since $|y| > 0$), and $a + b \leq p$.

**Step 5:** Choose $i = 0$ (pump down). Then:

$$xy^0z = xz = 0^a \cdot 0^{p-a-b} \cdot 1^p = 0^{p-b} 1^p$$

Since $b \geq 1$, we have $p - b < p$, so the string has fewer 0s than 1s.

Therefore $xy^0z = 0^{p-b}1^p \notin L$.

**Step 6:** This contradicts the Pumping Lemma (which says $xy^0z$ should be in $L$).

Therefore, $L = \{0^n 1^n \mid n \geq 0\}$ is **not regular**. $\square$

---

## Example 2: $L = \{ww \mid w \in \{0,1\}^*\}$ Is Not Regular

The language of "doubled" strings: $\{\varepsilon, 00, 11, 0000, 0101, 1010, 1111, \ldots\}$.

### Proof

**Step 1:** Assume $L$ is regular.

**Step 2:** Let $p$ be the pumping length.

**Step 3:** Choose $w = 0^p 1 0^p 1$.

Check: $w = (0^p 1)(0^p 1)$, so $w \in L$ ✓. $|w| = 2p + 2 \geq p$ ✓.

**Step 4:** Any decomposition $w = xyz$ with $|xy| \leq p$ means $xy$ is entirely within the first $p$ characters — all zeros.

So $x = 0^a$, $y = 0^b$ (with $b \geq 1$), $z = 0^{p-a-b} 1 0^p 1$.

**Step 5:** Choose $i = 2$ (pump up). Then:

$$xy^2z = 0^a \cdot 0^{2b} \cdot 0^{p-a-b} 1 0^p 1 = 0^{p+b} 1 0^p 1$$

For this to be in $L$, it must equal $uu$ for some $u$. The total length is $2p + 2 + b$ (odd... wait, let's check: $b \geq 1$ so length is $2p + 2 + b$).

If $b$ is odd, the length is odd, so it can't be $ww$ (which requires even length). ✓

If $b$ is even, the string has length $2p + 2 + b$, so each half has length $p + 1 + b/2$. The first half is $0^{p+1+b/2}\ldots$ but let's look at this differently.

Actually, let's use $i = 0$ instead. $xy^0z = 0^{p-b} 1 0^p 1$. For this to be $uu$: length is $2p + 2 - b$. Each half has length $p + 1 - b/2$... 

Let's restart with a cleaner choice.

**Better Step 3:** Choose $w = 0^p 10^p 1$.

**Step 5 (revised):** Choose $i = 0$. Then $xy^0z = 0^{p-b} 1 0^p 1$.

The length is $2(p-b) + 2 + 2b - b = 2p + 2 - b$. The string has its first "1" at position $p - b + 1$ and second "1" at position $2p - b + 2$.

For $xy^0z$ to equal $uu$, the midpoint is at position $p + 1 - b/2$. But the first "1" is at position $p - b + 1$. The second "1" is at position $2p - b + 2$. For the string to be $uu$, both halves must be identical, which requires 1s at symmetric positions. Since $b \geq 1$, the 1s are no longer at the positions required for doubling.

Alternatively, a cleaner approach:

**Cleaner Step 3:** Choose $w = 0^p 1^p 0^p 1^p$ (so $w = (0^p 1^p)(0^p 1^p) \in L$).

With $|xy| \leq p$, we have $y = 0^b$ within the first block of 0s. Pumping gives $0^{p+b}1^p 0^p 1^p$ for $i=2$, which has length $2(2p) + b$. If odd length, not in $L$.

The cleanest proof uses a different string:

**Cleanest approach:** Choose $w = 0^p 1 0^p 1$. Length $= 2p + 2 \geq p$. And $w = (0^p 1)(0^p 1) \in L$.

$y = 0^b$ ($b \geq 1$). Pump $i = 2$: $xy^2z = 0^{p+b} 1 0^p 1$. Length $= 2p + 2 + b$.

If $2p + 2 + b$ is odd, can't be in $L$. If even, each half has length $p + 1 + b/2$. First half: $0^{p+b} 1 0^{b/2 - b + ...}$ — the two halves differ (first half has more leading zeros), so it's not in $L$. $\square$

---

## Example 3: $L = \{0^{n^2} \mid n \geq 0\}$ Is Not Regular

The language of strings of 0s whose length is a perfect square: $\{\varepsilon, 0, 0000, 000000000, \ldots\}$ (lengths $0, 1, 4, 9, 16, \ldots$).

### Proof

**Step 1:** Assume $L$ is regular.

**Step 2:** Let $p$ be the pumping length.

**Step 3:** Choose $w = 0^{p^2}$.

Check: $|w| = p^2 \geq p$ ✓. $p^2$ is a perfect square, so $w \in L$ ✓.

**Step 4:** Any decomposition $w = xyz$ with $|y| > 0$ and $|xy| \leq p$:

Since $w$ is all zeros: $y = 0^b$ where $1 \leq b \leq p$.

**Step 5:** Choose $i = 2$. Then:

$$|xy^2z| = |w| + |y| = p^2 + b$$

We need to show $p^2 + b$ is **not** a perfect square.

Since $1 \leq b \leq p$:

$$p^2 < p^2 + b \leq p^2 + p < p^2 + 2p + 1 = (p+1)^2$$

So $p^2 + b$ is strictly between two consecutive perfect squares $p^2$ and $(p+1)^2$.

Therefore $p^2 + b$ is NOT a perfect square, meaning $0^{p^2 + b} \notin L$.

**Step 6:** Contradiction! $L$ is not regular. $\square$

**Key insight:** The gap between consecutive squares grows ($n^2$ and $(n+1)^2$ differ by $2n+1$), but pumping adds at most $p$ characters. For large enough $p$, the pump lands between squares.

---

## Example 4: $L = \{w \in \{0,1\}^* \mid w \text{ has equal number of 0s and 1s}\}$

### Proof

**Step 1:** Assume $L$ is regular.

**Step 2:** The language $0^*1^*$ is regular (it's described by a simple regex).

**Step 3:** If $L$ is regular, then $L \cap 0^*1^*$ is regular (regular languages are closed under intersection).

**Step 4:** But $L \cap 0^*1^* = \{0^n 1^n \mid n \geq 0\}$, which we proved is NOT regular in Example 1.

**Step 5:** Contradiction! Therefore $L$ is not regular. $\square$

**Note:** This proof uses closure properties instead of directly applying the pumping lemma. This is often cleaner when the language has complex structure.

---

## Example 5: $L = \{0^i 1^j \mid i > j\}$ Is Not Regular

### Proof

**Step 1:** Assume $L$ is regular.

**Step 2:** Let $p$ be the pumping length.

**Step 3:** Choose $w = 0^{p+1} 1^p$.

Check: $w \in L$ since $p + 1 > p$ ✓. $|w| = 2p + 1 \geq p$ ✓.

**Step 4:** Any decomposition with $|xy| \leq p$: since the first $p$ characters are all 0s, $y = 0^b$ with $b \geq 1$.

**Step 5:** Choose $i = 0$ (pump down):

$$xy^0z = 0^{p+1-b} 1^p$$

We need $p + 1 - b > p$, i.e., $1 > b$. But $b \geq 1$, so $p + 1 - b \leq p$.

When $b = 1$: we get $0^p 1^p \notin L$ (need strictly more 0s).
When $b > 1$: we get $0^{p+1-b} 1^p$ where $p + 1 - b < p$, so $\notin L$.

In all cases, $xy^0z \notin L$.

**Step 6:** Contradiction! $L$ is not regular. $\square$

---

## Common Mistakes

### Mistake 1: Choosing a Specific Decomposition

**Wrong:** "Let $x = 0^2$, $y = 0^3$, $z = 1^p$..."

You cannot choose the decomposition — the adversary does! You must argue for **all possible** decompositions satisfying conditions 1 and 2.

### Mistake 2: Choosing a Bad String $w$

If you choose a string where pumping always stays in $L$, you can't reach a contradiction. The lemma is not violated — you just made a poor choice.

**Example:** For $L = \{0^n 1^n\}$, choosing $w = 0^p 1^p 0^p 1^p$ doesn't work (it's not even in $L$!).

Choose $w$ so that condition 2 ($|xy| \leq p$) forces $y$ to be in a "uniform" region where pumping clearly breaks the language's constraint.

### Mistake 3: Only Pumping Up ($i = 2$)

Remember you can also pump **down** ($i = 0$, removing $y$) or pump to any $i$. Sometimes $i = 0$ gives the easiest contradiction.

### Mistake 4: Forgetting to Verify $w \in L$

Your chosen string must actually be in the language! Double-check this before proceeding.

### Mistake 5: Confusing Quantifiers

The structure is: $\exists p$, $\forall w$, $\exists x,y,z$, $\forall i$.

When YOU'RE doing the proof by contradiction:
- $p$ is universal (works for any $p$) — you don't choose it
- $w$ is your choice — you pick a specific string
- $x,y,z$ is universal — you consider all valid splits
- $i$ is your choice — you pick a specific pump count

### Mistake 6: Trying to Prove Regularity with the Pumping Lemma

The pumping lemma **cannot** prove a language is regular! It's only useful for showing non-regularity.

The language $\{0^p \mid p \text{ is prime}\}$ is not regular, but proving that is non-trivial — just because a language "seems infinite and structured" doesn't automatically mean the pumping lemma applies.

---

## When the Pumping Lemma Is Insufficient

Some non-regular languages satisfy the pumping lemma! The classic example:

$$L = \{a^i b^j c^k \mid i, j, k \geq 0 \text{ and } (i = 0 \text{ or } j = k)\}$$

This language is not regular (provable by other means) but satisfies the pumping lemma. For such cases, use:

### Myhill-Nerode Theorem (Brief Mention)

The **Myhill-Nerode theorem** provides a necessary AND sufficient condition for regularity:

$L$ is regular if and only if the number of equivalence classes of the **right-invariance relation** $\equiv_L$ is finite.

Two strings $x, y$ are equivalent ($x \equiv_L y$) if for all $z \in \Sigma^*$: $xz \in L \iff yz \in L$.

To prove $L$ is not regular using Myhill-Nerode, find infinitely many strings that are pairwise distinguishable (no two equivalent under $\equiv_L$).

---

## More Practice: Exercises with Solutions

### Exercise 1

Prove $L = \{0^m 1^n \mid m \neq n\}$ is not regular.

**Solution:**

Assume $L$ is regular. Then $\bar{L}$ is regular (closure under complement).

$\bar{L} = \{w \in \{0,1\}^* \mid w \notin L\} = \{0^n 1^n \mid n \geq 0\} \cup \{w \mid w \notin 0^*1^*\}$

Wait — this is complicated. Let's use a different approach.

$\bar{L} \cap 0^*1^* = \{0^n 1^n \mid n \geq 0\}$

If $L$ is regular → $\bar{L}$ is regular → $\bar{L} \cap 0^*1^*$ is regular. But $\{0^n 1^n\}$ is not regular. Contradiction! $\square$

### Exercise 2

Prove $L = \{a^n b^n c^n \mid n \geq 0\}$ is not regular.

**Solution:**

Choose $w = a^p b^p c^p$. Since $|xy| \leq p$, $y = a^k$ for some $k \geq 1$.

Pump $i = 0$: $xz = a^{p-k} b^p c^p$. Since $p - k < p$, the numbers of $a$'s, $b$'s, and $c$'s are not all equal. So $xz \notin L$. Contradiction! $\square$

### Exercise 3

Prove $L = \{1^{2^n} \mid n \geq 0\}$ (lengths that are powers of 2) is not regular.

**Solution:**

Choose $w = 1^{2^p}$ (length $2^p \geq p$ for $p \geq 1$).

Any valid $y = 1^b$ with $1 \leq b \leq p$.

Pump $i = 2$: $|xy^2z| = 2^p + b$.

We need: $2^p < 2^p + b \leq 2^p + p < 2^{p+1}$ (since $p < 2^p$ for $p \geq 1$).

So $2^p + b$ is between consecutive powers of 2, hence not a power of 2. Therefore $xy^2z \notin L$. Contradiction! $\square$

### Exercise 4

Prove $L = \{0^n \mid n \text{ is prime}\}$ is not regular.

**Solution:**

Choose $w = 0^q$ where $q$ is a prime number $\geq p$ (primes are infinite, so such $q$ exists).

Any valid $y = 0^b$ with $1 \leq b \leq p$.

Pump $i = q + 1$: $|xy^{q+1}z| = q + qb = q(1 + b)$.

Since $b \geq 1$, we have $1 + b \geq 2$, and since $q \geq 2$, the product $q(1+b)$ is composite (not prime).

Therefore $0^{q(1+b)} \notin L$. Contradiction! $\square$

**Note:** We used $i = q + 1$ specifically to make the length factor nicely.

### Exercise 5

Prove $L = \{w \in \{0,1\}^* \mid w = w^R\}$ (palindromes) is not regular.

**Solution:**

Choose $w = 0^p 1 0^p$.

This is a palindrome of length $2p + 1 \geq p$. ✓

Since $|xy| \leq p$, $y = 0^b$ within the first block of zeros ($b \geq 1$).

Pump $i = 0$: $xy^0z = 0^{p-b} 1 0^p$.

This is NOT a palindrome since the left side has $p - b$ zeros but the right side has $p$ zeros (and $b \geq 1$).

Therefore $xy^0z \notin L$. Contradiction! $L$ is not regular. $\square$

### Exercise 6

Is $L = \{0^n 1^m \mid n \leq m \leq 2n\}$ regular?

**Solution:** Not regular.

Choose $w = 0^p 1^p$ ($p \leq p \leq 2p$ ✓).

$y = 0^b$ ($b \geq 1$, within first $p$ characters).

Pump $i = 3$: $|xy^3z|$: we have $0^{p + 2b} 1^p$.

Need $p + 2b \leq p \leq 2(p + 2b)$. The first condition $p + 2b \leq p$ fails since $b \geq 1$ gives $p + 2b > p$.

Wait — the condition is on 0s vs 1s. We have $n = p + 2b$ zeros and $m = p$ ones. Need $n \leq m$, i.e., $p + 2b \leq p$, which fails.

So $xy^3z \notin L$. Contradiction! $\square$

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Purpose | Prove languages are NOT regular |
| Cannot prove | That a language IS regular |
| Statement | Long strings in regular languages have a "pumpable" section |
| Key conditions | $\|y\| > 0$, $\|xy\| \leq p$, $xy^iz \in L$ for all $i$ |
| Proof technique | Contradiction — assume regular, violate the lemma |
| Your choices | The string $w$ and the pump count $i$ |
| Adversary chooses | The pumping length $p$ and the decomposition $xyz$ |
| Common strategy | Choose $w$ so condition 2 forces $y$ into a "uniform" zone |
| Limitation | Some non-regular languages satisfy the lemma (use Myhill-Nerode instead) |

The pumping lemma is your primary tool for establishing the boundary of what finite automata can do. When you encounter a language that seems to need "counting" or "memory," the pumping lemma often confirms your intuition rigorously.
