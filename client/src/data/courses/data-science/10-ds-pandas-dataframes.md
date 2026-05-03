---
title: Pandas DataFrames
---

# Pandas DataFrames

In this lesson, you'll master the **DataFrame** — Pandas' primary 2D data structure for working with tabular data. You'll learn column and row operations, filtering, sorting, iteration, and memory optimization.

---

## What is a DataFrame?

A **DataFrame** is a 2D labeled data structure with rows and columns — like a spreadsheet, SQL table, or dictionary of Series.

```
         col1    col2    col3
row0  |  val   |  val  |  val  |
row1  |  val   |  val  |  val  |
row2  |  val   |  val  |  val  |
```

Each column is a **Series**. All columns share the same **index** (row labels).

---

## Creating DataFrames

### Recap: From Dictionary and NumPy

```python
import pandas as pd
import numpy as np

# From dictionary
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA'],
    'salary': [50000, 60000, 75000, 55000, 68000],
})
print(df)
#     name  age     city  salary
# 0  Alice   25      NYC   50000
# 1    Bob   30       LA   60000
# 2  Carol   35  Chicago   75000
# 3   Dave   28      NYC   55000
# 4    Eve   32       LA   68000
```

### From CSV, Excel, JSON

```python
# CSV
df = pd.read_csv('sales_data.csv')

# Excel (requires openpyxl)
df = pd.read_excel('report.xlsx', sheet_name='Sheet1')

# JSON
df = pd.read_json('data.json')

# From URL
url = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv"
df = pd.read_csv(url)
```

### From Clipboard

Copy a table from a webpage or spreadsheet and read it directly:

```python
# Copy a table to clipboard, then:
df = pd.read_clipboard()
```

### From SQL (requires SQLAlchemy)

```python
from sqlalchemy import create_engine

engine = create_engine('sqlite:///database.db')
df = pd.read_sql('SELECT * FROM users', engine)
```

---

## Column Operations

### Accessing Columns

```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'salary': [50000, 60000, 75000, 55000, 68000],
})

# Single column → returns a Series
print(df['name'])
# 0    Alice
# 1      Bob
# 2    Carol
# 3     Dave
# 4      Eve
# Name: name, dtype: object

# Dot notation (works for simple column names)
print(df.age)

# Multiple columns → returns a DataFrame
print(df[['name', 'salary']])
#     name  salary
# 0  Alice   50000
# 1    Bob   60000
# 2  Carol   75000
# 3   Dave   55000
# 4    Eve   68000
```

> **Note:** Use `df['column']` (bracket notation) when column names have spaces or conflict with DataFrame methods.

### Adding Columns

```python
# Add a constant column
df['country'] = 'USA'

# Add from a list/array
df['bonus'] = [5000, 6000, 7500, 5500, 6800]

# Computed column
df['total_comp'] = df['salary'] + df['bonus']
print(df[['name', 'salary', 'bonus', 'total_comp']])
#     name  salary  bonus  total_comp
# 0  Alice   50000   5000       55000
# 1    Bob   60000   6000       66000
# 2  Carol   75000   7500       82500
# 3   Dave   55000   5500       60500
# 4    Eve   68000   6800       74800
```

### Conditional Column

```python
# Create column based on a condition
df['senior'] = df['age'] >= 30
print(df[['name', 'age', 'senior']])
#     name  age  senior
# 0  Alice   25   False
# 1    Bob   30    True
# 2  Carol   35    True
# 3   Dave   28   False
# 4    Eve   32    True

# Multiple conditions with np.where
df['level'] = np.where(df['salary'] >= 65000, 'Senior', 'Junior')
print(df[['name', 'salary', 'level']])
```

### Deleting Columns

```python
# drop() returns a new DataFrame (original unchanged)
df_new = df.drop('bonus', axis=1)

# Drop multiple columns
df_new = df.drop(['bonus', 'country'], axis=1)

# In-place deletion
df.drop('country', axis=1, inplace=True)

# del keyword (modifies in-place)
del df['bonus']
```

### Renaming Columns

```python
# Rename specific columns
df = df.rename(columns={
    'name': 'employee_name',
    'salary': 'base_salary',
})

# Rename all columns at once
df.columns = ['name', 'age', 'salary', 'total', 'is_senior', 'level']

# Standardize column names
df.columns = df.columns.str.lower().str.replace(' ', '_')
```

---

## Row Operations

### Select by Label: `.loc[]`

```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'salary': [50000, 60000, 75000, 55000, 68000],
})

# Single row by index label
print(df.loc[0])
# name      Alice
# age          25
# salary    50000
# Name: 0, dtype: object

# Multiple rows
print(df.loc[1:3])  # INCLUSIVE of end
#     name  age  salary
# 1    Bob   30   60000
# 2  Carol   35   75000
# 3   Dave   28   55000

# Specific rows and columns
print(df.loc[0:2, ['name', 'salary']])
#     name  salary
# 0  Alice   50000
# 1    Bob   60000
# 2  Carol   75000
```

