---
title: Method Overriding
---

# Method Overriding

**Method overriding** lets a child class provide its own implementation of a method that is already defined in the parent class. This is a key mechanism of **runtime polymorphism**.

---

## What is Method Overriding?

When a child class defines a method with the **same name**, **same parameters**, and **same return type** as a parent method, the child's version **replaces** the parent's version for objects of the child type.

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() {
        cout << "Some generic sound" << endl;
    }
};

class Dog : public Animal {
public:
    void speak() override {
        cout << "Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    void speak() override {
        cout << "Meow!" << endl;
    }
};

int main() {
    Animal a;
    a.speak();  // Some generic sound

    Dog d;
    d.speak();  // Woof!

    Cat c;
    c.speak();  // Meow!
}
```

```csharp
using System;

class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("Some generic sound");
    }
}

class Dog : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Woof!");
    }
}

class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Meow!");
    }
}

class Program
{
    static void Main()
    {
        Animal a = new Animal();
        a.Speak();  // Some generic sound

        Dog d = new Dog();
        d.Speak();  // Woof!

        Cat c = new Cat();
        c.Speak();  // Meow!
    }
}
```

```java
class Animal {
    void speak() {
        System.out.println("Some generic sound");
    }
}

class Dog extends Animal {
    @Override
    void speak() {
        System.out.println("Woof!");  // Overrides parent's speak()
    }
}

class Cat extends Animal {
    @Override
    void speak() {
        System.out.println("Meow!");  // Overrides parent's speak()
    }
}

Animal a = new Animal();
a.speak();  // Some generic sound

Dog d = new Dog();
d.speak();  // Woof!

Cat c = new Cat();
c.speak();  // Meow!
```

```python
class Animal:
    def speak(self):
        print("Some generic sound")

class Dog(Animal):
    def speak(self):  # Overrides Animal.speak()
        print("Woof!")

class Cat(Animal):
    def speak(self):  # Overrides Animal.speak()
        print("Meow!")

Animal().speak()  # Some generic sound
Dog().speak()     # Woof!
Cat().speak()     # Meow!
```

```javascript
class Animal {
    speak() {
        console.log("Some generic sound");
    }
}

class Dog extends Animal {
    speak() {  // Overrides Animal.speak()
        console.log("Woof!");
    }
}

class Cat extends Animal {
    speak() {  // Overrides Animal.speak()
        console.log("Meow!");
    }
}

new Animal().speak();  // Some generic sound
new Dog().speak();     // Woof!
new Cat().speak();     // Meow!
```

---

## Override Mechanisms by Language

- **Java**: The `@Override` annotation tells the compiler "I intend to override a parent method." It is optional but **strongly recommended** — it catches typos at compile time.
- **C++**: The `override` keyword (C++11) serves the same purpose and causes a compile error if the method doesn't actually override a base class virtual method.
- **Python**: No annotation needed — you simply define a method with the same name.
- **JavaScript**: No annotation needed — you simply define a method with the same name in the subclass.

```cpp
class Animal {
public:
    virtual void speak() {
        cout << "..." << endl;
    }
};

class Dog : public Animal {
public:
    void speak() override {       // ✅ Correctly overrides Animal::speak()
        cout << "Woof!" << endl;
    }

    // void spek() override { }  // ❌ Compile error! No "spek" in Animal
};
```

```csharp
class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("...");
    }
}

class Dog : Animal
{
    public override void Speak()    // ✅ Correctly overrides Animal.Speak()
    {
        Console.WriteLine("Woof!");
    }

    // public override void Spek() { }  // ❌ Compile error! No "Spek" in Animal
}
```

```java
class Dog extends Animal {
    @Override
    void speak() {           // ✅ Correctly overrides Animal.speak()
        System.out.println("Woof!");
    }

    // @Override
    // void spek() { }       // ❌ Compile error! No "spek" in Animal
}
```

```python
class Dog(Animal):
    def speak(self):  # Simply redefine — no annotation needed
        print("Woof!")

    # Python won't warn about typos — "spek" would silently become a new method
```

```javascript
class Dog extends Animal {
    speak() {  // Simply redefine — no annotation needed
        console.log("Woof!");
    }

    // JavaScript won't warn about typos — "spek" would silently become a new method
}
```

---

## Calling the Parent's Method with `super`

Sometimes you want to **extend** the parent's behaviour rather than completely replace it. Use `super` to call the parent's version:

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() {
        cout << "*breathes*" << endl;
    }
};

class Dog : public Animal {
public:
    void speak() override {
        Animal::speak();  // Call parent's speak() first
        cout << "Woof!" << endl;
    }
};

int main() {
    Dog d;
    d.speak();
    // *breathes*
    // Woof!
}
```

