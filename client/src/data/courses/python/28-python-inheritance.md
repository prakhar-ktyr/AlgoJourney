---
title: Python Inheritance
---

# Python Inheritance

**Inheritance** lets a class reuse the attributes and methods of another class. The new class is a **subclass** (or _child class_); the one it inherits from is the **base class** (or _parent / superclass_).

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound."


class Dog(Animal):
    def speak(self):
        return f"{self.name} barks."


class Cat(Animal):
    def speak(self):
        return f"{self.name} meows."


d = Dog("Rex")
c = Cat("Whiskers")
print(d.speak())     # Rex barks.
print(c.speak())     # Whiskers meows.
```

`Dog(Animal)` says "Dog inherits from Animal". `Dog` automatically has `__init__` and `name` from `Animal`, and overrides `speak`.

## `super()` — call the parent's method

Override and _extend_, not just replace:

```python
class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels

class Car(Vehicle):
    def __init__(self, brand):
        super().__init__(wheels=4)         # call Vehicle.__init__
        self.brand = brand

c = Car("Toyota")
print(c.wheels, c.brand)        # 4 Toyota
```

`super()` finds the next class in the **method resolution order** (MRO) and forwards the call.

## `isinstance` and `issubclass`

```python
isinstance(d, Dog)       # True
isinstance(d, Animal)    # True  — a Dog *is an* Animal
issubclass(Dog, Animal)  # True
issubclass(Dog, Cat)     # False
```

Use `isinstance` instead of `type(x) == Dog` so subclasses are accepted.

## Polymorphism

Different classes can implement the same method, and code that uses them doesn't need to know which is which:

```python
def announce(animal):
    print(animal.speak())

for a in [Dog("Rex"), Cat("Whiskers"), Animal("Generic")]:
    announce(a)
```

This is the OOP version of "duck typing": **if it walks like a duck and quacks like a duck, it is a duck**.

## Multiple inheritance

A class can inherit from more than one parent:

```python
class Walker:
    def walk(self): print("walking")

class Swimmer:
    def swim(self): print("swimming")

class Duck(Walker, Swimmer):
    pass

d = Duck()
d.walk()
d.swim()
```

Useful in moderation. Diamond-shaped inheritance hierarchies get confusing fast — Python uses the **C3 linearization** algorithm to compute a deterministic MRO. Inspect it with `Duck.__mro__`:

```python
print(Duck.__mro__)
# (<class 'Duck'>, <class 'Walker'>, <class 'Swimmer'>, <class 'object'>)
```

For "horizontal" reuse, **mixins** are a popular pattern: small classes designed to be combined.

## Abstract base classes

Sometimes you want to declare _"every subclass must implement this"_. Use `abc.ABC`:

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

Shape()              # TypeError — can't instantiate an abstract class
Circle(5).area()     # 78.5...
```

If `Circle` forgot to implement `area`, instantiating it would also raise `TypeError`.

## Composition over inheritance

Inheritance is powerful but tightly couples classes. A common rule of thumb: **prefer composition** when possible. Instead of "Dog _is a_ Speaker", consider "Dog _has a_ Voice":

```python
class Voice:
    def __init__(self, sound):
        self.sound = sound
    def speak(self, name):
        return f"{name} says {self.sound}"

class Dog:
    def __init__(self, name):
        self.name = name
        self.voice = Voice("woof")

    def speak(self):
        return self.voice.speak(self.name)
```

Composition is more flexible — you can swap out the `Voice` without subclassing.

## `object` — the root of all classes

Every class implicitly inherits from `object`. That's why every value has `__class__`, `__repr__`, etc.

```python
class A:
    pass

A.__bases__       # (<class 'object'>,)
```

## `__slots__` — opt out of `__dict__`

By default, instances store attributes in a `__dict__`. For classes with millions of small instances, you can save memory by listing the allowed attributes:

```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y
```

Trade-off: no dynamic attributes, no weak references unless you opt in.

## Try it

```python
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def info(self):
        return f"{self.name}: ${self.salary:,.0f}"

class Manager(Employee):
    def __init__(self, name, salary, reports):
        super().__init__(name, salary)
        self.reports = reports

    def info(self):
        return super().info() + f" — manages {len(self.reports)} people"

team = [Employee("Ada", 90000), Employee("Bo", 75000)]
boss = Manager("Linus", 150000, reports=team)

for person in team + [boss]:
    print(person.info())
```

Output:

```
Ada: $90,000
Bo: $75,000
Linus: $150,000 — manages 2 people
```
