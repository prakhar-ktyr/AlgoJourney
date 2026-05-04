---
title: Regular Expressions
---

# Regular Expressions

In this lesson, you'll learn about **regular expressions** — a powerful algebraic notation for describing patterns in strings. Regular expressions provide a compact way to specify exactly which strings belong to a regular language, without drawing any automaton.

---

## What Are Regular Expressions?

A **regular expression** (regex) is a pattern that describes a set of strings — i.e., a language. Every regular expression defines a **regular language**, and every regular language can be described by a regular expression.

Think of regular expressions as a "formula language" for sets of strings:

| Regex | Language Described |
|-------|-------------------|
| $0$ | $\{0\}$ — just the string "0" |
| $01$ | $\{01\}$ — just the string "01" |
| $0 \cup 1$ | $\{0, 1\}$ — either "0" or "1" |
| $0^*$ | $\{\varepsilon, 0, 00, 000, \ldots\}$ — any number of 0s |

Regular expressions are used everywhere: text editors, compilers, search engines, input validation, and more. But before we get to practical usage, let's understand the formal mathematical definition.

---

## Formal Definition (Recursive)

Regular expressions are defined **recursively** (inductively). We build complex expressions from simpler ones using a small set of operations.

### Base Cases

The simplest regular expressions are:

1. **Empty set**: $\emptyset$ is a regular expression representing the empty language $L(\emptyset) = \{\}$

2. **Empty string**: $\varepsilon$ is a regular expression representing $L(\varepsilon) = \{\varepsilon\}$

3. **Single symbol**: For each symbol $a \in \Sigma$, the character $a$ is a regular expression with $L(a) = \{a\}$

### Inductive Cases

If $R_1$ and $R_2$ are regular expressions, then the following are also regular expressions:

#### Union (Alternation): $R_1 \cup R_2$

$$L(R_1 \cup R_2) = L(R_1) \cup L(R_2)$$

This matches any string that matches $R_1$ **or** $R_2$ (or both).

**Example:** $0 \cup 1$ matches either "0" or "1".

#### Concatenation: $R_1 \circ R_2$ or simply $R_1 R_2$

$$L(R_1 R_2) = L(R_1) \circ L(R_2) = \{xy \mid x \in L(R_1), y \in L(R_2)\}$$

This matches any string formed by a string from $R_1$ followed by a string from $R_2$.

**Example:** $(0 \cup 1) \cdot 0$ matches "00" or "10".

#### Kleene Star: $R_1^*$

$$L(R_1^*) = \{\varepsilon\} \cup L(R_1) \cup L(R_1)L(R_1) \cup L(R_1)L(R_1)L(R_1) \cup \cdots$$

This matches zero or more repetitions of strings from $R_1$.

**Example:** $0^*$ matches $\varepsilon$, "0", "00", "000", etc.

#### Parentheses for Grouping

Parentheses $(R)$ don't change the language but control how operations are grouped:

- $(0 \cup 1)^*$ means: take the union first, then apply star
- $0 \cup 1^*$ means: apply star to $1$ first, then take union with $0$

---

## Operator Precedence

When parentheses are omitted, operations bind in this order (tightest first):

$$\text{Star } (^*) \quad > \quad \text{Concatenation } (\circ) \quad > \quad \text{Union } (\cup)$$

**Example:** The expression $01^* \cup 1$ is parsed as:

$$\big(0 \cdot (1^*)\big) \cup 1$$

Not as $(01)^* \cup 1$ or $0(1^* \cup 1)$.

This is analogous to arithmetic where exponentiation binds tighter than multiplication, which binds tighter than addition.

| Regex | Arithmetic analogy |
|-------|--------------------|
| Star $R^*$ | Exponentiation $x^n$ |
| Concatenation $R_1 R_2$ | Multiplication $x \cdot y$ |
| Union $R_1 \cup R_2$ | Addition $x + y$ |

---

## Language of a Regular Expression: $L(R)$

The function $L(R)$ maps a regular expression to the language (set of strings) it describes:

$$L : \text{Regex} \to \mathcal{P}(\Sigma^*)$$

We define $L(R)$ recursively following the structure of $R$:

| Expression $R$ | Language $L(R)$ |
|----------------|-----------------|
| $\emptyset$ | $\{\}$ (empty set) |
| $\varepsilon$ | $\{\varepsilon\}$ |
| $a$ (for $a \in \Sigma$) | $\{a\}$ |
| $R_1 \cup R_2$ | $L(R_1) \cup L(R_2)$ |
| $R_1 R_2$ | $\{xy \mid x \in L(R_1), y \in L(R_2)\}$ |
| $R_1^*$ | $\bigcup_{i=0}^{\infty} L(R_1)^i$ |

---

## Examples of Regular Expressions

Let's work through several examples over the alphabet $\Sigma = \{0, 1\}$.

