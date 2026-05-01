---
title: CSS 3D Transforms
---

# CSS 3D Transforms

CSS can render elements in three dimensions — flipping cards, perspective tilts, cube-shaped menus. The math sounds intimidating but the API is small.

---

## The Z Axis

In CSS:
- **X** runs horizontally (positive right)
- **Y** runs vertically (positive **down**)
- **Z** runs *toward you* (positive forward)

3D transforms add `Z` versions of the 2D functions:

```css
transform: translateZ(50px);    /* moves toward the viewer */
transform: rotateX(45deg);      /* tilts forward/back */
transform: rotateY(45deg);      /* spins like a door */
transform: rotateZ(45deg);      /* same as rotate() */
transform: scaleZ(2);           /* depth scaling (with perspective) */
```

---

## `perspective`

Without perspective, 3D transforms look flat (just stretched 2D). `perspective` sets how far the viewer is from the scene:

```css
.scene {
  perspective: 800px;
}
```

Smaller values = more dramatic distortion. `1000px` is a sensible default.

You can also apply perspective per-element:

```css
.card {
  transform: perspective(800px) rotateY(20deg);
}
```

But for multiple elements sharing a 3D space, set `perspective` on the parent.

---

## `transform-style`

Tells the browser to preserve children in 3D space:

```css
.scene {
  perspective: 800px;
}
.card {
  transform-style: preserve-3d;   /* children sit in 3D, not flattened */
}
```

Without `preserve-3d`, every child collapses back to 2D — your cube becomes a stack of squares.

---

## `backface-visibility`

When you flip an element, do you want to see its back?

```css
.card-face {
  backface-visibility: hidden;   /* hide when rotated past 90° */
}
```

Essential for the classic flip-card effect.

---

## A Classic: Flip Card

```html
<div class="flip">
  <div class="flip-inner">
    <div class="face front">Front</div>
    <div class="face back">Back</div>
  </div>
</div>
```

```css
.flip { perspective: 800px; }

.flip-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  width: 200px;
  height: 200px;
}

.flip:hover .flip-inner { transform: rotateY(180deg); }

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: grid;
  place-items: center;
  background: white;
  border: 1px solid #e5e7eb;
}

.back { transform: rotateY(180deg); background: #2563eb; color: white; }
```

Hover the card and it flips smoothly to its back side. Pure CSS.

---

## Perspective Tilt on Hover

```css
.tilt {
  transition: transform 0.3s;
  transform-style: preserve-3d;
}
.tilt:hover {
  transform: perspective(800px) rotateX(8deg) rotateY(-8deg);
}
```

A gentle "hovering above the page" effect.

---

## Cube

```css
.cube {
  position: relative;
  width: 200px; height: 200px;
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(30deg);
}
.face {
  position: absolute;
  width: 200px; height: 200px;
  background: rgba(99, 102, 241, 0.7);
  border: 1px solid white;
}
.front  { transform: translateZ(100px); }
.back   { transform: rotateY(180deg) translateZ(100px); }
.right  { transform: rotateY( 90deg)  translateZ(100px); }
.left   { transform: rotateY(-90deg)  translateZ(100px); }
.top    { transform: rotateX( 90deg)  translateZ(100px); }
.bottom { transform: rotateX(-90deg)  translateZ(100px); }
```

Position each face 100px out from the cube's center. The result: a real cube you can rotate.

---

## Performance Caveats

3D transforms are GPU-accelerated, so they're fast — but:
- Complex 3D scenes with many layers can hit memory limits on mobile.
- Test on real devices, not just desktop.

Also, **`will-change: transform`** can hint the browser to promote the element to its own compositor layer:

```css
.flip-inner { will-change: transform; }
```

Use sparingly — too many `will-change` declarations defeat the purpose.

---

## Up Next

We've moved elements in space. Now let's move them in **time** — with **transitions**.
