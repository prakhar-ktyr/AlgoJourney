---
title: CSS Introduction
---

# CSS Introduction

CSS was created by **Håkon Wium Lie** in 1994 to bring real styling to the web. Before CSS, the only way to change how a page looked was with proprietary HTML attributes — which made redesigning a site nearly impossible.

Today, CSS is a mature, evergreen language with new features shipping every year.

---

## A Brief History of CSS

| Year | Version | Key Features |
|------|---------|-------------|
| 1996 | CSS 1 | Fonts, colors, margins, basic selectors |
| 1998 | CSS 2 | Positioning, z-index, media types |
| 2011+ | CSS 2.1 | Stable, widely-supported baseline |
| 2012+ | **CSS 3 (modular)** | Flexbox, Grid, transitions, animations, transforms, media queries, custom properties |
| Today | **Living standard** | Container queries, cascade layers, `:has()`, nesting, subgrid, color spaces |

> [!TIP]
> "CSS3" is a marketing term — modern CSS is split into dozens of independent **modules** (Color, Grid, Selectors, Animations, etc.) that evolve at their own pace.

---

## How CSS Works

When the browser loads a web page, it does roughly this:

1. **Parse the HTML** into a tree of elements (the **DOM**).
2. **Parse the CSS** into a list of style rules (the **CSSOM**).
3. **Match selectors to elements** and resolve the cascade — figuring out which rules apply to which element.
4. **Compute final styles** for every element (color, size, position, etc.).
5. **Lay out** the page — measure where each element goes.
6. **Paint** pixels to the screen.

This is called the **render pipeline**, and understanding it helps you write CSS that is both correct and fast.

---

## What CSS Can Do

Modern CSS is dramatically more powerful than people often realize:

- **Layout** — Flexbox and Grid replace the old hacks of floats and tables.
- **Animation** — Smooth transitions and keyframe animations without JavaScript.
- **Theming** — Custom properties (CSS variables) enable dark mode, design tokens, and runtime theming.
- **Responsive design** — Media queries and container queries adapt to any screen.
- **Visual effects** — Filters, blend modes, masks, and clip-paths.
- **Math** — `calc()`, `min()`, `max()`, `clamp()` for fluid, intrinsic design.
- **Logic** — `:has()` lets CSS react to descendants, no JavaScript required.

You can build entire interactive interfaces — image carousels, accordions, tooltips — with **zero** JavaScript.

---

## CSS, HTML, and JavaScript Together

A modern web page combines three languages:

```
+----------------+
|     HTML       |  <-- structure: what's on the page
+----------------+
|      CSS       |  <-- presentation: how it looks
+----------------+
|   JavaScript   |  <-- behavior: what it does
+----------------+
```

Each layer should do its own job. A button's *appearance* belongs in CSS. Its *click handler* belongs in JavaScript. Mixing them creates fragile, hard-to-maintain code.

---

## Browser Support

All modern browsers — Chrome, Firefox, Safari, Edge — implement the same core CSS standards. The classic "CSS doesn't work in Internet Explorer" era is behind us.

When you want to use a brand-new feature, check **[caniuse.com](https://caniuse.com)** to see browser coverage. For features that aren't universal yet, use a **`@supports`** query as a graceful fallback (we'll cover this later).

---

## Up Next

In the next lesson, we'll get our editor set up and write our first CSS rule.
