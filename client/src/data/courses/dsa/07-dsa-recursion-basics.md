---
title: Recursion Basics
---

# Recursion Basics

**Recursion** is a technique where a function calls itself to solve a smaller version of the same problem. It is one of the most powerful tools in DSA — many algorithms (merge sort, tree traversals, dynamic programming) depend on it.

## The anatomy of a recursive function

Every recursive function needs two things:

1. **Base case** — the condition that stops the recursion. Without it, the function calls itself forever (stack overflow).
2. **Recursive case** — the function calls itself with a smaller or simpler input, moving toward the base case.

```
function solve(problem):
    if problem is simple enough:   ← base case
        return answer directly
    else:
        return solve(smaller problem)  ← recursive case
```

## Your first recursive function: factorial

The factorial of n (written n!) is the product of all positive integers up to n:

```
5! = 5 × 4 × 3 × 2 × 1 = 120
```

Notice the pattern: `n! = n × (n-1)!` — the problem reduces to a smaller version of itself.

```cpp
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;       // base case
    return n * factorial(n - 1); // recursive case
}

int main() {
    cout << factorial(5) << endl; // 120
    return 0;
}
```

```java
public class Factorial {
    static int factorial(int n) {
        if (n <= 1) return 1;       // base case
        return n * factorial(n - 1); // recursive case
    }

    public static void main(String[] args) {
        System.out.println(factorial(5)); // 120
    }
}
```

```python
def factorial(n):
    if n <= 1:
        return 1              # base case
    return n * factorial(n - 1)  # recursive case

print(factorial(5))  # 120
```

```javascript
function factorial(n) {
    if (n <= 1) return 1;       // base case
    return n * factorial(n - 1); // recursive case
}

console.log(factorial(5)); // 120
```

## Tracing the call stack

Let's trace `factorial(5)`:

```
factorial(5)
  → 5 * factorial(4)
    → 4 * factorial(3)
      → 3 * factorial(2)
        → 2 * factorial(1)
          → 1  (base case)
        → 2 * 1 = 2
      → 3 * 2 = 6
    → 4 * 6 = 24
  → 5 * 24 = 120
```

Each call waits for the one below it to finish. The calls stack up in memory — this is the **call stack**. The maximum depth here is 5, so the space complexity is O(n).

## Example 2: Sum of an array

```cpp
int arraySum(int arr[], int n) {
    if (n == 0) return 0;                  // base case: empty array
    return arr[n - 1] + arraySum(arr, n - 1); // sum last + rest
}
```

```java
int arraySum(int[] arr, int n) {
    if (n == 0) return 0;                  // base case: empty array
    return arr[n - 1] + arraySum(arr, n - 1); // sum last + rest
}
```

```python
def array_sum(arr, n):
    if n == 0:
        return 0                           # base case: empty array
    return arr[n - 1] + array_sum(arr, n - 1)  # sum last + rest
```

```javascript
function arraySum(arr, n) {
    if (n === 0) return 0;                  // base case: empty array
    return arr[n - 1] + arraySum(arr, n - 1); // sum last + rest
}
```

Time: O(n) — one call per element. Space: O(n) — call stack depth is n.

## Example 3: Fibonacci numbers

The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

Each number is the sum of the two before it: `fib(n) = fib(n-1) + fib(n-2)`

```cpp
int fib(int n) {
    if (n <= 0) return 0;   // base case 1
    if (n == 1) return 1;   // base case 2
    return fib(n - 1) + fib(n - 2); // two recursive calls
}
```

```java
int fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fib(n - 1) + fib(n - 2);
}
```

```python
def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)
```

```javascript
function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
}
```

**Warning:** This naive approach has O(2ⁿ) time complexity because it recalculates the same values many times. `fib(5)` calls `fib(3)` twice, `fib(2)` three times, etc. We will fix this with **memoization** in the next lesson.

## Recursion vs. iteration

Every recursive algorithm can be rewritten as an iterative one (using loops), and vice versa. Recursion is often more elegant and easier to reason about, while iteration is usually more memory-efficient.

### Factorial — iterative version

```cpp
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
// Time: O(n), Space: O(1) — no call stack overhead
```

```java
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

```python
def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
```

```javascript
function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

### When to use recursion

Use recursion when:
- The problem has a natural recursive structure (trees, graphs, divide and conquer).
- The recursive solution is significantly clearer than the iterative one.
- The recursion depth is manageable (won't overflow the stack).

Avoid recursion when:
- A simple loop works and is just as clear.
- The input size could make the call stack very deep (e.g., n = 10⁶).

## Common mistakes

1. **Missing base case** → infinite recursion → stack overflow.
2. **Base case never reached** → the recursive call doesn't reduce the problem.
3. **Not returning the recursive result** → forgetting `return` in front of the recursive call.

## Summary

- Recursion = a function calling itself with a smaller input.
- Every recursive function needs a base case and a recursive case.
- The call stack tracks each pending function call and determines space complexity.
- Recursion is powerful but can be slow (Fibonacci) or use too much memory (deep stacks).

Next: **Recursion Examples →**
