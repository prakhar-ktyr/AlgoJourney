---
title: Oracle Turing Machines and the Arithmetical Hierarchy
---

# Oracle Turing Machines and the Arithmetical Hierarchy

In this lesson, you will learn how to extend Turing machines with **oracles** — magical black boxes that instantly answer questions about any language. This leads to the **Arithmetical Hierarchy**, a beautiful classification of undecidable problems by difficulty.

---

## Motivation

We know $A_{TM}$ (the halting problem) is undecidable. But are all undecidable problems equally hard?

It turns out: **no**. There is a rich structure among undecidable problems. Some are "more undecidable" than others.

To explore this, we give Turing machines access to **oracles**.

---

## What Is an Oracle?

An **oracle** for a language $O \subseteq \Sigma^*$ is a magical device that can instantly tell you whether any string $w$ is in $O$.

Think of it as an infinitely powerful subroutine:

- You give it a string $w$
- It immediately answers YES ($w \in O$) or NO ($w \notin O$)
- It takes exactly **one step**, regardless of how hard $O$ is to decide

---

## Oracle Turing Machine: Formal Definition

An **Oracle Turing Machine** (OTM) $M^O$ is a standard TM augmented with:

1. **Oracle tape**: a special read/write tape for queries
2. **Query state** $q_{query}$: when entered, the oracle is consulted
3. **Answer states** $q_{yes}$ and $q_{no}$: the machine transitions to one of these based on the oracle's answer

### How a Query Works

When $M^O$ enters state $q_{query}$:

1. Let $w$ = contents of the oracle tape
2. If $w \in O$: machine moves to state $q_{yes}$
3. If $w \notin O$: machine moves to state $q_{no}$
4. This happens in a **single step**

The machine can make as many queries as it wants during its computation.

---

## Notation

$$
M^O = \text{Turing machine } M \text{ with oracle for language } O
$$

We say $M^O$ **decides** language $L$ if $M$ with access to oracle $O$ correctly accepts/rejects every string in/not in $L$.

---

## Example: Deciding $A_{TM}$ with an Oracle

$A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}$ is undecidable.

But with an oracle for $A_{TM}$ itself, we can decide many problems that were previously impossible.

**Example**: Decide $E_{TM} = \{\langle M \rangle \mid L(M) = \emptyset\}$ using an $A_{TM}$-oracle.

**Construction of** $D^{A_{TM}}$:

1. On input $\langle M \rangle$
2. For each string $w \in \Sigma^*$ (enumerate them):
   - Query the oracle: "Is $\langle M, w \rangle \in A_{TM}$?"
   - If oracle says YES: **reject** (language is not empty)
3. If all queries return NO: **accept** (language is empty)

Wait — step 3 never terminates if we enumerate infinitely many strings!

**Better approach**: Use dovetailing:

1. On input $\langle M \rangle$
2. For $i = 1, 2, 3, \ldots$:
   - For each $w$ with $|w| \leq i$:
     - Query oracle: "Does $M$ accept $w$?"
     - If YES: reject
3. Accept if no $w$ is ever accepted

Actually, with an oracle, we don't need dovetailing. We can query:

"Does there exist $w$ such that $M$ accepts $w$?"

But that's not a single membership query. Instead, we use:

$$
D^{A_{TM}}(\langle M \rangle): \text{ Reject if } \exists w: \text{oracle says } \langle M, w \rangle \in A_{TM}
$$

This requires checking all $w$ — still an issue. The key insight: $E_{TM}$ is decidable relative to $A_{TM}$ because we can systematically check.

---

## Turing Reducibility

**Definition**: Language $A$ is **Turing reducible** to language $B$ (written $A \leq_T B$) if there exists an oracle TM $M$ such that:

$$
M^B \text{ decides } A
$$

In words: $A$ is decidable using $B$ as an oracle.

### Comparison with Mapping Reduction

Recall mapping reduction: $A \leq_m B$ means there's a computable function $f$ with $w \in A \iff f(w) \in B$.

**Fact**: Mapping reduction is a special case of Turing reduction:

$$
A \leq_m B \implies A \leq_T B
$$

But not vice versa! Turing reduction is strictly more powerful.

### Example: $A_{TM} \leq_T \overline{A_{TM}}$

