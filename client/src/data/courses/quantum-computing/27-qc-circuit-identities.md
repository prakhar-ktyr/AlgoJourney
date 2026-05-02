---
title: "Circuit Identities and Simplification"
---

# Circuit Identities and Simplification

In this lesson, you'll learn the key **circuit identities** — rules that let you simplify quantum circuits without changing their output. These rules are essential for optimizing circuits to run efficiently on real quantum hardware.

---

## Why Simplify Circuits?

Real quantum hardware has:
- **Limited coherence time** — fewer gates means less decoherence
- **Gate errors** — each gate introduces noise, so fewer gates = less error
- **Limited connectivity** — qubits aren't all connected, requiring extra SWAP gates
- **T-gate cost** — in fault-tolerant computing, T gates are extremely expensive

The goal: produce the **same unitary transformation** with fewer (or cheaper) gates.

---

## Gate Cancellation Rules

The simplest optimization: a gate followed by its inverse equals identity.

### Self-Inverse Gates

Many common gates are their own inverse ($U^2 = I$):

$$XX = I, \quad HH = I, \quad ZZ = I, \quad YY = I$$

$$\text{CNOT} \cdot \text{CNOT} = I \quad \text{(same control and target)}$$

**Example:** If you see two consecutive H gates on the same qubit, you can remove both:

```
Before: ─H─H─    →    After: ───── (identity, wire only)
```

### Inverse Pairs

For rotation gates, the inverse has the opposite angle:

$$R_z(\theta) \cdot R_z(-\theta) = I$$
$$R_x(\theta) \cdot R_x(-\theta) = I$$

And for specific gates:

$$S \cdot S^\dagger = I, \quad T \cdot T^\dagger = I$$

---

## Gate Merging

Consecutive gates of the same type can be combined:

### Rotation Merging

$$R_z(\theta_1) \cdot R_z(\theta_2) = R_z(\theta_1 + \theta_2)$$
$$R_x(\theta_1) \cdot R_x(\theta_2) = R_x(\theta_1 + \theta_2)$$

**Example:**

$$T \cdot T = S \quad \text{because } R_z(\pi/4) \cdot R_z(\pi/4) = R_z(\pi/2) = S$$

$$S \cdot S = Z \quad \text{because } R_z(\pi/2) \cdot R_z(\pi/2) = R_z(\pi) = Z$$

---

## Commutation Rules

Two gates **commute** if the order doesn't matter: $AB = BA$.

### Which Gates Commute?

| Gate A | Gate B | Commute? | Reason |
|--------|--------|----------|--------|
| $R_z(\theta)$ | $R_z(\phi)$ | ✅ Yes | Same axis |
| $R_x(\theta)$ | $R_x(\phi)$ | ✅ Yes | Same axis |
| $R_z(\theta)$ | $R_x(\phi)$ | ❌ No | Different axes |
| $Z$ | $\text{CNOT}$ (control) | ✅ Yes | Z on control commutes |
| $X$ | $\text{CNOT}$ (target) | ✅ Yes | X on target commutes |
| $X$ | $\text{CNOT}$ (control) | ❌ No | X on control does not commute |

### General Rule

Gates on **different qubits** always commute (they act on independent spaces):

$$(A \otimes I)(I \otimes B) = (I \otimes B)(A \otimes I) = A \otimes B$$

---

## CNOT Identities

The CNOT gate has many useful identities:

### Basic CNOT Properties

$$\text{CNOT}_{01} \cdot \text{CNOT}_{01} = I \quad \text{(self-inverse)}$$

### CNOT with Hadamards (Direction Reversal)

Surrounding a CNOT with Hadamards **flips** control and target:

$$(H \otimes H) \cdot \text{CNOT}_{01} \cdot (H \otimes H) = \text{CNOT}_{10}$$

This is incredibly useful: if your hardware only supports CNOT in one direction, you can reverse it with 4 Hadamard gates.

### CNOT with Z and X

