---
title: Chinese Remainder Theorem
---

# Chinese Remainder Theorem

The Chinese Remainder Theorem (CRT) is a powerful result in number theory that allows us to solve systems of simultaneous congruences. It has been known for nearly 2000 years — the earliest known statement appears in the 3rd-century Chinese text *Sunzi Suanjing* by Sun Tzu (the mathematician, not the military strategist).

---

## The Problem: Simultaneous Congruences

Consider finding a number $x$ that satisfies multiple conditions at once:

$$x \equiv a_1 \pmod{n_1}$$
$$x \equiv a_2 \pmod{n_2}$$
$$\vdots$$
$$x \equiv a_k \pmod{n_k}$$

For example: "Find a number that leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7."

The Chinese Remainder Theorem tells us **when** such a system has a solution and **how** to find it.

---

## CRT Statement

**Theorem (Chinese Remainder Theorem):**

Let $n_1, n_2, \ldots, n_k$ be positive integers that are **pairwise coprime** (i.e., $\gcd(n_i, n_j) = 1$ for all $i \neq j$).

Then the system of congruences:

$$x \equiv a_1 \pmod{n_1}$$
$$x \equiv a_2 \pmod{n_2}$$
$$\vdots$$
$$x \equiv a_k \pmod{n_k}$$

has a **unique solution** modulo $N = n_1 \cdot n_2 \cdots n_k = \prod_{i=1}^{k} n_i$.

In other words:
- A solution **always exists** when the moduli are pairwise coprime
- The solution is **unique** modulo $N$
- All solutions differ by multiples of $N$

### Why Pairwise Coprime?

The condition $\gcd(n_i, n_j) = 1$ is essential. Without it, solutions may not exist.

**Counterexample**: Consider $x \equiv 1 \pmod{4}$ and $x \equiv 2 \pmod{6}$.

From the first: $x$ is odd. From the second: $x$ is even. Contradiction! No solution exists because $\gcd(4, 6) = 2 \neq 1$.

---

## Construction Algorithm

The CRT provides a constructive proof — it tells us exactly how to build the solution.

### Step-by-Step Algorithm

Given pairwise coprime moduli $n_1, n_2, \ldots, n_k$ and remainders $a_1, a_2, \ldots, a_k$:

**Step 1**: Compute the product of all moduli:

$$N = n_1 \cdot n_2 \cdots n_k$$

**Step 2**: For each $i$, compute:

$$N_i = \frac{N}{n_i}$$

This is the product of all moduli **except** $n_i$.

**Step 3**: For each $i$, find the modular inverse of $N_i$ modulo $n_i$:

$$y_i = N_i^{-1} \pmod{n_i}$$

This inverse exists because $\gcd(N_i, n_i) = 1$ (since all $n_j$ with $j \neq i$ are coprime to $n_i$).

**Step 4**: The solution is:

$$x = \sum_{i=1}^{k} a_i \cdot N_i \cdot y_i \pmod{N}$$

### Why This Works

Consider the $i$-th term: $a_i \cdot N_i \cdot y_i$

- When we take this modulo $n_i$: Since $N_i \cdot y_i \equiv 1 \pmod{n_i}$, the term contributes $a_i$.
- When we take this modulo $n_j$ (where $j \neq i$): Since $N_i$ contains $n_j$ as a factor, $N_i \equiv 0 \pmod{n_j}$, so the term contributes 0.

Therefore, $x \equiv a_i \pmod{n_i}$ for each $i$.

---

## Worked Example

**Problem**: Find $x$ such that:

$$x \equiv 2 \pmod{3}$$
$$x \equiv 3 \pmod{5}$$
$$x \equiv 2 \pmod{7}$$

### Verify Pairwise Coprimality

- $\gcd(3, 5) = 1$ ✓
- $\gcd(3, 7) = 1$ ✓
- $\gcd(5, 7) = 1$ ✓

### Step 1: Compute $N$

$$N = 3 \times 5 \times 7 = 105$$

### Step 2: Compute $N_i$ Values

$$N_1 = \frac{105}{3} = 35$$
$$N_2 = \frac{105}{5} = 21$$
$$N_3 = \frac{105}{7} = 15$$

