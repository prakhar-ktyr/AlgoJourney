---
title: NumPy Arrays & Operations
---

# NumPy Arrays & Operations

In this lesson, you'll learn how to perform powerful operations on NumPy arrays — from basic arithmetic to advanced aggregation and manipulation.

---

## Array Arithmetic (Element-Wise)

NumPy performs arithmetic **element-wise** by default. This means operations are applied to each element individually.

```python
import numpy as np

a = np.array([1, 2, 3, 4, 5])
b = np.array([10, 20, 30, 40, 50])

# Addition
print(a + b)   # [11 22 33 44 55]

# Subtraction
print(a - b)   # [ -9 -18 -27 -36 -45]

# Multiplication
print(a * b)   # [ 10  40  90 160 250]

# Division
print(a / b)   # [0.1 0.1 0.1 0.1 0.1]

# Power
print(a ** 2)  # [ 1  4  9 16 25]
```

### Why Element-Wise?

These operations are **vectorized** — they run in optimized C code under the hood, making them much faster than Python loops.

```python
import time

arr = np.arange(1_000_000)

# Vectorized (fast)
start = time.time()
result = arr * 2
print(f"Vectorized: {time.time() - start:.4f}s")

# Python loop (slow)
start = time.time()
result = [x * 2 for x in arr]
print(f"Loop: {time.time() - start:.4f}s")
# Vectorized is typically 10-100x faster!
```

---

## Universal Functions (ufuncs)

Universal functions operate element-wise on arrays and return a new array.

### Mathematical Functions

```python
arr = np.array([1, 4, 9, 16, 25])

# Square root
print(np.sqrt(arr))   # [1. 2. 3. 4. 5.]

# Exponential (e^x)
print(np.exp(arr))    # [2.718  54.598  8103.08  ...]

# Natural logarithm
print(np.log(arr))    # [0.    1.386  2.197  2.773  3.219]
```

### Trigonometric Functions

```python
angles = np.array([0, np.pi/6, np.pi/4, np.pi/3, np.pi/2])

print(np.sin(angles))  # [0.   0.5   0.707  0.866  1.  ]
print(np.cos(angles))  # [1.   0.866 0.707  0.5    0.  ]
```

### Rounding Functions

```python
arr = np.array([1.23, 2.78, -3.14, 4.99, -5.5])

print(np.abs(arr))    # [1.23 2.78 3.14 4.99 5.5 ]
print(np.round(arr))  # [ 1.  3. -3.  5. -6.]
print(np.floor(arr))  # [ 1.  2. -4.  4. -6.]
print(np.ceil(arr))   # [ 2.  3. -3.  5. -5.]
```

---

## Broadcasting

Broadcasting allows NumPy to perform operations on arrays with **different shapes** — without making copies of data.

### Broadcasting Rules

1. Dimensions are compared from **right to left**
2. Dimensions are compatible if they are **equal** or one of them is **1**
3. A dimension of size 1 is **stretched** to match the other

### Scalar + Array

The simplest broadcast: a scalar is stretched to match the array.

```python
arr = np.array([1, 2, 3, 4, 5])

# Scalar 10 is broadcast to [10, 10, 10, 10, 10]
print(arr + 10)   # [11 12 13 14 15]
print(arr * 3)    # [ 3  6  9 12 15]
```

### Row + Matrix

A 1D array broadcasts across each row of a 2D array.

```python
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

row = np.array([10, 20, 30])

# row is broadcast to each row of the matrix
print(matrix + row)
# [[11 22 33]
#  [14 25 36]
#  [17 28 39]]
```

### Column + Matrix

A column vector broadcasts across each column.

```python
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

# Column vector (shape 3x1)
col = np.array([[100],
                [200],
                [300]])

print(matrix + col)
# [[101 102 103]
#  [204 205 206]
#  [307 308 309]]
```

### Why Broadcasting Matters

Broadcasting avoids explicit loops and temporary arrays, saving memory and computation time.

```python
# Normalize each column to have zero mean
data = np.array([[1.0, 2.0, 3.0],
                 [4.0, 5.0, 6.0],
                 [7.0, 8.0, 9.0]])

col_means = data.mean(axis=0)  # [4. 5. 6.]

# Broadcasting subtracts the mean from each column
normalized = data - col_means
print(normalized)
# [[-3. -3. -3.]
#  [ 0.  0.  0.]
#  [ 3.  3.  3.]]
```

---

## Aggregation Functions

Aggregation functions reduce an array to a single value (or reduce along an axis).

### Basic Aggregations

