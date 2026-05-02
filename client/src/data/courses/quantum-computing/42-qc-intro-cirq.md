---
title: "Introduction to Cirq"
---

Cirq is Google's open-source framework for designing, simulating, and running quantum circuits. While Qiskit focuses on a broad ecosystem with hardware abstraction, Cirq is designed for **fine-grained control** over quantum hardware — particularly Google's superconducting processors. This lesson covers Cirq's core concepts, building and simulating circuits, and how it compares to Qiskit.

## What Is Cirq?

Cirq is a Python library developed by Google AI Quantum. Its design philosophy centers on:

- **Hardware-aware circuit construction**: explicitly placing qubits on device topologies
- **Moment-based scheduling**: operations are grouped into time slices (Moments)
- **Noise modeling**: first-class support for realistic noise simulation
- **Integration with Google's quantum hardware** via Google Cloud

### Installation

```python
pip install cirq
```

Verify:

```python
import cirq
print(cirq.__version__)
```

## Core Concepts

### Qubits

Cirq offers several qubit types for different use cases:

```python
import cirq

# Grid qubits — model physical layout (row, col)
q00 = cirq.GridQubit(0, 0)
q01 = cirq.GridQubit(0, 1)
q10 = cirq.GridQubit(1, 0)

# Line qubits — simple linear indexing
q0 = cirq.LineQubit(0)
q1 = cirq.LineQubit(1)
qubits = cirq.LineQubit.range(5)  # [q(0), q(1), ..., q(4)]

# Named qubits — arbitrary labels
alice = cirq.NamedQubit("alice")
bob = cirq.NamedQubit("bob")
```

**GridQubit** is essential when targeting Google's Sycamore processor, where physical connectivity determines which two-qubit gates are allowed.

### Gates and Operations

A **Gate** is an abstract transformation; an **Operation** is a gate applied to specific qubits:

```python
# Gates
h_gate = cirq.H         # Hadamard
x_gate = cirq.X         # Pauli X
cnot_gate = cirq.CNOT   # Controlled-NOT

# Operations = Gate + Qubit(s)
op1 = cirq.H(q0)          # H on qubit 0
op2 = cirq.CNOT(q0, q1)   # CNOT with q0 as control
op3 = cirq.measure(q0, q1, key="result")  # Measurement
```

Common gates include:

| Gate | Cirq | Matrix |
|------|------|--------|
| Pauli-X | `cirq.X` | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ |
| Pauli-Z | `cirq.Z` | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ |
| Hadamard | `cirq.H` | $\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ |
| $R_z(\theta)$ | `cirq.rz(θ)` | $\begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$ |
| CNOT | `cirq.CNOT` | Controlled-X |
| SWAP | `cirq.SWAP` | Swaps two qubits |
| iSWAP | `cirq.ISWAP` | Google-native gate |

### Moments and Circuits

A **Moment** is a collection of operations that execute simultaneously (like a time slice). A **Circuit** is a sequence of Moments:

```python
q0, q1 = cirq.LineQubit.range(2)

circuit = cirq.Circuit([
    cirq.Moment([cirq.H(q0)]),              # Moment 0
    cirq.Moment([cirq.CNOT(q0, q1)]),       # Moment 1
    cirq.Moment([cirq.measure(q0, q1, key="result")]),  # Moment 2
])

print(circuit)
```

Output:
```
0: ───H───@───M('result')───
          │   │
1: ───────X───M──────────────
```

Cirq automatically packs operations into the **earliest possible Moment** when using `circuit.append()`:

```python
circuit = cirq.Circuit()
circuit.append([cirq.H(q0), cirq.H(q1)])   # Same Moment (parallel)
circuit.append(cirq.CNOT(q0, q1))           # Next Moment (depends on both)
```

This moment-based model gives you explicit control over circuit depth, which is critical for noisy hardware where fewer time steps mean fewer errors.

## Building Circuits

### Method 1: Append Operations

```python
q0, q1, q2 = cirq.LineQubit.range(3)
circuit = cirq.Circuit()

# Create GHZ state: |000⟩ + |111⟩) / √2
circuit.append(cirq.H(q0))
circuit.append(cirq.CNOT(q0, q1))
circuit.append(cirq.CNOT(q1, q2))
circuit.append(cirq.measure(q0, q1, q2, key="ghz"))

print(circuit)
```

### Method 2: Generator Pattern

