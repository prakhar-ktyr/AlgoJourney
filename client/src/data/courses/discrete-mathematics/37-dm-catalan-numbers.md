---
title: Catalan Numbers & Special Sequences
---

# Catalan Numbers & Special Sequences

Some number sequences appear so frequently in combinatorics that they deserve special attention. The Catalan numbers are the most famous — they count an astonishing variety of combinatorial objects. We'll also briefly explore Stirling numbers, Bell numbers, and harmonic numbers.

## Catalan Numbers

The $n$-th Catalan number is:

$$C_n = \frac{1}{n+1}\binom{2n}{n}$$

The first several values are:

$$C_0 = 1, \quad C_1 = 1, \quad C_2 = 2, \quad C_3 = 5, \quad C_4 = 14, \quad C_5 = 42, \quad C_6 = 132$$

### The Recurrence

Catalan numbers satisfy:

$$C_{n+1} = \sum_{i=0}^{n} C_i \cdot C_{n-i}, \quad C_0 = 1$$

This is a **convolution** — the same structure that appears when we split a problem into two independent subproblems at every possible split point.

### Alternative Formulas

$$C_n = \frac{(2n)!}{(n+1)! \cdot n!} = \frac{1}{n+1}\binom{2n}{n} = \binom{2n}{n} - \binom{2n}{n+1}$$

The last form shows $C_n$ counts **Dyck paths** (lattice paths that never cross the diagonal) — it's the total paths minus the "bad" paths.

### Asymptotic Growth

$$C_n \sim \frac{4^n}{n^{3/2} \sqrt{\pi}}$$

Catalan numbers grow exponentially but slightly slower than $4^n$.

## What Do Catalan Numbers Count?

Here's why they're remarkable — all of these are counted by $C_n$:

### 1. Valid Parentheses Sequences

The number of ways to arrange $n$ pairs of matching parentheses:

- $n=1$: `()`
- $n=2$: `(())`, `()()`
- $n=3$: `((()))`, `(()())`, `(())()`, `()(())`, `()()()`

$C_3 = 5$ ✓

### 2. Binary Trees

The number of distinct binary trees with $n+1$ leaves (or equivalently, $n$ internal nodes):

- $n=0$: one leaf (empty tree) → $C_0 = 1$
- $n=1$: one internal node → $C_1 = 1$
- $n=2$: two shapes → $C_2 = 2$
- $n=3$: five shapes → $C_3 = 5$

The recurrence makes this clear: choose a root, then pick a left subtree with $i$ nodes and right subtree with $n-1-i$ nodes.

### 3. Triangulations of a Polygon

The number of ways to triangulate a convex polygon with $n+2$ sides is $C_n$.

For a pentagon ($n=3$): 5 triangulations → $C_3 = 5$ ✓

### 4. Monotone Lattice Paths (Dyck Paths)

Paths from $(0,0)$ to $(2n,0)$ using steps $+1$ (up) and $-1$ (down) that never go below the $x$-axis.

Equivalently: paths from $(0,0)$ to $(n,n)$ on a grid using right and up steps, staying weakly below the diagonal.

### 5. Stack-Sortable Permutations

The number of permutations of $\{1, \ldots, n\}$ that can be sorted using a single stack is $C_n$.

### 6. Non-Crossing Partitions

The number of ways to partition $\{1, \ldots, n\}$ into non-crossing blocks is $C_n$.

### 7. Full Binary Trees

The number of full binary trees (every node has 0 or 2 children) with $n+1$ leaves is $C_n$.

## Why the Recurrence Works

Consider valid parenthesis strings with $n+1$ pairs. The first `(` must match some `)`. Say it matches the one at position $2k+1$:

- Inside the first pair: a valid string with $k$ pairs
- After the first pair: a valid string with $n-k$ pairs

So: $C_{n+1} = \sum_{k=0}^{n} C_k \cdot C_{n-k}$

This same decomposition explains why $C_n$ counts all the objects above — each can be decomposed at a "root" into two independent substructures.

## Generating Function for Catalan Numbers

Let $C(x) = \sum_{n=0}^{\infty} C_n x^n$. From the recurrence:

$$C(x) = 1 + x \cdot C(x)^2$$

