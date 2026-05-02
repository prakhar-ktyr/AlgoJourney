---
title: "Introduction to Quantum Algorithms"
---

# Introduction to Quantum Algorithms

In this lesson, you'll learn what makes a quantum algorithm fundamentally different from a classical one, the key ingredients that enable quantum speedups, and get an overview of the major quantum algorithms and the problems they solve.

---

## What Makes an Algorithm "Quantum"?

A **quantum algorithm** is a step-by-step procedure that runs on a quantum computer, exploiting quantum mechanical phenomena to solve problems faster than any known classical algorithm.

The three key quantum resources are:

1. **Superposition** — Process multiple inputs simultaneously
2. **Entanglement** — Create correlations impossible in classical systems
3. **Interference** — Amplify correct answers and cancel wrong ones

> **Important:** Superposition alone doesn't give speedup. The magic happens when you use interference to make correct answers constructively interfere (amplify) and wrong answers destructively interfere (cancel).

---

## Quantum Speedup Classes

Not all quantum algorithms provide the same level of improvement:

| Speedup Type | Classical | Quantum | Example |
|-------------|-----------|---------|---------|
| **Exponential** | $O(2^n)$ | $O(\text{poly}(n))$ | Shor's algorithm (factoring) |
| **Polynomial** | $O(n^k)$ | $O(n^{k-j})$ | Quantum simulation |
| **Quadratic** | $O(N)$ | $O(\sqrt{N})$ | Grover's search |
| **Superpolynomial** | $O(2^{n^{1/3}})$ | $O(\text{poly}(n))$ | Some lattice problems (conjectured) |

### Why the Type of Speedup Matters

- **Exponential speedups** are transformative — they make impossible problems feasible
- **Quadratic speedups** are useful but more modest — halving the exponent
- **Constant-factor speedups** are generally NOT worth the overhead of quantum hardware

---

## The Quantum Algorithm Design Pattern

Almost all quantum algorithms follow this pattern:

$$|0\rangle^{\otimes n} \xrightarrow{\text{1. Prepare}} |\psi\rangle \xrightarrow{\text{2. Process}} |\psi'\rangle \xrightarrow{\text{3. Interfere}} |\phi\rangle \xrightarrow{\text{4. Measure}} \text{answer}$$

### Step 1: Prepare Superposition

Apply Hadamard gates to create an equal superposition of all inputs:

$$H^{\otimes n}|0\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle$$

This encodes $2^n$ inputs simultaneously in $n$ qubits.

### Step 2: Apply Operations (Oracle/Unitary)

Apply a quantum operation that encodes the problem. This might be:
- An **oracle** that marks solutions
- A **unitary** that simulates a physical system
- A **sequence of gates** implementing a mathematical function

### Step 3: Use Interference

Apply operations that cause:
- **Constructive interference** on correct/desired states (amplitudes add up)
- **Destructive interference** on incorrect states (amplitudes cancel out)

$$\text{Probability} = |\text{amplitude}|^2$$

### Step 4: Measure

Measurement collapses the state to a single outcome. If interference worked correctly, the desired answer has high probability.

```python
from qiskit import QuantumCircuit

# The general pattern
n = 3
qc = QuantumCircuit(n, n)

# Step 1: Prepare superposition
qc.h(range(n))

# Step 2: Apply problem-specific operations
# (oracle or unitary goes here)
qc.barrier()

# Step 3: Interference (often more Hadamards)
qc.h(range(n))

# Step 4: Measure
qc.measure(range(n), range(n))
```

---

## Complexity Classes

Quantum computing has its own complexity classes:

### BQP (Bounded-Error Quantum Polynomial Time)

The class of problems solvable by a quantum computer in polynomial time with error probability ≤ 1/3.

$$\text{P} \subseteq \text{BQP} \subseteq \text{PSPACE}$$

- Everything a classical computer can do efficiently (P), a quantum computer can too
- BQP is believed to be strictly larger than P (but this is unproven!)
- BQP doesn't contain all of NP (quantum computers probably can't solve NP-complete problems efficiently)

### QMA (Quantum Merlin-Arthur)

The quantum analog of NP — problems where a quantum proof can be verified efficiently by a quantum computer.

$$\text{BQP} \subseteq \text{QMA} \subseteq \text{PSPACE}$$

### Relationship Diagram

```
P ⊆ BPP ⊆ BQP ⊆ PSPACE
P ⊆ NP  ⊆ QMA ⊆ PSPACE
```

> **Key insight:** Quantum computers are NOT known to solve NP-complete problems efficiently. They provide speedups for specific problem structures.

---

## Overview of Major Quantum Algorithms

| Algorithm | Problem | Speedup | Year |
|-----------|---------|---------|------|
| **Deutsch-Jozsa** | Constant vs balanced function | Exponential (query) | 1992 |
| **Bernstein-Vazirani** | Find hidden string | Exponential (query) | 1993 |
| **Simon's** | Find period of 2-to-1 function | Exponential | 1994 |
| **Shor's** | Integer factoring | Exponential | 1994 |
| **Grover's** | Unstructured search | Quadratic | 1996 |
| **Quantum Phase Estimation** | Eigenvalue estimation | Exponential | 1995 |
| **HHL** | Linear systems of equations | Exponential (conditional) | 2009 |
| **VQE/QAOA** | Optimization/chemistry | Heuristic | 2014+ |
| **Quantum Walk** | Graph problems | Various | 2000s |

