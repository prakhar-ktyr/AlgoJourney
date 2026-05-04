---
title: Recursive and Recursively Enumerable Languages
---

# Recursive and Recursively Enumerable Languages

In this lesson, we explore the two most important classes of languages defined by Turing machines: **recursively enumerable** (recognizable) and **recursive** (decidable) languages. Understanding the distinction is crucial for grasping what computers can and cannot do.

---

## Why This Matters

Not all problems are created equal. Some can be solved completely by an algorithm (decidable), some can be partially solved (recognizable), and some cannot be solved at all. This lesson draws the precise boundary.

---

## Turing-Recognizable (Recursively Enumerable) Languages

A language $L$ is **Turing-recognizable** (also called **recursively enumerable** or **r.e.**) if there exists a Turing machine $M$ such that:

$$
L = \{ w \mid M \text{ accepts } w \}
$$

### Behavior of the Recognizer

For a recognizer $M$ of language $L$:

| Input $w$ | $w \in L$ | $w \notin L$ |
|-----------|-----------|--------------|
| $M$'s behavior | Accepts (halts in $q_{accept}$) | May reject OR may loop forever |

> **Key Point:** A recognizer is allowed to run forever on strings NOT in the language. It only guarantees acceptance for strings that ARE in the language.

### Formal Definition

A language $L \subseteq \Sigma^*$ is **recursively enumerable** if there exists a Turing machine $M$ such that:

$$
w \in L \implies M \text{ accepts } w
$$
$$
w \notin L \implies M \text{ rejects } w \text{ or } M \text{ loops on } w
$$

### Why "Recursively Enumerable"?

The name comes from an equivalent characterization: $L$ is r.e. if and only if there exists a Turing machine (enumerator) that can list (enumerate) all strings in $L$, possibly with repetitions, in some order.

$$
L \text{ is r.e.} \iff \exists \text{ an enumerator } E \text{ that prints exactly the strings in } L
$$

---

## Turing-Decidable (Recursive) Languages

A language $L$ is **Turing-decidable** (also called **recursive** or simply **decidable**) if there exists a Turing machine $M$ such that:

$$
L = \{ w \mid M \text{ accepts } w \}
$$

AND $M$ **halts on every input**.

### Behavior of the Decider

For a decider $M$ of language $L$:

| Input $w$ | $w \in L$ | $w \notin L$ |
|-----------|-----------|--------------|
| $M$'s behavior | Accepts (halts in $q_{accept}$) | Rejects (halts in $q_{reject}$) |

> **Key Point:** A decider ALWAYS halts. It never loops. You always get a yes/no answer in finite time.

### Formal Definition

A language $L \subseteq \Sigma^*$ is **decidable** if there exists a Turing machine $M$ such that:

$$
w \in L \implies M \text{ accepts } w
$$
$$
w \notin L \implies M \text{ rejects } w
$$

and $M$ halts on every input $w \in \Sigma^*$.

### The Crucial Difference

The ONLY difference between a recognizer and a decider is what happens on inputs NOT in the language:

- **Recognizer**: may loop forever on $w \notin L$
- **Decider**: must halt (reject) on $w \notin L$

---

## The Relationship: Decidable ⊂ Recognizable

Every decidable language is also recognizable, but NOT vice versa.

$$
\text{Decidable} \subset \text{Recognizable} \subset \text{All Languages}
$$

### Why Decidable ⊂ Recognizable?

If $L$ is decidable, then there exists a TM $M$ that halts on every input and accepts exactly $L$. This same $M$ also recognizes $L$ (since it accepts all strings in $L$). Therefore $L$ is recognizable.

### Why the containment is strict?

There exist languages that are recognizable but NOT decidable. The classic example is:

$$
A_{TM} = \{ \langle M, w \rangle \mid M \text{ is a TM that accepts } w \}
$$

This language is recognizable (simulate $M$ on $w$) but not decidable (proof via diagonalization — covered in later lessons).

---

## The Full Hierarchy

Here is the complete picture of language classes:

```
┌─────────────────────────────────────────────────┐
│             ALL LANGUAGES                        │
│  ┌───────────────────────────────────────────┐  │
│  │       RECOGNIZABLE (r.e.)                 │  │
│  │  ┌─────────────────────────────────┐      │  │
│  │  │        DECIDABLE                │      │  │
│  │  │   (Recursive)                   │      │  │
│  │  └─────────────────────────────────┘      │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Languages that are NOT recognizable             │
└─────────────────────────────────────────────────┘
```

---

## Co-Recognizable Languages

A language $L$ is **co-recognizable** (or co-r.e.) if its complement $\bar{L}$ is recognizable.

$$
L \text{ is co-recognizable} \iff \bar{L} \text{ is recognizable}
$$

