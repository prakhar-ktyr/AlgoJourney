---
title: Probability Distributions
---

# Probability Distributions

A probability distribution describes **how the values of a random variable are spread out**. It tells you which outcomes are likely and which are rare.

---

## What Is a Distribution?

A distribution maps every possible outcome to its probability:

- **Discrete:** countable outcomes (dice rolls, counts)
- **Continuous:** any value in a range (height, temperature)

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
```

---

## Discrete Distributions

### Bernoulli Distribution

A **single trial** with two outcomes: success (1) or failure (0).

$$P(X = 1) = p, \quad P(X = 0) = 1 - p$$

```python
# Bernoulli: single coin flip (p = 0.5)
p = 0.5
bernoulli = stats.bernoulli(p)

print(f"P(X=1) = {bernoulli.pmf(1)}")  # 0.5
print(f"P(X=0) = {bernoulli.pmf(0)}")  # 0.5
print(f"Mean = {bernoulli.mean()}")     # 0.5
print(f"Var  = {bernoulli.var()}")      # 0.25

# Simulate
samples = bernoulli.rvs(size=1000)
print(f"Simulated P(success) = {samples.mean():.3f}")
```

---

### Binomial Distribution

The number of successes in $n$ **independent** trials, each with probability $p$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

- **Mean:** $\mu = np$
- **Variance:** $\sigma^2 = np(1-p)$

```python
# Binomial: 10 coin flips, P(exactly 7 heads)
n, p = 10, 0.5
binom = stats.binom(n, p)

print(f"P(X=7) = {binom.pmf(7):.4f}")          # 0.1172
print(f"P(X<=3) = {binom.cdf(3):.4f}")         # 0.1719
print(f"P(X>=8) = {1 - binom.cdf(7):.4f}")     # 0.0547
print(f"Mean = {binom.mean()}, Var = {binom.var()}")

# Plot the distribution
x = np.arange(0, n + 1)
plt.figure(figsize=(8, 4))
plt.bar(x, binom.pmf(x), color="steelblue", edgecolor="black")
plt.xlabel("Number of Successes (k)")
plt.ylabel("P(X = k)")
plt.title(f"Binomial Distribution (n={n}, p={p})")
plt.xticks(x)
plt.show()
```

**Real-world example:** Number of defective items in a batch of 100 (quality control).

---

### Poisson Distribution

Counts the number of events in a **fixed interval** (time, area, volume):

$$P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

Where $\lambda$ is the average rate of events.

- **Mean:** $\mu = \lambda$
- **Variance:** $\sigma^2 = \lambda$

```python
# Poisson: a call center gets 5 calls per hour on average
lam = 5
poisson = stats.poisson(lam)

print(f"P(exactly 3 calls) = {poisson.pmf(3):.4f}")   # 0.1404
print(f"P(0 calls) = {poisson.pmf(0):.4f}")           # 0.0067
print(f"P(more than 8) = {1 - poisson.cdf(8):.4f}")   # 0.0681

# Plot
x = np.arange(0, 15)
plt.figure(figsize=(8, 4))
plt.bar(x, poisson.pmf(x), color="coral", edgecolor="black")
plt.xlabel("Number of Events (k)")
plt.ylabel("P(X = k)")
plt.title(f"Poisson Distribution (λ={lam})")
plt.xticks(x)
plt.show()
```

**Real-world examples:** Emails per hour, car accidents per month, mutations per DNA strand.

---

## Continuous Distributions

### Uniform Distribution

**Equal probability** for all values in the interval $[a, b]$:

$$f(x) = \frac{1}{b - a}, \quad a \leq x \leq b$$

- **Mean:** $\mu = \frac{a + b}{2}$
- **Variance:** $\sigma^2 = \frac{(b-a)^2}{12}$

```python
# Uniform: random number between 0 and 10
a, b = 0, 10
uniform = stats.uniform(loc=a, scale=b - a)

print(f"P(3 < X < 7) = {uniform.cdf(7) - uniform.cdf(3):.4f}")  # 0.4
print(f"Mean = {uniform.mean()}")  # 5.0
print(f"Var = {uniform.var():.4f}")  # 8.3333

# Plot
x = np.linspace(-1, 11, 1000)
plt.figure(figsize=(8, 4))
plt.plot(x, uniform.pdf(x), "b-", linewidth=2)
plt.fill_between(x, uniform.pdf(x), alpha=0.3)
plt.xlabel("x")
plt.ylabel("f(x)")
plt.title("Uniform Distribution [0, 10]")
plt.show()
```

---

### Normal (Gaussian) Distribution

The most important distribution in statistics — the **bell curve**:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

```python
# Normal: IQ scores (mean=100, std=15)
mu, sigma = 100, 15
normal = stats.norm(mu, sigma)

