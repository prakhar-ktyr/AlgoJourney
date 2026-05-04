---
title: Chomsky Normal Form
---

# Chomsky Normal Form

Chomsky Normal Form (CNF) is a standardized form for context-free grammars that restricts all productions to exactly two specific shapes. This constraint enables efficient parsing algorithms and elegant theoretical proofs.

---

## Definition

A CFG is in **Chomsky Normal Form** if every production rule has one of these forms:

$$A \to BC \quad \text{(two variables)}$$
$$A \to a \quad \text{(single terminal)}$$
$$S \to \varepsilon \quad \text{(only if } \varepsilon \in L(G)\text{, and } S \text{ doesn't appear on any RHS)}$$

where $A, B, C \in V$ (variables), $a \in \Sigma$ (terminal), and $S$ is the start symbol.

### What's NOT Allowed in CNF

| Rule Form | Allowed? | Reason |
|-----------|----------|--------|
| $A \to BC$ | ✓ | Exactly two variables |
| $A \to a$ | ✓ | Exactly one terminal |
| $A \to BCD$ | ✗ | More than two symbols on RHS |
| $A \to aB$ | ✗ | Mixed terminal and variable |
| $A \to B$ | ✗ | Unit production |
| $A \to \varepsilon$ | ✗ | $\varepsilon$-production (unless $A = S$) |
| $A \to ab$ | ✗ | Two terminals |
| $A \to aBc$ | ✗ | Mixed, more than two symbols |

---

## Why CNF Matters

### 1. Binary Parse Trees

In CNF, every internal node has exactly **two** children (since every rule produces exactly two variables or one terminal leaf). This means parse trees are **binary trees**.

### 2. Derivation Length is Predictable

For any string $w$ with $|w| = n \geq 1$:

- Exactly $n - 1$ rules of the form $A \to BC$ are used (internal nodes)
- Exactly $n$ rules of the form $A \to a$ are used (leaves)
- Total derivation steps: $2n - 1$

$$\text{Derivation length for } |w| = n: \quad 2n - 1 \text{ steps}$$

### 3. CYK Parsing Algorithm

The **Cocke-Younger-Kasami (CYK)** algorithm requires the grammar to be in CNF. It's a dynamic programming algorithm that determines whether $w \in L(G)$ in time $O(n^3 \cdot |G|)$.

### 4. Pumping Lemma Proof

The pumping lemma for CFLs relies on CNF to bound the height of parse trees. A parse tree of height $h$ generates a string of length at most $2^{h-1}$.

---

## Conversion Algorithm: Overview

Starting from any CFG $G$ with $L(G) \neq \emptyset$:

$$\boxed{\text{Simplify} \to \text{TERM} \to \text{BIN}}$$

1. **Simplify:** Eliminate $\varepsilon$-productions, unit productions, useless symbols (covered in previous lesson)
2. **TERM:** Replace terminals in mixed rules with new variables
3. **BIN:** Break rules with more than 2 symbols into chains of binary rules

---

## Step 1: TERM (Terminal Elimination)

For any rule where a terminal $a$ appears alongside other symbols:

1. Create a new variable $T_a$ for each terminal $a$ that appears in a rule with length $\geq 2$
2. Add the rule $T_a \to a$
3. Replace every occurrence of $a$ in rules of length $\geq 2$ with $T_a$

### Example

Before TERM:

$$S \to aXb \mid AB$$
$$X \to aX \mid bX \mid c$$
$$A \to aA \mid a$$
$$B \to bB \mid b$$

After TERM (introduce $T_a, T_b, T_c$):

$$S \to T_a X T_b \mid AB$$
$$X \to T_a X \mid T_b X \mid c$$
$$A \to T_a A \mid a$$
$$B \to T_b B \mid b$$
$$T_a \to a$$
$$T_b \to b$$

Note: Rules already of the form $A \to a$ (like $A \to a$, $B \to b$, $X \to c$) are left unchanged.

---

## Step 2: BIN (Rule Breaking)

For any rule with more than 2 symbols on the RHS:

$$A \to B_1 B_2 B_3 \cdots B_k \quad (k > 2)$$

Replace with a chain of binary rules using new variables:

$$A \to B_1 D_1$$
$$D_1 \to B_2 D_2$$
$$D_2 \to B_3 D_3$$
$$\vdots$$
$$D_{k-3} \to B_{k-2} D_{k-2}$$
$$D_{k-2} \to B_{k-1} B_k$$

This introduces $k - 2$ new variables and $k - 1$ rules (replacing the original 1 rule).

### Example

Before BIN:

$$S \to T_a X T_b \mid AB$$

Break $S \to T_a X T_b$ (length 3):

$$S \to T_a D_1$$
$$D_1 \to X T_b$$

The rule $S \to AB$ already has exactly 2 symbols — no change needed.

---

## Complete Conversion Example

### Original Grammar

$$S \to ASB \mid ab$$
$$A \to aAS \mid a$$
$$B \to SbS \mid b$$

### Step 1: Simplify

**$\varepsilon$-elimination:** No $\varepsilon$-productions present. ✓

**Unit production elimination:** No unit productions present. ✓

**Useless symbol elimination:**
- All variables are generating ($S \to ab$, $A \to a$, $B \to b$)
- All variables are reachable from $S$

Grammar is already simplified. ✓

### Step 2: TERM

Rules with terminals mixed with other symbols:
- $S \to ab$ — two terminals, needs fixing: $S \to T_a T_b$
- $A \to aAS$ — terminal $a$ mixed: $A \to T_a AS$
- $B \to SbS$ — terminal $b$ mixed: $B \to S T_b S$

After TERM:

$$S \to ASB \mid T_a T_b$$
$$A \to T_a AS \mid a$$
$$B \to ST_bS \mid b$$
$$T_a \to a$$
$$T_b \to b$$

### Step 3: BIN

Rules with more than 2 RHS symbols:
- $S \to ASB$ (length 3): introduce $D_1$

$$S \to AD_1, \quad D_1 \to SB$$

- $A \to T_a AS$ (length 3): introduce $D_2$

$$A \to T_a D_2, \quad D_2 \to AS$$

- $B \to ST_bS$ (length 3): introduce $D_3$

$$B \to SD_3, \quad D_3 \to T_bS$$

### Final CNF Grammar

$$S \to AD_1 \mid T_aT_b$$
$$D_1 \to SB$$
$$A \to T_aD_2 \mid a$$
$$D_2 \to AS$$
$$B \to SD_3 \mid b$$
$$D_3 \to T_bS$$
$$T_a \to a$$
$$T_b \to b$$

**Verification:** Every rule is either $X \to YZ$ or $X \to t$. ✓

---

## Another Complete Example

### Original Grammar

$$E \to E + T \mid T$$
$$T \to T * F \mid F$$
$$F \to (E) \mid id$$

### Step 1: Simplify

**Unit productions:** $E \to T$ and $T \to F$ are unit productions!

Unit pairs: $(E, E), (T, T), (F, F), (E, T), (T, F), (E, F)$

Non-unit rules:
- $E$: $E + T$
- $T$: $T * F$
- $F$: $(E)$, $id$

After unit elimination:

$$E \to E + T \mid T * F \mid (E) \mid id$$
$$T \to T * F \mid (E) \mid id$$
$$F \to (E) \mid id$$

**Useless symbols:** All useful. ✓

### Step 2: TERM

Terminals appearing in rules of length $\geq 2$: $+, *, (, ), id$

Wait — $id$ is a terminal (a token). Let's treat it as a single terminal symbol.

Introduce: $T_+ \to +$, $T_* \to *$, $T_( \to ($, $T_) \to )$

$$E \to ET_+T \mid TT_*F \mid T_(ET_) \mid id$$
$$T \to TT_*F \mid T_(ET_) \mid id$$
$$F \to T_(ET_) \mid id$$
$$T_+ \to +$$
$$T_* \to *$$
$$T_( \to ($$
$$T_) \to )$$

### Step 3: BIN

Rules with $> 2$ symbols:

$E \to ET_+T$ (length 3): $E \to ED_1, \quad D_1 \to T_+T$

$E \to TT_*F$ (length 3): $E \to TD_2, \quad D_2 \to T_*F$

$E \to T_(ET_)$ (length 3): $E \to T_(D_3, \quad D_3 \to ET_)$

Similarly for $T$ and $F$.

### Final CNF Grammar

$$E \to ED_1 \mid TD_2 \mid T_(D_3 \mid id$$
$$T \to TD_2 \mid T_(D_3 \mid id$$
$$F \to T_(D_3 \mid id$$
$$D_1 \to T_+T$$
$$D_2 \to T_*F$$
$$D_3 \to ET_)$$
$$T_+ \to +$$
$$T_* \to *$$
$$T_( \to ($$
$$T_) \to )$$

Every rule is in CNF. ✓

---

## The CYK Algorithm (Preview)

With the grammar in CNF, the CYK algorithm fills a triangular table:

For string $w = a_1 a_2 \cdots a_n$:

- $T[i][i] = \{A \mid A \to a_i \in R\}$ (which variables produce the $i$-th symbol)
- $T[i][j] = \{A \mid A \to BC, \; B \in T[i][k], \; C \in T[k+1][j] \text{ for some } i \leq k < j\}$

The string $w \in L(G)$ if and only if $S \in T[1][n]$.

**Time complexity:** $O(n^3 \cdot |G|)$ — polynomial!

This is only possible because CNF guarantees binary branching, allowing us to try all possible split points.

---

## Parse Tree Height and String Length

In CNF, a parse tree of height $h$ produces a string of length at most $2^{h-1}$.

**Proof:** By induction on $h$.

- **Base** ($h = 1$): The tree is just $A \to a$, producing a string of length $1 = 2^0$. ✓
- **Inductive step:** A tree of height $h$ has root $A \to BC$ where subtrees rooted at $B$ and $C$ have height at most $h - 1$. Each subtree produces a string of length at most $2^{h-2}$. Total length: at most $2^{h-2} + 2^{h-2} = 2^{h-1}$. ✓

**Contrapositive:** A string of length $n$ requires a parse tree of height at least $\lceil \log_2 n \rceil + 1$.

This fact is crucial for the pumping lemma for CFLs.

---

## Size of CNF Grammar

If the original simplified grammar has:
- $r$ rules
- Maximum RHS length $k$

Then the CNF grammar has at most:
- $O(r \cdot k)$ rules
- $O(r \cdot k + |\Sigma|)$ variables

The size increase is polynomial — at most a linear factor per rule.

---

## Greibach Normal Form (Brief Introduction)

Another important normal form:

### Definition

A CFG is in **Greibach Normal Form (GNF)** if every production has the form:

$$A \to a B_1 B_2 \cdots B_k \quad (k \geq 0)$$

That is, the RHS starts with exactly one terminal followed by zero or more variables.

### Key Properties

- Every rule "consumes" exactly one input symbol
- Derivation of a string of length $n$ takes exactly $n$ steps
- Directly corresponds to a Pushdown Automaton (PDA)
- No left recursion (useful for top-down parsing)

### Comparison

| Property | CNF | GNF |
|----------|-----|-----|
| Rule form | $A \to BC$ or $A \to a$ | $A \to a\alpha$ where $\alpha \in V^*$ |
| Derivation length for $|w|=n$ | $2n-1$ | $n$ |
| Parse tree shape | Binary | Left-branching |
| Main use | CYK algorithm, proofs | PDA construction, LL parsing |

### Conversion to GNF

The conversion algorithm is more complex than CNF conversion and involves:

1. Convert to CNF first
2. Order the variables $A_1, A_2, \ldots, A_m$
3. Ensure rules $A_i \to A_j \alpha$ have $j > i$ (using substitution)
4. Eliminate left recursion at each level
5. Back-substitute to put all rules in GNF form

We won't cover the full GNF conversion algorithm here, but it's important to know it exists and that **every CFL (without $\varepsilon$) has a GNF grammar**.

---

## Theorem: CNF Equivalence

**Theorem:** For every CFG $G$ with $L(G) \neq \emptyset$, there exists a CFG $G'$ in Chomsky Normal Form such that $L(G') = L(G) \setminus \{\varepsilon\}$.

If $\varepsilon \in L(G)$, we can add $S_0 \to S \mid \varepsilon$ where $S_0$ is a new start symbol that doesn't appear on any RHS.

**Proof:** The constructive algorithm (Simplify → TERM → BIN) presented in this lesson transforms any CFG into CNF while preserving the language. Each step preserves language equivalence:

1. Simplification preserves $L(G) \setminus \{\varepsilon\}$ (proven in previous lesson)
2. TERM: replacing terminal $a$ with $T_a$ (where $T_a \to a$) doesn't change derivable strings
3. BIN: breaking $A \to B_1 \cdots B_k$ into a chain doesn't change the set of terminal strings derivable

---

## Worked Example: Full Pipeline

**Original grammar:**

$$S \to aXa \mid bXb \mid \varepsilon$$
$$X \to aX \mid bX \mid a \mid b \mid \varepsilon$$

This generates even-length palindromes plus some extra strings. Let's convert to CNF.

### Simplification

**$\varepsilon$-elimination:**

Nullable: $\{X, S\}$ (both have $\to \varepsilon$ rules)

For $S \to aXa$: $X$ nullable → add $S \to aa$

For $S \to bXb$: $X$ nullable → add $S \to bb$

For $X \to aX$: $X$ nullable → add $X \to a$ (already exists)

For $X \to bX$: $X$ nullable → add $X \to b$ (already exists)

Since $\varepsilon \in L(G)$, add new start: $S_0 \to S \mid \varepsilon$

Remove $\varepsilon$-productions from $S$ and $X$:

$$S_0 \to S \mid \varepsilon$$
$$S \to aXa \mid aa \mid bXb \mid bb$$
$$X \to aX \mid bX \mid a \mid b$$

**Unit elimination:**

$S_0 \to S$ is a unit production.

Unit pairs: $(S_0, S_0), (S, S), (X, X), (S_0, S)$

For $(S_0, S)$: add $S$'s non-unit rules to $S_0$:

$$S_0 \to aXa \mid aa \mid bXb \mid bb \mid \varepsilon$$

Remove $S_0 \to S$.

$$S_0 \to aXa \mid aa \mid bXb \mid bb \mid \varepsilon$$
$$S \to aXa \mid aa \mid bXb \mid bb$$
$$X \to aX \mid bX \mid a \mid b$$

**Useless symbols:** $S$ is now unreachable from $S_0$! Remove $S$.

$$S_0 \to aXa \mid aa \mid bXb \mid bb \mid \varepsilon$$
$$X \to aX \mid bX \mid a \mid b$$

### TERM

Rules with terminals mixed:
- $S_0 \to aXa$ (length 3): $S_0 \to T_aXT_a$
- $S_0 \to aa$ (length 2, two terminals): $S_0 \to T_aT_a$
- $S_0 \to bXb$ (length 3): $S_0 \to T_bXT_b$
- $S_0 \to bb$: $S_0 \to T_bT_b$
- $X \to aX$: $X \to T_aX$
- $X \to bX$: $X \to T_bX$

$$S_0 \to T_aXT_a \mid T_aT_a \mid T_bXT_b \mid T_bT_b \mid \varepsilon$$
$$X \to T_aX \mid T_bX \mid a \mid b$$
$$T_a \to a$$
$$T_b \to b$$

### BIN

Rules with $> 2$ RHS symbols:

$S_0 \to T_aXT_a$ (length 3): $S_0 \to T_aD_1, \quad D_1 \to XT_a$

$S_0 \to T_bXT_b$ (length 3): $S_0 \to T_bD_2, \quad D_2 \to XT_b$

### Final CNF Grammar

$$S_0 \to T_aD_1 \mid T_aT_a \mid T_bD_2 \mid T_bT_b \mid \varepsilon$$
$$D_1 \to XT_a$$
$$D_2 \to XT_b$$
$$X \to T_aX \mid T_bX \mid a \mid b$$
$$T_a \to a$$
$$T_b \to b$$

**Verify:** All rules are $A \to BC$, $A \to a$, or $S_0 \to \varepsilon$ (with $S_0$ not on any RHS). ✓

---

## Exercises

### Exercise 1: CNF Conversion

Convert to Chomsky Normal Form:

$$S \to aSa \mid bSb \mid a \mid b \mid \varepsilon$$

---

### Exercise 2: Verify CNF

Which of these grammars are in CNF? For those that aren't, identify the violating rules.

a) $S \to AB, \; A \to a, \; B \to b$

b) $S \to AB, \; A \to aB, \; B \to b$

c) $S \to AB \mid \varepsilon, \; A \to CF \mid a, \; B \to b, \; C \to c, \; F \to f$

