---
title: Undecidable Problems
---

# Undecidable Problems

In the previous lesson, we proved that $A_{TM}$ and $HALT_{TM}$ are undecidable. Now we'll discover a whole zoo of undecidable problems — and learn to classify them by their recognizability properties.

The goal of this lesson is twofold: (1) build up a library of undecidable problems that serve as "starting points" for future reductions, and (2) understand the landscape of computability — not all undecidable problems are equally hard.

---

## Quick Recap: $A_{TM}$ Is Undecidable

Recall the key results:

$$A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}$$

- **Undecidable:** No TM always halts and correctly answers "does $M$ accept $w$?"
- **Recognizable:** The Universal TM $U$ can simulate $M$ on $w$ (accepts if $M$ accepts, loops if $M$ loops)
- **Not co-recognizable:** $\overline{A_{TM}}$ is not recognizable

We'll use $A_{TM}$ as our "starting undecidable problem" to prove others undecidable via reductions.

### The Reduction Strategy

To prove a new problem $B$ is undecidable:
1. Pick a known undecidable problem (usually $A_{TM}$)
2. Show how to transform any instance of $A_{TM}$ into an instance of $B$
3. The transformation must be computable and preserve yes/no answers
4. Conclude: if $B$ were decidable, $A_{TM}$ would be too — contradiction!

This technique is called **reduction**, and we'll formalize it fully in Lesson 48.

---

## The Halting Problem: $HALT_{TM}$

$$HALT_{TM} = \{\langle M, w \rangle \mid M \text{ halts on } w\}$$

Remember: "halts" means either accepts OR rejects — the machine reaches a final state either way. "Doesn't halt" means the machine runs forever (loops).

### Theorem: $HALT_{TM}$ Is Undecidable

**Proof:** We reduce $A_{TM}$ to $HALT_{TM}$.

Assume $R$ decides $HALT_{TM}$. We build a decider $S$ for $A_{TM}$:

**$S$ on input $\langle M, w \rangle$:**
1. Construct $M'$ from $M$: $M'$ behaves exactly like $M$ except that if $M$ rejects, $M'$ goes into an infinite loop instead.

   Formally, $M'$ on input $x$:
   - Simulate $M$ on $x$
   - If $M$ accepts → accept
   - If $M$ rejects → loop forever

