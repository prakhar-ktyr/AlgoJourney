---
title: Data Selection & Indexing
---

# Data Selection & Indexing

Selecting the right data from a DataFrame is one of the most important skills in data science. Pandas provides powerful tools to access exactly the rows and columns you need.

---

## loc vs iloc

Pandas has two primary indexing operators:

| Operator | Type | Description |
|----------|------|-------------|
| `loc` | Label-based | Select by row/column **names** |
| `iloc` | Position-based | Select by row/column **integer positions** |

Think of it this way:
- **loc** = **l**abel **loc**ation
- **iloc** = **i**nteger **loc**ation

---

## Sample Dataset

We'll use this dataset throughout the lesson:

```python
import pandas as pd

data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 22],
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA'],
    'score': [88, 92, 75, 95, 80],
    'salary': [50000, 65000, 72000, 58000, 45000]
}

df = pd.DataFrame(data, index=['a', 'b', 'c', 'd', 'e'])
print(df)
```

Output:

```
      name  age     city  score  salary
a    Alice   25      NYC     88   50000
b      Bob   30       LA     92   65000
c  Charlie   35      NYC     75   72000
d    Diana   28  Chicago     95   58000
e      Eve   22       LA     80   45000
```

---

## Selecting Rows

### Single Row

```python
# Using loc (label-based)
row = df.loc['a']
print(row)
# name     Alice
# age         25
# city       NYC
# score       88
# salary   50000

# Using iloc (position-based)
row = df.iloc[0]
print(row)
# Same result as above
```

### Multiple Rows

```python
# loc — select specific labels
subset = df.loc[['a', 'c', 'e']]
print(subset)
#       name  age city  score  salary
# a    Alice   25  NYC     88   50000
# c  Charlie   35  NYC     75   72000
# e      Eve   22   LA     80   45000

# iloc — select by position range (start:stop)
subset = df.iloc[0:3]  # rows 0, 1, 2 (stop is exclusive)
print(subset)
#       name  age city  score  salary
# a    Alice   25  NYC     88   50000
# b      Bob   30   LA     92   65000
# c  Charlie   35  NYC     75   72000

# iloc — select specific positions
subset = df.iloc[[0, 2, 4]]
print(subset)
```

### Conditional Row Selection

```python
# Select rows where age > 25
older = df.loc[df['age'] > 25]
print(older)
#       name  age     city  score  salary
# b      Bob   30       LA     92   65000
# c  Charlie   35      NYC     75   72000
# d    Diana   28  Chicago     95   58000
```

---

## Selecting Columns

### Single Column

```python
# Bracket notation (returns Series)
names = df['name']
print(names)

# loc notation
names = df.loc[:, 'name']
print(names)

# Both produce the same result:
# a      Alice
# b        Bob
# c    Charlie
# d      Diana
# e        Eve
```

### Multiple Columns

```python
# Bracket notation with list
subset = df[['name', 'age']]
print(subset)
#       name  age
# a    Alice   25
# b      Bob   30
# c  Charlie   35
# d    Diana   28
# e      Eve   22

# loc — select column range (inclusive on both ends!)
subset = df.loc[:, 'age':'score']
print(subset)
#    age     city  score
# a   25      NYC     88
# b   30       LA     92
# c   35      NYC     75
# d   28  Chicago     95
# e   22       LA     80
```

> **Note:** With `loc`, the slice `'age':'score'` includes both endpoints. This is different from normal Python slicing!

---

## Combined Selection

Select specific rows AND columns together:

```python
# People older than 25 — show only name and age
result = df.loc[df['age'] > 25, ['name', 'age']]
print(result)
#       name  age
# b      Bob   30
# c  Charlie   35
# d    Diana   28

# Using iloc — rows 0-2, columns 0 and 2
result = df.iloc[0:3, [0, 2]]
print(result)
#       name city
# a    Alice  NYC
# b      Bob   LA
# c  Charlie  NYC

# Label-based row and column range
result = df.loc['a':'c', 'name':'city']
print(result)
#       name  age city
# a    Alice   25  NYC
# b      Bob   30   LA
# c  Charlie   35  NYC
```

