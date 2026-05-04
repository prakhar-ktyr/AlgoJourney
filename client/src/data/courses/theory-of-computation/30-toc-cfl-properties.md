---
title: Properties of Context-Free Languages
---

# Properties of Context-Free Languages

In this lesson, you will learn about the **closure properties** and **decision properties** of context-free languages — what operations preserve context-freeness, and what questions about CFLs are algorithmically decidable.

---

## Closure Properties Overview

A class of languages is **closed** under an operation if applying that operation to language(s) in the class always produces another language in the class.

### Summary Table

| Operation | CFLs Closed? | Proof Method |
|-----------|:------------:|--------------|
| Union | ✓ Yes | Grammar construction |
| Concatenation | ✓ Yes | Grammar construction |
| Kleene Star | ✓ Yes | Grammar construction |
| Reversal | ✓ Yes | Grammar construction |
| Intersection with Regular | ✓ Yes | PDA × DFA product |
| Intersection | ✗ No | Counterexample |
| Complement | ✗ No | De Morgan's law argument |
| Difference | ✗ No | Follows from complement |

---

## Closed Under Union

**Theorem:** If $L_1$ and $L_2$ are context-free languages, then $L_1 \cup L_2$ is also context-free.

### Proof (Construction)

Let $G_1 = (V_1, \Sigma, R_1, S_1)$ generate $L_1$ and $G_2 = (V_2, \Sigma, R_2, S_2)$ generate $L_2$.

Assume $V_1 \cap V_2 = \emptyset$ (rename variables if needed).

Construct $G = (V_1 \cup V_2 \cup \{S\}, \Sigma, R_1 \cup R_2 \cup \{S \to S_1 \mid S_2\}, S)$

The new grammar:
- Introduces a fresh start symbol $S$
- $S$ can derive either $S_1$ or $S_2$
- From $S_1$, we generate any string in $L_1$
- From $S_2$, we generate any string in $L_2$

Therefore $L(G) = L_1 \cup L_2$. ∎

### Example

$L_1 = \{a^n b^n \mid n \geq 0\}$ with grammar $S_1 \to aS_1 b \mid \varepsilon$

$L_2 = \{b^n a^n \mid n \geq 0\}$ with grammar $S_2 \to bS_2 a \mid \varepsilon$

Union grammar: $S \to S_1 \mid S_2$, $S_1 \to aS_1 b \mid \varepsilon$, $S_2 \to bS_2 a \mid \varepsilon$

---

## Closed Under Concatenation

**Theorem:** If $L_1$ and $L_2$ are CFLs, then $L_1 \cdot L_2 = \{xy \mid x \in L_1, y \in L_2\}$ is also a CFL.

### Proof (Construction)

Using grammars $G_1$ and $G_2$ as before (with disjoint variables):

$$G = (V_1 \cup V_2 \cup \{S\}, \Sigma, R_1 \cup R_2 \cup \{S \to S_1 S_2\}, S)$$

The new start rule $S \to S_1 S_2$ forces:
- First, derive a string from $L_1$ (using $S_1$)
- Then, derive a string from $L_2$ (using $S_2$)
- The concatenation is in $L_1 \cdot L_2$

Therefore $L(G) = L_1 \cdot L_2$. ∎

---

## Closed Under Kleene Star

**Theorem:** If $L$ is a CFL, then $L^* = \{\varepsilon\} \cup L \cup LL \cup LLL \cup \ldots$ is also a CFL.

### Proof (Construction)

Let $G_1 = (V_1, \Sigma, R_1, S_1)$ generate $L$.

Construct $G = (V_1 \cup \{S\}, \Sigma, R_1 \cup \{S \to S_1 S \mid \varepsilon\}, S)$

The new rules:
- $S \to \varepsilon$ generates the empty string
- $S \to S_1 S$ generates one copy of $L$ followed by $S$ (recursively, zero or more additional copies)

Therefore $L(G) = L^*$. ∎

---

## Closed Under Reversal

**Theorem:** If $L$ is a CFL, then $L^R = \{w^R \mid w \in L\}$ is also a CFL.

### Proof (Construction)

Given grammar $G = (V, \Sigma, R, S)$ for $L$, construct $G^R = (V, \Sigma, R^R, S)$ where:

$$R^R = \{A \to \alpha^R \mid A \to \alpha \in R\}$$

Each rule's right-hand side is reversed.

**Why it works:** If $S \Rightarrow^* w$ in $G$ using some derivation, then $S \Rightarrow^* w^R$ in $G^R$ using the same rules (with reversed RHS).

### Example

Grammar for $\{a^n b^n\}$: $S \to aSb \mid \varepsilon$

