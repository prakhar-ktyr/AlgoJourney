---
title: "Building Circuits in Qiskit"
---

# Building Circuits in Qiskit

The `QuantumCircuit` class is the fundamental building block in Qiskit. This lesson covers everything from basic gate application to parameterized circuits, custom gates, circuit composition, and visualization — giving you full mastery over circuit construction.

## The QuantumCircuit Class

A quantum circuit consists of quantum registers (qubits), classical registers (bits), and operations (gates/measurements):

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Simple construction
qc = QuantumCircuit(3, 3)  # 3 qubits, 3 classical bits

# Named registers for clarity
qr = QuantumRegister(2, name='data')
ar = QuantumRegister(1, name='ancilla')
cr = ClassicalRegister(2, name='output')
qc = QuantumCircuit(qr, ar, cr)

# Access properties
print(f"Qubits: {qc.num_qubits}")       # 3
print(f"Classical bits: {qc.num_clbits}") # 2
print(f"Depth: {qc.depth()}")             # 0 (empty circuit)
print(f"Size: {qc.size()}")               # 0 (no gates)
```

## Single-Qubit Gates

Qiskit provides all standard single-qubit gates:

```python
qc = QuantumCircuit(1)

# Pauli gates
qc.x(0)   # X (NOT) gate: |0⟩ ↔ |1⟩
qc.y(0)   # Y gate
qc.z(0)   # Z gate: phase flip |1⟩ → -|1⟩

# Hadamard
qc.h(0)   # H gate: |0⟩ → |+⟩, |1⟩ → |−⟩

# Phase gates
qc.s(0)   # S gate (√Z): phase of π/2
qc.sdg(0) # S† (inverse S)
qc.t(0)   # T gate (√S): phase of π/4
qc.tdg(0) # T† (inverse T)

# Identity
qc.id(0)  # I gate (useful for timing/barriers)
```

The matrix representations:

$$
X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad
H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \quad
S = \begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}, \quad
T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}
$$

## Rotation Gates

Parameterized single-qubit rotations around the Bloch sphere axes:

```python
import numpy as np

qc = QuantumCircuit(1)

# Rotations around axes
qc.rx(np.pi / 4, 0)   # R_x(θ): rotation around X-axis
qc.ry(np.pi / 3, 0)   # R_y(θ): rotation around Y-axis
qc.rz(np.pi / 6, 0)   # R_z(θ): rotation around Z-axis

# General phase gate
qc.p(np.pi / 8, 0)    # P(λ) = diag(1, e^{iλ})

# Universal single-qubit gate U(θ, φ, λ)
qc.u(np.pi/2, 0, np.pi, 0)  # Equivalent to H
```

The rotation matrices:

$$
R_x(\theta) = \begin{pmatrix} \cos\frac{\theta}{2} & -i\sin\frac{\theta}{2} \\ -i\sin\frac{\theta}{2} & \cos\frac{\theta}{2} \end{pmatrix}
$$

$$
R_y(\theta) = \begin{pmatrix} \cos\frac{\theta}{2} & -\sin\frac{\theta}{2} \\ \sin\frac{\theta}{2} & \cos\frac{\theta}{2} \end{pmatrix}
$$

$$
R_z(\theta) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}
$$

The universal gate:

$$
U(\theta, \phi, \lambda) = \begin{pmatrix} \cos\frac{\theta}{2} & -e^{i\lambda}\sin\frac{\theta}{2} \\ e^{i\phi}\sin\frac{\theta}{2} & e^{i(\phi+\lambda)}\cos\frac{\theta}{2} \end{pmatrix}
$$

## Multi-Qubit Gates

### Two-Qubit Gates

```python
qc = QuantumCircuit(3)

# CNOT (CX): controlled-NOT
qc.cx(0, 1)       # control=0, target=1

# CZ: controlled-Z
qc.cz(0, 1)

# SWAP
qc.swap(0, 1)

# Controlled rotations
qc.crx(np.pi/4, 0, 1)   # Controlled R_x
qc.cry(np.pi/3, 0, 1)   # Controlled R_y
qc.crz(np.pi/6, 0, 1)   # Controlled R_z
qc.cp(np.pi/4, 0, 1)    # Controlled phase

# Two-qubit unitaries
qc.rxx(np.pi/4, 0, 1)   # R_xx(θ) = exp(-iθXX/2)
qc.ryy(np.pi/4, 0, 1)   # R_yy(θ)
qc.rzz(np.pi/4, 0, 1)   # R_zz(θ)

