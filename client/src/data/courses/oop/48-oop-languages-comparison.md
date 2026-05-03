---
title: OOP in Different Languages
---

# OOP in Different Languages

Different programming languages implement OOP in different ways. Understanding these differences makes you a more versatile developer.

---

## Feature Comparison

| Feature | C++ | C# | Java | Python | JavaScript |
|---------|-----|-----|------|--------|------------|
| Classes | ✅ | ✅ | ✅ | ✅ | ✅ (ES6+) |
| Interfaces | ✅ (pure virtual) | ✅ | ✅ | ABC | ❌ (use TS) |
| Multiple inheritance | ✅ | ❌ (interfaces) | ❌ (interfaces) | ✅ | ❌ |
| Access modifiers | 3 levels | 5 levels | 4 levels | Convention | # (private) |
| Operator overloading | ✅ | ✅ | ❌ | ✅ | ❌ |
| Generics/Templates | ✅ | ✅ | ✅ | Type hints | ❌ (use TS) |
| Abstract classes | ✅ | ✅ | ✅ | ✅ (ABC) | ❌ |
| Garbage collection | ❌ (manual/RAII) | ✅ | ✅ | ✅ | ✅ |
| Properties (get/set) | ❌ | ✅ (built-in) | ❌ (methods) | ✅ (@property) | ✅ (get/set) |
| Memory control | Full | Limited (unsafe) | None | None | None |
| Nullable types | Pointers | ✅ (T?) | Optional | None by default | undefined/null |

---

## Class Definition and Inheritance

Each language has its own syntax for the same concepts:

```cpp
#include <iostream>
#include <string>

class Animal {
protected:
    std::string name;

public:
    Animal(std::string name) : name(std::move(name)) {}

    virtual void speak() {
        std::cout << name << " makes a sound\n";
    }

    virtual ~Animal() {}  // Virtual destructor for polymorphism
};

class Dog : public Animal {
public:
    Dog(std::string name) : Animal(std::move(name)) {}

    void speak() override {
        std::cout << name << " says Woof!\n";
    }
};

// C++ has full memory control
int main() {
    Animal* pet = new Dog("Rex");
    pet->speak();  // Rex says Woof!
    delete pet;    // Manual memory management (or use smart pointers)
    return 0;
}
```

```csharp
using System;

public class Animal
{
    protected string Name { get; }

    public Animal(string name) => Name = name;

    public virtual void Speak()
    {
        Console.WriteLine($"{Name} makes a sound");
    }
}

public class Dog : Animal
{
    public Dog(string name) : base(name) { }

    public override void Speak()
    {
        Console.WriteLine($"{Name} says Woof!");
    }
}

// C# has garbage collection + value types (struct) for performance
Animal pet = new Dog("Rex");
pet.Speak();  // Rex says Woof!
// No delete needed — garbage collected
```

```java
public class Animal {
    private String name;

    public Animal(String name) {
        this.name = name;
    }

    public String getName() { return name; }

    public void speak() {
        System.out.println(name + " makes a sound");
    }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void speak() {
        System.out.println(getName() + " says Woof!");
    }
}

// Java is strictly typed with GC
Animal pet = new Dog("Rex");
pet.speak();  // Rex says Woof!
// No delete needed — garbage collected
```

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound")

class Dog(Animal):
    def speak(self):
        print(f"{self.name} says Woof!")

# Python uses duck typing — no interface needed
class Robot:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} says Beep!")

# Works with any object that has speak()
def make_speak(thing):
    thing.speak()

make_speak(Dog("Rex"))    # Rex says Woof!
make_speak(Robot("R2D2"))  # R2D2 says Beep!
```

```javascript
// ES6 class syntax (sugar over prototypes)
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} says Woof!`);
  }
}

const rex = new Dog("Rex");
rex.speak();  // Rex says Woof!

// Under the hood: prototype chain
console.log(rex.__proto__ === Dog.prototype);               // true
console.log(Dog.prototype.__proto__ === Animal.prototype);  // true
```

---

## Access Control

```cpp
class MyClass {
public:    // Accessible from anywhere
    int publicField;

protected: // Accessible in class and subclasses
    int protectedField;

private:   // Accessible only in this class
    int privateField;
};
// C++ default access: private for class, public for struct
```

```csharp
class MyClass
{
    public int PublicField;              // Accessible from anywhere
    protected int ProtectedField;        // This class + subclasses
    internal int InternalField;          // Same assembly only
    protected internal int ProtIntern;   // Same assembly OR subclasses
    private int PrivateField;            // This class only
}
// C# has 5 access levels: public, protected, internal, protected internal, private
```

