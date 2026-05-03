---
title: OOP Interview Questions
---

# OOP Interview Questions

OOP concepts are core topics in software engineering interviews. This lesson covers the most commonly asked questions with clear, concise answers.

---

## Fundamental Questions

### Q1: What are the four pillars of OOP?

| Pillar | Definition |
|--------|-----------|
| **Encapsulation** | Bundling data and methods, hiding internal details |
| **Inheritance** | Creating new classes from existing ones |
| **Polymorphism** | One interface, many implementations |
| **Abstraction** | Showing essential features, hiding complexity |

### Q2: What is the difference between a class and an object?

- A **class** is a blueprint (template) that defines attributes and methods
- An **object** is a concrete instance created from a class with actual values

```cpp
class Dog { };            // Class (blueprint)
Dog rex;                  // Object (instance)
Dog* ptr = new Dog();     // Object on heap
```

```csharp
class Dog { }           // Class (blueprint)
Dog rex = new Dog();    // Object (instance)
```

```java
class Dog { }          // Class (blueprint)
Dog rex = new Dog();   // Object (instance)
```

```python
class Dog:
    pass

rex = Dog()  # Object (instance)
```

```javascript
class Dog {}          // Class (blueprint)
const rex = new Dog(); // Object (instance)
```

### Q3: What is the difference between method overloading and overriding?

| Feature | Overloading | Overriding |
|---------|------------|------------|
| Where | Same class | Subclass |
| Parameters | Different | Same |
| Resolved at | Compile time | Runtime |
| Purpose | Multiple versions | Change inherited behaviour |

### Q4: What is the difference between an abstract class and an interface?

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| Instantiable | No | No |
| Constructor | Yes | No |
| Fields | Any type | Constants only (Java) |
| Methods | Abstract + concrete | Abstract (+ default in Java 8+) |
| Inheritance | Single | Multiple |
| Use for | "is-a" hierarchy | "can-do" capability |

---

## Intermediate Questions

### Q5: What is encapsulation? Give an example.

Encapsulation hides internal state and requires all access through methods:

```cpp
class BankAccount {
    double balance = 0;  // Hidden (private by default in class)
public:
    void deposit(double amount) {
        if (amount > 0) balance += amount;  // Controlled access
    }
    double getBalance() const { return balance; }  // Read-only
};
```

```csharp
public class BankAccount
{
    private double _balance;  // Hidden

    public void Deposit(double amount)
    {
        if (amount > 0) _balance += amount;  // Controlled access
    }

    public double Balance => _balance;  // Read-only property
}
```

```java
class BankAccount {
    private double balance;  // Hidden

    public void deposit(double amount) {
        if (amount > 0) balance += amount;  // Controlled access
    }

    public double getBalance() {
        return balance;  // Read-only access
    }
}
```

```python
class BankAccount:
    def __init__(self):
        self.__balance = 0  # Hidden (name-mangled)

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount  # Controlled access

    def get_balance(self):
        return self.__balance  # Read-only access
```

```javascript
class BankAccount {
  #balance = 0;  // Private field

  deposit(amount) {
    if (amount > 0) this.#balance += amount;  // Controlled access
  }

  getBalance() {
    return this.#balance;  // Read-only access
  }
}
```

### Q6: Explain the difference between composition and inheritance.

- **Inheritance** (is-a): `Dog extends Animal` — Dog is an Animal
- **Composition** (has-a): `Car has Engine` — Car contains an Engine

```cpp
// Inheritance
class Dog : public Animal { };

// Composition
class Car {
    Engine engine;  // Has-a relationship
};
```

```csharp
// Inheritance
class Dog : Animal { }

// Composition
class Car
{
    private Engine _engine;  // Has-a relationship
}
```

```java
// Inheritance
class Dog extends Animal { }

// Composition
class Car {
    private Engine engine;  // Has-a relationship
}
```

```python
# Inheritance
class Dog(Animal):
    pass

# Composition
class Car:
    def __init__(self):
        self.engine = Engine()  # Has-a relationship
```

```javascript
// Inheritance
class Dog extends Animal {}

// Composition
class Car {
  constructor() {
    this.engine = new Engine();  // Has-a relationship
  }
}
```

**Favour composition** when there's no clear "is-a" relationship.

### Q7: What is the diamond problem?

When a class inherits from two classes that share a common parent, it's ambiguous which version of a shared method to use.

