---
title: Inclusion-Exclusion Principle
---

# Inclusion-Exclusion Principle

The **Inclusion-Exclusion Principle** (PIE) is a fundamental counting technique that computes the size of a union of sets by systematically correcting for over-counting. It extends the simple addition rule to handle overlapping sets.

## Motivation: Why Simple Addition Fails

Suppose you want to count students who study math **or** science. If 30 study math and 25 study science, can we say 55 study at least one? **No** — some students study both and would be counted twice.

The inclusion-exclusion principle provides the exact correction.

## Two Sets

For two finite sets $A$ and $B$:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

### Why It Works

When we add $|A|$ and $|B|$, elements in both $A$ and $B$ are counted **twice**. Subtracting $|A \cap B|$ corrects this, counting each element exactly once.

### Venn Diagram Interpretation

Think of two overlapping circles:
- $|A|$ covers the entire left circle
- $|B|$ covers the entire right circle
- $|A \cap B|$ is the overlapping region counted twice
- Subtracting once gives the correct total

### Example

In a class of 40 students: 25 like chocolate, 18 like vanilla, 8 like both.

$$|\text{chocolate} \cup \text{vanilla}| = 25 + 18 - 8 = 35$$

So 35 students like at least one flavor, and $40 - 35 = 5$ like neither.

## Three Sets

For three finite sets $A$, $B$, and $C$:

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

### Why the Triple Intersection Is Added Back

When we subtract all pairwise intersections, elements in all three sets get subtracted too many times:
- Initially counted 3 times (once per set)
- Subtracted 3 times (once per pair)
- Net count: $3 - 3 = 0$ — they vanished!

Adding $|A \cap B \cap C|$ restores them to a count of exactly 1.

### Example

In a survey of 100 people about languages spoken:
- 60 speak English ($E$)
- 45 speak Spanish ($S$)
- 30 speak French ($F$)
- 20 speak English and Spanish
- 15 speak English and French
- 10 speak Spanish and French
- 5 speak all three

$$|E \cup S \cup F| = 60 + 45 + 30 - 20 - 15 - 10 + 5 = 95$$

So 95 people speak at least one language, and 5 speak none of the three.

## General Formula for $n$ Sets

For $n$ finite sets $A_1, A_2, \ldots, A_n$:

$$\left| \bigcup_{i=1}^{n} A_i \right| = \sum_{k=1}^{n} (-1)^{k+1} \sum_{1 \leq i_1 < i_2 < \cdots < i_k \leq n} |A_{i_1} \cap A_{i_2} \cap \cdots \cap A_{i_k}|$$

Equivalently, using the complement (counting elements in **none** of the sets):

$$\left| \overline{A_1} \cap \overline{A_2} \cap \cdots \cap \overline{A_n} \right| = |U| - \sum_{i} |A_i| + \sum_{i<j} |A_i \cap A_j| - \sum_{i<j<k} |A_i \cap A_j \cap A_k| + \cdots + (-1)^n |A_1 \cap \cdots \cap A_n|$$

### Pattern of Signs

- **Add** individual sets ($k=1$)
- **Subtract** pairwise intersections ($k=2$)
- **Add** triple intersections ($k=3$)
- **Subtract** quadruple intersections ($k=4$)
- Continue alternating...

The sign of the $k$-th term is $(-1)^{k+1}$.

### Number of Terms

The general formula involves summing over all non-empty subsets of $\{1, 2, \ldots, n\}$:

$$\text{Total terms} = \binom{n}{1} + \binom{n}{2} + \cdots + \binom{n}{n} = 2^n - 1$$

## Derangements via Inclusion-Exclusion

A **derangement** is a permutation where no element stays in its original position (as we explored in Lesson 29). Inclusion-exclusion gives us the formula directly.

Let $A_i$ be the set of permutations where element $i$ stays fixed. We want to count permutations in **none** of $A_1, A_2, \ldots, A_n$:

$$D_n = n! - \binom{n}{1}(n-1)! + \binom{n}{2}(n-2)! - \cdots + (-1)^n \binom{n}{n} \cdot 0!$$

Since $\binom{n}{k}(n-k)! = \frac{n!}{k!}$:

$$D_n = n! \sum_{k=0}^{n} \frac{(-1)^k}{k!}$$

This converges to $n!/e$ as $n \to \infty$, so the number of derangements is always the nearest integer to $n!/e$.

### First Few Values

