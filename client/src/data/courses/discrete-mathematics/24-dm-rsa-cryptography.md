---
title: RSA Cryptography
---

# RSA Cryptography

RSA is one of the most important algorithms in modern cryptography. It enables secure communication over insecure channels by using a pair of keys — one public and one private. Understanding RSA brings together many concepts from number theory including modular arithmetic, Euler's theorem, and prime factorization.

---

## Public-Key Cryptography Concept

Traditional (symmetric) cryptography uses **one shared secret key** for both encryption and decryption. The fundamental problem: how do two parties agree on a secret key without meeting in person?

**Public-key (asymmetric) cryptography** solves this elegantly:

1. Each person generates **two keys**: a **public key** (shared openly) and a **private key** (kept secret)
2. Anyone can **encrypt** a message using the recipient's public key
3. Only the recipient can **decrypt** it using their private key

Think of it like a mailbox:
- Anyone can **drop a letter in** (encrypt with public key)
- Only the owner with the **mailbox key** can retrieve it (decrypt with private key)

The mathematical foundation requires a **trapdoor function** — an operation that is:
- **Easy** to compute in one direction
- **Computationally infeasible** to reverse without special knowledge

For RSA, this trapdoor is based on the difficulty of **factoring large numbers**.

---

## RSA Key Generation

The key generation process creates the public and private key pair.

### Step 1: Choose Two Large Primes

Select two distinct large prime numbers $p$ and $q$.

In practice, these primes are typically 1024 bits each (about 309 decimal digits). For learning, we'll use small numbers.

### Step 2: Compute $n$

Calculate the product:

$$n = p \cdot q$$

This value $n$ is called the **modulus**. It is part of both the public and private keys.

### Step 3: Compute Euler's Totient

Calculate:

$$\phi(n) = (p - 1)(q - 1)$$

This works because $n = pq$ where $p$ and $q$ are distinct primes. Recall that $\phi(n)$ counts the integers from 1 to $n$ that are coprime to $n$.

### Step 4: Choose the Public Exponent $e$

Choose an integer $e$ such that:

$$1 < e < \phi(n) \quad \text{and} \quad \gcd(e, \phi(n)) = 1$$

The value $e$ must be **coprime** to $\phi(n)$. Common choices in practice are:
- $e = 65537 = 2^{16} + 1$ (most common, good balance of security and speed)
- $e = 3$ (fast but requires careful padding)
- $e = 17$

### Step 5: Compute the Private Exponent $d$

Find $d$ such that:

$$d = e^{-1} \pmod{\phi(n)}$$

This means:

$$e \cdot d \equiv 1 \pmod{\phi(n)}$$

We find $d$ using the **Extended Euclidean Algorithm**.

### The Keys

- **Public key**: $(n, e)$ — shared with everyone
- **Private key**: $(n, d)$ — kept secret

The values $p$, $q$, and $\phi(n)$ must also be kept secret (or destroyed after key generation).

---

## Encryption

To encrypt a message $m$ (where $0 \leq m < n$), the sender computes:

$$c = m^e \pmod{n}$$

Where:
- $m$ is the plaintext message (converted to a number)
- $e$ is the recipient's public exponent
- $n$ is the recipient's modulus
- $c$ is the resulting ciphertext

The sender only needs the **public key** $(n, e)$ to encrypt.

---

## Decryption

To decrypt the ciphertext $c$, the recipient computes:

$$m = c^d \pmod{n}$$

Where:
- $c$ is the ciphertext
- $d$ is the recipient's private exponent
- $n$ is the modulus
- $m$ is the recovered plaintext

Only the holder of the **private key** $(n, d)$ can decrypt.

---

## Why RSA Works: Proof Using Euler's Theorem

We need to show that decryption correctly recovers the original message:

$$c^d \equiv m \pmod{n}$$

### The Proof

Starting from the ciphertext:

$$c^d = (m^e)^d = m^{ed} \pmod{n}$$

