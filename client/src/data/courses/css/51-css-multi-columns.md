---
title: CSS Multi-Columns
---

# CSS Multi-Columns

The `column-*` properties flow text and content into newspaper-style columns. It's a small layout system, perfect for long prose, image galleries, and "masonry-ish" lists — without writing JavaScript.

---

## The Two Modes

You can specify either the **count** or the **width** of columns. Setting one auto-derives the other.

```css
.article {
  column-count: 3;        /* exactly 3 columns */
}

.article {
  column-width: 14em;     /* as many ~14em-wide columns as fit */
}
```

Use **`column-width`** for responsive designs — the browser picks the right number of columns at every screen size.

You can combine them:

```css
.article {
  columns: 3 14em;        /* up to 3 columns, each at least 14em wide */
}
```

`columns` is the shorthand.

---

## Spacing Between Columns

```css
.article {
  column-gap: 2rem;
  column-rule: 1px solid #e5e7eb;   /* a divider line, like a newspaper */
}
```

`column-rule` works like `border` (width, style, color).

---

## Preventing Awkward Breaks

Some elements should **never** split across columns — figures, images, headings:

```css
figure, h2, h3 { break-inside: avoid; }
```

Or force a column break before/after:

```css
h1 { break-before: column; }
```

These are the modern names for the older `page-break-*` properties.

---

## Spanning Across All Columns

A heading or image can span every column:

```css
h1 {
  column-span: all;
  margin-bottom: 2rem;
}
```

---

## Practical Use Cases

### A long-form article

```css
.article {
  columns: 3 18em;
  column-gap: 2rem;
  text-align: justify;
  hyphens: auto;
}

.article h2 { column-span: all; }
.article figure { break-inside: avoid; }
```

Renders like a magazine — three readable columns, justified text, full-width section headings.

### A simple image gallery

```css
.gallery {
  columns: 3 220px;
  column-gap: 1rem;
}

.gallery img {
  width: 100%;
  margin-bottom: 1rem;
  break-inside: avoid;
}
```

Images flow top-to-bottom in each column, then wrap. A "Pinterest-style" masonry layout, no JavaScript. (For real masonry, modern Grid `masonry` is in development.)

### A long bulleted list

```css
ul.skills {
  columns: 2;
  column-gap: 2rem;
  list-style-position: inside;
}
```

Two-column list, evenly distributed.

---

## Limitations

- Flow direction is **top-to-bottom, then next column**. You can't easily change that.
- `break-inside: avoid` works in modern browsers but not perfectly with very tall children.
- Items can't span specific numbers of columns (only `all`).

For complex multi-axis layouts (sidebars, dashboards, irregular grids), reach for **CSS Grid** instead. Multi-column shines for **flowing content** that just needs to fit nicely in columns.

---

## Up Next

Now we tackle the most powerful 1D layout system in CSS: **Flexbox**.
