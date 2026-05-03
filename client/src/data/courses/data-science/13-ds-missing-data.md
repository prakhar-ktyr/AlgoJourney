---
title: Handling Missing Data
---

# Handling Missing Data

Missing data is one of the most common problems in real-world datasets. Learning how to detect, understand, and handle missing values is a crucial skill for every data scientist.

---

## What Is Missing Data?

In Pandas, missing data is represented as:

| Value | Type | Description |
|-------|------|-------------|
| `NaN` | float | "Not a Number" — standard missing value |
| `None` | Python object | Python's null value |
| `NaT` | datetime | "Not a Time" — missing datetime |
| `pd.NA` | nullable | Pandas nullable missing value |

```python
import pandas as pd
import numpy as np

# Different representations of missing data
print(np.nan)       # nan
print(None)         # None
print(pd.NaT)      # NaT
print(pd.NA)       # <NA>

# All are treated as missing by Pandas
s = pd.Series([1, np.nan, None, pd.NA])
print(s.isna())
# 0    False
# 1     True
# 2     True
# 3     True
```

---

## Types of Missingness

Understanding WHY data is missing helps you choose the right strategy:

### MCAR — Missing Completely At Random

The missingness has **no relationship** with any data (observed or unobserved).

**Example:** A survey response is missing because the respondent accidentally skipped a question.

**Impact:** Least problematic. Any handling method works well.

### MAR — Missing At Random

The missingness is related to **other observed data** but not the missing value itself.

**Example:** Older respondents are less likely to report their income (age is observed, income is missing).

**Impact:** Can be handled by imputing based on related columns.

### MNAR — Missing Not At Random

The missingness is related to **the value that is missing**.

**Example:** People with very high income refuse to report it (the value itself causes the missingness).

**Impact:** Most problematic. No simple fix — requires domain knowledge or specialized methods.

---

## Sample Dataset

```python
import pandas as pd
import numpy as np

# Create dataset with missing values
np.random.seed(42)

data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
             'Frank', 'Grace', 'Henry', 'Iris', 'Jack'],
    'age': [25, np.nan, 35, 28, 22, 38, np.nan, 45, 31, 27],
    'salary': [50000, 65000, np.nan, 58000, 45000,
               np.nan, 55000, 67000, np.nan, 52000],
    'city': ['NYC', 'LA', 'NYC', None, 'LA',
             'Chicago', 'NYC', None, 'LA', 'Chicago'],
    'score': [88, 92, np.nan, 95, 80, 85, np.nan, np.nan, 91, 78]
}

df = pd.DataFrame(data)
print(df)
```

---

## Detecting Missing Data

### Basic Detection

```python
# Check each cell for missing values
print(df.isna())     # Returns True/False for each cell
print(df.isnull())   # Same as isna() — they are aliases

# Count missing values per column
print(df.isna().sum())
# name      0
# age       2
# salary    3
# city      2
# score     3

# Total missing values in entire DataFrame
total_missing = df.isna().sum().sum()
print(f"Total missing: {total_missing}")  # 10

# Percentage missing per column
pct_missing = df.isna().mean() * 100
print(f"\nPercentage missing:\n{pct_missing.round(1)}")
# name       0.0
# age       20.0
# salary    30.0
# city      20.0
# score     30.0
```

### Detailed Missing Data Report

```python
def missing_report(df):
    """Generate a missing data report."""
    missing = df.isna().sum()
    pct = df.isna().mean() * 100
    types = df.dtypes

    report = pd.DataFrame({
        'Missing': missing,
        'Percent': pct.round(1),
        'Type': types
    })

    # Only show columns with missing values
    report = report[report['Missing'] > 0]
    report = report.sort_values('Percent', ascending=False)

    print(f"Total cells: {df.size}")
    print(f"Missing cells: {missing.sum()} ({missing.sum()/df.size*100:.1f}%)")
    print(f"\nColumns with missing data:")
    print(report)
    return report

missing_report(df)
```

### Visualizing Missing Data

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Heatmap of missing values
plt.figure(figsize=(10, 6))
sns.heatmap(df.isna(), cbar=True, yticklabels=False, cmap='viridis')
plt.title('Missing Values Heatmap')
plt.tight_layout()
plt.show()

# Bar chart of missing counts
missing_counts = df.isna().sum()
missing_counts[missing_counts > 0].plot(kind='bar')
plt.title('Missing Values by Column')
plt.ylabel('Count')
plt.show()
```

---

## Strategy 1: Drop Rows

Remove rows that have missing values. Best when you have plenty of data and few missing values.

```python
# Drop any row with at least one missing value
df_dropped = df.dropna()
print(f"Before: {len(df)} rows → After: {len(df_dropped)} rows")
# Before: 10 rows → After: 4 rows (lost 60% of data!)

