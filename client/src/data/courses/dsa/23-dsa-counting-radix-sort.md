---
title: "Counting Sort & Radix Sort"
---

# Counting Sort & Radix Sort

All sorting algorithms we've seen so far (bubble, selection, insertion, merge, quick) are **comparison-based** — they decide order by comparing elements. There's a proven lower bound: any comparison-based sort needs at least **O(n log n)** comparisons in the worst case.

But what if we don't compare elements at all? **Non-comparison-based** sorting algorithms can beat O(n log n) by exploiting properties of the data (like integer range). Let's explore two powerful ones.

---

## Counting Sort

### The Idea

Counting sort works by **counting how many times each value appears**, then placing elements in order based on those counts.

**When to use it:** The input consists of integers (or can be mapped to integers) in a **small, known range** `[0, k]`.

### Step-by-Step Example

Sort the array: `[4, 2, 2, 8, 3, 3, 1]`

```
Input:  [4, 2, 2, 8, 3, 3, 1]
Range:  0 to 8 (k = 8)

Step 1: Count occurrences
Index:   0  1  2  3  4  5  6  7  8
Count:  [0, 1, 2, 2, 1, 0, 0, 0, 1]

Step 2: Compute cumulative count (prefix sum)
Index:   0  1  2  3  4  5  6  7  8
Cumul:  [0, 1, 3, 5, 6, 6, 6, 6, 7]
         ↑ "1 element ≤ 0", "3 elements ≤ 2", etc.

Step 3: Place elements in output (traverse input right-to-left for stability)
- arr[6] = 1 → cumul[1] = 1 → output[0] = 1, cumul[1] = 0
- arr[5] = 3 → cumul[3] = 5 → output[4] = 3, cumul[3] = 4
- arr[4] = 3 → cumul[3] = 4 → output[3] = 3, cumul[3] = 3
- arr[3] = 8 → cumul[8] = 7 → output[6] = 8, cumul[8] = 6
- arr[2] = 2 → cumul[2] = 3 → output[2] = 2, cumul[2] = 2
- arr[1] = 2 → cumul[2] = 2 → output[1] = 2, cumul[2] = 1
- arr[0] = 4 → cumul[4] = 6 → output[5] = 4, cumul[4] = 5

Output: [1, 2, 2, 3, 3, 4, 8] ✓
```

### Visual Summary

```
Input Array:     [4, 2, 2, 8, 3, 3, 1]
                      ↓
Count Array:     [0, 1, 2, 2, 1, 0, 0, 0, 1]
                      ↓  (prefix sum)
Cumulative:      [0, 1, 3, 5, 6, 6, 6, 6, 7]
                      ↓  (place elements)
Output Array:    [1, 2, 2, 3, 3, 4, 8]
```

### Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<int> countingSort(vector<int>& arr) {
    if (arr.empty()) return {};

    int maxVal = *max_element(arr.begin(), arr.end());
    int minVal = *min_element(arr.begin(), arr.end());
    int range = maxVal - minVal + 1;

    vector<int> count(range, 0);
    vector<int> output(arr.size());

    // Count occurrences
    for (int num : arr) {
        count[num - minVal]++;
    }

    // Cumulative count
    for (int i = 1; i < range; i++) {
        count[i] += count[i - 1];
    }

    // Build output (traverse right-to-left for stability)
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i] - minVal] - 1] = arr[i];
        count[arr[i] - minVal]--;
    }

    return output;
}

int main() {
    vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
    vector<int> sorted = countingSort(arr);

    for (int num : sorted) {
        cout << num << " ";
    }
    // Output: 1 2 2 3 3 4 8
    return 0;
}
```

```java
import java.util.Arrays;

public class CountingSort {
    public static int[] countingSort(int[] arr) {
        if (arr.length == 0) return new int[0];

        int max = Arrays.stream(arr).max().getAsInt();
        int min = Arrays.stream(arr).min().getAsInt();
        int range = max - min + 1;

        int[] count = new int[range];
        int[] output = new int[arr.length];

        // Count occurrences
        for (int num : arr) {
            count[num - min]++;
        }

        // Cumulative count
        for (int i = 1; i < range; i++) {
            count[i] += count[i - 1];
        }

        // Build output (right-to-left for stability)
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i] - min] - 1] = arr[i];
            count[arr[i] - min]--;
        }

        return output;
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 2, 8, 3, 3, 1};
        int[] sorted = countingSort(arr);
        System.out.println(Arrays.toString(sorted));
        // Output: [1, 2, 2, 3, 3, 4, 8]
    }
}
```

```python
def counting_sort(arr):
    if not arr:
        return []

    min_val = min(arr)
    max_val = max(arr)
    range_val = max_val - min_val + 1

    count = [0] * range_val
    output = [0] * len(arr)

    # Count occurrences
    for num in arr:
        count[num - min_val] += 1

    # Cumulative count
    for i in range(1, range_val):
        count[i] += count[i - 1]

    # Build output (right-to-left for stability)
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i] - min_val] - 1] = arr[i]
        count[arr[i] - min_val] -= 1

    return output


arr = [4, 2, 2, 8, 3, 3, 1]
print(counting_sort(arr))
# Output: [1, 2, 2, 3, 3, 4, 8]
```

```javascript
function countingSort(arr) {
  if (arr.length === 0) return [];

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;

  const count = new Array(range).fill(0);
  const output = new Array(arr.length);

  // Count occurrences
  for (const num of arr) {
    count[num - min]++;
  }

  // Cumulative count
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  // Build output (right-to-left for stability)
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i] - min] - 1] = arr[i];
    count[arr[i] - min]--;
  }

  return output;
}

