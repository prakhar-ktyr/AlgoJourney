---
title: Pigeonhole Principle
---

# Pigeonhole Principle

The **Pigeonhole Principle** is one of the simplest yet most powerful tools in combinatorics. Despite its elementary statement, it leads to elegant proofs of surprising results that would be difficult to establish by other means.

## The Basic Principle

> If you place $n + 1$ items into $n$ boxes, then at least one box must contain **at least 2 items**.

This seems almost too obvious to be useful, yet it forms the backbone of many non-trivial mathematical arguments.

### Formal Statement

If $f: A \to B$ is a function where $|A| > |B|$, then $f$ is **not injective** — there exist distinct elements $a_1, a_2 \in A$ such that $f(a_1) = f(a_2)$.

### Simple Examples

- **Socks in a drawer**: If you have 10 pairs of socks (10 colors) and pull out 11 socks in the dark, you are **guaranteed** to have at least one matching pair.
- **People in a city**: In any city with more than 365 people (ignoring leap years), at least two people share the same birthday.
- **Hair count**: The average human head has about 150,000 hairs. Since there are more people in most cities than 150,000, at least two people in the city have the **exact same number of hairs**.

## The Generalized Pigeonhole Principle

The basic principle extends naturally to a more powerful form.

> If $N$ items are placed into $k$ boxes, then at least one box contains **at least** $\lceil N/k \rceil$ items.

Here $\lceil x \rceil$ denotes the ceiling function — the smallest integer greater than or equal to $x$.

### Proof

Suppose, for contradiction, that every box contains fewer than $\lceil N/k \rceil$ items. Then every box contains at most $\lceil N/k \rceil - 1$ items. The total number of items would be at most:

$$k \cdot (\lceil N/k \rceil - 1) < k \cdot \frac{N}{k} = N$$

This contradicts the fact that there are $N$ items total. $\blacksquare$

### Examples of the Generalized Form

- If 50 students take an exam scored 0–10, at least $\lceil 50/11 \rceil = 5$ students received the **same score**.
- If you draw 5 cards from a standard 52-card deck, at least $\lceil 5/4 \rceil = 2$ cards are of the **same suit**.
- Among any 27 English words, at least $\lceil 27/26 \rceil = 2$ must start with the **same letter**.

## Classic Problems

### The Birthday Paradox

The "birthday paradox" asks: how many people do you need in a room before there's a greater than 50% chance that two share a birthday?

The answer — just **23** — surprises most people. While the pigeonhole principle guarantees a match with 366 people, probability makes it likely much sooner.

The probability that all $n$ people have **different** birthdays is:

$$P(\text{all different}) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdots \frac{365 - n + 1}{365}$$

$$P(\text{all different}) = \prod_{i=0}^{n-1} \frac{365 - i}{365}$$

The probability of **at least one** shared birthday is:

$$P(\text{match}) = 1 - \prod_{i=0}^{n-1} \frac{365 - i}{365}$$

For $n = 23$, this exceeds 0.5.

### Handshakes at a Party

**Theorem**: At any party with $n \geq 2$ people, at least two people have shaken the same number of hands.

**Proof**: Each person can shake between 0 and $n-1$ hands. That gives $n$ possible values. But if someone shook 0 hands (shook nobody's hand), then nobody could have shaken $n-1$ hands (everyone's hand). So the actual number of distinct possible values is at most $n-1$. By pigeonhole, with $n$ people and at most $n-1$ possible handshake counts, at least two people share the same count. $\blacksquare$

### Monotone Subsequences

**Theorem (Erdős–Szekeres)**: Any sequence of more than $mn$ distinct numbers contains either an increasing subsequence of length $m+1$ or a decreasing subsequence of length $n+1$.

This elegant result follows from the pigeonhole principle applied to pairs of "longest increasing" and "longest decreasing" subsequence lengths.

## Applications in Computer Science

### Hashing Collisions

In hash tables, if we have $n$ keys and a hash table of size $m$ where $n > m$, the pigeonhole principle **guarantees** at least one collision — two distinct keys mapping to the same bucket.

This is why collision resolution (chaining, open addressing) is not optional but **necessary** in hash table design.

### Data Compression Limits

**No lossless compression algorithm can compress every possible input.** If inputs are $n$-bit strings ($2^n$ possible inputs) and we try to compress all of them to fewer than $n$ bits (at most $2^n - 1$ possible outputs), the pigeonhole principle guarantees that two different inputs would map to the same compressed output — making decompression ambiguous.

### The Subset Sum Guarantee

Given any set of $n+1$ integers from $\{1, 2, \ldots, 2n\}$, there must exist two numbers in the set where one divides the other.