| $n$ | $n!$ | $D_n$ | $D_n / n!$ |
|-----|------|--------|------------|
| 1   | 1    | 0      | 0          |
| 2   | 2    | 1      | 0.5        |
| 3   | 6    | 2      | 0.333      |
| 4   | 24   | 9      | 0.375      |
| 5   | 120  | 44     | 0.367      |
| 6   | 720  | 265    | 0.368      |

The ratio rapidly approaches $1/e \approx 0.3679$.

## Euler's Totient via Inclusion-Exclusion

**Euler's totient function** $\phi(n)$ counts integers from 1 to $n$ that are coprime to $n$. If $n = p_1^{a_1} p_2^{a_2} \cdots p_k^{a_k}$, let $A_i$ be the set of integers in $\{1, \ldots, n\}$ divisible by $p_i$.

We want the count of integers divisible by **none** of the prime factors:

$$\phi(n) = n \prod_{p | n} \left(1 - \frac{1}{p}\right)$$

### Derivation

- $|A_i| = n/p_i$
- $|A_i \cap A_j| = n/(p_i p_j)$
- $|A_i \cap A_j \cap A_k| = n/(p_i p_j p_k)$

By inclusion-exclusion:

$$\phi(n) = n - \sum_i \frac{n}{p_i} + \sum_{i<j} \frac{n}{p_i p_j} - \cdots$$

$$= n \left(1 - \sum_i \frac{1}{p_i} + \sum_{i<j} \frac{1}{p_i p_j} - \cdots \right) = n \prod_{i=1}^{k} \left(1 - \frac{1}{p_i}\right)$$

### Example

For $n = 30 = 2 \cdot 3 \cdot 5$:

$$\phi(30) = 30 \left(1 - \frac{1}{2}\right)\left(1 - \frac{1}{3}\right)\left(1 - \frac{1}{5}\right) = 30 \cdot \frac{1}{2} \cdot \frac{2}{3} \cdot \frac{4}{5} = 8$$

The 8 numbers coprime to 30 in $\{1, \ldots, 30\}$ are: 1, 7, 11, 13, 17, 19, 23, 29.

## Counting Surjections

A **surjection** (onto function) from a set of $n$ elements to a set of $k$ elements maps every element of the codomain to at least one element of the domain. The number of surjections is:

$$S(n, k) = \sum_{j=0}^{k} (-1)^j \binom{k}{j} (k-j)^n$$

### Derivation

Let $A_i$ be the set of functions that miss element $i$ in the codomain. A function missing element $i$ maps $n$ elements to the remaining $k-1$ elements: $(k-1)^n$ functions. The number of surjections equals total functions minus those missing at least one element:

$$S(n, k) = k^n - \binom{k}{1}(k-1)^n + \binom{k}{2}(k-2)^n - \cdots + (-1)^{k-1}\binom{k}{k-1} \cdot 1^n$$

### Connection to Stirling Numbers

The **Stirling number of the second kind** $S(n, k)$ counts partitions of $n$ elements into $k$ non-empty subsets. The number of surjections equals $k! \cdot S(n, k)$ because each partition can be assigned to $k$ labeled targets in $k!$ ways.

### Example

Surjections from $\{1,2,3,4\}$ to $\{a,b,c\}$:

$$S(4,3) = \binom{3}{0}3^4 - \binom{3}{1}2^4 + \binom{3}{2}1^4 - \binom{3}{3}0^4$$
$$= 81 - 48 + 3 - 0 = 36$$

## Code: Counting with Inclusion-Exclusion

Let's count integers from 1 to $N$ that are **not** divisible by 2, 3, or 5 using inclusion-exclusion.

