---
title: Interactive Proofs and Beyond
---

# Interactive Proofs and Beyond

What if a proof isn't just a static document, but a **conversation**? Interactive proof systems allow a powerful Prover and a skeptical Verifier to engage in a back-and-forth dialogue. Combined with randomness, this yields astonishing computational power.

---

## Interactive Proof Systems

### The Setup

An interactive proof system consists of two parties:

| Party | Power | Role |
|-------|-------|------|
| **Prover** ($P$) | Computationally unbounded | Tries to convince Verifier |
| **Verifier** ($V$) | Polynomial-time, randomized | Decides accept/reject |

They exchange **messages** over multiple **rounds**:

$$P \leftrightarrow V: \quad m_1, m_2, m_3, \ldots, m_k$$

### Formal Definition

An interactive proof system for language $L$ satisfies:

**Completeness**: If $w \in L$, an honest prover can convince the verifier:

$$w \in L \implies \Pr[V \text{ accepts in interaction with } P] \geq \frac{2}{3}$$

**Soundness**: If $w \notin L$, NO prover (even a cheating one!) can convince the verifier:

$$w \notin L \implies \forall P^*, \; \Pr[V \text{ accepts in interaction with } P^*] \leq \frac{1}{3}$$

### The Class IP

$$IP = \{ L \mid L \text{ has an interactive proof system} \}$$

---

## Comparison with NP

### NP as a Proof System

NP can be viewed as a **non-interactive** proof system:

- Prover sends a single message (the certificate/witness)
- Verifier checks deterministically in polynomial time
- No randomness, no interaction

$$NP: \quad P \xrightarrow{\text{certificate}} V \xrightarrow{\text{accept/reject}}$$

### IP Adds Two Ingredients

