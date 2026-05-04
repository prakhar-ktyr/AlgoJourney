---
title: Strings and Languages
---

# Strings and Languages

Every problem in the Theory of Computation ultimately boils down to one question: **does a given string belong to a given language?** Before we study automata and grammars, we need to precisely define what strings and languages are, and what operations we can perform on them.

This lesson builds the formal vocabulary that the entire field rests on.

---

## Alphabet

An **alphabet** is a finite, non-empty set of symbols. We denote it by $\Sigma$ (capital sigma).

### Examples

| Alphabet | Description |
|----------|-------------|
| $\Sigma = \{0, 1\}$ | Binary alphabet |
| $\Sigma = \{a, b, c\}$ | First three Latin letters |
| $\Sigma = \{0, 1, 2, \ldots, 9\}$ | Decimal digits |
| $\Sigma = \{a, b, c, \ldots, z\}$ | Lowercase English letters |
| $\Sigma = \{\texttt{0}, \texttt{1}, \texttt{x}, \texttt{y}, \texttt{+}, \texttt{=}\}$ | Custom alphabet for encoding |

### Key Properties

- An alphabet must be **finite** — you cannot have infinitely many symbols
- An alphabet must be **non-empty** — it must contain at least one symbol
- The symbols themselves are just abstract tokens; they have no inherent meaning
- Two different alphabets can share symbols (e.g., $\{0, 1\}$ and $\{0, 1, 2\}$)

---

## Strings (Words)

A **string** (also called a **word**) over an alphabet $\Sigma$ is a finite sequence of symbols from $\Sigma$.

### Notation

A string $w$ of length $n$ is written as:

$$w = a_1 a_2 a_3 \cdots a_n \quad \text{where each } a_i \in \Sigma$$

### Length

The **length** of a string $w$, written $|w|$, is the number of symbols in it.

$$|w| = |a_1 a_2 \cdots a_n| = n$$

**Examples** (with $\Sigma = \{0, 1\}$):

| String $w$ | Length $\|w\|$ |
|---|---|
| $01101$ | $5$ |
| $0$ | $1$ |
| $111$ | $3$ |

### The Empty String

The **empty string**, denoted $\varepsilon$ (epsilon), is the unique string with no symbols:

$$|\varepsilon| = 0$$

Think of $\varepsilon$ as the "blank page" — it exists, but contains nothing. It is a valid string over any alphabet.

> **Important:** $\varepsilon$ is NOT a symbol in the alphabet. It is a string (specifically, the string of length zero). Do not include $\varepsilon$ in $\Sigma$.

### Counting Specific Symbols

We write $|w|_a$ to denote the number of occurrences of symbol $a$ in string $w$.

**Example:** If $w = 01001$ over $\Sigma = \{0, 1\}$:
- $|w|_0 = 3$
- $|w|_1 = 2$
- $|w| = |w|_0 + |w|_1 = 5$

---

## Operations on Strings

### Concatenation

The **concatenation** of strings $w_1$ and $w_2$, written $w_1 \cdot w_2$ or simply $w_1 w_2$, is the string formed by writing $w_1$ followed by $w_2$.

$$\text{If } w_1 = a_1 a_2 \cdots a_m \text{ and } w_2 = b_1 b_2 \cdots b_n$$

$$\text{then } w_1 w_2 = a_1 a_2 \cdots a_m b_1 b_2 \cdots b_n$$

**Examples:**
- $\text{ab} \cdot \text{cd} = \text{abcd}$
- $011 \cdot 10 = 01110$
- $w \cdot \varepsilon = \varepsilon \cdot w = w$ (for any string $w$)

### Properties of Concatenation

| Property | Statement | Meaning |
|---|---|---|
| Associativity | $(w_1 w_2) w_3 = w_1 (w_2 w_3)$ | Grouping doesn't matter |
| Identity | $w \varepsilon = \varepsilon w = w$ | $\varepsilon$ is the identity element |
| Length | $\|w_1 w_2\| = \|w_1\| + \|w_2\|$ | Lengths add up |
| NOT commutative | $w_1 w_2 \neq w_2 w_1$ in general | Order matters! |

