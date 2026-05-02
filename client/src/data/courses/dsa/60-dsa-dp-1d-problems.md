---
title: "DP — 1D Problems"
---

# DP — 1D Problems

1D DP problems have a single-dimensional state — typically `dp[i]` representing the answer for the first `i` elements or for value `i`. We'll cover four classic problems: Climbing Stairs, House Robber, Coin Change, and Longest Increasing Subsequence (LIS).

---

## 1. Climbing Stairs

**Problem:** You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?

**State:** `dp[i]` = number of ways to reach step `i`  
**Recurrence:** `dp[i] = dp[i-1] + dp[i-2]`  
**Base cases:** `dp[0] = 1, dp[1] = 1`

```cpp
int climbStairs(int n) {
    if (n <= 1) return 1;
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```java
public int climbStairs(int n) {
    if (n <= 1) return 1;
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def climb_stairs(n):
    if n <= 1:
        return 1
    prev2, prev1 = 1, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

```javascript
function climbStairs(n) {
  if (n <= 1) return 1;
  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Time:** $O(n)$ | **Space:** $O(1)$

---

## 2. House Robber

**Problem:** Given an array `nums` where `nums[i]` is the money at house `i`, find the maximum money you can rob without robbing two adjacent houses.

**State:** `dp[i]` = max money robbing from houses `0..i`  
**Recurrence:** `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`  
**Base cases:** `dp[0] = nums[0]`, `dp[1] = max(nums[0], nums[1])`

The intuition: at each house, either skip it (take `dp[i-1]`) or rob it (add `nums[i]` to the best up to two houses back).

```cpp
#include <vector>
#include <algorithm>
using namespace std;

int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;
    if (n == 1) return nums[0];
    int prev2 = nums[0];
    int prev1 = max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        int curr = max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```java
public int rob(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;
    if (n == 1) return nums[0];
    int prev2 = nums[0];
    int prev1 = Math.max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def rob(nums):
    n = len(nums)
    if n == 0:
        return 0
    if n == 1:
        return nums[0]
    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    for i in range(2, n):
        curr = max(prev1, prev2 + nums[i])
        prev2 = prev1
        prev1 = curr
    return prev1
```

```javascript
function rob(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  for (let i = 2; i < n; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Time:** $O(n)$ | **Space:** $O(1)$

---

## 3. Coin Change

**Problem:** Given coin denominations `coins` and a target `amount`, find the minimum number of coins needed to make that amount. Return `-1` if impossible.

**State:** `dp[a]` = minimum coins to make amount `a`  
**Recurrence:** `dp[a] = min(dp[a - coin] + 1)` for each `coin` in `coins`  
**Base case:** `dp[0] = 0`

```cpp
#include <vector>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1); // "infinity"
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a) {
                dp[a] = min(dp[a], dp[a - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

```java
import java.util.Arrays;

public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a) {
                dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

```python
def coin_change(coins, amount):
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1
```

```javascript
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}
```

**Time:** $O(\text{amount} \times |\text{coins}|)$ | **Space:** $O(\text{amount})$

---

## 4. Longest Increasing Subsequence (LIS)

**Problem:** Given an array `nums`, find the length of the longest strictly increasing subsequence.

### Approach A — $O(n^2)$ DP

**State:** `dp[i]` = length of the LIS ending at index `i`  
**Recurrence:** `dp[i] = max(dp[j] + 1)` for all `j < i` where `nums[j] < nums[i]`  
**Base:** every element is a subsequence of length 1

```cpp
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    int ans = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        ans = max(ans, dp[i]);
    }
    return ans;
}
```

```java
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int ans = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        ans = Math.max(ans, dp[i]);
    }
    return ans;
}
```

```python
def length_of_lis(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
```

```javascript
function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}
```

**Time:** $O(n^2)$ | **Space:** $O(n)$

### Approach B — $O(n \log n)$ with Patience Sorting

Maintain a `tails` array where `tails[i]` is the smallest tail element for an increasing subsequence of length `i+1`. Use binary search to find the position to update.

```cpp
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int num : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), num);
        if (it == tails.end()) {
            tails.push_back(num);
        } else {
            *it = num;
        }
    }
    return tails.size();
}
```

```java
import java.util.ArrayList;
import java.util.Collections;

public int lengthOfLIS(int[] nums) {
    ArrayList<Integer> tails = new ArrayList<>();
    for (int num : nums) {
        int pos = Collections.binarySearch(tails, num);
        if (pos < 0) pos = -(pos + 1);
        if (pos == tails.size()) {
            tails.add(num);
        } else {
            tails.set(pos, num);
        }
    }
    return tails.size();
}
```

```python
from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for num in nums:
        pos = bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)
```

```javascript
function lengthOfLIS(nums) {
  const tails = [];
  for (const num of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }
  return tails.length;
}
```

**Time:** $O(n \log n)$ | **Space:** $O(n)$

---

## Summary

| Problem | State | Time | Space |
|---------|-------|------|-------|
| Climbing Stairs | `dp[i]` = ways to step `i` | $O(n)$ | $O(1)$ |
| House Robber | `dp[i]` = max profit through house `i` | $O(n)$ | $O(1)$ |
| Coin Change | `dp[a]` = min coins for amount `a` | $O(a \cdot c)$ | $O(a)$ |
| LIS | `dp[i]` = LIS ending at `i` | $O(n^2)$ / $O(n \log n)$ | $O(n)$ |

---

Next: **DP — 2D Problems →**
