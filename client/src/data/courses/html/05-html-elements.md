---
title: HTML Elements
---

# HTML Elements

An HTML element is everything from the **opening tag** to the **closing tag**, including the content in between.

```
<tagname>Content goes here...</tagname>
```

---

## Anatomy of an HTML Element

Let's break down a paragraph element:

```html
<p>This is a paragraph.</p>
```

| Part | Description |
|------|-------------|
| `<p>` | **Opening tag** — starts the element |
| `This is a paragraph.` | **Content** — what's displayed |
| `</p>` | **Closing tag** — ends the element (note the `/`) |
| `<p>This is a paragraph.</p>` | **The complete element** |

---

## Nested Elements

HTML elements can be **nested** — elements can contain other elements. In fact, all HTML documents consist of nested elements.

```html
<!DOCTYPE html>
<html>
<body>
    <h1>My <em>First</em> Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
```

In this example:
- `<html>` contains `<body>`
- `<body>` contains `<h1>` and `<p>`
- `<h1>` contains text and an `<em>` element

> [!IMPORTANT]
> Always close nested elements in the **correct order**. The last element opened must be the first one closed.

**Correct:**
```html
<p>This is <strong>very <em>important</em></strong> text.</p>
```

**Wrong:**
```html
<p>This is <strong>very <em>important</strong></em> text.</p>
```

---

## Empty Elements

Some HTML elements have **no content** and **no closing tag**. These are called empty elements (or void elements).

Common empty elements:

| Element | Purpose |
|---------|---------|
| `<br>` | Line break |
| `<hr>` | Horizontal rule |
| `<img>` | Image |
| `<input>` | Form input field |
| `<meta>` | Metadata |
| `<link>` | External resource link |

```html
<p>Line one<br>Line two</p>
<hr>
<img src="photo.jpg" alt="A photo">
```

> [!NOTE]
> In older XHTML style, you might see empty elements written as `<br />` or `<img />` with a self-closing slash. In HTML5, the slash is **optional** — both `<br>` and `<br />` are valid.

---

## Block-Level vs Inline Elements

HTML elements fall into two display categories:

### Block-Level Elements

Block-level elements **start on a new line** and take up the **full width** available.

```html
<h1>I'm a block element</h1>
<p>I'm also a block element</p>
<div>And so am I</div>
```

Common block elements: `<div>`, `<h1>`–`<h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<form>`, `<header>`, `<footer>`, `<section>`

### Inline Elements

Inline elements do **not** start on a new line. They only take up as much width as their content needs.

```html
<p>This is <strong>bold</strong> and this is <em>italic</em> text.</p>
```

Common inline elements: `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`, `<code>`, `<br>`, `<input>`

> [!TIP]
> A good rule of thumb: **block elements create structure** (sections, paragraphs, headings), while **inline elements format content** within that structure (bold, links, code).

---

## The `<div>` Element

The `<div>` element is a **generic block-level container**. It has no semantic meaning on its own, but it's useful for grouping elements together:

```html
<div>
    <h2>Section Title</h2>
    <p>Some content in this section.</p>
    <p>More content here.</p>
</div>
```

---

## The `<span>` Element

The `<span>` element is a **generic inline container**. Like `<div>`, it has no semantic meaning, but it's useful for styling a portion of text:

```html
<p>My favorite color is <span style="color: blue;">blue</span>.</p>
```

---

## Case Sensitivity

HTML tags are **not case-sensitive**: `<P>` and `<p>` mean the same thing.

However, the **best practice** is to always use **lowercase tags**:

```html
<!-- Recommended -->
<p>Use lowercase tags.</p>

<!-- Valid but not recommended -->
<P>This works too, but don't do it.</P>
```

---

## Summary

- An HTML element = opening tag + content + closing tag
- Elements can be **nested** inside other elements
- Some elements are **empty** (no content or closing tag)
- **Block elements** start on a new line; **inline elements** don't
- Use `<div>` as a block container and `<span>` as an inline container
- Always use **lowercase** tags
