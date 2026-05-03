---
title: Mathematical Induction
---

# Mathematical Induction

Mathematical induction is one of the most powerful proof techniques in all of mathematics. It allows us to prove that a statement holds for **every** natural number, even though there are infinitely many of them. If you've ever wondered how mathematicians can be certain that a formula works for $n = 1, 2, 3, \ldots$ all the way to infinity, induction is the answer.

---

## The Domino Analogy

Imagine an infinite row of dominoes standing upright. You want to guarantee that **every single domino** will fall. What do you need?

1. **Knock over the first domino** — this starts the chain reaction.
2. **Ensure each domino knocks over the next one** — if domino $k$ falls, it must hit domino $k+1$ and make it fall too.

If both conditions are met, then:

- Domino 1 falls (you pushed it).
- Since domino 1 fell, domino 2 falls.
- Since domino 2 fell, domino 3 falls.
- And so on, forever.

This is exactly how mathematical induction works. The "first domino" is the **base case**, and the guarantee that "each domino knocks over the next" is the **inductive step**.

---

## The Principle of Mathematical Induction

Let $P(n)$ be a statement about a natural number $n$. To prove that $P(n)$ is true for all $n \geq n_0$ (where $n_0$ is some starting value, often 1), we perform two steps:

### Step 1: Base Case

Show that $P(n_0)$ is true. This establishes the starting point.

### Step 2: Inductive Step

Assume that $P(k)$ is true for some arbitrary $k \geq n_0$. This assumption is called the **inductive hypothesis** (or induction hypothesis). Then, using this assumption, prove that $P(k+1)$ is also true.

### Why This Works

$$
P(n_0) \text{ is true} \quad \Rightarrow \quad P(n_0 + 1) \text{ is true} \quad \Rightarrow \quad P(n_0 + 2) \text{ is true} \quad \Rightarrow \quad \cdots
$$

The base case gives us the starting truth. The inductive step provides the chain. Together, they cover every natural number from $n_0$ onward.

### Formal Statement

$$
\Big[ P(n_0) \;\wedge\; \forall k \geq n_0 \big( P(k) \Rightarrow P(k+1) \big) \Big] \;\Rightarrow\; \forall n \geq n_0,\; P(n)
$$

---

## Example 1: Sum of First $n$ Natural Numbers

**Claim:** For all $n \geq 1$,

$$
1 + 2 + 3 + \cdots + n = \frac{n(n+1)}{2}
$$

Let $P(n)$ denote the statement: $\displaystyle\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$.

### Base Case ($n = 1$)

- Left-hand side (LHS): $1$
- Right-hand side (RHS): $\dfrac{1(1+1)}{2} = \dfrac{2}{2} = 1$

LHS $=$ RHS, so $P(1)$ is true. ✓

### Inductive Step

**Inductive Hypothesis:** Assume $P(k)$ is true for some $k \geq 1$, i.e.,

$$
1 + 2 + \cdots + k = \frac{k(k+1)}{2}
$$

**Goal:** Show $P(k+1)$ is true, i.e.,

$$
1 + 2 + \cdots + k + (k+1) = \frac{(k+1)(k+2)}{2}
$$

**Proof:**

$$
\underbrace{1 + 2 + \cdots + k}_{\text{use inductive hypothesis}} + (k+1)
$$

$$
= \frac{k(k+1)}{2} + (k+1)
$$

$$
= \frac{k(k+1)}{2} + \frac{2(k+1)}{2}
$$

$$
= \frac{k(k+1) + 2(k+1)}{2}
$$

$$
= \frac{(k+1)(k+2)}{2}
$$

This is exactly $P(k+1)$. ✓

### Conclusion

By mathematical induction, $P(n)$ is true for all $n \geq 1$. $\blacksquare$

---

## Example 2: Sum of First $n$ Squares

**Claim:** For all $n \geq 1$,

$$
1^2 + 2^2 + 3^2 + \cdots + n^2 = \frac{n(n+1)(2n+1)}{6}
$$

