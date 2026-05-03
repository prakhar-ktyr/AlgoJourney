---
title: Design Patterns Introduction
---

# Design Patterns Introduction

**Design patterns** are proven, reusable solutions to common problems in software design. They are not code you copy — they are templates for solving recurring design challenges.

---

## What is a Design Pattern?

A design pattern is a **general repeatable solution** to a commonly occurring problem. It describes:

1. **The problem** — what situation triggers this pattern
2. **The solution** — the class/object structure
3. **The consequences** — trade-offs and results

---

## History

Design patterns were popularized by the **Gang of Four (GoF)** — Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides — in their 1994 book *"Design Patterns: Elements of Reusable Object-Oriented Software."*

They catalogued **23 patterns** in three categories.

---

## The Three Categories

| Category | Purpose | Count | Examples |
|----------|---------|-------|----------|
| **Creational** | How objects are **created** | 5 | Singleton, Factory, Builder |
| **Structural** | How classes are **composed** | 7 | Adapter, Decorator, Facade |
| **Behavioural** | How objects **communicate** | 11 | Observer, Strategy, Command |

---

## Creational Patterns

Control **how** objects are created:

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Singleton** | Ensure only one instance exists | Configuration, logging, connection pools |
| **Factory Method** | Create objects without specifying exact class | When creation logic is complex |
| **Abstract Factory** | Create families of related objects | Cross-platform UI, database drivers |
| **Builder** | Construct complex objects step by step | Objects with many optional parameters |
| **Prototype** | Clone existing objects | When creation is expensive |

---

## Structural Patterns

Control how classes and objects are **composed**:

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Adapter** | Make incompatible interfaces work together | Integrating third-party libraries |
| **Decorator** | Add behaviour to objects dynamically | Extending functionality without subclassing |
| **Facade** | Provide a simplified interface | Hiding complex subsystems |
| **Composite** | Treat individual objects and groups uniformly | Tree structures, UI components |
| **Proxy** | Control access to an object | Lazy loading, access control, caching |
| **Bridge** | Separate abstraction from implementation | Multiple dimensions of variation |
| **Flyweight** | Share common state among many objects | Large numbers of similar objects |

---

## Behavioural Patterns

Control how objects **interact and communicate**:

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Observer** | Notify multiple objects of state changes | Event systems, pub/sub |
| **Strategy** | Swap algorithms at runtime | Sorting, validation, formatting |
| **Command** | Encapsulate a request as an object | Undo/redo, queuing, macro recording |
| **Iterator** | Traverse a collection without exposing internals | Custom collections |
| **State** | Change behaviour based on internal state | Workflow, game states |
| **Template Method** | Define skeleton, let subclasses fill in steps | Frameworks, algorithms with variants |
| **Chain of Responsibility** | Pass request along a chain of handlers | Middleware, event bubbling |
| **Mediator** | Reduce direct dependencies between objects | Chat rooms, air traffic control |
| **Memento** | Capture and restore object state | Undo functionality |
| **Visitor** | Add operations to objects without modifying them | AST processing, reporting |
| **Interpreter** | Define a grammar and interpret sentences | DSLs, expression evaluation |

---

## How to Learn Patterns

1. **Understand the problem first** — don't apply patterns where they're not needed
2. **Learn the most common ones** — Singleton, Factory, Observer, Strategy, Decorator
3. **Recognize them in code** — many frameworks use patterns extensively
4. **Don't over-apply** — using a pattern when a simple solution works is over-engineering

---

## Patterns in the Real World

| Framework / Library | Patterns Used |
|--------------------|---------------|
| Java Collections | Iterator, Factory Method |
| Java I/O | Decorator (BufferedReader wraps FileReader) |
| Spring Framework | Singleton, Factory, Proxy, Observer |
| React | Observer (state), Composite (components) |
| Express.js | Chain of Responsibility (middleware) |
| Redux | Observer, Command |

---

## Anti-Pattern Warning

A pattern used **incorrectly** or **unnecessarily** becomes an **anti-pattern**:

- Singleton everywhere → hard to test, hidden dependencies
- Factory for simple objects → unnecessary complexity
- Observer without cleanup → memory leaks

**Rule**: Use the simplest solution that works. Only apply a pattern when the problem clearly calls for it.

---

## Key Takeaways

- Design patterns are **proven solutions** to common OOP problems
- Three categories: **Creational**, **Structural**, **Behavioural**
- Most important to learn first: **Singleton**, **Factory**, **Observer**, **Strategy**, **Decorator**
- Don't over-apply patterns — use them when the problem calls for it
- Patterns are a **vocabulary** for discussing design with other developers

Next: **Creational Patterns** — Singleton, Factory, and Builder in detail.
