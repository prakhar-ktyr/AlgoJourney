---
title: Quick Sort
---

# Quick Sort

Quick Sort is a divide-and-conquer algorithm that works by selecting a "pivot" element and partitioning the array around it — elements smaller than the pivot go to the left, elements greater go to the right. It then recursively sorts the two partitions.

Quick Sort is the fastest general-purpose sorting algorithm in practice, which is why it's used as the default sort in many standard libraries (C's `qsort`, C++ `std::sort` uses IntroSort which starts with Quick Sort).

---

## The Partitioning Concept

The core operation in Quick Sort is **partitioning**:

1. Choose a pivot element.
2. Rearrange the array so that:
   - All elements less than the pivot are on the left.
   - All elements greater than the pivot are on the right.
   - The pivot is in its final sorted position.
3. Return the pivot's index.

After partitioning, the pivot is in its correct sorted position. We never need to move it again.

```
Before partition (pivot = 4):
[7, 2, 1, 6, 8, 5, 3, 4]

After partition:
[2, 1, 3] [4] [6, 8, 5, 7]
 < pivot   ▲    > pivot
         pivot in final position
```

---

## Lomuto Partition Scheme

The Lomuto partition scheme is the most intuitive approach. It uses the last element as the pivot:

1. Set a pointer `i` that tracks the boundary of elements ≤ pivot.
2. Scan from left to right with pointer `j`.
3. When `arr[j] < pivot`, increment `i` and swap `arr[i]` with `arr[j]`.
4. After the scan, swap the pivot (last element) with `arr[i+1]`.

### Step-by-Step Trace

Let's partition `[7, 2, 1, 6, 8, 5, 3, 4]` with pivot = 4 (last element):

```
Array: [7, 2, 1, 6, 8, 5, 3, 4]
        ↑                     ↑
        j                   pivot
i = -1 (nothing ≤ pivot yet)

j=0: arr[0]=7, 7 ≥ 4 → skip
     [7, 2, 1, 6, 8, 5, 3, 4]   i=-1

j=1: arr[1]=2, 2 < 4 → i=0, swap arr[0]↔arr[1]
     [2, 7, 1, 6, 8, 5, 3, 4]   i=0

j=2: arr[2]=1, 1 < 4 → i=1, swap arr[1]↔arr[2]
     [2, 1, 7, 6, 8, 5, 3, 4]   i=1

j=3: arr[3]=6, 6 ≥ 4 → skip
     [2, 1, 7, 6, 8, 5, 3, 4]   i=1

j=4: arr[4]=8, 8 ≥ 4 → skip
     [2, 1, 7, 6, 8, 5, 3, 4]   i=1

j=5: arr[5]=5, 5 ≥ 4 → skip
     [2, 1, 7, 6, 8, 5, 3, 4]   i=1

j=6: arr[6]=3, 3 < 4 → i=2, swap arr[2]↔arr[6]
     [2, 1, 3, 6, 8, 5, 7, 4]   i=2

Done scanning. Swap pivot with arr[i+1] = arr[3]:
     [2, 1, 3, 4, 8, 5, 7, 6]
               ▲
         pivot in final position (index 3)

Left partition:  [2, 1, 3]  (all < 4)
Right partition: [8, 5, 7, 6]  (all > 4)
```

---

## How Quick Sort Works (Full Algorithm)

```
quickSort(arr, low, high):
  1. If low < high:
     a. Partition the array, get pivot index
     b. Recursively sort left partition (low to pivotIndex - 1)
     c. Recursively sort right partition (pivotIndex + 1 to high)
```

### Full Trace

Sorting `[5, 3, 8, 1, 2]`:

```
quickSort([5, 3, 8, 1, 2], 0, 4)
  pivot=2, partition → [1, 2, 8, 5, 3], pivotIdx=1
  
  quickSort([1], 0, 0)  → base case, done
  
  quickSort([8, 5, 3], 2, 4)
    pivot=3, partition → [3, 5, 8], pivotIdx=2
    
    quickSort([], 2, 1) → base case, done
    
    quickSort([5, 8], 3, 4)
      pivot=8, partition → [5, 8], pivotIdx=4
      
      quickSort([5], 3, 3) → base case, done
      quickSort([], 5, 4) → base case, done

Final: [1, 2, 3, 5, 8] ✓
```

---

## Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];  // Choose last element as pivot
    int i = low - 1;        // Pointer for smaller elements

    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);  // Place pivot in correct position
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivotIdx = partition(arr, low, high);
        quickSort(arr, low, pivotIdx - 1);   // Sort left partition
        quickSort(arr, pivotIdx + 1, high);  // Sort right partition
    }
}

int main() {
    vector<int> arr = {5, 3, 8, 1, 2};
    quickSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    // Output: 1 2 3 5 8
    return 0;
}
```

```java
public class QuickSort {
    public static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];  // Choose last element as pivot
        int i = low - 1;        // Pointer for smaller elements

        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        // Place pivot in correct position
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }

    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIdx = partition(arr, low, high);
            quickSort(arr, low, pivotIdx - 1);   // Sort left partition
            quickSort(arr, pivotIdx + 1, high);  // Sort right partition
        }
    }

    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 1, 2};
        quickSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
        // Output: [1, 2, 3, 5, 8]
    }
}
```

```python
def quick_sort(arr, low, high):
    if low < high:
        pivot_idx = partition(arr, low, high)
        quick_sort(arr, low, pivot_idx - 1)   # Sort left partition
        quick_sort(arr, pivot_idx + 1, high)  # Sort right partition

