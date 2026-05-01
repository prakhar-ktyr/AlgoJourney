---
title: HTML Table Styling
---

# HTML Table Styling

Transform plain tables into polished, professional-looking data displays with CSS.

---

## Zebra Stripes

Alternate row colors improve readability:

```html
<style>
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 12px; text-align: left; }
    thead { background-color: #1e40af; color: white; }
    tbody tr:nth-child(even) { background-color: #eff6ff; }
    tbody tr:nth-child(odd) { background-color: white; }
</style>
```

The `nth-child(even)` and `nth-child(odd)` selectors target alternating rows.

---

## Hover Effects

Highlight rows on hover:

```html
<style>
    tbody tr:hover {
        background-color: #dbeafe;
        cursor: pointer;
    }
</style>
```

---

## The `<colgroup>` Element

Style entire columns without adding classes to every cell:

```html
<table>
    <colgroup>
        <col style="background-color: #f0fdf4;">
        <col>
        <col style="background-color: #fef3c7;">
    </colgroup>
    <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Salary</th>
    </tr>
    <tr>
        <td>Alice</td>
        <td>Engineer</td>
        <td>$95,000</td>
    </tr>
</table>
```

Use `span` to style multiple consecutive columns:

```html
<colgroup>
    <col span="2" style="background-color: #f0f0f0;">
    <col style="background-color: #fff7ed;">
</colgroup>
```

---

## Responsive Tables

Tables can overflow on small screens. Wrap them in a scrollable container:

```html
<style>
    .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    table {
        min-width: 600px;
    }
</style>

<div class="table-container">
    <table>
        <!-- wide table content -->
    </table>
</div>
```

---

## Complete Styled Table

```html
<style>
    .styled-table {
        border-collapse: collapse;
        width: 100%;
        font-family: 'Segoe UI', sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }
    .styled-table thead {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
    }
    .styled-table th {
        padding: 14px 16px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
    }
    .styled-table td {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
    }
    .styled-table tbody tr:hover {
        background-color: #f5f3ff;
    }
    .styled-table tbody tr:nth-child(even) {
        background-color: #fafafa;
    }
</style>

<table class="styled-table">
    <caption>Team Members</caption>
    <thead>
        <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice Johnson</td>
            <td>Senior Developer</td>
            <td>Engineering</td>
            <td>Active</td>
        </tr>
        <tr>
            <td>Bob Smith</td>
            <td>UI Designer</td>
            <td>Design</td>
            <td>Active</td>
        </tr>
        <tr>
            <td>Carol White</td>
            <td>Project Manager</td>
            <td>Operations</td>
            <td>On Leave</td>
        </tr>
    </tbody>
</table>
```

---

## Summary

- **Zebra stripes** — Use `nth-child(even/odd)` for alternating row colors
- **Hover effects** — `tr:hover` for interactive row highlighting
- **`<colgroup>`** — Style entire columns at once
- **Responsive** — Wrap tables in a scrollable container for mobile
- Combine `border-radius`, `box-shadow`, and gradients for **modern table designs**
