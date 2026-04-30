---
id: print-n-to-1-without-loop
time: O(N)
space: O(N)
---

## Overview
The objective of this problem is to print all numbers counting down from `n` to `1` on a single line, separated by spaces. The major constraint is that we are strictly prohibited from using iterative loops like `for` or `while`. 

Whenever a problem asks you to repeat an action but forbids loops, the solution is almost always **recursion**. 

## Concepts
* **Recursion:** A programming technique where a function solves a problem by calling itself with a smaller input.
    * *Analogy:* Imagine a countdown for a rocket launch. The announcer shouts "10!", then hands the microphone to the next person who shouts "9!", who hands it to the next, until someone shouts "1!" and the rocket launches.
* **Base Case:** The crucial stopping condition in a recursive function. Without it, the function would call itself forever, leading to an infinite loop (or more accurately, a Stack Overflow).
    * *Analogy:* If the announcer didn't know to stop at "1!", they'd keep handing the microphone off to shout "0!", "-1!", "-2!" forever. The base case is the rule that says, "If the number is 0, just stop and hand the mic back."
* **The Call Stack:** The computer's internal memory space used to keep track of active, running functions. Every time a function calls itself, a new "frame" is added to the top of this stack. 

## Approach
To print numbers counting down from `n` to `1` using recursion, we need to think about the order of operations. 

If we want `n` to appear first on the screen, we must print it *before* we make our recursive call. This is the opposite of printing from `1` to `n` (where we make the recursive call first to let the smaller numbers print, and then print `n` last).

1.  **Base Case:** First, check if `n` is `0`. If it is, we `return` to stop the recursion.
2.  **Action:** We print our current value of `n` followed by a space.
3.  **Recursive Call:** We call the function again for `n - 1`. This effectively says: "I've printed my number, now go handle everything smaller than me."

Because we print the number immediately upon entering the function, the largest number (`n`) prints first, followed by `n-1`, all the way down to `1`.

**Time and Space Complexity:**
* **Time Complexity:** O(N). We make exactly `N` function calls to count down to our base case (`0`). Each call takes O(1) time to execute the print statement.
* **Space Complexity:** O(N). The computer must pause and remember `N` active function calls on the Call Stack before the deepest call (the base case) finally returns and allows all the paused functions to finish.

## Approach (C++)
In C++, we implement this by completing the `void` function `printNos(int n)`. 

First, we set up our **base case**: `if (n == 0) return;`. This ensures our program doesn't run infinitely into negative numbers.
Next, we immediately use `cout` to print `n` followed by a space. 
Finally, *after* printing, we make the recursive call to `printNos(n - 1)`. 

```cpp
// Mini snippet showing the core logic order
if (n == 0) return;   // Stop if n reaches 0
cout << n << " ";     // 1. Print current number first
printNos(n - 1);      // 2. Delegate smaller numbers
```

**Complexity:**
* **Time Complexity:** O(N) because the function recursively invokes itself `n` times, doing constant O(1) work (printing) each time.
* **Space Complexity:** O(N) because each of the `n` function calls requires memory on the C++ Call Stack until the base case is reached.

## Approach (Java)
In Java, we build out the `void printNos(int n)` method. We immediately establish our stopping condition: if `n` is `0`, we `return`.

To format the output correctly on a single line, we must use `System.out.print()` instead of `System.out.println()`. We print `n` *before* we make the recursive call to `printNos(n - 1)`. By doing it in this order, the current `n` prints immediately, giving us the descending `n` down to 1 sequence.

```java
// Mini snippet showing the core logic order
if (n == 0) return;           // Base case
System.out.print(n + " ");    // 1. Print current n on the same line
printNos(n - 1);              // 2. Tell Java to handle n-1 next
```

**Complexity:**
* **Time Complexity:** O(N). The code makes exactly `N` recursive calls, decrementing `n` by 1 each time.
* **Space Complexity:** O(N). The Java Virtual Machine (JVM) uses the Call Stack to keep track of every active method call. `N` calls mean O(N) memory consumed.

## Approach (Python)
In Python, we define the base case `if n == 0: return`. 

To recursively call the method from within the class, we use `self.printNos(n - 1)`. However, we must print `n` *before* this call to get the descending order. Since Python's `print()` automatically adds a newline, we use the `end=" "` argument to keep everything on the same line separated by spaces.

```python
# Mini snippet showing the core logic order
if n == 0: return      # Base case
print(n, end=" ")      # 1. Print without a newline
self.printNos(n - 1)   # 2. Recursive leap for the next smaller number
```

**Complexity:**
* **Time Complexity:** O(N). We execute `n` function calls sequentially.
* **Space Complexity:** O(N). Each active function call takes up a frame on the Call Stack. *(Python handles recursion up to a depth of 1000 by default, which perfectly matches our constraint $1 \le n \le 1000$.)*

## Approach (JavaScript)
In JavaScript, our base condition is `if (n === 0) return;`. 

We must print the number first, then recursively call `this.printNos(n - 1)`. A crucial detail in JavaScript (specifically for terminal/backend environments like Node.js) is that `console.log()` always forces a line break. To print strictly on a single line as the problem requests, we use `process.stdout.write()`.

```javascript
// Mini snippet showing the core logic order
if (n === 0) return;              // Base case
process.stdout.write(n + " ");    // 1. Print exactly the string provided
this.printNos(n - 1);             // 2. Delegate to the smaller problem
```

**Complexity:**
* **Time Complexity:** O(N). The function runs `n` times, performing an O(1) print operation each time.
* **Space Complexity:** O(N) due to the JavaScript execution stack holding `n` frames at maximum depth before the base case is hit.

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
        
        // Print the current number followed by a space
        cout << n << " ";
        
        // Recursive call: process all smaller numbers next
        printNos(n - 1);
    }
};
```

```java
class Solution {
    void printNos(int n) {
        // Base case: if n is 0, stop and return
        if (n == 0) {
            return;
        }
        
        // Print the current number followed by a space on the same line
        System.out.print(n + " ");
        
        // Recursive call: process all smaller numbers next
        printNos(n - 1);
    }
}
```

```python
class Solution:
    def printNos(self, n):
        # Base case: if n is 0, stop and return
        if n == 0:
            return
            
        # Print the current number, replacing the default newline with a space
        print(n, end=" ")
        
        # Recursive call: process all smaller numbers next
        self.printNos(n - 1)
```

```javascript
/**
 * @param {number} n
 * @returns {void}
 */
class Solution {
    printNos(n) {
        // Base case: if n is 0, stop and return
        if (n === 0) {
            return;
        }
        
        // Print strictly on the same line without a newline
        process.stdout.write(n + " ");
        
        // Recursive call: process all smaller numbers next
        this.printNos(n - 1);
    }
}
```