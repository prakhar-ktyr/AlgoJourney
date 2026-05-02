---
title: "Deutsch-Jozsa Algorithm"
---

# Deutsch-Jozsa Algorithm

In this lesson, you'll learn the **Deutsch-Jozsa Algorithm** — the generalization of Deutsch's algorithm to $n$-bit inputs. It provides the first example of a provable **exponential quantum speedup** over classical deterministic computation.

---

## The Problem

Given a function $f: \{0, 1\}^n \to \{0, 1\}$ that is promised to be either:

- **Constant**: $f(x) = c$ for all inputs $x$ (always 0 or always 1)
- **Balanced**: $f(x) = 0$ for exactly half the inputs and $f(x) = 1$ for the other half

**Goal:** Determine whether $f$ is constant or balanced.

---

## Classical Complexity

### Deterministic

In the worst case, you must check more than half the inputs before you can be sure:

$$\text{Worst case: } 2^{n-1} + 1 \text{ queries}$$

Why? If the first $2^{n-1}$ queries all return 0, it could still be balanced (the other half could all return 1). You need **one more** query to distinguish the cases.

### Probabilistic

With randomness, you can be "pretty sure" with far fewer queries. After $k$ random queries that all return the same value, the probability it's balanced is at most $2^{1-k}$. But you can never be 100% certain!

---

## Quantum Complexity

The Deutsch-Jozsa algorithm determines constant vs. balanced with:

$$\boxed{\text{Exactly 1 query to the oracle}}$$

This is an **exponential speedup** over the deterministic classical approach: 1 query vs. $2^{n-1} + 1$ queries.

---

## The Circuit

The circuit structure is elegant:

$$|0\rangle^{\otimes n}|1\rangle \xrightarrow{H^{\otimes(n+1)}} \xrightarrow{U_f} \xrightarrow{H^{\otimes n} \otimes I} \xrightarrow{\text{Measure}}$$

```
q_0: |0⟩ ─H─┐       ┌─H─┤M├
q_1: |0⟩ ─H─┤       ├─H─┤M├
  ⋮         │  U_f  │
q_n: |0⟩ ─H─┤       ├─H─┤M├
             │       │
anc: |1⟩ ─H─┘       └────────
```

Steps:
1. Initialize $n$ qubits to $|0\rangle$ and 1 ancilla to $|1\rangle$
2. Apply $H$ to all $n+1$ qubits
3. Apply oracle $U_f$
4. Apply $H$ to the first $n$ qubits (not the ancilla)
5. Measure the first $n$ qubits

**Decision rule:**
- If all measurements are $0$ → function is **constant**
- If any measurement is $1$ → function is **balanced**

---

## Detailed Mathematical Derivation

### Step 1: Initial State

$$|\psi_0\rangle = |0\rangle^{\otimes n}|1\rangle$$

### Step 2: Apply Hadamard to All Qubits

For the first $n$ qubits:

$$H^{\otimes n}|0\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} |x\rangle$$

For the ancilla:

$$H|1\rangle = |-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$$

Combined state:

$$|\psi_1\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} |x\rangle \otimes |-\rangle$$

### Step 3: Apply Oracle $U_f$

Using phase kickback (as in Deutsch's algorithm):

$$U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle$$

Therefore:

$$|\psi_2\rangle = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} (-1)^{f(x)}|x\rangle \otimes |-\rangle$$

### Step 4: Apply Hadamard to First $n$ Qubits

We use the identity for the Hadamard transform on computational basis states:

$$H^{\otimes n}|x\rangle = \frac{1}{\sqrt{2^n}} \sum_{y=0}^{2^n-1} (-1)^{x \cdot y}|y\rangle$$

where $x \cdot y = x_1 y_1 \oplus x_2 y_2 \oplus \cdots \oplus x_n y_n$ is the bitwise dot product mod 2.

Applying to our state:

$$|\psi_3\rangle = \frac{1}{2^n} \sum_{y=0}^{2^n-1} \left[\sum_{x=0}^{2^n-1} (-1)^{f(x) + x \cdot y}\right]|y\rangle \otimes |-\rangle$$

