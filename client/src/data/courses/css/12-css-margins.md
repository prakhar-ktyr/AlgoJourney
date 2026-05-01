---
title: CSS Margins
---

# CSS Margins

Margin is the **transparent space outside** an element's border. It pushes other elements away.

---

## Setting Margins

Apply to all four sides at once:

```css
.box { margin: 1rem; }
```

Or pick sides:

```css
.box {
  margin-top:    1rem;
  margin-right:  2rem;
  margin-bottom: 1rem;
  margin-left:   0;
}
```

---

## Shorthand Forms

```css
margin: 10px;                 /* all four sides */
margin: 10px 20px;            /* vertical | horizontal */
margin: 10px 20px 30px;       /* top | horizontal | bottom */
margin: 10px 20px 30px 40px;  /* top | right | bottom | left (clockwise) */
```

> [!TIP]
> Memorize **TRBL** ("trouble") for the four-value form: **T**op, **R**ight, **B**ottom, **L**eft.

---

## Logical Margins

The modern, internationalization-friendly form:

```css
margin-block:  1rem;          /* top + bottom (in horizontal writing) */
margin-inline: auto;          /* left + right */

margin-block-start: 2rem;
margin-inline-end:  1rem;
```

Use logical margins when you can — they "do the right thing" in right-to-left layouts.

---

## `auto` and Centering

A horizontal `margin: auto` on a **block** element with a fixed width centers it:

```css
.container {
  width: 800px;
  margin: 0 auto;        /* centers horizontally */
  /* same as: margin-inline: auto; */
}
```

Vertical `auto` does **not** center in normal flow — use Flexbox or Grid for that.

---

## Negative Margins

Margins can be **negative**, pulling elements together or beyond their parent:

```css
.full-bleed {
  margin-inline: -1rem;   /* break out of parent's padding */
}

.tag-row > * + * {
  margin-left: -4px;      /* overlap chips */
}
```

Powerful but easy to misuse. Reach for them sparingly.

---

## Margin Collapsing

This is the most surprising rule in CSS:

> When two **vertical** margins meet, they **collapse** into a single margin equal to the **larger** of the two.

```html
<p style="margin-bottom: 30px;">First</p>
<p style="margin-top: 20px;">Second</p>
```

The space between them is **30px**, not 50px. The smaller margin is absorbed by the larger.

### Rules of collapsing
- Only happens with **vertical** (`block-axis`) margins, never horizontal.
- Only between **adjacent block-level** siblings, or between a parent and its first/last child if no border or padding intervenes.
- Does **not** happen inside Flexbox or Grid containers.
- Does not happen for floated or absolutely positioned elements.

If collapsing surprises you, the easy fix is to use Flexbox `gap` instead:

```css
.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

`gap` does not collapse and is far more predictable.

---

## The "Stack" Pattern

Instead of giving every element its own margin (which forces every component to know about its neighbors), apply spacing at the parent:

```css
.stack > * + * {
  margin-block-start: 1rem;
}
```

This selects every child *after the first* and gives it a top margin — known as the **owl selector**. Result: even spacing between all children, no first-child special case.

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Margins not applying to inline elements | Inline elements ignore vertical margins. Use `display: inline-block` or `block`. |
| Vertical margin "missing" between siblings | Margin collapsing — switch to Flexbox `gap` or use padding. |
| Centering with `margin: auto` doesn't work | Element needs an explicit width and must be `display: block`. |

---

## Up Next

Margin is the space **outside** an element. **Padding** is the space inside. Let's go there next.