Since $ed \equiv 1 \pmod{\phi(n)}$, we can write:

$$ed = 1 + k \cdot \phi(n) \quad \text{for some integer } k$$

Therefore:

$$m^{ed} = m^{1 + k \cdot \phi(n)} = m \cdot (m^{\phi(n)})^k$$

By **Euler's theorem**, if $\gcd(m, n) = 1$:

$$m^{\phi(n)} \equiv 1 \pmod{n}$$

So:

$$m^{ed} = m \cdot 1^k = m \pmod{n}$$

This confirms that decryption recovers the original message.

> **Note**: The proof also holds when $\gcd(m, n) \neq 1$ (using the Chinese Remainder Theorem), but this case is extremely unlikely with large primes.

---

## Worked Example with Small Numbers

Let's walk through a complete RSA example step by step.

### Key Generation

**Step 1**: Choose primes $p = 61$ and $q = 53$

**Step 2**: Compute $n$:

$$n = 61 \times 53 = 3233$$

**Step 3**: Compute $\phi(n)$:

$$\phi(3233) = (61 - 1)(53 - 1) = 60 \times 52 = 3120$$

**Step 4**: Choose $e = 17$ (verify: $\gcd(17, 3120) = 1$ ✓)

**Step 5**: Find $d$ such that $17d \equiv 1 \pmod{3120}$

Using the Extended Euclidean Algorithm:

$$17 \times 2753 = 46801 = 15 \times 3120 + 1$$

So $d = 2753$.

**Keys**:
- Public key: $(n, e) = (3233, 17)$
- Private key: $(n, d) = (3233, 2753)$

### Encryption

Encrypt the message $m = 65$ (ASCII for 'A'):

$$c = 65^{17} \pmod{3233}$$

Using modular exponentiation (square-and-multiply):

$$c = 2790$$

### Decryption

Decrypt the ciphertext $c = 2790$:

$$m = 2790^{2753} \pmod{3233}$$

$$m = 65$$

We recover the original message!

### Verification

Let's verify the math works:

$$ed = 17 \times 2753 = 46801$$
$$46801 \mod 3120 = 46801 - 15 \times 3120 = 46801 - 46800 = 1$$ ✓

---

## Security: Why Factoring is Hard

RSA's security relies on the **integer factorization problem**:

> Given $n = p \cdot q$ where $p$ and $q$ are large primes, find $p$ and $q$.

### Why This Makes RSA Secure

If an attacker knows $n$ (public) and can factor it to find $p$ and $q$, they can:
1. Compute $\phi(n) = (p-1)(q-1)$
2. Compute $d = e^{-1} \pmod{\phi(n)}$
3. Decrypt any message

### The Difficulty of Factoring

- **Multiplication is easy**: Computing $n = p \times q$ takes milliseconds even for 1024-bit primes
- **Factoring is hard**: No known classical algorithm can factor large semiprimes in polynomial time

The best known classical algorithm (General Number Field Sieve) has sub-exponential but super-polynomial complexity:

$$O\left(\exp\left(c \cdot (\ln n)^{1/3} \cdot (\ln \ln n)^{2/3}\right)\right)$$

### Key Size Recommendations

| Key Size (bits) | Security Level | Status |
|----------------|---------------|--------|
| 512 | Very weak | Broken (factored in 1999) |
| 1024 | Weak | Not recommended |
| 2048 | Standard | Minimum recommended |
| 4096 | Strong | Recommended for long-term security |

### Potential Threats

- **Quantum computers**: Shor's algorithm can factor integers in polynomial time on a quantum computer. This would break RSA entirely.
- **Advances in factoring**: New mathematical discoveries could improve classical algorithms.

---

## Modular Exponentiation: Square-and-Multiply

Computing $m^e \pmod{n}$ directly is infeasible for large exponents. The **square-and-multiply** (binary exponentiation) method computes this efficiently in $O(\log e)$ multiplications.