Reversed: $S \to bSa \mid \varepsilon$

This generates $\{b^n a^n\} = \{a^n b^n\}^R$. ✓

---

## Closed Under Intersection with Regular Languages

**Theorem:** If $L$ is a CFL and $R$ is a regular language, then $L \cap R$ is a CFL.

This is one of the most **useful** closure properties in practice!

### Proof: Product Construction (PDA × DFA)

Let $P = (Q_P, \Sigma, \Gamma, \delta_P, q_P, Z_0, F_P)$ be a PDA for $L$ and $D = (Q_D, \Sigma, \delta_D, q_D, F_D)$ be a DFA for $R$.

Construct a new PDA $P' = (Q', \Sigma, \Gamma, \delta', q_0', Z_0, F')$ where:

**States:** $Q' = Q_P \times Q_D$ (all pairs)

**Start state:** $q_0' = (q_P, q_D)$

**Accept states:** $F' = F_P \times F_D$

**Transitions:** For each $\delta_P(q, a, X) \ni (r, \gamma)$ (where $a \in \Sigma$):

$$\delta'((q, s), a, X) \ni ((r, \delta_D(s, a)), \gamma)$$

For each $\varepsilon$-transition $\delta_P(q, \varepsilon, X) \ni (r, \gamma)$:

$$\delta'((q, s), \varepsilon, X) \ni ((r, s), \gamma)$$

