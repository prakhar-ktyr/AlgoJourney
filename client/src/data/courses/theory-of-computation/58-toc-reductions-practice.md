---
title: Polynomial Reductions in Practice
---

# Polynomial Reductions in Practice

Constructing polynomial-time reductions is both an **art** and a **science**. This lesson teaches practical techniques for designing reductions, with detailed worked examples and common patterns you'll encounter.

---

## The Art of Polynomial Reduction

A reduction from $A$ to $B$ is a function $f$ that transforms instances of $A$ into instances of $B$ while preserving the answer:

$$w \in A \iff f(w) \in B$$

The challenge is designing $f$. There's no single algorithm — it requires creativity. But there ARE patterns and strategies.

---

## General Strategy

### Step-by-Step Approach

When proving $A \leq_P B$:

**Step 1: Understand both problems deeply**
- What does a YES instance of $A$ look like?
- What does a YES instance of $B$ look like?
- What structure in $B$ can represent the "choice" in $A$?

**Step 2: Design the mapping**
- Map instances of $A$ to instances of $B$
- YES instances must map to YES instances
- NO instances must map to NO instances

**Step 3: Verify polynomial time**
- The construction must be computable in polynomial time
- The output size must be polynomial in the input size

**Step 4: Prove correctness (both directions)**
- Forward: if $w \in A$ then $f(w) \in B$
- Backward: if $f(w) \in B$ then $w \in A$

---

## Types of Reductions

### 1. Gadget-Based Reductions

The most common and creative type. Build components ("gadgets") in the target problem that simulate structures in the source problem.

### 2. Restriction Reductions

Show that a special case of the target problem is already hard.

### 3. Local Replacement Reductions

Replace components one-by-one with equivalent components in the target problem.

---

## Gadget-Based Reductions

### What Are Gadgets?

A **gadget** is a small substructure in the target problem's instance that enforces a specific constraint or represents a specific concept from the source problem.

Common gadget types:

| Gadget Type | Purpose |
|-------------|---------|
| Variable gadget | Represents a Boolean variable (two states) |
| Clause gadget | Represents a clause (at least one literal true) |
| Consistency gadget | Ensures the same variable has the same value everywhere |
| Communication gadget | Transmits information between parts |

---

### Detailed Example: 3SAT → 3-COLORING

This is one of the most elegant gadget-based reductions. Let's work through it completely.

**Given:** 3SAT formula $\phi$ with variables $x_1, \ldots, x_n$ and clauses $C_1, \ldots, C_m$.

**Goal:** Construct graph $G$ that is 3-colorable $\iff$ $\phi$ is satisfiable.

We'll call the three colors **T** (True), **F** (False), and **B** (Base).

---

#### Gadget 1: The Palette Triangle

Create three special vertices forming a triangle:

$$\text{True} - \text{False} - \text{Base} - \text{True}$$

Since they form a triangle ($K_3$), they MUST receive all three different colors. We name the colors by which vertex gets them:

- Color of True vertex = color T
- Color of False vertex = color F  
- Color of Base vertex = color B

```
    True (color T)
   /    \
  /      \
False --- Base
(color F)  (color B)
```

---

#### Gadget 2: Variable Gadgets

For each variable $x_i$, create two vertices: $v_i$ (representing $x_i$) and $\bar{v}_i$ (representing $\neg x_i$).

**Edges:**
- $v_i - \bar{v}_i$ (they must get different colors)
- $v_i - \text{Base}$ (forces $v_i \neq$ color B)
- $\bar{v}_i - \text{Base}$ (forces $\bar{v}_i \neq$ color B)

**Effect:** Both $v_i$ and $\bar{v}_i$ must be colored with T or F (since B is excluded). And since they're connected to each other, one gets T and the other gets F.

$$v_i \text{ gets color T} \iff \text{``} x_i = \text{TRUE''}$$
$$v_i \text{ gets color F} \iff \text{``} x_i = \text{FALSE''}$$

