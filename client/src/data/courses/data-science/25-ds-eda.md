---
title: Exploratory Data Analysis
---

# Exploratory Data Analysis

**Exploratory Data Analysis (EDA)** is the process of investigating a dataset to discover patterns, spot anomalies, test hypotheses, and check assumptions — all before formal modeling.

---

## What is EDA?

EDA is your first deep dive into any new dataset. It answers:

- What does the data look like?
- Are there missing values or outliers?
- What are the distributions of variables?
- What relationships exist between features?
- What might predict the target variable?

> "Far better an approximate answer to the right question than an exact answer to the wrong question." — John Tukey (who coined "EDA" in 1977)

---

## EDA Goals

| Goal                  | What You Do                                    |
|-----------------------|------------------------------------------------|
| Understand structure  | Shape, types, columns, head/tail               |
| Assess quality        | Missing values, duplicates, inconsistencies    |
| Find distributions    | Histograms, KDE, descriptive stats             |
| Discover patterns     | Correlations, trends, groupings                |
| Detect anomalies      | Outliers, unexpected values                    |
| Generate hypotheses   | What might explain the target variable?        |

---

## Systematic EDA Workflow

Follow these six steps for any dataset:

1. **Overview** — shape, dtypes, head, info
2. **Missing Values** — count, pattern, visualize
3. **Univariate Analysis** — distribution of each variable
4. **Bivariate Analysis** — relationships between pairs
5. **Multivariate Analysis** — complex interactions
6. **Summary and Insights** — key findings, next steps

---

## Step 1: Dataset Overview

```python
import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv('data.csv')

# Basic info
print(f"Shape: {df.shape}")           # (rows, columns)
print(f"Columns: {df.columns.tolist()}")

# First and last rows
print(df.head())
print(df.tail())

# Data types and non-null counts
print(df.info())

# Statistical summary
print(df.describe())                   # numeric columns
print(df.describe(include='object'))   # categorical columns

# Unique values per column
print(df.nunique())
```

### Key Questions at This Stage

- How many rows and columns?
- What are the data types?
- Are column names clear and consistent?
- Is there a target variable?
- What's the expected range of each feature?

---

## Step 2: Missing Values

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Count missing values
missing = df.isnull().sum()
missing_pct = (missing / len(df)) * 100

# Summary table
missing_df = pd.DataFrame({
    'Missing': missing,
    'Percent': missing_pct
}).sort_values('Percent', ascending=False)

print(missing_df[missing_df['Missing'] > 0])
```

### Visualize Missing Patterns

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Heatmap of missing values
fig, ax = plt.subplots(figsize=(12, 6))
sns.heatmap(df.isnull(), cbar=True, yticklabels=False,
            cmap='viridis', ax=ax)
ax.set_title("Missing Value Pattern")
plt.show()
```

### Missing Value Strategies

| Strategy          | When to Use                                      |
|-------------------|--------------------------------------------------|
| Drop rows         | < 5% missing, random pattern                    |
| Drop columns      | > 50% missing, not important                    |
| Fill with mean    | Numeric, roughly symmetric distribution         |
| Fill with median  | Numeric, skewed distribution                    |
| Fill with mode    | Categorical                                      |
| Forward/backward  | Time series                                      |
| Model-based       | Complex patterns (KNN, regression imputation)   |

```python
import pandas as pd
import numpy as np

# Common imputation examples
df['age'].fillna(df['age'].median(), inplace=True)
df['category'].fillna(df['category'].mode()[0], inplace=True)
df['value'].fillna(method='ffill', inplace=True)  # forward fill
```

---

## Step 3: Univariate Analysis

Examine each variable individually.

### Numerical Variables

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

numeric_cols = df.select_dtypes(include=[np.number]).columns

fig, axes = plt.subplots(len(numeric_cols), 2, figsize=(12, 4*len(numeric_cols)))