**Proof**: Write each number as $2^k \cdot m$ where $m$ is odd. The odd parts $m$ come from $\{1, 3, 5, \ldots, 2n-1\}$, which has only $n$ elements. By pigeonhole, two of our $n+1$ numbers share the same odd part, so one divides the other. $\blacksquare$

## Elegant Proofs Using Pigeonhole

### Lattice Points

**Theorem**: Among any 5 lattice points (integer coordinates) in the plane, at least two have a midpoint that is also a lattice point.

**Proof**: Each coordinate is either even or odd. So each point has a parity pair $(x \bmod 2, y \bmod 2)$. There are only $2 \times 2 = 4$ possible parity pairs. Among 5 points, two share the same parity pair. Their midpoint has integer coordinates. $\blacksquare$

### Divisibility

**Theorem**: For any $n$ positive integers, there exists a non-empty subset whose sum is divisible by $n$.

**Proof**: Let the integers be $a_1, a_2, \ldots, a_n$. Consider the $n$ prefix sums:

$$S_k = a_1 + a_2 + \cdots + a_k \quad (k = 1, 2, \ldots, n)$$

If any $S_k \equiv 0 \pmod{n}$, we're done. Otherwise, the $n$ prefix sums take values in $\{1, 2, \ldots, n-1\}$ (only $n-1$ possible remainders). By pigeonhole, two prefix sums share the same remainder: $S_i \equiv S_j \pmod{n}$ with $i < j$. Then $S_j - S_i = a_{i+1} + \cdots + a_j \equiv 0 \pmod{n}$. $\blacksquare$

## Code: Birthday Paradox Probability

Let's compute the probability of a birthday collision for different group sizes and verify with simulation.

```cpp
#include <iostream>
#include <iomanip>
#include <random>
#include <vector>
using namespace std;

// Analytical probability of at least one shared birthday
double birthdayProbability(int n) {
    double probAllDifferent = 1.0;
    for (int i = 0; i < n; i++) {
        probAllDifferent *= (365.0 - i) / 365.0;
    }
    return 1.0 - probAllDifferent;
}

// Monte Carlo simulation
double birthdaySimulation(int n, int trials) {
    mt19937 rng(42);
    uniform_int_distribution<int> dist(0, 364);
    int matches = 0;

    for (int t = 0; t < trials; t++) {
        vector<bool> seen(365, false);
        bool found = false;
        for (int i = 0; i < n; i++) {
            int day = dist(rng);
            if (seen[day]) { found = true; break; }
            seen[day] = true;
        }
        if (found) matches++;
    }
    return (double)matches / trials;
}

int main() {
    cout << fixed << setprecision(4);
    cout << "n\tAnalytical\tSimulated" << endl;
    int groupSizes[] = {5, 10, 15, 20, 23, 30, 40, 50, 57, 70};
    for (int n : groupSizes) {
        double analytical = birthdayProbability(n);
        double simulated = birthdaySimulation(n, 100000);
        cout << n << "\t" << analytical << "\t\t" << simulated << endl;
    }
    return 0;
}
```

```csharp
using System;

class PigeonholeBirthday
{
    static double BirthdayProbability(int n)
    {
        double probAllDifferent = 1.0;
        for (int i = 0; i < n; i++)
        {
            probAllDifferent *= (365.0 - i) / 365.0;
        }
        return 1.0 - probAllDifferent;
    }

    static double BirthdaySimulation(int n, int trials)
    {
        Random rng = new Random(42);
        int matches = 0;

        for (int t = 0; t < trials; t++)
        {
            bool[] seen = new bool[365];
            bool found = false;
            for (int i = 0; i < n; i++)
            {
                int day = rng.Next(365);
                if (seen[day]) { found = true; break; }
                seen[day] = true;
            }
            if (found) matches++;
        }
        return (double)matches / trials;
    }

    static void Main()
    {
        Console.WriteLine("n\tAnalytical\tSimulated");
        int[] groupSizes = { 5, 10, 15, 20, 23, 30, 40, 50, 57, 70 };
        foreach (int n in groupSizes)
        {
            double analytical = BirthdayProbability(n);
            double simulated = BirthdaySimulation(n, 100000);
            Console.WriteLine($"{n}\t{analytical:F4}\t\t{simulated:F4}");
        }
    }
}
```

