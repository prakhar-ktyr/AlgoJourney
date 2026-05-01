---
title: CSS Selectors
---

# CSS Selectors

A **selector** is the part of a CSS rule that decides *which elements* the styles apply to. Selectors are the heart of CSS — mastering them is the difference between fighting the browser and gliding through it.

---

## The Five Basic Selectors

### 1. Universal Selector — `*`

Targets **every** element on the page.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

Often used in a "reset" at the top of a stylesheet. Use sparingly — it has performance implications on huge pages.

### 2. Type (Element) Selector

Targets every element of a given tag name.

```css
p { line-height: 1.6; }
h1 { color: navy; }
button { cursor: pointer; }
```

### 3. Class Selector — `.classname`

Targets every element with that class. **The most common selector you'll write.**

```html
<p class="lead">Important paragraph.</p>
<div class="card">...</div>
```

```css
.lead { font-size: 1.25rem; font-weight: 600; }
.card { padding: 1rem; }
```

An element can have **multiple classes**:

```html
<button class="btn btn-primary">Save</button>
```

```css
.btn { padding: 0.5rem 1rem; border-radius: 4px; }
.btn-primary { background: blue; color: white; }
```

### 4. ID Selector — `#idname`

Targets the **single** element with that ID.

```html
<header id="site-header">...</header>
```

```css
#site-header { background: #111; color: white; }
```

> [!WARNING]
> IDs must be **unique** per page. They also have very high specificity (more on that later), which makes them hard to override. **Prefer classes** for styling. Reserve IDs for JavaScript hooks and fragment links (`<a href="#site-header">`).

### 5. Attribute Selector — `[attr]`

Targets elements based on HTML attributes.

```css
input[type="email"] { border-color: blue; }
a[target="_blank"]::after { content: " ↗"; }
[disabled] { opacity: 0.5; }
```

We'll cover the full attribute selector syntax in a dedicated lesson.

---

## Grouping Selectors

Apply the same rule to multiple selectors with commas:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: "Inter", sans-serif;
  font-weight: 700;
}
```

This is identical to writing six separate rules — just less code.

---

## Combining Selectors

Selectors can be **chained** to narrow targets:

```css
/* p elements with the class "lead" */
p.lead { font-size: 1.25rem; }

/* button elements that are disabled AND have class "primary" */
button.primary[disabled] { opacity: 0.6; }
```

No space between the parts — that means **the same element** must match all of them.

---

## Choosing the Right Selector

A few rules of thumb that will save you hours:

- **Default to classes.** They're flexible, low-specificity, and reusable.
- **Avoid IDs in CSS.** Their high specificity creates maintenance pain.
- **Avoid the universal selector** in shipped code, except in a small reset.
- **Don't over-qualify.** `ul.menu` is rarely better than just `.menu`.
- **Name classes by purpose**, not appearance: `.alert` beats `.red-text` (so you can change the alert color later without renaming).

---

## A Quick Practical Example

```html
<article class="post">
  <h2 class="post-title">Hello World</h2>
  <p class="post-meta">Posted on Jan 1</p>
  <p>Welcome to my blog!</p>
</article>
```

```css
.post {
  max-width: 60ch;
  margin: 2rem auto;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
}

.post-title { color: #1e3a8a; }
.post-meta  { color: #6b7280; font-size: 0.875rem; }
```

Each class has one job. The HTML reads naturally. The CSS is easy to extend.

---

## Up Next

Selectors get even more expressive when you start **combining** them — descendant, child, sibling — to target elements based on their relationships in the DOM.
