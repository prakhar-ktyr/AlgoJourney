---
title: Pandas Series
---

# Pandas Series

In this lesson, you'll dive deep into the Pandas **Series** — the fundamental 1D data structure that forms the building block of DataFrames.

---

## What is a Series?

A **Series** is a one-dimensional labeled array capable of holding any data type (integers, floats, strings, objects, etc.).

Think of it as:
- A single column in a spreadsheet
- A Python dictionary with ordered integer or custom keys
- A NumPy array with labels (index)

```python
import pandas as pd
import numpy as np

s = pd.Series([10, 20, 30, 40, 50])
print(s)
# 0    10
# 1    20
# 2    30
# 3    40
# 4    50
# dtype: int64
```

The left column is the **index** (labels), the right column is the **values**.

---

## Creating a Series

### From a List

```python
# Basic list
s = pd.Series([10, 20, 30, 40])
print(s)
# 0    10
# 1    20
# 2    30
# 3    40
# dtype: int64

# With custom index
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
print(s)
# a    10
# b    20
# c    30
# d    40
# dtype: int64
```

### From a Dictionary

Keys become the index, values become the data.

```python
data = {'apples': 3, 'bananas': 5, 'cherries': 8, 'dates': 2}
s = pd.Series(data)
print(s)
# apples      3
# bananas     5
# cherries    8
# dates       2
# dtype: int64
```

### From a Scalar

A single value repeated for each index label.

```python
s = pd.Series(5, index=['a', 'b', 'c', 'd'])
print(s)
# a    5
# b    5
# c    5
# d    5
# dtype: int64
```

### With a Name

Series can have a name (useful when they become DataFrame columns).

```python
s = pd.Series([100, 200, 300], index=['x', 'y', 'z'], name='revenue')
print(s)
# x    100
# y    200
# z    300
# Name: revenue, dtype: int64

print(s.name)  # 'revenue'
```

---

## Accessing Elements

### By Label with `[]`

```python
s = pd.Series([10, 20, 30, 40, 50], index=['a', 'b', 'c', 'd', 'e'])

# Single element
print(s['a'])       # 10

# Multiple elements (returns a Series)
print(s[['a', 'c', 'e']])
# a    10
# c    30
# e    50
# dtype: int64
```

### By Position with `.iloc[]`

Use integer positions (0-based), just like list indexing.

```python
s = pd.Series([10, 20, 30, 40, 50], index=['a', 'b', 'c', 'd', 'e'])

# Single element by position
print(s.iloc[0])     # 10
print(s.iloc[-1])    # 50

# Slicing by position (end excluded)
print(s.iloc[1:4])
# b    20
# c    30
# d    40
# dtype: int64
```

### By Label with `.loc[]`

Use labels explicitly. Slicing with `.loc` **includes** the end label.

```python
s = pd.Series([10, 20, 30, 40, 50], index=['a', 'b', 'c', 'd', 'e'])

# Single element
print(s.loc['b'])    # 20

# Slice (INCLUSIVE of end label)
print(s.loc['b':'d'])
# b    20
# c    30
# d    40
# dtype: int64
```

> **Important:** `.loc['b':'d']` includes 'd', unlike Python slicing which excludes the end.

### Quick Comparison

| Method | Syntax | Includes End? |
|--------|--------|--------------|
| `[]` | `s['a']` or `s[['a','b']]` | N/A |
| `.iloc[]` | `s.iloc[0:3]` | No (like Python) |
| `.loc[]` | `s.loc['a':'c']` | Yes (inclusive) |

---

## Series Operations

### Arithmetic Operations

Operations are **element-wise** and return a new Series.

```python
s = pd.Series([10, 20, 30, 40, 50])

print(s + 10)    # [20, 30, 40, 50, 60]
print(s * 2)     # [20, 40, 60, 80, 100]
print(s ** 2)    # [100, 400, 900, 1600, 2500]
print(s / 10)    # [1.0, 2.0, 3.0, 4.0, 5.0]
```

### Operations Between Series (Index Alignment)

When operating on two Series, Pandas **aligns by index**. Unmatched indices become `NaN`.

```python
s1 = pd.Series({'a': 1, 'b': 2, 'c': 3})
s2 = pd.Series({'b': 10, 'c': 20, 'd': 30})

print(s1 + s2)
# a     NaN
# b    12.0
# c    23.0
# d     NaN
# dtype: float64
```

Only 'b' and 'c' align — 'a' and 'd' have no match, so they become `NaN`.

### Comparison Operations

Return a boolean Series.

```python
s = pd.Series([10, 20, 30, 40, 50])

print(s > 25)
# 0    False
# 1    False
# 2     True
# 3     True
# 4     True
# dtype: bool

# Use for filtering
print(s[s > 25])
# 2    30
# 3    40
# 4    50
# dtype: int64
```