for i, col in enumerate(numeric_cols):
    # Histogram + KDE
    sns.histplot(df[col], kde=True, ax=axes[i, 0])
    axes[i, 0].set_title(f'{col} — Distribution')
    axes[i, 0].axvline(df[col].mean(), color='red', linestyle='--', label='Mean')
    axes[i, 0].axvline(df[col].median(), color='green', linestyle='-', label='Median')
    axes[i, 0].legend()

    # Box plot
    sns.boxplot(x=df[col], ax=axes[i, 1])
    axes[i, 1].set_title(f'{col} — Box Plot')

fig.tight_layout()
plt.show()
```

### Descriptive Statistics

```python
import pandas as pd
import numpy as np

for col in numeric_cols:
    print(f"\n--- {col} ---")
    print(f"  Mean:     {df[col].mean():.2f}")
    print(f"  Median:   {df[col].median():.2f}")
    print(f"  Std:      {df[col].std():.2f}")
    print(f"  Skew:     {df[col].skew():.2f}")
    print(f"  Kurtosis: {df[col].kurtosis():.2f}")
    print(f"  Min:      {df[col].min()}")
    print(f"  Max:      {df[col].max()}")
```

### Skewness

Measures asymmetry of the distribution:

$$\gamma_1 = E\left[\left(\frac{X - \mu}{\sigma}\right)^3\right]$$

| Skewness        | Interpretation           |
|-----------------|--------------------------|
| $\gamma_1 = 0$ | Symmetric                |
| $\gamma_1 > 0$ | Right-skewed (long tail) |
| $\gamma_1 < 0$ | Left-skewed (long tail)  |

### Kurtosis

Measures how heavy-tailed the distribution is:

$$\kappa = E\left[\left(\frac{X - \mu}{\sigma}\right)^4\right] - 3$$

- $\kappa > 0$: Heavier tails than normal (leptokurtic)
- $\kappa = 0$: Normal distribution (mesokurtic)
- $\kappa < 0$: Lighter tails than normal (platykurtic)

### Categorical Variables

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

cat_cols = df.select_dtypes(include=['object', 'category']).columns

fig, axes = plt.subplots(len(cat_cols), 1, figsize=(10, 4*len(cat_cols)))
if len(cat_cols) == 1:
    axes = [axes]

for i, col in enumerate(cat_cols):
    # Value counts
    counts = df[col].value_counts()
    print(f"\n{col}:\n{counts}\n")

    # Bar plot
    sns.countplot(data=df, x=col, order=counts.index,
                  palette='Set2', ax=axes[i])
    axes[i].set_title(f'{col} — Frequency')
    axes[i].tick_params(axis='x', rotation=45)

fig.tight_layout()
plt.show()
```

---

## Step 4: Bivariate Analysis

Examine relationships between pairs of variables.

### Numerical vs Numerical

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Scatter plot with regression line
fig, ax = plt.subplots(figsize=(8, 6))
sns.regplot(data=df, x='feature_1', y='feature_2',
            scatter_kws={'alpha': 0.5}, ax=ax)
ax.set_title("Feature 1 vs Feature 2")
plt.show()

# Correlation coefficient
r = df['feature_1'].corr(df['feature_2'])
print(f"Pearson correlation: {r:.3f}")
```

The Pearson correlation coefficient:

$$r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2} \cdot \sqrt{\sum_{i=1}^{n}(y_i - \bar{y})^2}}$$

| r value        | Interpretation         |
|----------------|------------------------|
| 0.7 to 1.0    | Strong positive        |
| 0.3 to 0.7    | Moderate positive      |
| 0.0 to 0.3    | Weak positive          |
| -0.3 to 0.0   | Weak negative          |
| -0.7 to -0.3  | Moderate negative      |
| -1.0 to -0.7  | Strong negative        |

### Categorical vs Numerical

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Box plot
sns.boxplot(data=df, x='category', y='value', ax=axes[0])
axes[0].set_title("Value by Category (Box)")

# Violin plot
sns.violinplot(data=df, x='category', y='value', ax=axes[1])
axes[1].set_title("Value by Category (Violin)")

fig.tight_layout()
plt.show()

# Group statistics
print(df.groupby('category')['value'].describe())
```

