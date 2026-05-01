---
title: HTML Tables
---

# HTML Tables

HTML tables organize data into rows and columns. They are ideal for displaying **structured, tabular data** like schedules, statistics, and comparison charts.

---

## Basic Table Structure

```html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
    </tr>
    <tr>
        <td>Alice</td>
        <td>28</td>
        <td>New York</td>
    </tr>
    <tr>
        <td>Bob</td>
        <td>34</td>
        <td>London</td>
    </tr>
</table>
```

### Table Elements

| Element | Purpose |
|---------|---------|
| `<table>` | Container for the entire table |
| `<tr>` | Table row |
| `<th>` | Table header cell (bold, centered by default) |
| `<td>` | Table data cell |

---

## Table Headers

Use `<th>` for header cells. They are **bold** and **centered** by default:

```html
<table>
    <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Stock</th>
    </tr>
    <tr>
        <td>Laptop</td>
        <td>$999</td>
        <td>In Stock</td>
    </tr>
    <tr>
        <td>Keyboard</td>
        <td>$49</td>
        <td>Low Stock</td>
    </tr>
</table>
```

---

## Spanning Rows and Columns

### `colspan` — Span Multiple Columns

```html
<table>
    <tr>
        <th colspan="3">Student Grades</th>
    </tr>
    <tr>
        <th>Name</th>
        <th>Math</th>
        <th>Science</th>
    </tr>
    <tr>
        <td>Alice</td>
        <td>95</td>
        <td>88</td>
    </tr>
</table>
```

### `rowspan` — Span Multiple Rows

```html
<table>
    <tr>
        <th>Name</th>
        <td>Alice</td>
    </tr>
    <tr>
        <th rowspan="2">Phone</th>
        <td>555-1234 (Home)</td>
    </tr>
    <tr>
        <td>555-5678 (Work)</td>
    </tr>
</table>
```

---

## The `<caption>` Element

Add a title/description to your table:

```html
<table>
    <caption>Monthly Sales Report — Q1 2025</caption>
    <tr>
        <th>Month</th>
        <th>Revenue</th>
    </tr>
    <tr>
        <td>January</td>
        <td>$12,000</td>
    </tr>
    <tr>
        <td>February</td>
        <td>$15,500</td>
    </tr>
</table>
```

The caption appears above the table by default and is important for accessibility.

---

## Adding Basic Styles

Without CSS, tables have no borders. Add a simple border:

```html
<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }
    th {
        background-color: #4f46e5;
        color: white;
    }
</style>
```

---

## Summary

- Use `<table>`, `<tr>`, `<th>`, and `<td>` to build tables
- **`<th>`** for headers, **`<td>`** for data
- **`colspan`** spans multiple columns; **`rowspan`** spans multiple rows
- **`<caption>`** adds a descriptive title
- Always use **CSS** for borders and styling (not HTML attributes)

> [!IMPORTANT]
> Tables are for **tabular data only**. Never use tables for page layout — use CSS flexbox or grid instead.
