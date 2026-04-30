---
id: 16
time: O(log(min(a, b)))
space: O(1)
---

## Overview
In this problem, we are tasked with finding two fundamental mathematical properties of two numbers, `a` and `b`: their **Lowest Common Multiple (LCM)** and **Greatest Common Divisor (GCD)**. We need to calculate both and return them together in an array or list format as `[LCM, GCD]`.

* **GCD** is the largest number that divides exactly into both `a` and `b` without leaving a remainder.
* **LCM** is the smallest number that is a multiple of both `a` and `b`.

For example, given `14` and `8`: The largest number that divides both is `2` (GCD). The smallest number that both `14` and `8` divide into perfectly is `56` (LCM). 

## Concepts
* **Brute Force Searching:** Simply checking every possible number until we find the answer. For GCD, counting down from the smaller number; for LCM, counting up from the larger number. 
* **The Euclidean Algorithm:** A highly efficient, ancient algorithm used to find the GCD. It uses the principle that the GCD of two numbers also divides their difference (and by extension, their remainder). We repeatedly replace the larger number with the remainder of the larger divided by the smaller until the remainder is `0`.
* **LCM-GCD Mathematical Relationship:** There is a beautiful formula connecting the two: `LCM(a, b) * GCD(a, b) = a * b`. 
  * We can rearrange this to find the LCM instantly once we know the GCD: `LCM(a, b) = (a * b) / GCD(a, b)`.

## Approach

**Approach 1: Brute Force**
To find the GCD, we start at the smaller of the two numbers and count backward down to 1. The first number that divides both `a` and `b` evenly is our GCD. To find the LCM, we start at the larger of the two numbers and count upward. The first number that is divisible by both `a` and `b` is our LCM.
* **Time Complexity:** $O(\min(a, b) + (a \times b))$. In the worst case, checking for the GCD takes $O(\min(a, b))$ steps, and checking for the LCM could take up to $O(a \times b)$ steps. 
* **Space Complexity:** $O(1)$ because we only use a few variables to store our current loops.

**Approach 2: Euclidean Algorithm (Optimized)**
Because checking every number is too slow for large inputs, we use the Euclidean Algorithm to find the GCD. 
1. Repeatedly take the remainder of `a % b`.
2. Assign `a = b` and `b = remainder`.
3. Stop when `b` becomes 0. The GCD is whatever is left in `a`.
4. Once we have the GCD, we use the mathematical formula to find the LCM: `(a / GCD) * b`. *(Note: We divide first to prevent the multiplication from creating a massive number that could cause an integer overflow!)*
* **Time Complexity:** $O(\log(\min(a, b)))$. The Euclidean algorithm is extremely fast because the remainder `a % b` drops to less than half of `a` in at most two steps. This logarithmic halving means even massive numbers take very few steps.
* **Space Complexity:** $O(1)$. We are only storing the results in standard integer variables, meaning memory usage does not scale with the input size.

---

## Approach (C++)

This section covers C++ specific details for solving the problem.

**Approach 1: Brute Force**
We can use standard `for` or `while` loops. For GCD, we use `std::min(a, b)` to start our downward loop.
```cpp
int gcd = 1;
for (int i = min(a, b); i > 0; i--) {
    if (a % i == 0 && b % i == 0) {
        gcd = i; break;
    }
}
```
* **Time Complexity:** $O(\min(a, b) + (a \times b))$ due to the step-by-step loops.
* **Space Complexity:** $O(1)$ as we only return a standard `vector<int>`.

**Approach 2: Euclidean Algorithm (Optimized)**
We write a helper function to perform the Euclidean algorithm. While C++'s `<numeric>` library has a built-in `std::gcd` function, writing it manually is standard for interviews.
```cpp
int findGCD(int a, int b) {
    while (b > 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
```
* **Time Complexity:** $O(\log(\min(a, b)))$. The modulo operation shrinks the numbers exponentially.
* **Space Complexity:** $O(1)$. Returning `vector<int>{lcm, gcd}` takes constant space.

