---
title: SOLID Principles Overview
---

# SOLID Principles Overview

**SOLID** is an acronym for five design principles that make OOP code more **maintainable**, **flexible**, and **scalable**. Every professional developer should know them.

---

## The Five Principles

| Letter | Principle | One-Line Summary |
|--------|-----------|-----------------|
| **S** | Single Responsibility | A class should have only one reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subtypes must be substitutable for their base types |
| **I** | Interface Segregation | Don't force classes to implement methods they don't use |
| **D** | Dependency Inversion | Depend on abstractions, not on concrete classes |

---

## Why SOLID?

Without SOLID, codebases tend to develop these problems:

| Problem | Symptom |
|---------|---------|
| **Rigidity** | Hard to change — one change requires many other changes |
| **Fragility** | Changes in one area break unrelated areas |
| **Immobility** | Can't reuse code because it's tangled with other things |
| **Viscosity** | Doing things the right way is harder than hacking |

SOLID principles prevent these issues.

---

## Quick Preview of Each Principle

### S — Single Responsibility

```cpp
// ❌ BAD — One class doing too many things
class Employee {
public:
    void calculatePay() { }     // payroll logic
    void saveToDatabase() { }   // persistence logic
    void generateReport() { }   // reporting logic
};

// ✅ GOOD — Each class has one responsibility
class PayrollCalculator {
public:
    void calculatePay(const Employee& e) { }
};

class EmployeeRepository {
public:
    void save(const Employee& e) { }
};

class ReportGenerator {
public:
    void generate(const Employee& e) { }
};
```

```csharp
// ❌ BAD — One class doing too many things
class Employee
{
    public void CalculatePay() { }     // payroll logic
    public void SaveToDatabase() { }   // persistence logic
    public void GenerateReport() { }   // reporting logic
}

// ✅ GOOD — Each class has one responsibility
class PayrollCalculator
{
    public void CalculatePay(Employee e) { }
}

class EmployeeRepository
{
    public void Save(Employee e) { }
}

class ReportGenerator
{
    public void Generate(Employee e) { }
}
```

```java
// ❌ BAD — One class doing too many things
class Employee {
    void calculatePay() { }     // payroll logic
    void saveToDatabase() { }   // persistence logic
    void generateReport() { }   // reporting logic
}

// ✅ GOOD — Each class has one responsibility
class PayrollCalculator {
    void calculatePay(Employee e) { }
}

class EmployeeRepository {
    void save(Employee e) { }
}

class ReportGenerator {
    void generate(Employee e) { }
}
```

```python
# ❌ BAD — One class doing too many things
class Employee:
    def calculate_pay(self): ...     # payroll logic
    def save_to_database(self): ...  # persistence logic
    def generate_report(self): ...   # reporting logic

# ✅ GOOD — Each class has one responsibility
class PayrollCalculator:
    def calculate_pay(self, employee): ...

class EmployeeRepository:
    def save(self, employee): ...

class ReportGenerator:
    def generate(self, employee): ...
```

```javascript
// ❌ BAD — One class doing too many things
class Employee {
  calculatePay() { }     // payroll logic
  saveToDatabase() { }   // persistence logic
  generateReport() { }   // reporting logic
}

// ✅ GOOD — Each class has one responsibility
class PayrollCalculator {
  calculatePay(employee) { }
}

class EmployeeRepository {
  save(employee) { }
}

class ReportGenerator {
  generate(employee) { }
}
```

### O — Open/Closed

```cpp
// ❌ BAD — Must modify this function for every new shape
double calculateArea(Shape* s) {
    if (dynamic_cast<Circle*>(s)) return /* ... */;
    if (dynamic_cast<Rectangle*>(s)) return /* ... */;
    // Must add new if-else for every new shape!
}

// ✅ GOOD — Add new shapes without modifying existing code
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
// Just create a new derived class — no existing code changes!
```

