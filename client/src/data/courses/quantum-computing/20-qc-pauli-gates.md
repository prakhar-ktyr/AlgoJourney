---
title: "Pauli Gates (X, Y, Z)"
---

# Pauli Gates (X, Y, Z)

The Pauli gates are three fundamental single-qubit quantum gates named after physicist Wolfgang Pauli. Together with the identity, they form the **Pauli group** — a cornerstone of quantum computing, error correction, and quantum information theory. In this lesson, you will master each Pauli gate's matrix, action, and geometric interpretation.

---

## Overview of the Pauli Gates

| Gate | Matrix | Name | Classical Analogue |
|---|---|---|---|
| $X$ | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ | Bit flip | NOT gate |
| $Y$ | $\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$ | Bit + phase flip | No analogue |
| $Z$ | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ | Phase flip | No analogue |

All three are:
- **Hermitian**: $P = P^\dagger$ (self-adjoint)
- **Unitary**: $P^\dagger P = I$
- **Involutory**: $P^2 = I$ (self-inverse — applying twice returns to original state)
- **Traceless**: $\text{Tr}(P) = 0$

---

## Pauli X Gate: The Quantum NOT

The X gate is the quantum equivalent of a classical NOT gate. It **flips** $|0\rangle$ to $|1\rangle$ and vice versa.

### Matrix

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$

### Action on Basis States

$$X|0\rangle = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \end{pmatrix} = |1\rangle$$

$$X|1\rangle = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} 0 \\ 1 \end{pmatrix} = \begin{pmatrix} 1 \\ 0 \end{pmatrix} = |0\rangle$$

### Action on Superposition States

$$X|+\rangle = X \cdot \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = |+\rangle$$

$$X|-\rangle = X \cdot \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} -1 \\ 1 \end{pmatrix} = -|-\rangle$$

Notice: $|+\rangle$ is an **eigenstate** of X with eigenvalue $+1$, and $|-\rangle$ is an eigenstate with eigenvalue $-1$.

### Bloch Sphere Interpretation

The X gate performs a **180° rotation around the x-axis** of the Bloch sphere:

$$X = e^{-i\pi X/2} \cdot i = \text{rotation by } \pi \text{ about x-axis}$$

This flips the north pole ($|0\rangle$) to the south pole ($|1\rangle$) and vice versa.

---

## Pauli Y Gate: Bit and Phase Flip

The Y gate combines a bit flip with a phase flip. It has complex entries involving $i$.

### Matrix

$$Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$$

### Action on Basis States

$$Y|0\rangle = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 0 \\ i \end{pmatrix} = i|1\rangle$$

$$Y|1\rangle = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}\begin{pmatrix} 0 \\ 1 \end{pmatrix} = \begin{pmatrix} -i \\ 0 \end{pmatrix} = -i|0\rangle$$

### Action on Superposition States

$$Y|+\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} -i \\ i \end{pmatrix} = i \cdot \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix} \cdot (-1) = -i|-\rangle$$

$$Y|-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}\begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} i \\ i \end{pmatrix} = i|+\rangle$$

### Bloch Sphere Interpretation

The Y gate performs a **180° rotation around the y-axis**:

This flips $|0\rangle$ to $|1\rangle$ (like X) but also introduces a phase factor of $i$.

### Relation to X and Z

$$Y = iXZ$$

The Y gate is equivalent to applying Z first, then X, multiplied by a global phase $i$.

---

## Pauli Z Gate: The Phase Flip

The Z gate leaves $|0\rangle$ unchanged but flips the sign (phase) of $|1\rangle$. It has no classical analogue because classical bits don't have phase.

### Matrix

$$Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$

### Action on Basis States

$$Z|0\rangle = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 1 \\ 0 \end{pmatrix} = |0\rangle$$

$$Z|1\rangle = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}\begin{pmatrix} 0 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ -1 \end{pmatrix} = -|1\rangle$$

### Action on Superposition States

$$Z|+\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix} = |-\rangle$$

$$Z|-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = |+\rangle$$

The Z gate swaps $|+\rangle$ and $|-\rangle$! This makes sense: Z is a NOT gate in the **Hadamard (X) basis**.

### Bloch Sphere Interpretation

The Z gate performs a **180° rotation around the z-axis**:

Points on the equator of the Bloch sphere (like $|+\rangle$ and $|-\rangle$) get rotated by 180°. Points on the poles ($|0\rangle$ and $|1\rangle$) are unchanged (up to global phase).

---

## Comparison Table

| | $X\|0\rangle$ | $X\|1\rangle$ | $X\|+\rangle$ | $X\|-\rangle$ |
|---|---|---|---|---|
| **X** | $\|1\rangle$ | $\|0\rangle$ | $\|+\rangle$ | $-\|-\rangle$ |
| **Y** | $i\|1\rangle$ | $-i\|0\rangle$ | $-i\|-\rangle$ | $i\|+\rangle$ |
| **Z** | $\|0\rangle$ | $-\|1\rangle$ | $\|-\rangle$ | $\|+\rangle$ |

---

## Self-Inverse Property

All Pauli gates are their own inverse:

$$X^2 = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix} = I$$

$$Y^2 = I, \quad Z^2 = I$$

This means applying any Pauli gate twice returns to the original state:

$$XX|\psi\rangle = |\psi\rangle$$

---

## Anti-Commutation Relations

The Pauli matrices **anti-commute** with each other:

$$XY = -YX, \quad YZ = -ZY, \quad ZX = -XZ$$

More precisely:

$$XY = iZ, \quad YX = -iZ$$
$$YZ = iX, \quad ZY = -iX$$
$$ZX = iY, \quad XZ = -iY$$

These can be summarized as:

$$\{P_i, P_j\} = P_i P_j + P_j P_i = 2\delta_{ij} I$$

where $\{A, B\}$ denotes the anti-commutator and $\delta_{ij}$ is the Kronecker delta.

---

## The Pauli Group

The **Pauli group** $\mathcal{P}_1$ on one qubit consists of all Pauli matrices multiplied by phases $\{\pm 1, \pm i\}$:

$$\mathcal{P}_1 = \{\pm I, \pm iI, \pm X, \pm iX, \pm Y, \pm iY, \pm Z, \pm iZ\}$$

This group has 16 elements and is closed under multiplication. It plays a crucial role in:
- **Quantum error correction** (stabilizer codes)
- **Clifford gates** (gates that map Paulis to Paulis under conjugation)
- **Randomized benchmarking**

For n qubits, the Pauli group $\mathcal{P}_n$ has elements that are tensor products of single-qubit Paulis (e.g., $X \otimes Z \otimes I$).

---

## Eigenvalues and Eigenstates

Each Pauli matrix has eigenvalues $+1$ and $-1$:

| Gate | Eigenvalue $+1$ | Eigenvalue $-1$ |
|---|---|---|
| $X$ | $\|+\rangle = \frac{1}{\sqrt{2}}(\|0\rangle + \|1\rangle)$ | $\|-\rangle = \frac{1}{\sqrt{2}}(\|0\rangle - \|1\rangle)$ |
| $Y$ | $\|+i\rangle = \frac{1}{\sqrt{2}}(\|0\rangle + i\|1\rangle)$ | $\|-i\rangle = \frac{1}{\sqrt{2}}(\|0\rangle - i\|1\rangle)$ |
| $Z$ | $\|0\rangle$ | $\|1\rangle$ |

The computational basis ($|0\rangle$, $|1\rangle$) is the eigenbasis of Z. This is why measurements in quantum computing are typically in the "Z basis."

---

## Qiskit: Demonstrating Each Gate

### Pauli X Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# X gate: bit flip
qc = QuantumCircuit(1)
qc.x(0)

# Apply to |0⟩
state_0 = Statevector([1, 0]).evolve(qc)
print(f"X|0⟩ = {state_0}")  # [0, 1] = |1⟩

# Apply to |1⟩
state_1 = Statevector([0, 1]).evolve(qc)
print(f"X|1⟩ = {state_1}")  # [1, 0] = |0⟩

# Apply to |+⟩
state_plus = Statevector([1/np.sqrt(2), 1/np.sqrt(2)]).evolve(qc)
print(f"X|+⟩ = {state_plus}")  # |+⟩ (unchanged)
```

### Pauli Y Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Y gate: bit + phase flip
qc = QuantumCircuit(1)
qc.y(0)

# Apply to |0⟩
state_0 = Statevector([1, 0]).evolve(qc)
print(f"Y|0⟩ = {state_0}")  # [0, i] = i|1⟩

# Apply to |1⟩
state_1 = Statevector([0, 1]).evolve(qc)
print(f"Y|1⟩ = {state_1}")  # [-i, 0] = -i|0⟩
```

