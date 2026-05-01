---
title: HTML Page Layout
---

# HTML Page Layout

HTML provides the semantic structure for page layouts, while CSS handles the actual positioning. Here's an overview of common layout techniques.

---

## Classic Page Layout

Most websites follow a common structure:

```html
<body>
    <header>Logo + Navigation</header>
    <nav>Main Menu</nav>
    <main>
        <section>Content Area</section>
        <aside>Sidebar</aside>
    </main>
    <footer>Footer</footer>
</body>
```

---

## CSS Flexbox Layout

Flexbox is ideal for **one-dimensional layouts** (row or column):

```html
<style>
    .flex-container {
        display: flex;
        gap: 20px;
    }
    .content { flex: 1; }
    .sidebar { width: 300px; }
</style>

<main class="flex-container">
    <section class="content">
        <h2>Main Content</h2>
        <p>This takes up the remaining space.</p>
    </section>
    <aside class="sidebar">
        <h3>Sidebar</h3>
        <p>Fixed width sidebar.</p>
    </aside>
</main>
```

---

## CSS Grid Layout

Grid is ideal for **two-dimensional layouts** (rows and columns):

```html
<style>
    .grid-layout {
        display: grid;
        grid-template-areas:
            "header header"
            "main sidebar"
            "footer footer";
        grid-template-columns: 1fr 300px;
        gap: 20px;
        min-height: 100vh;
    }
    .grid-header { grid-area: header; }
    .grid-main { grid-area: main; }
    .grid-sidebar { grid-area: sidebar; }
    .grid-footer { grid-area: footer; }
</style>

<div class="grid-layout">
    <header class="grid-header">Header</header>
    <main class="grid-main">Main Content</main>
    <aside class="grid-sidebar">Sidebar</aside>
    <footer class="grid-footer">Footer</footer>
</div>
```

---

## Holy Grail Layout

The "Holy Grail" is a classic three-column layout:

```html
<style>
    .holy-grail {
        display: grid;
        grid-template-columns: 200px 1fr 200px;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
</style>

<div class="holy-grail">
    <nav>Left Sidebar</nav>
    <main>Main Content</main>
    <aside>Right Sidebar</aside>
</div>
```

---

## Responsive Layout

Make layouts adapt to different screen sizes:

```html
<style>
    .responsive-layout {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 20px;
    }

    @media (max-width: 768px) {
        .responsive-layout {
            grid-template-columns: 1fr;
        }
    }
</style>
```

---

## Layout Comparison

| Method | Dimension | Best For |
|--------|-----------|----------|
| Flexbox | 1D (row or column) | Navigation bars, card rows, centering |
| Grid | 2D (rows and columns) | Full page layouts, dashboards |
| Float | 1D (legacy) | Text wrapping around images |

> [!TIP]
> Use **Grid** for overall page layout and **Flexbox** for component-level layout. They work great together!

---

## Summary

- Use **semantic HTML elements** (`<header>`, `<main>`, `<aside>`, `<footer>`) for structure
- Use **CSS Grid** for full page layouts
- Use **CSS Flexbox** for component alignment
- Add **media queries** for responsive breakpoints
- Never use `<table>` for page layout
