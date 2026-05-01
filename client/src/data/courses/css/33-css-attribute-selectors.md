---
title: CSS Attribute Selectors
---

# CSS Attribute Selectors

Attribute selectors target elements based on their HTML attributes — `type`, `href`, `data-*`, `aria-*`, anything. They're a powerful way to write semantic CSS that adapts to your markup.

---

## The Seven Forms

```css
[attr]              /* has the attribute, any value */
[attr="exact"]      /* value is exactly "exact" */
[attr~="word"]      /* value is a whitespace list containing "word" */
[attr|="lang"]      /* value is "lang" or starts with "lang-" */
[attr^="prefix"]    /* value starts with "prefix" */
[attr$="suffix"]    /* value ends with "suffix" */
[attr*="substr"]    /* value contains "substr" anywhere */
```

---

## Examples in Practice

### Form inputs by type

```css
input[type="email"]    { background-image: url("mail.svg"); }
input[type="password"] { letter-spacing: 0.1em; }
input[type="search"]   { border-radius: 999px; }
```

This is **the** classic use of attribute selectors — and far cleaner than littering your HTML with classes.

### Required and disabled

```css
[required] { border-left: 3px solid red; }
[disabled] { opacity: 0.5; cursor: not-allowed; }
```

### External links — `^=`

```css
a[href^="http"]::after { content: " ↗"; font-size: 0.8em; }
```

Targets all absolute URLs (which are external in a typical site).

### Files by extension — `$=`

```css
a[href$=".pdf"]::before { content: "📄 "; }
a[href$=".zip"]::before { content: "🗜 "; }
```

A no-JavaScript way to add file-type icons to download links.

### Substring match — `*=`

```css
[class*="card"] { ... }   /* any class containing "card" */
img[src*="cdn"] { filter: blur(0); }
```

---

## Case Sensitivity

By default attribute selectors are case-sensitive on values. Add `i` to make insensitive:

```css
input[type="EMAIL" i] { ... }
a[href$=".PDF" i]    { ... }
```

`s` does the opposite (case-sensitive, the default — rarely needed).

---

## Working with `data-*` Attributes

`data-*` lets you store arbitrary information on elements:

```html
<button data-state="loading">Save</button>
```

```css
button[data-state="loading"] {
  pointer-events: none;
  background-image: url("spinner.svg");
}
button[data-state="success"] { background: green; }
button[data-state="error"]   { background: red; }
```

This pattern lets JavaScript flip a `data-state` attribute and CSS handles the rest — a clean separation of concerns.

You can also pull values:

```css
button::after {
  content: attr(data-label);
}
```

---

## ARIA Attributes

ARIA attributes describe state and roles for assistive technology — and they're great selectors:

```css
[aria-expanded="true"]   { background: #eef; }
[aria-current="page"]    { font-weight: 700; color: #2563eb; }
[aria-disabled="true"]   { opacity: 0.5; cursor: not-allowed; }
[aria-busy="true"]       { animation: pulse 1s infinite; }
[role="alert"]           { padding: 1rem; background: #fee; }
```

Styling on ARIA attributes encourages you to write accessible HTML in the first place.

---

## Specificity

Attribute selectors have the **same specificity as classes** — `(0, 0, 1, 0)`. Useful when you don't want IDs leaking into your CSS.

---

## A Practical Example: Form Field Status

```css
input { border: 1px solid #d1d5db; }

input:user-invalid       { border-color: #ef4444; }
input[aria-invalid="true"] { border-color: #ef4444; }
input[aria-required="true"] + label::after {
  content: " *";
  color: #ef4444;
}
```

Combine pseudo-classes (`:user-invalid`) with attribute selectors (`[aria-invalid]`) for a robust form UI.

---

## Up Next

Selectors are fully covered. Now let's cover one small visual property — **opacity** — and then we go deep on **units** before tackling layout systems.
