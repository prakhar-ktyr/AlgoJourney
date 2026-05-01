---
title: CSS Pseudo-Classes
---

# CSS Pseudo-Classes

A **pseudo-class** is a keyword added to a selector that targets a specific *state* or *position* of an element — like "is being hovered" or "is the third child." They start with a single colon `:`.

---

## Interaction States

```css
a:hover     { color: tomato; }       /* mouse is over */
a:focus     { outline: 2px solid; }  /* keyboard or click focused */
a:active    { color: red; }          /* being pressed */
a:visited   { color: purple; }       /* already visited */
a:focus-visible { outline: 2px solid; }   /* focused via keyboard only */
a:focus-within  { outline: 2px solid; }   /* focus is on this OR a descendant */
```

`:focus-visible` and `:focus-within` are modern and incredibly useful. We saw them in the links lesson.

---

## Form States

```css
input:disabled  { opacity: 0.5; }
input:enabled   { ... }
input:checked   { accent-color: blue; }
input:required  { border-color: red; }
input:optional  { ... }
input:read-only { background: #f5f5f5; }

input:valid     { border-color: green; }
input:invalid   { border-color: red; }
input:user-invalid { border-color: red; }   /* only after the user has interacted */
input:placeholder-shown { color: gray; }
input:in-range, :out-of-range { ... }
```

`:user-invalid` is great — it avoids the unhelpful "this field is invalid" red border *before* the user has even started typing.

---

## Structural Pseudo-Classes

These target an element based on its position in the DOM:

```css
li:first-child      { ... }
li:last-child       { ... }
li:only-child       { ... }
li:nth-child(2)     { ... }     /* the 2nd item */
li:nth-child(odd)   { ... }     /* 1st, 3rd, 5th... */
li:nth-child(even)  { ... }
li:nth-child(3n)    { ... }     /* every 3rd */
li:nth-child(3n+1)  { ... }     /* the 1st, 4th, 7th... */
li:nth-last-child(2){ ... }     /* 2nd from the end */
```

The `:nth-of-type` family is the same but counts only siblings of the same tag:

```css
p:first-of-type { ... }
img:nth-of-type(odd) { ... }
```

### A practical example — alternating row stripes:

```css
tbody tr:nth-child(odd) {
  background: #f9fafb;
}
```

---

## `:not()`

Match elements that **don't** match a selector:

```css
button:not(.primary) { background: gray; }
li:not(:last-child)  { border-bottom: 1px solid #eee; }
```

Modern `:not()` accepts complex selectors:

```css
:not(h1, h2, h3) { ... }   /* not any heading */
```

---

## `:is()` and `:where()`

Group selectors more concisely:

```css
:is(h1, h2, h3) a { color: inherit; }
/* same as: h1 a, h2 a, h3 a */
```

`:where()` is identical to `:is()` but **has zero specificity** — perfect for resets and base styles you want easily overridable:

```css
:where(ul, ol) { padding-left: 1.5rem; }
```

---

## `:has()` — The Game Changer

`:has()` lets a parent style itself based on its children. This was impossible in CSS until 2023:

```css
.card:has(img) { padding: 0; }                /* card containing an image */

label:has(input:checked) { background: blue; } /* label of a checked checkbox */

article:has(> h2) { border-top: 4px solid; }   /* articles with an h2 child */

form:has(input:invalid) button { opacity: 0.5; } /* disable submit when invalid */
```

This single feature has eliminated mountains of JavaScript across the web. Use it.

---

## Other Useful Ones

```css
:root            /* the html element — typical home for CSS variables */
:empty           /* element with no children, no text */
:target          /* element matching the URL fragment (#id) */
:lang(en)        /* element in English */
:dir(rtl)        /* in right-to-left context */
:placeholder-shown
:default         /* default form button or option */
:fullscreen      /* element in fullscreen mode */
```

---

## Combining Pseudo-Classes

Stack them — they all must apply:

```css
button:not(:disabled):hover {
  background: blue;
}

input[type="email"]:focus:invalid {
  border-color: red;
}
```

---

## Up Next

Pseudo-classes target *states*. **Pseudo-elements** target *parts* of an element — that's what we cover next.
