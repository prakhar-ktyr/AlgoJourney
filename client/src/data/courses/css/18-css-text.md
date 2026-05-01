---
title: CSS Text
---

# CSS Text

Typography is *most* of the visual design of a web page. CSS gives you precise control over how text looks — color, alignment, decoration, spacing, capitalization — without touching a single image.

---

## `color`

The text color.

```css
p { color: #1f2937; }
.error { color: hsl(0 80% 50%); }
```

`color` is **inherited** — set it on `body` and every descendant uses it unless overridden. This makes themed designs trivial.

---

## `text-align`

Horizontal alignment of inline content (text, images) inside a block.

```css
text-align: left;       /* default in LTR */
text-align: right;
text-align: center;
text-align: justify;    /* spread to fill the line */
text-align: start;      /* logical: left in LTR, right in RTL */
text-align: end;
```

Use `start`/`end` for international layouts.

---

## `text-decoration`

Lines on or through text.

```css
text-decoration: none;
text-decoration: underline;
text-decoration: line-through;
text-decoration: overline;
text-decoration: underline wavy red;   /* style + color in shorthand */
```

The longhand:

```css
text-decoration-line:  underline;
text-decoration-style: wavy;          /* solid | dashed | dotted | double | wavy */
text-decoration-color: red;
text-decoration-thickness: 2px;
text-underline-offset: 4px;           /* push the underline lower */
```

A common pattern — softer link underlines:

```css
a {
  color: #2563eb;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
```

---

## `text-transform`

Change capitalization without changing the source text:

```css
text-transform: none;
text-transform: uppercase;
text-transform: lowercase;
text-transform: capitalize;
```

Use it for visual labels — buttons, section titles. Don't use it on prose, because screen readers may read uppercase text differently.

---

## `text-indent`

Indent the **first line** of a block:

```css
p { text-indent: 2rem; }
```

Useful for long-form articles styled like print.

---

## `letter-spacing` and `word-spacing`

```css
h1 { letter-spacing: -0.02em; }   /* tighten big headlines */
small { letter-spacing: 0.05em; } /* breathe out small caps */
```

> [!TIP]
> Use `em` units for `letter-spacing` so the spacing scales with the font size.

---

## `line-height`

The vertical space each line occupies. The single most under-used typography property.

```css
body { line-height: 1.6; }     /* 1.6 × the font size */
h1   { line-height: 1.1; }     /* tight on big headings */
```

Use **unitless** values — they scale predictably for every descendant. Avoid `line-height: 24px` because nested text with a different size will look wrong.

---

## `white-space`

Control how whitespace and line breaks are handled.

```css
white-space: normal;        /* default — collapse, wrap as needed */
white-space: nowrap;        /* never wrap to a new line */
white-space: pre;           /* preserve whitespace, no wrapping */
white-space: pre-wrap;      /* preserve whitespace, allow wrap */
white-space: pre-line;      /* collapse spaces, keep line breaks */
```

A common one: prevent a button label from wrapping:

```css
.button { white-space: nowrap; }
```

---

## `word-break` and `overflow-wrap`

What to do when a single word is too long for its container — typically a URL or a hash:

```css
.cell {
  overflow-wrap: anywhere;   /* break at any character if needed */
  word-break: break-word;    /* older equivalent */
}
```

Without these, long strings can break out of cards and tables.

---

## `text-shadow`

A glow or drop shadow behind text. Syntax: `<x> <y> <blur> <color>`:

```css
h1 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.glow {
  text-shadow: 0 0 8px hsl(45 100% 60%);
}
```

---

## `text-overflow`

Used with `overflow: hidden` and `white-space: nowrap` to truncate long text:

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;     /* shows "..." at the end */
}
```

For multi-line truncation, use `-webkit-line-clamp`:

```css
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## A Practical Typography Reset

Drop this on a new project for instantly-readable text:

```css
body {
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
}

h1, h2, h3 {
  line-height: 1.2;
  text-wrap: balance;          /* modern: balance heading lines */
}

p { max-width: 65ch; }         /* comfortable reading line length */
```

---

## Up Next

We've styled text. Now let's choose **fonts** — the heart of typography.
