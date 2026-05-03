---
title: Data Types & Conversion
---

# Data Types & Conversion

Understanding and managing data types is fundamental in Pandas. The right types ensure correct operations, save memory, and prevent subtle bugs in your analysis.

---

## Why Data Types Matter

| Concern | Impact |
|---------|--------|
| **Operations** | Can't do math on strings, can't sort dates stored as text |
| **Memory** | int64 uses 8x more memory than int8 for small numbers |
| **Correctness** | "10" + "20" = "1020" (string), but 10 + 20 = 30 (numeric) |
| **Performance** | Operations on correct types are much faster |

```python
import pandas as pd
import numpy as np

# Demonstrate the problem
s_str = pd.Series(['10', '20', '30'])
s_num = pd.Series([10, 20, 30])

print(s_str.sum())   # "102030" — string concatenation!
print(s_num.sum())   # 60 — numeric addition
```

---

## Pandas Data Types

| Dtype | Description | Example Values |
|-------|-------------|----------------|
| `int64` | Integer numbers | 1, 42, -7 |
| `float64` | Decimal numbers | 3.14, -0.5, NaN |
| `object` | Strings or mixed | "hello", "123" |
| `bool` | Boolean values | True, False |
| `datetime64` | Dates and times | 2024-01-15 |
| `timedelta64` | Time differences | 5 days, 2 hours |
| `category` | Limited set of values | "low", "medium", "high" |
| `string` | Proper string type | "hello" (StringDtype) |

---

## Checking Data Types

```python
# Sample DataFrame with various types
df = pd.DataFrame({
    'id': [1, 2, 3, 4, 5],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 22],
    'salary': [50000.0, 65000.0, 72000.0, 58000.0, 45000.0],
    'active': [True, False, True, True, False],
    'joined': ['2020-01-15', '2019-06-20', '2018-03-10',
               '2021-09-05', '2022-11-30']
})

# Check all column types
print(df.dtypes)
# id          int64
# name       object
# age         int64
# salary    float64
# active       bool
# joined     object   ← should be datetime!

# Check a single column
print(df['salary'].dtype)  # float64

# Detailed info
print(df.info())
```

---

## Type Conversion with astype()

The `astype()` method converts a column to a specified type:

```python
# Integer to float
df['age_float'] = df['age'].astype(float)
print(df['age_float'].dtype)  # float64

# Float to integer
df['salary_int'] = df['salary'].astype(int)
print(df['salary_int'].dtype)  # int64

# Number to string
df['id_str'] = df['id'].astype(str)
print(df['id_str'].dtype)  # object

# String to category
df['name_cat'] = df['name'].astype('category')
print(df['name_cat'].dtype)  # category
```

> **Warning:** `astype()` raises an error if conversion fails. Use `pd.to_numeric()` with `errors='coerce'` for safer conversion.

---

## Converting to Numeric

### pd.to_numeric()

The safest way to convert to numbers — handles errors gracefully:

```python
# Clean numeric conversion
messy = pd.Series(['1', '2', '3', 'four', '5', None])

# errors='raise' — raises error on failure (default)
# errors='coerce' — invalid values become NaN
# errors='ignore' — returns original if any fail

result = pd.to_numeric(messy, errors='coerce')
print(result)
# 0    1.0
# 1    2.0
# 2    3.0
# 3    NaN  ← "four" couldn't convert
# 4    5.0
# 5    NaN

print(result.dtype)  # float64
```

### Handling Common Numeric Issues

```python
# String numbers with commas: "1,234"
prices = pd.Series(['1,234', '5,678', '9,012'])
prices_clean = prices.str.replace(',', '').astype(float)
print(prices_clean)
# 0    1234.0
# 1    5678.0
# 2    9012.0

# Currency values: "$99.99"
currency = pd.Series(['$99.99', '$149.50', '$29.00'])
currency_clean = currency.str.replace('$', '', regex=False).astype(float)
print(currency_clean)
# 0     99.99
# 1    149.50
# 2     29.00

# Percentages: "75%"
pcts = pd.Series(['75%', '82%', '91%'])
pcts_clean = pcts.str.replace('%', '', regex=False).astype(float) / 100
print(pcts_clean)
# 0    0.75
# 1    0.82
# 2    0.91

# Mixed numeric and text
mixed = pd.Series(['100kg', '200kg', '150kg'])
nums = mixed.str.extract(r'(\d+)')[0].astype(float)
print(nums)
# 0    100.0
# 1    200.0
# 2    150.0
```

