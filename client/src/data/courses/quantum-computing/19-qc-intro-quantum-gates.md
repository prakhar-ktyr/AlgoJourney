---
title: "Introduction to Quantum Gates"
---

# Introduction to Quantum Gates

Quantum gates are the building blocks of quantum circuits — they are the quantum equivalent of classical logic gates. In this lesson, you'll learn what quantum gates are, their key properties, and how they transform qubit states. This sets the foundation for all quantum algorithms.

---

## What Are Quantum Gates?

A **quantum gate** is a unitary operation that transforms one or more qubits from one state to another. Just as classical computers compute by applying logic gates (AND, OR, NOT) to bits, quantum computers compute by applying quantum gates to qubits.

Key differences from classical gates:

| Property | Classical Gates | Quantum Gates |
|---|---|---|
| Inputs/Outputs | Can have fewer outputs than inputs | Always same number of inputs and outputs |
| Reversibility | Generally irreversible (AND, OR) | Always reversible |
| Mathematical form | Truth tables | Unitary matrices |
| Superposition | No | Yes — inputs can be superpositions |

---

## Key Properties of Quantum Gates

### 1. Unitarity

Every quantum gate is represented by a **unitary matrix** $U$. A matrix is unitary if:

$$U^\dagger U = U U^\dagger = I$$

where $U^\dagger$ is the conjugate transpose of $U$ and $I$ is the identity matrix.

**Why unitarity?** It guarantees:
- **Norm preservation**: $\langle\psi|\psi\rangle = 1$ is maintained — probabilities always sum to 1.
- **Reversibility**: $U^{-1} = U^\dagger$ always exists.

### 2. Reversibility

Since every unitary matrix has an inverse ($U^\dagger$), every quantum gate can be **undone**. If $U|{\psi}\rangle = |\phi\rangle$, then $U^\dagger|\phi\rangle = |\psi\rangle$.

This is fundamentally different from classical computing where gates like AND lose information (you can't determine both inputs from the output alone).

### 3. Linearity

Quantum gates are **linear operators**. If a gate $U$ acts on a superposition:

$$U(\alpha|0\rangle + \beta|1\rangle) = \alpha \cdot U|0\rangle + \beta \cdot U|1\rangle$$

This means we only need to know how a gate transforms the basis states to know how it transforms any state.

---

## Gate Representation as Matrices

A single-qubit gate is a $2 \times 2$ unitary matrix. It acts on a qubit state by matrix multiplication:

$$|\psi'\rangle = U|\psi\rangle$$

$$\begin{pmatrix} \alpha' \\ \beta' \end{pmatrix} = \begin{pmatrix} u_{00} & u_{01} \\ u_{10} & u_{11} \end{pmatrix} \begin{pmatrix} \alpha \\ \beta \end{pmatrix}$$

A two-qubit gate is a $4 \times 4$ unitary matrix. An n-qubit gate is a $2^n \times 2^n$ unitary matrix.

### Verifying Unitarity

**Example**: Is the Hadamard matrix unitary?

$$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

Since $H$ has only real entries, $H^\dagger = H^T = H$.

$$H^\dagger H = H \cdot H = \frac{1}{2}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} = \frac{1}{2}\begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix} = I \checkmark$$

---

## Single-Qubit Gates Overview

Here are the most important single-qubit gates:

| Gate | Symbol | Matrix | Action |
|---|---|---|---|
| Identity | $I$ | $\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$ | Does nothing |
| Pauli X | $X$ | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ | Bit flip (NOT) |
| Pauli Y | $Y$ | $\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$ | Bit + phase flip |
| Pauli Z | $Z$ | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ | Phase flip |
| Hadamard | $H$ | $\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ | Creates superposition |
| Phase (S) | $S$ | $\begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}$ | Quarter turn phase |
| T gate | $T$ | $\begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}$ | Eighth turn phase |

---

## Multi-Qubit Gates Overview

Multi-qubit gates operate on two or more qubits simultaneously:

| Gate | Qubits | Purpose |
|---|---|---|
| CNOT (CX) | 2 | Controlled NOT — flips target if control is $\|1\rangle$ |
| CZ | 2 | Controlled Z — applies Z to target if control is $\|1\rangle$ |
| SWAP | 2 | Exchanges two qubits |
| Toffoli (CCX) | 3 | Controlled-controlled NOT |
| Fredkin (CSWAP) | 3 | Controlled SWAP |

The **CNOT gate** matrix (control = qubit 0, target = qubit 1):

$$\text{CNOT} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

It maps: $|00\rangle \to |00\rangle$, $|01\rangle \to |01\rangle$, $|10\rangle \to |11\rangle$, $|11\rangle \to |10\rangle$.

---

## Circuit Diagram Notation

Quantum circuits are read **left to right** (time flows left to right). Each horizontal line represents a qubit:

```
     ┌───┐     ┌───┐
q0: ─┤ H ├──■──┤ X ├─
     └───┘  │  └───┘
          ┌─┴─┐
q1: ──────┤ X ├──────
          └───┘
```

