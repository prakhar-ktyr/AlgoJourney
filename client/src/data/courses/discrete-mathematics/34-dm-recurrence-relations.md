---
title: Recurrence Relations
---

# Recurrence Relations

A **recurrence relation** defines a sequence where each term is expressed as a function of previous terms. They arise naturally in algorithm analysis, combinatorics, and modeling of discrete processes. Learning to solve them gives you powerful tools for finding closed-form expressions.

## What Is a Recurrence Relation?

A recurrence relation consists of:
1. A **recursive formula** expressing $a_n$ in terms of earlier terms ($a_{n-1}$, $a_{n-2}$, etc.)
2. **Initial conditions** (base cases) that anchor the sequence

Together, these uniquely determine every term of the sequence.

### Simple Example

The sequence $1, 2, 4, 8, 16, \ldots$ satisfies:
- Recurrence: $a_n = 2a_{n-1}$
- Initial condition: $a_0 = 1$
- Closed form: $a_n = 2^n$

## Classic Examples

### Fibonacci Sequence

$$F_n = F_{n-1} + F_{n-2}, \quad F_0 = 0, \quad F_1 = 1$$

The sequence: $0, 1, 1, 2, 3, 5, 8, 13, 21, 34, \ldots$

Fibonacci numbers appear in nature (spirals, branching), algorithm analysis (worst-case AVL tree height), and number theory.

### Tower of Hanoi

The minimum number of moves $T_n$ to transfer $n$ disks:

$$T_n = 2T_{n-1} + 1, \quad T_1 = 1$$

**Solution**: $T_n = 2^n - 1$

**Derivation**: Move $n-1$ disks to auxiliary peg ($T_{n-1}$ moves), move the largest disk (1 move), move $n-1$ disks back ($T_{n-1}$ moves).

### Factorial as a Recurrence

$$a_n = n \cdot a_{n-1}, \quad a_0 = 1$$

This gives $a_n = n!$, though the recurrence is **not linear** (the coefficient depends on $n$).

### Merge Sort Complexity

The time to merge sort $n$ elements:

$$T(n) = 2T(n/2) + O(n), \quad T(1) = O(1)$$

By the Master Theorem: $T(n) = O(n \log n)$.

## First-Order Linear Recurrences

A **first-order linear recurrence** has the form:

$$a_n = c \cdot a_{n-1} + f(n)$$

where $c$ is a constant and $f(n)$ is a function of $n$.

### Homogeneous Case: $f(n) = 0$

$$a_n = c \cdot a_{n-1} \implies a_n = c^n \cdot a_0$$

This is simply geometric growth (or decay if $|c| < 1$).

### Non-Homogeneous with Constant $f$

$$a_n = c \cdot a_{n-1} + d$$

**Solution**: The closed form is:

$$a_n = c^n \cdot a_0 + d \cdot \frac{c^n - 1}{c - 1} \quad \text{(for } c \neq 1\text{)}$$

For $c = 1$: $a_n = a_0 + nd$

**Example** — Tower of Hanoi: $T_n = 2T_{n-1} + 1$ with $T_0 = 0$:

$$T_n = 2^n \cdot 0 + 1 \cdot \frac{2^n - 1}{2 - 1} = 2^n - 1$$

### Solution by Iteration (Unrolling)

For $a_n = c \cdot a_{n-1} + d$:

$$a_n = c \cdot a_{n-1} + d$$
$$= c(c \cdot a_{n-2} + d) + d = c^2 a_{n-2} + cd + d$$
$$= c^2(c \cdot a_{n-3} + d) + cd + d = c^3 a_{n-3} + c^2d + cd + d$$
$$\vdots$$
$$= c^n a_0 + d(c^{n-1} + c^{n-2} + \cdots + c + 1) = c^n a_0 + d \cdot \frac{c^n - 1}{c - 1}$$

## Second-Order Linear Homogeneous Recurrences

These have the form:

$$a_n = c_1 a_{n-1} + c_2 a_{n-2}$$

