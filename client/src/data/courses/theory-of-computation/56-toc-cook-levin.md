---
title: NP-Completeness and the Cook-Levin Theorem
---

# NP-Completeness and the Cook-Levin Theorem

In this lesson, we dive into one of the most important results in theoretical computer science: the **Cook-Levin Theorem**. This theorem identifies the first **NP-complete** problem and provides the foundation for the entire theory of computational intractability.

---

## Polynomial-Time Reducibility

Before we can talk about NP-completeness, we need a formal way to compare the difficulty of problems.

### Definition

A language $A$ is **polynomial-time reducible** to a language $B$, written:

$$A \leq_P B$$

if there exists a **polynomial-time computable function** $f: \Sigma^* \to \Sigma^*$ such that for every string $w$:

$$w \in A \iff f(w) \in B$$

The function $f$ is called a **polynomial-time reduction** from $A$ to $B$.

### Intuition

Think of it this way: if you can solve $B$, then you can also solve $A$ by first transforming the input using $f$, then asking whether $f(w) \in B$.

```
Input w → [Reduction f] → f(w) → [Decider for B] → YES/NO
```

The answer for $f(w) \in B$ is the same as the answer for $w \in A$.

---

### Key Property

> **Theorem:** If $B \in P$ and $A \leq_P B$, then $A \in P$.

**Proof:** Let $M_B$ be a polynomial-time decider for $B$, and let $f$ be the polynomial-time reduction from $A$ to $B$. Then the following algorithm decides $A$ in polynomial time:

1. On input $w$, compute $f(w)$ (takes polynomial time)
2. Run $M_B$ on $f(w)$ (takes polynomial time since $|f(w)|$ is polynomial in $|w|$)
3. Accept if $M_B$ accepts; reject if $M_B$ rejects

Total time: polynomial + polynomial = polynomial. ∎

### Contrapositive

Equally important is the **contrapositive**:

$$\text{If } A \notin P \text{ and } A \leq_P B, \text{ then } B \notin P$$

This is how we use reductions to prove problems are **hard**: reduce a known hard problem TO the problem in question.

---

## NP-Hardness

### Definition

A language $L$ is **NP-hard** if:

$$\forall A \in NP: A \leq_P L$$

In other words, $L$ is **at least as hard as every problem in NP**.

### Important Notes

- An NP-hard problem does **not** need to be in NP itself
- An NP-hard problem might be undecidable!
- Example: The halting problem is NP-hard (every NP problem reduces to it) but is not in NP

---

## NP-Completeness

### Definition

A language $L$ is **NP-complete** if:

1. $L \in NP$ (the problem is in NP)
2. $L$ is NP-hard (every NP problem reduces to it)

NP-complete problems are the **hardest problems in NP** — they sit at the boundary.

### The Million-Dollar Consequence

> **Theorem:** If ANY NP-complete problem can be solved in polynomial time, then $P = NP$.

**Proof:** Suppose $L$ is NP-complete and $L \in P$. Let $A$ be any language in NP. Since $L$ is NP-complete, $A \leq_P L$. Since $L \in P$ and $A \leq_P L$, we get $A \in P$. Since $A$ was arbitrary, every language in NP is in P, so $P = NP$. ∎

### Conversely

> If $P \neq NP$, then NO NP-complete problem is in P.

This is why proving a problem NP-complete is so powerful — it provides strong evidence that no efficient algorithm exists.

---

## The Cook-Levin Theorem

### The SAT Problem

**SAT** (Boolean Satisfiability):

- **Input:** A Boolean formula $\phi(x_1, x_2, \ldots, x_n)$ using variables, $\land$, $\lor$, $\neg$, and parentheses
- **Question:** Is there an assignment to the variables that makes $\phi$ evaluate to TRUE?

### Example

$$\phi = (x_1 \lor \neg x_2) \land (x_2 \lor x_3) \land (\neg x_1 \lor \neg x_3)$$

Try $x_1 = T, x_2 = T, x_3 = F$:
- $(T \lor \neg T) = (T \lor F) = T$ ✓
- $(T \lor F) = T$ ✓
- $(\neg T \lor \neg F) = (F \lor T) = T$ ✓

