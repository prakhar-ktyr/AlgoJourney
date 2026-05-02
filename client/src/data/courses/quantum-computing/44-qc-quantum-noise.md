---
title: "Noise in Quantum Systems"
---

Quantum noise is the single biggest obstacle to building practical quantum computers. Unlike classical bits that are either 0 or 1, qubits exist in fragile superpositions that are extraordinarily sensitive to environmental interactions. This lesson dives deep into the types of noise, their mathematical descriptions, and how to simulate and mitigate them.

## Why Noise Matters

An ideal quantum computer would execute gates perfectly and maintain coherence indefinitely. Real hardware suffers from:

- **Imperfect gates** that introduce small rotational errors
- **Decoherence** that destroys quantum information over time
- **Measurement errors** that misread qubit states
- **Crosstalk** between neighboring qubits

Current quantum processors have error rates of $10^{-3}$ to $10^{-2}$ per gate. Since a useful quantum algorithm may require $10^6$ or more gates, raw error rates must be suppressed by many orders of magnitude — either through hardware improvements or quantum error correction.

## Types of Noise

### Decoherence

Decoherence is the process by which a qubit loses its quantum properties due to uncontrolled interactions with the environment. A qubit in state $\alpha|0\rangle + \beta|1\rangle$ gradually becomes a classical mixture.

The density matrix of a pure state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ is:

$$
\rho = |\psi\rangle\langle\psi| = \begin{pmatrix} |\alpha|^2 & \alpha\beta^* \\ \alpha^*\beta & |\beta|^2 \end{pmatrix}
$$

Decoherence causes the off-diagonal elements to decay toward zero:

$$
\rho(t) = \begin{pmatrix} |\alpha|^2 & \alpha\beta^* \, e^{-t/T_2} \\ \alpha^*\beta \, e^{-t/T_2} & |\beta|^2 \end{pmatrix}
$$

### $T_1$ Relaxation (Amplitude Damping)

$T_1$ measures how long a qubit stays in the excited state $|1\rangle$ before decaying to $|0\rangle$. This is analogous to spontaneous emission in atomic physics.

$$
P(|1\rangle \to |0\rangle) = 1 - e^{-t/T_1}
$$

After time $t$, the damping parameter is $\gamma = 1 - e^{-t/T_1}$. The Kraus operators for amplitude damping are:

$$
K_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1-\gamma} \end{pmatrix}, \quad K_1 = \begin{pmatrix} 0 & \sqrt{\gamma} \\ 0 & 0 \end{pmatrix}
$$

The channel acts as $\rho \mapsto K_0 \rho K_0^\dagger + K_1 \rho K_1^\dagger$.

Typical $T_1$ values:
- **Superconducting qubits**: 50–300 μs
- **Trapped ions**: seconds to minutes
- **Nitrogen-vacancy centers**: milliseconds

### $T_2$ Dephasing

$T_2$ measures how long a qubit maintains phase coherence. Even without energy loss, random phase fluctuations destroy superpositions. Always $T_2 \leq 2T_1$.

Pure dephasing (phase damping) has Kraus operators:

$$
K_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1-\lambda} \end{pmatrix}, \quad K_1 = \begin{pmatrix} 0 & 0 \\ 0 & \sqrt{\lambda} \end{pmatrix}
$$

where $\lambda = 1 - e^{-t/T_\phi}$ and $\frac{1}{T_2} = \frac{1}{2T_1} + \frac{1}{T_\phi}$.

The effect on the Bloch sphere: $T_1$ shrinks the Bloch vector toward the north pole ($|0\rangle$), while $T_2$ shrinks it toward the $z$-axis (losing $x$ and $y$ components).

### Gate Errors

No physical gate implements a unitary exactly. A gate intended to perform $U$ actually performs $U' = U \cdot E$ where $E$ is a small error. Gate fidelity quantifies accuracy:

$$
F = \left| \text{Tr}(U^\dagger U') \right|^2 / d^2
$$

where $d$ is the dimension. For a single qubit ($d = 2$), $F = 1$ means perfect.

Current gate fidelities:
- **Single-qubit gates**: 99.9% ($10^{-3}$ error rate)
- **Two-qubit gates**: 99.0–99.5% ($10^{-2}$ error rate)
- **Measurement**: 99.0–99.5%

### Measurement Errors

The readout process itself is noisy. A qubit in $|0\rangle$ might be read as `1` with probability $p_{0\to1}$, and vice versa:

$$
\begin{pmatrix} p(\text{read } 0) \\ p(\text{read } 1) \end{pmatrix} = \begin{pmatrix} 1 - p_{0\to1} & p_{1\to0} \\ p_{0\to1} & 1 - p_{1\to0} \end{pmatrix} \begin{pmatrix} p(\text{actual } 0) \\ p(\text{actual } 1) \end{pmatrix}
$$

### Crosstalk

When a gate is applied to one qubit, neighboring qubits experience unwanted interactions. This is especially problematic in superconducting architectures where qubits are coupled through shared resonators.

## Noise Models

### Depolarizing Channel

The depolarizing channel applies a random Pauli error with probability $p$:

$$
\mathcal{E}(\rho) = (1-p)\rho + \frac{p}{3}(X\rho X + Y\rho Y + Z\rho Z)
$$

This can be rewritten as:

$$
\mathcal{E}(\rho) = \left(1 - \frac{4p}{3}\right)\rho + \frac{4p}{3} \cdot \frac{I}{2}
$$

showing that the state is pushed toward the maximally mixed state $I/2$ at the center of the Bloch sphere.

### Kraus Operator Representation

Any quantum channel $\mathcal{E}$ can be expressed using Kraus operators $\{K_i\}$:

$$
\mathcal{E}(\rho) = \sum_i K_i \rho K_i^\dagger, \quad \sum_i K_i^\dagger K_i = I
$$

For the depolarizing channel:

$$
K_0 = \sqrt{1-p}\, I, \quad K_1 = \sqrt{p/3}\, X, \quad K_2 = \sqrt{p/3}\, Y, \quad K_3 = \sqrt{p/3}\, Z
$$

## Simulating Noise in Qiskit with Aer

Qiskit Aer provides powerful noise simulation capabilities:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, thermal_relaxation_error

# Build a simple circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Create a noise model
noise_model = NoiseModel()

# Add depolarizing error to single-qubit gates (0.1% error rate)
error_1q = depolarizing_error(0.001, 1)
noise_model.add_all_qubit_quantum_error(error_1q, ['h', 'x', 'y', 'z'])

# Add depolarizing error to two-qubit gates (1% error rate)
error_2q = depolarizing_error(0.01, 2)
noise_model.add_all_qubit_quantum_error(error_2q, ['cx'])

# Run noisy simulation
noisy_sim = AerSimulator(noise_model=noise_model)
result = noisy_sim.run(qc, shots=10000).result()
counts = result.get_counts()
print(counts)
# {'00': 4925, '11': 4910, '01': 82, '10': 83}
# Note: '01' and '10' appear due to noise!
```

### Thermal Relaxation Noise

Simulating realistic $T_1$/$T_2$ decoherence:

```python
# Thermal relaxation parameters
t1 = 50e3   # T1 = 50 μs (in nanoseconds)
t2 = 30e3   # T2 = 30 μs
gate_time_1q = 50    # Single-qubit gate duration: 50 ns
gate_time_2q = 300   # Two-qubit gate duration: 300 ns

# Create thermal relaxation errors
error_1q = thermal_relaxation_error(t1, t2, gate_time_1q)
error_2q = thermal_relaxation_error(t1, t2, gate_time_2q).tensor(
    thermal_relaxation_error(t1, t2, gate_time_2q)
)

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(error_1q, ['h', 'x', 'rz'])
noise_model.add_all_qubit_quantum_error(error_2q, ['cx'])

result = AerSimulator(noise_model=noise_model).run(qc, shots=10000).result()
print(result.get_counts())
```

### Custom Noise from Kraus Operators

```python
import numpy as np
from qiskit_aer.noise import kraus_error

# Amplitude damping with γ = 0.05
gamma = 0.05
k0 = np.array([[1, 0], [0, np.sqrt(1 - gamma)]])
k1 = np.array([[0, np.sqrt(gamma)], [0, 0]])

error = kraus_error([k0, k1])
noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(error, ['id', 'x', 'h'])
```

## Error Mitigation Techniques

Error mitigation reduces the impact of noise **without** full error correction — valuable for near-term NISQ devices.

### Zero-Noise Extrapolation (ZNE)

The idea: run the circuit at multiple noise levels and extrapolate to zero noise.

1. Run the circuit at noise levels $\lambda, 2\lambda, 3\lambda, \ldots$
2. Fit a model (linear, polynomial, exponential) to the results
3. Extrapolate to $\lambda = 0$

Noise amplification is achieved by **gate folding**: replacing $G$ with $G \cdot G^\dagger \cdot G$, which is logically identical but takes three times as long (more decoherence).

$$
\text{Expectation at zero noise} \approx a_0 + a_1 \lambda + a_2 \lambda^2 + \cdots \bigg|_{\lambda=0} = a_0
$$

### Probabilistic Error Cancellation (PEC)

PEC decomposes each noisy gate into a linear combination of implementable operations:

$$
\mathcal{U} = \sum_i \eta_i \mathcal{O}_i
$$

where $\mathcal{U}$ is the ideal gate and $\mathcal{O}_i$ are noisy but implementable channels. By randomly sampling from this decomposition and adjusting signs, the noise cancels in expectation — at the cost of increased sampling overhead proportional to $\gamma = \sum_i |\eta_i|$.

### Measurement Error Mitigation

Correct for readout errors by inverting the calibration matrix:

```python
# Calibrate by preparing known states and measuring
# If we prepare |0⟩ 1000 times and get: 980 × '0', 20 × '1'
# If we prepare |1⟩ 1000 times and get: 30 × '0', 970 × '1'

import numpy as np

cal_matrix = np.array([
    [0.98, 0.03],   # P(read 0 | actual 0), P(read 0 | actual 1)
    [0.02, 0.97],   # P(read 1 | actual 0), P(read 1 | actual 1)
])

# Measured probabilities
measured = np.array([0.55, 0.45])

# Corrected probabilities
corrected = np.linalg.solve(cal_matrix, measured)
print(f"Corrected: {corrected}")  # Closer to true distribution
```

## Key Takeaways

- **$T_1$ (amplitude damping)** governs energy relaxation — qubits decay from $|1\rangle$ to $|0\rangle$.
- **$T_2$ (dephasing)** governs phase coherence loss, always $T_2 \leq 2T_1$.
- The **depolarizing channel** is the most common noise model, pushing states toward the maximally mixed state.
- **Kraus operators** provide a complete mathematical description of any quantum noise channel.
- **Gate fidelity** $\sim 99.9\%$ for single-qubit, $\sim 99\%$ for two-qubit gates on current hardware.
- **Error mitigation** (ZNE, PEC, measurement correction) helps extract useful results from noisy hardware without full error correction.

## Try It Yourself

1. Simulate a Bell state circuit with depolarizing noise at error rates $p = 0.001, 0.01, 0.05, 0.1$. Plot the fidelity of the output state vs. $p$.
2. Implement measurement error mitigation: prepare $|0\rangle$ and $|1\rangle$ states to calibrate, then correct the measurement results of a Hadamard circuit.
3. Create a noise model with thermal relaxation ($T_1 = 50\,\mu\text{s}$, $T_2 = 30\,\mu\text{s}$) and observe how circuit depth affects the output fidelity.
4. Implement zero-noise extrapolation for a simple 2-qubit circuit by running at $1\times$, $2\times$, and $3\times$ noise and fitting a linear model.

---

*Next lesson: [Types of Quantum Errors](45-qc-quantum-errors.md)*
