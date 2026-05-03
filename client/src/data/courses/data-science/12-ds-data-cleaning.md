---
title: Data Cleaning
---

# Data Cleaning

Data cleaning is the process of fixing or removing incorrect, corrupted, duplicate, or incomplete data. It's the most time-consuming but most critical step in any data science project.

> **"Garbage in, garbage out."** — If your data is dirty, your analysis and models will produce unreliable results. Data scientists spend up to 80% of their time cleaning data.

---

## Common Data Quality Issues

| Issue | Example | Impact |
|-------|---------|--------|
| Missing values | Empty cells, NaN | Errors in calculations |
| Duplicates | Same record twice | Inflated counts/stats |
| Inconsistent formatting | "NYC", "New York", "new york" | Wrong groupings |
| Outliers | Age = 999 | Skewed statistics |
| Wrong data types | Numbers stored as text | Operations fail |
| Invalid values | Negative age, future dates | Wrong conclusions |

---

## Sample Messy Dataset

```python
import pandas as pd
import numpy as np

# Create a messy dataset
data = {
    'name': ['Alice', 'Bob', 'CHARLIE', 'diana', 'Eve',
             'Bob', 'Alice', 'Frank'],
    'age': [25, 30, 35, -5, 22, 30, 25, 200],
    'city': ['NYC', 'new york', 'LA', 'NYC ', ' la', 'New York',
             'NYC', 'Chicago'],
    'email': ['alice@mail.com', 'bob@mail', 'charlie@mail.com',
              'diana@mail.com', '', 'bob@mail.com',
              'alice@mail.com', 'frank@mail.com'],
    'salary': ['$50,000', '$65,000', '72000', '$58,000',
               '$45,000', '$65,000', '$50,000', None],
    'score': [88, 92, 75, 95, None, 92, 88, 80]
}

df = pd.DataFrame(data)
print(df)
print(f"\nShape: {df.shape}")
print(f"\nData types:\n{df.dtypes}")
```

---

## Removing Duplicates

### Detecting Duplicates

```python
# Check for duplicate rows
print(df.duplicated())
# Returns True for duplicate rows (keeps first by default)

# Count duplicates
print(f"Duplicate rows: {df.duplicated().sum()}")

# Check duplicates based on specific columns
print(df.duplicated(subset=['name', 'age']))

# View the duplicate rows
print(df[df.duplicated(keep=False)])  # Shows ALL duplicates
```

### Removing Duplicates

```python
# Remove exact duplicate rows
df_clean = df.drop_duplicates()
print(f"Before: {len(df)} rows, After: {len(df_clean)} rows")

# Remove duplicates based on specific columns
df_clean = df.drop_duplicates(subset=['name', 'age'])

# Keep last occurrence instead of first
df_clean = df.drop_duplicates(subset=['name'], keep='last')

# Remove ALL duplicates (keep none)
df_clean = df.drop_duplicates(subset=['name'], keep=False)
```

---

## Handling Outliers

Outliers are values that are significantly different from the rest of the data. They can distort analysis and models.

### IQR Method

The Interquartile Range method identifies outliers outside the "fences":

$$\text{Lower fence} = Q_1 - 1.5 \times IQR$$
$$\text{Upper fence} = Q_3 + 1.5 \times IQR$$

where $IQR = Q_3 - Q_1$

```python
def detect_outliers_iqr(df, column):
    """Detect outliers using the IQR method."""
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    return outliers, lower_bound, upper_bound

# Detect age outliers
outliers, lb, ub = detect_outliers_iqr(df, 'age')
print(f"Age bounds: [{lb}, {ub}]")
print(f"Outliers:\n{outliers[['name', 'age']]}")
```

### Z-Score Method

The Z-score measures how many standard deviations a value is from the mean:

$$z = \frac{x - \mu}{\sigma}$$

Values with $|z| > 3$ are typically considered outliers.

```python
def detect_outliers_zscore(df, column, threshold=3):
    """Detect outliers using Z-score."""
    mean = df[column].mean()
    std = df[column].std()

    df['z_score'] = (df[column] - mean) / std
    outliers = df[df['z_score'].abs() > threshold]

    df.drop('z_score', axis=1, inplace=True)
    return outliers

outliers = detect_outliers_zscore(df, 'age')
print(f"Z-score outliers:\n{outliers[['name', 'age']]}")
```

### Winsorization (Capping)

