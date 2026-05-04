---
title: Decidable Languages
---

# Decidable Languages

In this lesson, we study specific languages that are **decidable** — problems for which algorithms exist that always halt with a correct yes/no answer. We focus on decision problems for regular and context-free languages, proving decidability with explicit Turing machine constructions.

---

## What Does "Decidable" Mean?

A language $L$ is **decidable** if there exists a Turing machine $M$ such that:

$$
\forall w \in \Sigma^*: \begin{cases} w \in L \implies M \text{ accepts } w \\ w \notin L \implies M \text{ rejects } w \end{cases}
$$

And crucially, $M$ **halts on every input**. No infinite loops, ever.

A decidable language represents a problem we can **completely solve** algorithmically.

---

## Decidable Problems for Regular Languages

Regular languages are the best-behaved class — essentially everything about them is decidable.

### Problem 1: Acceptance — $A_{DFA}$

$$
A_{DFA} = \{\langle B, w \rangle \mid B \text{ is a DFA and } B \text{ accepts } w\}
$$

> **Theorem:** $A_{DFA}$ is decidable.

**Proof:** Construct TM $M$ as follows:

$M$ = "On input $\langle B, w \rangle$ where $B$ is a DFA and $w$ is a string:
1. Verify that $\langle B, w \rangle$ is a valid encoding. If not, reject.
2. Simulate $B$ on input $w$:
   - Start in $B$'s start state $q_0$
   - For each symbol $a_i$ in $w = a_1 a_2 \cdots a_n$:
     - Compute $\delta(q_{current}, a_i)$ and update the current state
3. If $B$ ends in an accept state ($q_{current} \in F$), accept.
4. Otherwise, reject."

**Why $M$ always halts:** The simulation reads $w$ once, performing exactly $|w|$ transitions. Each lookup in $\delta$ takes finite time. No possibility of looping.

**Time complexity:** $O(|w|)$ — linear in the input string length.

---

### Problem 2: NFA Acceptance — $A_{NFA}$

$$
A_{NFA} = \{\langle B, w \rangle \mid B \text{ is an NFA and } B \text{ accepts } w\}
$$

> **Theorem:** $A_{NFA}$ is decidable.

**Proof:** Construct TM $N$ as follows:

$N$ = "On input $\langle B, w \rangle$ where $B$ is an NFA:
1. Convert NFA $B$ to an equivalent DFA $C$ using the subset construction.
2. Run TM $M$ (from above) on input $\langle C, w \rangle$.
3. Accept if $M$ accepts; reject if $M$ rejects."

**Why $N$ always halts:** The subset construction always terminates (producing at most $2^{|Q|}$ states). Then $M$ always halts (proved above).

**Time complexity:** Conversion is $O(2^{|Q|})$. Simulation is $O(|w|)$. Total: $O(2^{|Q|} + |w|)$.

> **Alternative approach:** Track the set of active NFA states directly while reading $w$. This avoids the exponential blowup and runs in $O(|Q|^2 \cdot |w|)$ time.

---

### Problem 3: Regex Acceptance — $A_{REX}$

$$
A_{REX} = \{\langle R, w \rangle \mid R \text{ is a regular expression and } w \in L(R)\}
$$

> **Theorem:** $A_{REX}$ is decidable.

**Proof:** Construct TM $P$ as follows:

$P$ = "On input $\langle R, w \rangle$ where $R$ is a regex:
1. Convert $R$ to an equivalent NFA $B$ using Thompson's construction.
2. Run TM $N$ (from above) on input $\langle B, w \rangle$.
3. Accept if $N$ accepts; reject if $N$ rejects."

**Why $P$ always halts:** Thompson's construction always terminates. Then $N$ always halts.

---

### Problem 4: Emptiness — $E_{DFA}$

$$
E_{DFA} = \{\langle A \rangle \mid A \text{ is a DFA and } L(A) = \emptyset\}
$$

> **Theorem:** $E_{DFA}$ is decidable.

**Proof:** Construct TM $T$ as follows:

$T$ = "On input $\langle A \rangle$ where $A$ is a DFA:
1. Mark the start state $q_0$.
2. Repeat until no new states are marked:
   - For each marked state $q$ and each symbol $a \in \Sigma$:
     - Mark $\delta(q, a)$ if not already marked
3. If any accept state is marked, reject (language is non-empty).
4. If no accept state is marked, accept (language is empty)."

**Correctness:** A DFA accepts some string iff there's a path from $q_0$ to some accept state. The marking process finds all reachable states.

