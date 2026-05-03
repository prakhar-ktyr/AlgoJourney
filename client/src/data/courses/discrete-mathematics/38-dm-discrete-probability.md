---
title: Discrete Probability Basics
---

# Discrete Probability Basics

Probability is essential in computer science — from analyzing randomized algorithms to understanding expected running times, from cryptography to machine learning. This lesson covers the foundations of discrete probability, where outcomes are countable.

## Sample Space and Events

### Sample Space

The **sample space** $S$ (or $\Omega$) is the set of all possible outcomes of an experiment.

**Examples**:
- Rolling a die: $S = \{1, 2, 3, 4, 5, 6\}$
- Flipping two coins: $S = \{HH, HT, TH, TT\}$
- Drawing a card: $S = \{A\spadesuit, 2\spadesuit, \ldots, K\heartsuit\}$, $|S| = 52$

### Events

An **event** $E$ is a subset of the sample space: $E \subseteq S$.

**Examples**:
- Rolling an even number: $E = \{2, 4, 6\}$
- Getting at least one head: $E = \{HH, HT, TH\}$

### Outcomes

An **outcome** (or elementary event) is a single element of $S$. An event occurs if the actual outcome belongs to that event.

## Probability for Uniform Distributions

When all outcomes are equally likely (uniform distribution):

$$P(E) = \frac{|E|}{|S|}$$

This is the counting definition — the probability of event $E$ is the fraction of outcomes favorable to $E$.

**Example**: Probability of rolling a number $> 4$:

$$P(\{5, 6\}) = \frac{2}{6} = \frac{1}{3}$$

### Properties of Probability

For any event $E$:
1. $0 \leq P(E) \leq 1$
2. $P(S) = 1$ (something must happen)
3. $P(\emptyset) = 0$ (impossible event)

## Addition Rule

For two events $A$ and $B$:

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

This is the **inclusion-exclusion principle** for probability.

**Special case** — if $A$ and $B$ are **mutually exclusive** ($A \cap B = \emptyset$):

$$P(A \cup B) = P(A) + P(B)$$

**Example**: Rolling a die. Let $A$ = "even" = $\{2,4,6\}$, $B$ = "greater than 4" = $\{5,6\}$.

$$P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{3}{6} + \frac{2}{6} - \frac{1}{6} = \frac{4}{6} = \frac{2}{3}$$

(The events $A$ and $B$ share outcome $\{6\}$.)

## Complement Rule

The **complement** $\bar{E}$ (or $E^c$) is everything not in $E$:

$$P(\bar{E}) = 1 - P(E)$$

This is extremely useful when it's easier to count what you *don't* want.

**Example**: Probability that at least two people in a group of 23 share a birthday.

Direct counting is hard, but the complement (all different) is:

$$P(\text{all different}) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdots \frac{343}{365} \approx 0.493$$

So $P(\text{at least one match}) \approx 1 - 0.493 = 0.507 > 50\%$!

This is the famous **Birthday Paradox**.

## Conditional Probability

The probability of $A$ **given that** $B$ has occurred:

$$P(A|B) = \frac{P(A \cap B)}{P(B)}, \quad P(B) > 0$$

We restrict our attention to the "world" where $B$ happened, then ask how likely $A$ is within that world.

**Example**: Roll a die. What's the probability it's a 6, given it's even?

- $A = \{6\}$, $B = \{2,4,6\}$
- $P(A \cap B) = P(\{6\}) = 1/6$
- $P(B) = 3/6 = 1/2$
- $P(A|B) = \frac{1/6}{1/2} = \frac{1}{3}$

### Multiplication Rule

From the definition of conditional probability:

$$P(A \cap B) = P(A|B) \cdot P(B) = P(B|A) \cdot P(A)$$

**Example**: Draw two cards without replacement. Probability both are aces:

$$P(\text{both aces}) = P(\text{1st ace}) \cdot P(\text{2nd ace} | \text{1st ace}) = \frac{4}{52} \cdot \frac{3}{51} = \frac{12}{2652} = \frac{1}{221}$$

## Independence

Events $A$ and $B$ are **independent** if knowing one gives no information about the other:

$$P(A \cap B) = P(A) \cdot P(B)$$

Equivalently: $P(A|B) = P(A)$ and $P(B|A) = P(B)$.

**Example**: Flip two fair coins. $A$ = "first is heads", $B$ = "second is heads".

$$P(A) = 1/2, \quad P(B) = 1/2, \quad P(A \cap B) = P(\{HH\}) = 1/4 = P(A) \cdot P(B)$$

