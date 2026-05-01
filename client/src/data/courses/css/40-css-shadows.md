---
title: CSS Shadows
---

# CSS Shadows

Shadows add depth, hierarchy, and focus. CSS gives you two kinds: **`box-shadow`** (around boxes) and **`text-shadow`** (around text).

---

## `box-shadow`

```css
.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

The four numbers, in order: `<x> <y> <blur> <spread>`, then `<color>`.

| Value | Meaning |
|-------|---------|
| `x` | Horizontal offset (positive = right) |
| `y` | Vertical offset (positive = down) |
| `blur` | How fuzzy the edge is |
| `spread` | Grow or shrink the shadow before blurring |
| `color` | Color (with alpha) |

Add `inset` to push the shadow **inside** the box:

```css
.well {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## Multiple Shadows

Comma-separate to layer multiple shadows. This is how you build subtle, realistic "elevation":

```css
.elevated {
  box-shadow:
    0 1px 1px rgba(0,0,0,0.05),
    0 2px 4px rgba(0,0,0,0.05),
    0 4px 8px rgba(0,0,0,0.05),
    0 8px 16px rgba(0,0,0,0.05);
}
```

Stacking small shadows with growing blur looks much more natural than one big one.

---

## A Material-Style Elevation Scale

```css
:root {
  --shadow-sm:  0 1px 2px  rgba(0,0,0,0.05);
  --shadow:     0 1px 3px  rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 6px  rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl:  0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04);
}

.card     { box-shadow: var(--shadow); }
.card.hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
```

Define once, use everywhere — a key part of a design system.

---

## Colored Shadows

For depth that feels right, **tint shadows toward the surface beneath**, not pure black:

```css
.button-blue {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
```

Brand-colored shadows on brand-colored buttons feel cohesive and modern.

---

## `text-shadow`

Same `<x> <y> <blur> <color>` pattern, but no spread:

```css
h1 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

Use lightly. Heavy text shadows make text harder to read.

### Glow effect

```css
.glow {
  color: white;
  text-shadow: 0 0 8px rgba(255, 200, 0, 0.8);
}
```

### Letterpress effect (light text on dark)

```css
.embossed {
  color: #d1d5db;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## `drop-shadow` Filter

For shadows that follow the **alpha shape** (instead of the bounding box), use the `filter` function:

```css
.icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
```

`box-shadow` would shadow the rectangular box — `drop-shadow` follows the icon's silhouette. This is critical for SVGs, transparent PNGs, and clipped shapes.

---

## Performance

`box-shadow` and `text-shadow` are not free. Large blurs (50px+) on many elements can slow down scrolling. For animations:

- **Animate `transform` and `opacity`** instead.
- Use `will-change: transform` if you must animate the shadow.

---

## A Common Recipe: Hover Lift

```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

Subtle and instantly more "tactile."

---

## Up Next

We've added depth. Next: **text effects** — fancy headings, gradient fills, knockout text, and more.
