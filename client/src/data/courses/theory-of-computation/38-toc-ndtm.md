---
title: Nondeterministic Turing Machines
---

# Nondeterministic Turing Machines

In this lesson, you will learn about **Nondeterministic Turing Machines (NTMs)** — machines that can explore multiple computation paths simultaneously — and why they are equivalent in power to deterministic TMs.

---

## Motivation

Recall that **nondeterministic finite automata (NFAs)** can be in multiple states at once, and they accept if ANY path leads to an accept state.

What happens if we give the same "nondeterministic power" to a Turing Machine?

> Does a nondeterministic TM recognize more languages than a deterministic TM?

**Spoiler:** No! But the simulation is much more expensive than the NFA→DFA conversion.

---

## Definition

A **Nondeterministic Turing Machine (NTM)** is defined exactly like a standard TM, except the transition function maps to a **set** of possible moves:

$$
\delta: Q \times \Gamma \to \mathcal{P}(Q \times \Gamma \times \{L, R\})
$$

Here $\mathcal{P}(\cdot)$ denotes the **power set** (set of all subsets).

### What This Means

At each step, the NTM has **multiple possible transitions** available. For a given state $q$ and tape symbol $a$:

$$
\delta(q, a) = \{(q_1, b_1, D_1),\ (q_2, b_2, D_2),\ \ldots,\ (q_m, b_m, D_m)\}
$$

The machine can "choose" any one of these transitions to follow.

### Branching Factor

The **maximum branching factor** is:

$$
b = \max_{q \in Q,\ a \in \Gamma} |\delta(q, a)|
$$

This is the maximum number of choices at any step.

---

## The Computation Tree

An NTM's execution on input $w$ can be visualized as a **tree**:

- **Root:** Initial configuration $(q_0, w, \text{head at 0})$
- **Children of each node:** All configurations reachable by one nondeterministic step
- **Branching factor:** At most $b$ children per node
- **Depth:** Number of steps taken along a path

$$
\text{Level 0: } \quad \quad \quad \quad C_0 \\
$$

$$
\text{Level 1: } \quad C_1 \quad C_2 \quad C_3 \\
$$

$$
\text{Level 2: } \quad C_4\ C_5 \quad C_6\ C_7 \quad C_8 \\
$$

Each path from root to leaf represents one possible computation.

---

## Acceptance Condition

> **An NTM accepts input $w$ if and only if THERE EXISTS at least one accepting computation path.**

Formally:

$$
M \text{ accepts } w \iff \exists \text{ a path in the computation tree that reaches } q_{accept}
$$

This is an **existential** condition — even if most paths reject or loop forever, a single accepting path suffices.

### Rejection

An NTM **rejects** $w$ if **every** path in the computation tree either:

- Reaches $q_{reject}$, or
- Halts without accepting

If some paths loop forever and no path accepts, the NTM **does not halt** (it neither accepts nor rejects in finite time).

---

## NTM as a "Guessing" Machine

A useful intuition for NTMs:

> **Phase 1 (Guess):** Nondeterministically write down a "candidate solution" on the tape.
>
> **Phase 2 (Verify):** Deterministically check if the candidate is correct.

The NTM accepts if there EXISTS a correct guess.

This "guess and verify" paradigm is fundamental to complexity theory!

---

## Example 1: NTM for Composite Numbers

**Language:** $\text{COMPOSITES} = \{x \mid x \text{ is a composite number (not prime)}\}$

**NTM Algorithm:**

1. **Guess** a factor $f$ where $1 < f < x$ (nondeterministically write $f$ on tape 2)
2. **Verify** that $f$ divides $x$ (deterministic long division)
3. If $f$ divides $x$ → **accept**
4. If not → **reject** (on this path)

**Why it works:**

- If $x$ is composite, there EXISTS a factor $f$, so some path accepts
- If $x$ is prime, NO factor exists, so all paths reject
- The NTM correctly decides COMPOSITES!

**Guessing step:** The NTM nondeterministically writes each digit of $f$. At each position, it branches into choices $\{0, 1, 2, \ldots, 9\}$.

---

## Example 2: NTM for Hamiltonian Path

**Language:** $\text{HAMPATH} = \{\langle G, s, t \rangle \mid G \text{ has a Hamiltonian path from } s \text{ to } t\}$

A **Hamiltonian path** visits every vertex exactly once.

