---
title: HTML Canvas
---

# HTML Canvas

The `<canvas>` element provides a drawing surface for rendering **2D graphics** with JavaScript. Unlike SVG, canvas is pixel-based (raster) and drawn programmatically.

---

## Basic Setup

```html
<canvas id="myCanvas" width="400" height="300" style="border: 1px solid #ccc;"></canvas>

<script>
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // Draw a filled rectangle
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(50, 50, 200, 100);
</script>
```

---

## Drawing Shapes

### Rectangles

```html
<script>
    // Filled rectangle
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(10, 10, 150, 80);

    // Outlined rectangle
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(180, 10, 150, 80);

    // Clear a rectangle area
    ctx.clearRect(30, 30, 50, 40);
</script>
```

### Lines

```html
<script>
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(200, 50);
    ctx.lineTo(200, 150);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
</script>
```

### Circles and Arcs

```html
<script>
    ctx.beginPath();
    ctx.arc(200, 150, 60, 0, Math.PI * 2); // Full circle
    ctx.fillStyle = "#10b981";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(200, 150, 60, 0, Math.PI); // Half circle
    ctx.stroke();
</script>
```

`arc(x, y, radius, startAngle, endAngle)` — angles are in **radians**.

---

## Drawing Text

```html
<script>
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Hello Canvas!", 50, 50);

    ctx.font = "18px Arial";
    ctx.strokeStyle = "#4f46e5";
    ctx.strokeText("Outlined Text", 50, 90);
</script>
```

---

## Colors and Gradients

### Linear Gradient

```html
<script>
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0, "#4f46e5");
    gradient.addColorStop(1, "#ec4899");

    ctx.fillStyle = gradient;
    ctx.fillRect(10, 10, 300, 100);
</script>
```

---

## Drawing Images

```html
<script>
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 10, 10, 200, 150);
    };
    img.src = "photo.jpg";
</script>
```

---

## Canvas vs SVG

| Feature | Canvas | SVG |
|---------|--------|-----|
| Type | Raster (pixels) | Vector (math) |
| API | JavaScript drawing | XML markup |
| Resolution | Fixed (can pixelate) | Scales perfectly |
| Performance | Better for many objects | Better for few, complex objects |
| Events | No built-in element events | Each element is interactive |
| Best for | Games, charts, image editing | Icons, logos, diagrams |

---

## Summary

- `<canvas>` draws **2D graphics with JavaScript**
- Get the context with `getContext("2d")`
- Draw shapes: `fillRect()`, `arc()`, `beginPath()`, `lineTo()`
- Draw text: `fillText()`, `strokeText()`
- Use gradients for color effects
- Canvas is **pixel-based** — best for games and data visualization
