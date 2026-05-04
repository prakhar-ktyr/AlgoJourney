---
title: The Halting Problem
---

# The Halting Problem

The **Halting Problem** is the most famous undecidable problem in computer science. It proves that there are fundamental limits to what computers can do — no matter how powerful they become.

This result, proven by Alan Turing in 1936, is one of the most important theorems in all of mathematics and computer science. It tells us that some questions simply cannot be answered by any algorithm.

---

## What Is the Halting Problem?

The question is simple:

> Given a program $M$ and an input $w$, does $M$ eventually stop (halt) when run on $w$?

Formally, we define:

$$HALT_{TM} = \{\langle M, w \rangle \mid M \text{ halts on } w\}$$

Here $\langle M, w \rangle$ denotes an encoding of both the machine $M$ and the input $w$ as a single string.

This seems like it should be answerable. After all, we can run the program and see what happens... right?

The problem is: if the program runs forever, we'd wait forever and never know. There's no way to distinguish "running for a really long time" from "will never stop."

### Why It Matters

If we could solve the Halting Problem, we could:
- Detect all infinite loops before running a program
- Verify that any software terminates correctly
- Build perfect debuggers and testing tools
- Solve many other unsolvable problems

As we'll prove, NONE of these are possible in full generality.

---

## First: The Acceptance Problem

Before proving the Halting Problem undecidable, we prove a closely related problem undecidable.

Define:

$$A_{TM} = \{\langle M, w \rangle \mid M \text{ accepts } w\}$$

This asks: "Does Turing machine $M$ accept input $w$?"

This is perhaps the most natural question you can ask about a TM: given a machine and an input, does the machine say "yes"?

### Theorem: $A_{TM}$ Is Undecidable

We prove this by contradiction using a technique called **diagonalization** — the same technique Cantor used to prove the reals are uncountable.

---

## The Diagonalization Proof

### Step 1: Assume a Decider Exists

Suppose (for contradiction) that there exists a decider $H$ for $A_{TM}$.

This means $H$ is a Turing machine that:
- Always halts (it's a decider)
- $H(\langle M, w \rangle) = \text{accept}$ if $M$ accepts $w$
- $H(\langle M, w \rangle) = \text{reject}$ if $M$ does not accept $w$

Think of $H$ as a perfect "acceptance checker."

### Step 2: Construct the Contradicting Machine $D$

Using $H$, we build a new machine $D$ that does the following:

**$D$ on input $\langle M \rangle$** (a description of some TM):
1. Run $H(\langle M, \langle M \rangle \rangle)$ — ask "does $M$ accept its own description?"
2. If $H$ says accept → $D$ **rejects**
3. If $H$ says reject → $D$ **accepts**

In other words, $D$ does the **opposite** of what $M$ does on its own description.

$$D(\langle M \rangle) = \begin{cases} \text{accept} & \text{if } M \text{ does not accept } \langle M \rangle \\ \text{reject} & \text{if } M \text{ accepts } \langle M \rangle \end{cases}$$

### Step 3: Feed $D$ Its Own Description

Now ask: what happens when we run $D(\langle D \rangle)$?

Following the definition of $D$:
- $D$ runs $H(\langle D, \langle D \rangle \rangle)$
- $H$ checks: "does $D$ accept $\langle D \rangle$?"

**Case 1:** Suppose $D$ accepts $\langle D \rangle$
- Then $H(\langle D, \langle D \rangle \rangle) = \text{accept}$
- So $D$ rejects $\langle D \rangle$ (by step 2)
- Contradiction! We assumed $D$ accepts $\langle D \rangle$

**Case 2:** Suppose $D$ rejects $\langle D \rangle$
- Then $H(\langle D, \langle D \rangle \rangle) = \text{reject}$
- So $D$ accepts $\langle D \rangle$ (by step 3)
- Contradiction! We assumed $D$ rejects $\langle D \rangle$

### Step 4: Conclusion

Both cases lead to contradictions:

$$D(\langle D \rangle) \text{ accepts} \iff D(\langle D \rangle) \text{ rejects}$$

This is impossible! Therefore our initial assumption must be wrong.

**$H$ cannot exist. $A_{TM}$ is undecidable.** ∎

---

## Detailed Walkthrough

Let's trace through the proof one more time, very carefully:

| Step | What Happens | Why |
|------|-------------|-----|
| 1 | Assume $H$ decides $A_{TM}$ | Starting assumption |
| 2 | Build $D$ using $H$ | $D$ flips $H$'s answer about self-reference |
| 3 | Run $D(\langle D \rangle)$ | Feed $D$ its own description |
| 4 | $D$ calls $H(\langle D, \langle D \rangle \rangle)$ | Asking "does $D$ accept $\langle D \rangle$?" |
| 5 | If $H$ says yes → $D$ rejects | But $H$ said $D$ accepts! |
| 6 | If $H$ says no → $D$ accepts | But $H$ said $D$ rejects! |
| 7 | Contradiction either way | $H$ cannot exist |

The key insight: the self-referential nature of $D(\langle D \rangle)$ creates an unavoidable paradox.

---

## Connection to Cantor's Diagonalization

This proof mirrors Cantor's proof that the real numbers are uncountable.

**Cantor's argument:**
- Assume you can list all real numbers: $r_1, r_2, r_3, \ldots$
- Construct a new number $d$ by making the $n$-th digit of $d$ different from the $n$-th digit of $r_n$
- $d$ differs from every $r_n$ at position $n$
- $d$ is not in the list — contradiction!

**Turing's argument:**
- Assume you can decide whether any TM accepts its own description
- Construct $D$ that does the opposite at the "diagonal" — where machine = input
- $D$ contradicts itself on its own description
- The decider cannot exist — contradiction!

Both use the same diagonal trick:

$$\begin{array}{c|cccc}
 & \langle M_1 \rangle & \langle M_2 \rangle & \langle M_3 \rangle & \cdots \\
\hline
M_1 & \textbf{acc} & rej & acc & \cdots \\
M_2 & rej & \textbf{rej} & rej & \cdots \\
M_3 & acc & acc & \textbf{acc} & \cdots \\
\vdots & & & & \ddots
\end{array}$$

$D$ flips each diagonal entry, creating a row that can't appear in the table.

---

## $A_{TM}$ Is Recognizable But Not Decidable

### $A_{TM}$ Is Turing-Recognizable

The **Universal Turing Machine** $U$ recognizes $A_{TM}$:

**$U$ on input $\langle M, w \rangle$:**
1. Simulate $M$ on $w$
2. If $M$ accepts → accept
3. If $M$ rejects → reject

If $M$ loops on $w$, then $U$ also loops — it never answers. That's okay for a recognizer (it doesn't need to halt on non-members).

