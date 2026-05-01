---
title: CSS Float
---

# CSS Float

`float` was once the foundation of CSS layout — until Flexbox and Grid arrived. Today it has one shining job: **wrapping text around an image**, the way magazines do.

---

## How Float Works

A floated element is removed from the normal flow, slid to the left or right, and **inline content (like text) flows around it**.

```css
img.left  { float: left;  margin: 0 1rem 1rem 0; }
img.right { float: right; margin: 0 0 1rem 1rem; }
```

```html
<p>
  <img class="left" src="cat.jpg" alt="">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et magna nec
  enim faucibus laoreet... (text wraps around the image on the right)
</p>
```

This is the natural, intended use of float — and it's still the cleanest way to do it.

---

## Float Values

```css
float: none;          /* default */
float: left;
float: right;
float: inline-start;  /* logical: left in LTR, right in RTL */
float: inline-end;
```

---

## Clearing Floats

Because floats are removed from flow, the parent doesn't grow to contain them. Common ways to fix:

### `clear` on the next element

```css
footer { clear: both; }
```

Means "this element starts below any prior floats."

### `display: flow-root` on the parent (modern)

```css
.parent { display: flow-root; }
```

The parent now contains its floats. **This is the recommended modern fix** — clean, no extra markup, no side effects.

### The classic clearfix hack (legacy)

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

You'll still see this in older code. `display: flow-root` is the better choice for new code.

---

## Why Not Use Float for Layout Anymore?

Floats predate proper layout primitives. Building a multi-column page with floats meant juggling widths, margins, and clearfixes — and the result broke at every screen size. Flexbox and Grid replace floats for **all** layout work:

- Side-by-side columns → Flexbox or Grid
- Image gallery → Grid
- Aligning items in a row → Flexbox
- Centering anything → Flexbox

Use float for what it was originally designed for: **inline text wrapping around media**.

---

## A Real-World Modern Use

```css
.article figure.illustration {
  float: inline-start;
  width: 40%;
  margin-inline-end: 1rem;
  margin-block-end: 0.5rem;
  shape-outside: circle();   /* text wraps the image's actual shape */
}
```

`shape-outside` lets text wrap around the visual shape (a circle, a polygon, even an image's alpha channel) — a delightful effect, and one of the few places where float still feels modern.

---

## `clear` Values

```css
clear: none;          /* default */
clear: left;
clear: right;
clear: both;
clear: inline-start;
clear: inline-end;
```

Mostly used on the element that should sit **below** floats.

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Parent collapses (zero height) when children are floated | `display: flow-root` on the parent |
| Two columns built with `float: left` won't align | Use Flexbox or Grid |
| Sticky positioning broken near floats | Move to Flexbox/Grid |
| Floats overlapping responsive content | Use `clear` or, again, modern layout |

---

## Up Next

The other half of the legacy duo — `inline-block` — and what role it still plays today.
