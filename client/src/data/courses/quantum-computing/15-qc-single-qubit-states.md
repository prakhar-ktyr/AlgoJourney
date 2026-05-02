---
title: "Single Qubit States"
---

# Single Qubit States

Now that we understand qubits and the Bloch sphere, let's take a detailed look at the most important single-qubit states, their properties, and how to prepare them. These states form the foundation for all quantum algorithms.

---

## The Computational Basis States

The **computational basis** (also called the Z-basis or standard basis) consists of:

### $|0\rangle$ — The "Zero" State

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$$

- Bloch sphere: North pole $(\theta = 0)$
- Measurement in Z-basis: always gives 0
- Physical meaning: ground state / lower energy level
- This is the **default initial state** of qubits in most quantum computers

### $|1\rangle$ — The "One" State

$$|1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

- Bloch sphere: South pole $(\theta = \pi)$
- Measurement in Z-basis: always gives 1
- Physical meaning: excited state / higher energy level
- Created from $|0\rangle$ by applying the $X$ (NOT) gate

### Properties of the Computational Basis

1. **Orthogonality**: $\langle 0|1\rangle = 0$ — they are perpendicular in Hilbert space
2. **Completeness**: Any state can be written as $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$
3. **Normalization**: $\langle 0|0\rangle = 1$ and $\langle 1|1\rangle = 1$

Together, $\{|0\rangle, |1\rangle\}$ form a **complete orthonormal basis** for the qubit Hilbert space.

---

## The Hadamard Basis States (X-Basis)

The **Hadamard basis** (or X-basis, or plus/minus basis) is equally important:

### $|+\rangle$ — The "Plus" State

$$|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix}$$

- Bloch sphere: +X axis (equator, $\theta = \pi/2, \phi = 0$)
- Measurement in Z-basis: 50% chance of 0, 50% chance of 1
- Measurement in X-basis: always gives +
- Created from $|0\rangle$ by applying the Hadamard gate $H$

### $|-\rangle$ — The "Minus" State

$$|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle) = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix}$$

- Bloch sphere: -X axis (equator, $\theta = \pi/2, \phi = \pi$)
- Measurement in Z-basis: 50% chance of 0, 50% chance of 1
- Measurement in X-basis: always gives -
- Created from $|1\rangle$ by applying $H$, or from $|0\rangle$ by $H$ then $Z$

### Key Insight: Same Probabilities, Different States!

Both $|+\rangle$ and $|-\rangle$ give 50/50 results in the Z-basis. But they are **completely different states** — they differ in **relative phase**:

- $|+\rangle$: the amplitudes of $|0\rangle$ and $|1\rangle$ have the **same sign** (+1, +1)
- $|-\rangle$: the amplitudes have **opposite signs** (+1, -1)

This phase difference is invisible in Z-measurements but reveals itself in X-measurements or through interference.

---

## The Circular Basis States (Y-Basis)

### $|+i\rangle$ — The "Right Circular" State

$$|+i\rangle = \frac{1}{\sqrt{2}}(|0\rangle + i|1\rangle) = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ i \end{pmatrix}$$

- Bloch sphere: +Y axis ($\theta = \pi/2, \phi = \pi/2$)
- Also written as $|R\rangle$ or $|i\rangle$
- Created from $|0\rangle$ by $S$ then $H$, or $R_x(-\pi/2)|0\rangle$

### $|-i\rangle$ — The "Left Circular" State

$$|-i\rangle = \frac{1}{\sqrt{2}}(|0\rangle - i|1\rangle) = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -i \end{pmatrix}$$

- Bloch sphere: -Y axis ($\theta = \pi/2, \phi = 3\pi/2$)
- Also written as $|L\rangle$ or $|-i\rangle$
- Created from $|0\rangle$ by $S^\dagger$ then $H$, or $R_x(\pi/2)|0\rangle$

### Why "Circular"?

In optics, these correspond to right and left circular polarization. The complex phase $i$ means the "rotation direction" in the complex plane is different — like a helix twisting clockwise vs counterclockwise.

