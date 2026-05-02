---
title: Two Pointers
---

# Two Pointers

The **two pointers** technique uses two index variables that move through a data structure (usually an array or string) to solve problems efficiently — often reducing O(n²) brute-force solutions to O(n).

---

## When to Use Two Pointers

| Pattern | Description | Example |
|---------|-------------|---------|
| **Opposite ends** | One pointer at start, one at end; move inward | Pair sum in sorted array |
| **Same direction (slow/fast)** | Both start at beginning; fast moves ahead | Remove duplicates in-place |
| **Sliding window variant** | Expand/contract a range | Container with most water |

---

## Pattern 1: Pair Sum in a Sorted Array

Given a **sorted** array and a target sum, find two numbers that add up to the target.

### Approach

1. Place `left` at index 0, `right` at the last index.
2. If `arr[left] + arr[right] == target` → found.
3. If the sum is too small → move `left` right.
4. If the sum is too large → move `right` left.

**Time:** O(n) — each pointer moves at most n steps total.

```cpp
#include <iostream>
#include <vector>
using namespace std;

pair<int,int> twoSumSorted(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return {left, right};
        else if (sum < target) left++;
        else right--;
    }
    return {-1, -1}; // no pair found
}

int main() {
    vector<int> nums = {1, 3, 5, 7, 10, 12};
    int target = 8;
    auto [i, j] = twoSumSorted(nums, target);
    cout << "Indices: " << i << ", " << j << endl; // 0, 3 → (1+7=8)
    return 0;
}
```

```java
public class TwoPointers {
    public static int[] twoSumSorted(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) return new int[]{left, right};
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 5, 7, 10, 12};
        int target = 8;
        int[] result = twoSumSorted(nums, target);
        System.out.println("Indices: " + result[0] + ", " + result[1]);
    }
}
```

```python
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return (left, right)
        elif total < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)

nums = [1, 3, 5, 7, 10, 12]
print(two_sum_sorted(nums, 8))  # (0, 3)
```

```javascript
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}

console.log(twoSumSorted([1, 3, 5, 7, 10, 12], 8)); // [0, 3]
```

---

## Pattern 2: Remove Duplicates from Sorted Array (In-Place)

Given a sorted array, remove duplicates **in-place** and return the new length. The relative order must stay the same.

### Approach (Slow/Fast Pointers)

- `slow` marks the position of the last unique element.
- `fast` scans ahead looking for new values.

```cpp
#include <iostream>
#include <vector>
using namespace std;

int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;
    int slow = 0;
    for (int fast = 1; fast < (int)nums.size(); fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    return slow + 1;
}

int main() {
    vector<int> nums = {1, 1, 2, 3, 3, 4};
    int len = removeDuplicates(nums);
    for (int i = 0; i < len; i++) cout << nums[i] << " ";
    // Output: 1 2 3 4
    return 0;
}
```

```java
public class RemoveDuplicates {
    public static int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int slow = 0;
        for (int fast = 1; fast < nums.length; fast++) {
            if (nums[fast] != nums[slow]) {
                slow++;
                nums[slow] = nums[fast];
            }
        }
        return slow + 1;
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 2, 3, 3, 4};
        int len = removeDuplicates(nums);
        for (int i = 0; i < len; i++) System.out.print(nums[i] + " ");
        // Output: 1 2 3 4
    }
}
```

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1

nums = [1, 1, 2, 3, 3, 4]
length = remove_duplicates(nums)
print(nums[:length])  # [1, 2, 3, 4]
```

```javascript
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}

const nums = [1, 1, 2, 3, 3, 4];
const len = removeDuplicates(nums);
console.log(nums.slice(0, len)); // [1, 2, 3, 4]
```

---

## Pattern 3: Container With Most Water

Given an array `height` where `height[i]` is the height of a vertical line at position `i`, find two lines that together with the x-axis form a container holding the most water.

### Approach

- Start with the widest container (`left = 0`, `right = n-1`).
- The area is `min(height[left], height[right]) * (right - left)`.
- Move the pointer with the **shorter** height inward — moving the taller one can never increase the area.

**Time:** O(n), **Space:** O(1)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int best = 0;
    while (left < right) {
        int area = min(height[left], height[right]) * (right - left);
        best = max(best, area);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return best;
}

int main() {
    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << maxArea(height) << endl; // 49
    return 0;
}
```

```java
public class ContainerWater {
    public static int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int best = 0;
        while (left < right) {
            int area = Math.min(height[left], height[right]) * (right - left);
            best = Math.max(best, area);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }

    public static void main(String[] args) {
        int[] height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
        System.out.println(maxArea(height)); // 49
    }
}
```

```python
def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        best = max(best, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
```

```javascript
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let best = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
```

---

## Complexity Summary

| Problem | Time | Space |
|---------|------|-------|
| Pair sum (sorted) | O(n) | O(1) |
| Remove duplicates | O(n) | O(1) |
| Container with most water | O(n) | O(1) |

---

## Key Takeaways

1. Two pointers work best on **sorted** arrays or problems with a **monotonic** relationship.
2. The **opposite-ends** pattern narrows the search space by eliminating one side each step.
3. The **slow/fast** pattern partitions the array into "processed" and "unprocessed" regions.
4. Always ask: *"If I move this pointer, can the answer only improve (or stay the same)?"* — that's the invariant that guarantees correctness.

---

Next: **Sliding Window →**