### Step 3: Find Modular Inverses $y_i$

**Find $y_1$**: $35^{-1} \pmod{3}$

$35 \equiv 2 \pmod{3}$, and $2 \times 2 = 4 \equiv 1 \pmod{3}$

So $y_1 = 2$.

**Find $y_2$**: $21^{-1} \pmod{5}$

$21 \equiv 1 \pmod{5}$, and $1 \times 1 = 1 \equiv 1 \pmod{5}$

So $y_2 = 1$.

**Find $y_3$**: $15^{-1} \pmod{7}$

$15 \equiv 1 \pmod{7}$, and $1 \times 1 = 1 \equiv 1 \pmod{7}$

So $y_3 = 1$.

### Step 4: Compute the Solution

$$x = a_1 \cdot N_1 \cdot y_1 + a_2 \cdot N_2 \cdot y_2 + a_3 \cdot N_3 \cdot y_3 \pmod{N}$$

$$x = 2 \times 35 \times 2 + 3 \times 21 \times 1 + 2 \times 15 \times 1 \pmod{105}$$

$$x = 140 + 63 + 30 \pmod{105}$$

$$x = 233 \pmod{105}$$

$$x = 233 - 2 \times 105 = 23$$

### Verification

- $23 \div 3 = 7$ remainder $2$ ✓ ($23 \equiv 2 \pmod{3}$)
- $23 \div 5 = 4$ remainder $3$ ✓ ($23 \equiv 3 \pmod{5}$)
- $23 \div 7 = 3$ remainder $2$ ✓ ($23 \equiv 2 \pmod{7}$)

The solution is $x = 23$, and the general solution is $x = 23 + 105k$ for any integer $k$.

So $x \in \{\ldots, -82, 23, 128, 233, \ldots\}$.

---

## Another Example: Two Congruences

**Problem**: Solve $x \equiv 3 \pmod{7}$ and $x \equiv 5 \pmod{11}$.

**Step 1**: $N = 7 \times 11 = 77$

**Step 2**: $N_1 = 11$, $N_2 = 7$

**Step 3**:
- $y_1 = 11^{-1} \pmod{7}$: $11 \equiv 4 \pmod{7}$, and $4 \times 2 = 8 \equiv 1 \pmod{7}$, so $y_1 = 2$
- $y_2 = 7^{-1} \pmod{11}$: $7 \times 8 = 56 \equiv 1 \pmod{11}$, so $y_2 = 8$

**Step 4**:

$$x = 3 \times 11 \times 2 + 5 \times 7 \times 8 \pmod{77}$$
$$x = 66 + 280 = 346 \pmod{77}$$
$$x = 346 - 4 \times 77 = 346 - 308 = 38$$

**Verify**: $38 = 5 \times 7 + 3$ ✓ and $38 = 3 \times 11 + 5$ ✓

---

## Applications

### 1. Large Number Arithmetic

CRT allows us to break computations with large numbers into independent computations with smaller numbers.

To compute with numbers modulo $N = n_1 n_2 \cdots n_k$:
1. Represent $x$ as the tuple $(x \bmod n_1, x \bmod n_2, \ldots, x \bmod n_k)$
2. Perform arithmetic on each component independently
3. Use CRT to reconstruct the final result

This is called **Residue Number System (RNS)** arithmetic and enables parallelism.

### 2. RSA Speedup (CRT Optimization)

In RSA decryption, we compute $m = c^d \pmod{n}$ where $n = pq$.

Using CRT, we can split this into two smaller exponentiations:

$$m_1 = c^{d \bmod (p-1)} \pmod{p}$$
$$m_2 = c^{d \bmod (q-1)} \pmod{q}$$

Then combine using CRT to get $m \pmod{n}$.

This is approximately **4× faster** because:
- Two exponentiations with half-size numbers
- Each is ~4× faster than one full-size exponentiation ($(\frac{n}{2})^2$ vs $n^2$ for each multiplication)

### 3. Scheduling and Calendar Problems

"What is the smallest positive number of days after which events with periods 3, 5, and 7 all coincide again?"

If event A happens on day 2 (mod 3), event B on day 3 (mod 5), and event C on day 2 (mod 7), then we solve exactly the system from our worked example: day 23.

