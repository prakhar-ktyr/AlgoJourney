---
title: Solving Recurrences
---

# Solving Recurrences

Recurrence relations appear everywhere in algorithm analysis. When we write a recursive algorithm, its running time is naturally described by a recurrence. In this lesson, we'll learn systematic techniques to solve these recurrences and obtain closed-form expressions or asymptotic bounds.

## Why Solve Recurrences?

When analyzing divide-and-conquer algorithms, we often get expressions like:

$$T(n) = 2T(n/2) + n$$

This tells us the problem splits into 2 subproblems of half the size, with $O(n)$ work to combine. But what is $T(n)$ as a function of $n$ alone? That's what solving the recurrence gives us.

## The Substitution (Iteration) Method

The most intuitive approach is to repeatedly substitute the recurrence into itself until a pattern emerges.

### Basic Idea

Given $T(n) = aT(n/b) + f(n)$, we expand:

$$T(n) = aT(n/b) + f(n)$$
$$= a[aT(n/b^2) + f(n/b)] + f(n)$$
$$= a^2 T(n/b^2) + a \cdot f(n/b) + f(n)$$
$$= a^3 T(n/b^3) + a^2 f(n/b^2) + a \cdot f(n/b) + f(n)$$

After $k$ steps:

$$T(n) = a^k T(n/b^k) + \sum_{i=0}^{k-1} a^i f(n/b^i)$$

The recursion bottoms out when $n/b^k = 1$, i.e., $k = \log_b n$.

### Example 1: Merge Sort

$$T(n) = 2T(n/2) + n, \quad T(1) = 1$$

Iterating:

$$T(n) = 2T(n/2) + n$$
$$= 2[2T(n/4) + n/2] + n = 4T(n/4) + n + n$$
$$= 4[2T(n/8) + n/4] + 2n = 8T(n/8) + n + n + n$$

After $k$ steps: $T(n) = 2^k T(n/2^k) + kn$

Setting $k = \log_2 n$:

$$T(n) = n \cdot T(1) + n \log_2 n = n + n \log n = O(n \log n)$$

### Example 2: Binary Search

$$T(n) = T(n/2) + 1, \quad T(1) = 1$$

Iterating:

$$T(n) = T(n/2) + 1$$
$$= T(n/4) + 1 + 1$$
$$= T(n/8) + 1 + 1 + 1$$

After $k$ steps: $T(n) = T(n/2^k) + k$

Setting $k = \log_2 n$:

$$T(n) = T(1) + \log_2 n = 1 + \log n = O(\log n)$$

### Example 3: A Non-Trivial Recurrence

$$T(n) = 3T(n/4) + n^2$$

After $k$ steps:

$$T(n) = 3^k T(n/4^k) + \sum_{i=0}^{k-1} 3^i (n/4^i)^2$$

$$= 3^k T(n/4^k) + n^2 \sum_{i=0}^{k-1} \left(\frac{3}{16}\right)^i$$

The geometric series converges (ratio $< 1$), so $T(n) = O(n^2)$.

## The Master Theorem

The Master Theorem provides a "cookbook" solution for recurrences of the form:

$$T(n) = aT(n/b) + f(n)$$

where $a \geq 1$, $b > 1$, and $f(n)$ is asymptotically positive.

### The Critical Exponent

The key quantity is $c_{\text{crit}} = \log_b a$. This represents the exponent in the number of leaves in the recursion tree: there are $a^{\log_b n} = n^{\log_b a}$ leaves.

### The Three Cases

**Case 1: Work dominated by leaves**

If $f(n) = O(n^c)$ where $c < \log_b a$, then:

$$T(n) = \Theta(n^{\log_b a})$$

The recursive calls dominate. The tree is "leaf-heavy."

**Case 2: Work evenly distributed**

If $f(n) = \Theta(n^{\log_b a} \cdot \log^k n)$ for some $k \geq 0$, then:

$$T(n) = \Theta(n^{\log_b a} \cdot \log^{k+1} n)$$

Each level contributes roughly the same amount.

**Case 3: Work dominated by root**

If $f(n) = \Omega(n^c)$ where $c > \log_b a$, and $af(n/b) \leq \delta f(n)$ for some $\delta < 1$ (regularity condition), then:

$$T(n) = \Theta(f(n))$$

The work at the top level dominates.

### Applying the Master Theorem

| Recurrence | $a$ | $b$ | $f(n)$ | $\log_b a$ | Case | Result |
|---|---|---|---|---|---|---|
| $T(n) = 2T(n/2) + n$ | 2 | 2 | $n$ | 1 | 2 ($k=0$) | $\Theta(n \log n)$ |
| $T(n) = 4T(n/2) + n$ | 4 | 2 | $n$ | 2 | 1 | $\Theta(n^2)$ |
| $T(n) = 2T(n/2) + n^2$ | 2 | 2 | $n^2$ | 1 | 3 | $\Theta(n^2)$ |
| $T(n) = 7T(n/2) + n^2$ | 7 | 2 | $n^2$ | 2.807 | 1 | $\Theta(n^{2.807})$ |
| $T(n) = T(n/2) + 1$ | 1 | 2 | $1$ | 0 | 2 ($k=0$) | $\Theta(\log n)$ |

