---
title: DFA State Minimization
---

# DFA State Minimization

Given a DFA, can we find a **smaller** DFA that recognizes the same language? In this lesson, we'll learn the **table-filling algorithm** for DFA minimization, prove the **Myhill-Nerode theorem** (which guarantees a unique minimal DFA for every regular language), and work through detailed examples.

---

## Why Minimize?

After the subset construction (NFA → DFA), the resulting DFA often has redundant states — states that behave identically and can be merged without changing the language. Minimization:

1. Produces the **smallest possible** DFA for a language
2. Provides a **canonical form** (useful for testing language equivalence)
3. Reduces **implementation cost** (fewer states = less memory, faster lookup)

> **Key Result:** Every regular language has a **unique** minimal DFA (up to renaming of states).

This means: if two DFAs both have the fewest possible states and recognize the same language, they must be structurally identical (isomorphic).

---

## Distinguishable and Indistinguishable States

The core idea: two states are **equivalent** (indistinguishable) if no input string can tell them apart.

### Definition

States $p$ and $q$ in DFA $M = (Q, \Sigma, \delta, q_0, F)$ are **distinguishable** if:

$$\exists w \in \Sigma^*: \left(\hat{\delta}(p, w) \in F\right) \oplus \left(\hat{\delta}(q, w) \in F\right)$$

where $\oplus$ is exclusive or. In other words, there's a string $w$ such that starting from $p$ leads to acceptance but starting from $q$ leads to rejection (or vice versa).

States $p$ and $q$ are **indistinguishable** (or **equivalent**, written $p \equiv q$) if:

$$\forall w \in \Sigma^*: \hat{\delta}(p, w) \in F \iff \hat{\delta}(q, w) \in F$$

No string can distinguish them — they behave identically for all possible futures.

### Examples

- An accepting state and a non-accepting state are always distinguishable (use $w = \varepsilon$).
- Two accepting states with the same transitions might be indistinguishable.
- A dead state (non-accepting, self-loops on all symbols) is distinguishable from any accepting state.

### Key Insight

If $p \equiv q$, we can **merge** them into a single state without changing the language. The minimal DFA is obtained by merging all indistinguishable state pairs.

---

## The Table-Filling Algorithm

This algorithm systematically identifies all pairs of distinguishable states.

### Algorithm

**Input:** DFA $M = (Q, \Sigma, \delta, q_0, F)$

**Output:** All pairs of distinguishable states

```
function TABLE_FILLING(M):
    // Step 1: Initialize — mark "obviously" distinguishable pairs
    for each pair (p, q) where p ∈ F and q ∉ F (or vice versa):
        mark (p, q) as DISTINGUISHABLE

    // Step 2: Iterate — propagate distinguishability
    repeat:
        for each unmarked pair (p, q):
            for each symbol a ∈ Σ:
                if (δ(p, a), δ(q, a)) is marked as DISTINGUISHABLE:
                    mark (p, q) as DISTINGUISHABLE
    until no new pairs are marked

    // Step 3: Unmarked pairs are EQUIVALENT — merge them
    return unmarked pairs as equivalent state pairs
```

### Why It Works

**Step 1** catches the base case: if one state accepts and the other rejects (on $\varepsilon$), they're trivially distinguishable.

**Step 2** implements the inductive case: if $\delta(p, a)$ and $\delta(q, a)$ are distinguishable (by some string $w$), then $p$ and $q$ are distinguishable (by string $aw$).

The algorithm terminates because: there are finitely many pairs, and once marked, a pair stays marked. If no new marks are made in a full pass, we've found all distinguishable pairs.

**Correctness:** The unmarked pairs form an equivalence relation where states in the same class are truly indistinguishable (no string separates them).

---

## Step-by-Step Example 1

### The DFA

Consider this DFA over $\Sigma = \{a, b\}$:

- States: $Q = \{q_0, q_1, q_2, q_3, q_4, q_5\}$
- Start: $q_0$
- Accept: $F = \{q_3, q_4\}$

Transition table:

| State | $\delta(\cdot, a)$ | $\delta(\cdot, b)$ |
|---|---|---|
| $q_0$ | $q_1$ | $q_2$ |
| $q_1$ | $q_3$ | $q_4$ |
| $q_2$ | $q_4$ | $q_3$ |
| $q_3$ | $q_5$ | $q_5$ |
| $q_4$ | $q_5$ | $q_5$ |
| $q_5$ | $q_5$ | $q_5$ |

### Step 1: Initial Marks

Mark all pairs where one is accepting and the other is not:

Accept states: $\{q_3, q_4\}$. Non-accept: $\{q_0, q_1, q_2, q_5\}$.

Marked pairs:
- $(q_0, q_3)$, $(q_0, q_4)$
- $(q_1, q_3)$, $(q_1, q_4)$
- $(q_2, q_3)$, $(q_2, q_4)$
- $(q_5, q_3)$, $(q_5, q_4)$

### Step 2: Build Distinguishability Table

Remaining unmarked pairs to examine:
- $(q_0, q_1)$, $(q_0, q_2)$, $(q_0, q_5)$
- $(q_1, q_2)$, $(q_1, q_5)$
- $(q_2, q_5)$
- $(q_3, q_4)$

**Check $(q_0, q_1)$:**
- On $a$: $\delta(q_0, a) = q_1$, $\delta(q_1, a) = q_3$. Is $(q_1, q_3)$ marked? **Yes!**
- Mark $(q_0, q_1)$ ✓

**Check $(q_0, q_2)$:**
- On $a$: $\delta(q_0, a) = q_1$, $\delta(q_2, a) = q_4$. Is $(q_1, q_4)$ marked? **Yes!**
- Mark $(q_0, q_2)$ ✓

**Check $(q_0, q_5)$:**
- On $a$: $\delta(q_0, a) = q_1$, $\delta(q_5, a) = q_5$. Is $(q_1, q_5)$ marked? Not yet.
- On $b$: $\delta(q_0, b) = q_2$, $\delta(q_5, b) = q_5$. Is $(q_2, q_5)$ marked? Not yet.
- Can't mark yet. Skip for now.

**Check $(q_1, q_2)$:**
- On $a$: $\delta(q_1, a) = q_3$, $\delta(q_2, a) = q_4$. Is $(q_3, q_4)$ marked? Not yet.
- On $b$: $\delta(q_1, b) = q_4$, $\delta(q_2, b) = q_3$. Is $(q_3, q_4)$ marked? Not yet (same pair).
- Can't mark yet. Skip.

**Check $(q_1, q_5)$:**
- On $a$: $\delta(q_1, a) = q_3$, $\delta(q_5, a) = q_5$. Is $(q_3, q_5)$ marked? **Yes!** (different accept/reject)
- Mark $(q_1, q_5)$ ✓

**Check $(q_2, q_5)$:**
- On $a$: $\delta(q_2, a) = q_4$, $\delta(q_5, a) = q_5$. Is $(q_4, q_5)$ marked? **Yes!**
- Mark $(q_2, q_5)$ ✓

**Check $(q_3, q_4)$:**
- On $a$: $\delta(q_3, a) = q_5$, $\delta(q_4, a) = q_5$. Is $(q_5, q_5)$ marked? **No** (same state — never distinguishable).
- On $b$: $\delta(q_3, b) = q_5$, $\delta(q_4, b) = q_5$. Same.
- Cannot mark $(q_3, q_4)$.

**Second pass — re-check $(q_0, q_5)$:**
- On $a$: $\delta(q_0, a) = q_1$, $\delta(q_5, a) = q_5$. Is $(q_1, q_5)$ marked? **Yes!** (just marked)
- Mark $(q_0, q_5)$ ✓

