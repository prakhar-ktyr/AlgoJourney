---
id: 19
time: O(sqrt(n))
space: O(1)
---

## Overview
A **prime number** is a number greater than 1 that can only be divided evenly by 1 and itself. In this problem, you are given a number `n`, and you need to determine if it is a prime number. 

For example:
* `7` is prime because its only divisors are `1` and `7`.
* `25` is not prime because it can be divided by `5`.
* `1` is explicitly defined in mathematics as **not prime**.

Given the constraint that $n$ can be up to $10^9$, finding an efficient way to check for divisors is critical.

## Concepts
* **Modulo Operator (`%`):** The easiest way to check if a number divides evenly into another is to use the modulo operator. If `n % i == 0`, it means `i` is a divisor of `n` (there is no remainder).
* **Factor Pairs (The Core Trick):** Factors always come in pairs. Consider the number `36`. Its factor pairs are:
  * $1 \times 36 = 36$
  * $2 \times 18 = 36$
  * $3 \times 12 = 36$
  * $4 \times 9 = 36$
  * $6 \times 6 = 36$
  Notice that after $6 \times 6$ (which is $\sqrt{36}$), the factors just flip ($9 \times 4$, $12 \times 3$). **If a number has a divisor greater than its square root, it MUST also have a corresponding divisor smaller than its square root.** Therefore, we only need to search for divisors up to the square root of $n$.

## Approach

**Approach 1: Brute Force (Checking all numbers)**
The most intuitive approach is to check every single number from `2` up to `n - 1` to see if it perfectly divides `n`. If we find even one number that divides `n`, we immediately know `n` is not prime. If we check them all and find none, `n` is prime.
* **Time Complexity:** $O(N)$. In the worst case (when $n$ is prime), we have to loop $n - 2$ times. If $n = 10^9$, this means roughly one billion operations. In most competitive programming environments, this will cause a Time Limit Exceeded (TLE) error.
* **Space Complexity:** $O(1)$. We only use a loop counter variable.

**Approach 2: Optimized (Square Root Approach)**
Using the "Factor Pairs" concept mentioned above, we only need to check numbers from `2` up to $\sqrt{n}$. If we don't find any divisors by the time we hit the square root, we can confidently say the number is prime.
* **Time Complexity:** $O(\sqrt{N})$. The loop stops at the square root of $n$. For $n = 10^9$, the square root is roughly $31,622$. We just reduced our worst-case scenario from 1,000,000,000 operations to 31,622 operations—a massive performance boost!
* **Space Complexity:** $O(1)$ because we are only evaluating a single integer and running a loop. Memory usage does not scale with the size of $n$.

---

## Approach (C++)

This section covers the C++ specific implementation for both approaches.

**Approach 1: Brute Force**
We handle the edge case for $n \le 1$ immediately. Then we run a standard `for` loop up to `n - 1`.
```cpp
if (n <= 1) return false;
for (int i = 2; i < n; i++) {
    if (n % i == 0) return false;
}
return true;
```
* **Time Complexity:** $O(N)$
* **Space Complexity:** $O(1)$

**Approach 2: Optimized (Square Root Approach)**
Instead of calculating `sqrt(n)` which can introduce floating-point precision issues and requires the `<cmath>` library, we can elegantly express the loop condition as `i * i <= n`. 

*Expert Tip:* You might wonder if `i * i` can cause an integer overflow. Since the maximum $n$ is $10^9$, the loop stops when $i \approx 31,622$. $31,622 \times 31,622 \approx 10^9$, which safely fits inside a standard 32-bit signed `int` (which maxes out at $\approx 2 \times 10^9$). Thus, `i * i <= n` is perfectly safe here.
```cpp
if (n <= 1) return false;
for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) return false;
}
return true;
```
* **Time Complexity:** $O(\sqrt{N})$
* **Space Complexity:** $O(1)$

---

## Approach (Java)

This section covers the Java specific implementation for both approaches.

**Approach 1: Brute Force**
We check if $n \le 1$ to return `false`, as `1` is not a prime number. Then, we loop from `2` to `n - 1`. If `n % i == 0`, we found a divisor and return `false`.
```java
if (n <= 1) return false;
for (int i = 2; i < n; i++) {
    if (n % i == 0) return false;
}
return true;
```
* **Time Complexity:** $O(N)$
* **Space Complexity:** $O(1)$

