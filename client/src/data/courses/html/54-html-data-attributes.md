---
title: HTML Data Attributes
---

# HTML Data Attributes

Data attributes (`data-*`) let you store **custom data** directly on HTML elements. This data can be accessed by JavaScript and CSS without using non-standard attributes or extra DOM properties.

---

## Syntax

Data attributes start with `data-` followed by a descriptive name:

```html
<div data-user-id="42" data-role="admin" data-status="active">
    John Doe
</div>

<button data-action="delete" data-item-id="7">Delete</button>
```

---

## Accessing with JavaScript

Use the `dataset` property to read data attributes:

```html
<div id="user" data-user-id="42" data-role="admin" data-full-name="John Doe">
    User Card
</div>

<script>
    const user = document.getElementById("user");

    console.log(user.dataset.userId);   // "42"
    console.log(user.dataset.role);     // "admin"
    console.log(user.dataset.fullName); // "John Doe"

    // Set a data attribute
    user.dataset.status = "active";
    // Now the element has data-status="active"
</script>
```

> [!NOTE]
> Hyphenated attribute names become **camelCase** in JavaScript: `data-user-id` → `dataset.userId`, `data-full-name` → `dataset.fullName`.

---

## Accessing with CSS

Use attribute selectors to style elements based on data attributes:

```html
<style>
    [data-status="active"] {
        color: #16a34a;
        font-weight: bold;
    }
    [data-status="inactive"] {
        color: #9ca3af;
    }
    [data-priority="high"]::before {
        content: "🔴 ";
    }
</style>

<p data-status="active">Server 1</p>
<p data-status="inactive">Server 2</p>
<p data-priority="high">Critical bug fix</p>
```

---

## Practical Examples

### Tooltips

```html
<style>
    [data-tooltip] {
        position: relative;
        cursor: help;
        border-bottom: 1px dotted #666;
    }
    [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 0;
        background: #1e293b;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85rem;
        white-space: nowrap;
    }
</style>

<p>Hover over <span data-tooltip="HyperText Markup Language">HTML</span> to see a tooltip.</p>
```

### Event Delegation

```html
<ul id="menu">
    <li data-page="home">Home</li>
    <li data-page="about">About</li>
    <li data-page="contact">Contact</li>
</ul>

<script>
    document.getElementById("menu").addEventListener("click", (e) => {
        const page = e.target.dataset.page;
        if (page) {
            console.log("Navigate to:", page);
        }
    });
</script>
```

---

## Naming Rules

- Must start with `data-`
- Lowercase letters, numbers, hyphens, periods, and underscores only
- No uppercase letters in the attribute name

```html
<!-- GOOD -->
<div data-user-id="1" data-item-count="5"></div>

<!-- BAD -->
<div data-userId="1"></div>
<div dataId="1"></div>
```

---

## Summary

- **`data-*`** attributes store custom data on any HTML element
- Access in JavaScript via **`element.dataset`** (hyphenated names become camelCase)
- Target in CSS with **attribute selectors** `[data-name="value"]`
- Use for tooltips, event delegation, configuration, and storing metadata
- Keep attribute names **lowercase with hyphens**