```csharp
// ❌ BAD — Must modify this method for every new shape
double CalculateArea(Shape s)
{
    if (s is Circle) return /* ... */;
    if (s is Rectangle) return /* ... */;
    // Must add new if-else for every new shape!
}

// ✅ GOOD — Add new shapes without modifying existing code
abstract class Shape
{
    public abstract double Area();
}
// Just create a new subclass — no existing code changes!
```

```java
// ❌ BAD — Must modify this method for every new shape
double calculateArea(Shape s) {
    if (s instanceof Circle) return /* ... */;
    if (s instanceof Rectangle) return /* ... */;
    // Must add new if-else for every new shape!
}

// ✅ GOOD — Add new shapes without modifying existing code
abstract class Shape {
    abstract double area();
}
// Just create a new class — no existing code changes!
```

```python
# ❌ BAD — Must modify this function for every new shape
def calculate_area(shape):
    if isinstance(shape, Circle): return ...
    if isinstance(shape, Rectangle): return ...
    # Must add new if-else for every new shape!

# ✅ GOOD — Add new shapes without modifying existing code
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...
# Just create a new subclass — no existing code changes!
```

```javascript
// ❌ BAD — Must modify this function for every new shape
function calculateArea(shape) {
  if (shape.type === "circle") return /* ... */;
  if (shape.type === "rectangle") return /* ... */;
  // Must add new if-else for every new shape!
}

// ✅ GOOD — Add new shapes without modifying existing code
class Shape {
  area() { throw new Error("Must implement area()"); }
}
// Just create a new subclass — no existing code changes!
```

### L — Liskov Substitution

```cpp
// ❌ BAD — Square breaks Rectangle's behavior
class Rectangle {
public:
    virtual void setWidth(int w) { width_ = w; }
    virtual void setHeight(int h) { height_ = h; }
protected:
    int width_ = 0, height_ = 0;
};

class Square : public Rectangle {
public:
    void setWidth(int w) override { width_ = w; height_ = w; }  // Breaks expectations!
};

// ✅ GOOD — Use a common interface instead
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
```

```csharp
// ❌ BAD — Square breaks Rectangle's behavior
class Rectangle
{
    public virtual void SetWidth(int w) { Width = w; }
    public virtual void SetHeight(int h) { Height = h; }
    public int Width { get; protected set; }
    public int Height { get; protected set; }
}

class Square : Rectangle
{
    public override void SetWidth(int w) { Width = w; Height = w; }  // Breaks expectations!
}

// ✅ GOOD — Use a common interface instead
abstract class Shape
{
    public abstract double Area();
}
```

```java
// ❌ BAD — Square breaks Rectangle's behavior
class Rectangle {
    void setWidth(int w) { width = w; }
    void setHeight(int h) { height = h; }
}

class Square extends Rectangle {
    void setWidth(int w) { width = w; height = w; }  // Breaks expectations!
}

// ✅ GOOD — Use a common interface instead
interface Shape {
    double area();
}
```

```python
# ❌ BAD — Square breaks Rectangle's behavior
class Rectangle:
    def set_width(self, w): self.width = w
    def set_height(self, h): self.height = h

class Square(Rectangle):
    def set_width(self, w):
        self.width = w
        self.height = w  # Breaks expectations!

# ✅ GOOD — Use a common interface instead
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...
```

```javascript
// ❌ BAD — Square breaks Rectangle's behavior
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; }  // Breaks expectations!
}

// ✅ GOOD — Use a common interface instead
class Shape {
  area() { throw new Error("Must implement area()"); }
}
```

### I — Interface Segregation

```cpp
// ❌ BAD — Forces all workers to implement eat()
class Worker {
public:
    virtual void work() = 0;
    virtual void eat() = 0;  // Robots don't eat!
    virtual ~Worker() = default;
};

// ✅ GOOD — Separate interfaces
class Workable {
public:
    virtual void work() = 0;
    virtual ~Workable() = default;
};

class Feedable {
public:
    virtual void eat() = 0;
    virtual ~Feedable() = default;
};
```

