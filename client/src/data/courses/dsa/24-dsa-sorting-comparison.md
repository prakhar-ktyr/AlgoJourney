---
title: "Sorting Comparison"
---

# Sorting Comparison

Now that we've covered all major sorting algorithms, let's put them side by side. Choosing the right sort for the job is a crucial skill.

---

## The Big Comparison Table

| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? | In-Place? |
|-----------|-----------|-------------|------------|-------|---------|-----------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No | Yes |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No | Yes |
| Counting Sort | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | No |
| Radix Sort | O(d(n+k)) | O(d(n+k)) | O(d(n+k)) | O(n + k) | Yes | No |

Where:
- **n** = number of elements
- **k** = range of values (counting/radix sort)
- **d** = number of digits (radix sort)

---

## Understanding Stability

A sorting algorithm is **stable** if elements with equal keys maintain their original relative order.

```
Original:  [(A,3), (B,1), (C,3), (D,2)]
                    Sort by number

Stable:    [(B,1), (D,2), (A,3), (C,3)]   ← A before C (original order preserved)
Unstable:  [(B,1), (D,2), (C,3), (A,3)]   ← C before A (order changed)
```

**Why stability matters:**
- Sorting by multiple keys (sort by name, then by age — stable sort preserves name order for same age)
- Required for radix sort's correctness
- Preserves meaningful input ordering

---

## When to Use Each Algorithm

### Bubble Sort
- **Use when:** Teaching/learning, nearly sorted data (with early-exit optimization)
- **Avoid when:** Any real performance-sensitive code

### Selection Sort
- **Use when:** Memory is extremely limited, number of swaps must be minimized
- **Avoid when:** You need stability or good average performance

### Insertion Sort
- **Use when:** Small arrays (n < 20–50), nearly sorted data, online sorting (data arrives one at a time)
- **Fun fact:** Many optimized libraries use insertion sort for small subarrays within merge/quick sort

### Merge Sort
- **Use when:** Stability is required, worst-case O(n log n) is needed, sorting linked lists
- **Avoid when:** Memory is constrained (needs O(n) extra space for arrays)

### Quick Sort
- **Use when:** General-purpose sorting, good average case needed, memory is limited
- **Avoid when:** Worst case must be avoided (use randomized pivot or introsort)

### Counting Sort
- **Use when:** Integers in a small, known range (k ≤ n or close)
- **Avoid when:** Large range of values, floating-point numbers

### Radix Sort
- **Use when:** Fixed-length integers or strings, many elements with bounded digits
- **Avoid when:** Elements have vastly different lengths, comparison is cheap

---

## Decision Flowchart

```
Start
  │
  ├── Are values integers in small range?
  │     ├── Yes → Counting Sort
  │     └── No ↓
  │
  ├── Are values integers with fixed # of digits?
  │     ├── Yes → Radix Sort
  │     └── No ↓
  │
  ├── Is array small (n < 50)?
  │     ├── Yes → Insertion Sort
  │     └── No ↓
  │
  ├── Is stability required?
  │     ├── Yes → Merge Sort
  │     └── No ↓
  │
  ├── Is worst-case guarantee needed?
  │     ├── Yes → Merge Sort
  │     └── No → Quick Sort (randomized pivot)
  │
  └── Is data nearly sorted?
        ├── Yes → Insertion Sort or TimSort
        └── No → Quick Sort
```

---

## The Comparison-Based Lower Bound

**Theorem:** Any comparison-based sorting algorithm requires at least **Ω(n log n)** comparisons in the worst case.

**Proof sketch:** With `n!` possible permutations, a decision tree (binary tree of comparisons) needs at least `log₂(n!)` leaves. By Stirling's approximation, `log₂(n!) ≈ n log₂ n`.

This means merge sort and (average) quick sort are **optimal** among comparison-based sorts. Counting and radix sort bypass this by not comparing elements.

---

## Built-in Sorting Functions

