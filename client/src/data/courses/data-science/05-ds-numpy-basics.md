---
title: NumPy Basics
---

# NumPy Basics

**NumPy** (Numerical Python) is the foundation of scientific computing in Python. Nearly every data science library — Pandas, Scikit-Learn, TensorFlow — is built on top of NumPy arrays.

---

## What is NumPy?

NumPy provides:

- **N-dimensional arrays** (`ndarray`) — fast, memory-efficient containers for data
- **Vectorized operations** — apply math to entire arrays without loops
- **Broadcasting** — operations between arrays of different shapes
- **Linear algebra, random numbers, Fourier transforms** — and much more

---

## Why NumPy?

Python lists are flexible but slow for numerical work. NumPy arrays are:

- **50–100x faster** than Python lists for numerical operations
- **Memory-efficient** — stores data in contiguous blocks
- **Vectorized** — no need to write explicit loops

```python
import numpy as np
import time

# Speed comparison: sum 1 million numbers
size = 1_000_000

# Python list
py_list = list(range(size))
start = time.time()
total = sum(py_list)
py_time = time.time() - start

# NumPy array
np_arr = np.arange(size)
start = time.time()
total = np_arr.sum()
np_time = time.time() - start

print(f"Python list: {py_time*1000:.2f} ms")
print(f"NumPy array: {np_time*1000:.2f} ms")
print(f"NumPy is {py_time/np_time:.0f}x faster!")
```

**Output:**
```
Python list: 45.23 ms
NumPy array: 0.89 ms
NumPy is 51x faster!
```

---

## Importing NumPy

The standard convention is:

```python
import numpy as np
```

Always use the `np` alias — every tutorial, book, and codebase uses it.

---

## Creating Arrays

### From a Python List

```python
import numpy as np

# 1D array
arr1d = np.array([1, 2, 3, 4, 5])
print(arr1d)        # [1 2 3 4 5]
print(type(arr1d))  # <class 'numpy.ndarray'>

# 2D array (matrix)
arr2d = np.array([[1, 2, 3],
                  [4, 5, 6],
                  [7, 8, 9]])
print(arr2d)
# [[1 2 3]
#  [4 5 6]
#  [7 8 9]]

# 3D array
arr3d = np.array([[[1, 2], [3, 4]],
                  [[5, 6], [7, 8]]])
print(arr3d.shape)  # (2, 2, 2)
```

### Zeros and Ones

```python
# Array of zeros
zeros = np.zeros((3, 4))
print(zeros)
# [[0. 0. 0. 0.]
#  [0. 0. 0. 0.]
#  [0. 0. 0. 0.]]

# Array of ones
ones = np.ones((2, 3))
print(ones)
# [[1. 1. 1.]
#  [1. 1. 1.]]

# Array filled with a specific value
sevens = np.full((3, 3), 7)
print(sevens)
# [[7 7 7]
#  [7 7 7]
#  [7 7 7]]
```

### Ranges and Sequences

```python
# arange — like Python's range() but returns an array
arr = np.arange(0, 10, 2)
print(arr)  # [0 2 4 6 8]

# linspace — evenly spaced numbers in a range
arr = np.linspace(0, 1, 5)
print(arr)  # [0.   0.25 0.5  0.75 1.  ]

# More linspace examples
angles = np.linspace(0, 2 * np.pi, 100)  # 100 points from 0 to 2π
temperatures = np.linspace(-10, 40, 51)    # 51 points from -10 to 40
```

### Random Arrays

```python
# Uniform random [0, 1)
rand = np.random.rand(3, 3)
print(rand)
# [[0.37 0.95 0.73]
#  [0.60 0.16 0.06]
#  [0.87 0.70 0.02]]

# Standard normal (mean=0, std=1)
randn = np.random.randn(3, 3)
print(randn)
# [[-0.42  1.26 -0.87]
#  [ 0.15  0.67 -1.42]
#  [ 0.33 -0.55  0.91]]

# Random integers
randint = np.random.randint(1, 100, size=(3, 4))
print(randint)
# [[42 67 12 89]
#  [34 56 78 23]
#  [91 45 33 67]]

# Random choice from an array
choices = np.random.choice(["red", "blue", "green"], size=5)
print(choices)  # ['blue' 'red' 'green' 'blue' 'red']

# Reproducible random numbers (set seed)
np.random.seed(42)
arr = np.random.rand(5)
print(arr)  # Always the same: [0.374 0.950 0.732 0.598 0.156]
```

### Special Arrays

