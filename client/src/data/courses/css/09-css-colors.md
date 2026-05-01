---
title: CSS Colors
---

# CSS Colors

CSS supports **hundreds** of ways to express a color. In this lesson you'll learn the formats you'll actually use day to day, and when each one shines.

---

## Where Colors Are Used

Practically every visual property accepts a color:

```css
.card {
  color: #1f2937;              /* text */
  background-color: #ffffff;    /* background */
  border: 1px solid #e5e7eb;   /* border */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);   /* shadow */
}
```

---

## 1. Named Colors

CSS ships with **147 named colors** — `red`, `green`, `blue`, plus oddities like `tomato`, `cornflowerblue`, `rebeccapurple`.

```css
h1 { color: tomato; }
.warning { background: gold; }
```

Convenient for prototyping, rare in production (you'll want exact brand colors).

---

## 2. Hexadecimal — `#rrggbb`

Six hex digits = red, green, blue. Each pair is a value from `00`–`ff` (0–255).

```css
color: #ff0000;   /* red */
color: #00ff00;   /* green */
color: #0000ff;   /* blue */
color: #1e293b;   /* slate gray */
```

If both digits in each pair match, you can shorten it to **three**:

```css
color: #f00;   /* same as #ff0000 */
color: #fff;   /* white */
color: #000;   /* black */
```

### Hex with Alpha — `#rrggbbaa`

Add two more digits for transparency:

```css
background: #00000080;   /* black at 50% opacity */
```

---

## 3. RGB and RGBA

Same as hex, but human-readable:

```css
color: rgb(255 0 0);                /* red */
color: rgb(255 0 0 / 0.5);          /* red, 50% opaque */
color: rgb(255, 0, 0);              /* old comma syntax — still works */
color: rgba(255, 0, 0, 0.5);        /* old syntax with alpha */
```

The newer **slash syntax** (`rgb(R G B / A)`) is the preferred form — and `rgb()` alone now accepts alpha, so `rgba()` is redundant.

---

## 4. HSL and HSLA

**Hue, Saturation, Lightness** — the most *intuitive* color model. You think in colors, not in numbers.

```css
color: hsl(0   100% 50%);           /* red */
color: hsl(120 100% 50%);           /* green */
color: hsl(240 100% 50%);           /* blue */
color: hsl(0   0%   50%);           /* gray */
color: hsl(0   100% 50% / 0.5);     /* red, 50% opacity */
```

| Channel | Range | Meaning |
|---------|-------|---------|
| **Hue** | 0–360 (deg) | Position on the color wheel |
| **Saturation** | 0%–100% | Vividness (0% = gray) |
| **Lightness** | 0%–100% | Brightness (0% = black, 100% = white) |

HSL makes it trivial to derive a color palette: keep hue and saturation, change only lightness.

```css
--brand:        hsl(220 90% 50%);
--brand-light:  hsl(220 90% 70%);
--brand-dark:   hsl(220 90% 30%);
```

---

## 5. Modern Color Spaces

The newest CSS specs add color formats with **wider gamut** and more perceptual accuracy:

```css
color: oklch(70% 0.15 200);   /* recommended for design systems */
color: lab(50% 40 30);
color: color(display-p3 1 0 0);
```

`oklch()` in particular has become a favorite because lightness behaves the way humans perceive it. You don't need it for every project — but know it exists.

---

## 6. Special Keywords

| Value | Meaning |
|-------|---------|
| `transparent` | Fully transparent (equivalent to `rgb(0 0 0 / 0)`) |
| `currentColor` | Whatever the element's `color` is |
| `inherit` | Use the parent element's value |

```css
.icon {
  fill: currentColor;   /* matches the surrounding text color */
}
```

---

## Choosing a Format — A Cheat Sheet

| Use Case | Best Format |
|----------|-------------|
| Quick prototyping | Named (`tomato`) |
| Designs from Figma | Hex (`#1e293b`) |
| Programmatic palettes | HSL or OKLCH |
| Colors with opacity | `rgb(... / α)` or `hsl(... / α)` |
| Modern design systems | OKLCH |

---

## Contrast Matters

Pretty colors are useless if users can't read your text. Aim for at least **4.5:1** contrast between text and background (the WCAG AA standard). Use DevTools' built-in contrast checker, or sites like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

```css
/* ❌ Hard to read */
.tip { color: #aaa; background: #fff; }

/* ✅ Accessible */
.tip { color: #374151; background: #fff; }
```

---

## Up Next

Now that we can pick colors, let's apply them — starting with **backgrounds**.
