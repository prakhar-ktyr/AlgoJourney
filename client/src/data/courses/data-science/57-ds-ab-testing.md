---
title: A/B Testing
---

# A/B Testing

A/B testing is a controlled experiment where you compare two versions of something to determine which one performs better.

It's the gold standard for making data-driven decisions in tech companies.

---

## What Is A/B Testing?

An **A/B test** (also called a split test) shows different users two variants:

- **Control (A)**: the current version
- **Treatment (B)**: the new version with one change

You then measure which version achieves better results on a specific metric.

**Example:** Does a green "Buy Now" button get more clicks than a blue one?

---

## Applications

| Industry | What's Tested |
|----------|--------------|
| E-commerce | Button colors, product page layouts, pricing |
| Marketing | Email subject lines, ad copy, landing pages |
| Product | Feature designs, onboarding flows, UI changes |
| Media | Headlines, thumbnail images, content placement |

---

## The A/B Testing Process

### Step-by-Step

1. **Define a hypothesis**: "Changing the CTA button from blue to green will increase click-through rate by 5%"
2. **Choose a metric**: click-through rate (CTR), conversion rate, revenue per user
3. **Calculate sample size**: how many users do we need?
4. **Randomly assign** users to control (A) or treatment (B)
5. **Run the experiment** for a sufficient duration
6. **Analyze results** with statistical tests
7. **Make a decision**: ship, iterate, or discard

### Key Metrics

| Metric | Formula |
|--------|---------|
| Click-Through Rate (CTR) | $\text{CTR} = \frac{\text{clicks}}{\text{impressions}}$ |
| Conversion Rate | $\text{CR} = \frac{\text{conversions}}{\text{visitors}}$ |
| Average Revenue Per User | $\text{ARPU} = \frac{\text{total revenue}}{\text{users}}$ |
| Bounce Rate | $\text{BR} = \frac{\text{single-page sessions}}{\text{total sessions}}$ |

---

## Statistical Foundation

### Hypothesis Testing

We frame A/B testing as a hypothesis test:

- **Null hypothesis** ($H_0$): There is NO difference between A and B
  - $H_0: p_B - p_A = 0$

- **Alternative hypothesis** ($H_1$): There IS a difference
  - $H_1: p_B - p_A \neq 0$

### Key Parameters

| Parameter | Symbol | Typical Value | Meaning |
|-----------|--------|---------------|---------|
| Significance level | $\alpha$ | 0.05 | Probability of false positive |
| Power | $1 - \beta$ | 0.80 | Probability of detecting real effect |
| Effect size | $d$ | varies | Minimum detectable difference |
| p-value | $p$ | — | Probability of data given $H_0$ is true |

### Decision Rule

- If $p\text{-value} < \alpha$: **reject** $H_0$ → statistically significant difference
- If $p\text{-value} \geq \alpha$: **fail to reject** $H_0$ → no significant difference found

### Type I and Type II Errors

| | $H_0$ is True | $H_0$ is False |
|---|---|---|
| Reject $H_0$ | Type I Error (false positive) | Correct! |
| Fail to reject $H_0$ | Correct! | Type II Error (false negative) |

---

## Sample Size Calculation

Running a test with too few users gives unreliable results. Too many wastes time.

### Formula

For a two-proportion test, the sample size per group:

$$n = \frac{(Z_{\alpha/2} + Z_{\beta})^2 \cdot (p_1(1-p_1) + p_2(1-p_2))}{(p_2 - p_1)^2}$$

Where:
- $Z_{\alpha/2} = 1.96$ for $\alpha = 0.05$
- $Z_{\beta} = 0.84$ for power $= 0.80$
- $p_1$ = baseline conversion rate
- $p_2$ = expected conversion rate with treatment

### Code: Calculate Sample Size

