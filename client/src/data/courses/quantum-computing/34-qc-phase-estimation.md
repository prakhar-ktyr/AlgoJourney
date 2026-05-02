---
title: "Quantum Phase Estimation"
---

# Quantum Phase Estimation

**Quantum Phase Estimation (QPE)** is one of the most important subroutines in quantum computing. Given a unitary operator $U$ and one of its eigenstates $|\psi\rangle$, QPE estimates the eigenvalue phase $\theta$ such that:

$$U|\psi\rangle = e^{2\pi i \theta}|\psi\rangle$$

QPE is the foundation for Shor's algorithm, quantum chemistry simulations, and the HHL algorithm for linear systems.

---

## The Problem

**Given:**
- A unitary operator $U$ (as a black-box quantum gate)
- An eigenstate $|\psi\rangle$ of $U$
- The promise that $U|\psi\rangle = e^{2\pi i \theta}|\psi\rangle$ for some $\theta \in [0, 1)$

**Goal:** Estimate $\theta$ to $t$ bits of precision.

---

## Why Is This Useful?

The eigenvalue $e^{2\pi i \theta}$ encodes important physical information:

| Application | What $\theta$ represents |
|-------------|--------------------------|
| Shor's algorithm | Period of modular exponentiation |
| Quantum chemistry | Energy eigenvalue of a molecule |
| HHL algorithm | Eigenvalue of a matrix (for linear systems) |
| Quantum simulation | Energy levels of a Hamiltonian |

---

## Circuit Overview

QPE uses two registers:

1. **Counting register**: $t$ qubits initialized to $|0\rangle^{\otimes t}$ — determines precision
2. **Eigenstate register**: $n$ qubits initialized to $|\psi\rangle$

```
|0⟩ ─── H ────── •──────────────────────────── ┐
|0⟩ ─── H ────── | ──── •─────────────────────  │ Inverse
|0⟩ ─── H ────── | ──── | ──── •──────────────  ├ QFT
  ⋮              │      │      │               │
|0⟩ ─── H ─────  | ──── | ──── | ──── •───────  ┘
                  │      │      │      │
|ψ⟩ ──────────── U ──── U² ─── U⁴ ── U^(2^(t-1))
```

---

## Algorithm Steps

### Step 1: Initialize

$$|\psi_0\rangle = |0\rangle^{\otimes t} |\psi\rangle$$

### Step 2: Hadamard on Counting Register

$$|\psi_1\rangle = \frac{1}{\sqrt{2^t}} \sum_{k=0}^{2^t - 1} |k\rangle |\psi\rangle$$

### Step 3: Controlled-$U^{2^j}$ Operations

Apply controlled-$U^{2^j}$ from counting qubit $j$ to the eigenstate register:

$$|\psi_2\rangle = \frac{1}{\sqrt{2^t}} \sum_{k=0}^{2^t - 1} e^{2\pi i \theta k} |k\rangle |\psi\rangle$$

**Why?** When counting qubit $j$ is $|1\rangle$, we apply $U^{2^j}$ to $|\psi\rangle$:

$$U^{2^j}|\psi\rangle = e^{2\pi i \cdot 2^j \theta}|\psi\rangle$$

The accumulated phase on state $|k\rangle$ (where $k = k_{t-1} \cdots k_1 k_0$ in binary) is:

$$e^{2\pi i \theta (k_{t-1} \cdot 2^{t-1} + \cdots + k_1 \cdot 2 + k_0)} = e^{2\pi i \theta k}$$

### Step 4: Inverse QFT on Counting Register

The state of the counting register is:

$$\frac{1}{\sqrt{2^t}} \sum_{k=0}^{2^t - 1} e^{2\pi i \theta k} |k\rangle$$

This is exactly the QFT of the state $|2^t \theta\rangle$ (when $2^t \theta$ is an integer). Applying the inverse QFT:

$$\text{QFT}^{-1} \left( \frac{1}{\sqrt{2^t}} \sum_{k=0}^{2^t - 1} e^{2\pi i \theta k} |k\rangle \right) = |2^t \theta\rangle$$

### Step 5: Measure

Measuring the counting register gives the binary representation of $2^t \theta$, from which we extract:

$$\theta = \frac{\text{measurement result}}{2^t}$$

---

## Precision and Success Probability

- With $t$ counting qubits, the phase is estimated to $t$ bits of precision: $\theta \approx m/2^t$
- If $2^t \theta$ is exactly an integer, the algorithm succeeds with **probability 1**
- If $2^t \theta$ is not an integer, the algorithm gives the best $t$-bit approximation with probability $\geq 1 - \frac{1}{2(2^t - 2)}$
- Adding extra qubits increases precision: $t + \lceil \log(2 + 1/(2\epsilon)) \rceil$ qubits give error $\leq \epsilon$ with high probability