**Re-check $(q_1, q_2)$:**
- On $a$: $\delta(q_1, a) = q_3$, $\delta(q_2, a) = q_4$. Is $(q_3, q_4)$ marked? **No.**
- On $b$: $\delta(q_1, b) = q_4$, $\delta(q_2, b) = q_3$. Is $(q_4, q_3)$ marked? **No.**
- Still can't mark.

**No more new marks possible.** Algorithm terminates.

### Step 3: Identify Equivalent Pairs

Unmarked pairs: $(q_1, q_2)$ and $(q_3, q_4)$

Equivalence classes:
- $\{q_0\}$
- $\{q_1, q_2\}$ (merge!)
- $\{q_3, q_4\}$ (merge!)
- $\{q_5\}$

### Step 4: Construct Minimized DFA

Rename: $A = \{q_0\}$, $B = \{q_1, q_2\}$, $C = \{q_3, q_4\}$, $D = \{q_5\}$

| State | $a$ | $b$ | Accept? |
|---|---|---|---|
| $A$ (start) | $B$ | $B$ | No |
| $B$ | $C$ | $C$ | No |
| $C$ | $D$ | $D$ | **Yes** |
| $D$ | $D$ | $D$ | No |

The minimized DFA has **4 states** (down from 6)!

### Interpretation

This DFA accepts strings of length exactly 2 — it counts: 0 symbols ($A$), 1 symbol ($B$), 2 symbols ($C$, accept), 3+ symbols ($D$, dead). Wait, let's verify: from the original, $q_0 \xrightarrow{a} q_1 \xrightarrow{a} q_3$ (accept), and $q_0 \xrightarrow{b} q_2 \xrightarrow{a} q_4$ (accept). Yes — any string of length 2 is accepted.

---

## The Myhill-Nerode Theorem

The Myhill-Nerode theorem provides the deepest characterization of regular languages and explains **why** the minimal DFA is unique.

### Right-Invariant Equivalence Relations

Given a language $L \subseteq \Sigma^*$, define the equivalence relation $\equiv_L$ on $\Sigma^*$:

$$x \equiv_L y \iff \forall z \in \Sigma^*: (xz \in L \iff yz \in L)$$

Two strings are equivalent if they're **indistinguishable** with respect to $L$ — no suffix $z$ can tell them apart.

### Properties of $\equiv_L$

1. **Equivalence relation:** reflexive, symmetric, transitive
2. **Right-invariant:** if $x \equiv_L y$, then $xa \equiv_L ya$ for all $a \in \Sigma$
3. **Refines $L$:** if $x \equiv_L y$ and $x \in L$, then $y \in L$

### The Index

The **index** of $\equiv_L$ is the number of equivalence classes:

$$\text{index}(\equiv_L) = |\Sigma^* / \equiv_L|$$

### The Theorem

> **Myhill-Nerode Theorem:** The following are equivalent:
> 1. $L$ is regular (recognized by some DFA)
> 2. $L$ is the union of some equivalence classes of a right-invariant equivalence relation of **finite index**
> 3. The relation $\equiv_L$ has finite index
>
> Moreover, the number of states in the **minimal DFA** for $L$ equals the index of $\equiv_L$.

### What This Means

- The equivalence classes of $\equiv_L$ correspond exactly to the states of the minimal DFA.
- The minimal DFA has exactly $\text{index}(\equiv_L)$ states.
- This minimal DFA is **unique** (up to state renaming).
- If $\equiv_L$ has infinite index, $L$ is not regular.

---

## Using Myhill-Nerode to Prove Non-Regularity

The Myhill-Nerode theorem gives an alternative to the pumping lemma for proving languages non-regular.

### Strategy

To show $L$ is not regular, find infinitely many pairwise distinguishable strings — strings $x_1, x_2, x_3, \ldots$ such that for all $i \neq j$, there exists $z$ with $x_i z \in L \oplus x_j z \in L$.

