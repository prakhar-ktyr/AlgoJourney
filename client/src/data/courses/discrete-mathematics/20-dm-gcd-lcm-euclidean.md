---
title: GCD, LCM & Euclidean Algorithm
---

# GCD, LCM & Euclidean Algorithm

The greatest common divisor (GCD) and least common multiple (LCM) are fundamental operations in number theory. The Euclidean algorithm provides an elegant and efficient method for computing the GCD, while its extended version solves linear equations in integers. These tools appear throughout cryptography, computer algebra, and algorithm design.

---

## Greatest Common Divisor (GCD)

**Definition:** The **greatest common divisor** of two integers $a$ and $b$ (not both zero), denoted $\gcd(a, b)$, is the largest positive integer that divides both $a$ and $b$.

$$\gcd(a, b) = \max\{d > 0 : d \mid a \text{ and } d \mid b\}$$

**Examples:**

- $\gcd(12, 18) = 6$ (divisors of $12$: $1,2,3,4,6,12$; divisors of $18$: $1,2,3,6,9,18$; largest common: $6$)
- $\gcd(24, 36) = 12$
- $\gcd(17, 5) = 1$
- $\gcd(0, n) = n$ for any positive $n$

When $\gcd(a, b) = 1$, we say $a$ and $b$ are **coprime** (or relatively prime).

---

## Properties of GCD

1. **Commutativity:** $\gcd(a, b) = \gcd(b, a)$

2. **Associativity:** $\gcd(a, \gcd(b, c)) = \gcd(\gcd(a, b), c)$

3. **Identity:** $\gcd(a, 0) = |a|$

4. **Idempotent:** $\gcd(a, a) = |a|$

5. **Reduction:** $\gcd(a, b) = \gcd(a - b, b)$ for $a > b > 0$

6. **Modular reduction:** $\gcd(a, b) = \gcd(b, a \mod b)$ — this is the key to the Euclidean algorithm.

7. **Multiplicative:** $\gcd(ka, kb) = k \cdot \gcd(a, b)$ for $k > 0$

8. **Using prime factorizations:** If $a = p_1^{a_1} p_2^{a_2} \cdots p_k^{a_k}$ and $b = p_1^{b_1} p_2^{b_2} \cdots p_k^{b_k}$, then:

$$\gcd(a, b) = p_1^{\min(a_1, b_1)} p_2^{\min(a_2, b_2)} \cdots p_k^{\min(a_k, b_k)}$$

---

## Least Common Multiple (LCM)

**Definition:** The **least common multiple** of two positive integers $a$ and $b$, denoted $\text{lcm}(a, b)$, is the smallest positive integer that is divisible by both $a$ and $b$.

$$\text{lcm}(a, b) = \min\{m > 0 : a \mid m \text{ and } b \mid m\}$$

**Examples:**

- $\text{lcm}(4, 6) = 12$
- $\text{lcm}(3, 7) = 21$
- $\text{lcm}(12, 18) = 36$

**Using prime factorizations:**

$$\text{lcm}(a, b) = p_1^{\max(a_1, b_1)} p_2^{\max(a_2, b_2)} \cdots p_k^{\max(a_k, b_k)}$$

---

## The GCD-LCM Relationship

A beautiful and practically important identity connects GCD and LCM:

$$\gcd(a, b) \cdot \text{lcm}(a, b) = a \cdot b$$

This means we can compute LCM efficiently once we know the GCD:

$$\text{lcm}(a, b) = \frac{a \cdot b}{\gcd(a, b)}$$

**Example:** $\gcd(12, 18) = 6$, so $\text{lcm}(12, 18) = \frac{12 \cdot 18}{6} = 36$.

**Proof sketch:** Using prime factorizations, $\min(a_i, b_i) + \max(a_i, b_i) = a_i + b_i$ for each prime power, which corresponds to multiplication of the original numbers.

---

## The Euclidean Algorithm

The **Euclidean algorithm** is one of the oldest known algorithms (c. 300 BCE). It computes $\gcd(a, b)$ using repeated division.

**Key identity:** $\gcd(a, b) = \gcd(b, a \mod b)$

**Algorithm:**

1. If $b = 0$, return $a$.
2. Otherwise, compute $r = a \mod b$.
3. Return $\gcd(b, r)$.

