---
title: Bubble Sort
---

# Bubble Sort

Bubble Sort is the simplest sorting algorithm. It works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the wrong order. The largest unsorted element "bubbles up" to its correct position after each pass.

---

## How Bubble Sort Works

1. Start at the beginning of the array.
2. Compare adjacent elements (index `i` and `i+1`).
3. If the left element is greater than the right, swap them.
4. Move to the next pair and repeat.
5. After one complete pass, the largest element is at the end.
6. Repeat for the remaining unsorted portion.
7. Stop when no swaps are needed (array is sorted).

---

## Step-by-Step Visualization

Let's sort `[5, 3, 8, 1, 2]`:

```
Array: [5, 3, 8, 1, 2]

═══ Pass 1 ═══
Compare 5 and 3 → swap    [3, 5, 8, 1, 2]
Compare 5 and 8 → no swap [3, 5, 8, 1, 2]
Compare 8 and 1 → swap    [3, 5, 1, 8, 2]
Compare 8 and 2 → swap    [3, 5, 1, 2, 8]  ← 8 bubbled to end
                                               ▲

═══ Pass 2 ═══
Compare 3 and 5 → no swap [3, 5, 1, 2, 8]
Compare 5 and 1 → swap    [3, 1, 5, 2, 8]
Compare 5 and 2 → swap    [3, 1, 2, 5, 8]  ← 5 in place
                                         ▲

═══ Pass 3 ═══
Compare 3 and 1 → swap    [1, 3, 2, 5, 8]
Compare 3 and 2 → swap    [1, 2, 3, 5, 8]  ← 3 in place
                                      ▲

═══ Pass 4 ═══
Compare 1 and 2 → no swap [1, 2, 3, 5, 8]
No swaps occurred → DONE!

Result: [1, 2, 3, 5, 8] ✓
```

Notice how after each pass, one more element from the right is guaranteed to be in its final position.

---

## Implementation

### Basic Bubble Sort

```cpp
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    vector<int> arr = {5, 3, 8, 1, 2};
    bubbleSort(arr);
    for (int x : arr) cout << x << " ";
    // Output: 1 2 3 5 8
    return 0;
}
```

```java
public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 1, 2};
        bubbleSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
        // Output: [1, 2, 3, 5, 8]
    }
}
```

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

arr = [5, 3, 8, 1, 2]
bubble_sort(arr)
print(arr)  # [1, 2, 3, 5, 8]
```

```javascript
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}

const arr = [5, 3, 8, 1, 2];
bubbleSort(arr);
console.log(arr); // [1, 2, 3, 5, 8]
```

---

## Optimization: Early Exit

If during a complete pass no swaps occur, the array is already sorted. We can exit early:

```cpp
#include <iostream>
#include <vector>
using namespace std;

void bubbleSortOptimized(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // Array is sorted
    }
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};  // Already sorted
    bubbleSortOptimized(arr);  // Only 1 pass, then exits
    for (int x : arr) cout << x << " ";
    return 0;
}
```

```java
public class BubbleSortOptimized {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;  // Array is sorted
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        bubbleSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
```

```python
def bubble_sort_optimized(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break  # Array is sorted

arr = [1, 2, 3, 4, 5]
bubble_sort_optimized(arr)  # Exits after first pass
print(arr)  # [1, 2, 3, 4, 5]
```

```javascript
function bubbleSortOptimized(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Array is sorted
  }
}

const arr = [1, 2, 3, 4, 5];
bubbleSortOptimized(arr); // Exits after first pass
console.log(arr); // [1, 2, 3, 4, 5]
```

---

## Complexity Analysis

| Case | Time Complexity | When |
|------|----------------|------|
| Best | O(n) | Array is already sorted (with optimization) |
| Average | O(n²) | Elements are in random order |
| Worst | O(n²) | Array is sorted in reverse |

**Space Complexity:** O(1) — only uses a temporary variable for swapping.

**Why O(n²)?** The outer loop runs `n-1` times, and the inner loop runs `n-1-i` times. Total comparisons: `(n-1) + (n-2) + ... + 1 = n(n-1)/2 ≈ n²/2 = O(n²)`.

**Why O(n) best case?** With the early exit optimization, if the array is sorted, the inner loop makes one full pass with zero swaps, and we break immediately. One pass = n-1 comparisons = O(n).

---

## Properties of Bubble Sort

- **Stable:** Yes — equal elements are never swapped (we only swap when `arr[j] > arr[j+1]`, not `>=`).
- **In-place:** Yes — O(1) extra space.
- **Adaptive:** Yes (with optimization) — runs faster on nearly sorted data.
- **Online:** No — cannot sort a stream as elements arrive.

---

## When Is Bubble Sort Useful?

1. **Educational purposes** — It's the easiest sorting algorithm to understand and implement.
2. **Nearly sorted data** — With the early exit optimization, it's O(n) for data that's almost sorted.
3. **Tiny arrays** — For very small arrays (n < 10), the simplicity of bubble sort can make it competitive.
4. **Detecting if array is sorted** — One pass of bubble sort tells you if the array is sorted.

> **In practice**, Bubble Sort is rarely used in production. Insertion Sort is equally simple but faster for nearly sorted data. For general use, Quick Sort or Merge Sort are preferred.

---

## Common Mistakes

1. **Forgetting `n - 1 - i` in the inner loop** — Without subtracting `i`, you re-check elements already in their final position.
2. **Using `>=` instead of `>`** — This breaks stability (equal elements get swapped unnecessarily).
3. **Not implementing early exit** — Without it, bubble sort always takes O(n²), even on sorted arrays.

---

## Key Takeaways

- Bubble Sort repeatedly swaps adjacent elements, "bubbling" the largest to the end.
- Optimized version exits early if no swaps occur, giving O(n) best case.
- It's stable, in-place, and simple but generally too slow (O(n²)) for large datasets.
- Best used for teaching, detecting sorted arrays, or very small/nearly sorted inputs.

---

Next: **Selection Sort →**
