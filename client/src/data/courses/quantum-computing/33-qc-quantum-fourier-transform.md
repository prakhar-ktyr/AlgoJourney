---
title: "Quantum Fourier Transform"
---

# Quantum Fourier Transform

The **Quantum Fourier Transform (QFT)** is the quantum analog of the classical Discrete Fourier Transform (DFT). It is one of the most important subroutines in quantum computing, forming the basis for Shor's algorithm, quantum phase estimation, and many other quantum algorithms.

---

## Classical Discrete Fourier Transform

The DFT transforms a sequence of $N$ complex numbers $(x_0, x_1, \ldots, x_{N-1})$ into another sequence $(y_0, y_1, \ldots, y_{N-1})$:

$$y_k = \frac{1}{\sqrt{N}} \sum_{j=0}^{N-1} x_j \, e^{2\pi i jk / N}$$

The classical **Fast Fourier Transform (FFT)** computes this in $O(N \log N)$ operations, where $N = 2^n$.

---

## Quantum Fourier Transform Definition

The QFT acts on quantum basis states. For an $n$-qubit system ($N = 2^n$), the QFT maps:

$$\text{QFT}|j\rangle = \frac{1}{\sqrt{N}} \sum_{k=0}^{N-1} e^{2\pi i jk / N} |k\rangle$$

More explicitly, using $\omega = e^{2\pi i / N}$:

$$|j\rangle \xrightarrow{\text{QFT}} \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n - 1} \omega^{jk} |k\rangle$$

---

## Product Representation

The QFT has an elegant **product representation** that leads directly to an efficient circuit:

$$\text{QFT}|j\rangle = \frac{1}{\sqrt{2^n}} \bigotimes_{\ell=1}^{n} \left( |0\rangle + e^{2\pi i j / 2^\ell} |1\rangle \right)$$

Writing $j$ in binary as $j = j_1 j_2 \cdots j_n$ (where $j_1$ is the most significant bit):

$$\text{QFT}|j_1 j_2 \cdots j_n\rangle = \frac{1}{\sqrt{2^n}} \left(|0\rangle + e^{2\pi i 0.j_n}|1\rangle\right) \otimes \left(|0\rangle + e^{2\pi i 0.j_{n-1}j_n}|1\rangle\right) \otimes \cdots \otimes \left(|0\rangle + e^{2\pi i 0.j_1 j_2 \cdots j_n}|1\rangle\right)$$

Here $0.j_\ell j_{\ell+1} \cdots j_n$ denotes the binary fraction $\frac{j_\ell}{2} + \frac{j_{\ell+1}}{4} + \cdots + \frac{j_n}{2^{n-\ell+1}}$.

---

## Circuit Construction

The QFT circuit uses two types of gates:

### Hadamard Gate (H)

$$H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

### Controlled Rotation Gate ($CR_k$)

$$R_k = \begin{pmatrix} 1 & 0 \\ 0 & e^{2\pi i / 2^k} \end{pmatrix}$$

The controlled version $CR_k$ applies the phase $e^{2\pi i / 2^k}$ to the target qubit only when the control qubit is $|1\rangle$.

### Circuit Pattern

For $n$ qubits, the QFT circuit applies:

1. **Qubit 1**: $H$, then $CR_2$ (controlled by qubit 2), $CR_3$ (controlled by qubit 3), ..., $CR_n$ (controlled by qubit $n$)
2. **Qubit 2**: $H$, then $CR_2$ (controlled by qubit 3), ..., $CR_{n-1}$ (controlled by qubit $n$)
3. Continue pattern...
4. **Qubit $n$**: Just $H$
5. **SWAP** qubits to reverse the output order

---

## QFT on 3 Qubits: Step-by-Step

Let's trace the QFT circuit on 3 qubits with input $|j_1 j_2 j_3\rangle$.

### Circuit

```
q₁: ─── H ─── CR₂ ─── CR₃ ──────────────────── SWAP ───
               |        |                          |
q₂: ──────────●─────── | ──── H ─── CR₂ ─────── | ────
                        |            |             |
q₃: ───────────────────●────────────●──── H ─── SWAP ───
```

### Step 1: H on qubit 1

$$|j_1\rangle \rightarrow \frac{1}{\sqrt{2}}\left(|0\rangle + e^{2\pi i \cdot 0.j_1}|1\rangle\right)$$

