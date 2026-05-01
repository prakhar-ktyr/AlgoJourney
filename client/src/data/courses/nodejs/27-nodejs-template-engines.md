---
title: Node.js Template Engines
---

# Node.js Template Engines

Template engines let you generate dynamic HTML on the server. Instead of sending raw HTML strings, you write templates with placeholders that get replaced with actual data at render time.

## Why template engines?

Building HTML with string concatenation is messy and dangerous:

```javascript
// BAD — hard to read, XSS vulnerable
res.send(`<h1>Welcome, ${user.name}</h1><p>Email: ${user.email}</p>`);
```

Template engines solve this:

```html
<!-- Clean, readable, auto-escaped -->
<h1>Welcome, <%= user.name %></h1>
<p>Email: <%= user.email %></p>
```

## EJS — Embedded JavaScript

EJS is the most popular template engine for Express. Its syntax is just HTML with embedded JavaScript.

### Setup

```bash
npm install ejs
```

```javascript
import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views"); // directory for template files (default)

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home Page",
    message: "Welcome to my site!",
  });
});

app.listen(3000);
```

### views/index.ejs

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1><%= message %></h1>
  <p>The time is: <%= new Date().toLocaleString() %></p>
</body>
</html>
```

## EJS syntax

### Output (escaped) — `<%= %>`

Auto-escapes HTML to prevent XSS:

```html
<p>Hello, <%= user.name %></p>
<!-- If user.name is "<script>alert('xss')</script>" -->
<!-- Output: <p>Hello, &lt;script&gt;alert('xss')&lt;/script&gt;</p> -->
```

### Output (unescaped) — `<%- %>`

Renders raw HTML (use carefully):

```html
<%- htmlContent %>
```

### Logic — `<% %>`

Execute JavaScript without outputting:

```html
<% if (user.isAdmin) { %>
  <a href="/admin">Admin Panel</a>
<% } %>

<% if (items.length > 0) { %>
  <ul>
    <% items.forEach(item => { %>
      <li><%= item.name %> — $<%= item.price.toFixed(2) %></li>
    <% }) %>
  </ul>
<% } else { %>
  <p>No items found.</p>
<% } %>
```

### Loops

```html
<table>
  <tr><th>Name</th><th>Email</th></tr>
  <% users.forEach(user => { %>
    <tr>
      <td><%= user.name %></td>
      <td><%= user.email %></td>
    </tr>
  <% }) %>
</table>
```

## Layouts and partials

### Partials — Reusable template fragments

Create `views/partials/header.ejs`:

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
```

Create `views/partials/footer.ejs`:

```html
  <footer>
    <p>&copy; 2024 My App</p>
  </footer>
</body>
</html>
```

Use them in a page:

```html
<!-- views/index.ejs -->
<%- include("partials/header") %>

<main>
  <h1><%= message %></h1>
  <p>Welcome to our site.</p>
</main>

<%- include("partials/footer") %>
```

### Passing data to partials

```html
<%- include("partials/user-card", { user: currentUser }) %>
```

## Rendering dynamic pages

### User profile page

```javascript
app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).render("error", {
      title: "Not Found",
      message: "User not found",
    });
  }

  res.render("profile", {
    title: `${user.name}'s Profile`,
    user,
  });
});
```

```html
<!-- views/profile.ejs -->
<%- include("partials/header") %>

<main>
  <h1><%= user.name %></h1>
  <p>Email: <%= user.email %></p>
  <p>Joined: <%= user.createdAt.toLocaleDateString() %></p>

  <h2>Posts</h2>
  <% if (user.posts.length > 0) { %>
    <ul>
      <% user.posts.forEach(post => { %>
        <li><a href="/posts/<%= post.id %>"><%= post.title %></a></li>
      <% }) %>
    </ul>
  <% } else { %>
    <p>No posts yet.</p>
  <% } %>
</main>

<%- include("partials/footer") %>
```

## Other template engines

| Engine | Syntax style | npm package |
|---|---|---|
| EJS | HTML + `<%= %>` | `ejs` |
| Pug | Indentation-based (no HTML tags) | `pug` |
| Handlebars | `{{variable}}` | `express-handlebars` |
| Nunjucks | `{% %}` / `{{ }}` (like Jinja2) | `nunjucks` |

### Quick Pug example

```bash
npm install pug
```

```javascript
app.set("view engine", "pug");
```

```pug
//- views/index.pug
doctype html
html
  head
    title= title
  body
    h1= message
    if items.length
      ul
        each item in items
          li= item.name
    else
      p No items found.
```

## When to use template engines vs SPAs

| Use template engines when... | Use an SPA when... |
|---|---|
| Content is mostly static | Heavy interactivity (dashboards, editors) |
| SEO is critical | Complex client-side state |
| Simple CRUD apps | Real-time features |
| Quick prototyping | Separate frontend team |
| Email templates | Mobile app + web sharing API |

Many modern projects use SPAs (React, Vue) for the frontend and Express only as an API. Template engines are still valuable for server-rendered content, admin panels, and email templates.

## Key takeaways

- Template engines generate dynamic HTML on the server.
- EJS is the most popular — HTML with `<%= %>` for variables and `<% %>` for logic.
- `<%= %>` auto-escapes HTML (safe), `<%- %>` renders raw HTML (use carefully).
- Use `include()` for reusable partials (headers, footers, components).
- Set up with `app.set("view engine", "ejs")` and `res.render("template", data)`.