---

## Boolean Indexing

Boolean indexing lets you filter data using conditions that return True/False for each row.

### Single Condition

```python
# Scores above 80
high_scores = df[df['score'] > 80]
print(high_scores)
#     name  age     city  score  salary
# a  Alice   25      NYC     88   50000
# b    Bob   30       LA     92   65000
# d  Diana   28  Chicago     95   58000
```

### Multiple Conditions

Use `&` (and), `|` (or) — wrap each condition in parentheses:

```python
# Age > 25 AND city is NYC
result = df[(df['age'] > 25) & (df['city'] == 'NYC')]
print(result)
#       name  age city  score  salary
# c  Charlie   35  NYC     75   72000

# Age < 25 OR score > 90
result = df[(df['age'] < 25) | (df['score'] > 90)]
print(result)
#     name  age     city  score  salary
# b    Bob   30       LA     92   65000
# d  Diana   28  Chicago     95   58000
# e    Eve   22       LA     80   45000
```

### Negation

```python
# NOT in the list
result = df[~df['city'].isin(['NYC', 'LA'])]
print(result)
#     name  age     city  score  salary
# d  Diana   28  Chicago     95   58000

# Negate a condition
result = df[~(df['age'] > 25)]
print(result)
#     name  age city  score  salary
# a  Alice   25  NYC     88   50000
# e    Eve   22   LA     80   45000
```

### query() Method

The `query()` method uses a string-based syntax — often more readable:

```python
# Equivalent to df[(df['age'] > 25) & (df['city'] == 'NYC')]
result = df.query('age > 25 and city == "NYC"')
print(result)

# Using variables with @
min_age = 25
result = df.query('age > @min_age')
print(result)

# Complex query
result = df.query('score > 80 and salary < 60000')
print(result)
```

---

## isin() Method

Check if values are in a list:

```python
# Cities in a list
cities = ['NYC', 'Chicago']
result = df[df['city'].isin(cities)]
print(result)
#       name  age     city  score  salary
# a    Alice   25      NYC     88   50000
# c  Charlie   35      NYC     75   72000
# d    Diana   28  Chicago     95   58000

# Filter by multiple score values
result = df[df['score'].isin([88, 92, 95])]
print(result)
```

---

## between() Method

Select values within a range (inclusive by default):

```python
# Age between 25 and 30
result = df[df['age'].between(25, 30)]
print(result)
#     name  age     city  score  salary
# a  Alice   25      NYC     88   50000
# b    Bob   30       LA     92   65000
# d  Diana   28  Chicago     95   58000

# Salary between 50000 and 65000
result = df[df['salary'].between(50000, 65000)]
print(result)
```

---

## where() and mask()

These methods keep the shape of the DataFrame but replace non-matching values:

```python
# where() — keep values where condition is True, else NaN
result = df['score'].where(df['score'] > 80)
print(result)
# a    88.0
# b    92.0
# c     NaN
# d    95.0
# e    80.0   ← 80 is NOT > 80, so NaN? Actually >= would keep it

# where() with custom fill value
result = df['score'].where(df['score'] > 80, other=0)
print(result)
# a    88
# b    92
# c     0
# d    95
# e     0

# mask() — opposite of where(), replaces True values
result = df['score'].mask(df['score'] > 80, other=-1)
print(result)
# a    -1
# b    -1
# c    75
# d    -1
# e    80
```

---

## Setting Values

### Using loc

```python
# Set value based on condition
df.loc[df['city'] == 'LA', 'score'] = 99
print(df)

# Set multiple columns
df.loc[df['age'] > 30, ['score', 'salary']] = [100, 80000]
```

### Using at and iat (Fast Single Value)

```python
# at — label-based single value (faster than loc for single cell)
df.at['a', 'score'] = 95

# iat — position-based single value (faster than iloc for single cell)
df.iat[0, 3] = 95

# These are optimized for scalar access
```

### Conditional Assignment

