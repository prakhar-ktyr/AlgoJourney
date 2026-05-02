---
title: Superposition
---

# Superposition

Superposition is arguably the most important concept in quantum computing. It's the property that allows qubits to be in multiple states at once, enabling quantum parallelism and giving quantum computers their computational edge.

---

## What is Superposition?

In classical physics, a system is always in one definite state. A light switch is either ON or OFF. A coin on a table is either HEADS or TAILS.

In quantum mechanics, a system can exist in a **combination** of multiple states simultaneously. This combination is called a **superposition**.

### Mathematical Definition

For a qubit with basis states $|0\rangle$ and $|1\rangle$, the general superposition state is:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

where:
- $\alpha$ and $\beta$ are **complex numbers** called **probability amplitudes**
- $|\alpha|^2$ = probability of measuring $|0\rangle$
- $|\beta|^2$ = probability of measuring $|1\rangle$
- **Normalization constraint**: $|\alpha|^2 + |\beta|^2 = 1$

---

## Visualizing Superposition

### The Spinning Coin Analogy

- **Classical bit**: A coin lying flat — definitely heads (0) or tails (1).
- **Qubit in superposition**: A coin spinning in the air — it's in a combination of heads and tails until it "lands" (is measured).

But this analogy has limits! A spinning coin is actually heads OR tails at each instant — we just don't know which. A qubit in superposition is genuinely in **both states** simultaneously. This isn't just ignorance; it's a fundamentally different kind of reality.

### Vector Representation

We can visualize a qubit state as a vector in 2D space:

```
  |1⟩
   ↑
   |  /  ← |ψ⟩ = α|0⟩ + β|1⟩
   | / θ
   |/___→ |0⟩
```

The state $|\psi\rangle$ is a unit vector that can point anywhere on the unit circle (or more precisely, on the Bloch sphere — covered in a later lesson).

---

## Common Superposition States

### Equal Superposition ($|+\rangle$ state)

$$|+\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$$

- Probability of $|0\rangle$: $|1/\sqrt{2}|^2 = 1/2 = 50\%$
- Probability of $|1\rangle$: $|1/\sqrt{2}|^2 = 1/2 = 50\%$

This is the most "balanced" superposition — equal chance of either outcome. Created by applying a **Hadamard gate** to $|0\rangle$.

### Minus State ($|-\rangle$ state)

$$|-\rangle = \frac{1}{\sqrt{2}}|0\rangle - \frac{1}{\sqrt{2}}|1\rangle$$

Same probabilities as $|+\rangle$ (50/50), but the **phase** is different (the minus sign). This phase difference is invisible in measurement probabilities but crucial for interference — it's the "hidden information" that quantum algorithms exploit.

### Biased Superposition

$$|\psi\rangle = \frac{1}{\sqrt{3}}|0\rangle + \sqrt{\frac{2}{3}}|1\rangle$$

- Probability of $|0\rangle$: $1/3 \approx 33\%$
- Probability of $|1\rangle$: $2/3 \approx 67\%$

---

## Superposition with Multiple Qubits

For $n$ qubits, superposition extends to all $2^n$ basis states:

### Two Qubits

$$|\psi\rangle = \alpha_{00}|00\rangle + \alpha_{01}|01\rangle + \alpha_{10}|10\rangle + \alpha_{11}|11\rangle$$

Four amplitudes, four possible outcomes upon measurement.

### Equal Superposition of $n$ Qubits

Applying a Hadamard gate to each of $n$ qubits (all starting in $|0\rangle$) creates:

$$|+\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle$$

This is a uniform superposition over **all possible $n$-bit strings**. For example, with 3 qubits:

$$\frac{1}{\sqrt{8}}\big(|000\rangle + |001\rangle + |010\rangle + |011\rangle + |100\rangle + |101\rangle + |110\rangle + |111\rangle\big)$$

Each state has equal probability $1/8$. This is the starting point for many quantum algorithms.

---

## Creating Superposition in Code

Here's how to create and measure a superposition using Qiskit:

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create a quantum circuit with 1 qubit and 1 classical bit
qc = QuantumCircuit(1, 1)

# Apply Hadamard gate to put qubit in superposition
qc.h(0)

# Measure the qubit
qc.measure(0, 0)

# Run the circuit 1000 times
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()

# Print the counts
print(result[0].data.c.get_counts())
# Output: approximately {'0': 500, '1': 500}
```

Each run of the circuit gives either 0 or 1 with roughly equal probability — that's superposition in action!

---

## Superposition vs Classical Probability

It's tempting to think of superposition as just "the qubit is 0 or 1 but we don't know which." This is **wrong** and here's why:

### Classical Probability (Coin Flip)

A coin is flipped and covered. It's **definitely** heads or tails — we just don't know which.

```
Classical: P(heads) = 0.5, P(tails) = 0.5
State: definitely one or the other (ignorance)
```

### Quantum Superposition

A qubit in the $|+\rangle$ state is genuinely in **both states at once**.

```
Quantum: |+⟩ = (|0⟩ + |1⟩)/√2
State: both simultaneously (reality)
```

### The Proof: Interference

The difference becomes visible through **interference**. If the qubit were merely in an unknown state (like a hidden coin), applying another Hadamard gate would leave a 50/50 mixture. But because it's in genuine superposition:

$$H|+\rangle = H\left(\frac{|0\rangle + |1\rangle}{\sqrt{2}}\right) = |0\rangle$$

The amplitudes interfere constructively to give $|0\rangle$ with **100% certainty**! A "hidden coin" can't do this.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1, 1)
qc.h(0)    # Put into superposition
qc.h(0)    # Apply H again — interference!
qc.measure(0, 0)

sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
result = job.result()
print(result[0].data.c.get_counts())
# Output: {'0': 1000}  ← always 0! Interference proof.
```

---

## Superposition and Quantum Computing Power

### Why Superposition Matters

1. **Quantum parallelism**: A function applied to $n$ qubits in superposition evaluates the function on all $2^n$ inputs simultaneously.

2. **Algorithm design**: Algorithms like Grover's search work by starting in equal superposition, then using interference to amplify the amplitude of the desired answer.

3. **Entanglement**: Superposition of multi-qubit states can create entanglement — correlations that have no classical analog.

### The Catch

You can't directly read out all $2^n$ values from a superposition. Measurement collapses the state to just **one** outcome. The art of quantum computing is designing algorithms that funnel the superposition into a measurement outcome that gives you the answer you want.

---

## Key Takeaways

- Superposition allows qubits to exist in a combination of $|0\rangle$ and $|1\rangle$ simultaneously.
- The amplitudes $\alpha$ and $\beta$ are complex numbers; their squared magnitudes give measurement probabilities.
- Superposition is fundamentally different from classical uncertainty — interference proves it.
- $n$ qubits in superposition encode $2^n$ states simultaneously, enabling quantum parallelism.
- Measurement collapses superposition — algorithms must be designed to extract useful information.

---

## Try It Yourself

**Problem**: A qubit is in the state $|\psi\rangle = \frac{3}{5}|0\rangle + \frac{4}{5}|1\rangle$.

1. Verify the state is normalized.
2. What is the probability of measuring $|0\rangle$?
3. What is the probability of measuring $|1\rangle$?

**Answers**:
1. $|3/5|^2 + |4/5|^2 = 9/25 + 16/25 = 25/25 = 1$ ✓
2. $P(0) = (3/5)^2 = 9/25 = 36\%$
3. $P(1) = (4/5)^2 = 16/25 = 64\%$

Next, we'll explore **Quantum Entanglement** →
