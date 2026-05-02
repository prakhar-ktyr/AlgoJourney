---
title: "Quantum Counting and Amplitude Amplification"
---

# Quantum Counting and Amplitude Amplification

Amplitude amplification is a powerful generalization of Grover's algorithm that works even when the initial state is not a uniform superposition. Quantum counting combines amplitude amplification with Quantum Phase Estimation to determine the *number* of solutions without finding them explicitly.

## Amplitude Amplification: The General Framework

In Grover's algorithm, we started from $|\psi_0\rangle = H^{\otimes n}|0\rangle^{\otimes n}$. Amplitude amplification generalizes this to *any* initial state prepared by an operator $\mathcal{A}$:

$$
|\psi\rangle = \mathcal{A}|0\rangle = \sqrt{a}|\psi_{\text{good}}\rangle + \sqrt{1-a}|\psi_{\text{bad}}\rangle
$$

where $a = \langle\psi_{\text{good}}|\psi_{\text{good}}\rangle$ is the probability of measuring a "good" (solution) state.

### The Amplification Operator

Define the operator:

$$
Q = -\mathcal{A} S_0 \mathcal{A}^{-1} S_f
$$

where:
- $S_f = I - 2\sum_{x \in \text{good}} |x\rangle\langle x|$ is the oracle (marks good states)
- $S_0 = I - 2|0\rangle\langle 0|$ reflects about $|0\rangle$

After $k$ applications of $Q$:

$$
Q^k \mathcal{A}|0\rangle = \sin((2k+1)\theta_a)|\psi_{\text{good}}\rangle + \cos((2k+1)\theta_a)|\psi_{\text{bad}}\rangle
$$

where $\sin^2(\theta_a) = a$.

### Optimal Iterations

The success probability after $k$ iterations is:

$$
P_{\text{success}}(k) = \sin^2((2k+1)\theta_a)
$$

Maximum probability occurs at:

$$
k_{\text{opt}} = \left\lfloor \frac{\pi/(2\theta_a) - 1}{2} \right\rfloor \approx \frac{\pi}{4\sqrt{a}} - \frac{1}{2}
$$

For standard Grover ($a = M/N$ with $M$ solutions among $N$ items):

$$
k_{\text{opt}} \approx \frac{\pi}{4}\sqrt{\frac{N}{M}}
$$

## The Problem: Unknown Number of Solutions

What if we don't know $M$ (the number of solutions)? If we guess wrong:

- Too few iterations → low success probability
- Too many iterations → we "overshoot" and probability decreases

Two solutions exist: **quantum counting** and **exponential search**.

## Quantum Counting with QPE

Quantum counting uses Quantum Phase Estimation on the Grover iterate $G$ to estimate $\theta_a$, which directly gives us $M$.

The eigenvalues of $G$ are $e^{\pm 2i\theta_a}$ where $\sin^2(\theta_a) = M/N$. By applying QPE:

$$
M = N \sin^2(\theta_a)
$$

### Algorithm Steps

1. Prepare $t$ ancilla qubits in $|0\rangle^{\otimes t}$ and the search register in $|\psi_0\rangle$
2. Apply controlled-$G^{2^j}$ operations for $j = 0, 1, \ldots, t-1$
3. Apply inverse QFT to the ancilla register
4. Measure ancillas to get an estimate $\tilde{\theta}_a$
5. Compute $\tilde{M} = N\sin^2(\pi\tilde{\theta}_a / 2^t)$

The precision of the estimate is:

$$
|\tilde{M} - M| \leq \frac{2\pi\sqrt{M(N-M)}}{2^t} + \frac{\pi^2}{2^{2t}}
$$

With $t = O(\log(N/\epsilon))$ ancilla qubits, we get $M$ to within additive error $\epsilon$.

## Exponential Search Strategy

When $M$ is unknown, we can use a doubling strategy:

```python
import math
import random

def exponential_grover_search(oracle, n_qubits):
    """
    Grover search when M is unknown.
    Uses exponential increase in iteration count.
    """
    N = 2 ** n_qubits
    k = 1
    lam = 6 / 5  # growth factor
    
    while True:
        # Choose random number of iterations in [0, k)
        j = random.randint(0, int(k) - 1)
        
        # Run Grover with j iterations
        result = run_grover(oracle, n_qubits, iterations=j)
        
        # Check if result is a solution
        if oracle(result):
            return result
        
        # Increase upper bound
        k = min(lam * k, math.sqrt(N))
```

This finds a solution in expected $O(\sqrt{N/M})$ queries regardless of $M$.

## Qiskit Implementation: Quantum Counting

