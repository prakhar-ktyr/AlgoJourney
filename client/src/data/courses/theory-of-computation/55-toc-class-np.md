---
title: The Class NP
---

# The Class NP

In this lesson, you will learn about **NP** — one of the most important and mysterious complexity classes. NP captures problems where solutions are hard to *find* but easy to *check*.

---

## Motivation

Consider the **CLIQUE** problem:

> Given a graph $G$ and integer $k$, does $G$ contain a complete subgraph (clique) of size $k$?

To **find** a $k$-clique, the best known algorithm essentially tries all $\binom{n}{k}$ subsets — exponential time.

But to **verify** a claimed clique? Just check that the given $k$ vertices are all pairwise connected — $O(k^2)$ time!

This asymmetry — hard to find, easy to check — is the essence of **NP**.

---

## Definition 1: NP via Nondeterministic Turing Machines

**Definition**:

$$
NP = \bigcup_{k \geq 0} \text{NTIME}(n^k)
$$

where:

$$
\text{NTIME}(f(n)) = \{L \mid L \text{ is decided by a nondeterministic TM in } O(f(n)) \text{ time}\}
$$

A **nondeterministic TM** (NTM) in time $f(n)$ means:

- Every branch of the computation tree has depth at most $O(f(n))$
- The NTM accepts if **at least one** branch accepts
- The NTM rejects if **all** branches reject

---

## Definition 2: NP via Verifiers

**Definition**: A language $L$ is in $NP$ if there exists a **polynomial-time verifier** $V$ such that:

$$
L = \{w \mid \exists \, c \in \Sigma^* : V(w, c) = \text{accept} \text{ and } |c| \leq |w|^k\}
$$

Here:

- $w$ is the input (the "problem instance")
- $c$ is the **certificate** (also called "witness" or "proof")
- $V$ is a deterministic TM running in polynomial time
- $|c| \leq |w|^k$ for some constant $k$ (certificate has polynomial length)

### In Plain English

$L \in NP$ means: for every YES-instance $w \in L$, there exists a short proof $c$ that can be checked quickly.

$$
w \in L \iff \exists \text{ certificate } c: V \text{ accepts } (w, c) \text{ in poly time}
$$

---

## Equivalence of the Two Definitions

**Theorem**: The verifier definition and the NTM definition of NP are equivalent.

### Direction 1: NTM $\Rightarrow$ Verifier

Given an NTM $N$ deciding $L$ in time $O(n^k)$:

- The **certificate** $c$ = the sequence of nondeterministic choices made by $N$
- Since $N$ runs in $O(n^k)$ steps, $c$ has length $\leq O(n^k)$ (polynomial)
- The **verifier** $V(w, c)$: simulate $N$ on $w$, using $c$ to determine each nondeterministic choice
- $V$ runs in polynomial time (just a deterministic simulation of one branch)

### Direction 2: Verifier $\Rightarrow$ NTM

Given a polynomial-time verifier $V$ for $L$:

- Build NTM $N$ that on input $w$:
  1. **Nondeterministically guess** a certificate $c$ of length $\leq |w|^k$
  2. **Run** $V(w, c)$ deterministically
  3. Accept if $V$ accepts; reject if $V$ rejects
- Step 1 takes $O(n^k)$ nondeterministic steps (one per bit of $c$)
- Step 2 takes polynomial time
- Total: polynomial time nondeterministic computation $\blacksquare$

---

## Examples of NP Problems

### Example 1: COMPOSITES

$$
COMPOSITES = \{n \mid n \text{ is not prime, i.e., } n = a \cdot b \text{ for some } 1 < a, b < n\}
$$

**Certificate**: a factor $a$ of $n$ (with $1 < a < n$)

**Verification**: Check that $a$ divides $n$ and $1 < a < n$

**Time**: Division takes $O(\log^2 n)$ — polynomial!

$$
COMPOSITES \in NP
$$

*Note*: COMPOSITES (and PRIMES) are also in P (AKS algorithm), so this is not a "hard" NP problem.

