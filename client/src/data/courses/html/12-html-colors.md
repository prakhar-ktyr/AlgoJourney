---
title: HTML Colors
---

# HTML Colors

Colors bring your web pages to life. HTML supports several ways to specify colors: **named colors**, **hexadecimal**, **RGB**, **RGBA**, **HSL**, and **HSLA**.

---

## Applying Colors in HTML

Colors are applied using the `style` attribute with CSS properties:

```html
<h1 style="color: blue;">Blue Heading</h1>
<p style="color: red;">Red paragraph text.</p>
<p style="background-color: yellow;">Yellow background.</p>
```

The most common CSS color properties:

| Property | What It Colors |
|----------|---------------|
| `color` | Text color |
| `background-color` | Background color |
| `border-color` | Border color |

---

## Named Colors

HTML supports **140 named colors**. Here are some common ones:

```html
<p style="color: red;">Red</p>
<p style="color: blue;">Blue</p>
<p style="color: green;">Green</p>
<p style="color: orange;">Orange</p>
<p style="color: purple;">Purple</p>
<p style="color: tomato;">Tomato</p>
<p style="color: dodgerblue;">DodgerBlue</p>
<p style="color: mediumseagreen;">MediumSeaGreen</p>
<p style="color: slategray;">SlateGray</p>
<p style="color: coral;">Coral</p>
```

> [!TIP]
> Named colors are convenient for quick prototyping, but for production designs, use hex or HSL values for precise color control.

---

## Hexadecimal Colors

Hex colors use the format `#RRGGBB`, where each pair represents the red, green, and blue components (00–FF):

```html
<p style="color: #ff0000;">Pure Red</p>
<p style="color: #00ff00;">Pure Green</p>
<p style="color: #0000ff;">Pure Blue</p>
<p style="color: #333333;">Dark Gray</p>
<p style="color: #ff6347;">Tomato</p>
```

### Shorthand Hex

When both digits in each pair are the same, you can use the 3-digit shorthand:

```html
<p style="color: #f00;">Red (#ff0000)</p>
<p style="color: #0f0;">Green (#00ff00)</p>
<p style="color: #333;">Dark Gray (#333333)</p>
```

### 8-Digit Hex (with Alpha)

Add two more digits for transparency (alpha channel):

```html
<p style="background-color: #ff000080;">50% transparent red</p>
```

`00` = fully transparent, `FF` = fully opaque.

---

## RGB Colors

RGB specifies colors using **Red, Green, Blue** values from 0 to 255:

```html
<p style="color: rgb(255, 0, 0);">Pure Red</p>
<p style="color: rgb(0, 128, 0);">Green</p>
<p style="color: rgb(0, 0, 255);">Pure Blue</p>
<p style="color: rgb(60, 60, 60);">Dark Gray</p>
```

---

## RGBA Colors — Adding Transparency

RGBA extends RGB with an **alpha (transparency)** value between 0.0 (fully transparent) and 1.0 (fully opaque):

```html
<p style="background-color: rgba(255, 0, 0, 1.0);">Fully opaque red</p>
<p style="background-color: rgba(255, 0, 0, 0.6);">60% opaque red</p>
<p style="background-color: rgba(255, 0, 0, 0.3);">30% opaque red</p>
<p style="background-color: rgba(255, 0, 0, 0.1);">10% opaque red</p>
```

---

## HSL Colors

HSL stands for **Hue, Saturation, Lightness**:

- **Hue** — A degree on the color wheel (0–360). 0 = red, 120 = green, 240 = blue.
- **Saturation** — Intensity of the color (0% = gray, 100% = full color).
- **Lightness** — Brightness (0% = black, 50% = normal, 100% = white).

```html
<p style="color: hsl(0, 100%, 50%);">Pure Red</p>
<p style="color: hsl(120, 100%, 50%);">Pure Green</p>
<p style="color: hsl(240, 100%, 50%);">Pure Blue</p>
<p style="color: hsl(0, 0%, 50%);">Medium Gray</p>
```

> [!TIP]
> HSL is often easier to work with than hex or RGB because you can intuitively adjust brightness and saturation. Want a lighter shade? Just increase lightness. Want a more muted tone? Decrease saturation.

### HSLA — HSL with Alpha

Add transparency with the alpha value:

```html
<p style="background-color: hsla(0, 100%, 50%, 0.5);">50% transparent red</p>
```

---

## Color Comparison

The same red color expressed in every format:

| Format | Value | Result |
|--------|-------|--------|
| Named | `red` | Red |
| Hex | `#ff0000` | Red |
| Hex (short) | `#f00` | Red |
| RGB | `rgb(255, 0, 0)` | Red |
| RGBA | `rgba(255, 0, 0, 1.0)` | Red |
| HSL | `hsl(0, 100%, 50%)` | Red |
| HSLA | `hsla(0, 100%, 50%, 1.0)` | Red |

---

## Background Colors

Apply colors to element backgrounds:

```html
<div style="background-color: #f0f0f0; padding: 20px;">
    <h2 style="color: #333;">Section Title</h2>
    <p style="color: #666;">Section content with a light gray background.</p>
</div>
```

---

## The `opacity` Property

You can also control transparency using the CSS `opacity` property (affects the entire element, including text):

```html
<p style="background-color: green; opacity: 1.0;">opacity 1.0</p>
<p style="background-color: green; opacity: 0.6;">opacity 0.6</p>
<p style="background-color: green; opacity: 0.3;">opacity 0.3</p>
```

> [!NOTE]
> The key difference: `rgba`/`hsla` only make the **color** transparent, while `opacity` makes the **entire element** (including text and children) transparent.

---

## Summary

- **Named colors** — Simple and readable (`red`, `blue`, `tomato`)
- **Hex** — Precise 6-digit format (`#ff6347`) with optional 3-digit shorthand
- **RGB/RGBA** — Numeric 0–255 values with optional transparency
- **HSL/HSLA** — Intuitive hue/saturation/lightness with optional transparency
- Use `color` for text, `background-color` for backgrounds, `border-color` for borders
- `rgba`/`hsla` add transparency to the color; `opacity` makes the whole element transparent
