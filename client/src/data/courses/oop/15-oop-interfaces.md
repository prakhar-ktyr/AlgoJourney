---
title: Interfaces
---

# Interfaces

An **interface** is a contract that defines what a class must do, without specifying how. It is the purest form of abstraction.

---

## What is an Interface?

An interface declares a set of method signatures that implementing classes **must** provide. It defines a **capability** or **role**.

| Concept | Analogy |
|---------|---------|
| Interface | A job description — lists requirements |
| Class implementing interface | An employee — fulfills the requirements |
| Multiple interfaces | A person with multiple roles (employee + volunteer + parent) |

---

## Defining an Interface

```cpp
// C++ doesn't have an 'interface' keyword — use pure virtual classes
class Printable {
public:
    virtual void print() = 0;
    virtual std::string getContent() = 0;
    virtual ~Printable() = default;
};

class Saveable {
public:
    virtual void save(const std::string& path) = 0;
    virtual void load(const std::string& path) = 0;
    virtual ~Saveable() = default;
};
```

```csharp
interface IPrintable {
    void Print();
    string GetContent();
}

interface ISaveable {
    void Save(string path);
    void Load(string path);
}
```

```java
interface Printable {
    void print();          // abstract by default
    String getContent();   // abstract by default
}

interface Saveable {
    void save(String path);
    void load(String path);
}
```

```python
from abc import ABC, abstractmethod

class Printable(ABC):
    @abstractmethod
    def print_content(self):
        pass

    @abstractmethod
    def get_content(self):
        pass

class Saveable(ABC):
    @abstractmethod
    def save(self, path):
        pass

    @abstractmethod
    def load(self, path):
        pass
```

```javascript
// JavaScript has no interface keyword — use convention or documentation
// Option 1: Base class with methods that throw
class Printable {
    print() {
        throw new Error("print() must be implemented");
    }

    getContent() {
        throw new Error("getContent() must be implemented");
    }
}

// Option 2: Just document the expected methods and rely on duck typing
// The class simply implements the expected methods
```

Key facts:
- **C++**: No `interface` keyword — use pure virtual classes (all methods `= 0`)
- **Java**: All methods are `public abstract` by default; all fields are `public static final`
- **Python**: Use `ABC` + `@abstractmethod` to simulate interfaces
- **JavaScript**: No native interface — rely on duck typing and documentation

---

## Implementing an Interface

```cpp
#include <iostream>
#include <string>
using namespace std;

class Document : public Printable, public Saveable {
    string text;
public:
    Document(string text) : text(text) {}

    void print() override {
        cout << "Printing: " << text << endl;
    }

    string getContent() override {
        return text;
    }

    void save(const string& path) override {
        cout << "Saving document to " << path << endl;
    }

    void load(const string& path) override {
        cout << "Loading document from " << path << endl;
    }
};
```

```csharp
using System;

class Document : IPrintable, ISaveable {
    private string text;

    public Document(string text) {
        this.text = text;
    }

    public void Print() {
        Console.WriteLine($"Printing: {text}");
    }

    public string GetContent() {
        return text;
    }

    public void Save(string path) {
        Console.WriteLine($"Saving document to {path}");
    }

    public void Load(string path) {
        Console.WriteLine($"Loading document from {path}");
    }
}
```

```java
class Document implements Printable, Saveable {
    private String text;

    Document(String text) {
        this.text = text;
    }

    @Override
    public void print() {
        System.out.println("Printing: " + text);
    }

    @Override
    public String getContent() {
        return text;
    }

    @Override
    public void save(String path) {
        System.out.println("Saving document to " + path);
    }

    @Override
    public void load(String path) {
        System.out.println("Loading document from " + path);
    }
}
```

```python
class Document(Printable, Saveable):
    def __init__(self, text):
        self.text = text

    def print_content(self):
        print(f"Printing: {self.text}")

    def get_content(self):
        return self.text

    def save(self, path):
        print(f"Saving document to {path}")

    def load(self, path):
        print(f"Loading document from {path}")
```