def partition(arr, low, high):
    pivot = arr[high]  # Choose last element as pivot
    i = low - 1        # Pointer for smaller elements

    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

arr = [5, 3, 8, 1, 2]
quick_sort(arr, 0, len(arr) - 1)
print(arr)  # [1, 2, 3, 5, 8]
```

```javascript
function quickSort(arr, low, high) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);   // Sort left partition
    quickSort(arr, pivotIdx + 1, high);  // Sort right partition
  }
}

function partition(arr, low, high) {
  const pivot = arr[high]; // Choose last element as pivot
  let i = low - 1;        // Pointer for smaller elements

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // Place pivot in correct position
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

const arr = [5, 3, 8, 1, 2];
quickSort(arr, 0, arr.length - 1);
console.log(arr); // [1, 2, 3, 5, 8]
```

---

## Pivot Selection Strategies

The choice of pivot significantly affects Quick Sort's performance:

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Last element** | Always pick `arr[high]` | Simple to implement | O(n²) on sorted arrays |
| **First element** | Always pick `arr[low]` | Simple | O(n²) on sorted arrays |
| **Random** | Pick random index | Avoids worst case in practice | Slightly more overhead |
| **Median-of-three** | Median of first, middle, last | Good pivot selection, cache-friendly | More comparisons |

### Random Pivot (Recommended)

```python
import random

def partition_random(arr, low, high):
    # Pick random pivot and swap to end
    rand_idx = random.randint(low, high)
    arr[rand_idx], arr[high] = arr[high], arr[rand_idx]
    return partition(arr, low, high)  # Use standard partition
```

### Median-of-Three

```python
def median_of_three(arr, low, high):
    mid = (low + high) // 2
    # Sort arr[low], arr[mid], arr[high] and use middle as pivot
    if arr[low] > arr[mid]:
        arr[low], arr[mid] = arr[mid], arr[low]
    if arr[low] > arr[high]:
        arr[low], arr[high] = arr[high], arr[low]
    if arr[mid] > arr[high]:
        arr[mid], arr[high] = arr[high], arr[mid]
    # Place pivot (median) at high-1 position
    arr[mid], arr[high] = arr[high], arr[mid]
    return partition(arr, low, high)
```

---

## Complexity Analysis

| Case | Time Complexity | When |
|------|----------------|------|
| Best | O(n log n) | Pivot always splits array in half |
| Average | O(n log n) | Random order, good pivot selection |
| Worst | O(n²) | Pivot is always the smallest or largest element |

**Space Complexity:** O(log n) average (recursion stack), O(n) worst case.

**Why O(n log n) average?** With a reasonably good pivot, the array is split into two roughly equal parts. We have log(n) levels of recursion, and each level does O(n) work for partitioning.

**Why O(n²) worst case?** If the pivot is always the extreme value (e.g., sorted array with last-element pivot), one partition has n-1 elements and the other has 0. This gives n levels of recursion: `n + (n-1) + (n-2) + ... + 1 = O(n²)`.

```
Worst case (sorted array, last pivot):
[1, 2, 3, 4, 5]  pivot=5 → partition: [1,2,3,4] and []
[1, 2, 3, 4]     pivot=4 → partition: [1,2,3] and []
[1, 2, 3]        pivot=3 → partition: [1,2] and []
[1, 2]           pivot=2 → partition: [1] and []

n levels × O(n) work each = O(n²)
```

---

## Quick Sort vs Merge Sort

| Property | Quick Sort | Merge Sort |
|----------|-----------|------------|
| Average time | O(n log n) | O(n log n) |
| Worst time | O(n²) | O(n log n) |
| Space | O(log n) | O(n) |
| In-place | Yes (mostly) | No |
| Stable | No | Yes |
| Cache performance | Excellent | Good |
| Practical speed | Faster (arrays) | Faster (linked lists) |

**Why Quick Sort is faster in practice:**
- Better cache locality (sequential memory access during partitioning)
- In-place (no memory allocation overhead)
- Smaller constant factors
- Tail-call optimization possible

**When to prefer Merge Sort:**
- Need guaranteed O(n log n) worst case
- Need stability
- Sorting linked lists
- External sorting (disk-based)

---

## Properties of Quick Sort

- **Stable:** No — partitioning swaps elements across long distances.
- **In-place:** Yes — O(log n) stack space for recursion, no auxiliary arrays.
- **Adaptive:** Partially — random pivot avoids worst cases but doesn't exploit presorted data.
- **Cache-friendly:** Yes — sequential access pattern during partitioning.

---

## Avoiding the Worst Case

1. **Randomized pivot** — Swap a random element to the pivot position before partitioning.
2. **Median-of-three** — Use the median of first, middle, and last elements.
3. **IntroSort** — Switch to Heap Sort if recursion depth exceeds 2·log(n) (used by C++ STL).
4. **Three-way partitioning** — Handle duplicate elements efficiently (Dutch National Flag).

---

## Key Takeaways

- Quick Sort selects a pivot and partitions the array into elements less than and greater than the pivot.
- Average O(n log n) with O(log n) space — faster in practice than Merge Sort for arrays.
- Worst case O(n²) occurs with poor pivot selection (sorted arrays with first/last pivot).
- Use randomized or median-of-three pivot to avoid worst case.
- Not stable, but in-place and cache-friendly.
- The go-to sorting algorithm for general-purpose use in most standard libraries.

---

Next: **Counting Sort & Radix Sort →**