### 4. Secret Sharing

CRT enables **threshold secret sharing**: split a secret into $k$ shares such that any $k$ shares can reconstruct the secret, but fewer than $k$ reveals nothing.

### 5. Hash Functions and Error Detection

CRT-based techniques are used in:
- Polynomial hashing with multiple moduli (reducing collision probability)
- Error-correcting codes (Reed-Solomon codes)

---

## Iterative (Sieving) Approach

For small moduli, an alternative to the formula is to solve the system iteratively, combining two congruences at a time.

Given $x \equiv a_1 \pmod{n_1}$ and $x \equiv a_2 \pmod{n_2}$:

1. Write $x = a_1 + n_1 \cdot t$ for some integer $t$
2. Substitute into the second: $a_1 + n_1 \cdot t \equiv a_2 \pmod{n_2}$
3. Solve for $t$: $t \equiv (a_2 - a_1) \cdot n_1^{-1} \pmod{n_2}$
4. The combined solution is $x \equiv a_1 + n_1 \cdot t \pmod{n_1 \cdot n_2}$

Repeat with the next congruence until all are combined.

### Example Using Iterative Method

Solve: $x \equiv 2 \pmod{3}$, $x \equiv 3 \pmod{5}$, $x \equiv 2 \pmod{7}$

**Combine first two**:

$x = 2 + 3t$

$2 + 3t \equiv 3 \pmod{5}$

$3t \equiv 1 \pmod{5}$

$t \equiv 2 \pmod{5}$ (since $3 \times 2 = 6 \equiv 1 \pmod{5}$)

So $t = 2 + 5s$, giving $x = 2 + 3(2 + 5s) = 8 + 15s$

Thus $x \equiv 8 \pmod{15}$.

**Combine with third**:

$x = 8 + 15s$

$8 + 15s \equiv 2 \pmod{7}$

$15s \equiv -6 \equiv 1 \pmod{7}$

$s \equiv 1 \times 15^{-1} \equiv 1 \times 1 \equiv 1 \pmod{7}$ (since $15 \equiv 1 \pmod{7}$)

So $s = 1 + 7u$, giving $x = 8 + 15(1 + 7u) = 23 + 105u$

Thus $x \equiv 23 \pmod{105}$ ✓ (same answer!)

---

## Code: CRT Solver

### C++

```cpp
#include <iostream>
#include <vector>
#include <tuple>
using namespace std;

// Extended Euclidean Algorithm
tuple<long long, long long, long long> extendedGCD(long long a, long long b) {
    if (b == 0) return {a, 1, 0};
    auto [g, x1, y1] = extendedGCD(b, a % b);
    return {g, y1, x1 - (a / b) * y1};
}

// Modular inverse of a mod m
long long modInverse(long long a, long long m) {
    auto [g, x, y] = extendedGCD(a, m);
    if (g != 1) return -1; // No inverse
    return ((x % m) + m) % m;
}

// CRT using the direct formula
// Returns x such that x ≡ a[i] (mod n[i]) for all i
// Returns -1 if moduli are not pairwise coprime
long long crt(const vector<long long>& a, const vector<long long>& n) {
    int k = a.size();
    long long N = 1;
    for (int i = 0; i < k; i++) N *= n[i];

    long long x = 0;
    for (int i = 0; i < k; i++) {
        long long Ni = N / n[i];
        long long yi = modInverse(Ni, n[i]);
        if (yi == -1) return -1; // Not coprime
        x = (x + a[i] * Ni % N * yi) % N;
    }
    return (x % N + N) % N;
}

// CRT using iterative (sieving) approach
long long crtIterative(const vector<long long>& a, const vector<long long>& n) {
    long long currentA = a[0];
    long long currentN = n[0];

    for (int i = 1; i < (int)a.size(); i++) {
        // Solve: currentA + currentN * t ≡ a[i] (mod n[i])
        long long diff = ((a[i] - currentA) % n[i] + n[i]) % n[i];
        long long inv = modInverse(currentN % n[i], n[i]);
        if (inv == -1) return -1;

        long long t = diff * inv % n[i];
        currentA = currentA + currentN * t;
        currentN = currentN * n[i];
        currentA = ((currentA % currentN) + currentN) % currentN;
    }
    return currentA;
}

int main() {
    // Example: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
    vector<long long> a = {2, 3, 2};
    vector<long long> n = {3, 5, 7};

    cout << "System of congruences:" << endl;
    for (int i = 0; i < (int)a.size(); i++) {
        cout << "  x ≡ " << a[i] << " (mod " << n[i] << ")" << endl;
    }

    long long result = crt(a, n);
    cout << "\nSolution (direct): x = " << result << endl;

    long long resultIter = crtIterative(a, n);
    cout << "Solution (iterative): x = " << resultIter << endl;

    long long N = 1;
    for (auto ni : n) N *= ni;
    cout << "General solution: x = " << result << " + " << N << "k" << endl;

    // Verify
    cout << "\nVerification:" << endl;
    for (int i = 0; i < (int)a.size(); i++) {
        cout << "  " << result << " mod " << n[i] << " = "
             << result % n[i] << " (expected " << a[i] << ")" << endl;
    }

    return 0;
}
```

