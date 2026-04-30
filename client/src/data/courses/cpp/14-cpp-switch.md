---
title: C++ Switch
---

# C++ Switch

`switch` selects one of many branches based on the value of an integer (or `enum`, `char`) expression. It's often cleaner than a long `if/else if` chain when comparing one value against many constants.

## Basic syntax

```cpp
switch (expression) {
    case value1:
        // ...
        break;
    case value2:
        // ...
        break;
    default:
        // runs if no case matched
        break;
}
```

Example:

```cpp
int day = 3;
switch (day) {
    case 1: std::cout << "Monday\n";    break;
    case 2: std::cout << "Tuesday\n";   break;
    case 3: std::cout << "Wednesday\n"; break;
    case 4: std::cout << "Thursday\n";  break;
    case 5: std::cout << "Friday\n";    break;
    default: std::cout << "Weekend\n";  break;
}
```

## How `break` works (and fall-through)

Without `break`, execution **falls through** into the next case:

```cpp
switch (n) {
    case 1:
        std::cout << "one\n";
        // no break — falls through
    case 2:
        std::cout << "two\n";
        break;
    case 3:
        std::cout << "three\n";
        break;
}
```

For `n == 1` this prints both "one" and "two". Sometimes you want this; usually you don't.

When you intentionally fall through (C++17), document it:

```cpp
switch (c) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        std::cout << "vowel\n";
        break;
    case ' ':
        [[fallthrough]];          // suppress compiler warning
    case '\t':
        std::cout << "whitespace\n";
        break;
    default:
        std::cout << "other\n";
}
```

The `[[fallthrough]]` attribute tells the compiler "yes, I meant to do this".

## What can you switch on?

The controlling expression must be an **integer-like** type:

- `int`, `short`, `long`, `long long`, signed/unsigned variants
- `char`, `wchar_t`
- `enum` values

You **cannot** switch on `std::string`, `double`, or arbitrary objects. Use `if/else if` for those.

## `default` is optional but recommended

It catches every value not listed and is a great place to put error handling:

```cpp
switch (status) {
    case Status::Ok:    /* ... */ break;
    case Status::Error: /* ... */ break;
    default:
        std::cerr << "Unknown status: " << static_cast<int>(status) << '\n';
}
```

## Variables inside cases

Declarations that need initialization should be put inside their own block:

```cpp
switch (n) {
    case 1: {
        int x = compute();
        use(x);
        break;
    }
    case 2:
        // ...
        break;
}
```

Without the braces, the compiler rejects `int x = compute();` because the variable would still be in scope across the next case label.

## When to prefer `switch`

Use `switch` when:

- You're checking one value against several constants.
- The cases are short and parallel in structure.
- An `enum` is involved — your compiler can warn if you forgot a case.

Use `if/else` when:

- The conditions involve ranges (`score >= 90`) or compound expressions.
- You need non-integer types.

## Putting it together

```cpp
#include <iostream>

enum class Op { Add, Sub, Mul, Div };

double apply(Op op, double a, double b) {
    switch (op) {
        case Op::Add: return a + b;
        case Op::Sub: return a - b;
        case Op::Mul: return a * b;
        case Op::Div:
            if (b == 0) {
                std::cerr << "Division by zero\n";
                return 0;
            }
            return a / b;
    }
    return 0; // unreachable, but keeps the compiler happy
}

int main() {
    std::cout << apply(Op::Add, 3, 4)  << '\n'; // 7
    std::cout << apply(Op::Mul, 3, 4)  << '\n'; // 12
    std::cout << apply(Op::Div, 10, 4) << '\n'; // 2.5
    return 0;
}
```
