---
title: CSS Fonts
---

# CSS Fonts

The choice of font sets the entire tone of a website. CSS lets you specify fonts, sizes, weights, styles — and chain fallbacks so something readable shows up even before your custom font has loaded.

---

## `font-family`

Lists the fonts to try, in order:

```css
body {
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
}
```

The browser uses the **first** font in the list that's available. The last entry should always be a **generic family** as a final fallback:

| Generic | Examples on most systems |
|---------|---------------------------|
| `serif` | Times New Roman, Georgia |
| `sans-serif` | Arial, Helvetica |
| `monospace` | Menlo, Consolas, Courier |
| `cursive` | Brush Script |
| `fantasy` | Papyrus |
| `system-ui` | The OS UI font (San Francisco on macOS, Segoe on Windows) |

Wrap multi-word names in quotes: `"Open Sans"`.

---

## The "System Font Stack"

A free, fast, native-feeling set of fonts:

```css
body {
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
}
```

Zero network request, perfect rendering on every OS. Great default.

---

## `font-size`

How big the text is.

```css
font-size: 16px;
font-size: 1rem;       /* relative to root font size */
font-size: 1.25em;     /* relative to parent's font size */
font-size: clamp(1rem, 0.5rem + 1.5vw, 1.5rem);   /* fluid */
```

**Recommendation**: use `rem` for almost everything. Users can adjust their browser's default font size for accessibility, and `rem` respects that. Pixel sizes do not.

```css
:root { font-size: 16px; }     /* baseline — usually leave alone */
body  { font-size: 1rem; }
h1    { font-size: 2.5rem; }
small { font-size: 0.875rem; }
```

---

## `font-weight`

Boldness. Numeric values 100–900, or keywords:

```css
font-weight: 100;       /* thin */
font-weight: 400;       /* normal */
font-weight: 700;       /* bold */
font-weight: 900;       /* black */
font-weight: bold;      /* keyword for 700 */
font-weight: normal;    /* keyword for 400 */
```

The font itself must include the weight you ask for — otherwise the browser picks the nearest available or fakes it (often badly).

---

## `font-style`

Italic, oblique, or upright.

```css
font-style: normal;
font-style: italic;
font-style: oblique;
font-style: oblique 10deg;   /* custom slant angle */
```

---

## `line-height` (revisited)

Lives in the `font` family but applies to text spacing. **Always use unitless** values:

```css
body { line-height: 1.6; }
```

---

## The `font` Shorthand

Sets multiple properties in one go:

```css
font: italic bold 1rem/1.6 "Inter", sans-serif;
/*    style  weight size/line-height  family   */
```

Order matters; `font-size` and `font-family` are required. The shorthand also **resets** all unspecified font properties to defaults — which is sometimes what you want and sometimes a footgun.

---

## `font-variant`

Small caps, ligatures, alternate digits:

```css
font-variant: small-caps;
font-variant-numeric: tabular-nums;   /* fixed-width digits — great for tables */
```

---

## Variable Fonts

Modern fonts can include **all weights and styles in one file**, controlled by axes. Use `font-variation-settings`:

```css
h1 {
  font-family: "Inter", sans-serif;
  font-variation-settings: "wght" 750, "slnt" -3;
}
```

Variable fonts give you smooth animation between weights, plus smaller download size.

---

## A Sensible Type Scale

Don't pick sizes ad-hoc. Pick a **scale**:

```css
:root {
  --text-xs:  0.75rem;     /* 12px */
  --text-sm:  0.875rem;    /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:  1.125rem;    /* 18px */
  --text-xl:  1.25rem;     /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-2xl); }
```

Consistent typography across a site is largely a matter of using a fixed set of sizes everywhere.

---

## Up Next

We've talked about fonts you already have. Now let's load **custom web fonts** — Google Fonts, self-hosted, variable.
