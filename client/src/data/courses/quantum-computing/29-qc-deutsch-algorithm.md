---
title: "Deutsch Algorithm"
---

# Deutsch Algorithm

In this lesson, you'll learn about the **Deutsch Algorithm** — the first quantum algorithm ever devised that provably outperforms classical computation. While simple, it beautifully illustrates the power of quantum interference.

---

## The Problem

Given a function $f: \{0, 1\} \to \{0, 1\}$ (a 1-bit to 1-bit function), determine whether $f$ is:

- **Constant**: $f(0) = f(1)$ (same output for both inputs)
- **Balanced**: $f(0) \neq f(1)$ (different output for each input)

There are exactly 4 possible functions:

| Function | $f(0)$ | $f(1)$ | Type |
|----------|--------|--------|------|
| $f_1$ | 0 | 0 | Constant |
| $f_2$ | 1 | 1 | Constant |
| $f_3$ | 0 | 1 | Balanced |
| $f_4$ | 1 | 0 | Balanced |

---

## Classical Approach

Classically, you must evaluate $f$ on **both inputs** to determine its type:

1. Query $f(0)$ — get some value
2. Query $f(1)$ — compare with $f(0)$

**Minimum queries needed: 2** (there's no way around it — one query gives no information about the function type).

---

## Quantum Approach

The Deutsch Algorithm determines constant vs. balanced with **exactly 1 query** to the oracle.

### The Key Idea

Instead of evaluating $f$ on individual inputs, we evaluate it on a **superposition** of both inputs simultaneously, then use interference to extract the global property (constant vs. balanced) without knowing individual outputs.

---

## The Circuit

```
         ┌───┐     ┌─────┐     ┌───┐┌───┐
q_0: |0⟩─┤ H ├─────┤     ├─────┤ H ├┤ M ├
         ├───┤     │ U_f │     └───┘└───┘
q_1: |0⟩─┤ X ├─┤H├─┤     ├──────────────
         └───┘     └─────┘
```

Step by step:
1. Initialize: $|0\rangle|0\rangle$
2. Prepare ancilla: $|0\rangle|1\rangle$ (apply X to qubit 1)
3. Apply Hadamard to both: $|+\rangle|-\rangle$
4. Apply oracle $U_f$
5. Apply Hadamard to qubit 0
6. Measure qubit 0

---

## Step-by-Step Mathematical Derivation

### State 1: Initialization

$$|\psi_0\rangle = |0\rangle|0\rangle$$

### State 2: Prepare Ancilla

Apply X to qubit 1:

$$|\psi_1\rangle = |0\rangle|1\rangle$$

### State 3: Apply Hadamard to Both Qubits

$$H|0\rangle = |+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$$

$$H|1\rangle = |-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$$

So:

$$|\psi_2\rangle = |+\rangle|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) \otimes \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$$

### State 4: Apply the Oracle (Phase Kickback!)

The oracle acts as: $U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$

When the ancilla is in state $|-\rangle$, something magical happens:

$$U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle$$

This is **phase kickback** — the function value gets encoded as a phase on the input qubit!

Applying to our superposition:

$$|\psi_3\rangle = \frac{1}{\sqrt{2}}\left[(-1)^{f(0)}|0\rangle + (-1)^{f(1)}|1\rangle\right] \otimes |-\rangle$$

Let's factor out $(-1)^{f(0)}$:

$$|\psi_3\rangle = \frac{(-1)^{f(0)}}{\sqrt{2}}\left[|0\rangle + (-1)^{f(0) \oplus f(1)}|1\rangle\right] \otimes |-\rangle$$

Now define: $f(0) \oplus f(1) = 0$ if constant, $= 1$ if balanced.

So the first qubit is:

$$\begin{cases} \pm|+\rangle & \text{if } f \text{ is constant} \\ \pm|-\rangle & \text{if } f \text{ is balanced} \end{cases}$$

