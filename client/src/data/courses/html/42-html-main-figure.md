---
title: HTML Main, Figure & Details
---

# HTML Main, Figure & Details

More semantic elements for structuring page content and creating interactive components.

---

## `<main>` — Primary Content

The `<main>` element wraps the **primary content** of the page — content unique to this page, excluding headers, footers, and navigation that repeat across pages:

```html
<body>
    <header>...</header>
    <nav>...</nav>

    <main>
        <h1>Article Title</h1>
        <p>This is the main content of the page.</p>
    </main>

    <footer>...</footer>
</body>
```

> [!IMPORTANT]
> There should be only **one `<main>`** element per page, and it should not be nested inside `<article>`, `<aside>`, `<footer>`, `<header>`, or `<nav>`.

---

## `<figure>` and `<figcaption>` — Images with Captions

The `<figure>` element wraps self-contained content (images, diagrams, code) with an optional caption:

```html
<figure>
    <img src="chart.png" alt="Sales growth chart showing 40% increase" width="600">
    <figcaption>Figure 1: Sales growth over the past year</figcaption>
</figure>
```

`<figure>` is not just for images — it works with any content that's referenced from the main flow:

```html
<figure>
    <pre><code>
function greet(name) {
    return `Hello, ${name}!`;
}
    </code></pre>
    <figcaption>A simple greeting function in JavaScript</figcaption>
</figure>

<figure>
    <blockquote>
        The only way to do great work is to love what you do.
    </blockquote>
    <figcaption>— Steve Jobs</figcaption>
</figure>
```

---

## `<details>` and `<summary>` — Expandable Content

Create interactive, collapsible sections **without JavaScript**:

```html
<details>
    <summary>Click to see more information</summary>
    <p>This content is hidden by default and revealed when the user clicks the summary.</p>
</details>
```

### Open by Default

```html
<details open>
    <summary>This section starts expanded</summary>
    <p>The content is visible when the page loads.</p>
</details>
```

### FAQ Example

```html
<h2>Frequently Asked Questions</h2>

<details>
    <summary>What is HTML?</summary>
    <p>HTML (HyperText Markup Language) is the standard language for creating web pages.</p>
</details>

<details>
    <summary>Do I need to learn CSS too?</summary>
    <p>Yes! CSS controls the visual appearance of your HTML. They work together.</p>
</details>

<details>
    <summary>Is HTML a programming language?</summary>
    <p>No, HTML is a markup language. It defines structure, not logic.</p>
</details>
```

### Styled Accordion

```html
<style>
    details {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
    }
    summary {
        font-weight: 600;
        cursor: pointer;
        color: #1e293b;
    }
    summary:hover { color: #4f46e5; }
    details[open] summary {
        margin-bottom: 12px;
        color: #4f46e5;
    }
</style>
```

---

## `<dialog>` — Modal Dialogs

The `<dialog>` element creates modal and non-modal dialogs (covered in detail in a later lesson):

```html
<dialog id="myDialog">
    <h2>Dialog Title</h2>
    <p>This is a native HTML dialog!</p>
    <button onclick="this.closest('dialog').close()">Close</button>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">Open Dialog</button>
```

---

## Summary

| Element | Purpose |
|---------|---------|
| `<main>` | Primary page content (one per page) |
| `<figure>` | Self-contained content (images, code, quotes) |
| `<figcaption>` | Caption for a `<figure>` |
| `<details>` | Expandable/collapsible content |
| `<summary>` | Clickable label for `<details>` |
| `<dialog>` | Modal and non-modal dialogs |

- **One `<main>`** per page for primary content
- **`<figure>`** for any referenced, self-contained content
- **`<details>`/`<summary>`** create accordions without JavaScript