---

## Step-by-Step Example

Let's estimate the phase of the **T gate**:

$$T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}$$

The eigenstates are $|0\rangle$ (eigenvalue 1) and $|1\rangle$ (eigenvalue $e^{i\pi/4} = e^{2\pi i / 8}$).

For eigenstate $|1\rangle$: $\theta = 1/8 = 0.001$ in binary.

We need $t = 3$ counting qubits to represent $\theta = 1/8$ exactly.

### The Counting Register State After Controlled-U

After controlled-$T$, controlled-$T^2$, and controlled-$T^4$:

$$\frac{1}{\sqrt{8}} \sum_{k=0}^{7} e^{2\pi i k / 8} |k\rangle$$

### After Inverse QFT

$$|001\rangle = |1\rangle$$

Result: $\theta = 1/2^3 = 1/8$ ✓

---

## Qiskit Implementation

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.circuit.library import QFT
import numpy as np

def phase_estimation(unitary_gate, eigenstate_circuit, num_counting_qubits, num_eigenstate_qubits):
    """
    Quantum Phase Estimation circuit.
    
    Args:
        unitary_gate: The unitary operator U (as a gate)
        eigenstate_circuit: Circuit to prepare the eigenstate |ψ⟩
        num_counting_qubits: Number of qubits for precision (t)
        num_eigenstate_qubits: Number of qubits in eigenstate register
    
    Returns:
        QuantumCircuit: The complete QPE circuit
    """
    t = num_counting_qubits
    n = num_eigenstate_qubits
    total_qubits = t + n
    
    qc = QuantumCircuit(total_qubits, t)
    
    # Prepare eigenstate in the last n qubits
    qc.compose(eigenstate_circuit, qubits=range(t, total_qubits), inplace=True)
    
    # Step 1: Hadamard on counting register
    qc.h(range(t))
    
    qc.barrier()
    
    # Step 2: Controlled-U^(2^j) operations
    for j in range(t):
        # Apply U^(2^j) controlled by counting qubit j
        power = 2 ** j
        controlled_u = unitary_gate.power(power).control(1)
        qc.compose(controlled_u, qubits=[j] + list(range(t, total_qubits)), inplace=True)
    
    qc.barrier()
    
    # Step 3: Inverse QFT on counting register
    qft_inv = QFT(t, inverse=True)
    qc.compose(qft_inv, qubits=range(t), inplace=True)
    
    # Step 4: Measure counting register
    qc.measure(range(t), range(t))
    
    return qc

# Example: Estimate phase of T gate on eigenstate |1⟩
# T|1⟩ = e^(iπ/4)|1⟩ = e^(2πi·(1/8))|1⟩, so θ = 1/8

from qiskit.circuit.library import TGate

t = 3  # counting qubits (3 bits = precision of 1/8)
n = 1  # eigenstate is 1 qubit

# Create T gate
t_gate = TGate()

# Eigenstate preparation: |1⟩
eigenstate = QuantumCircuit(1)
eigenstate.x(0)

# Build QPE circuit
qpe_circuit = phase_estimation(t_gate, eigenstate, t, n)
print("QPE Circuit for T gate:")
print(qpe_circuit.draw())

# Execute
sampler = StatevectorSampler()
job = sampler.run([qpe_circuit], shots=1024)
result = job.result()
counts = result[0].data.c.get_counts()

print(f"\nMeasurement results: {counts}")

# Interpret results
for outcome, count in sorted(counts.items(), key=lambda x: -x[1]):
    # Convert binary to decimal
    decimal_value = int(outcome, 2)
    estimated_theta = decimal_value / (2**t)
    print(f"  |{outcome}⟩ (decimal {decimal_value}): θ = {decimal_value}/{2**t} = {estimated_theta:.6f}")
    print(f"    → eigenvalue = e^(2πi·{estimated_theta:.4f}) = e^(i·{2*np.pi*estimated_theta:.4f})")
```

### Expected Output

```
Measurement results: {'001': 1024}
  |001⟩ (decimal 1): θ = 1/8 = 0.125000
    → eigenvalue = e^(2πi·0.1250) = e^(i·0.7854)
```

The phase $\pi/4 \approx 0.7854$ is correctly identified!

---

## Example with Non-Exact Phase

```python
# Phase gate with θ = 1/3 (cannot be exactly represented in 3 bits)
from qiskit.circuit.library import PhaseGate

theta_true = 1/3
phase_gate = PhaseGate(2 * np.pi * theta_true)

# Use more counting qubits for better precision
t = 5  # 5 counting qubits

