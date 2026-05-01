---
title: HTML Input Types
---

# HTML Input Types

The `<input>` element supports many different types, each designed for a specific kind of data. The `type` attribute determines the behavior and appearance.

---

## Text Inputs

### `type="text"` — Single-Line Text

```html
<input type="text" name="username" placeholder="Enter username">
```

### `type="password"` — Hidden Characters

```html
<input type="password" name="password" placeholder="Enter password">
```

Characters are masked with dots or asterisks.

### `type="email"` — Email Validation

```html
<input type="email" name="email" placeholder="user@example.com">
```

Browsers validate that the input contains a valid email format. Mobile devices show an optimized keyboard with `@` key.

### `type="url"` — URL Input

```html
<input type="url" name="website" placeholder="https://example.com">
```

### `type="tel"` — Telephone Number

```html
<input type="tel" name="phone" placeholder="+1 (234) 567-890">
```

Shows a numeric keyboard on mobile devices.

### `type="search"` — Search Field

```html
<input type="search" name="q" placeholder="Search...">
```

May include a clear button and browser-specific styling.

---

## Numeric Inputs

### `type="number"` — Numeric Input

```html
<input type="number" name="quantity" min="1" max="100" step="1" value="1">
```

| Attribute | Description |
|-----------|-------------|
| `min` | Minimum value |
| `max` | Maximum value |
| `step` | Increment/decrement step |

### `type="range"` — Slider

```html
<label for="volume">Volume:</label>
<input type="range" id="volume" name="volume" min="0" max="100" value="50">
```

---

## Date & Time Inputs

```html
<input type="date" name="birthday">
<input type="time" name="meeting-time">
<input type="datetime-local" name="event">
<input type="month" name="start-month">
<input type="week" name="start-week">
```

| Type | Format | Example |
|------|--------|---------|
| `date` | YYYY-MM-DD | 2025-06-15 |
| `time` | HH:MM | 14:30 |
| `datetime-local` | YYYY-MM-DDTHH:MM | 2025-06-15T14:30 |
| `month` | YYYY-MM | 2025-06 |
| `week` | YYYY-Www | 2025-W24 |

> [!TIP]
> Date/time inputs show native date pickers on most modern browsers, eliminating the need for JavaScript date picker libraries for basic use cases.

---

## Selection Inputs

### `type="checkbox"` — Multiple Selections

```html
<label><input type="checkbox" name="skills" value="html"> HTML</label>
<label><input type="checkbox" name="skills" value="css"> CSS</label>
<label><input type="checkbox" name="skills" value="js" checked> JavaScript</label>
```

### `type="radio"` — Single Selection

```html
<label><input type="radio" name="plan" value="free"> Free</label>
<label><input type="radio" name="plan" value="pro" checked> Pro</label>
<label><input type="radio" name="plan" value="enterprise"> Enterprise</label>
```

> [!NOTE]
> Radio buttons with the **same `name`** form a group — only one can be selected. Checkboxes allow multiple selections.

---

## Other Input Types

### `type="color"` — Color Picker

```html
<input type="color" name="theme-color" value="#4f46e5">
```

### `type="file"` — File Upload

```html
<input type="file" name="avatar" accept="image/*">
<input type="file" name="documents" accept=".pdf,.doc" multiple>
```

Use `accept` to filter file types and `multiple` to allow multiple files.

### `type="hidden"` — Hidden Data

```html
<input type="hidden" name="user_id" value="12345">
```

Not visible to the user but included in form submission. Useful for passing data like tokens or IDs.

---

## Complete Input Types Reference

| Type | Purpose | Mobile Keyboard |
|------|---------|----------------|
| `text` | General text | Standard |
| `password` | Masked text | Standard |
| `email` | Email address | Email keyboard |
| `url` | Web address | URL keyboard |
| `tel` | Phone number | Numeric |
| `search` | Search query | Standard + search |
| `number` | Numeric value | Numeric |
| `range` | Slider control | N/A |
| `date` | Date picker | Date picker |
| `time` | Time picker | Time picker |
| `datetime-local` | Date + time | Date/time picker |
| `month` | Month + year | Month picker |
| `week` | Week + year | Week picker |
| `color` | Color picker | Color picker |
| `file` | File upload | File browser |
| `checkbox` | Multiple choice | Checkbox |
| `radio` | Single choice | Radio button |
| `hidden` | Hidden data | N/A |

---

## Summary

- Choose the **right input type** for better UX, validation, and mobile keyboards
- Use **`email`**, **`url`**, **`tel`** for automatic format validation and keyboard optimization
- Use **`date`**/**`time`** types for native date pickers
- **`checkbox`** for multiple selections, **`radio`** for single selection
- **`hidden`** inputs pass data without user interaction