Every language provides an optimized, well-tested sort. **Always prefer built-in sorts** for production code.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {5, 2, 8, 1, 9, 3};

    // Sort ascending (default)
    sort(arr.begin(), arr.end());
    // arr = [1, 2, 3, 5, 8, 9]

    // Sort descending
    sort(arr.begin(), arr.end(), greater<int>());
    // arr = [9, 8, 5, 3, 2, 1]

    // Stable sort (preserves order of equal elements)
    stable_sort(arr.begin(), arr.end());

    // Custom comparator
    vector<string> words = {"banana", "apple", "cherry"};
    sort(words.begin(), words.end(), [](const string& a, const string& b) {
        return a.size() < b.size();  // Sort by length
    });

    for (const auto& w : words) cout << w << " ";
    // Output: apple banana cherry
    return 0;
}
// C++ std::sort uses IntroSort (quicksort + heapsort + insertion sort)
// std::stable_sort uses TimSort (merge sort variant)
```

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

public class BuiltInSort {
    public static void main(String[] args) {
        // Primitive array sort (Dual-Pivot Quicksort)
        int[] arr = {5, 2, 8, 1, 9, 3};
        Arrays.sort(arr);
        System.out.println(Arrays.toString(arr));
        // Output: [1, 2, 3, 5, 8, 9]

        // Object array sort (TimSort - stable!)
        Integer[] arr2 = {5, 2, 8, 1, 9, 3};
        Arrays.sort(arr2, Collections.reverseOrder());
        System.out.println(Arrays.toString(arr2));
        // Output: [9, 8, 5, 3, 2, 1]

        // Custom comparator
        String[] words = {"banana", "apple", "cherry"};
        Arrays.sort(words, Comparator.comparingInt(String::length));
        System.out.println(Arrays.toString(words));
        // Output: [apple, banana, cherry]
    }
}
// Java: Arrays.sort uses Dual-Pivot Quicksort for primitives
//       TimSort for objects (stable)
```

```python
# Python uses TimSort (hybrid merge sort + insertion sort) - STABLE

arr = [5, 2, 8, 1, 9, 3]

# sorted() returns a new list
sorted_arr = sorted(arr)
print(sorted_arr)  # [1, 2, 3, 5, 8, 9]

# .sort() sorts in-place
arr.sort()
print(arr)  # [1, 2, 3, 5, 8, 9]

# Sort descending
arr.sort(reverse=True)
print(arr)  # [9, 8, 5, 3, 2, 1]

# Custom key function
words = ["banana", "apple", "cherry"]
words.sort(key=len)
print(words)  # ['apple', 'banana', 'cherry']

# Sort by multiple criteria
students = [("Alice", 85), ("Bob", 92), ("Charlie", 85)]
students.sort(key=lambda s: (-s[1], s[0]))
print(students)
# [('Bob', 92), ('Alice', 85), ('Charlie', 85)]
# Sorted by grade desc, then name asc
```

```javascript
const arr = [5, 2, 8, 1, 9, 3];

// .sort() modifies in-place and returns the array
// WARNING: Default sort converts to strings!
console.log([10, 9, 2, 1].sort());
// Output: [1, 10, 2, 9]  ← WRONG! String comparison!

// Always provide a comparator for numbers
arr.sort((a, b) => a - b);
console.log(arr); // [1, 2, 3, 5, 8, 9]

// Sort descending
arr.sort((a, b) => b - a);
console.log(arr); // [9, 8, 5, 3, 2, 1]

// Sort strings by length
const words = ["banana", "apple", "cherry"];
words.sort((a, b) => a.length - b.length);
console.log(words); // ['apple', 'banana', 'cherry']

// toSorted() returns a new array (ES2023+)
const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b);
console.log(original); // [3, 1, 2] (unchanged)
console.log(sorted);   // [1, 2, 3]

// JavaScript engines typically use TimSort (V8) or merge sort
// Array.prototype.sort is GUARANTEED stable as of ES2019
```

---

## What Built-in Sorts Actually Use

| Language | Function | Algorithm | Stable? |
|----------|----------|-----------|---------|
| C++ | `std::sort` | IntroSort (Quick + Heap + Insertion) | No |
| C++ | `std::stable_sort` | TimSort / Merge Sort | Yes |
| Java | `Arrays.sort` (primitives) | Dual-Pivot Quicksort | No |
| Java | `Arrays.sort` (objects) | TimSort | Yes |
| Python | `sorted()` / `.sort()` | TimSort | Yes |
| JavaScript | `.sort()` | TimSort (V8) | Yes (ES2019+) |

**TimSort** is a hybrid algorithm that:
1. Divides the array into "runs" (naturally sorted subsequences)
2. Uses insertion sort for small runs
3. Merges runs using merge sort
4. Highly optimized for real-world data with existing order

---

## Practical Tips

1. **Default to built-in sort** — it's battle-tested and highly optimized
2. **Know your data** — nearly sorted? small? integers? Choose accordingly
3. **Stability matters** when sorting by multiple keys in sequence
4. **Space matters** on embedded systems — prefer in-place sorts
5. **Worst-case matters** in real-time systems — avoid plain quicksort

---

## Summary

```
Performance Tiers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O(n²)       : Bubble, Selection, Insertion (small n only)
O(n log n)  : Merge Sort, Quick Sort (general purpose)
O(n + k)    : Counting Sort, Radix Sort (special cases)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For everyday coding:
→ Use your language's built-in sort
→ Understand the algorithms for interviews and edge cases
```

---

Next: **Linear Search →**
