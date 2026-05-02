---
title: "Types of Quantum Errors"
---

Before we can correct quantum errors, we need to understand exactly what kinds of errors occur. Unlike classical errors (a bit flips from 0 to 1), quantum errors form a continuous space of possible corruptions. Remarkably, this infinite space can be decomposed into a discrete set of Pauli errors — a fact that makes quantum error correction possible. This lesson catalogs the major error types, their mathematical representations, and their implications for real quantum hardware.

## The Pauli Error Basis

Any single-qubit error can be expressed as a linear combination of the Pauli matrices plus the identity:

$$
E = c_0 I + c_1 X + c_2 Y + c_3 Z
$$

where:

$$
I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \quad
X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad
Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad
Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

This is powerful: even though errors are continuous, if a code can correct $X$, $Y$, and $Z$ errors independently, it can correct **any** single-qubit error. This is the **digitization of quantum errors**.

## Bit-Flip Errors ($X$ Errors)

A bit-flip error is the quantum analogue of a classical bit flip. The $X$ gate swaps $|0\rangle$ and $|1\rangle$:

$$
X|0\rangle = |1\rangle, \quad X|1\rangle = |0\rangle
$$

For a general state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$:

$$
X|\psi\rangle = \beta|0\rangle + \alpha|1\rangle
$$

The bit-flip channel applies $X$ with probability $p$:

$$
\mathcal{E}_{\text{bf}}(\rho) = (1-p)\rho + p\, X\rho X
$$

Kraus operators:

$$
K_0 = \sqrt{1-p}\, I, \quad K_1 = \sqrt{p}\, X
$$

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, pauli_error

# Bit-flip channel with p = 0.1
error = pauli_error([('X', 0.1), ('I', 0.9)])

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(error, ['id', 'x', 'h'])

# Prepare |0⟩ and observe bit flips
qc = QuantumCircuit(1)
qc.id(0)  # Identity gate triggers noise
qc.measure_all()

result = AerSimulator(noise_model=noise_model).run(qc, shots=10000).result()
print(result.get_counts())
# {'0': ~9000, '1': ~1000}
```

## Phase-Flip Errors ($Z$ Errors)

A phase-flip error has **no classical analogue** — it leaves $|0\rangle$ unchanged but flips the phase of $|1\rangle$:

$$
Z|0\rangle = |0\rangle, \quad Z|1\rangle = -|1\rangle
$$

For a superposition:

$$
Z(\alpha|0\rangle + \beta|1\rangle) = \alpha|0\rangle - \beta|1\rangle
$$

This doesn't change the measurement probabilities in the computational basis! You can only detect it by measuring in a different basis:

$$
Z|+\rangle = |-\rangle, \quad Z|-\rangle = |+\rangle
$$

So a $Z$ error looks like a **bit flip in the $X$-basis**.

The phase-flip channel:

$$
\mathcal{E}_{\text{pf}}(\rho) = (1-p)\rho + p\, Z\rho Z
$$

```python
# Phase-flip channel
error = pauli_error([('Z', 0.1), ('I', 0.9)])

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(error, ['id'])

# Prepare |+⟩ and check for phase flips
qc = QuantumCircuit(1)
qc.h(0)       # Prepare |+⟩
qc.id(0)      # Noise acts here
qc.h(0)       # Rotate to Z-basis for detection
qc.measure_all()

result = AerSimulator(noise_model=noise_model).run(qc, shots=10000).result()
print(result.get_counts())
# {'0': ~9000, '1': ~1000}  — phase flips detected!
```

## Combined Errors: $Y = iXZ$

The $Y$ error combines both a bit flip and a phase flip:

$$
Y = iXZ = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}
$$

$$
Y|0\rangle = i|1\rangle, \quad Y|1\rangle = -i|0\rangle
$$

For a general state:

$$
Y(\alpha|0\rangle + \beta|1\rangle) = -i\beta|0\rangle + i\alpha|1\rangle
$$

The global phase $i$ has no physical significance in measurement outcomes, but the combined bit-and-phase flip is a distinct error type that quantum error correcting codes must handle.

## The Depolarizing Channel

The depolarizing channel is the "worst-case" noise model — it applies each Pauli error with equal probability:

$$
\mathcal{E}_{\text{dep}}(\rho) = (1-p)\rho + \frac{p}{3}\left(X\rho X + Y\rho Y + Z\rho Z\right)
$$

This is equivalent to replacing the state with the maximally mixed state with probability $\frac{4p}{3}$:

$$
\mathcal{E}_{\text{dep}}(\rho) = \left(1 - \frac{4p}{3}\right)\rho + \frac{4p}{3} \cdot \frac{I}{2}
$$

On the Bloch sphere, the Bloch vector shrinks uniformly:

$$
\vec{r} \to \left(1 - \frac{4p}{3}\right)\vec{r}
$$

```python
from qiskit_aer.noise import depolarizing_error