2. Run $R(\langle M', w \rangle)$
3. If $R$ accepts → $M'$ halts on $w$ → $M$ accepts $w$ → accept
4. If $R$ rejects → $M'$ doesn't halt on $w$ → $M$ rejects $w$ → reject

**Why this works:**
- $M'$ halts on $w$ $\iff$ $M$ accepts $w$ (since rejections become loops)
- So $R$ deciding $HALT_{TM}$ lets $S$ decide $A_{TM}$
- But $A_{TM}$ is undecidable!
- Therefore $R$ cannot exist. ∎

### Properties of $HALT_{TM}$

| Property | Value |
|----------|-------|
| Decidable? | No |
| Recognizable? | Yes (simulate and wait) |
| Co-recognizable? | No |

---

## The Emptiness Problem: $E_{TM}$

$$E_{TM} = \{\langle M \rangle \mid L(M) = \emptyset\}$$

This asks: "Does the TM $M$ accept nothing at all?"

### Theorem: $E_{TM}$ Is Undecidable

**Proof:** We reduce $A_{TM}$ to $\overline{E_{TM}}$ (the complement of $E_{TM}$).

Actually, let's reduce $A_{TM}$ to $\overline{E_{TM}}$ directly:

Given $\langle M, w \rangle$ (an instance of $A_{TM}$), construct $M_1$:

**$M_1$ on input $x$:**
1. Ignore $x$ completely
2. Simulate $M$ on $w$
3. If $M$ accepts $w$ → accept $x$
4. (If $M$ rejects or loops, $M_1$ never accepts $x$)

**Analysis:**
- If $M$ accepts $w$: $M_1$ accepts everything → $L(M_1) = \Sigma^* \neq \emptyset$ → $\langle M_1 \rangle \notin E_{TM}$
- If $M$ does not accept $w$: $M_1$ accepts nothing → $L(M_1) = \emptyset$ → $\langle M_1 \rangle \in E_{TM}$

So: $\langle M, w \rangle \in A_{TM} \iff \langle M_1 \rangle \in \overline{E_{TM}}$

This means $A_{TM} \leq_m \overline{E_{TM}}$.

Since $A_{TM}$ is not decidable, $\overline{E_{TM}}$ is not decidable, which means $E_{TM}$ is not decidable. ∎

### Recognizability of $E_{TM}$

- $E_{TM}$ is **co-recognizable** (its complement $\overline{E_{TM}}$ is recognizable)
- $E_{TM}$ is **not recognizable**

Why is $\overline{E_{TM}}$ recognizable? We can enumerate all strings and simulate $M$ on each. If $M$ ever accepts any string, we accept.

---

## The Equivalence Problem: $EQ_{TM}$

$$EQ_{TM} = \{\langle M_1, M_2 \rangle \mid L(M_1) = L(M_2)\}$$

This asks: "Do two TMs recognize the same language?"

### Theorem: $EQ_{TM}$ Is Undecidable

**Proof:** Reduce $E_{TM}$ to $EQ_{TM}$.

Given $\langle M \rangle$ (an instance of $E_{TM}$), construct:
- Let $M_{\emptyset}$ be a TM that rejects all inputs (so $L(M_{\emptyset}) = \emptyset$)
- Map $\langle M \rangle$ to $\langle M, M_{\emptyset} \rangle$

Then: $L(M) = \emptyset \iff L(M) = L(M_{\emptyset}) \iff \langle M, M_{\emptyset} \rangle \in EQ_{TM}$

Since $E_{TM}$ is undecidable, $EQ_{TM}$ is undecidable. ∎

### $EQ_{TM}$ Is Neither Recognizable Nor Co-Recognizable

This is a stronger result:

**$EQ_{TM}$ is not recognizable:**
- Reduce $\overline{A_{TM}}$ to $EQ_{TM}$
- Given $\langle M, w \rangle$, construct $M_1$ (ignores input, simulates $M$ on $w$, accepts if $M$ accepts) and $M_2 = M_{\emptyset}$
- $\langle M, w \rangle \in \overline{A_{TM}} \iff L(M_1) = \emptyset = L(M_2) \iff \langle M_1, M_2 \rangle \in EQ_{TM}$
- Since $\overline{A_{TM}}$ is not recognizable, $EQ_{TM}$ is not recognizable

**$EQ_{TM}$ is not co-recognizable:**
- Reduce $A_{TM}$ to $EQ_{TM}$
- Given $\langle M, w \rangle$, construct $M_1$ (same as above) and $M_{\Sigma^*}$ (accepts everything)
- $\langle M, w \rangle \in A_{TM} \iff L(M_1) = \Sigma^* = L(M_{\Sigma^*}) \iff \langle M_1, M_{\Sigma^*} \rangle \in EQ_{TM}$
- Since $A_{TM}$ is not co-recognizable, $\overline{EQ_{TM}}$ is not recognizable

So $EQ_{TM}$ falls in the "worst" category: neither recognizable nor co-recognizable.

---

## The Regularity Problem: $REGULAR_{TM}$

$$REGULAR_{TM} = \{\langle M \rangle \mid L(M) \text{ is regular}\}$$

This asks: "Is the language of TM $M$ a regular language?"

### Theorem: $REGULAR_{TM}$ Is Undecidable

This follows immediately from **Rice's Theorem** (next lesson). But let's prove it directly:

**Proof:** Reduce $A_{TM}$ to $REGULAR_{TM}$.

Given $\langle M, w \rangle$, construct $M_2$:

**$M_2$ on input $x$:**
1. If $x$ has the form $0^n 1^n$ for some $n \geq 0$, accept
2. Otherwise, simulate $M$ on $w$
3. If $M$ accepts $w$, accept $x$

**Analysis:**
- If $M$ accepts $w$: $M_2$ accepts everything (step 2 always succeeds) → $L(M_2) = \Sigma^*$, which is regular
- If $M$ doesn't accept $w$: $M_2$ only accepts $\{0^n 1^n \mid n \geq 0\}$, which is NOT regular

So: $\langle M, w \rangle \in A_{TM} \iff \langle M_2 \rangle \in REGULAR_{TM}$

Since $A_{TM}$ is undecidable, $REGULAR_{TM}$ is undecidable. ∎

---

## The Universality Problem: $ALL_{TM}$

$$ALL_{TM} = \{\langle M \rangle \mid L(M) = \Sigma^*\}$$

This asks: "Does $M$ accept every possible string?"

### Theorem: $ALL_{TM}$ Is Undecidable and Not Recognizable

**$ALL_{TM}$ is not recognizable** (but it IS co-recognizable):

**Proof:** Reduce $\overline{A_{TM}}$ to $ALL_{TM}$.

Given $\langle M, w \rangle$, construct $M'$:

**$M'$ on input $x$:**
1. Simulate $M$ on $w$
2. If $M$ accepts $w$ → accept $x$
3. (Otherwise loop)

Wait — this makes $L(M') = \Sigma^*$ when $M$ accepts $w$, and $L(M') = \emptyset$ when $M$ doesn't. That's a reduction from $A_{TM}$ to $ALL_{TM}$, showing $ALL_{TM}$ is not co-recognizable.

For not recognizable, we use a different construction. We reduce $\overline{A_{TM}}$ to $ALL_{TM}$:

Given $\langle M, w \rangle$, construct $M'$:
- $M'$ on input $x$: run $M$ on $w$ for $|x|$ steps. If $M$ hasn't accepted yet, accept $x$. If $M$ accepted, reject $x$.

Then:
- If $M$ doesn't accept $w$: $M'$ accepts everything → $\langle M' \rangle \in ALL_{TM}$
- If $M$ accepts $w$ (say in $k$ steps): $M'$ rejects strings of length $\geq k$ → $\langle M' \rangle \notin ALL_{TM}$

So $\overline{A_{TM}} \leq_m ALL_{TM}$. Since $\overline{A_{TM}}$ is not recognizable, $ALL_{TM}$ is not recognizable. ∎

$ALL_{TM}$ is co-recognizable: enumerate strings, simulate $M$ on each; if $M$ rejects any, we know $\langle M \rangle \notin ALL_{TM}$.

---

## Complete Classification

Here's the full picture of decidability for language problems:

### Decidable Problems

These are the "easy" ones — they all involve DFAs or CFGs:

| Problem | Definition | Why Decidable |
|---------|-----------|--------------|
| $A_{DFA}$ | Does DFA $D$ accept $w$? | Simulate $D$ on $w$ |
| $E_{DFA}$ | Is $L(D) = \emptyset$? | Mark reachable states |
| $EQ_{DFA}$ | Is $L(D_1) = L(D_2)$? | Minimize and compare |
| $A_{CFG}$ | Does CFG $G$ generate $w$? | CYK algorithm |
| $E_{CFG}$ | Is $L(G) = \emptyset$? | Mark productive variables |

### Recognizable But Not Decidable

| Problem | Definition |
|---------|-----------|
| $A_{TM}$ | Does $M$ accept $w$? |
| $HALT_{TM}$ | Does $M$ halt on $w$? |
| $\overline{E_{TM}}$ | Is $L(M) \neq \emptyset$? |

### Co-Recognizable But Not Recognizable

| Problem | Definition |
|---------|-----------|
| $\overline{A_{TM}}$ | Does $M$ not accept $w$? |
| $\overline{HALT_{TM}}$ | Does $M$ loop on $w$? |
| $E_{TM}$ | Is $L(M) = \emptyset$? |
| $ALL_{TM}$ | Is $L(M) = \Sigma^*$? |

### Neither Recognizable Nor Co-Recognizable

| Problem | Definition |
|---------|-----------|
| $EQ_{TM}$ | Is $L(M_1) = L(M_2)$? |
| $REGULAR_{TM}$ | Is $L(M)$ regular? |

---

## The Pattern

Notice a clear pattern:

> **Questions about finite automata and context-free grammars are usually decidable. Questions about Turing machines are usually undecidable.**

Why? DFAs and CFGs are restricted enough that we can analyze them completely. Turing machines are too powerful — they can simulate anything, including self-reference.

### Exceptions

Some TM questions ARE decidable:
- "Does $M$ have exactly 5 states?" (syntactic property of the description)
- "Does $M$'s transition function use the blank symbol?" (syntactic)

These are questions about the **machine** (its syntax), not about its **language** (its behavior). Rice's Theorem (next lesson) makes this distinction precise.

---

## Proof Technique Summary

To prove a problem $B$ undecidable:

1. **Choose a known undecidable problem $A$** (usually $A_{TM}$)
2. **Reduce $A$ to $B$:** show $A \leq_m B$
3. **Construction:** given an instance of $A$, build an instance of $B$
4. **Correctness:** prove yes-instances map to yes-instances, no to no
5. **Conclude:** since $A$ is undecidable and $A \leq_m B$, $B$ is undecidable

The hard part is step 3: **constructing the right TM**.

### Template for Reductions from $A_{TM}$

Most reductions from $A_{TM}$ follow this pattern:

Given $\langle M, w \rangle$, construct $M'$:

**$M'$ on input $x$:**
1. [Maybe check some property of $x$]
2. Simulate $M$ on $w$
3. If $M$ accepts $w$, do something based on what we want $L(M')$ to be
4. Otherwise, do something else

The key idea: **embed the question "does $M$ accept $w$?" into the behavior of $M'$**.

---

## Undecidability Beyond TMs

Some problems from other areas of mathematics and computer science are also undecidable:

| Problem | Domain | Year Proved |
|---------|--------|-------------|
| Hilbert's 10th problem | Diophantine equations | 1970 |
| Word problem for groups | Group theory | 1955 |
| Post Correspondence Problem | String combinatorics | 1946 |
| Wang tiling | Geometry/tilings | 1966 |
| Mortality problem | Matrix theory | 1970 |
| Reachability in Petri nets | Concurrency theory | 1976 |

These connections show that undecidability is not just a "computer science thing" — it's a fundamental mathematical phenomenon that appears throughout all of mathematics.

The Post Correspondence Problem (Lesson 50) is particularly important because it provides a convenient "bridge" for proving undecidability of grammar and language problems.

---

## Dovetailing: A Key Technique

Many recognizability results use **dovetailing** — running multiple computations interleaved.

### Why Dovetailing Is Needed

To recognize $\overline{E_{TM}}$, we want to find SOME string accepted by $M$. But if we try strings one by one:
- Run $M$ on $\epsilon$... might loop forever!
- We'd never get to try the next string.

### The Solution: Dovetailing

Instead, interleave computations:
- Step 1: Run $M$ on $s_1$ for 1 step
- Step 2: Run $M$ on $s_1$ for 2 steps, $M$ on $s_2$ for 1 step
- Step 3: Run $M$ on $s_1$ for 3 steps, $M$ on $s_2$ for 2 steps, $M$ on $s_3$ for 1 step
- ...

If $M$ accepts ANY string $s_i$ (in $k$ steps), we'll discover this at stage $\max(i, k)$.

This is how we recognize $\overline{E_{TM}}$: if $L(M) \neq \emptyset$, dovetailing will eventually find an accepted string.

---

## The Arithmetic Hierarchy (Preview)

The classification we've developed is the beginning of the **arithmetic hierarchy**:

$$\Sigma_0^0 = \Pi_0^0 = \Delta_0^0 = \text{Decidable}$$

$$\Sigma_1^0 = \text{Recognizable (r.e.)}$$

$$\Pi_1^0 = \text{Co-recognizable (co-r.e.)}$$

Problems like $EQ_{TM}$ that are neither recognizable nor co-recognizable live at level $\Sigma_2^0$ or higher. The hierarchy continues infinitely, with each level strictly more powerful than the one below.

---

## Try It Yourself

### Exercise 1: Prove Undecidability

Prove that the following is undecidable:

$$INFINITE_{TM} = \{\langle M \rangle \mid L(M) \text{ is infinite}\}$$

*Hint: Reduce from $A_{TM}$. Construct $M'$ so that $L(M')$ is infinite iff $M$ accepts $w$.*

### Exercise 2: Classify

For each problem, determine: Decidable? Recognizable? Co-recognizable?

a) $\{\langle M \rangle \mid M \text{ accepts } \epsilon\}$

