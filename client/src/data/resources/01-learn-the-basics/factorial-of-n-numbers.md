---
time: O(N)
space: O(N)
---

## Overview

Given a positive integer `n`, find its **factorial** — the product of all positive integers from `1` up to `n`.

$$n! = 1 \times 2 \times 3 \times \cdots \times n$$

Two special cases to keep in mind:

- **0! = 1** — this is a mathematical convention (the empty product), and it is the **base case** for the recursive solution.
- **Constraint:** 0 ≤ n ≤ 12, so 12! = 479,001,600, which fits comfortably in a 32-bit signed integer.

Factorial has a beautiful recursive structure: $n! = n \times (n - 1)!$ — the factorial of `n` is just `n` multiplied by the factorial of everything smaller than it. This makes it a textbook problem for recursion.

## Concepts

- **Recursion:** A function that solves a problem by calling a smaller version of itself. Factorial is the canonical example — computing `n!` requires knowing `(n-1)!`, which requires `(n-2)!`, and so on.
  - _Analogy:_ You ask a friend "what is 5 times the price of 4 items?" Your friend asks another friend the price of 4 items... who asks about 3... all the way down to 1 item, which is trivially known. Each person multiplies by their number on the way back.
- **Base Case:** The condition that stops the recursion. For factorial, `n == 0` returns `1`. Without this, the function would call itself forever and crash with a **Stack Overflow**.
- **Call Stack:** The block of memory the computer uses to track paused function calls. Each recursive call to `factorial(n - 1)` occupies a stack frame until it returns. For `n = 12`, there are 13 frames stacked up at most — well within any system limit.
- **Multiplicative Accumulation:** Unlike printing (where we just print a number), here each stack frame multiplies its `n` into the result _as the call stack unwinds_. The final answer bubbles back from the deepest call (`factorial(0) = 1`) all the way to the top.

## Approach

The recursive relation is:

$$\text{factorial}(n) = \begin{cases} 1 & \text{if } n = 0 \\ n \times \text{factorial}(n-1) & \text{otherwise} \end{cases}$$

The algorithm is:

1. **Base Case:** If `n == 0`, return `1`.
2. **Recursive Step:** Return `n * factorial(n - 1)`.

The call stack unwinds like this for `n = 4`:

```
factorial(4)
  → 4 * factorial(3)
       → 3 * factorial(2)
            → 2 * factorial(1)
                 → 1 * factorial(0)
                      → 1   ← base case
                 ← 1 * 1 = 1
            ← 2 * 1 = 2
       ← 3 * 2 = 6
  ← 4 * 6 = 24
```

**Complexity:**

- **Time:** O(N) — we make exactly `n + 1` recursive calls (from `n` down to `0`), each doing O(1) work.
- **Space:** O(N) — the call stack holds `n + 1` active frames simultaneously at peak depth.

## Approach (C++)

In C++, the function lives inside a `Solution` class. The return type is `int` — safe for the given constraint since 12! = 479,001,600 < 2,147,483,647 (max `int`).

We write our base case with `if (n == 0) return 1;`, then return `n * factorial(n - 1)`.

```cpp
// Core logic
if (n == 0) return 1;
return n * factorial(n - 1);
```

**Complexity:**

- **Time:** O(N) — `n + 1` calls, each O(1).
- **Space:** O(N) — `n + 1` frames on the C++ call stack.

## Approach (Java)

In Java, the function is an instance method of the `Solution` class with return type `int`. The logic is identical: base case `if (n == 0) return 1;`, then `return n * factorial(n - 1);`.

Note that for larger `n` values in other problems (not constrained to 12), you would switch to `long` to avoid overflow. Here `int` suffices.

```java
// Core logic
if (n == 0) return 1;
return n * factorial(n - 1);
```

**Complexity:**

- **Time:** O(N) — `n + 1` recursive calls.
- **Space:** O(N) — each call frame lives on the JVM call stack until the base case is hit. For `n ≤ 12`, this is nowhere near Java's default stack limit.

## Approach (Python)

In Python, the method is defined inside a `Solution` class, so the recursive call must use `self.factorial(n - 1)` to invoke the method on the same object.

```python
# Core logic
if n == 0:
    return 1
return n * self.factorial(n - 1)
```

Python has a default recursion depth limit of 1000 frames. For `n ≤ 12`, this is completely safe — we only go 13 frames deep.

**Complexity:**

- **Time:** O(N) — `n + 1` recursive calls.
- **Space:** O(N) — `n + 1` frames on the Python interpreter's call stack.

## Approach (JavaScript)

In JavaScript, the method is inside a `Solution` class, so the recursive call is `this.factorial(n - 1)`. Use `===` for the base-case comparison (strict equality, no type coercion).

```javascript
// Core logic
if (n === 0) return 1;
return n * this.factorial(n - 1);
```

**Complexity:**

- **Time:** O(N) — `n + 1` calls.
- **Space:** O(N) — `n + 1` execution context frames on the V8 call stack.

## Solution

```cpp
class Solution {
  public:
    int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
};
```

```java
class Solution {
    // Function to calculate factorial of a number.
    int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
}
```

```python
class Solution:
    # Function to calculate factorial of a number.
    def factorial(self, n: int) -> int:
        if n == 0:
            return 1
        return n * self.factorial(n - 1)
```

```javascript
class Solution {
  /**
   * @param {number} n
   * @returns {number}
   */
  factorial(n) {
    if (n === 0) return 1;
    return n * this.factorial(n - 1);
  }
}
```
