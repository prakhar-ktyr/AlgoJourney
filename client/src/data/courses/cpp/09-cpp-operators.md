---
title: C++ Operators
---

# C++ Operators

Operators are symbols that perform actions on values. C++ has a rich set: arithmetic, comparison, logical, bitwise, assignment, and more.

## Arithmetic operators

| Op  | Meaning            | Example   | Result |
| --- | ------------------ | --------- | ------ |
| `+` | Addition           | `5 + 3`   | `8`    |
| `-` | Subtraction        | `5 - 3`   | `2`    |
| `*` | Multiplication     | `5 * 3`   | `15`   |
| `/` | Division           | `7 / 2`   | `3` (integer) / `3.5` (double) |
| `%` | Modulus (remainder)| `7 % 2`   | `1`    |

Integer division **truncates** toward zero. Use a floating-point operand to keep the fractional part:

```cpp
std::cout << 7 / 2     << '\n'; // 3
std::cout << 7 / 2.0   << '\n'; // 3.5
std::cout << 7.0 / 2   << '\n'; // 3.5
```

`%` is only for **integers**. For floats use `std::fmod` from `<cmath>`.

## Increment / decrement

```cpp
int n = 5;
++n;   // n is now 6 (pre-increment)
n++;   // n is now 7 (post-increment, but expression value is 6)
--n;   // n is now 6
```

Use the pre-form (`++n`) when you don't need the old value — for built-in types it makes no difference, but for class types pre-increment can avoid a copy.

## Assignment operators

```cpp
int x = 10;
x  += 5;   // x = x + 5 → 15
x  -= 3;   // 12
x  *= 2;   // 24
x  /= 4;   // 6
x  %= 4;   // 2
x  <<= 1;  // 4 (bitwise shift left)
x  &= 3;   // 0 (bitwise AND)
```

## Comparison operators

| Op   | Meaning                  |
| ---- | ------------------------ |
| `==` | Equal                    |
| `!=` | Not equal                |
| `<`  | Less than                |
| `>`  | Greater than             |
| `<=` | Less than or equal       |
| `>=` | Greater than or equal    |

They produce a `bool`:

```cpp
bool isAdult = (age >= 18);
```

C++20 added the **three-way comparison** `<=>` (the "spaceship operator"), useful for implementing all six relational operators at once.

## Logical operators

| Op   | Meaning      | Example                   |
| ---- | ------------ | ------------------------- |
| `&&` | Logical AND  | `(age >= 18) && hasCard`  |
| `\|\|` | Logical OR | `isAdmin \|\| isOwner`    |
| `!`  | Logical NOT  | `!isReady`                |

`&&` and `||` **short-circuit**: if the left operand decides the result, the right operand is not evaluated.

```cpp
if (p != nullptr && p->ready()) { ... } // safe: p is checked first
```

## Bitwise operators

For integer types, operating on individual bits:

| Op   | Meaning         |
| ---- | --------------- |
| `&`  | bitwise AND     |
| `\|` | bitwise OR      |
| `^`  | bitwise XOR     |
| `~`  | bitwise NOT     |
| `<<` | left shift      |
| `>>` | right shift     |

```cpp
unsigned flags = 0b0000;
flags |= 0b0010;    // set bit 1   → 0b0010
flags &= ~0b0010;   // clear bit 1 → 0b0000
flags ^= 0b0001;    // toggle bit 0
bool isSet = flags & 0b0001;
```

`<<` and `>>` are **also** the stream operators when the left operand is a stream — context decides which meaning applies.

## Conditional (ternary) operator

```cpp
int max = (a > b) ? a : b;
```

Equivalent to:

```cpp
int max;
if (a > b) max = a; else max = b;
```

Useful for short conditional expressions; avoid nesting deeply.

## Operator precedence (selected)

From highest to lowest:

1. `()`, `[]`, `.`, `->`, `++`, `--` (postfix)
2. Unary `+ - ! ~ ++ -- *p &v` (prefix)
3. `* / %`
4. `+ -`
5. `<< >>`
6. `< <= > >=`
7. `== !=`
8. `&`
9. `^`
10. `|`
11. `&&`
12. `||`
13. `?:`, `=`, `+=`, ...
14. `,`

When in doubt, **add parentheses**. They make code unambiguous to both readers and the compiler:

```cpp
if ((flags & MASK) == MASK) { ... } // crystal clear
```

## Putting it together

```cpp
#include <iostream>

int main() {
    int  a = 17, b = 5;
    int  q = a / b;    // 3
    int  r = a % b;    // 2
    bool even = (a % 2 == 0);

    std::cout << std::boolalpha;
    std::cout << a << " / " << b << " = " << q << " remainder " << r << '\n';
    std::cout << a << " is even? " << even << '\n';
    std::cout << "max(a, b) = " << ((a > b) ? a : b) << '\n';

    int flags = 0;
    flags |= (1 << 2);          // set bit 2
    std::cout << "flags = " << flags << " (bit 2 set)\n";
    return 0;
}
```

Next: [C++ Strings](#).
