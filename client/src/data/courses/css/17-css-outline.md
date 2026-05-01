---
title: CSS Outline
---

# CSS Outline

`outline` looks like `border` but behaves differently — and that difference makes it perfect for **focus indicators**.

---

## Outline vs Border

| Feature | `border` | `outline` |
|---------|----------|-----------|
| Affects layout | **Yes** — adds to the box | **No** — drawn outside, doesn't reflow |
| Per-side control | Yes (`border-top` etc.) | No (single rectangle) |
| Follows `border-radius` | Yes (it shapes the border) | Yes in modern browsers |
| Common use | Visual decoration | Focus indicator |

Because `outline` doesn't change the size of the box, it's the safest choice for any "highlight on focus or hover" effect that mustn't shift content.

---

## Syntax

```css
.button:focus-visible {
  outline: 2px solid #2563eb;
}
```

The shorthand is `<width> <style> <color>` — same form as `border`.

Per-property:

```css
outline-width: 3px;
outline-style: solid;     /* solid | dashed | dotted | double | none */
outline-color: hsl(220 90% 50%);
```

---

## `outline-offset`

Push the outline **away** from the border. Negative values push it **inward**. This is unique to outlines.

```css
.button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 4px;        /* breathing room around the element */
}
```

---

## Focus Rings — The Right Way

Browsers ship a default focus ring on interactive elements. Many sites strip it for "looking nicer":

```css
button:focus { outline: none; }   /* ❌ accessibility disaster */
```

This is wrong. Keyboard users (and screen-reader users) lose all sense of where they are on the page. **Never remove focus indicators without replacing them with something equally visible.**

The accepted pattern today uses `:focus-visible`, which only matches when the user is navigating by keyboard:

```css
button:focus { outline: none; }                  /* hide for mouse */
button:focus-visible {                            /* show for keyboard */
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 4px;
}
```

This gives you a clean look for mouse users **and** an accessible focus ring for keyboard users.

---

## Outline + Border-Radius

Modern browsers respect `border-radius` when drawing the outline:

```css
.card:focus-visible {
  border-radius: 8px;
  outline: 2px solid blue;
  outline-offset: 4px;        /* a rounded outline 4px outside the card */
}
```

Older browsers may render an unrounded rectangle — usually acceptable.

---

## When To Use What

| Goal | Property |
|------|----------|
| Decorative line around a card | `border` |
| Focus indicator that doesn't shift layout | `outline` |
| A "halo" effect on hover | `box-shadow` (no layout impact, blurry/soft) |

---

## Up Next

The visual fundamentals are in place. Now let's make text beautiful, starting with the **text** properties (color, alignment, decoration, spacing).
