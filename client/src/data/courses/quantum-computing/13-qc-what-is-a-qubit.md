---
title: "What is a Qubit?"
---

# What is a Qubit?

A **qubit** (quantum bit) is the fundamental unit of quantum information — the quantum analogue of a classical bit. While a classical bit can be either 0 or 1, a qubit can exist in a **superposition** of both states simultaneously. This simple difference is what gives quantum computers their extraordinary power.

---

## Classical Bits vs Qubits

### Classical Bit

A classical bit is like a light switch — it's either OFF (0) or ON (1). That's it. No in-between.

| Property | Classical Bit | Qubit |
|---|---|---|
| States | 0 or 1 | Superposition of 0 and 1 |
| Information | 1 bit | Infinite possibilities (but 1 bit when measured) |
| Copying | Freely copied | Cannot be cloned (no-cloning theorem) |
| Measurement | Non-destructive | Collapses the state |
| Representation | Voltage level, magnetic domain | Quantum system (atom, photon, etc.) |

### Qubit

A qubit's state is described by a vector in a two-dimensional complex vector space:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

Where:
- $|0\rangle$ and $|1\rangle$ are the **computational basis states** (analogous to 0 and 1)
- $\alpha$ and $\beta$ are **complex numbers** called probability amplitudes
- $|\alpha|^2$ = probability of measuring 0
- $|\beta|^2$ = probability of measuring 1

---

## The Normalization Constraint

Since probabilities must sum to 1, the amplitudes must satisfy:

$$|\alpha|^2 + |\beta|^2 = 1$$

This is the **normalization condition**. It ensures that when we measure the qubit, we get *some* result with certainty.

### Examples of Valid Qubit States

$$|0\rangle = 1|0\rangle + 0|1\rangle \quad (\alpha = 1, \beta = 0)$$

$$|1\rangle = 0|0\rangle + 1|1\rangle \quad (\alpha = 0, \beta = 1)$$

$$|+\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle \quad (\alpha = \beta = \frac{1}{\sqrt{2}})$$

$$|-\rangle = \frac{1}{\sqrt{2}}|0\rangle - \frac{1}{\sqrt{2}}|1\rangle \quad (\alpha = \frac{1}{\sqrt{2}}, \beta = -\frac{1}{\sqrt{2}})$$

All satisfy $|\alpha|^2 + |\beta|^2 = 1$. Let's verify for $|+\rangle$:

$$\left|\frac{1}{\sqrt{2}}\right|^2 + \left|\frac{1}{\sqrt{2}}\right|^2 = \frac{1}{2} + \frac{1}{2} = 1 \checkmark$$

---

## Dirac Notation (Bra-Ket)

We write qubit states in **Dirac notation**:

- $|0\rangle$ = "ket zero" = column vector $\begin{pmatrix} 1 \\ 0 \end{pmatrix}$
- $|1\rangle$ = "ket one" = column vector $\begin{pmatrix} 0 \\ 1 \end{pmatrix}$
- $|\psi\rangle$ = "ket psi" = general state = $\begin{pmatrix} \alpha \\ \beta \end{pmatrix}$

The "bra" $\langle\psi|$ is the conjugate transpose: $\langle\psi| = (\alpha^*, \beta^*)$

The **inner product** $\langle\phi|\psi\rangle$ gives the overlap between two states (useful for calculating probabilities and checking orthogonality).

---

## What Makes Qubits Powerful?

### 1. Superposition

A single qubit can be in a state like $\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$, encoding information about *both* 0 and 1 simultaneously. With $n$ qubits, you can represent $2^n$ states simultaneously:

- 1 qubit: 2 states
- 10 qubits: 1,024 states
- 50 qubits: ~$10^{15}$ states
- 300 qubits: more states than atoms in the observable universe!

### 2. Entanglement

Two qubits can be **entangled** — their states become correlated in ways that have no classical explanation. Measuring one instantly determines the other, regardless of distance.

### 3. Interference

Quantum algorithms work by arranging for wrong answers to destructively interfere (cancel out) and correct answers to constructively interfere (add up).

---

## Physical Implementations of Qubits

### Superconducting Qubits (Google, IBM)

- **How it works:** A tiny superconducting circuit with a Josephson junction behaves as a quantum two-level system
- **Pros:** Fast gate operations (~10-100 ns), scalable with lithography
- **Cons:** Requires extreme cooling (~15 mK), short coherence times (~100 μs)
- **Used by:** Google (Sycamore), IBM (Eagle/Heron)

### Trapped Ions (IonQ, Quantinuum)

- **How it works:** Individual ions held in electromagnetic traps; qubit encoded in two electronic energy levels
- **Pros:** Long coherence times (~seconds), high gate fidelity (>99.9%)
- **Cons:** Slower gate operations (~μs), scaling challenges
- **Used by:** IonQ, Quantinuum (Honeywell)

### Photonic Qubits (Xanadu, PsiQuantum)

- **How it works:** Qubit encoded in properties of single photons (polarization, path, time-bin)
- **Pros:** Room temperature operation, natural for communication
- **Cons:** Hard to create deterministic photon-photon interactions
- **Used by:** Xanadu, PsiQuantum

### Topological Qubits (Microsoft)

- **How it works:** Qubit encoded in non-local properties of exotic quasiparticles (Majorana fermions)
- **Pros:** Theoretically very robust against errors
- **Cons:** Extremely challenging to build; still largely experimental
- **Used by:** Microsoft (Station Q)

### Comparison Table

| Type | Gate Speed | Coherence Time | Fidelity | Temperature |
|---|---|---|---|---|
| Superconducting | ~20 ns | ~100 μs | ~99.5% | 15 mK |
| Trapped Ion | ~1 μs | ~10 s | ~99.9% | Room (with vacuum) |
| Photonic | ~1 ns | Long (photon loss is issue) | ~99% | Room temp |
| Topological | TBD | Theoretically long | Theoretically high | ~20 mK |

