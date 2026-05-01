---
title: HTML Favicon
---

# HTML Favicon

A favicon is the small icon displayed in the **browser tab**, **bookmarks bar**, and **search results** next to your website's title.

---

## Adding a Favicon

```html
<head>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
```

---

## Favicon Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| ICO | `.ico` | Universal compatibility |
| PNG | `.png` | Modern browsers, sharp at all sizes |
| SVG | `.svg` | Scalable, supports dark mode |

---

## Multiple Sizes

```html
<head>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
```

---

## SVG Favicon

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

SVG favicons are scalable and can support dark mode via CSS media queries inside the SVG.

---

## Complete Setup

```html
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#4f46e5">
</head>
```

> [!TIP]
> Use online tools like **RealFaviconGenerator** to create all sizes and formats from a single image.

---

## Summary

- Use `<link rel="icon">` in the `<head>` to add a favicon
- Provide **multiple sizes** for different devices
- **SVG favicons** are modern and scalable
- Use **`apple-touch-icon`** for iOS home screen icons
- Keep designs **simple** — they display at very small sizes