$$Z_{\text{control}} \cdot \text{CNOT} = \text{CNOT} \cdot Z_{\text{control}}$$
$$X_{\text{target}} \cdot \text{CNOT} = \text{CNOT} \cdot X_{\text{target}}$$

But:
$$X_{\text{control}} \cdot \text{CNOT} \neq \text{CNOT} \cdot X_{\text{control}}$$

Instead:
$$X_{\text{control}} \cdot \text{CNOT} = \text{CNOT} \cdot (X_{\text{control}} \otimes X_{\text{target}})$$

---

## Moving Gates Past Controls

When optimizing, you often need to move single-qubit gates past CNOT controls or targets.

### Rules for Moving Past CNOT

**Past the control wire:**
- $Z$, $S$, $T$, $R_z(\theta)$ pass freely (they commute with the control)
- $X$, $R_x(\theta)$ do NOT pass freely

**Past the target wire:**
- $X$, $R_x(\theta)$ pass freely
- $Z$, $R_z(\theta)$ do NOT pass freely

**Mnemonic:** The control "cares about" the $|0\rangle/|1\rangle$ basis (Z-basis), so Z-type gates commute with it. The target gets flipped (X operation), so X-type gates commute with it.

---

## Reducing Circuit Depth

Circuit depth directly affects execution time. Strategies to reduce it:

### 1. Parallelize Independent Gates

Gates on different qubits can execute simultaneously:

```
Before (depth 3):          After (depth 1):
q0: ─H─────────           q0: ─H─
q1: ─────H─────    →      q1: ─H─
q2: ─────────H─           q2: ─H─
```

### 2. Use Commutation to Reorder

If gates commute, reorder them to enable cancellations:

```
Before: ─Z─H─Z─H─    (depth 4)
After reordering: ─Z─Z─H─H─ = ─I─I─ = ───── (depth 0!)
```

> Wait — does Z commute with H? No! So this particular reordering is invalid. Always verify commutation before reordering.

### 3. Gate Decomposition Alternatives

Sometimes a different decomposition has lower depth:

$$\text{Toffoli} = \text{depth 11 with CNOT+T}$$

But optimized versions exist with depth 8 using ancilla qubits.

---

## T-Count Optimization

In **fault-tolerant quantum computing**, the T gate is by far the most expensive operation (requiring complex error correction protocols). Minimizing the number of T gates ("T-count") is crucial.

### Key Facts

- Clifford gates ($H$, $S$, $\text{CNOT}$) are "cheap" in fault-tolerant schemes
- Each $T$ gate requires a special **magic state** and distillation protocol
- T-count optimization is an active research area

### Common T-Count Reductions

$$T \cdot T = S \quad \text{(2 T gates → 1 S gate)}$$

A Toffoli gate decomposes into 7 T gates in the standard decomposition, but clever techniques can reduce this.

```python
from qiskit import QuantumCircuit, transpile

# Standard Toffoli decomposition
qc = QuantumCircuit(3)
qc.ccx(0, 1, 2)  # Toffoli gate

# Decompose to see T gates
decomposed = transpile(qc, basis_gates=['cx', 'h', 't', 'tdg', 's', 'sdg'])
print(decomposed)

# Count T and Tdg gates
ops = decomposed.count_ops()
t_count = ops.get('t', 0) + ops.get('tdg', 0)
print(f"T-count: {t_count}")
```

---

## Qiskit Transpiler Basics

The Qiskit **transpiler** automatically optimizes circuits for target hardware.

### The `transpile()` Function

```python
from qiskit import QuantumCircuit, transpile
from qiskit.providers.fake_provider import GenericBackendV2

# Create a circuit
qc = QuantumCircuit(3)
qc.h(0)
qc.h(0)  # Redundant — should cancel
qc.cx(0, 1)
qc.cx(0, 1)  # Redundant — should cancel
qc.cx(0, 2)

# Create a target backend
backend = GenericBackendV2(5)

# Transpile with optimization
optimized = transpile(qc, backend=backend, optimization_level=2)

print(f"Original gates: {qc.size()}, depth: {qc.depth()}")
print(f"Optimized gates: {optimized.size()}, depth: {optimized.depth()}")
```

