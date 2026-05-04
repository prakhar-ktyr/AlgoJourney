---
title: "NFA to DFA: Subset Construction"
---

# NFA to DFA: Subset Construction

One of the most fundamental results in automata theory is that **every NFA has an equivalent DFA**. This means nondeterminism does not increase the power of finite automata — both models recognize exactly the class of regular languages. The algorithm that proves this is called the **subset construction** (also known as the **Rabin-Scott powerset construction**).

---

## The Equivalence Theorem

> **Theorem (Rabin & Scott, 1959):** For every NFA $N$, there exists a DFA $D$ such that $L(N) = L(D)$.

The proof is constructive — we build $D$ explicitly from $N$. The resulting DFA simulates the NFA by keeping track of **all possible states** the NFA could be in at each point.

---

## Intuition

When simulating an NFA on input $w$, we track a **set** of current states (since the NFA can be in multiple states simultaneously). This set changes deterministically as we read each symbol:

$$\text{current states} \xrightarrow{a} \text{new set of states}$$

The key insight: if we treat each **set of NFA states** as a single **DFA state**, we get a deterministic machine!

---

## The Subset Construction Algorithm

Given NFA $N = (Q, \Sigma, \delta_N, q_0, F)$, construct DFA $D = (Q', \Sigma, \delta_D, q_0', F')$:

### Step 1: States of the DFA

$$Q' = \mathcal{P}(Q)$$

Each state of the DFA is a **subset** of NFA states. If the NFA has $n$ states, the DFA has at most $2^n$ states.

We'll write DFA states as sets: $\{q_1, q_3, q_5\}$ represents "the NFA could be in $q_1$, $q_3$, or $q_5$."

### Step 2: Start State

$$q_0' = \text{ECLOSE}(q_0)$$

The DFA starts in the set containing the NFA's start state and everything reachable via $\varepsilon$-transitions.

### Step 3: Transition Function

For each DFA state $S \subseteq Q$ and each symbol $a \in \Sigma$:

$$\delta_D(S, a) = \text{ECLOSE}\left(\bigcup_{q \in S} \delta_N(q, a)\right)$$

In words: from the set $S$, reading symbol $a$:
1. For each state $q$ in $S$, find where the NFA goes on $a$: $\delta_N(q, a)$
2. Take the union of all these results
3. Take the $\varepsilon$-closure of the union

### Step 4: Accept States

$$F' = \{S \in Q' \mid S \cap F \neq \emptyset\}$$

A DFA state (which is a set of NFA states) is accepting if it **contains** at least one NFA accept state.

---

## The Algorithm in Pseudocode

```
function SUBSET_CONSTRUCTION(N):
    Input: NFA N = (Q, Σ, δ_N, q₀, F)
    Output: DFA D = (Q', Σ, δ_D, q₀', F')

    q₀' ← ECLOSE(q₀)
    Q' ← {q₀'}
    worklist ← [q₀']
    δ_D ← empty table

    while worklist is not empty:
        S ← worklist.dequeue()
        for each a ∈ Σ:
            T ← ECLOSE(⋃_{q ∈ S} δ_N(q, a))
            δ_D(S, a) ← T
            if T ∉ Q':
                Q' ← Q' ∪ {T}
                worklist.enqueue(T)

    F' ← {S ∈ Q' | S ∩ F ≠ ∅}
    return D = (Q', Σ, δ_D, q₀', F')
```

This algorithm only constructs **reachable** states (the lazy/on-demand approach), avoiding the full $2^n$ blowup when many subsets are unreachable.

---

## Potential Exponential Blowup

### Worst Case

An NFA with $n$ states can require a DFA with up to $2^n$ states. This exponential blowup is unavoidable in the worst case.

**Why?** The DFA must distinguish between $2^n$ different subsets, and there exist NFAs where all $2^n$ subsets are reachable and distinguishable.

### In Practice

Most NFAs don't trigger the worst case. Many subsets are unreachable, so the DFA is much smaller. The lazy algorithm (only constructing reachable states) handles this efficiently.

### State Complexity

$$|Q'| \leq 2^{|Q|}$$

This bound is tight: there exist $n$-state NFAs whose minimal equivalent DFA has exactly $2^n$ states.

---

## Complete Example 1: NFA for Strings Ending in "01"

