---
title: JavaScript Switch
---

# JavaScript Switch

`switch` chooses among many discrete values. It is most useful when you'd otherwise write a long `if / else if` chain comparing the same expression against several constants.

## Basic form

```javascript
const day = new Date().getDay();

switch (day) {
  case 0:
    console.log("Sunday");
    break;
  case 1:
    console.log("Monday");
    break;
  case 6:
    console.log("Saturday");
    break;
  default:
    console.log("a weekday");
}
```

The expression after `switch` is compared with each `case` using **`===`** (strict equality, no coercion). The first matching `case` runs; execution then "falls through" to the next case **unless you `break`**.

## Why `break` matters

Forgetting `break` is the #1 `switch` bug:

```javascript
switch (level) {
  case "warn":
    console.warn("warning!");
    // no break — falls through!
  case "error":
    console.error("error!");
    break;
}

// level === "warn"  → prints BOTH warning and error
// level === "error" → prints just error
```

ESLint's `no-fallthrough` rule catches this.

## Intentional fall-through

When you genuinely want multiple cases to share a body, omit `break` and add a comment:

```javascript
switch (status) {
  case "pending":
  case "processing":
    showSpinner();
    break;
  case "done":
  case "shipped":
    showCheckmark();
    break;
  default:
    showQuestionMark();
}
```

A modern equivalent uses an array:

```javascript
if (["pending", "processing"].includes(status)) showSpinner();
```

## Block scope inside `case`

`case` clauses share the `switch` block. Declaring a `let` or `const` in one case can collide with another:

```javascript
switch (x) {
  case 1:
    let result = compute();
    break;
  case 2:
    let result = other(); // ❌ SyntaxError — duplicate declaration
    break;
}
```

Wrap each `case` body in `{ }` to give it its own scope:

```javascript
switch (x) {
  case 1: {
    const result = compute();
    break;
  }
  case 2: {
    const result = other();
    break;
  }
}
```

## `return` instead of `break`

Inside a function, `return` ends the switch and the function in one shot — no `break` needed:

```javascript
function colorFor(level) {
  switch (level) {
    case "info":  return "blue";
    case "warn":  return "yellow";
    case "error": return "red";
    default:      return "gray";
  }
}
```

## `default` placement

`default` doesn't have to be last, but it's almost always written there for readability. If `default` appears in the middle, fall-through still applies — another reason to keep it at the bottom.

## Strict comparison gotcha

Because `switch` uses `===`, type matters:

```javascript
const code = "1";
switch (code) {
  case 1:  // never matches "1"
    console.log("one");
    break;
  default:
    console.log("not one"); // ← runs
}
```

Coerce up front:

```javascript
switch (Number(code)) {
  case 1: console.log("one"); break;
}
```

## When `switch` is the wrong tool

For many lookups, an object map is shorter and faster:

```javascript
const COLORS = {
  info:  "blue",
  warn:  "yellow",
  error: "red",
};

function colorFor(level) {
  return COLORS[level] ?? "gray";
}
```

Use a `switch` when each case has logic, not just a value to return.

## A "true" switch trick

You can dispatch on conditions by switching on `true`:

```javascript
switch (true) {
  case score >= 90: grade = "A"; break;
  case score >= 80: grade = "B"; break;
  case score >= 70: grade = "C"; break;
  default:          grade = "F";
}
```

Some teams find this elegant; others find it confusing. A regular `if/else if` chain is usually clearer for ranges.

## Modern alternative: pattern-style dispatch

JavaScript doesn't yet have pattern matching like Rust or Python — there's a stage-3 proposal. Until it ships, the idiomatic alternatives are:

```javascript
// Lookup table
const handlers = {
  click: handleClick,
  hover: handleHover,
  focus: handleFocus,
};
(handlers[event.type] ?? handleUnknown)(event);

// If/else for complex predicates
// Switch for ~3+ discrete value cases with logic
```

## A complete example: a tiny calculator

