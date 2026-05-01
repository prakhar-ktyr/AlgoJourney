---
title: HTML Picture Element
---

# HTML Picture Element

The `<picture>` element provides a way to serve **different images** based on the user's device, screen size, or browser capabilities. It's the key to truly responsive images.

---

## Why `<picture>`?

Different situations call for different images:

- **Small screens** need smaller images (faster loading)
- **High-DPI screens** (Retina) need higher-resolution images
- **Modern browsers** support WebP/AVIF; older ones need JPEG/PNG
- **Different layouts** might need differently cropped images (art direction)

The `<picture>` element handles all of these scenarios.

---

## Basic Syntax

```html
<picture>
    <source srcset="image.webp" type="image/webp">
    <source srcset="image.jpg" type="image/jpeg">
    <img src="image.jpg" alt="Fallback description">
</picture>
```

The browser reads the `<source>` elements top to bottom and uses the **first one it supports**. The `<img>` at the bottom is the **fallback** for browsers that don't support `<picture>`.

> [!IMPORTANT]
> The `<img>` element inside `<picture>` is **required**. Without it, no image will display. The `<source>` elements only provide alternative options.

---

## Format-Based Selection

Serve modern formats to capable browsers with JPEG/PNG fallbacks:

```html
<picture>
    <source srcset="photo.avif" type="image/avif">
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="A scenic mountain view" width="800" height="600">
</picture>
```

The browser will use:
- **AVIF** if supported (best compression)
- **WebP** if AVIF isn't supported (good compression)
- **JPEG** as the final fallback (universal support)

---

## Responsive Images with `media`

Use the `media` attribute to serve different images based on screen size (art direction):

```html
<picture>
    <!-- Wide screens: full landscape -->
    <source media="(min-width: 1200px)" srcset="hero-wide.jpg">

    <!-- Medium screens: cropped landscape -->
    <source media="(min-width: 768px)" srcset="hero-medium.jpg">

    <!-- Small screens: portrait crop -->
    <img src="hero-mobile.jpg" alt="Hero banner" width="400" height="500">
</picture>
```

This is called **art direction** — you're not just scaling the same image, you're providing intentionally different crops or compositions for different screen sizes.

---

## Resolution Switching with `srcset`

For the same image at different resolutions, use `srcset` with width descriptors on `<img>` (you don't always need `<picture>` for this):

```html
<img
    srcset="photo-320.jpg 320w,
            photo-640.jpg 640w,
            photo-1280.jpg 1280w"
    sizes="(max-width: 600px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
    src="photo-640.jpg"
    alt="Responsive photo"
>
```

- **`srcset`** — Lists available image files and their widths
- **`sizes`** — Tells the browser how wide the image will be displayed at various breakpoints
- The browser picks the best image based on screen size and pixel density

---

## Combining Format and Size

You can combine format selection with responsive sizing:

```html
<picture>
    <!-- WebP for large screens -->
    <source
        media="(min-width: 1024px)"
        srcset="hero-large.webp"
        type="image/webp">

    <!-- WebP for small screens -->
    <source
        srcset="hero-small.webp"
        type="image/webp">

    <!-- JPEG for large screens (fallback) -->
    <source
        media="(min-width: 1024px)"
        srcset="hero-large.jpg">

    <!-- JPEG for small screens (final fallback) -->
    <img src="hero-small.jpg" alt="Hero image" width="600" height="400">
</picture>
```

---

## Practical Example: Profile Photo

```html
<picture>
    <!-- Square crop for mobile -->
    <source
        media="(max-width: 600px)"
        srcset="profile-square.webp"
        type="image/webp">
    <source
        media="(max-width: 600px)"
        srcset="profile-square.jpg">

    <!-- Wider crop for desktop -->
    <source
        srcset="profile-wide.webp"
        type="image/webp">

    <img
        src="profile-wide.jpg"
        alt="Jane Doe - Software Engineer"
        width="400"
        height="300"
        loading="lazy">
</picture>
```

---

## `<picture>` vs `<img srcset>`

| Feature | `<picture>` | `<img srcset>` |
|---------|------------|----------------|
| Art direction (different crops) | ✅ Yes | ❌ No |
| Format selection (WebP/AVIF) | ✅ Yes | ❌ No |
| Resolution switching | ✅ Yes | ✅ Yes |
| Simplicity | More verbose | Simpler |

**Use `<picture>`** when you need art direction or format selection.
**Use `<img srcset>`** when you just need the same image at different resolutions.

---

## Summary

- **`<picture>`** provides multiple image sources for different conditions
- **`<source>`** elements specify alternatives (checked top to bottom)
- **`<img>`** inside `<picture>` is the required fallback
- Use **`type`** for format selection (WebP, AVIF, JPEG)
- Use **`media`** for art direction (different crops per screen size)
- Use **`srcset`** with width descriptors for resolution switching
- The browser automatically picks the best match
