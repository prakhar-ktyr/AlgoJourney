---
title: C++ Comments
---

# C++ Comments

Comments are notes that the compiler ignores. They exist to make code readable for **humans** — including your future self.

## Single-line comments

Anything from `//` to the end of the line is a comment.

```cpp
// Compute the area of a circle.
double area = 3.14159 * radius * radius;

int score = 95; // current player's score
```

## Multi-line comments

Wrap text in `/* ... */`:

```cpp
/*
   This program demonstrates basic C++ output.
   Author : Alice
   Date   : 2025-01-01
*/
```

You can also use it inline:

```cpp
int total = price * /* number of items */ quantity;
```

⚠ Multi-line comments **do not nest**:

```cpp
/* outer /* inner */ still outer */ // ❌ syntax error
```

## When to comment

Good comments explain **why**, not **what**. The code already shows what — the comment should add intent that isn't obvious.

```cpp
// ❌ Useless: restates the code.
i = i + 1; // increment i

// ✅ Useful: explains the reason.
i = i + 1; // skip the header row when iterating
```

Other good places for comments:

- Above a function: what it does, what it expects, what it returns.
- Above a tricky algorithm: the math or invariant.
- Marking a known limitation or TODO.

## Documentation comments

Many C++ projects use **Doxygen-style** comments for generated docs:

```cpp
/**
 * Compute the factorial of n.
 *
 * @param n  A non-negative integer.
 * @return   n! ( = 1 * 2 * ... * n ).
 */
int factorial(int n);
```

Tags like `@param`, `@return`, `@throws` are picked up by Doxygen to build HTML/PDF documentation.

## Commenting out code

You can temporarily disable code with a comment:

```cpp
// std::cout << "DEBUG: value = " << value << '\n';
```

Or wrap a block:

```cpp
/*
runExperiment();
collectStats();
*/
```

For larger conditional disabling, prefer the preprocessor:

```cpp
#if 0
    runExperiment();
    collectStats();
#endif
```

`#if 0` blocks are easier to nest and easier for editors to fold.

## Putting it together

```cpp
#include <iostream>

/*
 * Greeter program
 * ---------------
 * Prints a personalized greeting.
 */
int main() {
    // Hard-code the user for now.
    const char* user = "Alice";

    // TODO: read the name from std::cin once we cover input.
    std::cout << "Hello, " << user << "!\n";
    return 0;
}
```