print(f"P(IQ < 130) = {normal.cdf(130):.4f}")        # 0.9772
print(f"P(IQ > 130) = {1 - normal.cdf(130):.4f}")    # 0.0228
print(f"P(85 < IQ < 115) = {normal.cdf(115) - normal.cdf(85):.4f}")  # 0.6827
```

### The 68-95-99.7 Rule (Empirical Rule)

For any normal distribution:

| Range | Probability |
|-------|------------|
| $\mu \pm 1\sigma$ | 68.27% |
| $\mu \pm 2\sigma$ | 95.45% |
| $\mu \pm 3\sigma$ | 99.73% |

```python
# Verify the empirical rule
for k in [1, 2, 3]:
    prob = normal.cdf(mu + k*sigma) - normal.cdf(mu - k*sigma)
    print(f"P(μ ± {k}σ) = {prob:.4f} ({prob*100:.2f}%)")

# Plot
x = np.linspace(mu - 4*sigma, mu + 4*sigma, 1000)
plt.figure(figsize=(10, 5))
plt.plot(x, normal.pdf(x), "b-", linewidth=2)
plt.fill_between(x, normal.pdf(x), where=(x >= mu-sigma) & (x <= mu+sigma),
                 alpha=0.3, label="68%")
plt.fill_between(x, normal.pdf(x), where=(x >= mu-2*sigma) & (x <= mu+2*sigma),
                 alpha=0.2, label="95%")
plt.axvline(mu, color="red", linestyle="--")
plt.xlabel("IQ Score")
plt.ylabel("Probability Density")
plt.title("Normal Distribution: IQ Scores")
plt.legend()
plt.show()
```

### Standard Normal (Z-Score)

Convert any normal variable to the **standard normal** ($\mu=0$, $\sigma=1$):

$$Z = \frac{X - \mu}{\sigma}$$

```python
# What percentile is an IQ of 120?
z_score = (120 - 100) / 15
print(f"Z-score for IQ=120: {z_score:.2f}")  # 1.33
print(f"Percentile: {stats.norm.cdf(z_score)*100:.1f}%")  # 90.8%

# What IQ is the 95th percentile?
z_95 = stats.norm.ppf(0.95)
iq_95 = mu + z_95 * sigma
print(f"95th percentile IQ: {iq_95:.1f}")  # 124.7
```

---

### Exponential Distribution

Models the **time between** events in a Poisson process:

$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

- **Mean:** $1/\lambda$
- **Variance:** $1/\lambda^2$
- **Memoryless property:** past doesn't affect future

```python
# Exponential: average 5 minutes between customers
lam = 1/5  # rate parameter (events per minute)
exponential = stats.expon(scale=1/lam)  # scipy uses scale = 1/lambda

print(f"P(wait > 10 min) = {1 - exponential.cdf(10):.4f}")  # 0.1353
print(f"P(wait < 3 min) = {exponential.cdf(3):.4f}")        # 0.4512
print(f"Mean wait = {exponential.mean():.1f} min")           # 5.0

# Plot
x = np.linspace(0, 25, 1000)
plt.figure(figsize=(8, 4))
plt.plot(x, exponential.pdf(x), "g-", linewidth=2)
plt.fill_between(x, exponential.pdf(x), alpha=0.3)
plt.xlabel("Time (minutes)")
plt.ylabel("Probability Density")
plt.title("Exponential Distribution (mean=5 min)")
plt.show()
```

---

## Central Limit Theorem (CLT)

The **most important theorem** in statistics:

> If you take sufficiently large random samples from **any** population and compute the sample mean, those sample means will be approximately **normally distributed** — regardless of the original distribution.

$$\bar{X} \sim N\left(\mu, \frac{\sigma^2}{n}\right) \text{ as } n \to \infty$$

```python
# CLT demonstration: exponential distribution (very skewed!)
np.random.seed(42)
population = stats.expon(scale=5)  # skewed population

sample_sizes = [1, 5, 30, 100]
fig, axes = plt.subplots(1, 4, figsize=(16, 4))

for idx, n in enumerate(sample_sizes):
    # Take 10,000 samples of size n, compute means
    sample_means = [population.rvs(size=n).mean() for _ in range(10000)]

    axes[idx].hist(sample_means, bins=40, density=True, alpha=0.7, edgecolor="black")
    axes[idx].set_title(f"n = {n}")
    axes[idx].set_xlabel("Sample Mean")

plt.suptitle("Central Limit Theorem: Sample Means Become Normal", fontsize=13)
plt.tight_layout()
plt.show()
```

**Key takeaways:**
- Works for **any** distribution (uniform, exponential, bimodal...)
- $n \geq 30$ is the common rule of thumb
- Larger $n$ → tighter distribution of means (smaller standard error)
- Standard error: $SE = \sigma / \sqrt{n}$

```python
# Standard error shrinks with sample size
sigma = 5
for n in [10, 30, 100, 1000]:
    se = sigma / np.sqrt(n)
    print(f"n={n:4d}: SE = {se:.4f}")
