---
title: "Dirac (Bra-Ket) Notation"
---

# Dirac (Bra-Ket) Notation

Dirac notation (also called bra-ket notation) is the standard mathematical language of quantum mechanics. Invented by physicist Paul Dirac, it provides a concise and powerful way to express quantum states, operations, and measurements. Mastering this notation is essential for reading quantum computing literature.

---

## Kets: |ψ⟩

A **ket** $|\psi\rangle$ represents a quantum state as a **column vector** in a Hilbert space.

### Single-Qubit Kets

The computational basis kets:

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

Common superposition states:

$$|+\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix}, \quad |-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix}$$

A general single-qubit state:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix}$$

where $\alpha, \beta \in \mathbb{C}$ and $|\alpha|^2 + |\beta|^2 = 1$.

---

## Bras: ⟨ψ|

A **bra** $\langle\psi|$ is the **conjugate transpose** (also called Hermitian conjugate or dagger) of the corresponding ket. It is a **row vector**.

$$\text{If } |\psi\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix}, \quad \text{then } \langle\psi| = \begin{pmatrix} \alpha^* & \beta^* \end{pmatrix}$$

where $\alpha^*$ denotes the complex conjugate.

### Examples

$$\langle 0| = \begin{pmatrix} 1 & 0 \end{pmatrix}, \quad \langle 1| = \begin{pmatrix} 0 & 1 \end{pmatrix}$$

$$\langle +| = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \end{pmatrix}$$

For a state with complex amplitudes:

$$|\psi\rangle = \begin{pmatrix} \frac{1}{\sqrt{2}} \\ \frac{i}{\sqrt{2}} \end{pmatrix} \implies \langle\psi| = \begin{pmatrix} \frac{1}{\sqrt{2}} & \frac{-i}{\sqrt{2}} \end{pmatrix}$$

---

## Inner Product: ⟨φ|ψ⟩

The **inner product** (or bracket) $\langle\phi|\psi\rangle$ is a scalar obtained by multiplying a bra by a ket. This is where the name "bra-ket" comes from!

$$\langle\phi|\psi\rangle = \begin{pmatrix} c^* & d^* \end{pmatrix} \begin{pmatrix} a \\ b \end{pmatrix} = c^*a + d^*b$$

### Properties

1. **Normalization**: $\langle\psi|\psi\rangle = 1$ for valid quantum states
2. **Orthogonality**: $\langle\phi|\psi\rangle = 0$ means the states are perpendicular
3. **Symmetry**: $\langle\phi|\psi\rangle = \langle\psi|\phi\rangle^*$

### Key Computations

$$\langle 0|0\rangle = \begin{pmatrix} 1 & 0 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = 1$$

$$\langle 0|1\rangle = \begin{pmatrix} 1 & 0 \end{pmatrix}\begin{pmatrix} 0 \\ 1 \end{pmatrix} = 0$$

$$\langle +|-\rangle = \frac{1}{2}\begin{pmatrix} 1 & 1 \end{pmatrix}\begin{pmatrix} 1 \\ -1 \end{pmatrix} = \frac{1}{2}(1 - 1) = 0$$

The inner product gives the **probability amplitude** for transitioning from one state to another. The probability of measuring state $|\phi\rangle$ given state $|\psi\rangle$ is:

$$P = |\langle\phi|\psi\rangle|^2$$

---

## Outer Product: |ψ⟩⟨φ|

The **outer product** $|\psi\rangle\langle\phi|$ produces a **matrix** (an operator):

$$|\psi\rangle\langle\phi| = \begin{pmatrix} a \\ b \end{pmatrix}\begin{pmatrix} c^* & d^* \end{pmatrix} = \begin{pmatrix} ac^* & ad^* \\ bc^* & bd^* \end{pmatrix}$$

### Projection Operators

The outer product $|i\rangle\langle i|$ creates a **projector** onto state $|i\rangle$:

$$P_0 = |0\rangle\langle 0| = \begin{pmatrix} 1 \\ 0 \end{pmatrix}\begin{pmatrix} 1 & 0 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}$$