### Example 2: CLIQUE

$$
CLIQUE = \{\langle G, k \rangle \mid G \text{ contains a clique of size } k\}
$$

**Certificate**: a set $S$ of $k$ vertices

**Verification**:
1. Check $|S| = k$ — $O(k)$
2. For each pair $(u, v) \in S \times S$: check edge $(u, v)$ exists in $G$ — $O(k^2)$

**Time**: $O(k^2) \leq O(n^2)$ — polynomial!

$$
CLIQUE \in NP
$$

### Example 3: HAM-PATH

$$
HAM\text{-}PATH = \{\langle G, s, t \rangle \mid G \text{ has a Hamiltonian path from } s \text{ to } t\}
$$

A **Hamiltonian path** visits every vertex exactly once.

**Certificate**: the path, i.e., a sequence of vertices $(v_1, v_2, \ldots, v_n)$

**Verification**:
1. Check $v_1 = s$ and $v_n = t$
2. Check all $v_i$ are distinct (visits each vertex once)
3. Check each edge $(v_i, v_{i+1})$ exists in $G$

**Time**: $O(n^2)$ — polynomial!

$$
HAM\text{-}PATH \in NP
$$

### Example 4: SAT (Boolean Satisfiability)

$$
SAT = \{\langle \varphi \rangle \mid \varphi \text{ is a satisfiable Boolean formula}\}
$$

**Certificate**: a satisfying assignment $\alpha : \{x_1, \ldots, x_n\} \to \{0, 1\}$

**Verification**: Evaluate $\varphi$ under assignment $\alpha$

**Time**: $O(|\varphi|)$ — linear in formula size!

$$
SAT \in NP
$$

### Example 5: SUBSET-SUM

$$
SUBSET\text{-}SUM = \{\langle S, t \rangle \mid \exists \, T \subseteq S : \sum_{x \in T} x = t\}
$$

**Certificate**: the subset $T$

**Verification**:
1. Check $T \subseteq S$
2. Compute $\sum_{x \in T} x$
3. Check sum equals $t$

**Time**: $O(|S|)$ — polynomial!

$$
SUBSET\text{-}SUM \in NP
$$

### Example 6: 3-COLORING

$$
3\text{-}COLORING = \{\langle G \rangle \mid G \text{ is 3-colorable}\}
$$

**Certificate**: a coloring function $f : V \to \{1, 2, 3\}$

**Verification**: For each edge $(u, v)$, check $f(u) \neq f(v)$

**Time**: $O(|E|)$ — polynomial!

$$
3\text{-}COLORING \in NP
$$

---

## P is Contained in NP

**Theorem**: $P \subseteq NP$

**Proof**: If $L \in P$, then there's a polynomial-time TM $M$ deciding $L$.

Build a verifier $V(w, c)$:
- Ignore the certificate $c$ completely
- Run $M$ on $w$
- Accept iff $M$ accepts

This verifier runs in polynomial time, and:

- If $w \in L$: $M$ accepts $w$, so $V(w, c)$ accepts for any $c$ (e.g., $c = \varepsilon$)
- If $w \notin L$: $M$ rejects $w$, so $V(w, c)$ rejects for all $c$

Therefore $L \in NP$. $\blacksquare$

---

## The Big Question: P vs NP

$$
\boxed{P \stackrel{?}{=} NP}
$$

This is the most famous open problem in computer science — and one of the seven **Millennium Prize Problems** (with a \$1,000,000 reward).

### If P = NP

- Finding solutions is as easy as checking them
- Every problem with efficiently verifiable solutions has an efficient algorithm
- Cryptography collapses (breaking codes becomes easy)
- Optimization, AI, drug design — all become "easy"
- Mathematical proof discovery becomes algorithmic

### If P ≠ NP (widely believed)

- Some problems are **inherently** harder to solve than to verify
- A fundamental asymmetry exists in computation
- Cryptography has a sound theoretical basis
- Many optimization problems have no efficient exact algorithm
- We need to settle for approximations and heuristics

