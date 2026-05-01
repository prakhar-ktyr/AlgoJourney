---
title: HTML Checkboxes & Radio Buttons
---

# HTML Checkboxes & Radio Buttons

Checkboxes and radio buttons let users make selections from predefined options.

---

## Checkboxes — Multiple Selections

Use `type="checkbox"` when users can select **multiple options**:

```html
<fieldset>
    <legend>Select your skills:</legend>
    <label><input type="checkbox" name="skills" value="html"> HTML</label>
    <label><input type="checkbox" name="skills" value="css"> CSS</label>
    <label><input type="checkbox" name="skills" value="js" checked> JavaScript</label>
    <label><input type="checkbox" name="skills" value="python"> Python</label>
</fieldset>
```

### Key Attributes

| Attribute | Description |
|-----------|-------------|
| `name` | Groups checkboxes (same name = same data field) |
| `value` | Value sent to server when checked |
| `checked` | Pre-selects the checkbox |

---

## Radio Buttons — Single Selection

Use `type="radio"` when users must choose **exactly one option**:

```html
<fieldset>
    <legend>Choose a plan:</legend>
    <label><input type="radio" name="plan" value="free"> Free</label>
    <label><input type="radio" name="plan" value="pro" checked> Pro ($9/month)</label>
    <label><input type="radio" name="plan" value="enterprise"> Enterprise ($49/month)</label>
</fieldset>
```

> [!IMPORTANT]
> Radio buttons with the **same `name`** form a group. Only one radio button in a group can be selected at a time. Different names create separate groups.

---

## Checkbox vs Radio

| Feature | Checkbox | Radio |
|---------|----------|-------|
| Selection | Multiple | Single (one per group) |
| Deselectable | ✅ Yes | ❌ No (must pick one) |
| `type` | `checkbox` | `radio` |
| Grouping | Same `name` | Same `name` |

---

## Accessibility Best Practices

### Always use labels

```html
<!-- Method 1: Wrapping -->
<label>
    <input type="checkbox" name="agree" value="yes">
    I agree to the terms and conditions
</label>

<!-- Method 2: for/id -->
<input type="checkbox" id="newsletter" name="newsletter" value="yes">
<label for="newsletter">Subscribe to newsletter</label>
```

### Use `<fieldset>` and `<legend>`

Group related options with `<fieldset>` and describe them with `<legend>`:

```html
<fieldset>
    <legend>Notification Preferences:</legend>
    <label><input type="checkbox" name="notify" value="email" checked> Email</label>
    <label><input type="checkbox" name="notify" value="sms"> SMS</label>
    <label><input type="checkbox" name="notify" value="push"> Push Notifications</label>
</fieldset>
```

---

## Styling Checkboxes and Radio Buttons

Custom styling with CSS:

```html
<style>
    .custom-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all 0.2s;
    }
    .custom-checkbox:hover {
        border-color: #4f46e5;
        background-color: #f5f3ff;
    }
    .custom-checkbox input:checked + span {
        font-weight: bold;
        color: #4f46e5;
    }
</style>

<label class="custom-checkbox">
    <input type="checkbox" name="feature" value="dark-mode">
    <span>Dark Mode</span>
</label>
```

---

## Required Validation

Make at least one selection required:

```html
<!-- Radio: require one selection -->
<fieldset>
    <legend>Gender:</legend>
    <label><input type="radio" name="gender" value="male" required> Male</label>
    <label><input type="radio" name="gender" value="female" required> Female</label>
    <label><input type="radio" name="gender" value="other" required> Other</label>
</fieldset>
```

> [!NOTE]
> For radio buttons, adding `required` to **one** button in the group makes the entire group required. For checkboxes, `required` applies to each checkbox individually.

---

## Summary

- **Checkboxes** for multiple selections, **radio buttons** for single selection
- Group related options with the same **`name`** attribute
- Always wrap in **`<label>`** elements for accessibility
- Use **`<fieldset>`** and **`<legend>`** to group and describe option sets
- Use `checked` to pre-select default options
