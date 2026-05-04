---
title: Rice's Theorem
---

# Rice's Theorem

**Rice's Theorem** is one of the most powerful results in computability theory. It says that you cannot decide ANYTHING interesting about what a Turing machine's language is. Every non-trivial question about TM languages is undecidable.

One theorem to rule them all — Rice's Theorem replaces dozens of individual undecidability proofs with a single, elegant argument.

---

## Motivation

In previous lessons, we proved individual problems undecidable:
- Is $L(M) = \emptyset$? (Lesson 47)
- Is $L(M)$ regular? (Lesson 47)
- Is $L(M) = \Sigma^*$? (Lesson 47)
- Is $L(M)$ finite? (Lesson 48 exercises)

Each required a separate reduction proof. Rice's Theorem kills them all with one stroke.

It's one of the most satisfying results in theory: a single theorem that provides a blanket undecidability guarantee for an infinite family of problems. Once you learn it, you'll never need to write another reduction for a pure language property again.

---

## Prerequisites

Before diving in, make sure you understand:

- **$A_{TM}$ is undecidable** (Lesson 46)
- **Mapping reductions** $A \leq_m B$ (Lesson 48)
- **If $A$ is undecidable and $A \leq_m B$, then $B$ is undecidable** (the core technique)
- **What it means for a TM to recognize a language** ($L(M) = \{w \mid M \text{ accepts } w\}$)

---

## What Is a "Property of Languages"?

A **property** $P$ of recursively enumerable (r.e.) languages is simply a set of r.e. languages.

We say language $L$ "has property $P$" if $L \in P$.

Think of $P$ as a "yes/no question" about a language. The set $P$ contains all languages for which the answer is "yes."

### Examples

| Property $P$ | Which languages are in $P$? |
|-------------|---------------------------|
| "Is empty" | $P = \{\emptyset\}$ |
| "Is regular" | $P = \{L \mid L \text{ is regular}\}$ |
| "Contains $\epsilon$" | $P = \{L \mid \epsilon \in L\}$ |
| "Is finite" | $P = \{L \mid L \text{ is finite}\}$ |
| "Equals $\Sigma^*$" | $P = \{\Sigma^*\}$ |
| "Is context-free" | $P = \{L \mid L \text{ is context-free}\}$ |

### The Associated Decision Problem

For any property $P$, we define:

$$L_P = \{\langle M \rangle \mid L(M) \in P\}$$

This is the set of TM descriptions whose language has property $P$.

---

## Trivial vs. Non-Trivial Properties

A property $P$ is **trivial** if:
- $P = \emptyset$ (no r.e. language has it), OR
- $P$ = all r.e. languages (every r.e. language has it)

A property is **non-trivial** if it is neither of these — some r.e. languages have it and some don't.

### Examples of Trivial Properties

- "Is a set of strings" → every language satisfies this → trivial ($P$ = all)
- "Contains a string that is not a string" → impossible → trivial ($P = \emptyset$)

### Examples of Non-Trivial Properties

- "Is empty" — some TMs have empty languages, some don't → non-trivial
- "Is regular" — some TMs recognize regular languages, some don't → non-trivial
- "Is infinite" — some TM languages are infinite, some aren't → non-trivial

---

## Statement of Rice's Theorem

### Informal Version

> Every non-trivial property of the language of a Turing machine is undecidable.

In other words: if you can think of ANY interesting yes/no question about $L(M)$, there is no algorithm to answer it for all TMs.

### Formal Version

**Theorem (Rice, 1953):** Let $P$ be a non-trivial property of r.e. languages. Then:

$$L_P = \{\langle M \rangle \mid L(M) \in P\}$$

is undecidable.

### What This Means

You CANNOT build an algorithm that takes a TM description $\langle M \rangle$ and correctly determines whether $L(M)$ has property $P$ — for ANY non-trivial $P$.

---

## Intuition

Why should this be true?

The key insight: to determine a property of $L(M)$, you'd need to know what $M$ accepts. But knowing what $M$ accepts requires solving $A_{TM}$ (essentially), which is undecidable.

More precisely: we can always "embed" the question "does $M$ accept $w$?" into the question "does $L(M')$ have property $P$?" — because we can construct $M'$ whose language is either in $P$ or not, depending on whether $M$ accepts $w$.

---

