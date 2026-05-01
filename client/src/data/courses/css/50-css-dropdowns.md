---
title: CSS Dropdowns
---

# CSS Dropdowns

A dropdown menu reveals a list of choices when triggered. With Flexbox + pseudo-classes (or even just `:hover`), CSS-only dropdowns are surprisingly capable. For real production menus, ARIA + JavaScript provides better accessibility — but knowing the pure-CSS approach is genuinely useful.

---

## Hover Dropdown (CSS Only)

```html
<nav class="navbar">
  <ul class="nav">
    <li class="has-menu">
      <a href="#">Products</a>
      <ul class="menu">
        <li><a href="/web">Web</a></li>
        <li><a href="/mobile">Mobile</a></li>
        <li><a href="/desktop">Desktop</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

```css
.nav, .menu { list-style: none; margin: 0; padding: 0; }

.has-menu { position: relative; }

.menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
  padding: 0.25rem;

  display: none;
}

.has-menu:hover > .menu,
.has-menu:focus-within > .menu {
  display: block;
}

.menu a {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  color: #1f2937;
}
.menu a:hover { background: #f3f4f6; }
```

`:focus-within` makes the dropdown also work for keyboard users — when focus moves into a child link, the menu stays open.

---

## Animated Reveal

Replace the harsh `display: none` with a smoother fade:

```css
.menu {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.15s, transform 0.15s;
  display: block;       /* always laid out */
}

.has-menu:hover > .menu,
.has-menu:focus-within > .menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

Smoother feel, still no JavaScript.

---

## Click-to-Open With `<details>`

A semantic, accessible click dropdown using native HTML:

```html
<details class="dropdown">
  <summary>Settings</summary>
  <ul>
    <li><a href="#">Account</a></li>
    <li><a href="#">Preferences</a></li>
    <li><a href="#">Sign out</a></li>
  </ul>
</details>
```

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown summary {
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  list-style: none;       /* hide the default disclosure triangle */
  border-radius: 6px;
}

.dropdown summary::-webkit-details-marker { display: none; }

.dropdown summary:hover { background: #f3f4f6; }

.dropdown ul {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  margin: 0.25rem 0 0;
  padding: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
  list-style: none;
}
```

`<details>` ships with native open/close behavior. The summary is a button. Keyboard works. Screen readers announce expanded/collapsed state. **It's the closest you get to "free" accessibility.**

---

## Mega Menu

When the dropdown should contain images, columns, or rich content:

```css
.menu.mega {
  width: 600px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}
```

Treat the menu like any other layout — Grid or Flexbox inside.

---

## Right-Aligned Dropdowns

If a dropdown overflows the viewport on the right, anchor it to the right of its trigger instead:

```css
.has-menu.right > .menu {
  left: auto;
  right: 0;
}
```

This is the limit of pure CSS — for true viewport-aware repositioning, use a JS library like Floating UI.

---

## Accessibility — Where CSS-Only Falls Short

A pure-CSS hover dropdown:

- ❌ Doesn't work on touch devices (no hover).
- ❌ Doesn't announce expanded/collapsed to screen readers.
- ❌ Doesn't trap focus inside the menu.

For production navigation, prefer:

1. **`<details>`** (built-in click + keyboard).
2. A **JavaScript-powered menu** with `aria-expanded`, `aria-haspopup`, and arrow-key navigation.

Reach for pure-CSS only for low-stakes UIs (a mega-menu's secondary links, where the primary is reachable elsewhere).

---

## Up Next

UI dropdowns done. Now to a layout topic — **multi-column** text.
