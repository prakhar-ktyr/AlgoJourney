---
title: HTML Get Started
---

# HTML Get Started

To start writing HTML, all you need is a **text editor** and a **web browser**. Let's set up your environment and create your first web page.

---

## Step 1: Choose a Text Editor

You can write HTML in any text editor, but we recommend **Visual Studio Code** (VS Code) because it's free, powerful, and has great HTML support built in.

Other popular options:
- **Sublime Text** — Lightweight and fast
- **Atom** — Open source and customizable
- **Notepad++** — Simple and beginner-friendly (Windows)
- **TextEdit** — Built into macOS (switch to plain text mode first)

> [!TIP]
> In VS Code, install the **Live Server** extension. It automatically refreshes your browser whenever you save your HTML file — a huge time-saver!

---

## Step 2: Create Your First HTML File

1. Open your text editor.
2. Create a new file.
3. Save it as **`index.html`** (the `.html` extension is important!).
4. Type the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>I just created my first web page!</p>
</body>
</html>
```

5. Save the file.

---

## Step 3: Open It in Your Browser

You have two options:

### Option A: Double-click the file
Navigate to where you saved `index.html` and double-click it. It will open in your default web browser.

### Option B: Use Live Server (recommended)
If you're using VS Code with the Live Server extension:
1. Right-click inside your HTML file.
2. Select **"Open with Live Server"**.
3. Your browser will open and auto-refresh on every save.

You should see a page with a large "Hello, World!" heading and a paragraph below it.

---

## Step 4: Make Changes and Refresh

Try changing the content:

```html
<body>
    <h1>Welcome to My Website</h1>
    <p>My name is Alex and I'm learning HTML.</p>
    <p>This is my second paragraph.</p>
</body>
```

Save the file and refresh your browser (or let Live Server do it automatically). You'll see your changes instantly!

---

## Why is the file named `index.html`?

By convention, `index.html` is the **default file** that web servers look for when someone visits a website. When you go to `https://example.com/`, the server automatically serves `index.html`.

You can name your HTML files anything you want (like `about.html` or `contact.html`), but your home page should always be `index.html`.

---

## File Structure Best Practices

As your project grows, organize your files like this:

```
my-website/
├── index.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/
    ├── logo.png
    └── hero.jpg
```

> [!NOTE]
> Keep your folder and file names **lowercase** and use **hyphens** instead of spaces (e.g., `my-page.html`, not `My Page.html`). This avoids issues on case-sensitive web servers.

---

## Summary

- Use a text editor like **VS Code** to write HTML
- Save your files with the **`.html`** extension
- Open them in a browser to see the result
- Use **Live Server** for automatic refresh during development
- Name your home page **`index.html`**

You're all set up! In the next lesson, we'll explore basic HTML examples in more detail.
