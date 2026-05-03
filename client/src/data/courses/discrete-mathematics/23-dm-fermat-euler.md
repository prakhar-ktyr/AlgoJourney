---
title: Fermat's Little Theorem & Euler's Theorem
---

# Fermat's Little Theorem & Euler's Theorem

Two of the most elegant and useful results in number theory are Fermat's Little Theorem and its generalization, Euler's Theorem. These theorems provide powerful shortcuts for modular exponentiation and form the mathematical backbone of RSA cryptography.

---

## 1. Fermat's Little Theorem (FLT)

### Statement

If $p$ is a **prime** number and $a$ is any integer not divisible by $p$ (i.e., $\gcd(a, p) = 1$), then:

$$a^{p-1} \equiv 1 \pmod{p}$$

An equivalent form (valid for all integers $a$, even those divisible by $p$):

$$a^p \equiv a \pmod{p}$$

### Examples

- $p = 7$, $a = 3$: $3^6 = 729$. Check: $729 \div 7 = 104$ remainder $1$. So $3^6 \equiv 1 \pmod{7}$ ✓
- $p = 5$, $a = 2$: $2^4 = 16 \equiv 1 \pmod{5}$ ✓
- $p = 11$, $a = 4$: $4^{10} \equiv 1 \pmod{11}$ ✓

### Intuitive Understanding

Consider the set $\{1, 2, 3, \ldots, p-1\}$ (all nonzero residues mod $p$). If we multiply every element by $a$ (mod $p$), we get the same set in a different order (because $a$ is coprime with $p$). Therefore:

$$a \cdot 2a \cdot 3a \cdots (p-1)a \equiv 1 \cdot 2 \cdot 3 \cdots (p-1) \pmod{p}$$

$$a^{p-1} \cdot (p-1)! \equiv (p-1)! \pmod{p}$$

Since $(p-1)!$ is coprime with $p$, we can cancel it:

$$a^{p-1} \equiv 1 \pmod{p}$$

---

## 2. Using FLT to Find Modular Inverses

Since $a^{p-1} \equiv 1 \pmod{p}$, we can write:

$$a \cdot a^{p-2} \equiv 1 \pmod{p}$$

Therefore, **when $p$ is prime**:

$$a^{-1} \equiv a^{p-2} \pmod{p}$$

This gives us a simple way to compute modular inverses using fast exponentiation!

### Example: Find $3^{-1} \pmod{7}$

$$3^{-1} \equiv 3^{7-2} = 3^5 \pmod{7}$$

$$3^5 = 243 = 34 \times 7 + 5$$

So $3^{-1} \equiv 5 \pmod{7}$.

Check: $3 \times 5 = 15 \equiv 1 \pmod{7}$ ✓

### When to Use FLT vs Extended Euclidean

| Method | Works when | Speed |
|--------|-----------|-------|
| FLT ($a^{p-2} \mod p$) | $p$ is prime | $O(\log p)$ |
| Extended Euclidean | Any $\gcd(a, n) = 1$ | $O(\log n)$ |

Both have the same time complexity, but FLT is simpler to code (just call modPow).

---

## 3. Euler's Totient Function $\phi(n)$

Before stating Euler's theorem, we need to understand the **Euler totient function** (also called Euler's phi function).

### Definition

$\phi(n)$ counts the number of integers from 1 to $n$ that are **coprime** with $n$:

$$\phi(n) = |\{k : 1 \le k \le n, \gcd(k, n) = 1\}|$$

### Examples

- $\phi(1) = 1$ (only 1 is coprime with 1)
- $\phi(6) = 2$ (only 1 and 5 are coprime with 6)
- $\phi(7) = 6$ (1, 2, 3, 4, 5, 6 are all coprime with 7)
- $\phi(8) = 4$ (1, 3, 5, 7 are coprime with 8)
- $\phi(12) = 4$ (1, 5, 7, 11 are coprime with 12)

---

## 4. Computing $\phi(n)$

### Case 1: $n = p$ (Prime)

Every number from 1 to $p-1$ is coprime with $p$:

$$\phi(p) = p - 1$$

### Case 2: $n = p^k$ (Prime Power)

Numbers NOT coprime with $p^k$ are multiples of $p$: there are $p^{k-1}$ of them.

$$\phi(p^k) = p^k - p^{k-1} = p^k\left(1 - \frac{1}{p}\right)$$

