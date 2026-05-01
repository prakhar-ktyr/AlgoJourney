---
title: HTML Template & Slot
---

# HTML Template & Slot

The `<template>` and `<slot>` elements are building blocks for **reusable, dynamic content** and **Web Components**.

---

## `<template>` — Reusable HTML Fragments

The `<template>` element holds HTML that is **not rendered** when the page loads. It's a blueprint that can be cloned and inserted via JavaScript:

```html
<template id="card-template">
    <div class="card">
        <h3 class="card-title"></h3>
        <p class="card-body"></p>
    </div>
</template>

<div id="container"></div>

<script>
    const template = document.getElementById("card-template");
    const container = document.getElementById("container");

    const data = [
        { title: "HTML", body: "The structure of the web." },
        { title: "CSS", body: "The style of the web." },
        { title: "JavaScript", body: "The behavior of the web." }
    ];

    data.forEach(item => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".card-title").textContent = item.title;
        clone.querySelector(".card-body").textContent = item.body;
        container.appendChild(clone);
    });
</script>
```

### Key Points

- Content inside `<template>` is **parsed but not rendered**
- Images inside don't load, scripts don't execute
- Use `template.content.cloneNode(true)` to create a copy
- Perfect for repeated structures (cards, list items, table rows)

---

## Web Components Overview

Web Components let you create **custom, reusable HTML elements**:

```html
<user-card name="Alice" role="Developer"></user-card>
```

They combine three technologies:
1. **Custom Elements** — Define new HTML tags
2. **Shadow DOM** — Encapsulated styles and markup
3. **Templates & Slots** — Reusable content patterns

---

## Creating a Custom Element

```html
<script>
    class UserCard extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: "open" });

            shadow.innerHTML = `
                <style>
                    .card {
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 16px;
                        max-width: 250px;
                        font-family: sans-serif;
                    }
                    h3 { margin: 0 0 8px; color: #1e293b; }
                    p { margin: 0; color: #64748b; }
                </style>
                <div class="card">
                    <h3>${this.getAttribute("name")}</h3>
                    <p>${this.getAttribute("role")}</p>
                </div>
            `;
        }
    }

    customElements.define("user-card", UserCard);
</script>

<user-card name="Alice" role="Senior Developer"></user-card>
<user-card name="Bob" role="Designer"></user-card>
```

---

## `<slot>` — Content Projection

Slots let users inject **custom content** into a Web Component:

```html
<script>
    class InfoBox extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: "open" });
            shadow.innerHTML = `
                <style>
                    .box {
                        border: 2px solid #4f46e5;
                        border-radius: 8px;
                        padding: 16px;
                    }
                </style>
                <div class="box">
                    <h3><slot name="title">Default Title</slot></h3>
                    <p><slot>Default content</slot></p>
                </div>
            `;
        }
    }
    customElements.define("info-box", InfoBox);
</script>

<info-box>
    <span slot="title">Custom Title</span>
    This is custom body content.
</info-box>
```

### Named Slots

```html
<!-- Component definition uses named slots -->
<slot name="header">Default Header</slot>
<slot name="footer">Default Footer</slot>
<slot>Default content (unnamed slot)</slot>

<!-- Usage: assign content to slots -->
<my-component>
    <h2 slot="header">My Header</h2>
    <p>This goes in the unnamed slot.</p>
    <p slot="footer">My Footer</p>
</my-component>
```

---

## Summary

- **`<template>`** holds reusable HTML that's not rendered until cloned with JavaScript
- **Web Components** create custom, encapsulated HTML elements
- **Shadow DOM** provides style encapsulation
- **`<slot>`** enables content projection — users inject content into components
- Web Components work natively in all modern browsers
