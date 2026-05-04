---
title: Relations and Functions
---

# Relations and Functions

In the previous lesson, we learned about sets and set operations. Now we'll study **relations** — which describe connections between elements — and **functions** — which are special relations that assign exactly one output to each input. These concepts are the backbone of formal machine definitions: every automaton's behavior is specified by a transition **function** defined on a **relation** between states and inputs.

---

## Binary Relations

A **binary relation** $R$ from set $A$ to set $B$ is a subset of the Cartesian product $A \times B$:

$$R \subseteq A \times B$$

If $(a, b) \in R$, we say "$a$ is related to $b$" and often write $a \mathrel{R} b$.

### Examples

**Example 1:** Let $A = \{1, 2, 3\}$ and $B = \{a, b\}$. The following is a relation from $A$ to $B$:

$$R = \{(1, a), (1, b), (2, a), (3, b)\}$$

Here $1 \mathrel{R} a$, $1 \mathrel{R} b$, $2 \mathrel{R} a$, and $3 \mathrel{R} b$.

**Example 2:** The "less than" relation on $\mathbb{Z}$:

$$R_{<} = \{(a, b) \in \mathbb{Z} \times \mathbb{Z} \mid a < b\}$$

So $(3, 7) \in R_{<}$ but $(5, 2) \notin R_{<}$.

**Example 3:** The "divides" relation on $\mathbb{Z}^+$:

$$R_{\mid} = \{(a, b) \in \mathbb{Z}^+ \times \mathbb{Z}^+ \mid a \text{ divides } b\}$$

So $(3, 12) \in R_{\mid}$ because $3 \mid 12$, but $(5, 12) \notin R_{\mid}$.

---

## Relations on a Set

When $A = B$, we call $R \subseteq A \times A$ a **relation on** $A$. These are especially important because they describe internal structure within a single set.

**Example:** Let $A = \{1, 2, 3, 4\}$ and define $R$ by "$a$ divides $b$":

$$R = \{(1,1), (1,2), (1,3), (1,4), (2,2), (2,4), (3,3), (4,4)\}$$

---

## Properties of Relations

Relations on a set can have special properties. These properties are crucial for classifying relations.

### Reflexive

$R$ is **reflexive** if every element is related to itself:

$$\forall a \in A, \quad (a, a) \in R$$

**Example:** "equals" ($=$) is reflexive: $a = a$ for all $a$.

**Non-example:** "less than" ($<$) is not reflexive: $a < a$ is always false.

---

### Symmetric

$R$ is **symmetric** if whenever $a$ is related to $b$, then $b$ is related to $a$:

$$\forall a, b \in A, \quad (a, b) \in R \Rightarrow (b, a) \in R$$

**Example:** "is a sibling of" is symmetric: if Alice is Bob's sibling, then Bob is Alice's sibling.

**Non-example:** "less than" is not symmetric: $3 < 5$ but $5 \not< 3$.

---

### Transitive

$R$ is **transitive** if whenever $a$ is related to $b$ and $b$ is related to $c$, then $a$ is related to $c$:

$$\forall a, b, c \in A, \quad (a, b) \in R \land (b, c) \in R \Rightarrow (a, c) \in R$$

**Example:** "less than" is transitive: if $a < b$ and $b < c$, then $a < c$.

**Non-example:** "is a parent of" is not transitive: if $a$ is parent of $b$ and $b$ is parent of $c$, $a$ is NOT parent of $c$ (but grandparent).

---

### Antisymmetric

$R$ is **antisymmetric** if whenever $a$ is related to $b$ and $b$ is related to $a$, then $a = b$:

$$\forall a, b \in A, \quad (a, b) \in R \land (b, a) \in R \Rightarrow a = b$$

**Example:** "less than or equal" ($\leq$) is antisymmetric: if $a \leq b$ and $b \leq a$, then $a = b$.

**Example:** "divides" on $\mathbb{Z}^+$ is antisymmetric: if $a \mid b$ and $b \mid a$, then $a = b$.

**Note:** Antisymmetric is NOT the negation of symmetric! A relation can be both symmetric and antisymmetric (e.g., equality), or neither.

---

## Equivalence Relations

An **equivalence relation** is a relation that is **reflexive**, **symmetric**, and **transitive**. These are relations that behave like "equality" — they group elements into classes of "equivalent" things.

