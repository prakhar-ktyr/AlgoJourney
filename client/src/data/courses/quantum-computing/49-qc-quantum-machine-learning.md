---
title: "Quantum Machine Learning"
---

**Quantum Machine Learning (QML)** sits at the intersection of quantum computing and machine learning, exploring whether quantum computers can learn from data faster or better than classical ones. While the field is still maturing, several promising approaches have emerged — particularly hybrid quantum-classical algorithms suited for near-term hardware.

## What Is Quantum ML?

QML encompasses several directions:

1. **Quantum algorithms for classical ML tasks** — using quantum speedups for linear algebra, sampling, or optimization to accelerate classical ML pipelines
2. **Classical ML for quantum tasks** — using neural networks to decode error syndromes, optimize quantum circuits, or learn quantum states
3. **Quantum models** — trainable quantum circuits as function approximators, analogous to neural networks

This lesson focuses primarily on quantum models and hybrid approaches that can run on near-term quantum hardware.

## Variational Quantum Circuits (VQC)

The workhorse of near-term QML is the **variational quantum circuit** (also called a **parameterized quantum circuit** or **PQC**):

$$
|\psi(\theta)\rangle = U(\theta)|0\rangle^{\otimes n} = \prod_{l=1}^{L} U_l(\theta_l) |0\rangle^{\otimes n}
$$

where each layer $U_l(\theta_l)$ consists of parameterized single-qubit rotations and entangling gates:

$$
U_l(\theta_l) = \left(\prod_{i} R_y(\theta_{l,i})\right) \cdot \text{CNOT cascade}
$$

The parameters $\theta$ are optimized classically to minimize a cost function — this is the **hybrid quantum-classical optimization loop**.

### The Hybrid Loop

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐
│ Classical    │────▶│ Quantum Circuit │────▶│ Measurement  │
│ Optimizer    │     │ U(θ)|ψ_in⟩     │     │ ⟨O⟩ = f(θ)   │
│ (e.g., Adam) │◀────│                │◀────│              │
└─────────────┘     └────────────────┘     └──────────────┘
      │                                          │
      └──── Update θ to minimize cost ◀──────────┘
```

1. **Encode** classical data $x$ into a quantum state
2. **Apply** parameterized circuit $U(\theta)$
3. **Measure** to extract an expectation value $\langle \hat{O} \rangle$
4. **Compute** cost function $C(\theta) = f(\langle \hat{O} \rangle, y_{\text{true}})$
5. **Update** parameters $\theta$ using a classical optimizer (gradient descent, COBYLA, etc.)

## Data Encoding Strategies

How classical data is embedded into quantum states critically affects model expressivity:

### Angle Encoding

Map each feature $x_i$ to a rotation angle:

$$
|x\rangle = \bigotimes_{i=1}^{n} R_y(x_i)|0\rangle
$$

- Requires $n$ qubits for $n$ features
- Simple and widely used
- Each qubit encodes one feature

### Amplitude Encoding

Encode an $N$-dimensional feature vector into the amplitudes of $\log_2 N$ qubits:

$$
|x\rangle = \frac{1}{\|x\|} \sum_{i=0}^{N-1} x_i |i\rangle
$$

- Exponentially compact: $n = \log_2 N$ qubits for $N$ features
- Preparing this state can be expensive (requires $O(N)$ gates in general)
- Used in quantum linear algebra algorithms (HHL, etc.)

### Data Re-uploading

Interleave data encoding and trainable layers:

$$
U(\theta, x) = \prod_{l=1}^{L} W(\theta_l) S(x)
$$

where $S(x)$ re-encodes the data at each layer. This can create richer feature maps and improve expressivity, similar to how deep classical networks benefit from multiple layers.

## Quantum Kernel Methods

Instead of training a quantum circuit, use the quantum computer to compute a **kernel function**:

$$
k(x_i, x_j) = |\langle \phi(x_i) | \phi(x_j) \rangle|^2
$$

where $|\phi(x)\rangle = U(x)|0\rangle^{\otimes n}$ maps data into quantum Hilbert space. The kernel matrix is then used with a classical SVM or kernel ridge regression.

The quantum kernel evaluates inner products in an exponentially large feature space — a space that may be hard for classical kernels to access. However, whether this leads to practical advantage depends on the data.

```python
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel

# Define quantum feature map
feature_map = ZZFeatureMap(feature_dimension=2, reps=2)

# Compute quantum kernel
kernel = FidelityQuantumKernel(feature_map=feature_map)

