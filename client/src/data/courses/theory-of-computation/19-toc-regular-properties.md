---
title: Properties of Regular Languages
---

# Properties of Regular Languages

In this lesson, you'll learn about the **closure properties** and **decision properties** of regular languages. These are powerful tools that let you prove languages are regular (by constructing them from known regular languages) and answer questions about them algorithmically.

---

## Why Properties Matter

Knowing the properties of regular languages helps you:

1. **Prove** a language is regular by constructing it from regular building blocks
2. **Answer questions** about languages algorithmically (Is it empty? Are two languages equal?)
3. **Optimize** automata and regular expressions in compilers and tools
4. **Build complex recognizers** by combining simpler ones

---

## Closure Properties

A class of languages is **closed under an operation** if applying that operation to languages in the class always produces another language in the same class.

**Regular languages are closed under all the following operations:**

---

### 1. Union: $L_1 \cup L_2$

**Theorem:** If $L_1$ and $L_2$ are regular, then $L_1 \cup L_2$ is regular.

**Proof (NFA method):** Given NFAs $N_1$ for $L_1$ and $N_2$ for $L_2$, build a new NFA:
- New start state with $\varepsilon$-transitions to starts of $N_1$ and $N_2$
- Accept if either $N_1$ or $N_2$ accepts

This is exactly the Thompson union construction.

**Proof (DFA product construction):** Given DFAs $M_1 = (Q_1, \Sigma, \delta_1, q_{0,1}, F_1)$ and $M_2 = (Q_2, \Sigma, \delta_2, q_{0,2}, F_2)$:

Build the **product DFA** $M = (Q_1 \times Q_2, \Sigma, \delta, (q_{0,1}, q_{0,2}), F)$ where:

$$\delta((q_i, q_j), a) = (\delta_1(q_i, a), \delta_2(q_j, a))$$

For union: $F = (F_1 \times Q_2) \cup (Q_1 \times F_2)$

Accept when **either** component is in an accept state.

---

### 2. Intersection: $L_1 \cap L_2$

**Theorem:** If $L_1$ and $L_2$ are regular, then $L_1 \cap L_2$ is regular.

**Proof (Product construction):** Same product DFA as for union, but with:

$$F = F_1 \times F_2$$

Accept only when **both** components are in accept states.

**Example:** Let $L_1$ = "strings with even length" and $L_2$ = "strings starting with $a$". Both regular, so $L_1 \cap L_2$ = "even-length strings starting with $a$" is also regular.

---

### 3. Complement: $\bar{L} = \Sigma^* - L$

**Theorem:** If $L$ is regular, then $\bar{L} = \{w \in \Sigma^* \mid w \notin L\}$ is regular.

**Proof:** Given a **DFA** $M = (Q, \Sigma, \delta, q_0, F)$ for $L$:

Build DFA $M' = (Q, \Sigma, \delta, q_0, Q - F)$

Simply **swap** accept and non-accept states! A string rejected by $M$ is accepted by $M'$ and vice versa.

**Important:** This only works with a **complete DFA** (every state has a transition for every symbol). If using an NFA, first convert to a DFA, then complement.

**Why NFA complementation doesn't work directly:** You can't just swap states in an NFA because:
- An NFA accepts if **some** path leads to accept
- Swapping makes it accept if **some** path leads to a (formerly non-accept) state
- This is NOT the same as rejecting all strings that were previously accepted

---

### 4. Concatenation: $L_1 \cdot L_2$

**Theorem:** If $L_1$ and $L_2$ are regular, then $L_1 \cdot L_2 = \{xy \mid x \in L_1, y \in L_2\}$ is regular.

**Proof:** Given NFAs $N_1$ and $N_2$:
- Connect accept states of $N_1$ to start of $N_2$ via $\varepsilon$-transitions
- Start state is start of $N_1$
- Accept states are accept states of $N_2$

This is Thompson's concatenation construction.

---

### 5. Kleene Star: $L^*$

**Theorem:** If $L$ is regular, then $L^* = \{\varepsilon\} \cup L \cup LL \cup LLL \cup \cdots$ is regular.

**Proof:** Given NFA $N$ for $L$:
- Add new start state (also an accept state, for $\varepsilon$)
- $\varepsilon$-transition from new start to old start
- $\varepsilon$-transitions from old accept states back to old start (for repetition)

This is Thompson's star construction.

---

### 6. Difference: $L_1 - L_2$

**Theorem:** If $L_1$ and $L_2$ are regular, then $L_1 - L_2$ is regular.

