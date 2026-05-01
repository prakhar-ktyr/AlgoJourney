---
title: HTML Header, Nav & Footer
---

# HTML Header, Nav & Footer

These three semantic elements define the top-level structure of most web pages.

---

## `<header>` — Introductory Content

The `<header>` element represents introductory content, typically containing a logo, site title, and navigation:

```html
<header>
    <h1>My Website</h1>
    <p>A place to learn web development</p>
</header>
```

A page can have **multiple headers** — one for the page, and one inside each `<article>` or `<section>`:

```html
<header>
    <h1>Blog</h1>
    <nav>...</nav>
</header>

<article>
    <header>
        <h2>Article Title</h2>
        <p>By Jane Doe | <time datetime="2025-01-15">Jan 15, 2025</time></p>
    </header>
    <p>Article content...</p>
</article>
```

---

## `<nav>` — Navigation

The `<nav>` element contains the **main navigation links**:

```html
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

> [!NOTE]
> Not every group of links needs `<nav>`. Use it only for **major navigation blocks** (main nav, sidebar nav, footer nav). Don't use it for a random list of links within content.

### Styled Navigation Bar

```html
<style>
    nav ul {
        list-style: none;
        display: flex;
        gap: 24px;
        padding: 0;
        margin: 0;
    }
    nav a {
        text-decoration: none;
        color: #1e293b;
        font-weight: 500;
        padding: 8px 0;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s;
    }
    nav a:hover { border-bottom-color: #4f46e5; }
</style>
```

---

## `<footer>` — Page/Section Footer

The `<footer>` contains footer information — copyright, links, contact info:

```html
<footer>
    <nav>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
    </nav>
    <p>&copy; 2025 My Website. All rights reserved.</p>
</footer>
```

Like `<header>`, footers can appear inside `<article>` or `<section>` elements:

```html
<article>
    <h2>Article Title</h2>
    <p>Content...</p>
    <footer>
        <p>Tags: HTML, CSS | <a href="#">Share</a></p>
    </footer>
</article>
```

---

## Complete Page Layout

```html
<body>
    <header>
        <h1>My Website</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
        </nav>
    </header>

    <main>
        <h2>Latest Posts</h2>
        <!-- Main content here -->
    </main>

    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
</body>
```

---

## Summary

| Element | Purpose | Can appear multiple times? |
|---------|---------|--------------------------|
| `<header>` | Introductory content, logo, nav | Yes (page + section/article headers) |
| `<nav>` | Major navigation blocks | Yes (main nav, footer nav, sidebar nav) |
| `<footer>` | Footer content, copyright, links | Yes (page + section/article footers) |
