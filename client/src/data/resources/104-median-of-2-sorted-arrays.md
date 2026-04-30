---
id: 104
concepts:
  - Binary search
  - Two-pointer merge
  - Median definition (odd vs even length)
---

## Overview
You are given two sorted arrays `nums1` (size `m`) and `nums2` (size `n`). Return
the median of the combined sorted array. The combined length is `m + n`; if it
is odd the median is the middle element, otherwise it is the average of the two
middle elements.

The challenge is doing this in **O(log(min(m, n)))** time — you cannot afford to
fully merge the two arrays for the optimal solution.

## Approach
We present three approaches in increasing order of efficiency. Pick the one that
matches the constraints in your interview / problem statement:

1. **Brute force** — concatenate, sort, pick the middle. O((m+n) log(m+n)).
2. **Two-pointer merge** — merge like in merge-sort but stop at the middle.
   O(m + n) time, O(1) space.
3. **Binary search on partitions** — partition both arrays so that everything on
   the left half is ≤ everything on the right half. O(log(min(m, n))).

The binary-search version is the one Leetcode expects for the "Hard" rating.

## Concepts
- **Median of a combined array:** for total length `t`, it is `arr[t/2]` when
  `t` is odd, else `(arr[t/2 - 1] + arr[t/2]) / 2.0`.
- **Partitioning two sorted arrays:** choose `i` elements from `nums1` and
  `j = half - i` from `nums2` so that the left side has exactly `half` elements.
  A valid partition satisfies `nums1[i-1] <= nums2[j]` **and**
  `nums2[j-1] <= nums1[i]`.
- **Always binary-search the smaller array** to keep the search range tight and
  to guarantee `j` stays in bounds.
- **Sentinel values:** treat out-of-range indices as `-∞` on the left and
  `+∞` on the right so the boundary checks collapse into a single comparison.

## Complexity
Time: O(log(min(m, n)))
Space: O(1)

## Solution: Brute Force (merge + sort)
Time: O((m + n) log(m + n))
Space: O(m + n)

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> merged(nums1.begin(), nums1.end());
        merged.insert(merged.end(), nums2.begin(), nums2.end());
        sort(merged.begin(), merged.end());
        int t = merged.size();
        if (t % 2) return merged[t / 2];
        return (merged[t / 2 - 1] + merged[t / 2]) / 2.0;
    }
};
```

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        System.arraycopy(nums1, 0, merged, 0, nums1.length);
        System.arraycopy(nums2, 0, merged, nums1.length, nums2.length);
        Arrays.sort(merged);
        int t = merged.length;
        if (t % 2 == 1) return merged[t / 2];
        return (merged[t / 2 - 1] + merged[t / 2]) / 2.0;
    }
}
```

```python
class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        merged = sorted(nums1 + nums2)
        t = len(merged)
        if t % 2:
            return merged[t // 2]
        return (merged[t // 2 - 1] + merged[t // 2]) / 2
```

```javascript
var findMedianSortedArrays = function (nums1, nums2) {
    const merged = [...nums1, ...nums2].sort((a, b) => a - b);
    const t = merged.length;
    if (t % 2) return merged[Math.floor(t / 2)];
    return (merged[t / 2 - 1] + merged[t / 2]) / 2;
};
```

## Solution: Two-Pointer Merge (O(m + n))
Time: O(m + n)
Space: O(1)

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
        int m = a.size(), n = b.size(), t = m + n;
        int i = 0, j = 0, prev = 0, curr = 0;
        for (int k = 0; k <= t / 2; ++k) {
            prev = curr;
            if (i < m && (j >= n || a[i] <= b[j])) curr = a[i++];
            else curr = b[j++];
        }
        if (t % 2) return curr;
        return (prev + curr) / 2.0;
    }
};
```

```java
class Solution {
    public double findMedianSortedArrays(int[] a, int[] b) {
        int m = a.length, n = b.length, t = m + n;
        int i = 0, j = 0, prev = 0, curr = 0;
        for (int k = 0; k <= t / 2; k++) {
            prev = curr;
            if (i < m && (j >= n || a[i] <= b[j])) curr = a[i++];
            else curr = b[j++];
        }
        if (t % 2 == 1) return curr;
        return (prev + curr) / 2.0;
    }
}
```

```python
class Solution:
    def findMedianSortedArrays(self, a, b):
        m, n = len(a), len(b)
        t = m + n
        i = j = 0
        prev = curr = 0
        for _ in range(t // 2 + 1):
            prev = curr
            if i < m and (j >= n or a[i] <= b[j]):
                curr = a[i]; i += 1
            else:
                curr = b[j]; j += 1
        if t % 2:
            return curr
        return (prev + curr) / 2
```

```javascript
var findMedianSortedArrays = function (a, b) {
    const m = a.length, n = b.length, t = m + n;
    let i = 0, j = 0, prev = 0, curr = 0;
    for (let k = 0; k <= Math.floor(t / 2); k++) {
        prev = curr;
        if (i < m && (j >= n || a[i] <= b[j])) curr = a[i++];
        else curr = b[j++];
    }
    if (t % 2) return curr;
    return (prev + curr) / 2;
};
```

## Solution: Binary Search on Partitions (Optimal)
Time: O(log(min(m, n)))
Space: O(1)

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = half - i;
            int left1  = (i == 0) ? INT_MIN : nums1[i - 1];
            int right1 = (i == m) ? INT_MAX : nums1[i];
            int left2  = (j == 0) ? INT_MIN : nums2[j - 1];
            int right2 = (j == n) ? INT_MAX : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                if ((m + n) % 2) return max(left1, left2);
                return (max(left1, left2) + min(right1, right2)) / 2.0;
            } else if (left1 > right2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        return 0.0;
    }
};
```

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.length, n = nums2.length;
        int half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = half - i;
            int left1  = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int right1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int left2  = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int right2 = (j == n) ? Integer.MAX_VALUE : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                if (((m + n) & 1) == 1) return Math.max(left1, left2);
                return (Math.max(left1, left2) + Math.min(right1, right2)) / 2.0;
            } else if (left1 > right2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        return 0.0;
    }
}
```

```python
class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i
            left1  = float("-inf") if i == 0 else nums1[i - 1]
            right1 = float("inf")  if i == m else nums1[i]
            left2  = float("-inf") if j == 0 else nums2[j - 1]
            right2 = float("inf")  if j == n else nums2[j]
            if left1 <= right2 and left2 <= right1:
                if (m + n) % 2:
                    return max(left1, left2)
                return (max(left1, left2) + min(right1, right2)) / 2
            elif left1 > right2:
                hi = i - 1
            else:
                lo = i + 1
        return 0.0
```

```javascript
var findMedianSortedArrays = function (nums1, nums2) {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    const m = nums1.length, n = nums2.length;
    const half = Math.floor((m + n + 1) / 2);
    let lo = 0, hi = m;
    while (lo <= hi) {
        const i = Math.floor((lo + hi) / 2);
        const j = half - i;
        const left1  = i === 0 ? -Infinity : nums1[i - 1];
        const right1 = i === m ?  Infinity : nums1[i];
        const left2  = j === 0 ? -Infinity : nums2[j - 1];
        const right2 = j === n ?  Infinity : nums2[j];
        if (left1 <= right2 && left2 <= right1) {
            if ((m + n) % 2) return Math.max(left1, left2);
            return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
        } else if (left1 > right2) {
            hi = i - 1;
        } else {
            lo = i + 1;
        }
    }
    return 0.0;
};
```