Let $P(n)$ denote this statement.

### Base Case ($n = 1$)

- LHS: $1^2 = 1$
- RHS: $\dfrac{1 \cdot 2 \cdot 3}{6} = \dfrac{6}{6} = 1$

LHS $=$ RHS. $P(1)$ holds. ✓

### Inductive Step

**Inductive Hypothesis:** Assume for some $k \geq 1$:

$$
1^2 + 2^2 + \cdots + k^2 = \frac{k(k+1)(2k+1)}{6}
$$

**Goal:** Prove:

$$
1^2 + 2^2 + \cdots + k^2 + (k+1)^2 = \frac{(k+1)(k+2)(2k+3)}{6}
$$

**Proof:**

$$
\frac{k(k+1)(2k+1)}{6} + (k+1)^2
$$

Factor out $(k+1)$:

$$
= (k+1) \left[ \frac{k(2k+1)}{6} + \frac{(k+1)}{1} \right]
$$

$$
= (k+1) \left[ \frac{k(2k+1) + 6(k+1)}{6} \right]
$$

Expand the numerator:

$$
k(2k+1) + 6(k+1) = 2k^2 + k + 6k + 6 = 2k^2 + 7k + 6
$$

Factor the quadratic:

$$
2k^2 + 7k + 6 = (k+2)(2k+3)
$$

So we get:

$$
= \frac{(k+1)(k+2)(2k+3)}{6}
$$

This matches $P(k+1)$. ✓

### Conclusion

By induction, the formula holds for all $n \geq 1$. $\blacksquare$

---

## Example 3: Exponential vs. Linear Growth

**Claim:** For all $n \geq 1$,

$$
2^n > n
$$

Let $P(n)$ be the statement $2^n > n$.

### Base Case ($n = 1$)

- LHS: $2^1 = 2$
- RHS: $1$

$2 > 1$ is true. ✓

### Inductive Step

**Inductive Hypothesis:** Assume $2^k > k$ for some $k \geq 1$.

**Goal:** Show $2^{k+1} > k + 1$.

**Proof:**

$$
2^{k+1} = 2 \cdot 2^k
$$

By the inductive hypothesis, $2^k > k$, so:

$$
2 \cdot 2^k > 2k
$$

Now we need $2k \geq k + 1$, which simplifies to $k \geq 1$. Since $k \geq 1$ by our assumption:

$$
2^{k+1} = 2 \cdot 2^k > 2k \geq k + 1
$$

Therefore $2^{k+1} > k + 1$. ✓

### Conclusion

By induction, $2^n > n$ for all $n \geq 1$. $\blacksquare$

---

## Strong Induction

Sometimes, to prove $P(k+1)$, we need more than just $P(k)$ — we might need $P(1), P(2), \ldots, P(k)$ all at once. This variant is called **strong induction** (or **complete induction**).

### The Principle

To prove $P(n)$ for all $n \geq n_0$:

1. **Base Case:** Prove $P(n_0)$ (and sometimes a few more base cases).
2. **Inductive Step:** Assume $P(n_0), P(n_0+1), \ldots, P(k)$ are ALL true. Then prove $P(k+1)$.

The key difference: in regular induction you assume only $P(k)$; in strong induction you assume **all previous cases** up to $k$.

> Strong induction is logically equivalent to regular induction — anything provable with one can be proved with the other. But strong induction is often more convenient.

### Example: Every Integer $\geq 2$ Has a Prime Factor

**Claim:** Every integer $n \geq 2$ has a prime factor.

**Proof by Strong Induction:**

**Base Case ($n = 2$):** The number 2 is itself prime, so it has a prime factor (namely, 2). ✓

**Inductive Step:** Assume every integer $m$ with $2 \leq m \leq k$ has a prime factor. We must show that $k + 1$ has a prime factor.

**Case 1:** $k + 1$ is prime. Then $k + 1$ is its own prime factor. Done.

