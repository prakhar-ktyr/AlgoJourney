---
title: C++ Function Parameters
---

# C++ Function Parameters

How you declare a parameter changes **what gets copied**, **whether the caller's value can change**, and **what's allowed at the call site**.

## Pass by value

The function receives a **copy**. Changes inside the function don't affect the caller.

```cpp
void addOne(int x) { x += 1; }   // modifies the local copy

int n = 5;
addOne(n);
std::cout << n << '\n';          // still 5
```

Cheap for small types (`int`, `double`, pointers). Expensive for large objects (`std::string`, `std::vector`).

## Pass by reference

A reference parameter is an **alias** for the caller's argument. No copy, and changes are visible to the caller:

```cpp
void addOne(int& x) { x += 1; }

int n = 5;
addOne(n);
std::cout << n << '\n';          // 6
```

## Pass by `const` reference

Use this for **large read-only inputs**: you avoid the copy without giving the function permission to modify the caller's value.

```cpp
void print(const std::string& s) {
    std::cout << s << '\n';      // s cannot be modified
}
```

Rule of thumb:

| Parameter type | Use when…                                       |
| -------------- | ----------------------------------------------- |
| `T` (by value) | `T` is small/cheap to copy and you want a copy. |
| `const T&`     | `T` is large and the function only reads it.    |
| `T&`           | The function must modify the caller's object.   |
| `T*`           | The argument may be absent (`nullptr`).         |

## Default arguments

Provide a default value for trailing parameters:

```cpp
void greet(const std::string& name, const std::string& greeting = "Hello") {
    std::cout << greeting << ", " << name << '\n';
}

greet("Ada");                // Hello, Ada
greet("Ada", "Hi");          // Hi, Ada
```

Defaults belong on the **declaration** (typically in a header), not on every redefinition.

## Passing arrays

Arrays decay to pointers, so the size is lost. Pass the size explicitly, or take a `std::span` / `std::vector` / `std::array`:

```cpp
void sum1(int* arr, size_t n);                // C-style
void sum2(const std::vector<int>& v);         // size carried by the vector
template <size_t N>
void sum3(const std::array<int, N>& a);       // size known at compile time
```

## Variable number of arguments

Prefer **variadic templates** (C++11) over the C-style `...`:

```cpp
template <typename... Args>
void log(const Args&... args) {
    (std::cout << ... << args) << '\n';   // C++17 fold expression
}

log("x = ", 3, ", y = ", 4.2);
```

## Output parameters

Return values are usually clearer than output parameters, but when you really need several outputs, prefer references over pointers:

```cpp
void minMax(const std::vector<int>& v, int& lo, int& hi);
```

…or return a struct / `std::tuple` and use structured bindings (see [C++ Functions](/tutorials/cpp/cpp-functions)).

## Putting it together

```cpp
#include <iostream>
#include <string>

void shout(std::string s) {              // by value — modifies local copy
    for (char& c : s) c = std::toupper(c);
    std::cout << s << '\n';
}

void appendBang(std::string& s) {        // by reference — caller sees change
    s += '!';
}

void describe(const std::string& s) {    // by const ref — read-only
    std::cout << "len=" << s.size() << " value=" << s << '\n';
}

int main() {
    std::string msg = "hello";
    shout(msg);                          // HELLO, msg unchanged
    appendBang(msg);                     // msg becomes "hello!"
    describe(msg);                       // len=6 value=hello!
}
```
