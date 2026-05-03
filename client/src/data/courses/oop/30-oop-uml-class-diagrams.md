---
title: UML Class Diagrams
---

# UML Class Diagrams

**UML** (Unified Modeling Language) class diagrams are a standard way to visualize class structures, attributes, methods, and relationships. They are widely used in software design and documentation.

---

## Why UML?

Before writing code, you can sketch the design:

- Communicate class structure to your team
- Plan relationships between classes
- Document existing code for new developers
- Required in many CS courses and interviews

---

## Class Notation

A class is represented as a box with three sections:

```
┌──────────────────────┐
│      ClassName        │  ← Name
├──────────────────────┤
│ - name: String        │  ← Attributes
│ - age: int            │
│ # id: int             │
├──────────────────────┤
│ + getName(): String   │  ← Methods
│ + setAge(int): void   │
│ - validate(): boolean │
└──────────────────────┘
```

### Access Modifier Symbols

| Symbol | Meaning |
|--------|---------|
| `+` | public |
| `-` | private |
| `#` | protected |
| `~` | package-private (default) |

### Attribute Format

```
visibility name: type
```

Examples:
```
- name: String
+ age: int
# id: long
- balance: double = 0.0    (with default value)
```

### Method Format

```
visibility name(parameters): returnType
```

Examples:
```
+ getName(): String
+ setAge(age: int): void
- calculateTax(income: double): double
+ toString(): String
```

---

## Relationships

### 1. Inheritance (Generalization)

A solid line with a **hollow triangle** arrow pointing to the parent:

```
  ┌──────────┐
  │  Animal   │
  └─────△────┘
        │
  ┌─────┴────┐
  │   Dog     │
  └──────────┘
```

### 2. Interface Implementation (Realization)

A **dashed line** with a hollow triangle:

```
  ┌─────────────┐
  │ «interface»  │
  │  Printable   │
  └──────△──────┘
         ┆
  ┌──────┴──────┐
  │  Document    │
  └─────────────┘
```

### 3. Association

A solid line between classes:

```
  ┌──────────┐         ┌──────────┐
  │ Teacher   │────────│  Student  │
  └──────────┘         └──────────┘
```

With multiplicity:

```
  ┌──────────┐  1    * ┌──────────┐
  │ Teacher   │────────│  Student  │
  └──────────┘         └──────────┘
```

1 teacher has many (*) students.

### 4. Aggregation (Shared Has-A)

A solid line with a **hollow diamond** at the container end:

```
  ┌──────────┐         ┌──────────┐
  │Department │◇───────│ Employee  │
  └──────────┘         └──────────┘
```

### 5. Composition (Owned Has-A)

A solid line with a **filled diamond** at the container end:

```
  ┌──────────┐         ┌──────────┐
  │  House    │◆───────│   Room   │
  └──────────┘         └──────────┘
```

### 6. Dependency (Uses)

A **dashed arrow** pointing to the used class:

```
  ┌──────────┐ - - - → ┌──────────┐
  │ Printer   │         │ Document  │
  └──────────┘         └──────────┘
```

---

## Multiplicity

| Notation | Meaning |
|----------|---------|
| `1` | Exactly one |
| `0..1` | Zero or one |
| `*` or `0..*` | Zero or more |
| `1..*` | One or more |
| `3..5` | Three to five |

---

## From UML to Code

Translating a UML class to code in different languages:

Given this UML:
```
┌──────────────────────┐
│      BankAccount      │
├──────────────────────┤
│ - balance: double     │
│ - owner: String       │
├──────────────────────┤
│ + deposit(amount): void │
│ + withdraw(amount): void│
│ + getBalance(): double  │
└──────────────────────┘
```

```cpp
class BankAccount {
private:
    double balance;
    std::string owner;

public:
    BankAccount(std::string owner, double balance = 0.0)
        : owner(owner), balance(balance) {}

    void deposit(double amount) {
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
        }
    }

    double getBalance() const {
        return balance;
    }
};
```

```csharp
class BankAccount
{
    private double balance;
    private string owner;

    public BankAccount(string owner, double balance = 0.0)
    {
        this.owner = owner;
        this.balance = balance;
    }

    public void Deposit(double amount) => balance += amount;

    public void Withdraw(double amount)
    {
        if (amount <= balance)
            balance -= amount;
    }

    public double GetBalance() => balance;
}
```

