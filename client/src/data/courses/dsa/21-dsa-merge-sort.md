---
title: Merge Sort
---

# Merge Sort

Merge Sort is a divide-and-conquer algorithm that guarantees O(n log n) time complexity in all cases. It works by recursively splitting the array in half, sorting each half, and then merging the two sorted halves back together.

---

## The Divide and Conquer Approach

Merge Sort follows three steps:

1. **Divide:** Split the array into two halves.
2. **Conquer:** Recursively sort each half.
3. **Combine:** Merge the two sorted halves into one sorted array.

The key insight: merging two already-sorted arrays into one sorted array is an O(n) operation. By recursively dividing until we have single elements (which are trivially sorted), we can build up the full sorted array through merging.

---

## Step-by-Step Trace

Let's sort `[38, 27, 43, 3, 9, 82, 10]`:

```
                    [38, 27, 43, 3, 9, 82, 10]
                   /                           \
          [38, 27, 43, 3]              [9, 82, 10]
          /             \              /          \
      [38, 27]      [43, 3]       [9, 82]      [10]
      /      \      /     \       /     \        |
    [38]   [27]  [43]   [3]    [9]   [82]     [10]
      \      /      \     /       \     /        |
      [27, 38]      [3, 43]      [9, 82]      [10]
          \             /              \          /
       [3, 27, 38, 43]              [9, 10, 82]
                   \                           /
              [3, 9, 10, 27, 38, 43, 82]  ✓
```

**Splitting phase:** Keep dividing until each sub-array has 1 element.
**Merging phase:** Combine sorted sub-arrays bottom-up.

---

## The Merge Function Explained

The merge function is the heart of Merge Sort. It takes two sorted arrays and produces one sorted array:

```
Left:  [3, 27, 38, 43]    Right: [9, 10, 82]
        ↑ i                        ↑ j

Step 1: Compare 3 and 9  → take 3     Result: [3]
Step 2: Compare 27 and 9 → take 9     Result: [3, 9]
Step 3: Compare 27 and 10 → take 10   Result: [3, 9, 10]
Step 4: Compare 27 and 82 → take 27   Result: [3, 9, 10, 27]
Step 5: Compare 38 and 82 → take 38   Result: [3, 9, 10, 27, 38]
Step 6: Compare 43 and 82 → take 43   Result: [3, 9, 10, 27, 38, 43]
Step 7: Right has 82 left → take 82   Result: [3, 9, 10, 27, 38, 43, 82]
```

**How it works:**
1. Use two pointers `i` and `j` starting at the beginning of each half.
2. Compare elements at both pointers; take the smaller one.
3. Advance the pointer of the array from which we took the element.
4. When one array is exhausted, copy the remaining elements from the other.

This process is O(n) because each element is looked at exactly once.

---

## Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    // Create temporary arrays for left and right halves
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);

    int i = 0, j = 0, k = left;

    // Merge the two halves back into arr
    while (i < leftArr.size() && j < rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }

    // Copy remaining elements from left half
    while (i < leftArr.size()) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }

    // Copy remaining elements from right half
    while (j < rightArr.size()) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;  // Base case: single element

    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);       // Sort left half
    mergeSort(arr, mid + 1, right);  // Sort right half
    merge(arr, left, mid, right);    // Merge sorted halves
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    // Output: 3 9 10 27 38 43 82
    return 0;
}
```

```java
public class MergeSort {
    public static void merge(int[] arr, int left, int mid, int right) {
        // Create temporary arrays for left and right halves
        int[] leftArr = new int[mid - left + 1];
        int[] rightArr = new int[right - mid];

        System.arraycopy(arr, left, leftArr, 0, leftArr.length);
        System.arraycopy(arr, mid + 1, rightArr, 0, rightArr.length);

        int i = 0, j = 0, k = left;

        // Merge the two halves back into arr
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
        }

        // Copy remaining elements from left half
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            i++;
            k++;
        }

        // Copy remaining elements from right half
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            j++;
            k++;
        }
    }

    public static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;  // Base case: single element

        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);       // Sort left half
        mergeSort(arr, mid + 1, right);  // Sort right half
        merge(arr, left, mid, right);    // Merge sorted halves
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
        // Output: [3, 9, 10, 27, 38, 43, 82]
    }
}
```

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr  # Base case: single element

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])    # Sort left half
    right = merge_sort(arr[mid:])   # Sort right half
    return merge(left, right)       # Merge sorted halves

def merge(left, right):
    result = []
    i = j = 0

    # Merge the two halves
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # Append remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    return result

arr = [38, 27, 43, 3, 9, 82, 10]
sorted_arr = merge_sort(arr)
print(sorted_arr)  # [3, 9, 10, 27, 38, 43, 82]
```

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr; // Base case: single element

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));   // Sort left half
  const right = mergeSort(arr.slice(mid));     // Sort right half
  return merge(left, right);                   // Merge sorted halves
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  // Merge the two halves
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // Append remaining elements
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

const arr = [38, 27, 43, 3, 9, 82, 10];
const sorted = mergeSort(arr);
console.log(sorted); // [3, 9, 10, 27, 38, 43, 82]
```

---

## Complexity Analysis

| Case | Time Complexity | Why |
|------|----------------|-----|
| Best | O(n log n) | Always divides and merges |
| Average | O(n log n) | Same process regardless of input |
| Worst | O(n log n) | No bad cases like Quick Sort |

**Space Complexity:** O(n) — needs temporary arrays for merging.

**Why O(n log n)?**
- **Divide:** The array is split log₂(n) times (each split halves the size).
- **Merge:** At each level, merging all sub-arrays takes O(n) total work.
- **Total:** log(n) levels × O(n) work per level = O(n log n).

```
Level 0: [        n elements        ]          → n work to merge
Level 1: [    n/2    ] [    n/2    ]           → n work to merge
Level 2: [ n/4 ][ n/4 ][ n/4 ][ n/4 ]        → n work to merge
...
Level log(n): [1][1][1]...[1][1][1]           → n work to merge

Total: n × log(n) = O(n log n)
```

---

## Stability of Merge Sort

Merge Sort is **stable** because during the merge step, when two elements are equal, we take from the **left** array first (`<=` not `<`):

```
if (left[i] <= right[j])  ← takes left element when equal
```

This ensures equal elements from the left half appear before equal elements from the right half, preserving their original relative order.

---

## When to Use Merge Sort

| Use Case | Why Merge Sort |
|----------|---------------|
| Need guaranteed O(n log n) | No worst-case degradation |
| Stability required | Preserves relative order of equal elements |
| Sorting linked lists | Merge is O(1) space for linked lists |
| External sorting | Natural fit for sorting data on disk |
| Parallel sorting | Independent halves can be sorted in parallel |

---

## Trade-offs

**Advantages:**
- Guaranteed O(n log n) — no worst case degradation
- Stable sort
- Predictable performance
- Parallelizable
- Excellent for linked lists and external sorting

**Disadvantages:**
- O(n) extra space (not in-place for arrays)
- Slower than Quick Sort in practice for arrays (cache misses, allocation overhead)
- Overkill for small arrays (use Insertion Sort instead)

---

## Key Takeaways

- Merge Sort uses divide and conquer: split, recursively sort halves, merge.
- The merge function combines two sorted arrays in O(n) time.
- Always O(n log n) time — no bad inputs.
- Requires O(n) extra space for the temporary arrays.
- Stable and predictable; ideal when you need guaranteed performance or stability.
- Used as a component in TimSort (Python/Java's built-in sort).

---

Next: **Quick Sort →**
