---
title: Quantum Entanglement
---

# Quantum Entanglement

Entanglement is a uniquely quantum phenomenon where two or more qubits become correlated in such a way that the state of one **instantly** determines the state of the other — regardless of the distance between them. Einstein famously called it "spooky action at a distance."

---

## What is Entanglement?

Two qubits are **entangled** when their joint state **cannot** be written as a product of individual states.

### Separable (NOT Entangled)

$$|\psi\rangle = |0\rangle \otimes |1\rangle = |01\rangle$$

This state can be factored: qubit A is in $|0\rangle$, qubit B is in $|1\rangle$. They are independent.

### Entangled

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

Try to factor this as $|\psi_A\rangle \otimes |\psi_B\rangle$:

$$(\alpha|0\rangle + \beta|1\rangle) \otimes (\gamma|0\rangle + \delta|1\rangle) = \alpha\gamma|00\rangle + \alpha\delta|01\rangle + \beta\gamma|10\rangle + \beta\delta|11\rangle$$

For this to equal $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$, we need:
- $\alpha\gamma = 1/\sqrt{2}$
- $\alpha\delta = 0$
- $\beta\gamma = 0$
- $\beta\delta = 1/\sqrt{2}$

From condition 2: $\alpha = 0$ or $\delta = 0$. But if $\alpha = 0$, condition 1 fails. If $\delta = 0$, condition 4 fails. **No solution exists** — the state is genuinely entangled.

---

## The Bell States

The four **Bell states** are the maximally entangled two-qubit states:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

$$|\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$$

$$|\Psi^+\rangle = \frac{1}{\sqrt{2}}(|01\rangle + |10\rangle)$$

$$|\Psi^-\rangle = \frac{1}{\sqrt{2}}(|01\rangle - |10\rangle)$$

These states have a special property: measuring one qubit **immediately** determines the other.

### Example: $|\Phi^+\rangle$

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

- If you measure qubit A and get $|0\rangle$, qubit B is **definitely** $|0\rangle$.
- If you measure qubit A and get $|1\rangle$, qubit B is **definitely** $|1\rangle$.
- Each outcome has 50% probability.

The qubits are perfectly correlated, and this correlation is established **instantly** regardless of distance.

---

## Creating Entanglement

The standard way to create a Bell state is with a **Hadamard gate** followed by a **CNOT gate**:

```
q0: ─[H]──●──
           |
q1: ───────X──
```

Step by step:

1. **Start**: $|00\rangle$
2. **Hadamard on q0**: $\frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) \otimes |0\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$
3. **CNOT** (flips q1 if q0 is 1): $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle) = |\Phi^+\rangle$

### In Qiskit

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create Bell state |Φ+⟩
qc = QuantumCircuit(2, 2)
qc.h(0)       # Hadamard on qubit 0
qc.cx(0, 1)   # CNOT: qubit 0 controls qubit 1
qc.measure([0, 1], [0, 1])

# Run 1000 times
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()
print(result[0].data.c.get_counts())
# Output: approximately {'00': 500, '11': 500}
# Never '01' or '10' — qubits are perfectly correlated!
```

---

## Why is Entanglement "Spooky"?

### The EPR Paradox (1935)

Einstein, Podolsky, and Rosen argued that quantum mechanics must be incomplete because entanglement seemed to require "spooky action at a distance" — information traveling faster than light.

They proposed that there must be **hidden variables** — pre-determined values that we simply can't see — that explain the correlations.

### Bell's Theorem (1964)

John Bell proved mathematically that **no hidden variable theory** can reproduce all the predictions of quantum mechanics. He derived inequalities (Bell inequalities) that any hidden-variable theory must satisfy.

### Experimental Proof

In 1982, Alain Aspect performed experiments that **violated Bell's inequalities**, confirming that quantum entanglement is real and cannot be explained by hidden variables. (Aspect won the Nobel Prize in 2022 for this work.)

### No Faster-Than-Light Communication

Despite the "instant" correlation, entanglement **cannot** be used to send information faster than light:

- Measuring qubit A gives a random result (0 or 1 with equal probability).
- Only when you **compare** both results do you see the correlation.
- Comparison requires classical communication (limited by the speed of light).

---

## Entanglement as a Resource

In quantum computing, entanglement isn't just a curiosity — it's a **computational resource**:

### 1. Quantum Algorithms

Most quantum algorithms that offer speedups over classical algorithms **require** entanglement. Without it, quantum circuits can be efficiently simulated classically.

### 2. Quantum Teleportation

Entanglement allows the "teleportation" of a quantum state from one location to another (using entanglement + classical communication). This is essential for quantum communication networks.

### 3. Superdense Coding

Using one entangled pair, you can send **two** classical bits of information by transmitting only **one** qubit — doubling the communication capacity.

### 4. Quantum Error Correction

Error correction codes use entanglement to spread quantum information across multiple physical qubits, protecting it from errors.

---

## Multi-Qubit Entanglement

Entanglement isn't limited to pairs. Important multi-qubit entangled states include:

### GHZ State (Greenberger–Horne–Zeilinger)

$$|GHZ\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$$

All three qubits are entangled: measuring any one determines all three.

### W State

$$|W\rangle = \frac{1}{\sqrt{3}}(|001\rangle + |010\rangle + |100\rangle)$$

More robust than GHZ — losing one qubit doesn't destroy all entanglement.

### Cluster States

Grid-like entangled states used in **measurement-based quantum computing** — an alternative model where computation is performed entirely through measurements on a large entangled state.

---

## Entanglement Measures

How do we quantify entanglement?

| Measure | Description |
|---------|-------------|
| **Concurrence** | 0 (separable) to 1 (maximally entangled) for two qubits |
| **Entanglement entropy** | Von Neumann entropy of the reduced density matrix |
| **Bell state fidelity** | How close a state is to a perfect Bell state |

For a Bell state, the entanglement entropy is exactly 1 (one "ebit" — entangled bit).

---

## Key Takeaways

- Entangled qubits have correlated outcomes that can't be explained by classical physics.
- Bell states are the maximally entangled two-qubit states.
- Entanglement is created using Hadamard + CNOT gates.
- Bell's theorem and experiments prove entanglement is real, not hidden variables.
- Entanglement doesn't enable faster-than-light communication.
- It's a critical resource for quantum algorithms, teleportation, error correction, and communication.

---

## Try It Yourself

**Problem**: Starting from $|00\rangle$, apply H to qubit 0, then CNOT (control: 0, target: 1). Write out the state after each step.

**Answer**:
1. $|00\rangle$
2. After H on q0: $\frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)|0\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$
3. After CNOT: $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle) = |\Phi^+\rangle$ ✓

Next, we'll explore **Quantum Measurement** →
