---
title: Introduction to Sorting
---

# Introduction to Sorting

Sorting is one of the most fundamental operations in computer science. It involves arranging elements of a collection (array, list) in a specific order — typically ascending or descending. Nearly every real-world application relies on sorting: databases order query results, search engines rank pages, and operating systems schedule processes.

## Why Sorting Matters

1. **Enables efficient searching** — Binary search requires sorted data and runs in O(log n) instead of O(n).
2. **Simplifies problems** — Many algorithmic problems become easier once data is sorted (finding duplicates, closest pairs, etc.).
3. **Data presentation** — Users expect ordered results (alphabetical lists, price-sorted products).
4. **Prerequisite for other algorithms** — Merge operations, interval scheduling, and greedy algorithms often assume sorted input.

---

## Classification of Sorting Algorithms

### Stable vs Unstable Sorts

A **stable** sort preserves the relative order of elements with equal keys.

```
Original:  [(Alice, 90), (Bob, 85), (Carol, 90)]
Stable:    [(Alice, 90), (Carol, 90), (Bob, 85)]   ← Alice still before Carol
Unstable:  [(Carol, 90), (Alice, 90), (Bob, 85)]   ← relative order may change
```

**Stable sorts:** Merge Sort, Insertion Sort, Bubble Sort, Counting Sort
**Unstable sorts:** Quick Sort, Selection Sort, Heap Sort

### In-Place vs Out-of-Place

- **In-place**: Uses O(1) extra memory (sorts within the original array). Examples: Bubble Sort, Selection Sort, Quick Sort.
- **Out-of-place**: Requires additional memory proportional to input size. Examples: Merge Sort (O(n) extra space), Counting Sort.

### Comparison-Based vs Non-Comparison Sorts

- **Comparison-based**: Determines order by comparing pairs of elements. Lower bound is O(n log n). Examples: Merge Sort, Quick Sort, Heap Sort.
- **Non-comparison**: Exploits properties of the data (integer ranges, digit structure) to sort without direct comparisons. Can achieve O(n) time. Examples: Counting Sort, Radix Sort, Bucket Sort.

---

## Sorting Algorithm Complexity Overview

| Algorithm      | Best Case   | Average Case | Worst Case  | Space   | Stable? |
|---------------|-------------|-------------|-------------|---------|---------|
| Bubble Sort    | O(n)        | O(n²)       | O(n²)       | O(1)    | Yes     |
| Selection Sort | O(n²)       | O(n²)       | O(n²)       | O(1)    | No      |
| Insertion Sort | O(n)        | O(n²)       | O(n²)       | O(1)    | Yes     |
| Merge Sort     | O(n log n)  | O(n log n)  | O(n log n)  | O(n)    | Yes     |
| Quick Sort     | O(n log n)  | O(n log n)  | O(n²)       | O(log n)| No      |
| Heap Sort      | O(n log n)  | O(n log n)  | O(n log n)  | O(1)    | No      |
| Counting Sort  | O(n + k)    | O(n + k)    | O(n + k)    | O(k)    | Yes     |
| Radix Sort     | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k)  | Yes     |

Where `n` = number of elements, `k` = range of input, `d` = number of digits.

---

## When to Use Which Sort

| Scenario | Recommended Sort | Why |
|----------|-----------------|-----|
| Small array (n < 20) | Insertion Sort | Low overhead, fast for small n |
| Nearly sorted data | Insertion Sort | O(n) best case |
| Guaranteed O(n log n) needed | Merge Sort | Always O(n log n), stable |
| General purpose, in-place | Quick Sort | Fastest in practice on average |
| Memory is constrained | Heap Sort or Quick Sort | O(1) or O(log n) extra space |
| Integers in known range | Counting Sort | O(n + k), beats comparison sorts |
| Sorting strings/large keys by digits | Radix Sort | O(d·n) for fixed-length keys |
| Stability required | Merge Sort or Insertion Sort | Preserve relative order |

---

## A Simple Example: Seeing Sorting in Action

Let's see how different sorts handle the same array `[5, 2, 8, 1, 9]`:

```
Original: [5, 2, 8, 1, 9]

After Bubble Sort passes:
  Pass 1: [2, 5, 1, 8, 9]
  Pass 2: [2, 1, 5, 8, 9]
  Pass 3: [1, 2, 5, 8, 9] ✓

After Selection Sort passes:
  Pass 1: [1, 2, 8, 5, 9]  (found min=1, swapped with index 0)
  Pass 2: [1, 2, 8, 5, 9]  (found min=2, already in place)
  Pass 3: [1, 2, 5, 8, 9]  (found min=5, swapped with index 2) ✓

After Insertion Sort passes:
  Pass 1: [2, 5, 8, 1, 9]  (inserted 2 before 5)
  Pass 2: [2, 5, 8, 1, 9]  (8 already in place)
  Pass 3: [1, 2, 5, 8, 9]  (inserted 1 at beginning) ✓
```

---

## Built-in Sorting in Programming Languages

Most languages provide optimized sorting functions that use hybrid algorithms:

```cpp
#include <algorithm>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> arr = {5, 2, 8, 1, 9};
    // std::sort uses IntroSort (Quick Sort + Heap Sort + Insertion Sort)
    std::sort(arr.begin(), arr.end());
    for (int x : arr) std::cout << x << " ";
    // Output: 1 2 5 8 9
    return 0;
}
```

```java
import java.util.Arrays;

public class SortExample {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        // Arrays.sort uses Dual-Pivot Quick Sort for primitives
        Arrays.sort(arr);
        System.out.println(Arrays.toString(arr));
        // Output: [1, 2, 5, 8, 9]
    }
}
```

```python
# Python's sort uses TimSort (Merge Sort + Insertion Sort hybrid)
arr = [5, 2, 8, 1, 9]
arr.sort()          # in-place
print(arr)          # [1, 2, 5, 8, 9]

# Or create a new sorted list
sorted_arr = sorted([5, 2, 8, 1, 9])
print(sorted_arr)   # [1, 2, 5, 8, 9]
```

```javascript
// JavaScript's sort converts to strings by default!
const arr = [5, 2, 8, 1, 9];
// Always provide a comparator for numbers
arr.sort((a, b) => a - b);
console.log(arr); // [1, 2, 5, 8, 9]
```

> **Note:** While built-in sorts are highly optimized for production use, understanding how sorting algorithms work is essential for interviews, algorithm design, and knowing which approach fits your constraints.

---

## Key Takeaways

- Sorting arranges elements in order and is foundational to many algorithms.
- **Stable** sorts preserve relative order of equal elements; **unstable** sorts don't.
- **In-place** sorts use constant extra memory; **out-of-place** sorts need additional space.
- Comparison-based sorts have a lower bound of O(n log n); non-comparison sorts can be faster.
- Choose your sorting algorithm based on data size, memory constraints, stability needs, and whether the data is nearly sorted.

---

Next: **Bubble Sort →**
