---
title: C++ Strings
---

# C++ Strings

A **string** is a sequence of characters. C++ has two flavors:

- **C-style strings** — `char` arrays terminated by `'\0'`. Inherited from C; low-level but error-prone.
- **`std::string`** — a class from the standard library. **Use this**.

## Including the header

```cpp
#include <string>
```

You also need `<iostream>` to print them.

## Creating strings

```cpp
std::string a = "Hello";
std::string b("World");
std::string c{"!"};
std::string d(5, '*');     // "*****"
std::string empty;          // empty string ""
```

## Concatenation

```cpp
std::string greeting = a + ", " + b + c;   // "Hello, World!"
greeting += " Have fun.";                  // append in place
```

Note: you can `+` two `std::string`s, or `std::string + const char*`. You **cannot** `+` two `const char*` literals — there's no operator for raw pointers.

```cpp
auto bad = "Hello" + ", world";   // ❌ pointer arithmetic, not concatenation
auto ok  = std::string{"Hello"} + ", world"; // ✅
```

## Length

```cpp
std::string s = "C++";
std::cout << s.length() << '\n';  // 3
std::cout << s.size()   << '\n';  // 3 — same thing
std::cout << s.empty()  << '\n';  // 0 (false)
```

`length()` and `size()` are aliases.

## Accessing characters

```cpp
std::string s = "Hello";
char first = s[0];        // 'H' (no bounds check)
char last  = s.at(s.size() - 1); // 'o' (throws std::out_of_range if invalid)
s[0] = 'J';               // "Jello"
```

Use `[]` when you know the index is valid; use `.at()` when you want a runtime check.

## Comparing strings

```cpp
std::string a = "apple";
std::string b = "banana";
if (a == b)         { /* ... */ }
if (a != b)         { /* ... */ }
if (a < b)          { /* lexicographic */ }
int c = a.compare(b); // <0, 0, or >0
```

Comparison is **lexicographic** based on character codes.

## Substrings, find, replace

```cpp
std::string s = "the quick brown fox";

std::string sub = s.substr(4, 5);    // "quick"
auto pos = s.find("brown");          // index 10
if (pos != std::string::npos) {
    s.replace(pos, 5, "red");        // "the quick red fox"
}

s.insert(0, "And ");                 // "And the quick red fox"
s.erase(0, 4);                       // "the quick red fox"
```

`std::string::npos` is a special value meaning "not found".

## Reading a string from input

```cpp
std::string name;
std::cin >> name;            // reads ONE word
std::getline(std::cin, name); // reads the whole line
```

`std::cin >> name` stops at whitespace. Use `std::getline` for full lines.

## C-style strings

Sometimes you need to interface with old code:

```cpp
std::string s = "Hello";
const char* raw = s.c_str();   // null-terminated C string view
```

Avoid creating `char[]` strings yourself unless interacting with a C API.

## Useful conversions

```cpp
#include <string>
int    n = std::stoi("42");        // string → int
double d = std::stod("3.14");      // string → double

std::string s1 = std::to_string(123);     // "123"
std::string s2 = std::to_string(3.14);    // "3.140000"
```

## Iterating

```cpp
std::string s = "abc";

for (size_t i = 0; i < s.size(); ++i) {
    std::cout << s[i] << '\n';
}

for (char c : s) {     // range-based for (C++11)
    std::cout << c << '\n';
}
```

## Putting it together

```cpp
#include <iostream>
#include <string>

int main() {
    std::cout << "What's your full name? ";
    std::string name;
    std::getline(std::cin, name);

    auto space = name.find(' ');
    std::string first = (space == std::string::npos)
        ? name
        : name.substr(0, space);

    std::string greeting = "Hello, " + first + "! Your name has "
                         + std::to_string(name.size()) + " characters.";
    std::cout << greeting << '\n';
    return 0;
}
```
