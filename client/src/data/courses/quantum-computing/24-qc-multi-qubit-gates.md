---
title: "Multi-Qubit Gates (Toffoli, SWAP, Fredkin)"
---

# Multi-Qubit Gates: Toffoli, SWAP, and Fredkin

Beyond single-qubit and two-qubit gates, **multi-qubit gates** operate on three or more qubits simultaneously. These gates are essential for building complex quantum circuits, implementing classical logic reversibly, and achieving universal computation.

---

## The SWAP Gate

The **SWAP gate** exchanges the states of two qubits:

$$
\text{SWAP}|a\rangle|b\rangle = |b\rangle|a\rangle
$$

### Matrix Representation

In the basis $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$:

$$
\text{SWAP} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}
$$

### Truth Table

| Input | Output |
|:-----:|:------:|
| $\|00\rangle$ | $\|00\rangle$ |
| $\|01\rangle$ | $\|10\rangle$ |
| $\|10\rangle$ | $\|01\rangle$ |
| $\|11\rangle$ | $\|11\rangle$ |

### Implementation from Three CNOTs

A SWAP gate can be decomposed into **three CNOT gates**:

```
q0: ──●──⊕──●──
      |  |  |
q1: ──⊕──●──⊕──
```

Mathematically:

$$
\text{SWAP} = \text{CNOT}_{01} \cdot \text{CNOT}_{10} \cdot \text{CNOT}_{01}
$$

**Proof by example:** Starting with $|10\rangle$:
1. $\text{CNOT}_{01}|10\rangle = |11\rangle$ (control=q0=1, flip q1)
2. $\text{CNOT}_{10}|11\rangle = |01\rangle$ (control=q1=1, flip q0)
3. $\text{CNOT}_{01}|01\rangle = |01\rangle$ (control=q0=0, no flip)

Result: $|10\rangle \rightarrow |01\rangle$ ✓

### Properties

