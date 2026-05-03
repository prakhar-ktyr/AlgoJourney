---
title: Congruences & Linear Congruence Equations
---

# Congruences & Linear Congruence Equations

In the previous lesson, we learned about modular arithmetic and congruences. Now we'll tackle one of the most fundamental problems in number theory: solving **linear congruence equations** of the form $ax \equiv b \pmod{n}$. These equations appear in cryptography, scheduling algorithms, and competitive programming.

---

## 1. Linear Congruence Equations

A **linear congruence equation** has the form:

$$ax \equiv b \pmod{n}$$

where $a$, $b$, and $n$ are known integers, and we want to find all integers $x$ satisfying the equation.

**Examples:**

- $3x \equiv 6 \pmod{9}$ → What values of $x$ satisfy this?
- $5x \equiv 3 \pmod{7}$ → Find $x$
- $4x \equiv 5 \pmod{6}$ → Does a solution exist?

---

## 2. When Do Solutions Exist?

A linear congruence $ax \equiv b \pmod{n}$ has a solution **if and only if**:

$$\gcd(a, n) \mid b$$

That is, $\gcd(a, n)$ must divide $b$.

### Why?

The equation $ax \equiv b \pmod{n}$ is equivalent to finding integers $x$ and $k$ such that:

$$ax = b + kn \quad \Longleftrightarrow \quad ax - kn = b$$

By Bézout's identity, the equation $ax - kn = b$ has integer solutions if and only if $\gcd(a, n)$ divides $b$.

### Examples

- $3x \equiv 6 \pmod{9}$: $\gcd(3, 9) = 3$, and $3 \mid 6$ ✓ → Solutions exist
- $5x \equiv 3 \pmod{7}$: $\gcd(5, 7) = 1$, and $1 \mid 3$ ✓ → Solutions exist
- $4x \equiv 5 \pmod{6}$: $\gcd(4, 6) = 2$, and $2 \nmid 5$ ✗ → No solution

---

## 3. Number of Solutions

If $ax \equiv b \pmod{n}$ has a solution, then it has exactly $d = \gcd(a, n)$ distinct solutions modulo $n$.

The solutions are evenly spaced, separated by $\frac{n}{d}$:

$$x_0, \quad x_0 + \frac{n}{d}, \quad x_0 + \frac{2n}{d}, \quad \ldots, \quad x_0 + \frac{(d-1)n}{d}$$

where $x_0$ is any particular solution.

### Special Case: Unique Solution

When $\gcd(a, n) = 1$, there is exactly **one** solution modulo $n$. This is the most common case in practice.

### Example: $3x \equiv 6 \pmod{9}$

- $d = \gcd(3, 9) = 3$, and $3 \mid 6$ → 3 solutions exist
- Divide through by $d$: $x \equiv 2 \pmod{3}$
- Solutions mod 9: $x = 2, 5, 8$

Check: $3 \times 2 = 6 \equiv 6$, $3 \times 5 = 15 \equiv 6$, $3 \times 8 = 24 \equiv 6$ ✓

---

## 4. Solving Linear Congruences

### Method 1: When $\gcd(a, n) = 1$ (Unique Solution)

If $\gcd(a, n) = 1$, then $a$ has a modular inverse $a^{-1} \pmod{n}$, and:

$$x \equiv a^{-1} \cdot b \pmod{n}$$

**Example:** Solve $5x \equiv 3 \pmod{7}$

1. $\gcd(5, 7) = 1$ → unique solution exists
2. Find $5^{-1} \pmod{7}$: $5 \times 3 = 15 \equiv 1 \pmod{7}$, so $5^{-1} = 3$
3. $x \equiv 3 \times 3 = 9 \equiv 2 \pmod{7}$

Check: $5 \times 2 = 10 \equiv 3 \pmod{7}$ ✓

### Method 2: When $\gcd(a, n) = d > 1$

If $d \mid b$, divide the entire equation by $d$:

$$\frac{a}{d} \cdot x \equiv \frac{b}{d} \pmod{\frac{n}{d}}$$

Now $\gcd\left(\frac{a}{d}, \frac{n}{d}\right) = 1$, so we can use Method 1 on the reduced equation.

