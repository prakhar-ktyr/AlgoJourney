---
title: CSS Combinators
---

# CSS Combinators

A **combinator** is a character placed *between* two selectors that describes their relationship in the DOM. They let you target elements based on where they live in the document tree.

There are four combinators:

| Combinator | Symbol | Meaning |
|------------|--------|---------|
| Descendant | (space) | Any descendant, at any depth |
| Child | `>` | Direct child only |
| Adjacent sibling | `+` | The very next sibling |
| General sibling | `~` | Any later sibling |

---

## Descendant Combinator (space)

Matches elements **anywhere inside** the first selector — children, grandchildren, deeper.

```css
article p {
  line-height: 1.7;
}
```

Targets every `<p>` inside any `<article>`, no matter how deeply nested.

```html
<article>
  <p>Direct child — matches.</p>
  <section>
    <p>Grandchild — also matches.</p>
  </section>
</article>
```

---

## Child Combinator — `>`

Matches **direct children only** — not deeper descendants.

```css
nav > ul {
  display: flex;
  gap: 1rem;
}
```

```html
<nav>
  <ul> <!-- matches: direct child of nav -->
    <li>...</li>
  </ul>
  <div>
    <ul>...</ul>  <!-- does NOT match: nested inside <div> -->
  </div>
</nav>
```

The child combinator is essential for component CSS where you want a rule to stop at one level.

---

## Adjacent Sibling Combinator — `+`

Matches an element that is **immediately preceded** by another, at the same level.

```css
h2 + p {
  margin-top: 0;
  font-size: 1.125rem;
}
```

This styles the first `<p>` that follows an `<h2>` — useful for "lead paragraphs" after a heading.

```html
<h2>Title</h2>
<p>Matches — directly after the h2.</p>
<p>Does not match — there's a <p> in between.</p>
```

---

## General Sibling Combinator — `~`

Matches **any sibling** that comes after the first selector (not just the immediate one).

```css
h2 ~ p {
  color: #555;
}
```

```html
<h2>Title</h2>
<p>Matches — after the h2.</p>
<div>...</div>
<p>Also matches — still after the h2.</p>
```

---

## Combining Combinators

Combinators can be chained for surgical targeting:

```css
/* List items inside the main navigation, with hover state */
nav.main > ul > li > a:hover {
  color: tomato;
}

/* The first paragraph after each section heading */
section > h2 + p {
  font-weight: 600;
}
```

These read left-to-right but the browser actually evaluates them right-to-left for performance.

---

## A Practical Example

A classic "media object" — image left, text right:

```html
<div class="media">
  <img src="avatar.jpg" alt="">
  <div class="media-body">
    <h3>Jane Doe</h3>
    <p>Software engineer.</p>
  </div>
</div>
```

```css
.media {
  display: flex;
  gap: 1rem;
}

.media > img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.media > .media-body > h3 {
  margin: 0;
}

.media > .media-body > h3 + p {
  margin-top: 0.25rem;
  color: #6b7280;
}
```

The `>` combinators stop the styles from leaking into nested media objects, and `+` removes the default top margin from the paragraph that immediately follows the heading.

---

## When To Use Which

| Goal | Use |
|------|-----|
| "Anything inside" | Descendant (space) |
| "Direct children only" | `>` |
| "The element right after" | `+` |
| "Any later sibling" | `~` |

Combinators are powerful but **specificity** still matters — we'll cover that next.