**Examples:**
- $\phi(9) = \phi(3^2) = 9 - 3 = 6$
- $\phi(16) = \phi(2^4) = 16 - 8 = 8$
- $\phi(25) = \phi(5^2) = 25 - 5 = 20$

### Case 3: General Formula

If $n = p_1^{k_1} \cdot p_2^{k_2} \cdots p_m^{k_m}$, then:

$$\phi(n) = n \cdot \prod_{p \mid n}\left(1 - \frac{1}{p}\right) = n \cdot \frac{p_1 - 1}{p_1} \cdot \frac{p_2 - 1}{p_2} \cdots \frac{p_m - 1}{p_m}$$

This is because $\phi$ is a **multiplicative function**: if $\gcd(m, n) = 1$, then $\phi(mn) = \phi(m) \cdot \phi(n)$.

### Example: $\phi(60)$

$60 = 2^2 \cdot 3 \cdot 5$

$$\phi(60) = 60 \cdot \left(1 - \frac{1}{2}\right)\left(1 - \frac{1}{3}\right)\left(1 - \frac{1}{5}\right) = 60 \cdot \frac{1}{2} \cdot \frac{2}{3} \cdot \frac{4}{5} = 16$$

Check: integers 1–60 coprime with 60 → there are 16 of them ✓

---

## 5. Euler's Theorem

### Statement

If $\gcd(a, n) = 1$, then:

$$a^{\phi(n)} \equiv 1 \pmod{n}$$

This **generalizes** Fermat's Little Theorem! When $n = p$ (prime), $\phi(p) = p - 1$, so Euler's theorem becomes $a^{p-1} \equiv 1 \pmod{p}$ — exactly FLT.

### Examples

- $a = 3$, $n = 10$: $\phi(10) = 4$, so $3^4 = 81 \equiv 1 \pmod{10}$ ✓
- $a = 7$, $n = 12$: $\phi(12) = 4$, so $7^4 = 2401 \equiv 1 \pmod{12}$ ✓
- $a = 2$, $n = 9$: $\phi(9) = 6$, so $2^6 = 64 \equiv 1 \pmod{9}$ ✓

### Modular Inverse via Euler's Theorem

Since $a^{\phi(n)} \equiv 1 \pmod{n}$:

$$a^{-1} \equiv a^{\phi(n) - 1} \pmod{n}$$

This works even when $n$ is not prime (unlike FLT which requires a prime modulus).

---

## 6. Applications of These Theorems

### Simplifying Large Exponents

To compute $a^k \mod n$, we can reduce the exponent:

$$a^k \equiv a^{k \mod \phi(n)} \pmod{n} \quad \text{(when } \gcd(a, n) = 1\text{)}$$

**Example:** Compute $2^{100} \mod 13$

- $\phi(13) = 12$ (since 13 is prime)
- $100 \mod 12 = 4$
- $2^{100} \equiv 2^4 = 16 \equiv 3 \pmod{13}$

### RSA Cryptography

RSA relies directly on Euler's theorem:

1. Choose primes $p$, $q$; let $n = pq$
2. $\phi(n) = (p-1)(q-1)$
3. Choose $e$ coprime to $\phi(n)$; compute $d = e^{-1} \mod \phi(n)$
4. Encryption: $c = m^e \mod n$
5. Decryption: $m = c^d \mod n$

Decryption works because $c^d = m^{ed} = m^{1 + k\phi(n)} = m \cdot (m^{\phi(n)})^k \equiv m \cdot 1^k = m \pmod{n}$.

### Primality Testing

Fermat's test: if $a^{n-1} \not\equiv 1 \pmod{n}$ for some $a$ coprime to $n$, then $n$ is definitely **composite**. (The converse isn't always true — Carmichael numbers are exceptions.)

---

## 7. Important Properties of $\phi(n)$

| Property | Formula |
|----------|---------|
| Prime | $\phi(p) = p - 1$ |
| Prime power | $\phi(p^k) = p^{k-1}(p - 1)$ |
| Multiplicative | $\phi(mn) = \phi(m)\phi(n)$ when $\gcd(m,n) = 1$ |
| Sum over divisors | $\sum_{d \mid n} \phi(d) = n$ |
| Even values | $\phi(n)$ is even for all $n > 2$ |

The divisor sum property is particularly elegant: for $n = 12$, the divisors are 1, 2, 3, 4, 6, 12:

$$\phi(1) + \phi(2) + \phi(3) + \phi(4) + \phi(6) + \phi(12) = 1 + 1 + 2 + 2 + 2 + 4 = 12$$

---

## 8. Computing Euler's Totient Efficiently

The algorithm mirrors finding prime factors:

1. Start with result = $n$
2. For each prime factor $p$ of $n$:
   - Multiply result by $(1 - 1/p)$, i.e., `result -= result / p`
3. Return result

Time complexity: $O(\sqrt{n})$ (same as trial division factorization).

---

## 9. Code: Euler's Totient & Modular Inverse via FLT

### C++

```cpp
#include <iostream>
using namespace std;

// Compute Euler's totient function phi(n)
long long eulerTotient(long long n) {
    long long result = n;
    for (long long p = 2; p * p <= n; p++) {
        if (n % p == 0) {
            // Remove all factors of p
            while (n % p == 0) {
                n /= p;
            }
            // Apply formula: result *= (1 - 1/p)
            result -= result / p;
        }
    }
    // If n still has a prime factor greater than sqrt(original n)
    if (n > 1) {
        result -= result / n;
    }
    return result;
}

// Fast modular exponentiation
long long modPow(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    if (base < 0) base += mod;

    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (result * base) % mod;
        }
        exp /= 2;
        base = (base * base) % mod;
    }
    return result;
}

// Modular inverse using Fermat's Little Theorem (mod must be prime)
long long modInverseFLT(long long a, long long p) {
    // Only works when p is prime
    return modPow(a, p - 2, p);
}

// Modular inverse using Euler's theorem (works for any n coprime with a)
long long modInverseEuler(long long a, long long n) {
    long long phi = eulerTotient(n);
    return modPow(a, phi - 1, n);
}

int main() {
    // Euler's totient examples
    cout << "phi(1) = " << eulerTotient(1) << endl;
    cout << "phi(6) = " << eulerTotient(6) << endl;
    cout << "phi(7) = " << eulerTotient(7) << endl;
    cout << "phi(12) = " << eulerTotient(12) << endl;
    cout << "phi(60) = " << eulerTotient(60) << endl;
    cout << endl;

    // Modular inverse via FLT (prime modulus)
    cout << "3^(-1) mod 7 (FLT) = " << modInverseFLT(3, 7) << endl;
    cout << "5^(-1) mod 13 (FLT) = " << modInverseFLT(5, 13) << endl;
    cout << endl;

    // Modular inverse via Euler's theorem (composite modulus)
    cout << "3^(-1) mod 10 (Euler) = " << modInverseEuler(3, 10) << endl;
    cout << "7^(-1) mod 12 (Euler) = " << modInverseEuler(7, 12) << endl;
    cout << endl;

    // Using FLT to simplify large exponents
    // 2^100 mod 13: phi(13) = 12, 100 mod 12 = 4, so 2^100 ≡ 2^4 = 16 ≡ 3
    cout << "2^100 mod 13 = " << modPow(2, 100, 13) << endl;

    return 0;
}
```

### C#

```csharp
using System;

class FermatEuler
{
    static long EulerTotient(long n)
    {
        long result = n;
        long temp = n;

        for (long p = 2; p * p <= temp; p++)
        {
            if (temp % p == 0)
            {
                while (temp % p == 0)
                {
                    temp /= p;
                }
                result -= result / p;
            }
        }
        if (temp > 1)
        {
            result -= result / temp;
        }
        return result;
    }

    static long ModPow(long baseVal, long exp, long mod)
    {
        long result = 1;
        baseVal %= mod;
        if (baseVal < 0) baseVal += mod;

        while (exp > 0)
        {
            if (exp % 2 == 1)
            {
                result = (result * baseVal) % mod;
            }
            exp /= 2;
            baseVal = (baseVal * baseVal) % mod;
        }
        return result;
    }

    // Modular inverse via FLT (p must be prime)
    static long ModInverseFLT(long a, long p)
    {
        return ModPow(a, p - 2, p);
    }

    // Modular inverse via Euler's theorem (any n coprime with a)
    static long ModInverseEuler(long a, long n)
    {
        long phi = EulerTotient(n);
        return ModPow(a, phi - 1, n);
    }

    static void Main()
    {
        Console.WriteLine($"phi(1) = {EulerTotient(1)}");
        Console.WriteLine($"phi(6) = {EulerTotient(6)}");
        Console.WriteLine($"phi(7) = {EulerTotient(7)}");
        Console.WriteLine($"phi(12) = {EulerTotient(12)}");
        Console.WriteLine($"phi(60) = {EulerTotient(60)}");
        Console.WriteLine();

        Console.WriteLine($"3^(-1) mod 7 (FLT) = {ModInverseFLT(3, 7)}");
        Console.WriteLine($"5^(-1) mod 13 (FLT) = {ModInverseFLT(5, 13)}");
        Console.WriteLine();

        Console.WriteLine($"3^(-1) mod 10 (Euler) = {ModInverseEuler(3, 10)}");
        Console.WriteLine($"7^(-1) mod 12 (Euler) = {ModInverseEuler(7, 12)}");
        Console.WriteLine();

        Console.WriteLine($"2^100 mod 13 = {ModPow(2, 100, 13)}");
    }
}
```