const arr = [4, 2, 2, 8, 3, 3, 1];
console.log(countingSort(arr));
// Output: [1, 2, 2, 3, 3, 4, 8]
```

### Complexity

| Metric | Value |
|--------|-------|
| Time | O(n + k) where k = range of values |
| Space | O(n + k) |
| Stable? | Yes (with right-to-left traversal) |
| In-place? | No |

**Limitation:** If `k` is much larger than `n` (e.g., sorting 10 numbers in range 0 to 1,000,000), counting sort wastes memory and time.

---

## Radix Sort

### The Idea

Radix sort handles larger numbers by sorting **digit by digit**, starting from the least significant digit (LSD) to the most significant digit. It uses a **stable** sorting algorithm (counting sort) as a subroutine for each digit.

### Step-by-Step Example

Sort: `[170, 45, 75, 90, 802, 24, 2, 66]`

```
Original:         [170, 45, 75, 90, 802, 24, 2, 66]

Sort by 1s digit: [170, 90, 802, 2, 24, 45, 75, 66]
                    0    0    2  2   4   5   5   6

Sort by 10s digit:[802, 2, 24, 45, 66, 170, 75, 90]
                    0   0   2   4   6    7   7   9

Sort by 100s digit:[2, 24, 45, 66, 75, 90, 170, 802]
                    0   0   0   0   0   0    1    8

Final result: [2, 24, 45, 66, 75, 90, 170, 802] ✓
```

**Key insight:** Because counting sort is **stable**, the relative order from previous digit sorts is preserved!

### Implementation

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n);
    int count[10] = {0};

    // Count occurrences of current digit
    for (int i = 0; i < n; i++) {
        count[(arr[i] / exp) % 10]++;
    }

    // Cumulative count
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    // Build output (right-to-left for stability)
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }

    // Copy output back to arr
    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}

void radixSort(vector<int>& arr) {
    if (arr.empty()) return;

    int maxVal = *max_element(arr.begin(), arr.end());

    // Sort for each digit (1s, 10s, 100s, ...)
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

int main() {
    vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(arr);

    for (int num : arr) {
        cout << num << " ";
    }
    // Output: 2 24 45 66 75 90 170 802
    return 0;
}
```

```java
import java.util.Arrays;

public class RadixSort {
    private static void countingSortByDigit(int[] arr, int exp) {
        int n = arr.length;
        int[] output = new int[n];
        int[] count = new int[10];

        // Count occurrences of current digit
        for (int i = 0; i < n; i++) {
            count[(arr[i] / exp) % 10]++;
        }

        // Cumulative count
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // Build output (right-to-left for stability)
        for (int i = n - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }

        // Copy back
        System.arraycopy(output, 0, arr, 0, n);
    }

    public static void radixSort(int[] arr) {
        if (arr.length == 0) return;

        int max = Arrays.stream(arr).max().getAsInt();

        for (int exp = 1; max / exp > 0; exp *= 10) {
            countingSortByDigit(arr, exp);
        }
    }

    public static void main(String[] args) {
        int[] arr = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(arr);
        System.out.println(Arrays.toString(arr));
        // Output: [2, 24, 45, 66, 75, 90, 170, 802]
    }
}
```

```python
def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10

    # Count occurrences of current digit
    for i in range(n):
        digit = (arr[i] // exp) % 10
        count[digit] += 1

    # Cumulative count
    for i in range(1, 10):
        count[i] += count[i - 1]

    # Build output (right-to-left for stability)
    for i in range(n - 1, -1, -1):
        digit = (arr[i] // exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit] -= 1

    # Copy back
    for i in range(n):
        arr[i] = output[i]


def radix_sort(arr):
    if not arr:
        return

    max_val = max(arr)

    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10


arr = [170, 45, 75, 90, 802, 24, 2, 66]
radix_sort(arr)
print(arr)
# Output: [2, 24, 45, 66, 75, 90, 170, 802]
```

```javascript
function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = new Array(n);
  const count = new Array(10).fill(0);

  // Count occurrences of current digit
  for (let i = 0; i < n; i++) {
    count[Math.floor(arr[i] / exp) % 10]++;
  }

  // Cumulative count
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  // Build output (right-to-left for stability)
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }

  // Copy back
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}

function radixSort(arr) {
  if (arr.length === 0) return;

  const max = Math.max(...arr);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
}

const arr = [170, 45, 75, 90, 802, 24, 2, 66];
radixSort(arr);
console.log(arr);
// Output: [2, 24, 45, 66, 75, 90, 170, 802]
```

### Complexity

| Metric | Value |
|--------|-------|
| Time | O(d × (n + k)) where d = number of digits, k = base (10) |
| Space | O(n + k) |
| Stable? | Yes |
| In-place? | No |

For numbers with at most `d` digits in base `k`:
- If `d` is constant (e.g., all numbers fit in 32-bit), radix sort is effectively **O(n)**!

---

## When to Use What

| Algorithm | Best For |
|-----------|----------|
| Counting Sort | Small integer range (k ≈ n or less) |
| Radix Sort | Large numbers but fixed number of digits |
| Comparison sorts | General-purpose, floating point, complex objects |

---

## Key Takeaways

1. **Counting sort** counts occurrences and uses prefix sums — O(n + k) time
2. **Radix sort** applies counting sort digit by digit — O(d × (n + k)) time
3. Both require **non-negative integers** (or need adaptation for negatives)
4. Both are **stable** — equal elements maintain their relative order
5. They beat the O(n log n) lower bound because they don't compare elements

---

Next: **Sorting Comparison →**
