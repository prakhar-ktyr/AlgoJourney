---
title: TypeScript Decorators
---

# TypeScript Decorators

Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members.

A Decorator is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter.

Decorators use the form `@expression`, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

> [!NOTE]
> Decorators are an experimental feature that may change in future releases. To enable them, you must enable the `experimentalDecorators` compiler option in your `tsconfig.json`.

---

## Class Decorators

A class decorator is applied to the constructor of the class and can be used to observe, modify, or replace a class definition.

Here is a simple example of a Class Decorator that seals both the constructor and its prototype (prevents adding/removing properties).

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
```

When `@sealed` is executed, it passes the `BugReport` class constructor to the `sealed` function.

---

## Decorator Factories

If we want to customize how a decorator is applied, we can write a decorator factory. A Decorator Factory is simply a function that returns the expression that will be called by the decorator at runtime.

```typescript
function color(value: string) {
  // this is the decorator factory, it sets up the returned decorator function
  return function (target: any) {
    // this is the decorator
    // do something with 'target' and 'value'...
  };
}

@color("red")
class MyClass {}
```

---

## Method Decorators

Method Decorators are applied before the method declaration. They can observe, modify, or replace a method definition.

The decorator function receives three arguments:

1. The class prototype (or constructor for static methods).
2. The name of the member.
3. The Property Descriptor of the member.

```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  // Replace the original method with a wrapper that logs before calling it
  descriptor.value = function (...args: any[]) {
    console.log(`Calling "${propertyKey}" with arguments:`, args);
    return originalMethod.apply(this, args);
  };
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3); // Console: Calling "add" with arguments: [2, 3]
```

Other types of decorators include Property Decorators, Accessor Decorators, and Parameter Decorators.