So: $A_{TM} \in \text{RE}$ (recursively enumerable / Turing-recognizable).

### $\overline{A_{TM}}$ Is Not Recognizable

**Theorem:** The complement $\overline{A_{TM}} = \{\langle M, w \rangle \mid M \text{ does not accept } w\}$ is not Turing-recognizable.

**Proof:** We use a key theorem:

> A language $L$ is decidable if and only if both $L$ and $\overline{L}$ are Turing-recognizable.

If $\overline{A_{TM}}$ were recognizable, then since $A_{TM}$ is also recognizable, $A_{TM}$ would be decidable. But we just proved $A_{TM}$ is undecidable. Contradiction!

Therefore $\overline{A_{TM}}$ is not recognizable. ∎

### The Language Hierarchy

$$\text{Decidable} \subset \text{Recognizable} \subset \text{All Languages}$$

$A_{TM}$ sits in "Recognizable but not Decidable" — the gap between the first two sets.

---

## The Halting Problem Is Undecidable

Now we can prove the Halting Problem undecidable using a reduction.

**Theorem:** $HALT_{TM}$ is undecidable.

**Proof:** We show that if $HALT_{TM}$ were decidable, then $A_{TM}$ would be decidable (which we know is false).

Assume $R$ decides $HALT_{TM}$:
- $R(\langle M, w \rangle) = \text{accept}$ if $M$ halts on $w$
- $R(\langle M, w \rangle) = \text{reject}$ if $M$ loops on $w$

Build a decider $S$ for $A_{TM}$:

**$S$ on input $\langle M, w \rangle$:**
1. Run $R(\langle M, w \rangle)$
2. If $R$ rejects (meaning $M$ loops on $w$) → reject
3. If $R$ accepts (meaning $M$ halts on $w$) → simulate $M$ on $w$
4. If $M$ accepts → accept
5. If $M$ rejects → reject

Step 3-5 are safe because we know $M$ halts (thanks to $R$).

This makes $S$ a decider for $A_{TM}$. But $A_{TM}$ is undecidable!

Therefore $R$ cannot exist. $HALT_{TM}$ is undecidable. ∎

---

## Relationship Between $A_{TM}$ and $HALT_{TM}$

The two problems are closely related:

- $A_{TM} \leq_m HALT_{TM}$: We showed deciding $HALT_{TM}$ would let us decide $A_{TM}$
- $HALT_{TM} \leq_m A_{TM}$: We can also reduce the other way

**$HALT_{TM}$ reduces to $A_{TM}$:**

Given $\langle M, w \rangle$, construct $M'$:
- $M'$ on input $w$: simulate $M$ on $w$
- If $M$ halts (accepts or rejects) → $M'$ accepts

Then: $M$ halts on $w$ $\iff$ $M'$ accepts $w$ $\iff$ $\langle M', w \rangle \in A_{TM}$