Where $\bar{L} = \Sigma^* \setminus L$ (all strings NOT in $L$).

### Example

If $L$ is recognizable, that does NOT automatically make $\bar{L}$ recognizable. The classes of recognizable and co-recognizable languages overlap but neither contains the other.

```
┌──────────────────────────────────────┐
│          ALL LANGUAGES               │
│                                      │
│  ┌──────────┐   ┌──────────┐        │
│  │   R.E.   │   │  co-R.E. │        │
│  │          │   │          │        │
│  │  ┌────────────────┐    │        │
│  │  │   DECIDABLE    │    │        │
│  │  │  (= R.E. ∩     │    │        │
│  │  │    co-R.E.)    │    │        │
│  │  └────────────────┘    │        │
│  └──────────┘   └──────────┘        │
│                                      │
│   Neither R.E. nor co-R.E.          │
└──────────────────────────────────────┘
```

---

## The Fundamental Theorem

> **Theorem:** A language $L$ is decidable if and only if both $L$ and $\bar{L}$ are recognizable.

$$
L \text{ is decidable} \iff L \text{ is recognizable AND } \bar{L} \text{ is recognizable}
$$

### Proof (⇒ direction: Decidable implies both recognizable)

If $L$ is decidable, then there exists a decider $M$ for $L$.

- $M$ recognizes $L$ (it accepts all $w \in L$ and halts).
- Build $M'$ that flips accept/reject: $M'$ decides $\bar{L}$.
- Since $M'$ decides $\bar{L}$, it also recognizes $\bar{L}$.

Therefore both $L$ and $\bar{L}$ are recognizable. ∎

### Proof (⇐ direction: Both recognizable implies decidable)

This is the more interesting direction. Assume:
- $M_1$ recognizes $L$
- $M_2$ recognizes $\bar{L}$

We construct a decider $D$ for $L$:

**Construction of $D$:**

On input $w$:
1. Run $M_1$ and $M_2$ **in parallel** on $w$ (dovetailing)
2. If $M_1$ accepts → $D$ accepts
3. If $M_2$ accepts → $D$ rejects

**Why $D$ always halts:**

For any $w \in \Sigma^*$:
- Either $w \in L$, so $M_1$ eventually accepts, OR
- $w \in \bar{L}$, so $M_2$ eventually accepts

One of the two machines MUST accept. Therefore $D$ always halts. ∎

### Dovetailing Explained

Running two machines "in parallel" means interleaving their steps:

$$
\text{Step 1 of } M_1, \text{ Step 1 of } M_2, \text{ Step 2 of } M_1, \text{ Step 2 of } M_2, \ldots
$$

This ensures that if either machine halts, we detect it in finite time, even if the other loops forever.

---

## Examples of Decidable Languages

### Example 1: $A_{DFA}$

$$
A_{DFA} = \{ \langle B, w \rangle \mid B \text{ is a DFA that accepts } w \}
$$

**Proof of decidability:**

Build TM $M$ that on input $\langle B, w \rangle$:
1. Verify $\langle B \rangle$ is a valid DFA encoding
2. Simulate $B$ on $w$, tracking the current state
3. If simulation ends in an accept state → accept
4. If simulation ends in a non-accept state → reject

$M$ always halts because DFA simulation on a finite string always terminates in $|w|$ steps.

**Time complexity:** $O(|w|)$

---

### Example 2: $A_{CFG}$

$$
A_{CFG} = \{ \langle G, w \rangle \mid G \text{ is a CFG that generates } w \}
$$

**Proof of decidability:**

Build TM $M$ that on input $\langle G, w \rangle$:
1. Convert $G$ to Chomsky Normal Form (CNF)
2. Run the CYK algorithm on $w$ using the CNF grammar
3. If CYK determines $w$ is generated → accept
4. Otherwise → reject

$M$ always halts because CYK runs in $O(n^3 \cdot |G|)$ time where $n = |w|$.

> **Note:** We cannot simply try all derivations — there are infinitely many. CNF + CYK gives us a bounded algorithm.

---

### Example 3: $E_{DFA}$

$$
E_{DFA} = \{ \langle A \rangle \mid L(A) = \emptyset \}
$$

**Proof of decidability:**

Build TM $M$ that on input $\langle A \rangle$:
1. Verify $\langle A \rangle$ is a valid DFA encoding
2. Perform a BFS/DFS from the start state
3. If any accept state is reachable → reject (language is non-empty)
4. If no accept state is reachable → accept (language is empty)

$M$ always halts because the state graph is finite.

**Time complexity:** $O(|Q| + |\delta|)$

---

### Example 4: $EQ_{DFA}$

$$
EQ_{DFA} = \{ \langle A, B \rangle \mid L(A) = L(B) \}
$$