```
    Base (B)
   /    \
  /      \
v_i --- v̄_i
(T or F)  (F or T)
```

---

#### Gadget 3: The OR-Gadget (Clause Gadget)

This is the ingenious part. For each clause $C_j = (l_a \lor l_b \lor l_c)$, we need a subgraph that is 3-colorable **only if** at least one of the literal-vertices has color T.

**The OR-gadget** uses 6 auxiliary vertices to implement a "3-input OR":

Given three literal vertices $a$, $b$, $c$ (already in the graph from variable gadgets), add vertices $d, e, f, g, h, i$ with edges:

**Layer 1:** Create vertex $d$ connected to $a$ and $b$; vertex $e$ connected to $d$ and Base.

**Layer 2:** Create vertex $f$ connected to $e$ and $c$; vertex $g$ connected to $f$ and Base.

**Constraint:** Connect $g$ to True vertex.

The key property:

> $g$ can receive a color $\neq$ True $\iff$ at least one of $a, b, c$ has color T.

If all of $a, b, c$ have color F, the propagation through the gadget forces $g$ to need color T — but $g$ is connected to the True vertex, creating a contradiction.

---

#### Putting It All Together

The complete graph $G$ consists of:
1. The palette triangle (3 vertices, 3 edges)
2. Variable gadgets ($2n$ vertices, $3n$ edges)  
3. OR-gadgets ($O(m)$ auxiliary vertices, $O(m)$ edges)

**Correctness:**

$(\Rightarrow)$ If $\phi$ is satisfiable, assign colors T/F to variable vertices according to the satisfying assignment. In each clause, at least one literal is T, so the OR-gadget is 3-colorable.

$(\Leftarrow)$ If $G$ is 3-colorable, the variable vertices encode a valid truth assignment (one of $v_i, \bar{v}_i$ gets T). The OR-gadgets ensure each clause has at least one T literal, so $\phi$ is satisfied.

**Polynomial time:** $O(n + m)$ vertices, $O(n + m)$ edges. ✓

---

## Restriction Reductions

### Idea

Sometimes a problem remains NP-hard even for a **restricted** class of inputs. Showing this restricted version is NP-hard (by reduction) immediately proves the general version is NP-hard.

### Example: 3SAT from SAT

3SAT is a **restriction** of SAT where each clause has exactly 3 literals. The reduction from SAT to 3SAT (shown in the previous lesson) demonstrates that this restricted form is already NP-hard.

### Example: 3-COLORING from $k$-COLORING

For $k \geq 3$: given a graph $G$, is it $k$-colorable?

**Reduction from 3-COLORING:** Given graph $G$ (testing 3-colorability), add $k - 3$ new vertices, all connected to each other and to every vertex of $G$.

- If $G$ is 3-colorable: use 3 colors for $G$'s vertices, and the remaining $k-3$ colors for the new vertices. Total: $k$ colors. ✓
- If the new graph is $k$-colorable: the $k-3$ new vertices use $k-3$ distinct colors. The remaining vertices of $G$ use only 3 colors. So $G$ is 3-colorable. ✓

This shows $k$-COLORING is NP-hard for every fixed $k \geq 3$.

---

## Local Replacement Reductions

### Idea

Replace each component of the input independently with an equivalent component in the target problem. These reductions are often simpler because each piece is handled separately.

### Example: VERTEX-COVER from INDEPENDENT-SET

**Recall:** $S$ is an independent set in $G$ $\iff$ $V \setminus S$ is a vertex cover in $G$.

**Reduction:** $(G, k)_{\text{IND-SET}} \mapsto (G, n-k)_{\text{VTX-COVER}}$

This is a "local replacement" because we just reinterpret the same graph with a different parameter. No structural changes needed.

### Example: HAM-CYCLE from HAM-PATH

Given a HAM-PATH instance $(G, s, t)$:
- Add a new vertex $v^*$
- Connect $v^*$ to both $s$ and $t$
- The new graph has a Hamiltonian cycle $\iff$ the original has a Hamiltonian path from $s$ to $t$

