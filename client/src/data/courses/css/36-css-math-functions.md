---
title: CSS Math Functions
---

# CSS Math Functions

CSS isn't just declarative — it can do math. The `calc()`, `min()`, `max()`, and `clamp()` functions enable **fluid, intrinsic design** that responds to the viewport without media queries.

---

## `calc()`

Mixes units in a calculation:

```css
.sidebar { width: calc(100% - 240px); }
.section { height: calc(100vh - 64px - 32px); }
.container { padding: calc(1rem + 1vw); }
```

Operators: `+`, `-`, `*`, `/`. Whitespace around `+` and `-` is **required**.

```css
width: calc(50% - 16px);    /* ✅ */
width: calc(50%-16px);      /* ❌ syntax error */
```

You can nest:

```css
.cell { width: calc(calc(100% / 3) - 1rem); }
```

But you don't need to — `calc()` already handles parentheses.

---

## `min()` and `max()`

Pick the smaller / larger of multiple values:

```css
.container { width: min(90%, 1200px); }   /* whichever is smaller */
.button    { width: max(120px, 20%); }    /* whichever is larger */
```

`min(90%, 1200px)` is the most common — it's "100% wide, capped at 1200px." One line replaces a media query.

---

## `clamp()` — The Star of the Show

`clamp(min, preferred, max)` keeps a value within a range:

```css
font-size: clamp(1rem, 0.5rem + 1.5vw, 1.5rem);
```

- Smallest: `1rem`
- Grows with the viewport: `0.5rem + 1.5vw`
- Capped at: `1.5rem`

Result: a **fluid font size** that scales between phone and desktop, never too small, never too large. No `@media` queries.

```css
:root {
  --gutter: clamp(1rem, 4vw, 3rem);
  --hero-title: clamp(2rem, 5vw + 1rem, 5rem);
}
```

This is the heart of modern fluid design.

---

## Recipes

### Container with adaptive padding

```css
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
  padding-block: clamp(2rem, 5vw, 5rem);
}
```

A responsive container in three properties — no media queries needed.

### Fluid typography scale

```css
:root {
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1.05rem + 0.4vw, 1.5rem);
  --text-xl:   clamp(1.25rem, 1.15rem + 0.5vw, 2rem);
  --text-2xl:  clamp(1.5rem, 1.3rem + 1vw, 2.5rem);
}

h1 { font-size: var(--text-2xl); }
p  { font-size: var(--text-base); }
```

### Aspect-ratio with min/max

```css
.video {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
}
```

---

## `min()`/`max()` in Multi-Comparison

Pass as many values as you like:

```css
width: min(50vw, 600px, 100% - 32px);
```

Useful for "smallest of (window-relative, content-relative, hard cap)."

---

## Trigonometry and More

Recently shipped: trig and exponent functions. Niche but powerful for animation work.

```css
transform: rotate(calc(sin(45deg) * 1rad));
width: calc(pow(2, 4) * 1px);
```

---

## Why Math Functions Beat Media Queries

Compare two solutions to "fluid font size."

**Old:**
```css
h1 { font-size: 1.5rem; }
@media (min-width: 600px) { h1 { font-size: 2rem; } }
@media (min-width: 1000px) { h1 { font-size: 3rem; } }
```

**Fluid:**
```css
h1 { font-size: clamp(1.5rem, 1rem + 2vw, 3rem); }
```

One line, smooth scaling at every width, no breakpoints to maintain.

---

## Up Next

Math functions need values to operate on. **Custom properties (CSS variables)** are how you reuse those values everywhere.
