---
title: HTML Paragraphs
---

# HTML Paragraphs

The `<p>` element defines a paragraph. It is one of the most commonly used HTML elements.

---

## Basic Paragraphs

```html
<p>This is a paragraph of text.</p>
<p>This is another paragraph. Browsers automatically add space above and below each paragraph.</p>
```

Browsers automatically add **margin** (white space) before and after each `<p>` element, creating visual separation between paragraphs.

---

## How Browsers Handle Whitespace

HTML **collapses whitespace**. Extra spaces, tabs, and newlines in your source code are all reduced to a single space in the output:

```html
<p>This    paragraph     has     extra     spaces.</p>
```

This renders as: "This paragraph has extra spaces." — all those extra spaces are collapsed into one.

Similarly, line breaks in the source code don't create line breaks in the output:

```html
<p>
This paragraph
is written on
multiple lines
in the source code.
</p>
```

This renders as a single continuous line: "This paragraph is written on multiple lines in the source code."

> [!NOTE]
> If you need to control whitespace and line breaks precisely, use the `<pre>` element (covered below) or CSS.

---

## The `<br>` Element — Line Breaks

To insert a line break **within** a paragraph (without starting a new paragraph), use the `<br>` tag:

```html
<p>Roses are red,<br>
Violets are blue,<br>
HTML is fun,<br>
And so are you.</p>
```

The `<br>` element is an **empty element** — it has no closing tag.

> [!TIP]
> Use `<br>` sparingly. It's best for content where line breaks are part of the meaning (like poems, addresses, or song lyrics). For layout spacing, use CSS margins or padding instead.

---

## The `<hr>` Element — Horizontal Rules

The `<hr>` element creates a **horizontal line** that visually separates sections of content:

```html
<h2>Chapter 1</h2>
<p>Content for chapter one...</p>

<hr>

<h2>Chapter 2</h2>
<p>Content for chapter two...</p>
```

The `<hr>` element is also an empty element and represents a **thematic break** in the content.

---

## The `<pre>` Element — Preformatted Text

The `<pre>` element preserves **all whitespace and line breaks** exactly as written in the source code. Text inside `<pre>` is displayed in a **monospaced (fixed-width) font**:

```html
<pre>
  This text preserves
    all the spaces
      and line breaks
        exactly as written.
</pre>
```

This is useful for displaying:
- Code snippets
- ASCII art
- Poetry or formatted text

```html
<pre>
function greet(name) {
    return "Hello, " + name + "!";
}
</pre>
```

---

## Combining `<pre>` with `<code>`

For code blocks, it's best practice to nest `<code>` inside `<pre>`:

```html
<pre><code>
const x = 10;
const y = 20;
console.log(x + y);
</code></pre>
```

The `<pre>` element preserves formatting, while `<code>` adds semantic meaning indicating that the content is computer code.

---

## Paragraph Alignment with CSS

You can control paragraph alignment using the `text-align` CSS property:

```html
<p style="text-align: left;">Left-aligned text (default).</p>
<p style="text-align: center;">Center-aligned text.</p>
<p style="text-align: right;">Right-aligned text.</p>
<p style="text-align: justify;">Justified text stretches to fill the full width of its container, adding extra space between words as needed.</p>
```

---

## The `<address>` Element

The `<address>` element defines contact information for the author or owner of a document. Browsers typically render it in *italic*:

```html
<address>
    Written by Jane Doe.<br>
    Email: jane@example.com<br>
    Visit us at: Example Street 123
</address>
```

---

## Summary

| Element | Purpose |
|---------|---------|
| `<p>` | Defines a paragraph |
| `<br>` | Inserts a line break (empty element) |
| `<hr>` | Inserts a horizontal rule / thematic break (empty element) |
| `<pre>` | Preserves whitespace and line breaks (preformatted text) |
| `<address>` | Defines contact information |

- Browsers **collapse whitespace** in normal HTML text
- Use `<br>` for meaningful line breaks, not for layout
- Use `<pre>` when exact formatting matters (code, poetry, etc.)