**Case 2:** $k + 1$ is composite. Then $k + 1 = a \cdot b$ where $2 \leq a, b < k + 1$. Since $2 \leq a \leq k$, the strong inductive hypothesis tells us $a$ has a prime factor $p$. Since $p \mid a$ and $a \mid (k+1)$, we have $p \mid (k+1)$. So $k + 1$ has a prime factor.

In both cases, $k + 1$ has a prime factor. ✓

By strong induction, every integer $\geq 2$ has a prime factor. $\blacksquare$

Notice how we needed the hypothesis for $a$, which could be **any** value between 2 and $k$ — not just $k$ itself. This is why strong induction was necessary.

---

## Another Strong Induction Example: Fibonacci Inequality

**Claim:** The Fibonacci numbers satisfy $F_n < 2^n$ for all $n \geq 1$, where $F_1 = 1, F_2 = 1, F_n = F_{n-1} + F_{n-2}$.

**Base Cases:**

- $n = 1$: $F_1 = 1 < 2 = 2^1$. ✓
- $n = 2$: $F_2 = 1 < 4 = 2^2$. ✓

**Inductive Step:** Assume $F_m < 2^m$ for all $1 \leq m \leq k$ (where $k \geq 2$). Show $F_{k+1} < 2^{k+1}$.

$$
F_{k+1} = F_k + F_{k-1} < 2^k + 2^{k-1}
$$

$$
= 2^{k-1}(2 + 1) = 3 \cdot 2^{k-1} < 4 \cdot 2^{k-1} = 2^{k+1}
$$

Therefore $F_{k+1} < 2^{k+1}$. ✓ $\blacksquare$

---

## Common Mistakes in Induction Proofs

### Mistake 1: Forgetting the Base Case

Without the base case, the inductive step alone proves nothing. Consider the false claim "$n = n + 1$ for all $n$." The inductive step would be: "Assume $k = k + 1$. Then $k + 1 = (k + 1) + 1$... wait, that doesn't even work." But even if a flawed inductive step "works," without checking the base case, you have no starting truth.

### Mistake 2: Assuming What You Want to Prove

In the inductive step, you assume $P(k)$ and must derive $P(k+1)$. A common error is to start with $P(k+1)$ written as an equation and "simplify" both sides. This is circular reasoning. Always start from the LHS of $P(k+1)$ and transform it using the inductive hypothesis to reach the RHS.

### Mistake 3: Wrong Base Case

If your claim is "for all $n \geq 3$..." but you only check $n = 1$, you've verified the wrong starting point. Always match the base case to the domain of your claim.

### Mistake 4: Not Using the Inductive Hypothesis

If your proof of $P(k+1)$ never references $P(k)$, something is likely wrong. The whole power of induction comes from leveraging the assumption.

### Mistake 5: Confusing Strong and Weak Induction

When your proof of $P(k+1)$ requires $P(j)$ for some $j < k$ (not just $P(k)$), you need strong induction. Make sure you state your inductive hypothesis correctly.

---

## When to Use Induction

Induction is your go-to technique when:

- The statement involves a **natural number parameter** ($n \geq n_0$).
- The statement for $n+1$ can be **built upon** the statement for $n$.
- You're working with **sums**, **products**, **inequalities**, **divisibility**, or **recursively defined** objects.

---

## Verification with Code

While induction gives us a **proof** (certainty for all $n$), we can use code to **verify** formulas for many values and build confidence before attempting a proof.

### Verifying the Sum Formula

```python
def verify_sum_formula(max_n):
    """Verify 1 + 2 + ... + n = n(n+1)/2 for many values."""
    for n in range(1, max_n + 1):
        actual_sum = sum(range(1, n + 1))
        formula_result = n * (n + 1) // 2
        assert actual_sum == formula_result, f"Failed at n={n}"
    print(f"Sum formula verified for n = 1 to {max_n}")

verify_sum_formula(10000)
```

