---
id: 15
time: O(log10(x))
space: O(1)
---

## Overview
A **palindrome** is a sequence that reads the same forwards and backwards. In this problem, we are asked to determine if a given integer `x` is a palindrome. 

For example, `121` is a palindrome, but `123` is not. An important edge case to consider is negative numbers. For instance, `-121` reads from right to left as `121-`, which does not match the original number. Therefore, **all negative numbers are immediately disqualified** from being palindromes.

## Concepts
* **Palindromes:** Think of the word "racecar". If you read it backwards, it is still "racecar". We are applying this exact logic to numbers.
* **Type Conversion:** The simplest way to flip a number is to treat it as a word (a String). By converting the number to text, we can easily reverse its characters.
* **Modulo Arithmetic (`%`):** Think of this as a tool to "peel" the last digit off a number. For example, `123 % 10` gives us `3`.
* **Integer Division (`/`):** Think of this as a tool to "chop" the last digit off a number. For example, `123 / 10` gives us `12`.
* **Reversing a Number Mathematically:** By repeatedly "peeling" the last digit and adding it to a new number that we shift left (multiply by 10), we can build the reversed number from scratch without ever converting it to text.

## Approach

We have two primary ways to tackle this problem:

**Approach 1: String Conversion (The Intuitive Way)**
The most straightforward method is to convert the integer into a string. Once it is a string, we can reverse it using built-in string manipulation tools and compare it to the original string. 
* **Time Complexity:** $O(N)$ where $N$ is the number of digits in the integer. We have to visit each digit to convert it and reverse it.
* **Space Complexity:** $O(N)$ because converting the integer to a string requires allocating new memory to hold that string.

**Approach 2: Mathematical Reversal (The Optimized Way)**
To solve the problem without converting the integer to a string (as requested by the follow-up prompt), we can reverse the number using math. 
1. If the number is negative, return `false`.
2. Create a variable to hold the `reversed_number` (starting at 0).
3. Save the original number in a `temp` variable so we can safely modify it.
4. Loop while `temp` is greater than 0:
   * Get the last digit: `temp % 10`.
   * Shift the `reversed_number` left by one decimal place and add the digit: `reversed_number = (reversed_number * 10) + digit`.
   * Chop the last digit off `temp`: `temp = temp / 10`.
5. Finally, check if the original number equals the `reversed_number`.
* **Time Complexity:** $O(\log_{10}(x))$. The number of digits in a number $x$ is roughly $\log_{10}(x)$. Because we divide the number by 10 in each iteration, the loop runs exactly as many times as there are digits.
* **Space Complexity:** $O(1)$. We are only using a few extra integer variables to store the reversed number and the temporary values, taking up a constant amount of space regardless of the input size.

---

## Approach (C++)

This section covers the C++ specific implementation details for both approaches.

**Approach 1: String Conversion**
In C++, you can easily convert an integer to a string using `std::to_string()`. You can then create a copy of this string and reverse it using the `<algorithm>` library's `std::reverse()` function.
```cpp
string s = to_string(x);
string rev = s;
reverse(rev.begin(), rev.end());
```
* **Time Complexity:** $O(N)$ where $N$ is the number of digits. `std::to_string` and `std::reverse` both take linear time relative to the number of digits.
* **Space Complexity:** $O(N)$ because we create two string variables (`s` and `rev`) which take memory proportional to the length of the number.

**Approach 2: Mathematical Reversal**
To avoid using extra memory, we can reverse the number mathematically. We use the modulo operator `%` to extract digits and division `/` to remove them. 
*Caution:* When we reverse a 32-bit integer, the reversed number might be larger than the maximum value an `int` can hold, causing an integer overflow. To safely build the reversed number, we should declare our `reversed` variable as a `long`.
```cpp
long reversed = 0;
// Extracting the last digit and building the new number
int digit = temp % 10;
reversed = (reversed * 10) + digit; 
temp /= 10; // Removing the last digit
```
* **Time Complexity:** $O(\log_{10}(x))$. Dividing `x` by 10 in a loop means the loop runs $d$ times, where $d$ is the number of digits. Mathematically, the number of digits is proportional to $\log_{10}(x)$.
* **Space Complexity:** $O(1)$. We strictly use `long` and `int` primitives, so memory usage is constant.

