---
title: "Shor's Algorithm"
---

# Shor's Algorithm

**Shor's algorithm** (1994) is arguably the most famous quantum algorithm. It factors large integers in polynomial time — a task believed to be intractable for classical computers. This has profound implications for cryptography, as RSA encryption relies on the difficulty of factoring.

---

## The Problem

**Given:** A composite integer $N$

**Goal:** Find non-trivial factors $p$ and $q$ such that $N = p \times q$

### Why It Matters

- **RSA encryption** relies on the assumption that factoring $N = pq$ (where $p, q$ are large primes) is computationally infeasible
- Best classical algorithms (General Number Field Sieve): $O\left(e^{1.9 (\ln N)^{1/3} (\ln \ln N)^{2/3}}\right)$ — sub-exponential but still impractical for large $N$
- **Shor's algorithm**: $O((\log N)^3)$ — polynomial time!

A sufficiently large quantum computer could break RSA-2048 in hours instead of billions of years.

---

## The Key Insight: Factoring → Period Finding

Shor's algorithm reduces the factoring problem to **period finding**, which quantum computers can solve efficiently.

### The Reduction

1. Choose a random $a$ with $1 < a < N$ and $\gcd(a, N) = 1$
2. Find the **order** (period) $r$ of $a$ modulo $N$: the smallest $r$ such that $a^r \equiv 1 \pmod{N}$
3. If $r$ is even and $a^{r/2} \not\equiv -1 \pmod{N}$, then:

$$\gcd(a^{r/2} - 1, N) \quad \text{and} \quad \gcd(a^{r/2} + 1, N)$$

are non-trivial factors of $N$.

### Why Does This Work?

If $a^r \equiv 1 \pmod{N}$, then:

$$a^r - 1 \equiv 0 \pmod{N}$$

$$(a^{r/2} - 1)(a^{r/2} + 1) \equiv 0 \pmod{N}$$

So $N$ divides $(a^{r/2} - 1)(a^{r/2} + 1)$. If neither factor is divisible by $N$ individually, then $\gcd(a^{r/2} \pm 1, N)$ gives non-trivial factors.

---

## Period Finding with Quantum Phase Estimation

The quantum part of Shor's algorithm uses QPE to find the period $r$.

### The Unitary Operator

Define the modular multiplication operator:

$$U_a|y\rangle = |ay \bmod N\rangle \quad \text{for } 0 \leq y < N$$

The eigenstates of $U_a$ are:

$$|u_k\rangle = \frac{1}{\sqrt{r}} \sum_{j=0}^{r-1} e^{-2\pi i jk/r} |a^j \bmod N\rangle$$

with eigenvalues $e^{2\pi i k/r}$ for $k = 0, 1, \ldots, r-1$.

### Applying QPE

QPE on $U_a$ with eigenstate $|u_k\rangle$ gives an estimate of $k/r$.

**Key trick:** We don't need to prepare $|u_k\rangle$ explicitly! The state $|1\rangle$ is a uniform superposition of all eigenstates:

$$|1\rangle = \frac{1}{\sqrt{r}} \sum_{k=0}^{r-1} |u_k\rangle$$

So QPE with input $|1\rangle$ randomly outputs an estimate of $k/r$ for some $k$.

---

## The Complete Algorithm

### Step 1: Classical Pre-processing

1. Choose random $a$ with $1 < a < N$
2. Compute $\gcd(a, N)$ — if it's not 1, we found a factor (done!)
3. Otherwise proceed to quantum step

### Step 2: Quantum Period Finding

1. Initialize counting register ($t \approx 2\log_2 N$ qubits) to $|0\rangle$ and work register to $|1\rangle$
2. Apply Hadamard to counting register
3. Apply controlled-$U_a^{2^j}$ operations (modular exponentiation)
4. Apply inverse QFT to counting register
5. Measure counting register → get value $m$

### Step 3: Classical Post-processing

1. The measured value gives $m/2^t \approx k/r$ for some $k$
2. Use **continued fractions** to extract $r$ from the approximation $m/2^t$
3. Verify: check if $a^r \equiv 1 \pmod{N}$
4. If $r$ is even and $a^{r/2} \not\equiv -1 \pmod{N}$:
   - Compute $\gcd(a^{r/2} - 1, N)$ and $\gcd(a^{r/2} + 1, N)$
5. If unsuccessful, repeat with a different random $a$

---

## Walkthrough: Factoring N = 15