Both problems are:
- Turing-recognizable (simulate and wait)
- Not decidable (proven above)
- Their complements are not recognizable

---

## Real-World Implications

The undecidability of the Halting Problem has profound practical consequences:

### 1. No Perfect Debugger

You cannot build a program that detects all bugs in all programs. If you could detect "will this program crash?", you could solve the Halting Problem.

### 2. No Universal Infinite Loop Detector

No tool can examine an arbitrary program and correctly determine whether it will loop forever. Your IDE's "infinite loop warning" uses heuristics — it can miss loops and flag non-loops.

### 3. No Complete Program Verifier

You cannot build a tool that verifies ALL properties of ALL programs. While we can verify specific properties of specific programs, a universal verifier is impossible.

### 4. Compiler Limitations

A compiler cannot always determine:
- Will this function return?
- Is this code unreachable?
- Will this recursion terminate?

### 5. Security Implications

- Cannot build a perfect virus detector (would need to solve halting)
- Cannot prove all programs are safe from infinite loops
- Static analysis tools are inherently incomplete

---

## Historical Significance

### Turing's 1936 Paper

Alan Turing published "On Computable Numbers, with an Application to the Entscheidungsproblem" in 1936.

Key contributions:
- Defined the Turing machine model
- Proved the Halting Problem undecidable
- Resolved Hilbert's Entscheidungsproblem (decision problem) negatively
- Independently arrived at results similar to Gödel's incompleteness theorems

### The Entscheidungsproblem

David Hilbert asked in 1928: Is there an algorithm that can determine the truth of any mathematical statement?

Turing (and independently Church) proved: **No.**

This was a watershed moment — mathematics has inherent limitations.

### Timeline

| Year | Event |
|------|-------|
| 1900 | Hilbert's problems (including decision problem) |
| 1931 | Gödel's incompleteness theorems |
| 1936 | Turing's paper; Church's lambda calculus result |
| 1936 | Church-Turing thesis formulated |
| 1937 | Turing and Church shown equivalent |

---

## Common Misconceptions

### Misconception 1: "We just need faster computers"

The Halting Problem is not about speed or resources. Even with infinite time and memory, no algorithm can solve it. It's a logical impossibility, not a practical limitation.

### Misconception 2: "We can solve it for specific programs"

True! For many specific programs, we CAN determine if they halt. The impossibility is about a GENERAL algorithm that works for ALL programs.

### Misconception 3: "Just run it and see"

If the program halts, yes, you'll eventually know. But if it doesn't halt, you'll wait forever without ever being sure it won't halt in the next step.

### Misconception 4: "This means computers are useless"

Not at all! Most practical programs are analyzable. The Halting Problem shows theoretical limits, not practical ones for everyday software.

### Misconception 5: "The proof is circular"

The proof is not circular. It uses proof by contradiction — we assume a solution exists and derive a logical impossibility. This is a standard mathematical technique.

---

## Summary Table

| Language | Decidable? | Recognizable? | Co-Recognizable? |
|----------|-----------|--------------|-----------------|
| $A_{TM}$ | No | Yes | No |
| $HALT_{TM}$ | No | Yes | No |
| $\overline{A_{TM}}$ | No | No | Yes |
| $A_{DFA}$ | Yes | Yes | Yes |

---

## Key Takeaways

1. $A_{TM}$ is undecidable — proven by diagonalization
2. $HALT_{TM}$ is undecidable — proven by reduction from $A_{TM}$
3. Both are Turing-recognizable but not decidable
4. Their complements are not even recognizable
5. These results establish fundamental limits of computation
6. The technique (diagonalization) mirrors Cantor's work on infinity

---

## Formal Definitions Recap

Let's state everything precisely using set-builder notation:

$$A_{TM} = \{\langle M, w \rangle \mid M \text{ is a TM and } M \text{ accepts } w\}$$

$$HALT_{TM} = \{\langle M, w \rangle \mid M \text{ is a TM and } M \text{ halts on } w\}$$

$$\overline{A_{TM}} = \{\langle M, w \rangle \mid M \text{ is a TM and } M \text{ does not accept } w\}$$

Note that "does not accept" includes two cases:
- $M$ rejects $w$ (halts in a non-accepting state)
- $M$ loops forever on $w$ (never halts)

### Decidability vs. Recognizability

| Term | Definition |
|------|-----------|
| **Decidable** | A TM exists that always halts and gives the correct answer |
| **Recognizable** | A TM exists that accepts all yes-instances (may loop on no-instances) |
| **Co-recognizable** | The complement is recognizable |

A language is decidable $\iff$ it is both recognizable AND co-recognizable.

---

## The Busy Beaver Connection

