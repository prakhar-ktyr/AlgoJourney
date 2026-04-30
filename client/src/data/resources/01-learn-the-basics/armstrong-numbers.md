---
id: 17
time: O(1)
space: O(1)
---

## Overview
An **Armstrong Number** (also known as a narcissistic number) is a number that is equal to the sum of its own digits, each raised to the power of the number of digits. 

In this specific problem, we are constrained to **3-digit numbers** (from `100` to `999`). This means we only need to check if the sum of the *cubes* (power of 3) of its digits equals the original number. 

For example:
* `153`: $1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153$. This **is** an Armstrong number.
* `123`: $1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36 \neq 123$. This is **not** an Armstrong number.

## Concepts
* **Digit Extraction (Modulo `%`):** Think of `% 10` as a machine that safely detaches the very last digit of a number for you to use. 
* **Digit Truncation (Division `/`):** Think of integer division by 10 as a tool that slides the number to the right, letting the last digit fall off the edge.
* **Type Conversion:** Treating numbers as text (Strings). Since strings are just lists of characters, converting a number to a string allows us to look at each digit individually without doing any math.
* **Fixed Constraints (O(1) Time):** Because the problem specifically states the number will *always* have exactly 3 digits, our code will always run exactly 3 times. In Big O notation, algorithms that run a fixed number of times regardless of how big the data could conceptually get are considered $O(1)$ constant time.

## Approach

**Approach 1: Mathematical Extraction (Optimized)**
This is the standard and most mathematically elegant way to solve digit-based problems. We can isolate each digit using math, cube it, and add it to a running total.
1. Store the original number in a variable (e.g., `original`) so we can compare our final sum against it later.
2. Create a `sum` variable starting at `0`.
3. Loop while the number is greater than `0`:
   * Extract the last digit: `digit = n % 10`.
   * Cube the digit and add it to the sum: `sum += (digit * digit * digit)`.
   * Remove the last digit: `n = n / 10`.
4. Check if `sum == original`.
* **Time Complexity:** $O(1)$. Since the constraint guarantees `n` is strictly between `100` and `999`, the loop runs exactly three times.
* **Space Complexity:** $O(1)$. We only use a few integer variables.

**Approach 2: String Conversion**
Instead of using math to pull the number apart, we can convert the number into a string (text). Once it is text, we can easily loop through each character, convert that character back into a number, cube it, and add it to our sum.
* **Time Complexity:** $O(1)$. The string will always be exactly 3 characters long, meaning we perform exactly 3 iterations.
* **Space Complexity:** $O(1)$. Storing a 3-character string requires a tiny, constant amount of memory.

---

## Approach (C++)

This section covers the C++ specific implementation details.

**Approach 1: Mathematical Extraction**
We use standard integer division `/` and modulo `%` to extract digits. C++ offers `pow()` in the `<cmath>` library, but for a simple cube, `digit * digit * digit` is actually faster and avoids floating-point precision issues.
```cpp
int original = n;
int sum = 0;
while (n > 0) {
    int digit = n % 10;
    sum += (digit * digit * digit);
    n /= 10; // C++ automatically drops the decimal for integers
}
```
* **Time Complexity:** $O(1)$ because the loop always runs exactly 3 times for a 3-digit number.
* **Space Complexity:** $O(1)$ as we only allocate basic `int` variables.

**Approach 2: String Conversion**
We can use `std::to_string(n)` to convert the number. When iterating through the characters, we can subtract the character `'0'` from the current character to get its actual integer value (since characters are stored as ASCII values).
```cpp
string str = to_string(n);
for (char c : str) {
    int digit = c - '0'; // Converts char '5' to int 5
    // ... calculate sum
}
```
* **Time Complexity:** $O(1)$ for fixed 3-character iteration.
* **Space Complexity:** $O(1)$ for allocating a 3-byte string.

---

## Approach (Java)

This section covers the Java specific implementation details.

**Approach 1: Mathematical Extraction**
Java integer division naturally truncates decimals. We extract digits, cube them, and sum them. We avoid `Math.pow()` here because it returns a `double`, requiring us to cast it back to an `int`, which is unnecessary overhead.
```java
int original = n;
int sum = 0;
while (n > 0) {
    int digit = n % 10;
    sum += (digit * digit * digit);
    n /= 10; 
}
```
* **Time Complexity:** $O(1)$. The constraints strictly limit `n` to 3 digits, so the `while` loop runs exactly 3 times.
* **Space Complexity:** $O(1)$, utilizing only primitive `int` data types.

**Approach 2: String Conversion**
We convert the number to a `String` using `String.valueOf(n)`. We can then loop through it using `.toCharArray()` and convert each character back to a numeric value using `Character.getNumericValue()`.
```java
String s = String.valueOf(n);
for (char c : s.toCharArray()) {
    int digit = Character.getNumericValue(c);
    // ... calculate sum
}
```
* **Time Complexity:** $O(1)$ since the string length is bounded at 3.
* **Space Complexity:** $O(1)$. Creating the `String` and character array takes a constant, negligible amount of memory.

---

