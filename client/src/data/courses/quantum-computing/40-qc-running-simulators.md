---
title: "Running on Simulators"
---

# Running on Simulators

Before running on real quantum hardware, simulators let you test circuits, debug algorithms, and study the effects of noise — all on your classical computer. Qiskit provides multiple simulation backends ranging from exact statevector computation to realistic noisy simulation.

## Why Simulate?

Simulators serve several critical purposes:

- **Debugging** — verify circuit logic without hardware queue times
- **Benchmarking** — compare ideal vs. noisy results
- **Noise study** — understand how real-device errors affect your algorithm
- **Development** — iterate quickly on algorithm design
- **Education** — inspect full quantum states (impossible on real hardware)

The trade-off: simulating $n$ qubits requires $2^n$ complex amplitudes, so classical simulation is limited to ~30-40 qubits.

## Statevector Simulation (Exact)

The `Statevector` class provides exact noiseless simulation:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Build a circuit
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)  # GHZ state

# Get exact statevector
sv = Statevector.from_instruction(qc)

# Inspect amplitudes
print(sv.data)
# [0.707+0j, 0, 0, 0, 0, 0, 0, 0.707+0j]

# Probability dictionary
probs = sv.probabilities_dict()
print(probs)  # {'000': 0.5, '111': 0.5}

# Measure (collapse the state)
outcome, collapsed_sv = sv.measure([0, 1, 2])
print(f"Measured: {outcome}")

# Fidelity between states
from qiskit.quantum_info import state_fidelity
target = Statevector([1/np.sqrt(2), 0, 0, 0, 0, 0, 0, 1/np.sqrt(2)])
fid = state_fidelity(sv, target)
print(f"Fidelity: {fid:.6f}")  # 1.000000
```

The GHZ state we created is:

$$
|\text{GHZ}\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)
$$

## StatevectorSampler (Shot-Based Sampling)

The `StatevectorSampler` simulates measurement by sampling from the exact probability distribution:

```python
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.measure([0, 1, 2], [0, 1, 2])

# Sample with different shot counts
sampler = StatevectorSampler()

for shots in [100, 1000, 10000]:
    job = sampler.run([qc], shots=shots)
    result = job.result()
    counts = result[0].data.c.get_counts()
    
    p_000 = counts.get('000', 0) / shots
    p_111 = counts.get('111', 0) / shots
    print(f"Shots={shots:>5}: P(000)={p_000:.3f}, P(111)={p_111:.3f}")

# Output (approximate):
# Shots=  100: P(000)=0.480, P(111)=0.520
# Shots= 1000: P(000)=0.507, P(111)=0.493
# Shots=10000: P(000)=0.501, P(111)=0.499
```

The statistical uncertainty in probability estimates scales as:

$$
\Delta p \approx \sqrt{\frac{p(1-p)}{N_{\text{shots}}}}
$$

For $p = 0.5$ and 1024 shots: $\Delta p \approx 0.016$.

## StatevectorEstimator (Expectation Values)

For computing $\langle O \rangle = \langle\psi|O|\psi\rangle$:

```python
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

# Prepare GHZ state
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

# Define observables
observables = [
    SparsePauliOp('ZZZ'),     # All-Z correlator
    SparsePauliOp('XXX'),     # All-X correlator
    SparsePauliOp('ZZI'),     # Partial Z correlation
    SparsePauliOp('IZZ'),     # Another partial
]

estimator = StatevectorEstimator()

for obs in observables:
    job = estimator.run([(qc, obs)])
    result = job.result()
    ev = result[0].data.evs
    print(f"⟨{obs.paulis[0]}⟩ = {ev:.4f}")

# Output:
# ⟨ZZZ⟩ = 1.0000  (perfect correlation)
# ⟨XXX⟩ = 1.0000  (GHZ property)
# ⟨ZZI⟩ = 1.0000  
# ⟨IZZ⟩ = 1.0000
```

## Qiskit Aer: Advanced Simulation

Qiskit Aer provides high-performance simulators with noise model support:

```python
from qiskit_aer import AerSimulator

# Basic Aer usage (statevector method)
sim = AerSimulator(method='statevector')

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.measure_all()

result = sim.run(qc, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'000': ~512, '111': ~512}
```

### Aer Simulation Methods

| Method | Description | Max Qubits |
|--------|-------------|------------|
| `statevector` | Full state simulation | ~30 |
| `density_matrix` | Mixed state simulation | ~15 |
| `matrix_product_state` | MPS for weakly entangled states | ~100+ |
| `stabilizer` | Clifford circuits only | ~1000+ |
| `extended_stabilizer` | Near-Clifford circuits | ~60 |
| `automatic` | Auto-selects best method | varies |

```python
# Matrix Product State for large circuits
mps_sim = AerSimulator(method='matrix_product_state')

