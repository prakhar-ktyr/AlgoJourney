---
title: Randomized Complexity
---

# Randomized Complexity

What if your Turing machine could flip coins? Randomness is a surprisingly powerful computational resource. In this lesson, we explore **probabilistic computation** and the complexity classes it defines.

---

## Probabilistic Turing Machines

### Definition

A **Probabilistic Turing Machine** (PTM) is like a standard TM, except at each step it can flip a fair coin to decide which transition to take.

Formally, a PTM has two transition functions $\delta_0$ and $\delta_1$:
- At each step, flip coin: heads → use $\delta_0$, tails → use $\delta_1$
- Each computation path has probability $(1/2)^k$ where $k$ = number of coin flips

### Computation Tree

A PTM on input $w$ creates a **binary tree** of computation paths:

```
                    start
                   /      \
               heads₁     tails₁
              /    \      /    \
          heads₂  tails₂ heads₂ tails₂
           ...     ...    ...    ...
          ACCEPT  REJECT ACCEPT ACCEPT
```

$$\Pr[\text{accept}] = \frac{\text{number of accepting leaves}}{\text{total leaves}}$$

---

## The Class BPP

### Definition

**BPP** (Bounded-Error Probabilistic Polynomial time):

A language $L \in BPP$ if there exists a polynomial-time PTM $M$ such that for all inputs $w$:

$$w \in L \implies \Pr[M \text{ accepts } w] \geq \frac{2}{3}$$

$$w \notin L \implies \Pr[M \text{ rejects } w] \geq \frac{2}{3}$$

### Key Properties

- **Two-sided error**: can be wrong on both YES and NO instances
- **Bounded error**: probability of error is at most $1/3$ on every input
- **The constant 2/3 is arbitrary**: any constant $> 1/2$ gives the same class!

### Why 2/3?

The choice of $2/3$ doesn't matter because of **amplification** (see below). Any constant $c$ with $1/2 < c < 1$ defines the same class BPP.

Even $1/2 + 1/n^{100}$ suffices! (As long as the gap from $1/2$ is at least inverse polynomial.)

---

## The Class RP

### Definition

**RP** (Randomized Polynomial time):

A language $L \in RP$ if there exists a polynomial-time PTM $M$ such that:

$$w \in L \implies \Pr[M \text{ accepts } w] \geq \frac{1}{2}$$

$$w \notin L \implies \Pr[M \text{ accepts } w] = 0$$

### Key Properties

- **One-sided error**: only makes mistakes on YES instances
- If $M$ says YES → it might be wrong (false positive possible)
- If $M$ says NO → it's definitely correct (no false negatives)
- Also called "Monte Carlo" algorithms (with one-sided error)

### Intuition

Think of RP as "proof by random witness":
- If $w \in L$: at least half the random strings lead to acceptance
- If $w \notin L$: no random string leads to acceptance

---

## The Class co-RP

### Definition

**co-RP**: The complement of RP.

$$w \in L \implies \Pr[M \text{ accepts } w] = 1$$

$$w \notin L \implies \Pr[M \text{ rejects } w] \geq \frac{1}{2}$$

### Key Properties

- One-sided error on the NO side only
- If $M$ says YES → definitely correct
- If $M$ says NO → might be wrong

---

## The Class ZPP

### Definition

**ZPP** (Zero-Error Probabilistic Polynomial time):

$ZPP$ is the class of languages decidable by a PTM that:
- **Always gives the correct answer**
- Runs in **expected** polynomial time

### Equivalent Characterization

$$ZPP = RP \cap \text{co-RP}$$

**Proof**:

$(\Rightarrow)$ If $L \in ZPP$: run the ZPP machine; if it hasn't halted after $2T(n)$ steps, output based on which error side you want to avoid.

$(\Leftarrow)$ If $L \in RP \cap \text{co-RP}$:
1. Run the RP machine: if it accepts → accept (no false positives in co-RP sense)
2. Run the co-RP machine: if it rejects → reject (no false negatives)
3. If neither is conclusive → repeat

Expected repetitions: $O(1)$ since each round has $\geq 1/2$ probability of being conclusive.

### Also Called

"Las Vegas" algorithms — always correct, randomized running time.

---

## Relationships Between Classes

### The Inclusion Chain

$$P \subseteq ZPP \subseteq RP \subseteq BPP \subseteq PSPACE$$

$$P \subseteq ZPP \subseteq \text{co-RP} \subseteq BPP \subseteq PSPACE$$

### Proof: $RP \subseteq BPP$