**Non-commutativity example:** $\text{ab} \cdot \text{cd} = \text{abcd} \neq \text{cdab} = \text{cd} \cdot \text{ab}$

### String Reversal

The **reversal** of $w = a_1 a_2 \cdots a_n$, written $w^R$, is:

$$w^R = a_n a_{n-1} \cdots a_2 a_1$$

**Examples:**
- $(01101)^R = 10110$
- $(abc)^R = cba$
- $\varepsilon^R = \varepsilon$

**Properties of Reversal:**

$$|w^R| = |w|$$

$$(w^R)^R = w$$

$$(w_1 w_2)^R = w_2^R w_1^R$$

> Note the reversal of concatenation reverses the order — just like transposing a matrix product: $(AB)^T = B^T A^T$.

### String Power

The $n$-th **power** of string $w$ is $w$ concatenated with itself $n$ times:

$$w^0 = \varepsilon$$
$$w^1 = w$$
$$w^{n+1} = w^n \cdot w = w \cdot w^n$$

**Examples:**
- $(ab)^0 = \varepsilon$
- $(ab)^1 = ab$
- $(ab)^2 = abab$
- $(ab)^3 = ababab$
- $0^5 = 00000$

### Substrings, Prefixes, and Suffixes

Let $w = a_1 a_2 \cdots a_n$.

**Substring:** Any contiguous sequence $a_i a_{i+1} \cdots a_j$ where $1 \leq i \leq j \leq n$.

**Prefix:** A substring starting at position 1: $a_1 a_2 \cdots a_j$ for some $0 \leq j \leq n$.

**Suffix:** A substring ending at position $n$: $a_i a_{i+1} \cdots a_n$ for some $1 \leq i \leq n + 1$.

> Both $\varepsilon$ and $w$ itself are always a prefix and suffix of $w$ (the **trivial** prefix/suffix). A prefix/suffix is **proper** if it is not equal to $w$ itself.

**Example:** Let $w = abcb$.

| Prefixes | Suffixes | Some Substrings |
|---|---|---|
| $\varepsilon$ | $\varepsilon$ | $\varepsilon$ |
| $a$ | $b$ | $a$, $b$, $c$ |
| $ab$ | $cb$ | $ab$, $bc$, $cb$ |
| $abc$ | $bcb$ | $abc$, $bcb$ |
| $abcb$ | $abcb$ | $abcb$ |

---

## $\Sigma^*$ and $\Sigma^+$

### $\Sigma^n$: Strings of Length $n$

We define $\Sigma^n$ as the set of all strings of length exactly $n$ over $\Sigma$:

$$\Sigma^n = \{a_1 a_2 \cdots a_n \mid a_i \in \Sigma \text{ for all } i\}$$

$$|\Sigma^n| = |\Sigma|^n$$

**Example** with $\Sigma = \{0, 1\}$:
- $\Sigma^0 = \{\varepsilon\}$ (1 string)
- $\Sigma^1 = \{0, 1\}$ (2 strings)
- $\Sigma^2 = \{00, 01, 10, 11\}$ (4 strings)
- $\Sigma^3 = \{000, 001, 010, 011, 100, 101, 110, 111\}$ (8 strings)

### $\Sigma^*$: The Kleene Star

$$\Sigma^* = \Sigma^0 \cup \Sigma^1 \cup \Sigma^2 \cup \Sigma^3 \cup \cdots = \bigcup_{n=0}^{\infty} \Sigma^n$$

$\Sigma^*$ is the set of **all** strings over $\Sigma$, including the empty string $\varepsilon$.

### $\Sigma^+$: The Kleene Plus

$$\Sigma^+ = \Sigma^1 \cup \Sigma^2 \cup \Sigma^3 \cup \cdots = \bigcup_{n=1}^{\infty} \Sigma^n = \Sigma^* - \{\varepsilon\}$$

$\Sigma^+$ is the set of all **non-empty** strings over $\Sigma$.

### Properties

- $\Sigma^*$ is **countably infinite** (you can enumerate all strings in length order)
- $\varepsilon \in \Sigma^*$ but $\varepsilon \notin \Sigma^+$
- $\Sigma^+ = \Sigma^* - \{\varepsilon\}$
- $\Sigma^* = \Sigma^+ \cup \{\varepsilon\}$
- Every individual string is finite, but the set $\Sigma^*$ is infinite

