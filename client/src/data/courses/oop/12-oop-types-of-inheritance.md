---
title: Types of Inheritance
---

# Types of Inheritance

Inheritance comes in several forms. Understanding the differences helps you choose the right structure for your class hierarchy.

---

## The Five Types

| Type | Structure | C++ | Java | Python | JavaScript |
|------|-----------|-----|------|--------|------------|
| **Single** | A → B | ✅ | ✅ | ✅ | ✅ |
| **Multilevel** | A → B → C | ✅ | ✅ | ✅ | ✅ |
| **Hierarchical** | A → B, A → C | ✅ | ✅ | ✅ | ✅ |
| **Multiple** | A, B → C | ✅ | ❌ (use interfaces) | ✅ | ❌ (use mixins) |
| **Hybrid** | Combination of above | ✅ | ❌ (use interfaces) | ✅ | ❌ (use mixins) |

---

## 1. Single Inheritance

One parent, one child. The simplest form.

```
  Animal
    │
    ▼
   Dog
```

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    void eat() {
        cout << "Eating..." << endl;
    }
};

class Dog : public Animal {
public:
    void bark() {
        cout << "Woof!" << endl;
    }
};

int main() {
    Dog d;
    d.eat();   // Inherited
    d.bark();  // Own method
}
```

```csharp
using System;

class Animal {
    public void Eat() {
        Console.WriteLine("Eating...");
    }
}

class Dog : Animal {
    public void Bark() {
        Console.WriteLine("Woof!");
    }
}

Dog d = new Dog();
d.Eat();   // Inherited
d.Bark();  // Own method
```

```java
class Animal {
    void eat() {
        System.out.println("Eating...");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Woof!");
    }
}

Dog d = new Dog();
d.eat();   // Inherited
d.bark();  // Own method
```

```python
class Animal:
    def eat(self):
        print("Eating...")

class Dog(Animal):
    def bark(self):
        print("Woof!")

d = Dog()
d.eat()   # Inherited
d.bark()  # Own method
```

```javascript
class Animal {
    eat() {
        console.log("Eating...");
    }
}

class Dog extends Animal {
    bark() {
        console.log("Woof!");
    }
}

const d = new Dog();
d.eat();   // Inherited
d.bark();  // Own method
```

---

## 2. Multilevel Inheritance

A chain of inheritance: grandparent → parent → child.

```
  Animal
    │
    ▼
  Mammal
    │
    ▼
   Dog
```

```cpp
#include <iostream>
using namespace std;

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
    d.breathe();   // From Animal (grandparent)
    d.feedMilk();  // From Mammal (parent)
    d.bark();      // Own method
}
```

```csharp
using System;

class Animal {
    public void Breathe() {
        Console.WriteLine("Breathing...");
    }
}

class Mammal : Animal {
    public void FeedMilk() {
        Console.WriteLine("Feeding milk...");
    }
}

class Dog : Mammal {
    public void Bark() {
        Console.WriteLine("Woof!");
    }
}

Dog d = new Dog();
d.Breathe();   // From Animal (grandparent)
d.FeedMilk();  // From Mammal (parent)
d.Bark();      // Own method
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
d.breathe();   // From Animal (grandparent)
d.feedMilk();  // From Mammal (parent)
d.bark();      // Own method
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
d.breathe()    # From Animal (grandparent)
d.feed_milk()  # From Mammal (parent)
d.bark()       # Own method
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
d.breathe();   // From Animal (grandparent)
d.feedMilk();  // From Mammal (parent)
d.bark();      // Own method
```

Each class in the chain inherits from all classes above it.

---

## 3. Hierarchical Inheritance

One parent, multiple children.

```
       Animal
      /      \
     ▼        ▼
   Dog       Cat
```

```cpp
#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
    string name;

    Animal(string name) : name(name) {}

    void eat() {
        cout << name << " is eating" << endl;
    }
};

class Dog : public Animal {
public:
    Dog(string name) : Animal(name) {}

    void bark() {
        cout << name << " says: Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string name) : Animal(name) {}

    void purr() {
        cout << name << " says: Purr..." << endl;
    }
};

int main() {
    Dog d("Rex");
    Cat c("Whiskers");

    d.eat();   // Rex is eating
    d.bark();  // Rex says: Woof!

    c.eat();   // Whiskers is eating
    c.purr();  // Whiskers says: Purr...
}
```

```csharp
using System;

class Animal {
    public string Name;

    public Animal(string name) {
        Name = name;
    }

    public void Eat() {
        Console.WriteLine($"{Name} is eating");
    }
}

class Dog : Animal {
    public Dog(string name) : base(name) {}

    public void Bark() {
        Console.WriteLine($"{Name} says: Woof!");
    }
}

class Cat : Animal {
    public Cat(string name) : base(name) {}