If $M$ is an RP machine:
- $w \in L$: $\Pr[\text{accept}] \geq 1/2 \geq 2/3$? No, need amplification.
- Run 3 times: $\Pr[\text{all reject}] \leq (1/2)^3 = 1/8$. So $\Pr[\text{at least one accepts}] \geq 7/8 > 2/3$. ✓
- $w \notin L$: always rejects. ✓

### Proof: $BPP \subseteq PSPACE$

A BPP machine on input $w$:
- Has polynomially many coin flips
- We can enumerate ALL possible random strings (exponentially many)
- Count accepting paths (in polynomial space, reusing space for each path)
- Accept if majority accept

### The Big Conjecture

> **Conjecture**: $BPP = P$

Most complexity theorists believe randomness does NOT help for decision problems. We just haven't proven it yet!

---

## Amplification

### The Power of Repetition

**Theorem** (Amplification Lemma): If $L \in BPP$, then for any polynomial $p(n)$, there exists a BPP machine with error probability $< 2^{-p(n)}$.

### How It Works

Given BPP machine $M$ with error $\leq 1/3$:

```
AMPLIFIED-M(w):
    Run M(w) independently k times
    Output the MAJORITY answer
    (Accept if majority of runs accept)
```

### Analysis via Chernoff Bound

Let $X_i = 1$ if the $i$-th run is correct, $X_i = 0$ otherwise.

$$E[X_i] \geq \frac{2}{3}, \quad X = \sum_{i=1}^k X_i$$

By the Chernoff bound, the probability that majority is wrong:

$$\Pr[\text{majority wrong}] \leq e^{-\Omega(k)}$$

With $k = O(\log(1/\delta))$ repetitions:

$$\Pr[\text{error}] < \delta$$

### Concrete Example

- Original error: $1/3$
- Run $k = 100$ times, take majority
- Error: $\leq 2^{-\Omega(100)} < 10^{-15}$

That's more reliable than hardware errors!

---

## Example: Primality Testing

### The Problem

$$\text{PRIMES} = \{ n \mid n \text{ is a prime number} \}$$

### Historical Significance

- 1976: Miller-Rabin test → PRIMES $\in$ co-RP (RP for COMPOSITES)
- 2002: AKS algorithm → PRIMES $\in$ P (deterministic polynomial time!)

### Miller-Rabin Test (Simplified)

```
MILLER-RABIN(n, k):
    If n ≤ 1: return COMPOSITE
    If n ≤ 3: return PRIME
    Write n-1 = 2^s · d (d odd)
    Repeat k times:
        Pick random a ∈ {2, ..., n-2}
        x = a^d mod n
        If x == 1 or x == n-1: continue
        For r = 1 to s-1:
            x = x² mod n
            If x == n-1: continue to next iteration
        return COMPOSITE
    return PROBABLY PRIME
```

**Properties**:
- If $n$ is prime: always outputs PRIME (no false negatives)
- If $n$ is composite: outputs COMPOSITE with probability $\geq 1 - (1/4)^k$

This puts COMPOSITES $\in$ RP, equivalently PRIMES $\in$ co-RP.

---

## Example: Polynomial Identity Testing

### The Problem

Given two polynomials (as arithmetic circuits), are they identical?

$$\text{PIT} = \{ (C_1, C_2) \mid C_1 \text{ and } C_2 \text{ compute the same polynomial} \}$$

### Schwartz-Zippel Lemma

**Lemma**: Let $p(x_1, \ldots, x_n)$ be a nonzero polynomial of total degree $d$ over a field $\mathbb{F}$. For a finite set $S \subseteq \mathbb{F}$:

$$\Pr_{r_1, \ldots, r_n \in S}[p(r_1, \ldots, r_n) = 0] \leq \frac{d}{|S|}$$

### Application to PIT

To test if $C_1 \equiv C_2$:
1. Let $p = C_1 - C_2$ (zero polynomial iff equal)
2. Pick random values $r_1, \ldots, r_n$ from a large set $S$
3. Evaluate $p(r_1, \ldots, r_n)$
4. If result = 0: output EQUAL (might be wrong)
5. If result ≠ 0: output DIFFERENT (definitely correct)

**Error probability**: $\leq d/|S|$ (choose $|S| \geq 2d$ for error $\leq 1/2$)

This puts PIT $\in$ co-RP.

### Open Problem

**Is PIT in P?** (Can we derandomize it?) This is one of the most important open problems in complexity theory, connected to circuit lower bounds.

---

## Example: Random Walk for Connectivity

### Undirected s-t Connectivity

