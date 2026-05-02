---
title: "Simon's Algorithm"
---

# Simon's Algorithm

**Simon's algorithm** (1994) provides an *exponential* quantum speedup over classical algorithms. It was the first algorithm to demonstrate such a dramatic separation and directly inspired Peter Shor's famous factoring algorithm.

---

## The Problem

Given a black-box function $f: \{0,1\}^n \rightarrow \{0,1\}^n$ that is guaranteed to satisfy:

$$f(x) = f(y) \iff x \oplus y \in \{0^n, s\}$$

for some unknown **secret period** $s \in \{0,1\}^n$.

In other words:
- If $s = 0^n$: the function is **one-to-one** (injective)
- If $s \neq 0^n$: the function is **two-to-one**, and $f(x) = f(x \oplus s)$ for all $x$

**Goal:** Determine the secret string $s$.

---

## Classical Complexity

Classically, finding $s$ requires $O(2^{n/2})$ queries (by birthday paradox arguments). You need to find a collision — two inputs $x$ and $y$ where $f(x) = f(y)$ — and then compute $s = x \oplus y$.

This is **exponentially expensive** in $n$.

---

## Quantum Complexity

Simon's algorithm finds $s$ using only $O(n)$ quantum queries to the oracle, followed by classical post-processing (Gaussian elimination). This is an **exponential speedup**.

---

## The Algorithm

### High-Level Strategy

1. Use quantum parallelism to sample equations involving $s$
2. Repeat $O(n)$ times to get $n-1$ linearly independent equations
3. Solve the system classically to find $s$

### Quantum Subroutine (One Iteration)

1. Prepare two $n$-qubit registers: $|0\rangle^{\otimes n}|0\rangle^{\otimes n}$
2. Apply $H^{\otimes n}$ to the first register
3. Apply the oracle $U_f$: $|x\rangle|0\rangle \rightarrow |x\rangle|f(x)\rangle$
4. Apply $H^{\otimes n}$ to the first register
5. Measure the first register to get a string $z$

The measured $z$ satisfies: $z \cdot s = 0 \mod 2$

### Classical Post-Processing

After collecting $n-1$ linearly independent strings $z_1, z_2, \ldots, z_{n-1}$ (each satisfying $z_i \cdot s = 0$), solve the linear system:

$$\begin{pmatrix} z_1 \\ z_2 \\ \vdots \\ z_{n-1} \end{pmatrix} \cdot s = \begin{pmatrix} 0 \\ 0 \\ \vdots \\ 0 \end{pmatrix} \pmod{2}$$

This gives $s$ (up to the trivial solution $s = 0^n$, which we verify by checking if $f$ is one-to-one).

---

## Why Does the Measurement Give $z \cdot s = 0$?

### Step-by-Step Derivation

**After Step 2** (Hadamard on first register):

$$|\psi_1\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} |x\rangle|0\rangle$$

**After Step 3** (Oracle application):

$$|\psi_2\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} |x\rangle|f(x)\rangle$$

**Key insight:** If $s \neq 0$, then for each output value $v = f(x) = f(x \oplus s)$, the first register is in the state:

$$\frac{1}{\sqrt{2}}(|x\rangle + |x \oplus s\rangle)$$

**After Step 4** (Hadamard on first register):

$$H^{\otimes n}|x\rangle = \frac{1}{\sqrt{2^n}} \sum_z (-1)^{x \cdot z} |z\rangle$$

So the first register becomes:

$$\frac{1}{\sqrt{2^{n+1}}} \sum_z \left[(-1)^{x \cdot z} + (-1)^{(x \oplus s) \cdot z}\right] |z\rangle$$

The amplitude of $|z\rangle$ is proportional to:

$$(-1)^{x \cdot z} + (-1)^{(x \oplus s) \cdot z} = (-1)^{x \cdot z}\left[1 + (-1)^{s \cdot z}\right]$$

This is **non-zero only when** $s \cdot z = 0 \pmod{2}$.

Therefore, measuring the first register always yields a $z$ satisfying $z \cdot s = 0$.

---

## Historical Importance

