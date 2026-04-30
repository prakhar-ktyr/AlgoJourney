---
id: 18
time: O(N)
space: O(1)
---

## Overview
In this problem, we are given a number `n`. For every number `i` from `1` to `n`, we need to find all of its divisors, sum them up, and then add all these sums together. 

For example, if `n = 4`:
* Divisors of 1: `1` (Sum = 1)
* Divisors of 2: `1, 2` (Sum = 3)
* Divisors of 3: `1, 3` (Sum = 4)
* Divisors of 4: `1, 2, 4` (Sum = 7)
* **Total Answer:** $1 + 3 + 4 + 7 = 15$.

## Concepts
* **Divisors (Factors):** A number `d` is a divisor of `i` if `i` can be divided by `d` without any remainder (i.e., `i % d == 0`).
* **Brute Force vs. Changing Perspective:** The intuitive way to solve this is to look at each number and ask, *"What are your divisors?"* However, a powerful mathematical concept called the **Contribution Technique** flips the question. We instead ask each potential divisor, *"How many numbers do you divide?"* * **The Contribution Technique Analogy:** Imagine you want to find the total wages paid in a factory. You could go to every worker and ask how much they made (Brute Force). OR, you could look at the standard shift pay ($100), count how many shifts were worked total, and multiply them. Grouping by the "multiplier" rather than the "individual" is much faster!

## Approach

**Approach 1: Brute Force (Finding divisors for each number)**
We can run a loop from `1` to `n`. For each number `i`, we run an inner loop to find its divisors. To optimize slightly, we don't need to check all numbers up to `i`; we only need to check up to the square root of `i` ($\sqrt{i}$), because divisors come in pairs (e.g., for 12, $2 \times 6$, both 2 and 6 are found if we check up to 3).
* **Time Complexity:** $O(N \sqrt{N})$. The outer loop runs $N$ times, and the inner loop runs up to $\sqrt{N}$ times. For $N = 10^5$, this takes roughly $3 \times 10^7$ operations, which is slow but might just pass.
* **Space Complexity:** $O(1)$. We only use a few integer variables to keep track of our sum.

**Approach 2: The Contribution Technique (Optimized)**
Instead of calculating the sum of divisors for each number, let's look at how many times a specific number acts as a divisor across *all* numbers from `1` to `n`.
* The number `1` divides every single number. So, in the range from `1` to `n`, `1` appears as a divisor `n / 1` times.
* The number `2` divides every even number (2, 4, 6...). It appears as a divisor `n / 2` times.
* Generally, any number `i` appears as a divisor exactly `n / i` times (ignoring the remainder).
* Therefore, the total contribution of the number `i` to our final grand total is simply `i * (n / i)`. We just need one single loop from `1` to `n` summing this up!
* **Time Complexity:** $O(N)$. We only loop from `1` to `n` exactly once, doing a basic $O(1)$ math calculation inside. This is incredibly fast!
* **Space Complexity:** $O(1)$. No arrays or extra memory needed.

---

## Approach (C++)

This section covers C++ specific details for solving the problem.

**Approach 1: Brute Force**
You can use a `for` loop to iterate through each number, and a helper function to find the divisors up to `sqrt(i)`. Since the sum of divisors for $N = 10^5$ can reach around $10^{10}$, which exceeds the 32-bit limit of a standard `int` (approx. $2 \times 10^9$), we **must** use `long long` for our sum variable.
```cpp
long long totalSum = 0;
for(int i = 1; i <= n; i++) {
    // Helper logic to add divisors of i to totalSum
}
```
* **Time Complexity:** $O(N \sqrt{N})$ because of the nested divisor-checking loop.
* **Space Complexity:** $O(1)$ as we only maintain numeric accumulators.

