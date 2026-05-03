---
title: Diophantine Equations
---

# Diophantine Equations

## Introduction

A **Diophantine equation** is any equation where we seek only **integer solutions**. Named after Diophantus of Alexandria (circa 250 AD), these equations arise whenever quantities must be whole numbers — you can't buy half a stamp or send a fraction of a packet.

Unlike equations over real numbers, Diophantine equations may have **no solutions**, **finitely many**, or **infinitely many** integer solutions. The challenge is determining which case applies and finding the solutions when they exist.

---

## What Makes an Equation "Diophantine"?

Any polynomial equation becomes Diophantine when we restrict solutions to integers:

- $x^2 + y^2 = z^2$ — Pythagorean triples
- $x^n + y^n = z^n$ — Fermat's Last Theorem (no solutions for $n > 2$)
- $ax + by = c$ — Linear Diophantine equation

The simplest and most practically useful class is the **linear Diophantine equation**, which we'll focus on in this lesson.

---

## Linear Diophantine Equations

A linear Diophantine equation in two variables has the form:

$$ax + by = c$$

where $a$, $b$, and $c$ are given integers, and we seek integer values of $x$ and $y$.

### Examples

| Equation | Question |
|----------|----------|
| $3x + 5y = 11$ | Can we make 11 using 3s and 5s? |
| $6x + 9y = 10$ | Can we make 10 using 6s and 9s? |
| $2x + 4y = 7$ | Can we make 7 using 2s and 4s? |

---

## Solvability Condition

Not every linear Diophantine equation has a solution. The key theorem is:

> **Theorem:** The equation $ax + by = c$ has integer solutions if and only if $\gcd(a, b) \mid c$.

That is, the greatest common divisor of $a$ and $b$ must divide $c$.

### Why This Works

By Bézout's identity, the smallest positive value of $ax + by$ (over all integers $x, y$) is exactly $\gcd(a, b)$. Therefore $ax + by$ can only produce multiples of $\gcd(a, b)$.

### Examples

1. $3x + 5y = 11$: $\gcd(3, 5) = 1$, and $1 \mid 11$ ✓ — solutions exist
2. $6x + 9y = 10$: $\gcd(6, 9) = 3$, and $3 \nmid 10$ ✗ — no solutions
3. $4x + 6y = 12$: $\gcd(4, 6) = 2$, and $2 \mid 12$ ✓ — solutions exist

---

## Finding One Solution via Extended Euclidean Algorithm

If $\gcd(a, b) \mid c$, we find a particular solution $(x_0, y_0)$ using the **Extended Euclidean Algorithm**.

### Step-by-Step Process

1. Compute $d = \gcd(a, b)$ using the Extended Euclidean Algorithm, obtaining $x'$ and $y'$ such that $ax' + by' = d$.
2. Multiply both sides by $\frac{c}{d}$:

$$a\left(x' \cdot \frac{c}{d}\right) + b\left(y' \cdot \frac{c}{d}\right) = c$$

3. So one particular solution is:

$$x_0 = x' \cdot \frac{c}{d}, \quad y_0 = y' \cdot \frac{c}{d}$$

### Worked Example

Solve $3x + 5y = 11$.

**Step 1:** Apply Extended Euclidean to find $\gcd(3, 5)$:

$$5 = 1 \cdot 3 + 2$$
$$3 = 1 \cdot 2 + 1$$
$$2 = 2 \cdot 1 + 0$$

Back-substitute:

$$1 = 3 - 1 \cdot 2 = 3 - 1 \cdot (5 - 1 \cdot 3) = 2 \cdot 3 + (-1) \cdot 5$$

So $x' = 2$, $y' = -1$, and $d = 1$.

**Step 2:** Multiply by $\frac{c}{d} = \frac{11}{1} = 11$:

$$x_0 = 2 \cdot 11 = 22, \quad y_0 = (-1) \cdot 11 = -11$$

**Verify:** $3(22) + 5(-11) = 66 - 55 = 11$ ✓

---

## The Extended Euclidean Algorithm