---

## Approach (Java)

This section covers the Java specific implementation details for both approaches.

**Approach 1: String Conversion**
In Java, you can convert an integer to a string using `String.valueOf(x)`. Because basic `String` objects are immutable in Java and don't have a reverse method, we use a `StringBuilder` to reverse the text.
```java
String s = String.valueOf(x);
String rev = new StringBuilder(s).reverse().toString();
return s.equals(rev);
```
* **Time Complexity:** $O(N)$ where $N$ is the number of digits. String conversion and `StringBuilder.reverse()` both iterate through the digits.
* **Space Complexity:** $O(N)$ because we instantiate new `String` and `StringBuilder` objects in the Heap memory, scaling with the number's length.

**Approach 2: Mathematical Reversal**
To solve this without string overhead, we extract digits using `% 10` and chop off digits using `/ 10`. 
*Note on Overflow:* A valid 32-bit integer like `2,147,483,647` reversed becomes `7,463,847,412`, which is too big for Java's standard `int` type. To prevent overflow crashes during the building process, we use a `long` for the reversed number.
```java
long reversed = 0;
while (temp > 0) {
    long digit = temp % 10;
    reversed = (reversed * 10) + digit;
    temp /= 10;
}
```
* **Time Complexity:** $O(\log_{10}(x))$. We process the integer one digit at a time. The number of digits in $x$ is essentially $\log_{10}(x)$, meaning our `while` loop runs that many times.
* **Space Complexity:** $O(1)$. Only primitive `long` and `int` variables are created, meaning no scaling memory allocations.

---

## Approach (Python)

This section covers the Python specific implementation details for both approaches.

**Approach 1: String Conversion**
Python makes string manipulation incredibly concise. We can convert the number to a string using `str(x)` and reverse it using Python's slicing feature `[::-1]`.
```python
s = str(x)
rev = s[::-1]
return s == rev
```
* **Time Complexity:** $O(N)$ where $N$ is the number of digits. `str()` and string slicing both iterate over the $N$ characters.
* **Space Complexity:** $O(N)$ to store the original string and the reversed string in memory.

