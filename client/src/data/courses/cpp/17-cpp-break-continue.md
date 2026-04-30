---
title: C++ Break & Continue
---

# C++ Break & Continue

Two small but powerful keywords for controlling loop flow.

## `break`

`break` immediately leaves the **innermost** loop or `switch`.

```cpp
for (int i = 1; i <= 10; ++i) {
    if (i == 5) break;
    std::cout << i << ' ';
}
// prints: 1 2 3 4
```

A typical use: searching, where you stop as soon as you find a hit.

```cpp
int needle = 42;
int found  = -1;
for (size_t i = 0; i < v.size(); ++i) {
    if (v[i] == needle) {
        found = static_cast<int>(i);
        break;
    }
}
```

## `continue`

`continue` skips the rest of the current iteration and goes to the next:

- In a `while` loop, control jumps to the condition check.
- In a `for` loop, control jumps to the update step (then the condition).

```cpp
for (int i = 1; i <= 10; ++i) {
    if (i % 2 == 0) continue; // skip even i
    std::cout << i << ' ';
}
// prints: 1 3 5 7 9
```

Use `continue` to flatten code that would otherwise pile up indentation:

```cpp
for (auto& user : users) {
    if (!user.isActive)  continue;
    if (user.banned)     continue;
    if (user.age < 18)   continue;
    sendNewsletter(user);
}
```

The "guard" form keeps the main work at the lowest indentation level.

## `break` only escapes one level

If you need to escape **multiple** loops, you have a few options.

### 1. A flag

```cpp
bool done = false;
for (int i = 0; i < N && !done; ++i) {
    for (int j = 0; j < M; ++j) {
        if (matrix[i][j] == target) {
            done = true;
            break;
        }
    }
}
```

### 2. Extract into a function and `return`

```cpp
std::pair<int,int> findCell(const Matrix& m, int target) {
    for (int i = 0; i < m.rows(); ++i) {
        for (int j = 0; j < m.cols(); ++j) {
            if (m(i, j) == target) return {i, j};
        }
    }
    return {-1, -1};
}
```

This is usually the cleanest solution.

### 3. `goto` (last resort)

C++ has `goto`, but it's almost never the right tool. Avoid it unless escaping deeply nested error-handling in performance-critical code.

## `break` in `switch`

Inside a `switch`, `break` exits the switch but **not** the surrounding loop:

```cpp
while (running) {
    switch (cmd) {
        case 'q':
            running = false;
            break;     // breaks out of switch only
        // ...
    }
}
```

## Putting it together

```cpp
#include <iostream>
#include <vector>

int main() {
    // Find the first negative number in a list and report its position.
    std::vector<int> data{10, 4, 7, -3, 8, -1, 5};
    int firstNegativeAt = -1;

    for (size_t i = 0; i < data.size(); ++i) {
        if (data[i] >= 0) continue;       // skip non-negatives
        firstNegativeAt = static_cast<int>(i);
        break;                             // stop at first hit
    }

    if (firstNegativeAt >= 0) {
        std::cout << "First negative at index " << firstNegativeAt
                  << " = " << data[firstNegativeAt] << '\n';
    } else {
        std::cout << "No negatives found.\n";
    }
    return 0;
}
```

Next: [C++ Arrays](#).
