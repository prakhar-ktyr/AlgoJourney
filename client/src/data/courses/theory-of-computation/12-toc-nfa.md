---
title: Nondeterministic Finite Automata
---

# Nondeterministic Finite Automata (NFA)

A **Nondeterministic Finite Automaton** (NFA) is a generalization of the DFA that allows the machine to be in **multiple states** at once. At each step, instead of one deterministic move, the NFA can "choose" among several possible transitions — or even make transitions without consuming input. This makes NFAs significantly easier to design, while (surprisingly) recognizing exactly the same class of languages as DFAs.

---

## Motivation: Why Nondeterminism?

Consider designing a DFA for "strings over $\{0, 1\}$ ending in 01." You'd need to carefully track the last two symbols — manageable, but fiddly. Now imagine a machine that could **guess**: "Is this the position where '01' starts?" If the guess is right, accept; if wrong, no problem — some other "copy" of the machine keeps exploring.

That's nondeterminism. It doesn't make the machine more powerful (in terms of what languages it recognizes), but it makes the **design** much simpler and more intuitive.

Think of it this way:
- A **DFA** is like following a single path through a maze
- An **NFA** is like exploring all paths simultaneously

---

## Formal Definition

An **NFA** is a 5-tuple:

$$N = (Q, \Sigma, \delta, q_0, F)$$

| Component | Name | Description |
|---|---|---|
| $Q$ | States | A finite set of states |
| $\Sigma$ | Input alphabet | A finite set of input symbols |
| $\delta$ | Transition function | $\delta : Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$ |
| $q_0$ | Start state | $q_0 \in Q$ |
| $F$ | Accept states | $F \subseteq Q$ |

### The Key Difference: $\delta$ Returns a SET

In a DFA, $\delta(q, a)$ returns a single state. In an NFA:

$$\delta : Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$

Here $\mathcal{P}(Q)$ is the **power set** of $Q$ — the set of all subsets of $Q$.

This means:
- $\delta(q, a)$ can return **multiple states** (the machine "splits" into copies)
- $\delta(q, a)$ can return the **empty set** $\emptyset$ (that computation path "dies")
- $\delta(q, \varepsilon)$ is defined — the machine can transition without reading input

### Comparison

| Feature | DFA | NFA |
|---|---|---|
| $\delta$ type | $Q \times \Sigma \to Q$ | $Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$ |
| Transitions per (state, symbol) | Exactly 1 | 0, 1, or many |
| $\varepsilon$-transitions | Not allowed | Allowed |
| Computation paths | 1 (deterministic) | Many (nondeterministic) |

---

## Epsilon Transitions

An **$\varepsilon$-transition** allows the NFA to move from one state to another **without consuming any input symbol**. It's written as:

$$\delta(q, \varepsilon) = \{r_1, r_2, \ldots\}$$

This means: "From state $q$, without reading anything, the machine can spontaneously move to $r_1$, or $r_2$, etc."

### $\varepsilon$-Closure

The **$\varepsilon$-closure** of a state $q$, written $\text{ECLOSE}(q)$, is the set of all states reachable from $q$ using **only** $\varepsilon$-transitions (including $q$ itself):

$$\text{ECLOSE}(q) = \{q\} \cup \{r \mid r \text{ is reachable from } q \text{ via one or more } \varepsilon\text{-transitions}\}$$

For a **set** of states $S$:

$$\text{ECLOSE}(S) = \bigcup_{q \in S} \text{ECLOSE}(q)$$

### Computing $\varepsilon$-Closure

```
function ECLOSE(q):
    result ← {q}
    stack ← [q]
    while stack is not empty:
        p ← stack.pop()
        for each r in δ(p, ε):
            if r ∉ result:
                result ← result ∪ {r}
                stack.push(r)
    return result
```

### Example

If $\delta(q_0, \varepsilon) = \{q_1\}$ and $\delta(q_1, \varepsilon) = \{q_2\}$, then:

$$\text{ECLOSE}(q_0) = \{q_0, q_1, q_2\}$$

The $\varepsilon$-closure is **transitive**: if you can reach $q_1$ from $q_0$ via $\varepsilon$, and $q_2$ from $q_1$ via $\varepsilon$, then $q_2$ is in $\text{ECLOSE}(q_0)$.

---

## How an NFA Processes Input

Given input string $w = a_1 a_2 \cdots a_n$, the NFA processes it as follows:

### Algorithm

```
function NFA_RUN(N, w):
    current_states ← ECLOSE(q₀)
    for each symbol aᵢ in w (left to right):
        next_states ← ∅
        for each state q in current_states:
            next_states ← next_states ∪ δ(q, aᵢ)
        current_states ← ECLOSE(next_states)
    if current_states ∩ F ≠ ∅:
        return ACCEPT
    else:
        return REJECT
```

### Step by Step

1. **Initialize:** Start in the set $\text{ECLOSE}(q_0)$ — the start state plus anything reachable via $\varepsilon$
2. **For each input symbol $a_i$:**
   - From every current state, take all transitions on $a_i$
   - Collect all resulting states
   - Take the $\varepsilon$-closure of the result
3. **After all input is read:** Check if any current state is an accept state
4. **Accept** if yes; **Reject** if no

### Key Point: Accept if ANY Path Reaches Accept

The NFA accepts a string $w$ if there **exists** at least one computation path from $q_0$ to some $q_f \in F$ that processes all of $w$. It doesn't matter if other paths die or reject — one successful path is enough.

Formally:

$$w \in L(N) \iff \exists \text{ a sequence of states } r_0, r_1, \ldots, r_m \text{ such that:}$$

1. $r_0 = q_0$
2. Each step follows $\delta$ (consuming one symbol or $\varepsilon$)
3. The symbols consumed spell out $w$
4. $r_m \in F$

---

## The "Guessing" Interpretation

A useful way to think about NFA computation:

> The NFA **guesses** the correct computation path, then verifies it.

Imagine the NFA has "magical intuition" — whenever there's a choice, it always picks the path that leads to acceptance (if such a path exists). This is equivalent to exploring all paths simultaneously and accepting if any one works.

This guessing power makes NFAs much easier to design:
- Instead of explicitly tracking all possibilities, you let the NFA **guess** the relevant moment and verify.

---

## NFA Computation Tree

Visualize the NFA's computation as a **tree**:

- **Root:** Start state ($q_0$ and its $\varepsilon$-closure)
- **Each level:** Corresponds to one input symbol
- **Branches:** Represent nondeterministic choices
- **Leaves:** States after all input is consumed

The NFA **accepts** if any leaf node is an accept state.

### Example Tree for NFA on input "01"

```
           {q₀}          Level 0 (start)
          /    \
    read 0      (ε-path?)
        |
       {q₀}              Level 1 (after reading '0')
        |
    read 1
        |
     {q₀, q₂}           Level 2 (after reading '01')
```

(Details depend on the specific NFA.)

---

## Extended Transition Function for NFA

Define $\hat{\delta} : Q \times \Sigma^* \to \mathcal{P}(Q)$:

$$\hat{\delta}(q, \varepsilon) = \text{ECLOSE}(q)$$

$$\hat{\delta}(q, wa) = \text{ECLOSE}\left(\bigcup_{r \in \hat{\delta}(q, w)} \delta(r, a)\right)$$

The language of the NFA:

$$L(N) = \{w \in \Sigma^* \mid \hat{\delta}(q_0, w) \cap F \neq \emptyset\}$$

---

## Example 1: Strings Ending in "01"

**Language:** $L = \{w \in \{0, 1\}^* \mid w \text{ ends in } 01\}$

### NFA Design

The idea: the NFA **guesses** when the last "01" starts.

