---
title: Cryptographic Applications
---

# Cryptographic Applications

Cryptography is the science of securing communication in the presence of adversaries. It relies heavily on discrete mathematics — number theory, modular arithmetic, group theory, and computational complexity all form the foundation of modern cryptographic systems.

## Symmetric vs Asymmetric Cryptography

### Symmetric Cryptography

In symmetric cryptography, the same key is used for both encryption and decryption.

$$E_k(m) = c \quad \text{and} \quad D_k(c) = m$$

where $k$ is the shared secret key, $m$ is the plaintext message, and $c$ is the ciphertext.

**Properties:**
- Fast encryption and decryption
- Key distribution problem: how do both parties securely share the key?
- Examples: AES, DES, ChaCha20

### Asymmetric Cryptography

In asymmetric (public-key) cryptography, there are two different keys:
- **Public key** $k_{pub}$: used for encryption (shared openly)
- **Private key** $k_{priv}$: used for decryption (kept secret)

$$E_{k_{pub}}(m) = c \quad \text{and} \quad D_{k_{priv}}(c) = m$$

**Properties:**
- Solves the key distribution problem
- Much slower than symmetric encryption
- Based on mathematically hard problems (factoring, discrete log)
- Examples: RSA, ElGamal, Elliptic Curve Cryptography

### Hybrid Approach

In practice, systems use both:
1. Asymmetric crypto to exchange a symmetric key
2. Symmetric crypto for bulk data encryption

This is exactly how TLS/SSL works.

## Diffie-Hellman Key Exchange

The Diffie-Hellman protocol allows two parties to establish a shared secret over an insecure channel without ever transmitting the secret itself.

### The Protocol

**Public parameters** (known to everyone):
- A large prime $p$
- A generator $g$ of the multiplicative group $\mathbb{Z}_p^*$

**Steps:**
1. Alice chooses a secret integer $a$ and computes $A = g^a \mod p$
2. Bob chooses a secret integer $b$ and computes $B = g^b \mod p$
3. Alice and Bob exchange $A$ and $B$ publicly
4. Alice computes the shared secret: $s = B^a \mod p = g^{ab} \mod p$
5. Bob computes the shared secret: $s = A^b \mod p = g^{ab} \mod p$

### Why It Works

Both parties arrive at the same value:

$$B^a \mod p = (g^b)^a \mod p = g^{ab} \mod p = (g^a)^b \mod p = A^b \mod p$$

### Security

An eavesdropper sees $g$, $p$, $A = g^a \mod p$, and $B = g^b \mod p$, but computing $g^{ab} \mod p$ from these values requires solving the **Discrete Logarithm Problem (DLP)**, which is computationally infeasible for large primes.

The DLP states: given $g$, $p$, and $g^a \mod p$, find $a$.

No efficient classical algorithm exists for this when $p$ is sufficiently large (2048+ bits).

### Numerical Example

Let $p = 23$, $g = 5$:
- Alice picks $a = 6$: $A = 5^6 \mod 23 = 15625 \mod 23 = 8$
- Bob picks $b = 15$: $B = 5^{15} \mod 23 = 19$
- Alice computes: $s = 19^6 \mod 23 = 2$
- Bob computes: $s = 8^{15} \mod 23 = 2$

Shared secret: $s = 2$.

## Digital Signatures

Digital signatures provide **authentication**, **integrity**, and **non-repudiation**.

### How They Work

1. The signer uses their **private key** to create a signature on a message
2. Anyone can verify the signature using the signer's **public key**

$$\text{Sign}(k_{priv}, m) = \sigma$$
$$\text{Verify}(k_{pub}, m, \sigma) = \text{true/false}$$

### Properties

- **Authentication**: only the holder of the private key could have signed
- **Integrity**: any modification to the message invalidates the signature
- **Non-repudiation**: the signer cannot deny having signed

### RSA Signatures (Simplified)