---

## The Three Mutually Unbiased Bases

The Z, X, and Y bases are **mutually unbiased** — measuring a state from one basis in a different basis gives completely random (50/50) results:

| State | Z-measurement | X-measurement | Y-measurement |
|-------|:---:|:---:|:---:|
| $\|0\rangle$ | Always 0 | Random | Random |
| $\|1\rangle$ | Always 1 | Random | Random |
| $\|+\rangle$ | Random | Always + | Random |
| $\|-\rangle$ | Random | Always - | Random |
| $\|+i\rangle$ | Random | Random | Always +i |
| $\|-i\rangle$ | Random | Random | Always -i |

This property is essential for **quantum key distribution** (BB84 protocol).

---

## Global Phase vs. Relative Phase

### Global Phase

A **global phase** $e^{i\gamma}$ multiplied to the entire state has **no observable effect**:

$$e^{i\gamma}|\psi\rangle = e^{i\gamma}(\alpha|0\rangle + \beta|1\rangle)$$

This state is physically identical to $|\psi\rangle$. All measurement probabilities are the same:

$$|e^{i\gamma}\alpha|^2 = |\alpha|^2, \quad |e^{i\gamma}\beta|^2 = |\beta|^2$$

**Example**: $|0\rangle$ and $-|0\rangle$ and $i|0\rangle$ are all the same physical state.

### Relative Phase

A **relative phase** between components **does** matter:

$$|\psi_1\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = |+\rangle$$

$$|\psi_2\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle) = |-\rangle$$

$$|\psi_3\rangle = \frac{1}{\sqrt{2}}(|0\rangle + i|1\rangle) = |+i\rangle$$

These are all **different** physical states! The relative phase ($+1$, $-1$, $+i$) determines:
- Where the state sits on the Bloch sphere equator
- Outcomes of X and Y measurements
- How the state interferes with other states in algorithms

### The Rule

> Global phase = physically meaningless.  
> Relative phase = physically meaningful and crucial for quantum algorithms.

---

## State Vectors and Inner Products

### The Inner Product (Bra-Ket)

The **bra** $\langle\psi|$ is the conjugate transpose of the ket $|\psi\rangle$:

$$|\psi\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix} \implies \langle\psi| = (\alpha^*, \beta^*)$$

The **inner product** $\langle\phi|\psi\rangle$ is:

$$\langle\phi|\psi\rangle = (\alpha_\phi^*, \beta_\phi^*) \begin{pmatrix} \alpha_\psi \\ \beta_\psi \end{pmatrix} = \alpha_\phi^*\alpha_\psi + \beta_\phi^*\beta_\psi$$

### What Inner Products Tell Us

- $|\langle\phi|\psi\rangle|^2$ = probability of measuring state $|\psi\rangle$ and finding it in state $|\phi\rangle$
- $\langle\phi|\psi\rangle = 0$ means the states are **orthogonal** (perfectly distinguishable)
- $|\langle\phi|\psi\rangle| = 1$ means the states are the same (up to global phase)

### Examples

$$\langle 0|+\rangle = (1, 0) \begin{pmatrix} 1/\sqrt{2} \\ 1/\sqrt{2} \end{pmatrix} = \frac{1}{\sqrt{2}}$$

Probability: $|\langle 0|+\rangle|^2 = 1/2$ — measuring $|+\rangle$ in Z-basis gives $|0\rangle$ with 50% probability. ✓

$$\langle +|-\rangle = \frac{1}{2}(1, 1)\begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{1}{2}(1 - 1) = 0$$

$|+\rangle$ and $|-\rangle$ are orthogonal — perfectly distinguishable in the X-basis. ✓

---

## Orthogonality and Completeness

### Orthogonality

Two states $|\psi\rangle$ and $|\phi\rangle$ are **orthogonal** if $\langle\phi|\psi\rangle = 0$.

Orthogonal states are:
- Perfectly distinguishable by some measurement
- Diametrically opposite on the Bloch sphere
- Like perpendicular axes in ordinary geometry

