---
title: Merging & Joining Data
---

# Merging & Joining Data

In the real world, data is rarely in a single table. Customer info might be in one file, orders in another, and products in a third. Merging lets you combine these into one DataFrame for analysis.

---

## Why Merge?

Consider an e-commerce database:

| Table | Contents |
|-------|----------|
| `customers` | id, name, email, city |
| `orders` | order_id, customer_id, product_id, amount |
| `products` | product_id, name, price, category |

To analyze "which customers in NYC bought electronics," you need data from all three tables combined.

---

## Sample Datasets

```python
import pandas as pd

# Customers table
customers = pd.DataFrame({
    'customer_id': [1, 2, 3, 4, 5],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA']
})

# Orders table
orders = pd.DataFrame({
    'order_id': [101, 102, 103, 104, 105, 106],
    'customer_id': [1, 2, 1, 3, 4, 6],  # Note: customer 6 not in customers!
    'product': ['Laptop', 'Phone', 'Tablet', 'Laptop', 'Phone', 'Tablet'],
    'amount': [1200, 800, 450, 1200, 800, 450]
})

print("Customers:")
print(customers)
print("\nOrders:")
print(orders)
```

---

## pd.merge() — SQL-Style Joins

The `pd.merge()` function combines DataFrames based on common columns (keys), similar to SQL JOIN operations.

```python
# Basic syntax
result = pd.merge(left_df, right_df, on='key_column', how='join_type')
```

---

## Join Types

### Inner Join (Default)

Returns only rows where the key exists in **both** DataFrames.

```python
# Inner join — only matching customer_ids
inner = pd.merge(customers, orders, on='customer_id', how='inner')
print(inner)
#    customer_id     name     city  order_id product  amount
# 0            1    Alice      NYC       101  Laptop    1200
# 1            1    Alice      NYC       103  Tablet     450
# 2            2      Bob       LA       102   Phone     800
# 3            3  Charlie      NYC       104  Laptop    1200
# 4            4    Diana  Chicago       105   Phone     800

# Note: Customer 5 (Eve) has no orders → excluded
# Note: Order 106 (customer_id=6) has no customer → excluded
```

### Left Join

Returns **all** rows from the left DataFrame, with matching data from the right. Non-matches get NaN.

```python
# Left join — all customers, matching orders
left = pd.merge(customers, orders, on='customer_id', how='left')
print(left)
#    customer_id     name     city  order_id product  amount
# 0            1    Alice      NYC     101.0  Laptop  1200.0
# 1            1    Alice      NYC     103.0  Tablet   450.0
# 2            2      Bob       LA     102.0   Phone   800.0
# 3            3  Charlie      NYC     104.0  Laptop  1200.0
# 4            4    Diana  Chicago     105.0   Phone   800.0
# 5            5      Eve       LA       NaN    NaN     NaN

# Eve appears with NaN for order columns (she has no orders)
```

### Right Join

Returns **all** rows from the right DataFrame, with matching data from the left.

```python
# Right join — all orders, matching customers
right = pd.merge(customers, orders, on='customer_id', how='right')
print(right)
#    customer_id     name     city  order_id product  amount
# 0            1    Alice      NYC       101  Laptop    1200
# 1            1    Alice      NYC       103  Tablet     450
# 2            2      Bob       LA       102   Phone     800
# 3            3  Charlie      NYC       104  Laptop    1200
# 4            4    Diana  Chicago       105   Phone     800
# 5            6      NaN      NaN       106  Tablet     450

# Order 106 appears with NaN for customer columns (customer 6 not found)
```

### Outer Join (Full)

Returns **all** rows from both DataFrames. Non-matches get NaN on either side.

```python
# Outer join — all customers AND all orders
outer = pd.merge(customers, orders, on='customer_id', how='outer')
print(outer)
#    customer_id     name     city  order_id product  amount
# 0            1    Alice      NYC     101.0  Laptop  1200.0
# 1            1    Alice      NYC     103.0  Tablet   450.0
# 2            2      Bob       LA     102.0   Phone   800.0
# 3            3  Charlie      NYC     104.0  Laptop  1200.0
# 4            4    Diana  Chicago     105.0   Phone   800.0
# 5            5      Eve       LA       NaN    NaN     NaN
# 6            6      NaN      NaN     106.0  Tablet   450.0
```

