---
title: Pivot Tables & Reshaping
---

# Pivot Tables & Reshaping

Reshaping means changing how your data is organized — transforming rows into columns or columns into rows. This is essential for analysis, visualization, and reporting.

---

## Wide vs Long Format

Data can be stored in two main formats:

### Wide Format

Each variable or category gets its own column:

```
  date        product_a  product_b  product_c
  2024-01-01        100        150        200
  2024-01-02        110        140        210
```

### Long (Tidy) Format

One row per observation, with a column identifying the variable:

```
  date        product    sales
  2024-01-01  product_a    100
  2024-01-01  product_b    150
  2024-01-01  product_c    200
  2024-01-02  product_a    110
  2024-01-02  product_b    140
  2024-01-02  product_c    210
```

> **Tidy data** principle: each row is one observation, each column is one variable. Long format is usually better for analysis; wide format is better for display.

---

## Pivot: Long to Wide

`pivot()` reshapes long data into wide format:

```python
import pandas as pd

# Long format data
df_long = pd.DataFrame({
    'date': ['2024-01-01', '2024-01-01', '2024-01-02', '2024-01-02'],
    'product': ['A', 'B', 'A', 'B'],
    'sales': [100, 150, 110, 140]
})

print("Long format:")
print(df_long)

# Pivot to wide format
df_wide = df_long.pivot(index='date', columns='product', values='sales')
print("\nWide format:")
print(df_wide)
```

Output:

```
Long format:
         date product  sales
0  2024-01-01       A    100
1  2024-01-01       B    150
2  2024-01-02       A    110
3  2024-01-02       B    140

Wide format:
product      A    B
date
2024-01-01  100  150
2024-01-02  110  140
```

### Pivot Fails with Duplicates

If there are duplicate entries for the same index-column combination, `pivot()` raises an error:

```python
# This has duplicate: date=2024-01-01, product=A appears twice
df_dup = pd.DataFrame({
    'date': ['2024-01-01', '2024-01-01', '2024-01-01'],
    'product': ['A', 'A', 'B'],
    'sales': [100, 120, 150]
})

# This will FAIL:
# df_dup.pivot(index='date', columns='product', values='sales')
# ValueError: Index contains duplicate entries

# Solution: use pivot_table with an aggregation function
```

---

## Pivot Table

`pivot_table()` is like `pivot()` but handles duplicates by aggregating:

```python
import pandas as pd
import numpy as np

# Sales data with multiple entries
df = pd.DataFrame({
    'region': ['East', 'East', 'West', 'West', 'East', 'West'],
    'product': ['A', 'B', 'A', 'B', 'A', 'A'],
    'sales': [100, 150, 200, 120, 180, 90],
    'quantity': [10, 15, 20, 12, 18, 9]
})

# Basic pivot table
pivot = pd.pivot_table(
    df,
    values='sales',
    index='region',
    columns='product',
    aggfunc='sum'
)
print(pivot)
```

Output:

```
product    A    B
region
East     280  150
West     290  120
```

### Multiple Aggregation Functions

```python
# Multiple aggregation functions
pivot = pd.pivot_table(
    df,
    values='sales',
    index='region',
    columns='product',
    aggfunc=['sum', 'mean', 'count']
)
print(pivot)
```

### Fill Missing Values

```python
# Fill NaN with 0
pivot = pd.pivot_table(
    df,
    values='sales',
    index='region',
    columns='product',
    aggfunc='sum',
    fill_value=0
)
print(pivot)
```

### Add Margins (Totals)

```python
# Add row and column totals
pivot = pd.pivot_table(
    df,
    values='sales',
    index='region',
    columns='product',
    aggfunc='sum',
    margins=True,
    margins_name='Total'
)
print(pivot)
```

Output:

```
product      A      B  Total
region
East       280  150.0    430
West       290  120.0    410
Total      570  270.0    840
```

### Multiple Values and Index

```python
# Multiple value columns
pivot = pd.pivot_table(
    df,
    values=['sales', 'quantity'],
    index='region',
    columns='product',
    aggfunc='sum',
    fill_value=0
)
print(pivot)
```

---

## Melt: Wide to Long (Unpivot)

`melt()` is the reverse of pivot — it converts wide format to long format:

```python
# Wide format data
df_wide = pd.DataFrame({
    'date': ['2024-01-01', '2024-01-02', '2024-01-03'],
    'product_a': [100, 110, 105],
    'product_b': [150, 140, 160],
    'product_c': [200, 210, 195]
})

print("Wide format:")
print(df_wide)

# Melt to long format
df_long = pd.melt(
    df_wide,
    id_vars=['date'],
    value_vars=['product_a', 'product_b', 'product_c'],
    var_name='product',
    value_name='sales'
)

print("\nLong format:")
print(df_long)
```

Output:

```
Wide format:
         date  product_a  product_b  product_c
0  2024-01-01        100        150        200
1  2024-01-02        110        140        210
2  2024-01-03        105        160        195

Long format:
         date    product  sales
0  2024-01-01  product_a    100
1  2024-01-02  product_a    110
2  2024-01-03  product_a    105
3  2024-01-01  product_b    150
4  2024-01-02  product_b    140
5  2024-01-03  product_b    160
6  2024-01-01  product_c    200
7  2024-01-02  product_c    210
8  2024-01-03  product_c    195
```

### Melt Without Specifying value_vars

```python
# If you omit value_vars, all columns except id_vars are melted
df_long = pd.melt(df_wide, id_vars=['date'])
print(df_long)
```

---

## Stack and Unstack

`stack()` and `unstack()` work with MultiIndex DataFrames:

### Stack: Columns → Rows

```python
# Create a MultiColumn DataFrame
df = pd.DataFrame(
    [[100, 150], [110, 140]],
    index=['2024-01-01', '2024-01-02'],
    columns=['Product_A', 'Product_B']
)

print("Original (wide):")
print(df)

# Stack: columns become inner index level
stacked = df.stack()
print("\nStacked (long):")
print(stacked)
```

Output:

```
Original (wide):
            Product_A  Product_B
2024-01-01        100        150
2024-01-02        110        140

Stacked (long):
2024-01-01  Product_A    100
            Product_B    150
2024-01-02  Product_A    110
            Product_B    140
dtype: int64
```

### Unstack: Rows → Columns

```python
# Unstack: inner index level becomes columns
unstacked = stacked.unstack()
print("Unstacked (wide again):")
print(unstacked)
```

### Unstack with MultiIndex

```python
# MultiIndex example
arrays = [
    ['East', 'East', 'West', 'West'],
    ['Electronics', 'Clothing', 'Electronics', 'Clothing']
]
index = pd.MultiIndex.from_arrays(arrays, names=['region', 'category'])
s = pd.Series([500, 300, 450, 200], index=index)

print("MultiIndex Series:")
print(s)

print("\nUnstacked:")
print(s.unstack())
```

Output:

```
MultiIndex Series:
region  category
East    Electronics    500
        Clothing       300
West    Electronics    450
        Clothing       200
dtype: int64

Unstacked:
category  Clothing  Electronics
region
East           300          500
West           200          450
```

---

## Crosstab: Frequency Tables

`crosstab()` computes a frequency table of two or more variables:

```python
# Survey data
survey = pd.DataFrame({
    'gender': ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F'],
    'smoker': ['Yes', 'No', 'No', 'No', 'Yes', 'Yes', 'No', 'No'],
    'age_group': ['Young', 'Young', 'Old', 'Old', 'Young', 'Old', 'Young', 'Old']
})

# Basic frequency table
ct = pd.crosstab(survey['gender'], survey['smoker'])
print("Frequency table:")
print(ct)
```

Output:

```
Frequency table:
smoker  No  Yes
gender
F        3    1
M        2    2
```

### Proportions (Normalize)

```python
# Row proportions (each row sums to 1)
ct_norm = pd.crosstab(survey['gender'], survey['smoker'], normalize='index')
print("\nRow proportions:")
print(ct_norm)

# Column proportions
ct_col = pd.crosstab(survey['gender'], survey['smoker'], normalize='columns')
print("\nColumn proportions:")
print(ct_col)

# Overall proportions (all cells sum to 1)
ct_all = pd.crosstab(survey['gender'], survey['smoker'], normalize='all')
print("\nOverall proportions:")
print(ct_all)
```

### Margins (Totals)

```python
# Add row and column totals
ct_margins = pd.crosstab(
    survey['gender'], survey['smoker'], margins=True, margins_name='Total'
)
print(ct_margins)
```

### Crosstab with Aggregation

