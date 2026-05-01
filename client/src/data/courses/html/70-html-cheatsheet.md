---
title: HTML Cheat Sheet
---

# HTML Cheat Sheet

A quick-reference guide to every HTML element, attribute, and concept covered in this tutorial.

---

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <meta name="description" content="Page description">
    <link rel="stylesheet" href="styles.css">
    <script src="app.js" defer></script>
</head>
<body>
    <header>...</header>
    <nav>...</nav>
    <main>...</main>
    <footer>...</footer>
</body>
</html>
```

---

## Text Elements

| Tag | Purpose |
|-----|---------|
| `<h1>` – `<h6>` | Headings (1 = most important) |
| `<p>` | Paragraph |
| `<br>` | Line break |
| `<hr>` | Horizontal rule / thematic break |
| `<pre>` | Preformatted text |
| `<blockquote>` | Block quotation |
| `<q>` | Inline quotation |
| `<code>` | Inline code |
| `<strong>` | Strong importance (bold) |
| `<em>` | Emphasis (italic) |
| `<mark>` | Highlighted text |
| `<small>` | Fine print |
| `<del>` | Deleted text (strikethrough) |
| `<ins>` | Inserted text (underline) |
| `<sub>` | Subscript |
| `<sup>` | Superscript |
| `<abbr>` | Abbreviation (with `title`) |
| `<cite>` | Title of a work |
| `<time>` | Date/time (with `datetime`) |

---

## Links & Navigation

```html
<a href="url">Link Text</a>
<a href="url" target="_blank" rel="noopener noreferrer">New Tab</a>
<a href="#section-id">Bookmark Link</a>
<a href="mailto:email@example.com">Email Link</a>
<a href="tel:+1234567890">Phone Link</a>
<a href="file.pdf" download>Download</a>
```

---

## Images & Media

```html
<img src="url" alt="description" width="w" height="h" loading="lazy">

<picture>
    <source srcset="img.webp" type="image/webp">
    <img src="img.jpg" alt="description">
</picture>

<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
</audio>

<video controls poster="thumb.jpg">
    <source src="video.mp4" type="video/mp4">
    <track src="subs.vtt" kind="subtitles" srclang="en" label="English">
</video>

<iframe src="url" title="description" loading="lazy"></iframe>

<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#4f46e5" />
</svg>

<canvas id="c" width="400" height="300"></canvas>
```

---

## Lists

```html
<!-- Unordered -->
<ul><li>Item</li></ul>

<!-- Ordered -->
<ol type="1" start="1" reversed><li>Item</li></ol>

<!-- Description -->
<dl>
    <dt>Term</dt>
    <dd>Definition</dd>
</dl>
```

---

## Tables

```html
<table>
    <caption>Table Title</caption>
    <colgroup><col span="2" style="background: #f0f0f0;"></colgroup>
    <thead>
        <tr><th scope="col">Header</th></tr>
    </thead>
    <tbody>
        <tr><td>Data</td></tr>
        <tr><td colspan="2">Spanning</td></tr>
        <tr><td rowspan="2">Spanning</td></tr>
    </tbody>
    <tfoot>
        <tr><td>Footer</td></tr>
    </tfoot>
</table>
```

---

## Forms

```html
<form action="/submit" method="POST" autocomplete="on">
    <fieldset>
        <legend>Group Title</legend>

        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required placeholder="Your name">

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" minlength="8" pattern=".*">

        <label for="age">Age:</label>
        <input type="number" id="age" name="age" min="18" max="120">

        <label for="date">Date:</label>
        <input type="date" id="date" name="date">

        <label for="color">Color:</label>
        <input type="color" id="color" name="color" value="#4f46e5">

        <label for="file">Upload:</label>
        <input type="file" id="file" name="file" accept="image/*" multiple>

        <label for="range">Range:</label>
        <input type="range" id="range" name="range" min="0" max="100">

        <label><input type="checkbox" name="agree" required> I agree</label>

        <label><input type="radio" name="plan" value="free"> Free</label>
        <label><input type="radio" name="plan" value="pro"> Pro</label>

        <select name="country">
            <option value="">Select...</option>
            <optgroup label="Americas">
                <option value="us">USA</option>
            </optgroup>
        </select>

        <textarea name="message" rows="4" maxlength="500"></textarea>

        <input type="text" name="search" list="suggestions">
        <datalist id="suggestions">
            <option value="HTML">
            <option value="CSS">
        </datalist>

        <input type="hidden" name="token" value="abc123">
    </fieldset>

    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
    <button type="submit" formnovalidate>Save Draft</button>
</form>
```

---

## Semantic / Layout Elements

| Tag | Purpose |
|-----|---------|
| `<header>` | Page or section header |
| `<nav>` | Navigation block |
| `<main>` | Primary page content (one per page) |
| `<article>` | Self-contained content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar / tangential content |
| `<footer>` | Page or section footer |
| `<figure>` + `<figcaption>` | Image/content with caption |
| `<details>` + `<summary>` | Expandable content |
| `<dialog>` | Modal/non-modal dialog |
| `<template>` | Reusable HTML fragment |
| `<div>` | Generic block container |
| `<span>` | Generic inline container |

---

## Global Attributes

| Attribute | Description |
|-----------|-------------|
| `id` | Unique identifier |
| `class` | CSS class name(s) |
| `style` | Inline CSS |
| `title` | Tooltip text |
| `lang` | Language |
| `dir` | Text direction (`ltr`/`rtl`) |
| `hidden` | Hides element |
| `tabindex` | Tab order |
| `data-*` | Custom data |
| `draggable` | Enable drag & drop |
| `contenteditable` | Enable inline editing |

---

## Common Entities

| Entity | Symbol |
|--------|--------|
| `&lt;` | < |
| `&gt;` | > |
| `&amp;` | & |
| `&nbsp;` | Non-breaking space |
| `&copy;` | © |
| `&mdash;` | — |
| `&rarr;` | → |
| `&times;` | × |
| `&check;` | ✓ |

---

## Head Meta Tags

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="...">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#4f46e5">
<meta property="og:title" content="...">
<meta property="og:image" content="...">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="...">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://...">
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

---

Congratulations on completing the HTML course! 🎉 You now have a solid foundation in HTML — from basic elements to advanced APIs, accessibility, SEO, and performance optimization. Keep building and experimenting!