Each edge/vertex is handled by a simple local rule.

---

## Common Pitfalls

### Pitfall 1: Reducing in the Wrong Direction

**WRONG:** To prove $B$ is NP-hard, reduce $B$ to $A$ (known NP-complete).

This shows $B \leq_P A$, meaning "B is no harder than A." That's useless for hardness!

**CORRECT:** Reduce $A$ (known NP-complete) to $B$.

This shows $A \leq_P B$, meaning "B is at least as hard as A."

### Memory Aid

$$\text{Known Hard} \leq_P \text{New Problem}$$

The problem you want to prove hard goes on the **RIGHT** side.

---

### Pitfall 2: Non-Polynomial Reduction

A reduction must run in polynomial time. Common mistakes:

- Enumerating all subsets: $2^n$ possibilities → exponential!
- Building a formula with exponentially many clauses
- Creating a graph with exponentially many vertices

**Check:** Is the output size polynomial in the input size?

---

### Pitfall 3: Missing Edge Cases

The reduction must map ALL instances correctly:

- YES $\to$ YES ✓
- NO $\to$ NO ✓

Don't just check "it works for typical inputs." The proof must handle every possible input.

---

### Pitfall 4: Forgetting the NP Step

NP-completeness requires BOTH:
1. The problem is in NP (needs a verifier)
2. The problem is NP-hard (needs a reduction)

Many students forget step 1!

---

## Practice Problem 1: SET-COVER is NP-Complete

### Problem Statement

**SET-COVER:**
- **Input:** Universe $U = \{1, 2, \ldots, n\}$, collection $\mathcal{S} = \{S_1, S_2, \ldots, S_m\}$ of subsets of $U$, integer $k$
- **Question:** Are there $k$ sets in $\mathcal{S}$ whose union is $U$?

### Proof

**Step 1: SET-COVER ∈ NP**

Certificate: $k$ sets from $\mathcal{S}$. Verifier: compute their union (in $O(n \cdot k)$ time) and check it equals $U$. ✓

**Step 2: VERTEX-COVER $\leq_P$ SET-COVER**

Given VERTEX-COVER instance $(G = (V, E), k)$:

**Construct SET-COVER instance:**
- Universe $U = E$ (the edges)
- For each vertex $v \in V$, create set $S_v = \{e \in E : v \text{ is an endpoint of } e\}$
- Parameter: same $k$

**Correctness:**

