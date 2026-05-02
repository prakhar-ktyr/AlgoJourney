---
title: Sliding Window
---

# Sliding Window

The **sliding window** technique maintains a contiguous subarray (or substring) that "slides" across the input. It transforms nested-loop solutions from O(n²) or O(n·k) down to O(n).

---

## Two Flavors

| Type | Window size | When to use |
|------|-------------|-------------|
| **Fixed-size** | Always k | "Find max/min/average of every subarray of size k" |
| **Variable-size** | Grows/shrinks | "Find smallest/longest subarray satisfying a condition" |

---

## Fixed-Size Window: Maximum Sum Subarray of Size k

Given an array of integers and an integer `k`, find the maximum sum among all contiguous subarrays of size `k`.

### Approach

1. Compute the sum of the first `k` elements.
2. Slide the window one position right: add the new element, subtract the element that left.
3. Track the maximum sum seen.

**Time:** O(n), **Space:** O(1)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSumSubarray(vector<int>& nums, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += nums[i];

    int maxSum = windowSum;
    for (int i = k; i < (int)nums.size(); i++) {
        windowSum += nums[i] - nums[i - k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}

int main() {
    vector<int> nums = {2, 1, 5, 1, 3, 2};
    cout << maxSumSubarray(nums, 3) << endl; // 9 (5+1+3)
    return 0;
}
```

```java
public class SlidingWindow {
    public static int maxSumSubarray(int[] nums, int k) {
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += nums[i];

        int maxSum = windowSum;
        for (int i = k; i < nums.length; i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] nums = {2, 1, 5, 1, 3, 2};
        System.out.println(maxSumSubarray(nums, 3)); // 9
    }
}
```

```python
def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

print(max_sum_subarray([2, 1, 5, 1, 3, 2], 3))  # 9
```

```javascript
function maxSumSubarray(nums, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];

  let maxSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

console.log(maxSumSubarray([2, 1, 5, 1, 3, 2], 3)); // 9
```

---

## Variable-Size Window: Smallest Subarray With Sum ≥ Target

Given an array of positive integers and a target, find the **minimal length** of a contiguous subarray whose sum is ≥ target. Return 0 if none exists.

### Approach

1. Expand the window by moving `right` forward and adding elements.
2. Once the window sum ≥ target, **shrink** from the left to find the minimum length.
3. Repeat until `right` reaches the end.

**Time:** O(n) — each element is added and removed at most once.

```cpp
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int minSubarrayLen(int target, vector<int>& nums) {
    int left = 0, sum = 0;
    int minLen = INT_MAX;
    for (int right = 0; right < (int)nums.size(); right++) {
        sum += nums[right];
        while (sum >= target) {
            minLen = min(minLen, right - left + 1);
            sum -= nums[left];
            left++;
        }
    }
    return minLen == INT_MAX ? 0 : minLen;
}

int main() {
    vector<int> nums = {2, 3, 1, 2, 4, 3};
    cout << minSubarrayLen(7, nums) << endl; // 2 (subarray [4,3])
    return 0;
}
```

```java
public class MinSubarray {
    public static int minSubarrayLen(int target, int[] nums) {
        int left = 0, sum = 0;
        int minLen = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

    public static void main(String[] args) {
        int[] nums = {2, 3, 1, 2, 4, 3};
        System.out.println(minSubarrayLen(7, nums)); // 2
    }
}
```

```python
def min_subarray_len(target, nums):
    left = 0
    current_sum = 0
    min_len = float("inf")
    for right in range(len(nums)):
        current_sum += nums[right]
        while current_sum >= target:
            min_len = min(min_len, right - left + 1)
            current_sum -= nums[left]
            left += 1
    return 0 if min_len == float("inf") else min_len

print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))  # 2
```

```javascript
function minSubarrayLen(target, nums) {
  let left = 0, sum = 0;
  let minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return minLen === Infinity ? 0 : minLen;
}

console.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3])); // 2
```

---

## Variable-Size Window: Longest Substring Without Repeating Characters

Given a string, find the length of the **longest substring** without repeating characters.

### Approach

- Use a hash set (or map) to track characters in the current window.
- Expand `right`; if the character is already in the set, shrink from `left` until it's removed.

**Time:** O(n), **Space:** O(min(n, alphabet size))

```cpp
#include <iostream>
#include <string>
#include <unordered_set>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_set<char> window;
    int left = 0, maxLen = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        while (window.count(s[right])) {
            window.erase(s[left]);
            left++;
        }
        window.insert(s[right]);
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}

int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl; // 3 ("abc")
    cout << lengthOfLongestSubstring("pwwkew") << endl;   // 3 ("wke")
    return 0;
}
```

```java
import java.util.HashSet;
import java.util.Set;

public class LongestSubstring {
    public static int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            while (window.contains(s.charAt(right))) {
                window.remove(s.charAt(left));
                left++;
            }
            window.add(s.charAt(right));
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3
    }
}
```

```python
def length_of_longest_substring(s):
    window = set()
    left = 0
    max_len = 0
    for right in range(len(s)):
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len

print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("pwwkew"))    # 3
```

```javascript
function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
```

---

## Sliding Window Template (Variable-Size)

Here's a general template you can adapt:

```python
def sliding_window(arr, condition):
    left = 0
    state = ...  # whatever tracks the window (sum, set, map)
    best = ...

    for right in range(len(arr)):
        # 1. Expand: add arr[right] to state
        # 2. Shrink: while window is invalid, remove arr[left], left++
        # 3. Update best answer
    return best
```

---

## Complexity Summary

| Problem | Time | Space |
|---------|------|-------|
| Max sum subarray (fixed k) | O(n) | O(1) |
| Smallest subarray sum ≥ target | O(n) | O(1) |
| Longest substring no repeats | O(n) | O(min(n, σ)) |

---

## Key Takeaways

1. **Fixed window** → compute initial window, then slide by adding/removing one element at a time.
2. **Variable window** → expand right, shrink left when the window violates a constraint.
3. The technique works because both pointers only move forward — total work is O(n).
4. Sliding window is closely related to two pointers; the key distinction is that the window represents a **contiguous range** of interest.

---

Next: **Bit Manipulation →**