with initial conditions $a_0$ and $a_1$.

### The Characteristic Equation Method

The key insight is to guess a solution of the form $a_n = r^n$. Substituting:

$$r^n = c_1 r^{n-1} + c_2 r^{n-2}$$

Dividing by $r^{n-2}$ (assuming $r \neq 0$):

$$r^2 = c_1 r + c_2$$

$$r^2 - c_1 r - c_2 = 0$$

This is the **characteristic equation**. Its roots determine the form of the solution.

### Case 1: Two Distinct Real Roots $r_1 \neq r_2$

The general solution is:

$$a_n = A \cdot r_1^n + B \cdot r_2^n$$

where $A$ and $B$ are determined by initial conditions.

### Case 2: Repeated Root $r_1 = r_2 = r$

The general solution is:

$$a_n = (A + Bn) \cdot r^n$$

The factor of $n$ is needed because a single exponential doesn't provide enough "degrees of freedom."

### Case 3: Complex Roots $r = \alpha \pm \beta i$

If $r_1 = \rho e^{i\theta}$ and $r_2 = \rho e^{-i\theta}$ (where $\rho = |r|$):

$$a_n = \rho^n (A \cos(n\theta) + B \sin(n\theta))$$

This produces oscillating sequences with exponential envelope.

## Solving the Fibonacci Recurrence

Let's apply the characteristic equation to Fibonacci: $F_n = F_{n-1} + F_{n-2}$.

### Step 1: Characteristic Equation

$$r^2 = r + 1 \implies r^2 - r - 1 = 0$$

### Step 2: Find Roots

Using the quadratic formula:

$$r = \frac{1 \pm \sqrt{5}}{2}$$

Let $\phi = \frac{1 + \sqrt{5}}{2} \approx 1.618$ (the golden ratio) and $\psi = \frac{1 - \sqrt{5}}{2} \approx -0.618$.

### Step 3: General Solution

$$F_n = A \cdot \phi^n + B \cdot \psi^n$$

### Step 4: Apply Initial Conditions

From $F_0 = 0$: $A + B = 0$, so $B = -A$.

From $F_1 = 1$: $A\phi + B\psi = A(\phi - \psi) = A\sqrt{5} = 1$, so $A = 1/\sqrt{5}$.

### Step 5: Binet's Formula

$$F_n = \frac{\phi^n - \psi^n}{\sqrt{5}} = \frac{1}{\sqrt{5}}\left[\left(\frac{1+\sqrt{5}}{2}\right)^n - \left(\frac{1-\sqrt{5}}{2}\right)^n\right]$$

Since $|\psi| < 1$, the term $\psi^n \to 0$, so $F_n$ is the nearest integer to $\phi^n / \sqrt{5}$ for all $n \geq 0$.

### Verification

- $F_{10} = \frac{\phi^{10} - \psi^{10}}{\sqrt{5}} = \frac{122.991 - 0.0081}{2.236} \approx 55$ ✓
- $F_{20} = 6765$ ✓

## Non-Homogeneous Recurrences

A **non-homogeneous** second-order linear recurrence has the form:

$$a_n = c_1 a_{n-1} + c_2 a_{n-2} + f(n)$$

The solution is:

$$a_n = a_n^{(h)} + a_n^{(p)}$$

where $a_n^{(h)}$ is the **homogeneous solution** (solving with $f(n) = 0$) and $a_n^{(p)}$ is a **particular solution**.

### Finding Particular Solutions

The form of the particular solution depends on $f(n)$:

| $f(n)$         | Try $a_n^{(p)}$ of the form |
|----------------|------------------------------|
| Constant $d$   | $a_n^{(p)} = C$ (constant)  |
| $d \cdot n$    | $a_n^{(p)} = Cn + D$        |
| $d \cdot n^2$  | $a_n^{(p)} = Cn^2 + Dn + E$ |
| $d \cdot s^n$  | $a_n^{(p)} = C \cdot s^n$   |

