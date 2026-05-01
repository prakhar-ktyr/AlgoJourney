---
title: HTML Table Headers & Footers
---

# HTML Table Headers & Footers

For well-structured tables, HTML provides semantic grouping elements: `<thead>`, `<tbody>`, and `<tfoot>`.

---

## Table Sections

```html
<table>
    <thead>
        <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Laptop</td>
            <td>$999</td>
            <td>5</td>
        </tr>
        <tr>
            <td>Mouse</td>
            <td>$29</td>
            <td>50</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2"><strong>Total Items</strong></td>
            <td><strong>55</strong></td>
        </tr>
    </tfoot>
</table>
```

| Element | Purpose |
|---------|---------|
| `<thead>` | Groups header rows |
| `<tbody>` | Groups body data rows |
| `<tfoot>` | Groups footer rows (totals, summaries) |

---

## Why Use Table Sections?

1. **Accessibility** — Screen readers can navigate between header, body, and footer sections
2. **Styling** — Apply different styles to each section easily
3. **Printing** — Browsers can repeat `<thead>` and `<tfoot>` on each printed page
4. **Scrolling** — Enables fixed headers with scrollable body (with CSS)

---

## Styling Sections Differently

```html
<style>
    table { border-collapse: collapse; width: 100%; }
    thead {
        background-color: #1e293b;
        color: white;
    }
    tbody tr:nth-child(even) {
        background-color: #f8fafc;
    }
    tfoot {
        background-color: #f1f5f9;
        font-weight: bold;
    }
    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
    }
</style>
```

---

## `colspan` and `rowspan` Revisited

### Spanning Columns

```html
<table>
    <thead>
        <tr>
            <th colspan="2">Name</th>
            <th rowspan="2">Age</th>
        </tr>
        <tr>
            <th>First</th>
            <th>Last</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
            <td>30</td>
        </tr>
    </tbody>
</table>
```

---

## Vertical Headers

Use `<th>` in the first column for row headers:

```html
<table>
    <tr>
        <th>Name</th>
        <td>Alice</td>
    </tr>
    <tr>
        <th>Age</th>
        <td>28</td>
    </tr>
    <tr>
        <th>City</th>
        <td>New York</td>
    </tr>
</table>
```

The `scope` attribute helps screen readers understand header relationships:

```html
<thead>
    <tr>
        <th scope="col">Name</th>
        <th scope="col">Age</th>
    </tr>
</thead>
<tbody>
    <tr>
        <th scope="row">Alice</th>
        <td>28</td>
    </tr>
</tbody>
```

> [!TIP]
> Use `scope="col"` for column headers and `scope="row"` for row headers. This makes tables much more accessible to screen reader users.

---

## Summary

- Use **`<thead>`**, **`<tbody>`**, **`<tfoot>`** for structured tables
- These sections improve **accessibility**, **styling**, and **printing**
- Use **`scope`** on `<th>` elements to clarify header relationships
- **`colspan`** and **`rowspan`** allow cells to span multiple columns or rows
