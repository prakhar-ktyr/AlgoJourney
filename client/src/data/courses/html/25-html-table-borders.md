---
title: HTML Table Borders
---

# HTML Table Borders

By default, HTML tables have **no borders**. You need CSS to add and style table borders.

---

## Basic Borders

```html
<style>
    table, th, td {
        border: 1px solid black;
    }
</style>

<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>Alice</td>
        <td>28</td>
    </tr>
</table>
```

This creates **double borders** because both the table and the cells have separate borders.

---

## Collapsing Borders

Use `border-collapse: collapse` to merge cell borders into single lines:

```html
<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 10px;
    }
</style>
```

| `border-collapse` Value | Result |
|------------------------|--------|
| `separate` (default) | Double borders with spacing |
| `collapse` | Single merged borders |

---

## Border Styles

CSS supports different border styles:

```html
<style>
    .solid { border: 2px solid #333; }
    .dashed { border: 2px dashed #333; }
    .dotted { border: 2px dotted #333; }
    .double { border: 4px double #333; }
    .groove { border: 3px groove #999; }
    .ridge { border: 3px ridge #999; }
</style>
```

---

## Borders on Specific Sides

Apply borders to individual sides:

```html
<style>
    td {
        border-bottom: 1px solid #e5e7eb;
        padding: 12px;
    }
</style>
```

This creates a clean, modern look with only bottom borders (horizontal lines between rows).

---

## Rounded Borders

Use `border-radius` on the table (requires `border-collapse: separate`):

```html
<style>
    table {
        border-collapse: separate;
        border-spacing: 0;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
    }
</style>
```

---

## Border Color

```html
<style>
    table {
        border-collapse: collapse;
    }
    th {
        border: 2px solid #4f46e5;
        padding: 10px;
    }
    td {
        border: 1px solid #e5e7eb;
        padding: 10px;
    }
</style>
```

---

## Border Spacing

When using `border-collapse: separate`, control the gap between cells:

```html
<style>
    table {
        border-collapse: separate;
        border-spacing: 10px;
    }
    td {
        border: 1px solid #ccc;
        padding: 10px;
    }
</style>
```

---

## Summary

- Use **`border-collapse: collapse`** for clean single-line borders
- Use **`border-bottom`** only for a modern, minimal look
- CSS properties: `border`, `border-style`, `border-color`, `border-width`
- Use **`border-spacing`** with `border-collapse: separate` for gaps
- Add **`border-radius`** for rounded table corners