```python
arr = np.array([10, 20, 30, 40, 50])

print(np.sum(arr))    # 150
print(np.mean(arr))   # 30.0
print(np.std(arr))    # 14.142
print(np.var(arr))    # 200.0
```

The **standard deviation** is:

$$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i - \bar{x})^2}$$

### Min, Max, and Arg Functions

```python
arr = np.array([3, 1, 4, 1, 5, 9, 2, 6])

print(np.min(arr))      # 1
print(np.max(arr))      # 9
print(np.argmin(arr))   # 1  (index of minimum)
print(np.argmax(arr))   # 5  (index of maximum)
```

### Median and Percentiles

```python
arr = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

print(np.median(arr))           # 55.0
print(np.percentile(arr, 25))   # 32.5  (25th percentile / Q1)
print(np.percentile(arr, 75))   # 77.5  (75th percentile / Q3)
```

### The axis Parameter

The `axis` parameter controls which dimension to aggregate along.

```python
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

# axis=0: aggregate along rows (collapse rows → one row)
print(np.sum(matrix, axis=0))   # [12 15 18]

# axis=1: aggregate along columns (collapse columns → one column)
print(np.sum(matrix, axis=1))   # [ 6 15 24]

# No axis: aggregate entire array
print(np.sum(matrix))           # 45
```

Think of it this way:
- `axis=0` → result has **one value per column**
- `axis=1` → result has **one value per row**

```python
grades = np.array([[85, 90, 78],   # Student 1
                   [92, 88, 95],   # Student 2
                   [76, 82, 89]])  # Student 3

# Average grade per student (across subjects)
print(np.mean(grades, axis=1))  # [84.33 91.67 82.33]

# Average grade per subject (across students)
print(np.mean(grades, axis=0))  # [84.33 86.67 87.33]
```

---

## Comparison Operators

Comparison operators work element-wise and return **boolean arrays**.

```python
arr = np.array([10, 20, 30, 40, 50])

print(arr > 25)    # [False False  True  True  True]
print(arr < 30)    # [ True  True False False False]
print(arr == 30)   # [False False  True False False]
print(arr != 30)   # [ True  True False  True  True]
```

### Boolean Indexing (Filtering)

Use boolean arrays to filter elements:

```python
arr = np.array([10, 20, 30, 40, 50])

# Get elements greater than 25
mask = arr > 25
print(arr[mask])        # [30 40 50]

# Shorthand
print(arr[arr > 25])    # [30 40 50]

# Count how many elements satisfy a condition
print(np.sum(arr > 25))  # 3
```

---

## Logical Operations

Combine multiple conditions using logical operations.

```python
arr = np.array([5, 12, 18, 25, 30, 8, 42])

# AND: elements between 10 and 30
mask = np.logical_and(arr >= 10, arr <= 30)
print(arr[mask])  # [12 18 25 30]

# OR: elements less than 10 or greater than 30
mask = np.logical_or(arr < 10, arr > 30)
print(arr[mask])  # [ 5  8 42]

# Shorthand with & and | (use parentheses!)
print(arr[(arr >= 10) & (arr <= 30)])  # [12 18 25 30]
print(arr[(arr < 10) | (arr > 30)])    # [ 5  8 42]
```

> **Note:** Use `&` and `|` (not `and` / `or`) for element-wise logic on arrays. Always wrap conditions in parentheses.

---

## Sorting

### np.sort()

Returns a **sorted copy** of the array (original unchanged).

```python
arr = np.array([3, 1, 4, 1, 5, 9, 2, 6])

sorted_arr = np.sort(arr)
print(sorted_arr)  # [1 1 2 3 4 5 6 9]
print(arr)         # [3 1 4 1 5 9 2 6]  (unchanged)
```

### np.argsort()

Returns the **indices** that would sort the array.

```python
arr = np.array([30, 10, 50, 20, 40])

indices = np.argsort(arr)
print(indices)       # [1 3 0 4 2]
print(arr[indices])  # [10 20 30 40 50]
```

### Sorting 2D Arrays

```python
matrix = np.array([[3, 1, 2],
                   [6, 4, 5],
                   [9, 7, 8]])

# Sort each row
print(np.sort(matrix, axis=1))
# [[1 2 3]
#  [4 5 6]
#  [7 8 9]]

# Sort each column
print(np.sort(matrix, axis=0))
# [[3 1 2]
#  [6 4 5]
#  [9 7 8]]
```

---

## Stacking and Splitting

### Concatenation

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Join arrays
print(np.concatenate([a, b]))  # [1 2 3 4 5 6]
```

### Vertical and Horizontal Stacking

```python
a = np.array([[1, 2],
              [3, 4]])
b = np.array([[5, 6],
              [7, 8]])