### Definition

$R$ on $A$ is an equivalence relation if:
1. **Reflexive:** $\forall a \in A, \quad a \mathrel{R} a$
2. **Symmetric:** $\forall a, b \in A, \quad a \mathrel{R} b \Rightarrow b \mathrel{R} a$
3. **Transitive:** $\forall a, b, c \in A, \quad a \mathrel{R} b \land b \mathrel{R} c \Rightarrow a \mathrel{R} c$

---

### Equivalence Classes

If $R$ is an equivalence relation on $A$, the **equivalence class** of $a$ is the set of all elements equivalent to $a$:

$$[a] = \{x \in A \mid x \mathrel{R} a\}$$

**Key property:** Equivalence classes **partition** the set $A$ — they divide $A$ into non-overlapping groups that together cover all of $A$.

$$A = [a_1] \cup [a_2] \cup \cdots \cup [a_k]$$

where the classes are pairwise disjoint: $[a_i] \cap [a_j] = \emptyset$ for $i \neq j$.

---

### Example: Congruence Modulo $n$

Define the relation $\equiv_n$ on $\mathbb{Z}$ by:

$$a \equiv_n b \iff n \mid (a - b)$$

This reads "$a$ is congruent to $b$ modulo $n$."

**For $n = 3$:**
- $[0] = \{\ldots, -6, -3, 0, 3, 6, 9, \ldots\}$ (multiples of 3)
- $[1] = \{\ldots, -5, -2, 1, 4, 7, 10, \ldots\}$ (remainder 1 when divided by 3)
- $[2] = \{\ldots, -4, -1, 2, 5, 8, 11, \ldots\}$ (remainder 2 when divided by 3)

These three classes partition all of $\mathbb{Z}$.

**Verification that $\equiv_3$ is an equivalence relation:**
- Reflexive: $3 \mid (a - a) = 0$ ✓
- Symmetric: if $3 \mid (a - b)$ then $3 \mid (b - a) = -(a-b)$ ✓
- Transitive: if $3 \mid (a - b)$ and $3 \mid (b - c)$, then $3 \mid (a - b) + (b - c) = (a - c)$ ✓

---

### Why Equivalence Relations Matter for ToC

The **Myhill-Nerode theorem** uses equivalence relations to characterize regular languages. Two strings are "equivalent" if no suffix can distinguish them — the equivalence classes correspond exactly to the states of the minimal DFA.

---

## Partial Orders

A **partial order** is a relation that is **reflexive**, **antisymmetric**, and **transitive**. These relations represent hierarchies or rankings where not every pair of elements is comparable.

### Definition

$R$ on $A$ is a partial order if:
1. **Reflexive:** $\forall a \in A, \quad a \mathrel{R} a$
2. **Antisymmetric:** $\forall a, b \in A, \quad a \mathrel{R} b \land b \mathrel{R} a \Rightarrow a = b$
3. **Transitive:** $\forall a, b, c \in A, \quad a \mathrel{R} b \land b \mathrel{R} c \Rightarrow a \mathrel{R} c$

A set with a partial order is called a **partially ordered set** or **poset**, written $(A, \leq)$.

---

### Examples

**Example 1:** $(\mathbb{Z}, \leq)$ — the usual "less than or equal to" on integers.

**Example 2:** $(\mathcal{P}(S), \subseteq)$ — the subset relation on the power set of $S$.

For $S = \{1, 2\}$: the power set is $\{\emptyset, \{1\}, \{2\}, \{1,2\}\}$ with $\subseteq$ ordering. Note that $\{1\}$ and $\{2\}$ are **incomparable** — neither is a subset of the other.

**Example 3:** $(\mathbb{Z}^+, \mid)$ — divisibility on positive integers. $2 \mid 6$ and $3 \mid 6$, but $2 \nmid 3$ and $3 \nmid 2$, so 2 and 3 are incomparable.

---

### Hasse Diagrams

A **Hasse diagram** is a visual representation of a partial order where:
- Elements are drawn as points
- If $a < b$ (with no element between them), draw $b$ above $a$ with a connecting line
- Omit edges implied by transitivity

For the poset $(\{1, 2, 3, 6\}, \mid)$:
- 6 is at the top (divisible by 1, 2, 3)
- 2 and 3 are in the middle (divisible by 1, incomparable to each other)
- 1 is at the bottom (divides everything)

