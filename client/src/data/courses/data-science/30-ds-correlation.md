---
title: Correlation & Covariance
---

# Correlation & Covariance

Correlation and covariance measure the **relationship between two variables** — whether they move together, move apart, or have no connection at all.

---

## What Is Correlation?

Correlation quantifies the **strength and direction** of a linear relationship between two variables:

- **Positive correlation:** As X increases, Y increases
- **Negative correlation:** As X increases, Y decreases
- **No correlation:** No consistent pattern between X and Y

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
```

---

## Covariance

Covariance measures how two variables **vary together**:

$$\text{Cov}(X, Y) = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})$$

```python
# Calculate covariance manually
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = np.array([2, 4, 5, 4, 5, 7, 8, 9, 10, 12])

n = len(x)
cov_manual = np.sum((x - x.mean()) * (y - y.mean())) / (n - 1)
print(f"Covariance (manual): {cov_manual:.4f}")

# Using NumPy
cov_matrix = np.cov(x, y)
print(f"Covariance (numpy): {cov_matrix[0, 1]:.4f}")
```

### Interpreting Covariance

| Value | Meaning |
|-------|---------|
| Cov > 0 | Variables move in the **same** direction |
| Cov < 0 | Variables move in **opposite** directions |
| Cov ≈ 0 | No linear relationship |

**Problem:** Covariance depends on the **scale** of the variables. A covariance of 1000 doesn't mean a stronger relationship than 5 — the variables might just have larger units.

```python
# Same relationship, different scales
x_m = x * 1000  # meters → millimeters
cov_scaled = np.cov(x_m, y)[0, 1]
print(f"Original covariance: {cov_matrix[0, 1]:.2f}")
print(f"Scaled covariance: {cov_scaled:.2f}")
# Covariance changed but relationship is the same!
```

---

## Pearson Correlation Coefficient

The Pearson correlation **normalizes** covariance to a fixed range:

$$r = \frac{\text{Cov}(X, Y)}{s_X \cdot s_Y}$$

| Property | Detail |
|----------|--------|
| Range | $-1 \leq r \leq +1$ |
| $r = +1$ | Perfect positive linear relationship |
| $r = -1$ | Perfect negative linear relationship |
| $r = 0$ | No linear relationship |

```python
# Pearson correlation
r_manual = np.cov(x, y)[0, 1] / (np.std(x, ddof=1) * np.std(y, ddof=1))
print(f"Pearson r (manual): {r_manual:.4f}")

# Using NumPy
r_numpy = np.corrcoef(x, y)[0, 1]
print(f"Pearson r (numpy): {r_numpy:.4f}")

# Using scipy (also gives p-value)
r_scipy, p_value = stats.pearsonr(x, y)
print(f"Pearson r (scipy): {r_scipy:.4f}")
print(f"p-value: {p_value:.6f}")
```

### Strength Guidelines

| $|r|$ | Strength |
|--------|----------|
| 0.0 – 0.3 | Weak |
| 0.3 – 0.7 | Moderate |
| 0.7 – 1.0 | Strong |

```python
# Visualize different correlation strengths
np.random.seed(42)
fig, axes = plt.subplots(1, 4, figsize=(16, 4))

correlations = [0.95, 0.5, 0.0, -0.8]
titles = ["Strong positive\nr=0.95", "Moderate positive\nr=0.5",
          "No correlation\nr=0.0", "Strong negative\nr=-0.8"]

for ax, target_r, title in zip(axes, correlations, titles):
    # Generate correlated data
    mean = [0, 0]
    cov_mat = [[1, target_r], [target_r, 1]]
    data = np.random.multivariate_normal(mean, cov_mat, 100)
    ax.scatter(data[:, 0], data[:, 1], alpha=0.6, s=30)
    ax.set_title(title)
    ax.set_xlim(-4, 4)
    ax.set_ylim(-4, 4)