```javascript
function verifySumFormula(maxN) {
  for (let n = 1; n <= maxN; n++) {
    let actualSum = 0;
    for (let i = 1; i <= n; i++) actualSum += i;
    const formulaResult = (n * (n + 1)) / 2;
    if (actualSum !== formulaResult) {
      console.error(`Failed at n=${n}`);
      return;
    }
  }
  console.log(`Sum formula verified for n = 1 to ${maxN}`);
}

verifySumFormula(10000);
```

```cpp
#include <iostream>
#include <cassert>

int main() {
    const int MAX_N = 10000;
    for (int n = 1; n <= MAX_N; n++) {
        long long actualSum = 0;
        for (int i = 1; i <= n; i++) actualSum += i;
        long long formulaResult = (long long)n * (n + 1) / 2;
        assert(actualSum == formulaResult);
    }
    std::cout << "Sum formula verified for n = 1 to "
              << MAX_N << std::endl;
    return 0;
}
```

```java
public class InductionVerify {
    public static void main(String[] args) {
        int maxN = 10000;
        for (int n = 1; n <= maxN; n++) {
            long actualSum = 0;
            for (int i = 1; i <= n; i++) actualSum += i;
            long formulaResult = (long) n * (n + 1) / 2;
            assert actualSum == formulaResult : "Failed at n=" + n;
        }
        System.out.println("Sum formula verified for n = 1 to " + maxN);
    }
}
```

```csharp
using System;

class InductionVerify {
    static void Main() {
        int maxN = 10000;
        for (int n = 1; n <= maxN; n++) {
            long actualSum = 0;
            for (int i = 1; i <= n; i++) actualSum += i;
            long formulaResult = (long)n * (n + 1) / 2;
            if (actualSum != formulaResult) {
                Console.WriteLine($"Failed at n={n}");
                return;
            }
        }
        Console.WriteLine($"Sum formula verified for n = 1 to {maxN}");
    }
}
```

### Verifying the Sum of Squares Formula

```python
def verify_sum_of_squares(max_n):
    """Verify 1^2 + 2^2 + ... + n^2 = n(n+1)(2n+1)/6."""
    for n in range(1, max_n + 1):
        actual = sum(i * i for i in range(1, n + 1))
        formula = n * (n + 1) * (2 * n + 1) // 6
        assert actual == formula, f"Failed at n={n}"
    print(f"Sum of squares formula verified for n = 1 to {max_n}")

verify_sum_of_squares(10000)
```

```javascript
function verifySumOfSquares(maxN) {
  for (let n = 1; n <= maxN; n++) {
    let actual = 0;
    for (let i = 1; i <= n; i++) actual += i * i;
    const formula = (n * (n + 1) * (2 * n + 1)) / 6;
    if (actual !== formula) {
      console.error(`Failed at n=${n}`);
      return;
    }
  }
  console.log(`Sum of squares formula verified for n = 1 to ${maxN}`);
}

verifySumOfSquares(10000);
```

```cpp
#include <iostream>
#include <cassert>

int main() {
    const int MAX_N = 10000;
    for (int n = 1; n <= MAX_N; n++) {
        long long actual = 0;
        for (int i = 1; i <= n; i++) actual += (long long)i * i;
        long long formula = (long long)n * (n + 1) * (2 * n + 1) / 6;
        assert(actual == formula);
    }
    std::cout << "Sum of squares formula verified for n = 1 to "
              << MAX_N << std::endl;
    return 0;
}
```

```java
public class SumOfSquaresVerify {
    public static void main(String[] args) {
        int maxN = 10000;
        for (int n = 1; n <= maxN; n++) {
            long actual = 0;
            for (int i = 1; i <= n; i++) actual += (long) i * i;
            long formula = (long) n * (n + 1) * (2 * n + 1) / 6;
            assert actual == formula : "Failed at n=" + n;
        }
        System.out.println("Sum of squares verified for n = 1 to " + maxN);
    }
}
```

