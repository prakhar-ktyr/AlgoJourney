---
id: 14
time: O(d)
space: O(1)
---

## Overview
The goal of this problem is to take a given positive integer `n` and flip it around so its digits are in reverse order. For example, if you are given `123`, you should return `321`. 

An important edge case to consider is numbers ending in zero, like `200`. When reversed, `200` becomes `002`. However, in standard mathematics, we don't write leading zeroes for integers, so the final answer should simply be `2`. 

## Concepts
* **Modulo Operator (`%`):** Think of this as a "remainder" machine. In base-10 mathematics, if you divide any number by 10, the remainder is always the last digit. `123 % 10 = 3`. This is our main tool for peeling digits off the end of a number.
* **Integer Division:** Once we peel off the last digit, we need to remove it from the original number. Dividing by 10 and discarding the decimal does exactly this. `123 / 10 = 12`.
* **Building a Number:** To construct the reversed number, we can take our current reversed number, multiply it by 10 (which shifts all its digits one spot to the left, making room at the end), and add the newly peeled digit.
* **Type Casting (for strings):** We can also solve this by changing the "type" of the data. If we treat the number as a word (a string of characters), we can just read the word backwards and then turn it back into a math number.

## Approach
There are two primary ways to solve this problem: using raw mathematics, or by converting the number to a string.

**1. Mathematical Approach (Optimal)**
This approach uses a loop to pluck digits from the back of the number one by one and attach them to the back of our new, reversed number.
* Start with a variable `reversedNum` set to `0`.
* While the original number `n` is greater than `0`:
    * Extract the last digit: `digit = n % 10`.
    * Append it to the new number: `reversedNum = reversedNum * 10 + digit`.
    * Chop the last digit off the original number: `n = n / 10`.
* *Handling Leading Zeroes:* This is handled automatically! If the first digit we extract is a `0` (from `200`), our math does `0 * 10 + 0 = 0`. The leading zeroes never gain traction until non-zero digits arrive.

**Time & Space Complexity:**
* **Time Complexity:** $O(d)$, where $d$ is the number of digits in the integer $n$. Mathematically, this is equivalent to $O(\log_{10}(n))$. The loop runs exactly once for every digit in the number.
* **Space Complexity:** $O(1)$. We only use a couple of extra integer variables (`reversedNum` and `digit`), which take up a constant amount of memory regardless of how big `n` is.

**2. String Manipulation Approach**
Sometimes it is conceptually easier to just treat the number like text. 
* Convert the number `n` into a string.
* Reverse the characters in the string.
* Convert the reversed string back into an integer. 
* *Handling Leading Zeroes:* The built-in string-to-integer conversion tools in most languages will automatically strip out leading zeroes (e.g., turning `"002"` into `2`).

**Time & Space Complexity:**
* **Time Complexity:** $O(d)$. Converting a number to a string, reversing a string, and converting back all require looking at each character/digit.
* **Space Complexity:** $O(d)$. Unlike the math approach, creating a string takes up extra memory proportional to the length of the number.

---

## Approach (C++)
In C++, we can implement both the mathematical and string approaches. 

**Mathematical Approach:**
We use a `while` loop. To extract the last digit, we use `n % 10`. To append it to our result, we multiply our result by 10 and add the digit. Finally, we do `n /= 10` to remove the last digit. Because C++ performs integer division by default when both operands are integers, `12 / 10` becomes `1`.

```cpp
int rev = 0;
int digit = n % 10; // Gets the last digit
rev = rev * 10 + digit; // Appends digit to the reversed number
n /= 10; // Removes the last digit from n
```
* **Time Complexity:** $O(d)$ or $O(\log_{10}(n))$ where $d$ is the number of digits.
* **Space Complexity:** $O(1)$ as we only use a primitive `int` variable.

**String Manipulation Approach:**
We can use the `std::to_string()` function to turn the integer into a `std::string`. Then, we can use the `std::reverse()` function from the `<algorithm>` library to reverse it in place. Finally, `std::stoi()` converts the string back into an integer, naturally handling any leading zeroes.

```cpp
string s = to_string(n); // Convert to string
reverse(s.begin(), s.end()); // Reverse in place
int reversedNum = stoi(s); // Convert back to int
```
* **Time Complexity:** $O(d)$ to process the string.
* **Space Complexity:** $O(d)$ to allocate memory for the string.

---

## Approach (Java)
In Java, we can implement both the mathematical and string approaches. 

**Mathematical Approach:**
We use a `while` loop. To extract the last digit, we use the modulo operator: `n % 10`. To append it, we multiply our running total by 10 and add the digit. To chop the digit off the original number, we use `n /= 10`. Java performs integer division by default for `int` types, so `12 / 10` correctly becomes `1`.

```java
int rev = 0;
int digit = n % 10; // Plucks the last digit
rev = rev * 10 + digit; // Shifts existing digits left, adds new digit
n /= 10; // Drops the last digit
```
* **Time Complexity:** $O(d)$ or $O(\log_{10}(n))$ where $d$ is the number of digits.
* **Space Complexity:** $O(1)$ because we only create a couple of primitive `int` variables.

**String Manipulation Approach:**
Strings in Java are immutable (cannot be changed after creation), so we wrap the string in a `StringBuilder`. This class has a handy `.reverse()` method. After reversing it, we convert it back to a standard `String` using `.toString()`, and finally parse it back to an `int` using `Integer.parseInt()`.