### Algorithm

1. Write the exponent $e$ in binary
2. Process bits from left to right (or right to left)
3. For each bit: square the accumulator
4. If the bit is 1: multiply by the base

### Example: $65^{17} \pmod{3233}$

$17$ in binary is $10001$.

| Step | Operation | Result mod 3233 |
|------|-----------|----------------|
| Start | acc = 1 | 1 |
| Bit 1 | square, multiply by 65 | 65 |
| Bit 0 | square | 4225 mod 3233 = 992 |
| Bit 0 | square | 984064 mod 3233 = 2149 |
| Bit 0 | square | 4618201 mod 3233 = 2452 |
| Bit 1 | square, multiply by 65 | (6012304 mod 3233) × 65 mod 3233 = 2790 |

Result: $65^{17} \equiv 2790 \pmod{3233}$

---

## Code: Simplified RSA Implementation

### C++

```cpp
#include <iostream>
#include <cstdint>
#include <tuple>
#include <random>
using namespace std;

// Extended Euclidean Algorithm
// Returns gcd and coefficients x, y such that ax + by = gcd(a, b)
tuple<int64_t, int64_t, int64_t> extendedGCD(int64_t a, int64_t b) {
    if (b == 0) return {a, 1, 0};
    auto [g, x1, y1] = extendedGCD(b, a % b);
    return {g, y1, x1 - (a / b) * y1};
}

// Modular inverse: find x such that ax ≡ 1 (mod m)
int64_t modInverse(int64_t a, int64_t m) {
    auto [g, x, y] = extendedGCD(a, m);
    if (g != 1) return -1; // No inverse exists
    return ((x % m) + m) % m;
}

// Modular exponentiation: base^exp mod mod
int64_t modPow(int64_t base, int64_t exp, int64_t mod) {
    int64_t result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (__int128)result * base % mod;
        }
        exp /= 2;
        base = (__int128)base * base % mod;
    }
    return result;
}

// Simple primality check (trial division - for demo only)
bool isPrime(int64_t n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int64_t i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

// GCD
int64_t gcd(int64_t a, int64_t b) {
    while (b) { a %= b; swap(a, b); }
    return a;
}

struct RSAKey {
    int64_t n, e, d;
};

RSAKey generateKeys(int64_t p, int64_t q) {
    int64_t n = p * q;
    int64_t phi = (p - 1) * (q - 1);

    // Choose e
    int64_t e = 65537;
    if (e >= phi) e = 17;
    while (gcd(e, phi) != 1) e += 2;

    // Compute d
    int64_t d = modInverse(e, phi);

    return {n, e, d};
}

int64_t encrypt(int64_t message, int64_t e, int64_t n) {
    return modPow(message, e, n);
}

int64_t decrypt(int64_t ciphertext, int64_t d, int64_t n) {
    return modPow(ciphertext, d, n);
}

int main() {
    int64_t p = 61, q = 53;

    cout << "RSA Key Generation" << endl;
    cout << "p = " << p << ", q = " << q << endl;

    RSAKey key = generateKeys(p, q);
    cout << "n = " << key.n << endl;
    cout << "Public key (n, e) = (" << key.n << ", " << key.e << ")" << endl;
    cout << "Private key (n, d) = (" << key.n << ", " << key.d << ")" << endl;

    // Encrypt and decrypt
    int64_t message = 65; // ASCII 'A'
    cout << "\nOriginal message: " << message << endl;

    int64_t ciphertext = encrypt(message, key.e, key.n);
    cout << "Encrypted: " << ciphertext << endl;

    int64_t decrypted = decrypt(ciphertext, key.d, key.n);
    cout << "Decrypted: " << decrypted << endl;

    return 0;
}
```

### C#

