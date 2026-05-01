---
title: JavaScript Template Literals
---

# JavaScript Template Literals

A **template literal** is a string written in backticks `` ` ` ``. It adds three superpowers over a regular `"…"` string:

1. **Interpolation** — embed any expression with `${ … }`.
2. **Multi-line** — newlines inside the literal are preserved.
3. **Tagged templates** — call a function to process the parts.

## Interpolation

```javascript
const name = "Ada";
const age = 36;

const message = `Hello, ${name}! You are ${age} years old.`;
console.log(message); // "Hello, Ada! You are 36 years old."
```

Anything inside `${ … }` is a JavaScript expression — not just a variable name:

```javascript
`2 + 2 = ${2 + 2}`;                  // "2 + 2 = 4"
`Tomorrow: ${new Date(Date.now() + 86_400_000).toDateString()}`;
`Status: ${user.isAdmin ? "admin" : "user"}`;
```

The expression's value is converted to a string with the same rules as `String(value)`:

```javascript
`${ [1, 2, 3] }`;       // "1,2,3"
`${ { a: 1 } }`;        // "[object Object]"
`${ JSON.stringify({a:1}) }`; // '{"a":1}'
```

## Multi-line strings

Newlines inside backticks are part of the string — no `\n` needed:

```javascript
const html = `
<ul>
  <li>One</li>
  <li>Two</li>
</ul>
`;
```

The string starts immediately after the opening backtick, so leading whitespace and the first newline are included. To strip them, write the literal flush against the backtick or `.trim()` the result.

## Escaping a backtick or `${`

```javascript
`This has a \` backtick.`;
`Not interpolated: \${name}`;
```

## Building HTML safely

Plain interpolation does **not** escape HTML — it can introduce XSS:

```javascript
const userInput = `<script>alert("xss")</script>`;
const html = `<div>${userInput}</div>`; // ❌ dangerous if injected into the DOM
```

Use `textContent` (DOM API) or a templating library (React, lit-html) for any user-supplied data.

## Tagged templates

If you put a function name **immediately before** a template literal, the function is called with the static parts and the interpolated values:

```javascript
function tag(strings, ...values) {
  console.log(strings); // ["Hello, ", "! You scored ", " points.", raw: [...]]
  console.log(values);  // ["Ada", 95]
  return "tagged result";
}

tag`Hello, ${"Ada"}! You scored ${95} points.`;
```

Real-world uses:

- **`String.raw`** — preserves backslashes verbatim, great for Windows paths and regex.

  ```javascript
  String.raw`C:\Users\Ada\file.txt`;  // "C:\\Users\\Ada\\file.txt"
  ```

- **HTML-escaping helpers**:

  ```javascript
  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  function html(strings, ...values) {
    return strings.reduce(
      (out, str, i) => out + str + (i < values.length ? escape(values[i]) : ""),
      "",
    );
  }

  const userName = `<img onerror="alert(1)">`;
  html`<p>Hello ${userName}</p>`;
  // "<p>Hello &lt;img onerror=&quot;alert(1)&quot;&gt;</p>"
  ```

- **SQL builders, GraphQL queries, styled-components** — all built on tagged templates.

## Template literals vs concatenation

```javascript
// Old-school
const url = "/api/users/" + userId + "/posts/" + postId + "?limit=" + limit;

// Template literal — read this twice and it's obvious
const url = `/api/users/${userId}/posts/${postId}?limit=${limit}`;
```

Use template literals whenever you'd build a string from more than one piece. They are clearer, faster (the engine can pre-cache the static parts), and harder to typo.

## A practical example

```javascript
function formatOrder(order) {
  const lines = order.items
    .map((it) => `  • ${it.name.padEnd(20)} ${it.qty} × $${it.price.toFixed(2)}`)
    .join("\n");

  return `
Order #${order.id}
Customer: ${order.customer}
${lines}
Total: $${order.total.toFixed(2)}
  `.trim();
}
```

## Next step

We've done numbers and strings. Time for the simplest type of all: booleans.