Independent ✓

**Caution**: Independence is NOT the same as mutual exclusivity!
- Mutually exclusive events with nonzero probability are always **dependent** (if one happens, the other can't).

### Independence of Multiple Events

Events $A_1, A_2, \ldots, A_n$ are **mutually independent** if for every subset $I \subseteq \{1, \ldots, n\}$:

$$P\left(\bigcap_{i \in I} A_i\right) = \prod_{i \in I} P(A_i)$$

## Law of Total Probability

If $B_1, B_2, \ldots, B_n$ partition $S$ (mutually exclusive and exhaustive), then for any event $A$:

$$P(A) = \sum_{i=1}^{n} P(A|B_i) \cdot P(B_i)$$

This lets us compute $P(A)$ by splitting into cases.

**Example**: A factory has 3 machines. Machine 1 produces 50% of items (2% defective), Machine 2 produces 30% (3% defective), Machine 3 produces 20% (5% defective). Probability an item is defective:

$$P(D) = 0.02(0.5) + 0.03(0.3) + 0.05(0.2) = 0.01 + 0.009 + 0.01 = 0.029$$

## Bayes' Theorem

Bayes' theorem "reverses" conditional probability:

$$P(B|A) = \frac{P(A|B) \cdot P(B)}{P(A)}$$

Using the law of total probability in the denominator:

$$P(B_j|A) = \frac{P(A|B_j) \cdot P(B_j)}{\sum_{i=1}^{n} P(A|B_i) \cdot P(B_i)}$$

**Example** (continuing the factory example): Given an item is defective, what's the probability it came from Machine 3?

$$P(M_3|D) = \frac{P(D|M_3) \cdot P(M_3)}{P(D)} = \frac{0.05 \times 0.2}{0.029} = \frac{0.01}{0.029} \approx 0.345$$

Even though Machine 3 produces only 20% of items, it's responsible for about 34.5% of defectives because of its higher defect rate.

## Random Variables

A **random variable** $X$ is a function $X: S \to \mathbb{R}$ that assigns a numerical value to each outcome.

**Example**: Roll two dice. Let $X$ = sum of the two dice. Then $X$ can take values $2, 3, \ldots, 12$.

### Probability Mass Function (PMF)

$$P(X = x) = P(\{s \in S : X(s) = x\})$$

**Example**: For two dice, $P(X = 7) = 6/36 = 1/6$ (outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)).

## Expected Value

The **expected value** (mean) of a discrete random variable:

$$E[X] = \sum_{x} x \cdot P(X = x) = \sum_{i} x_i P(x_i)$$

This is the "average" outcome weighted by probability.

**Example**: Expected value of a fair die roll:

$$E[X] = 1 \cdot \frac{1}{6} + 2 \cdot \frac{1}{6} + 3 \cdot \frac{1}{6} + 4 \cdot \frac{1}{6} + 5 \cdot \frac{1}{6} + 6 \cdot \frac{1}{6} = \frac{21}{6} = 3.5$$

### Linearity of Expectation

For any random variables $X$ and $Y$ (even if dependent!):

$$E[X + Y] = E[X] + E[Y]$$
$$E[aX + b] = aE[X] + b$$

This is incredibly powerful. **Example**: Expected number of heads in $n$ fair coin flips.

Let $X_i = 1$ if flip $i$ is heads, $0$ otherwise. Then $X = X_1 + \cdots + X_n$.

$$E[X] = E[X_1] + \cdots + E[X_n] = n \cdot \frac{1}{2} = \frac{n}{2}$$

No need to compute the full distribution!

### Expected Value in Algorithm Analysis

- **Quicksort**: Expected comparisons = $2n \ln n \approx 1.39 n \log_2 n$
- **Randomized selection**: Expected $O(n)$ comparisons
- **Hash table lookup**: Expected $O(1)$ with good hash function

## Variance

The **variance** measures how spread out a distribution is:

$$\text{Var}(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2$$

The second form is often easier to compute.

**Standard deviation**: $\sigma = \sqrt{\text{Var}(X)}$

**Example**: Variance of a fair die roll.

$$E[X^2] = 1^2 \cdot \frac{1}{6} + 2^2 \cdot \frac{1}{6} + \cdots + 6^2 \cdot \frac{1}{6} = \frac{91}{6}$$

$$\text{Var}(X) = \frac{91}{6} - \left(\frac{7}{2}\right)^2 = \frac{91}{6} - \frac{49}{4} = \frac{182 - 147}{12} = \frac{35}{12} \approx 2.917$$

### Properties of Variance

- $\text{Var}(aX + b) = a^2 \text{Var}(X)$ (constants shift don't affect spread)
- If $X$ and $Y$ are **independent**: $\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y)$
- Variance is always non-negative: $\text{Var}(X) \geq 0$

## Common Discrete Distributions

| Distribution | PMF | $E[X]$ | $\text{Var}(X)$ |
|---|---|---|---|
| Bernoulli($p$) | $P(1)=p, P(0)=1-p$ | $p$ | $p(1-p)$ |
| Binomial($n,p$) | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Geometric($p$) | $(1-p)^{k-1}p$ | $1/p$ | $(1-p)/p^2$ |
| Uniform($\{1,\ldots,n\}$) | $1/n$ | $(n+1)/2$ | $(n^2-1)/12$ |

## Code: Simulate Probability Experiments

```cpp
#include <iostream>
#include <random>
#include <map>
#include <iomanip>
using namespace std;

int main() {
    mt19937 rng(42);
    int trials = 100000;

    // Experiment 1: Sum of two dice
    cout << "=== Sum of Two Dice ===" << endl;
    map<int, int> sumCounts;
    for (int t = 0; t < trials; t++) {
        int d1 = (rng() % 6) + 1;
        int d2 = (rng() % 6) + 1;
        sumCounts[d1 + d2]++;
    }
    cout << "Sum | Simulated | Theoretical" << endl;
    for (int s = 2; s <= 12; s++) {
        double simulated = (double)sumCounts[s] / trials;
        int ways = (s <= 7) ? (s - 1) : (13 - s);
        double theoretical = ways / 36.0;
        cout << setw(3) << s << " | " << fixed << setprecision(4)
             << simulated << "    | " << theoretical << endl;
    }

    // Experiment 2: Birthday paradox
    cout << "\n=== Birthday Paradox ===" << endl;
    for (int groupSize : {10, 20, 23, 30, 50}) {
        int matches = 0;
        for (int t = 0; t < trials; t++) {
            bool seen[365] = {false};
            bool found = false;
            for (int i = 0; i < groupSize && !found; i++) {
                int bday = rng() % 365;
                if (seen[bday]) found = true;
                seen[bday] = true;
            }
            if (found) matches++;
        }
        double simulated = (double)matches / trials;
        cout << "  Group size " << groupSize << ": P(match) = "
             << fixed << setprecision(4) << simulated << endl;
    }

    // Experiment 3: Expected value and variance of die roll
    cout << "\n=== Die Roll Statistics ===" << endl;
    double sum = 0, sumSq = 0;
    for (int t = 0; t < trials; t++) {
        int roll = (rng() % 6) + 1;
        sum += roll;
        sumSq += roll * roll;
    }
    double mean = sum / trials;
    double variance = sumSq / trials - mean * mean;
    cout << "  Simulated E[X] = " << fixed << setprecision(4) << mean
         << " (theoretical: 3.5)" << endl;
    cout << "  Simulated Var(X) = " << variance
         << " (theoretical: 2.9167)" << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class DiscreteProbability
{
    static Random rng = new Random(42);

    static void Main()
    {
        int trials = 100000;

        // Experiment 1: Sum of two dice
        Console.WriteLine("=== Sum of Two Dice ===");
        int[] sumCounts = new int[13];
        for (int t = 0; t < trials; t++)
        {
            int d1 = rng.Next(1, 7);
            int d2 = rng.Next(1, 7);
            sumCounts[d1 + d2]++;
        }
        Console.WriteLine("Sum | Simulated | Theoretical");
        for (int s = 2; s <= 12; s++)
        {
            double simulated = (double)sumCounts[s] / trials;
            int ways = (s <= 7) ? (s - 1) : (13 - s);
            double theoretical = ways / 36.0;
            Console.WriteLine($" {s,2} | {simulated:F4}    | {theoretical:F4}");
        }

        // Experiment 2: Birthday paradox
        Console.WriteLine("\n=== Birthday Paradox ===");
        int[] groupSizes = { 10, 20, 23, 30, 50 };
        foreach (int groupSize in groupSizes)
        {
            int matches = 0;
            for (int t = 0; t < trials; t++)
            {
                HashSet<int> seen = new HashSet<int>();
                bool found = false;
                for (int i = 0; i < groupSize && !found; i++)
                {
                    int bday = rng.Next(365);
                    if (seen.Contains(bday)) found = true;
                    seen.Add(bday);
                }
                if (found) matches++;
            }
            double simulated = (double)matches / trials;
            Console.WriteLine($"  Group size {groupSize}: P(match) = {simulated:F4}");
        }

        // Experiment 3: Conditional probability simulation
        Console.WriteLine("\n=== Conditional Probability ===");
        Console.WriteLine("  P(sum=8 | first die=3):");
        int conditionMet = 0, eventAndCondition = 0;
        for (int t = 0; t < trials; t++)
        {
            int d1 = rng.Next(1, 7);
            int d2 = rng.Next(1, 7);
            if (d1 == 3)
            {
                conditionMet++;
                if (d1 + d2 == 8) eventAndCondition++;
            }
        }
        double condProb = (double)eventAndCondition / conditionMet;
        Console.WriteLine($"  Simulated: {condProb:F4} (theoretical: {1.0 / 6:F4})");
    }
}
```

```java
import java.util.*;

public class DiscreteProbability {
    static Random rng = new Random(42);

    public static void main(String[] args) {
        int trials = 100000;

        // Experiment 1: Sum of two dice
        System.out.println("=== Sum of Two Dice ===");
        int[] sumCounts = new int[13];
        for (int t = 0; t < trials; t++) {
            int d1 = rng.nextInt(6) + 1;
            int d2 = rng.nextInt(6) + 1;
            sumCounts[d1 + d2]++;
        }
        System.out.println("Sum | Simulated | Theoretical");
        for (int s = 2; s <= 12; s++) {
            double simulated = (double) sumCounts[s] / trials;
            int ways = (s <= 7) ? (s - 1) : (13 - s);
            double theoretical = ways / 36.0;
            System.out.printf(" %2d | %.4f    | %.4f%n", s, simulated, theoretical);
        }

        // Experiment 2: Birthday paradox
        System.out.println("\n=== Birthday Paradox ===");
        int[] groupSizes = {10, 20, 23, 30, 50};
        for (int groupSize : groupSizes) {
            int matches = 0;
            for (int t = 0; t < trials; t++) {
                Set<Integer> seen = new HashSet<>();
                boolean found = false;
                for (int i = 0; i < groupSize && !found; i++) {
                    int bday = rng.nextInt(365);
                    if (seen.contains(bday)) found = true;
                    seen.add(bday);
                }
                if (found) matches++;
            }
            double simulated = (double) matches / trials;
            System.out.printf("  Group size %d: P(match) = %.4f%n", groupSize, simulated);
        }

        // Experiment 3: Bayes' theorem simulation (factory example)
        System.out.println("\n=== Bayes' Theorem (Factory) ===");
        int[] fromMachine = new int[4]; // 1-indexed
        int[] defectiveFrom = new int[4];
        int totalDefective = 0;
        for (int t = 0; t < trials; t++) {
            double r = rng.nextDouble();
            int machine;
            double defectRate;
            if (r < 0.5) { machine = 1; defectRate = 0.02; }
            else if (r < 0.8) { machine = 2; defectRate = 0.03; }
            else { machine = 3; defectRate = 0.05; }
            fromMachine[machine]++;
            if (rng.nextDouble() < defectRate) {
                defectiveFrom[machine]++;
                totalDefective++;
            }
        }
        System.out.printf("  P(M3|Defective) = %.4f (theoretical: 0.3448)%n",
            (double) defectiveFrom[3] / totalDefective);
    }
}
```

```python
import random
from collections import Counter

random.seed(42)
trials = 100000

# Experiment 1: Sum of two dice
print("=== Sum of Two Dice ===")
sums = [random.randint(1, 6) + random.randint(1, 6) for _ in range(trials)]
counts = Counter(sums)
print("Sum | Simulated | Theoretical")
for s in range(2, 13):
    simulated = counts[s] / trials
    ways = (s - 1) if s <= 7 else (13 - s)
    theoretical = ways / 36
    print(f" {s:2d} | {simulated:.4f}    | {theoretical:.4f}")

# Experiment 2: Birthday paradox
print("\n=== Birthday Paradox ===")
for group_size in [10, 20, 23, 30, 50]:
    matches = 0
    for _ in range(trials):
        birthdays = set()
        found = False
        for _ in range(group_size):
            bday = random.randint(0, 364)
            if bday in birthdays:
                found = True
                break
            birthdays.add(bday)
        if found:
            matches += 1
    print(f"  Group size {group_size}: P(match) = {matches / trials:.4f}")

# Experiment 3: Expected value and variance
print("\n=== Die Roll Statistics ===")
rolls = [random.randint(1, 6) for _ in range(trials)]
mean = sum(rolls) / trials
variance = sum(r**2 for r in rolls) / trials - mean**2
print(f"  Simulated E[X] = {mean:.4f} (theoretical: 3.5)")
print(f"  Simulated Var(X) = {variance:.4f} (theoretical: 2.9167)")

# Experiment 4: Geometric distribution - expected flips to first heads
print("\n=== Geometric Distribution ===")
total_flips = 0
for _ in range(trials):
    flips = 0
    while True:
        flips += 1
        if random.random() < 0.5:
            break
    total_flips += flips
print(f"  Simulated E[flips to heads] = {total_flips / trials:.4f} (theoretical: 2.0)")
```

```javascript
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(42);
const trials = 100000;

// Helper: random int in [min, max]
function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Experiment 1: Sum of two dice
console.log("=== Sum of Two Dice ===");
const sumCounts = new Array(13).fill(0);
for (let t = 0; t < trials; t++) {
  sumCounts[randInt(1, 6) + randInt(1, 6)]++;
}
console.log("Sum | Simulated | Theoretical");
for (let s = 2; s <= 12; s++) {
  const simulated = sumCounts[s] / trials;
  const ways = s <= 7 ? s - 1 : 13 - s;
  const theoretical = ways / 36;
  console.log(` ${String(s).padStart(2)} | ${simulated.toFixed(4)}    | ${theoretical.toFixed(4)}`);
}

// Experiment 2: Birthday paradox
console.log("\n=== Birthday Paradox ===");
for (const groupSize of [10, 20, 23, 30, 50]) {
  let matches = 0;
  for (let t = 0; t < trials; t++) {
    const seen = new Set();
    let found = false;
    for (let i = 0; i < groupSize && !found; i++) {
      const bday = Math.floor(random() * 365);
      if (seen.has(bday)) found = true;
      seen.add(bday);
    }
    if (found) matches++;
  }
  console.log(`  Group size ${groupSize}: P(match) = ${(matches / trials).toFixed(4)}`);
}

// Experiment 3: Expected value and variance
console.log("\n=== Die Roll Statistics ===");
let sum = 0, sumSq = 0;
for (let t = 0; t < trials; t++) {
  const roll = randInt(1, 6);
  sum += roll;
  sumSq += roll * roll;
}
const mean = sum / trials;
const variance = sumSq / trials - mean * mean;
console.log(`  Simulated E[X] = ${mean.toFixed(4)} (theoretical: 3.5)`);
console.log(`  Simulated Var(X) = ${variance.toFixed(4)} (theoretical: 2.9167)`);

// Experiment 4: Linearity of expectation - sum of 10 dice
console.log("\n=== Linearity of Expectation (sum of 10 dice) ===");
let totalSum = 0;
for (let t = 0; t < trials; t++) {
  let s = 0;
  for (let i = 0; i < 10; i++) s += randInt(1, 6);
  totalSum += s;
}
console.log(`  Simulated E[10 dice] = ${(totalSum / trials).toFixed(4)} (theoretical: 35.0)`);
```

## Practice Problems

1. Two cards are drawn without replacement. Find $P(\text{both red})$.
2. A test has 95% sensitivity and 99% specificity. If 1% of the population has the disease, find $P(\text{disease} | \text{positive test})$ using Bayes' theorem.
3. Let $X$ be the number of heads in 5 fair coin flips. Find $E[X]$ and $\text{Var}(X)$.
4. In the coupon collector problem with $n=10$ types, compute the expected number of draws.
5. Show that $\text{Var}(X) = E[X^2] - (E[X])^2$ starting from the definition.

## Key Takeaways

- **Sample space** $S$ lists all possible outcomes; an **event** is a subset of $S$.
- For uniform distributions: $P(E) = |E|/|S|$ — probability reduces to counting.
- **Complement rule** ($P(\bar{E}) = 1 - P(E)$) is your best friend when direct counting is hard.
- **Conditional probability** $P(A|B) = P(A \cap B)/P(B)$ restricts the sample space.
- **Independence** means $P(A \cap B) = P(A) \cdot P(B)$ — knowing one event tells you nothing about the other.
- **Bayes' theorem** reverses conditioning: from $P(\text{evidence}|\text{cause})$ to $P(\text{cause}|\text{evidence})$.
- **Expected value** is linear regardless of dependence: $E[X+Y] = E[X] + E[Y]$ always.
- **Variance** measures spread: $\text{Var}(X) = E[X^2] - (E[X])^2$; it adds for independent variables.
- Simulation validates theory — run experiments with enough trials and observe convergence to theoretical values.
