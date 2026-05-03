---
title: Descriptive Statistics
---

# Descriptive Statistics

Descriptive statistics **summarize and describe** the main features of a dataset. Instead of looking at every single data point, you get a concise overview of what your data looks like.

---

## Why Descriptive Statistics?

Before building models or running experiments, you need to **understand your data**:

- What's the "typical" value?
- How spread out are the values?
- Are there outliers?
- Is the data symmetric or skewed?

Descriptive statistics answer these questions with numbers and visuals.

---

## Measures of Central Tendency

Central tendency tells you where the "center" of your data is.

### Mean (Average)

The **mean** is the sum of all values divided by the count:

$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$$

```python
import numpy as np

data = [12, 15, 18, 22, 25, 30, 35]
mean = np.mean(data)
print(f"Mean: {mean}")  # Mean: 22.43
```

**Pros:** Uses all data points.
**Cons:** Sensitive to outliers — one extreme value can pull the mean.

---

### Median (Middle Value)

The **median** is the middle value when data is sorted. If there's an even number of values, it's the average of the two middle values.

```python
data = [12, 15, 18, 22, 25, 30, 35]
median = np.median(data)
print(f"Median: {median}")  # Median: 22.0

# With outlier
data_outlier = [12, 15, 18, 22, 25, 30, 500]
print(f"Mean with outlier: {np.mean(data_outlier):.2f}")    # 88.86
print(f"Median with outlier: {np.median(data_outlier)}")    # 22.0
```

**Key insight:** The median is **robust to outliers** — it barely changes when extreme values are present.

---

### Mode (Most Frequent)

The **mode** is the value that appears most often:

```python
from scipy import stats

data = [1, 2, 2, 3, 3, 3, 4, 4, 5]
mode_result = stats.mode(data, keepdims=True)
print(f"Mode: {mode_result.mode[0]}")  # Mode: 3
print(f"Count: {mode_result.count[0]}")  # Count: 3
```

**Note:** Data can be unimodal (one mode), bimodal (two modes), or multimodal.

---

### When to Use Each?

| Measure | Best For | Avoid When |
|---------|----------|------------|
| Mean | Symmetric data, no outliers | Skewed data, outliers present |
| Median | Skewed data, ordinal data | — (almost always useful) |
| Mode | Categorical data, finding peaks | Continuous data with no repeats |

```python
import pandas as pd

# Salary data (right-skewed)
salaries = [35000, 42000, 45000, 48000, 52000, 55000, 250000]
print(f"Mean salary: ${np.mean(salaries):,.0f}")    # $75,286
print(f"Median salary: ${np.median(salaries):,.0f}")  # $48,000
# Median better represents "typical" salary here
```

---

## Measures of Spread (Dispersion)

Central tendency alone isn't enough. Two datasets can have the same mean but very different spreads.

### Range

The simplest measure — difference between max and min:

$$\text{Range} = x_{max} - x_{min}$$

```python
data = [10, 20, 30, 40, 50]
range_val = np.max(data) - np.min(data)
print(f"Range: {range_val}")  # Range: 40
```

**Limitation:** Only uses two values; very sensitive to outliers.

---

### Variance

Variance measures the average squared deviation from the mean:

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

```python
data = [10, 20, 30, 40, 50]
variance = np.var(data, ddof=1)  # ddof=1 for sample variance
print(f"Variance: {variance}")  # Variance: 250.0
```

