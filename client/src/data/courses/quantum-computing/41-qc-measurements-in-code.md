---
title: "Quantum Measurements in Code"
---

Measurement is the bridge between the quantum and classical worlds. In this lesson, we explore how to perform measurements programmatically in Qiskit — from simple computational-basis measurements to partial measurements, mid-circuit conditioning, and extracting expectation values with the Estimator primitive.

## Measurement in the Computational Basis

The most common measurement collapses each qubit into $|0\rangle$ or $|1\rangle$. In Qiskit, `measure_all()` appends a measurement gate to every qubit:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # e.g. {'00': 510, '11': 514}
```

The Bell state $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ produces only `00` and `11` outcomes, each with probability $\approx 0.5$.

## Measuring Specific Qubits

You can measure individual qubits into specific classical bits using `measure()`:

```python
qc = QuantumCircuit(3, 2)  # 3 qubits, 2 classical bits
qc.h(0)
qc.cx(0, 1)
qc.x(2)

# Measure only qubits 0 and 1 into classical bits 0 and 1
qc.measure(0, 0)
qc.measure(1, 1)

result = AerSimulator().run(qc, shots=1024).result()
print(result.get_counts())
# Qubit 2 is never measured — it remains in |1⟩
```

This is essential when you want ancilla qubits to remain unmeasured or when you need partial information mid-algorithm.

## Partial Measurements and Post-Selection

Partial measurement collapses only the measured subsystem. If we have $|\psi\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ and measure qubit 0, the post-measurement state of qubit 1 is determined:

$$
\text{Measure qubit 0} \Rightarrow \begin{cases} |0\rangle \text{ with prob } 1/2 \implies \text{qubit 1 collapses to } |0\rangle \\ |1\rangle \text{ with prob } 1/2 \implies \text{qubit 1 collapses to } |1\rangle \end{cases}
$$

Post-selection filters results conditioned on a specific measurement outcome:

```python
counts = {'00': 510, '11': 514}
# Post-select on qubit 0 being |0⟩
post_selected = {k: v for k, v in counts.items() if k[-1] == '0'}
print(post_selected)  # {'00': 510}
```

## Mid-Circuit Measurement with Classical Conditioning

Mid-circuit measurements let you measure a qubit partway through a circuit and use the result to control later gates via `c_if`:

```python
qc = QuantumCircuit(2, 1)
qc.h(0)
qc.measure(0, 0)

# Apply X on qubit 1 only if classical bit 0 equals 1
with qc.if_test((0, 1)):
    qc.x(1)

qc.measure_all()

result = AerSimulator().run(qc, shots=1024).result()
print(result.get_counts())
```

This is the basis of **quantum teleportation**, **quantum error correction**, and **repeat-until-success** protocols. The classical feed-forward creates a hybrid quantum-classical loop within a single circuit execution.

## Measuring in Different Bases

By default, `measure()` projects onto the $Z$-basis ($|0\rangle$, $|1\rangle$). To measure in a different basis, apply a basis-change gate before measuring.

### X-Basis Measurement

The $X$-eigenstates are $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ and $|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$. Apply $H$ before measuring:

```python
qc = QuantumCircuit(1, 1)
qc.h(0)       # Prepare |+⟩
qc.h(0)       # Rotate back to Z-basis
qc.measure(0, 0)
# Always gives 0, confirming |+⟩ state
```

### Y-Basis Measurement

The $Y$-eigenstates are $|R\rangle = \frac{1}{\sqrt{2}}(|0\rangle - i|1\rangle)$ and $|L\rangle = \frac{1}{\sqrt{2}}(|0\rangle + i|1\rangle)$. Apply $S^\dagger$ then $H$:

```python
qc = QuantumCircuit(1, 1)
# Prepare some state
qc.h(0)
qc.s(0)       # State is now |L⟩ = (|0⟩ + i|1⟩)/√2

# Y-basis measurement
qc.sdg(0)     # S†
qc.h(0)       # H
qc.measure(0, 0)
```

In general, measuring an observable $O$ with eigenbasis $\{|o_i\rangle\}$ requires applying $U^\dagger$ where $U$ maps the computational basis to the eigenbasis.

## Analyzing Measurement Results

### Counts and Probabilities

```python
counts = result.get_counts()
total_shots = sum(counts.values())
probabilities = {k: v / total_shots for k, v in counts.items()}
print(probabilities)
```

### Statistical Uncertainty

Each probability estimate has a standard error from finite sampling:

$$
\sigma_p = \sqrt{\frac{p(1-p)}{N_{\text{shots}}}}
$$

For $p = 0.5$ and $N = 1024$, this gives $\sigma_p \approx 0.016$.

### Computing Expectation Values Manually

For a Pauli-$Z$ measurement on a single qubit:

$$
\langle Z \rangle = p(0) - p(1)
$$

```python
counts = {'0': 530, '1': 494}
total = sum(counts.values())
p0 = counts.get('0', 0) / total
p1 = counts.get('1', 0) / total
expectation_z = p0 - p1
print(f"⟨Z⟩ = {expectation_z:.4f}")  # ≈ 0.035
```

For multi-qubit observables like $Z \otimes Z$:

$$
\langle Z_0 Z_1 \rangle = p(00) + p(11) - p(01) - p(10)
$$

## The Estimator Primitive

Qiskit's **Estimator** primitive computes expectation values directly, abstracting away the shot-based counting:

```python
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