```javascript
class Document {
    constructor(text) {
        this.text = text;
    }

    // Implements Printable
    print() {
        console.log(`Printing: ${this.text}`);
    }

    getContent() {
        return this.text;
    }

    // Implements Saveable
    save(path) {
        console.log(`Saving document to ${path}`);
    }

    load(path) {
        console.log(`Loading document from ${path}`);
    }
}
```

A class can implement **multiple** interfaces (unlike extending multiple classes in Java/JS):

```cpp
class Document : public Printable, public Saveable {
    // Must implement ALL methods from BOTH interfaces
};
```

```csharp
class Document : IPrintable, ISaveable {
    // Must implement ALL methods from BOTH interfaces
}
```

```java
class Document implements Printable, Saveable {
    // Must implement ALL methods from BOTH interfaces
}
```

```python
class Document(Printable, Saveable):
    # Must implement ALL methods from BOTH abstract classes
    pass
```

```javascript
// JavaScript uses duck typing — just implement all expected methods
class Document {
    // Implement all expected methods from both "interfaces"
}
```

---

## Interface vs Abstract Class

| Feature | Interface | Abstract Class |
|---------|-----------|---------------|
| Methods | All abstract (default) | Mix of abstract and concrete |
| Fields | Constants only | Any fields |
| Constructor | No | Yes |
| Multiple inheritance | Class can implement many | Class can extend only one |
| Access modifiers | All public | Any modifier |
| Purpose | Define a **contract** (what) | Define a **template** (partial how) |
| "is-a" vs "can-do" | "can-do" (Printable, Serializable) | "is-a" (Animal, Shape) |

**Rule of thumb:**
- Use **interfaces** for capabilities: `Printable`, `Comparable`, `Serializable`
- Use **abstract classes** for shared base code: `Animal`, `Shape`, `Vehicle`

---

## Default Methods (Java 8+)

Java interfaces can now have methods with a body using `default`:

```cpp
// C++ doesn't have "default" interface methods — but you can provide
// implementations in the base class (making it not purely abstract)
class Logger {
public:
    virtual void log(const string& message) = 0;

    // Non-pure virtual — acts like a default method
    virtual void logError(const string& message) {
        log("ERROR: " + message);
    }

    virtual void logWarning(const string& message) {
        log("WARNING: " + message);
    }

    virtual ~Logger() = default;
};

class ConsoleLogger : public Logger {
public:
    void log(const string& message) override {
        cout << "[LOG] " << message << endl;
    }
};
```

```csharp
using System;

interface ILogger {
    void Log(string message);

    // Default interface method (C# 8+)
    void LogError(string message) {
        Log($"ERROR: {message}");
    }

    void LogWarning(string message) {
        Log($"WARNING: {message}");
    }
}

class ConsoleLogger : ILogger {
    public void Log(string message) {
        Console.WriteLine($"[LOG] {message}");
    }
    // LogError() and LogWarning() are inherited from the interface
}

ILogger logger = new ConsoleLogger();
logger.Log("App started");           // [LOG] App started
logger.LogError("File not found");   // [LOG] ERROR: File not found
```

```java
interface Logger {
    void log(String message);

    // Default method — provides implementation
    default void logError(String message) {
        log("ERROR: " + message);
    }

    default void logWarning(String message) {
        log("WARNING: " + message);
    }
}

class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
    // logError() and logWarning() are inherited from the interface
}

ConsoleLogger logger = new ConsoleLogger();
logger.log("App started");           // [LOG] App started
logger.logError("File not found");   // [LOG] ERROR: File not found
```

