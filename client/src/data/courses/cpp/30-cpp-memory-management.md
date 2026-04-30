---
title: C++ Memory Management
---

# C++ Memory Management

C++ gives you direct control over memory — and full responsibility for it. Modern C++ replaces most manual `new`/`delete` with **RAII** and **smart pointers**.

## The three storage areas

| Where  | Allocated by          | Freed by                            | Lifetime            |
| ------ | --------------------- | ----------------------------------- | ------------------- |
| Stack  | the compiler (locals) | automatically at scope exit         | the enclosing block |
| Heap   | `new` / `make_*`      | `delete` / smart-pointer destructor | until you free it   |
| Static | the program loader    | program exit                        | the whole program   |

Locals and parameters live on the **stack** — fast and automatic.

## `new` and `delete`

```cpp
int* p = new int(42);     // single object
delete p;                  // pair every new with a delete

int* a = new int[10]{};    // array
delete[] a;                // pair every new[] with delete[]
```

Forgetting `delete` leaks memory; mixing `delete` with `new[]` is undefined behavior.

In modern C++ you almost never write `new` / `delete` yourself.

## RAII — the core idea

> **R**esource **A**cquisition **I**s **I**nitialisation: tie a resource (memory, file, lock, socket) to the **lifetime of an object**. The destructor releases it automatically.

This means:

- No leaks even when exceptions are thrown.
- Resources are released in the **reverse order** they were acquired.
- Code is shorter and safer.

The standard library exposes RAII through containers (`std::vector`), file streams (`std::ofstream`), locks (`std::lock_guard`), and **smart pointers**.

## Smart pointers

`<memory>` provides three smart pointers.

### `std::unique_ptr` — sole ownership

```cpp
#include <memory>

auto p = std::make_unique<int>(42);   // p owns the int
*p = 7;
// no delete needed — destructor frees it when p goes out of scope
```

A `unique_ptr` cannot be copied, only **moved**:

```cpp
auto q = std::move(p);   // ownership transferred; p is now empty
```

Use it as the **default** owning pointer.

### `std::shared_ptr` — shared ownership

When several owners need to keep an object alive:

```cpp
auto sp1 = std::make_shared<std::string>("hi");
auto sp2 = sp1;                 // ref count = 2
// destructor runs once the last shared_ptr is destroyed
```

Reference counting has a cost — only reach for `shared_ptr` when shared ownership is real, not just convenient.

### `std::weak_ptr` — non-owning observer

Breaks reference cycles between `shared_ptr`s:

```cpp
std::weak_ptr<std::string> wp = sp1;
if (auto s = wp.lock()) std::cout << *s;
```

## Move semantics in one minute

Modern C++ adds **rvalue references** (`T&&`) that allow you to **move** resources instead of copying:

```cpp
std::vector<int> a = makeBigVector();
std::vector<int> b = std::move(a);     // b steals a's buffer; a is now empty
```

Standard containers and smart pointers implement move correctly. Your own classes get it free if you compose RAII members and don't add a custom destructor.

## The Rule of Zero / Three / Five

- **Rule of Zero** — let RAII members handle everything; don't write a destructor, copy, or move.
- **Rule of Five** — if you must write one of `~T`, copy ctor, copy=, move ctor, move=, you usually need to define (or `= default`/`= delete`) all five.

## Common leaks and bugs

- Calling `new` without storing the pointer.
- Throwing an exception between `new` and `delete`.
- Holding a raw pointer to an object owned by a `unique_ptr` that goes out of scope.
- Cyclic `shared_ptr`s without a `weak_ptr` to break the cycle.

## Putting it together

```cpp
#include <iostream>
#include <memory>
#include <vector>

struct Texture {
    std::string name;
    Texture(std::string n) : name(std::move(n)) {
        std::cout << "load " << name << '\n';
    }
    ~Texture() { std::cout << "free " << name << '\n'; }
};

int main() {
    std::vector<std::unique_ptr<Texture>> assets;
    assets.push_back(std::make_unique<Texture>("hero.png"));
    assets.push_back(std::make_unique<Texture>("enemy.png"));
    // when 'assets' goes out of scope, every Texture is freed automatically
}
```

Next: [C++ Exceptions](#).