The algorithm simultaneously computes $\gcd(a, b)$ and the coefficients $x$, $y$:

```cpp
#include <iostream>
#include <tuple>
using namespace std;

// Returns (gcd, x, y) such that a*x + b*y = gcd(a, b)
tuple<int, int, int> extendedGCD(int a, int b) {
    if (b == 0) {
        return {a, 1, 0};
    }
    auto [g, x1, y1] = extendedGCD(b, a % b);
    int x = y1;
    int y = x1 - (a / b) * y1;
    return {g, x, y};
}

int main() {
    int a = 3, b = 5;
    auto [g, x, y] = extendedGCD(a, b);
    cout << "gcd(" << a << ", " << b << ") = " << g << endl;
    cout << a << "*(" << x << ") + " << b << "*(" << y << ") = " << g << endl;
    return 0;
}
```

```csharp
using System;

class DiophantineEquations
{
    static (int gcd, int x, int y) ExtendedGCD(int a, int b)
    {
        if (b == 0)
            return (a, 1, 0);

        var (g, x1, y1) = ExtendedGCD(b, a % b);
        int x = y1;
        int y = x1 - (a / b) * y1;
        return (g, x, y);
    }

    static void Main()
    {
        int a = 3, b = 5;
        var (g, x, y) = ExtendedGCD(a, b);
        Console.WriteLine($"gcd({a}, {b}) = {g}");
        Console.WriteLine($"{a}*({x}) + {b}*({y}) = {g}");
    }
}
```

```java
public class DiophantineEquations {

    static int[] extendedGCD(int a, int b) {
        if (b == 0) {
            return new int[]{a, 1, 0};
        }
        int[] result = extendedGCD(b, a % b);
        int g = result[0], x1 = result[1], y1 = result[2];
        int x = y1;
        int y = x1 - (a / b) * y1;
        return new int[]{g, x, y};
    }

    public static void main(String[] args) {
        int a = 3, b = 5;
        int[] result = extendedGCD(a, b);
        System.out.printf("gcd(%d, %d) = %d%n", a, b, result[0]);
        System.out.printf("%d*(%d) + %d*(%d) = %d%n", a, result[1], b, result[2], result[0]);
    }
}
```

```python
def extended_gcd(a, b):
    """Returns (gcd, x, y) such that a*x + b*y = gcd(a, b)"""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y

a, b = 3, 5
g, x, y = extended_gcd(a, b)
print(f"gcd({a}, {b}) = {g}")
print(f"{a}*({x}) + {b}*({y}) = {g}")
```

```javascript
function extendedGCD(a, b) {
  if (b === 0) {
    return [a, 1, 0];
  }
  const [g, x1, y1] = extendedGCD(b, a % b);
  const x = y1;
  const y = x1 - Math.floor(a / b) * y1;
  return [g, x, y];
}

const a = 3, b = 5;
const [g, x, y] = extendedGCD(a, b);
console.log(`gcd(${a}, ${b}) = ${g}`);
console.log(`${a}*(${x}) + ${b}*(${y}) = ${g}`);
```

---

## General Solution

Once we have one particular solution $(x_0, y_0)$, the **complete set** of integer solutions is:

$$x = x_0 + \frac{b}{d} \cdot t$$

$$y = y_0 - \frac{a}{d} \cdot t$$

where $d = \gcd(a, b)$ and $t$ is any integer.

### Why This Formula Works

If $(x_0, y_0)$ satisfies $ax + by = c$, then for any integer $t$:

$$a\left(x_0 + \frac{b}{d}t\right) + b\left(y_0 - \frac{a}{d}t\right) = ax_0 + by_0 + \frac{ab}{d}t - \frac{ab}{d}t = c$$

The $\frac{ab}{d}t$ terms cancel, confirming every such pair is a solution.

### Example

For $3x + 5y = 11$ with $(x_0, y_0) = (22, -11)$ and $d = 1$:

$$x = 22 + 5t, \quad y = -11 - 3t$$

Some solutions:

| $t$ | $x$ | $y$ | Check: $3x + 5y$ |
|-----|------|------|-------------------|
| $-4$ | $2$ | $1$ | $6 + 5 = 11$ ✓ |
| $-3$ | $7$ | $-2$ | $21 - 10 = 11$ ✓ |
| $-5$ | $-3$ | $4$ | $-9 + 20 = 11$ ✓ |
| $0$ | $22$ | $-11$ | $66 - 55 = 11$ ✓ |

---

## Finding Positive Solutions

In many real-world problems, we need **non-negative** or **positive** solutions (you can't buy $-3$ stamps!).

Given the general solution $x = x_0 + \frac{b}{d}t$ and $y = y_0 - \frac{a}{d}t$, we need:

$$x > 0 \implies t > -\frac{x_0 d}{b}$$

$$y > 0 \implies t < \frac{y_0 d}{a}$$

So we need:

$$-\frac{x_0 d}{b} < t < \frac{y_0 d}{a}$$

### Example: Positive Solutions of $3x + 5y = 11$

From $x = 22 + 5t > 0$ we get $t > -4.4$, so $t \geq -4$.

From $y = -11 - 3t > 0$ we get $t < -3.67$, so $t \leq -4$.

The only value is $t = -4$, giving $(x, y) = (2, 1)$.

**Verify:** $3(2) + 5(1) = 11$ ✓

### Non-negative Solutions ($x \geq 0$, $y \geq 0$)

For non-negative solutions, change strict inequalities to non-strict:

$$t \geq -\frac{x_0 d}{b}, \quad t \leq \frac{y_0 d}{a}$$

This may yield a range of valid $t$ values, each giving a distinct solution.

---

## Applications

### The Coin Problem (Frobenius Problem)

> Given coins of denominations $a$ and $b$ (with $\gcd(a, b) = 1$), what amounts can be represented?

Every amount $c \geq (a-1)(b-1)$ can be represented. The largest amount that **cannot** be represented is:

$$g(a, b) = ab - a - b$$

**Example:** With coins of 3 and 5, the largest unrepresentable amount is $3 \cdot 5 - 3 - 5 = 7$.

### Resource Allocation

> A factory produces widgets in batches of 12 and gadgets in batches of 8. Can they produce exactly 100 items using full batches?

Solve $12x + 8y = 100$:
- $\gcd(12, 8) = 4$, and $4 \mid 100$ ✓
- Simplify: $3x + 2y = 25$
- Extended GCD gives $3(1) + 2(-1) = 1$, so $x' = 1$, $y' = -1$
- Particular solution: $x_0 = 25$, $y_0 = -25$
- General: $x = 25 + 2t$, $y = -25 - 3t$
- Positive: $t \geq -12$ and $t \leq -9$
- Solutions: $(1, 11)$, $(3, 8)$, $(5, 5)$, $(7, 2)$ — four ways!

---

## Complete Implementation: Find All Positive Solutions

```cpp
#include <iostream>
#include <vector>
#include <tuple>
#include <cmath>
using namespace std;

tuple<int, int, int> extendedGCD(int a, int b) {
    if (b == 0) return {a, 1, 0};
    auto [g, x1, y1] = extendedGCD(b, a % b);
    return {g, y1, x1 - (a / b) * y1};
}

vector<pair<int, int>> findPositiveSolutions(int a, int b, int c) {
    vector<pair<int, int>> solutions;
    auto [d, xp, yp] = extendedGCD(a, b);

    if (c % d != 0) return solutions; // No solutions

    int x0 = xp * (c / d);
    int y0 = yp * (c / d);
    int stepX = b / d;
    int stepY = a / d;

    // Find range of t for positive solutions
    // x = x0 + stepX * t > 0  =>  t > -x0 / stepX
    // y = y0 - stepY * t > 0  =>  t < y0 / stepY
    int tMin = (int)floor(-(double)x0 / stepX) + 1;
    int tMax = (int)ceil((double)y0 / stepY) - 1;

    for (int t = tMin; t <= tMax; t++) {
        int x = x0 + stepX * t;
        int y = y0 - stepY * t;
        if (x > 0 && y > 0) {
            solutions.push_back({x, y});
        }
    }
    return solutions;
}

int main() {
    int a = 3, b = 5, c = 31;
    cout << "Positive solutions to " << a << "x + " << b << "y = " << c << ":" << endl;
    auto solutions = findPositiveSolutions(a, b, c);
    if (solutions.empty()) {
        cout << "No positive solutions exist." << endl;
    } else {
        for (auto [x, y] : solutions) {
            cout << "  x = " << x << ", y = " << y;
            cout << "  (check: " << a * x + b * y << ")" << endl;
        }
    }
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class DiophantineSolver
{
    static (int gcd, int x, int y) ExtendedGCD(int a, int b)
    {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtendedGCD(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    static List<(int x, int y)> FindPositiveSolutions(int a, int b, int c)
    {
        var solutions = new List<(int, int)>();
        var (d, xp, yp) = ExtendedGCD(a, b);

        if (c % d != 0) return solutions;

        int x0 = xp * (c / d);
        int y0 = yp * (c / d);
        int stepX = b / d;
        int stepY = a / d;

        int tMin = (int)Math.Floor(-(double)x0 / stepX) + 1;
        int tMax = (int)Math.Ceiling((double)y0 / stepY) - 1;

        for (int t = tMin; t <= tMax; t++)
        {
            int x = x0 + stepX * t;
            int y = y0 - stepY * t;
            if (x > 0 && y > 0)
                solutions.Add((x, y));
        }
        return solutions;
    }

    static void Main()
    {
        int a = 3, b = 5, c = 31;
        Console.WriteLine($"Positive solutions to {a}x + {b}y = {c}:");
        var solutions = FindPositiveSolutions(a, b, c);

        if (solutions.Count == 0)
            Console.WriteLine("No positive solutions exist.");
        else
            foreach (var (x, y) in solutions)
                Console.WriteLine($"  x = {x}, y = {y}  (check: {a * x + b * y})");
    }
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class DiophantineSolver {

    static int[] extendedGCD(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] r = extendedGCD(b, a % b);
        int g = r[0], x1 = r[1], y1 = r[2];
        return new int[]{g, y1, x1 - (a / b) * y1};
    }

    static List<int[]> findPositiveSolutions(int a, int b, int c) {
        List<int[]> solutions = new ArrayList<>();
        int[] r = extendedGCD(a, b);
        int d = r[0], xp = r[1], yp = r[2];

        if (c % d != 0) return solutions;

        int x0 = xp * (c / d);
        int y0 = yp * (c / d);
        int stepX = b / d;
        int stepY = a / d;

        int tMin = (int) Math.floor(-(double) x0 / stepX) + 1;
        int tMax = (int) Math.ceil((double) y0 / stepY) - 1;

        for (int t = tMin; t <= tMax; t++) {
            int x = x0 + stepX * t;
            int y = y0 - stepY * t;
            if (x > 0 && y > 0) {
                solutions.add(new int[]{x, y});
            }
        }
        return solutions;
    }

    public static void main(String[] args) {
        int a = 3, b = 5, c = 31;
        System.out.printf("Positive solutions to %dx + %dy = %d:%n", a, b, c);
        List<int[]> solutions = findPositiveSolutions(a, b, c);

        if (solutions.isEmpty()) {
            System.out.println("No positive solutions exist.");
        } else {
            for (int[] sol : solutions) {
                System.out.printf("  x = %d, y = %d  (check: %d)%n",
                    sol[0], sol[1], a * sol[0] + b * sol[1]);
            }
        }
    }
}
```

```python
import math

def extended_gcd(a, b):
    """Returns (gcd, x, y) such that a*x + b*y = gcd(a, b)"""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def find_positive_solutions(a, b, c):
    """Find all positive integer solutions to ax + by = c"""
    d, xp, yp = extended_gcd(a, b)

    if c % d != 0:
        return []  # No solutions

    x0 = xp * (c // d)
    y0 = yp * (c // d)
    step_x = b // d
    step_y = a // d

    # x = x0 + step_x * t > 0  =>  t > -x0 / step_x
    # y = y0 - step_y * t > 0  =>  t < y0 / step_y
    t_min = math.floor(-x0 / step_x) + 1
    t_max = math.ceil(y0 / step_y) - 1

    solutions = []
    for t in range(t_min, t_max + 1):
        x = x0 + step_x * t
        y = y0 - step_y * t
        if x > 0 and y > 0:
            solutions.append((x, y))
    return solutions

# Example
a, b, c = 3, 5, 31
print(f"Positive solutions to {a}x + {b}y = {c}:")
solutions = find_positive_solutions(a, b, c)
if not solutions:
    print("No positive solutions exist.")
else:
    for x, y in solutions:
        print(f"  x = {x}, y = {y}  (check: {a*x + b*y})")
```

```javascript
function extendedGCD(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = extendedGCD(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}

function findPositiveSolutions(a, b, c) {
  const [d, xp, yp] = extendedGCD(a, b);

  if (c % d !== 0) return []; // No solutions

  const x0 = xp * Math.floor(c / d);
  const y0 = yp * Math.floor(c / d);
  const stepX = Math.floor(b / d);
  const stepY = Math.floor(a / d);

  const tMin = Math.floor(-x0 / stepX) + 1;
  const tMax = Math.ceil(y0 / stepY) - 1;

  const solutions = [];
  for (let t = tMin; t <= tMax; t++) {
    const x = x0 + stepX * t;
    const y = y0 - stepY * t;
    if (x > 0 && y > 0) {
      solutions.push([x, y]);
    }
  }
  return solutions;
}

// Example
const a = 3, b = 5, c = 31;
console.log(`Positive solutions to ${a}x + ${b}y = ${c}:`);
const solutions = findPositiveSolutions(a, b, c);
if (solutions.length === 0) {
  console.log("No positive solutions exist.");
} else {
  for (const [x, y] of solutions) {
    console.log(`  x = ${x}, y = ${y}  (check: ${a * x + b * y})`);
  }
}
```

---

## Counting Solutions

Sometimes we only need to **count** positive solutions without listing them:

$$\text{count} = \max(0,\; t_{\max} - t_{\min} + 1)$$

where $t_{\min}$ and $t_{\max}$ are the bounds derived from the positivity constraints.

---

## Special Cases

### When $a$ or $b$ Is Zero

- If $a = 0$: equation becomes $by = c$, solution exists iff $b \mid c$, giving $y = c/b$ (any $x$).
- If $b = 0$: equation becomes $ax = c$, solution exists iff $a \mid c$, giving $x = c/a$ (any $y$).

### When $\gcd(a, b) = 1$ (Coprime)

When $a$ and $b$ are coprime, $ax + by = c$ **always** has solutions for any integer $c$. The solutions are spaced $b$ apart in $x$ and $a$ apart in $y$.

### Negative Coefficients

If the equation is $ax - by = c$, rewrite as $ax + (-b)y = c$ and apply the same algorithm with $b' = -b$.

---

## Practice Problems

1. Find all positive integer solutions to $7x + 11y = 100$.
2. A store sells notebooks for \$3 and pens for \$2. How many ways can you spend exactly \$20?
3. Prove that $6x + 10y = 15$ has no integer solutions.
4. Find the smallest positive solution to $17x + 13y = 1000$.

---

## Key Takeaways

- A **Diophantine equation** restricts solutions to integers only.
- The linear equation $ax + by = c$ is solvable iff $\gcd(a, b) \mid c$.
- The **Extended Euclidean Algorithm** finds one particular solution.
- The **general solution** is $x = x_0 + \frac{b}{d}t$, $y = y_0 - \frac{a}{d}t$ for any integer $t$.
- For **positive solutions**, bound $t$ using the inequalities $x > 0$ and $y > 0$.
- Applications include coin problems, resource allocation, and scheduling.
- The Frobenius number $ab - a - b$ gives the largest unrepresentable value when $\gcd(a, b) = 1$.
