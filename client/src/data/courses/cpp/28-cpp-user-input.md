---
title: C++ User Input
---

# C++ User Input

C++ reads from the keyboard with `std::cin` (the standard input stream). It's the input counterpart to `std::cout`.

## Reading numbers and words

```cpp
#include <iostream>

int main() {
    int age;
    std::cout << "Enter your age: ";
    std::cin >> age;
    std::cout << "You are " << age << " years old.\n";
}
```

`>>` (the **extraction** operator) reads whitespace-separated tokens and converts them to the target type.

You can chain extractions:

```cpp
int a, b;
std::cin >> a >> b;
```

## Reading a full line

`>>` stops at the first whitespace, so it can't read names with spaces. Use `std::getline`:

```cpp
#include <string>

std::string fullName;
std::cout << "Full name: ";
std::getline(std::cin, fullName);
```

### Mixing `>>` and `getline`

`>>` leaves the trailing newline in the buffer, so a following `getline` reads an empty line. Discard the leftover newline first:

```cpp
#include <limits>

int age;
std::string name;

std::cin >> age;
std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
std::getline(std::cin, name);
```

## Validating input

If the user types text into an `int >>`, the stream enters a **fail** state. Check it with `if (std::cin)` and recover with `clear()` + `ignore()`:

```cpp
int n;
while (true) {
    std::cout << "Number: ";
    if (std::cin >> n) break;
    std::cin.clear();          // reset error flags
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    std::cout << "Please enter a valid integer.\n";
}
```

## Reading until EOF

`std::cin >> x` returns the stream; using it as a boolean is `true` while the read succeeded. This is the idiomatic loop:

```cpp
int x;
long long sum = 0;
while (std::cin >> x) sum += x;
std::cout << "Sum: " << sum << '\n';
```

## Reading from `std::string` with `std::stringstream`

Useful when you want to parse numbers out of a line you read with `getline`:

```cpp
#include <sstream>

std::string line;
std::getline(std::cin, line);

std::istringstream iss(line);
int a, b;
iss >> a >> b;
```

## Putting it together

```cpp
#include <iostream>
#include <limits>
#include <string>

int main() {
    std::string name;
    int         age;

    std::cout << "Name: ";
    std::getline(std::cin, name);

    std::cout << "Age: ";
    while (!(std::cin >> age) || age < 0) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Please enter a non-negative integer: ";
    }

    std::cout << "Hi " << name << ", you'll be " << age + 1 << " next year.\n";
}
```
