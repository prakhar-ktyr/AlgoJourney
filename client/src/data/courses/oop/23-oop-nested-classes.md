---
title: Nested and Inner Classes
---

# Nested and Inner Classes

A **nested class** is a class defined inside another class. It helps group logically related classes and improves encapsulation.

---

## Why Nested Classes?

- **Logical grouping**: If a class is only used by one other class, nest it inside
- **Encapsulation**: Inner classes can access the outer class's private members
- **Readability**: Keeps related code together

---

## Types of Nested Classes (Java)

| Type | Keyword | Access to Outer | Needs Outer Instance? |
|------|---------|----------------|-----------------------|
| **Static nested** | `static class` | Static members only | No |
| **Inner (non-static)** | `class` | All members | Yes |
| **Local** | Defined in a method | Method's variables | Yes |
| **Anonymous** | Inline, no name | Depends on context | Depends |

---

## Static Nested Class

A class marked `static` inside another class. It doesn't need an instance of the outer class.

```cpp
#include <iostream>
#include <string>

class Computer {
public:
    // Nested class (C++ nested classes are always like Java's static nested)
    class CPU {
    public:
        int cores;
        double speedGHz;

        CPU(int cores, double speedGHz)
            : cores(cores), speedGHz(speedGHz) {}

        void describe() const {
            std::cout << cores << " cores @ " << speedGHz << " GHz" << std::endl;
        }
    };

private:
    std::string model;
    CPU cpu;

public:
    Computer(std::string model, int cores, double speed)
        : model(model), cpu(cores, speed) {}

    void describe() const {
        std::cout << "Computer: " << model << std::endl;
        cpu.describe();
    }
};

// Can create CPU independently
Computer::CPU cpu(8, 3.6);
cpu.describe();  // 8 cores @ 3.6 GHz

// Or as part of a Computer
Computer pc("Workstation", 16, 4.0);
pc.describe();
```

```csharp
using System;

class Computer
{
    // Nested class (C# nested classes are like Java's static nested by default)
    public class CPU
    {
        public int Cores { get; }
        public double SpeedGHz { get; }

        public CPU(int cores, double speedGHz)
        {
            Cores = cores;
            SpeedGHz = speedGHz;
        }

        public void Describe()
        {
            Console.WriteLine($"{Cores} cores @ {SpeedGHz} GHz");
        }
    }

    private string model;
    private CPU cpu;

    public Computer(string model, int cores, double speed)
    {
        this.model = model;
        this.cpu = new CPU(cores, speed);
    }

    public void Describe()
    {
        Console.WriteLine($"Computer: {model}");
        cpu.Describe();
    }
}

// Can create CPU independently
var cpu = new Computer.CPU(8, 3.6);
cpu.Describe();  // 8 cores @ 3.6 GHz

// Or as part of a Computer
var pc = new Computer("Workstation", 16, 4.0);
pc.Describe();
```

```java
class Computer {
    private String model;
    private CPU cpu;

    Computer(String model, int cores, double speed) {
        this.model = model;
        this.cpu = new CPU(cores, speed);
    }

    // Static nested class
    static class CPU {
        int cores;
        double speedGHz;

        CPU(int cores, double speedGHz) {
            this.cores = cores;
            this.speedGHz = speedGHz;
        }

        void describe() {
            System.out.println(cores + " cores @ " + speedGHz + " GHz");
        }
    }

    void describe() {
        System.out.println("Computer: " + model);
        cpu.describe();
    }
}

// Can create CPU independently
Computer.CPU cpu = new Computer.CPU(8, 3.6);
cpu.describe();  // 8 cores @ 3.6 GHz

// Or as part of a Computer
Computer pc = new Computer("Workstation", 16, 4.0);
pc.describe();
```

```python
class Computer:
    class CPU:
        def __init__(self, cores, speed_ghz):
            self.cores = cores
            self.speed_ghz = speed_ghz

        def describe(self):
            print(f"{self.cores} cores @ {self.speed_ghz} GHz")

    def __init__(self, model, cores, speed):
        self.model = model
        self.cpu = Computer.CPU(cores, speed)

    def describe(self):
        print(f"Computer: {self.model}")
        self.cpu.describe()

# Can create CPU independently
cpu = Computer.CPU(8, 3.6)
cpu.describe()  # 8 cores @ 3.6 GHz

# Or as part of a Computer
pc = Computer("Workstation", 16, 4.0)
pc.describe()
```