**Proof of decidability:**

Build TM $M$ that on input $\langle A, B \rangle$:
1. Construct DFA $C$ for the symmetric difference:
$$
L(C) = (L(A) \cap \overline{L(B)}) \cup (\overline{L(A)} \cap L(B))
$$
2. Test if $L(C) = \emptyset$ using the algorithm for $E_{DFA}$
3. If $L(C) = \emptyset$ → accept (the languages are equal)
4. If $L(C) \neq \emptyset$ → reject

$M$ always halts because all DFA operations are effective and $E_{DFA}$ is decidable.

---

## The Four Categories

Every language falls into exactly one of these categories:

| Category | $L$ recognizable? | $\bar{L}$ recognizable? | Example |
|----------|-------------------|--------------------------|---------|
| Decidable | Yes | Yes | $A_{DFA}$, $E_{DFA}$ |
| R.E. but not decidable | Yes | No | $A_{TM}$ |
| Co-R.E. but not decidable | No | Yes | $\overline{A_{TM}}$ |
| Neither R.E. nor co-R.E. | No | No | Some exotic languages |

### Observations

1. If $L$ is decidable, so is $\bar{L}$ (complement of decidable is decidable)
2. If $L$ is r.e. but not decidable, then $\bar{L}$ is NOT r.e.
3. If $L$ is not r.e. and $\bar{L}$ is not r.e., then both are in the "neither" category

---

## Closure Properties

### Decidable Languages are Closed Under:

| Operation | Proof Sketch |
|-----------|-------------|
| Union ($L_1 \cup L_2$) | Run both deciders, accept if either accepts |
| Intersection ($L_1 \cap L_2$) | Run both deciders, accept if both accept |
| Complement ($\bar{L}$) | Flip accept/reject of the decider |
| Concatenation ($L_1 \cdot L_2$) | Try all splits of input |
| Kleene star ($L^*$) | Try all partitions of input |

### Recognizable Languages are Closed Under:

| Operation | Closed? | Proof Sketch |
|-----------|---------|-------------|
| Union ($L_1 \cup L_2$) | Yes | Run both in parallel, accept if either accepts |
| Intersection ($L_1 \cap L_2$) | Yes | Run both in parallel, accept if both accept |
| Complement ($\bar{L}$) | **No** | If it were, then $L$ decidable (by theorem) |
| Concatenation ($L_1 \cdot L_2$) | Yes | Nondeterministically split input |
| Kleene star ($L^*$) | Yes | Nondeterministically partition input |

> **Critical:** Recognizable languages are NOT closed under complement. This is equivalent to saying that recognizable ≠ decidable.

---

## Preview: Diagonalization

In upcoming lessons, we will prove that certain languages are NOT decidable (like $A_{TM}$). The key technique is **diagonalization**, first used by Cantor to show that the real numbers are uncountable.

The basic idea:
1. Assume a decider $D$ exists for $A_{TM}$
2. Construct a machine $H$ that uses $D$ to contradict itself
3. $H$ on $\langle H \rangle$ leads to: "If $H$ accepts, then $H$ rejects, and vice versa"
4. Contradiction → $D$ cannot exist

This is the most important proof technique in computability theory.

---

## Summary Table

| Property | Decidable | Recognizable (R.E.) | Co-Recognizable |
|----------|-----------|--------------------|--------------------|
| TM behavior | Always halts | Accepts members, may loop on non-members | Rejects non-members, may loop on members |
| Complement | Also decidable | NOT necessarily recognizable | NOT necessarily recognizable |
| Relationship | = R.E. ∩ co-R.E. | Contains decidable | Contains decidable |
| Closure: ∪, ∩ | Yes | Yes | Yes |
| Closure: complement | Yes | **No** | **No** |

---

## Try It Yourself

### Exercise 1

Prove that if $L$ is decidable, then $L$ is also recognizable. (Hint: every decider is also a recognizer.)

### Exercise 2

Let $L_1$ be recognizable and $L_2$ be decidable. Is $L_1 \cap L_2$ necessarily recognizable? Prove your answer.

<details>
<summary>Solution</summary>

Yes. On input $w$:
1. Run the decider for $L_2$ on $w$. If it rejects, reject.
2. If it accepts, run the recognizer for $L_1$ on $w$. Accept if it accepts.

This recognizes $L_1 \cap L_2$: if $w \in L_1 \cap L_2$, both steps succeed. If $w \notin L_2$, step 1 rejects (halts). If $w \notin L_1$ but $w \in L_2$, step 2 may loop — which is fine for a recognizer.

</details>

### Exercise 3

Show that the class of decidable languages is closed under union. Give a complete proof.

<details>
<summary>Solution</summary>

Let $L_1$ and $L_2$ be decidable with deciders $M_1$ and $M_2$.

