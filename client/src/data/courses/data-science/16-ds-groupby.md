---
title: GroupBy & Aggregation
---

# GroupBy & Aggregation

GroupBy is one of the most powerful tools in pandas for data analysis. It lets you split your data into groups, apply calculations to each group, and combine the results — all in a single operation.

---

## What is GroupBy?

GroupBy follows the **Split-Apply-Combine** pattern:

1. **Split**: Divide the DataFrame into groups based on one or more keys
2. **Apply**: Compute a function (sum, mean, custom) independently on each group
3. **Combine**: Merge the results back into a single DataFrame

This pattern is the foundation of most data summarization tasks.

---

## The Split-Apply-Combine Pattern

Imagine you have sales data for multiple stores. You want the total sales per store:

```python
import pandas as pd

# Sample data
df = pd.DataFrame({
    'store': ['A', 'B', 'A', 'B', 'A', 'B'],
    'product': ['X', 'X', 'Y', 'Y', 'X', 'Y'],
    'sales': [100, 150, 200, 120, 180, 90],
    'quantity': [10, 15, 20, 12, 18, 9]
})

print(df)
```

Output:

```
  store product  sales  quantity
0     A       X    100        10
1     B       X    150        15
2     A       Y    200        20
3     B       Y    120        12
4     A       X    180        18
5     B       Y     90         9
```

- **Split**: Group rows where store = 'A' together, store = 'B' together
- **Apply**: Sum the sales column in each group
- **Combine**: Return a Series with one value per store

---

## Basic GroupBy

### Single Column GroupBy

```python
# Total sales per store
total_sales = df.groupby('store')['sales'].sum()
print(total_sales)
```

Output:

```
store
A    480
B    360
Name: sales, dtype: int64
```

### Mean of All Numeric Columns

```python
# Average of all numeric columns per store
averages = df.groupby('store').mean()
print(averages)
```

Output:

```
       sales  quantity
store
A      160.0      16.0
B      120.0      12.0
```

### Multiple Grouping Columns

```python
# Group by both store and product
grouped = df.groupby(['store', 'product'])['sales'].sum()
print(grouped)
```

Output:

```
store  product
A      X          280
       Y          200
B      X          150
       Y          210
Name: sales, dtype: int64
```

---

## The GroupBy Object

When you call `groupby()`, pandas doesn't compute anything yet. It creates a GroupBy object that waits for an action:

```python
# Create the GroupBy object
grouped = df.groupby('store')

# Check the type
print(type(grouped))
# <class 'pandas.core.groupby.generic.DataFrameGroupBy'>

# See the groups
print(grouped.groups)
# {'A': [0, 2, 4], 'B': [1, 3, 5]}

# Number of groups
print(grouped.ngroups)
# 2

# Size of each group
print(grouped.size())
# store
# A    3
# B    3
# dtype: int64
```

---

## Aggregation Functions

### Built-in Aggregation Methods

pandas provides many built-in aggregation functions:

```python
# Common aggregations
print("Sum:", df.groupby('store')['sales'].sum().values)
print("Mean:", df.groupby('store')['sales'].mean().values)
print("Median:", df.groupby('store')['sales'].median().values)
print("Std:", df.groupby('store')['sales'].std().values)
print("Min:", df.groupby('store')['sales'].min().values)
print("Max:", df.groupby('store')['sales'].max().values)
print("Count:", df.groupby('store')['sales'].count().values)
print("First:", df.groupby('store')['sales'].first().values)
print("Last:", df.groupby('store')['sales'].last().values)
```

> **count** vs **size**: `count()` excludes NaN values, `size()` includes them.

### Multiple Aggregations at Once

```python
# Apply multiple aggregation functions
result = df.groupby('store')['sales'].agg(['mean', 'sum', 'count'])
print(result)
```

Output:

```
        mean  sum  count
store
A      160.0  480      3
B      120.0  360      3
```

### Different Aggregations Per Column

```python
# Different functions for different columns
result = df.groupby('store').agg({
    'sales': 'sum',
    'quantity': 'mean'
})
print(result)
```

Output:

```
       sales  quantity
store
A        480      16.0
B        360      12.0
```

