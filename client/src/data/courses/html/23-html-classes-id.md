---
title: HTML Classes & ID
---

# HTML Classes & ID

The `class` and `id` attributes are used to **identify** and **target** HTML elements for styling with CSS and manipulation with JavaScript.

---

## The `class` Attribute

The `class` attribute assigns one or more **class names** to an element. Multiple elements can share the same class:

```html
<p class="highlight">This paragraph is highlighted.</p>
<p class="highlight">This one too!</p>
<p>This one is not.</p>
```

### Multiple Classes

An element can have multiple classes, separated by spaces:

```html
<p class="highlight large centered">Multiple classes on one element.</p>
```

### Styling with Classes (CSS)

Target classes with a **dot (`.`)** prefix:

```html
<style>
    .highlight {
        background-color: #fef3c7;
        padding: 10px;
        border-left: 4px solid #f59e0b;
    }
    .large { font-size: 1.25rem; }
    .centered { text-align: center; }
</style>
```

---

## The `id` Attribute

The `id` attribute assigns a **unique identifier** to an element. Each `id` must appear only **once** per page:

```html
<h1 id="page-title">Welcome to My Website</h1>
<div id="main-content">
    <p>Content goes here.</p>
</div>
```

### Styling with IDs (CSS)

Target IDs with a **hash (`#`)** prefix:

```html
<style>
    #page-title {
        color: #1e3a5f;
        font-size: 2.5rem;
    }
    #main-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }
</style>
```

---

## `class` vs `id`

| Feature | `class` | `id` |
|---------|---------|------|
| Uniqueness | Can be reused on many elements | Must be unique per page |
| CSS selector | `.classname` | `#idname` |
| JavaScript | `getElementsByClassName()` | `getElementById()` |
| Bookmark links | ❌ | ✅ `<a href="#id">` |
| Best for | Styling groups of elements | Unique landmarks, anchors |

> [!TIP]
> Use **`class`** for styling (most of the time). Use **`id`** for unique landmarks, bookmark links, and JavaScript hooks.

---

## Using Classes with JavaScript

```html
<button class="btn btn-primary" onclick="alert('Clicked!')">Click Me</button>

<script>
    // Select all elements with a class
    const buttons = document.querySelectorAll('.btn-primary');

    // Select by ID
    const title = document.getElementById('page-title');
</script>
```

---

## Bookmark Links with `id`

Use `id` to create page anchors:

```html
<nav>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
</nav>

<section id="about">
    <h2>About Us</h2>
    <p>We build great things.</p>
</section>

<section id="contact">
    <h2>Contact</h2>
    <p>Email us at hello@example.com</p>
</section>
```

---

## Naming Conventions

Use **lowercase** with **hyphens** for both classes and IDs:

```html
<!-- GOOD -->
<div class="card-header">...</div>
<div id="main-navigation">...</div>

<!-- AVOID -->
<div class="cardHeader">...</div>
<div class="Card_Header">...</div>
<div id="MainNavigation">...</div>
```

> [!NOTE]
> Class and ID names are **case-sensitive**. `myClass` and `myclass` are different. Stick to lowercase with hyphens for consistency.

---

## Summary

- **`class`** — Reusable across multiple elements; selector: `.classname`
- **`id`** — Unique per page; selector: `#idname`
- Use **classes** for styling groups; use **IDs** for unique landmarks and anchors
- An element can have **multiple classes** but only **one `id`**
- Use **lowercase hyphen-case** naming: `my-class-name`
