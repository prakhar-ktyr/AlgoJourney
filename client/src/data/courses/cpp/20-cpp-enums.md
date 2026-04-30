---
title: C++ Enums
---

# C++ Enums

An **enum** (enumeration) is a type with a fixed set of named values. They make code self-documenting and let the compiler catch typos and missing cases.

## Plain `enum` (C-style, avoid in modern C++)

```cpp
enum Color { Red, Green, Blue };
Color c = Red;
```

The names `Red`, `Green`, `Blue` are values of type `Color` and **leak into the enclosing scope** — you can write `Red` without qualification, which can clash with other names.

## `enum class` (scoped enum, C++11) — preferred

```cpp
enum class Color { Red, Green, Blue };

Color c = Color::Red;          // must qualify with "Color::"
// Color bad = Red;            // ❌ does not compile
```

Benefits:

- No name pollution.
- No implicit conversion to `int`.
- Strong type safety.

## Underlying type and values

By default, enumerators are 0, 1, 2, ... and stored as `int`. You can customize both:

```cpp
enum class Status : uint8_t {
    Idle    = 0,
    Working = 1,
    Done    = 2,
    Error   = 255,
};
```

## Using enums

In a `switch` they're particularly nice — the compiler can warn if you forgot a case:

```cpp
const char* name(Color c) {
    switch (c) {
        case Color::Red:   return "red";
        case Color::Green: return "green";
        case Color::Blue:  return "blue";
    }
    return "unknown";
}
```

## Converting to/from integers

`enum class` requires an explicit cast:

```cpp
Color c = Color::Green;
int   v = static_cast<int>(c);                       // 1
Color back = static_cast<Color>(2);                   // Color::Blue
```

Validate when converting from `int` — the value might not correspond to any enumerator.

## Bit-flag enums

A common pattern is using an enum for OR-able flags:

```cpp
enum class Permission : unsigned {
    None    = 0,
    Read    = 1 << 0,
    Write   = 1 << 1,
    Execute = 1 << 2,
};

// Provide bitwise operators since `enum class` disables them.
inline Permission operator|(Permission a, Permission b) {
    return static_cast<Permission>(
        static_cast<unsigned>(a) | static_cast<unsigned>(b));
}
inline bool any(Permission a, Permission b) {
    return (static_cast<unsigned>(a) & static_cast<unsigned>(b)) != 0;
}

Permission p = Permission::Read | Permission::Write;
if (any(p, Permission::Write)) { /* can write */ }
```

## Iterating over enumerators

C++ doesn't provide built-in iteration. The common workaround:

```cpp
constexpr Color allColors[] = { Color::Red, Color::Green, Color::Blue };
for (Color c : allColors) std::cout << name(c) << '\n';
```

C++23 adds `std::to_underlying` and richer reflection is on the way in C++26.

## Putting it together

```cpp
#include <iostream>

enum class Direction { North, East, South, West };

const char* arrow(Direction d) {
    switch (d) {
        case Direction::North: return "↑";
        case Direction::East:  return "→";
        case Direction::South: return "↓";
        case Direction::West:  return "←";
    }
    return "?";
}

Direction turnRight(Direction d) {
    return static_cast<Direction>((static_cast<int>(d) + 1) % 4);
}

int main() {
    Direction d = Direction::North;
    for (int i = 0; i < 4; ++i) {
        std::cout << arrow(d) << ' ';
        d = turnRight(d);
    }
    std::cout << '\n';   // ↑ → ↓ ←
    return 0;
}
```
