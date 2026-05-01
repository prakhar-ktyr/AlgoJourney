---
title: TypeScript Casting
---

# TypeScript Casting

There are times when you will have more information about the type of a value than TypeScript does.

In these situations, you can use **Type Casting** (also known as Type Assertion) to tell the compiler to treat a value as a specific type.

---

## Casting with `as`

The most common way to cast a type is using the `as` keyword.

```typescript
let myUnknownValue: unknown = "Hello World";

// We cast the unknown value to a string so we can use string methods
let strLength: number = (myUnknownValue as string).length;

console.log(strLength); // 11
```

In the example above, without the cast, TypeScript would throw an error because `length` does not exist on type `unknown`.

---

## Casting with `< >`

You can also use angle brackets `< >` to cast a type. This performs exactly the same function as the `as` keyword.

```typescript
let myUnknownValue: unknown = "Hello World";

let strLength: number = (<string>myUnknownValue).length;
```

> [!WARNING]
> The `< >` syntax is not recommended if you are using TypeScript with React (JSX) because it conflicts with JSX element syntax. It is safer and more standard to use the `as` keyword.

---

## Force Casting

Type casting only allows type assertions to a _more specific_ or _less specific_ version of a type. This rule prevents "impossible" casts.

```typescript
let x = "hello";
// console.log(x as number); // Error: Conversion of type 'string' to type 'number' may be a mistake...
```

To override this rule, you can first cast to `unknown` (or `any`), and then cast to the target type. This is known as **force casting** or double casting.

```typescript
let x = "hello";
console.log(x as unknown as number); // No error, but this is dangerous!
```

Force casting should be used very rarely, as it completely bypasses the type checker and usually indicates a flaw in your program's design.
