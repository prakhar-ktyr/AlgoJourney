---
title: Introduction to Automata
---

# Introduction to Automata

An **automaton** (plural: automata) is an abstract mathematical model of a computing machine. It reads input, processes it step by step, and produces a yes/no answer: does this input belong to the language?

Automata theory is the heart of the Theory of Computation. Every question about what computers can and cannot do ultimately involves some form of automaton.

---

## What Is an Automaton?

Think of an automaton as a simple machine with:

1. **Input:** A string of symbols (read one at a time, usually left to right)
2. **States:** The machine's "memory" — which configuration it is currently in
3. **Transitions:** Rules for moving from one state to another based on input
4. **Start state:** Where computation begins
5. **Accept states:** States that signal "yes, this input is in the language"

The machine reads the input string symbol by symbol. After processing the entire input, it either **accepts** or **rejects**.

### The Vending Machine Analogy

Consider a simple vending machine that accepts exactly 15 cents (using nickels and dimes):

- **States:** $\{0¢, 5¢, 10¢, 15¢\}$ (amount inserted so far)
- **Input symbols:** $\{N, D\}$ (nickel, dime)
- **Start state:** $0¢$
- **Accept state:** $15¢$
- **Transitions:**
  - From $0¢$: read $N$ → go to $5¢$; read $D$ → go to $10¢$
  - From $5¢$: read $N$ → go to $10¢$; read $D$ → go to $15¢$
  - From $10¢$: read $N$ → go to $15¢$; read $D$ → (reject/overflow)
  - From $15¢$: (done — accept!)

The machine "remembers" how much money has been inserted via its current state. That is all it needs.

---

## Automata as Language Recognizers

The fundamental task of any automaton is:

> **Given input string $w$, decide: is $w \in L$?**

The language **recognized** (or **accepted**) by automaton $M$ is:

$$L(M) = \{w \mid M \text{ accepts } w\}$$

This connects automata to languages:
- Every automaton defines a language (the set of strings it accepts)
- Every language (at certain complexity levels) has an automaton that recognizes it

---

## Types of Automata

The Theory of Computation studies a hierarchy of automata, each more powerful than the last:

### Finite Automata (FA)

- **Memory:** None (beyond the current state)
- **Input:** Read-only, left to right, one symbol at a time
- **Power:** Recognizes exactly the **regular languages**
- **Key limitation:** Cannot count beyond a fixed bound

**Examples of what FA can do:**
- Check if a string ends with "01"
- Verify that an email address has the right format (approximately)
- Determine if a binary number is divisible by 3

**Examples of what FA cannot do:**
- Check if a string has equal numbers of $a$'s and $b$'s
- Verify balanced parentheses
- Determine if a string is a palindrome

### Pushdown Automata (PDA)

- **Memory:** A stack (last-in, first-out)
- **Input:** Read-only, left to right
- **Power:** Recognizes exactly the **context-free languages**
- **Key ability:** Can match pairs (opening/closing brackets)

**Examples:**
- $\{a^n b^n \mid n \geq 0\}$ — push $a$'s, pop for each $b$
- Balanced parentheses — push opens, pop for closes
- Palindromes (non-deterministically)

### Linear Bounded Automata (LBA)

- **Memory:** A read-write tape bounded by input length
- **Input:** Written on the tape; machine can read and write
- **Power:** Recognizes exactly the **context-sensitive languages**
- **Key ability:** Can use space proportional to input size

**Examples:**
- $\{a^n b^n c^n \mid n \geq 0\}$
- $\{ww \mid w \in \{a, b\}^*\}$ (string doubling)

### Turing Machine (TM)

- **Memory:** An infinite read-write tape
- **Input:** Written on the tape initially
- **Power:** Recognizes exactly the **recursively enumerable languages**
- **Key ability:** Unlimited memory, can compute anything that is computable

**Examples:**
- Every decidable problem
- The halting problem (partially — it can recognize but not decide)

### The Hierarchy at a Glance

| Automaton | Memory | Language Class | Example Language |
|---|---|---|---|
| DFA/NFA | Finite states only | Regular | Strings ending in $01$ |
| PDA | Stack | Context-Free | $a^n b^n$ |
| LBA | Bounded tape | Context-Sensitive | $a^n b^n c^n$ |
| TM | Unbounded tape | Recursively Enumerable | Halting problem |

$$\text{FA} \subset \text{PDA} \subset \text{LBA} \subset \text{TM}$$

Each strictly more powerful than the previous.

---

## The Computation Model

Let's formalize what "running" an automaton means.

### Configuration

A **configuration** (or instantaneous description) is a complete snapshot of the machine at one moment in time. It captures everything needed to continue the computation:

| Automaton | Configuration includes |
|---|---|
| FA | Current state + remaining input |
| PDA | Current state + remaining input + stack contents |
| TM | Current state + tape contents + head position |

### Computation Step

A single **step** (or move) is one transition: the machine reads a symbol (or makes a spontaneous move), changes state, and possibly modifies memory (stack/tape).

We write $C_1 \vdash C_2$ to mean "configuration $C_1$ yields $C_2$ in one step."

### Computation

A **computation** on input $w$ is a sequence of configurations:

$$C_0 \vdash C_1 \vdash C_2 \vdash \cdots \vdash C_n$$

where:
- $C_0$ is the **initial configuration** (start state, full input, empty stack/blank tape)
- Each step follows the transition rules
- $C_n$ is the **final configuration** (no more input to read, for FA/PDA)

### Acceptance

The machine **accepts** input $w$ if there exists a computation on $w$ that ends in an **accept state** (final/accepting configuration).

The machine **rejects** $w$ if:
- (Deterministic) The unique computation ends in a non-accept state
- (Non-deterministic) ALL possible computations end in non-accept states

> **Note for Turing Machines:** A TM might also **loop forever** (never halt). In that case, it neither accepts nor rejects — it just runs indefinitely. This is why "decidable" (always halts) is a stronger condition than "recognizable" (accepts if in language, but might loop otherwise).

---

## Deterministic vs Non-Deterministic

This distinction is one of the most important concepts in computer science.

### Deterministic Automata

At each step, given the current state and input symbol, there is **exactly one** possible next state. The computation is fully determined — there is no choice, no branching.

$$\text{For each (state, input) pair, there is exactly one transition.}$$

The computation is a single path from start to end.

### Non-Deterministic Automata

At each step, the machine may have **multiple** possible next states. It can "choose" which transition to follow. The computation is a tree of possibilities.

$$\text{For each (state, input) pair, there may be zero, one, or many transitions.}$$

**How to think about non-determinism:**

1. **Lucky guessing:** The machine always guesses correctly. If any sequence of choices leads to acceptance, the machine accepts.
2. **Parallel exploration:** The machine explores all possibilities simultaneously. It accepts if any branch reaches an accept state.
3. **Tree of computations:** Each non-deterministic choice creates a branching point. The machine accepts if any path from root to leaf is an accepting computation.

### Formal Definition of Acceptance (Non-Deterministic)

A non-deterministic machine $M$ accepts $w$ if **there exists** at least one computation of $M$ on $w$ that ends in an accept state.