# Stack vertically (add rows)
print(np.vstack([a, b]))
# [[1 2]
#  [3 4]
#  [5 6]
#  [7 8]]

# Stack horizontally (add columns)
print(np.hstack([a, b]))
# [[1 2 5 6]
#  [3 4 7 8]]
```

### Splitting

```python
arr = np.array([1, 2, 3, 4, 5, 6])

# Split into 3 equal parts
parts = np.split(arr, 3)
print(parts)  # [array([1, 2]), array([3, 4]), array([5, 6])]
```

```python
matrix = np.array([[1, 2, 3, 4],
                   [5, 6, 7, 8],
                   [9, 10, 11, 12],
                   [13, 14, 15, 16]])

# Split vertically (split rows)
top, bottom = np.vsplit(matrix, 2)
print(top)
# [[1  2  3  4]
#  [5  6  7  8]]

# Split horizontally (split columns)
left, right = np.hsplit(matrix, 2)
print(left)
# [[ 1  2]
#  [ 5  6]
#  [ 9 10]
#  [13 14]]
```

---

## Copying: copy() vs View

Understanding the difference between copies and views is crucial to avoid unexpected behavior.

### View (Shallow Copy)

A view shares the **same data** as the original. Changes to one affect the other.

```python
arr = np.array([1, 2, 3, 4, 5])

# Slicing creates a VIEW
view = arr[1:4]
view[0] = 99

print(arr)   # [ 1 99  3  4  5]  ← original changed!
```

### Copy (Deep Copy)

A copy has its **own data**. Changes are independent.

```python
arr = np.array([1, 2, 3, 4, 5])

# .copy() creates an independent copy
copy = arr[1:4].copy()
copy[0] = 99

print(arr)   # [1 2 3 4 5]  ← original unchanged
print(copy)  # [99  3  4]
```

### When to Use copy()

- When you want to modify a slice without affecting the original
- When you need to store a subset for later use
- When passing data to functions that might modify it

```python
# Common pattern: filter and copy
arr = np.array([10, 20, 30, 40, 50])
subset = arr[arr > 20].copy()  # Safe independent copy
```

---

## Practical Example: Student Grade Analysis

```python
import numpy as np

# Grades for 5 students across 4 subjects
grades = np.array([
    [85, 92, 78, 90],   # Student 1
    [76, 88, 95, 82],   # Student 2
    [92, 85, 88, 94],   # Student 3
    [68, 74, 82, 79],   # Student 4
    [95, 98, 92, 96],   # Student 5
])

# Average per student
student_avg = np.mean(grades, axis=1)
print(f"Student averages: {student_avg}")
# [86.25  85.25  89.75  75.75  95.25]

# Best subject per student
best_subject = np.argmax(grades, axis=1)
print(f"Best subject index: {best_subject}")  # [1 2 3 3 1]

# Students with average above 85
good_students = np.where(student_avg > 85)[0]
print(f"Above 85 avg: Students {good_students}")  # [0 1 2 4]

# Normalize grades (0-1 scale)
normalized = (grades - grades.min()) / (grades.max() - grades.min())
print(f"Normalized range: {normalized.min():.2f} to {normalized.max():.2f}")
# 0.00 to 1.00

# Grade distribution
print(f"Overall mean: {np.mean(grades):.1f}")     # 86.5
print(f"Overall std: {np.std(grades):.1f}")       # 8.1
print(f"Median grade: {np.median(grades):.1f}")   # 87.0
```

---

## Summary

| Operation | Function | Example |
|-----------|----------|---------|
| Element-wise math | `+`, `-`, `*`, `/`, `**` | `a + b` |
| Universal functions | `np.sqrt()`, `np.exp()` | `np.sqrt(arr)` |
| Aggregation | `np.sum()`, `np.mean()` | `np.mean(arr, axis=0)` |
| Comparison | `>`, `<`, `==` | `arr > 5` |
| Logical | `&`, `\|`, `np.logical_and()` | `(a > 1) & (a < 5)` |
| Sort | `np.sort()`, `np.argsort()` | `np.sort(arr)` |
| Stack | `np.vstack()`, `np.hstack()` | `np.vstack([a, b])` |
| Split | `np.split()`, `np.vsplit()` | `np.split(arr, 3)` |
| Copy | `arr.copy()` | `subset = arr[0:3].copy()` |

---

## Exercises

1. Create two arrays of shape (3, 3) and perform element-wise multiplication
2. Use broadcasting to subtract the column mean from each element in a matrix
3. Find all elements in an array that are between 10 and 50
4. Sort a 2D array by its second column
5. Stack three arrays vertically, then split the result into 3 equal parts

---