```csharp
using System;

class SumOfSquaresVerify {
    static void Main() {
        int maxN = 10000;
        for (int n = 1; n <= maxN; n++) {
            long actual = 0;
            for (int i = 1; i <= n; i++) actual += (long)i * i;
            long formula = (long)n * (n + 1) * (2 * n + 1) / 6;
            if (actual != formula) {
                Console.WriteLine($"Failed at n={n}");
                return;
            }
        }
        Console.WriteLine($"Sum of squares verified for n = 1 to {maxN}");
    }
}
```

### Verifying the Exponential Inequality

```python
def verify_exponential_inequality(max_n):
    """Verify 2^n > n for all n >= 1."""
    for n in range(1, max_n + 1):
        assert 2**n > n, f"Failed at n={n}"
    print(f"2^n > n verified for n = 1 to {max_n}")

verify_exponential_inequality(1000)
```

```javascript
function verifyExponentialInequality(maxN) {
  for (let n = 1; n <= maxN; n++) {
    if (!(2 ** n > n)) {
      console.error(`Failed at n=${n}`);
      return;
    }
  }
  console.log(`2^n > n verified for n = 1 to ${maxN}`);
}

verifyExponentialInequality(50); // limited due to precision
```

```cpp
#include <iostream>
#include <cmath>
#include <cassert>

int main() {
    // For large n, use logarithmic comparison to avoid overflow
    const int MAX_N = 1000;
    for (int n = 1; n <= MAX_N; n++) {
        // Compare n * log(2) > log(n)
        assert(n * std::log(2) > std::log(n));
    }
    std::cout << "2^n > n verified for n = 1 to "
              << MAX_N << std::endl;
    return 0;
}
```

```java
import java.math.BigInteger;

public class ExponentialVerify {
    public static void main(String[] args) {
        int maxN = 1000;
        for (int n = 1; n <= maxN; n++) {
            BigInteger power = BigInteger.TWO.pow(n);
            BigInteger value = BigInteger.valueOf(n);
            assert power.compareTo(value) > 0 : "Failed at n=" + n;
        }
        System.out.println("2^n > n verified for n = 1 to " + maxN);
    }
}
```

```csharp
using System;
using System.Numerics;

class ExponentialVerify {
    static void Main() {
        int maxN = 1000;
        for (int n = 1; n <= maxN; n++) {
            BigInteger power = BigInteger.Pow(2, n);
            if (power <= n) {
                Console.WriteLine($"Failed at n={n}");
                return;
            }
        }
        Console.WriteLine($"2^n > n verified for n = 1 to {maxN}");
    }
}
```

---

## A Template for Induction Proofs

Here's a template you can follow for writing clean induction proofs:

> **Claim:** $P(n)$ holds for all $n \geq n_0$.
>
> **Proof** (by mathematical induction on $n$):
>
> **Base Case** ($n = n_0$): [Show $P(n_0)$ is true by direct computation.]
>
> **Inductive Step:** Suppose $P(k)$ is true for some arbitrary $k \geq n_0$. [State the inductive hypothesis explicitly.] We wish to show $P(k+1)$.
>
> [Derive $P(k+1)$ using the inductive hypothesis.]
>
> By the principle of mathematical induction, $P(n)$ holds for all $n \geq n_0$. $\blacksquare$

---

## Key Takeaways

1. **Mathematical induction** proves statements for all natural numbers using two steps: a base case and an inductive step.
2. The **domino analogy** captures the essence: push the first one (base case), and ensure each knocks the next (inductive step).
3. The **inductive hypothesis** assumes $P(k)$ is true; you then derive $P(k+1)$ — you are NOT assuming what you want to prove.
4. **Strong induction** assumes all of $P(n_0), \ldots, P(k)$ to prove $P(k+1)$; use it when the next case depends on more than just the immediately preceding one.
5. Always **verify** the base case matches the domain of your claim, and always **use** the inductive hypothesis in your proof.
6. Code verification builds **confidence** but is not a replacement for a proof — it can only check finitely many cases.
7. Common pitfalls include forgetting the base case, circular reasoning, and not actually invoking the inductive hypothesis.