# Single-qubit depolarizing: 5% total error rate
dep_error_1q = depolarizing_error(0.05, 1)

# Two-qubit depolarizing: 10% total error rate
dep_error_2q = depolarizing_error(0.10, 2)

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(dep_error_1q, ['h', 'x', 'z', 'rz'])
noise_model.add_all_qubit_quantum_error(dep_error_2q, ['cx'])
```

For two qubits, the depolarizing channel applies one of 15 non-identity Pauli combinations ($IX, XI, XX, IY, \ldots, ZZ$) each with probability $p/15$.

## Amplitude Damping: Energy Loss

Amplitude damping models **energy dissipation** — the qubit relaxes from $|1\rangle$ to $|0\rangle$ (like an excited atom emitting a photon). This is a **non-unitary, irreversible** process.

Kraus operators with damping parameter $\gamma \in [0, 1]$:

$$
K_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1-\gamma} \end{pmatrix}, \quad K_1 = \begin{pmatrix} 0 & \sqrt{\gamma} \\ 0 & 0 \end{pmatrix}
$$

The action on basis states:

$$
|0\rangle\langle 0| \to |0\rangle\langle 0|
$$
$$
|1\rangle\langle 1| \to (1-\gamma)|1\rangle\langle 1| + \gamma|0\rangle\langle 0|
$$

At $\gamma = 1$, any state is fully damped to $|0\rangle$. The relationship to $T_1$ is:

$$
\gamma(t) = 1 - e^{-t/T_1}
$$

```python
import numpy as np
from qiskit_aer.noise import kraus_error

gamma = 0.1  # 10% amplitude damping
k0 = np.array([[1, 0], [0, np.sqrt(1 - gamma)]])
k1 = np.array([[0, np.sqrt(gamma)], [0, 0]])

amp_damp_error = kraus_error([k0, k1])

noise_model = NoiseModel()
noise_model.add_all_qubit_quantum_error(amp_damp_error, ['id', 'x', 'h'])

# Prepare |1⟩ and watch it decay
qc = QuantumCircuit(1)
qc.x(0)
qc.id(0)
qc.measure_all()

