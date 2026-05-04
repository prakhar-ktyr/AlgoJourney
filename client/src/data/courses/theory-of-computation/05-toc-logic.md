---
title: Logic and Proofs
---

# Logic and Proofs

Logic is the language of rigorous reasoning. In Theory of Computation, every claim — "this language is not regular," "the Halting Problem is undecidable," "$P \neq NP$" — must be established through **proof**. This lesson gives you the logical foundations and proof techniques you'll use throughout the course.

---

## Propositional Logic

Propositional logic deals with **propositions** — statements that are either true or false, with no ambiguity.

### Propositions

A **proposition** is a declarative sentence with a definite truth value.

**Propositions:**
- "5 is a prime number" (TRUE)
- "$2 + 2 = 5$" (FALSE)
- "Every finite automaton has at least one state" (TRUE)

**Not propositions:**
- "What time is it?" (question)
- "Close the door" (command)
- "$x > 3$" (depends on $x$ — this is a predicate, not a proposition)

We typically use lowercase letters $p, q, r, s$ to denote propositions.

---

### Logical Connectives

We build complex propositions from simpler ones using **connectives**:

| Connective | Symbol | Name | Read as |
|-----------|--------|------|---------|
| Negation | $\neg p$ | NOT | "not $p$" |
| Conjunction | $p \land q$ | AND | "$p$ and $q$" |
| Disjunction | $p \lor q$ | OR | "$p$ or $q$" |
| Implication | $p \Rightarrow q$ | IMPLIES | "if $p$ then $q$" |
| Biconditional | $p \Leftrightarrow q$ | IFF | "$p$ if and only if $q$" |

---

### Truth Tables

Truth tables define the meaning of each connective by listing outputs for all possible input combinations.

#### Negation ($\neg$)

| $p$ | $\neg p$ |
|-----|----------|
| T | F |
| F | T |

Negation flips the truth value.

---

#### Conjunction ($\land$)

| $p$ | $q$ | $p \land q$ |
|-----|-----|-------------|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | F |

$p \land q$ is true only when BOTH are true.

---

#### Disjunction ($\lor$)

| $p$ | $q$ | $p \lor q$ |
|-----|-----|-------------|
| T | T | T |
| T | F | T |
| F | T | T |
| F | F | F |

$p \lor q$ is true when AT LEAST ONE is true. (This is inclusive or.)

---

#### Implication ($\Rightarrow$)

| $p$ | $q$ | $p \Rightarrow q$ |
|-----|-----|-------------------|
| T | T | T |
| T | F | F |
| F | T | T |
| F | F | T |

This is the most subtle connective. Key insight: **an implication is false ONLY when the premise is true and the conclusion is false.** When the premise is false, the implication is **vacuously true**.

**Example:** "If it rains, I will carry an umbrella."
- Rains + umbrella = TRUE (promise kept)
- Rains + no umbrella = FALSE (promise broken)
- No rain + umbrella = TRUE (promise not violated)
- No rain + no umbrella = TRUE (promise not violated)

**Terminology:** In $p \Rightarrow q$:
- $p$ is the **hypothesis** (antecedent, premise)
- $q$ is the **conclusion** (consequent)
- $q \Rightarrow p$ is the **converse**
- $\neg p \Rightarrow \neg q$ is the **inverse**
- $\neg q \Rightarrow \neg p$ is the **contrapositive**

**Critical fact:** An implication and its contrapositive are logically equivalent:

$$p \Rightarrow q \equiv \neg q \Rightarrow \neg p$$

---

#### Biconditional ($\Leftrightarrow$)

| $p$ | $q$ | $p \Leftrightarrow q$ |
|-----|-----|----------------------|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | T |

$p \Leftrightarrow q$ is true when $p$ and $q$ have the same truth value. It means $(p \Rightarrow q) \land (q \Rightarrow p)$.

---

### Tautology, Contradiction, Contingency

- A **tautology** is a formula that is always true regardless of the truth values of its variables.
  - Example: $p \lor \neg p$ (law of excluded middle)
  - Example: $(p \Rightarrow q) \Leftrightarrow (\neg p \lor q)$

- A **contradiction** is a formula that is always false.
  - Example: $p \land \neg p$

