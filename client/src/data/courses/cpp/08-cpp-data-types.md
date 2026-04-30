---
title: C++ Data Types
---

# C++ Data Types

C++ is **statically typed**: every variable's type is fixed at compile time. Choosing the right type matters for correctness, range, and performance.

## Fundamental categories

```
fundamental
├── integral
│   ├── bool
│   ├── char, signed char, unsigned char
│   ├── short, int, long, long long  (and their unsigned versions)
│   └── wchar_t, char16_t, char32_t
├── floating-point
│   ├── float
│   ├── double
│   └── long double
└── void  (no value)
```

## Integers

| Type            | Typical size | Approx. range                     |
| --------------- | ------------ | --------------------------------- |
| `short`         | 2 bytes      | -32,768 … 32,767                  |
| `int`           | 4 bytes      | ±2 × 10⁹                          |
| `long`          | 4–8 bytes    | platform-dependent                |
| `long long`     | 8 bytes      | ±9 × 10¹⁸                         |
| `unsigned int`  | 4 bytes      | 0 … 4 × 10⁹                       |

Sizes are **at least** these values; the standard guarantees minimums, not exact widths. For exact widths use `<cstdint>`:

```cpp
#include <cstdint>
int32_t     count   = 100;          // exactly 32 bits
uint64_t    id      = 1'000'000;    // exactly 64 bits, unsigned
int_least16_t flags = 0;
```

The single quote `'` in `1'000'000` is a **digit separator** (C++14) — purely cosmetic.

## Floating-point

| Type          | Size    | Precision         |
| ------------- | ------- | ----------------- |
| `float`       | 4 bytes | ~7 decimal digits |
| `double`      | 8 bytes | ~15 digits        |
| `long double` | ≥8 bytes| ≥`double`         |

Use `double` by default; use `float` only when memory matters (e.g. graphics, audio).

```cpp
float  f = 3.14f;     // suffix f for float literals
double d = 3.14;
double e = 1.5e3;     // 1500.0 in scientific notation
```

## Characters

```cpp
char letter = 'A';        // single quotes for one character
char tab    = '\t';
char nl     = '\n';
```

A `char` is an integer that holds an ASCII code. `'A'` and `65` print differently but compare equal.

```cpp
std::cout << 'A' << '\n';        // A
std::cout << int('A') << '\n';   // 65
```

Wide characters `wchar_t` and Unicode `char16_t` / `char32_t` exist for non-ASCII text.

## Booleans

```cpp
bool isReady = true;
bool isDone  = false;
```

Internally `true` is `1` and `false` is `0`. Any non-zero integer converts to `true`.

## Strings

C++ has two flavors:

```cpp
const char* cstr = "Hello";          // C-style: pointer to chars, ends in '\0'

#include <string>
std::string s = "Hello";             // C++ string class — preferred
```

Prefer `std::string`. It manages memory for you and offers methods like `.size()`, `.find()`, `+`, `+=`.

## `void`

`void` means "no type". You will see it most often as a function return type meaning "returns nothing":

```cpp
void greet() { std::cout << "Hi\n"; }
```

## Type conversions

Implicit conversions happen automatically in many places, sometimes silently losing data:

```cpp
double pi = 3.14;
int    n  = pi;     // n becomes 3, fractional part lost
```

Explicit casts make your intent clear:

```cpp
int    n  = static_cast<int>(pi);          // C++ style — preferred
double d  = static_cast<double>(7) / 2;    // 3.5, not 3
```

Other casts you'll meet:

- `static_cast<T>(x)` — well-defined conversions between related types.
- `dynamic_cast<T*>(p)` — safe downcast in inheritance hierarchies.
- `reinterpret_cast<T>(x)` — bit reinterpretation (rare, dangerous).
- `const_cast<T>(x)` — strip `const` (rare, dangerous).

Avoid the C-style `(int)x` cast in C++ code; `static_cast` is searchable and safer.

## `sizeof`

Returns the size in bytes of a type or expression at compile time:

```cpp
std::cout << sizeof(int)     << '\n'; // typically 4
std::cout << sizeof(double)  << '\n'; // typically 8
std::cout << sizeof('A')     << '\n'; // 1 in C, 4 in C++ (a char literal is int in C, char in C++... actually char in C++)
```

## Putting it together

```cpp
#include <iostream>
#include <cstdint>
#include <string>

int main() {
    int32_t      population = 8'050'000;
    double       averageAge = 36.4;
    char         continent  = 'A';   // 'A' for Asia
    bool         isCapital  = true;
    std::string  city       = "Tokyo";

    std::cout << std::boolalpha;
    std::cout << city << " (" << continent << ")\n"
              << "Population: " << population << '\n'
              << "Avg age:    " << averageAge << '\n'
              << "Capital?    " << isCapital  << '\n';
    return 0;
}
```

Next: [C++ Operators](#).
