---
title: HTML Text Formatting
---

# HTML Text Formatting

HTML provides several elements for formatting text with **semantic meaning**. These elements not only change how text looks but also convey its purpose to browsers, screen readers, and search engines.

---

## Bold Text

### `<b>` — Bold (Visual Only)

The `<b>` element makes text bold without adding any extra importance:

```html
<p>This is <b>bold text</b> for visual emphasis.</p>
```

### `<strong>` — Strong Importance

The `<strong>` element indicates that its content has **strong importance**. Browsers render it as bold, and screen readers may stress the text:

```html
<p><strong>Warning:</strong> This action cannot be undone.</p>
```

> [!TIP]
> Prefer `<strong>` over `<b>` in most cases. Use `<b>` only when you want visual boldness without implying importance (e.g., product names in a review, keywords in an abstract).

---

## Italic Text

### `<i>` — Italic (Visual Only)

The `<i>` element renders text in italics. It's used for text in an alternate voice or mood — like technical terms, foreign words, or thoughts:

```html
<p>The word <i>HTML</i> stands for HyperText Markup Language.</p>
<p>She thought, <i>this is going to be a long day</i>.</p>
```

### `<em>` — Emphasis

The `<em>` element indicates **stress emphasis**. Browsers render it as italic, and screen readers will vocally stress the text:

```html
<p>You <em>must</em> save the file before closing.</p>
<p>I said I wanted the <em>blue</em> one, not the red one.</p>
```

---

## Highlighted Text

The `<mark>` element highlights text with a **yellow background** (by default), indicating relevance or importance in context:

```html
<p>Search results for "HTML": Learn <mark>HTML</mark> in this comprehensive tutorial.</p>
```

This is commonly used for:
- Search result highlighting
- Marking relevant text in quotations
- Drawing attention to key terms

---

## Small Text

The `<small>` element renders text in a **smaller font size**. It's typically used for side comments, fine print, or copyright notices:

```html
<p>Regular text with <small>some fine print here</small>.</p>
<footer>
    <p><small>&copy; 2025 My Website. All rights reserved.</small></p>
</footer>
```

---

## Deleted and Inserted Text

### `<del>` — Deleted (Strikethrough)

The `<del>` element indicates text that has been **deleted** or is no longer accurate. Browsers display it with a strikethrough:

```html
<p>Price: <del>$49.99</del> $29.99</p>
```

### `<ins>` — Inserted (Underlined)

The `<ins>` element indicates text that has been **added** or inserted. Browsers display it with an underline:

```html
<p>Price: <del>$49.99</del> <ins>$29.99</ins></p>
```

These are great for showing price changes, document revisions, or corrections.

---

## Subscript and Superscript

### `<sub>` — Subscript

The `<sub>` element renders text slightly **below** the normal line and in a smaller font. It's used for chemical formulas, footnotes, and mathematical notation:

```html
<p>Water is H<sub>2</sub>O.</p>
<p>The formula for carbon dioxide is CO<sub>2</sub>.</p>
```

### `<sup>` — Superscript

The `<sup>` element renders text slightly **above** the normal line. It's used for exponents, ordinal numbers, and footnote references:

```html
<p>E = mc<sup>2</sup></p>
<p>Today is the 4<sup>th</sup> of July.</p>
<p>This claim needs a source.<sup>[1]</sup></p>
```

---

## Code-Related Elements

### `<code>` — Inline Code

The `<code>` element represents a fragment of **computer code**. Browsers display it in a monospaced font:

```html
<p>Use the <code>console.log()</code> function to print output.</p>
```

### `<kbd>` — Keyboard Input

The `<kbd>` element represents **keyboard input** or keys:

```html
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>
```

### `<samp>` — Sample Output

The `<samp>` element represents **sample output** from a program:

```html
<p>The program printed: <samp>Hello, World!</samp></p>
```

### `<var>` — Variable

The `<var>` element represents a **mathematical variable** or placeholder:

```html
<p>The area of a circle is &pi;<var>r</var><sup>2</sup>.</p>
```

---

## All Formatting Elements at a Glance

| Element | Purpose | Visual Effect |
|---------|---------|--------------|
| `<b>` | Bold text (no importance) | **Bold** |
| `<strong>` | Strong importance | **Bold** |
| `<i>` | Alternate voice/mood | *Italic* |
| `<em>` | Stress emphasis | *Italic* |
| `<mark>` | Highlighted text | Yellow background |
| `<small>` | Side comments, fine print | Smaller text |
| `<del>` | Deleted text | ~~Strikethrough~~ |
| `<ins>` | Inserted text | Underlined |
| `<sub>` | Subscript | Below baseline |
| `<sup>` | Superscript | Above baseline |
| `<code>` | Inline code | `Monospace` |
| `<kbd>` | Keyboard input | Monospace |
| `<samp>` | Sample output | Monospace |
| `<var>` | Variable | *Italic* |

---

## Summary

- Use **`<strong>`** for important text and **`<em>`** for emphasized text — they carry semantic meaning
- Use **`<b>`** and **`<i>`** for visual-only formatting without semantic weight
- **`<mark>`** highlights text; **`<small>`** reduces text size
- **`<del>`** and **`<ins>`** show revisions (strikethrough and underline)
- **`<sub>`** and **`<sup>`** handle subscripts and superscripts
- **`<code>`**, **`<kbd>`**, **`<samp>`**, and **`<var>`** are for code-related content
