---
title: "Introduction to Qiskit"
---

# Introduction to Qiskit

Qiskit is IBM's open-source software development kit (SDK) for quantum computing. It provides tools for creating quantum circuits, simulating them, and running them on real quantum hardware via the IBM Quantum Platform. As of Qiskit 1.x, the framework has been streamlined into a modular architecture focused on performance and usability.

## What is Qiskit?

Qiskit (pronounced "kiss-kit") stands for **Quantum Information Science Kit**. It enables:

- Designing quantum circuits with an intuitive Python API
- Simulating quantum computations classically
- Executing circuits on real IBM quantum processors
- Applying transpilation and optimization for hardware constraints
- Building hybrid quantum-classical algorithms

## Installation

Install Qiskit using pip:

```python
# Install the core Qiskit package
pip install qiskit

# Install the IBM Quantum runtime for hardware access
pip install qiskit-ibm-runtime

# Install Aer for advanced simulation (noise models, GPU)
pip install qiskit-aer

# Verify installation
import qiskit
print(qiskit.__version__)  # Should print 1.x.x
```

For a complete development environment:

```python
pip install 'qiskit[visualization]'  # Includes matplotlib plotting
pip install qiskit-ibm-runtime qiskit-aer
```

## Qiskit Architecture (1.x)

The modern Qiskit stack consists of:

| Package | Purpose |
|---------|---------|
| `qiskit` | Core: circuits, transpiler, primitives, quantum info |
| `qiskit-ibm-runtime` | Access IBM Quantum hardware and cloud simulators |
| `qiskit-aer` | High-performance local simulators with noise |
| `qiskit.visualization` | Circuit drawing, histogram plots, state visualization |

### Core Modules

```python
from qiskit import QuantumCircuit          # Circuit construction
from qiskit.quantum_info import Statevector # State manipulation
from qiskit.primitives import StatevectorSampler, StatevectorEstimator
from qiskit.transpiler import preset_passmanagers  # Optimization
from qiskit.circuit.library import QFT, GroverOperator  # Pre-built circuits
```

## Your First Quantum Circuit

Let's create a Bell state $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler
from qiskit.visualization import plot_histogram

# Create a 2-qubit circuit with 2 classical bits
qc = QuantumCircuit(2, 2)

# Apply Hadamard to qubit 0: |0⟩ → (|0⟩ + |1⟩)/√2
qc.h(0)

# Apply CNOT: entangle qubits
qc.cx(0, 1)

# Add measurements
qc.measure([0, 1], [0, 1])

# Draw the circuit
print(qc.draw('text'))
#      ┌───┐     ┌─┐
# q_0: ┤ H ├──■──┤M├───
#      └───┘┌─┴─┐└╥┘┌─┐
# q_1: ────┤ X ├─╫─┤M├
#           └───┘ ║ └╥┘
# c: 2/══════════╩══╩═
#                0  1
```

## Statevector Simulation

Inspect the quantum state without measurement (useful for debugging):

```python
from qiskit.quantum_info import Statevector

# Create circuit WITHOUT measurement
qc_no_meas = QuantumCircuit(2)
qc_no_meas.h(0)
qc_no_meas.cx(0, 1)

# Get the statevector
sv = Statevector.from_instruction(qc_no_meas)
print(sv)
# Statevector([0.707+0.j, 0.+0.j, 0.+0.j, 0.707+0.j])

# Probabilities
probs = sv.probabilities_dict()
print(probs)  # {'00': 0.5, '11': 0.5}

# Visualize on Bloch sphere or as LaTeX
sv.draw('latex')  # Renders as LaTeX in Jupyter
sv.draw('hinton')  # Hinton diagram
```

The statevector confirms our Bell state:

$$
|\Phi^+\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle
$$

## Running with the Sampler Primitive

The **Sampler** primitive samples measurement outcomes:

```python
from qiskit.primitives import StatevectorSampler

# Create sampler instance
sampler = StatevectorSampler()

# Run circuit with 1024 shots
job = sampler.run([qc], shots=1024)
result = job.result()

# Get counts from the measurement data
counts = result[0].data.c.get_counts()
print(counts)  # e.g., {'00': 512, '11': 512}

# Plot histogram
plot_histogram(counts)
```

## The Estimator Primitive

The **Estimator** computes expectation values of observables:

```python
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