Given undirected graph $G$, vertices $s, t$: is there a path from $s$ to $t$?

### Random Walk Algorithm

```
RANDOM-WALK(G, s, t):
    current = s
    For i = 1 to 2n³:
        If current == t: return CONNECTED
        Move to a random neighbor of current
    return DISCONNECTED
```

### Analysis

**Theorem**: If $s$ and $t$ are connected, the random walk reaches $t$ within $2n^3$ steps with high probability.

This follows from the theory of random walks on graphs:
- **Cover time** of any undirected graph on $n$ vertices: $O(n^3)$
- If connected, walk hits every vertex within this many steps (w.h.p.)

This shows undirected connectivity $\in$ **RL** (randomized log-space, one-sided error).

**Note**: Reingold (2004) showed this is in L (deterministic log-space)!

---

## Derandomization

### The Big Question

> Can every randomized algorithm be made deterministic without significant slowdown?

### Pseudorandom Generators (PRGs)

A **PRG** stretches a short random seed into a longer string that "looks random" to bounded computation:

$$G: \{0,1\}^s \to \{0,1\}^m, \quad s \ll m$$

If $G$ fools all polynomial-time algorithms:
- Replace random bits with $G(\text{short seed})$
- Enumerate all $2^s$ possible seeds
- If $s = O(\log n)$: only polynomially many seeds!

### Hardness vs. Randomness

**Theorem** (Impagliazzo-Wigderson, 1997): If there exists a problem in $E = \text{DTIME}(2^{O(n)})$ that requires circuits of size $2^{\Omega(n)}$, then $BPP = P$.

**Intuition**: Hard problems → good PRGs → derandomization

$$\text{Computational hardness} \implies \text{Pseudorandomness} \implies BPP = P$$

### Current Status

- $BPP = P$ is widely believed but unproven
- Proving it unconditionally requires proving circuit lower bounds (which is notoriously hard)
- Conditional results: under plausible hardness assumptions, $BPP = P$

---

## Randomized Space Complexity

### RL and BPL

- **RL** (Randomized Log-space): one-sided error, $O(\log n)$ space
- **BPL** (Bounded-error Probabilistic Log-space): two-sided error, $O(\log n)$ space

$$L \subseteq RL \subseteq BPL \subseteq P$$

### Key Results

- UPATH $\in$ RL (random walk, as shown above)
- UPATH $\in$ L (Reingold 2004, derandomized!)
- Conjecture: $RL = L$ and $BPL = L$

---

## BPP and the Polynomial Hierarchy

### Sipser-Lautemann Theorem

**Theorem**: $BPP \subseteq \Sigma_2^P \cap \Pi_2^P$

BPP is contained in the second level of the polynomial hierarchy!

**Proof idea**:
- A BPP machine accepts with probability $\geq 2/3$ or $\leq 1/3$
- After amplification: $\geq 1 - 2^{-n}$ or $\leq 2^{-n}$
- If acceptance probability is high: random strings cover the space → $\exists$ a small set of shifts that cover all random strings → in $\Sigma_2^P$
- Similarly for the complement → in $\Pi_2^P$

### Consequence

If $BPP$ is "powerful" (contains NP-hard problems), then the polynomial hierarchy collapses:

$$NP \subseteq BPP \implies PH \text{ collapses to } \Sigma_2^P$$

This is considered unlikely, reinforcing the belief that $BPP = P$.

---

## Comparison of Randomized Classes

| Class | Error Type | Condition for $w \in L$ | Condition for $w \notin L$ |
|-------|-----------|------------------------|--------------------------|
| BPP | Two-sided | $\Pr[\text{accept}] \geq 2/3$ | $\Pr[\text{reject}] \geq 2/3$ |
| RP | One-sided (YES) | $\Pr[\text{accept}] \geq 1/2$ | $\Pr[\text{accept}] = 0$ |
| co-RP | One-sided (NO) | $\Pr[\text{accept}] = 1$ | $\Pr[\text{reject}] \geq 1/2$ |
| ZPP | Zero | Always correct | Always correct |
| PP | Unbounded | $\Pr[\text{accept}] > 1/2$ | $\Pr[\text{accept}] < 1/2$ |

> **PP** (Probabilistic Polynomial): majority decides, but margin can be exponentially small. Much more powerful: $NP \subseteq PP$.

---

## Applications of Randomization

### In Algorithms