1. **Multiple rounds of interaction** (Prover can adapt based on Verifier's messages)
2. **Verifier uses randomness** (can ask unpredictable questions)

$$IP: \quad P \xleftrightarrow{\text{round 1}} V \xleftrightarrow{\text{round 2}} P \xleftrightarrow{\text{round 3}} V \cdots$$

### Why This is More Powerful

The Verifier's randomness prevents the Prover from "preparing" for all possible questions. The Prover must have genuine knowledge to answer correctly.

$$NP \subseteq IP$$

But is $IP$ strictly larger? YES! (We'll see Graph Non-Isomorphism below.)

---

## Example: Graph Non-Isomorphism

### The Problem

$$GNI = \{ \langle G_0, G_1 \rangle \mid G_0 \not\cong G_1 \}$$

Two graphs are **isomorphic** ($G_0 \cong G_1$) if one can be obtained by relabeling vertices of the other.

### GNI is Not Known to Be in NP

For Graph **Isomorphism**: certificate = the relabeling (easy to verify).
For Graph **Non**-Isomorphism: what would a certificate be? Hard to imagine a short proof of "no relabeling works."

### Interactive Proof for GNI

**Protocol**:

```
Round (repeated k times for amplification):

1. Verifier: Pick random bit b ∈ {0, 1}
             Randomly permute G_b to get H
             Send H to Prover

2. Prover:   Determine which graph (G_0 or G_1) H came from
             Send guess b' to Verifier

3. Verifier: Accept this round if b' = b
```

Final: Accept if ALL rounds pass.

### Why This Works

**Case 1: $G_0 \not\cong G_1$ (YES instance)**

The all-powerful Prover can check if $H \cong G_0$ or $H \cong G_1$. Since they're non-isomorphic, $H$ matches exactly one. The Prover always identifies $b$ correctly.

$$\Pr[\text{Prover correct}] = 1$$

**Case 2: $G_0 \cong G_1$ (NO instance)**

A random permutation of $G_0$ looks identical to a random permutation of $G_1$ (since they're isomorphic). No prover, no matter how powerful, can distinguish them.

$$\Pr[\text{any prover correct}] = \frac{1}{2}$$

After $k$ rounds: $\Pr[\text{cheating prover passes all}] = (1/2)^k$

### Summary

- Completeness: honest prover passes with probability 1
- Soundness: cheating prover passes with probability $\leq (1/2)^k$
- This proves $GNI \in IP$!

### Why GNI Matters

Graph Non-Isomorphism is believed to NOT be in NP (no short certificate for non-isomorphism is known). Yet it has an interactive proof!

This demonstrates that $IP$ is likely **strictly more powerful** than $NP$:
- NP: static proof, no randomness
- IP: dynamic interaction + verifier randomness

The Verifier's power comes from asking **unpredictable questions** — the Prover cannot prepare for all possibilities.

---

## The Power of IP

### IP Contains coNP

The GNI example shows that IP can handle problems in coNP that may not be in NP.

But IP goes far beyond coNP...

### #SAT Has an Interactive Proof

**Problem**: Given formula $\phi$, how many satisfying assignments does it have?

This is a **#P-complete** problem (counting version of SAT).

Remarkably, the Verifier can check the Prover's claimed count!

**Technique**: Arithmetization

1. Convert Boolean formula to polynomial over a finite field
2. The number of satisfying assignments = sum of polynomial over all $\{0,1\}^n$ inputs
3. Use clever sum-checking protocol where Verifier checks one variable at a time

---

## Arithmetization

### Converting Logic to Algebra

| Boolean | Arithmetic over $\mathbb{F}$ |
|---------|------------------------------|
| $x \wedge y$ | $x \cdot y$ |
| $x \vee y$ | $1 - (1-x)(1-y) = x + y - xy$ |
| $\neg x$ | $1 - x$ |

For $x, y \in \{0, 1\}$, these give the same truth values!

### Example

Formula: $\phi(x_1, x_2) = x_1 \vee \neg x_2$

Arithmetization: $\hat{\phi}(x_1, x_2) = 1 - (1 - x_1)(1 - (1-x_2)) = 1 - (1-x_1) \cdot x_2$

$$= 1 - x_2 + x_1 x_2$$

Verify:
- $\hat{\phi}(0,0) = 1 - 0 + 0 = 1$ ✓ ($\text{TRUE} \vee \text{TRUE}$)
- $\hat{\phi}(0,1) = 1 - 1 + 0 = 0$ ✓ ($\text{FALSE} \vee \text{FALSE}$)
- $\hat{\phi}(1,0) = 1 - 0 + 0 = 1$ ✓ ($\text{TRUE} \vee \text{TRUE}$)
- $\hat{\phi}(1,1) = 1 - 1 + 1 = 1$ ✓ ($\text{TRUE} \vee \text{FALSE}$)

### Sum-Check Protocol

Goal: Verify $\sum_{x_1 \in \{0,1\}} \cdots \sum_{x_n \in \{0,1\}} \hat{\phi}(x_1, \ldots, x_n) = k$

**Round 1**: Prover sends polynomial $g_1(x_1) = \sum_{x_2, \ldots, x_n} \hat{\phi}(x_1, x_2, \ldots, x_n)$

Verifier checks: $g_1(0) + g_1(1) = k$ and degree is correct.

Then Verifier sends random $r_1$ and asks for $g_2(x_2) = \sum_{x_3, \ldots, x_n} \hat{\phi}(r_1, x_2, \ldots, x_n)$

**Continue** until all variables are fixed. Final check: evaluate $\hat{\phi}(r_1, \ldots, r_n)$ directly.

---

## Shamir's Theorem: IP = PSPACE

### The Theorem

$$IP = PSPACE$$

**Proved by Adi Shamir in 1992.**

### Significance

This is one of the most surprising results in complexity theory:

- PSPACE includes incredibly hard problems (TQBF, games, planning)
- Yet a polynomial-time verifier with randomness can verify PSPACE computations!
- The power comes entirely from **interaction + randomness**

### Proof Overview

**$IP \subseteq PSPACE$** (easier direction):

The Verifier is polynomial-time and the proof has polynomially many rounds. We can try all possible Prover strategies in PSPACE:
- For each Verifier message: compute optimal Prover response
- The optimal strategy maximizes acceptance probability
- Computing this requires PSPACE (game tree search)

**$PSPACE \subseteq IP$** (harder direction):

Show that TQBF (the PSPACE-complete problem) has an interactive proof:
1. Arithmetize the quantified Boolean formula
2. Convert $\forall$ and $\exists$ quantifiers to products and sums over $\{0,1\}$
3. Apply sum-check protocol (with modifications for quantifiers)
4. Key challenge: degree blow-up → use degree-reduction trick

$$\forall x \; \phi(x) \longrightarrow \prod_{x \in \{0,1\}} \hat{\phi}(x)$$

$$\exists x \; \phi(x) \longrightarrow 1 - \prod_{x \in \{0,1\}} (1 - \hat{\phi}(x))$$

### The Revelation

$$NP \subseteq IP = PSPACE$$

Interactive proofs are **exponentially** more powerful than static NP certificates!

| System | Power |
|--------|-------|
| NP (static proof) | $NP$ |
| IP (interactive + random) | $PSPACE$ |
| MIP (multi-prover) | $NEXP$ (and more!) |

---

## Zero-Knowledge Proofs

### Motivation

Interactive proofs convince the Verifier that $x \in L$. But what if the Prover wants to reveal **nothing else** beyond this single bit of information?

### Definition (Informal)

A **zero-knowledge proof** for $L$ is an interactive proof where:
- The Verifier learns that $x \in L$
- The Verifier learns **nothing else** — anything they could compute after the proof, they could compute without it

### Formal Definition

An interactive proof $(P, V)$ for $L$ is **zero-knowledge** if for every polynomial-time verifier $V^*$, there exists a polynomial-time **simulator** $S$ such that:

$$\text{View}_{V^*}(P(w) \leftrightarrow V^*(w)) \approx S(w)$$

The simulator produces output indistinguishable from the real interaction, without talking to the Prover!

### Example: Graph Isomorphism ZK Protocol

**Problem**: Prover knows isomorphism $\pi: G_0 \to G_1$, wants to prove it without revealing $\pi$.

**Protocol**:

```
Repeat k times:
1. Prover: Pick random permutation σ, send H = σ(G_0) to Verifier
2. Verifier: Pick random bit b ∈ {0, 1}, send b to Prover
3. Prover: 
   - If b = 0: send σ (showing H ≅ G_0)
   - If b = 1: send σ ∘ π⁻¹ (showing H ≅ G_1)
4. Verifier: Check that the permutation maps G_b to H
```

**Why zero-knowledge**: A simulator can fake transcripts:
1. Pick random $b$, random permutation $\tau$
2. Set $H = \tau(G_b)$
3. Transcript $(H, b, \tau)$ looks identical to real interaction!

**Why sound**: If $G_0 \not\cong G_1$, Prover can only answer for one value of $b$, so cheats with probability $\leq 1/2$ per round.

### Applications of Zero-Knowledge

| Domain | Application |
|--------|-------------|
| Cryptography | Authentication without revealing password |
| Blockchain | Private transactions (Zcash, zk-rollups) |
| Voting | Proof of valid vote without revealing choice |
| Identity | Prove age > 18 without revealing birthdate |

---

## zk-SNARKs (Brief Mention)

**zk-SNARK** = Zero-Knowledge Succinct Non-Interactive Argument of Knowledge

Properties:
- **Succinct**: proof is tiny (constant size, ~hundreds of bytes)
- **Non-interactive**: single message from Prover to Verifier
- **Zero-knowledge**: reveals nothing beyond truth of statement

Used in blockchain (Zcash, Ethereum rollups) for private, efficient verification.

Trade-off: Require a "trusted setup" or use newer constructions (zk-STARKs).

---

## The PCP Theorem

### Probabilistically Checkable Proofs

**Classical proofs** (NP): Verifier must read the entire proof.

**PCPs**: Verifier reads only a **few random bits** of the proof!

### Definition

$PCP(r(n), q(n))$ = class of languages with proofs where Verifier:
- Uses $r(n)$ random bits
- Reads $q(n)$ bits of the proof
- Decides accept/reject

### The PCP Theorem

$$NP = PCP(O(\log n), O(1))$$

**Translation**: Every NP proof can be rewritten into a special format such that:
- The Verifier uses $O(\log n)$ random bits
- Reads only $O(1)$ proof bits (say, 3 bits!)
- If $w \in L$: $\exists$ proof that Verifier accepts with probability 1
- If $w \notin L$: for any "proof," Verifier rejects with probability $\geq 1/2$

### Why This is Amazing

A polynomial-length proof verified by reading just **3 bits**! The randomness is the key — it tells the Verifier WHERE to look.

### Connection to Inapproximability

The PCP theorem implies:

**Gap-producing reductions**: Can transform SAT instances so that:
- Satisfiable → at least $(1-\varepsilon)$ fraction of clauses satisfiable
- Unsatisfiable → at most $s$ fraction satisfiable

This gap makes MAX-SAT hard to approximate beyond certain ratios.

### Proof Structure (High Level)

1. Start with NP verifier that reads whole proof
2. Apply algebraic encoding (low-degree extension)
3. Add self-correction and consistency checks
4. Result: a proof format where local checks suffice

The full proof is one of the most complex in computer science!

---

## Multi-Prover Interactive Proofs

### MIP: Multiple Non-Communicating Provers

What if there are **two or more provers** who cannot communicate with each other?

$$MIP = \text{class with multi-prover interactive proofs}$$

### Power of MIP

**Theorem**: $MIP = NEXP$ (nondeterministic exponential time)

Even more powerful than single-prover IP!

The key: Verifier can "cross-examine" the provers (ask them the same question independently, check for consistency).

### MIP* (Entangled Provers)

If provers share quantum entanglement:

$$MIP^* = RE \text{ (recursively enumerable)}$$

This shocking result (2020) means entangled provers can prove UNDECIDABLE things!

---

## Arthur-Merlin Games

### AM and MA

Simplified interactive proofs where messages are public:

**AM** (Arthur-Merlin): Verifier sends random coins, Prover responds.
$$AM: \quad V \xrightarrow{r} P \xrightarrow{m} V$$

**MA** (Merlin-Arthur): Prover sends message, Verifier flips coins to check.
$$MA: \quad P \xrightarrow{m} V \xrightarrow{\text{random check}}$$

### Key Results

- $AM = IP$ with only 2 rounds! (Goldwasser-Sipser)

Actually: for any constant $k$:
$$AM[k] = AM[2] = AM$$

Constant rounds of interaction can be collapsed to just TWO rounds!

- $NP \subseteq MA \subseteq AM \subseteq \Pi_2^P$
- If $coNP \subseteq AM$, then polynomial hierarchy collapses

---

## Summary of Proof System Power

| Proof System | Power | Key Feature |
|-------------|-------|-------------|
| NP | NP | Static certificate |
| MA | $\supseteq$ NP | Prover first, then random check |
| AM | $\supseteq$ MA | Random challenge, then proof |
| IP | PSPACE | Multiple rounds + randomness |
| MIP | NEXP | Multiple non-communicating provers |
| MIP* | RE | Entangled provers (quantum) |
| PCP | NP | Constant query bits |

---

## Interactive Proofs in Practice

### Verified Computation

Weak client delegates computation to powerful server:
1. Server computes result
2. Server provides interactive proof of correctness
3. Client verifies (much cheaper than computing!)

**Example**: Cloud computing — verify the cloud computed correctly without re-doing the work.

### Blockchain and Consensus

- Zero-knowledge proofs for private transactions
- Proof of computation for layer-2 scaling (zk-rollups)
- Verifiable random functions

### Complexity-Theoretic Significance

Interactive proofs changed our understanding of:
- The nature of "proof" and "knowledge"
- What can be verified efficiently
- The power of randomness in verification
- Connections between computation and communication

---

## Exercises

### Exercise 1: IP vs NP
Explain why the GNI protocol cannot be converted into a standard NP certificate.

### Exercise 2: Soundness
In the GNI protocol with 20 rounds, what is the maximum probability that a cheating prover convinces the verifier when $G_0 \cong G_1$?

### Exercise 3: Arithmetization
Arithmetize the formula $\phi(x_1, x_2, x_3) = (x_1 \vee x_2) \wedge (\neg x_1 \vee x_3)$ and compute $\sum_{x \in \{0,1\}^3} \hat{\phi}(x)$.

### Exercise 4: Zero-Knowledge Simulation
For the Graph Isomorphism ZK protocol, explain why a simulator that doesn't know $\pi$ can still produce valid-looking transcripts.

### Exercise 5: PCP
If $NP = PCP(O(\log n), O(1))$ and the verifier uses 10 random bits and queries 3 proof bits, what is the maximum proof length the verifier can access?

*Hint*: With 10 random bits, there are $2^{10}$ possible query patterns.

### Exercise 6: IP = PSPACE Direction
Prove that $IP \subseteq PSPACE$ by showing how to compute the optimal prover strategy.

### Exercise 7: Multi-Prover Advantage
Explain intuitively why two non-communicating provers are more powerful than one: what "cheating strategy" does separation prevent?

---

## Key Takeaways

1. **Interactive proofs** use conversation + randomness for verification
2. **IP = PSPACE**: interaction + randomness captures all of polynomial space
3. **GNI** has an interactive proof (showing IP goes beyond NP)
4. **Zero-knowledge**: prove truth without revealing anything else
5. **PCP Theorem**: NP proofs can be checked reading $O(1)$ bits — implies inapproximability
6. **MIP = NEXP**: multiple provers are even more powerful
7. These results revolutionized our understanding of proof, knowledge, and verification
8. Practical applications: blockchain privacy, verified computation, cryptography

---

## What's Next?

In our final lesson, we'll provide a **Course Summary and Open Problems** — bringing together everything we've learned and pointing toward the frontiers of theoretical computer science!