(The factor of $x$ accounts for the shift in index.)

Using the quadratic formula:

$$C(x) = \frac{1 - \sqrt{1 - 4x}}{2x}$$

We take the minus sign to ensure $C(0) = C_0 = 1$.

## Stirling Numbers (Brief Overview)

### Stirling Numbers of the First Kind: $\left[{n \atop k}\right]$ or $s(n,k)$

Count the number of permutations of $n$ elements with exactly $k$ cycles.

$$\left[{n \atop k}\right]: \text{permutations of } n \text{ into } k \text{ cycles}$$

Key properties:
- $\left[{n \atop 1}\right] = (n-1)!$ (all in one cycle)
- $\left[{n \atop n}\right] = 1$ (all fixed points)
- $\sum_{k} \left[{n \atop k}\right] = n!$ (total permutations)

Recurrence:

$$\left[{n \atop k}\right] = (n-1)\left[{n-1 \atop k}\right] + \left[{n-1 \atop k-1}\right]$$

### Stirling Numbers of the Second Kind: $\left\{{n \atop k}\right\}$ or $S(n,k)$

Count the number of ways to partition a set of $n$ elements into exactly $k$ non-empty subsets.

$$\left\{{n \atop k}\right\}: \text{partitions of } n \text{ into } k \text{ non-empty subsets}$$

Key properties:
- $\left\{{n \atop 1}\right\} = 1$ (everything in one group)
- $\left\{{n \atop n}\right\} = 1$ (each element alone)
- $\left\{{n \atop 2}\right\} = 2^{n-1} - 1$

Recurrence:

$$\left\{{n \atop k}\right\} = k\left\{{n-1 \atop k}\right\} + \left\{{n-1 \atop k-1}\right\}$$

The logic: element $n$ either joins one of the existing $k$ groups ($k$ choices) or starts its own new group.

## Bell Numbers (Brief Overview)

The $n$-th Bell number $B_n$ counts the total number of partitions of a set with $n$ elements:

$$B_n = \sum_{k=0}^{n} \left\{{n \atop k}\right\}$$

First values: $B_0 = 1, B_1 = 1, B_2 = 2, B_3 = 5, B_4 = 15, B_5 = 52$

**Bell triangle** (similar to Pascal's triangle) computes them efficiently:

$$B_{n+1} = \sum_{k=0}^{n} \binom{n}{k} B_k$$

This says: to partition $\{1, \ldots, n+1\}$, choose which $k$ of the other $n$ elements are in the same block as element $n+1$.

## Harmonic Numbers (Brief Overview)

The $n$-th harmonic number is:

$$H_n = \sum_{k=1}^{n} \frac{1}{k} = 1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n}$$

Key facts:
- $H_n = \ln n + \gamma + O(1/n)$ where $\gamma \approx 0.5772$ is the Euler-Mascheroni constant
- $H_n = \Theta(\log n)$
- Appears in analysis of algorithms: expected comparisons in quicksort, coupon collector problem

**The Coupon Collector Problem**: Expected draws to collect all $n$ coupons = $n \cdot H_n \approx n \ln n$.

## Code: Compute Catalan Numbers

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Method 1: Using the recurrence
vector<long long> catalanRecurrence(int n) {
    vector<long long> C(n + 1, 0);
    C[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            C[i] += C[j] * C[i - 1 - j];
        }
    }
    return C;
}

// Method 2: Using the binomial formula
long long catalanBinomial(int n) {
    long long result = 1;
    for (int i = 0; i < n; i++) {
        result = result * (2 * n - i) / (i + 1);
    }
    return result / (n + 1);
}

// Compute Bell numbers using Bell triangle
vector<long long> bellNumbers(int n) {
    vector<vector<long long>> triangle(n + 1, vector<long long>(n + 1, 0));
    triangle[0][0] = 1;
    for (int i = 1; i <= n; i++) {
        triangle[i][0] = triangle[i - 1][i - 1];
        for (int j = 1; j <= i; j++) {
            triangle[i][j] = triangle[i][j - 1] + triangle[i - 1][j - 1];
        }
    }
    vector<long long> B(n + 1);
    for (int i = 0; i <= n; i++) B[i] = triangle[i][0];
    return B;
}

