---
title: HTML Head Element
---

# HTML Head Element

The `<head>` element contains **metadata** — information about the document that isn't displayed on the page but is essential for browsers, search engines, and social media.

---

## Essential Head Elements

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
```

These three elements should be in **every** HTML document.

---

## `<title>` — Page Title

Appears in the browser tab, bookmarks, and search results:

```html
<title>HTML Tutorial — Learn HTML from Scratch</title>
```

> [!TIP]
> Keep titles under 60 characters, include relevant keywords, and make each page's title unique.

---

## `<meta>` — Metadata

### Character Encoding

```html
<meta charset="UTF-8">
```

Always use UTF-8 — it supports virtually all characters and symbols.

### Viewport (Responsive Design)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Description (SEO)

```html
<meta name="description" content="Learn HTML from beginner to advanced with this comprehensive tutorial. Covers elements, forms, semantic HTML, and modern APIs.">
```

### Author

```html
<meta name="author" content="Jane Doe">
```

### Robots (Search Engine Indexing)

```html
<meta name="robots" content="index, follow">
<!-- Or to prevent indexing: -->
<meta name="robots" content="noindex, nofollow">
```

### Theme Color (Mobile Browser)

```html
<meta name="theme-color" content="#4f46e5">
```

---

## `<link>` — External Resources

### Stylesheet

```html
<link rel="stylesheet" href="styles.css">
```

### Favicon

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

### Preconnect (Performance)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### Canonical URL (SEO)

```html
<link rel="canonical" href="https://www.example.com/html-tutorial">
```

Tells search engines which URL is the "official" version of a page.

---

## `<style>` — Internal CSS

```html
<style>
    body { font-family: 'Inter', sans-serif; }
</style>
```

---

## `<script>` — JavaScript

```html
<!-- External script -->
<script src="app.js" defer></script>

<!-- Inline script -->
<script>
    console.log("Page loaded");
</script>
```

| Attribute | Behavior |
|-----------|----------|
| (none) | Blocks rendering until script loads and executes |
| `defer` | Loads in parallel, executes after HTML is parsed |
| `async` | Loads in parallel, executes immediately when ready |

> [!TIP]
> Use **`defer`** for most scripts — it loads in parallel without blocking the page. Use **`async`** for independent scripts like analytics.

---

## `<base>` — Base URL

Sets a base URL for all relative URLs in the document:

```html
<base href="https://www.example.com/" target="_blank">
```

After this, `<a href="about">` resolves to `https://www.example.com/about`.

---

## Complete Head Example

```html
<head>
    <!-- Essential -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Tutorial — AlgoJourney</title>

    <!-- SEO -->
    <meta name="description" content="Comprehensive HTML tutorial from beginner to advanced.">
    <meta name="author" content="AlgoJourney">
    <link rel="canonical" href="https://algojourney.com/tutorials/html">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    <!-- Stylesheets -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
    <link rel="stylesheet" href="/css/styles.css">

    <!-- Theme -->
    <meta name="theme-color" content="#4f46e5">

    <!-- Scripts -->
    <script src="/js/app.js" defer></script>
</head>
```

---

## Summary

| Element | Purpose |
|---------|---------|
| `<title>` | Page title (tab, bookmarks, search) |
| `<meta charset>` | Character encoding |
| `<meta viewport>` | Responsive design |
| `<meta description>` | SEO description |
| `<link rel="stylesheet">` | External CSS |
| `<link rel="icon">` | Favicon |
| `<link rel="canonical">` | Canonical URL |
| `<script>` | JavaScript |
| `<base>` | Base URL for relative paths |
