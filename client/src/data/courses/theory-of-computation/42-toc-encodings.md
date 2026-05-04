---
title: Encodings and Language of Turing Machines
---

# Encodings and Language of Turing Machines

In this lesson, we learn how to represent computational objects — Turing machines, DFAs, grammars, graphs — as **strings**. This encoding is what allows us to ask questions *about* machines using the language framework of Turing machines.

---

## Why Encode?

A Turing machine takes **strings** as input. But we want to ask questions like:

- "Does this DFA accept this string?"
- "Is this TM's language empty?"
- "Do these two CFGs generate the same language?"

To phrase these as language membership problems, we need to **encode** the objects (DFAs, TMs, CFGs, etc.) as strings over some fixed alphabet.

---

## Standard Encoding Notation

We use angle brackets $\langle \cdot \rangle$ to denote the encoding of an object as a string:

| Notation | Meaning |
|----------|---------|
| $\langle M \rangle$ | Encoding of Turing machine $M$ |
| $\langle M, w \rangle$ | Encoding of TM $M$ together with string $w$ |
| $\langle G \rangle$ | Encoding of grammar $G$ |
| $\langle A \rangle$ | Encoding of DFA/NFA $A$ |
| $\langle G, w \rangle$ | Encoding of grammar $G$ with string $w$ |
| $\langle G_1, G_2 \rangle$ | Encoding of two objects together |

### The Encoding Alphabet

We typically encode everything over $\{0, 1\}$ (binary), though the choice of alphabet doesn't matter — any alphabet with at least 2 symbols works (they're all equivalent up to polynomial blowup).

---

## How to Encode a Turing Machine

A Turing machine $M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$ can be encoded by listing:

1. **Number of states** $|Q|$ (states numbered $0, 1, \ldots, |Q|-1$)
2. **Input alphabet** $\Sigma$ (often implicit: $\{0, 1\}$)
3. **Tape alphabet** $\Gamma$ (symbols numbered)
4. **Transition function** $\delta$ as a list of tuples:
$$
(q_i, a) \to (q_j, b, D)
$$
where $D \in \{L, R\}$
5. **Start state** $q_0$ (always state 0 by convention)
6. **Accept state** $q_{accept}$ and **reject state** $q_{reject}$

### Example Encoding

For a simple TM with 3 states, $\Sigma = \{0, 1\}$, $\Gamma = \{0, 1, \sqcup\}$:

$$
\langle M \rangle = \text{"3; 0,1; 0,1,B; (0,0,1,1,R)(0,1,2,0,L)...; 0; 1; 2"}
$$

The exact format doesn't matter as long as it's:
- **Effective**: a TM can decode it
- **Unambiguous**: each string encodes at most one machine
- **Verifiable**: a TM can check if a string is a valid encoding

---

## How to Encode Other Objects

### DFA Encoding

A DFA $A = (Q, \Sigma, \delta, q_0, F)$:

$$
\langle A \rangle = (\text{states}, \text{alphabet}, \text{transitions}, \text{start}, \text{accept states})
$$

Since DFAs are simpler than TMs (no tape operations), their encoding is shorter.

### CFG Encoding

A CFG $G = (V, \Sigma, R, S)$:

$$
\langle G \rangle = (\text{variables}, \text{terminals}, \text{rules}, \text{start variable})
$$

Rules encoded as: $A \to \alpha_1 | \alpha_2 | \ldots$

### Graph Encoding

A graph $G = (V, E)$:

$$
\langle G \rangle = (\text{vertices}, \text{edge list})
$$

### Number Encoding

Natural numbers are encoded in binary (or unary, depending on the problem):

$$
\langle n \rangle = \text{binary representation of } n
$$

---

## Requirements for Valid Encodings

An encoding scheme must be:

1. **Effective (Computable)**: There exists a TM that, given the object, produces its encoding
2. **Decodable**: There exists a TM that, given an encoding, reconstructs the object
3. **Recognizable**: There exists a TM that can verify whether a given string is a valid encoding

### Invalid Strings

Not every string over $\{0, 1\}$ is a valid encoding. If a TM receives an invalid encoding, it should **reject** immediately.

$$
\text{If } w \text{ is not a valid } \langle M \rangle, \text{ then treat it as "not in the language"}
$$

---

## Computational Problems as Languages

The key insight of computability theory:

> **Every decision problem can be phrased as a language membership question.**

### Decision Problems → Languages

