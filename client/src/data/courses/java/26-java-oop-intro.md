---
title: Java OOP Introduction
---

# Java OOP Introduction

Java is fundamentally an **object-oriented** language. Almost every program you write will define and use classes. This lesson is the conceptual bridge between procedural Java (everything inside `main`) and writing your own types.

## What is OOP?

**Object-oriented programming** is a way of organizing code around **objects**: bundles of _data_ (state) and _behaviour_ (methods that act on that state).

Procedural code answers "what steps do I do?". OOP code answers "what _things_ exist, and what can they do?".

## Class vs object

- A **class** is a _blueprint_ — it describes what an object looks like and what it can do.
- An **object** (or _instance_) is a concrete value created from that blueprint.

```
class Dog                 →  one blueprint
   ├─ name
   ├─ age
   └─ bark()

  ↓ new Dog("Rex", 3)
  ↓ new Dog("Bella", 5)
  ↓ new Dog("Lucky", 1)

three Dog objects, each with its own name and age
```

## The four pillars of OOP

1. **Encapsulation** — bundle data and the methods that work on it inside a class, and hide internal details behind a clean API.
2. **Inheritance** — define new classes by extending existing ones; reuse code without copying.
3. **Polymorphism** — code written against a parent type works with any subclass.
4. **Abstraction** — describe _what_ something does without being tied to _how_.

We'll cover each in its own lesson.

## A first taste

```java
public class Dog {
    String name;
    int age;

    void bark() {
        System.out.println(name + " says: Woof!");
    }
}

public class Demo {
    public static void main(String[] args) {
        Dog rex = new Dog();
        rex.name = "Rex";
        rex.age = 3;
        rex.bark();        // Rex says: Woof!

        Dog bella = new Dog();
        bella.name = "Bella";
        bella.bark();      // Bella says: Woof!
    }
}
```

`rex` and `bella` are independent — each has its own `name` and `age`.

## Why OOP?

- **Modeling.** Real systems are full of "things" with state and behaviour. Customers, orders, files, threads, HTTP requests. OOP lets your code mirror those.
- **Reuse.** Inheritance and composition let you share behaviour across types.
- **Maintenance.** Encapsulation keeps changes local — you can rewrite a class's internals without breaking its callers.
- **Polymorphism.** Code can work with whole _families_ of types through a common interface.

## What's coming

The next lessons cover, in order:

| Lesson              | Topic                                  |
| ------------------- | -------------------------------------- |
| Classes and Objects | Defining a class, creating instances   |
| Class Attributes    | Fields                                 |
| Class Methods       | Behaviour                              |
| Constructors        | Initialising new objects               |
| Modifiers           | `public`, `private`, `static`, `final` |
| Encapsulation       | Hiding state behind getters/setters    |
| Packages & Import   | Organising larger codebases            |
| Inheritance         | `extends` and code reuse               |
| Polymorphism        | One interface, many implementations    |
| Inner Classes       | Nested types                           |
| Abstract Classes    | Partial implementations                |
| Interfaces          | Pure contracts                         |
| Enums               | A fixed set of named values            |
| Records             | Concise immutable data carriers        |

By the end of this section you'll be able to design and implement non-trivial Java programs.

Onward to **classes and objects**.
