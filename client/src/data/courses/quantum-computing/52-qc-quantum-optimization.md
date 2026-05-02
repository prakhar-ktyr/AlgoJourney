---
title: "Quantum Optimization (QAOA, VQE)"
---

Many of the world's most important problems — from drug discovery to logistics — are optimization problems. Quantum computers offer new approaches through **variational algorithms** that blend quantum circuits with classical optimizers, designed to run on today's noisy hardware.

## Why Optimization Matters

An optimization problem seeks to minimize (or maximize) an objective function subject to constraints:

$$\min_{\mathbf{x}} f(\mathbf{x}) \quad \text{subject to} \quad g_i(\mathbf{x}) \leq 0$$

Many important optimization problems are **NP-hard**: the best-known classical algorithms scale exponentially. Examples include:

- **Traveling Salesman Problem (TSP)**: shortest route visiting all cities
- **MaxCut**: partition a graph to maximize edges between groups
- **Portfolio optimization**: best asset allocation under risk constraints
- **Molecular ground state energy**: find the lowest energy configuration

## Variational Quantum Eigensolver (VQE)

VQE finds the **ground state energy** of a quantum Hamiltonian $H$. By the variational principle:

$$E_0 \leq \langle\psi(\vec{\theta})|H|\psi(\vec{\theta})\rangle$$

for any parameterized trial state $|\psi(\vec{\theta})\rangle$. The minimum over all $\vec{\theta}$ approaches the true ground state energy $E_0$.

### The VQE Hybrid Loop

```
┌─────────────┐    parameters θ    ┌─────────────────┐
│  Classical   │ ─────────────────► │ Quantum Circuit  │
│  Optimizer   │                    │  (Ansatz)        │
│  (COBYLA,    │ ◄───────────────── │  Measure <H>     │
│   SPSA, ...) │    energy E(θ)     └─────────────────┘
└─────────────┘
```

1. **Prepare** a parameterized quantum state $|\psi(\vec{\theta})\rangle$ (the **ansatz**)
2. **Measure** the expectation value $\langle H \rangle$ on the quantum computer
3. **Optimize** the parameters $\vec{\theta}$ classically to minimize $\langle H \rangle$
4. **Repeat** until convergence

### Choosing an Ansatz

The ansatz is the parameterized circuit that generates trial states. Common choices:

- **Hardware-efficient ansatz**: layers of single-qubit rotations and entangling gates, tailored to the device topology
- **UCCSD (Unitary Coupled Cluster)**: inspired by quantum chemistry, provides physically motivated structure
- **Symmetry-preserving ansatz**: enforces known symmetries of the problem

A good ansatz must be **expressive** enough to contain the ground state but **shallow** enough to run on noisy hardware.

### The Hamiltonian

For molecular problems, the Hamiltonian is expressed as a sum of Pauli terms:

$$H = \sum_i c_i P_i, \quad P_i \in \{I, X, Y, Z\}^{\otimes n}$$

Each term $P_i$ is measured separately on the quantum computer, and the expectation values are combined classically:

$$\langle H \rangle = \sum_i c_i \langle P_i \rangle$$

### Applications of VQE

- **Molecular chemistry**: computing bond energies, reaction rates
- **Materials science**: predicting material properties
- **Drug discovery**: simulating protein-ligand interactions

## QAOA: Quantum Approximate Optimization Algorithm

QAOA targets **combinatorial optimization problems** encoded as finding the ground state of a classical cost Hamiltonian $H_C$.

### Problem Encoding

For a problem like MaxCut on a graph $G = (V, E)$, the cost function counts edges between partitions:

$$C(\mathbf{z}) = \sum_{(i,j) \in E} \frac{1 - z_i z_j}{2}, \quad z_i \in \{+1, -1\}$$

This becomes a quantum Hamiltonian:

$$H_C = \sum_{(i,j) \in E} \frac{1 - Z_i Z_j}{2}$$

where $Z_i$ is the Pauli-$Z$ operator on qubit $i$.

### The QAOA Circuit

QAOA uses $p$ layers of alternating operators:

$$|\vec{\gamma}, \vec{\beta}\rangle = \prod_{k=1}^{p} e^{-i\beta_k H_M} e^{-i\gamma_k H_C} |+\rangle^{\otimes n}$$

where:

- $H_C$ is the **cost Hamiltonian** (encodes the problem)
- $H_M = \sum_i X_i$ is the **mixer Hamiltonian** (explores the solution space)
- $\gamma_k, \beta_k$ are variational parameters optimized classically
- $|+\rangle^{\otimes n}$ is the uniform superposition initial state

### Circuit Structure

For each layer $k$:

1. **Cost layer**: apply $e^{-i\gamma_k H_C}$
   - For MaxCut, this decomposes into $R_{ZZ}(\gamma_k)$ gates on each edge
   - $e^{-i\gamma \frac{1-Z_iZ_j}{2}} = e^{-i\gamma/2} \cdot e^{i\gamma Z_iZ_j/2}$
