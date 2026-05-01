---
title: CSS Padding
---

# CSS Padding

Padding is the **space inside** an element, between its content and its border. Unlike margin, padding **takes the background color** of the element.

---

## Setting Padding

```css
.card { padding: 1rem; }
```

Per-side:

```css
.card {
  padding-top:    1rem;
  padding-right:  1.5rem;
  padding-bottom: 1rem;
  padding-left:   1.5rem;
}
```

Shorthand follows the same TRBL clockwise rule as `margin`:

```css
padding: 10px;
padding: 10px 20px;            /* vertical | horizontal */
padding: 10px 20px 30px 40px;  /* T R B L */
```

---

## Logical Padding

```css
padding-block:  1rem;
padding-inline: 1.5rem;
padding-inline-end: 0;
```

Recommended for any layout that may flip in right-to-left languages.

---

## Padding vs Margin

| Property | Position | Background fills it? | Collapses? | Use for... |
|----------|----------|---------------------|------------|------------|
| `margin` | Outside the border | No | Yes (vertical, in flow) | Spacing **between** elements |
| `padding` | Inside the border | Yes | No | Breathing room **inside** elements |

A button needs padding (so the text isn't flush against the edge). A list of cards needs margin or `gap` (so they don't touch each other).

---

## Padding Affects Element Size

By default, padding adds to the element's rendered width:

```css
.box {
  width: 200px;
  padding: 20px;
  /* Rendered width: 240px */
}
```

This trips up everyone. The fix is `box-sizing: border-box`, which is so common it's usually applied globally:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

With that in place, `width: 200px` truly means 200px including padding and border. We'll cover `box-sizing` in detail soon.

---

## Percentage Padding — A Subtle Gotcha

Percentage padding is calculated relative to the **parent's width**, even for `padding-top` and `padding-bottom`:

```css
.aspect-16x9 {
  width: 100%;
  padding-top: 56.25%;   /* 9 / 16 = 56.25% */
  height: 0;
}
```

This is the classic trick for fixed-aspect-ratio boxes (used pre-`aspect-ratio` property). Today, prefer:

```css
.aspect-16x9 {
  aspect-ratio: 16 / 9;
}
```

---

## Common Patterns

### Buttons

```css
.button {
  padding: 0.5rem 1rem;        /* compact horizontal */
  padding-block: 0.5rem;       /* with logical syntax */
  padding-inline: 1rem;
}
```

### Cards

```css
.card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
}
```

### Section Padding (responsive)

```css
.section {
  padding-block: clamp(2rem, 5vw, 5rem);
  padding-inline: 1rem;
}
```

`clamp()` gives you fluid padding that grows with the viewport but stays within sensible bounds.

---

## Inline Elements and Padding

`padding` works on inline elements **horizontally** but vertical padding doesn't push surrounding content apart — it just visually overflows:

```html
<span style="padding: 1rem; background: yellow;">inline</span>
```

The yellow box will overlap the lines above and below. To fix, use `display: inline-block` or `block`.

---

## Up Next

We have spacing inside (padding) and outside (margin). Now let's pin down **width and height** — and then put it all together with the **box model**.