| Application | Technique | Class |
|------------|-----------|-------|
| Primality testing | Miller-Rabin | co-RP (now in P!) |
| Polynomial identity | Schwartz-Zippel | co-RP |
| Min-cut | Random contraction | BPP |
| Quicksort | Random pivot | ZPP (expected poly time) |
| Hashing | Random hash function | ZPP |

### In Cryptography

- Key generation (random keys)
- Encryption (randomized for semantic security)
- Zero-knowledge proofs (verifier's randomness)
- Commitment schemes

### In Distributed Computing

- Leader election
- Consensus protocols
- Symmetry breaking

---

## The Power of Randomness: A Summary

### What randomness gives us:

1. **Simplicity**: Many randomized algorithms are simpler than deterministic counterparts
2. **Speed**: Some problems have faster randomized algorithms (though for decision problems, this may be illusory)
3. **Symmetry breaking**: Essential in distributed settings
4. **Privacy**: Fundamental for cryptography

### What we believe:

- For **decision problems**: $BPP = P$ (randomness doesn't help)
- For **search/optimization**: randomness may genuinely help
- For **communication/crypto**: randomness is essential
- For **space-bounded computation**: likely $RL = L$

---

## Exercises

### Exercise 1: BPP Amplification
A BPP algorithm has error probability 1/4. How many repetitions are needed to reduce error below $10^{-6}$? Use majority vote.

### Exercise 2: RP Amplification
An RP algorithm has success probability 1/2. After $k$ independent runs (accepting if ANY run accepts), what is the error probability?

### Exercise 3: ZPP Example
Design a ZPP algorithm for finding an element in a sorted array. What's the expected running time?

### Exercise 4: Schwartz-Zippel
Using the Schwartz-Zippel lemma, determine the error probability when testing if $p(x,y) = x^2y + xy^2 - 2xy$ is identically zero, using random values from $\{1, 2, \ldots, 10\}$.

### Exercise 5: BPP ⊆ PSPACE
Write a detailed proof that $BPP \subseteq PSPACE$ using the counting argument.

### Exercise 6: co-RP
Prove that if $L \in RP$ then $\bar{L} \in \text{co-RP}$.

### Exercise 7: Amplification Limits
Explain why PP cannot be amplified the same way as BPP (why does the majority vote argument fail for PP?).

---

## PP: Unbounded Error

### Definition

**PP** (Probabilistic Polynomial time, unbounded error):

$$w \in L \implies \Pr[M \text{ accepts } w] > \frac{1}{2}$$
$$w \notin L \implies \Pr[M \text{ accepts } w] \leq \frac{1}{2}$$

### Why PP is Much More Powerful

The gap between acceptance probabilities can be **exponentially small**:
- YES instance: $\Pr[\text{accept}] = 1/2 + 2^{-n}$
- NO instance: $\Pr[\text{accept}] = 1/2 - 2^{-n}$

Amplification by majority vote FAILS: you'd need exponentially many repetitions to distinguish these probabilities!

### PP's Power

$$NP \subseteq PP \subseteq PSPACE$$

In fact, $PP$ is very powerful:
- $NP \subseteq PP$: guess the certificate; slightly bias the coin to favor correct guesses
- $\#P \subseteq PP^{PP}$: PP with a PP oracle can count
- PP is closed under intersection (Beigel-Reingold-Spielman)

---

## Randomness in Practice

### When to Use Randomization

| Situation | Best Approach |
|-----------|--------------|
| Need simple, fast algorithm | Randomized (then try to derandomize) |
| Symmetry breaking needed | Randomization essential |
| Cryptographic security | True randomness required |
| Average-case efficiency | Randomized algorithms often simpler |
| Online/streaming problems | Randomized hashing/sampling |

### Sources of Randomness

- Hardware random number generators (thermal noise, quantum effects)
- Pseudorandom generators (for BPP algorithms)
- Cryptographic PRGs (computationally indistinguishable from random)

---

## Key Takeaways

1. **Probabilistic TMs** flip coins to make random decisions during computation
2. **BPP**: two-sided bounded error; believed equal to P
3. **RP/co-RP**: one-sided error (no false negatives / no false positives)
4. **ZPP** = RP $\cap$ co-RP: always correct, expected poly-time
5. **Amplification**: repeat and vote to reduce error exponentially
6. **Derandomization**: if hard problems exist, $BPP = P$
7. **Practical randomization**: primality testing, identity testing, random walks
8. Randomness is a **convenience**, not a fundamental computational resource (probably!)

---

## What's Next?

In the next lesson, we'll explore **Interactive Proofs and Beyond** — how interaction and randomness together give the verifier incredible power, leading to the surprising result $IP = PSPACE$!
