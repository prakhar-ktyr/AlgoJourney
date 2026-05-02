---
title: "Bloch Sphere Representation"
---

# Bloch Sphere Representation

The **Bloch sphere** is a geometric representation of a single qubit state. It maps the abstract mathematics of quantum states onto a tangible 3D sphere, making it much easier to visualize what quantum gates do. Every pure single-qubit state corresponds to a unique point on the surface of this sphere.

---

## Why Do We Need the Bloch Sphere?

A qubit state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ has two complex numbers ($\alpha, \beta$), meaning 4 real parameters. But:

1. **Normalization** ($|\alpha|^2 + |\beta|^2 = 1$) removes one parameter → 3 parameters
2. **Global phase** has no physical significance (states $|\psi\rangle$ and $e^{i\gamma}|\psi\rangle$ are physically identical) → 2 parameters

Two real parameters define a point on a sphere! That's the Bloch sphere.

---

## The Parameterization

Any single-qubit state can be written as:

$$|\psi\rangle = \cos\frac{\theta}{2}|0\rangle + e^{i\varphi}\sin\frac{\theta}{2}|1\rangle$$

Where:
- $\theta \in [0, \pi]$ is the **polar angle** (from the north pole)
- $\varphi \in [0, 2\pi)$ is the **azimuthal angle** (around the equator)

The Cartesian coordinates of the point on the Bloch sphere are:

$$x = \sin\theta\cos\varphi$$
$$y = \sin\theta\sin\varphi$$
$$z = \cos\theta$$

This point $(x, y, z)$ lies on the unit sphere ($x^2 + y^2 + z^2 = 1$) and is called the **Bloch vector**.

---

## ASCII Art: The Bloch Sphere

```
              z  |0⟩
              ↑  ●
              |  /|
              | / |
         -----●-----→ x  |+⟩
        /    /|    \
       /    / |     \
      ●----/--●------●
   |+i⟩  /   |    |-i⟩
         /    |
        /     ● |1⟩
       ←
       y  (into page for |-⟩)

    North pole: |0⟩  (θ=0)
    South pole: |1⟩  (θ=π)
    +x axis:   |+⟩  (θ=π/2, φ=0)
    -x axis:   |-⟩  (θ=π/2, φ=π)
    +y axis:   |+i⟩ (θ=π/2, φ=π/2)
    -y axis:   |-i⟩ (θ=π/2, φ=3π/2)
```

A more detailed view:

```
            |0⟩ = |↑⟩
             ●
            /|\
           / | \
          /  |  \
    |-⟩  /   |   \  |+⟩
    ●---/----●----\---●
    |  / θ ↗ |     \ |
    | /  ↗   |      \|
    |/ ↗     |       ●  |+i⟩
    ●--------●-------
   |-i⟩      |
             |
             ●
            |1⟩ = |↓⟩
    
    θ = polar angle from z-axis (0 to π)
    φ = azimuthal angle in xy-plane (0 to 2π)
```

---

## Special Points on the Bloch Sphere

### The Poles

| State | θ | φ | Bloch Vector | Description |
|---|---|---|---|---|
| $\|0\rangle$ | 0 | — | (0, 0, 1) | North pole |
| $\|1\rangle$ | π | — | (0, 0, -1) | South pole |

### The Equator (Equal Superpositions)

States on the equator have $\theta = \pi/2$, meaning equal probability of measuring 0 or 1:

| State | θ | φ | Bloch Vector | Expression |
|---|---|---|---|---|
| $\|+\rangle$ | π/2 | 0 | (1, 0, 0) | $\frac{1}{\sqrt{2}}(\|0\rangle + \|1\rangle)$ |
| $\|-\rangle$ | π/2 | π | (-1, 0, 0) | $\frac{1}{\sqrt{2}}(\|0\rangle - \|1\rangle)$ |
| $\|+i\rangle$ | π/2 | π/2 | (0, 1, 0) | $\frac{1}{\sqrt{2}}(\|0\rangle + i\|1\rangle)$ |
| $\|-i\rangle$ | π/2 | 3π/2 | (0, -1, 0) | $\frac{1}{\sqrt{2}}(\|0\rangle - i\|1\rangle)$ |

