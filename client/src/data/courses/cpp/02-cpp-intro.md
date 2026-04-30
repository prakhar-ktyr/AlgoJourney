---
title: C++ Intro
---

# C++ Intro

## What is C++?

C++ is a **statically typed, compiled, multi-paradigm** programming language created by **Bjarne Stroustrup** at Bell Labs in 1979 as "C with Classes". It was renamed C++ in 1983 — the `++` is the C increment operator, hinting that C++ is "C plus one".

C++ keeps everything that made C fast and portable, then adds:

- **Classes & objects** for encapsulation.
- **Inheritance & polymorphism** for code reuse.
- **Templates** for generic programming.
- **Exceptions** for error handling.
- **A rich Standard Library (STL)** with containers, iterators, and algorithms.
- **References, namespaces, RAII**, and many more abstractions.

## C vs. C++

```cpp
// C-style "Hello, World!"
#include <stdio.h>
int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```

```cpp
// C++-style "Hello, World!"
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

Both compile and run, but the C++ version uses:

- `<iostream>` instead of `<stdio.h>`.
- `std::cout`, an **object** that streams data to standard output.
- The **stream insertion operator** `<<` instead of a format string.

## Versions of C++

C++ is standardized by ISO. Major releases:

| Standard | Year | Key additions                                                         |
| -------- | ---- | --------------------------------------------------------------------- |
| C++98    | 1998 | First ISO standard, STL                                               |
| C++03    | 2003 | Bug-fix release                                                       |
| C++11    | 2011 | `auto`, lambdas, `nullptr`, smart pointers, range-for, move semantics |
| C++14    | 2014 | Generic lambdas, `make_unique`                                        |
| C++17    | 2017 | Structured bindings, `std::optional`, `if constexpr`                  |
| C++20    | 2020 | Concepts, modules, ranges, coroutines                                 |
| C++23    | 2023 | `std::print`, `std::expected`, more ranges                            |

This course uses **C++17** by default — modern enough to be productive, supported by every mainstream compiler.

## Compile then run

C++ is a **compiled language**. The flow is:

```
source.cpp  ──►  [compiler]  ──►  source.o  ──►  [linker]  ──►  program
```

The compiler turns your `.cpp` files into machine-readable object files, and the linker stitches them together into one executable. There is no virtual machine and no interpreter — your code runs directly on the CPU.

## What you need to follow along

- A C++ compiler: **g++** (Linux/macOS), **clang++**, or **MSVC** (Windows).
- A text editor or IDE: VS Code, CLion, Code::Blocks, Visual Studio.
- A terminal to compile and run.

We will set everything up in the next lesson.

## Putting it together

```cpp
#include <iostream>

int main() {
    std::cout << "C++ is fast." << std::endl;
    std::cout << "C++ is powerful." << std::endl;
    std::cout << "C++ is fun!" << std::endl;
    return 0;
}
```

Output:

```
C++ is fast.
C++ is powerful.
C++ is fun!
```

Continue to [C++ Get Started](#) to install a compiler and run your first program.