Since $0.j_1 = j_1/2$, this gives $\frac{1}{\sqrt{2}}(|0\rangle + (-1)^{j_1}|1\rangle)$.

### Step 2: CR₂ on qubit 1 (controlled by qubit 2)

Adds phase $e^{2\pi i j_2/4}$ when qubit 1 is in $|1\rangle$:

$$\frac{1}{\sqrt{2}}\left(|0\rangle + e^{2\pi i \cdot 0.j_1 j_2}|1\rangle\right)$$

### Step 3: CR₃ on qubit 1 (controlled by qubit 3)

$$\frac{1}{\sqrt{2}}\left(|0\rangle + e^{2\pi i \cdot 0.j_1 j_2 j_3}|1\rangle\right)$$

### Steps 4-5: H and CR₂ on qubit 2

$$\frac{1}{\sqrt{2}}\left(|0\rangle + e^{2\pi i \cdot 0.j_2 j_3}|1\rangle\right)$$

### Step 6: H on qubit 3

$$\frac{1}{\sqrt{2}}\left(|0\rangle + e^{2\pi i \cdot 0.j_3}|1\rangle\right)$$

### Final: SWAP qubits 1 and 3

Output (after reversal):

$$\frac{1}{\sqrt{8}}\left(|0\rangle + e^{2\pi i \cdot 0.j_3}|1\rangle\right) \otimes \left(|0\rangle + e^{2\pi i \cdot 0.j_2 j_3}|1\rangle\right) \otimes \left(|0\rangle + e^{2\pi i \cdot 0.j_1 j_2 j_3}|1\rangle\right)$$

This matches the product representation of QFT! ✓

---

## Efficiency

| Algorithm | Operations | Input Size |
|-----------|-----------|-----------|
| Classical DFT | $O(N^2) = O(2^{2n})$ | $N = 2^n$ |
| Classical FFT | $O(N \log N) = O(n \cdot 2^n)$ | $N = 2^n$ |
| **Quantum QFT** | $O(n^2)$ | $n$ qubits |

The QFT uses:
- $n$ Hadamard gates
- $n(n-1)/2$ controlled rotation gates
- $\lfloor n/2 \rfloor$ SWAP gates

**Total: $O(n^2)$ gates** — exponentially fewer than the classical FFT!

> **Important caveat:** The QFT itself doesn't compute the Fourier transform of classical data (loading classical data into a quantum state is expensive). Its power lies in transforming quantum amplitudes efficiently within a larger algorithm.

---

## Inverse QFT

The **inverse QFT** (QFT†) reverses the transform:

$$\text{QFT}^{-1}|k\rangle = \frac{1}{\sqrt{N}} \sum_{j=0}^{N-1} e^{-2\pi i jk / N} |j\rangle$$

To construct the inverse QFT circuit:
1. Reverse the order of all gates in the QFT circuit
2. Replace each $R_k$ with $R_k^\dagger$ (negate the phase: $e^{2\pi i/2^k} \rightarrow e^{-2\pi i/2^k}$)

The inverse QFT is used in **quantum phase estimation** to extract phase information.

---

## Qiskit Implementation

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Statevector
import numpy as np

def qft_circuit(n):
    """
    Build the Quantum Fourier Transform circuit for n qubits.
    
    Args:
        n (int): Number of qubits
    
    Returns:
        QuantumCircuit: The QFT circuit
    """
    qc = QuantumCircuit(n)
    
    for i in range(n):
        # Apply Hadamard to qubit i
        qc.h(i)
        
        # Apply controlled rotations
        for j in range(i + 1, n):
            # CR_{j-i+1} controlled by qubit j, target qubit i
            angle = np.pi / (2 ** (j - i))
            qc.cp(angle, j, i)
    
    # Swap qubits to reverse output order
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    
    return qc

def inverse_qft_circuit(n):
    """
    Build the Inverse QFT circuit.
    """
    qft = qft_circuit(n)
    return qft.inverse()

# Build and display 3-qubit QFT
n = 3
qft = qft_circuit(n)
print("QFT Circuit (3 qubits):")
print(qft.draw())

# Verify: QFT of |5⟩ = |101⟩ for 3 qubits
input_state = QuantumCircuit(n)
input_state.x(0)  # Set qubit 0 to |1⟩
input_state.x(2)  # Set qubit 2 to |1⟩  → |101⟩ = |5⟩

