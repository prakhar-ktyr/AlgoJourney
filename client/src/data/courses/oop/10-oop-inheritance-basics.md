---
title: Inheritance Basics
---

# Inheritance Basics

**Inheritance** is the second pillar of OOP. It allows you to create a new class that **reuses**, **extends**, or **modifies** the behaviour of an existing class.

---

## What is Inheritance?

Inheritance creates a **parent–child** relationship between classes:

- The **parent class** (also called **superclass** or **base class**) provides common attributes and methods
- The **child class** (also called **subclass** or **derived class**) inherits everything from the parent and can add or change behaviour

```
        ┌──────────┐
        │  Animal   │  ← Parent (superclass)
        │ ──────── │
        │ name      │
        │ age       │
        │ eat()     │
        │ sleep()   │
        └─────┬────┘
              │ inherits
    ┌─────────┴─────────┐
    │                     │
┌───┴────┐         ┌─────┴───┐
│  Dog   │         │   Cat   │  ← Children (subclasses)
│ ────── │         │ ─────── │
│ breed  │         │ indoor  │
│ bark() │         │ purr()  │
└────────┘         └─────────┘
```

`Dog` and `Cat` inherit `name`, `age`, `eat()`, and `sleep()` from `Animal`. They also add their own unique attributes and methods.

---

## Basic Syntax

```cpp
#include <iostream>
#include <string>
using namespace std;

// Parent class
class Animal {
public:
    string name;
    int age;

    void eat() {
        cout << name << " is eating" << endl;
    }

    void sleep() {
        cout << name << " is sleeping" << endl;
    }
};

// Child class
class Dog : public Animal {
public:
    string breed;

    void bark() {
        cout << name << " says: Woof!" << endl;
    }
};
```

```csharp
using System;

// Parent class
class Animal
{
    public string Name;
    public int Age;

    public void Eat()
    {
        Console.WriteLine($"{Name} is eating");
    }

    public void Sleep()
    {
        Console.WriteLine($"{Name} is sleeping");
    }
}

// Child class
class Dog : Animal
{
    public string Breed;

    public void Bark()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
}
```

```java
// Parent class
public class Animal {
    String name;
    int age;

    void eat() {
        System.out.println(name + " is eating");
    }

    void sleep() {
        System.out.println(name + " is sleeping");
    }
}

// Child class
public class Dog extends Animal {
    String breed;

    void bark() {
        System.out.println(name + " says: Woof!");
    }
}
```

```python
# Parent class
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def eat(self):
        print(f"{self.name} is eating")

    def sleep(self):
        print(f"{self.name} is sleeping")

# Child class
class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)  # Call parent constructor
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")
```

```javascript
// Parent class
class Animal {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    eat() {
        console.log(`${this.name} is eating`);
    }

    sleep() {
        console.log(`${this.name} is sleeping`);
    }
}

// Child class
class Dog extends Animal {
    constructor(name, age, breed) {
        super(name, age);  // Call parent constructor
        this.breed = breed;
    }

    bark() {
        console.log(`${this.name} says: Woof!`);
    }
}
```

---

## Using Inherited Members

The child class can use everything from the parent:

```cpp
int main() {
    Dog rex;
    rex.name = "Rex";       // Inherited from Animal
    rex.age = 3;            // Inherited from Animal
    rex.breed = "Labrador"; // Defined in Dog

    rex.eat();   // Rex is eating  (inherited method)
    rex.sleep(); // Rex is sleeping (inherited method)
    rex.bark();  // Rex says: Woof! (Dog's own method)
    return 0;
}
```

```csharp
Dog rex = new Dog();
rex.Name = "Rex";         // Inherited from Animal
rex.Age = 3;              // Inherited from Animal
rex.Breed = "Labrador";   // Defined in Dog

rex.Eat();    // Rex is eating  (inherited method)
rex.Sleep();  // Rex is sleeping (inherited method)
rex.Bark();   // Rex says: Woof! (Dog's own method)
```

```java
public class Main {
    public static void main(String[] args) {
        Dog rex = new Dog();
        rex.name = "Rex";       // Inherited from Animal
        rex.age = 3;            // Inherited from Animal
        rex.breed = "Labrador"; // Defined in Dog

        rex.eat();   // Rex is eating  (inherited method)
        rex.sleep(); // Rex is sleeping (inherited method)
        rex.bark();  // Rex says: Woof! (Dog's own method)
    }
}
```

