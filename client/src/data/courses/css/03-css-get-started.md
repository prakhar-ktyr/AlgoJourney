---
title: CSS Get Started
---

# CSS Get Started

You don't need any special software to write CSS. All you need is a **text editor** and a **browser**.

---

## What You Need

1. **A code editor** — [VS Code](https://code.visualstudio.com) is free and excellent.
2. **A modern browser** — Chrome, Firefox, Safari, or Edge. All have great DevTools.
3. **A folder** to keep your project files in.

That's it. No build tools, no npm install, no configuration.

---

## Three Ways to Add CSS to a Page

CSS can be added to an HTML document in **three** ways. We'll go deep on each in a later lesson, but here is the quick tour.

### 1. External Stylesheet (recommended)

Put your CSS in a separate `.css` file and link to it from HTML:

**`styles.css`**
```css
body {
  background-color: #f5f7fb;
  font-family: system-ui, sans-serif;
}
```

**`index.html`**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello!</h1>
</body>
</html>
```

This is the **standard** approach for real projects: one stylesheet can style hundreds of pages.

### 2. Internal Stylesheet

Put CSS inside a `<style>` tag in the page's `<head>`:

```html
<head>
  <style>
    body { background-color: #f5f7fb; }
  </style>
</head>
```

Use this for **single-page** experiments or page-specific overrides.

### 3. Inline Styles

Put CSS directly on an element with the `style` attribute:

```html
<p style="color: red; font-weight: bold;">Important!</p>
```

> [!WARNING]
> Inline styles override almost everything else and make code hard to maintain. Use them sparingly — usually only when set dynamically by JavaScript.

---

## Your First CSS Page

Create a folder called `css-tutorial` with a single file `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First CSS Page</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background-color: #eef2ff;
      color: #1e1b4b;
      max-width: 700px;
      margin: 2rem auto;
      padding: 1rem;
    }

    h1 {
      color: #4338ca;
      border-bottom: 3px solid #4338ca;
      padding-bottom: 0.5rem;
    }

    p {
      line-height: 1.6;
    }

    .highlight {
      background-color: #fef08a;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Welcome to CSS</h1>
  <p>This page is styled with CSS. Notice how the heading has a colored underline,
     and how this <span class="highlight">highlighted phrase</span> stands out.</p>
  <p>Try opening DevTools (press <strong>F12</strong>) and editing the styles live.</p>
</body>
</html>
```

**Double-click the file** to open it in your browser. Congratulations — you've just written and rendered CSS!

---

## Using Browser DevTools

Every modern browser ships with a built-in inspector. Right-click any element on a web page and choose **Inspect** (or press **F12**).

You'll see:
- The **Elements** panel — the live DOM tree
- The **Styles** panel — all CSS rules applied to the selected element
- A **Computed** tab — the final values after the cascade resolves

You can **edit any value live** — change a color, tweak a margin, toggle a property — and see the change instantly. This is the single best way to learn CSS.

---

## Up Next

Now that we can write and view CSS, let's learn the language itself, starting with **syntax**.
