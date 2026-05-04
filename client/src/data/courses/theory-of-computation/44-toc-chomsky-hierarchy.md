---
title: The Chomsky Hierarchy
---

# The Chomsky Hierarchy

The **Chomsky hierarchy** classifies formal languages into four nested types based on the generative power of their grammars and the computational power of the automata that recognize them. This lesson provides a comprehensive summary of all four levels and their relationships.

---

## The Big Picture

The hierarchy consists of four types, each strictly containing the one below it:

$$
\text{Type 3} \subsetneq \text{Type 2} \subsetneq \text{Type 1} \subsetneq \text{Type 0}
$$

$$
\text{Regular} \subsetneq \text{Context-Free} \subsetneq \text{Context-Sensitive} \subsetneq \text{Recursively Enumerable}
$$

```
┌───────────────────────────────────────────────────────┐
│  Type 0: Recursively Enumerable (TM)                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Type 1: Context-Sensitive (LBA)                │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Type 2: Context-Free (PDA)              │  │  │
│  │  │  ┌─────────────────────────────────────┐ │  │  │
│  │  │  │  Type 3: Regular (DFA/NFA)          │ │  │  │
│  │  │  └─────────────────────────────────────┘ │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

---

## Type 3 — Regular Languages

### Grammar

**Right-linear grammar:** Every rule has the form:

$$
A \to aB \quad \text{or} \quad A \to a \quad \text{or} \quad A \to \varepsilon
$$

where $A, B \in V$ (variables) and $a \in \Sigma$ (terminal).

Equivalently, **left-linear:** $A \to Ba$ or $A \to a$ or $A \to \varepsilon$.

> **Important:** A grammar is regular only if ALL rules are right-linear (or ALL left-linear). Mixing is not allowed.

### Automaton

- **DFA** (Deterministic Finite Automaton)
- **NFA** (Nondeterministic Finite Automaton)
- **NFA with $\varepsilon$-transitions**

All three are equivalent in power:

$$
\text{DFA} = \text{NFA} = \text{NFA-}\varepsilon = \text{Regular Expressions}
$$

### Closure Properties

| Operation | Closed? |
|-----------|---------|
| Union ($L_1 \cup L_2$) | **Yes** |
| Intersection ($L_1 \cap L_2$) | **Yes** |
| Complement ($\bar{L}$) | **Yes** |
| Concatenation ($L_1 \cdot L_2$) | **Yes** |
| Kleene star ($L^*$) | **Yes** |
| Difference ($L_1 \setminus L_2$) | **Yes** |
| Reversal ($L^R$) | **Yes** |
| Homomorphism | **Yes** |
| Inverse homomorphism | **Yes** |

> Regular languages are closed under ALL standard operations. This makes them extremely well-behaved.

### Decision Problems

| Problem | Decidable? | Complexity |
|---------|-----------|------------|
| Membership ($w \in L$?) | **Yes** | $O(n)$ — simulate DFA |
| Emptiness ($L = \emptyset$?) | **Yes** | $O(|Q|)$ — reachability |
| Finiteness ($|L| < \infty$?) | **Yes** | $O(|Q|)$ — cycle detection |
| Equivalence ($L_1 = L_2$?) | **Yes** | $O(n \log n)$ — minimization |
| Containment ($L_1 \subseteq L_2$?) | **Yes** | Reduce to emptiness |
| Universality ($L = \Sigma^*$?) | **Yes** | Complement + emptiness |

**All properties of regular languages are decidable!**

### Pumping Lemma

For any regular language $L$, there exists $p \geq 1$ such that any $s \in L$ with $|s| \geq p$ can be written as:

$$
s = xyz
$$

where:
1. $|y| > 0$
2. $|xy| \leq p$
3. $xy^i z \in L$ for all $i \geq 0$

---

## Type 2 — Context-Free Languages

### Grammar

**Context-free grammar (CFG):** Every rule has the form:

$$
A \to \alpha
$$

where $A \in V$ and $\alpha \in (V \cup \Sigma)^*$.

The left side is always a **single variable** — no context around it.

### Normal Forms

- **Chomsky Normal Form (CNF):** Every rule is $A \to BC$ or $A \to a$ (or $S \to \varepsilon$)
- **Greibach Normal Form (GNF):** Every rule is $A \to a\alpha$ where $\alpha \in V^*$

### Automaton

- **PDA** (Pushdown Automaton) — nondeterministic
- **DPDA** (Deterministic PDA) — strictly weaker

$$
\text{DPDA} \subsetneq \text{NPDA}
$$

Nondeterminism genuinely adds power for context-free languages.

### Closure Properties

| Operation | Closed? |
|-----------|---------|
| Union ($L_1 \cup L_2$) | **Yes** |
| Concatenation ($L_1 \cdot L_2$) | **Yes** |
| Kleene star ($L^*$) | **Yes** |
| Intersection ($L_1 \cap L_2$) | **No** |
| Complement ($\bar{L}$) | **No** |
| Difference ($L_1 \setminus L_2$) | **No** |
| Intersection with regular | **Yes** |

> **Key fact:** CFLs are NOT closed under intersection or complement. This is a major source of undecidability at this level.

### Counter-example for Intersection

$$
L_1 = \{a^n b^n c^m \mid n, m \geq 0\} \quad (\text{CFL})
$$
$$
L_2 = \{a^m b^n c^n \mid n, m \geq 0\} \quad (\text{CFL})
$$
$$
L_1 \cap L_2 = \{a^n b^n c^n \mid n \geq 0\} \quad (\text{NOT CFL!})
$$

### Decision Problems

| Problem | Decidable? | Complexity |
|---------|-----------|------------|
| Membership ($w \in L$?) | **Yes** | $O(n^3)$ — CYK algorithm |
| Emptiness ($L = \emptyset$?) | **Yes** | $O(|G|)$ — generating symbols |
| Finiteness ($|L| < \infty$?) | **Yes** | Cycle detection in CNF |
| Equivalence ($L_1 = L_2$?) | **No** | Undecidable! |
| Containment ($L_1 \subseteq L_2$?) | **No** | Undecidable! |
| Universality ($L = \Sigma^*$?) | **No** | Undecidable! |
| Ambiguity | **No** | Undecidable! |

### Pumping Lemma

For any CFL $L$, there exists $p \geq 1$ such that any $s \in L$ with $|s| \geq p$ can be written as:

$$
s = uvxyz
$$

where:
1. $|vy| > 0$
2. $|vxy| \leq p$
3. $uv^i xy^i z \in L$ for all $i \geq 0$

---

## Type 1 — Context-Sensitive Languages

### Grammar

**Context-sensitive grammar (CSG):** Every rule has the form:

$$
\alpha A \beta \to \alpha \gamma \beta
$$

where:
- $A \in V$ (single variable being rewritten)
- $\alpha, \beta \in (V \cup \Sigma)^*$ (context — must be preserved)
- $\gamma \in (V \cup \Sigma)^+$ ($|\gamma| \geq 1$, non-shrinking)

**Equivalent formulation (monotonic):** Any rule $\alpha \to \beta$ where $|\alpha| \leq |\beta|$.

### Automaton

- **LBA** (Linear Bounded Automaton) — nondeterministic TM with tape ≤ input length

### Closure Properties

| Operation | Closed? |
|-----------|---------|
| Union ($L_1 \cup L_2$) | **Yes** |
| Intersection ($L_1 \cap L_2$) | **Yes** |
| Complement ($\bar{L}$) | **Yes** (Immerman–Szelepcsényi) |
| Concatenation ($L_1 \cdot L_2$) | **Yes** |
| Kleene star ($L^*$) | **Yes** |

> **Notable:** CSLs are closed under complement! This was proved by Immerman and Szelepcsényi (1988) and was a major result ($\text{NSPACE}(s) = \text{co-NSPACE}(s)$).

### Decision Problems

| Problem | Decidable? |
|---------|-----------|
| Membership ($w \in L$?) | **Yes** (bounded configurations) |
| Emptiness ($L = \emptyset$?) | **No** |
| Equivalence ($L_1 = L_2$?) | **No** |
| Containment ($L_1 \subseteq L_2$?) | **No** |
| Universality ($L = \Sigma^*$?) | **No** |
| Finiteness ($|L| < \infty$?) | **No** |

---

## Type 0 — Recursively Enumerable Languages

### Grammar

**Unrestricted grammar:** Any rule of the form:

$$
\alpha \to \beta
$$

where $\alpha \in (V \cup \Sigma)^+$ and $\beta \in (V \cup \Sigma)^*$.

No restrictions — rules can shrink, grow, or transform arbitrarily.

### Automaton

- **TM** (Turing Machine) — may not halt on strings outside the language

### Closure Properties

| Operation | Closed? |
|-----------|---------|
| Union ($L_1 \cup L_2$) | **Yes** |
| Intersection ($L_1 \cap L_2$) | **Yes** |
| Concatenation ($L_1 \cdot L_2$) | **Yes** |
| Kleene star ($L^*$) | **Yes** |
| Complement ($\bar{L}$) | **No** |

> R.E. languages are NOT closed under complement. If they were, then R.E. = decidable (since $L$ decidable iff both $L$ and $\bar{L}$ are R.E.).

### Decision Problems

| Problem | Decidable? |
|---------|-----------|
| Membership ($w \in L$?) | **No** (only semi-decidable) |
| Emptiness ($L = \emptyset$?) | **No** |
| Equivalence ($L_1 = L_2$?) | **No** |
| Everything | **No** (in general) |

---

## Complete Comparison Table

| Property | Type 3 (Regular) | Type 2 (CFL) | Type 1 (CSL) | Type 0 (R.E.) |
|----------|-----------------|--------------|-------------|---------------|
| Grammar | $A \to aB$, $A \to a$ | $A \to \alpha$ | $\alpha A \beta \to \alpha \gamma \beta$ | $\alpha \to \beta$ |
| Automaton | DFA/NFA | PDA | LBA | TM |
| Membership | $O(n)$ | $O(n^3)$ | Decidable (exp) | Undecidable |
| Emptiness | Decidable | Decidable | Undecidable | Undecidable |
| Equivalence | Decidable | Undecidable | Undecidable | Undecidable |
| ∪ closed | Yes | Yes | Yes | Yes |
| ∩ closed | Yes | **No** | Yes | Yes |
| Complement | Yes | **No** | Yes | **No** |
| Pumping | $xyz$ | $uvxyz$ | — | — |

---

## Strict Containment: Boundary Examples

Each containment in the hierarchy is **strict**. Here are languages at each boundary:

### Regular but not "only regular"

$$
L = a^* b^* = \{a^i b^j \mid i, j \geq 0\}
$$

This is regular (DFA with 2 states). Also CFL, CSL, and R.E. (since containment).

### Context-Free but NOT Regular

$$
L = \{a^n b^n \mid n \geq 0\}
$$

- **CFL:** Grammar $S \to aSb \mid \varepsilon$, PDA pushes $a$'s then matches with $b$'s
- **Not regular:** Pumping lemma for regular languages fails

### Context-Sensitive but NOT Context-Free

$$
L = \{a^n b^n c^n \mid n \geq 1\}
$$

- **CSL:** LBA can verify equal counts
- **Not CFL:** Pumping lemma for CFLs fails

### Recursively Enumerable but NOT Context-Sensitive

$$
A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}
$$

- **R.E.:** Universal TM recognizes it
- **Not CSL:** All CSLs are decidable, but $A_{TM}$ is undecidable
- In fact, $A_{TM}$ is not even decidable (a stronger separation)

### NOT Recursively Enumerable

$$
\overline{A_{TM}} = \{\langle M, w \rangle \mid M \text{ does not accept } w\}
$$

- **Not R.E.:** If it were, then $A_{TM}$ would be decidable (theorem)
- This language is co-R.E. but NOT R.E.

---

## Deterministic Context-Free Languages (DCFL)

Between regular and context-free, there's an important subclass:

$$
\text{Regular} \subsetneq \text{DCFL} \subsetneq \text{CFL}
$$

### Definition

A language is **deterministic context-free** if it's recognized by a **deterministic PDA (DPDA)**.

### Properties of DCFLs

| Property | DCFL |
|----------|------|
| Recognized by | DPDA |
| Complement closed | **Yes** (unlike full CFL!) |
| Intersection closed | **No** |
| Equivalence | **Decidable** (Sénizergues, 1997 — major result) |
| Containment | Decidable |

### Examples

- $\{a^n b^n \mid n \geq 0\}$ — DCFL (push $a$'s, pop on $b$'s)
- $\{w w^R \mid w \in \{a,b\}^*\}$ — CFL but NOT DCFL (need nondeterminism to guess the middle)
- $\{a^n b^n \mid n \geq 0\} \cup \{a^n b^{2n} \mid n \geq 0\}$ — CFL but NOT DCFL

### Programming Language Connection

Most programming language syntax is designed to be DCFL (or even LL/LR parsable), which is a strict subset of CFL. This ensures efficient, deterministic parsing.

---

## Beyond the Hierarchy: The Full Landscape

The Chomsky hierarchy doesn't tell the full story. Here's the complete picture:

```
┌──────────────────────────────────────────────────┐
│  ALL LANGUAGES (uncountable)                     │
│                                                  │
│  ┌──────────────────────────────────┐            │
│  │  R.E. (Type 0)                   │            │
│  │  ┌──────────────────────────┐    │            │
│  │  │  Decidable (Recursive)   │    │            │
│  │  │  ┌──────────────────┐    │    │            │
│  │  │  │  CSL (Type 1)    │    │    │            │
│  │  │  │  ┌────────────┐  │    │    │            │
│  │  │  │  │ CFL (Type 2)│  │    │    │            │
│  │  │  │  │ ┌────────┐ │  │    │    │            │
│  │  │  │  │ │DCFL    │ │  │    │    │            │
│  │  │  │  │ │┌─────┐ │ │  │    │    │            │
│  │  │  │  │ ││Reg. │ │ │  │    │    │            │
│  │  │  │  │ │└─────┘ │ │  │    │    │            │
│  │  │  │  │ └────────┘ │  │    │    │            │
│  │  │  │  └────────────┘  │    │    │            │
│  │  │  └──────────────────┘    │    │            │
│  │  └──────────────────────────┘    │            │
│  └──────────────────────────────────┘            │
│                                                  │
│  co-R.E. (not shown overlapping with R.E.)       │
│  Decidable = R.E. ∩ co-R.E.                     │
└──────────────────────────────────────────────────┘
```

> **Note:** "Decidable" (Recursive) sits between CSL and R.E. — it's not a Chomsky type but a crucial class.

---

## Applications

### Programming Languages

Most programming language constructs correspond to levels of the hierarchy:

| Language Feature | Hierarchy Level |
|-----------------|-----------------|
| Token patterns (identifiers, numbers) | Regular (Type 3) |
| Expression syntax, nesting | Context-free (Type 2) |
| Type checking, scope rules | Context-sensitive (Type 1) |
| Semantic analysis | Beyond formal grammars |

In practice:
- **Lexers** use regular expressions (Type 3)
- **Parsers** use CFGs (Type 2) — specifically DCFL subsets (LL, LR)
- **Type checkers** handle context-sensitive constraints (Type 1) but typically via ad-hoc methods, not formal CSGs

### Natural Languages

Human languages are believed to be **mildly context-sensitive**:

- Not quite context-free: cross-serial dependencies in Dutch/Swiss-German
- Not fully context-sensitive: too powerful
- Formalisms like Tree-Adjoining Grammars (TAG) capture this intermediate level

$$
\text{CFL} \subsetneq \text{Mildly CS} \subsetneq \text{CSL}
$$

---

## Try It Yourself

### Exercise 1

For each language, identify the lowest level of the Chomsky hierarchy it belongs to:

1. $\{w \in \{a, b\}^* \mid |w| \text{ is even}\}$
2. $\{a^n b^n \mid n \geq 0\}$
3. $\{a^n b^n c^n \mid n \geq 1\}$
4. $\{a^{2^n} \mid n \geq 0\}$
5. $\overline{A_{TM}}$

<details>
<summary>Solution</summary>

1. **Regular** — DFA with 2 states, alternating between "even" and "odd"
2. **Context-free (DCFL)** — PDA pushes $a$'s, pops on $b$'s
3. **Context-sensitive** — LBA verifies equal counts; not CFL by pumping
4. **Context-sensitive** — LBA can halve repeatedly; not CFL (pumping)
5. **NOT R.E.** — complement of $A_{TM}$; co-R.E. but not R.E.

</details>

### Exercise 2

Prove that the intersection of a CFL and a regular language is always a CFL.

<details>
<summary>Solution</summary>

Let $L_1$ be CFL (recognized by PDA $P$) and $L_2$ be regular (recognized by DFA $D$).

Construct a new PDA $P'$ that simulates both $P$ and $D$ simultaneously:
- States: $Q_P \times Q_D$ (cross product)
- Stack: same as $P$'s stack
- Transitions: on input $a$, update both the PDA state and DFA state
- Accept: when both $P$ and $D$ are in accepting states

$P'$ recognizes $L_1 \cap L_2$ and is a PDA, so $L_1 \cap L_2$ is context-free. ∎

</details>

### Exercise 3

Which closure properties distinguish CFL from regular languages?

<details>
<summary>Solution</summary>

The key differences:
- **Intersection:** Regular = Yes, CFL = No
- **Complement:** Regular = Yes, CFL = No

These are the two operations under which CFLs fail but regular languages succeed. This is precisely because DFAs are deterministic (easy to complement) while PDAs require nondeterminism.

</details>

### Exercise 4

Give an example of a decidable language that is NOT context-sensitive.

<details>
<summary>Solution</summary>

Consider $L = \{a^{2^{2^n}} \mid n \geq 0\}$ (lengths are tower-of-twos: $2, 4, 16, 256, \ldots$).

This is decidable (compute $2^{2^n}$ and check if input length matches some value), but it requires exponential space to verify (checking if $m = 2^{2^n}$ for some $n$ requires space exponential in $\log m$). Since CSLs are exactly $\text{NSPACE}(n)$, and this language requires more than linear space, it is decidable but not context-sensitive.

(A simpler answer: any decidable language requiring super-linear space.)

</details>

### Exercise 5

Why is $EQ_{CFG}$ undecidable but $EQ_{DFA}$ decidable?

<details>
<summary>Solution</summary>

**$EQ_{DFA}$ is decidable** because:
- Regular languages are closed under complement and intersection
- So we can build a DFA for the symmetric difference $L(A) \triangle L(B)$
- Then test emptiness of this DFA

**$EQ_{CFG}$ is undecidable** because:
- CFLs are NOT closed under complement or intersection
- We cannot construct a "difference" PDA
- In fact, even universality ($L = \Sigma^*$?) is undecidable for CFGs
- Equivalence is at least as hard as universality (set one grammar to $\Sigma^*$)

The lack of closure under complement is the fundamental reason.

</details>

---

## Key Takeaways

1. **Four levels:** Regular ⊂ CFL ⊂ CSL ⊂ R.E. (all strict)
2. **Grammar restrictions decrease** as we go up: right-linear → CF → CS → unrestricted
3. **Automata power increases:** DFA → PDA → LBA → TM
4. **Closure properties decrease** for complement: Regular ✓, CFL ✗, CSL ✓, R.E. ✗
5. **Decidability decreases:** Regular (all decidable) → CFL (membership yes, equiv no) → CSL (membership yes) → R.E. (nothing decidable)
6. **DCFL** sits between Regular and CFL — important for parsing
7. **Decidable** sits between CSL and R.E. — not a Chomsky type but crucial

---

## What's Next?

In the next lesson, we dive deep into **decidable languages** — examining exactly which problems about regular and context-free languages can be algorithmically solved, with complete proofs and complexity analysis.