```cpp
#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

// Count integers in [1, N] not divisible by any prime in the list
long long countCoprime(long long N, vector<int>& primes) {
    int n = primes.size();
    long long total = N;

    // Iterate over all non-empty subsets using bitmask
    for (int mask = 1; mask < (1 << n); mask++) {
        long long product = 1;
        int bits = 0;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                product *= primes[i];
                bits++;
            }
        }
        long long count = N / product;
        if (bits % 2 == 1) {
            total -= count;  // Subtract odd-sized intersections
        } else {
            total += count;  // Add even-sized intersections
        }
    }
    return total;
}

int main() {
    vector<int> primes = {2, 3, 5};
    long long N = 100;

    long long result = countCoprime(N, primes);
    cout << "Integers in [1, " << N << "] not divisible by 2, 3, or 5: "
         << result << endl;

    // Verify using Euler's totient approach
    double ratio = 1.0;
    for (int p : primes) ratio *= (1.0 - 1.0 / p);
    cout << "Expected (Euler's product): " << (long long)(N * ratio) << endl;

    // Brute force verification
    int bruteForce = 0;
    for (int i = 1; i <= N; i++) {
        if (i % 2 != 0 && i % 3 != 0 && i % 5 != 0) bruteForce++;
    }
    cout << "Brute force verification: " << bruteForce << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class InclusionExclusion
{
    static long CountCoprime(long N, int[] primes)
    {
        int n = primes.Length;
        long total = N;

        for (int mask = 1; mask < (1 << n); mask++)
        {
            long product = 1;
            int bits = 0;
            for (int i = 0; i < n; i++)
            {
                if ((mask & (1 << i)) != 0)
                {
                    product *= primes[i];
                    bits++;
                }
            }
            long count = N / product;
            if (bits % 2 == 1)
                total -= count;
            else
                total += count;
        }
        return total;
    }

    static int EulerTotient(int n)
    {
        int result = n;
        int temp = n;
        for (int p = 2; p * p <= temp; p++)
        {
            if (temp % p == 0)
            {
                while (temp % p == 0) temp /= p;
                result -= result / p;
            }
        }
        if (temp > 1) result -= result / temp;
        return result;
    }

    static void Main()
    {
        int[] primes = { 2, 3, 5 };
        long N = 100;

        long result = CountCoprime(N, primes);
        Console.WriteLine($"Integers in [1, {N}] not divisible by 2, 3, or 5: {result}");

        // Verify with brute force
        int bruteForce = 0;
        for (int i = 1; i <= N; i++)
        {
            if (i % 2 != 0 && i % 3 != 0 && i % 5 != 0) bruteForce++;
        }
        Console.WriteLine($"Brute force verification: {bruteForce}");

        // Euler's totient for 30
        Console.WriteLine($"phi(30) = {EulerTotient(30)}");
    }
}
```

```java
public class InclusionExclusion {
    static long countCoprime(long N, int[] primes) {
        int n = primes.length;
        long total = N;

        for (int mask = 1; mask < (1 << n); mask++) {
            long product = 1;
            int bits = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    product *= primes[i];
                    bits++;
                }
            }
            long count = N / product;
            if (bits % 2 == 1)
                total -= count;
            else
                total += count;
        }
        return total;
    }

    static long countSurjections(int n, int k) {
        long result = 0;
        for (int j = 0; j <= k; j++) {
            long term = binomial(k, j) * (long) Math.pow(k - j, n);
            result += (j % 2 == 0) ? term : -term;
        }
        return result;
    }

    static long binomial(int n, int k) {
        if (k > n - k) k = n - k;
        long result = 1;
        for (int i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] primes = {2, 3, 5};
        long N = 100;

        long result = countCoprime(N, primes);
        System.out.println("Integers in [1, " + N + "] not divisible by 2, 3, or 5: " + result);

        // Count surjections from {1..4} to {1..3}
        long surj = countSurjections(4, 3);
        System.out.println("Surjections from 4 elements to 3 elements: " + surj);

        // Brute force verification
        int bruteForce = 0;
        for (int i = 1; i <= N; i++) {
            if (i % 2 != 0 && i % 3 != 0 && i % 5 != 0) bruteForce++;
        }
        System.out.println("Brute force verification: " + bruteForce);
    }
}
```

```python
from math import comb, factorial, e
from itertools import combinations
from functools import reduce

def count_coprime(N, primes):
    """Count integers in [1, N] not divisible by any prime in the list."""
    n = len(primes)
    total = N

    for size in range(1, n + 1):
        for subset in combinations(primes, size):
            product = reduce(lambda a, b: a * b, subset)
            count = N // product
            if size % 2 == 1:
                total -= count  # Subtract odd-sized intersections
            else:
                total += count  # Add even-sized intersections
    return total

def derangements(n):
    """Count derangements using inclusion-exclusion."""
    return round(factorial(n) * sum((-1)**k / factorial(k) for k in range(n + 1)))

def count_surjections(n, k):
    """Count surjections from n-element set to k-element set."""
    return sum((-1)**j * comb(k, j) * (k - j)**n for j in range(k + 1))

def euler_totient(n):
    """Compute Euler's totient using inclusion-exclusion."""
    result = n
    temp = n
    p = 2
    while p * p <= temp:
        if temp % p == 0:
            while temp % p == 0:
                temp //= p
            result -= result // p
        p += 1
    if temp > 1:
        result -= result // temp
    return result

# Count coprime to 30 in [1, 100]
N = 100
primes = [2, 3, 5]
result = count_coprime(N, primes)
print(f"Integers in [1, {N}] not divisible by 2, 3, or 5: {result}")

# Brute force verification
brute_force = sum(1 for i in range(1, N + 1) if i % 2 != 0 and i % 3 != 0 and i % 5 != 0)
print(f"Brute force verification: {brute_force}")

# Derangements
print(f"\nDerangements D(5) = {derangements(5)}")
print(f"Surjections from 4 to 3: {count_surjections(4, 3)}")
print(f"phi(30) = {euler_totient(30)}")
```