$M$ rejects $w$ if **all** computations of $M$ on $w$ end in non-accept states (or don't reach any accept state).

### Power Comparison

| Automaton Type | Deterministic = Non-deterministic? |
|---|---|
| Finite Automata | **Yes!** DFA and NFA recognize exactly the same languages |
| Pushdown Automata | **No.** NPDA is strictly more powerful than DPDA |
| Turing Machine | **Unknown!** This is related to the P vs NP problem |

The fact that DFA = NFA (in power) is remarkable and will be proven via the **subset construction** in a later lesson.

---

## State Diagrams

State diagrams are the visual notation for automata:

- **States:** Circles (or ovals)
- **Start state:** Arrow pointing to it from nowhere (or labeled "start")
- **Accept states:** Double circles
- **Transitions:** Arrows between states labeled with input symbols

### Example: Turnstile

A turnstile has two states: **Locked** and **Unlocked**.

```
         coin             push
  ┌──── ──────── ────────┐
  │                       │
  ▼        push           │
→(Locked) ──────→ (Locked)│
  │                       │
  │ coin                  │
  ▼                       │
 ((Unlocked)) ────────────┘
  │        
  │ coin   
  └──→ ((Unlocked))
```

More precisely:
- States: $\{Locked, Unlocked\}$
- Alphabet: $\{coin, push\}$
- Start state: $Locked$
- Accept state: $Unlocked$ (gate is open)
- Transitions:
  - $Locked \xrightarrow{coin} Unlocked$
  - $Locked \xrightarrow{push} Locked$
  - $Unlocked \xrightarrow{coin} Unlocked$
  - $Unlocked \xrightarrow{push} Locked$

### Example: Binary Strings with Even Number of 1s

```
         0               0
     ┌──────┐        ┌──────┐
     │      │        │      │
     ▼      │        ▼      │
→ ((q₀)) ──────── (q₁) 
          1              1
     (q₁) ──────── ((q₀))
```

- States: $\{q_0, q_1\}$
- Start state: $q_0$ (zero 1s seen — which is even)
- Accept state: $q_0$
- $q_0$: even number of 1s seen so far
- $q_1$: odd number of 1s seen so far
- Reading a 0: stay in current state
- Reading a 1: switch states

---

## The Big Picture: Automata ↔ Grammars ↔ Languages

There is a beautiful correspondence between the three pillars of formal language theory:

| Languages | Grammars (Generate) | Automata (Recognize) |
|---|---|---|
| Regular | Regular (Type 3) | Finite Automata (DFA/NFA) |
| Context-Free | Context-Free (Type 2) | Pushdown Automata |
| Context-Sensitive | Context-Sensitive (Type 1) | Linear Bounded Automata |
| Rec. Enumerable | Unrestricted (Type 0) | Turing Machines |

For each row, the grammar and automaton are **equivalent** in power — they define exactly the same class of languages. This is one of the deepest results in theoretical computer science.

**Two perspectives on the same language:**

- **Grammar:** How to **generate** (produce) all strings in the language
- **Automaton:** How to **recognize** (accept/reject) any given string

We will prove these equivalences as we study each level of the hierarchy.

---

## Why Study Automata?

### 1. Understanding Computational Limits

Automata theory tells us what **cannot** be computed, not just what can:
- No finite automaton can check balanced parentheses
- No Turing machine can solve the halting problem
- Understanding these limits shapes how we design systems

### 2. Practical Applications

| Application | Automaton Used |
|---|---|
| Regular expressions (grep, regex) | NFA → DFA |
| Compilers (lexical analysis) | DFA |
| Compilers (parsing) | PDA |
| Protocol verification | Finite state machines |
| Model checking | Automata on infinite words |
| Text search algorithms | Automata-based pattern matching |

### 3. Foundation for Complexity Theory

The P vs NP question — perhaps the most important open problem in computer science — is rooted in the difference between deterministic and non-deterministic Turing machines.

### 4. Design Methodology

Thinking in terms of states and transitions is a powerful design methodology:
- State machines in software engineering (UI states, game states)
- Protocol design (TCP state machine)
- Hardware design (sequential circuits = finite automata)

---

## Exercises

### Exercise 1

A light switch has two states: ON and OFF. The input is a sequence of toggle operations. Model this as a finite automaton and determine what language it recognizes (assuming ON is the accept state and the switch starts OFF).

<details>
<summary><strong>Solution</strong></summary>

- States: $\{OFF, ON\}$
- Alphabet: $\{T\}$ (toggle)
- Start state: $OFF$
- Accept state: $ON$
- Transitions: $OFF \xrightarrow{T} ON$, $ON \xrightarrow{T} OFF$

Language recognized: $L = \{T^n \mid n \text{ is odd}\}$ — strings with an odd number of toggles.

</details>

### Exercise 2

Why can't a finite automaton recognize $L = \{0^n 1^n \mid n \geq 0\}$? Give an intuitive argument.

<details>
<summary><strong>Solution</strong></summary>

A finite automaton has a fixed number of states, say $k$. After reading $0^n$ for the first time, the machine is in some state. There are only $k$ possible states, but infinitely many possible values of $n$. By the pigeonhole principle, there exist $i \neq j$ such that $0^i$ and $0^j$ lead to the same state. 

But then the machine cannot distinguish between $0^i$ (which should be followed by exactly $i$ ones) and $0^j$ (which should be followed by $j$ ones). It will give the same answer for $0^i 1^j$ and $0^j 1^j$ — but only the latter is in the language.

This is the intuition behind the **Pumping Lemma** for regular languages.

</details>

### Exercise 3

Describe informally (in terms of states, transitions, acceptance) a PDA that recognizes $L = \{a^n b^n \mid n \geq 0\}$.

<details>
<summary><strong>Solution</strong></summary>

**Strategy:** Use the stack to count $a$'s.

1. **Reading $a$'s phase:** For each $a$ read, push a marker onto the stack.
2. **Reading $b$'s phase:** For each $b$ read, pop one marker from the stack.
3. **Acceptance:** Accept if, after reading all input, the stack is empty.
4. **Rejection:** Reject if:
   - A $b$ is read when the stack is empty (more $b$'s than $a$'s)
   - An $a$ is read after any $b$ (wrong order)
   - Input is exhausted but stack is non-empty (more $a$'s than $b$'s)

The stack gives the PDA the ability to "count" — something a finite automaton cannot do.

</details>

### Exercise 4

Explain why non-determinism doesn't add power to finite automata (DFA = NFA in power) but intuitively does add power to pushdown automata (NPDA > DPDA).

<details>
<summary><strong>Solution</strong></summary>

**DFA = NFA:** Given an NFA with $n$ states, we can build an equivalent DFA using the **subset construction**. Each DFA state represents a set of NFA states (the states the NFA "could be in"). Since there are at most $2^n$ subsets, the DFA has at most $2^n$ states. The DFA simulates all NFA branches simultaneously.

**NPDA > DPDA:** The key difference is the **stack**. A DPDA cannot "look ahead" or try different stack operations. For example, the language of palindromes $\{ww^R \mid w \in \{a,b\}^*\}$ requires guessing where the middle of the string is — an NPDA can non-deterministically guess this point, but a DPDA cannot.

The subset construction doesn't work for PDAs because we would need to track multiple possible stack configurations simultaneously, and there are infinitely many possible stack contents.

</details>

### Exercise 5

Match each language with the weakest automaton type that can recognize it:

(a) $\{w \in \{0,1\}^* \mid w \text{ contains } 101\}$

(b) $\{a^n b^n c^n \mid n \geq 0\}$

(c) $\{ww^R \mid w \in \{a,b\}^*\}$

(d) Any problem a computer can solve

<details>
<summary><strong>Solution</strong></summary>

(a) **Finite Automaton (DFA/NFA)** — This is a regular language (just track progress through the pattern "101").

(b) **Linear Bounded Automaton** — This is context-sensitive but not context-free (three-way matching requires more than a stack).

(c) **Pushdown Automaton (NPDA)** — This is context-free. An NPDA pushes the first half, then non-deterministically guesses the midpoint and pops to match the second half.

(d) **Turing Machine** — By the Church-Turing thesis, anything computable is computable by a Turing machine.

</details>

### Exercise 6

A combination lock accepts the sequence "L3-R7-L2" and rejects everything else. Model this as a DFA. How many states does it need?

<details>
<summary><strong>Solution</strong></summary>

We need states to track progress through the correct sequence:

- $q_0$: start (nothing entered)
- $q_1$: "L3" entered correctly
- $q_2$: "L3-R7" entered correctly
- $q_3$: "L3-R7-L2" entered correctly (accept state)
- $q_{dead}$: wrong input detected (trap state — all transitions loop here)

**States:** 5 (including the dead state)
**Accept state:** $q_3$
**Alphabet:** All possible moves (L0, L1, ..., L9, R0, R1, ..., R9)
**Transitions:** 
- From $q_0$: L3 → $q_1$, everything else → $q_{dead}$
- From $q_1$: R7 → $q_2$, everything else → $q_{dead}$
- From $q_2$: L2 → $q_3$, everything else → $q_{dead}$
- From $q_3$: everything → $q_{dead}$ (only accept exact sequence)
- From $q_{dead}$: everything → $q_{dead}$

</details>

---

## Formal Notation: Transition Functions

Each type of automaton has a transition function with different signatures. Here is a preview:

### Finite Automaton (DFA)

$$\delta : Q \times \Sigma \to Q$$

Given a state and an input symbol, produce exactly one next state. No memory beyond the state itself.

### Finite Automaton (NFA)

$$\delta : Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$

Given a state and an input symbol (or $\varepsilon$), produce a **set** of possible next states. The power set $\mathcal{P}(Q)$ allows non-determinism.

### Pushdown Automaton (PDA)

$$\delta : Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)$$

