---
title: HTML Object & Embed
---

# HTML Object & Embed

The `<object>` and `<embed>` elements embed external content like PDFs, multimedia, and other resources into web pages.

---

## `<object>` Element

The `<object>` element can embed various types of content:

### Embedding a PDF

```html
<object data="document.pdf" type="application/pdf" width="100%" height="600">
    <p>Your browser doesn't support PDF viewing.
       <a href="document.pdf">Download the PDF</a>.</p>
</object>
```

### Embedding an Image

```html
<object data="image.svg" type="image/svg+xml" width="200" height="200">
    <img src="fallback.png" alt="Fallback image">
</object>
```

### `<object>` Attributes

| Attribute | Description |
|-----------|-------------|
| `data` | URL of the resource |
| `type` | MIME type of the content |
| `width` / `height` | Display dimensions |
| `name` | Name for referencing |

The content between the tags serves as a **fallback** when the object can't be rendered.

---

## `<embed>` Element

`<embed>` is a simpler, void element for embedding external content:

```html
<embed src="document.pdf" type="application/pdf" width="100%" height="500">
```

> [!NOTE]
> `<embed>` has **no closing tag** and **no fallback content**. Use `<object>` if you need to provide alternative content for unsupported formats.

---

## `<object>` vs `<embed>` vs `<iframe>`

| Feature | `<object>` | `<embed>` | `<iframe>` |
|---------|-----------|----------|-----------|
| Fallback content | ✅ Yes | ❌ No | ✅ Yes |
| Closing tag | ✅ Yes | ❌ No (void) | ✅ Yes |
| Best for | PDFs, multimedia | Simple embeds | Web pages |
| Sandbox support | ❌ No | ❌ No | ✅ Yes |

---

## Modern Alternatives

For most use cases, modern HTML offers better alternatives:

| Content Type | Legacy | Modern |
|-------------|--------|--------|
| Video | `<object>` / `<embed>` | `<video>` |
| Audio | `<object>` / `<embed>` | `<audio>` |
| Web pages | `<object>` | `<iframe>` |
| Images | `<object>` | `<img>` / `<picture>` |
| PDFs | `<object>` / `<embed>` | `<iframe>` or `<object>` |

> [!TIP]
> Use `<video>`, `<audio>`, `<img>`, and `<iframe>` instead of `<object>` and `<embed>` whenever possible. They have better browser support, more features, and better accessibility.

---

## Summary

- **`<object>`** embeds external content with fallback support
- **`<embed>`** is simpler but has no fallback
- For most use cases, prefer **native HTML5 elements** (`<video>`, `<audio>`, `<img>`, `<iframe>`)
- **`<object>`** is still useful for PDFs and SVGs as fallback options