### Custom Aggregation Functions

```python
# Range (max - min) per group
result = df.groupby('store')['sales'].agg(lambda x: x.max() - x.min())
print(result)
```

Output:

```
store
A    100
B     60
Name: sales, dtype: int64
```

### Named Aggregation (Recommended)

Named aggregation gives you clean column names in the output:

```python
# Named aggregation syntax
result = df.groupby('store').agg(
    total_sales=('sales', 'sum'),
    avg_sales=('sales', 'mean'),
    total_qty=('quantity', 'sum'),
    num_transactions=('sales', 'count')
)
print(result)
```

Output:

```
       total_sales  avg_sales  total_qty  num_transactions
store
A              480      160.0         48                 3
B              360      120.0         36                 3
```

---

## Iterating Over Groups

You can loop through each group:

```python
for name, group in df.groupby('store'):
    print(f"\nStore: {name}")
    print(group)
    print(f"Total sales: {group['sales'].sum()}")
```

Output:

```
Store: A
  store product  sales  quantity
0     A       X    100        10
2     A       Y    200        20
4     A       X    180        18
Total sales: 480

Store: B
  store product  sales  quantity
1     B       X    150        15
3     B       Y    120        12
5     B       Y     90         9
Total sales: 360
```

With multiple grouping keys:

```python
for (store, product), group in df.groupby(['store', 'product']):
    print(f"Store={store}, Product={product}: sales={group['sales'].sum()}")
```

---

## Filtering Groups

Keep only groups that meet a condition:

```python
# Keep stores with total sales > 400
result = df.groupby('store').filter(lambda x: x['sales'].sum() > 400)
print(result)
```

Output:

```
  store product  sales  quantity
0     A       X    100        10
2     A       Y    200        20
4     A       X    180        18
```

Only store A (total 480) passes the filter. Store B (total 360) is excluded.

```python
# Keep groups with more than 1 unique product
result = df.groupby('store').filter(lambda x: x['product'].nunique() > 1)
print(result)
# Both stores have 2 products, so all rows are kept
```

---

## Transform: Same-Shape Results

`transform()` returns a result with the **same shape** as the input. Each value is replaced by the group-level result:

```python
# Broadcast group mean to each row
df['avg_store_sales'] = df.groupby('store')['sales'].transform('mean')
print(df[['store', 'sales', 'avg_store_sales']])
```

Output:

```
  store  sales  avg_store_sales
0     A    100            160.0
1     B    150            120.0
2     A    200            160.0
3     B    120            120.0
4     A    180            160.0
5     B     90            120.0
```

### Normalization Within Groups

```python
# Normalize sales within each store (z-score)
df['sales_zscore'] = df.groupby('store')['sales'].transform(
    lambda x: (x - x.mean()) / x.std()
)
print(df[['store', 'sales', 'sales_zscore']])
```

### Percentage of Group Total

```python
# Each sale as percentage of store total
df['pct_of_store'] = df.groupby('store')['sales'].transform(
    lambda x: x / x.sum() * 100
)
print(df[['store', 'sales', 'pct_of_store']])
```

### Fill Missing Values with Group Mean

```python
# Fill NaN with group mean
df['sales_filled'] = df.groupby('store')['sales'].transform(
    lambda x: x.fillna(x.mean())
)
```

---

## Apply: Flexible Operations

`apply()` lets you run any function on each group. It can return any shape:

```python
# Custom function that returns a DataFrame
def top_n_sales(group, n=2):
    return group.nlargest(n, 'sales')

result = df.groupby('store').apply(top_n_sales, n=2)
print(result)
```

```python
# Describe each group
result = df.groupby('store')['sales'].apply(lambda x: x.describe())
print(result)
```

---

## GroupBy with Multiple Keys

```python
# Larger dataset
data = pd.DataFrame({
    'region': ['East', 'East', 'West', 'West', 'East', 'West'],
    'category': ['Electronics', 'Clothing', 'Electronics', 'Clothing', 'Electronics', 'Clothing'],
    'sales': [500, 300, 450, 200, 600, 350],
    'profit': [50, 30, 45, 20, 60, 35]
})

# Group by region and category
summary = data.groupby(['region', 'category']).agg(
    total_sales=('sales', 'sum'),
    avg_profit=('profit', 'mean')
)
print(summary)
```