# Build circuit (no measurements needed)
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

# Define observable
observable = SparsePauliOp("ZZ")

estimator = StatevectorEstimator()
job = estimator.run([(qc, observable)])
result = job.result()
print(f"⟨ZZ⟩ = {result[0].data.evs[0]:.4f}")  # 1.0 for Bell state
```

The Estimator can handle linear combinations of Pauli operators, making it ideal for Hamiltonian simulation:

$$
H = 0.5 \, Z_0 Z_1 + 0.3 \, X_0 + 0.2 \, X_1
$$

```python
hamiltonian = SparsePauliOp.from_list([
    ("ZZ", 0.5),
    ("XI", 0.3),
    ("IX", 0.2),
])
job = estimator.run([(qc, hamiltonian)])
energy = job.result()[0].data.evs[0]
print(f"⟨H⟩ = {energy:.4f}")
```

## Sampler vs Estimator

| Feature | Sampler | Estimator |
|---------|---------|-----------|
| Output | Quasi-probability distribution | Expectation value |
| Use case | Sampling bitstrings | Computing $\langle O \rangle$ |
| Circuit | Requires measurements | No measurements needed |
| Noise | Includes shot noise | Can use error mitigation |

## Key Takeaways

- **Computational-basis measurement** collapses qubits into $|0\rangle$/$|1\rangle$ and is the default in Qiskit.
- **Partial measurements** let you measure a subset of qubits, collapsing only the measured subsystem.
- **Mid-circuit measurement** with classical feed-forward enables adaptive quantum protocols like teleportation and error correction.
- **Basis changes** before measurement let you measure any observable — apply $H$ for $X$-basis, $S^\dagger H$ for $Y$-basis.
- The **Estimator primitive** computes $\langle O \rangle$ directly and supports complex Hamiltonians.
- Statistical uncertainty scales as $1/\sqrt{N_{\text{shots}}}$ — more shots yield more precise estimates.

## Try It Yourself

1. Create a GHZ state $\frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$ and verify that $\langle Z_0 Z_1 Z_2 \rangle = 1$ using the Estimator.
2. Implement quantum teleportation using mid-circuit measurements and classical conditioning.
3. Prepare $|+\rangle$ and measure it in the $X$-, $Y$-, and $Z$-bases. Predict the outcomes before running the circuit.
4. Compute $\langle X \rangle$, $\langle Y \rangle$, and $\langle Z \rangle$ for the state $|\psi\rangle = \cos(\pi/8)|0\rangle + \sin(\pi/8)|1\rangle$ and verify against the Bloch vector coordinates.

---

*Next lesson: [Introduction to Cirq](42-qc-intro-cirq.md)*
---
title: "Quantum Measurements in Code"
---

# Quantum Measurements in Code

Measurement is the bridge between the quantum and classical worlds. In code, performing measurements correctly—choosing which qubits to measure, in which basis, and how to interpret results—is essential for every quantum algorithm.

## Measurement in the Computational Basis

The most common measurement is in the computational (Z) basis, projecting onto $|0\rangle$ and $|1\rangle$:

$$
M_0 = |0\rangle\langle 0|, \quad M_1 = |1\rangle\langle 1|
$$

For a state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$, the probability of outcome 0 is $|\alpha|^2$ and outcome 1 is $|\beta|^2$.

In Qiskit, measurement is added with the `measure` method:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a circuit with 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)
qc.h(0)          # Put qubit 0 in superposition
qc.cx(0, 1)     # Entangle qubits
qc.measure([0, 1], [0, 1])  # Measure both qubits

# Simulate
simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'00': ~512, '11': ~512}
```

## Measuring Specific Qubits (Partial Measurement)

You don't have to measure all qubits. Partial measurement collapses only the measured subsystem:

```python
qc = QuantumCircuit(3, 1)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)

# Measure only qubit 0
qc.measure(0, 0)

result = simulator.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'0': ~512, '1': ~512}
# Qubits 1 and 2 are collapsed but not read out
```

After measuring qubit 0 and obtaining $|0\rangle$, the remaining qubits collapse to $|00\rangle$. If you get $|1\rangle$, they collapse to $|11\rangle$.

## Mid-Circuit Measurement with Classical Conditioning

