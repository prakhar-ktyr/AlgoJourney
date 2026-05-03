---
title: Abstraction
---

# Abstraction

**Abstraction** is the fourth pillar of OOP. It means showing only the **essential features** of an object while hiding the complex implementation details.

---

## What is Abstraction?

Abstraction answers the question: **"What does this do?"** without requiring you to know **"How does it do it?"**

**Real-world examples:**

| Thing | What You See (Abstraction) | What's Hidden (Implementation) |
|-------|---------------------------|-------------------------------|
| Car | Steering wheel, pedals, dashboard | Engine, transmission, fuel injection |
| TV remote | Power, volume, channel buttons | IR signals, encoding, circuits |
| ATM | Insert card, enter PIN, get cash | Banking protocols, encryption, networking |
| Email | Compose, send, receive | SMTP, DNS lookup, packet routing |

You don't need to understand how an engine works to drive a car. Abstraction provides the same benefit in code.

---

## Abstraction vs Encapsulation

These two are related but different:

| Aspect | Abstraction | Encapsulation |
|--------|------------|---------------|
| Focus | **What** an object does | **How** it protects its data |
| Level | Design level (architecture) | Implementation level (code) |
| Mechanism | Abstract classes, interfaces | Access modifiers, getters/setters |
| Analogy | The car's dashboard design | The engine cover hiding internals |

Encapsulation is a **tool** used to achieve abstraction.

---

## Abstract Classes

An **abstract class** is a class that cannot be instantiated directly. It serves as a blueprint for subclasses.

```cpp
#include <iostream>
#include <string>
using namespace std;

class Shape {
protected:
    string colour;

public:
    Shape(string colour) : colour(colour) {}

    // Pure virtual methods — MUST be implemented by subclasses
    virtual double area() = 0;
    virtual double perimeter() = 0;

    // Concrete method — has a body, inherited as-is
    void describe() {
        cout << "A " << colour << " shape" << endl;
        cout << "Area: " << area() << endl;
        cout << "Perimeter: " << perimeter() << endl;
    }
};
```

```csharp
using System;

abstract class Shape {
    protected string Colour;

    public Shape(string colour) {
        Colour = colour;
    }

    // Abstract methods — MUST be implemented by subclasses
    public abstract double Area();
    public abstract double Perimeter();

    // Concrete method — has a body, inherited as-is
    public void Describe() {
        Console.WriteLine($"A {Colour} shape");
        Console.WriteLine($"Area: {Area()}");
        Console.WriteLine($"Perimeter: {Perimeter()}");
    }
}
```

```java
abstract class Shape {
    String colour;

    Shape(String colour) {
        this.colour = colour;
    }

    // Abstract method — NO body, must be implemented by subclasses
    abstract double area();
    abstract double perimeter();

    // Concrete method — has a body, inherited as-is
    void describe() {
        System.out.println("A " + colour + " shape");
        System.out.println("Area: " + area());
        System.out.println("Perimeter: " + perimeter());
    }
}
```

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, colour):
        self.colour = colour

    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

    def describe(self):  # Concrete method
        print(f"A {self.colour} shape")
        print(f"Area: {self.area()}")
        print(f"Perimeter: {self.perimeter()}")
```

```javascript
class Shape {
    constructor(colour) {
        if (new.target === Shape) {
            throw new Error("Cannot instantiate abstract class Shape");
        }
        this.colour = colour;
    }

    // "Abstract" methods — throw error if not overridden
    area() {
        throw new Error("area() must be implemented");
    }

    perimeter() {
        throw new Error("perimeter() must be implemented");
    }

    // Concrete method — inherited as-is
    describe() {
        console.log(`A ${this.colour} shape`);
        console.log(`Area: ${this.area()}`);
        console.log(`Perimeter: ${this.perimeter()}`);
    }
}
```

Key rules:
- Cannot be instantiated directly
- Can have **abstract methods** (no body) and **concrete methods** (with body)
- Subclasses **must** implement all abstract methods (or be abstract themselves)

### Implementing an Abstract Class

```cpp
#include <iostream>
#include <string>
#include <cmath>
using namespace std;

class Circle : public Shape {
    double radius;
public:
    Circle(string colour, double radius)
        : Shape(colour), radius(radius) {}

    double area() override {
        return M_PI * radius * radius;
    }

    double perimeter() override {
        return 2 * M_PI * radius;
    }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(string colour, double width, double height)
        : Shape(colour), width(width), height(height) {}