---

## Join Types Visual Guide

Think of joins like Venn diagrams:

| Join | Result |
|------|--------|
| **Inner** | Only the overlap (both match) |
| **Left** | All of left + overlap from right |
| **Right** | All of right + overlap from left |
| **Outer** | Everything from both sides |

---

## Merging on Different Column Names

When the key column has different names in each DataFrame:

```python
# Different column names
employees = pd.DataFrame({
    'emp_id': [1, 2, 3],
    'name': ['Alice', 'Bob', 'Charlie']
})

salaries = pd.DataFrame({
    'employee_id': [1, 2, 3],
    'salary': [75000, 62000, 95000]
})

# Use left_on and right_on
result = pd.merge(employees, salaries,
                  left_on='emp_id',
                  right_on='employee_id')
print(result)
#    emp_id     name  employee_id  salary
# 0       1    Alice            1   75000
# 1       2      Bob            2   62000
# 2       3  Charlie            3   95000

# Drop the duplicate key column
result = result.drop('employee_id', axis=1)
```

---

## Merging on Multiple Keys

```python
# Sales data with composite key
sales_q1 = pd.DataFrame({
    'store': ['NYC', 'NYC', 'LA', 'LA'],
    'product': ['A', 'B', 'A', 'B'],
    'q1_sales': [100, 150, 200, 80]
})

sales_q2 = pd.DataFrame({
    'store': ['NYC', 'NYC', 'LA', 'LA'],
    'product': ['A', 'B', 'A', 'B'],
    'q2_sales': [120, 130, 180, 95]
})

# Merge on both store AND product
result = pd.merge(sales_q1, sales_q2, on=['store', 'product'])
print(result)
#   store product  q1_sales  q2_sales
# 0   NYC       A       100       120
# 1   NYC       B       150       130
# 2    LA       A       200       180
# 3    LA       B        80        95
```

---

## Handling Duplicate Column Names

When both DataFrames have columns with the same name (besides the key):

```python
df1 = pd.DataFrame({
    'id': [1, 2, 3],
    'score': [88, 92, 75],
    'grade': ['B+', 'A', 'C+']
})

df2 = pd.DataFrame({
    'id': [1, 2, 3],
    'score': [90, 85, 78],
    'grade': ['A-', 'B+', 'C+']
})

# Default suffixes
result = pd.merge(df1, df2, on='id')
print(result)
#    id  score_x grade_x  score_y grade_y

# Custom suffixes
result = pd.merge(df1, df2, on='id', suffixes=('_midterm', '_final'))
print(result)
#    id  score_midterm grade_midterm  score_final grade_final
# 0   1            88           B+           90          A-
# 1   2            92            A           85          B+
# 2   3            75           C+           78          C+
```

---

## Merge Indicator

Track which rows matched and which didn't:

```python
result = pd.merge(customers, orders, on='customer_id',
                  how='outer', indicator=True)
print(result[['customer_id', 'name', 'order_id', '_merge']])
#    customer_id     name  order_id      _merge
# 0            1    Alice     101.0        both
# 1            1    Alice     103.0        both
# 2            2      Bob     102.0        both
# 3            3  Charlie     104.0        both
# 4            4    Diana     105.0        both
# 5            5      Eve       NaN   left_only
# 6            6      NaN     106.0  right_only

# Find unmatched rows
left_only = result[result['_merge'] == 'left_only']
print(f"\nCustomers without orders: {left_only['name'].tolist()}")
```

---

## Merge Validation

Validate the relationship between keys to catch data issues:

```python
# One-to-one: each key appears once in both DataFrames
try:
    result = pd.merge(df1, df2, on='id', validate='one_to_one')
    print("Valid one-to-one merge")
except Exception as e:
    print(f"Validation failed: {e}")

# One-to-many: key appears once in left, possibly many times in right
result = pd.merge(customers, orders, on='customer_id',
                  validate='one_to_many')

# Many-to-one: key appears many times in left, once in right
# Many-to-many: no restriction (default)
```