### State 5: Apply Hadamard to Qubit 0

$$H|+\rangle = |0\rangle, \quad H|-\rangle = |1\rangle$$

Therefore:

$$\text{Qubit 0} = \begin{cases} \pm|0\rangle & \text{if } f \text{ is constant} \\ \pm|1\rangle & \text{if } f \text{ is balanced} \end{cases}$$

### State 6: Measure Qubit 0

$$\boxed{\text{Measure } 0 \Rightarrow f \text{ is constant}, \quad \text{Measure } 1 \Rightarrow f \text{ is balanced}}$$

---

## Oracle Implementation

How do we implement $U_f$ for each possible function?

### $f_1$: $f(0) = 0, f(1) = 0$ (constant zero)

The oracle does nothing (identity):

```python
def oracle_constant_zero(qc, input_qubit, output_qubit):
    pass  # Identity — no gates needed
```

### $f_2$: $f(0) = 1, f(1) = 1$ (constant one)

Apply X to the output qubit (flip regardless of input):

```python
def oracle_constant_one(qc, input_qubit, output_qubit):
    qc.x(output_qubit)
```

### $f_3$: $f(0) = 0, f(1) = 1$ (balanced — identity function)

Apply CNOT (flip output when input is 1):

```python
def oracle_balanced_identity(qc, input_qubit, output_qubit):
    qc.cx(input_qubit, output_qubit)
```

### $f_4$: $f(0) = 1, f(1) = 0$ (balanced — NOT function)

Apply CNOT then X to output:

```python
def oracle_balanced_not(qc, input_qubit, output_qubit):
    qc.cx(input_qubit, output_qubit)
    qc.x(output_qubit)
```

---

## Full Qiskit Implementation

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

def deutsch_algorithm(oracle_type):
    """
    Run Deutsch's algorithm to determine if a function is constant or balanced.
    
    Args:
        oracle_type: 'constant_zero', 'constant_one', 'balanced_id', or 'balanced_not'
    
    Returns:
        'constant' or 'balanced'
    """
    # Create circuit: 2 qubits, 1 classical bit
    qc = QuantumCircuit(2, 1)
    
    # Step 1: Prepare ancilla in |1⟩
    qc.x(1)
    
    # Step 2: Apply Hadamard to both qubits
    qc.h(0)
    qc.h(1)
    
    qc.barrier()
    
    # Step 3: Apply oracle
    if oracle_type == 'constant_zero':
        pass  # Identity
    elif oracle_type == 'constant_one':
        qc.x(1)
    elif oracle_type == 'balanced_id':
        qc.cx(0, 1)
    elif oracle_type == 'balanced_not':
        qc.cx(0, 1)
        qc.x(1)
    
    qc.barrier()
    
    # Step 4: Apply Hadamard to qubit 0
    qc.h(0)
    
    # Step 5: Measure qubit 0
    qc.measure(0, 0)
    
    # Run the circuit
    simulator = AerSimulator()
    result = simulator.run(qc, shots=1).result()
    counts = result.get_counts()
    
    # Interpret result
    measured_bit = list(counts.keys())[0]
    
    print(f"Oracle: {oracle_type}")
    print(f"Circuit:\n{qc.draw('text')}")
    print(f"Measurement: {measured_bit}")
    print(f"Result: {'constant' if measured_bit == '0' else 'balanced'}")
    print()
    
    return 'constant' if measured_bit == '0' else 'balanced'

# Test all four oracle types
print("=" * 50)
print("DEUTSCH'S ALGORITHM DEMONSTRATION")
print("=" * 50)
print()

results = {
    'constant_zero': deutsch_algorithm('constant_zero'),
    'constant_one': deutsch_algorithm('constant_one'),
    'balanced_id': deutsch_algorithm('balanced_id'),
    'balanced_not': deutsch_algorithm('balanced_not'),
}

