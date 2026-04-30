---
title: C++ Inheritance
---

# C++ Inheritance

Inheritance lets a **derived** class reuse and extend the interface of a **base** class. C++ supports single, multiple, and (rarely) virtual inheritance.

## Basic syntax

```cpp
class Animal {
public:
    void eat() { std::cout << "eat\n"; }
};

class Dog : public Animal {        // Dog "is-a" Animal
public:
    void bark() { std::cout << "woof\n"; }
};

Dog d;
d.eat();                            // inherited
d.bark();                           // own member
```

Use `public` inheritance for **is-a** relationships. `protected` and `private` inheritance are advanced and rare.

## Constructor chaining

A derived class must initialise its base before its own members:

```cpp
class Animal {
public:
    Animal(std::string name) : name(std::move(name)) {}
protected:
    std::string name;
};

class Dog : public Animal {
public:
    Dog(std::string name, int age)
        : Animal(std::move(name)), age(age) {}
private:
    int age;
};
```

If you don't call a base constructor, the compiler calls its **default** one.

## Access in derived classes

| Base member access | Visible in derived (with `public` inheritance) |
| ------------------ | ---------------------------------------------- |
| `public`           | `public`                                       |
| `protected`        | `protected`                                    |
| `private`          | not accessible                                 |

`protected` members let derived classes touch internals while still hiding them from outside callers.

## Overriding base methods

Mark base methods `virtual` so derived classes can override them, and use `override` on the derived side:

```cpp
class Shape {
public:
    virtual double area() const = 0;          // pure virtual → abstract class
    virtual ~Shape() = default;               // always virtual destructor in a base
};

class Circle : public Shape {
public:
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
private:
    double r;
};
```

A class with one or more `= 0` methods is **abstract** — you can't instantiate it.

> Always make destructors `virtual` when a class is meant to be used polymorphically. Otherwise `delete` through a base pointer is undefined behavior.

## `override` and `final`

- `override` — compiler error if you don't actually override anything (catches typos like `voidArea`).
- `final` — prevent further overrides:

```cpp
class Logger {
public:
    virtual void log(const std::string&) = 0;
};

class FileLogger final : public Logger {       // no one can derive from FileLogger
public:
    void log(const std::string& msg) override final;   // and this method is sealed
};
```

## Multiple inheritance

C++ allows it, but be careful:

```cpp
class Drawable      { public: virtual void draw() = 0; };
class Serializable  { public: virtual std::string toJson() = 0; };

class Sprite : public Drawable, public Serializable { /* ... */ };
```

Use it mainly for **interfaces** (classes with only pure virtual methods). For shared state across diamonds, see **virtual inheritance** (advanced).

## Composition over inheritance

If "is-a" doesn't fit, prefer **composition** — store the other type as a member:

```cpp
class Engine    { public: void start(); };
class Car       { Engine engine; public: void start() { engine.start(); } };
```

Composition is more flexible, easier to test, and avoids the fragile-base-class problem.

## Putting it together

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

class Square : public Shape {
public:
    explicit Square(double s) : s(s) {}
    double area() const override { return s * s; }
    std::string name() const override { return "square"; }
private:
    double s;
};

class Triangle : public Shape {
public:
    Triangle(double b, double h) : b(b), h(h) {}
    double area() const override { return 0.5 * b * h; }
    std::string name() const override { return "triangle"; }
private:
    double b, h;
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Square>(3));
    shapes.push_back(std::make_unique<Triangle>(4, 5));

    for (const auto& s : shapes)
        std::cout << s->name() << " area = " << s->area() << '\n';
}
```

Next: [C++ Polymorphism](#).
