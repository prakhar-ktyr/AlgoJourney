---
title: C++ Polymorphism
---

# C++ Polymorphism

**Polymorphism** lets the same code work with objects of different types. C++ has two main flavours:

- **Run-time (dynamic) polymorphism** through virtual functions and inheritance.
- **Compile-time (static) polymorphism** through templates and overloading (covered in [C++ Templates](/tutorials/cpp/cpp-templates)).

## Virtual functions in action

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
private:
    double r;
};

class Square : public Shape {
public:
    explicit Square(double s) : s(s) {}
    double area() const override { return s * s; }
private:
    double s;
};

void print(const Shape& s) {
    std::cout << s.area() << '\n';      // calls the right override at runtime
}

int main() {
    Circle c(2);
    Square q(3);
    print(c);    // 12.566...
    print(q);    // 9
}
```

The decision happens **at run time** thanks to a hidden **virtual table** ("vtable") on each polymorphic object.

## Polymorphism requires references or pointers

If you slice an object by value, you lose the override:

```cpp
void byValue(Shape s);            // ❌ doesn't compile if Shape is abstract,
                                   //   and would slice if it weren't
void byRef(const Shape& s);       // ✅ keeps the dynamic type
void byPtr(const Shape* s);       // ✅ same
```

**Object slicing**: copying a derived object into a base value drops the derived parts and the vtable pointer.

## Pure virtual + abstract classes

```cpp
class Drawable {
public:
    virtual void draw() = 0;          // = 0 → pure virtual
    virtual ~Drawable() = default;
};
```

`Drawable` cannot be instantiated. Derived classes must implement `draw()` (or stay abstract themselves). This is C++'s way to express an **interface**.

## `dynamic_cast`

Cast safely down a polymorphic hierarchy. Returns `nullptr` (for pointers) or throws (`std::bad_cast` for references) if the type doesn't match:

```cpp
Shape* s = getShape();
if (auto* c = dynamic_cast<Circle*>(s)) {
    // s really is a Circle
}
```

Reach for `dynamic_cast` only when polymorphism alone isn't enough. Frequent downcasts often signal a missing virtual function.

## CRTP — static polymorphism

The **Curiously Recurring Template Pattern** gives you compile-time dispatch with no vtable cost:

```cpp
template <typename Derived>
class Shape {
public:
    double area() const {
        return static_cast<const Derived*>(this)->area_impl();
    }
};

class Circle : public Shape<Circle> {
public:
    explicit Circle(double r) : r(r) {}
    double area_impl() const { return 3.14159 * r * r; }
private:
    double r;
};
```

Useful for performance-critical hot loops and policy-based design.

## Operator overloading

Operators are functions; many can be overridden in derived classes or overloaded for your own types:

```cpp
class Vec2 {
public:
    Vec2(double x, double y) : x(x), y(y) {}
    Vec2 operator+(const Vec2& rhs) const { return {x + rhs.x, y + rhs.y}; }
    double x, y;
};

Vec2 a{1, 2}, b{3, 4};
Vec2 c = a + b;     // {4, 6}
```

Common overloads: arithmetic (`+ - * /`), comparison (`== != < <=>`), stream insertion (`<<`), function call (`operator()`), subscript (`[]`).

## Putting it together

```cpp
#include <iostream>
#include <memory>
#include <vector>

class Notifier {
public:
    virtual void notify(const std::string& msg) const = 0;
    virtual ~Notifier() = default;
};

class EmailNotifier : public Notifier {
public:
    void notify(const std::string& msg) const override {
        std::cout << "[email] " << msg << '\n';
    }
};

class PushNotifier : public Notifier {
public:
    void notify(const std::string& msg) const override {
        std::cout << "[push] "  << msg << '\n';
    }
};

void broadcast(const std::vector<std::unique_ptr<Notifier>>& xs,
               const std::string& msg) {
    for (const auto& n : xs) n->notify(msg);
}

int main() {
    std::vector<std::unique_ptr<Notifier>> channels;
    channels.push_back(std::make_unique<EmailNotifier>());
    channels.push_back(std::make_unique<PushNotifier>());
    broadcast(channels, "build passed");
}
```
