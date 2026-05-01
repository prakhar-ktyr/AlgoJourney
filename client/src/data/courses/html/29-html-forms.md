---
title: HTML Forms
---

# HTML Forms

Forms are how users **interact** with websites — logging in, signing up, searching, submitting data, and more. The `<form>` element collects user input and sends it to a server.

---

## Basic Form Structure

```html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">

    <label for="email">Email:</label>
    <input type="email" id="email" name="email">

    <button type="submit">Submit</button>
</form>
```

---

## The `<form>` Element

The `<form>` tag wraps all form controls. Key attributes:

| Attribute | Description |
|-----------|-------------|
| `action` | URL where form data is sent |
| `method` | HTTP method: `GET` or `POST` |
| `enctype` | Encoding type for form data |
| `autocomplete` | Enable/disable browser autocomplete |

---

## GET vs POST

| Feature | GET | POST |
|---------|-----|------|
| Data location | URL query string | Request body |
| Visibility | Visible in URL | Hidden from URL |
| Length limit | ~2048 characters | No practical limit |
| Caching | Can be cached/bookmarked | Not cached |
| Best for | Search, filters, non-sensitive data | Login, registration, file uploads |

```html
<!-- GET: data appears in URL -->
<form action="/search" method="GET">
    <input type="text" name="q">
    <button type="submit">Search</button>
</form>
<!-- Result: /search?q=html+tutorial -->

<!-- POST: data in request body -->
<form action="/login" method="POST">
    <input type="text" name="username">
    <input type="password" name="password">
    <button type="submit">Login</button>
</form>
```

> [!WARNING]
> Never use GET for sensitive data like passwords. The data appears in the URL and browser history.

---

## The `name` Attribute

The `name` attribute is **essential** — it identifies the data when submitted:

```html
<input type="text" name="username">
<input type="email" name="user_email">
```

Without `name`, the input's value will **not be included** in the form submission.

---

## Labels

Always use `<label>` with form controls. Labels improve accessibility and usability:

```html
<!-- Method 1: Using "for" and "id" -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">

<!-- Method 2: Wrapping the input -->
<label>
    Email:
    <input type="email" name="email">
</label>
```

> [!IMPORTANT]
> Labels are critical for accessibility. Screen readers read the label text, and clicking a label focuses its associated input — making forms easier to use on all devices.

---

## Form Submission

Forms can be submitted in several ways:

```html
<!-- Submit button -->
<button type="submit">Submit</button>

<!-- Input submit -->
<input type="submit" value="Submit">

<!-- Reset button (clears all fields) -->
<button type="reset">Reset</button>

<!-- Regular button (no form action) -->
<button type="button">Click Me</button>
```

---

## Complete Example

```html
<form action="/register" method="POST" autocomplete="on">
    <div>
        <label for="fullname">Full Name:</label>
        <input type="text" id="fullname" name="fullname" required>
    </div>

    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
    </div>

    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required minlength="8">
    </div>

    <div>
        <label for="bio">Bio:</label>
        <textarea id="bio" name="bio" rows="4" cols="50" placeholder="Tell us about yourself..."></textarea>
    </div>

    <button type="submit">Register</button>
    <button type="reset">Clear</button>
</form>
```

---

## Summary

- The **`<form>`** element collects and submits user input
- Use **`action`** to set the destination URL, **`method`** for GET or POST
- Every input needs a **`name`** attribute to be included in submission
- Always use **`<label>`** elements for accessibility
- Use **POST** for sensitive data; **GET** for search and filters
