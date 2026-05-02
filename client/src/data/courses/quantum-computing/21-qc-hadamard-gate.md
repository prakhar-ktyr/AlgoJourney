---
title: "Hadamard Gate"
---

# Hadamard Gate

The **Hadamard gate** (H gate) is arguably the most important single-qubit gate in quantum computing. It creates **superposition** — the ability for a qubit to be in a combination of $|0\rangle$ and $|1\rangle$ simultaneously. Nearly every quantum algorithm begins by applying Hadamard gates to put qubits into superposition.

---

## Matrix Representation

The Hadamard gate is represented by the following $2 \times 2$ unitary matrix:

$$
H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}
$$

The factor $\frac{1}{\sqrt{2}}$ ensures the gate is **unitary** — it preserves the total probability of 1.

---

## Action on Basis States

The Hadamard gate transforms the computational basis states into **superposition states**:

### On $|0\rangle$:

$$
H|0\rangle = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} \begin{pmatrix} 1 \\ 0 \end{pmatrix} = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle
$$

### On $|1\rangle$:

$$
H|1\rangle = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} \begin{pmatrix} 0 \\ 1 \end{pmatrix} = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{|0\rangle - |1\rangle}{\sqrt{2}} = |-\rangle
$$

The states $|+\rangle$ and $|-\rangle$ are called the **Hadamard basis** (or X-basis). When measured in the computational basis, both give $|0\rangle$ or $|1\rangle$ with equal probability of 50%.

---

## Creating Superposition

The primary purpose of the Hadamard gate is to create superposition from a definite state:

| Input | Output | Measurement Probabilities |
|-------|--------|--------------------------|
| $\|0\rangle$ | $\|+\rangle = \frac{\|0\rangle + \|1\rangle}{\sqrt{2}}$ | 50% $\|0\rangle$, 50% $\|1\rangle$ |
| $\|1\rangle$ | $\|-\rangle = \frac{\|0\rangle - \|1\rangle}{\sqrt{2}}$ | 50% $\|0\rangle$, 50% $\|1\rangle$ |

> **Note:** Although both $|+\rangle$ and $|-\rangle$ give 50/50 measurement outcomes, they are **different states** — the relative phase (the minus sign) matters for interference in quantum algorithms.

---

## Self-Inverse Property

A remarkable property of the Hadamard gate is that it is its own inverse:

$$
H \cdot H = H^2 = I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}
$$

This means applying the Hadamard gate **twice** returns the qubit to its original state:

$$
H(H|0\rangle) = H|+\rangle = |0\rangle
$$

**Proof:**

$$
H^2 = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} \cdot \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} = \frac{1}{2} \begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix} = I
$$

This is useful in algorithms: apply H to enter superposition, perform operations, then apply H again to "decode" the result.

---

## Hadamard on Multiple Qubits

When you apply H to each qubit in an $n$-qubit register initialized to $|0\rangle^{\otimes n}$, you create a **uniform superposition** over all $2^n$ basis states:

$$
H^{\otimes n}|0\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle
$$

For example, with 3 qubits:

$$
H^{\otimes 3}|000\rangle = \frac{1}{\sqrt{8}}(|000\rangle + |001\rangle + |010\rangle + |011\rangle + |100\rangle + |101\rangle + |110\rangle + |111\rangle)
$$

This is why quantum computers can explore $2^n$ possibilities "at once" — a key ingredient of quantum speedup.

---

## Role in Quantum Algorithms

The Hadamard gate appears in virtually every quantum algorithm:

1. **Deutsch-Jozsa Algorithm** — H gates create the initial superposition and decode the final answer
2. **Grover's Search** — H gates initialize the search and form part of the diffusion operator
3. **Quantum Fourier Transform** — Hadamard gates combined with phase gates
4. **Shor's Algorithm** — Begins with Hadamard gates for superposition
5. **Variational Algorithms (VQE, QAOA)** — Used in ansatz circuits

---

## Bloch Sphere Interpretation

On the Bloch sphere, the Hadamard gate performs a **180° rotation about the axis that bisects X and Z**:

- The rotation axis is $\frac{\hat{X} + \hat{Z}}{\sqrt{2}}$
- $|0\rangle$ (north pole) maps to $|+\rangle$ (positive X-axis)
- $|1\rangle$ (south pole) maps to $|-\rangle$ (negative X-axis)
- $|+\rangle$ maps back to $|0\rangle$
- $|-\rangle$ maps back to $|1\rangle$

The Hadamard can also be decomposed as:

$$
H = \frac{X + Z}{\sqrt{2}}
$$

where $X$ and $Z$ are the Pauli gates.

---

## General Formula

For an arbitrary state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$:

$$
H|\psi\rangle = \frac{(\alpha + \beta)|0\rangle + (\alpha - \beta)|1\rangle}{\sqrt{2}}
$$

---

## Qiskit Code Examples

### Basic Hadamard Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create a circuit with 1 qubit
qc = QuantumCircuit(1)

# Apply Hadamard gate
qc.h(0)

# Visualize the circuit
print(qc.draw())

# Check the resulting state
state = Statevector.from_instruction(qc)
print("State after H|0⟩:", state)
# Output: [0.707+0j, 0.707+0j] which is |+⟩
```

### Verifying Self-Inverse Property

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Apply H twice
qc = QuantumCircuit(1)
qc.h(0)
qc.h(0)

state = Statevector.from_instruction(qc)
print("State after HH|0⟩:", state)
# Output: [1+0j, 0+0j] which is |0⟩ — back to the start!
```

### Creating Uniform Superposition on 3 Qubits

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# 3-qubit uniform superposition
qc = QuantumCircuit(3)
qc.h([0, 1, 2])  # Apply H to all qubits

print(qc.draw())

state = Statevector.from_instruction(qc)
print("Probabilities:", state.probabilities_dict())
# Each of the 8 states has probability 1/8 = 0.125
```

### Measuring a Superposition State

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create superposition and measure
qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

# Run 1000 shots
simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()
print("Measurement results:", counts)
# Approximately {'0': 500, '1': 500}
```

---

## Key Takeaways

- The Hadamard gate creates superposition: $H|0\rangle = |+\rangle$ and $H|1\rangle = |-\rangle$
- Its matrix is $H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$
- It is self-inverse: $HH = I$ (applying twice returns to the original state)
- Applied to $n$ qubits, it creates a uniform superposition of $2^n$ states
- On the Bloch sphere, it is a 180° rotation about the $(X+Z)/\sqrt{2}$ axis
- It appears at the start of nearly every quantum algorithm

---

## Try It Yourself

1. Create a circuit that applies H to $|1\rangle$ (hint: use an X gate first) and verify you get $|-\rangle$
2. Apply H gates to a 4-qubit register and verify all 16 states have equal probability
3. Use the Statevector simulator to confirm that $H|+\rangle = |0\rangle$
4. Build a circuit that applies H, then Z, then H to $|0\rangle$ — what state do you get? (Hint: $HZH = X$)

---

## Next Lesson

In the next lesson, [Phase and T Gates](22-qc-phase-t-gates), we'll explore gates that modify the **phase** of quantum states without changing measurement probabilities — a subtle but crucial resource for quantum computation.