```
    A
   / \
  B   C
   \ /
    D   ← Which version of A's method does D get?
```

- **C++** resolves it with virtual inheritance
- **Java** avoids it by prohibiting multiple class inheritance
- **Python** resolves it with MRO (Method Resolution Order)
- **JavaScript** doesn't support multiple inheritance

### Q8: What are SOLID principles?

| Principle | Rule |
|-----------|------|
| **S** — Single Responsibility | One class, one job |
| **O** — Open/Closed | Open for extension, closed for modification |
| **L** — Liskov Substitution | Subtypes must be substitutable for base types |
| **I** — Interface Segregation | Don't force unnecessary method implementations |
| **D** — Dependency Inversion | Depend on abstractions, not concretions |

---

## Advanced Questions

### Q9: Explain the Singleton pattern.

Singleton ensures a class has exactly one instance:

```cpp
class Singleton {
    static Singleton* instance;
    Singleton() {}  // Private constructor
public:
    static Singleton* getInstance() {
        if (!instance) instance = new Singleton();
        return instance;
    }
};
Singleton* Singleton::instance = nullptr;
```

```csharp
public class Singleton
{
    private static Singleton? _instance;
    private static readonly object _lock = new();

    private Singleton() { }

    public static Singleton Instance
    {
        get
        {
            lock (_lock)
            {
                _instance ??= new Singleton();
            }
            return _instance;
        }
    }
}
```

```java
class Singleton {
    private static Singleton instance;

    private Singleton() { }

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

```javascript
class Singleton {
  static #instance = null;

