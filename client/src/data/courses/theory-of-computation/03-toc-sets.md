---
title: Sets and Set Operations
---

# Sets and Set Operations

Sets are the most fundamental objects in mathematics — and therefore in Theory of Computation. Every concept we'll encounter — alphabets, languages, states, transitions — is defined in terms of sets. Master this lesson, and you'll have the vocabulary to express everything that follows.

---

## What Is a Set?

A **set** is an unordered collection of distinct objects, called **elements** or **members**.

Key properties:
- **No duplicates:** Each element appears at most once
- **No order:** $\{1, 2, 3\} = \{3, 1, 2\}$
- **Well-defined membership:** For any object $x$ and set $A$, either $x$ is in $A$ or it is not — there is no ambiguity

---

## Set Notation

### Roster (Enumeration) Method

List all elements between curly braces:

$$A = \{1, 2, 3, 4, 5\}$$

$$B = \{a, b, c\}$$

$$C = \{\text{red}, \text{green}, \text{blue}\}$$

For larger sets, use an ellipsis when the pattern is clear:

$$D = \{2, 4, 6, 8, \ldots\} \quad \text{(all positive even numbers)}$$

$$E = \{1, 2, 3, \ldots, 100\} \quad \text{(integers from 1 to 100)}$$

### Set-Builder Notation

Describe elements by a property they satisfy:

$$A = \{x \mid x \text{ is a positive integer less than 6}\} = \{1, 2, 3, 4, 5\}$$

$$B = \{x \in \mathbb{Z} \mid x^2 < 10\} = \{-3, -2, -1, 0, 1, 2, 3\}$$

$$C = \{2n \mid n \in \mathbb{N}\} = \{0, 2, 4, 6, \ldots\}$$

Read "$\{x \mid P(x)\}$" as "the set of all $x$ such that $P(x)$ is true."

---

## Common Sets

Mathematics uses standard symbols for frequently-occurring sets:

| Symbol | Set | Elements |
|--------|-----|----------|
| $\mathbb{N}$ | Natural numbers | $\{0, 1, 2, 3, \ldots\}$ |
| $\mathbb{Z}$ | Integers | $\{\ldots, -2, -1, 0, 1, 2, \ldots\}$ |
| $\mathbb{Z}^+$ | Positive integers | $\{1, 2, 3, \ldots\}$ |
| $\mathbb{Q}$ | Rational numbers | $\{p/q \mid p, q \in \mathbb{Z}, q \neq 0\}$ |
| $\mathbb{R}$ | Real numbers | All points on the number line |
| $\mathbb{C}$ | Complex numbers | $\{a + bi \mid a, b \in \mathbb{R}\}$ |
| $\emptyset$ or $\{\}$ | Empty set | No elements |

**Note:** Some authors define $\mathbb{N} = \{1, 2, 3, \ldots\}$ (excluding 0). In this course, we include 0 in $\mathbb{N}$.

---

## Set Membership

The symbol $\in$ denotes membership:

- $3 \in \{1, 2, 3, 4\}$ — "3 is an element of the set"
- $5 \notin \{1, 2, 3, 4\}$ — "5 is NOT an element of the set"
- $\pi \in \mathbb{R}$ — "pi is a real number"
- $\pi \notin \mathbb{Q}$ — "pi is not rational"

**Important:** $\in$ relates an element to a set. Don't confuse it with $\subseteq$, which relates a set to another set.

---

## Subsets

### Subset ($\subseteq$)

$A \subseteq B$ means every element of $A$ is also in $B$:

$$A \subseteq B \iff \forall x (x \in A \Rightarrow x \in B)$$

**Examples:**
- $\{1, 2\} \subseteq \{1, 2, 3\}$ ✓
- $\{1, 2, 3\} \subseteq \{1, 2, 3\}$ ✓ (a set is always a subset of itself)
- $\emptyset \subseteq A$ for every set $A$ (the empty set is a subset of everything)
- $\{1, 4\} \not\subseteq \{1, 2, 3\}$ ✗ (because $4 \notin \{1, 2, 3\}$)

### Proper Subset ($\subset$)

