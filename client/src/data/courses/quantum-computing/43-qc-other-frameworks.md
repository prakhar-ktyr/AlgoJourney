---
title: "Other Frameworks (PennyLane, Q#)"
---

Qiskit and Cirq are not the only players in quantum computing. This lesson surveys three other major frameworks — **PennyLane**, **Q#**, and **Amazon Braket** — each with a distinct philosophy and target audience. Understanding the landscape helps you choose the right tool for your problem and makes you a more versatile quantum developer.

## PennyLane by Xanadu

PennyLane is an open-source framework built specifically for **quantum machine learning** and **hybrid quantum-classical computation**. Its killer feature is **automatic differentiation of quantum circuits**, enabling gradient-based optimization of parameterized quantum gates.

### Installation

```python
pip install pennylane
# Optional: install plugins for different backends
pip install pennylane-qiskit    # Run on IBM hardware
pip install pennylane-cirq      # Run on Google hardware
pip install pennylane-lightning  # High-performance C++ simulator
```

### The Device Concept

PennyLane abstracts hardware through **devices**. A device is any quantum simulator or processor:

```python
import pennylane as qml

# Local simulator
dev = qml.device("default.qubit", wires=2)

# IBM backend (via plugin)
# dev = qml.device("qiskit.ibmq", wires=2, backend="ibm_kyoto")
```

The `wires` parameter specifies the number of qubits. Switching backends requires only changing the device — your circuit code stays the same.

### The QNode Decorator

A **QNode** wraps a quantum function so that it becomes a differentiable computation node:

```python
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def bell_circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=[0, 1])

result = bell_circuit()
print(result)  # [0.5, 0.0, 0.0, 0.5]
```

The return value determines what is computed:
- `qml.probs(wires)` — probability distribution
- `qml.expval(obs)` — expectation value of an observable
- `qml.var(obs)` — variance
- `qml.sample(obs)` — raw measurement samples
- `qml.state()` — full statevector

### Automatic Differentiation of Quantum Circuits

This is PennyLane's superpower. Parameterized quantum circuits can be differentiated with respect to their parameters using the **parameter-shift rule**:

$$
\frac{\partial}{\partial \theta} \langle \psi(\theta) | O | \psi(\theta) \rangle = \frac{f(\theta + s) - f(\theta - s)}{2 \sin(s)}
$$

where $s = \pi/2$ for standard Pauli rotation gates.

```python
@qml.qnode(dev)
def variational_circuit(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    qml.RZ(params[2], wires=1)
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))

params = np.array([0.3, 0.7, 1.2])

# Compute gradient automatically
grad_fn = qml.grad(variational_circuit)
gradients = grad_fn(params)
print(f"Gradients: {gradients}")
```

### Example: Variational Quantum Eigensolver (VQE)

```python
@qml.qnode(dev)
def cost_function(params):
    qml.RY(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    # Hamiltonian: H = 0.5*Z0*Z1 + 0.3*X0 + 0.2*X1
    return (
        0.5 * qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))
        + 0.3 * qml.expval(qml.PauliX(0))
        + 0.2 * qml.expval(qml.PauliX(1))
    )

# Gradient descent optimization
opt = qml.GradientDescentOptimizer(stepsize=0.4)
params = np.array([0.5, 0.5])

for step in range(100):
    params = opt.step(cost_function, params)
    if step % 20 == 0:
        print(f"Step {step}: energy = {cost_function(params):.6f}")
```

PennyLane also integrates with **PyTorch**, **TensorFlow**, and **JAX** for seamless hybrid models.

## Q# by Microsoft

Q# is a **dedicated quantum programming language** — not a Python library but a full language with its own type system, control flow, and quantum-specific constructs.

### Q# Syntax Basics

```qsharp
operation BellState() : (Result, Result) {
    use (q0, q1) = (Qubit(), Qubit());  // Allocate qubits
    
    H(q0);                               // Hadamard
    CNOT(q0, q1);                        // CNOT
    
    let r0 = M(q0);                      // Measure
    let r1 = M(q1);
    
    Reset(q0);                           // Must reset before deallocation
    Reset(q1);
    
    return (r0, r1);
}
```

Key Q# concepts:
- **`operation`**: a quantum subroutine (analogous to a function with side effects)
- **`use`**: allocates qubits (automatically initialized to $|0\rangle$)
- **`M(qubit)`**: measures in the computational basis, returns `Result` type (`Zero` or `One`)
- **`Reset`**: returns qubit to $|0\rangle$ before deallocation

### Operations and Control Flow

Q# supports classical control flow within quantum programs:

```qsharp
operation PrepareState(q : Qubit, target : Result) : Unit {
    if M(q) != target {
        X(q);  // Flip if measurement doesn't match
    }
}

operation GHZState(n : Int) : Result[] {
    use qubits = Qubit[n];
    
    H(qubits[0]);
    for i in 1..n-1 {
        CNOT(qubits[0], qubits[i]);
    }
    
    let results = MeasureEachZ(qubits);
    ResetAll(qubits);
    return results;
}
```

