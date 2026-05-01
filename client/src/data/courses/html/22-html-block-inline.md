---
title: HTML Block & Inline
---

# HTML Block & Inline

Every HTML element has a default **display type**: either **block** or **inline**. Understanding the difference is essential for controlling page layout.

---

## Block-Level Elements

Block-level elements:
- Start on a **new line**
- Take up the **full width** available
- Can contain other block and inline elements

```html
<div style="background: #e0e7ff; padding: 10px; margin: 5px 0;">
    I'm a DIV (block element) — I take up the full width.
</div>
<p style="background: #fce7f3; padding: 10px;">
    I'm a paragraph (block element) — I also take up the full width.
</p>
```

### Common Block Elements

| Element | Purpose |
|---------|---------|
| `<div>` | Generic container |
| `<p>` | Paragraph |
| `<h1>`–`<h6>` | Headings |
| `<ul>`, `<ol>`, `<li>` | Lists |
| `<table>` | Table |
| `<form>` | Form |
| `<header>`, `<footer>`, `<main>` | Semantic layout |
| `<section>`, `<article>`, `<aside>` | Semantic sections |
| `<nav>` | Navigation |
| `<blockquote>` | Block quotation |
| `<pre>` | Preformatted text |
| `<hr>` | Horizontal rule |

---

## Inline Elements

Inline elements:
- Do **not** start on a new line
- Only take up as much **width as their content**
- Cannot contain block-level elements

```html
<p>
    This is a paragraph with <strong>bold</strong>,
    <em>italic</em>, and a <a href="#">link</a> inside it.
    All inline elements flow within the text.
</p>
```

### Common Inline Elements

| Element | Purpose |
|---------|---------|
| `<span>` | Generic inline container |
| `<a>` | Link |
| `<strong>`, `<em>` | Bold/emphasis |
| `<b>`, `<i>` | Visual bold/italic |
| `<code>` | Inline code |
| `<img>` | Image |
| `<input>` | Form input |
| `<br>` | Line break |
| `<mark>` | Highlight |
| `<sub>`, `<sup>` | Subscript/superscript |

---

## The `<div>` Element

`<div>` is the most common **block-level container**. It groups elements together for styling or layout:

```html
<div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px;">
    <h2>Section Title</h2>
    <p>This content is grouped inside a div container.</p>
    <p>Divs are the building blocks of CSS layouts.</p>
</div>
```

---

## The `<span>` Element

`<span>` is the most common **inline container**. It styles a portion of text without breaking the flow:

```html
<p>My favorite color is <span style="color: #2563eb; font-weight: bold;">blue</span> and I love <span style="color: #dc2626; font-weight: bold;">red</span> too.</p>
```

---

## Block vs Inline Comparison

```html
<!-- Block elements stack vertically -->
<div style="background: #dbeafe; padding: 8px; margin: 4px 0;">Block 1</div>
<div style="background: #bfdbfe; padding: 8px; margin: 4px 0;">Block 2</div>
<div style="background: #93c5fd; padding: 8px; margin: 4px 0;">Block 3</div>

<!-- Inline elements flow horizontally -->
<p>
    <span style="background: #fecaca; padding: 4px;">Inline 1</span>
    <span style="background: #fde68a; padding: 4px;">Inline 2</span>
    <span style="background: #bbf7d0; padding: 4px;">Inline 3</span>
</p>
```

---

## Changing Display Type with CSS

You can change any element's display type with CSS:

```html
<!-- Make a block element inline -->
<div style="display: inline; background: #dbeafe; padding: 4px;">
    I'm a div acting as inline.
</div>

<!-- Make an inline element block -->
<span style="display: block; background: #fecaca; padding: 8px;">
    I'm a span acting as block.
</span>

<!-- Inline-block: best of both worlds -->
<span style="display: inline-block; width: 150px; background: #bbf7d0; padding: 8px; text-align: center;">
    Inline-block
</span>
```

### `display: inline-block`

Combines traits of both:
- Flows inline like `<span>` (no line break)
- Accepts `width`, `height`, `margin`, `padding` like a block element

---

## Nesting Rules

> [!IMPORTANT]
> **Block elements** can contain both block and inline elements. **Inline elements** should only contain other inline elements or text.

```html
<!-- CORRECT: block contains inline -->
<div>
    <p>This is <strong>fine</strong>.</p>
</div>

<!-- WRONG: inline contains block -->
<span>
    <p>This is not valid.</p>
</span>
```

---

## Summary

| Feature | Block | Inline |
|---------|-------|--------|
| Starts new line | ✅ Yes | ❌ No |
| Full width | ✅ Yes | ❌ Only content width |
| Width/height | ✅ Accepts | ❌ Ignores |
| Can contain | Block + inline | Inline only |
| Examples | `<div>`, `<p>`, `<h1>` | `<span>`, `<a>`, `<strong>` |

- Use **`<div>`** for block grouping, **`<span>`** for inline styling
- Change display type with CSS `display` property
- **`inline-block`** gives inline flow with block sizing