(The DFA state doesn't change on $\varepsilon$-moves since no input is consumed.)

### Intuition

The product PDA:
- Simulates the original PDA in its first component
- Simultaneously simulates the DFA in its second component
- Accepts only when BOTH the PDA accepts (in $F_P$) AND the DFA accepts (in $F_D$)
- The stack belongs to the PDA component — it operates exactly as before

### Why Is This So Useful?

This property is a powerful tool for **proving languages are NOT context-free**:

1. Start with a language $L$ you suspect is not context-free
2. Find a regular language $R$ such that $L \cap R$ is "simpler" but still not context-free
3. If $L$ were context-free, then $L \cap R$ would be context-free (by this theorem)
4. Show $L \cap R$ is not context-free (e.g., using the pumping lemma)
5. Contradiction! Therefore $L$ is not context-free

### Example Application

**Claim:** $L = \{w \in \{a, b, c\}^* \mid \#_a(w) = \#_b(w) = \#_c(w)\}$ is not context-free.

**Proof:**
- Let $R = a^* b^* c^*$ (regular!)
- $L \cap R = \{a^n b^n c^n \mid n \geq 0\}$
- If $L$ were context-free, then $L \cap R$ would be context-free
- But $\{a^n b^n c^n\}$ is NOT context-free (pumping lemma)
- Contradiction! So $L$ is not context-free. ∎

---

## NOT Closed Under Intersection

**Theorem:** The class of context-free languages is NOT closed under intersection.

### Proof (Counterexample)

Consider:
$$L_1 = \{a^n b^n c^m \mid n, m \geq 0\}$$
$$L_2 = \{a^m b^n c^n \mid n, m \geq 0\}$$

**$L_1$ is context-free:**

Grammar: $S_1 \to AB$, $A \to aAb \mid \varepsilon$, $B \to cB \mid \varepsilon$

(Generate matched $a^n b^n$, then any number of $c$'s independently.)

**$L_2$ is context-free:**

Grammar: $S_2 \to CD$, $C \to aC \mid \varepsilon$, $D \to bDc \mid \varepsilon$

(Generate any number of $a$'s, then matched $b^n c^n$.)

**Their intersection:**

$$L_1 \cap L_2 = \{a^n b^n c^n \mid n \geq 0\}$$

A string must be in $a^* b^* c^*$ with $\#_a = \#_b$ (from $L_1$) AND $\#_b = \#_c$ (from $L_2$), so $\#_a = \#_b = \#_c$.

**But $\{a^n b^n c^n\}$ is NOT context-free** (proven via the pumping lemma for CFLs).

Therefore CFLs are NOT closed under intersection. ∎

---

## NOT Closed Under Complement

**Theorem:** The class of context-free languages is NOT closed under complement.

### Proof (By Contradiction Using De Morgan's Law)

Suppose CFLs were closed under complement. Then for any CFLs $L_1, L_2$:

$$L_1 \cap L_2 = \overline{\overline{L_1} \cup \overline{L_2}}$$

By De Morgan's law. If CFLs were closed under complement:
- $\overline{L_1}$ would be a CFL ✓ (by assumption)
- $\overline{L_2}$ would be a CFL ✓ (by assumption)
- $\overline{L_1} \cup \overline{L_2}$ would be a CFL ✓ (union closure)
- $\overline{\overline{L_1} \cup \overline{L_2}}$ would be a CFL ✓ (complement again)

This would mean $L_1 \cap L_2$ is always a CFL — but we just showed intersection doesn't preserve CFLs!

**Contradiction!** Therefore CFLs are NOT closed under complement. ∎

---

## NOT Closed Under Difference

**Theorem:** CFLs are not closed under set difference $L_1 - L_2 = L_1 \cap \overline{L_2}$.

### Proof

Note that $\overline{L} = \Sigma^* - L$. If CFLs were closed under difference:
- $\Sigma^*$ is context-free (it's even regular!)
- $\Sigma^* - L$ would be context-free for any CFL $L$
- This would mean CFLs are closed under complement

But we just proved they're NOT closed under complement. Contradiction! ∎

---

## Important Nuance: CFL ∩ Regular = CFL

Even though CFLs aren't closed under intersection with each other, they ARE closed under intersection with regular languages. This asymmetry is crucial:

$$\text{CFL} \cap \text{CFL} \not\subseteq \text{CFL}$$
$$\text{CFL} \cap \text{Regular} \subseteq \text{CFL}$$

The DFA adds no "extra power" that the PDA can't handle — it just filters states without needing the stack.

---

## Decision Properties of CFLs

A property is **decidable** if there exists an algorithm that always terminates and correctly answers the question.

### Decidable Problems

| Problem | Question | Algorithm |
|---------|----------|-----------|
| Membership | Is $w \in L$? | CYK algorithm: $O(n^3)$ |
| Emptiness | Is $L = \emptyset$? | Check if start symbol is "generating" |
| Finiteness | Is $L$ finite? | Check for cycles in the grammar |

### Membership: The CYK Algorithm

Given a grammar $G$ in CNF and a string $w$ with $|w| = n$:

The **Cocke-Younger-Kasami (CYK)** algorithm determines if $w \in L(G)$ in time $O(n^3 \cdot |G|)$.

**Idea:** Dynamic programming. Build a table $T[i][j]$ = set of variables that can derive the substring $w_i w_{i+1} \ldots w_j$.

**Base case:** $T[i][i] = \{A \mid A \to w_i \in R\}$

**Recursive case:**
$$T[i][j] = \{A \mid A \to BC \in R, \text{ and } \exists k: B \in T[i][k] \text{ and } C \in T[k+1][j]\}$$

**Accept:** $w \in L(G)$ iff $S \in T[1][n]$.

### Emptiness

**Algorithm:** Mark variables as "generating" (can derive a terminal string):
1. Initially mark all $A$ where $A \to w$ for some $w \in \Sigma^*$
2. Repeat: if $A \to \alpha$ and all variables in $\alpha$ are marked, mark $A$
3. $L(G) \neq \emptyset$ iff $S$ is marked

### Finiteness

**Algorithm:** After removing useless symbols:
1. Build a dependency graph: edge from $A$ to $B$ if $A \to \alpha B \beta$ for some $\alpha, \beta$
2. $L(G)$ is infinite iff this graph has a **cycle**
3. A cycle means some variable can derive itself with additional symbols → unbounded generation

---

### Undecidable Problems

| Problem | Question | Status |
|---------|----------|--------|
| Equivalence | Is $L(G_1) = L(G_2)$? | **Undecidable** |
| Inclusion | Is $L(G_1) \subseteq L(G_2)$? | **Undecidable** |
| Universality | Is $L(G) = \Sigma^*$? | **Undecidable** |
| Ambiguity | Is $G$ ambiguous? | **Undecidable** |
| Regularity | Is $L(G)$ regular? | **Undecidable** |
| Disjointness | Is $L(G_1) \cap L(G_2) = \emptyset$? | **Undecidable** |

### Why Universality is Undecidable

If we could decide "$L(G) = \Sigma^*$?", we could decide the complement emptiness problem:
- $L(G) = \Sigma^*$ iff $\overline{L(G)} = \emptyset$
- This would let us decide properties of complements of CFLs
- These problems can encode undecidable problems (like the Post Correspondence Problem)

### Why Equivalence is Undecidable

If we could decide equivalence:
- We could check if $L(G) = \Sigma^*$ (compare with the grammar for $\Sigma^*$)
- But universality is undecidable
- Contradiction!

---

## Comparison with Regular Languages

| Property | Regular | Context-Free |
|----------|:-------:|:------------:|
| Closed under union | ✓ | ✓ |
| Closed under concatenation | ✓ | ✓ |
| Closed under Kleene star | ✓ | ✓ |
| Closed under intersection | ✓ | ✗ |
| Closed under complement | ✓ | ✗ |
| Closed under difference | ✓ | ✗ |
| Membership decidable | ✓ | ✓ |
| Emptiness decidable | ✓ | ✓ |
| Equivalence decidable | ✓ | ✗ |
| Universality decidable | ✓ | ✗ |

Regular languages have much nicer closure and decision properties!

---

## Using Closure Properties: Proving Non-CFL

### Strategy: Intersection with Regular

To prove $L$ is not context-free:

1. Choose a regular language $R$ such that $L \cap R$ has a simpler structure
2. Show $L \cap R$ is not context-free (pumping lemma)
3. Conclude: if $L$ were CFL, then $L \cap R$ would be CFL (contradiction)
4. Therefore $L$ is not context-free

### Example 1

**Prove:** $L = \{a^n b^n c^n d^n \mid n \geq 0\}$ is not context-free.

- Let $R = a^* b^* c^* d^*$ (regular, and $L \subseteq R$, so $L \cap R = L$)
- Apply the pumping lemma directly to $L$
- Choose $s = a^p b^p c^p d^p$ where $p$ is the pumping length
- Any substring $vxy$ with $|vxy| \leq p$ spans at most two consecutive groups
- Pumping $uv^2 xy^2 z$ increases symbols in at most two groups, breaking the $n = n = n = n$ equality
- Therefore $L$ is not context-free ∎

### Example 2

**Prove:** $L = \{ww \mid w \in \{a, b\}^*\}$ is not context-free.

- Let $R = a^* b^* a^* b^*$ (regular)
- $L \cap R = \{a^m b^n a^m b^n \mid m, n \geq 0\}$
- Apply pumping lemma to $s = a^p b^p a^p b^p$
- The substring $vxy$ with $|vxy| \leq p$ can span at most one boundary between groups
- Pumping disrupts the required $m$-$n$-$m$-$n$ pattern
- Therefore $L \cap R$ is not context-free
- Since $R$ is regular and CFL ∩ Regular = CFL, $L$ cannot be context-free ∎

### Example 3

**Prove:** $L = \{a^i b^j c^k \mid i < j < k\}$ is not context-free.

- Let $R = a^* b^* c^*$ (regular, and $L \subseteq R$, so $L \cap R = L$)
- Choose $s = a^p b^{p+1} c^{p+2}$
- For pumping: $|vxy| \leq p$ means $vxy$ spans at most two groups
- **Case 1:** $vxy$ in $a^p b^{p+1}$ — pumping down could make $i \geq j$, violating $i < j$
- **Case 2:** $vxy$ in $b^{p+1} c^{p+2}$ — pumping down decreases $b$'s or $c$'s, could get $j \geq k$
- In each case, some pumped string violates the strict inequalities
- Therefore $L$ is not context-free ∎

---

## Closure Under Homomorphism and Inverse Homomorphism

### Closed Under Homomorphism

A **homomorphism** $h: \Sigma^* \to \Delta^*$ maps each symbol to a string and extends naturally:
$$h(a_1 a_2 \ldots a_n) = h(a_1) h(a_2) \ldots h(a_n)$$

**Theorem:** If $L$ is a CFL over $\Sigma$, then $h(L) = \{h(w) \mid w \in L\}$ is a CFL over $\Delta$.

**Proof:** Given grammar $G$ for $L$, replace each terminal $a$ in every rule with $h(a)$. The resulting grammar generates $h(L)$.

More precisely, if $G = (V, \Sigma, R, S)$, define $G' = (V, \Delta, R', S)$ where for each rule $A \to X_1 X_2 \ldots X_k$ in $R$:
- Replace each terminal $X_i = a$ with $h(a)$
- Keep each variable $X_i$ unchanged

Then $L(G') = h(L(G))$. ∎

### Closed Under Inverse Homomorphism

**Theorem:** If $L$ is a CFL over $\Delta$ and $h: \Sigma \to \Delta^*$ is a homomorphism, then $h^{-1}(L) = \{w \in \Sigma^* \mid h(w) \in L\}$ is a CFL.

**Proof sketch:** Construct a new PDA $P'$ that, on input symbol $a$, feeds the entire string $h(a)$ to the original PDA $P$ for $L$. The new PDA uses a buffer to store $h(a)$ and feeds it character by character to the simulated PDA.

---

## Substitution Closure

A **substitution** $s: \Sigma \to 2^{\Delta^*}$ maps each symbol to a language. Extend to strings: $s(a_1 \ldots a_n) = s(a_1) \cdot s(a_2) \cdots s(a_n)$.

**Theorem:** If $L$ is a CFL and $s(a)$ is a CFL for each $a \in \Sigma$, then $s(L) = \bigcup_{w \in L} s(w)$ is a CFL.

**Proof:** For each $a$, let $G_a$ generate $s(a)$ with start symbol $S_a$. In the grammar for $L$, replace each terminal $a$ with $S_a$ and add all rules from $G_a$. The result generates $s(L)$. ∎

Note: homomorphism is the special case where each $s(a) = \{h(a)\}$ is a singleton.

---

## Ogden's Lemma (Stronger Than Pumping)

While the pumping lemma is the primary tool for proving non-context-freeness, **Ogden's Lemma** is a stronger version that is sometimes needed:

**Ogden's Lemma:** For every CFL $L$, there exists $p > 0$ such that for any $s \in L$ with $|s| \geq p$, if we "mark" at least $p$ positions in $s$, then $s = uvxyz$ where:
1. $vxy$ contains at most $p$ marked positions
2. $vy$ contains at least 1 marked position
3. $uv^i xy^i z \in L$ for all $i \geq 0$

The ability to choose WHICH positions to mark gives more control than the standard pumping lemma.

---

## Exercises

### Exercise 1

Prove that if $L$ is context-free and $R$ is regular, then $L - R$ (set difference) is context-free.

**Hint:** $L - R = L \cap \overline{R}$. What can you say about $\overline{R}$?

### Exercise 2

Show that $\{a^n b^m c^n d^m \mid n, m \geq 0\}$ is not context-free using the intersection-with-regular technique.

### Exercise 3

Are the following decidable for CFLs? Justify each answer.
1. Is $|L| \geq 100$?
2. Is $L \cap R = \emptyset$ for regular $R$?
3. Is $L_1 \cap L_2 = \emptyset$ for CFLs $L_1, L_2$?

### Exercise 4

Let $L_1 = \{a^n b^n \mid n \geq 0\}$ and $L_2 = \{b^n c^n \mid n \geq 0\}$. Construct a grammar for $L_1 \cup L_2$ and for $L_1 \cdot L_2$.

### Exercise 5

Prove that the class of **deterministic** context-free languages (DCFLs) IS closed under complement.

**Hint:** For a DPDA, swap accept/reject behavior. Why doesn't this work for NPDAs?

### Exercise 6

Use closure properties to determine which of the following are context-free:
1. $\{a^n b^n\} \cup \{c^n d^n\}$
2. $\{a^n b^n\} \cap \{a^m b^{2m}\}$
3. $\{a^n b^n \mid n \geq 0\}^*$
4. $\overline{\{a^n b^n \mid n \geq 0\}}$ intersected with $a^* b^*$

### Exercise 7

Prove that the language $L = \{a^p \mid p \text{ is prime}\}$ is not context-free. Then use closure properties to show that $L' = \{a^n b^m \mid n + m \text{ is prime}\}$ is also not context-free.

**Hint:** For $L'$, intersect with a suitable regular language.

### Exercise 8

Let $h: \{a, b, c\}^* \to \{0, 1\}^*$ be defined by $h(a) = 01$, $h(b) = 10$, $h(c) = 11$. Given that $L = \{a^n b^n c^n\}$ is not a CFL, can you conclude anything about $h(L)$? What about $h^{-1}(M)$ for a CFL $M$?

---

## Summary

In this lesson, you learned:

- **Closure properties**: CFLs are closed under union, concatenation, star, reversal, and intersection with regular — but NOT under intersection, complement, or difference
- **The product construction**: PDA × DFA proves closure under intersection with regular
- **Non-closure counterexample**: $\{a^n b^n c^m\} \cap \{a^m b^n c^n\} = \{a^n b^n c^n\}$ (not CFL)
- **Decision properties**: Membership, emptiness, and finiteness are decidable; equivalence, universality, and ambiguity are not
- **Proof technique**: Intersect with regular to simplify, then use pumping lemma

---

## Key Formulas

| Result | Statement |
|--------|-----------|
| CFL ∩ Regular = CFL | Product PDA construction |
| CFL ∩ CFL ≠ CFL always | $\{a^nb^nc^m\} \cap \{a^mb^nc^n\} = \{a^nb^nc^n\}$ |
| ¬(CFL closed under complement) | Follows from ¬(CFL ∩ CFL = CFL) + De Morgan |
| Membership | CYK: $O(n^3 \cdot |G|)$ |
| Emptiness | Reachability: mark generating variables |

---

*Next lesson: We'll study the Pumping Lemma for Context-Free Languages — the key tool for proving languages are NOT context-free!*