```javascript
function countCoprime(N, primes) {
  const n = primes.length;
  let total = N;

  for (let mask = 1; mask < (1 << n); mask++) {
    let product = 1;
    let bits = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        product *= primes[i];
        bits++;
      }
    }
    const count = Math.floor(N / product);
    if (bits % 2 === 1) {
      total -= count;
    } else {
      total += count;
    }
  }
  return total;
}

function derangements(n) {
  let factorial = 1;
  for (let i = 2; i <= n; i++) factorial *= i;
  let sum = 0;
  let kFact = 1;
  for (let k = 0; k <= n; k++) {
    if (k > 0) kFact *= k;
    sum += (k % 2 === 0 ? 1 : -1) / kFact;
  }
  return Math.round(factorial * sum);
}

function countSurjections(n, k) {
  let result = 0;
  for (let j = 0; j <= k; j++) {
    const sign = j % 2 === 0 ? 1 : -1;
    const binom = binomial(k, j);
    result += sign * binom * Math.pow(k - j, n);
  }
  return result;
}

function binomial(n, k) {
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// Count coprime
const N = 100;
const primes = [2, 3, 5];
const result = countCoprime(N, primes);
console.log(`Integers in [1, ${N}] not divisible by 2, 3, or 5: ${result}`);

// Brute force verification
let bruteForce = 0;
for (let i = 1; i <= N; i++) {
  if (i % 2 !== 0 && i % 3 !== 0 && i % 5 !== 0) bruteForce++;
}
console.log(`Brute force verification: ${bruteForce}`);

// Derangements and surjections
console.log(`\nDerangements D(5) = ${derangements(5)}`);
console.log(`Surjections from 4 to 3: ${countSurjections(4, 3)}`);
```

## Computational Complexity

The inclusion-exclusion formula for $n$ sets requires summing over all $2^n - 1$ non-empty subsets. This is **exponential** in $n$, which limits direct computation for large $n$.

However, in many applications:
- The number of "primes" or "conditions" is small (e.g., prime factorization of $n$ has $O(\log n)$ factors)
- Symmetry reduces the number of distinct terms
- Möbius inversion on lattices generalizes inclusion-exclusion efficiently

## Common Pitfalls

1. **Forgetting alternating signs**: The pattern is $+, -, +, -, \ldots$ starting with addition for single sets.
2. **Miscounting intersections**: $|A \cap B|$ is elements in **both** $A$ and $B$, not just one.
3. **Over-counting the universal set**: When using the complement form, don't forget to start with $|U|$.
4. **Assuming independence**: $|A \cap B| \neq |A| \cdot |B| / |U|$ in general; compute intersections directly.

## Key Takeaways

- **Two sets**: $|A \cup B| = |A| + |B| - |A \cap B|$ corrects for double-counting of the overlap.
- **Three sets**: add back the triple intersection after subtracting all pairwise intersections.
- **General formula**: alternate signs across all subset intersections; the $k$-th level has sign $(-1)^{k+1}$.
- **Derangements**: inclusion-exclusion yields $D_n = n! \sum_{k=0}^n (-1)^k / k!$, connecting to $n!/e$.
- **Euler's totient**: $\phi(n) = n \prod_{p|n}(1 - 1/p)$ is a direct application of inclusion-exclusion over prime divisors.
- **Surjection counting**: the formula $\sum_{j=0}^k (-1)^j \binom{k}{j}(k-j)^n$ counts onto functions.
- **Bitmask enumeration** efficiently implements inclusion-exclusion when the number of sets is small.
- The principle is computationally **exponential** in the number of sets but often practical due to structure in the problem.