---

### Total Order vs. Partial Order

A **total order** (or linear order) is a partial order where every pair of elements is comparable:

$$\forall a, b \in A, \quad a \leq b \text{ or } b \leq a$$

**Examples:**
- $(\mathbb{Z}, \leq)$ is a total order (every two integers are comparable)
- $(\mathcal{P}(\{1,2\}), \subseteq)$ is NOT a total order ($\{1\}$ and $\{2\}$ are incomparable)

---

## Functions

A **function** $f$ from $A$ to $B$, written $f: A \to B$, is a relation that assigns to each element of $A$ **exactly one** element of $B$.

Formally, $f \subseteq A \times B$ such that:

$$\forall a \in A, \exists! b \in B, \quad (a, b) \in f$$

The notation $f(a) = b$ means $(a, b) \in f$.

---

### Terminology

- **Domain:** The set $A$ (inputs)
- **Codomain:** The set $B$ (possible outputs)
- **Range (Image):** The set $\{f(a) \mid a \in A\} \subseteq B$ (actual outputs)
- **Pre-image of $b$:** $f^{-1}(b) = \{a \in A \mid f(a) = b\}$

**Example:** Let $f: \mathbb{R} \to \mathbb{R}$ with $f(x) = x^2$.
- Domain: $\mathbb{R}$
- Codomain: $\mathbb{R}$
- Range: $[0, \infty)$ (only non-negative values are achieved)

---

### Injective (One-to-One)

A function $f: A \to B$ is **injective** if different inputs always produce different outputs:

$$\forall a_1, a_2 \in A, \quad f(a_1) = f(a_2) \Rightarrow a_1 = a_2$$

Equivalently: $a_1 \neq a_2 \Rightarrow f(a_1) \neq f(a_2)$

**Example:** $f(x) = 2x + 1$ is injective (if $2a+1 = 2b+1$ then $a = b$).

**Non-example:** $f(x) = x^2$ is not injective ($f(2) = f(-2) = 4$ but $2 \neq -2$).

---

### Surjective (Onto)

A function $f: A \to B$ is **surjective** if every element of $B$ is hit by some element of $A$:

$$\forall b \in B, \exists a \in A, \quad f(a) = b$$

Equivalently: the range equals the codomain.

**Example:** $f: \mathbb{R} \to \mathbb{R}$ with $f(x) = 2x + 1$ is surjective (for any $b$, choose $a = (b-1)/2$).

**Non-example:** $f: \mathbb{R} \to \mathbb{R}$ with $f(x) = x^2$ is not surjective ($-1$ has no pre-image since $x^2 \geq 0$).

---

### Bijective (One-to-One and Onto)

A function is **bijective** if it is both injective and surjective. A bijection establishes a perfect one-to-one correspondence between $A$ and $B$.

**Example:** $f: \mathbb{R} \to \mathbb{R}$ with $f(x) = 2x + 1$ is bijective.

**Example:** $f: \mathbb{N} \to \mathbb{Z}$ defined by:

$$f(n) = \begin{cases} n/2 & \text{if } n \text{ is even} \\ -(n+1)/2 & \text{if } n \text{ is odd} \end{cases}$$

maps $0 \mapsto 0, 1 \mapsto -1, 2 \mapsto 1, 3 \mapsto -2, 4 \mapsto 2, \ldots$ and is a bijection between $\mathbb{N}$ and $\mathbb{Z}$.

---

## Function Composition

Given $f: A \to B$ and $g: B \to C$, the **composition** $g \circ f: A \to C$ is defined by:

$$(g \circ f)(x) = g(f(x))$$

**Important:** We apply $f$ first, then $g$. Read $g \circ f$ as "$g$ after $f$."

### Properties of Composition

- **Associative:** $(h \circ g) \circ f = h \circ (g \circ f)$
- **Not commutative:** $g \circ f \neq f \circ g$ in general
- If $f$ and $g$ are both injective, so is $g \circ f$
- If $f$ and $g$ are both surjective, so is $g \circ f$
- If $f$ and $g$ are both bijective, so is $g \circ f$

**Example:** Let $f(x) = x + 1$ and $g(x) = 2x$. Then:
- $(g \circ f)(x) = g(f(x)) = g(x+1) = 2(x+1) = 2x + 2$
- $(f \circ g)(x) = f(g(x)) = f(2x) = 2x + 1$

