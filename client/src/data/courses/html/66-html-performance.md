---
title: HTML Performance
---

# HTML Performance

Optimizing your HTML improves page load speed, user experience, and search rankings. Here are the key techniques.

---

## Lazy Loading Images

Load images only when they're about to enter the viewport:

```html
<!-- Below-the-fold images: lazy -->
<img src="photo.jpg" alt="Photo" loading="lazy" width="800" height="600">

<!-- Above-the-fold images: eager (default) -->
<img src="hero.jpg" alt="Hero" loading="eager" width="1200" height="600">
```

Also works on iframes:

```html
<iframe src="https://example.com" loading="lazy" title="Example"></iframe>
```

---

## Script Loading: `defer` vs `async`

```html
<!-- Blocks rendering (BAD for performance) -->
<script src="app.js"></script>

<!-- Loads in parallel, runs after HTML parsed (BEST for most scripts) -->
<script src="app.js" defer></script>

<!-- Loads in parallel, runs immediately when ready (analytics, ads) -->
<script src="analytics.js" async></script>
```

| Attribute | Loads | Executes | Order |
|-----------|-------|----------|-------|
| (none) | Blocking | Immediately | In order |
| `defer` | Parallel | After HTML parsed | In order |
| `async` | Parallel | When ready | Any order |

> [!TIP]
> Use **`defer`** for all your main scripts. Use **`async`** only for independent scripts like analytics.

---

## Preload, Prefetch & Preconnect

### `preload` — Critical Resources

Load resources needed for the current page immediately:

```html
<link rel="preload" href="critical-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero.jpg" as="image">
```

### `prefetch` — Future Resources

Load resources needed for the next likely navigation:

```html
<link rel="prefetch" href="/next-page.html">
<link rel="prefetch" href="/data/next-data.json" as="fetch">
```

### `preconnect` — Early Connections

Establish early connections to third-party domains:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com">
```

### `dns-prefetch` — DNS Lookup

Resolve DNS early for domains you'll connect to later:

```html
<link rel="dns-prefetch" href="https://analytics.example.com">
```

---

## Image Optimization

```html
<!-- Use modern formats -->
<picture>
    <source srcset="photo.avif" type="image/avif">
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="Photo" width="800" height="600" loading="lazy">
</picture>

<!-- Responsive images -->
<img srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
     sizes="(max-width: 600px) 100vw, 50vw"
     src="photo-800.jpg" alt="Photo" loading="lazy">
```

---

## Prevent Layout Shifts

Always specify image and video dimensions:

```html
<!-- GOOD: dimensions prevent layout shift -->
<img src="photo.jpg" alt="Photo" width="800" height="600">

<!-- GOOD: CSS aspect-ratio -->
<img src="photo.jpg" alt="Photo" style="width: 100%; aspect-ratio: 4/3;">
```

---

## Core Web Vitals

Google measures these metrics for ranking:

| Metric | What It Measures | Good Score |
|--------|-----------------|------------|
| **LCP** (Largest Contentful Paint) | Loading speed | < 2.5s |
| **FID** (First Input Delay) | Interactivity | < 100ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 |

---

## The `fetchpriority` Attribute

```html
<!-- High priority for hero image -->
<img src="hero.jpg" alt="Hero" fetchpriority="high">

<!-- Low priority for below-fold images -->
<img src="gallery-1.jpg" alt="Gallery" fetchpriority="low" loading="lazy">
```

---

## Summary

- Use **`loading="lazy"`** on below-the-fold images and iframes
- Use **`defer`** for scripts, **`async`** for analytics
- **`preload`** critical resources, **`prefetch`** future ones
- **`preconnect`** to third-party domains
- Always specify **image dimensions** to prevent layout shifts
- Use **modern image formats** (WebP, AVIF)
- Monitor **Core Web Vitals** (LCP, FID, CLS)