```csharp
using System;

class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("*breathes*");
    }
}

class Dog : Animal
{
    public override void Speak()
    {
        base.Speak();  // Call parent's Speak() first
        Console.WriteLine("Woof!");
    }
}

class Program
{
    static void Main()
    {
        Dog d = new Dog();
        d.Speak();
        // *breathes*
        // Woof!
    }
}
```

```java
class Animal {
    void speak() {
        System.out.println("*breathes*");
    }
}

class Dog extends Animal {
    @Override
    void speak() {
        super.speak();  // Call parent's speak() first
        System.out.println("Woof!");
    }
}

Dog d = new Dog();
d.speak();
// *breathes*
// Woof!
```

```python
class Animal:
    def speak(self):
        print("*breathes*")

class Dog(Animal):
    def speak(self):
        super().speak()   # Call parent's speak() first
        print("Woof!")

Dog().speak()
# *breathes*
# Woof!
```

```javascript
class Animal {
    speak() {
        console.log("*breathes*");
    }
}

class Dog extends Animal {
    speak() {
        super.speak();  // Call parent's speak() first
        console.log("Woof!");
    }
}

new Dog().speak();
// *breathes*
// Woof!
```

---

## Rules of Method Overriding

| Rule | Description |
|------|-------------|
| Same name | Must match the parent method's name exactly |
| Same parameters | Must have the same parameter types and order |
| Same or narrower return type | Can return the same type or a subtype (covariant return) |
| Access can't be more restrictive | If parent is `public`, child can't be `private` |
| `private` methods can't be overridden | They aren't visible to the child class |
| `final` methods can't be overridden | Java's `final` / C++'s non-virtual prevents overriding |
| `static` methods aren't overridden | They are hidden, not overridden (no polymorphism) |

---

## Covariant Return Types

The return type of the overriding method can be a **subtype** of the parent's return type:

```cpp
class Animal {
public:
    virtual Animal* create() {
        return new Animal();
    }
};

class Dog : public Animal {
public:
    Dog* create() override {  // Returns Dog* instead of Animal* — valid!
        return new Dog();
    }
};
```

```csharp
// C# doesn't support covariant return types directly (until C# 9)
// In C# 9+, you can use covariant returns:
class Animal
{
    public virtual Animal Create()
    {
        return new Animal();
    }
}

class Dog : Animal
{
    public override Animal Create()  // Returns Animal type (use Dog internally)
    {
        return new Dog();
    }
}
```

```java
class Animal {
    Animal create() {
        return new Animal();
    }
}

class Dog extends Animal {
    @Override
    Dog create() {        // Returns Dog instead of Animal — valid!
        return new Dog();
    }
}
```

```python
class Animal:
    def create(self):
        return Animal()

class Dog(Animal):
    def create(self):  # Returns Dog instance — Python is dynamically typed
        return Dog()
```

```javascript
class Animal {
    create() {
        return new Animal();
    }
}

class Dog extends Animal {
    create() {  // Returns Dog instance — JS is dynamically typed
        return new Dog();
    }
}
```

---

## Practical Example — Employee System

```cpp
#include <iostream>
#include <string>
using namespace std;

class Employee {
public:
    string name;
    double baseSalary;

    Employee(string name, double baseSalary)
        : name(name), baseSalary(baseSalary) {}

    virtual double calculatePay() {
        return baseSalary;
    }

    void printPaySlip() {
        cout << name << " — Pay: $" << calculatePay() << endl;
    }
};

class Manager : public Employee {
    double bonus;
public:
    Manager(string name, double baseSalary, double bonus)
        : Employee(name, baseSalary), bonus(bonus) {}

    double calculatePay() override {
        return baseSalary + bonus;
    }
};

class Intern : public Employee {
public:
    Intern(string name) : Employee(name, 0) {}

    double calculatePay() override {
        return 500;  // Fixed stipend
    }
};

int main() {
    Employee e1("Alice", 5000);
    Manager e2("Bob", 5000, 2000);
    Intern e3("Charlie");

    e1.printPaySlip();  // Alice — Pay: $5000
    e2.printPaySlip();  // Bob — Pay: $7000
    e3.printPaySlip();  // Charlie — Pay: $500
}
```