These are different! Composition is not commutative.

---

## Inverse Functions

If $f: A \to B$ is a bijection, then the **inverse function** $f^{-1}: B \to A$ exists and satisfies:

$$f^{-1}(f(a)) = a \quad \text{for all } a \in A$$

$$f(f^{-1}(b)) = b \quad \text{for all } b \in B$$

Equivalently: $f^{-1} \circ f = \text{id}_A$ and $f \circ f^{-1} = \text{id}_B$.

**Key theorem:** $f$ has an inverse if and only if $f$ is bijective.

**Example:** If $f(x) = 2x + 1$, then $f^{-1}(y) = (y - 1)/2$.

Verify: $f^{-1}(f(x)) = f^{-1}(2x+1) = ((2x+1)-1)/2 = x$ ✓

---

## Cardinality and Bijections

Two sets have the **same cardinality** if there exists a bijection between them:

$$|A| = |B| \iff \text{there exists a bijection } f: A \to B$$

This is how we compare the sizes of infinite sets:
- $|\mathbb{N}| = |\mathbb{Z}|$ (the bijection above proves this)
- $|\mathbb{N}| = |\mathbb{Q}|$ (Cantor's proof)
- $|\mathbb{N}| < |\mathbb{R}|$ (Cantor's diagonalization proves no bijection exists)

---

## Countability Revisited

A set $S$ is **countable** if there exists an injection $f: S \to \mathbb{N}$ (equivalently, if $S$ is finite or there exists a bijection $f: S \to \mathbb{N}$).

A set is **countably infinite** if $|S| = |\mathbb{N}| = \aleph_0$.

**Important results:**
- Countable union of countable sets is countable: if $A_1, A_2, A_3, \ldots$ are all countable, then $\bigcup_{i=1}^{\infty} A_i$ is countable
- Cartesian product of two countable sets is countable: if $A$ and $B$ are countable, so is $A \times B$
- The set of all finite strings over a finite alphabet is countable
- The power set of a countably infinite set is uncountable: $|\mathcal{P}(\mathbb{N})| > |\mathbb{N}|$

---

## Why This Matters for Theory of Computation

Relations and functions appear everywhere in ToC:

### Transition Functions

A DFA is defined as a 5-tuple $(Q, \Sigma, \delta, q_0, F)$ where the transition function is:

$$\delta: Q \times \Sigma \to Q$$

This is a total function from the Cartesian product of states and input symbols to states.

An NFA's transition function is:

$$\delta: Q \times \Sigma \to \mathcal{P}(Q)$$

It maps to the power set of $Q$ — a set of possible next states.

### Language Membership

A language $L$ over alphabet $\Sigma$ is a subset $L \subseteq \Sigma^*$. The membership question "Is string $w$ in language $L$?" is a function:

$$\chi_L: \Sigma^* \to \{0, 1\}$$

where $\chi_L(w) = 1$ iff $w \in L$. This is the **characteristic function** of $L$.

### Reductions

A reduction from problem $A$ to problem $B$ is a computable function $f$ such that:

$$x \in A \iff f(x) \in B$$

The properties of $f$ (whether it's injective, computable, polynomial-time) determine what the reduction tells us.

### Equivalence Relations and Minimal Automata

The Myhill-Nerode equivalence relation on strings determines the minimal DFA for a regular language — the number of equivalence classes equals the number of states.

---

## Exercises

### Exercise 1

Determine which properties (reflexive, symmetric, transitive, antisymmetric) the relation "divides" ($\mid$) has on $\mathbb{Z}^+$.

**Solution:**
- **Reflexive:** Yes. $a \mid a$ for all $a \in \mathbb{Z}^+$ (since $a = 1 \cdot a$). ✓
- **Symmetric:** No. $2 \mid 4$ but $4 \nmid 2$. ✗
- **Transitive:** Yes. If $a \mid b$ and $b \mid c$, then $b = ka$ and $c = lb$, so $c = lka$ and $a \mid c$. ✓
- **Antisymmetric:** Yes. If $a \mid b$ and $b \mid a$, then $b = ka$ and $a = lb$, so $a = lka$, giving $lk = 1$. Since $l, k \in \mathbb{Z}^+$, we must have $l = k = 1$, so $a = b$. ✓

Therefore, "divides" is a **partial order** on $\mathbb{Z}^+$.

---

### Exercise 2

Show that "has the same remainder when divided by 5" is an equivalence relation on $\mathbb{Z}$.

**Solution:**

Define $a \sim b$ iff $a \mod 5 = b \mod 5$ (equivalently, $5 \mid (a - b)$).

- **Reflexive:** $a - a = 0$ and $5 \mid 0$. ✓
- **Symmetric:** If $5 \mid (a - b)$, then $5 \mid -(a-b) = (b-a)$. ✓
- **Transitive:** If $5 \mid (a-b)$ and $5 \mid (b-c)$, then $5 \mid (a-b) + (b-c) = (a-c)$. ✓

The equivalence classes are $[0], [1], [2], [3], [4]$, partitioning $\mathbb{Z}$ into 5 classes.

---

### Exercise 3

Let $f: \mathbb{Z} \to \mathbb{Z}$ be defined by $f(n) = n^2 + 1$. Is $f$ injective? Surjective?

**Solution:**

**Injective?** No. $f(2) = 5$ and $f(-2) = 5$, but $2 \neq -2$. ✗

**Surjective?** No. $f(n) = n^2 + 1 \geq 1$ for all $n$, so $0$ (and any negative number) is never in the range. ✗

---

### Exercise 4

Prove that the composition of two injections is an injection.

**Solution:**

Let $f: A \to B$ and $g: B \to C$ be injective. We must show $g \circ f: A \to C$ is injective.

Suppose $(g \circ f)(a_1) = (g \circ f)(a_2)$.

Then $g(f(a_1)) = g(f(a_2))$.

Since $g$ is injective: $f(a_1) = f(a_2)$.

Since $f$ is injective: $a_1 = a_2$.

Therefore $g \circ f$ is injective. $\square$

---

### Exercise 5

Show that $|\mathbb{N}| = |\mathbb{N} \times \mathbb{N}|$ by describing a bijection.

**Solution:**

Use the Cantor pairing function:

$$\pi(m, n) = \frac{(m + n)(m + n + 1)}{2} + m$$

This function traverses the grid of pairs $(m, n)$ along diagonals where $m + n$ is constant:

$(0,0) \mapsto 0$, $(1,0) \mapsto 1$, $(0,1) \mapsto 2$, $(2,0) \mapsto 3$, $(1,1) \mapsto 4$, $(0,2) \mapsto 5$, ...

This is a bijection from $\mathbb{N} \times \mathbb{N}$ to $\mathbb{N}$, proving the two sets have the same cardinality.

---

## Summary of Relation Types

| Relation Type | Reflexive | Symmetric | Transitive | Antisymmetric |
|---------------|-----------|-----------|------------|---------------|
| Equivalence | ✓ | ✓ | ✓ | — |
| Partial Order | ✓ | — | ✓ | ✓ |
| Total Order | ✓ | — | ✓ | ✓ (+ totality) |
| Strict Order | ✗ | ✗ | ✓ | — |

---

## Summary of Function Types

| Function Type | Condition | Example |
|---------------|-----------|---------|
| Injective | $f(a) = f(b) \Rightarrow a = b$ | $f(x) = 2x$ |
| Surjective | Range $=$ Codomain | $f: \mathbb{R} \to \mathbb{R}, f(x) = x^3$ |
| Bijective | Injective + Surjective | $f: \mathbb{Z} \to \mathbb{Z}, f(x) = x + 1$ |

---

## Key Takeaways

- A **relation** $R \subseteq A \times B$ captures connections between elements
- **Equivalence relations** (reflexive + symmetric + transitive) partition sets into equivalence classes
- **Partial orders** (reflexive + antisymmetric + transitive) describe hierarchical structure
- **Functions** assign exactly one output to each input; they can be injective, surjective, or bijective
- **Bijections** establish equal cardinality between sets
- **Composition** $g \circ f$ applies $f$ first, then $g$
- These concepts directly define automata transition functions, reductions, and language characterizations

---

## Next Lesson

Next, we'll study **Logic and Proofs** — the formal system for reasoning about truth and establishing theorems rigorously. Every claim in Theory of Computation must be backed by a proof, and you'll learn the techniques to construct them.
