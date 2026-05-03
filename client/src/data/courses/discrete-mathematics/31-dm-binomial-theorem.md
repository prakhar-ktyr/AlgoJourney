---
title: Binomial Theorem & Pascal's Triangle
---

# Binomial Theorem & Pascal's Triangle

Pascal's triangle and the binomial theorem are two of the most elegant structures in combinatorics. They connect combinations, algebra, and number theory in a beautiful way. In this lesson we'll build Pascal's triangle from scratch, derive the binomial theorem, and explore powerful identities.

---

## Pascal's Triangle

### The Recursive Definition

Pascal's triangle is built using Pascal's Rule:

$$\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$$

Each entry is the sum of the two entries directly above it. The triangle begins:

```
Row 0:                 1
Row 1:               1   1
Row 2:             1   2   1
Row 3:           1   3   3   1
Row 4:         1   4   6   4   1
Row 5:       1   5  10  10   5   1
Row 6:     1   6  15  20  15   6   1
```

### Reading Combinations from Pascal's Triangle

The entry in row $n$, position $r$ (both 0-indexed) is $\binom{n}{r}$.

- Row 4, position 2: $\binom{4}{2} = 6$
- Row 6, position 3: $\binom{6}{3} = 20$

### Properties Visible in the Triangle

1. **Symmetry:** Each row is a palindrome — $\binom{n}{r} = \binom{n}{n-r}$.
2. **Row sum:** Each row sums to $2^n$ — e.g., row 4: $1+4+6+4+1 = 16 = 2^4$.
3. **Diagonal patterns:** The first diagonal is all 1s, the second is natural numbers $(1, 2, 3, \ldots)$, the third is triangular numbers $(1, 3, 6, 10, \ldots)$.
4. **Hockey stick identity:** The sum along a diagonal equals the entry below and to the right:

$$\sum_{i=0}^{r} \binom{i+k}{k} = \binom{r+k+1}{k+1}$$

---

## The Binomial Theorem

### Statement

For any non-negative integer $n$:

$$\boxed{(a+b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k}$$

The coefficients $\binom{n}{k}$ are exactly the entries of row $n$ in Pascal's triangle.

### Expanding Small Powers

$$(a+b)^0 = 1$$

$$(a+b)^1 = a + b$$

$$(a+b)^2 = a^2 + 2ab + b^2$$

$$(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$$

$$(a+b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4$$

Notice how the coefficients match Pascal's triangle rows!

### Finding Specific Terms

The $(k+1)$-th term (0-indexed as term $k$) of $(a+b)^n$ is:

$$T_{k+1} = \binom{n}{k} a^{n-k} b^k$$

**Example:** Find the 4th term of $(2x + 3)^7$.

The 4th term corresponds to $k = 3$:

$$T_4 = \binom{7}{3} (2x)^{7-3} (3)^3 = 35 \cdot 16x^4 \cdot 27 = 15120x^4$$

### Finding a Specific Coefficient

**Example:** What is the coefficient of $x^5$ in $(x + 2)^8$?

We need the term where $x^{8-k} \cdot 2^k$ gives $x^5$, so $8-k = 5$, thus $k = 3$:

$$\binom{8}{3} \cdot 1^5 \cdot 2^3 = 56 \cdot 8 = 448$$

---

## Special Cases of the Binomial Theorem

### Setting $a = 1, b = 1$

$$(1+1)^n = \sum_{k=0}^{n} \binom{n}{k} = 2^n$$

This proves the row sum property of Pascal's triangle.

### Setting $a = 1, b = -1$

$$(1-1)^n = \sum_{k=0}^{n} \binom{n}{k} (-1)^k = 0$$

This means the alternating sum of a row is zero:

$$\binom{n}{0} - \binom{n}{1} + \binom{n}{2} - \binom{n}{3} + \cdots = 0$$

### Setting $a = 1, b = x$

$$(1+x)^n = \sum_{k=0}^{n} \binom{n}{k} x^k$$

This is the standard generating function form.

---

## Vandermonde's Identity

One of the most important combinatorial identities:

$$\boxed{\binom{m+n}{r} = \sum_{k=0}^{r} \binom{m}{k}\binom{n}{r-k}}$$

### Combinatorial Proof

Imagine choosing $r$ items from two groups: one with $m$ items and one with $n$ items. For each split — $k$ items from the first group and $r-k$ from the second — we get $\binom{m}{k}\binom{n}{r-k}$ ways. Summing over all valid $k$ gives the total: $\binom{m+n}{r}$.

### Example

Verify with $m=3, n=4, r=3$:

$$\binom{7}{3} = \binom{3}{0}\binom{4}{3} + \binom{3}{1}\binom{4}{2} + \binom{3}{2}\binom{4}{1} + \binom{3}{3}\binom{4}{0}$$

$$35 = 1 \cdot 4 + 3 \cdot 6 + 3 \cdot 4 + 1 \cdot 1 = 4 + 18 + 12 + 1 = 35 \checkmark$$

---

## The Multinomial Theorem

The binomial theorem generalizes to multiple terms. For $(x_1 + x_2 + \cdots + x_m)^n$:

$$\boxed{(x_1 + x_2 + \cdots + x_m)^n = \sum_{\substack{k_1+k_2+\cdots+k_m=n \\ k_i \geq 0}} \binom{n}{k_1, k_2, \ldots, k_m} x_1^{k_1} x_2^{k_2} \cdots x_m^{k_m}}$$

where the **multinomial coefficient** is:

$$\binom{n}{k_1, k_2, \ldots, k_m} = \frac{n!}{k_1! \cdot k_2! \cdots k_m!}$$

**Example:** The coefficient of $x^2 y^1 z^1$ in $(x+y+z)^4$ is:

$$\binom{4}{2, 1, 1} = \frac{4!}{2! \cdot 1! \cdot 1!} = 12$$

The total number of terms in the expansion of $(x_1 + \cdots + x_m)^n$ is $\binom{n+m-1}{m-1}$.

---

## Generating Pascal's Triangle — Code

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<vector<long long>> generatePascal(int numRows) {
    vector<vector<long long>> triangle;
    for (int i = 0; i < numRows; i++) {
        vector<long long> row(i + 1, 1);
        for (int j = 1; j < i; j++) {
            row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
        }
        triangle.push_back(row);
    }
    return triangle;
}

int main() {
    int n = 8;
    auto triangle = generatePascal(n);
    for (int i = 0; i < n; i++) {
        // Print leading spaces for alignment
        for (int s = 0; s < n - i - 1; s++) cout << "  ";
        for (int j = 0; j <= i; j++) {
            cout << triangle[i][j] << "   ";
        }
        cout << endl;
    }
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class PascalTriangle {
    static List<List<long>> GeneratePascal(int numRows) {
        var triangle = new List<List<long>>();
        for (int i = 0; i < numRows; i++) {
            var row = new List<long>();
            for (int j = 0; j <= i; j++) {
                if (j == 0 || j == i) {
                    row.Add(1);
                } else {
                    row.Add(triangle[i - 1][j - 1] + triangle[i - 1][j]);
                }
            }
            triangle.Add(row);
        }
        return triangle;
    }

    static void Main() {
        int n = 8;
        var triangle = GeneratePascal(n);
        for (int i = 0; i < n; i++) {
            Console.Write(new string(' ', (n - i - 1) * 2));
            foreach (long val in triangle[i]) {
                Console.Write($"{val,4}");
            }
            Console.WriteLine();
        }
    }
}
```

```java
import java.util.*;

public class PascalTriangle {
    static List<List<Long>> generatePascal(int numRows) {
        List<List<Long>> triangle = new ArrayList<>();
        for (int i = 0; i < numRows; i++) {
            List<Long> row = new ArrayList<>();
            for (int j = 0; j <= i; j++) {
                if (j == 0 || j == i) {
                    row.add(1L);
                } else {
                    row.add(triangle.get(i - 1).get(j - 1)
                          + triangle.get(i - 1).get(j));
                }
            }
            triangle.add(row);
        }
        return triangle;
    }

    public static void main(String[] args) {
        int n = 8;
        List<List<Long>> triangle = generatePascal(n);
        for (int i = 0; i < n; i++) {
            for (int s = 0; s < n - i - 1; s++) System.out.print("  ");
            for (long val : triangle.get(i)) {
                System.out.printf("%4d", val);
            }
            System.out.println();
        }
    }
}
```

```python
def generate_pascal(num_rows):
    """Generate Pascal's triangle row by row."""
    triangle = []
    for i in range(num_rows):
        row = [1] * (i + 1)
        for j in range(1, i):
            row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j]
        triangle.append(row)
    return triangle

n = 8
triangle = generate_pascal(n)
for i, row in enumerate(triangle):
    padding = "  " * (n - i - 1)
    values = "   ".join(str(x) for x in row)
    print(f"{padding}{values}")
```

```javascript
function generatePascal(numRows) {
  const triangle = [];
  for (let i = 0; i < numRows; i++) {
    const row = new Array(i + 1).fill(1);
    for (let j = 1; j < i; j++) {
      row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
    triangle.push(row);
  }
  return triangle;
}

const n = 8;
const triangle = generatePascal(n);
for (let i = 0; i < n; i++) {
  const padding = "  ".repeat(n - i - 1);
  const values = triangle[i].join("   ");
  console.log(`${padding}${values}`);
}
```

---

## Expanding Binomials — Code

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Returns coefficients of (a + b)^n expansion as C(n,k) * a^(n-k) * b^k
vector<long long> binomialExpand(int n) {
    vector<long long> coeffs(n + 1);
    coeffs[0] = 1;
    for (int i = 1; i <= n; i++) {
        coeffs[i] = coeffs[i - 1] * (n - i + 1) / i;
    }
    return coeffs;
}

int main() {
    int n = 5;
    auto coeffs = binomialExpand(n);
    cout << "(a + b)^" << n << " = ";
    for (int k = 0; k <= n; k++) {
        if (k > 0) cout << " + ";
        cout << coeffs[k];
        if (n - k > 0) cout << "*a^" << (n - k);
        if (k > 0) cout << "*b^" << k;
    }
    cout << endl;
    return 0;
}
```

```csharp
using System;

class BinomialExpand {
    static long[] Expand(int n) {
        long[] coeffs = new long[n + 1];
        coeffs[0] = 1;
        for (int i = 1; i <= n; i++) {
            coeffs[i] = coeffs[i - 1] * (n - i + 1) / i;
        }
        return coeffs;
    }

    static void Main() {
        int n = 5;
        long[] coeffs = Expand(n);
        Console.Write($"(a + b)^{n} = ");
        for (int k = 0; k <= n; k++) {
            if (k > 0) Console.Write(" + ");
            Console.Write(coeffs[k]);
            if (n - k > 0) Console.Write($"*a^{n - k}");
            if (k > 0) Console.Write($"*b^{k}");
        }
        Console.WriteLine();
    }
}
```

```java
public class BinomialExpand {
    static long[] expand(int n) {
        long[] coeffs = new long[n + 1];
        coeffs[0] = 1;
        for (int i = 1; i <= n; i++) {
            coeffs[i] = coeffs[i - 1] * (n - i + 1) / i;
        }
        return coeffs;
    }

    public static void main(String[] args) {
        int n = 5;
        long[] coeffs = expand(n);
        StringBuilder sb = new StringBuilder("(a + b)^" + n + " = ");
        for (int k = 0; k <= n; k++) {
            if (k > 0) sb.append(" + ");
            sb.append(coeffs[k]);
            if (n - k > 0) sb.append("*a^").append(n - k);
            if (k > 0) sb.append("*b^").append(k);
        }
        System.out.println(sb);
    }
}
```

```python
def binomial_expand(n):
    """Return binomial coefficients for (a + b)^n."""
    coeffs = [1]
    for i in range(1, n + 1):
        coeffs.append(coeffs[-1] * (n - i + 1) // i)
    return coeffs

def format_expansion(n):
    """Format the binomial expansion as a string."""
    coeffs = binomial_expand(n)
    terms = []
    for k in range(n + 1):
        term = str(coeffs[k])
        if n - k > 0:
            term += f"*a^{n - k}"
        if k > 0:
            term += f"*b^{k}"
        terms.append(term)
    return f"(a + b)^{n} = " + " + ".join(terms)

print(format_expansion(5))
# (a + b)^5 = 1*a^5 + 5*a^4*b^1 + 10*a^3*b^2 + 10*a^2*b^3 + 5*a^1*b^4 + 1*b^5
```

```javascript
function binomialExpand(n) {
  // Return binomial coefficients for (a + b)^n
  const coeffs = [1];
  for (let i = 1; i <= n; i++) {
    coeffs.push(coeffs[i - 1] * (n - i + 1) / i);
  }
  return coeffs;
}

function formatExpansion(n) {
  const coeffs = binomialExpand(n);
  const terms = [];
  for (let k = 0; k <= n; k++) {
    let term = `${coeffs[k]}`;
    if (n - k > 0) term += `*a^${n - k}`;
    if (k > 0) term += `*b^${k}`;
    terms.push(term);
  }
  return `(a + b)^${n} = ${terms.join(" + ")}`;
}

console.log(formatExpansion(5));
// (a + b)^5 = 1*a^5 + 5*a^4*b^1 + 10*a^3*b^2 + 10*a^2*b^3 + 5*a^1*b^4 + 1*b^5
```

---

## Key Takeaways

- **Pascal's triangle** encodes all binomial coefficients; each entry is the sum of the two above it: $\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$.
- The **binomial theorem** expands $(a+b)^n$ using coefficients from row $n$ of Pascal's triangle: $(a+b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k$.
- To find a **specific term or coefficient**, identify which $k$ gives the desired power and compute $\binom{n}{k} a^{n-k} b^k$.
- **Vandermonde's identity** $\binom{m+n}{r} = \sum_{k=0}^{r}\binom{m}{k}\binom{n}{r-k}$ splits a selection across two groups — useful in probability and counting arguments.
- The **multinomial theorem** generalizes binomials to sums of $m$ terms, using multinomial coefficients $\frac{n!}{k_1! k_2! \cdots k_m!}$.
- Pascal's triangle reveals many hidden patterns: symmetry, row sums ($2^n$), diagonal sums (Fibonacci!), and the hockey stick identity.
- Building Pascal's triangle iteratively in code is simple and avoids factorial overflow — each row depends only on the previous row.