### Example 1: $0^* 1 0^*$

**Language:** Strings with **exactly one 1**.

$$L(0^*10^*) = \{1, 01, 10, 001, 010, 100, 0010, \ldots\}$$

**Why?** The $0^*$ before the 1 gives any number of leading 0s, the single $1$ is required, and the $0^*$ after gives any number of trailing 0s.

### Example 2: $(0 \cup 1)^*$

**Language:** **All binary strings** (including $\varepsilon$).

$$L((0 \cup 1)^*) = \Sigma^* = \{\varepsilon, 0, 1, 00, 01, 10, 11, 000, \ldots\}$$

**Note:** We often write $\Sigma^*$ as shorthand for $(0 \cup 1)^*$ when $\Sigma = \{0,1\}$.

### Example 3: $(0 \cup 1)^* 1 (0 \cup 1)$

**Language:** Strings whose **second-to-last** symbol is 1.

The regex says: any prefix ($\Sigma^*$), then a 1, then exactly one more symbol. So the 1 is always in the second-to-last position.

$$L = \{10, 11, 010, 011, 110, 111, 0010, \ldots\}$$

### Example 4: $\Sigma^* a b \Sigma^*$

**Language:** Strings **containing "ab"** as a substring (over any alphabet containing $a, b$).

### Example 5: $(ab)^*$

**Language:** Strings that are **repetitions of "ab"**.

$$L((ab)^*) = \{\varepsilon, ab, abab, ababab, \ldots\}$$

### Example 6: $(0 \cup \varepsilon)(1 \cup \varepsilon)$

**Language:** $\{\varepsilon, 0, 1, 01\}$

Each part independently chooses to include its symbol or not.

### Example 7: $1^* \emptyset$

**Language:** $\emptyset$ (the empty set!)

Concatenating anything with $\emptyset$ gives $\emptyset$ — you can't form a string if one part contributes nothing.

### Example 8: $\emptyset^*$

**Language:** $\{\varepsilon\}$

The Kleene star always includes $\varepsilon$ (zero repetitions), even when applied to the empty set.

---

## Algebraic Laws of Regular Expressions

Regular expressions satisfy many useful identities. Let $R$, $S$, $T$ be arbitrary regular expressions:

### Identity Elements

$$R \cup \emptyset = R \qquad \text{(}\emptyset\text{ is identity for union)}$$

$$R \circ \varepsilon = \varepsilon \circ R = R \qquad \text{(}\varepsilon\text{ is identity for concatenation)}$$

### Annihilator

$$R \circ \emptyset = \emptyset \circ R = \emptyset \qquad \text{(}\emptyset\text{ annihilates concatenation)}$$

### Idempotence

$$R \cup R = R$$

### Commutativity

$$R \cup S = S \cup R \qquad \text{(union is commutative)}$$

**Note:** Concatenation is **not** commutative! $ab \neq ba$ in general.

### Associativity

$$R \cup (S \cup T) = (R \cup S) \cup T$$

$$R(ST) = (RS)T$$

### Distributivity

$$R(S \cup T) = RS \cup RT \qquad \text{(left distribution)}$$

$$(S \cup T)R = SR \cup TR \qquad \text{(right distribution)}$$

### Star Properties

$$R^* = \varepsilon \cup R \cdot R^* \qquad \text{(unfolding)}$$

$$R^* = (RR)^* \cup R(RR)^* \qquad \text{(splitting even/odd)}$$

$$\emptyset^* = \varepsilon$$

$$\varepsilon^* = \varepsilon$$

$$(R^*)^* = R^* \qquad \text{(star is idempotent)}$$

---

## Formal Regex vs. Practical Regex

The formal definition above uses only three operations: union, concatenation, and Kleene star. Practical regex in programming languages (grep, Python, JavaScript) add many **shortcuts**:

### Common Extensions

| Shorthand | Meaning | Formal equivalent |
|-----------|---------|-------------------|
| $R^+$ | One or more | $R \cdot R^*$ |
| $R?$ | Zero or one | $R \cup \varepsilon$ |
| $[abc]$ | Character class | $a \cup b \cup c$ |
| $[a\text{-}z]$ | Range | $a \cup b \cup \cdots \cup z$ |
| $.$ (dot) | Any single character | Union of all symbols in $\Sigma$ |
| $R\{n\}$ | Exactly $n$ copies | $\underbrace{RR \cdots R}_{n}$ |
| $R\{m,n\}$ | Between $m$ and $n$ copies | $R^m \cup R^{m+1} \cup \cdots \cup R^n$ |

### Backreferences: Beyond Regular!

Practical regex engines support **backreferences** like `\1`, `\2` — these refer back to text matched by earlier groups.

**Example:** The pattern `(.*)\1` matches strings of the form $ww$ (a word repeated twice).