$A \subset B$ means $A \subseteq B$ but $A \neq B$ (there's at least one element in $B$ not in $A$):

$$A \subset B \iff A \subseteq B \land A \neq B$$

**Examples:**
- $\{1, 2\} \subset \{1, 2, 3\}$ ✓
- $\{1, 2, 3\} \subset \{1, 2, 3\}$ ✗ (not proper — they're equal)
- $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$

---

## Set Equality

Two sets are equal if and only if they have exactly the same elements:

$$A = B \iff (A \subseteq B) \land (B \subseteq A)$$

This gives us the standard technique for proving two sets are equal: show that each is a subset of the other.

**Examples:**
- $\{1, 2, 3\} = \{3, 1, 2\}$ (order doesn't matter)
- $\{1, 1, 2, 2, 3\} = \{1, 2, 3\}$ (duplicates don't matter)
- $\{x \in \mathbb{Z} \mid x^2 = 1\} = \{-1, 1\}$

---

## Set Operations

### Union

The **union** of $A$ and $B$ is the set of elements in $A$ **or** $B$ (or both):

$$A \cup B = \{x \mid x \in A \text{ or } x \in B\}$$

**Examples:**
- $\{1, 2, 3\} \cup \{3, 4, 5\} = \{1, 2, 3, 4, 5\}$
- $\{a, b\} \cup \emptyset = \{a, b\}$
- $\mathbb{Z}^+ \cup \{0\} \cup \mathbb{Z}^- = \mathbb{Z}$

---

### Intersection

The **intersection** of $A$ and $B$ is the set of elements in **both** $A$ and $B$:

$$A \cap B = \{x \mid x \in A \text{ and } x \in B\}$$

**Examples:**
- $\{1, 2, 3\} \cap \{3, 4, 5\} = \{3\}$
- $\{1, 2\} \cap \{3, 4\} = \emptyset$ (disjoint sets)
- $\mathbb{Z} \cap \mathbb{Q} = \mathbb{Z}$ (every integer is rational)

Two sets are **disjoint** if $A \cap B = \emptyset$.

---

### Set Difference

The **difference** $A - B$ (also written $A \setminus B$) is the set of elements in $A$ but not in $B$:

$$A - B = \{x \mid x \in A \text{ and } x \notin B\}$$

**Examples:**
- $\{1, 2, 3, 4\} - \{3, 4, 5\} = \{1, 2\}$
- $\{1, 2, 3\} - \emptyset = \{1, 2, 3\}$
- $\mathbb{R} - \mathbb{Q} = $ the set of irrational numbers

**Note:** Set difference is NOT commutative: $A - B \neq B - A$ in general.

---

### Complement

The **complement** of $A$, written $\bar{A}$ or $A^c$, is the set of all elements (in the universal set $U$) that are NOT in $A$:

$$\bar{A} = U - A = \{x \in U \mid x \notin A\}$$

The universal set $U$ must be specified or understood from context.

**Example:** If $U = \{1, 2, 3, 4, 5\}$ and $A = \{1, 3, 5\}$, then $\bar{A} = \{2, 4\}$.

---

### Symmetric Difference

The **symmetric difference** of $A$ and $B$ is the set of elements in exactly one of the two sets:

$$A \oplus B = (A - B) \cup (B - A) = (A \cup B) - (A \cap B)$$

**Examples:**
- $\{1, 2, 3\} \oplus \{3, 4, 5\} = \{1, 2, 4, 5\}$
- $A \oplus A = \emptyset$ (a set has no difference with itself)
- $A \oplus \emptyset = A$

---

## Venn Diagrams

Venn diagrams visually represent set operations using overlapping circles:

**Union $A \cup B$:** The entire area covered by either circle (everything that's shaded).

**Intersection $A \cap B$:** Only the overlapping region where both circles meet.

**Difference $A - B$:** The part of circle $A$ that doesn't overlap with circle $B$.

**Symmetric Difference $A \oplus B$:** Both circles except the overlapping region.

**Complement $\bar{A}$:** Everything outside circle $A$ (within the universal set rectangle).

While we won't draw actual diagrams here, it's extremely helpful to sketch Venn diagrams on paper when working through set problems.

---

## Laws of Set Operations

Set operations obey algebraic laws analogous to arithmetic:

### Commutative Laws

$$A \cup B = B \cup A$$

$$A \cap B = B \cap A$$

### Associative Laws

$$A \cup (B \cup C) = (A \cup B) \cup C$$

$$A \cap (B \cap C) = (A \cap B) \cap C$$

### Distributive Laws

$$A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$$

$$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

### Identity Laws

$$A \cup \emptyset = A$$

$$A \cap U = A$$

### Complement Laws

$$A \cup \bar{A} = U$$

$$A \cap \bar{A} = \emptyset$$

### Idempotent Laws

$$A \cup A = A$$

$$A \cap A = A$$

### Absorption Laws

$$A \cup (A \cap B) = A$$

$$A \cap (A \cup B) = A$$

### De Morgan's Laws

These are particularly important and will appear throughout the course:

$$\overline{A \cup B} = \bar{A} \cap \bar{B}$$

$$\overline{A \cap B} = \bar{A} \cup \bar{B}$$

In words:
- The complement of a union is the intersection of complements
- The complement of an intersection is the union of complements

---

## Power Set

The **power set** of $A$, written $\mathcal{P}(A)$ or $2^A$, is the set of all subsets of $A$:

$$\mathcal{P}(A) = \{S \mid S \subseteq A\}$$

**Example:** If $A = \{1, 2, 3\}$, then:

$$\mathcal{P}(A) = \{\emptyset, \{1\}, \{2\}, \{3\}, \{1,2\}, \{1,3\}, \{2,3\}, \{1,2,3\}\}$$

### Size of the Power Set

If $|A| = n$ (the set has $n$ elements), then:

$$|\mathcal{P}(A)| = 2^n$$

**Why?** For each element, you have two choices: include it or don't. With $n$ elements, that gives $2^n$ possible subsets.

**Examples:**
- $|\mathcal{P}(\emptyset)| = 2^0 = 1$ (only subset is $\emptyset$ itself)
- $|\mathcal{P}(\{a\})| = 2^1 = 2$ (subsets: $\emptyset, \{a\}$)
- $|\mathcal{P}(\{a,b,c\})| = 2^3 = 8$
- $|\mathcal{P}(\{1,2,\ldots,10\})| = 2^{10} = 1024$

The power set grows exponentially — a set with just 20 elements has over a million subsets!

---

## Cartesian Product

The **Cartesian product** of $A$ and $B$ is the set of all ordered pairs $(a, b)$ where $a \in A$ and $b \in B$:

$$A \times B = \{(a, b) \mid a \in A \text{ and } b \in B\}$$

**Example:** If $A = \{1, 2\}$ and $B = \{x, y, z\}$, then:

$$A \times B = \{(1,x), (1,y), (1,z), (2,x), (2,y), (2,z)\}$$

### Properties

- $|A \times B| = |A| \cdot |B|$
- $A \times B \neq B \times A$ in general (ordered pairs matter)
- $A \times \emptyset = \emptyset$
- The Cartesian product can extend to $n$ sets: $A_1 \times A_2 \times \cdots \times A_n$

### Why This Matters for ToC

Transition functions in automata are defined on Cartesian products. A DFA transition function has the signature:

$$\delta: Q \times \Sigma \to Q$$

This means $\delta$ takes a (state, input symbol) pair and returns a state — it's defined on the Cartesian product $Q \times \Sigma$.

---

## Cardinality

The **cardinality** of a set $A$, written $|A|$, is the "size" or number of elements:

- $|\{a, b, c\}| = 3$
- $|\emptyset| = 0$
- $|\mathbb{N}| = \aleph_0$ (aleph-null — the cardinality of countably infinite sets)
- $|\mathbb{R}| = \mathfrak{c}$ (the cardinality of the continuum)

---

## Countable vs. Uncountable Sets

This distinction is crucial for computability theory.

### Countably Infinite Sets

A set is **countably infinite** if its elements can be put in a one-to-one correspondence with $\mathbb{N}$ (i.e., you can list them: first element, second element, third element, ...).

**Examples of countable sets:**
- $\mathbb{N} = \{0, 1, 2, 3, \ldots\}$ (trivially countable)
- $\mathbb{Z}$ (list as: $0, 1, -1, 2, -2, 3, -3, \ldots$)
- $\mathbb{Q}$ (proven countable by Cantor's famous diagonal argument on the grid)
- The set of all finite strings over a finite alphabet
- The set of all computer programs (since programs are finite strings)

### Uncountable Sets

A set is **uncountable** if it is infinite and NOT countable — its elements cannot be listed in a sequence, no matter how clever you are.

**Examples of uncountable sets:**
- $\mathbb{R}$ (the real numbers)
- Any interval $[a, b]$ where $a < b$
- $\mathcal{P}(\mathbb{N})$ (the power set of natural numbers)
- The set of all languages over a finite alphabet
- The set of all functions from $\mathbb{N}$ to $\{0, 1\}$

### Why This Matters

Here's the key insight for computability:
- The set of all programs is **countable** (there are only countably many programs)
- The set of all languages (problems) is **uncountable** (there are uncountably many problems)

Since there are far more problems than programs, **most problems cannot be solved by any program**. This is the foundational reason why undecidable problems exist!

---

## Cantor's Diagonalization

Georg Cantor proved that $\mathbb{R}$ is uncountable using a beautiful technique called **diagonalization**.

### The Argument (Simplified)

Suppose, for contradiction, that all real numbers in $[0, 1)$ could be listed:

$$r_1 = 0.d_{11}d_{12}d_{13}d_{14}\ldots$$

$$r_2 = 0.d_{21}d_{22}d_{23}d_{24}\ldots$$

$$r_3 = 0.d_{31}d_{32}d_{33}d_{34}\ldots$$

$$r_4 = 0.d_{41}d_{42}d_{43}d_{44}\ldots$$

$$\vdots$$

Now construct a new number $r^*$ by choosing its $n$-th digit to differ from $d_{nn}$ (the diagonal):

$$r^* = 0.d_1^* d_2^* d_3^* d_4^* \ldots \quad \text{where } d_n^* \neq d_{nn}$$

This number $r^*$ differs from every $r_i$ in at least the $i$-th decimal place. So $r^*$ is NOT in our list. But $r^*$ is a real number in $[0,1)$. Contradiction!

Therefore, no listing can contain all reals. $\mathbb{R}$ is uncountable.

### Connection to Computability

We will use this exact technique later to prove the Halting Problem is undecidable. The diagonalization argument is one of the most powerful proof techniques in all of ToC.

---

## Exercises

### Exercise 1

Let $A = \{1, 2, 3, 4, 5\}$ and $B = \{3, 4, 5, 6, 7\}$. Find:

a) $A \cup B$

b) $A \cap B$

c) $A - B$

d) $B - A$

e) $A \oplus B$

**Solutions:**

a) $A \cup B = \{1, 2, 3, 4, 5, 6, 7\}$

