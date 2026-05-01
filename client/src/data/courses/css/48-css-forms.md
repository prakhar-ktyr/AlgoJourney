---
title: CSS Forms
---

# CSS Forms

Forms used to be the worst part of CSS. Every browser rendered inputs differently, and styling them was a hack-fest. **Modern CSS** has changed that — with `accent-color`, `:focus-visible`, `:user-invalid`, and consistent box-sizing, forms are pleasant again.

---

## Reset First

Browser defaults are wildly inconsistent. A small reset:

```css
input, textarea, select, button {
  font: inherit;          /* match surrounding text */
  color: inherit;
  box-sizing: border-box;
}
```

This single block removes the most common headaches.

---

## A Clean Text Input

```css
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:hover { border-color: #9ca3af; }

.input:focus-visible {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.2);
}

.input::placeholder { color: #9ca3af; }
```

A polished input — accessible focus, hover affordance, soft shadow ring.

---

## Validation States

```css
.input:user-invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.2);
}

.input:user-valid {
  border-color: #16a34a;
}
```

`:user-invalid` only triggers **after the user has interacted** — no "this field is required" red border on initial page load.

---

## Labels and Layout

```html
<label class="field">
  <span class="field-label">Email</span>
  <input class="input" type="email" required>
</label>
```

```css
.field {
  display: grid;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
```

Wrapping the input in a `<label>` connects them automatically — no `for`/`id` needed (though it doesn't hurt to add for screen reader compatibility).

---

## Required Indicator

```css
.field:has(input:required) .field-label::after {
  content: " *";
  color: #dc2626;
}
```

`:has()` lets the parent's label add the asterisk based on the input's `required` attribute. Pure CSS, no per-field markup.

---

## Checkboxes and Radios

These used to be a styling nightmare. Today, **`accent-color`** is your friend:

```css
input[type="checkbox"],
input[type="radio"] {
  accent-color: #2563eb;
  width: 1rem;
  height: 1rem;
}
```

That's it — branded checkboxes that match your design system, with **no custom rendering** required. Native, accessible, and platform-correct.

For full custom rendering, the trick is to hide the input visually and style its label:

```css
.toggle input { position: absolute; opacity: 0; }
.toggle .control { /* draw your custom checkbox */ }
.toggle input:checked + .control { /* checked state */ }
.toggle input:focus-visible + .control { /* focus ring */ }
```

---

## Selects

```css
select {
  appearance: none;
  background:
    url("data:image/svg+xml,<svg ...>...</svg>") no-repeat right 0.5rem center / 16px;
  padding-right: 2rem;
}
```

`appearance: none` strips the native dropdown arrow so you can paint your own. Required for cross-browser consistency.

---

## Textareas

```css
textarea {
  resize: vertical;          /* allow vertical resize only */
  min-height: 6rem;
  font-family: inherit;
}
```

`resize: vertical` is the most common — horizontal resize usually breaks layouts.

---

## File Inputs

The `::file-selector-button` pseudo-element finally lets you style the "Choose file" button:

```css
input[type="file"]::file-selector-button {
  margin-right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: #2563eb;
  color: white;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
```

---

## Disabled State

```css
.input:disabled,
button:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
```

---

## Form Layout

Use Grid or Flexbox for clean forms:

```css
.form {
  display: grid;
  gap: 1rem;
  max-width: 400px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
```

Two-column layouts on desktop, single column on mobile (with a media query).

---

## Help Text and Errors

```css
.field-help {
  font-size: 0.75rem;
  color: #6b7280;
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
  display: none;
}

.field:has(input:user-invalid) .field-error { display: block; }
.field:has(input:user-invalid) .field-help  { display: none;  }
```

`:has()` again — error messages appear automatically without JavaScript.

---

## Accessibility Reminders

- Always use `<label>` (visible, not just `aria-label`) when possible.
- Don't remove focus rings.
- Color is not the only validation indicator — pair with text.
- Touch targets ≥ 44px.
- `autocomplete="..."` attributes on every common field — huge UX win.

---

## Up Next

We've covered our most important UI pieces. Now let's build a **navigation bar**.