```java
class MyClass {
    public int publicField;       // Accessible from anywhere
    protected int protectedField; // Same package + subclasses
    int packageField;             // Same package only (default)
    private int privateField;     // This class only
}
// Java has 4 access levels including package-private
```

```python
class MyClass:
    def __init__(self):
        self.public_field = 1        # Accessible from anywhere
        self._protected_field = 2    # Convention: "protected"
        self.__private_field = 3     # Name-mangled (harder to access)
# Python relies on convention, not enforcement
# self.__private → _MyClass__private (name mangling)
```

```javascript
class MyClass {
  publicField = 1;       // Accessible from anywhere
  #privateField = 3;     // Truly private (ES2022)

  getPrivate() {
    return this.#privateField;
  }
}
// JavaScript has public and # private (no protected)
```

---

## Interfaces and Abstract Classes

```cpp
// C++ uses pure virtual functions for interfaces
class Drawable {
public:
    virtual void draw() = 0;  // Pure virtual = interface method
    virtual ~Drawable() = default;
};

class Resizable {
public:
    virtual void resize(int w, int h) = 0;
    virtual ~Resizable() = default;
};

// Multiple inheritance of interfaces
class Widget : public Drawable, public Resizable {
public:
    void draw() override { std::cout << "Drawing widget\n"; }
    void resize(int w, int h) override { std::cout << "Resizing\n"; }
};
```

```csharp
// C# interfaces — can have default implementations (C# 8+)
public interface IDrawable
{
    void Draw();  // Abstract — must implement
    void Hide() => Console.WriteLine("Hiding");  // Default implementation
}

public interface IResizable
{
    void Resize(int width, int height);
}

// Implement multiple interfaces
public class Widget : IDrawable, IResizable
{
    public void Draw() => Console.WriteLine("Drawing widget");
    public void Resize(int w, int h) => Console.WriteLine("Resizing");
}
```

```java
// Java interfaces — can have default methods
interface Drawable {
    void draw();  // Abstract — must implement
    default void hide() {  // Default — optional to override
        System.out.println("Hiding");
    }
}

interface Resizable {
    void resize(int width, int height);
}

// Implement multiple interfaces
class Widget implements Drawable, Resizable {
    @Override public void draw() { System.out.println("Drawing widget"); }
    @Override public void resize(int w, int h) { System.out.println("Resizing"); }
}
```

```python
from abc import ABC, abstractmethod

# Python uses Abstract Base Classes
class Drawable(ABC):
    @abstractmethod
    def draw(self):
        pass

    def hide(self):  # Concrete method (like default in Java)
        print("Hiding")

class Resizable(ABC):
    @abstractmethod
    def resize(self, width, height):
        pass

# Multiple inheritance of ABCs
class Widget(Drawable, Resizable):
    def draw(self):
        print("Drawing widget")

    def resize(self, width, height):
        print("Resizing")
```

```javascript
// JavaScript has no native interfaces — use duck typing or TypeScript
// Convention: document expected methods

class Widget {
  draw() {
    console.log("Drawing widget");
  }

  resize(width, height) {
    console.log("Resizing");
  }
}

// "Interface checking" via duck typing
function render(drawable) {
  if (typeof drawable.draw !== "function") {
    throw new Error("Object must implement draw()");
  }
  drawable.draw();
}

render(new Widget());  // Drawing widget
```

---

## Language Selection Guide

| Use Case | Recommended Language |
|----------|---------------------|
| System programming | C++ |
| Enterprise backend | Java, C# |
| Data science / scripting | Python |
| Web frontend/full-stack | JavaScript |
| Game development | C++, C# (Unity) |
| Quick prototyping | Python, JavaScript |
| Mobile (Android) | Java/Kotlin |
| Mobile (iOS/cross-platform) | C# (MAUI/Xamarin) |
| Performance-critical | C++, C# |
| Cloud/microservices | C#, Java |

---

## Key Takeaways

- OOP concepts are **universal** — classes, objects, inheritance, polymorphism work everywhere
- Languages differ in **syntax**, **strictness**, and **features**
- C++ gives **maximum control** including memory management and templates
- C# blends **strong typing** with modern features (properties, LINQ, async/await)
- Java is **strictly typed** with strong OOP enforcement and rich ecosystem
- Python is **flexible** with duck typing and multiple inheritance
- JavaScript uses **prototypes** under class syntax sugar
- Learn the **concepts** deeply — switching languages becomes easy

Next: **Real-World OOP Project** — building a Library Management System.