### Example: $L = \{a^n b^n \mid n \geq 0\}$ Is Not Regular

Consider the strings $a, a^2, a^3, a^4, \ldots$

For any $i \neq j$, take $z = b^i$:
- $a^i b^i \in L$ ✓
- $a^j b^i \notin L$ (since $j \neq i$) ✗

So $a^i \not\equiv_L a^j$ for all $i \neq j$. This gives infinitely many equivalence classes, so $\equiv_L$ has infinite index, and $L$ is not regular. $\blacksquare$

### Example: $L = \{ww \mid w \in \{a, b\}^*\}$ Is Not Regular

Consider strings $a^n$ for all $n \geq 0$. For $i \neq j$, take $z = a^i$:
- $a^i \cdot a^i = a^{2i} \in L$ ✓
- $a^j \cdot a^i = a^{i+j}$: this is in $L$ iff $i + j$ is even.

Hmm, that doesn't quite work for all pairs. Let's use $z = b a^i$:
- $a^i \cdot b a^i$: is this in $L$? We need $a^i b a^i = ww$ for some $w$. This requires $w = a^{i/2} b a^{i/2}$... only if structured correctly.

Actually, a simpler approach: take $z = b^i a^i$:
- Not quite right either. The Myhill-Nerode approach works best for simpler languages. For $\{ww\}$, the pumping lemma or direct arguments work better.

---

## Removing Unreachable States

Before minimizing, always **remove unreachable states** first:

### Definition

A state $q$ is **reachable** if there exists some string $w$ such that $\hat{\delta}(q_0, w) = q$.

### Why Remove Them?

Unreachable states don't affect the language but inflate the state count. They also don't participate meaningfully in the distinguishability analysis.

### Algorithm

```
function FIND_REACHABLE(M):
    reachable ← {q₀}
    worklist ← [q₀]
    while worklist not empty:
        q ← worklist.dequeue()
        for each a ∈ Σ:
            r ← δ(q, a)
            if r ∉ reachable:
                reachable ← reachable ∪ {r}
                worklist.enqueue(r)
    return reachable
```

Remove all states not in `reachable` before running the table-filling algorithm.

---

## Complete Example 2

### The DFA

Over $\Sigma = \{0, 1\}$:

- States: $\{A, B, C, D, E, F\}$
- Start: $A$
- Accept: $\{C, D, E\}$

| State | $\delta(\cdot, 0)$ | $\delta(\cdot, 1)$ |
|---|---|---|
| $A$ | $B$ | $C$ |
| $B$ | $A$ | $D$ |
| $C$ | $E$ | $F$ |
| $D$ | $E$ | $F$ |
| $E$ | $E$ | $F$ |
| $F$ | $F$ | $F$ |

### Check Reachability

Starting from $A$: $A \to B, C$. From $B$: $\to A, D$. From $C$: $\to E, F$. From $D$: $\to E, F$. From $E$: $\to E, F$. From $F$: $\to F$.

All states are reachable. ✓

### Step 1: Initial Marks

Accept: $\{C, D, E\}$. Non-accept: $\{A, B, F\}$.

Mark: $(A,C), (A,D), (A,E), (B,C), (B,D), (B,E), (F,C), (F,D), (F,E)$

### Step 2: Propagate

Unmarked pairs among non-accept: $(A,B), (A,F), (B,F)$
Unmarked pairs among accept: $(C,D), (C,E), (D,E)$

**Check $(A, B)$:**
- On 0: $\delta(A,0)=B$, $\delta(B,0)=A$. Is $(A,B)$ marked? That's the pair itself — skip (need a different pair).

  Actually, $(B,A)$ is the same as $(A,B)$. Since we're checking if the successor pair is marked, and it's the same pair (unmarked), this doesn't help.
- On 1: $\delta(A,1)=C$, $\delta(B,1)=D$. Is $(C,D)$ marked? Not yet.
- Can't mark.