# ECR gate (native on IBM hardware)
qc.ecr(0, 1)
```

### Multi-Controlled Gates

```python
qc = QuantumCircuit(4)

# Toffoli (CCX): double-controlled NOT
qc.ccx(0, 1, 2)    # controls=[0,1], target=2

# CCZ: double-controlled Z
qc.ccz(0, 1, 2)

# Multi-controlled X (MCX)
qc.mcx([0, 1, 2], 3)   # controls=[0,1,2], target=3

# General multi-controlled gate
from qiskit.circuit.library import MCXGate
mcx_gate = MCXGate(num_ctrl_qubits=4)
qc_large = QuantumCircuit(5)
qc_large.append(mcx_gate, range(5))
```

## Parameterized Circuits

Parameters allow creating circuit templates for variational algorithms:

```python
from qiskit.circuit import Parameter, ParameterVector

# Single parameter
theta = Parameter('θ')
qc = QuantumCircuit(1)
qc.ry(theta, 0)

# Bind parameter to a value
bound_qc = qc.assign_parameters({theta: np.pi/3})

# Parameter vectors for multiple parameters
params = ParameterVector('p', length=4)
qc = QuantumCircuit(2)
qc.ry(params[0], 0)
qc.ry(params[1], 1)
qc.cx(0, 1)
qc.ry(params[2], 0)
qc.ry(params[3], 1)

# Bind all at once
values = [0.1, 0.2, 0.3, 0.4]
bound_qc = qc.assign_parameters(dict(zip(params, values)))

# Check unbound parameters
print(qc.parameters)  # {p[0], p[1], p[2], p[3]}
```

Parameterized circuits are essential for variational quantum eigensolver (VQE) and quantum machine learning:

$$
|\psi(\vec{\theta})\rangle = U(\vec{\theta})|0\rangle^{\otimes n}
$$

## Circuit Composition

### Appending and Composing

```python
# Create sub-circuits
bell = QuantumCircuit(2, name='Bell')
bell.h(0)
bell.cx(0, 1)

# Method 1: append (adds as a single block)
main = QuantumCircuit(4)
main.append(bell, [0, 1])  # Apply bell to qubits 0,1
main.append(bell, [2, 3])  # Apply bell to qubits 2,3

# Method 2: compose (inlines the gates)
qc1 = QuantumCircuit(2)
qc1.h(0)

qc2 = QuantumCircuit(2)
qc2.cx(0, 1)

combined = qc1.compose(qc2)  # qc1 followed by qc2

# Compose on specific qubits
big = QuantumCircuit(4)
big = big.compose(bell, qubits=[1, 3])
```

### Converting to a Gate

```python
# Turn a circuit into a reusable gate
bell_gate = bell.to_gate()
bell_gate.label = "Bell"

# Use as controlled gate
controlled_bell = bell_gate.control(1)

qc = QuantumCircuit(3)
qc.append(controlled_bell, [0, 1, 2])  # qubit 0 controls the Bell pair

# Inverse of a gate
inv_bell = bell_gate.inverse()
qc.append(inv_bell, [1, 2])
```

## Custom Unitary Gates

Apply any unitary matrix as a gate:

```python
from qiskit.quantum_info import Operator
from qiskit.extensions import UnitaryGate

# Define a custom 2x2 unitary
sqrt_x = np.array([
    [0.5 + 0.5j, 0.5 - 0.5j],
    [0.5 - 0.5j, 0.5 + 0.5j]
])

# Verify unitarity: U†U = I
assert np.allclose(sqrt_x.conj().T @ sqrt_x, np.eye(2))

# Apply as gate
qc = QuantumCircuit(1)
qc.unitary(sqrt_x, 0, label='√X')

# Two-qubit custom gate
iswap = np.array([
    [1, 0, 0, 0],
    [0, 0, 1j, 0],
    [0, 1j, 0, 0],
    [0, 0, 0, 1]
])
qc2 = QuantumCircuit(2)
qc2.unitary(iswap, [0, 1], label='iSWAP')
```

## Barriers and Delays

```python
qc = QuantumCircuit(3)
qc.h(range(3))

# Barrier prevents optimization across it
qc.barrier()

qc.cx(0, 1)
qc.cx(1, 2)

# Barrier on specific qubits
qc.barrier([0, 1])

# Delay (for timing on hardware)
qc.delay(100, 0, unit='ns')  # 100 nanosecond delay on qubit 0
```

## Measurements and Classical Operations

```python
qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)

# Measure all qubits
qc.measure([0, 1, 2], [0, 1, 2])