```

---

## Using scipy.stats

All distributions in `scipy.stats` share the same interface:

| Method | Description | Example |
|--------|-------------|---------|
| `.pmf(k)` | Probability mass function (discrete) | P(X = k) |
| `.pdf(x)` | Probability density function (continuous) | f(x) |
| `.cdf(x)` | Cumulative distribution function | P(X ≤ x) |
| `.ppf(q)` | Percent point function (inverse CDF) | Value at percentile q |
| `.rvs(size)` | Random variates (samples) | Generate data |
| `.mean()` | Expected value | — |
| `.var()` | Variance | — |
| `.std()` | Standard deviation | — |

```python
# Example: Normal distribution
norm = stats.norm(loc=50, scale=10)

print(f"PDF at x=50: {norm.pdf(50):.4f}")
print(f"CDF at x=60: {norm.cdf(60):.4f}")      # P(X <= 60)
print(f"PPF at q=0.95: {norm.ppf(0.95):.4f}")  # 95th percentile
print(f"5 random samples: {norm.rvs(size=5)}")
```

---

## QQ Plot: Is My Data Normal?

A **Quantile-Quantile (QQ) plot** compares your data's distribution against a theoretical distribution. If points fall on the diagonal line, your data matches that distribution.

```python
# Generate data and check normality
np.random.seed(42)
normal_data = np.random.normal(50, 10, 500)
skewed_data = np.random.exponential(10, 500)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# QQ plot for normal data
stats.probplot(normal_data, dist="norm", plot=axes[0])
axes[0].set_title("QQ Plot: Normal Data")

# QQ plot for skewed data
stats.probplot(skewed_data, dist="norm", plot=axes[1])
axes[1].set_title("QQ Plot: Skewed Data")

plt.tight_layout()
plt.show()
```

**Reading a QQ plot:**
- Points on the line → data matches the distribution
- Curved up at ends → heavier tails (leptokurtic)
- S-shape → skewness

---

## Comparing Multiple Distributions

```python
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
x_disc = np.arange(0, 20)
x_cont = np.linspace(-4, 10, 1000)

# Discrete distributions
axes[0, 0].bar(x_disc, stats.bernoulli(0.6).pmf(x_disc[:2].tolist() + [0]*18))
axes[0, 0].bar([0, 1], [0.4, 0.6], color="steelblue", edgecolor="black")
axes[0, 0].set_title("Bernoulli (p=0.6)")

axes[0, 1].bar(x_disc, stats.binom(15, 0.4).pmf(x_disc), color="coral", edgecolor="black")
axes[0, 1].set_title("Binomial (n=15, p=0.4)")

axes[0, 2].bar(x_disc, stats.poisson(5).pmf(x_disc), color="green", edgecolor="black")
axes[0, 2].set_title("Poisson (λ=5)")

# Continuous distributions
axes[1, 0].plot(x_cont, stats.uniform(0, 5).pdf(x_cont), linewidth=2)
axes[1, 0].set_title("Uniform [0, 5]")

axes[1, 1].plot(x_cont, stats.norm(3, 1).pdf(x_cont), linewidth=2)
axes[1, 1].set_title("Normal (μ=3, σ=1)")

x_exp = np.linspace(0, 10, 1000)
axes[1, 2].plot(x_exp, stats.expon(scale=2).pdf(x_exp), linewidth=2)
axes[1, 2].set_title("Exponential (λ=0.5)")

plt.tight_layout()
plt.show()
```

---

## Choosing the Right Distribution

| Scenario | Distribution |
|----------|-------------|
| Yes/No outcome, single trial | Bernoulli |
| Count of successes in n trials | Binomial |
| Count of events in fixed time/space | Poisson |
| Equal chance in a range | Uniform |
| Natural measurements, means | Normal |
| Time between events | Exponential |

---

## Try It Yourself

1. Generate 1000 samples from a Binomial(20, 0.3) and plot the histogram.
2. Use `ppf()` to find what value separates the top 5% of a normal distribution.
3. Demonstrate the CLT using a uniform distribution — show sample means becoming normal.
4. Make a QQ plot of your data and decide if it's normal.

---

## Summary

| Distribution | Type | Key Parameter | Use Case |
|-------------|------|--------------|----------|
| Bernoulli | Discrete | p | Single trial |
| Binomial | Discrete | n, p | Fixed trials, count successes |
| Poisson | Discrete | λ | Count events in interval |
| Uniform | Continuous | a, b | Equal probability range |
| Normal | Continuous | μ, σ | Most natural phenomena |
| Exponential | Continuous | λ | Time between events |

**Key takeaway:** The Central Limit Theorem explains why the normal distribution appears everywhere — sample means always tend toward normality, no matter what the underlying population looks like.

---
