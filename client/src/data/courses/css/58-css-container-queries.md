---
title: CSS Container Queries
---

# CSS Container Queries

Until recently, the only thing CSS could "see" was the viewport. A card placed in a wide column or a narrow sidebar had no way to react to **its own** width — only to the page's width.

**Container queries** changed that. A component can now style itself based on the size of an ancestor it's inside. This is one of the biggest CSS additions in years.

---

## Step 1: Declare a Container

```css
.sidebar, .main {
  container-type: inline-size;
}
```

`inline-size` means the container's **width** is queryable. (`size` queries both, but is rarer.)

Optionally, name it:

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* Shorthand */
.sidebar { container: sidebar / inline-size; }
```

---

## Step 2: Query the Container

```css
.card {
  display: grid;
  gap: 1rem;
}

@container (min-width: 400px) {
  .card { grid-template-columns: 1fr 2fr; }
}

@container (min-width: 600px) {
  .card { grid-template-columns: 1fr 3fr; }
}
```

The same `.card` placed in a 200px sidebar stays a single column. Placed in a 800px main area, it goes side-by-side. **Without a single line of JavaScript** and **without knowing where it'll be used.**

---

## Querying a Named Container

```css
@container sidebar (min-width: 300px) {
  .card { ... }
}
```

This skips any other ancestor containers and targets the one named `sidebar`.

---

## Container Query Units

Like `vw`/`vh` are relative to the viewport, **`cqw`**/`cqh`/`cqi`/`cqb` are relative to the container:

```css
.card .title {
  font-size: clamp(1rem, 5cqi, 1.5rem);
  /* "5% of the container's inline size" */
}
```

Truly intrinsic component design.

---

## A Practical Example

```html
<aside class="sidebar">
  <article class="card">...</article>
</aside>

<main class="main">
  <article class="card">...</article>
</main>
```

```css
.sidebar, .main { container-type: inline-size; }

.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: white;
}

@container (min-width: 480px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

The same component, placed twice — and each instance lays itself out based on its actual available width. Drop it in a sidebar: stacks. Drop it in main: side-by-side.

---

## Style Queries (Newer)

Beyond size, you can soon query a container's *styles*:

```css
.card {
  container-name: card;
}

@container card style(--theme: dark) {
  .button { background: white; color: black; }
}
```

Browser support is still arriving — useful when widely available.

---

## Comparing With Media Queries

| Media Query | Container Query |
|-------------|-----------------|
| Reacts to **viewport** | Reacts to **ancestor element** |
| Page-level layouts | Component-level layouts |
| One per page | Many independent ones |
| Cannot be reused without context | Truly portable components |

You'll still use media queries for things like dark mode, print, and reduced motion. For **layout responsiveness inside reusable components**, container queries win.

---

## A Note on Performance

Setting `container-type: inline-size` on an element makes it a **containment** boundary — the browser optimizes layout calculations within it. There's a tiny cost, but it can also speed things up. Don't worry about it for normal use.

---

## Up Next

We can adapt by viewport and by container. Now let's tame **how images fit** their containers — `object-fit` and `object-position`.