### Step 5: Measure — The Key Insight

The amplitude of the all-zeros state $|0\rangle^{\otimes n}$ is:

$$\alpha_{0\cdots0} = \frac{1}{2^n} \sum_{x=0}^{2^n-1} (-1)^{f(x)}$$

(Since $x \cdot 0 = 0$ for all $x$)

**Case 1: $f$ is constant**

If $f(x) = 0$ for all $x$: $\alpha_{0\cdots0} = \frac{1}{2^n} \cdot 2^n = 1$

If $f(x) = 1$ for all $x$: $\alpha_{0\cdots0} = \frac{1}{2^n} \cdot (-2^n) = -1$

Either way: $|\alpha_{0\cdots0}|^2 = 1$ — we **always** measure all zeros!

**Case 2: $f$ is balanced**

Half the terms are $+1$ and half are $-1$:

$$\alpha_{0\cdots0} = \frac{1}{2^n}(2^{n-1} \cdot 1 + 2^{n-1} \cdot (-1)) = \frac{1}{2^n} \cdot 0 = 0$$

The probability of measuring all zeros is exactly 0 — we **never** measure all zeros!

$$\boxed{P(|0\rangle^{\otimes n}) = \begin{cases} 1 & \text{if } f \text{ is constant} \\ 0 & \text{if } f \text{ is balanced} \end{cases}}$$

---

## Oracle Construction

### Constant Oracle ($f(x) = 0$ for all $x$)

Do nothing — identity operation:

```python
def constant_zero_oracle(qc, input_qubits, ancilla):
    pass  # No gates needed
```

### Constant Oracle ($f(x) = 1$ for all $x$)

Flip the ancilla unconditionally:

```python
def constant_one_oracle(qc, input_qubits, ancilla):
    qc.x(ancilla)
```

### Balanced Oracle Example: Parity Function

$f(x) = x_1 \oplus x_2 \oplus \cdots \oplus x_n$ (XOR of all bits):

```python
def parity_oracle(qc, input_qubits, ancilla):
    for qubit in input_qubits:
        qc.cx(qubit, ancilla)
```

### Balanced Oracle Example: First Bit

$f(x) = x_1$ (output equals first bit):

```python
def first_bit_oracle(qc, input_qubits, ancilla):
    qc.cx(input_qubits[0], ancilla)
```

### General Balanced Oracle

For any subset $S$ of inputs where $f(x) = 1$ (with $|S| = 2^{n-1}$):

```python
def general_balanced_oracle(qc, input_qubits, ancilla, marked_bitstring):
    """Oracle that marks a specific input pattern."""
    # Flip qubits that should be |0⟩ in the target
    for i, bit in enumerate(marked_bitstring):
        if bit == '0':
            qc.x(input_qubits[i])
    
    # Multi-controlled NOT
    qc.mcx(input_qubits, ancilla)
    
    # Unflip
    for i, bit in enumerate(marked_bitstring):
        if bit == '0':
            qc.x(input_qubits[i])
```

---

## Full Qiskit Implementation (n=3)

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def deutsch_jozsa(n, oracle_function):
    """
    Implement the Deutsch-Jozsa algorithm for n-bit functions.
    
    Args:
        n: Number of input bits
        oracle_function: Function that adds oracle gates to the circuit
    
    Returns:
        'constant' or 'balanced'
    """
    # n input qubits + 1 ancilla qubit, n classical bits
    qc = QuantumCircuit(n + 1, n)
    
    # Step 1: Initialize ancilla to |1⟩
    qc.x(n)
    
    # Step 2: Apply Hadamard to all qubits
    qc.h(range(n + 1))
    
    qc.barrier()
    
    # Step 3: Apply oracle
    oracle_function(qc, list(range(n)), n)
    
    qc.barrier()
    
    # Step 4: Apply Hadamard to input qubits (not ancilla)
    qc.h(range(n))
    
    # Step 5: Measure input qubits
    qc.measure(range(n), range(n))
    
    # Execute
    simulator = AerSimulator()
    result = simulator.run(qc, shots=1024).result()
    counts = result.get_counts()
    
    # Decision: if all-zeros has probability ~1, it's constant
    all_zeros = '0' * n
    
    print(f"Circuit (n={n}):")
    print(qc.draw('text'))
    print(f"Counts: {counts}")
    
    if all_zeros in counts and counts[all_zeros] == 1024:
        return 'constant'
    else:
        return 'balanced'