### C#

```csharp
using System;
using System.Collections.Generic;

class ChineseRemainderTheorem
{
    // Extended Euclidean Algorithm
    static (long gcd, long x, long y) ExtendedGCD(long a, long b)
    {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtendedGCD(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    // Modular inverse
    static long ModInverse(long a, long m)
    {
        var (g, x, _) = ExtendedGCD(a, m);
        if (g != 1) return -1;
        return ((x % m) + m) % m;
    }

    // CRT direct formula
    static long CRT(long[] a, long[] n)
    {
        int k = a.Length;
        long N = 1;
        foreach (var ni in n) N *= ni;

        long x = 0;
        for (int i = 0; i < k; i++)
        {
            long Ni = N / n[i];
            long yi = ModInverse(Ni, n[i]);
            if (yi == -1) return -1;
            x = (x + a[i] * (Ni % N) % N * yi % N) % N;
        }
        return (x % N + N) % N;
    }

    // CRT iterative approach
    static long CRTIterative(long[] a, long[] n)
    {
        long currentA = a[0];
        long currentN = n[0];

        for (int i = 1; i < a.Length; i++)
        {
            long diff = ((a[i] - currentA) % n[i] + n[i]) % n[i];
            long inv = ModInverse(currentN % n[i], n[i]);
            if (inv == -1) return -1;

            long t = diff * inv % n[i];
            currentA = currentA + currentN * t;
            currentN = currentN * n[i];
            currentA = ((currentA % currentN) + currentN) % currentN;
        }
        return currentA;
    }

    static void Main()
    {
        long[] a = { 2, 3, 2 };
        long[] n = { 3, 5, 7 };

        Console.WriteLine("System of congruences:");
        for (int i = 0; i < a.Length; i++)
            Console.WriteLine($"  x ≡ {a[i]} (mod {n[i]})");

        long result = CRT(a, n);
        Console.WriteLine($"\nSolution (direct): x = {result}");

        long resultIter = CRTIterative(a, n);
        Console.WriteLine($"Solution (iterative): x = {resultIter}");

        long N = 1;
        foreach (var ni in n) N *= ni;
        Console.WriteLine($"General solution: x = {result} + {N}k");

        Console.WriteLine("\nVerification:");
        for (int i = 0; i < a.Length; i++)
            Console.WriteLine($"  {result} mod {n[i]} = {result % n[i]} (expected {a[i]})");
    }
}
```

### Java

