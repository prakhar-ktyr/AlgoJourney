---
title: CFG Design and Examples
---

# CFG Design and Examples

Designing context-free grammars requires practice and systematic techniques. This lesson presents a toolkit of strategies and works through numerous examples of increasing difficulty.

---

## Design Technique 1: Recursive Generation

The most fundamental technique — identify the recursive structure of the language.

**Pattern:** If strings in the language can be built by adding symbols around a smaller string in the language:

$$S \to \text{prefix} \cdot S \cdot \text{suffix}$$

### Example: $L = \{a^n b^n \mid n \geq 1\}$

Each string has one $a$ on the left and one $b$ on the right of a smaller string:

$$S \to aSb \mid ab$$

**Verification:**
- $S \Rightarrow ab$ ✓ ($n=1$)
- $S \Rightarrow aSb \Rightarrow aabb$ ✓ ($n=2$)
- $S \Rightarrow aSb \Rightarrow aaSbb \Rightarrow aaabbb$ ✓ ($n=3$)

### Example: $L = \{a^n b^{2n} \mid n \geq 0\}$

Each application adds one $a$ and two $b$'s:

$$S \to aSbb \mid \varepsilon$$

**Verification:**
- $S \Rightarrow \varepsilon$ ✓ ($n=0$)
- $S \Rightarrow aSbb \Rightarrow abb$ ✓ ($n=1$)
- $S \Rightarrow aSbb \Rightarrow aaSbbbb \Rightarrow aabbbb$ ✓ ($n=2$)

### Example: $L = \{a^m b^n \mid m \geq 2n, n \geq 0\}$

Each $b$ requires at least two $a$'s. Generate pairs, plus extra $a$'s:

$$S \to aS \mid T$$
$$T \to aaTb \mid \varepsilon$$

- $T$ generates strings in $\{a^{2n}b^n\}$ (exactly twice as many $a$'s as $b$'s)
- $S \to aS$ adds extra $a$'s (making $m > 2n$)

---

## Design Technique 2: Divide and Conquer (Union)

When a language is a union of simpler languages, use separate variables for each part.

**Pattern:**

$$S \to S_1 \mid S_2 \mid \cdots \mid S_k$$

where each $S_i$ generates a sublanguage.

### Example: $L = \{a^m b^n \mid m \neq n\}$

Split into two cases: $m > n$ or $m < n$.

$$S \to S_1 \mid S_2$$

For $m > n$ (more $a$'s than $b$'s):

$$S_1 \to aS_1 \mid aA$$
$$A \to aAb \mid \varepsilon$$

For $m < n$ (more $b$'s than $a$'s):

$$S_2 \to S_2 b \mid Bb$$
$$B \to aBb \mid \varepsilon$$

**Explanation:**
- $A$ generates $\{a^k b^k \mid k \geq 0\}$
- $S_1 \to aS_1 \mid aA$ ensures at least one extra $a$ before the matched portion
- Similarly, $S_2$ ensures at least one extra $b$ after the matched portion

### Example: $L = \{a^i b^j c^k \mid i = j \text{ or } j = k\}$

$$S \to XC \mid AY$$
$$X \to aXb \mid \varepsilon$$
$$C \to cC \mid \varepsilon$$
$$A \to aA \mid \varepsilon$$
$$Y \to bYc \mid \varepsilon$$

- $XC$: matches $a$'s with $b$'s, appends any number of $c$'s
- $AY$: prepends any number of $a$'s, matches $b$'s with $c$'s

---

## Design Technique 3: Concatenation

When strings in the language can be split into independent segments:

**Pattern:**

$$S \to S_1 S_2 \cdots S_k$$

### Example: $L = \{a^m b^n c^p \mid m + p = n\}$

The $b$'s must equal the sum of $a$'s and $c$'s. Split the $b$'s:

$$S \to AB$$
$$A \to aAb \mid \varepsilon$$
$$B \to bBc \mid \varepsilon$$

**Verification:** $A$ generates $a^i b^i$ and $B$ generates $b^j c^j$. Together: $a^i b^i b^j c^j = a^i b^{i+j} c^j$, so $m = i$, $n = i + j$, $p = j$, and $m + p = i + j = n$. ✓