**Important:** The language $\{ww \mid w \in \Sigma^*\}$ is **not regular**! This means backreferences give practical regex engines power **beyond** regular languages. They can match some context-free (and even non-context-free) languages.

So practical "regular expressions" are actually more powerful than formal regular expressions — they are **not** limited to regular languages.

---

## Equivalence: Regex ↔ NFA ↔ DFA

One of the most important theorems in formal language theory:

$$\boxed{\text{Regular Expressions} \equiv \text{NFA} \equiv \text{DFA}}$$

All three formalisms describe exactly the same class of languages: the **regular languages**.

The equivalence is proven by showing conversions between all representations:

1. **Regex → NFA**: Thompson's construction (next lesson)
2. **NFA → DFA**: Subset construction (covered earlier)
3. **DFA → Regex**: State elimination (Lesson 18)

This means:
- Any language you can describe with a regex, you can recognize with a DFA
- Any language a DFA recognizes, you can write a regex for
- They are equally expressive

---

## Strategies for Writing Regular Expressions

Converting an English description to a regex takes practice. Here are useful strategies:

### Strategy 1: Break into Cases

If the language has natural cases, express each as a regex and take their union.

**Example:** "Binary strings that start or end with 1"

$$1(0 \cup 1)^* \cup (0 \cup 1)^* 1$$

### Strategy 2: Build Incrementally

Start with a simple part of the pattern and extend it.

**Example:** "Strings over $\{a, b\}$ with no two consecutive $a$'s"

- Between any two $a$'s, there must be at least one $b$
- Blocks look like: $a$ followed by $b^+$, or just $b$'s
- Full regex: $b^*(ab^+)^*(a \cup \varepsilon)$

### Strategy 3: Complement Thinking

Sometimes it's easier to describe what the language does NOT contain, then negate.

Since regular languages are closed under complement, you can:
1. Write a DFA for the complement
2. Swap accept/reject
3. Convert back to regex

### Strategy 4: Use Intersection

Express the language as an intersection of simpler languages, build DFAs for each, take the product construction, then convert to regex.

---

## Deconstructing Complex Regular Expressions

When you encounter a complex regex, break it down by applying the definition recursively.

### Example: $(1(01)^*(0 \cup \varepsilon)) \cup (0(10)^*(1 \cup \varepsilon))$

Let's analyze piece by piece:

**First alternative:** $1(01)^*(0 \cup \varepsilon)$
- Start with 1
- Followed by zero or more repetitions of "01"
- End with 0 or nothing

This generates: $\{1, 10, 101, 1010, 10101, 101010, \ldots\}$ — strings starting with 1 that alternate.

**Second alternative:** $0(10)^*(1 \cup \varepsilon)$
- Start with 0
- Followed by zero or more repetitions of "10"
- End with 1 or nothing

This generates: $\{0, 01, 010, 0101, 01010, 010101, \ldots\}$ — strings starting with 0 that alternate.

**Together:** All non-empty strings with no two consecutive identical symbols!

### Example: $((00)^*(11)^*)^*$

- Inner: $(00)^*$ is even-length blocks of 0s; $(11)^*$ is even-length blocks of 1s
- Concatenation: even-length 0s followed by even-length 1s
- Outer star: repeat that pattern any number of times

This generates all binary strings where both the total number of 0s and total number of 1s are even? No — that's not quite right because the repetitions can interleave.

Actually, each "round" contributes an even number of 0s and an even number of 1s. The outer star repeats this. So the total is: all strings where both the count of 0s and count of 1s are even.

Wait — what about $0011 00$? That has 4 zeros (even) and 2 ones (even), and we can decompose as $(00)(11) \cdot (00)(\varepsilon)$. ✓

What about $\varepsilon$? Yes, from zero repetitions of the outer star.

What about $0$? We'd need an odd number of 0s from $(00)^*$, but that only gives even counts. So "0" is NOT in the language. Correct — $0$ has one 0 (odd), so it shouldn't be.

---

## Converting Language Descriptions to Regex: More Strategies

### Strategy 5: State-Based Thinking

Sometimes it helps to think about what a DFA would look like, then convert.

**Example:** "Binary strings where every 0 is immediately followed by a 1"

Think: after seeing a 0, the next symbol MUST be 1. So the allowed patterns are: blocks of 1s and blocks of "01".

Regex: $(1 \cup 01)^*$

Verify: "1101" → $1 \cdot 1 \cdot 01$ ✓. "10" → starts with "10" but the 0 isn't followed by 1 at the end... wait: $1 \cdot 0$... the 0 isn't followed by anything. So "10" should NOT match.

$(1 \cup 01)^*$ generates: $\varepsilon$, 1, 01, 11, 011, 101, 111, 0101, ... Let's check "10": can we split as $(1)(0?)$... no, we can only pick "1" or "01" at each step. "10" would require picking "1" then "0", but "0" alone isn't an option. ✓ Correct!

