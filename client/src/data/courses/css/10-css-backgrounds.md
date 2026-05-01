---
title: CSS Backgrounds
---

# CSS Backgrounds

The `background` family of properties controls what sits **behind** an element's content — solid colors, images, gradients, or all of them at once.

---

## `background-color`

Solid color behind the element:

```css
.card {
  background-color: #f3f4f6;
}
```

The background fills the element's **padding box** by default — that is, content + padding, but not the margin.

---

## `background-image`

Use an image as the background:

```css
.hero {
  background-image: url("hero.jpg");
}
```

You can also use **gradients** — they count as images:

```css
.hero {
  background-image: linear-gradient(to right, #4f46e5, #ec4899);
}
```

(We'll dedicate a whole lesson to gradients later.)

---

## `background-repeat`

Images tile by default. Control it:

```css
background-repeat: repeat;      /* default — tile both directions */
background-repeat: repeat-x;    /* tile horizontally only */
background-repeat: repeat-y;    /* tile vertically only */
background-repeat: no-repeat;   /* don't tile */
background-repeat: space;       /* tile, evenly spaced */
background-repeat: round;       /* tile, scaled to fit whole tiles */
```

---

## `background-position`

Where the image sits inside the box. Accepts keywords or precise values:

```css
background-position: center;
background-position: top right;
background-position: 50% 50%;
background-position: 20px 40px;
```

The first value is **horizontal**, the second is **vertical**.

---

## `background-size`

How big the image is rendered:

```css
background-size: auto;       /* default — natural size */
background-size: cover;      /* fill the box, crop overflow */
background-size: contain;    /* fit inside the box, no cropping */
background-size: 200px 100px;
background-size: 50% auto;
```

`cover` and `contain` are the workhorses for responsive hero images.

---

## `background-attachment`

Should the background scroll with the page or stay fixed?

```css
background-attachment: scroll;   /* default */
background-attachment: fixed;    /* stays put as the page scrolls (parallax-ish) */
background-attachment: local;    /* scrolls with the element's content */
```

---

## `background-origin` and `background-clip`

These control the *box* the image is positioned and clipped to:

```css
background-origin: padding-box;   /* default */
background-origin: border-box;
background-origin: content-box;

background-clip: border-box;      /* default */
background-clip: padding-box;
background-clip: content-box;
background-clip: text;            /* clip to the shape of text! */
```

The `text` value enables a famous trick — gradient text:

```css
.gradient-text {
  background: linear-gradient(90deg, #f97316, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

---

## The `background` Shorthand

Set most properties at once:

```css
.hero {
  background: #1e293b url("stars.png") center/cover no-repeat fixed;
}
```

Order can be flexible, but a clean form is:

```
background: <color> <image> <position>/<size> <repeat> <attachment>;
```

---

## Multiple Backgrounds

Stack many images on the same element. Earlier ones sit on **top**:

```css
.hero {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("photo.jpg") center/cover;
}
```

Here the dark gradient **overlays** the photo to make text legible — a very common technique.

---

## Practical Example: A Hero Banner

```html
<section class="hero">
  <h1>Welcome</h1>
  <p>Explore the platform</p>
</section>
```

```css
.hero {
  min-height: 60vh;
  display: grid;
  place-content: center;
  text-align: center;
  color: white;
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.7), rgba(236, 72, 153, 0.7)),
    url("hero.jpg") center/cover no-repeat;
}
```

Result: a vivid, full-bleed banner with a readable color overlay — done with pure CSS.

---

## Performance Tips

- **Compress images** before using them (use WebP or AVIF where possible).
- **Use SVG or gradients** instead of raster images when the design allows.
- For performance-critical pages, consider `<img>` with `object-fit: cover` instead of CSS backgrounds — modern browsers can defer-load HTML images more easily.

---

## Up Next

Backgrounds done — let's move outward to **borders**.