# Drop rows where specific columns are missing
df_dropped = df.dropna(subset=['age', 'city'])
print(f"After (subset): {len(df_dropped)} rows")

# Drop rows where ALL values are missing
df_dropped = df.dropna(how='all')

# Drop rows with more than 2 missing values
df_dropped = df.dropna(thresh=len(df.columns) - 2)
```

> **Warning:** Dropping rows can lead to significant data loss and biased results if the data is not MCAR.

---

## Strategy 2: Drop Columns

Remove columns that have too many missing values (generally >50%).

```python
# Drop columns where more than 50% is missing
threshold = 0.5
cols_to_drop = df.columns[df.isna().mean() > threshold]
print(f"Columns to drop (>50% missing): {list(cols_to_drop)}")

df_dropped = df.drop(cols_to_drop, axis=1)

# Or use dropna with axis=1
df_dropped = df.dropna(axis=1, thresh=int(0.5 * len(df)))
```

---

## Strategy 3: Fill with a Constant

Replace missing values with a specific value.

```python
# Fill all missing with 0
df_filled = df.fillna(0)

# Fill specific columns with different values
df_filled = df.copy()
df_filled['city'] = df_filled['city'].fillna('Unknown')
df_filled['score'] = df_filled['score'].fillna(0)

print(df_filled)
```

---

## Strategy 4: Fill with Statistics

Use column statistics to fill missing values — preserves the distribution better.

### Mean (Numeric Columns)

```python
# Fill age with mean
mean_age = df['age'].mean()
print(f"Mean age: {mean_age:.1f}")

df_filled = df.copy()
df_filled['age'] = df_filled['age'].fillna(mean_age)
```

> **Best for:** Normally distributed numeric data without outliers.

### Median (Skewed Data)

```python
# Fill salary with median (better for skewed distributions)
median_salary = df['salary'].median()
print(f"Median salary: {median_salary:.0f}")

df_filled['salary'] = df_filled['salary'].fillna(median_salary)
```

> **Best for:** Numeric data with outliers or skewed distributions. The median is not affected by extreme values.

### Mode (Categorical Data)

```python
# Fill city with mode (most frequent value)
mode_city = df['city'].mode()[0]  # mode() returns a Series
print(f"Mode city: {mode_city}")

df_filled['city'] = df_filled['city'].fillna(mode_city)
```

> **Best for:** Categorical columns where the most common value is a reasonable default.

### Group-Based Imputation

```python
# Fill salary based on city group mean
df_filled = df.copy()
df_filled['salary'] = df_filled.groupby('city')['salary'].transform(
    lambda x: x.fillna(x.mean())
)

# If still NaN (city was also missing), fill with overall mean
df_filled['salary'] = df_filled['salary'].fillna(df['salary'].mean())
```

---

## Strategy 5: Forward/Backward Fill

Fill missing values using adjacent values. Ideal for time series data.

```python
# Forward fill (propagate last valid value forward)
df_ffill = df.copy()
df_ffill['score'] = df_ffill['score'].ffill()

# Backward fill (use next valid value)
df_bfill = df.copy()
df_bfill['score'] = df_bfill['score'].bfill()

# Limit the fill to avoid propagating too far
df_ffill['score'] = df['score'].ffill(limit=1)

print("Original:", df['score'].tolist())
print("Forward:  ", df_ffill['score'].tolist())
print("Backward: ", df_bfill['score'].tolist())
```

> **Best for:** Time series data where adjacent values are meaningful.

---

## Strategy 6: Interpolation

Estimate missing values using surrounding data points.

```python
# Linear interpolation
df_interp = df.copy()
df_interp['score'] = df_interp['score'].interpolate(method='linear')
print(df_interp['score'])

# Other interpolation methods
df_interp['age'] = df['age'].interpolate(method='linear')

# Polynomial interpolation
df_interp['salary'] = df['salary'].interpolate(method='polynomial', order=2)

# For time-indexed data
# df_interp['value'] = df['value'].interpolate(method='time')
```

> **Best for:** Numeric data with a logical ordering (time series, sequential measurements).

---

## Strategy 7: Advanced Imputation (Scikit-Learn)

### SimpleImputer

```python
from sklearn.impute import SimpleImputer

# Impute numeric columns with mean
numeric_cols = ['age', 'salary', 'score']

imputer = SimpleImputer(strategy='mean')
df_imputed = df.copy()
df_imputed[numeric_cols] = imputer.fit_transform(df[numeric_cols])