```java
public class BankAccount {
    private double balance;
    private String owner;

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    public void deposit(double amount) {
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
        }
    }

    public double getBalance() {
        return balance;
    }
}
```

```python
class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        self._balance = balance  # - means private (convention: underscore)
        self._owner = owner

    def deposit(self, amount: float) -> None:
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount <= self._balance:
            self._balance -= amount

    def get_balance(self) -> float:
        return self._balance
```

```javascript
class BankAccount {
  #balance;  // - means private (use # for private fields)
  #owner;

  constructor(owner, balance = 0.0) {
    this.#owner = owner;
    this.#balance = balance;
  }

  deposit(amount) {
    this.#balance += amount;
  }

  withdraw(amount) {
    if (amount <= this.#balance) {
      this.#balance -= amount;
    }
  }

  getBalance() {
    return this.#balance;
  }
}
```

---

## UML Inheritance Example

Given this UML diagram:
```
┌─────────────────────┐
│     «abstract»       │
│       Shape          │
├─────────────────────┤
│ # color: String      │
├─────────────────────┤
│ + area(): double     │
│ + toString(): String │
└──────────△──────────┘
           │
    ┌──────┴──────┐
    │              │
┌───┴────┐    ┌───┴──────┐
│ Circle  │    │ Rectangle │
├─────────┤    ├──────────┤
│ - radius│    │ - width   │
│         │    │ - height  │
├─────────┤    ├──────────┤
│ + area()│    │ + area()  │
└─────────┘    └──────────┘
```

```cpp
#include <iostream>
#include <string>
#include <cmath>

class Shape {
protected:
    std::string color;

public:
    Shape(std::string color) : color(color) {}
    virtual double area() const = 0;
    virtual std::string toString() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;

public:
    Circle(std::string color, double radius)
        : Shape(color), radius(radius) {}

    double area() const override {
        return M_PI * radius * radius;
    }

    std::string toString() const override {
        return "Circle(color=" + color + ", radius=" + std::to_string(radius) + ")";
    }
};

class Rectangle : public Shape {
    double width, height;

public:
    Rectangle(std::string color, double width, double height)
        : Shape(color), width(width), height(height) {}

    double area() const override {
        return width * height;
    }

    std::string toString() const override {
        return "Rectangle(color=" + color + ", " + std::to_string(width)
             + "x" + std::to_string(height) + ")";
    }
};
```

```csharp
using System;

abstract class Shape
{
    protected string Color { get; }

    protected Shape(string color) => Color = color;
    public abstract double Area();
    public abstract override string ToString();
}

class Circle : Shape
{
    private double radius;

    public Circle(string color, double radius) : base(color)
        => this.radius = radius;

    public override double Area() => Math.PI * radius * radius;
    public override string ToString() => $"Circle(color={Color}, radius={radius})";
}

class Rectangle : Shape
{
    private double width, height;

    public Rectangle(string color, double width, double height) : base(color)
    {
        this.width = width;
        this.height = height;
    }

    public override double Area() => width * height;
    public override string ToString() => $"Rectangle(color={Color}, {width}x{height})";
}
```

```java
abstract class Shape {
    protected String color;

    Shape(String color) { this.color = color; }
    abstract double area();
    abstract String toString();
}

class Circle extends Shape {
    private double radius;

    Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    double area() { return Math.PI * radius * radius; }

    @Override
    public String toString() {
        return "Circle(color=" + color + ", radius=" + radius + ")";
    }
}

class Rectangle extends Shape {
    private double width, height;

    Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    double area() { return width * height; }

    @Override
    public String toString() {
        return "Rectangle(color=" + color + ", " + width + "x" + height + ")";
    }
}
```

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    def __init__(self, color: str):
        self._color = color  # protected

    @abstractmethod
    def area(self) -> float:
        pass

    @abstractmethod
    def __str__(self) -> str:
        pass

class Circle(Shape):
    def __init__(self, color: str, radius: float):
        super().__init__(color)
        self.__radius = radius  # private

    def area(self) -> float:
        return math.pi * self.__radius ** 2

    def __str__(self) -> str:
        return f"Circle(color={self._color}, radius={self.__radius})"

