---
title: "Phase and T Gates"
---

# Phase and T Gates

While the Hadamard gate creates superposition, **phase gates** modify the relative phase between $|0\rangle$ and $|1\rangle$ without changing measurement probabilities. These "invisible" transformations are essential for quantum interference and form the backbone of universal quantum computation.

---

## What Are Phase Gates?

A general phase gate adds a phase $\phi$ to the $|1\rangle$ component while leaving $|0\rangle$ unchanged:

$$
R_\phi = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\phi} \end{pmatrix}
$$

Acting on a superposition state $\alpha|0\rangle + \beta|1\rangle$:

$$
R_\phi(\alpha|0\rangle + \beta|1\rangle) = \alpha|0\rangle + \beta e^{i\phi}|1\rangle
$$

The probabilities $|\alpha|^2$ and $|\beta|^2$ remain unchanged — the gate only affects the **relative phase**. This phase becomes observable when combined with other gates (like Hadamard) that create interference.

---

## The Z Gate (Review)

The Z gate is the simplest phase gate with $\phi = \pi$:

$$
Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi} \end{pmatrix}
$$

It flips the sign of $|1\rangle$: $Z(\alpha|0\rangle + \beta|1\rangle) = \alpha|0\rangle - \beta|1\rangle$

---

## The S Gate (Phase Gate)

The **S gate** (also called the **Phase gate** or $\sqrt{Z}$) applies a $\pi/2$ phase:

$$
S = \begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/2} \end{pmatrix}
$$

### Action on basis states:

- $S|0\rangle = |0\rangle$ (no change)
- $S|1\rangle = i|1\rangle$ (adds phase $\pi/2$)

### Key property:

$$
S^2 = Z
$$

because $e^{i\pi/2} \cdot e^{i\pi/2} = e^{i\pi} = -1$.

### On the Bloch sphere:

The S gate performs a **90° rotation about the Z-axis**.

---

## The S† (S-dagger) Gate

The **S†** (S-dagger) gate is the inverse of S, applying a $-\pi/2$ phase:

$$
S^\dagger = \begin{pmatrix} 1 & 0 \\ 0 & -i \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & e^{-i\pi/2} \end{pmatrix}
$$

### Properties:

- $S \cdot S^\dagger = I$ (they cancel each other)
- $S^\dagger$ rotates $-90°$ about the Z-axis on the Bloch sphere

---

## The T Gate (π/8 Gate)

The **T gate** applies a $\pi/4$ phase and is one of the most important gates in quantum computing:

$$
T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}
$$

> **Historical note:** The T gate is sometimes called the "$\pi/8$ gate" because it can be written as $e^{i\pi/8} R_Z(\pi/4)$, where the global phase is $\pi/8$. The relative phase between $|0\rangle$ and $|1\rangle$ is $\pi/4$.

### Action on basis states:

- $T|0\rangle = |0\rangle$
- $T|1\rangle = e^{i\pi/4}|1\rangle$

### Key property:

$$
T^2 = S
$$

because $e^{i\pi/4} \cdot e^{i\pi/4} = e^{i\pi/2} = i$.

### The full hierarchy:

$$
T^2 = S, \quad S^2 = Z, \quad \text{therefore} \quad T^4 = Z, \quad T^8 = I
$$

---

## The T† (T-dagger) Gate

The **T†** gate is the inverse of T, applying a $-\pi/4$ phase:

$$
T^\dagger = \begin{pmatrix} 1 & 0 \\ 0 & e^{-i\pi/4} \end{pmatrix}
$$

### Properties:

- $T \cdot T^\dagger = I$
- $(T^\dagger)^2 = S^\dagger$

---

## Summary of Phase Gate Relationships

| Gate | Phase $\phi$ | Matrix diagonal | Relationship |
|------|-------------|-----------------|-------------|
| $I$ | $0$ | $(1, 1)$ | $T^8$ |
| $T$ | $\pi/4$ | $(1, e^{i\pi/4})$ | $\sqrt{S}$ |
| $S$ | $\pi/2$ | $(1, i)$ | $T^2 = \sqrt{Z}$ |
| $Z$ | $\pi$ | $(1, -1)$ | $S^2 = T^4$ |

---

## Why the T Gate Is Special

The T gate is crucial because it makes quantum computation **universal**:

- The **Clifford group** $\{H, S, \text{CNOT}\}$ can be efficiently simulated on a classical computer (Gottesman-Knill theorem)
- Adding the **T gate** breaks out of the Clifford group and enables universal quantum computation
- $\{H, T, \text{CNOT}\}$ is a **universal gate set** — it can approximate any quantum operation to arbitrary precision

The T gate is the "magic ingredient" that gives quantum computers their power beyond classical simulation.

---

## Phase Kickback

**Phase kickback** is a phenomenon where a phase applied to a target qubit "kicks back" to the control qubit. This is a key mechanism in many quantum algorithms.

### Example:

Consider a controlled-$Z$ operation where the target is in state $|1\rangle$:

$$
\text{If control} = |1\rangle: \quad CZ|1\rangle|1\rangle = -|1\rangle|1\rangle
$$

The phase $-1$ appears on the **entire** state, which is equivalent to the phase being on the control qubit. This is called kickback because the eigenvalue of the target "kicks back" to the control.

Phase kickback is fundamental to:
- **Quantum Phase Estimation** (QPE)
- **Deutsch-Jozsa Algorithm**
- **Grover's Oracle**

---

## Bloch Sphere Interpretation

All phase gates are **rotations about the Z-axis**:

| Gate | Z-rotation angle |
|------|-----------------|
| $T$ | $45°$ ($\pi/4$) |
| $S$ | $90°$ ($\pi/2$) |
| $Z$ | $180°$ ($\pi$) |
| $T^\dagger$ | $-45°$ ($-\pi/4$) |
| $S^\dagger$ | $-90°$ ($-\pi/2$) |

States on the equator of the Bloch sphere (like $|+\rangle$ and $|-\rangle$) are most visibly affected by these rotations:

$$
S|+\rangle = \frac{|0\rangle + i|1\rangle}{\sqrt{2}} = |{+i}\rangle \quad \text{(points along +Y axis)}
$$

---

## Qiskit Code Examples

### Applying Phase Gates

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Create circuit and apply different phase gates
qc = QuantumCircuit(4)

# Put all qubits in superposition first
qc.h([0, 1, 2, 3])

# Apply different phase gates
qc.t(0)    # T gate (π/4 phase)
qc.s(1)    # S gate (π/2 phase)
qc.z(2)    # Z gate (π phase)
qc.tdg(3)  # T† gate (-π/4 phase)

print(qc.draw())
```

### Verifying T² = S

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# Circuit with T applied twice
qc_tt = QuantumCircuit(1)
qc_tt.t(0)
qc_tt.t(0)

# Circuit with S
qc_s = QuantumCircuit(1)
qc_s.s(0)

# Compare operators
op_tt = Operator(qc_tt)
op_s = Operator(qc_s)

print("T² == S:", op_tt.equiv(op_s))
# Output: True
```

### Verifying S² = Z

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# Circuit with S applied twice
qc_ss = QuantumCircuit(1)
qc_ss.s(0)
qc_ss.s(0)

# Circuit with Z
qc_z = QuantumCircuit(1)
qc_z.z(0)

op_ss = Operator(qc_ss)
op_z = Operator(qc_z)

print("S² == Z:", op_ss.equiv(op_z))
# Output: True
```

### Observing Phase Effects on Measurement

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Phase gates don't change probabilities directly
qc = QuantumCircuit(1, 1)
qc.h(0)       # Create |+⟩
qc.t(0)       # Apply T — adds phase but probabilities unchanged
qc.measure(0, 0)

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
print("After H then T:", result.get_counts())
# Still ~50/50 — phase doesn't affect Z-basis measurement!

# But phase matters when we apply H again:
qc2 = QuantumCircuit(1, 1)
qc2.h(0)      # |+⟩
qc2.t(0)      # Phase rotation
qc2.h(0)      # Interference!
qc2.measure(0, 0)

result2 = simulator.run(qc2, shots=1000).result()
print("After H-T-H:", result2.get_counts())
# NOT 50/50 — phase causes constructive/destructive interference
```

### Phase Kickback Demonstration

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Demonstrate phase kickback with controlled-Z
qc = QuantumCircuit(2)
qc.h(0)       # Control in |+⟩
qc.x(1)       # Target in |1⟩
qc.cz(0, 1)  # Controlled-Z

state = Statevector.from_instruction(qc)
print("State after CZ:", state)
# The phase kicks back to the control qubit!
```

---

## Key Takeaways

- Phase gates modify the relative phase $e^{i\phi}$ on $|1\rangle$ without changing measurement probabilities
- The S gate adds $\pi/2$ phase: $S = \sqrt{Z}$, and the T gate adds $\pi/4$ phase: $T = \sqrt{S}$
- Hierarchy: $T^2 = S$, $S^2 = Z$, $T^8 = I$
- The T gate is the key non-Clifford gate that enables universal quantum computation
- Phase effects become visible through interference (e.g., applying H after a phase gate)
- Phase kickback is a mechanism where eigenvalue phases transfer to control qubits

---

## Try It Yourself

1. Build a circuit: $H \rightarrow S \rightarrow H$ applied to $|0\rangle$. What final state do you get?
2. Verify that $T^8 = I$ by applying T eight times and checking the output state
3. Show that $S|+\rangle = |{+i}\rangle = \frac{|0\rangle + i|1\rangle}{\sqrt{2}}$ using the Statevector simulator
4. Create a circuit demonstrating that phase gates commute (e.g., $S \cdot T = T \cdot S$)

---

## Next Lesson

In the next lesson, [CNOT Gate](23-qc-cnot-gate), we'll explore our first **two-qubit gate** — the Controlled-NOT gate that creates entanglement and is essential for quantum computation.