---

## pd.concat() — Stacking DataFrames

While `merge()` combines columns (horizontal), `concat()` stacks DataFrames (vertical or horizontal).

### Vertical Stacking (axis=0)

```python
# Monthly sales data
jan = pd.DataFrame({
    'product': ['A', 'B', 'C'],
    'sales': [100, 150, 80]
})

feb = pd.DataFrame({
    'product': ['A', 'B', 'C'],
    'sales': [120, 130, 95]
})

mar = pd.DataFrame({
    'product': ['A', 'B', 'C'],
    'sales': [110, 160, 88]
})

# Stack vertically
combined = pd.concat([jan, feb, mar])
print(combined)
#   product  sales
# 0       A    100
# 1       B    150
# 2       C     80
# 0       A    120
# 1       B    130
# 2       C     95
# 0       A    110
# 1       B    160
# 2       C     88

# Reset index
combined = pd.concat([jan, feb, mar], ignore_index=True)
print(combined)  # Index: 0, 1, 2, 3, 4, 5, 6, 7, 8
```

### Adding Source Keys

```python
# Track which source each row came from
combined = pd.concat([jan, feb, mar],
                     keys=['January', 'February', 'March'])
print(combined)
#             product  sales
# January  0       A    100
#          1       B    150
#          2       C     80
# February 0       A    120
#          1       B    130
#          2       C     95
# March    0       A    110
#          1       B    160
#          2       C     88

# Access by key
print(combined.loc['February'])
```

### Horizontal Stacking (axis=1)

```python
# Combine different attributes
names = pd.DataFrame({'name': ['Alice', 'Bob', 'Charlie']})
ages = pd.DataFrame({'age': [25, 30, 35]})
cities = pd.DataFrame({'city': ['NYC', 'LA', 'Chicago']})

combined = pd.concat([names, ages, cities], axis=1)
print(combined)
#       name  age     city
# 0    Alice   25      NYC
# 1      Bob   30       LA
# 2  Charlie   35  Chicago
```

### Handling Mismatched Columns

```python
# DataFrames with different columns
df1 = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
df2 = pd.DataFrame({'A': [5, 6], 'C': [7, 8]})

# Outer join (default) — fills missing with NaN
result = pd.concat([df1, df2], ignore_index=True)
print(result)
#    A    B    C
# 0  1  3.0  NaN
# 1  2  4.0  NaN
# 2  5  NaN  7.0
# 3  6  NaN  8.0

# Inner join — only common columns
result = pd.concat([df1, df2], join='inner', ignore_index=True)
print(result)
#    A
# 0  1
# 1  2
# 2  5
# 3  6
```

---

## df.join() — Merge on Index

The `join()` method merges on the index (or a key column to index):

```python
# DataFrames with meaningful index
scores = pd.DataFrame(
    {'score': [88, 92, 75]},
    index=['Alice', 'Bob', 'Charlie']
)

grades = pd.DataFrame(
    {'grade': ['B+', 'A', 'C+']},
    index=['Alice', 'Bob', 'Charlie']
)

# Join on index
result = scores.join(grades)
print(result)
#          score grade
# Alice       88    B+
# Bob         92     A
# Charlie     75    C+
```

---

## Practical Examples

### Example 1: Customer Orders Analysis

```python
import pandas as pd

# Customer data
customers = pd.DataFrame({
    'customer_id': [1, 2, 3, 4, 5],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA'],
    'segment': ['Premium', 'Basic', 'Premium', 'Basic', 'Premium']
})

# Order data
orders = pd.DataFrame({
    'order_id': range(1001, 1011),
    'customer_id': [1, 2, 1, 3, 4, 2, 5, 1, 3, 5],
    'amount': [150, 80, 200, 350, 90, 120, 250, 175, 300, 180]
})

# Merge customer info with orders
customer_orders = pd.merge(customers, orders, on='customer_id')
print(customer_orders.head())

# Total spending per customer
spending = customer_orders.groupby('name')['amount'].sum().reset_index()
spending.columns = ['name', 'total_spent']

# Merge back with customer info
result = pd.merge(customers, spending, on='name', how='left')
result['total_spent'] = result['total_spent'].fillna(0)
print(result)
```