b) $A \cap B = \{3, 4, 5\}$

c) $A - B = \{1, 2\}$

d) $B - A = \{6, 7\}$

e) $A \oplus B = \{1, 2, 6, 7\}$

---

### Exercise 2

Prove De Morgan's Law: $\overline{A \cup B} = \bar{A} \cap \bar{B}$

**Solution:**

We prove both directions of subset inclusion.

($\subseteq$) Let $x \in \overline{A \cup B}$. Then $x \notin A \cup B$. This means $x \notin A$ AND $x \notin B$. So $x \in \bar{A}$ and $x \in \bar{B}$. Therefore $x \in \bar{A} \cap \bar{B}$.

($\supseteq$) Let $x \in \bar{A} \cap \bar{B}$. Then $x \in \bar{A}$ and $x \in \bar{B}$. So $x \notin A$ and $x \notin B$. Therefore $x \notin A \cup B$, which means $x \in \overline{A \cup B}$.

Since both inclusions hold, $\overline{A \cup B} = \bar{A} \cap \bar{B}$. $\square$

---

### Exercise 3

List all elements of $\mathcal{P}(\{a, b\})$.

**Solution:**

$$\mathcal{P}(\{a, b\}) = \{\emptyset, \{a\}, \{b\}, \{a, b\}\}$$

