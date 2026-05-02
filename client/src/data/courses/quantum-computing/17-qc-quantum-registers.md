---
title: "Quantum Registers"
---

# Quantum Registers

In real quantum programs, we organize qubits into **registers** — named groups that represent meaningful parts of our computation. This lesson covers what quantum registers are, how to create and use them in Qiskit, and important conventions about qubit ordering.

---

## What Is a Quantum Register?

A **quantum register** is a collection of qubits that are grouped together for logical organization. Think of it like an array or variable in classical programming — it gives a name and structure to a set of qubits.

In a quantum algorithm, you might have:
- An **input register** holding the data to process
- An **output register** storing the result
- An **ancilla register** for temporary workspace qubits

Registers don't change the physics — they are an organizational tool that makes circuits easier to read, write, and debug.

---

## Registers in Qiskit

Qiskit provides two main register types:

| Register Type | Class | Purpose |
|---|---|---|
| Quantum Register | `QuantumRegister` | Holds qubits for quantum operations |
| Classical Register | `ClassicalRegister` | Holds classical bits for measurement results |

### Basic Usage

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Create named registers
qr = QuantumRegister(3, name='q')   # 3 qubits named q[0], q[1], q[2]
cr = ClassicalRegister(3, name='c') # 3 classical bits

# Build circuit from registers
qc = QuantumCircuit(qr, cr)
qc.h(qr[0])
qc.cx(qr[0], qr[1])
qc.measure(qr, cr)

print(qc.draw())
```

---

## Initializing Registers

### Single Register Circuit

The simplest approach — one quantum register and one classical register:

```python
from qiskit import QuantumCircuit

# Shorthand: 3 qubits, 3 classical bits
qc = QuantumCircuit(3, 3)

# Qubits accessed by index: qc.h(0), qc.cx(0, 1)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)
qc.measure([0, 1, 2], [0, 1, 2])
print(qc.draw())
```

### Multiple Named Registers

For complex algorithms, use multiple registers:

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Grover's algorithm style registers
input_reg = QuantumRegister(3, name='input')
ancilla = QuantumRegister(1, name='ancilla')
output = ClassicalRegister(3, name='result')

qc = QuantumCircuit(input_reg, ancilla, output)

# Apply gates to specific registers
qc.h(input_reg)          # Hadamard on all input qubits
qc.x(ancilla[0])         # Flip the ancilla
qc.h(ancilla[0])         # Put ancilla in |-⟩ state

print(qc.draw())
```

---

## Register Operations and Conventions

### Accessing Individual Qubits

```python
from qiskit import QuantumRegister, QuantumCircuit

qr = QuantumRegister(4, 'data')
qc = QuantumCircuit(qr)

# Access by index
qc.h(qr[0])        # First qubit
qc.x(qr[3])        # Last qubit

# Apply gate to entire register (broadcasts to all qubits)
qc.h(qr)           # Hadamard on all 4 qubits
```

### Slicing Registers

```python
from qiskit import QuantumRegister, QuantumCircuit

qr = QuantumRegister(5, 'q')
qc = QuantumCircuit(qr)

# Apply to a subset using Python list indexing
qc.h(qr[0:3])      # Hadamard on qubits 0, 1, 2
qc.x(qr[3:5])      # X gate on qubits 3, 4
```

### Combining Registers in a Circuit

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Teleportation circuit with named registers
msg = QuantumRegister(1, name='msg')       # Message qubit
bell = QuantumRegister(2, name='bell')     # Bell pair
crz = ClassicalRegister(1, name='crz')    # Controls for Z
crx = ClassicalRegister(1, name='crx')    # Controls for X

qc = QuantumCircuit(msg, bell, crz, crx)

# Create Bell pair
qc.h(bell[0])
qc.cx(bell[0], bell[1])

qc.barrier()

# Bell measurement on msg and first bell qubit
qc.cx(msg[0], bell[0])
qc.h(msg[0])

qc.barrier()

# Measure
qc.measure(msg[0], crz[0])
qc.measure(bell[0], crx[0])

