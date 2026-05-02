---
title: Quantum Mechanics Basics
---

# Quantum Mechanics Basics

Quantum mechanics is the branch of physics that describes the behavior of nature at the smallest scales — atoms, electrons, photons, and other subatomic particles. It's the foundation upon which all of quantum computing is built.

---

## Why Do We Need Quantum Mechanics?

Classical physics (Newton's laws, Maxwell's equations) works perfectly for everyday objects — balls, cars, planets. But at the atomic scale, classical physics **breaks down**. Experiments showed bizarre behavior that could only be explained by entirely new rules.

### The Ultraviolet Catastrophe (1900)

Classical physics predicted that a hot object should emit infinite energy at short wavelengths — clearly wrong! Max Planck solved this by proposing that energy comes in discrete chunks (**quanta**):

$$E = nh\nu, \quad n = 0, 1, 2, 3, \ldots$$

This simple idea launched quantum theory.

---

## Core Principles of Quantum Mechanics

### 1. Quantization

Energy, angular momentum, and other properties come in **discrete** values, not continuous ones.

**Analogy**: Classical physics says you can walk up a ramp (any height). Quantum mechanics says you can only stand on specific steps of a staircase.

**Example**: An electron in a hydrogen atom can only have specific energy levels:

$$E_n = -\frac{13.6 \text{ eV}}{n^2}, \quad n = 1, 2, 3, \ldots$$

### 2. Wave-Particle Duality

Quantum objects behave as both **particles** and **waves** depending on how you observe them. (We'll cover this in detail in the next lesson.)

### 3. The Wave Function

The state of a quantum system is described by a **wave function** $\psi$ (psi). The wave function contains all information about the system.

For a single particle, $\psi(x, t)$ is a complex-valued function of position and time. The **probability** of finding the particle at position $x$ is:

$$P(x) = |\psi(x)|^2$$

This is called the **Born rule** — quantum mechanics only gives us probabilities, never certainties.

### 4. Superposition

If $|\psi_1\rangle$ and $|\psi_2\rangle$ are valid states of a system, then any combination is also a valid state:

$$|\psi\rangle = \alpha|\psi_1\rangle + \beta|\psi_2\rangle$$

This is the principle that gives qubits their power.

### 5. Measurement Problem

When we measure a quantum system, the wave function **collapses** to one of the possible outcomes. Before measurement, the system exists in superposition. After measurement, it's in a definite state.

```
Before measurement:  |ψ⟩ = α|0⟩ + β|1⟩  (superposition)
After measurement:   |0⟩  with probability |α|²
              or:    |1⟩  with probability |β|²
```

### 6. Uncertainty Principle

You cannot simultaneously know certain pairs of properties with arbitrary precision. The most famous pair is position ($x$) and momentum ($p$):

$$\Delta x \cdot \Delta p \geq \frac{\hbar}{2}$$

This isn't a limitation of measurement tools — it's a fundamental property of nature.

---

## The Mathematical Framework

### State Vectors (Kets)

In quantum computing, we use **Dirac notation** (bra-ket notation). A quantum state is represented as a **ket**:

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

A general qubit state:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix}$$

### Inner Product (Bra-Ket)

The **bra** $\langle\psi|$ is the conjugate transpose of the ket:

$$\langle\psi| = (\alpha^*, \beta^*)$$

The inner product gives the **overlap** between two states:

$$\langle\phi|\psi\rangle = \text{complex number}$$

If $\langle\phi|\psi\rangle = 0$, the states are **orthogonal** (completely distinguishable).

### Operators

Physical quantities (energy, position, momentum) are represented by **operators** (matrices). Measuring an observable means applying its operator to the state:

$$\hat{A}|\psi\rangle = a|\psi\rangle$$

If this equation holds, $|\psi\rangle$ is an **eigenstate** of $\hat{A}$ with **eigenvalue** $a$.

---

## Quantum vs Classical: A Quick Summary

| Property | Classical | Quantum |
|----------|-----------|---------|
| State | Definite values | Wave function (probabilities) |
| Measurement | Reveals pre-existing state | Creates/collapses state |
| Determinism | Deterministic | Probabilistic |
| Energy | Continuous | Quantized |
| Objects | Particles OR waves | Both (duality) |

---

## Connecting to Quantum Computing

Every concept above directly maps to quantum computing:

| Quantum Mechanics | Quantum Computing |
|-------------------|-------------------|
| Wave function | Qubit state vector |
| Superposition | Qubit in $\alpha\|0\rangle + \beta\|1\rangle$ |
| Measurement collapse | Reading a qubit |
| Unitary evolution | Quantum gates |
| Entanglement | Multi-qubit correlations |

You don't need a physics degree — you need to understand these principles well enough to reason about quantum algorithms.

---

## Key Takeaways

- Quantum mechanics governs nature at the smallest scales, where classical physics fails.
- Key principles: quantization, superposition, wave-particle duality, probabilistic measurement.
- States are described by wave functions; measurements collapse them.
- The math uses vectors (kets), inner products, and matrices (operators).
- These principles directly underpin qubit states, quantum gates, and measurement in quantum computing.

---

## Try It Yourself

**Calculate**: A qubit is in the state $|\psi\rangle = \frac{1}{\sqrt{3}}|0\rangle + \sqrt{\frac{2}{3}}|1\rangle$.

1. What is the probability of measuring $|0\rangle$?
2. What is the probability of measuring $|1\rangle$?
3. Do the probabilities sum to 1?

**Answers**:
1. $P(0) = |1/\sqrt{3}|^2 = 1/3 \approx 0.333$
2. $P(1) = |\sqrt{2/3}|^2 = 2/3 \approx 0.667$
3. $1/3 + 2/3 = 1$ ✓

Next, we'll explore **Wave-Particle Duality** →
