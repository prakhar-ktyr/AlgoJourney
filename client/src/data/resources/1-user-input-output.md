---
id: 1
time: O(1)
space: O(1)
concepts:
  - Math
  - Basic Operators
  - Input and Output
---

## Overview
This problem requires us to find the product of two given integers, A and B. While the mathematical logic is incredibly straightforward, this problem serves as the perfect playground to understand how **Input and Output (I/O)** work.

Understanding how to read data provided by a user (Input) and display the calculated result back to them (Output) is the absolute foundation of building software and solving algorithmic challenges.

## Approach
At its core, solving this problem simply requires applying the multiplication operator (`*`) to the two numbers. According to the constraints, the maximum possible value for A and B is 10,000, yielding a maximum product of 100,000,000. This comfortably fits inside standard 32-bit signed integer data types without overflowing.

Select your preferred programming language to see exactly how to handle reading and printing these numbers!

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

## Approach (Java)
In Java, the most beginner-friendly way to read input is by using the `Scanner` class.
- **Input:** You must import `java.util.Scanner` and create a Scanner object. You can then use methods like `.nextInt()` to grab the next number the user types.
- **Output:** We use `System.out.print()` or `System.out.println()` (which adds a line break) to display text to the console.

Here is a complete Java program demonstrating this:

```java
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        // Create a scanner to read from standard input
        Scanner sc = new Scanner(System.in);
        
        // Read the two integers
        int A = sc.nextInt();
        int B = sc.nextInt();
        
        // Print the product
        System.out.println(A * B);
    }
}
```
*Note: In the `Solution` tab below, you only need to provide the function logic, as the platform's backend handles the `Scanner` boilerplate automatically!*

## Approach (Python)
Python makes Input and Output incredibly concise. Furthermore, Python's `int` type has arbitrary precision—meaning it handles massively large numbers automatically without you having to worry about integer limits!
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

Here is what a standard Node.js script looks like for this problem:

```javascript
const fs = require('fs');

function main() {
    // Read all input, trim whitespace, and split by spaces
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
    
    // Parse the strings into integers
    let A = parseInt(input[0]);
    let B = parseInt(input[1]);
    
    // Print the product
    console.log(A * B);
}
main();
```
*Note: In the `Solution` tab below, you only need to provide the class method, as the platform handles the Node.js `fs` reading automatically!*

## Complexity (Python)
Time: O(1)
Space: O(1)

## Solution

```cpp
class Solution {
public:
    int multiplication(int A, int B) {
        return A * B;
    }
};
```

```java
class Solution {
    static int multiplication(int A, int B) {
        return A * B;
    }
}
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