$$P_1 = |1\rangle\langle 1| = \begin{pmatrix} 0 \\ 1 \end{pmatrix}\begin{pmatrix} 0 & 1 \end{pmatrix} = \begin{pmatrix} 0 & 0 \\ 0 & 1 \end{pmatrix}$$

Projectors satisfy $P^2 = P$ (applying twice is same as applying once).

### Using Projectors

To find the component of $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ along $|0\rangle$:

$$P_0|\psi\rangle = |0\rangle\langle 0|\psi\rangle = |0\rangle \cdot \alpha = \alpha|0\rangle$$

---

## Tensor Product: |ψ⟩ ⊗ |φ⟩

The **tensor product** combines systems. In Dirac notation:

$$|a\rangle \otimes |b\rangle = |a\rangle|b\rangle = |ab\rangle$$

All three notations are equivalent. For multi-qubit states:

$$|0\rangle \otimes |1\rangle = |01\rangle$$

The tensor product is **not commutative**:

$$|0\rangle \otimes |1\rangle \neq |1\rangle \otimes |0\rangle$$

### Operators on Composite Systems

If operator $A$ acts on qubit 1 and $B$ on qubit 2:

$$(A \otimes B)|ab\rangle = (A|a\rangle) \otimes (B|b\rangle)$$

**Example**: Apply $X$ to first qubit and $I$ to second:

$$(X \otimes I)|00\rangle = (X|0\rangle) \otimes (I|0\rangle) = |1\rangle \otimes |0\rangle = |10\rangle$$

---

## Completeness Relation

The **completeness relation** (or resolution of identity) states that projectors onto all basis states sum to the identity operator:

$$\sum_{i} |i\rangle\langle i| = I$$

For a single qubit:

$$|0\rangle\langle 0| + |1\rangle\langle 1| = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix} + \begin{pmatrix} 0 & 0 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix} = I$$

This is useful for inserting identity operators in calculations:

$$\langle\phi|\psi\rangle = \langle\phi|I|\psi\rangle = \sum_i \langle\phi|i\rangle\langle i|\psi\rangle$$

This decomposes the overlap into contributions from each basis state.

---

## Expectation Values: ⟨ψ|A|ψ⟩

The **expectation value** of an observable $A$ in state $|\psi\rangle$ is:

$$\langle A \rangle = \langle\psi|A|\psi\rangle$$

This gives the average measurement outcome if you prepare $|\psi\rangle$ many times and measure $A$ each time.

### Example: Expectation of Z

The Pauli Z operator: $Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$

For $|\psi\rangle = |+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$:

$$\langle Z \rangle = \langle +|Z|+\rangle = \frac{1}{2}\begin{pmatrix} 1 & 1 \end{pmatrix}\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ 1 \end{pmatrix}$$

$$= \frac{1}{2}\begin{pmatrix} 1 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ 1 \end{pmatrix} = \frac{1}{2}(1 - 1) = 0$$

This makes sense: $|+\rangle$ gives $+1$ (measuring $|0\rangle$) and $-1$ (measuring $|1\rangle$) with equal probability, so the average is 0.

### Example: Expectation of X

For $|\psi\rangle = |0\rangle$ and $X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$:

$$\langle X \rangle = \langle 0|X|0\rangle = \begin{pmatrix} 1 & 0 \end{pmatrix}\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 0 & 1 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = 0$$

---

## Worked Examples

### Example 1: Verify Orthonormality

Show that $|+\rangle$ and $|-\rangle$ form an orthonormal basis:

**Normalization:**

$$\langle +|+\rangle = \frac{1}{2}(1 \cdot 1 + 1 \cdot 1) = 1 \checkmark$$

$$\langle -|-\rangle = \frac{1}{2}(1 \cdot 1 + (-1)(-1)) = 1 \checkmark$$

**Orthogonality:**

$$\langle +|-\rangle = \frac{1}{2}(1 \cdot 1 + 1 \cdot (-1)) = 0 \checkmark$$

### Example 2: Measurement Probability

What is the probability of measuring $|0\rangle$ if the system is in state $|\psi\rangle = \frac{1}{\sqrt{3}}|0\rangle + \sqrt{\frac{2}{3}}|1\rangle$?

$$P(0) = |\langle 0|\psi\rangle|^2 = \left|\frac{1}{\sqrt{3}}\right|^2 = \frac{1}{3}$$