    public void Purr() {
        Console.WriteLine($"{Name} says: Purr...");
    }
}

Dog d = new Dog("Rex");
Cat c = new Cat("Whiskers");

d.Eat();   // Rex is eating
d.Bark();  // Rex says: Woof!

c.Eat();   // Whiskers is eating
c.Purr();  // Whiskers says: Purr...
```

```java
class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    void eat() {
        System.out.println(name + " is eating");
    }
}

class Dog extends Animal {
    Dog(String name) { super(name); }

    void bark() {
        System.out.println(name + " says: Woof!");
    }
}

class Cat extends Animal {
    Cat(String name) { super(name); }

    void purr() {
        System.out.println(name + " says: Purr...");
    }
}

Dog d = new Dog("Rex");
Cat c = new Cat("Whiskers");

d.eat();   // Rex is eating
d.bark();  // Rex says: Woof!

c.eat();   // Whiskers is eating
c.purr();  // Whiskers says: Purr...
```

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(f"{self.name} is eating")

class Dog(Animal):
    def bark(self):
        print(f"{self.name} says: Woof!")

class Cat(Animal):
    def purr(self):
        print(f"{self.name} says: Purr...")

d = Dog("Rex")
c = Cat("Whiskers")

d.eat()   # Rex is eating
d.bark()  # Rex says: Woof!

c.eat()   # Whiskers is eating
c.purr()  # Whiskers says: Purr...
```

```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }

    eat() {
        console.log(`${this.name} is eating`);
    }
}

class Dog extends Animal {
    bark() {
        console.log(`${this.name} says: Woof!`);
    }
}

class Cat extends Animal {
    purr() {
        console.log(`${this.name} says: Purr...`);
    }
}

const d = new Dog("Rex");
const c = new Cat("Whiskers");

d.eat();   // Rex is eating
d.bark();  // Rex says: Woof!

c.eat();   // Whiskers is eating
c.purr();  // Whiskers says: Purr...
```

`Dog` and `Cat` share `Animal`'s code but have their own unique methods.

---

## 4. Multiple Inheritance

A child inherits from **two or more** parents.

```
  Flyable    Swimmable
      \       /
       ▼     ▼
        Duck
```

```cpp
#include <iostream>
using namespace std;

// C++ supports multiple inheritance directly
class Flyable {
public:
    void fly() {
        cout << "Flying!" << endl;
    }
};

class Swimmable {
public:
    void swim() {
        cout << "Swimming!" << endl;
    }
};

class Duck : public Flyable, public Swimmable {
public:
    void quack() {
        cout << "Quack!" << endl;
    }
};

int main() {
    Duck d;
    d.fly();    // Flying!
    d.swim();   // Swimming!
    d.quack();  // Quack!
}
```

```csharp
using System;

// C# does not support multiple class inheritance — use interfaces
interface IFlyable {
    void Fly();
}

interface ISwimmable {
    void Swim();
}

class Duck : IFlyable, ISwimmable {
    public void Fly() {
        Console.WriteLine("Flying!");
    }

    public void Swim() {
        Console.WriteLine("Swimming!");
    }

    public void Quack() {
        Console.WriteLine("Quack!");
    }
}

Duck d = new Duck();
d.Fly();    // Flying!
d.Swim();   // Swimming!
d.Quack();  // Quack!
```

```java
// Java does NOT support multiple class inheritance — use interfaces
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("Flying!");
    }

    @Override
    public void swim() {
        System.out.println("Swimming!");
    }

    public void quack() {
        System.out.println("Quack!");
    }
}
```

```python
# Python supports multiple inheritance directly
class Flyable:
    def fly(self):
        print("Flying!")

class Swimmable:
    def swim(self):
        print("Swimming!")

class Duck(Flyable, Swimmable):
    def quack(self):
        print("Quack!")

d = Duck()
d.fly()    # Flying!
d.swim()   # Swimming!
d.quack()  # Quack!
```

```javascript
// JavaScript doesn't support multiple inheritance directly — use mixins
const Flyable = (Base) => class extends Base {
    fly() {
        console.log("Flying!");
    }
};

const Swimmable = (Base) => class extends Base {
    swim() {
        console.log("Swimming!");
    }
};

class Animal {}

class Duck extends Swimmable(Flyable(Animal)) {
    quack() {
        console.log("Quack!");
    }
}

const d = new Duck();
d.fly();    // Flying!
d.swim();   // Swimming!
d.quack();  // Quack!
```

---

## 5. The Diamond Problem

Multiple inheritance creates a problem when two parents share a common grandparent:

```
      Animal
      /    \
     ▼      ▼
  Flyable  Swimmable
      \    /
       ▼  ▼
       Duck
```

If both `Flyable` and `Swimmable` inherit `eat()` from `Animal`, which version does `Duck` get?

### C++ Solution: Virtual Inheritance

