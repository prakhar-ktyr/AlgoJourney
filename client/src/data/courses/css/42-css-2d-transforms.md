---
title: CSS 2D Transforms
---

# CSS 2D Transforms

The `transform` property moves, rotates, scales, and skews elements without changing the layout around them. It's GPU-accelerated, smooth, and the foundation of CSS animation.

---

## The Four 2D Functions

```css
transform: translate(50px, 20px);   /* move right 50, down 20 */
transform: rotate(45deg);           /* spin */
transform: scale(1.2);              /* grow 20% */
transform: skew(10deg, 0);          /* slant */
```

Each has component variants:

```css
translateX(50px)  translateY(20px)
scaleX(1.2)       scaleY(0.8)
rotateZ(45deg)    /* same as rotate() */
skewX(10deg)      skewY(5deg)
```

---

## Transform Doesn't Affect Layout

This is the killer feature. A translated element **doesn't push its neighbors**. Hover effects, animations, and interactions can shift things visually without triggering reflow.

```css
.button:hover {
  transform: translateY(-2px);    /* lifts on hover, no jiggling layout */
}
```

---

## Combining Transforms

Apply multiple in a single declaration — they're applied **right to left**:

```css
transform: translate(20px, 0) rotate(45deg) scale(1.2);
```

Order matters! `rotate(45deg) translate(50px, 0)` is *not* the same as `translate(50px, 0) rotate(45deg)`.

---

## Modern Individual Properties

The newer way — much easier to animate independently:

```css
.box {
  translate: 50px 20px;
  rotate: 45deg;
  scale: 1.2;
}
```

These behave like their function equivalents but you can transition each property on its own:

```css
.box { transition: rotate 0.3s, scale 0.3s; }
.box:hover { rotate: 360deg; scale: 1.5; }
```

---

## `transform-origin`

Where the transform pivots from. Default is the center.

```css
.fan {
  transform: rotate(20deg);
  transform-origin: bottom left;   /* swing from a corner */
}
```

Accepts keywords (`top`, `center`, `bottom right`) or coordinates (`50% 50%`, `10px 20px`).

---

## Centering With Translate

A classic absolute-positioning trick:

```css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

Top-left corner sits at center, then `translate(-50%, -50%)` moves it back by half its own size. Works on any-sized element. (Modern alternative: Flexbox or Grid.)

---

## Practical Recipes

### Card hover lift

```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Icon spin

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Image zoom on hover

```css
.tile { overflow: hidden; }
.tile img {
  transition: transform 0.4s;
}
.tile:hover img { transform: scale(1.1); }
```

The `overflow: hidden` on the parent crops the zoomed image to the tile.

### Tilted badge

```css
.badge {
  display: inline-block;
  transform: rotate(-2deg);
}
```

A subtle tilt feels handmade and friendly.

---

## Performance

`transform` and `opacity` are the only two properties the browser can animate **without re-layout or re-paint**. They're handled by the GPU as compositor transforms.

If you must animate, animate `transform` (move with `translate`, not `top`/`left`). Your animations will be silky smooth at 60fps.

---

## Up Next

2D done. Time for the third dimension — **3D transforms**.