    double area() override {
        return width * height;
    }

    double perimeter() override {
        return 2 * (width + height);
    }
};

int main() {
    Circle c("Red", 5);
    c.describe();
    // A Red shape
    // Area: 78.5398
    // Perimeter: 31.4159

    Rectangle r("Blue", 4, 6);
    r.describe();
    // A Blue shape
    // Area: 24
    // Perimeter: 20
}
```

```csharp
using System;

class Circle : Shape {
    private double radius;

    public Circle(string colour, double radius) : base(colour) {
        this.radius = radius;
    }

    public override double Area() {
        return Math.PI * radius * radius;
    }

    public override double Perimeter() {
        return 2 * Math.PI * radius;
    }
}

class Rectangle : Shape {
    private double width, height;

    public Rectangle(string colour, double width, double height) : base(colour) {
        this.width = width;
        this.height = height;
    }

    public override double Area() {
        return width * height;
    }

    public override double Perimeter() {
        return 2 * (width + height);
    }
}

Circle c = new Circle("Red", 5);
c.Describe();
// A Red shape
// Area: 78.5398163397448
// Perimeter: 31.4159265358979

Rectangle r = new Rectangle("Blue", 4, 6);
r.Describe();
// A Blue shape
// Area: 24
// Perimeter: 20
```

```java
class Circle extends Shape {
    double radius;

    Circle(String colour, double radius) {
        super(colour);
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }

    @Override
    double perimeter() {
        return 2 * Math.PI * radius;
    }
}

class Rectangle extends Shape {
    double width, height;

    Rectangle(String colour, double width, double height) {
        super(colour);
        this.width = width;
        this.height = height;
    }

    @Override
    double area() {
        return width * height;
    }

    @Override
    double perimeter() {
        return 2 * (width + height);
    }
}

// Usage
Shape c = new Circle("Red", 5);
c.describe();
// A Red shape
// Area: 78.53981633974483
// Perimeter: 31.41592653589793

Shape r = new Rectangle("Blue", 4, 6);
r.describe();
// A Blue shape
// Area: 24.0
// Perimeter: 20.0
```

```python
import math

class Circle(Shape):
    def __init__(self, colour, radius):
        super().__init__(colour)
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, colour, width, height):
        super().__init__(colour)
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

c = Circle("Red", 5)
c.describe()

r = Rectangle("Blue", 4, 6)
r.describe()

# s = Shape("Green")  # ❌ TypeError: Can't instantiate abstract class
```

```javascript
class Circle extends Shape {
    constructor(colour, radius) {
        super(colour);
        this.radius = radius;
    }

    area() {
        return Math.PI * this.radius ** 2;
    }

    perimeter() {
        return 2 * Math.PI * this.radius;
    }
}

class Rectangle extends Shape {
    constructor(colour, width, height) {
        super(colour);
        this.width = width;
        this.height = height;
    }

    area() {
        return this.width * this.height;
    }

    perimeter() {
        return 2 * (this.width + this.height);
    }
}

const c = new Circle("Red", 5);
c.describe();
// A Red shape
// Area: 78.53981633974483
// Perimeter: 31.41592653589793

const r = new Rectangle("Blue", 4, 6);
r.describe();
// A Blue shape
// Area: 24
// Perimeter: 20
```

---

## Abstract Methods

An abstract method is a method declared without an implementation. It forces subclasses to provide their own version.

```cpp
class Animal {
public:
    virtual void speak() = 0;   // Pure virtual — subclasses MUST implement
    virtual void move() = 0;    // Pure virtual — subclasses MUST implement

    void breathe() {            // Concrete — inherited as-is
        cout << "Breathing..." << endl;
    }
};

class Dog : public Animal {
public:
    void speak() override { cout << "Woof!" << endl; }
    void move() override { cout << "Running on four legs" << endl; }
};

class Fish : public Animal {
public:
    void speak() override { cout << "..." << endl; }
    void move() override { cout << "Swimming with fins" << endl; }
};
```

```csharp
abstract class Animal {
    public abstract void Speak();   // Subclasses MUST implement
    public abstract void Move();    // Subclasses MUST implement

    public void Breathe() {         // Concrete — inherited as-is
        Console.WriteLine("Breathing...");
    }
}

class Dog : Animal {
    public override void Speak() { Console.WriteLine("Woof!"); }
    public override void Move() { Console.WriteLine("Running on four legs"); }
}

