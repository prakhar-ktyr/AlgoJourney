---
title: HTML ARIA Roles
---

# HTML ARIA Roles

ARIA (Accessible Rich Internet Applications) adds **accessibility information** to HTML elements that don't have built-in semantic meaning.

---

## When to Use ARIA

> [!IMPORTANT]
> The first rule of ARIA: **Don't use ARIA if you can use native HTML instead.** A `<button>` is always better than `<div role="button">`.

Use ARIA when:
- You're creating **custom widgets** that don't have native HTML equivalents
- You need to **enhance** semantic information
- You're building **dynamic content** updated by JavaScript

---

## ARIA Roles

Roles tell screen readers **what an element is**:

```html
<div role="navigation">
    <a href="/">Home</a>
    <a href="/about">About</a>
</div>

<div role="alert">
    Your changes have been saved!
</div>

<div role="dialog" aria-labelledby="dialog-title">
    <h2 id="dialog-title">Confirm Action</h2>
    <p>Are you sure?</p>
</div>
```

### Common Roles

| Role | Purpose | Native Equivalent |
|------|---------|------------------|
| `button` | Clickable button | `<button>` |
| `navigation` | Navigation section | `<nav>` |
| `main` | Main content | `<main>` |
| `banner` | Site header | `<header>` (top-level) |
| `contentinfo` | Site footer | `<footer>` (top-level) |
| `alert` | Important message | None |
| `dialog` | Modal dialog | `<dialog>` |
| `tab` / `tablist` / `tabpanel` | Tabbed interface | None |
| `search` | Search section | None |

---

## ARIA Properties

### `aria-label` — Accessible Name

Provides an accessible name when visible text isn't available:

```html
<button aria-label="Close menu">✕</button>
<button aria-label="Search"><svg>...</svg></button>
```

### `aria-labelledby` — Reference a Label

```html
<h2 id="section-title">User Settings</h2>
<div aria-labelledby="section-title">
    <!-- Settings content -->
</div>
```

### `aria-describedby` — Additional Description

```html
<input type="password" id="pwd" aria-describedby="pwd-help">
<p id="pwd-help">Must be at least 8 characters with one number.</p>
```

### `aria-hidden` — Hide from Screen Readers

```html
<!-- Decorative icon — hide from screen readers -->
<span aria-hidden="true">🎨</span>

<!-- Screen-reader-only text -->
<span class="sr-only">Color picker</span>
```

### `aria-expanded` — Expandable Controls

```html
<button aria-expanded="false" aria-controls="menu">Menu ▼</button>
<ul id="menu" hidden>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
</ul>
```

### `aria-live` — Dynamic Content

```html
<div aria-live="polite" id="status">
    <!-- Updated by JavaScript — screen reader announces changes -->
</div>

<script>
    document.getElementById("status").textContent = "File uploaded successfully!";
</script>
```

| Value | Behavior |
|-------|----------|
| `polite` | Announces when user is idle |
| `assertive` | Announces immediately (interrupts) |
| `off` | No announcements |

---

## ARIA States

### `aria-disabled`

```html
<button aria-disabled="true">Submit (disabled)</button>
```

### `aria-selected`

```html
<div role="tab" aria-selected="true">Tab 1</div>
<div role="tab" aria-selected="false">Tab 2</div>
```

### `aria-checked`

```html
<div role="checkbox" aria-checked="true" tabindex="0">✓ Accept Terms</div>
```

---

## Summary

- **First rule**: Use native HTML before reaching for ARIA
- **Roles** define what an element is (`button`, `navigation`, `alert`)
- **Properties** provide relationships and descriptions (`aria-label`, `aria-describedby`)
- **States** reflect current status (`aria-expanded`, `aria-selected`, `aria-checked`)
- **`aria-live`** announces dynamic content changes
- **`aria-hidden="true"`** hides decorative elements from screen readers
