---
title: Composition vs Inheritance
---

# Composition vs Inheritance

**Inheritance** creates an "is-a" relationship. **Composition** creates a "has-a" relationship. Knowing when to use each is one of the most important OOP design decisions.

---

## The Two Relationships

| Relationship | Keyword | Example |
|-------------|---------|---------|
| **is-a** (Inheritance) | `extends` | A Dog **is an** Animal |
| **has-a** (Composition) | field | A Car **has an** Engine |

```
Inheritance:          Composition:

   Animal                Car
     │                   │ │
     ▼                   ▼ ▼
    Dog             Engine  Wheels
```

---

## Composition Explained

**Composition** means a class contains objects of other classes as attributes. The outer object is composed of inner objects.

```cpp
#include <iostream>
#include <string>
using namespace std;

class Engine {
    int horsepower;
public:
    Engine(int hp) : horsepower(hp) {}

    void start() {
        cout << "Engine started (" << horsepower << " HP)" << endl;
    }

    void stop() {
        cout << "Engine stopped" << endl;
    }
};

class Car {
    string model;
    Engine engine;  // Car HAS-A Engine (composition)

public:
    Car(string model, int hp) : model(model), engine(hp) {}

    void start() {
        cout << model << " starting..." << endl;
        engine.start();  // Delegates to Engine
    }
};

int main() {
    Car car("Toyota Camry", 203);
    car.start();
    // Toyota Camry starting...
    // Engine started (203 HP)
}
```

```csharp
using System;

class Engine {
    private int horsepower;

    public Engine(int hp) {
        horsepower = hp;
    }

    public void Start() {
        Console.WriteLine($"Engine started ({horsepower} HP)");
    }

    public void Stop() {
        Console.WriteLine("Engine stopped");
    }
}

class Car {
    private string model;
    private Engine engine;  // Car HAS-A Engine (composition)

    public Car(string model, int hp) {
        this.model = model;
        this.engine = new Engine(hp);
    }

    public void Start() {
        Console.WriteLine($"{model} starting...");
        engine.Start();  // Delegates to Engine
    }
}

Car car = new Car("Toyota Camry", 203);
car.Start();
// Toyota Camry starting...
// Engine started (203 HP)
```

```java
class Engine {
    int horsepower;

    Engine(int hp) {
        this.horsepower = hp;
    }

    void start() {
        System.out.println("Engine started (" + horsepower + " HP)");
    }

    void stop() {
        System.out.println("Engine stopped");
    }
}

class Car {
    String model;
    Engine engine;   // Car HAS-A Engine (composition)

    Car(String model, int hp) {
        this.model = model;
        this.engine = new Engine(hp);  // Engine is part of Car
    }

    void start() {
        System.out.println(model + " starting...");
        engine.start();  // Delegates to Engine
    }
}

Car car = new Car("Toyota Camry", 203);
car.start();
// Toyota Camry starting...
// Engine started (203 HP)
```

```python
class Engine:
    def __init__(self, hp):
        self.horsepower = hp

    def start(self):
        print(f"Engine started ({self.horsepower} HP)")

    def stop(self):
        print("Engine stopped")

class Car:
    def __init__(self, model, hp):
        self.model = model
        self.engine = Engine(hp)  # Car HAS-A Engine (composition)

    def start(self):
        print(f"{self.model} starting...")
        self.engine.start()  # Delegates to Engine

car = Car("Toyota Camry", 203)
car.start()
# Toyota Camry starting...
# Engine started (203 HP)
```

```javascript
class Engine {
    constructor(hp) {
        this.horsepower = hp;
    }

    start() {
        console.log(`Engine started (${this.horsepower} HP)`);
    }

    stop() {
        console.log("Engine stopped");
    }
}

class Car {
    constructor(model, hp) {
        this.model = model;
        this.engine = new Engine(hp);  // Car HAS-A Engine (composition)
    }

    start() {
        console.log(`${this.model} starting...`);
        this.engine.start();  // Delegates to Engine
    }
}

const car = new Car("Toyota Camry", 203);
car.start();
// Toyota Camry starting...
// Engine started (203 HP)
```