- Self-inverse: $\text{SWAP}^2 = I$
- Symmetric: swapping the roles of the two qubits gives the same gate
- Does not create entanglement (it's a permutation of product states)

---

## The Toffoli Gate (CCNOT)

The **Toffoli gate** (also called CCNOT or CCX) is a three-qubit gate with two control qubits and one target qubit:

$$
\text{Toffoli}|a\rangle|b\rangle|c\rangle = |a\rangle|b\rangle|c \oplus (a \cdot b)\rangle
$$

The target qubit is flipped **only when both controls are** $|1\rangle$.

### Truth Table

| $a$ (ctrl1) | $b$ (ctrl2) | $c$ (target in) | $c$ (target out) |
|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | **1** |
| 1 | 1 | 1 | **0** |

Only the last two rows show a change — when both controls are 1.

### Matrix Representation

The Toffoli gate is an $8 \times 8$ matrix that is the identity everywhere except it swaps $|110\rangle \leftrightarrow |111\rangle$:

$$
\text{Toffoli} = \begin{pmatrix} 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 0 & 0 & 0 & 1 & 0 \end{pmatrix}
$$

### Circuit Diagram

```
ctrl1: ──●──
         |
ctrl2: ──●──
         |
target: ─⊕──
```

(Two dots stacked vertically connected to the target)

### Toffoli for Classical Reversible Computation

The Toffoli gate is **universal for classical reversible computation**. By setting certain inputs to fixed values, it can simulate:

- **AND gate**: $\text{Toffoli}|a\rangle|b\rangle|0\rangle = |a\rangle|b\rangle|a \cdot b\rangle$
- **NOT gate** (fanout): $\text{Toffoli}|1\rangle|1\rangle|c\rangle = |1\rangle|1\rangle|\bar{c}\rangle$
- **COPY/FANOUT**: $\text{CNOT}|a\rangle|0\rangle = |a\rangle|a\rangle$

Since AND and NOT are universal for classical computation, the Toffoli gate can implement any classical function reversibly.

### Properties

- Self-inverse: $\text{Toffoli}^2 = I$
- Controls are never modified
- Preserves computational basis states (permutation matrix)

---

## The Fredkin Gate (CSWAP)

The **Fredkin gate** (also called CSWAP) is a controlled-SWAP: it swaps the second and third qubits only if the first qubit (control) is $|1\rangle$:

$$
\text{Fredkin}|c\rangle|a\rangle|b\rangle = \begin{cases} |c\rangle|a\rangle|b\rangle & \text{if } c = 0 \\ |c\rangle|b\rangle|a\rangle & \text{if } c = 1 \end{cases}
$$

### Truth Table

| $c$ (ctrl) | $a$ (in) | $b$ (in) | $c$ (out) | $a$ (out) | $b$ (out) |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 |
| 1 | 0 | 1 | 1 | **1** | **0** |
| 1 | 1 | 0 | 1 | **0** | **1** |
| 1 | 1 | 1 | 1 | 1 | 1 |

### Properties

- Self-inverse: $\text{Fredkin}^2 = I$
- Conserves the number of 1s (Hamming weight is preserved)
- Also universal for classical reversible computation

### Applications

- **Comparison**: If control=$|1\rangle$ and one target is $|0\rangle$, the Fredkin gate effectively routes information based on data values
- **Quantum routing**: conditionally directing quantum information

---

## Decomposition and Gate Costs

### Toffoli Decomposition

The Toffoli gate can be decomposed into single-qubit gates and CNOTs. A standard decomposition uses **6 CNOT gates** and several T/T† gates:

$$
\text{Toffoli} = \text{(sequence of H, T, T}^\dagger\text{, CNOT gates)}
$$

This is important because real quantum hardware typically only implements single-qubit gates and CNOT natively.

### SWAP Decomposition

As shown earlier: 3 CNOT gates.

### Fredkin Decomposition

The Fredkin gate can be built from **2 CNOT gates and 1 Toffoli gate**, or approximately 8 CNOT gates when fully decomposed.

---

## Universal Gate Sets Including Toffoli

The set $\{H, \text{Toffoli}\}$ is **universal for quantum computation**:
- Toffoli handles all classical reversible logic
- Hadamard provides superposition and quantum interference

However, in practice, $\{H, T, \text{CNOT}\}$ is preferred because CNOT is a 2-qubit gate (cheaper on hardware than the 3-qubit Toffoli).

---

## Qiskit Code Examples

### SWAP Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Swap |10⟩ → |01⟩
qc = QuantumCircuit(2)
qc.x(0)           # q0 = |1⟩, q1 = |0⟩ → state is |10⟩
qc.swap(0, 1)     # SWAP

state = Statevector.from_instruction(qc)
print("After SWAP |10⟩:", state)
# Output: |01⟩
print(qc.draw())
```

### SWAP from Three CNOTs

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator
import numpy as np

# Build SWAP from CNOTs
qc_cnots = QuantumCircuit(2)
qc_cnots.cx(0, 1)
qc_cnots.cx(1, 0)
qc_cnots.cx(0, 1)

# Compare with built-in SWAP
qc_swap = QuantumCircuit(2)
qc_swap.swap(0, 1)

op_cnots = Operator(qc_cnots)
op_swap = Operator(qc_swap)

print("3 CNOTs == SWAP:", op_cnots.equiv(op_swap))
# Output: True
```

### Toffoli Gate

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Toffoli: flip target only if both controls are |1⟩
qc = QuantumCircuit(3)
qc.x(0)       # ctrl1 = |1⟩
qc.x(1)       # ctrl2 = |1⟩
# target starts as |0⟩
qc.ccx(0, 1, 2)  # Toffoli

state = Statevector.from_instruction(qc)
print("Toffoli |110⟩:", state)
# Output: |111⟩ — target was flipped!
print(qc.draw())
```

### Toffoli as AND Gate

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Compute AND of two bits using Toffoli
# Result stored in third qubit (ancilla)
def quantum_and(a, b):
    qc = QuantumCircuit(3, 1)
    if a:
        qc.x(0)
    if b:
        qc.x(1)
    # Target qubit 2 starts as |0⟩
    qc.ccx(0, 1, 2)  # qubit2 = a AND b
    qc.measure(2, 0)
    
    simulator = AerSimulator()
    result = simulator.run(qc, shots=1).result()
    return int(list(result.get_counts().keys())[0])

# Test all inputs
for a in [0, 1]:
    for b in [0, 1]:
        print(f"AND({a}, {b}) = {quantum_and(a, b)}")
# Output: 0, 0, 0, 1 — correct AND!
```

### Fredkin Gate (CSWAP)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Fredkin: swap q1 and q2 only if q0 = |1⟩
qc = QuantumCircuit(3)
qc.x(0)       # control = |1⟩
qc.x(1)       # q1 = |1⟩, q2 = |0⟩
qc.cswap(0, 1, 2)  # Controlled-SWAP

state = Statevector.from_instruction(qc)
print("Fredkin |1,1,0⟩:", state)
# Output: |1,0,1⟩ — qubits 1 and 2 were swapped!
print(qc.draw())
```

### Comparing All Multi-Qubit Gates

```python
from qiskit import QuantumCircuit

# Circuit showcasing all three gates
qc = QuantumCircuit(6)

# SWAP on qubits 0,1
qc.swap(0, 1)

# Toffoli on qubits 2,3,4
qc.ccx(2, 3, 4)

# Fredkin on qubits 3,4,5
qc.cswap(3, 4, 5)

print(qc.draw())
```

### Toffoli Decomposition into Basic Gates

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator
import numpy as np

# Decompose Toffoli into H, T, T†, CNOT
qc = QuantumCircuit(3)
qc.h(2)
qc.cx(1, 2)
qc.tdg(2)
qc.cx(0, 2)
qc.t(2)
qc.cx(1, 2)
qc.tdg(2)
qc.cx(0, 2)
qc.t(1)
qc.t(2)
qc.h(2)
qc.cx(0, 1)
qc.t(0)
qc.tdg(1)
qc.cx(0, 1)

# Verify it equals Toffoli
qc_toffoli = QuantumCircuit(3)
qc_toffoli.ccx(0, 1, 2)

op_decomp = Operator(qc)
op_toffoli = Operator(qc_toffoli)
print("Decomposition == Toffoli:", op_decomp.equiv(op_toffoli))
```

---

## Summary Table

| Gate | Qubits | Function | CNOT Cost | Self-Inverse |
|------|--------|----------|-----------|:---:|
| SWAP | 2 | Exchange two qubits | 3 | ✓ |
| Toffoli (CCNOT) | 3 | Flip target if both controls = 1 | 6 | ✓ |
| Fredkin (CSWAP) | 3 | Swap two qubits if control = 1 | ~8 | ✓ |

---

## Key Takeaways

- The **SWAP** gate exchanges two qubit states and decomposes into 3 CNOTs
- The **Toffoli** (CCNOT) gate is a doubly-controlled NOT — universal for classical reversible computation
- The **Fredkin** (CSWAP) gate is a controlled-SWAP — also classically universal and conserves Hamming weight
- All three are self-inverse and operate as permutations on computational basis states
- The Toffoli gate decomposes into ~6 CNOTs and single-qubit gates on real hardware
- $\{H, \text{Toffoli}\}$ forms a universal gate set for quantum computation

---

## Try It Yourself

1. Implement SWAP using 3 CNOTs and verify it matches `qc.swap()` using the Operator class
2. Build an OR gate using Toffoli gates (hint: use De Morgan's law — OR = NOT(AND(NOT a, NOT b)))
3. Create a circuit that uses a Fredkin gate to compare two single-qubit states
4. Implement a full adder circuit using Toffoli and CNOT gates

---

## Next Lesson

In the next lesson, [Universal Gate Sets](25-qc-universal-gate-sets), we'll explore what it means for a set of gates to be "universal" and why certain gate combinations can approximate any quantum computation to arbitrary precision.