**States:** $q_0, q_1, q_2$

- $q_0$: Haven't started the final "01" yet (or guess is wrong)
- $q_1$: Guessed that we're at the "0" of the ending "01"
- $q_2$: Saw "01" at the end — accept!

**Transitions:**

| State | Read 0 | Read 1 | $\varepsilon$ |
|---|---|---|---|
| $q_0$ | $\{q_0, q_1\}$ | $\{q_0\}$ | $\emptyset$ |
| $q_1$ | $\emptyset$ | $\{q_2\}$ | $\emptyset$ |
| $q_2$ | $\emptyset$ | $\emptyset$ | $\emptyset$ |

**Key insight:** From $q_0$, reading 0 goes to both $q_0$ (keep waiting) and $q_1$ (guess this is the start of "01"). This is the nondeterministic choice!

- **Start:** $q_0$
- **Accept:** $\{q_2\}$

### Trace: $w = 101$

| Step | Current States | Symbol | Next States |
|---|---|---|---|
| 0 | $\{q_0\}$ | 1 | $\{q_0\}$ |
| 1 | $\{q_0\}$ | 0 | $\{q_0, q_1\}$ |
| 2 | $\{q_0, q_1\}$ | 1 | $\{q_0\} \cup \{q_2\} = \{q_0, q_2\}$ |

Final: $\{q_0, q_2\}$. Since $q_2 \in F$, **Accept** ✓

### Trace: $w = 10$

| Step | Current States | Symbol | Next States |
|---|---|---|---|
| 0 | $\{q_0\}$ | 1 | $\{q_0\}$ |
| 1 | $\{q_0\}$ | 0 | $\{q_0, q_1\}$ |

Final: $\{q_0, q_1\}$. Neither is in $F$, **Reject** ✗

### Comparison with DFA

A DFA for the same language needs to track the last two symbols — requiring at least 4 states with careful transitions. The NFA does it in 3 states with a simple, intuitive design.

---

## Example 2: Contains "ab" OR "ba"

**Language:** $L = \{w \in \{a, b\}^* \mid w \text{ contains "ab" or "ba" as a substring}\}$

### NFA Design

Use $\varepsilon$-transitions to "branch" into two parallel searches:

**States:** $q_0, q_1, q_2, q_3, q_4, q_5, q_6$

- $q_0$: Start (branch to two sub-NFAs)
- $q_1, q_2, q_3$: Searching for "ab"
- $q_4, q_5, q_6$: Searching for "ba"

**Transitions:**

From $q_0$:
- $\delta(q_0, \varepsilon) = \{q_1, q_4\}$ (branch!)

Sub-NFA for "ab":
- $\delta(q_1, a) = \{q_1\}$, $\delta(q_1, b) = \{q_1\}$, but also $\delta(q_1, a) = \{q_1, q_2\}$ (guess "ab" starts)
- Simpler: $\delta(q_1, a) = \{q_1, q_2\}$, $\delta(q_1, b) = \{q_1\}$
- $\delta(q_2, b) = \{q_3\}$
- $q_3$ loops: $\delta(q_3, a) = \{q_3\}$, $\delta(q_3, b) = \{q_3\}$

Sub-NFA for "ba":
- $\delta(q_4, a) = \{q_4\}$, $\delta(q_4, b) = \{q_4, q_5\}$ (guess "ba" starts)
- $\delta(q_5, a) = \{q_6\}$
- $q_6$ loops: $\delta(q_6, a) = \{q_6\}$, $\delta(q_6, b) = \{q_6\}$

**Accept:** $\{q_3, q_6\}$

This NFA elegantly handles "or" by branching at the start.

---

## Example 3: Multiples of 2 or 3

**Language:** $L = \{a^n \mid n \text{ is a multiple of 2 or a multiple of 3}\}$

### NFA Design

Use $\varepsilon$-transitions to branch into two sub-NFAs:

**Sub-NFA for multiples of 2:**
- States: $p_0, p_1$ (cycling modulo 2)
- $\delta(p_0, a) = \{p_1\}$, $\delta(p_1, a) = \{p_0\}$
- Accept: $\{p_0\}$

**Sub-NFA for multiples of 3:**
- States: $r_0, r_1, r_2$ (cycling modulo 3)
- $\delta(r_0, a) = \{r_1\}$, $\delta(r_1, a) = \{r_2\}$, $\delta(r_2, a) = \{r_0\}$
- Accept: $\{r_0\}$

**Combined NFA:**
- New start state $q_0$ with $\delta(q_0, \varepsilon) = \{p_0, r_0\}$
- Accept: $\{p_0, r_0\}$

This accepts $\varepsilon$ (= $a^0$, and 0 is a multiple of both 2 and 3), $aa$ (multiple of 2), $aaa$ (multiple of 3), $aaaa$ (multiple of 2), etc.

---

## Example 4: NFA with $\varepsilon$-Transitions

Consider this NFA:
- $Q = \{q_0, q_1, q_2, q_3\}$
- $\Sigma = \{a, b\}$
- Start: $q_0$, Accept: $\{q_3\}$

**Transitions:**

| State | $a$ | $b$ | $\varepsilon$ |
|---|---|---|---|
| $q_0$ | $\{q_0\}$ | $\emptyset$ | $\{q_1\}$ |
| $q_1$ | $\emptyset$ | $\{q_1, q_2\}$ | $\emptyset$ |
| $q_2$ | $\{q_3\}$ | $\emptyset$ | $\emptyset$ |
| $q_3$ | $\emptyset$ | $\emptyset$ | $\emptyset$ |

### $\varepsilon$-Closures

- $\text{ECLOSE}(q_0) = \{q_0, q_1\}$ (since $q_0 \xrightarrow{\varepsilon} q_1$)
- $\text{ECLOSE}(q_1) = \{q_1\}$
- $\text{ECLOSE}(q_2) = \{q_2\}$
- $\text{ECLOSE}(q_3) = \{q_3\}$

### Trace: $w = aba$

| Step | Current States | Symbol | Raw Next | After ECLOSE |
|---|---|---|---|---|
| Init | — | — | — | $\text{ECLOSE}(q_0) = \{q_0, q_1\}$ |
| 1 | $\{q_0, q_1\}$ | $a$ | $\delta(q_0, a) \cup \delta(q_1, a) = \{q_0\} \cup \emptyset = \{q_0\}$ | $\text{ECLOSE}(\{q_0\}) = \{q_0, q_1\}$ |
| 2 | $\{q_0, q_1\}$ | $b$ | $\delta(q_0, b) \cup \delta(q_1, b) = \emptyset \cup \{q_1, q_2\} = \{q_1, q_2\}$ | $\text{ECLOSE}(\{q_1, q_2\}) = \{q_1, q_2\}$ |
| 3 | $\{q_1, q_2\}$ | $a$ | $\delta(q_1, a) \cup \delta(q_2, a) = \emptyset \cup \{q_3\} = \{q_3\}$ | $\text{ECLOSE}(\{q_3\}) = \{q_3\}$ |

Final: $\{q_3\} \cap \{q_3\} \neq \emptyset$ → **Accept** ✓

### What Language Does This NFA Recognize?

By analysis: it accepts strings of the form $a^* b^+ a$ where there's at least one $b$ followed by exactly one $a$. More precisely, strings matching the pattern $a^*b(b)^*a$ — i.e., some (possibly zero) $a$'s, then one or more $b$'s, then one $a$.

---

## DFA vs NFA: Same Power, Different Convenience

This is one of the most surprising results in automata theory:

> **Theorem:** For every NFA $N$, there exists a DFA $D$ such that $L(N) = L(D)$.

