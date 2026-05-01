---
title: HTML Introduction
---

# HTML Introduction

HTML was created by **Tim Berners-Lee** in 1991 as a way to share documents over the internet. Since then, it has evolved through many versions, with **HTML5** being the current standard.

---

## A Brief History of HTML

| Year | Version | Key Features |
|------|---------|-------------|
| 1991 | HTML 1.0 | Basic tags — headings, paragraphs, links |
| 1995 | HTML 2.0 | Forms, tables, text flow |
| 1997 | HTML 3.2 | Scripts, applets, text flow around images |
| 1999 | HTML 4.01 | Stylesheets, multimedia, accessibility |
| 2014 | HTML5 | Video, audio, canvas, semantic elements, APIs |

> [!TIP]
> You don't need to memorize these versions. Just know that **HTML5** is the modern standard, and that's what this tutorial teaches.

---

## How Does HTML Work?

When you type a URL in your browser, here's what happens:

1. Your browser sends a **request** to a web server.
2. The server responds with an **HTML file** (and CSS, JavaScript, images, etc.).
3. Your browser **reads the HTML** and renders it as a visual web page.

The browser acts as an **interpreter** — it reads your HTML markup and converts it into the formatted page you see on screen.

---

## HTML Page Structure

Every HTML page follows the same basic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <h1>This is a Heading</h1>
    <p>This is a paragraph.</p>
</body>
</html>
```

### Breaking it down:

- **`<!DOCTYPE html>`** — Tells the browser this is an HTML5 document. Always include it as the very first line.
- **`<html lang="en">`** — The root element. The `lang` attribute specifies the language for accessibility and SEO.
- **`<head>`** — Contains **metadata** that isn't displayed on the page: character encoding, viewport settings, the page title, and links to stylesheets.
- **`<body>`** — Contains **everything visible** to the user: text, images, links, forms, etc.

---

## The Three Pillars of the Web

HTML doesn't work alone. Modern web pages are built with three technologies:

| Technology | Purpose | Example |
|-----------|---------|---------|
| **HTML** | Structure & content | Headings, paragraphs, images |
| **CSS** | Presentation & styling | Colors, fonts, layouts |
| **JavaScript** | Behavior & interactivity | Animations, form validation, API calls |

Think of it like building a house:
- **HTML** is the **frame and walls** (structure)
- **CSS** is the **paint and decoration** (appearance)
- **JavaScript** is the **electricity and plumbing** (functionality)

> [!NOTE]
> This course focuses on HTML. You'll learn how to link CSS and JavaScript to your pages, but deep dives into those topics are covered in their own courses.

---

## HTML5 — The Modern Standard

HTML5 introduced many powerful features:

- **Semantic elements** — `<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`
- **Multimedia** — Native `<video>` and `<audio>` without plugins
- **Graphics** — `<canvas>` for drawing and `<svg>` for vector graphics
- **APIs** — Geolocation, drag & drop, web storage, web workers
- **Form enhancements** — New input types like `date`, `email`, `range`, `color`

All modern browsers support HTML5, and it is the version you should always use.
