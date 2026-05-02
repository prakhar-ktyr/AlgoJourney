---
title: "Quantum Communication and Teleportation"
---

Quantum teleportation is one of the most striking protocols in quantum information science. It allows the transfer of an arbitrary quantum state from one party to another using shared entanglement and classical communication — without physically sending the qubit itself.

## What Is Quantum Teleportation?

Quantum teleportation is **not** the sci-fi kind — no matter is transported. Instead, the **quantum state** of a qubit is destroyed at one location and recreated at another. The protocol requires:

1. A shared entangled pair (Bell pair) between sender (Alice) and receiver (Bob)
2. A Bell measurement performed by Alice
3. Two classical bits sent from Alice to Bob
4. A correction operation applied by Bob

The key insight: the quantum information is transferred without ever directly measuring or copying the state, respecting the **no-cloning theorem**.

## The Teleportation Protocol Step by Step

### Setup

Alice has a qubit $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ she wants to send to Bob. Alice and Bob share a Bell pair:

$$|\Phi^+\rangle_{AB} = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

The full 3-qubit state is:

$$|\Psi\rangle = |\psi\rangle_1 \otimes |\Phi^+\rangle_{23} = (\alpha|0\rangle_1 + \beta|1\rangle_1) \otimes \frac{1}{\sqrt{2}}(|00\rangle_{23} + |11\rangle_{23})$$

### Step 1: Expand the State

Expanding:

$$|\Psi\rangle = \frac{1}{\sqrt{2}}\big[\alpha|0\rangle_1(|00\rangle_{23} + |11\rangle_{23}) + \beta|1\rangle_1(|00\rangle_{23} + |11\rangle_{23})\big]$$

$$= \frac{1}{\sqrt{2}}\big[\alpha|000\rangle + \alpha|011\rangle + \beta|100\rangle + \beta|111\rangle\big]$$

### Step 2: Rewrite in Bell Basis

We rewrite qubits 1 and 2 in the Bell basis. Recall the four Bell states:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle), \quad |\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$$

$$|\Psi^+\rangle = \frac{1}{\sqrt{2}}(|01\rangle + |10\rangle), \quad |\Psi^-\rangle = \frac{1}{\sqrt{2}}(|01\rangle - |10\rangle)$$

After re-expressing in this basis, the full state becomes:

$$|\Psi\rangle = \frac{1}{2}\Big[|\Phi^+\rangle_{12}(\alpha|0\rangle_3 + \beta|1\rangle_3) + |\Phi^-\rangle_{12}(\alpha|0\rangle_3 - \beta|1\rangle_3)$$

$$+ |\Psi^+\rangle_{12}(\alpha|1\rangle_3 + \beta|0\rangle_3) + |\Psi^-\rangle_{12}(\alpha|1\rangle_3 - \beta|0\rangle_3)\Big]$$

### Step 3: Alice's Bell Measurement

Alice measures qubits 1 and 2 in the Bell basis. She gets one of four outcomes with equal probability $\frac{1}{4}$. This collapses Bob's qubit (qubit 3) into a state related to $|\psi\rangle$:

| Alice's Result | Bob's State | Correction |
|---|---|---|
| $\|\Phi^+\rangle$ | $\alpha\|0\rangle + \beta\|1\rangle$ | $I$ (nothing) |
| $\|\Phi^-\rangle$ | $\alpha\|0\rangle - \beta\|1\rangle$ | $Z$ |
| $\|\Psi^+\rangle$ | $\alpha\|1\rangle + \beta\|0\rangle$ | $X$ |
| $\|\Psi^-\rangle$ | $\alpha\|1\rangle - \beta\|0\rangle$ | $XZ$ |

### Step 4: Classical Communication and Correction

Alice sends her 2-bit measurement result to Bob via a **classical channel**. Bob applies the corresponding Pauli gate(s) to recover $|\psi\rangle$ exactly.

## Why Teleportation Doesn't Violate Relativity

A common misconception: "Entanglement allows faster-than-light communication." This is false because:

- Bob's qubit is in a **random** state until he receives Alice's classical bits
- The classical bits must travel at or below the speed of light
- Without the correction, Bob has no useful information

