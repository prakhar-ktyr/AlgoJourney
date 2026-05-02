---
title: Binary Search Variations
---

# Binary Search Variations

Standard binary search finds an exact match. But the real power of binary search lies in its **variations** — problems where you search for a boundary, a condition change, or an answer in a range. These patterns appear constantly in interviews and competitive programming.

---

## 1. Lower Bound & Upper Bound

### Lower Bound

The **lower bound** of a target is the index of the **first element ≥ target** (the insertion point where target would go without displacing smaller elements).

```
Array: [1, 3, 3, 5, 5, 5, 8, 9]
lower_bound(5) → index 3 (first 5)
lower_bound(4) → index 3 (first element ≥ 4, which is 5)
lower_bound(6) → index 6 (first element ≥ 6, which is 8)
lower_bound(10) → index 8 (past the end — no element ≥ 10)
```

### Upper Bound

The **upper bound** of a target is the index of the **first element > target**.

```
Array: [1, 3, 3, 5, 5, 5, 8, 9]
upper_bound(5) → index 6 (first element > 5, which is 8)
upper_bound(3) → index 3 (first element > 3, which is 5)
upper_bound(9) → index 8 (past the end)
```

### Relationship

- Number of occurrences of `x` = `upper_bound(x) - lower_bound(x)`
- For the example: count of 5 = 6 - 3 = 3 ✓

---

### Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