**Note:** We use $n-1$ (Bessel's correction) for sample variance to get an unbiased estimate.

---

### Standard Deviation

The square root of variance — back in the original units:

$$s = \sqrt{s^2}$$

```python
data = [10, 20, 30, 40, 50]
std = np.std(data, ddof=1)
print(f"Standard Deviation: {std:.2f}")  # Standard Deviation: 15.81
```

**Interpretation:** On average, values are about 15.81 units away from the mean.

---

### Interquartile Range (IQR)

The range of the middle 50% of data:

$$\text{IQR} = Q3 - Q1$$

```python
data = [2, 5, 7, 10, 12, 15, 18, 20, 25, 30, 100]
Q1 = np.percentile(data, 25)
Q3 = np.percentile(data, 75)
IQR = Q3 - Q1
print(f"Q1: {Q1}, Q3: {Q3}, IQR: {IQR}")

# Outlier detection using IQR
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
outliers = [x for x in data if x < lower_bound or x > upper_bound]
print(f"Outliers: {outliers}")
```

---

### Coefficient of Variation (CV)

A **relative** measure of spread — useful for comparing variability across different scales:

$$CV = \frac{s}{\bar{x}}$$

```python
# Compare variability: heights (cm) vs weights (kg)
heights = [160, 165, 170, 175, 180]
weights = [55, 62, 70, 78, 85]

cv_heights = np.std(heights, ddof=1) / np.mean(heights)
cv_weights = np.std(weights, ddof=1) / np.mean(weights)

print(f"CV Heights: {cv_heights:.4f} ({cv_heights*100:.1f}%)")
print(f"CV Weights: {cv_weights:.4f} ({cv_weights*100:.1f}%)")
# Weights have higher relative variability
```

---

## Percentiles and Quartiles

**Percentiles** divide data into 100 equal parts. The $k$th percentile is the value below which $k\%$ of the data falls.

**Quartiles** are special percentiles:

| Quartile | Percentile | Meaning |
|----------|-----------|---------|
| Q1 | 25th | 25% of data below |
| Q2 | 50th | 50% (= median) |
| Q3 | 75th | 75% of data below |

```python
data = [12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 45]

# Calculate quartiles
quartiles = np.percentile(data, [25, 50, 75])
print(f"Q1: {quartiles[0]}")
print(f"Q2 (Median): {quartiles[1]}")
print(f"Q3: {quartiles[2]}")

# Any percentile
p90 = np.percentile(data, 90)
print(f"90th percentile: {p90}")
# 90% of values are below this
```

---

## Shape of Distribution

### Skewness

Skewness measures the **asymmetry** of the distribution:

- **Skewness = 0:** Symmetric (like normal distribution)
- **Skewness > 0:** Right-skewed (tail extends to the right)
- **Skewness < 0:** Left-skewed (tail extends to the left)

```python
from scipy.stats import skew

symmetric = [1, 2, 3, 4, 5, 6, 7, 8, 9]
right_skewed = [1, 1, 2, 2, 3, 3, 4, 5, 10, 20, 50]
left_skewed = [1, 30, 40, 45, 48, 49, 50, 50, 50]

print(f"Symmetric skew: {skew(symmetric):.3f}")
print(f"Right-skewed: {skew(right_skewed):.3f}")
print(f"Left-skewed: {skew(left_skewed):.3f}")
```

**Rule of thumb:** If $|\text{skew}| > 1$, the distribution is highly skewed.

---

### Kurtosis

Kurtosis measures the **tailedness** of the distribution:

- **Kurtosis = 3** (or excess = 0): Normal distribution (mesokurtic)
- **Kurtosis > 3:** Heavy tails, more outliers (leptokurtic)
- **Kurtosis < 3:** Light tails, fewer outliers (platykurtic)

```python
from scipy.stats import kurtosis

normal_data = np.random.normal(0, 1, 10000)
heavy_tails = np.random.standard_t(df=3, size=10000)

# Fisher=True gives excess kurtosis (subtract 3)
print(f"Normal kurtosis (excess): {kurtosis(normal_data):.3f}")  # ~0
print(f"Heavy-tail kurtosis (excess): {kurtosis(heavy_tails):.3f}")  # > 0
```

---

## Five-Number Summary

The **five-number summary** gives a quick overview of the distribution:

1. **Minimum**
2. **Q1** (25th percentile)
3. **Median** (50th percentile)
4. **Q3** (75th percentile)
5. **Maximum**

```python
data = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

five_num = {
    "Min": np.min(data),
    "Q1": np.percentile(data, 25),
    "Median": np.median(data),
    "Q3": np.percentile(data, 75),
    "Max": np.max(data),
}

for key, val in five_num.items():
    print(f"{key}: {val}")
```

This is exactly what a **box plot** visualizes!

---

## Pandas describe()

Pandas gives you most descriptive statistics in one call:

```python
import pandas as pd

df = pd.DataFrame({
    "age": [22, 25, 28, 30, 35, 40, 45, 50, 55, 60],
    "income": [30000, 35000, 42000, 48000, 55000, 62000, 70000, 80000, 90000, 120000],
    "score": [65, 72, 78, 80, 85, 88, 90, 92, 95, 98],
})

# Full summary
print(df.describe())
```

Output includes count, mean, std, min, 25%, 50%, 75%, max for each column.

### Individual Statistics

```python
print(f"Means:\n{df.mean()}\n")
print(f"Standard Deviations:\n{df.std()}\n")
print(f"Skewness:\n{df.skew()}\n")
print(f"Kurtosis:\n{df.kurt()}\n")
print(f"Correlation:\n{df.corr()}\n")
```

---

## Visualizing Descriptive Statistics

### Histogram — Distribution Shape

```python
import matplotlib.pyplot as plt

data = np.random.normal(50, 10, 1000)

plt.figure(figsize=(10, 4))
plt.hist(data, bins=30, edgecolor="black", alpha=0.7)
plt.axvline(np.mean(data), color="red", linestyle="--", label=f"Mean: {np.mean(data):.1f}")
plt.axvline(np.median(data), color="green", linestyle="-", label=f"Median: {np.median(data):.1f}")
plt.xlabel("Value")
plt.ylabel("Frequency")
plt.title("Histogram with Mean and Median")
plt.legend()
plt.show()
```

### Box Plot — Five-Number Summary + Outliers

```python
fig, ax = plt.subplots(figsize=(8, 5))

data_groups = [
    np.random.normal(50, 10, 200),
    np.random.normal(60, 15, 200),
    np.random.normal(45, 5, 200),
]

ax.boxplot(data_groups, labels=["Group A", "Group B", "Group C"])
ax.set_ylabel("Value")
ax.set_title("Box Plot Comparison")
plt.show()
```

### Violin Plot — Distribution Shape + Box Plot

```python
fig, ax = plt.subplots(figsize=(8, 5))
parts = ax.violinplot(data_groups, showmeans=True, showmedians=True)
ax.set_xticks([1, 2, 3])
ax.set_xticklabels(["Group A", "Group B", "Group C"])
ax.set_title("Violin Plot")
plt.show()
```

---

## Complete Example: All Descriptive Stats

```python
import numpy as np
import pandas as pd
from scipy import stats

# Generate sample data
np.random.seed(42)
data = np.random.exponential(scale=50, size=500)

print("=" * 50)
print("COMPLETE DESCRIPTIVE STATISTICS")
print("=" * 50)

# Central tendency
print(f"\n--- Central Tendency ---")
print(f"Mean:   {np.mean(data):.2f}")
print(f"Median: {np.median(data):.2f}")
mode_result = stats.mode(np.round(data, 0), keepdims=True)
print(f"Mode:   {mode_result.mode[0]:.2f}")

# Spread
print(f"\n--- Spread ---")
print(f"Range:              {np.ptp(data):.2f}")
print(f"Variance:           {np.var(data, ddof=1):.2f}")
print(f"Std Deviation:      {np.std(data, ddof=1):.2f}")
Q1, Q3 = np.percentile(data, [25, 75])
print(f"IQR:                {Q3 - Q1:.2f}")
print(f"Coeff of Variation: {np.std(data, ddof=1)/np.mean(data):.4f}")

# Shape
print(f"\n--- Shape ---")
print(f"Skewness: {stats.skew(data):.4f}")
print(f"Kurtosis (excess): {stats.kurtosis(data):.4f}")

# Five-number summary
print(f"\n--- Five-Number Summary ---")
print(f"Min:    {np.min(data):.2f}")
print(f"Q1:     {Q1:.2f}")
print(f"Median: {np.median(data):.2f}")
print(f"Q3:     {Q3:.2f}")
print(f"Max:    {np.max(data):.2f}")

# Percentiles
print(f"\n--- Key Percentiles ---")
for p in [10, 25, 50, 75, 90, 95, 99]:
    print(f"  P{p}: {np.percentile(data, p):.2f}")
```

---

## Try It Yourself

1. Load a real dataset (e.g., `pd.read_csv("tips.csv")`) and compute all descriptive stats.
2. Create a histogram and box plot side by side.
3. Identify which columns are skewed and which have outliers.
4. Compare mean vs median — when do they differ significantly?

---

## Summary

| Concept | What It Tells You |
|---------|-------------------|
| Mean, Median, Mode | Center of the data |
| Variance, Std Dev | How spread out values are |
| IQR | Spread of the middle 50% |
| Skewness | Symmetry of the distribution |
| Kurtosis | Heaviness of tails |
| Five-number summary | Quick shape overview |

**Key takeaway:** Always start your analysis with descriptive statistics. They reveal patterns, outliers, and guide your choice of methods.

---