| Problem (informal) | Language (formal) |
|--------------------|-------------------|
| "Does DFA $A$ accept string $w$?" | $A_{DFA} = \{\langle A, w \rangle \mid A \text{ accepts } w\}$ |
| "Does TM $M$ accept string $w$?" | $A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}$ |
| "Is $L(M)$ empty?" | $E_{TM} = \{\langle M \rangle \mid L(M) = \emptyset\}$ |
| "Does TM $M$ halt on $w$?" | $HALT_{TM} = \{\langle M, w \rangle \mid M \text{ halts on } w\}$ |

### Optimization → Decision

Even optimization problems can be converted to decision problems:

**Optimization:** "Find the shortest path from $s$ to $t$ in graph $G$"

**Decision version:** "Is there a path from $s$ to $t$ in $G$ with length $\leq k$?"

$$
\text{SHORTEST-PATH} = \{\langle G, s, t, k \rangle \mid \text{shortest } s\text{-}t \text{ path has length} \leq k\}
$$

---

## Key Languages About Turing Machines

These are the most important languages in computability theory:

### The Acceptance Problem: $A_{TM}$

$$
A_{TM} = \{\langle M, w \rangle \mid M \text{ is a TM that accepts string } w\}
$$

- **Status:** Recognizable but NOT decidable
- **Recognizer:** Simulate $M$ on $w$. Accept if $M$ accepts.
- **Why not decidable:** If $M$ loops on $w$, the simulation runs forever.

### The Halting Problem: $HALT_{TM}$

$$
HALT_{TM} = \{\langle M, w \rangle \mid M \text{ is a TM that halts on input } w\}
$$

- **Status:** Recognizable but NOT decidable
- **Recognizer:** Simulate $M$ on $w$. Accept if $M$ halts (either accepts or rejects).
- **Why not decidable:** Cannot detect infinite loops.

### The Emptiness Problem: $E_{TM}$

$$
E_{TM} = \{\langle M \rangle \mid L(M) = \emptyset\}
$$

- **Status:** Co-recognizable but NOT decidable (and NOT recognizable)
- The complement $\overline{E_{TM}} = \{\langle M \rangle \mid L(M) \neq \emptyset\}$ is recognizable:
  - Enumerate all strings $w_1, w_2, \ldots$ and simulate $M$ on each in parallel
  - Accept if any simulation accepts

### The Equivalence Problem: $EQ_{TM}$

$$
EQ_{TM} = \{\langle M_1, M_2 \rangle \mid L(M_1) = L(M_2)\}
$$

- **Status:** Neither recognizable NOR co-recognizable
- This is one of the hardest problems — it sits outside both r.e. and co-r.e.

### The Universality Problem: $ALL_{TM}$

$$
ALL_{TM} = \{\langle M \rangle \mid L(M) = \Sigma^*\}
$$

- **Status:** Co-recognizable but NOT recognizable (and NOT decidable)
- "Does $M$ accept everything?" — very hard to determine

---

## Summary of TM Language Classifications

| Language | Decidable? | Recognizable? | Co-recognizable? |
|----------|-----------|---------------|-------------------|
| $A_{TM}$ | No | **Yes** | No |
| $HALT_{TM}$ | No | **Yes** | No |
| $\overline{A_{TM}}$ | No | No | **Yes** |
| $E_{TM}$ | No | No | **Yes** |
| $\overline{E_{TM}}$ | No | **Yes** | No |
| $EQ_{TM}$ | No | No | No |
| $ALL_{TM}$ | No | No | **Yes** |

---

## The Counting Argument

One of the most elegant proofs in computability theory shows that most languages are not even recognizable.

### Step 1: TMs are Countable

The set of all Turing machines is **countable** (countably infinite):

$$
|\{\text{all TMs}\}| = \aleph_0
$$

**Why?** Every TM has a finite description $\langle M \rangle$, which is a finite string over $\{0, 1\}$. The set of all finite binary strings is countable:

$$
\{0, 1\}^* = \{\varepsilon, 0, 1, 00, 01, 10, 11, 000, \ldots\}
$$

This is a countable set (we can list them in length-lexicographic order).

Since every TM maps to a unique encoding, and encodings form a subset of a countable set:

$$
|\{\text{all TMs}\}| \leq |\{0,1\}^*| = \aleph_0
$$

### Step 2: Languages are Uncountable

The set of all languages over $\Sigma = \{0, 1\}$ is **uncountable**:

$$
|\mathcal{P}(\Sigma^*)| = 2^{\aleph_0} = |\mathbb{R}|
$$

**Why?** A language is a subset of $\Sigma^*$. The set of all subsets (power set) of a countably infinite set is uncountable. This follows from **Cantor's diagonal argument**.

### Cantor's Diagonal Argument (Applied)

Suppose for contradiction that all languages over $\{0, 1\}$ are countable. List them:

$$
L_1, L_2, L_3, \ldots
$$

And list all strings: $s_1, s_2, s_3, \ldots$

Build a table where entry $(i, j) = 1$ if $s_j \in L_i$, else $0$:

$$
\begin{array}{c|cccc}
 & s_1 & s_2 & s_3 & \cdots \\
\hline
L_1 & 1 & 0 & 1 & \cdots \\
L_2 & 0 & 1 & 0 & \cdots \\
L_3 & 1 & 1 & 0 & \cdots \\
\vdots & & & & \ddots
\end{array}
$$

Define the **diagonal language** $D$ by flipping the diagonal:

$$
s_j \in D \iff s_j \notin L_j
$$

Then $D \neq L_i$ for any $i$ (they differ on $s_i$). Contradiction! ∎

### Step 3: The Conclusion

$$
|\{\text{recognizable languages}\}| \leq |\{\text{TMs}\}| = \aleph_0
$$
$$
|\{\text{all languages}\}| = 2^{\aleph_0} > \aleph_0
$$

Therefore:

$$
\text{Most languages are NOT recognizable}
$$

In fact, "almost all" languages are not recognizable — the recognizable ones form a measure-zero subset.

---

## The Diagonal Language

We can explicitly construct a non-recognizable language using diagonalization.

Let $M_1, M_2, M_3, \ldots$ be an enumeration of all Turing machines.

Define:

$$
D = \{ \langle M_i \rangle \mid M_i \text{ does NOT accept } \langle M_i \rangle \}
$$

### Claim: $D$ is not recognizable

**Proof by contradiction:**

Suppose $D$ is recognized by some TM $M_k$ in our enumeration. Then:

- If $\langle M_k \rangle \in D$:
  - By definition of $D$: $M_k$ does NOT accept $\langle M_k \rangle$
  - But $M_k$ recognizes $D$, so $M_k$ DOES accept $\langle M_k \rangle$ ⚡ Contradiction

- If $\langle M_k \rangle \notin D$:
  - By definition of $D$: $M_k$ DOES accept $\langle M_k \rangle$
  - Since $M_k$ recognizes $D$: $\langle M_k \rangle \in D$ ⚡ Contradiction

Both cases lead to contradiction. Therefore no TM recognizes $D$. ∎

---

## Self-Reference and the Role of Encodings

The power of encodings comes from **self-reference**: a TM can receive its own description as input.

$$
M \text{ receives } \langle M \rangle \text{ as input}
$$

This is perfectly valid! $\langle M \rangle$ is just a string, and $M$ processes strings. The "meta" nature of this is what enables the diagonalization proofs.

### Analogy

Think of a compiler that can compile its own source code, or a program that prints its own source code (a **quine**). Self-reference is not paradoxical — it's a natural consequence of encoding.

---

## Encoding Conventions in Proofs

When writing proofs, we follow these conventions:

1. **Check validity first:** "If the input is not a valid $\langle M, w \rangle$, reject."
2. **Use $\langle \cdot \rangle$ consistently:** Always use angle brackets for encodings.
3. **Separate objects with commas:** $\langle M, w \rangle$ means $M$ and $w$ encoded together.
4. **Assume standard encoding:** Don't specify the exact binary format unless it matters.

### Template for Decidability Proofs

To prove $L$ is decidable, describe a TM $M$:

```
M = "On input ⟨...⟩:
  1. Check that the input is a valid encoding. If not, reject.
  2. [Perform computation]
  3. If [condition], accept. Otherwise, reject."
```

---

## Try It Yourself

### Exercise 1

Explain why the following is a valid language:

$$
\{\langle M \rangle \mid M \text{ is a TM with exactly 7 states}\}
$$

Is this language decidable? Why?

<details>
<summary>Solution</summary>

Yes, this is decidable. A decider simply:
1. Checks if the input is a valid TM encoding
2. Counts the number of states in the encoding
3. Accepts if the count is 7, rejects otherwise

This always halts because it only examines the static structure of the encoding — it never simulates $M$.

</details>

### Exercise 2