$(\Rightarrow)$ If $C$ is a vertex cover of size $k$, then $\{S_v : v \in C\}$ covers all edges (every edge has an endpoint in $C$, so it's in the corresponding set). So SET-COVER has a solution of size $k$.

$(\Leftarrow)$ If $\{S_{v_1}, \ldots, S_{v_k}\}$ covers $U = E$, then $\{v_1, \ldots, v_k\}$ is a vertex cover (every edge is in some $S_{v_i}$, meaning $v_i$ is an endpoint of that edge).

**Polynomial time:** $|U| = |E|$, $|\mathcal{S}| = |V|$, each set has at most $|E|$ elements. Construction takes $O(|V| \cdot |E|)$. ✓

---

## Practice Problem 2: PARTITION is NP-Complete

### Problem Statement

**PARTITION:**
- **Input:** A multiset $S = \{a_1, a_2, \ldots, a_n\}$ of positive integers
- **Question:** Can $S$ be partitioned into two subsets $S_1, S_2$ with $\sum S_1 = \sum S_2$?

### Proof

**Step 1: PARTITION ∈ NP**

Certificate: the subset $S_1$. Verifier: check $\sum S_1 = \frac{1}{2} \sum S$. Polynomial time. ✓

**Step 2: SUBSET-SUM $\leq_P$ PARTITION**

Given SUBSET-SUM instance $(S = \{a_1, \ldots, a_n\}, t)$ with $\sum S = \sigma$:

**Construct PARTITION instance:**

**Case 1:** $\sigma \geq 2t$. Add element $b = \sigma - 2t$ to $S$. New sum = $\sigma + b = 2\sigma - 2t$. Target for each part: $\sigma - t$.

**Case 2:** $\sigma < 2t$. Add element $b = 2t - \sigma$ to $S$. New sum = $\sigma + b = 2t$. Target for each part: $t$.

In both cases, we add one element so that:

$$\text{New set has subset summing to } t + (\text{adjustment}) \iff \text{original has subset summing to } t$$

**Standard construction:** Let $S' = S \cup \{\sigma - 2t + 1, 1\}$ when $\sigma - 2t$ is odd (ensuring we can handle parity). The key property is:

$S'$ can be partitioned into equal halves $\iff$ $S$ has a subset summing to $t$.

**Polynomial time:** We add at most 2 elements. ✓

---

## Practice Problem 3: LONGEST-PATH is NP-Complete

### Problem Statement

**LONGEST-PATH:**
- **Input:** Graph $G = (V, E)$, vertices $s, t$, integer $k$
- **Question:** Is there a simple path from $s$ to $t$ of length $\geq k$?

### Proof

**Step 1: LONGEST-PATH ∈ NP**

Certificate: a path $v_1, v_2, \ldots, v_l$ with $v_1 = s$, $v_l = t$, $l - 1 \geq k$. Verifier: check vertices distinct, consecutive vertices connected, length $\geq k$. Polynomial. ✓

**Step 2: HAM-PATH $\leq_P$ LONGEST-PATH**

Given HAM-PATH instance $(G = (V, E), s, t)$ with $|V| = n$:

**Construct:** LONGEST-PATH instance $(G, s, t, n-1)$.

**Correctness:** A Hamiltonian path from $s$ to $t$ visits all $n$ vertices, so it has length $n - 1$. Conversely, a simple path of length $n - 1$ visits $n$ vertices — all of them (since the graph only has $n$) — so it's Hamiltonian.

$$G \text{ has Ham. path } s \to t \iff G \text{ has simple path of length } \geq n-1 \text{ from } s \text{ to } t$$

**Polynomial time:** Identity reduction (same graph, just set $k = n-1$). ✓

This is the simplest possible reduction — the "identity" or "trivial" reduction.

---

## Practice Problem 4: Design Your Own Reduction

### DOUBLE-SAT

**DOUBLE-SAT:**
- **Input:** Boolean formula $\phi$
- **Question:** Does $\phi$ have at least TWO distinct satisfying assignments?

**Show DOUBLE-SAT is NP-hard** (reduction from SAT).

<details>
<summary>Solution</summary>

**Reduction:** Given SAT instance $\phi(x_1, \ldots, x_n)$, construct:

$$\phi'(x_1, \ldots, x_n, y) = \phi(x_1, \ldots, x_n)$$

where $y$ is a fresh variable that doesn't appear in $\phi'$.

**Correctness:**
- If $\phi$ is satisfiable with assignment $\sigma$, then $\phi'$ is satisfiable by $(\sigma, y=T)$ and $(\sigma, y=F)$ — two distinct assignments.
- If $\phi'$ has two distinct satisfying assignments, then (ignoring $y$) $\phi$ is satisfiable.

Wait — this doesn't quite work because DOUBLE-SAT needs two distinct assignments to $\phi'$, not just $\phi$.

Actually it does work: if $\phi$ has satisfying assignment $\sigma$, then $(\sigma, y=0)$ and $(\sigma, y=1)$ are two distinct satisfying assignments for $\phi'$. Conversely, if $\phi'$ has a satisfying assignment, then $\phi$ must be satisfiable (since $\phi' = \phi$, the value of $y$ doesn't matter).

But we need: $\phi$ satisfiable $\iff$ $\phi'$ has $\geq 2$ satisfying assignments.

$(\Rightarrow)$: $\phi$ satisfiable → $\phi'$ has $\geq 2$ assignments (both values of $y$ work). ✓

$(\Leftarrow)$: $\phi'$ has $\geq 2$ satisfying assignments → $\phi'$ has $\geq 1$ satisfying assignment → $\phi$ is satisfiable. ✓

Polynomial time: just add one variable (don't even add clauses). ✓
</details>

---

## Summary of Reduction Techniques

| Technique | When to Use | Example |
|-----------|------------|---------|
| Gadget-based | Source has logical structure (3SAT) | 3SAT → 3-COLORING |
| Restriction | Target is a generalization of source | 3SAT is restriction of SAT |
| Local replacement | One-to-one component mapping | IND-SET ↔ VERTEX-COVER |
| Identity/trivial | Target directly generalizes source | HAM-PATH → LONGEST-PATH |
| Number encoding | Source has variables, target has numbers | 3SAT → SUBSET-SUM |

---

## Checklist for NP-Completeness Proofs

Before submitting your proof, verify:

- [ ] Stated both parts: $B \in NP$ and $A \leq_P B$
- [ ] Named the specific NP-complete problem $A$ you reduce from
- [ ] Described the reduction function explicitly
- [ ] Proved correctness in BOTH directions ($\Rightarrow$ and $\Leftarrow$)
- [ ] Verified polynomial running time of the reduction
- [ ] Checked reduction direction (FROM known hard TO new problem)

---

## Exercises

### Exercise 1

Prove that the following problem is NP-complete:

**HALF-CLIQUE:** Given graph $G$ with $n$ vertices, does $G$ have a clique of size $\lceil n/2 \rceil$?

<details>
<summary>Hint</summary>

Reduce from CLIQUE. Given $(G, k)$, add isolated vertices or a disjoint clique to adjust $n$ so that $\lceil n/2 \rceil = k$.
</details>

### Exercise 2

Why is the following "reduction" from SAT to CLIQUE **incorrect**?

"Given formula $\phi$, try all $2^n$ assignments. If satisfiable, output a graph with a $k$-clique. If not, output a graph without one."

<details>
<summary>Solution</summary>

This "reduction" takes exponential time ($2^n$ assignments to try). A valid polynomial-time reduction cannot solve the source problem — it must transform the instance without knowing the answer.
</details>

### Exercise 3

Prove: If $A$ is NP-complete and $A \in P$, then $P = NP$.

<details>
<summary>Solution</summary>

Let $L$ be any language in NP. Since $A$ is NP-complete, $L \leq_P A$. Since $A \in P$ and $L \leq_P A$, by the key property of reductions, $L \in P$. Since $L$ was arbitrary, $NP \subseteq P$. We already know $P \subseteq NP$, so $P = NP$.
</details>

### Exercise 4

Design a reduction showing MAX-2SAT is NP-hard.

**MAX-2SAT:** Given a 2-CNF formula with $m$ clauses and integer $k$, can at least $k$ clauses be simultaneously satisfied?

<details>
<summary>Hint</summary>

Reduce from 3SAT. Convert each 3-literal clause to a set of 2-literal clauses such that: if the clause is satisfiable, all auxiliary 2-clauses are satisfiable; if not, some fixed number fewer are satisfiable. Set $k$ accordingly.
</details>

### Exercise 5

Explain why the following does NOT prove that PRIMALITY (testing if a number is prime) is NP-hard:

"Every NP-complete problem can be encoded as a number. That number might be prime."

<details>
<summary>Solution</summary>

This is nonsensical as a reduction. A valid reduction must systematically transform ANY instance of an NP-complete problem into a PRIMALITY instance, preserving YES/NO answers, in polynomial time. Random encoding doesn't create a meaningful correspondence between satisfiability and primality. (Also, PRIMALITY is actually in P — AKS primality test — so it cannot be NP-hard unless P = NP.)
</details>

---

## What's Next?

We move beyond time complexity to explore **space complexity** — how much memory a computation requires, and the fascinating relationships between space-bounded and time-bounded computation.
