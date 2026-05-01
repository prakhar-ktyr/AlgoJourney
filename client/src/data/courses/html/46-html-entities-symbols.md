---
title: HTML Entities & Symbols
---

# HTML Entities & Symbols

HTML entities display **reserved characters** and **special symbols** that can't be typed directly into HTML code.

---

## Why Entities?

Some characters have special meaning in HTML:

| Character | Meaning in HTML | Entity |
|-----------|----------------|--------|
| `<` | Opens a tag | `&lt;` |
| `>` | Closes a tag | `&gt;` |
| `&` | Starts an entity | `&amp;` |
| `"` | Attribute value delimiter | `&quot;` |
| `'` | Attribute value delimiter | `&apos;` |

```html
<p>In HTML, tags use &lt;angle brackets&gt;.</p>
<p>Use &amp;amp; to display an ampersand.</p>
```

---

## Entity Syntax

Entities can be written as **names** or **numbers**:

```html
<!-- Named entity -->
<p>&copy; 2025 My Company</p>

<!-- Numeric entity (decimal) -->
<p>&#169; 2025 My Company</p>

<!-- Numeric entity (hexadecimal) -->
<p>&#xA9; 2025 My Company</p>
```

---

## Common Entities

### Punctuation & Typography

| Entity | Symbol | Description |
|--------|--------|-------------|
| `&nbsp;` | (space) | Non-breaking space |
| `&ndash;` | – | En dash |
| `&mdash;` | — | Em dash |
| `&hellip;` | … | Horizontal ellipsis |
| `&lsquo;` / `&rsquo;` | ' ' | Smart single quotes |
| `&ldquo;` / `&rdquo;` | " " | Smart double quotes |
| `&bull;` | • | Bullet |
| `&middot;` | · | Middle dot |

### Math Symbols

| Entity | Symbol | Description |
|--------|--------|-------------|
| `&plus;` | + | Plus |
| `&minus;` | − | Minus |
| `&times;` | × | Multiplication |
| `&divide;` | ÷ | Division |
| `&equals;` | = | Equals |
| `&ne;` | ≠ | Not equal |
| `&lt;` | < | Less than |
| `&gt;` | > | Greater than |
| `&le;` | ≤ | Less than or equal |
| `&ge;` | ≥ | Greater than or equal |
| `&infin;` | ∞ | Infinity |
| `&pi;` | π | Pi |
| `&sum;` | ∑ | Summation |

### Arrows

| Entity | Symbol | Description |
|--------|--------|-------------|
| `&larr;` | ← | Left arrow |
| `&rarr;` | → | Right arrow |
| `&uarr;` | ↑ | Up arrow |
| `&darr;` | ↓ | Down arrow |
| `&harr;` | ↔ | Left-right arrow |

### Currency

| Entity | Symbol | Description |
|--------|--------|-------------|
| `&dollar;` | $ | Dollar |
| `&euro;` | € | Euro |
| `&pound;` | £ | Pound |
| `&yen;` | ¥ | Yen |
| `&cent;` | ¢ | Cent |

### Other Common Symbols

| Entity | Symbol | Description |
|--------|--------|-------------|
| `&copy;` | © | Copyright |
| `&reg;` | ® | Registered trademark |
| `&trade;` | ™ | Trademark |
| `&deg;` | ° | Degree |
| `&para;` | ¶ | Paragraph |
| `&sect;` | § | Section |
| `&hearts;` | ♥ | Heart |
| `&spades;` | ♠ | Spade |
| `&clubs;` | ♣ | Club |
| `&diams;` | ♦ | Diamond |

---

## Non-Breaking Space (`&nbsp;`)

A non-breaking space prevents the browser from collapsing multiple spaces and keeps words on the same line:

```html
<!-- Multiple regular spaces collapse to one -->
<p>Hello     World</p>  <!-- Shows: "Hello World" -->

<!-- Non-breaking spaces are preserved -->
<p>Hello&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;World</p>  <!-- Shows: "Hello     World" -->

<!-- Keep words together -->
<p>100&nbsp;km</p>  <!-- "100" and "km" won't be split across lines -->
```

---

## Emoji in HTML

Modern HTML supports emoji directly via Unicode:

```html
<p>I ❤️ HTML!</p>
<p>🚀 Let's learn web development!</p>
<p>✅ Task complete</p>
```

Or use numeric codes:

```html
<p>&#128515;</p>  <!-- 😃 -->
<p>&#128640;</p>  <!-- 🚀 -->
```

---

## Summary

- Entities display **reserved characters** and **special symbols**
- Use **named entities** (`&copy;`) or **numeric entities** (`&#169;`)
- Always escape `<`, `>`, and `&` in content
- Use **`&nbsp;`** for non-breaking spaces
- Modern browsers support **emoji** directly in HTML
