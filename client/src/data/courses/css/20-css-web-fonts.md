---
title: CSS Web Fonts
---

# CSS Web Fonts

A **web font** is a font file the browser downloads from your server (or a CDN) so it can render text that the user doesn't have installed. CSS provides `@font-face` — and a few performance hints — to make this fast and reliable.

---

## Quick Start: Google Fonts

The easiest way to add a custom font:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
```

```css
body {
  font-family: "Inter", system-ui, sans-serif;
}
```

Done. The two `preconnect` hints help the browser open the connection early.

---

## Self-Hosting With `@font-face`

For best performance and privacy, host fonts yourself:

```css
@font-face {
  font-family: "Inter";
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/inter-regular.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/inter-bold.woff2") format("woff2");
}
```

Then use it like any other font:

```css
body { font-family: "Inter", sans-serif; }
```

### Why woff2?

Use **`.woff2`** files — they're the smallest, supported in every modern browser, and offer the best compression. Skip `.ttf`/`.otf`/`.eot` unless you need legacy support.

---

## `font-display` — The Speed Superpower

Tells the browser what to do while a font is loading:

```css
font-display: auto;         /* browser default — usually "block" */
font-display: block;        /* invisible text for up to ~3s, then swap */
font-display: swap;         /* show fallback immediately, swap when ready */
font-display: fallback;     /* short block, then fallback if not loaded */
font-display: optional;     /* fallback if not loaded fast — never swap */
```

**Recommendation**: `swap` for almost all body and heading text. Avoid the dreaded "Flash Of Invisible Text" (FOIT).

---

## Variable Fonts in `@font-face`

A single file covers a range of weights and styles:

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;        /* range covered */
  font-display: swap;
  src: url("/fonts/Inter-VariableFont.woff2") format("woff2-variations");
}
```

One declaration, one file, all weights — typically smaller than 3–4 static weight files combined.

---

## Preloading Critical Fonts

For above-the-fold text, tell the browser to fetch the font in parallel with the HTML:

```html
<link rel="preload"
      href="/fonts/inter-variable.woff2"
      as="font"
      type="font/woff2"
      crossorigin>
```

The `crossorigin` attribute is required for fonts even when same-origin.

---

## Avoiding Layout Shift

When the web font swaps in, text reflows because the metrics differ from the fallback. CSS now has properties to align fallback metrics:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

Tools like **fontsource** and the Google Fonts CSS API include sensible overrides automatically.

---

## Subsetting

A full font may include thousands of glyphs. If your site is English-only, **subset** the file to Latin characters:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;   /* Basic Latin + Latin-1 */
}
```

Subsetting can cut a font's size by 50–80%.

---

## A Realistic Setup

For a typical site, the modern recipe is:

1. **Self-host** a `woff2` variable font.
2. Use **`font-display: swap`**.
3. **Preload** the file.
4. Set **`size-adjust`** overrides to minimize layout shift.
5. Pick a **system fallback** that's metrically similar.

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter.woff2") format("woff2-variations");
  size-adjust: 100%;
  ascent-override: 90%;
}

body {
  font-family: "Inter", system-ui, sans-serif;
}
```

That's a fast, accessible, professional font setup.

---

## Up Next

A small but fun digression — **icons** in CSS.