The `Car` doesn't inherit from `Engine` — a car **is not** an engine. It **has** an engine.

---

## When to Use Each

### Use Inheritance When:

- There is a clear "is-a" relationship
- The child genuinely specializes the parent
- You want polymorphism through a common type

### Use Composition When:

- There is a "has-a" relationship
- You want to reuse behaviour without the baggage of inheritance
- You need more flexibility (can swap components at runtime)

### Common Mistake — Inheritance for Code Reuse

```cpp
// ❌ BAD — Stack is NOT a vector
class Stack : public vector<int> {
    // Inherits push_back(), erase(), []... all exposed!
};

// ✅ GOOD — Stack HAS-A vector (composition)
class Stack {
    vector<int> items;
public:
    void push(int item) { items.push_back(item); }
    int pop() {
        int top = items.back();
        items.pop_back();
        return top;
    }
    int peek() { return items.back(); }
};
```

```csharp
// ❌ BAD — Stack is NOT a List
class Stack : List<int> {
    // Inherits Add(), Remove(), []... all exposed!
}

// ✅ GOOD — Stack HAS-A list (composition)
class Stack {
    private List<int> items = new();

    public void Push(int item) {
        items.Add(item);
    }

    public int Pop() {
        int top = items[^1];
        items.RemoveAt(items.Count - 1);
        return top;
    }

    public int Peek() {
        return items[^1];
    }
}
```

```java
// ❌ BAD — Stack is NOT an ArrayList
class Stack extends ArrayList {
    // Inherits add(), remove(), get()... all methods exposed!
}

// ✅ GOOD — Stack HAS-A list (composition)
class Stack {
    private List<Object> items = new ArrayList<>();

    void push(Object item) {
        items.add(item);
    }

    Object pop() {
        return items.remove(items.size() - 1);
    }

    Object peek() {
        return items.get(items.size() - 1);
    }
}
```

```python
# ❌ BAD — Stack is NOT a list
class Stack(list):
    # Inherits append(), insert(), pop(), []... all exposed!
    pass

# ✅ GOOD — Stack HAS-A list (composition)
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def peek(self):
        return self._items[-1]
```

```javascript
// ❌ BAD — Stack is NOT an Array
class Stack extends Array {
    // Inherits push(), shift(), splice()... all exposed!
}

// ✅ GOOD — Stack HAS-A array (composition)
class Stack {
    #items = [];

    push(item) {
        this.#items.push(item);
    }

    pop() {
        return this.#items.pop();
    }

    peek() {
        return this.#items[this.#items.length - 1];
    }
}
```

---

## Delegation

With composition, the outer class **delegates** work to its components:

```cpp
#include <iostream>
#include <string>
using namespace std;

class Logger {
public:
    void log(const string& message) {
        cout << "[LOG] " << message << endl;
    }
};

class FileWriter {
public:
    void write(const string& path, const string& content) {
        cout << "Writing to " << path << endl;
    }
};

class ReportGenerator {
    Logger logger;        // Composition
    FileWriter writer;    // Composition

public:
    void generate(const string& reportName) {
        logger.log("Generating report: " + reportName);
        string content = "Report data here...";
        writer.write(reportName + ".pdf", content);
        logger.log("Report generated successfully");
    }
};
```

```csharp
using System;

class Logger {
    public void Log(string message) {
        Console.WriteLine($"[LOG] {message}");
    }
}

class FileWriter {
    public void Write(string path, string content) {
        Console.WriteLine($"Writing to {path}");
    }
}

class ReportGenerator {
    private Logger logger = new();      // Composition
    private FileWriter writer = new();  // Composition

    public void Generate(string reportName) {
        logger.Log($"Generating report: {reportName}");
        string content = "Report data here...";
        writer.Write($"{reportName}.pdf", content);
        logger.Log("Report generated successfully");
    }
}
```

```java
class Logger {
    void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

class FileWriter {
    void write(String path, String content) {
        System.out.println("Writing to " + path);
    }
}

class ReportGenerator {
    private Logger logger;        // Composition
    private FileWriter writer;    // Composition

    ReportGenerator() {
        this.logger = new Logger();
        this.writer = new FileWriter();
    }

    void generate(String reportName) {
        logger.log("Generating report: " + reportName);
        String content = "Report data here...";
        writer.write(reportName + ".pdf", content);
        logger.log("Report generated successfully");
    }
}
```