So $\phi$ is satisfiable, and this instance is in SAT.

---

### Statement of the Cook-Levin Theorem

> **Cook-Levin Theorem (1971):** SAT is NP-complete.

This was proven independently by Stephen Cook and Leonid Levin. It was the **first** problem ever shown to be NP-complete.

---

### Part 1: SAT is in NP

To show SAT $\in$ NP, we need a polynomial-time verifier.

**Certificate:** A truth assignment $\sigma: \{x_1, \ldots, x_n\} \to \{T, F\}$

**Verifier:**
1. Substitute $\sigma$ into $\phi$
2. Evaluate the formula (this takes $O(|\phi|)$ time)
3. Accept if the result is TRUE

The certificate has size $n$ (one bit per variable), and verification takes polynomial time. Therefore SAT $\in$ NP. ✓

---

### Part 2: SAT is NP-Hard

This is the challenging part. We must show:

$$\forall A \in NP: A \leq_P \text{SAT}$$

**Key Insight:** Every language $A \in NP$ has a polynomial-time NTM $N$ that decides it. We will encode the **entire computation** of $N$ on input $w$ as a Boolean formula $\phi$ such that:

$$N \text{ accepts } w \iff \phi \text{ is satisfiable}$$

---

### The Encoding: Tableau Method

Let $N$ be an NTM deciding $A$ in time $n^k$. Let $w$ be an input of length $n$. The computation of $N$ on $w$ can be represented as a **tableau** — a table with:

- Rows: $t = 0, 1, \ldots, n^k$ (time steps)
- Columns: $i = 0, 1, \ldots, n^k$ (tape cells)

Each cell contains a symbol from the tape alphabet or a state-symbol pair (indicating the head position).

### Variables

We introduce Boolean variables:

**Cell variables:** For each cell $(i, t)$ and tape symbol $s$:

$$x_{i,t,s} = \begin{cases} 1 & \text{if cell } i \text{ at time } t \text{ contains symbol } s \\ 0 & \text{otherwise} \end{cases}$$

**Total variables:** $O(n^k \cdot n^k \cdot |C|) = O(n^{2k})$ where $C = Q \cup \Gamma$ (states and tape symbols).

### Clauses

The formula $\phi$ is a conjunction of clauses encoding four properties:

---

#### 1. Cell Consistency ($\phi_{\text{cell}}$)

Each cell contains **exactly one** symbol at each time step:

$$\phi_{\text{cell}} = \bigwedge_{0 \leq i,t \leq n^k} \left[ \left(\bigvee_{s \in C} x_{i,t,s}\right) \land \bigwedge_{s \neq s'} (\neg x_{i,t,s} \lor \neg x_{i,t,s'}) \right]$$

This ensures: at least one symbol (OR clause) and at most one symbol (pairwise exclusion).

---

#### 2. Valid Start Configuration ($\phi_{\text{start}}$)

The first row encodes the initial configuration: state $q_0$, head at position 0, input $w = w_1 w_2 \cdots w_n$ on tape:

$$\phi_{\text{start}} = x_{0,0,q_0} \land x_{1,0,w_1} \land x_{2,0,w_2} \land \cdots \land x_{n,0,w_n} \land x_{n+1,0,\sqcup} \land \cdots$$

---

#### 3. Valid Transitions ($\phi_{\text{move}}$)

Each $2 \times 3$ window of the tableau must be consistent with the transition function. For cells not adjacent to the head, the content doesn't change:

$$\phi_{\text{move}} = \bigwedge_{0 \leq i \leq n^k} \bigwedge_{0 \leq t < n^k} \text{window}(i, t)$$

where $\text{window}(i,t)$ checks that the $2 \times 3$ window centered at $(i,t)$–$(i,t+1)$ is **legal** according to $N$'s transition function.

A window is legal if it can appear in some valid computation of $N$. This is expressible as a disjunction over all legal window patterns.

---

#### 4. Acceptance ($\phi_{\text{accept}}$)

