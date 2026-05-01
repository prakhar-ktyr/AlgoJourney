---
title: TypeScript DOM Manipulation
---

# TypeScript DOM Manipulation

TypeScript has excellent built-in support for the browser Document Object Model (DOM).

Because TypeScript knows about the DOM API, it can prevent errors when you query elements and modify their properties.

---

## Querying Elements

When you use `document.querySelector()`, TypeScript returns a generic `Element` type.

```typescript
const myHeading = document.querySelector("h1");
// Type of myHeading is: HTMLHeadingElement | null
```

TypeScript is smart enough to know that querying an `'h1'` tag returns an `HTMLHeadingElement`.

However, if you query by a class or ID, TypeScript only knows it's an `Element`.

```typescript
const myButton = document.querySelector(".btn-primary");
// Type of myButton is: Element | null
```

An `Element` type is very generic and doesn't have properties like `.value` or `.disabled`.

---

## Casting DOM Elements

To access specific properties on an element found by class or ID, you must cast it to the correct HTML Element type.

```typescript
// We cast it to HTMLInputElement so we can access .value
const usernameInput = document.querySelector("#username") as HTMLInputElement;

// Now TypeScript allows us to read the value
console.log(usernameInput.value);
```

Without the cast, `usernameInput.value` would throw a compile error.

---

## The Non-Null Assertion

Notice that querying elements can return `null` if the element isn't found in the DOM.

```typescript
const submitBtn = document.querySelector("#submit-btn") as HTMLButtonElement | null;

// Error: Object is possibly 'null'.
// submitBtn.disabled = true;
```

You can fix this by wrapping it in an `if` statement, OR if you are 100% sure the element exists, you can use the non-null assertion operator `!`.

```typescript
const submitBtn = document.querySelector("#submit-btn") as HTMLButtonElement;
// OR
const submitBtn2 = document.querySelector("#submit-btn")!;

// Safe to use
submitBtn.disabled = true;
```

---

## Event Listeners

When attaching event listeners, TypeScript correctly types the Event object.

```typescript
const myButton = document.querySelector("#btn") as HTMLButtonElement;

myButton.addEventListener("click", (event) => {
  // TypeScript knows 'event' is a MouseEvent
  console.log(event.clientX, event.clientY);
});
```

If you attach the listener to an input element, you can access the target's value, but you usually need to cast the target:

```typescript
const myInput = document.querySelector("#username") as HTMLInputElement;

myInput.addEventListener("input", (event) => {
  // event.target is generic, we must cast it to read .value
  const target = event.target as HTMLInputElement;
  console.log(target.value);
});
```