result = AerSimulator(noise_model=noise_model).run(qc, shots=10000).result()
print(result.get_counts())
# {'1': ~9000, '0': ~1000}  — some |1⟩ decayed to |0⟩
```

## Error Channels and Kraus Representations Summary

| Channel | # Kraus ops | Parameters | Physical process |
|---------|-------------|------------|-----------------|
| Bit flip | 2 | $p$ | Spurious $X$ rotations |
| Phase flip | 2 | $p$ | Spurious $Z$ rotations |
| Bit-phase flip | 2 | $p$ | Spurious $Y$ rotations |
| Depolarizing | 4 | $p$ | Random Pauli errors |
| Amplitude damping | 2 | $\gamma$ | Energy relaxation ($T_1$) |
| Phase damping | 2 | $\lambda$ | Dephasing ($T_2$) |
| Generalized amplitude damping | 4 | $\gamma, p$ | Thermal equilibrium |

## Error Rates in Current Hardware

As of 2024–2025, representative error rates:

| Platform | 1Q Gate Error | 2Q Gate Error | $T_1$ | $T_2$ | Readout Error |
|----------|--------------|---------------|-------|-------|--------------|
| IBM Eagle (127Q) | $\sim 10^{-4}$ | $\sim 10^{-2}$ | 300 μs | 150 μs | $\sim 10^{-2}$ |
| Google Sycamore | $\sim 10^{-3}$ | $\sim 5 \times 10^{-3}$ | 20 μs | 10 μs | $\sim 10^{-2}$ |
| IonQ Aria (trapped ion) | $\sim 10^{-4}$ | $\sim 5 \times 10^{-3}$ | >10 s | >1 s | $\sim 5 \times 10^{-3}$ |
| Quantinuum H2 | $\sim 10^{-5}$ | $\sim 10^{-3}$ | >10 s | >1 s | $\sim 3 \times 10^{-3}$ |

Trapped ions have much longer coherence times but slower gates; superconducting qubits have faster gates but shorter lifetimes.

## How Errors Accumulate in Deep Circuits

For a circuit with $n$ gates, each with error rate $\epsilon$, the probability of **no errors** is approximately:

$$
P_{\text{success}} \approx (1-\epsilon)^n \approx e^{-n\epsilon}
$$

For $\epsilon = 0.01$ and $n = 100$ gates:

$$
P_{\text{success}} \approx e^{-1} \approx 0.37
$$

For $n = 1000$ gates:

$$
P_{\text{success}} \approx e^{-10} \approx 0.000045
$$

This exponential decay is why **circuit depth** is a critical metric. Algorithms must be designed to use as few gates as possible, and error correction must be employed for deep circuits.

## The Threshold Theorem

The **threshold theorem** is perhaps the most important result in quantum error correction. It states:

> If the physical error rate $p$ is below a threshold value $p_{\text{th}}$, then arbitrarily long quantum computations can be performed reliably using quantum error correction, with overhead that scales only polynomially with the desired accuracy.

The threshold depends on the error correction code and noise model:

- **Surface code**: $p_{\text{th}} \approx 1\%$ for depolarizing noise
- **Color codes**: $p_{\text{th}} \approx 0.1\%$
- **Concatenated codes**: $p_{\text{th}} \approx 10^{-4}$ to $10^{-2}$ depending on the scheme

The logical error rate for a distance-$d$ surface code is approximately:

$$
p_L \approx 0.03 \left(\frac{p}{p_{\text{th}}}\right)^{\lfloor (d+1)/2 \rfloor}
$$

Each increase in code distance $d$ **exponentially** suppresses the logical error rate — but only when $p < p_{\text{th}}$.

```python
import numpy as np

# Logical error rate vs code distance
p_phys = 0.001       # Physical error rate (0.1%)
p_th = 0.01          # Surface code threshold (1%)

for d in [3, 5, 7, 9, 11, 13]:
    p_logical = 0.03 * (p_phys / p_th) ** ((d + 1) // 2)
    n_physical = d * d  # Number of physical qubits per logical qubit
    print(f"d={d:2d}: p_L = {p_logical:.2e}, physical qubits = {n_physical}")

# d= 3: p_L = 3.00e-03, physical qubits = 9
# d= 5: p_L = 3.00e-04, physical qubits = 25
# d= 7: p_L = 3.00e-05, physical qubits = 49
# ...
```

## Key Takeaways

- **Bit-flip ($X$)** and **phase-flip ($Z$)** errors are the two fundamental error types; $Y = iXZ$ combines both.
- Any single-qubit error can be decomposed into Pauli components — this **digitization** makes error correction feasible.
- The **depolarizing channel** models random Pauli errors and pushes states toward the maximally mixed state.
- **Amplitude damping** ($T_1$) is irreversible energy loss; **phase damping** ($T_2$) destroys coherence.
- Errors accumulate exponentially with circuit depth: $P_{\text{success}} \approx e^{-n\epsilon}$.
- The **threshold theorem** guarantees that below a critical error rate, arbitrarily long computations are possible with polynomial overhead.

## Try It Yourself

1. Simulate a qubit in $|+\rangle$ under repeated phase-flip noise. Plot the $\langle X \rangle$ expectation value as a function of the number of noise applications.
2. Implement all three Pauli error channels (bit-flip, phase-flip, depolarizing) and compare their effect on a Bell state's fidelity.
3. For a 10-gate circuit, plot $P_{\text{success}}$ vs. per-gate error rate $\epsilon$ from $10^{-4}$ to $10^{-1}$.
4. Compute the number of physical qubits needed for a logical error rate of $10^{-15}$ using the surface code with physical error rate $p = 0.001$.

---

*Next lesson: [Quantum Error Correction Codes](46-qc-quantum-error-correction-codes.md)*
