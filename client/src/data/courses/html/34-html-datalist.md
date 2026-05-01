---
title: HTML Datalist & Output
---

# HTML Datalist & Output

The `<datalist>` and `<output>` elements enhance forms with **autocomplete suggestions** and **calculated results**.

---

## `<datalist>` — Autocomplete Suggestions

The `<datalist>` provides a list of predefined options for an `<input>`:

```html
<label for="language">Programming Language:</label>
<input type="text" id="language" name="language" list="languages">

<datalist id="languages">
    <option value="JavaScript">
    <option value="Python">
    <option value="Java">
    <option value="C++">
    <option value="Rust">
    <option value="Go">
    <option value="TypeScript">
</datalist>
```

Users can type freely **or** select from the suggestions dropdown.

### How It Works

1. Connect `<input>` to `<datalist>` using the **`list`** attribute (matches the `<datalist>` `id`)
2. The browser shows matching suggestions as the user types
3. Users are **not** restricted to the listed options

---

## `<datalist>` vs `<select>`

| Feature | `<datalist>` | `<select>` |
|---------|-------------|-----------|
| Free text input | ✅ Yes | ❌ No |
| Predefined options | ✅ Suggestions | ✅ Required choices |
| Typing to filter | ✅ Yes | Limited |
| Best for | Search, flexible input | Fixed choices |

---

## `<datalist>` with Different Input Types

Works with various input types:

```html
<!-- With number -->
<input type="range" name="rating" list="ratings" min="1" max="5">
<datalist id="ratings">
    <option value="1" label="Poor">
    <option value="2" label="Fair">
    <option value="3" label="Good">
    <option value="4" label="Very Good">
    <option value="5" label="Excellent">
</datalist>

<!-- With color -->
<input type="color" name="theme" list="theme-colors">
<datalist id="theme-colors">
    <option value="#4f46e5">
    <option value="#dc2626">
    <option value="#16a34a">
    <option value="#ca8a04">
</datalist>
```

---

## `<output>` — Display Calculated Results

The `<output>` element represents the result of a calculation:

```html
<form oninput="total.value = parseInt(price.value) * parseInt(qty.value)">
    <label>Price: $<input type="number" id="price" name="price" value="10"></label>
    <label>Qty: <input type="number" id="qty" name="qty" value="1"></label>
    <p>Total: $<output name="total" for="price qty">10</output></p>
</form>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `for` | Space-separated list of input IDs that contribute to the result |
| `name` | Name for form submission |
| `form` | Associates with a form by ID (if outside the form) |

---

## Practical Example: Tip Calculator

```html
<form oninput="
    let bill = parseFloat(billAmt.value) || 0;
    let tipPct = parseFloat(tipPercent.value) || 0;
    let tip = bill * tipPct / 100;
    tipAmt.value = tip.toFixed(2);
    totalAmt.value = (bill + tip).toFixed(2);
    tipDisplay.textContent = tipPercent.value + '%';
">
    <label>Bill Amount: $
        <input type="number" id="billAmt" name="billAmt" value="50" min="0" step="0.01">
    </label>

    <label>Tip:
        <input type="range" id="tipPercent" name="tipPercent" value="15" min="0" max="30">
        <span id="tipDisplay">15%</span>
    </label>

    <p>Tip: $<output name="tipAmt" for="billAmt tipPercent">7.50</output></p>
    <p>Total: $<output name="totalAmt" for="billAmt tipPercent">57.50</output></p>
</form>
```

---

## Summary

- **`<datalist>`** provides autocomplete suggestions for inputs
- Connect with `<input list="id">` matching `<datalist id="id">`
- Users can type freely or pick from suggestions
- **`<output>`** displays calculation results
- Use the `for` attribute to link outputs to their source inputs
