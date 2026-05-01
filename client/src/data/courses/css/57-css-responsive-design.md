---
title: CSS Responsive Design
---

# CSS Responsive Design

Responsive design means: **one design system that adapts to any screen** — phone, tablet, laptop, ultrawide monitor, foldable. In modern CSS this is less about juggling media queries and more about choosing the right primitives.

---

## The Modern Recipe

A responsive design today rests on five tools:

1. **Fluid sizing** with `clamp()`, `min()`, `max()`
2. **Intrinsic layout** with `auto-fit` + `minmax()`
3. **Flexbox & Grid** for layout direction
4. **Media queries** as the last resort, not the first
5. **Container queries** for component-level responsiveness

In other words: don't start by listing breakpoints. Start by writing CSS that **doesn't need breakpoints**.

---

## A Mobile-First Mindset

```css
/* Small screen first */
.layout {
  display: grid;
  gap: 1rem;
}

/* Larger screens add columns */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 240px 1fr;
  }
}
```

Mobile devices are the most resource-constrained. Loading the **least** CSS first benefits them most.

---

## Setting the Viewport Meta Tag

A non-CSS but essential step. Without this, mobile browsers render at desktop width and zoom out:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Add this to every HTML document. Forgetting it is the single most common responsive design bug.

---

## Fluid Containers

A bulletproof centered container:

```css
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

- On small screens: 100% minus a 1rem gutter on each side.
- On big screens: capped at 1200px.
- One line, no media queries.

---

## Fluid Typography

```css
:root {
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-h1:   clamp(1.875rem, 1.4rem + 2vw, 3rem);
  --text-h2:   clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
}

body { font-size: var(--text-base); }
h1   { font-size: var(--text-h1); }
h2   { font-size: var(--text-h2); }
```

Typography scales **smoothly** with viewport width, never too small, never too large.

---

## Responsive Grids — Without Media Queries

The single most useful pattern in modern responsive CSS:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

- 1 column on a phone.
- 2 columns on a tablet.
- 4 columns on a desktop.
- All without a single `@media`.

---

## Responsive Images

```css
img {
  max-width: 100%;
  height: auto;
}
```

Two lines that prevent any image from breaking out of its container.

For high-DPI screens, use the HTML `srcset` attribute:

```html
<img src="photo.jpg" srcset="photo@2x.jpg 2x, photo@3x.jpg 3x" alt="">
```

For art-direction (different crops at different sizes), use `<picture>`:

```html
<picture>
  <source media="(min-width: 800px)" srcset="hero-wide.jpg">
  <img src="hero.jpg" alt="">
</picture>
```

---

## Aspect-Ratio for Responsive Media

```css
.video {
  width: 100%;
  aspect-ratio: 16 / 9;
}
```

Maintains the ratio at any width — no padding-hack required.

---

## Hiding Content Responsively

```css
.mobile-only  { display: block; }
.desktop-only { display: none; }

@media (min-width: 768px) {
  .mobile-only  { display: none; }
  .desktop-only { display: block; }
}
```

But: **don't** hide content that's important to one set of users. Hiding navigation on mobile might be intentional; hiding the price isn't.

---

## Responsive Spacing With `clamp()`

```css
.section {
  padding-block: clamp(2rem, 5vw, 5rem);
  padding-inline: clamp(1rem, 4vw, 3rem);
}
```

Spacing fluidly grows with the viewport — small on phones, generous on desktops.

---

## A Complete Responsive Page Skeleton

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --container: min(100% - 2rem, 1200px);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
}

body {
  font-family: system-ui, sans-serif;
  font-size: var(--text-base);
  line-height: 1.6;
  margin: 0;
}

.container { width: var(--container); margin-inline: auto; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

A solid responsive base — a single media query, all of it real.

---

## Up Next

Responsive at the **page** level is solved. But components need to react to **their own** size, not the viewport's. That's what **container queries** do.
