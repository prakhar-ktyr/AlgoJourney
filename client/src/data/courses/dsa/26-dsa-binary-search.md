---
title: "Binary Search"
---

# Binary Search

Binary search is one of the most important algorithms in computer science. It finds a target value in a **sorted array** by repeatedly dividing the search space in half.

**Prerequisite:** The array must be **sorted** (ascending or descending).

---

## How Binary Search Works

```
Sorted Array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
Target: 11

Step 1: lo=0, hi=9, mid=4 → arr[4]=9 < 11 → search right half
        [1, 3, 5, 7, 9, | 11, 13, 15, 17, 19]
                           ↑ search here

Step 2: lo=5, hi=9, mid=7 → arr[7]=15 > 11 → search left half
        [11, 13, 15, | 17, 19]
         ↑ search here

Step 3: lo=5, hi=6, mid=5 → arr[5]=11 = 11 ✓ Found at index 5!
```

Each step eliminates **half** the remaining elements. For an array of 1,000,000 elements, binary search needs at most **20 comparisons** (log₂ 1,000,000 ≈ 20).

---

## Step-by-Step Trace

```
Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
Target: 23

Iteration 1:
  lo = 0, hi = 9
  mid = (0 + 9) / 2 = 4
  arr[4] = 16 < 23 → lo = mid + 1 = 5

Iteration 2:
  lo = 5, hi = 9
  mid = (5 + 9) / 2 = 7
  arr[7] = 56 > 23 → hi = mid - 1 = 6

Iteration 3:
  lo = 5, hi = 6
  mid = (5 + 6) / 2 = 5
  arr[5] = 23 == 23 → FOUND at index 5!

Only 3 comparisons for a 10-element array!
```

---

## Iterative Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int lo = 0;
    int hi = arr.size() - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // Avoids integer overflow

        if (arr[mid] == target) {
            return mid;        // Found!
        } else if (arr[mid] < target) {
            lo = mid + 1;      // Target is in right half
        } else {
            hi = mid - 1;      // Target is in left half
        }
    }

    return -1;  // Not found
}

int main() {
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};

    cout << binarySearch(arr, 23) << endl;  // 5
    cout << binarySearch(arr, 10) << endl;  // -1
    return 0;
}
```

```java
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int lo = 0;
        int hi = arr.length - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;  // Avoids integer overflow

            if (arr[mid] == target) {
                return mid;        // Found!
            } else if (arr[mid] < target) {
                lo = mid + 1;      // Target is in right half
            } else {
                hi = mid - 1;      // Target is in left half
            }
        }

        return -1;  // Not found
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};

        System.out.println(binarySearch(arr, 23));  // 5
        System.out.println(binarySearch(arr, 10));  // -1
    }
}
```

```python
def binary_search(arr, target):
    lo = 0
    hi = len(arr) - 1

    while lo <= hi:
        mid = lo + (hi - lo) // 2  # Avoids integer overflow (relevant in other languages)

        if arr[mid] == target:
            return mid        # Found!
        elif arr[mid] < target:
            lo = mid + 1      # Target is in right half
        else:
            hi = mid - 1      # Target is in left half

    return -1  # Not found


arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(arr, 23))  # 5
print(binary_search(arr, 10))  # -1
```

```javascript
function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // Avoids overflow

    if (arr[mid] === target) {
      return mid; // Found!
    } else if (arr[mid] < target) {
      lo = mid + 1; // Target is in right half
    } else {
      hi = mid - 1; // Target is in left half
    }
  }

  return -1; // Not found
}

const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log(binarySearch(arr, 23)); // 5
console.log(binarySearch(arr, 10)); // -1
```

---

## Recursive Implementation

```cpp
int binarySearchRecursive(const vector<int>& arr, int target, int lo, int hi) {
    if (lo > hi) return -1;  // Base case: not found

    int mid = lo + (hi - lo) / 2;

    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, hi);
    return binarySearchRecursive(arr, target, lo, mid - 1);
}

// Usage:
// binarySearchRecursive(arr, target, 0, arr.size() - 1);
```

```java
public static int binarySearchRecursive(int[] arr, int target, int lo, int hi) {
    if (lo > hi) return -1;  // Base case: not found

    int mid = lo + (hi - lo) / 2;

    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, hi);
    return binarySearchRecursive(arr, target, lo, mid - 1);
}

// Usage:
// binarySearchRecursive(arr, target, 0, arr.length - 1);
```

```python
def binary_search_recursive(arr, target, lo, hi):
    if lo > hi:
        return -1  # Base case: not found

    mid = lo + (hi - lo) // 2

    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, hi)
    else:
        return binary_search_recursive(arr, target, lo, mid - 1)


# Usage:
# binary_search_recursive(arr, target, 0, len(arr) - 1)
```

```javascript
function binarySearchRecursive(arr, target, lo, hi) {
  if (lo > hi) return -1; // Base case: not found

  const mid = lo + Math.floor((hi - lo) / 2);

  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, hi);
  return binarySearchRecursive(arr, target, lo, mid - 1);
}

// Usage:
// binarySearchRecursive(arr, target, 0, arr.length - 1);
```

> **Iterative vs Recursive:** Prefer iterative in practice — it uses O(1) space vs O(log n) stack space for recursion.

---

## The Classic Off-by-One Bugs

Binary search is notoriously tricky to implement correctly. Here are the common pitfalls:

### Bug 1: `lo <= hi` vs `lo < hi`

```
Using lo <= hi (inclusive bounds):
  - hi = arr.length - 1
  - When arr[mid] > target: hi = mid - 1
  - When arr[mid] < target: lo = mid + 1
  - Terminates when lo > hi