# Stabilizer for Clifford circuits (extremely fast)
stab_sim = AerSimulator(method='stabilizer')

# Density matrix for noise simulation
dm_sim = AerSimulator(method='density_matrix')
```

## Noise Models

Real quantum computers have errors. Aer lets you simulate these:

```python
from qiskit_aer.noise import (
    NoiseModel, depolarizing_error, thermal_relaxation_error,
    ReadoutError
)

# Build a custom noise model
noise_model = NoiseModel()

# Depolarizing error on single-qubit gates
# Probability p of error after each gate
p_single = 0.001  # 0.1% error rate
error_1q = depolarizing_error(p_single, 1)
noise_model.add_all_qubit_quantum_error(error_1q, ['h', 'x', 'y', 'z', 's', 't'])

# Depolarizing error on two-qubit gates (typically 10x worse)
p_two = 0.01  # 1% error rate
error_2q = depolarizing_error(p_two, 2)
noise_model.add_all_qubit_quantum_error(error_2q, ['cx', 'cz'])

# Measurement (readout) error
p_meas = 0.02  # 2% readout error
read_err = ReadoutError([[1 - p_meas, p_meas], [p_meas, 1 - p_meas]])
noise_model.add_all_qubit_readout_error(read_err)

print(noise_model)
```

### Running with Noise

```python
# Simulate with noise
noisy_sim = AerSimulator(noise_model=noise_model)

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.measure([0, 1, 2], [0, 1, 2])

# Ideal simulation
ideal_sim = AerSimulator()
ideal_counts = ideal_sim.run(qc, shots=10000).result().get_counts()

# Noisy simulation
noisy_counts = noisy_sim.run(qc, shots=10000).result().get_counts()

print("Ideal:", {k: v for k, v in sorted(ideal_counts.items())})
print("Noisy:", {k: v for k, v in sorted(noisy_counts.items())})

# Ideal: {'000': 5000, '111': 5000}
# Noisy: {'000': 4750, '001': 45, '010': 50, '011': 30, 
#          '100': 55, '101': 35, '110': 40, '111': 4695}
```

### Thermal Relaxation (T1/T2 Noise)

```python
# Realistic T1/T2 noise (energy relaxation and dephasing)
t1 = 50e3    # T1 = 50 microseconds
t2 = 30e3    # T2 = 30 microseconds (T2 ≤ 2*T1)
gate_time_1q = 50   # 50 ns for single-qubit gates
gate_time_2q = 300  # 300 ns for two-qubit gates

# Create thermal relaxation errors
thermal_1q = thermal_relaxation_error(t1, t2, gate_time_1q)
thermal_2q = thermal_relaxation_error(t1, t2, gate_time_2q).tensor(
    thermal_relaxation_error(t1, t2, gate_time_2q)
)

realistic_noise = NoiseModel()
realistic_noise.add_all_qubit_quantum_error(thermal_1q, ['h', 'x', 'rx', 'ry', 'rz'])
realistic_noise.add_all_qubit_quantum_error(thermal_2q, ['cx'])
```

The thermal relaxation channel models:
- **$T_1$ decay**: excited state $|1\rangle$ decays to $|0\rangle$ with rate $1/T_1$
- **$T_2$ dephasing**: coherence decays with rate $1/T_2$ (always $T_2 \leq 2T_1$)

## Visualization of Results

```python
from qiskit.visualization import plot_histogram, plot_state_city
from qiskit.quantum_info import DensityMatrix

# Compare ideal vs noisy with histogram
from qiskit.visualization import plot_histogram
fig = plot_histogram(
    [ideal_counts, noisy_counts],
    legend=['Ideal', 'Noisy'],
    title='GHZ State: Ideal vs Noisy',
    figsize=(10, 5)
)
fig.savefig('comparison.png', dpi=150)

# Visualize the density matrix
qc_no_meas = QuantumCircuit(3)
qc_no_meas.h(0)
qc_no_meas.cx(0, 1)
qc_no_meas.cx(1, 2)

# Ideal density matrix
dm_ideal = DensityMatrix.from_instruction(qc_no_meas)

# Noisy density matrix via density_matrix simulator
dm_sim = AerSimulator(method='density_matrix', noise_model=noise_model)
qc_save = qc_no_meas.copy()
qc_save.save_density_matrix()
result = dm_sim.run(qc_save).result()
dm_noisy = result.data()['density_matrix']