### String Methods

Access string operations through the `.str` accessor.

```python
names = pd.Series(['Alice Smith', 'Bob Jones', 'Carol White', 'dave brown'])

# Convert to lowercase
print(names.str.lower())
# 0    alice smith
# 1      bob jones
# 2    carol white
# 3     dave brown

# Convert to uppercase
print(names.str.upper())

# Check if contains a pattern
print(names.str.contains('o'))
# 0    False
# 1     True
# 2     True
# 3     True

# Split into parts
print(names.str.split(' '))
# 0    [Alice, Smith]
# 1      [Bob, Jones]
# 2    [Carol, White]
# 3     [dave, brown]

# Get first name
print(names.str.split(' ').str[0])
# 0    Alice
# 1      Bob
# 2    Carol
# 3     dave

# String length
print(names.str.len())
# 0    11
# 1     9
# 2    11
# 3    10

# Replace
print(names.str.replace(' ', '_'))
# 0    Alice_Smith
# 1      Bob_Jones
# 2    Carol_White
# 3     dave_brown
```

### Apply a Function

Transform each element with a custom function.

```python
s = pd.Series([1, 2, 3, 4, 5])

# Lambda function
squared = s.apply(lambda x: x ** 2)
print(squared)  # [1, 4, 9, 16, 25]

# Named function
def classify(x):
    if x >= 4:
        return 'high'
    elif x >= 2:
        return 'medium'
    return 'low'

print(s.apply(classify))
# 0       low
# 1    medium
# 2    medium
# 3      high
# 4      high
# dtype: object
```

### Map Values

Replace values using a dictionary or function.

```python
grades = pd.Series(['A', 'B', 'C', 'A', 'B'])

# Map to numeric values
grade_points = grades.map({'A': 4.0, 'B': 3.0, 'C': 2.0})
print(grade_points)
# 0    4.0
# 1    3.0
# 2    2.0
# 3    4.0
# 4    3.0
# dtype: float64
```

---

## Aggregation

Summarize a Series into a single value.

### Common Aggregations

```python
s = pd.Series([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

print(s.sum())      # 550
print(s.mean())     # 55.0
print(s.median())   # 55.0
print(s.std())      # 30.277 (sample std)
print(s.var())      # 916.67 (sample variance)
print(s.min())      # 10
print(s.max())      # 100
```

### Index of Min/Max

```python
s = pd.Series([30, 10, 50, 20, 40], index=['a', 'b', 'c', 'd', 'e'])

print(s.idxmin())   # 'b' (label of minimum value)
print(s.idxmax())   # 'c' (label of maximum value)
```

### Describe

Get a complete statistical summary.

```python
s = pd.Series([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
print(s.describe())
# count     10.000000
# mean      55.000000
# std       30.276504
# min       10.000000
# 25%       32.500000
# 50%       55.000000
# 75%       77.500000
# max      100.000000
# dtype: float64
```

### Cumulative Functions

```python
s = pd.Series([1, 2, 3, 4, 5])

print(s.cumsum())    # [1, 3, 6, 10, 15]
print(s.cumprod())   # [1, 2, 6, 24, 120]
print(s.cummax())    # [1, 2, 3, 4, 5]
```

---

## Sorting

### Sort by Values

```python
s = pd.Series([30, 10, 50, 20, 40], index=['a', 'b', 'c', 'd', 'e'])

# Ascending (default)
print(s.sort_values())
# b    10
# d    20
# a    30
# e    40
# c    50

# Descending
print(s.sort_values(ascending=False))
# c    50
# e    40
# a    30
# d    20
# b    10
```

### Sort by Index

```python
s = pd.Series([30, 10, 50], index=['c', 'a', 'b'])

print(s.sort_index())
# a    10
# b    50
# c    30
```

### Ranking

```python
s = pd.Series([30, 10, 50, 20, 40])

print(s.rank())
# 0    3.0
# 1    1.0
# 2    5.0
# 3    2.0
# 4    4.0
# dtype: float64
```

---

## Handling Duplicates

```python
s = pd.Series([1, 2, 2, 3, 3, 3, 4, 5, 5])

# Get unique values
print(s.unique())      # [1 2 3 4 5]

# Count unique values
print(s.nunique())     # 5

# Check which are duplicates
print(s.duplicated())
# 0    False
# 1    False
# 2     True   ← second occurrence of 2
# 3    False
# 4     True   ← second occurrence of 3
# 5     True   ← third occurrence of 3
# 6    False
# 7    False
# 8     True   ← second occurrence of 5

# Drop duplicates (keep first occurrence)
print(s.drop_duplicates())
# 0    1
# 1    2
# 3    3
# 6    4
# 7    5

# Value counts
print(s.value_counts())
# 3    3
# 2    2
# 5    2
# 1    1
# 4    1
# dtype: int64
```

