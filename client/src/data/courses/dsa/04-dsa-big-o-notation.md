---
title: Big O Notation
---

# Big O Notation

**Big O notation** describes how the runtime or memory usage of an algorithm grows as the input size grows. It is the universal language for talking about algorithm efficiency.

## Why Big O?

Imagine two sorting algorithms. On 10 items, both finish instantly. On 1,000,000 items:

- Algorithm A takes **1 second**.
- Algorithm B takes **11 days**.

Both "work," but A scales and B doesn't. Big O tells you which is which **before** you run them.

## The idea

Big O measures the **worst-case** growth rate. We drop constants and lower-order terms because they become irrelevant at large input sizes.

| Expression | Big O | Why |
|---|---|---|
| 3n + 5 | O(n) | Drop constant 3 and term 5 |
| 2n² + 100n | O(n²) | n² dominates as n grows |
| 5 | O(1) | No dependence on n |
| n/2 | O(n) | Drop the 1/2 constant |

## Common Big O complexities

From fastest to slowest:

| Big O | Name | Example |
|---|---|---|
| O(1) | Constant | Array access by index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Loop through an array |
| O(n log n) | Linearithmic | Merge sort, quick sort (avg) |
| O(n²) | Quadratic | Nested loops (bubble sort) |
| O(2ⁿ) | Exponential | Recursive Fibonacci (naive) |
| O(n!) | Factorial | Generating all permutations |

### Growth comparison (n = 1,000,000)

| Big O | Operations |
|---|---|
| O(1) | 1 |
| O(log n) | ~20 |
| O(n) | 1,000,000 |
| O(n log n) | ~20,000,000 |
| O(n²) | 1,000,000,000,000 |

A computer doing 10⁸ operations per second would take **~3 hours** for O(n²) but **0.2 seconds** for O(n log n) on this input.

## How to determine Big O

### Rule 1: Loops

A single loop over n items is O(n):

```cpp
// O(n) — one pass through the array
int sum = 0;
for (int i = 0; i < n; i++) {
    sum += arr[i];
}
```

```java
// O(n) — one pass through the array
int sum = 0;
for (int i = 0; i < n; i++) {
    sum += arr[i];
}
```

```python
# O(n) — one pass through the list
total = 0
for x in arr:
    total += x
```

```javascript
// O(n) — one pass through the array
let sum = 0;
for (let i = 0; i < n; i++) {
    sum += arr[i];
}
```

### Rule 2: Nested loops

A loop inside a loop is O(n²):

```cpp
// O(n²) — every pair is checked
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        // constant work
    }
}
```

```java
// O(n²) — every pair is checked
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        // constant work
    }
}
```

```python
# O(n²) — every pair is checked
for i in range(n):
    for j in range(n):
        pass  # constant work
```

```javascript
// O(n²) — every pair is checked
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        // constant work
    }
}
```

### Rule 3: Halving the input

If each step cuts the problem in half, it is O(log n):

```cpp
// O(log n) — input halves each iteration
int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) break;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
```

```java
// O(log n) — input halves each iteration
int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) break;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
```

```python
# O(log n) — input halves each iteration
lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        break
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
```

```javascript
// O(log n) — input halves each iteration
let lo = 0, hi = n - 1;
while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) break;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
```

### Rule 4: Sequential steps add

If you do an O(n) step followed by an O(n²) step, the total is O(n + n²) = **O(n²)** (the larger term dominates).

### Rule 5: Different inputs use different variables

If one loop runs over array `a` (length m) and another over array `b` (length n), the complexity is O(m + n), not O(n²).

## Big O, Big Omega, Big Theta

| Notation | Meaning |
|---|---|
| O (Big O) | **Upper bound** — worst case growth |
| Ω (Big Omega) | **Lower bound** — best case growth |
| Θ (Big Theta) | **Tight bound** — exact growth rate |

In practice, we almost always use **Big O** because we care about the worst case.

## Common pitfalls

- **Ignoring hidden loops**: calling `.includes()` inside a loop makes it O(n²), not O(n).
- **Confusing O(1) with "fast"**: O(1) means constant time, not instant. An O(1) operation that takes 1 second is slower than an O(n) operation that takes 1 nanosecond per element — for small n.
- **Forgetting logarithms**: tree operations (BST lookup, heap insert) are O(log n), which is very fast even for large n.

## Practice: analyze these

1. A loop from 0 to n → **O(n)**
2. A loop from 0 to n, inside it a loop from 0 to n → **O(n²)**
3. A loop that doubles `i` each step (`i *= 2`) until `i >= n` → **O(log n)**
4. Two separate loops over n → O(n) + O(n) = **O(n)**

Understanding Big O is the foundation for every topic in this course. Next, we will dive deeper into **Time Complexity →**
