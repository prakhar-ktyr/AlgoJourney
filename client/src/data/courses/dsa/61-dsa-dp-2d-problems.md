---
title: "DP — 2D Problems"
---

# DP — 2D Problems

2D DP problems require a table `dp[i][j]` where two indices capture the state — typically two string positions, grid coordinates, or interval boundaries. We'll cover three classics: Unique Paths, Longest Common Subsequence (LCS), and Edit Distance.

---

## 1. Unique Paths

**Problem:** Given an `m × n` grid, find the number of unique paths from the top-left corner to the bottom-right corner. You can only move right or down.

**State:** `dp[i][j]` = number of paths to reach cell `(i, j)`  
**Recurrence:** `dp[i][j] = dp[i-1][j] + dp[i][j-1]`  
**Base:** `dp[0][j] = 1` (first row), `dp[i][0] = 1` (first column)

```cpp
#include <vector>
using namespace std;

int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}
```

```java
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}
```

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]
```

```javascript
function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}
```

**Time:** $O(m \times n)$ | **Space:** $O(m \times n)$

### Space Optimization

Since each row depends only on the current and previous row, we can use a single 1D array:

```cpp
int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}
```

```java
public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}
```

```python
def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[-1]
```

```javascript
function uniquePaths(m, n) {
  const dp = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }
  return dp[n - 1];
}
```

**Space:** $O(n)$

---

## 2. Longest Common Subsequence (LCS)

**Problem:** Given two strings `text1` and `text2`, find the length of their longest common subsequence.

A subsequence maintains relative order but not necessarily contiguity. For example, `"ace"` is a subsequence of `"abcde"`.

**State:** `dp[i][j]` = LCS length of `text1[0..i-1]` and `text2[0..j-1]`  
**Recurrence:**

$$
dp[i][j] = \begin{cases}
dp[i-1][j-1] + 1 & \text{if } \text{text1}[i-1] = \text{text2}[j-1] \\
\max(dp[i-1][j],\; dp[i][j-1]) & \text{otherwise}
\end{cases}
$$

**Base:** `dp[0][j] = 0`, `dp[i][0] = 0`

```cpp
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size(), n = text2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

```java
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

```python
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

```javascript
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}
```

**Time:** $O(m \times n)$ | **Space:** $O(m \times n)$ (reducible to $O(\min(m, n))$)

### Printing the LCS

Backtrack from `dp[m][n]` to reconstruct the subsequence:

```python
def print_lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # Backtrack
    i, j = m, n
    lcs = []
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            lcs.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(lcs))
```

---

## 3. Edit Distance (Levenshtein Distance)

**Problem:** Given two strings `word1` and `word2`, find the minimum number of operations (insert, delete, replace) to convert `word1` into `word2`.

**State:** `dp[i][j]` = min edits to convert `word1[0..i-1]` → `word2[0..j-1]`  
**Recurrence:**

$$
dp[i][j] = \begin{cases}
dp[i-1][j-1] & \text{if } \text{word1}[i-1] = \text{word2}[j-1] \\
1 + \min(dp[i-1][j],\; dp[i][j-1],\; dp[i-1][j-1]) & \text{otherwise}
\end{cases}
$$

Where the three options represent delete, insert, and replace respectively.

**Base:** `dp[i][0] = i` (delete all), `dp[0][j] = j` (insert all)

```cpp
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
    }
    return dp[m][n];
}
```

```java
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j - 1],
                    Math.min(dp[i - 1][j], dp[i][j - 1])
                );
            }
        }
    }
    return dp[m][n];
}
```

```python
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete
                    dp[i][j - 1],      # insert
                    dp[i - 1][j - 1],  # replace
                )
    return dp[m][n]
```

```javascript
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1],
          dp[i - 1][j],
          dp[i][j - 1]
        );
      }
    }
  }
  return dp[m][n];
}
```

**Time:** $O(m \times n)$ | **Space:** $O(m \times n)$ (reducible to $O(n)$)

---

## Space Optimization for 2D DP

A common pattern: if `dp[i][j]` depends only on row `i` and row `i-1`, keep just two rows (or even one row updated left-to-right with a saved diagonal value).

```python
# Edit Distance — O(n) space
def min_distance_optimized(word1, word2):
    m, n = len(word1), len(word2)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        curr = [i] + [0] * n
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j - 1], prev[j], curr[j - 1])
        prev = curr
    return prev[n]
```

---

## Summary

| Problem | Dimensions | Time | Space |
|---------|-----------|------|-------|
| Unique Paths | grid `m × n` | $O(mn)$ | $O(n)$ optimized |
| LCS | two strings `m`, `n` | $O(mn)$ | $O(mn)$ / $O(n)$ |
| Edit Distance | two strings `m`, `n` | $O(mn)$ | $O(mn)$ / $O(n)$ |

---

Next: **DP — Classic Patterns →**
