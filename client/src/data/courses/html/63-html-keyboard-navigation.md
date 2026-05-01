---
title: HTML Keyboard Navigation
---

# HTML Keyboard Navigation

Keyboard accessibility ensures your website can be fully operated **without a mouse**. This is essential for users with motor disabilities, power users, and screen reader users.

---

## Default Keyboard Behavior

Interactive HTML elements are keyboard-accessible by default:

| Element | Tab-focusable | Activation |
|---------|--------------|------------|
| `<a href>` | ✅ | Enter |
| `<button>` | ✅ | Enter / Space |
| `<input>` | ✅ | Varies by type |
| `<select>` | ✅ | Space / Arrow keys |
| `<textarea>` | ✅ | Direct input |
| `<div>` | ❌ | None |
| `<span>` | ❌ | None |

---

## The `tabindex` Attribute

Control whether and when an element receives keyboard focus:

```html
<!-- tabindex="0": Add to natural tab order -->
<div tabindex="0" role="button" onclick="doAction()">Custom Button</div>

<!-- tabindex="-1": Focusable by script, not by Tab -->
<div tabindex="-1" id="modal-content">Modal content here</div>

<!-- tabindex="1+": Explicit order (AVOID!) -->
<input tabindex="2" name="second">
<input tabindex="1" name="first">
```

| Value | Behavior |
|-------|----------|
| `0` | Added to natural tab order |
| `-1` | Only focusable via JavaScript (`element.focus()`) |
| `1+` | Custom order (strongly discouraged — confusing!) |

> [!WARNING]
> Avoid using positive `tabindex` values. They create confusing, non-intuitive tab orders. Let the DOM order determine focus sequence naturally.

---

## Skip Links

Allow keyboard users to **skip navigation** and jump directly to main content:

```html
<style>
    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #1e293b;
        color: white;
        padding: 8px 16px;
        z-index: 100;
        transition: top 0.2s;
    }
    .skip-link:focus {
        top: 0;
    }
</style>

<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>
    <!-- Navigation links -->
</nav>

<main id="main-content">
    <!-- Page content -->
</main>
```

---

## Focus Styles

Never remove focus indicators without providing alternatives:

```html
<style>
    /* BAD: Removes all focus indication */
    *:focus { outline: none; }

    /* GOOD: Custom focus style */
    :focus-visible {
        outline: 2px solid #4f46e5;
        outline-offset: 2px;
        border-radius: 2px;
    }
</style>
```

> [!TIP]
> Use **`:focus-visible`** instead of `:focus`. It only shows the focus indicator for **keyboard** users, not mouse clicks.

---

## Focus Trapping (Modals)

When a modal is open, trap focus inside it so Tab doesn't escape:

```html
<script>
    function trapFocus(element) {
        const focusable = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        element.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
            if (e.key === "Escape") {
                closeModal();
            }
        });

        first.focus();
    }
</script>
```

---

## Key Keyboard Shortcuts

Ensure these work throughout your site:

| Key | Expected Behavior |
|-----|-------------------|
| Tab | Move to next focusable element |
| Shift + Tab | Move to previous focusable element |
| Enter | Activate links and buttons |
| Space | Activate buttons, toggle checkboxes |
| Escape | Close modals, menus, popups |
| Arrow keys | Navigate within menus, radio groups, tabs |

---

## Summary

- Use **native interactive elements** (`<a>`, `<button>`, `<input>`) — they're keyboard accessible by default
- Use **`tabindex="0"`** to make custom elements focusable
- Add **skip links** for efficient keyboard navigation
- Always show **focus indicators** — use `:focus-visible` for smart styling
- **Trap focus** inside modals and dialogs
- Support **Escape** to close overlays
