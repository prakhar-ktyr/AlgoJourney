---
title: CSS Rounded Corners
---

# CSS Rounded Corners

`border-radius` curves an element's corners. One of the simplest, most impactful visual properties in CSS.

---

## Basic Use

```css
.box   { border-radius: 8px; }
.pill  { border-radius: 999px; }
.circle { border-radius: 50%; }
```

`50%` makes a perfect circle (when the element is square). `999px` makes a "pill" — a rectangle with fully rounded ends.

---

## Per-Corner

```css
border-top-left-radius:     8px;
border-top-right-radius:    8px;
border-bottom-right-radius: 0;
border-bottom-left-radius:  0;
```

Or in shorthand (top-left → top-right → bottom-right → bottom-left, clockwise):

```css
border-radius: 8px 8px 0 0;
```

A common pattern — rounded top, square bottom (think tabs):

```css
.tab { border-radius: 8px 8px 0 0; }
```

---

## Logical Properties

For RTL-aware layouts:

```css
border-start-start-radius: 8px;     /* top-left in LTR */
border-end-end-radius:     8px;     /* bottom-right in LTR */
```

---

## Elliptical Corners

Use a slash to give X and Y radii separately:

```css
border-radius: 50% / 25%;
```

This makes an oval. You can mix per-corner:

```css
border-radius: 50px 20px / 20px 50px;
```

Used sparingly for organic shapes.

---

## Common Patterns

### Card

```css
.card {
  border-radius: 12px;
  overflow: hidden;     /* clips child images to the rounded shape */
}
```

### Avatar

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
```

### Button

```css
.button { border-radius: 6px; }
.pill-button { border-radius: 999px; }
```

### Speech bubble (rough version)

```css
.bubble {
  border-radius: 16px 16px 16px 0;
  padding: 1rem;
  background: #e0e7ff;
}
```

A square corner becomes the "pointer" toward the speaker.

---

## Border-Radius and Backgrounds

The corner radius **clips** the background. So a green box with a blue background gets a green-and-blue rounded shape — no transparency tricks needed.

```css
.tile {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 16px;
}
```

---

## Border-Radius and Children

Children that overflow the box are **not** clipped to the radius unless the parent has `overflow: hidden`:

```css
.card {
  border-radius: 12px;
  overflow: hidden;       /* now child images don't poke out the corners */
}
```

This is the most common reason a card has unexpected sharp corners.

---

## Outline and Border-Radius

Modern browsers respect `border-radius` when drawing the `outline`. Older ones may render an unrounded rectangle — usually acceptable.

---

## Up Next

Round shapes done. Now for the splashier visual properties — **gradients**.
