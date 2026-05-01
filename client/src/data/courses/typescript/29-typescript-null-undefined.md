---
title: TypeScript Null & Undefined
---

# TypeScript Null & Undefined

TypeScript has a strict null-checking feature that drastically reduces runtime errors caused by unexpected `null` or `undefined` values.

---

## `strictNullChecks`

By default, `null` and `undefined` are assignable to all other types. This means you can assign `null` to a `string` variable. This is usually the source of the famous "Cannot read property of undefined" error.

When the `strictNullChecks` flag is enabled in your `tsconfig.json` (which is highly recommended and default in modern TypeScript), `null` and `undefined` have their own distinct types.

You cannot assign them to other types unless explicitly allowed using a Union type.

```typescript
// Assuming strictNullChecks is true

let value: string = "hello";
// value = null; // Error: Type 'null' is not assignable to type 'string'.

let optionalValue: string | null = "hello";
optionalValue = null; // OK
```

---

## Optional Chaining (`?.`)

Optional chaining allows you to safely access properties of an object that might be `null` or `undefined`. If the value is null/undefined, the expression simply evaluates to `undefined` instead of throwing an error.

```typescript
interface House {
  sqft: number;
  yard?: {
    sqft: number;
  };
}

function printYardSize(house: House) {
  // If yard is undefined, this returns undefined safely
  const yardSize = house.yard?.sqft;

  if (yardSize === undefined) {
    console.log("No yard");
  } else {
    console.log(`Yard is ${yardSize} sqft`);
  }
}
```

---

## Nullish Coalescing (`??`)

The nullish coalescing operator `??` is a logical operator that returns its right-hand side operand when its left-hand side operand is `null` or `undefined`, and otherwise returns its left-hand side operand.

```typescript
function printMileage(mileage: number | null | undefined) {
  // If mileage is null or undefined, default to 0
  const finalMileage = mileage ?? 0;
  console.log(`Mileage: ${finalMileage}`);
}

printMileage(100); // 100
printMileage(null); // 0

// Note: It's different from the logical OR (||) operator.
// || falls back on ANY falsy value (e.g. 0 or "").
// ?? falls back ONLY on null or undefined.
```

---

## Non-Null Assertion Operator (`!`)

If you know a value is definitely not `null` or `undefined`, but TypeScript doesn't, you can use the `!` operator after the variable to assert that it is non-null.

```typescript
function getValue(): string | undefined {
  return "hello";
}

// We know it returns a string in this case, so we assert it
let val: string = getValue()!;
```

> [!WARNING]
> Use the `!` operator carefully. If the value actually is null, your code will crash at runtime.
