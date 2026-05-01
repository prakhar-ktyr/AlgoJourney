---
title: HTML Semantic Elements
---

# HTML Semantic Elements

Semantic HTML uses elements that **describe their meaning** to both the browser and the developer. Instead of generic `<div>` containers, semantic elements clearly communicate the **purpose** of the content.

---

## What is Semantic HTML?

| Non-Semantic | Semantic | Meaning |
|-------------|----------|---------|
| `<div id="header">` | `<header>` | Page/section header |
| `<div id="nav">` | `<nav>` | Navigation links |
| `<div class="article">` | `<article>` | Self-contained content |
| `<div id="footer">` | `<footer>` | Page/section footer |

---

## Why Use Semantic Elements?

1. **Accessibility** — Screen readers use semantic elements to navigate and understand the page structure
2. **SEO** — Search engines better understand your content hierarchy
3. **Maintainability** — Code is easier to read and understand
4. **Standards** — Following HTML5 best practices

---

## Overview of Semantic Elements

| Element | Purpose |
|---------|---------|
| `<header>` | Introductory content or navigation |
| `<nav>` | Navigation links |
| `<main>` | Primary page content |
| `<article>` | Self-contained, reusable content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar or tangential content |
| `<footer>` | Footer content |
| `<figure>` / `<figcaption>` | Images with captions |
| `<details>` / `<summary>` | Expandable content |
| `<mark>` | Highlighted text |
| `<time>` | Dates and times |

---

## Semantic Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Blog</title>
</head>
<body>
    <header>
        <h1>My Blog</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </nav>
    </header>

    <main>
        <article>
            <h2>Article Title</h2>
            <time datetime="2025-01-15">January 15, 2025</time>
            <p>Article content...</p>
        </article>

        <aside>
            <h3>Related Articles</h3>
            <ul>
                <li><a href="#">Article 1</a></li>
                <li><a href="#">Article 2</a></li>
            </ul>
        </aside>
    </main>

    <footer>
        <p>&copy; 2025 My Blog. All rights reserved.</p>
    </footer>
</body>
</html>
```

---

## The `<time>` Element

Represents a date, time, or duration in a machine-readable format:

```html
<p>Published on <time datetime="2025-03-15">March 15, 2025</time></p>
<p>The event starts at <time datetime="14:30">2:30 PM</time></p>
<p>Updated <time datetime="2025-03-15T09:00:00Z">March 15, 2025 at 9 AM UTC</time></p>
```

---

## Semantic vs Non-Semantic Comparison

```html
<!-- NON-SEMANTIC: div soup -->
<div id="header">
    <div class="logo">My Site</div>
    <div class="nav">
        <div class="nav-item"><a href="/">Home</a></div>
    </div>
</div>
<div id="content">
    <div class="post">
        <div class="post-title">Title</div>
        <div class="post-body">Content...</div>
    </div>
</div>
<div id="footer">Copyright 2025</div>

<!-- SEMANTIC: meaningful structure -->
<header>
    <h1>My Site</h1>
    <nav><a href="/">Home</a></nav>
</header>
<main>
    <article>
        <h2>Title</h2>
        <p>Content...</p>
    </article>
</main>
<footer><p>Copyright 2025</p></footer>
```

> [!TIP]
> When deciding between `<div>` and a semantic element, ask: "Does this content have a specific purpose?" If yes, there's probably a semantic element for it.

---

## Summary

- Semantic elements describe the **meaning** of content, not just its appearance
- They improve **accessibility**, **SEO**, and **code readability**
- Use semantic elements instead of `<div>` whenever possible
- Key elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
