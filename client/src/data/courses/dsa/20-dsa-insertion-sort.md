---
title: Insertion Sort
---

# Insertion Sort

Insertion Sort builds the sorted array one element at a time by picking each element and inserting it into its correct position among the previously sorted elements. Think of it like sorting a hand of playing cards — you pick up one card at a time and slide it into the right spot.

---

## The Playing Cards Analogy

Imagine you're picking up cards from a table one by one:

```
Table: [5] [3] [8] [1] [4]

Pick up 5:   Hand: [5]
Pick up 3:   Hand: [3, 5]         ← 3 goes before 5
Pick up 8:   Hand: [3, 5, 8]     ← 8 goes at the end
Pick up 1:   Hand: [1, 3, 5, 8]  ← 1 goes at the beginning
Pick up 4:   Hand: [1, 3, 4, 5, 8] ← 4 goes between 3 and 5
```

Each time you pick up a card, you compare it with cards already in your hand (from right to left) and slide it into the correct position.

---

## How Insertion Sort Works

1. Start with the second element (first element is trivially sorted).
2. Store the current element as `key`.
3. Compare `key` with elements to its left.
4. Shift elements that are greater than `key` one position to the right.
5. Insert `key` into the gap.
6. Repeat for all remaining elements.

---

## Step-by-Step Visualization

Let's sort `[7, 3, 5, 1, 9, 2]`:

```
Array: [7, 3, 5, 1, 9, 2]
        ▲ sorted portion (1 element)

═══ Pass 1: key = 3 ═══
  Compare 3 with 7: 3 < 7, shift 7 right
  [_, 7, 5, 1, 9, 2]
  Insert 3 at position 0
  [3, 7, 5, 1, 9, 2]
   ▲──▲ sorted

═══ Pass 2: key = 5 ═══
  Compare 5 with 7: 5 < 7, shift 7 right
  Compare 5 with 3: 5 > 3, stop
  [3, _, 7, 1, 9, 2]
  Insert 5 at position 1
  [3, 5, 7, 1, 9, 2]
   ▲──▲──▲ sorted

═══ Pass 3: key = 1 ═══
  Compare 1 with 7: 1 < 7, shift 7 right
  Compare 1 with 5: 1 < 5, shift 5 right
  Compare 1 with 3: 1 < 3, shift 3 right
  [_, 3, 5, 7, 9, 2]
  Insert 1 at position 0
  [1, 3, 5, 7, 9, 2]
   ▲──▲──▲──▲ sorted

═══ Pass 4: key = 9 ═══
  Compare 9 with 7: 9 > 7, stop (already in place)
  [1, 3, 5, 7, 9, 2]
   ▲──▲──▲──▲──▲ sorted

═══ Pass 5: key = 2 ═══
  Compare 2 with 9: 2 < 9, shift 9 right
  Compare 2 with 7: 2 < 7, shift 7 right
  Compare 2 with 5: 2 < 5, shift 5 right
  Compare 2 with 3: 2 < 3, shift 3 right
  Compare 2 with 1: 2 > 1, stop
  [1, _, 3, 5, 7, 9]
  Insert 2 at position 1
  [1, 2, 3, 5, 7, 9]
   ▲──▲──▲──▲──▲──▲ sorted ✓

Result: [1, 2, 3, 5, 7, 9] ✓
```

---

## Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        // Shift elements greater than key to the right
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        // Insert key at correct position
        arr[j + 1] = key;
    }
}

int main() {
    vector<int> arr = {7, 3, 5, 1, 9, 2};
    insertionSort(arr);
    for (int x : arr) cout << x << " ";
    // Output: 1 2 3 5 7 9
    return 0;
}
```

```java
public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            // Shift elements greater than key to the right
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            // Insert key at correct position
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {7, 3, 5, 1, 9, 2};
        insertionSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
        // Output: [1, 2, 3, 5, 7, 9]
    }
}
```

```python
def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        # Shift elements greater than key to the right
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        # Insert key at correct position
        arr[j + 1] = key