The Halting Problem connects to the **Busy Beaver function** $BB(n)$:

$$BB(n) = \text{maximum steps a halting } n\text{-state TM can take before halting}$$

$BB(n)$ grows faster than ANY computable function. If we could compute $BB(n)$, we could solve the Halting Problem:

- To check if $M$ (with $n$ states) halts on $w$: simulate for $BB(n)$ steps
- If it hasn't halted by then, it never will

Since the Halting Problem is undecidable, $BB(n)$ must be uncomputable!

Known values: $BB(1) = 1$, $BB(2) = 6$, $BB(3) = 21$, $BB(4) = 107$, $BB(5) \geq 47{,}176{,}870$.

---

## The Recursion Theorem Connection

The diagonalization proof relies on self-reference: $D$ uses its own description. The **Recursion Theorem** guarantees that such self-referential constructions are always possible — any TM can obtain its own description.

This means the contradiction in the proof isn't due to some "trick" with self-reference. The Recursion Theorem proves that self-referential TMs are legitimate mathematical objects.

---

## Exercises

### Exercise 1: Trace the Proof

Suppose $H$ decides $A_{TM}$, and we build $D$ as in the proof.

Fill in the table:

| Machine | Input | $H$'s answer | $D$'s action |
|---------|-------|-------------|-------------|
| $M_1$ accepts everything | $\langle M_1 \rangle$ | ? | ? |
| $M_2$ rejects everything | $\langle M_2 \rangle$ | ? | ? |
| $D$ | $\langle D \rangle$ | ? | ? |

### Exercise 2: Why Not Just Simulate?

Explain why the following "decider" for $A_{TM}$ fails:

"On input $\langle M, w \rangle$: simulate $M$ on $w$. If it accepts, accept. If it rejects, reject."

### Exercise 3: Reduction Practice

Show that if $HALT_{TM}$ were decidable, then the following would also be decidable:

$$LOOP_{TM} = \{\langle M, w \rangle \mid M \text{ loops forever on } w\}$$

### Exercise 4: Real-World Connection

A colleague claims they've built a tool that detects all infinite loops in Python programs. Using the Halting Problem, explain why this claim must be false (or what limitations the tool must have).

### Exercise 5: Complement

Prove that $\overline{HALT_{TM}} = \{\langle M, w \rangle \mid M \text{ does not halt on } w\}$ is not Turing-recognizable.

*Hint: Use the theorem that $L$ is decidable iff both $L$ and $\overline{L}$ are recognizable.*

### Exercise 6: Diagonalization Table

Create a $4 \times 4$ diagonalization table for machines $M_1, M_2, M_3, M_4$ where:
- $M_1$ accepts all inputs
- $M_2$ accepts no inputs
- $M_3$ accepts inputs of even length
- $M_4$ accepts inputs starting with '1'

Determine what $D$ does on each $\langle M_i \rangle$.

### Exercise 7: The Printing Problem

Define:

$$PRINT_{TM} = \{\langle M, w \rangle \mid M \text{ prints } 1 \text{ at some point during execution on } w\}$$

Prove that $PRINT_{TM}$ is undecidable.

*Hint: Reduce from $A_{TM}$. Modify $M$ so it prints 1 if and only if it would have accepted.*

### Exercise 8: Finite vs. Infinite

Explain the difference between these two problems and their decidability:

a) "Does this specific Python function `factorial(5)` halt?" (Decidable — just run it!)

b) "Given any Python function and input, does it halt?" (Undecidable — this is $HALT_{TM}$!)

---

## Practice Problems with Solutions

### Problem: Is This Decidable?

**Question:** Is $\{\langle M \rangle \mid M \text{ halts on } \epsilon \text{ within 1000 steps}\}$ decidable?

**Answer:** YES! Simply simulate $M$ on $\epsilon$ for 1000 steps. If it halts, accept; otherwise reject. This always terminates in bounded time.

**Key insight:** Bounding the computation makes the problem decidable. It's the *unbounded* nature of the Halting Problem that causes undecidability.

### Problem: Recognizable?

**Question:** Is $\overline{HALT_{TM}} = \{\langle M, w \rangle \mid M \text{ does not halt on } w\}$ recognizable?

**Answer:** NO. If it were recognizable, since $HALT_{TM}$ is also recognizable, $HALT_{TM}$ would be decidable (a language is decidable iff both it and its complement are recognizable). But $HALT_{TM}$ is undecidable. Contradiction.

---

## What's Next?

Now that we've seen the most fundamental undecidable problems, we'll explore many more undecidable problems and learn systematic techniques for proving undecidability.

In the next lesson, we'll build a whole "zoo" of undecidable problems and classify them by their recognizability properties. You'll see how the tools developed here — diagonalization and reduction — can be applied systematically.

Next lesson: **Undecidable Problems** →
