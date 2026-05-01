---
title: HTML Link Colors & Bookmarks
---

# HTML Link Colors & Bookmarks

Learn how to style links with CSS and use bookmark links for smooth in-page navigation.

---

## Default Link Colors

Browsers apply default colors to links based on their state:

| State | Default Color | Description |
|-------|--------------|-------------|
| Unvisited | Blue (`#0000EE`) | A link the user hasn't clicked yet |
| Visited | Purple (`#551A8B`) | A link the user has previously visited |
| Active | Red | The link at the moment it's being clicked |

---

## Customizing Link Colors with CSS

You can override the default colors using CSS pseudo-classes:

```html
<style>
    a:link {
        color: #2563eb;
        text-decoration: none;
    }

    a:visited {
        color: #7c3aed;
    }

    a:hover {
        color: #dc2626;
        text-decoration: underline;
    }

    a:active {
        color: #ea580c;
    }
</style>

<a href="https://www.example.com">Styled Link</a>
```

> [!IMPORTANT]
> The CSS pseudo-classes must be defined in this specific order: `:link`, `:visited`, `:hover`, `:active` (remember **L-V-H-A**, or "LoVe HAte"). If the order is wrong, some states may not work properly.

---

## Removing the Underline

By default, links have an underline. You can remove it:

```html
<style>
    a {
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style>
```

This is a common pattern — no underline by default, underline on hover.

> [!NOTE]
> Be careful when removing underlines entirely. Users rely on visual cues to identify clickable links. If you remove the underline, make sure links are still visually distinguishable (e.g., different color, bold, or icon).

---

## Styled Link Buttons

Turn links into buttons using CSS:

```html
<style>
    .btn-link {
        display: inline-block;
        padding: 12px 24px;
        background-color: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }

    .btn-link:hover {
        background-color: #1d4ed8;
    }

    .btn-link:active {
        background-color: #1e40af;
    }
</style>

<a href="/signup" class="btn-link">Sign Up Now</a>
<a href="/learn-more" class="btn-link" style="background-color: #16a34a;">Learn More</a>
```

---

## Bookmark Links (In-Page Navigation)

Bookmark links let users jump to specific sections within the same page. This is done in two steps:

### Step 1: Add an `id` to the target element

```html
<h2 id="getting-started">Getting Started</h2>
<h2 id="installation">Installation</h2>
<h2 id="configuration">Configuration</h2>
```

### Step 2: Link to it with `#`

```html
<a href="#getting-started">Getting Started</a>
<a href="#installation">Installation</a>
<a href="#configuration">Configuration</a>
```

---

## Building a Table of Contents

A common use of bookmark links is a **table of contents** at the top of a long page:

```html
<nav>
    <h2>Table of Contents</h2>
    <ul>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
        <li><a href="#faq">FAQ</a></li>
    </ul>
</nav>

<hr>

<section id="introduction">
    <h2>Introduction</h2>
    <p>Welcome to our product documentation...</p>
</section>

<section id="features">
    <h2>Features</h2>
    <p>Our product includes the following features...</p>
</section>

<section id="installation">
    <h2>Installation</h2>
    <p>To install, follow these steps...</p>
</section>

<section id="usage">
    <h2>Usage</h2>
    <p>Here's how to use the product...</p>
</section>

<section id="faq">
    <h2>FAQ</h2>
    <p>Common questions answered...</p>
</section>
```

---

## Smooth Scrolling

By default, bookmark links jump instantly to the target. Add smooth scrolling with CSS:

```html
<style>
    html {
        scroll-behavior: smooth;
    }
</style>
```

Now clicking any bookmark link will animate a smooth scroll to the target section.

---

## Linking to Sections on Other Pages

You can combine a page URL with a bookmark:

```html
<!-- Jump to the FAQ section on the about page -->
<a href="about.html#faq">About — FAQ</a>

<!-- Jump to a section on an external site -->
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML#reference">
    MDN HTML Reference
</a>
```

---

## The "Back to Top" Pattern

For long pages, add a "back to top" link:

```html
<body id="top">
    <h1>Long Article</h1>

    <!-- ... lots of content ... -->

    <a href="#top" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 10px 15px;
        border-radius: 50%;
        text-decoration: none;
        font-size: 18px;
    ">⬆</a>
</body>
```

---

## Accessibility Tips for Links

1. **Use descriptive link text** — avoid "click here" or "read more":

```html
<!-- BAD -->
<p>To learn about HTML, <a href="html-intro.html">click here</a>.</p>

<!-- GOOD -->
<p>Read our <a href="html-intro.html">HTML introduction guide</a>.</p>
```

2. **Indicate external links** visually:

```html
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
    External Site ↗
</a>
```

3. **Don't rely on color alone** — use underlines, icons, or other visual cues.

---

## Summary

- Customize link colors with `:link`, `:visited`, `:hover`, `:active` (in that order)
- Use `text-decoration: none` to remove underlines, but ensure links remain identifiable
- Turn links into buttons with CSS for call-to-action elements
- Use **`#id`** bookmarks for in-page navigation
- Add `scroll-behavior: smooth` for animated scrolling
- Always write **descriptive link text** for accessibility