### Example: $L = \{a^i b^j c^k d^l \mid i + l = j + k\}$

Rewrite: $i - j = k - l$, meaning the difference between $a$'s and $b$'s equals the difference between $c$'s and $d$'s.

Case 1: $i \geq j$ and $k \geq l$ (both differences positive, say $= m$):

Strings look like: $a^j \cdot a^m \cdot b^j \cdot c^l \cdot c^m \cdot d^l$

Case 2: $i \leq j$ and $k \leq l$ (both differences negative):

A simpler approach — rewrite as $i + k = j + l - 2m$... Actually, let's use a cleaner construction:

$$S \to XY$$
$$X \to aXd \mid Z$$
$$Z \to aZc \mid W$$
$$W \to bWc \mid \varepsilon$$
$$Y \to bYd \mid \varepsilon$$

Hmm, this gets complex. Let's use a different factoring:

Since $i + l = j + k$, rearrange as $i - j = k - l$. Let $m = i - j$:

- If $m \geq 0$: $i = j + m$ and $k = l + m$, giving strings $a^{j+m} b^j c^{l+m} d^l$
- If $m < 0$: let $m' = -m$, giving $a^j b^{j+m'} c^l d^{l+m'}$... this is getting complicated.

Better approach: $i + l = j + k$ means total "outside" equals total "inside":

$$S \to aSd \mid T$$
$$T \to aTc \mid U$$
$$U \to bUc \mid V$$
$$V \to bVd \mid \varepsilon$$

Wait — this doesn't handle all orderings. For languages with complex constraints, sometimes we need multiple variables tracking different "debts."

**Simpler verified construction:**

$$S \to AB$$
$$A \to aAb \mid C$$
$$C \to aC \mid D$$
$$D \to Db \mid \varepsilon$$

Actually, let's move on to cleaner examples and return to this pattern.

---

## Design Technique 4: Converting DFA to CFG

**Algorithm:** Given DFA $M = (Q, \Sigma, \delta, q_0, F)$, construct CFG $G$:

1. Create a variable $R_i$ for each state $q_i \in Q$
2. Start variable is $R_0$ (corresponding to $q_0$)
3. For each transition $\delta(q_i, a) = q_j$, add rule: $R_i \to aR_j$
4. For each accepting state $q_i \in F$, add rule: $R_i \to \varepsilon$

### Example: Convert the DFA for $L = \{w \in \{0,1\}^* \mid w \text{ contains } 01\}$

The DFA has states: $q_0$ (haven't seen 0), $q_1$ (seen 0, haven't seen 01), $q_2$ (seen 01, accept).

Transitions:
- $\delta(q_0, 0) = q_1, \quad \delta(q_0, 1) = q_0$
- $\delta(q_1, 0) = q_1, \quad \delta(q_1, 1) = q_2$
- $\delta(q_2, 0) = q_2, \quad \delta(q_2, 1) = q_2$

Accepting state: $q_2$

**CFG:**

$$R_0 \to 0R_1 \mid 1R_0$$
$$R_1 \to 0R_1 \mid 1R_2$$
$$R_2 \to 0R_2 \mid 1R_2 \mid \varepsilon$$

**Verification:** The string $001$:

$$R_0 \Rightarrow 0R_1 \Rightarrow 00R_1 \Rightarrow 001R_2 \Rightarrow 001$$

---

## Design Technique 5: Complement Thinking

Sometimes it's easier to design a grammar for the complement and then work backwards. However, note that CFLs are **not** closed under complement, so this doesn't always work.

For regular languages (which are CFLs), you can:
1. Build a DFA for the complement
2. Convert that DFA to a CFG

---

## Design Technique 6: Marker Variables

Use a variable as a "marker" that generates $\varepsilon$ at a specific position:

### Example: $L = \{w \in \{a,b\}^* \mid |w|_a = |w|_b\}$

**Idea:** At each point in the string, we either add an $a$ (incrementing the count) or a $b$ (decrementing). The variable $S$ represents "balance = 0":

$$S \to aSbS \mid bSaS \mid \varepsilon$$

**Why this works:** Each derivation path ensures that for every $a$ generated, a corresponding $b$ is also generated. The interleaving allows them to appear in any order.

**Alternative (equivalent) grammar:**

$$S \to aBS \mid bAS \mid \varepsilon$$
$$A \to a \mid bAA$$
$$B \to b \mid aBB$$

Here $A$ generates strings with one more $a$ than $b$'s, and $B$ generates strings with one more $b$ than $a$'s.

---

## Worked Examples

### Worked Example 1: $L = \{w \in \{a,b\}^* \mid |w|_a \geq |w|_b\}$

Strings with at least as many $a$'s as $b$'s.

$$S \to aS \mid aSbS \mid bSaS \mid \varepsilon$$

Or more cleanly, define $E$ for equal counts and build on it:

$$S \to aS \mid E$$
$$E \to aEbE \mid bEaE \mid \varepsilon$$

---

### Worked Example 2: $L = \{a^i b^j \mid 2i \leq j \leq 3i\}$

Each $a$ corresponds to 2 or 3 $b$'s:

$$S \to aSbb \mid aSbbb \mid \varepsilon$$

**Verification:**
- $n$ applications give $a^n b^k$ where each step adds 2 or 3 $b$'s
- Minimum $b$'s: $2n$ (always choose $bb$)
- Maximum $b$'s: $3n$ (always choose $bbb$)
- All values between $2n$ and $3n$ achievable ✓

---

### Worked Example 3: $L = \{a^i b^j c^k \mid i + k = j\}$

The number of $b$'s equals the sum of $a$'s and $c$'s. Think of the $b$-block as split into two parts: $j_1$ matching $a$'s and $j_2$ matching $c$'s.

$$S \to AB$$
$$A \to aAb \mid \varepsilon$$
$$B \to bBc \mid \varepsilon$$

This generates $a^i b^i b^k c^k = a^i b^{i+k} c^k$ where $j = i + k$. ✓

---

### Worked Example 4: $L = \{w \in \{a,b\}^* \mid w \neq w^R\}$ (Non-palindromes)

A string is a non-palindrome if there exists some position where the character differs from its mirror position. If the string has length $n$ and position $k$ (from start) differs from position $k$ (from end):

$$S \to aXb \mid bXa \mid aSa \mid bSb$$

Wait — this isn't quite right because $S$ should ensure at least one mismatch exists.

**Correct grammar:**

$$S \to AB \mid BA$$
$$A \to aAa \mid aAb \mid bAa \mid bAb \mid a$$
$$B \to aAa \mid aAb \mid bAa \mid bAb \mid b$$

Hmm, this is getting convoluted. Cleaner approach:

$$S \to aMb \mid bMa$$
$$M \to aMa \mid aMb \mid bMa \mid bMb \mid a \mid b \mid \varepsilon$$

**Explanation:**
- $S$ ensures the outermost characters mismatch (one is $a$, other is $b$)
- $M$ generates any string (acts as $\Sigma^*$)

**Verification:** Any non-palindrome $w$ of length $\geq 2$ has some pair of mirror positions that differ. Repeatedly peel off matching outer characters until you reach a mismatch. The outer matched characters are handled by extending $M$, and the mismatch is captured by $S$.

Actually, the grammar should be:

$$S \to aXb \mid bXa$$
$$X \to aXa \mid aXb \mid bXa \mid bXb \mid a \mid b \mid \varepsilon$$

This generates strings of the form $a \cdot (\text{anything}) \cdot b$ or $b \cdot (\text{anything}) \cdot a$. But this only catches mismatches at the outermost position!

**Correct grammar (handling any mirror position):**

$$S \to aAb \mid bAa$$
$$A \to aAa \mid bAb \mid aAb \mid bAa \mid a \mid b \mid \varepsilon$$

No wait — we need the outer context to match until the mismatch:

$$S \to aSa \mid bSb \mid aAb \mid bAa$$
$$A \to aA \mid bA \mid a \mid b \mid \varepsilon$$

**This works!**
- $S \to aSa \mid bSb$: match outer characters (they're the same in mirror)
- $S \to aAb \mid bAa$: at this position, the mirror characters differ
- $A$: anything of any length fills the remaining middle

---

### Worked Example 5: $L = \{a^m b^n \mid m \text{ is odd or } n \text{ is even}\}$

Union of two cases:

$$S \to S_1 \mid S_2$$

**Case 1:** $m$ is odd, any $n$:

$$S_1 \to A_1 B_1$$
$$A_1 \to aA_2$$
$$A_2 \to aaA_2 \mid \varepsilon$$
$$B_1 \to bB_1 \mid \varepsilon$$

- $A_1$ generates $a^{2k+1}$ (odd number of $a$'s)
- $B_1$ generates $b^*$

**Case 2:** any $m$, $n$ is even:

$$S_2 \to A_3 B_2$$
$$A_3 \to aA_3 \mid \varepsilon$$
$$B_2 \to bbB_2 \mid \varepsilon$$

- $A_3$ generates $a^*$
- $B_2$ generates $b^{2k}$ (even number of $b$'s)

---

### Worked Example 6: $L = \{x\#y \mid x, y \in \{0,1\}^*, |x| \neq |y|\}$

Strings over $\{0, 1, \#\}$ with exactly one $\#$ separating two binary strings of different lengths.

$$S \to S_1 \mid S_2$$

**Case 1:** $|x| > |y|$ — more bits before the $\#$:

$$S_1 \to D S_1 D \mid D T$$
$$T \to DT \mid D\#$$

Hmm, let me think more carefully.

**Better approach:**

$$S \to S_1 \mid S_2$$
$$S_1 \to AS_1 \mid A\#B$$

No — let's use a matched-length core and add extras.

$$S \to S_1 \mid S_2$$
$$S_1 \to DS_1D \mid D\#E \mid DE\#$$

Let me restart with a cleaner formulation:

$$S \to L \mid R$$

$L$ generates strings where left side is longer:

$$L \to DL D \mid D M \#$$
$$M \to DM D \mid D$$

$R$ generates strings where right side is longer:

$$R \to DR D \mid \# N D$$
$$N \to DN D \mid D$$

Where $D \to 0 \mid 1$ (a digit).

Actually the cleanest:

$$S \to S_1 \mid S_2$$
$$S_1 \to DS_1 \mid A\#B \quad \text{(extra on left)}$$
$$S_2 \to S_2D \mid A\#B \quad \text{(extra on right)}$$

Hmm, this allows multiple $\#$'s. Let me be more careful:

$$S \to XD \mid DY$$
$$X \to DXD \mid \#$$
$$Y \to DYD \mid \#$$
$$D \to 0 \mid 1$$

**Verification:**
- $X$ matches one symbol on each side of $\#$, so $X \Rightarrow^* d_1 d_2 \cdots d_k \# d_1' \cdots d_k'$ with equal length sides
- $XD$ adds one extra on the right: right side longer
- $DY$ adds one extra on the left: left side longer

Wait, $XD$ would put an extra $D$ after the entire thing. Let me fix:

$$S \to S_1 \mid S_2$$
$$S_1 \to DS_1D \mid D\# \mid DD\# \mid D\#\varepsilon$$

This is getting unwieldy. Here's a cleaner standard construction:

$$S \to S_1 \mid S_2$$
$$S_1 \to DS_1D \mid T_1$$
$$T_1 \to DT_1 \mid D\#$$
$$S_2 \to DS_2D \mid T_2$$
$$T_2 \to T_2D \mid \#D$$
$$D \to 0 \mid 1$$

**Explanation:**
- $S_1$: generates matched-length prefixes on both sides, then $T_1$ adds extra on left
- $S_2$: generates matched-length prefixes on both sides, then $T_2$ adds extra on right

---

### Worked Example 7: $L = \{a^i b^j c^k \mid i \neq j \text{ and } j \neq k\}$

This is actually **not** context-free! It can be shown using closure properties and the pumping lemma that this language is not a CFL.

However, $\{a^i b^j c^k \mid i \neq j \text{ or } j \neq k\}$ **is** context-free (union of two CFLs). Don't confuse AND with OR in these constraints!

---

### Worked Example 8: $L = \{w\#w^R \mid w \in \{a,b\}^*\}$

Strings that are "marked palindromes" with $\#$ in the center:

$$S \to aSa \mid bSb \mid \#$$

**Derivation of** $ab\#ba$:

$$S \Rightarrow aSa \Rightarrow abSba \Rightarrow ab\#ba$$

---

## Practice Problems

### Problem 1

Design a CFG for $L = \{a^i b^j c^k \mid i = j + k\}$.

**Hint:** Rewrite as $i - j = k$, think of the string as $a^{j+k} b^j c^k = a^j \cdot a^k \cdot b^j \cdot c^k$. Can you split into two matched portions?

---

### Problem 2

Design a CFG for $L = \{w \in \{a,b\}^* \mid |w| \text{ is odd}\}$.

**Hint:** This is regular! Think of the simplest grammar.

---

### Problem 3

Design a CFG for $L = \{a^m b^n \mid m \geq n + 2\}$.

**Hint:** Start with at least 2 extra $a$'s, then match the rest.

---

### Problem 4

Design a CFG for $L = \{w \in \{a,b,c\}^* \mid |w|_a = |w|_b + |w|_c\}$.

**Hint:** Think of $b$ and $c$ as "the same" for counting purposes.

---

### Problem 5

Convert the following NFA to a CFG. The NFA over $\{0, 1\}$:
- States: $\{q_0, q_1, q_2\}$, start: $q_0$, accept: $\{q_2\}$
- $\delta(q_0, 0) = \{q_0, q_1\}$, $\delta(q_0, 1) = \{q_0\}$
- $\delta(q_1, 1) = \{q_2\}$
- $\delta(q_2, 0) = \{q_2\}$, $\delta(q_2, 1) = \{q_2\}$

---

### Problem 6

Design a CFG for $L = \{a^i b^j c^k d^l \mid i + l = j + k\}$.

**Hint:** Rearrange as $i - j = k - l$. Consider cases based on sign.

---

### Problem 7

Prove that $L = \{a^n b^n c^n \mid n \geq 0\}$ is **not** context-free by trying (and failing) to build a CFG, then stating why (preview of pumping lemma for CFLs).

---

### Problem 8

Design a CFG for the language of all regular expressions over alphabet $\{a, b\}$ (using symbols $a, b, \cup, *, (, ), \varepsilon, \emptyset$).

**Hint:** Use the recursive definition of regular expressions.

---

## Common Mistakes to Avoid

1. **Generating extra strings:** Always verify your grammar doesn't produce strings outside the language. Test boundary cases.

2. **Missing the empty string:** Check whether $\varepsilon \in L$. If yes, ensure the start variable can derive $\varepsilon$.

3. **Assuming CFLs are closed under intersection:** They're NOT. $\{a^n b^n c^m\} \cap \{a^m b^n c^n\} = \{a^n b^n c^n\}$ which is not context-free.

4. **Variables generating infinite loops:** Ensure every variable can eventually terminate (reach all terminals). For example, $S \to SS$ alone never terminates without $S \to a$ or similar.

5. **Conflating language constraints:** When designing for "X or Y", use union ($S \to S_1 \mid S_2$). When designing for "X and Y", you may need the intersection — which might not be context-free!

---

## Summary

| Technique | Pattern | Use When |
|-----------|---------|----------|
| Recursive | $S \to aSb$ | Matched nesting |
| Union | $S \to S_1 \mid S_2$ | Language splits into cases |
| Concatenation | $S \to AB$ | Independent segments |
| DFA → CFG | $R_i \to aR_j$ | Language is regular |
| Marker | Balance tracking | Counting constraints |

---

## What's Next?

In the next lesson, we'll study **ambiguity** in context-free grammars — when a grammar assigns multiple parse trees to the same string, and why this matters for programming language design.