### The NFA

$N = (\{q_0, q_1, q_2\}, \{0, 1\}, \delta_N, q_0, \{q_2\})$

| State | $\delta_N(\cdot, 0)$ | $\delta_N(\cdot, 1)$ |
|---|---|---|
| $q_0$ | $\{q_0, q_1\}$ | $\{q_0\}$ |
| $q_1$ | $\emptyset$ | $\{q_2\}$ |
| $q_2$ | $\emptyset$ | $\emptyset$ |

No $\varepsilon$-transitions, so $\text{ECLOSE}(q) = \{q\}$ for all $q$.

### Step 1: Start State

$$q_0' = \text{ECLOSE}(q_0) = \{q_0\}$$

### Step 2: Compute Transitions from $\{q_0\}$

$$\delta_D(\{q_0\}, 0) = \text{ECLOSE}(\delta_N(q_0, 0)) = \text{ECLOSE}(\{q_0, q_1\}) = \{q_0, q_1\}$$

$$\delta_D(\{q_0\}, 1) = \text{ECLOSE}(\delta_N(q_0, 1)) = \text{ECLOSE}(\{q_0\}) = \{q_0\}$$

New state discovered: $\{q_0, q_1\}$

### Step 3: Compute Transitions from $\{q_0, q_1\}$

$$\delta_D(\{q_0, q_1\}, 0) = \text{ECLOSE}(\delta_N(q_0, 0) \cup \delta_N(q_1, 0))$$
$$= \text{ECLOSE}(\{q_0, q_1\} \cup \emptyset) = \{q_0, q_1\}$$

$$\delta_D(\{q_0, q_1\}, 1) = \text{ECLOSE}(\delta_N(q_0, 1) \cup \delta_N(q_1, 1))$$
$$= \text{ECLOSE}(\{q_0\} \cup \{q_2\}) = \{q_0, q_2\}$$

New state discovered: $\{q_0, q_2\}$

### Step 4: Compute Transitions from $\{q_0, q_2\}$

$$\delta_D(\{q_0, q_2\}, 0) = \text{ECLOSE}(\delta_N(q_0, 0) \cup \delta_N(q_2, 0))$$
$$= \text{ECLOSE}(\{q_0, q_1\} \cup \emptyset) = \{q_0, q_1\}$$

$$\delta_D(\{q_0, q_2\}, 1) = \text{ECLOSE}(\delta_N(q_0, 1) \cup \delta_N(q_2, 1))$$
$$= \text{ECLOSE}(\{q_0\} \cup \emptyset) = \{q_0\}$$

No new states discovered. Algorithm terminates.

### Step 5: Identify Accept States

$F' = \{S \mid S \cap \{q_2\} \neq \emptyset\} = \{\{q_0, q_2\}\}$

### Result: Complete DFA

| DFA State | Meaning | Read 0 | Read 1 | Accept? |
|---|---|---|---|---|
| $\{q_0\}$ | No progress toward "01" | $\{q_0, q_1\}$ | $\{q_0\}$ | No |
| $\{q_0, q_1\}$ | Just saw a 0 | $\{q_0, q_1\}$ | $\{q_0, q_2\}$ | No |
| $\{q_0, q_2\}$ | Just saw "01" | $\{q_0, q_1\}$ | $\{q_0\}$ | **Yes** |

Let's rename for clarity: $A = \{q_0\}$, $B = \{q_0, q_1\}$, $C = \{q_0, q_2\}$

| State | Read 0 | Read 1 | Accept? |
|---|---|---|---|
| $A$ (start) | $B$ | $A$ | No |
| $B$ | $B$ | $C$ | No |
| $C$ | $B$ | $A$ | **Yes** |

### Verification: $w = 1001$

DFA trace: $A \xrightarrow{1} A \xrightarrow{0} B \xrightarrow{0} B \xrightarrow{1} C$ → Accept ✓

DFA trace for $w = 10$: $A \xrightarrow{1} A \xrightarrow{0} B$ → Reject ✓

The NFA had 3 states; the DFA also has 3 reachable states (out of $2^3 = 8$ possible). Much less than worst case!

---

## Complete Example 2: NFA with $\varepsilon$-Transitions

### The NFA

