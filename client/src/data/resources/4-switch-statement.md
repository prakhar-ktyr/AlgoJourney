---
id: 4
time: O(1)
space: O(1)
concepts:
  - Switch Statements
  - Arrays / Lists
  - Basic Geometry
---

## Overview
This problem mimics a classic "Main Menu" in software. A user gives us a `choice` (either 1 or 2), and based on that choice, we need to perform a specific action using the data provided in a list named `arr`.
* **Choice 1:** Calculate the area of a circle. The list will contain one number: the radius (R).
* **Choice 2:** Calculate the area of a rectangle. The list will contain two numbers: the length (L) and breadth (B).

This exercise teaches you two vital skills: how to route logic using a **Switch Statement**, and how to extract data from an **Array or List**.

## Approach
To solve this, we need to understand **Zero-Based Indexing**. In almost all programming languages, lists and arrays start counting at zero. 
* To get the first item (the Radius or the Length), we ask for the item at index `0`.
* To get the second item (the Breadth), we ask for the item at index `1`.

Once we extract the numbers, we just apply standard geometry formulas:
* **Area of a Circle:** `π * R * R`
* **Area of a Rectangle:** `L * B`

Let's look at how to structure the Switch statement for your language!

## Approach (C++)
In C++, a `switch` statement looks at the integer `choice` and jumps directly to the matching `case`. 

A common beginner mistake in C++ is forgetting to add a `break;` statement at the end of each case, which causes the code to "fall through" and execute the next cases accidentally. However, because we are using the `return` keyword to immediately send the answer back, we don't need `break` statements here—`return` automatically exits the switch and the function!

To get the value of Pi, we can use `M_PI` which is available in the `<cmath>` library.

```cpp
// How to grab values from a C++ vector
double R = arr[0];          // First item
double L = arr[0];          // First item
double B = arr[1];          // Second item
```

## Approach (Java)
Java's `switch` statement works exactly like C++. It evaluates the `choice` variable and executes the corresponding `case` block. Because we are directly returning the calculated value, we safely exit the switch block without needing `break` statements.

There are two Java-specific details to remember here:
1. **List Extraction:** Unlike arrays which use brackets `[]`, Java `List` objects require you to use the `.get()` method to extract data (e.g., `arr.get(0)`).
2. **Math.PI:** Java has a built-in `Math` class that provides the exact value of Pi.

```java
// How to grab values from a Java List
double R = arr.get(0);      // First item
double L = arr.get(0);      // First item
double B = arr.get(1);      // Second item
```

## Approach (Python)
Historically, Python did not have a `switch` statement! Programmers just used an `if-elif-else` chain. 

While Python 3.10 introduced the `match-case` statement (which acts like a switch), competitive programming platforms often run slightly older versions of Python. Therefore, using standard `if-elif` is the safest and most common way to solve this. 

To use Pi, you must import the `math` module and call `math.pi`.

```python
# How to grab values from a Python list
R = arr[0]                  # First item
L = arr[0]                  # First item
B = arr[1]                  # Second item
```

## Approach (JavaScript)
JavaScript uses the exact same `switch` syntax as Java and C++. 

You will use standard bracket notation (`arr[0]`) to grab the elements out of the array, and JavaScript's built-in `Math.PI` property to calculate the area of the circle.

```javascript
// How to grab values from a JS array
let R = arr[0];             // First item
let L = arr[0];             // First item
let B = arr[1];             // Second item
```

## Solution

```cpp
#include <cmath>

class Solution {
  public:
    double switchCase(int choice, vector<double> &arr) {
        switch(choice) {
            case 1:
                // Circle: Area = Pi * R * R
                return M_PI * arr[0] * arr[0];
            case 2:
                // Rectangle: Area = L * B
                return arr[0] * arr[1];
            default:
                return 0.0;
        }
    }
};
```

```java
import java.util.List;

class Solution {
    static double switchCase(int choice, List<Double> arr) {
        switch(choice) {
            case 1:
                // Circle: Area = Pi * R * R
                return Math.PI * arr.get(0) * arr.get(0);
            case 2:
                // Rectangle: Area = L * B
                return arr.get(0) * arr.get(1);
            default:
                return 0.0;
        }
    }
}
```

```python
import math

class Solution:
    def switchCase(self, choice, arr):
        if choice == 1:
            # Circle: Area = Pi * R * R
            return math.pi * arr[0] * arr[0]
        elif choice == 2:
            # Rectangle: Area = L * B
            return arr[0] * arr[1]
        
        return 0.0
```

```javascript
class Solution {
    switchCase(choice, arr) {
        switch(choice) {
            case 1:
                // Circle: Area = Pi * R * R
                return Math.PI * arr[0] * arr[0];
            case 2:
                // Rectangle: Area = L * B
                return arr[0] * arr[1];
            default:
                return 0.0;
        }
    }
}
```