full_circuit = input_state.compose(qft)
sv = Statevector.from_instruction(full_circuit)
print(f"\nQFT|5⟩ amplitudes:")
for i, amp in enumerate(sv.data):
    if abs(amp) > 1e-10:
        phase = np.angle(amp) / (2 * np.pi)
        print(f"  |{i:0{n}b}⟩: {amp:.4f} (phase = {phase:.4f} × 2π)")
```

### Verifying Against Classical DFT

```python
def classical_dft(j, n):
    """Compute the DFT of basis state |j⟩ classically."""
    N = 2**n
    amplitudes = np.zeros(N, dtype=complex)
    for k in range(N):
        amplitudes[k] = np.exp(2j * np.pi * j * k / N) / np.sqrt(N)
    return amplitudes

# Compare quantum QFT with classical DFT for |5⟩
j = 5
n = 3
classical = classical_dft(j, n)
quantum = sv.data

print("\nComparison QFT vs Classical DFT for |5⟩:")
print(f"{'State':<8} {'Classical':<20} {'Quantum':<20} {'Match'}")
for k in range(2**n):
    match = np.isclose(classical[k], quantum[k])
    print(f"|{k:0{n}b}⟩    {classical[k]:.4f}          {quantum[k]:.4f}          {'✓' if match else '✗'}")
```

---

## QFT as a Building Block

The QFT is essential in these major algorithms:

| Algorithm | How QFT is Used |
|-----------|-----------------|
| **Phase Estimation** | Inverse QFT extracts phase from controlled-U operations |
| **Shor's Algorithm** | QFT for period finding in modular exponentiation |
| **Quantum Counting** | Combines Grover iterations with phase estimation |
| **HHL Algorithm** | Phase estimation step for linear systems |
| **Quantum Simulation** | Switching between position and momentum bases |

---

## Approximate QFT

For practical implementations, we can approximate the QFT by dropping small-angle rotations:

- Full QFT: $O(n^2)$ gates
- Approximate QFT (keeping rotations up to $R_m$): $O(nm)$ gates

For $m = O(\log n)$, the approximation error is negligible, giving an $O(n \log n)$ circuit — matching the FFT's scaling!

---

## Key Takeaways

1. The QFT maps $|j\rangle \rightarrow \frac{1}{\sqrt{N}} \sum_k e^{2\pi ijk/N} |k\rangle$ — the quantum analog of the DFT
2. It requires only $O(n^2)$ gates for $n$ qubits, compared to $O(n \cdot 2^n)$ for the classical FFT
3. The circuit uses **Hadamard gates** and **controlled phase rotation gates** ($CR_k$)
4. The **product representation** directly maps to the circuit structure
5. The **inverse QFT** is crucial for phase estimation and Shor's algorithm
6. QFT alone doesn't provide a speedup for computing Fourier transforms of classical data — its power comes from transforming quantum amplitudes within larger algorithms

---

## Try It Yourself

1. **Build a 4-qubit QFT**: Extend the circuit to 4 qubits and verify against the classical DFT
2. **Visualize phases**: Plot the complex amplitudes after QFT on different input states using matplotlib
3. **Test inverse**: Apply QFT followed by inverse QFT and verify you get back the original state
4. **Approximate QFT**: Remove the smallest rotation gates and measure how the output changes
5. **QFT on superpositions**: Apply QFT to a uniform superposition and observe the result

```python
# Exercise: QFT on equal superposition
exercise = QuantumCircuit(3)
exercise.h(range(3))  # Create |+++⟩
exercise = exercise.compose(qft_circuit(3))

sv_exercise = Statevector.from_instruction(exercise)
print("QFT of uniform superposition:")
print(sv_exercise)
# What do you expect? Think about it before running!
```

---

## Common Misconceptions

1. **"QFT gives exponential speedup for computing Fourier transforms"** — Not directly. Loading classical data into quantum states is expensive. The speedup comes from using QFT as a subroutine.
2. **"QFT output can be directly read"** — Measurement collapses the state. You can only sample from the Fourier-transformed distribution.
3. **"QFT and FFT solve the same problem"** — QFT acts on amplitudes of quantum states, while FFT acts on classical vectors.

---

## Next Lesson

In the next lesson, we'll learn about **Quantum Phase Estimation** — an algorithm that uses the inverse QFT to extract the eigenvalue phase of a unitary operator. This is one of the most important subroutines in quantum computing.
