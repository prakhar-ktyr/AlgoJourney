---
title: Reducibility
---

# Reducibility

**Reducibility** is the most important technique for proving problems undecidable. The idea is simple: if you can transform one problem into another, then the second problem is at least as hard as the first.

---

## The Core Idea

A **reduction** from problem $A$ to problem $B$ is a way to convert any instance of $A$ into an instance of $B$, such that the answer is preserved.

Think of it this way:

> "If I could solve $B$, I could solve $A$ too."

Equivalently:

> "Problem $A$ is no harder than problem $B$."

Or contrapositively:

> "If $A$ is hard (undecidable), then $B$ must be at least as hard."

This is the engine behind all undecidability proofs we've seen so far.

### Everyday Analogy

Suppose you want to know if it's raining outside (problem $A$). You reduce this to checking if people on the street have umbrellas (problem $B$):

- People have umbrellas → it's raining (yes → yes)
- People don't have umbrellas → it's not raining (no → no)

Solving $B$ gives you the answer to $A$.

---

## Formal Definition: Mapping Reduction

**Definition:** Language $A$ is **mapping reducible** to language $B$, written $A \leq_m B$, if there exists a computable function $f: \Sigma^* \to \Sigma^*$ such that for every $w$:

$$w \in A \iff f(w) \in B$$

The function $f$ is called the **reduction function** (or **mapping**).

### What This Means

- $f$ transforms instances of $A$ into instances of $B$
- $f$ must be computable (a TM can compute it)
- $f$ must preserve membership: yes-instances map to yes-instances, no-instances map to no-instances
- $f$ does NOT need to be injective (one-to-one) or surjective (onto)

### Visual Picture

$$\boxed{A} \xrightarrow{f} \boxed{B}$$

$$w \in A \xrightarrow{f} f(w) \in B$$
$$w \notin A \xrightarrow{f} f(w) \notin B$$

---

## Key Properties of $\leq_m$

### Theorem 1: Decidability Transfers Down

If $A \leq_m B$ and $B$ is decidable, then $A$ is decidable.

**Proof:** Let $D_B$ decide $B$ and $f$ be the reduction function.

Build decider $D_A$ for $A$:
- On input $w$: compute $f(w)$, then run $D_B(f(w))$, output whatever $D_B$ outputs.

Since $w \in A \iff f(w) \in B$, and $D_B$ correctly decides membership in $B$, $D_A$ correctly decides membership in $A$. ∎

### Theorem 2: Undecidability Transfers Up (Contrapositive)

If $A \leq_m B$ and $A$ is undecidable, then $B$ is undecidable.

**Proof:** Contrapositive of Theorem 1. If $B$ were decidable, then $A$ would be decidable (by Theorem 1). But $A$ is undecidable. Contradiction. ∎

### Theorem 3: Recognizability Transfers Down

If $A \leq_m B$ and $B$ is recognizable, then $A$ is recognizable.

**Proof:** Similar to Theorem 1, using a recognizer instead of a decider. ∎

### Theorem 4: Non-Recognizability Transfers Up

If $A \leq_m B$ and $A$ is not recognizable, then $B$ is not recognizable.

**Proof:** Contrapositive of Theorem 3. ∎

### Theorem 5: Transitivity

If $A \leq_m B$ and $B \leq_m C$, then $A \leq_m C$.

**Proof:** If $f$ reduces $A$ to $B$ and $g$ reduces $B$ to $C$, then $g \circ f$ reduces $A$ to $C$:

$$w \in A \iff f(w) \in B \iff g(f(w)) \in C$$

The composition $g \circ f$ is computable since both $f$ and $g$ are. ∎

---

## The Direction Matters!

This is the most common source of confusion. Let's be very clear:

$$A \leq_m B \text{ means: } A \text{ reduces TO } B$$

