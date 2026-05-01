---
title: CSS Comments
---

# CSS Comments

Comments are notes the browser ignores. They exist for **humans** — to explain *why* code does what it does, mark sections, or temporarily disable a rule.

---

## Syntax

CSS uses **C-style** comments: everything between `/*` and `*/`.

```css
/* This is a comment */

/*
 * Multi-line comments
 * are also fine.
 */
```

CSS does **not** support `//` line comments. That's JavaScript syntax — using it in a `.css` file will break everything that follows.

---

## Where You Can Put Comments

Anywhere whitespace is allowed:

```css
/* Above a rule */
.btn {
  /* Inside a block, between declarations */
  color: white;
  background: blue;  /* At the end of a line */
  padding: 0.5rem 1rem;
}

/* Between rules */

.card { padding: 1rem; }
```

---

## Common Use Cases

### Section Banners

Visually divide a long stylesheet into sections:

```css
/* ============================================
   LAYOUT
   ============================================ */

.container { max-width: 1200px; }

/* ============================================
   COMPONENTS
   ============================================ */

.button { ... }
.card   { ... }
```

### Explaining Tricky Code

```css
.card {
  /* Negative margin pulls the card flush against the
     parent's padding so the image bleeds to the edge. */
  margin-inline: -1rem;
}
```

### Marking TODOs

```css
/* TODO: switch to logical properties when IE11 support drops */
margin-left: 1rem;
```

### Temporarily Disabling Rules

While debugging, comment out a rule instead of deleting it:

```css
.modal {
  /* display: none; */
  background: red;  /* visualize size while testing */
}
```

---

## Comments Cannot Nest

This is a syntax error:

```css
/* outer /* inner */ still outer? */
```

The first `*/` closes the comment, leaving `still outer? */` as broken CSS. Avoid nesting.

---

## Comments and Minification

Production build tools (Vite, esbuild, PostCSS, etc.) **strip comments** when minifying CSS for performance. Write as many comments as you like — they cost nothing in the final bundle.

A special form, `/*! ... */`, is preserved by some minifiers — useful for license headers:

```css
/*! MIT License — © 2025 AlgoJourney */
```

---

## Good Comment, Bad Comment

**Bad** — restates what the code obviously says:

```css
/* Set color to red */
color: red;
```

**Good** — explains the *why*:

```css
/* Match the brand red used in the logo, not the system "red" keyword. */
color: #e11d48;
```

A useful test: if the comment vanished, would a future reader be confused? If yes, keep it. If no, the code is self-explanatory and the comment is noise.

---

## Up Next

Now that we've covered the language fundamentals, it's time for the fun part: making things look good. We start with **colors**.
