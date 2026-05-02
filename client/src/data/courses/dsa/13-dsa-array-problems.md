---
title: Common Array Problems
---

# Common Array Problems

Let's solve classic array problems that appear in interviews and competitive programming. For each problem we will see the brute-force approach, then optimize.

## 1. Two Sum

**Problem:** Given an array of integers and a target, return the indices of two elements that add up to the target.

**Brute force — O(n²):** Check every pair.

**Optimal — O(n) using a hash map:** For each element, check if `target - element` is already in the map.

```cpp
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen; // value → index
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {}; // no solution
}
```

```java
import java.util.HashMap;

int[] twoSum(int[] nums, int target) {
    HashMap<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[]{seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    return new int[]{}; // no solution
}
```

```python
def two_sum(nums, target):
    seen = {}  # value → index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

```javascript
function twoSum(nums, target) {
    const seen = new Map(); // value → index
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}
```

Time: O(n). Space: O(n) for the hash map.

## 2. Move Zeroes to End

**Problem:** Move all 0s to the end of the array while maintaining the relative order of non-zero elements. Do it in-place.

**Strategy:** Use a write pointer. Scan left to right; when you find a non-zero, write it at the pointer and advance. Fill the rest with zeros.

```cpp
void moveZeroes(vector<int>& nums) {
    int writeIdx = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] != 0) {
            nums[writeIdx++] = nums[i];
        }
    }
    while (writeIdx < nums.size()) {
        nums[writeIdx++] = 0;
    }
}
// [0, 1, 0, 3, 12] → [1, 3, 12, 0, 0]
```

```java
void moveZeroes(int[] nums) {
    int writeIdx = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] != 0) {
            nums[writeIdx++] = nums[i];
        }
    }
    while (writeIdx < nums.length) {
        nums[writeIdx++] = 0;
    }
}
```

```python
def move_zeroes(nums):
    write_idx = 0
    for num in nums:
        if num != 0:
            nums[write_idx] = num
            write_idx += 1
    while write_idx < len(nums):
        nums[write_idx] = 0
        write_idx += 1
```

```javascript
function moveZeroes(nums) {
    let writeIdx = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[writeIdx++] = nums[i];
        }
    }
    while (writeIdx < nums.length) {
        nums[writeIdx++] = 0;
    }
}
```

Time: O(n). Space: O(1).

## 3. Kadane's Algorithm — Maximum Subarray Sum

**Problem:** Find the contiguous subarray with the largest sum.

**Key insight:** At each position, either extend the current subarray or start a new one.

```
arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Maximum subarray: [4, -1, 2, 1] → sum = 6
```

```cpp
int maxSubarraySum(vector<int>& nums) {
    int currentSum = nums[0];
    int maxSum = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}
```

```java
int maxSubarraySum(int[] nums) {
    int currentSum = nums[0];
    int maxSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
```

```python
def max_subarray_sum(nums):
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
```

```javascript
function maxSubarraySum(nums) {
    let currentSum = nums[0];
    let maxSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
```

Time: O(n). Space: O(1). Kadane's algorithm is one of the most elegant and frequently tested algorithms.

## 4. Merge Two Sorted Arrays

**Problem:** Given two sorted arrays, merge them into one sorted array.

```cpp
vector<int> merge(vector<int>& a, vector<int>& b) {
    vector<int> result;
    int i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) result.push_back(a[i++]);
        else result.push_back(b[j++]);
    }
    while (i < a.size()) result.push_back(a[i++]);
    while (j < b.size()) result.push_back(b[j++]);
    return result;
}
```

```java
int[] merge(int[] a, int[] b) {
    int[] result = new int[a.length + b.length];
    int i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) result[k++] = a[i++];
        else result[k++] = b[j++];
    }
    while (i < a.length) result[k++] = a[i++];
    while (j < b.length) result[k++] = b[j++];
    return result;
}
```

```python
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```

```javascript
function merge(a, b) {
    const result = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) result.push(a[i++]);
        else result.push(b[j++]);
    }
    while (i < a.length) result.push(a[i++]);
    while (j < b.length) result.push(b[j++]);
    return result;
}
```

Time: O(m + n). Space: O(m + n). This merge logic is the heart of **merge sort**.

## 5. Dutch National Flag — Sort 0s, 1s, and 2s

**Problem:** Given an array containing only 0, 1, and 2, sort it in-place in one pass.

**Strategy:** Three pointers — `low`, `mid`, `high`:
- Everything before `low` is 0.
- Everything between `low` and `mid` is 1.
- Everything after `high` is 2.

```cpp
void sortColors(vector<int>& nums) {
    int low = 0, mid = 0, high = nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums[low], nums[mid]);
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            swap(nums[mid], nums[high]);
            high--;
        }
    }
}
```

```java
void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            int temp = nums[low]; nums[low] = nums[mid]; nums[mid] = temp;
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            int temp = nums[mid]; nums[mid] = nums[high]; nums[high] = temp;
            high--;
        }
    }
}
```

```python
def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
```

```javascript
function sortColors(nums) {
    let low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] === 0) {
            [nums[low], nums[mid]] = [nums[mid], nums[low]];
            low++;
            mid++;
        } else if (nums[mid] === 1) {
            mid++;
        } else {
            [nums[mid], nums[high]] = [nums[high], nums[mid]];
            high--;
        }
    }
}
```

Time: O(n) — single pass. Space: O(1).

## Key takeaways

- **Hash maps** solve many "find a pair/element" problems in O(n).
- **Two-pointer / write-pointer** patterns enable in-place modifications.
- **Kadane's algorithm** is the textbook greedy/DP solution for max subarray.
- **Merge logic** is a fundamental building block (merge sort, merge k lists).
- **Dutch National Flag** shows how three pointers can partition in one pass.

Next: **Strings Introduction →**
