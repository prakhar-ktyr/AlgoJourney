---
title: Polymorphism
---

# Polymorphism

**Polymorphism** is the third pillar of OOP. The word comes from Greek: **poly** (many) + **morph** (forms). It means that one interface can work with objects of many different types.

---

## What is Polymorphism?

Polymorphism allows you to write code that works with a **parent type** but automatically uses the correct **child type's** behaviour at runtime.

```cpp
Animal* myPet = new Dog();  // Pointer type is Animal*, object type is Dog
myPet->speak();              // Calls Dog's speak(), not Animal's!
```

```csharp
Animal myPet = new Dog();   // Variable type is Animal, object type is Dog
myPet.Speak();               // Calls Dog's Speak(), not Animal's!
```

```java
Animal myPet = new Dog();   // Variable type is Animal, object type is Dog
myPet.speak();               // Calls Dog's speak(), not Animal's!
```

```python
my_pet = Dog()    # Variable holds a Dog instance
my_pet.speak()    # Calls Dog's speak()
```

```javascript
const myPet = new Dog();  // Variable holds a Dog instance
myPet.speak();             // Calls Dog's speak()
```

This is powerful because you can write functions that accept `Animal` and they work with **any** subclass: `Dog`, `Cat`, `Bird`, etc.

---

## Two Types of Polymorphism

| Type | Also Called | When Resolved | Mechanism |
|------|------------|---------------|-----------|
| **Compile-time** | Static polymorphism | At compile time | Method overloading, operator overloading |
| **Runtime** | Dynamic polymorphism | At runtime | Method overriding, virtual methods |

---

## Compile-Time Polymorphism (Overloading)

The same method name works with **different parameter types**:

```cpp
#include <iostream>
#include <string>
using namespace std;

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }

    string add(string a, string b) {
        return a + b;
    }
};

int main() {
    Calculator calc;
    cout << calc.add(2, 3) << endl;             // 5 (int version)
    cout << calc.add(2.5, 3.7) << endl;         // 6.2 (double version)
    cout << calc.add("Hi"s, " there"s) << endl; // Hi there (string version)
}
```

```csharp
using System;

class Calculator {
    public int Add(int a, int b) {
        return a + b;
    }

    public double Add(double a, double b) {
        return a + b;
    }

    public string Add(string a, string b) {
        return a + b;
    }
}

Calculator calc = new Calculator();
Console.WriteLine(calc.Add(2, 3));           // 5 (int version)
Console.WriteLine(calc.Add(2.5, 3.7));       // 6.2 (double version)
Console.WriteLine(calc.Add("Hi", " there")); // Hi there (string version)
```

```java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }

    String add(String a, String b) {
        return a + b;
    }
}

Calculator calc = new Calculator();
System.out.println(calc.add(2, 3));         // 5 (int version)
System.out.println(calc.add(2.5, 3.7));     // 6.2 (double version)
System.out.println(calc.add("Hi", " there")); // Hi there (String version)
```

```python
# Python doesn't have traditional overloading — use dynamic typing
class Calculator:
    def add(self, a, b):
        return a + b  # Works for int, float, and str due to duck typing

calc = Calculator()
print(calc.add(2, 3))           # 5
print(calc.add(2.5, 3.7))      # 6.2
print(calc.add("Hi", " there")) # Hi there
```

```javascript
// JavaScript doesn't have traditional overloading — use dynamic typing
class Calculator {
    add(a, b) {
        return a + b;  // Works for numbers and strings
    }
}

const calc = new Calculator();
console.log(calc.add(2, 3));           // 5
console.log(calc.add(2.5, 3.7));      // 6.2
console.log(calc.add("Hi", " there")); // Hi there
```

The compiler (in C++/Java) decides which `add()` to call based on the argument types. This is resolved at **compile time**.

---

## Runtime Polymorphism (Overriding)

