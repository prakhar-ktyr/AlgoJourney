---
title: C++ Scope
---

# C++ Scope

**Scope** is the region of code where a name (variable, function, type) is visible. C++ has several kinds.

## Block scope

A name declared inside `{ ... }` lives until the closing brace:

```cpp
int main() {
    int x = 1;
    {
        int y = 2;     // visible only inside this block
        std::cout << x + y << '\n';
    }
    // y is gone here
}
```

Inner blocks may **shadow** an outer name:

```cpp
int n = 10;
{
    int n = 1;        // shadows outer n
    std::cout << n;   // 1
}
std::cout << n;       // 10
```

Shadowing compiles, but readers find it confusing. Prefer different names.

## Function scope

Parameters and locals live for the duration of one call. Each call gets a **fresh** set.

## File / namespace scope

Names declared outside any function live in the enclosing namespace (or the global namespace) and are visible from their declaration to the end of the translation unit.

```cpp
namespace audio {
    int volume = 50;        // namespace-scope variable
    void mute();            // namespace-scope function
}

int main() {
    audio::volume = 0;
}
```

## Class scope

Members live within the class; access them through an object, a reference, or via `ClassName::` for static members. Covered in [C++ Classes](/tutorials/cpp/cpp-classes).

## Storage duration vs scope

Scope and **lifetime** are different:

| Storage   | Lifetime                                      | Typical example                   |
| --------- | --------------------------------------------- | --------------------------------- |
| automatic | While the enclosing block runs                | Plain locals                      |
| static    | Entire program                                | `static int n;` inside a function |
| dynamic   | From `new`/`make_unique` until `delete`/reset | `auto p = std::make_unique<T>();` |
| thread    | Per-thread, for the thread's lifetime         | `thread_local int id;`            |

`static` inside a function gives the variable program lifetime but **block scope**:

```cpp
int nextId() {
    static int id = 0;     // initialized once, persists across calls
    return ++id;
}
```

## Linkage

Linkage decides whether a name in one source file can refer to the same entity in another:

- **No linkage**: locals, function parameters.
- **Internal linkage**: `static` at namespace scope, anonymous namespace members. Visible only in this `.cpp` file.
- **External linkage**: ordinary functions and globals. Other files can `extern` them.

```cpp
// utils.cpp
static int helperOnly = 0;       // internal
int sharedCounter = 0;            // external

// other.cpp
extern int sharedCounter;
```

Prefer anonymous namespaces over `static` for "private to this file":

```cpp
namespace {
    int helperOnly = 0;
    void doStuff() { /* ... */ }
}
```

## `using` declarations

You can pull names into a narrower scope to avoid `std::` everywhere — but be **selective** in headers:

```cpp
void greet() {
    using std::cout;          // limited to this function
    cout << "hi\n";
}
```

Avoid `using namespace std;` at namespace scope in headers — it leaks into every file that includes them.

## Putting it together

```cpp
#include <iostream>

namespace counter {
    int count = 0;            // namespace-scope, external linkage

    int next() {
        static int last = 0;  // function-scope, program-lifetime
        return ++last;
    }
}

int main() {
    for (int i = 0; i < 3; ++i) {
        counter::count = counter::next();
        std::cout << counter::count << '\n';
    }
}
```