```csharp
using System;
using System.Numerics;

class RSA
{
    // Extended Euclidean Algorithm
    static (BigInteger gcd, BigInteger x, BigInteger y) ExtendedGCD(
        BigInteger a, BigInteger b)
    {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtendedGCD(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    // Modular inverse
    static BigInteger ModInverse(BigInteger a, BigInteger m)
    {
        var (g, x, _) = ExtendedGCD(a, m);
        if (g != 1) throw new Exception("No inverse exists");
        return ((x % m) + m) % m;
    }

    // Modular exponentiation
    static BigInteger ModPow(BigInteger baseVal, BigInteger exp, BigInteger mod)
    {
        BigInteger result = 1;
        baseVal %= mod;
        while (exp > 0)
        {
            if (exp % 2 == 1)
                result = result * baseVal % mod;
            exp /= 2;
            baseVal = baseVal * baseVal % mod;
        }
        return result;
    }

    // GCD
    static BigInteger GCD(BigInteger a, BigInteger b)
    {
        while (b != 0) { var t = b; b = a % b; a = t; }
        return a;
    }

    // Key generation
    static (BigInteger n, BigInteger e, BigInteger d) GenerateKeys(
        BigInteger p, BigInteger q)
    {
        BigInteger n = p * q;
        BigInteger phi = (p - 1) * (q - 1);

        BigInteger e = 65537;
        if (e >= phi) e = 17;
        while (GCD(e, phi) != 1) e += 2;

        BigInteger d = ModInverse(e, phi);
        return (n, e, d);
    }

    static BigInteger Encrypt(BigInteger message, BigInteger e, BigInteger n)
    {
        return ModPow(message, e, n);
    }

    static BigInteger Decrypt(BigInteger ciphertext, BigInteger d, BigInteger n)
    {
        return ModPow(ciphertext, d, n);
    }

    static void Main()
    {
        BigInteger p = 61, q = 53;
        Console.WriteLine($"RSA Key Generation");
        Console.WriteLine($"p = {p}, q = {q}");

        var (n, e, d) = GenerateKeys(p, q);
        Console.WriteLine($"n = {n}");
        Console.WriteLine($"Public key (n, e) = ({n}, {e})");
        Console.WriteLine($"Private key (n, d) = ({n}, {d})");

        BigInteger message = 65;
        Console.WriteLine($"\nOriginal message: {message}");

        BigInteger ciphertext = Encrypt(message, e, n);
        Console.WriteLine($"Encrypted: {ciphertext}");

        BigInteger decrypted = Decrypt(ciphertext, d, n);
        Console.WriteLine($"Decrypted: {decrypted}");
    }
}
```

### Java