Common symbols:
- **Box with label**: single-qubit gate (H, X, Z, etc.)
- **Filled dot (●) + line**: control qubit for controlled gate
- **⊕ (target)**: target of CNOT
- **Meter symbol**: measurement
- **Double line**: classical bits

---

## How Gates Transform the Bloch Sphere

Single-qubit gates correspond to **rotations** of the Bloch sphere:

- **X gate**: 180° rotation around the x-axis
- **Y gate**: 180° rotation around the y-axis
- **Z gate**: 180° rotation around the z-axis
- **H gate**: 180° rotation around the axis halfway between x and z
- **S gate**: 90° rotation around the z-axis
- **T gate**: 45° rotation around the z-axis

A general single-qubit gate can be decomposed as rotations:

$$U = e^{i\gamma} R_z(\alpha) R_y(\beta) R_z(\delta)$$

where $R_n(\theta)$ denotes rotation by angle $\theta$ about axis $n$.

The rotation operators:

$$R_x(\theta) = e^{-i\theta X/2} = \begin{pmatrix} \cos\frac{\theta}{2} & -i\sin\frac{\theta}{2} \\ -i\sin\frac{\theta}{2} & \cos\frac{\theta}{2} \end{pmatrix}$$

$$R_y(\theta) = e^{-i\theta Y/2} = \begin{pmatrix} \cos\frac{\theta}{2} & -\sin\frac{\theta}{2} \\ \sin\frac{\theta}{2} & \cos\frac{\theta}{2} \end{pmatrix}$$

$$R_z(\theta) = e^{-i\theta Z/2} = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$$

---

## Composing Gates

Gates applied in sequence are multiplied as matrices. If gate $A$ is applied first, then gate $B$:

$$|\psi_{final}\rangle = B \cdot A \cdot |\psi\rangle$$

**Note**: The order is right-to-left in matrix notation (the first gate applied is rightmost).

### Example: H then X

$$XH|0\rangle = X \left(\frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)\right) = \frac{1}{\sqrt{2}}(|1\rangle + |0\rangle) = |+\rangle$$

As matrices:

$$XH = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & -1 \\ 1 & 1 \end{pmatrix}$$

---

## Qiskit: Applying Gates

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
import numpy as np

# Create a simple circuit
qc = QuantumCircuit(1)
qc.h(0)        # Apply Hadamard
qc.z(0)        # Apply Pauli Z

# See the circuit
print(qc.draw())

# Get the resulting state (starting from |0⟩)
state = Statevector.from_instruction(qc)
print(f"Final state: {state}")

# Get the combined unitary matrix
op = Operator(qc)
print(f"Combined matrix:\n{np.round(op.data, 3)}")
```

### Visualizing Gate Action

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Show how X gate transforms different states
states = {
    '|0⟩': Statevector([1, 0]),
    '|1⟩': Statevector([0, 1]),
    '|+⟩': Statevector([1/np.sqrt(2), 1/np.sqrt(2)]),
}

qc = QuantumCircuit(1)
qc.x(0)

for name, initial in states.items():
    result = initial.evolve(qc)
    print(f"X{name} = {result}")
```

### Verifying Unitarity in Code

```python
from qiskit.quantum_info import Operator
import numpy as np

# Get the Hadamard matrix
H = Operator.from_label('H')

# Check U†U = I
product = H.adjoint().compose(H)
print("H†H =")
print(np.round(product.data, 10))
# Should be identity matrix

# Check if operator is unitary
print(f"Is H unitary? {H.is_unitary()}")
```

---

## Universal Gate Sets

Not every quantum gate needs to be built into hardware. A small set of gates can **approximate any unitary** to arbitrary precision:

- **{H, T, CNOT}** — a universal gate set
- **{H, Toffoli}** — another universal set
- Any single-qubit rotation + any entangling two-qubit gate

The **Solovay-Kitaev theorem** guarantees that any single-qubit gate can be approximated to precision $\epsilon$ using $O(\log^c(1/\epsilon))$ gates from a universal set.

---

## Key Takeaways

- Quantum gates are **unitary matrices** that transform qubit states.
- Unitarity ensures **reversibility** and **norm preservation** ($U^\dagger U = I$).
- Single-qubit gates are $2 \times 2$ matrices; n-qubit gates are $2^n \times 2^n$.
- Gates correspond to **rotations on the Bloch sphere** for single qubits.
- Circuit diagrams read left to right; matrix multiplication reads right to left.
- A small **universal gate set** (like {H, T, CNOT}) can approximate any quantum operation.
- Quantum gates operate **linearly** on superpositions.

---

## Try It Yourself

1. Verify that the Pauli X matrix is unitary by computing $X^\dagger X$.
2. What state do you get by applying H, then Z, then H to $|0\rangle$? (Hint: $HZH = X$)
3. In Qiskit, create a circuit that applies X then H to $|0\rangle$ and print the final statevector.
4. Use `Operator(qc).is_unitary()` to verify that any circuit you build is unitary.
5. Compose two Hadamard gates and verify that $H^2 = I$ (Hadamard is its own inverse).

---

## Next Lesson

Next, we'll dive into the **Pauli Gates (X, Y, Z)** — the three fundamental single-qubit gates that form the basis of quantum gate operations.
