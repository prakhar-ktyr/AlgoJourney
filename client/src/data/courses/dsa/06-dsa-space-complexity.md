---
title: Space Complexity
---

# Space Complexity

Space complexity measures **how much extra memory** an algorithm uses as the input size grows. Just like time complexity, we express it in Big O notation.

## What counts as "extra" space?

We distinguish between:

- **Input space** — the memory used to store the input itself. This is not counted.
- **Auxiliary space** — the extra memory the algorithm allocates beyond the input. **This is what we measure.**

When someone says "O(1) space," they mean the algorithm uses a constant amount of extra memory regardless of input size.

## Common space complexities

| Space | Meaning | Example |
|---|---|---|
| O(1) | Constant extra space | Swap two variables, in-place sorting |
| O(log n) | Logarithmic | Recursive binary search (call stack) |
| O(n) | Linear | Creating a copy of the array, hash set |
| O(n²) | Quadratic | 2D matrix (n × n) |

## Examples

### O(1) space — in-place reversal

This algorithm reverses an array using only two pointer variables:

```cpp
void reverseArray(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}
// Extra space: 3 variables (left, right, temp) → O(1)
```

```java
void reverseArray(int[] arr) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}
// Extra space: 3 variables (left, right, temp) → O(1)
```

```python
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
# Extra space: 2 variables (left, right) → O(1)
```

```javascript
function reverseArray(arr) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
}
// Extra space: 2 variables (left, right) → O(1)
```

### O(n) space — creating a new array

```cpp
#include <vector>
using namespace std;

vector<int> doubleElements(vector<int>& arr) {
    vector<int> result(arr.size());  // new array of size n
    for (int i = 0; i < arr.size(); i++) {
        result[i] = arr[i] * 2;
    }
    return result;
}
// Extra space: result array of size n → O(n)
```

```java
int[] doubleElements(int[] arr) {
    int[] result = new int[arr.length];  // new array of size n
    for (int i = 0; i < arr.length; i++) {
        result[i] = arr[i] * 2;
    }
    return result;
}
// Extra space: result array of size n → O(n)
```

```python
def double_elements(arr):
    result = [x * 2 for x in arr]  # new list of size n
    return result
# Extra space: result list of size n → O(n)
```

```javascript
function doubleElements(arr) {
    const result = arr.map((x) => x * 2);  // new array of size n
    return result;
}
// Extra space: result array of size n → O(n)
```

### O(log n) space — recursion stack

Recursive functions consume stack space. Each recursive call adds a frame to the call stack:

```cpp
// Binary search (recursive)
int binarySearch(int arr[], int lo, int hi, int target) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearch(arr, mid + 1, hi, target);
    return binarySearch(arr, lo, mid - 1, target);
}
// Each call halves the range → max depth is log(n)
// Space: O(log n) for the call stack
```

```java
int binarySearch(int[] arr, int lo, int hi, int target) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearch(arr, mid + 1, hi, target);
    return binarySearch(arr, lo, mid - 1, target);
}
// Space: O(log n) for the call stack
```

```python
def binary_search(arr, lo, hi, target):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return binary_search(arr, mid + 1, hi, target)
    return binary_search(arr, lo, mid - 1, target)
# Space: O(log n) for the call stack
```

```javascript
function binarySearch(arr, lo, hi, target) {
    if (lo > hi) return -1;
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) return binarySearch(arr, mid + 1, hi, target);
    return binarySearch(arr, lo, mid - 1, target);
}
// Space: O(log n) for the call stack
```

## The time–space trade-off

Often you can make an algorithm faster by using more memory, or use less memory by accepting a slower algorithm. This is one of the most fundamental trade-offs in computer science.

### Example: checking for duplicates

**Approach 1 — O(n²) time, O(1) space:**

Compare every pair with nested loops (no extra memory).

**Approach 2 — O(n) time, O(n) space:**

Insert each element into a hash set. If it is already there, we found a duplicate.

```cpp
#include <unordered_set>
using namespace std;

bool hasDuplicates(int arr[], int n) {
    unordered_set<int> seen;
    for (int i = 0; i < n; i++) {
        if (seen.count(arr[i])) return true;
        seen.insert(arr[i]);
    }
    return false;
}
// Time: O(n), Space: O(n)
```

```java
import java.util.HashSet;

boolean hasDuplicates(int[] arr) {
    HashSet<Integer> seen = new HashSet<>();
    for (int x : arr) {
        if (seen.contains(x)) return true;
        seen.add(x);
    }
    return false;
}
// Time: O(n), Space: O(n)
```

```python
def has_duplicates(arr):
    seen = set()
    for x in arr:
        if x in seen:
            return True
        seen.add(x)
    return False
# Time: O(n), Space: O(n)
```

```javascript
function hasDuplicates(arr) {
    const seen = new Set();
    for (const x of arr) {
        if (seen.has(x)) return true;
        seen.add(x);
    }
    return false;
}
// Time: O(n), Space: O(n)
```

We traded O(n) extra space to improve time from O(n²) to O(n) — a massive speedup for large inputs.

## In-place algorithms

An algorithm is **in-place** if it uses O(1) auxiliary space (it modifies the input directly rather than creating new data structures). Examples include:

- Bubble sort, selection sort, insertion sort
- Array reversal with two pointers
- Partitioning (used in quick sort)

In-place algorithms are preferred when memory is limited, but they modify the input, which may not always be acceptable.

## Summary

- Space complexity = extra memory used beyond the input.
- Recursive algorithms consume stack space proportional to the maximum recursion depth.
- The time–space trade-off is a core design decision: sometimes O(n) space is worth it to achieve O(n) time.
- In-place = O(1) extra space.

Next: **Recursion Basics →**
