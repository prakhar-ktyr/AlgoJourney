---
title: HTML Description Lists
---

# HTML Description Lists

A description list defines a list of **terms** and their **descriptions**. It's perfect for glossaries, FAQs, and metadata.

---

## Syntax

A description list uses three elements:

- **`<dl>`** — The description list container
- **`<dt>`** — A term/name
- **`<dd>`** — The description/definition

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language — the standard language for creating web pages.</dd>

    <dt>CSS</dt>
    <dd>Cascading Style Sheets — controls the visual presentation of web pages.</dd>

    <dt>JavaScript</dt>
    <dd>A programming language that adds interactivity to web pages.</dd>
</dl>
```

---

## Multiple Descriptions

A term can have **multiple descriptions**:

```html
<dl>
    <dt>Python</dt>
    <dd>A general-purpose programming language.</dd>
    <dd>Named after Monty Python, not the snake.</dd>
</dl>
```

## Multiple Terms for One Description

Multiple terms can share **one description**:

```html
<dl>
    <dt>HTML</dt>
    <dt>HyperText Markup Language</dt>
    <dd>The standard markup language for documents designed to be displayed in a web browser.</dd>
</dl>
```

---

## Practical Use Cases

### Glossary

```html
<h2>Glossary</h2>
<dl>
    <dt>API</dt>
    <dd>Application Programming Interface — a set of rules for building software.</dd>

    <dt>DOM</dt>
    <dd>Document Object Model — a tree representation of an HTML document.</dd>

    <dt>SEO</dt>
    <dd>Search Engine Optimization — improving visibility in search results.</dd>
</dl>
```

### FAQ Section

```html
<h2>Frequently Asked Questions</h2>
<dl>
    <dt>How long does shipping take?</dt>
    <dd>Standard shipping takes 5-7 business days. Express shipping takes 1-2 business days.</dd>

    <dt>Do you offer refunds?</dt>
    <dd>Yes, we offer full refunds within 30 days of purchase.</dd>
</dl>
```

### Contact Information

```html
<dl>
    <dt>Email</dt>
    <dd><a href="mailto:hello@example.com">hello@example.com</a></dd>

    <dt>Phone</dt>
    <dd><a href="tel:+1234567890">+1 (234) 567-890</a></dd>

    <dt>Address</dt>
    <dd>123 Main Street, Springfield, IL 62704</dd>
</dl>
```

---

## Styling Description Lists

```html
<style>
    dl {
        max-width: 600px;
    }
    dt {
        font-weight: bold;
        color: #1a1a2e;
        margin-top: 1rem;
    }
    dd {
        margin-left: 0;
        padding-left: 1rem;
        border-left: 3px solid #4f46e5;
        color: #555;
    }
</style>
```

---

## Summary

| Element | Purpose |
|---------|---------|
| `<dl>` | Description list container |
| `<dt>` | Term/name |
| `<dd>` | Description/definition |

- Use for **glossaries**, **FAQs**, **metadata**, and **key-value pairs**
- A term can have **multiple descriptions** and vice versa
- Style with CSS for better visual presentation
