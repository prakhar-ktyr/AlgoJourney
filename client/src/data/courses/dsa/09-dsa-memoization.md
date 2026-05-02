---
title: Memoization
---

# Memoization

**Memoization** is an optimization technique that stores the results of expensive function calls and returns the cached result when the same input occurs again. It turns exponential recursive algorithms into polynomial ones.

## The problem: redundant computation

Recall the naive Fibonacci:

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2) ← computed here
│   │   └── fib(1)
│   └── fib(2)     ← and again here!
└── fib(3)         ← and fib(3) again!
    ├── fib(2)     ← and fib(2) again!
    └── fib(1)
```

`fib(2)` is calculated 3 times, `fib(3)` is calculated 2 times. For `fib(50)`, the naive approach makes over 10¹⁰ calls — it would take minutes or hours. With memoization, it makes exactly 50 calls.

## How memoization works

1. Before computing, check if the result is already in a cache (hash map or array).
2. If yes, return the cached result immediately — O(1).
3. If no, compute it, store it in the cache, and return it.

## Fibonacci with memoization

```cpp
#include <iostream>
#include <unordered_map>
using namespace std;

unordered_map<int, long long> memo;

long long fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    if (memo.count(n)) return memo[n];  // check cache
    memo[n] = fib(n - 1) + fib(n - 2); // store result
    return memo[n];
}

int main() {
    cout << fib(50) << endl; // 12586269025 — instant!
    return 0;
}
```

```java
import java.util.HashMap;

public class Fibonacci {
    static HashMap<Integer, Long> memo = new HashMap<>();

    static long fib(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        if (memo.containsKey(n)) return memo.get(n);
        long result = fib(n - 1) + fib(n - 2);
        memo.put(n, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(fib(50)); // 12586269025
    }
}
```

```python
memo = {}

def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(50))  # 12586269025

# Python shortcut: use @functools.lru_cache
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib_cached(n - 1) + fib_cached(n - 2)
```

```javascript
const memo = {};

function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (n in memo) return memo[n];
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

console.log(fib(50)); // 12586269025
```

### Complexity comparison

| Approach | Time | Space |
|---|---|---|
| Naive recursion | O(2ⁿ) | O(n) stack |
| Memoized recursion | O(n) | O(n) cache + O(n) stack |

## Using an array instead of a hash map

When the input is a small integer range, an array is faster than a hash map:

```cpp
#include <vector>
using namespace std;

long long fib(int n, vector<long long>& dp) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    if (dp[n] != -1) return dp[n];
    dp[n] = fib(n - 1, dp) + fib(n - 2, dp);
    return dp[n];
}
// Usage: vector<long long> dp(n + 1, -1); fib(n, dp);
```

```java
long fib(int n, long[] dp) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    if (dp[n] != -1) return dp[n];
    dp[n] = fib(n - 1, dp) + fib(n - 2, dp);
    return dp[n];
}
// Usage: long[] dp = new long[n + 1]; Arrays.fill(dp, -1); fib(n, dp);
```

```python
def fib(n, dp):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    if dp[n] != -1:
        return dp[n]
    dp[n] = fib(n - 1, dp) + fib(n - 2, dp)
    return dp[n]

# Usage: dp = [-1] * (n + 1); fib(n, dp)
```

```javascript
function fib(n, dp) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (dp[n] !== -1) return dp[n];
    dp[n] = fib(n - 1, dp) + fib(n - 2, dp);
    return dp[n];
}
// Usage: const dp = new Array(n + 1).fill(-1); fib(n, dp);
```

## Memoization vs. tabulation

There are two approaches to dynamic programming:

| | Memoization (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Direction | Start from the full problem, recurse down | Start from base cases, build up |
| Implementation | Recursive + cache | Iterative + array |
| Stack usage | O(n) recursion depth | No recursion overhead |
| Computes | Only subproblems that are needed | All subproblems |

### Fibonacci — tabulation (bottom-up)

```cpp
long long fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    long long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
// Time: O(n), Space: O(1) — no array needed!
```

```java
long fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

```javascript
function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    let prev2 = 0, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        const curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

## Another example: climbing stairs

You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?

This is Fibonacci in disguise: `ways(n) = ways(n-1) + ways(n-2)`.

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

## When to use memoization

Ask yourself:
1. Does the problem have **overlapping subproblems**? (Same inputs computed repeatedly)
2. Does it have **optimal substructure**? (Optimal solution built from optimal sub-solutions)

If both are true, memoization (or tabulation) will likely give a dramatic speedup. We will study dynamic programming in full depth later in the course.

## Summary

- Memoization caches results of function calls to avoid redundant computation.
- It transforms exponential recursion (O(2ⁿ)) into polynomial time (O(n)).
- Use a hash map for flexible keys or an array for integer-indexed subproblems.
- Tabulation (bottom-up) avoids recursion overhead and can sometimes reduce space.

Next: **Arrays Introduction →**