// First index where arr[i] >= target
int lowerBound(const vector<int>& arr, int target) {
    int left = 0, right = arr.size();

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

// First index where arr[i] > target
int upperBound(const vector<int>& arr, int target) {
    int left = 0, right = arr.size();

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

int main() {
    vector<int> arr = {1, 3, 3, 5, 5, 5, 8, 9};

    cout << "lower_bound(5) = " << lowerBound(arr, 5) << endl;  // 3
    cout << "upper_bound(5) = " << upperBound(arr, 5) << endl;  // 6
    cout << "count of 5 = " << upperBound(arr, 5) - lowerBound(arr, 5) << endl;  // 3

    // C++ STL equivalents:
    // lower_bound(arr.begin(), arr.end(), 5) - arr.begin()
    // upper_bound(arr.begin(), arr.end(), 5) - arr.begin()

    return 0;
}
```

```java
public class BoundsSearch {
    // First index where arr[i] >= target
    public static int lowerBound(int[] arr, int target) {
        int left = 0, right = arr.length;

        while (left < right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    // First index where arr[i] > target
    public static int upperBound(int[] arr, int target) {
        int left = 0, right = arr.length;

        while (left < right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 3, 5, 5, 5, 8, 9};

        System.out.println("lower_bound(5) = " + lowerBound(arr, 5));  // 3
        System.out.println("upper_bound(5) = " + upperBound(arr, 5));  // 6
        System.out.println("count of 5 = " + (upperBound(arr, 5) - lowerBound(arr, 5)));  // 3
    }
}
```

```python
def lower_bound(arr, target):
    """First index where arr[i] >= target."""
    left, right = 0, len(arr)

    while left < right:
        mid = left + (right - left) // 2
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid

    return left


def upper_bound(arr, target):
    """First index where arr[i] > target."""
    left, right = 0, len(arr)

    while left < right:
        mid = left + (right - left) // 2
        if arr[mid] <= target:
            left = mid + 1
        else:
            right = mid

    return left


arr = [1, 3, 3, 5, 5, 5, 8, 9]

print(f"lower_bound(5) = {lower_bound(arr, 5)}")  # 3
print(f"upper_bound(5) = {upper_bound(arr, 5)}")  # 6
print(f"count of 5 = {upper_bound(arr, 5) - lower_bound(arr, 5)}")  # 3

# Python bisect module equivalents:
import bisect
print(bisect.bisect_left(arr, 5))   # 3 (lower_bound)
print(bisect.bisect_right(arr, 5))  # 6 (upper_bound)
```

```javascript
// First index where arr[i] >= target
function lowerBound(arr, target) {
  let left = 0, right = arr.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// First index where arr[i] > target
function upperBound(arr, target) {
  let left = 0, right = arr.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

const arr = [1, 3, 3, 5, 5, 5, 8, 9];

console.log(`lower_bound(5) = ${lowerBound(arr, 5)}`);  // 3
console.log(`upper_bound(5) = ${upperBound(arr, 5)}`);  // 6
console.log(`count of 5 = ${upperBound(arr, 5) - lowerBound(arr, 5)}`);  // 3
```

**Key difference from standard binary search**: `right` starts at `arr.length` (not `arr.length - 1`), and the loop condition is `left < right` (not `left <= right`). This is because we're looking for an *insertion point*, which can be past the last element.

---

## 2. Find Peak Element

A **peak element** is an element that is greater than its neighbors. Given an array that is not sorted but has the property that `arr[0] < arr[1]` is possible and `arr[n-2] > arr[n-1]` is possible, find any peak.

Binary search works here because if `arr[mid] < arr[mid + 1]`, there must be a peak to the right (the sequence is still increasing). If `arr[mid] > arr[mid + 1]`, there must be a peak at `mid` or to the left.

```
Array: [1, 3, 20, 4, 1, 0]

mid=2: arr[2]=20 > arr[3]=4 → peak at mid or left
Result: index 2 (value 20) is a peak ✓
```

### Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

int findPeakElement(const vector<int>& arr) {
    int left = 0, right = arr.size() - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] < arr[mid + 1]) {
            // Rising slope → peak is to the right
            left = mid + 1;
        } else {
            // Falling slope → peak is at mid or to the left
            right = mid;
        }
    }

    return left;  // left == right == peak index
}

int main() {
    vector<int> arr = {1, 3, 20, 4, 1, 0};
    int peak = findPeakElement(arr);
    cout << "Peak at index " << peak << " (value " << arr[peak] << ")" << endl;
    // Peak at index 2 (value 20)
    return 0;
}
```

```java
public class PeakElement {
    public static int findPeakElement(int[] arr) {
        int left = 0, right = arr.length - 1;

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] < arr[mid + 1]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 20, 4, 1, 0};
        int peak = findPeakElement(arr);
        System.out.println("Peak at index " + peak + " (value " + arr[peak] + ")");
        // Peak at index 2 (value 20)
    }
}
```

```python
def find_peak_element(arr):
    left, right = 0, len(arr) - 1

    while left < right:
        mid = left + (right - left) // 2

        if arr[mid] < arr[mid + 1]:
            # Rising slope → peak is to the right
            left = mid + 1
        else:
            # Falling slope → peak is at mid or left
            right = mid

    return left


arr = [1, 3, 20, 4, 1, 0]
peak = find_peak_element(arr)
print(f"Peak at index {peak} (value {arr[peak]})")
# Peak at index 2 (value 20)
```

```javascript
function findPeakElement(arr) {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] < arr[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

const arr = [1, 3, 20, 4, 1, 0];
const peak = findPeakElement(arr);
console.log(`Peak at index ${peak} (value ${arr[peak]})`);
// Peak at index 2 (value 20)
```

**Time Complexity**: O(log n) — we eliminate half the array each iteration.

---

## 3. Search in Rotated Sorted Array

A sorted array that has been **rotated** (e.g., `[4, 5, 6, 7, 0, 1, 2]` was originally `[0, 1, 2, 4, 5, 6, 7]`). Find a target in O(log n).

**Key insight**: At any `mid`, one half of the array is always sorted. We can determine which half is sorted and whether the target lies within it.

```
Array: [4, 5, 6, 7, 0, 1, 2]
Target: 0

Step 1: left=0, right=6, mid=3
  arr[0..3] = [4,5,6,7] ← left half sorted (arr[left] <= arr[mid])
  target=0 is NOT in [4,7] range → search right: left=4

Step 2: left=4, right=6, mid=5
  arr[4..5] = [0,1] ← left half sorted (arr[left] <= arr[mid])
  target=0 IS in [0,1] range → search left: right=5

Step 3: left=4, right=5, mid=4
  arr[4]=0 == target → FOUND at index 4 ✓
```

### Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

int searchRotated(const vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;

        // Left half is sorted
        if (arr[left] <= arr[mid]) {
            if (arr[left] <= target && target < arr[mid]) {
                right = mid - 1;  // Target in left half
            } else {
                left = mid + 1;   // Target in right half
            }
        }
        // Right half is sorted
        else {
            if (arr[mid] < target && target <= arr[right]) {
                left = mid + 1;   // Target in right half
            } else {
                right = mid - 1;  // Target in left half
            }
        }
    }

    return -1;
}

int main() {
    vector<int> arr = {4, 5, 6, 7, 0, 1, 2};

    cout << searchRotated(arr, 0) << endl;  // 4
    cout << searchRotated(arr, 5) << endl;  // 1
    cout << searchRotated(arr, 3) << endl;  // -1

    return 0;
}
```

```java
public class RotatedArraySearch {
    public static int searchRotated(int[] arr, int target) {
        int left = 0, right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) return mid;

            // Left half is sorted
            if (arr[left] <= arr[mid]) {
                if (arr[left] <= target && target < arr[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }
            // Right half is sorted
            else {
                if (arr[mid] < target && target <= arr[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }

        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 6, 7, 0, 1, 2};

        System.out.println(searchRotated(arr, 0));  // 4
        System.out.println(searchRotated(arr, 5));  // 1
        System.out.println(searchRotated(arr, 3));  // -1
    }
}
```

```python
def search_rotated(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid

        # Left half is sorted
        if arr[left] <= arr[mid]:
            if arr[left] <= target < arr[mid]:
                right = mid - 1  # Target in left half
            else:
                left = mid + 1   # Target in right half
        # Right half is sorted
        else:
            if arr[mid] < target <= arr[right]:
                left = mid + 1   # Target in right half
            else:
                right = mid - 1  # Target in left half

    return -1


arr = [4, 5, 6, 7, 0, 1, 2]

print(search_rotated(arr, 0))  # 4
print(search_rotated(arr, 5))  # 1
print(search_rotated(arr, 3))  # -1
```

```javascript
function searchRotated(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) return mid;

    // Left half is sorted
    if (arr[left] <= arr[mid]) {
      if (arr[left] <= target && target < arr[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    // Right half is sorted
    else {
      if (arr[mid] < target && target <= arr[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

const arr = [4, 5, 6, 7, 0, 1, 2];

console.log(searchRotated(arr, 0));  // 4
console.log(searchRotated(arr, 5));  // 1
console.log(searchRotated(arr, 3));  // -1
```

---

## 4. Binary Search on Answer

Sometimes the answer itself is what you binary search on. If you can verify a candidate answer in O(n) or O(n log n), and the answer space is monotonic (if `x` works, then `x+1` also works), you can binary search the answer space.

### Example: Minimum Capacity to Ship Packages in D Days

Given package weights and D days, find the minimum ship capacity to deliver all packages in D days (packages must stay in order).

```
Weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Days: 5

Answer: capacity = 15
  Day 1: [1,2,3,4,5] = 15
  Day 2: [6,7] = 13
  Day 3: [8] = 8
  Day 4: [9] = 9
  Day 5: [10] = 10
```

**Search space**: `[max(weights), sum(weights)]`
- Minimum possible capacity = largest single package (must fit it).
- Maximum possible capacity = all packages in one day.

### Implementation

```cpp
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
using namespace std;

bool canShip(const vector<int>& weights, int days, int capacity) {
    int currentLoad = 0;
    int daysNeeded = 1;

    for (int w : weights) {
        if (currentLoad + w > capacity) {
            daysNeeded++;
            currentLoad = 0;
        }
        currentLoad += w;
    }

    return daysNeeded <= days;
}

int shipWithinDays(const vector<int>& weights, int days) {
    int left = *max_element(weights.begin(), weights.end());
    int right = accumulate(weights.begin(), weights.end(), 0);

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (canShip(weights, days, mid)) {
            right = mid;      // Try smaller capacity
        } else {
            left = mid + 1;   // Need larger capacity
        }
    }

    return left;
}

int main() {
    vector<int> weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    cout << shipWithinDays(weights, 5) << endl;  // 15
    return 0;
}
```

```java
import java.util.Arrays;

public class ShipPackages {
    private static boolean canShip(int[] weights, int days, int capacity) {
        int currentLoad = 0;
        int daysNeeded = 1;

        for (int w : weights) {
            if (currentLoad + w > capacity) {
                daysNeeded++;
                currentLoad = 0;
            }
            currentLoad += w;
        }

        return daysNeeded <= days;
    }

    public static int shipWithinDays(int[] weights, int days) {
        int left = Arrays.stream(weights).max().getAsInt();
        int right = Arrays.stream(weights).sum();

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (canShip(weights, days, mid)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    public static void main(String[] args) {
        int[] weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        System.out.println(shipWithinDays(weights, 5));  // 15
    }
}
```

```python
def can_ship(weights, days, capacity):
    current_load = 0
    days_needed = 1

    for w in weights:
        if current_load + w > capacity:
            days_needed += 1
            current_load = 0
        current_load += w

    return days_needed <= days


def ship_within_days(weights, days):
    left = max(weights)      # Minimum possible capacity
    right = sum(weights)     # Maximum possible capacity

    while left < right:
        mid = left + (right - left) // 2

        if can_ship(weights, days, mid):
            right = mid       # Try smaller capacity
        else:
            left = mid + 1    # Need larger capacity

    return left


weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(ship_within_days(weights, 5))  # 15
```

```javascript
function canShip(weights, days, capacity) {
  let currentLoad = 0;
  let daysNeeded = 1;

  for (const w of weights) {
    if (currentLoad + w > capacity) {
      daysNeeded++;
      currentLoad = 0;
    }
    currentLoad += w;
  }

  return daysNeeded <= days;
}

function shipWithinDays(weights, days) {
  let left = Math.max(...weights);
  let right = weights.reduce((sum, w) => sum + w, 0);

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (canShip(weights, days, mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(shipWithinDays(weights, 5)); // 15
```

---

## Binary Search on Answer — Pattern

The general pattern for "binary search on answer" problems:

```
1. Identify the answer space: [min_possible, max_possible]
2. Write a feasibility check: canAchieve(candidate) → boolean
3. Binary search:
   - If canAchieve(mid) → try smaller (right = mid)
   - If !canAchieve(mid) → need larger (left = mid + 1)
4. Return left (minimum feasible answer)
```

**Common problems using this pattern**:
- Minimum capacity to ship packages in D days
- Split array largest sum (minimize the maximum subarray sum)
- Koko eating bananas (minimum speed)
- Minimum time to complete tasks
- Aggressive cows (maximize minimum distance)

---

## Summary of Variations

| Variation | Key Insight | Loop Condition | Template |
|-----------|-------------|----------------|----------|
| Lower Bound | First ≥ target | `left < right` | `right = mid` when `arr[mid] >= target` |
| Upper Bound | First > target | `left < right` | `right = mid` when `arr[mid] > target` |
| Peak Element | Compare mid with mid+1 | `left < right` | Go toward rising slope |
| Rotated Array | One half always sorted | `left <= right` | Check which half is sorted |
| Binary Search on Answer | Feasibility check | `left < right` | `right = mid` when feasible |

---

## Tips for Binary Search Problems

1. **Identify the search space** — What are you searching over? Array indices? Answer values?
2. **Identify the monotonic property** — Is there a clear boundary where the condition changes?
3. **Choose the right template** — `left <= right` for exact match, `left < right` for boundary finding.
4. **Be careful with `mid` calculation** — Use `left + (right - left) / 2` to avoid overflow.
5. **Test edge cases** — Empty array, single element, target at boundaries, all duplicates.
6. **Verify termination** — Ensure `left` and `right` converge (no infinite loops).

---

## Key Takeaways

- Binary search is not just about finding an element — it's about finding **boundaries**.
- Lower/upper bound find insertion points in O(log n).
- Peak element search works on non-sorted arrays with the right monotonic property.
- Rotated sorted array search identifies the sorted half to decide direction.
- Binary search on answer converts optimization problems to decision problems.
- Master these patterns and you can solve hundreds of binary search problems!

---

Next: **Linked Lists Introduction →**