**Important**: If the trial form is already part of the homogeneous solution, multiply by $n$ (or $n^2$ for repeated roots).

### Example: $a_n = 3a_{n-1} - 2a_{n-2} + 2^n$

**Homogeneous part**: $r^2 - 3r + 2 = 0 \implies (r-1)(r-2) = 0$, roots $r_1 = 1$, $r_2 = 2$.

$$a_n^{(h)} = A \cdot 1^n + B \cdot 2^n = A + B \cdot 2^n$$

**Particular solution**: Since $f(n) = 2^n$ and $r = 2$ is already a root, try $a_n^{(p)} = Cn \cdot 2^n$.

Substituting into the recurrence and solving yields $C = -1$, so $a_n^{(p)} = -n \cdot 2^n$.

**General solution**: $a_n = A + B \cdot 2^n - n \cdot 2^n$

## Higher-Order Recurrences

The characteristic equation method extends to order $k$:

$$a_n = c_1 a_{n-1} + c_2 a_{n-2} + \cdots + c_k a_{n-k}$$

The characteristic equation is:

$$r^k - c_1 r^{k-1} - c_2 r^{k-2} - \cdots - c_k = 0$$

Each distinct root $r_i$ with multiplicity $m_i$ contributes terms $(A_0 + A_1 n + \cdots + A_{m_i - 1} n^{m_i - 1}) r_i^n$ to the general solution.

## Code: Solving Recurrences

Let's implement iterative computation and verify against closed-form solutions for Fibonacci, Tower of Hanoi, and a custom second-order recurrence.

```cpp
#include <iostream>
#include <iomanip>
#include <cmath>
#include <vector>
using namespace std;

// Fibonacci: iterative vs Binet's formula
void solveFibonacci(int maxN) {
    double phi = (1 + sqrt(5)) / 2;
    double psi = (1 - sqrt(5)) / 2;

    cout << "=== Fibonacci ===" << endl;
    cout << setw(5) << "n" << setw(15) << "Iterative" << setw(15) << "Binet" << endl;

    long long prev2 = 0, prev1 = 1;
    cout << setw(5) << 0 << setw(15) << 0 << setw(15) << 0 << endl;
    cout << setw(5) << 1 << setw(15) << 1 << setw(15) << 1 << endl;

    for (int n = 2; n <= maxN; n++) {
        long long current = prev1 + prev2;
        long long binet = (long long)round((pow(phi, n) - pow(psi, n)) / sqrt(5));
        cout << setw(5) << n << setw(15) << current << setw(15) << binet << endl;
        prev2 = prev1;
        prev1 = current;
    }
}

// Tower of Hanoi: iterative vs closed form
void solveTowerOfHanoi(int maxN) {
    cout << "\n=== Tower of Hanoi ===" << endl;
    cout << setw(5) << "n" << setw(15) << "Iterative" << setw(15) << "2^n - 1" << endl;

    long long T = 0;  // T(0) = 0
    for (int n = 0; n <= maxN; n++) {
        long long closed = (1L << n) - 1;
        cout << setw(5) << n << setw(15) << T << setw(15) << closed << endl;
        T = 2 * T + 1;  // Compute next
    }
}

// Custom: a_n = 5*a_{n-1} - 6*a_{n-2}, a_0=1, a_1=4
// Roots: r=2, r=3 => a_n = A*2^n + B*3^n
// From ICs: A + B = 1, 2A + 3B = 4 => A = -1, B = 2
void solveCustom(int maxN) {
    cout << "\n=== Custom: a_n = 5*a_{n-1} - 6*a_{n-2} ===" << endl;
    cout << setw(5) << "n" << setw(15) << "Iterative" << setw(20) << "Closed Form" << endl;

    long long prev2 = 1, prev1 = 4;
    cout << setw(5) << 0 << setw(15) << prev2 << setw(20)
         << (long long)(-pow(2, 0) + 2 * pow(3, 0)) << endl;
    cout << setw(5) << 1 << setw(15) << prev1 << setw(20)
         << (long long)(-pow(2, 1) + 2 * pow(3, 1)) << endl;

    for (int n = 2; n <= maxN; n++) {
        long long current = 5 * prev1 - 6 * prev2;
        long long closed = (long long)(-pow(2, n) + 2 * pow(3, n));
        cout << setw(5) << n << setw(15) << current << setw(20) << closed << endl;
        prev2 = prev1;
        prev1 = current;
    }
}

int main() {
    solveFibonacci(15);
    solveTowerOfHanoi(10);
    solveCustom(10);
    return 0;
}
```