### Pauli Z Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Z gate: phase flip
qc = QuantumCircuit(1)
qc.z(0)

# Apply to |0⟩ — no change
state_0 = Statevector([1, 0]).evolve(qc)
print(f"Z|0⟩ = {state_0}")  # [1, 0] = |0⟩

# Apply to |1⟩ — sign flip
state_1 = Statevector([0, 1]).evolve(qc)
print(f"Z|1⟩ = {state_1}")  # [0, -1] = -|1⟩

# Apply to |+⟩ — becomes |−⟩
state_plus = Statevector([1/np.sqrt(2), 1/np.sqrt(2)]).evolve(qc)
print(f"Z|+⟩ = {state_plus}")  # |−⟩
```

### Verifying Anti-Commutation

```python
from qiskit.quantum_info import Operator
import numpy as np

X = Operator.from_label('X')
Y = Operator.from_label('Y')
Z = Operator.from_label('Z')

# XY = iZ
XY = X.compose(Y)  # Y applied first, then X
print("XY =")
print(np.round(XY.data, 3))

# YX = -iZ
YX = Y.compose(X)  # X applied first, then Y
print("YX =")
print(np.round(YX.data, 3))

# Verify anti-commutation: XY + YX = 0
anticomm = Operator(XY.data + YX.data)
print(f"XY + YX = {np.round(anticomm.data, 10)}")  # Zero matrix
```

### Verifying Self-Inverse Property

```python
from qiskit.quantum_info import Operator
import numpy as np

X = Operator.from_label('X')
Y = Operator.from_label('Y')
Z = Operator.from_label('Z')
I = Operator.from_label('I')

print(f"X² = I? {(X.compose(X) == I)}")
print(f"Y² = I? {(Y.compose(Y) == I)}")
print(f"Z² = I? {(Z.compose(Z) == I)}")
```

---

## Practical Applications

### State Preparation

The X gate is essential for initializing qubits:

```python
from qiskit import QuantumCircuit

# Prepare the state |101⟩ (5 in binary)
qc = QuantumCircuit(3)
qc.x(0)  # Set qubit 0 to |1⟩
qc.x(2)  # Set qubit 2 to |1⟩
# Qubit 1 stays |0⟩
print(qc.draw())
```

### Error Detection

Pauli gates model common quantum errors:
- **Bit-flip error**: accidental X gate application
- **Phase-flip error**: accidental Z gate application
- **Bit-phase-flip error**: accidental Y gate application

---

## Key Takeaways

- **Pauli X** (bit flip): swaps $|0\rangle \leftrightarrow |1\rangle$, quantum NOT gate, rotation by $\pi$ about x-axis.
- **Pauli Y** (bit + phase flip): $|0\rangle \to i|1\rangle$, $|1\rangle \to -i|0\rangle$, rotation by $\pi$ about y-axis.
- **Pauli Z** (phase flip): $|0\rangle \to |0\rangle$, $|1\rangle \to -|1\rangle$, rotation by $\pi$ about z-axis.
- All Paulis are **self-inverse** ($P^2 = I$), **Hermitian** ($P = P^\dagger$), and **traceless**.
- Paulis **anti-commute**: $XY = -YX$, $YZ = -ZY$, $ZX = -XZ$.
- The **Pauli group** is foundational for error correction and the Clifford hierarchy.
- $|0\rangle, |1\rangle$ are eigenstates of Z; $|+\rangle, |-\rangle$ are eigenstates of X.

---

## Try It Yourself

1. Verify by hand that $Y^2 = I$ by multiplying the Y matrix by itself.
2. Compute $XZ|+\rangle$ and compare with $Y|+\rangle$ (they differ by a phase).
3. Use Qiskit to demonstrate that $HXH = Z$ (X in the Hadamard basis is Z).
4. Find the eigenstates of the Y gate. Verify that $\frac{1}{\sqrt{2}}(|0\rangle + i|1\rangle)$ has eigenvalue $+1$.
5. Create a circuit that applies X, then Y, then Z to $|0\rangle$. What is the final state? Verify with Qiskit.

---

## Next Lesson

Next, we'll study the **Hadamard Gate** — the most important single-qubit gate for creating superpositions and the foundation of many quantum algorithms.
