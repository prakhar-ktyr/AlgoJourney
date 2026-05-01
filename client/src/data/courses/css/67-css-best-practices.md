---
title: CSS Best Practices
---

# CSS Best Practices

You've learned the language. The remaining game is **writing CSS that scales** — that you can read in six months, that a teammate can join, that doesn't slow down at 5,000 lines. This lesson collects the principles that hold up in real codebases.

---

## 1. Use a Reset (or Normalize)

Browsers come with quirky defaults — different `<button>` styles, default margins on `<body>`, inconsistent form heights. Start every project with a small reset:

```css
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

img, picture, svg, video { display: block; max-width: 100%; }

button, input, textarea, select { font: inherit; }
```

Or use the popular [`modern-normalize`](https://github.com/sindresorhus/modern-normalize) — a few hundred bytes for a clean baseline.

---

## 2. Define Design Tokens as Variables

```css
:root {
  /* Colors */
  --color-primary: #4f46e5;
  --color-text:    #111827;
  --color-bg:      #ffffff;

  /* Type */
  --font-base: system-ui, -apple-system, sans-serif;
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

  /* Space */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;

  /* Radius */
  --radius-sm: 4px;
  --radius:    8px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow:    0 4px 12px rgb(0 0 0 / 0.08);
}
```

Now every component pulls from a single source of truth. Changing the brand color is one line.

---

## 3. Mobile First, Always

```css
.card { padding: 1rem; }

@media (min-width: 768px) {
  .card { padding: 2rem; }
}
```

`min-width` queries are easier to reason about than `max-width`. Start small, scale up.

---

## 4. Prefer Modern Layout Over Hacks

| Old way | Modern way |
|---------|------------|
| `float: left` for layout | Flexbox / Grid |
| `padding-bottom` percent for ratios | `aspect-ratio` |
| Margin/transform for centering | `place-items: center` |
| 12-column frameworks | `grid-template-columns: repeat(auto-fit, minmax(...))` |
| JavaScript for sticky elements | `position: sticky` |

Modern CSS does in 3 lines what frameworks used to do in 30.

---

## 5. Keep Specificity Low and Flat

```css
/* Bad */
body main .container .card .button.primary { ... }

/* Better */
.button-primary { ... }
```

Low-specificity selectors are easy to override and easy to read. Resist the urge to "scope" by chaining.

If you need scoping, use **`@layer`** instead — it's specificity-independent.

---

## 6. Avoid `!important` (Almost Always)

`!important` is a sign of a fight. The fix is usually a different selector or — better — moving rules into the right `@layer`. Reserve `!important` for utility classes that *must* win, and label them clearly:

```css
@layer utilities {
  .hidden { display: none !important; }
}
```

---

## 7. Co-Locate Related Styles

```css
/* All of .button — variants, states, responsive — in one place */
.button {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: 6px;

  &:hover { ... }
  &:disabled { ... }
  &.is-primary { ... }
  &.is-large { ... }

  @media (min-width: 768px) { ... }
}
```

Future-you (or a teammate) finds everything about the button in one place.

---

## 8. Name Things Semantically

Class names should describe **purpose**, not appearance.

```css
/* Bad — coupled to current visuals */
.red-button { ... }
.left-column-200px { ... }

/* Better — describes intent */
.button-danger { ... }
.sidebar { ... }
```

When the design changes, you don't have to rename things.

A popular convention is **BEM** (Block / Element / Modifier):

```css
.card { ... }
.card__title { ... }
.card__body { ... }
.card--featured { ... }
```

Not the only style — but a common one if you need a convention.

---

## 9. Performance — A Few Real Wins

- **Animate cheap properties.** `transform` and `opacity` are GPU-accelerated. Avoid animating `width`, `height`, `top`, `left` — they trigger layout.
- **Avoid `box-shadow` and `filter` everywhere.** Lovely effects, but heavy if applied to hundreds of elements.
- **Don't ship unused CSS.** Production bundlers (Vite, esbuild) tree-shake when configured. Tools like PurgeCSS strip unused selectors.
- **Use `system-ui` fonts when you can.** Saves a font download (often 100+ KB).

---

## 10. Use Logical Properties for New Code

```css
margin-block: 1rem;
padding-inline: 1rem;
border-inline-start: 4px solid red;
inset: 0;
```

Same effort, RTL-ready, future-proof.

---

## 11. Respect User Preferences

Three media queries that should be in every project:

```css
@media (prefers-color-scheme: dark)   { ... }
@media (prefers-reduced-motion: reduce) { ... }
@media (prefers-contrast: more)       { ... }
```

You're respecting people, not catering to "the average user."

---

## 12. File Organization

A small project:

```
styles/
  reset.css
  tokens.css
  base.css
  components/
    button.css
    card.css
    nav.css
  utilities.css
  main.css      ← imports the above with @layer
```

A large project: probably a CSS-in-JS or component-scoped solution (CSS Modules, Tailwind, Sass) + design tokens. The structure changes; the principles don't.

---

## 13. Debug With DevTools

The browser is your best CSS teacher:

- **Computed tab** — see the final value of every property.
- **Layout tab** — visualize Flexbox and Grid (badges next to elements, overlay).
- **`outline: 1px solid red`** — quick "where is this?" trick.
- **`* { outline: 1px solid rgba(255,0,0,0.2); }`** — see your whole layout structure at once.
- **Disable a rule** by clicking the checkbox. Faster than commenting out.

---

## 14. Validate, Lint, Format

- **Stylelint** catches errors and enforces conventions.
- **Prettier** auto-formats.
- **Browser DevTools** show invalid properties as struck-through — easy to spot typos.

A consistent codebase is a kind codebase.

---

## You're Ready

You started with the basics — selectors, the box model, color. You ended with cascade layers, container queries, and accessibility-driven design. CSS is **deep**, but you now know enough to build modern, responsive, beautiful, and accessible interfaces from scratch.

The rest is practice. Open a blank file and rebuild a website you love. Read other people's CSS — every site is a free tutorial. Subscribe to **CSS-Tricks**, **MDN**, **web.dev**. Try a CodePen challenge a week.

> [!TIP]
> The best way to *really* learn CSS: build, break, inspect in DevTools, fix. Repeat. There's no other way.

---

## Up Next

You've finished the course. Try building one of these projects to apply what you've learned:

1. **A personal portfolio site** — semantic HTML, dark mode, container queries, smooth scroll.
2. **A pricing page** — responsive grid, hover effects, animated CTAs.
3. **A dashboard** — Grid layout, sticky sidebar, scroll snap for tabs.
4. **A blog post page** — beautiful typography, fluid sizing, print stylesheet.
5. **A photo gallery** — auto-fit grid, scroll snap, lightbox modal.

Welcome to writing modern CSS.
