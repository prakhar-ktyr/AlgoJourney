---
title: "Quantum Error Correction Codes"
---

Real quantum hardware is noisy — qubits decohere and gates introduce errors. **Quantum error correction (QEC)** is the theoretical and practical framework that lets us protect quantum information and perform reliable computations on unreliable hardware.

## Classical Error Correction Recap

In classical computing, errors (bit flips $0 \to 1$ or $1 \to 0$) are handled by redundancy.

**Repetition code:** encode each logical bit in three physical bits:

$$
0 \to 000, \qquad 1 \to 111
$$

If one bit flips (e.g., $000 \to 010$), majority voting recovers the original. This corrects any single-bit error.

**Hamming code:** the $[7,4,3]$ Hamming code encodes 4 data bits into 7 bits and can correct any single-bit error using 3 parity-check bits. The parity-check matrix $H$ satisfies $H \mathbf{c} = \mathbf{0}$ for valid codewords and $H \mathbf{e} \neq \mathbf{0}$ when an error $\mathbf{e}$ is present — the result (the **syndrome**) identifies the error location.

## The No-Cloning Obstacle

In classical codes, we freely copy bits. Quantum mechanics forbids this:

> **No-Cloning Theorem:** There is no unitary operation $U$ such that $U|\psi\rangle|0\rangle = |\psi\rangle|\psi\rangle$ for all $|\psi\rangle$.

This means we cannot simply duplicate a qubit for redundancy. Additionally, measuring a qubit collapses its state, so we cannot directly inspect quantum data to check for errors. QEC must work around both constraints.

## Quantum Error Correction Strategy

Instead of copying, we **encode** one logical qubit into an entangled state of multiple physical qubits:

$$
|\psi\rangle_L = \alpha|0_L\rangle + \beta|1_L\rangle
$$

where $|0_L\rangle$ and $|1_L\rangle$ are multi-qubit codewords. Errors are detected via **syndrome measurements** — measurements on auxiliary (ancilla) qubits that reveal which error occurred without measuring (and thus collapsing) the encoded data.

## Types of Quantum Errors

Any single-qubit error can be decomposed into combinations of three Pauli errors:

| Error | Operator | Effect |
|-------|----------|--------|
| Bit flip | $X$ | $\|0\rangle \leftrightarrow \|1\rangle$ |
| Phase flip | $Z$ | $\|1\rangle \to -\|1\rangle$ |
| Both | $Y = iXZ$ | Bit flip + phase flip |

Because these form a basis for all $2 \times 2$ matrices, correcting $X$, $Z$, and $Y$ errors suffices to correct **any** single-qubit error (including continuous rotations).

## 3-Qubit Bit-Flip Code

The simplest quantum code protects against $X$ (bit-flip) errors:

$$
|0_L\rangle = |000\rangle, \qquad |1_L\rangle = |111\rangle
$$

Encoding uses two CNOT gates:

$$
(\alpha|0\rangle + \beta|1\rangle)|00\rangle \xrightarrow{\text{CNOT}_{1,2}, \text{CNOT}_{1,3}} \alpha|000\rangle + \beta|111\rangle
$$

### Syndrome Measurement

We measure two **stabilizers** without disturbing the data:

| Stabilizer | Outcome for no error | Outcome if qubit $k$ flipped |
|------------|---------------------|------------------------------|
| $Z_1 Z_2$ | $+1$ | Identifies if error is on qubit 1 or 2 |
| $Z_2 Z_3$ | $+1$ | Identifies if error is on qubit 2 or 3 |

The pair of syndrome bits $(s_1, s_2)$ pinpoints the error:

| $(s_1, s_2)$ | Error |
|---------------|-------|
| $(0, 0)$ | None |
| $(1, 0)$ | $X_1$ |
| $(1, 1)$ | $X_2$ |
| $(0, 1)$ | $X_3$ |

Apply the corresponding $X$ gate to correct.

## 3-Qubit Phase-Flip Code

Phase-flip errors ($Z$) flip the phase: $\alpha|0\rangle + \beta|1\rangle \to \alpha|0\rangle - \beta|1\rangle$. We encode in the Hadamard basis:

$$
|0_L\rangle = |{+}{+}{+}\rangle, \qquad |1_L\rangle = |{-}{-}{-}\rangle
$$

where $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ and $|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$.

A phase flip $Z_k$ in the computational basis becomes a bit flip $X_k$ in the Hadamard basis, so the same majority-vote correction applies after basis change.

## Shor's 9-Qubit Code

Peter Shor's code concatenates the bit-flip and phase-flip codes to correct **any** single-qubit error:

$$
|0_L\rangle = \frac{1}{2\sqrt{2}}(|000\rangle + |111\rangle)(|000\rangle + |111\rangle)(|000\rangle + |111\rangle)
$$

$$
|1_L\rangle = \frac{1}{2\sqrt{2}}(|000\rangle - |111\rangle)(|000\rangle - |111\rangle)(|000\rangle - |111\rangle)
$$

