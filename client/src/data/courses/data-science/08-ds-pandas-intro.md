---
title: Introduction to Pandas
---

# Introduction to Pandas

In this lesson, you'll learn about Pandas — the most popular Python library for data manipulation and analysis. It makes working with structured (tabular) data fast, easy, and expressive.

---

## What is Pandas?

**Pandas** is an open-source Python library that provides high-performance, easy-to-use data structures and data analysis tools.

The name comes from **"Panel Data"** — a term used in statistics and econometrics for multi-dimensional structured datasets.

### Why Use Pandas?

- Work with **tabular data** (rows and columns, like spreadsheets or SQL tables)
- Handle **missing data** gracefully
- Perform powerful **data transformations** (filtering, grouping, merging)
- Read/write many file formats (CSV, Excel, JSON, SQL, Parquet)
- Built-in **time series** functionality
- Integrates seamlessly with NumPy, Matplotlib, and scikit-learn

---

## Importing Pandas

The standard convention is to import Pandas as `pd`:

```python
import pandas as pd
import numpy as np  # Often used alongside Pandas
```

Check your version:

```python
print(pd.__version__)  # e.g., 2.2.0
```

---

## Two Main Data Structures

Pandas has two primary data structures:

| Structure | Dimensions | Analogy |
|-----------|-----------|---------|
| **Series** | 1D | A single column |
| **DataFrame** | 2D | A full table/spreadsheet |

### Series: 1D Labeled Array

A Series is like a single column of data with an index (labels).

```python
# Simple Series
s = pd.Series([10, 20, 30, 40])
print(s)
# 0    10
# 1    20
# 2    30
# 3    40
# dtype: int64
```

### DataFrame: 2D Labeled Table

A DataFrame is a collection of Series that share the same index — like a table with rows and columns.

```python
# Simple DataFrame
df = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Carol'],
    'Age': [25, 30, 35],
    'City': ['NYC', 'LA', 'Chicago']
})
print(df)
#     Name  Age     City
# 0  Alice   25      NYC
# 1    Bob   30       LA
# 2  Carol   35  Chicago
```

---

## Creating DataFrames

### From a Dictionary

The most common way — keys become column names, values become column data.

```python
data = {
    'Product': ['Laptop', 'Phone', 'Tablet', 'Watch'],
    'Price': [999, 699, 449, 299],
    'Stock': [50, 200, 150, 300],
}

df = pd.DataFrame(data)
print(df)
#   Product  Price  Stock
# 0  Laptop    999     50
# 1   Phone    699    200
# 2  Tablet    449    150
# 3   Watch    299    300
```

### From a List of Dictionaries

Each dictionary represents a row.

```python
records = [
    {'name': 'Alice', 'score': 95, 'grade': 'A'},
    {'name': 'Bob', 'score': 82, 'grade': 'B'},
    {'name': 'Carol', 'score': 91, 'grade': 'A'},
]

df = pd.DataFrame(records)
print(df)
#     name  score grade
# 0  Alice     95     A
# 1    Bob     82     B
# 2  Carol     91     A
```

### From a NumPy Array

```python
import numpy as np

arr = np.array([[1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]])

df = pd.DataFrame(arr, columns=['A', 'B', 'C'])
print(df)
#    A  B  C
# 0  1  2  3
# 1  4  5  6
# 2  7  8  9
```

### From a CSV File

```python
# Read from a CSV file
df = pd.read_csv('data.csv')

# Common parameters
df = pd.read_csv(
    'data.csv',
    sep=',',              # Delimiter (default: comma)
    header=0,            # Row number for column names
    index_col=None,      # Column to use as index
    usecols=['A', 'B'],  # Only read specific columns
    nrows=100,           # Only read first 100 rows
    na_values=['NA', ''],  # Values to treat as NaN
)
```

---

## Quick Exploration

Once you have a DataFrame, explore it before doing anything else.

### Viewing Data

```python
# Sample data
df = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve',
             'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'],
    'Age': [25, 30, 35, 28, 32, 45, 29, 38, 27, 41],
    'Salary': [50000, 60000, 75000, 55000, 68000,
               90000, 52000, 72000, 48000, 85000],
    'Department': ['HR', 'IT', 'IT', 'HR', 'Finance',
                   'IT', 'HR', 'Finance', 'IT', 'Finance'],
})

# First 5 rows (default)
print(df.head())

# Last 3 rows
print(df.tail(3))

# Random sample of 5 rows
print(df.sample(5))
```

### Shape and Columns

```python
# Dimensions (rows, columns)
print(df.shape)     # (10, 4)

# Column names
print(df.columns)
# Index(['Name', 'Age', 'Salary', 'Department'], dtype='object')

# Data types of each column
print(df.dtypes)
# Name          object
# Age            int64
# Salary         int64
# Department    object
# dtype: object
```

### Info and Describe

```python
# Detailed info: types, non-null counts, memory usage
df.info()
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 10 entries, 0 to 9
# Data columns (total 4 columns):
#  #   Column      Non-Null Count  Dtype
# ---  ------      --------------  -----
#  0   Name        10 non-null     object
#  1   Age         10 non-null     int64
#  2   Salary      10 non-null     int64
#  3   Department  10 non-null     object
# memory usage: 448 bytes

# Statistical summary (numeric columns)
print(df.describe())
#              Age        Salary
# count  10.00000     10.000000
# mean   33.00000     65500.000
# std     6.58281     14361.407
# min    25.00000     48000.000
# 25%    28.25000     52750.000
# 50%    31.00000     64000.000
# 75%    37.25000     74250.000
# max    45.00000     90000.000
```

