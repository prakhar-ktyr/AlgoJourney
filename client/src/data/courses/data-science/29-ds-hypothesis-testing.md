---
title: Hypothesis Testing
---

# Hypothesis Testing

Hypothesis testing is a **statistical method for making decisions from data**. It helps you determine whether an observed effect is real or just due to random chance.

---

## What Is Hypothesis Testing?

Imagine you're testing whether a new drug lowers blood pressure. You give the drug to a group and measure the change. But how do you know the change isn't just random variation?

Hypothesis testing provides a **framework to decide** — with a known error rate.

---

## The Two Hypotheses

Every test starts with two competing claims:

| Hypothesis | Symbol | Meaning |
|-----------|--------|---------|
| **Null hypothesis** | $H_0$ | No effect, no difference (status quo) |
| **Alternative hypothesis** | $H_1$ or $H_a$ | There IS an effect or difference |

**Examples:**

| Scenario | $H_0$ | $H_1$ |
|----------|--------|--------|
| New drug | Drug has no effect | Drug lowers blood pressure |
| A/B test | No difference in conversion | Version B has higher conversion |
| Quality | Machine produces correct weight | Machine is miscalibrated |

---

## The 5 Steps of Hypothesis Testing

1. **State** $H_0$ and $H_1$
2. **Choose** significance level $\alpha$ (usually 0.05)
3. **Collect** data and compute the test statistic
4. **Calculate** the p-value
5. **Decide**: reject $H_0$ if $p < \alpha$

```python
import numpy as np
from scipy import stats

# Example: Is the average height of students different from 170 cm?
# H0: μ = 170
# H1: μ ≠ 170

np.random.seed(42)
sample = np.random.normal(172, 8, size=50)  # sample of 50 students

# Step 3: Compute test statistic
t_stat, p_value = stats.ttest_1samp(sample, popmean=170)

# Step 5: Decision
alpha = 0.05
print(f"Sample mean: {sample.mean():.2f}")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Decision: {'Reject H0' if p_value < alpha else 'Fail to reject H0'}")
```

---

## Understanding the p-value

The **p-value** is the probability of observing data **as extreme or more extreme** than what you got, **assuming $H_0$ is true**.

- **Small p-value** (< 0.05): Data is unlikely under $H_0$ → reject $H_0$
- **Large p-value** (≥ 0.05): Data is consistent with $H_0$ → fail to reject

```python
# Visual: what does the p-value look like?
import matplotlib.pyplot as plt

x = np.linspace(-4, 4, 1000)
y = stats.norm.pdf(x)

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(x, y, "b-", linewidth=2)

# Shade the p-value region (two-tailed, t_stat = 2.1)
t_observed = 2.1
ax.fill_between(x, y, where=(x >= t_observed), alpha=0.4, color="red", label="p/2 (right)")
ax.fill_between(x, y, where=(x <= -t_observed), alpha=0.4, color="red", label="p/2 (left)")
ax.axvline(t_observed, color="red", linestyle="--")
ax.axvline(-t_observed, color="red", linestyle="--")
ax.set_title("p-value = shaded area (two-tailed test)")
ax.set_xlabel("Test Statistic")
ax.legend()
plt.show()
```

**Important:** p-value is NOT the probability that $H_0$ is true!

---

## Significance Level ($\alpha$)

The **significance level** $\alpha$ is your threshold for "extreme enough" to reject $H_0$.

| $\alpha$ | Meaning | Common Use |
|----------|---------|-----------|
| 0.05 | 5% chance of false rejection | Most research |
| 0.01 | 1% chance of false rejection | Medical, critical |
| 0.10 | 10% chance of false rejection | Exploratory |

You choose $\alpha$ **before** looking at the data.

---

## Type I and Type II Errors

| | $H_0$ is TRUE | $H_0$ is FALSE |
|--|------|------|
| **Reject $H_0$** | Type I Error (α) | Correct! (Power) |
| **Fail to reject $H_0$** | Correct! | Type II Error (β) |

### Type I Error (False Positive)

- Rejecting $H_0$ when it's actually true
- Probability = $\alpha$
- Example: Declaring a drug effective when it's not

### Type II Error (False Negative)

- Failing to reject $H_0$ when it's actually false
- Probability = $\beta$
- Example: Missing a real drug effect

### Power

$$\text{Power} = 1 - \beta$$

Power is the probability of correctly detecting a real effect. Higher power is better.

**Factors that increase power:**
- Larger sample size $n$
- Larger effect size
- Higher $\alpha$ (trade-off with Type I error)
- Lower variability