Teleportation transfers quantum information at the speed of **classical communication**, not instantaneously.

## Superdense Coding

Superdense coding is the "dual" of teleportation — it uses 1 qubit + shared entanglement to send **2 classical bits**:

1. Alice and Bob share $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$
2. Alice encodes 2 classical bits by applying one of $\{I, X, Z, XZ\}$ to her qubit
3. Alice sends her qubit to Bob
4. Bob performs a Bell measurement to decode the 2 bits

| Message | Alice's Operation | Resulting State |
|---|---|---|
| 00 | $I$ | $\|\Phi^+\rangle$ |
| 01 | $X$ | $\|\Psi^+\rangle$ |
| 10 | $Z$ | $\|\Phi^-\rangle$ |
| 11 | $XZ$ | $\|\Psi^-\rangle$ |

This is remarkable: classical information theory says 1 bit can carry at most 1 bit of information. But with pre-shared entanglement, 1 qubit carries 2 classical bits.

## Quantum Repeaters

Direct quantum communication is limited by photon loss in optical fibers (signal degrades exponentially with distance). **Quantum repeaters** solve this:

- Divide the channel into shorter segments
- Create entanglement across each segment
- Use **entanglement swapping** (teleportation-like) to extend entanglement across segments
- Use **entanglement purification** to improve fidelity

This is the foundation for building a **quantum internet** — a network where nodes share entanglement for secure communication, distributed computation, and clock synchronization.

## The Quantum Internet Vision

A future quantum internet would enable:

- **Quantum Key Distribution (QKD)** over global distances
- **Distributed quantum computing** across multiple quantum processors
- **Quantum sensor networks** with enhanced precision
- **Blind quantum computing** — delegate computation without revealing your data

## Qiskit Implementation

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram

def quantum_teleportation():
    """Teleport qubit 0's state to qubit 2."""
    qc = QuantumCircuit(3, 3)

    # Prepare the state to teleport: |psi> = H|0> = |+>
    qc.h(0)
    qc.barrier()

    # Create Bell pair between qubits 1 and 2 (Alice and Bob)
    qc.h(1)
    qc.cx(1, 2)
    qc.barrier()

    # Alice's Bell measurement on qubits 0 and 1
    qc.cx(0, 1)
    qc.h(0)
    qc.barrier()

    # Measure Alice's qubits
    qc.measure(0, 0)
    qc.measure(1, 1)
    qc.barrier()

    # Bob's corrections (classically controlled)
    qc.cx(1, 2)   # Apply X if qubit 1 measured |1>
    qc.cz(0, 2)   # Apply Z if qubit 0 measured |1>

    # Measure Bob's qubit to verify
    qc.measure(2, 2)

    return qc

# Build and run the circuit
qc = quantum_teleportation()
print(qc.draw())

simulator = AerSimulator()
compiled = transpile(qc, simulator)
result = simulator.run(compiled, shots=1024).result()
counts = result.get_counts()
print("Teleportation results:", counts)
```

> **Note:** In a real teleportation experiment, we would use `c_if` or dynamic circuits for classical conditioning. The circuit above uses quantum-controlled gates as an equivalent simulation.

## Key Takeaways

- Quantum teleportation transfers a quantum state using entanglement + 2 classical bits
- It does **not** violate no-faster-than-light communication — classical bits are required
- Superdense coding is the dual: send 2 classical bits using 1 qubit + entanglement
- Quantum repeaters extend entanglement over long distances via entanglement swapping
- These protocols form the building blocks of a future quantum internet

## Try It Yourself

1. Modify the teleportation circuit to teleport $|1\rangle$ instead of $|+\rangle$. Verify Bob's qubit always measures $|1\rangle$.
2. Implement superdense coding in Qiskit: encode all four 2-bit messages and verify Bob decodes them correctly.
3. Create a teleportation circuit that teleports a state $R_y(\theta)|0\rangle$ for a chosen angle $\theta$. Use state tomography to verify.
4. Draw the full 3-qubit state at each step of the protocol for teleporting $|+\rangle$. Which step destroys Alice's original state?

**Next: Quantum Optimization →**