With an oracle for $\overline{A_{TM}}$, we can decide $A_{TM}$:

- Query the oracle about $\langle M, w \rangle$
- If oracle says YES (meaning $\langle M, w \rangle \in \overline{A_{TM}}$, i.e., $M$ does NOT accept $w$): reject
- If oracle says NO: accept

Note: $A_{TM} \not\leq_m \overline{A_{TM}}$ (since $A_{TM}$ is r.e. but $\overline{A_{TM}}$ is not). So Turing reduction is indeed more general.

---

## Properties of Turing Reducibility

1. **Reflexive**: $A \leq_T A$ (use the oracle to decide itself)
2. **Transitive**: $A \leq_T B$ and $B \leq_T C$ implies $A \leq_T C$
   - Simulate the $B$-oracle using the $C$-oracle
3. **Not antisymmetric**: $A \leq_T B$ and $B \leq_T A$ doesn't mean $A = B$
   - Example: $A_{TM} \leq_T \overline{A_{TM}}$ and $\overline{A_{TM}} \leq_T A_{TM}$

---

## Turing Degrees

Since $\leq_T$ is reflexive and transitive (a preorder), we can define equivalence classes.

**Definition**: The **Turing degree** of a language $A$ is:

$$
\deg_T(A) = \{B \mid A \leq_T B \text{ and } B \leq_T A\}
$$

Languages in the same Turing degree are "equally hard" — each can be used to decide the other.

### Important Degrees

| Degree | Name | Contains |
|---|---|---|
| $\mathbf{0}$ | The zero degree | All decidable languages |
| $\mathbf{0'}$ | Zero-jump | $A_{TM}$, $\overline{A_{TM}}$, $E_{TM}$, $HALT$ |
| $\mathbf{0''}$ | Double-jump | $TOT = \{\langle M \rangle \mid M \text{ halts on all inputs}\}$ |

---

## The Jump Operator

**Definition**: For any language $A$, the **jump** of $A$ is:

$$
A' = \{\langle M, w \rangle \mid M^A \text{ accepts } w\}
$$

This is the halting problem **relativized** to $A$.

### Properties

- $A <_T A'$ (strictly harder — $A'$ is not decidable with oracle $A$)
- $\emptyset' = A_{TM}$ (the halting problem is the jump of the empty oracle)
- $\emptyset'' = (A_{TM})'$ (the halting problem for machines with a halting-problem oracle)

### The Jump Hierarchy

$$
\mathbf{0} <_T \mathbf{0'} <_T \mathbf{0''} <_T \mathbf{0'''} <_T \cdots
$$

Each level is strictly more powerful than the last. This gives us an infinite tower of undecidability!

---

## The Arithmetical Hierarchy

The **Arithmetical Hierarchy** classifies languages by the complexity of their definitions in terms of quantifiers.

### Level 0: Decidable

$$
\Sigma^0_0 = \Pi^0_0 = \Delta^0_0 = \text{decidable languages}
$$

These can be defined without any unbounded quantifiers.

### Level 1

$$
\Sigma^0_1 = \text{recognizable (recursively enumerable) languages}
$$

A language $L$ is in $\Sigma^0_1$ if:

$$
w \in L \iff \exists y \, R(w, y)
$$

where $R$ is a decidable (computable) relation.

$$
\Pi^0_1 = \text{co-recognizable (co-r.e.) languages}
$$

A language $L$ is in $\Pi^0_1$ if:

$$
w \in L \iff \forall y \, R(w, y)
$$

### Level 2

$$
\Sigma^0_2: \quad w \in L \iff \exists y \, \forall z \, R(w, y, z)
$$

$$
\Pi^0_2: \quad w \in L \iff \forall y \, \exists z \, R(w, y, z)
$$

### General Pattern

$$
\Sigma^0_n: \quad w \in L \iff \exists y_1 \, \forall y_2 \, \exists y_3 \, \cdots \, Q \, y_n \, R(w, y_1, \ldots, y_n)
$$

where $Q = \exists$ if $n$ is odd, $Q = \forall$ if $n$ is even.

$$
\Pi^0_n: \quad w \in L \iff \forall y_1 \, \exists y_2 \, \forall y_3 \, \cdots \, Q \, y_n \, R(w, y_1, \ldots, y_n)
$$

---

## Hierarchy Diagram

