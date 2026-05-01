---
title: HTML Headings
---

# HTML Headings

Headings are used to define titles and subtitles on a web page. HTML provides **six levels** of headings, from `<h1>` (most important) to `<h6>` (least important).

---

## Heading Tags

```html
<h1>Heading 1 — Most Important</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 — Least Important</h6>
```

Browsers display headings in **decreasing font sizes** by default. `<h1>` is the largest, and `<h6>` is the smallest.

---

## Why Headings Matter

Headings do more than just make text big:

1. **Structure** — Headings define the outline of your document, making it easier to scan.
2. **Accessibility** — Screen readers use headings to navigate the page. Users can jump between headings to find the content they need.
3. **SEO** — Search engines use headings to understand the content and structure of your page. A well-structured heading hierarchy can improve your search rankings.

> [!IMPORTANT]
> Use headings to represent **content hierarchy**, not to make text bigger or bolder. Use CSS for styling instead.

---

## Heading Hierarchy Best Practices

Follow a logical hierarchy — don't skip levels:

```html
<!-- GOOD: Logical hierarchy -->
<h1>Web Development Guide</h1>
    <h2>HTML</h2>
        <h3>Elements</h3>
        <h3>Attributes</h3>
    <h2>CSS</h2>
        <h3>Selectors</h3>
        <h3>Box Model</h3>
```

```html
<!-- BAD: Skipping from h1 to h4 -->
<h1>Web Development Guide</h1>
    <h4>Elements</h4>
    <h2>CSS</h2>
```

> [!TIP]
> Think of headings like a book's table of contents. `<h1>` is the book title, `<h2>` are chapters, `<h3>` are sections within chapters, and so on.

---

## One `<h1>` Per Page

As a best practice, use **only one `<h1>`** per page. This is typically the main title or purpose of the page:

```html
<body>
    <h1>HTML Headings Tutorial</h1>

    <h2>What Are Headings?</h2>
    <p>Headings define the structure...</p>

    <h2>Heading Levels</h2>
    <p>There are six levels...</p>
</body>
```

---

## Customizing Heading Sizes with CSS

Default heading sizes might not match your design. Use CSS to customize them:

```html
<h1 style="font-size: 36px;">Custom Size Heading</h1>
<h2 style="font-size: 24px;">Smaller Custom Heading</h2>
```

Or better, use a stylesheet:

```html
<style>
    h1 {
        font-size: 2.5rem;
        color: #333;
        font-weight: 700;
    }
    h2 {
        font-size: 1.8rem;
        color: #555;
        border-bottom: 2px solid #eee;
        padding-bottom: 0.5rem;
    }
</style>
```

> [!NOTE]
> Even if you make an `<h3>` look visually larger than an `<h2>` with CSS, screen readers and search engines still treat the **tag level** as the true hierarchy. Always match visual order with semantic order.

---

## Default Heading Sizes

Browsers apply default sizes (approximate values):

| Heading | Default Size | Typical Use |
|---------|-------------|-------------|
| `<h1>` | 2em (32px) | Page title |
| `<h2>` | 1.5em (24px) | Major sections |
| `<h3>` | 1.17em (18.7px) | Subsections |
| `<h4>` | 1em (16px) | Sub-subsections |
| `<h5>` | 0.83em (13.3px) | Minor headings |
| `<h6>` | 0.67em (10.7px) | Rarely used |

---

## Summary

- HTML has **six heading levels**: `<h1>` through `<h6>`
- Use **one `<h1>`** per page for the main title
- Follow a **logical hierarchy** — don't skip levels
- Headings are critical for **accessibility** and **SEO**
- Use CSS to change heading appearance — don't misuse heading tags for styling
