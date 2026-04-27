---
id: 5
concepts:
  - Arrays
  - Strings
  - Data Structures
  - Zero-Based Indexing
---

## Overview
As you write more complex programs, you will eventually need to store hundreds or thousands of pieces of data. Creating a separate variable for every single item (`int score1 = 10;`, `int score2 = 15;`) is impossible. This is where **Arrays** and **Strings** come in.

### What is an Array?
Think of an Array like a row of school lockers. Instead of having one variable floating around in memory, an array gives you a single name (like `scores`) that points to an entire row of connected lockers. Each locker holds one piece of data. 

**Zero-Based Indexing:** The most important rule of arrays is that computers start counting at `0`. The first locker is locker `0`, the second is locker `1`, and so on. We access these lockers using square brackets: `scores[0]`.

### What is a String?
A String is simply a sequence of characters—like a word, a sentence, or a paragraph. Under the hood, almost all programming languages treat Strings exactly like Arrays of characters. The word "HELLO" is essentially an array of 5 letters, where 'H' is at index 0 and 'O' is at index 4.

While the core concept is the same everywhere, how these two structures behave changes drastically depending on the programming language you use. Select your language below to see how they work!

## Approach (C++)
In C++, **Arrays** are very strict. When you create an array, you must tell the computer exactly what type of data it holds and exactly how big it is. Once created, its size **cannot** be changed.

```cpp
// Creating an array of 5 integers
int scores[5] = {10, 20, 30, 40, 50};

// Accessing the first item
cout << scores[0]; // Prints 10

// Changing an item
scores[1] = 99; 
```
*Note: Because standard C++ arrays are so strict, modern C++ developers usually use `std::vector`, which is a "dynamic array" that can grow and shrink automatically.*

**Strings in C++** are handled by the `<string>` library. They are highly flexible and **mutable**, meaning you can change individual letters after the string is created.

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string greeting = "Hello";
    
    // You can access letters just like an array!
    cout << greeting[0]; // Prints 'H'
    
    // You can also change them directly
    greeting[0] = 'J';
    cout << greeting; // Prints "Jello"
}
```

## Approach (Java)
In Java, **Arrays** are strictly typed and have a fixed length. When you create an array, you must declare its size, and you cannot add more "lockers" to it later without creating a brand new array.

```java
// Declaring and initializing an array in one line
int[] scores = {10, 20, 30, 40, 50};

// Accessing and modifying data
System.out.println(scores[0]); // Prints 10
scores[1] = 99; // Changes the second item
```
*Note: If you need an array that can grow and shrink, Java provides the `ArrayList` class.*

**Strings in Java** have a massive catch: they are **Immutable**. Once you create a String in Java, it can never be changed. If you try to change a letter or add a word to it, Java actually destroys the old String and creates a brand new one in memory behind the scenes.

```java
String greeting = "Hello";

// You CANNOT do this in Java: greeting[0] = 'J';

// Instead, you use built-in methods to manipulate them
System.out.println(greeting.charAt(0)); // Prints 'H'
System.out.println(greeting.length());  // Prints 5

// Adding to a string creates a new string
String fullGreeting = greeting + " World!";
```

## Approach (Python)
Python takes the strict rules of C++ and Java and throws them out the window. In Python, Arrays are called **Lists**, and they are incredibly powerful. 

Python lists are **dynamic** (they grow and shrink automatically) and **heterogeneous** (you can mix numbers, text, and booleans all in the same list).

```python
# A single list holding mixed data types
my_list = [10, "Apple", 3.14, True]

# You can change items instantly
my_list[0] = 99

# You can add items to the end using .append()
my_list.append("New Item")
```

**Strings in Python**, however, are **Immutable** (just like Java). You can read them like a list, but you cannot change an individual letter.

```python
greeting = "Hello"

# Accessing the first letter works perfectly
print(greeting[0]) # Prints 'H'

# This will cause an ERROR! You cannot change a string once made.
# greeting[0] = 'J' 

# Python has incredible "slicing" to grab chunks of a string
print(greeting[0:3]) # Prints "Hel" (From index 0 up to, but not including, 3)
```

## Approach (JavaScript)
JavaScript **Arrays** are incredibly flexible. Like Python, they are dynamic and can hold mixed data types. They come packed with dozens of built-in methods that make manipulating data very easy.

```javascript
let fruits = ["Apple", "Banana", "Cherry"];

// Accessing items
console.log(fruits[0]); // Prints "Apple"

// Adding a new item to the end of the array
fruits.push("Mango");

// Removing the last item
fruits.pop();
```

**Strings in JavaScript** are **Immutable** primitive values. You can read individual characters using bracket notation, but you cannot overwrite them.

```javascript
let greeting = "Hello";

// Reading a character works
console.log(greeting[0]); // Prints 'H'

// Trying to change it will NOT work (it will just be ignored)
greeting[0] = "J"; 
console.log(greeting); // Still prints "Hello"

// To manipulate strings, use built-in methods:
let loudGreeting = greeting.toUpperCase(); // "HELLO"
```

