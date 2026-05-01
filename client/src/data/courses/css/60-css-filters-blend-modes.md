---
title: CSS Filters and Blend Modes
---

# CSS Filters and Blend Modes

CSS lets you apply Photoshop-style image effects — blur, brightness, hue rotation — and image-blending math, in pure CSS, with no extra assets.

---

## `filter`

Applies a graphical effect to the entire element (and its children).

```css
.box { filter: blur(4px); }
.box { filter: brightness(1.2); }
.box { filter: contrast(1.4); }
.box { filter: saturate(1.5); }
.box { filter: hue-rotate(45deg); }
.box { filter: invert(1); }
.box { filter: grayscale(1); }
.box { filter: sepia(0.7); }
.box { filter: opacity(0.5); }
.box { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
```

### Stacking filters

```css
.dim {
  filter: brightness(0.7) contrast(1.1) saturate(0.9);
}
```

Effects apply left to right.

---

## `backdrop-filter`

The same effects but applied to **what's behind** the element. This unlocks the "frosted glass" effect:

```css
.glass {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
}
```

Stacking:

```css
.modal-bg {
  backdrop-filter: blur(8px) brightness(0.9);
}
```

> [!TIP]
> `backdrop-filter` requires the element to have a translucent background — otherwise there's nothing visible behind it to filter.

Browser support is excellent now (Safari requires `-webkit-backdrop-filter`):

```css
.glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

---

## Practical Recipes

### Photo with grayscale on hover

```css
.photo {
  filter: grayscale(1);
  transition: filter 0.3s;
}
.photo:hover { filter: grayscale(0); }
```

### Disabled-looking image

```css
.disabled { filter: grayscale(1) opacity(0.6); }
```

### Drop shadow on transparent PNG/SVG

```css
.icon { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
```

`box-shadow` follows the rectangular bounding box — `drop-shadow` follows the alpha shape, perfect for icons.

### Frosted glass navbar

```css
.navbar {
  background: rgb(255 255 255 / 0.7);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
}
```

### "Wow" image hover

```css
.tile img {
  transition: filter 0.3s, transform 0.3s;
}
.tile:hover img {
  filter: brightness(1.05) saturate(1.2);
  transform: scale(1.03);
}
```

---

## `mix-blend-mode`

Blends an element's pixels with the layer **below** it — the same options Photoshop has.

```css
.overlay { mix-blend-mode: multiply; }
.overlay { mix-blend-mode: screen; }
.overlay { mix-blend-mode: overlay; }
.overlay { mix-blend-mode: difference; }
.overlay { mix-blend-mode: color; }
/* + many more */
```

A famous example — text that **inverts** against whatever's behind it:

```css
.invert-text { mix-blend-mode: difference; color: white; }
```

Place over any background and the text auto-contrasts.

---

## `background-blend-mode`

Blends multiple **backgrounds** of the same element:

```css
.tinted {
  background:
    linear-gradient(135deg, #f97316, #ec4899),
    url("photo.jpg") center/cover;
  background-blend-mode: multiply;
}
```

Tints a photo with a gradient — beautiful, fast, no Photoshop required.

---

## Performance

Filters are GPU-accelerated but still cost real time. A few rules:

- Avoid huge blur radii (`blur(50px)+`) on large elements.
- Avoid `backdrop-filter` on dozens of elements simultaneously.
- Test on mid-range mobile devices, not just your laptop.

For animations, animating `filter: blur(...)` is heavy — prefer animating `opacity` of a pre-blurred layer.

---

## Up Next

We've added effects. Time to **mask and clip** — controlling exactly which pixels are visible.
