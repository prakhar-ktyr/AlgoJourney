---
id: 2
time: O(1)
space: O(1)
concepts:
  - Data Types
  - Conditional Statements
---

## Overview
Think of your computer's memory like a massive storage warehouse. When you create a variable to hold data, the computer needs to assign it a "box" in that warehouse. 

A **Data Type** tells the computer exactly what kind of data you want to store (like text or numbers) and, crucially, **how big the box needs to be**. Memory size is measured in "bytes". A tiny piece of data, like a single letter, needs a very small box (1 byte). A massive, highly precise decimal number needs a much larger box (8 bytes).

In this problem, we are given the name of a data type as a text string, and we need to return the size of the "box" (in bytes) it requires.

## Approach
Because we are taking a string (like "Long" or "Float") and converting it into a specific number based on rules, this is the perfect time to use **Conditional Statements**. 

Conditional statements allow our code to make decisions. We can look at the input text and say: *"If the text is 'Integer', return 4. Otherwise, if the text is 'Long', return 8."* Depending on the programming language, we can do this using either an `if-else` chain or a `switch` statement.

## Approach (C++)
In C++, comparing text (strings) is done using an `if-else if` chain. 

You might wonder, why not use a `switch` statement? In C++, `switch` statements only work on numbers (integers or characters). They cannot be used to evaluate `std::string` objects. Therefore, we chain together `if` and `else if` conditions using the equality operator (`==`) to check which data type was passed in.

```cpp
// Example of how the logic flows:
if (str == "Integer") {
    return 4;
} else if (str == "Long") {
    return 8;
}
```
*Fun Fact: In real C++ development, you don't have to memorize these! You can use the built-in `sizeof(int)` operator, and C++ will automatically tell you how many bytes it takes up on your specific computer!*

## Approach (Java)
In Java, we can elegantly solve this using a `switch` statement. 

Before Java 7, `switch` statements only worked with numbers. But modern Java allows us to pass a `String` directly into a `switch` block. This is much cleaner and easier to read than writing a long chain of `if-else` statements.

We can also group cases together. Since "Integer" and "Float" both take 4 bytes, we can stack them on top of each other so they share the same `return 4;` command.

```java
// Grouping cases in Java:
switch (str) {
    case "Integer":
    case "Float":
        return 4; // Both Integer and Float will trigger this return!
}
```

## Approach (Python)
Python does not have a traditional `switch` statement like Java or C++ (though it recently added `match-case` in version 3.10). For beginners, the best and most standard way to make these decisions is using an `if-elif-else` chain.

To make our code clean, instead of writing `str == "Integer" or str == "Float"`, we can check if the string exists inside a small list using the `in` keyword!

```python
# Clean Python conditional checking:
if str in ["Integer", "Float"]:
    return 4
```
*Note on Python memory: Python is a high-level language, meaning it dynamically changes the size of integers behind the scenes based on how large the number gets. However, for this problem, we are returning the standard fixed sizes found in traditional languages.*

## Approach (JavaScript)
In JavaScript, we can use a `switch` statement to evaluate the string perfectly. A `switch` statement takes our variable and checks it against different `case` labels. As soon as it finds a match, it executes the code inside that case.

Because both "Integer" and "Float" have a size of 4 bytes, we can stack their case labels so we don't have to write the same `return` statement twice.

```javascript
// Stacking cases in JavaScript:
switch (str) {
    case "Long":
    case "Double":
        return 8; // If it's Long OR Double, return 8
}
```
*Note on JS memory: Under the hood, JavaScript represents almost all numbers as 8-byte Double Precision Floats! But for the sake of this computer science fundamental, we will return the classic sizes.*

## Solution

```cpp
class Solution {
public:
    int dataTypeSize(string str) {
        if (str == "Character") {
            return 1;
        } else if (str == "Integer" || str == "Float") {
            return 4;
        } else if (str == "Long" || str == "Double") {
            return 8;
        }
        return -1; // Fallback 
    }
};
```

```java
class Solution {
    static int dataTypeSize(String str) {
        switch (str) {
            case "Character": 
                return 1;
            case "Integer":
            case "Float": 
                return 4;
            case "Long":
            case "Double": 
                return 8;
            default: 
                return -1; // Fallback
        }
    }
}
```

```python
class Solution:
    def dataTypeSize(self, str):
        if str == "Character":
            return 1
        elif str in ["Integer", "Float"]:
            return 4
        elif str in ["Long", "Double"]:
            return 8
            
        return -1 # Fallback
```

```javascript
class Solution {
    dataTypeSize(str) {
        switch (str) {
            case "Character": 
                return 1;
            case "Integer":
            case "Float": 
                return 4;
            case "Long":
            case "Double": 
                return 8;
            default: 
                return -1; // Fallback
        }
    }
}
```