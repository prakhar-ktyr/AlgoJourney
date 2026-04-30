---
title: C++ Variables
---

# C++ Variables

A **variable** is a named container for a value. In C++ every variable has:

- A **type** (decided at compile time).
- A **name** (identifier).
- A **value** (the data it currently holds).
- A **storage location** in memory.

## Declaring variables

```cpp
int age = 25;             // integer
double price = 9.99;      // double-precision floating-point
char grade = 'A';         // single character (single quotes)
bool isActive = true;     // boolean (true/false)
std::string name = "Bob"; // requires #include <string>
```

The general form is:

```
type name = value;
```

You can declare without initializing — but the value is then **indeterminate** for built-in types:

```cpp
int x;          // ⚠ x has garbage; reading it is undefined behavior.
int y = 0;      // ✅ explicit initial value
int z{};        // ✅ value-initialized to 0
```

Always initialize.

## Multiple declarations

```cpp
int a = 1, b = 2, c = 3;
```

This is legal but harder to read; one-per-line is usually better.

## Three ways to initialize

C++ has multiple initialization syntaxes:

```cpp
int x = 5;     // copy initialization
int y(5);      // direct initialization
int z{5};      // brace (uniform) initialization — preferred in modern C++
```

Brace initialization is preferred because it **rejects narrowing conversions**:

```cpp
int n = 3.14;   // compiles, silently truncates to 3
int m{3.14};    // ❌ compile error — narrowing
```

## Naming rules

- Must start with a letter or underscore.
- Can contain letters, digits, underscores.
- **Case sensitive** (`age` and `Age` are different).
- Cannot be a keyword (`int`, `class`, `return`, etc.).
- Avoid leading underscores followed by an uppercase letter — those are reserved for the implementation.

Good naming style:

```cpp
int    studentCount;
double averageScore;
bool   isReady;
const int MAX_USERS = 100;   // constants in UPPER_CASE (or kMaxUsers)
```

## `auto` — let the compiler deduce the type

Since C++11 you can write:

```cpp
auto count    = 42;        // int
auto pi       = 3.14;      // double
auto greeting = "hi";      // const char*
auto name     = std::string{"Bob"}; // std::string
```

`auto` is a great fit when the type is long or obvious from context (especially with iterators and lambdas). It is **not** a "dynamic type" — the type is still fixed at compile time.

## Constants: `const` and `constexpr`

`const` makes a variable read-only after initialization:

```cpp
const double PI = 3.14159;
PI = 3.0;        // ❌ assignment of read-only variable
```

`constexpr` (C++11) goes further: the value must be computable **at compile time**:

```cpp
constexpr int BUFFER_SIZE = 1024;
constexpr int doubled = BUFFER_SIZE * 2;
```

Use `constexpr` for compile-time constants — it lets the value be used as an array size, template argument, etc.

## Scope and lifetime

A variable lives only inside the block where it is declared:

```cpp
int main() {
    int x = 10;          // x is alive here
    {
        int y = 20;      // y is alive here
        std::cout << x + y << '\n';
    }                    // y is destroyed here
    // std::cout << y;   // ❌ y is out of scope
}
```

## Putting it together

```cpp
#include <iostream>
#include <string>

int main() {
    const std::string username{"Alice"};
    int    score{95};
    double balance{2450.75};
    bool   isPremium{true};
    auto   discount = 0.10;   // double

    std::cout << std::boolalpha;
    std::cout << "User:     " << username  << '\n';
    std::cout << "Score:    " << score     << '\n';
    std::cout << "Balance:  $" << balance  << '\n';
    std::cout << "Premium:  " << isPremium << '\n';
    std::cout << "Discount: " << discount  << '\n';
    return 0;
}
```