**Approach 2: Optimized (Square Root Approach)**
To avoid the overhead of `Math.sqrt()`, we modify our loop condition to `i * i <= n`. Because Java's `int` can hold up to $2,147,483,647$, and our constraint for $n$ is $10^9$, the maximum value `i` will reach is $\approx 31,622$. The product $31,622^2$ is roughly $10^9$, meaning `i * i` will never overflow the `int` limit. 
```java
if (n <= 1) return false;
for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) return false;
}
return true;
```
* **Time Complexity:** $O(\sqrt{N})$
* **Space Complexity:** $O(1)$

---

## Approach (Python)

This section covers the Python specific implementation for both approaches.

**Approach 1: Brute Force**
We use a `for` loop with the `range()` function. Python handles the iteration automatically. If `n` is `1` or less, we return `False`.
```python
if n <= 1: return False
for i in range(2, n):
    if n % i == 0: return False
return True
```
* **Time Complexity:** $O(N)$
* **Space Complexity:** $O(1)$

**Approach 2: Optimized (Square Root Approach)**
In Python, checking `i * i <= n` in a `while` loop is valid, but using a `for` loop with `range()` is much faster due to how Python's internal C-engine is optimized. We calculate the integer square root using `int(n**0.5)` and add `1` because the `range()` end limit is exclusive.
```python
if n <= 1: return False
limit = int(n**0.5) + 1
for i in range(2, limit):
    if n % i == 0: return False
return True
```
* **Time Complexity:** $O(\sqrt{N})$
* **Space Complexity:** $O(1)$

---

## Approach (JavaScript)

This section covers the JavaScript specific implementation for both approaches.

**Approach 1: Brute Force**
In JavaScript, we start with a guard clause for `n <= 1`. Then, we check all numbers up to `n - 1`. 
```javascript
if (n <= 1) return false;
for (let i = 2; i < n; i++) {
    if (n % i === 0) return false;
}
return true;
```
* **Time Complexity:** $O(N)$
* **Space Complexity:** $O(1)$

**Approach 2: Optimized (Square Root Approach)**
JavaScript uses double-precision floats for all numbers, meaning integer overflow is not a concern for a value like $10^9$. We can simply set our `for` loop condition to `i * i <= n` to stop searching once we cross the square root threshold.
```javascript
if (n <= 1) return false;
for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
}
return true;
```
* **Time Complexity:** $O(\sqrt{N})$
* **Space Complexity:** $O(1)$

---

## Solution: Brute Force
Time: $O(N)$  
Space: $O(1)$  

```cpp
class Solution {
  public:
    bool isPrime(int n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check every number up to n - 1
        for (int i = 2; i < n; i++) {
            // If n is cleanly divisible by i, it's not prime
            if (n % i == 0) {
                return false;
            }
        }
        
        return true;
    }
};
```

```java
class Solution {
    static boolean isPrime(int n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check every number up to n - 1
        for (int i = 2; i < n; i++) {
            // If n is cleanly divisible by i, it's not prime
            if (n % i == 0) {
                return false;
            }
        }
        
        return true;
    }
}
```

```python
class Solution:
    def isPrime(self, n: int) -> bool:
        # 1 and numbers less than 1 are not prime
        if n <= 1:
            return False
            
        # Check every number up to n - 1
        for i in range(2, n):
            # If n is cleanly divisible by i, it's not prime
            if n % i == 0:
                return False
                
        return True
```

```javascript
/**
 * @param {number} n
 * @returns {boolean}
 */
class Solution {
    isPrime(n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check every number up to n - 1
        for (let i = 2; i < n; i++) {
            // If n is cleanly divisible by i, it's not prime
            if (n % i === 0) {
                return false;
            }
        }
        
        return true;
    }
}
```

## Solution: Optimized (Square Root)
Time: $O(\sqrt{N})$  
Space: $O(1)$  

```cpp
class Solution {
  public:
    bool isPrime(int n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check up to the square root of n
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                return false;
            }
        }
        
        // If no divisors were found, it is prime
        return true;
    }
};
```

```java
class Solution {
    static boolean isPrime(int n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check up to the square root of n
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                return false;
            }
        }
        
        // If no divisors were found, it is prime
        return true;
    }
}
```

```python
class Solution:
    def isPrime(self, n: int) -> bool:
        # 1 and numbers less than 1 are not prime
        if n <= 1:
            return False
            
        # Check up to the square root of n
        limit = int(n ** 0.5) + 1
        for i in range(2, limit):
            if n % i == 0:
                return False
                
        # If no divisors were found, it is prime
        return True
```

```javascript
/**
 * @param {number} n
 * @returns {boolean}
 */
class Solution {
    isPrime(n) {
        // 1 and numbers less than 1 are not prime
        if (n <= 1) return false;
        
        // Check up to the square root of n
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) {
                return false;
            }
        }
        
        // If no divisors were found, it is prime
        return true;
    }
}
```