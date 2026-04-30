---
title: C++ References
---

# C++ References

A **reference** is another name (an "alias") for an existing variable. Once bound, a reference cannot be re-seated to refer to a different object.

```cpp
int x = 10;
int& r = x;     // r is a reference to x

r = 20;          // changes x
std::cout << x << '\n'; // 20
```

`r` is not a new variable — it shares storage with `x`. Read `int& r = x;` as "let `r` be another name for `x`".

## Rules

1. A reference **must** be initialized when declared:
   ```cpp
   int& r;        // ❌ compile error
   int  y = 5;
   int& r = y;    // ✅
   ```
2. A reference **cannot** be reassigned:
   ```cpp
   int a = 1, b = 2;
   int& r = a;
   r = b;        // assigns 2 INTO a; r still refers to a
   ```
3. There is **no** "null reference". A reference always names a real object.

## References vs pointers

| Feature                | Reference (`T&`) | Pointer (`T*`)  |
| ---------------------- | ---------------- | --------------- |
| Must be initialized    | Yes              | No              |
| Can be null            | No               | Yes (`nullptr`) |
| Can be rebound         | No               | Yes             |
| Syntax to access value | `r`              | `*p`            |
| Member access          | `r.x`            | `p->x`          |

References are typically the right choice when:

- The thing being passed always exists.
- You don't need to rebind.
- You want syntax that looks like a normal variable.

Use pointers when nullability or rebinding matters.

## Pass by reference

References shine when passing arguments to functions:

```cpp
void doubleInPlace(int& n) { n *= 2; }

int x = 5;
doubleInPlace(x); // x is now 10
```

Without `&`, the function would receive a copy and changes wouldn't stick.

## `const` references

A `const T&` lets you read but not modify the original — and avoids a copy. It is the **default way to pass non-trivial objects**:

```cpp
void greet(const std::string& name) {
    std::cout << "Hi, " << name << '\n';
    // name = "..."; // ❌ would not compile
}
```

A `const T&` can also bind to a temporary, which is handy:

```cpp
greet("Alice");       // string literal becomes a temporary std::string
greet(std::string{"Bob"});
```

## Returning references

Returning by reference avoids a copy and lets callers modify what's returned:

```cpp
int& at(std::vector<int>& v, size_t i) { return v[i]; }

std::vector<int> data{1, 2, 3};
at(data, 0) = 99;            // modifies data[0]
```

⚠ **Never** return a reference to a local variable — it dies when the function returns:

```cpp
int& bad() {
    int x = 5;
    return x;        // ❌ dangling reference
}
```

## Range-based `for` with references

```cpp
for (auto& v : container)        std::cout << ++v;       // modifies in place
for (const auto& v : container)  std::cout << v;         // read-only, no copy
```

## Reference vs value parameters — quick guide

| Pass by    | When                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| `T`        | Cheap to copy (`int`, `double`, small POD), or you need a copy you can mutate locally |
| `const T&` | Non-trivial type, read-only access                                                    |
| `T&`       | You need to modify the caller's object                                                |
| `T*`       | Object may be null, or you need pointer arithmetic / rebinding                        |

## Putting it together

```cpp
#include <iostream>
#include <string>

void appendSmiley(std::string& s)            { s += " :)"; }
void printName(const std::string& s)         { std::cout << s << '\n'; }

int main() {
    std::string name = "Alice";
    appendSmiley(name);            // modifies name
    printName(name);               // reads name without copying

    int counter = 0;
    auto& ref = counter;           // alias
    for (int i = 0; i < 5; ++i) ++ref;
    std::cout << "counter = " << counter << '\n'; // 5
    return 0;
}
```