**Proof:** Use the identity:

$$L_1 - L_2 = L_1 \cap \bar{L_2}$$

Since regular languages are closed under complement and intersection, the difference is also regular.

Alternatively, use the product construction with:

$$F = F_1 \times (Q_2 - F_2)$$

Accept when the first component accepts AND the second rejects.

---

### 7. Reversal: $L^R$

**Theorem:** If $L$ is regular, then $L^R = \{w^R \mid w \in L\}$ is regular (where $w^R$ is $w$ written backwards).

**Proof:** Given an NFA $N = (Q, \Sigma, \delta, q_0, F)$ for $L$:

Build NFA $N^R$:
1. **Reverse all transitions:** if $q_j \in \delta(q_i, a)$, then add $q_i \in \delta^R(q_j, a)$
2. **Swap start and accept:** 
   - New start state with $\varepsilon$-transitions to all states in $F$ (old accepts)
   - New accept state is the old start $q_0$

The reversed NFA accepts exactly the reversal of $L$.

**Example:** If $L = \{ab, abc\}$, then $L^R = \{ba, cba\}$.

---

### 8. Homomorphism

**Definition:** A **homomorphism** is a function $h: \Sigma \to \Gamma^*$ that maps each symbol to a string. It extends to strings: $h(a_1 a_2 \cdots a_n) = h(a_1)h(a_2) \cdots h(a_n)$.

**Theorem:** If $L$ is regular and $h$ is a homomorphism, then $h(L) = \{h(w) \mid w \in L\}$ is regular.

**Proof:** Given NFA $N$ for $L$, replace each transition on symbol $a$ with a path spelling out $h(a)$. The result is an NFA for $h(L)$.

**Example:** Let $\Sigma = \{0, 1\}$, $\Gamma = \{a, b\}$, $h(0) = ab$, $h(1) = \varepsilon$.

If $L = \{01, 10\}$, then $h(L) = \{ab \cdot \varepsilon, \varepsilon \cdot ab\} = \{ab\}$.

---

### 9. Inverse Homomorphism

**Theorem:** If $L$ is regular over $\Gamma$ and $h: \Sigma \to \Gamma^*$, then $h^{-1}(L) = \{w \in \Sigma^* \mid h(w) \in L\}$ is regular.

**Proof:** Given DFA $M = (Q, \Gamma, \delta, q_0, F)$ for $L$:

Build DFA $M' = (Q, \Sigma, \delta', q_0, F)$ where:

$$\delta'(q, a) = \hat{\delta}(q, h(a))$$

That is, on input symbol $a$, simulate reading the entire string $h(a)$ in the original DFA.

The new DFA has the **same states and accept states** as the original — only the transitions change!

---

## The Product Construction in Detail

The product (cross-product) construction is one of the most useful techniques. Let's examine it carefully.

### Setup

Given two DFAs:
- $M_1 = (Q_1, \Sigma, \delta_1, q_{0,1}, F_1)$ with $|Q_1| = m$
- $M_2 = (Q_2, \Sigma, \delta_2, q_{0,2}, F_2)$ with $|Q_2| = n$

### The Product DFA

$$M = (Q_1 \times Q_2, \Sigma, \delta, (q_{0,1}, q_{0,2}), F)$$

- **States:** All pairs $(q_i, q_j)$ where $q_i \in Q_1$ and $q_j \in Q_2$. Total: $m \times n$ states.

- **Transition function:**
$$\delta((q_i, q_j), a) = (\delta_1(q_i, a), \delta_2(q_j, a))$$

Both components advance simultaneously on the same input symbol.

- **Start state:** $(q_{0,1}, q_{0,2})$

- **Accept states** depend on the operation:

| Operation | Accept states $F$ |
|-----------|-------------------|
| $L_1 \cap L_2$ | $F_1 \times F_2 = \{(q_i, q_j) \mid q_i \in F_1 \text{ and } q_j \in F_2\}$ |
| $L_1 \cup L_2$ | $(F_1 \times Q_2) \cup (Q_1 \times F_2)$ |
| $L_1 - L_2$ | $F_1 \times (Q_2 - F_2)$ |
| $L_1 \oplus L_2$ (symmetric diff) | $(F_1 \times (Q_2 - F_2)) \cup ((Q_1 - F_1) \times F_2)$ |

### Example: Intersection

Let's intersect two languages over $\Sigma = \{0, 1\}$:
- $L_1$: strings with even number of 0s (DFA with states $\{E, O\}$, start $E$, accept $\{E\}$)
- $L_2$: strings ending in 1 (DFA with states $\{A, B\}$, start $A$, accept $\{B\}$)