### Java

```java
public class FermatEuler {

    static long eulerTotient(long n) {
        long result = n;
        long temp = n;

        for (long p = 2; p * p <= temp; p++) {
            if (temp % p == 0) {
                while (temp % p == 0) {
                    temp /= p;
                }
                result -= result / p;
            }
        }
        if (temp > 1) {
            result -= result / temp;
        }
        return result;
    }

    static long modPow(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        if (base < 0) base += mod;

        while (exp > 0) {
            if (exp % 2 == 1) {
                result = (result * base) % mod;
            }
            exp /= 2;
            base = (base * base) % mod;
        }
        return result;
    }

    // Modular inverse via FLT (p must be prime)
    static long modInverseFLT(long a, long p) {
        return modPow(a, p - 2, p);
    }

    // Modular inverse via Euler's theorem
    static long modInverseEuler(long a, long n) {
        long phi = eulerTotient(n);
        return modPow(a, phi - 1, n);
    }

    public static void main(String[] args) {
        System.out.println("phi(1) = " + eulerTotient(1));
        System.out.println("phi(6) = " + eulerTotient(6));
        System.out.println("phi(7) = " + eulerTotient(7));
        System.out.println("phi(12) = " + eulerTotient(12));
        System.out.println("phi(60) = " + eulerTotient(60));
        System.out.println();

        System.out.println("3^(-1) mod 7 (FLT) = " + modInverseFLT(3, 7));
        System.out.println("5^(-1) mod 13 (FLT) = " + modInverseFLT(5, 13));
        System.out.println();

        System.out.println("3^(-1) mod 10 (Euler) = " + modInverseEuler(3, 10));
        System.out.println("7^(-1) mod 12 (Euler) = " + modInverseEuler(7, 12));
        System.out.println();

        System.out.println("2^100 mod 13 = " + modPow(2, 100, 13));
    }
}
```

### Python

```python
def euler_totient(n):
    """Compute Euler's totient function phi(n)."""
    result = n
    p = 2
    temp = n

    while p * p <= temp:
        if temp % p == 0:
            while temp % p == 0:
                temp //= p
            result -= result // p
        p += 1

    if temp > 1:
        result -= result // temp

    return result


def mod_pow(base, exp, mod):
    """Fast modular exponentiation."""
    result = 1
    base %= mod

    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod
        exp //= 2
        base = (base * base) % mod

    return result


def mod_inverse_flt(a, p):
    """Modular inverse using Fermat's Little Theorem (p must be prime)."""
    return mod_pow(a, p - 2, p)


def mod_inverse_euler(a, n):
    """Modular inverse using Euler's theorem (gcd(a, n) must be 1)."""
    phi = euler_totient(n)
    return mod_pow(a, phi - 1, n)


# Euler's totient examples
for n in [1, 6, 7, 8, 12, 60, 100]:
    print(f"phi({n}) = {euler_totient(n)}")

print()

# Modular inverse via FLT (prime modulus)
print(f"3^(-1) mod 7 (FLT) = {mod_inverse_flt(3, 7)}")
print(f"5^(-1) mod 13 (FLT) = {mod_inverse_flt(5, 13)}")

print()

# Modular inverse via Euler's theorem (composite modulus)
print(f"3^(-1) mod 10 (Euler) = {mod_inverse_euler(3, 10)}")
print(f"7^(-1) mod 12 (Euler) = {mod_inverse_euler(7, 12)}")

print()

# Exponent reduction: 2^100 mod 13
print(f"2^100 mod 13 = {mod_pow(2, 100, 13)}")
# Verification: phi(13) = 12, 100 mod 12 = 4, 2^4 = 16 mod 13 = 3
print(f"Verification: 2^4 mod 13 = {pow(2, 4, 13)}")
```

