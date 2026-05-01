---
title: HTML Form Elements
---

# HTML Form Elements

HTML provides a variety of form elements for collecting different types of user input.

---

## `<input>` — The Most Versatile Element

The `<input>` element changes behavior based on its `type` attribute:

```html
<input type="text" name="username" placeholder="Enter username">
<input type="password" name="password" placeholder="Enter password">
<input type="email" name="email" placeholder="Enter email">
```

We'll cover all input types in detail in the next lesson.

---

## `<label>` — Descriptive Labels

```html
<label for="username">Username:</label>
<input type="text" id="username" name="username">
```

Always pair labels with inputs using matching `for`/`id` attributes.

---

## `<textarea>` — Multi-Line Text

For longer text input (comments, descriptions, bios):

```html
<label for="message">Message:</label>
<textarea id="message" name="message" rows="5" cols="40" placeholder="Type your message..."></textarea>
```

| Attribute | Description |
|-----------|-------------|
| `rows` | Visible height (number of text lines) |
| `cols` | Visible width (number of characters) |
| `placeholder` | Hint text |
| `maxlength` | Maximum character count |

> [!TIP]
> Use CSS `resize: none;` to prevent resizing, or `resize: vertical;` to allow only vertical resizing.

---

## `<select>` — Dropdown Menu

```html
<label for="country">Country:</label>
<select id="country" name="country">
    <option value="">-- Select a country --</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
    <option value="in">India</option>
</select>
```

### Pre-selected Option

```html
<option value="us" selected>United States</option>
```

---

## `<button>` — Clickable Buttons

```html
<button type="submit">Submit Form</button>
<button type="reset">Reset Form</button>
<button type="button" onclick="alert('Hello!')">Click Me</button>
```

| Type | Behavior |
|------|----------|
| `submit` | Submits the form (default inside a form) |
| `reset` | Clears all form fields |
| `button` | No default behavior — use with JavaScript |

---

## `<fieldset>` and `<legend>` — Grouping Controls

Group related form controls together:

```html
<form>
    <fieldset>
        <legend>Personal Information</legend>
        <label for="fname">First Name:</label>
        <input type="text" id="fname" name="fname">
        <label for="lname">Last Name:</label>
        <input type="text" id="lname" name="lname">
    </fieldset>

    <fieldset>
        <legend>Account Details</legend>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email">
        <label for="pass">Password:</label>
        <input type="password" id="pass" name="pass">
    </fieldset>

    <button type="submit">Register</button>
</form>
```

The `<fieldset>` draws a box around the group, and `<legend>` provides a title for the group.

---

## `<datalist>` — Autocomplete Suggestions

Provide a predefined list of suggestions for an input:

```html
<label for="browser">Favorite Browser:</label>
<input list="browsers" id="browser" name="browser">

<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
    <option value="Opera">
</datalist>
```

The user can type freely or select from the suggestions.

---

## `<output>` — Calculation Results

Display the result of a calculation:

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
    <input type="number" id="a" name="a" value="10"> +
    <input type="number" id="b" name="b" value="20"> =
    <output name="result" for="a b">30</output>
</form>
```

---

## All Form Elements Summary

| Element | Purpose |
|---------|---------|
| `<form>` | Form container |
| `<input>` | Single-line input (many types) |
| `<textarea>` | Multi-line text input |
| `<select>` / `<option>` | Dropdown menu |
| `<button>` | Clickable button |
| `<label>` | Input label (accessibility) |
| `<fieldset>` / `<legend>` | Group related controls |
| `<datalist>` | Autocomplete suggestions |
| `<output>` | Calculation output |