```csharp
using System;

class RecurrenceRelations
{
    static void SolveFibonacci(int maxN)
    {
        double phi = (1 + Math.Sqrt(5)) / 2;
        double psi = (1 - Math.Sqrt(5)) / 2;

        Console.WriteLine("=== Fibonacci ===");
        Console.WriteLine($"{"n",5}{"Iterative",15}{"Binet",15}{"Match",8}");

        long prev2 = 0, prev1 = 1;
        for (int n = 0; n <= maxN; n++)
        {
            long iterative = (n == 0) ? 0 : (n == 1) ? 1 : prev2 + prev1;
            long binet = (long)Math.Round((Math.Pow(phi, n) - Math.Pow(psi, n)) / Math.Sqrt(5));
            Console.WriteLine($"{n,5}{iterative,15}{binet,15}{(iterative == binet ? "✓" : "✗"),8}");

            if (n >= 1)
            {
                long temp = prev1;
                prev1 = prev2 + prev1;
                prev2 = temp;
            }
        }
    }

    static void SolveTowerOfHanoi(int maxN)
    {
        Console.WriteLine("\n=== Tower of Hanoi ===");
        Console.WriteLine($"{"n",5}{"Iterative",15}{"2^n - 1",15}");

        long T = 0;
        for (int n = 0; n <= maxN; n++)
        {
            long closed = (1L << n) - 1;
            Console.WriteLine($"{n,5}{T,15}{closed,15}");
            T = 2 * T + 1;
        }
    }

    static void SolveCharacteristic(int maxN)
    {
        // a_n = 5*a_{n-1} - 6*a_{n-2}, a_0=1, a_1=4
        // Closed form: a_n = -2^n + 2*3^n
        Console.WriteLine("\n=== Characteristic: a_n = 5a_{n-1} - 6a_{n-2} ===");
        Console.WriteLine($"{"n",5}{"Iterative",15}{"Closed",15}");

        long prev2 = 1, prev1 = 4;
        Console.WriteLine($"{0,5}{prev2,15}{-1 + 2,15}");
        Console.WriteLine($"{1,5}{prev1,15}{-2 + 6,15}");

        for (int n = 2; n <= maxN; n++)
        {
            long current = 5 * prev1 - 6 * prev2;
            long closed = -(long)Math.Pow(2, n) + 2 * (long)Math.Pow(3, n);
            Console.WriteLine($"{n,5}{current,15}{closed,15}");
            prev2 = prev1;
            prev1 = current;
        }
    }

    static void Main()
    {
        SolveFibonacci(15);
        SolveTowerOfHanoi(10);
        SolveCharacteristic(10);
    }
}
```