**Worked Example:** Compute $\gcd(252, 105)$.

$$\gcd(252, 105):$$

| Step | $a$ | $b$ | $a \mod b$ |
|------|-----|-----|------------|
| 1 | $252$ | $105$ | $252 - 2 \times 105 = 42$ |
| 2 | $105$ | $42$ | $105 - 2 \times 42 = 21$ |
| 3 | $42$ | $21$ | $42 - 2 \times 21 = 0$ |
| 4 | $21$ | $0$ | — |

Since $b = 0$, we return $a = 21$. So $\gcd(252, 105) = 21$.

**Another Example:** $\gcd(48, 18)$

- $\gcd(48, 18) = \gcd(18, 48 \mod 18) = \gcd(18, 12)$
- $\gcd(18, 12) = \gcd(12, 18 \mod 12) = \gcd(12, 6)$
- $\gcd(12, 6) = \gcd(6, 12 \mod 6) = \gcd(6, 0)$
- Result: $6$

**Time complexity:** $O(\log(\min(a, b)))$ — the number of steps is at most $5$ times the number of digits in the smaller number. This is remarkably fast.

---

## Extended Euclidean Algorithm

The **extended Euclidean algorithm** not only computes $\gcd(a, b)$, but also finds integers $x$ and $y$ such that:

$$ax + by = \gcd(a, b)$$

This equation always has a solution — a fact guaranteed by **Bézout's identity**.

**Algorithm (recursive approach):**

Base case: If $b = 0$, then $\gcd(a, 0) = a$, and we have $a \cdot 1 + 0 \cdot 0 = a$. So $x = 1, y = 0$.

Recursive step: Suppose we've found $x_1, y_1$ such that $b \cdot x_1 + (a \mod b) \cdot y_1 = \gcd(a, b)$.

Since $a \mod b = a - \lfloor a/b \rfloor \cdot b$, we substitute:

$$b \cdot x_1 + (a - \lfloor a/b \rfloor \cdot b) \cdot y_1 = \gcd(a, b)$$

$$a \cdot y_1 + b \cdot (x_1 - \lfloor a/b \rfloor \cdot y_1) = \gcd(a, b)$$

So: $x = y_1$ and $y = x_1 - \lfloor a/b \rfloor \cdot y_1$.

**Worked Example:** Find $x, y$ such that $252x + 105y = \gcd(252, 105) = 21$.

Working backwards through the Euclidean algorithm:

- $21 = 105 - 2 \times 42$
- $42 = 252 - 2 \times 105$

Substituting:

$$21 = 105 - 2 \times (252 - 2 \times 105) = 105 - 2 \times 252 + 4 \times 105 = 5 \times 105 - 2 \times 252$$

So $252 \times (-2) + 105 \times 5 = 21$, giving $x = -2, y = 5$.

**Verification:** $252 \times (-2) + 105 \times 5 = -504 + 525 = 21$ ✓

---

## Bézout's Identity

