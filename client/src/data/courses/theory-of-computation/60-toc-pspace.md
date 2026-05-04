---
title: PSPACE-Completeness
---

# PSPACE-Completeness

PSPACE-complete problems are the **hardest problems solvable in polynomial space**. They capture the essence of problems involving exhaustive search, game-playing, and alternating quantification. In this lesson, we study the canonical PSPACE-complete problem (TQBF) and explore its fascinating connections to games and logic.

---

## PSPACE-Completeness: Definition

### PSPACE-Hard

A language $L$ is **PSPACE-hard** if:

$$\forall A \in PSPACE: A \leq_P L$$

Every problem in PSPACE can be polynomial-time reduced to $L$.

### PSPACE-Complete

A language $L$ is **PSPACE-complete** if:

1. $L \in PSPACE$
2. $L$ is PSPACE-hard

PSPACE-complete problems are the "hardest" problems in PSPACE — just as NP-complete problems are the hardest in NP.

---

### Relationship to NP-Completeness

Since $NP \subseteq PSPACE$:
- Every NP-hard problem that's in PSPACE is a candidate for PSPACE-completeness
- But PSPACE-complete problems are believed to be **harder** than NP-complete ones
- PSPACE-complete problems likely have no short certificates (they're probably not in NP)

---

## TQBF: The Canonical PSPACE-Complete Problem

### Quantified Boolean Formulas

A **Quantified Boolean Formula (QBF)** is a Boolean formula where every variable is bound by a quantifier:

$$\psi = Q_1 x_1 \; Q_2 x_2 \; \cdots \; Q_n x_n \; \phi(x_1, x_2, \ldots, x_n)$$

where:
- Each $Q_i \in \{\forall, \exists\}$
- $\phi$ is a Boolean formula (the "matrix")
- The formula is **fully quantified** (no free variables)

### Examples

$$\exists x_1 \; \forall x_2 \; (x_1 \lor x_2)$$

Is this true? Yes! Set $x_1 = T$. Then for any $x_2$: $(T \lor x_2) = T$. ✓

$$\forall x_1 \; \exists x_2 \; (x_1 \oplus x_2)$$

Is this true? Yes! For any $x_1$, set $x_2 = \neg x_1$. Then $x_1 \oplus x_2 = x_1 \oplus \neg x_1 = T$. ✓

$$\forall x_1 \; \forall x_2 \; (x_1 \lor x_2)$$

Is this true? No! Setting $x_1 = F, x_2 = F$ gives $(F \lor F) = F$. ✗

---

### The TQBF Problem

**TQBF** (True Quantified Boolean Formulas):
- **Input:** A fully quantified Boolean formula $\psi$
- **Question:** Is $\psi$ TRUE?

---

### TQBF is PSPACE-Complete

> **Theorem:** TQBF is PSPACE-complete.

We prove both parts.

---

### Part 1: TQBF ∈ PSPACE

**Algorithm:** Recursively evaluate the formula.

```
EVAL(ψ):
  if ψ has no quantifiers:
    return evaluate ψ directly (it's a constant T or F)
  
  if ψ = ∃x φ(x, ...):
    return EVAL(φ[x←T]) OR EVAL(φ[x←F])
  
  if ψ = ∀x φ(x, ...):
    return EVAL(φ[x←T]) AND EVAL(φ[x←F])
```

**Space analysis:**
- Recursion depth: $n$ (one level per variable)
- Each level stores: current variable assignment + constant bookkeeping = $O(1)$ per level
- Evaluating $\phi$ once all variables are assigned: $O(n)$ to scan the formula
- **Crucially:** we reuse space between the two recursive calls (evaluate one, then the other)

Total space: $O(n)$ (one bit per variable + formula size). This is polynomial. ✓

---

### Part 2: TQBF is PSPACE-Hard

**Goal:** Show $\forall A \in PSPACE: A \leq_P \text{TQBF}$.

**Proof sketch:** Let $A \in PSPACE$, decided by a DTM $M$ using $n^k$ space. We encode the computation of $M$ as a QBF.

**Key idea:** The acceptance question is: "Is the accepting configuration reachable from the start configuration?"

This is a reachability problem on the configuration graph. We encode it using **quantified formulas** with a divide-and-conquer approach (similar to Savitch's theorem).

---

#### The Encoding

Let $c_0$ = start configuration, $c_f$ = accepting configuration.

Define: $\text{REACH}(c_1, c_2, t)$ = "Is $c_2$ reachable from $c_1$ in $\leq t$ steps?"

**Base case ($t = 1$):**

$$\text{REACH}(c_1, c_2, 1) = (c_1 = c_2) \lor (c_1 \vdash c_2)$$

This is expressible as a polynomial-size formula (checking one-step transition).

**Recursive case:**

Naively: $\text{REACH}(c_1, c_2, t) = \exists c_m \; [\text{REACH}(c_1, c_m, t/2) \land \text{REACH}(c_m, c_2, t/2)]$

**Problem:** This doubles the formula size at each level! With $O(n^k)$ levels, we get exponential size.

**Fix using universal quantifier:**

$$\text{REACH}(c_1, c_2, t) = \exists c_m \; \forall (d_1, d_2) \in \{(c_1, c_m), (c_m, c_2)\}: \text{REACH}(d_1, d_2, t/2)$$

The $\forall$ quantifier eliminates duplication! Instead of writing the recursive formula twice, we write it once with a universally quantified "which half."

More precisely:

$$\text{REACH}(c_1, c_2, t) = \exists c_m \; \forall d_1, d_2: \left[(d_1, d_2) = (c_1, c_m) \lor (d_1, d_2) = (c_m, c_2)\right] \implies \text{REACH}(d_1, d_2, t/2)$$

**Size analysis:** Each level adds $O(n^k)$ symbols (for the new variables and the check). With $O(n^k)$ levels (since $t = 2^{O(n^k)}$ and we halve each time, giving $O(n^k)$ levels):

Total formula size: $O(n^k) \times O(n^k) = O(n^{2k})$. Polynomial! ✓

**Correctness:** $M$ accepts $w$ $\iff$ $c_f$ is reachable from $c_0$ $\iff$ the constructed QBF is TRUE.

Therefore $A \leq_P \text{TQBF}$. ∎

---

## Why TQBF is Harder Than SAT

| Feature | SAT | TQBF |
|---------|-----|------|
| Quantifiers | Only $\exists$ (implicit) | Both $\exists$ and $\forall$ |
| Certificate | Short (polynomial) | None known |
| Complexity | NP-complete | PSPACE-complete |
| Nature | "Find a solution" | "Win a game" |

### The Game Interpretation

TQBF can be viewed as a **two-player game**:

$$\exists x_1 \; \forall x_2 \; \exists x_3 \; \forall x_4 \; \phi(x_1, x_2, x_3, x_4)$$

- **Player E** (Existential) chooses values for $\exists$-variables
- **Player A** (Universal/Adversary) chooses values for $\forall$-variables
- Player E wins if $\phi$ evaluates to TRUE

The formula is TRUE iff Player E has a **winning strategy** — regardless of what Player A does.

This game-theoretic nature is why TQBF captures problems about strategies, planning, and games.

---

### SAT as a Special Case

SAT is just TQBF restricted to **only existential quantifiers**:

$$\text{SAT} \equiv \exists x_1 \; \exists x_2 \; \cdots \; \exists x_n \; \phi(x_1, \ldots, x_n)$$

The universal quantifiers are what make TQBF harder — they add an adversarial dimension.

---

## Generalized Geography

### The Game

**Geography** (the word game): Players take turns naming a city. Each city must start with the last letter of the previous city. No repeats. The player who cannot move loses.

**Generalized Geography** (graph version):
- **Input:** Directed graph $G = (V, E)$, starting vertex $v_0$
- **Rules:** Two players alternate. Each player must follow an edge to an unvisited vertex. A player who cannot move **loses**.
- **Question:** Does Player 1 have a winning strategy?

---

### Generalized Geography is PSPACE-Complete

> **Theorem:** Generalized Geography is PSPACE-complete.

**Generalized Geography ∈ PSPACE:**

Use recursive evaluation (like minimax):

```
WIN(G, v, visited):
  for each neighbor u of v not in visited:
    if NOT WIN(G, u, visited ∪ {v}):
      return TRUE   // we can force opponent to lose
  return FALSE      // all moves lead to opponent winning
```

Space: $O(n)$ for the visited set + recursion depth $O(n)$ × $O(n)$ per level = $O(n^2)$. ✓

**Generalized Geography is PSPACE-hard:**

Reduction from TQBF. The alternation of quantifiers maps to alternation of players:
- $\exists$ variables → Player 1's moves (choices)
- $\forall$ variables → Player 2's moves (adversary)

The graph structure ensures:
- Player 1 wins $\iff$ the QBF is TRUE
- The formula's quantifier structure matches the game tree exactly

---

## Other PSPACE-Complete Problems

### Generalized Board Games

Many games become PSPACE-complete (or harder) when generalized to $n \times n$ boards:

| Game | Board | Complexity |
|------|-------|------------|
| Checkers | $n \times n$ | EXPTIME-complete |
| Chess | $n \times n$ | EXPTIME-complete |
| Go | $n \times n$ | EXPTIME-complete |
| Hex | $n \times n$ | PSPACE-complete |
| Othello/Reversi | $n \times n$ | PSPACE-complete |
| Generalized Geography | arbitrary graph | PSPACE-complete |

The common theme: **two-player games with perfect information** where positions don't repeat (polynomial-length games → PSPACE; exponential-length → EXPTIME).

---

### Regular Expressions with Complement

**Problem:** Given two regular expressions $r_1, r_2$ (with union, concatenation, star, AND complement $\overline{\cdot}$), is $L(r_1) = L(r_2)$?

Without complement: equivalence is in PSPACE (and likely not PSPACE-hard).

**With complement:** PSPACE-complete!

The complement operator allows encoding of universal quantification, giving the same expressive power as TQBF.

---

### Sticker Systems

**Sticker systems** are a model of DNA computing:

- Start with a set of "stickers" (partial double-stranded DNA)
- Combine stickers according to Watson-Crick complementarity
- Question: can a target string be produced?

The reachability question for sticker systems is PSPACE-complete.

---

### Planning Problems

**PLANSAT** (Planning Satisfiability):
- Given initial state, goal state, and a set of actions (with preconditions and effects)
- Is there a sequence of actions reaching the goal?

This is PSPACE-complete when the state space is exponential but described compactly (propositional STRIPS planning).

---

## PSPACE vs NP: The Relationship

We know:

$$NP \subseteq PSPACE$$

The key differences (believed but unproven):

| Property | NP-complete | PSPACE-complete |
|----------|-------------|-----------------|
| Short certificate? | YES (polynomial) | Probably NO |
| Verifiable quickly? | YES | Probably NO |
| Nature | "Find a solution" | "Win against all strategies" |
| Quantifier pattern | $\exists$ only | $\exists$ and $\forall$ alternating |

---

### If PSPACE = NP...

If $PSPACE = NP$, then:
- PSPACE-complete problems would be NP-complete
- Every PSPACE-complete problem would have polynomial certificates
- TQBF would be in NP (short proofs for game strategies!)

Most researchers believe $NP \subsetneq PSPACE$, but this is **unproven**.

---

### If P = PSPACE...

If $P = PSPACE$, then:
- All games could be solved efficiently
- TQBF would be in P
- Since $NP \subseteq PSPACE = P$: we'd also get $P = NP$!

So $P = PSPACE$ is an even stronger statement than $P = NP$.

---

## The Complete Picture

```
┌─────────────────────────────────────────┐
│  PSPACE                                 │
│  ┌───────────────────────────────────┐  │
│  │  NP                               │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  P                          │  │  │
│  │  │                             │  │  │
│  │  │  Sorting, Shortest Path     │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                    │  │
│  │  SAT, CLIQUE, TSP                  │  │
│  │  (NP-complete)                     │  │
│  └───────────────────────────────────┘  │
│                                          │
│  TQBF, Gen. Geography, Hex              │
│  (PSPACE-complete)                       │
└─────────────────────────────────────────┘
```

(Assuming $P \neq NP \neq PSPACE$ — the believed picture)

---

## Proving PSPACE-Completeness

### Template

To prove $L$ is PSPACE-complete:

1. **Show $L \in PSPACE$:** Give a polynomial-space algorithm
2. **Show TQBF $\leq_P L$** (or reduce any known PSPACE-complete problem to $L$)

### Common Reduction Strategy

For game/planning problems:
- $\exists$ quantifiers → Player 1 / system choices
- $\forall$ quantifiers → Player 2 / adversary / environment
- Matrix $\phi$ → win condition / goal state

---

## PSPACE-Completeness of Specific QBF Variants

### QBF-SAT (with CNF matrix)

Even when the matrix $\phi$ is in CNF, TQBF remains PSPACE-complete.

### QBF-3CNF

When restricted to 3-CNF matrix: still PSPACE-complete (by the same clause-splitting technique as SAT → 3SAT, preserving quantifiers).

### Restricted Quantifier Patterns

| Pattern | Class |
|---------|-------|
| $\exists \cdots \exists \; \phi$ | NP-complete (= SAT) |
| $\forall \cdots \forall \; \phi$ | co-NP-complete |
| $\exists \forall \; \phi$ | $\Sigma_2^P$-complete |
| $\forall \exists \; \phi$ | $\Pi_2^P$-complete |
| Unrestricted | PSPACE-complete |

This connects to the **polynomial hierarchy** ($PH$), which sits between NP and PSPACE.

---

## Summary

| Concept | Details |
|---------|---------|
| PSPACE-hard | Every PSPACE problem reduces to it |
| PSPACE-complete | PSPACE-hard + in PSPACE |
| TQBF | Canonical PSPACE-complete problem |
| Games → PSPACE | Alternating turns = alternating quantifiers |
| TQBF ∈ PSPACE | Recursive evaluation, reuse space |
| TQBF is PSPACE-hard | Encode computation as QBF using $\forall$ to avoid blowup |
| NP vs PSPACE | $\exists$ only vs $\exists\forall$ alternation |

---

## Key Insights

1. **TQBF is to PSPACE what SAT is to NP** — the canonical complete problem
2. **Games and planning** naturally live in PSPACE because of alternating choices
3. **Universal quantifiers** are the key difference — they prevent short certificates
4. **Savitch's theorem** makes PSPACE robust: $PSPACE = NPSPACE$
5. **The separation P ≠ PSPACE** is open, but implications of equality would be dramatic

---

## Exercises

### Exercise 1: Evaluate a QBF

Determine whether the following QBF is TRUE or FALSE:

$$\forall x \; \exists y \; [(x \lor y) \land (\neg x \lor \neg y)]$$

<details>
<summary>Solution</summary>

We need: for ALL $x$, there EXISTS $y$ such that $(x \lor y) \land (\neg x \lor \neg y)$.

**Case $x = T$:** Need $y$ such that $(T \lor y) \land (F \lor \neg y) = T \land \neg y$. Set $y = F$: $T \land T = T$. ✓

**Case $x = F$:** Need $y$ such that $(F \lor y) \land (T \lor \neg y) = y \land T = y$. Set $y = T$: $T$. ✓

Both cases work, so the QBF is **TRUE**.

Note: $(x \lor y) \land (\neg x \lor \neg y)$ is equivalent to $x \oplus y$ (XOR). The formula says: for any $x$, there exists $y$ with $x \neq y$. This is clearly true (set $y = \neg x$).
</details>

### Exercise 2: SAT vs TQBF

Convert the SAT instance $\phi = (x_1 \lor \neg x_2) \land (x_2 \lor x_3)$ to an equivalent TQBF instance.

<details>
<summary>Solution</summary>

SAT asks "is there a satisfying assignment?" This is:

$$\exists x_1 \; \exists x_2 \; \exists x_3 \; [(x_1 \lor \neg x_2) \land (x_2 \lor x_3)]$$

This is a TQBF instance with only existential quantifiers. TQBF is TRUE iff the SAT instance is satisfiable.
</details>

### Exercise 3: Game Tree Depth

In Generalized Geography on a graph with $n$ vertices, what is the maximum depth of the game tree?

<details>
<summary>Solution</summary>

Each move visits a new vertex (no revisits allowed). So the game lasts at most $n$ turns. The game tree has depth at most $n$.

Since each node has at most $n$ children (possible moves), the game tree has at most $n^n$ nodes — exponential. But we only need polynomial SPACE to explore it (depth-first, reusing space at each level): $O(n)$ for the visited set × $O(n)$ recursion depth = $O(n^2)$ space.
</details>

### Exercise 4: PSPACE Closure

Prove that PSPACE is closed under complement (i.e., if $L \in PSPACE$ then $\bar{L} \in PSPACE$).

<details>
<summary>Solution</summary>

If $L \in PSPACE$, there's a TM $M$ deciding $L$ using $n^k$ space. Construct $M'$ that:
1. Simulates $M$
2. Flips the answer (accept ↔ reject)

$M'$ uses the same $n^k$ space and decides $\bar{L}$. So $\bar{L} \in PSPACE$.

This is straightforward because PSPACE uses **deterministic** machines (or equivalently, by Savitch's theorem, nondeterministic machines with only quadratic overhead). Complement is easy for deterministic computation.

Note: This is why there's no "co-PSPACE ≠ PSPACE" question — they're trivially equal for deterministic classes.
</details>

### Exercise 5: Geography Instance

Consider the directed graph:

```
A → B → C → D
↑           |
└───────────┘
```

Player 1 starts at A. Does Player 1 have a winning strategy?

<details>
<summary>Solution</summary>

The game plays on the path A → B → C → D → A → ..., but we can't revisit!

- Move 1 (Player 1): A → B (only option)
- Move 2 (Player 2): B → C (only option)
- Move 3 (Player 1): C → D (only option)
- Move 4 (Player 2): D → A... but A is already visited! Player 2 cannot move.

Player 2 loses. **Player 1 wins.**

In this simple linear graph, the player who moves last wins. With 4 edges and alternating turns, Player 1 makes moves 1 and 3, Player 2 makes moves 2 and 4. Player 2 is stuck on move 4.
</details>

### Exercise 6: Polynomial Hierarchy Connection

If TQBF $\in NP$, what would this imply about the polynomial hierarchy?

<details>
<summary>Solution</summary>

If TQBF $\in NP$, then since TQBF is PSPACE-complete, we'd have $PSPACE = NP$ (every PSPACE problem reduces to TQBF, and if TQBF is in NP, so is everything in PSPACE).

Since the polynomial hierarchy $PH \subseteq PSPACE$, this would give $PH \subseteq NP = \Sigma_1^P$, meaning the polynomial hierarchy collapses to its first level.

This is considered very unlikely, providing evidence that TQBF $\notin NP$ and hence $PSPACE \neq NP$.
</details>

---

## Conclusion

PSPACE-completeness captures the complexity of problems with **adversarial reasoning** — games, planning against opponents, and alternating quantification. TQBF stands as the canonical example, with the Cook-Levin-style proof showing that any polynomial-space computation can be encoded as a quantified formula.

The interplay between $P$, $NP$, and $PSPACE$ remains one of the deepest mysteries in mathematics and computer science. While we strongly believe these classes are all different, proving even $NP \neq PSPACE$ remains beyond current techniques.

---

## What's Next?

In upcoming lessons, we'll explore additional topics in complexity theory including the polynomial hierarchy, randomized complexity classes, and interactive proof systems.