```java
import java.math.BigInteger;

public class RSA {

    // Extended Euclidean Algorithm
    static BigInteger[] extendedGCD(BigInteger a, BigInteger b) {
        if (b.equals(BigInteger.ZERO))
            return new BigInteger[]{a, BigInteger.ONE, BigInteger.ZERO};
        BigInteger[] result = extendedGCD(b, a.mod(b));
        BigInteger g = result[0], x1 = result[1], y1 = result[2];
        return new BigInteger[]{g, y1, x1.subtract(a.divide(b).multiply(y1))};
    }

    // Modular inverse
    static BigInteger modInverse(BigInteger a, BigInteger m) {
        BigInteger[] result = extendedGCD(a, m);
        if (!result[0].equals(BigInteger.ONE))
            throw new ArithmeticException("No inverse exists");
        return result[1].mod(m).add(m).mod(m);
    }

    // Modular exponentiation
    static BigInteger modPow(BigInteger base, BigInteger exp, BigInteger mod) {
        BigInteger result = BigInteger.ONE;
        base = base.mod(mod);
        while (exp.compareTo(BigInteger.ZERO) > 0) {
            if (exp.testBit(0)) {
                result = result.multiply(base).mod(mod);
            }
            exp = exp.shiftRight(1);
            base = base.multiply(base).mod(mod);
        }
        return result;
    }

    // Key generation
    static BigInteger[] generateKeys(BigInteger p, BigInteger q) {
        BigInteger n = p.multiply(q);
        BigInteger phi = p.subtract(BigInteger.ONE)
                          .multiply(q.subtract(BigInteger.ONE));

        BigInteger e = BigInteger.valueOf(65537);
        if (e.compareTo(phi) >= 0) e = BigInteger.valueOf(17);
        while (!e.gcd(phi).equals(BigInteger.ONE))
            e = e.add(BigInteger.TWO);

        BigInteger d = modInverse(e, phi);
        return new BigInteger[]{n, e, d};
    }

    static BigInteger encrypt(BigInteger message, BigInteger e, BigInteger n) {
        return modPow(message, e, n);
    }

    static BigInteger decrypt(BigInteger ciphertext, BigInteger d, BigInteger n) {
        return modPow(ciphertext, d, n);
    }

    public static void main(String[] args) {
        BigInteger p = BigInteger.valueOf(61);
        BigInteger q = BigInteger.valueOf(53);

        System.out.println("RSA Key Generation");
        System.out.println("p = " + p + ", q = " + q);

        BigInteger[] keys = generateKeys(p, q);
        BigInteger n = keys[0], e = keys[1], d = keys[2];

        System.out.println("n = " + n);
        System.out.println("Public key (n, e) = (" + n + ", " + e + ")");
        System.out.println("Private key (n, d) = (" + n + ", " + d + ")");

        BigInteger message = BigInteger.valueOf(65);
        System.out.println("\nOriginal message: " + message);

        BigInteger ciphertext = encrypt(message, e, n);
        System.out.println("Encrypted: " + ciphertext);

        BigInteger decrypted = decrypt(ciphertext, d, n);
        System.out.println("Decrypted: " + decrypted);
    }
}
```

### Python

```python
def extended_gcd(a, b):
    """Extended Euclidean Algorithm.
    Returns (gcd, x, y) such that ax + by = gcd(a, b)."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1


def mod_inverse(a, m):
    """Find modular inverse of a mod m."""
    g, x, _ = extended_gcd(a, m)
    if g != 1:
        raise ValueError("No inverse exists")
    return x % m


def mod_pow(base, exp, mod):
    """Modular exponentiation using square-and-multiply."""
    result = 1
    base %= mod
    while exp > 0:
        if exp % 2 == 1:
            result = result * base % mod
        exp //= 2
        base = base * base % mod
    return result


def gcd(a, b):
    """Compute GCD using Euclidean algorithm."""
    while b:
        a, b = b, a % b
    return a


def generate_keys(p, q):
    """Generate RSA public and private keys."""
    n = p * q
    phi = (p - 1) * (q - 1)

    # Choose e
    e = 65537
    if e >= phi:
        e = 17
    while gcd(e, phi) != 1:
        e += 2

    # Compute d
    d = mod_inverse(e, phi)
    return n, e, d


def encrypt(message, e, n):
    """Encrypt a message using RSA public key."""
    return mod_pow(message, e, n)


def decrypt(ciphertext, d, n):
    """Decrypt a ciphertext using RSA private key."""
    return mod_pow(ciphertext, d, n)


# Demo
if __name__ == "__main__":
    p, q = 61, 53
    print("RSA Key Generation")
    print(f"p = {p}, q = {q}")

    n, e, d = generate_keys(p, q)
    print(f"n = {n}")
    print(f"Public key (n, e) = ({n}, {e})")
    print(f"Private key (n, d) = ({n}, {d})")

    message = 65  # ASCII 'A'
    print(f"\nOriginal message: {message}")

    ciphertext = encrypt(message, e, n)
    print(f"Encrypted: {ciphertext}")

    decrypted = decrypt(ciphertext, d, n)
    print(f"Decrypted: {decrypted}")
```

### JavaScript

