---
title: Modular Arithmetic
---

# Modular Arithmetic

Modular arithmetic is one of the most important tools in computer science and mathematics. It deals with integers that "wrap around" after reaching a certain value — much like a clock resets after 12 hours. In this lesson, we'll explore congruences, their properties, modular exponentiation, and modular inverses.

---

## 1. What Is Modular Arithmetic?

When we divide an integer $a$ by a positive integer $n$, we get a quotient $q$ and a remainder $r$:

$$a = qn + r, \quad 0 \le r < n$$

The remainder $r$ is written as $a \mod n$ (or $a \% n$ in most programming languages).

**Examples:**

- $17 \mod 5 = 2$ because $17 = 3 \times 5 + 2$
- $23 \mod 7 = 2$ because $23 = 3 \times 7 + 2$
- $100 \mod 10 = 0$ because $100 = 10 \times 10 + 0$

---

## 2. Congruence

Two integers $a$ and $b$ are **congruent modulo** $n$ if they have the same remainder when divided by $n$. We write:

$$a \equiv b \pmod{n}$$

This is equivalent to saying $n$ divides $(a - b)$, i.e., $n \mid (a - b)$.

**Examples:**

- $17 \equiv 2 \pmod{5}$ because $17 - 2 = 15$ is divisible by 5
- $38 \equiv 14 \pmod{12}$ because $38 - 14 = 24$ is divisible by 12
- $-3 \equiv 4 \pmod{7}$ because $-3 - 4 = -7$ is divisible by 7

---

## 3. The Clock Arithmetic Analogy

Think of a 12-hour clock. After 12, the numbers wrap around:

- 13 o'clock → 1 o'clock ($13 \mod 12 = 1$)
- 25 o'clock → 1 o'clock ($25 \mod 12 = 1$)
- 0 o'clock → 12 o'clock (or 0, depending on convention)

This is exactly modular arithmetic with $n = 12$! The "modulus" is like the number of hours on the clock face.

Similarly, days of the week use mod 7:
- If today is Wednesday (day 3), what day is it in 10 days?
- $(3 + 10) \mod 7 = 13 \mod 7 = 6$ → Saturday

---

## 4. Properties of Modular Arithmetic

Modular arithmetic preserves addition, subtraction, and multiplication. If $a \equiv b \pmod{n}$ and $c \equiv d \pmod{n}$, then:

### Addition

$$a + c \equiv b + d \pmod{n}$$

**Example:** $7 \equiv 2 \pmod{5}$ and $8 \equiv 3 \pmod{5}$, so $7 + 8 = 15 \equiv 2 + 3 = 5 \equiv 0 \pmod{5}$.

### Subtraction

$$a - c \equiv b - d \pmod{n}$$

**Example:** $7 - 8 = -1 \equiv 2 - 3 = -1 \equiv 4 \pmod{5}$.

### Multiplication

$$a \cdot c \equiv b \cdot d \pmod{n}$$

**Example:** $7 \times 8 = 56 \equiv 2 \times 3 = 6 \equiv 1 \pmod{5}$.

### Important Warning: Division Does NOT Always Work

Unlike addition and multiplication, we **cannot** simply divide both sides of a congruence. For example:

$$6 \equiv 0 \pmod{6}$$

But dividing both sides by 2 gives $3 \equiv 0 \pmod{6}$, which is **false**!

Division requires the concept of a modular inverse (covered below).

---

## 5. Practical Consequence: Reduce Before Computing

Because mod preserves addition and multiplication, we can reduce intermediate results:

$$(a + b) \mod n = ((a \mod n) + (b \mod n)) \mod n$$
$$(a \times b) \mod n = ((a \mod n) \times (b \mod n)) \mod n$$

This prevents integer overflow in computations with large numbers.

---

## 6. Modular Exponentiation (Fast Power)

Computing $a^k \mod n$ directly is impractical for large $k$ because $a^k$ can be astronomically large. Instead, we use **binary exponentiation** (also called fast power or repeated squaring).

### The Idea

We decompose the exponent into powers of 2. For example:

$$a^{13} = a^{8} \cdot a^{4} \cdot a^{1}$$

because $13 = 1101_2 = 8 + 4 + 1$.

### Algorithm

1. Start with result = 1, base = $a \mod n$
2. While exponent > 0:
   - If exponent is odd, multiply result by base (mod $n$)
   - Square the base (mod $n$)
   - Divide exponent by 2 (integer division)
3. Return result

### Time Complexity

$O(\log k)$ multiplications — exponentially faster than the naive $O(k)$ approach.

### Example: Compute $3^{13} \mod 7$

| Step | Exponent | Base | Result |
|------|----------|------|--------|
| Start | 13 | 3 | 1 |
| Odd → multiply | 12 | 3 | $1 \times 3 = 3$ |
| Square base | 6 | $3^2 = 9 \equiv 2$ | 3 |
| Even | 3 | 2 | 3 |
| Square base | 3 | $2^2 = 4$ | 3 |
| Odd → multiply | 2 | 4 | $3 \times 4 = 12 \equiv 5$ |
| Square base | 1 | $4^2 = 16 \equiv 2$ | 5 |
| Odd → multiply | 0 | 2 | $5 \times 2 = 10 \equiv 3$ |