### Detailed Case Examples

**Case 1 Example**: $T(n) = 8T(n/2) + n^2$

- $a = 8$, $b = 2$, $\log_b a = \log_2 8 = 3$
- $f(n) = n^2 = O(n^c)$ with $c = 2 < 3$
- Case 1 applies: $T(n) = \Theta(n^3)$

**Case 2 Example**: $T(n) = 2T(n/2) + n$

- $a = 2$, $b = 2$, $\log_b a = 1$
- $f(n) = n = \Theta(n^1 \log^0 n)$, so $k = 0$
- Case 2 applies: $T(n) = \Theta(n \log n)$

**Case 3 Example**: $T(n) = 2T(n/2) + n^2$

- $a = 2$, $b = 2$, $\log_b a = 1$
- $f(n) = n^2 = \Omega(n^c)$ with $c = 2 > 1$
- Regularity: $2(n/2)^2 = n^2/2 \leq \delta \cdot n^2$ with $\delta = 1/2$
- Case 3 applies: $T(n) = \Theta(n^2)$

## Recursion Trees

A recursion tree visualizes how work is distributed across levels of recursion.

### Building a Recursion Tree

For $T(n) = 2T(n/2) + n$:

```
Level 0:          n                    work = n
                /   \
Level 1:      n/2    n/2              work = n
             / \    / \
Level 2:   n/4 n/4 n/4 n/4           work = n
            ...
Level k:   1 1 1 ... 1 (n leaves)    work = n
```

- Total levels: $\log_2 n + 1$
- Work per level: $n$
- Total: $n \cdot (\log_2 n + 1) = \Theta(n \log n)$

### Another Example: $T(n) = 3T(n/4) + cn^2$

```
Level 0:          cn^2                         work = cn^2
              /    |    \
Level 1:   c(n/4)^2  c(n/4)^2  c(n/4)^2      work = 3c(n/4)^2 = (3/16)cn^2
           /|\       /|\       /|\
Level 2:  ...                                  work = (3/16)^2 cn^2
```

- Work at level $i$: $(3/16)^i \cdot cn^2$
- Total work: $cn^2 \sum_{i=0}^{\log_4 n} (3/16)^i < cn^2 \cdot \frac{1}{1 - 3/16} = \frac{16}{13} cn^2 = O(n^2)$

The geometric series converges because $3/16 < 1$, confirming Case 3 of the Master Theorem.

## Common Algorithm Recurrences

| Algorithm | Recurrence | Solution |
|---|---|---|
| Binary Search | $T(n) = T(n/2) + O(1)$ | $O(\log n)$ |
| Merge Sort | $T(n) = 2T(n/2) + O(n)$ | $O(n \log n)$ |
| Strassen's Matrix Mult. | $T(n) = 7T(n/2) + O(n^2)$ | $O(n^{2.807})$ |
| Karatsuba Multiplication | $T(n) = 3T(n/2) + O(n)$ | $O(n^{1.585})$ |
| Closest Pair | $T(n) = 2T(n/2) + O(n)$ | $O(n \log n)$ |
| Quickselect (avg) | $T(n) = T(n/2) + O(n)$ | $O(n)$ |

## When the Master Theorem Doesn't Apply

The Master Theorem has gaps. It doesn't apply when:

1. $f(n)$ falls between cases (e.g., $f(n) = n \log n$ with $\log_b a = 1$ but $k$ doesn't fit)
2. The subproblems aren't equal size: $T(n) = T(n/3) + T(2n/3) + n$
3. The recurrence isn't of the standard form

For these, use the Akra-Bazzi method or direct iteration.

## Code: Verify Master Theorem Cases

```cpp
#include <iostream>
#include <cmath>
#include <vector>
using namespace std;

// Compute T(n) by direct recursion
long long solveRecurrence(int n, int a, int b, int fnExponent) {
    if (n <= 1) return 1;
    long long subproblemWork = 0;
    for (int i = 0; i < a; i++) {
        subproblemWork += solveRecurrence(n / b, a, b, fnExponent);
    }
    long long combineWork = (long long)pow(n, fnExponent);
    return subproblemWork + combineWork;
}

int main() {
    // Case 1: T(n) = 8T(n/2) + n^2, expect Theta(n^3)
    cout << "Case 1: T(n) = 8T(n/2) + n^2" << endl;
    for (int n = 8; n <= 512; n *= 2) {
        long long tn = solveRecurrence(n, 8, 2, 2);
        double ratio = (double)tn / (n * n * n);
        cout << "  n=" << n << " T(n)=" << tn
             << " T(n)/n^3=" << ratio << endl;
    }

    // Case 2: T(n) = 2T(n/2) + n, expect Theta(n log n)
    cout << "\nCase 2: T(n) = 2T(n/2) + n" << endl;
    for (int n = 8; n <= 1024; n *= 2) {
        long long tn = solveRecurrence(n, 2, 2, 1);
        double ratio = (double)tn / (n * log2(n));
        cout << "  n=" << n << " T(n)=" << tn
             << " T(n)/(n*logn)=" << ratio << endl;
    }

    // Case 3: T(n) = 2T(n/2) + n^2, expect Theta(n^2)
    cout << "\nCase 3: T(n) = 2T(n/2) + n^2" << endl;
    for (int n = 8; n <= 1024; n *= 2) {
        long long tn = solveRecurrence(n, 2, 2, 2);
        double ratio = (double)tn / ((long long)n * n);
        cout << "  n=" << n << " T(n)=" << tn
             << " T(n)/n^2=" << ratio << endl;
    }
    return 0;
}
```

```csharp
using System;

class SolvingRecurrences
{
    static long SolveRecurrence(int n, int a, int b, int fnExponent)
    {
        if (n <= 1) return 1;
        long subproblemWork = 0;
        for (int i = 0; i < a; i++)
        {
            subproblemWork += SolveRecurrence(n / b, a, b, fnExponent);
        }
        long combineWork = (long)Math.Pow(n, fnExponent);
        return subproblemWork + combineWork;
    }

    static void Main()
    {
        // Case 1: T(n) = 8T(n/2) + n^2, expect Theta(n^3)
        Console.WriteLine("Case 1: T(n) = 8T(n/2) + n^2");
        for (int n = 8; n <= 512; n *= 2)
        {
            long tn = SolveRecurrence(n, 8, 2, 2);
            double ratio = (double)tn / ((long)n * n * n);
            Console.WriteLine($"  n={n} T(n)={tn} T(n)/n^3={ratio:F4}");
        }

        // Case 2: T(n) = 2T(n/2) + n, expect Theta(n log n)
        Console.WriteLine("\nCase 2: T(n) = 2T(n/2) + n");
        for (int n = 8; n <= 1024; n *= 2)
        {
            long tn = SolveRecurrence(n, 2, 2, 1);
            double ratio = (double)tn / (n * Math.Log2(n));
            Console.WriteLine($"  n={n} T(n)={tn} T(n)/(n*logn)={ratio:F4}");
        }

        // Case 3: T(n) = 2T(n/2) + n^2, expect Theta(n^2)
        Console.WriteLine("\nCase 3: T(n) = 2T(n/2) + n^2");
        for (int n = 8; n <= 1024; n *= 2)
        {
            long tn = SolveRecurrence(n, 2, 2, 2);
            double ratio = (double)tn / ((long)n * n);
            Console.WriteLine($"  n={n} T(n)={tn} T(n)/n^2={ratio:F4}");
        }
    }
}
```

```java
public class SolvingRecurrences {
    static long solveRecurrence(int n, int a, int b, int fnExponent) {
        if (n <= 1) return 1;
        long subproblemWork = 0;
        for (int i = 0; i < a; i++) {
            subproblemWork += solveRecurrence(n / b, a, b, fnExponent);
        }
        long combineWork = (long) Math.pow(n, fnExponent);
        return subproblemWork + combineWork;
    }

    public static void main(String[] args) {
        // Case 1: T(n) = 8T(n/2) + n^2, expect Theta(n^3)
        System.out.println("Case 1: T(n) = 8T(n/2) + n^2");
        for (int n = 8; n <= 512; n *= 2) {
            long tn = solveRecurrence(n, 8, 2, 2);
            double ratio = (double) tn / ((long) n * n * n);
            System.out.printf("  n=%d T(n)=%d T(n)/n^3=%.4f%n", n, tn, ratio);
        }

        // Case 2: T(n) = 2T(n/2) + n, expect Theta(n log n)
        System.out.println("\nCase 2: T(n) = 2T(n/2) + n");
        for (int n = 8; n <= 1024; n *= 2) {
            long tn = solveRecurrence(n, 2, 2, 1);
            double ratio = (double) tn / (n * (Math.log(n) / Math.log(2)));
            System.out.printf("  n=%d T(n)=%d T(n)/(n*logn)=%.4f%n", n, tn, ratio);
        }

        // Case 3: T(n) = 2T(n/2) + n^2, expect Theta(n^2)
        System.out.println("\nCase 3: T(n) = 2T(n/2) + n^2");
        for (int n = 8; n <= 1024; n *= 2) {
            long tn = solveRecurrence(n, 2, 2, 2);
            double ratio = (double) tn / ((long) n * n);
            System.out.printf("  n=%d T(n)=%d T(n)/n^2=%.4f%n", n, tn, ratio);
        }
    }
}
```

```python
import math

def solve_recurrence(n, a, b, fn_exponent):
    """Compute T(n) by direct recursion."""
    if n <= 1:
        return 1
    subproblem_work = sum(
        solve_recurrence(n // b, a, b, fn_exponent) for _ in range(a)
    )
    combine_work = n ** fn_exponent
    return subproblem_work + combine_work

def verify_master_theorem():
    # Case 1: T(n) = 8T(n/2) + n^2, expect Theta(n^3)
    print("Case 1: T(n) = 8T(n/2) + n^2")
    n = 8
    while n <= 512:
        tn = solve_recurrence(n, 8, 2, 2)
        ratio = tn / (n ** 3)
        print(f"  n={n} T(n)={tn} T(n)/n^3={ratio:.4f}")
        n *= 2

    # Case 2: T(n) = 2T(n/2) + n, expect Theta(n log n)
    print("\nCase 2: T(n) = 2T(n/2) + n")
    n = 8
    while n <= 1024:
        tn = solve_recurrence(n, 2, 2, 1)
        ratio = tn / (n * math.log2(n))
        print(f"  n={n} T(n)={tn} T(n)/(n*logn)={ratio:.4f}")
        n *= 2

    # Case 3: T(n) = 2T(n/2) + n^2, expect Theta(n^2)
    print("\nCase 3: T(n) = 2T(n/2) + n^2")
    n = 8
    while n <= 1024:
        tn = solve_recurrence(n, 2, 2, 2)
        ratio = tn / (n ** 2)
        print(f"  n={n} T(n)={tn} T(n)/n^2={ratio:.4f}")
        n *= 2

verify_master_theorem()
```

```javascript
function solveRecurrence(n, a, b, fnExponent) {
  if (n <= 1) return 1;
  let subproblemWork = 0;
  for (let i = 0; i < a; i++) {
    subproblemWork += solveRecurrence(Math.floor(n / b), a, b, fnExponent);
  }
  const combineWork = Math.pow(n, fnExponent);
  return subproblemWork + combineWork;
}

function verifyMasterTheorem() {
  // Case 1: T(n) = 8T(n/2) + n^2, expect Theta(n^3)
  console.log("Case 1: T(n) = 8T(n/2) + n^2");
  for (let n = 8; n <= 512; n *= 2) {
    const tn = solveRecurrence(n, 8, 2, 2);
    const ratio = tn / (n * n * n);
    console.log(`  n=${n} T(n)=${tn} T(n)/n^3=${ratio.toFixed(4)}`);
  }

  // Case 2: T(n) = 2T(n/2) + n, expect Theta(n log n)
  console.log("\nCase 2: T(n) = 2T(n/2) + n");
  for (let n = 8; n <= 1024; n *= 2) {
    const tn = solveRecurrence(n, 2, 2, 1);
    const ratio = tn / (n * Math.log2(n));
    console.log(`  n=${n} T(n)=${tn} T(n)/(n*logn)=${ratio.toFixed(4)}`);
  }

  // Case 3: T(n) = 2T(n/2) + n^2, expect Theta(n^2)
  console.log("\nCase 3: T(n) = 2T(n/2) + n^2");
  for (let n = 8; n <= 1024; n *= 2) {
    const tn = solveRecurrence(n, 2, 2, 2);
    const ratio = tn / (n * n);
    console.log(`  n=${n} T(n)=${tn} T(n)/n^2=${ratio.toFixed(4)}`);
  }
}

verifyMasterTheorem();
```

## Practice Problems

1. Solve $T(n) = 4T(n/2) + n^2$ using iteration and verify with the Master Theorem.
2. Draw the recursion tree for $T(n) = 3T(n/3) + n$ and determine the total work.
3. Use the Master Theorem on $T(n) = 9T(n/3) + n^3$.
4. Find $T(n)$ for the recurrence $T(n) = T(n/2) + n$ (Case 3).

## Key Takeaways

- **Substitution/iteration** expands the recurrence step by step until a pattern emerges — most intuitive but can be tedious.
- **The Master Theorem** gives immediate answers for $T(n) = aT(n/b) + f(n)$ by comparing $f(n)$ to $n^{\log_b a}$.
- **Case 1**: leaves dominate ($f$ grows slower) → $\Theta(n^{\log_b a})$.
- **Case 2**: balanced → $\Theta(n^{\log_b a} \log^{k+1} n)$.
- **Case 3**: root dominates ($f$ grows faster) → $\Theta(f(n))$.
- **Recursion trees** provide visual intuition about how work distributes across levels.
- Most classic algorithms (merge sort, binary search, Strassen's) are directly analyzable with these tools.