```csharp
using System;

class Employee
{
    public string Name;
    public double BaseSalary;

    public Employee(string name, double baseSalary)
    {
        Name = name;
        BaseSalary = baseSalary;
    }

    public virtual double CalculatePay()
    {
        return BaseSalary;
    }

    public void PrintPaySlip()
    {
        Console.WriteLine($"{Name} — Pay: ${CalculatePay()}");
    }
}

class Manager : Employee
{
    private double bonus;

    public Manager(string name, double baseSalary, double bonus)
        : base(name, baseSalary)
    {
        this.bonus = bonus;
    }

    public override double CalculatePay()
    {
        return BaseSalary + bonus;
    }
}

class Intern : Employee
{
    public Intern(string name) : base(name, 0) { }

    public override double CalculatePay()
    {
        return 500;  // Fixed stipend
    }
}

class Program
{
    static void Main()
    {
        Employee e1 = new Employee("Alice", 5000);
        Manager e2 = new Manager("Bob", 5000, 2000);
        Intern e3 = new Intern("Charlie");

        e1.PrintPaySlip();  // Alice — Pay: $5000
        e2.PrintPaySlip();  // Bob — Pay: $7000
        e3.PrintPaySlip();  // Charlie — Pay: $500
    }
}
```

```java
class Employee {
    String name;
    double baseSalary;

    Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    double calculatePay() {
        return baseSalary;
    }

    void printPaySlip() {
        System.out.println(name + " — Pay: $" + calculatePay());
    }
}

class Manager extends Employee {
    double bonus;

    Manager(String name, double baseSalary, double bonus) {
        super(name, baseSalary);
        this.bonus = bonus;
    }

    @Override
    double calculatePay() {
        return baseSalary + bonus;  // Override to include bonus
    }
}

class Intern extends Employee {
    Intern(String name) {
        super(name, 0);  // Interns get stipend, not salary
    }

    @Override
    double calculatePay() {
        return 500;  // Fixed stipend
    }
}

Employee e1 = new Employee("Alice", 5000);
Manager e2 = new Manager("Bob", 5000, 2000);
Intern e3 = new Intern("Charlie");

e1.printPaySlip();  // Alice — Pay: $5000.0
e2.printPaySlip();  // Bob — Pay: $7000.0
e3.printPaySlip();  // Charlie — Pay: $500.0
```

```python
class Employee:
    def __init__(self, name, base_salary):
        self.name = name
        self.base_salary = base_salary

    def calculate_pay(self):
        return self.base_salary

    def print_pay_slip(self):
        print(f"{self.name} — Pay: ${self.calculate_pay()}")

class Manager(Employee):
    def __init__(self, name, base_salary, bonus):
        super().__init__(name, base_salary)
        self.bonus = bonus

    def calculate_pay(self):
        return self.base_salary + self.bonus

class Intern(Employee):
    def __init__(self, name):
        super().__init__(name, 0)

    def calculate_pay(self):
        return 500  # Fixed stipend

e1 = Employee("Alice", 5000)
e2 = Manager("Bob", 5000, 2000)
e3 = Intern("Charlie")

e1.print_pay_slip()  # Alice — Pay: $5000
e2.print_pay_slip()  # Bob — Pay: $7000
e3.print_pay_slip()  # Charlie — Pay: $500
```

```javascript
class Employee {
    constructor(name, baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    calculatePay() {
        return this.baseSalary;
    }

    printPaySlip() {
        console.log(`${this.name} — Pay: $${this.calculatePay()}`);
    }
}

class Manager extends Employee {
    constructor(name, baseSalary, bonus) {
        super(name, baseSalary);
        this.bonus = bonus;
    }

    calculatePay() {
        return this.baseSalary + this.bonus;
    }
}

class Intern extends Employee {
    constructor(name) {
        super(name, 0);
    }

    calculatePay() {
        return 500;  // Fixed stipend
    }
}

const e1 = new Employee("Alice", 5000);
const e2 = new Manager("Bob", 5000, 2000);
const e3 = new Intern("Charlie");

e1.printPaySlip();  // Alice — Pay: $5000
e2.printPaySlip();  // Bob — Pay: $7000
e3.printPaySlip();  // Charlie — Pay: $500
```

Notice that `printPaySlip()` is defined **once** in `Employee`, but it correctly calls the overridden `calculatePay()` in each subclass. This is **polymorphism** at work.

---

## Overriding vs Overloading

