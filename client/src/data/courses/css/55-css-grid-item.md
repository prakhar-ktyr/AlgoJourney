---
title: CSS Grid Item
---

# CSS Grid Item

Once a parent has `display: grid`, its direct children become **grid items**. This lesson is about what you can do *to* those items — placement, span, alignment, and order.

---

## Placement: Lines and Spans

Grids have numbered lines: 1 to N+1 for an N-column grid.

```
| 1   2   3   4   |
+---+---+---+
|   |   |   |
+---+---+---+
```

```css
.item {
  grid-column-start: 1;
  grid-column-end:   3;     /* spans columns 1 + 2 */
  grid-row-start:    1;
  grid-row-end:      2;
}

/* Shorthand */
.item {
  grid-column: 1 / 3;
  grid-row:    1 / 2;
}

/* Even shorter */
.item { grid-area: 1 / 1 / 2 / 3; }
/*                row-start / col-start / row-end / col-end */
```

---

## `span` Keyword

Easier than counting lines:

```css
.wide { grid-column: span 2; }       /* spans 2 columns from auto position */
.tall { grid-row:    span 3; }
.full { grid-column: 1 / -1; }       /* -1 = the last line */
```

`grid-column: 1 / -1` is the famous "full width across the grid" trick.

---

## Named Lines

If the parent named its lines:

```css
grid-template-columns:
  [start] 240px
  [content-start] 1fr
  [end];
```

Items can use those names:

```css
.sidebar { grid-column: start / content-start; }
.main    { grid-column: content-start / end; }
```

Easier to maintain than line numbers.

---

## Named Areas

When the parent uses `grid-template-areas`, items just declare which area:

```css
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
```

This is by far the most readable form for whole-page layouts.

---

## `order` — Reordering Without Changing HTML

```css
.featured { order: -1; }   /* moves to the front */
.last     { order: 99; }   /* moves to the back */
```

Default is `0`. Smaller values come first. **Be cautious**: visual order should usually match DOM order for accessibility.

---

## Per-Item Alignment

Grid items get individual alignment overrides:

```css
.item {
  justify-self: start | end | center | stretch;   /* horizontal in its cell */
  align-self:   start | end | center | stretch;   /* vertical in its cell */
  place-self: center;                              /* shorthand */
}
```

Useful when one item should center while siblings stretch.

---

## Sizing — `minmax` for Defensible Items

A common bug: long content (a URL, a wide table) blows out a flex/grid item, breaking the layout.

```css
.grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
```

`minmax(0, 1fr)` instead of `1fr` lets the column shrink below its content width — overflow inside the cell will scroll instead of expanding the column.

---

## `aspect-ratio` on Grid Items

Grid cells often need fixed aspect ratios (think photo grids):

```css
.thumb {
  aspect-ratio: 1;       /* perfect square */
}

.video {
  aspect-ratio: 16 / 9;
}
```

The cell's height auto-derives from its width — no padding hacks needed.

---

## Overlapping Items

Multiple items can share the same cell — they layer on top of each other. Use `z-index` to stack:

```css
.bg, .text {
  grid-area: 1 / 1;     /* both in cell 1,1 */
}
.text { z-index: 1; }
```

A great pattern for "card with image background and overlay text."

---

## Auto-Placement: The Default

If you don't specify placement, items flow in source order, filling cells one at a time. Control direction:

```css
.grid { grid-auto-flow: row; }        /* default — fill rows */
.grid { grid-auto-flow: column; }
.grid { grid-auto-flow: row dense; }  /* backfill gaps */
```

`dense` packs smaller items into earlier holes — useful for asymmetric grids.

---

## Practical Patterns

### "Featured" card spanning more space

```css
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.cards > .featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### Sidebar that always sticks to the left

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
}
.sidebar { grid-column: 1; }
.main    { grid-column: 2; }
```

### Centering a single item in any cell

```css
.cell {
  display: grid;
  place-items: center;
}
```

### Image with text overlay

```css
.card {
  display: grid;
  grid-template: 1fr / 1fr;       /* one cell */
}
.card > * { grid-area: 1 / 1; }   /* every child fills it */
.card .caption { align-self: end; padding: 1rem; color: white; }
```

---

## Up Next

We've laid out grids. The next layer of responsive design — **media queries** — is what flexes those layouts across screen sizes.
