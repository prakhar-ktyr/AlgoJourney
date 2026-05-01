---
title: CSS Object Fit and Position
---

# CSS Object Fit and Object Position

`object-fit` controls how an `<img>` or `<video>` fills its box — the same way `background-size` works for backgrounds. Combined with `object-position`, it solves the eternal "how do I make this image cover this card without distortion?" problem.

---

## The Problem

Without these properties, an image whose `width` and `height` you set to specific dimensions either **stretches** (distorts) or shows **empty space**:

```html
<img src="square.jpg" style="width: 300px; height: 200px;">
```

The image becomes a 300×200 stretch — squashed.

---

## `object-fit`

```css
img { object-fit: fill; }       /* default — stretches to fill, distorts */
img { object-fit: contain; }    /* fits inside, no crop, may leave space */
img { object-fit: cover; }      /* fills, crops overflow — usually what you want */
img { object-fit: none; }       /* original size, no scaling */
img { object-fit: scale-down; } /* like contain or none, whichever is smaller */
```

**`cover` is the workhorse.** Use it for hero images, avatars, card thumbnails — anywhere a fixed-size box must hold an image of unknown ratio.

```css
.thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

---

## `object-position`

When `object-fit: cover` crops, **where** does it crop from? `object-position` decides — same syntax as `background-position`:

```css
img {
  object-fit: cover;
  object-position: center;       /* default */
  object-position: top;          /* keep the top, crop the bottom */
  object-position: 25% 75%;
  object-position: 0 100%;       /* keep the bottom-left */
}
```

For portraits where heads are at the top, `object-position: top` is often the magic touch.

---

## `aspect-ratio` Pairing

Combining `aspect-ratio` and `object-fit` is the modern recipe for responsive image cards:

```css
.card-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

The image is always 16:9, fills its box, never distorts. Perfect.

---

## Practical Recipes

### Avatar (always circular, never squished)

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
```

### Card hero image

```css
.card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}
```

### Logo that maintains its shape

```css
.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
```

### Thumbnail focused on a person's face

```css
.headshot {
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center 25%;
}
```

### Smooth zoom on hover (keeping crop)

```css
.tile { overflow: hidden; }
.tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.tile:hover img { transform: scale(1.1); }
```

---

## When To Use `<img>` vs Background Image

| Use `<img>` (with `object-fit`) | Use CSS background image |
|---|---|
| Image is meaningful content | Image is purely decorative |
| You need `alt` text | No accessibility requirement |
| You need lazy loading | Always loaded |
| You want native responsive (`srcset`) | Single fixed asset |

For real product images and photographs, **prefer `<img>`**. Backgrounds are best for textures, hero overlays, and decorative patterns.

---

## Up Next

Now for the special-effect family — **filters and blend modes**.
