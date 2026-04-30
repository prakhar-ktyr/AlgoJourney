---
title: C++ If...Else
---

# C++ If...Else

Conditional statements run different code depending on whether a boolean expression is true.

## `if`

```cpp
if (condition) {
    // runs when condition is true
}
```

Example:

```cpp
int score = 80;
if (score >= 50) {
    std::cout << "You passed.\n";
}
```

The braces are optional for a **single statement**, but always using them prevents bugs:

```cpp
if (x > 0)
    std::cout << "positive\n";
    std::cout << "always runs!\n"; // not part of the if!
```

**Rule of thumb**: always use braces.

## `if ... else`

```cpp
if (score >= 50) {
    std::cout << "Pass\n";
} else {
    std::cout << "Fail\n";
}
```

## `if ... else if ... else`

Chain multiple branches:

```cpp
if      (score >= 90) std::cout << "A\n";
else if (score >= 80) std::cout << "B\n";
else if (score >= 70) std::cout << "C\n";
else if (score >= 60) std::cout << "D\n";
else                   std::cout << "F\n";
```

The first matching condition wins; the rest are skipped.

## Nested `if`

You can nest conditionals, but deep nesting is hard to read:

```cpp
if (loggedIn) {
    if (isAdmin) {
        showAdminPanel();
    } else {
        showUserPanel();
    }
}
```

Often you can flatten with **early returns**:

```cpp
if (!loggedIn) return;
if (isAdmin) { showAdminPanel(); return; }
showUserPanel();
```

## Ternary expression

For short conditional **values**, use `?:` instead of an `if`:

```cpp
int max = (a > b) ? a : b;
std::string status = passed ? "OK" : "FAIL";
```

## `if` with initializer (C++17)

You can declare a variable scoped to the `if`/`else`:

```cpp
if (auto it = map.find(key); it != map.end()) {
    use(it->second);
} else {
    std::cout << "not found\n";
}
// `it` is not visible here
```

Great for keeping variables tightly scoped.

## `constexpr if` (C++17)

For compile-time branching in templates:

```cpp
template <typename T>
void describe(T) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "integer\n";
    } else {
        std::cout << "something else\n";
    }
}
```

The branch that's not taken is discarded at compile time.

## Common pitfalls

- `=` vs `==`: `if (x = 5)` **assigns** 5 to `x` and is always true. Use `==`.
- Comparing floats with `==` is unreliable — use a tolerance.
- Forgetting braces around a multi-statement body.

## Putting it together

```cpp
#include <iostream>

const char* gradeOf(int score) {
    if      (score < 0 || score > 100) return "Invalid";
    else if (score >= 90)              return "A";
    else if (score >= 80)              return "B";
    else if (score >= 70)              return "C";
    else if (score >= 60)              return "D";
    else                               return "F";
}

int main() {
    for (int s : {95, 82, 73, 64, 50, 105}) {
        std::cout << s << " → " << gradeOf(s) << '\n';
    }
    return 0;
}
```

Output:

```
95 → A
82 → B
73 → C
64 → D
50 → F
105 → Invalid
```
