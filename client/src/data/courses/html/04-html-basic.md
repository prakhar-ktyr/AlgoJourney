---
title: HTML Basic Examples
---

# HTML Basic Examples

The best way to learn HTML is by looking at examples. Let's walk through the most common HTML elements you'll use every day.

---

## HTML Documents

All HTML documents must start with a document type declaration: `<!DOCTYPE html>`.

The HTML document itself begins with `<html>` and ends with `</html>`.

The visible part of the HTML document is between `<body>` and `</body>`.

```html
<!DOCTYPE html>
<html>
<body>

    <h1>My First Heading</h1>
    <p>My first paragraph.</p>

</body>
</html>
```

---

## HTML Headings

HTML headings are defined with the `<h1>` to `<h6>` tags.

`<h1>` defines the most important heading, and `<h6>` defines the least important:

```html
<h1>This is Heading 1</h1>
<h2>This is Heading 2</h2>
<h3>This is Heading 3</h3>
<h4>This is Heading 4</h4>
<h5>This is Heading 5</h5>
<h6>This is Heading 6</h6>
```

> [!TIP]
> Use only **one `<h1>`** per page (usually for the page title). Use `<h2>` for major sections, `<h3>` for subsections, and so on. This helps with SEO and accessibility.

---

## HTML Paragraphs

Paragraphs are defined with the `<p>` tag:

```html
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
```

The browser automatically adds spacing (margin) above and below each paragraph.

---

## HTML Links

Links are defined with the `<a>` tag:

```html
<a href="https://www.example.com">Visit Example.com</a>
```

The **`href`** attribute specifies the URL the link points to. The text between the opening and closing tags is what the user sees and clicks.

---

## HTML Images

Images are defined with the `<img>` tag:

```html
<img src="photo.jpg" alt="A beautiful sunset" width="400" height="300">
```

Key attributes:
- **`src`** — The path to the image file
- **`alt`** — Alternative text (shown if the image can't load, and read by screen readers)
- **`width`** and **`height`** — The display dimensions in pixels

> [!NOTE]
> The `<img>` tag is an **empty element** — it has no closing tag. We'll learn more about this in the next lesson.

---

## HTML Line Breaks and Horizontal Rules

Use `<br>` to insert a line break (new line) without starting a new paragraph:

```html
<p>This is the first line.<br>This is the second line.</p>
```

Use `<hr>` to insert a horizontal rule (a dividing line):

```html
<p>Section one content.</p>
<hr>
<p>Section two content.</p>
```

Both `<br>` and `<hr>` are **empty elements** — they don't have closing tags.

---

## Bold and Italic Text

Make text **bold** with `<b>` or `<strong>`:

```html
<p>This is <b>bold text</b>.</p>
<p>This is <strong>important text</strong>.</p>
```

Make text *italic* with `<i>` or `<em>`:

```html
<p>This is <i>italic text</i>.</p>
<p>This is <em>emphasized text</em>.</p>
```

> [!TIP]
> Prefer `<strong>` over `<b>` and `<em>` over `<i>`. The `<strong>` and `<em>` tags carry **semantic meaning** (importance and emphasis), which helps screen readers and search engines understand your content.

---

## Putting It All Together

Here's a complete example combining everything we've learned:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <hr>

    <h2>About Me</h2>
    <p>Hi! I'm learning <strong>HTML</strong> and it's <em>awesome</em>.</p>

    <h2>My Favorite Links</h2>
    <p>Check out <a href="https://developer.mozilla.org">MDN Web Docs</a> for great web references.</p>

    <h2>My Photo</h2>
    <img src="profile.jpg" alt="My profile photo" width="200" height="200">

    <hr>
    <p><i>Thanks for visiting!</i></p>
</body>
</html>
```

---

## Summary

| Element | Purpose | Example |
|---------|---------|---------|
| `<h1>` to `<h6>` | Headings | `<h1>Title</h1>` |
| `<p>` | Paragraph | `<p>Text here</p>` |
| `<a>` | Link | `<a href="url">Link</a>` |
| `<img>` | Image | `<img src="file.jpg" alt="desc">` |
| `<br>` | Line break | `Line 1<br>Line 2` |
| `<hr>` | Horizontal rule | `<hr>` |
| `<strong>` | Bold (semantic) | `<strong>Important</strong>` |
| `<em>` | Italic (semantic) | `<em>Emphasis</em>` |
