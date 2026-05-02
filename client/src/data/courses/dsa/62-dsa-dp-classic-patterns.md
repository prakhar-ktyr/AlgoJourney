---
title: "DP — Classic Patterns"
---

# DP — Classic Patterns

This lesson covers two foundational DP patterns that appear across dozens of interview problems: **0/1 Knapsack** and **Partition Subset Sum**. Mastering these unlocks an entire family of problems including target sum, equal partition, bounded knapsack, and more.

---

## 1. 0/1 Knapsack

**Problem:** Given `n` items, each with a weight `w[i]` and value `v[i]`, and a knapsack with capacity `W`, find the maximum total value you can carry. Each item is either taken whole or not taken (no fractions).

**State:** `dp[i][c]` = maximum value using items `0..i-1` with capacity `c`  
**Recurrence:**

$$
dp[i][c] = \begin{cases}
dp[i-1][c] & \text{if } w[i-1] > c \text{ (can't take item)} \\
\max(dp[i-1][c],\; dp[i-1][c - w[i-1]] + v[i-1]) & \text{otherwise}
\end{cases}
$$

**Base:** `dp[0][c] = 0` for all `c` (no items → no value)

### Full 2D Solution

```cpp
#include <vector>
#include <algorithm>
using namespace std;

int knapsack(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c]; // skip item
            if (weights[i - 1] <= c) {
                dp[i][c] = max(dp[i][c], dp[i - 1][c - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    return dp[n][W];
}
```

```java
public int knapsack(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];
            if (weights[i - 1] <= c) {
                dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    return dp[n][W];
}
```

```python
def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]  # skip
            if weights[i - 1] <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - weights[i - 1]] + values[i - 1])
    return dp[n][W]
```

```javascript
function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      dp[i][c] = dp[i - 1][c];
      if (weights[i - 1] <= c) {
        dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][W];
}
```

**Time:** $O(n \times W)$ | **Space:** $O(n \times W)$

### Space-Optimized (1D Array)

Key insight: since row `i` only depends on row `i-1`, we can use a single array — but we must iterate **capacity in reverse** to avoid using an updated value from the same row.

```cpp
int knapsack(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        for (int c = W; c >= weights[i]; c--) {
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```java
public int knapsack(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[] dp = new int[W + 1];
    for (int i = 0; i < n; i++) {
        for (int c = W; c >= weights[i]; c--) {
            dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```python
def knapsack(weights, values, W):
    n = len(weights)
    dp = [0] * (W + 1)
    for i in range(n):
        for c in range(W, weights[i] - 1, -1):
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[W]
```

```javascript
function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let c = W; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[W];
}
```

**Time:** $O(n \times W)$ | **Space:** $O(W)$

> **Why reverse?** If we go left-to-right, `dp[c - weights[i]]` might already reflect taking item `i` in this iteration, effectively allowing the item to be taken multiple times (that's the *unbounded* knapsack). Reverse order ensures we only use values from the previous "row."

---

## 2. Partition Equal Subset Sum

**Problem:** Given an integer array `nums`, determine if it can be partitioned into two subsets with equal sum.

**Reduction to 0/1 Knapsack:** If total sum is odd, return `false`. Otherwise, find if a subset sums to `sum / 2`. This is exactly a knapsack problem where each item's weight = value = `nums[i]` and capacity = `sum / 2`.

**State:** `dp[c]` = boolean, can we form sum `c` using some subset?  
**Recurrence:** `dp[c] = dp[c] || dp[c - nums[i]]`  
**Base:** `dp[0] = true`

```cpp
#include <vector>
#include <numeric>
using namespace std;

bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2 != 0) return false;
    int target = total / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    for (int num : nums) {
        for (int c = target; c >= num; c--) {
            dp[c] = dp[c] || dp[c - num];
        }
    }
    return dp[target];
}
```

```java
public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums) {
        for (int c = target; c >= num; c--) {
            dp[c] = dp[c] || dp[c - num];
        }
    }
    return dp[target];
}
```

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for c in range(target, num - 1, -1):
            dp[c] = dp[c] or dp[c - num]
    return dp[target]
```

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let c = target; c >= num; c--) {
      dp[c] = dp[c] || dp[c - num];
    }
  }
  return dp[target];
}
```

**Time:** $O(n \times \text{sum}/2)$ | **Space:** $O(\text{sum}/2)$

---

## The Knapsack Family

Once you understand the 0/1 Knapsack pattern, many problems reduce to it:

| Problem | Reduction |
|---------|-----------|
| Partition Equal Subset Sum | Knapsack with target = sum/2 |
| Target Sum (+/- signs) | Knapsack with target = (sum + target)/2 |
| Coin Change (min coins) | Unbounded knapsack (forward iteration) |
| Coin Change II (count ways) | Unbounded knapsack counting |
| Last Stone Weight II | Knapsack minimizing `|sum - 2*subset|` |
| Ones and Zeroes | 2D knapsack (0s and 1s as capacities) |

### Quick Comparison: 0/1 vs Unbounded Knapsack

```python
# 0/1 Knapsack — each item used at most once
# Iterate capacity in REVERSE
for i in range(n):
    for c in range(W, weights[i] - 1, -1):
        dp[c] = max(dp[c], dp[c - weights[i]] + values[i])

# Unbounded Knapsack — each item can be used unlimited times
# Iterate capacity FORWARD
for i in range(n):
    for c in range(weights[i], W + 1):
        dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
```

The only difference is the inner loop direction!

---

## Counting Subsets with Target Sum

**Problem:** Count the number of subsets of `nums` that sum to a given `target`.

```cpp
int countSubsets(vector<int>& nums, int target) {
    vector<int> dp(target + 1, 0);
    dp[0] = 1;
    for (int num : nums) {
        for (int c = target; c >= num; c--) {
            dp[c] += dp[c - num];
        }
    }
    return dp[target];
}
```

```java
public int countSubsets(int[] nums, int target) {
    int[] dp = new int[target + 1];
    dp[0] = 1;
    for (int num : nums) {
        for (int c = target; c >= num; c--) {
            dp[c] += dp[c - num];
        }
    }
    return dp[target];
}
```

```python
def count_subsets(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for num in nums:
        for c in range(target, num - 1, -1):
            dp[c] += dp[c - num]
    return dp[target]
```

```javascript
function countSubsets(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (const num of nums) {
    for (let c = target; c >= num; c--) {
      dp[c] += dp[c - num];
    }
  }
  return dp[target];
}
```

**Time:** $O(n \times \text{target})$ | **Space:** $O(\text{target})$

---

## Summary

| Pattern | Key Idea | Inner Loop Direction |
|---------|----------|---------------------|
| 0/1 Knapsack | Take or skip each item once | **Reverse** (high → low) |
| Unbounded Knapsack | Items can repeat | **Forward** (low → high) |
| Subset Sum (boolean) | Can we reach target? | Reverse, OR operation |
| Subset Count | How many ways to reach target? | Reverse, addition |
| Partition | Split into two equal halves | Target = sum/2 |

---

Next: **Tries →**