> **Enumeration order** (canonical ordering): list all strings of length 0, then length 1, then length 2, etc. Within each length, use lexicographic order. For $\Sigma = \{0, 1\}$: $\varepsilon, 0, 1, 00, 01, 10, 11, 000, 001, \ldots$

---

## Languages

A **language** $L$ over alphabet $\Sigma$ is any subset of $\Sigma^*$:

$$L \subseteq \Sigma^*$$

A language is simply a set of strings. It can be finite or infinite, but each string in it must be finite.

### Examples of Languages

Over $\Sigma = \{0, 1\}$:

| Language | Description |
|---|---|
| $L_1 = \{0, 01, 011, 0111, \ldots\} = \{01^n \mid n \geq 0\}$ | Strings starting with $0$ followed by $1$s |
| $L_2 = \{w \in \Sigma^* \mid \|w\|_0 = \|w\|_1\}$ | Equal number of $0$s and $1$s |
| $L_3 = \{w \in \Sigma^* \mid w = w^R\}$ | Palindromes |
| $L_4 = \Sigma^*$ | All strings (the universal language) |
| $L_5 = \emptyset$ | No strings (the empty language) |
| $L_6 = \{\varepsilon\}$ | Only the empty string |

### Important Distinction: $\emptyset$ vs $\{\varepsilon\}$

These two languages look similar but are **completely different**:

| | $\emptyset$ | $\{\varepsilon\}$ |
|---|---|---|
| Number of strings | $0$ | $1$ |
| Contains $\varepsilon$? | No | Yes |
| Description | No string is accepted | Only the empty string is accepted |

This distinction matters enormously when building automata!

---

## Operations on Languages

Just as we have operations on strings, we have operations on languages.

### Union

$$L_1 \cup L_2 = \{w \mid w \in L_1 \text{ or } w \in L_2\}$$

**Example:** If $L_1 = \{0, 00\}$ and $L_2 = \{1, 11\}$, then $L_1 \cup L_2 = \{0, 00, 1, 11\}$.

### Intersection

$$L_1 \cap L_2 = \{w \mid w \in L_1 \text{ and } w \in L_2\}$$

### Difference

$$L_1 - L_2 = \{w \mid w \in L_1 \text{ and } w \notin L_2\}$$

### Complement

$$\bar{L} = \Sigma^* - L = \{w \in \Sigma^* \mid w \notin L\}$$

**Example:** If $\Sigma = \{0, 1\}$ and $L = \{0^n 1^n \mid n \geq 0\}$, then $\bar{L}$ contains all binary strings that are NOT of the form $0^n 1^n$.

### Concatenation of Languages

$$L_1 \cdot L_2 = \{xy \mid x \in L_1, \, y \in L_2\}$$

This is the set of all strings you can form by taking one string from $L_1$ and concatenating it with one string from $L_2$.

**Example:**

$$L_1 = \{a, ab\}, \quad L_2 = \{b, ba\}$$

$$L_1 \cdot L_2 = \{ab, aba, abb, abba\}$$

Breakdown:
- $a \cdot b = ab$
- $a \cdot ba = aba$
- $ab \cdot b = abb$
- $ab \cdot ba = abba$

### Properties of Language Concatenation

- $L \cdot \{\varepsilon\} = \{\varepsilon\} \cdot L = L$ (identity)
- $L \cdot \emptyset = \emptyset \cdot L = \emptyset$ (annihilator — concatenating with nothing gives nothing)
- NOT commutative in general: $L_1 \cdot L_2 \neq L_2 \cdot L_1$
- Associative: $(L_1 \cdot L_2) \cdot L_3 = L_1 \cdot (L_2 \cdot L_3)$

### Language Power

$$L^0 = \{\varepsilon\}$$
$$L^1 = L$$
$$L^{n+1} = L^n \cdot L$$

$L^n$ is the set of all strings formed by concatenating $n$ strings from $L$.