Mid-circuit measurements allow you to measure a qubit during computation and use the classical result to conditionally apply gates:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 1)
qc.h(0)
qc.measure(0, 0)

# Conditionally apply X gate on qubit 1 if classical bit 0 is 1
with qc.if_test((0, 1)):
    qc.x(1)

print(qc.draw())
```

This is the foundation of **quantum teleportation** and **quantum error correction**. The classical feed-forward allows adaptive circuits.

## Measuring in Different Bases

### X-Basis Measurement

To measure in the X-basis ($|+\rangle$, $|-\rangle$), apply a Hadamard before measuring in Z:

$$
|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}, \quad |-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}
$$

```python
qc = QuantumCircuit(1, 1)
qc.h(0)  # Prepare |+⟩

# X-basis measurement: apply H then measure in Z
qc.h(0)
qc.measure(0, 0)

result = simulator.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'0': 1024} — |+⟩ always gives 0 in X-basis
```

### Y-Basis Measurement

To measure in the Y-basis, apply $S^\dagger$ then $H$ before measuring:

$$
|y+\rangle = \frac{|0\rangle + i|1\rangle}{\sqrt{2}}, \quad |y-\rangle = \frac{|0\rangle - i|1\rangle}{\sqrt{2}}
$$

```python
qc = QuantumCircuit(1, 1)
qc.h(0)
qc.s(0)  # Prepare |y+⟩

# Y-basis measurement: apply Sdg then H, then measure
qc.sdg(0)
qc.h(0)
qc.measure(0, 0)

result = simulator.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'0': 1024}
```

## Analyzing Measurement Results

### Counts and Probabilities

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
result = simulator.run(qc, shots=4096).result()
counts = result.get_counts()

# Convert counts to probabilities
total_shots = sum(counts.values())
probabilities = {state: count / total_shots for state, count in counts.items()}
print(probabilities)  # {'00': ~0.5, '11': ~0.5}
```

### Expectation Values

The expectation value of an observable $O$ is:

$$
\langle O \rangle = \langle\psi|O|\psi\rangle = \sum_i \lambda_i \, p_i
$$

where $\lambda_i$ are eigenvalues and $p_i$ are corresponding probabilities.

For the Z operator on a single qubit:

```python
# Manual expectation value from counts
def expectation_z(counts, shots):
    """Compute <Z> from measurement counts."""
    exp_val = 0
    for bitstring, count in counts.items():
        # Z eigenvalue: +1 for |0⟩, -1 for |1⟩
        sign = (-1) ** int(bitstring)
        exp_val += sign * count / shots
    return exp_val

print(expectation_z({'0': 512, '1': 512}, 1024))  # ≈ 0.0
```

## Estimator Primitive for Expectation Values

Qiskit's `Estimator` primitive computes expectation values without manually processing counts:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_aer.primitives import EstimatorV2

# Create circuit (no measurements needed for Estimator)
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

# Define observables
observable_zz = SparsePauliOp("ZZ")
observable_xx = SparsePauliOp("XX")
observable_zi = SparsePauliOp("ZI")

# Compute expectation values
estimator = EstimatorV2()
job = estimator.run([(qc, observable_zz)])
result = job.result()
print(f"<ZZ> = {result[0].data.evs}")  # 1.0 for Bell state

job2 = estimator.run([(qc, observable_xx)])
result2 = job2.result()
print(f"<XX> = {result2[0].data.evs}")  # 1.0 for Bell state
```

The Estimator handles basis rotations and statistical analysis internally, making it the preferred approach for variational algorithms like VQE.

## Statistical Considerations

The uncertainty in measured probabilities scales as:

$$
\Delta p \approx \frac{1}{\sqrt{N_{\text{shots}}}}
$$

For 1024 shots, the statistical error is about 3%. For 1% precision, use ~10,000 shots.

## Key Takeaways

- Measurement in Qiskit uses `measure()` to map quantum states to classical bits
- Partial measurements collapse only the measured subsystem
- Mid-circuit measurements with `if_test` enable adaptive quantum circuits
- Measuring in X or Y basis requires basis rotation gates before Z-measurement
- The `Estimator` primitive efficiently computes expectation values for observables
- Statistical precision improves as $1/\sqrt{N}$ with the number of shots

## Try It Yourself

1. Create a 3-qubit GHZ state and verify $\langle ZZZ \rangle = 1$ using the Estimator
2. Implement quantum teleportation using mid-circuit measurements and classical conditioning
3. Prepare the state $\cos(\pi/8)|0\rangle + \sin(\pi/8)|1\rangle$ and measure $\langle X \rangle$, $\langle Y \rangle$, $\langle Z \rangle$ — verify they match the Bloch sphere coordinates
4. Compare measurement uncertainty for 100, 1000, and 10000 shots on a $|+\rangle$ state

---

*Next lesson: [Introduction to Cirq](./42-qc-intro-cirq.md)*