eigenstate = QuantumCircuit(1)
eigenstate.x(0)

qpe_circuit = phase_estimation(phase_gate, eigenstate, t, 1)

sampler = StatevectorSampler()
job = sampler.run([qpe_circuit], shots=4096)
result = job.result()
counts = result[0].data.c.get_counts()

print(f"True θ = {theta_true:.6f}")
print(f"\nTop measurement results:")
sorted_counts = sorted(counts.items(), key=lambda x: -x[1])[:5]
for outcome, count in sorted_counts:
    decimal_value = int(outcome, 2)
    estimated_theta = decimal_value / (2**t)
    error = abs(estimated_theta - theta_true)
    print(f"  |{outcome}⟩: θ ≈ {estimated_theta:.6f} (error: {error:.6f}, count: {count})")
```

---

## Handling Unknown Eigenstates

What if we don't have the eigenstate $|\psi\rangle$? If we prepare an arbitrary state $|\phi\rangle = \sum_j c_j |\psi_j\rangle$ (superposition of eigenstates), QPE gives:

$$\sum_j c_j |2^t \theta_j\rangle |\psi_j\rangle$$

Measuring the counting register collapses to one eigenphase $\theta_j$ with probability $|c_j|^2$, and the eigenstate register collapses to $|\psi_j\rangle$.

This is useful for quantum chemistry, where we prepare an approximate ground state and QPE projects onto the true eigenstate.

---

## Applications

### 1. Shor's Algorithm
QPE estimates the phase of modular exponentiation $U_a|y\rangle = |ay \mod N\rangle$, giving the period of $a^r \mod N$.

### 2. Quantum Chemistry
QPE estimates energy eigenvalues of molecular Hamiltonians:
$$H|\psi\rangle = E|\psi\rangle \implies e^{-iHt}|\psi\rangle = e^{-iEt}|\psi\rangle$$

### 3. HHL Algorithm
For solving $Ax = b$, QPE extracts eigenvalues of $A$ to enable matrix inversion.

---

## Resource Requirements

| Resource | Count |
|----------|-------|
| Counting qubits | $t = \lceil \log_2(1/\epsilon) \rceil + O(1)$ |
| Controlled-U operations | $2^0 + 2^1 + \cdots + 2^{t-1} = 2^t - 1$ |
| QFT gates | $O(t^2)$ |
| Total gates | $O(2^t)$ controlled-U + $O(t^2)$ QFT |

The **dominant cost** is the controlled-$U^{2^j}$ operations. Efficient implementation of $U^{2^j}$ (e.g., via repeated squaring) is crucial.

---

## Key Takeaways

1. QPE estimates the eigenvalue phase $\theta$ of a unitary: $U|\psi\rangle = e^{2\pi i \theta}|\psi\rangle$
2. It uses **controlled powers of $U$** ($U, U^2, U^4, \ldots$) and the **inverse QFT**
3. With $t$ counting qubits, precision is $1/2^t$ — more qubits = better accuracy
4. When $2^t\theta$ is an exact integer, QPE succeeds with probability 1
5. QPE is the **core subroutine** in Shor's algorithm, quantum chemistry, and quantum machine learning
6. The main cost is implementing controlled-$U^{2^j}$ efficiently

---

## Try It Yourself

1. **Different gates**: Try QPE with the S gate ($\theta = 1/4$), Z gate ($\theta = 1/2$), and custom phase gates
2. **Increase precision**: Use $t = 4, 5, 6$ counting qubits and observe how non-exact phases are approximated
3. **Two-qubit unitary**: Implement QPE for a 2-qubit controlled-Z gate
4. **Unknown eigenstate**: Prepare $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ as input and observe that you get both eigenphases
5. **Error analysis**: For $\theta = 1/3$, plot the estimation error vs number of counting qubits

```python
# Exercise: QPE for S gate (θ = 1/4)
from qiskit.circuit.library import SGate

s_gate = SGate()
eigenstate_s = QuantumCircuit(1)
eigenstate_s.x(0)  # |1⟩ is eigenstate of S with eigenvalue i = e^(2πi·1/4)

qpe_s = phase_estimation(s_gate, eigenstate_s, num_counting_qubits=3, num_eigenstate_qubits=1)

sampler = StatevectorSampler()
job = sampler.run([qpe_s], shots=1024)
result = job.result()
counts = result[0].data.c.get_counts()
print(f"QPE for S gate: {counts}")
# Expected: |010⟩ with 100% probability (decimal 2 → θ = 2/8 = 1/4) ✓
```

---

## Next Lesson

In the next lesson, we'll see how QPE is used as the core component of **Shor's Algorithm** — the quantum algorithm that can factor large integers and break RSA encryption in polynomial time.