There are $2^2 = 4$ subsets, as expected.

---

### Exercise 4

If $|A| = 5$ and $|B| = 3$, what are the possible values of $|A \cup B|$?

**Solution:**

The minimum value occurs when $B \subseteq A$: $|A \cup B| = |A| = 5$.

The maximum value occurs when $A$ and $B$ are disjoint: $|A \cup B| = |A| + |B| = 8$.

By the inclusion-exclusion principle:

$$|A \cup B| = |A| + |B| - |A \cap B| = 8 - |A \cap B|$$

Since $0 \leq |A \cap B| \leq 3$, we get $5 \leq |A \cup B| \leq 8$.

All values $\{5, 6, 7, 8\}$ are achievable.

---

### Exercise 5

Prove that for any set $A$: $A \cup \emptyset = A$.

**Solution:**

($\subseteq$) Let $x \in A \cup \emptyset$. Then $x \in A$ or $x \in \emptyset$. Since $\emptyset$ has no elements, we must have $x \in A$.

($\supseteq$) Let $x \in A$. Then $x \in A$ or $x \in \emptyset$ is true (first disjunct is true). So $x \in A \cup \emptyset$.

Therefore $A \cup \emptyset = A$. $\square$

---

### Exercise 6

Show that the set of all finite binary strings is countable.

**Solution:**

List all binary strings by length, and within each length, in lexicographic order:

$$\varepsilon, 0, 1, 00, 01, 10, 11, 000, 001, 010, 011, 100, 101, 110, 111, \ldots$$

This gives a systematic enumeration that covers every finite binary string exactly once. Since we can assign each string a unique natural number index, the set is countable.

More formally: there are $2^n$ binary strings of length $n$. The total number of strings of length $\leq n$ is $\sum_{k=0}^{n} 2^k = 2^{n+1} - 1$, which is always finite. Every finite binary string appears at some finite position in our list, establishing a bijection with $\mathbb{N}$.

---

## Key Takeaways

- A **set** is an unordered collection of distinct elements
- Key operations: $\cup$ (union), $\cap$ (intersection), $-$ (difference), complement, $\oplus$ (symmetric difference)
- The **power set** $\mathcal{P}(A)$ has $2^{|A|}$ elements
- The **Cartesian product** $A \times B$ gives all ordered pairs — essential for defining transition functions
- **Countable** sets can be listed; **uncountable** sets cannot
- **Cantor's diagonalization** proves uncountability — and will reappear in undecidability proofs
- More problems exist than programs, which is why undecidable problems must exist

---

## Next Lesson

In the next lesson, we'll study **Relations and Functions** — the mathematical tools for defining how automata transition between states and how inputs map to outputs.
