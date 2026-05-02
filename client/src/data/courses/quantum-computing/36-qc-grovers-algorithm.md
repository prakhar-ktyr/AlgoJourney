---
title: "Grover's Search Algorithm"
---

# Grover's Search Algorithm

Grover's algorithm is one of the most celebrated quantum algorithms, providing a quadratic speedup for unstructured search problems. Given an unsorted database of $N$ items, a classical computer requires $O(N)$ queries to find a marked item, while Grover's algorithm accomplishes this in only $O(\sqrt{N})$ queries.

## The Unstructured Search Problem

Consider a function (oracle) $f: \{0, 1\}^n \to \{0, 1\}$ where $N = 2^n$. The function satisfies:

$$
f(x) = \begin{cases} 1 & \text{if } x = x^* \text{ (target)} \\ 0 & \text{otherwise} \end{cases}
$$

Our goal is to find $x^*$ using as few queries to $f$ as possible.

## Algorithm Overview

Grover's algorithm consists of four main steps:

1. **Initialize** — Prepare a uniform superposition over all $N$ states
2. **Oracle** — Mark the target state with a phase flip
3. **Diffusion** — Reflect about the mean amplitude (amplify the marked state)
4. **Repeat** — Apply Oracle + Diffusion approximately $\frac{\pi}{4}\sqrt{N}$ times

### Step 1: Initialization

Apply Hadamard gates to all $n$ qubits starting from $|0\rangle^{\otimes n}$:

$$
|\psi_0\rangle = H^{\otimes n}|0\rangle^{\otimes n} = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} |x\rangle
$$

Every computational basis state has equal amplitude $\frac{1}{\sqrt{N}}$.

### Step 2: The Oracle Operator

The oracle $U_f$ flips the phase of the target state:

$$
U_f |x\rangle = (-1)^{f(x)} |x\rangle = \begin{cases} -|x\rangle & \text{if } x = x^* \\ |x\rangle & \text{otherwise} \end{cases}
$$

This can be written compactly as:

$$
U_f = I - 2|x^*\rangle\langle x^*|
$$

### Step 3: The Diffusion Operator

The diffusion operator (also called the Grover diffusion or inversion about the mean) is:

$$
U_s = 2|\psi_0\rangle\langle\psi_0| - I = H^{\otimes n}(2|0\rangle\langle 0| - I)H^{\otimes n}
$$

This operator reflects every amplitude about the average amplitude. If the mean amplitude is $\bar{a}$, each amplitude $a_x$ becomes $2\bar{a} - a_x$.

### The Grover Iterate

One full iteration (called the **Grover iterate**) is:

$$
G = U_s \cdot U_f
$$

After $k$ iterations, the state is $G^k |\psi_0\rangle$.

## Geometric Interpretation

The beauty of Grover's algorithm becomes clear in the 2D subspace spanned by:

- $|x^*\rangle$ — the target state
- $|x^*_\perp\rangle = \frac{1}{\sqrt{N-1}} \sum_{x \neq x^*} |x\rangle$ — the uniform superposition of non-target states

The initial state can be written as:

$$
|\psi_0\rangle = \sin\theta |x^*\rangle + \cos\theta |x^*_\perp\rangle
$$

where $\sin\theta = \frac{1}{\sqrt{N}}$, so $\theta \approx \frac{1}{\sqrt{N}}$ for large $N$.

Each Grover iterate rotates the state by $2\theta$ toward $|x^*\rangle$. After $k$ iterations:

$$
G^k|\psi_0\rangle = \sin((2k+1)\theta)|x^*\rangle + \cos((2k+1)\theta)|x^*_\perp\rangle
$$

The optimal number of iterations is:

$$
k_{\text{opt}} = \left\lfloor \frac{\pi}{4\theta} \right\rfloor \approx \frac{\pi}{4}\sqrt{N}
$$

## Full Walkthrough: N = 4 (2 Qubits)

For $N = 4$, we have $n = 2$ qubits and $\theta = \arcsin(1/2) = \pi/6$. The optimal iteration count is:

$$
k_{\text{opt}} = \left\lfloor \frac{\pi}{4 \cdot \pi/6} \right\rfloor = \left\lfloor \frac{3}{2} \right\rfloor = 1
$$

So a single Grover iteration suffices! Let's search for $|11\rangle$:

**After initialization:**
$$|\psi_0\rangle = \frac{1}{2}(|00\rangle + |01\rangle + |10\rangle + |11\rangle)$$

**After oracle (phase flip on $|11\rangle$):**
$$|\psi_1\rangle = \frac{1}{2}(|00\rangle + |01\rangle + |10\rangle - |11\rangle)$$

**After diffusion (inversion about mean):**

Mean amplitude: $\bar{a} = \frac{1}{4}(1/2 + 1/2 + 1/2 - 1/2) = 1/4$

New amplitudes: $2(1/4) - 1/2 = 0$ for non-targets, $2(1/4) - (-1/2) = 1$ for target.

$$|\psi_2\rangle = |11\rangle$$

We find the target with probability 1!

## Qiskit Implementation

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def grovers_algorithm(target: str, n_qubits: int = 2) -> QuantumCircuit:
    """
    Implement Grover's algorithm for a given target state.
    
    Args:
        target: Binary string representing the target (e.g., '11')
        n_qubits: Number of qubits
    """
    qc = QuantumCircuit(n_qubits, n_qubits)
    
    # Step 1: Initialize superposition
    qc.h(range(n_qubits))
    qc.barrier()
    
    # Calculate optimal iterations
    import math
    N = 2 ** n_qubits
    iterations = max(1, int(math.pi / 4 * math.sqrt(N)))
    
    for _ in range(iterations):
        # Step 2: Oracle - phase flip on target
        # Flip qubits where target has '0'
        for i, bit in enumerate(reversed(target)):
            if bit == '0':
                qc.x(i)
        
        # Multi-controlled Z gate
        qc.h(n_qubits - 1)
        qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)
        qc.h(n_qubits - 1)
        
        # Undo flips
        for i, bit in enumerate(reversed(target)):
            if bit == '0':
                qc.x(i)
        
        qc.barrier()
        
        # Step 3: Diffusion operator
        qc.h(range(n_qubits))
        qc.x(range(n_qubits))
        qc.h(n_qubits - 1)
        qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)
        qc.h(n_qubits - 1)
        qc.x(range(n_qubits))
        qc.h(range(n_qubits))
        qc.barrier()
    
    # Measure
    qc.measure(range(n_qubits), range(n_qubits))
    return qc

# Run Grover's for target '11'
qc = grovers_algorithm('11', n_qubits=2)
print(qc.draw())

# Execute with sampler
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
result = job.result()
counts = result[0].data.meas.get_counts()
print(f"Results: {counts}")
# Expected: {'11': 1024} (100% probability)
```

## Complexity Analysis

| Property | Classical | Quantum (Grover's) |
|----------|-----------|---------------------|
| Query complexity | $O(N)$ | $O(\sqrt{N})$ |
| Space | $O(\log N)$ | $O(\log N)$ |
| Success probability | 1 (deterministic) | $\geq 1 - 1/N$ |

Grover's algorithm is **provably optimal** — no quantum algorithm can solve unstructured search in fewer than $\Omega(\sqrt{N})$ queries (proved by Bennett, Bernstein, Brassard, and Vazirani, 1997).

## Key Takeaways

- Grover's algorithm provides a **quadratic speedup** for unstructured search: $O(\sqrt{N})$ vs $O(N)$
- The algorithm uses two operators: an **oracle** (phase flip) and a **diffusion** (amplitude amplification)
- Geometrically, each iteration is a rotation by $2\theta$ in a 2D subspace
- The optimal number of iterations is $\approx \frac{\pi}{4}\sqrt{N}$; over-iterating decreases success probability
- For $N = 4$, a single iteration gives probability 1 — a perfect demonstration case
- The speedup is provably optimal for black-box search

## Try It Yourself

1. Modify the Qiskit code to search for target `'01'` with 2 qubits. Verify you get 100% probability on the correct answer.
2. Extend to 3 qubits ($N = 8$). How many iterations are needed? Verify that 2 iterations give high probability.
3. Plot the success probability as a function of iteration count for $N = 16$. Observe the periodic behaviour.
4. What happens if you apply too many iterations? Try 3 iterations for $N = 4$ and observe the result.
5. Implement Grover's with multiple marked items (e.g., both `'01'` and `'10'` for 2 qubits). How does the iteration count change?

---

**Next Lesson:** [Quantum Counting and Amplitude Amplification](37-qc-amplitude-amplification.md)