  constructor() {
    if (Singleton.#instance) return Singleton.#instance;
    Singleton.#instance = this;
  }

  static getInstance() {
    if (!Singleton.#instance) new Singleton();
    return Singleton.#instance;
  }
}
```

**When to use**: Configuration, logger, connection pool.
**Drawbacks**: Hard to test, global state, hidden dependencies.

### Q10: What is the Strategy pattern?

Defines a family of algorithms and makes them interchangeable:

```cpp
class SortStrategy {
public:
    virtual void sort(std::vector<int>& arr) = 0;
    virtual ~SortStrategy() = default;
};

class BubbleSort : public SortStrategy {
public:
    void sort(std::vector<int>& arr) override { /* ... */ }
};

class QuickSort : public SortStrategy {
public:
    void sort(std::vector<int>& arr) override { /* ... */ }
};

class Sorter {
    SortStrategy* strategy;
public:
    Sorter(SortStrategy* s) : strategy(s) {}
    void sort(std::vector<int>& data) { strategy->sort(data); }
};
```

```csharp
public interface ISortStrategy
{
    void Sort(int[] array);
}

public class BubbleSort : ISortStrategy
{
    public void Sort(int[] array) { /* ... */ }
}

public class QuickSort : ISortStrategy
{
    public void Sort(int[] array) { /* ... */ }
}

public class Sorter
{
    private readonly ISortStrategy _strategy;
    public Sorter(ISortStrategy strategy) => _strategy = strategy;
    public void Sort(int[] data) => _strategy.Sort(data);
}
```

```java
interface SortStrategy {
    void sort(int[] array);
}

class BubbleSort implements SortStrategy {
    public void sort(int[] array) { /* ... */ }
}

class QuickSort implements SortStrategy {
    public void sort(int[] array) { /* ... */ }
}

class Sorter {
    private SortStrategy strategy;
    Sorter(SortStrategy s) { this.strategy = s; }
    void sort(int[] data) { strategy.sort(data); }
}
```

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, array):
        pass

class BubbleSort(SortStrategy):
    def sort(self, array):
        pass  # ... bubble sort logic

class QuickSort(SortStrategy):
    def sort(self, array):
        pass  # ... quick sort logic

class Sorter:
    def __init__(self, strategy):
        self.strategy = strategy

    def sort(self, data):
        self.strategy.sort(data)
```

```javascript
class SortStrategy {
  sort(array) { throw new Error("Not implemented"); }
}

class BubbleSort extends SortStrategy {
  sort(array) { /* ... bubble sort logic */ }
}

class QuickSort extends SortStrategy {
  sort(array) { /* ... quick sort logic */ }
}

class Sorter {
  constructor(strategy) { this.strategy = strategy; }
  sort(data) { this.strategy.sort(data); }
}
```

### Q11: What is the Observer pattern?

A one-to-many relationship where changes in one object notify all dependents:

```cpp
#include <vector>
#include <functional>

class EventEmitter {
    std::vector<std::function<void(const std::string&)>> observers;
public:
    void subscribe(std::function<void(const std::string&)> observer) {
        observers.push_back(observer);
    }
    void emit(const std::string& event) {
        for (auto& obs : observers) obs(event);
    }
};
```

```csharp
using System;
using System.Collections.Generic;

public interface IObserver
{
    void Update(string eventData);
}

public class EventEmitter
{
    private readonly List<IObserver> _observers = new();

    public void Subscribe(IObserver observer) => _observers.Add(observer);
    public void Emit(string eventData)
    {
        foreach (var obs in _observers)
            obs.Update(eventData);
    }
}
```

```java
interface Observer {
    void update(String event);
}

class EventEmitter {
    List<Observer> observers = new ArrayList<>();

    void subscribe(Observer o) { observers.add(o); }
    void emit(String event) {
        observers.forEach(o -> o.update(event));
    }
}
```

```python
class EventEmitter:
    def __init__(self):
        self.observers = []

    def subscribe(self, observer):
        self.observers.append(observer)

    def emit(self, event):
        for observer in self.observers:
            observer.update(event)
```

```javascript
class EventEmitter {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  emit(event) {
    this.observers.forEach(o => o.update(event));
  }
}
```

### Q12: What is dependency injection?

Passing dependencies from outside instead of creating them inside:

```cpp
// Without DI (bad)
class Service {
    MySQLDatabase db;  // Hard-coded dependency
};

// With DI (good)
class Service {
    IDatabase& db;
public:
    Service(IDatabase& db) : db(db) {}  // Injected
};
```

```csharp
// Without DI (bad)
class Service
{
    private Database _db = new MySQLDatabase();  // Hard-coded
}

// With DI (good)
class Service
{
    private readonly IDatabase _db;
    public Service(IDatabase db) => _db = db;  // Injected
}
```

```java
// Without DI (bad)
class Service {
    Database db = new MySQLDatabase();  // Hard-coded
}

// With DI (good)
class Service {
    Database db;
    Service(Database db) { this.db = db; }  // Injected
}
```

```python
# Without DI (bad)
class Service:
    def __init__(self):
        self.db = MySQLDatabase()  # Hard-coded

# With DI (good)
class Service:
    def __init__(self, db):
        self.db = db  # Injected
```

```javascript
// Without DI (bad)
class Service {
  constructor() {
    this.db = new MySQLDatabase();  // Hard-coded
  }
}

// With DI (good)
class Service {
  constructor(db) {
    this.db = db;  // Injected
  }
}
```

---

## Coding Questions

### Q13: Design a parking lot system.

Key classes:
- `ParkingLot` — manages spots, entry/exit
- `ParkingSpot` — individual spot (Small, Medium, Large)
- `Vehicle` (abstract) — `Car`, `Motorcycle`, `Truck`
- `Ticket` — issued on entry, paid on exit

### Q14: Design an elevator system.

Key classes:
- `Building` — contains elevators and floors
- `Elevator` — moves between floors, has state (IDLE, MOVING_UP, MOVING_DOWN)
- `Floor` — has up/down buttons
- `Request` — floor + direction
- `Scheduler` — decides which elevator handles which request

### Q15: Design a chess game.

Key classes:
- `Board` — 8x8 grid of squares
- `Piece` (abstract) — `King`, `Queen`, `Rook`, `Bishop`, `Knight`, `Pawn`
- `Player` — has a colour and pieces
- `Move` — from square to square
- `Game` — manages turns, win conditions, move validation

---

## Tips for OOP Interviews

1. **Start with requirements** — clarify before designing
2. **Identify the core objects** — nouns in the problem become classes
3. **Define relationships** — is-a, has-a, uses
4. **Apply SOLID** — especially SRP and OCP
5. **Use design patterns** where appropriate — don't force them
6. **Draw UML** if asked — show class diagrams
7. **Write clean code** — use proper access modifiers, meaningful names

---

## Key Takeaways

- Know the **four pillars** and be able to explain with examples
- Understand the **difference** between overloading/overriding, abstract class/interface
- Be comfortable with **SOLID principles** and **design patterns**
- Practice **system design** questions (parking lot, elevator, chess)
- **Communication** matters — explain your design decisions clearly

Next: **OOP Capstone** — course summary and next steps.