class Fish : Animal {
    public override void Speak() { Console.WriteLine("..."); }
    public override void Move() { Console.WriteLine("Swimming with fins"); }
}
```

```java
abstract class Animal {
    abstract void speak();     // Subclasses MUST implement this
    abstract void move();      // Subclasses MUST implement this

    void breathe() {           // Concrete — inherited as-is
        System.out.println("Breathing...");
    }
}

class Dog extends Animal {
    @Override
    void speak() { System.out.println("Woof!"); }

    @Override
    void move() { System.out.println("Running on four legs"); }
}

class Fish extends Animal {
    @Override
    void speak() { System.out.println("..."); }

    @Override
    void move() { System.out.println("Swimming with fins"); }
}
```

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

    @abstractmethod
    def move(self):
        pass

    def breathe(self):  # Concrete — inherited as-is
        print("Breathing...")

class Dog(Animal):
    def speak(self):
        print("Woof!")

    def move(self):
        print("Running on four legs")

class Fish(Animal):
    def speak(self):
        print("...")

    def move(self):
        print("Swimming with fins")
```

```javascript
class Animal {
    constructor() {
        if (new.target === Animal) {
            throw new Error("Cannot instantiate abstract class Animal");
        }
    }

    speak() {
        throw new Error("speak() must be implemented");
    }

    move() {
        throw new Error("move() must be implemented");
    }

    breathe() {  // Concrete — inherited as-is
        console.log("Breathing...");
    }
}

class Dog extends Animal {
    speak() { console.log("Woof!"); }
    move() { console.log("Running on four legs"); }
}

class Fish extends Animal {
    speak() { console.log("..."); }
    move() { console.log("Swimming with fins"); }
}
```

---

## When to Use Abstract Classes

| Use Abstract Class When... | Example |
|----------------------------|---------|
| Subclasses share common code | `Shape` provides `describe()`, subclasses provide `area()` |
| You want to provide a partial implementation | Template with some methods done, some left for subclasses |
| You need constructors or state | Abstract classes can have attributes and constructors |
| There's a clear "is-a" relationship | `Dog` is an `Animal`, `Circle` is a `Shape` |

---

## Abstract Class vs Regular Class

| Feature | Regular Class | Abstract Class |
|---------|--------------|----------------|
| Instantiable? | ✅ Yes | ❌ No |
| Abstract methods? | ❌ No | ✅ Yes (can also have concrete) |
| Can be extended? | ✅ Yes | ✅ Yes (must be extended to be useful) |
| Purpose | Used directly | Blueprint for subclasses |

---

## Practical Example — Database Connection

```cpp
#include <iostream>
#include <string>
using namespace std;

class Database {
protected:
    string connectionString;

public:
    Database(string conn) : connectionString(conn) {}

    // Template: connect → execute → disconnect
    void runQuery(string query) {
        connect();
        execute(query);
        disconnect();
    }

    virtual void connect() = 0;
    virtual void execute(string query) = 0;
    virtual void disconnect() = 0;
};

class MySQLDatabase : public Database {
public:
    MySQLDatabase(string conn) : Database(conn) {}

    void connect() override {
        cout << "Connecting to MySQL: " << connectionString << endl;
    }

    void execute(string query) override {
        cout << "MySQL executing: " << query << endl;
    }

    void disconnect() override {
        cout << "MySQL disconnected" << endl;
    }
};

int main() {
    MySQLDatabase db("mysql://localhost:3306/mydb");
    db.runQuery("SELECT * FROM users");
    // Connecting to MySQL: mysql://localhost:3306/mydb
    // MySQL executing: SELECT * FROM users
    // MySQL disconnected
}
```

```csharp
using System;

abstract class Database {
    protected string ConnectionString;

    public Database(string conn) {
        ConnectionString = conn;
    }

    // Template: connect → execute → disconnect
    public void RunQuery(string query) {
        Connect();
        Execute(query);
        Disconnect();
    }

    public abstract void Connect();
    public abstract void Execute(string query);
    public abstract void Disconnect();
}

class MySQLDatabase : Database {
    public MySQLDatabase(string conn) : base(conn) {}

    public override void Connect() {
        Console.WriteLine($"Connecting to MySQL: {ConnectionString}");
    }

    public override void Execute(string query) {
        Console.WriteLine($"MySQL executing: {query}");
    }

    public override void Disconnect() {
        Console.WriteLine("MySQL disconnected");
    }
}

Database db = new MySQLDatabase("mysql://localhost:3306/mydb");
db.RunQuery("SELECT * FROM users");
// Connecting to MySQL: mysql://localhost:3306/mydb
// MySQL executing: SELECT * FROM users
// MySQL disconnected
```

