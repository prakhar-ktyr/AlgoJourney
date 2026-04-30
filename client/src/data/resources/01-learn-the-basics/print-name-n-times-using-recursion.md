---
id: print-gfg-n-times
time: O(N)
space: O(1)
---

## Overview
The goal of this problem is to output the string `"GFG"` exactly `n` times, ensuring all prints happen on a single line with a space separating each occurrence. This is a foundational exercise in controlling program flow and understanding how to repeat tasks.

## Concepts
* **Iteration (Loops):** A core programming concept where you tell the computer to repeat a block of code a specific number of times. 
    * *Analogy:* Imagine you have to stamp an approval seal on `n` different documents. Instead of writing out instructions for every single document, you just say, "Repeat the stamping action `n` times."
* **Recursion:** An alternative to loops where a function calls itself to break a task down into smaller pieces until it hits a stopping point (a base case).
    * *Analogy:* Imagine passing a stack of `n` flyers to a person. They hand out one flyer, then pass the remaining `n-1` flyers to the next person, continuing until there are no flyers left.
* **Standard I/O (Input/Output):** Managing how data flows into your program (like reading `n` from a user) and how it flows out (printing to the screen without automatically jumping to a new line).

## Approach
There are two main ways to solve this problem: 

1. **Iterative Approach (Using a Loop):**
   This is the most direct method. We set up a `for` loop or `while` loop that runs exactly `n` times. Inside the loop, we print `"GFG "`. 
   * **Time Complexity:** O(N) because the loop runs `n` times, executing a constant-time print operation in each iteration.
   * **Space Complexity:** O(1) because we are only using a single integer variable for our loop counter. Memory usage does not grow with `n`.

2. **Recursive Approach:**
   We create a function that takes `n` as a parameter. If `n` is `0` (our base case), the function stops. Otherwise, it prints `"GFG "` and then calls itself with `n - 1`. 
   * **Time Complexity:** O(N) because we make `n` sequential function calls.
   * **Space Complexity:** O(N) because each time a function calls itself, the computer uses a bit of memory on the "Call Stack" to keep track of the active functions. For `n` calls, it uses O(N) memory.

## Approach (C++)
In C++, we can solve this iteratively or recursively. The provided starter code relies on the standard `main()` function reading the input `n` using `cin`.

**Iterative Method:**
We use a standard `for` loop starting at `0` and ending just before `n`. We use `cout` to print the string. C++ does not add newlines unless you explicitly use `endl` or `\n`, so just printing `"GFG "` works perfectly.
```cpp
// Iterative mini-snippet
for (int i = 0; i < n; i++) {
    cout << "GFG ";
}
```
* **Time Complexity:** O(N) as the loop iterates `n` times.
* **Space Complexity:** O(1) as we only allocate memory for the counter variable `i`.

**Recursive Method:**
We define a separate `void` function above `main` that handles the printing. It checks if `n == 0` to stop, prints `"GFG "`, and calls itself with `n - 1`.
* **Time Complexity:** O(N) due to `n` recursive calls.
* **Space Complexity:** O(N) due to the call stack frames created by recursion.

## Approach (Java)
In Java, the starter code provides the `main` method and a `Scanner` to read `n`. 

**Iterative Method:**
We use a `for` loop. The key in Java is to use `System.out.print()` instead of `System.out.println()`. `print()` outputs text to the console without adding a carriage return (newline) at the end, ensuring everything stays on a single line separated by spaces.
```java
// Iterative mini-snippet
for (int i = 0; i < n; i++) {
    System.out.print("GFG ");
}
```
* **Time Complexity:** O(N) because the loop executes `n` times.
* **Space Complexity:** O(1) because we only use a single primitive variable `i` for counting.

**Recursive Method:**
We can write a separate `static` helper method outside of `main` that takes `n`, prints, and calls itself with `n - 1` until it hits `0`. 
* **Time Complexity:** O(N) due to the `n` recursive method calls.
* **Space Complexity:** O(N) because Java uses call stack memory for each active method invocation.

## Approach (Python)
In Python, standard execution flows from top to bottom. The starter code gives us `n = int(input())`.

