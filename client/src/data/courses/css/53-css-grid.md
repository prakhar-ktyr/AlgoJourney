---
title: CSS Grid
---

# CSS Grid

CSS Grid is a **two-dimensional** layout system — rows and columns at the same time. Where Flexbox is best for one-dimensional flows (a row, a column), Grid is the right tool for entire pages, dashboards, photo grids, and complex layouts.

---

## The Mental Model

You define a **grid template** on a parent — its rows and columns. Children are **placed** into cells in that grid, either explicitly or automatically. Once you grasp this split (template vs placement), Grid clicks.

---

## A Minimal Example

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}
```

Three equal columns, 1rem gaps. Drop in any number of children — they flow in row by row.

---

## `grid-template-columns` and `grid-template-rows`

The grid blueprint. Sizes can be:

| Value | Meaning |
|-------|---------|
| `200px` | Fixed |
| `1fr` | A "fraction" of remaining space |
| `auto` | Sized by content |
| `min-content` | As small as content allows |
| `max-content` | As wide as content needs |
| `minmax(min, max)` | Range |

```css
grid-template-columns: 200px 1fr 1fr;        /* sidebar + 2 columns */
grid-template-columns: repeat(4, 1fr);        /* 4 equal columns */
grid-template-columns: repeat(3, minmax(200px, 1fr));
```

### `repeat()`

```css
grid-template-columns: repeat(12, 1fr);   /* 12-column grid */
grid-template-columns: repeat(4, minmax(200px, 1fr));
```

### Auto-fit / auto-fill — Responsive Without Media Queries

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

The grid creates as many 240px-or-larger columns as fit. On a phone you get 1 column, on a desktop you get 4 — automatically. **One of the most useful patterns in modern CSS.**

`auto-fill` does the same but keeps empty tracks (visible if you add column rules).

---

## `gap`

```css
.grid {
  display: grid;
  gap: 1rem;            /* row + column */
  gap: 1rem 2rem;       /* row | column */
  row-gap: 1rem;
  column-gap: 2rem;
}
```

---

## Placing Items Explicitly

By default, items flow into the grid one cell at a time. To place them precisely:

```css
.featured {
  grid-column: 1 / 4;     /* spans columns 1 to 3 */
  grid-row: 1 / 3;        /* spans rows 1 to 2 */
}

/* Shorthand */
.featured { grid-area: 1 / 1 / 3 / 4; /* row-start / col-start / row-end / col-end */ }
```

Span N columns:

```css
.wide { grid-column: span 2; }
```

---

## Named Areas — The Most Readable Layout

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100dvh;
}

.layout > header  { grid-area: header; }
.layout > .sidebar { grid-area: sidebar; }
.layout > main    { grid-area: main; }
.layout > footer  { grid-area: footer; }
```

You can **literally see the layout** in the CSS. Reorder it on mobile by changing the template:

```css
@media (max-width: 600px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
```

---

## Implicit Grid

If you place an item at row 5 in a 3-row grid, the browser **creates** rows automatically. Control their sizing:

```css
grid-auto-rows: 100px;
grid-auto-columns: minmax(100px, 1fr);
grid-auto-flow: row;       /* default — fill row by row */
grid-auto-flow: column;
grid-auto-flow: dense;     /* fill gaps with smaller items */
```

`dense` is great for masonry-ish layouts where you want compact packing.

---

## Alignment

Grid has `justify-*` (column axis) and `align-*` (row axis):

```css
.grid {
  justify-items: center;     /* horizontal alignment of items in their cells */
  align-items: center;       /* vertical alignment in cells */
  justify-content: center;   /* the whole grid horizontally inside the container */
  align-content: center;     /* the whole grid vertically */

  place-items: center;       /* shorthand for align + justify items */
  place-content: center;     /* shorthand for align + justify content */
}
```

Per-item alignment override:

```css
.item {
  justify-self: end;
  align-self: start;
}
```

---

## The Most Common Recipes

### Card grid

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
```

### Centered single item

```css
.full-page {
  display: grid;
  place-content: center;
  min-height: 100dvh;
}
```

A two-line replacement for "vertical and horizontal centering."

### Sidebar layout (with content collapse on mobile)

```css
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 240px minmax(0, 1fr);
  }
}
```

### Gallery with featured first item

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.gallery > :first-child {
  grid-column: span 2;
  grid-row: span 2;
}
```

### Holy grail (header / sidebar / main / footer)

```css
.app {
  display: grid;
  grid-template:
    "header  header" auto
    "sidebar main"  1fr
    "footer  footer" auto
    / 240px 1fr;
  min-height: 100dvh;
}
```

---

## Up Next

We've defined grids. Next: a deeper look at the **container** properties and tricks.