```csharp
// ❌ BAD — Forces all workers to implement Eat()
interface IWorker
{
    void Work();
    void Eat();  // Robots don't eat!
}

// ✅ GOOD — Separate interfaces
interface IWorkable { void Work(); }
interface IFeedable { void Eat(); }
```

```java
// ❌ BAD — Forces all workers to implement eat()
interface Worker {
    void work();
    void eat();   // Robots don't eat!
}

// ✅ GOOD — Separate interfaces
interface Workable { void work(); }
interface Feedable { void eat(); }
```

```python
from abc import ABC, abstractmethod

# ❌ BAD — Forces all workers to implement eat()
class Worker(ABC):
    @abstractmethod
    def work(self): ...
    @abstractmethod
    def eat(self): ...  # Robots don't eat!

# ✅ GOOD — Separate interfaces
class Workable(ABC):
    @abstractmethod
    def work(self): ...

class Feedable(ABC):
    @abstractmethod
    def eat(self): ...
```

```javascript
// ❌ BAD — Forces all workers to implement eat()
class Worker {
  work() { throw new Error("Not implemented"); }
  eat() { throw new Error("Not implemented"); }  // Robots don't eat!
}

// ✅ GOOD — Separate "interfaces" (use composition)
class Workable {
  work() { throw new Error("Not implemented"); }
}

class Feedable {
  eat() { throw new Error("Not implemented"); }
}
```

### D — Dependency Inversion

```cpp
// ❌ BAD — High-level depends on low-level
class OrderService {
    MySQLDatabase db;  // Hard-coded!
};

// ✅ GOOD — Both depend on abstraction
class Database {
public:
    virtual void save(const Order& order) = 0;
    virtual ~Database() = default;
};

class OrderService {
    Database& db_;
public:
    OrderService(Database& db) : db_(db) { }  // Injected!
};
```

```csharp
// ❌ BAD — High-level depends on low-level
class OrderService
{
    private MySQLDatabase db = new MySQLDatabase();  // Hard-coded!
}

// ✅ GOOD — Both depend on abstraction
interface IDatabase
{
    void Save(Order order);
}

class OrderService
{
    private readonly IDatabase db;
    public OrderService(IDatabase db) { this.db = db; }  // Injected!
}
```

```java
// ❌ BAD — High-level depends on low-level
class OrderService {
    private MySQLDatabase db = new MySQLDatabase();  // Hard-coded!
}

// ✅ GOOD — Both depend on abstraction
class OrderService {
    private Database db;
    OrderService(Database db) { this.db = db; }  // Injected!
}
```

```python
# ❌ BAD — High-level depends on low-level
class OrderService:
    def __init__(self):
        self.db = MySQLDatabase()  # Hard-coded!

# ✅ GOOD — Both depend on abstraction
class OrderService:
    def __init__(self, db):  # Injected!
        self.db = db
```

```javascript
// ❌ BAD — High-level depends on low-level
class OrderService {
  constructor() {
    this.db = new MySQLDatabase();  // Hard-coded!
  }
}

// ✅ GOOD — Both depend on abstraction
class OrderService {
  constructor(db) {
    this.db = db;  // Injected!
  }
}
```

---

## How SOLID Principles Relate

The five principles work together:

- **SRP** keeps classes focused → easier to extend (OCP)
- **OCP** relies on polymorphism → needs proper inheritance (LSP)
- **LSP** requires clean interfaces → don't force unnecessary methods (ISP)
- **ISP** creates small, focused interfaces → easy to inject (DIP)
- **DIP** completes the circle → loose coupling via abstractions

---

## Key Takeaways

- SOLID is a set of five **design principles** for clean OOP
- They prevent **rigid**, **fragile**, and **coupled** code
- Each principle builds on the others
- We'll cover each one in depth in the following lessons

Next: **Single Responsibility Principle** — one class, one job.