2. **Mixer layer**: apply $e^{-i\beta_k H_M} = \prod_i R_X(2\beta_k)$

### Depth vs Quality

- $p = 1$: simplest, often gives a constant-factor approximation
- As $p \to \infty$: QAOA converges to the exact solution (adiabatic limit)
- In practice, $p = 3$–$10$ often provides good results for small instances

## Example: MaxCut with QAOA in Qiskit

```python
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from scipy.optimize import minimize

def maxcut_qaoa(edges, n_qubits, p=1):
    """QAOA for MaxCut on a graph defined by edges."""

    def qaoa_circuit(params):
        gammas = params[:p]
        betas = params[p:]
        qc = QuantumCircuit(n_qubits)

        # Initial superposition
        for i in range(n_qubits):
            qc.h(i)

        for layer in range(p):
            # Cost layer: ZZ interactions for each edge
            for (i, j) in edges:
                qc.cx(i, j)
                qc.rz(2 * gammas[layer], j)
                qc.cx(i, j)

            # Mixer layer: X rotations
            for i in range(n_qubits):
                qc.rx(2 * betas[layer], i)

        qc.measure_all()
        return qc

    def cost_function(params):
        qc = qaoa_circuit(params)
        simulator = AerSimulator()
        compiled = transpile(qc, simulator)
        result = simulator.run(compiled, shots=1024).result()
        counts = result.get_counts()

        # Compute expected cost
        total_cost = 0
        total_shots = sum(counts.values())
        for bitstring, count in counts.items():
            bits = [int(b) for b in bitstring[::-1]]
            cut_value = sum(
                1 for (i, j) in edges if bits[i] != bits[j]
            )
            total_cost += cut_value * count / total_shots
        return -total_cost  # Minimize negative cost = maximize cut

    # Optimize parameters
    init_params = np.random.uniform(0, np.pi, 2 * p)
    result = minimize(cost_function, init_params, method="COBYLA",
                      options={"maxiter": 200})

    # Get final result
    qc = qaoa_circuit(result.x)
    simulator = AerSimulator()
    compiled = transpile(qc, simulator)
    final_result = simulator.run(compiled, shots=4096).result()
    return final_result.get_counts()

# Example: triangle graph (3 nodes, 3 edges)
# Optimal MaxCut = 2 (any partition with 1 vs 2 nodes)
edges = [(0, 1), (1, 2), (0, 2)]
counts = maxcut_qaoa(edges, n_qubits=3, p=2)
print("MaxCut results:", sorted(counts.items(), key=lambda x: -x[1])[:5])
```

## QAOA vs Classical Approximation

| Aspect | QAOA | Classical (Goemans-Williamson) |
|---|---|---|
| Approximation ratio ($p=1$) | $\geq 0.6924$ for MaxCut | $\geq 0.878$ |
| Scaling | Polynomial circuit depth | Polynomial time (SDP) |
| Hardware | Requires quantum computer | Classical computer |
| Advantage | Potentially better at $p \gg 1$ | Proven guarantees today |
| Noise sensitivity | High (NISQ limitation) | None |

The practical quantum advantage for QAOA over the best classical algorithms is still an **open research question**. However, QAOA serves as a crucial stepping stone for understanding quantum optimization.

## VQE vs QAOA Summary

| Feature | VQE | QAOA |
|---|---|---|
| Target problems | Quantum Hamiltonians | Combinatorial optimization |
| Ansatz | Problem-specific | Fixed alternating structure |
| Primary use | Chemistry, materials | Graph problems, scheduling |
| Parameters | Varies with ansatz | $2p$ parameters |

## Key Takeaways

- **VQE** finds ground state energies using a hybrid quantum-classical loop with a parameterized ansatz
- **QAOA** tackles combinatorial optimization by encoding problems as cost Hamiltonians with alternating cost and mixer layers
- Both are **variational algorithms**: they use classical optimizers to tune quantum circuit parameters
- They are designed for **NISQ-era** hardware — shallow circuits that tolerate some noise
- The number of QAOA layers $p$ controls the tradeoff between circuit depth and solution quality
- Practical quantum advantage for these algorithms remains an active area of research

## Try It Yourself

1. Implement VQE for the hydrogen molecule ($H_2$) using Qiskit's built-in chemistry tools. Plot the energy curve as a function of bond distance.
2. Run QAOA on a 4-node graph with edges $\{(0,1), (1,2), (2,3), (0,3)\}$. What is the optimal MaxCut? Does QAOA find it?
3. Experiment with different $p$ values (1, 2, 4, 8) for a fixed graph. How does the solution quality change?
4. Try different classical optimizers (COBYLA, SPSA, Nelder-Mead) in the QAOA loop. Which converges fastest?

**Next: Quantum Hardware Technologies →**
