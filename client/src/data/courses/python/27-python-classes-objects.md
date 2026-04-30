---
title: Python Classes & Objects
---

# Python Classes & Objects

A **class** is a blueprint for creating objects. An **object** (or _instance_) is a value built from that blueprint, with its own state and behavior.

In Python, _everything_ is an object — `int`, `str`, `list`, even functions and classes themselves. Defining your own classes is how you bundle state and behavior into reusable types.

## Defining a class

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says woof!"

rex = Dog("Rex", 5)
print(rex.name)        # 'Rex'
print(rex.bark())      # 'Rex says woof!'
```

Anatomy:

- `class Dog:` declares a new class. Class names are `UpperCamelCase`.
- `__init__` is the **constructor** — runs when you do `Dog(...)`. The first argument, conventionally `self`, is the new instance.
- `self.name = name` creates an **instance attribute**.
- `bark` is an **instance method** — also takes `self` as the first parameter.
- `Dog("Rex", 5)` calls `__init__` and returns the new instance.

## `self` is just a parameter

There's no magic — `self` is the conventional name for "the instance this method was called on". When you write `rex.bark()`, Python translates it to `Dog.bark(rex)`. You could name it anything (`this`, `me`, `self`), but **always use `self`** — every Python programmer expects it.

## Class attributes vs instance attributes

```python
class Dog:
    species = "Canis familiaris"          # class attribute — shared by every Dog

    def __init__(self, name):
        self.name = name                  # instance attribute — unique per dog

a = Dog("Ada")
b = Dog("Bo")

print(a.species, b.species)               # 'Canis familiaris' both
Dog.species = "Canis lupus familiaris"
print(a.species)                          # changed for all instances
```

Be careful with **mutable** class attributes — they're shared, which is rarely what you want:

```python
class Bad:
    items = []                # shared list!

    def add(self, x):
        self.items.append(x)

a, b = Bad(), Bad()
a.add(1); b.add(2)
print(a.items)                # [1, 2] — surprised?
```

Initialize mutables in `__init__` instead.

## Methods, classmethods, staticmethods

```python
class Circle:
    pi = 3.14159

    def __init__(self, radius):
        self.radius = radius

    def area(self):                       # instance method — takes self
        return Circle.pi * self.radius ** 2

    @classmethod
    def from_diameter(cls, d):            # class method — takes cls
        return cls(d / 2)                 # returns a new Circle

    @staticmethod
    def is_valid_radius(r):               # static method — no self, no cls
        return r > 0
```

- **Instance method** — operates on an instance.
- **Class method** — operates on the class (often used as an "alternative constructor").
- **Static method** — a plain function namespaced under the class.

## Dunder ("magic") methods

Methods with leading + trailing double underscores hook into Python's syntax. The most common:

| Method                   | Triggers                                |
| ------------------------ | --------------------------------------- |
| `__init__(self, ...)`    | `MyClass(...)`                          |
| `__repr__(self)`         | `repr(x)`, REPL display                 |
| `__str__(self)`          | `str(x)`, `print(x)`                    |
| `__eq__(self, other)`    | `x == y`                                |
| `__lt__`, `__le__`, …    | `<`, `<=`, …                            |
| `__hash__(self)`         | `hash(x)`, set/dict membership          |
| `__len__(self)`          | `len(x)`                                |
| `__getitem__(self, key)` | `x[key]`                                |
| `__iter__(self)`         | `for x in obj:`                         |
| `__call__(self, ...)`    | `obj(...)` — make the instance callable |
| `__enter__`, `__exit__`  | `with obj:`                             |

```python
class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        return f"{self.amount:.2f} {self.currency}"

    def __eq__(self, other):
        return (isinstance(other, Money)
                and self.amount == other.amount
                and self.currency == other.currency)

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError("currency mismatch")
        return Money(self.amount + other.amount, self.currency)

m = Money(10, "USD") + Money(5, "USD")
print(m)         # 15.00 USD
print(repr(m))   # Money(15, 'USD')
```

## `@dataclass` — boilerplate-free classes

For classes that mainly hold data, `dataclasses` writes `__init__`, `__repr__`, and `__eq__` for you:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(3, 4)
print(p)            # Point(x=3, y=4)
print(p == Point(3, 4))   # True
```

Useful options:

```python
@dataclass(frozen=True, slots=True)
class Vec:
    x: float
    y: float
```

`frozen=True` makes instances immutable (and hashable). `slots=True` saves memory.

## Properties — managed attributes

Sometimes you want an attribute to be computed or validated:

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self.celsius = (value - 32) * 5 / 9

t = Temperature(100)
print(t.fahrenheit)      # 212.0   — looks like an attribute, runs as a method
t.fahrenheit = 32
print(t.celsius)         # 0.0
```

Properties let you start with a plain attribute and later add validation without breaking callers.

## Try it

```python
from dataclasses import dataclass

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

acct = BankAccount("Ada")
acct.deposit(100)
acct.withdraw(30)
print(acct)         # BankAccount(owner='Ada', balance=70.0)
```