---

## Converting to Datetime

### pd.to_datetime()

```python
# String dates to datetime
df['joined'] = pd.to_datetime(df['joined'])
print(df['joined'].dtype)  # datetime64[ns]

# Various date formats
dates = pd.Series(['01/15/2024', '02/20/2024', '03/25/2024'])
dates_parsed = pd.to_datetime(dates, format='%m/%d/%Y')
print(dates_parsed)

# European format (day/month/year)
eu_dates = pd.Series(['15-01-2024', '20-02-2024', '25-03-2024'])
eu_parsed = pd.to_datetime(eu_dates, format='%d-%m-%Y')

# Handle invalid dates
messy_dates = pd.Series(['2024-01-15', 'not a date', '2024-03-20'])
clean_dates = pd.to_datetime(messy_dates, errors='coerce')
print(clean_dates)
# 0   2024-01-15
# 1          NaT  ← invalid date becomes NaT
# 2   2024-03-20
```

### Extracting Date Components

```python
df['joined'] = pd.to_datetime(df['joined'])

# Extract components
df['year'] = df['joined'].dt.year
df['month'] = df['joined'].dt.month
df['day'] = df['joined'].dt.day
df['day_name'] = df['joined'].dt.day_name()

print(df[['name', 'joined', 'year', 'month', 'day_name']])
```

---

## Boolean Conversion

```python
# Yes/No to boolean
responses = pd.Series(['yes', 'no', 'yes', 'no', 'yes'])
bool_map = {'yes': True, 'no': False}
responses_bool = responses.map(bool_map)
print(responses_bool)

# True/False strings to boolean
tf = pd.Series(['true', 'false', 'True', 'FALSE'])
tf_bool = tf.str.lower().map({'true': True, 'false': False})
print(tf_bool)

# 1/0 to boolean
binary = pd.Series([1, 0, 1, 1, 0])
binary_bool = binary.astype(bool)
print(binary_bool)
# 0     True
# 1    False
# 2     True
# 3     True
# 4    False

# Custom mapping
status = pd.Series(['active', 'inactive', 'active', 'inactive'])
status_bool = (status == 'active')
print(status_bool)
```

---

## Category Type

The category type is memory-efficient for columns with repeated string values.

### Basic Usage

```python
# Convert to category
df['name'] = df['name'].astype('category')
print(df['name'].dtype)  # category
print(df['name'].cat.categories)
# Index(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'], dtype='object')
```

### Ordered Categories

```python
# Create ordered categories
size_type = pd.CategoricalDtype(
    categories=['small', 'medium', 'large'],
    ordered=True
)

sizes = pd.Series(['medium', 'small', 'large', 'medium', 'small'])
sizes_cat = sizes.astype(size_type)
print(sizes_cat)

# Now you can compare!
print(sizes_cat > 'small')
# 0     True   (medium > small)
# 1    False   (small > small? No)
# 2     True   (large > small)
# 3     True
# 4    False
```

### Memory Savings

```python
# Demonstrate memory savings
n = 100000
cities = np.random.choice(['NYC', 'LA', 'Chicago', 'Houston'], size=n)

s_object = pd.Series(cities, dtype='object')
s_category = pd.Series(cities, dtype='category')

print(f"Object:   {s_object.memory_usage(deep=True):>10,} bytes")
print(f"Category: {s_category.memory_usage(deep=True):>10,} bytes")
print(f"Savings:  {1 - s_category.memory_usage(deep=True)/s_object.memory_usage(deep=True):.0%}")
# Typically 90%+ savings for repeated strings!
```

