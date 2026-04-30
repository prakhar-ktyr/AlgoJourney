---
title: Modern C++
---

# Modern C++

"Modern C++" usually means C++11 and later. Each standard added features that change how idiomatic C++ is written. This lesson is a tour of the highlights you should reach for daily.

## `auto` and type deduction

Let the compiler name the type when it's noisy or local:

```cpp
auto i      = 42;                  // int
auto pi     = 3.14;                // double
auto name   = std::string("Ada");
auto it     = v.begin();           // iterator
```

Use `const auto&` for read-only references, `auto&` to mutate, `auto*` for pointers — be deliberate.

## Range-based `for`

```cpp
for (const auto& x : container) { /* read */ }
for (auto& x : container)       { /* mutate */ }
```

## Uniform initialisation `{}`

Brace-init is consistent across types and prevents narrowing conversions:

```cpp
int   x{42};
std::vector<int> v{1, 2, 3};
Point p{1, 2};

// int n{3.14};   // ❌ narrowing — error
```

## `nullptr`

Replace `NULL` and `0` with `nullptr` — it has its own type and never collides with integer overloads.

## `enum class`

Strongly-typed, scoped enumerations:

```cpp
enum class Color { Red, Green, Blue };
Color c = Color::Red;
// int n = c;                // ❌ no implicit conversion
int n = static_cast<int>(c); // ✅ explicit
```

## Move semantics & rvalue references

`T&&` binds to **rvalues** (temporaries, results of `std::move`). Move constructors / assignment "steal" resources cheaply.

```cpp
std::vector<int> a = makeBigVector();
std::vector<int> b = std::move(a);   // b takes a's storage; a is empty
```

For your own classes, follow the **Rule of Zero** ([C++ Memory Management](#)) — let RAII members handle moves.

## Smart pointers

`std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr` from `<memory>` replace manual `new` / `delete` everywhere it matters.

## `constexpr` and `consteval`

Compute at compile time:

```cpp
constexpr int square(int x) { return x * x; }
constexpr int s = square(5);          // computed at compile time

consteval int onlyAtCompileTime(int x) { return x + 1; }   // C++20
```

## Lambdas (C++11/14/17/20)

See the dedicated lesson on [C++ Lambdas](#). Highlights:

- Generic lambdas (`auto` parameters) since C++14.
- Init capture (`[v = std::move(x)]`) since C++14.
- `template` lambdas (`[]<typename T>(T x){}`) since C++20.

## `if constexpr`

Compile-time branching inside templates:

```cpp
template <typename T>
void print(const T& x) {
    if constexpr (std::is_pointer_v<T>) std::cout << *x;
    else                                std::cout << x;
}
```

## Structured bindings (C++17)

Decompose pairs, tuples, and structs:

```cpp
std::map<std::string, int> ages = {{"Ada", 36}};
for (const auto& [name, age] : ages)
    std::cout << name << ": " << age << '\n';

auto [q, r] = std::div(17, 5);
```

## `std::optional`, `std::variant`, `std::any` (C++17)

```cpp
#include <optional>

std::optional<int> parseInt(std::string_view s);

if (auto n = parseInt("42")) {
    std::cout << *n;
}
```

`std::variant<A,B>` is a type-safe union; `std::any` holds any type. C++23 adds `std::expected<T,E>` for error-or-value returns.

## `std::string_view` (C++17)

A non-owning view over a string. Pass it instead of `const std::string&` when you don't need to copy:

```cpp
void greet(std::string_view name) {
    std::cout << "Hi " << name << '\n';
}

greet("Ada");                   // no allocation
greet(std::string("Ada"));      // ditto
```

## Ranges (C++20)

Composable lazy views over containers:

```cpp
#include <ranges>

auto evensSquared = v
    | std::views::filter([](int x){ return x % 2 == 0; })
    | std::views::transform([](int x){ return x * x; });
```

## Modules (C++20)

Modules replace `#include` for new code:

```cpp
// math.cppm
export module math;
export int add(int a, int b) { return a + b; }

// main.cpp
import math;
int main() { return add(2, 3); }
```

Tooling support is still maturing across toolchains.

## Concepts (C++20)

```cpp
template <std::integral T> T half(T x) { return x / 2; }
```

Replaces SFINAE with readable constraints.

## Designated initialisers (C++20)

```cpp
struct Config { int width = 800; int height = 600; bool fullScreen = false; };
Config c{ .width = 1024, .height = 768 };
```

## `std::format` (C++20) and `std::print` (C++23)

```cpp
std::cout << std::format("{} = {:.2f}\n", "pi", 3.14159);
std::println("Hello, {}!", name);     // C++23
```

## Putting it together

```cpp
#include <algorithm>
#include <format>
#include <iostream>
#include <ranges>
#include <vector>

int main() {
    std::vector<int> v{5, 3, 8, 1, 9, 2, 7, 4, 6};

    auto evensSquared = v
        | std::views::filter([](int x){ return x % 2 == 0; })
        | std::views::transform([](int x){ return x * x; });

    for (int x : evensSquared)
        std::cout << std::format("{} ", x);
}
```

Next: [C++ Concurrency](#).