```python
from abc import ABC, abstractmethod

class Logger(ABC):
    @abstractmethod
    def log(self, message):
        pass

    # Non-abstract methods serve as "default" implementations
    def log_error(self, message):
        self.log(f"ERROR: {message}")

    def log_warning(self, message):
        self.log(f"WARNING: {message}")

class ConsoleLogger(Logger):
    def log(self, message):
        print(f"[LOG] {message}")

logger = ConsoleLogger()
logger.log("App started")           # [LOG] App started
logger.log_error("File not found")  # [LOG] ERROR: File not found
```

```javascript
class Logger {
    log(message) {
        throw new Error("log() must be implemented");
    }

    // "Default" methods with implementations
    logError(message) {
        this.log(`ERROR: ${message}`);
    }

    logWarning(message) {
        this.log(`WARNING: ${message}`);
    }
}

class ConsoleLogger extends Logger {
    log(message) {
        console.log(`[LOG] ${message}`);
    }
}

const logger = new ConsoleLogger();
logger.log("App started");           // [LOG] App started
logger.logError("File not found");   // [LOG] ERROR: File not found
```

---

## Polymorphism Through Interfaces

Interfaces enable polymorphism — code can work with any class that implements the interface:

```cpp
#include <iostream>
#include <vector>
using namespace std;

class Drawable {
public:
    virtual void draw() = 0;
    virtual ~Drawable() = default;
};

class Circle : public Drawable {
public:
    void draw() override {
        cout << "Drawing a circle" << endl;
    }
};

class Square : public Drawable {
public:
    void draw() override {
        cout << "Drawing a square" << endl;
    }
};

class Text : public Drawable {
public:
    void draw() override {
        cout << "Drawing text" << endl;
    }
};

void renderAll(vector<Drawable*>& items) {
    for (Drawable* item : items) {
        item->draw();
    }
}

int main() {
    vector<Drawable*> items = { new Circle(), new Square(), new Text() };
    renderAll(items);
}
```

```csharp
using System;
using System.Collections.Generic;

interface IDrawable {
    void Draw();
}

class Circle : IDrawable {
    public void Draw() {
        Console.WriteLine("Drawing a circle");
    }
}

class Square : IDrawable {
    public void Draw() {
        Console.WriteLine("Drawing a square");
    }
}

class Text : IDrawable {
    public void Draw() {
        Console.WriteLine("Drawing text");
    }
}

void RenderAll(List<IDrawable> items) {
    foreach (IDrawable item in items) {
        item.Draw();
    }
}

RenderAll(new List<IDrawable> { new Circle(), new Square(), new Text() });
// Drawing a circle
// Drawing a square
// Drawing text
```

```java
interface Drawable {
    void draw();
}

class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing a circle");
    }
}

class Square implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing a square");
    }
}

class Text implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing text");
    }
}

// Works with ANY Drawable — doesn't care about the concrete type
void renderAll(Drawable[] items) {
    for (Drawable item : items) {
        item.draw();
    }
}

renderAll(new Drawable[] {
    new Circle(),
    new Square(),
    new Text()
});
// Drawing a circle
// Drawing a square
// Drawing text
```

```python
from abc import ABC, abstractmethod

class Drawable(ABC):
    @abstractmethod
    def draw(self):
        pass

class Circle(Drawable):
    def draw(self):
        print("Drawing a circle")

class Square(Drawable):
    def draw(self):
        print("Drawing a square")

class Text(Drawable):
    def draw(self):
        print("Drawing text")

def render_all(items):
    for item in items:
        item.draw()

render_all([Circle(), Square(), Text()])
# Drawing a circle
# Drawing a square
# Drawing text
```

```javascript
// Using duck typing — no formal interface needed
class Circle {
    draw() {
        console.log("Drawing a circle");
    }
}

class Square {
    draw() {
        console.log("Drawing a square");
    }
}

class Text {
    draw() {
        console.log("Drawing text");
    }
}

function renderAll(items) {
    for (const item of items) {
        item.draw();
    }
}

renderAll([new Circle(), new Square(), new Text()]);
// Drawing a circle
// Drawing a square
// Drawing text
```