```java
public class RecurrenceRelations {
    static void solveFibonacci(int maxN) {
        double phi = (1 + Math.sqrt(5)) / 2;
        double psi = (1 - Math.sqrt(5)) / 2;

        System.out.println("=== Fibonacci ===");
        System.out.printf("%5s%15s%15s%8s%n", "n", "Iterative", "Binet", "Match");

        long prev2 = 0, prev1 = 1;
        for (int n = 0; n <= maxN; n++) {
            long iterative;
            if (n == 0) iterative = 0;
            else if (n == 1) iterative = 1;
            else {
                iterative = prev1 + prev2;
                prev2 = prev1;
                prev1 = iterative;
            }
            long binet = Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5));
            System.out.printf("%5d%15d%15d%8s%n", n, iterative, binet,
                             iterative == binet ? "✓" : "✗");
        }
    }

    static void solveTowerOfHanoi(int maxN) {
        System.out.println("\n=== Tower of Hanoi ===");
        System.out.printf("%5s%15s%15s%n", "n", "Iterative", "2^n - 1");

        long T = 0;
        for (int n = 0; n <= maxN; n++) {
            long closed = (1L << n) - 1;
            System.out.printf("%5d%15d%15d%n", n, T, closed);
            T = 2 * T + 1;
        }
    }

    static void solveCharacteristic(int maxN) {
        // a_n = 5*a_{n-1} - 6*a_{n-2}, a_0=1, a_1=4
        // Characteristic: r^2 - 5r + 6 = 0 => r=2, r=3
        // Closed: a_n = -2^n + 2*3^n
        System.out.println("\n=== Characteristic: a_n = 5a_{n-1} - 6a_{n-2} ===");
        System.out.printf("%5s%15s%15s%n", "n", "Iterative", "Closed");

        long prev2 = 1, prev1 = 4;
        System.out.printf("%5d%15d%15d%n", 0, prev2, (long)(-Math.pow(2, 0) + 2 * Math.pow(3, 0)));
        System.out.printf("%5d%15d%15d%n", 1, prev1, (long)(-Math.pow(2, 1) + 2 * Math.pow(3, 1)));

        for (int n = 2; n <= maxN; n++) {
            long current = 5 * prev1 - 6 * prev2;
            long closed = -(long) Math.pow(2, n) + 2 * (long) Math.pow(3, n);
            System.out.printf("%5d%15d%15d%n", n, current, closed);
            prev2 = prev1;
            prev1 = current;
        }
    }

    public static void main(String[] args) {
        solveFibonacci(15);
        solveTowerOfHanoi(10);
        solveCharacteristic(10);
    }
}
```

```python
import math

def solve_fibonacci(max_n):
    """Compute Fibonacci iteratively and verify with Binet's formula."""
    phi = (1 + math.sqrt(5)) / 2
    psi = (1 - math.sqrt(5)) / 2

    print("=== Fibonacci ===")
    print(f"{'n':>5}{'Iterative':>15}{'Binet':>15}{'Match':>8}")

    prev2, prev1 = 0, 1
    for n in range(max_n + 1):
        if n == 0:
            iterative = 0
        elif n == 1:
            iterative = 1
        else:
            iterative = prev1 + prev2
            prev2, prev1 = prev1, iterative

        binet = round((phi**n - psi**n) / math.sqrt(5))
        match = "✓" if iterative == binet else "✗"
        print(f"{n:>5}{iterative:>15}{binet:>15}{match:>8}")

def solve_tower_of_hanoi(max_n):
    """Tower of Hanoi: T_n = 2*T_{n-1} + 1, closed form 2^n - 1."""
    print("\n=== Tower of Hanoi ===")
    print(f"{'n':>5}{'Iterative':>15}{'2^n - 1':>15}")

    T = 0
    for n in range(max_n + 1):
        closed = 2**n - 1
        print(f"{n:>5}{T:>15}{closed:>15}")
        T = 2 * T + 1

def solve_characteristic(max_n):
    """Solve a_n = 5*a_{n-1} - 6*a_{n-2} with a_0=1, a_1=4.
    
    Characteristic equation: r^2 - 5r + 6 = 0
    Roots: r = 2, r = 3
    General solution: a_n = A*2^n + B*3^n
    From a_0 = 1: A + B = 1
    From a_1 = 4: 2A + 3B = 4
    Solving: A = -1, B = 2
    Closed form: a_n = -2^n + 2*3^n
    """
    print("\n=== Characteristic: a_n = 5a_{n-1} - 6a_{n-2} ===")
    print(f"{'n':>5}{'Iterative':>15}{'Closed':>15}{'Match':>8}")

    prev2, prev1 = 1, 4
    for n in range(max_n + 1):
        if n == 0:
            iterative = 1
        elif n == 1:
            iterative = 4
        else:
            iterative = 5 * prev1 - 6 * prev2
            prev2, prev1 = prev1, iterative

        closed = -(2**n) + 2 * (3**n)
        match = "✓" if iterative == closed else "✗"
        print(f"{n:>5}{iterative:>15}{closed:>15}{match:>8}")

def solve_repeated_root(max_n):
    """Solve a_n = 4*a_{n-1} - 4*a_{n-2} with a_0=1, a_1=4.
    
    Characteristic: r^2 - 4r + 4 = 0 => (r-2)^2 = 0, repeated root r=2
    General solution: a_n = (A + Bn) * 2^n
    From a_0 = 1: A = 1
    From a_1 = 4: (1 + B) * 2 = 4 => B = 1
    Closed form: a_n = (1 + n) * 2^n
    """
    print("\n=== Repeated Root: a_n = 4a_{n-1} - 4a_{n-2} ===")
    print(f"{'n':>5}{'Iterative':>15}{'(1+n)*2^n':>15}{'Match':>8}")

    prev2, prev1 = 1, 4
    for n in range(max_n + 1):
        if n == 0:
            iterative = 1
        elif n == 1:
            iterative = 4
        else:
            iterative = 4 * prev1 - 4 * prev2
            prev2, prev1 = prev1, iterative

        closed = (1 + n) * (2**n)
        match = "✓" if iterative == closed else "✗"
        print(f"{n:>5}{iterative:>15}{closed:>15}{match:>8}")

solve_fibonacci(15)
solve_tower_of_hanoi(10)
solve_characteristic(10)
solve_repeated_root(10)
```