### JavaScript

```javascript
function eulerTotient(n) {
  let result = n;
  let temp = n;

  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      while (temp % p === 0) {
        temp = Math.floor(temp / p);
      }
      result -= Math.floor(result / p);
    }
  }
  if (temp > 1) {
    result -= Math.floor(result / temp);
  }
  return result;
}

function modPow(base, exp, mod) {
  // Using BigInt for precision with large numbers
  base = BigInt(base);
  exp = BigInt(exp);
  mod = BigInt(mod);
  let result = 1n;
  base = ((base % mod) + mod) % mod;

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp /= 2n;
    base = (base * base) % mod;
  }
  return Number(result);
}

// Modular inverse via FLT (p must be prime)
function modInverseFLT(a, p) {
  return modPow(a, p - 2, p);
}

// Modular inverse via Euler's theorem
function modInverseEuler(a, n) {
  const phi = eulerTotient(n);
  return modPow(a, phi - 1, n);
}

// Examples
console.log("Euler's Totient:");
[1, 6, 7, 8, 12, 60, 100].forEach((n) => {
  console.log(`  phi(${n}) = ${eulerTotient(n)}`);
});

console.log("\nModular Inverse (FLT, prime modulus):");
console.log(`  3^(-1) mod 7 = ${modInverseFLT(3, 7)}`);
console.log(`  5^(-1) mod 13 = ${modInverseFLT(5, 13)}`);

console.log("\nModular Inverse (Euler, composite modulus):");
console.log(`  3^(-1) mod 10 = ${modInverseEuler(3, 10)}`);
console.log(`  7^(-1) mod 12 = ${modInverseEuler(7, 12)}`);

console.log(`\n2^100 mod 13 = ${modPow(2, 100, 13)}`);
```

---

## 10. Common Mistakes & Clarifications

### Mistake 1: Applying FLT When Modulus Isn't Prime

FLT **only** works when the modulus is prime. For composite moduli, use Euler's theorem.

### Mistake 2: Forgetting the Coprimality Condition

Both theorems require $\gcd(a, n) = 1$. If $a$ shares a factor with $n$, neither theorem applies directly.

### Mistake 3: Confusing $\phi(n)$ with $n - 1$

$\phi(n) = n - 1$ only when $n$ is prime. For composite $n$, $\phi(n) < n - 1$.

### Mistake 4: Exponent Reduction Without Checking

You can only reduce $a^k \equiv a^{k \mod \phi(n)} \pmod{n}$ when $\gcd(a, n) = 1$. For the general case (including $\gcd(a, n) > 1$), a more careful approach is needed.

---

## 11. Relationship Between the Theorems

```
Euler's Theorem: a^φ(n) ≡ 1 (mod n), gcd(a,n) = 1
        │
        │  When n = p (prime), φ(p) = p - 1
        ▼
Fermat's Little Theorem: a^(p-1) ≡ 1 (mod p)
```

Fermat's Little Theorem is a **special case** of Euler's theorem. Euler's theorem is more general and works for any modulus, not just primes.

---

## Key Takeaways

1. **Fermat's Little Theorem:** If $p$ is prime and $\gcd(a, p) = 1$, then $a^{p-1} \equiv 1 \pmod{p}$.
2. **FLT for inverses:** $a^{-1} \equiv a^{p-2} \pmod{p}$ — the simplest way to compute modular inverses with a prime modulus.
3. **Euler's totient** $\phi(n)$ counts integers from 1 to $n$ coprime with $n$. Key formula: $\phi(n) = n \prod_{p \mid n}(1 - 1/p)$.
4. **Euler's theorem** generalizes FLT: $a^{\phi(n)} \equiv 1 \pmod{n}$ when $\gcd(a, n) = 1$.
5. **Exponent reduction:** $a^k \equiv a^{k \mod \phi(n)} \pmod{n}$ — crucial for computing huge powers efficiently.
6. **RSA cryptography** is built directly on Euler's theorem.
7. **Computing $\phi(n)$** takes $O(\sqrt{n})$ time using trial division of prime factors.