The inner repetition code (groups of 3) corrects bit flips; the outer repetition code (3 groups) corrects phase flips. Together they handle $X$, $Z$, and $Y = iXZ$ errors.

## Steane Code (7-Qubit CSS Code)

The **Steane code** is a $[\![7,1,3]\!]$ code — 7 physical qubits encoding 1 logical qubit with distance 3 (corrects 1 error). It is a **CSS (Calderbank-Shor-Steane)** code built from classical Hamming codes:

$$
|0_L\rangle = \frac{1}{\sqrt{8}} \sum_{c \in C} |c\rangle, \qquad |1_L\rangle = \frac{1}{\sqrt{8}} \sum_{c \in C} |c \oplus 1111111\rangle
$$

where $C$ is the classical $[7,4,3]$ Hamming code. The Steane code has the advantage that many logical gates can be implemented **transversally** (bit-by-bit), which is naturally fault-tolerant.

## Stabilizer Formalism

The **stabilizer formalism** provides a unified language for QEC. A stabilizer code on $n$ qubits is defined by a set of $n - k$ commuting Pauli operators $\{S_1, S_2, \ldots, S_{n-k}\}$ called **stabilizers**, where $k$ is the number of logical qubits.

The code space is the simultaneous $+1$ eigenspace:

$$
S_i |\psi_L\rangle = +|\psi_L\rangle \quad \forall i
$$

An error $E$ is detected when it **anticommutes** with at least one stabilizer:

$$
S_i E |\psi_L\rangle = -E |\psi_L\rangle
$$

The pattern of $\pm 1$ outcomes across all stabilizers forms the **syndrome**, which identifies the error.

## Qiskit Example: 3-Qubit Bit-Flip Code

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram

# Registers: 3 data qubits, 2 ancilla for syndrome, 1 classical for result
data = QuantumRegister(3, "data")
ancilla = QuantumRegister(2, "ancilla")
syn_bits = ClassicalRegister(2, "syndrome")
out_bit = ClassicalRegister(1, "output")

qc = QuantumCircuit(data, ancilla, syn_bits, out_bit)

# --- Encode |1⟩ → |111⟩ ---
qc.x(data[0])          # Prepare logical |1⟩
qc.cx(data[0], data[1])
qc.cx(data[0], data[2])
qc.barrier()

# --- Introduce a bit-flip error on qubit 1 ---
qc.x(data[1])
qc.barrier()

# --- Syndrome measurement ---
qc.cx(data[0], ancilla[0])
qc.cx(data[1], ancilla[0])  # ancilla[0] = data[0] XOR data[1]
qc.cx(data[1], ancilla[1])
qc.cx(data[2], ancilla[1])  # ancilla[1] = data[1] XOR data[2]
qc.measure(ancilla, syn_bits)
qc.barrier()

# --- Correction (controlled on syndrome) ---
# Syndrome 10 → error on qubit 0, 11 → qubit 1, 01 → qubit 2
with qc.if_test((syn_bits, 0b11)):
    qc.x(data[1])
with qc.if_test((syn_bits, 0b10)):
    qc.x(data[0])
with qc.if_test((syn_bits, 0b01)):
    qc.x(data[2])
qc.barrier()

# --- Decode and measure ---
qc.cx(data[0], data[2])
qc.cx(data[0], data[1])
qc.measure(data[0], out_bit)

# Run
sim = AerSimulator()
result = sim.run(qc, shots=1024).result()
counts = result.get_counts()
print("Results:", counts)
# Expected: output bit = 1 (original state recovered)
```

This circuit encodes $|1\rangle$ into $|111\rangle$, applies a bit-flip error on qubit 1, measures the syndrome to identify the error, corrects it, decodes, and verifies the original state is recovered.

## Key Takeaways

- Quantum error correction is essential for scalable quantum computing because qubits are inherently noisy
- The no-cloning theorem forbids simple copying, so QEC encodes logical qubits in entangled multi-qubit states
- Syndrome measurements detect errors without collapsing the encoded quantum information
- The 3-qubit bit-flip code and phase-flip code each handle one error type; Shor's 9-qubit code handles both
- The Steane code is more efficient (7 qubits) and supports transversal gates
- The stabilizer formalism provides a powerful mathematical framework for designing and analyzing quantum codes

## Try It Yourself

1. Modify the Qiskit circuit to inject errors on different qubits and verify the syndrome correctly identifies each case
2. Build the 3-qubit phase-flip code by adding Hadamard gates before and after the bit-flip code
3. Calculate how many stabilizer generators the Steane code requires (answer: $7 - 1 = 6$)
4. Look up the stabilizer generators for the Steane code and verify they all commute

---

**Next Lesson:** [Surface Codes](47-qc-surface-codes.md) — the leading error correction architecture for building large-scale quantum computers.