**Example:** Solve $6x \equiv 4 \pmod{10}$

1. $d = \gcd(6, 10) = 2$, and $2 \mid 4$ → solutions exist
2. Divide by 2: $3x \equiv 2 \pmod{5}$
3. Find $3^{-1} \pmod{5}$: $3 \times 2 = 6 \equiv 1 \pmod{5}$, so $3^{-1} = 2$
4. $x \equiv 2 \times 2 = 4 \pmod{5}$
5. Solutions mod 10: $x = 4$ and $x = 4 + 5 = 9$

Check: $6 \times 4 = 24 \equiv 4$, $6 \times 9 = 54 \equiv 4$ ✓

---

## 5. Step-by-Step Algorithm

To solve $ax \equiv b \pmod{n}$:

1. Compute $d = \gcd(a, n)$
2. If $d \nmid b$, output "No solution"
3. Otherwise, divide: $a' = a/d$, $b' = b/d$, $n' = n/d$
4. Find $x_0 = (a')^{-1} \cdot b' \mod n'$ (using Extended Euclidean)
5. The $d$ solutions modulo $n$ are: $x_0, x_0 + n', x_0 + 2n', \ldots, x_0 + (d-1)n'$

---

## 6. Systems of Congruences (Preview)

Sometimes we need to solve multiple congruences simultaneously:

$$x \equiv a_1 \pmod{n_1}$$
$$x \equiv a_2 \pmod{n_2}$$
$$\vdots$$
$$x \equiv a_k \pmod{n_k}$$

When the moduli $n_1, n_2, \ldots, n_k$ are pairwise coprime, the **Chinese Remainder Theorem** (CRT) guarantees a unique solution modulo $n_1 \cdot n_2 \cdots n_k$. We'll explore CRT in detail in a future lesson.

### Quick Example

Find $x$ such that $x \equiv 2 \pmod{3}$ and $x \equiv 3 \pmod{5}$.

- Try $x = 2$: $2 \mod 5 = 2 \ne 3$ ✗
- Try $x = 5$: $5 \mod 3 = 2$ ✓, $5 \mod 5 = 0 \ne 3$ ✗
- Try $x = 8$: $8 \mod 3 = 2$ ✓, $8 \mod 5 = 3$ ✓

Solution: $x \equiv 8 \pmod{15}$ (unique modulo $3 \times 5 = 15$).

---

## 7. Applications

### Scheduling

If a task repeats every $a$ hours and another every $b$ hours, finding when both tasks align is a linear congruence problem.

**Example:** Bus A comes every 12 minutes, Bus B every 8 minutes. If Bus A just arrived and Bus B arrives in 3 minutes, when will they arrive together?

We need $12k \equiv 3 \pmod{8}$, i.e., find the smallest $k$ such that $12k - 3$ is divisible by 8.

### Hash Functions

Linear congruences arise in linear probing hash tables. When a collision occurs at position $h$, we probe $h + 1, h + 2, \ldots$ To guarantee all slots are visited, the step size must be coprime with the table size.

### Cryptography

Solving linear congruences is a key step in:
- RSA key generation (finding $d$ such that $ed \equiv 1 \pmod{\phi(n)}$)
- Affine cipher decryption
- Secret sharing schemes

---

## 8. Code: Solve Linear Congruence

### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

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

// Solve ax ≡ b (mod n)
// Returns all solutions modulo n, or empty vector if no solution
vector<long long> solveLinearCongruence(long long a, long long b, long long n) {
    vector<long long> solutions;
    long long x, y;
    long long d = extGcd(a, n, x, y);

    if (b % d != 0) return solutions; // No solution

    // Reduce the equation
    a /= d;
    b /= d;
    long long modReduced = n / d;

    // Find the base solution
    long long x0 = ((x * b) % modReduced + modReduced) % modReduced;

    // Generate all d solutions modulo n
    for (long long i = 0; i < d; i++) {
        solutions.push_back((x0 + i * modReduced) % n);
    }
    return solutions;
}

int main() {
    // Solve 3x ≡ 6 (mod 9)
    auto sols = solveLinearCongruence(3, 6, 9);
    cout << "Solutions of 3x ≡ 6 (mod 9): ";
    for (long long s : sols) cout << s << " ";
    cout << endl;

    // Solve 5x ≡ 3 (mod 7)
    sols = solveLinearCongruence(5, 3, 7);
    cout << "Solutions of 5x ≡ 3 (mod 7): ";
    for (long long s : sols) cout << s << " ";
    cout << endl;

    // Solve 4x ≡ 5 (mod 6) — no solution
    sols = solveLinearCongruence(4, 5, 6);
    cout << "Solutions of 4x ≡ 5 (mod 6): ";
    if (sols.empty()) cout << "No solution";
    cout << endl;

    return 0;
}
```

### C#

```csharp
using System;
using System.Collections.Generic;

class LinearCongruence
{
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

    static List<long> SolveLinearCongruence(long a, long b, long n)
    {
        var solutions = new List<long>();
        long x, y;
        long d = ExtGcd(a, n, out x, out y);

        if (b % d != 0) return solutions; // No solution

        a /= d;
        b /= d;
        long modReduced = n / d;

        long x0 = ((x * b) % modReduced + modReduced) % modReduced;

        for (long i = 0; i < d; i++)
        {
            solutions.Add((x0 + i * modReduced) % n);
        }
        return solutions;
    }

    static void Main()
    {
        var sols = SolveLinearCongruence(3, 6, 9);
        Console.Write("Solutions of 3x ≡ 6 (mod 9): ");
        Console.WriteLine(string.Join(" ", sols));

        sols = SolveLinearCongruence(5, 3, 7);
        Console.Write("Solutions of 5x ≡ 3 (mod 7): ");
        Console.WriteLine(string.Join(" ", sols));

        sols = SolveLinearCongruence(4, 5, 6);
        Console.Write("Solutions of 4x ≡ 5 (mod 6): ");
        Console.WriteLine(sols.Count == 0 ? "No solution" : string.Join(" ", sols));
    }
}
```

### Java

```java
import java.util.ArrayList;
import java.util.List;

public class LinearCongruence {

    static long[] extGcd(long a, long b) {
        if (b == 0) return new long[]{a, 1, 0};
        long[] res = extGcd(b, a % b);
        long g = res[0], x1 = res[1], y1 = res[2];
        return new long[]{g, y1, x1 - (a / b) * y1};
    }

    static List<Long> solveLinearCongruence(long a, long b, long n) {
        List<Long> solutions = new ArrayList<>();
        long[] res = extGcd(a, n);
        long d = res[0], x = res[1];

        if (b % d != 0) return solutions; // No solution

        a /= d;
        b /= d;
        long modReduced = n / d;

        long x0 = ((x * b) % modReduced + modReduced) % modReduced;

        for (long i = 0; i < d; i++) {
            solutions.add((x0 + i * modReduced) % n);
        }
        return solutions;
    }

    public static void main(String[] args) {
        List<Long> sols = solveLinearCongruence(3, 6, 9);
        System.out.println("Solutions of 3x ≡ 6 (mod 9): " + sols);

        sols = solveLinearCongruence(5, 3, 7);
        System.out.println("Solutions of 5x ≡ 3 (mod 7): " + sols);

        sols = solveLinearCongruence(4, 5, 6);
        System.out.println("Solutions of 4x ≡ 5 (mod 6): " +
            (sols.isEmpty() ? "No solution" : sols));
    }
}
```

### Python

```python
def ext_gcd(a, b):
    """Extended Euclidean Algorithm. Returns (gcd, x, y)."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1


def solve_linear_congruence(a, b, n):
    """
    Solve ax ≡ b (mod n).
    Returns list of all solutions modulo n, or empty list if no solution.
    """
    d, x, _ = ext_gcd(a, n)

    if b % d != 0:
        return []  # No solution

    # Reduce the equation
    a //= d
    b //= d
    mod_reduced = n // d

    # Base solution
    x0 = (x * b) % mod_reduced

    # Generate all d solutions modulo n
    return [(x0 + i * mod_reduced) % n for i in range(d)]


# Examples
print(f"Solutions of 3x ≡ 6 (mod 9): {solve_linear_congruence(3, 6, 9)}")
print(f"Solutions of 5x ≡ 3 (mod 7): {solve_linear_congruence(5, 3, 7)}")
print(f"Solutions of 4x ≡ 5 (mod 6): {solve_linear_congruence(4, 5, 6)}")
print(f"Solutions of 6x ≡ 4 (mod 10): {solve_linear_congruence(6, 4, 10)}")
```

### JavaScript

```javascript
function extGcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x1, y1] = extGcd(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

function solveLinearCongruence(a, b, n) {
  // Convert to BigInt for safety
  a = BigInt(a);
  b = BigInt(b);
  n = BigInt(n);

  const [d, x] = extGcd(a, n);

  if (b % d !== 0n) return []; // No solution

  const aReduced = a / d;
  const bReduced = b / d;
  const modReduced = n / d;

  const x0 = ((x * bReduced) % modReduced + modReduced) % modReduced;

  const solutions = [];
  for (let i = 0n; i < d; i++) {
    solutions.push((x0 + i * modReduced) % n);
  }
  return solutions;
}

// Examples
console.log("Solutions of 3x ≡ 6 (mod 9):", solveLinearCongruence(3, 6, 9));
console.log("Solutions of 5x ≡ 3 (mod 7):", solveLinearCongruence(5, 3, 7));
console.log("Solutions of 4x ≡ 5 (mod 6):", solveLinearCongruence(4, 5, 6));
console.log("Solutions of 6x ≡ 4 (mod 10):", solveLinearCongruence(6, 4, 10));
```

---

## 9. Practice Problems

1. Solve $7x \equiv 3 \pmod{11}$
2. Solve $12x \equiv 8 \pmod{16}$
3. Find all solutions of $9x \equiv 6 \pmod{15}$
4. Does $10x \equiv 7 \pmod{15}$ have a solution?
5. Solve $x \equiv 3 \pmod{5}$ and $x \equiv 4 \pmod{7}$ simultaneously

### Solutions

1. $\gcd(7, 11) = 1$. $7^{-1} \equiv 8 \pmod{11}$ (since $7 \times 8 = 56 \equiv 1$). So $x \equiv 8 \times 3 = 24 \equiv 2 \pmod{11}$.

2. $\gcd(12, 16) = 4$, and $4 \mid 8$. Reduce: $3x \equiv 2 \pmod{4}$. $3^{-1} \equiv 3 \pmod{4}$ (since $3 \times 3 = 9 \equiv 1$). So $x_0 \equiv 6 \equiv 2 \pmod{4}$. Solutions: $x = 2, 6, 10, 14$.

3. $\gcd(9, 15) = 3$, and $3 \mid 6$. Reduce: $3x \equiv 2 \pmod{5}$. $3^{-1} \equiv 2 \pmod{5}$. So $x_0 \equiv 4 \pmod{5}$. Solutions: $x = 4, 9, 14$.

4. $\gcd(10, 15) = 5$, and $5 \nmid 7$. **No solution.**

5. Using CRT approach: $x = 3 + 5k$ for some $k$. Then $3 + 5k \equiv 4 \pmod{7}$ → $5k \equiv 1 \pmod{7}$ → $k \equiv 3 \pmod{7}$. So $x = 3 + 5 \times 3 = 18$. Solution: $x \equiv 18 \pmod{35}$.

---

## Key Takeaways

1. **Existence condition:** $ax \equiv b \pmod{n}$ has solutions if and only if $\gcd(a, n) \mid b$.
2. **Number of solutions:** If solutions exist, there are exactly $\gcd(a, n)$ distinct solutions modulo $n$.
3. **Solving technique:** Divide the equation by $\gcd(a, n)$, then use the modular inverse on the reduced equation.
4. **Extended Euclidean Algorithm** is the computational backbone for finding inverses and solving congruences.
5. **Systems of congruences** can be solved when moduli are coprime (Chinese Remainder Theorem).
6. **Applications** include cryptography (RSA key generation), scheduling, hash table design, and error-correcting codes.
7. **Always check** the existence condition before attempting to solve — many congruences have no solution at all.
