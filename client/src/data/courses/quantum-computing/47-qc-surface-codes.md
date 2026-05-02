---
title: "Surface Codes"
---

Among the many quantum error correction codes, **surface codes** have emerged as the most promising architecture for building large-scale fault-tolerant quantum computers. Their appeal lies in requiring only nearest-neighbor interactions on a 2D grid — a layout that maps naturally onto real hardware.

## Why Surface Codes?

Surface codes dominate the roadmaps of major quantum hardware efforts (Google, IBM, etc.) for several compelling reasons:

1. **Local interactions only** — qubits interact only with their nearest neighbors on a 2D lattice, matching the physical layout of superconducting and trapped-ion chips
2. **High error threshold** — approximately $\sim 1\%$ per gate, which is achievable on current hardware
3. **Flexible code distance** — the code distance $d$ can be increased by growing the lattice, reducing logical error rate exponentially
4. **Efficient decoding** — fast classical algorithms exist for identifying errors from syndrome data

## The 2D Lattice Structure

A surface code is defined on a 2D grid with two types of qubits:

- **Data qubits**: sit on the edges of the lattice and store quantum information
- **Measure qubits** (ancillas): sit on the vertices and faces, used to extract error syndromes

For a distance-$d$ surface code, the lattice has roughly $d^2$ data qubits and $d^2 - 1$ measure qubits, totaling approximately $2d^2$ physical qubits to encode **one** logical qubit.

```
   Z   Z
   |   |
—— D —— D —— D ——
   |   |   |
   X   X   X
   |   |   |
—— D —— D —— D ——
   |   |   |
   Z   Z   Z
   |   |   |
—— D —— D —— D ——

D = data qubit
X = X-stabilizer (face)
Z = Z-stabilizer (vertex)
```

## X-Stabilizers and Z-Stabilizers

The surface code is defined by its **stabilizer generators**, which are products of Pauli operators acting on neighboring data qubits.

### Z-Stabilizers (Vertex Operators)

Each vertex operator acts on the data qubits surrounding a vertex:

$$
A_v = \prod_{j \in \text{neighbors}(v)} Z_j
$$

These detect **bit-flip ($X$) errors**. If a data qubit experiences an $X$ error, the two adjacent vertex operators will return $-1$ instead of $+1$.

### X-Stabilizers (Face/Plaquette Operators)

Each face operator acts on the data qubits around a face:

$$
B_f = \prod_{j \in \text{edges}(f)} X_j
$$

These detect **phase-flip ($Z$) errors**. A $Z$ error on a data qubit flips the two adjacent face operators.

All stabilizers commute with each other because any two stabilizers sharing data qubits share an even number of them, and $XZ = -ZX$ applied an even number of times gives $+1$.

## Syndrome Extraction

Each stabilizer is measured in a **syndrome extraction round**:

1. Prepare each measure qubit in $|0\rangle$ (for $Z$-stabilizers) or $|+\rangle$ (for $X$-stabilizers)
2. Apply CNOT gates between the measure qubit and its neighboring data qubits
3. Measure the ancilla in the $Z$ or $X$ basis

The measurement outcome $\pm 1$ for each stabilizer is the **syndrome bit**. Errors produce pairs of $-1$ outcomes (called **defects** or **anyons**) at the endpoints of error chains.

For a $Z$-stabilizer measuring a 4-body operator $Z_1 Z_2 Z_3 Z_4$:

```python
# Syndrome extraction circuit for one Z-stabilizer
from qiskit import QuantumCircuit

qc = QuantumCircuit(5, 1)  # 4 data + 1 ancilla
# ancilla is qubit 4
for i in range(4):
    qc.cx(i, 4)  # CNOT from each data qubit to ancilla
qc.measure(4, 0)
# Result: 0 = no error, 1 = odd number of X errors on data qubits
```

## Error Decoding: Minimum-Weight Perfect Matching

When syndrome defects are detected, a classical **decoder** must determine which physical errors caused them. The standard decoder for surface codes is **Minimum-Weight Perfect Matching (MWPM)**:

1. Construct a graph where nodes are syndrome defects
2. Edge weights represent the probability (or distance) of the error chain connecting two defects
3. Find the minimum-weight perfect matching — the pairing of defects that maximizes the likelihood of the actual error pattern
4. Apply correction operators along the matched paths

The key insight is that we don't need to identify the *exact* error — we only need to find a correction in the same **equivalence class** (same logical effect). Two error chains are equivalent if they differ by a stabilizer.

$$
P(\text{logical error}) \sim \left(\frac{p}{p_{\text{th}}}\right)^{d/2}
$$

