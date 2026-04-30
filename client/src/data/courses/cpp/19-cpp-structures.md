---
title: C++ Structures
---

# C++ Structures

A **structure** (`struct`) groups several variables under one name. Use it when several pieces of data describe one logical thing.

In C++, `struct` is almost identical to `class` — the only difference is that `struct` members are **public** by default, while `class` members are **private** by default. We will use `struct` for plain data and `class` later for richer types.

## Declaring a struct

```cpp
struct Point {
    double x;
    double y;
};
```

The members `x` and `y` are called **fields**.

## Creating instances

```cpp
Point p1;                  // members default-initialized (here: indeterminate doubles)
Point p2 = {1.0, 2.0};     // aggregate initialization
Point p3{3.5, 4.5};        // brace initialization (preferred)
Point p4{.x = 1.0, .y = 2.0}; // designated initializers (C++20)
```

## Accessing members

Use the dot operator `.`:

```cpp
std::cout << p3.x << ", " << p3.y << '\n';
p3.x = 10;
```

If you have a pointer to a struct, use `->`:

```cpp
Point* p = &p3;
std::cout << p->x << '\n'; // same as (*p).x
```

## Structs as parameters and returns

Structs can be passed by value (copied), by reference (no copy), or by pointer:

```cpp
double distanceFromOrigin(const Point& p) {  // const& → no copy, read-only
    return std::sqrt(p.x * p.x + p.y * p.y);
}

Point midpoint(Point a, Point b) {
    return {(a.x + b.x) / 2, (a.y + b.y) / 2};
}
```

Returning a struct by value is **cheap** thanks to compiler "return value optimization".

## Member functions

Even a `struct` can have functions that operate on its data:

```cpp
struct Rectangle {
    double width;
    double height;

    double area() const { return width * height; }
    double perimeter() const { return 2 * (width + height); }
};

Rectangle r{3.0, 4.0};
std::cout << r.area() << '\n'; // 12
```

The `const` after `()` means the function does not modify the struct.

## Constructors

You can define how a struct is built:

```cpp
struct Person {
    std::string name;
    int         age;

    Person(std::string n, int a) : name(std::move(n)), age(a) {}
};

Person alice("Alice", 30);
```

The `: name(...), age(...)` part is the **member initializer list** — it initializes members directly, more efficient than assigning in the body.

If you don't write any constructor, you can still aggregate-initialize: `Person p{"Alice", 30};`.

## Nested structs

Structs can contain other structs:

```cpp
struct Address {
    std::string street;
    std::string city;
};

struct Employee {
    std::string name;
    Address     home;
    double      salary;
};

Employee e{"Bob", {"5 Elm St", "Springfield"}, 65000};
std::cout << e.home.city << '\n';
```

## Arrays of structs

```cpp
std::vector<Point> path{{0, 0}, {1, 1}, {2, 4}, {3, 9}};
for (const auto& p : path) {
    std::cout << '(' << p.x << ", " << p.y << ")\n";
}
```

## Comparing structs

By default, structs aren't comparable. Add operators:

```cpp
struct Point {
    double x, y;
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};
```

Or in C++20, ask the compiler to generate them:

```cpp
struct Point {
    double x, y;
    auto operator<=>(const Point&) const = default;
    bool operator==(const Point&)  const = default;
};
```

## `struct` vs `class`

```cpp
struct A { int x; };       // x is public
class  B { int x; };       // x is private
```

By convention, use `struct` for **plain data** and `class` when you have **invariants** to maintain (private members, controlled access).

## Putting it together

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Book {
    std::string title;
    std::string author;
    int         pages;
};

void printBook(const Book& b) {
    std::cout << "📖 \"" << b.title << "\" by " << b.author
              << " (" << b.pages << " pages)\n";
}

int main() {
    std::vector<Book> shelf{
        {"The C++ Programming Language", "Bjarne Stroustrup", 1376},
        {"Effective Modern C++",         "Scott Meyers",       336},
        {"Clean Code",                   "Robert C. Martin",   464},
    };
    for (const auto& b : shelf) printBook(b);
    return 0;
}
```

Next: [C++ Enums](#).