### Categorical vs Categorical

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Cross-tabulation
ct = pd.crosstab(df['cat_1'], df['cat_2'], normalize='index')
print(ct)

# Heatmap of crosstab
fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(ct, annot=True, cmap='YlOrRd', fmt='.2f', ax=ax)
ax.set_title("Cross-tabulation: cat_1 vs cat_2")
plt.show()
```

---

## Step 5: Correlation Matrix

A complete view of all numeric relationships:

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

numeric_data = df.select_dtypes(include=[np.number])
corr = numeric_data.corr()

# Full heatmap
fig, ax = plt.subplots(figsize=(10, 8))
mask = np.triu(np.ones_like(corr, dtype=bool))  # upper triangle mask
sns.heatmap(corr, mask=mask, annot=True, cmap='coolwarm',
            center=0, fmt='.2f', linewidths=0.5,
            square=True, ax=ax)
ax.set_title("Correlation Matrix (Lower Triangle)", fontweight='bold')
plt.show()
```

### High Correlations

```python
import pandas as pd
import numpy as np

# Find highly correlated pairs
corr_pairs = corr.unstack().sort_values(ascending=False)
# Remove self-correlations and duplicates
corr_pairs = corr_pairs[corr_pairs < 1.0]
corr_pairs = corr_pairs.drop_duplicates()

print("Top positive correlations:")
print(corr_pairs.head(5))
print("\nTop negative correlations:")
print(corr_pairs.tail(5))
```

---

## Step 6: Feature Distributions by Target

Understanding which features predict the target:

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

target = 'survived'  # binary target example
features = ['age', 'fare', 'pclass']

fig, axes = plt.subplots(1, len(features), figsize=(5*len(features), 5))

for i, feat in enumerate(features):
    sns.histplot(data=df, x=feat, hue=target, kde=True,
                 multiple='stack', ax=axes[i])
    axes[i].set_title(f'{feat} by {target}')

fig.suptitle("Feature Distributions by Target", fontweight='bold')
fig.tight_layout()
plt.show()
```

---

## Outlier Detection

### IQR Method

```python
import pandas as pd
import numpy as np

def detect_outliers_iqr(series):
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = series[(series < lower) | (series > upper)]
    return outliers, lower, upper

for col in numeric_cols:
    outliers, lower, upper = detect_outliers_iqr(df[col])
    if len(outliers) > 0:
        print(f"{col}: {len(outliers)} outliers "
              f"(range: [{lower:.1f}, {upper:.1f}])")
```

### Z-Score Method

A value is an outlier if $|z| > 3$:

$$z = \frac{x - \mu}{\sigma}$$

```python
import pandas as pd
import numpy as np

from scipy import stats

for col in numeric_cols:
    z_scores = np.abs(stats.zscore(df[col].dropna()))
    n_outliers = (z_scores > 3).sum()
    if n_outliers > 0:
        print(f"{col}: {n_outliers} outliers (|z| > 3)")
```

---

## Automated EDA Tools

### ydata-profiling (formerly pandas-profiling)

```python
# pip install ydata-profiling

from ydata_profiling import ProfileReport

profile = ProfileReport(df, title="EDA Report",
                        explorative=True)
profile.to_file("eda_report.html")
```

This generates a comprehensive HTML report with:
- Overview and variable types
- Distribution plots for every column
- Correlation analysis
- Missing value analysis
- Duplicate detection

### sweetviz

```python
# pip install sweetviz

import sweetviz as sv

report = sv.analyze(df)
report.show_html("sweetviz_report.html")