# City plot (3D bar chart of density matrix)
plot_state_city(dm_ideal, title='Ideal GHZ')
```

## Practical Simulation Workflow

A typical development workflow:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit.primitives import StatevectorSampler
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

def simulation_workflow(qc_parametric, params, shots=4096):
    """Complete simulation workflow: ideal → noisy → analysis."""
    
    # 1. Bind parameters
    qc = qc_parametric.assign_parameters(params)
    
    # 2. Ideal statevector (ground truth)
    qc_no_meas = qc.remove_final_measurements(inplace=False)
    sv_ideal = Statevector.from_instruction(qc_no_meas)
    
    # 3. Ideal sampling
    sampler = StatevectorSampler()
    job = sampler.run([qc], shots=shots)
    ideal_counts = job.result()[0].data.c.get_counts()
    
    # 4. Noisy simulation
    noise = NoiseModel()
    noise.add_all_qubit_quantum_error(depolarizing_error(0.005, 1), ['h', 'x', 'rx', 'ry'])
    noise.add_all_qubit_quantum_error(depolarizing_error(0.02, 2), ['cx'])
    
    noisy_sim = AerSimulator(noise_model=noise)
    noisy_counts = noisy_sim.run(qc, shots=shots).result().get_counts()
    
    # 5. Compute fidelity metrics
    print(f"Ideal probabilities: {sv_ideal.probabilities_dict()}")
    print(f"Ideal counts: {ideal_counts}")
    print(f"Noisy counts: {noisy_counts}")
    
    return ideal_counts, noisy_counts
```

## Choosing the Right Simulator

| Scenario | Recommended Approach |
|----------|---------------------|
| Debug small circuit (< 20 qubits) | `Statevector` |
| Sample measurement outcomes | `StatevectorSampler` |
| Compute expectation values | `StatevectorEstimator` |
| Study noise effects | `AerSimulator` + `NoiseModel` |
| Large weakly-entangled circuits | `AerSimulator(method='mps')` |
| Clifford-only circuits | `AerSimulator(method='stabilizer')` |
| Mixed-state evolution | `AerSimulator(method='density_matrix')` |

## Performance Tips

```python
# 1. Use GPU acceleration (if available)
gpu_sim = AerSimulator(method='statevector', device='GPU')

# 2. Set thread count for parallel simulation
sim = AerSimulator(
    method='statevector',
    max_parallel_threads=8
)

# 3. Batch multiple circuits in one job
circuits = [make_circuit(theta) for theta in np.linspace(0, np.pi, 50)]
result = sim.run(circuits, shots=1024).result()

# 4. Use snapshot for intermediate states (avoids re-simulation)
from qiskit_aer.library import save_statevector
qc = QuantumCircuit(2)
qc.h(0)
qc.save_statevector(label='after_h')
qc.cx(0, 1)
qc.save_statevector(label='after_cx')
result = AerSimulator().run(qc).result()
sv_after_h = result.data()['after_h']
sv_after_cx = result.data()['after_cx']
```

## Key Takeaways

- **Statevector simulation** gives exact results but scales as $O(2^n)$ in memory — practical up to ~30 qubits
- **StatevectorSampler** samples from exact probabilities, introducing only shot noise (no gate errors)
- **Qiskit Aer** provides multiple simulation methods optimized for different circuit types
- **Noise models** let you study realistic device behaviour: depolarizing errors, thermal relaxation ($T_1$, $T_2$), and readout errors
- Shot noise uncertainty: $\Delta p \approx \sqrt{p(1-p)/N_{\text{shots}}}$ — use more shots for higher precision
- Always compare ideal and noisy simulations to understand how errors affect your algorithm before running on hardware

## Try It Yourself

1. Simulate a 5-qubit GHZ state with the `StatevectorSampler`. Plot the histogram and verify only `00000` and `11111` appear.
2. Add depolarizing noise with $p = 0.01$ on CX gates. How does the fidelity of the GHZ state degrade as you increase from 3 to 8 qubits?
3. Create a noise model with $T_1 = 100\mu s$, $T_2 = 50\mu s$ and study how circuit depth affects output quality for a simple Grover circuit.
4. Use the `density_matrix` method to simulate a single qubit under amplitude damping. Plot the Bloch vector trajectory as the damping parameter increases from 0 to 1.
5. Compare `statevector` and `matrix_product_state` methods for a 20-qubit circuit with only nearest-neighbour CX gates. Which is faster?

---

**Next Lesson:** [Quantum Measurements in Code](41-qc-quantum-measurements-code.md)
