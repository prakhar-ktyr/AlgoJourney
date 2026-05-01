---
title: HTML Quotations
---

# HTML Quotations

HTML provides several elements for marking up quotations, abbreviations, and citations. These elements add **semantic meaning** to your content, helping browsers, screen readers, and search engines understand it better.

---

## `<blockquote>` — Block Quotations

The `<blockquote>` element defines a section that is quoted from another source. Browsers typically indent it:

```html
<blockquote cite="https://www.w3.org/TR/html5/">
    <p>HTML is the standard markup language for creating web pages and web applications.</p>
</blockquote>
```

The optional `cite` attribute specifies the URL of the source. It's not displayed but is useful for search engines and tools.

### Practical Example

```html
<p>As Albert Einstein once said:</p>
<blockquote>
    <p>Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.</p>
</blockquote>
```

---

## `<q>` — Inline Quotations

The `<q>` element defines a **short inline quotation**. Browsers automatically add **quotation marks** around the text:

```html
<p>The W3C states that <q>HTML is the standard markup language for the web</q>.</p>
```

This renders as: The W3C states that "HTML is the standard markup language for the web".

> [!TIP]
> Use `<blockquote>` for long, stand-alone quotations and `<q>` for short quotes embedded within a sentence.

---

## `<abbr>` — Abbreviations

The `<abbr>` element marks an **abbreviation or acronym**. Use the `title` attribute to provide the full form, which appears as a tooltip on hover:

```html
<p>The <abbr title="World Wide Web">WWW</abbr> was invented by Tim Berners-Lee.</p>
<p><abbr title="HyperText Markup Language">HTML</abbr> is easy to learn.</p>
<p><abbr title="Cascading Style Sheets">CSS</abbr> handles the styling.</p>
```

Browsers typically render `<abbr>` with a **dotted underline** to indicate the tooltip.

> [!NOTE]
> You only need to define the abbreviation once on a page (first occurrence). After that, you can use the abbreviation without the `<abbr>` tag.

---

## `<cite>` — Work Titles

The `<cite>` element defines the **title of a creative work** (book, movie, painting, song, etc.). Browsers render it in *italics*:

```html
<p>My favorite book is <cite>The Great Gatsby</cite> by F. Scott Fitzgerald.</p>
<p>The movie <cite>Inception</cite> blew my mind.</p>
<p>Van Gogh's <cite>The Starry Night</cite> is an iconic painting.</p>
```

> [!IMPORTANT]
> Use `<cite>` for **titles of works**, not for the name of a person. A person's name is not a citation.

---

## `<address>` — Contact Information

The `<address>` element defines **contact information** for the author or owner of a document or article. Browsers render it in *italics*:

```html
<address>
    Written by <a href="mailto:jane@example.com">Jane Doe</a>.<br>
    123 Main Street<br>
    Springfield, IL 62704
</address>
```

The `<address>` element is typically placed inside a `<footer>` or at the end of an `<article>`.

---

## `<bdo>` — Bi-Directional Override

The `<bdo>` element overrides the **text direction**. This is useful for languages that read right-to-left (like Arabic or Hebrew):

```html
<p>Normal text: Hello World</p>
<p>Reversed: <bdo dir="rtl">Hello World</bdo></p>
```

The `dir` attribute specifies the direction:
- `ltr` — Left to right (default for English)
- `rtl` — Right to left

---

## `<bdi>` — Bi-Directional Isolation

The `<bdi>` element **isolates** a span of text that might have a different direction than its surrounding content. This prevents directional mixing issues:

```html
<ul>
    <li>User: <bdi>إيان</bdi> — Score: 90</li>
    <li>User: <bdi>John</bdi> — Score: 85</li>
</ul>
```

This is particularly useful when displaying user-generated content that might include text in different languages.

---

## Complete Example

Here's a practical example using multiple quotation and citation elements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Quotations Example</title>
</head>
<body>
    <h1>Famous Quotes</h1>

    <article>
        <h2>On Technology</h2>
        <blockquote cite="https://example.com/source">
            <p>The Web as I envisaged it, we have not seen it yet. The future is still so much bigger than the past.</p>
        </blockquote>
        <p>— Tim Berners-Lee, inventor of the <abbr title="World Wide Web">WWW</abbr></p>
    </article>

    <article>
        <h2>On Literature</h2>
        <p>In <cite>To Kill a Mockingbird</cite>, Atticus Finch says,
        <q>You never really understand a person until you consider things from his point of view.</q></p>
    </article>

    <footer>
        <address>
            Curated by <a href="mailto:editor@example.com">The Editor</a>
        </address>
    </footer>
</body>
</html>
```

---

## Summary

| Element | Purpose | Display |
|---------|---------|---------|
| `<blockquote>` | Long block quotation | Indented block |
| `<q>` | Short inline quotation | "Quoted" text |
| `<abbr>` | Abbreviation/acronym | Dotted underline + tooltip |
| `<cite>` | Title of a work | *Italic* |
| `<address>` | Contact information | *Italic* |
| `<bdo>` | Override text direction | Reversed text |
| `<bdi>` | Isolate text direction | Normal (prevents mixing) |