# === Define oracles for n=3 ===

def oracle_constant(qc, input_qubits, ancilla):
    """f(x) = 0 for all x (constant)"""
    pass

def oracle_balanced_parity(qc, input_qubits, ancilla):
    """f(x) = x0 ⊕ x1 ⊕ x2 (balanced: XOR/parity function)"""
    for q in input_qubits:
        qc.cx(q, ancilla)

def oracle_balanced_first_bit(qc, input_qubits, ancilla):
    """f(x) = x0 (balanced: depends only on first bit)"""
    qc.cx(input_qubits[0], ancilla)

def oracle_balanced_majority(qc, input_qubits, ancilla):
    """
    f(x) = 1 if majority of bits are 1 (for n=3: balanced)
    Marks: 011, 101, 110, 111
    """
    # XOR pairs to detect majority
    qc.cx(input_qubits[0], ancilla)
    qc.cx(input_qubits[1], ancilla)
    qc.ccx(input_qubits[0], input_qubits[1], ancilla)
    qc.cx(input_qubits[2], ancilla)
    qc.ccx(input_qubits[0], input_qubits[2], ancilla)
    qc.ccx(input_qubits[1], input_qubits[2], ancilla)


# === Run the algorithm ===

print("=" * 60)
print("DEUTSCH-JOZSA ALGORITHM (n=3)")
print("=" * 60)
print()

n = 3

print("--- Test 1: Constant oracle (f=0 for all x) ---")
result1 = deutsch_jozsa(n, oracle_constant)
print(f"Result: {result1}\n")

print("--- Test 2: Balanced oracle (parity function) ---")
result2 = deutsch_jozsa(n, oracle_balanced_parity)
print(f"Result: {result2}\n")

print("--- Test 3: Balanced oracle (first bit) ---")
result3 = deutsch_jozsa(n, oracle_balanced_first_bit)
print(f"Result: {result3}\n")

