---
title: HTML Form Validation
---

# HTML Form Validation

HTML5 provides **built-in form validation** — no JavaScript required. The browser checks inputs before submission and shows error messages automatically.

---

## The `required` Attribute

The simplest validation — the field must not be empty:

```html
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    <button type="submit">Submit</button>
</form>
```

If the user tries to submit with an empty required field, the browser shows a built-in error message.

---

## Type-Based Validation

Certain input types have built-in format validation:

```html
<!-- Must be a valid email format -->
<input type="email" name="email" required>

<!-- Must be a valid URL -->
<input type="url" name="website" required>

<!-- Must be a number -->
<input type="number" name="age" required>
```

---

## `min` and `max` Validation

For numbers and dates:

```html
<input type="number" name="age" min="18" max="120" required>
<input type="date" name="birthday" min="1900-01-01" max="2010-12-31" required>
```

---

## `minlength` and `maxlength`

For text length constraints:

```html
<input type="text" name="username" minlength="3" maxlength="20" required>
<textarea name="bio" minlength="10" maxlength="500"></textarea>
```

---

## `pattern` — Regular Expression Validation

Validate against a custom pattern:

```html
<!-- Letters only, 2-30 characters -->
<input type="text" name="name" pattern="[A-Za-z\s]{2,30}"
       title="Only letters and spaces, 2-30 characters" required>

<!-- Password: at least 8 chars, one uppercase, one number -->
<input type="password" name="password"
       pattern="(?=.*[A-Z])(?=.*\d).{8,}"
       title="At least 8 characters, one uppercase letter, and one number" required>

<!-- US ZIP code -->
<input type="text" name="zip" pattern="\d{5}(-\d{4})?"
       title="5-digit ZIP or ZIP+4 format" required>
```

---

## CSS Pseudo-Classes for Validation

Style inputs based on their validation state:

```html
<style>
    input:valid {
        border: 2px solid #22c55e;
    }
    input:invalid {
        border: 2px solid #ef4444;
    }
    input:focus:invalid {
        outline: none;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
    }
    input:required {
        border-left: 4px solid #f59e0b;
    }
</style>
```

| Pseudo-Class | When Applied |
|-------------|-------------|
| `:valid` | Input value passes all validation |
| `:invalid` | Input value fails validation |
| `:required` | Input has the `required` attribute |
| `:optional` | Input does NOT have `required` |
| `:in-range` | Number/date is within min-max range |
| `:out-of-range` | Number/date is outside min-max range |

---

## Custom Validation Messages

Use the `title` attribute to provide custom hints:

```html
<input type="text" name="code" pattern="[A-Z]{3}-\d{4}"
       title="Format: ABC-1234 (three uppercase letters, dash, four digits)"
       required>
```

---

## The `novalidate` Attribute

Disable validation on the entire form (useful during development):

```html
<form action="/submit" method="POST" novalidate>
    <input type="email" name="email" required>
    <button type="submit">Submit (no validation)</button>
</form>
```

The `formnovalidate` attribute can disable validation on a specific submit button:

```html
<button type="submit">Submit (validated)</button>
<button type="submit" formnovalidate>Save Draft (no validation)</button>
```

---

## Complete Validation Example

```html
<style>
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 4px; font-weight: bold; }
    input { padding: 8px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px; }
    input:valid { border-color: #22c55e; }
    input:focus:invalid { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2); }
</style>

<form action="/register" method="POST">
    <div class="form-group">
        <label for="name">Full Name (letters only):</label>
        <input type="text" id="name" name="name" pattern="[A-Za-z\s]{2,50}"
               title="2-50 letters only" required>
    </div>

    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
    </div>

    <div class="form-group">
        <label for="age">Age (18-120):</label>
        <input type="number" id="age" name="age" min="18" max="120" required>
    </div>

    <div class="form-group">
        <label for="password">Password (8+ chars, 1 uppercase, 1 number):</label>
        <input type="password" id="password" name="password"
               pattern="(?=.*[A-Z])(?=.*\d).{8,}"
               title="At least 8 characters with one uppercase letter and one number" required>
    </div>

    <button type="submit">Register</button>
    <button type="submit" formnovalidate>Save Draft</button>
</form>
```

---

## Summary

- HTML5 validation works **without JavaScript** using attributes
- **`required`** — field must not be empty
- **`min`/`max`** — numeric and date range limits
- **`minlength`/`maxlength`** — text length limits
- **`pattern`** — custom regex validation
- Style with **`:valid`** and **`:invalid`** CSS pseudo-classes
- Use **`novalidate`** to disable validation during development
