---
id: 8
time: O(1)
space: O(1)
---

## Overview
This problem introduces one of the most fundamental concepts in computer science: how functions receive data. When you pass a variable into a function, does the function get its own **copy** of the data, or does it get a **direct link** to the original variable?

We are given two numbers, `a` and `b`. Our goal is to add `1` to `a`, add `2` to `b`, and then return these two new values.

While the math is incredibly simple, the underlying concept of how `a` and `b` behave in memory varies wildly depending on the programming language you use. 

## Concepts
To understand what is happening, let's use a real-world analogy:

* **Pass by Value (The Photocopy):** Imagine you have a physical piece of paper with a recipe on it. You hand a *photocopy* of this recipe to a friend. If your friend crosses out an ingredient on their copy, your original paper remains untouched. The function gets a completely independent copy of the data.
* **Pass by Reference (The House Address):** Imagine you give a contractor the *address* to your house. They don't build a copy of your house; they go to that exact location. If they paint the walls blue, your actual house is now blue. The function gets a direct link to the original variable in memory.

## Approach
The problem description asks us to add `1` to the parameter passed by value, and `2` to the parameter passed by reference. 

This problem was originally designed for languages that allow you to explicitly choose how a variable is passed. Regardless of the language, our final goal is to calculate these updated values (`a + 1` and `b + 2`) and package them together into a single structure, like an Array or a List, to return them back.

## Approach (C++)
The problem description asks us to add `1` to the parameter passed by value, and `2` to the parameter passed by reference. 

If you look at the C++ function signature, it gives you absolute control over this memory: `vector<int> passedBy(int a, int &b)`

* **`int a` (Pass by Value):** Because there is no special symbol, `a` is a copy. If you do `a = a + 1;` inside the function, the original variable outside the function does not change.
* **`int &b` (Pass by Reference):** The ampersand (`&`) is the magic symbol. It tells C++ to pass the memory address of `b`. If you do `b = b + 2;` inside the function, the original variable *is permanently altered*.

To solve the problem, we do the math and return a `vector<int>`. You can do this step-by-step, or use a concise one-liner:

* **Option 1 (Step-by-Step):** Create an empty vector, use `.push_back()` to add the elements one by one, and return it.
* **Option 2 (Concise):** Use curly braces `{}` to create and return the vector in a single line.

## Approach (Java)
The problem description asks us to add `1` to the parameter passed by value, and `2` to the parameter passed by reference. This phrasing actually comes from C++, where you can manually force variables to act this way.

However, Java has a very strict rule: **Everything is Pass by Value.** For primitive types (like `int`, `double`, `boolean`), it passes a copy of the actual number. You cannot force Java to pass a primitive `int` by reference. 

Because we cannot alter the original `a` and `b` variables that the testing system gives us, we must adapt. To achieve the goal, we take the copies of `a` and `b`, add the required amounts, and bundle them into an array to send back.

You can create this array in two ways:
* **Option 1 (Step-by-Step):** Declare an array of size 2 (`new int[2]`), assign the values to index `0` and `1`, and return the array variable.
* **Option 2 (Concise):** Create an "anonymous array" by directly inserting the values into `new int[]{...}` and returning it immediately.

## Approach (Python)
The problem description asks us to add `1` to the parameter passed by value, and `2` to the parameter passed by reference. This phrasing actually comes from C++, where programmers can manually force variables to behave this way.

Python uses something called **Pass by Object Reference**. Everything in Python is an object, but objects are divided into two categories: *Mutable* (can be changed) and *Immutable* (cannot be changed).

Numbers (`int`) in Python are **immutable**. When you type `b = b + 2` inside the function, Python doesn't change the original number. Instead, it calculates the new number, creates a brand-new object in memory for it, and points your local variable `b` to that new object. 

Because we can't mutate the original integers, we just calculate the new values and package them in a standard Python list `[]`. 

* **Option 1 (Step-by-Step):** Create an empty list, use `.append()` to add the values, and return the list.
* **Option 2 (Concise):** Define the list and its contents on a single line `[a + 1, b + 2]`.

## Approach (JavaScript)
The problem description asks us to add `1` to the parameter passed by value, and `2` to the parameter passed by reference. This phrasing actually comes from C++, where you can manually force variables to act this way.

JavaScript distinguishes between *Primitives* (Numbers, Strings, Booleans) and *Objects* (Arrays, Functions, Objects). 

Primitives are **strictly passed by value**. When the function `passedBy(a, b)` is called, JavaScript creates local copies of the numbers. Modifying `a` or `b` inside the function will have zero effect on the original variables outside the function.

To provide the answer, we do the arithmetic and return a standard JavaScript array `[]` containing the updated numbers.

* **Option 1 (Step-by-Step):** Create an empty array, use `.push()` to add the new values, and return it.
* **Option 2 (Concise):** Return the array bracket notation directly with the math inside it.

## Complexity
- **Time: O(1)** — We are only performing two basic additions, which happen instantly. The time it takes does not scale up or change.
- **Space: O(1)** — We are creating a very small, fixed-size array (exactly 2 elements long) to hold our answer. This uses a constant, minimal amount of extra memory.

## Solution

```cpp
class Solution {
  public:
    vector<int> passedBy(int a, int &b) {
        // 'a' is a copy, so this only changes the local 'a'
        a = a + 1;
        // 'b' is a reference, so this actually changes the original 'b'
        b = b + 2;
        
        // Option 1: Step-by-Step
        // vector<int> ans;
        // ans.push_back(a);
        // ans.push_back(b);
        // return ans;

        // Option 2: Concise
        return {a, b};
    }
};
```

```java
class Solution {
    static int[] passedBy(int a, int b) {
        // Java passes primitives strictly by value, so we must return a new array.
        
        // Option 1: Step-by-Step
        // int[] ans = new int[2];
        // ans[0] = a + 1;
        // ans[1] = b + 2;
        // return ans;
        
        // Option 2: Concise
        return new int[]{a + 1, b + 2};
    }
}
```

```python
class Solution:
    def passedBy(self, a, b):
        # Python integers are immutable, so we return a new list.
        
        # Option 1: Step-by-Step
        # ans = []
        # ans.append(a + 1)
        # ans.append(b + 2)
        # return ans

        # Option 2: Concise
        return [a + 1, b + 2]
```

```javascript
class Solution {
    passedBy(a, b) {
        // JavaScript passes numbers by value, so we return a new array.
        
        // Option 1: Step-by-Step
        // let ans = [];
        // ans.push(a + 1);
        // ans.push(b + 2);
        // return ans;
        
        // Option 2: Concise
        return [a + 1, b + 2];
    }
}
```