# Use with sklearn SVM
from sklearn.svm import SVC
svc = SVC(kernel=kernel.evaluate)
svc.fit(X_train, y_train)
accuracy = svc.score(X_test, y_test)
```

## Quantum Neural Networks

A **quantum neural network (QNN)** is a variational circuit viewed as a differentiable function $f_\theta(x)$. Gradients are computed using the **parameter-shift rule**:

$$
\frac{\partial \langle C \rangle}{\partial \theta_k} = \frac{\langle C(\theta_k + \pi/2) \rangle - \langle C(\theta_k - \pi/2) \rangle}{2}
$$

This requires two circuit evaluations per parameter — making gradient computation $O(p)$ in the number of parameters, comparable to backpropagation in terms of scaling with the number of parameters.

## Example: Variational Classifier

A complete variational classifier using Qiskit:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import AerSimulator
from qiskit_machine_learning.neural_networks import EstimatorQNN
from qiskit_machine_learning.algorithms import VQC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

# Generate dataset
X, y = make_moons(n_samples=200, noise=0.1, random_state=42)
scaler = MinMaxScaler(feature_range=(0, np.pi))
X = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Build variational circuit
n_qubits = 2
n_layers = 3

def create_circuit(n_qubits, n_layers):
    qc = QuantumCircuit(n_qubits)
    input_params = ParameterVector("x", n_qubits)
    weight_params = ParameterVector("w", n_qubits * n_layers * 2)

    # Data encoding
    for i in range(n_qubits):
        qc.ry(input_params[i], i)
    qc.barrier()

    # Variational layers
    idx = 0
    for l in range(n_layers):
        for i in range(n_qubits):
            qc.ry(weight_params[idx], i)
            idx += 1
            qc.rz(weight_params[idx], i)
            idx += 1
        # Entangling gates
        for i in range(n_qubits - 1):
            qc.cx(i, i + 1)
        qc.barrier()

    return qc

circuit = create_circuit(n_qubits, n_layers)
print(circuit.draw())

# Train the variational quantum classifier
vqc = VQC(
    num_qubits=n_qubits,
    ansatz=circuit,
    optimizer_name="COBYLA",
    maxiter=100,
)
# vqc.fit(X_train, y_train)
# score = vqc.score(X_test, y_test)
# print(f"Test accuracy: {score:.2%}")
```

## Barren Plateaus

A major challenge for variational quantum circuits is the **barren plateau** phenomenon:

$$
\text{Var}\!\left[\frac{\partial C}{\partial \theta_k}\right] \leq F(n) \quad \text{where } F(n) \in O(2^{-n})
$$

As the number of qubits $n$ increases, the variance of gradients shrinks **exponentially**, making optimization effectively impossible — the cost landscape becomes flat.

Causes and mitigations:

| Cause | Mitigation |
|-------|-----------|
| Random initialization | Use structured or identity-like initialization |
| Global cost functions | Use local cost functions (measure fewer qubits) |
| Deep circuits | Limit circuit depth, use layerwise training |
| High expressivity | Restrict ansatz to problem-relevant symmetries |
| Hardware noise | Error mitigation, shorter circuits |

## Quantum Advantage for ML

The question of when quantum ML provides an advantage over classical ML remains open:

**Potential advantages:**
- Access to exponentially large feature spaces via quantum kernels
- Efficient exploration of certain hypothesis classes
- Natural handling of quantum data (quantum sensor outputs, many-body states)

**Known limitations:**
- No proven exponential speedup for generic classical datasets
- Data loading bottleneck: encoding $N$ classical data points requires $O(N)$ quantum operations
- Barren plateaus limit scalability of variational approaches
- Classical ML (especially deep learning) is a very strong baseline

**Most promising near-term applications:**
- Learning properties of quantum systems (quantum chemistry, materials)
- Generative modeling (quantum Boltzmann machines)
- Problems with natural quantum structure

## Key Takeaways

- Variational quantum circuits are trainable quantum models optimized via a hybrid quantum-classical loop
- Data encoding (angle, amplitude, re-uploading) critically determines model expressivity
- Quantum kernels map data to exponentially large feature spaces accessible on a quantum computer
- The parameter-shift rule enables gradient computation on quantum hardware
- Barren plateaus — exponentially vanishing gradients — are the central scalability challenge
- Quantum advantage for ML on classical data remains unproven; the most promising applications involve quantum data or quantum-structured problems

## Try It Yourself

1. Implement a 2-qubit variational circuit with angle encoding and train it on the XOR dataset using a classical optimizer
2. Compare quantum kernel SVM vs. classical RBF kernel SVM on the `make_moons` dataset — is there any difference?
3. Investigate the barren plateau: create a random parameterized circuit with $n = 2, 4, 6, 8$ qubits and plot the variance of $\partial C / \partial \theta_1$ as a function of $n$
4. Experiment with data re-uploading: does adding more encoding layers improve classification accuracy?

---

**Next Lesson:** [Quantum Cryptography and QKD](50-qc-quantum-cryptography.md) — using quantum mechanics for provably secure communication.
