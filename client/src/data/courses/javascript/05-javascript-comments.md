---
title: JavaScript Comments
---

# JavaScript Comments

Comments are notes for humans. The JavaScript engine ignores them entirely. Used well, they explain **why** code exists; used badly, they restate **what** the code already says.

## Single-line comments

Anything after `//` until the end of the line is a comment.

```javascript
// Convert miles to kilometers.
const km = miles * 1.609;

let total = subtotal + tax; // include VAT
```

## Multi-line (block) comments

`/*` opens a comment, `*/` closes it. Useful for longer notes or for temporarily disabling several lines of code.

```javascript
/*
  Pricing rules:
    - free shipping above $50
    - 10% discount with code SAVE10
    - tax added at checkout
*/
function priceFor(cart) { ... }
```

Block comments **cannot be nested**:

```javascript
/* outer /* inner */ still outer */ // ❌ syntax error after the first */
```

## JSDoc comments

A block comment that starts with `/**` is a **JSDoc** comment. VS Code, WebStorm, ESLint, and TypeScript all read JSDoc to give you autocomplete, hover docs, and type checking — even in plain `.js` files.

```javascript
/**
 * Greet a user by name.
 *
 * @param {string} name - The user's display name.
 * @param {string} [greeting="Hello"] - Optional greeting word.
 * @returns {string} The full greeting.
 */
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
```

Hover over `greet` in any modern editor and you'll see the description, parameter docs, and return type.

## Commenting out code

While debugging it's tempting to disable code with comments:

```javascript
// console.log("debug:", value);
```

That's fine for a few seconds — but **never commit commented-out code**. Use Git to remember the old version. Dead code rots: it goes stale, confuses readers, and hides real bugs.

## Good vs bad comments

```javascript
// ❌ Restates the obvious
// Increment i by 1
i += 1;

// ❌ Wrong/outdated
// Returns the user's email
function getName(user) { return user.name; }

// ✅ Explains intent
// Stripe rounds half-cents up; we mirror that to keep totals consistent.
const charge = Math.round(amount * 100) / 100;

// ✅ Warns about a non-obvious constraint
// Must run before bootstrap(); otherwise the cache is empty.
loadConfig();

// ✅ Cites a source
// RFC 5322, simplified. Good enough for client-side hints, NOT for validation.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

The best comments answer questions the code can't:

- **Why** was this approach chosen over the obvious one?
- What **invariant** must callers preserve?
- Where is the **specification** that this code implements?
- What **bug** does this hack work around (link to the issue)?

## TODO, FIXME, HACK, NOTE

Most teams agree on a small set of tag words inside comments. They show up highlighted in editors and are easy to grep for.

```javascript
// TODO: pagination — we currently fetch everything.
// FIXME: race condition when two users hit "save" at once.
// HACK: Safari ignores autocomplete=off; clear the field manually.
// NOTE: keep in sync with backend/Order.js.
```

## Comments inside JSX (preview)

If you ever write React, comments inside JSX use a different form because `//` would be parsed as JSX text:

```jsx
return (
  <div>
    {/* This is a JSX comment. */}
    <p>Hello</p>
  </div>
);
```

That's a peek ahead — we cover JSX in the React tutorial.

## Next step

Now you can annotate your code. Time to give your data names: variables.