### Current Status

- Most experts believe $P \neq NP$
- No proof exists in either direction (despite 50+ years of effort)
- Many conditional results: "If P ≠ NP, then..."
- Natural proof barriers (relativization, natural proofs, algebrization) suggest proving P ≠ NP is very hard

---

## Visualizing P vs NP

If $P = NP$:

$$
P = NP
$$

(Everything collapses to one class)

If $P \neq NP$ (believed):

$$
P \subsetneq NP
$$

And there may be problems in $NP \setminus P$ that are neither in P nor NP-complete (Ladner's theorem guarantees this if P ≠ NP).

---

## co-NP

**Definition**: $\text{co-NP}$ is the class of languages whose **complements** are in NP.

$$
L \in \text{co-NP} \iff \overline{L} \in NP
$$

Equivalently: $L \in \text{co-NP}$ if there's a polynomial-time verifier for "NO" instances:

$$
w \notin L \iff \exists \, c: V(w, c) = \text{accept}
$$

Or in the "for all" form:

$$
w \in L \iff \forall c \text{ of polynomial length}: V'(w, c) = \text{accept}
$$

### Examples of co-NP Problems

- $\overline{SAT}$ (TAUTOLOGY): is a formula true under ALL assignments?
  - Certificate for YES: there's no short proof (need to check all $2^n$ assignments)
  - Certificate for NO: a falsifying assignment

- $\overline{CLIQUE}$: graph does NOT have a $k$-clique
  - No obvious short certificate for YES instances

- PRIMES (before AKS): was known to be in co-NP before being shown in P

---

## Relationships

$$
P \subseteq NP \cap \text{co-NP}
$$

**Why?** If $L \in P$, then both $L$ and $\overline{L}$ are decidable in polynomial time, so both are in NP.

### Open Questions

1. **Is $NP = \text{co-NP}$?** Unknown! If $P \neq NP$, it's believed that $NP \neq \text{co-NP}$.

2. **Is $P = NP \cap \text{co-NP}$?** Unknown! There might be problems in both NP and co-NP that aren't in P.
   - FACTORING is a candidate: in $NP \cap \text{co-NP}$ but not known to be in P

---

## NP Problems: The "Guess and Check" Paradigm

Every NP problem follows the same pattern:

1. **Guess** a solution (the certificate)
2. **Check** that it's correct (the verifier)

| Problem | What to Guess | What to Check |
|---|---|---|
| SAT | Assignment | Formula evaluates to true |
| CLIQUE | Set of $k$ vertices | All pairs connected |
| HAM-PATH | Path sequence | Visits all vertices, valid edges |
| SUBSET-SUM | Subset | Sum equals target |
| 3-COLORING | Color assignment | No adjacent same-color |
| COMPOSITES | A factor | Divides evenly |
| GRAPH-ISO | Vertex mapping | Edges preserved |

---

## What NP Does NOT Mean

Common misconceptions:

### ❌ "NP means Not Polynomial"

**Wrong!** NP stands for "Nondeterministic Polynomial." We don't know if NP problems require more than polynomial time.

### ❌ "NP means exponential time"

**Wrong!** $P \subseteq NP$, so polynomial-time problems are also in NP. Being in NP doesn't mean a problem is hard.

### ❌ "NP problems can't be solved"

**Wrong!** Every NP problem is decidable. We just don't know if they all have *polynomial-time* algorithms.

### ❌ "If a problem is in NP, brute force is the only option"

**Wrong!** Being in NP says solutions are *verifiable* quickly. Some NP problems are also in P (like PRIMES).

---

## NP and Exponential Time

What IS the relationship?

$$
P \subseteq NP \subseteq \text{EXPTIME} = \bigcup_k \text{TIME}(2^{n^k})
$$

We know $P \neq \text{EXPTIME}$ (by the Time Hierarchy Theorem).

Since $P \subseteq NP \subseteq \text{EXPTIME}$ and $P \neq \text{EXPTIME}$, at least one inclusion is strict.

If $P = NP$, then $NP \neq \text{EXPTIME}$.

If $NP = \text{EXPTIME}$, then $P \neq NP$.

But we don't know which (or if both are strict)!

---

## Certificate Length Matters

The certificate must have **polynomial** length. This is crucial!

**Example**: Consider $\overline{A_{TM}}$ (TM does not accept $w$).

- Is there a short certificate that a TM does NOT accept?
- No! This would make $\overline{A_{TM}}$ recognizable, which it isn't.

The polynomial bound on $|c|$ ensures NP doesn't become "all decidable problems."

---

## Summary: NP Informally

$$
NP = \text{problems with short proofs for YES answers}
$$

$$
\text{co-NP} = \text{problems with short proofs for NO answers}
$$

$$
P = \text{problems efficiently solvable (no proof needed)}
$$

---

## Summary Table

| Concept | Description |
|---|---|
| NP (NTM) | $\bigcup_k \text{NTIME}(n^k)$ — nondeterministic polynomial time |
| NP (verifier) | Languages with polynomial-time verifiers and poly-length certificates |
| Certificate | Short "proof" that $w \in L$ (also called witness) |
| $P \subseteq NP$ | Polynomial problems are trivially in NP |
| P vs NP | Is finding as easy as checking? Open! |
| co-NP | Complements of NP languages |
| $P \subseteq NP \cap \text{co-NP}$ | P is in both NP and co-NP |

---

## Key Takeaways

1. NP = problems where YES answers have short, efficiently checkable proofs
2. Equivalently: NP = languages decided by nondeterministic TMs in polynomial time
3. $P \subseteq NP$: anything efficiently solvable is also efficiently verifiable
4. $P \stackrel{?}{=} NP$ is the central open question of theoretical CS
5. co-NP captures problems where NO answers have short proofs
6. Most experts believe $P \neq NP$ — finding is harder than checking

---

## Exercises

### Exercise 1: Verifier Construction

For each language, describe a polynomial-time verifier and state what the certificate is:

a) $\{(G, k) \mid G$ has an independent set of size $k\}$