**Why $T$ always halts:** There are finitely many states ($|Q|$). Each iteration marks at least one new state or terminates. Maximum iterations: $|Q|$.

**Time complexity:** $O(|Q| \cdot |\Sigma|)$ — essentially BFS on the state graph.

---

### Problem 5: Equivalence — $EQ_{DFA}$

$$
EQ_{DFA} = \{\langle A, B \rangle \mid A, B \text{ are DFAs and } L(A) = L(B)\}
$$

> **Theorem:** $EQ_{DFA}$ is decidable.

**Proof:** Construct TM $F$ as follows:

$F$ = "On input $\langle A, B \rangle$ where $A, B$ are DFAs:
1. Construct DFA $C$ for the symmetric difference:
$$
L(C) = L(A) \triangle L(B) = (L(A) \setminus L(B)) \cup (L(B) \setminus L(A))
$$
   This is done by:
   - Building DFA for $\overline{L(B)}$ (complement: swap accept/non-accept states)
   - Building DFA for $L(A) \cap \overline{L(B)}$ (product construction)
   - Similarly for $L(B) \cap \overline{L(A)}$
   - Taking the union
2. Run TM $T$ (emptiness test) on $\langle C \rangle$.
3. If $T$ accepts (symmetric difference is empty), accept.
4. If $T$ rejects (symmetric difference is non-empty), reject."

**Correctness:** $L(A) = L(B)$ iff their symmetric difference is empty.

**Why $F$ always halts:** All DFA operations (complement, product, union) terminate. Emptiness test terminates.

**Time complexity:** Product DFA has $O(|Q_A| \cdot |Q_B|)$ states. Emptiness check is linear. Total: $O(|Q_A| \cdot |Q_B| \cdot |\Sigma|)$.

---

## Decidable Problems for Context-Free Languages

### Problem 6: CFG Membership — $A_{CFG}$

$$
A_{CFG} = \{\langle G, w \rangle \mid G \text{ is a CFG and } G \text{ generates } w\}
$$

> **Theorem:** $A_{CFG}$ is decidable.

**Proof:** Construct TM $S$ as follows:

$S$ = "On input $\langle G, w \rangle$ where $G$ is a CFG and $w$ is a string:
1. Convert $G$ to Chomsky Normal Form (CNF), producing $G'$.
2. If $w = \varepsilon$: check if $S \to \varepsilon$ is a rule in $G'$. Accept/reject accordingly.
3. If $w \neq \varepsilon$ (let $n = |w|$): Run the CYK algorithm:
   - Build the CYK table $T[i][j]$ for $1 \leq i \leq j \leq n$
   - $T[i][i] = \{A \mid A \to w_i \in G'\}$
   - For $\ell = 2$ to $n$: for each span $[i, i+\ell-1]$:
     - For each split point $k$: $T[i][j] = T[i][j] \cup \{A \mid A \to BC, B \in T[i][k], C \in T[k+1][j]\}$
4. If $S \in T[1][n]$, accept.
5. Otherwise, reject."

**Why $S$ always halts:**
- CNF conversion always terminates (finite grammar manipulation)
- CYK fills an $n \times n$ table with at most $|V|$ entries per cell
- No loops possible

**Time complexity:** $O(n^3 \cdot |G|)$ where $n = |w|$ and $|G|$ is the grammar size.

### Why Not Just Try All Derivations?

A naive approach — try every possible derivation — doesn't work because:

- There can be infinitely many derivations of increasing length
- We'd never know when to stop

CYK works because in CNF, any derivation of a string of length $n$ has exactly $2n - 1$ steps. But we don't enumerate derivations — we use dynamic programming.

---

### Problem 7: CFG Emptiness — $E_{CFG}$

$$
E_{CFG} = \{\langle G \rangle \mid G \text{ is a CFG and } L(G) = \emptyset\}
$$

> **Theorem:** $E_{CFG}$ is decidable.

**Proof:** Construct TM $R$ as follows:

$R$ = "On input $\langle G \rangle$ where $G$ is a CFG:
1. Mark all terminal symbols as 'generating'.
2. Repeat until no new variables are marked:
   - If there's a rule $A \to \alpha$ where every symbol in $\alpha$ is marked, mark $A$.
3. If the start symbol $S$ is marked, reject (language is non-empty).
4. If $S$ is not marked, accept (language is empty)."

**Correctness:** A variable is "generating" iff it can derive some terminal string. If $S$ is generating, then $L(G) \neq \emptyset$.

**Time complexity:** $O(|G|)$ — linear in grammar size (at most $|V|$ iterations, each scanning all rules).

---

### Problem 8: CFG Equivalence — $EQ_{CFG}$

$$
EQ_{CFG} = \{\langle G, H \rangle \mid G, H \text{ are CFGs and } L(G) = L(H)\}
$$

> **Theorem:** $EQ_{CFG}$ is **UNDECIDABLE**.

This is a critical contrast with $EQ_{DFA}$! The reason:
- CFLs are NOT closed under complement or intersection
- We cannot build a "symmetric difference" PDA
- Formally: $EQ_{CFG}$ can be reduced from the Post Correspondence Problem

### Why the DFA proof doesn't work

For DFAs: $L(A) = L(B)$ iff $L(A) \triangle L(B) = \emptyset$.

For CFGs: we cannot construct a PDA for $L(G) \triangle L(H)$ because CFLs aren't closed under intersection or complement. The entire approach breaks down.

---

## General Decidability Results

### Every Regular Language is Decidable

> **Theorem:** If $L$ is regular, then $L$ is decidable.

**Proof:** If $L$ is regular, there exists a DFA $B$ with $L(B) = L$. The TM that simulates $B$ on any input always halts (in $|w|$ steps) and correctly decides membership.

---

### Every Context-Free Language is Decidable

> **Theorem:** If $L$ is context-free, then $L$ is decidable.

**Proof:** If $L$ is context-free, there exists a CFG $G$ with $L(G) = L$. Convert $G$ to CNF and hardcode the CYK algorithm for $G$. The resulting TM:
- On input $w$, runs CYK in $O(|w|^3)$ time
- Always terminates
- Correctly determines if $w \in L$

Therefore every CFL is decidable. ∎

> **Corollary:** The strict containment chain is:
> $$\text{Regular} \subsetneq \text{CFL} \subsetneq \text{Decidable} \subsetneq \text{Recognizable}$$

---

## Closure Properties of Decidable Languages

Decidable languages are closed under all Boolean operations:

### Union

> **Theorem:** If $L_1$ and $L_2$ are decidable, then $L_1 \cup L_2$ is decidable.

**Proof:** Let $M_1$ decide $L_1$ and $M_2$ decide $L_2$.

Construct $M$ on input $w$:
1. Run $M_1$ on $w$. If $M_1$ accepts, accept.
2. Run $M_2$ on $w$. If $M_2$ accepts, accept.
3. Reject.

$M$ always halts (both $M_1$ and $M_2$ halt on all inputs). ∎

### Intersection

> **Theorem:** If $L_1$ and $L_2$ are decidable, then $L_1 \cap L_2$ is decidable.

**Proof:** Construct $M$ on input $w$:
1. Run $M_1$ on $w$. If $M_1$ rejects, reject.
2. Run $M_2$ on $w$. If $M_2$ rejects, reject.
3. Accept.

$M$ accepts iff both $M_1$ and $M_2$ accept. Always halts. ∎

### Complement

> **Theorem:** If $L$ is decidable, then $\bar{L}$ is decidable.

**Proof:** Let $M$ decide $L$. Construct $M'$ that:
1. Runs $M$ on input $w$
2. Flips the answer: accept ↔ reject

$M'$ decides $\bar{L}$. ∎

> **Key insight:** This proof ONLY works because $M$ always halts. For a recognizer that might loop, flipping accept/reject doesn't give a recognizer for the complement.

### Concatenation

> **Theorem:** If $L_1$ and $L_2$ are decidable, then $L_1 \cdot L_2$ is decidable.

**Proof:** Construct $M$ on input $w$ (where $|w| = n$):
1. For each split point $i = 0, 1, \ldots, n$:
   - Let $x = w[1..i]$ and $y = w[i+1..n]$
   - Run $M_1$ on $x$ and $M_2$ on $y$
   - If both accept, accept
2. If no split works, reject.

There are finitely many splits ($n + 1$). Each check halts. ∎

### Kleene Star

> **Theorem:** If $L$ is decidable, then $L^*$ is decidable.

**Proof:** Construct $M$ on input $w$ (where $|w| = n$):
1. If $w = \varepsilon$, accept (since $\varepsilon \in L^*$ always).
2. For each $k = 1, 2, \ldots, n$:
   - For each way to partition $w$ into $k$ non-empty parts $w = w_1 w_2 \cdots w_k$:
     - Run the decider for $L$ on each $w_i$
     - If all accept, accept
3. If no partition works, reject.

There are finitely many partitions of a finite string. Each check halts. ∎

---

## Decidability vs Recognizability: Summary

| Property | Decidable | Recognizable |
|----------|-----------|-------------|
| TM always halts | **Yes** | No (may loop) |
| Accept members | Yes | Yes |
| Reject non-members | **Yes (always)** | Maybe (or loop) |
| Closed under complement | **Yes** | No |
| $L$ decidable iff | both $L$ and $\bar{L}$ recognizable | — |

---

## The Landscape Before Undecidability

Let's summarize what we can decide:

### About Regular Languages: EVERYTHING

Every natural property of regular languages is decidable:
- Membership, emptiness, finiteness, equivalence, containment, universality, minimization, ...

### About CFLs: SOME THINGS

- Membership: YES (CYK)
- Emptiness: YES
- Finiteness: YES
- Equivalence: NO
- Universality: NO
- Ambiguity: NO

### About Turing Machines: Almost NOTHING

- Membership ($A_{TM}$): NO
- Halting ($HALT_{TM}$): NO
- Emptiness ($E_{TM}$): NO
- Equivalence ($EQ_{TM}$): NO
- Everything non-trivial: NO (Rice's theorem — next lessons)

### The Pattern

As the computational model becomes more powerful, fewer properties are decidable:

$$
\begin{array}{ccc}
\text{Model} & & \text{Decidable Properties} \\
\hline
\text{DFA} & & \text{All} \\
\text{PDA/CFG} & & \text{Some (membership, emptiness)} \\
\text{LBA} & & \text{Very few (membership only)} \\
\text{TM} & & \text{Almost none}
\end{array}
$$

> **Intuition:** The more powerful the model, the harder it is to analyze. DFAs are simple enough to fully understand. TMs are so powerful that understanding them is generally impossible.

---

## Proof: Every CFL is Decidable (Detailed)

This is an important theorem that bridges the Chomsky hierarchy and decidability.

> **Theorem:** Let $L$ be a context-free language. Then $L$ is decidable.

**Proof:**

Since $L$ is context-free, there exists a CFG $G = (V, \Sigma, R, S)$ with $L(G) = L$.

We construct a TM $D$ that decides $L$:

**Step 1:** Convert $G$ to Chomsky Normal Form $G' = (V', \Sigma, R', S)$.

This conversion is effective (algorithmic) and produces a grammar where:
- Every rule is $A \to BC$ (two variables) or $A \to a$ (single terminal)
- Possibly $S \to \varepsilon$ if $\varepsilon \in L$

**Step 2:** Build TM $D$:

$D$ = "On input $w$ (where $n = |w|$):
1. If $n = 0$: check if $S \to \varepsilon$ is in $R'$. If yes, accept. Else reject.
2. If $n > 0$: Run CYK:
   - Initialize table $T$: for each $i$, $T[i][i] = \{A \in V' \mid A \to w_i \in R'\}$
   - For $\ell = 2$ to $n$:
     - For $i = 1$ to $n - \ell + 1$:
       - $j = i + \ell - 1$
       - For $k = i$ to $j - 1$:
         - $T[i][j] = T[i][j] \cup \{A \mid A \to BC \in R', B \in T[i][k], C \in T[k+1][j]\}$
   - If $S \in T[1][n]$, accept.
   - Otherwise, reject."

**Halting:** The nested loops iterate a bounded number of times: $O(n^3)$ iterations, each checking $O(|R'|)$ rules. Total time: $O(n^3 \cdot |G|)$. Always finite.

**Correctness:** CYK correctly determines whether $S \Rightarrow^* w$ in $G'$. ∎

---

## What Comes Next?

We've seen the decidable landscape — the problems we CAN solve. But the most fascinating part of computability theory is what comes next:

**What can't we decide?**

In upcoming lessons, we will prove:
- $A_{TM}$ is undecidable (diagonalization)
- $HALT_{TM}$ is undecidable (reduction from $A_{TM}$)
- Rice's theorem: ALL non-trivial semantic properties of TMs are undecidable
- The Post Correspondence Problem is undecidable

The key techniques:
1. **Diagonalization** — self-referential contradiction
2. **Reduction** — if solving problem B solves problem A, and A is undecidable, then B is undecidable

---

## Try It Yourself

### Exercise 1

Prove that the following language is decidable:

$$
\{\langle A \rangle \mid A \text{ is a DFA and } L(A) \text{ is infinite}\}
$$

<details>
<summary>Solution</summary>

Build TM $M$ on input $\langle A \rangle$:
1. Let $n = |Q|$ (number of states in $A$)
2. $L(A)$ is infinite iff $A$ accepts some string of length between $n$ and $2n - 1$ (pumping lemma: if $A$ accepts a string of length $\geq n$, it can be pumped to get infinitely many)
3. Test all strings of length $n$ to $2n - 1$ using the $A_{DFA}$ algorithm
4. If any is accepted, accept (language is infinite)
5. Otherwise, reject (language is finite)

Alternative: Check if there's a cycle on any path from start state to an accept state. This is a graph reachability problem on the DFA's state diagram.

Both approaches always halt. ∎

</details>

### Exercise 2

Is the following language decidable?

$$
\{\langle G \rangle \mid G \text{ is a CFG and } \varepsilon \in L(G)\}
$$

<details>
<summary>Solution</summary>

Yes, decidable. This is a special case of $A_{CFG}$ with $w = \varepsilon$.

Direct algorithm: Find all "nullable" variables (those that can derive $\varepsilon$):
1. Mark $A$ as nullable if $A \to \varepsilon$ is a rule
2. Mark $A$ as nullable if $A \to B_1 B_2 \cdots B_k$ where all $B_i$ are nullable
3. Repeat until no change
4. Accept if $S$ is nullable, reject otherwise

Always terminates in $O(|G|)$ time. ∎

</details>

### Exercise 3

Prove that the decidable languages are closed under intersection by giving a complete TM construction.

<details>
<summary>Solution</summary>

Let $M_1$ decide $L_1$ and $M_2$ decide $L_2$.

Construct $M$:
$M$ = "On input $w$:
1. Run $M_1$ on $w$. Save the result (accept/reject).
2. Run $M_2$ on $w$. Save the result.
3. If BOTH accepted, accept.
4. Otherwise, reject."

**Halts:** $M_1$ and $M_2$ both halt on every input (they're deciders). So $M$ halts.

**Correct:** $M$ accepts $w$ iff $w \in L_1$ AND $w \in L_2$ iff $w \in L_1 \cap L_2$. ∎

</details>

### Exercise 4

Why can't we use the complement closure of decidable languages to prove $A_{TM}$ is decidable?

<details>
<summary>Solution</summary>

The argument would be: "Both $A_{TM}$ and $\overline{A_{TM}}$ are recognizable, so $A_{TM}$ is decidable."

But this fails because $\overline{A_{TM}}$ is NOT recognizable! We cannot assume it.

The theorem says: IF both $L$ and $\bar{L}$ are recognizable, THEN $L$ is decidable. But for $A_{TM}$, the hypothesis fails — $\overline{A_{TM}}$ is not recognizable.

</details>

### Exercise 5

Design a TM that decides:

$$
\{\langle M \rangle \mid M \text{ is a DFA that accepts some string containing "01"}\}
$$

<details>
<summary>Solution</summary>

Build TM $D$ on input $\langle M \rangle$:
1. Construct DFA $A$ that accepts $\Sigma^* 01 \Sigma^*$ (all strings containing "01")
2. Construct DFA $C$ for $L(M) \cap L(A)$ using the product construction
3. Test if $L(C) = \emptyset$ using the emptiness algorithm
4. If $L(C) \neq \emptyset$, accept (M accepts some string with "01")
5. If $L(C) = \emptyset$, reject

Always halts (all operations on DFAs terminate). ∎

</details>

---

## Key Takeaways

1. **Regular language problems** — ALL decidable: $A_{DFA}$, $E_{DFA}$, $EQ_{DFA}$, finiteness, etc.
2. **CFL problems** — SOME decidable: $A_{CFG}$ (CYK), $E_{CFG}$; NOT $EQ_{CFG}$
3. **Every CFL is decidable** — convert to CNF, use CYK
4. **Every regular language is decidable** — simulate the DFA
5. **Decidable languages closed under** union, intersection, complement, concat, star
6. **The pattern**: more powerful models → fewer decidable properties
7. **Next frontier**: proving that problems about TMs are undecidable

---

## What's Next?

Having established what IS decidable, we're now ready to prove what ISN'T. The next lessons cover the undecidability of $A_{TM}$ via diagonalization and the powerful technique of **reducibility** for proving more undecidability results.
