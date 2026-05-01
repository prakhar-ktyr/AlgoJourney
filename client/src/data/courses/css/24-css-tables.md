---
title: CSS Tables
---

# CSS Tables

Tables are for **tabular data**. CSS makes them look great — borders, alignment, zebra striping, hover highlights, responsive scrolling.

---

## A Baseline Table

```html
<table>
  <thead>
    <tr><th>Name</th><th>Role</th><th>Salary</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>Engineer</td><td>$120,000</td></tr>
    <tr><td>Bob</td><td>Designer</td><td>$95,000</td></tr>
  </tbody>
</table>
```

By default, it's ugly: no borders, no spacing, no hierarchy. Let's fix that.

---

## `border-collapse` and `border-spacing`

This is the **first** thing you set on a table:

```css
table {
  border-collapse: collapse;   /* merges adjacent borders into one */
  border-spacing: 0;           /* no space between cells */
}
```

`collapse` is what you almost always want — without it, every cell gets its own double-thick border.

If you do want separated borders:

```css
table {
  border-collapse: separate;
  border-spacing: 8px;
}
```

---

## Borders

```css
table, th, td {
  border: 1px solid #e5e7eb;
}
```

For a cleaner "horizontal-only" look (popular in modern UI):

```css
table { border-collapse: collapse; width: 100%; }
th, td {
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  padding: 0.75rem 1rem;
}
```

---

## Padding and Alignment

```css
th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: middle;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}
```

Numbers usually look better right-aligned:

```css
td.numeric, th.numeric { text-align: right; font-variant-numeric: tabular-nums; }
```

`tabular-nums` makes all digits the same width — columns of numbers line up perfectly.

---

## Zebra Striping

```css
tbody tr:nth-child(odd) {
  background: #fafafa;
}
```

Or more modern:

```css
tbody tr:nth-of-type(even) {
  background: hsl(220 20% 98%);
}
```

The visual rhythm makes long tables much easier to scan.

---

## Hover Highlight

```css
tbody tr:hover {
  background: hsl(220 90% 96%);
}
```

Tiny touch, big improvement in usability.

---

## Caption

```html
<table>
  <caption>2024 sales by quarter</caption>
  ...
</table>
```

```css
caption {
  caption-side: top;
  text-align: left;
  padding-bottom: 0.5rem;
  font-weight: 600;
}
```

`<caption>` is great for accessibility — screen readers announce it before the table.

---

## Column Widths

By default the browser auto-sizes columns. To take control:

```css
table { table-layout: fixed; width: 100%; }

th:first-child { width: 30%; }
th:last-child  { width: 20%; }
```

`fixed` layout gives you predictable, much faster rendering for large tables. The widths in the first row dictate column widths.

You can also use `<col>` and `<colgroup>` for declarative column styling:

```html
<colgroup>
  <col style="width: 30%">
  <col style="width: 50%">
  <col style="width: 20%">
</colgroup>
```

---

## Responsive Tables

Tables don't shrink gracefully. Two common patterns:

### 1. Horizontal scroll on small screens

```html
<div class="table-wrap">
  <table>...</table>
</div>
```

```css
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

Simple, robust, accessible.

### 2. Stack on mobile

For each row, on a narrow screen, render it as a vertical block. Requires extra HTML (data attributes for labels) and is a bigger refactor — only worth it for content-heavy product tables.

---

## A Polished Example

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th, td {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

thead th {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

tbody tr:hover { background: #f3f4f6; }

td.numeric { text-align: right; font-variant-numeric: tabular-nums; }
```

Drop this into any project and your tables will look immediately professional.

---

## Up Next

We've done content elements. Now we move into **layout** — starting with the deep-but-rewarding `display` property.