### Select by Position: `.iloc[]`

```python
# First row
print(df.iloc[0])

# Rows 1-3 (end EXCLUDED)
print(df.iloc[1:4])

# Last row
print(df.iloc[-1])

# Specific rows and columns by position
print(df.iloc[0:3, 0:2])
#     name  age
# 0  Alice   25
# 1    Bob   30
# 2  Carol   35
```

### Filtering Rows

The most common operation — selecting rows that meet a condition.

```python
# Single condition
young = df[df['age'] < 30]
print(young)
#     name  age  salary
# 0  Alice   25   50000
# 3   Dave   28   55000

# Multiple conditions (use & for AND, | for OR)
result = df[(df['age'] >= 28) & (df['salary'] > 55000)]
print(result)
#    name  age  salary
# 1   Bob   30   60000
# 2 Carol   35   75000
# 4   Eve   32   68000

# NOT condition
not_nyc = df[~(df['age'] == 25)]
print(not_nyc)
```

### String-Based Filtering

```python
# Filter by string content
df = pd.DataFrame({
    'product': ['Red Widget', 'Blue Gadget', 'Red Doohickey', 'Green Widget'],
    'price': [10, 20, 15, 12],
})

# Products containing 'Widget'
widgets = df[df['product'].str.contains('Widget')]
print(widgets)
#         product  price
# 0    Red Widget     10
# 3  Green Widget     12

# Products starting with 'Red'
red = df[df['product'].str.startswith('Red')]
print(red)
```

### Using `.query()` Method

A cleaner syntax for complex filters.

```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'salary': [50000, 60000, 75000, 55000, 68000],
})

# Equivalent to df[(df['age'] > 28) & (df['salary'] < 70000)]
result = df.query('age > 28 and salary < 70000')
print(result)
#   name  age  salary
# 1  Bob   30   60000
# 4  Eve   32   68000
```

### Adding Rows

```python
# Using pd.concat (recommended)
new_row = pd.DataFrame({'name': ['Frank'], 'age': [40], 'salary': [80000]})
df = pd.concat([df, new_row], ignore_index=True)
print(df.tail(2))
#     name  age  salary
# 4    Eve   32   68000
# 5  Frank   40   80000
```

### Deleting Rows

```python
# Drop by index label
df = df.drop(0)          # Remove row with index 0
df = df.drop([1, 3])    # Remove multiple rows

# Drop by condition (keep rows where age >= 30)
df = df[df['age'] >= 30]
```

---

## Sorting

### Sort by Column Values

```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'salary': [50000, 60000, 75000, 55000, 68000],
})

# Sort by salary (ascending)
print(df.sort_values('salary'))

# Sort by salary (descending)
print(df.sort_values('salary', ascending=False))
#     name  age  salary
# 2  Carol   35   75000
# 4    Eve   32   68000
# 1    Bob   30   60000
# 3   Dave   28   55000
# 0  Alice   25   50000

# Sort by multiple columns
print(df.sort_values(['age', 'salary'], ascending=[True, False]))
```

### Sort by Index

```python
# If index is unordered after operations
df_shuffled = df.sample(frac=1)  # Shuffle rows
df_sorted = df_shuffled.sort_index()
print(df_sorted)
```

---

## Iteration (Use Sparingly)

> **Warning:** Iterating over a DataFrame is slow. Prefer vectorized operations whenever possible.

### iterrows()

```python
# Iterates row by row (returns index, Series pairs)
for index, row in df.iterrows():
    print(f"{row['name']} earns ${row['salary']:,}")
# Alice earns $50,000
# Bob earns $60,000
# ...
```

### itertuples()

Faster than `iterrows()` — returns named tuples.

```python
for row in df.itertuples():
    print(f"{row.name} is {row.age} years old")
# Alice is 25 years old
# Bob is 30 years old
# ...
```

### Vectorized Alternatives (Preferred)

```python
# Instead of loop:
# for i, row in df.iterrows():
#     df.loc[i, 'tax'] = row['salary'] * 0.25

# Use vectorized operation:
df['tax'] = df['salary'] * 0.25

# Instead of complex loop, use apply:
df['category'] = df['salary'].apply(
    lambda x: 'high' if x >= 65000 else 'standard'
)
```

---

## Useful DataFrame Methods

### Copy and Transpose

```python
# Deep copy (independent)
df_copy = df.copy()

# Transpose (swap rows and columns)
print(df.T)
#             0      1      2      3      4
# name    Alice    Bob  Carol   Dave    Eve
# age        25     30     35     28     32
# salary  50000  60000  75000  55000  68000
```

### Unique Values and Counts

```python
# Unique values in a column
print(df['age'].nunique())       # 5
print(df['age'].unique())        # [25 30 35 28 32]

# Value counts across entire DataFrame
print(df['salary'].value_counts())
```

### Top/Bottom N Values