```python
def ghz_circuit(n):
    qubits = cirq.LineQubit.range(n)
    yield cirq.H(qubits[0])
    for i in range(n - 1):
        yield cirq.CNOT(qubits[i], qubits[i + 1])
    yield cirq.measure(*qubits, key="result")

circuit = cirq.Circuit(ghz_circuit(4))
print(circuit)
```

### Method 3: Using Moments Explicitly

```python
circuit = cirq.Circuit([
    cirq.Moment(cirq.H.on_each(*cirq.LineQubit.range(4))),
    cirq.Moment(cirq.CNOT(cirq.LineQubit(0), cirq.LineQubit(1)),
                cirq.CNOT(cirq.LineQubit(2), cirq.LineQubit(3))),
])
```

## Simulation with cirq.Simulator

### Statevector Simulation

```python
q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit([
    cirq.H(q0),
    cirq.CNOT(q0, q1),
])

simulator = cirq.Simulator()
result = simulator.simulate(circuit)
print(result.final_state_vector)
# [0.707+0.j  0.   +0.j  0.   +0.j  0.707+0.j]
```

The state vector confirms $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$.

### Shot-Based Simulation

```python
circuit_with_meas = cirq.Circuit([
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="bell"),
])

result = simulator.run(circuit_with_meas, repetitions=1000)
print(result.histogram(key="bell"))
# Counter({0: 498, 3: 502})
# 0 = |00⟩ (binary 00), 3 = |11⟩ (binary 11)
```

### Intermediate State Inspection

```python
circuit = cirq.Circuit([
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.X(q1),
])

for i, step in enumerate(simulator.simulate_moment_steps(circuit)):
    print(f"After Moment {i}: {step.state_vector()}")
```

## Measuring and Analyzing Results

```python
q = cirq.LineQubit.range(3)
circuit = cirq.Circuit([
    cirq.H.on_each(*q),
    cirq.measure(*q, key="output"),
])

result = simulator.run(circuit, repetitions=2000)

# Histogram
hist = result.histogram(key="output")
print(hist)

# Convert to probabilities
total = sum(hist.values())
probs = {format(k, '03b'): v / total for k, v in hist.items()}
print(probs)
```

Each bitstring should appear with probability $\frac{1}{2^3} = 0.125$.

## Code Comparison: Qiskit vs Cirq

Let's build the same Bell state circuit in both frameworks:

### Qiskit

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

result = AerSimulator().run(qc, shots=1000).result()
print(result.get_counts())
```

### Cirq

```python
import cirq

q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit([
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="bell"),
])

result = cirq.Simulator().run(circuit, repetitions=1000)
print(result.histogram(key="bell"))
```

### Key Differences

| Aspect | Qiskit | Cirq |
|--------|--------|------|
| Qubit reference | By index (integer) | By object (GridQubit, LineQubit) |
| Circuit structure | Gate list | Moment-based |
| Measurement | Separate classical register | Key-based results |
| Hardware focus | IBM backends | Google Sycamore |
| Scheduling | Implicit (transpiler) | Explicit (Moments) |
| Noise modeling | Qiskit Aer | Built-in |
| Optimization | Transpiler passes | Cirq optimizers |

## When to Use Cirq vs Qiskit

- **Use Cirq** when targeting Google hardware, when you need fine-grained moment control, or when working on NISQ algorithms that need precise scheduling.
- **Use Qiskit** when targeting IBM hardware, when you want a larger ecosystem (Qiskit Nature, Finance, ML), or when you need broad hardware provider support.
- Both are excellent for **learning and research** — concepts transfer directly between them.

## Key Takeaways

- **Cirq** is Google's quantum framework emphasizing hardware-aware, moment-based circuit design.
- **Qubits are objects** (GridQubit, LineQubit, NamedQubit) rather than integer indices, reflecting physical device layouts.
- **Moments** group simultaneous operations, giving explicit depth control — crucial for minimizing errors on NISQ devices.
- The **Simulator** supports both statevector (`simulate`) and shot-based (`run`) modes.
- Cirq and Qiskit express the same quantum concepts differently; learning both deepens understanding of the underlying physics.

## Try It Yourself

1. Build a 4-qubit GHZ state in Cirq and verify the measurement outcomes.
2. Use `simulate_moment_steps` to trace the state vector through a 3-qubit QFT circuit moment by moment.
3. Implement the same quantum teleportation protocol in both Cirq and Qiskit, comparing the code structure.
4. Create a `GridQubit` layout matching a $2 \times 3$ grid and build a nearest-neighbor CNOT chain.

---

*Next lesson: [Other Frameworks (PennyLane, Q#)](43-qc-other-frameworks.md)*
