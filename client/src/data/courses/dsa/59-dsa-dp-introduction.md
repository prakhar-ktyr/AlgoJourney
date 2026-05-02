---
title: "DP Introduction"
---

# DP Introduction

**Dynamic Programming (DP)** is an optimization technique that solves complex problems by breaking them into overlapping sub-problems, solving each sub-problem only once, and storing the result for future use. It applies when a problem has:

1. **Optimal Substructure** — an optimal solution can be constructed from optimal solutions of its sub-problems.
2. **Overlapping Sub-problems** — the same sub-problems are solved multiple times in a naive recursive approach.

---

## Memoization vs Tabulation

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| Direction | Starts from the original problem, recurses down | Starts from the smallest sub-problem, builds up |
| Implementation | Recursion + cache (hash map / array) | Iterative + DP table |
| Computation | Only solves sub-problems that are actually needed | Solves all sub-problems in order |
| Stack overhead | May hit recursion limit for large inputs | No recursion; constant stack usage |

---

## Example: Fibonacci Numbers

The Fibonacci sequence is defined as:

$$
F(n) = F(n-1) + F(n-2), \quad F(0)=0,\; F(1)=1
$$

A naive recursive solution has exponential time $O(2^n)$ because it recomputes the same values repeatedly. DP reduces this to $O(n)$ time and $O(n)$ (or even $O(1)$) space.

### Naive Recursion (Exponential)

```cpp
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

### Approach 1 — Memoization (Top-Down)

We cache results in an array so each sub-problem is computed only once.

```cpp
#include <vector>
using namespace std;

int fibMemo(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

int fib(int n) {
    vector<int> memo(n + 1, -1);
    return fibMemo(n, memo);
}
```

```java
import java.util.Arrays;

public class Fibonacci {
    public static int fib(int n) {
        int[] memo = new int[n + 1];
        Arrays.fill(memo, -1);
        return fibMemo(n, memo);
    }

    private static int fibMemo(int n, int[] memo) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n];
        memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
        return memo[n];
    }
}
```

```python
def fib(n, memo={}):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

```javascript
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}
```

**Time:** $O(n)$ — each state computed once  
**Space:** $O(n)$ — memo array + recursion stack

---

### Approach 2 — Tabulation (Bottom-Up)

Build the answer iteratively from base cases.

```cpp
int fib(int n) {
    if (n <= 1) return n;
    vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```

```java
public static int fib(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```

```python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

```javascript
function fib(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

**Time:** $O(n)$  
**Space:** $O(n)$

---

### Approach 3 — Space-Optimized Tabulation

Since each state depends only on the previous two, we can reduce space to $O(1)$.

```cpp
int fib(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```java
public static int fib(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def fib(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

```javascript
function fib(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Time:** $O(n)$  
**Space:** $O(1)$

---

## When to Use DP

Ask yourself:

1. Can I express the answer in terms of answers to smaller instances of the same problem? → **Optimal substructure**
2. Will a recursive solution re-solve the same inputs? → **Overlapping sub-problems**

If both are true, DP will likely give a polynomial-time solution.

---

## Steps to Solve a DP Problem

1. **Define the state** — What does `dp[i]` (or `dp[i][j]`) represent?
2. **Write the recurrence** — How does `dp[i]` relate to smaller states?
3. **Identify base cases** — What are the trivially known values?
4. **Decide direction** — Top-down (memo) or bottom-up (tabulation)?
5. **Optimize space** — Can you reduce the DP table dimensions?

---

Next: **DP — 1D Problems →**