```python
class Logger:
    def log(self, message):
        print(f"[LOG] {message}")

class FileWriter:
    def write(self, path, content):
        print(f"Writing to {path}")

class ReportGenerator:
    def __init__(self):
        self.logger = Logger()        # Composition
        self.writer = FileWriter()    # Composition

    def generate(self, report_name):
        self.logger.log(f"Generating report: {report_name}")
        content = "Report data here..."
        self.writer.write(f"{report_name}.pdf", content)
        self.logger.log("Report generated successfully")
```

```javascript
class Logger {
    log(message) {
        console.log(`[LOG] ${message}`);
    }
}

class FileWriter {
    write(path, content) {
        console.log(`Writing to ${path}`);
    }
}

class ReportGenerator {
    constructor() {
        this.logger = new Logger();      // Composition
        this.writer = new FileWriter();  // Composition
    }

    generate(reportName) {
        this.logger.log(`Generating report: ${reportName}`);
        const content = "Report data here...";
        this.writer.write(`${reportName}.pdf`, content);
        this.logger.log("Report generated successfully");
    }
}
```

`ReportGenerator` doesn't know how logging or file writing works — it delegates to its components.

---

## Composition with Interfaces (Best Practice)

Combine composition with interfaces for maximum flexibility:

```cpp
#include <iostream>
#include <string>
using namespace std;

class NotificationSender {
public:
    virtual void send(const string& message, const string& recipient) = 0;
    virtual ~NotificationSender() = default;
};

class EmailSender : public NotificationSender {
public:
    void send(const string& message, const string& recipient) override {
        cout << "Email to " << recipient << ": " << message << endl;
    }
};

class SMSSender : public NotificationSender {
public:
    void send(const string& message, const string& recipient) override {
        cout << "SMS to " << recipient << ": " << message << endl;
    }
};

class OrderService {
    NotificationSender* notifier;  // Composition with interface

public:
    OrderService(NotificationSender* notifier) : notifier(notifier) {}

    void placeOrder(const string& item) {
        cout << "Order placed: " << item << endl;
        notifier->send("Your order for " + item + " is confirmed",
                       "customer@example.com");
    }
};

int main() {
    EmailSender email;
    OrderService service1(&email);
    service1.placeOrder("Laptop");

    SMSSender sms;
    OrderService service2(&sms);
    service2.placeOrder("Phone");
}
```

```csharp
using System;

interface INotificationSender {
    void Send(string message, string recipient);
}

class EmailSender : INotificationSender {
    public void Send(string message, string recipient) {
        Console.WriteLine($"Email to {recipient}: {message}");
    }
}

class SMSSender : INotificationSender {
    public void Send(string message, string recipient) {
        Console.WriteLine($"SMS to {recipient}: {message}");
    }
}

class OrderService {
    private INotificationSender notifier;  // Composition with interface

    public OrderService(INotificationSender notifier) {
        this.notifier = notifier;  // Injected — can swap at runtime!
    }

    public void PlaceOrder(string item) {
        Console.WriteLine($"Order placed: {item}");
        notifier.Send($"Your order for {item} is confirmed",
                      "customer@example.com");
    }
}

// Use email notifications:
OrderService service1 = new OrderService(new EmailSender());
service1.PlaceOrder("Laptop");

// Switch to SMS with ZERO changes to OrderService:
OrderService service2 = new OrderService(new SMSSender());
service2.PlaceOrder("Phone");
```

```java
interface NotificationSender {
    void send(String message, String recipient);
}

class EmailSender implements NotificationSender {
    @Override
    public void send(String message, String recipient) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

class SMSSender implements NotificationSender {
    @Override
    public void send(String message, String recipient) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

class OrderService {
    private NotificationSender notifier;  // Composition with interface

    OrderService(NotificationSender notifier) {
        this.notifier = notifier;  // Injected — can swap at runtime!
    }

    void placeOrder(String item) {
        System.out.println("Order placed: " + item);
        notifier.send("Your order for " + item + " is confirmed",
                       "customer@example.com");
    }
}

// Use email notifications:
OrderService service1 = new OrderService(new EmailSender());
service1.placeOrder("Laptop");

// Switch to SMS with ZERO changes to OrderService:
OrderService service2 = new OrderService(new SMSSender());
service2.placeOrder("Phone");
```