- A **contingency** is a formula that is neither a tautology nor a contradiction.
  - Example: $p \lor q$

---

### Important Logical Equivalences

Two formulas are **logically equivalent** (written $\equiv$) if they have the same truth table.

#### De Morgan's Laws

$$\neg(p \land q) \equiv \neg p \lor \neg q$$

$$\neg(p \lor q) \equiv \neg p \land \neg q$$

"The negation of AND is OR of negations. The negation of OR is AND of negations."

#### Implication as Disjunction

$$p \Rightarrow q \equiv \neg p \lor q$$

This is extremely useful: "if $p$ then $q$" means "either $p$ is false, or $q$ is true."

#### Contrapositive

$$p \Rightarrow q \equiv \neg q \Rightarrow \neg p$$

#### Double Negation

$$\neg(\neg p) \equiv p$$

#### Distributive Laws

$$p \land (q \lor r) \equiv (p \land q) \lor (p \land r)$$

$$p \lor (q \land r) \equiv (p \lor q) \land (p \lor r)$$

#### Absorption Laws

$$p \lor (p \land q) \equiv p$$

$$p \land (p \lor q) \equiv p$$

#### Commutativity and Associativity

$\land$ and $\lor$ are both commutative and associative, just like $\cap$ and $\cup$ for sets. This is no coincidence — propositional logic and set theory are deeply connected (Boolean algebra).

---

## Predicate Logic

Propositional logic cannot express statements about "all" or "some" elements. **Predicate logic** (first-order logic) adds this power.

### Predicates

A **predicate** is a statement containing variables that becomes a proposition once the variables are given values.

**Examples:**
- $P(x)$: "$x$ is a prime number" — $P(7)$ is true, $P(4)$ is false
- $Q(x, y)$: "$x < y$" — $Q(3, 5)$ is true, $Q(5, 3)$ is false
- $R(n)$: "$n$ is divisible by 3" — $R(9)$ is true, $R(7)$ is false

The **domain of discourse** (or universe) is the set of values the variables can take.

---

### Universal Quantifier ($\forall$)

$\forall x \, P(x)$ means "for all $x$ in the domain, $P(x)$ is true."

**Examples:**
- $\forall x \in \mathbb{R}, \, x^2 \geq 0$ — TRUE (every real number squared is non-negative)
- $\forall n \in \mathbb{N}, \, n + 1 > n$ — TRUE
- $\forall x \in \mathbb{R}, \, x > 0$ — FALSE ($x = -1$ is a counterexample)

To **disprove** $\forall x \, P(x)$, you need just ONE counterexample.

---

### Existential Quantifier ($\exists$)

$\exists x \, P(x)$ means "there exists at least one $x$ in the domain such that $P(x)$ is true."

**Examples:**
- $\exists x \in \mathbb{R}, \, x^2 = 2$ — TRUE ($x = \sqrt{2}$)
- $\exists n \in \mathbb{N}, \, n^2 = n$ — TRUE ($n = 0$ or $n = 1$)
- $\exists x \in \mathbb{R}, \, x^2 < 0$ — FALSE (no real number has negative square)

To **prove** $\exists x \, P(x)$, you need just ONE witness (example).

---

### Bound vs. Free Variables

A variable is **bound** if it's governed by a quantifier; otherwise it's **free**.

In $\forall x \, (P(x) \land Q(x, y))$:
- $x$ is bound (governed by $\forall x$)
- $y$ is free (not quantified)

A formula with no free variables is a **sentence** — it has a definite truth value.

---

### Nested Quantifiers

Quantifiers can be nested, and **order matters**:

$$\forall x \, \exists y \, (x + y = 0)$$

"For every $x$, there exists a $y$ such that $x + y = 0$."

This is TRUE in $\mathbb{Z}$: for any $x$, choose $y = -x$.

$$\exists y \, \forall x \, (x + y = 0)$$

"There exists a $y$ such that for all $x$, $x + y = 0$."

This is FALSE: no single $y$ works for all $x$.

**Rule:** $\forall x \, \exists y$ means $y$ can depend on $x$. $\exists y \, \forall x$ means one $y$ must work for ALL $x$.

---

### Negation of Quantifiers

These rules are essential and appear constantly in proofs:

$$\neg(\forall x \, P(x)) \equiv \exists x \, \neg P(x)$$

