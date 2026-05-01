---
title: CSS Navigation Bar
---

# CSS Navigation Bar

A navigation bar is just a styled list of links. With Flexbox, it's a few lines of code — no `float` clearing, no whitespace bugs, no JavaScript required.

---

## Semantic Markup

```html
<nav class="navbar" aria-label="Main">
  <a class="brand" href="/">My Site</a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

Always wrap top-level navigation in a `<nav>` with an `aria-label`, and use a `<ul>` of links inside. Screen reader users can jump to navigation regions and count items.

---

## Horizontal Bar

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  font-weight: 700;
  text-decoration: none;
  color: #111;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  display: block;
  padding: 0.5rem 0.875rem;
  text-decoration: none;
  color: #374151;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}

.nav-links a:hover {
  background: #f3f4f6;
  color: #111;
}
```

A clean, modern nav bar in 30 lines.

---

## Highlighting the Active Page

The cleanest pattern uses an attribute on the active link:

```html
<li><a href="/about" aria-current="page">About</a></li>
```

```css
.nav-links a[aria-current="page"] {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
}
```

Why ARIA? Screen readers announce "current page", which is exactly the meaning we want. Two birds, one attribute.

---

## Sticky Navbar

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgb(255 255 255 / 0.8);
}
```

Sticks at the top of the viewport as the user scrolls. The `backdrop-filter` blurs whatever scrolls behind it — gorgeous.

---

## Responsive — Mobile Menu

For narrow screens, hide the links and show a hamburger button:

```css
.menu-toggle { display: none; }

@media (max-width: 640px) {
  .nav-links {
    display: none;
    position: absolute;
    inset: 100% 0 auto 0;
    flex-direction: column;
    background: white;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .menu-toggle { display: block; }
  .navbar:has(.menu-toggle:checked) .nav-links { display: flex; }
}
```

Wait — `:checked` requires a real input. The classic CSS-only hamburger uses a hidden checkbox:

```html
<nav class="navbar">
  <a class="brand" href="/">Logo</a>
  <input type="checkbox" id="nav-toggle" class="nav-toggle">
  <label for="nav-toggle" class="hamburger" aria-label="Menu">☰</label>
  <ul class="nav-links">...</ul>
</nav>
```

```css
.nav-toggle, .hamburger { display: none; }

@media (max-width: 640px) {
  .hamburger { display: block; cursor: pointer; }
  .nav-links { display: none; }
  .nav-toggle:checked ~ .nav-links { display: flex; flex-direction: column; }
}
```

Pure CSS responsive nav. JavaScript is optional.

---

## Vertical Sidebar Nav

Same pattern, different `flex-direction`:

```css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  width: 240px;
  background: #f9fafb;
  height: 100dvh;
}
.sidebar a {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}
.sidebar a:hover { background: #eef2ff; }
```

---

## A Full Example

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem clamp(1rem, 4vw, 2rem);
  background: rgb(255 255 255 / 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e5e7eb;
}

.brand { font-weight: 700; text-decoration: none; color: #111; }

.nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  display: block;
  padding: 0.5rem 0.875rem;
  text-decoration: none;
  color: #374151;
  border-radius: 6px;
  transition: background 0.15s;
}

.nav-links a:hover { background: #f3f4f6; }

.nav-links a[aria-current="page"] {
  background: #eef2ff;
  color: #4338ca;
}
```

---

## Up Next

Navigation done. Many nav bars need **dropdowns** — let's build them next.
