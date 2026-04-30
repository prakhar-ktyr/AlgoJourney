---
id: print-1-to-n-without-loop
time: O(N)
space: O(N)
---

## Overview
The goal of this problem is to print all integers from `1` up to a given number `n`, on a single line, separated by spaces. The catch? You are **strictly forbidden** from using loops (like `for` or `while`). 

To solve this, we must rely entirely on **recursion**—a technique where a function solves a problem by calling itself with smaller inputs.

## Concepts
* **Recursion:** When a function calls itself to break a problem down into smaller, more manageable pieces. 
    * *Analogy:* Imagine a boss who needs to stamp 5 papers. They stamp one, then hand the remaining 4 to their assistant. The assistant stamps one, and hands 3 to their junior, and so on. 
* **Base Case:** The condition that tells a recursive function to stop calling itself. Without it, the function would run forever (an infinite loop).
    * *Analogy:* The newest intern at the bottom of the chain has no one to hand papers to. Once they get 0 papers, they just report back "Done!"
* **The Call Stack:** The computer's internal memory mechanism for keeping track of active functions. When a function calls itself, the computer "pauses" the current function and puts it on a stack (like a stack of sticky notes) until the new function finishes.

## Approach
To print numbers from `1` to `n` using recursion, our first instinct might be to print `n` and then call the function for `n - 1`. However, if `n` is 5, that would print `5 4 3 2 1`. We need the reverse order!

The secret is to change *when* we print. Instead of printing and then delegating, we **delegate first, and print later**.
1.  **Base Case:** Check if `n` is `0`. If it is, we've gone too far. We `return` to stop the chain.
2.  **Recursive Call:** We call the function again for `n - 1`. This effectively tells the computer: "Pause my current task, and go handle all the numbers smaller than me."
3.  **Action:** Once that recursive call finishes and returns control to us, we print our current value of `n`. 

Because the computer resolves the smallest tasks first (the bottom of the call stack), `1` will finish and print first, then `2`, all the way back up to `n`.

**Time and Space Complexity:**
* **Time Complexity:** O(N). We make exactly `N` function calls to reach the base case (`0`). Each call takes O(1) time to execute the print statement.
* **Space Complexity:** O(N). Because we have to "pause" `N` function calls, the computer uses memory on the Call Stack to remember where it left off for each one.

## Approach (C++)
In C++, we implement this by creating a `void` function that takes `n` as an argument. 

First, we define our **base case**: `if (n == 0) return;`. This stops the recursion.
Next, we make the recursive call to `printNos(n - 1)`. 
Finally, *after* the recursive call, we use `cout` to print `n` followed by a space.

```cpp
// Mini snippet showing the core logic order
if (n == 0) return; 
printNos(n - 1);      // 1. Delegate smaller numbers
cout << n << " ";     // 2. Print our number AFTER smaller ones are done
```

**Complexity:**
* **Time Complexity:** O(N) because the function is invoked `n` times, decrementing by 1 each time until it hits 0.
* **Space Complexity:** O(N) because each of the `n` active function calls takes up a frame on the C++ execution stack.

## Approach (Java)
In Java, the logic is identical. We check if `n` is `0` to stop the recursion. 

The most important part is placing the `System.out.print` statement *after* the recursive call `printNos(n - 1)`. If you place the print statement before the recursive call, the numbers will print in descending order (`n` down to 1). By placing it after, the numbers wait in the Call Stack and print as the stack unwinds, giving us `1` up to `n`.

```java
// Mini snippet showing the core logic order
if (n == 0) return;
printNos(n - 1);              // 1. Tell Java to handle n-1 first
System.out.print(n + " ");    // 2. Print current n on the same line
```

**Complexity:**
* **Time Complexity:** O(N). The code makes exactly `N` recursive calls. The operations inside the method take constant O(1) time.
* **Space Complexity:** O(N). The Java Virtual Machine (JVM) limits how deep the call stack can go. For `N` recursive calls, the space used on the JVM Call Stack is directly proportional to `N`.

## Approach (Python)
In Python, we define the base case `if n == 0: return`. 

To call the function recursively from within the class, we must use `self.printNos(n - 1)`. 
Python's `print()` function automatically adds a newline at the end of whatever you print. To satisfy the problem's constraint of printing on a single line separated by spaces, we must use the `end=" "` argument in our print function.

```python
# Mini snippet showing the core logic order
if n == 0: return
self.printNos(n - 1)   # 1. Recursive leap of faith
print(n, end=" ")      # 2. Print without a newline
```

**Complexity:**
* **Time Complexity:** O(N). We are executing `n` function calls recursively.
* **Space Complexity:** O(N). Each active function call consumes memory on the Call Stack. *(Note: Python has a default recursion depth limit of 1000. For `N` up to $10^3$, this solution is perfectly safe, but larger `N` would require modifying `sys.setrecursionlimit()`.)*

## Approach (JavaScript)
In JavaScript, we structure our recursion with `if (n === 0) return;`. We use `this.printNos(n - 1)` to recursively call the method inside the class.

A quirk of JavaScript in terminal environments (like Node.js, which powers GfG and LeetCode backend testing) is that standard `console.log()` always appends a newline character. To print strictly on a single line with spaces, we use `process.stdout.write()`.

```javascript
// Mini snippet showing the core logic order
if (n === 0) return;
this.printNos(n - 1);             // 1. Delegate to the smaller problem
process.stdout.write(n + " ");    // 2. Print exactly the string provided
```

**Complexity:**
* **Time Complexity:** O(N). The function calls itself `n` times, doing O(1) work per call.
* **Space Complexity:** O(N) due to the JavaScript execution context stack holding `n` frames at maximum depth before they begin to resolve and pop off.

## Complexity
Time: O(N)
Space: O(N)

## Solution

```cpp
class Solution {
  public:
    void printNos(int n) {
        // Base case: if n is 0, stop and return
        if (n == 0) {
            return;
        }
        
        // Recursive call: process all smaller numbers first
        printNos(n - 1);
        
        // Print the current number followed by a space
        cout << n << " ";
    }
};
```

```java
class Solution {
    public void printNos(int n) {
        // Base case: if n is 0, stop and return
        if (n == 0) {
            return;
        }
        
        // Recursive call: process all smaller numbers first
        printNos(n - 1);
        
        // Print the current number followed by a space on the same line
        System.out.print(n + " ");
    }
}
```

```python
class Solution:    
    def printNos(self, n):
        # Base case: if n is 0, stop and return
        if n == 0:
            return
            
        # Recursive call: process all smaller numbers first
        self.printNos(n - 1)
        
        # Print the current number, replacing the default newline with a space
        print(n, end=" ")
```

```javascript
/**
 * @param {number} n
 * @returns { }
 */
class Solution {
    printNos(n) {
        // Base case: if n is 0, stop and return
        if (n === 0) {
            return;
        }
        
        // Recursive call: process all smaller numbers first
        this.printNos(n - 1);
        
        // Print strictly on the same line
        process.stdout.write(n + " ");
    }
}
```