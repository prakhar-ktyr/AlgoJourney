---
title: "Multi-Qubit Systems"
---

# Multi-Qubit Systems

Real quantum computers work with many qubits simultaneously. Understanding how multiple qubits combine into a single quantum system is essential for building quantum algorithms. In this lesson, you will learn about tensor products, multi-qubit state spaces, and the exponential power that comes from combining qubits.

---

## From One Qubit to Many

A single qubit lives in a 2-dimensional Hilbert space spanned by $|0\rangle$ and $|1\rangle$. When we combine multiple qubits, the combined state space grows **exponentially**.

| Number of Qubits | Basis States | Amplitudes Needed |
|---|---|---|
| 1 | 2 | 2 |
| 2 | 4 | 4 |
| 3 | 8 | 8 |
| n | $2^n$ | $2^n$ |

This exponential growth is what gives quantum computers their potential power over classical machines.

---

## The Tensor Product

When two quantum systems are combined, their joint state is described using the **tensor product** (also written as $\otimes$).

If qubit A is in state $|\psi\rangle$ and qubit B is in state $|\phi\rangle$, the combined two-qubit state is:

$$|\psi\rangle \otimes |\phi\rangle$$

This is often written in shorthand as $|\psi\rangle|\phi\rangle$ or $|\psi\phi\rangle$.

### Example: Two Qubits Both in |0⟩

$$|0\rangle \otimes |0\rangle = |00\rangle$$

As column vectors:

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad |0\rangle \otimes |0\rangle = \begin{pmatrix} 1 \cdot \begin{pmatrix} 1 \\ 0 \end{pmatrix} \\ 0 \cdot \begin{pmatrix} 1 \\ 0 \end{pmatrix} \end{pmatrix} = \begin{pmatrix} 1 \\ 0 \\ 0 \\ 0 \end{pmatrix}$$

### Tensor Product Rule

For vectors $|\psi\rangle = \begin{pmatrix} a \\ b \end{pmatrix}$ and $|\phi\rangle = \begin{pmatrix} c \\ d \end{pmatrix}$:

$$|\psi\rangle \otimes |\phi\rangle = \begin{pmatrix} a \cdot c \\ a \cdot d \\ b \cdot c \\ b \cdot d \end{pmatrix}$$

---

## Two-Qubit State Space

A two-qubit system has **four** computational basis states:

$$|00\rangle = \begin{pmatrix} 1 \\ 0 \\ 0 \\ 0 \end{pmatrix}, \quad |01\rangle = \begin{pmatrix} 0 \\ 1 \\ 0 \\ 0 \end{pmatrix}, \quad |10\rangle = \begin{pmatrix} 0 \\ 0 \\ 1 \\ 0 \end{pmatrix}, \quad |11\rangle = \begin{pmatrix} 0 \\ 0 \\ 0 \\ 1 \end{pmatrix}$$

Any two-qubit state can be written as a superposition:

$$|\Psi\rangle = \alpha_{00}|00\rangle + \alpha_{01}|01\rangle + \alpha_{10}|10\rangle + \alpha_{11}|11\rangle$$

The normalization condition requires:

$$|\alpha_{00}|^2 + |\alpha_{01}|^2 + |\alpha_{10}|^2 + |\alpha_{11}|^2 = 1$$

### Example: Creating a Superposition

If qubit A is in state $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ and qubit B is in state $|0\rangle$:

$$|+\rangle \otimes |0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) \otimes |0\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$$

---

## Three-Qubit Systems and Beyond

A three-qubit system has $2^3 = 8$ basis states:

$$|000\rangle, |001\rangle, |010\rangle, |011\rangle, |100\rangle, |101\rangle, |110\rangle, |111\rangle$$

The general three-qubit state:

$$|\Psi\rangle = \sum_{i=0}^{7} \alpha_i |i\rangle$$

where $|i\rangle$ represents the binary encoding of the integer $i$.

For **n qubits**, the state vector has $2^n$ complex amplitudes. A 50-qubit system requires $2^{50} \approx 10^{15}$ complex numbers — more than a petabyte of classical memory to store!

---

## Separable vs Entangled States

### Separable (Product) States

A multi-qubit state is **separable** if it can be written as a tensor product of individual qubit states:

$$|\Psi\rangle = |\psi_1\rangle \otimes |\psi_2\rangle \otimes \cdots \otimes |\psi_n\rangle$$

**Example:** $|+\rangle \otimes |0\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$ is separable.