---

## Qiskit Code: Creating and Inspecting Qubit States

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Create a single qubit in various states

# State 1: |0⟩ (default state)
qc0 = QuantumCircuit(1)
state0 = Statevector.from_instruction(qc0)
print("State |0⟩:")
print(f"  Statevector: {state0}")
print(f"  Probabilities: {state0.probabilities()}")
print()

# State 2: |1⟩ (apply X gate to flip)
qc1 = QuantumCircuit(1)
qc1.x(0)  # Pauli-X gate (NOT gate)
state1 = Statevector.from_instruction(qc1)
print("State |1⟩:")
print(f"  Statevector: {state1}")
print(f"  Probabilities: {state1.probabilities()}")
print()

# State 3: |+⟩ = (|0⟩ + |1⟩)/√2 (apply Hadamard)
qc_plus = QuantumCircuit(1)
qc_plus.h(0)  # Hadamard gate
state_plus = Statevector.from_instruction(qc_plus)
print("State |+⟩ = (|0⟩ + |1⟩)/√2:")
print(f"  Statevector: {state_plus}")
print(f"  Probabilities: {state_plus.probabilities()}")
print()

# State 4: |-⟩ = (|0⟩ - |1⟩)/√2 
qc_minus = QuantumCircuit(1)
qc_minus.x(0)  # First flip to |1⟩
qc_minus.h(0)  # Then Hadamard
state_minus = Statevector.from_instruction(qc_minus)
print("State |-⟩ = (|0⟩ - |1⟩)/√2:")
print(f"  Statevector: {state_minus}")
print(f"  Probabilities: {state_minus.probabilities()}")
print()

# State 5: Custom state |ψ⟩ = cos(π/8)|0⟩ + sin(π/8)|1⟩
qc_custom = QuantumCircuit(1)
theta = np.pi / 4  # Rotation angle (gives cos(π/8), sin(π/8))
qc_custom.ry(theta, 0)  # Ry rotation
state_custom = Statevector.from_instruction(qc_custom)
print(f"Custom state |ψ⟩ (θ = π/4):")
print(f"  Statevector: {state_custom}")
print(f"  Probabilities: {state_custom.probabilities()}")
print(f"  P(0) = cos²(π/8) ≈ {np.cos(np.pi/8)**2:.4f}")
print(f"  P(1) = sin²(π/8) ≈ {np.sin(np.pi/8)**2:.4f}")
print()

# Verify normalization for all states
print("Normalization check (should all be 1.0):")
for name, state in [("  |0⟩", state0), ("  |1⟩", state1), 
                     ("  |+⟩", state_plus), ("  |-⟩", state_minus),
                     ("  custom", state_custom)]:
    probs = state.probabilities()
    print(f"{name}: sum of probabilities = {sum(probs):.6f}")
```

---

## Measurement: The Catch

When you **measure** a qubit in state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$:

- You get result **0** with probability $|\alpha|^2$
- You get result **1** with probability $|\beta|^2$
- The state **collapses** to whichever result you observed
- **You cannot determine $\alpha$ and $\beta$ from a single measurement**

This is why quantum algorithms are probabilistic and why we often need to run them multiple times to get statistically meaningful results.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create a qubit in superposition and measure it many times
qc = QuantumCircuit(1, 1)
qc.h(0)           # Put in |+⟩ state
qc.measure(0, 0)  # Measure

# Run 1000 times to see the probability distribution
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()
counts = result[0].data.c.get_counts()
print(f"Results of measuring |+⟩ state 1000 times:")
print(f"  Got '0': {counts.get('0', 0)} times ({counts.get('0', 0)/10:.1f}%)")
print(f"  Got '1': {counts.get('1', 0)} times ({counts.get('1', 0)/10:.1f}%)")
print(f"  Expected: ~50% each")
```

---

## Key Takeaways

1. **A qubit** is the quantum analogue of a classical bit, described by $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$.
2. **Normalization:** The amplitudes must satisfy $|\alpha|^2 + |\beta|^2 = 1$.
3. **Superposition** allows a qubit to encode information about both 0 and 1 simultaneously.
4. **Measurement** collapses the superposition — you get 0 with probability $|\alpha|^2$ or 1 with probability $|\beta|^2$.
5. **Physical implementations** include superconducting circuits, trapped ions, photons, and topological systems.
6. **No-cloning theorem** prevents copying unknown quantum states — a fundamental difference from classical bits.
7. **Qiskit** lets you create, manipulate, and simulate qubit states on your classical computer.

---

## Try It Yourself

1. **Calculate:** A qubit is in state $|\psi\rangle = \frac{1+i}{2}|0\rangle + \frac{1-i}{2}|1\rangle$. Verify it's normalized and find the measurement probabilities.

2. **Code:** Use Qiskit to create a qubit in the state $|\psi\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$ using the $R_y$ gate. Run 10,000 shots and verify the measurement statistics match the expected probabilities (75% for 0, 25% for 1).

3. **Think:** Why can't we just measure a qubit multiple times to determine $\alpha$ and $\beta$ exactly? (Hint: what happens to the state after the first measurement?)

4. **Explore:** Look up the current qubit counts for IBM's latest quantum processor. How many classical states could that many qubits represent in superposition?

---

## Next Lesson

Now that you know what a qubit is mathematically, we need a way to **visualize** it. In the next lesson, [Bloch Sphere Representation](14-qc-bloch-sphere), we'll learn how any single-qubit state can be represented as a point on a beautiful 3D sphere — and how quantum gates correspond to rotations on that sphere!