"Not everything satisfies $P$" $\equiv$ "Something fails to satisfy $P$"

$$\neg(\exists x \, P(x)) \equiv \forall x \, \neg P(x)$$

"Nothing satisfies $P$" $\equiv$ "Everything fails to satisfy $P$"

**Example:** Negation of "All students passed":

$$\neg(\forall s, \text{passed}(s)) \equiv \exists s, \neg\text{passed}(s)$$

"There exists a student who did NOT pass."

**Nested negation example:** Negate $\forall x \, \exists y \, (x + y = 0)$:

$$\exists x \, \forall y \, (x + y \neq 0)$$

"There exists an $x$ for which no $y$ satisfies $x + y = 0$." (FALSE in $\mathbb{Z}$, as expected.)

---

## Proof Techniques

Now for the tools you'll use to establish theorems throughout this course.

---

### Direct Proof

To prove $p \Rightarrow q$: assume $p$ is true, then use logical steps to show $q$ must be true.

**Example:** Prove that if $n$ is even, then $n^2$ is even.

**Proof:** Assume $n$ is even. Then $n = 2k$ for some integer $k$.

$$n^2 = (2k)^2 = 4k^2 = 2(2k^2)$$

Since $2k^2$ is an integer, $n^2 = 2m$ where $m = 2k^2$. Therefore $n^2$ is even. $\square$

---

### Proof by Contrapositive

To prove $p \Rightarrow q$: instead prove the equivalent $\neg q \Rightarrow \neg p$.

This is useful when the contrapositive is easier to work with.

**Example:** Prove that if $n^2$ is even, then $n$ is even.

**Proof (by contrapositive):** We prove: if $n$ is odd, then $n^2$ is odd.

Assume $n$ is odd. Then $n = 2k + 1$ for some integer $k$.

$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

Since $2k^2 + 2k$ is an integer, $n^2$ is odd. $\square$

---

### Proof by Contradiction

To prove statement $P$: assume $\neg P$ and derive a contradiction (show that $\neg P$ leads to something impossible).

**Example:** Prove that $\sqrt{2}$ is irrational.

**Proof:** Assume for contradiction that $\sqrt{2}$ is rational. Then $\sqrt{2} = p/q$ where $p, q \in \mathbb{Z}$, $q \neq 0$, and $\gcd(p, q) = 1$ (reduced form).

Squaring: $2 = p^2/q^2$, so $p^2 = 2q^2$.

This means $p^2$ is even, so $p$ is even (by the previous theorem). Write $p = 2k$.

Then $(2k)^2 = 2q^2$, so $4k^2 = 2q^2$, giving $q^2 = 2k^2$.

This means $q^2$ is even, so $q$ is even.

But then both $p$ and $q$ are even, contradicting $\gcd(p, q) = 1$.

**Contradiction!** Therefore $\sqrt{2}$ is irrational. $\square$

---

### Proof by Cases

To prove a statement, split into exhaustive cases and prove each separately.

**Example:** Prove that for all $n \in \mathbb{Z}$, $n^2 + n$ is even.

**Proof:** We consider two cases.

**Case 1:** $n$ is even. Then $n = 2k$, so $n^2 + n = 4k^2 + 2k = 2(2k^2 + k)$, which is even.

**Case 2:** $n$ is odd. Then $n = 2k + 1$, so:

$$n^2 + n = (2k+1)^2 + (2k+1) = 4k^2 + 4k + 1 + 2k + 1 = 4k^2 + 6k + 2 = 2(2k^2 + 3k + 1)$$

which is even.

In both cases, $n^2 + n$ is even. $\square$

---

### Constructive vs. Non-Constructive Proofs

A **constructive** proof demonstrates existence by explicitly providing a witness.

A **non-constructive** proof shows something exists without revealing what it is.

**Non-constructive example:** Prove that there exist irrational numbers $a, b$ such that $a^b$ is rational.

**Proof:** Consider $\sqrt{2}^{\sqrt{2}}$. This number is either rational or irrational.

**Case 1:** $\sqrt{2}^{\sqrt{2}}$ is rational. Then take $a = b = \sqrt{2}$ (both irrational), and $a^b$ is rational. Done.