Using lo < hi (exclusive upper bound):
  - hi = arr.length
  - When arr[mid] > target: hi = mid
  - When arr[mid] < target: lo = mid + 1
  - Terminates when lo == hi
```

**Stick with `lo <= hi` for standard binary search** — it's the most intuitive.

### Bug 2: Integer Overflow in Mid Calculation

```cpp
// WRONG (can overflow for large arrays):
int mid = (lo + hi) / 2;

// CORRECT:
int mid = lo + (hi - lo) / 2;
```

If `lo + hi` exceeds `INT_MAX` (2,147,483,647), you get undefined behavior in C++ or a negative number in Java. The `lo + (hi - lo) / 2` formula avoids this.

### Bug 3: Infinite Loop

```cpp
// WRONG: can infinite loop when lo + 1 == hi
while (lo < hi) {
    int mid = (lo + hi) / 2;
    if (arr[mid] < target) {
        lo = mid;  // BUG! If lo=3, hi=4, mid=3 → lo stays 3 forever
    } else {
        hi = mid;
    }
}

// CORRECT:
lo = mid + 1;  // Always make progress
```

---

## Finding First and Last Occurrence

When duplicates exist, standard binary search returns *any* matching index. Here's how to find the **first** and **last** occurrence:

### First Occurrence (Leftmost)

```cpp
int findFirst(const vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    int result = -1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) {
            result = mid;     // Record this match
            hi = mid - 1;     // Keep searching left
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}
```

```java
public static int findFirst(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    int result = -1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) {
            result = mid;     // Record this match
            hi = mid - 1;     // Keep searching left
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}
```

```python
def find_first(arr, target):
    lo, hi = 0, len(arr) - 1
    result = -1

    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid     # Record this match
            hi = mid - 1     # Keep searching left
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return result
```

```javascript
function findFirst(arr, target) {
  let lo = 0,
    hi = arr.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid; // Record this match
      hi = mid - 1; // Keep searching left
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}
```

### Last Occurrence (Rightmost)

```cpp
int findLast(const vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    int result = -1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) {
            result = mid;     // Record this match
            lo = mid + 1;     // Keep searching right
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}
```

```java
public static int findLast(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    int result = -1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) {
            result = mid;     // Record this match
            lo = mid + 1;     // Keep searching right
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}
```

```python
def find_last(arr, target):
    lo, hi = 0, len(arr) - 1
    result = -1

    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid     # Record this match
            lo = mid + 1     # Keep searching right
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return result
```

```javascript
function findLast(arr, target) {
  let lo = 0,
    hi = arr.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid; // Record this match
      lo = mid + 1; // Keep searching right
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}
```

```
Example: arr = [1, 2, 2, 2, 3, 4], target = 2
findFirst → 1 (first index of 2)
findLast  → 3 (last index of 2)
Count of 2s = findLast - findFirst + 1 = 3
```

---

## Built-in Binary Search Functions

```cpp
#include <algorithm>
#include <vector>
using namespace std;

vector<int> arr = {1, 3, 5, 7, 9, 11};

// binary_search: returns true/false (not index)
bool found = binary_search(arr.begin(), arr.end(), 7);  // true

// lower_bound: iterator to first element >= target
auto it = lower_bound(arr.begin(), arr.end(), 6);  // points to 7 (index 3)

// upper_bound: iterator to first element > target
auto it2 = upper_bound(arr.begin(), arr.end(), 7);  // points to 9 (index 4)
```

```java
import java.util.Arrays;

int[] arr = {1, 3, 5, 7, 9, 11};

// Returns index if found, otherwise -(insertion_point) - 1
int idx = Arrays.binarySearch(arr, 7);   // 3
int idx2 = Arrays.binarySearch(arr, 6);  // -4 (would be inserted at index 3)
```

```python
import bisect

arr = [1, 3, 5, 7, 9, 11]

# bisect_left: index of first element >= target
idx = bisect.bisect_left(arr, 7)   # 3

# bisect_right: index of first element > target
idx = bisect.bisect_right(arr, 7)  # 4

# insort: insert while maintaining sorted order
bisect.insort(arr, 6)  # arr = [1, 3, 5, 6, 7, 9, 11]
```

```javascript
// JavaScript doesn't have a built-in binary search for arrays.
// But you can use the findIndex with a sorted array approach,
// or implement your own (which we did above).

// For typed arrays, you can sort and search manually.
// Libraries like lodash provide _.sortedIndex() and _.sortedIndexOf()
```

---

## Complexity

| Metric | Value |
|--------|-------|
| Time (worst) | O(log n) |
| Time (best) | O(1) — target is at mid on first try |
| Space (iterative) | O(1) |
| Space (recursive) | O(log n) — call stack |

### Why O(log n)?

Each comparison eliminates half the remaining elements:
```
n → n/2 → n/4 → n/8 → ... → 1
Number of steps = log₂(n)

For n = 1,000,000: log₂(1,000,000) ≈ 20 comparisons!
For n = 1,000,000,000: only ≈ 30 comparisons!
```

---

## Key Takeaways

1. Binary search requires a **sorted array**
2. Use `lo + (hi - lo) / 2` to avoid overflow
3. Use `lo <= hi` with `lo = mid + 1` / `hi = mid - 1` for standard search
4. For first/last occurrence, continue searching after finding a match
5. Always prefer iterative over recursive (saves stack space)
6. Know your language's built-in binary search functions

---

Next: **Binary Search Variations →**
