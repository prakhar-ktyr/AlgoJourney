---
title: HTML CSS
---

# HTML CSS

CSS (Cascading Style Sheets) controls the **visual appearance** of HTML elements. There are three ways to add CSS to your HTML: **inline**, **internal**, and **external**.

---

## Why CSS?

HTML defines the **structure** of your content. CSS defines how it **looks**:

- Colors and backgrounds
- Fonts and text styling
- Spacing (margins and padding)
- Layout and positioning
- Animations and transitions

Without CSS, web pages would be plain black text on a white background with default browser styling.

---

## Inline CSS

Inline CSS uses the `style` attribute **directly on an element**. It applies to that single element only:

```html
<h1 style="color: blue; font-size: 36px;">Blue Heading</h1>
<p style="color: gray; font-family: Arial, sans-serif;">Styled paragraph.</p>
```

### When to Use Inline CSS

- Quick testing and prototyping
- Email templates (some email clients don't support external CSS)
- Overriding styles in very specific cases

> [!WARNING]
> Avoid inline CSS for production websites. It mixes content with presentation, making your code harder to maintain. One style change could require editing dozens of elements.

---

## Internal CSS

Internal CSS uses a `<style>` element inside the `<head>` section. It applies to the **entire page**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Internal CSS Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>This page uses internal CSS for styling.</p>
</body>
</html>
```

### When to Use Internal CSS

- Single-page websites
- Page-specific styles that shouldn't affect other pages
- Quick demos and examples

---

## External CSS

External CSS stores styles in a **separate `.css` file** and links it to the HTML using the `<link>` element. This is the **recommended approach** for most projects:

**styles.css:**
```css
body {
    font-family: 'Segoe UI', sans-serif;
    background-color: #fafafa;
    color: #333;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #1a1a2e;
    font-size: 2rem;
}

p {
    line-height: 1.8;
    max-width: 700px;
}

a {
    color: #e94560;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>External CSS Example</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>This page uses an <a href="styles.css">external stylesheet</a>.</p>
</body>
</html>
```

### Why External CSS is Best

- **Separation of concerns** — Content (HTML) and presentation (CSS) are separate
- **Reusability** — One CSS file can style multiple HTML pages
- **Caching** — Browsers cache the CSS file, making subsequent page loads faster
- **Maintainability** — Change the look of your entire site by editing one file

---

## Multiple Stylesheets

You can link multiple CSS files:

```html
<head>
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/theme.css">
</head>
```

They are applied in order, so later files can override earlier ones.

---

## CSS Priority (Cascade)

When multiple styles target the same element, CSS follows a priority order:

1. **Inline styles** (highest priority)
2. **Internal and external styles** (in order of appearance)
3. **Browser defaults** (lowest priority)

```html
<head>
    <style>
        p { color: blue; }
    </style>
</head>
<body>
    <!-- Inline style wins over internal style -->
    <p style="color: red;">This text is RED (inline wins)</p>
    <p>This text is BLUE (internal style)</p>
</body>
```

---

## Common CSS Properties

Here are the most frequently used CSS properties:

| Property | Description | Example |
|----------|-------------|---------|
| `color` | Text color | `color: #333;` |
| `background-color` | Background color | `background-color: #f0f0f0;` |
| `font-family` | Font face | `font-family: Arial, sans-serif;` |
| `font-size` | Text size | `font-size: 16px;` |
| `font-weight` | Bold/normal | `font-weight: bold;` |
| `text-align` | Text alignment | `text-align: center;` |
| `margin` | Outer spacing | `margin: 20px;` |
| `padding` | Inner spacing | `padding: 10px;` |
| `border` | Border around element | `border: 1px solid #ccc;` |
| `width` | Element width | `width: 100%;` |
| `max-width` | Maximum width | `max-width: 800px;` |

---

## The `<link>` Element

The `<link>` element connects external resources to your HTML page. For CSS:

```html
<link rel="stylesheet" href="path/to/styles.css">
```

Key attributes:
- **`rel="stylesheet"`** — Specifies the relationship (a stylesheet)
- **`href`** — The path to the CSS file

You can also link to external fonts this way:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
```

---

## Summary

| Method | Where | Best For |
|--------|-------|----------|
| Inline | `style` attribute on element | Quick tests, email templates |
| Internal | `<style>` in `<head>` | Single-page, page-specific styles |
| External | `.css` file via `<link>` | Production websites (recommended) |

- **External CSS** is the best practice for real-world projects
- CSS follows a **cascade** — inline > internal/external > browser defaults
- Use `<link rel="stylesheet">` to connect CSS files to HTML
