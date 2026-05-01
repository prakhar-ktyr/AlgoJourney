---
title: CSS Flexbox
---

# CSS Flexbox

Flexbox is a layout system designed for **one dimension at a time** — a row of buttons, a column of cards, a navbar with a logo on the left and links on the right. It replaced the old float-based layouts and is the workhorse of modern UI.

---

## Two Sides: The Container and the Items

You opt in by setting `display: flex` on a **parent**. Its **direct children** become flex items. Properties split into two groups:

| Container | Items |
|-----------|-------|
| `display: flex` | `flex` |
| `flex-direction` | `flex-grow` |
| `flex-wrap` | `flex-shrink` |
| `gap` | `flex-basis` |
| `justify-content` | `align-self` |
| `align-items` | `order` |
| `align-content` | |

---

## Setting It Up

```css
.row {
  display: flex;
  gap: 1rem;
}
```

That's it — the children now sit in a row with 1rem of space between them. No floats, no clearing, no whitespace bugs.

---

## `flex-direction`

Which axis are items laid out on?

```css
flex-direction: row;             /* default — left to right */
flex-direction: row-reverse;
flex-direction: column;          /* top to bottom */
flex-direction: column-reverse;
```

The "main axis" is the direction of the layout. The "cross axis" is perpendicular. Properties that align on the main axis use `justify-*`; on the cross axis use `align-*`.

---

## `justify-content` — Main-Axis Alignment

```css
justify-content: flex-start;     /* default */
justify-content: flex-end;
justify-content: center;
justify-content: space-between;
justify-content: space-around;
justify-content: space-evenly;
```

A common one — push items to opposite ends:

```css
.navbar {
  display: flex;
  justify-content: space-between;
}
```

---

## `align-items` — Cross-Axis Alignment

```css
align-items: stretch;            /* default — fill the cross axis */
align-items: flex-start;
align-items: flex-end;
align-items: center;
align-items: baseline;
```

Center vertically:

```css
.row {
  display: flex;
  align-items: center;
}
```

`baseline` aligns text by their letter baselines — useful when items have different font sizes.

---

## `gap`

```css
.row { display: flex; gap: 1rem; }
.col { display: flex; flex-direction: column; gap: 0.5rem; }

/* Different row and column gaps */
.grid-like { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
```

`gap` is much cleaner than the old `margin-right: 1rem; &:last-child { margin-right: 0 }` dance.

---

## `flex-wrap`

By default flex items try to **fit on one line**, shrinking if necessary. To allow wrapping:

```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

Now overflow items wrap to a new line.

---

## The Flex Item Properties

```css
.item {
  flex-grow:   0;        /* how much extra space to absorb */
  flex-shrink: 1;        /* how much to give up if too big */
  flex-basis:  auto;     /* starting size before grow/shrink */
}

.item { flex: 1; }       /* shorthand: grow 1, shrink 1, basis 0 */
.item { flex: 0 0 200px; }  /* don't grow, don't shrink, 200px wide */
```

`flex: 1` is the most common — "fill remaining space."

---

## Common Recipes

### Sidebar + main

```css
.layout {
  display: flex;
  gap: 1rem;
}
.sidebar { flex: 0 0 240px; }
.main    { flex: 1; }
```

A 240px sidebar with main content filling the rest.

### Centered content (any size)

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
}
```

The legendary "vertical and horizontal centering" — solved.

### Header with logo on the left, links on the right

```css
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header .links { margin-left: auto; }
```

`margin-left: auto` on a flex item pushes it to the far end.

### Equal-width columns

```css
.row { display: flex; gap: 1rem; }
.row > * { flex: 1; }
```

Three children → three equal columns. Five children → five.

### Holy grail (header / sidebar / main / sidebar / footer)

```css
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.app .body {
  display: flex;
  flex: 1;
}
.app .body .main { flex: 1; }
.app .body aside { flex: 0 0 200px; }
```

A full app skeleton.

---

## Direction-Aware (Logical) Properties

For RTL support, modern Flexbox uses logical names:

```css
margin-inline-start: auto;   /* like margin-left in LTR */
```

Combined with `flex-direction: row`, your layouts flip correctly in RTL languages without any extra code.

---

## When to Choose Flexbox vs Grid

| Use Flexbox when | Use Grid when |
|------------------|---------------|
| Laying out items in **one** direction | Laying out **two** directions at once |
| Items have **dynamic sizes** | Items map to a **defined grid** |
| Distributing space across a row/column | Building a complex page layout |
| Aligning items along an axis | Overlapping or precise placement |

For most components — buttons, navbars, forms, toolbars — Flexbox. For page-level layouts and product grids — Grid.

---

## Up Next

The other half of modern CSS layout — **Grid**.
