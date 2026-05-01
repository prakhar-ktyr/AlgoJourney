---
title: CSS Units
---

# CSS Units

Pick the right unit for the right job and your CSS becomes responsive, accessible, and maintainable. Pick the wrong one and you spend afternoons fighting layout bugs.

---

## Absolute Units

| Unit | Meaning |
|------|---------|
| `px` | A CSS pixel — *not* the same as a device pixel |
| `cm`, `mm`, `in` | Physical units — useful for print stylesheets |
| `pt`, `pc` | Print typographic units |

The only absolute unit you'll use in a typical web project is **`px`**. The others matter for `@media print`.

---

## Relative Units (the important ones)

### `em`

Relative to the **font-size of the current element** (or its parent for `font-size` itself).

```css
.btn {
  font-size: 1rem;
  padding: 0.5em 1em;     /* scales with the button's font size */
}
```

Pros: padding/margin scale with the text.
Cons: nests confusingly. `1.5em` inside `1.5em` becomes `2.25em` of the root.

### `rem` — the workhorse

Relative to the **root** (`<html>`) font size. Always predictable.

```css
:root { font-size: 16px; }     /* baseline */
body  { font-size: 1rem; }     /* = 16px */
h1    { font-size: 2.5rem; }   /* = 40px */
```

**Use `rem` for most spacing and font sizes.** Users who set a larger default font size in their browser get a proportionally larger site — that's accessibility.

### `%`

Relative to the **parent's** value of the same property.

```css
.col   { width: 50%; }              /* half of parent's width */
img    { max-width: 100%; }         /* fluid responsive image */
```

Watch out for percentage padding/margin — they're always relative to the parent's **width**, even vertically.

### `vw`, `vh`, `vmin`, `vmax`

Relative to the **viewport**:

| Unit | Meaning |
|------|---------|
| `vw` | 1% of viewport width |
| `vh` | 1% of viewport height |
| `vmin` | 1% of the smaller dimension |
| `vmax` | 1% of the larger dimension |

```css
.hero  { min-height: 80vh; }
.title { font-size: 5vw; }   /* fluid headline */
```

### Modern viewport units

Mobile browsers' address bars used to make `100vh` "wrong." Now we have:

| Unit | Meaning |
|------|---------|
| `dvh` | Dynamic — adjusts as toolbars show/hide |
| `svh` | Small — assumes toolbars visible |
| `lvh` | Large — assumes toolbars hidden |

```css
.fullscreen { min-height: 100dvh; }
```

`dvh` is the modern recommended choice for "fill the screen."

### `ch`

Width of the "0" character in the current font. Perfect for measuring **reading width**:

```css
p { max-width: 65ch; }   /* ~65 characters per line — ideal for prose */
```

### `ex`

Height of the "x" character. Niche, but useful for vertical alignment of icons next to text.

### `lh` and `rlh`

The line-height of the current element (`lh`) or root (`rlh`):

```css
.bullet {
  width: 1lh;
  height: 1lh;     /* a bullet that's exactly one line tall */
}
```

---

## A Quick Decision Tree

| Use case | Unit |
|----------|------|
| Font size | `rem` |
| Spacing (margin, padding) | `rem` (or `em` for component-relative) |
| Border width, hairlines | `px` |
| Image max width | `%` |
| Hero section height | `dvh` |
| Reading line width | `ch` |
| Responsive headline size | `clamp()` (covered next lesson) |

---

## Setting the Root Font Size

A common idiom:

```css
:root { font-size: 100%; }   /* respect the browser default — usually 16px */
```

You'll see `:root { font-size: 62.5% }` in older code (so 1rem = 10px makes math easier). Modern advice is to leave it at `100%` and use design-system spacing tokens.

---

## Mixing Units With `calc()`

```css
.section {
  width: calc(100% - 2rem);
  height: calc(100vh - 64px);
}
```

`calc()` mixes any units. Whitespace around `+` and `-` is **required**.

---

## Up Next

Units are the building blocks. **Math functions** — `calc`, `min`, `max`, `clamp` — are the lego instructions. That's the next lesson.
