---
title: HTML Select & Option
---

# HTML Select & Option

The `<select>` element creates a **dropdown menu** for choosing from a list of predefined options.

---

## Basic Dropdown

```html
<label for="country">Country:</label>
<select id="country" name="country">
    <option value="">-- Select a country --</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
    <option value="au">Australia</option>
</select>
```

---

## Pre-Selected Option

Use the `selected` attribute:

```html
<select name="color">
    <option value="red">Red</option>
    <option value="blue" selected>Blue</option>
    <option value="green">Green</option>
</select>
```

---

## `<optgroup>` — Grouping Options

Organize options into labeled groups:

```html
<select name="car">
    <optgroup label="Japanese">
        <option value="toyota">Toyota</option>
        <option value="honda">Honda</option>
        <option value="nissan">Nissan</option>
    </optgroup>
    <optgroup label="German">
        <option value="bmw">BMW</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
    </optgroup>
    <optgroup label="American">
        <option value="ford">Ford</option>
        <option value="tesla">Tesla</option>
    </optgroup>
</select>
```

---

## Multiple Selection

Allow selecting multiple options (hold Ctrl/Cmd):

```html
<label for="languages">Languages you know:</label>
<select id="languages" name="languages" multiple size="5">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
    <option value="python">Python</option>
    <option value="java">Java</option>
    <option value="rust">Rust</option>
</select>
```

The `size` attribute controls how many options are visible at once.

---

## `<select>` Attributes

| Attribute | Description |
|-----------|-------------|
| `name` | Name for form submission |
| `multiple` | Allow multiple selections |
| `size` | Number of visible options |
| `required` | Must select a non-empty option |
| `disabled` | Grays out the entire dropdown |

---

## Disabled Options

```html
<select name="plan">
    <option value="" disabled selected>-- Choose a plan --</option>
    <option value="free">Free</option>
    <option value="pro">Pro</option>
    <option value="enterprise" disabled>Enterprise (Coming Soon)</option>
</select>
```

---

## Styling Select Elements

```html
<style>
    select {
        padding: 10px 16px;
        font-size: 1rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background-color: white;
        cursor: pointer;
        min-width: 200px;
    }
    select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }
</style>
```

> [!NOTE]
> Native `<select>` elements have limited styling options. For highly customized dropdowns, developers often use JavaScript-based solutions. However, native selects have better **accessibility** and **mobile support**.

---

## Summary

- **`<select>`** creates a dropdown menu
- **`<option>`** defines each choice
- **`<optgroup>`** groups related options with a label
- Use **`selected`** to pre-select, **`disabled`** to disable options
- **`multiple`** + **`size`** for multi-select lists
- Native selects offer the best accessibility and mobile experience