int main() {
    int n = 15;

    // Catalan numbers
    cout << "Catalan numbers (recurrence):" << endl;
    vector<long long> catalan = catalanRecurrence(n);
    for (int i = 0; i <= n; i++) {
        cout << "  C(" << i << ") = " << catalan[i] << endl;
    }

    cout << "\nCatalan numbers (binomial formula):" << endl;
    for (int i = 0; i <= n; i++) {
        cout << "  C(" << i << ") = " << catalanBinomial(i) << endl;
    }

    // Bell numbers
    cout << "\nBell numbers:" << endl;
    vector<long long> bell = bellNumbers(10);
    for (int i = 0; i <= 10; i++) {
        cout << "  B(" << i << ") = " << bell[i] << endl;
    }

    return 0;
}
```

```csharp
using System;

class CatalanNumbers
{
    static long[] CatalanRecurrence(int n)
    {
        long[] C = new long[n + 1];
        C[0] = 1;
        for (int i = 1; i <= n; i++)
        {
            for (int j = 0; j < i; j++)
            {
                C[i] += C[j] * C[i - 1 - j];
            }
        }
        return C;
    }

    static long CatalanBinomial(int n)
    {
        long result = 1;
        for (int i = 0; i < n; i++)
        {
            result = result * (2 * n - i) / (i + 1);
        }
        return result / (n + 1);
    }

    static long[] BellNumbers(int n)
    {
        long[,] triangle = new long[n + 1, n + 1];
        triangle[0, 0] = 1;
        for (int i = 1; i <= n; i++)
        {
            triangle[i, 0] = triangle[i - 1, i - 1];
            for (int j = 1; j <= i; j++)
            {
                triangle[i, j] = triangle[i, j - 1] + triangle[i - 1, j - 1];
            }
        }
        long[] B = new long[n + 1];
        for (int i = 0; i <= n; i++) B[i] = triangle[i, 0];
        return B;
    }

    static void Main()
    {
        int n = 15;
        Console.WriteLine("Catalan numbers (recurrence):");
        long[] catalan = CatalanRecurrence(n);
        for (int i = 0; i <= n; i++)
            Console.WriteLine($"  C({i}) = {catalan[i]}");

        Console.WriteLine("\nCatalan numbers (binomial formula):");
        for (int i = 0; i <= n; i++)
            Console.WriteLine($"  C({i}) = {CatalanBinomial(i)}");

        Console.WriteLine("\nBell numbers:");
        long[] bell = BellNumbers(10);
        for (int i = 0; i <= 10; i++)
            Console.WriteLine($"  B({i}) = {bell[i]}");
    }
}
```

```java
public class CatalanNumbers {
    static long[] catalanRecurrence(int n) {
        long[] C = new long[n + 1];
        C[0] = 1;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                C[i] += C[j] * C[i - 1 - j];
            }
        }
        return C;
    }

    static long catalanBinomial(int n) {
        long result = 1;
        for (int i = 0; i < n; i++) {
            result = result * (2 * n - i) / (i + 1);
        }
        return result / (n + 1);
    }

    static long[] bellNumbers(int n) {
        long[][] triangle = new long[n + 1][n + 1];
        triangle[0][0] = 1;
        for (int i = 1; i <= n; i++) {
            triangle[i][0] = triangle[i - 1][i - 1];
            for (int j = 1; j <= i; j++) {
                triangle[i][j] = triangle[i][j - 1] + triangle[i - 1][j - 1];
            }
        }
        long[] B = new long[n + 1];
        for (int i = 0; i <= n; i++) B[i] = triangle[i][0];
        return B;
    }

    public static void main(String[] args) {
        int n = 15;
        System.out.println("Catalan numbers (recurrence):");
        long[] catalan = catalanRecurrence(n);
        for (int i = 0; i <= n; i++) {
            System.out.printf("  C(%d) = %d%n", i, catalan[i]);
        }

        System.out.println("\nCatalan numbers (binomial formula):");
        for (int i = 0; i <= n; i++) {
            System.out.printf("  C(%d) = %d%n", i, catalanBinomial(i));
        }

        System.out.println("\nBell numbers:");
        long[] bell = bellNumbers(10);
        for (int i = 0; i <= 10; i++) {
            System.out.printf("  B(%d) = %d%n", i, bell[i]);
        }
    }
}
```

```python
def catalan_recurrence(n):
    """Compute Catalan numbers using the convolution recurrence."""
    C = [0] * (n + 1)
    C[0] = 1
    for i in range(1, n + 1):
        for j in range(i):
            C[i] += C[j] * C[i - 1 - j]
    return C

