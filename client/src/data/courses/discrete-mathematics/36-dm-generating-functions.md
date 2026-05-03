---
title: Generating Functions
---

# Generating Functions

Generating functions are one of the most powerful tools in combinatorics. They encode sequences as formal power series, turning counting problems into algebraic manipulations. What seems like abstract algebra turns out to be incredibly practical for solving recurrences, counting structures, and proving identities.

## What Is a Generating Function?

Given a sequence $a_0, a_1, a_2, \ldots$, its **ordinary generating function (OGF)** is:

$$G(x) = \sum_{n=0}^{\infty} a_n x^n = a_0 + a_1 x + a_2 x^2 + a_3 x^3 + \cdots$$

We treat $x$ as a formal variable — we don't worry about convergence. The generating function is just a convenient way to package the entire sequence into one object.

### Simple Examples

| Sequence | Generating Function |
|---|---|
| $1, 1, 1, 1, \ldots$ | $\frac{1}{1-x} = 1 + x + x^2 + x^3 + \cdots$ |
| $1, 0, 1, 0, 1, 0, \ldots$ | $\frac{1}{1-x^2} = 1 + x^2 + x^4 + \cdots$ |
| $1, 2, 3, 4, \ldots$ | $\frac{1}{(1-x)^2} = \sum_{n=0}^{\infty} (n+1)x^n$ |
| $1, c, c^2, c^3, \ldots$ | $\frac{1}{1-cx}$ |
| $1, 1, \frac{1}{2}, \frac{1}{6}, \ldots$ ($\frac{1}{n!}$) | $e^x$ |

### Key Insight

The coefficient of $x^n$ in $G(x)$, written $[x^n]G(x)$, gives us $a_n$. All our work will focus on manipulating $G(x)$ algebraically and then extracting coefficients.

## Operations on Generating Functions

### Addition

If $A(x) = \sum a_n x^n$ and $B(x) = \sum b_n x^n$, then:

$$A(x) + B(x) = \sum (a_n + b_n) x^n$$

Addition corresponds to term-by-term addition of sequences.

### Scalar Multiplication

$$c \cdot A(x) = \sum (c \cdot a_n) x^n$$

### Multiplication (Convolution)

This is the most important operation:

$$A(x) \cdot B(x) = \sum_{n=0}^{\infty} c_n x^n \quad \text{where} \quad c_n = \sum_{k=0}^{n} a_k b_{n-k}$$

The coefficient $c_n$ is the **convolution** of the two sequences. This is exactly what appears when counting ways to combine choices!

**Example**: If $A(x)$ counts ways to choose from set $A$ and $B(x)$ counts ways to choose from set $B$, then $A(x) \cdot B(x)$ counts ways to make a combined choice with total "weight" $n$.

### Right Shift (Multiplication by $x^k$)

$$x^k \cdot A(x) = \sum_{n=k}^{\infty} a_{n-k} x^n$$

This shifts the sequence $k$ positions to the right (prepending $k$ zeros).

### Differentiation

$$A'(x) = \sum_{n=1}^{\infty} n \cdot a_n x^{n-1} = \sum_{n=0}^{\infty} (n+1) a_{n+1} x^n$$

Differentiation multiplies each coefficient by its index and shifts left.

**Example**: Starting from $\frac{1}{1-x} = \sum x^n$, differentiating gives $\frac{1}{(1-x)^2} = \sum (n+1) x^n$.

### Composition with $cx$

$$A(cx) = \sum a_n c^n x^n$$

This multiplies $a_n$ by $c^n$.

## Solving Recurrences with Generating Functions

This is where generating functions truly shine. The method:

1. Define $G(x) = \sum_{n=0}^{\infty} a_n x^n$
2. Multiply the recurrence by $x^n$ and sum over all valid $n$
3. Express everything in terms of $G(x)$
4. Solve for $G(x)$
5. Extract coefficients using partial fractions

### The Fibonacci Sequence

The Fibonacci numbers satisfy: $F_0 = 0$, $F_1 = 1$, $F_n = F_{n-1} + F_{n-2}$ for $n \geq 2$.

**Step 1**: Let $G(x) = \sum_{n=0}^{\infty} F_n x^n$.

**Step 2**: From $F_n = F_{n-1} + F_{n-2}$, multiply by $x^n$ and sum for $n \geq 2$:

$$\sum_{n=2}^{\infty} F_n x^n = \sum_{n=2}^{\infty} F_{n-1} x^n + \sum_{n=2}^{\infty} F_{n-2} x^n$$

**Step 3**: Express in terms of $G(x)$:

- Left side: $G(x) - F_0 - F_1 x = G(x) - x$
- First sum: $x \sum_{n=2}^{\infty} F_{n-1} x^{n-1} = x(G(x) - F_0) = xG(x)$
- Second sum: $x^2 \sum_{n=2}^{\infty} F_{n-2} x^{n-2} = x^2 G(x)$

So: $G(x) - x = xG(x) + x^2 G(x)$

**Step 4**: Solve for $G(x)$:

$$G(x)(1 - x - x^2) = x$$
$$G(x) = \frac{x}{1 - x - x^2}$$

**Step 5**: Partial fractions. The roots of $1 - x - x^2 = 0$ are $x = \frac{-1 \pm \sqrt{5}}{2}$.

Let $\phi = \frac{1+\sqrt{5}}{2}$ (golden ratio) and $\hat{\phi} = \frac{1-\sqrt{5}}{2}$.

Then $1 - x - x^2 = -(x - \frac{1}{\phi})(x - \frac{1}{\hat{\phi}}) = (1 - \phi x)(1 - \hat{\phi} x)$.

Using partial fractions:

$$G(x) = \frac{1}{\sqrt{5}} \left( \frac{1}{1 - \phi x} - \frac{1}{1 - \hat{\phi} x} \right)$$

Extracting coefficients:

$$F_n = \frac{\phi^n - \hat{\phi}^n}{\sqrt{5}} = \frac{1}{\sqrt{5}}\left[\left(\frac{1+\sqrt{5}}{2}\right)^n - \left(\frac{1-\sqrt{5}}{2}\right)^n\right]$$

This is Binet's formula — an exact closed form for Fibonacci numbers!

### Solving a Linear Recurrence: $a_n = 5a_{n-1} - 6a_{n-2}$

With $a_0 = 1$, $a_1 = 2$.

Let $G(x) = \sum a_n x^n$. Following the same process:

$$G(x) - 1 - 2x = 5x(G(x) - 1) - 6x^2 G(x)$$
$$G(x)(1 - 5x + 6x^2) = 1 - 3x$$
$$G(x) = \frac{1 - 3x}{1 - 5x + 6x^2} = \frac{1 - 3x}{(1 - 2x)(1 - 3x)} = \frac{1}{1 - 2x}$$

So $a_n = 2^n$. We can verify: $a_0 = 1$, $a_1 = 2$, $a_2 = 5(2) - 6(1) = 4 = 2^2$. ✓

## Applications: Counting Problems

### The Coin Change Problem

How many ways can you make change for $n$ cents using pennies (1¢), nickels (5¢), and dimes (10¢)?

The GF for pennies (any number of 1¢ coins): $\frac{1}{1-x}$

The GF for nickels: $\frac{1}{1-x^5}$

The GF for dimes: $\frac{1}{1-x^{10}}$

The combined GF is their product:

$$G(x) = \frac{1}{(1-x)(1-x^5)(1-x^{10})}$$

The coefficient $[x^n]G(x)$ gives the number of ways to make $n$ cents.

### Counting Binary Strings

How many binary strings of length $n$ have no two consecutive 1s?

Let $a_n$ be the count. We can show $a_n = a_{n-1} + a_{n-2}$ (strings ending in 0 or 10), with $a_1 = 2$, $a_2 = 3$. This is the Fibonacci sequence shifted: $a_n = F_{n+2}$.

## Partial Fractions Technique

To extract coefficients from a rational generating function $\frac{P(x)}{Q(x)}$:

1. Factor the denominator: $Q(x) = (1 - r_1 x)(1 - r_2 x) \cdots (1 - r_k x)$
2. Decompose: $\frac{P(x)}{Q(x)} = \frac{A_1}{1 - r_1 x} + \frac{A_2}{1 - r_2 x} + \cdots$
3. Since $\frac{A_i}{1 - r_i x} = A_i \sum_{n=0}^{\infty} r_i^n x^n$, we get:

$$a_n = A_1 r_1^n + A_2 r_2^n + \cdots + A_k r_k^n$$

This explains why solutions to linear recurrences with constant coefficients are always sums of exponentials!

## Code: Compute Coefficients of Generating Functions

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Multiply two polynomials (represented as coefficient vectors)
vector<double> multiplyPolynomials(const vector<double>& a, const vector<double>& b) {
    int n = a.size() + b.size() - 1;
    vector<double> result(n, 0.0);
    for (int i = 0; i < (int)a.size(); i++) {
        for (int j = 0; j < (int)b.size(); j++) {
            result[i + j] += a[i] * b[j];
        }
    }
    return result;
}

// Compute first n coefficients of 1/(1-x^k)
vector<double> geometricGF(int k, int numTerms) {
    vector<double> coeffs(numTerms, 0.0);
    for (int i = 0; i < numTerms; i += k) {
        coeffs[i] = 1.0;
    }
    return coeffs;
}