# Verify
assert result1 == 'constant'
assert result2 == 'balanced'
assert result3 == 'balanced'
print("All assertions passed! ✓")
```

---

## Understanding the Interference

Let's trace the amplitudes for the parity oracle with $n = 3$:

The parity function: $f(x) = x_0 \oplus x_1 \oplus x_2$

After the oracle, each state $|x\rangle$ picks up phase $(-1)^{f(x)}$:

| $x$ | Binary | $f(x) = x_0 \oplus x_1 \oplus x_2$ | Phase $(-1)^{f(x)}$ |
|-----|--------|------|-------|
| 0 | 000 | 0 | +1 |
| 1 | 001 | 1 | -1 |
| 2 | 010 | 1 | -1 |
| 3 | 011 | 0 | +1 |
| 4 | 100 | 1 | -1 |
| 5 | 101 | 0 | +1 |
| 6 | 110 | 0 | +1 |
| 7 | 111 | 1 | -1 |

The amplitude of $|000\rangle$ after the final Hadamard:

$$\alpha_{000} = \frac{1}{8}\sum_{x=0}^{7}(-1)^{f(x)} = \frac{1}{8}(+1-1-1+1-1+1+1-1) = 0$$

The positive and negative terms perfectly cancel — **destructive interference** eliminates the all-zeros outcome. So we always measure something other than $000$, confirming the function is balanced.

---

## Significance of Deutsch-Jozsa

### What It Proves

1. **Exponential separation**: 1 query (quantum) vs. $2^{n-1}+1$ queries (classical deterministic)
2. **Deterministic, not probabilistic**: The algorithm gives the correct answer with probability 1, every single time
3. **Interference is the mechanism**: The speedup comes entirely from constructive/destructive interference of amplitudes

### Limitations

1. **The promise matters**: The function MUST be constant or balanced — the algorithm gives meaningless results for other functions
2. **Probabilistic classical algorithms close the gap**: A randomized algorithm needs only $O(1)$ queries to be "almost certain" (making the quantum advantage less dramatic in practice)
3. **Not practically useful**: No real-world application needs to solve exactly this problem

### Historical Significance

Despite the limitations, Deutsch-Jozsa was crucial because:
- First **exponential** quantum speedup (Deutsch's original was just 2→1)
- Inspired Simon's algorithm, which led directly to **Shor's algorithm**
- Established the oracle model as the framework for proving quantum speedups
- Showed that quantum interference can extract global properties exponentially faster

---

## Comparison: Classical vs. Quantum

| Aspect | Classical (Deterministic) | Classical (Randomized) | Quantum |
|--------|--------------------------|----------------------|---------|
| Queries | $2^{n-1} + 1$ | $O(1)$ for high confidence | 1 |
| Certainty | 100% | $1 - 2^{-k}$ after $k$ queries | 100% |
| Speedup vs classical | — | — | Exponential (deterministic) |

---

## Key Takeaways

1. **Deutsch-Jozsa** determines if an $n$-bit function is constant or balanced with **exactly 1 quantum query** vs. $2^{n-1}+1$ classical queries
2. The circuit follows: $H^{\otimes n} \to \text{Oracle} \to H^{\otimes n} \to \text{Measure}$
3. **All zeros** measurement → constant; **any non-zero** → balanced (with 100% certainty)
4. The speedup is **exponential** and **deterministic** — this is a genuine quantum advantage
5. **Phase kickback** + **interference** are the key mechanisms: the oracle encodes $f$ in phases, then Hadamard creates interference that amplifies/cancels based on the global property
6. This algorithm historically led to Simon's algorithm and eventually to **Shor's factoring algorithm**

---

## Try It Yourself

1. **Scale it up**: Implement Deutsch-Jozsa for $n=5$ with a balanced oracle of your choice. Verify you never get the all-zeros outcome.

2. **Verify the math**: For $n=2$, enumerate all 6 possible functions (2 constant + 4 balanced with $|S|=2$). Implement oracles for each and verify the algorithm works correctly.

3. **Statevector analysis**: Remove the measurement from the circuit and use `Statevector.from_instruction()` to examine the state before measurement. Confirm that $|0\rangle^{\otimes n}$ has amplitude exactly 0 for balanced functions and amplitude ±1 for constant functions.

4. **Break the promise**: What happens if you give the algorithm a function that is neither constant nor balanced (e.g., $f(x)=1$ for 3 out of 8 inputs)? Run the experiment and observe the measurement statistics.

```python
# Starter code for exercise 4
def broken_promise_oracle(qc, input_qubits, ancilla):
    """f(x) = 1 only for x = 000 and x = 001 and x = 010 (3/8 inputs)"""
    # Mark |000⟩
    qc.x(input_qubits[0])
    qc.x(input_qubits[1])
    qc.x(input_qubits[2])
    qc.mcx(input_qubits, ancilla)
    qc.x(input_qubits[0])
    qc.x(input_qubits[1])
    qc.x(input_qubits[2])
    # Mark |001⟩
    qc.x(input_qubits[1])
    qc.x(input_qubits[2])
    qc.mcx(input_qubits, ancilla)
    qc.x(input_qubits[1])
    qc.x(input_qubits[2])
    # Mark |010⟩
    qc.x(input_qubits[0])
    qc.x(input_qubits[2])
    qc.mcx(input_qubits, ancilla)
    qc.x(input_qubits[0])
    qc.x(input_qubits[2])

# Run and observe — what do you get?
result = deutsch_jozsa(3, broken_promise_oracle)
print(f"Result (promise broken): {result}")
```

---

## Next Lesson

In the next lesson, [Bernstein-Vazirani Algorithm](/courses/quantum-computing/bernstein-vazirani), you'll learn another elegant quantum algorithm that finds a hidden binary string with a single query — a problem that classically requires $n$ queries. It builds directly on the techniques you've learned here.
