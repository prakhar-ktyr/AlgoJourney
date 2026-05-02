---
title: Quantum Measurement
---

# Quantum Measurement

Measurement is where the quantum world meets the classical world. It's the process of extracting classical information from a quantum system — and it fundamentally changes the system in the process.

---

## The Measurement Postulate

When you measure a qubit in state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ in the **computational basis** ($\{|0\rangle, |1\rangle\}$):

1. The outcome is $|0\rangle$ with probability $|\alpha|^2$
2. The outcome is $|1\rangle$ with probability $|\beta|^2$
3. After measurement, the qubit **collapses** to the measured state

```
Before:  |ψ⟩ = α|0⟩ + β|1⟩     (superposition)
                    ↓ measure
After:   |0⟩  with prob |α|²    (definite state)
    or   |1⟩  with prob |β|²    (definite state)
```

**The superposition is destroyed.** You cannot "un-measure" a qubit to recover the original state.

---

## Measurement is Irreversible

This is one of the most important facts in quantum computing:

- Quantum gates are **reversible** (unitary operations).
- Measurement is **irreversible** — it collapses the wave function.

```
Reversible:     |ψ⟩ → U|ψ⟩ → U†U|ψ⟩ = |ψ⟩  (can undo)
Irreversible:   |ψ⟩ → measure → |0⟩ or |1⟩   (can't undo)
```

This means you must be strategic about **when** to measure in a quantum algorithm.

---

## Measurement in the Computational Basis

The standard measurement in quantum computing is the **computational basis measurement** (also called the Z-basis measurement):

### Single Qubit

Basis states: $\{|0\rangle, |1\rangle\}$

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle \xrightarrow{\text{measure}} \begin{cases} |0\rangle & \text{prob } |\alpha|^2 \\ |1\rangle & \text{prob } |\beta|^2 \end{cases}$$

### Two Qubits

Basis states: $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$

$$|\psi\rangle = \alpha_{00}|00\rangle + \alpha_{01}|01\rangle + \alpha_{10}|10\rangle + \alpha_{11}|11\rangle$$

$$\xrightarrow{\text{measure}} |ij\rangle \text{ with prob } |\alpha_{ij}|^2$$

### Partial Measurement

You can measure just **one** qubit of a multi-qubit system. This partially collapses the state:

**Example**: $|\psi\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ (Bell state)

Measure qubit 0:
- Result $|0\rangle$ (prob 1/2): system collapses to $|00\rangle$ → qubit 1 is definitely $|0\rangle$
- Result $|1\rangle$ (prob 1/2): system collapses to $|11\rangle$ → qubit 1 is definitely $|1\rangle$

This is how entanglement manifests — measuring one qubit determines the other.

---

## Measurement in Other Bases

You're not limited to the computational basis. Common alternatives:

### X-Basis (Hadamard Basis)

Basis states: $\{|+\rangle, |-\rangle\}$

$$|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}, \quad |-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$$

To measure in the X-basis, apply a Hadamard gate **before** the standard measurement:

```
|ψ⟩ → [H] → Measure in Z-basis
```

This is equivalent to measuring in the X-basis.

### Y-Basis

Basis states: $\{|+i\rangle, |-i\rangle\}$

To measure in the Y-basis: apply $S^\dagger$ then $H$ before measuring.

### Why Different Bases Matter

Different measurement bases reveal different information about the quantum state:

$$|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$$

- **Z-basis measurement**: 50/50 chance of $|0\rangle$ or $|1\rangle$ (no information about the phase)
- **X-basis measurement**: 100% chance of $|+\rangle$ (reveals the state perfectly)

Quantum algorithms choose the measurement basis carefully to extract the information they need.

---

## The Born Rule

The Born rule is the fundamental law connecting quantum amplitudes to measurement probabilities:

$$P(\text{outcome } i) = |\langle i|\psi\rangle|^2$$

For the computational basis:

$$P(0) = |\langle 0|\psi\rangle|^2 = |\alpha|^2$$
$$P(1) = |\langle 1|\psi\rangle|^2 = |\beta|^2$$

This was proposed by Max Born in 1926 and is one of the fundamental postulates of quantum mechanics.

---

## Measurement in Qiskit

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create a circuit
qc = QuantumCircuit(2, 2)

# Prepare a Bell state
qc.h(0)
qc.cx(0, 1)

# Measure both qubits
qc.measure([0, 1], [0, 1])

# Run 1000 shots
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()
counts = result[0].data.c.get_counts()
print(counts)
# {'00': ~500, '11': ~500}
```

### Measuring in X-basis

```python
qc = QuantumCircuit(1, 1)
qc.h(0)       # Prepare |+⟩

# To measure in X-basis, apply H before measurement
qc.h(0)       # H|+⟩ = |0⟩
qc.measure(0, 0)

sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()
print(result[0].data.c.get_counts())
# {'0': 1000}  ← always 0, because |+⟩ is an eigenstate of X
```

---

## The Measurement Problem

The "measurement problem" is one of the deepest unsolved questions in physics:

**What exactly constitutes a "measurement"?** When does the quantum superposition collapse to a classical outcome?

### Interpretations

| Interpretation | What Measurement Means |
|---------------|----------------------|
| **Copenhagen** | Wave function literally collapses upon measurement |
| **Many-Worlds** | All outcomes happen in parallel universes; no collapse |
| **Decoherence** | Interaction with the environment effectively collapses the state |
| **QBism** | Measurement updates our subjective knowledge |

For quantum computing purposes, the practical effect is the same regardless of interpretation: measurement gives one classical outcome with probabilities given by the Born rule.

---

## Repeated Measurement

### Measuring the Same Qubit Twice

Once a qubit has been measured, it's in a definite state. Measuring again gives the **same result**:

```
|ψ⟩ → measure → |0⟩ → measure again → |0⟩  (100% certain)
```

### Statistical Estimation

Since measurement is probabilistic, quantum algorithms are typically run **many times** (called "shots") to estimate the probability distribution:

```
1000 shots of measuring |+⟩:
  |0⟩: 507 times (≈ 50.7%)
  |1⟩: 493 times (≈ 49.3%)
```

More shots → more precise estimates. The number of shots needed depends on the desired confidence level.

---

## Deferred and Mid-Circuit Measurement

### Deferred Measurement Principle

Measurements can always be **deferred** to the end of the circuit without changing the outcome probabilities. This is useful for circuit optimization.

### Mid-Circuit Measurement

Modern quantum hardware supports **mid-circuit measurement** — measuring some qubits while the computation continues on others. This enables:

- **Classical feedforward**: Use measurement results to control subsequent quantum gates
- **Quantum error correction**: Measure syndrome qubits without disturbing data qubits
- **Adaptive algorithms**: Modify the circuit based on intermediate results

---

## Key Takeaways

- Measurement collapses a qubit's superposition to a definite classical outcome.
- The Born rule gives measurement probabilities: $P(i) = |\langle i|\psi\rangle|^2$.
- Measurement is irreversible — the original superposition is destroyed.
- Different measurement bases reveal different information about the state.
- Partial measurement of entangled qubits collapses the entire system.
- Quantum algorithms run multiple shots to estimate outcome probabilities.

---

## Try It Yourself

**Problem**: A qubit is in state $|\psi\rangle = \frac{1}{2}|0\rangle + \frac{\sqrt{3}}{2}|1\rangle$.

1. What are the measurement probabilities in the Z-basis?
2. If you run 4000 shots, approximately how many times do you expect to get $|1\rangle$?

**Answers**:
1. $P(0) = |1/2|^2 = 1/4 = 25\%$, $P(1) = |\sqrt{3}/2|^2 = 3/4 = 75\%$
2. $4000 \times 0.75 = 3000$ times (approximately)

Next, we'll explore the **Heisenberg Uncertainty Principle** →