b) $\{\langle M \rangle \mid M \text{ halts on all inputs}\}$

c) $\{\langle M_1, M_2 \rangle \mid L(M_1) \subseteq L(M_2)\}$

d) $\{\langle D \rangle \mid D \text{ is a DFA and } L(D) = \Sigma^*\}$

### Exercise 3: Find the Bug

Here's a "proof" that $E_{DFA}$ is undecidable. Find the error:

"Reduce $E_{TM}$ to $E_{DFA}$. Given $\langle M \rangle$, convert $M$ to a DFA $D$ with $L(D) = L(M)$. Then $L(M) = \emptyset$ iff $L(D) = \emptyset$."

### Exercise 4: The Accept-Everything Problem

Prove: $\{\langle M \rangle \mid M \text{ accepts } w \text{ for some } w \text{ with } |w| \leq 100\}$ is decidable.

*Hint: How many strings of length $\leq 100$ are there over a finite alphabet?*

### Exercise 5: Reduction Direction

Why can't we prove $A_{DFA}$ undecidable by reducing it TO $A_{TM}$? (After all, every DFA is a special case of a TM.)

### Exercise 6: Co-Recognizability

Prove that $E_{TM}$ is co-recognizable by describing a TM that recognizes $\overline{E_{TM}}$.

*Hint: Dovetail simulation of $M$ on all possible inputs.*