Product DFA states: $\{(E,A), (E,B), (O,A), (O,B)\}$

| State | On 0 | On 1 |
|-------|------|------|
| $(E,A)$ | $(O,A)$ | $(E,B)$ |
| $(E,B)$ | $(O,A)$ | $(E,B)$ |
| $(O,A)$ | $(E,A)$ | $(O,B)$ |
| $(O,B)$ | $(E,A)$ | $(O,B)$ |

Start: $(E,A)$. Accept: $F_1 \times F_2 = \{E\} \times \{B\} = \{(E,B)\}$.

This DFA accepts strings with an even number of 0s AND ending in 1.

---

## Decision Properties

**Decision properties** are questions about regular languages that can be answered algorithmically. For regular languages, many important questions are **decidable** (we can write an algorithm to answer them).

### 1. Membership: Is $w \in L(M)$?

**Algorithm:** Simulate the DFA on input $w$. Accept if we end in an accept state.

**Time complexity:** $O(|w|)$ — just follow transitions.

This is the fundamental operation of a DFA!

### 2. Emptiness: Is $L(M) = \emptyset$?

**Algorithm:** Check if any accept state is **reachable** from the start state.

Use BFS/DFS from the start state. If we can reach any state in $F$, the language is non-empty.

**Time complexity:** $O(|Q| + |\delta|)$ — graph reachability.

**Alternative:** $L(M) = \emptyset$ if and only if no string of length less than $|Q|$ is accepted (by pigeonhole). But the reachability check is faster.

### 3. Finiteness: Is $L(M)$ Finite?

**Algorithm:** Check if there is a **cycle** on any path from the start state to an accept state.

1. Find all states reachable from start
2. Find all states from which an accept state is reachable
3. Intersect these sets (call it $U$ — "useful" states)
4. Check if the subgraph on $U$ contains a cycle

If there's a cycle among useful states, the language is **infinite**. Otherwise, it's finite.

**Time complexity:** $O(|Q| + |\delta|)$

**Alternative characterization:** $L(M)$ is infinite if and only if there exists a string $w \in L$ with $|Q| \leq |w| < 2|Q|$.

### 4. Universality: Is $L(M) = \Sigma^*$?

**Algorithm:** Check if $\bar{L(M)} = \emptyset$.

1. Complement the DFA (swap accept/non-accept states)
2. Check if the complement is empty

If the complement is empty, the original language is universal ($\Sigma^*$).

**Time complexity:** $O(|Q| + |\delta|)$

### 5. Equivalence: Is $L(M_1) = L(M_2)$?

**Algorithm 1 — Symmetric difference:**

$$L(M_1) = L(M_2) \iff (L_1 \cap \bar{L_2}) \cup (\bar{L_1} \cap L_2) = \emptyset$$

The symmetric difference $L_1 \oplus L_2$ contains strings in one language but not both. If it's empty, the languages are equal.

Steps:
1. Build product DFA for symmetric difference
2. Check if the resulting language is empty

**Algorithm 2 — Minimization:**

1. Minimize both DFAs
2. Check if the minimal DFAs are isomorphic (same structure up to state renaming)

**Time complexity:** $O(n \log n)$ using Hopcroft's minimization algorithm.

### 6. Inclusion: Is $L(M_1) \subseteq L(M_2)$?

**Algorithm:**

$$L_1 \subseteq L_2 \iff L_1 \cap \bar{L_2} = \emptyset$$

Check if there's any string in $L_1$ that's NOT in $L_2$. If the intersection with $L_2$'s complement is empty, inclusion holds.

**Time complexity:** $O(|Q_1| \cdot |Q_2|)$ (product construction + emptiness check)

---

## Summary of Decidability

All the following problems are **decidable in polynomial time** for regular languages:

| Problem | Question | Time |
|---------|----------|------|
| Membership | $w \in L$? | $O(|w|)$ |
| Emptiness | $L = \emptyset$? | $O(|Q| + |\delta|)$ |
| Finiteness | $|L| < \infty$? | $O(|Q| + |\delta|)$ |
| Universality | $L = \Sigma^*$? | $O(|Q| + |\delta|)$ |
| Equivalence | $L_1 = L_2$? | $O(n \log n)$ |
| Inclusion | $L_1 \subseteq L_2$? | $O(|Q_1| \cdot |Q_2|)$ |

Compare this to context-free languages, where many of these problems are **undecidable**!

