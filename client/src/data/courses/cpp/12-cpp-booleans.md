---
title: C++ Booleans
---

# C++ Booleans

A **boolean** holds one of two values: `true` or `false`.

```cpp
bool isOpen   = true;
bool isClosed = false;
```

The type is `bool`, the literals are the keywords `true` and `false`.

## How booleans are stored

Internally `true` is `1`, `false` is `0`, and any non-zero integer converts to `true`:

```cpp
bool a = 1;     // true
bool b = 0;     // false
bool c = 42;    // true
bool d = -3;    // true
bool e = nullptr; // false
```

A `bool` typically takes one byte even though it only needs one bit — the smallest addressable unit on most CPUs is a byte.

## Printing booleans

```cpp
std::cout << true << '\n';                 // 1
std::cout << std::boolalpha << true << '\n'; // true
```

`std::boolalpha` is a manipulator that switches `cout` into "print true/false" mode for the rest of the stream's lifetime (or until you switch back with `std::noboolalpha`).

## Boolean expressions

Comparisons return `bool`:

```cpp
bool adult     = (age >= 18);
bool teenager  = (age >= 13 && age < 20);
bool letter    = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
```

Logical operators `&&`, `||`, `!` combine booleans (see [C++ Operators](#)).

## Booleans in conditions

`if`, `while`, and `for` evaluate a boolean expression:

```cpp
if (loggedIn) { /* show dashboard */ }
while (!done) { /* keep working */ }
```

Anything convertible to `bool` works:

```cpp
int n = 5;
if (n) { /* runs because 5 is true */ }

int* p = nullptr;
if (p) { /* skipped because nullptr is false */ }
```

This is idiomatic C++ — checking `if (p)` instead of `if (p != nullptr)`.

## De Morgan's laws

Useful for simplifying boolean expressions:

```text
!(A && B)  ==  (!A) || (!B)
!(A || B)  ==  (!A) && (!B)
```

Example:

```cpp
// "Not (adult and verified)" same as "child or not verified"
bool denied = !(isAdult && isVerified);
bool same   = (!isAdult) || (!isVerified);
```

## Boolean as a function return

```cpp
bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; ++i)
        if (n % i == 0) return false;
    return true;
}
```

Naming tip: prefix predicates with `is`, `has`, `can`, `should` so the meaning is obvious at the call site.

## Putting it together

```cpp
#include <iostream>

bool isLeap(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

int main() {
    std::cout << std::boolalpha;
    std::cout << "2000 leap? " << isLeap(2000) << '\n'; // true
    std::cout << "1900 leap? " << isLeap(1900) << '\n'; // false
    std::cout << "2024 leap? " << isLeap(2024) << '\n'; // true
    std::cout << "2023 leap? " << isLeap(2023) << '\n'; // false
    return 0;
}
```

Next: [C++ If...Else](#).
