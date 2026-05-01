---
title: HTML Web Storage
---

# HTML Web Storage

Web Storage allows you to store data in the browser — persistent across page reloads (and even browser restarts for `localStorage`).

---

## `localStorage` vs `sessionStorage`

| Feature | `localStorage` | `sessionStorage` |
|---------|---------------|-----------------|
| Persistence | Until manually cleared | Until tab/window closes |
| Scope | Shared across all tabs (same origin) | Per tab/window |
| Size limit | ~5-10 MB | ~5-10 MB |
| Use case | User preferences, themes | Temporary form data |

---

## Basic Operations

```html
<script>
    // Store data
    localStorage.setItem("username", "Alice");
    localStorage.setItem("theme", "dark");

    // Retrieve data
    const name = localStorage.getItem("username"); // "Alice"
    const theme = localStorage.getItem("theme");   // "dark"

    // Remove a specific item
    localStorage.removeItem("theme");

    // Clear all stored data
    localStorage.clear();

    // Check number of stored items
    console.log(localStorage.length);
</script>
```

---

## Storing Objects

Web Storage only stores **strings**. Use `JSON.stringify()` and `JSON.parse()` for objects:

```html
<script>
    const user = { name: "Alice", age: 28, role: "developer" };

    // Store object
    localStorage.setItem("user", JSON.stringify(user));

    // Retrieve object
    const stored = JSON.parse(localStorage.getItem("user"));
    console.log(stored.name); // "Alice"
</script>
```

---

## Practical Example: Theme Toggle

```html
<button onclick="toggleTheme()">Toggle Theme</button>

<script>
    function toggleTheme() {
        const current = localStorage.getItem("theme") || "light";
        const next = current === "light" ? "dark" : "light";
        localStorage.setItem("theme", next);
        document.body.className = next;
    }

    // Apply saved theme on page load
    document.body.className = localStorage.getItem("theme") || "light";
</script>
```

---

## `sessionStorage` Example

```html
<script>
    // Count page views in this session
    let views = parseInt(sessionStorage.getItem("pageViews") || "0");
    views++;
    sessionStorage.setItem("pageViews", views.toString());

    console.log(`You've viewed this page ${views} time(s) this session.`);
</script>
```

---

## The `storage` Event

Listen for changes made in **other tabs**:

```html
<script>
    window.addEventListener("storage", (e) => {
        console.log(`Key: ${e.key}`);
        console.log(`Old value: ${e.oldValue}`);
        console.log(`New value: ${e.newValue}`);
    });
</script>
```

> [!NOTE]
> The `storage` event only fires in **other tabs/windows** of the same origin — not in the tab that made the change.

---

## Web Storage vs Cookies

| Feature | Web Storage | Cookies |
|---------|------------|---------|
| Size | ~5-10 MB | ~4 KB |
| Sent to server | ❌ No | ✅ Every request |
| API | Simple JS API | String manipulation |
| Expiration | Manual / session | Configurable |

---

## Summary

- **`localStorage`** persists until manually cleared — good for preferences
- **`sessionStorage`** clears when the tab closes — good for temporary data
- Only stores **strings** — use `JSON.stringify/parse` for objects
- The **`storage` event** notifies other tabs of changes
- Much larger storage than cookies (~5 MB vs ~4 KB)