---

## Approach (Java)

This section covers Java specific details for solving the problem.

**Approach 1: Brute Force**
We iterate to find the GCD and LCM. Java's `Math.min()` and `Math.max()` help set the bounds.
```java
int gcd = 1;
for (int i = Math.min(a, b); i >= 1; i--) {
    if (a % i == 0 && b % i == 0) {
        gcd = i; break;
    }
}
```
* **Time Complexity:** $O(\min(a, b) + (a \times b))$. Looping one-by-one is highly inefficient.
* **Space Complexity:** $O(1)$ as we only allocate an `int[]` of size 2 to return.

**Approach 2: Euclidean Algorithm (Optimized)**
We implement the Euclidean algorithm efficiently using a `while` loop. To find the LCM safely, we compute `(a / gcd) * b` to guarantee the calculation doesn't temporarily exceed Java's 32-bit `int` limits before dividing.
```java
int originalA = a, originalB = b;
while (b != 0) {
    int remainder = a % b;
    a = b;
    b = remainder;
}
int gcd = a;
```
* **Time Complexity:** $O(\log(\min(a, b)))$. Finding the remainder rapidly reduces the values.
* **Space Complexity:** $O(1)$. Creating the `new int[]{lcm, gcd}` takes constant memory.

---

## Approach (Python)

This section covers Python specific details for solving the problem.

**Approach 1: Brute Force**
We use a `for` loop combined with `range()` starting backwards for GCD, and a `while` loop for LCM.
```python
gcd = 1
for i in range(min(a, b), 0, -1):
    if a % i == 0 and b % i == 0:
        gcd = i
        break
```
* **Time Complexity:** $O(\min(a, b) + (a \times b))$. Python loops are particularly slow, so this might cause a Time Limit Exceeded (TLE) error.
* **Space Complexity:** $O(1)$, only returning a small list.

**Approach 2: Euclidean Algorithm (Optimized)**
Python allows for beautiful, single-line tuple unpacking which makes the Euclidean algorithm incredibly concise. We don't even need a temporary variable! Python's `math.gcd` is also available, but the manual approach is great practice.
```python
original_a, original_b = a, b
while b > 0:
    a, b = b, a % b # Swaps and updates simultaneously
gcd = a
```
* **Time Complexity:** $O(\log(\min(a, b)))$. The size of `b` decreases logarithmically on each pass.
* **Space Complexity:** $O(1)$. We just return `[lcm, gcd]`.

---

## Approach (JavaScript)

This section covers JavaScript specific details for solving the problem.

**Approach 1: Brute Force**
We use basic `for` and `while` loops. 
```javascript
let gcd = 1;
for (let i = Math.min(a, b); i > 0; i--) {
    if (a % i === 0 && b % i === 0) {
        gcd = i; break;
    }
}
```
* **Time Complexity:** $O(\min(a, b) + (a \times b))$. Checking every number iteratively.
* **Space Complexity:** $O(1)$. The returned array `[lcm, gcd]` is tiny.

**Approach 2: Euclidean Algorithm (Optimized)**
We can use array destructuring in JavaScript (similar to Python) to update our values cleanly. 
```javascript
let origA = a, origB = b;
while (b !== 0) {
    [a, b] = [b, a % b];
}
let gcd = a;
```
* **Time Complexity:** $O(\log(\min(a, b)))$. The numbers collapse rapidly due to the modulo operator.
* **Space Complexity:** $O(1)$. Returning an array with two elements uses a constant amount of space.

---

## Solution: Brute Force
Time: $O(\min(a, b) + (a \times b))$  
Space: $O(1)$  