### Integration with Python

Q# can be called from Python using the `qsharp` package:

```python
import qsharp

# Run Q# code from Python
qsharp.eval("H(q0)")

# Or load .qs files and call operations
result = qsharp.eval("BellState()")
print(result)
```

### Azure Quantum

Q# integrates with **Azure Quantum**, Microsoft's cloud quantum service. Azure Quantum provides access to hardware from IonQ, Quantinuum, and others:

```python
# Submit to Azure Quantum
# (requires Azure subscription and workspace setup)
import azure.quantum
from azure.quantum import Workspace

workspace = Workspace(
    resource_id="/subscriptions/.../quantumWorkspace",
    location="eastus",
)
```

## Amazon Braket

Amazon Braket is AWS's managed quantum computing service. Its key advantage is **hardware-agnostic access** to multiple quantum processors.

### Running on Multiple Hardware Backends

```python
from braket.circuits import Circuit
from braket.aws import AwsDevice

# Build a circuit
bell = Circuit().h(0).cnot(0, 1)

# Run on simulator
from braket.devices import LocalSimulator
local_sim = LocalSimulator()
result = local_sim.run(bell, shots=1000).result()
print(result.measurement_counts)

# Run on real hardware (IonQ, Rigetti, IQM)
# ionq = AwsDevice("arn:aws:braket:us-east-1::device/qpu/ionq/Aria-1")
# task = ionq.run(bell, shots=100)
```

Braket supports:
- **IonQ** (trapped ion)
- **Rigetti** (superconducting)
- **IQM** (superconducting)
- **QuEra** (neutral atom)

## Framework Comparison

| Feature | Qiskit | Cirq | PennyLane | Q# | Braket |
|---------|--------|------|-----------|-----|--------|
| **Developer** | IBM | Google | Xanadu | Microsoft | AWS |
| **Language** | Python | Python | Python | Q# (+Python) | Python |
| **Focus** | General quantum | Hardware control | Quantum ML | Quantum algorithms | Multi-hardware |
| **Auto-diff** | No | No | Yes | No | No |
| **Hardware** | IBM | Google | Plugin-based | Azure partners | AWS partners |
| **Noise sim** | Qiskit Aer | Built-in | Mixed-state sim | Limited | Built-in |
| **Circuit model** | Gate list | Moments | QNode/tape | Operations | Gate list |
| **Community** | Largest | Growing | Active | Moderate | Growing |
| **Best for** | Learning, broad use | NISQ research | Variational/ML | .NET ecosystem | Cloud deployment |

### Choosing a Framework

- **Learning quantum computing**: Start with Qiskit (best tutorials) or PennyLane (if ML-oriented).
- **Research (NISQ algorithms)**: Cirq for fine control, PennyLane for variational methods.
- **Production/cloud deployment**: Amazon Braket (multi-hardware), Azure Quantum (Microsoft ecosystem).
- **Quantum ML**: PennyLane is the clear winner — auto-differentiation is essential.

## Hybrid Workflow Example

Many real-world projects combine frameworks. PennyLane can execute circuits on Qiskit or Cirq backends:

```python
import pennylane as qml

# Use Qiskit's Aer simulator through PennyLane
dev = qml.device("qiskit.aer", wires=2, shots=1000)

@qml.qnode(dev)
def hybrid_circuit(theta):
    qml.RY(theta, wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))
```

This lets you prototype with PennyLane's differentiability and deploy on any supported backend.

## Key Takeaways

- **PennyLane** excels at quantum ML with automatic differentiation via the parameter-shift rule.
- **Q#** is a standalone quantum language with strong type safety and Azure Quantum integration.
- **Amazon Braket** provides hardware-agnostic access to multiple quantum processors through AWS.
- **No single framework dominates** — each has strengths for different use cases. Core quantum concepts are universal.
- PennyLane's **plugin architecture** allows using Qiskit or Cirq backends, making it a versatile bridge between ecosystems.

## Try It Yourself

1. Install PennyLane and create a variational circuit with 3 parameters. Compute the gradient of $\langle Z \rangle$ with respect to each parameter.
2. Write a Q# operation that creates a $W$-state: $\frac{1}{\sqrt{3}}(|001\rangle + |010\rangle + |100\rangle)$.
3. Implement VQE for the Hamiltonian $H = -Z_0 Z_1 + 0.5 X_0$ using PennyLane's optimizer. Find the ground state energy.
4. Build the same Bernstein-Vazirani circuit in Qiskit, Cirq, and PennyLane. Compare code length and readability.

---

*Next lesson: [Noise in Quantum Systems](44-qc-quantum-noise.md)*