### Entangled States

A state is **entangled** if it **cannot** be decomposed into a product of individual qubit states.

**Example:** The Bell state:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

Try to write this as $(a|0\rangle + b|1\rangle) \otimes (c|0\rangle + d|1\rangle) = ac|00\rangle + ad|01\rangle + bc|10\rangle + bd|11\rangle$.

For this to equal $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$, we need $ad = 0$ and $bc = 0$ but $ac \neq 0$ and $bd \neq 0$. This is impossible! So the Bell state is genuinely entangled.

---

## State Vector Representation

For practical computation, we represent multi-qubit states as column vectors ordered by binary counting:

| Index | Binary | State |
|---|---|---|
| 0 | 00 | $\|00\rangle$ |
| 1 | 01 | $\|01\rangle$ |
| 2 | 10 | $\|10\rangle$ |
| 3 | 11 | $\|11\rangle$ |

The state $|\Psi\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle$ is represented as:

$$|\Psi\rangle = \begin{pmatrix} \frac{1}{\sqrt{2}} \\ 0 \\ 0 \\ \frac{1}{\sqrt{2}} \end{pmatrix}$$

---

## Qiskit Examples

### Creating a Two-Qubit Product State

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create |+0⟩ = (|00⟩ + |10⟩) / sqrt(2)
qc = QuantumCircuit(2)
qc.h(0)  # Apply Hadamard to qubit 0

# Get the statevector
state = Statevector.from_instruction(qc)
print("State |+0⟩:")
print(state)
# Output: [0.707+0j, 0+0j, 0.707+0j, 0+0j]
```

### Creating a Bell State (Entangled)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create Bell state |Φ+⟩ = (|00⟩ + |11⟩) / sqrt(2)
qc = QuantumCircuit(2)
qc.h(0)      # Put qubit 0 in superposition
qc.cx(0, 1)  # CNOT: entangle qubit 0 and qubit 1

state = Statevector.from_instruction(qc)
print("Bell state |Φ+⟩:")
print(state)
# Output: [0.707+0j, 0+0j, 0+0j, 0.707+0j]
```

### Three-Qubit GHZ State

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create GHZ state: (|000⟩ + |111⟩) / sqrt(2)
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)

state = Statevector.from_instruction(qc)
print("GHZ state:")
print(state)
# Output: [0.707+0j, 0, 0, 0, 0, 0, 0, 0.707+0j]
```

### Checking if a State is Separable

```python
from qiskit.quantum_info import Statevector, partial_trace, DensityMatrix
import numpy as np

# Bell state (entangled)
bell = Statevector([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])

# Product state (separable)
product = Statevector([1/np.sqrt(2), 0, 1/np.sqrt(2), 0])

# Check purity of reduced density matrix
# For separable states, reduced state is pure (purity = 1)
rho_bell = partial_trace(bell, [1])
rho_product = partial_trace(product, [1])

print(f"Bell state reduced purity: {DensityMatrix(rho_bell).purity():.4f}")
# ~0.5 → entangled
print(f"Product state reduced purity: {DensityMatrix(rho_product).purity():.4f}")
# ~1.0 → separable
```

---

## Key Takeaways

- Multi-qubit systems use the **tensor product** to combine individual qubit states.
- An n-qubit system lives in a $2^n$-dimensional Hilbert space.
- Two-qubit systems have four basis states: $|00\rangle$, $|01\rangle$, $|10\rangle$, $|11\rangle$.
- **Separable states** can be written as a product of single-qubit states; **entangled states** cannot.
- The exponential growth of state space ($2^n$ amplitudes for n qubits) is the source of quantum computational advantage.
- Entanglement is a uniquely quantum resource with no classical analogue.

---

## Try It Yourself

1. Compute the tensor product $|+\rangle \otimes |−\rangle$ by hand. Write out all four amplitudes.
2. Verify that the state $\frac{1}{\sqrt{2}}(|01\rangle + |10\rangle)$ is entangled by attempting to factor it.
3. Modify the Qiskit example to create a 4-qubit GHZ state: $\frac{1}{\sqrt{2}}(|0000\rangle + |1111\rangle)$.
4. Use `Statevector` to create the state $|+\rangle \otimes |+\rangle$ and verify it has equal amplitudes for all four basis states.

---

## Next Lesson

Next, we will learn about **Quantum Registers** — how to organize and manage collections of qubits in practical quantum circuits.
