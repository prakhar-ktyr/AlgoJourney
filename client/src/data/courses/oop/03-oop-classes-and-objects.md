---
title: Classes and Objects
---

# Classes and Objects

A **class** is a blueprint. An **object** is a concrete instance of that blueprint. This lesson teaches you how to define classes and create objects.

---

## Defining a Class

A class is defined using the `class` keyword in most OOP languages.

```cpp
#include <iostream>
#include <string>
using namespace std;

class Dog {
public:
    // Attributes (what the dog "knows")
    string name;
    int age;

    // Method (what the dog "does")
    void bark() {
        cout << name << " says: Woof!" << endl;
    }
};
```

```csharp
using System;

class Dog
{
    // Attributes (what the dog "knows")
    public string Name;
    public int Age;

    // Method (what the dog "does")
    public void Bark()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
}
```

```java
public class Dog {
    // Attributes (what the dog "knows")
    String name;
    int age;

    // Method (what the dog "does")
    void bark() {
        System.out.println(name + " says: Woof!");
    }
}
```

```python
class Dog:
    def __init__(self, name, age):
        self.name = name   # attribute
        self.age = age      # attribute

    def bark(self):         # method
        print(f"{self.name} says: Woof!")
```

```javascript
class Dog {
    constructor(name, age) {
        this.name = name;   // attribute
        this.age = age;     // attribute
    }

    bark() {                // method
        console.log(`${this.name} says: Woof!`);
    }
}
```

---

## Creating Objects

Creating an object from a class is called **instantiation**. You "instantiate" the class.

```cpp
int main() {
    Dog rex;              // Create object
    rex.name = "Rex";    // Set attributes
    rex.age = 3;

    Dog bella;
    bella.name = "Bella";
    bella.age = 5;

    rex.bark();    // Rex says: Woof!
    bella.bark();  // Bella says: Woof!
    return 0;
}
```

```csharp
Dog rex = new Dog();        // Create object
rex.Name = "Rex";           // Set attributes
rex.Age = 3;

Dog bella = new Dog();
bella.Name = "Bella";
bella.Age = 5;

rex.Bark();    // Rex says: Woof!
bella.Bark();  // Bella says: Woof!
```

```java
public class Main {
    public static void main(String[] args) {
        Dog rex = new Dog();     // Create object
        rex.name = "Rex";        // Set attributes
        rex.age = 3;

        Dog bella = new Dog();
        bella.name = "Bella";
        bella.age = 5;

        rex.bark();    // Rex says: Woof!
        bella.bark();  // Bella says: Woof!
    }
}
```

```python
rex = Dog("Rex", 3)       # Create object
bella = Dog("Bella", 5)

rex.bark()    # Rex says: Woof!
bella.bark()  # Bella says: Woof!
```

```javascript
const rex = new Dog("Rex", 3);       // Create object
const bella = new Dog("Bella", 5);

rex.bark();    // Rex says: Woof!
bella.bark();  // Bella says: Woof!
```

Key points:
- `rex` and `bella` are **separate objects** — changing one doesn't affect the other
- Each object has its own copy of the attributes (`name`, `age`)
- Both share the same method definitions from the class

---

## Class vs Object — Visual

```
┌──────────────────────────────┐
│         Class: Dog           │   ← Blueprint (exists once)
│  ┌────────────────────────┐  │
│  │ Attributes:            │  │
│  │   name: String         │  │
│  │   age: int             │  │
│  ├────────────────────────┤  │
│  │ Methods:               │  │
│  │   bark()               │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
         │          │
         ▼          ▼
┌─────────────┐  ┌─────────────┐
│ Object: rex │  │ Object: bella│   ← Instances (many can exist)
│ name: "Rex" │  │ name: "Bella"│
│ age: 3      │  │ age: 5       │
└─────────────┘  └─────────────┘
```

---

## Multiple Objects

You can create as many objects as you want from a single class:

```cpp
Dog d1, d2, d3, d4;
// ... hundreds more if needed
```

```csharp
Dog d1 = new Dog();
Dog d2 = new Dog();
Dog d3 = new Dog();
Dog d4 = new Dog();
// ... hundreds more if needed
```

```java
Dog d1 = new Dog();
Dog d2 = new Dog();
Dog d3 = new Dog();
Dog d4 = new Dog();
// ... hundreds more if needed
```

```python
d1 = Dog("Dog1", 1)
d2 = Dog("Dog2", 2)
d3 = Dog("Dog3", 3)
d4 = Dog("Dog4", 4)
# ... hundreds more if needed
```

```javascript
const d1 = new Dog("Dog1", 1);
const d2 = new Dog("Dog2", 2);
const d3 = new Dog("Dog3", 3);
const d4 = new Dog("Dog4", 4);
// ... hundreds more if needed
```

Each object is **independent**. Modifying `d1.name` does not affect `d2.name`.

---

## Accessing Attributes and Methods

Use the **dot operator** (`.`) to access an object's attributes and methods:

```cpp
// Set an attribute
rex.name = "Rex";

// Read an attribute
cout << rex.name << endl;  // Rex

// Call a method
rex.bark();  // Rex says: Woof!
```

```csharp
// Set an attribute
rex.Name = "Rex";

// Read an attribute
Console.WriteLine(rex.Name);  // Rex

// Call a method
rex.Bark();  // Rex says: Woof!
```