plt.tight_layout()
plt.show()
```

### Important Limitation

Pearson correlation only measures **linear** relationships. A perfect curve can have $r \approx 0$!

```python
# Non-linear relationship with low Pearson r
x_nl = np.linspace(-3, 3, 100)
y_nl = x_nl ** 2  # perfect parabola

r_nonlinear = np.corrcoef(x_nl, y_nl)[0, 1]
print(f"Pearson r for y=x²: {r_nonlinear:.4f}")  # ~0 (misleading!)

fig, ax = plt.subplots(figsize=(6, 4))
ax.scatter(x_nl, y_nl, alpha=0.6)
ax.set_title(f"Perfect relationship but r = {r_nonlinear:.3f}")
ax.set_xlabel("x")
ax.set_ylabel("y = x²")
plt.show()
```

---

## Spearman Rank Correlation

Spearman uses **ranks** instead of raw values, capturing **monotonic** relationships (not just linear):

$$r_s = 1 - \frac{6\sum d_i^2}{n(n^2 - 1)}$$

where $d_i$ is the difference between the ranks of each pair.

```python
# Spearman correlation
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y_monotonic = np.array([1, 4, 9, 16, 25, 36, 49, 64, 81, 100])  # y = x²

# Pearson vs Spearman
r_pearson, _ = stats.pearsonr(x, y_monotonic)
r_spearman, p_spearman = stats.spearmanr(x, y_monotonic)

print(f"Pearson r: {r_pearson:.4f}")    # < 1 (not linear)
print(f"Spearman r: {r_spearman:.4f}")  # = 1.0 (perfectly monotonic!)
print(f"Spearman p-value: {p_spearman:.6f}")
```

**When to use Spearman:**
- Data is ordinal (rankings, ratings)
- Relationship is monotonic but not linear
- Outliers are present (ranks are robust)

---

## Kendall's Tau

Another rank-based measure — counts **concordant** and **discordant** pairs:

```python
# Kendall's tau
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = np.array([2, 1, 4, 3, 6, 5, 8, 7, 10, 9])

tau, p_value = stats.kendalltau(x, y)
print(f"Kendall's tau: {tau:.4f}")
print(f"p-value: {p_value:.6f}")
```

**Kendall's tau vs Spearman:**
- Kendall's tau is more robust with small samples
- Spearman is more commonly used in practice
- Both handle non-linear monotonic relationships

---

## Point-Biserial Correlation

Correlation between a **continuous** variable and a **binary** variable:

```python
# Is there a correlation between study hours and pass/fail?
np.random.seed(42)
hours = np.array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
passed = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1])  # 0=fail, 1=pass

r_pb, p_value = stats.pointbiserialr(passed, hours)
print(f"Point-biserial r: {r_pb:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"More hours → more likely to pass: {'Yes' if r_pb > 0 else 'No'}")
```

---

## Correlation Matrix

A correlation matrix shows the pairwise correlation between **all** variables in a dataset:

```python
# Create a sample dataset
np.random.seed(42)
n = 200
df = pd.DataFrame({
    "age": np.random.normal(35, 10, n),
    "income": np.random.normal(50000, 15000, n),
    "education_years": np.random.normal(14, 3, n),
    "hours_worked": np.random.normal(40, 8, n),
})

# Add correlated variables
df["income"] = df["income"] + df["education_years"] * 3000 + df["age"] * 500
df["hours_worked"] = df["hours_worked"] + df["income"] / 10000

# Compute correlation matrix
corr_matrix = df.corr()
print(corr_matrix.round(3))
```

### Visualize with Heatmap

```python
import seaborn as sns

plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap="RdBu_r", center=0,
            vmin=-1, vmax=1, square=True, fmt=".2f")
plt.title("Correlation Matrix Heatmap")
plt.tight_layout()
plt.show()
```

### Scatter Matrix (Pair Plot)

```python
# Scatter matrix shows all pairwise relationships
pd.plotting.scatter_matrix(df, figsize=(10, 10), alpha=0.5, diagonal="hist")
plt.suptitle("Scatter Matrix", y=1.02)
plt.tight_layout()
plt.show()

