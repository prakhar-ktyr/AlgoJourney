---
title: HTML SEO Basics
---

# HTML SEO Basics

Search Engine Optimization (SEO) is the practice of improving your HTML to rank higher in search results. Good HTML structure is the **foundation** of SEO.

---

## Title Tags

The `<title>` element is the most important on-page SEO element:

```html
<title>Learn HTML — Free Tutorial for Beginners | AlgoJourney</title>
```

Best practices:
- Keep it under **60 characters**
- Include your **primary keyword** near the beginning
- Make each page's title **unique**
- Use a format: `Primary Keyword — Secondary | Brand`

---

## Meta Description

The `<meta description>` appears in search results below the title:

```html
<meta name="description" content="Learn HTML from scratch with this comprehensive, free tutorial. Covers elements, forms, semantic HTML, multimedia, and modern APIs.">
```

Best practices:
- Keep it **150-160 characters**
- Include **relevant keywords** naturally
- Make it **compelling** — it's your search result ad copy
- Each page should have a **unique** description

---

## Heading Hierarchy

Search engines use headings to understand your content structure:

```html
<h1>HTML Tutorial</h1>                <!-- One per page -->
    <h2>Getting Started</h2>          <!-- Major sections -->
        <h3>Setting Up Your Editor</h3>
        <h3>Creating Your First Page</h3>
    <h2>HTML Elements</h2>
        <h3>Block Elements</h3>
        <h3>Inline Elements</h3>
```

- Use **one `<h1>`** per page
- Follow a **logical hierarchy** — don't skip levels
- Include **keywords** in headings naturally

---

## Semantic HTML for SEO

Search engines understand semantic elements:

```html
<article>     <!-- This is a standalone piece of content -->
<nav>         <!-- This is navigation -->
<main>        <!-- This is the primary content -->
<aside>       <!-- This is supplementary content -->
```

---

## Image SEO

```html
<img src="html-tutorial-screenshot.jpg"
     alt="Screenshot of VS Code showing HTML code with syntax highlighting"
     width="800" height="600"
     loading="lazy">
```

- Use **descriptive filenames** (`html-tutorial.jpg` not `img001.jpg`)
- Write **meaningful alt text** with keywords
- Specify **width/height** to prevent layout shifts
- Use **lazy loading** for below-the-fold images

---

## URL Structure

```html
<!-- GOOD: Clean, descriptive URLs -->
<a href="/tutorials/html/forms">HTML Forms Tutorial</a>

<!-- BAD: Cryptic URLs -->
<a href="/page?id=47&cat=3">HTML Forms Tutorial</a>
```

---

## Structured Data (Schema.org)

Help search engines understand your content type:

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "HTML Tutorial for Beginners",
    "author": {
        "@type": "Person",
        "name": "AlgoJourney"
    },
    "datePublished": "2025-01-15",
    "description": "A comprehensive HTML tutorial covering everything from basics to advanced topics."
}
</script>
```

---

## Canonical URLs

Prevent duplicate content issues:

```html
<link rel="canonical" href="https://www.example.com/tutorials/html">
```

---

## Mobile-Friendliness

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Google uses **mobile-first indexing** — your mobile version is what gets indexed.

---

## Page Speed

- Use **`loading="lazy"`** on images and iframes
- Use **`defer`** or **`async`** on scripts
- Minimize CSS and JavaScript
- Use modern image formats (WebP, AVIF)

---

## Summary

| SEO Factor | HTML Element/Attribute |
|-----------|----------------------|
| Page title | `<title>` |
| Description | `<meta name="description">` |
| Headings | `<h1>` through `<h6>` |
| Image SEO | `alt`, descriptive filenames |
| Canonical URL | `<link rel="canonical">` |
| Structured data | `<script type="application/ld+json">` |
| Mobile | `<meta name="viewport">` |
| Performance | `loading="lazy"`, `defer` |
