---
title: C++ Exceptions
---

# C++ Exceptions

An **exception** is an object that signals an error from deep in the call stack to a handler higher up — without polluting every return value along the way.

## Throw, try, catch

```cpp
#include <stdexcept>
#include <iostream>

double divide(int a, int b) {
    if (b == 0) throw std::runtime_error("division by zero");
    return static_cast<double>(a) / b;
}

int main() {
    try {
        std::cout << divide(10, 0) << '\n';
    } catch (const std::runtime_error& e) {
        std::cerr << "error: " << e.what() << '\n';
    }
}
```

When `throw` runs, the stack **unwinds** until a matching `catch` is found, calling destructors of every local along the way. RAII makes this safe.

## Standard exception types

`<stdexcept>` defines a hierarchy. Catch by **`const` reference**:

```text
std::exception
├── std::logic_error           (programming bugs)
│   ├── std::invalid_argument
│   ├── std::out_of_range
│   └── std::length_error
└── std::runtime_error         (conditions detected at run time)
    ├── std::overflow_error
    ├── std::underflow_error
    └── std::system_error
```

```cpp
catch (const std::out_of_range& e) { /* ... */ }
catch (const std::exception& e)    { /* fallback */ }
```

## Multiple `catch` blocks

The first matching handler wins. Order **most specific first**:

```cpp
try {
    risky();
} catch (const std::out_of_range& e) {
    /* handle range error */
} catch (const std::exception& e) {
    /* anything else derived from std::exception */
} catch (...) {
    /* truly unknown */
}
```

`catch (...)` matches any exception but you lose access to its type.

## Rethrowing

To let the next handler deal with it after some logging or cleanup:

```cpp
try {
    work();
} catch (const std::exception& e) {
    log(e.what());
    throw;                  // rethrow the same exception
}
```

## Custom exceptions

Derive from `std::exception` (or one of its descendants) and override `what()`:

```cpp
class ConfigError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;   // inherit constructors
};

throw ConfigError("missing key: timeout");
```

## `noexcept`

Mark functions that promise not to throw with `noexcept`:

```cpp
int square(int n) noexcept { return n * n; }
```

If a `noexcept` function does throw, `std::terminate` is called — so use it for genuinely non-throwing operations (move constructors are an important case).

## When **not** to use exceptions

- For ordinary control flow ("element not found" — return `std::optional` instead).
- In tight loops where the throw path would dominate timing.
- In freestanding / embedded environments where exceptions are disabled.

For non-error "absent value" results prefer `std::optional`, `std::expected` (C++23), or status codes.

## Exception safety levels

- **No-throw** — guaranteed not to throw (e.g. `swap`, destructors).
- **Strong** — operation either completes or leaves state unchanged (transactional).
- **Basic** — invariants preserved; partial work may have happened.
- **None** — leaving here is undefined.

Aim for at least **basic** in every operation.

## Putting it together

```cpp
#include <iostream>
#include <stdexcept>
#include <string>

int parsePositive(const std::string& s) {
    int n = std::stoi(s);                       // throws std::invalid_argument / std::out_of_range
    if (n <= 0) throw std::invalid_argument("must be positive: " + s);
    return n;
}

int main() {
    for (auto s : {"42", "-3", "abc"}) {
        try {
            std::cout << s << " -> " << parsePositive(s) << '\n';
        } catch (const std::invalid_argument& e) {
            std::cerr << "invalid: " << e.what() << '\n';
        } catch (const std::out_of_range&) {
            std::cerr << "out of range: " << s << '\n';
        }
    }
}
```

Next: [C++ Classes](#).