```python
# Identity matrix
eye = np.eye(4)
print(eye)
# [[1. 0. 0. 0.]
#  [0. 1. 0. 0.]
#  [0. 0. 1. 0.]
#  [0. 0. 0. 1.]]

# Empty array (uninitialized — faster than zeros)
empty = np.empty((2, 3))  # Values are whatever is in memory

# Array like another array
template = np.array([[1, 2], [3, 4]])
zeros_like = np.zeros_like(template)
ones_like = np.ones_like(template)
print(zeros_like)
# [[0 0]
#  [0 0]]
```

---

## Array Attributes

Every NumPy array has useful attributes:

```python
arr = np.array([[1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12]])

print(f"Shape:    {arr.shape}")      # (3, 4) — 3 rows, 4 columns
print(f"Ndim:     {arr.ndim}")       # 2 — number of dimensions
print(f"Size:     {arr.size}")       # 12 — total elements
print(f"Dtype:    {arr.dtype}")      # int64 — data type
print(f"Itemsize: {arr.itemsize}")   # 8 — bytes per element
print(f"Nbytes:   {arr.nbytes}")     # 96 — total bytes (12 × 8)
```

**Output:**
```
Shape:    (3, 4)
Ndim:     2
Size:     12
Dtype:    int64
Itemsize: 8
Nbytes:   96
```

---

## Array vs Python List

Key differences:

| Feature | Python List | NumPy Array |
|---------|------------|-------------|
| Data types | Mixed | Homogeneous |
| Speed | Slow | Fast (C-backed) |
| Memory | More | Less |
| Operations | Element-by-element (loops) | Vectorized |
| Size | Dynamic | Fixed after creation |

```python
# Lists allow mixed types
py_list = [1, "hello", 3.14, True]

# NumPy arrays are homogeneous
np_arr = np.array([1, 2, 3, 4])  # All int64

# Arithmetic is different!
py_list = [1, 2, 3]
np_arr = np.array([1, 2, 3])

# Python list: + concatenates
print(py_list + py_list)  # [1, 2, 3, 1, 2, 3]

# NumPy: + adds element-wise
print(np_arr + np_arr)    # [2 4 6]

# Python list: * repeats
print(py_list * 3)  # [1, 2, 3, 1, 2, 3, 1, 2, 3]

# NumPy: * multiplies element-wise
print(np_arr * 3)   # [3 6 9]
```

---

## Data Types

NumPy arrays have a single data type (`dtype`):

| dtype | Description | Example |
|-------|-------------|---------|
| `int32` | 32-bit integer | -2B to 2B |
| `int64` | 64-bit integer (default) | Very large range |
| `float32` | 32-bit float | 7 decimal digits |
| `float64` | 64-bit float (default) | 15 decimal digits |
| `bool` | Boolean | True / False |
| `complex128` | Complex number | 1+2j |
| `object` | Python object | Strings, mixed |

### Specifying Data Types

```python
# Specify type at creation
arr_float = np.array([1, 2, 3], dtype=np.float32)
print(arr_float)        # [1. 2. 3.]
print(arr_float.dtype)  # float32

# Boolean array
arr_bool = np.array([1, 0, 1, 0], dtype=bool)
print(arr_bool)  # [ True False  True False]

# Convert type
arr_int = np.array([1.7, 2.3, 3.9])
arr_converted = arr_int.astype(np.int32)
print(arr_converted)  # [1 2 3]  (truncates, doesn't round)
```

### Memory comparison

```python
# float64 uses 8 bytes per element
arr64 = np.ones(1000, dtype=np.float64)
print(f"float64: {arr64.nbytes} bytes")  # 8000 bytes

# float32 uses 4 bytes per element
arr32 = np.ones(1000, dtype=np.float32)
print(f"float32: {arr32.nbytes} bytes")  # 4000 bytes

# For large datasets, float32 saves significant memory!
```

---

## Indexing

### 1D Array Indexing

```python
arr = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90])

# Single element
print(arr[0])     # 10 (first element)
print(arr[-1])    # 90 (last element)
print(arr[4])     # 50

# Slicing: arr[start:stop:step]
print(arr[1:4])   # [20 30 40]
print(arr[:3])    # [10 20 30]
print(arr[5:])    # [60 70 80 90]
print(arr[::2])   # [10 30 50 70 90] (every 2nd element)
print(arr[::-1])  # [90 80 70 60 50 40 30 20 10] (reversed)
```

### 2D Array Indexing