```javascript
function solveFibonacci(maxN) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const psi = (1 - Math.sqrt(5)) / 2;

  console.log("=== Fibonacci ===");
  console.log(`${"n".padStart(5)}${"Iterative".padStart(15)}${"Binet".padStart(15)}${"Match".padStart(8)}`);

  let prev2 = 0, prev1 = 1;
  for (let n = 0; n <= maxN; n++) {
    let iterative;
    if (n === 0) iterative = 0;
    else if (n === 1) iterative = 1;
    else {
      iterative = prev1 + prev2;
      prev2 = prev1;
      prev1 = iterative;
    }
    const binet = Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5));
    const match = iterative === binet ? "✓" : "✗";
    console.log(`${String(n).padStart(5)}${String(iterative).padStart(15)}${String(binet).padStart(15)}${match.padStart(8)}`);
  }
}

function solveTowerOfHanoi(maxN) {
  console.log("\n=== Tower of Hanoi ===");
  console.log(`${"n".padStart(5)}${"Iterative".padStart(15)}${"2^n - 1".padStart(15)}`);

  let T = 0;
  for (let n = 0; n <= maxN; n++) {
    const closed = (1 << n) - 1;
    console.log(`${String(n).padStart(5)}${String(T).padStart(15)}${String(closed).padStart(15)}`);
    T = 2 * T + 1;
  }
}

function solveCharacteristic(maxN) {
  // a_n = 5*a_{n-1} - 6*a_{n-2}, a_0=1, a_1=4
  // Closed form: a_n = -2^n + 2*3^n
  console.log("\n=== Characteristic: a_n = 5a_{n-1} - 6a_{n-2} ===");
  console.log(`${"n".padStart(5)}${"Iterative".padStart(15)}${"Closed".padStart(15)}${"Match".padStart(8)}`);

  let prev2 = 1, prev1 = 4;
  for (let n = 0; n <= maxN; n++) {
    let iterative;
    if (n === 0) iterative = 1;
    else if (n === 1) iterative = 4;
    else {
      iterative = 5 * prev1 - 6 * prev2;
      prev2 = prev1;
      prev1 = iterative;
    }
    const closed = -Math.pow(2, n) + 2 * Math.pow(3, n);
    const match = iterative === closed ? "✓" : "✗";
    console.log(`${String(n).padStart(5)}${String(iterative).padStart(15)}${String(closed).padStart(15)}${match.padStart(8)}`);
  }
}

function solveRepeatedRoot(maxN) {
  // a_n = 4*a_{n-1} - 4*a_{n-2}, a_0=1, a_1=4
  // Repeated root r=2, closed form: (1+n)*2^n
  console.log("\n=== Repeated Root: a_n = 4a_{n-1} - 4a_{n-2} ===");
  console.log(`${"n".padStart(5)}${"Iterative".padStart(15)}${"(1+n)*2^n".padStart(15)}${"Match".padStart(8)}`);

  let prev2 = 1, prev1 = 4;
  for (let n = 0; n <= maxN; n++) {
    let iterative;
    if (n === 0) iterative = 1;
    else if (n === 1) iterative = 4;
    else {
      iterative = 4 * prev1 - 4 * prev2;
      prev2 = prev1;
      prev1 = iterative;
    }
    const closed = (1 + n) * Math.pow(2, n);
    const match = iterative === closed ? "✓" : "✗";
    console.log(`${String(n).padStart(5)}${String(iterative).padStart(15)}${String(closed).padStart(15)}${match.padStart(8)}`);
  }
}

solveFibonacci(15);
solveTowerOfHanoi(10);
solveCharacteristic(10);
solveRepeatedRoot(10);
```

