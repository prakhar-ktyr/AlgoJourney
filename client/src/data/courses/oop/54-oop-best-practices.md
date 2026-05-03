---
title: OOP Best Practices Summary
---

# OOP Best Practices Summary

This lesson distils the most important OOP best practices into a single reference. Use this as a checklist for writing clean, maintainable, professional code.

---

## Class Design

| Practice | Do | Don't |
|----------|----|-------|
| **Naming** | Use nouns: `Order`, `Customer`, `PaymentProcessor` | Vague names: `Manager`, `Handler`, `Data` |
| **Size** | Keep classes under ~200 lines | God classes with 50+ methods |
| **Responsibility** | One clear responsibility per class | Multiple unrelated responsibilities |
| **Constructors** | Validate inputs, establish invariants | Leave objects in invalid states |
| **Fields** | Make fields private by default | Public fields (unless value objects) |

---

## Method Design

| Practice | Do | Don't |
|----------|----|-------|
| **Naming** | Use verbs: `calculateTotal()`, `sendEmail()` | Ambiguous: `process()`, `handle()` |
| **Parameters** | 3 or fewer parameters | 5+ parameters (use parameter objects) |
| **Length** | Keep methods under ~20 lines | Methods doing multiple things |
| **Return values** | Return meaningful values or void | Return error codes (use exceptions) |
| **Side effects** | Be explicit about state changes | Hidden side effects |

---

## Inheritance

| Practice | Do | Don't |
|----------|----|-------|
| **Hierarchy depth** | 2-3 levels maximum | 5+ levels deep |
| **Relationship** | Use for genuine "is-a" relationships | Inherit just for code reuse |
| **Composition** | Prefer has-a when in doubt | Force inheritance when has-a works |
| **Override** | Always use `@Override` annotation | Override without annotation |
| **Sealed** | Seal classes not designed for extension | Leave everything open |

---

## SOLID Quick Reference

```
S — Single Responsibility
    One class = one job = one reason to change

O — Open/Closed
    Add new behavior via new classes, don't modify existing ones

L — Liskov Substitution
    Subclasses must work anywhere the parent class works

I — Interface Segregation
    Many small interfaces > one big interface

D — Dependency Inversion
    Constructor(Interface dependency) not new ConcreteClass()
```

---

## Design Patterns to Know

| Situation | Pattern |
|-----------|---------|
| "I need exactly one instance" | Singleton |
| "I need to create different types" | Factory |
| "I need to build complex objects" | Builder |
| "I need to adapt an incompatible interface" | Adapter |
| "I need to add behaviour dynamically" | Decorator |
| "I need to simplify a complex subsystem" | Facade |
| "I need to notify multiple objects of changes" | Observer |
| "I need to swap algorithms at runtime" | Strategy |
| "I need undo/redo" | Command |

---

## Code Smells to Watch For

```
🔴 Long methods (> 20 lines)         → Extract Method
🔴 Large classes (> 200 lines)       → Extract Class
🔴 Duplicate code                     → Extract common method/class
🔴 Long parameter lists              → Parameter Object
🔴 Switch on type                    → Polymorphism
🔴 Lots of getters/setters only      → Anemic Model — add behaviour
🔴 Deep inheritance (> 3 levels)     → Composition
🔴 Unused inherited methods          → Interface Segregation
```

---

## Testing Checklist

- [ ] Every public method has at least one test
- [ ] Edge cases are tested (null, empty, boundary)
- [ ] Exceptions are tested
- [ ] Dependencies are mocked
- [ ] Tests are independent (no shared state)
- [ ] Tests are fast (no real DB, no real network)

---

## Naming Conventions

| Type | Convention | Examples |
|------|-----------|----------|
| **Classes** | PascalCase, noun | `OrderService`, `BankAccount` |
| **Interfaces** | PascalCase, adjective or noun | `Comparable`, `Repository` |
| **Methods** | camelCase, verb | `calculateTotal()`, `findById()` |
| **Variables** | camelCase, meaningful | `orderTotal`, `customerName` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| **Packages** | lowercase | `com.example.orders` |

---

## The Pragmatic OOP Developer

1. **Write code for humans first**, computers second
2. **Start simple**, add complexity only when needed
3. **Favour readability** over cleverness
4. **Refactor continuously** — don't let technical debt accumulate
5. **Test everything** — untested code is broken code you haven't found yet
6. **Learn patterns**, but don't force them
7. **Read other people's code** — open source is the best textbook

---

## Key Takeaways

- Good OOP is about **clear responsibilities**, **loose coupling**, and **high cohesion**
- Follow **SOLID** principles as guidelines, not rigid rules
- **Composition over inheritance** in most cases
- **Test everything**, mock dependencies, keep tests fast
- **Readability** is the most important property of code
- These practices apply across **all OOP languages**

Next: **OOP Capstone** — your complete learning path and next steps.