```python
# Create a new column based on condition
df['grade'] = 'B'
df.loc[df['score'] >= 90, 'grade'] = 'A'
df.loc[df['score'] < 80, 'grade'] = 'C'
print(df[['name', 'score', 'grade']])
```

---

## MultiIndex (Hierarchical Indexing)

MultiIndex allows multiple levels of indexing — useful for complex data:

```python
# Create a MultiIndex DataFrame
data = {
    'score': [88, 92, 75, 95, 80, 85],
    'grade': ['B+', 'A', 'C+', 'A', 'B', 'B+']
}

index = pd.MultiIndex.from_tuples([
    ('NYC', 'Alice'),
    ('NYC', 'Charlie'),
    ('LA', 'Bob'),
    ('LA', 'Eve'),
    ('Chicago', 'Diana'),
    ('Chicago', 'Frank')
], names=['city', 'name'])

df_multi = pd.DataFrame(data, index=index)
print(df_multi)
#                score grade
# city    name
# NYC     Alice     88    B+
#         Charlie   75    C+
# LA      Bob       92     A
#         Eve       80     B
# Chicago Diana     95     A
#         Frank     85    B+
```

### Setting MultiIndex from Columns

```python
df_multi = df.set_index(['city', 'name'])
print(df_multi)
```

### Selecting with MultiIndex

```python
# Select a city group
nyc = df_multi.loc['NYC']
print(nyc)

# Select specific person in city
alice = df_multi.loc[('NYC', 'Alice')]
print(alice)

# xs() for cross-section selection
# Get all entries for 'Alice' regardless of city
result = df_multi.xs('Alice', level='name')
print(result)
```

---

## Practical Example

Let's put it all together with a real-world scenario:

```python
import pandas as pd

# Employee dataset
employees = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
             'Frank', 'Grace', 'Henry'],
    'department': ['Engineering', 'Marketing', 'Engineering',
                   'Sales', 'Marketing', 'Engineering',
                   'Sales', 'Marketing'],
    'age': [28, 35, 42, 31, 26, 38, 29, 45],
    'salary': [75000, 62000, 95000, 58000, 55000,
               88000, 61000, 67000],
    'years_exp': [3, 8, 15, 6, 2, 12, 4, 20]
})

# 1. Engineers with salary above 80000
senior_eng = employees.loc[
    (employees['department'] == 'Engineering') &
    (employees['salary'] > 80000),
    ['name', 'salary', 'years_exp']
]
print("Senior Engineers:\n", senior_eng)

# 2. People aged 25-35 in Marketing or Sales
young_business = employees.query(
    'age.between(25, 35) and department in ["Marketing", "Sales"]'
)
print("\nYoung business team:\n", young_business)

# 3. Top 3 earners — name and salary only
top_earners = employees.nlargest(3, 'salary')[['name', 'salary']]
print("\nTop earners:\n", top_earners)

# 4. Give 10% raise to those with 10+ years experience
employees.loc[employees['years_exp'] >= 10, 'salary'] *= 1.10
print("\nAfter raises:\n", employees[['name', 'salary', 'years_exp']])
```

---

## Quick Reference

| Task | Code |
|------|------|
| Single row by label | `df.loc['a']` |
| Single row by position | `df.iloc[0]` |
| Multiple rows by label | `df.loc[['a', 'b']]` |
| Row slice by position | `df.iloc[0:5]` |
| Single column | `df['col']` |
| Multiple columns | `df[['col1', 'col2']]` |
| Conditional filter | `df[df['col'] > 5]` |
| Multiple conditions | `df[(cond1) & (cond2)]` |
| Value in list | `df[df['col'].isin([1, 2])]` |
| Range check | `df[df['col'].between(a, b)]` |
| Set value | `df.loc[cond, 'col'] = val` |
| Fast single value | `df.at[idx, 'col'] = val` |

---

## Summary

- Use **loc** for label-based selection and **iloc** for position-based
- Boolean indexing with `&`, `|`, `~` for complex filters
- `query()` provides readable string-based filtering
- `isin()` and `between()` simplify common filter patterns
- `at` and `iat` are fastest for single-value access
- MultiIndex enables hierarchical data organization

---