The transition depends on the state, input symbol, AND the top of the stack. It produces a new state and a string to push onto the stack.

### Turing Machine

$$\delta : Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$$

Given the state and the symbol under the tape head, produce a new state, write a symbol, and move the head left or right.

Notice how each successive automaton type has a richer transition function — this reflects its greater computational power.

---

## Historical Context

The study of automata has a rich history:

- **1936:** Alan Turing introduced the Turing machine to formalize "computation"
- **1943:** McCulloch and Pitts modeled neural networks as finite automata
- **1956:** Noam Chomsky established the grammar hierarchy
- **1959:** Michael Rabin and Dana Scott proved DFA = NFA (Turing Award, 1976)
- **1960s:** Pushdown automata connected to context-free languages (compilers)
- **1970s:** Complexity theory built on Turing machine foundations

The hierarchy of automata mirrors the hierarchy of human-designed systems: from simple controllers (thermostats, vending machines) to full-blown computers.

---

## Summary

| Concept | Key Idea |
|---|---|
| Automaton | Abstract machine that reads input and accepts/rejects |
| Configuration | Complete snapshot of machine state |
| Deterministic | Exactly one possible computation path |
| Non-deterministic | Multiple possible paths; accepts if ANY path accepts |
| Language of $M$ | $L(M) = \{w \mid M \text{ accepts } w\}$ |
| Chomsky hierarchy | FA ⊂ PDA ⊂ LBA ⊂ TM (strict inclusions) |

---

## What's Next?

Now we dive deep into the simplest and most well-understood automaton: the **Deterministic Finite Automaton (DFA)**. We will formally define DFAs, learn to design them, trace computations, and prove what they can and cannot recognize.
