---
title: Selection Sort
---

# Selection Sort

Selection Sort works by repeatedly finding the minimum element from the unsorted portion and placing it at the beginning. It divides the array into two parts: a sorted portion (left) and an unsorted portion (right).

---

## How Selection Sort Works

1. Find the minimum element in the unsorted portion of the array.
2. Swap it with the first element of the unsorted portion.
3. Move the boundary between sorted and unsorted one position to the right.
4. Repeat until the entire array is sorted.

The key idea: in each iteration, we **select** the smallest remaining element and place it in its correct position.

---

## Step-by-Step Visualization

Let's sort `[29, 10, 14, 37, 13]`:

```
Array: [29, 10, 14, 37, 13]
        ↑ unsorted starts here

═══ Pass 1: Find minimum in [29, 10, 14, 37, 13] ═══
  Minimum = 10 (at index 1)
  Swap arr[0] and arr[1]
  [10, 29, 14, 37, 13]
   ▲ sorted

═══ Pass 2: Find minimum in [29, 14, 37, 13] ═══
  Minimum = 13 (at index 4)
  Swap arr[1] and arr[4]
  [10, 13, 14, 37, 29]
   ▲───▲ sorted

═══ Pass 3: Find minimum in [14, 37, 29] ═══
  Minimum = 14 (at index 2)
  Already in correct position, no swap needed
  [10, 13, 14, 37, 29]
   ▲───▲───▲ sorted

═══ Pass 4: Find minimum in [37, 29] ═══
  Minimum = 29 (at index 4)
  Swap arr[3] and arr[4]
  [10, 13, 14, 29, 37]
   ▲───▲───▲───▲───▲ sorted

Result: [10, 13, 14, 29, 37] ✓
```

After `n-1` passes, all elements are in their correct positions.

---

## Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        // Find the index of the minimum element in unsorted portion
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // Swap the minimum element with the first unsorted element
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
        }
    }
}

int main() {
    vector<int> arr = {29, 10, 14, 37, 13};
    selectionSort(arr);
    for (int x : arr) cout << x << " ";
    // Output: 10 13 14 29 37
    return 0;
}
```

```java
public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            // Find the index of the minimum element in unsorted portion
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            // Swap the minimum element with the first unsorted element
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {29, 10, 14, 37, 13};
        selectionSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
        // Output: [10, 13, 14, 29, 37]
    }
}
```

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        # Find the index of the minimum element in unsorted portion
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap the minimum element with the first unsorted element
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]

arr = [29, 10, 14, 37, 13]
selection_sort(arr)
print(arr)  # [10, 13, 14, 29, 37]
```

```javascript
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // Find the index of the minimum element in unsorted portion
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    // Swap the minimum element with the first unsorted element
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
}

const arr = [29, 10, 14, 37, 13];
selectionSort(arr);
console.log(arr); // [10, 13, 14, 29, 37]
```

---

## Complexity Analysis

| Case | Time Complexity | Comparisons | Swaps |
|------|----------------|-------------|-------|
| Best | O(n²) | n(n-1)/2 | 0 |
| Average | O(n²) | n(n-1)/2 | O(n) |
| Worst | O(n²) | n(n-1)/2 | O(n) |

**Space Complexity:** O(1) — in-place sorting.

**Why always O(n²)?** Regardless of the initial order, we must scan the entire unsorted portion to find the minimum. There's no early exit — the number of comparisons is always `(n-1) + (n-2) + ... + 1 = n(n-1)/2`.

**Key insight about swaps:** Selection Sort performs at most `n-1` swaps. This is the **minimum number of swaps** among simple sorting algorithms. Each element is moved at most once to its final position.

---

## Why Selection Sort Does Minimum Swaps

Consider sorting `[5, 4, 3, 2, 1]`:

```
Bubble Sort swaps: 10 swaps needed (every adjacent pair)
Selection Sort swaps: Only 2 swaps needed!
  Swap 5↔1: [1, 4, 3, 2, 5]
  Swap 4↔2: [1, 2, 3, 4, 5] ✓
```

When swapping is expensive (e.g., large objects or writing to slow memory), Selection Sort's minimal swap count is an advantage.

---

## Comparison: Bubble Sort vs Selection Sort

| Property | Bubble Sort | Selection Sort |
|----------|-------------|----------------|
| Best-case time | O(n) | O(n²) |
| Worst-case time | O(n²) | O(n²) |
| Number of swaps | O(n²) worst | O(n) maximum |
| Stable? | Yes | No |
| Adaptive? | Yes (with optimization) | No |
| When to prefer | Nearly sorted data | When swaps are costly |

---

## Why Selection Sort Is Unstable

Consider sorting `[5a, 5b, 3]` (where 5a and 5b are both value 5):

```
Pass 1: Find min = 3, swap with arr[0]
  [5a, 5b, 3] → [3, 5b, 5a]
                       ↑   ↑
                  5b is now before 5a — relative order changed!
```

The long-distance swap can jump over equal elements, breaking stability.

---

## Properties of Selection Sort

- **Stable:** No — swaps can change relative order of equal elements.
- **In-place:** Yes — O(1) extra space.
- **Adaptive:** No — always O(n²) regardless of initial order.
- **Minimum swaps:** At most n-1 swaps, making it ideal when writes are expensive.

---

## When Is Selection Sort Useful?

1. **When memory writes are expensive** — Flash memory, EEPROM, or similar media where writes are costly. Selection sort minimizes the number of writes.
2. **Small datasets** — For tiny arrays, its simplicity makes it competitive.
3. **When auxiliary memory is restricted** — Guaranteed O(1) extra space.
4. **Educational purposes** — Simple to understand and implement.

> **In practice**, Insertion Sort is usually preferred over Selection Sort for small arrays because it's adaptive and stable. For larger arrays, use Quick Sort or Merge Sort.

---

## Key Takeaways

- Selection Sort finds the minimum in the unsorted portion and swaps it to the front.
- It always performs O(n²) comparisons, regardless of input order.
- It performs at most n-1 swaps — the minimum among simple sorting algorithms.
- It's not stable (long-distance swaps disrupt relative order).
- Best used when swap cost is high or for educational purposes.

---

Next: **Insertion Sort →**