```python
# Power calculation example
from scipy.stats import norm

def calculate_power(n, effect_size, alpha=0.05, sigma=1):
    """Calculate power for a one-sample z-test."""
    z_alpha = norm.ppf(1 - alpha/2)  # two-tailed
    se = sigma / np.sqrt(n)
    z_power = effect_size / se - z_alpha
    power = norm.cdf(z_power)
    return power

# How power changes with sample size
for n in [10, 20, 30, 50, 100, 200]:
    pwr = calculate_power(n, effect_size=0.5)
    print(f"n={n:3d}: Power = {pwr:.4f}")
```

---

## Common Statistical Tests

### One-Sample t-test

Test if a sample mean differs from a known value.

$$t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}$$

```python
# Is the average delivery time different from 30 minutes?
np.random.seed(42)
delivery_times = np.random.normal(32, 5, size=40)

t_stat, p_value = stats.ttest_1samp(delivery_times, popmean=30)
print(f"Mean delivery time: {delivery_times.mean():.2f} min")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Significant: {p_value < 0.05}")
```

---

### Two-Sample t-test (Independent)

Compare means of **two independent groups**.

```python
# Do two classes have different test scores?
np.random.seed(42)
class_a = np.random.normal(75, 10, size=35)
class_b = np.random.normal(80, 12, size=40)

t_stat, p_value = stats.ttest_ind(class_a, class_b)
print(f"Class A mean: {class_a.mean():.2f}")
print(f"Class B mean: {class_b.mean():.2f}")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Significant difference: {p_value < 0.05}")
```

