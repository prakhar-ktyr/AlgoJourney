---
title: CSS Borders
---

# CSS Borders

A **border** is a line drawn around an element, between its padding and its margin. Borders have three properties — **width**, **style**, and **color** — and you can set them individually or all at once.

---

## The `border` Shorthand

The most common form:

```css
.card {
  border: 1px solid #e5e7eb;
}
```

Order is **width style color**. All three are optional, but `style` is required for the border to actually appear (the default style is `none`).

---

## `border-style`

The shape of the line:

```css
border-style: none;       /* default — invisible */
border-style: solid;      /* the workhorse */
border-style: dashed;
border-style: dotted;
border-style: double;
border-style: groove;
border-style: ridge;
border-style: inset;
border-style: outset;
border-style: hidden;     /* like none, but with table-border-collapse rules */
```

The 3D-looking ones (`groove`, `ridge`, `inset`, `outset`) are dated — modern designs almost always use `solid`.

---

## `border-width` and `border-color`

```css
border-width: 2px;
border-color: tomato;
```

Or per-side:

```css
border-width: 1px 2px 1px 2px;   /* top right bottom left */
border-width: 1px 2px;           /* vertical horizontal */
```

---

## Per-Side Borders

Each side has its own shorthand:

```css
border-top:    1px solid #ccc;
border-right:  2px dashed red;
border-bottom: 3px solid blue;
border-left:   none;
```

A common pattern — underline-style heading:

```css
h2 {
  border-bottom: 2px solid currentColor;
  padding-bottom: 0.25rem;
}
```

---

## Logical Borders

For internationalized layouts (right-to-left languages), use **logical** borders:

```css
border-inline-start: 4px solid blue;   /* left in LTR, right in RTL */
border-block-end:   1px solid #eee;    /* bottom in horizontal writing */
```

Logical properties are the modern recommendation when your site supports multiple writing directions.

---

## `border-radius`

Rounded corners. We'll cover this fully in its own lesson, but a taste:

```css
.button { border-radius: 8px; }
.avatar { border-radius: 50%; }   /* circle */
```

You can specify each corner:

```css
border-radius: 8px 0 0 8px;   /* top-left, top-right, bottom-right, bottom-left */
```

---

## `border-image`

Use an image (or gradient) as the border. Niche but powerful:

```css
.fancy {
  border: 10px solid transparent;
  border-image: linear-gradient(45deg, #f97316, #ec4899) 1;
}
```

The trailing `1` is the slice value — see the [border-image](https://developer.mozilla.org/docs/Web/CSS/border-image) reference for the full mechanics.

---

## Borders and the Box Model

Borders sit **between** padding and margin. They count toward the element's **rendered size** unless you use `box-sizing: border-box` (which we'll cover soon).

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* Total rendered width: 200 + 20 + 20 + 5 + 5 = 250px */
}

.box-fixed {
  box-sizing: border-box;
  width: 200px;        /* total width is now exactly 200px */
  padding: 20px;
  border: 5px solid black;
}
```

---

## Common Border Patterns

### Card

```css
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}
```

### Section Divider

```css
section + section {
  border-top: 1px solid #f1f5f9;
  margin-top: 2rem;
  padding-top: 2rem;
}
```

### Focus Ring

```css
button:focus-visible {
  outline: none;
  border: 2px solid #2563eb;
}
```

(Better practice: use `outline` for focus — see the outline lesson.)

### Animated Underline

```css
.link {
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}
.link:hover { border-bottom-color: currentColor; }
```

---

## Up Next

Now that we have lines around our elements, let's understand the empty space inside and outside of them — **margins and padding**.