### Optimization Levels

| Level | Description | Speed | Quality |
|-------|-------------|-------|---------|
| 0 | No optimization, just map to hardware | Fastest | Lowest |
| 1 | Light optimization (default) | Fast | Good |
| 2 | Medium optimization | Medium | Better |
| 3 | Heavy optimization (explores many options) | Slowest | Best |

```python
# Compare all optimization levels
for level in range(4):
    result = transpile(qc, backend=backend, optimization_level=level)
    print(f"Level {level}: gates={result.size()}, depth={result.depth()}")
```

---

## Practical Example: Simplifying a Complex Circuit

Let's build a circuit with known redundancies and simplify it:

```python
from qiskit import QuantumCircuit, transpile
from qiskit.providers.fake_provider import GenericBackendV2

# Build an intentionally redundant circuit
qc = QuantumCircuit(3)

# These should cancel: HH = I
qc.h(0)
qc.h(0)

# Useful operations
qc.h(1)
qc.cx(1, 2)

# These should cancel: CNOT twice = I
qc.cx(0, 1)
qc.cx(0, 1)

# More useful work
qc.t(0)
qc.t(0)  # T·T = S — should merge

# Final operations
qc.h(1)
qc.cx(1, 0)

print("=== Original Circuit ===")
print(qc.draw('text'))
print(f"Gates: {qc.size()}, Depth: {qc.depth()}")

# Optimize
backend = GenericBackendV2(5)
optimized = transpile(qc, backend=backend, optimization_level=3)

print("\n=== Optimized Circuit ===")
print(optimized.draw('text'))
print(f"Gates: {optimized.size()}, Depth: {optimized.depth()}")
```

**Expected result:** The HH pair and CNOT pair cancel, the TT merges into S, reducing the circuit significantly.

---

## Summary of Key Identities

| Identity | Equation |
|----------|----------|
| X self-inverse | $XX = I$ |
| H self-inverse | $HH = I$ |
| Z self-inverse | $ZZ = I$ |
| CNOT self-inverse | $\text{CNOT}^2 = I$ |
| T squared | $TT = S$ |
| S squared | $SS = Z$ |
| Rotation merge | $R_z(\alpha)R_z(\beta) = R_z(\alpha+\beta)$ |
| CNOT reversal | $(H{\otimes}H)\text{CNOT}_{01}(H{\otimes}H) = \text{CNOT}_{10}$ |

---

## Key Takeaways

1. **Self-inverse gates** ($X$, $H$, $Z$, CNOT) cancel when applied twice consecutively
2. **Rotation gates** on the same axis merge by adding their angles
3. **Commutation rules** tell you when you can safely reorder gates to enable cancellations
4. **CNOT identities** let you reverse direction, move single-qubit gates past, and simplify entangling operations
5. **T-count** is the critical cost metric for fault-tolerant quantum computing
6. The Qiskit **transpiler** with `optimization_level=3` automatically applies many of these simplifications

---

## Try It Yourself

1. **Cancel redundancies**: Create a circuit with `H-X-X-H` on one qubit. Verify that the output state is the same as doing nothing (identity). Then transpile and confirm the optimizer removes all gates.

2. **CNOT direction reversal**: Implement the identity $(H \otimes H) \cdot \text{CNOT}_{01} \cdot (H \otimes H) = \text{CNOT}_{10}$ in Qiskit. Verify using `Operator` from `qiskit.quantum_info` that both circuits produce the same unitary matrix.

3. **T-count challenge**: Decompose a Toffoli gate and count the T gates. Can you find an alternative decomposition with fewer T gates? (Hint: ancilla qubits can help.)

4. **Optimization comparison**: Create a 4-qubit circuit with at least 15 gates. Transpile it at all 4 optimization levels and compare gate counts and depths.

---

## Next Lesson

In the next lesson, [Introduction to Quantum Algorithms](/courses/quantum-computing/intro-quantum-algorithms), you'll learn what makes an algorithm "quantum," the role of superposition and interference in achieving speedups, and get an overview of the major quantum algorithms.