### Example 3: Operator in Outer-Product Form

Express the Hadamard gate using outer products:

$$H = \frac{1}{\sqrt{2}}(|0\rangle\langle 0| + |0\rangle\langle 1| + |1\rangle\langle 0| - |1\rangle\langle 1|)$$

Verify: $H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle \cdot 1 + |0\rangle \cdot 0 + |1\rangle \cdot 1 - |1\rangle \cdot 0) = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = |+\rangle$ ✓

---

## Qiskit: Computing Inner Products

```python
from qiskit.quantum_info import Statevector
import numpy as np

# Define states
psi = Statevector([1/np.sqrt(2), 1/np.sqrt(2)])  # |+⟩
phi = Statevector([1, 0])                          # |0⟩

# Inner product ⟨φ|ψ⟩
inner = phi.inner(psi)
print(f"⟨0|+⟩ = {inner:.4f}")        # 0.7071
print(f"|⟨0|+⟩|² = {abs(inner)**2:.4f}")  # 0.5

# Verify orthogonality
zero = Statevector([1, 0])
one = Statevector([0, 1])
print(f"⟨0|1⟩ = {zero.inner(one):.4f}")  # 0.0
```

### Computing Expectation Values in Qiskit

```python
from qiskit.quantum_info import Statevector, Operator
import numpy as np

# State |+⟩
plus = Statevector([1/np.sqrt(2), 1/np.sqrt(2)])

# Pauli Z operator
Z = Operator([[1, 0], [0, -1]])

# Expectation value ⟨+|Z|+⟩
exp_val = plus.expectation_value(Z)
print(f"⟨+|Z|+⟩ = {exp_val.real:.4f}")  # 0.0

# Pauli X operator
X = Operator([[0, 1], [1, 0]])
exp_val_x = plus.expectation_value(X)
print(f"⟨+|X|+⟩ = {exp_val_x.real:.4f}")  # 1.0
```

---

## Summary Table

| Notation | Name | Type | Meaning |
|---|---|---|---|
| $\|\psi\rangle$ | Ket | Column vector | Quantum state |
| $\langle\psi\|$ | Bra | Row vector | Conjugate transpose of ket |
| $\langle\phi\|\psi\rangle$ | Bracket / Inner product | Scalar | Overlap between states |
| $\|\psi\rangle\langle\phi\|$ | Outer product | Matrix | Operator / Projector |
| $\|\psi\rangle \otimes \|\phi\rangle$ | Tensor product | Vector | Composite system state |
| $\langle\psi\|A\|\psi\rangle$ | Expectation value | Scalar | Average measurement outcome |

---

## Key Takeaways

- **Kets** $|\psi\rangle$ are column vectors representing quantum states.
- **Bras** $\langle\psi|$ are conjugate-transpose row vectors.
- The **inner product** $\langle\phi|\psi\rangle$ gives overlap; $|\langle\phi|\psi\rangle|^2$ is a probability.
- The **outer product** $|\psi\rangle\langle\phi|$ creates operators and projectors.
- The **completeness relation** $\sum_i |i\rangle\langle i| = I$ is a fundamental identity.
- **Expectation values** $\langle\psi|A|\psi\rangle$ give the average outcome of measuring observable $A$.
- Dirac notation is compact, basis-independent, and universal in quantum computing literature.

---

## Try It Yourself

1. Compute $\langle\psi|\psi\rangle$ for $|\psi\rangle = \frac{1}{2}|0\rangle + \frac{\sqrt{3}}{2}|1\rangle$ to verify normalization.
2. Calculate $\langle +|Z|+\rangle$ and $\langle 0|X|0\rangle$ by hand using matrix multiplication.
3. Write $|+\rangle\langle +|$ as a $2 \times 2$ matrix. Verify that it projects $|0\rangle$ onto $\frac{1}{2}(|0\rangle + |1\rangle)$.
4. Use Qiskit to compute the expectation value of the Y operator in the state $|+\rangle$.
5. Show that $(|0\rangle\langle 0|)^2 = |0\rangle\langle 0|$ (projectors are idempotent).

---

## Next Lesson

Next, we'll explore **Introduction to Quantum Gates** — how unitary operators physically transform qubit states.