Let's factor $N = 15$ step by step.

### Step 1: Choose $a = 7$

$\gcd(7, 15) = 1$ ✓ (no immediate factor)

### Step 2: Find the Period of $7^r \bmod 15$

| $r$ | $7^r \bmod 15$ |
|-----|-----------------|
| 1 | 7 |
| 2 | 4 |
| 3 | 13 |
| 4 | 1 ← period! |

So $r = 4$.

### Step 3: Extract Factors

- $r = 4$ is even ✓
- $a^{r/2} = 7^2 = 49 \equiv 4 \pmod{15}$
- $4 \not\equiv -1 \pmod{15}$ ✓

Compute factors:
- $\gcd(a^{r/2} - 1, N) = \gcd(49 - 1, 15) = \gcd(48, 15) = 3$
- $\gcd(a^{r/2} + 1, N) = \gcd(49 + 1, 15) = \gcd(50, 15) = 5$

**Result:** $15 = 3 \times 5$ ✓

---

## Complexity Analysis

| Component | Complexity |
|-----------|-----------|
| Modular exponentiation circuit | $O((\log N)^2)$ gates per controlled-$U$ |
| Number of controlled-$U$ operations | $O(\log N)$ |
| Inverse QFT | $O((\log N)^2)$ gates |
| **Total quantum circuit** | $O((\log N)^3)$ |
| Classical post-processing | $O((\log N)^3)$ (continued fractions + GCD) |
| Expected repetitions | $O(1)$ (success probability > 1/2) |

**Overall: $O((\log N)^3)$** — polynomial in the number of digits!

---

## Comparison with Classical

| Algorithm | Complexity | Type |
|-----------|-----------|------|
| Trial division | $O(\sqrt{N})$ | Exponential in digits |
| Quadratic sieve | $O(e^{(\ln N)^{1/2} (\ln \ln N)^{1/2}})$ | Sub-exponential |
| General number field sieve | $O(e^{1.9(\ln N)^{1/3}(\ln \ln N)^{2/3}})$ | Sub-exponential |
| **Shor's algorithm** | $O((\log N)^3)$ | **Polynomial** |

---

## Qiskit Implementation (Simplified, N=15)

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.circuit.library import QFT
import numpy as np
from math import gcd
from fractions import Fraction

def controlled_mod_mult(a, N, n, power):
    """
    Create a controlled modular multiplication gate: |y⟩ → |a^power * y mod N⟩
    For N=15, we use pre-computed permutation circuits.
    """
    # For the simplified case of N=15
    # We'll build the circuit for a^power mod 15
    qc = QuantumCircuit(n)
    
    a_power = pow(a, power, N)
    
    if N == 15:
        if a_power == 2:
            qc.swap(0, 1)
            qc.swap(1, 2)
            qc.swap(2, 3)
        elif a_power == 4:
            qc.swap(0, 2)
            qc.swap(1, 3)
        elif a_power == 7:
            qc.swap(0, 1)
            qc.swap(1, 2)
            qc.swap(2, 3)
            for i in range(4):
                qc.x(i)
        elif a_power == 8:
            qc.swap(2, 3)
            qc.swap(1, 2)
            qc.swap(0, 1)
        elif a_power == 11:
            qc.swap(2, 3)
            qc.swap(1, 2)
            qc.swap(0, 1)
            for i in range(4):
                qc.x(i)
        elif a_power == 13:
            qc.swap(0, 2)
            qc.swap(1, 3)
            for i in range(4):
                qc.x(i)
    
    return qc.to_gate(label=f"{a}^{power} mod {N}")

def shors_circuit(a, N):
    """
    Build the quantum circuit for Shor's algorithm.
    
    Args:
        a: The base for modular exponentiation
        N: The number to factor
    
    Returns:
        QuantumCircuit: The complete circuit
    """
    # Number of qubits for work register
    n = int(np.ceil(np.log2(N)))
    # Number of counting qubits (2n for good precision)
    t = 2 * n
    
    qc = QuantumCircuit(t + n, t)
    
    # Initialize work register to |1⟩
    qc.x(t)  # Set least significant bit of work register
    
    # Hadamard on counting register
    qc.h(range(t))
    
    qc.barrier()
    
    # Controlled modular exponentiation
    for j in range(t):
        # Controlled-U^(2^j)
        power = 2**j
        mod_mult = controlled_mod_mult(a, N, n, power)
        controlled_gate = mod_mult.control(1)
        qc.append(controlled_gate, [j] + list(range(t, t + n)))
    
    qc.barrier()
    
    # Inverse QFT on counting register
    qft_inv = QFT(t, inverse=True)
    qc.compose(qft_inv, qubits=range(t), inplace=True)
    
    # Measure counting register
    qc.measure(range(t), range(t))
    
    return qc