**Approach 2: Contribution Technique**
Using the mathematical trick, we loop `i` from `1` to `n`. At each step, we calculate `i * (n / i)` and add it to a `long long` sum. C++ integer division `/` automatically drops the decimal, matching our required logic perfectly.
```cpp
long long sum = 0;
for (long long i = 1; i <= n; i++) {
    sum += i * (n / i);
}
```
* **Time Complexity:** $O(N)$. A single loop runs exactly $N$ times.
* **Space Complexity:** $O(1)$. Only `sum` and `i` variables are allocated.

---

## Approach (Java)

This section covers Java specific details for solving the problem.

**Approach 1: Brute Force**
We iterate from `1` to `n` and calculate the divisors for each number. In Java, standard integers max out around $2.14 \times 10^9$. The maximum sum for this problem is roughly $10^{10}$, so we must use the `long` data type to prevent a silent integer overflow bug.
```java
long totalSum = 0;
for (int i = 1; i <= n; i++) {
    // Helper logic to find and add divisors
}
```
* **Time Complexity:** $O(N \sqrt{N})$ due to the nested loop for finding divisors.
* **Space Complexity:** $O(1)$, only using primitive `long` variables.

**Approach 2: Contribution Technique**
The template provides `long n` as the parameter. We use a single loop. Java's division operator `/` behaves as integer division when both operands are integers/longs, truncating the remainder. We accumulate the result of `i * (n / i)`.
```java
long sum = 0;
for (long i = 1; i <= n; i++) {
    sum += i * (n / i);
}
```
* **Time Complexity:** $O(N)$. One loop iterates exactly $N$ times.
* **Space Complexity:** $O(1)$, safely operating within constant memory limits.

---

## Approach (Python)

This section covers Python specific details for solving the problem.

**Approach 1: Brute Force**
We can use a `for` loop to check each number up to `n`, and another loop to find its divisors up to its square root. Python automatically handles arbitrarily large integers, so we don't need to worry about the 32-bit limits that C++ and Java face.
```python
total_sum = 0
for i in range(1, n + 1):
    # inner loop up to int(i**0.5) to find divisors
```
* **Time Complexity:** $O(N \sqrt{N})$. Python loops are relatively slow, so this approach might cause a Time Limit Exceeded (TLE) error on strict platforms.
* **Space Complexity:** $O(1)$.

**Approach 2: Contribution Technique**
This approach is exceptionally clean in Python. We loop `i` from `1` to `n`. To ensure we do integer division (dropping any decimals), we must use the floor division operator `//`. 
```python
total = 0
for i in range(1, n + 1):
    total += i * (n // i)
```
* **Time Complexity:** $O(N)$. We run a single `range` loop of size $N$.
* **Space Complexity:** $O(1)$ memory usage.

---

## Approach (JavaScript)

This section covers JavaScript specific details for solving the problem.

**Approach 1: Brute Force**
We iterate through all numbers, checking for divisors. JavaScript numbers are double-precision 64-bit floats, which can safely represent exact integers up to $9 \times 10^{15}$ (`Number.MAX_SAFE_INTEGER`). Since our max sum is roughly $10^{10}$, standard numbers are safe to use without needing `BigInt`.
```javascript
let totalSum = 0;
for (let i = 1; i <= n; i++) {
    // nested loop for divisors
}
```
* **Time Complexity:** $O(N \sqrt{N})$ due to the nested calculation.
* **Space Complexity:** $O(1)$.

**Approach 2: Contribution Technique**
Because JavaScript division `/` returns floating-point numbers (e.g., `5 / 2 = 2.5`), we must explicitly truncate the result to act like integer division. We can use `Math.floor()` for this. We then multiply the truncated count by `i` and add it to our total.
```javascript
let sum = 0;
for (let i = 1; i <= n; i++) {
    sum += i * Math.floor(n / i);
}
```
* **Time Complexity:** $O(N)$. Exactly $N$ iterations in a single loop.
* **Space Complexity:** $O(1)$ as we only allocate a standard `Number` variable for the sum.

---

