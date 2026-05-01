---
title: HTML SVG
---

# HTML SVG

SVG (Scalable Vector Graphics) creates **resolution-independent** graphics directly in HTML. SVGs look sharp at any size and are perfect for icons, logos, and illustrations.

---

## Inline SVG

Write SVG directly in your HTML:

```html
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="#4f46e5" />
</svg>
```

---

## Basic SVG Shapes

### Circle

```html
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3" />
</svg>
```

### Rectangle

```html
<svg width="200" height="100">
    <rect x="10" y="10" width="180" height="80" rx="10" fill="#10b981" />
</svg>
```

### Line

```html
<svg width="200" height="100">
    <line x1="10" y1="90" x2="190" y2="10" stroke="#ef4444" stroke-width="3" />
</svg>
```

### Ellipse

```html
<svg width="200" height="100">
    <ellipse cx="100" cy="50" rx="90" ry="40" fill="#f59e0b" opacity="0.8" />
</svg>
```

### Polygon

```html
<svg width="200" height="200">
    <polygon points="100,10 190,190 10,190" fill="#8b5cf6" />
</svg>
```

### Text

```html
<svg width="200" height="50">
    <text x="10" y="35" font-size="24" fill="#1e293b" font-family="Arial">Hello SVG!</text>
</svg>
```

---

## The `viewBox` Attribute

`viewBox` defines the coordinate system and enables responsive scaling:

```html
<svg viewBox="0 0 100 100" width="200" height="200">
    <circle cx="50" cy="50" r="45" fill="#4f46e5" />
</svg>
```

`viewBox="minX minY width height"` — the SVG content is drawn in this coordinate space and scales to fit the element's actual dimensions.

> [!TIP]
> Always use `viewBox` to make SVGs responsive. Then set `width` and `height` via CSS for the display size.

---

## SVG as an Image

```html
<img src="icon.svg" alt="Icon" width="50" height="50">
```

### Inline vs `<img>` vs CSS Background

| Method | Styleable with CSS? | Animatable? | Cacheable? |
|--------|-------------------|-------------|------------|
| Inline `<svg>` | ✅ Yes | ✅ Yes | ❌ No |
| `<img src>` | ❌ No | ❌ No | ✅ Yes |
| CSS `background-image` | ❌ No | ❌ No | ✅ Yes |

---

## SVG with CSS

Inline SVGs can be styled with CSS:

```html
<style>
    .icon { fill: #6b7280; transition: fill 0.2s; }
    .icon:hover { fill: #4f46e5; }
</style>

<svg class="icon" viewBox="0 0 24 24" width="32" height="32">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>
```

---

## The `<path>` Element

The most powerful SVG element — draws complex shapes with commands:

```html
<svg viewBox="0 0 24 24" width="48" height="48">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#ef4444"/>
</svg>
```

Path commands: `M` (move), `L` (line), `C` (curve), `Z` (close path), and more.

---

## Summary

- SVG creates **scalable, resolution-independent** graphics
- Use **inline SVG** for CSS styling and animation
- Use **`<img>`** for simple, cacheable icon display
- **`viewBox`** enables responsive scaling
- Basic shapes: `<circle>`, `<rect>`, `<line>`, `<ellipse>`, `<polygon>`, `<text>`
- **`<path>`** handles complex shapes
