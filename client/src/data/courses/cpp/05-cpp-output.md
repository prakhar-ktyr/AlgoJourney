---
title: C++ Output
---

# C++ Output

C++ uses **streams** for input and output. The standard output stream is `std::cout` (pronounced "see-out"), declared in `<iostream>`.

```cpp
#include <iostream>

int main() {
    std::cout << "Hello!";
    return 0;
}
```

## The insertion operator `<<`

Think of `<<` as an arrow that pushes data into the stream:

```cpp
std::cout << "Score: " << 42 << '\n';
```

You can chain as many values as you want. Each call returns the stream, so the next `<<` operates on the same `std::cout`.

## Newlines: `'\n'` vs `std::endl`

```cpp
std::cout << "First\n";
std::cout << "Second" << std::endl;
```

Both move to a new line. The difference:

- `'\n'` only writes a newline character.
- `std::endl` writes a newline **and** flushes the stream's buffer to the OS.

Flushing is slower. **Prefer `'\n'`** unless you specifically need the buffer to be flushed (e.g. printing progress in a long-running loop).

## Printing different types

`std::cout` knows how to print all built-in types:

```cpp
#include <iostream>

int main() {
    int          age      = 25;
    double       price    = 19.99;
    char         grade    = 'A';
    bool         passed   = true;
    const char*  name     = "Alice";

    std::cout << "Name:   " << name   << '\n';
    std::cout << "Age:    " << age    << '\n';
    std::cout << "Price:  " << price  << '\n';
    std::cout << "Grade:  " << grade  << '\n';
    std::cout << "Passed: " << passed << '\n'; // prints 1 or 0
    return 0;
}
```

To print `true`/`false` as words instead of `1`/`0`, use the `std::boolalpha` manipulator:

```cpp
std::cout << std::boolalpha << passed << '\n'; // prints: true
```

## Useful manipulators

Manipulators are special values you insert into a stream that change its behavior. They live in `<iomanip>`.

```cpp
#include <iostream>
#include <iomanip>

int main() {
    double pi = 3.14159265358979;
    std::cout << std::fixed << std::setprecision(2) << pi << '\n'; // 3.14
    std::cout << std::setw(10) << 42 << '\n';                      // "        42"
    std::cout << std::hex << 255 << '\n';                          // ff
    return 0;
}
```

Common ones:

| Manipulator         | Effect                                   |
| ------------------- | ---------------------------------------- |
| `std::endl`         | Newline + flush                          |
| `std::boolalpha`    | Show `bool` as `true`/`false`            |
| `std::fixed`        | Force fixed-point notation               |
| `std::setprecision` | Number of digits after the decimal point |
| `std::setw(n)`      | Field width for the next output          |
| `std::hex`/`oct`    | Print integers in hex/octal              |
| `std::left`/`right` | Alignment within a field                 |

## Printing multiple lines compactly

```cpp
std::cout << "Line 1\n"
             "Line 2\n"
             "Line 3\n";
```

Adjacent string literals concatenate at compile time, so this is a single statement printing three lines.

## Standard error vs. standard output

There are two output streams:

- `std::cout` → standard output (normal program output).
- `std::cerr` → standard error (diagnostics, errors).

Operating systems let you redirect them separately:

```bash
./program > out.txt 2> err.txt
```

Use `std::cerr` for error messages so they aren't buried in normal output.

## Putting it together

```cpp
#include <iostream>
#include <iomanip>

int main() {
    std::cout << std::boolalpha;
    std::cout << "Welcome to C++ output!\n";
    std::cout << "Pi  ≈ " << std::fixed << std::setprecision(4) << 3.14159 << '\n';
    std::cout << "Hex(255) = " << std::hex << 255 << std::dec << '\n';
    std::cout << "Is 3 < 5? " << (3 < 5) << '\n';
    return 0;
}
```

Output:

```
Welcome to C++ output!
Pi  ≈ 3.1416
Hex(255) = ff
Is 3 < 5? true
```
