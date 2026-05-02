---
title: "Quantum Circuits"
---

# Quantum Circuits

In this lesson, you'll learn about the **quantum circuit model** — the standard way to describe and visualize quantum computations. Just as classical computers use logic gates wired together, quantum computers use quantum gates arranged in circuits.

---

## What Is a Quantum Circuit?

A **quantum circuit** is a computational model that describes a sequence of quantum gates applied to qubits. It is the most common way to represent quantum algorithms.

Think of it as a blueprint for a quantum computation:

- **Wires** (horizontal lines) represent qubits
- **Boxes/symbols** on wires represent quantum gates
- **Time flows from left to right** — gates on the left are applied first
- **Measurement symbols** (meter icon) indicate where we read the qubit

$$
|q_0\rangle \longrightarrow \boxed{H} \longrightarrow \boxed{CNOT} \longrightarrow \boxed{M}
$$

---

## Anatomy of a Quantum Circuit

### Wires (Qubits)

Each horizontal line represents one qubit. The number of wires is the **width** of the circuit.

- Qubits are initialized to $|0\rangle$ by default
- Classical bits (for measurement results) are shown as double lines

### Gates (Operations)

Gates are drawn as boxes or symbols on the wires:

| Gate | Symbol | Matrix |
|------|--------|--------|
| Hadamard | H | $\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ |
| Pauli-X | X | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ |
| CNOT | ●—⊕ | Control dot on one wire, target ⊕ on another |

### Measurements

Measurement collapses the qubit state and produces a classical bit. It's represented by a meter symbol at the end of a wire.

---

## Circuit Depth vs. Width

Two important metrics describe circuit complexity:

- **Width**: The number of qubits used (number of wires)
- **Depth**: The number of time steps (layers of gates that can't run in parallel)

$$\text{Depth} = \text{longest path from input to output}$$

**Example:**

```
q0: ─H─●─────
       │
q1: ───⊕─H───
```

This circuit has **width = 2** and **depth = 3** (H, CNOT, H are in sequence on the longest path).

> **Why depth matters:** Lower depth means faster execution and less decoherence. Quantum computers have limited coherence time, so minimizing depth is critical.

---

## Composing Circuits

### Sequential Composition

Gates applied one after another on the same qubit:

$$U_{\text{total}} = U_3 \cdot U_2 \cdot U_1$$

> **Note:** Matrix multiplication is right-to-left, but circuit diagrams read left-to-right. The leftmost gate in the diagram corresponds to the rightmost matrix in the product.

### Parallel Composition

Gates applied simultaneously on different qubits use the **tensor product**:

$$U_{\text{parallel}} = U_A \otimes U_B$$

If gate $A$ acts on qubit 0 and gate $B$ acts on qubit 1 at the same time step:

$$U = A \otimes B$$

---

## Classical Control and Measurement

### Mid-Circuit Measurement

You can measure a qubit in the middle of a circuit and use the result to control later gates:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 1)
qc.h(0)
qc.measure(0, 0)  # Measure qubit 0, store in classical bit 0

# Classically controlled gate: apply X to qubit 1 if classical bit 0 is 1
with qc.if_test((0, 1)):
    qc.x(1)
```

This is called **classical feedforward** and is essential for:
- Quantum error correction
- Teleportation protocols
- Adaptive algorithms

---

## Barrier and Identity Operations

### Barrier

A **barrier** prevents the transpiler from optimizing across it. It doesn't change the quantum state but acts as a "fence":

```python
qc = QuantumCircuit(2)
qc.h(0)
qc.barrier()  # Transpiler won't merge gates across this line
qc.cx(0, 1)
```

Use barriers to:
- Separate logical sections of your circuit
- Prevent unwanted gate cancellations during optimization
- Make circuit diagrams more readable

### Identity Gate

The identity gate $I$ does nothing — it leaves the qubit unchanged:

$$I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$$

It's useful as a placeholder or in mathematical derivations.

---

## Building Complex Circuits in Qiskit

Here's how to build a complete quantum circuit step by step:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Create a circuit with 3 qubits and 3 classical bits
qc = QuantumCircuit(3, 3)

# Layer 1: Put all qubits in superposition
qc.h(0)
qc.h(1)
qc.h(2)

# Layer 2: Entangle qubits
qc.cx(0, 1)  # CNOT: control=0, target=1
qc.cx(1, 2)  # CNOT: control=1, target=2

# Layer 3: Phase rotation
qc.t(0)      # T gate on qubit 0
qc.s(1)      # S gate on qubit 1

# Layer 4: More entanglement
qc.cx(0, 2)

# Measure all qubits
qc.measure([0, 1, 2], [0, 1, 2])

print(qc)
```