```javascript
class Computer {
  // JavaScript doesn't have native nested class syntax.
  // Use a static property to attach the nested class.
  constructor(model, cores, speed) {
    this.model = model;
    this.cpu = new Computer.CPU(cores, speed);
  }

  describe() {
    console.log(`Computer: ${this.model}`);
    this.cpu.describe();
  }
}

// Attach nested class as static property
Computer.CPU = class CPU {
  constructor(cores, speedGHz) {
    this.cores = cores;
    this.speedGHz = speedGHz;
  }

  describe() {
    console.log(`${this.cores} cores @ ${this.speedGHz} GHz`);
  }
};

// Can create CPU independently
const cpu = new Computer.CPU(8, 3.6);
cpu.describe();  // 8 cores @ 3.6 GHz

// Or as part of a Computer
const pc = new Computer("Workstation", 16, 4.0);
pc.describe();
```

---

## Inner Class (Non-Static)

An inner class has access to all members of the outer class, including `private` ones:

```cpp
#include <iostream>

class LinkedList {
private:
    // Nested class (acts like inner class when used only within the outer)
    struct Node {
        int data;
        Node* next;
        Node(int data) : data(data), next(nullptr) {}
    };

    Node* head = nullptr;

public:
    void add(int data) {
        Node* newNode = new Node(data);
        newNode->next = head;
        head = newNode;
    }

    void printAll() const {
        Node* current = head;
        while (current != nullptr) {
            std::cout << current->data << " → ";
            current = current->next;
        }
        std::cout << "null" << std::endl;
    }

    ~LinkedList() {
        Node* current = head;
        while (current) {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
    }
};

LinkedList list;
list.add(3);
list.add(2);
list.add(1);
list.printAll();  // 1 → 2 → 3 → null
```

```csharp
using System;

class LinkedList
{
    private class Node
    {
        public int Data { get; set; }
        public Node? Next { get; set; }

        public Node(int data)
        {
            Data = data;
            Next = null;
        }
    }

    private Node? head = null;

    public void Add(int data)
    {
        var newNode = new Node(data);
        newNode.Next = head;
        head = newNode;
    }

    public void PrintAll()
    {
        var current = head;
        while (current != null)
        {
            Console.Write($"{current.Data} → ");
            current = current.Next;
        }
        Console.WriteLine("null");
    }
}

var list = new LinkedList();
list.Add(3);
list.Add(2);
list.Add(1);
list.PrintAll();  // 1 → 2 → 3 → null
```

```java
class LinkedList {
    private Node head;

    // Inner class — tightly coupled to LinkedList
    class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
        }
    }

    void add(int data) {
        Node newNode = new Node(data);
        newNode.next = head;
        head = newNode;
    }

    void printAll() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " → ");
            current = current.next;
        }
        System.out.println("null");
    }
}

LinkedList list = new LinkedList();
list.add(3);
list.add(2);
list.add(1);
list.printAll();  // 1 → 2 → 3 → null
```

```python
class LinkedList:
    class Node:
        def __init__(self, data):
            self.data = data
            self.next = None

    def __init__(self):
        self.head = None

    def add(self, data):
        new_node = LinkedList.Node(data)
        new_node.next = self.head
        self.head = new_node

    def print_all(self):
        current = self.head
        parts = []
        while current is not None:
            parts.append(str(current.data))
            current = current.next
        print(" → ".join(parts) + " → null")

linked = LinkedList()
linked.add(3)
linked.add(2)
linked.add(1)
linked.print_all()  # 1 → 2 → 3 → null
```

```javascript
class LinkedList {
  constructor() {
    this.head = null;
  }

  add(data) {
    const newNode = new LinkedList.Node(data);
    newNode.next = this.head;
    this.head = newNode;
  }

  printAll() {
    let current = this.head;
    const parts = [];
    while (current !== null) {
      parts.push(current.data);
      current = current.next;
    }
    console.log(parts.join(" → ") + " → null");
  }
}

LinkedList.Node = class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
};

const list = new LinkedList();
list.add(3);
list.add(2);
list.add(1);
list.printAll();  // 1 → 2 → 3 → null
```

---

## Anonymous Classes

An **anonymous class** is an unnamed class defined inline. Often used for quick, one-time implementations:

```cpp
#include <iostream>
#include <functional>

// C++ doesn't have anonymous classes in the same sense.
// Use lambdas or functors instead.
auto hello = [](const std::string& name) {
    std::cout << "Hello, " << name << "!" << std::endl;
};

hello("Alice");  // Hello, Alice!

// Or a functor (function object)
struct Greeter {
    void operator()(const std::string& name) const {
        std::cout << "Hi, " << name << "!" << std::endl;
    }
};

Greeter hi;
hi("Bob");  // Hi, Bob!
```

