---
title: Final, Sealed, and Immutability
---

# Final, Sealed, and Immutability

Restricting what can be changed is a powerful OOP technique. **Final** classes and fields, **sealed** hierarchies, and **immutable** objects make your code safer and more predictable.

---

## The `final` / `const` Keyword

Means "cannot be changed after initialization."

### Final Variables (Constants)

```cpp
const int MAX_SIZE = 100;
// MAX_SIZE = 200;  // ❌ Compile error!

const std::string NAME = "Alice";
// NAME = "Bob";  // ❌ Compile error!

// constexpr for compile-time constants
constexpr int BUFFER_SIZE = 1024;
```

```csharp
const int MaxSize = 100;
// MaxSize = 200;  // ❌ Compile error!

const string Name = "Alice";
// Name = "Bob";  // ❌ Compile error!

// readonly for runtime constants (set in constructor)
readonly int bufferSize = 1024;
```

```java
final int MAX_SIZE = 100;
// MAX_SIZE = 200;  // ❌ Compile error!

final String NAME = "Alice";
// NAME = "Bob";  // ❌ Compile error!
```

```python
# Python has no true constants — use UPPER_CASE convention
MAX_SIZE = 100
# MAX_SIZE = 200  # Works but violates convention!

# For true immutability, use typing.Final (type checker enforced)
from typing import Final
NAME: Final = "Alice"
# NAME = "Bob"  # Type checker error (runtime still allows it)
```

```javascript
const MAX_SIZE = 100;
// MAX_SIZE = 200;  // ❌ TypeError: Assignment to constant variable!

const NAME = "Alice";
// NAME = "Bob";  // ❌ TypeError!

// Note: const only prevents reassignment, not mutation of objects
const arr = [1, 2, 3];
arr.push(4);  // ✅ Works — array is mutated, not reassigned
// Use Object.freeze() for deep immutability
```

### Final Attributes

```cpp
class Circle {
    const double radius;  // Must be initialized in constructor

public:
    Circle(double radius) : radius(radius) {}

    // No setter — radius can't change
    double getRadius() const { return radius; }
};
```

```csharp
class Circle
{
    // readonly field — can only be set in constructor
    private readonly double radius;

    public Circle(double radius)
    {
        this.radius = radius;
    }

    public double Radius => radius;  // No setter
}
```

```java
class Circle {
    final double radius;  // Must be set in constructor, can't change

    Circle(double radius) {
        this.radius = radius;
    }

    // void setRadius(double r) {
    //     this.radius = r;  // ❌ Compile error!
    // }
}
```

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Circle:
    radius: float

    # No setter possible — frozen dataclass
    # c.radius = 5  # ❌ FrozenInstanceError!
```

```javascript
class Circle {
  #radius;  // Private field

  constructor(radius) {
    this.#radius = radius;
    Object.freeze(this);  // Prevent all modifications
  }

  get radius() {
    return this.#radius;
  }

  // No setter — radius can't change
}

const c = new Circle(5);
// c.radius = 10;  // ❌ Silently fails (or TypeError in strict mode)
```

### Final Methods — Cannot Be Overridden

```cpp
class Animal {
public:
    // 'final' prevents overriding in derived classes
    virtual void breathe() final {
        std::cout << "Breathing..." << std::endl;
    }
    virtual ~Animal() = default;
};

class Dog : public Animal {
    // void breathe() override { }  // ❌ Compile error — breathe is final!
};
```

```csharp
using System;

class Animal
{
    // 'sealed' on a method prevents further overriding
    public virtual void Breathe()
    {
        Console.WriteLine("Breathing...");
    }
}

class Mammal : Animal
{
    // Seal the override — subclasses of Mammal can't override Breathe
    public sealed override void Breathe()
    {
        Console.WriteLine("Breathing...");
    }
}

class Dog : Mammal
{
    // public override void Breathe() { }  // ❌ Compile error — Breathe is sealed!
}
```

```java
class Animal {
    final void breathe() {
        System.out.println("Breathing...");
    }
}

class Dog extends Animal {
    // @Override
    // void breathe() { }  // ❌ Compile error — breathe is final!
}
```

```python
# Python has no native final methods.
# Use typing.final decorator (type-checker enforced only)
from typing import final

class Animal:
    @final
    def breathe(self):
        print("Breathing...")

class Dog(Animal):
    # def breathe(self):  # Type checker error, but runtime allows it
    #     pass
    pass
