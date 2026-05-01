---
title: CSS Text Effects
---

# CSS Text Effects

Modern CSS gives text genuine special-effects abilities — fluid sizing, wrapping intelligence, gradient fills, decorative trims. Here are the most useful.

---

## `text-wrap`

Tell the browser **how** to break lines:

```css
text-wrap: wrap;       /* default */
text-wrap: nowrap;     /* don't wrap */
text-wrap: balance;    /* balance line lengths — great for headings */
text-wrap: pretty;     /* avoids orphans on the last line — great for body text */
```

`balance` and `pretty` are the new stars. A headline with balance:

```css
h1 { text-wrap: balance; }
```

The browser shifts where lines break so the headline isn't lopsided.

---

## `hyphens`

```css
p {
  hyphens: auto;
}
```

Long words break at hyphenation points instead of overflowing. Pair with a `lang` attribute on `<html>` so the browser uses the right hyphenation dictionary.

---

## Gradient Text

```css
.gradient-title {
  background: linear-gradient(90deg, #f97316, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

Three properties — gradient text on every modern browser.

---

## Outlined / Stroked Text

```css
.outlined {
  color: transparent;
  -webkit-text-stroke: 1px #1f2937;
}
```

Or use `text-shadow` for a knockout effect:

```css
.knockout {
  color: white;
  text-shadow:
    -1px -1px 0 #1f2937,
     1px -1px 0 #1f2937,
    -1px  1px 0 #1f2937,
     1px  1px 0 #1f2937;
}
```

---

## Word Spacing and Letter Spacing

Used to set typographic mood:

```css
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}
```

The classic "small caps" eyebrow heading you see above large hero titles.

---

## `font-variant`

```css
.numeric { font-variant-numeric: tabular-nums; }
.smallcaps { font-variant: small-caps; }
.ligatures { font-variant-ligatures: common-ligatures; }
```

`tabular-nums` aligns digits in tables and dashboards. `small-caps` gives a typographic, editorial feel.

---

## Multi-line Truncation

```css
.summary {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

Truncates after three lines with an ellipsis. The vendor prefix syntax is awkward, but it works in every modern browser.

---

## Underline Customization

```css
.fancy-link {
  text-decoration: underline;
  text-decoration-color: rgb(37 99 235 / 0.4);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
```

The default underline often runs through descenders (like the bottom of a "g"). `text-underline-offset` fixes it.

---

## Initial Letter (Drop Cap)

```css
p::first-letter {
  initial-letter: 3;       /* spans 3 lines */
  margin-right: 0.5rem;
  color: #b91c1c;
}
```

The dedicated `initial-letter` property is the cleanest way to do magazine-style drop caps. Browser support is improving but check before relying on it; the `::first-letter` + `float: left` pattern is the cross-browser fallback.

---

## A Polished Title

Pulling several techniques together:

```css
.hero-title {
  font-size: clamp(2rem, 5vw, 5rem);
  font-weight: 800;
  text-wrap: balance;
  line-height: 1.05;
  background: linear-gradient(120deg, #4338ca, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}
```

Fluid size, balanced line breaks, gradient fill, tightened letter spacing — modern, polished, in seven properties.

---

## Up Next

Now we move from static styling into **motion** — starting with **2D transforms**.