Output:

```
                        total_sales  avg_profit
region category
East   Clothing                300        30.0
       Electronics            1100        55.0
West   Clothing                550        27.5
       Electronics             450        45.0
```

---

## Resample for Time Series

`resample()` is like `groupby()` for time-based data:

```python
# Create time series data
dates = pd.date_range('2024-01-01', periods=90, freq='D')
ts = pd.DataFrame({
    'date': dates,
    'sales': range(90)
})
ts.set_index('date', inplace=True)

# Monthly total
monthly = ts.resample('M').sum()
print(monthly.head())

# Weekly average
weekly = ts.resample('W').mean()
print(weekly.head())
```

---

## Complete Example: Sales Analysis

```python
import pandas as pd
import numpy as np

# Create realistic sales data
np.random.seed(42)
n = 100

sales_data = pd.DataFrame({
    'customer_id': np.random.choice(['C001', 'C002', 'C003', 'C004', 'C005'], n),
    'region': np.random.choice(['North', 'South', 'East', 'West'], n),
    'category': np.random.choice(['Electronics', 'Clothing', 'Food', 'Books'], n),
    'amount': np.random.uniform(10, 500, n).round(2),
    'quantity': np.random.randint(1, 20, n)
})

print("=== Sales Data (first 5 rows) ===")
print(sales_data.head())

# 1. Total sales by region
print("\n=== Total Sales by Region ===")
print(sales_data.groupby('region')['amount'].sum().sort_values(ascending=False))

# 2. Average order by category
print("\n=== Average Order by Category ===")
print(sales_data.groupby('category')['amount'].mean().round(2))

# 3. Detailed summary
print("\n=== Detailed Summary ===")
summary = sales_data.groupby('region').agg(
    total_revenue=('amount', 'sum'),
    avg_order=('amount', 'mean'),
    num_orders=('amount', 'count'),
    avg_quantity=('quantity', 'mean')
).round(2)
print(summary)

# 4. Customer segmentation
print("\n=== Customer Segmentation ===")
customer_summary = sales_data.groupby('customer_id').agg(
    total_spent=('amount', 'sum'),
    num_purchases=('amount', 'count'),
    avg_purchase=('amount', 'mean'),
    favorite_category=('category', lambda x: x.mode()[0])
).round(2)
print(customer_summary)

# 5. Region-Category cross analysis
print("\n=== Region × Category ===")
cross = sales_data.groupby(['region', 'category'])['amount'].sum().unstack(fill_value=0)
print(cross.round(2))
```

---

## Common Patterns

### Rank Within Groups

```python
# Rank sales within each region
sales_data['rank_in_region'] = sales_data.groupby('region')['amount'].rank(
    ascending=False, method='dense'
)
```

### Cumulative Sum Per Group

```python
# Running total within each customer
sales_data['cumulative'] = sales_data.groupby('customer_id')['amount'].cumsum()
```

### Shift Within Groups (Lag)

```python
# Previous purchase amount per customer
sales_data['prev_amount'] = sales_data.groupby('customer_id')['amount'].shift(1)
```

---

## Summary

| Method | Returns | Use Case |
|--------|---------|----------|
| `agg()` | Reduced (one row per group) | Summary statistics |
| `transform()` | Same shape as input | Broadcast group values |
| `filter()` | Subset of original rows | Keep/remove groups |
| `apply()` | Any shape | Complex operations |

Key formulas:

- Group mean: $\bar{x}_g = \frac{1}{n_g}\sum_{i \in g} x_i$
- Within-group z-score: $z_i = \frac{x_i - \bar{x}_g}{s_g}$

---

## Exercises

1. Group a dataset by multiple columns and compute the sum and mean
2. Use `transform()` to add a column showing each row's deviation from its group mean
3. Use `filter()` to keep only groups with more than 5 observations
4. Create a customer segmentation using named aggregation
5. Combine `groupby()` with `rank()` to find the top 3 items per category