**Check $(A, F)$:**
- On 0: $\delta(A,0)=B$, $\delta(F,0)=F$. Is $(B,F)$ marked? Not yet.
- On 1: $\delta(A,1)=C$, $\delta(F,1)=F$. Is $(C,F)$ marked? **Yes!**
- Mark $(A,F)$ ✓

**Check $(B, F)$:**
- On 0: $\delta(B,0)=A$, $\delta(F,0)=F$. Is $(A,F)$ marked? **Yes!** (just marked)
- Mark $(B,F)$ ✓

**Check $(C, D)$:**
- On 0: $\delta(C,0)=E$, $\delta(D,0)=E$. Same state — unmarked.
- On 1: $\delta(C,1)=F$, $\delta(D,1)=F$. Same state — unmarked.
- Cannot mark.

**Check $(C, E)$:**
- On 0: $\delta(C,0)=E$, $\delta(E,0)=E$. Same state.
- On 1: $\delta(C,1)=F$, $\delta(E,1)=F$. Same state.
- Cannot mark.

**Check $(D, E)$:**
- On 0: $\delta(D,0)=E$, $\delta(E,0)=E$. Same.
- On 1: $\delta(D,1)=F$, $\delta(E,1)=F$. Same.
- Cannot mark.

**Re-check $(A, B)$:**
- On 1: $(C,D)$ still unmarked. Still can't mark.
- On 0: $(B,A) = (A,B)$ still unmarked. Can't mark.

No more progress. Algorithm terminates.

### Equivalent Pairs

Unmarked: $(A,B)$, $(C,D)$, $(C,E)$, $(D,E)$

Equivalence classes:
- $\{A, B\}$
- $\{C, D, E\}$
- $\{F\}$

### Minimized DFA

Rename: $P = \{A,B\}$, $Q = \{C,D,E\}$, $R = \{F\}$

| State | $0$ | $1$ | Accept? |
|---|---|---|---|
| $P$ (start) | $P$ | $Q$ | No |
| $Q$ | $Q$ | $R$ | **Yes** |
| $R$ | $R$ | $R$ | No |

3 states (down from 6)! This DFA accepts strings containing at least one 1, with no 1 after the first block of 1's... actually let's trace: any string with at least one 1 that doesn't have two "groups" of 1's separated by 0's — hmm, let me trace more carefully.

$P \xrightarrow{1} Q$ (accept). $P \xrightarrow{0} P \xrightarrow{1} Q$ (accept). $Q \xrightarrow{1} R$ (reject-trap). So from $Q$, reading 1 goes to the dead state. From $Q$, reading 0 goes to $Q$ (still accepting).

