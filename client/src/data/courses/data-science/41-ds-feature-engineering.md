---
title: Feature Engineering
---

# Feature Engineering

Feature engineering is the process of **creating new features** from existing data to improve model performance. It transforms raw data into representations that better capture the underlying patterns.

> "Features win competitions." — Often more impactful than choosing a better algorithm.

---

## Why Feature Engineering Matters

| Aspect | Without FE | With FE |
|--------|-----------|---------|
| Model accuracy | Baseline | Significant improvement |
| Training time | May need complex model | Simpler model can work |
| Interpretability | Raw features | Meaningful features |
| Domain knowledge | Unused | Captured in features |

A good feature makes the relationship between input and target **obvious** to the model.

---

## Numerical Features

### Binning / Discretization

Convert continuous values into categories:

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({'age': [22, 35, 45, 18, 67, 55, 28, 40]})

# Equal-width binning
df['age_bin'] = pd.cut(df['age'], bins=4, labels=['Young', 'Adult', 'Middle', 'Senior'])

# Custom bins
bins = [0, 18, 30, 50, 100]
labels = ['Teen', 'Young Adult', 'Middle Aged', 'Senior']
df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels)

# Quantile-based binning (equal frequency)
df['age_quantile'] = pd.qcut(df['age'], q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])

print(df)
```

**When to bin:** Non-linear relationships, reduce noise, categorical models (decision trees already do this internally).

---

### Log Transform

Handle right-skewed data (long tail to the right):

```python
import numpy as np
import pandas as pd

df = pd.DataFrame({
    'income': [25000, 30000, 35000, 50000, 75000, 200000, 500000, 1000000]
})

# Log transform (use log1p to handle zeros)
df['income_log'] = np.log1p(df['income'])

# Compare distributions
print("Original stats:")
print(f"  Skewness: {df['income'].skew():.2f}")
print(f"  Mean: {df['income'].mean():.0f}")
print(f"  Median: {df['income'].median():.0f}")

print("\nLog-transformed stats:")
print(f"  Skewness: {df['income_log'].skew():.2f}")
print(f"  Mean: {df['income_log'].mean():.2f}")
print(f"  Median: {df['income_log'].median():.2f}")
```

> **Tip:** Use `np.log1p(x)` instead of `np.log(x)` to handle zero values safely. Reverse with `np.expm1(x)`.

---

### Other Transforms

```python
import numpy as np
from scipy import stats

data = np.array([1, 4, 9, 16, 25, 100, 400])

# Square root transform (milder than log)
sqrt_data = np.sqrt(data)

# Box-Cox transform (finds optimal power transform)
# Requires strictly positive values
boxcox_data, lambda_param = stats.boxcox(data)
print(f"Optimal lambda: {lambda_param:.3f}")

# Yeo-Johnson (works with negative values too)
from sklearn.preprocessing import PowerTransformer
pt = PowerTransformer(method='yeo-johnson')
transformed = pt.fit_transform(data.reshape(-1, 1))
```

---

### Polynomial Features

Create interaction terms and higher-degree features:

$$x_1, x_2 \rightarrow x_1, x_2, x_1^2, x_2^2, x_1 \cdot x_2$$

```python
from sklearn.preprocessing import PolynomialFeatures
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'length': [5, 8, 3, 10],
    'width': [2, 4, 1, 6]
})

# Degree 2 polynomial features
poly = PolynomialFeatures(degree=2, include_bias=False)
poly_features = poly.fit_transform(df[['length', 'width']])
poly_names = poly.get_feature_names_out(['length', 'width'])

df_poly = pd.DataFrame(poly_features, columns=poly_names)
print(df_poly)

# Interaction terms only (no squared terms)
poly_interact = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
interact_features = poly_interact.fit_transform(df[['length', 'width']])
interact_names = poly_interact.get_feature_names_out(['length', 'width'])

df_interact = pd.DataFrame(interact_features, columns=interact_names)
print(df_interact)
```

**Use case:** Capturing non-linear relationships without changing model. Area = length × width is a natural interaction.

---

## Categorical Features

### Label Encoding

Map categories to integers — use for **ordinal** data:

```python
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
import pandas as pd

df = pd.DataFrame({
    'education': ['High School', 'Bachelor', 'Master', 'PhD', 'Bachelor', 'Master'],
    'size': ['S', 'M', 'L', 'XL', 'M', 'S']
})

# LabelEncoder (single column)
le = LabelEncoder()
df['education_encoded'] = le.fit_transform(df['education'])

# OrdinalEncoder with custom order
edu_order = [['High School', 'Bachelor', 'Master', 'PhD']]
oe = OrdinalEncoder(categories=edu_order)
df['education_ordinal'] = oe.fit_transform(df[['education']])

print(df)
```

> **Warning:** Don't use label encoding for nominal (unordered) categories — the model will assume 2 > 1 > 0 has meaning.

---

### One-Hot Encoding

Create binary columns for each category:

```python
import pandas as pd
from sklearn.preprocessing import OneHotEncoder

df = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'red', 'blue'],
    'size': ['S', 'M', 'L', 'M', 'S'],
    'price': [10, 20, 30, 15, 25]
})