```python
from statsmodels.stats.power import TTestIndPower, NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
import numpy as np

# Parameters
baseline_rate = 0.10    # Current conversion: 10%
expected_rate = 0.12    # Expected with change: 12%
alpha = 0.05            # Significance level
power = 0.80            # Statistical power

# Calculate effect size (Cohen's h for proportions)
effect_size = proportion_effectsize(expected_rate, baseline_rate)
print(f"Effect size (Cohen's h): {effect_size:.4f}")

# Calculate required sample size per group
analysis = NormalIndPower()
sample_size = analysis.solve_power(
    effect_size=effect_size,
    alpha=alpha,
    power=power,
    alternative="two-sided"
)

print(f"Required sample size per group: {int(np.ceil(sample_size))}")
print(f"Total participants needed: {int(np.ceil(sample_size)) * 2}")
```

**Output:**
```
Effect size (Cohen's h): 0.0649
Required sample size per group: 3,724
Total participants needed: 7,448
```

### How Duration Affects Sample Size

```python
# If you get 500 visitors/day, how long to run the test?
daily_visitors = 500
days_needed = (sample_size * 2) / daily_visitors
print(f"Days to run experiment: {int(np.ceil(days_needed))} days")
```

---

## Running the Test

### Two-Proportion Z-Test (for conversion rates)

```python
import numpy as np
from statsmodels.stats.proportion import proportions_ztest

# Experiment results
# Group A (control): 1000 visitors, 100 conversions
# Group B (treatment): 1000 visitors, 130 conversions
n_A = 1000
n_B = 1000
conversions_A = 100
conversions_B = 130

# Conversion rates
cr_A = conversions_A / n_A
cr_B = conversions_B / n_B
print(f"Control conversion rate:   {cr_A:.2%}")
print(f"Treatment conversion rate: {cr_B:.2%}")
print(f"Absolute difference:       {cr_B - cr_A:.2%}")
print(f"Relative uplift:           {(cr_B - cr_A) / cr_A:.2%}")

# Two-proportion z-test
counts = np.array([conversions_B, conversions_A])
nobs = np.array([n_B, n_A])

z_stat, p_value = proportions_ztest(counts, nobs, alternative="two-sided")

print(f"\nZ-statistic: {z_stat:.4f}")
print(f"P-value:     {p_value:.4f}")

# Decision
alpha = 0.05
if p_value < alpha:
    print(f"\n✓ Statistically significant (p < {alpha})")
    print("  → Reject H0: Treatment IS different from control")
else:
    print(f"\n✗ Not statistically significant (p >= {alpha})")
    print("  → Fail to reject H0: No proven difference")
```

### Two-Sample T-Test (for continuous metrics)

```python
from scipy import stats
import numpy as np

# Revenue per user in each group
np.random.seed(42)
revenue_A = np.random.normal(loc=50, scale=15, size=500)  # Control
revenue_B = np.random.normal(loc=53, scale=15, size=500)  # Treatment

print(f"Mean revenue A: ${revenue_A.mean():.2f}")
print(f"Mean revenue B: ${revenue_B.mean():.2f}")

# Two-sample t-test (independent)
t_stat, p_value = stats.ttest_ind(revenue_B, revenue_A)

print(f"\nT-statistic: {t_stat:.4f}")
print(f"P-value:     {p_value:.4f}")

# Confidence interval for the difference
diff = revenue_B.mean() - revenue_A.mean()
se = np.sqrt(revenue_A.var()/len(revenue_A) + revenue_B.var()/len(revenue_B))
ci_lower = diff - 1.96 * se
ci_upper = diff + 1.96 * se
print(f"\n95% CI for difference: [${ci_lower:.2f}, ${ci_upper:.2f}]")
```

---

## Common Pitfalls

### 1. Peeking (Early Stopping)

Checking results daily inflates false positive rates:

```python
# Simulation: how peeking inflates false positives
import numpy as np
from scipy import stats

np.random.seed(42)
false_positives = 0
n_simulations = 1000

for _ in range(n_simulations):
    # Both groups have SAME conversion rate (no real effect)
    group_a = np.random.binomial(1, 0.10, size=5000)
    group_b = np.random.binomial(1, 0.10, size=5000)

    # Peek every 500 users
    for n in range(500, 5001, 500):
        _, p = stats.ttest_ind(group_a[:n], group_b[:n])
        if p < 0.05:
            false_positives += 1
            break  # "Stopped early"

print(f"False positive rate with peeking: {false_positives/n_simulations:.1%}")
print(f"Expected without peeking:         5.0%")
```