### Verification

Let's verify $|+\rangle$ with $\theta = \pi/2$, $\varphi = 0$:

$$|\psi\rangle = \cos\frac{\pi/2}{2}|0\rangle + e^{i \cdot 0}\sin\frac{\pi/2}{2}|1\rangle = \cos\frac{\pi}{4}|0\rangle + \sin\frac{\pi}{4}|1\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle \checkmark$$

---

## Quantum Gates as Rotations

This is where the Bloch sphere becomes incredibly powerful: **every single-qubit gate corresponds to a rotation of the Bloch sphere!**

### Pauli-X Gate (Bit Flip)

The X gate rotates the Bloch sphere by $\pi$ radians around the **x-axis**:

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$

- $|0\rangle \xrightarrow{X} |1\rangle$ (north pole → south pole)
- $|1\rangle \xrightarrow{X} |0\rangle$ (south pole → north pole)
- $|+\rangle \xrightarrow{X} |+\rangle$ (stays on +x axis — rotation axis!)
- $|-\rangle \xrightarrow{X} |-\rangle$ (stays on -x axis)

### Pauli-Y Gate

The Y gate rotates by $\pi$ around the **y-axis**:

$$Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$$

### Pauli-Z Gate (Phase Flip)

The Z gate rotates by $\pi$ around the **z-axis**:

$$Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$

- $|0\rangle \xrightarrow{Z} |0\rangle$ (stays at north pole — on rotation axis!)
- $|1\rangle \xrightarrow{Z} -|1\rangle = |1\rangle$ (global phase, stays at south pole)
- $|+\rangle \xrightarrow{Z} |-\rangle$ (+x axis → -x axis)
- $|-\rangle \xrightarrow{Z} |+\rangle$ (-x axis → +x axis)

### Hadamard Gate

The Hadamard gate rotates by $\pi$ around the axis halfway between x and z (the $\frac{x+z}{\sqrt{2}}$ axis):

$$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

- $|0\rangle \xrightarrow{H} |+\rangle$ (north pole → +x equator)
- $|1\rangle \xrightarrow{H} |-\rangle$ (south pole → -x equator)

### General Rotation Gates

$$R_x(\theta) = e^{-i\theta X/2} = \cos\frac{\theta}{2}I - i\sin\frac{\theta}{2}X$$

$$R_y(\theta) = e^{-i\theta Y/2} = \cos\frac{\theta}{2}I - i\sin\frac{\theta}{2}Y$$

$$R_z(\theta) = e^{-i\theta Z/2} = \cos\frac{\theta}{2}I - i\sin\frac{\theta}{2}Z$$

These rotate the Bloch vector by angle $\theta$ around the indicated axis.

---

## Qiskit Code: Visualizing the Bloch Sphere

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.visualization import plot_bloch_multivector, plot_bloch_vector
import numpy as np
import matplotlib.pyplot as plt

# Create various states and visualize on the Bloch sphere

# List of states to visualize
states_info = [
    ("State |0⟩", QuantumCircuit(1)),
    ("State |1⟩", None),
    ("State |+⟩", None),
    ("State |+i⟩", None),
    ("Custom state", None),
]

# Build circuits
# |0⟩ — already done (empty circuit)

# |1⟩
qc1 = QuantumCircuit(1)
qc1.x(0)
states_info[1] = ("State |1⟩", qc1)

# |+⟩
qc_plus = QuantumCircuit(1)
qc_plus.h(0)
states_info[2] = ("State |+⟩", qc_plus)

# |+i⟩
qc_plus_i = QuantumCircuit(1)
qc_plus_i.h(0)
qc_plus_i.s(0)  # S gate adds π/2 phase
states_info[3] = ("State |+i⟩", qc_plus_i)

