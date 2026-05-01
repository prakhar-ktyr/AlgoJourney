---
title: HTML Images
---

# HTML Images

Images make web pages more engaging and informative. The `<img>` element is used to embed images in HTML.

---

## The `<img>` Element

The `<img>` element is an **empty element** — it has no closing tag. It requires two attributes:

```html
<img src="photo.jpg" alt="A beautiful landscape">
```

- **`src`** (source) — The path or URL to the image file
- **`alt`** (alternative text) — A text description of the image

---

## The `src` Attribute

The `src` attribute specifies **where to find** the image:

### Local Image (Relative Path)

```html
<!-- Same directory -->
<img src="logo.png" alt="Company Logo">

<!-- Subdirectory -->
<img src="images/hero.jpg" alt="Hero banner">

<!-- Parent directory -->
<img src="../assets/icon.png" alt="Icon">
```

### External Image (Absolute URL)

```html
<img src="https://www.example.com/images/photo.jpg" alt="External photo">
```

> [!TIP]
> Host your own images whenever possible. External images can be slow, get moved, or disappear entirely.

---

## The `alt` Attribute

The `alt` attribute provides **alternative text** that serves multiple purposes:

1. **Accessibility** — Screen readers read the alt text to visually impaired users
2. **Broken images** — Displays the text if the image fails to load
3. **SEO** — Search engines use alt text to understand image content

```html
<!-- Descriptive alt text -->
<img src="sunset.jpg" alt="Golden sunset over a calm ocean with orange and purple clouds">

<!-- Logo with alt text -->
<img src="logo.png" alt="Acme Corporation Logo">

<!-- Decorative image (empty alt) -->
<img src="decorative-line.png" alt="">
```

> [!IMPORTANT]
> Always include the `alt` attribute. If the image is purely decorative (adds no information), use an **empty** `alt=""`. Never omit the attribute entirely.

---

## Width and Height

Set image dimensions using `width` and `height` attributes (in pixels):

```html
<img src="photo.jpg" alt="My photo" width="600" height="400">
```

Or use CSS:

```html
<img src="photo.jpg" alt="My photo" style="width: 600px; height: 400px;">
```

### Why Specify Dimensions?

When you specify width and height, the browser **reserves space** for the image before it loads. This prevents layout shifts (the page jumping around as images load).

```html
<!-- Good: prevents layout shift -->
<img src="photo.jpg" alt="Photo" width="800" height="600">

<!-- Also good: responsive with CSS -->
<img src="photo.jpg" alt="Photo" style="width: 100%; max-width: 800px; height: auto;">
```

---

## Common Image Formats

| Format | Best For | Features |
|--------|----------|----------|
| **JPEG** (.jpg) | Photos, complex images | Lossy compression, small file size, no transparency |
| **PNG** (.png) | Logos, graphics, screenshots | Lossless compression, supports transparency |
| **GIF** (.gif) | Simple animations | Limited to 256 colors, supports animation |
| **SVG** (.svg) | Icons, logos, illustrations | Vector-based, scalable, very small file size |
| **WebP** (.webp) | Modern replacement for JPEG/PNG | Better compression, supports transparency & animation |
| **AVIF** (.avif) | Next-gen format | Best compression, supports HDR |

> [!TIP]
> Use **WebP** as your primary format for modern browsers. It offers better compression than both JPEG and PNG with support for transparency.

---

## Responsive Images with CSS

Make images scale to fit their container:

```html
<style>
    img {
        max-width: 100%;
        height: auto;
    }
</style>

<img src="wide-photo.jpg" alt="Wide landscape photo">
```

This ensures the image:
- Never exceeds its container's width
- Maintains its aspect ratio
- Scales down on smaller screens

---

## Images as Links

Wrap an image in an `<a>` tag to make it clickable:

```html
<a href="https://www.example.com">
    <img src="logo.png" alt="Go to Example.com" width="200">
</a>
```

---

## Background Images with CSS

You can also set images as element backgrounds using CSS:

```html
<div style="
    background-image: url('hero.jpg');
    background-size: cover;
    background-position: center;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
">
    Welcome to My Website
</div>
```

---

## The `loading` Attribute

The `loading` attribute enables **lazy loading** — images load only when they're about to enter the viewport:

```html
<!-- Lazy load (loads when user scrolls near) -->
<img src="photo.jpg" alt="Photo" loading="lazy">

<!-- Eager load (loads immediately — default) -->
<img src="hero.jpg" alt="Hero banner" loading="eager">
```

> [!TIP]
> Use `loading="lazy"` on images that are **below the fold** (not visible when the page first loads). Keep `loading="eager"` for above-the-fold images like hero banners and logos.

---

## Summary

| Attribute | Purpose |
|-----------|---------|
| `src` | Path to the image file |
| `alt` | Alternative text (accessibility + SEO) |
| `width` / `height` | Dimensions (prevents layout shift) |
| `loading` | `lazy` or `eager` loading |
| `title` | Tooltip on hover |

- Always include **`alt`** text for accessibility
- Specify **`width`** and **`height`** to prevent layout shifts
- Use **responsive CSS** (`max-width: 100%; height: auto;`)
- Prefer **WebP** format for better compression
- Use **`loading="lazy"`** for below-the-fold images