```python
# Crosstab with values and aggregation
data = pd.DataFrame({
    'region': ['East', 'East', 'West', 'West'],
    'product': ['A', 'B', 'A', 'B'],
    'sales': [100, 150, 200, 120]
})

ct = pd.crosstab(
    data['region'], data['product'],
    values=data['sales'], aggfunc='sum'
)
print(ct)
```

---

## Explode: Lists to Rows

When a cell contains a list, `explode()` creates one row per list element:

```python
# Data with lists in cells
df = pd.DataFrame({
    'movie': ['Movie A', 'Movie B', 'Movie C'],
    'genres': [['Action', 'Sci-Fi'], ['Drama'], ['Comedy', 'Romance', 'Drama']],
    'rating': [8.5, 7.2, 6.8]
})

print("Original:")
print(df)

# Explode the genres column
df_exploded = df.explode('genres')
print("\nExploded:")
print(df_exploded)
```

Output:

```
Original:
     movie                    genres  rating
0  Movie A          [Action, Sci-Fi]     8.5
1  Movie B                  [Drama]     7.2
2  Movie C  [Comedy, Romance, Drama]     6.8

Exploded:
     movie   genres  rating
0  Movie A   Action     8.5
0  Movie A   Sci-Fi     8.5
1  Movie B    Drama     7.2
2  Movie C   Comedy     6.8
2  Movie C  Romance     6.8
2  Movie C    Drama     6.8
```

After exploding, you can count genres, group by genre, etc.:

```python
# Count movies per genre
genre_counts = df_exploded['genres'].value_counts()
print(genre_counts)
```

---

## Complete Example: Sales Pivot Analysis

```python
import pandas as pd
import numpy as np

# Create realistic sales data
np.random.seed(42)
n = 200

sales = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=n, freq='D'),
    'region': np.random.choice(['North', 'South', 'East', 'West'], n),
    'product': np.random.choice(['Laptop', 'Phone', 'Tablet', 'Watch'], n),
    'revenue': np.random.uniform(100, 2000, n).round(2),
    'units': np.random.randint(1, 50, n)
})

print("=== Sales Data (first 5 rows) ===")
print(sales.head())

# 1. Pivot table: revenue by region and product
print("\n=== Revenue by Region × Product ===")
pivot1 = pd.pivot_table(
    sales,
    values='revenue',
    index='region',
    columns='product',
    aggfunc='sum',
    margins=True
)
print(pivot1.round(0))

# 2. Monthly sales pivot
sales['month'] = sales['date'].dt.month_name()
print("\n=== Monthly Revenue by Region ===")
pivot2 = pd.pivot_table(
    sales,
    values='revenue',
    index='month',
    columns='region',
    aggfunc='sum',
    fill_value=0
)
print(pivot2.round(0).head())

# 3. Melt for visualization-ready format
print("\n=== Melted for plotting ===")
pivot_reset = pivot1.drop('All').drop('All', axis=1).reset_index()
melted = pd.melt(pivot_reset, id_vars=['region'], var_name='product', value_name='revenue')
print(melted.head(8))

# 4. Crosstab: units sold frequency
print("\n=== Units Sold: Region × Product (count) ===")
ct = pd.crosstab(sales['region'], sales['product'], margins=True)
print(ct)

# 5. Average revenue per unit
print("\n=== Avg Revenue/Unit by Region × Product ===")
sales['rev_per_unit'] = sales['revenue'] / sales['units']
pivot3 = pd.pivot_table(
    sales,
    values='rev_per_unit',
    index='region',
    columns='product',
    aggfunc='mean'
)
print(pivot3.round(2))
```

---

## Reshaping Cheat Sheet

| Operation | Function | Direction |
|-----------|----------|-----------|
| Long → Wide | `pivot()` | Unique combos only |
| Long → Wide | `pivot_table()` | Handles duplicates |
| Wide → Long | `melt()` | Columns → rows |
| Wide → Long | `stack()` | Uses MultiIndex |
| Long → Wide | `unstack()` | Uses MultiIndex |
| Frequency table | `crosstab()` | Two-way counts |
| List → Rows | `explode()` | One row per element |

---

## Exercises

1. Create a pivot table showing average sales by region and product category
2. Use `melt()` to convert a wide-format quarterly report into tidy long format
3. Build a crosstab showing the relationship between two categorical variables
4. Use `explode()` on a column containing comma-separated tags (split first, then explode)
5. Combine `pivot_table()` with `margins=True` to create an Excel-style summary report