```java
import java.util.Random;

public class PigeonholeBirthday {
    static double birthdayProbability(int n) {
        double probAllDifferent = 1.0;
        for (int i = 0; i < n; i++) {
            probAllDifferent *= (365.0 - i) / 365.0;
        }
        return 1.0 - probAllDifferent;
    }

    static double birthdaySimulation(int n, int trials) {
        Random rng = new Random(42);
        int matches = 0;

        for (int t = 0; t < trials; t++) {
            boolean[] seen = new boolean[365];
            boolean found = false;
            for (int i = 0; i < n; i++) {
                int day = rng.nextInt(365);
                if (seen[day]) { found = true; break; }
                seen[day] = true;
            }
            if (found) matches++;
        }
        return (double) matches / trials;
    }

    public static void main(String[] args) {
        System.out.println("n\tAnalytical\tSimulated");
        int[] groupSizes = {5, 10, 15, 20, 23, 30, 40, 50, 57, 70};
        for (int n : groupSizes) {
            double analytical = birthdayProbability(n);
            double simulated = birthdaySimulation(n, 100000);
            System.out.printf("%d\t%.4f\t\t%.4f%n", n, analytical, simulated);
        }
    }
}
```

```python
import random
import math

def birthday_probability(n):
    """Analytical probability of at least one shared birthday in group of n."""
    prob_all_different = 1.0
    for i in range(n):
        prob_all_different *= (365 - i) / 365
    return 1 - prob_all_different

def birthday_simulation(n, trials=100000):
    """Monte Carlo simulation of birthday paradox."""
    random.seed(42)
    matches = 0
    for _ in range(trials):
        seen = set()
        found = False
        for _ in range(n):
            day = random.randint(0, 364)
            if day in seen:
                found = True
                break
            seen.add(day)
        if found:
            matches += 1
    return matches / trials

def find_threshold(target=0.5):
    """Find smallest n where P(match) >= target."""
    for n in range(1, 366):
        if birthday_probability(n) >= target:
            return n
    return 366

print(f"Smallest n for P >= 0.5: {find_threshold(0.5)}")
print(f"Smallest n for P >= 0.99: {find_threshold(0.99)}")
print()
print(f"{'n':<5}{'Analytical':<15}{'Simulated':<15}")
print("-" * 35)
for n in [5, 10, 15, 20, 23, 30, 40, 50, 57, 70]:
    analytical = birthday_probability(n)
    simulated = birthday_simulation(n)
    print(f"{n:<5}{analytical:<15.4f}{simulated:<15.4f}")
```

```javascript
function birthdayProbability(n) {
  let probAllDifferent = 1.0;
  for (let i = 0; i < n; i++) {
    probAllDifferent *= (365 - i) / 365;
  }
  return 1 - probAllDifferent;
}

function birthdaySimulation(n, trials = 100000) {
  // Simple seeded pseudo-random (mulberry32)
  let seed = 42;
  function random() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  let matches = 0;
  for (let t = 0; t < trials; t++) {
    const seen = new Set();
    let found = false;
    for (let i = 0; i < n; i++) {
      const day = Math.floor(random() * 365);
      if (seen.has(day)) { found = true; break; }
      seen.add(day);
    }
    if (found) matches++;
  }
  return matches / trials;
}

console.log("n\tAnalytical\tSimulated");
const groupSizes = [5, 10, 15, 20, 23, 30, 40, 50, 57, 70];
for (const n of groupSizes) {
  const analytical = birthdayProbability(n).toFixed(4);
  const simulated = birthdaySimulation(n).toFixed(4);
  console.log(`${n}\t${analytical}\t\t${simulated}`);
}
```

## When to Use the Pigeonhole Principle

The pigeonhole principle is your go-to tool when:

1. **You need to prove existence** — that something *must* exist without finding it explicitly.
2. **The number of objects exceeds the number of categories** — look for a natural way to classify objects into fewer categories.
3. **You want to show a collision or repetition** is unavoidable.
4. **You're analyzing worst-case scenarios** in algorithms or data structures.

### Problem-Solving Strategy

1. **Identify the pigeons** (items being distributed).
2. **Identify the holes** (categories or containers).
3. **Count** to verify pigeons > holes.
4. **Conclude** that some hole has multiple pigeons.

The hardest part is often identifying the right "holes" — the creative choice of categories that makes the proof work.

## Key Takeaways

- The **Pigeonhole Principle** states that if $n+1$ items are placed in $n$ containers, at least one container holds $\geq 2$ items.
- The **Generalized form** says $N$ items in $k$ boxes guarantees some box has $\geq \lceil N/k \rceil$ items.
- It proves **existence** without construction — we know a collision exists but may not find it efficiently.
- **Birthday paradox**: only 23 people needed for a >50% chance of a shared birthday; the pigeonhole guarantee kicks in at 366.
- **CS applications**: hash collisions are unavoidable, lossless compression cannot shrink all inputs, and many impossibility results follow directly.
- The **art** of pigeonhole proofs lies in choosing the right "boxes" — the creative classification that makes the counting argument work.
- Combined with modular arithmetic, parity, or geometry, the pigeonhole principle yields deep results from simple counting.