| Feature | Overriding | Overloading |
|---------|-----------|-------------|
| Where | Child class | Same class |
| Method name | Same | Same |
| Parameters | Same | Different |
| Return type | Same (or covariant) | Can differ |
| Resolved at | Runtime | Compile time |
| Purpose | Change inherited behaviour | Provide multiple versions |

```cpp
class Calculator {
public:
    // Overloading — same name, different parameters
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a + b + c; }
};
```

```csharp
class Calculator
{
    // Overloading — same name, different parameters
    public int Add(int a, int b) { return a + b; }
    public double Add(double a, double b) { return a + b; }
    public int Add(int a, int b, int c) { return a + b + c; }
}
```

```java
class Calculator {
    // Overloading — same name, different parameters
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a + b + c; }
}
```

```python
# Python doesn't support method overloading natively — use default args
class Calculator:
    def add(self, a, b, c=None):
        if c is not None:
            return a + b + c
        return a + b
```

```javascript
// JavaScript doesn't support method overloading — use rest params or checks
class Calculator {
    add(...args) {
        return args.reduce((sum, n) => sum + n, 0);
    }
}
```

---

## Preventing Overriding

In some languages you can mark a method to prevent subclasses from overriding it:

```cpp
class Animal {
public:
    // Use 'final' keyword to prevent overriding
    virtual void breathe() final {
        cout << "Breathing..." << endl;
    }
};

class Dog : public Animal {
    // void breathe() override { }  // ❌ Compile error — breathe() is final
};
```

```csharp
using System;

class Animal
{
    // Use 'sealed' on override or don't mark as virtual to prevent overriding
    public virtual void Breathe()
    {
        Console.WriteLine("Breathing...");
    }
}

class Mammal : Animal
{
    public sealed override void Breathe()  // sealed — no further overriding
    {
        Console.WriteLine("Breathing with lungs...");
    }
}

class Dog : Mammal
{
    // public override void Breathe() { }  // ❌ Compile error — Breathe() is sealed
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
    // void breathe() { }  // ❌ Compile error — breathe() is final
}
```

```python
# Python has no built-in 'final' enforcement at runtime
# Use typing.final (Python 3.8+) for static analysis tools
from typing import final

class Animal:
    @final
    def breathe(self):
        print("Breathing...")

# Type checkers (mypy) will flag overrides, but runtime won't prevent it
```

```javascript
// JavaScript has no native 'final' methods
// Convention: document that a method should not be overridden
class Animal {
    breathe() {
        console.log("Breathing...");
    }
}

// No compile-time enforcement — rely on documentation/convention
```

---

## Virtual Functions and vtable (C++)

In C++, methods are **not polymorphic by default**. You must mark a method `virtual` to enable runtime dispatch through a derived class pointer or reference.

When a class has virtual methods, the compiler creates a **vtable** (virtual method table) — an array of function pointers. Each object gets a hidden **vptr** pointing to its class's vtable.

```cpp
#include <iostream>
using namespace std;

class Shape {
public:
    virtual void draw() {               // virtual — enables polymorphism
        cout << "Drawing shape" << endl;
    }

    virtual double area() = 0;          // pure virtual — makes Shape abstract

    virtual ~Shape() = default;         // Always make base destructors virtual!
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}

    void draw() override {              // override — compiler checks correctness
        cout << "Drawing circle (r=" << radius << ")" << endl;
    }

    double area() override {
        return 3.14159 * radius * radius;
    }
};

int main() {
    Shape* s = new Circle(5);
    s->draw();   // "Drawing circle (r=5)" — dispatched via vtable
    cout << s->area() << endl;  // 78.5398
    delete s;    // Correct destructor called because ~Shape is virtual
}
```

**Key rules**:
- Without `virtual`, calls through a base pointer invoke the **base** version (static binding)
- `= 0` makes a function **pure virtual**, turning the class into an abstract class
- Always declare the destructor `virtual` in a base class with virtual methods to avoid undefined behaviour on `delete`

---

## Key Takeaways

- **Overriding** replaces a parent method's implementation in a child class
- Use `@Override` (Java), `override` (C++/C#) to catch typos at compile time
- Use `super` (Java/Python/JS), `Parent::method()` (C++), or `base` (C#) to call the parent's version
- Overriding is resolved at **runtime** (dynamic dispatch)
- `final` methods (Java), non-virtual methods (C++), and `sealed` methods (C#) cannot be overridden
- C# requires `virtual` on the base method and `override` on the child method — both are mandatory
- Overriding ≠ overloading (different concepts)

Next: **Types of Inheritance** — single, multiple, multilevel, and hierarchical inheritance.