```java
abstract class Database {
    String connectionString;

    Database(String connectionString) {
        this.connectionString = connectionString;
    }

    // Template: connect → execute → disconnect
    void runQuery(String query) {
        connect();
        execute(query);
        disconnect();
    }

    abstract void connect();
    abstract void execute(String query);
    abstract void disconnect();
}

class MySQLDatabase extends Database {
    MySQLDatabase(String conn) { super(conn); }

    @Override
    void connect() {
        System.out.println("Connecting to MySQL: " + connectionString);
    }

    @Override
    void execute(String query) {
        System.out.println("MySQL executing: " + query);
    }

    @Override
    void disconnect() {
        System.out.println("MySQL disconnected");
    }
}

class MongoDatabase extends Database {
    MongoDatabase(String conn) { super(conn); }

    @Override
    void connect() {
        System.out.println("Connecting to MongoDB: " + connectionString);
    }

    @Override
    void execute(String query) {
        System.out.println("MongoDB executing: " + query);
    }

    @Override
    void disconnect() {
        System.out.println("MongoDB disconnected");
    }
}

// Usage — same interface for both databases
Database db = new MySQLDatabase("mysql://localhost:3306/mydb");
db.runQuery("SELECT * FROM users");
// Connecting to MySQL: mysql://localhost:3306/mydb
// MySQL executing: SELECT * FROM users
// MySQL disconnected
```

```python
from abc import ABC, abstractmethod

class Database(ABC):
    def __init__(self, connection_string):
        self.connection_string = connection_string

    # Template: connect → execute → disconnect
    def run_query(self, query):
        self.connect()
        self.execute(query)
        self.disconnect()

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def execute(self, query):
        pass

    @abstractmethod
    def disconnect(self):
        pass

class MySQLDatabase(Database):
    def connect(self):
        print(f"Connecting to MySQL: {self.connection_string}")

    def execute(self, query):
        print(f"MySQL executing: {query}")

    def disconnect(self):
        print("MySQL disconnected")

class MongoDatabase(Database):
    def connect(self):
        print(f"Connecting to MongoDB: {self.connection_string}")

    def execute(self, query):
        print(f"MongoDB executing: {query}")

    def disconnect(self):
        print("MongoDB disconnected")

db = MySQLDatabase("mysql://localhost:3306/mydb")
db.run_query("SELECT * FROM users")
```

```javascript
class Database {
    constructor(connectionString) {
        if (new.target === Database) {
            throw new Error("Cannot instantiate abstract class Database");
        }
        this.connectionString = connectionString;
    }

    // Template: connect → execute → disconnect
    runQuery(query) {
        this.connect();
        this.execute(query);
        this.disconnect();
    }

    connect() {
        throw new Error("connect() must be implemented");
    }

    execute(query) {
        throw new Error("execute() must be implemented");
    }

    disconnect() {
        throw new Error("disconnect() must be implemented");
    }
}

class MySQLDatabase extends Database {
    connect() {
        console.log(`Connecting to MySQL: ${this.connectionString}`);
    }

    execute(query) {
        console.log(`MySQL executing: ${query}`);
    }

    disconnect() {
        console.log("MySQL disconnected");
    }
}

class MongoDatabase extends Database {
    connect() {
        console.log(`Connecting to MongoDB: ${this.connectionString}`);
    }

    execute(query) {
        console.log(`MongoDB executing: ${query}`);
    }

    disconnect() {
        console.log("MongoDB disconnected");
    }
}

const db = new MySQLDatabase("mysql://localhost:3306/mydb");
db.runQuery("SELECT * FROM users");
```

---

## Key Takeaways

- **Abstraction** hides implementation details and shows only essential features
- **Abstract classes** can't be instantiated — they serve as blueprints
- **Abstract methods** have no body — subclasses must implement them
- Abstract classes can have both abstract and concrete methods
- Use abstraction to define **what** subclasses must do, not **how**
- C++ uses pure virtual functions (`= 0`), Java uses `abstract`, Python uses `ABC` + `@abstractmethod`, JavaScript uses convention (throw errors in base)
- Abstraction + Polymorphism = powerful, flexible code