where $p$ is the physical error rate, $p_{\text{th}}$ is the threshold, and $d$ is the code distance. Below threshold, increasing $d$ exponentially suppresses logical errors.

## Code Distance and Logical Error Rate

The **code distance** $d$ is the minimum number of physical errors needed to cause a logical error — equivalently, the minimum weight of a logical operator (a chain of errors spanning the lattice from one boundary to the other).

| Code distance $d$ | Data qubits $\sim d^2$ | Logical error rate (at $p = 0.1\%$) |
|---|---|---|
| 3 | 9 | $\sim 10^{-2}$ |
| 5 | 25 | $\sim 10^{-4}$ |
| 7 | 49 | $\sim 10^{-6}$ |
| 9 | 81 | $\sim 10^{-8}$ |
| 11 | 121 | $\sim 10^{-10}$ |

Each increase in $d$ by 2 yields roughly two orders of magnitude improvement — but at the cost of more physical qubits.

## Physical Qubit Overhead

A major challenge with surface codes is their **overhead**. To achieve error rates required for algorithms like Shor's factoring:

- Target logical error rate: $\sim 10^{-15}$ per logical gate
- Required code distance: $d \approx 27$
- Physical qubits per logical qubit: $2d^2 \approx 1{,}458$
- For a 2,000-logical-qubit computation: $\sim 3{,}000{,}000$ physical qubits

This roughly **1,000:1 ratio** of physical to logical qubits is the often-cited overhead. Current quantum computers have $\sim 1{,}000$ physical qubits, so we are several generations away from practical fault-tolerant computation with surface codes.

## Threshold Error Rate

The **threshold theorem** for surface codes states:

> If the physical error rate per gate $p < p_{\text{th}} \approx 1\%$, then arbitrary-length quantum computation can be performed with polylogarithmic overhead.

The exact threshold depends on the noise model:

| Noise model | Threshold |
|------------|-----------|
| Independent depolarizing | $\sim 1.1\%$ |
| Circuit-level noise | $\sim 0.6\%$ |
| Phenomenological | $\sim 3.3\%$ |

Current superconducting qubit error rates are approaching $\sim 0.1\% - 0.5\%$, which is below threshold — making surface codes experimentally viable.

## Logical Operations on Surface Codes

Performing gates on encoded logical qubits is nontrivial:

- **Logical $X$**: apply $X$ to all data qubits along a row spanning the lattice
- **Logical $Z$**: apply $Z$ to all data qubits along a column spanning the lattice
- **Logical CNOT**: lattice surgery — merge and split two surface code patches
- **Logical $T$ gate**: requires **magic state distillation** (cannot be done transversally)

**Lattice surgery** is the primary method for performing multi-qubit gates between surface code patches by temporarily merging their boundaries.

## Current Experimental Progress

| Year | Milestone |
|------|-----------|
| 2021 | Google demonstrated exponential suppression of errors with increasing code distance (up to $d = 5$) |
| 2023 | Google's Willow chip: below-threshold performance at $d = 3, 5, 7$ |
| 2024 | Multiple groups demonstrated real-time decoding and repeated syndrome extraction |
| 2025+ | Targets: $d = 11$+ surface codes, first logical algorithms |

The trajectory shows steady progress toward the $d \sim 20$+ codes needed for practical fault tolerance.

## Key Takeaways

- Surface codes use a 2D lattice of data and measurement qubits with only nearest-neighbor interactions
- X-stabilizers detect phase errors; Z-stabilizers detect bit-flip errors
- Syndrome defects come in pairs; minimum-weight perfect matching pairs them optimally
- The logical error rate decreases exponentially with code distance $d$ (when below threshold)
- The ~1% threshold is achievable with current hardware, making surface codes the leading practical QEC architecture
- The major cost is qubit overhead: ~1,000 physical qubits per logical qubit for practical applications

## Try It Yourself

1. Draw a $d = 3$ surface code lattice and count the data qubits, X-stabilizers, and Z-stabilizers (answer: 9 data, 4 X-stabilizers, 4 Z-stabilizers)
2. Trace what happens when an $X$ error occurs on a data qubit — which Z-stabilizers are affected?
3. Show that two $X$-error chains that differ by a stabilizer have the same logical effect
4. Consider: if physical error rates improve to $0.01\%$, how does this change the required code distance for a target logical error rate of $10^{-12}$?

---

**Next Lesson:** [Fault-Tolerant Quantum Computing](48-qc-fault-tolerance.md) — how to perform reliable computation on error-corrected logical qubits.
