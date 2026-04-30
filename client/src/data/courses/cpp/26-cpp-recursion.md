---
title: C++ Recursion
---

# C++ Recursion

A **recursive** function is one that calls itself. Recursion expresses problems that have a smaller instance of the same problem inside them.

Every recursive function needs:

1. A **base case** — when to stop.
2. A **recursive case** — how to reduce the problem and call itself.

## Factorial

```cpp
int factorial(int n) {
    if (n <= 1) return 1;          // base case
    return n * factorial(n - 1);    // recursive case
}
```

Each call sits on the call stack until the base case returns; results then unwind back up.

## Fibonacci (and why naïve recursion is slow)

```cpp
int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

This recomputes the same values exponentially many times. Add **memoisation** or convert to iteration:

```cpp
#include <vector>

int fib(int n) {
    std::vector<int> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; ++i)
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}
```

## Tail recursion

When the recursive call is the **last** thing the function does, some compilers turn it into a loop (no stack growth). C++ does not guarantee this optimisation, but writing tail-recursive helpers is still a clean style:

```cpp
int factorialHelp(int n, int acc) {
    if (n <= 1) return acc;
    return factorialHelp(n - 1, acc * n);     // tail call
}

int factorial(int n) { return factorialHelp(n, 1); }
```

## Recursion on data structures

Recursion shines for trees, linked lists, and divide-and-conquer algorithms.

### Sum a linked list

```cpp
struct Node { int value; Node* next; };

int sum(Node* head) {
    if (!head) return 0;
    return head->value + sum(head->next);
}
```

### Binary search

```cpp
int binarySearch(const std::vector<int>& a, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] <  target) return binarySearch(a, target, mid + 1, hi);
    return binarySearch(a, target, lo, mid - 1);
}
```

## Stack overflow

Deep recursion (10⁵+ on most systems) can blow the call stack. Convert to iteration with an explicit stack, or use loops, when input depth is unbounded.

## Putting it together

```cpp
#include <iostream>
#include <string>

bool isPalindrome(const std::string& s, int lo, int hi) {
    if (lo >= hi) return true;
    if (s[lo] != s[hi]) return false;
    return isPalindrome(s, lo + 1, hi - 1);
}

int main() {
    for (auto w : {"racecar", "hello", "level", "world"}) {
        std::cout << w << " -> "
                  << std::boolalpha
                  << isPalindrome(w, 0, std::string(w).size() - 1)
                  << '\n';
    }
}
```

Next: [C++ Lambdas](#).