# Custom state: θ=π/3, φ=π/4
qc_custom = QuantumCircuit(1)
qc_custom.ry(np.pi/3, 0)   # Set θ = π/3
qc_custom.rz(np.pi/4, 0)   # Set φ = π/4
states_info[4] = ("Custom (θ=π/3, φ=π/4)", qc_custom)

# Display Bloch sphere coordinates for each
print("Bloch Sphere Coordinates:")
print("=" * 60)
for name, qc in states_info:
    sv = Statevector.from_instruction(qc)
    # Extract Bloch vector components
    # Using the density matrix: ρ = |ψ⟩⟨ψ|
    # x = Tr(ρ·X), y = Tr(ρ·Y), z = Tr(ρ·Z)
    rho = sv.to_operator().data
    x = 2 * rho[0, 1].real
    y = 2 * rho[0, 1].imag
    z = rho[0, 0].real - rho[1, 1].real
    
    probs = sv.probabilities()
    print(f"\n{name}:")
    print(f"  Statevector: {sv}")
    print(f"  Bloch vector: ({x:.3f}, {y:.3f}, {z:.3f})")
    print(f"  |Bloch vector| = {np.sqrt(x**2 + y**2 + z**2):.3f}")
    print(f"  P(0) = {probs[0]:.3f}, P(1) = {probs[1]:.3f}")

# Visualize a state on the Bloch sphere
sv_custom = Statevector.from_instruction(states_info[4][1])
fig = plot_bloch_multivector(sv_custom)
plt.title("Custom State on Bloch Sphere")
plt.savefig('bloch_sphere_custom.png', dpi=100)
plt.show()
```

---

## From Bloch Sphere Parameters to State Vector

Given angles $\theta$ and $\varphi$, construct the state:

```python
import numpy as np

def bloch_to_state(theta, phi):
    """Convert Bloch sphere angles to state vector [α, β]."""
    alpha = np.cos(theta / 2)
    beta = np.exp(1j * phi) * np.sin(theta / 2)
    return np.array([alpha, beta])

# Examples
print("Bloch angles → State vectors:")
print("-" * 50)

examples = [
    (0, 0, "|0⟩"),
    (np.pi, 0, "|1⟩"),
    (np.pi/2, 0, "|+⟩"),
    (np.pi/2, np.pi, "|-⟩"),
    (np.pi/2, np.pi/2, "|+i⟩"),
    (np.pi/2, 3*np.pi/2, "|-i⟩"),
]

for theta, phi, name in examples:
    state = bloch_to_state(theta, phi)
    print(f"  θ={theta:.2f}, φ={phi:.2f} → [{state[0]:.4f}, {state[1]:.4f}] = {name}")
    # Verify normalization
    norm = abs(state[0])**2 + abs(state[1])**2
    assert abs(norm - 1.0) < 1e-10, "Not normalized!"
```

---

## Visualizing Gate Operations

Let's trace how a sequence of gates moves a state around the Bloch sphere:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def get_bloch_coords(statevector):
    """Extract Bloch sphere coordinates from a statevector."""
    sv = np.array(statevector)
    # Bloch vector components
    x = 2 * (sv[0].conjugate() * sv[1]).real
    y = 2 * (sv[0].conjugate() * sv[1]).imag
    z = abs(sv[0])**2 - abs(sv[1])**2
    return (x, y, z)

# Start with |0⟩ and apply gates step by step
print("Gate sequence: |0⟩ → H → S → T → H")
print("=" * 60)

qc = QuantumCircuit(1)
sv = Statevector.from_instruction(qc)
coords = get_bloch_coords(sv)
print(f"Initial |0⟩:      Bloch = ({coords[0]:.3f}, {coords[1]:.3f}, {coords[2]:.3f})")

# Apply Hadamard
qc.h(0)
sv = Statevector.from_instruction(qc)
coords = get_bloch_coords(sv)
print(f"After H:          Bloch = ({coords[0]:.3f}, {coords[1]:.3f}, {coords[2]:.3f})  → |+⟩")

# Apply S gate (π/2 rotation around z)
qc.s(0)
sv = Statevector.from_instruction(qc)
coords = get_bloch_coords(sv)
print(f"After S:          Bloch = ({coords[0]:.3f}, {coords[1]:.3f}, {coords[2]:.3f})  → |+i⟩")

# Apply T gate (π/4 rotation around z)
qc.t(0)
sv = Statevector.from_instruction(qc)
coords = get_bloch_coords(sv)
print(f"After T:          Bloch = ({coords[0]:.3f}, {coords[1]:.3f}, {coords[2]:.3f})")

# Apply another Hadamard
qc.h(0)
sv = Statevector.from_instruction(qc)
coords = get_bloch_coords(sv)
print(f"After final H:    Bloch = ({coords[0]:.3f}, {coords[1]:.3f}, {coords[2]:.3f})")
```

