---
title: NumPy Advanced
---

# NumPy Advanced

In this lesson, you'll explore advanced NumPy features: linear algebra, random number generation, structured arrays, performance optimization, and file I/O.

---

## Linear Algebra with NumPy

NumPy's `linalg` module provides essential linear algebra operations used extensively in data science and machine learning.

### Dot Product

The dot product of two vectors $\mathbf{a}$ and $\mathbf{b}$ is:

$$\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i$$

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Dot product (three ways)
print(np.dot(a, b))   # 32
print(a @ b)          # 32
print(np.sum(a * b))  # 32

# 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
```

### Matrix Multiplication

For matrices $A$ (shape $m \times n$) and $B$ (shape $n \times p$), the product $C = AB$ has shape $m \times p$:

$$C_{ij} = \sum_{k=1}^{n} A_{ik} B_{kj}$$

```python
A = np.array([[1, 2],
              [3, 4]])

B = np.array([[5, 6],
              [7, 8]])

# Matrix multiplication
C = np.matmul(A, B)
# Or equivalently:
C = A @ B

print(C)
# [[19 22]
#  [43 50]]

# Verify: C[0,0] = 1*5 + 2*7 = 19
```

> **Note:** `*` does element-wise multiplication. Use `@` or `np.matmul()` for matrix multiplication.

### Transpose

The transpose swaps rows and columns: $(A^T)_{ij} = A_{ji}$

```python
A = np.array([[1, 2, 3],
              [4, 5, 6]])

print(A.T)
# [[1 4]
#  [2 5]
#  [3 6]]

print(A.shape)    # (2, 3)
print(A.T.shape)  # (3, 2)
```

### Determinant

The determinant of a $2 \times 2$ matrix:

$$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

```python
A = np.array([[3, 1],
              [2, 4]])

det = np.linalg.det(A)
print(f"Determinant: {det:.1f}")  # 10.0
# 3*4 - 1*2 = 10
```

### Matrix Inverse

The inverse $A^{-1}$ satisfies $A \cdot A^{-1} = I$:

```python
A = np.array([[3, 1],
              [2, 4]])

A_inv = np.linalg.inv(A)
print(A_inv)
# [[ 0.4 -0.1]
#  [-0.2  0.3]]

# Verify: A @ A_inv = Identity
print(np.round(A @ A_inv))
# [[1. 0.]
#  [0. 1.]]
```

### Eigenvalues and Eigenvectors

For a matrix $A$, eigenvalues $\lambda$ and eigenvectors $\mathbf{v}$ satisfy:

$$A\mathbf{v} = \lambda\mathbf{v}$$

```python
A = np.array([[4, 2],
              [1, 3]])

eigenvalues, eigenvectors = np.linalg.eig(A)

print(f"Eigenvalues: {eigenvalues}")   # [5. 2.]
print(f"Eigenvectors:\n{eigenvectors}")
# [[ 0.894 -0.707]
#  [ 0.447  0.707]]

# Verify: A @ v = lambda * v
v = eigenvectors[:, 0]
lam = eigenvalues[0]
print(np.allclose(A @ v, lam * v))  # True
```

### Solving Linear Systems

Solve $Ax = b$ for $x$:

```python
# System of equations:
# 2x + 3y = 8
# 4x + 1y = 6

A = np.array([[2, 3],
              [4, 1]])
b = np.array([8, 6])

x = np.linalg.solve(A, b)
print(f"x = {x[0]:.2f}, y = {x[1]:.2f}")  # x = 1.00, y = 2.00

# Verify
print(np.allclose(A @ x, b))  # True
```

---

## Random Number Generation

Random numbers are essential for simulations, sampling, and machine learning.

### Legacy API (Still Common)

```python
# Set seed for reproducibility
np.random.seed(42)

# Random floats [0, 1)
print(np.random.rand(3))       # [0.374 0.951 0.732]

# Random integers
print(np.random.randint(1, 7, size=5))  # [2 5 4 1 6]

# Normal distribution
print(np.random.randn(3))      # [-0.138  0.647  1.523]
```

### Modern API (Recommended)

NumPy 1.17+ introduced `default_rng()` — faster and more reliable.

```python
# Create a random number generator with a seed
rng = np.random.default_rng(42)

# Normal distribution: mean=0, std=1, size=5
normal_samples = rng.normal(0, 1, size=5)
print(normal_samples)
# [ 0.305 -0.039  0.405 -1.136  0.766]

# Uniform distribution: [low, high)
uniform_samples = rng.uniform(10, 20, size=5)
print(uniform_samples)
# [17.32 14.56 18.91 11.23 16.78]

# Random integers: [low, high)
int_samples = rng.integers(1, 100, size=5)
print(int_samples)
# [45 82 17 93 61]
```

### Choice and Shuffle

```python
rng = np.random.default_rng(42)

