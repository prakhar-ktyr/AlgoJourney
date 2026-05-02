---
title: "Quantum Cryptography and QKD"
---

While Shor's algorithm threatens today's public-key cryptography, quantum mechanics also provides a powerful defense: **quantum cryptography**. At its heart is **Quantum Key Distribution (QKD)**, which allows two parties to establish a shared secret key with security guaranteed by the laws of physics — not by computational assumptions that could one day be broken.

## Classical Cryptography's Vulnerability

Modern public-key cryptography (RSA, ECC, Diffie-Hellman) relies on the computational difficulty of problems like integer factoring and discrete logarithms. A sufficiently large quantum computer running Shor's algorithm would break these in polynomial time:

$$
O\!\left((\log N)^2 (\log \log N)(\log \log \log N)\right)
$$

for factoring an $N$-bit integer — exponentially faster than the best known classical algorithms. This motivates two complementary responses:

1. **Quantum Key Distribution** — use quantum mechanics for provably secure key exchange
2. **Post-quantum cryptography** — design classical algorithms believed resistant to quantum attacks

## Quantum Key Distribution: BB84 Protocol

The **BB84 protocol** (Bennett and Brassard, 1984) was the first QKD scheme and remains the most widely implemented.

### Setup

- **Alice** (sender) and **Bob** (receiver) share a quantum channel (optical fiber or free space) and an authenticated classical channel
- **Eve** (eavesdropper) can intercept the quantum channel

### Protocol Steps

**Step 1: Preparation**
Alice generates random bits and encodes each in one of two randomly chosen bases:

| Basis | Bit 0 | Bit 1 |
|-------|-------|-------|
| Rectilinear ($+$) | $\|0\rangle$ | $\|1\rangle$ |
| Diagonal ($\times$) | $\|+\rangle = \frac{1}{\sqrt{2}}(\|0\rangle + \|1\rangle)$ | $\|-\rangle = \frac{1}{\sqrt{2}}(\|0\rangle - \|1\rangle)$ |

**Step 2: Transmission**
Alice sends each encoded qubit to Bob through the quantum channel.

**Step 3: Measurement**
Bob independently and randomly chooses a basis ($+$ or $\times$) for each qubit and measures. When his basis matches Alice's, he gets the correct bit. When it doesn't, he gets a random result:

$$
P(\text{correct}) = \begin{cases} 1 & \text{if bases match} \\ \frac{1}{2} & \text{if bases differ} \end{cases}
$$

**Step 4: Sifting**
Over the classical channel, Alice and Bob announce their **basis choices** (but not the bit values). They keep only the bits where they used the same basis — roughly 50% of the raw key.

**Step 5: Error Estimation and Privacy Amplification**
They sacrifice a random subset of their sifted key to check for errors. If the error rate exceeds a threshold ($\sim 11\%$ for BB84), they abort — Eve's interference has been detected. Otherwise, they apply classical post-processing (error correction and privacy amplification) to distill a shorter, perfectly secret key.

### Why It's Secure

The security of BB84 rests on two quantum mechanical principles:

1. **No-cloning theorem**: Eve cannot copy qubits to measure in both bases
2. **Measurement disturbance**: any measurement Eve performs on an unknown quantum state inevitably disturbs it

If Eve intercepts and measures a qubit in the wrong basis, she introduces a detectable $25\%$ error rate on the sifted key.

### BB84 Simulation in Python

