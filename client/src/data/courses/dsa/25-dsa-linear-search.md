---
title: "Linear Search"
---

# Linear Search

Linear search is the simplest searching algorithm. It checks every element in the array one by one until it finds what it's looking for (or reaches the end).

---

## How It Works

```
Array:  [4, 2, 7, 1, 9, 3]
Target: 7

Step 1: Check index 0 → 4 ≠ 7
Step 2: Check index 1 → 2 ≠ 7
Step 3: Check index 2 → 7 = 7 ✓ Found at index 2!
```

That's it. Start from the beginning, check each element, stop when found.

---

## Basic Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;  // Found: return index
        }
    }
    return -1;  // Not found
}

int main() {
    vector<int> arr = {4, 2, 7, 1, 9, 3};

    int index = linearSearch(arr, 7);
    if (index != -1) {
        cout << "Found at index " << index << endl;  // Found at index 2
    } else {
        cout << "Not found" << endl;
    }

    cout << linearSearch(arr, 5) << endl;  // -1 (not found)
    return 0;
}
```

```java
public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;  // Found: return index
            }
        }
        return -1;  // Not found
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 7, 1, 9, 3};

        int index = linearSearch(arr, 7);
        if (index != -1) {
            System.out.println("Found at index " + index);  // Found at index 2
        } else {
            System.out.println("Not found");
        }

        System.out.println(linearSearch(arr, 5));  // -1 (not found)
    }
}
```

```python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Found: return index
    return -1  # Not found


arr = [4, 2, 7, 1, 9, 3]

index = linear_search(arr, 7)
if index != -1:
    print(f"Found at index {index}")  # Found at index 2
else:
    print("Not found")

print(linear_search(arr, 5))  # -1 (not found)
```

```javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found: return index
    }
  }
  return -1; // Not found
}

const arr = [4, 2, 7, 1, 9, 3];

const index = linearSearch(arr, 7);
if (index !== -1) {
  console.log(`Found at index ${index}`); // Found at index 2
} else {
  console.log("Not found");
}

console.log(linearSearch(arr, 5)); // -1 (not found)
```

---

## Searching in Unsorted vs Sorted Arrays

### Unsorted Array

In an unsorted array, linear search is often the **only option** — you can't make assumptions about where an element might be.

```
Unsorted: [8, 3, 6, 1, 9, 2]
Target: 6

Must check each element. No shortcuts.
```

### Sorted Array

In a sorted array, you can optimize linear search slightly: **stop early** if you pass where the element would be.

```cpp
int linearSearchSorted(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
        if (arr[i] > target) return -1;  // Early exit!
    }
    return -1;
}
```

```java
public static int linearSearchSorted(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
        if (arr[i] > target) return -1;  // Early exit!
    }
    return -1;
}
```

```python
def linear_search_sorted(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
        if arr[i] > target:
            return -1  # Early exit!
    return -1
```

```javascript
function linearSearchSorted(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
    if (arr[i] > target) return -1; // Early exit!
  }
  return -1;
}
```

> **Note:** If the array is sorted, you should usually use **binary search** instead (O(log n)). But for very small arrays (n < 10), linear search can be faster due to less overhead.

---

## Sentinel Linear Search

A minor optimization that eliminates the bounds check (`i < n`) in the loop. The idea: place the target at the end of the array as a "sentinel" — you're guaranteed to find it, so you don't need to check if you've gone out of bounds.

```
Original: [4, 2, 7, 1, 9, 3]
Target: 7

With sentinel:
- Save last element: last = arr[5] = 3
- Set arr[5] = 7 (the target)
- Search without bounds check — guaranteed to find 7
- If found at index < 5: genuinely found
- If found at index 5: check if last == target
- Restore arr[5] = last
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

int sentinelLinearSearch(vector<int>& arr, int target) {
    int n = arr.size();
    if (n == 0) return -1;

    // Save the last element and place sentinel
    int last = arr[n - 1];
    arr[n - 1] = target;

    int i = 0;
    while (arr[i] != target) {
        i++;  // No bounds check needed!
    }

    // Restore the last element
    arr[n - 1] = last;

    // Check if we found a real match or hit the sentinel
    if (i < n - 1 || arr[n - 1] == target) {
        return i;
    }
    return -1;
}

