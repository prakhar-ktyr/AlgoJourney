---
title: CSS Grid Container
---

# CSS Grid Container

This lesson digs deeper into the **container** side of Grid — the properties you set on the parent that establish the grid's shape and behavior.

---

## `display: grid` vs `inline-grid`

```css
.grid        { display: grid; }        /* block-level grid */
.grid-inline { display: inline-grid; } /* inline-level grid */
```

`inline-grid` lets the grid sit beside text or other inline content. Rare, but useful for small inline component grids.

---

## `grid-template-columns` and `grid-template-rows`

The blueprint. Beyond the basics:

```css
grid-template-columns:
  [sidebar-start] 240px
  [sidebar-end main-start] 1fr
  [main-end];
```

You can name **grid lines** in square brackets. Then place items by name:

```css
.sidebar { grid-column: sidebar-start / sidebar-end; }
.main    { grid-column: main-start    / main-end; }
```

Often easier than counting line numbers.

### Repeating with `auto-fit` and `auto-fill`

```css
grid-template-columns: repeat(auto-fit,  minmax(240px, 1fr));
grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
```

| Function | Behavior when items don't fill the grid |
|----------|------------------------------------------|
| `auto-fit` | Empty tracks **collapse** — remaining items grow to fill |
| `auto-fill` | Empty tracks remain — items keep their min size |

For typical card grids, **`auto-fit`** is what you want.

---

## `grid-template-areas`

Assign names to regions:

```css
grid-template-areas:
  "header header header"
  "nav    main   aside"
  "footer footer footer";
```

Each row is a string. Each "word" is a column cell. Use the same name across cells to span; use `.` for an empty cell:

```css
grid-template-areas:
  "logo nav nav"
  "main main aside"
  ".    .   aside";
```

Then place items by name:

```css
header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }
```

This is the most readable layout system CSS has ever had.

---

## `grid-template` Shorthand

Combine rows, columns, and areas in one declaration:

```css
.app {
  display: grid;
  grid-template:
    "header  header" auto
    "sidebar main"   1fr
    "footer  footer" auto
    / 240px 1fr;
}
```

The `/ 240px 1fr` after the rows defines the columns. Compact and readable once you know the shape.

---

## `gap`, `row-gap`, `column-gap`

```css
.grid {
  gap: 1rem;            /* row and column */
  gap: 1rem 2rem;       /* row | column */
  row-gap: 1rem;
  column-gap: 2rem;
}
```

`gap` does **not** add space outside the grid — only between items. Padding still controls outer space.

---

## `grid-auto-rows` and `grid-auto-columns`

Sizes for **implicit** tracks (created when items overflow the explicit template).

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 0.5rem;
}
```

Now every implicit row is exactly 200px tall — predictable photo gallery rows.

For a uniform but content-fitting row:

```css
grid-auto-rows: minmax(100px, auto);
```

---

## `grid-auto-flow`

Direction the auto-placement algorithm fills:

```css
grid-auto-flow: row;       /* default — fill row by row */
grid-auto-flow: column;
grid-auto-flow: row dense; /* backfill empty cells with smaller items */
```

`dense` produces tighter "masonry-style" layouts with no holes — at the cost of source order.

---

## Alignment on the Container

```css
justify-items: stretch | start | end | center;   /* item horizontal in its cell */
align-items:   stretch | start | end | center;   /* item vertical in its cell */
place-items: center;                              /* shorthand */

justify-content: start | end | center | space-between | space-around | space-evenly;
align-content:   start | end | center | space-between | space-around | space-evenly;
place-content: center;
```

`*-items` controls **items inside their cells**. `*-content` controls **the entire grid inside the container** (only relevant when the grid doesn't fill the container).

---

## Subgrid

Make a child grid inherit the parent's tracks:

```css
.parent { display: grid; grid-template-columns: 1fr 1fr 1fr; }

.child {
  grid-column: span 3;
  display: grid;
  grid-template-columns: subgrid;     /* inherit parent's column tracks */
}
```

Now items inside `.child` align to the **same column lines** as items in `.parent`. Subgrid solves the long-standing "card content not aligning across cards" problem.

We'll see subgrid in action in a later lesson.

---

## Practical Container Patterns

### "Magazine" layout

```css
.magazine {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 100px;
  gap: 1rem;
}
.magazine .feature  { grid-column: span 4; grid-row: span 2; }
.magazine .sidebar  { grid-column: span 2; grid-row: span 2; }
.magazine .small    { grid-column: span 2; }
```

### Dashboard card grid

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: minmax(160px, auto);
  gap: 1rem;
}
```

### Centering anything

```css
.center {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}
```

---

## Up Next

Now the other side — properties you set on **grid items** themselves.