# Pandas method (quick and easy)
df_encoded = pd.get_dummies(df, columns=['color', 'size'], drop_first=True)
print(df_encoded)

# Scikit-learn method (better for pipelines)
ohe = OneHotEncoder(drop='first', sparse_output=False)
encoded = ohe.fit_transform(df[['color', 'size']])
encoded_df = pd.DataFrame(encoded, columns=ohe.get_feature_names_out())
print(encoded_df)
```

**Pros:** No ordinal assumption. **Cons:** High cardinality → many columns (curse of dimensionality).

---

### Target Encoding

Replace category with mean of the target variable:

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA', 'Chicago', 'NYC', 'LA'],
    'price': [500, 300, 550, 200, 350, 250, 480, 320]
})

# Simple target encoding (careful: data leakage risk!)
city_means = df.groupby('city')['price'].mean()
df['city_encoded'] = df['city'].map(city_means)

print("Target encoding:")
print(df)

# Safer: use cross-validation target encoding
from sklearn.model_selection import KFold

def safe_target_encode(df, col, target, n_splits=5):
    """Target encoding with cross-validation to prevent leakage."""
    encoded = pd.Series(index=df.index, dtype=float)
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)

    for train_idx, val_idx in kf.split(df):
        means = df.iloc[train_idx].groupby(col)[target].mean()
        encoded.iloc[val_idx] = df.iloc[val_idx][col].map(means)

    # Fill missing with global mean
    encoded.fillna(df[target].mean(), inplace=True)
    return encoded

df['city_safe'] = safe_target_encode(df, 'city', 'price')
print(df)
```

---

### Frequency Encoding

Replace category with its count or proportion:

```python
import pandas as pd

df = pd.DataFrame({
    'browser': ['Chrome', 'Firefox', 'Chrome', 'Safari', 'Chrome',
                'Firefox', 'Chrome', 'Safari', 'Chrome', 'Edge']
})

# Count encoding
count_map = df['browser'].value_counts().to_dict()
df['browser_count'] = df['browser'].map(count_map)

# Frequency (proportion) encoding
freq_map = df['browser'].value_counts(normalize=True).to_dict()
df['browser_freq'] = df['browser'].map(freq_map)

print(df)
```

---

## Date/Time Features

### Basic Datetime Extraction

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'timestamp': pd.date_range('2024-01-01', periods=100, freq='3H')
})

# Extract components
df['year'] = df['timestamp'].dt.year
df['month'] = df['timestamp'].dt.month
df['day'] = df['timestamp'].dt.day
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek  # 0=Mon, 6=Sun
df['day_of_year'] = df['timestamp'].dt.dayofyear
df['quarter'] = df['timestamp'].dt.quarter
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['is_month_start'] = df['timestamp'].dt.is_month_start.astype(int)
df['is_month_end'] = df['timestamp'].dt.is_month_end.astype(int)

print(df.head(10))
```

---

### Cyclical Encoding

Months, hours, and days of week are **cyclical** — December (12) is close to January (1). Standard encoding misses this.

Use sine and cosine transforms:

$$x_{sin} = \sin\left(\frac{2\pi \cdot \text{value}}{\text{max\_value}}\right)$$

$$x_{cos} = \cos\left(\frac{2\pi \cdot \text{value}}{\text{max\_value}}\right)$$

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'hour': range(24),
    'month': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] * 2
})

# Cyclical encoding for hour (period = 24)
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)

# Cyclical encoding for month (period = 12)
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

# Now hour 23 and hour 0 are close in the encoded space!
print("Hour 0:  sin={:.3f}, cos={:.3f}".format(df.loc[0, 'hour_sin'], df.loc[0, 'hour_cos']))
print("Hour 23: sin={:.3f}, cos={:.3f}".format(df.loc[23, 'hour_sin'], df.loc[23, 'hour_cos']))
```

---

### Time-Based Features

```python
import pandas as pd

df = pd.DataFrame({
    'user_id': [1, 1, 1, 2, 2],
    'event_date': pd.to_datetime(['2024-01-01', '2024-01-15', '2024-02-01',
                                   '2024-03-01', '2024-03-10']),
    'signup_date': pd.to_datetime(['2023-06-01', '2023-06-01', '2023-06-01',
                                    '2023-12-15', '2023-12-15'])
})

# Days since signup (account age)
df['days_since_signup'] = (df['event_date'] - df['signup_date']).dt.days

# Days between events (per user)
df['days_since_last_event'] = df.groupby('user_id')['event_date'].diff().dt.days

print(df)
```

---

## Text Features

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'review': [
        "Great product! Love it!!!",
        "Terrible quality. Never buying again.",
        "It's okay, nothing special.",
        "AMAZING!! Best purchase ever!!! 5 stars *****"
    ]
})