### Completeness (Resolution of Identity)

A complete orthonormal basis $\{|b_0\rangle, |b_1\rangle\}$ satisfies:

$$|b_0\rangle\langle b_0| + |b_1\rangle\langle b_1| = I$$

This means any state can be decomposed in this basis. For the computational basis:

$$|0\rangle\langle 0| + |1\rangle\langle 1| = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix} + \begin{pmatrix} 0 & 0 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix} = I \quad ✓$$

---

## Qiskit: Preparing and Visualizing States

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def print_state_info(name, state):
    """Print detailed information about a qubit state."""
    alpha, beta = state.data[0], state.data[1]
    
    # Bloch coordinates
    rx = 2 * np.real(alpha * np.conj(beta))
    ry = 2 * np.imag(alpha * np.conj(beta))
    rz = np.abs(alpha)**2 - np.abs(beta)**2
    
    # Bloch angles
    theta = np.arccos(np.clip(rz, -1, 1))
    phi = np.arctan2(ry, rx)
    if phi < 0:
        phi += 2 * np.pi
    
    print(f"\n{'='*50}")
    print(f"State: {name}")
    print(f"{'='*50}")
    print(f"  Vector: [{alpha:.4f}, {beta:.4f}]")
    print(f"  P(0) = {np.abs(alpha)**2:.4f}, P(1) = {np.abs(beta)**2:.4f}")
    print(f"  Bloch: ({rx:+.4f}, {ry:+.4f}, {rz:+.4f})")
    print(f"  Angles: θ = {theta:.4f} ({np.degrees(theta):.1f}°), "
          f"φ = {phi:.4f} ({np.degrees(phi):.1f}°)")

# Prepare all six cardinal states
# |0⟩
qc0 = QuantumCircuit(1)
print_state_info("|0⟩", Statevector.from_instruction(qc0))

# |1⟩
qc1 = QuantumCircuit(1)
qc1.x(0)
print_state_info("|1⟩", Statevector.from_instruction(qc1))

# |+⟩
qc_plus = QuantumCircuit(1)
qc_plus.h(0)
print_state_info("|+⟩", Statevector.from_instruction(qc_plus))

# |-⟩
qc_minus = QuantumCircuit(1)
qc_minus.x(0)
qc_minus.h(0)
print_state_info("|-⟩", Statevector.from_instruction(qc_minus))

# |+i⟩
qc_pi = QuantumCircuit(1)
qc_pi.h(0)
qc_pi.s(0)
print_state_info("|+i⟩", Statevector.from_instruction(qc_pi))

# |-i⟩
qc_mi = QuantumCircuit(1)
qc_mi.h(0)
qc_mi.sdg(0)
print_state_info("|-i⟩", Statevector.from_instruction(qc_mi))
```

### Computing Inner Products

```python
from qiskit.quantum_info import Statevector
import numpy as np

# Define states
zero = Statevector([1, 0])
one = Statevector([0, 1])
plus = Statevector([1/np.sqrt(2), 1/np.sqrt(2)])
minus = Statevector([1/np.sqrt(2), -1/np.sqrt(2)])
plus_i = Statevector([1/np.sqrt(2), 1j/np.sqrt(2)])
minus_i = Statevector([1/np.sqrt(2), -1j/np.sqrt(2)])

states = {
    "|0⟩": zero, "|1⟩": one,
    "|+⟩": plus, "|-⟩": minus,
    "|+i⟩": plus_i, "|-i⟩": minus_i
}

# Compute inner products between all pairs
print("Inner Products ⟨φ|ψ⟩:")
print("=" * 60)
print(f"{'':8}", end="")
for name in states:
    print(f"{name:>9}", end="")
print()

for name1, state1 in states.items():
    print(f"{name1:8}", end="")
    for name2, state2 in states.items():
        # Inner product: ⟨state1|state2⟩
        inner = np.vdot(state1.data, state2.data)
        if np.abs(inner) < 1e-10:
            print(f"{'0':>9}", end="")
        elif np.isclose(np.abs(inner), 1):
            print(f"{'1':>9}", end="")
        else:
            print(f"{inner:>9.4f}", end="")
    print()