# Or with seaborn
sns.pairplot(df, corner=True)
plt.show()
```

---

## Correlation ≠ Causation

**Just because two variables are correlated doesn't mean one causes the other!**

### Confounding Variables

A **confound** is a third variable that influences both X and Y:

```python
# Example: Ice cream sales and drowning rates
# Both are caused by a confound: hot weather!
np.random.seed(42)
months = np.arange(1, 13)
temperature = np.array([2, 4, 10, 15, 20, 25, 30, 28, 22, 15, 8, 3])

# Both driven by temperature
ice_cream_sales = temperature * 100 + np.random.normal(0, 50, 12)
drowning_rate = temperature * 0.5 + np.random.normal(0, 1, 12)

r, p = stats.pearsonr(ice_cream_sales, drowning_rate)
print(f"Correlation (ice cream, drowning): r={r:.4f}, p={p:.4f}")
print("Highly correlated! But ice cream doesn't cause drowning.")
print("Confound: temperature drives both.")
```

### Spurious Correlations

Some correlations are pure coincidence:
- Nicolas Cage films and pool drownings
- Cheese consumption and bedsheet entanglement deaths
- Divorce rate and margarine consumption

**Rule:** Correlation is necessary but NOT sufficient for causation.

---

## Statistical Significance of Correlation

Testing whether a correlation is significantly different from zero:

$$H_0: \rho = 0 \quad \text{(no correlation in the population)}$$

```python
# Test significance of correlations
np.random.seed(42)
n_samples = 30
x = np.random.normal(0, 1, n_samples)
y = 0.4 * x + np.random.normal(0, 1, n_samples)  # weak-moderate correlation

r, p_value = stats.pearsonr(x, y)
print(f"Sample size: {n_samples}")
print(f"Pearson r: {r:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Significant (α=0.05): {p_value < 0.05}")

# Same r, larger sample → more significant
x_large = np.random.normal(0, 1, 200)
y_large = 0.4 * x_large + np.random.normal(0, 1, 200)
r_large, p_large = stats.pearsonr(x_large, y_large)
print(f"\nLarger sample (n=200):")
print(f"Pearson r: {r_large:.4f}")
print(f"p-value: {p_large:.6f}")
```

**Key insight:** With large enough samples, even tiny correlations become "significant." Always report the **effect size** (r), not just the p-value.

---

## Partial Correlation

**Partial correlation** measures the relationship between X and Y **after removing** the effect of a confounding variable Z:

```python
def partial_correlation(x, y, z):
    """Compute partial correlation between x and y, controlling for z."""
    # Regress x on z
    slope_xz = np.polyfit(z, x, 1)
    residual_x = x - np.polyval(slope_xz, z)

    # Regress y on z
    slope_yz = np.polyfit(z, y, 1)
    residual_y = y - np.polyval(slope_yz, z)

    # Correlation of residuals
    r_partial, p_value = stats.pearsonr(residual_x, residual_y)
    return r_partial, p_value

# Example: income and health, controlling for age
np.random.seed(42)
n = 100
age = np.random.normal(45, 15, n)
income = age * 1000 + np.random.normal(50000, 10000, n)
health_score = -age * 0.5 + np.random.normal(75, 5, n)

# Raw correlation
r_raw, _ = stats.pearsonr(income, health_score)
print(f"Raw correlation (income, health): {r_raw:.4f}")