```java
String s = String.valueOf(n);
StringBuilder sb = new StringBuilder(s);
sb.reverse(); // Reverses the characters
int reversedNum = Integer.parseInt(sb.toString()); // Parses back to integer
```
* **Time Complexity:** $O(d)$ to create, reverse, and parse the string.
* **Space Complexity:** $O(d)$ to store the characters in the `StringBuilder`.

---

## Approach (Python)
In Python, we can implement both the mathematical and string approaches. Python is especially elegant with the string approach.

**Mathematical Approach:**
We use a `while` loop. We extract the last digit with `n % 10`. We build the reverse number using `rev = rev * 10 + digit`. To chop off the last digit from `n`, we MUST use floor division `//`. Standard division `/` in Python results in a floating-point number (e.g., `12 / 10 = 1.2`), but we want `1`.

```python
rev = 0
digit = n % 10       # Get last digit
rev = rev * 10 + digit # Push to end of reversed number
n = n // 10          # Floor division to remove last digit
```
* **Time Complexity:** $O(d)$ or $O(\log_{10}(n))$ where $d$ is the number of digits.
* **Space Complexity:** $O(1)$ memory used.

**String Manipulation Approach:**
Python makes this incredibly concise using "string slicing". `str(n)` converts the integer to a string. Slicing it with `[::-1]` returns a new string stepped backward. Finally, wrapping it in `int()` parses it back to an integer, which automatically ignores leading zeroes!

```python
string_num = str(n)         # "200"
reversed_str = string_num[::-1] # "002"
final_num = int(reversed_str)   # 2
```
* **Time Complexity:** $O(d)$ to process the string characters.
* **Space Complexity:** $O(d)$ to store the newly created string.

---

## Approach (JavaScript)
In JavaScript, we can implement both the mathematical and string approaches.

**Mathematical Approach:**
We extract the last digit using `n % 10` and build our reversed number with `rev = rev * 10 + digit`. JavaScript numbers are all floating-point under the hood. So, when we divide to remove the last digit, `12 / 10` becomes `1.2`. To force it to behave like integer division, we use `Math.floor()`.

```javascript
let rev = 0;
let digit = n % 10;
rev = rev * 10 + digit;
n = Math.floor(n / 10); // Crucial: forces integer division
```
* **Time Complexity:** $O(d)$ or $O(\log_{10}(n))$ where $d$ is the number of digits.
* **Space Complexity:** $O(1)$ memory.

**String Manipulation Approach:**
JavaScript doesn't have a built-in reverse method for strings, but it does for arrays. So, we convert the number to a string, `.split('')` it into an array of individual characters, `.reverse()` the array, and `.join('')` it back into a single string. Finally, `parseInt()` or the unary plus operator `+` converts it back to a number.

```javascript
let str = n.toString(); // "200"
let reversedStr = str.split('').reverse().join(''); // "002"
let finalNum = parseInt(reversedStr, 10); // 2
```
* **Time Complexity:** $O(d)$ to split, reverse, and join the array/string.
* **Space Complexity:** $O(d)$ to hold the array of characters.

---

## Solution: Mathematical Approach
Time: O(d)
Space: O(1)

```cpp
class Solution {
  public:
    int reverseDigits(int n) {
        int rev = 0;
        
        while (n > 0) {
            int digit = n % 10;       // Extract the last digit
            rev = rev * 10 + digit;   // Append to the reversed number
            n /= 10;                  // Remove the last digit from n
        }
        
        return rev;
    }
};
```

```java
class Solution {
    public int reverseDigits(int n) {
        int rev = 0;
        
        while (n > 0) {
            int digit = n % 10;       // Extract the last digit
            rev = rev * 10 + digit;   // Append to the reversed number
            n /= 10;                  // Remove the last digit from n
        }
        
        return rev;
    }
}
```

```python
class Solution:
    def reverseDigits(self, n):
        rev = 0
        
        while n > 0:
            digit = n % 10         # Extract the last digit
            rev = rev * 10 + digit # Append to the reversed number
            n = n // 10            # Remove the last digit using floor division
            
        return rev
```

```javascript
class Solution {
    reverseDigits(n) {
        let rev = 0;
        
        while (n > 0) {
            let digit = n % 10;          // Extract the last digit
            rev = rev * 10 + digit;      // Append to the reversed number
            n = Math.floor(n / 10);      // Remove the last digit
        }
        
        return rev;
    }
}
```

## Solution: String Manipulation
Time: O(d)
Space: O(d)

```cpp
class Solution {
  public:
    int reverseDigits(int n) {
        string s = to_string(n);         // Convert number to string
        reverse(s.begin(), s.end());     // Reverse string in place
        return stoi(s);                  // Convert back to integer (removes leading zeroes)
    }
};
```

```java
class Solution {
    public int reverseDigits(int n) {
        // Convert to string, reverse using StringBuilder, parse back to int
        return Integer.parseInt(new StringBuilder(String.valueOf(n)).reverse().toString());
    }
}
```

```python
class Solution:
    def reverseDigits(self, n):
        # Convert to string, slice backwards, parse back to integer
        return int(str(n)[::-1])
```

```javascript
class Solution {
    reverseDigits(n) {
        // Convert to string, split into array, reverse, join, parse to int
        return parseInt(n.toString().split('').reverse().join(''), 10);
    }
}
```