The same method call behaves differently depending on the **actual object type**:

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() {
        cout << "..." << endl;
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

class Duck : public Animal {
public:
    void speak() override {
        cout << "Quack!" << endl;
    }
};

int main() {
    Animal* animals[] = { new Dog(), new Cat(), new Duck() };

    for (Animal* a : animals) {
        a->speak();  // Decided at RUNTIME based on actual object type
    }
    // Woof!
    // Meow!
    // Quack!
}
```

```csharp
using System;

class Animal {
    public virtual void Speak() {
        Console.WriteLine("...");
    }
}

class Dog : Animal {
    public override void Speak() {
        Console.WriteLine("Woof!");
    }
}

class Cat : Animal {
    public override void Speak() {
        Console.WriteLine("Meow!");
    }
}

class Duck : Animal {
    public override void Speak() {
        Console.WriteLine("Quack!");
    }
}

Animal[] animals = { new Dog(), new Cat(), new Duck() };

foreach (Animal a in animals) {
    a.Speak();  // Decided at RUNTIME based on actual object type
}
// Woof!
// Meow!
// Quack!
```

```java
class Animal {
    void speak() {
        System.out.println("...");
    }
}

class Dog extends Animal {
    @Override
    void speak() {
        System.out.println("Woof!");
    }
}

class Cat extends Animal {
    @Override
    void speak() {
        System.out.println("Meow!");
    }
}

class Duck extends Animal {
    @Override
    void speak() {
        System.out.println("Quack!");
    }
}

// All stored as Animal references, but each calls its own speak()
Animal[] animals = { new Dog(), new Cat(), new Duck() };

for (Animal a : animals) {
    a.speak();  // Decided at RUNTIME based on actual object type
}
// Woof!
// Meow!
// Quack!
```

```python
class Animal:
    def speak(self):
        print("...")

class Dog(Animal):
    def speak(self):
        print("Woof!")

class Cat(Animal):
    def speak(self):
        print("Meow!")

class Duck(Animal):
    def speak(self):
        print("Quack!")

animals = [Dog(), Cat(), Duck()]

for animal in animals:
    animal.speak()
# Woof!
# Meow!
# Quack!
```

```javascript
class Animal {
    speak() {
        console.log("...");
    }
}

class Dog extends Animal {
    speak() {
        console.log("Woof!");
    }
}

class Cat extends Animal {
    speak() {
        console.log("Meow!");
    }
}

class Duck extends Animal {
    speak() {
        console.log("Quack!");
    }
}

const animals = [new Dog(), new Cat(), new Duck()];

for (const animal of animals) {
    animal.speak();  // Decided at RUNTIME based on actual object type
}
// Woof!
// Meow!
// Quack!
```

---

## Why Polymorphism Matters

### Without Polymorphism (Bad)

```cpp
// Must modify this function every time you add a new animal!
void makeAnimalSpeak(void* animal, const string& type) {
    if (type == "dog") {
        static_cast<Dog*>(animal)->bark();
    } else if (type == "cat") {
        static_cast<Cat*>(animal)->meow();
    }
}
```

```csharp
void MakeAnimalSpeak(object animal) {
    if (animal is Dog dog) {
        dog.Bark();
    } else if (animal is Cat cat) {
        cat.Meow();
    }
    // Must modify this method every time you add a new animal!
}
```

```java
void makeAnimalSpeak(Object animal) {
    if (animal instanceof Dog) {
        ((Dog) animal).bark();
    } else if (animal instanceof Cat) {
        ((Cat) animal).meow();
    }
    // Must modify this method every time you add a new animal!
}
```

```python
def make_animal_speak(animal):
    if isinstance(animal, Dog):
        animal.bark()
    elif isinstance(animal, Cat):
        animal.meow()
    # Must modify this function every time you add a new animal!
```

```javascript
function makeAnimalSpeak(animal) {
    if (animal instanceof Dog) {
        animal.bark();
    } else if (animal instanceof Cat) {
        animal.meow();
    }
    // Must modify this function every time you add a new animal!
}
```

### With Polymorphism (Good)

```cpp
void makeAnimalSpeak(Animal* animal) {
    animal->speak();  // Works for ANY Animal subclass — now and in the future
}
```

```csharp
void MakeAnimalSpeak(Animal animal) {
    animal.Speak();  // Works for ANY Animal subclass — now and in the future
}
```

```java
void makeAnimalSpeak(Animal animal) {
    animal.speak();  // Works for ANY Animal subclass — now and in the future
}
```

```python
def make_animal_speak(animal):
    animal.speak()  # Works for ANY Animal subclass — now and in the future
```

```javascript
function makeAnimalSpeak(animal) {
    animal.speak();  // Works for ANY Animal subclass — now and in the future
}
```

Adding a new animal (e.g., `Cow`) requires **zero changes** to `makeAnimalSpeak()`. You just create a new class that overrides `speak()`.

---

## Polymorphism with Collections

Store different types in a single collection:

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<Animal*> zoo = { new Dog(), new Cat(), new Duck() };

    for (Animal* animal : zoo) {
        animal->speak();  // Each speaks in its own way
    }
}
```

```csharp
using System;
using System.Collections.Generic;

List<Animal> zoo = new List<Animal> { new Dog(), new Cat(), new Duck() };

foreach (Animal animal in zoo) {
    animal.Speak();  // Each speaks in its own way
}
```

```java
import java.util.ArrayList;
import java.util.List;

List<Animal> zoo = new ArrayList<>();
zoo.add(new Dog());
zoo.add(new Cat());
zoo.add(new Duck());

for (Animal animal : zoo) {
    animal.speak();  // Each speaks in its own way
}
```

```python
zoo = [Dog(), Cat(), Duck()]

for animal in zoo:
    animal.speak()
```

```javascript
const zoo = [new Dog(), new Cat(), new Duck()];

for (const animal of zoo) {
    animal.speak();  // Each speaks in its own way
}
```

---

## Duck Typing (Python & JavaScript)

Python and JavaScript don't require inheritance for polymorphism. If an object has the method, it works — this is called **duck typing**:

> "If it walks like a duck and quacks like a duck, it's a duck."

```cpp
// C++ requires a common base class or templates for polymorphism
// Templates provide compile-time duck typing:
template <typename T>
void makeSpeak(T& thing) {
    thing.speak();  // Works for anything with a speak() method
}
```

```csharp
// C# requires a common type (interface or class) for polymorphism
interface ISpeakable {
    void Speak();
}

class Robot : ISpeakable {
    public void Speak() {
        Console.WriteLine("Beep boop!");
    }
}
```

```java
// Java requires a common type (interface or class) for polymorphism
interface Speakable {
    void speak();
}

class Robot implements Speakable {
    @Override
    public void speak() {
        System.out.println("Beep boop!");
    }
}
```

```python
# No common parent class needed!
class Dog:
    def speak(self):
        print("Woof!")

class Cat:
    def speak(self):
        print("Meow!")

class Robot:
    def speak(self):
        print("Beep boop!")

things = [Dog(), Cat(), Robot()]

for thing in things:
    thing.speak()
# Woof!
# Meow!
# Beep boop!
```

```javascript
// No common parent class needed!
class Dog {
    speak() {
        console.log("Woof!");
    }
}

class Cat {
    speak() {
        console.log("Meow!");
    }
}

class Robot {
    speak() {
        console.log("Beep boop!");
    }
}

const things = [new Dog(), new Cat(), new Robot()];

for (const thing of things) {
    thing.speak();
}
// Woof!
// Meow!
// Beep boop!
```

---

## Practical Example — Payment System

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Payment {
public:
    double amount;

    Payment(double amount) : amount(amount) {}

    virtual bool process() = 0;

    void printReceipt() {
        cout << "Processed payment of $" << amount << endl;
    }
};

class CreditCardPayment : public Payment {
    string cardNumber;
public:
    CreditCardPayment(double amount, string cardNumber)
        : Payment(amount), cardNumber(cardNumber) {}

    bool process() override {
        cout << "Processing credit card ending in "
             << cardNumber.substr(cardNumber.length() - 4) << endl;
        return true;
    }
};

class PayPalPayment : public Payment {
    string email;
public:
    PayPalPayment(double amount, string email)
        : Payment(amount), email(email) {}

    bool process() override {
        cout << "Processing PayPal payment for " << email << endl;
        return true;
    }
};

int main() {
    vector<Payment*> payments = {
        new CreditCardPayment(100, "4111111111111111"),
        new PayPalPayment(50, "user@example.com")
    };

    for (Payment* p : payments) {
        if (p->process()) {
            p->printReceipt();
        }
    }
}
```

```csharp
using System;
using System.Collections.Generic;

abstract class Payment {
    public double Amount;

    public Payment(double amount) {
        Amount = amount;
    }

    public abstract bool Process();

    public void PrintReceipt() {
        Console.WriteLine($"Processed payment of ${Amount}");
    }
}

class CreditCardPayment : Payment {
    private string cardNumber;

    public CreditCardPayment(double amount, string cardNumber) : base(amount) {
        this.cardNumber = cardNumber;
    }

    public override bool Process() {
        Console.WriteLine($"Processing credit card ending in {cardNumber[^4..]}");
        return true;
    }
}

class PayPalPayment : Payment {
    private string email;

    public PayPalPayment(double amount, string email) : base(amount) {
        this.email = email;
    }

    public override bool Process() {
        Console.WriteLine($"Processing PayPal payment for {email}");
        return true;
    }
}

List<Payment> payments = new() {
    new CreditCardPayment(100, "4111111111111111"),
    new PayPalPayment(50, "user@example.com")
};

foreach (Payment p in payments) {
    if (p.Process()) {
        p.PrintReceipt();
    }
}
```

```java
abstract class Payment {
    double amount;

    Payment(double amount) {
        this.amount = amount;
    }

    abstract boolean process();

    void printReceipt() {
        System.out.println("Processed payment of $" + amount);
    }
}

class CreditCardPayment extends Payment {
    String cardNumber;

    CreditCardPayment(double amount, String cardNumber) {
        super(amount);
        this.cardNumber = cardNumber;
    }

    @Override
    boolean process() {
        System.out.println("Processing credit card ending in "
            + cardNumber.substring(cardNumber.length() - 4));
        return true;
    }
}

class PayPalPayment extends Payment {
    String email;

    PayPalPayment(double amount, String email) {
        super(amount);
        this.email = email;
    }

    @Override
    boolean process() {
        System.out.println("Processing PayPal payment for " + email);
        return true;
    }
}

// Usage — same code handles ALL payment types
Payment[] payments = {
    new CreditCardPayment(100, "4111111111111111"),
    new PayPalPayment(50, "user@example.com")
};

for (Payment p : payments) {
    if (p.process()) {
        p.printReceipt();
    }
}
```

```python
from abc import ABC, abstractmethod

class Payment(ABC):
    def __init__(self, amount):
        self.amount = amount

    @abstractmethod
    def process(self):
        pass

    def print_receipt(self):
        print(f"Processed payment of ${self.amount}")

class CreditCardPayment(Payment):
    def __init__(self, amount, card_number):
        super().__init__(amount)
        self.card_number = card_number

    def process(self):
        print(f"Processing credit card ending in {self.card_number[-4:]}")
        return True

class PayPalPayment(Payment):
    def __init__(self, amount, email):
        super().__init__(amount)
        self.email = email

    def process(self):
        print(f"Processing PayPal payment for {self.email}")
        return True

# Usage — same code handles ALL payment types
payments = [
    CreditCardPayment(100, "4111111111111111"),
    PayPalPayment(50, "user@example.com")
]

for p in payments:
    if p.process():
        p.print_receipt()
```

```javascript
class Payment {
    constructor(amount) {
        this.amount = amount;
    }

    process() {
        throw new Error("process() must be implemented");
    }

    printReceipt() {
        console.log(`Processed payment of $${this.amount}`);
    }
}

class CreditCardPayment extends Payment {
    constructor(amount, cardNumber) {
        super(amount);
        this.cardNumber = cardNumber;
    }

    process() {
        console.log(`Processing credit card ending in ${this.cardNumber.slice(-4)}`);
        return true;
    }
}

class PayPalPayment extends Payment {
    constructor(amount, email) {
        super(amount);
        this.email = email;
    }

    process() {
        console.log(`Processing PayPal payment for ${this.email}`);
        return true;
    }
}

// Usage — same code handles ALL payment types
const payments = [
    new CreditCardPayment(100, "4111111111111111"),
    new PayPalPayment(50, "user@example.com")
];

for (const p of payments) {
    if (p.process()) {
        p.printReceipt();
    }
}
```

---

## Key Takeaways

- **Polymorphism** = one interface, many implementations
- **Compile-time**: method overloading (same name, different parameters) — C++ and Java
- **Runtime**: method overriding (same method, different classes) — all languages
- Polymorphism lets you write **flexible, extensible** code
- New subclasses work with existing code without modifications
- Python and JavaScript use **duck typing** — no inheritance required for polymorphism

Next: **Abstraction** — the fourth and final pillar of OOP.
