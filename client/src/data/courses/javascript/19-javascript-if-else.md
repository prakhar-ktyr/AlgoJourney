---
title: JavaScript If Else
---

# JavaScript If Else

`if` is the most common control-flow statement in any language. JavaScript's version is straightforward, with a few quirks around truthiness.

## Basic `if`

```javascript
if (age >= 18) {
  console.log("You can vote.");
}
```

The condition is **any expression**. It is converted to a boolean using the truthy/falsy rules from the [Booleans](javascript-booleans) lesson.

```javascript
if ("hello") { /* runs — non-empty string is truthy */ }
if (0)       { /* doesn't run */ }
if (user)    { /* runs only if user is defined and not null */ }
```

## `if … else`

```javascript
if (score >= 60) {
  console.log("Pass");
} else {
  console.log("Fail");
}
```

## `else if`

There is no `elif` in JavaScript — chain `else if`:

```javascript
if (score >= 90)      grade = "A";
else if (score >= 80) grade = "B";
else if (score >= 70) grade = "C";
else if (score >= 60) grade = "D";
else                   grade = "F";
```

For more than three or four branches, `switch` or a lookup table is usually cleaner.

## Always use braces

JavaScript allows brace-less single-line bodies, but they're a famous source of bugs:

```javascript
// Risky — easy to misread
if (x > 0)
  console.log("positive");
  doSomething();          // ALWAYS runs — not part of the if!

// Safe — always brace
if (x > 0) {
  console.log("positive");
  doSomething();
}
```

ESLint's `curly` rule enforces this and we recommend turning it on.

## Ternary expression

`if`/`else` for an *expression* is a ternary `cond ? a : b`:

```javascript
const label = age >= 18 ? "adult" : "minor";

const status =
  count === 0 ? "empty"
  : count === 1 ? "one"
  : "many";
```

Use ternaries for short either/or values. Don't use them when the branches have side effects:

```javascript
// ❌ Hard to read
isAdmin ? deleteAll() : showMessage();

// ✅ Use a statement
if (isAdmin) deleteAll();
else showMessage();
```

## Guard clauses

Inverting an `if` to return early often makes code easier to follow than nesting:

```javascript
// Pyramid of doom
function process(user) {
  if (user) {
    if (user.isActive) {
      if (user.balance > 0) {
        // do work
      }
    }
  }
}

// Guard clauses — flat, easier to read
function process(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (user.balance <= 0) return;
  // do work
}
```

## Short-circuit "if"

A familiar one-liner that uses logical operators instead of `if`:

```javascript
isAdmin && deleteAll();      // call deleteAll only if isAdmin
errorHandler && errorHandler(err);

const port = customPort || 3000;       // default if customPort is falsy
const port = customPort ?? 3000;       // default ONLY if null/undefined
```

Use these for short, expressive checks; reach for `if` when there are multiple statements.

## Truthiness pitfalls in `if`

Empty arrays and objects are **truthy**. Strings `"0"` and `"false"` are **truthy**.

```javascript
if ([])          {} // runs!
if ({})          {} // runs!
if ("0")         {} // runs!
if ("false")     {} // runs!

// Be explicit:
if (arr.length > 0) {}
if (Object.keys(obj).length > 0) {}
if (str === "true") {}
```

For "is this a real value?" tests, the safest checks are explicit:

```javascript
if (value !== undefined) {}
if (value !== null) {}
if (value != null) {}             // both null and undefined
```

## Comparing strings or numbers — pick the right operator

```javascript
if (input === "yes") {}
if (Number(input) > 0) {}
if (user.role === "admin") {}
```

Avoid `==` — see the [Equality](javascript-equality) lesson for the long story.

## Combining conditions

```javascript
if (age >= 18 && age < 65) { /* working age */ }
if (role === "admin" || role === "owner") { /* elevated */ }
if (!isLocked && (hasKey || isAdmin)) { /* allowed */ }
```

When mixing `&&` and `||`, **always group with parentheses** to make precedence explicit. Future readers (and you) will thank you.

## A real example

```javascript
function pricingMessage({ amount, currency, isMember }) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Invalid price";
  }

  if (amount === 0) return "Free";
  if (amount < 0)   return "Refund";

  const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency })
    .format(amount);

  return isMember ? `${formatted} (members save 10%)` : formatted;
}
```

Each `if` reads top-to-bottom as a guard. The function returns as soon as it knows the answer.

## Next step

For comparing one value against many fixed alternatives, `switch` can be clearer. Up next.
