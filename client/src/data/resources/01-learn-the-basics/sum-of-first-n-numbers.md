---
id: sum-of-natural-numbers
time: O(N) or O(1)
space: O(N) or O(1)
---

## Overview
The goal of this problem is to calculate the sum of all natural numbers starting from `1` up to a given number `n`. If `n` is `0`, the sum should evaluate to `0`. 

While you can solve this using a simple loop, this problem is an excellent gateway into learning **Recursion**. Additionally, there is a lightning-fast mathematical shortcut that can solve it instantly without loops or recursion. We will explore both!

## Concepts
* **Recursion:** A programming pattern where a function calls itself to break a large problem down into smaller, identical problems.
    * *Analogy:* Imagine you are standing in a long line and want to know your position. Instead of stepping out and counting everyone, you tap the person in front of you and ask, "What is your position?" They do the same to the person in front of them until the very first person in line is reached. The first person says "1", the second adds 1 to it and says "2", and the answer bubbles back to you.
* **Base Case:** The crucial stopping condition in a recursive function. Without it, the function would call itself forever, leading to a program crash (Stack Overflow).
    * *Analogy:* In the line analogy, the person at the very front of the line is the base case. They have no one left to tap, so they just return a concrete answer.
* **Call Stack:** The computer's internal memory space used to keep track of active, paused functions. Every time a function calls itself, a new memory "frame" is added to the top of this stack. 
* **Arithmetic Progression (Math):** A sequence of numbers where the difference between consecutive terms is constant (like `1, 2, 3, 4`). Carl Friedrich Gauss famously discovered a formula to instantly sum these sequences when he was just a child in school!

## Approach

### 1. Recursive Approach (Focus)
To sum up to `n` using recursion, we can define the relationship like this: The sum of numbers up to `n` is simply `n` PLUS the sum of numbers up to `n - 1`. 
1.  **Base Case:** If `n` is `0`, return `0`. This stops the recursion.
2.  **Recursive Step:** Return `n + sum(n - 1)`.

**Complexity:**
* **Time Complexity:** O(N) because the function makes exactly `n` recursive calls to reach `0`.
* **Space Complexity:** O(N) because each paused function call takes up memory on the Call Stack while waiting for the smaller numbers to finish calculating.

### 2. Mathematical Approach (Optimal)
Instead of adding numbers one by one, we can use the mathematical formula for the sum of an arithmetic progression:

$$ \text{Sum} = \frac{n \times (n + 1)}{2} $$

* **Time Complexity:** O(1) because the computer only performs a few basic arithmetic operations (multiplication, addition, division) regardless of how huge `n` is.
* **Space Complexity:** O(1) because we only use constant memory to store the final result. No recursive call stack is built.

---

## Approach (C++)
In C++, we can write this utilizing both approaches.

**Recursive Method:**
We establish our base case `if (n == 0) return 0;`. Then, we return `n` added to the result of `sumOfNaturals(n - 1)`. 
```cpp
// Recursive mini-snippet
if (n == 0) return 0;
return n + sumOfNaturals(n - 1);
```
* **Time:** O(N) due to `n` sequential function calls.
* **Space:** O(N) due to the C++ call stack saving state for each call.

**Mathematical Method:**
Using the formula `n * (n + 1) / 2`. Note that for $N \le 10^4$, the maximum value is $10^4 \times (10^4 + 1) / 2 \approx 5 \times 10^7$. This fits perfectly within a standard 32-bit `int` in C++ without overflowing.
```cpp
// Math mini-snippet
return (n * (n + 1)) / 2;
```
* **Time:** O(1) as it executes a single algebraic equation.
* **Space:** O(1) as it requires no extra memory.

---

## Approach (Java)
In Java, we can implement both the recursive and the mathematical methods.

**Recursive Method:**
We define our base condition to stop the recursion: `if (n == 0) return 0;`. Then we call `sumOfNaturals(n - 1)` and add `n` to it.
```java
// Recursive mini-snippet
if (n == 0) {
    return 0;
}
return n + sumOfNaturals(n - 1);
```
* **Time:** O(N) since the method calls itself `n` times.
* **Space:** O(N). *Caveat:* The Java Virtual Machine (JVM) has a strict limit on how deep the call stack can go (often around 10,000 frames). If `n` is at the absolute maximum constraint (`10000`), a recursive solution might trigger a `StackOverflowError` depending on the environment. 

**Mathematical Method:**
A safer, much faster way in Java is using Gauss's formula.
```java
// Math mini-snippet
return (n * (n + 1)) / 2;
```
* **Time:** O(1) because it solves the problem with a single calculation.
* **Space:** O(1) as it uses zero additional stack memory.