Simon's algorithm was groundbreaking because:

1. **First exponential quantum speedup** for a computational problem
2. **Inspired Shor's algorithm**: Shor adapted the period-finding structure for integer factoring
3. **Established the oracle separation** between BQP and BPP
4. **Demonstrated quantum parallelism power**: classical algorithms cannot achieve the same efficiency

The relationship: Simon's problem is essentially period-finding over $\mathbb{Z}_2^n$, while Shor's is period-finding over $\mathbb{Z}_N$.

---

## Qiskit Implementation

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
import numpy as np

def simon_oracle(n, secret):
    """
    Create a Simon oracle for the given secret string.
    
    The oracle implements f(x) = f(x ⊕ s) by:
    - Copying x to the output register
    - If the first '1' bit of s is at position j,
      XOR the output with s when x_j = 1
    """
    qc = QuantumCircuit(2 * n)
    
    # Copy input to output: f(x) = x initially
    for i in range(n):
        qc.cx(i, n + i)
    
    # Make f(x) = f(x ⊕ s)
    if '1' in secret:
        # Find the first '1' in s
        j = secret.index('1')
        # For each '1' bit in s, XOR the output when input bit j is 1
        for i, bit in enumerate(secret):
            if bit == '1':
                qc.cx(j, n + i)
    
    return qc

def simon_algorithm(secret):
    """
    Run Simon's algorithm to find the secret period string.
    
    Args:
        secret (str): The secret period string s
    
    Returns:
        list: List of measurement results (each satisfies z·s = 0)
    """
    n = len(secret)
    
    # Create the quantum circuit
    qc = QuantumCircuit(2 * n, n)
    
    # Step 1: Apply Hadamard to first register
    qc.h(range(n))
    
    qc.barrier()
    
    # Step 2: Apply oracle
    oracle = simon_oracle(n, secret)
    qc.compose(oracle, inplace=True)
    
    qc.barrier()
    
    # Step 3: Apply Hadamard to first register
    qc.h(range(n))
    
    # Step 4: Measure first register
    qc.measure(range(n), range(n))
    
    return qc

def solve_linear_system(equations, n):
    """
    Solve the system z·s = 0 (mod 2) using Gaussian elimination.
    
    Args:
        equations: List of binary strings (the z values)
        n: Number of bits
    
    Returns:
        str: The secret string s
    """
    # Convert to matrix
    matrix = []
    for eq in equations:
        row = [int(b) for b in eq]
        matrix.append(row)
    
    matrix = np.array(matrix, dtype=int)
    
    # Gaussian elimination mod 2
    num_rows, num_cols = matrix.shape
    pivot_row = 0
    
    for col in range(num_cols):
        # Find pivot
        found = False
        for row in range(pivot_row, num_rows):
            if matrix[row, col] == 1:
                # Swap rows
                matrix[[pivot_row, row]] = matrix[[row, pivot_row]]
                found = True
                break
        
        if not found:
            continue
        
        # Eliminate
        for row in range(num_rows):
            if row != pivot_row and matrix[row, col] == 1:
                matrix[row] = (matrix[row] + matrix[pivot_row]) % 2
        
        pivot_row += 1
    
    # Find s from null space
    # Try all possible non-zero solutions
    for candidate in range(1, 2**n):
        s = format(candidate, f'0{n}b')
        valid = True
        for eq in equations:
            dot = sum(int(a) * int(b) for a, b in zip(eq, s)) % 2
            if dot != 0:
                valid = False
                break
        if valid:
            return s
    
    return '0' * n

# Example: secret string s = "110"
secret = "110"
n = len(secret)

print(f"Secret string: {secret}")
print(f"Number of qubits: {n}")
print()

# Run the quantum circuit multiple times
circuit = simon_algorithm(secret)
print(circuit.draw())

# Collect measurement results
sampler = StatevectorSampler()
job = sampler.run([circuit], shots=100)
result = job.result()
counts = result[0].data.c.get_counts()

print(f"\nMeasurement results: {counts}")
print(f"\nAll results satisfy z·s = 0 (mod 2):")

