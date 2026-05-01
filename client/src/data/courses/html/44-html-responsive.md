---
title: HTML Responsive Design
---

# HTML Responsive Design

Responsive design ensures your web pages look great on **all devices** — desktops, tablets, and smartphones.

---

## The Viewport Meta Tag

This is the most important line for responsive design:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without it, mobile browsers render the page at desktop width and zoom out, making everything tiny.

> [!IMPORTANT]
> Always include the viewport meta tag in every HTML page. Without it, none of your responsive CSS will work properly on mobile devices.

---

## Responsive Images

Make images scale to fit their container:

```html
<style>
    img {
        max-width: 100%;
        height: auto;
    }
</style>

<img src="photo.jpg" alt="Responsive photo">
```

Use the `<picture>` element for art direction:

```html
<picture>
    <source media="(max-width: 600px)" srcset="photo-mobile.jpg">
    <source media="(max-width: 1200px)" srcset="photo-tablet.jpg">
    <img src="photo-desktop.jpg" alt="Responsive photo">
</picture>
```

---

## Responsive Text

Use relative units instead of fixed pixels:

```html
<style>
    body { font-size: 16px; }
    h1 { font-size: 2.5rem; }   /* 40px */
    h2 { font-size: 1.75rem; }  /* 28px */
    p { font-size: 1rem; }      /* 16px */

    /* Fluid typography with clamp() */
    h1 {
        font-size: clamp(1.5rem, 4vw, 3rem);
    }
</style>
```

| Unit | Relative To |
|------|-------------|
| `rem` | Root element font size |
| `em` | Parent element font size |
| `vw` | Viewport width (1vw = 1%) |
| `vh` | Viewport height (1vh = 1%) |
| `%` | Parent element |

---

## Media Queries

Apply different styles based on screen size:

```html
<style>
    /* Mobile first (default) */
    .container { padding: 10px; }
    .nav { display: none; }
    .menu-btn { display: block; }

    /* Tablet (768px and up) */
    @media (min-width: 768px) {
        .container { padding: 20px; }
        .nav { display: flex; }
        .menu-btn { display: none; }
    }

    /* Desktop (1024px and up) */
    @media (min-width: 1024px) {
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
        }
    }
</style>
```

### Common Breakpoints

| Breakpoint | Target |
|-----------|--------|
| 480px | Small phones |
| 768px | Tablets |
| 1024px | Laptops |
| 1200px | Desktops |
| 1440px | Large screens |

---

## Mobile-First Approach

Start with mobile styles, then add complexity for larger screens:

```html
<style>
    /* Mobile: single column */
    .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

    /* Tablet: two columns */
    @media (min-width: 768px) {
        .grid { grid-template-columns: 1fr 1fr; }
    }

    /* Desktop: three columns */
    @media (min-width: 1024px) {
        .grid { grid-template-columns: 1fr 1fr 1fr; }
    }
</style>
```

> [!TIP]
> Mobile-first is the recommended approach because mobile styles are simpler (single column) and you progressively enhance for larger screens.

---

## Responsive Navigation

```html
<style>
    .nav-links {
        display: none;
        flex-direction: column;
    }
    .hamburger { display: block; cursor: pointer; font-size: 1.5rem; }

    @media (min-width: 768px) {
        .nav-links {
            display: flex;
            flex-direction: row;
            gap: 20px;
        }
        .hamburger { display: none; }
    }
</style>

<nav>
    <span class="hamburger">☰</span>
    <div class="nav-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </div>
</nav>
```

---

## Summary

- Always include the **viewport meta tag**
- Use **`max-width: 100%`** on images for responsive scaling
- Use **relative units** (`rem`, `vw`, `%`) instead of fixed `px`
- Use **media queries** for breakpoint-specific styles
- Start with **mobile-first** and enhance for larger screens
- Use **`clamp()`** for fluid typography