### The Big Three

1. **Shor's Algorithm**: Factors integers in polynomial time → breaks RSA encryption
2. **Grover's Algorithm**: Searches unsorted databases quadratically faster
3. **Quantum Simulation**: Simulates quantum systems exponentially faster than classical

---

## The No-Cloning Theorem

A fundamental constraint on quantum algorithm design:

> **No-Cloning Theorem:** It is impossible to create an exact copy of an arbitrary unknown quantum state.

$$\nexists \; U : U|ψ\rangle|0\rangle = |ψ\rangle|ψ\rangle \quad \text{for all } |ψ\rangle$$

### Impact on Algorithm Design

1. **No copying intermediate results** — you can't "save" a quantum state for later
2. **No fan-out** — unlike classical bits, you can't duplicate a qubit's value
3. **Measurement destroys information** — once measured, the superposition collapses
4. **Error correction is harder** — can't just copy a qubit to check for errors (must use entanglement instead)

```python
# This is IMPOSSIBLE in quantum computing:
# qc.copy(qubit_source, qubit_destination)  # ← NOT a valid operation

# Instead, you can ENTANGLE qubits (NOT the same as copying):
qc = QuantumCircuit(2)
qc.cx(0, 1)  # This entangles, not copies
# If qubit 0 is in |ψ⟩ = α|0⟩ + β|1⟩, the result is α|00⟩ + β|11⟩
# This is NOT two copies of |ψ⟩!
```

---

## The Oracle Model

Many quantum algorithms use **oracles** (black-box functions):

### What Is an Oracle?

An oracle $U_f$ implements a classical function $f$ as a reversible quantum gate:

$$U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$$

Where $\oplus$ is XOR (addition mod 2).

### Phase Oracle (Alternative Form)

A phase oracle marks solutions by flipping their phase:

$$O_f|x\rangle = (-1)^{f(x)}|x\rangle$$

This is achieved using the "phase kickback" trick with an ancilla in state $|-\rangle$:

$$U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle$$

### Why Oracles?

- They let us analyze algorithm complexity in terms of **query count**
- We can prove lower bounds: "no algorithm can solve this with fewer than $k$ queries"
- Real implementations replace the oracle with an actual circuit computing $f$

```python
# Example: Oracle for f(x) = 1 when x = |11⟩ (2-bit input)
def build_oracle(qc, input_qubits, output_qubit):
    """Marks |11⟩ by flipping the output qubit."""
    qc.ccx(input_qubits[0], input_qubits[1], output_qubit)

# Phase oracle using kickback
qc = QuantumCircuit(3)
qc.x(2)       # Put ancilla in |1⟩
qc.h(2)       # Put ancilla in |−⟩

# Now applying the oracle gives phase kickback
build_oracle(qc, [0, 1], 2)
```

---

## Classical vs. Quantum Thinking

| Classical Approach | Quantum Approach |
|-------------------|------------------|
| Process inputs one at a time | Process all inputs in superposition |
| Copy freely | No cloning — use entanglement instead |
| Deterministic or random | Amplitudes (complex numbers) with interference |
| Read intermediate results | Measurement destroys quantum state |
| Optimize time OR space | Must optimize both (qubits are expensive) |

---

## Key Takeaways

1. Quantum algorithms exploit **superposition**, **entanglement**, and **interference** — interference is the key to speedup
2. The standard pattern is: prepare superposition → encode problem → use interference → measure
3. Speedups range from **quadratic** (Grover) to **exponential** (Shor), but quantum computers likely can't solve NP-complete problems efficiently
4. **BQP** is the class of problems quantum computers solve efficiently; it's believed to be larger than P but doesn't contain all of NP
5. The **no-cloning theorem** fundamentally constrains algorithm design
6. **Oracles** provide a framework for analyzing query complexity and proving speedup bounds

---

## Try It Yourself

1. **Superposition scale**: Write code that creates equal superposition on $n$ qubits and prints the resulting statevector. Verify that each amplitude is $\frac{1}{\sqrt{2^n}}$.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 4
qc = QuantumCircuit(n)
qc.h(range(n))
state = Statevector.from_instruction(qc)
print(state)
# Verify: each amplitude should be 1/sqrt(2^n) = 1/4
```

2. **Phase kickback**: Implement a phase oracle for the function $f(x) = 1$ when $x = |101\rangle$ (3-bit input). Use an ancilla qubit in state $|-\rangle$ to achieve phase kickback.

3. **No-cloning experiment**: Try to "copy" a qubit in state $|+\rangle$ using CNOT. Show that the result is an entangled state $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$, not two copies of $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$.

4. **Query counting**: Consider the function $f:\{0,1\}^3 \to \{0,1\}$. Classically, how many queries do you need to determine $f$ completely? What about just checking if $f$ is constant?

---

## Next Lesson

In the next lesson, [Deutsch Algorithm](/courses/quantum-computing/deutsch-algorithm), you'll see your first complete quantum algorithm — a simple but profound demonstration that a quantum computer can answer a question with one query that classically requires two.