$N = (\{q_0, q_1, q_2\}, \{a, b\}, \delta_N, q_0, \{q_2\})$

| State | $\delta_N(\cdot, a)$ | $\delta_N(\cdot, b)$ | $\delta_N(\cdot, \varepsilon)$ |
|---|---|---|---|
| $q_0$ | $\{q_0\}$ | $\emptyset$ | $\{q_1\}$ |
| $q_1$ | $\emptyset$ | $\{q_1, q_2\}$ | $\emptyset$ |
| $q_2$ | $\{q_2\}$ | $\emptyset$ | $\emptyset$ |

### Step 0: Compute $\varepsilon$-Closures

$$\text{ECLOSE}(q_0) = \{q_0, q_1\}$$
$$\text{ECLOSE}(q_1) = \{q_1\}$$
$$\text{ECLOSE}(q_2) = \{q_2\}$$

### Step 1: Start State

$$q_0' = \text{ECLOSE}(q_0) = \{q_0, q_1\}$$

### Step 2: Transitions from $\{q_0, q_1\}$

**On $a$:**
$$\delta_N(q_0, a) \cup \delta_N(q_1, a) = \{q_0\} \cup \emptyset = \{q_0\}$$
$$\text{ECLOSE}(\{q_0\}) = \{q_0, q_1\}$$

So $\delta_D(\{q_0, q_1\}, a) = \{q_0, q_1\}$ (self-loop!)

**On $b$:**
$$\delta_N(q_0, b) \cup \delta_N(q_1, b) = \emptyset \cup \{q_1, q_2\} = \{q_1, q_2\}$$
$$\text{ECLOSE}(\{q_1, q_2\}) = \{q_1, q_2\}$$

So $\delta_D(\{q_0, q_1\}, b) = \{q_1, q_2\}$ — new state!

### Step 3: Transitions from $\{q_1, q_2\}$

**On $a$:**
$$\delta_N(q_1, a) \cup \delta_N(q_2, a) = \emptyset \cup \{q_2\} = \{q_2\}$$
$$\text{ECLOSE}(\{q_2\}) = \{q_2\}$$

So $\delta_D(\{q_1, q_2\}, a) = \{q_2\}$ — new state!

**On $b$:**
$$\delta_N(q_1, b) \cup \delta_N(q_2, b) = \{q_1, q_2\} \cup \emptyset = \{q_1, q_2\}$$
$$\text{ECLOSE}(\{q_1, q_2\}) = \{q_1, q_2\}$$

So $\delta_D(\{q_1, q_2\}, b) = \{q_1, q_2\}$ (self-loop)

### Step 4: Transitions from $\{q_2\}$

**On $a$:**
$$\delta_N(q_2, a) = \{q_2\}$$
$$\text{ECLOSE}(\{q_2\}) = \{q_2\}$$

So $\delta_D(\{q_2\}, a) = \{q_2\}$ (self-loop)

**On $b$:**
$$\delta_N(q_2, b) = \emptyset$$
$$\text{ECLOSE}(\emptyset) = \emptyset$$

So $\delta_D(\{q_2\}, b) = \emptyset$ — new state!

### Step 5: Transitions from $\emptyset$

The empty set is the **dead state** (or **trap state**):

$$\delta_D(\emptyset, a) = \text{ECLOSE}\left(\bigcup_{q \in \emptyset} \delta_N(q, a)\right) = \text{ECLOSE}(\emptyset) = \emptyset$$

$$\delta_D(\emptyset, b) = \emptyset$$

### Step 6: Accept States

$$F' = \{S \mid S \cap \{q_2\} \neq \emptyset\} = \{\{q_1, q_2\}, \{q_2\}\}$$

### Result

| DFA State | Read $a$ | Read $b$ | Accept? |
|---|---|---|---|
| $\{q_0, q_1\}$ (start) | $\{q_0, q_1\}$ | $\{q_1, q_2\}$ | No |
| $\{q_1, q_2\}$ | $\{q_2\}$ | $\{q_1, q_2\}$ | **Yes** |
| $\{q_2\}$ | $\{q_2\}$ | $\emptyset$ | **Yes** |
| $\emptyset$ | $\emptyset$ | $\emptyset$ | No |

Renamed: $A = \{q_0, q_1\}$, $B = \{q_1, q_2\}$, $C = \{q_2\}$, $D = \emptyset$

