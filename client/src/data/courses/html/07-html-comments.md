---
title: HTML Comments
---

# HTML Comments

HTML comments are used to add **notes and explanations** to your code. Comments are **not displayed** in the browser — they are invisible to users and only visible in the source code.

---

## Comment Syntax

HTML comments start with `<!--` and end with `-->`:

```html
<!-- This is a comment -->
<p>This paragraph is visible.</p>
```

The browser will display the paragraph but completely ignore the comment.

---

## Single-Line Comments

For short notes, write the comment on a single line:

```html
<!-- Navigation bar -->
<nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
</nav>

<!-- Main content area -->
<main>
    <h1>Welcome</h1>
</main>
```

---

## Multi-Line Comments

For longer explanations, comments can span multiple lines:

```html
<!--
    This section displays the user profile.
    It includes the avatar, name, and bio.
    Last updated: January 2025
-->
<div class="profile">
    <img src="avatar.jpg" alt="User avatar">
    <h2>Jane Doe</h2>
    <p>Web developer and HTML enthusiast.</p>
</div>
```

---

## Using Comments to Hide Content

Comments are a great way to **temporarily hide** HTML content without deleting it. This is useful during development and debugging:

```html
<h1>My Website</h1>

<!-- <p>This paragraph is hidden for now.</p> -->

<p>This paragraph is visible.</p>

<!--
<div class="sidebar">
    <h3>Sidebar</h3>
    <p>This entire section is commented out.</p>
</div>
-->
```

> [!TIP]
> Most code editors have a keyboard shortcut to comment/uncomment selected lines. In VS Code, use **Ctrl + /** (Windows/Linux) or **Cmd + /** (Mac).

---

## Comments for Documentation

Use comments to document the structure of your HTML, especially in large files:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website</title>
</head>
<body>
    <!-- ========== HEADER ========== -->
    <header>
        <h1>My Website</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
        </nav>
    </header>

    <!-- ========== MAIN CONTENT ========== -->
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Article content goes here.</p>
        </article>
    </main>

    <!-- ========== FOOTER ========== -->
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
</body>
</html>
```

---

## Comments for TODO Notes

Developers often use comments to mark areas that need future work:

```html
<!-- TODO: Add search bar here -->
<nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
</nav>

<!-- FIXME: Image path is broken on production -->
<img src="images/hero.jpg" alt="Hero banner">

<!-- HACK: Temporary workaround for alignment issue -->
<div style="margin-top: -10px;">
    <p>Content</p>
</div>
```

---

## Important Rules for Comments

### 1. Comments cannot be nested

```html
<!-- This is <!-- NOT --> allowed -->
```

The browser will stop reading the comment at the first `-->` it finds, which can break your page.

### 2. Comments should not contain sensitive information

```html
<!-- BAD: Never put passwords or API keys in comments! -->
<!-- Database password: secret123 -->

<!-- GOOD: Reference where to find configuration -->
<!-- See .env file for database configuration -->
```

> [!WARNING]
> Anyone can view your HTML comments by opening "View Source" in their browser. **Never include passwords, API keys, or private data** in HTML comments.

### 3. Don't over-comment obvious code

```html
<!-- BAD: This comment adds no value -->
<!-- This is a paragraph -->
<p>Hello, World!</p>

<!-- GOOD: This comment explains WHY, not WHAT -->
<!-- Using a div wrapper because flexbox needs a container -->
<div class="flex-container">
    <p>Hello, World!</p>
</div>
```

---

## Conditional Comments (Legacy)

Older versions of Internet Explorer supported **conditional comments** to target specific browser versions:

```html
<!--[if IE 9]>
    <p>You are using Internet Explorer 9.</p>
<![endif]-->
```

> [!NOTE]
> Conditional comments are **no longer supported** in modern browsers. They only worked in Internet Explorer 5–9. You don't need to learn them for modern web development, but you might encounter them in legacy codebases.

---

## Summary

- Comments start with `<!--` and end with `-->`
- They are **not displayed** in the browser
- Use comments to **explain code**, **document structure**, and **temporarily hide content**
- **Never** put sensitive information in comments
- Don't nest comments — it will break your HTML
- Write comments that explain **why**, not **what**
