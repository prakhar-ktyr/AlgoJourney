---
title: CSS Z-Index
---

# CSS Z-Index

`z-index` controls which positioned elements sit on top of others. Sounds simple — but it's tied to the concept of **stacking contexts**, which is where the surprises live.

---

## Basic Use

```css
.modal { position: fixed; z-index: 100; }
.toast { position: fixed; z-index: 200; }   /* sits above the modal */
```

Two requirements:
1. The element must be **positioned** (`relative`, `absolute`, `fixed`, or `sticky`).
2. `z-index` accepts any integer (including negative — for "behind" effects).

---

## What Is a Stacking Context?

A stacking context is a small "world" of layered elements. Inside the world, `z-index` values battle it out. But every world is *itself* a single layer in its parent's world.

A new stacking context is created by:
- Setting `position` (other than static) **and** a `z-index` other than `auto`
- `opacity` less than 1
- `transform` other than `none`
- `filter`, `backdrop-filter`, `mix-blend-mode` (anything but `normal`)
- `will-change` of certain properties
- Modern: `isolation: isolate`

---

## The Big Gotcha

```html
<div class="parent">             <!-- z-index: 1, opacity: 0.99 -->
  <div class="child">z 9999</div>
</div>
<div class="other">z 5</div>     <!-- positioned -->
```

Even though the child has `z-index: 9999`, it sits **below** `.other` (which has `z-index: 5`).

Why? `.parent` formed a stacking context (because of `opacity: 0.99`). Inside that context the child can be as high as it wants — but the **whole parent** competes against `.other` at z-index `1`. And `1 < 5`.

Stacking contexts trap their children. This is the root cause of 95% of "my z-index isn't working" bugs.

---

## Inspecting Stacking

DevTools (Chrome) has a "Layers" panel and a "3D View" extension. They visualize stacking contexts so you can see exactly which element traps which. Indispensable when debugging.

---

## A Sensible Z-Index Scale

Don't sprinkle arbitrary numbers. Define a scale:

```css
:root {
  --z-base:    1;
  --z-overlay: 50;
  --z-modal:   100;
  --z-toast:   200;
  --z-tooltip: 300;
}

.modal   { z-index: var(--z-modal); }
.toast   { z-index: var(--z-toast); }
.tooltip { z-index: var(--z-tooltip); }
```

This way you never have a stylesheet with `z-index: 9999`, `z-index: 99999`, `z-index: 999999`.

---

## `isolation: isolate`

A modern, surgical way to create a stacking context **without** any visual side effects:

```css
.card { isolation: isolate; }
```

Now any descendants with `z-index` are scoped to the card — they can't accidentally leak above or below other parts of the page. Fantastic for component CSS.

---

## Negative `z-index`

You can place an element **behind** the page background:

```css
.background-image {
  position: absolute;
  inset: 0;
  z-index: -1;
}
```

Caveat: a negative `z-index` is still trapped by its stacking context, so it goes behind that context's siblings, **not** the whole document.

---

## Common Layering Recipes

### Modal with backdrop

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}
.modal {
  position: fixed;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  z-index: 60;
}
```

### Sticky header with content scrolling under it

```css
header { position: sticky; top: 0; z-index: 10; background: white; }
```

### Image with text overlay

```css
.card { position: relative; }
.card img { width: 100%; }
.card .caption {
  position: absolute;
  bottom: 0;
  z-index: 1;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
```

---

## Up Next

Layering covered. Now — what to do when content is too big to fit: **overflow**.