## Summary of Solution Methods

| Recurrence Type | Method | Solution Form |
|----------------|--------|---------------|
| $a_n = ca_{n-1}$ | Direct | $a_n = c^n a_0$ |
| $a_n = ca_{n-1} + d$ | Iteration / fixed point | $a_n = c^n a_0 + d\frac{c^n-1}{c-1}$ |
| $a_n = c_1 a_{n-1} + c_2 a_{n-2}$ (distinct roots) | Characteristic equation | $A r_1^n + B r_2^n$ |
| $a_n = c_1 a_{n-1} + c_2 a_{n-2}$ (repeated root) | Characteristic equation | $(A + Bn) r^n$ |
| $T(n) = aT(n/b) + f(n)$ | Master Theorem | Depends on case |

## Connections to Other Topics

- **Generating functions** (Lesson 30) provide an alternative approach: encode the recurrence as a power series and solve algebraically.
- **Divide-and-conquer algorithms** naturally produce recurrences analyzed by the Master Theorem.
- **Dynamic programming** is fundamentally about computing recurrences bottom-up, trading recursion for iteration.
- **Linear algebra**: matrix exponentiation solves linear recurrences in $O(\log n)$ time — represent $\begin{pmatrix} a_n \\ a_{n-1} \end{pmatrix} = M^{n-1} \begin{pmatrix} a_1 \\ a_0 \end{pmatrix}$.

## Key Takeaways

- A **recurrence relation** defines a sequence recursively; solving it means finding a **closed-form** expression for the $n$-th term.
- **First-order linear** recurrences $a_n = ca_{n-1} + d$ are solved by iteration (unrolling) to get $a_n = c^n a_0 + d(c^n - 1)/(c - 1)$.
- **Second-order homogeneous** recurrences are solved via the **characteristic equation** $r^2 - c_1 r - c_2 = 0$.
- **Distinct roots** $r_1, r_2$ give $a_n = Ar_1^n + Br_2^n$; **repeated root** $r$ gives $a_n = (A + Bn)r^n$.
- **Binet's formula** $F_n = (\phi^n - \psi^n)/\sqrt{5}$ is the closed form for Fibonacci, derived by solving its characteristic equation.
- **Non-homogeneous** recurrences require finding a **particular solution** in addition to the homogeneous solution.
- **Iterative computation** is simple and avoids numerical precision issues of closed forms for large $n$; closed forms give insight into **growth rates**.
- Recurrences connect to generating functions, dynamic programming, and matrix exponentiation — all fundamental tools in computer science.