**Assumption:** Both groups have similar variance. If not, use `equal_var=False` (Welch's t-test).

```python
# Welch's t-test (unequal variances)
t_stat, p_value = stats.ttest_ind(class_a, class_b, equal_var=False)
print(f"Welch's t-test p-value: {p_value:.4f}")
```

---

### Paired t-test

Compare measurements from the **same group** before and after a treatment.

```python
# Weight loss program: before vs after
np.random.seed(42)
before = np.random.normal(85, 10, size=30)
after = before - np.random.normal(3, 2, size=30)  # lost ~3 kg

t_stat, p_value = stats.ttest_rel(before, after)
print(f"Mean before: {before.mean():.2f} kg")
print(f"Mean after: {after.mean():.2f} kg")
print(f"Mean difference: {(before - after).mean():.2f} kg")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.6f}")
print(f"Significant weight loss: {p_value < 0.05}")
```

---

### Chi-Squared Test

Test independence between **categorical variables**.

```python
# Is there a relationship between gender and preference?
#           Prefer A    Prefer B    Prefer C
# Male        30          20          50
# Female      45          35          20

observed = np.array([[30, 20, 50],
                     [45, 35, 20]])

chi2, p_value, dof, expected = stats.chi2_contingency(observed)
print(f"Chi-squared statistic: {chi2:.4f}")
print(f"p-value: {p_value:.6f}")
print(f"Degrees of freedom: {dof}")
print(f"\nExpected frequencies:")
print(expected.round(1))
print(f"\nSignificant association: {p_value < 0.05}")
```

---

### Mann-Whitney U Test

Non-parametric alternative to the two-sample t-test — doesn't assume normality.

```python
# Compare customer satisfaction scores (ordinal data, not normal)
np.random.seed(42)
store_a = np.random.choice([1, 2, 3, 4, 5], size=50, p=[0.05, 0.1, 0.2, 0.35, 0.3])
store_b = np.random.choice([1, 2, 3, 4, 5], size=50, p=[0.1, 0.2, 0.3, 0.25, 0.15])

u_stat, p_value = stats.mannwhitneyu(store_a, store_b, alternative="two-sided")
print(f"Store A median: {np.median(store_a)}")
print(f"Store B median: {np.median(store_b)}")
print(f"U-statistic: {u_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Significant: {p_value < 0.05}")
```

---

### ANOVA (Analysis of Variance)

Compare means across **3 or more groups** simultaneously.

$$H_0: \mu_1 = \mu_2 = \mu_3 = \ldots$$

```python
# Compare exam scores across 3 teaching methods
np.random.seed(42)
method_a = np.random.normal(72, 8, size=30)
method_b = np.random.normal(78, 10, size=30)
method_c = np.random.normal(75, 9, size=30)

f_stat, p_value = stats.f_oneway(method_a, method_b, method_c)
print(f"Method A mean: {method_a.mean():.2f}")
print(f"Method B mean: {method_b.mean():.2f}")
print(f"Method C mean: {method_c.mean():.2f}")
print(f"F-statistic: {f_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"At least one group differs: {p_value < 0.05}")
```

**Note:** ANOVA tells you *something* is different, but not *which* groups differ. Use post-hoc tests (like Tukey's HSD) to find out.

---

## Confidence Intervals

A **confidence interval** gives a range of plausible values for a parameter:

$$\bar{x} \pm z_{\alpha/2} \cdot \frac{s}{\sqrt{n}}$$

For a 95% CI: $z_{\alpha/2} = 1.96$

```python
# 95% confidence interval for the mean
np.random.seed(42)
data = np.random.normal(100, 15, size=50)

mean = data.mean()
se = data.std(ddof=1) / np.sqrt(len(data))
z = 1.96  # for 95% CI

ci_lower = mean - z * se
ci_upper = mean + z * se

print(f"Sample mean: {mean:.2f}")
print(f"Standard error: {se:.2f}")
print(f"95% CI: ({ci_lower:.2f}, {ci_upper:.2f})")
print(f"We are 95% confident the true mean is in this interval")
```

### Using scipy for CI

```python
# t-based confidence interval (better for small samples)
from scipy.stats import t

n = len(data)
mean = data.mean()
se = data.std(ddof=1) / np.sqrt(n)
t_crit = t.ppf(0.975, df=n-1)  # 97.5th percentile of t-distribution

ci_lower = mean - t_crit * se
ci_upper = mean + t_crit * se
print(f"95% CI (t-based): ({ci_lower:.2f}, {ci_upper:.2f})")
```

---

## Multiple Comparisons: Bonferroni Correction

When running **multiple tests**, the chance of a false positive increases. The Bonferroni correction adjusts the significance level:

$$\alpha_{\text{adjusted}} = \frac{\alpha}{m}$$

where $m$ is the number of tests.

```python
# Running 10 tests at α=0.05
m = 10
alpha = 0.05
alpha_bonferroni = alpha / m

print(f"Original α: {alpha}")
print(f"Bonferroni-adjusted α: {alpha_bonferroni}")
print(f"P(at least one false positive, original): {1 - (1-alpha)**m:.4f}")
print(f"P(at least one false positive, corrected): {1 - (1-alpha_bonferroni)**m:.4f}")

# Apply to p-values
p_values = [0.001, 0.01, 0.03, 0.04, 0.08, 0.12, 0.25, 0.45, 0.67, 0.89]
print("\nTest results with Bonferroni correction:")
for i, p in enumerate(p_values):
    sig_original = "✓" if p < alpha else "✗"
    sig_corrected = "✓" if p < alpha_bonferroni else "✗"
    print(f"  Test {i+1}: p={p:.3f} | Original: {sig_original} | Bonferroni: {sig_corrected}")
```

---

## Complete Example: A/B Testing

```python
# A/B test: Does a new website design increase conversion rate?
np.random.seed(42)

# Control (A): 1000 visitors, 120 conversions
# Treatment (B): 1000 visitors, 145 conversions
n_a, conv_a = 1000, 120
n_b, conv_b = 1000, 145

p_a = conv_a / n_a
p_b = conv_b / n_b
print(f"Conversion A: {p_a:.4f} ({p_a*100:.1f}%)")
print(f"Conversion B: {p_b:.4f} ({p_b*100:.1f}%)")
print(f"Lift: {(p_b - p_a)/p_a * 100:.1f}%")

# Two-proportion z-test
p_pool = (conv_a + conv_b) / (n_a + n_b)
se = np.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
z_stat = (p_b - p_a) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

print(f"\nz-statistic: {z_stat:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Significant (α=0.05): {p_value < 0.05}")

# Confidence interval for the difference
diff = p_b - p_a
se_diff = np.sqrt(p_a*(1-p_a)/n_a + p_b*(1-p_b)/n_b)
ci_low = diff - 1.96 * se_diff
ci_high = diff + 1.96 * se_diff
print(f"\n95% CI for difference: ({ci_low:.4f}, {ci_high:.4f})")
```

---

## Choosing the Right Test

| Scenario | Test |
|----------|------|
| One sample vs known value | One-sample t-test |
| Two independent groups | Two-sample t-test |
| Same group, before/after | Paired t-test |
| Non-normal data, 2 groups | Mann-Whitney U |
| 3+ groups | ANOVA |
| Categorical variables | Chi-squared |
| Proportions | z-test for proportions |

---

## Try It Yourself

1. Generate two groups with a known difference and verify the t-test detects it.
2. Run 20 tests on random data and observe how many give p < 0.05 by chance.
3. Implement an A/B test for email subject lines (open rates).
4. Calculate the sample size needed for 80% power.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| $H_0$ | No effect (what we test against) |
| p-value | How surprising the data is if $H_0$ is true |
| $\alpha$ | Threshold for rejecting $H_0$ |
| Type I error | False positive (probability = $\alpha$) |
| Type II error | False negative (probability = $\beta$) |
| Power | $1 - \beta$ = probability of detecting real effects |
| Confidence interval | Range of plausible parameter values |

**Key takeaway:** Hypothesis testing doesn't prove anything with certainty — it quantifies the evidence against the null hypothesis using a rigorous, repeatable framework.

---