In other words, nondeterminism does **not** add computational power to finite automata. Both models recognize exactly the **regular languages**.

### Why?

Because you can simulate an NFA with a DFA using the **subset construction** (covered in a later lesson). The DFA's states are subsets of the NFA's states — tracking all possible states the NFA could be in simultaneously.

### Why Use NFAs Then?

| NFAs are better for... | DFAs are better for... |
|---|---|
| **Designing** automata (simpler) | **Implementing** automata (deterministic) |
| **Proving** closure properties | **Simulating** (O(1) per symbol) |
| **Composing** automata (union, concat, star) | **Minimizing** (unique minimal DFA) |
| **Understanding** language structure | **Deciding** membership efficiently |

---

## Why Nondeterminism Matters

Even though NFAs aren't "more powerful," nondeterminism is crucial in theoretical computer science:

### 1. Simpler Proofs

Many theorems about regular languages are trivial to prove using NFAs but painful with DFAs. For example, closure under union is immediate with NFAs (just add $\varepsilon$-transitions from a new start state) but requires a product construction with DFAs.

### 2. Modeling Search

NFA computation models **searching** through possibilities. This is exactly what happens in regex matching, where the engine explores multiple matching paths.

### 3. Foundation for Complexity Theory

The concept of nondeterminism scales up to Turing machines, giving us the class **NP** (Nondeterministic Polynomial time). The famous $P \neq NP$ question asks whether nondeterministic guessing provides genuine speedup for Turing machines.

### 4. Composition

NFAs compose beautifully. Given NFAs for $L_1$ and $L_2$:
- **Union** $L_1 \cup L_2$: Add new start with $\varepsilon$-transitions to both
- **Concatenation** $L_1 \cdot L_2$: Connect accept states of first to start of second via $\varepsilon$
- **Kleene star** $L_1^*$: Add loop-back $\varepsilon$-transitions

These constructions are simple and elegant — something that's much harder with DFAs directly.

---

## Formal Language of an NFA

The **language** recognized by NFA $N$ is:

$$L(N) = \{w \in \Sigma^* \mid \hat{\delta}(q_0, w) \cap F \neq \emptyset\}$$

Equivalently, $w \in L(N)$ if and only if there exists an **accepting computation** on $w$ — a sequence of transitions that processes all of $w$ and ends in an accept state.

---

## Exercises

### Exercise 1

Design an NFA over $\{0, 1\}$ that accepts strings containing "110" as a substring.

**Solution:** 4 states: $q_0$ (loop on 0,1; guess on 1 → $q_1$), $q_1$ (on 1 → $q_2$), $q_2$ (on 0 → $q_3$), $q_3$ (accept, loop on 0,1).

### Exercise 2

Design an NFA over $\{a, b\}$ accepting strings of length exactly 3 or exactly 5.

**Solution:** Use $\varepsilon$-branching from start to two chains: one of length 3 and one of length 5. Each chain reads any symbol at each step.

### Exercise 3

Convert this NFA to its language description: States $\{q_0, q_1\}$, start $q_0$, accept $\{q_1\}$, $\delta(q_0, a) = \{q_1\}$, $\delta(q_0, b) = \{q_0\}$, $\delta(q_1, a) = \emptyset$, $\delta(q_1, b) = \emptyset$.

**Solution:** This NFA accepts strings that end in $a$ and have no symbols after the last $a$... but more precisely, it accepts $b^*a$ — strings of zero or more $b$'s followed by exactly one $a$. Once it reads $a$, it must be at the end (no transitions from $q_1$).

### Exercise 4

True or false: If an NFA has $n$ states, the equivalent DFA always has $2^n$ states.

**Solution:** **False.** The DFA has **at most** $2^n$ states, but in practice many subsets are unreachable. The actual number of states depends on the specific NFA.

### Exercise 5

Design an NFA with $\varepsilon$-transitions that accepts $\{a^n \mid n \geq 0 \text{ and } n \neq 2\}$.

