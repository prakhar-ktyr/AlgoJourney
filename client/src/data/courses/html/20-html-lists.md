---
title: HTML Lists
---

# HTML Lists

HTML provides three types of lists: **unordered lists**, **ordered lists**, and **description lists**. Lists are essential for organizing related items.

---

## Unordered Lists

Use `<ul>` for lists where the order **doesn't matter**. Items are marked with bullets:

```html
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>
```

### Custom Bullet Styles

Change the bullet style with CSS `list-style-type`:

```html
<ul style="list-style-type: disc;">
    <li>Disc (default)</li>
</ul>

<ul style="list-style-type: circle;">
    <li>Circle</li>
</ul>

<ul style="list-style-type: square;">
    <li>Square</li>
</ul>

<ul style="list-style-type: none;">
    <li>No bullet</li>
</ul>
```

---

## Ordered Lists

Use `<ol>` for lists where the order **matters**. Items are numbered:

```html
<ol>
    <li>Preheat the oven to 350°F</li>
    <li>Mix the dry ingredients</li>
    <li>Add wet ingredients</li>
    <li>Bake for 25 minutes</li>
</ol>
```

### The `type` Attribute

Change the numbering style:

```html
<ol type="1"><li>Default numbers (1, 2, 3)</li></ol>
<ol type="A"><li>Uppercase letters (A, B, C)</li></ol>
<ol type="a"><li>Lowercase letters (a, b, c)</li></ol>
<ol type="I"><li>Uppercase Roman (I, II, III)</li></ol>
<ol type="i"><li>Lowercase Roman (i, ii, iii)</li></ol>
```

### The `start` Attribute

Start counting from a specific number:

```html
<ol start="5">
    <li>This is item 5</li>
    <li>This is item 6</li>
    <li>This is item 7</li>
</ol>
```

### The `reversed` Attribute

Count backwards:

```html
<ol reversed>
    <li>Bronze medal</li>
    <li>Silver medal</li>
    <li>Gold medal</li>
</ol>
```

---

## Nested Lists

Lists can be nested inside other lists to create sub-items:

```html
<ul>
    <li>Frontend
        <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    </li>
    <li>Backend
        <ul>
            <li>Node.js</li>
            <li>Python</li>
            <li>Java</li>
        </ul>
    </li>
</ul>
```

You can also mix ordered and unordered lists:

```html
<ol>
    <li>Learn the basics
        <ul>
            <li>HTML structure</li>
            <li>Common elements</li>
        </ul>
    </li>
    <li>Practice with projects</li>
    <li>Build a portfolio</li>
</ol>
```

---

## Horizontal Lists with CSS

Turn a list into a horizontal navigation bar:

```html
<style>
    .nav-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 20px;
        background-color: #333;
        padding: 15px 20px;
    }
    .nav-list li a {
        color: white;
        text-decoration: none;
    }
    .nav-list li a:hover {
        text-decoration: underline;
    }
</style>

<ul class="nav-list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/contact">Contact</a></li>
</ul>
```

---

## Summary

| Element | Purpose | Markers |
|---------|---------|---------|
| `<ul>` | Unordered list | Bullets (disc, circle, square) |
| `<ol>` | Ordered list | Numbers, letters, Roman numerals |
| `<li>` | List item | Inside `<ul>` or `<ol>` |

- Use **`<ul>`** when order doesn't matter
- Use **`<ol>`** when order matters
- Lists can be **nested** for sub-items
- Use CSS `list-style-type: none` and flexbox for **horizontal lists**