```python
from abc import ABC, abstractmethod

class NotificationSender(ABC):
    @abstractmethod
    def send(self, message, recipient):
        pass

class EmailSender(NotificationSender):
    def send(self, message, recipient):
        print(f"Email to {recipient}: {message}")

class SMSSender(NotificationSender):
    def send(self, message, recipient):
        print(f"SMS to {recipient}: {message}")

class OrderService:
    def __init__(self, notifier):
        self.notifier = notifier  # Composition with interface

    def place_order(self, item):
        print(f"Order placed: {item}")
        self.notifier.send(f"Your order for {item} is confirmed",
                           "customer@example.com")

# Use email notifications:
service1 = OrderService(EmailSender())
service1.place_order("Laptop")

# Switch to SMS with ZERO changes to OrderService:
service2 = OrderService(SMSSender())
service2.place_order("Phone")
```

```javascript
class EmailSender {
    send(message, recipient) {
        console.log(`Email to ${recipient}: ${message}`);
    }
}

class SMSSender {
    send(message, recipient) {
        console.log(`SMS to ${recipient}: ${message}`);
    }
}

class OrderService {
    constructor(notifier) {
        this.notifier = notifier;  // Composition with interface (duck typing)
    }

    placeOrder(item) {
        console.log(`Order placed: ${item}`);
        this.notifier.send(`Your order for ${item} is confirmed`,
                           "customer@example.com");
    }
}

// Use email notifications:
const service1 = new OrderService(new EmailSender());
service1.placeOrder("Laptop");

// Switch to SMS with ZERO changes to OrderService:
const service2 = new OrderService(new SMSSender());
service2.placeOrder("Phone");
```

---

## The "Favour Composition Over Inheritance" Principle

This famous design guideline means:

1. **Default to composition** — it's more flexible
2. **Use inheritance only** when there's a genuine "is-a" relationship
3. **Combine both** when appropriate

| Criterion | Inheritance | Composition |
|-----------|------------|-------------|
| Coupling | Tight (child depends on parent's implementation) | Loose (components are independent) |
| Flexibility | Fixed at compile time | Can swap at runtime |
| Reusability | Limited (single inheritance in Java) | High (combine any components) |
| Fragility | Changing parent can break children | Components are independent |

---

## Multiple Inheritance (C++)

C++ uniquely supports **full multiple inheritance** — a class can inherit from more than one base class. Other languages (Java, C#) restrict this to interfaces only.

### The Diamond Problem

When two base classes inherit from a common ancestor, the derived class gets **two copies** of the ancestor's members:

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    int age = 0;
    void breathe() { cout << "Breathing" << endl; }
};

// Without virtual — diamond problem
class Mammal : public Animal { };
class Bird : public Animal { };

// Platypus gets TWO copies of Animal!
class Platypus : public Mammal, public Bird { };

// Fix: use virtual inheritance
class Mammal2 : virtual public Animal { };
class Bird2 : virtual public Animal { };

// Now only ONE copy of Animal
class Platypus2 : public Mammal2, public Bird2 { };

int main() {
    Platypus2 p;
    p.age = 5;       // OK — only one Animal base
    p.breathe();     // OK — unambiguous
}
```

The `virtual` keyword on inheritance ensures only a single shared instance of the base class exists in the hierarchy.

---

## Key Takeaways

- **Inheritance** = "is-a" (Dog is an Animal)
- **Composition** = "has-a" (Car has an Engine)
- **Favour composition over inheritance** — it's more flexible and less fragile
- Use composition with interfaces for **swappable components**
- Delegation lets an object rely on its components for specific tasks
- Only use inheritance for genuine type hierarchies

Next: **Association, Aggregation, and Composition** — the different flavours of "has-a" relationships.