d) $S \to ASB, \; A \to a, \; B \to b$

---

### Exercise 3: Derivation Length

Given a grammar in CNF, prove that any string $w$ with $|w| = n$ requires exactly $2n - 1$ derivation steps.

**Hint:** Count rules of each type. How many $A \to BC$ rules are needed? How many $A \to a$ rules?

---

### Exercise 4: Full Conversion

Convert to CNF:

$$S \to ABBA$$
$$A \to a \mid \varepsilon$$
$$B \to b \mid \varepsilon$$

Show each step of the pipeline clearly.

---

### Exercise 5: CYK Table

Using the CNF grammar:

$$S \to AB \mid BC$$
$$A \to BA \mid a$$
$$B \to CC \mid b$$
$$C \to AB \mid a$$

Fill in the CYK table for the string $baaba$ and determine if it's in $L(G)$.

---

### Exercise 6: Size Analysis

Given a simplified grammar with $r$ rules and maximum RHS length $k$:

a) How many new "TERM" variables are needed (at most)?

b) How many new "BIN" variables does a single rule of length $k$ produce?

c) What is the total number of rules in the resulting CNF grammar (in terms of $r$ and $k$)?

---

### Exercise 7: Inverse Problem

Given the CNF grammar:

$$S \to AB$$
$$A \to T_aD_1 \mid a$$
$$D_1 \to AS$$
$$B \to T_bD_2 \mid b$$
$$D_2 \to BS$$
$$T_a \to a$$
$$T_b \to b$$

Reverse-engineer the original grammar (before CNF conversion). What language does it generate?

---

### Exercise 8: GNF

Convert the following CNF grammar to Greibach Normal Form (at least outline the key steps):

$$S \to AB$$
$$A \to SA \mid a$$
$$B \to SB \mid b$$

**Hint:** Substitute $S \to AB$ into $A \to SA$ to get $A \to ABA \mid a$. Then eliminate left recursion.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| CNF form | $A \to BC$ or $A \to a$ only |
| Derivation length | $2n - 1$ steps for string of length $n$ |
| TERM step | Replace terminals with dedicated variables |
| BIN step | Break long rules into binary chains |
| CYK algorithm | $O(n^3)$ parsing using CNF |
| GNF form | $A \to a\alpha$ (terminal-first) |
| Tree height bound | Height $h$ → string length $\leq 2^{h-1}$ |

---

## What's Next?

In the next lesson, we'll study **Pushdown Automata (PDA)** — the machine model that recognizes exactly the context-free languages, extending finite automata with a stack for memory.
