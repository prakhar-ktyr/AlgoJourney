---
id: 6
concepts:
  - Iteration
  - For Loops
  - Control Flow
  - DRY Principle
---

## Overview
Imagine you are asked to print the word "Hello" to the screen 5 times. You could easily write `print("Hello")` five times in a row. But what if you need to print it 10,000 times? 

A fundamental rule in programming is **DRY** (Don't Repeat Yourself). Instead of writing the same line of code over and over, we use **Loops** to tell the computer to repeat a block of code for us.

The **For Loop** is the most common type of loop. You use a `for` loop when you know **exactly how many times** you want the code to repeat. Think of it like running laps around a track: you set a starting line, a finish line, and you count each lap as you go.

## Approach (C++)
In C++, a standard `for` loop is controlled by three distinct parts, all separated by semicolons `;`:
1. **Initialization (`int i = 0`)**: We create a counter variable (usually named `i` for "index" or "iterator") and set it to a starting number.
2. **Condition (`i < 5`)**: Before every lap, the computer checks this rule. If it is true, the loop runs. If it is false, the loop stops.
3. **Increment (`i++`)**: After every lap, what should happen to our counter? `i++` is shorthand for adding 1 to `i`.

```cpp
#include <iostream>
using namespace std;

int main() {
    // This loop will run 5 times (i becomes 0, 1, 2, 3, 4)
    for (int i = 0; i < 5; i++) {
        cout << "Lap number: " << i << "\n";
    }
    
    return 0;
}
```

## Approach (Java)
In Java, the traditional `for` loop syntax is completely identical to C++. It relies on the same three parts: initialization, condition, and increment.

```java
class Main {
    public static void main(String[] args) {
        // This loop will print "Hello" exactly 3 times
        for (int i = 0; i < 3; i++) {
            System.out.println("Hello");
        }
    }
}
```

**The Enhanced For Loop:**
Java also has a special loop specifically for reading through Arrays or Lists, called the "for-each" loop. It automatically runs once for every item in the list, hiding all the counting logic!

```java
String[] fruits = {"Apple", "Banana", "Cherry"};

// Read as: "For every String item inside the fruits array..."
for (String item : fruits) {
    System.out.println(item);
}
```

## Approach (Python)
Python handles `for` loops very differently than C++ or Java. Instead of manually setting up a counter, a condition, and an increment, Python's `for` loops are designed to step through a sequence (like a List or a Range of numbers) automatically.

To loop a specific number of times, you use the built-in `range()` function.

```python
# range(5) generates numbers from 0 up to (but not including) 5
for i in range(5):
    print(f"Lap number: {i}")
```

**Looping over Lists:**
Python's `for` loop truly shines when you want to read data out of a list. You don't need to count at all; Python just hands you each item one by one.

```python
fruits = ["Apple", "Banana", "Cherry"]

# Read as: "For every fruit inside the fruits list..."
for fruit in fruits:
    print(fruit)
```

## Approach (JavaScript)
JavaScript gives you the best of both worlds. It has the traditional, 3-part `for` loop (just like C++ and Java), but it also has modern, easier loops for reading arrays (like Python).

**The Traditional Loop:**
```javascript
// Remember to use 'let' to create your counter variable!
for (let i = 0; i < 5; i++) {
    console.log(`Lap number: ${i}`);
}
```

**The `for...of` Loop:**
When you are working with arrays, you should almost always use the `for...of` loop. It automatically grabs each item from the array without you having to mess with index numbers.

```javascript
let fruits = ["Apple", "Banana", "Cherry"];

// Read as: "For every fruit OF the fruits array..."
for (let fruit of fruits) {
    console.log(fruit);
}
```