print("\nOrthogonal pairs (inner product = 0):")
print("  |0⟩ ⊥ |1⟩")
print("  |+⟩ ⊥ |-⟩")
print("  |+i⟩ ⊥ |-i⟩")
```

### Preparing an Arbitrary State

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def prepare_state(theta, phi):
    """
    Prepare state |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
    using Ry and Rz gates.
    """
    qc = QuantumCircuit(1)
    qc.ry(theta, 0)   # Set the polar angle
    qc.rz(phi, 0)     # Set the azimuthal angle
    return qc

# Example: prepare a state at θ=π/3, φ=π/4
theta = np.pi / 3
phi = np.pi / 4

qc = prepare_state(theta, phi)
state = Statevector.from_instruction(qc)

print(f"Target: θ = π/3, φ = π/4")
print(f"Expected: cos(π/6)|0⟩ + e^(iπ/4)sin(π/6)|1⟩")
print(f"        = {np.cos(np.pi/6):.4f}|0⟩ + {np.exp(1j*np.pi/4)*np.sin(np.pi/6):.4f}|1⟩")
print(f"Got:      {state.data[0]:.4f}|0⟩ + {state.data[1]:.4f}|1⟩")
print(f"P(0) = {np.abs(state.data[0])**2:.4f} (expected {np.cos(theta/2)**2:.4f})")
print(f"P(1) = {np.abs(state.data[1])**2:.4f} (expected {np.sin(theta/2)**2:.4f})")
```

---

## Summary: The Six Cardinal States

```
         |0⟩ = (1, 0)ᵀ
          ↑  Z-basis
          |
 |-⟩ -----.------ |+⟩     X-basis
(1,-1)/√2 |    (1,1)/√2
          |
          ↓
         |1⟩ = (0, 1)ᵀ

     Y-basis (perpendicular to page):
     |+i⟩ = (1, i)/√2   (out of page)
     |-i⟩ = (1, -i)/√2  (into page)
```

Each pair is orthogonal. Each basis gives different information about the qubit state.

---

## Key Takeaways

1. **Computational basis** ($|0\rangle$, $|1\rangle$): eigenstates of $Z$, the default measurement basis.
2. **Hadamard basis** ($|+\rangle$, $|-\rangle$): eigenstates of $X$, equal superpositions with real amplitudes.
3. **Circular basis** ($|+i\rangle$, $|-i\rangle$): eigenstates of $Y$, equal superpositions with imaginary phase.
4. **Global phase** is unobservable; **relative phase** is physically meaningful and determines interference.
5. **Inner products** quantify distinguishability: $\langle\phi|\psi\rangle = 0$ means perfectly distinguishable.
6. **Completeness** ensures any state can be expanded in any basis.
7. The three bases are **mutually unbiased** — certainty in one means complete randomness in the others.

---

## Try It Yourself

1. Compute the inner product $\langle +i|-\rangle$. Are these states orthogonal?

2. Write the state $|+\rangle$ in the Y-basis (express it as a combination of $|+i\rangle$ and $|-i\rangle$).

3. Using Qiskit, create a circuit that prepares the state $|\psi\rangle = \frac{1}{2}|0\rangle + \frac{\sqrt{3}}{2}|1\rangle$ and verify by simulating 10,000 measurements.

4. If you apply a $Z$ gate to $|+\rangle$, what state do you get? Verify using the state vector and the Bloch sphere coordinates.

5. Prove mathematically that $\{|+\rangle, |-\rangle\}$ forms a complete orthonormal basis (show orthogonality and completeness).

---

## Next Lesson

In the next lesson, [Multi-Qubit Systems](16-qc-multi-qubit-systems), we'll extend everything to systems of two or more qubits, where the phenomenon of **entanglement** emerges — the key resource that makes quantum computing truly powerful.