class Rectangle(Shape):
    def __init__(self, color: str, width: float, height: float):
        super().__init__(color)
        self.__width = width
        self.__height = height

    def area(self) -> float:
        return self.__width * self.__height

    def __str__(self) -> str:
        return f"Rectangle(color={self._color}, {self.__width}x{self.__height})"
```

```javascript
class Shape {
  constructor(color) {
    if (new.target === Shape) {
      throw new Error("Cannot instantiate abstract class Shape");
    }
    this._color = color;  // protected (convention)
  }

  area() { throw new Error("Must implement area()"); }
  toString() { throw new Error("Must implement toString()"); }
}

class Circle extends Shape {
  #radius;

  constructor(color, radius) {
    super(color);
    this.#radius = radius;
  }

  area() { return Math.PI * this.#radius ** 2; }
  toString() { return `Circle(color=${this._color}, radius=${this.#radius})`; }
}

class Rectangle extends Shape {
  #width;
  #height;

  constructor(color, width, height) {
    super(color);
    this.#width = width;
    this.#height = height;
  }

  area() { return this.#width * this.#height; }
  toString() { return `Rectangle(color=${this._color}, ${this.#width}x${this.#height})`; }
}
```

---

## Complete Example — Library System

```
┌────────────────────────┐
│       «abstract»        │
│        LibraryItem      │
├────────────────────────┤
│ - id: String            │
│ - title: String         │
│ # available: boolean    │
├────────────────────────┤
│ + getId(): String       │
│ + getTitle(): String    │
│ + isAvailable(): boolean│
│ + checkout(): void      │
│ + returnItem(): void    │
└───────────△────────────┘
            │
     ┌──────┴──────┐
     │              │
┌────┴──────┐  ┌───┴───────┐
│   Book    │  │    DVD     │
├───────────┤  ├───────────┤
│ - author  │  │ - director│
│ - isbn    │  │ - duration│
│ - pages   │  │           │
├───────────┤  ├───────────┤
│ + ...     │  │ + ...     │
└───────────┘  └───────────┘

┌────────────────────┐    1    * ┌──────────────────┐
│      Member        │──────────│     Loan          │
├────────────────────┤          ├──────────────────┤
│ - memberId: String │          │ - loanDate: Date  │
│ - name: String     │          │ - dueDate: Date   │
│ - email: String    │          │ - returned: boolean│
├────────────────────┤          ├──────────────────┤
│ + borrow(item)     │          │ + isOverdue()     │
│ + returnItem(item) │          │ + getDaysLeft()   │
└────────────────────┘          └──────────────────┘
                                       │ 1
                                       │
                                  ┌────┴──────────┐
                                  │  LibraryItem   │
                                  └───────────────┘

┌──────────────────────┐
│      Library          │
├──────────────────────┤         ┌──────────────┐
│ - name: String        │◆───────│ LibraryItem  │
│ - items: List         │  1  *  └──────────────┘
├──────────────────────┤
│ + addItem(item)       │         ┌──────────────┐
│ + searchByTitle(t)    │◇───────│   Member     │
│ + registerMember(m)   │  1  *  └──────────────┘
└──────────────────────┘
```

---

## Stereotypes and Notes

### Stereotypes

Special labels in `«guillemets»`:

```
«interface» Printable
«abstract» Shape
«enum» Day
«record» Point
```

### Notes

Add explanatory text:

```
┌──────────────────┐
│  BankAccount      │ ─ ─ ─ ┌─────────────────────┐
├──────────────────┤        │ Balance must never    │
│ - balance: double │        │ be negative.          │
└──────────────────┘        └─────────────────────┘
```

---

## Key Takeaways

- UML class diagrams visualize **classes**, **attributes**, **methods**, and **relationships**
- Access modifiers: `+` public, `-` private, `#` protected
- Six relationship types: inheritance, realization, association, aggregation, composition, dependency
- **Multiplicity** shows how many instances participate in a relationship
- UML is a **communication tool** — use it to plan and document designs
- All four languages can implement the same UML design with their own idioms

Next: **SOLID Principles Overview** — the five principles of good OOP design.