```python
arr2d = np.array([[1, 2, 3, 4],
                  [5, 6, 7, 8],
                  [9, 10, 11, 12]])

# Single element: arr[row, col]
print(arr2d[0, 0])   # 1  (top-left)
print(arr2d[2, 3])   # 12 (bottom-right)
print(arr2d[1, 2])   # 7

# Entire row
print(arr2d[0])      # [1 2 3 4] (first row)
print(arr2d[0, :])   # [1 2 3 4] (same thing, explicit)
print(arr2d[-1])     # [9 10 11 12] (last row)

# Entire column
print(arr2d[:, 0])   # [1 5 9] (first column)
print(arr2d[:, -1])  # [4 8 12] (last column)

# Subarray (slice)
print(arr2d[0:2, 1:3])
# [[2 3]
#  [6 7]]
```

---

## Boolean Indexing

Filter arrays using conditions — extremely powerful for data science:

```python
arr = np.array([15, 23, 8, 42, 31, 5, 67, 12, 48, 29])

# Create a boolean mask
mask = arr > 25
print(mask)  # [False False False  True  True False  True False  True  True]

# Apply the mask to filter
filtered = arr[mask]
print(filtered)  # [42 31 67 48 29]

# Shorthand — combine in one line
print(arr[arr > 25])  # [42 31 67 48 29]

# Multiple conditions (use & for AND, | for OR)
print(arr[(arr > 10) & (arr < 40)])  # [15 23 31 12 29]
print(arr[(arr < 10) | (arr > 50)])  # [8 5 67]

# Negation
print(arr[~(arr > 25)])  # [15 23 8 5 12]
```

### Practical Example

```python
# Temperatures for a week
temps = np.array([22.5, 28.3, 31.7, 19.8, 35.2, 27.1, 24.6])
days = np.array(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])

# Find hot days (above 30°C)
hot_mask = temps > 30
print(f"Hot days: {days[hot_mask]}")      # ['Wed' 'Fri']
print(f"Hot temps: {temps[hot_mask]}")    # [31.7 35.2]
print(f"Number of hot days: {hot_mask.sum()}")  # 2
```

---

## Fancy Indexing

Select specific elements by index:

```python
arr = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90])

# Select specific indices
indices = [0, 2, 4, 7]
print(arr[indices])  # [10 30 50 80]

# Works with 2D arrays too
arr2d = np.array([[1, 2, 3],
                  [4, 5, 6],
                  [7, 8, 9]])

# Select specific rows
print(arr2d[[0, 2]])
# [[1 2 3]
#  [7 8 9]]

# Select specific elements: (row_indices, col_indices)
rows = [0, 1, 2]
cols = [2, 1, 0]
print(arr2d[rows, cols])  # [3 5 7] — elements (0,2), (1,1), (2,0)
```

---

## Reshaping Arrays

Change the shape of an array without changing its data:

```python
arr = np.arange(12)
print(arr)  # [ 0  1  2  3  4  5  6  7  8  9 10 11]

# Reshape to 3×4
reshaped = arr.reshape(3, 4)
print(reshaped)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

# Reshape to 4×3
print(arr.reshape(4, 3))
# [[ 0  1  2]
#  [ 3  4  5]
#  [ 6  7  8]
#  [ 9 10 11]]

# Use -1 to auto-calculate one dimension
print(arr.reshape(2, -1))   # Shape: (2, 6)
print(arr.reshape(-1, 4))   # Shape: (3, 4)
print(arr.reshape(3, 2, -1))  # Shape: (3, 2, 2)
```

### Flatten and Ravel

```python
arr2d = np.array([[1, 2, 3],
                  [4, 5, 6]])

# flatten() — returns a copy
flat = arr2d.flatten()
print(flat)  # [1 2 3 4 5 6]

# ravel() — returns a view (more memory efficient)
raveled = arr2d.ravel()
print(raveled)  # [1 2 3 4 5 6]

# Transpose
print(arr2d.T)
# [[1 4]
#  [2 5]
#  [3 6]]
```

### Adding Dimensions

```python
arr = np.array([1, 2, 3])
print(arr.shape)  # (3,)

# Add a new axis — useful for matrix operations
row = arr[np.newaxis, :]   # Shape: (1, 3) — row vector
col = arr[:, np.newaxis]   # Shape: (3, 1) — column vector

print(f"Row shape: {row.shape}")  # (1, 3)
print(f"Col shape: {col.shape}")  # (3, 1)

# Equivalent using reshape
row2 = arr.reshape(1, -1)  # (1, 3)
col2 = arr.reshape(-1, 1)  # (3, 1)
```

---

## Stacking and Splitting

### Combining Arrays

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Concatenate
print(np.concatenate([a, b]))  # [1 2 3 4 5 6]

# Vertical stack (row-wise)
print(np.vstack([a, b]))
# [[1 2 3]
#  [4 5 6]]

