---
title: CSS Clip-Path and Masking
---

# CSS Clip-Path and Masking

`clip-path` and `mask-image` let you **show only part of an element**. Where filters change pixels, clipping and masking decide which pixels are visible at all. They unlock shapes, reveals, and creative imagery without image-editing tools.

---

## `clip-path`

Define a shape — anything outside it disappears.

### Basic shapes

```css
.circle  { clip-path: circle(50%); }
.ellipse { clip-path: ellipse(60% 40%); }
.square  { clip-path: inset(10% 20%); }     /* top right bottom left */
.diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
```

### `inset()`

```css
clip-path: inset(20px);                      /* 20px in on every side */
clip-path: inset(10px 20px 30px 40px);       /* T R B L */
clip-path: inset(10px round 8px);            /* with rounded corners */
```

A modern way to make rounded clips.

### `polygon()`

Probably the most powerful. Each pair is a point in `x y`:

```css
.arrow {
  clip-path: polygon(
    0 20%, 60% 20%,
    60% 0, 100% 50%,
    60% 100%, 60% 80%,
    0 80%
  );
}

.angled-section {
  clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
}
```

The "angled section" is a popular hero-section effect — a slanted bottom edge.

### `path()`

For complex SVG paths:

```css
.blob {
  clip-path: path("M10,10 Q 100,100 200,10 T 300,10 L 300,200 L 10,200 Z");
}
```

Tools like [Clippy](https://bennettfeely.com/clippy/) generate these visually.

---

## Animating `clip-path`

```css
.tile {
  clip-path: circle(50% at 50% 50%);
  transition: clip-path 0.4s;
}
.tile:hover {
  clip-path: circle(70% at 50% 50%);
}
```

Animations work as long as the **shape function** matches (e.g., `circle` to `circle`, `polygon` to `polygon` with the same number of points).

A reveal effect:

```css
.reveal {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1s;
}
.reveal.visible {
  clip-path: inset(0 0 0 0);
}
```

---

## `mask-image`

Use any image (often an SVG or gradient) as a mask. Where the mask is **opaque**, the element shows; where it's **transparent**, the element hides.

### Gradient as a mask — fade-out edges

```css
.fade-bottom {
  mask-image: linear-gradient(to bottom, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent);
}
```

Useful for "scroll fade" effects on long lists.

### Image as a mask

```css
.shape {
  mask-image: url("shape.svg");
  -webkit-mask-image: url("shape.svg");
  mask-size: contain;
  mask-repeat: no-repeat;
}
```

> [!NOTE]
> Always include both `mask-*` and `-webkit-mask-*` for now — Safari still needs the prefix.

### Multiple masks

```css
mask-image:
  linear-gradient(black, black),
  url("noise.png");
mask-composite: intersect;
```

You can blend masks like layers.

---

## Practical Patterns

### Round avatar without `border-radius`

```css
.avatar { clip-path: circle(50%); }
```

(Practical difference: `clip-path` cleanly clips children, but `border-radius` is more accessible to overflow.)

### Trapezoid / angled section

```css
.section {
  clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  background: linear-gradient(135deg, #4f46e5, #ec4899);
  padding-block: 6rem;
}
```

### Image with feathered (soft) edges

```css
.feather {
  mask-image: radial-gradient(ellipse at center, black 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 60%, transparent 100%);
}
```

### Scroll-fade for a long list

```css
.scroll-fade {
  overflow: auto;
  mask-image: linear-gradient(black 80%, transparent);
  -webkit-mask-image: linear-gradient(black 80%, transparent);
}
```

### "Reveal" on hover

```css
.tile {
  clip-path: inset(0 0 50% 0);
  transition: clip-path 0.4s;
}
.tile:hover {
  clip-path: inset(0);
}
```

---

## Accessibility Notes

`clip-path` and `mask-image` only hide pixels. The element is **still in the layout**, **still focusable**, **still read by screen readers**. To truly hide content, use `display: none` or the `hidden` attribute.

---

## Up Next

We've shaped pixels. Now we'll engineer scroll behavior with **scroll snap**.