colors = np.array(['red', 'blue', 'green', 'yellow', 'purple'])

# Random choice (with replacement by default)
print(rng.choice(colors, size=3))
# ['green' 'purple' 'blue']

# Without replacement
print(rng.choice(colors, size=3, replace=False))
# ['yellow' 'red' 'green']

# Shuffle in-place
arr = np.arange(10)
rng.shuffle(arr)
print(arr)  # [7 3 1 9 4 0 8 5 2 6]
```

### Practical: Simulating Dice Rolls

```python
rng = np.random.default_rng(42)

# Roll two dice 10,000 times
dice1 = rng.integers(1, 7, size=10_000)
dice2 = rng.integers(1, 7, size=10_000)
total = dice1 + dice2

# Probability of rolling a 7
prob_seven = np.mean(total == 7)
print(f"P(sum=7) = {prob_seven:.4f}")  # ≈ 0.1667 (theoretical: 1/6)

# Average sum
print(f"Mean sum = {np.mean(total):.2f}")  # ≈ 7.00
```

---

## Structured Arrays

Structured arrays let you store heterogeneous data with named fields — like a lightweight table.

```python
# Define the data type
dt = np.dtype([
    ('name', 'U20'),      # Unicode string, max 20 chars
    ('age', 'i4'),        # 32-bit integer
    ('height', 'f8'),     # 64-bit float
])

# Create the structured array
people = np.array([
    ('Alice', 30, 165.5),
    ('Bob', 25, 180.2),
    ('Carol', 35, 170.0),
], dtype=dt)

# Access by field name
print(people['name'])    # ['Alice' 'Bob' 'Carol']
print(people['age'])     # [30 25 35]

# Filter
tall = people[people['height'] > 168]
print(tall['name'])      # ['Bob' 'Carol']

# Sort by age
sorted_people = np.sort(people, order='age')
print(sorted_people['name'])  # ['Bob' 'Alice' 'Carol']
```

> **Tip:** For complex tabular data, Pandas DataFrames are more powerful. Structured arrays are useful for memory-efficient storage.

---

## Memory Layout

NumPy arrays store data in contiguous memory blocks. Understanding layout helps optimize performance.

### C-Order vs Fortran-Order

```python
# C-order (row-major): default in NumPy
# Elements in a row are stored next to each other
c_arr = np.array([[1, 2, 3],
                  [4, 5, 6]], order='C')

# Fortran-order (column-major)
# Elements in a column are stored next to each other
f_arr = np.array([[1, 2, 3],
                  [4, 5, 6]], order='F')

# Check memory layout
print(c_arr.flags['C_CONTIGUOUS'])  # True
print(f_arr.flags['F_CONTIGUOUS'])  # True
```

### Why It Matters

Iterating along the memory layout is faster due to CPU cache efficiency:

```python
arr = np.random.rand(1000, 1000)

# Row iteration (fast for C-order)
row_sum = np.sum(arr, axis=1)

# Column iteration (slower for C-order)
col_sum = np.sum(arr, axis=0)
```

---

## Performance Tips

### 1. Vectorize Instead of Loops

```python
# BAD: Python loop
def slow_normalize(arr):
    result = np.empty_like(arr)
    for i in range(len(arr)):
        result[i] = (arr[i] - arr.min()) / (arr.max() - arr.min())
    return result

# GOOD: Vectorized
def fast_normalize(arr):
    return (arr - arr.min()) / (arr.max() - arr.min())
```

### 2. Use Appropriate dtypes

```python
# float64 (default) uses 8 bytes per element
arr64 = np.zeros(1_000_000, dtype=np.float64)
print(f"float64: {arr64.nbytes / 1e6:.1f} MB")  # 8.0 MB

# float32 uses 4 bytes — often sufficient
arr32 = np.zeros(1_000_000, dtype=np.float32)
print(f"float32: {arr32.nbytes / 1e6:.1f} MB")  # 4.0 MB
```

### 3. Use np.where() for Conditional Selection

```python
arr = np.array([1, -2, 3, -4, 5])

# Replace negatives with 0
result = np.where(arr > 0, arr, 0)
print(result)  # [1 0 3 0 5]

# Classify values
labels = np.where(arr > 0, 'positive', 'negative')
print(labels)  # ['positive' 'negative' 'positive' 'negative' 'positive']
```

### 4. Use np.select() for Multiple Conditions

```python
scores = np.array([95, 82, 67, 45, 73, 88, 54])

conditions = [
    scores >= 90,
    scores >= 80,
    scores >= 70,
    scores >= 60,
]
choices = ['A', 'B', 'C', 'D']