```java
public class ChineseRemainderTheorem {

    // Extended Euclidean Algorithm
    static long[] extendedGCD(long a, long b) {
        if (b == 0) return new long[]{a, 1, 0};
        long[] result = extendedGCD(b, a % b);
        long g = result[0], x1 = result[1], y1 = result[2];
        return new long[]{g, y1, x1 - (a / b) * y1};
    }

    // Modular inverse
    static long modInverse(long a, long m) {
        long[] result = extendedGCD(a, m);
        if (result[0] != 1) return -1;
        return ((result[1] % m) + m) % m;
    }

    // CRT direct formula
    static long crt(long[] a, long[] n) {
        int k = a.length;
        long N = 1;
        for (long ni : n) N *= ni;

        long x = 0;
        for (int i = 0; i < k; i++) {
            long Ni = N / n[i];
            long yi = modInverse(Ni % n[i], n[i]);
            if (yi == -1) return -1;
            x = (x + a[i] % N * (Ni % N) % N * yi % N) % N;
        }
        return (x % N + N) % N;
    }

    // CRT iterative approach
    static long crtIterative(long[] a, long[] n) {
        long currentA = a[0];
        long currentN = n[0];

        for (int i = 1; i < a.length; i++) {
            long diff = ((a[i] - currentA) % n[i] + n[i]) % n[i];
            long inv = modInverse(currentN % n[i], n[i]);
            if (inv == -1) return -1;

            long t = diff * inv % n[i];
            currentA = currentA + currentN * t;
            currentN = currentN * n[i];
            currentA = ((currentA % currentN) + currentN) % currentN;
        }
        return currentA;
    }

    public static void main(String[] args) {
        long[] a = {2, 3, 2};
        long[] n = {3, 5, 7};

        System.out.println("System of congruences:");
        for (int i = 0; i < a.length; i++)
            System.out.println("  x ≡ " + a[i] + " (mod " + n[i] + ")");

        long result = crt(a, n);
        System.out.println("\nSolution (direct): x = " + result);

        long resultIter = crtIterative(a, n);
        System.out.println("Solution (iterative): x = " + resultIter);

        long N = 1;
        for (long ni : n) N *= ni;
        System.out.println("General solution: x = " + result + " + " + N + "k");

        System.out.println("\nVerification:");
        for (int i = 0; i < a.length; i++)
            System.out.println("  " + result + " mod " + n[i] + " = "
                + result % n[i] + " (expected " + a[i] + ")");
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
        return None  # No inverse exists
    return x % m


def crt(remainders, moduli):
    """Chinese Remainder Theorem - direct formula.
    Solves x ≡ a[i] (mod n[i]) for all i.
    Returns x mod N where N = product of all moduli."""
    k = len(remainders)
    N = 1
    for n in moduli:
        N *= n

    x = 0
    for i in range(k):
        Ni = N // moduli[i]
        yi = mod_inverse(Ni, moduli[i])
        if yi is None:
            return None  # Moduli not coprime
        x += remainders[i] * Ni * yi

    return x % N


def crt_iterative(remainders, moduli):
    """Chinese Remainder Theorem - iterative approach.
    Combines two congruences at a time."""
    current_a = remainders[0]
    current_n = moduli[0]

    for i in range(1, len(remainders)):
        # Solve: current_a + current_n * t ≡ remainders[i] (mod moduli[i])
        diff = (remainders[i] - current_a) % moduli[i]
        inv = mod_inverse(current_n % moduli[i], moduli[i])
        if inv is None:
            return None

        t = (diff * inv) % moduli[i]
        current_a = current_a + current_n * t
        current_n = current_n * moduli[i]
        current_a = current_a % current_n

    return current_a


# Demo
if __name__ == "__main__":
    # x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
    remainders = [2, 3, 2]
    moduli = [3, 5, 7]

    print("System of congruences:")
    for a, n in zip(remainders, moduli):
        print(f"  x ≡ {a} (mod {n})")

    result = crt(remainders, moduli)
    print(f"\nSolution (direct): x = {result}")

    result_iter = crt_iterative(remainders, moduli)
    print(f"Solution (iterative): x = {result_iter}")

    N = 1
    for n in moduli:
        N *= n
    print(f"General solution: x = {result} + {N}k")

    # Verify
    print("\nVerification:")
    for a, n in zip(remainders, moduli):
        print(f"  {result} mod {n} = {result % n} (expected {a})")
```

### JavaScript