So $3^{13} \mod 7 = 3$.

---

## 7. Modular Inverse

The **modular inverse** of $a$ modulo $n$ is an integer $x$ such that:

$$a \cdot x \equiv 1 \pmod{n}$$

We write $x = a^{-1} \pmod{n}$.

### When Does It Exist?

The modular inverse of $a$ modulo $n$ exists **if and only if** $\gcd(a, n) = 1$ (i.e., $a$ and $n$ are coprime).

**Examples:**

- $3^{-1} \pmod{7}$: exists because $\gcd(3, 7) = 1$. Answer: 5, since $3 \times 5 = 15 \equiv 1 \pmod{7}$.
- $2^{-1} \pmod{6}$: does NOT exist because $\gcd(2, 6) = 2 \ne 1$.
- $4^{-1} \pmod{9}$: exists because $\gcd(4, 9) = 1$. Answer: 7, since $4 \times 7 = 28 \equiv 1 \pmod{9}$.

### Why It Matters

Modular inverse lets us "divide" in modular arithmetic:

$$\frac{b}{a} \pmod{n} = b \cdot a^{-1} \pmod{n}$$

---

## 8. Finding the Modular Inverse with the Extended Euclidean Algorithm

The Extended Euclidean Algorithm finds integers $x$ and $y$ such that:

$$ax + ny = \gcd(a, n)$$

If $\gcd(a, n) = 1$, then $ax + ny = 1$, which means $ax \equiv 1 \pmod{n}$, so $x$ is the modular inverse of $a$.

### Example: Find $3^{-1} \pmod{11}$

Apply Extended Euclidean on $a = 3$, $n = 11$:

$$11 = 3 \times 3 + 2$$
$$3 = 2 \times 1 + 1$$
$$2 = 1 \times 2 + 0$$

Back-substituting:

$$1 = 3 - 2 \times 1 = 3 - (11 - 3 \times 3) = 3 \times 4 - 11 \times 1$$

So $x = 4$, meaning $3^{-1} \equiv 4 \pmod{11}$.

Check: $3 \times 4 = 12 \equiv 1 \pmod{11}$. ✓

---

## 9. Applications of Modular Arithmetic

### Hashing

Hash functions often use mod to map keys into a fixed-size table:

$$h(k) = k \mod m$$

where $m$ is the table size.

### Checksums

ISBN, credit card numbers, and other identifiers use modular arithmetic for error detection. For example, the Luhn algorithm (credit cards) uses mod 10.

### Cryptography

- **RSA encryption**: relies on modular exponentiation and Euler's theorem
- **Diffie-Hellman key exchange**: uses modular exponentiation in a prime field
- **Digital signatures**: use modular inverse computations

### Competitive Programming

Many problems ask for answers "modulo $10^9 + 7$" to prevent overflow while still verifying correctness.

---

## 10. Code: Modular Exponentiation (Fast Power)

### C++

```cpp
#include <iostream>
using namespace std;

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

// Extended Euclidean Algorithm
long long extGcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long x1, y1;
    long long g = extGcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// Modular inverse using Extended Euclidean Algorithm
long long modInverse(long long a, long long mod) {
    long long x, y;
    long long g = extGcd(a, mod, x, y);
    if (g != 1) return -1; // Inverse doesn't exist
    return (x % mod + mod) % mod;
}

int main() {
    cout << "2^10 mod 1000000007 = " << modPow(2, 10, 1000000007) << endl;
    cout << "3^13 mod 7 = " << modPow(3, 13, 7) << endl;
    cout << "Inverse of 3 mod 11 = " << modInverse(3, 11) << endl;
    cout << "Inverse of 4 mod 9 = " << modInverse(4, 9) << endl;
    return 0;
}
```

### C#

```csharp
using System;

class ModularArithmetic
{
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

    static long ExtGcd(long a, long b, out long x, out long y)
    {
        if (b == 0)
        {
            x = 1;
            y = 0;
            return a;
        }
        long x1, y1;
        long g = ExtGcd(b, a % b, out x1, out y1);
        x = y1;
        y = x1 - (a / b) * y1;
        return g;
    }

    static long ModInverse(long a, long mod)
    {
        long x, y;
        long g = ExtGcd(a, mod, out x, out y);
        if (g != 1) return -1; // Inverse doesn't exist
        return (x % mod + mod) % mod;
    }

    static void Main()
    {
        Console.WriteLine($"2^10 mod 1000000007 = {ModPow(2, 10, 1000000007)}");
        Console.WriteLine($"3^13 mod 7 = {ModPow(3, 13, 7)}");
        Console.WriteLine($"Inverse of 3 mod 11 = {ModInverse(3, 11)}");
        Console.WriteLine($"Inverse of 4 mod 9 = {ModInverse(4, 9)}");
    }
}
```