print(df_imputed[numeric_cols])
```

Available strategies:
- `'mean'` — column mean
- `'median'` — column median
- `'most_frequent'` — mode (works for categorical too)
- `'constant'` — fill with a specified value

```python
# Categorical imputation with most frequent
cat_imputer = SimpleImputer(strategy='most_frequent')
df_imputed['city'] = cat_imputer.fit_transform(
    df[['city']]
).ravel()
```

### KNN Imputer

Uses K-Nearest Neighbors to estimate missing values based on similar rows:

```python
from sklearn.impute import KNNImputer

# KNN imputation (uses 5 nearest neighbors by default)
knn_imputer = KNNImputer(n_neighbors=5)
df_knn = df.copy()
df_knn[numeric_cols] = knn_imputer.fit_transform(df[numeric_cols])

print(df_knn[numeric_cols])
```

### Iterative Imputer

Models each feature as a function of others (like multiple regression):

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

iter_imputer = IterativeImputer(max_iter=10, random_state=42)
df_iter = df.copy()
df_iter[numeric_cols] = iter_imputer.fit_transform(df[numeric_cols])

print(df_iter[numeric_cols])
```

---

## Missing Indicator

Track which values were originally missing — useful as a feature in models:

```python
from sklearn.impute import SimpleImputer, MissingIndicator

# Create missing indicators
indicator = MissingIndicator()
missing_flags = indicator.fit_transform(df[numeric_cols])

# Add as boolean columns
for i, col in enumerate(numeric_cols):
    df[f'{col}_was_missing'] = missing_flags[:, i] if i < missing_flags.shape[1] else False

print(df[['age', 'age_was_missing', 'salary', 'salary_was_missing']])
```

---

## When to Drop vs Impute

| Scenario | Recommendation |
|----------|----------------|
| < 5% missing, MCAR | Drop rows — minimal data loss |
| > 50% missing in a column | Drop the column |
| Few missing, important column | Impute with mean/median |
| Categorical column | Impute with mode or 'Unknown' |
| Time series data | Forward fill or interpolate |
| Complex patterns | KNN or iterative imputer |
| Feature for ML model | Impute + add missing indicator |
| MNAR data | Domain expertise needed |

---

## Complete Pipeline

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

def handle_missing_data(df, strategy='smart'):
    """Complete missing data handling pipeline."""
    df = df.copy()

    print("=== Missing Data Report ===")
    print(df.isna().sum()[df.isna().sum() > 0])
    print()

    # Step 1: Drop columns with >60% missing
    high_missing = df.columns[df.isna().mean() > 0.6]
    if len(high_missing) > 0:
        print(f"Dropping columns (>60% missing): {list(high_missing)}")
        df = df.drop(high_missing, axis=1)

    # Step 2: Handle numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        pct_missing = df[col].isna().mean()
        if pct_missing > 0:
            # Add missing indicator
            df[f'{col}_missing'] = df[col].isna().astype(int)

            # Impute with median (robust to outliers)
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"  {col}: filled {pct_missing:.0%} with median ({median_val:.1f})")

    # Step 3: Handle categorical columns
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        pct_missing = df[col].isna().mean()
        if pct_missing > 0:
            if pct_missing < 0.1:
                # Fill with mode if < 10% missing
                mode_val = df[col].mode()[0]
                df[col] = df[col].fillna(mode_val)
                print(f"  {col}: filled {pct_missing:.0%} with mode ({mode_val})")
            else:
                # Fill with 'Unknown' if >= 10% missing
                df[col] = df[col].fillna('Unknown')
                print(f"  {col}: filled {pct_missing:.0%} with 'Unknown'")

    # Step 4: Verify no missing data remains
    remaining = df.isna().sum().sum()
    print(f"\nRemaining missing values: {remaining}")

    return df

# Apply the pipeline
df_clean = handle_missing_data(df)
print("\n=== Clean Data ===")
print(df_clean)
```

---

## Best Practices

| Practice | Reason |
|----------|--------|
| Always check missing data first | Understand the scope of the problem |
| Visualize patterns | Detect if missingness is systematic |
| Don't fill everything with mean | May distort distributions |
| Consider the domain | A missing "diagnosis" might mean "healthy" |
| Track what was imputed | Missing indicator helps ML models |
| Test different strategies | Compare model performance |
| Document your choices | Reproducibility matters |
| Fill before splitting data | Avoid data leakage (fit on train only) |

---

## Summary

- Missing data appears as `NaN`, `None`, or `NaT` in Pandas
- Three types: MCAR (random), MAR (related to other data), MNAR (related to itself)
- Detect with `isna().sum()` and visualize with heatmaps
- **Drop** when data loss is minimal or columns are mostly empty
- **Fill** with constants, statistics (mean, median, mode), or adjacent values
- **Impute** with SimpleImputer, KNN, or iterative methods for complex patterns
- Always add missing indicators for machine learning pipelines
- Choose strategy based on the type of missingness and data characteristics

---