**Iterative Method:**
Python's `for` loops iterate over sequences. We can use `range(n)` to generate a sequence of `n` numbers. To prevent Python's `print()` from automatically jumping to a new line, we use the `end=" "` parameter. This tells Python to append a space instead of a newline at the end of the print statement.
```python
# Iterative mini-snippet
for _ in range(n):
    print("GFG", end=" ")
```
* **Time Complexity:** O(N) since the loop loops `n` times.
* **Space Complexity:** O(1) because we are just keeping track of a simple loop iterator, requiring no extra scaling memory.

**Recursive Method:**
We define a helper function. If the count reaches `0`, we `return`. Otherwise, we print with `end=" "` and recursively call the function with `n - 1`.
* **Time Complexity:** O(N) for `n` sequential calls.
* **Space Complexity:** O(N) because of the memory consumed by the Python call stack.

## Approach (JavaScript)
The JavaScript starter code relies on reading from the standard input stream (common in Node.js environments). 

**Iterative Method:**
We construct a standard `for` loop. Since standard `console.log()` always appends a newline character in Node environments, we must use `process.stdout.write()` to print directly to the output stream without adding line breaks.
```javascript
// Iterative mini-snippet
for (let i = 0; i < n; i++) {
    process.stdout.write("GFG ");
}
```
* **Time Complexity:** O(N) since the loop executes exactly `n` times.
* **Space Complexity:** O(1) as we only define a single local variable `i`.

**Recursive Method:**
We define a helper function that takes the current count. If it is `0`, we exit the function. Otherwise, we write to `process.stdout` and recursively call the function with `n - 1`.
* **Time Complexity:** O(N) due to the `n` consecutive function invocations.
* **Space Complexity:** O(N) because of the execution context stacked in memory for each recursive call.

## Solution: Iterative Approach
Time: O(N)
Space: O(1)

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    // Read the input
    cin >> n;

    // Loop n times
    for(int i = 0; i < n; i++) {
        // Print GFG followed by a space
        cout << "GFG ";
    }
    
    return 0;
}
```

```java
import java.util.Scanner;

class GfG {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Loop from 0 to n-1
        for(int i = 0; i < n; i++) {
            // print() keeps output on the same line
            System.out.print("GFG ");
        }
        
        sc.close();
    }
}
```

```python
n = int(input())

# Loop exactly n times
# We use '_' since we don't actually need the loop variable's value
for _ in range(n):
    # end=" " prevents the default newline character
    print("GFG", end=" ")
```

```javascript
const n = parseInt(require('fs').readFileSync(0, 'utf-8').trim());

// Loop exactly n times
for (let i = 0; i < n; i++) {
    // process.stdout.write allows printing without appending a newline
    process.stdout.write("GFG ");
}
```

## Solution: Recursive Approach
Time: O(N)
Space: O(N)

```cpp
#include <iostream>
using namespace std;

// Recursive helper function
void printGFG(int n) {
    // Base case: stop when n reaches 0
    if (n == 0) return;
    
    // Print and space
    cout << "GFG ";
    
    // Recursive leap: do the rest
    printGFG(n - 1);
}

int main() {
    int n;
    cin >> n;

    // Call the recursive function
    printGFG(n);
    
    return 0;
}
```

```java
import java.util.Scanner;

class GfG {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Initiate the recursion
        printGFG(n);
        
        sc.close();
    }
    
    // Recursive helper method
    static void printGFG(int n) {
        // Base case: no more GFGs to print
        if (n == 0) return;
        
        System.out.print("GFG ");
        
        // Let the function call itself for the remaining count
        printGFG(n - 1);
    }
}
```

```python
n = int(input())

# Recursive helper function
def print_gfg(count):
    # Base case: if count is 0, exit
    if count == 0:
        return
        
    print("GFG", end=" ")
    
    # Call the function again with count decreased by 1
    print_gfg(count - 1)

# Start the recursion
print_gfg(n)
```

```javascript
const n = parseInt(require('fs').readFileSync(0, 'utf-8').trim());

// Recursive helper function
function printGFG(count) {
    // Base case: stop recurring
    if (count === 0) return;
    
    // Print to standard out
    process.stdout.write("GFG ");
    
    // Recurse down
    printGFG(count - 1);
}

// Start the sequence
printGFG(n);
```