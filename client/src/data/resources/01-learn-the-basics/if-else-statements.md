---
id: 3
time: O(1)
space: O(1)
concepts:
  - Control Flow
  - If-Else Statements
  - Relational Operators
---

## Overview
Normally, a computer reads your code from top to bottom, executing every single line. But what if you only want the computer to run a certain piece of code *sometimes*? 

This is where **Control Flow** comes in. By using **If-Else** statements, you create a "fork in the road" for your program. You ask the computer a yes-or-no question (a condition). If the answer is yes, it goes down one path; if the answer is no, it takes another. 

In this problem, we need to look at two numbers (`n` and `m`) and make a decision on which text to return based on how they compare to each other.

## Approach
To compare numbers, programming languages use **Relational Operators**. The most common ones are:
* `<` (Less than)
* `>` (Greater than)
* `==` (Equal to)

**A Crucial Beginner Trap:** Notice that checking for equality uses *two* equals signs (`==`). A single equals sign (`=`) is the *Assignment Operator* (used to store a value inside a variable, like `int x = 5`). If you use a single equals sign inside an `if` statement, your code will break!

Our strategy is simple:
1. Check if `n` is less than `m`. If true, return `"lesser"`.
2. Otherwise, check if `n` is exactly equal to `m`. If true, return `"equal"`.
3. If both of the above are false, `n` *must* be greater than `m`. We don't even need to ask the question—we can just use a final fallback to return `"greater"`.

## Approach (C++)
In C++, we construct our logic using `if`, `else if`, and `else` blocks. The condition we are checking goes inside parentheses `()`, and the code we want to run goes inside curly braces `{}`.

Since the problem asks us to return text, we will be returning a C++ `string`. Remember to always wrap your text in double quotes!

```cpp
if (n < m) {
    return "lesser";
} else if (n == m) {
    return "equal";
} else {
    // If it's not lesser and not equal, it HAS to be greater!
    return "greater"; 
}
```

## Approach (Java)
In Java, decision-making syntax is virtually identical to C++. We use `if`, `else if`, and `else`. 

Because the function signature asks us to return a `String` object, we just need to ensure our return values are wrapped in double quotes. 

```java
if (n < m) {
    return "lesser";
} else if (n == m) {
    return "equal";
} else {
    // The final 'else' acts as a catch-all if previous conditions were false.
    return "greater";
}
```

## Approach (Python)
Python handles decision-making a bit differently than C++ or Java. 
1. Instead of `else if`, Python uses the shortened keyword **`elif`**.
2. Instead of using curly braces `{}`, Python relies entirely on **indentation** (spacing). You put a colon `:` at the end of your condition, and indent the code underneath it so Python knows that code belongs to the `if` statement.

```python
if n < m:
    return "lesser"
elif n == m:
    return "equal"
else:
    # If it's not strictly less or strictly equal, it must be greater.
    return "greater"
```

## Approach (JavaScript)
In JavaScript, the syntax for `if` and `else if` looks exactly like C++ and Java. 

However, JavaScript is famous for having two equality operators: `==` (loose equality) and `===` (strict equality). Strict equality checks if both the value *and* the data type are exactly the same. Since we know both inputs are guaranteed to be numbers here, standard `==` works perfectly, but using `===` is considered a best practice in modern JavaScript!

```javascript
if (n < m) {
    return "lesser";
} else if (n === m) {
    return "equal";
} else {
    return "greater";
}
```

## Solution

```cpp
class Solution {
  public:
    string compareNM(int n, int m) {
        if (n < m) {
            return "lesser";
        } else if (n == m) {
            return "equal";
        } else {
            return "greater";
        }
    }
};
```

```java
class Solution {
    public static String compareNM(int n, int m) {
        if (n < m) {
            return "lesser";
        } else if (n == m) {
            return "equal";
        } else {
            return "greater";
        }
    }
}
```

```python
class Solution:
    def compareNM(self, n : int, m : int) -> str:
        if n < m:
            return "lesser"
        elif n == m:
            return "equal"
        else:
            return "greater"
```

```javascript
class Solution {
    /**
    * @param number n
    * @param number m
    * @returns string
    */
    compareNM(n, m) {
        if (n < m) {
            return "lesser";
        } else if (n == m) {
            return "equal";
        } else {
            return "greater";
        }
    }
}
```