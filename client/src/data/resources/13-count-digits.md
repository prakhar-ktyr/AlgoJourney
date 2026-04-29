---
id: 13
time: O(log N)
space: O(1)
---

## Overview
Imagine you have a large number, like `2446`, and you want to interrogate every single digit inside it. You want to ask each digit: *"Hey, can you divide the original number `2446` perfectly without leaving a remainder?"* The goal of this problem is to break down a given number `n` into its individual digits and check that divisibility condition for each one. If a digit divides `n` evenly, we count it. There is one important catch: mathematics forbids dividing by zero! So, if we encounter a `0` digit, we must ignore it and move on to the next one.

## Concepts
* **The Modulo Operator (`%`):** Think of this as the "remainder" machine. 
  * We use it to **extract digits**: Any number `% 10` gives you the very last digit (e.g., `123 % 10` is `3`).
  * We use it to **check divisibility**: If `A % B == 0`, it means `A` is perfectly divisible by `B` with no remainder.
* **Integer Division (`/` or `//`):** Think of this as the "chopping" machine. If we do `123 / 10`, it gives us `12`, effectively chopping off the last digit. This allows us to move through the number from right to left.
* **Short-Circuit Evaluation:** When checking multiple conditions (like `A > 0 AND B == 0`), if the first condition is false, the computer won't even check the second one. This is crucial here to prevent a "Divide by Zero" error.

## Approach
To solve this, we cannot just look at the number as a whole; we have to take it apart piece by piece, like unstacking a tower of blocks.

1. **Keep a Copy:** We need to divide the number by its digits, so we must keep the original number `n` safe. We'll create a temporary variable (let's call it `temp`) set to `n` so we can safely dismantle `temp` without losing the original `n`.
2. **Extract and Check:** While `temp` has digits left (is greater than 0):
   * Extract the last digit using `temp % 10`.
   * Check if this digit is strictly greater than `0`. (We must do this first to avoid dividing by zero!).
   * If it is greater than `0`, check if the original `n` modulo this digit is `0` (`n % digit == 0`).
   * If both conditions are true, increase our success counter.
3. **Chop and Repeat:** Remove the last digit from `temp` by dividing it by `10`. Repeat the process until `temp` reaches `0`.
4. **Return the Total:** Return the final count.

## Approach (C++)
In C++, integer division naturally truncates decimals, which makes chopping off the last digit very straightforward. The core of our strategy is a simple `while` loop. 

First, we copy the original number so we don't lose it.
```cpp
int temp = n; 
int count = 0;
```

Inside our loop, we use the modulo operator `%` to grab the right-most digit. 
```cpp
int digit = temp % 10; // If temp is 123, digit becomes 3
```

Then, we check our conditions. C++ evaluates the `&&` (AND) operator from left to right and will "short-circuit" (stop checking) if the first condition is false. By writing `digit > 0 && n % digit == 0`, we guarantee that C++ will never attempt to calculate `n % 0`, which would crash your program!

Finally, we update `temp` using `/=` to strip away the processed digit.
```cpp
temp /= 10; // If temp was 123, it becomes 12
```

## Approach (Java)
In Java, we utilize a standard `while` loop to dissect the number. Because `n` and `temp` are declared as `int`, division operations automatically discard any fractional parts. This is perfect for stripping digits!

We start by setting up our variables:
```java
int temp = n; // Preserve original n for divisibility checks
int count = 0;
```

We loop as long as `temp > 0`. In each iteration, we use the modulo operator to "peel" the last digit off the number.
```java
int digit = temp % 10;
```

Now for the critical check: Java uses short-circuit logic with the `&&` operator. We must check that `digit != 0` *before* we try to do `n % digit`. If we don't, encountering a zero will throw an `ArithmeticException` (divide by zero) and crash the program.
```java
if (digit > 0 && n % digit == 0) {
    count++;
}
```

We finish the loop cycle by chopping off the last digit: `temp = temp / 10;`.

## Approach (Python)
Python offers two fantastic ways to solve this. 

**Option 1: The Mathematical Way (Optimal Space)**
This approach relies on math to extract digits. We use a `while` loop. The key Python quirk here is integer division. Standard division (`/`) in Python returns a float (e.g., `123 / 10` is `12.3`). To chop off a digit like in C++ or Java, we MUST use the double-slash integer division operator (`//`).
```python
temp = n
digit = temp % 10
# Important: Use // to discard the decimal!
temp = temp // 10 
```