---

## Practical Example — Plugin System

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Plugin {
public:
    virtual string getName() = 0;
    virtual void initialize() = 0;
    virtual void execute() = 0;
    virtual void shutdown() = 0;
    virtual ~Plugin() = default;
};

class SpellCheckPlugin : public Plugin {
public:
    string getName() override { return "SpellChecker"; }
    void initialize() override { cout << "Loading dictionary..." << endl; }
    void execute() override { cout << "Checking spelling..." << endl; }
    void shutdown() override { cout << "SpellChecker stopped" << endl; }
};

class AutoSavePlugin : public Plugin {
public:
    string getName() override { return "AutoSave"; }
    void initialize() override { cout << "Setting up auto-save timer..." << endl; }
    void execute() override { cout << "Auto-saving document..." << endl; }
    void shutdown() override { cout << "AutoSave stopped" << endl; }
};

class PluginManager {
    vector<Plugin*> plugins;
public:
    void registerPlugin(Plugin* plugin) {
        plugins.push_back(plugin);
        plugin->initialize();
    }

    void runAll() {
        for (Plugin* p : plugins) {
            cout << "Running: " << p->getName() << endl;
            p->execute();
        }
    }
};
```

```csharp
using System;
using System.Collections.Generic;

interface IPlugin {
    string GetName();
    void Initialize();
    void Execute();
    void Shutdown();
}

class SpellCheckPlugin : IPlugin {
    public string GetName() => "SpellChecker";
    public void Initialize() { Console.WriteLine("Loading dictionary..."); }
    public void Execute() { Console.WriteLine("Checking spelling..."); }
    public void Shutdown() { Console.WriteLine("SpellChecker stopped"); }
}

class AutoSavePlugin : IPlugin {
    public string GetName() => "AutoSave";
    public void Initialize() { Console.WriteLine("Setting up auto-save timer..."); }
    public void Execute() { Console.WriteLine("Auto-saving document..."); }
    public void Shutdown() { Console.WriteLine("AutoSave stopped"); }
}

class PluginManager {
    private List<IPlugin> plugins = new();

    public void Register(IPlugin plugin) {
        plugins.Add(plugin);
        plugin.Initialize();
    }

    public void RunAll() {
        foreach (IPlugin p in plugins) {
            Console.WriteLine($"Running: {p.GetName()}");
            p.Execute();
        }
    }
}
```

```java
interface Plugin {
    String getName();
    void initialize();
    void execute();
    void shutdown();
}

class SpellCheckPlugin implements Plugin {
    @Override
    public String getName() { return "SpellChecker"; }

    @Override
    public void initialize() {
        System.out.println("Loading dictionary...");
    }

    @Override
    public void execute() {
        System.out.println("Checking spelling...");
    }

    @Override
    public void shutdown() {
        System.out.println("SpellChecker stopped");
    }
}

class AutoSavePlugin implements Plugin {
    @Override
    public String getName() { return "AutoSave"; }

    @Override
    public void initialize() {
        System.out.println("Setting up auto-save timer...");
    }

    @Override
    public void execute() {
        System.out.println("Auto-saving document...");
    }

    @Override
    public void shutdown() {
        System.out.println("AutoSave stopped");
    }
}

// Plugin manager works with ANY plugin
class PluginManager {
    List<Plugin> plugins = new ArrayList<>();

    void register(Plugin plugin) {
        plugins.add(plugin);
        plugin.initialize();
    }

    void runAll() {
        for (Plugin p : plugins) {
            System.out.println("Running: " + p.getName());
            p.execute();
        }
    }
}
```

```python
from abc import ABC, abstractmethod

class Plugin(ABC):
    @abstractmethod
    def get_name(self):
        pass

    @abstractmethod
    def initialize(self):
        pass

    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def shutdown(self):
        pass