# Measure individual
qc2 = QuantumCircuit(2, 2)
qc2.h(0)
qc2.measure(0, 0)

# Conditional operations (classical feedback)
qc2.x(1).c_if(0, 1)  # Apply X to qubit 1 if classical bit 0 == 1

# Reset qubit to |0⟩
qc3 = QuantumCircuit(1)
qc3.h(0)
qc3.reset(0)  # Forces qubit back to |0⟩
```

## Circuit Properties and Analysis

```python
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.t(0)
qc.s(1)
qc.measure_all()

# Key metrics
print(f"Width (qubits): {qc.num_qubits}")
print(f"Depth: {qc.depth()}")
print(f"Size (total ops): {qc.size()}")
print(f"Gate counts: {qc.count_ops()}")
# {'h': 1, 'cx': 2, 't': 1, 's': 1, 'measure': 3, 'barrier': 1}

# Decompose composite gates
decomposed = qc.decompose()

# Get the unitary matrix (for small circuits)
from qiskit.quantum_info import Operator
qc_no_meas = QuantumCircuit(3)
qc_no_meas.h(0)
qc_no_meas.cx(0, 1)
qc_no_meas.cx(1, 2)
op = Operator(qc_no_meas)
print(f"Unitary shape: {op.data.shape}")  # (8, 8)
```

## Circuit Drawing and Visualization

```python
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.ccx(0, 1, 2)

# Text output (terminal-friendly)
print(qc.draw('text'))

# Matplotlib figure
fig = qc.draw('mpl')
fig.savefig('circuit.png', dpi=150, bbox_inches='tight')

# LaTeX source
latex_str = qc.draw('latex_source')

# Reverse bit order (match textbook convention)
qc.draw('mpl', reverse_bits=True)

# Fold long circuits
qc.draw('mpl', fold=20)  # Fold after 20 columns

# Style customization
style = {
    'backgroundcolor': '#FFFFFF',
    'linecolor': '#000000',
    'textcolor': '#000000',
    'gatefacecolor': '#BB8BFF',
}
qc.draw('mpl', style=style)
```

## Using the Circuit Library

Qiskit provides pre-built circuits for common patterns:

```python
from qiskit.circuit.library import (
    QFT, GroverOperator,
    EfficientSU2, RealAmplitudes, TwoLocal,
    ZZFeatureMap, ZFeatureMap,
    MCXGate, RGQFTMultiplier
)

# Quantum Fourier Transform
qft = QFT(num_qubits=4)
print(f"QFT depth: {qft.decompose().depth()}")

# Variational ansatz for VQE
ansatz = EfficientSU2(num_qubits=4, reps=2, entanglement='circular')
print(f"Parameters: {ansatz.num_parameters}")  # 24

# Feature map for QML
feature_map = ZZFeatureMap(feature_dimension=3, reps=2)
print(f"Feature map params: {feature_map.num_parameters}")
```

## Key Takeaways

- `QuantumCircuit` is the central class — it holds qubits, classical bits, and operations
- Qiskit supports all standard gates: Pauli ($X, Y, Z$), Hadamard ($H$), phase ($S, T, P$), rotations ($R_x, R_y, R_z$), and the universal $U(\theta, \phi, \lambda)$
- Multi-qubit gates include `cx`, `cz`, `swap`, `ccx`, and arbitrary `mcx`
- **Parameterized circuits** with `Parameter` and `ParameterVector` enable variational algorithms
- Circuits can be composed via `append`, `compose`, or converted to gates with `to_gate()`
- Use `depth()`, `size()`, `count_ops()` to analyze circuit complexity
- The circuit library (`qiskit.circuit.library`) provides optimized implementations of common sub-circuits

## Try It Yourself

1. Build a 3-qubit QFT circuit manually (without using `qiskit.circuit.library.QFT`) using only $H$, controlled-$R_k$ gates, and SWAP gates.
2. Create a parameterized circuit with 4 parameters that prepares an arbitrary 2-qubit state. Bind parameters to produce $|\Phi^+\rangle$.
3. Implement a custom gate for the $\sqrt{\text{SWAP}}$ operation and verify its matrix squares to SWAP.
4. Build a circuit, convert it to a controlled gate, and compose it into a larger circuit. Draw both the composed and decomposed versions.
5. Create an `EfficientSU2` ansatz with 3 qubits and `linear` entanglement. Count the depth and parameters, then bind random values and simulate.

---

**Next Lesson:** [Running on Simulators](40-qc-running-simulators.md)