// Coin change: ways to make n cents with given denominations
void coinChangeGF(const vector<int>& denoms, int maxN) {
    vector<double> result = geometricGF(denoms[0], maxN + 1);
    for (int i = 1; i < (int)denoms.size(); i++) {
        vector<double> factor = geometricGF(denoms[i], maxN + 1);
        result = multiplyPolynomials(result, factor);
        result.resize(maxN + 1);
    }
    cout << "Coin change (denoms: ";
    for (int d : denoms) cout << d << " ";
    cout << "):" << endl;
    for (int n = 0; n <= min(maxN, 20); n++) {
        cout << "  Ways to make " << n << " = " << (int)result[n] << endl;
    }
}

int main() {
    // Fibonacci via GF coefficients
    cout << "Fibonacci numbers via generating function:" << endl;
    int n = 15;
    vector<double> fib(n + 1, 0);
    fib[0] = 0;
    fib[1] = 1;
    for (int i = 2; i <= n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }
    for (int i = 0; i <= n; i++) {
        cout << "  F(" << i << ") = " << (int)fib[i] << endl;
    }

    cout << endl;
    coinChangeGF({1, 5, 10}, 25);
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class GeneratingFunctions
{
    static double[] MultiplyPolynomials(double[] a, double[] b, int maxTerms)
    {
        int n = Math.Min(a.Length + b.Length - 1, maxTerms);
        double[] result = new double[n];
        for (int i = 0; i < a.Length; i++)
        {
            for (int j = 0; j < b.Length && i + j < n; j++)
            {
                result[i + j] += a[i] * b[j];
            }
        }
        return result;
    }

    static double[] GeometricGF(int k, int numTerms)
    {
        double[] coeffs = new double[numTerms];
        for (int i = 0; i < numTerms; i += k)
        {
            coeffs[i] = 1.0;
        }
        return coeffs;
    }

    static void CoinChangeGF(int[] denoms, int maxN)
    {
        double[] result = GeometricGF(denoms[0], maxN + 1);
        for (int i = 1; i < denoms.Length; i++)
        {
            double[] factor = GeometricGF(denoms[i], maxN + 1);
            result = MultiplyPolynomials(result, factor, maxN + 1);
        }
        Console.Write("Coin change (denoms: ");
        Console.Write(string.Join(", ", denoms));
        Console.WriteLine("):");
        for (int n = 0; n <= Math.Min(maxN, 20); n++)
        {
            Console.WriteLine($"  Ways to make {n} = {(int)result[n]}");
        }
    }

    static void Main()
    {
        // Fibonacci via closed-form (Binet's formula)
        Console.WriteLine("Fibonacci numbers via Binet's formula:");
        double phi = (1 + Math.Sqrt(5)) / 2;
        double psi = (1 - Math.Sqrt(5)) / 2;
        for (int n = 0; n <= 15; n++)
        {
            double fn = (Math.Pow(phi, n) - Math.Pow(psi, n)) / Math.Sqrt(5);
            Console.WriteLine($"  F({n}) = {Math.Round(fn)}");
        }

        Console.WriteLine();
        CoinChangeGF(new int[] { 1, 5, 10 }, 25);
    }
}
```

```java
import java.util.Arrays;

public class GeneratingFunctions {
    static double[] multiplyPolynomials(double[] a, double[] b, int maxTerms) {
        int n = Math.min(a.length + b.length - 1, maxTerms);
        double[] result = new double[n];
        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < b.length && i + j < n; j++) {
                result[i + j] += a[i] * b[j];
            }
        }
        return result;
    }

    static double[] geometricGF(int k, int numTerms) {
        double[] coeffs = new double[numTerms];
        for (int i = 0; i < numTerms; i += k) {
            coeffs[i] = 1.0;
        }
        return coeffs;
    }

    static void coinChangeGF(int[] denoms, int maxN) {
        double[] result = geometricGF(denoms[0], maxN + 1);
        for (int i = 1; i < denoms.length; i++) {
            double[] factor = geometricGF(denoms[i], maxN + 1);
            result = multiplyPolynomials(result, factor, maxN + 1);
        }
        System.out.print("Coin change (denoms: ");
        System.out.print(Arrays.toString(denoms));
        System.out.println("):");
        for (int n = 0; n <= Math.min(maxN, 20); n++) {
            System.out.printf("  Ways to make %d = %d%n", n, (int) result[n]);
        }
    }

    public static void main(String[] args) {
        // Fibonacci via closed-form (Binet's formula)
        System.out.println("Fibonacci numbers via Binet's formula:");
        double phi = (1 + Math.sqrt(5)) / 2;
        double psi = (1 - Math.sqrt(5)) / 2;
        for (int n = 0; n <= 15; n++) {
            double fn = (Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5);
            System.out.printf("  F(%d) = %.0f%n", n, fn);
        }

        System.out.println();
        coinChangeGF(new int[]{1, 5, 10}, 25);
    }
}
```

```python
from math import sqrt