**Option 2: The String Way (Beginner Friendly & Concise)**
Python makes it incredibly easy to treat a number like a word. We can convert the number `n` into a string, look at each character (which is a digit), convert it back to an integer, and check it! This avoids the `while` loop entirely.
```python
# Convert number to string to iterate through digits easily
for char in str(n):
    digit = int(char)
    if digit > 0 and n % digit == 0:
        count += 1
```
Both are perfectly valid, but Option 1 is technically slightly more memory-efficient as it avoids creating new string objects in memory. We will provide Option 1 in the final solution as it translates best across all programming languages.

## Approach (JavaScript)
JavaScript has a unique quirk: **all numbers are floating-point under the hood**. This means if you simply divide a number by 10 (`temp = temp / 10`), you won't chop off the last digit; you'll just create a decimal (e.g., `123 / 10` becomes `12.3`).

To do integer division in JavaScript, we must wrap our math in `Math.floor()`. 

Here is how we set it up mathematically:
```javascript
let temp = n;
let count = 0;

while (temp > 0) {
    let digit = temp % 10; // Extract the last digit
    
    // Check if it's safe to divide, and if it divides evenly
    if (digit > 0 && n % digit === 0) {
        count++;
    }
    
    // CRITICAL: Force JS to act like integer division
    temp = Math.floor(temp / 10); 
}
```

*Note: JS developers often use string conversion too (`String(n).split('')`), but mastering the `Math.floor` approach is essential for interviews when interviewers ask for strict space complexity or mathematical logic.*

## Complexity
- **Time Complexity:** **O(log N)** or **O(d)** where **d** is the number of digits in the integer `n`. In each step of our `while` loop, we divide the number by 10, meaning the loop runs exactly as many times as there are digits in the number.
- **Space Complexity:** **O(1)**. We are only creating a few integer variables (`temp`, `count`, `digit`) to keep track of our state. The memory used does not grow, no matter how large the input number `n` is.

## Solution

```cpp
class Solution {
  public:
    // Function to count the number of digits in n that evenly divide n
    int evenlyDivides(int n) {
        int temp = n;    // Create a copy to dismantle
        int count = 0;   // Keep track of successful divisions
        
        while (temp > 0) {
            int digit = temp % 10; // Extract the right-most digit
            
            // Check if digit is not zero to prevent division by zero errors
            // Then check if the original n modulo digit leaves no remainder
            if (digit > 0 && n % digit == 0) {
                count++;
            }
            
            // Chop off the right-most digit from our temporary number
            temp /= 10;
        }
        
        return count;
    }
};
```

```java
class Solution {
    static int evenlyDivides(int n) {
        int temp = n;    // Create a copy to dismantle
        int count = 0;   // Keep track of successful divisions
        
        while (temp > 0) {
            int digit = temp % 10; // Extract the right-most digit
            
            // && short-circuits: If digit is 0, it stops checking and avoids crashing
            if (digit > 0 && n % digit == 0) {
                count++;
            }
            
            // Integer division naturally chops off the decimal/last digit
            temp /= 10;
        }
        
        return count;
    }
}
```

```python
class Solution:
    def evenlyDivides(self, n):
        temp = n       # Create a copy to dismantle
        count = 0      # Keep track of successful divisions
        
        while temp > 0:
            digit = temp % 10 # Extract the right-most digit
            
            # Check if digit is not zero, then check divisibility
            if digit > 0 and n % digit == 0:
                count += 1
                
            # Use // for integer division to chop off the last digit!
            temp = temp // 10 
            
        return count

        """
        # OPTION 2 (String approach - Highly Pythonic alternate):
        # count = 0
        # for char in str(n):
        #     digit = int(char)
        #     if digit > 0 and n % digit == 0:
        #         count += 1
        # return count
        """
```

```javascript
class Solution {
    // Function to check whether the number evenly divides n.
    evenlyDivides(n) {
        let temp = n;    // Create a copy to dismantle
        let count = 0;   // Keep track of successful divisions
        
        while (temp > 0) {
            let digit = temp % 10; // Extract the right-most digit
            
            // Ensure digit > 0 to avoid dividing by 0
            if (digit > 0 && n % digit === 0) {
                count++;
            }
            
            // Math.floor is CRITICAL here, otherwise JS keeps decimals
            // e.g., 12 / 10 becomes 1.2 instead of 1
            temp = Math.floor(temp / 10);
        }
        
        return count;
    }
}
```