Replace outliers with boundary values instead of removing them:

```python
def winsorize(df, column, lower_pct=0.05, upper_pct=0.95):
    """Cap outliers at specified percentiles."""
    lower = df[column].quantile(lower_pct)
    upper = df[column].quantile(upper_pct)

    df[column] = df[column].clip(lower=lower, upper=upper)
    return df

# Cap age at 5th and 95th percentile
df_capped = winsorize(df.copy(), 'age')
print(df_capped['age'])
```

### Removing Outliers

```python
# Remove rows where age is outside valid range
df_clean = df[(df['age'] > 0) & (df['age'] < 120)]
print(f"Removed {len(df) - len(df_clean)} invalid age rows")
```

---

## Standardizing Text

Inconsistent text formatting is one of the most common data issues.

### Case and Whitespace

```python
# Strip whitespace
df['city'] = df['city'].str.strip()

# Convert to consistent case
df['city'] = df['city'].str.title()  # "new york" → "New York"
df['name'] = df['name'].str.title()  # "CHARLIE" → "Charlie"

print(df[['name', 'city']])
```

### String Methods

```python
# Lower case
df['city_lower'] = df['city'].str.lower()

# Upper case
df['city_upper'] = df['city'].str.upper()

# Replace substrings
df['city'] = df['city'].str.replace('Nyc', 'New York')

# Remove specific characters
df['salary_clean'] = df['salary'].str.replace('$', '', regex=False)
df['salary_clean'] = df['salary_clean'].str.replace(',', '', regex=False)
```

### Standardizing Categories

```python
# Map inconsistent values to standard ones
city_mapping = {
    'Nyc': 'New York',
    'La': 'Los Angeles',
    'New York': 'New York',
    'Los Angeles': 'Los Angeles',
    'Chicago': 'Chicago'
}

df['city'] = df['city'].map(city_mapping).fillna(df['city'])

# Or use replace for partial fixes
df['city'] = df['city'].replace({
    'Nyc': 'New York',
    'La': 'Los Angeles'
})

print(df['city'].value_counts())
```

---

## Correcting Data Types

Data often arrives with wrong types — numbers as strings, dates as objects:

```python
# Check current types
print(df.dtypes)

# Convert salary string to numeric
df['salary'] = (df['salary']
    .str.replace('$', '', regex=False)
    .str.replace(',', '', regex=False)
    .astype(float))

# Convert to appropriate numeric type
df['age'] = pd.to_numeric(df['age'], errors='coerce')

print(df.dtypes)
```

> **Note:** Detailed coverage of data types is in the next lesson.

---

## Validating Data

After cleaning, validate that the data makes sense.

### Range Checks

```python
# Age should be between 0 and 120
assert df['age'].dropna().between(0, 120).all(), "Invalid ages found!"

# Score should be between 0 and 100
assert df['score'].dropna().between(0, 100).all(), "Invalid scores!"

# Salary should be positive
assert (df['salary'].dropna() > 0).all(), "Negative salary found!"
```

### Pattern Validation

```python
import re

def is_valid_email(email):
    """Check if email matches basic pattern."""
    if pd.isna(email) or email == '':
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# Validate emails
df['valid_email'] = df['email'].apply(is_valid_email)
print(df[['name', 'email', 'valid_email']])

# Filter out invalid emails
invalid_emails = df[~df['valid_email']]
print(f"\nInvalid emails: {len(invalid_emails)}")
```

### Cross-Field Validation

```python
# Salary should correlate with experience (basic check)
# Junior (age < 25) shouldn't earn more than 100000
junior_high_salary = df[(df['age'] < 25) & (df['salary'] > 100000)]
if len(junior_high_salary) > 0:
    print("Warning: Juniors with unusually high salary found")
```

---

## Data Cleaning Pipeline

Combine all steps into a reusable function:

