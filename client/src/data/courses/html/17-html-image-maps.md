---
title: HTML Image Maps
---

# HTML Image Maps

An image map lets you define **clickable areas** on an image. Each area can link to a different destination, making a single image interactive.

---

## How Image Maps Work

An image map uses three elements:
1. **`<img>`** — The image with a `usemap` attribute
2. **`<map>`** — Defines the clickable areas
3. **`<area>`** — Each clickable region within the map

```html
<img src="workspace.jpg" alt="Office workspace" usemap="#workspace-map" width="800" height="500">

<map name="workspace-map">
    <area shape="rect" coords="0,0,200,150" href="monitor.html" alt="Monitor">
    <area shape="rect" coords="250,200,450,350" href="keyboard.html" alt="Keyboard">
    <area shape="circle" coords="600,100,80" href="lamp.html" alt="Desk lamp">
</map>
```

> [!NOTE]
> The `usemap` value on the `<img>` must match the `name` on the `<map>` element (with a `#` prefix on the `<img>` side).

---

## Area Shapes

The `<area>` element supports three shapes:

### Rectangle (`rect`)

Defined by the top-left and bottom-right corner coordinates: `x1, y1, x2, y2`

```html
<area shape="rect" coords="0,0,200,150" href="page1.html" alt="Section 1">
```

This creates a rectangle from point (0,0) to point (200,150).

### Circle (`circle`)

Defined by the center point and radius: `x, y, radius`

```html
<area shape="circle" coords="300,200,50" href="page2.html" alt="Section 2">
```

This creates a circle centered at (300,200) with a radius of 50 pixels.

### Polygon (`poly`)

Defined by a series of x,y coordinate pairs forming a closed shape:

```html
<area shape="poly" coords="100,50,200,80,180,200,50,180" href="page3.html" alt="Section 3">
```

This creates a polygon connecting the points (100,50), (200,80), (180,200), and (50,180).

---

## Complete Example

Here's a practical example of a floor plan with clickable rooms:

```html
<img src="floorplan.png" alt="Office floor plan" usemap="#office-map" width="600" height="400">

<map name="office-map">
    <!-- Reception area (rectangle) -->
    <area shape="rect" coords="10,10,200,150"
          href="reception.html"
          alt="Reception area"
          title="Reception">

    <!-- Meeting room (rectangle) -->
    <area shape="rect" coords="220,10,400,150"
          href="meeting-room.html"
          alt="Meeting room"
          title="Meeting Room">

    <!-- Coffee corner (circle) -->
    <area shape="circle" coords="500,80,60"
          href="coffee.html"
          alt="Coffee corner"
          title="Coffee Corner">

    <!-- Open workspace (polygon) -->
    <area shape="poly" coords="10,170,590,170,590,390,10,390"
          href="workspace.html"
          alt="Open workspace"
          title="Open Workspace">
</map>
```

---

## `<area>` Attributes

| Attribute | Description |
|-----------|-------------|
| `shape` | Shape type: `rect`, `circle`, or `poly` |
| `coords` | Coordinates defining the shape |
| `href` | URL to navigate to when clicked |
| `alt` | Alternative text (required for accessibility) |
| `title` | Tooltip text on hover |
| `target` | Where to open the link (`_blank`, `_self`, etc.) |
| `download` | Download the linked resource |

---

## Finding Coordinates

To find the pixel coordinates for your clickable areas:

1. **Image editing software** — Use tools like Photoshop, GIMP, or Figma to identify coordinates by hovering over the image.
2. **Browser DevTools** — Open the image in a browser, right-click and inspect it, then use the element's coordinates.
3. **Online tools** — Use free image map generators that let you draw areas visually.

> [!TIP]
> Search for "image map generator" online to find visual tools where you can draw shapes over your image and automatically generate the HTML code.

---

## When to Use Image Maps

Image maps are best for:
- **Interactive diagrams** — Clickable anatomy charts, floor plans, or maps
- **Navigation menus** — Creative graphical navigation (though CSS/JS is usually better)
- **Educational content** — Clickable parts of a machine, organism, or system

### When NOT to Use Image Maps

- For regular navigation — use standard `<nav>` with links instead
- For responsive designs — image maps don't scale well
- When you need hover effects — CSS and JavaScript offer better control

> [!WARNING]
> Image maps are **not responsive** by default. The coordinates are fixed pixel values, so the clickable areas won't adjust if the image is resized. For responsive designs, consider using CSS-positioned links over the image or JavaScript-based solutions.

---

## Summary

- Image maps create **clickable regions** on a single image
- Use `<img usemap="#name">` + `<map name="name">` + `<area>`
- Three shapes available: **rect**, **circle**, **poly**
- Always include **`alt`** text on `<area>` elements
- Image maps are best for **diagrams and interactive visuals**
- They are **not responsive** — coordinates are fixed pixels