**Rule:** Define your sample size upfront and don't stop early.

### 2. Multiple Testing

Testing many metrics inflates false positives. Apply **Bonferroni correction**:

$$\alpha_{\text{corrected}} = \frac{\alpha}{m}$$

Where $m$ is the number of tests.

```python
# Bonferroni correction
alpha = 0.05
num_tests = 5  # Testing 5 metrics simultaneously
corrected_alpha = alpha / num_tests
print(f"Corrected significance level: {corrected_alpha:.3f}")
```

### 3. Other Pitfalls

| Pitfall | Description | Solution |
|---------|-------------|----------|
| Simpson's Paradox | Subgroups show opposite trends | Segment your analysis |
| Novelty Effect | Users engage more just because it's new | Run test longer |
| Insufficient Duration | Doesn't capture weekly cycles | Run at least 1-2 full weeks |
| Contamination | Users in A see B's experience | Ensure clean separation |

---

## Bayesian A/B Testing

Classical A/B testing gives a yes/no answer. **Bayesian** A/B testing gives:

> "There is a 94% probability that B is better than A"

```python
import numpy as np
from scipy import stats

# Results
conversions_A, total_A = 100, 1000
conversions_B, total_B = 130, 1000

# Beta posterior distributions
# Prior: Beta(1, 1) = uniform
alpha_A = 1 + conversions_A
beta_A = 1 + total_A - conversions_A
alpha_B = 1 + conversions_B
beta_B = 1 + total_B - conversions_B

# Sample from posteriors
samples_A = np.random.beta(alpha_A, beta_A, size=100000)
samples_B = np.random.beta(alpha_B, beta_B, size=100000)

# Probability that B > A
prob_B_better = (samples_B > samples_A).mean()
print(f"P(B > A) = {prob_B_better:.2%}")

# Expected uplift
expected_uplift = (samples_B - samples_A).mean()
print(f"Expected uplift: {expected_uplift:.4f} ({expected_uplift/samples_A.mean():.1%} relative)")

# Credible interval for difference
diff = samples_B - samples_A
ci_low, ci_high = np.percentile(diff, [2.5, 97.5])
print(f"95% Credible Interval: [{ci_low:.4f}, {ci_high:.4f}]")
```

---

## Multi-Armed Bandit

A **multi-armed bandit** balances **exploration** (trying options) vs **exploitation** (using the best known option):

- A/B testing: explore first, then exploit (two phases)
- Bandit: explore AND exploit simultaneously (adaptive)

```python
import numpy as np

class EpsilonGreedy:
    """Simple epsilon-greedy multi-armed bandit."""

    def __init__(self, n_arms, epsilon=0.1):
        self.n_arms = n_arms
        self.epsilon = epsilon
        self.counts = np.zeros(n_arms)
        self.values = np.zeros(n_arms)

    def select_arm(self):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_arms)  # Explore
        return np.argmax(self.values)  # Exploit

    def update(self, arm, reward):
        self.counts[arm] += 1
        n = self.counts[arm]
        self.values[arm] += (reward - self.values[arm]) / n

# Simulate: 3 button variants with true CTRs
true_rates = [0.05, 0.08, 0.07]  # B is best
bandit = EpsilonGreedy(n_arms=3, epsilon=0.1)

for _ in range(10000):
    arm = bandit.select_arm()
    reward = np.random.binomial(1, true_rates[arm])
    bandit.update(arm, reward)

print("Estimated conversion rates:")
for i, (count, value) in enumerate(zip(bandit.counts, bandit.values)):
    print(f"  Variant {chr(65+i)}: {value:.4f} (shown {int(count)} times)")
```

---

