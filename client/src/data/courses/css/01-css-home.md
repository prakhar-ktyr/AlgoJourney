---
title: CSS Tutorial
---

# CSS Tutorial

CSS is the language we use to style web pages. It stands for **Cascading Style Sheets** and it controls how every HTML element looks — colors, fonts, spacing, layout, animations, and responsive behavior.

If HTML gives a page its **structure**, CSS gives it its **personality**.

---

## What You Will Learn

This tutorial takes you from **complete beginner** to **confident, modern CSS developer**. By the end, you will be able to design beautiful, responsive, and accessible interfaces from scratch.

Here is the journey:

1. **Foundations** — Syntax, selectors, the cascade, specificity, and how styles are applied.
2. **The Box Model** — Margins, padding, borders, sizing, and `box-sizing`.
3. **Typography & Color** — Fonts, web fonts, text effects, color systems, and gradients.
4. **Layout** — Display modes, positioning, floats, Flexbox, and Grid.
5. **Visual Effects** — Shadows, transforms, transitions, animations, filters, and blend modes.
6. **Components** — Buttons, forms, navigation bars, dropdowns, tooltips, and image galleries.
7. **Responsive Design** — Media queries, container queries, and mobile-first workflows.
8. **Modern CSS** — Custom properties, logical properties, cascade layers, nesting, and subgrid.
9. **Accessibility & Best Practices** — Writing CSS that is fast, maintainable, and inclusive.

---

## What is CSS?

- CSS stands for **C**ascading **S**tyle **S**heets
- CSS describes **how HTML elements are displayed** on screen, paper, or in other media
- CSS **saves a lot of work** — one stylesheet can control the layout of multiple pages
- CSS files are stored in `.css` files
- CSS is one of the three core technologies of the open web, alongside **HTML** and **JavaScript**

> [!NOTE]
> CSS is not a programming language. It is a *declarative style language* — you describe what you want, and the browser figures out how to render it.

---

## Why Use CSS?

Before CSS, designers styled pages with HTML attributes like `<font color="red">`. The result was unmaintainable, inaccessible, and impossible to redesign without rewriting every page.

CSS solves this with **separation of concerns**:

| HTML | CSS | JavaScript |
|------|-----|------------|
| Structure & content | Presentation & layout | Behavior & interactivity |
| `<h1>Hello</h1>` | `h1 { color: blue; }` | `h1.onclick = ...` |

Change the look of your entire site by editing **one** stylesheet.

---

## A First Taste

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f5f7fb;
      color: #1f2937;
    }
    h1 {
      color: #2563eb;
      text-align: center;
    }
    p {
      max-width: 60ch;
      margin: 1rem auto;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>Hello, CSS!</h1>
  <p>This page is styled entirely with CSS — no inline attributes, no images, just rules.</p>
</body>
</html>
```

In a few short lines, we have:
- Set a clean system font for the whole page
- Centered the heading and changed its color
- Constrained paragraphs to a comfortable reading width
- Added breathing room with margins and line-height

That is the power of CSS in miniature.

---

## How to Use This Tutorial

- **Follow the lessons in order** — each builds on the previous.
- **Type the examples by hand.** Reading code is not the same as writing it.
- **Open DevTools** in your browser (F12) and experiment. CSS is best learned by tweaking.
- **Build mini-projects** as you go: a button, a card, a navbar, a landing page.

Ready? Let's begin with the [introduction](./css-intro).