print(qc.draw())
```

---

## Big-Endian vs Little-Endian Qubit Ordering

One of the most confusing aspects of quantum computing is **qubit ordering**. Different frameworks use different conventions.

### Qiskit Convention (Little-Endian)

Qiskit uses **little-endian** ordering: the **rightmost** qubit in a ket label corresponds to qubit index 0.

$$|q_n \cdots q_1 q_0\rangle$$

So if you have a circuit with qubits 0, 1, 2:
- Qubit 0 is the **least significant bit** (rightmost)
- Qubit 2 is the **most significant bit** (leftmost)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.x(0)  # Flip qubit 0

state = Statevector.from_instruction(qc)
print(state.draw('latex_source'))
# Result: |001⟩ (qubit 0 is rightmost = 1)
```

### Textbook Convention (Big-Endian)

Most textbooks use **big-endian**: qubit 0 is the **leftmost** (most significant).

$$|q_0 q_1 \cdots q_n\rangle$$

### Why This Matters

When you read measurement results in Qiskit:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.x(2)  # Flip qubit 2 (most significant in Qiskit)

state = Statevector.from_instruction(qc)
probs = state.probabilities_dict()
print(probs)
# Output: {'100': 1.0}
# The '1' is on the LEFT because qubit 2 is the highest index
```

### Conversion Between Conventions

To convert a Qiskit result string to textbook ordering, reverse it:

```python
qiskit_result = '110'  # qubits [q2, q1, q0]
textbook_order = qiskit_result[::-1]  # '011' → qubits [q0, q1, q2]
```

---

## Practical Example: Quantum Adder Registers

Here's a more realistic example using registers for a simple addition circuit:

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Registers for adding two 2-bit numbers
a = QuantumRegister(2, name='a')       # First number
b = QuantumRegister(2, name='b')       # Second number
carry = QuantumRegister(1, name='carry')  # Carry bit
result = ClassicalRegister(3, name='sum')  # 3-bit result

qc = QuantumCircuit(a, b, carry, result)

# Initialize a = 2 (binary 10) → set a[1] = 1
qc.x(a[1])

# Initialize b = 1 (binary 01) → set b[0] = 1
qc.x(b[0])

qc.barrier()

# Half-adder for least significant bits
qc.cx(a[0], b[0])           # b[0] = a[0] XOR b[0] (sum bit)
qc.ccx(a[0], b[0], carry[0])  # carry

qc.barrier()

# Measure result
qc.measure(b[0], result[0])  # LSB of sum
qc.measure(b[1], result[1])  # Middle bit
qc.measure(carry[0], result[2])  # MSB (carry out)

print(qc.draw())
```

---

## Register Size and Quantum State Space

Remember that register size directly determines the dimension of your quantum state space:

$$\text{State space dimension} = 2^{n_1} \times 2^{n_2} \times \cdots = 2^{n_1 + n_2 + \cdots}$$

where $n_i$ is the size of each quantum register.

A circuit with a 3-qubit register and a 2-qubit register has:

$$2^{3+2} = 2^5 = 32 \text{ basis states}$$

The total number of qubits (not registers) determines the computational space.

---

## Best Practices for Using Registers

1. **Name your registers** — Makes circuit diagrams readable.
2. **Group related qubits** — Input, output, and ancilla should be separate registers.
3. **Document the encoding** — Note whether your register encodes numbers in big- or little-endian.
4. **Minimize ancilla registers** — Each extra qubit doubles the state space and resource cost.
5. **Match classical registers to measurements** — One classical bit per qubit you plan to measure.

---

## Key Takeaways

- A **quantum register** is a named group of qubits for logical organization.
- Qiskit provides `QuantumRegister` and `ClassicalRegister` classes.
- Multiple registers can be combined in a single `QuantumCircuit`.
- **Qiskit uses little-endian ordering**: qubit 0 is the least significant (rightmost) bit.
- Named registers make complex circuits readable and maintainable.
- The total state space depends on the **sum** of all register sizes: $2^{n_{total}}$.

---

## Try It Yourself

1. Create a circuit with three registers: `data` (4 qubits), `ancilla` (2 qubits), and `output` (4 classical bits). Apply Hadamard to all data qubits and measure them.
2. Write a program that initializes a 3-qubit register to the state $|101\rangle$ (the number 5 in binary). Pay attention to Qiskit's qubit ordering!
3. Create a Bell state using named registers `alice` (1 qubit) and `bob` (1 qubit). Measure both into separate classical registers.
4. Experiment with `qc.draw('mpl')` to see how register names appear in circuit diagrams.

---

## Next Lesson

Next, we will explore **Dirac (Bra-Ket) Notation** — the elegant mathematical language that physicists use to describe quantum states and operations.
