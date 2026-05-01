---
title: HTML Input Attributes
---

# HTML Input Attributes

Input attributes control behavior, validation, and appearance of form inputs. Here are the most important ones.

---

## `value` — Default Value

```html
<input type="text" name="city" value="New York">
```

---

## `placeholder` — Hint Text

Shows gray hint text that disappears when the user starts typing:

```html
<input type="email" name="email" placeholder="you@example.com">
```

> [!NOTE]
> Placeholders are **not** a substitute for labels. Always use `<label>` for accessibility — placeholders disappear once the user starts typing.

---

## `required` — Mandatory Field

Prevents form submission if the field is empty:

```html
<input type="text" name="username" required>
```

---

## `readonly` vs `disabled`

```html
<!-- Readonly: visible, submitted, but can't be edited -->
<input type="text" name="order_id" value="ORD-12345" readonly>

<!-- Disabled: visible, grayed out, NOT submitted -->
<input type="text" name="promo" value="EXPIRED" disabled>
```

| Feature | `readonly` | `disabled` |
|---------|-----------|-----------|
| Editable | ❌ | ❌ |
| Submitted with form | ✅ Yes | ❌ No |
| Visual appearance | Normal | Grayed out |
| Focusable | ✅ Yes | ❌ No |

---

## `maxlength` and `minlength`

```html
<input type="text" name="username" minlength="3" maxlength="20" placeholder="3-20 characters">
```

---

## `min`, `max`, and `step`

For numeric and date inputs:

```html
<input type="number" name="age" min="18" max="120" step="1">
<input type="date" name="start" min="2025-01-01" max="2025-12-31">
<input type="range" name="rating" min="1" max="10" step="0.5">
```

---

## `pattern` — Regex Validation

Validate input against a regular expression:

```html
<!-- Only letters, 3-20 characters -->
<input type="text" name="username" pattern="[A-Za-z]{3,20}"
       title="3-20 letters only">

<!-- US phone format -->
<input type="tel" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
       placeholder="123-456-7890" title="Format: 123-456-7890">
```

> [!TIP]
> Always include a `title` attribute with `pattern` — it provides a hint message when validation fails.

---

## `autocomplete`

Control browser autofill behavior:

```html
<input type="email" name="email" autocomplete="email">
<input type="text" name="name" autocomplete="name">
<input type="text" name="otp" autocomplete="one-time-code">
<input type="password" name="new-password" autocomplete="new-password">
```

Common values: `name`, `email`, `tel`, `address-line1`, `postal-code`, `country`, `off`.

---

## `autofocus`

Automatically focuses the input when the page loads:

```html
<input type="text" name="search" autofocus placeholder="Start typing...">
```

Use sparingly — only one element per page should have `autofocus`.

---

## `size` — Visible Width

Sets the visible width (in characters):

```html
<input type="text" name="zip" size="5" maxlength="5">
```

---

## `multiple`

Allow multiple values (for `email` and `file` types):

```html
<input type="file" name="photos" multiple accept="image/*">
<input type="email" name="cc" multiple placeholder="email1, email2">
```

---

## `list`

Connect an input to a `<datalist>` for suggestions:

```html
<input type="text" name="color" list="colors">
<datalist id="colors">
    <option value="Red">
    <option value="Blue">
    <option value="Green">
</datalist>
```

---

## Summary

| Attribute | Purpose |
|-----------|---------|
| `value` | Default value |
| `placeholder` | Hint text |
| `required` | Field must be filled |
| `readonly` | Can't edit, but submitted |
| `disabled` | Can't edit, not submitted |
| `maxlength` / `minlength` | Character limits |
| `min` / `max` / `step` | Numeric/date limits |
| `pattern` | Regex validation |
| `autocomplete` | Browser autofill hints |
| `autofocus` | Focus on page load |
| `multiple` | Allow multiple values |