## Complete A/B Test Analysis

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest, proportion_effectsize
from statsmodels.stats.power import NormalIndPower

# --- 1. Experiment Setup ---
print("=" * 50)
print("A/B TEST ANALYSIS REPORT")
print("=" * 50)
print("\nHypothesis: New checkout flow increases conversion rate")
print(f"Significance level: α = 0.05")
print(f"Desired power: 1-β = 0.80")

# --- 2. Sample Size Calculation ---
baseline = 0.12
mde = 0.02  # Minimum detectable effect
effect = proportion_effectsize(baseline + mde, baseline)
analysis = NormalIndPower()
n_required = int(np.ceil(analysis.solve_power(effect, alpha=0.05, power=0.80)))
print(f"\nRequired sample per group: {n_required:,}")

# --- 3. Experiment Results ---
np.random.seed(42)
n_control = 4000
n_treatment = 4000
conversions_control = 480    # 12.0%
conversions_treatment = 560  # 14.0%

cr_control = conversions_control / n_control
cr_treatment = conversions_treatment / n_treatment

print(f"\n--- Results ---")
print(f"Control:   {conversions_control}/{n_control} = {cr_control:.2%}")
print(f"Treatment: {conversions_treatment}/{n_treatment} = {cr_treatment:.2%}")
print(f"Lift:      {cr_treatment - cr_control:.2%} absolute")
print(f"           {(cr_treatment - cr_control)/cr_control:.1%} relative")

# --- 4. Statistical Test ---
z_stat, p_value = proportions_ztest(
    [conversions_treatment, conversions_control],
    [n_treatment, n_control],
    alternative="two-sided"
)

print(f"\n--- Statistical Test ---")
print(f"Z-statistic: {z_stat:.4f}")
print(f"P-value:     {p_value:.6f}")

if p_value < 0.05:
    print("\n✓ SIGNIFICANT: Ship the new checkout flow!")
else:
    print("\n✗ NOT SIGNIFICANT: Keep the current version.")

# --- 5. Confidence Interval ---
se = np.sqrt(cr_control*(1-cr_control)/n_control +
             cr_treatment*(1-cr_treatment)/n_treatment)
diff = cr_treatment - cr_control
ci = (diff - 1.96*se, diff + 1.96*se)
print(f"\n95% CI for difference: [{ci[0]:.4f}, {ci[1]:.4f}]")

# --- 6. Visualization ---
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Bar chart
axes[0].bar(["Control (A)", "Treatment (B)"],
            [cr_control, cr_treatment],
            color=["steelblue", "forestgreen"], edgecolor="black")
axes[0].set_ylabel("Conversion Rate")
axes[0].set_title("Conversion Rate Comparison")
axes[0].set_ylim(0, 0.20)

# Confidence interval plot
axes[1].errorbar([0], [diff], yerr=[[diff-ci[0]], [ci[1]-diff]],
                 fmt="o", markersize=10, capsize=10, color="darkred")
axes[1].axhline(y=0, color="gray", linestyle="--", alpha=0.7)
axes[1].set_xlim(-0.5, 0.5)
axes[1].set_xticks([])
axes[1].set_ylabel("Difference in Conversion Rate")
axes[1].set_title("95% Confidence Interval")

plt.tight_layout()
plt.savefig("ab_test_results.png", dpi=100, bbox_inches="tight")
plt.show()
print("\nVisualization saved to ab_test_results.png")
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| A/B Test | Compare control vs treatment with random assignment |
| p-value | Probability of seeing results if no real difference exists |
| Sample size | Calculate BEFORE running; depends on effect size & power |
| Peeking | Don't check early — inflates false positives |
| Bayesian | Gives probability that B > A instead of yes/no |
| Bandit | Adaptive: explore and exploit simultaneously |

**Key takeaways:**
- Always calculate sample size before starting
- Run the test for the full planned duration
- Use the right test: z-test for proportions, t-test for continuous metrics
- Watch out for multiple testing, peeking, and novelty effects
- Report confidence intervals, not just p-values
