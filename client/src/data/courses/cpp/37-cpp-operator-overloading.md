---
title: C++ Operator Overloading
---

# C++ Operator Overloading

C++ lets you define what built-in operators (`+`, `==`, `<<`, `[]`, `()`, …) mean for **your own types**. Done sparingly, this makes user types feel native.

## Member vs non-member

- **Member** — `T::operator@(args)`. The left-hand side is `*this`.
- **Non-member (free function)** — `operator@(T lhs, T rhs)`. Often a `friend` so it can see private members.

Use a non-member when you want implicit conversions on the **left** operand (e.g. `int + Money`).

## Arithmetic operators

```cpp
class Vec2 {
public:
    Vec2(double x, double y) : x(x), y(y) {}

    Vec2 operator+(const Vec2& r) const { return {x + r.x, y + r.y}; }
    Vec2 operator-(const Vec2& r) const { return {x - r.x, y - r.y}; }
    Vec2 operator*(double k)      const { return {x * k,   y * k};   }

    Vec2& operator+=(const Vec2& r) { x += r.x; y += r.y; return *this; }

private:
    double x, y;
    friend std::ostream& operator<<(std::ostream& os, const Vec2& v);
};

// Symmetric scalar * Vec2 — non-member
Vec2 operator*(double k, const Vec2& v) { return v * k; }
```

Idioms:

- Arithmetic returns by value; compound assignment returns `*this` by reference.
- Implement `+` in terms of `+=` to avoid duplication: `Vec2 r = a; r += b; return r;`.

## Comparison operators (C++20)

Define `<=>` (the **spaceship** operator) and the compiler synthesises the rest:

```cpp
#include <compare>

class Version {
public:
    int major, minor, patch;
    auto operator<=>(const Version&) const = default;
};

Version v1{1, 2, 3}, v2{1, 3, 0};
v1 < v2;     // ✅ generated
v1 == v2;    // ✅ generated
```

For C++17 and earlier, define `==` and `<` and derive the rest from them.

## Stream insertion `<<`

Must be a non-member (the left operand is `std::ostream&`):

```cpp
std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    return os << '(' << v.x << ", " << v.y << ')';
}
```

## Subscript `[]`

Often comes in `const` and non-`const` pairs:

```cpp
class Buffer {
public:
    int&       operator[](size_t i)       { return data[i]; }
    const int& operator[](size_t i) const { return data[i]; }
private:
    int data[16]{};
};
```

## Function call `()`

Lets your object behave as a callable (a **functor**):

```cpp
class Multiplier {
public:
    explicit Multiplier(int k) : k(k) {}
    int operator()(int x) const { return k * x; }
private:
    int k;
};

Multiplier triple(3);
std::cout << triple(7);   // 21
```

Functors are how the STL passes "callable strategy" objects (they predate lambdas).

## Increment / decrement

```cpp
class Counter {
public:
    Counter& operator++()    { ++n; return *this; }      // prefix
    Counter  operator++(int) { Counter old = *this; ++(*this); return old; }   // postfix
private:
    int n = 0;
};
```

The unused `int` parameter is just a tag distinguishing postfix from prefix.

## Conversion operators

Allow your type to convert to another. Mark them `explicit` to avoid surprise conversions:

```cpp
class Fraction {
public:
    explicit operator double() const { return double(num) / den; }
private:
    int num = 0, den = 1;
};

Fraction f;
double d = static_cast<double>(f);
```

## Operators you should usually leave alone

- `&&`, `||`, `,` — overloading them loses short-circuit / sequencing.
- `?:` — cannot be overloaded.
- `&` (address-of) — almost never a good idea.

## Putting it together

```cpp
#include <iostream>

class Money {
public:
    Money(long long cents = 0) : cents(cents) {}

    Money  operator+(Money r) const { return Money(cents + r.cents); }
    Money& operator+=(Money r)      { cents += r.cents; return *this; }
    auto   operator<=>(const Money&) const = default;

    friend std::ostream& operator<<(std::ostream& os, Money m) {
        return os << '$' << m.cents / 100 << '.'
                  << std::setw(2) << std::setfill('0') << std::abs(m.cents % 100);
    }

private:
    long long cents;
};

int main() {
    Money a = 1099, b = 250;
    Money total = a + b;
    std::cout << total << '\n';        // $13.49
}
```