```python
import numpy as np

def bb84_simulation(n_bits=1000):
    # Alice generates random bits and bases
    alice_bits = np.random.randint(0, 2, n_bits)
    alice_bases = np.random.randint(0, 2, n_bits)  # 0=rectilinear, 1=diagonal

    # Bob chooses random measurement bases
    bob_bases = np.random.randint(0, 2, n_bits)

    # Bob's measurement results (without eavesdropper)
    bob_bits = np.where(
        alice_bases == bob_bases,
        alice_bits,  # Correct when bases match
        np.random.randint(0, 2, n_bits),  # Random when bases differ
    )

    # Sifting: keep only matching bases
    matching = alice_bases == bob_bases
    sifted_alice = alice_bits[matching]
    sifted_bob = bob_bits[matching]

    # Check for errors (should be 0 without Eve)
    errors = np.sum(sifted_alice != sifted_bob)
    error_rate = errors / len(sifted_alice)

    print(f"Total bits sent: {n_bits}")
    print(f"Sifted key length: {len(sifted_alice)} ({len(sifted_alice)/n_bits:.1%})")
    print(f"Error rate: {error_rate:.2%}")
    print(f"Key match: {np.array_equal(sifted_alice, sifted_bob)}")

    return sifted_alice


def bb84_with_eve(n_bits=1000):
    """BB84 with an eavesdropper intercepting every qubit."""
    alice_bits = np.random.randint(0, 2, n_bits)
    alice_bases = np.random.randint(0, 2, n_bits)

    # Eve intercepts: measures in random bases
    eve_bases = np.random.randint(0, 2, n_bits)
    eve_bits = np.where(
        alice_bases == eve_bases,
        alice_bits,
        np.random.randint(0, 2, n_bits),
    )

    # Eve resends (in her measured basis — she doesn't know Alice's basis)
    # Bob measures Eve's re-sent qubits
    bob_bases = np.random.randint(0, 2, n_bits)
    bob_bits = np.where(
        eve_bases == bob_bases,
        eve_bits,
        np.random.randint(0, 2, n_bits),
    )

    # Sifting (Alice and Bob compare bases, not knowing about Eve)
    matching = alice_bases == bob_bases
    sifted_alice = alice_bits[matching]
    sifted_bob = bob_bits[matching]

    errors = np.sum(sifted_alice != sifted_bob)
    error_rate = errors / len(sifted_alice)

    print(f"\n--- With Eavesdropper ---")
    print(f"Sifted key length: {len(sifted_alice)}")
    print(f"Error rate: {error_rate:.2%} (expected ~25%)")
    print(f"Eve detected: {error_rate > 0.11}")


bb84_simulation()
bb84_with_eve()
```

## E91 Protocol: Entanglement-Based QKD

The **E91 protocol** (Ekert, 1991) uses entangled Bell pairs for key distribution:

1. A source generates entangled pairs $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ and sends one qubit to Alice, one to Bob
2. Alice and Bob each randomly measure in one of three bases
3. When they use the same basis, their results are perfectly correlated — these become the key
4. When they use different bases, they test **Bell's inequality** (CHSH inequality):

$$
S = |E(a_1, b_1) - E(a_1, b_2)| + |E(a_2, b_1) + E(a_2, b_2)| \leq 2 \quad \text{(classical)}
$$

Quantum mechanics predicts $S = 2\sqrt{2}$. If Eve intercepts, she breaks the entanglement and $S$ drops toward 2, revealing her presence.

The E91 protocol's security is rooted in the violation of Bell inequalities — a fundamentally quantum phenomenon with no classical explanation.

## Practical QKD Implementations

### Fiber Optic QKD
- Mature technology, commercially available
- Range limited to $\sim 100$–$300\;\text{km}$ due to photon loss in fiber (cannot use classical amplifiers — no-cloning theorem)
- Key rates: $\sim 1$–$100\;\text{kbit/s}$ at $100\;\text{km}$
- **Quantum repeaters** (under development) could extend range using entanglement swapping

### Satellite QKD
- China's Micius satellite (2017) demonstrated QKD over $1{,}200\;\text{km}$
- Free-space photon loss scales as $\sim 1/R^2$ (better than exponential fiber loss for long distances)
- Enables intercontinental quantum key distribution
- Night-time operation preferred (reduced background photon noise)

### Current Commercial Systems
- **ID Quantique** (Switzerland): commercial QKD systems since 2004
- **Toshiba**: high-speed QKD over fiber
- **QuantumCTek** (China): deployed in banking and government networks
- Several cities have deployed QKD-secured metropolitan networks (Beijing, Vienna, Tokyo, London)

## Post-Quantum Cryptography vs. QKD

Two fundamentally different approaches to quantum-safe security:

| | Post-Quantum Cryptography (PQC) | Quantum Key Distribution (QKD) |
|---|---|---|
| **Basis of security** | Mathematical hardness assumptions | Laws of quantum physics |
| **Hardware required** | Standard computers | Specialized quantum hardware |
| **Deployment** | Software update | New infrastructure |
| **Range** | Unlimited (internet) | Limited ($\sim 100\;\text{km}$ fiber) |
| **Proven security** | Believed hard, not proven | Information-theoretically secure |
| **Maturity** | NIST standards finalized (2024) | Commercial, but niche |
| **Vulnerability** | Could be broken by new math | Side-channel attacks on implementation |

In practice, both approaches will likely coexist — PQC for general internet security and QKD for high-security point-to-point links.

## NIST Post-Quantum Standards

In 2024, NIST finalized the first post-quantum cryptography standards:

### CRYSTALS-Kyber (ML-KEM)
- **Type**: Key encapsulation mechanism (KEM) for key exchange
- **Based on**: Module Learning with Errors (MLWE) problem
- **Key sizes**: 800–1,568 bytes (larger than RSA/ECC but manageable)
- **Performance**: Fast — comparable to or faster than RSA

### CRYSTALS-Dilithium (ML-DSA)
- **Type**: Digital signature scheme
- **Based on**: Module Learning with Errors and Short Integer Solution problems
- **Signature size**: 2,420–4,595 bytes
- **Performance**: Fast signing and verification

### Other Standards
- **SPHINCS+** (SLH-DSA): Hash-based signatures — conservative, well-understood security
- **FALCON**: Lattice-based signatures — compact but more complex to implement

The underlying hard problems (lattice problems like LWE) are believed resistant to both classical and quantum attacks.

## Quantum Random Number Generation

True randomness is essential for cryptography. Classical computers can only generate **pseudo-random** numbers. Quantum mechanics provides genuine randomness:

$$
P(0) = P(1) = \frac{1}{2} \quad \text{for } |\psi\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)
$$

This is not just "we don't know" — quantum mechanics guarantees the outcome is **fundamentally undetermined** until measurement. Quantum random number generators (QRNGs) are commercially available and used alongside QKD systems.

```python
# Quantum random number generation with Qiskit
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def quantum_random_bits(n_bits):
    """Generate n truly random bits using quantum superposition."""
    qc = QuantumCircuit(1, 1)
    qc.h(0)       # Create superposition
    qc.measure(0, 0)

    sim = AerSimulator()
    result = sim.run(qc, shots=n_bits, memory=True).result()
    bits = result.get_memory()  # List of '0' and '1' strings
    return "".join(bits)

random_key = quantum_random_bits(256)
print(f"256-bit quantum random key: {random_key}")
```

## Key Takeaways

- QKD provides information-theoretically secure key exchange, guaranteed by quantum physics rather than computational assumptions
- BB84 uses random basis encoding; eavesdropping introduces a detectable ~25% error rate on the sifted key
- E91 uses entangled Bell pairs and Bell inequality tests to detect eavesdroppers
- Practical QKD works over fiber (~300 km) and satellite (~1,200 km) links; quantum repeaters will extend range further
- Post-quantum cryptography (NIST standards: Kyber, Dilithium) is a complementary approach that works on classical hardware
- QKD and PQC serve different needs — QKD for highest-security point-to-point links, PQC for general internet traffic
- Quantum random number generators provide true randomness grounded in quantum mechanics

## Try It Yourself

1. Run the BB84 simulation and verify that without Eve the error rate is 0%, and with Eve it's approximately 25%
2. Modify the simulation so Eve only intercepts 50% of qubits — what error rate does Alice and Bob observe?
3. Research: why can't we use classical optical amplifiers to extend QKD range? (Hint: no-cloning theorem)
4. Compare the key sizes of CRYSTALS-Kyber with RSA-2048 and X25519 (ECDH). What are the tradeoffs?
5. Implement a simple E91 simulation: generate Bell pairs, measure in random bases, and verify that matching-basis measurements yield correlated bits

---

**Next Lesson:** [Quantum Communication and Teleportation](51-qc-quantum-communication.md) — transferring quantum states across distances using entanglement.