---

## Approach (Python)
In Python, we use `self` to call methods within a class recursively, but the math approach is highly recommended here due to Python's internal design.

**Recursive Method:**
```python
# Recursive mini-snippet
if n == 0:
    return 0
return n + self.sumOfNaturals(n - 1)
```
* **Time:** O(N) because of `n` nested calls.
* **Space:** O(N) on the call stack. *Warning:* Python has a default recursion depth limit of exactly 1000. Because the constraints say `n` can go up to $10^4$, this recursive approach will crash with a `RecursionError` for large test cases unless you explicitly override the limit using `import sys; sys.setrecursionlimit(20000)`. 

**Mathematical Method:**
Because of the recursion limit, the mathematical approach is practically mandatory in Python for large numbers. It calculates the answer instantly.
```python
# Math mini-snippet
# Using // for integer division to return an int instead of a float
return (n * (n + 1)) // 2 
```
* **Time:** O(1) representing constant operational time.
* **Space:** O(1) as there is no call stack memory consumed.

---

## Approach (JavaScript)
In JavaScript, we utilize the `this` keyword to make recursive calls inside a class, but we must also be aware of call stack limits.

**Recursive Method:**
Our base case halts the chain: `if (n === 0) return 0;`. The recursive step adds the current number to the remaining sum.
```javascript
// Recursive mini-snippet
if (n === 0) return 0;
return n + this.sumOfNaturals(n - 1);
```
* **Time:** O(N) because the code makes `n` successive recursive calls.
* **Space:** O(N) for `n` execution frames. In JavaScript environments like Node.js or Chrome, the maximum call stack size is roughly 10,000. This means for the highest constraints, the recursive code is dangerously close to causing a "Maximum call stack size exceeded" error.

**Mathematical Method:**
Using the mathematical formula bypasses memory limitations entirely and provides immediate results.
```javascript
// Math mini-snippet
// Math.floor isn't strictly needed here since n*(n+1) is always even, 
// but it guarantees an integer type return.
return (n * (n + 1)) / 2; 
```
* **Time:** O(1) constant time processing.
* **Space:** O(1) requiring no stack build-up.

---

## Solution: Recursive Approach
Time: O(N)
Space: O(N)

```cpp
class Solution {
  public:
    int sumOfNaturals(int n) {
        // Base case: if n is 0, the sum is 0
        if (n == 0) {
            return 0;
        }
        
        // Add the current number to the sum of all previous numbers
        return n + sumOfNaturals(n - 1);
    }
};
```

```java
class Solution {
    static int sumOfNaturals(int n) {
        // Base case: if n is 0, the sum is 0
        if (n == 0) {
            return 0;
        }
        
        // Add the current number to the sum of all previous numbers
        return n + sumOfNaturals(n - 1);
    }
}
```

```python
import sys
# Increase recursion limit to handle large N constraints up to 10^4
sys.setrecursionlimit(20000)

class Solution:
    def sumOfNaturals(self, n):
        # Base case: if n is 0, the sum is 0
        if n == 0:
            return 0
            
        # Add the current number to the sum of all previous numbers
        return n + self.sumOfNaturals(n - 1)
```

```javascript
/**
 * @param {number} n
 * @returns {number}
 */
class Solution {
    // Function to calculate the sum of the first n natural numbers.
    sumOfNaturals(n) {
        // Base case: if n is 0, the sum is 0
        if (n === 0) {
            return 0;
        }
        
        // Add the current number to the sum of all previous numbers
        return n + this.sumOfNaturals(n - 1);
    }
}
```

## Solution: Mathematical Approach (Optimal)
Time: O(1)
Space: O(1)

```cpp
class Solution {
  public:
    int sumOfNaturals(int n) {
        // Formula: n * (n + 1) / 2
        return (n * (n + 1)) / 2;
    }
};
```

```java
class Solution {
    static int sumOfNaturals(int n) {
        // Formula: n * (n + 1) / 2
        return (n * (n + 1)) / 2;
    }
}
```

```python
class Solution:
    def sumOfNaturals(self, n):
        # Formula: n * (n + 1) / 2
        # Use integer division (//) to return an int instead of a float
        return (n * (n + 1)) // 2
```

```javascript
/**
 * @param {number} n
 * @returns {number}
 */
class Solution {
    // Function to calculate the sum of the first n natural numbers.
    sumOfNaturals(n) {
        // Formula: n * (n + 1) / 2
        return (n * (n + 1)) / 2;
    }
}
```