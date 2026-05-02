---
title: Classical vs Quantum Computing
---

# Classical vs Quantum Computing

To truly understand quantum computing, you need to see how it differs from classical computing at every level — from the basic unit of information to how algorithms process data.

---

## The Fundamental Unit: Bit vs Qubit

### Classical Bit

A classical bit is the simplest unit of information. It has exactly **two states**:

```
Bit = 0  or  Bit = 1
```

Every piece of data in a classical computer — text, images, videos — is encoded as sequences of 0s and 1s.

### Quantum Bit (Qubit)

A qubit can be in state $|0\rangle$, state $|1\rangle$, or any **superposition** of both:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

where $|\alpha|^2$ is the probability of measuring 0, and $|\beta|^2$ is the probability of measuring 1.

**Key difference**: A bit IS 0 or 1. A qubit can be BOTH until measured.

---

## State Space

| Property | Classical ($n$ bits) | Quantum ($n$ qubits) |
|----------|---------------------|---------------------|
| State representation | One of $2^n$ states | Superposition of all $2^n$ states |
| Information per state | $n$ bits | Up to $2^n$ amplitudes |
| Memory to simulate | $n$ bits | $2^n$ complex numbers |

### Example: 3 Bits vs 3 Qubits

**3 classical bits** — one state at a time:
```
000, 001, 010, 011, 100, 101, 110, or 111
```

**3 qubits** — superposition of all 8 states simultaneously:
$$|\psi\rangle = \alpha_{000}|000\rangle + \alpha_{001}|001\rangle + \alpha_{010}|010\rangle + \cdots + \alpha_{111}|111\rangle$$

Each of the 8 amplitudes ($\alpha_{000}$, etc.) is a complex number. Simulating 3 qubits requires tracking all 8 amplitudes.

For **50 qubits**, you'd need to track $2^{50} \approx 10^{15}$ amplitudes — that's more than a petabyte of memory just to simulate the state!

---

## Operations: Logic Gates vs Quantum Gates

### Classical Logic Gates

Classical gates take bits as input and produce bits as output:

```
AND gate:  0,0 → 0    0,1 → 0    1,0 → 0    1,1 → 1
OR  gate:  0,0 → 0    0,1 → 1    1,0 → 1    1,1 → 1
NOT gate:  0 → 1      1 → 0
```

Some classical gates are **irreversible** — you can't always determine the input from the output (e.g., AND gate: output 0 could come from three different inputs).

### Quantum Gates

Quantum gates are represented by **unitary matrices** that transform qubit states:

- All quantum gates are **reversible** (a fundamental requirement from physics).
- They operate on the amplitudes, not just 0s and 1s.

Example — the **X gate** (quantum NOT):

$$X|0\rangle = |1\rangle, \quad X|1\rangle = |0\rangle$$

As a matrix:

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$

Example — the **Hadamard gate** (creates superposition):

$$H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}, \quad H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$$

---

## Computation Model

### Classical: Deterministic or Probabilistic

```
Input → Gate 1 → Gate 2 → ... → Gate n → Output (definite)
```

A classical computer follows a deterministic path. Given the same input, you always get the same output. (Probabilistic algorithms use random bits but still output definite values.)

### Quantum: Amplitude-Based

```
Input |ψ⟩ → Gate 1 → Gate 2 → ... → Gate n → Measurement → Output (probabilistic)
```

Quantum computation manipulates amplitudes through gates. The final **measurement** collapses the superposition to a definite classical outcome, with probabilities determined by the amplitudes.

**The art of quantum algorithms**: Design gate sequences so that the amplitudes of correct answers constructively interfere (get amplified) and wrong answers destructively interfere (get cancelled).

---

## Parallelism

### Classical Parallelism

Classical computers achieve parallelism by:
- Multi-core processors running separate threads
- GPU computing with thousands of cores
- Distributed computing across many machines

Each processor still works on one state at a time.

### Quantum Parallelism

A quantum computer operates on all $2^n$ superposition states **simultaneously** in a single computation step. This isn't the same as having $2^n$ classical processors — you can only extract limited information through measurement — but clever algorithms exploit this parallelism for real speedups.

---

## Error Handling

| Aspect | Classical | Quantum |
|--------|-----------|---------|
| Error rate | Very low ($< 10^{-15}$ per operation) | High ($10^{-3}$ to $10^{-2}$ per operation) |
| Error correction | Simple redundancy (repeat bits) | Complex quantum error correction codes |
| Decoherence | Not an issue | Major challenge — qubits lose quantum properties |
| Operating conditions | Room temperature | Often near absolute zero (15 millikelvin) |

Current quantum computers have error rates about **a trillion times higher** than classical computers. This is the biggest engineering challenge.

---

## Speed Comparison

Quantum speedup depends on the problem:

| Problem | Classical | Quantum | Speedup |
|---------|-----------|---------|---------|
| Factoring $N$ | Sub-exponential | Polynomial (Shor's) | Exponential |
| Unstructured search | $O(N)$ | $O(\sqrt{N})$ (Grover's) | Quadratic |
| Simulating quantum systems | Exponential | Polynomial | Exponential |
| Sorting | $O(N \log N)$ | $O(N \log N)$ | None |
| General computing | Efficient | No advantage | None |

**Important**: Quantum computers don't speed up everything. They excel at problems with specific mathematical structure.

---

## When to Use Which?

### Use Classical Computers For:
- Everyday tasks (email, web browsing, office apps)
- Most software development
- Data storage and retrieval
- Graphics and video processing
- Well-solved algorithmic problems

### Use Quantum Computers For:
- Cryptanalysis (breaking encryption)
- Molecular simulation (drug discovery, materials science)
- Optimization problems (logistics, finance)
- Machine learning on quantum data
- Sampling from complex probability distributions

---

## Side-by-Side Summary

| Feature | Classical | Quantum |
|---------|-----------|---------|
| Basic unit | Bit (0 or 1) | Qubit (superposition) |
| Gates | Irreversible logic gates | Reversible unitary gates |
| Parallelism | Multi-core, distributed | Quantum parallelism |
| Measurement | Read bits directly | Probabilistic collapse |
| Error rates | ~$10^{-15}$ | ~$10^{-3}$ |
| Operating temp | Room temperature | ~15 millikelvin |
| Maturity | Decades of refinement | Early stage (NISQ era) |
| Best for | General-purpose | Specific hard problems |

---

## Key Takeaways

- Classical bits are deterministic (0 or 1); qubits leverage superposition for quantum parallelism.
- Quantum gates are always reversible and operate on amplitudes.
- Quantum computers aren't universally faster — they offer dramatic speedups only for specific problem types.
- Current quantum hardware is noisy and requires extreme cooling — a major engineering challenge.

---

## Try It Yourself

**Thought exercise**: If you have 20 qubits, how many classical bits of memory would you need to simulate their full quantum state? (Hint: you need $2^{20}$ complex numbers, each needing ~16 bytes.)

**Answer**: $2^{20} \times 16 = 16,777,216$ bytes ≈ **16 MB**. Now imagine 50 qubits: $2^{50} \times 16 \approx 18$ **petabytes**!

Next, we'll explore **Why Quantum Computing Matters** →
