---
id: 7
time: O(1)
space: O(1)
concepts:
  - Iteration
  - While Loops
  - Arithmetic
---

## Overview
While a `for` loop is great when you know exactly how many times you want to run a block of code, a **While Loop** is used when you want code to repeat *as long as a specific condition is true*. Think of it as a repeating `if` statement.

In this problem, we need to print the multiplication table of a given number `n`, but in **reverse order** (starting from `n * 10` and going down to `n * 1`). 

## Approach
To solve this using a `while` loop, we need to keep track of a multiplier and decrease it step by step. Our logic will follow these steps:
1. Create a variable called `multiplier` and set its initial value to `10`.
2. Start a `while` loop that will continue to run as long as `multiplier >= 1`.
3. Inside the loop, calculate `n * multiplier` and print the result followed by a space.
4. **Crucial step:** Decrease the `multiplier` by 1 at the end of the loop. If we forget this step, the loop will run forever, creating an "infinite loop"!

## Approach (C++)
In C++, a `while` loop evaluates the condition inside the parentheses `()`. If it evaluates to `true`, the code inside the curly braces `{}` executes. 

To decrease our multiplier by 1 each time, we can use the decrement operator `--`. We will use `cout` to print the calculated product followed by a space string `" "` to format the output exactly as requested.

```cpp
int multiplier = 10;

while (multiplier >= 1) {
    // Print the product and a space
    cout << (n * multiplier) << " ";
    
    // Decrease the multiplier
    multiplier--; 
}
```

## Approach (Java)
In Java, a `while` loop checks the boolean condition inside the parentheses `()`. As long as that condition remains `true`, the code inside the curly braces `{}` will repeatedly execute.

To print the numbers on the same line separated by spaces, we must use `System.out.print()` instead of `System.out.println()`. We will also use the decrement operator `--` to reduce our multiplier by 1 during each lap of the loop.

```java
int multiplier = 10;

while (multiplier >= 1) {
    // Print the product and a space on the same line
    System.out.print((n * multiplier) + " ");
    
    // Decrease the multiplier
    multiplier--;
}
```

## Approach (Python)
In Python, a `while` loop evaluates the condition followed by a colon `:`. The code that belongs to the loop must be indented underneath it.

By default, Python's `print()` function automatically moves to a new line after printing. Since the problem asks us to print the numbers on a single line separated by spaces, we need to override this default behavior by adding `end=" "` inside our print function. To decrease our multiplier, we use the `-=` operator.

```python
multiplier = 10

while multiplier >= 1:
    # Print the product and force a space instead of a new line
    print(n * multiplier, end=" ")
    
    # Decrease the multiplier
    multiplier -= 1
```

## Approach (JavaScript)
In JavaScript, a `while` loop checks the condition inside the parentheses `()`. As long as the condition is `true`, the code block inside the curly braces `{}` runs.

Because standard `console.log()` prints everything on a new line, the cleanest way to format our output as a single line of space-separated numbers is to create an empty string, add our numbers to it during the loop, and then print the final string at the very end. We use the decrement operator `--` to reduce our multiplier.

```javascript
let multiplier = 10;
let result = "";

while (multiplier >= 1) {
    // Add the calculated number and a space to our string
    result += (n * multiplier) + " ";
    
    // Decrease the multiplier
    multiplier--;
}

// Print the final accumulated string
console.log(result.trim());
```

## Solution

```cpp
class Solution {
  public:
    void calculateMultiples(int n) {
        int multiplier = 10;
        
        while (multiplier >= 1) {
            cout << (n * multiplier) << " ";
            multiplier--;
        }
        cout << "\n";
    }
};
```

```java
class Solution {
    public void calculateMultiples(int n) {
        int multiplier = 10;
        
        while (multiplier >= 1) {
            System.out.print((n * multiplier) + " ");
            multiplier--;
        }
        System.out.println();
    }
}
```

```python
class Solution:
    def calculateMultiples(self, n):
        multiplier = 10
        
        while multiplier >= 1:
            print(n * multiplier, end=" ")
            multiplier -= 1
        print()
```

```javascript
class Solution {
    calculateMultiples(n) {
        let multiplier = 10;
        let result = "";
        
        while (multiplier >= 1) {
            result += (n * multiplier) + " ";
            multiplier--;
        }
        console.log(result.trim());
    }
}
```