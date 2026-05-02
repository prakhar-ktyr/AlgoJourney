---
title: Time Complexity
---

# Time Complexity

Time complexity measures **how many operations** an algorithm performs as the input size grows. It tells you whether your solution can handle the expected input within a time limit.

## Counting operations, not seconds

We never measure time complexity in seconds because hardware varies. Instead, we count the number of **elementary operations** — comparisons, assignments, arithmetic, and memory accesses — as a function of input size n.

```cpp
// How many operations?
int sum = 0;           // 1 assignment
for (int i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

```java
// How many operations?
int sum = 0;           // 1 assignment
for (int i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

```python
# How many operations?
total = 0              # 1 assignment
for x in arr:          # n iterations
    total += x         # 1 addition per iteration
# Total: 1 + n operations → O(n)
```

```javascript
// How many operations?
let sum = 0;           // 1 assignment
for (let i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

## Best, worst, and average case

Most algorithms behave differently depending on the input:

### Example: Linear search

```cpp
// Find target in an unsorted array
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

```java
int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

```python
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i
    return -1
```

```javascript
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}
```

| Case | When | Operations | Big O |
|---|---|---|---|
| Best | Target is the first element | 1 | O(1) |
| Worst | Target is last or not present | n | O(n) |
| Average | Target is somewhere in the middle | n/2 | O(n) |

When we say "time complexity" without qualification, we mean **worst case**.

## Analyzing common patterns

### Pattern 1: Constant — O(1)

The number of operations does not depend on input size.

```cpp
int getFirst(int arr[], int n) {
    return arr[0];  // always one operation
}
```

```java
int getFirst(int[] arr) {
    return arr[0];  // always one operation
}
```

```python
def get_first(arr):
    return arr[0]  # always one operation
```

```javascript
function getFirst(arr) {
    return arr[0];  // always one operation
}
```

### Pattern 2: Logarithmic — O(log n)

Each step eliminates half the remaining input. We will study binary search in depth later — here is the complexity intuition:

- n = 1,000,000 → about 20 steps (since 2²⁰ ≈ 1,000,000)
- n = 1,000,000,000 → about 30 steps

### Pattern 3: Linear — O(n)

One pass through the data.

```cpp
int findMax(int arr[], int n) {
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

```java
int findMax(int[] arr) {
    int maxVal = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

```python
def find_max(arr):
    max_val = arr[0]
    for x in arr[1:]:
        if x > max_val:
            max_val = x
    return max_val
```

```javascript
function findMax(arr) {
    let maxVal = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

### Pattern 4: Quadratic — O(n²)

Two nested loops, each running n times.

```cpp
// Check if array has duplicates (brute force)
bool hasDuplicates(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
```

```java
boolean hasDuplicates(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
```

```python
def has_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False
```

```javascript
function hasDuplicates(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) return true;
        }
    }
    return false;
}
```

Note: the inner loop starts at `i + 1`, so the actual count is n(n-1)/2 — but that simplifies to O(n²).

### Pattern 5: Linearithmic — O(n log n)

Algorithms that divide and conquer, doing O(n) work at each of O(log n) levels. This is the time complexity of efficient sorting algorithms like merge sort and quick sort (average case).

## Practical time limits

In competitive programming and coding interviews, a rough rule of thumb:

| Operations | Time (≈) |
|---|---|
| 10⁶ | < 0.1 seconds |
| 10⁷ | ~0.5 seconds |
| 10⁸ | ~1 second |
| 10⁹ | ~10 seconds (too slow) |

So for n = 10⁵:
- O(n²) = 10¹⁰ → **too slow**
- O(n log n) ≈ 1.7 × 10⁶ → **fast**
- O(n) = 10⁵ → **very fast**

## Amortized time complexity

Some operations are expensive occasionally but cheap on average. Example: a dynamic array (like `std::vector`, `ArrayList`, or Python `list`) doubles its capacity when full. The doubling is O(n), but it happens so rarely that each insertion is **O(1) amortized**.

Think of it like this: you pay a little extra on cheap operations to "pre-pay" for the expensive ones.

## Summary

- Count operations as a function of n, drop constants and lower terms.
- Always assume worst case unless stated otherwise.
- Know the common patterns: O(1), O(log n), O(n), O(n log n), O(n²).
- Use the ~10⁸ operations/second rule to judge whether your solution is fast enough.

Next: **Space Complexity →**