---

## Applications

### Proving Languages Regular via Closure

Closure properties let you prove a language is regular **without** building an automaton from scratch:

**Example:** Show that $L = \{w \in \{0,1\}^* \mid w \text{ has odd length and starts with 0}\}$ is regular.

**Proof:**
- $L_1 = \{w \mid |w| \text{ is odd}\}$ is regular (2-state DFA alternating accept/reject)
- $L_2 = \{w \mid w \text{ starts with 0}\} = 0\Sigma^*$ is regular (simple regex)
- $L = L_1 \cap L_2$ is regular (closure under intersection) $\square$

This avoids building a custom DFA entirely.

**Example:** Show that $L = \{w \in \{a,b\}^* \mid w \text{ does NOT contain "aa"}\}$ is regular.

**Proof:**
- $L' = \{w \mid w \text{ contains "aa"}\} = \Sigma^* aa \Sigma^*$ is regular
- $L = \overline{L'}$ is regular (closure under complement) $\square$

### Proving Languages Non-Regular via Closure

Conversely, closure properties provide an elegant technique for proving non-regularity:

**Strategy:** If assuming $L$ is regular leads to a known non-regular language being regular (via closure operations), then $L$ must not be regular.

**Template:**
1. Assume $L$ is regular
2. Apply closure operations to $L$ to produce some $L'$
3. Show $L'$ is a known non-regular language
4. Since closure should preserve regularity, we have a contradiction
5. Therefore $L$ is not regular

This is often cleaner than a direct pumping lemma proof!

---

### Compiler Optimization

Compilers use closure properties to:
- Combine lexer rules (union of token patterns)
- Check if two regex patterns overlap (non-empty intersection)
- Verify a pattern matches all expected inputs (universality)

### Pattern Matching Verification

Given a regex for input validation:
- Is the pattern too restrictive? (Check if some valid inputs are rejected)
- Is it too permissive? (Check if invalid inputs are accepted)
- Are two patterns equivalent? (Used in regex refactoring)

### Network Security

Firewall rules can be modeled as regular languages:
- Do two rule sets provide the same filtering? (Equivalence)
- Does one rule set subsume another? (Inclusion)
- Is there any packet that passes all filters? (Non-emptiness of intersection)

### Model Checking

In hardware/software verification:
- System behaviors are modeled as regular languages
- Properties to verify are also regular
- Check: does the system satisfy the property? ($L_{system} \subseteq L_{property}$)

---

## Exercises with Solutions

### Exercise 1

Prove that regular languages are closed under the **XOR** (symmetric difference) operation: $L_1 \oplus L_2 = (L_1 - L_2) \cup (L_2 - L_1)$.

**Solution:**

Since regular languages are closed under:
- Complement: $\bar{L_1}$ and $\bar{L_2}$ are regular
- Intersection: $L_1 \cap \bar{L_2}$ and $\bar{L_1} \cap L_2$ are regular
- Union: $(L_1 \cap \bar{L_2}) \cup (\bar{L_1} \cap L_2)$ is regular

Therefore $L_1 \oplus L_2 = (L_1 \cap \bar{L_2}) \cup (\bar{L_1} \cap L_2)$ is regular. $\square$

Alternatively, use the product construction with accept states:
$$F = (F_1 \times (Q_2 - F_2)) \cup ((Q_1 - F_1) \times F_2)$$

### Exercise 2

Let $L$ be regular. Prove that $\text{Prefix}(L) = \{x \mid \exists y: xy \in L\}$ is regular.

**Solution:**

Given DFA $M = (Q, \Sigma, \delta, q_0, F)$ for $L$:

Build DFA $M' = (Q, \Sigma, \delta, q_0, F')$ where:

$$F' = \{q \in Q \mid \exists w \in \Sigma^*: \hat{\delta}(q, w) \in F\}$$

That is, the new accept states are all states from which **some** accept state is reachable. This is computable by backward BFS from $F$.

$M'$ accepts string $x$ iff $x$ is a prefix of some string in $L$. $\square$

### Exercise 3

Given DFAs $M_1$ (3 states) and $M_2$ (4 states), what is the maximum number of states in the product DFA for $L_1 \cap L_2$?

**Solution:**

The product DFA has at most $|Q_1| \times |Q_2| = 3 \times 4 = 12$ states.

Not all 12 may be reachable from the start state, so the accessible product DFA could be smaller. But the maximum is **12**.

### Exercise 4

Is the language $L = \{w \in \{a,b\}^* \mid w \text{ has equal number of } a\text{'s and } b\text{'s}\}$ regular?