```

```javascript
// JavaScript has no native final methods.
// Use Object.defineProperty to make a method non-writable:
class Animal {
  breathe() {
    console.log("Breathing...");
  }
}

Object.defineProperty(Animal.prototype, "breathe", {
  writable: false,
  configurable: false,
});

class Dog extends Animal {
  // breathe() { }  // ❌ TypeError in strict mode
}
```

### Final Classes — Cannot Be Extended

```cpp
// 'final' prevents inheritance
class String final {
    // No one can extend String
};

// class MyString : public String { };  // ❌ Compile error!
```

```csharp
// 'sealed' prevents inheritance
sealed class MyString
{
    // No one can extend MyString
}

// class ExtendedString : MyString { }  // ❌ Compile error!
```

```java
final class String {
    // No one can extend String
}

// class MyString extends String { }  // ❌ Compile error!
```

```python
# Use typing.final decorator (type-checker enforced)
from typing import final

@final
class ImmutablePoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# class ExtendedPoint(ImmutablePoint):  # Type checker error
#     pass
```

```javascript
// JavaScript has no native final classes.
// Throw in constructor to prevent extension:
class FinalClass {
  constructor() {
    if (new.target !== FinalClass) {
      throw new Error("FinalClass cannot be extended");
    }
  }
}

// class Extended extends FinalClass { }
// new Extended();  // ❌ Error: FinalClass cannot be extended
```

Common final classes in Java: `String`, `Integer`, `Double`, `Math`.

---

## Immutable Objects

An **immutable** object cannot be modified after creation. All its state is fixed at construction time.

### Creating an Immutable Class

```cpp
#include <iostream>
#include <string>
#include <stdexcept>

class Money final {
    const double amount;
    const std::string currency;

public:
    Money(double amount, std::string currency)
        : amount(amount), currency(currency) {}

    double getAmount() const { return amount; }
    const std::string& getCurrency() const { return currency; }

    // No setters! State can't change.

    // Operations return NEW objects
    Money add(const Money& other) const {
        if (currency != other.currency) {
            throw std::invalid_argument("Currency mismatch");
        }
        return Money(amount + other.amount, currency);
    }

    friend std::ostream& operator<<(std::ostream& os, const Money& m) {
        os << m.amount << " " << m.currency;
        return os;
    }
};

Money price(29.99, "USD");
Money tax(2.40, "USD");
Money total = price.add(tax);  // New object — price and tax unchanged

std::cout << price << std::endl;  // 29.99 USD (unchanged)
std::cout << total << std::endl;  // 32.39 USD (new object)
```

```csharp
using System;

sealed class Money
{
    public double Amount { get; }
    public string Currency { get; }

    public Money(double amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    // No setters! State can't change.

    // Operations return NEW objects
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Currency mismatch");
        return new Money(Amount + other.Amount, Currency);
    }

    public override string ToString() => $"{Amount} {Currency}";
}

var price = new Money(29.99, "USD");
var tax = new Money(2.40, "USD");
var total = price.Add(tax);  // New object — price and tax unchanged

Console.WriteLine(price);  // 29.99 USD (unchanged)
Console.WriteLine(total);  // 32.39 USD (new object)
```

```java
public final class Money {
    private final double amount;
    private final String currency;

    public Money(double amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    public double getAmount() { return amount; }
    public String getCurrency() { return currency; }

    // No setters! State can't change.

    // Operations return NEW objects
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    @Override
    public String toString() {
        return amount + " " + currency;
    }
}

Money price = new Money(29.99, "USD");
Money tax = new Money(2.40, "USD");
Money total = price.add(tax);  // New object — price and tax unchanged

System.out.println(price);  // 29.99 USD (unchanged)
System.out.println(total);  // 32.39 USD (new object)
```

```python
from dataclasses import dataclass

@dataclass(frozen=True)  # frozen = immutable
class Money:
    amount: float
    currency: str = "USD"

    def add(self, other):
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

price = Money(29.99, "USD")
tax = Money(2.40, "USD")
total = price.add(tax)  # New object — price and tax unchanged

print(price)  # Money(amount=29.99, currency='USD') (unchanged)
print(total)  # Money(amount=32.39, currency='USD') (new object)

# price.amount = 50  # ❌ FrozenInstanceError!
```

```javascript
class Money {
  #amount;
  #currency;