**Theorem (Bézout's Identity):** For any integers $a$ and $b$ (not both zero), there exist integers $x$ and $y$ such that:

$$ax + by = \gcd(a, b)$$

Moreover, $\gcd(a, b)$ is the smallest positive integer that can be expressed as a linear combination of $a$ and $b$.

**Important consequence:** $\gcd(a, b) = 1$ if and only if there exist integers $x, y$ with $ax + by = 1$.

**Corollary:** If $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$ (Euclid's Lemma).

---

## Applications

### Simplifying Fractions

To reduce a fraction $\frac{a}{b}$ to lowest terms, divide both numerator and denominator by $\gcd(a, b)$:

$$\frac{a}{b} = \frac{a / \gcd(a,b)}{b / \gcd(a,b)}$$

**Example:** Simplify $\frac{84}{120}$.

$\gcd(84, 120)$: $120 = 1 \times 84 + 36$, $84 = 2 \times 36 + 12$, $36 = 3 \times 12 + 0$. So $\gcd = 12$.

$$\frac{84}{120} = \frac{84/12}{120/12} = \frac{7}{10}$$

### Solving Linear Diophantine Equations

A **linear Diophantine equation** has the form:

$$ax + by = c$$

where $a, b, c$ are given integers and we seek integer solutions $x, y$.

**Existence theorem:** The equation $ax + by = c$ has integer solutions if and only if $\gcd(a, b) \mid c$.

**Finding solutions:**

1. Compute $d = \gcd(a, b)$ and check that $d \mid c$.
2. Use the extended Euclidean algorithm to find $x_0, y_0$ with $ax_0 + by_0 = d$.
3. A particular solution is $x_p = x_0 \cdot (c/d)$, $y_p = y_0 \cdot (c/d)$.
4. The general solution is:

$$x = x_p + \frac{b}{d} \cdot t, \quad y = y_p - \frac{a}{d} \cdot t \quad (t \in \mathbb{Z})$$

**Example:** Solve $15x + 6y = 12$.

- $\gcd(15, 6) = 3$, and $3 \mid 12$, so solutions exist.
- Extended Euclidean: $15 \times 1 + 6 \times (-2) = 3$, so $x_0 = 1, y_0 = -2$.
- Particular solution: $x_p = 1 \times 4 = 4$, $y_p = -2 \times 4 = -8$.
- General solution: $x = 4 + 2t$, $y = -8 - 5t$ for any integer $t$.

**Check ($t = 0$):** $15(4) + 6(-8) = 60 - 48 = 12$ ✓

### Modular Inverses

The extended Euclidean algorithm finds **modular inverses**. The inverse of $a$ modulo $m$ is an integer $x$ such that:

$$ax \equiv 1 \pmod{m}$$

This exists if and only if $\gcd(a, m) = 1$. We find it by solving $ax + my = 1$ using the extended Euclidean algorithm; the solution $x$ (reduced modulo $m$) is the inverse.

**Example:** Find $7^{-1} \pmod{11}$.

Solve $7x + 11y = 1$: Extended Euclidean gives $7 \times (-3) + 11 \times 2 = 1$.

So $x = -3 \equiv 8 \pmod{11}$. Indeed, $7 \times 8 = 56 = 5 \times 11 + 1$ ✓.

---

## Code: Euclidean Algorithm

```cpp
#include <iostream>
#include <tuple>
using namespace std;

int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

long long lcm(int a, int b) {
    return (long long)a / gcd(a, b) * b;
}

tuple<int, int, int> extendedGcd(int a, int b) {
    if (b == 0) return {a, 1, 0};
    auto [g, x1, y1] = extendedGcd(b, a % b);
    return {g, y1, x1 - (a / b) * y1};
}

int main() {
    int a = 252, b = 105;
    cout << "gcd(" << a << ", " << b << ") = " << gcd(a, b) << endl;
    cout << "lcm(" << a << ", " << b << ") = " << lcm(a, b) << endl;

    auto [g, x, y] = extendedGcd(a, b);
    cout << "Extended GCD: " << a << "*(" << x << ") + "
         << b << "*(" << y << ") = " << g << endl;
    // Output:
    // gcd(252, 105) = 21
    // lcm(252, 105) = 1260
    // Extended GCD: 252*(-2) + 105*(5) = 21
    return 0;
}
```

```csharp
using System;

class Program {
    static int Gcd(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    static long Lcm(int a, int b) {
        return (long)a / Gcd(a, b) * b;
    }

    static (int g, int x, int y) ExtendedGcd(int a, int b) {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtendedGcd(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    static void Main() {
        int a = 252, b = 105;
        Console.WriteLine($"gcd({a}, {b}) = {Gcd(a, b)}");
        Console.WriteLine($"lcm({a}, {b}) = {Lcm(a, b)}");

        var (g, x, y) = ExtendedGcd(a, b);
        Console.WriteLine($"Extended GCD: {a}*({x}) + {b}*({y}) = {g}");
        // Output:
        // gcd(252, 105) = 21
        // lcm(252, 105) = 1260
        // Extended GCD: 252*(-2) + 105*(5) = 21
    }
}
```

```java
public class EuclideanAlgorithm {
    public static int gcd(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    public static long lcm(int a, int b) {
        return (long) a / gcd(a, b) * b;
    }

    public static int[] extendedGcd(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] result = extendedGcd(b, a % b);
        int g = result[0], x1 = result[1], y1 = result[2];
        return new int[]{g, y1, x1 - (a / b) * y1};
    }

    public static void main(String[] args) {
        int a = 252, b = 105;
        System.out.println("gcd(" + a + ", " + b + ") = " + gcd(a, b));
        System.out.println("lcm(" + a + ", " + b + ") = " + lcm(a, b));

        int[] result = extendedGcd(a, b);
        System.out.printf("Extended GCD: %d*(%d) + %d*(%d) = %d%n",
                          a, result[1], b, result[2], result[0]);
        // Output:
        // gcd(252, 105) = 21
        // lcm(252, 105) = 1260
        // Extended GCD: 252*(-2) + 105*(5) = 21
    }
}
```

```python
def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def lcm(a, b):
    return a * b // gcd(a, b)

def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

a, b = 252, 105
print(f"gcd({a}, {b}) = {gcd(a, b)}")
print(f"lcm({a}, {b}) = {lcm(a, b)}")

g, x, y = extended_gcd(a, b)
print(f"Extended GCD: {a}*({x}) + {b}*({y}) = {g}")
# Output:
# gcd(252, 105) = 21
# lcm(252, 105) = 1260
# Extended GCD: 252*(-2) + 105*(5) = 21
```

```javascript
function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}

function extendedGcd(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = extendedGcd(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

const a = 252, b = 105;
console.log(`gcd(${a}, ${b}) = ${gcd(a, b)}`);
console.log(`lcm(${a}, ${b}) = ${lcm(a, b)}`);

const { g, x, y } = extendedGcd(a, b);
console.log(`Extended GCD: ${a}*(${x}) + ${b}*(${y}) = ${g}`);
// Output:
// gcd(252, 105) = 21
// lcm(252, 105) = 1260
// Extended GCD: 252*(-2) + 105*(5) = 21
```

---

## Code: Solving Linear Diophantine Equations

```cpp
#include <iostream>
#include <tuple>
#include <optional>
using namespace std;

tuple<int, int, int> extGcd(int a, int b) {
    if (b == 0) return {a, 1, 0};
    auto [g, x1, y1] = extGcd(b, a % b);
    return {g, y1, x1 - (a / b) * y1};
}

optional<tuple<int, int>> solveDiophantine(int a, int b, int c) {
    auto [g, x0, y0] = extGcd(a, b);
    if (c % g != 0) return nullopt;  // No solution
    int scale = c / g;
    return make_tuple(x0 * scale, y0 * scale);
}

int main() {
    int a = 15, b = 6, c = 12;
    auto result = solveDiophantine(a, b, c);
    if (result) {
        auto [x, y] = *result;
        cout << a << "*(" << x << ") + " << b << "*(" << y << ") = " << c << endl;
        cout << "General solution: x = " << x << " + " << b / __gcd(a,b)
             << "t, y = " << y << " - " << a / __gcd(a,b) << "t" << endl;
    } else {
        cout << "No solution exists." << endl;
    }
    // Output: 15*(4) + 6*(-8) = 12
    return 0;
}
```

```csharp
using System;

class Program {
    static (int g, int x, int y) ExtGcd(int a, int b) {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtGcd(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    static (int x, int y)? SolveDiophantine(int a, int b, int c) {
        var (g, x0, y0) = ExtGcd(a, b);
        if (c % g != 0) return null;
        int scale = c / g;
        return (x0 * scale, y0 * scale);
    }

    static int Gcd(int a, int b) { while (b != 0) { int t = b; b = a % b; a = t; } return a; }

    static void Main() {
        int a = 15, b = 6, c = 12;
        var result = SolveDiophantine(a, b, c);
        if (result is (int x, int y)) {
            Console.WriteLine($"{a}*({x}) + {b}*({y}) = {c}");
            int g = Gcd(a, b);
            Console.WriteLine($"General solution: x = {x} + {b/g}t, y = {y} - {a/g}t");
        } else {
            Console.WriteLine("No solution exists.");
        }
        // Output: 15*(4) + 6*(-8) = 12
    }
}
```

```java
public class DiophantineSolver {
    static int[] extGcd(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] r = extGcd(b, a % b);
        return new int[]{r[0], r[2], r[1] - (a / b) * r[2]};
    }

    static int gcd(int a, int b) { while (b != 0) { int t = b; b = a % b; a = t; } return a; }

    static int[] solveDiophantine(int a, int b, int c) {
        int[] r = extGcd(a, b);
        int g = r[0];
        if (c % g != 0) return null;
        int scale = c / g;
        return new int[]{r[1] * scale, r[2] * scale};
    }

    public static void main(String[] args) {
        int a = 15, b = 6, c = 12;
        int[] sol = solveDiophantine(a, b, c);
        if (sol != null) {
            System.out.printf("%d*(%d) + %d*(%d) = %d%n", a, sol[0], b, sol[1], c);
            int g = gcd(a, b);
            System.out.printf("General solution: x = %d + %dt, y = %d - %dt%n",
                              sol[0], b / g, sol[1], a / g);
        } else {
            System.out.println("No solution exists.");
        }
        // Output: 15*(4) + 6*(-8) = 12
    }
}
```

```python
def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def solve_diophantine(a, b, c):
    g, x0, y0 = ext_gcd(a, b)
    if c % g != 0:
        return None  # No solution
    scale = c // g
    return x0 * scale, y0 * scale

a, b, c = 15, 6, 12
result = solve_diophantine(a, b, c)
if result:
    x, y = result
    print(f"{a}*({x}) + {b}*({y}) = {c}")
    from math import gcd
    g = gcd(a, b)
    print(f"General solution: x = {x} + {b//g}t, y = {y} - {a//g}t")
else:
    print("No solution exists.")
# Output: 15*(4) + 6*(-8) = 12
```

```javascript
function extGcd(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = extGcd(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

function gcd(a, b) {
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}

function solveDiophantine(a, b, c) {
  const { g, x: x0, y: y0 } = extGcd(a, b);
  if (c % g !== 0) return null;
  const scale = c / g;
  return { x: x0 * scale, y: y0 * scale };
}

const a = 15, b = 6, c = 12;
const result = solveDiophantine(a, b, c);
if (result) {
  const { x, y } = result;
  console.log(`${a}*(${x}) + ${b}*(${y}) = ${c}`);
  const g = gcd(a, b);
  console.log(`General solution: x = ${x} + ${b/g}t, y = ${y} - ${a/g}t`);
} else {
  console.log("No solution exists.");
}
// Output: 15*(4) + 6*(-8) = 12
```

---

## Worked Examples

**Example 1:** Compute $\gcd(1071, 462)$.

- $1071 = 2 \times 462 + 147$
- $462 = 3 \times 147 + 21$
- $147 = 7 \times 21 + 0$

$\gcd(1071, 462) = 21$

**Example 2:** Find $\text{lcm}(15, 20)$.

$\gcd(15, 20)$: $20 = 1 \times 15 + 5$, $15 = 3 \times 5 + 0$. So $\gcd = 5$.

$$\text{lcm}(15, 20) = \frac{15 \times 20}{5} = 60$$

**Example 3:** Solve $21x + 14y = 49$.

$\gcd(21, 14) = 7$, and $7 \mid 49$, so solutions exist.

Extended Euclidean on $21, 14$: $21 = 1 \times 14 + 7$, so $21 \times 1 + 14 \times (-1) = 7$.

Scale by $49/7 = 7$: $x_p = 7, y_p = -7$.

General solution: $x = 7 + 2t$, $y = -7 - 3t$ for $t \in \mathbb{Z}$.

**Verify ($t = 0$):** $21(7) + 14(-7) = 147 - 98 = 49$ ✓

---

## Key Takeaways

- The **GCD** of two integers is the largest positive integer dividing both; it can be computed efficiently via the **Euclidean algorithm** in $O(\log(\min(a, b)))$ time.
- The **LCM** is related to GCD by $\gcd(a,b) \cdot \text{lcm}(a,b) = a \cdot b$, enabling fast LCM computation.
- The **Euclidean algorithm** repeatedly applies $\gcd(a, b) = \gcd(b, a \mod b)$ until reaching $\gcd(d, 0) = d$.
- The **extended Euclidean algorithm** finds coefficients $x, y$ satisfying $ax + by = \gcd(a, b)$ (Bézout's identity).
- A linear Diophantine equation $ax + by = c$ has solutions if and only if $\gcd(a, b) \mid c$.
- **Modular inverses** are computed using the extended Euclidean algorithm — essential for RSA encryption and modular arithmetic.
- These algorithms are among the most fundamental in computer science, appearing in cryptography, computer algebra, scheduling, and number-theoretic applications.