**Approach 2: Mathematical Reversal**
While Python handles arbitrarily large integers (so we don't have to worry about the 32-bit integer overflow limits that affect C++ or Java), it's still excellent algorithmic practice to reverse the number mathematically. We use modulo `% 10` to get the last digit and integer division `// 10` to drop the last digit.
```python
reversed_num = 0
# Notice the // for integer division in Python
digit = temp % 10
reversed_num = (reversed_num * 10) + digit
temp //= 10 
```
* **Time Complexity:** $O(\log_{10}(x))$. We perform one loop iteration per digit. The total number of digits is logarithmic with respect to base 10.
* **Space Complexity:** $O(1)$. We are only creating a couple of integer variables instead of full string objects.

---

## Approach (JavaScript)

This section covers the JavaScript specific implementation details for both approaches.

**Approach 1: String Conversion**
JavaScript arrays have a handy `.reverse()` method, but strings do not. Therefore, we convert the number to a string, split it into an array of characters, reverse the array, and join it back into a string.
```javascript
const s = x.toString();
const rev = s.split('').reverse().join('');
return s === rev;
```
* **Time Complexity:** $O(N)$ where $N$ is the number of digits. Splitting, reversing, and joining all require iterating over the elements.
* **Space Complexity:** $O(N)$ because the `.split('')` method creates an array of $N$ elements, taking up memory relative to the number's size.

**Approach 2: Mathematical Reversal**
We can skip arrays entirely by using math. We extract digits with `% 10`. Since JavaScript's standard division `/` results in floating-point numbers (e.g., `12 / 10 = 1.2`), we must use `Math.floor()` or the bitwise double-NOT `~~` to simulate strict integer division.
```javascript
let reversed = 0;
while (temp > 0) {
    let digit = temp % 10;
    reversed = (reversed * 10) + digit;
    temp = Math.floor(temp / 10); // Chops off the decimal
}
```
* **Time Complexity:** $O(\log_{10}(x))$. By dividing by 10 each loop, the process runs exactly once per digit in the number.
* **Space Complexity:** $O(1)$. No arrays or strings are created. The memory footprint remains strictly bound to a few `Number` variables.

---

## Solution: String Conversion
Time: $O(N)$ where $N$ is the number of digits in $x$.
Space: $O(N)$ to store the string representations.

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        // Negative numbers cannot be palindromes
        if (x < 0) return false;
        
        string s = to_string(x);
        string rev = s;
        reverse(rev.begin(), rev.end());
        
        return s == rev;
    }
};
```

```java
class Solution {
    public boolean isPalindrome(int x) {
        // Negative numbers cannot be palindromes
        if (x < 0) return false;
        
        String s = String.valueOf(x);
        String rev = new StringBuilder(s).reverse().toString();
        
        return s.equals(rev);
    }
}
```

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Negative numbers cannot be palindromes
        if x < 0:
            return False
            
        s = str(x)
        return s == s[::-1]
```

```javascript
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Negative numbers cannot be palindromes
    if (x < 0) return false;
    
    const s = x.toString();
    const rev = s.split('').reverse().join('');
    
    return s === rev;
};
```

## Solution: Mathematical Reversal
Time: $O(\log_{10}(x))$ as the number of loop iterations is strictly equal to the number of digits.
Space: $O(1)$ as we only allocate basic numerical variables.

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        // Negative numbers are not palindromes.
        // Also, if the last digit is 0, the first digit must also be 0.
        // Only 0 satisfies this, so numbers ending in 0 (like 10) are false.
        if (x < 0 || (x != 0 && x % 10 == 0)) {
            return false;
        }
        
        long reversed = 0;
        int temp = x;
        
        while (temp > 0) {
            int digit = temp % 10;
            reversed = (reversed * 10) + digit;
            temp /= 10;
        }
        
        return reversed == x;
    }
};
```

```java
class Solution {
    public boolean isPalindrome(int x) {
        // Negative numbers are not palindromes.
        // Numbers ending in 0 (except 0 itself) are not palindromes.
        if (x < 0 || (x != 0 && x % 10 == 0)) {
            return false;
        }
        
        long reversed = 0;
        int temp = x;
        
        while (temp > 0) {
            int digit = temp % 10;
            reversed = (reversed * 10) + digit;
            temp /= 10;
        }
        
        // If the reversed number matches the original, it's a palindrome
        return (int) reversed == x;
    }
}
```

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Negative numbers are not palindromes.
        # Numbers ending in 0 (except 0 itself) are not palindromes.
        if x < 0 or (x != 0 and x % 10 == 0):
            return False
            
        reversed_num = 0
        temp = x
        
        while temp > 0:
            digit = temp % 10
            reversed_num = (reversed_num * 10) + digit
            temp //= 10
            
        return reversed_num == x
```

```javascript
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Negative numbers are not palindromes.
    // Numbers ending in 0 (except 0 itself) are not palindromes.
    if (x < 0 || (x !== 0 && x % 10 === 0)) {
        return false;
    }
    
    let reversed = 0;
    let temp = x;
    
    while (temp > 0) {
        let digit = temp % 10;
        reversed = (reversed * 10) + digit;
        temp = Math.floor(temp / 10);
    }
    
    return reversed === x;
};
```