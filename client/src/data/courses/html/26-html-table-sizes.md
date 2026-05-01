---
title: HTML Table Sizes
---

# HTML Table Sizes

Control the width, height, and sizing behavior of tables and their cells using CSS.

---

## Table Width

### Full Width

```html
<style>
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 10px; }
</style>

<table>
    <tr><th>Name</th><th>Email</th><th>Role</th></tr>
    <tr><td>Alice</td><td>alice@example.com</td><td>Developer</td></tr>
    <tr><td>Bob</td><td>bob@example.com</td><td>Designer</td></tr>
</table>
```

### Fixed Width

```html
<table style="width: 600px;">
    ...
</table>
```

### Max Width

```html
<table style="width: 100%; max-width: 800px; margin: 0 auto;">
    ...
</table>
```

---

## Column Widths

Set individual column widths:

```html
<style>
    .narrow { width: 80px; }
    .wide { width: 60%; }
</style>

<table>
    <tr>
        <th class="narrow">#</th>
        <th class="wide">Name</th>
        <th>Status</th>
    </tr>
    <tr>
        <td>1</td>
        <td>Alice Johnson</td>
        <td>Active</td>
    </tr>
</table>
```

---

## Row Height

```html
<style>
    tr { height: 50px; }
    th { height: 60px; }
</style>
```

---

## Table Layout

The `table-layout` property controls how columns are sized:

### Auto (Default)

Columns size based on their content:

```html
<table style="table-layout: auto; width: 100%;">
```

### Fixed

Columns have equal widths (or respect explicit widths). Renders faster for large tables:

```html
<table style="table-layout: fixed; width: 100%;">
```

> [!TIP]
> Use `table-layout: fixed` for large tables — it renders faster because the browser doesn't need to analyze all cell content before determining column widths.

---

## Vertical Alignment

Control how content is vertically aligned within cells:

```html
<style>
    td { height: 80px; vertical-align: top; }
    /* Options: top, middle (default), bottom */
</style>
```

---

## Summary

| Property | Controls | Values |
|----------|----------|--------|
| `width` | Table/column width | `px`, `%`, `auto` |
| `max-width` | Maximum width | `px`, `%` |
| `height` | Row/cell height | `px`, `auto` |
| `table-layout` | Column sizing strategy | `auto`, `fixed` |
| `vertical-align` | Content alignment in cells | `top`, `middle`, `bottom` |

- Use **`width: 100%`** for responsive full-width tables
- Use **`table-layout: fixed`** for consistent column widths and faster rendering
- Control column widths on `<th>` or `<td>` elements individually
