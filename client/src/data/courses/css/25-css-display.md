---
title: CSS Display
---

# CSS Display

The `display` property controls the **outer behavior** of an element (does it sit on a line or take the full row?) and its **inner layout** (how its children flow). It's arguably the most powerful single-word property in CSS.

---

## The Big Three

```css
display: block;          /* takes a full row, respects width/height */
display: inline;         /* sits on the line with text, ignores width/height */
display: inline-block;   /* on the line, but respects width/height */
```

| Value | Width fills parent? | New line? | Width/height work? |
|-------|---------------------|-----------|---------------------|
| `block` | Yes | Yes | Yes |
| `inline` | No (content-sized) | No | No (vertical margin/height ignored) |
| `inline-block` | No (content-sized) | No | Yes |

By default, `<div>`, `<p>`, `<h1>`, `<section>` etc. are `block`. `<span>`, `<a>`, `<em>`, `<strong>` are `inline`. You can flip them.

---

## `display: none`

Removes the element from the layout entirely — no space, no rendering, hidden from screen readers (depending on context):

```css
.modal { display: none; }
.modal.is-open { display: block; }
```

> [!TIP]
> If you want to hide visually but keep it in the layout (and accessible), use `visibility: hidden` instead. To hide visually but keep available to screen readers, use a "visually-hidden" utility class.

---

## Flexbox and Grid

The two modern layout modes — they get their own dedicated lessons:

```css
display: flex;     /* one-dimensional layout */
display: grid;     /* two-dimensional layout */

display: inline-flex;
display: inline-grid;
```

These flip the **inner** behavior of an element so its children become flex items or grid items.

---

## Two-Value `display`

The modern spec splits `display` into outer and inner values:

```css
display: block flow;       /* normal block */
display: inline flex;      /* like inline-flex */
display: block grid;       /* like grid */
```

The classic single-value form (`display: flex`) still works and is what you'll see in most code.

---

## `display: contents`

The element disappears from the box tree, but its **children** stay:

```css
.wrapper { display: contents; }
```

Useful for letting child elements participate in a parent's grid or flex layout without an extra wrapper getting in the way.

> [!WARNING]
> Until recently `display: contents` had accessibility bugs. They're largely fixed in modern browsers, but test with a screen reader if you're using it on landmark elements.

---

## Table Display Values

You can simulate table behavior on non-table elements:

```css
.table     { display: table; }
.table-row { display: table-row; }
.table-cell { display: table-cell; }
```

Mostly historical — Flexbox and Grid replaced this. Still occasionally useful for specific alignment tricks.

---

## When to Use What — A Cheat Sheet

| Goal | `display` |
|------|-----------|
| Hide completely | `none` |
| Stack vertically | `block` (the default for divs) |
| Inline with text, no size | `inline` |
| Inline but sizable | `inline-block` |
| Row of items (1D) | `flex` |
| Two-axis layout (2D) | `grid` |
| Strip wrapper, keep children | `contents` |

---

## A Worked Example: Convert a Span to a Card

By default `<span>` is `inline`:

```html
<span class="badge">New</span>
```

To make it look like a chip with size and padding:

```css
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

The `inline-block` is what allows `padding` and `border-radius` to take full effect while keeping the badge in the flow of text.

---

## Up Next

`display` opens many doors. Next we'll close the door on the old way — **positioning** with `position` — before diving into Flexbox and Grid.
