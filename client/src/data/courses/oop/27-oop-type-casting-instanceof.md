---
title: Type Casting and instanceof
---

# Type Casting and instanceof

**Type casting** converts an object from one type to another. The `instanceof` operator checks an object's type before casting. These are essential for working with polymorphism.

---

## Upcasting (Widening)

Converting a child type to a parent type. Always **safe** and **automatic**:

```cpp
#include <iostream>

class Animal {
public:
    virtual void eat() { std::cout << "Eating..." << std::endl; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void bark() { std::cout << "Woof!" << std::endl; }
};

Dog rex;
Animal* animal = &rex;   // Upcasting — automatic, always safe
animal->eat();           // ✅ Works
// animal->bark();       // ❌ Compile error — Animal doesn't have bark()
```

```csharp
using System;

class Animal
{
    public virtual void Eat() => Console.WriteLine("Eating...");
}

class Dog : Animal
{
    public void Bark() => Console.WriteLine("Woof!");
}

Dog rex = new Dog();
Animal animal = rex;     // Upcasting — automatic, always safe
animal.Eat();            // ✅ Works
// animal.Bark();        // ❌ Compile error — Animal doesn't have Bark()
```

```java
class Animal {
    void eat() { System.out.println("Eating..."); }
}

class Dog extends Animal {
    void bark() { System.out.println("Woof!"); }
}

Dog rex = new Dog();
Animal animal = rex;     // Upcasting — automatic, always safe
animal.eat();            // ✅ Works
// animal.bark();        // ❌ Compile error — Animal doesn't have bark()
```

```python
class Animal:
    def eat(self):
        print("Eating...")

class Dog(Animal):
    def bark(self):
        print("Woof!")

rex = Dog()
animal = rex   # Python doesn't have explicit upcasting — it's automatic
animal.eat()   # ✅
animal.bark()  # ✅ Python doesn't restrict — duck typing
```

```javascript
class Animal {
  eat() { console.log("Eating..."); }
}

class Dog extends Animal {
  bark() { console.log("Woof!"); }
}

const rex = new Dog();
const animal = rex;    // JavaScript doesn't have explicit upcasting
animal.eat();          // ✅
animal.bark();         // ✅ JavaScript doesn't restrict — duck typing
```

---

## Downcasting (Narrowing)

Converting a parent type back to a child type. **Risky** — requires explicit casting:

```cpp
#include <iostream>

Animal* animal = new Dog();  // Upcast

// Downcast — use dynamic_cast for safety
Dog* dog = dynamic_cast<Dog*>(animal);
if (dog != nullptr) {
    dog->bark();  // ✅ Safe — dynamic_cast verified the type
}

// Dangerous downcast:
Animal* animal2 = new Animal();
Dog* dog2 = dynamic_cast<Dog*>(animal2);  // Returns nullptr (safe failure)
// static_cast<Dog*>(animal2)->bark();    // ❌ Undefined behavior!

delete animal;
delete animal2;
```

```csharp
using System;

Animal animal = new Dog();  // Upcast

// Downcast — use 'as' for safe casting
Dog? dog = animal as Dog;
if (dog != null)
{
    dog.Bark();  // ✅ Safe — 'as' verified the type
}

// Dangerous downcast:
Animal animal2 = new Animal();
Dog? dog2 = animal2 as Dog;  // Returns null (safe failure)
// ((Dog)animal2).Bark();    // ❌ InvalidCastException!
```

```java
Animal animal = new Dog();  // Upcast

// Downcast — must be explicit
Dog dog = (Dog) animal;  // ✅ Works — the actual object IS a Dog
dog.bark();              // ✅ Now we can call Dog methods

// Dangerous downcast:
Animal animal2 = new Cat();
Dog dog2 = (Dog) animal2;  // ❌ ClassCastException at runtime!
```

```python
# Python doesn't have explicit casting — duck typing means no need
animal = Dog()

# Just use isinstance() to check before calling specific methods
if isinstance(animal, Dog):
    animal.bark()  # ✅ Safe

# No ClassCastException — but AttributeError if method doesn't exist
animal2 = Animal()
# animal2.bark()  # ❌ AttributeError: 'Animal' has no attribute 'bark'
```

```javascript
// JavaScript doesn't have casting — duck typing
const animal = new Dog();

// Check type before calling specific methods
if (animal instanceof Dog) {
  animal.bark();  // ✅ Safe
}

// No ClassCastException — but TypeError if method doesn't exist
const animal2 = new Animal();
// animal2.bark();  // ❌ TypeError: animal2.bark is not a function
```

Always check the type first!

---

## The `instanceof` / Type-Checking Operator

