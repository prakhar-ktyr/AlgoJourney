---
title: "Bernstein-Vazirani Algorithm"
---

# Bernstein-Vazirani Algorithm

The **Bernstein-Vazirani algorithm** is a quantum algorithm that finds a hidden binary string in a single query — a task that classically requires $n$ queries. It extends the ideas from the Deutsch-Jozsa algorithm and demonstrates a clear linear speedup.

---

## The Problem

You are given access to a black-box function (oracle) $f: \{0,1\}^n \rightarrow \{0,1\}$ that computes:

$$f(x) = s \cdot x \mod 2$$

where $s$ is a **secret $n$-bit string** and $s \cdot x$ denotes the bitwise inner product:

$$s \cdot x = s_0 x_0 \oplus s_1 x_1 \oplus s_2 x_2 \oplus \cdots \oplus s_{n-1} x_{n-1}$$

**Goal:** Determine the secret string $s$.

---

## Classical Approach

Classically, you need **$n$ queries** to determine $s$. You query the function with each standard basis vector:

| Query Input | Result |
|-------------|--------|
| $x = 100...0$ | $f(x) = s_0$ |
| $x = 010...0$ | $f(x) = s_1$ |
| $x = 001...0$ | $f(x) = s_2$ |
| ... | ... |
| $x = 000...1$ | $f(x) = s_{n-1}$ |

Each query reveals one bit of $s$. You cannot do better classically.

---

## Quantum Approach: One Query

The Bernstein-Vazirani algorithm finds $s$ with **exactly 1 query** to the oracle. This is a linear speedup: $O(1)$ vs $O(n)$.

### Algorithm Steps

1. Initialize $n$ qubits in state $|0\rangle^{\otimes n}$ and one ancilla qubit in state $|1\rangle$
2. Apply Hadamard gates to all qubits (including ancilla)
3. Apply the oracle $U_f$
4. Apply Hadamard gates to the first $n$ qubits
5. Measure the first $n$ qubits — the result is $s$

---

## Circuit Diagram

```
|0⟩ ─── H ─── ┤         ├─── H ─── M ───  s₀
|0⟩ ─── H ─── ┤         ├─── H ─── M ───  s₁
|0⟩ ─── H ─── ┤   Uf    ├─── H ─── M ───  s₂
  ⋮            ┤         ├           ⋮
|0⟩ ─── H ─── ┤         ├─── H ─── M ───  sₙ₋₁
|1⟩ ─── H ─── ┤         ├─────────────────
```

---

## The Oracle

For the function $f(x) = s \cdot x \mod 2$, the oracle applies a **CNOT** from each input qubit $x_i$ to the ancilla qubit, but **only** for positions where $s_i = 1$.

For example, if $s = 1011$:
- Apply CNOT from qubit 0 to ancilla (since $s_0 = 1$)
- Skip qubit 1 (since $s_1 = 0$)
- Apply CNOT from qubit 2 to ancilla (since $s_2 = 1$)
- Apply CNOT from qubit 3 to ancilla (since $s_3 = 1$)

---

## Step-by-Step Derivation

### Step 1: Initial State

$$|\psi_0\rangle = |0\rangle^{\otimes n} |1\rangle$$

### Step 2: Apply Hadamard to All Qubits

$$|\psi_1\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle \otimes \frac{|0\rangle - |1\rangle}{\sqrt{2}}$$

### Step 3: Apply Oracle

The oracle maps $|x\rangle|y\rangle \rightarrow |x\rangle|y \oplus f(x)\rangle$. With the ancilla in the $|-\rangle$ state, this produces a phase kickback:

$$|\psi_2\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} (-1)^{f(x)} |x\rangle \otimes \frac{|0\rangle - |1\rangle}{\sqrt{2}}$$

Since $f(x) = s \cdot x$:

$$|\psi_2\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} (-1)^{s \cdot x} |x\rangle \otimes |-\rangle$$

### Step 4: Apply Hadamard to First $n$ Qubits

Using the identity $H^{\otimes n} \left( \frac{1}{\sqrt{2^n}} \sum_x (-1)^{s \cdot x} |x\rangle \right) = |s\rangle$:

$$|\psi_3\rangle = |s\rangle \otimes |-\rangle$$

### Step 5: Measure

Measuring the first $n$ qubits gives $s$ with **probability 1**.

---

## Why Does This Work?

The key insight is the Hadamard transform identity. If we define:

$$|s\rangle = H^{\otimes n} \left( \frac{1}{\sqrt{2^n}} \sum_{x} (-1)^{s \cdot x} |x\rangle \right)$$

This works because $(-1)^{s \cdot x}$ creates exactly the pattern of phases that the Hadamard transform maps back to the computational basis state $|s\rangle$. The oracle encodes $s$ in the phases, and the final Hadamard layer decodes it.

---

## Qiskit Implementation (n=4)

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def bernstein_vazirani(secret_string):
    """
    Implement the Bernstein-Vazirani algorithm.
    
    Args:
        secret_string (str): The secret binary string to find
    
    Returns:
        str: The measured result (should equal secret_string)
    """
    n = len(secret_string)
    
    # Create circuit with n input qubits + 1 ancilla
    qc = QuantumCircuit(n + 1, n)
    
    # Step 1: Initialize ancilla to |1⟩
    qc.x(n)
    
    # Step 2: Apply Hadamard to all qubits
    qc.h(range(n + 1))
    
    qc.barrier()
    
    # Step 3: Apply oracle
    # For each bit in secret_string, apply CNOT if bit is '1'
    for i, bit in enumerate(reversed(secret_string)):
        if bit == '1':
            qc.cx(i, n)
    
    qc.barrier()
    
    # Step 4: Apply Hadamard to input qubits
    qc.h(range(n))
    
    # Step 5: Measure input qubits
    qc.measure(range(n), range(n))
    
    return qc

# Run the algorithm with secret string "1011"
secret = "1011"
circuit = bernstein_vazirani(secret)
print(circuit.draw())

# Execute using StatevectorSampler
sampler = StatevectorSampler()
job = sampler.run([circuit], shots=1024)
result = job.result()
counts = result[0].data.c.get_counts()

print(f"\nSecret string: {secret}")
print(f"Measurement results: {counts}")
print(f"Most frequent result: {max(counts, key=counts.get)}")
```

### Expected Output

```
Secret string: 1011
Measurement results: {'1011': 1024}
Most frequent result: 1011
```

The algorithm finds the secret string with 100% probability in a single query!

---

## Generalizing to Larger Strings

```python
# Test with different secret strings
test_secrets = ["0110", "1111", "1001", "0001"]

for secret in test_secrets:
    circuit = bernstein_vazirani(secret)
    sampler = StatevectorSampler()
    job = sampler.run([circuit], shots=100)
    result = job.result()
    counts = result[0].data.c.get_counts()
    found = max(counts, key=counts.get)
    print(f"Secret: {secret} | Found: {found} | Match: {secret == found}")
```

---

## Comparison Table

| Property | Classical | Quantum (BV) |
|----------|-----------|--------------|
| Queries needed | $n$ | $1$ |
| Speedup type | — | Linear |
| Success probability | 100% | 100% |
| Oracle calls | $n$ | $1$ |

---

## Key Takeaways

1. The Bernstein-Vazirani algorithm finds a secret $n$-bit string with **1 query** instead of the classical $n$ queries
2. The oracle encodes the secret string using **CNOT gates** on positions where $s_i = 1$
3. The circuit structure is identical to Deutsch-Jozsa: H → Oracle → H → Measure
4. The key mechanism is **phase kickback** — the oracle writes information into phases, and the Hadamard transform extracts it
5. This provides a **provable linear speedup** — simple but foundational for understanding more powerful algorithms

---

## Try It Yourself

1. **Modify the secret string**: Change `secret = "1011"` to different values and verify the algorithm always finds it in one shot
2. **Increase the size**: Try secret strings of length 8, 16, or even 32 bits — the algorithm still uses only 1 query
3. **Add noise**: Run on a noisy simulator and observe how errors affect the result
4. **Compare classically**: Write a classical function that determines $s$ bit by bit, and count the number of queries needed
5. **Visualize the circuit**: Use `circuit.draw('mpl')` to see the gate structure for different secrets

---

## Common Mistakes

- **Forgetting to reverse the bit string**: Qiskit uses little-endian ordering, so you may need to reverse the output
- **Not initializing the ancilla to $|1\rangle$**: The phase kickback only works when the ancilla is in the $|-\rangle$ state
- **Confusing with Deutsch-Jozsa**: Both use the same circuit structure, but BV finds a specific string while DJ determines a property of the function

---

## Next Lesson

In the next lesson, we'll study **Simon's Algorithm** — which provides an *exponential* speedup for a different problem and historically inspired the development of Shor's factoring algorithm.