**Example:** If $L = \{ab, c\}$:
- $L^0 = \{\varepsilon\}$
- $L^1 = \{ab, c\}$
- $L^2 = \{abab, abc, cab, cc\}$
- $L^3 = \{ababab, ababc, abcab, abcc, cabab, cabc, ccab, ccc\}$

### Kleene Star of a Language

$$L^* = L^0 \cup L^1 \cup L^2 \cup L^3 \cup \cdots = \bigcup_{n=0}^{\infty} L^n$$

$L^*$ is the set of all strings formed by concatenating **zero or more** strings from $L$.

> Note: $\varepsilon \in L^*$ always (because $L^0 = \{\varepsilon\}$), regardless of whether $\varepsilon \in L$.

### Kleene Plus of a Language

$$L^+ = L^1 \cup L^2 \cup L^3 \cup \cdots = \bigcup_{n=1}^{\infty} L^n$$

$L^+$ contains all strings formed by concatenating **one or more** strings from $L$.

**Relationship:**

$$L^* = L^+ \cup \{\varepsilon\}$$

$$L^+ = L \cdot L^* = L^* \cdot L$$

### Important Special Cases

$$\emptyset^* = \{\varepsilon\}$$

(Concatenating zero strings from the empty language gives the empty string.)

$$\{\varepsilon\}^* = \{\varepsilon\}$$

(Any number of empty strings concatenated is still the empty string.)

---

## Why Languages Are Central to ToC

The **fundamental question** of computation theory is:

> Given a machine $M$ and an input string $w$, does $M$ accept $w$?

This is equivalent to asking: **is $w \in L(M)$?** where $L(M)$ is the language recognized by $M$.

Every computational problem can be reframed as a language membership question:

| Problem | Language |
|---|---|
| Is $n$ prime? | $L = \{w \in \{0,1\}^* \mid w$ is binary encoding of a prime$\}$ |
| Is graph $G$ connected? | $L = \{\langle G \rangle \mid G$ is a connected graph$\}$ |
| Does program $P$ halt? | $L = \{\langle P \rangle \mid P$ halts on empty input$\}$ |

The Chomsky hierarchy classifies languages by the computational power needed to decide membership:

$$\text{Regular} \subset \text{Context-Free} \subset \text{Context-Sensitive} \subset \text{Recursively Enumerable}$$

---

## Summary Table

| Concept | Notation | Definition |
|---|---|---|
| Alphabet | $\Sigma$ | Finite, non-empty set of symbols |
| String | $w$ | Finite sequence of symbols from $\Sigma$ |
| Empty string | $\varepsilon$ | Unique string of length $0$ |
| Length | $\|w\|$ | Number of symbols in $w$ |
| Concatenation | $w_1 w_2$ | $w_1$ followed by $w_2$ |
| Reversal | $w^R$ | $w$ written backwards |
| Power | $w^n$ | $w$ concatenated $n$ times |
| All strings | $\Sigma^*$ | Set of all finite strings over $\Sigma$ |
| Language | $L \subseteq \Sigma^*$ | Any set of strings |
| Language concat | $L_1 \cdot L_2$ | $\{xy \mid x \in L_1, y \in L_2\}$ |
| Kleene star | $L^*$ | Zero or more concatenations from $L$ |
| Complement | $\bar{L}$ | $\Sigma^* - L$ |

---

## Exercises

### Exercise 1

Let $\Sigma = \{a, b\}$. List all strings in $\Sigma^*$ of length $\leq 3$ in canonical order.

<details>
<summary><strong>Solution</strong></summary>

Length 0: $\varepsilon$

Length 1: $a, b$

Length 2: $aa, ab, ba, bb$

Length 3: $aaa, aab, aba, abb, baa, bab, bba, bbb$

Total: $1 + 2 + 4 + 8 = 15$ strings.

</details>

### Exercise 2

Let $L_1 = \{a, bb\}$ and $L_2 = \{b, ab\}$. Compute $L_1 \cdot L_2$.

<details>
<summary><strong>Solution</strong></summary>

$$L_1 \cdot L_2 = \{ab, aab, bbb, bbab\}$$

Breakdown:
- $a \cdot b = ab$
- $a \cdot ab = aab$
- $bb \cdot b = bbb$
- $bb \cdot ab = bbab$