```cpp
#include <iostream>
using namespace std;

class Animal {
public:
    virtual void eat() {
        cout << "Animal eating" << endl;
    }
};

// Use virtual inheritance to solve the diamond problem
class Flyable : virtual public Animal {
public:
    void eat() override {
        cout << "Flyable eating" << endl;
    }
};

class Swimmable : virtual public Animal {
public:
    void eat() override {
        cout << "Swimmable eating" << endl;
    }
};

class Duck : public Flyable, public Swimmable {
public:
    void eat() override {
        Flyable::eat();  // Explicitly choose which version
    }
};
```

```csharp
using System;

// C# avoids the diamond problem by prohibiting multiple class inheritance.
// Interfaces with default methods (C# 8+) can create a similar situation:
interface IFlyable {
    void Eat() {
        Console.WriteLine("Flyable eating");
    }
}

interface ISwimmable {
    void Eat() {
        Console.WriteLine("Swimmable eating");
    }
}

class Duck : IFlyable, ISwimmable {
    // Must explicitly implement both or provide own version
    void IFlyable.Eat() {
        Console.WriteLine("Flyable eating");
    }

    void ISwimmable.Eat() {
        Console.WriteLine("Swimmable eating");
    }

    public void Eat() {
        ((IFlyable)this).Eat();  // Choose Flyable's version
    }
}
```

```java
// Java avoids the diamond problem by prohibiting multiple class inheritance.
// Interfaces with default methods can create a similar situation:
interface Flyable {
    default void eat() {
        System.out.println("Flyable eating");
    }
}

interface Swimmable {
    default void eat() {
        System.out.println("Swimmable eating");
    }
}

class Duck implements Flyable, Swimmable {
    @Override
    public void eat() {
        // Must explicitly choose or provide own implementation
        Flyable.super.eat();  // Choose Flyable's version
    }
}
```

```python
# Python resolves this using MRO (Method Resolution Order)
class Animal:
    def eat(self):
        print("Animal eating")

class Flyable(Animal):
    def eat(self):
        print("Flyable eating")

class Swimmable(Animal):
    def eat(self):
        print("Swimmable eating")

class Duck(Flyable, Swimmable):
    pass

d = Duck()
d.eat()  # Flyable eating (first parent listed wins)

# View the MRO:
print(Duck.__mro__)
# (Duck, Flyable, Swimmable, Animal, object)
```

```javascript
// JavaScript avoids the diamond problem since it only has single inheritance.
// With mixins, order determines precedence (last mixin wins):
const Flyable = (Base) => class extends Base {
    eat() {
        console.log("Flyable eating");
    }
};

const Swimmable = (Base) => class extends Base {
    eat() {
        console.log("Swimmable eating");
    }
};

class Animal {
    eat() {
        console.log("Animal eating");
    }
}

// Swimmable is applied last, so its eat() wins
class Duck extends Swimmable(Flyable(Animal)) {}

const d = new Duck();
d.eat();  // Swimmable eating
```

Python uses the **C3 Linearization** algorithm to determine MRO. The order follows:
1. The class itself
2. Parents from left to right
3. Grandparents

---

## When to Use Each Type

| Type | Use When |
|------|----------|
| Single | Simple parent–child relationships |
| Multilevel | Natural hierarchies (Animal → Mammal → Dog) |
| Hierarchical | Shared base with specialized children |
| Multiple | Object needs capabilities from different sources (prefer interfaces in Java, mixins in JS) |

---

## Method Resolution Order — MRO (Python)

Python supports multiple inheritance and resolves method lookup order using the **C3 linearization** algorithm:

```python
class A:
    def greet(self):
        print("A")

class B(A):
    def greet(self):
        print("B")
        super().greet()

class C(A):
    def greet(self):
        print("C")
        super().greet()

class D(B, C):
    def greet(self):
        print("D")
        super().greet()

# View the MRO
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)

D().greet()
# D → B → C → A (each class appears only once, diamond resolved)

# You can also use .mro() method
print(D.mro())  # Same result as a list
```

C3 linearization guarantees:
1. Children come before parents
2. Left parents come before right parents
3. Each class appears exactly once

Using `super()` cooperatively ensures every class in the MRO chain is called exactly once — even in diamond hierarchies.

---

## Key Takeaways

- **Single**: one parent → one child
- **Multilevel**: chain of inheritance (A → B → C)
- **Hierarchical**: one parent → many children
- **Multiple**: many parents → one child (C++/Python yes, Java/JS no — use interfaces/mixins)
- The **Diamond Problem** arises when multiple parents share a common ancestor
- C++ solves it with **virtual inheritance**; Python uses **MRO**; Java avoids it by prohibiting multiple class inheritance
- When in doubt, prefer **interfaces** (Java), **mixins** (JS), or **composition** over complex inheritance

Next: **Polymorphism** — using objects of different types through a common interface.
