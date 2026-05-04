---
title: Ambiguity in Context-Free Grammars
---

# Ambiguity in Context-Free Grammars

Ambiguity is one of the most important concepts in grammar theory and compiler design. An ambiguous grammar can assign multiple meanings to the same string, which is unacceptable in programming languages where every expression must have exactly one interpretation.

---

## Definition of Ambiguity

A CFG $G$ is **ambiguous** if there exists a string $w \in L(G)$ that has:

- Two or more **distinct leftmost derivations**, or equivalently,
- Two or more **distinct rightmost derivations**, or equivalently,
- Two or more **distinct parse trees**

These three conditions are equivalent — a string has multiple leftmost derivations if and only if it has multiple parse trees.

### Formal Definition

$$G \text{ is ambiguous} \iff \exists\, w \in L(G) \text{ with two distinct parse trees}$$

---

## Example: Ambiguous Expression Grammar

Consider the simple expression grammar:

$$E \to E + E \mid E * E \mid (E) \mid id$$

The string $id + id * id$ has **two** distinct leftmost derivations:

### Derivation 1 (+ first):

$$E \Rightarrow_{lm} E + E \Rightarrow_{lm} id + E \Rightarrow_{lm} id + E * E$$
$$\Rightarrow_{lm} id + id * E \Rightarrow_{lm} id + id * id$$

### Derivation 2 (* first):

$$E \Rightarrow_{lm} E * E \Rightarrow_{lm} E + E * E \Rightarrow_{lm} id + E * E$$
$$\Rightarrow_{lm} id + id * E \Rightarrow_{lm} id + id * id$$

### Two Parse Trees:

**Tree 1** (interprets as $(id + id) * id$):

```
        E
      / | \
     E  *  E
   / | \   |
  E  +  E  id
  |     |
 id    id
```

**Tree 2** (interprets as $id + (id * id)$):

```
        E
      / | \
     E  +  E
     |   / | \
    id  E  *  E
        |     |
       id    id
```

These two trees give **different evaluation results!**

- Tree 1: $(3 + 5) * 2 = 16$
- Tree 2: $3 + (5 * 2) = 13$

---

## Why Ambiguity Matters

### In Compilers

A parser must produce a unique parse tree for each input program. If the grammar is ambiguous, the parser might:

- Choose the wrong interpretation
- Produce non-deterministic results
- Give different behavior on different platforms

### In Natural Language

English is full of ambiguity:

- "I saw the man with the telescope" (Who has the telescope?)
- "Time flies like an arrow" (Multiple parsings possible)

Programming languages must be **unambiguous** by design.

---

## Checking for Ambiguity

**Bad news:** There is no algorithm that can determine whether an arbitrary CFG is ambiguous. This is an **undecidable** problem.

**Practical approach:**
1. Try to find a string with two parse trees
2. If you can't, try to prove uniqueness of derivations
3. Use known patterns (like the expression grammar) to identify potential ambiguity

---

## Removing Ambiguity: Precedence and Associativity

The most common source of ambiguity in programming language grammars is **operator precedence** and **associativity**. We can remove ambiguity by encoding these into the grammar structure.

### Step 1: Establish Precedence

**Precedence** determines which operator "binds tighter." In arithmetic:

$$* \text{ has higher precedence than } +$$

To encode precedence in a grammar, use a **hierarchy of variables**:

- Higher precedence operators appear **deeper** in the grammar
- Each level can only "see" operators at its level or higher

### Step 2: Establish Associativity

**Associativity** determines how operators of the **same** precedence group:

- **Left-associative:** $a - b - c = (a - b) - c$ — use left recursion
- **Right-associative:** $a \hat{} b \hat{} c = a \hat{} (b \hat{} c)$ — use right recursion

### Unambiguous Expression Grammar

Original (ambiguous):

$$E \to E + E \mid E * E \mid (E) \mid id$$

Unambiguous version with $*$ higher precedence than $+$, both left-associative:

$$E \to E + T \mid T$$
$$T \to T * F \mid F$$
$$F \to (E) \mid id$$

**How it works:**

- $E$ handles addition (lowest precedence)
- $T$ handles multiplication (higher precedence)
- $F$ handles atoms and parenthesized expressions (highest precedence)

**Left recursion** in $E \to E + T$ forces left-associativity: $a + b + c$ parses as $(a + b) + c$.

**Now** $id + id * id$ has only **one** parse tree:

```
         E
       / | \
      E  +  T
      |    /|\
      T   T * F
      |   |   |
      F   F  id
      |   |
     id  id
```

This correctly interprets multiplication before addition.

---

## Extended Example: Full Arithmetic

Grammar with $+, -, *, /, \hat{}$ (exponentiation) and unary minus:

| Operator | Precedence | Associativity |
|----------|-----------|---------------|
| $\hat{}$ | Highest | Right |
| unary $-$ | High | Right (prefix) |
| $*, /$ | Medium | Left |
| $+, -$ | Lowest | Left |