---

## Nullable Types

Standard types have limitations with missing values:
- `int64` cannot hold NaN → gets converted to `float64`

Nullable types solve this with `pd.NA`:

| Standard | Nullable | Supports NA? |
|----------|----------|--------------|
| `int64` | `Int64` | Yes |
| `float64` | `Float64` | Yes |
| `bool` | `boolean` | Yes |
| `object` | `string` | Yes |

```python
# Standard int — converts to float when NaN present
s = pd.Series([1, 2, None, 4])
print(s.dtype)  # float64 (because of None)
print(s)
# 0    1.0
# 1    2.0
# 2    NaN
# 3    4.0

# Nullable Int64 — keeps integer type
s = pd.Series([1, 2, None, 4], dtype='Int64')
print(s.dtype)  # Int64
print(s)
# 0       1
# 1       2
# 2    <NA>
# 3       4

# Nullable boolean
s = pd.Series([True, False, None], dtype='boolean')
print(s)
# 0     True
# 1    False
# 2     <NA>

# Nullable string
s = pd.Series(['hello', None, 'world'], dtype='string')
print(s.dtype)  # string
```

---

## Downcasting for Memory

If your values fit in a smaller type, downcast to save memory:

```python
# Create a DataFrame with small numbers
df_big = pd.DataFrame({
    'small_int': [1, 2, 3, 4, 5],          # fits in int8 (-128 to 127)
    'medium_int': [100, 200, 300, 400, 500], # fits in int16
    'float_col': [1.5, 2.5, 3.5, 4.5, 5.5]
})

print("Before downcasting:")
print(df_big.dtypes)
print(f"Memory: {df_big.memory_usage(deep=True).sum():,} bytes")

# Downcast integers
df_big['small_int'] = pd.to_numeric(df_big['small_int'], downcast='integer')
df_big['medium_int'] = pd.to_numeric(df_big['medium_int'], downcast='integer')
df_big['float_col'] = pd.to_numeric(df_big['float_col'], downcast='float')

print("\nAfter downcasting:")
print(df_big.dtypes)
print(f"Memory: {df_big.memory_usage(deep=True).sum():,} bytes")
```

### Integer Type Ranges

| Type | Bytes | Min | Max |
|------|-------|-----|-----|
| int8 | 1 | $-128$ | $127$ |
| int16 | 2 | $-32{,}768$ | $32{,}767$ |
| int32 | 4 | $-2{,}147{,}483{,}648$ | $2{,}147{,}483{,}647$ |
| int64 | 8 | $-9.2 \times 10^{18}$ | $9.2 \times 10^{18}$ |

---

## Type Conversion Pipeline

```python
import pandas as pd
import numpy as np

def optimize_types(df):
    """Optimize DataFrame memory by converting to appropriate types."""
    df = df.copy()
    start_mem = df.memory_usage(deep=True).sum()

    for col in df.columns:
        col_type = df[col].dtype

        if col_type == 'object':
            # Check if it can be numeric
            try:
                df[col] = pd.to_numeric(df[col])
                continue
            except (ValueError, TypeError):
                pass

            # Check if it can be datetime
            try:
                df[col] = pd.to_datetime(df[col])
                continue
            except (ValueError, TypeError):
                pass

            # Convert to category if few unique values
            n_unique = df[col].nunique()
            n_total = len(df[col])
            if n_unique / n_total < 0.5:  # less than 50% unique
                df[col] = df[col].astype('category')

        elif col_type in ['int64', 'int32']:
            # Downcast integers
            df[col] = pd.to_numeric(df[col], downcast='integer')

        elif col_type in ['float64', 'float32']:
            # Downcast floats
            df[col] = pd.to_numeric(df[col], downcast='float')

    end_mem = df.memory_usage(deep=True).sum()
    reduction = (1 - end_mem / start_mem) * 100
    print(f"Memory: {start_mem:,} → {end_mem:,} bytes ({reduction:.1f}% reduction)")

    return df

# Example usage
raw = pd.DataFrame({
    'id': [1, 2, 3, 4, 5],
    'price': ['$10.99', '$25.50', '$8.00', '$42.99', '$15.75'],
    'quantity': [100, 200, 50, 300, 150],
    'date': ['2024-01-01', '2024-01-02', '2024-01-03',
             '2024-01-04', '2024-01-05'],
    'category': ['A', 'B', 'A', 'C', 'B'],
    'active': ['yes', 'no', 'yes', 'yes', 'no']
})

# Manual pipeline first (to handle currency)
raw['price'] = raw['price'].str.replace('$', '', regex=False).astype(float)
raw['active'] = raw['active'].map({'yes': True, 'no': False})

# Then optimize
optimized = optimize_types(raw)
print(optimized.dtypes)
```