# Basic text features
df['char_count'] = df['review'].str.len()
df['word_count'] = df['review'].str.split().str.len()
df['avg_word_length'] = df['review'].apply(
    lambda x: np.mean([len(w) for w in x.split()])
)
df['exclamation_count'] = df['review'].str.count('!')
df['question_count'] = df['review'].str.count(r'\?')
df['uppercase_ratio'] = df['review'].apply(
    lambda x: sum(1 for c in x if c.isupper()) / len(x)
)
df['special_char_count'] = df['review'].str.count(r'[^a-zA-Z0-9\s]')

print(df[['review', 'word_count', 'exclamation_count', 'uppercase_ratio']])
```

---

## Domain-Specific Examples

### E-Commerce Features

```python
import pandas as pd
import numpy as np

orders = pd.DataFrame({
    'customer_id': [1, 1, 1, 2, 2, 3, 3, 3, 3],
    'order_date': pd.to_datetime([
        '2024-01-05', '2024-02-10', '2024-03-15',
        '2024-01-20', '2024-04-01',
        '2024-01-01', '2024-01-15', '2024-02-01', '2024-03-01'
    ]),
    'amount': [50, 75, 120, 200, 150, 30, 45, 60, 55]
})

reference_date = pd.to_datetime('2024-04-01')

# RFM features (Recency, Frequency, Monetary)
customer_features = orders.groupby('customer_id').agg(
    recency=('order_date', lambda x: (reference_date - x.max()).days),
    frequency=('order_date', 'count'),
    monetary=('amount', 'sum'),
    avg_order_value=('amount', 'mean'),
    max_order=('amount', 'max'),
    min_order=('amount', 'min'),
    first_purchase=('order_date', 'min'),
    last_purchase=('order_date', 'max')
).reset_index()

# Additional features
customer_features['customer_lifetime'] = (
    customer_features['last_purchase'] - customer_features['first_purchase']
).dt.days
customer_features['purchase_frequency'] = (
    customer_features['frequency'] / customer_features['customer_lifetime'].replace(0, 1)
)

print(customer_features)
```

---

### Finance Features

```python
import pandas as pd
import numpy as np

# Simulated stock data
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=100, freq='D')
prices = 100 + np.cumsum(np.random.randn(100) * 2)

df = pd.DataFrame({'date': dates, 'close': prices})

# Moving averages
df['ma_7'] = df['close'].rolling(window=7).mean()
df['ma_30'] = df['close'].rolling(window=30).mean()

# Price ratios
df['price_to_ma7'] = df['close'] / df['ma_7']
df['ma7_to_ma30'] = df['ma_7'] / df['ma_30']

# Returns
df['daily_return'] = df['close'].pct_change()
df['return_7d'] = df['close'].pct_change(periods=7)

# Volatility (rolling std of returns)
df['volatility_7d'] = df['daily_return'].rolling(window=7).std()

# Momentum
df['momentum_14'] = df['close'] - df['close'].shift(14)

print(df.tail(10))
```

---

## Complete Feature Engineering Pipeline

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import (
    PolynomialFeatures, OneHotEncoder, StandardScaler
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Create sample dataset
np.random.seed(42)
n = 1000
df = pd.DataFrame({
    'age': np.random.randint(18, 70, n),
    'income': np.random.exponential(50000, n),
    'signup_date': pd.date_range('2020-01-01', periods=n, freq='8H'),
    'category': np.random.choice(['A', 'B', 'C', 'D'], n),
    'purchased': np.random.binomial(1, 0.3, n)
})

# --- Feature Engineering ---

# Numerical transforms
df['income_log'] = np.log1p(df['income'])
df['age_squared'] = df['age'] ** 2

# Binning
df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 50, 100],
                          labels=['Young', 'Adult', 'Middle', 'Senior'])

# Date features
df['month'] = df['signup_date'].dt.month
df['day_of_week'] = df['signup_date'].dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['hour'] = df['signup_date'].dt.hour

# Cyclical encoding
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)

# Frequency encoding
freq_map = df['category'].value_counts(normalize=True).to_dict()
df['category_freq'] = df['category'].map(freq_map)

# Interaction feature
df['age_income'] = df['age'] * df['income_log']

# Select features for modeling
feature_cols = ['age', 'income_log', 'age_squared', 'is_weekend',
                'month_sin', 'month_cos', 'hour_sin', 'hour_cos',
                'category_freq', 'age_income']

X = df[feature_cols]
y = df['purchased']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Feature importance
importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("Feature Importances:")
print(importance.to_string(index=False))
print(f"\nTrain accuracy: {model.score(X_train, y_train):.4f}")
print(f"Test accuracy:  {model.score(X_test, y_test):.4f}")
```

---

## Summary

| Technique | Use When | Example |
|-----------|----------|---------|
| Log transform | Skewed numerical data | Income, prices |
| Binning | Non-linear relationships | Age → age_group |
| Polynomial | Interaction effects | Area = L × W |
| One-hot | Nominal categories | Color, city |
| Target encoding | High cardinality | Zip code |
| Cyclical | Periodic features | Hour, month |
| Domain features | Business context | RFM, moving avg |

**Key Principles:**
1. Understand your domain — best features come from domain knowledge
2. Start simple — basic features first, then get creative
3. Validate — always check if new features actually improve performance
4. Watch for leakage — never use future information or target-derived features without CV

---