```cpp
#include <iostream>
#include <typeinfo>

Animal* animal = new Dog();

// dynamic_cast returns nullptr if cast fails (for pointers)
if (dynamic_cast<Dog*>(animal) != nullptr) {
    std::cout << "It's a Dog!" << std::endl;
}

// typeid checks exact runtime type
if (typeid(*animal) == typeid(Dog)) {
    std::cout << "Exact type is Dog" << std::endl;
}

delete animal;
```

```csharp
using System;

Animal animal = new Dog();

// 'is' keyword checks type
if (animal is Dog)
{
    Console.WriteLine("It's a Dog!");
}

// Exact type check
if (animal.GetType() == typeof(Dog))
{
    Console.WriteLine("Exact type is Dog");
}

// 'is' also works with parent types
Console.WriteLine(animal is Animal);  // True
Console.WriteLine(animal is Dog);     // True
```

```java
Animal animal = new Dog();

if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();  // Safe!
}

if (animal instanceof Cat) {
    Cat cat = (Cat) animal;  // Won't execute — animal is a Dog
}

// Also works with parent types and interfaces
System.out.println(animal instanceof Animal);  // true
System.out.println(animal instanceof Dog);     // true
System.out.println(animal instanceof Cat);     // false
```

```python
animal = Dog()

# isinstance — checks class and all parent classes
print(isinstance(animal, Dog))     # True
print(isinstance(animal, Animal))  # True
print(isinstance(animal, Cat))     # False

# type — checks exact type only
print(type(animal) == Dog)     # True
print(type(animal) == Animal)  # False (exact type is Dog, not Animal)

# isinstance is preferred — works with inheritance
```

```javascript
const animal = new Dog();

// instanceof — checks class and prototype chain
console.log(animal instanceof Dog);    // true
console.log(animal instanceof Animal); // true
// console.log(animal instanceof Cat); // false

// constructor check — exact type only
console.log(animal.constructor === Dog);    // true
console.log(animal.constructor === Animal); // false
```

---

## Pattern Matching (Java 16+)

Java 16 introduced **pattern matching** for `instanceof`, combining the check and cast:

```cpp
// C++ doesn't have pattern matching, but dynamic_cast achieves similar results
if (auto* dog = dynamic_cast<Dog*>(animal)) {
    dog->bark();  // dog is already cast
}
```

```csharp
// C# pattern matching (C# 7+)
if (animal is Dog dog)
{
    dog.Bark();  // dog is already cast
}
```

```java
// Old way
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();
}

// New way (Java 16+)
if (animal instanceof Dog dog) {  // Check + cast in one line
    dog.bark();  // dog is already cast
}
```

```python
# Python 3.10+ structural pattern matching
match animal:
    case Dog() as dog:
        dog.bark()
    case Cat() as cat:
        cat.meow()
    case _:
        print("Unknown animal")
```

```javascript
// JavaScript doesn't have pattern matching for types.
// Use instanceof checks:
if (animal instanceof Dog) {
  animal.bark();  // No separate cast needed in JS
} else if (animal instanceof Cat) {
  animal.meow();
}
```

### Switch Pattern Matching (Java 21+)

```cpp
// C++ alternative: visitor pattern or dynamic_cast chains
#include <iostream>
#include <string>

std::string describe(Animal* obj) {
    if (auto* d = dynamic_cast<Dog*>(obj))
        return "Dog named " + d->name;
    if (auto* c = dynamic_cast<Cat*>(obj))
        return "Cat named " + c->name;
    return "Unknown animal";
}
```

```csharp
// C# switch expression with pattern matching (C# 8+)
string Describe(object obj) => obj switch
{
    int i => $"Integer: {i}",
    string s => $"String of length {s.Length}",
    Dog d => $"Dog named {d.Name}",
    null => "null",
    _ => $"Unknown: {obj.GetType().Name}"
};
```

```java
static String describe(Object obj) {
    return switch (obj) {
        case Integer i  -> "Integer: " + i;
        case String s   -> "String of length " + s.length();
        case Dog d      -> "Dog named " + d.name;
        case null       -> "null";
        default         -> "Unknown: " + obj.getClass().getName();
    };
}
```

```python
def describe(obj):
    match obj:
        case int(i):
            return f"Integer: {i}"
        case str(s):
            return f"String of length {len(s)}"
        case Dog() as d:
            return f"Dog named {d.name}"
        case None:
            return "None"
        case _:
            return f"Unknown: {type(obj).__name__}"
```

```javascript
// JavaScript: use if/else instanceof chain
function describe(obj) {
  if (obj === null) return "null";
  if (typeof obj === "number") return `Number: ${obj}`;
  if (typeof obj === "string") return `String of length ${obj.length}`;
  if (obj instanceof Dog) return `Dog named ${obj.name}`;
  return `Unknown: ${obj.constructor.name}`;
}
```

---

## Practical Example — Shape Processing