```javascript
// Extended Euclidean Algorithm using BigInt
function extendedGCD(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = extendedGCD(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

// Modular inverse
function modInverse(a, m) {
  const [g, x] = extendedGCD(a, m);
  if (g !== 1n) throw new Error("No inverse exists");
  return ((x % m) + m) % m;
}

// Modular exponentiation
function modPow(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp /= 2n;
    base = (base * base) % mod;
  }
  return result;
}

// GCD
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Key generation
function generateKeys(p, q) {
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e = 65537n;
  if (e >= phi) e = 17n;
  while (gcd(e, phi) !== 1n) e += 2n;

  const d = modInverse(e, phi);
  return { n, e, d };
}

function encrypt(message, e, n) {
  return modPow(message, e, n);
}

function decrypt(ciphertext, d, n) {
  return modPow(ciphertext, d, n);
}

// Demo
const p = 61n, q = 53n;
console.log("RSA Key Generation");
console.log(`p = ${p}, q = ${q}`);

const { n, e, d } = generateKeys(p, q);
console.log(`n = ${n}`);
console.log(`Public key (n, e) = (${n}, ${e})`);
console.log(`Private key (n, d) = (${n}, ${d})`);

const message = 65n;
console.log(`\nOriginal message: ${message}`);

const ciphertext = encrypt(message, e, n);
console.log(`Encrypted: ${ciphertext}`);

const decrypted = decrypt(ciphertext, d, n);
console.log(`Decrypted: ${decrypted}`);
```

---

## Digital Signatures with RSA

RSA can also provide **authentication** through digital signatures:

### Signing

The sender "encrypts" with their **private key**:

$$\text{signature} = m^d \pmod{n}$$

### Verifying

Anyone can verify using the sender's **public key**:

$$m = \text{signature}^e \pmod{n}$$

If the recovered message matches the original, the signature is valid. This works because:
- Only the private key holder could have created the signature
- The public key can verify it without revealing the private key

---

## Practical Considerations

### Message Size Limitation

The message $m$ must satisfy $0 \leq m < n$. For messages larger than $n$:
- Break into blocks smaller than $n$
- In practice, use RSA to encrypt a symmetric key, then use that key with AES for the actual data (hybrid encryption)

### Padding Schemes

Raw RSA (textbook RSA) is **insecure** for direct use because:
- It's deterministic (same plaintext → same ciphertext)
- It's malleable (attacker can manipulate ciphertexts)

Real implementations use padding schemes:
- **OAEP** (Optimal Asymmetric Encryption Padding) for encryption
- **PSS** (Probabilistic Signature Scheme) for signatures

### Performance

RSA is **slow** compared to symmetric encryption:
- RSA encryption/decryption: ~1000× slower than AES
- Used primarily for key exchange and signatures, not bulk encryption

---

## Key Takeaways

1. **RSA** is a public-key cryptosystem based on the difficulty of factoring large numbers into their prime components.

2. **Key generation** requires choosing two large primes $p, q$, computing $n = pq$ and $\phi(n) = (p-1)(q-1)$, selecting $e$ coprime to $\phi(n)$, and finding $d = e^{-1} \pmod{\phi(n)}$.

3. **Encryption** uses the public key: $c = m^e \pmod{n}$. **Decryption** uses the private key: $m = c^d \pmod{n}$.

4. **Correctness** follows from Euler's theorem: $m^{ed} = m^{1 + k\phi(n)} = m \cdot (m^{\phi(n)})^k \equiv m \pmod{n}$.

5. **Security** relies on the computational difficulty of factoring $n$ back into $p$ and $q$. With 2048+ bit keys, this is infeasible with current classical computers.

6. **Modular exponentiation** (square-and-multiply) makes RSA practical by computing $m^e \pmod{n}$ in $O(\log e)$ multiplications.

7. In practice, RSA is used with **padding schemes** (OAEP, PSS) and typically only encrypts symmetric keys (hybrid encryption) due to its slower speed compared to symmetric algorithms.
