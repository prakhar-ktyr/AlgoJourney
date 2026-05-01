---
title: HTML Best Practices
---

# HTML Best Practices

Follow these best practices to write **clean, maintainable, and professional** HTML that works well for users, search engines, and fellow developers.

---

## 1. Always Declare DOCTYPE

```html
<!DOCTYPE html>
```

This ensures the browser renders in **standards mode**.

---

## 2. Use Proper Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Descriptive Page Title</title>
</head>
<body>
    <!-- Content here -->
</body>
</html>
```

---

## 3. Use Semantic HTML

```html
<!-- BAD -->
<div id="header">...</div>
<div class="nav">...</div>
<div id="main">...</div>

<!-- GOOD -->
<header>...</header>
<nav>...</nav>
<main>...</main>
```

---

## 4. Always Include `alt` on Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Quarterly revenue chart showing 20% growth">

<!-- Decorative image -->
<img src="divider.png" alt="">
```

---

## 5. Use External CSS and JavaScript

```html
<!-- GOOD: External files -->
<link rel="stylesheet" href="styles.css">
<script src="app.js" defer></script>

<!-- AVOID: Inline styles and scripts -->
<p style="color: red;">...</p>
<script>/* ... */</script>
```

---

## 6. Validate Your HTML

Use the [W3C HTML Validator](https://validator.w3.org/) to check for errors:
- Missing closing tags
- Invalid nesting
- Missing required attributes
- Deprecated elements

---

## 7. Keep It Accessible

- Use `<label>` for all form inputs
- Ensure sufficient color contrast (4.5:1 ratio)
- Provide keyboard navigation
- Add ARIA attributes only when needed
- Test with screen readers

---

## 8. Optimize for Performance

```html
<!-- Lazy load below-fold images -->
<img src="photo.jpg" alt="Photo" loading="lazy" width="800" height="600">

<!-- Defer scripts -->
<script src="app.js" defer></script>

<!-- Preconnect to third-party domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

---

## 9. Use Consistent Formatting

```html
<!-- Consistent indentation (2 or 4 spaces) -->
<main>
    <article>
        <h2>Title</h2>
        <p>Content</p>
    </article>
</main>
```

- Use **lowercase** for all tag names and attributes
- Always **quote** attribute values
- Use **double quotes** consistently
- Close all tags (including optional ones)
- Indent nested elements

---

## 10. Don't Use Deprecated Elements

| Deprecated | Use Instead |
|-----------|-------------|
| `<center>` | CSS `text-align: center` |
| `<font>` | CSS `font-family`, `color` |
| `<b>` for importance | `<strong>` |
| `<i>` for emphasis | `<em>` |
| `<marquee>` | CSS animations |
| `<frame>` / `<frameset>` | `<iframe>` or CSS layout |
| `bgcolor` attribute | CSS `background-color` |
| `align` attribute | CSS `text-align` or flexbox |

---

## 11. Use Meaningful IDs and Classes

```html
<!-- GOOD: Descriptive names -->
<div class="product-card">...</div>
<button id="submit-order">Place Order</button>

<!-- BAD: Generic or cryptic names -->
<div class="div1">...</div>
<button id="btn2">Submit</button>
```

---

## 12. Comment Wisely

```html
<!-- GOOD: Explains WHY -->
<!-- Using flexbox here because grid breaks in Safari 14 -->

<!-- BAD: States the obvious -->
<!-- This is the header -->
<header>...</header>
```

---

## HTML Checklist

Before publishing, verify:

- [ ] `<!DOCTYPE html>` is present
- [ ] `<html lang="en">` specifies the language
- [ ] `<meta charset="UTF-8">` is set
- [ ] `<meta name="viewport">` is included
- [ ] `<title>` is descriptive and unique
- [ ] `<meta name="description">` is present
- [ ] All images have `alt` attributes
- [ ] All form inputs have `<label>` elements
- [ ] HTML validates with W3C validator
- [ ] Page is keyboard navigable
- [ ] Color contrast passes WCAG AA
- [ ] Scripts use `defer` or `async`
- [ ] Below-fold images use `loading="lazy"`

---

## Summary

- Write **semantic**, **valid**, **accessible** HTML
- Use **external files** for CSS and JavaScript
- **Validate** your HTML with W3C tools
- Follow **consistent formatting** conventions
- Avoid **deprecated** elements and attributes
- Always consider **performance** and **accessibility**
- Use the **checklist** above before every deployment