# Create observable: Z⊗Z
observable = SparsePauliOp('ZZ')

# Circuit without measurement (estimator handles this)
qc_est = QuantumCircuit(2)
qc_est.h(0)
qc_est.cx(0, 1)

# Estimate ⟨ZZ⟩
estimator = StatevectorEstimator()
job = estimator.run([(qc_est, observable)])
result = job.result()

expectation = result[0].data.evs
print(f"⟨ZZ⟩ = {expectation}")  # Should be 1.0 for Bell state
```

For the Bell state $|\Phi^+\rangle$, the expectation value $\langle ZZ \rangle = 1$ because both qubits are always in the same state.

## IBM Quantum Platform

To run on real hardware:

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

# Save account (one-time setup)
QiskitRuntimeService.save_account(
    channel='ibm_quantum',
    token='YOUR_API_TOKEN',
    overwrite=True
)

# Connect to service
service = QiskitRuntimeService()

# Choose a backend
backend = service.least_busy(
    simulator=False, 
    operational=True,
    min_num_qubits=2
)
print(f"Using backend: {backend.name}")

# Run on hardware
sampler = SamplerV2(backend)
job = sampler.run([qc], shots=4096)
result = job.result()
counts = result[0].data.c.get_counts()
print(counts)  # Will show noise effects: {'00': ~2000, '11': ~1900, '01': ~100, '10': ~96}
```

## Circuit Transpilation

Real quantum hardware has limited connectivity and gate sets. **Transpilation** maps your abstract circuit to hardware-compatible operations:

```python
from qiskit.transpiler import preset_passmanagers
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
backend = service.backend('ibm_brisbane')

# Transpile for the target backend
pm = preset_passmanagers.generate_preset_pass_manager(
    optimization_level=2,
    backend=backend
)
transpiled_qc = pm.run(qc)

print(f"Original depth: {qc.depth()}")
print(f"Transpiled depth: {transpiled_qc.depth()}")
print(f"Transpiled gates: {transpiled_qc.count_ops()}")
```

Optimization levels:
- **0**: No optimization, just mapping
- **1**: Light optimization (default)
- **2**: Medium optimization (recommended)
- **3**: Heavy optimization (longer compile time)

## Key Modules Reference

```python
# Circuit construction
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Quantum information
from qiskit.quantum_info import (
    Statevector, DensityMatrix, Operator,
    SparsePauliOp, random_unitary, state_fidelity
)

# Pre-built circuit library
from qiskit.circuit.library import (
    QFT, GroverOperator, EfficientSU2,
    RealAmplitudes, TwoLocal, ZZFeatureMap
)

# Visualization
from qiskit.visualization import (
    plot_histogram, plot_bloch_multivector,
    plot_state_city, circuit_drawer
)

# Transpiler
from qiskit.transpiler import preset_passmanagers, CouplingMap
```

## Key Takeaways

- Qiskit is IBM's open-source quantum SDK, structured around **circuits**, **primitives** (Sampler/Estimator), and **transpilation**
- Install with `pip install qiskit qiskit-ibm-runtime qiskit-aer`
- Use `QuantumCircuit` to build circuits, `Statevector` for state inspection, and primitives for execution
- The **Sampler** returns measurement counts; the **Estimator** returns expectation values of observables
- **Transpilation** maps abstract circuits to hardware-compatible gate sets and qubit connectivity
- IBM Quantum Platform provides free access to real quantum processors via API tokens

## Try It Yourself

1. Create and simulate a 3-qubit GHZ state: $\frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$. Verify with both `Statevector` and the `Sampler`.
2. Use the `Estimator` to compute $\langle X \otimes X \rangle$ for the Bell state. What value do you expect?
3. Build a circuit that prepares $|\psi\rangle = \frac{1}{2}|0\rangle + \frac{\sqrt{3}}{2}|1\rangle$ using a $R_y$ rotation. Verify amplitudes with `Statevector`.
4. Explore `qiskit.circuit.library` — draw the 3-qubit QFT circuit and count its gates.
5. If you have an IBM Quantum account, transpile your Bell circuit for a real backend and compare the gate count before and after.

---

**Next Lesson:** [Building Circuits in Qiskit](39-qc-building-circuits-qiskit.md)