### Example 2: Combining Monthly Data

```python
import pandas as pd
import numpy as np

# Simulate monthly sales files
months = []
for month_num in range(1, 4):
    month_data = pd.DataFrame({
        'store': ['Store A', 'Store B', 'Store C'],
        'revenue': np.random.randint(10000, 50000, 3),
        'customers': np.random.randint(100, 500, 3)
    })
    month_data['month'] = month_num
    months.append(month_data)

# Combine all months
all_sales = pd.concat(months, ignore_index=True)
print(all_sales)

# Now analyze across all months
print("\nRevenue by store:")
print(all_sales.groupby('store')['revenue'].sum())
```

### Example 3: Merge with Lookup Table

```python
# Product catalog (lookup table)
catalog = pd.DataFrame({
    'product_code': ['P001', 'P002', 'P003', 'P004'],
    'product_name': ['Widget', 'Gadget', 'Doohickey', 'Thingamajig'],
    'category': ['Tools', 'Electronics', 'Tools', 'Electronics'],
    'unit_price': [9.99, 24.99, 4.99, 49.99]
})

# Sales transactions
transactions = pd.DataFrame({
    'transaction_id': range(1, 8),
    'product_code': ['P001', 'P002', 'P001', 'P003', 'P004', 'P002', 'P001'],
    'quantity': [5, 2, 3, 10, 1, 4, 7]
})

# Merge to get product details
enriched = pd.merge(transactions, catalog, on='product_code', how='left')
enriched['total_price'] = enriched['quantity'] * enriched['unit_price']

print(enriched[['transaction_id', 'product_name', 'quantity', 'total_price']])

# Revenue by category
print("\nRevenue by category:")
print(enriched.groupby('category')['total_price'].sum())
```

---

## Common Merge Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Duplicate keys in both tables | Cartesian product (row explosion) | Use `validate='one_to_many'` |
| Wrong join type | Missing or extra rows | Check with `indicator=True` |
| Key type mismatch | int vs string key → no matches | Ensure same dtype: `astype()` |
| Forgetting `how=` | Defaults to inner (loses data) | Explicitly specify join type |
| Multiple same-name columns | Confusing suffixes | Rename before merge or use `suffixes=` |

```python
# Debugging a merge that returns 0 rows
# Check key types
print(f"Left key type: {customers['customer_id'].dtype}")
print(f"Right key type: {orders['customer_id'].dtype}")

# Check key overlap
left_keys = set(customers['customer_id'])
right_keys = set(orders['customer_id'])
print(f"Common keys: {left_keys & right_keys}")
print(f"Left only: {left_keys - right_keys}")
print(f"Right only: {right_keys - left_keys}")
```

---

## Quick Reference

| Task | Code |
|------|------|
| Inner join | `pd.merge(df1, df2, on='key')` |
| Left join | `pd.merge(df1, df2, on='key', how='left')` |
| Right join | `pd.merge(df1, df2, on='key', how='right')` |
| Outer join | `pd.merge(df1, df2, on='key', how='outer')` |
| Different key names | `pd.merge(df1, df2, left_on='a', right_on='b')` |
| Multiple keys | `pd.merge(df1, df2, on=['key1', 'key2'])` |
| Stack vertically | `pd.concat([df1, df2], ignore_index=True)` |
| Stack horizontally | `pd.concat([df1, df2], axis=1)` |
| Join on index | `df1.join(df2)` |
| Track matches | `pd.merge(..., indicator=True)` |
| Validate | `pd.merge(..., validate='one_to_many')` |

---

## Summary

- Use `pd.merge()` for SQL-style joins combining data on shared keys
- **Inner** keeps only matches, **left/right** keeps one side, **outer** keeps everything
- Use `left_on`/`right_on` when key column names differ
- `indicator=True` helps debug which rows matched
- `validate=` catches unexpected many-to-many relationships
- Use `pd.concat()` to stack DataFrames vertically (append rows) or horizontally
- `df.join()` is a shortcut for merging on the index
- Always check key dtypes and overlap when merges return unexpected results

---
