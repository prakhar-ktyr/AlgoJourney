---
id: 1
time: O(1)
space: O(1)
concepts:
  - Input and Output
  - Basic Syntax
---

## Overview
This problem introduces the fundamental concept of **Input and Output (I/O)** in programming. 

You are given two integers, `A` and `B`. Your task is to calculate and return their mathematical product. Understanding how to read data provided by a user (Input) and display or return the calculated result (Output) is the absolute foundation of solving algorithmic challenges.

## Overview (Java)
This problem introduces the fundamental concept of **Formatted Output** in Java. 

You are given two pieces of data: a piece of text (a String named `S`) and a number (an Integer named `N`). Your task is to print them out across two separate lines in this exact format:
1. `The input string :[S]`
2. `The input integer :[N]`

Real-world software development often requires you to present data in a way that is readable to users, making this the perfect exercise to understand Java's printing mechanics.

## Approach
At its core, solving this problem simply requires applying the multiplication operator (`*`) to the two numbers. According to the constraints, the maximum possible value for A and B is 10,000, yielding a maximum product of 100,000,000. This comfortably fits inside standard 32-bit signed integer data types without overflowing.

Select your preferred programming language to see exactly how to handle reading and writing data in that language!

## Approach (C++)
In C++, we use the `<iostream>` library to handle reading and writing data.
- **Input:** We use `cin` (Character Input) alongside the extraction operator `>>` to grab values typed by the user.
- **Output:** We use `cout` (Character Output) alongside the insertion operator `<<` to display values back to the screen.

Here is what a complete C++ program looks like when reading two numbers and printing their product:

```cpp
#include <iostream>
using namespace std;

int main() {
    int A, B;
    // The program pauses here to read two numbers separated by a space
    cin >> A >> B; 
    
    // Calculate and print the result
    cout << A * B; 
    
    return 0;
}
```
*Note: In the `Solution` tab below, you only need to provide the function logic, as the platform's backend handles the `cin` and `cout` automatically!*

## Approach (Python)
Python makes Input and Output incredibly concise. Furthermore, Python's `int` type has arbitrary precision—meaning it handles massively large numbers automatically!
- **Input:** The `input()` function reads an entire line of text. Since the numbers are separated by a space, we chain it with `.split()` to chop the text into separate pieces. We then use `map(int, ...)` to convert those pieces of text into actual numbers.
- **Output:** The `print()` function simply prints whatever you put inside the parentheses.

Here is how you handle it in a full Python script:

```python
# Read a line of input, split it by spaces, and convert to integers
A, B = map(int, input().split())

# Print the mathematical product
print(A * B)
```
*Note: In the `Solution` tab below, you only need to provide the function logic, as the platform handles the `input()` automatically!*

## Approach (JavaScript)
While browser-based JavaScript uses alerts and prompts, competitive programming platforms use Node.js, meaning we must read from the "standard input" stream.
- **Input:** We commonly use the built-in `fs` (filesystem) module to read all the typed input at once, and then split it into an array of numbers using a Regular Expression (`/\s+/`) to handle spaces and newlines.
- **Output:** We use `console.log()` to print to the terminal.

Here is what a standard Node.js script looks like:

```javascript
const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
    let A = parseInt(input[0]);
    let B = parseInt(input[1]);
    console.log(A * B);
}
main();
```

## Approach (Java)
To solve this, we do not need to do any mathematical calculations. Instead, we need to instruct the computer to print text and variables together. In Java, joining text and variables is called **String Concatenation**, and it is done using the plus symbol (`+`). 

When you use `+` with a String, Java automatically converts the other variable (even if it's a number like `N`) into text and glues them together. 

To ensure the second sentence prints on a new line, we use `System.out.println()` instead of `System.out.print()`. The `println` method automatically moves the cursor to the next line after it finishes printing.

```java
// Java glues the exact text and the variable S together
System.out.println("The input string :" + S);

// It automatically converts N to text and glues it as well
System.out.println("The input integer :" + N);
```

## Solution

```cpp
class Solution {
public:
    int multiplication(int A, int B) {
        return A * B;
    }
};
```

```python
class Solution:
    def multiplication(self, A, B):
        return A * B
```

```javascript
class Solution {
    multiplication(A, B) {
        return A * B;
    }
}
```

```java
class Solution {
    static void printIntString(String S, int N) {
        System.out.println("The input string :" + S);
        System.out.println("The input integer :" + N);
    }
}
```