**NTM Algorithm:**

1. Let $n = |V|$ (number of vertices in $G$)
2. **Guess** a sequence of $n$ vertices: $v_1, v_2, \ldots, v_n$
3. **Verify:**
   - Check $v_1 = s$ and $v_n = t$
   - Check each $(v_i, v_{i+1})$ is an edge in $G$
   - Check all $v_i$ are distinct (no vertex repeated)
4. If all checks pass → **accept**; otherwise → **reject**

**Complexity:**

- Guessing takes $O(n)$ nondeterministic steps
- Verification takes $O(n^2)$ deterministic steps
- Total NTM time: $O(n^2)$

But no one knows how to solve this **deterministically** in polynomial time! (This is the P vs NP question.)

---

## Equivalence Theorem

**Theorem:** Every NTM has an equivalent DTM. That is, nondeterministic TMs recognize exactly the same class of languages as deterministic TMs.

$$
\text{NTM-recognizable} = \text{TM-recognizable (recursively enumerable)}
$$

### Proof: Simulating NTM with a 3-Tape DTM

We construct a deterministic 3-tape TM $D$ that simulates NTM $N$:

**Tape 1:** Input tape (never modified)

**Tape 2:** Simulation tape (working copy of $N$'s tape for current path)

**Tape 3:** Address tape (encodes which path in the computation tree we're currently exploring)

### The Address System

Each node in the computation tree is identified by a **sequence of choices**:

$$
\text{Address} = d_1 d_2 d_3 \ldots d_m \quad \text{where each } d_i \in \{1, 2, \ldots, b\}
$$

- $d_1$: which choice at step 1
- $d_2$: which choice at step 2
- And so on...

Example with $b = 3$:

- Address "1" = take choice 1 at step 1
- Address "132" = choice 1, then 3, then 2
- Address "21" = choice 2, then choice 1

### BFS Through the Tree

**Critical design choice:** We explore the tree in **breadth-first order**, NOT depth-first!

**Why not DFS?** If one branch leads to an infinite loop, DFS would get stuck and never explore the other branches — even if an accepting path exists on a different branch!

**BFS guarantees:** If ANY finite accepting path exists, we will find it.

### The Simulation Algorithm

```
D = "On input w:
  1. Copy w onto tape 1 (keep it unchanged)
  2. For length = 0, 1, 2, 3, ...:
     For each address of that length:
       a. Write the address on tape 3
       b. Copy tape 1 to tape 2
       c. Simulate N on tape 2, using tape 3
          to determine which choice to make at each step
       d. If simulation reaches q_accept → ACCEPT
       e. If simulation reaches q_reject or
          tape 3 runs out of choices → go to next address
  3. If all addresses of this length are exhausted,
     increment length and repeat"
```

### Step (c) in Detail

At each step $i$ of the simulation:

1. Look at digit $d_i$ on tape 3
2. Count the available transitions in $\delta(q, a)$ where $q$ is current state, $a$ is current symbol
3. If $d_i$ exceeds the number of available choices → this address is **invalid**, skip to next
4. Otherwise, take the $d_i$-th transition

### Correctness

- If $N$ accepts $w$, there exists an accepting path of some finite length $m$
- BFS will eventually enumerate the address corresponding to this path
- When it does, the simulation reaches $q_{accept}$, and $D$ accepts

- If $N$ does not accept $w$, no address leads to acceptance
- $D$ runs forever (recognizer, not decider — matching $N$'s behavior)

---

## Time Complexity of the Simulation

If the NTM $N$ runs in time $t(n)$ (meaning the longest accepting path has length at most $t(n)$):

- The computation tree has depth at most $t(n)$
- At each level, there are at most $b^{\text{level}}$ nodes
- Total nodes explored up to depth $t(n)$:

$$
\sum_{i=0}^{t(n)} b^i = \frac{b^{t(n)+1} - 1}{b - 1} = O(b^{t(n)})
$$

- Simulating each path takes $O(t(n))$ steps

**Total DTM time:**

$$
\boxed{O(t(n) \cdot b^{t(n)})}
$$

This is an **exponential blowup**!

### Contrast with NFA → DFA

| Conversion | State blowup | Time blowup |
|-----------|:------------:|:------------:|
| NFA → DFA | $2^n$ states | Same time |
| NTM → DTM | — | $O(b^{t(n)})$ exponential |

The NFA→DFA conversion gives at most exponentially more **states** but the DFA runs in the **same time** $O(n)$. The NTM→DTM conversion results in exponentially more **time**.

---

## The Big Question: Can We Do Better?

> Can every NTM running in polynomial time $n^k$ be simulated by a DTM also running in polynomial time?

This is equivalent to asking:

$$
\boxed{\text{P} = \text{NP} \ ?}
$$

- **P** = languages decidable by a DTM in polynomial time
- **NP** = languages decidable by an NTM in polynomial time

This is the most famous open problem in computer science!

The best known simulation gives exponential time. No one has proved that polynomial is impossible, and no one has achieved it.

---

## NTM for Decidability vs. Recognizability

### Decider NTMs

An NTM is a **decider** if every branch halts (either accepts or rejects):

- **Accepts** if at least one branch accepts
- **Rejects** if ALL branches reject

A language is **decidable** iff it has a decider NTM iff it has a decider DTM.

### Recognizer NTMs

An NTM is a **recognizer** if:

- **Accepts** if at least one branch accepts
- May loop on some/all branches if no accepting path exists

$$
\text{NTM-decidable} = \text{DTM-decidable (recursive)}
$$

$$
\text{NTM-recognizable} = \text{DTM-recognizable (r.e.)}
$$

---

## Formal Definitions of NP

Using NTMs, we can formally define:

$$
\text{NP} = \{L \mid \exists \text{ NTM } N \text{ that decides } L \text{ in polynomial time}\}
$$

Equivalently (verifier definition):

$$
\text{NP} = \{L \mid \exists \text{ polynomial-time DTM } V \text{ such that } x \in L \iff \exists c.\ V(x, c) \text{ accepts}\}
$$

Here $c$ is the "certificate" (the nondeterministic guess).

---

## Common Misconceptions

### Misconception 1: "NTM = parallel computation"

While it's tempting to think of NTMs as trying all paths simultaneously, this isn't quite accurate. An NTM is a mathematical model, not a physical machine. It accepts if a path EXISTS — it doesn't literally run in parallel.

### Misconception 2: "NTMs are more powerful"

NTMs recognize the **same** languages as DTMs. They are not "more powerful" in the computability sense. They may be faster (NP vs P), but they don't compute more.

### Misconception 3: "NTM always takes the right choice"

The NTM doesn't "know" which choice is right. It's defined by what happens across ALL possible choices. Acceptance is existential: some path works.

---

## Example 3: NTM for Graph 3-Coloring

**Language:** $\text{3-COLOR} = \{\langle G \rangle \mid G \text{ is 3-colorable}\}$

A graph is 3-colorable if we can assign each vertex a color from $\{1, 2, 3\}$ such that no two adjacent vertices share the same color.

**NTM Algorithm:**

1. **Guess:** For each vertex $v_i$, nondeterministically assign a color $c_i \in \{1, 2, 3\}$
2. **Verify:** For each edge $(v_i, v_j) \in E$:
   - Check that $c_i \neq c_j$
3. If all edges satisfy the constraint → **accept**
4. If any edge is violated → **reject**

**Analysis:**

- Guessing: $O(n)$ steps (one choice per vertex, $b = 3$)
- Verification: $O(m)$ steps where $m = |E|$ (check each edge)
- Total NTM time: $O(n + m)$

No polynomial-time DTM is known for this problem (it's NP-complete).

---

## Example 4: NTM for Satisfiability (SAT)

**Language:** $\text{SAT} = \{\langle \phi \rangle \mid \phi \text{ is a satisfiable Boolean formula}\}$

**NTM Algorithm:**

1. Let $\phi$ have variables $x_1, x_2, \ldots, x_n$
2. **Guess:** Nondeterministically assign each $x_i \in \{\text{True}, \text{False}\}$
3. **Verify:** Evaluate $\phi$ under this assignment
4. If $\phi = \text{True}$ → **accept**; otherwise → **reject**

$$
\text{NTM time: } O(n + |\phi|)
$$

SAT is the canonical NP-complete problem (Cook-Levin theorem).

---

## Detailed BFS Simulation Walkthrough

Let's trace through the DTM simulation for a simple NTM.

**NTM $N$:** On input $w$:

- State $q_0$: $\delta(q_0, a) = \{(q_1, a, R), (q_2, b, R)\}$ (branch factor 2)
- State $q_1$: $\delta(q_1, \sqcup) = \{(q_{acc}, \sqcup, S)\}$ (accept)
- State $q_2$: $\delta(q_2, a) = \{(q_2, a, R)\}$ (loop on non-blank)

**Input:** $w = a$

**Computation tree:**

```
              (q₀, a, pos 0)
              /             \
   Choice 1 /               \ Choice 2
            /                 \
  (q₁, a, pos 1)      (q₂, ba, pos 1)
       |                      |
  (q_acc) ✓             (q₂, ba, pos 2)
                              |
                         loops forever...
```

**BFS simulation by DTM $D$:**

| Length | Address | Result |
|--------|---------|--------|
| 0 | (empty) | Initial config only — no accept yet |
| 1 | "1" | Take choice 1 → reach $q_1$ |
| 1 | "2" | Take choice 2 → reach $q_2$ |
| 2 | "11" | From $q_1$, take choice 1 → $q_{acc}$ → **ACCEPT!** |

BFS finds the accepting path at depth 2 without getting stuck in the infinite branch!

---

## Try It Yourself

### Exercise 1: NTM Design

Design an NTM for the language:

$$
\text{SUBSET-SUM} = \{\langle S, t \rangle \mid \exists \text{ subset } A \subseteq S \text{ with } \sum A = t\}
$$

Describe the guessing phase and verification phase.

**Solution sketch:**

- **Guess:** For each element $s_i \in S$, nondeterministically choose "include" or "exclude" ($b = 2$, $n$ choices)
- **Verify:** Sum all included elements; check if sum $= t$
- NTM time: $O(n)$ for guessing + $O(n)$ for summing = $O(n)$

### Exercise 2: Computation Tree

Consider an NTM with branching factor $b = 2$ on input $w$ of length 3. If the NTM halts in at most 4 steps on all paths, how many nodes does the computation tree have at most?

$$
\text{Answer: } 1 + 2 + 4 + 8 + 16 = 2^5 - 1 = 31
$$

### Exercise 3: Simulation Complexity

An NTM with branching factor $b = 3$ decides a language in $O(n^2)$ steps. What is the time complexity of the equivalent DTM?

$$
O(n^2 \cdot 3^{n^2})
$$

### Exercise 4: Why BFS?

Consider an NTM where branch 1 loops forever and branch 2 accepts after 5 steps. Explain why DFS fails and BFS succeeds.

**Answer:** DFS explores branch 1 first and never returns (infinite loop). BFS explores all branches level by level: at depth 5, it finds the accepting path on branch 2 regardless of branch 1's behavior.

### Exercise 5: Equivalence

Prove that if $L$ is decided by an NTM, then $\overline{L}$ (the complement) is also decidable.

*Hint:* You cannot simply swap accept/reject in the NTM! Use the equivalent DTM.

**Proof:** Since $L$ is decided by an NTM, by the equivalence theorem, there exists a DTM $D$ that decides $L$. Construct $D'$ that swaps accept/reject in $D$. Then $D'$ decides $\overline{L}$.

(Swapping accept/reject directly in the NTM doesn't work because NTM acceptance is existential — swapping gives "reject if ANY path rejects" which is wrong.)

### Exercise 6: Verification

Show that $\text{NP}$ can be equivalently defined as:

$$
L \in \text{NP} \iff \exists \text{ polynomial } p \text{ and poly-time DTM } V: x \in L \iff \exists c \in \{0,1\}^{p(|x|)}.\ V(x,c) = 1
$$

Explain the connection between the certificate $c$ and the NTM's nondeterministic choices.

---

## Key Takeaways

$$
\boxed{
\text{NTM} \equiv \text{DTM (same languages, exponential time blowup)}
}
$$

1. NTMs have multiple possible transitions — computation forms a tree
2. NTM accepts if ANY path reaches $q_{accept}$ (existential acceptance)
3. DTM simulates NTM via BFS through the computation tree
4. Simulation cost: $O(t(n) \cdot b^{t(n)})$ — exponential blowup
5. NTMs don't recognize more languages, but may be exponentially faster
6. The "guess and verify" paradigm defines the complexity class NP
7. Whether P = NP is the central open question in computer science

---

## What's Next?

In the next lesson, we'll explore the **Universal Turing Machine** — a single machine capable of simulating ANY other Turing Machine, laying the foundation for modern computers.

---
