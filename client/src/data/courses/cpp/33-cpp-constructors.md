---
title: C++ Constructors and Destructors
---

# C++ Constructors and Destructors

A **constructor** runs when an object is created; a **destructor** runs when it is destroyed. Together they make RAII possible.

## Default constructor

A no-argument constructor. The compiler synthesises one if you don't write any constructor at all.

```cpp
class Point {
public:
    Point() : x(0), y(0) {}    // default constructor
private:
    int x, y;
};

Point p;                       // calls Point()
```

## Parameterised constructors

```cpp
class Point {
public:
    Point(int x, int y) : x(x), y(y) {}
private:
    int x, y;
};

Point p(3, 4);
Point q{3, 4};                 // brace-init equivalent
```

Use the **member initializer list** (`: name(value)`) — it's more efficient than assigning in the body and required for `const` / reference members.

## Default and deleted

```cpp
class Widget {
public:
    Widget() = default;           // ask for the compiler-generated default
    Widget(const Widget&) = delete;   // disable copying
};
```

## Copy constructor

Called when an object is initialised from another of the same type:

```cpp
class Buffer {
public:
    Buffer(const Buffer& other);     // copy constructor
};

Buffer b;
Buffer c = b;       // calls copy constructor
```

If you don't need a deep copy, the compiler-generated one is fine. When your class manages a resource, follow the **Rule of Five** ([C++ Memory Management](#)).

## Move constructor (C++11)

Called when an object is initialised from an **rvalue** — typically a temporary or `std::move(...)`:

```cpp
class Buffer {
public:
    Buffer(Buffer&& other) noexcept;     // move constructor
};
```

Move steals resources cheaply and leaves the source in a valid-but-unspecified state.

## Delegating constructors

One constructor can call another:

```cpp
class Range {
public:
    Range()                : Range(0, 0) {}
    Range(int n)           : Range(0, n) {}
    Range(int lo, int hi)  : low(lo), high(hi) {}
private:
    int low, high;
};
```

## `explicit` constructors

Single-argument constructors are implicit conversions unless marked `explicit`:

```cpp
class Seconds {
public:
    explicit Seconds(int n) : n(n) {}
private:
    int n;
};

Seconds s = 5;       // ❌ won't compile thanks to 'explicit'
Seconds s(5);        // ✅
Seconds s{5};        // ✅
```

Mark single-argument constructors `explicit` by default to avoid surprising conversions.

## Destructors

```cpp
class File {
public:
    File(const std::string& path);
    ~File();              // destructor
};
```

The destructor:

- Runs automatically at the end of the object's lifetime.
- Should release resources (close files, free memory) — but RAII members usually do that for you.
- Should be `noexcept` (the default). Throwing from a destructor during stack unwinding calls `std::terminate`.

## Order of construction and destruction

Members are constructed **in the order they're declared** in the class (not the order in the initializer list) and destroyed in **reverse**. Base classes come before members, and are destroyed last.

```cpp
struct Demo {
    A a;
    B b;
    Demo() : b(), a() {}   // a still constructed before b
};
```

## Putting it together

```cpp
#include <iostream>
#include <string>

class ScopedTimer {
public:
    explicit ScopedTimer(std::string label)
        : label(std::move(label)), start(std::clock()) {
        std::cout << "[" << this->label << "] start\n";
    }

    ~ScopedTimer() {
        auto elapsed = double(std::clock() - start) / CLOCKS_PER_SEC;
        std::cout << "[" << label << "] " << elapsed << "s\n";
    }

private:
    std::string label;
    std::clock_t start;
};

int main() {
    ScopedTimer t("work");
    for (int i = 0; i < 1'000'000; ++i) { /* do something */ }
    // ~ScopedTimer prints elapsed time when t goes out of scope
}
```

Next: [C++ Encapsulation](#).
