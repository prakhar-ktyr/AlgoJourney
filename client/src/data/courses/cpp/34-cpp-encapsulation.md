---
title: C++ Encapsulation
---

# C++ Encapsulation

**Encapsulation** is hiding implementation details behind a small, deliberate interface. In C++ the tools are **access specifiers**, **member functions**, and **invariants**.

## Access specifiers

| Keyword     | Visible to                         |
| ----------- | ---------------------------------- |
| `public`    | Everyone                           |
| `protected` | This class and its derived classes |
| `private`   | Only this class (and `friend`s)    |

```cpp
class Account {
public:
    void   deposit(double amount);          // public API
    double balance() const;

private:
    double balance_ = 0;                    // protected by encapsulation
};
```

Without `public`/`private`, a `class` defaults to `private`, a `struct` to `public`.

## Why encapsulation?

- **Invariants** — the class controls the only ways its data can change.
- **Refactoring freedom** — internals can evolve without breaking callers.
- **Security** — callers can't put the object into an invalid state.

## Getters and setters

Use them sparingly — they aren't a goal in themselves.

```cpp
class Person {
public:
    explicit Person(std::string name) : name_(std::move(name)) {}

    const std::string& name() const     { return name_; }      // getter
    void rename(std::string newName)    { name_ = std::move(newName); }

private:
    std::string name_;
};
```

Prefer **named operations** (`rename`, `deposit`) over generic setters (`setName`, `setBalance`) — they describe intent.

## Maintaining invariants

A constructor establishes the invariant; member functions preserve it.

```cpp
class Percentage {
public:
    explicit Percentage(double v) { set(v); }
    void   set(double v)          { value_ = clamp(v); }
    double get() const            { return value_; }

private:
    static double clamp(double v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
    double value_;
};
```

A `Percentage` object is never out of `[0, 100]` because no field is exposed directly.

## `friend`

A `friend` declaration grants another function or class access to private members. Use it surgically — e.g. for operator overloads that can't be members:

```cpp
class Vector2 {
public:
    Vector2(double x, double y) : x(x), y(y) {}

    friend std::ostream& operator<<(std::ostream& os, const Vector2& v);

private:
    double x, y;
};

std::ostream& operator<<(std::ostream& os, const Vector2& v) {
    return os << '(' << v.x << ", " << v.y << ')';
}
```

Friendship is **not transitive** and **not inherited**.

## Pimpl idiom

To hide implementation details from headers (and keep ABI stable) wrap them in a private struct accessed through a pointer:

```cpp
// widget.h
class Widget {
public:
    Widget();
    ~Widget();
    void draw();
private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

// widget.cpp
struct Widget::Impl { /* private members live here */ };
Widget::Widget() : impl_(std::make_unique<Impl>()) {}
Widget::~Widget() = default;
```

Callers no longer need to recompile when `Impl` changes.

## Putting it together

```cpp
#include <iostream>
#include <stdexcept>

class Stack {
public:
    void push(int v) { data_[size_++] = v; if (size_ > cap_) throw std::overflow_error("full"); }
    int  pop()       { if (empty()) throw std::underflow_error("empty"); return data_[--size_]; }

    bool empty() const { return size_ == 0; }
    int  size()  const { return size_; }

private:
    static constexpr int cap_ = 8;
    int data_[cap_]{};
    int size_ = 0;
};

int main() {
    Stack s;
    s.push(1); s.push(2); s.push(3);
    while (!s.empty()) std::cout << s.pop() << ' ';   // 3 2 1
}
```