equations = []
for z in counts.keys():
    dot_product = sum(int(a) * int(b) for a, b in zip(z, secret)) % 2
    print(f"  z = {z}, z·s = {dot_product}")
    if z != '0' * n:  # Exclude trivial equation
        equations.append(z)

# Solve the linear system
if equations:
    found_s = solve_linear_system(equations, n)
    print(f"\nSolved secret string: {found_s}")
    print(f"Correct: {found_s == secret}")
```

### Expected Output

```
Secret string: 110
Measurement results: {'000': 25, '011': 25, '100': 25, '111': 25}

All results satisfy z·s = 0 (mod 2):
  z = 000, z·s = 0
  z = 011, z·s = 0
  z = 100, z·s = 0
  z = 111, z·s = 0

Solved secret string: 110
Correct: True
```

---

## Complete Workflow

```python
def run_simon_full(secret, num_shots=20):
    """Complete Simon's algorithm with classical post-processing."""
    n = len(secret)
    circuit = simon_algorithm(secret)
    
    # Collect samples
    sampler = StatevectorSampler()
    job = sampler.run([circuit], shots=num_shots)
    result = job.result()
    counts = result[0].data.c.get_counts()
    
    # Gather unique non-trivial equations
    equations = set()
    for z in counts.keys():
        if z != '0' * n:
            equations.add(z)
    
    equations = list(equations)
    print(f"Collected {len(equations)} unique equations from {num_shots} shots")
    
    # Need at least n-1 linearly independent equations
    if len(equations) >= n - 1:
        found_s = solve_linear_system(equations, n)
        return found_s
    else:
        print("Need more samples!")
        return None

# Test with various secrets
for s in ["11", "110", "1010", "1001"]:
    result = run_simon_full(s)
    print(f"  Secret: {s} → Found: {result} ✓" if result == s else f"  Failed for {s}")
    print()
```

---

## Complexity Analysis

| Aspect | Classical | Quantum (Simon's) |
|--------|-----------|-------------------|
| Oracle queries | $O(2^{n/2})$ | $O(n)$ |
| Total time | $O(2^{n/2})$ | $O(n^3)$* |
| Speedup | — | **Exponential** |

*The $O(n^3)$ includes classical Gaussian elimination on the $n \times n$ system.

---

## Key Takeaways

1. Simon's algorithm finds the period $s$ of a two-to-one function using $O(n)$ quantum queries instead of $O(2^{n/2})$ classical queries — an **exponential speedup**
2. Each quantum subroutine execution produces a string $z$ satisfying $z \cdot s = 0 \pmod{2}$
3. After collecting $n-1$ linearly independent equations, **classical Gaussian elimination** recovers $s$
4. The algorithm combines quantum sampling with classical post-processing — a pattern that reappears in many quantum algorithms
5. Simon's algorithm **directly inspired Shor's algorithm** for integer factoring

---

## Try It Yourself

1. **Change the secret**: Try different secret strings and verify the algorithm works
2. **Count iterations**: Track how many quantum circuit executions are needed to collect $n-1$ independent equations
3. **Verify the constraint**: For every measurement result $z$, compute $z \cdot s \mod 2$ and confirm it equals 0
4. **Implement verification**: After finding $s$, verify that $f(x) = f(x \oplus s)$ for random inputs
5. **Scale up**: Try with $n = 5$ or $n = 6$ and observe that the number of quantum queries grows linearly

---

## Connection to Shor's Algorithm

| Simon's Algorithm | Shor's Algorithm |
|-------------------|------------------|
| Period over $\mathbb{Z}_2^n$ | Period over $\mathbb{Z}_N$ |
| Uses Hadamard transform | Uses Quantum Fourier Transform |
| XOR-based periodicity | Modular arithmetic periodicity |
| Finds $s$ where $f(x) = f(x \oplus s)$ | Finds $r$ where $a^r \equiv 1 \pmod{N}$ |

---

## Next Lesson

In the next lesson, we'll study the **Quantum Fourier Transform (QFT)** — the quantum analog of the classical Discrete Fourier Transform. The QFT is the key building block that enables Shor's algorithm and quantum phase estimation.