### Appending Circuits

You can compose circuits by appending one to another:

```python
# Create sub-circuits
sub1 = QuantumCircuit(2, name="prepare")
sub1.h(0)
sub1.cx(0, 1)

sub2 = QuantumCircuit(2, name="measure_bell")
sub2.cx(0, 1)
sub2.h(0)

# Combine them
full = QuantumCircuit(2, 2)
full.compose(sub1, inplace=True)
full.barrier()
full.compose(sub2, inplace=True)
full.measure([0, 1], [0, 1])
```

---

## Drawing Circuits with `qc.draw()`

Qiskit provides multiple drawing formats:

```python
# Text-based (default in terminals)
print(qc.draw('text'))

# Matplotlib figure (best for notebooks)
qc.draw('mpl')

# LaTeX source code
print(qc.draw('latex_source'))
```

**Example output (text format):**

```
     ┌───┐     ┌───┐┌───┐
q_0: ┤ H ├──●──┤ T ├┤ M ├
     ├───┤┌─┴─┐├───┤└╥──┘
q_1: ┤ H ├┤ X ├┤ S ├─╫───
     ├───┤└───┘└───┘ ║
q_2: ┤ H ├───────────╫───
     └───┘           ║
c: 3/════════════════╩════
```

### Customizing Circuit Drawings

```python
# Reverse bit order (match textbook conventions)
qc.draw('mpl', reverse_bits=True)

# Add a title
qc.draw('mpl', plot_barriers=True, style={'name': 'iqp'})
```

---

## Circuit Optimization Basics

Real quantum hardware has constraints:
- Limited gate sets (only certain gates are native)
- Limited connectivity (not all qubits are connected)
- Gate errors increase with circuit depth

**Basic optimization strategies:**

1. **Gate cancellation**: $XX = I$, so two consecutive X gates can be removed
2. **Gate merging**: Two rotations $R_z(\theta_1)R_z(\theta_2) = R_z(\theta_1 + \theta_2)$
3. **Commutation**: Reorder gates that commute to enable cancellations
4. **Decomposition**: Break complex gates into native gate sets

```python
from qiskit import transpile
from qiskit.providers.fake_provider import GenericBackendV2

# Create a backend with specific connectivity
backend = GenericBackendV2(5)

# Transpile for the target hardware
optimized = transpile(qc, backend=backend, optimization_level=2)
print(f"Original depth: {qc.depth()}")
print(f"Optimized depth: {optimized.depth()}")
```

---

## Key Takeaways

1. **Quantum circuits** are the standard model for quantum computation — wires are qubits, boxes are gates, time flows left to right
2. **Width** is the number of qubits; **depth** is the number of sequential time steps
3. Sequential gates multiply as matrices (right-to-left); parallel gates combine via tensor product
4. **Barriers** prevent optimization across sections; the **identity** gate is a no-op
5. Use `qc.draw()` in Qiskit to visualize circuits in text, matplotlib, or LaTeX
6. Circuit **optimization** reduces depth and adapts circuits to hardware constraints

---

## Try It Yourself

1. **Build a GHZ circuit**: Create a 4-qubit circuit that produces the state $\frac{1}{\sqrt{2}}(|0000\rangle + |1111\rangle)$. Hint: Use H on qubit 0, then CNOT from qubit 0 to each other qubit.

2. **Measure circuit metrics**: Build a circuit with at least 5 gates. Print its depth, width, and total gate count using `qc.depth()`, `qc.width()`, and `qc.size()`.

3. **Compare drawings**: Create a 3-qubit circuit and draw it using both `'text'` and `'mpl'` formats. Notice the differences in representation.

4. **Optimization experiment**: Create a circuit with redundant gates (e.g., apply H twice to the same qubit). Transpile it with `optimization_level=3` and compare the depth before and after.

---

## Next Lesson

In the next lesson, [Circuit Identities and Simplification](/courses/quantum-computing/circuit-identities), you'll learn the mathematical rules for simplifying quantum circuits — gate cancellations, commutation relations, and how to use the Qiskit transpiler for automatic optimization.
