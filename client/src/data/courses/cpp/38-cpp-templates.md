---
title: C++ Templates
---

# C++ Templates

A **template** is a recipe the compiler uses to **generate** functions or classes for the types you actually use. Templates power generic programming and the entire STL.

## Function templates

```cpp
template <typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

int    x = max(3, 4);          // T deduced as int
double y = max(2.5, 1.7);      // T deduced as double
```

Use `typename` or `class` interchangeably in the parameter list — `typename` reads better.

You can specify the type explicitly when deduction fails or you want a different one:

```cpp
auto z = max<double>(3, 4.5);
```

## Multiple type parameters

```cpp
template <typename A, typename B>
auto sum(A a, B b) -> decltype(a + b) { return a + b; }
```

In C++14+ `auto` return type does the same thing without `decltype`.

## Class templates

```cpp
template <typename T>
class Stack {
public:
    void push(const T& v) { data.push_back(v); }
    T    pop()            { T v = data.back(); data.pop_back(); return v; }
    bool empty() const    { return data.empty(); }

private:
    std::vector<T> data;
};

Stack<int> s;
Stack<std::string> names;
```

Class-template argument deduction (CTAD, C++17) lets you drop the angle brackets when the constructor reveals the type:

```cpp
std::pair p{1, 2.5};        // std::pair<int, double>
```

## Non-type template parameters

Template parameters can be **values**, not just types:

```cpp
template <typename T, std::size_t N>
class Array {
public:
    T& operator[](std::size_t i) { return data[i]; }
    constexpr std::size_t size() const { return N; }
private:
    T data[N]{};
};

Array<int, 8> a;
```

`std::array` in the standard library is a thin wrapper around exactly this idea.

## Template specialisation

Provide a custom version for a specific type:

```cpp
template <typename T>
struct TypeName { static const char* get() { return "unknown"; } };

template <>
struct TypeName<int> { static const char* get() { return "int"; } };

template <>
struct TypeName<std::string> { static const char* get() { return "std::string"; } };
```

**Partial specialisation** is allowed for class templates:

```cpp
template <typename T> struct IsPointer        { static constexpr bool value = false; };
template <typename T> struct IsPointer<T*>    { static constexpr bool value = true;  };
```

## Variadic templates

Accept any number of template arguments:

```cpp
template <typename... Args>
void log(const Args&... args) {
    (std::cout << ... << args) << '\n';      // C++17 fold expression
}

log("x = ", 3, ", pi = ", 3.14);
```

## Concepts (C++20)

Concepts let you constrain template parameters with readable requirements:

```cpp
#include <concepts>

template <std::integral T>
T half(T x) { return x / 2; }

half(10);     // ok
half(3.14);   // compile-time error: constraint not satisfied
```

You can write your own:

```cpp
template <typename T>
concept Addable = requires(T a, T b) { { a + b } -> std::same_as<T>; };

template <Addable T>
T sum(T a, T b) { return a + b; }
```

## Templates and the linker

Templates are usually defined **in headers**, because the compiler needs the body to instantiate them on demand. If you keep definitions in `.cpp` files, you must explicitly instantiate every type you'll use.

## Putting it together

```cpp
#include <iostream>
#include <vector>

template <typename T>
T sum(const std::vector<T>& v) {
    T total{};
    for (const auto& x : v) total += x;
    return total;
}

template <typename T, std::size_t N>
constexpr std::size_t arraySize(const T (&)[N]) { return N; }

int main() {
    std::vector<int>    ints   = {1, 2, 3, 4};
    std::vector<double> reals  = {1.5, 2.5};
    std::cout << sum(ints)  << '\n';
    std::cout << sum(reals) << '\n';

    int xs[] = {10, 20, 30};
    std::cout << "size = " << arraySize(xs) << '\n';
}
```

Next: [C++ Namespaces](#).