Prove that $A_{TM}$ is recognizable by describing a recognizer.

<details>
<summary>Solution</summary>

Build TM $U$ (universal TM) on input $\langle M, w \rangle$:
1. Check that $\langle M, w \rangle$ is a valid encoding. If not, reject.
2. Simulate $M$ on input $w$, step by step.
3. If $M$ enters $q_{accept}$, accept.
4. If $M$ enters $q_{reject}$, reject.

If $M$ loops on $w$, then $U$ also loops. This is acceptable for a recognizer.

</details>

### Exercise 3

Why can't we use the same approach to show $A_{TM}$ is decidable?

<details>
<summary>Solution</summary>

The simulation in Exercise 2 may never terminate if $M$ loops on $w$. A decider must halt on ALL inputs. We cannot add a step like "if $M$ loops, reject" because detecting infinite loops is itself undecidable (the halting problem).

</details>

### Exercise 4

How many TMs are there with exactly $n$ states over alphabet $\Sigma = \{0, 1\}$ and tape alphabet $\Gamma = \{0, 1, \sqcup\}$?

<details>
<summary>Solution</summary>

The transition function maps $(Q \setminus \{q_{accept}, q_{reject}\}) \times \Gamma$ to $Q \times \Gamma \times \{L, R\}$.

- Working states: $n - 2$ (excluding $q_{accept}$ and $q_{reject}$)
- Inputs to $\delta$: $(n-2) \times 3$ entries
- Each entry has $n \times 3 \times 2 = 6n$ choices

Total: $(6n)^{3(n-2)}$

This grows fast but is always finite for fixed $n$, confirming that TMs are countable.

</details>

### Exercise 5

Give an encoding for the language:

$$
\text{CONNECTED} = \{\langle G \rangle \mid G \text{ is a connected undirected graph}\}
$$

Is this language decidable?

<details>
<summary>Solution</summary>

**Encoding:** Represent $G = (V, E)$ as:
- Number of vertices $|V|$
- Adjacency list or edge list

**Decidability:** Yes! Build TM $M$ on input $\langle G \rangle$:
1. Check valid graph encoding
2. Run BFS from vertex 1
3. If all vertices are reached → accept
4. Otherwise → reject

Always halts in $O(|V| + |E|)$ steps.

</details>

---

## The Universal Turing Machine

The encoding framework makes possible one of the most important constructions in computer science: the **Universal Turing Machine** $U$.

### Definition

$U$ is a fixed TM that can simulate any other TM:

$$
U(\langle M, w \rangle) = M(w)
$$

On input $\langle M, w \rangle$:
1. Decode $M$'s description
2. Simulate $M$ on $w$ step-by-step
3. If $M$ accepts, $U$ accepts. If $M$ rejects, $U$ rejects.

### Why $U$ Exists

$U$ works because:
- $\langle M \rangle$ encodes all information needed to simulate $M$
- The simulation is mechanical: read state, read tape symbol, look up transition, update
- Each step of $M$ takes a bounded number of steps for $U$ to simulate

### Significance

The Universal TM is the theoretical foundation of **stored-program computers**: a single piece of hardware (analogous to $U$) can run any program (analogous to $\langle M \rangle$) on any data (analogous to $w$). This is the fundamental insight behind modern computing.

### $U$ Recognizes $A_{TM}$

$$
L(U) = A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}
$$

$U$ is a recognizer (not a decider) for $A_{TM}$ — it may loop if $M$ loops on $w$.

---

## Key Takeaways

1. **Encoding** converts computational objects to strings: $\langle M \rangle$, $\langle G, w \rangle$
2. **Decision problems = languages**: "Does $M$ accept $w$?" becomes "$\langle M, w \rangle \in A_{TM}$?"
3. **TMs are countable** (finite descriptions), **languages are uncountable** (Cantor)
4. **Most languages are not recognizable** — only countably many are
5. **Self-reference** ($M$ receiving $\langle M \rangle$) enables diagonalization proofs
6. Key TM languages: $A_{TM}$ (r.e.), $HALT_{TM}$ (r.e.), $E_{TM}$ (co-r.e.), $EQ_{TM}$ (neither)
7. The **Universal TM** $U$ simulates any TM given its encoding

---

## What's Next?

In the next lesson, we study **Linear Bounded Automata** — Turing machines with restricted tape that recognize exactly the context-sensitive languages. This fills an important gap in the Chomsky hierarchy between PDAs and full TMs.