```java
// Set an attribute
rex.name = "Rex";

// Read an attribute
System.out.println(rex.name);  // Rex

// Call a method
rex.bark();  // Rex says: Woof!
```

```python
# Set an attribute
rex.name = "Rex"

# Read an attribute
print(rex.name)  # Rex

# Call a method
rex.bark()  # Rex says: Woof!
```

```javascript
// Set an attribute
rex.name = "Rex";

// Read an attribute
console.log(rex.name);  // Rex

// Call a method
rex.bark();  // Rex says: Woof!
```

---

## A Practical Example — Student

```cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    string name;
    int grade;
    double gpa;

    void printInfo() {
        cout << "Name: " << name << endl;
        cout << "Grade: " << grade << endl;
        cout << "GPA: " << gpa << endl;
    }

    bool isHonorRoll() {
        return gpa >= 3.5;
    }
};

int main() {
    Student s1;
    s1.name = "Alice";
    s1.grade = 10;
    s1.gpa = 3.8;

    Student s2;
    s2.name = "Bob";
    s2.grade = 10;
    s2.gpa = 3.2;

    s1.printInfo();
    cout << "Honor roll? " << (s1.isHonorRoll() ? "true" : "false") << endl;  // true

    s2.printInfo();
    cout << "Honor roll? " << (s2.isHonorRoll() ? "true" : "false") << endl;  // false
    return 0;
}
```

```csharp
using System;

class Student
{
    public string Name;
    public int Grade;
    public double Gpa;

    public void PrintInfo()
    {
        Console.WriteLine($"Name: {Name}");
        Console.WriteLine($"Grade: {Grade}");
        Console.WriteLine($"GPA: {Gpa}");
    }

    public bool IsHonorRoll()
    {
        return Gpa >= 3.5;
    }
}

class Program
{
    static void Main()
    {
        Student s1 = new Student();
        s1.Name = "Alice";
        s1.Grade = 10;
        s1.Gpa = 3.8;

        Student s2 = new Student();
        s2.Name = "Bob";
        s2.Grade = 10;
        s2.Gpa = 3.2;

        s1.PrintInfo();
        Console.WriteLine($"Honor roll? {s1.IsHonorRoll()}");  // True

        s2.PrintInfo();
        Console.WriteLine($"Honor roll? {s2.IsHonorRoll()}");  // False
    }
}
```

```java
public class Student {
    String name;
    int grade;
    double gpa;

    void printInfo() {
        System.out.println("Name: " + name);
        System.out.println("Grade: " + grade);
        System.out.println("GPA: " + gpa);
    }

    boolean isHonorRoll() {
        return gpa >= 3.5;
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student();
        s1.name = "Alice";
        s1.grade = 10;
        s1.gpa = 3.8;

        Student s2 = new Student();
        s2.name = "Bob";
        s2.grade = 10;
        s2.gpa = 3.2;

        s1.printInfo();
        System.out.println("Honor roll? " + s1.isHonorRoll());  // true

        s2.printInfo();
        System.out.println("Honor roll? " + s2.isHonorRoll());  // false
    }
}
```

```python
class Student:
    def __init__(self, name, grade, gpa):
        self.name = name
        self.grade = grade
        self.gpa = gpa

    def print_info(self):
        print(f"Name: {self.name}")
        print(f"Grade: {self.grade}")
        print(f"GPA: {self.gpa}")

    def is_honor_roll(self):
        return self.gpa >= 3.5

s1 = Student("Alice", 10, 3.8)
s2 = Student("Bob", 10, 3.2)

s1.print_info()
print(f"Honor roll? {s1.is_honor_roll()}")  # True

s2.print_info()
print(f"Honor roll? {s2.is_honor_roll()}")  # False
```

```javascript
class Student {
    constructor(name, grade, gpa) {
        this.name = name;
        this.grade = grade;
        this.gpa = gpa;
    }

    printInfo() {
        console.log(`Name: ${this.name}`);
        console.log(`Grade: ${this.grade}`);
        console.log(`GPA: ${this.gpa}`);
    }

    isHonorRoll() {
        return this.gpa >= 3.5;
    }
}

const s1 = new Student("Alice", 10, 3.8);
const s2 = new Student("Bob", 10, 3.2);

s1.printInfo();
console.log(`Honor roll? ${s1.isHonorRoll()}`);  // true

s2.printInfo();
console.log(`Honor roll? ${s2.isHonorRoll()}`);  // false
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `Dog rex;` without `new Dog()` (Java) | Variable declared but no object created (null) | Always use `new` to instantiate |
| Forgetting `self` in Python | Attributes won't be tied to the object | Always use `self.attribute` |
| Confusing class with object | Trying to call `Dog.bark()` on the class | Call on an instance: `rex.bark()` |

---

## Key Takeaways

- A **class** defines the structure (attributes + methods)
- An **object** is a specific instance with real values
- Use `ClassName()` (C++), `new ClassName()` (Java), `ClassName()` (Python), or `new ClassName()` (JS) to create objects
- Access members with the **dot operator** (`.`)
- Each object has its own independent copy of attributes

Next: **Attributes and Properties** — how to define and manage object state.
