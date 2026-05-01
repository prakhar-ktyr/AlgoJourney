---
title: CSS Pseudo-Elements
---

# CSS Pseudo-Elements

A **pseudo-element** styles a *specific part* of an element — the first letter of a paragraph, the marker of a list item, or a generated piece of content that doesn't exist in HTML. They use a **double colon** `::`.

---

## The Big Two: `::before` and `::after`

These insert generated content before and after an element's actual content:

```css
.required::after {
  content: " *";
  color: red;
}
```

```html
<label class="required">Name</label>
```

The `*` appears as if it were in the HTML, but it isn't — it's pure CSS.

### Required: the `content` property

`::before` and `::after` **don't render** without `content`. You can use:

```css
content: "text";
content: "";              /* empty — useful for purely decorative shapes */
content: attr(href);      /* pull from an HTML attribute */
content: counter(item);   /* CSS counters */
content: url("icon.svg"); /* an image */
content: open-quote;
content: none;
```

### A common pattern — decorative dividers

```css
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
```

A "OR" divider with horizontal lines on both sides — no extra HTML.

---

## `::first-line` and `::first-letter`

```css
p::first-line {
  font-weight: 700;
  color: #6b21a8;
}

p::first-letter {
  font-size: 3em;
  float: left;
  margin-right: 4px;
  line-height: 1;
}
```

The classic "drop cap" — large stylized first letter — is one CSS rule.

---

## `::placeholder`

Style the placeholder text inside form inputs:

```css
input::placeholder {
  color: #9ca3af;
  font-style: italic;
}
```

---

## `::selection`

Style highlighted text (when the user drags to select):

```css
::selection {
  background: #fde68a;
  color: #78350f;
}
```

A great little branding touch.

---

## `::marker`

The bullet or number on a list item:

```css
li::marker {
  color: #2563eb;
  font-weight: bold;
}

ol li::marker {
  content: counter(list-item) " — ";
}
```

---

## `::backdrop`

The full-screen layer behind a `<dialog>` or fullscreen element:

```css
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

This single line gives you the "blurred background behind a modal" effect for free.

---

## `::file-selector-button`

Style the "Choose file" button on `<input type="file">`:

```css
input[type="file"]::file-selector-button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

Finally, a way to style the file picker without JavaScript hacks.

---

## Single-Colon vs Double-Colon

For historical reasons, you'll see both `:before` (single colon) and `::before` (double colon). They mean the same thing — single-colon was CSS2, double-colon is CSS3+ and clearly distinguishes pseudo-elements from pseudo-classes. **Use double-colon** in new code.

---

## A Powerful Pattern — Tooltips Without JavaScript

```html
<button data-tip="Save your changes">Save</button>
```

```css
[data-tip] {
  position: relative;
}

[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
}
```

A complete tooltip — using nothing but a `data-` attribute and `::after`.

---

## Up Next

Pseudo-elements give us new pixels without new HTML. Now let's move to **attribute selectors** — choosing elements based on what's *in* their HTML.