---

## Common Type Issues and Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Numbers as strings | `"100"` + `"200"` = `"100200"` | `pd.to_numeric(col, errors='coerce')` |
| Currency strings | `"$1,234.56"` | Strip `$` and `,`, then `astype(float)` |
| Percentages | `"75%"` | Strip `%`, convert, divide by 100 |
| Dates as strings | Can't sort chronologically | `pd.to_datetime(col)` |
| Int with NaN | Converts to float64 | Use nullable `Int64` dtype |
| High memory usage | Repeated strings | Convert to `category` |
| Mixed types in column | Operations fail | Clean first, then convert |
| Boolean as int | 0/1 instead of True/False | `col.astype(bool)` |

---

## Practical Example

```python
import pandas as pd
import numpy as np

# Simulating data loaded from a CSV (everything as strings)
raw = pd.DataFrame({
    'employee_id': ['001', '002', '003', '004', '005'],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'salary': ['$75,000', '$62,000', '$95,000', '$58,000', '$45,000'],
    'bonus_pct': ['15%', '10%', '20%', '12%', '8%'],
    'start_date': ['2020-01-15', '2019-06-20', '2018-03-10',
                   '2021-09-05', '2022-11-30'],
    'department': ['Eng', 'Sales', 'Eng', 'Sales', 'Eng'],
    'is_manager': ['yes', 'no', 'yes', 'no', 'no'],
    'rating': ['4.5', '3.0', '4.8', '3.5', None]
})

print("=== Before Conversion ===")
print(raw.dtypes)
print(f"Memory: {raw.memory_usage(deep=True).sum():,} bytes\n")

# Convert types
clean = raw.copy()
clean['salary'] = clean['salary'].str.replace(r'[$,]', '', regex=True).astype(float)
clean['bonus_pct'] = clean['bonus_pct'].str.rstrip('%').astype(float) / 100
clean['start_date'] = pd.to_datetime(clean['start_date'])
clean['department'] = clean['department'].astype('category')
clean['is_manager'] = clean['is_manager'].map({'yes': True, 'no': False})
clean['rating'] = pd.to_numeric(clean['rating'], errors='coerce')

# Calculate bonus amount (now possible with correct types!)
clean['bonus_amount'] = clean['salary'] * clean['bonus_pct']

# Calculate tenure (now possible with datetime!)
clean['tenure_days'] = (pd.Timestamp.now() - clean['start_date']).dt.days

print("=== After Conversion ===")
print(clean.dtypes)
print(f"Memory: {clean.memory_usage(deep=True).sum():,} bytes\n")
print(clean[['name', 'salary', 'bonus_amount', 'tenure_days']])
```

---

## Summary

- Always check types with `df.dtypes` before analysis
- Use `pd.to_numeric(errors='coerce')` for safe numeric conversion
- Use `pd.to_datetime()` for date strings
- Category type saves memory for repeated strings (up to 90%+ savings)
- Nullable types (`Int64`, `boolean`, `string`) properly handle missing values
- Downcast numbers to save memory: int64 → int8 if values fit in range $[-128, 127]$
- Clean string formatting (remove `$`, `,`, `%`) before type conversion
- Build reusable type conversion pipelines for consistent data loading

---