### Java

```java
public class ModularArithmetic {

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

    static long[] extGcd(long a, long b) {
        if (b == 0) return new long[]{a, 1, 0};
        long[] res = extGcd(b, a % b);
        long g = res[0], x1 = res[1], y1 = res[2];
        return new long[]{g, y1, x1 - (a / b) * y1};
    }

    static long modInverse(long a, long mod) {
        long[] res = extGcd(a, mod);
        if (res[0] != 1) return -1; // Inverse doesn't exist
        return (res[1] % mod + mod) % mod;
    }

    public static void main(String[] args) {
        System.out.println("2^10 mod 1000000007 = " + modPow(2, 10, 1000000007));
        System.out.println("3^13 mod 7 = " + modPow(3, 13, 7));
        System.out.println("Inverse of 3 mod 11 = " + modInverse(3, 11));
        System.out.println("Inverse of 4 mod 9 = " + modInverse(4, 9));
    }
}
```

### Python

```python
def mod_pow(base, exp, mod):
    """Compute base^exp % mod using binary exponentiation."""
    result = 1
    base %= mod

    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod
        exp //= 2
        base = (base * base) % mod

    return result


def ext_gcd(a, b):
    """Extended Euclidean Algorithm. Returns (gcd, x, y) such that ax + by = gcd."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1


def mod_inverse(a, mod):
    """Find modular inverse of a mod n using Extended Euclidean Algorithm."""
    g, x, _ = ext_gcd(a, mod)
    if g != 1:
        return None  # Inverse doesn't exist
    return x % mod


# Examples
print(f"2^10 mod 1000000007 = {mod_pow(2, 10, 1000000007)}")
print(f"3^13 mod 7 = {mod_pow(3, 13, 7)}")
print(f"Inverse of 3 mod 11 = {mod_inverse(3, 11)}")
print(f"Inverse of 4 mod 9 = {mod_inverse(4, 9)}")

# Python also has built-in: pow(base, exp, mod) for modular exponentiation
print(f"Built-in: pow(2, 10, 1000000007) = {pow(2, 10, 1000000007)}")
```

### JavaScript

```javascript
function modPow(base, exp, mod) {
  let result = 1n;
  base = ((base % mod) + mod) % mod;

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp /= 2n;
    base = (base * base) % mod;
  }
  return result;
}

function extGcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = extGcd(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

function modInverse(a, mod) {
  const [g, x] = extGcd(a, mod);
  if (g !== 1n) return null; // Inverse doesn't exist
  return ((x % mod) + mod) % mod;
}

// Examples (using BigInt for large number safety)
console.log(`2^10 mod 1000000007 = ${modPow(2n, 10n, 1000000007n)}`);
console.log(`3^13 mod 7 = ${modPow(3n, 13n, 7n)}`);
console.log(`Inverse of 3 mod 11 = ${modInverse(3n, 11n)}`);
console.log(`Inverse of 4 mod 9 = ${modInverse(4n, 9n)}`);
```

---

## 11. Common Pitfalls

### Negative Numbers

In many languages, the `%` operator can return negative values for negative operands:

- In C++/Java: $(-7) \% 3 = -1$ (not 2!)
- Fix: `((a % n) + n) % n`

### Overflow

When multiplying two large numbers mod $n$, the intermediate product can overflow:

- For 64-bit integers, if $a, b < 10^{9}$, then $a \times b$ fits in a `long long`
- For larger values, use 128-bit integers or modular multiplication techniques

### Division

Never divide directly in modular arithmetic. Always multiply by the modular inverse instead.

---

## 12. Summary Table

| Operation | Formula | Condition |
|-----------|---------|-----------|
| Addition | $(a + b) \mod n$ | Always works |
| Subtraction | $(a - b + n) \mod n$ | Add $n$ to handle negatives |
| Multiplication | $(a \times b) \mod n$ | Always works |
| Exponentiation | Binary exponentiation | $O(\log k)$ |
| Division | $b \cdot a^{-1} \mod n$ | Only when $\gcd(a, n) = 1$ |

---

## Key Takeaways

1. **Congruence** $a \equiv b \pmod{n}$ means $a$ and $b$ have the same remainder when divided by $n$.
2. **Modular arithmetic preserves** addition, subtraction, and multiplication — you can reduce intermediate values to prevent overflow.
3. **Modular exponentiation** (binary/fast power) computes $a^k \mod n$ in $O(\log k)$ time by repeated squaring.
4. **The modular inverse** $a^{-1} \pmod{n}$ exists if and only if $\gcd(a, n) = 1$.
5. **Extended Euclidean Algorithm** is the standard method to find modular inverses.
6. **Applications** span cryptography (RSA, Diffie-Hellman), hashing, checksums, and competitive programming.
7. **Watch out** for negative remainders and overflow — always normalize with `((a % n) + n) % n`.