```csharp
using System;

// C# uses delegates and lambdas instead of anonymous classes
Action<string> hello = (name) => Console.WriteLine($"Hello, {name}!");
hello("Alice");  // Hello, Alice!

// Or use an interface with a lambda (via a helper)
interface IGreeting
{
    void Greet(string name);
}

class InlineGreeting : IGreeting
{
    private readonly Action<string> _action;
    public InlineGreeting(Action<string> action) => _action = action;
    public void Greet(string name) => _action(name);
}

var hi = new InlineGreeting(name => Console.WriteLine($"Hi, {name}!"));
hi.Greet("Bob");  // Hi, Bob!
```

```java
interface Greeting {
    void greet(String name);
}

// Anonymous class implementing Greeting
Greeting hello = new Greeting() {
    @Override
    public void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
};

hello.greet("Alice");  // Hello, Alice!

// Often replaced by lambdas in Java 8+:
Greeting hi = (name) -> System.out.println("Hi, " + name + "!");
hi.greet("Bob");  // Hi, Bob!
```

```python
# Python doesn't have anonymous classes, but you can use
# lambda for simple cases or create classes inline.

# Lambda (single expression only)
greet = lambda name: print(f"Hello, {name}!")
greet("Alice")  # Hello, Alice!

# For more complex cases, define a quick class:
class Greeting:
    def greet(self, name):
        print(f"Hi, {name}!")

hi = Greeting()
hi.greet("Bob")  # Hi, Bob!
```

```javascript
// JavaScript uses anonymous objects and arrow functions
const hello = {
  greet(name) {
    console.log(`Hello, ${name}!`);
  }
};

hello.greet("Alice");  // Hello, Alice!

// Arrow function for simple callbacks
const hi = (name) => console.log(`Hi, ${name}!`);
hi("Bob");  // Hi, Bob!
```

---

## Builder Pattern with Inner Class

A common use of static inner classes — the Builder pattern:

```cpp
#include <iostream>
#include <string>
#include <sstream>

class Pizza {
public:
    class Builder {
        std::string size;
        bool cheese = false;
        bool pepperoni = false;
        bool mushrooms = false;
        bool olives = false;
        friend class Pizza;

    public:
        Builder(std::string size) : size(size) {}
        Builder& addCheese() { cheese = true; return *this; }
        Builder& addPepperoni() { pepperoni = true; return *this; }
        Builder& addMushrooms() { mushrooms = true; return *this; }
        Builder& addOlives() { olives = true; return *this; }
        Pizza build() { return Pizza(*this); }
    };

private:
    std::string size;
    bool cheese, pepperoni, mushrooms, olives;

    Pizza(const Builder& b)
        : size(b.size), cheese(b.cheese), pepperoni(b.pepperoni),
          mushrooms(b.mushrooms), olives(b.olives) {}

public:
    friend std::ostream& operator<<(std::ostream& os, const Pizza& p) {
        os << p.size << " pizza";
        if (p.cheese) os << " + cheese";
        if (p.pepperoni) os << " + pepperoni";
        if (p.mushrooms) os << " + mushrooms";
        if (p.olives) os << " + olives";
        return os;
    }
};

Pizza pizza = Pizza::Builder("Large")
    .addCheese()
    .addPepperoni()
    .addMushrooms()
    .build();

std::cout << pizza << std::endl;
// Large pizza + cheese + pepperoni + mushrooms
```

```csharp
using System;
using System.Text;

class Pizza
{
    public string Size { get; }
    public bool Cheese { get; }
    public bool Pepperoni { get; }
    public bool Mushrooms { get; }
    public bool Olives { get; }

    private Pizza(Builder builder)
    {
        Size = builder.Size;
        Cheese = builder.HasCheese;
        Pepperoni = builder.HasPepperoni;
        Mushrooms = builder.HasMushrooms;
        Olives = builder.HasOlives;
    }

    public override string ToString()
    {
        var sb = new StringBuilder($"{Size} pizza");
        if (Cheese) sb.Append(" + cheese");
        if (Pepperoni) sb.Append(" + pepperoni");
        if (Mushrooms) sb.Append(" + mushrooms");
        if (Olives) sb.Append(" + olives");
        return sb.ToString();
    }

    // Nested Builder class
    public class Builder
    {
        public string Size { get; }
        public bool HasCheese { get; private set; }
        public bool HasPepperoni { get; private set; }
        public bool HasMushrooms { get; private set; }
        public bool HasOlives { get; private set; }

        public Builder(string size) => Size = size;
        public Builder AddCheese() { HasCheese = true; return this; }
        public Builder AddPepperoni() { HasPepperoni = true; return this; }
        public Builder AddMushrooms() { HasMushrooms = true; return this; }
        public Builder AddOlives() { HasOlives = true; return this; }
        public Pizza Build() => new Pizza(this);
    }
}

var pizza = new Pizza.Builder("Large")
    .AddCheese()
    .AddPepperoni()
    .AddMushrooms()
    .Build();

Console.WriteLine(pizza);
// Large pizza + cheese + pepperoni + mushrooms
```

