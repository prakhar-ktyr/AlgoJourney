---
title: C++ Classes and Objects
---

# C++ Classes and Objects

A **class** is a user-defined type that bundles data (**members**) with the operations on that data (**member functions**). An **object** is an instance of a class.

## Defining a class

```cpp
class Rectangle {
public:
    double width;
    double height;

    double area() const {
        return width * height;
    }
};
```

`public:` controls visibility — anything below it is accessible from outside the class. The default in `class` is `private`.

## Creating objects

```cpp
Rectangle r;
r.width  = 3.0;
r.height = 4.0;
std::cout << r.area();    // 12

Rectangle r2{5.0, 6.0};   // brace-init order = declaration order
```

## `class` vs `struct`

They're almost identical. The only difference:

| Keyword  | Default member access | Default inheritance |
| -------- | --------------------- | ------------------- |
| `class`  | `private`             | `private`           |
| `struct` | `public`              | `public`            |

Use `struct` for plain data aggregates and `class` when you have invariants to protect.

## Member functions

Defined inside the class are implicitly `inline`:

```cpp
class Counter {
public:
    void bump()    { ++count; }
    int  value()   const { return count; }     // const = doesn't modify *this

private:
    int count = 0;                              // default member initializer
};
```

Or defined out-of-class:

```cpp
class Counter {
public:
    void bump();
    int  value() const;
private:
    int count = 0;
};

void Counter::bump()      { ++count; }
int  Counter::value() const { return count; }
```

The `Counter::` qualifier ties the definition back to the class.

## `this` pointer

Inside a non-static member function, `this` is a pointer to the current object:

```cpp
class Box {
public:
    Box& grow(int n) { width += n; return *this; }   // returns by reference
    int  width = 0;
};

Box b;
b.grow(2).grow(3);    // chaining works because grow returns *this
```

## Static members

Belong to the class, not to any instance:

```cpp
class Widget {
public:
    static int count;            // declaration
    Widget()  { ++count; }
};

int Widget::count = 0;           // definition (in a .cpp file)
```

Access without an object: `Widget::count`.

## Putting it together

```cpp
#include <iostream>
#include <string>

class Account {
public:
    Account(std::string owner, double opening = 0.0)
        : owner(std::move(owner)), balance(opening) {}

    void   deposit(double amount)  { balance += amount; }
    bool   withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }
    double getBalance() const { return balance; }
    const std::string& getOwner() const { return owner; }

private:
    std::string owner;
    double      balance;
};

int main() {
    Account a("Ada", 100);
    a.deposit(50);
    a.withdraw(30);
    std::cout << a.getOwner() << " has $" << a.getBalance() << '\n';
}
```

Next: [C++ Constructors and Destructors](#).