Given RSA keys $(n, e)$ public and $d$ private:
- Sign: $\sigma = H(m)^d \mod n$ where $H$ is a hash function
- Verify: check that $\sigma^e \mod n = H(m)$

This works because $(H(m)^d)^e = H(m)^{de} = H(m) \mod n$ by Euler's theorem.

## Hash Functions

A cryptographic hash function $H$ maps arbitrary-length input to a fixed-length output.

$$H: \{0, 1\}^* \rightarrow \{0, 1\}^n$$

### Required Properties

| Property | Definition |
|----------|-----------|
| **Pre-image resistance** | Given $h$, hard to find $m$ such that $H(m) = h$ |
| **Second pre-image resistance** | Given $m_1$, hard to find $m_2 \neq m_1$ with $H(m_1) = H(m_2)$ |
| **Collision resistance** | Hard to find any $m_1 \neq m_2$ with $H(m_1) = H(m_2)$ |

### Additional Properties

- **Deterministic**: same input always produces same output
- **Avalanche effect**: small change in input causes drastic change in output
- **Efficient**: fast to compute for any input

### Common Hash Functions

- **SHA-256**: 256-bit output, used in Bitcoin
- **SHA-3**: based on Keccak sponge construction
- **BLAKE2/BLAKE3**: modern, very fast

### Birthday Attack

Due to the birthday paradox, finding a collision in an $n$-bit hash requires approximately $2^{n/2}$ operations, not $2^n$. This is why SHA-256 provides 128-bit collision security.

## Elliptic Curve Cryptography (ECC)

### High-Level Overview

Elliptic curves over finite fields provide an alternative to traditional number-theoretic cryptography with **smaller key sizes** for equivalent security.

An elliptic curve over a finite field $\mathbb{F}_p$ is defined by:

$$y^2 = x^3 + ax + b \pmod{p}$$

where $4a^3 + 27b^2 \neq 0$ (ensures no singularities).

### Point Addition

Points on the curve form a group under a geometric "addition" operation. Given points $P$ and $Q$ on the curve, $P + Q$ is defined geometrically (line through $P$ and $Q$ intersects the curve at a third point, reflect over x-axis).

### Elliptic Curve Discrete Logarithm

The hard problem: given points $P$ and $Q = nP$ (where $nP$ means adding $P$ to itself $n$ times), find $n$.

This is the **Elliptic Curve Discrete Logarithm Problem (ECDLP)**.

### Why ECC?

| Security Level | RSA Key Size | ECC Key Size |
|---------------|-------------|-------------|
| 80 bits | 1024 bits | 160 bits |
| 128 bits | 3072 bits | 256 bits |
| 256 bits | 15360 bits | 512 bits |

ECC achieves the same security with much smaller keys, making it ideal for constrained devices.

### Common Curves

- **secp256k1**: used in Bitcoin
- **Curve25519**: used in Signal, WhatsApp
- **P-256 (secp256r1)**: NIST standard

## Zero-Knowledge Proofs

### Conceptual Understanding

A zero-knowledge proof allows one party (the **prover**) to convince another party (the **verifier**) that a statement is true, **without revealing any information** beyond the truth of the statement.

### Three Properties

1. **Completeness**: if the statement is true, an honest prover can convince the verifier
2. **Soundness**: if the statement is false, no cheating prover can convince the verifier (except with negligible probability)
3. **Zero-knowledge**: the verifier learns nothing beyond the fact that the statement is true

### Classic Example: Ali Baba's Cave