```javascript
// Extended Euclidean Algorithm
function extendedGCD(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = extendedGCD(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

// Modular inverse
function modInverse(a, m) {
  const [g, x] = extendedGCD(a, m);
  if (g !== 1n) return null;
  return ((x % m) + m) % m;
}

// CRT direct formula
function crt(remainders, moduli) {
  const k = remainders.length;
  let N = 1n;
  for (const n of moduli) N *= n;

  let x = 0n;
  for (let i = 0; i < k; i++) {
    const Ni = N / moduli[i];
    const yi = modInverse(Ni % moduli[i], moduli[i]);
    if (yi === null) return null;
    x = (x + remainders[i] * Ni * yi) % N;
  }
  return ((x % N) + N) % N;
}

// CRT iterative approach
function crtIterative(remainders, moduli) {
  let currentA = remainders[0];
  let currentN = moduli[0];

  for (let i = 1; i < remainders.length; i++) {
    const diff = ((remainders[i] - currentA) % moduli[i] + moduli[i]) % moduli[i];
    const inv = modInverse(currentN % moduli[i], moduli[i]);
    if (inv === null) return null;

    const t = (diff * inv) % moduli[i];
    currentA = currentA + currentN * t;
    currentN = currentN * moduli[i];
    currentA = ((currentA % currentN) + currentN) % currentN;
  }
  return currentA;
}

// Demo
const remainders = [2n, 3n, 2n];
const moduli = [3n, 5n, 7n];

console.log("System of congruences:");
for (let i = 0; i < remainders.length; i++) {
  console.log(`  x ≡ ${remainders[i]} (mod ${moduli[i]})`);
}

const result = crt(remainders, moduli);
console.log(`\nSolution (direct): x = ${result}`);

const resultIter = crtIterative(remainders, moduli);
console.log(`Solution (iterative): x = ${resultIter}`);

let N = 1n;
for (const n of moduli) N *= n;
console.log(`General solution: x = ${result} + ${N}k`);

// Verify
console.log("\nVerification:");
for (let i = 0; i < remainders.length; i++) {
  console.log(`  ${result} mod ${moduli[i]} = ${result % moduli[i]} (expected ${remainders[i]})`);
}
```

---

## Generalized CRT (Non-Coprime Moduli)

When moduli are **not** pairwise coprime, the standard CRT doesn't directly apply. However, a solution may still exist.

For two congruences $x \equiv a_1 \pmod{n_1}$ and $x \equiv a_2 \pmod{n_2}$:

A solution exists if and only if:

$$a_1 \equiv a_2 \pmod{\gcd(n_1, n_2)}$$

If a solution exists, it is unique modulo $\text{lcm}(n_1, n_2)$.

**Example**: $x \equiv 3 \pmod{6}$ and $x \equiv 5 \pmod{10}$

$\gcd(6, 10) = 2$ and $3 \equiv 5 \equiv 1 \pmod{2}$ ✓

Solution exists modulo $\text{lcm}(6, 10) = 30$.

Testing: $x = 15$ works ($15 = 2 \times 6 + 3$, $15 = 1 \times 10 + 5$).

---

## Complexity Analysis

| Operation | Time Complexity |
|-----------|----------------|
| Direct CRT formula | $O(k \cdot \log N)$ |
| Iterative CRT | $O(k \cdot \log N)$ |
| Computing $N$ | $O(k)$ |
| Each modular inverse | $O(\log n_i)$ |

Where $k$ is the number of congruences and $N$ is the product of all moduli.

Both approaches are efficient and practical even for large inputs.

---

## Key Takeaways

1. **The Chinese Remainder Theorem** guarantees a unique solution modulo $N = \prod n_i$ for a system of simultaneous congruences when the moduli are **pairwise coprime**.

2. **The construction** uses partial products $N_i = N / n_i$ and their modular inverses $y_i = N_i^{-1} \pmod{n_i}$, combining them as $x = \sum a_i N_i y_i \pmod{N}$.

3. **The iterative method** combines two congruences at a time, which can be simpler to implement and avoids computing the full product $N$ upfront.

4. **Pairwise coprimality** is essential — without it, solutions may not exist. For non-coprime moduli, check the compatibility condition $a_1 \equiv a_2 \pmod{\gcd(n_1, n_2)}$.

5. **Applications** span RSA optimization (4× speedup via CRT), large number arithmetic (residue number systems), scheduling problems, and secret sharing schemes.

6. **Both algorithms** (direct and iterative) run in $O(k \cdot \log N)$ time, making CRT practical for real-world use in cryptography and computer algebra.