# Partial correlation (controlling for age)
r_partial, p_partial = partial_correlation(income, health_score, age)
print(f"Partial correlation (controlling for age): {r_partial:.4f}")
print(f"p-value: {p_partial:.4f}")
print("\nAge was the confound — removing it reveals the true relationship.")
```

---

## When to Use Each Correlation Measure

| Measure | Use When | Assumptions |
|---------|----------|-------------|
| **Pearson** | Both variables continuous, linear relationship | Normality, no outliers |
| **Spearman** | Ordinal data, non-linear monotonic, outliers | Monotonic relationship |
| **Kendall** | Small samples, ordinal, many tied ranks | Monotonic relationship |
| **Point-biserial** | One binary, one continuous | Normality of continuous var |
| **Partial** | Need to control for confounders | Same as underlying measure |

---

## Complete Example

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

# Generate a realistic dataset
np.random.seed(42)
n = 150

study_hours = np.random.uniform(1, 12, n)
sleep_hours = np.random.normal(7, 1.5, n)
exam_score = (study_hours * 5 + sleep_hours * 3
              + np.random.normal(0, 8, n) + 30)
stress_level = 10 - sleep_hours + study_hours * 0.3 + np.random.normal(0, 2, n)

df = pd.DataFrame({
    "study_hours": study_hours,
    "sleep_hours": sleep_hours,
    "exam_score": exam_score,
    "stress_level": stress_level,
})

print("=" * 50)
print("CORRELATION ANALYSIS")
print("=" * 50)

# Pearson correlation matrix
print("\n--- Pearson Correlation Matrix ---")
print(df.corr().round(3))

# Spearman correlation matrix
print("\n--- Spearman Correlation Matrix ---")
print(df.corr(method="spearman").round(3))

# Detailed pairwise analysis
print("\n--- Detailed Pairwise Analysis ---")
pairs = [("study_hours", "exam_score"),
         ("sleep_hours", "exam_score"),
         ("study_hours", "stress_level"),
         ("sleep_hours", "stress_level")]

for var1, var2 in pairs:
    r_p, p_p = stats.pearsonr(df[var1], df[var2])
    r_s, p_s = stats.spearmanr(df[var1], df[var2])
    print(f"\n  {var1} vs {var2}:")
    print(f"    Pearson:  r={r_p:.3f}, p={p_p:.4f}")
    print(f"    Spearman: r={r_s:.3f}, p={p_s:.4f}")

# Visualization
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Heatmap
sns.heatmap(df.corr(), annot=True, cmap="RdBu_r", center=0,
            vmin=-1, vmax=1, ax=axes[0], fmt=".2f")
axes[0].set_title("Pearson Correlation Heatmap")

# Scatter with regression line
axes[1].scatter(df["study_hours"], df["exam_score"], alpha=0.5)
z = np.polyfit(df["study_hours"], df["exam_score"], 1)
p = np.poly1d(z)
x_line = np.linspace(df["study_hours"].min(), df["study_hours"].max(), 100)
axes[1].plot(x_line, p(x_line), "r-", linewidth=2)
r, _ = stats.pearsonr(df["study_hours"], df["exam_score"])
axes[1].set_title(f"Study Hours vs Exam Score (r={r:.3f})")
axes[1].set_xlabel("Study Hours")
axes[1].set_ylabel("Exam Score")

plt.tight_layout()
plt.show()
```

---

## Try It Yourself

1. Load a dataset and compute the full correlation matrix.
2. Compare Pearson vs Spearman for a dataset with outliers.
3. Find a pair of variables that are correlated — then identify possible confounders.
4. Compute partial correlations to control for a confound.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Covariance | Direction of relationship (scale-dependent) |
| Pearson r | Strength + direction of linear relationship (-1 to +1) |
| Spearman | Rank-based, handles non-linear monotonic |
| Kendall | Rank-based, robust for small samples |
| Correlation matrix | All pairwise relationships at a glance |
| Partial correlation | Relationship after removing confounders |
| Correlation ≠ Causation | Always consider confounds and alternative explanations |

**Key takeaway:** Correlation is a powerful tool for discovering relationships, but always think critically about **why** variables might be related. Use the right measure for your data type, visualize the relationship, and never jump from correlation to causation without further evidence.

---