grades = np.select(conditions, choices, default='F')
print(grades)  # ['A' 'B' 'D' 'F' 'C' 'B' 'F']
```

### 5. Avoid Unnecessary Copies

```python
arr = np.arange(1_000_000)

# This creates a copy (uses extra memory)
doubled_copy = arr * 2

# In-place operations save memory
arr *= 2  # Modifies arr directly
```

---

## Saving and Loading Arrays

### Binary Format (.npy / .npz)

The fastest way to save and load NumPy arrays.

```python
arr = np.array([[1, 2, 3],
                [4, 5, 6]])

# Save single array
np.save('my_array.npy', arr)

# Load it back
loaded = np.load('my_array.npy')
print(loaded)
# [[1 2 3]
#  [4 5 6]]
```

### Multiple Arrays (.npz)

```python
x = np.array([1, 2, 3])
y = np.array([4, 5, 6])

# Save multiple arrays
np.savez('my_data.npz', x_data=x, y_data=y)

# Load
data = np.load('my_data.npz')
print(data['x_data'])  # [1 2 3]
print(data['y_data'])  # [4 5 6]

# Compressed version (smaller file)
np.savez_compressed('my_data_compressed.npz', x_data=x, y_data=y)
```

### Text Format (.csv / .txt)

```python
arr = np.array([[1.1, 2.2, 3.3],
                [4.4, 5.5, 6.6]])

# Save as text
np.savetxt('data.csv', arr, delimiter=',', header='a,b,c', comments='')

# Load from text
loaded = np.loadtxt('data.csv', delimiter=',', skiprows=1)
print(loaded)
# [[1.1 2.2 3.3]
#  [4.4 5.5 6.6]]
```

---

## Practical Example: Linear Regression with NumPy

Implement simple linear regression using linear algebra.

Given data points $(x_i, y_i)$, find the best-fit line $y = mx + c$ by solving the normal equations:

$$\hat{\beta} = (X^TX)^{-1}X^Ty$$

```python
import numpy as np

# Sample data: hours studied vs exam score
hours = np.array([1, 2, 3, 4, 5, 6, 7, 8])
scores = np.array([45, 50, 55, 60, 68, 72, 80, 85])

# Build design matrix X (add column of ones for intercept)
X = np.column_stack([np.ones(len(hours)), hours])
# X = [[1, 1],
#      [1, 2],
#      [1, 3], ...]

# Solve using normal equations
# beta = (X^T X)^{-1} X^T y
XtX = X.T @ X
Xty = X.T @ scores
beta = np.linalg.solve(XtX, Xty)

intercept, slope = beta
print(f"y = {slope:.2f}x + {intercept:.2f}")
# y = 5.71x + 38.75

# Predict
predicted = X @ beta
residuals = scores - predicted
r_squared = 1 - np.sum(residuals**2) / np.sum((scores - scores.mean())**2)
print(f"R² = {r_squared:.4f}")  # ≈ 0.99
```

---

## Performance Comparison: Loops vs Vectorized

```python
import numpy as np
import time

n = 1_000_000
rng = np.random.default_rng(42)
data = rng.normal(0, 1, size=n)

# Method 1: Python loop
start = time.time()
total = 0
for val in data:
    if val > 0:
        total += val ** 2
loop_time = time.time() - start

# Method 2: Vectorized NumPy
start = time.time()
mask = data > 0
total_np = np.sum(data[mask] ** 2)
vec_time = time.time() - start

print(f"Loop: {loop_time:.4f}s")
print(f"Vectorized: {vec_time:.4f}s")
print(f"Speedup: {loop_time / vec_time:.1f}x")
# Typically 50-100x speedup!
```

---

## Summary

| Topic | Key Functions |
|-------|---------------|
| Dot product | `np.dot(a, b)`, `a @ b` |
| Matrix multiply | `np.matmul(A, B)`, `A @ B` |
| Transpose | `A.T` |
| Determinant | `np.linalg.det(A)` |
| Inverse | `np.linalg.inv(A)` |
| Eigenvalues | `np.linalg.eig(A)` |
| Solve $Ax=b$ | `np.linalg.solve(A, b)` |
| Random (modern) | `np.random.default_rng(seed)` |
| Conditional | `np.where()`, `np.select()` |
| Save/Load | `np.save()`, `np.load()`, `np.savetxt()` |

---

## Exercises

1. Create a 3×3 matrix, compute its determinant and inverse, and verify $A \cdot A^{-1} = I$
2. Use `np.random.default_rng()` to simulate flipping a coin 10,000 times. What fraction are heads?
3. Solve the system: $3x + 2y = 7$, $x - y = 1$
4. Save a large random array to `.npy` and `.csv`, compare file sizes
5. Implement matrix-vector multiplication using only loops, then compare speed with `@`

---