# Compare train/test sets
report = sv.compare(df_train, df_test)
report.show_html("comparison.html")
```

---

## Practical EDA: Complete Example

Let's perform a full EDA on a dataset:

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Load Titanic dataset
df = sns.load_dataset('titanic')
sns.set_theme(style='whitegrid')

print("=" * 50)
print("STEP 1: OVERVIEW")
print("=" * 50)
print(f"Shape: {df.shape}")
print(f"\nData types:\n{df.dtypes}")
print(f"\nFirst rows:\n{df.head()}")
print(f"\nStatistics:\n{df.describe()}")
```

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('titanic')

print("=" * 50)
print("STEP 2: MISSING VALUES")
print("=" * 50)
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(1)
missing_info = pd.DataFrame({'Count': missing, 'Percent': missing_pct})
print(missing_info[missing_info['Count'] > 0].sort_values('Percent', ascending=False))

# Visualize
fig, ax = plt.subplots(figsize=(10, 4))
missing_cols = missing[missing > 0].sort_values(ascending=False)
ax.bar(missing_cols.index, missing_cols.values, color='coral')
ax.set_title("Missing Values by Column")
ax.set_ylabel("Count")
plt.xticks(rotation=45)
plt.show()
```

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('titanic')

print("=" * 50)
print("STEP 3: UNIVARIATE ANALYSIS")
print("=" * 50)

fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# Age distribution
sns.histplot(df['age'].dropna(), kde=True, ax=axes[0, 0], color='steelblue')
axes[0, 0].set_title("Age Distribution")

# Fare distribution
sns.histplot(df['fare'], kde=True, ax=axes[0, 1], color='coral')
axes[0, 1].set_title("Fare Distribution")

# Survival count
sns.countplot(data=df, x='survived', ax=axes[0, 2], palette='Set2')
axes[0, 2].set_title("Survival Count")
axes[0, 2].set_xticklabels(['Died', 'Survived'])

# Class distribution
sns.countplot(data=df, x='pclass', ax=axes[1, 0], palette='Set3')
axes[1, 0].set_title("Passenger Class")

# Sex distribution
sns.countplot(data=df, x='sex', ax=axes[1, 1], palette='pastel')
axes[1, 1].set_title("Gender")

# Embarked
sns.countplot(data=df, x='embarked', ax=axes[1, 2], palette='muted')
axes[1, 2].set_title("Port of Embarkation")

fig.suptitle("Univariate Analysis", fontsize=14, fontweight='bold')
fig.tight_layout()
plt.show()
```

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('titanic')

print("=" * 50)
print("STEP 4: BIVARIATE ANALYSIS")
print("=" * 50)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Survival by class
sns.barplot(data=df, x='pclass', y='survived', ax=axes[0, 0], palette='Set2')
axes[0, 0].set_title("Survival Rate by Class")
axes[0, 0].set_ylabel("Survival Rate")

# Survival by sex
sns.barplot(data=df, x='sex', y='survived', ax=axes[0, 1], palette='pastel')
axes[0, 1].set_title("Survival Rate by Gender")

# Age vs survival
sns.boxplot(data=df, x='survived', y='age', ax=axes[1, 0], palette='Set3')
axes[1, 0].set_title("Age by Survival")
axes[1, 0].set_xticklabels(['Died', 'Survived'])

# Fare vs survival
sns.violinplot(data=df, x='survived', y='fare', ax=axes[1, 1], palette='muted')
axes[1, 1].set_title("Fare by Survival")
axes[1, 1].set_xticklabels(['Died', 'Survived'])
axes[1, 1].set_ylim(0, 200)

