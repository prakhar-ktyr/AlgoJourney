---
title: "CNOT Gate"
---

# CNOT Gate (Controlled-NOT)

The **CNOT gate** (Controlled-NOT, also called CX gate) is the most important two-qubit gate in quantum computing. It entangles qubits, enables conditional logic, and together with single-qubit gates forms a universal gate set capable of performing any quantum computation.

---

## What Does CNOT Do?

The CNOT gate has two inputs:
- **Control qubit** — determines whether the operation happens
- **Target qubit** — gets flipped (NOT) if the control is $|1\rangle$

**Rule:** Flip the target qubit if and only if the control qubit is $|1\rangle$.

$$
\text{CNOT}: |c\rangle|t\rangle \rightarrow |c\rangle|c \oplus t\rangle
$$

where $\oplus$ denotes addition modulo 2 (XOR).

---

## Truth Table

| Control (input) | Target (input) | Control (output) | Target (output) |
|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 0 |

The control qubit is **never changed**. The target is flipped only when control = 1.

---

## Matrix Representation

The CNOT gate is a $4 \times 4$ unitary matrix acting on the two-qubit computational basis $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$:

$$
\text{CNOT} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}
$$

Reading column by column:
- $|00\rangle \rightarrow |00\rangle$ (control=0, no flip)
- $|01\rangle \rightarrow |01\rangle$ (control=0, no flip)
- $|10\rangle \rightarrow |11\rangle$ (control=1, target flipped)
- $|11\rangle \rightarrow |10\rangle$ (control=1, target flipped)

---

## Circuit Diagram Notation

In quantum circuit diagrams, the CNOT gate is drawn as:

```
Control: ──●──
           |
Target:  ──⊕──
```

- The **solid dot** (●) marks the control qubit
- The **circled plus** (⊕) marks the target qubit
- A vertical line connects them

---

## Creating Entanglement: Bell States

The most important application of CNOT is creating **entanglement**. The combination of a Hadamard gate followed by CNOT produces a **Bell state**:

$$
\text{CNOT}(H \otimes I)|00\rangle = \text{CNOT}\left(\frac{|0\rangle + |1\rangle}{\sqrt{2}} \otimes |0\rangle\right) = \text{CNOT}\frac{|00\rangle + |10\rangle}{\sqrt{2}}
$$

$$
= \frac{|00\rangle + |11\rangle}{\sqrt{2}} = |\Phi^+\rangle
$$

This is the **Bell state** $|\Phi^+\rangle$ — a maximally entangled state where measuring one qubit instantly determines the other.

### All Four Bell States

By varying the input, we get all four Bell states:

| Input | Circuit | Bell State |
|-------|---------|-----------|
| $\|00\rangle$ | $H \otimes I$, then CNOT | $\|\Phi^+\rangle = \frac{\|00\rangle + \|11\rangle}{\sqrt{2}}$ |
| $\|10\rangle$ | $H \otimes I$, then CNOT | $\|\Phi^-\rangle = \frac{\|00\rangle - \|11\rangle}{\sqrt{2}}$ |
| $\|01\rangle$ | $H \otimes I$, then CNOT | $\|\Psi^+\rangle = \frac{\|01\rangle + \|10\rangle}{\sqrt{2}}$ |
| $\|11\rangle$ | $H \otimes I$, then CNOT | $\|\Psi^-\rangle = \frac{\|01\rangle - \|10\rangle}{\sqrt{2}}$ |

---

## CNOT with Superposition Input

When the control qubit is in superposition, the CNOT creates entanglement:

$$
\text{CNOT}(\alpha|0\rangle + \beta|1\rangle)|0\rangle = \alpha|00\rangle + \beta|11\rangle
$$

This is an **entangled state** (unless $\alpha = 0$ or $\beta = 0$). It cannot be written as a product of individual qubit states.

---

## Controlled Operations Concept

The CNOT is the simplest example of a **controlled gate** — a gate that applies an operation conditionally:

$$
\text{Controlled-}U = |0\rangle\langle 0| \otimes I + |1\rangle\langle 1| \otimes U
$$

For CNOT, $U = X$ (the NOT/Pauli-X gate). The same pattern extends to any gate:
- **CZ** (Controlled-Z): applies Z to target if control is $|1\rangle$
- **CS** (Controlled-S): applies S to target if control is $|1\rangle$
- **CU** (Controlled-U): applies any unitary U conditionally

---

## Properties of CNOT

### 1. Self-inverse

$$
\text{CNOT} \cdot \text{CNOT} = I
$$

Applying CNOT twice returns to the original state.

### 2. Symmetric under basis change

If you apply Hadamard to both qubits, the control and target roles swap:

$$
(H \otimes H) \cdot \text{CNOT} \cdot (H \otimes H) = \text{CNOT}_{\text{reversed}}
$$

### 3. Preserves computational basis

CNOT maps computational basis states to computational basis states (it's a permutation matrix for the basis).

---

## Applications

### 1. Quantum Teleportation

CNOT is used in the Bell measurement step of quantum teleportation, enabling the transfer of quantum information using entanglement and classical communication.

### 2. Quantum Error Correction

CNOT gates copy (spread) quantum information across multiple qubits for redundancy:

$$
\text{CNOT}_{12}\text{CNOT}_{13}(\alpha|0\rangle + \beta|1\rangle)|00\rangle = \alpha|000\rangle + \beta|111\rangle
$$

### 3. Quantum Arithmetic

CNOT acts as a reversible XOR, forming the basis of quantum adders and other arithmetic circuits.

### 4. Entanglement Swapping

Chains of CNOT operations can transfer entanglement between distant qubits.

---

## Qiskit Code Examples

### Basic CNOT Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create a 2-qubit circuit
qc = QuantumCircuit(2)
qc.x(0)       # Set control qubit to |1⟩
qc.cx(0, 1)   # CNOT: control=0, target=1

print(qc.draw())
state = Statevector.from_instruction(qc)
print("Output state:", state)
# |11⟩ — control was 1, so target flipped from 0 to 1
```

### Creating a Bell State

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
qc = QuantumCircuit(2)
qc.h(0)        # Put control in superposition
qc.cx(0, 1)   # Entangle with CNOT

print(qc.draw())
state = Statevector.from_instruction(qc)
print("Bell state:", state)
# [0.707, 0, 0, 0.707] = (|00⟩ + |11⟩)/√2
```

### All Four Bell States

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

bell_states = {}

for c_bit, t_bit in [(0,0), (1,0), (0,1), (1,1)]:
    qc = QuantumCircuit(2)
    if c_bit:
        qc.x(0)
    if t_bit:
        qc.x(1)
    qc.h(0)
    qc.cx(0, 1)
    
    state = Statevector.from_instruction(qc)
    bell_states[f"|{c_bit}{t_bit}⟩"] = state
    print(f"Input |{c_bit}{t_bit}⟩ → Bell state: {state}")
```

### Measuring Entanglement

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create Bell state and measure
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()
print("Bell state measurements:", counts)
# Only '00' and '11' appear — never '01' or '10'!
# This demonstrates perfect correlation (entanglement)
```

### CNOT is Self-Inverse

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator
import numpy as np

# Apply CNOT twice
qc = QuantumCircuit(2)
qc.cx(0, 1)
qc.cx(0, 1)

op = Operator(qc)
identity = np.eye(4)
print("CNOT² = I:", np.allclose(op.data, identity))
# Output: True
```

### Simple Quantum Teleportation

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Teleport qubit 0 to qubit 2 using entanglement
qc = QuantumCircuit(3, 2)

# Prepare state to teleport (arbitrary state on qubit 0)
qc.rx(1.2, 0)  # Some arbitrary state

# Create Bell pair between qubits 1 and 2
qc.h(1)
qc.cx(1, 2)

# Bell measurement on qubits 0 and 1
qc.cx(0, 1)
qc.h(0)
qc.measure([0, 1], [0, 1])

# Conditional corrections on qubit 2
qc.x(2).c_if(1, 1)  # If qubit 1 measured 1
qc.z(2).c_if(0, 1)  # If qubit 0 measured 1

print(qc.draw())
```

---

## Key Takeaways

- CNOT flips the target qubit if and only if the control qubit is $|1\rangle$
- Its matrix is a $4 \times 4$ permutation that swaps $|10\rangle \leftrightarrow |11\rangle$
- Hadamard + CNOT creates Bell states (maximally entangled pairs)
- CNOT is self-inverse: applying it twice is the identity
- It is the fundamental two-qubit gate for universal quantum computation
- Applications include teleportation, error correction, and quantum arithmetic

---

## Try It Yourself

1. Create all four Bell states and verify their measurement statistics (only correlated outcomes)
2. Build a circuit with CNOT where the target is qubit 0 and control is qubit 1 (reversed)
3. Show that applying CNOT to $|+\rangle|0\rangle$ produces the same Bell state as $H|0\rangle$ then CNOT
4. Implement a 3-qubit GHZ state: $\frac{|000\rangle + |111\rangle}{\sqrt{2}}$ using H and two CNOTs

---

## Next Lesson

In the next lesson, [Multi-Qubit Gates](24-qc-multi-qubit-gates), we'll explore gates that operate on three or more qubits — including the Toffoli (CCNOT), SWAP, and Fredkin gates.