```java
class Pizza {
    private String size;
    private boolean cheese;
    private boolean pepperoni;
    private boolean mushrooms;
    private boolean olives;

    private Pizza(Builder builder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.mushrooms = builder.mushrooms;
        this.olives = builder.olives;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder(size + " pizza");
        if (cheese) sb.append(" + cheese");
        if (pepperoni) sb.append(" + pepperoni");
        if (mushrooms) sb.append(" + mushrooms");
        if (olives) sb.append(" + olives");
        return sb.toString();
    }

    // Static inner Builder class
    static class Builder {
        private String size;
        private boolean cheese;
        private boolean pepperoni;
        private boolean mushrooms;
        private boolean olives;

        Builder(String size) {
            this.size = size;
        }

        Builder cheese() { this.cheese = true; return this; }
        Builder pepperoni() { this.pepperoni = true; return this; }
        Builder mushrooms() { this.mushrooms = true; return this; }
        Builder olives() { this.olives = true; return this; }

        Pizza build() {
            return new Pizza(this);
        }
    }
}

// Fluent API
Pizza pizza = new Pizza.Builder("Large")
    .cheese()
    .pepperoni()
    .mushrooms()
    .build();

System.out.println(pizza);
// Large pizza + cheese + pepperoni + mushrooms
```

```python
class Pizza:
    class Builder:
        def __init__(self, size):
            self.size = size
            self.cheese = False
            self.pepperoni = False
            self.mushrooms = False
            self.olives = False

        def add_cheese(self):
            self.cheese = True
            return self

        def add_pepperoni(self):
            self.pepperoni = True
            return self

        def add_mushrooms(self):
            self.mushrooms = True
            return self

        def add_olives(self):
            self.olives = True
            return self

        def build(self):
            return Pizza(self)

    def __init__(self, builder):
        self.size = builder.size
        self.cheese = builder.cheese
        self.pepperoni = builder.pepperoni
        self.mushrooms = builder.mushrooms
        self.olives = builder.olives

    def __str__(self):
        parts = [f"{self.size} pizza"]
        if self.cheese: parts.append("cheese")
        if self.pepperoni: parts.append("pepperoni")
        if self.mushrooms: parts.append("mushrooms")
        if self.olives: parts.append("olives")
        return " + ".join(parts)

pizza = (Pizza.Builder("Large")
    .add_cheese()
    .add_pepperoni()
    .add_mushrooms()
    .build())

print(pizza)
# Large pizza + cheese + pepperoni + mushrooms
```

```javascript
class Pizza {
  constructor(builder) {
    this.size = builder.size;
    this.cheese = builder.cheese;
    this.pepperoni = builder.pepperoni;
    this.mushrooms = builder.mushrooms;
    this.olives = builder.olives;
  }

  toString() {
    const parts = [`${this.size} pizza`];
    if (this.cheese) parts.push("cheese");
    if (this.pepperoni) parts.push("pepperoni");
    if (this.mushrooms) parts.push("mushrooms");
    if (this.olives) parts.push("olives");
    return parts.join(" + ");
  }
}

// Builder as a nested static-like class
Pizza.Builder = class Builder {
  constructor(size) {
    this.size = size;
    this.cheese = false;
    this.pepperoni = false;
    this.mushrooms = false;
    this.olives = false;
  }

  addCheese() { this.cheese = true; return this; }
  addPepperoni() { this.pepperoni = true; return this; }
  addMushrooms() { this.mushrooms = true; return this; }
  addOlives() { this.olives = true; return this; }

  build() { return new Pizza(this); }
};

const pizza = new Pizza.Builder("Large")
  .addCheese()
  .addPepperoni()
  .addMushrooms()
  .build();

console.log(pizza.toString());
// Large pizza + cheese + pepperoni + mushrooms
```

---

## When to Use Nested Classes

| Use Case | Type | Example |
|----------|------|---------|
| Helper class used by one outer class | Static nested | `LinkedList.Node` |
| Need access to outer class's private state | Inner | `Iterator` for a custom collection |
| One-time interface implementation | Anonymous | Event handlers, callbacks |
| Builder pattern | Static nested | `Pizza.Builder` |
| Logical grouping | Static nested | `Computer.CPU`, `Address.Country` |

---

## Key Takeaways

- **Static nested classes** don't need an outer instance — used for logical grouping
- **Inner classes** can access the outer class's private members
- **Anonymous classes** are unnamed, inline implementations (replaced by lambdas in Java 8+)
- C++ nested classes are always like Java's static nested classes
- JavaScript uses static properties to simulate nested classes
- Nested classes improve **encapsulation** and **organization**
- Common patterns: Node in LinkedList, Builder pattern, Iterator

Next: **Packages and Namespaces** — organizing code in larger projects.