def find_period_from_measurement(measurement, t, N):
    """
    Use continued fractions to extract the period from a measurement.
    
    Args:
        measurement: The measured value (integer)
        t: Number of counting qubits
        N: The number being factored
    
    Returns:
        int: The estimated period r
    """
    # The measurement gives m/2^t ≈ k/r
    phase = measurement / (2**t)
    
    # Use continued fractions to find r
    frac = Fraction(phase).limit_denominator(N)
    
    return frac.denominator

# Factor N = 15 using a = 7
N = 15
a = 7

print(f"Factoring N = {N} with a = {a}")
print(f"gcd({a}, {N}) = {gcd(a, N)}")
print()

# Build and run the circuit
circuit = shors_circuit(a, N)
n = int(np.ceil(np.log2(N)))
t = 2 * n

print(f"Circuit: {t} counting qubits + {n} work qubits = {t + n} total")
print(circuit.draw(fold=120))

# Execute
sampler = StatevectorSampler()
job = sampler.run([circuit], shots=2048)
result = job.result()
counts = result[0].data.c.get_counts()

print(f"\nMeasurement results:")
sorted_counts = sorted(counts.items(), key=lambda x: -x[1])

for outcome, count in sorted_counts[:8]:
    decimal_value = int(outcome, 2)
    phase = decimal_value / (2**t)
    
    if decimal_value == 0:
        print(f"  {outcome} (m={decimal_value}): phase=0 → trivial, skip")
        continue
    
    r = find_period_from_measurement(decimal_value, t, N)
    print(f"  {outcome} (m={decimal_value}): phase≈{phase:.4f} → r={r}", end="")
    
    # Verify period
    if pow(a, r, N) == 1:
        print(f" ✓ (a^r mod N = 1)", end="")
        
        if r % 2 == 0:
            factor1 = gcd(pow(a, r // 2) - 1, N)
            factor2 = gcd(pow(a, r // 2) + 1, N)
            if factor1 not in [1, N] and factor2 not in [1, N]:
                print(f"\n    → Factors: {factor1} × {factor2} = {N}")
            else:
                print(f" (r/2 gives trivial factors)")
        else:
            print(f" (r is odd, retry)")
    else:
        print(f" ✗ (not a valid period)")
```

### Expected Output

```
Factoring N = 15 with a = 7
gcd(7, 15) = 1

Measurement results:
  00000000 (m=0): phase=0 → trivial, skip
  01000000 (m=64): phase≈0.2500 → r=4 ✓ (a^r mod N = 1)
    → Factors: 3 × 5 = 15
  10000000 (m=128): phase≈0.5000 → r=2 ✓ (not period, retry)
  11000000 (m=192): phase≈0.7500 → r=4 ✓ (a^r mod N = 1)
    → Factors: 3 × 5 = 15
```

---

## The Full Classical Wrapper

```python
def shors_algorithm(N):
    """
    Complete Shor's algorithm with classical pre/post-processing.
    
    Args:
        N: The integer to factor
    
    Returns:
        tuple: (p, q) such that N = p * q
    """
    # Check trivial cases
    if N % 2 == 0:
        return 2, N // 2
    
    # Check if N is a prime power
    for b in range(2, int(np.log2(N)) + 1):
        root = round(N ** (1/b))
        if root**b == N:
            return root, N // root
    
    # Main loop
    max_attempts = 10
    for attempt in range(max_attempts):
        # Choose random a
        a = np.random.randint(2, N)
        
        # Check gcd
        d = gcd(a, N)
        if d > 1:
            return d, N // d
        
        # Quantum period finding
        circuit = shors_circuit(a, N)
        t = 2 * int(np.ceil(np.log2(N)))
        
        sampler = StatevectorSampler()
        job = sampler.run([circuit], shots=100)
        result = job.result()
        counts = result[0].data.c.get_counts()
        
        # Try each measurement outcome
        for outcome in counts:
            m = int(outcome, 2)
            if m == 0:
                continue
            
            r = find_period_from_measurement(m, t, N)
            
            # Verify and extract factors
            if r > 0 and pow(a, r, N) == 1 and r % 2 == 0:
                factor1 = gcd(pow(a, r // 2) - 1, N)
                factor2 = gcd(pow(a, r // 2) + 1, N)
                
                if factor1 not in [1, N] and factor2 not in [1, N]:
                    return factor1, factor2
    
    return None, None

# Run the algorithm
p, q = shors_algorithm(15)
print(f"\n15 = {p} × {q}")
```

---

## Implications for Cryptography

### What Shor's Algorithm Breaks

| Cryptosystem | Based On | Status |
|-------------|----------|--------|
| RSA | Integer factoring | **Broken** by Shor's |
| Diffie-Hellman | Discrete logarithm | **Broken** by Shor's |
| Elliptic Curve | EC discrete log | **Broken** by Shor's |
| AES (symmetric) | Not number-theoretic | Weakened by Grover (halves key length) |

### Post-Quantum Cryptography

New cryptographic systems designed to resist quantum attacks:

- **Lattice-based**: Learning With Errors (LWE), NTRU
- **Hash-based**: SPHINCS+, XMSS
- **Code-based**: McEliece, BIKE
- **Multivariate**: Rainbow (broken), GeMSS
- **Isogeny-based**: SIKE (broken), CSIDH

NIST has standardized post-quantum algorithms (2024): **ML-KEM** (Kyber), **ML-DSA** (Dilithium), **SLH-DSA** (SPHINCS+).

---

## Current State of Quantum Factoring

| Year | Largest Number Factored Quantumly | Method |
|------|-----------------------------------|--------|
| 2001 | 15 (IBM, 7 qubits) | NMR |
| 2012 | 21 (various) | Photonic |
| 2019 | 35 (various) | Compiled circuits |
| 2023 | Small numbers | Noisy devices |

**Breaking RSA-2048** requires ~4,000+ logical qubits (millions of physical qubits with error correction). Current quantum computers have ~1,000+ noisy qubits. We're still far from cryptographically relevant factoring.

---

## Key Takeaways

1. Shor's algorithm factors integers in **$O((\log N)^3)$** time — exponentially faster than the best known classical algorithms
2. The algorithm reduces factoring to **period finding**, which is solved using quantum phase estimation
3. The quantum circuit uses **modular exponentiation** ($U_a|y\rangle = |ay \bmod N\rangle$) and the **inverse QFT**
4. Classical post-processing uses **continued fractions** to extract the period from measurement results
5. Shor's algorithm **breaks RSA**, Diffie-Hellman, and elliptic curve cryptography
6. **Post-quantum cryptography** (lattice-based, hash-based) is being standardized to protect against future quantum computers
7. Current quantum hardware is far from factoring cryptographically relevant numbers

---

## Try It Yourself

1. **Factor N=21**: Modify the implementation for $N = 21$ with $a = 2$ (period $r = 6$)
2. **Try different $a$ values**: For $N = 15$, try $a = 2, 4, 7, 8, 11, 13$ and observe which give useful periods
3. **Continued fractions**: Implement the continued fraction expansion and verify it extracts $r$ from $m/2^t$
4. **Count resources**: Calculate how many qubits and gates would be needed to factor RSA-2048
5. **Classical simulation**: Write the classical modular exponentiation and verify the period for various $(a, N)$ pairs

```python
# Exercise: Classical period finding for comparison
def classical_period_finding(a, N):
    """Find period r such that a^r ≡ 1 (mod N) classically."""
    r = 1
    current = a % N
    while current != 1:
        current = (current * a) % N
        r += 1
        if r > N:  # Safety check
            return None
    return r

# Test for N=15
print("Classical period finding for N=15:")
for a in [2, 4, 7, 8, 11, 13]:
    if gcd(a, 15) == 1:
        r = classical_period_finding(a, 15)
        print(f"  a={a:2d}: r={r}", end="")
        if r % 2 == 0:
            f1 = gcd(a**(r//2) - 1, 15)
            f2 = gcd(a**(r//2) + 1, 15)
            print(f" → gcd({a}^{r//2}±1, 15) = ({f1}, {f2})")
        else:
            print(" (odd period)")
```

---

## Next Lesson

In the next lesson, we'll study **Grover's Search Algorithm** — a quantum algorithm that searches an unsorted database of $N$ items in $O(\sqrt{N})$ time, providing a quadratic speedup over classical linear search.