**Case 2:** $\sqrt{2}^{\sqrt{2}}$ is irrational. Then take $a = \sqrt{2}^{\sqrt{2}}$ and $b = \sqrt{2}$.

$$a^b = (\sqrt{2}^{\sqrt{2}})^{\sqrt{2}} = \sqrt{2}^{\sqrt{2} \cdot \sqrt{2}} = \sqrt{2}^2 = 2$$

which is rational. Done.

In either case, we've found irrational $a, b$ with $a^b$ rational. But we don't know WHICH case holds! This is a valid proof of existence without explicit construction. $\square$

---

### Mathematical Induction (Preview)

Induction proves statements about all natural numbers. We'll cover it in detail in the next lesson, but here's the structure:

To prove $\forall n \geq n_0, \, P(n)$:

1. **Base case:** Prove $P(n_0)$
2. **Inductive step:** Prove $\forall k \geq n_0, \, P(k) \Rightarrow P(k+1)$

From these two facts, we conclude $P(n)$ for all $n \geq n_0$.

---

## Additional Proof Examples

### Example: Every finite automaton has a finite language or an infinite language

**Claim:** If a DFA with $n$ states accepts a string of length $\geq n$, then it accepts infinitely many strings.

**Proof (sketch using Pigeonhole Principle):** If a string $w$ of length $\geq n$ is accepted, the computation visits $\geq n + 1$ states (including the start). Since there are only $n$ states, some state $q$ is visited twice. The portion of input between the two visits to $q$ forms a loop that can be repeated any number of times, generating infinitely many accepted strings. $\square$

This is a direct proof using the pigeonhole principle — a technique you'll see formalized as the "Pumping Lemma."

---

### Example: The complement of a regular language is regular

**Claim:** If $L$ is a regular language, then $\bar{L} = \Sigma^* - L$ is also regular.

**Proof:** Since $L$ is regular, there exists a DFA $M = (Q, \Sigma, \delta, q_0, F)$ that recognizes $L$.

Construct $M' = (Q, \Sigma, \delta, q_0, Q - F)$.

$M'$ is identical to $M$ except that accepting and non-accepting states are swapped.

For any string $w$: $M'$ accepts $w$ iff $M$ rejects $w$ iff $w \notin L$ iff $w \in \bar{L}$.

Therefore $M'$ recognizes $\bar{L}$, and since $M'$ is a DFA, $\bar{L}$ is regular. $\square$

---

## Common Logical Pitfalls

### Affirming the Consequent (INVALID)

$$p \Rightarrow q, \quad q \quad \therefore \quad p \quad \text{WRONG!}$$

"If it rains, the ground is wet. The ground is wet. Therefore it rained." — Maybe someone used a hose!

### Denying the Antecedent (INVALID)

$$p \Rightarrow q, \quad \neg p \quad \therefore \quad \neg q \quad \text{WRONG!}$$

"If it rains, the ground is wet. It didn't rain. Therefore the ground isn't wet." — Again, the hose.

### Converse Error

The converse $q \Rightarrow p$ is NOT equivalent to $p \Rightarrow q$. Don't confuse them.

### Vacuous Truth

$\forall x \in \emptyset, \, P(x)$ is TRUE for any $P$. This is vacuously true because there are no elements to check.

"All unicorns can fly" is vacuously true if unicorns don't exist!

---

## Why Proofs Matter in ToC

In Theory of Computation, intuition can be misleading. Many results are counterintuitive:

- NFAs with exponentially fewer states than equivalent DFAs
- Undecidable problems that "look" decidable
- Problems that seem different but are equally hard (NP-complete reductions)

Without rigorous proof, you cannot:
- Claim a language is not regular (you need the pumping lemma)
- Claim a problem is undecidable (you need a reduction)
- Claim a problem is NP-complete (you need a polynomial reduction from a known NP-complete problem)

Every major result in this course comes with a proof. By learning proof techniques now, you'll be ready to follow — and eventually construct — these arguments.

---

## Exercises

### Exercise 1

Construct a truth table for $(p \Rightarrow q) \land (q \Rightarrow p)$ and verify it equals $p \Leftrightarrow q$.

**Solution:**