int main() {
    vector<int> arr = {4, 2, 7, 1, 9, 3};
    cout << sentinelLinearSearch(arr, 7) << endl;  // 2
    cout << sentinelLinearSearch(arr, 5) << endl;  // -1
    return 0;
}
```

```java
public class SentinelSearch {
    public static int sentinelLinearSearch(int[] arr, int target) {
        int n = arr.length;
        if (n == 0) return -1;

        // Save last element and place sentinel
        int last = arr[n - 1];
        arr[n - 1] = target;

        int i = 0;
        while (arr[i] != target) {
            i++;  // No bounds check needed!
        }

        // Restore last element
        arr[n - 1] = last;

        // Check if real match or sentinel
        if (i < n - 1 || arr[n - 1] == target) {
            return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 7, 1, 9, 3};
        System.out.println(sentinelLinearSearch(arr, 7));  // 2
        System.out.println(sentinelLinearSearch(arr, 5));  // -1
    }
}
```

```python
def sentinel_linear_search(arr, target):
    n = len(arr)
    if n == 0:
        return -1

    # Save last element and place sentinel
    last = arr[n - 1]
    arr[n - 1] = target

    i = 0
    while arr[i] != target:
        i += 1  # No bounds check needed!

    # Restore last element
    arr[n - 1] = last

    # Check if real match or sentinel
    if i < n - 1 or arr[n - 1] == target:
        return i
    return -1


arr = [4, 2, 7, 1, 9, 3]
print(sentinel_linear_search(arr, 7))  # 2
print(sentinel_linear_search(arr, 5))  # -1
```

```javascript
function sentinelLinearSearch(arr, target) {
  const n = arr.length;
  if (n === 0) return -1;

  // Save last element and place sentinel
  const last = arr[n - 1];
  arr[n - 1] = target;

  let i = 0;
  while (arr[i] !== target) {
    i++; // No bounds check needed!
  }

  // Restore last element
  arr[n - 1] = last;

  // Check if real match or sentinel
  if (i < n - 1 || arr[n - 1] === target) {
    return i;
  }
  return -1;
}

const arr = [4, 2, 7, 1, 9, 3];
console.log(sentinelLinearSearch(arr, 7)); // 2
console.log(sentinelLinearSearch(arr, 5)); // -1
```

**Why is this faster?** The regular loop does TWO checks per iteration (`i < n` AND `arr[i] == target`). The sentinel version does only ONE check (`arr[i] == target`). For large arrays, removing one comparison per element adds up.

> **Caveat:** Sentinel search modifies the array temporarily, so it's not thread-safe without synchronization.

---

## Complexity Analysis

| Case | Time |
|------|------|
| Best case | O(1) — target is the first element |
| Average case | O(n) — target is in the middle on average |
| Worst case | O(n) — target is the last element or not present |
| Space | O(1) — no extra memory needed |

---

## When Linear Search Is Appropriate

✅ **Use linear search when:**
- The array is **unsorted** and you can't sort it
- The array is **very small** (n < 10–20)
- You only need to search **once** (sorting first would cost O(n log n))
- The data structure doesn't support random access (linked lists)
- You're searching with a **complex condition** (not just equality)

❌ **Don't use linear search when:**
- The array is **sorted** — use binary search (O(log n))
- You need to search **many times** — sort first, then binary search
- You need O(1) lookup — use a hash table/set

---

## Variations

### Find All Occurrences

```cpp
vector<int> findAll(const vector<int>& arr, int target) {
    vector<int> indices;
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            indices.push_back(i);
        }
    }
    return indices;
}
```

```java
public static List<Integer> findAll(int[] arr, int target) {
    List<Integer> indices = new ArrayList<>();
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            indices.add(i);
        }
    }
    return indices;
}
```

```python
def find_all(arr, target):
    return [i for i, val in enumerate(arr) if val == target]
```

```javascript
function findAll(arr, target) {
  const indices = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      indices.push(i);
    }
  }
  return indices;
}
```

### Search with Condition

```python
# Find first element greater than 5
def find_first(arr, condition):
    for i, val in enumerate(arr):
        if condition(val):
            return i
    return -1

arr = [1, 3, 7, 2, 9, 4]
index = find_first(arr, lambda x: x > 5)
print(index)  # 2 (value 7)
```

---

## Key Takeaways

1. Linear search checks elements **one by one** — simple but O(n)
2. Works on **unsorted** data — no preconditions required
3. Sentinel optimization removes one comparison per iteration
4. For sorted data, always prefer **binary search** (coming next!)
5. Built-in methods like `indexOf`, `index()`, `find()` use linear search internally

---

Next: **Binary Search →**