```python
rex = Dog("Rex", 3, "Labrador")
rex.eat()    # Rex is eating  (inherited)
rex.sleep()  # Rex is sleeping (inherited)
rex.bark()   # Rex says: Woof! (own method)
```

```javascript
const rex = new Dog("Rex", 3, "Labrador");
rex.eat();    // Rex is eating  (inherited)
rex.sleep();  // Rex is sleeping (inherited)
rex.bark();   // Rex says: Woof! (own method)
```

---

## The "is-a" Relationship

Inheritance models an **is-a** relationship:

- A `Dog` **is an** `Animal` ✅
- A `Car` **is a** `Vehicle` ✅
- A `Student` **is a** `Person` ✅
- A `Dog` **is a** `Car` ❌ (doesn't make sense!)

If the "is-a" test fails, don't use inheritance. Use composition instead (covered later).

---

## Calling the Parent Constructor

Child classes should call the parent's constructor to initialize inherited attributes:

```cpp
class Animal {
public:
    string name;
    int age;

    Animal(string name, int age) {
        this->name = name;
        this->age = age;
    }
};

class Dog : public Animal {
public:
    string breed;

    Dog(string name, int age, string breed)
        : Animal(name, age) {    // Call parent constructor
        this->breed = breed;
    }
};

int main() {
    Dog rex("Rex", 3, "Labrador");
    return 0;
}
```

```csharp
class Animal
{
    public string Name;
    public int Age;

    public Animal(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

class Dog : Animal
{
    public string Breed;

    public Dog(string name, int age, string breed)
        : base(name, age)    // Call parent constructor
    {
        Breed = breed;
    }
}

Dog rex = new Dog("Rex", 3, "Labrador");
```

```java
public class Animal {
    String name;
    int age;

    Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

public class Dog extends Animal {
    String breed;

    Dog(String name, int age, String breed) {
        super(name, age);     // Must be the first line!
        this.breed = breed;
    }
}

Dog rex = new Dog("Rex", 3, "Labrador");
```

```python
class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)  # Initialize parent attributes
        self.breed = breed

rex = Dog("Rex", 3, "Labrador")
```

```javascript
class Dog extends Animal {
    constructor(name, age, breed) {
        super(name, age);  // Must be called before using 'this'
        this.breed = breed;
    }
}

const rex = new Dog("Rex", 3, "Labrador");
```

---

## What Gets Inherited?

| Member | Inherited? |
|--------|-----------|
| `public` attributes | ✅ Yes |
| `public` methods | ✅ Yes |
| `protected` attributes/methods | ✅ Yes (accessible in subclass) |
| `private` attributes/methods | ❌ No (not directly accessible) |
| Constructors | ❌ No (but can be called with `super`) |

```cpp
class Animal {
public:
    string name;        // ✅ Inherited
protected:
    int age;            // ✅ Inherited (accessible in subclass)
private:
    string dna;         // ❌ NOT inherited (not accessible)

public:
    void eat() { }      // ✅ Inherited
private:
    void digest() { }   // ❌ NOT inherited
};
```

```csharp
class Animal
{
    public string Name;        // ✅ Inherited
    protected int Age;         // ✅ Inherited (accessible in subclass)
    private string dna;        // ❌ NOT inherited (not accessible)

    public void Eat() { }      // ✅ Inherited
    private void Digest() { }  // ❌ NOT inherited
}
```

```java
public class Animal {
    public String name;      // ✅ Inherited
    protected int age;       // ✅ Inherited (accessible in subclass)
    private String dna;      // ❌ NOT inherited (not accessible)

    public void eat() { }    // ✅ Inherited
    private void digest() {} // ❌ NOT inherited
}
```

```python
class Animal:
    def __init__(self, name, age, dna):
        self.name = name        # ✅ Inherited (public)
        self._age = age         # ✅ Inherited (protected by convention)
        self.__dna = dna        # ❌ NOT easily inherited (name mangled)

    def eat(self):              # ✅ Inherited
        pass

    def __digest(self):         # ❌ NOT easily inherited
        pass
```

```javascript
class Animal {
    #dna;  // ❌ NOT inherited (truly private)

    constructor(name, age, dna) {
        this.name = name;    // ✅ Inherited (public)
        this._age = age;     // ✅ Inherited (protected by convention)
        this.#dna = dna;     // Private to Animal only
    }

    eat() { }               // ✅ Inherited

    #digest() { }           // ❌ NOT inherited (private)
}
```

---

## Practical Example — Shape Hierarchy

```cpp
#include <iostream>
#include <string>
#include <cmath>
using namespace std;

class Shape {
public:
    string colour;

    Shape(string colour) : colour(colour) {}

    void describe() {
        cout << "A " << colour << " shape" << endl;
    }
};

class Circle : public Shape {
public:
    double radius;

    Circle(string colour, double radius)
        : Shape(colour), radius(radius) {}

    double area() {
        return 3.14159 * radius * radius;
    }
};

class Rectangle : public Shape {
public:
    double width;
    double height;

    Rectangle(string colour, double width, double height)
        : Shape(colour), width(width), height(height) {}

    double area() {
        return width * height;
    }
};

int main() {
    Circle c("Red", 5);
    c.describe();   // A Red shape (inherited)
    cout << "Area: " << c.area() << endl;  // Area: 78.5398

    Rectangle r("Blue", 4, 6);
    r.describe();   // A Blue shape (inherited)
    cout << "Area: " << r.area() << endl;  // Area: 24
    return 0;
}
```

```csharp
using System;

class Shape
{
    public string Colour;

    public Shape(string colour)
    {
        Colour = colour;
    }

    public void Describe()
    {
        Console.WriteLine($"A {Colour} shape");
    }
}

class Circle : Shape
{
    public double Radius;

    public Circle(string colour, double radius)
        : base(colour)
    {
        Radius = radius;
    }

    public double Area()
    {
        return Math.PI * Radius * Radius;
    }
}

class Rectangle : Shape
{
    public double Width;
    public double Height;

    public Rectangle(string colour, double width, double height)
        : base(colour)
    {
        Width = width;
        Height = height;
    }

    public double Area()
    {
        return Width * Height;
    }
}

class Program
{
    static void Main()
    {
        Circle c = new Circle("Red", 5);
        c.Describe();   // A Red shape (inherited)
        Console.WriteLine($"Area: {c.Area()}");  // Area: 78.53...

        Rectangle r = new Rectangle("Blue", 4, 6);
        r.Describe();   // A Blue shape (inherited)
        Console.WriteLine($"Area: {r.Area()}");  // Area: 24
    }
}
```

```java
public class Shape {
    String colour;

    Shape(String colour) {
        this.colour = colour;
    }

    void describe() {
        System.out.println("A " + colour + " shape");
    }
}

public class Circle extends Shape {
    double radius;

    Circle(String colour, double radius) {
        super(colour);
        this.radius = radius;
    }

    double area() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle extends Shape {
    double width;
    double height;

    Rectangle(String colour, double width, double height) {
        super(colour);
        this.width = width;
        this.height = height;
    }

    double area() {
        return width * height;
    }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle("Red", 5);
        c.describe();   // A Red shape (inherited)
        System.out.println("Area: " + c.area());  // Area: 78.53...

        Rectangle r = new Rectangle("Blue", 4, 6);
        r.describe();   // A Blue shape (inherited)
        System.out.println("Area: " + r.area());  // Area: 24.0
    }
}
```

```python
import math

class Shape:
    def __init__(self, colour):
        self.colour = colour

    def describe(self):
        print(f"A {self.colour} shape")

class Circle(Shape):
    def __init__(self, colour, radius):
        super().__init__(colour)
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, colour, width, height):
        super().__init__(colour)
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

c = Circle("Red", 5)
c.describe()   # A Red shape (inherited)
print(f"Area: {c.area()}")  # Area: 78.53...

r = Rectangle("Blue", 4, 6)
r.describe()   # A Blue shape (inherited)
print(f"Area: {r.area()}")  # Area: 24
```

```javascript
class Shape {
    constructor(colour) {
        this.colour = colour;
    }

    describe() {
        console.log(`A ${this.colour} shape`);
    }
}

class Circle extends Shape {
    constructor(colour, radius) {
        super(colour);
        this.radius = radius;
    }

    area() {
        return Math.PI * this.radius ** 2;
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
}

const c = new Circle("Red", 5);
c.describe();   // A Red shape (inherited)
console.log(`Area: ${c.area()}`);  // Area: 78.53...

const r = new Rectangle("Blue", 4, 6);
r.describe();   // A Blue shape (inherited)
console.log(`Area: ${r.area()}`);  // Area: 24
```

---

## Multi-Level Inheritance

Inheritance can go multiple levels deep:

```cpp
class Animal {
public:
    void breathe() {
        cout << "Breathing..." << endl;
    }
};

class Mammal : public Animal {
public:
    void feedMilk() {
        cout << "Feeding milk..." << endl;
    }
};

class Dog : public Mammal {
public:
    void bark() {
        cout << "Woof!" << endl;
    }
};

int main() {
    Dog d;
    d.breathe();    // From Animal
    d.feedMilk();   // From Mammal
    d.bark();       // From Dog
    return 0;
}
```

```csharp
using System;

class Animal
{
    public void Breathe()
    {
        Console.WriteLine("Breathing...");
    }
}

class Mammal : Animal
{
    public void FeedMilk()
    {
        Console.WriteLine("Feeding milk...");
    }
}

class Dog : Mammal
{
    public void Bark()
    {
        Console.WriteLine("Woof!");
    }
}

class Program
{
    static void Main()
    {
        Dog d = new Dog();
        d.Breathe();    // From Animal
        d.FeedMilk();   // From Mammal
        d.Bark();       // From Dog
    }
}
```

```java
class Animal {
    void breathe() {
        System.out.println("Breathing...");
    }
}

class Mammal extends Animal {
    void feedMilk() {
        System.out.println("Feeding milk...");
    }
}

class Dog extends Mammal {
    void bark() {
        System.out.println("Woof!");
    }
}

Dog d = new Dog();
d.breathe();    // From Animal
d.feedMilk();   // From Mammal
d.bark();       // From Dog
```

```python
class Animal:
    def breathe(self):
        print("Breathing...")

class Mammal(Animal):
    def feed_milk(self):
        print("Feeding milk...")

class Dog(Mammal):
    def bark(self):
        print("Woof!")

d = Dog()
d.breathe()     # From Animal
d.feed_milk()   # From Mammal
d.bark()        # From Dog
```

```javascript
class Animal {
    breathe() {
        console.log("Breathing...");
    }
}

class Mammal extends Animal {
    feedMilk() {
        console.log("Feeding milk...");
    }
}

class Dog extends Mammal {
    bark() {
        console.log("Woof!");
    }
}

const d = new Dog();
d.breathe();    // From Animal
d.feedMilk();   // From Mammal
d.bark();       // From Dog
```

```
Animal → Mammal → Dog
```

Each level adds its own behaviour while inheriting everything from above.

---

## Common Mistakes

| Mistake | Problem |
|---------|---------|
| Forgetting `super()` | Parent attributes not initialized |
| Inheriting when "is-a" doesn't apply | Wrong abstraction, tight coupling |
| Too many inheritance levels | Hard to understand and debug |
| Inheriting just to reuse code | Use composition instead |

---

## Prototypal Inheritance (JavaScript)

JavaScript uses **prototype chains**, not classical inheritance. The `class` syntax is syntactic sugar over prototypes.

**Under the hood with `Object.create()`:**

```javascript
// Prototypal inheritance without class syntax
const animal = {
  eat() { console.log(`${this.name} is eating`); },
  sleep() { console.log(`${this.name} is sleeping`); }
};

// Create dog that inherits from animal
const dog = Object.create(animal);
dog.bark = function() { console.log(`${this.name} says: Woof!`); };

const rex = Object.create(dog);
rex.name = "Rex";
rex.eat();   // Rex is eating  (found on animal prototype)
rex.bark();  // Rex says: Woof! (found on dog prototype)
```

**How `class extends` maps to prototypes:**

```javascript
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(`${this.name} is eating`); }
}

class Dog extends Animal {
  bark() { console.log(`${this.name} says: Woof!`); }
}

// Verify the prototype chain
const rex = new Dog("Rex");
console.log(Object.getPrototypeOf(rex) === Dog.prototype);           // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true
console.log(rex instanceof Animal);  // true — walks the chain
```

The `extends` keyword sets `Dog.prototype.__proto__ = Animal.prototype`, creating the same chain `Object.create()` would.

---

## Key Takeaways

- Inheritance creates a **parent–child** relationship
- The child **inherits** all public/protected members from the parent
- Use `: public Parent` (C++), `extends` (Java/JS), or `class Child(Parent)` (Python)
- Call the parent constructor with `super()` to initialize inherited state
- Inheritance models an **is-a** relationship
- `private` members are **not** inherited (not directly accessible)
- Inheritance can be multi-level: `A → B → C`

Next: **Inheritance in Depth** — method overriding, the `super` keyword, and more.
