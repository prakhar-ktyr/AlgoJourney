---
title: Probability Fundamentals
---

# Probability Fundamentals

Probability is the **mathematics of uncertainty**. It quantifies the likelihood of events occurring and forms the foundation of statistics, machine learning, and data science.

---

## What Is Probability?

Probability measures how likely an event is to happen, expressed as a number between 0 and 1:

$$P(A) = \frac{\text{number of favorable outcomes}}{\text{total number of possible outcomes}}$$

```python
# Probability of rolling a 4 on a fair die
favorable = 1  # only one face shows 4
total = 6      # six faces total
p_four = favorable / total
print(f"P(rolling 4) = {p_four:.4f}")  # 0.1667
```

---

## Basic Rules of Probability

Every probability must satisfy these axioms:

1. **Non-negativity:** $0 \leq P(A) \leq 1$
2. **Certainty:** $P(\text{certain event}) = 1$
3. **Impossibility:** $P(\text{impossible event}) = 0$
4. **All outcomes:** $P(\text{sample space}) = 1$

```python
# Verify: probabilities of all die faces sum to 1
probs = [1/6] * 6
print(f"Sum of all probs: {sum(probs)}")  # 1.0
```

---

## Types of Probability

| Type | Description | Example |
|------|-------------|---------|
| **Theoretical** | Based on known structure | Fair coin: P(heads) = 0.5 |
| **Empirical** | Based on observed data | Flip 1000 times, count heads |
| **Subjective** | Based on expert judgment | "70% chance of rain tomorrow" |

```python
import numpy as np

# Empirical probability: simulate coin flips
np.random.seed(42)
flips = np.random.choice(["H", "T"], size=10000)
empirical_p_heads = np.sum(flips == "H") / len(flips)
print(f"Empirical P(Heads) = {empirical_p_heads:.4f}")  # ~0.5
```

---

## Complement Rule

The probability that event A does **NOT** happen:

$$P(A') = 1 - P(A)$$

```python
# Probability of NOT rolling a 6
p_six = 1/6
p_not_six = 1 - p_six
print(f"P(not 6) = {p_not_six:.4f}")  # 0.8333
```

**Useful trick:** When "at least one" problems are hard, compute the complement.

```python
# P(at least one 6 in 4 rolls)
p_no_six_in_4 = (5/6) ** 4
p_at_least_one_6 = 1 - p_no_six_in_4
print(f"P(at least one 6 in 4 rolls) = {p_at_least_one_6:.4f}")  # 0.5177
```

---

## Union (OR) — Addition Rule

The probability that A **or** B (or both) occurs:

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

We subtract $P(A \cap B)$ to avoid double-counting.

```python
# Drawing a card: P(King OR Heart)
p_king = 4/52
p_heart = 13/52
p_king_and_heart = 1/52  # King of Hearts

p_king_or_heart = p_king + p_heart - p_king_and_heart
print(f"P(King or Heart) = {p_king_or_heart:.4f}")  # 0.3077 = 16/52
```

---

## Mutually Exclusive Events

Events that **cannot happen at the same time**: $P(A \cap B) = 0$

For mutually exclusive events, the addition rule simplifies:

$$P(A \cup B) = P(A) + P(B)$$

```python
# Rolling a die: P(getting 2 OR 5)
# Can't get both at once — mutually exclusive
p_2_or_5 = 1/6 + 1/6
print(f"P(2 or 5) = {p_2_or_5:.4f}")  # 0.3333
```

---

## Intersection (AND)

The probability that **both** A and B occur: $P(A \cap B)$

### Independent Events

If events don't affect each other: $P(A \cap B) = P(A) \cdot P(B)$

```python
# Two fair coins: P(both heads)
p_both_heads = 0.5 * 0.5
print(f"P(both heads) = {p_both_heads}")  # 0.25

# Die roll AND coin flip: P(6 AND heads)
p_6_and_heads = (1/6) * (1/2)
print(f"P(6 and heads) = {p_6_and_heads:.4f}")  # 0.0833
```

### Dependent Events

If A affects B: $P(A \cap B) = P(A) \cdot P(B|A)$

```python
# Drawing 2 aces without replacement
p_first_ace = 4/52
p_second_ace_given_first = 3/51
p_two_aces = p_first_ace * p_second_ace_given_first
print(f"P(two aces) = {p_two_aces:.4f}")  # 0.0045
```

---

## Conditional Probability

The probability of A **given that** B has occurred:

$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

```python
# 100 students: 40 study math, 30 study science, 10 study both
# P(studies math | studies science)
p_math_and_science = 10/100
p_science = 30/100
p_math_given_science = p_math_and_science / p_science
print(f"P(Math | Science) = {p_math_given_science:.4f}")  # 0.3333
```

---

## Bayes' Theorem

Bayes' theorem lets you **reverse** conditional probabilities:

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

### Example: Medical Test Accuracy

A disease affects 1% of the population. A test has:
- **Sensitivity** (true positive rate): P(positive | disease) = 0.99
- **Specificity** (true negative rate): P(negative | no disease) = 0.95

If you test positive, what's P(disease | positive)?

```python
# Bayes' theorem: medical test
p_disease = 0.01
p_no_disease = 0.99
p_pos_given_disease = 0.99       # sensitivity
p_pos_given_no_disease = 0.05    # false positive rate (1 - specificity)

# P(positive) using law of total probability
p_positive = (p_pos_given_disease * p_disease) + (p_pos_given_no_disease * p_no_disease)

# Bayes' theorem
p_disease_given_pos = (p_pos_given_disease * p_disease) / p_positive
print(f"P(Disease | Positive Test) = {p_disease_given_pos:.4f}")  # ~0.167

# Surprising! Even with 99% sensitivity, only 16.7% chance of disease
# This is because the disease is rare (1% base rate)
```

**Key insight:** Base rates matter enormously in Bayesian reasoning.

---

## Expected Value

The **expected value** (mean) of a random variable:

$$E[X] = \sum_{i} x_i \cdot P(x_i)$$

```python
# Expected value of a fair die
outcomes = [1, 2, 3, 4, 5, 6]
probabilities = [1/6] * 6
expected_value = sum(x * p for x, p in zip(outcomes, probabilities))
print(f"E[die roll] = {expected_value:.4f}")  # 3.5

# Expected winnings: lottery ticket costs $1
# Win $100 with P=0.01, win $10 with P=0.05, lose with P=0.94
winnings = [100, 10, -1]
probs = [0.01, 0.05, 0.94]
ev = sum(w * p for w, p in zip(winnings, probs))
print(f"Expected profit per ticket: ${ev:.2f}")  # $0.56
```

---

## Variance of a Random Variable

$$\text{Var}(X) = E[(X - \mu)^2] = E[X^2] - (E[X])^2$$

```python
# Variance of a die roll
mu = 3.5
variance = sum((x - mu)**2 * (1/6) for x in range(1, 7))
print(f"Var(die) = {variance:.4f}")  # 2.9167
print(f"Std(die) = {variance**0.5:.4f}")  # 1.7078
```

---

## Law of Large Numbers

As you repeat an experiment more times, the empirical probability **converges** to the theoretical probability.

```python
import matplotlib.pyplot as plt

np.random.seed(42)
n_flips = 10000
flips = np.random.choice([0, 1], size=n_flips)  # 0=Tails, 1=Heads

# Running proportion of heads
running_prop = np.cumsum(flips) / np.arange(1, n_flips + 1)

plt.figure(figsize=(10, 4))
plt.plot(running_prop, linewidth=0.8)
plt.axhline(y=0.5, color="red", linestyle="--", label="True P(Heads) = 0.5")
plt.xlabel("Number of Flips")
plt.ylabel("Proportion of Heads")
plt.title("Law of Large Numbers: Coin Flips")
plt.legend()
plt.xscale("log")
plt.show()
```

---

## Permutations and Combinations

### Permutations (Order Matters)

The number of ways to arrange $r$ items from $n$:

$$P(n, r) = \frac{n!}{(n-r)!}$$

```python
from math import factorial, comb, perm

# How many ways to arrange 3 books from 5?
n, r = 5, 3
permutations = perm(n, r)
print(f"P(5,3) = {permutations}")  # 60

# Manual calculation
manual = factorial(5) // factorial(5 - 3)
print(f"Manual: {manual}")  # 60
```

### Combinations (Order Doesn't Matter)

The number of ways to **choose** $r$ items from $n$:

$$C(n, r) = \binom{n}{r} = \frac{n!}{r!(n-r)!}$$

```python
# How many ways to choose 3 team members from 10?
n, r = 10, 3
combinations = comb(n, r)
print(f"C(10,3) = {combinations}")  # 120

# Lottery: choose 6 from 49
lottery = comb(49, 6)
print(f"Lottery combinations: {lottery:,}")  # 13,983,816
print(f"P(winning) = 1/{lottery:,} = {1/lottery:.10f}")
```

---

## Simulation: Monty Hall Problem

Behind 3 doors: 1 car, 2 goats. You pick a door, host opens a goat door. Should you switch?

```python
import numpy as np

def monty_hall_simulation(n_games=100000, switch=True):
    """Simulate the Monty Hall problem."""
    np.random.seed(42)
    wins = 0

    for _ in range(n_games):
        # Car is behind a random door (0, 1, or 2)
        car = np.random.randint(0, 3)
        # Player picks a random door
        choice = np.random.randint(0, 3)

        # Host opens a door with a goat (not player's choice, not car)
        # If player switches, they win if original choice was wrong
        if switch:
            wins += (choice != car)
        else:
            wins += (choice == car)

    return wins / n_games

p_stay = monty_hall_simulation(switch=False)
p_switch = monty_hall_simulation(switch=True)

print(f"P(win | stay)   = {p_stay:.4f}")   # ~0.333
print(f"P(win | switch) = {p_switch:.4f}")  # ~0.667
print("You should ALWAYS switch!")
```

---

## Simulation: Dice Probabilities

```python
# Simulate: P(sum of 2 dice = 7)
np.random.seed(42)
n_rolls = 100000
die1 = np.random.randint(1, 7, size=n_rolls)
die2 = np.random.randint(1, 7, size=n_rolls)
sums = die1 + die2

p_sum_7 = np.sum(sums == 7) / n_rolls
print(f"Simulated P(sum=7) = {p_sum_7:.4f}")   # ~0.1667
print(f"Theoretical P(sum=7) = {6/36:.4f}")     # 0.1667

# Distribution of all sums
from collections import Counter
sum_counts = Counter(sums)
for s in sorted(sum_counts):
    print(f"  Sum={s:2d}: P={sum_counts[s]/n_rolls:.4f}")
```

---

## Birthday Problem

What's the probability that in a group of $n$ people, at least two share a birthday?

```python
def birthday_probability(n):
    """Exact probability of a shared birthday in group of n."""
    p_no_match = 1.0
    for i in range(1, n):
        p_no_match *= (365 - i) / 365
    return 1 - p_no_match

# Find where P > 50%
for n in [10, 20, 23, 30, 50, 70]:
    print(f"n={n:2d}: P(shared birthday) = {birthday_probability(n):.4f}")

# n=23 → ~50.7% (counterintuitive!)
```

---

## Try It Yourself

1. Simulate 10,000 coin flips and verify P(heads) ≈ 0.5.
2. Calculate P(at least one 6 in 10 dice rolls) using the complement rule.
3. Implement Bayes' theorem for a spam filter.
4. Simulate the birthday problem and find the threshold.

---

## Summary

| Concept | Formula |
|---------|---------|
| Probability | $P(A) = \text{favorable} / \text{total}$ |
| Complement | $P(A') = 1 - P(A)$ |
| Union (OR) | $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ |
| Independent AND | $P(A \cap B) = P(A) \cdot P(B)$ |
| Conditional | $P(A|B) = P(A \cap B) / P(B)$ |
| Bayes | $P(A|B) = P(B|A) \cdot P(A) / P(B)$ |
| Expected value | $E[X] = \sum x_i \cdot P(x_i)$ |
| Permutations | $P(n,r) = n! / (n-r)!$ |
| Combinations | $C(n,r) = n! / [r!(n-r)!]$ |

**Key takeaway:** Probability is the language of uncertainty — master it to understand statistics, machine learning, and decision-making under uncertainty.

---
