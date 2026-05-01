---
title: TypeScript Syntax
---

# TypeScript Syntax

TypeScript syntax is basically the JavaScript syntax, plus the addition of type annotations.

Because TypeScript is a superset of JavaScript, all valid JavaScript code is also valid TypeScript code. However, to get the benefits of TypeScript, you add types.

---

## Type Assignment

When creating a variable, there are two main ways TypeScript assigns a type: **Explicit** and **Implicit**.

### 1. Explicit Typing

Explicit typing means writing out the type. This is done by adding a colon (`:`) followed by the type after the variable name.

```typescript
let firstName: string = "Dylan";
let age: number = 30;
```

In the example above, `firstName` can only ever hold a string, and `age` can only ever hold a number.

### 2. Implicit Typing (Type Inference)

Implicit typing means TypeScript will "guess" the type, based on the assigned value. This is also known as **Type Inference**.

```typescript
let firstName = "Dylan";
// TypeScript automatically infers that firstName is a string
```

> [!NOTE]
> Having TypeScript "guess" the type of a value is called inferring. Implicit assignment forces TypeScript to infer the value.

---

## Type Errors

If you try to assign a value of the wrong type, TypeScript will throw an error.

```typescript
let firstName: string = "Dylan"; // type is string
firstName = 33; // Error: Type 'number' is not assignable to type 'string'.
```

Even with implicit typing, TypeScript remembers the inferred type and will prevent you from assigning a different type later:

```typescript
let firstName = "Dylan"; // inferred to type string
firstName = 33; // Error: Type 'number' is not assignable to type 'string'.
```

---

## Unable to Infer

TypeScript may not always properly infer what the type of a variable should be. In such cases, it will set the type to `any` which disables type checking.

```typescript
// Implicit any:
let someValue;
someValue = "Hello";
someValue = 42; // No error!
```

This behavior defeats the purpose of TypeScript. It is highly recommended to explicitly state the type if you declare a variable without assigning a value immediately:

```typescript
let someValue: string;
someValue = "Hello";
// someValue = 42; // Now this will throw an error
```

> [!TIP]
> Always try to explicitly type your variables if you are not initializing them right away.
