---
title: C++ Pointers
---

# C++ Pointers

A **pointer** is a variable that stores the **address** of another variable. They're the foundation of dynamic data structures, low-level memory work, and interop with C.

## Declaring a pointer

```cpp
int  x   = 42;
int* p   = &x;     // p stores the address of x
```

- `int*` means "pointer to `int`".
- `&x` is the **address-of** operator.
- `p` now points to `x`.

## Dereferencing

The `*` operator (when used in an expression) **dereferences** a pointer — i.e., yields the object it points to:

```cpp
std::cout << *p << '\n';   // 42 — value at the address
*p = 100;                  // modifies x via the pointer
std::cout << x << '\n';    // 100
```

## `nullptr`

A pointer that points to nothing should be set to `nullptr` (C++11):

```cpp
int* p = nullptr;
if (p) {           // false because p is null
    std::cout << *p;
}
```

Avoid the old `NULL` macro and the literal `0`. `nullptr` has its own type (`std::nullptr_t`) so it can't be confused with an integer.

## Pointer arithmetic

For pointers into arrays, you can do arithmetic in **elements**, not bytes:

```cpp
int arr[5] = {10, 20, 30, 40, 50};
int* p = arr;          // points to arr[0]
std::cout << *p << '\n';        // 10
std::cout << *(p + 2) << '\n';  // 30
++p;                              // now points to arr[1]
std::cout << *p << '\n';        // 20
```

## Arrays decay to pointers

When you pass an array to a function, you receive a pointer to its first element. The size is lost:

```cpp
void printAll(int* arr, size_t n) {
    for (size_t i = 0; i < n; ++i) std::cout << arr[i] << ' ';
}

int xs[3]{1, 2, 3};
printAll(xs, 3);
```

`arr[i]` is shorthand for `*(arr + i)` — the same indexing works on raw arrays and pointers.

## Pointers and `const`

The `const` rules can be tricky. Read **right to left**:

```cpp
int*        p1;  // pointer to int          (everything mutable)
const int*  p2;  // pointer to const int    (can't change *p2)
int* const  p3;  // const pointer to int    (can't change p3 itself)
const int* const p4; // const pointer to const int (nothing mutable)
```

Use `const T*` (or `const T* const`) when the function should not modify the data behind the pointer.

## Pointers vs references

References are easier and safer; use them by default. Reach for pointers when:

- The pointee may be **absent** (`nullptr`).
- You need to **rebind** to point to different objects.
- You're working with raw arrays or low-level APIs.
- You're managing dynamically allocated memory.

## `new` and `delete`

You can allocate objects on the heap with `new`:

```cpp
int* p = new int(42);     // single int on the heap
*p = 99;
delete p;                  // free the memory

int* arr = new int[5];     // array of 5 ints
delete[] arr;              // note the [] for arrays
```

⚠ Forgetting `delete` causes a **memory leak**. Forgetting `[]` after `new[]` is undefined behavior.

In modern C++ you should almost never call `new`/`delete` directly. Use **smart pointers** (`<memory>`):

```cpp
#include <memory>

auto p   = std::make_unique<int>(42);            // owns one int
auto arr = std::make_unique<int[]>(5);           // owns an int[5]
auto sp  = std::make_shared<std::string>("hi");  // shared ownership
```

`std::unique_ptr` and `std::shared_ptr` automatically `delete` for you when they go out of scope — RAII at work. We cover them in [C++ Memory Management](#).

## Pointer to struct / class

Use `->` to access members:

```cpp
struct Point { int x, y; };

Point  pt{1, 2};
Point* pp = &pt;
std::cout << pp->x << ", " << pp->y << '\n';
pp->x = 10;
```

`pp->x` is equivalent to `(*pp).x` but easier to read.

## Common pitfalls

- **Dangling pointers**: pointing at storage that has been freed or gone out of scope.
- **Uninitialized pointers**: reading them is undefined behavior — initialize to `nullptr`.
- **Double delete**: calling `delete` twice on the same pointer.
- **Mismatched `delete` / `delete[]`**.

Smart pointers eliminate most of these.

## Putting it together

```cpp
#include <iostream>
#include <memory>
#include <string>

struct Player {
    std::string name;
    int         hp;
};

int main() {
    auto p = std::make_unique<Player>();
    p->name = "Hero";
    p->hp   = 100;

    Player* raw = p.get();              // observing pointer
    std::cout << raw->name << " has " << raw->hp << " HP\n";

    raw->hp -= 30;
    std::cout << "After hit: " << p->hp << " HP\n";
    // unique_ptr deletes Player automatically here.
    return 0;
}
```

Next: [C++ Functions](#).
