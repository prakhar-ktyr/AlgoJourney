---
title: C++ Lambdas
---

# C++ Lambdas

A **lambda expression** is an unnamed function you define inline. Lambdas were added in C++11 and have grown into one of the most-used features of modern C++.

## Anatomy

```cpp
[capture](parameters) -> ReturnType {
    body
}
```

- **Capture list** `[...]` — variables from the enclosing scope to make available inside the body.
- **Parameters** `(...)` — like a normal function (can be empty).
- **Return type** `-> T` — usually deducible; you can omit it.
- **Body** — the statements to run.

## A first lambda

```cpp
auto add = [](int a, int b) { return a + b; };
std::cout << add(3, 4);     // 7
```

`auto` is needed because each lambda has its own anonymous type.

## Captures

```cpp
int x = 10;

auto byValue     = [x] { return x + 1; };       // copy of x
auto byReference = [&x] { x += 1; };            // reference to x
auto captureAll  = [=] { /* x is copied  */ };
auto refAll      = [&] { /* x is by-ref  */ };
```

Use `[&]`/`[=]` sparingly — explicit captures make intent obvious and prevent dangling references.

### `mutable` lambdas

By-value captures are `const` by default. Mark the lambda `mutable` if you need to modify the copy:

```cpp
int counter = 0;
auto next   = [counter]() mutable { return ++counter; };
std::cout << next() << next();    // 12 (each call mutates the captured copy)
```

### Init capture (C++14)

You can introduce new variables in the capture clause:

```cpp
auto p   = std::make_unique<int>(7);
auto own = [up = std::move(p)] { return *up; };
```

This is essential when you need to capture move-only types.

## Lambdas as arguments

Most STL algorithms accept callables. Lambdas are a perfect fit:

```cpp
#include <algorithm>
#include <vector>

std::vector<int> v{4, 1, 3, 2};

std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

int evens = std::count_if(v.begin(), v.end(), [](int n) { return n % 2 == 0; });
```

## Generic lambdas (C++14)

`auto` parameters give you a function template without the syntax:

```cpp
auto print = [](const auto& x) { std::cout << x << '\n'; };
print(42);
print(std::string("hi"));
```

## Storing lambdas: `std::function`

When you need to store callables of different lambda types in the same variable or container, use `std::function`:

```cpp
#include <functional>

std::function<int(int, int)> op = [](int a, int b) { return a + b; };
op = [](int a, int b) { return a * b; };
```

`std::function` has heap allocation overhead — prefer templates / `auto` when possible.

## Putting it together

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> names = {"Bob", "Alice", "Charlie", "ann"};

    // Case-insensitive sort using a lambda
    std::sort(names.begin(), names.end(), [](const auto& a, const auto& b) {
        auto lower = [](char c) { return std::tolower(static_cast<unsigned char>(c)); };
        return std::lexicographical_compare(
            a.begin(), a.end(), b.begin(), b.end(),
            [&](char x, char y) { return lower(x) < lower(y); });
    });

    for (const auto& n : names) std::cout << n << '\n';
}
```