At least one cell in the tableau contains the accept state:

$$\phi_{\text{accept}} = \bigvee_{0 \leq i,t \leq n^k} x_{i,t,q_{\text{accept}}}$$

---

### The Complete Formula

$$\phi = \phi_{\text{cell}} \land \phi_{\text{start}} \land \phi_{\text{move}} \land \phi_{\text{accept}}$$

### Correctness

**Claim:** $N$ accepts $w$ if and only if $\phi$ is satisfiable.

**($\Rightarrow$):** If $N$ accepts $w$, then there exists an accepting computation. Setting the variables according to this computation satisfies all four parts of $\phi$.

**($\Leftarrow$):** If $\phi$ is satisfiable, the satisfying assignment encodes a valid computation (correct start, legal transitions) that reaches an accepting state. Therefore $N$ accepts $w$.

### Polynomial Size

- Number of variables: $O(n^{2k} \cdot |C|) = O(n^{2k})$ (since $|C|$ is constant)
- $\phi_{\text{cell}}$: $O(n^{2k})$ clauses, each of constant size
- $\phi_{\text{start}}$: $O(n^k)$ literals
- $\phi_{\text{move}}$: $O(n^{2k})$ windows, each of constant size
- $\phi_{\text{accept}}$: $O(n^{2k})$ literals

Total: $|\phi| = O(n^{2k})$, which is polynomial in $n$.

The reduction also runs in polynomial time (constructing the formula). ∎

---

## Significance of the Cook-Levin Theorem

The Cook-Levin Theorem is the **gateway** to all NP-completeness results:

1. It establishes that NP-complete problems **exist**
2. Once we know SAT is NP-complete, we can prove other problems NP-complete by reducing FROM SAT
3. It connects logic (satisfiability) to computation (NP)

### The Reduction Chain

```
All NP problems → SAT → 3SAT → CLIQUE → VERTEX-COVER → ...
```

Every subsequent NP-completeness proof builds on Cook-Levin by **chaining reductions**.

---

## 3SAT is NP-Complete

### The 3SAT Problem

**3SAT** is a restricted version of SAT:

- **Input:** A Boolean formula $\phi$ in **3-CNF** (Conjunctive Normal Form with exactly 3 literals per clause)
- **Question:** Is $\phi$ satisfiable?

A 3-CNF formula looks like:

$$(l_1 \lor l_2 \lor l_3) \land (l_4 \lor l_5 \lor l_6) \land \cdots$$

where each $l_i$ is a literal (variable or its negation).

---

### 3SAT ∈ NP

Same verifier as SAT — a truth assignment is the certificate.

---

### 3SAT is NP-Hard (Reduction from SAT)

We reduce SAT to 3SAT. Given a SAT formula $\phi$, convert each clause to an equivalent set of 3-literal clauses.

**Case 1: Clause has 1 literal** $(l_1)$

Introduce auxiliary variables $y_1, y_2$ and replace with:

$$(l_1 \lor y_1 \lor y_2) \land (l_1 \lor y_1 \lor \neg y_2) \land (l_1 \lor \neg y_1 \lor y_2) \land (l_1 \lor \neg y_1 \lor \neg y_2)$$

These are satisfiable iff $l_1 = T$ (all four assignments of $y_1, y_2$ are covered).

**Case 2: Clause has 2 literals** $(l_1 \lor l_2)$

Introduce one auxiliary variable $y_1$:

$$(l_1 \lor l_2 \lor y_1) \land (l_1 \lor l_2 \lor \neg y_1)$$

Satisfiable iff $l_1 \lor l_2 = T$.

**Case 3: Clause has 3 literals** $(l_1 \lor l_2 \lor l_3)$

Already in the correct form. Keep it.

**Case 4: Clause has $k > 3$ literals** $(l_1 \lor l_2 \lor \cdots \lor l_k)$

Introduce auxiliary variables $y_1, y_2, \ldots, y_{k-3}$ and replace with:

$$(l_1 \lor l_2 \lor y_1)$$
$$(\neg y_1 \lor l_3 \lor y_2)$$
$$(\neg y_2 \lor l_4 \lor y_3)$$
$$\vdots$$
$$(\neg y_{k-3} \lor l_{k-1} \lor l_k)$$

**Correctness:** The original clause is satisfiable iff the resulting clauses are simultaneously satisfiable. The auxiliary variables "propagate" the truth values.

**Polynomial time:** Each clause of $k$ literals produces $O(k)$ clauses with $O(k)$ new variables. Total size is polynomial.

Therefore, 3SAT is NP-complete. ∎

---

## Why 3SAT Matters

3SAT is the **workhorse** of NP-completeness proofs because:

1. Its structure is simple and regular (fixed clause size)
2. The fixed structure makes it easier to design gadgets
3. Almost all NP-completeness proofs reduce FROM 3SAT

---

## Historical Context

### Stephen Cook (1971)

Cook presented his theorem at the ACM Symposium on Theory of Computing (STOC). At the time, the significance was not immediately recognized by all attendees. The paper "The Complexity of Theorem-Proving Procedures" laid the foundation for computational complexity theory.

### Leonid Levin (1973)

Working independently in the Soviet Union, Levin proved an equivalent result. His formulation was slightly different — he defined "universal search problems" — but the mathematical content is the same.

### Richard Karp (1972)

Shortly after Cook's result, Karp demonstrated 21 NP-complete problems by reducing from SAT/3SAT. This "Karp's 21 problems" paper showed that NP-completeness was widespread and practically important.

---

## The Landscape After Cook-Levin

The Cook-Levin Theorem opened a floodgate:

- **1972:** Karp's 21 NP-complete problems (CLIQUE, VERTEX-COVER, HAM-CYCLE, PARTITION, etc.)
- **1970s-80s:** Thousands of problems proven NP-complete
- **Garey & Johnson (1979):** The book "Computers and Intractability" catalogued hundreds of NP-complete problems
- **Today:** NP-completeness is a standard tool in algorithm design — when you prove your problem is NP-complete, you shift from seeking exact algorithms to approximation, heuristics, or parameterized approaches

---

## Common Misconceptions

### Misconception 1: "NP means exponential time"

**Wrong!** NP means "nondeterministic polynomial time" — problems with efficiently verifiable solutions. We don't know whether NP problems require exponential time (that's the $P \neq NP$ question).

### Misconception 2: "NP-complete means unsolvable"

**Wrong!** NP-complete problems ARE solvable — just (probably) not in polynomial time. Exact algorithms exist; they're just exponential. And many practical instances are solvable by heuristics (SAT solvers handle millions of variables in practice).

### Misconception 3: "If a problem is NP-hard, it can't be in P"

**Conditional!** This is true only IF $P \neq NP$. If $P = NP$, then all NP-hard problems in NP would be in P.

### Misconception 4: "The reduction solves the source problem"

**Wrong!** The reduction transforms instances WITHOUT solving them. It runs in polynomial time and cannot determine the answer — it just maps the question to an equivalent one.

---

## Summary

| Concept | Definition |
|---------|-----------|
| $A \leq_P B$ | Polynomial-time reduction from $A$ to $B$ |
| NP-hard | At least as hard as everything in NP |
| NP-complete | In NP AND NP-hard |
| SAT | Is a Boolean formula satisfiable? |
| Cook-Levin | SAT is NP-complete |
| 3SAT | SAT restricted to 3-CNF; also NP-complete |

---

## Key Takeaways

1. Polynomial-time reductions let us compare problem difficulty
2. NP-complete problems are the hardest problems in NP
3. The Cook-Levin Theorem proves SAT is NP-complete by encoding computation as a formula
4. 3SAT inherits NP-completeness from SAT and serves as the starting point for most reductions

---

## Exercises

### Exercise 1: Reduction Direction

Explain why showing $\text{SAT} \leq_P B$ proves $B$ is NP-hard, but showing $B \leq_P \text{SAT}$ does NOT.

<details>
<summary>Solution</summary>