### Exercise 7: Intersection

Prove that the following is undecidable:

$$\{\langle M_1, M_2 \rangle \mid L(M_1) \cap L(M_2) \neq \emptyset\}$$

*Hint: Reduce from $A_{TM}$. Let one of the TMs be simple.*

### Exercise 8: True or False?

Determine if each statement is true or false, and justify:

a) If $L$ is recognizable and $L$ is infinite, then $L$ is decidable.

b) If $L$ is decidable, then $\overline{L}$ is decidable.

c) If $L_1$ and $L_2$ are both recognizable, then $L_1 \cap L_2$ is recognizable.

d) If $L$ is recognizable but not decidable, then $\overline{L}$ is not recognizable.

e) There exists a language that is neither recognizable nor co-recognizable.

---

## Practice: Building Reductions

### Template for Proving "$\{\langle M \rangle \mid P(L(M))\}$ is undecidable"

1. Identify what $L(M')$ should be in each case:
   - If $M$ accepts $w$: $L(M')$ should satisfy $P$
   - If $M$ doesn't accept $w$: $L(M')$ should NOT satisfy $P$

2. Construct $M'$ accordingly

3. Verify both directions

### Worked Example: $\{\langle M \rangle \mid 101 \in L(M)\}$

**Reduction from $A_{TM}$:**

Given $\langle M, w \rangle$, construct $M'$:
- $M'$ on input $x$: ignore $x$, simulate $M$ on $w$
- If $M$ accepts $w$ → accept

Analysis:
- $M$ accepts $w$ → $L(M') = \Sigma^*$, so $101 \in L(M')$ → $\langle M' \rangle \in L_P$ ✓
- $M$ doesn't accept $w$ → $L(M') = \emptyset$, so $101 \notin L(M')$ → $\langle M' \rangle \notin L_P$ ✓

Therefore undecidable. ∎

---

## Summary

| Problem | Decidable | Recognizable | Co-Recognizable |
|---------|-----------|-------------|----------------|
| $A_{DFA}$, $E_{DFA}$ | ✓ | ✓ | ✓ |
| $A_{TM}$, $HALT_{TM}$ | ✗ | ✓ | ✗ |
| $E_{TM}$, $ALL_{TM}$ | ✗ | ✗ | ✓ |
| $EQ_{TM}$ | ✗ | ✗ | ✗ |

Key insight: undecidability is not one category — there are *degrees* of undecidability.

---

## Connecting to the Real World

### Why Does This Classification Matter?

Understanding where a problem falls tells you what approaches are possible:

| Category | What You Can Do |
|----------|----------------|
| Decidable | Build a complete algorithm |
| Recognizable | Build a semi-algorithm (finds solutions, may not detect non-solutions) |
| Co-recognizable | Build a semi-algorithm for the complement (detects non-solutions, may not find solutions) |
| Neither | No algorithmic approach of any kind |

### Software Engineering Implications

- **Testing frameworks** can detect bugs (recognizing $\overline{E_{TM}}$-like) but can't prove absence of all bugs
- **Model checkers** work for finite-state systems (decidable) but not arbitrary programs
- **Abstract interpretation** deliberately over-approximates to stay decidable

---

## What's Next?

We've seen specific undecidable problems. Next, we'll formalize the technique we've been using — **reducibility** — and study its properties systematically. You'll learn how to construct reductions efficiently and understand the complete theory behind them.

Understanding reducibility deeply will make you much faster at proving undecidability results and will prepare you for Rice's Theorem (which eliminates the need for individual proofs entirely!).

Next lesson: **Reducibility** →
