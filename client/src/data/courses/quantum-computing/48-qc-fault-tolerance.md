---
title: "Fault-Tolerant Quantum Computing"
---

Error correction encodes and protects quantum information, but we also need to **compute** on that encoded data without introducing uncorrectable errors. **Fault-tolerant quantum computing** is the set of techniques that ensures errors don't spread uncontrollably during computation, even when the gates, measurements, and state preparations themselves are imperfect.

## What Is Fault Tolerance?

A quantum computation is **fault-tolerant** if:

1. A single physical error in any component (gate, measurement, preparation) causes at most **one** error in each encoded block
2. Errors are corrected faster than they accumulate
3. The logical error rate can be made arbitrarily small by increasing the code size

Without fault tolerance, the very act of performing error correction could introduce more errors than it fixes — defeating the purpose entirely.

## The Threshold Theorem

The foundational result of fault-tolerant quantum computing:

> **Threshold Theorem:** If the error rate per physical gate is below a constant threshold $p_{\text{th}}$, then an arbitrarily long quantum computation can be performed with only polylogarithmic overhead in the number of qubits.

Formally, to achieve a target logical error rate $\epsilon$ with a computation of $T$ logical gates, concatenated codes require:

$$
n_{\text{physical}} = O\!\left(n_{\text{logical}} \cdot \text{polylog}\!\left(\frac{T}{\epsilon}\right)\right)
$$

Threshold values depend on the error correction scheme:

| Scheme | Threshold $p_{\text{th}}$ |
|--------|---------------------------|
| Concatenated Steane code | $\sim 10^{-5}$ |
| Surface codes (circuit-level) | $\sim 0.6\%$ |
| Surface codes (depolarizing) | $\sim 1.1\%$ |

Surface codes have the highest thresholds, which is why they dominate practical roadmaps.

## Logical vs. Physical Qubits

The distinction is fundamental:

- **Physical qubit**: a single two-level quantum system (e.g., a superconducting transmon, a trapped ion). Subject to noise.
- **Logical qubit**: an error-corrected qubit encoded in many physical qubits. Protected against noise up to a certain error rate.

The number of physical qubits per logical qubit depends on the code distance $d$ and the error correction scheme:

$$
n_{\text{physical per logical}} = O(d^2) \quad \text{(surface codes)}
$$

For practical fault-tolerant algorithms:

| Application | Logical qubits | Code distance | Physical qubits |
|-------------|----------------|---------------|-----------------|
| Factor 2048-bit RSA | $\sim 4{,}000$ | $\sim 27$ | $\sim 6{,}000{,}000$ |
| Simulate FeMoCo | $\sim 200$ | $\sim 31$ | $\sim 400{,}000$ |
| Quantum chemistry | $\sim 100$ | $\sim 21$ | $\sim 90{,}000$ |

## Transversal Gates

A gate is **transversal** if it acts independently on each physical qubit in the code block:

$$
U_L = U_1 \otimes U_2 \otimes \cdots \otimes U_n
$$

Transversal gates are automatically fault-tolerant because a single error on one physical qubit cannot spread to another qubit in the same block.

For CSS codes like the Steane code, the following gates are transversal:

- **Logical $X$**: apply $X$ to all physical qubits
- **Logical $Z$**: apply $Z$ to all physical qubits
- **Logical $H$**: apply $H$ to all physical qubits
- **Logical CNOT**: apply CNOT between corresponding qubits of two code blocks

However, a critical limitation exists:

> **Eastin-Knill Theorem:** No quantum error-correcting code can implement a **universal** set of transversal gates.

This means at least one gate in a universal set must be implemented non-transversally. For most codes, this is the $T$ gate.

## The Clifford + T Gate Set

A universal gate set for fault-tolerant quantum computing:

| Gate | Matrix | Transversal? |
|------|--------|-------------|
| $H$ | $\frac{1}{\sqrt{2}}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ | Yes (Steane) |
| $S$ | $\begin{pmatrix}1&0\\0&i\end{pmatrix}$ | Yes (some codes) |
| $\text{CNOT}$ | controlled-$X$ | Yes (CSS codes) |
| $T$ | $\begin{pmatrix}1&0\\0&e^{i\pi/4}\end{pmatrix}$ | **No** |

The Clifford gates ($H$, $S$, CNOT) alone are not universal — they can be efficiently simulated classically (Gottesman-Knill theorem). Adding the $T$ gate makes the set universal.

## Magic State Distillation

Since the $T$ gate cannot be transversal, we implement it using **magic state distillation**:

1. **Prepare** noisy "magic states" $|T\rangle = T|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + e^{i\pi/4}|1\rangle)$
2. **Distill** many noisy copies into fewer, higher-fidelity copies using a distillation protocol
3. **Consume** a distilled magic state to apply a logical $T$ gate via gate teleportation

The distillation protocol uses Clifford gates (which are transversal) to check parity and discard bad states. A common protocol takes 15 noisy magic states and produces 1 cleaner one:

$$
p_{\text{out}} \approx 35 \cdot p_{\text{in}}^3
$$

where $p_{\text{in}}$ is the input error rate. Multiple rounds of distillation reduce the error exponentially.

### Resource Cost of Magic States

Magic state distillation is the dominant cost of fault-tolerant computation:

$$
\text{Cost of algorithm} \approx \text{(number of } T \text{ gates)} \times \text{(cost per magic state)}
$$

Each distilled magic state requires $\sim 15d^2$ physical qubit-rounds of surface code. A typical quantum chemistry algorithm might need $\sim 10^9$ $T$ gates, making this the primary bottleneck.

## Gate Teleportation

The $T$ gate is applied to a logical qubit using a magic state and only Clifford operations:

```
          ┌───┐
|ψ⟩ ──────┤   ├── M ──── correction ── T|ψ⟩
          │CNOT│
|T⟩ ──────┤   ├──
          └───┘
```

1. Prepare magic state $|T\rangle$
2. Apply CNOT between the data qubit and the magic state
3. Measure the data qubit
4. Apply a classically-controlled Clifford correction based on the measurement outcome

This is fault-tolerant because only Clifford gates (which are transversal) touch the encoded data.

## Lattice Surgery

For surface codes, logical two-qubit gates (CNOT) are performed via **lattice surgery** rather than transversal gates:

1. **Merge** two surface code patches by measuring stabilizers across their shared boundary
2. The merged patch encodes the joint logical state
3. **Split** the patches apart, performing a logical measurement in the process

A logical CNOT via lattice surgery takes $O(d)$ syndrome extraction rounds and does not require long-range interactions.

## Resource Overhead Estimates

Current estimates for practical fault-tolerant computation:

| Component | Overhead |
|-----------|----------|
| Physical qubits per logical qubit | $1{,}000 - 3{,}000$ |
| Logical gate time | $d \times$ syndrome cycle $\approx 1 - 10\;\mu\text{s}$ |
| $T$ gate cost (with distillation) | $\sim 10\times$ Clifford gate cost |
| Total physical qubits for useful algorithm | $10^5 - 10^7$ |

## Timeline and Milestones

| Phase | Milestone | Status |
|-------|-----------|--------|
| 1. Noisy intermediate-scale (NISQ) | 50-1,000 noisy qubits | Current era |
| 2. Early fault tolerance | First logical qubit with below-threshold errors | Achieved (2023) |
| 3. Logical advantage | Logical qubit outperforms any constituent physical qubit | Demonstrated for memory |
| 4. Practical fault tolerance | 100+ logical qubits, $10^6$+ $T$ gates | Target ~2030 |
| 5. Cryptographically relevant | Factor 2048-bit RSA | Target ~2035+ |

## What Can We Solve with Fault Tolerance?

| Problem domain | Algorithm | Qubits needed | Expected speedup |
|---------------|-----------|---------------|-----------------|
| Cryptanalysis | Shor's algorithm | ~4,000 logical | Exponential |
| Chemistry | Quantum phase estimation | ~100-200 logical | Polynomial to exponential |
| Optimization | Grover + amplitude estimation | ~1,000 logical | Quadratic |
| Materials | Hamiltonian simulation | ~200-1,000 logical | Exponential |
| Machine learning | Quantum linear algebra | ~100-500 logical | Depends on structure |

## Key Takeaways

- Fault tolerance ensures errors don't propagate uncontrollably during computation on encoded qubits
- The threshold theorem guarantees reliable computation is possible if physical error rates are low enough
- Transversal gates are naturally fault-tolerant but cannot form a universal set (Eastin-Knill theorem)
- The $T$ gate requires magic state distillation, which dominates the resource cost of fault-tolerant algorithms
- Lattice surgery enables logical CNOT gates in surface codes using only local operations
- We are in the early fault-tolerance era; practical fault-tolerant quantum computers are estimated to arrive around 2030-2035

## Try It Yourself

1. Calculate: if a physical error rate is $p = 0.1\%$ and the threshold is $p_{\text{th}} = 1\%$, what code distance $d$ is needed for a logical error rate of $10^{-12}$? Use $p_L \approx (p/p_{\text{th}})^{d/2}$
2. How many levels of magic state distillation are needed to go from $p_{\text{in}} = 10^{-2}$ to $p_{\text{out}} < 10^{-15}$? (Use $p_{\text{out}} \approx 35 p_{\text{in}}^3$)
3. If a quantum algorithm requires $10^8$ $T$ gates and each distillation uses 15 raw magic states, estimate the total number of magic states needed (assume 2 rounds of distillation)
4. Explain why the Gottesman-Knill theorem means Clifford gates alone aren't enough for quantum advantage

---

**Next Lesson:** [Quantum Machine Learning](49-qc-quantum-machine-learning.md) — applying quantum computation to machine learning problems.
