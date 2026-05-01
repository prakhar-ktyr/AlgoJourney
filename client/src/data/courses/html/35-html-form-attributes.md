---
title: HTML Form Attributes
---

# HTML Form Attributes

Beyond `action` and `method`, forms and their elements support several attributes that control submission behavior.

---

## `formaction` — Override Action Per Button

Different submit buttons can send data to different URLs:

```html
<form action="/save" method="POST">
    <input type="text" name="data" required>
    <button type="submit">Save</button>
    <button type="submit" formaction="/save-draft">Save Draft</button>
    <button type="submit" formaction="/preview">Preview</button>
</form>
```

---

## `formmethod` — Override Method Per Button

```html
<form action="/data" method="GET">
    <input type="text" name="query">
    <button type="submit">Search (GET)</button>
    <button type="submit" formmethod="POST">Submit (POST)</button>
</form>
```

---

## `formenctype` — Override Encoding

Controls how form data is encoded when submitted:

```html
<form action="/upload" method="POST">
    <input type="file" name="photo">
    <button type="submit" formenctype="multipart/form-data">Upload</button>
</form>
```

| Encoding | Use Case |
|----------|----------|
| `application/x-www-form-urlencoded` | Default — text data |
| `multipart/form-data` | File uploads |
| `text/plain` | Plain text (rarely used) |

> [!IMPORTANT]
> You **must** use `enctype="multipart/form-data"` when your form includes file uploads (`<input type="file">`).

---

## `formtarget` — Override Target

```html
<form action="/result" method="GET">
    <input type="text" name="q">
    <button type="submit">Search</button>
    <button type="submit" formtarget="_blank">Search in New Tab</button>
</form>
```

---

## `formnovalidate` — Skip Validation

```html
<form action="/submit" method="POST">
    <input type="email" name="email" required>
    <button type="submit">Submit</button>
    <button type="submit" formnovalidate>Save Draft</button>
</form>
```

---

## `autocomplete` — Browser Autofill

```html
<!-- Enable autofill for the entire form -->
<form autocomplete="on">
    <input type="text" name="name" autocomplete="name">
    <input type="email" name="email" autocomplete="email">
    <!-- Disable for a specific field -->
    <input type="text" name="otp" autocomplete="off">
</form>
```

---

## `accept-charset` — Character Encoding

```html
<form action="/submit" accept-charset="UTF-8">
    ...
</form>
```

---

## Per-Button Override Summary

| Button Attribute | Overrides Form's... |
|-----------------|-------------------|
| `formaction` | `action` |
| `formmethod` | `method` |
| `formenctype` | `enctype` |
| `formtarget` | `target` |
| `formnovalidate` | Validation |

---

## The `form` Attribute on Inputs

Inputs can belong to a form even if they're **outside** the `<form>` element:

```html
<form id="login-form" action="/login" method="POST">
    <input type="text" name="username">
    <button type="submit">Login</button>
</form>

<!-- This input is outside the form but still belongs to it -->
<input type="password" name="password" form="login-form">
```

---

## Summary

- **`formaction`**, **`formmethod`**, **`formenctype`**, **`formtarget`** let individual buttons override form defaults
- **`formnovalidate`** skips validation for draft/preview actions
- **`autocomplete`** controls browser autofill
- Use **`multipart/form-data`** for file uploads
- The **`form`** attribute lets inputs belong to a form they're not nested inside