def multiply_polynomials(a, b, max_terms=None):
    """Multiply two polynomials represented as coefficient lists."""
    n = len(a) + len(b) - 1
    if max_terms:
        n = min(n, max_terms)
    result = [0.0] * n
    for i in range(len(a)):
        for j in range(len(b)):
            if i + j < n:
                result[i + j] += a[i] * b[j]
    return result

def geometric_gf(k, num_terms):
    """Coefficients of 1/(1-x^k) truncated to num_terms."""
    coeffs = [0.0] * num_terms
    for i in range(0, num_terms, k):
        coeffs[i] = 1.0
    return coeffs

def coin_change_gf(denoms, max_n):
    """Count ways to make change using generating functions."""
    result = geometric_gf(denoms[0], max_n + 1)
    for d in denoms[1:]:
        factor = geometric_gf(d, max_n + 1)
        result = multiply_polynomials(result, factor, max_n + 1)
    print(f"Coin change (denoms: {denoms}):")
    for n in range(min(max_n + 1, 21)):
        print(f"  Ways to make {n} = {int(result[n])}")

# Fibonacci via Binet's formula (derived from GF)
print("Fibonacci numbers via Binet's formula:")
phi = (1 + sqrt(5)) / 2
psi = (1 - sqrt(5)) / 2
for n in range(16):
    fn = (phi**n - psi**n) / sqrt(5)
    print(f"  F({n}) = {round(fn)}")

print()
coin_change_gf([1, 5, 10], 25)
```

```javascript
function multiplyPolynomials(a, b, maxTerms) {
  const n = maxTerms ? Math.min(a.length + b.length - 1, maxTerms) : a.length + b.length - 1;
  const result = new Array(n).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length && i + j < n; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

function geometricGF(k, numTerms) {
  const coeffs = new Array(numTerms).fill(0);
  for (let i = 0; i < numTerms; i += k) {
    coeffs[i] = 1.0;
  }
  return coeffs;
}

function coinChangeGF(denoms, maxN) {
  let result = geometricGF(denoms[0], maxN + 1);
  for (let i = 1; i < denoms.length; i++) {
    const factor = geometricGF(denoms[i], maxN + 1);
    result = multiplyPolynomials(result, factor, maxN + 1);
  }
  console.log(`Coin change (denoms: [${denoms}]):`);
  for (let n = 0; n <= Math.min(maxN, 20); n++) {
    console.log(`  Ways to make ${n} = ${Math.round(result[n])}`);
  }
}

// Fibonacci via Binet's formula (derived from GF)
console.log("Fibonacci numbers via Binet's formula:");
const phi = (1 + Math.sqrt(5)) / 2;
const psi = (1 - Math.sqrt(5)) / 2;
for (let n = 0; n <= 15; n++) {
  const fn = (Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5);
  console.log(`  F(${n}) = ${Math.round(fn)}`);
}

console.log();
coinChangeGF([1, 5, 10], 25);
```

## Summary Table: GF Toolkit

| Operation | Sequence Effect | GF Operation |
|---|---|---|
| Add sequences | $a_n + b_n$ | $A(x) + B(x)$ |
| Convolve | $\sum_{k} a_k b_{n-k}$ | $A(x) \cdot B(x)$ |
| Right shift by $k$ | $a_{n-k}$ | $x^k A(x)$ |
| Multiply by $n$ | $n \cdot a_n$ | $x A'(x)$ |
| Scale | $c^n a_n$ | $A(cx)$ |
| Prefix sum | $\sum_{k=0}^n a_k$ | $\frac{A(x)}{1-x}$ |

## Key Takeaways

- A **generating function** encodes an entire sequence as a formal power series $G(x) = \sum a_n x^n$.
- **Multiplication** of GFs corresponds to **convolution** — the fundamental operation for combining independent choices.
- To **solve a recurrence**: define GF → manipulate algebraically → solve for closed-form GF → extract coefficients via partial fractions.
- Fibonacci's closed form $F_n = (\phi^n - \hat\phi^n)/\sqrt{5}$ is derived naturally from its generating function $x/(1-x-x^2)$.
- The **coin change** problem becomes simple multiplication of geometric series in GF form.
- Linear recurrences with constant coefficients always yield **rational** GFs, giving solutions as sums of exponentials.
