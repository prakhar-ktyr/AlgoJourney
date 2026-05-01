---
title: HTML Links
---

# HTML Links

Links are the foundation of the web. They connect pages to each other, creating the **hypertext** in HyperText Markup Language.

---

## Creating Links

Links are created with the `<a>` (anchor) element:

```html
<a href="https://www.example.com">Visit Example.com</a>
```

- **`href`** — The URL the link points to (required)
- **Link text** — The clickable text displayed to the user

---

## Absolute vs Relative URLs

### Absolute URLs

An absolute URL includes the **full address** (protocol + domain + path):

```html
<a href="https://www.example.com/about">About Page</a>
<a href="https://developer.mozilla.org">MDN Web Docs</a>
```

Use absolute URLs for linking to **external websites**.

### Relative URLs

A relative URL specifies the path **relative to the current page**:

```html
<!-- Same directory -->
<a href="about.html">About</a>

<!-- Subdirectory -->
<a href="pages/contact.html">Contact</a>

<!-- Parent directory -->
<a href="../index.html">Home</a>

<!-- Root-relative -->
<a href="/about.html">About (from root)</a>
```

Use relative URLs for linking within **your own website**.

> [!TIP]
> Relative URLs are preferred for internal links because they work regardless of your domain name. If you move your site to a different domain, all internal links still work.

---

## The `target` Attribute

The `target` attribute specifies **where** to open the linked page:

| Value | Behavior |
|-------|----------|
| `_self` | Opens in the same tab (default) |
| `_blank` | Opens in a new tab/window |
| `_parent` | Opens in the parent frame |
| `_top` | Opens in the full body of the window |

```html
<!-- Opens in same tab (default) -->
<a href="about.html">About</a>

<!-- Opens in a new tab -->
<a href="https://www.example.com" target="_blank">Visit Example (new tab)</a>
```

> [!WARNING]
> When using `target="_blank"`, always add `rel="noopener noreferrer"` for security. Without it, the new page can access your page's `window.opener` object.

```html
<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
    Safe External Link
</a>
```

---

## Email Links

Use `mailto:` in the `href` to create an email link that opens the user's email client:

```html
<a href="mailto:hello@example.com">Send us an email</a>
```

You can pre-fill the subject and body:

```html
<a href="mailto:hello@example.com?subject=Hello&body=I%20have%20a%20question">
    Email with subject
</a>
```

---

## Phone Links

Use `tel:` to create clickable phone numbers (especially useful on mobile):

```html
<a href="tel:+1234567890">Call us: +1 (234) 567-890</a>
```

---

## Download Links

Add the `download` attribute to make the link download a file instead of navigating to it:

```html
<a href="files/report.pdf" download>Download Report (PDF)</a>

<!-- Suggest a filename -->
<a href="files/report.pdf" download="annual-report-2025.pdf">
    Download Annual Report
</a>
```

---

## Bookmark Links (Page Anchors)

Link to a **specific section** on the same page using `#` and the target element's `id`:

```html
<!-- Create the target -->
<h2 id="section-3">Section 3: Advanced Topics</h2>

<!-- Link to the target -->
<a href="#section-3">Jump to Section 3</a>
```

You can also link to a section on **another page**:

```html
<a href="about.html#team">Meet Our Team</a>
```

### "Back to Top" Link

A common pattern for long pages:

```html
<!-- At the top of the page -->
<h1 id="top">My Long Article</h1>

<!-- ... lots of content ... -->

<!-- At the bottom -->
<a href="#top">⬆ Back to Top</a>
```

---

## Links with Images

You can wrap an image in a link to make it clickable:

```html
<a href="https://www.example.com">
    <img src="logo.png" alt="Company Logo" width="150">
</a>
```

---

## Link States

Links have different visual states that can be styled with CSS:

```html
<style>
    /* Unvisited link */
    a:link { color: #1a73e8; }

    /* Visited link */
    a:visited { color: #681da8; }

    /* Mouse hover */
    a:hover { color: #d93025; text-decoration: underline; }

    /* Currently being clicked */
    a:active { color: #c5221f; }
</style>
```

---

## The `title` Attribute

Add a tooltip to links with the `title` attribute:

```html
<a href="https://developer.mozilla.org" title="Mozilla Developer Network - Web Documentation">
    MDN Web Docs
</a>
```

The tooltip appears when the user hovers over the link.

---

## Summary

| Feature | Syntax |
|---------|--------|
| Basic link | `<a href="url">Text</a>` |
| New tab | `<a href="url" target="_blank" rel="noopener noreferrer">` |
| Email | `<a href="mailto:email@example.com">` |
| Phone | `<a href="tel:+1234567890">` |
| Download | `<a href="file.pdf" download>` |
| Bookmark | `<a href="#section-id">` |
| Image link | `<a href="url"><img src="img.jpg" alt="..."></a>` |

- Use **relative URLs** for internal links, **absolute URLs** for external links
- Always add **`rel="noopener noreferrer"`** with `target="_blank"`
- Use **bookmark links** for in-page navigation