Construct $M$ on input $w$:
1. Run $M_1$ on $w$. If $M_1$ accepts, accept.
2. Run $M_2$ on $w$. If $M_2$ accepts, accept.
3. If both reject, reject.

**Correctness:**
- If $w \in L_1 \cup L_2$, then $w \in L_1$ or $w \in L_2$, so $M_1$ or $M_2$ accepts → $M$ accepts.
- If $w \notin L_1 \cup L_2$, then both $M_1$ and $M_2$ reject → $M$ rejects.

**Halting:** $M_1$ and $M_2$ are deciders, so both always halt. Therefore $M$ always halts. ∎

</details>

### Exercise 4

Prove: if $L$ is recognizable but not decidable, then $\bar{L}$ is not recognizable.

<details>
<summary>Solution</summary>

By contrapositive of the fundamental theorem:

If both $L$ and $\bar{L}$ are recognizable, then $L$ is decidable.

Contrapositive: If $L$ is NOT decidable, then it is NOT the case that both $L$ and $\bar{L}$ are recognizable.

Since $L$ IS recognizable (given), it must be $\bar{L}$ that is NOT recognizable. ∎

</details>

### Exercise 5

Classify each language as decidable, recognizable (not decidable), co-recognizable (not decidable), or neither:

1. $\{ \langle M \rangle \mid M \text{ is a DFA with } |L(M)| < \infty \}$
2. $A_{TM} = \{ \langle M, w \rangle \mid M \text{ accepts } w \}$
3. $\overline{A_{TM}}$
4. $\{ \langle M \rangle \mid M \text{ accepts at least 5 strings} \}$

<details>
<summary>Solution</summary>

1. **Decidable** — Every DFA accepts either finitely or infinitely many strings. Check for cycles reachable from start that reach accept states.
2. **Recognizable (not decidable)** — Simulate $M$ on $w$; accept if it accepts. Cannot detect loops.
3. **Co-recognizable (not decidable)** — Complement of $A_{TM}$.
4. **Recognizable (not decidable)** — Enumerate strings, simulate $M$ on each in parallel. Accept when 5 are found to be accepted. But if $M$ accepts fewer than 5, may loop.

</details>

---

## Enumeration Characterization

There is an important equivalent way to characterize recognizable languages using **enumerators**.

### What is an Enumerator?

An enumerator is a TM with an attached "printer." It runs forever, printing strings one at a time:

$$
E: \text{prints } w_1, w_2, w_3, \ldots
$$

The language **enumerated** by $E$ is:

$$
L(E) = \{w_i \mid E \text{ prints } w_i \text{ at some point}\}
$$

Strings may be printed in any order and may repeat.

### Theorem: Recognizable iff Enumerable

> $L$ is Turing-recognizable if and only if some enumerator $E$ enumerates $L$.

**Proof (⇒): Recognizer → Enumerator**

Let $M$ recognize $L$. Build enumerator $E$:

For $i = 1, 2, 3, \ldots$:
- For each string $s_j$ with $j \leq i$:
  - Run $M$ on $s_j$ for $i$ steps
  - If $M$ accepts $s_j$ within $i$ steps, print $s_j$

This eventually prints every string in $L$ (if $M$ accepts $s_j$ in $t$ steps, then $E$ prints $s_j$ at stage $\max(j, t)$).

**Proof (⇐): Enumerator → Recognizer**

Let $E$ enumerate $L$. Build recognizer $M$:

$M$ on input $w$:
1. Run $E$ step by step
2. Each time $E$ prints a string $x$, compare $x$ to $w$
3. If $x = w$, accept

If $w \in L$, then $E$ eventually prints $w$, so $M$ accepts. If $w \notin L$, then $E$ never prints $w$, so $M$ loops forever. ∎

### Decidable via Enumeration

> $L$ is decidable if and only if some enumerator enumerates $L$ **in lexicographic order**.

If $E$ prints strings in order, we can build a decider: run $E$ until it either prints $w$ (accept) or prints something lexicographically past $w$ (reject). Since $E$ lists in order, one of these must happen.

---

## Key Takeaways

1. **Decidable** = TM always halts (yes/no answer guaranteed)
2. **Recognizable** = TM accepts members (may loop on non-members)
3. **Decidable = Recognizable ∩ Co-Recognizable** (the fundamental theorem)
4. Recognizable languages are NOT closed under complement
5. The hierarchy is strict: Decidable ⊊ Recognizable ⊊ All Languages
6. **Enumerable = Recognizable** (equivalent characterization)

---

## What's Next?

In the next lesson, we study how to **encode** computational objects (TMs, DFAs, graphs) as strings, turning questions about computation into questions about language membership. This is the bridge to proving undecidability results.