### Strategy 6: Regex for "At Least / At Most / Exactly"

| Requirement | Pattern |
|-------------|---------|
| At least one $a$ | $\Sigma^* a \Sigma^*$ |
| At least two $a$'s | $\Sigma^* a \Sigma^* a \Sigma^*$ |
| At most one $a$ | $b^* (a \cup \varepsilon) b^*$ (for $\Sigma = \{a,b\}$) |
| Exactly one $a$ | $b^* a b^*$ |
| No $a$ at all | $b^*$ |

---

## Exercises with Solutions

### Exercise 1

Write a regular expression for the language over $\Sigma = \{0, 1\}$: all strings that contain the substring "110".

**Solution:**

$$(0 \cup 1)^* 110 (0 \cup 1)^*$$

Or equivalently: $\Sigma^* 110 \Sigma^*$

### Exercise 2

Write a regex for strings over $\{0, 1\}$ with an **even number of 0s**.

**Solution:**

$$(1^* 0 1^* 0 1^*)^* 1^*$$

**Explanation:** Each "round" through the starred part consumes exactly two 0s (with optional 1s around them). The outer star repeats this any number of times. The trailing $1^*$ allows ending with 1s.

A cleaner version:

$$(1^* 0 1^* 0)^* 1^*$$

### Exercise 3

Write a regex for strings over $\{a, b\}$ that start and end with different symbols.

**Solution:**

$$a(a \cup b)^* b \cup b(a \cup b)^* a$$

Two cases: start with $a$ and end with $b$, or start with $b$ and end with $a$.

### Exercise 4

Write a regex for strings over $\{0, 1\}$ of length exactly 3.

**Solution:**

$$(0 \cup 1)(0 \cup 1)(0 \cup 1)$$

### Exercise 5

Simplify: $(0 \cup 1)^* 0(0 \cup 1)^* 0 (0 \cup 1)^*$

**Solution:** This describes strings with **at least two 0s**.

It cannot be simplified much further, but we can write it more compactly as:

$$(0 \cup 1)^* 0 (0 \cup 1)^* 0 (0 \cup 1)^*$$

or $\Sigma^* 0 \Sigma^* 0 \Sigma^*$.

### Exercise 6

What language does $(\varepsilon \cup 0)1^*$ describe?

**Solution:**

- $(\varepsilon \cup 0)$ matches either the empty string or "0"
- $1^*$ matches any number of 1s

So the language is: $\{1^n \mid n \geq 0\} \cup \{01^n \mid n \geq 0\}$

In other words: the empty string, strings of all 1s, or a single 0 followed by any number of 1s.

### Exercise 7

Prove that $R^+ = RR^*$ is equivalent to $R^* = \varepsilon \cup R^+$.

**Solution:**

Starting from $R^+ = RR^*$:

$$R^* = \varepsilon \cup RR^* = \varepsilon \cup R^+$$

This follows because $R^*$ includes zero repetitions ($\varepsilon$) plus one or more repetitions ($R^+$). And $R^+ = RR^*$ means at least one copy of $R$ followed by zero or more.

### Exercise 8

Write a regex for the language over $\{a, b, c\}$: strings that contain "abc" as a subsequence (not necessarily contiguous).

**Solution:**

$$(a \cup b \cup c)^* a (a \cup b \cup c)^* b (a \cup b \cup c)^* c (a \cup b \cup c)^*$$

Or more compactly: $\Sigma^* a \Sigma^* b \Sigma^* c \Sigma^*$

The $\Sigma^*$ blocks allow any characters between the required $a$, $b$, $c$ (in that order).

### Exercise 9

What is the language of $(0^* 1^* 2^*)^*$ over $\Sigma = \{0, 1, 2\}$?

**Solution:**

$L = \Sigma^*$ — ALL strings over $\{0, 1, 2\}$.

**Why?** The inner expression $0^* 1^* 2^*$ already generates every single-character string:
- $0$: $0^1 1^0 2^0$
- $1$: $0^0 1^1 2^0$
- $2$: $0^0 1^0 2^1$

And also $\varepsilon$. Since $(0^* 1^* 2^*)^*$ is the star of a language containing all single characters, it generates all possible strings.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Regular expression | Algebraic notation for regular languages |
| Three operations | Union ($\cup$), concatenation ($\cdot$), Kleene star ($^*$) |
| Base cases | $\emptyset$, $\varepsilon$, single symbols |
| Precedence | Star > Concat > Union |
| Equivalence | Regex = NFA = DFA (same language class) |
| Practical regex | Add shortcuts ($+$, $?$, character classes) and backreferences |
| Backreferences | Go beyond regular languages! |

In the next lesson, we'll see how to systematically convert any regular expression into an NFA using **Thompson's Construction**.