Imagine a circular cave with a door in the middle that requires a secret word to open:
- Prover enters the cave, goes left or right (verifier doesn't see which)
- Verifier shouts "come out from the left" or "come out from the right"
- If the prover knows the secret, they can always come out from the requested side
- After many rounds, the verifier is convinced, but learns nothing about the secret word

### Applications of ZKPs

- **Blockchain privacy**: proving transaction validity without revealing amounts (Zcash)
- **Authentication**: proving you know a password without sending it
- **Voting**: proving your vote is valid without revealing your choice
- **zk-SNARKs/zk-STARKs**: succinct proofs used in blockchain scaling

## Real-World Applications

### TLS/SSL (HTTPS)

The TLS handshake combines multiple cryptographic primitives:
1. **Key exchange**: Diffie-Hellman or ECDH establishes shared secret
2. **Authentication**: server's digital signature (certificate) verified
3. **Symmetric encryption**: AES encrypts application data
4. **Integrity**: HMAC or AEAD ensures messages aren't tampered with

### Bitcoin

Bitcoin uses several cryptographic building blocks:
- **SHA-256**: proof-of-work mining, transaction hashing
- **ECDSA on secp256k1**: signing transactions
- **RIPEMD-160**: address generation
- **Merkle trees** (hash trees): efficient transaction verification

### Secure Messaging (Signal Protocol)

- **X25519**: Diffie-Hellman key agreement on Curve25519
- **Double Ratchet Algorithm**: provides forward secrecy
- **AES-256**: message encryption
- **HMAC-SHA256**: message authentication

## Code: Diffie-Hellman Key Exchange

### C++

```cpp
#include <iostream>
#include <cstdint>
#include <random>
using namespace std;

// Modular exponentiation: base^exp mod mod
uint64_t modPow(uint64_t base, uint64_t exp, uint64_t mod) {
    uint64_t result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) {
            result = (__uint128_t)result * base % mod;
        }
        exp >>= 1;
        base = (__uint128_t)base * base % mod;
    }
    return result;
}

int main() {
    // Public parameters
    uint64_t p = 104729; // A prime number
    uint64_t g = 2;      // Generator

    // Alice's secret and public value
    uint64_t a = 12345; // Alice's private key
    uint64_t A = modPow(g, a, p); // Alice's public value

    // Bob's secret and public value
    uint64_t b = 67890; // Bob's private key
    uint64_t B = modPow(g, b, p); // Bob's public value

    // Shared secret computation
    uint64_t sharedAlice = modPow(B, a, p); // Alice computes
    uint64_t sharedBob = modPow(A, b, p);   // Bob computes

    cout << "Public prime p = " << p << endl;
    cout << "Generator g = " << g << endl;
    cout << "Alice's public value A = " << A << endl;
    cout << "Bob's public value B = " << B << endl;
    cout << "Alice's shared secret = " << sharedAlice << endl;
    cout << "Bob's shared secret = " << sharedBob << endl;
    cout << "Secrets match: " << (sharedAlice == sharedBob ? "Yes" : "No") << endl;

    return 0;
}
```

### C#

```csharp
using System;
using System.Numerics;

class DiffieHellman
{
    static BigInteger ModPow(BigInteger baseVal, BigInteger exp, BigInteger mod)
    {
        return BigInteger.ModPow(baseVal, exp, mod);
    }

    static void Main()
    {
        // Public parameters
        BigInteger p = 104729; // Prime
        BigInteger g = 2;      // Generator

        // Alice's secret and public value
        BigInteger a = 12345;
        BigInteger A = ModPow(g, a, p);

        // Bob's secret and public value
        BigInteger b = 67890;
        BigInteger B = ModPow(g, b, p);

        // Shared secret computation
        BigInteger sharedAlice = ModPow(B, a, p);
        BigInteger sharedBob = ModPow(A, b, p);

        Console.WriteLine($"Public prime p = {p}");
        Console.WriteLine($"Generator g = {g}");
        Console.WriteLine($"Alice's public value A = {A}");
        Console.WriteLine($"Bob's public value B = {B}");
        Console.WriteLine($"Alice's shared secret = {sharedAlice}");
        Console.WriteLine($"Bob's shared secret = {sharedBob}");
        Console.WriteLine($"Secrets match: {sharedAlice == sharedBob}");
    }
}
```

### Java

```java
import java.math.BigInteger;

public class DiffieHellman {
    public static void main(String[] args) {
        // Public parameters
        BigInteger p = BigInteger.valueOf(104729); // Prime
        BigInteger g = BigInteger.valueOf(2);      // Generator

        // Alice's secret and public value
        BigInteger a = BigInteger.valueOf(12345);
        BigInteger A = g.modPow(a, p);

        // Bob's secret and public value
        BigInteger b = BigInteger.valueOf(67890);
        BigInteger B = g.modPow(b, p);

        // Shared secret computation
        BigInteger sharedAlice = B.modPow(a, p);
        BigInteger sharedBob = A.modPow(b, p);

        System.out.println("Public prime p = " + p);
        System.out.println("Generator g = " + g);
        System.out.println("Alice's public value A = " + A);
        System.out.println("Bob's public value B = " + B);
        System.out.println("Alice's shared secret = " + sharedAlice);
        System.out.println("Bob's shared secret = " + sharedBob);
        System.out.println("Secrets match: " + sharedAlice.equals(sharedBob));
    }
}
```

### Python

```python
def mod_pow(base, exp, mod):
    """Modular exponentiation using built-in pow."""
    return pow(base, exp, mod)

def diffie_hellman_demo():
    # Public parameters
    p = 104729  # A prime number
    g = 2       # Generator

    # Alice's secret and public value
    a = 12345  # Alice's private key
    A = mod_pow(g, a, p)  # Alice's public value

    # Bob's secret and public value
    b = 67890  # Bob's private key
    B = mod_pow(g, b, p)  # Bob's public value

    # Shared secret computation
    shared_alice = mod_pow(B, a, p)  # Alice computes B^a mod p
    shared_bob = mod_pow(A, b, p)    # Bob computes A^b mod p

    print(f"Public prime p = {p}")
    print(f"Generator g = {g}")
    print(f"Alice's public value A = {A}")
    print(f"Bob's public value B = {B}")
    print(f"Alice's shared secret = {shared_alice}")
    print(f"Bob's shared secret = {shared_bob}")
    print(f"Secrets match: {shared_alice == shared_bob}")

diffie_hellman_demo()
```

### JavaScript

```javascript
function modPow(base, exp, mod) {
  base = BigInt(base);
  exp = BigInt(exp);
  mod = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

function diffieHellmanDemo() {
  // Public parameters
  const p = 104729n; // Prime
  const g = 2n;      // Generator

  // Alice's secret and public value
  const a = 12345n;
  const A = modPow(g, a, p);

  // Bob's secret and public value
  const b = 67890n;
  const B = modPow(g, b, p);

  // Shared secret computation
  const sharedAlice = modPow(B, a, p);
  const sharedBob = modPow(A, b, p);

  console.log(`Public prime p = ${p}`);
  console.log(`Generator g = ${g}`);
  console.log(`Alice's public value A = ${A}`);
  console.log(`Bob's public value B = ${B}`);
  console.log(`Alice's shared secret = ${sharedAlice}`);
  console.log(`Bob's shared secret = ${sharedBob}`);
  console.log(`Secrets match: ${sharedAlice === sharedBob}`);
}

diffieHellmanDemo();
```

## Key Takeaways

1. **Symmetric cryptography** uses one shared key (fast but has key distribution problem); **asymmetric cryptography** uses key pairs (solves distribution but is slower).
2. **Diffie-Hellman** enables two parties to agree on a shared secret over an insecure channel by exploiting the difficulty of the discrete logarithm problem.
3. **Digital signatures** provide authentication, integrity, and non-repudiation using asymmetric key pairs.
4. **Cryptographic hash functions** must satisfy pre-image resistance, second pre-image resistance, and collision resistance.
5. **Elliptic Curve Cryptography** provides equivalent security to RSA with much smaller key sizes, making it ideal for modern applications.
6. **Zero-knowledge proofs** allow proving knowledge of a secret without revealing the secret itself — foundational to blockchain privacy and authentication.
7. All modern secure communication (TLS, Signal, Bitcoin) combines multiple cryptographic primitives built on discrete mathematics.
