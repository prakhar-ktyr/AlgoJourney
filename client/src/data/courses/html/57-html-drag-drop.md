---
title: HTML Drag & Drop
---

# HTML Drag & Drop

The HTML Drag and Drop API lets users **drag elements** and **drop** them onto targets, enabling interactive UIs like sortable lists and file upload zones.

---

## Making Elements Draggable

Add the `draggable="true"` attribute:

```html
<div draggable="true" id="item1">Drag me!</div>
```

---

## Drag Events

| Event | Fires On | When |
|-------|----------|------|
| `dragstart` | Dragged element | Drag begins |
| `drag` | Dragged element | During drag |
| `dragend` | Dragged element | Drag ends |
| `dragenter` | Drop target | Dragged item enters |
| `dragover` | Drop target | Dragged item is over it |
| `dragleave` | Drop target | Dragged item leaves |
| `drop` | Drop target | Item is dropped |

---

## Basic Example

```html
<style>
    .drag-item {
        padding: 12px 20px;
        background: #4f46e5;
        color: white;
        border-radius: 6px;
        cursor: grab;
        display: inline-block;
        margin: 10px;
    }
    .drop-zone {
        width: 300px;
        height: 200px;
        border: 3px dashed #d1d5db;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        transition: all 0.2s;
    }
    .drop-zone.over {
        border-color: #4f46e5;
        background: #eff6ff;
        color: #4f46e5;
    }
</style>

<div class="drag-item" draggable="true" id="item1">Drag Me</div>

<div class="drop-zone" id="dropZone">Drop Here</div>

<script>
    const item = document.getElementById("item1");
    const zone = document.getElementById("dropZone");

    item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
    });

    zone.addEventListener("dragover", (e) => {
        e.preventDefault(); // Required to allow drop
        zone.classList.add("over");
    });

    zone.addEventListener("dragleave", () => {
        zone.classList.remove("over");
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const el = document.getElementById(id);
        zone.appendChild(el);
        zone.classList.remove("over");
    });
</script>
```

> [!IMPORTANT]
> You **must** call `e.preventDefault()` in the `dragover` event handler. Without it, the browser won't allow the drop.

---

## The `dataTransfer` Object

Used to pass data between drag and drop events:

```html
<script>
    // Set data on dragstart
    e.dataTransfer.setData("text/plain", "some data");
    e.dataTransfer.setData("application/json", JSON.stringify({id: 1}));

    // Get data on drop
    const text = e.dataTransfer.getData("text/plain");
    const json = JSON.parse(e.dataTransfer.getData("application/json"));
</script>
```

---

## File Drop Zone

```html
<div id="fileZone" class="drop-zone">Drop files here</div>

<script>
    const fileZone = document.getElementById("fileZone");

    fileZone.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    fileZone.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        for (const file of files) {
            console.log(`File: ${file.name}, Size: ${file.size} bytes`);
        }
    });
</script>
```

---

## Summary

- Add **`draggable="true"`** to make elements draggable
- Handle **`dragstart`** on the source and **`dragover`** + **`drop`** on the target
- **`e.preventDefault()`** in `dragover` is required to enable dropping
- Use **`dataTransfer`** to pass data between drag and drop events
- Supports **file drops** via `dataTransfer.files`