## Proof of Rice's Theorem

**Proof:** We reduce $A_{TM}$ to $L_P$.

**Setup:** Since $P$ is non-trivial:
- There exists some r.e. language in $P$ (call it $L_0$, recognized by TM $M_0$)
- There exists some r.e. language NOT in $P$

Without loss of generality, assume $\emptyset \notin P$.

(If $\emptyset \in P$, we work with the complement property $\overline{P}$ instead. Since $P$ is non-trivial, $\overline{P}$ is also non-trivial. And $L_P$ is decidable iff $L_{\overline{P}}$ is decidable.)

So we have:
- $\emptyset \notin P$ (the empty language does NOT have property $P$)
- $L_0 \in P$ (some specific language DOES have property $P$)
- $M_0$ recognizes $L_0$

**Reduction:** Given $\langle M, w \rangle$ (an instance of $A_{TM}$), construct $M'$:

**$M'$ on input $x$:**
1. Simulate $M$ on $w$
2. If $M$ accepts $w$: simulate $M_0$ on $x$, accept if $M_0$ accepts
3. (If $M$ doesn't accept $w$: $M'$ never reaches step 2, so it loops/rejects)

**Analysis of $L(M')$:**

**Case 1:** $M$ accepts $w$
- $M'$ reaches step 2 for every input $x$
- $M'$ accepts $x$ iff $M_0$ accepts $x$
- So $L(M') = L(M_0) = L_0$
- Since $L_0 \in P$: $\langle M' \rangle \in L_P$ ✓

**Case 2:** $M$ does not accept $w$ (rejects or loops)
- $M'$ never reaches step 2
- $M'$ never accepts anything
- So $L(M') = \emptyset$
- Since $\emptyset \notin P$: $\langle M' \rangle \notin L_P$ ✓

**Conclusion:**

$$\langle M, w \rangle \in A_{TM} \iff \langle M' \rangle \in L_P$$

This is a valid mapping reduction: $A_{TM} \leq_m L_P$.

Since $A_{TM}$ is undecidable, $L_P$ is undecidable. ∎

---

## Understanding the Proof Step by Step

Let's walk through it concretely with $P$ = "is non-empty":

1. $P = \{L \mid L \neq \emptyset\}$ — property of being non-empty
2. $L_P = \{\langle M \rangle \mid L(M) \neq \emptyset\} = \overline{E_{TM}}$
3. $\emptyset \notin P$ ✓ (the empty language is not non-empty)
4. Choose $L_0 = \Sigma^*$ (which is in $P$), with $M_0$ accepting everything
5. Given $\langle M, w \rangle$, build $M'$:
   - $M'(x)$: simulate $M$ on $w$; if accepts, accept $x$
6. If $M$ accepts $w$: $L(M') = \Sigma^* \neq \emptyset$ → $\langle M' \rangle \in L_P$ ✓
7. If $M$ doesn't accept $w$: $L(M') = \emptyset$ → $\langle M' \rangle \notin L_P$ ✓

Now with $P$ = "is regular":

1. $P = \{L \mid L \text{ is regular}\}$
2. $\emptyset \notin P$? Actually $\emptyset$ IS regular! So we use $\overline{P}$ = "is not regular"
3. Or WLOG assume $\emptyset \in P$ and adjust: since some r.e. language is NOT regular (like $\{0^n1^n\}$), some r.e. language NOT in $P$ exists too. Either way, the proof works.

The proof is flexible — just pick $L_0 \in P$ and ensure $\emptyset \notin P$ (or flip).

---

## Applying Rice's Theorem

To use Rice's Theorem, just verify:

1. The property is about the **language** $L(M)$ (not about $M$ itself)
2. The property is **non-trivial** (some r.e. language has it, some doesn't)

If both hold → **undecidable**. Done. No reduction needed!

### Undecidable by Rice's Theorem

All of the following are undecidable:

| Problem | Property $P$ | Non-trivial? |
|---------|-------------|-------------|
| Is $L(M) = \emptyset$? | $P = \{\emptyset\}$ | Yes ($\emptyset$ has it; $\Sigma^*$ doesn't) |
| Is $L(M)$ finite? | $P = \{L \mid L \text{ finite}\}$ | Yes (finite sets have it; $\Sigma^*$ doesn't) |
| Is $L(M)$ regular? | $P = \{L \mid L \text{ regular}\}$ | Yes ($a^*$ is regular; $\{a^nb^n\}$ isn't) |
| Is $L(M)$ context-free? | $P = \{L \mid L \text{ is CFL}\}$ | Yes |
| Is $L(M) = \Sigma^*$? | $P = \{\Sigma^*\}$ | Yes |
| Does $M$ accept $\epsilon$? | $P = \{L \mid \epsilon \in L\}$ | Yes ($\Sigma^*$ has it; $\emptyset$ doesn't) |
| Does $L(M)$ contain "hello"? | $P = \{L \mid \text{"hello"} \in L\}$ | Yes |
| Is $|L(M)| = 42$? | $P = \{L \mid |L| = 42\}$ | Yes |
| Is $L(M)$ a subset of $\{0,1\}^*$? | $P = \{L \mid L \subseteq \{0,1\}^*\}$ | Yes (over larger alphabet) |

### Not Covered by Rice's Theorem (May Be Decidable)

| Problem | Why Not Covered | Decidable? |
|---------|----------------|-----------|
| Does $M$ have exactly 5 states? | Property of the machine, not its language | Yes |
| Does $M$ ever move left? | Property of the machine's behavior | Yes |
| Does $M$ halt on $\epsilon$ within 100 steps? | Property of the machine on a fixed input | Yes |
| Is the description $\langle M \rangle$ a palindrome? | Property of the encoding | Yes |
| Does $M$ have more states than tape symbols? | Structural property of $M$ | Yes |

These are all decidable because they can be determined by examining the TM description $\langle M \rangle$ directly, without running the machine.

The fundamental insight: **looking at how a TM is built = easy. Looking at what it computes = hard.**

---

## What Rice's Theorem Does NOT Say

### It Does NOT Say All TM Questions Are Undecidable

Questions about the **machine itself** (its structure, its syntax) may be decidable:

- "Does $M$ have more than 7 states?" → **Decidable** (just count states in $\langle M \rangle$)
- "Does $M$'s transition function mention state $q_5$?" → **Decidable** (check the encoding)
- "Does $M$ halt on input $w$ within $k$ steps?" → **Decidable** (simulate for $k$ steps)

The key distinction:
- **Semantic properties** (about $L(M)$, what $M$ computes) → usually undecidable
- **Syntactic properties** (about $\langle M \rangle$, how $M$ looks) → often decidable

### It Does NOT Apply to Non-R.E. Languages

Rice's Theorem is about properties of **r.e. languages** (languages of TMs). It doesn't directly apply to properties of arbitrary languages.

### It Does NOT Say Anything About Specific Programs

For a SPECIFIC, fixed program, you might be able to prove properties about it (e.g., "this particular program always halts"). Rice's Theorem is about the GENERAL question: given an arbitrary TM, decide the property.

---

## Distinguishing Language Properties from Machine Properties

This is the most important skill for applying Rice's Theorem correctly.

### The Test

Ask: "If two TMs $M_1$ and $M_2$ have $L(M_1) = L(M_2)$, must they give the same answer?"

- **Yes** → it's a language property → Rice's Theorem applies
- **No** → it's a machine property → Rice's Theorem doesn't apply

### Examples

"Does $M$ have an even number of states?"
- Two TMs with the same language can have different numbers of states
- NOT a language property → Rice's Theorem doesn't apply → decidable!

"Does $L(M)$ contain an even number of strings?"
- This depends only on what $M$ accepts, not how $M$ is built
- IS a language property → Rice's Theorem applies → undecidable!

"Does $M$ accept at least one even-length string?"
- If $L(M_1) = L(M_2)$, they accept the same strings, so the answer is the same
- IS a language property → Rice's Theorem applies → undecidable!

"Does $M$ use at least 10 tape cells on input $\epsilon$?"
- Two TMs with the same language can use different amounts of tape
- NOT a language property → Rice's Theorem doesn't apply (may be decidable)

---

## Extended Example: Is $L(M)$ Finite?

**Claim:** $FINITE_{TM} = \{\langle M \rangle \mid L(M) \text{ is finite}\}$ is undecidable.

**Using Rice's Theorem:**

1. Is "being finite" a property of the language? YES — it depends on $L(M)$, not on $M$'s structure.
2. Is it non-trivial?
   - Some r.e. language is finite: $\{a, b, c\}$ is finite and r.e.
   - Some r.e. language is not finite: $\Sigma^*$ is infinite and r.e.
   - So YES, it's non-trivial.
3. Therefore, by Rice's Theorem, $FINITE_{TM}$ is undecidable. ∎

Compare this to the multi-page reduction proof we'd need otherwise!

---

## Direct Proof vs. Rice's Theorem

For the same problem ($FINITE_{TM}$), here's what the direct reduction looks like:

**Direct proof (without Rice's Theorem):**

Reduce $A_{TM}$ to $\overline{FINITE_{TM}}$:

Given $\langle M, w \rangle$, construct $M'$:
- $M'$ on input $x$: simulate $M$ on $w$ for $|x|$ steps
- If $M$ accepts within $|x|$ steps → accept $x$

Analysis:
- If $M$ accepts $w$ (in $k$ steps): $M'$ accepts all $x$ with $|x| \geq k$ → $L(M')$ is infinite (co-finite) → $\langle M' \rangle \in \overline{FINITE_{TM}}$
- If $M$ doesn't accept $w$: $M'$ accepts nothing → $L(M') = \emptyset$ is finite → $\langle M' \rangle \notin \overline{FINITE_{TM}}$

So $A_{TM} \leq_m \overline{FINITE_{TM}}$, making $FINITE_{TM}$ undecidable. ∎

Rice's Theorem saves us from this construction!

---

## History

Henry Gordon Rice proved this theorem in his 1951 PhD dissertation at Syracuse University and published it in 1953. The theorem formalized what many researchers had observed: virtually all interesting questions about TM languages are undecidable.

Rice's Theorem is sometimes called the "despair theorem" because it tells us that almost nothing about program behavior can be algorithmically verified in full generality.

### The Paper

Rice's original paper was titled "Classes of Recursively Enumerable Sets and Their Decision Problems." It appeared in the Transactions of the American Mathematical Society.

### Impact

The theorem immediately settled dozens of open questions about decidability and provided a powerful tool for future work. Today, it's a cornerstone result taught in every theory of computation course.

---

## Implications for Software Engineering

Rice's Theorem has direct implications for programming:

### 1. Perfect Static Analysis Is Impossible

No tool can perfectly answer questions like:
- "Does this function always return a non-null value?"
- "Does this program ever access freed memory?"
- "Does this program output valid HTML?"

These are all non-trivial language properties (where the "language" is the set of behaviors).

### 2. Type Systems Are Conservative

Type checkers reject some valid programs because they can't prove safety for all programs. Rice's Theorem explains why — perfect type inference is undecidable.

The implication: any sound type system MUST reject some valid programs. There is always a trade-off between expressiveness and safety.

### 3. Optimizing Compilers Have Limits

"Is this code unreachable?" is undecidable in general. Compilers use conservative approximations — they might leave some dead code in, or fail to apply some optimizations.

### 4. Testing Is Not Verification

You can never test enough to verify a program completely (for non-trivial properties). But you CAN verify specific properties for specific inputs.

### 5. Antivirus Software

"Does this program behave maliciously?" is a non-trivial property of the program's behavior. By Rice's Theorem, no perfect antivirus can exist. Real antivirus software uses heuristics, signatures, and sandboxing — all imperfect but practical.

---

## Exercises

### Exercise 1: Apply Rice's Theorem

For each problem, determine if Rice's Theorem applies. If yes, conclude undecidable. If no, determine decidability separately.

a) $\{\langle M \rangle \mid L(M)$ contains at least one palindrome$\}$

b) $\{\langle M \rangle \mid M$ has at most 3 states$\}$

c) $\{\langle M \rangle \mid L(M) = L(M)^R\}$ (language equals its reverse)

d) $\{\langle M \rangle \mid M$ halts on all inputs within $|w|^2$ steps$\}$

e) $\{\langle M \rangle \mid L(M) \cap \{0^n1^n\} \neq \emptyset\}$

### Exercise 2: Identify the Property

For each undecidable problem below, identify the property $P$ and verify it's non-trivial:

a) $\{\langle M \rangle \mid 010 \in L(M)\}$

b) $\{\langle M \rangle \mid L(M)$ is a CFL$\}$

c) $\{\langle M \rangle \mid |L(M)| \geq 100\}$

### Exercise 3: Why Not Rice's Theorem?

Explain why Rice's Theorem cannot be used to prove the following undecidable:

$$\{\langle M, w \rangle \mid M \text{ halts on } w\}$$

*Hint: What is the "property" here? Is it a property of $L(M)$ alone?*

### Exercise 4: The Converse

Rice's Theorem says non-trivial language properties are undecidable. Is the converse true? (i.e., are trivial properties always decidable?)

Give trivial properties and verify.

### Exercise 5: Construct the Proof

For $P$ = "contains at least one string of length 5", carry out the full Rice's Theorem proof:
- Identify $L_0 \in P$ and $M_0$
- Verify $\emptyset \notin P$
- Write the reduction function explicitly
- Verify both directions

### Exercise 6: Non-R.E. Properties

Consider the property: "$L$ is decidable" (i.e., $P = \{L \mid L \text{ is decidable}\}$).

Does Rice's Theorem apply? Is $\{\langle M \rangle \mid L(M) \text{ is decidable}\}$ undecidable?

*Hint: Is "decidable" a property of r.e. languages? Is it non-trivial among r.e. languages?*

### Exercise 7: Combining Properties

Is $\{\langle M \rangle \mid L(M) \text{ is regular AND infinite}\}$ undecidable? Use Rice's Theorem.

*Hint: The intersection of two properties is still a property. Is it non-trivial?*

### Exercise 8: Quotient Property

Is $\{\langle M \rangle \mid \epsilon \in L(M) \text{ and } L(M) \text{ is finite}\}$ decidable?

---

## Common Exam Questions

### Q: "Does Rice's Theorem apply to $HALT_{TM}$?"

**A:** No! $HALT_{TM} = \{\langle M, w \rangle \mid M \text{ halts on } w\}$ takes TWO inputs: a machine AND a word. Rice's Theorem applies to sets of the form $\{\langle M \rangle \mid \ldots\}$ — properties of the machine's language alone. The halting problem depends on both $M$ and $w$, so it's not a "property of $L(M)$."

### Q: "Can Rice's Theorem prove something is decidable?"

**A:** No! Rice's Theorem only proves undecidability. If it doesn't apply (trivial property, or not a language property), you must determine decidability separately.

### Q: "Two TMs with the same language must have the same number of states — true or false?"

**A:** FALSE. You can always add useless states. This is why "number of states" is a machine property (decidable), not a language property (undecidable).

---

## Rice's Theorem: The Complete Checklist

When you encounter a problem $\{\langle M \rangle \mid \text{condition}\}$:

1. **Does the condition depend only on $L(M)$?**
   - If NO → Rice's Theorem doesn't apply. Check decidability manually.
   - If YES → go to step 2.

2. **Is the property non-trivial?**
   - Find an r.e. language that HAS the property
   - Find an r.e. language that DOESN'T have the property
   - If you found both → non-trivial → **UNDECIDABLE by Rice's Theorem**
   - If you can't → it might be trivial → decidable (accept all or reject all)

### Quick Reference

$$\boxed{\text{Language property} + \text{Non-trivial} = \text{Undecidable}}$$

---

## Summary

| Aspect | Details |
|--------|---------|
| Statement | Non-trivial properties of $L(M)$ are undecidable |
| Applies to | Properties of the LANGUAGE recognized by a TM |
| Does NOT apply to | Properties of the TM itself (states, transitions, etc.) |
| Power | Proves infinitely many problems undecidable at once |
| Limitation | Doesn't help with problems involving both $M$ and input $w$ |
| Key test | "Same language → same answer?" If yes, Rice applies |
| Formal | $P$ non-trivial, $L_P = \{\langle M \rangle \mid L(M) \in P\}$ → $L_P$ undecidable |

---

## What's Next?

We've now covered the major undecidability results for Turing machine language properties. Next, we'll see an undecidable problem that looks completely different — no machines involved at all! The **Post Correspondence Problem** shows undecidability lurking in simple string operations.

The PCP is important because it provides a "bridge" for proving undecidability of problems in formal language theory (like CFG ambiguity) where direct reductions from $A_{TM}$ would be extremely complex.
You'll see how a deceptively simple puzzle about string tiles turns out to encode arbitrary computation.
Next lesson: **Post Correspondence Problem** →