---

## The Interior of the Bloch Sphere: Mixed States

Pure states live on the **surface** of the Bloch sphere ($|\vec{r}| = 1$). But quantum states can also be **mixed** (statistical mixtures of pure states), which correspond to points **inside** the sphere ($|\vec{r}| < 1$).

- The center of the sphere ($\vec{r} = 0$) is the **maximally mixed state** — complete randomness, 50/50 probability of 0 or 1 with no coherence.
- Points between center and surface represent **partially mixed states** — some quantum information has been lost to the environment (decoherence).

$$\rho = \frac{1}{2}(I + x\sigma_x + y\sigma_y + z\sigma_z)$$

Where $\sigma_x, \sigma_y, \sigma_z$ are the Pauli matrices and $(x, y, z)$ is the Bloch vector.

---

## Key Takeaways

1. **The Bloch sphere** maps any single-qubit pure state to a point on a unit sphere using angles $\theta$ and $\varphi$.
2. **Parameterization:** $|\psi\rangle = \cos(\theta/2)|0\rangle + e^{i\varphi}\sin(\theta/2)|1\rangle$
3. **Poles:** $|0\rangle$ is at the north pole, $|1\rangle$ at the south pole.
4. **Equator:** States with equal probabilities of 0 and 1 (like $|+\rangle$, $|-\rangle$, $|+i\rangle$, $|-i\rangle$).
5. **Quantum gates = rotations:** X rotates around x-axis, Y around y-axis, Z around z-axis, Hadamard around (x+z)/√2.
6. **Mixed states** live inside the sphere; the center represents maximum randomness.
7. **The Bloch sphere only works for single qubits** — multi-qubit states need higher-dimensional representations.

---

## Try It Yourself

1. **Calculate:** Find the Bloch sphere coordinates $(\theta, \varphi)$ for the state $|\psi\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{i}{2}|1\rangle$.

2. **Visualize:** Starting at $|0\rangle$ (north pole), describe the path on the Bloch sphere when you apply: $R_y(\pi/2)$, then $R_z(\pi)$, then $R_y(\pi/2)$. What final state do you end up at?

3. **Code:** Use the Qiskit code above to verify that applying $H$ twice returns to the original state. What rotation does $H^2$ correspond to on the Bloch sphere?

4. **Prove:** Show that any state on the equator of the Bloch sphere has equal measurement probabilities for 0 and 1 (i.e., $|\alpha|^2 = |\beta|^2 = 1/2$).

5. **Explore:** The $T$ gate rotates by $\pi/4$ around the z-axis. How many $T$ gates must you apply to $|+\rangle$ to reach $|+i\rangle$? Verify with Qiskit.

---

## Next Lesson

Now that we can visualize where qubit states live on the Bloch sphere, let's take a comprehensive look at all the important [Single Qubit States](15-qc-single-qubit-states) — the basis states, superposition states, and how they relate to each other through inner products and orthogonality.