```javascript
function calc(op, a, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Divide by zero");
      return a / b;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

calc("+", 2, 3);  // 5
calc("/", 10, 0); // throws
```

## Next step

`if` and `switch` decide *whether* to run code. Loops decide *how many times*.
---
title: JavaScript Switch
---

# JavaScript Switch

`switch` compares a value against several `case` labels. It is best suited for testing one expression against many fixed values — typically strings or small integers.

## Basic syntax

```javascript
switch (day) {
  case "Mon":
  case "Tue":
  case "Wed":
  case "Thu":
  case "Fri":
    console.log("weekday");
    break;
  case "Sat":
  case "Sun":
    console.log("weekend");
    break;
  default:
    console.log("unknown day");
}
```

The flow:

1. Evaluate the expression in `switch (...)`.
2. Compare against each `case` using **strict equality (`===`)** — no coercion.
3. From the first matching `case`, run statements until a `break`, `return`, or `throw`.
4. If no case matches, run `default` (if present).

## `break` is required

Without `break`, execution **falls through** to the next case:

```javascript
switch (status) {
  case "draft":
    console.log("Saving");   // runs
  case "review":
    console.log("Notifying"); // also runs!
    break;
  case "published":
    console.log("Publishing");
    break;
}
```

When `status === "draft"`, both messages print. Fall-through is sometimes useful (see the weekday example above) but is most often a bug. ESLint's `no-fallthrough` rule catches accidental cases.

If you intentionally want to fall through, leave a comment so reviewers know you meant it:

```javascript
case "view":
  log("viewed");
  // falls through
case "edit":
  log("edited");
  break;
```

## `default` doesn't have to be last

`default` runs when no case matches. Its position is up to you, but conventionally it's at the end and uses `break` (even though there's nothing after it) to make moving the case safe:

```javascript
switch (...) {
  case "a": ...; break;
  default: ...; break;
  case "b": ...; break; // legal, but confusing
}
```

## Strict equality means watch your types

```javascript
const code = "1";
switch (code) {
  case 1:    console.log("number"); break;  // never matches "1"
  case "1":  console.log("string"); break;  // matches
}
```

If you've parsed a string from input, convert before switching:

```javascript
switch (Number(code)) {
  case 1: ...
}
```

## Block-scoped variables in cases

Cases share one big block, so two cases declaring the same variable name collide. Wrap each case body in `{ ... }` to isolate them:

```javascript
switch (action) {
  case "login": {
    const user = getUser();
    return user;
  }
  case "logout": {
    const user = currentUser();   // OK — different block
    user.logout();
    break;
  }
}
```

## Switching on ranges with `true`

A handy trick for range checks: switch on `true` and put the comparison in each case.

```javascript
function gradeFor(score) {
  switch (true) {
    case score >= 90: return "A";
    case score >= 80: return "B";
    case score >= 70: return "C";
    case score >= 60: return "D";
    default:          return "F";
  }
}
```

Some style guides ban this idiom. It's compact, but a chain of `if`/`else if` is just as clear.

## When NOT to use switch

If you're picking one value from many keys, an **object literal** is shorter and faster:

```javascript
const labels = {
  draft:     "Saving",
  review:    "Awaiting review",
  published: "Live",
};

const message = labels[status] ?? "Unknown";
```

For richer logic per branch, a map of functions:

```javascript
const handlers = {
  add: (x, y) => x + y,
  sub: (x, y) => x - y,
  mul: (x, y) => x * y,
};
const result = (handlers[op] ?? (() => { throw new Error("unknown op"); }))(a, b);
```

These eliminate the cognitive overhead of `case` and `break` entirely.

## A real example

```javascript
function httpStatusGroup(status) {
  switch (Math.floor(status / 100)) {
    case 1: return "informational";
    case 2: return "success";
    case 3: return "redirect";
    case 4: return "client error";
    case 5: return "server error";
    default: return "unknown";
  }
}

httpStatusGroup(200); // "success"
httpStatusGroup(404); // "client error"
```

## Next step

We've covered branching. Now let's repeat work with loops.