# Verify correctness
assert results['constant_zero'] == 'constant'
assert results['constant_one'] == 'constant'
assert results['balanced_id'] == 'balanced'
assert results['balanced_not'] == 'balanced'
print("All assertions passed! ✓")
```

---

## Why Is This Historically Important?

The Deutsch Algorithm (1985, refined by Deutsch and Jozsa in 1992) was the **first proof that quantum computers can outperform classical ones**:

1. **First quantum speedup**: It showed that quantum parallelism + interference can extract global properties of functions with fewer queries
2. **Proof of concept**: Even though the speedup is tiny (2 queries → 1), it demonstrated a fundamentally different computational model
3. **Foundation for everything**: The techniques (Hadamard, phase kickback, interference) are used in every subsequent quantum algorithm
4. **Inspired Shor and Grover**: Without Deutsch's insight, the revolutionary algorithms of the 1990s might not have been discovered

### The Conceptual Breakthrough

> Classical: "I need to evaluate $f(0)$ and $f(1)$ separately to compare them."

> Quantum: "I can evaluate $f$ on a superposition of 0 and 1, and interference reveals whether the outputs agree or disagree — without telling me what those outputs actually are."

This is the essence of quantum computing: extracting **global properties** of functions without computing individual values.

---

## Visualizing the Interference

For the balanced case ($f(0) \neq f(1)$):

$$\frac{1}{\sqrt{2}}\left[(-1)^{f(0)}|0\rangle + (-1)^{f(1)}|1\rangle\right]$$

Since $f(0) \neq f(1)$, the signs are opposite: $\frac{1}{\sqrt{2}}(|0\rangle - |1\rangle) = |-\rangle$

After Hadamard: $H|-\rangle = |1\rangle$ → **measure 1**

For the constant case ($f(0) = f(1)$):

$$\frac{1}{\sqrt{2}}\left[(-1)^{f(0)}|0\rangle + (-1)^{f(1)}|1\rangle\right]$$

Since $f(0) = f(1)$, the signs are the same: $\pm\frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = \pm|+\rangle$

After Hadamard: $H|+\rangle = |0\rangle$ → **measure 0**

---

## Key Takeaways

1. **Deutsch's Algorithm** determines if a 1-bit function is constant or balanced with **1 query** (classically requires 2)
2. The key ingredients are: **Hadamard** (create superposition), **phase kickback** (encode function in phase), **interference** (distinguish constant from balanced)
3. **Phase kickback** converts $f(x)$ into a phase $(-1)^{f(x)}$ using an ancilla in state $|-\rangle$
4. This was the **first quantum algorithm** to demonstrate a speedup over classical — historically foundational
5. The techniques generalize directly to the Deutsch-Jozsa algorithm (n-bit version)

---

## Try It Yourself

1. **Manual trace**: Pick the oracle for $f(0) = 1, f(1) = 0$ and trace the state vector through every step of the algorithm by hand. Verify you get measurement outcome 1.

2. **Statevector verification**: Modify the code above to print the statevector before measurement using `Statevector.from_instruction()` (remove the measurement gate). Confirm the theoretical prediction.

3. **Without phase kickback**: What happens if you initialize the ancilla to $|0\rangle$ instead of $|1\rangle$ (skip the X gate)? Run the circuit and explain why it fails.

4. **Oracle as a matrix**: Compute the $4 \times 4$ unitary matrix for each of the four oracles. Verify they are all valid quantum gates (unitary matrices).

```python
from qiskit.quantum_info import Operator

# Build oracle circuit and get its matrix
oracle_qc = QuantumCircuit(2)
oracle_qc.cx(0, 1)  # balanced oracle
print(Operator(oracle_qc).data)
```

---

## Next Lesson

In the next lesson, [Deutsch-Jozsa Algorithm](/courses/quantum-computing/deutsch-jozsa), you'll see the generalization to $n$-bit functions — where the quantum speedup becomes exponential: one query instead of up to $2^{n-1} + 1$.
