---
title: HTML Attributes
---

# HTML Attributes

HTML attributes provide **additional information** about elements. They are always specified in the **opening tag** and usually come in **name="value"** pairs.

```html
<tagname attribute="value">Content</tagname>
```

---

## How Attributes Work

Attributes modify the behavior or appearance of an element. For example, the `<a>` tag defines a link, but the `href` attribute tells the browser *where* the link goes:

```html
<a href="https://www.example.com">Visit Example</a>
```

Here, `href` is the attribute **name** and `"https://www.example.com"` is the attribute **value**.

---

## Common HTML Attributes

### The `href` Attribute

Specifies the URL for links:

```html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
```

### The `src` Attribute

Specifies the file path for images, scripts, and other embedded content:

```html
<img src="images/logo.png" alt="Company Logo">
<script src="js/app.js"></script>
```

### The `alt` Attribute

Provides alternative text for images. This text is displayed if the image fails to load and is read by screen readers for accessibility:

```html
<img src="sunset.jpg" alt="A golden sunset over the ocean">
```

> [!IMPORTANT]
> Always include the `alt` attribute on images. It's essential for **accessibility** and is required by web standards.

### The `width` and `height` Attributes

Set the dimensions of images (in pixels):

```html
<img src="photo.jpg" alt="My photo" width="400" height="300">
```

### The `style` Attribute

Adds inline CSS styling to an element:

```html
<p style="color: red; font-size: 18px;">This text is red and larger.</p>
```

### The `title` Attribute

Provides extra information that appears as a **tooltip** when the user hovers over the element:

```html
<p title="This is a tooltip">Hover over me!</p>
```

---

## The `lang` Attribute

The `lang` attribute should be included in the `<html>` tag to declare the language of the page. This helps search engines and screen readers:

```html
<html lang="en">
```

Common language codes:

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `hi` | Hindi |
| `ja` | Japanese |
| `zh` | Chinese |

---

## The `id` Attribute

The `id` attribute specifies a **unique identifier** for an element. Each `id` must be unique within the page:

```html
<h2 id="introduction">Introduction</h2>
<p id="main-content">This is the main content.</p>
```

You can use `id` to:
- Link to a specific section: `<a href="#introduction">Go to Introduction</a>`
- Target the element with CSS: `#introduction { color: blue; }`
- Access it with JavaScript: `document.getElementById("introduction")`

---

## The `class` Attribute

The `class` attribute specifies one or more **class names** for an element. Unlike `id`, the same class can be used on multiple elements:

```html
<p class="highlight">This paragraph is highlighted.</p>
<p class="highlight large">This one has two classes.</p>
```

> [!TIP]
> Use **`id`** for unique elements (one per page). Use **`class`** for groups of elements that share the same styling or behavior.

---

## Quoting Attribute Values

HTML allows attribute values with or without quotes in certain cases, but **always use quotes**:

```html
<!-- Recommended: double quotes -->
<a href="https://www.example.com">Link</a>

<!-- Also valid: single quotes -->
<a href='https://www.example.com'>Link</a>

<!-- Works but NOT recommended: no quotes -->
<a href=https://www.example.com>Link</a>
```

> [!WARNING]
> Omitting quotes can cause unexpected behavior, especially when values contain spaces. Always use **double quotes** for consistency.

---

## Boolean Attributes

Some attributes don't need a value — their mere presence means "true":

```html
<input type="text" disabled>
<input type="checkbox" checked>
<video src="movie.mp4" autoplay muted></video>
```

These are called **boolean attributes**. Writing `disabled` is equivalent to `disabled="disabled"`.

---

## Global Attributes

Some attributes can be used on **any** HTML element. These are called **global attributes**:

| Attribute | Description |
|-----------|-------------|
| `id` | Unique identifier |
| `class` | CSS class name(s) |
| `style` | Inline CSS styles |
| `title` | Tooltip text |
| `lang` | Language of the element's content |
| `dir` | Text direction (`ltr` or `rtl`) |
| `hidden` | Hides the element |
| `tabindex` | Tab order for keyboard navigation |
| `data-*` | Custom data attributes |

---

## Summary

- Attributes provide **extra information** about elements
- They go in the **opening tag** as `name="value"` pairs
- Always **quote** attribute values (use double quotes)
- **`id`** must be unique; **`class`** can be shared
- Use **`alt`** on all images for accessibility
- **Global attributes** (`id`, `class`, `style`, `title`, `hidden`, etc.) work on any element