$$
\begin{array}{ccccccc}
& & \Sigma^0_2 & & \Sigma^0_3 & & \\
& \Sigma^0_1 & & & & & \\
\Delta^0_0 & & \Delta^0_2 & & \Delta^0_3 & & \cdots \\
& \Pi^0_1 & & & & & \\
& & \Pi^0_2 & & \Pi^0_3 & &
\end{array}
$$

Where $\Delta^0_n = \Sigma^0_n \cap \Pi^0_n$.

---

## Examples at Each Level

### $\Sigma^0_1$ (Recognizable)

$$
A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}
$$

Why: $\langle M, w \rangle \in A_{TM} \iff \exists t \, (M \text{ accepts } w \text{ in } t \text{ steps})$

### $\Pi^0_1$ (Co-recognizable)

$$
\overline{A_{TM}} = \{\langle M, w \rangle \mid M \text{ does not accept } w\}
$$

Why: $\langle M, w \rangle \in \overline{A_{TM}} \iff \forall t \, (M \text{ does not accept } w \text{ in } t \text{ steps})$

### $\Sigma^0_2$

$$
TOT = \{\langle M \rangle \mid M \text{ halts on every input}\}
$$

Why: $\langle M \rangle \in TOT \iff \forall w \, \exists t \, (M \text{ halts on } w \text{ in } t \text{ steps})$

Wait — this has $\forall \exists$, so it's $\Pi^0_2$. Let me reconsider.

Actually: $TOT \in \Pi^0_2$ because the pattern is $\forall w \, \exists t$.

A $\Sigma^0_2$ example:

$$
INF = \{\langle M \rangle \mid L(M) \text{ is infinite}\}
$$

Why: $\langle M \rangle \in INF \iff \forall n \, \exists w \, (|w| > n \text{ and } M \text{ accepts } w)$

Hmm, that's also $\forall \exists = \Pi^0_2$. Let me reconsider.

$$
FIN = \{\langle M \rangle \mid L(M) \text{ is finite}\}
$$

$\langle M \rangle \in FIN \iff \exists n \, \forall w \, (|w| > n \implies M \text{ does not accept } w)$

This is $\Sigma^0_2$: pattern $\exists \forall$.

### $\Pi^0_2$

$$
TOT = \{\langle M \rangle \mid M \text{ halts on all inputs}\}
$$

Pattern: $\forall w \, \exists t \, (M(w) \text{ halts in } t \text{ steps})$

---

## Post's Theorem

**Theorem (Post, 1944)**:

$$
\Sigma^0_n = \text{languages recognizable by a TM with oracle } \emptyset^{(n-1)}
$$

where $\emptyset^{(n)}$ denotes the $n$-th jump of $\emptyset$:

$$
\emptyset^{(0)} = \emptyset, \quad \emptyset^{(1)} = A_{TM}, \quad \emptyset^{(2)} = (A_{TM})', \quad \ldots
$$

### What This Means

Each level of the arithmetical hierarchy corresponds exactly to a level in the jump hierarchy:

| Hierarchy Level | Oracle Needed | Jump Degree |
|---|---|---|
| $\Sigma^0_1 / \Pi^0_1$ | $\emptyset^{(0)} = \emptyset$ (no oracle) | $\mathbf{0}$ |
| $\Sigma^0_2 / \Pi^0_2$ | $\emptyset^{(1)} = A_{TM}$ | $\mathbf{0'}$ |
| $\Sigma^0_3 / \Pi^0_3$ | $\emptyset^{(2)}$ | $\mathbf{0''}$ |
| $\Sigma^0_n / \Pi^0_n$ | $\emptyset^{(n-1)}$ | $\mathbf{0}^{(n-1)}$ |

---

## Strict Hierarchy

The arithmetical hierarchy is **strict**: each level contains languages not in the level below.

$$
\Sigma^0_n \subsetneq \Sigma^0_{n+1} \quad \text{and} \quad \Pi^0_n \subsetneq \Pi^0_{n+1}
$$

Also, $\Sigma^0_n$ and $\Pi^0_n$ are incomparable (neither contains the other) for $n \geq 1$.

---

## Why This Matters

The Arithmetical Hierarchy gives us a **fine structure of undecidability**:

1. Not all undecidable problems are the same difficulty
2. There's an infinite hierarchy of increasing difficulty
3. Each level corresponds to more quantifier alternations
4. Oracle access exactly captures these levels

This is like saying: among problems you can't solve, some are "less unsolvable" than others.

---

## Relativization

Many results in computability theory can be **relativized** — restated with an oracle.

**Example**: The halting problem relativized to $A$:

$$
A' = \{\langle M, w \rangle \mid M^A \text{ accepts } w\}
$$

**Key fact**: $A' >_T A$ always (even with oracle $A$, you can't decide $A'$).

This means there's **no most powerful oracle** — you can always go higher!

---

## Turing Degrees: Additional Facts

### Incomparable Degrees

There exist languages $A$ and $B$ such that:

$$
A \not\leq_T B \quad \text{and} \quad B \not\leq_T A
$$

These have **incomparable** Turing degrees. This was shown by Friedberg and Muchnik (1956-57) using the **priority method**.

### Density

Between any two comparable degrees $\mathbf{a} <_T \mathbf{b}$, there exists a degree $\mathbf{c}$ with $\mathbf{a} <_T \mathbf{c} <_T \mathbf{b}$.

The structure of Turing degrees is incredibly rich and complex!

---

## Summary Table

| Concept | Definition |
|---|---|
| Oracle TM | TM with instant membership queries to language $O$ |
| $A \leq_T B$ | $A$ decidable with oracle for $B$ |
| Turing degree | Equivalence class under $\equiv_T$ |
| Jump $A'$ | Halting problem relativized to $A$ |
| $\Sigma^0_n$ | $\exists\forall\exists\cdots$ ($n$ quantifiers, starts with $\exists$) |
| $\Pi^0_n$ | $\forall\exists\forall\cdots$ ($n$ quantifiers, starts with $\forall$) |
| Post's Theorem | $\Sigma^0_n$ = recognizable with oracle $\emptyset^{(n-1)}$ |

---

## Key Takeaways

1. Oracle TMs extend computation with "free" answers to hard questions
2. Turing reducibility ($\leq_T$) generalizes mapping reducibility ($\leq_m$)
3. The jump operator creates strictly harder problems: $A <_T A'$
4. The Arithmetical Hierarchy classifies problems by quantifier complexity
5. Post's Theorem links the hierarchy to oracle jumps
6. There are infinitely many levels of undecidability

---

## Exercises

### Exercise 1: Oracle Construction

Describe an oracle TM $M^{A_{TM}}$ that decides:

$$
REGULAR_{TM} = \{\langle M \rangle \mid L(M) \text{ is regular}\}
$$

*Hint*: Can you enumerate all DFAs and check language equivalence using the oracle?

### Exercise 2: Turing Reduction

Show that $E_{TM} \leq_T A_{TM}$.

Describe the oracle TM that decides $E_{TM}$ using the $A_{TM}$ oracle.

### Exercise 3: Not Mapping Reducible

Give an example of languages $A, B$ where $A \leq_T B$ but $A \not\leq_m B$.

*Hint*: Consider $A_{TM}$ and $\overline{A_{TM}}$.

### Exercise 4: Hierarchy Classification

Classify each language in the arithmetical hierarchy:

a) $\{\langle M \rangle \mid M \text{ accepts at least 5 strings}\}$

b) $\{\langle M \rangle \mid L(M) = \Sigma^*\}$

c) $\{\langle M \rangle \mid L(M) \text{ is decidable}\}$

### Exercise 5: Jump Properties

Prove that $A \leq_T A'$ for any language $A$.

*Hint*: How can a machine with oracle $A'$ simulate oracle $A$?

### Exercise 6: Quantifier Counting

Write the quantifier form for:

a) $\{\langle M \rangle \mid M \text{ halts on input } \varepsilon\}$

b) $\{\langle M \rangle \mid M \text{ halts on all inputs}\}$

c) $\{\langle M \rangle \mid L(M) \text{ is finite}\}$

### Exercise 7: Incomparability

Explain intuitively why incomparable Turing degrees exist. Why can't all undecidable problems be linearly ordered by difficulty?

---

## What's Next?

In the next lesson, we shift from **computability** to **complexity**. We'll ask: among decidable problems, which ones can be solved *efficiently*? This leads us to **Time Complexity** and the foundations of the P vs NP question.