def catalan_binomial(n):
    """Compute nth Catalan number using binomial formula."""
    from math import comb
    return comb(2 * n, n) // (n + 1)

def bell_numbers(n):
    """Compute Bell numbers using the Bell triangle."""
    triangle = [[0] * (n + 1) for _ in range(n + 1)]
    triangle[0][0] = 1
    for i in range(1, n + 1):
        triangle[i][0] = triangle[i - 1][i - 1]
        for j in range(1, i + 1):
            triangle[i][j] = triangle[i][j - 1] + triangle[i - 1][j - 1]
    return [triangle[i][0] for i in range(n + 1)]

def harmonic_number(n):
    """Compute nth harmonic number."""
    return sum(1.0 / k for k in range(1, n + 1))

# Catalan numbers
n = 15
print("Catalan numbers (recurrence):")
catalan = catalan_recurrence(n)
for i in range(n + 1):
    print(f"  C({i}) = {catalan[i]}")

print("\nCatalan numbers (binomial formula):")
for i in range(n + 1):
    print(f"  C({i}) = {catalan_binomial(i)}")

# Bell numbers
print("\nBell numbers:")
bell = bell_numbers(10)
for i in range(11):
    print(f"  B({i}) = {bell[i]}")

# Harmonic numbers
print("\nHarmonic numbers:")
for i in [1, 2, 5, 10, 100, 1000]:
    print(f"  H({i}) = {harmonic_number(i):.6f}")
```

```javascript
function catalanRecurrence(n) {
  const C = new Array(n + 1).fill(0);
  C[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      C[i] += C[j] * C[i - 1 - j];
    }
  }
  return C;
}

function catalanBinomial(n) {
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = (result * (2 * n - i)) / (i + 1);
  }
  return Math.round(result / (n + 1));
}

function bellNumbers(n) {
  const triangle = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  triangle[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    triangle[i][0] = triangle[i - 1][i - 1];
    for (let j = 1; j <= i; j++) {
      triangle[i][j] = triangle[i][j - 1] + triangle[i - 1][j - 1];
    }
  }
  return Array.from({ length: n + 1 }, (_, i) => triangle[i][0]);
}

// Catalan numbers
const n = 15;
console.log("Catalan numbers (recurrence):");
const catalan = catalanRecurrence(n);
for (let i = 0; i <= n; i++) {
  console.log(`  C(${i}) = ${catalan[i]}`);
}

console.log("\nCatalan numbers (binomial formula):");
for (let i = 0; i <= n; i++) {
  console.log(`  C(${i}) = ${catalanBinomial(i)}`);
}

// Bell numbers
console.log("\nBell numbers:");
const bell = bellNumbers(10);
for (let i = 0; i <= 10; i++) {
  console.log(`  B(${i}) = ${bell[i]}`);
}
```

## Key Takeaways

- **Catalan numbers** $C_n = \frac{1}{n+1}\binom{2n}{n}$ count an enormous family of structures: valid parentheses, binary trees, triangulations, Dyck paths, and more.
- The **recurrence** $C_{n+1} = \sum C_i C_{n-i}$ reflects splitting a structure into two independent parts — the common thread connecting all Catalan objects.
- **Stirling numbers of the second kind** $\left\{{n \atop k}\right\}$ count set partitions into $k$ blocks; **Bell numbers** $B_n$ sum these over all $k$.
- **Stirling numbers of the first kind** $\left[{n \atop k}\right]$ count permutations by cycle structure.
- **Harmonic numbers** $H_n \approx \ln n$ appear in average-case algorithm analysis (quicksort, coupon collector).
- These sequences are interconnected: Catalan numbers have a beautiful generating function, Stirling numbers bridge permutations and partitions, and harmonic numbers connect discrete sums to continuous logarithms.
