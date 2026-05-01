---
title: HTML Dialog Element
---

# HTML Dialog Element

The `<dialog>` element creates **native modal and non-modal dialogs** without any JavaScript libraries.

---

## Basic Dialog

```html
<dialog id="myDialog">
    <h2>Welcome!</h2>
    <p>This is a native HTML dialog.</p>
    <button onclick="this.closest('dialog').close()">Close</button>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">Open Dialog</button>
```

---

## Modal vs Non-Modal

### Modal Dialog (`showModal()`)

- Displays with a **backdrop** overlay
- **Traps focus** inside the dialog
- Closes with **Escape** key
- Blocks interaction with the rest of the page

```html
<script>
    document.getElementById("myDialog").showModal();
</script>
```

### Non-Modal Dialog (`show()`)

- No backdrop
- User can still interact with the rest of the page

```html
<script>
    document.getElementById("myDialog").show();
</script>
```

---

## Closing Dialogs

```html
<dialog id="dialog">
    <h2>Confirm</h2>
    <p>Are you sure?</p>
    <!-- Close with a value (return value) -->
    <button onclick="this.closest('dialog').close('confirmed')">Yes</button>
    <button onclick="this.closest('dialog').close('cancelled')">No</button>
</dialog>

<script>
    const dialog = document.getElementById("dialog");

    dialog.addEventListener("close", () => {
        console.log("Dialog return value:", dialog.returnValue);
    });
</script>
```

---

## Form Method `dialog`

A form with `method="dialog"` automatically closes the dialog on submit:

```html
<dialog id="nameDialog">
    <form method="dialog">
        <label for="name">Enter your name:</label>
        <input type="text" id="name" name="name" required>
        <button type="submit" value="save">Save</button>
        <button type="submit" value="cancel">Cancel</button>
    </form>
</dialog>

<script>
    const dialog = document.getElementById("nameDialog");
    dialog.addEventListener("close", () => {
        console.log("Action:", dialog.returnValue);
    });
</script>
```

---

## Styling the Dialog

```html
<style>
    dialog {
        border: none;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* Style the backdrop */
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }

    dialog h2 {
        margin-top: 0;
    }
</style>
```

The `::backdrop` pseudo-element styles the overlay behind modal dialogs.

---

## Animated Dialog

```html
<style>
    dialog {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
        transition: opacity 0.2s, transform 0.2s;
    }
    dialog[open] {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0);
        transition: background 0.2s;
    }
    dialog[open]::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
</style>
```

---

## Why Use `<dialog>`?

| Feature | `<dialog>` | Custom Modal (div) |
|---------|-----------|-------------------|
| Focus trapping | ✅ Built-in | ❌ Manual JavaScript |
| Escape to close | ✅ Built-in | ❌ Manual listener |
| Backdrop | ✅ `::backdrop` | ❌ Manual overlay div |
| Accessibility | ✅ Native `role="dialog"` | ❌ Manual ARIA |
| Return value | ✅ Built-in | ❌ Manual state |

> [!TIP]
> Always prefer `<dialog>` over custom modal implementations. It handles focus management, keyboard interaction, and accessibility automatically.

---

## Summary

- **`<dialog>`** creates native modal and non-modal dialogs
- **`showModal()`** for modal (with backdrop), **`show()`** for non-modal
- **Escape key** closes modal dialogs automatically
- **`close(value)`** closes and sets a return value
- Style the backdrop with **`::backdrop`**
- Use **`method="dialog"`** on forms inside dialogs
- Built-in **focus trapping** and **accessibility**