The DFA has 4 reachable states (out of $2^3 = 8$). The language: strings of the form $a^*b^+a^*$ that contain at least one $b$ (from the NFA's structure, it accepts $a^*b(a|b)^*$ ... let's verify):

- $w = b$: $A \xrightarrow{b} B$ → Accept ✓
- $w = ab$: $A \xrightarrow{a} A \xrightarrow{b} B$ → Accept ✓
- $w = ba$: $A \xrightarrow{b} B \xrightarrow{a} C$ → Accept ✓
- $w = a$: $A \xrightarrow{a} A$ → Reject ✓

---

## Complete Example 3: Exponential Blowup

### The NFA

Consider the NFA for "$n$-th symbol from the end is 1" over $\Sigma = \{0, 1\}$. For $n = 3$:

**States:** $q_0, q_1, q_2, q_3$

| State | Read 0 | Read 1 |
|---|---|---|
| $q_0$ | $\{q_0\}$ | $\{q_0, q_1\}$ |
| $q_1$ | $\{q_2\}$ | $\{q_2\}$ |
| $q_2$ | $\{q_3\}$ | $\{q_3\}$ |
| $q_3$ | $\emptyset$ | $\emptyset$ |

Start: $q_0$, Accept: $\{q_3\}$

This NFA has 4 states. But the equivalent DFA needs to track the **last 3 symbols** — that's $2^3 = 8$ distinct situations.

### Why All 8 Subsets Are Needed

The DFA must distinguish between all possible combinations of the last 3 symbols: $000, 001, 010, 011, 100, 101, 110, 111$. Each requires a different response to future input, so no two can be merged.

### General Result

For the language "the $n$-th-from-last symbol is 1":
- NFA: $n + 1$ states
- Minimal DFA: $2^n$ states

This proves the exponential blowup is inherent, not an artifact of the construction.

---

## Correctness Proof Sketch

**Claim:** $L(N) = L(D)$ where $D$ is produced by the subset construction.

**Proof idea:** We show by induction on $|w|$ that:

$$\hat{\delta}_D(q_0', w) = \hat{\delta}_N(q_0, w)$$

That is, after processing string $w$, the DFA state (a subset) equals exactly the set of NFA states reachable from $q_0$ on input $w$.

**Base case:** $w = \varepsilon$

$$\hat{\delta}_D(q_0', \varepsilon) = q_0' = \text{ECLOSE}(q_0) = \hat{\delta}_N(q_0, \varepsilon) \checkmark$$

**Inductive step:** Assume the claim holds for string $w$. For string $wa$ (where $a \in \Sigma$):

$$\hat{\delta}_D(q_0', wa) = \delta_D(\hat{\delta}_D(q_0', w), a)$$
$$= \delta_D(\hat{\delta}_N(q_0, w), a) \quad \text{(by induction hypothesis)}$$
$$= \text{ECLOSE}\left(\bigcup_{q \in \hat{\delta}_N(q_0, w)} \delta_N(q, a)\right) \quad \text{(by construction of } \delta_D\text{)}$$
$$= \hat{\delta}_N(q_0, wa) \quad \text{(by definition of NFA's } \hat{\delta}_N\text{)}$$

**Conclusion:** $w \in L(D) \iff \hat{\delta}_D(q_0', w) \in F' \iff \hat{\delta}_N(q_0, w) \cap F \neq \emptyset \iff w \in L(N)$

---

## Optimization: Lazy Construction

The full power set $\mathcal{P}(Q)$ can have $2^n$ elements, but many of these subsets may be **unreachable** from the start state. The algorithm above already handles this — it only explores states reachable from $q_0'$.

### Benefits

- Often produces far fewer than $2^n$ states
- Can be stopped early if we only need to check membership for specific strings
- Equivalent to BFS/DFS from the start state in the "subset graph"

### When It Doesn't Help

For the worst-case NFAs (like the "n-th from end" example), all $2^n$ subsets are reachable, and lazy construction doesn't save anything.

---

## Summary of the Process

| Step | Action |
|---|---|
| 1 | Compute $\varepsilon$-closures for all NFA states |
| 2 | Set DFA start = ECLOSE(NFA start) |
| 3 | For each new DFA state $S$ and each symbol $a$: compute $\delta_D(S, a)$ |
| 4 | Repeat until no new states are discovered |
| 5 | Mark DFA states containing NFA accept states as accepting |

---

## Exercises

### Exercise 1

Convert this NFA to a DFA:
- States: $\{q_0, q_1, q_2\}$, Alphabet: $\{a, b\}$
- Start: $q_0$, Accept: $\{q_2\}$
- $\delta(q_0, a) = \{q_0, q_1\}$, $\delta(q_0, b) = \{q_0\}$
- $\delta(q_1, a) = \emptyset$, $\delta(q_1, b) = \{q_2\}$
- $\delta(q_2, a) = \emptyset$, $\delta(q_2, b) = \emptyset$

**Solution:**

Start: $\{q_0\}$

From $\{q_0\}$: on $a$ → $\{q_0, q_1\}$, on $b$ → $\{q_0\}$

From $\{q_0, q_1\}$: on $a$ → $\{q_0, q_1\}$, on $b$ → $\{q_0, q_2\}$

From $\{q_0, q_2\}$: on $a$ → $\{q_0, q_1\}$, on $b$ → $\{q_0\}$

Accept states: $\{q_0, q_2\}$

DFA has 3 reachable states. Language: strings containing "ab" as substring.

### Exercise 2

Convert this NFA with $\varepsilon$-transitions to a DFA:
- States: $\{q_0, q_1, q_2\}$
- $\delta(q_0, \varepsilon) = \{q_1\}$, $\delta(q_0, a) = \{q_0\}$
- $\delta(q_1, b) = \{q_2\}$, $\delta(q_2, a) = \{q_2\}$, $\delta(q_2, b) = \{q_2\}$
- Accept: $\{q_2\}$

**Solution:**

ECLOSE($q_0$) = $\{q_0, q_1\}$. Start state: $\{q_0, q_1\}$.

From $\{q_0, q_1\}$: on $a$ → ECLOSE($\{q_0\}$) = $\{q_0, q_1\}$, on $b$ → ECLOSE($\{q_2\}$) = $\{q_2\}$

From $\{q_2\}$: on $a$ → $\{q_2\}$, on $b$ → $\{q_2\}$

Accept: $\{q_2\}$. DFA has 2 reachable states!

### Exercise 3

Give an example of a 2-state NFA whose equivalent DFA requires 4 states.

**Hint:** Think about a language where you need to track all 4 subsets: $\emptyset, \{q_0\}, \{q_1\}, \{q_0, q_1\}$.

**Solution:**

NFA with states $\{q_0, q_1\}$, alphabet $\{a, b\}$, start $q_0$, accept $\{q_1\}$:
- $\delta(q_0, a) = \{q_0, q_1\}$, $\delta(q_0, b) = \emptyset$
- $\delta(q_1, a) = \emptyset$, $\delta(q_1, b) = \{q_0\}$

DFA states (all reachable):
- $\{q_0\}$ (start): on $a$ → $\{q_0, q_1\}$, on $b$ → $\emptyset$
- $\{q_0, q_1\}$: on $a$ → $\{q_0, q_1\}$, on $b$ → $\{q_0\}$
- $\emptyset$: on $a$ → $\emptyset$, on $b$ → $\emptyset$
- $\{q_1\}$: this state is NOT reachable in this example.

Hmm — let's try: $\delta(q_0, a) = \{q_1\}$, $\delta(q_0, b) = \{q_0\}$, $\delta(q_1, a) = \{q_0\}$, $\delta(q_1, b) = \{q_1\}$. Start $q_0$, accept $\{q_0\}$.

DFA: $\{q_0\}$: $a \to \{q_1\}$, $b \to \{q_0\}$. $\{q_1\}$: $a \to \{q_0\}$, $b \to \{q_1\}$. Only 2 DFA states — same as NFA.

Better example: $\delta(q_0, a) = \{q_0, q_1\}$, $\delta(q_0, b) = \emptyset$, $\delta(q_1, a) = \emptyset$, $\delta(q_1, b) = \{q_0, q_1\}$. Start $q_0$, accept $\{q_1\}$.

DFA: $\{q_0\}$: $a \to \{q_0, q_1\}$, $b \to \emptyset$. $\{q_0, q_1\}$: $a \to \{q_0, q_1\}$, $b \to \{q_0, q_1\}$. $\emptyset$: $a \to \emptyset$, $b \to \emptyset$. Only 3 reachable.

The key insight: getting all 4 subsets reachable with only 2 NFA states requires careful design. One working example uses the language "second-to-last symbol is $a$" restricted to short strings — but the classic exponential example uses the "n-th from end" pattern.

### Exercise 4

True or false: The subset construction always produces the **minimal** DFA for the language.

**Solution:** **False.** The subset construction may produce a DFA with more states than necessary. Minimization (covered in the next lesson) is needed to obtain the minimal DFA.

### Exercise 5

An NFA has 5 states. What is the maximum number of states the equivalent DFA could have? What is the minimum?

**Solution:** Maximum: $2^5 = 32$ (if all subsets are reachable and distinguishable). Minimum: 1 (if the NFA accepts all strings $\Sigma^*$, the DFA needs only 1 accepting state).

### Exercise 6

Apply the subset construction to this NFA and determine the number of reachable DFA states:
- States: $\{q_0, q_1, q_2, q_3\}$, Alphabet: $\{0, 1\}$
- Start: $q_0$, Accept: $\{q_3\}$
- $\delta(q_0, 0) = \{q_0\}$, $\delta(q_0, 1) = \{q_0, q_1\}$
- $\delta(q_1, 0) = \{q_2\}$, $\delta(q_1, 1) = \{q_2\}$
- $\delta(q_2, 0) = \{q_3\}$, $\delta(q_2, 1) = \{q_3\}$
- $\delta(q_3, 0) = \emptyset$, $\delta(q_3, 1) = \emptyset$

**Solution:** This NFA recognizes "the third-from-last symbol is 1."

Start: $\{q_0\}$.

From $\{q_0\}$: on 0 → $\{q_0\}$, on 1 → $\{q_0, q_1\}$.
From $\{q_0, q_1\}$: on 0 → $\{q_0, q_2\}$, on 1 → $\{q_0, q_1, q_2\}$.
From $\{q_0, q_2\}$: on 0 → $\{q_0, q_3\}$, on 1 → $\{q_0, q_1, q_3\}$.
From $\{q_0, q_1, q_2\}$: on 0 → $\{q_0, q_2, q_3\}$, on 1 → $\{q_0, q_1, q_2, q_3\}$.
From $\{q_0, q_3\}$: on 0 → $\{q_0\}$, on 1 → $\{q_0, q_1\}$.
From $\{q_0, q_1, q_3\}$: on 0 → $\{q_0, q_2\}$, on 1 → $\{q_0, q_1, q_2\}$.
From $\{q_0, q_2, q_3\}$: on 0 → $\{q_0, q_3\}$, on 1 → $\{q_0, q_1, q_3\}$.
From $\{q_0, q_1, q_2, q_3\}$: on 0 → $\{q_0, q_2, q_3\}$, on 1 → $\{q_0, q_1, q_2, q_3\}$.

Reachable states: 8 = $2^3$ (as expected for the "3rd from end" pattern with a 4-state NFA). Accept states: all sets containing $q_3$.

---

## Common Mistakes in Subset Construction

### Mistake 1: Forgetting $\varepsilon$-Closure

When the NFA has $\varepsilon$-transitions, you **must** take the $\varepsilon$-closure at two points:
1. The start state: $q_0' = \text{ECLOSE}(q_0)$, not just $\{q_0\}$
2. After each transition: take ECLOSE of the result

### Mistake 2: Treating $\emptyset$ Incorrectly

The empty set $\emptyset$ is a valid DFA state! It's the **dead state** — all transitions from it go back to itself. Don't forget to include it if it's reachable.

### Mistake 3: Wrong Accept States

A DFA state $S$ is accepting if $S \cap F \neq \emptyset$ — it contains **at least one** NFA accept state. Common error: requiring all states in $S$ to be accepting.

### Mistake 4: Not Exploring All Reachable States

The worklist algorithm must continue until no new states are discovered. Don't stop after processing just the start state!

---

## What's Next?

The DFA produced by the subset construction may have more states than necessary. In the next lesson, we'll learn **DFA minimization** — how to find the smallest possible DFA for any regular language, and prove that this minimal DFA is unique.