- **$B$ is at least as hard as $A$** (or: $A$ is no harder than $B$)
- A solution to $B$ gives a solution to $A$
- Undecidability flows **from $A$ to $B$** (upward)
- Decidability flows **from $B$ to $A$** (downward)

### Common Mistake

To prove $B$ undecidable:
- ✓ Correct: Reduce known undecidable $A$ TO $B$ (show $A \leq_m B$)
- ✗ Wrong: Reduce $B$ to known undecidable $A$ (this shows $B \leq_m A$, which only means $A$ is hard)

Remember: **reduce FROM the known TO the unknown**.

---

## Reduction Example 1: $A_{TM} \leq_m HALT_{TM}$

We want to show $A_{TM}$ reduces to $HALT_{TM}$.

**Reduction function $f$:**

On input $\langle M, w \rangle$:
1. Construct $M'$:
   - $M'$ on input $x$: simulate $M$ on $x$
   - If $M$ accepts → accept (halt)
   - If $M$ rejects → enter infinite loop (don't halt)
2. Output $\langle M', w \rangle$

**Correctness:**

- If $\langle M, w \rangle \in A_{TM}$ (i.e., $M$ accepts $w$):
  - $M'$ on $w$ will accept (and halt)
  - So $\langle M', w \rangle \in HALT_{TM}$ ✓

- If $\langle M, w \rangle \notin A_{TM}$ (i.e., $M$ doesn't accept $w$):
  - Either $M$ rejects $w$ → $M'$ loops → $\langle M', w \rangle \notin HALT_{TM}$ ✓
  - Or $M$ loops on $w$ → $M'$ also loops → $\langle M', w \rangle \notin HALT_{TM}$ ✓

Therefore $f$ is a valid reduction: $\langle M, w \rangle \in A_{TM} \iff f(\langle M, w \rangle) \in HALT_{TM}$ ∎

---

## Reduction Example 2: $A_{TM} \leq_m \overline{E_{TM}}$

We reduce $A_{TM}$ to $\overline{E_{TM}} = \{\langle M \rangle \mid L(M) \neq \emptyset\}$.

**Reduction function $f$:**

On input $\langle M, w \rangle$:
1. Construct $M'$:
   - $M'$ on input $x$: ignore $x$, simulate $M$ on $w$
   - If $M$ accepts $w$ → accept
   - (Otherwise loop)
2. Output $\langle M' \rangle$

**Correctness:**

- If $M$ accepts $w$: $M'$ accepts everything → $L(M') = \Sigma^* \neq \emptyset$ → $\langle M' \rangle \in \overline{E_{TM}}$ ✓
- If $M$ doesn't accept $w$: $M'$ accepts nothing → $L(M') = \emptyset$ → $\langle M' \rangle \notin \overline{E_{TM}}$ ✓

Therefore $A_{TM} \leq_m \overline{E_{TM}}$, proving $\overline{E_{TM}}$ is undecidable (and hence $E_{TM}$ is undecidable). ∎

---

## Reduction Example 3: $A_{TM} \leq_m EQ_{TM}$

We reduce $A_{TM}$ to $EQ_{TM} = \{\langle M_1, M_2 \rangle \mid L(M_1) = L(M_2)\}$.

**Reduction function $f$:**

On input $\langle M, w \rangle$:
1. Construct $M_1$: $M_1$ rejects all inputs (so $L(M_1) = \emptyset$)
2. Construct $M_2$:
   - $M_2$ on input $x$: simulate $M$ on $w$
   - If $M$ accepts $w$ → accept $x$
   - (Otherwise loop)
3. Output $\langle M_1, M_2 \rangle$

Wait — let's check the direction. We need:

$\langle M, w \rangle \in A_{TM} \iff \langle M_1, M_2 \rangle \in EQ_{TM}$?

- If $M$ accepts $w$: $L(M_2) = \Sigma^*$, $L(M_1) = \emptyset$. These are NOT equal. So $\langle M_1, M_2 \rangle \notin EQ_{TM}$.

That's the wrong direction! Let's fix it:

**Better approach:** Reduce $A_{TM}$ to $\overline{EQ_{TM}}$.

Or alternatively, reduce $\overline{A_{TM}}$ to $EQ_{TM}$:

On input $\langle M, w \rangle$:
1. Construct $M_1$: rejects everything ($L(M_1) = \emptyset$)
2. Construct $M_2$: ignores input, simulates $M$ on $w$, accepts if $M$ accepts
3. Output $\langle M_1, M_2 \rangle$

- If $M$ doesn't accept $w$: $L(M_2) = \emptyset = L(M_1)$ → $\langle M_1, M_2 \rangle \in EQ_{TM}$ ✓
- If $M$ accepts $w$: $L(M_2) = \Sigma^* \neq \emptyset = L(M_1)$ → $\langle M_1, M_2 \rangle \notin EQ_{TM}$ ✓

So $\overline{A_{TM}} \leq_m EQ_{TM}$. Since $\overline{A_{TM}}$ is not recognizable, $EQ_{TM}$ is not recognizable. ∎

---

## How to Construct Reductions: The "Gadget" Approach

Building reductions is a creative process. Here's a systematic approach:

### Step-by-Step Method

1. **Identify the source problem** (usually $A_{TM}$)
2. **Understand the target problem** — what does a "yes" instance look like?
3. **Design the gadget:** Given $\langle M, w \rangle$, construct a TM $M'$ whose behavior depends on whether $M$ accepts $w$
4. **Set up the correspondence:**
   - $M$ accepts $w$ → $M'$ has property $P$ (making it a yes-instance of target)
   - $M$ doesn't accept $w$ → $M'$ doesn't have property $P$
5. **Verify both directions** carefully

### The Standard Gadget Template

Most reductions from $A_{TM}$ use this template:

**$M'$ on input $x$:**
1. [Optional: check some structural property of $x$]
2. Simulate $M$ on $w$
3. If $M$ accepts: [do something that gives $M'$ the desired property]
4. If $M$ rejects/loops: [do something that gives $M'$ the opposite property]

### Common Patterns

| Target Language | $M'$ if $M$ accepts $w$ | $M'$ if $M$ doesn't |
|----------------|--------------------------|---------------------|
| $L(M') = \emptyset$? | $L(M') \neq \emptyset$ | $L(M') = \emptyset$ |
| $L(M')$ regular? | $L(M')$ is regular | $L(M')$ not regular |
| $L(M') = \Sigma^*$? | $L(M') = \Sigma^*$ | $L(M') \neq \Sigma^*$ |
| $L(M')$ finite? | $L(M')$ infinite | $L(M')$ finite |

---

## Properties of Mapping Reductions

### What $\leq_m$ Preserves

| If $A \leq_m B$ and... | Then... |
|------------------------|---------|
| $B$ is decidable | $A$ is decidable |
| $B$ is recognizable | $A$ is recognizable |
| $A$ is undecidable | $B$ is undecidable |
| $A$ is unrecognizable | $B$ is unrecognizable |

### What $\leq_m$ Does NOT Tell You

- $A \leq_m B$ does NOT mean $B \leq_m A$ (reductions are not symmetric)
- $A \leq_m B$ does NOT mean $A$ and $B$ have the same difficulty (only that $B \geq A$)

### Complement Behavior

If $A \leq_m B$ via function $f$, then $\overline{A} \leq_m \overline{B}$ via the SAME function $f$.

**Proof:** $w \in \overline{A} \iff w \notin A \iff f(w) \notin B \iff f(w) \in \overline{B}$ ✓

This is useful! It means:
- If $A \leq_m B$ and $\overline{A}$ is not recognizable → $\overline{B}$ is not recognizable

---

## Turing Reductions (Oracle Reductions)

Mapping reductions are the "standard" type, but there's a more powerful version.

### Definition

$A$ is **Turing reducible** to $B$, written $A \leq_T B$, if there exists an oracle TM $M^B$ that decides $A$ using $B$ as an oracle.

An **oracle** for $B$ is a magical black box that instantly answers "is $x \in B$?" for any $x$.

### Key Differences from Mapping Reductions

| Property | Mapping ($\leq_m$) | Turing ($\leq_T$) |
|----------|--------------------|--------------------|
| Calls to oracle | Exactly 1 (implicit) | Any number |
| Can negate oracle answer | No | Yes |
| Preserves recognizability | Yes | Not necessarily |
| Power | Weaker | Stronger |

### Example

$A_{TM} \leq_T \overline{A_{TM}}$: Given oracle for $\overline{A_{TM}}$, to decide if $\langle M, w \rangle \in A_{TM}$, just query the oracle and flip the answer.

But $A_{TM} \not\leq_m \overline{A_{TM}}$! (Because $A_{TM}$ is recognizable but $\overline{A_{TM}}$ is not, and mapping reductions preserve recognizability.)

### When to Use Which

- **Mapping reductions** ($\leq_m$): sufficient for most undecidability proofs; simpler; preserve more properties
- **Turing reductions** ($\leq_T$): more natural; more powerful; used in complexity theory (e.g., NP-completeness uses polynomial-time Turing reductions)

---

## Reduction Hierarchy

The relationship between problems forms a hierarchy:

$$\text{Decidable} \subset \text{Recognizable} \subset \text{All Languages}$$

Reductions help us place problems in this hierarchy:

```
Most Undecidable    EQ_TM (neither recognizable nor co-recognizable)
        ↑
  Undecidable       A_TM, HALT_TM (recognizable, not decidable)
        ↑
    Decidable       A_DFA, E_CFG (decidable)
```

Each level is "harder" than the one below. Reductions go upward (from easier to harder).

### Formal Relationships

We can express the containment as:

$$\text{Decidable} = \text{RE} \cap \text{co-RE}$$

where RE = recognizable and co-RE = co-recognizable.

A language is decidable if and only if it's in BOTH classes simultaneously. This gives us:

- $A_{TM} \in \text{RE} \setminus \text{co-RE}$
- $\overline{A_{TM}} \in \text{co-RE} \setminus \text{RE}$
- $EQ_{TM} \notin \text{RE} \cup \text{co-RE}$

---

## Common Pitfalls

### Pitfall 1: Wrong Direction

"I reduced $HALT_{TM}$ to my problem, so my problem is undecidable."

This is correct! But students often get confused and reduce their problem to $HALT_{TM}$ instead. That only shows their problem is no harder than $HALT_{TM}$ — which tells us nothing useful.

### Pitfall 2: Non-Computable Reduction

The function $f$ must be computable! You can't use a reduction function that itself requires solving an undecidable problem.

### Pitfall 3: Only Checking One Direction

You must verify BOTH:
- $w \in A \implies f(w) \in B$
- $w \notin A \implies f(w) \notin B$

Students often prove only one direction and assume the other.

### Pitfall 4: Confusing the TM and Its Language

When constructing $M'$ in a reduction, remember:
- $M'$ is a TM we're *building* (its description is the output of $f$)
- $L(M')$ is determined by $M'$'s behavior, which depends on whether $M$ accepts $w$
- We never actually RUN $M'$ during the reduction — we just OUTPUT its description

---

## Try It Yourself

### Exercise 1: Basic Reduction

Prove that $\{\langle M \rangle \mid M \text{ accepts } \epsilon\}$ is undecidable.

*Hint: Reduce from $A_{TM}$. Given $\langle M, w \rangle$, construct $M'$ that ignores its input...*

### Exercise 2: To $\leq_m$ or Not to $\leq_m$?

For each pair, determine if $A \leq_m B$, $B \leq_m A$, both, or neither:

a) $A = A_{TM}$, $B = HALT_{TM}$

b) $A = A_{DFA}$, $B = A_{TM}$

c) $A = EQ_{TM}$, $B = A_{TM}$

### Exercise 3: Transitivity Application

Given that $A_{TM} \leq_m HALT_{TM}$ and $HALT_{TM} \leq_m E_{TM}$, what can you conclude about $A_{TM}$ and $E_{TM}$?

### Exercise 4: Build a Reduction

Prove undecidable: $\{\langle M \rangle \mid |L(M)| = 5\}$ (the language of $M$ contains exactly 5 strings).

*Hint: Reduce from $A_{TM}$. Make $L(M')$ be either a 5-element set or $\emptyset$ depending on whether $M$ accepts $w$.*

### Exercise 5: Complement Trick

Given $A_{TM} \leq_m HALT_{TM}$, what can you conclude about $\overline{A_{TM}}$ and $\overline{HALT_{TM}}$?

### Exercise 6: Why Mapping?

Give an example where $A \leq_T B$ but $A \not\leq_m B$. Explain why the mapping reduction fails.

*Hint: Consider $A_{TM}$ and $\overline{A_{TM}}$.*

### Exercise 7: Multiple Reductions

Show that $E_{TM} \leq_m EQ_{TM}$ by constructing an explicit reduction function.

*Hint: Compare $M$ with a TM that rejects everything.*

### Exercise 8: Decidable Reductions

Show that $A_{DFA} \leq_m A_{TM}$.

Is this useful for proving anything? Why or why not?

---

## Advanced Topic: Completeness

A language $B$ is **complete** for a class $\mathcal{C}$ (under $\leq_m$ reductions) if:
1. $B \in \mathcal{C}$
2. For every $A \in \mathcal{C}$: $A \leq_m B$

### Examples

- $A_{TM}$ is **complete for RE** (the class of recognizable languages)
  - Every recognizable language reduces to $A_{TM}$
  - $A_{TM}$ is the "hardest" recognizable language

- $\overline{A_{TM}}$ is **complete for co-RE**

Complete problems capture the "essence" of their complexity class.

---

## Reduction Cookbook

Here's a quick reference for common reduction strategies:

### Strategy A: "Gate" Construction

Make $M'$ accept based on whether $M$ accepts $w$:

```
M'(x):
  Simulate M on w
  If M accepts: [accept/reject based on x]
  If M doesn't accept: [opposite behavior]
```

### Strategy B: "Conditional Language" Construction

Make $L(M')$ switch between two languages:

```
M'(x):
  Simulate M on w
  If M accepts: simulate M_yes on x
  If M doesn't: simulate M_no on x  (or just loop)
```

Choose $M_{yes}$ and $M_{no}$ so that $L(M_{yes}) \in P$ and $L(M_{no}) \notin P$.

### Strategy C: "Bounded Simulation" Construction

Use the length of input as a "clock":

```
M'(x):
  Simulate M on w for |x| steps
  If M accepted: [do something with x]
  If M hasn't accepted yet: [do something else]
```

This is useful when you need $L(M')$ to be infinite vs. finite.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| $A \leq_m B$ | Computable $f$ with $w \in A \iff f(w) \in B$ |
| Direction | Reduce FROM known undecidable TO target |
| Decidability | Flows down ($B$ decidable → $A$ decidable) |
| Undecidability | Flows up ($A$ undecidable → $B$ undecidable) |
| Transitivity | $A \leq_m B \leq_m C \implies A \leq_m C$ |
| Gadget method | Construct $M'$ whose language depends on $M$ accepting $w$ |

---

## What's Next?

We've been proving individual problems undecidable with custom reductions. Next, we'll see **Rice's Theorem** — a powerful meta-theorem that proves infinitely many problems undecidable in one shot!

Next lesson: **Rice's Theorem** →