```python
import pandas as pd
import numpy as np

def clean_dataset(df):
    """Complete data cleaning pipeline."""
    print(f"Starting shape: {df.shape}")
    df = df.copy()

    # Step 1: Remove exact duplicates
    df = df.drop_duplicates()
    print(f"After removing duplicates: {df.shape}")

    # Step 2: Standardize text columns
    text_cols = df.select_dtypes(include='object').columns
    for col in text_cols:
        df[col] = df[col].str.strip()

    # Step 3: Standardize names
    if 'name' in df.columns:
        df['name'] = df['name'].str.title()

    # Step 4: Standardize cities
    if 'city' in df.columns:
        df['city'] = df['city'].str.title()
        city_map = {'Nyc': 'New York', 'La': 'Los Angeles'}
        df['city'] = df['city'].replace(city_map)

    # Step 5: Fix salary (remove $ and commas)
    if 'salary' in df.columns:
        df['salary'] = (df['salary']
            .str.replace(r'[$,]', '', regex=True)
            .astype(float))

    # Step 6: Handle invalid ages
    if 'age' in df.columns:
        df['age'] = pd.to_numeric(df['age'], errors='coerce')
        df.loc[~df['age'].between(0, 120), 'age'] = np.nan

    # Step 7: Report missing values
    missing = df.isna().sum()
    if missing.any():
        print(f"\nMissing values:\n{missing[missing > 0]}")

    print(f"\nFinal shape: {df.shape}")
    return df

# Run the pipeline
df_cleaned = clean_dataset(df)
print(df_cleaned)
```

---

## Complete Example

```python
import pandas as pd
import numpy as np

# Load messy data
raw_data = pd.DataFrame({
    'Customer': ['  john DOE', 'Jane Smith', 'john doe',
                 'BOB WILSON', 'jane smith', 'Alice Brown'],
    'Purchase': ['$1,299.99', '$450.00', '$1,299.99',
                 '$89.50', '$450.00', '$2,500.00'],
    'Date': ['2024-01-15', '2024-01-16', '2024-01-15',
             '2024-13-01', '2024-01-16', '2024-01-17'],
    'Rating': [4.5, 3.0, 4.5, -1, 3.0, 6.0]
})

print("=== RAW DATA ===")
print(raw_data)

# Clean it
clean = raw_data.copy()

# 1. Standardize names
clean['Customer'] = clean['Customer'].str.strip().str.title()

# 2. Remove duplicates
clean = clean.drop_duplicates()

# 3. Fix purchase amounts
clean['Purchase'] = (clean['Purchase']
    .str.replace('$', '', regex=False)
    .str.replace(',', '', regex=False)
    .astype(float))

# 4. Fix dates (invalid dates become NaT)
clean['Date'] = pd.to_datetime(clean['Date'], errors='coerce')

# 5. Fix ratings (valid range: 1-5)
clean.loc[~clean['Rating'].between(1, 5), 'Rating'] = np.nan

print("\n=== CLEAN DATA ===")
print(clean)
print(f"\nRemoved {len(raw_data) - len(clean)} duplicate rows")
print(f"Invalid dates: {clean['Date'].isna().sum()}")
print(f"Invalid ratings: {clean['Rating'].isna().sum()}")
```

---

## Data Cleaning Checklist

Use this checklist for every dataset:

| Step | Action | Code |
|------|--------|------|
| 1 | Check shape and types | `df.shape`, `df.dtypes` |
| 2 | Preview data | `df.head()`, `df.sample(5)` |
| 3 | Check missing values | `df.isna().sum()` |
| 4 | Remove duplicates | `df.drop_duplicates()` |
| 5 | Fix text inconsistencies | `.str.strip().str.title()` |
| 6 | Convert data types | `.astype()`, `pd.to_numeric()` |
| 7 | Handle outliers | IQR or Z-score method |
| 8 | Validate ranges | `.between()`, assertions |
| 9 | Handle missing values | See next lesson |
| 10 | Final verification | `df.info()`, `df.describe()` |

---

## Best Practices

1. **Always work on a copy**: `df_clean = df.copy()` — keep the original intact
2. **Document your decisions**: note why you removed or changed values
3. **Clean in a consistent order**: duplicates → types → text → outliers → missing
4. **Automate with functions**: write reusable cleaning pipelines
5. **Validate after cleaning**: check that the cleaned data makes sense
6. **Log what was removed**: track how many rows/values were affected

---

## Summary

- Data cleaning is essential — dirty data leads to wrong conclusions
- Remove duplicates with `drop_duplicates()`
- Detect outliers using IQR ($Q_1 - 1.5 \times IQR$ to $Q_3 + 1.5 \times IQR$) or Z-scores ($|z| > 3$)
- Standardize text with `.str.strip()`, `.str.title()`, `.replace()`
- Validate data with range checks, pattern matching, and assertions
- Build reusable cleaning pipelines for consistency

---