class SpellCheckPlugin(Plugin):
    def get_name(self):
        return "SpellChecker"

    def initialize(self):
        print("Loading dictionary...")

    def execute(self):
        print("Checking spelling...")

    def shutdown(self):
        print("SpellChecker stopped")

class AutoSavePlugin(Plugin):
    def get_name(self):
        return "AutoSave"

    def initialize(self):
        print("Setting up auto-save timer...")

    def execute(self):
        print("Auto-saving document...")

    def shutdown(self):
        print("AutoSave stopped")

class PluginManager:
    def __init__(self):
        self.plugins = []

    def register(self, plugin):
        self.plugins.append(plugin)
        plugin.initialize()

    def run_all(self):
        for p in self.plugins:
            print(f"Running: {p.get_name()}")
            p.execute()
```

```javascript
// No formal interface — just implement the expected methods
class SpellCheckPlugin {
    getName() { return "SpellChecker"; }
    initialize() { console.log("Loading dictionary..."); }
    execute() { console.log("Checking spelling..."); }
    shutdown() { console.log("SpellChecker stopped"); }
}

class AutoSavePlugin {
    getName() { return "AutoSave"; }
    initialize() { console.log("Setting up auto-save timer..."); }
    execute() { console.log("Auto-saving document..."); }
    shutdown() { console.log("AutoSave stopped"); }
}

class PluginManager {
    constructor() {
        this.plugins = [];
    }

    register(plugin) {
        this.plugins.push(plugin);
        plugin.initialize();
    }

    runAll() {
        for (const p of this.plugins) {
            console.log(`Running: ${p.getName()}`);
            p.execute();
        }
    }
}
```

---

## Key Takeaways

- An **interface** defines a contract — what methods a class must have
- Classes **implement** interfaces (can implement many)
- Interfaces enable **polymorphism** — code works with any implementor
- Use interfaces for **capabilities** ("can-do"), abstract classes for **hierarchies** ("is-a")
- C++ uses pure virtual classes; Java has `interface`; Python uses `ABC`; JavaScript uses duck typing
- C# uses the `interface` keyword with `I` prefix convention (e.g., `IDisposable`)
- Java 8+ interfaces can have `default` and `static` methods
- C# 8+ interfaces support **default interface methods** with implementations

## Functional Interfaces and Lambda Expressions (Java)

A **functional interface** has exactly one abstract method. Java 8 introduced `@FunctionalInterface` to enforce this, enabling lambda expressions:

```java
import java.util.function.*;
import java.util.List;

@FunctionalInterface
interface Transformer<T> {
    T transform(T input);
}

// Built-in functional interfaces
Predicate<String> isLong = s -> s.length() > 5;
Function<String, Integer> toLength = String::length;
Consumer<String> printer = System.out::println;
Supplier<Double> random = Math::random;

// Using with collections
List<String> names = List.of("Alice", "Bob", "Charlie");
names.stream()
    .filter(isLong)            // Predicate<String>
    .map(toLength)             // Function<String, Integer>
    .forEach(System.out::println); // Consumer<Integer>

// Custom functional interface with lambda
Transformer<String> shout = s -> s.toUpperCase() + "!";
System.out.println(shout.transform("hello")); // HELLO!
```

---

## Default Interface Methods (C#)

C# 8+ supports default interface methods, similar to Java's `default` methods. This allows adding new methods to interfaces without breaking existing implementations:

```csharp
interface ILogger {
    void Log(string message);

    // Default implementation — implementing classes inherit this
    void LogError(string message) => Log($"ERROR: {message}");

    // Static members in interfaces (C# 11+)
    static string FormatTimestamp() => DateTime.Now.ToString("HH:mm:ss");
}

interface IVersioned {
    // Static abstract members (C# 11+) — for generic math, factories, etc.
    static abstract IVersioned Create(int version);
    int Version { get; }
}
```

Next: **Composition vs Inheritance** — choosing the right relationship.