# Horizontal stack (column-wise)
print(np.hstack([a, b]))  # [1 2 3 4 5 6]

# For 2D arrays
m1 = np.array([[1, 2], [3, 4]])
m2 = np.array([[5, 6], [7, 8]])

print(np.vstack([m1, m2]))
# [[1 2]
#  [3 4]
#  [5 6]
#  [7 8]]

print(np.hstack([m1, m2]))
# [[1 2 5 6]
#  [3 4 7 8]]
```

### Splitting Arrays

```python
arr = np.arange(12)

# Split into 3 equal parts
parts = np.split(arr, 3)
print(parts)
# [array([0, 1, 2, 3]), array([4, 5, 6, 7]), array([8, 9, 10, 11])]

# Split at specific indices
parts = np.split(arr, [3, 7])
print(parts)
# [array([0, 1, 2]), array([3, 4, 5, 6]), array([7, 8, 9, 10, 11])]
```

---

## Copying Arrays

Understanding views vs copies is important:

```python
arr = np.array([1, 2, 3, 4, 5])

# Slicing creates a VIEW (shared memory)
view = arr[1:4]
view[0] = 99
print(arr)  # [1 99 3 4 5] — original changed!

# Use .copy() for independent copy
arr = np.array([1, 2, 3, 4, 5])
copy = arr[1:4].copy()
copy[0] = 99
print(arr)  # [1 2 3 4 5] — original unchanged
```

---

## Practical Example: Student Grades

```python
import numpy as np

# Student grades: 5 students × 4 subjects
grades = np.array([
    [85, 92, 78, 90],   # Student 0
    [76, 88, 95, 82],   # Student 1
    [92, 75, 88, 96],   # Student 2
    [68, 72, 65, 70],   # Student 3
    [95, 98, 92, 97],   # Student 4
])

subjects = ["Math", "Science", "English", "History"]
students = ["Alice", "Bob", "Charlie", "Diana", "Eve"]

# Average grade per student
student_avg = grades.mean(axis=1)
for name, avg in zip(students, student_avg):
    print(f"  {name:10s} {avg:.1f}")

# Best student
best_idx = student_avg.argmax()
print(f"\nBest student: {students[best_idx]} ({student_avg[best_idx]:.1f})")

# Subject averages
subject_avg = grades.mean(axis=0)
for subj, avg in zip(subjects, subject_avg):
    print(f"  {subj:10s} {avg:.1f}")

# Students scoring above 90 in any subject
high_achievers = np.any(grades > 90, axis=1)
print(f"\nHigh achievers: {np.array(students)[high_achievers]}")

# Grades above 90
print(f"\nAll grades > 90: {grades[grades > 90]}")
```

**Output:**
```
  Alice      86.2
  Bob        85.2
  Charlie    87.8
  Diana      68.8
  Eve        95.5

Best student: Eve (95.5)
  Math       83.2
  Science    85.0
  English    83.6
  History    87.0

High achievers: ['Alice' 'Bob' 'Charlie' 'Eve']

All grades > 90: [92 90 95 92 96 95 98 92 97]
```

---

## Summary

| Concept | Syntax | Example |
|---------|--------|---------|
| Import | `import numpy as np` | Convention |
| From list | `np.array([1,2,3])` | 1D array |
| Zeros | `np.zeros((3,4))` | 3×4 of zeros |
| Ones | `np.ones((2,3))` | 2×3 of ones |
| Range | `np.arange(0,10,2)` | [0,2,4,6,8] |
| Linspace | `np.linspace(0,1,5)` | 5 evenly spaced |
| Random | `np.random.rand(3,3)` | 3×3 uniform |
| Shape | `arr.shape` | (rows, cols) |
| Index | `arr[row, col]` | Single element |
| Slice | `arr[1:4]` | Elements 1–3 |
| Boolean | `arr[arr > 5]` | Filter |
| Reshape | `arr.reshape(3,4)` | Change shape |
| Flatten | `arr.flatten()` | To 1D |

---

## Key Formulas

The **mean** of an array:

$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$$

The **variance**:

$$\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

The **standard deviation**:

$$\sigma = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2}$$

```python
data = np.array([4, 7, 2, 9, 5, 8, 3, 6])

print(f"Mean: {data.mean():.2f}")   # 5.50
print(f"Var:  {data.var():.2f}")    # 4.75
print(f"Std:  {data.std():.2f}")    # 2.18
```

---

## Next Lesson

**Next:** NumPy Operations →

In the next lesson, you'll learn arithmetic operations, broadcasting, universal functions, and aggregation methods that make NumPy so powerful for data science.
