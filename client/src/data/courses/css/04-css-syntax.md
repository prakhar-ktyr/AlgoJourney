---
title: CSS Syntax
---

# CSS Syntax

A CSS stylesheet is a list of **rules**. Each rule tells the browser: "for these elements, apply these styles." The syntax is small, consistent, and easy to read once you know the parts.

---

## Anatomy of a Rule

```css
selector {
  property: value;
  property: value;
}
```

Concrete example:

```css
h1 {
  color: tomato;
  font-size: 2rem;
}
```

| Part | Name | Meaning |
|------|------|---------|
| `h1` | **Selector** | Which elements the rule applies to |
| `{ ... }` | **Declaration block** | The braces holding the styles |
| `color: tomato;` | **Declaration** | A single style |
| `color` | **Property** | What to style |
| `tomato` | **Value** | What to set it to |
| `;` | **Terminator** | Separates declarations |

---

## Multiple Selectors

You can apply the same styles to many selectors by separating them with commas:

```css
h1, h2, h3 {
  font-family: Georgia, serif;
  color: #1e293b;
}
```

This sets the same font on **all** three heading levels.

---

## Multiple Declarations

A rule can have as many declarations as you need:

```css
.card {
  background-color: white;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
```

> [!TIP]
> The semicolon after the **last** declaration is technically optional — but always include it. Then if you add a new property later, you won't accidentally break the rule.

---

## Whitespace and Formatting

CSS doesn't care about whitespace. These three rules are identical to the browser:

```css
p { color: red; font-size: 14px; }
```

```css
p{color:red;font-size:14px;}
```

```css
p {
  color: red;
  font-size: 14px;
}
```

Use the **multi-line** style for code you write — it's vastly easier to read and to diff in version control.

---

## Comments

Comments are wrapped in `/* */`:

```css
/* This is a single-line comment */

/*
  Comments can span
  multiple lines too.
*/

h1 {
  color: red; /* You can comment after a value */
}
```

CSS does **not** support `//` line comments. That's a JavaScript thing.

---

## Case Sensitivity

- **Selectors and properties** are case-insensitive: `COLOR` and `color` are the same.
- **Class and ID names** are case-sensitive: `.Card` and `.card` are different.
- **Values** depend on context — color names are case-insensitive, but a `url("image.PNG")` may matter on a case-sensitive server.

**Convention**: write everything lowercase, use kebab-case for class names (`.user-card`, not `.userCard`).

---

## Property Values

A value can be:

| Type | Example |
|------|---------|
| **Keyword** | `block`, `auto`, `none` |
| **Length** | `16px`, `2rem`, `50%` |
| **Color** | `red`, `#ff0000`, `rgb(255 0 0)` |
| **Function** | `calc(100% - 20px)`, `url("logo.svg")` |
| **List** | `1px solid black` (border shorthand) |
| **String** | `"Open Sans"` |

Many properties accept multiple value types — `background` can take a color, an image, or both.

---

## Errors and Resilience

CSS is **forgiving**. If the browser doesn't understand a rule, it simply skips it and continues:

```css
.button {
  color: blue;
  font-fammily: sans-serif;  /* typo — ignored */
  padding: 0.5rem;
}
```

`color` and `padding` still apply. There is no error message — the typo just silently does nothing. Always check DevTools when something isn't working: invalid declarations are crossed out.

---

## Up Next

Now that you know the shape of a rule, let's dig into the most powerful part: **selectors** — choosing exactly which elements to style.