```python
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFT
from qiskit.primitives import StatevectorSampler
import numpy as np

def quantum_counting_circuit(n_search: int, n_count: int, target: str) -> QuantumCircuit:
    """
    Quantum counting circuit to estimate number of solutions.
    
    Args:
        n_search: Number of search qubits
        n_count: Number of counting (ancilla) qubits
        target: Target state as binary string
    """
    total_qubits = n_count + n_search
    qc = QuantumCircuit(total_qubits, n_count)
    
    # Initialize counting register in superposition
    qc.h(range(n_count))
    
    # Initialize search register in uniform superposition
    qc.h(range(n_count, total_qubits))
    qc.barrier()
    
    # Controlled Grover iterates: controlled-G^(2^j)
    for j in range(n_count):
        power = 2 ** j
        for _ in range(power):
            # Controlled oracle
            controlled_oracle(qc, j, n_count, n_search, target)
            # Controlled diffusion
            controlled_diffusion(qc, j, n_count, n_search)
    
    qc.barrier()
    
    # Inverse QFT on counting register
    qc.append(QFT(n_count, inverse=True), range(n_count))
    
    # Measure counting register
    qc.measure(range(n_count), range(n_count))
    return qc

def controlled_oracle(qc, control, n_count, n_search, target):
    """Apply controlled phase oracle."""
    search_qubits = list(range(n_count, n_count + n_search))
    
    # Flip qubits where target has '0'
    for i, bit in enumerate(reversed(target)):
        if bit == '0':
            qc.x(search_qubits[i])
    
    # Multi-controlled Z with control qubit
    all_targets = [control] + search_qubits
    qc.h(search_qubits[-1])
    qc.mcx(all_targets[:-1], search_qubits[-1])
    qc.h(search_qubits[-1])
    
    for i, bit in enumerate(reversed(target)):
        if bit == '0':
            qc.x(search_qubits[i])

def controlled_diffusion(qc, control, n_count, n_search):
    """Apply controlled diffusion operator."""
    search_qubits = list(range(n_count, n_count + n_search))
    
    qc.h(search_qubits)
    qc.x(search_qubits)
    qc.h(search_qubits[-1])
    qc.mcx([control] + search_qubits[:-1], search_qubits[-1])
    qc.h(search_qubits[-1])
    qc.x(search_qubits)
    qc.h(search_qubits)

# Example: Count solutions in a 2-qubit space
# Suppose target is '11' (M=1 solution out of N=4)
n_search = 2
n_count = 3  # Precision qubits

qc = quantum_counting_circuit(n_search, n_count, '11')

sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
result = job.result()
counts = result[0].data.c.get_counts()

# Interpret results
N = 2 ** n_search
for bitstring, count in sorted(counts.items(), key=lambda x: -x[1])[:3]:
    phase = int(bitstring, 2) / (2 ** n_count)
    theta = phase * np.pi
    M_estimate = N * np.sin(theta) ** 2
    print(f"Measured: {bitstring}, Phase: {phase:.3f}, "
          f"Estimated M: {M_estimate:.2f}, Counts: {count}")
```

## Applications of Amplitude Amplification

### Boolean Satisfiability (SAT)

For a CNF formula with $N = 2^n$ possible assignments and $M$ satisfying assignments:

$$
\text{Quantum SAT search: } O\left(\sqrt{\frac{N}{M}}\right) \text{ oracle queries}
$$

### Optimization Problems

Amplitude amplification can boost any classical heuristic. If a classical algorithm succeeds with probability $p$, amplitude amplification boosts this to near-certainty in $O(1/\sqrt{p})$ repetitions instead of $O(1/p)$.

### Quantum Minimum Finding

Find the minimum of an unsorted list in $O(\sqrt{N})$ time using amplitude amplification with a progressively tightening threshold oracle.

## Comparison Table

| Method | Queries | Requires knowing $M$? |
|--------|---------|----------------------|
| Classical search | $O(N/M)$ | No |
| Grover (known $M$) | $O(\sqrt{N/M})$ | Yes |
| Exponential search | $O(\sqrt{N/M})$ | No |
| Quantum counting | $O(\sqrt{N})$ | Outputs $M$ |

## Key Takeaways

- **Amplitude amplification** generalizes Grover's to arbitrary initial states prepared by operator $\mathcal{A}$
- The success probability oscillates sinusoidally: $\sin^2((2k+1)\theta_a)$
- **Quantum counting** uses QPE on the Grover operator to estimate the number of solutions $M$
- When $M$ is unknown, the **exponential search** strategy achieves optimal $O(\sqrt{N/M})$ without knowing $M$
- Amplitude amplification applies broadly: SAT solving, optimization, minimum finding, and boosting probabilistic algorithms
- The quadratic speedup is maintained regardless of whether $M$ is known in advance

## Try It Yourself

1. Implement quantum counting for a 3-qubit search space with 2 marked items. Verify the estimate is close to $M = 2$.
2. Code the exponential search strategy and compare the average number of oracle calls to standard Grover for various $M/N$ ratios.
3. Use amplitude amplification to boost a coin-flip algorithm: start with an algorithm that succeeds with probability $p = 0.1$ and amplify to $p > 0.99$.
4. Implement quantum minimum finding for a 3-qubit list of values. Compare oracle queries to classical linear search.
5. Explore what happens to quantum counting accuracy as you increase the number of precision qubits $t$.

---

**Next Lesson:** [Introduction to Qiskit](38-qc-intro-qiskit.md)