  constructor(amount, currency = "USD") {
    this.#amount = amount;
    this.#currency = currency;
    Object.freeze(this);  // Prevent all modifications
  }

  get amount() { return this.#amount; }
  get currency() { return this.#currency; }

  // No setters! State can't change.

  // Operations return NEW objects
  add(other) {
    if (this.#currency !== other.currency) {
      throw new Error("Currency mismatch");
    }
    return new Money(this.#amount + other.amount, this.#currency);
  }

  toString() {
    return `${this.#amount} ${this.#currency}`;
  }
}

const price = new Money(29.99, "USD");
const tax = new Money(2.40, "USD");
const total = price.add(tax);  // New object

console.log(price.toString());  // 29.99 USD (unchanged)
console.log(total.toString());  // 32.39 USD (new object)
```

### Rules for Immutability

1. Make the class `final` (no subclasses)
2. Make all fields `private final` / `const` / frozen
3. No setter methods
4. Initialize everything in the constructor
5. If fields reference mutable objects, return defensive copies

---

## Benefits of Immutability

| Benefit | Explanation |
|---------|-------------|
| **Thread safety** | No synchronization needed — can't be modified |
| **Predictability** | State never changes unexpectedly |
| **Safe sharing** | Can be freely shared without defensive copies |
| **Cache-friendly** | Hash code never changes — safe as map keys |
| **Simpler reasoning** | No need to track state changes |

---

## Java Records (Java)

Records are a concise way to create immutable data classes:

```cpp
// C++ doesn't have records, but you can use a struct with const members
struct Point {
    const int x;
    const int y;

    // Automatically provides equality via operator==
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

Point p1{3, 4};
// p1.x = 5;  // ❌ Compile error
```

```csharp
using System;

// C# records (C# 9+) — concise immutable data types
record Point(int X, int Y);

// Automatically generates:
// - readonly properties
// - constructor
// - Equals(), GetHashCode()
// - ToString()
// - Deconstructor
// - with-expression support

var p1 = new Point(3, 4);
Console.WriteLine(p1.X);       // 3
Console.WriteLine(p1.Y);       // 4
Console.WriteLine(p1);         // Point { X = 3, Y = 4 }

var p2 = new Point(3, 4);
Console.WriteLine(p1 == p2);   // True (value equality)

// Create modified copy with 'with' expression
var p3 = p1 with { X = 10 };
Console.WriteLine(p3);         // Point { X = 10, Y = 4 }
```

```java
// This single line replaces ~40 lines of boilerplate
record Point(int x, int y) { }

// Automatically generates:
// - private final fields
// - constructor
// - getters (x(), y())
// - equals()
// - hashCode()
// - toString()

Point p1 = new Point(3, 4);
System.out.println(p1.x());       // 3
System.out.println(p1.y());       // 4
System.out.println(p1);           // Point[x=3, y=4]

Point p2 = new Point(3, 4);
System.out.println(p1.equals(p2)); // true
```

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

    def translate(self, dx, dy):
        return Point(self.x + dx, self.y + dy)  # Returns new object

p1 = Point(3, 4)
p2 = Point(3, 4)
print(p1)          # Point(x=3, y=4)
print(p1 == p2)    # True
# p1.x = 10       # ❌ FrozenInstanceError!
```

```javascript
// JavaScript doesn't have records, but you can freeze objects
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
  }

  translate(dx, dy) {
    return new Point(this.x + dx, this.y + dy);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  toString() {
    return `Point(${this.x}, ${this.y})`;
  }
}

const p1 = new Point(3, 4);
const p2 = new Point(3, 4);
console.log(p1.toString());    // Point(3, 4)
console.log(p1.equals(p2));    // true
// p1.x = 10;                  // ❌ Silently fails (or TypeError in strict mode)
```

Records with validation (Java):

```cpp
struct Range {
    const int min;
    const int max;

    Range(int min, int max) : min(min), max(max) {
        if (min > max) {
            throw std::invalid_argument("min must be <= max");
        }
    }
};
```

```java
record Range(int min, int max) {
    // Compact constructor for validation
    Range {
        if (min > max) {
            throw new IllegalArgumentException("min must be <= max");
        }
    }
}
```

```python
@dataclass(frozen=True)
class Range:
    min: int
    max: int

    def __post_init__(self):
        if self.min > self.max:
            raise ValueError("min must be <= max")
```

```javascript
class Range {
  constructor(min, max) {
    if (min > max) {
      throw new Error("min must be <= max");
    }
    this.min = min;
    this.max = max;
    Object.freeze(this);
  }
}
```

---

## Immutability with Records and readonly (C#)

C# provides multiple tools for immutability:

| Feature | Purpose |
|---------|--------|
| `const` | Compile-time constants (primitive types only) |
| `readonly` | Runtime immutable fields (set only in constructor) |
| `init` accessor | Property can be set only during object initialization |
| `record` | Immutable reference type with value semantics |
| `record struct` | Immutable value type with value semantics (C# 10+) |
| `required` | Forces initialization at creation (C# 11+) |

```csharp
// init-only properties (C# 9+)
class Person
{
    public required string Name { get; init; }
    public int Age { get; init; }
}

var p = new Person { Name = "Alice", Age = 30 };
// p.Name = "Bob";  // ❌ Compile error — init-only!

// record with 'with' expression for non-destructive mutation
record Point(int X, int Y);
var p1 = new Point(1, 2);
var p2 = p1 with { X = 10 };  // New object: Point(10, 2)
```

---

## Sealed Classes (Java)

**Sealed classes** restrict which classes can extend them:

```cpp
// C++ doesn't have sealed classes directly.
// Use final on leaf classes + friend declarations to restrict hierarchy.
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle final : public Shape {
public:
    double radius;
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};

class Rectangle final : public Shape {
public:
    double width, height;
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
};

// class Hexagon : public Shape { };  // Allowed in C++ (no sealed)
```

```csharp
using System;

// C# has native sealed classes and abstract sealed hierarchies
abstract class Shape
{
    public abstract double Area();
}

sealed class Circle : Shape
{
    public double Radius { get; }
    public Circle(double r) => Radius = r;
    public override double Area() => Math.PI * Radius * Radius;
}

sealed class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }
    public Rectangle(double w, double h) { Width = w; Height = h; }
    public override double Area() => Width * Height;
}

// class Hexagon : Shape { }  // ❌ Allowed unless you restrict via convention
// Note: C# sealed prevents further subclassing of the leaf classes
```

```java
sealed class Shape permits Circle, Rectangle, Triangle {
    abstract double area();
}

final class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    double area() { return Math.PI * radius * radius; }
}

final class Rectangle extends Shape {
    double width, height;
    Rectangle(double w, double h) { this.width = w; this.height = h; }
    double area() { return width * height; }
}

final class Triangle extends Shape {
    double base, height;
    Triangle(double b, double h) { this.base = b; this.height = h; }
    double area() { return 0.5 * base * height; }
}

// class Hexagon extends Shape { }  // ❌ Not permitted!
```

```python
# Python doesn't have sealed classes natively.
# Use __init_subclass__ to restrict subclassing:
class Shape:
    _allowed_subclasses = {"Circle", "Rectangle", "Triangle"}

    def __init_subclass__(cls, **kwargs):
        if cls.__name__ not in Shape._allowed_subclasses:
            raise TypeError(f"{cls.__name__} is not permitted to extend Shape")
        super().__init_subclass__(**kwargs)

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14159 * self.radius ** 2

# class Hexagon(Shape):  # ❌ TypeError!
#     pass
```

```javascript
// JavaScript doesn't have sealed classes natively.
// Use a check in the constructor:
class Shape {
  static #allowedSubclasses = new Set(["Circle", "Rectangle", "Triangle"]);

  constructor() {
    if (!Shape.#allowedSubclasses.has(this.constructor.name)) {
      throw new Error(`${this.constructor.name} is not permitted to extend Shape`);
    }
  }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

// class Hexagon extends Shape { constructor() { super(); } }
// new Hexagon();  // ❌ Error: Hexagon is not permitted to extend Shape
```

Benefits:
- Compiler knows all subtypes → exhaustive `switch` checks
- Controlled hierarchy — no unexpected subclasses

---

## Key Takeaways

- **`final` / `const` variables**: can't be reassigned after initialization
- **`final` methods**: can't be overridden by subclasses
- **`final` classes**: can't be extended
- **Immutable objects**: state never changes after creation — safer and simpler
- **Records** (Java 16+) / **frozen dataclasses** (Python): concise immutable data classes
- **Sealed classes** (Java 17+): restrict the inheritance hierarchy
- Immutability is especially valuable for **thread safety** and **predictable code**

Next: **Collections and OOP** — using generics and OOP with lists, maps, and sets.