## Solution: Contribution Technique (Optimized)
Time: $O(N)$
Space: $O(1)$

```cpp
class Solution {
  public:
    long long sumOfDivisors(long long n) {
        long long sum = 0;
        
        // Each number 'i' acts as a divisor for 'n / i' numbers.
        // Therefore, it contributes 'i * (n / i)' to the total sum.
        for (long long i = 1; i <= n; i++) {
            sum += i * (n / i);
        }
        
        return sum;
    }
};
```

```java
class Solution {
    public static long sumOfDivisors(long n) {
        long sum = 0;
        
        // Each number 'i' acts as a divisor for 'n / i' numbers.
        // Therefore, it contributes 'i * (n / i)' to the total sum.
        for (long i = 1; i <= n; i++) {
            sum += i * (n / i);
        }
        
        return sum;
    }
}
```

```python
class Solution:
    def sumOfDivisors(self, n: int) -> int:
        total_sum = 0
        
        # Each number 'i' acts as a divisor for 'n // i' numbers.
        # Therefore, it contributes 'i * (n // i)' to the total sum.
        for i in range(1, n + 1):
            total_sum += i * (n // i)
            
        return total_sum
```

```javascript
/**
 * @param {number} n
 * @returns {number}
 */
class Solution {
    sumOfDivisors(n) {
        let sum = 0;
        
        // Each number 'i' acts as a divisor for Math.floor(n / i) numbers.
        // Therefore, it contributes 'i * Math.floor(n / i)' to the total sum.
        for (let i = 1; i <= n; i++) {
            sum += i * Math.floor(n / i);
        }
        
        return sum;
    }
}
```

## Solution: Brute Force
Time: $O(N \sqrt{N})$
Space: $O(1)$

```cpp
class Solution {
  public:
    long long sumOfDivisors(long long n) {
        long long totalSum = 0;
        
        for (long long i = 1; i <= n; i++) {
            long long currentSum = 0;
            // Find divisors up to the square root of i
            for (long long j = 1; j * j <= i; j++) {
                if (i % j == 0) {
                    currentSum += j;
                    // Add the paired divisor if it's different
                    if (j * j != i) {
                        currentSum += (i / j);
                    }
                }
            }
            totalSum += currentSum;
        }
        
        return totalSum;
    }
};
```

```java
class Solution {
    public static long sumOfDivisors(long n) {
        long totalSum = 0;
        
        for (long i = 1; i <= n; i++) {
            long currentSum = 0;
            // Find divisors up to the square root of i
            for (long j = 1; j * j <= i; j++) {
                if (i % j == 0) {
                    currentSum += j;
                    // Add the paired divisor if it's different
                    if (j * j != i) {
                        currentSum += (i / j);
                    }
                }
            }
            totalSum += currentSum;
        }
        
        return totalSum;
    }
}
```

```python
class Solution:
    def sumOfDivisors(self, n: int) -> int:
        total_sum = 0
        
        for i in range(1, n + 1):
            current_sum = 0
            # Find divisors up to the square root of i
            j = 1
            while j * j <= i:
                if i % j == 0:
                    current_sum += j
                    # Add the paired divisor if it's different
                    if j * j != i:
                        current_sum += (i // j)
                j += 1
            total_sum += current_sum
            
        return total_sum
```

```javascript
/**
 * @param {number} n
 * @returns {number}
 */
class Solution {
    sumOfDivisors(n) {
        let totalSum = 0;
        
        for (let i = 1; i <= n; i++) {
            let currentSum = 0;
            // Find divisors up to the square root of i
            for (let j = 1; j * j <= i; j++) {
                if (i % j === 0) {
                    currentSum += j;
                    // Add the paired divisor if it's different
                    if (j * j !== i) {
                        currentSum += Math.floor(i / j);
                    }
                }
            }
            totalSum += currentSum;
        }
        
        return totalSum;
    }
}
```