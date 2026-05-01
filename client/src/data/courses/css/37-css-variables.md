---
title: CSS Variables
---

# CSS Variables

CSS variables — officially called **custom properties** — let you store values in one place and reference them everywhere. They're the foundation of every modern design system, theming engine, and dark mode toggle.

---

## Defining and Using a Variable

```css
:root {
  --brand: #2563eb;
  --gap: 1rem;
}

.button {
  background: var(--brand);
  padding: var(--gap);
}
```

A variable name **must start with `--`**. By convention they live on `:root` (which targets `<html>`) so the whole document can use them.

---

## `var()` Fallbacks

```css
.button {
  color: var(--button-color, white);
  /*           variable     fallback if undefined */
}
```

The fallback can itself be a `var()`:

```css
color: var(--button-color, var(--text-color, black));
```

---

## Variables Cascade and Inherit

Unlike preprocessor variables (Sass, Less), CSS variables are **live in the cascade**. Children inherit them. You can override per-element:

```css
:root { --gap: 1rem; }

.compact { --gap: 0.5rem; }   /* descendants now see 0.5rem */
.spacious { --gap: 2rem; }
```

This is huge — a single design token can be redefined in a subtree and propagate automatically.

---

## Theming with Variables

```css
:root {
  --bg:   white;
  --text: #111;
}

[data-theme="dark"] {
  --bg:   #111;
  --text: white;
}

body { background: var(--bg); color: var(--text); }
```

Toggle a `data-theme` attribute on `<html>` and the entire site reskins.

---

## Dark Mode via System Preference

```css
:root {
  color-scheme: light dark;
  --bg: white;
  --text: #111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111;
    --text: white;
  }
}
```

Variables make this two-line change repaint your entire app.

---

## Variables in Calc

You can do math on variables:

```css
:root { --cols: 12; --gutter: 1rem; }

.column {
  width: calc((100% - (var(--cols) - 1) * var(--gutter)) / var(--cols));
}
```

A complete grid system in one calculation.

---

## Variables Aren't Limited to Colors

Anything that's a CSS value:

```css
:root {
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  --content-width: 1200px;
}
```

You can even store partial values and assemble later:

```css
:root { --primary-h: 220; --primary-s: 90%; --primary-l: 50%; }

.button {
  background: hsl(var(--primary-h) var(--primary-s) var(--primary-l));
}
.button:hover {
  background: hsl(var(--primary-h) var(--primary-s) calc(var(--primary-l) - 10%));
}
```

A complete color palette derived from three variables.

---

## Setting Variables From JavaScript

```js
document.documentElement.style.setProperty('--bg', '#222');
```

Read them too:

```js
getComputedStyle(document.documentElement).getPropertyValue('--bg');
```

This bridges design tokens with runtime logic — perfect for theme pickers.

---

## Component-Scoped Variables

A great pattern for reusable components:

```css
.button {
  --button-bg: #2563eb;
  --button-text: white;

  background: var(--button-bg);
  color: var(--button-text);
}

.button.danger {
  --button-bg: #ef4444;
}

.button.outline {
  --button-bg: transparent;
  --button-text: #2563eb;
  border: 1px solid currentColor;
}
```

Variants are just variable overrides — no need to duplicate every property.

---

## `@property` — Typed Variables

A modern feature lets you declare a variable's type, default value, and inheritance:

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

This unlocks animating gradients (which `var()` alone can't do, because the browser doesn't know it's an angle).

---

## Up Next

Variables in hand, let's apply them — starting with **rounded corners**, the simplest of the visual-effect properties.
