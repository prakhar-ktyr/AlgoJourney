---
title: C++ Syntax
---

# C++ Syntax

Let's dissect a complete C++ program line by line.

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

## `#include <iostream>`

A **preprocessor directive**. Before compilation, the preprocessor literally copies the contents of the `<iostream>` header into your file. `<iostream>` declares `std::cout`, `std::cin`, and the stream operators.

Lines that begin with `#` are processed by the preprocessor, not the compiler. We will meet `#define` and `#ifdef` later.

## `int main()`

`main` is the **entry point** — execution starts here. Every C++ program must define exactly one `main` function. Its return type is `int`, where `0` traditionally means "success".

You can write either form:

```cpp
int main() { /* ... */ }
int main(int argc, char* argv[]) { /* ... */ }
```

The second variant lets you read **command-line arguments** (covered later).

## The body `{ ... }`

Curly braces group statements into a **block**. Every function body is a block. Blocks also create a new **scope** for variables declared inside them.

## `std::cout << "Hello, World!" << std::endl;`

Read this left to right:

- `std::cout` is the standard output **stream object**.
- `<<` is the **stream insertion operator**. It says "send the right-hand value into the stream on the left".
- `"Hello, World!"` is a string literal.
- `std::endl` writes a newline **and** flushes the buffer.

Operations chain because `<<` returns the stream, so you can keep inserting values.

The line ends with `;`. Every C++ statement ends with a semicolon.

## `return 0;`

Returns the integer `0` from `main` to the operating system. Non-zero return values are conventionally used to signal errors.

## Whitespace and formatting

C++ ignores most whitespace. The compiler treats these the same:

```cpp
int main(){std::cout<<"Hi";return 0;}
```

```cpp
int main() {
    std::cout << "Hi";
    return 0;
}
```

The second form is what humans read. **Indent with 2 or 4 spaces**, put a space around binary operators, and keep one statement per line.

## Case sensitivity

C++ is **case sensitive**: `Main`, `main`, and `MAIN` are three different names. By convention:

- Variables and functions use `lowerCamelCase` or `lower_snake_case`.
- Types, classes, and templates use `UpperCamelCase`.
- Macros use `ALL_UPPERCASE`.

## The `std::` prefix

`std` stands for the **standard namespace**, where the standard library lives. Writing `std::cout` says: "use the `cout` from the standard namespace".

Some tutorials add `using namespace std;` so they can write just `cout`. We will explicitly write `std::` in this course because:

- It avoids name clashes in larger programs.
- It teaches you what comes from where.

## Comments (preview)

```cpp
// Single-line comment.

/*
   Multi-line
   comment.
*/
```

We cover comments in detail in the next lesson.

## Putting it together

```cpp
#include <iostream>

int main() {
    std::cout << "Line one." << std::endl;
    std::cout << "Line two on a new line." << std::endl;
    std::cout << 1 << " + " << 2 << " = " << (1 + 2) << std::endl;
    return 0;
}
```

Output:

```
Line one.
Line two on a new line.
1 + 2 = 3
```