</details>

### Exercise 3

Let $L = \{a, b\}$. What is $L^3$?

<details>
<summary><strong>Solution</strong></summary>

$L^3$ = all strings of length 3 over $\{a, b\}$:

$$L^3 = \{aaa, aab, aba, abb, baa, bab, bba, bbb\}$$

In general, $\{a, b\}^n = \{a, b\}^n$ (all strings of length $n$ over $\{a, b\}$) since every element of $L$ has length 1.

</details>

### Exercise 4

Prove: For any language $L$, $L^* = L^* \cdot L^*$.

<details>
<summary><strong>Solution</strong></summary>

**($\subseteq$):** If $w \in L^*$, then $w = w \cdot \varepsilon$ where $w \in L^*$ and $\varepsilon \in L^*$ (since $\varepsilon \in L^0 \subseteq L^*$). So $w \in L^* \cdot L^*$.

**($\supseteq$):** If $w \in L^* \cdot L^*$, then $w = xy$ where $x \in L^*$ and $y \in L^*$. So $x \in L^i$ and $y \in L^j$ for some $i, j \geq 0$. Then $w = xy \in L^{i+j} \subseteq L^*$.

Therefore $L^* = L^* \cdot L^*$. $\square$

</details>

### Exercise 5

Is the following true or false? $\emptyset^+ = \emptyset$

<details>
<summary><strong>Solution</strong></summary>

**True.** $\emptyset^+ = \emptyset^1 \cup \emptyset^2 \cup \emptyset^3 \cup \cdots$

$\emptyset^1 = \emptyset$ (no strings to pick from). By induction, $\emptyset^n = \emptyset$ for all $n \geq 1$.

So $\emptyset^+ = \emptyset \cup \emptyset \cup \cdots = \emptyset$.

Note the contrast: $\emptyset^* = \{\varepsilon\}$ but $\emptyset^+ = \emptyset$.

</details>

### Exercise 6

Let $\Sigma = \{0, 1\}$ and $L = \{w \in \Sigma^* \mid |w| \text{ is even}\}$. Describe $\bar{L}$.

<details>
<summary><strong>Solution</strong></summary>

$\bar{L} = \Sigma^* - L = \{w \in \Sigma^* \mid |w| \text{ is odd}\}$

This is the set of all binary strings with odd length.

</details>

---

## Formal Proofs Involving Strings

Many proofs in Theory of Computation involve string properties. Here are two common patterns.

### Proof by Induction on String Length

**Claim:** For all strings $w$ and $v$, $(wv)^R = v^R w^R$.

**Proof by induction on $|v|$:**

**Base case** ($|v| = 0$): $v = \varepsilon$.
$(w\varepsilon)^R = w^R = \varepsilon w^R = \varepsilon^R w^R$. ✓

**Inductive hypothesis:** Assume $(wv)^R = v^R w^R$ for strings $v$ with $|v| = k$.

**Inductive step:** Let $v' = va$ where $|v| = k$ and $a \in \Sigma$.

$$(wv')^R = (wva)^R = a(wv)^R = a \cdot v^R w^R$$

But also:

$$(v')^R w^R = (va)^R w^R = (a \cdot v^R) w^R = a \cdot v^R w^R$$

Both sides equal $a \cdot v^R w^R$. ✓ $\square$

### Counting Arguments

**Claim:** $|\Sigma^{\leq n}| = \frac{|\Sigma|^{n+1} - 1}{|\Sigma| - 1}$ for $|\Sigma| \geq 2$, where $\Sigma^{\leq n} = \bigcup_{i=0}^{n} \Sigma^i$.

**Proof:** This is a geometric series:

$$|\Sigma^{\leq n}| = \sum_{i=0}^{n} |\Sigma|^i = \frac{|\Sigma|^{n+1} - 1}{|\Sigma| - 1}$$

For $\Sigma = \{0, 1\}$ and $n = 3$: $\frac{2^4 - 1}{2 - 1} = 15$ strings total.

---

## What's Next?

Now that we have a precise vocabulary for strings and languages, we can study **formal grammars** — systems of rules that generate (define) languages. Grammars are the "generative" side of the coin, while automata are the "recognition" side.
