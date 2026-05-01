---
title: HTML Iframes
---

# HTML Iframes

The `<iframe>` element embeds another HTML page within the current page.

---

## Basic Iframe

```html
<iframe src="https://www.example.com" width="600" height="400" title="Example website"></iframe>
```

---

## Iframe Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | URL of the page to embed |
| `width` / `height` | Dimensions |
| `title` | Accessible description (required) |
| `name` | Target name for links |
| `loading` | `lazy` or `eager` |
| `sandbox` | Security restrictions |
| `allow` | Feature permissions |
| `allowfullscreen` | Permits fullscreen mode |

---

## The `sandbox` Attribute

Restricts what the embedded page can do:

```html
<iframe src="untrusted-page.html" sandbox></iframe>
```

An empty `sandbox` blocks: scripts, forms, popups, and more. Selectively enable features:

```html
<iframe src="form-page.html"
        sandbox="allow-scripts allow-forms allow-same-origin"
        title="Form page">
</iframe>
```

| Value | Allows |
|-------|--------|
| `allow-scripts` | JavaScript execution |
| `allow-forms` | Form submission |
| `allow-same-origin` | Same-origin access |
| `allow-popups` | Opening new windows |
| `allow-modals` | Modal dialogs |

> [!WARNING]
> Be cautious embedding untrusted content. Always use `sandbox` to limit the embedded page's capabilities. Never use `allow-scripts` and `allow-same-origin` together for untrusted content — it lets the iframe bypass all sandbox restrictions.

---

## The `allow` Attribute

Controls browser feature permissions:

```html
<iframe
    src="https://example.com"
    allow="camera; microphone; geolocation"
    title="Feature demo">
</iframe>
```

---

## Using `name` as a Link Target

```html
<iframe src="default.html" name="content-frame" width="100%" height="500" title="Content"></iframe>

<nav>
    <a href="page1.html" target="content-frame">Page 1</a>
    <a href="page2.html" target="content-frame">Page 2</a>
    <a href="page3.html" target="content-frame">Page 3</a>
</nav>
```

Clicking the links loads the page inside the iframe.

---

## Lazy Loading Iframes

```html
<iframe src="https://example.com" loading="lazy" width="600" height="400" title="Example"></iframe>
```

Use `loading="lazy"` for iframes below the fold to improve page performance.

---

## Responsive Iframes

```html
<style>
    .iframe-container {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
    }
    .iframe-container iframe {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }
</style>

<div class="iframe-container">
    <iframe src="https://example.com" title="Responsive iframe"></iframe>
</div>
```

---

## Security Considerations

1. Only embed **trusted sources**
2. Always use **`sandbox`** for untrusted content
3. Use **`X-Frame-Options`** headers on your site to control who can iframe your pages
4. Consider **Content Security Policy** (CSP) `frame-src` directive

---

## Summary

- `<iframe>` embeds another page within your page
- Always include a **`title`** for accessibility
- Use **`sandbox`** to restrict untrusted content
- Use **`loading="lazy"`** for below-the-fold iframes
- Wrap in an **aspect-ratio container** for responsive embeds