| $p$ | $q$ | $p \Rightarrow q$ | $q \Rightarrow p$ | $(p \Rightarrow q) \land (q \Rightarrow p)$ | $p \Leftrightarrow q$ |
|-----|-----|----|----|----|----|
| T | T | T | T | T | T |
| T | F | F | T | F | F |
| F | T | T | F | F | F |
| F | F | T | T | T | T |

The last two columns are identical, confirming $(p \Rightarrow q) \land (q \Rightarrow p) \equiv p \Leftrightarrow q$. $\square$

---

### Exercise 2

Negate the statement: "For every positive integer $n$, there exists a prime $p$ such that $p > n$."

**Solution:**

Original: $\forall n \in \mathbb{Z}^+, \, \exists p \in \text{Primes}, \, p > n$

Negation: $\exists n \in \mathbb{Z}^+, \, \forall p \in \text{Primes}, \, p \leq n$

In English: "There exists a positive integer $n$ such that every prime is at most $n$." (This would mean there are finitely many primes — which is false by Euclid's theorem.)

---

### Exercise 3

Prove by contradiction that there are infinitely many prime numbers.

**Solution:**

Assume for contradiction that there are finitely many primes: $p_1, p_2, \ldots, p_k$.

Consider the number $N = p_1 \cdot p_2 \cdots p_k + 1$.

$N > 1$, so $N$ has a prime factor $p$.

For each $p_i$ in our list: $N \mod p_i = 1 \neq 0$, so $p_i \nmid N$.

Therefore $p$ is not in our list — contradiction with the assumption that the list contains ALL primes.

Hence there are infinitely many primes. $\square$

---

### Exercise 4

Prove by cases that $|xy| = |x| \cdot |y|$ for all $x, y \in \mathbb{R}$, where $|a|$ denotes absolute value.

**Solution:**

Consider four cases based on the signs of $x$ and $y$:

**Case 1:** $x \geq 0, y \geq 0$. Then $xy \geq 0$, so $|xy| = xy = |x| \cdot |y|$.

**Case 2:** $x \geq 0, y < 0$. Then $xy \leq 0$, so $|xy| = -xy = x \cdot (-y) = |x| \cdot |y|$.

**Case 3:** $x < 0, y \geq 0$. Then $xy \leq 0$, so $|xy| = -xy = (-x) \cdot y = |x| \cdot |y|$.

**Case 4:** $x < 0, y < 0$. Then $xy > 0$, so $|xy| = xy = (-x)(-y) = |x| \cdot |y|$.

In all cases, $|xy| = |x| \cdot |y|$. $\square$

---

### Exercise 5

Prove that for all $n \in \mathbb{Z}$, if $3 \nmid n$ then $3 \mid (n^2 - 1)$.

**Solution (by cases):**

If $3 \nmid n$, then $n \mod 3 = 1$ or $n \mod 3 = 2$.

**Case 1:** $n = 3k + 1$ for some integer $k$.

$$n^2 - 1 = (3k+1)^2 - 1 = 9k^2 + 6k + 1 - 1 = 9k^2 + 6k = 3(3k^2 + 2k)$$

So $3 \mid (n^2 - 1)$. ✓

**Case 2:** $n = 3k + 2$ for some integer $k$.

$$n^2 - 1 = (3k+2)^2 - 1 = 9k^2 + 12k + 4 - 1 = 9k^2 + 12k + 3 = 3(3k^2 + 4k + 1)$$

So $3 \mid (n^2 - 1)$. ✓

In both cases, the result holds. $\square$

---

## Key Takeaways

- **Propositional logic** uses connectives ($\neg, \land, \lor, \Rightarrow, \Leftrightarrow$) to build compound statements
- **Truth tables** define connective semantics; an implication is false only when T $\Rightarrow$ F
- **Predicate logic** adds quantifiers $\forall$ and $\exists$ for reasoning about collections
- **Negating quantifiers** swaps $\forall \leftrightarrow \exists$ and negates the predicate
- **Direct proof**, **contrapositive**, **contradiction**, and **cases** are the core proof techniques
- **Proofs are essential** in ToC — intuition alone is insufficient for establishing fundamental results

---

## Next Lesson

In the next lesson, we'll study **Mathematical Induction** — the proof technique specifically designed for proving statements about all natural numbers (and by extension, all strings of all lengths, all computations of all durations, and all automata of all sizes).