**Solution:**

We'll prove this is **not regular** using closure properties.

Assume $L$ is regular. Then $L \cap a^*b^*$ should also be regular (intersection of two regular languages is regular).

But $L \cap a^*b^* = \{a^n b^n \mid n \geq 0\}$, which is known to be non-regular (by the pumping lemma).

Contradiction! Therefore $L$ is not regular. $\square$

This demonstrates how closure properties can be used as a **proof technique** — even to prove languages are NOT regular.

### Exercise 5

Construct the product DFA for $L_1 \cap L_2$ where:
- $L_1$: binary strings divisible by 2 (ending in 0). DFA: states $\{A, B\}$, start $A$, accept $\{B\}$, $\delta(A,0)=B, \delta(A,1)=A, \delta(B,0)=B, \delta(B,1)=A$
- $L_2$: binary strings of odd length. DFA: states $\{P, Q\}$, start $P$, accept $\{Q\}$, $\delta(P,0)=Q, \delta(P,1)=Q, \delta(Q,0)=P, \delta(Q,1)=P$

**Solution:**

Product states: $\{(A,P), (A,Q), (B,P), (B,Q)\}$

| State | On 0 | On 1 |
|-------|------|------|
| $(A,P)$ | $(B,Q)$ | $(A,Q)$ |
| $(A,Q)$ | $(B,P)$ | $(A,P)$ |
| $(B,P)$ | $(B,Q)$ | $(A,Q)$ |
| $(B,Q)$ | $(B,P)$ | $(A,P)$ |

Start: $(A,P)$. Accept: $F_1 \times F_2 = \{B\} \times \{Q\} = \{(B,Q)\}$.

This accepts binary strings that end in 0 AND have odd length.

---

## Summary

| Property Type | Examples |
|---------------|----------|
| **Closure** (result is regular) | Union, intersection, complement, concatenation, star, difference, reversal, homomorphism, inverse homomorphism |
| **Decision** (algorithmically answerable) | Membership, emptiness, finiteness, universality, equivalence, inclusion |

| Key Construction | Used For |
|-----------------|----------|
| Product DFA | Intersection, union, difference, symmetric difference |
| Complement DFA | Swap accept states in complete DFA |
| NFA constructions | Union, concatenation, star, reversal |

**Key insight:** The rich closure and decision properties of regular languages make them a "well-behaved" language class — much more tractable than context-free or recursive languages.

---

## Additional Closure Properties

### 10. Quotient: $L_1 / L_2$

The **right quotient** of $L_1$ with $L_2$ is:

$$L_1 / L_2 = \{x \mid \exists y \in L_2 : xy \in L_1\}$$

**Theorem:** If $L_1$ is regular (and $L_2$ is any language), then $L_1 / L_2$ is regular.

**Proof:** Given DFA $M = (Q, \Sigma, \delta, q_0, F)$ for $L_1$:

Define new accept states: $F' = \{q \in Q \mid \exists y \in L_2 : \hat{\delta}(q, y) \in F\}$

The DFA $(Q, \Sigma, \delta, q_0, F')$ accepts $L_1 / L_2$.

**Note:** $L_2$ doesn't even need to be regular! As long as $L_1$ is regular, the quotient is regular.

### 11. Shuffle

The **shuffle** of two languages (interleaving in any order) also preserves regularity, proven via product construction that tracks progress through both DFAs independently.

### 12. Substitution

If $L$ is regular over $\Sigma$ and for each $a \in \Sigma$ we have a regular language $L_a$ over $\Gamma$, then the substitution $s(L) = \{w_1 w_2 \cdots w_n \mid a_1 a_2 \cdots a_n \in L, w_i \in L_{a_i}\}$ is regular over $\Gamma$.

---

## Quick Reference: Is It Closed?

| Operation | Regular? | Context-Free? |
|-----------|----------|---------------|
| Union | ✓ | ✓ |
| Intersection | ✓ | ✗ |
| Complement | ✓ | ✗ |
| Concatenation | ✓ | ✓ |
| Kleene star | ✓ | ✓ |
| Intersection with regular | ✓ | ✓ |
| Homomorphism | ✓ | ✓ |
| Inverse homomorphism | ✓ | ✓ |
| Reversal | ✓ | ✓ |

This table is useful when comparing language classes — regular languages enjoy the most closure properties of any commonly studied class.

Next, we'll learn the **Pumping Lemma** — a tool for proving that specific languages are NOT regular.