```cpp
class Solution {
  public:
    vector<int> lcmAndGcd(int a, int b) {
        int gcd = 1;
        // Find GCD by counting down
        for (int i = min(a, b); i >= 1; i--) {
            if (a % i == 0 && b % i == 0) {
                gcd = i;
                break;
            }
        }
        
        int lcm = max(a, b);
        // Find LCM by counting up
        while (true) {
            if (lcm % a == 0 && lcm % b == 0) {
                break;
            }
            lcm++;
        }
        
        return {lcm, gcd};
    }
};
```

```java
class Solution {
    public static int[] lcmAndGcd(int a, int b) {
        int gcd = 1;
        // Find GCD by counting down
        for (int i = Math.min(a, b); i >= 1; i--) {
            if (a % i == 0 && b % i == 0) {
                gcd = i;
                break;
            }
        }
        
        int lcm = Math.max(a, b);
        // Find LCM by counting up
        while (true) {
            if (lcm % a == 0 && lcm % b == 0) {
                break;
            }
            lcm++;
        }
        
        return new int[]{lcm, gcd};
    }
}
```

```python
class Solution:
    def lcmAndGcd(self, a: int, b: int) -> list[int]:
        gcd = 1
        # Find GCD by counting down
        for i in range(min(a, b), 0, -1):
            if a % i == 0 and b % i == 0:
                gcd = i
                break
                
        lcm = max(a, b)
        # Find LCM by counting up
        while True:
            if lcm % a == 0 and lcm % b == 0:
                break
            lcm += 1
            
        return [lcm, gcd]
```

```javascript
class Solution {
    /**
     * @param {number} a
     * @param {number} b
     * @returns {number[]}
     */
    lcmAndGcd(a, b) {
        let gcd = 1;
        // Find GCD by counting down
        for (let i = Math.min(a, b); i >= 1; i--) {
            if (a % i === 0 && b % i === 0) {
                gcd = i;
                break;
            }
        }
        
        let lcm = Math.max(a, b);
        // Find LCM by counting up
        while (true) {
            if (lcm % a === 0 && lcm % b === 0) {
                break;
            }
            lcm++;
        }
        
        return [lcm, gcd];
    }
}
```

## Solution: Euclidean Algorithm (Optimized)
Time: $O(\log(\min(a, b)))$  
Space: $O(1)$  

```cpp
class Solution {
  public:
    vector<int> lcmAndGcd(int a, int b) {
        int originalA = a;
        int originalB = b;
        
        // Euclidean Algorithm for GCD
        while (b > 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        int gcd = a;
        
        // Relationship Formula for LCM: (a * b) / GCD
        // We divide first to prevent potential integer overflow
        int lcm = (originalA / gcd) * originalB;
        
        return {lcm, gcd};
    }
};
```

```java
class Solution {
    public static int[] lcmAndGcd(int a, int b) {
        int originalA = a;
        int originalB = b;
        
        // Euclidean Algorithm for GCD
        while (b > 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        int gcd = a;
        
        // Relationship Formula for LCM: (a * b) / GCD
        // We divide first to prevent potential integer overflow
        int lcm = (originalA / gcd) * originalB;
        
        return new int[]{lcm, gcd};
    }
}
```

```python
class Solution:
    def lcmAndGcd(self, a: int, b: int) -> list[int]:
        original_a, original_b = a, b
        
        # Euclidean Algorithm for GCD (using Python tuple unpacking)
        while b > 0:
            a, b = b, a % b
            
        gcd = a
        
        # Relationship Formula for LCM: (a * b) / GCD
        # We use integer division // to ensure an exact whole number
        lcm = (original_a // gcd) * original_b
        
        return [lcm, gcd]
```

```javascript
class Solution {
    /**
     * @param {number} a
     * @param {number} b
     * @returns {number[]}
     */
    lcmAndGcd(a, b) {
        let originalA = a;
        let originalB = b;
        
        // Euclidean Algorithm for GCD
        while (b > 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        let gcd = a;
        
        // Relationship Formula for LCM: (a * b) / GCD
        let lcm = Math.floor(originalA / gcd) * originalB;
        
        return [lcm, gcd];
    }
}
```