## Approach (Python)

This section covers the Python specific implementation details.

**Approach 1: Mathematical Extraction**
In Python, standard division `/` results in a float (e.g., `15 / 10 = 1.5`). To correctly chop off the last digit, we must use the floor division operator `//`. To cube a number, we can use the exponentiation operator `**`.
```python
original = n
total_sum = 0
while n > 0:
    digit = n % 10
    total_sum += digit ** 3
    n //= 10 # Integer (floor) division
```
* **Time Complexity:** $O(1)$ because the loop processes a maximum of 3 digits.
* **Space Complexity:** $O(1)$ since we are strictly maintaining integer counters.

**Approach 2: String Conversion**
Python's list comprehensions and built-in `sum()` function make the string approach incredibly concise. We can convert the number to a string, iterate over it, convert each character back to an `int`, cube it, and sum the results in one line.
```python
# Convert to string, iterate, cube each int, and sum them
total_sum = sum(int(digit)**3 for digit in str(n))
```
* **Time Complexity:** $O(1)$. The generator expression loops exactly 3 times.
* **Space Complexity:** $O(1)$ for storing the short string representation in memory.

---

## Approach (JavaScript)

This section covers the JavaScript specific implementation details.

**Approach 1: Mathematical Extraction**
JavaScript handles all numbers as floating-point under the hood. Therefore, `15 / 10` becomes `1.5`. We must use `Math.floor()` (or the bitwise double NOT `~~`) to force integer division and drop the decimal. 
```javascript
let original = n;
let sum = 0;
while (n > 0) {
    let digit = n % 10;
    sum += digit ** 3; // JavaScript's exponentiation operator
    n = Math.floor(n / 10); 
}
```
* **Time Complexity:** $O(1)$. The loop acts strictly 3 times due to the problem's `< 1000` constraint.
* **Space Complexity:** $O(1)$ memory usage for variables.

**Approach 2: String Conversion**
We can use `String(n)` or `n.toString()`, then split it into an array of characters, and finally use the `.reduce()` method to accumulate the sum of the cubes cleanly.
```javascript
let sum = String(n).split('').reduce((acc, curr) => {
    return acc + Math.pow(Number(curr), 3);
}, 0);
```
* **Time Complexity:** $O(1)$. Array splitting and reduction only process 3 elements.
* **Space Complexity:** $O(1)$ to store a 3-element array.

---

## Solution: Mathematical Extraction
Time: $O(1)$ - The loop strictly runs 3 times since the input is constrained to a 3-digit number.
Space: $O(1)$ - Only basic variables are allocated.

```cpp
class Solution {
  public:
    bool armstrongNumber(int n) {
        int original = n;
        int sum = 0;
        
        while (n > 0) {
            int digit = n % 10;
            sum += (digit * digit * digit);
            n /= 10;
        }
        
        return sum == original;
    }
};
```

```java
class Solution {
    static boolean armstrongNumber(int n) {
        int original = n;
        int sum = 0;
        
        while (n > 0) {
            int digit = n % 10;
            sum += (digit * digit * digit);
            n /= 10;
        }
        
        return sum == original;
    }
}
```

```python
class Solution:
    def armstrongNumber (self, n: int) -> bool:
        original = n
        total_sum = 0
        
        while n > 0:
            digit = n % 10
            total_sum += digit ** 3
            n //= 10
            
        return total_sum == original
```

```javascript
/**
 * @param {number} n
 * @returns {boolean}
 */
class Solution {
    armstrongNumber(n) {
        let original = n;
        let sum = 0;
        
        while (n > 0) {
            let digit = n % 10;
            sum += (digit ** 3);
            n = Math.floor(n / 10);
        }
        
        return sum === original;
    }
}
```

## Solution: String Conversion
Time: $O(1)$ - String manipulation processes exactly 3 characters.
Space: $O(1)$ - Allocates memory for a string of fixed length (3).

```cpp
class Solution {
  public:
    bool armstrongNumber(int n) {
        string str = to_string(n);
        int sum = 0;
        
        for (char c : str) {
            int digit = c - '0'; // Convert char back to int
            sum += (digit * digit * digit);
        }
        
        return sum == n;
    }
};
```

```java
class Solution {
    static boolean armstrongNumber(int n) {
        String str = String.valueOf(n);
        int sum = 0;
        
        for (char c : str.toCharArray()) {
            int digit = Character.getNumericValue(c);
            sum += (digit * digit * digit);
        }
        
        return sum == n;
    }
}
```

```python
class Solution:
    def armstrongNumber (self, n: int) -> bool:
        # Convert n to string, loop through chars, convert to int, cube, and sum
        total_sum = sum(int(digit)**3 for digit in str(n))
        
        return total_sum == n
```

```javascript
/**
 * @param {number} n
 * @returns {boolean}
 */
class Solution {
    armstrongNumber(n) {
        let str = n.toString();
        let sum = 0;
        
        for (let i = 0; i < str.length; i++) {
            let digit = Number(str[i]);
            sum += Math.pow(digit, 3);
        }
        
        return sum === n;
    }
}
```