---

## Missing Values

Pandas uses `NaN` (Not a Number) to represent missing data.

```python
s = pd.Series([1, 2, np.nan, 4, np.nan, 6])

# Check for missing values
print(s.isna())
# 0    False
# 1    False
# 2     True
# 3    False
# 4     True
# 5    False

# Count missing values
print(s.isna().sum())   # 2

# Check for non-missing values
print(s.notna())

# Drop missing values
print(s.dropna())
# 0    1.0
# 1    2.0
# 3    4.0
# 5    6.0

# Fill missing values with a constant
print(s.fillna(0))
# 0    1.0
# 1    2.0
# 2    0.0
# 3    4.0
# 4    0.0
# 5    6.0

# Fill with the mean
print(s.fillna(s.mean()))
# 0    1.0
# 1    2.0
# 2    3.25  ← mean of [1,2,4,6]
# 3    4.0
# 4    3.25
# 5    6.0

# Forward fill (use previous value)
print(s.ffill())
# 0    1.0
# 1    2.0
# 2    2.0  ← filled from index 1
# 3    4.0
# 4    4.0  ← filled from index 3
# 5    6.0
```

---

## Series vs NumPy Array

| Feature | Pandas Series | NumPy Array |
|---------|--------------|-------------|
| Labels | Custom index | Integer only |
| Alignment | Auto-aligns on index | Must be same length |
| Missing data | `NaN` support built-in | No native support |
| Data types | Mixed types possible | Homogeneous |
| Operations | Label-aware | Position-based |
| Performance | Slightly slower | Fastest |

```python
# NumPy: position-based
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print(a + b)  # [5, 7, 9] — always by position

# Pandas: index-aligned
s1 = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
s2 = pd.Series([4, 5, 6], index=['b', 'c', 'd'])
print(s1 + s2)
# a    NaN
# b    6.0   ← s1['b']=2 + s2['b']=4
# c    8.0   ← s1['c']=3 + s2['c']=5
# d    NaN
```

---

## Practical Example: Sales Analysis

```python
import pandas as pd
import numpy as np

# Monthly sales data
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

sales_2023 = pd.Series(
    [12000, 15000, 18000, 22000, 25000, 28000,
     30000, 27000, 24000, 20000, 18000, 35000],
    index=months, name='Sales 2023'
)

sales_2024 = pd.Series(
    [14000, 17000, 20000, 24000, 28000, 31000,
     33000, 29000, 26000, 22000, 21000, 40000],
    index=months, name='Sales 2024'
)

# Year-over-year growth
growth = ((sales_2024 - sales_2023) / sales_2023 * 100).round(1)
print("YoY Growth (%):")
print(growth)

# Best and worst months
print(f"\nBest month 2024: {sales_2024.idxmax()} (${sales_2024.max():,})")
print(f"Worst month 2024: {sales_2024.idxmin()} (${sales_2024.min():,})")

# Cumulative sales
cumulative = sales_2024.cumsum()
print(f"\nTotal 2024 sales: ${sales_2024.sum():,}")
print(f"Half-year sales: ${sales_2024.iloc[:6].sum():,}")

# Months above average
avg = sales_2024.mean()
above_avg = sales_2024[sales_2024 > avg]
print(f"\nMonths above average (${avg:,.0f}):")
print(above_avg)

# Rolling 3-month average
rolling_avg = sales_2024.rolling(3).mean()
print(f"\n3-month rolling average:")
print(rolling_avg.dropna().round(0))
```

---

## Summary

| Operation | Code |
|-----------|------|
| Create from list | `pd.Series([1, 2, 3])` |
| Create from dict | `pd.Series({'a': 1, 'b': 2})` |
| Access by label | `s.loc['a']` |
| Access by position | `s.iloc[0]` |
| String methods | `s.str.lower()` |
| Apply function | `s.apply(func)` |
| Map values | `s.map(dict)` |
| Aggregation | `s.sum()`, `s.mean()` |
| Sort | `s.sort_values()` |
| Unique values | `s.unique()`, `s.nunique()` |
| Missing values | `s.isna()`, `s.fillna()` |

---

## Exercises

1. Create a Series of temperatures for each day of the week. Find the hottest and coldest days.
2. Create two Series with overlapping indices. Add them and observe the alignment behavior.
3. Given a Series of names, use `.str` methods to extract first names and convert to uppercase.
4. Create a Series with some `NaN` values. Practice `dropna()`, `fillna()`, and `ffill()`.
5. Compute the running total (cumulative sum) of a Series of daily sales figures.

---
