---
title: CSS Inline-Block
---

# CSS Inline-Block

`display: inline-block` sits on a line with text (like `inline`) but respects width, height, padding, and margin (like `block`). It used to be the foundation of horizontal layouts. Today, **Flexbox replaces it for layout** — but `inline-block` still has uses.

---

## Quick Recap of the Three Display Types

| | Sits inline? | Respects width/height? |
|---|--|--|
| `inline` | Yes | No |
| `block` | No (full row) | Yes |
| `inline-block` | Yes | Yes |

---

## A Classic Use — A Pill / Badge

```html
<span class="badge">New</span>
```

```css
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 999px;
  font-size: 0.75rem;
}
```

Without `inline-block` the padding would visually overflow but not push surrounding text apart.

---

## A Custom Bullet

```html
<span class="dot"></span> Online
```

```css
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #16a34a;
  border-radius: 50%;
  vertical-align: middle;
}
```

Inline elements ignore width/height — `inline-block` makes the dot real.

---

## Building Rows of Items (Legacy)

Before Flexbox, the recipe for a row of equal-height items was:

```css
.item {
  display: inline-block;
  vertical-align: top;
  width: 30%;
  margin: 0 1%;
}
```

Two pain points:

### 1. The Whitespace Gap

`inline-block` items inherit the whitespace between HTML tags as **real space**:

```html
<span class="item">A</span>
<span class="item">B</span>     <!-- a tiny space appears between them -->
```

Workarounds were ugly: zero font-size on the parent, HTML comments, removing whitespace from the source. Flexbox — which uses `gap` — eliminates this entire class of bug.

### 2. No Easy Equal Height

If one item is taller, the others don't grow to match. Flexbox does this for free.

---

## When to Use `inline-block` Today

- Small inline UI bits (badges, dots, pills, icon containers).
- Form widgets that need width/height on inline elements.
- Buttons styled as inline elements that mustn't break the line.

For *layout*, reach for **Flexbox** instead.

---

## `vertical-align`

`inline-block` elements live on a text baseline by default. Adjust with `vertical-align`:

```css
.icon { vertical-align: middle; }   /* common for icons next to text */
.icon { vertical-align: -0.125em; } /* fine-tune to optical center */
.icon { vertical-align: top; }
.icon { vertical-align: bottom; }
.icon { vertical-align: text-top; }
```

This property has no effect on flex or grid items.

---

## A Quick Example: Inline Buttons

```css
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
```

Now you can drop a `<a class="btn">` mid-paragraph and it'll behave nicely. (For multiple buttons in a row, wrap them in a `display: flex` container with `gap`.)

---

## Up Next

Now the fun stuff — **pseudo-classes** like `:hover`, `:focus`, `:nth-child`, and the brand-new `:has()`.
