---
title: The Recursion Theorem
---

# The Recursion Theorem

In this lesson, you will learn one of the most surprising and powerful results in computability theory: **Turing machines can refer to themselves**.

---

## Can a Machine Know Its Own Description?

Here is a strange question: can a program read its own source code?

At first, this seems circular. How can you write a program that prints itself, when you haven't finished writing it yet?

The **Recursion Theorem** tells us this is always possible. Every Turing machine can effectively compute with its own description $\langle M \rangle$ as if it were just another input.

---

## Why Self-Reference Matters

Self-reference is central to:

- **Gödel's Incompleteness Theorems** (sentences that talk about themselves)
- **Quines** (programs that print their own source code)
- **Virus construction** (programs that replicate themselves)
- **Fixed-point results** in logic and computation

Understanding the Recursion Theorem gives you deep insight into the limits of computation.

---

## Informal Statement

> For any computation that uses both an input $w$ and a "description parameter" $d$, there exists a Turing machine $R$ that automatically fills in $d = \langle R \rangle$ (its own description) and then carries out the computation on $(\langle R \rangle, w)$.

In other words: you can always "hardcode" self-knowledge into a TM.

---

## Formal Statement

**Theorem (Recursion Theorem):**

Let $T$ be a Turing machine that computes a function:

$$
t : \Sigma^* \times \Sigma^* \to \Sigma^*
$$

Then there exists a Turing machine $R$ such that for every input $w$:

$$
R(w) = t(\langle R \rangle, w)
$$

Here $\langle R \rangle$ is the encoding (description) of $R$ itself.

---

## What This Means

Think of $t$ as a "template" computation that takes two arguments:

1. A machine description $d$
2. An input $w$

The Recursion Theorem guarantees a machine $R$ that, on input $w$, behaves exactly as $t$ would behave if given $R$'s own description as the first argument.

$$
R(w) = t(\langle R \rangle, w) \quad \text{for all } w \in \Sigma^*
$$

The machine $R$ "knows" its own encoding without anyone telling it from outside.

---

## Proof Sketch

The proof constructs $R$ from three parts: $A$, $B$, and $T$.

### Part 1: Machine $A$

$A$ is designed to produce the description of what comes after it (i.e., $\langle BT \rangle$).

Technically, $A$ uses a technique called **quining** (explained below). Given the code for $BT$, we can construct $A$ so that when $A$ runs, it writes $\langle BT \rangle$ on the tape.

### Part 2: Machine $B$

$B$ takes the output of $A$ (which is $\langle BT \rangle$) and combines it with $A$'s own description to produce:

$$
\langle ABT \rangle = \langle R \rangle
$$

This is the full description of $R$ itself.

### Part 3: Machine $T$

$T$ is the original machine from the theorem statement. It receives $(\langle R \rangle, w)$ and computes $t(\langle R \rangle, w)$.

### How They Work Together

When $R = ABT$ runs on input $w$:

1. **$A$ executes**: produces $\langle BT \rangle$ on the tape
2. **$B$ executes**: combines to get $\langle ABT \rangle = \langle R \rangle$
3. **$T$ executes**: computes $t(\langle R \rangle, w)$

The key insight is that $A$ and $B$ together achieve self-reference without circularity.

---

## The Quine Technique

The construction above relies on **quines** — programs that output their own source code.

### What Is a Quine?

A **quine** is a program that takes no input and produces its own source code as output.

This seems impossible at first: if you write `PRINT "PRINT..."`, you get into an infinite regress. But there's a clever trick.

### The Trick: Separate Data from Code

The idea is to split the program into two parts:

1. **Data part**: a string that encodes the structure of the program
2. **Code part**: instructions that use the data to reconstruct the full program

### Conceptual Example

Consider this structure (in pseudocode):

```
s = "PRINT s THEN PRINT s IN QUOTES"
PRINT s THEN PRINT s IN QUOTES
```

When this runs:

- It has the string `s` stored as data
- The code prints `s` literally (the second line)
- Then prints `s` wrapped in quotes (the first line)
- Together, the output is the entire program!

### More Precisely

A quine has the form:

$$
P = \text{PRINT}(A) \circ A
$$

where $A$ is a string that, when "executed," prints the code of $P$, and $\text{PRINT}(A)$ outputs $A$ in a way that reconstructs the data definition.

### Formal Construction

Define two computable functions:

- $\text{OBTAINQ}(w)$: returns a TM description that, when run, prints $w$ on its tape
- $\text{COMBINE}(d_1, d_2)$: returns the description $\langle M_1 M_2 \rangle$ of two TMs concatenated

Using these primitives, we can build any self-referencing machine.

---

## Step-by-Step Example

Let's trace through the construction concretely.

**Goal**: Build a TM $R$ that on input $w$ outputs $\langle R \rangle \cdot w$ (its own description followed by $w$).

Here $t(d, w) = d \cdot w$ (concatenation).

**Construction**:

1. Let $T$ be the TM that computes $t(d, w) = d \cdot w$
2. Build $B$: given $\langle BT \rangle$ on tape, combines with $A$'s description to get $\langle R \rangle$
3. Build $A$: a TM that prints $\langle BT \rangle$ (this is the "data" part — the quine technique)
4. $R = ABT$

**Execution on input** $w$:

$$
R(w): \quad A \to \langle BT \rangle \quad \xrightarrow{B} \quad \langle ABT \rangle = \langle R \rangle \quad \xrightarrow{T} \quad \langle R \rangle \cdot w
$$

The machine $R$ successfully outputs its own description followed by the input!

---

## Application 1: Simpler Undecidability of $A_{TM}$

Recall $A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}$.

**Theorem**: $A_{TM}$ is undecidable.

**Proof using self-reference**:

Assume for contradiction that $H$ decides $A_{TM}$. By the Recursion Theorem, we can build a TM $R$ that:

1. Obtains its own description $\langle R \rangle$
2. Runs $H$ on $\langle R, w \rangle$ (asking: "Does $R$ accept $w$?")
3. Does the **opposite** of what $H$ says:
   - If $H$ accepts, $R$ rejects
   - If $H$ rejects, $R$ accepts

This is a contradiction:

$$
R \text{ accepts } w \iff H \text{ says } R \text{ rejects } w \iff R \text{ rejects } w
$$

Therefore no such $H$ exists. $\blacksquare$

This proof is cleaner than the original diagonalization proof because the Recursion Theorem handles the self-reference automatically.

---

## Application 2: The Fixed-Point Theorem

**Theorem (Fixed-Point Theorem)**:

For every computable function $f : \Sigma^* \to \Sigma^*$, there exists a TM $M$ such that:

$$
L(M) = L(f(\langle M \rangle))
$$

In other words, $M$ and $f(\langle M \rangle)$ recognize the same language.

### What This Means

No matter how you try to "transform" machine descriptions, there's always a fixed point — a machine that behaves the same as its transformed version.

### Proof

By the Recursion Theorem, there exists a TM $R$ that:

1. Obtains its own description $\langle R \rangle$
2. Computes $f(\langle R \rangle)$ to get some TM description $\langle M' \rangle$
3. Simulates $M'$ on the input $w$

Then $R$ accepts $w$ iff $M'$ accepts $w$, i.e., iff $f(\langle R \rangle)$ accepts $w$.

So $L(R) = L(f(\langle R \rangle))$, and $R$ is our fixed point. $\blacksquare$

---

## Application 3: Minimal Descriptions

Define the **minimal description** of a language $L$ as the shortest TM description $\langle M \rangle$ with $L(M) = L$.

**Theorem**: The set of minimal TM descriptions is not Turing-recognizable.

**Proof sketch**:

Assume $E$ enumerates all minimal descriptions. By the Recursion Theorem, build a TM $R$ that:

1. Obtains $\langle R \rangle$
2. Runs $E$ until it finds a description $d$ longer than $\langle R \rangle$
3. Simulates the TM described by $d$ on all inputs

Then $L(R) = L(d)$, but $\langle R \rangle$ is shorter than $d$, contradicting that $d$ is minimal. $\blacksquare$

---

## Connection to Gödel's Incompleteness

The Recursion Theorem is the computability-theory analog of **Gödel's First Incompleteness Theorem**.

| Gödel's Theorem | Recursion Theorem |
|---|---|
| Self-referential sentences | Self-referential TMs |
| "This statement is unprovable" | "This TM does the opposite of what $H$ predicts" |
| Incompleteness of formal systems | Undecidability of the halting problem |
| Diagonal lemma | Quine technique |

Both rely on the same fundamental trick: encoding a system within itself to create a paradox or fixed point.

---

## Gödel's Diagonal Lemma (Comparison)

In logic, the **Diagonal Lemma** states:

For any formula $\varphi(x)$ with one free variable, there exists a sentence $\sigma$ such that:

$$
\sigma \leftrightarrow \varphi(\ulcorner \sigma \urcorner)
$$

where $\ulcorner \sigma \urcorner$ is the Gödel number of $\sigma$.

This is directly analogous to the Recursion Theorem: the sentence $\sigma$ "knows" its own encoding, just as machine $R$ knows $\langle R \rangle$.

---

## Practical Implications

### Computer Viruses

A computer virus must:

1. Obtain its own code
2. Insert that code into another program

The Recursion Theorem guarantees this is always possible! This is why self-replicating programs exist.

### Biological Analogy

DNA is a "quine" in biology:

- The data (genetic code) contains instructions for copying itself
- The machinery (ribosomes, enzymes) reads the data to produce copies
- Just like our $A$-$B$-$T$ construction!

---

## Common Misconceptions

### "The machine reads its own tape"

No! The Recursion Theorem doesn't say a TM can "look at" its own physical hardware. It says a TM can compute with a **description** (encoding) of itself.

### "This requires infinite regress"

No! The construction is finite. The quine technique avoids circularity by splitting into data and code parts.

### "Self-reference is paradoxical"

Not always. Paradoxes arise when self-reference is combined with negation (like the Liar's Paradox). The Recursion Theorem gives constructive, non-paradoxical self-reference.

---

## Summary Table

| Concept | Description |
|---|---|
| Recursion Theorem | TMs can compute with their own description |
| Quine | A program that outputs its own source |
| Fixed-Point Theorem | Every computable transformation has a fixed point |
| Self-reference | A machine "knowing" its own encoding |
| Application | Simpler proofs of undecidability |

---

## Key Takeaways

1. The Recursion Theorem states: for any computable $t$, there exists $R$ with $R(w) = t(\langle R \rangle, w)$
2. The proof uses the **quine technique**: splitting into data ($A$) and code ($B$, $T$)
3. This gives elegant proofs of undecidability via self-reference
4. The Fixed-Point Theorem is a corollary: every computable transformation of TM descriptions has a fixed point
5. Self-reference in computation parallels self-reference in logic (Gödel)

---

## Exercises

### Exercise 1: Understanding Quines

Explain why the following naive approach to writing a quine fails:

```
PRINT "PRINT ..."
```

What is the fundamental problem, and how does the data/code split solve it?

### Exercise 2: Self-Reference Construction

Using the Recursion Theorem, describe a TM $R$ that on input $w$:

- Computes $|\langle R \rangle|$ (the length of its own description)
- Outputs $w$ repeated $|\langle R \rangle|$ times

What is $t(d, w)$ in this case?

### Exercise 3: Undecidability via Self-Reference

Use the Recursion Theorem to prove that $E_{TM} = \{\langle M \rangle \mid L(M) = \emptyset\}$ is undecidable.

*Hint*: Assume a decider $D$ for $E_{TM}$ exists. Build $R$ that obtains $\langle R \rangle$, asks $D$ whether $L(R) = \emptyset$, and then does something contradictory.

### Exercise 4: Fixed Points

Let $f$ be the computable function that, given $\langle M \rangle$, returns $\langle M' \rangle$ where $M'$ accepts $w$ iff $M$ rejects $w$ (i.e., $L(M') = \overline{L(M)}$).

The Fixed-Point Theorem says there exists $M$ with $L(M) = L(f(\langle M \rangle)) = \overline{L(M)}$.

What does this tell us about $L(M)$? Is there a contradiction?

### Exercise 5: Virus Construction

Explain (theoretically) how the Recursion Theorem guarantees that self-replicating programs exist. What are the three components $A$, $B$, $T$ in a simple "virus" that copies itself to a file?

### Exercise 6: Comparison with Gödel

The Gödel sentence $G$ says "I am not provable in system $S$."

Construct an analogous TM $R$ using the Recursion Theorem that "says" something about itself. What does $R$ compute?

### Exercise 7: Non-Recognizability

Prove that the set $\{M \mid M \text{ is the shortest TM for } L(M)\}$ is not recognizable.

*Hint*: Use the Recursion Theorem and the fact that there are infinitely many descriptions longer than any given $\langle R \rangle$.

---

## Formal Details: The OBTAINQ Function

The construction relies on a key computable function. Let's be precise.

**Definition**: For any string $w \in \Sigma^*$, define $\text{OBTAINQ}(w)$ as the description of a TM $P_w$ such that:

$$
P_w \text{ on any input: writes } w \text{ on the tape and halts}
$$

The function $\text{OBTAINQ}$ is computable: given $w$, we can mechanically construct a TM that "hardcodes" $w$ into its transition function.

### Why This Matters

$\text{OBTAINQ}$ is the bridge between data and code:

- Given any string $w$ (data), produce a TM (code) that outputs $w$
- This is exactly what the quine technique needs!

The machine $A$ in our construction is essentially $P_{\langle BT \rangle}$ — it hardcodes the description of $BT$.

---

## Formal Proof of the Recursion Theorem

Let's give the full proof with all details.

**Given**: TM $T$ computing $t : \Sigma^* \times \Sigma^* \to \Sigma^*$.

**Goal**: Construct TM $R$ such that $R(w) = t(\langle R \rangle, w)$ for all $w$.

**Construction**:

**Step 1**: Define TM $B$ as follows. On input $\langle M \rangle \cdot w$ (a TM description followed by input):

1. Compute $q = \text{OBTAINQ}(\langle M \rangle)$ — this gives description of a TM that prints $\langle M \rangle$
2. Combine: form $\langle q \cdot M \rangle$ — the description of the composite machine
3. Output $(\langle q \cdot M \rangle, w)$

In other words, $B$ takes a machine description, figures out what $A$ must be (the machine that prints that description), and assembles the full self-description.

**Step 2**: Let $A = \text{OBTAINQ}(\langle BT \rangle)$ — the TM that simply prints $\langle BT \rangle$.

**Step 3**: Set $R = A \cdot B \cdot T$ (run $A$, then $B$, then $T$ in sequence).

**Verification**:

On input $w$:
1. $A$ runs: outputs $\langle BT \rangle$ on the tape
2. $B$ runs on $\langle BT \rangle \cdot w$:
   - Computes $q = \text{OBTAINQ}(\langle BT \rangle) = \langle A \rangle$
   - Forms $\langle A \cdot BT \rangle = \langle R \rangle$
   - Outputs $(\langle R \rangle, w)$
3. $T$ runs on $(\langle R \rangle, w)$:
   - Computes $t(\langle R \rangle, w)$

Therefore $R(w) = t(\langle R \rangle, w)$ for all $w$. $\blacksquare$

---

## A Deeper Look: Why No Circularity?

It might seem circular: we define $R$ in terms of $\langle R \rangle$, but don't we need $R$ to compute $\langle R \rangle$?

The key insight is that $R$ doesn't "read" its own description from some external source. Instead:

1. $A$ is constructed to print a **specific fixed string** ($\langle BT \rangle$)
2. $B$ **computes** the rest (adds the description of $A$ itself)
3. No step requires knowing $\langle R \rangle$ before $R$ is defined

The circularity is broken because:

- We fix $B$ and $T$ first
- Then we define $A = \text{OBTAINQ}(\langle BT \rangle)$
- Then $R = ABT$ is fully determined
- The computation of $\langle R \rangle$ happens at runtime, not at definition time

This is analogous to how a quine works: the data part is fixed first, then the code part uses it.

---

## Connection to Lambda Calculus

In the lambda calculus, the Recursion Theorem corresponds to the existence of **fixed-point combinators**.

The famous **Y combinator**:

$$
Y = \lambda f. \, (\lambda x. \, f(x \, x)) \, (\lambda x. \, f(x \, x))
$$

satisfies $Y(f) = f(Y(f))$ for all $f$. This is exactly a fixed point!

The parallel:

| Lambda Calculus | Turing Machines |
|---|---|
| Y combinator | Recursion Theorem construction |
| $Y(f) = f(Y(f))$ | $R(w) = t(\langle R \rangle, w)$ |
| Self-application $x \, x$ | Machine reading its own description |
| Fixed-point property | Fixed-Point Theorem |

---

## Try It Yourself: Conceptual Quine

Here's a "quine" in English:

> Print the following sentence twice, the second time in quotes: "Print the following sentence twice, the second time in quotes:"

Verify: if you follow the instruction, you reproduce the entire sentence (instruction + quoted data).

The structure is:
- **Code part**: "Print the following sentence twice, the second time in quotes:"
- **Data part**: the quoted version of the code part

Together they form a self-reproducing "program"!

---

## What's Next?

In the next lesson, we'll explore **Oracle Turing Machines** — machines that can consult an all-knowing "oracle" to answer questions about undecidable problems. This leads to the fascinating **Arithmetical Hierarchy**, which classifies undecidable problems by their degree of unsolvability.