arr = [7, 3, 5, 1, 9, 2]
insertion_sort(arr)
print(arr)  # [1, 2, 3, 5, 7, 9]
```

```javascript
function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    // Shift elements greater than key to the right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    // Insert key at correct position
    arr[j + 1] = key;
  }
}

const arr = [7, 3, 5, 1, 9, 2];
insertionSort(arr);
console.log(arr); // [1, 2, 3, 5, 7, 9]
```

---

## Complexity Analysis

| Case | Time Complexity | When |
|------|----------------|------|
| Best | O(n) | Array is already sorted |
| Average | O(n²) | Elements are in random order |
| Worst | O(n²) | Array is sorted in reverse |

**Space Complexity:** O(1) — in-place sorting.

**Why O(n) best case?** When the array is sorted, the inner `while` loop never executes (each `key` is already greater than all elements to its left). We simply iterate through the array once: n-1 comparisons, 0 shifts.

**Why O(n²) worst case?** When sorted in reverse, every element must be shifted past all previously sorted elements. Total shifts: `1 + 2 + 3 + ... + (n-1) = n(n-1)/2 = O(n²)`.

---

## Why Insertion Sort Excels for Nearly Sorted Data

If the array is "almost sorted" (each element is at most `k` positions away from its sorted position), then:
- The inner loop runs at most `k` times per element
- Total time: O(n × k)
- When k is small (constant), this is O(n)!

```
Nearly sorted: [1, 3, 2, 5, 4, 7, 6, 8]
Each element is at most 1 position away from its correct spot.

Pass 1: key=3, already in place         → 1 comparison
Pass 2: key=2, shift 3, insert 2        → 1 shift
Pass 3: key=5, already in place         → 1 comparison
Pass 4: key=4, shift 5, insert 4        → 1 shift
...

Total work: O(n) — one comparison/shift per element
```

---

## Insertion Sort in Hybrid Algorithms

Many production sorting algorithms use Insertion Sort as a subroutine:

- **TimSort** (Python, Java): Switches to Insertion Sort for small runs (< 64 elements).
- **IntroSort** (C++ STL): Uses Insertion Sort when the partition size drops below 16.
- **Quick Sort optimizations**: Stop recursing below a threshold and finish with Insertion Sort.

Why? For small arrays, Insertion Sort's low overhead (no recursion, no function calls, cache-friendly sequential access) beats the theoretically faster O(n log n) algorithms.

---

## Properties of Insertion Sort

- **Stable:** Yes — equal elements maintain their relative order (we only shift when `arr[j] > key`, not `>=`).
- **In-place:** Yes — O(1) extra space.
- **Adaptive:** Yes — runs in O(n) for nearly sorted input.
- **Online:** Yes — can sort elements as they arrive (no need to see the entire input).

---

## Comparison with Bubble Sort and Selection Sort

| Property | Bubble Sort | Selection Sort | Insertion Sort |
|----------|-------------|----------------|----------------|
| Best case | O(n) | O(n²) | O(n) |
| Worst case | O(n²) | O(n²) | O(n²) |
| Swaps (worst) | O(n²) | O(n) | O(n²) shifts |
| Stable | Yes | No | Yes |
| Adaptive | Yes | No | Yes |
| Online | No | No | Yes |
| Practical use | Rarely | When swaps are costly | Small/nearly sorted arrays |

---

## When Is Insertion Sort Useful?

1. **Small arrays (n < 20)** — Lower overhead than Quick Sort or Merge Sort.
2. **Nearly sorted data** — O(n) performance when few elements are out of place.
3. **Online sorting** — Data arrives one element at a time.
4. **As a base case** — Used inside hybrid algorithms (TimSort, IntroSort) for small subarrays.
5. **Maintaining a sorted list** — Inserting into an already-sorted array.

---

## Key Takeaways

- Insertion Sort builds the sorted portion one element at a time by inserting each element into its correct position.
- Best case O(n) for sorted/nearly sorted data; worst case O(n²) for reverse-sorted data.
- Stable, in-place, adaptive, and online — the most versatile simple sort.
- Widely used as a subroutine in hybrid sorting algorithms for small partitions.
- Prefer it over Bubble Sort and Selection Sort for practical use on small datasets.

---

Next: **Merge Sort →**
