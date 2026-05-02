---
title: What is Quantum Computing?
---

# What is Quantum Computing?

**Quantum computing** is a type of computation that harnesses the principles of **quantum mechanics** — the physics that governs the behavior of particles at the atomic and subatomic scale — to process information in fundamentally new ways.

---

## Classical Computing Recap

Before we dive into quantum computing, let's recall how classical computers work:

1. **Bits**: The basic unit of information is a **bit**, which is either `0` or `1`.
2. **Logic gates**: Operations (AND, OR, NOT, etc.) transform bits.
3. **Algorithms**: Step-by-step instructions that manipulate bits to solve problems.

Classical computers are incredibly powerful, but some problems are so complex that even the fastest supercomputer would take billions of years to solve them.

---

## Enter Quantum Computing

Quantum computers replace bits with **qubits** (quantum bits). Qubits leverage three key quantum phenomena:

### 1. Superposition

A classical bit is either 0 or 1. A qubit can be in a **superposition** — a combination of both states simultaneously:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

where $\alpha$ and $\beta$ are complex numbers called **amplitudes**, and $|\alpha|^2 + |\beta|^2 = 1$.

> **Analogy**: Think of a coin. A classical bit is like a coin lying flat — either heads (0) or tails (1). A qubit is like a coin spinning in the air — it's both heads and tails until it lands (is measured).

### 2. Entanglement

Two or more qubits can be **entangled**, meaning the state of one instantly influences the state of the other, no matter how far apart they are.

### 3. Interference

Quantum algorithms use **interference** to amplify correct answers and cancel out wrong ones, similar to how waves can constructively or destructively interfere.

---

## What Makes Quantum Computers Powerful?

With $n$ classical bits, you can represent **one** of $2^n$ possible states at a time.

With $n$ qubits in superposition, you can represent **all** $2^n$ states simultaneously and process them in parallel through quantum operations.

| Qubits | Simultaneous States |
|--------|-------------------|
| 1 | 2 |
| 10 | 1,024 |
| 20 | 1,048,576 |
| 50 | ~1 quadrillion |
| 300 | More than atoms in the observable universe |

This **quantum parallelism** is the source of quantum computing's potential exponential speedup for certain problems.

---

## What Can Quantum Computers Do?

Quantum computers excel at specific types of problems:

| Problem Area | Example | Quantum Advantage |
|---|---|---|
| **Cryptography** | Breaking RSA encryption | Shor's algorithm: exponential speedup |
| **Search** | Searching unsorted databases | Grover's algorithm: quadratic speedup |
| **Optimization** | Supply chain, routing | QAOA, quantum annealing |
| **Simulation** | Molecular modeling, drug discovery | Natural fit for quantum systems |
| **Machine Learning** | Pattern recognition | Potential speedups (active research) |

---

## What Quantum Computers Are NOT

Common misconceptions:

- **Not faster at everything** — Quantum computers are specialized; they won't replace your laptop for browsing the web.
- **Not magic** — They follow the laws of physics; there are strict rules about what speedups are possible.
- **Not ready for everyday use** — Current quantum computers are noisy and error-prone (we're in the "NISQ era" — Noisy Intermediate-Scale Quantum).

---

## A Brief Timeline

| Year | Milestone |
|------|-----------|
| 1981 | Richard Feynman proposes quantum simulation |
| 1985 | David Deutsch describes the universal quantum computer |
| 1994 | Peter Shor discovers his factoring algorithm |
| 1996 | Lov Grover discovers his search algorithm |
| 2001 | IBM factors 15 using Shor's algorithm on 7 qubits |
| 2019 | Google claims "quantum supremacy" with 53 qubits |
| 2023 | IBM unveils 1,121-qubit processor (Condor) |

---

## Key Takeaways

- Quantum computing uses qubits, superposition, entanglement, and interference to process information.
- It offers exponential speedups for certain problems, not all problems.
- We're still in the early days, but progress is accelerating rapidly.

---

## Try It Yourself

**Think about it**: If you had a quantum computer with 50 qubits, how many states could it represent simultaneously? (Hint: $2^{50}$)

**Answer**: $2^{50} = 1,125,899,906,842,624$ — over 1 quadrillion states!

Next, we'll explore the **History of Quantum Computing** in more detail →