```cpp
#include <iostream>
#include <vector>
#include <cmath>

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    double radius;
    Circle(double r) : radius(r) {}
    double area() const override { return M_PI * radius * radius; }
};

class Rectangle : public Shape {
public:
    double width, height;
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
};

// With polymorphism — no instanceof needed!
void processShapes(const std::vector<Shape*>& shapes) {
    for (const auto* shape : shapes) {
        std::cout << "Area: " << shape->area() << std::endl;
    }
}
```

```csharp
using System;
using System.Collections.Generic;

abstract class Shape
{
    public abstract double Area();
}

class Circle : Shape
{
    public double Radius { get; }
    public Circle(double r) => Radius = r;
    public override double Area() => Math.PI * Radius * Radius;
}

class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }
    public Rectangle(double w, double h) { Width = w; Height = h; }
    public override double Area() => Width * Height;
}

// With polymorphism — no 'is' check needed!
void ProcessShapes(List<Shape> shapes)
{
    foreach (var shape in shapes)
        Console.WriteLine($"Area: {shape.Area()}");
}
```

```java
abstract class Shape {
    abstract double area();
}

class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    double width, height;
    Rectangle(double w, double h) { this.width = w; this.height = h; }
    double area() { return width * height; }
}

// With polymorphism — no instanceof needed!
void processShapes(Shape[] shapes) {
    for (Shape shape : shapes) {
        System.out.println("Area: " + shape.area());
    }
}
```

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return math.pi * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

# With polymorphism — no isinstance needed!
def process_shapes(shapes):
    for shape in shapes:
        print(f"Area: {shape.area()}")
```

```javascript
class Shape {
  area() { throw new Error("Must implement area()"); }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(width, height) { super(); this.width = width; this.height = height; }
  area() { return this.width * this.height; }
}

// With polymorphism — no instanceof needed!
function processShapes(shapes) {
  for (const shape of shapes) {
    console.log(`Area: ${shape.area()}`);
  }
}
```

---

## When instanceof Is a Code Smell

Excessive use of `instanceof` often means you should use **polymorphism** instead:

```cpp
// ❌ BAD — dynamic_cast chain
void processPayment(Payment* p) {
    if (auto* cc = dynamic_cast<CreditCard*>(p)) {
        processCreditCard(cc);
    } else if (auto* pp = dynamic_cast<PayPal*>(p)) {
        processPayPal(pp);
    }
}

// ✅ GOOD — polymorphism
void processPayment(Payment* p) {
    p->process();  // Each Payment subclass implements process()
}
```

```csharp
// ❌ BAD — 'is' chain
void ProcessPayment(Payment p)
{
    if (p is CreditCard cc) ProcessCreditCard(cc);
    else if (p is PayPal pp) ProcessPayPal(pp);
}

// ✅ GOOD — polymorphism
void ProcessPayment(Payment p)
{
    p.Process();  // Each Payment subclass implements Process()
}
```

```java
// ❌ BAD — instanceof chain
void processPayment(Payment p) {
    if (p instanceof CreditCard cc) {
        processCreditCard(cc);
    } else if (p instanceof PayPal pp) {
        processPayPal(pp);
    }
}

// ✅ GOOD — polymorphism
void processPayment(Payment p) {
    p.process();  // Each Payment subclass implements process()
}
```

```python
# ❌ BAD — isinstance chain
def process_payment(p):
    if isinstance(p, CreditCard):
        process_credit_card(p)
    elif isinstance(p, PayPal):
        process_paypal(p)

# ✅ GOOD — polymorphism
def process_payment(p):
    p.process()  # Each Payment subclass implements process()
```

```javascript
// ❌ BAD — instanceof chain
function processPayment(p) {
  if (p instanceof CreditCard) {
    processCreditCard(p);
  } else if (p instanceof PayPal) {
    processPayPal(p);
  }
}

// ✅ GOOD — polymorphism
function processPayment(p) {
  p.process();  // Each Payment subclass implements process()
}
```

### Valid Uses of instanceof

| Use Case | Example |
|----------|---------|
| `equals()` implementation | Check type before comparing |
| Deserialization | Check what type was received |
| Legacy code integration | Working with untyped APIs |
| Visitor pattern | Double dispatch |

---

## Key Takeaways

- **Upcasting** (child → parent) is automatic and safe
- **Downcasting** (parent → child) requires explicit casting and type checking
- Use `dynamic_cast` (C++), `instanceof` (Java), `isinstance()` (Python), or `instanceof` (JS) before downcasting
- Java 16+ **pattern matching** combines `instanceof` + cast in one step
- Python and JavaScript use duck typing — less need for explicit casting
- Excessive `instanceof` is a **code smell** — prefer polymorphism
- `isinstance()` checks the entire hierarchy; `type()` / `typeid` checks the exact class

Next: **Final, Sealed, and Immutability** — making classes and objects unchangeable.