**Solution:** Branch with $\varepsilon$: one path accepts $\varepsilon$ (0 $a$'s), another accepts exactly 1 $a$, and another accepts 3 or more $a$'s. The "3 or more" branch reads $aaa$ then loops.

---

## Common NFA Design Patterns

Here are some patterns that appear frequently in NFA design:

### Pattern 1: "Contains Substring $w$"

For any fixed string $w = a_1 a_2 \cdots a_k$:

1. Start state $q_0$ loops on all symbols (waiting to guess)
2. From $q_0$, on symbol $a_1$, also go to $q_1$ (guess start of $w$)
3. Chain: $q_1 \xrightarrow{a_2} q_2 \xrightarrow{a_3} \cdots \xrightarrow{a_k} q_k$
4. $q_k$ is accepting and loops on all symbols

States needed: $k + 1$ (where $k = |w|$)

### Pattern 2: "Ends with $w$"

Same as "contains $w$" but $q_k$ does NOT loop — if more input arrives after the guess, that path dies. Only the path that guessed the correct ending survives.

### Pattern 3: "At Least One of Several Patterns"

For $L_1 \cup L_2 \cup \cdots \cup L_m$:
- New start state $q_0$
- $\varepsilon$-transitions from $q_0$ to the start of each sub-NFA
- Accept states: union of all sub-NFA accept states

### Pattern 4: "Length Satisfies a Condition"

For languages based on string length (like "length is divisible by 2 or 3"):
- Build separate cycle-counting NFAs
- Combine with union construction

### Pattern 5: "$k$-th Symbol from End"

For "the symbol at position $|w| - k + 1$ is $a$":
- Start state loops on everything
- Nondeterministically branch when reading $a$
- Chain of $k - 1$ states reading any symbol
- Last state in chain is accepting (no outgoing transitions)

---

## NFA vs Regex: A Preview

NFAs are closely related to **regular expressions**. In fact:

- Every regular expression can be converted to an NFA (using the closure constructions)
- Every NFA can be converted to a regular expression (using state elimination)

This establishes the equivalence: NFAs, DFAs, and regular expressions all define the same class of languages — the **regular languages**.

The closure constructions (union, concatenation, Kleene star) correspond directly to the three operators in regular expressions:
- Union ($|$ or $+$) → NFA union construction
- Concatenation (juxtaposition) → NFA concatenation construction
- Kleene star ($*$) → NFA star construction

---

## Nondeterminism in Practice

While "true" nondeterminism doesn't exist in real hardware, NFA simulation is used extensively:

### Regular Expression Engines

Most regex engines internally convert the regex to an NFA and simulate it. The Thompson NFA construction (1968) converts any regex to an NFA with at most $2|r|$ states (where $|r|$ is the regex length).

### Backtracking Search

Programming techniques like backtracking (used in Prolog, constraint solvers, and SAT solvers) are essentially nondeterministic search — exploring all paths and accepting if any succeed.

### Parallel Computation

You can think of an NFA as a parallel machine: each nondeterministic branch runs simultaneously. This maps naturally to parallel hardware and algorithms.

---

## Summary

| Concept | Description |
|---|---|
| NFA | Like DFA but $\delta$ returns a set of states; allows $\varepsilon$-transitions |
| $\varepsilon$-transition | State change without consuming input |
| ECLOSE($q$) | All states reachable from $q$ via $\varepsilon$-transitions |
| Acceptance | String accepted if ANY computation path reaches an accept state |
| Power | NFAs recognize exactly the regular languages (same as DFAs) |
| Advantage | Much easier to design; compose elegantly |
| Design patterns | Guess the critical moment; use $\varepsilon$ for branching |

---

## What's Next?

In the next lesson, we'll practice designing NFAs with more complex examples, including formal closure constructions (union, concatenation, Kleene star) that prove regular languages are closed under these operations.
