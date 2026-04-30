---
title: C++ Functions
---

# C++ Functions

A **function** is a reusable block of code with a name. It takes inputs (parameters), does work, and optionally returns a value.

## Defining and calling a function

```cpp
int add(int a, int b) {
    return a + b;
}

int main() {
    int sum = add(3, 4);    // sum == 7
}
```

Components:

- **Return type** (`int`)
- **Name** (`add`)
- **Parameter list** (`int a, int b`)
- **Body** (the block in `{}`)

## Functions that return nothing

Use `void`:

```cpp
void greet(const std::string& name) {
    std::cout << "Hello, " << name << '!' << '\n';
}
```

A `return;` with no value (or simply falling off the end) ends a `void` function.

## Declaration vs definition

A **declaration** announces a function's signature without providing the body:

```cpp
int add(int a, int b);     // declaration (a.k.a. prototype)
```

A **definition** provides the body:

```cpp
int add(int a, int b) { return a + b; }
```

Declarations live in **header files** (`.h` / `.hpp`), definitions in **source files** (`.cpp`). This lets multiple `.cpp` files call the same function.

## Headers and `#include`

```cpp
// math_utils.h
#pragma once
int add(int a, int b);
int sub(int a, int b);
```

```cpp
// math_utils.cpp
#include "math_utils.h"
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
```

```cpp
// main.cpp
#include "math_utils.h"
int main() { return add(2, 3); }
```

The `#pragma once` guard prevents the header from being included twice in the same translation unit.

## Default arguments

Provide a default for a trailing parameter:

```cpp
void log(const std::string& msg, const std::string& level = "INFO") {
    std::cout << "[" << level << "] " << msg << '\n';
}

log("started");                // [INFO] started
log("oops", "ERROR");          // [ERROR] oops
```

Defaults are part of the **declaration**, not the definition — put them in the header.

## Function overloading

Multiple functions can share a name as long as their **parameter lists differ**:

```cpp
int    max(int a, int b)             { return (a > b) ? a : b; }
double max(double a, double b)       { return (a > b) ? a : b; }
const std::string& max(const std::string& a, const std::string& b) {
    return (a > b) ? a : b;
}
```

The compiler picks the best match for each call site.

## Inline functions

Marking a function `inline` suggests the compiler embed its body at each call site:

```cpp
inline int square(int x) { return x * x; }
```

Modern compilers decide on inlining themselves; the keyword's main remaining purpose is allowing a function to be **defined in a header** without "multiple definition" linker errors.

## `constexpr` functions

A `constexpr` function can be called at compile time:

```cpp
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

constexpr int f5 = factorial(5);   // computed at compile time → 120
int          n  = read_int();
int          fn = factorial(n);    // also works at runtime
```

## Returning multiple values

C++17 introduced **structured bindings** which pair beautifully with `std::tuple` or `std::pair`:

```cpp
#include <tuple>
std::tuple<int, int> divmod(int a, int b) { return {a / b, a % b}; }

auto [q, r] = divmod(17, 5);   // q=3, r=2
```

Or return a small struct:

```cpp
struct DivResult { int quotient; int remainder; };
DivResult divmod(int a, int b) { return {a / b, a % b}; }

auto [q, r] = divmod(17, 5);
```

## Putting it together

```cpp
#include <iostream>

int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; ++i) result *= i;
    return result;
}

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; ++i)
        if (n % i == 0) return false;
    return true;
}

int main() {
    for (int n = 1; n <= 10; ++n) {
        std::cout << n << "! = " << factorial(n)
                  << (isPrime(n) ? " (prime)" : "")
                  << '\n';
    }
    return 0;
}
```

Next: [C++ Function Parameters](#).