b) $\{(\varphi) \mid \varphi$ is a satisfiable 3-CNF formula$\}$

c) $\{\langle G_1, G_2 \rangle \mid G_1$ and $G_2$ are isomorphic graphs$\}$

### Exercise 2: NTM to Verifier

Given an NTM $N$ for SAT that guesses an assignment and checks it, explicitly construct the verifier $V(w, c)$. What is $c$?

### Exercise 3: P ⊆ NP Proof Details

Give the formal proof that $PATH \in NP$ using the verifier definition. What certificate do you use? (Note: PATH is in P, so you have two choices — what are they?)

### Exercise 4: co-NP Examples

Show that each language is in co-NP:

a) $TAUTOLOGY = \{\varphi \mid \varphi$ is true under every assignment$\}$

b) $\{\langle G \rangle \mid G$ has no Hamiltonian cycle$\}$

### Exercise 5: Certificate Bounds

Why must certificates have polynomial length? Give an example showing that if we allow exponential-length certificates, NP would contain all decidable languages.

### Exercise 6: NP ∩ co-NP

Explain why FACTORING (given $n$ and $k$, does $n$ have a factor $\leq k$?) is in $NP \cap \text{co-NP}$.

*Hint*: What's the certificate for YES? What's the certificate for NO? (Think prime factorization.)

### Exercise 7: The Meaning of P = NP

If someone proved P = NP tomorrow:

a) Would that immediately give us fast algorithms for SAT, CLIQUE, etc.?

b) What would it mean for RSA encryption?

c) Would mathematical theorem-proving become easy? Explain carefully.

---

## What's Next?

In the next lesson, we'll explore **NP-completeness** — the hardest problems in NP. We'll learn about polynomial-time reductions and the Cook-Levin theorem, which shows that SAT is the "hardest" problem in NP.