### Value Counts

```python
# Count occurrences of each value in a column
print(df['Department'].value_counts())
# IT         4
# HR         3
# Finance    3
# Name: Department, dtype: int64
```

---

## Setting Display Options

Control how Pandas displays data in your notebook or terminal.

```python
# Show all columns (no truncation)
pd.set_option('display.max_columns', None)

# Show more rows
pd.set_option('display.max_rows', 100)

# Show more width
pd.set_option('display.width', 200)

# Control float precision
pd.set_option('display.precision', 2)

# Reset all options to default
pd.reset_option('all')
```

```python
# Context manager (temporary change)
with pd.option_context('display.max_rows', 5):
    print(df)  # Only shows 5 rows max
```

---

## Index

Every DataFrame has an **index** — labels for the rows.

### Default Index

By default, Pandas assigns a `RangeIndex` (0, 1, 2, ...).

```python
df = pd.DataFrame({'A': [10, 20, 30]})
print(df.index)  # RangeIndex(start=0, stop=3, step=1)
```

### Custom Index

Set a column as the index:

```python
df = pd.DataFrame({
    'ID': ['E001', 'E002', 'E003'],
    'Name': ['Alice', 'Bob', 'Carol'],
    'Salary': [50000, 60000, 75000],
})

# Set 'ID' as the index
df = df.set_index('ID')
print(df)
#        Name  Salary
# ID
# E001  Alice   50000
# E002    Bob   60000
# E003  Carol   75000

# Access by index label
print(df.loc['E002'])
# Name       Bob
# Salary    60000
# Name: E002, dtype: object
```

### Reset Index

Convert the index back to a regular column:

```python
df_reset = df.reset_index()
print(df_reset)
#      ID   Name  Salary
# 0  E001  Alice   50000
# 1  E002    Bob   60000
# 2  E003  Carol   75000
```

---

## Built-in Datasets for Practice

While Pandas doesn't bundle datasets, you can easily access them:

```python
# From seaborn (install: pip install seaborn)
import seaborn as sns
tips = sns.load_dataset('tips')
iris = sns.load_dataset('iris')
titanic = sns.load_dataset('titanic')

# From a URL
url = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv"
tips = pd.read_csv(url)
```

### Quick Practice Dataset

```python
# Create a sample dataset for practice
np.random.seed(42)
n = 100

df = pd.DataFrame({
    'student_id': range(1, n + 1),
    'name': [f'Student_{i}' for i in range(1, n + 1)],
    'math': np.random.randint(50, 100, n),
    'science': np.random.randint(50, 100, n),
    'english': np.random.randint(50, 100, n),
    'grade': np.random.choice(['A', 'B', 'C', 'D'], n),
})

print(df.head())
#    student_id       name  math  science  english grade
# 0           1  Student_1    92       78       85     B
# 1           2  Student_2    71       95       62     A
# 2           3  Student_3    64       88       91     C
# ...
```

---

## Practical Example: Exploring a Dataset

Let's put it all together with a complete exploration workflow.

```python
import pandas as pd
import numpy as np

# Create sample sales data
np.random.seed(42)
n = 50

sales = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=n, freq='D'),
    'product': np.random.choice(['Widget', 'Gadget', 'Doohickey'], n),
    'quantity': np.random.randint(1, 50, n),
    'price': np.round(np.random.uniform(5, 100, n), 2),
    'region': np.random.choice(['North', 'South', 'East', 'West'], n),
})

# Add revenue column
sales['revenue'] = sales['quantity'] * sales['price']

# --- Exploration ---

# Shape
print(f"Dataset: {sales.shape[0]} rows × {sales.shape[1]} columns")
# Dataset: 50 rows × 6 columns

# First few rows
print(sales.head())

# Data types
print(sales.dtypes)

# Summary statistics
print(sales.describe())

# Check for missing values
print(sales.isna().sum())
# date        0
# product     0
# quantity    0
# price       0
# region      0
# revenue     0

# Value counts
print(sales['product'].value_counts())
print(sales['region'].value_counts())

# Quick insights
print(f"\nTotal revenue: ${sales['revenue'].sum():,.2f}")
print(f"Average order: ${sales['revenue'].mean():,.2f}")
print(f"Top product: {sales.groupby('product')['revenue'].sum().idxmax()}")
```

---

## DataFrame vs Other Formats

| Feature | Pandas DataFrame | Excel | SQL Table | NumPy Array |
|---------|-----------------|-------|-----------|-------------|
| Mixed types | Yes | Yes | Yes | No |
| Named columns | Yes | Yes | Yes | No |
| Index labels | Yes | Row numbers | Primary key | Integer only |
| Missing values | NaN | Empty cells | NULL | Not native |
| Size limit | RAM | ~1M rows | Disk | RAM |

---

## Summary

| Operation | Code |
|-----------|------|
| Import | `import pandas as pd` |
| Create from dict | `pd.DataFrame({'col': [...]})` |
| Read CSV | `pd.read_csv('file.csv')` |
| First rows | `df.head()` |
| Shape | `df.shape` |
| Info | `df.info()` |
| Statistics | `df.describe()` |
| Value counts | `df['col'].value_counts()` |
| Set index | `df.set_index('col')` |
| Reset index | `df.reset_index()` |

---

## Exercises

1. Create a DataFrame with 5 columns: name, age, city, salary, department (at least 8 rows)
2. Use `.info()` and `.describe()` to explore your DataFrame
3. Set one column as the index, then reset it
4. Read a CSV file from a URL and display the first 10 rows
5. Find the most common value in each column using `.value_counts()`

---
