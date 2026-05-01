---
title: CSS Height and Width
---

# CSS Height and Width

The `width` and `height` properties tell the browser how big you want an element's content area to be. There's a lot of nuance — defaults, units, min/max, and intrinsic sizing — that pays off when you understand it.

---

## Setting Width and Height

```css
.box {
  width: 300px;
  height: 200px;
}
```

Accepts any length unit (`px`, `rem`, `%`, `vw`, etc.) plus the keyword `auto` (the default).

---

## What Counts In That Number?

By default, `width` is the width of the **content area** only. Padding and border are added on top:

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* Rendered width: 200 + 20 + 20 + 5 + 5 = 250px */
}
```

With `box-sizing: border-box`, `width` is the **total** rendered size:

```css
.box {
  box-sizing: border-box;
  width: 200px;     /* total: exactly 200px */
  padding: 20px;
  border: 5px solid black;
}
```

This is why most modern stylesheets begin with:

```css
*, *::before, *::after { box-sizing: border-box; }
```

---

## `auto` (the default)

When `width` is `auto`, **block elements fill their parent**, and **inline elements fit their content**.

When `height` is `auto`, the box is as tall as it needs to be to contain its content. This is almost always what you want — fixed heights tend to cause overflow.

---

## Min and Max

These are crucial for responsive design.

```css
.container {
  width: 100%;
  max-width: 1200px;        /* never wider than this */
  min-width: 320px;         /* never narrower than this */
}

.thumbnail {
  height: 100px;
  max-height: 50vh;
}
```

`max-width` overrides `width`. `min-width` overrides `max-width`. The cascade goes: **min wins over max, max wins over base**.

> [!TIP]
> A near-universal idiom: `max-width: 100%` on images so they shrink with their container.
>
> ```css
> img { max-width: 100%; height: auto; }
> ```

---

## Percentage and Viewport Units

```css
.full { width: 100%; }      /* 100% of the parent's width */
.hero { height: 100vh; }    /* 100% of the viewport height */
.half { width: 50vw; }      /* half the viewport width */
```

Modern variants account for mobile browser chrome:

```css
.hero { height: 100dvh; }   /* dynamic viewport height — recommended */
.hero { height: 100svh; }   /* small (assumes browser bars visible) */
.hero { height: 100lvh; }   /* large (assumes bars hidden) */
```

`dvh` is what you almost always want for a "full screen hero" today.

---

## Intrinsic Sizing Keywords

Modern CSS adds three powerful sizing keywords:

```css
.box { width: max-content; }   /* as wide as the content needs */
.box { width: min-content; }   /* as narrow as possible without overflow */
.box { width: fit-content; }   /* shrink to content but cap at the parent */
```

A common use:

```css
.tag {
  width: fit-content;          /* hugs its label, never wider than parent */
}
```

---

## `aspect-ratio`

Lock the ratio of width to height:

```css
.video {
  width: 100%;
  aspect-ratio: 16 / 9;        /* height computed automatically */
}

.avatar {
  width: 64px;
  aspect-ratio: 1;             /* perfect square */
}
```

This replaced an entire genre of "padding hack" recipes. Use it.

---

## Height of `100%`

A common confusion:

```css
html, body { height: 100%; }
.app { height: 100%; }
```

For percentage heights to work, **every ancestor must also have an explicit height**. That's why setting `html, body { height: 100% }` is the prerequisite for full-page layouts.

The modern alternative is to use `min-height: 100dvh` and Flexbox — no chain of `height: 100%` required.

---

## Practical Patterns

### Centered Content Container

```css
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

The `min()` formula handles padding on small screens and a max-width on large ones — in one line.

### Responsive Avatar

```css
.avatar {
  width: clamp(48px, 8vw, 96px);
  aspect-ratio: 1;
  border-radius: 50%;
}
```

Scales with the viewport but stays within sane bounds.

---

## Up Next

Now we tie it all together with the most important conceptual model in CSS: **the box model**.
