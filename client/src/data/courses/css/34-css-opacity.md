---
title: CSS Opacity
---

# CSS Opacity

`opacity` controls how transparent an element is — from 1 (fully visible) to 0 (invisible). Simple to use, but worth knowing the gotchas.

---

## Basic Use

```css
.faded   { opacity: 0.5; }
.invisible { opacity: 0; }
.solid   { opacity: 1; }
```

Accepts decimals 0–1, or percentages 0%–100%:

```css
opacity: 75%;   /* same as 0.75 */
```

---

## Opacity vs Color Alpha

These two are not the same:

```css
.a { background: rgb(0 0 0 / 0.5); }   /* only the background is half-transparent */
.b { opacity: 0.5; }                   /* the entire element AND its children are half-transparent */
```

Use the **alpha channel** of a color when you only want one property to fade. Use **`opacity`** when you want to fade the whole element.

---

## Opacity 0 vs Display None vs Visibility Hidden

| Property | Takes space? | Clickable? | Accessible? |
|----------|:------------:|:----------:|:-----------:|
| `display: none` | No | No | No (hidden from screen readers) |
| `visibility: hidden` | Yes | No | No |
| `opacity: 0` | Yes | **Yes** | Yes |

A common bug: an element at `opacity: 0` is still **interactive**. Users can tab into invisible buttons. Pair with `pointer-events: none` and `aria-hidden="true"` if needed:

```css
.toast.is-hidden {
  opacity: 0;
  pointer-events: none;
}
```

---

## Stacking Context Side-Effect

Setting `opacity` to anything less than 1 creates a new **stacking context** (we covered this in the z-index lesson). This can trap descendant `z-index` values and cause "why isn't my child appearing on top?" bugs.

If you need a half-transparent background but full z-index control, use a color with alpha **on a child**, not opacity on the parent.

---

## Animating Opacity

Of all the properties you can animate, opacity is one of the **cheapest** for the browser. It can be done on the GPU without re-painting. Use it freely:

```css
.fade {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.fade.is-visible {
  opacity: 1;
}
```

---

## A Practical Example: Disabled Button

```css
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Half-tone, can't click. The browser also blocks focus and click events on disabled controls automatically.

---

## A Practical Example: Image Hover Overlay

```css
.tile {
  position: relative;
}
.tile::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}
.tile:hover::after { opacity: 1; }
```

A dark veil that fades in on hover — a classic gallery effect.

---

## Up Next

Now for one of the most important — and most underestimated — topics in CSS: **units**. The difference between `px`, `em`, `rem`, `%`, and `vw` will reshape how you think about layout.