fig.suptitle("Bivariate Analysis", fontsize=14, fontweight='bold')
fig.tight_layout()
plt.show()
```

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('titanic')

print("=" * 50)
print("STEP 5: MULTIVARIATE ANALYSIS")
print("=" * 50)

# Correlation heatmap
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

numeric_df = df.select_dtypes(include=[np.number])
corr = numeric_df.corr()
sns.heatmap(corr, annot=True, cmap='coolwarm', center=0,
            fmt='.2f', ax=axes[0])
axes[0].set_title("Correlation Matrix")

# Survival by class and sex
survival_table = df.pivot_table(values='survived',
                                index='pclass', columns='sex',
                                aggfunc='mean')
sns.heatmap(survival_table, annot=True, cmap='RdYlGn',
            fmt='.2f', ax=axes[1])
axes[1].set_title("Survival Rate: Class × Gender")

fig.tight_layout()
plt.show()
```

```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('titanic')

print("=" * 50)
print("STEP 6: INSIGHTS")
print("=" * 50)

insights = """
Key Findings:
1. Overall survival rate: {:.1%}
2. Women survived at much higher rate than men
3. Higher class passengers had better survival odds
4. Age: children had higher survival rate
5. Higher fare correlated with survival
6. Port of embarkation shows different survival patterns
""".format(df['survived'].mean())

print(insights)
```

---

## EDA Checklist

Use this template for every new dataset:

```python
# EDA Checklist Template

def eda_checklist(df):
    """Run through the EDA checklist."""
    print("[ ] 1. Shape and basic info")
    print(f"       Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    print(f"       Types: {df.dtypes.value_counts().to_dict()}")

    print("\n[ ] 2. Missing values")
    missing = df.isnull().sum().sum()
    print(f"       Total missing: {missing} ({missing/(df.shape[0]*df.shape[1])*100:.1f}%)")

    print("\n[ ] 3. Duplicates")
    dupes = df.duplicated().sum()
    print(f"       Duplicate rows: {dupes}")

    print("\n[ ] 4. Numeric summary")
    print(f"       Numeric columns: {df.select_dtypes(include='number').columns.tolist()}")

    print("\n[ ] 5. Categorical summary")
    print(f"       Categorical columns: {df.select_dtypes(include='object').columns.tolist()}")

    print("\n[ ] 6. Target variable")
    print("       (Define your target and check class balance)")

    print("\n[ ] 7. Correlations checked")
    print("\n[ ] 8. Outliers identified")
    print("\n[ ] 9. Visualizations created")
    print("\n[ ] 10. Insights documented")

# Usage
# eda_checklist(df)
```

---

## EDA Best Practices

| Do                                      | Don't                                     |
|-----------------------------------------|-------------------------------------------|
| Start with questions                    | Jump straight to modeling                 |
| Visualize everything                    | Rely only on summary statistics           |
| Check for data leakage                  | Include future information                |
| Document findings                       | Lose insights in throwaway code           |
| Validate assumptions                    | Assume data is clean                      |
| Look at raw data                        | Trust automated reports blindly           |
| Consider domain knowledge               | Ignore context                            |

---

## Try It Yourself

1. Load any CSV dataset and complete all 6 EDA steps
2. Create a missing value visualization for a messy dataset
3. Build a correlation heatmap and identify the 3 strongest correlations
4. Write a function that generates a complete EDA report as plots
5. Use ydata-profiling to generate an automated EDA report

---

## Summary

- **EDA** is the critical first step before any modeling
- Follow the **6-step workflow**: overview → missing → univariate → bivariate → multivariate → insights
- **Univariate**: histograms, box plots, value counts, skewness
- **Bivariate**: scatter plots, correlation, group comparisons
- **Correlation matrix** reveals relationships between all numeric features
- **Outlier detection**: IQR method ($1.5 \times \text{IQR}$) and Z-score ($|z| > 3$)
- **Automated tools** (ydata-profiling, sweetviz) speed up initial exploration
- Always **document insights** and let EDA guide feature engineering and modeling

This completes the Data Visualization module. You now have the skills to create static plots (Matplotlib), statistical visualizations (Seaborn), interactive dashboards (Plotly), and conduct systematic exploratory analysis on any dataset.