$$E \to E + T \mid E - T \mid T$$
$$T \to T * U \mid T / U \mid U$$
$$U \to -U \mid P$$
$$P \to F \hat{} P \mid F$$
$$F \to (E) \mid id \mid num$$

**Key observations:**

- $P \to F \hat{} P$ uses **right recursion** → right-associative: $2\hat{}3\hat{}4 = 2\hat{}(3\hat{}4)$
- $T \to T * U$ uses **left recursion** → left-associative: $a * b * c = (a*b)*c$
- $U \to -U$ allows chaining: $--x$ is valid (double negation)

---

## The Dangling Else Problem

One of the most famous ambiguity problems in programming languages:

### Ambiguous Grammar

$$S \to \textbf{if } E \textbf{ then } S \textbf{ else } S$$
$$S \to \textbf{if } E \textbf{ then } S$$
$$S \to a$$

(where $a$ represents any other statement and $E$ represents a condition)

### The Problematic String

$$\textbf{if } E_1 \textbf{ then if } E_2 \textbf{ then } a_1 \textbf{ else } a_2$$

This has two parse trees:

**Interpretation 1:** else matches inner if

$$\textbf{if } E_1 \textbf{ then } [\textbf{if } E_2 \textbf{ then } a_1 \textbf{ else } a_2]$$

**Interpretation 2:** else matches outer if

$$\textbf{if } E_1 \textbf{ then } [\textbf{if } E_2 \textbf{ then } a_1] \textbf{ else } a_2$$

### Resolving the Dangling Else

**Convention:** The else always matches the **nearest** (most recent) unmatched if.

**Unambiguous grammar** using "matched" and "unmatched" statements:

$$S \to M \mid U$$
$$M \to \textbf{if } E \textbf{ then } M \textbf{ else } M \mid a$$
$$U \to \textbf{if } E \textbf{ then } S \mid \textbf{if } E \textbf{ then } M \textbf{ else } U$$

**Explanation:**

- $M$ (matched): every if has a matching else
- $U$ (unmatched): contains at least one if without else
- In $\textbf{if } E \textbf{ then } M \textbf{ else } U$: the then-clause must be fully matched (forcing the else to bind to the outer if)

This ensures the else always associates with the closest if.

### Modern Solution

Most modern languages avoid this entirely:

- **Python:** uses indentation (no ambiguity possible)
- **Rust/Go:** require braces `{ }` around all if/else bodies
- **Ruby:** uses explicit `end` keyword

---

## More Ambiguity Examples

### Example 1: $S \to SS \mid a$

The string $aaa$ has two parse trees:

**Tree 1:**
```
    S
   / \
  S   S
 / \  |
S   S  a
|   |
a   a
```

**Tree 2:**
```
    S
   / \
  S   S
  |  / \
  a S   S
    |   |
    a   a
```

Both yield $aaa$ but with different structure.

---

### Example 2: $S \to SS \mid (S) \mid \varepsilon$

The balanced parentheses grammar is ambiguous. The string $()()$ has multiple parse trees because $SS$ can split the string at different points.

**Unambiguous alternative:**

$$S \to (S)S \mid \varepsilon$$

This forces a unique parsing: always match the first open parenthesis, then continue.

---

### Example 3: List Grammar

Ambiguous:

$$L \to L, L \mid id$$

The string $id, id, id$ can be parsed as $(id, id), id$ or $id, (id, id)$.

Unambiguous (left-associative):

$$L \to L, id \mid id$$

Unambiguous (right-associative):

$$L \to id, L \mid id$$

---

## Inherently Ambiguous Languages

Some context-free languages are **inherently ambiguous** — meaning **every** CFG that generates them is ambiguous.

### Definition

A CFL $L$ is **inherently ambiguous** if every CFG $G$ with $L(G) = L$ is ambiguous.

### Classic Example

$$L = \{a^i b^j c^k \mid i = j \text{ or } j = k\}$$

This language is context-free (we showed a CFG earlier), but it is inherently ambiguous.

**Intuition:** For strings where $i = j = k$ (both conditions hold), any grammar must use two different "strategies" — one for $i = j$ and one for $j = k$. These strategies inevitably create two parse trees for such strings.

### Proof Sketch (Ogden's Lemma)

The formal proof uses **Ogden's lemma** (a strengthened version of the pumping lemma for CFLs) to show that any grammar for $L$ must have ambiguity for strings in $\{a^n b^n c^n \mid n \geq 1\}$.

### Other Inherently Ambiguous Languages

$$L_2 = \{a^i b^j \mid i = j \text{ or } i = 2j\}$$

For strings like $a^{2n} b^n$ where $i = 2j$, but also when $n = 0$: $\varepsilon$ satisfies both $i = j$ (both 0) and $i = 2j$ (both 0). The overlap region forces ambiguity.

---