The language: strings where once you see a 1, all remaining symbols must be 0. Equivalently: $0^* 1 0^*$ — strings with exactly one 1... No: $Q$ loops on 0, so after seeing one 1, any number of 0's is fine, but another 1 kills it. So: strings with **exactly one** 1. Let's verify: "01010" → $P \xrightarrow{0} P \xrightarrow{1} Q \xrightarrow{0} Q \xrightarrow{1} R \xrightarrow{0} R$ — reject ✓ (two 1's). "010" → $P \to P \to Q \to Q$ — accept ✓ (one 1).

---

## The Minimization Theorem

> **Theorem:** The DFA produced by the table-filling algorithm (after removing unreachable states) is the **unique minimal DFA** for the language.

**Uniqueness** means: any other DFA recognizing the same language with the same number of states is **isomorphic** (same structure, different state names).

This is a remarkable property — it gives us a **canonical representation** for every regular language.

### Application: Language Equivalence

To test whether two DFAs $M_1$ and $M_2$ recognize the same language:
1. Minimize both
2. Check if the minimized DFAs are isomorphic

This is decidable and efficient.

---

## Complexity

| Operation | Time Complexity |
|---|---|
| Remove unreachable states | $O(n \cdot |\Sigma|)$ |
| Table-filling (naive) | $O(n^2 \cdot |\Sigma|)$ |
| Table-filling (with dependency lists) | $O(n^2 \cdot |\Sigma|)$ |
| Hopcroft's algorithm (optimal) | $O(n \log n \cdot |\Sigma|)$ |

where $n = |Q|$.

For most practical purposes, the $O(n^2)$ table-filling algorithm is perfectly adequate.

---

## Exercises

### Exercise 1

Minimize this DFA over $\{a, b\}$:
- States: $\{q_0, q_1, q_2, q_3\}$, Start: $q_0$, Accept: $\{q_1, q_3\}$
- $\delta(q_0, a) = q_1$, $\delta(q_0, b) = q_2$
- $\delta(q_1, a) = q_3$, $\delta(q_1, b) = q_0$
- $\delta(q_2, a) = q_0$, $\delta(q_2, b) = q_3$
- $\delta(q_3, a) = q_1$, $\delta(q_3, b) = q_2$

**Solution:**

Initial marks: $(q_0, q_1), (q_0, q_3), (q_2, q_1), (q_2, q_3)$

Check $(q_0, q_2)$: on $a$ → $(q_1, q_0)$ marked. Mark it. ✓
Check $(q_1, q_3)$: on $a$ → $(q_3, q_1)$ = same pair. On $b$ → $(q_0, q_2)$ marked? Yes! Mark it. ✓

All pairs marked → all states distinguishable → DFA is already minimal (4 states).

### Exercise 2

Minimize the DFA from the subset construction of Example 1 in Lesson 14 (the "strings ending in 01" DFA with states $A, B, C$).

**Solution:** Check pairs: $(A,B)$: on 1 → $(A, C)$, check if marked. Since $C$ is accepting and $A$ is not, $(A,C)$ is marked initially. So mark $(A,B)$. Now check $(B,C)$: $B$ is non-accepting, $C$ is accepting → already marked. All pairs distinguishable → 3-state DFA is already minimal.

### Exercise 3

Use the Myhill-Nerode theorem to determine the number of states in the minimal DFA for $L = \{w \in \{a,b\}^* \mid |w| \text{ is even}\}$.

**Solution:** The equivalence classes of $\equiv_L$ are:
- Strings of even length (equivalent to each other)
- Strings of odd length (equivalent to each other)

Index = 2. So the minimal DFA has 2 states.

### Exercise 4

Use Myhill-Nerode to prove $L = \{a^n b^n \mid n \geq 0\}$ is not regular.

**Solution:** Consider strings $\varepsilon, a, a^2, a^3, \ldots$ For $i \neq j$, the suffix $z = b^i$ distinguishes $a^i$ and $a^j$ ($a^i b^i \in L$ but $a^j b^i \notin L$). Infinitely many classes → not regular.

### Exercise 5

A DFA has a state $q$ that is reachable but from which no accept state is reachable. Is $q$ necessarily removed by minimization?

**Solution:** No — $q$ is not removed, but it may be merged with other "dead" states. A state from which no accept state is reachable is called a **dead state**. All dead states are equivalent to each other (they all reject every suffix), so minimization merges them into a single dead state. The dead state remains in the minimal DFA (unless it's unreachable).

---

## Summary

| Concept | Key Point |
|---|---|
| Distinguishable states | Some string $w$ causes them to differ on acceptance |
| Table-filling algorithm | Base: accept ≠ reject. Induction: successors distinguishable → predecessors distinguishable |
| Minimal DFA | Unique for each language; obtained by merging equivalent states |
| Myhill-Nerode | Index of $\equiv_L$ = number of states in minimal DFA |
| Non-regularity proof | Infinite index → not regular |

---

## What's Next?

With DFA minimization, we've completed the core theory of finite automata. In the next lessons, we'll explore **regular expressions**, prove their equivalence to finite automata, and study the **pumping lemma** — another tool for proving languages non-regular.
