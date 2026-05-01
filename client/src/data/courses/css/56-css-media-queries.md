---
title: CSS Media Queries
---

# CSS Media Queries

A **media query** lets you apply CSS only when certain conditions are true — viewport size, device orientation, color scheme, even user motion preferences. They're the foundation of responsive design.

---

## Anatomy of a Media Query

```css
@media (min-width: 768px) {
  .container { padding: 2rem; }
}
```

Inside the `@media` block, the rules apply only when the condition matches. The condition can combine multiple checks with `and`, `or`, `not`.

---

## Common Features You Can Query

| Feature | Example |
|---------|---------|
| `min-width` / `max-width` | `(min-width: 768px)` |
| `min-height` / `max-height` | `(min-height: 600px)` |
| `orientation` | `(orientation: portrait)` |
| `prefers-color-scheme` | `(prefers-color-scheme: dark)` |
| `prefers-reduced-motion` | `(prefers-reduced-motion: reduce)` |
| `prefers-contrast` | `(prefers-contrast: more)` |
| `hover` | `(hover: hover)` |
| `pointer` | `(pointer: coarse)` |
| `aspect-ratio` | `(min-aspect-ratio: 16/9)` |

---

## Mobile-First Workflow

The recommended approach: **write your styles for the smallest screen first**, then add `min-width` queries for larger ones.

```css
/* Base: small screens */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet+ */
@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; }
}

/* Desktop+ */
@media (min-width: 1200px) {
  .grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; }
}
```

Why mobile-first? Phones are the lowest-power devices. Loading the simplest CSS first means faster initial render — and `min-width` overrides are easier to reason about than `max-width`.

---

## Common Breakpoints

There's no official "right" set, but these are widely used:

```css
@media (min-width: 480px)  { /* large phone */ }
@media (min-width: 768px)  { /* tablet */ }
@media (min-width: 1024px) { /* small laptop */ }
@media (min-width: 1280px) { /* desktop */ }
@media (min-width: 1536px) { /* large desktop */ }
```

But — **let your content decide your breakpoints**. If your design starts looking awkward at 540px, that's where the breakpoint goes. Don't blindly copy other designers' numbers.

---

## Modern Range Syntax

Older syntax:

```css
@media (min-width: 600px) and (max-width: 999px) { ... }
```

Modern (and clearer):

```css
@media (600px <= width <= 999px) { ... }
@media (width >= 600px) { ... }
@media (width < 600px)  { ... }
```

Browser support is now strong — use the modern form.

---

## Combining Conditions

```css
@media (min-width: 768px) and (orientation: landscape) { ... }

@media (max-width: 600px), (orientation: portrait) { ... }   /* OR */

@media not (hover: hover) { ... }   /* devices without real hover */
```

---

## `prefers-color-scheme`

The killer query for dark mode:

```css
:root {
  --bg: white;
  --text: #111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --text: #f3f4f6;
  }
}
```

Combined with CSS variables, you've shipped dark mode in 8 lines.

---

## `prefers-reduced-motion`

Honor users who get motion sickness from animations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Tiny effort, large accessibility win.

---

## `hover` and `pointer`

Distinguish between mouse and touch:

```css
@media (hover: hover) and (pointer: fine) {
  /* mouse user — hover effects work as expected */
  .card:hover { transform: translateY(-2px); }
}

@media (hover: none) and (pointer: coarse) {
  /* touch user — bigger touch targets */
  .button { min-height: 44px; }
}
```

This is much more reliable than guessing from `max-width`.

---

## Print Stylesheets

```css
@media print {
  nav, footer, .ads { display: none; }
  body { font-size: 12pt; color: black; }
  a::after { content: " (" attr(href) ")"; }   /* show URLs in printouts */
}
```

A few lines and your articles print beautifully.

---

## A Compact Example

```css
.page {
  padding: 1rem;
}

@media (min-width: 600px) {
  .page { padding: 2rem; }
}

@media (min-width: 1024px) {
  .page {
    padding: 4rem;
    max-width: 1200px;
    margin-inline: auto;
  }
}

@media (prefers-color-scheme: dark) {
  .page { background: #0f172a; color: #f3f4f6; }
}
```

A responsive, dark-mode-aware container in a few rules.

---

## Up Next

Media queries are powerful but element-agnostic. The next lesson — **responsive design** — pulls them together with all the modern tools we've learned (clamp, auto-fit, container queries).