## Ambiguity and Language Properties

### Key Facts

1. Ambiguity is a property of the **grammar**, not the **language** (except for inherently ambiguous languages).

2. A language may have both ambiguous and unambiguous grammars:
   - $L = \{a^n b^n \mid n \geq 0\}$ has the unambiguous grammar $S \to aSb \mid \varepsilon$

3. Determining whether a CFG is ambiguous is **undecidable**.

4. Determining whether a CFL is inherently ambiguous is also **undecidable**.

---

## Techniques for Proving Ambiguity

### Method 1: Find Two Parse Trees

Show a specific string $w$ with two distinct parse trees.

### Method 2: Count Derivations

Show a string has two distinct leftmost derivations.

### Method 3: Structural Argument

Identify a rule like $S \to SS$ that inherently allows different "split points."

---

## Techniques for Removing Ambiguity

### Technique 1: Layered Grammar (Precedence)

Create a hierarchy of variables, one per precedence level.

### Technique 2: Left/Right Recursion (Associativity)

- Left recursion → left-associative
- Right recursion → right-associative

### Technique 3: Restrict One Production

If $S \to SS \mid a$ is ambiguous, restrict to:
- $S \to aS \mid a$ (right-recursive, unambiguous)
- $S \to Sa \mid a$ (left-recursive, unambiguous)

### Technique 4: Add Delimiters

If ambiguity arises from unclear boundaries, add explicit delimiters:
- Instead of $S \to SS$, use $S \to (S)(S)$ or $S \to S;S$

---

## Ambiguity in Real Programming Languages

### C/C++ Type Casting

```c
(A)(B)(C)
```

Is this casting $C$ to type $B$ then to type $A$? Or calling function $(A)$ with argument $(B)(C)$?

### C++ Templates

```cpp
vector<vector<int>>
```

The `>>` was historically ambiguous — was it the right-shift operator or two closing angle brackets? (Fixed in C++11.)

### JavaScript Automatic Semicolon Insertion

```javascript
return
  value
```

Is this `return value` or `return; value;`? (ASI makes it the latter!)

---

## Exercises

### Exercise 1: Identifying Ambiguity

For each grammar, determine if it is ambiguous. If yes, find a string with two parse trees.

a) $S \to aS \mid Sa \mid a$

b) $S \to aSb \mid ab$

c) $S \to AB, \quad A \to aA \mid a, \quad B \to bB \mid b$

d) $S \to aSa \mid bSb \mid a \mid b \mid \varepsilon$

---

### Exercise 2: Removing Ambiguity

Make the following grammars unambiguous (preserving the generated language):

a) $S \to SS \mid aSb \mid \varepsilon$

b) $E \to E + E \mid E - E \mid E * E \mid num$ (with standard precedence and left-associativity)

c) $S \to S \textbf{ and } S \mid S \textbf{ or } S \mid \textbf{not } S \mid \textbf{true} \mid \textbf{false}$
(Precedence: not > and > or; and/or are left-associative)

---

### Exercise 3: Dangling Else

Show the two parse trees for:

$$\textbf{if } a \textbf{ then if } b \textbf{ then } c \textbf{ else if } d \textbf{ then } e \textbf{ else } f$$

using the ambiguous if-then-else grammar.

---

### Exercise 4: Inherent Ambiguity

a) Explain intuitively why $L = \{a^i b^j c^k \mid i = j \text{ or } j = k\}$ is inherently ambiguous.

b) Give two different parse trees for the string $a^2 b^2 c^2$ in the grammar:

$$S \to XC \mid AY$$
$$X \to aXb \mid \varepsilon$$
$$C \to cC \mid \varepsilon$$
$$A \to aA \mid \varepsilon$$
$$Y \to bYc \mid \varepsilon$$

---

### Exercise 5: Proof

Prove that $S \to aSb \mid \varepsilon$ is unambiguous by showing every string $a^n b^n$ has exactly one leftmost derivation.

**Hint:** Use induction on $n$.

---

### Exercise 6: Grammar Design

Design an **unambiguous** grammar for each language:

a) Boolean expressions with operators AND, OR, NOT, and atoms T, F (standard precedence)

b) Comma-separated lists of expressions where each expression uses $+$ and $*$ with standard precedence

c) $\{a^i b^j c^k \mid i + k = j, \; i \geq 1, \; k \geq 1\}$

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Ambiguous grammar | Has a string with two distinct parse trees |
| Inherently ambiguous | Every grammar for the language is ambiguous |
| Removing ambiguity | Use precedence hierarchy and recursion direction |
| Dangling else | Classic ambiguity; resolved by "match nearest if" rule |
| Undecidability | Cannot algorithmically determine if a grammar is ambiguous |

---

## What's Next?

In the next lesson, we'll learn how to **simplify** context-free grammars by eliminating epsilon productions, unit productions, and useless symbols — preparing grammars for conversion to normal forms.