$\text{SAT} \leq_P B$ means "if you can solve $B$, you can solve SAT." Since SAT is NP-complete (everything in NP reduces to it), everything in NP also reduces to $B$ (by composing reductions). So $B$ is NP-hard.

$B \leq_P \text{SAT}$ only means "$B$ is no harder than SAT" — it tells us $B \in NP$ (at most), not that $B$ is hard.
</details>

### Exercise 2: Formula Size

In the Cook-Levin proof, if the NTM runs in time $n^3$, what is the size of the resulting formula $\phi$ in terms of $n$?

<details>
<summary>Solution</summary>

The tableau has $n^3$ rows and $n^3$ columns, giving $n^6$ cells. Each cell has $O(1)$ variables (constant alphabet size). The formula components each have $O(n^6)$ clauses of constant size. So $|\phi| = O(n^6)$.
</details>

### Exercise 3: 2SAT

Is 2SAT (SAT restricted to 2 literals per clause) NP-complete?

<details>
<summary>Solution</summary>

No! 2SAT is in P. It can be solved in polynomial time using implication graphs and strongly connected components. This shows that the "3" in 3SAT is critical — reducing from 3 to 2 literals per clause makes the problem tractable.
</details>

### Exercise 4: Composing Reductions

Prove that polynomial-time reducibility is **transitive**: if $A \leq_P B$ and $B \leq_P C$, then $A \leq_P C$.

<details>
<summary>Solution</summary>

Let $f$ reduce $A$ to $B$ in time $p(n)$, and $g$ reduce $B$ to $C$ in time $q(n)$.

Define $h(w) = g(f(w))$.

- Correctness: $w \in A \iff f(w) \in B \iff g(f(w)) \in C$
- Time: Computing $f(w)$ takes $p(n)$ time, giving $|f(w)| \leq p(n)$. Computing $g(f(w))$ takes $q(p(n))$ time. Total: $p(n) + q(p(n))$, which is polynomial.

Therefore $A \leq_P C$ via the reduction $h$. ∎
</details>

### Exercise 5: Window Method

In the Cook-Levin proof, why do we use $2 \times 3$ windows instead of just checking each cell individually?

<details>
<summary>Solution</summary>

A single cell's value at time $t+1$ depends on the contents of that cell and its neighbors at time $t$ (because the head might move to or from an adjacent cell). A $2 \times 3$ window captures exactly the local information needed to determine if a transition is legal: the cell, its left neighbor, and its right neighbor at two consecutive time steps. Checking cells individually couldn't capture the relationship between adjacent cells and successive time steps.
</details>

### Exercise 6: Padding Argument

Show that if $A$ is NP-complete and $A \leq_P B$ and $B \in NP$, then $B$ is NP-complete.

<details>
<summary>Solution</summary>

We need to show $B$ is NP-hard. Let $L$ be any language in NP. Since $A$ is NP-complete, $L \leq_P A$. We also have $A \leq_P B$. By transitivity of $\leq_P$ (Exercise 4), $L \leq_P B$. Since $L$ was arbitrary, $B$ is NP-hard. Combined with $B \in NP$, $B$ is NP-complete. ∎
</details>

### Exercise 7: Polynomial-Time Mapping

In the Cook-Levin proof, explain why the reduction function $f$ (that maps $(N, w)$ to a formula $\phi$) runs in polynomial time, even though $N$ might have exponentially many computation paths.

<details>
<summary>Solution</summary>

The reduction doesn't enumerate computation paths! It constructs a formula that **encodes the possibility** of a valid accepting computation. The formula's variables represent the tableau (configuration at each time step and cell position), and the clauses encode local constraints (valid start, legal transitions, acceptance).

The tableau has $O(n^{2k})$ cells, each generating $O(1)$ variables and $O(1)$ clauses. The total construction time is $O(n^{2k})$ — polynomial in $n$. The NTM's nondeterminism is captured by the existential nature of satisfying assignments, not by explicitly exploring branches.
</details>

---

## What's Next?

Now that we have SAT and 3SAT as NP-complete problems, we'll use them to prove NP-completeness of many other fundamental problems — graphs, numbers, and more!