```python
# Top 3 highest salaries
print(df.nlargest(3, 'salary'))
#     name  age  salary
# 2  Carol   35   75000
# 4    Eve   32   68000
# 1    Bob   30   60000

# Bottom 2 lowest ages
print(df.nsmallest(2, 'age'))
#     name  age  salary
# 0  Alice   25   50000
# 3   Dave   28   55000
```

### Replace Values

```python
# Replace specific values
df['city'] = df['city'].replace({'NYC': 'New York', 'LA': 'Los Angeles'})

# Replace across entire DataFrame
df = df.replace(0, np.nan)
```

---

## Memory Optimization

Large DataFrames can consume a lot of memory. Here's how to reduce it.

### Check Memory Usage

```python
# Create a sample DataFrame
df = pd.DataFrame({
    'id': range(100000),
    'category': np.random.choice(['A', 'B', 'C'], 100000),
    'value': np.random.randn(100000),
    'count': np.random.randint(0, 100, 100000),
})

# Check memory usage
print(df.memory_usage(deep=True))
# Index         800000
# id            800000
# category     6100000  ← strings are expensive!
# value         800000
# count         800000
# dtype: int64

print(f"Total: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")
```

### Downcast Numeric Types

```python
# Downcast integers
df['count'] = pd.to_numeric(df['count'], downcast='integer')
# int64 (8 bytes) → int8 (1 byte) if values fit

# Downcast floats
df['value'] = pd.to_numeric(df['value'], downcast='float')
# float64 (8 bytes) → float32 (4 bytes)
```

### Use Category dtype

For columns with few unique values, `category` dtype saves a lot of memory.

```python
# Before: each string stored separately
print(df['category'].dtype)           # object
print(df['category'].memory_usage(deep=True))  # ~6.1 MB

# After: only unique values stored, rows reference them by code
df['category'] = df['category'].astype('category')
print(df['category'].dtype)           # category
print(df['category'].memory_usage(deep=True))  # ~0.1 MB
```

### Memory-Efficient Reading

```python
# Specify dtypes when reading
df = pd.read_csv('large_file.csv', dtype={
    'id': 'int32',
    'category': 'category',
    'value': 'float32',
})

# Read in chunks for very large files
chunks = pd.read_csv('huge_file.csv', chunksize=10000)
for chunk in chunks:
    # Process each chunk
    pass
```

---

## Practical Example: E-Commerce Data Analysis

```python
import pandas as pd
import numpy as np

# Create sample e-commerce data
np.random.seed(42)
n = 200

orders = pd.DataFrame({
    'order_id': range(1001, 1001 + n),
    'customer': np.random.choice(['Alice', 'Bob', 'Carol', 'Dave', 'Eve'], n),
    'product': np.random.choice(['Laptop', 'Phone', 'Tablet', 'Watch', 'Headphones'], n),
    'quantity': np.random.randint(1, 5, n),
    'price': np.round(np.random.uniform(20, 500, n), 2),
    'date': pd.date_range('2024-01-01', periods=n, freq='D'),
})

orders['total'] = orders['quantity'] * orders['price']

# --- Analysis ---

# Top 5 orders by total
print("Top 5 orders:")
print(orders.nlargest(5, 'total')[['order_id', 'customer', 'product', 'total']])

# Total revenue per customer
revenue_by_customer = orders.groupby('customer')['total'].sum().sort_values(ascending=False)
print(f"\nRevenue by customer:\n{revenue_by_customer}")

# Most popular product (by quantity)
product_qty = orders.groupby('product')['quantity'].sum().sort_values(ascending=False)
print(f"\nQuantity sold by product:\n{product_qty}")

# Orders above $500 total
big_orders = orders[orders['total'] > 500]
print(f"\nOrders over $500: {len(big_orders)}")

# Average order value per product
avg_order = orders.groupby('product')['total'].mean().round(2)
print(f"\nAvg order value:\n{avg_order}")

# Monthly revenue
orders['month'] = orders['date'].dt.to_period('M')
monthly = orders.groupby('month')['total'].sum()
print(f"\nMonthly revenue:\n{monthly.head()}")
```

---

## Summary

| Operation | Code |
|-----------|------|
| Access column | `df['col']` or `df.col` |
| Multiple columns | `df[['col1', 'col2']]` |
| Add column | `df['new'] = values` |
| Delete column | `df.drop('col', axis=1)` |
| Rename columns | `df.rename(columns={'old': 'new'})` |
| Select by label | `df.loc[label]` |
| Select by position | `df.iloc[pos]` |
| Filter rows | `df[df['col'] > value]` |
| Sort | `df.sort_values('col')` |
| Top N | `df.nlargest(n, 'col')` |
| Memory check | `df.memory_usage(deep=True)` |

---

## Exercises

1. Create a DataFrame of 10 employees with name, department, salary, and years of experience
2. Add a column `bonus` that is 10% of salary for those with 5+ years experience, else 5%
3. Filter for employees in IT department earning more than $60,000
4. Sort by department (ascending) then salary (descending)
5. Check memory usage and convert string columns to category dtype. Compare before/after.

---
