---
title: CSS Links
---

# CSS Links

Links are interactive — they have **states** the user can be in (idle, hovering, focused, clicked, visited). CSS gives you a pseudo-class for each one.

---

## Default Link Styles

Out of the box, browsers render `<a>` tags as **blue underlined** text, with **purple** for visited links and a **dotted/solid focus ring** when tabbed to. This is fine for documents but most designers customize it.

---

## The Four Link States

```css
a:link    { color: #2563eb; }      /* unvisited */
a:visited { color: #7c3aed; }      /* visited */
a:hover   { color: #1d4ed8; }      /* mouse over */
a:active  { color: #b91c1c; }      /* being clicked */
```

Order matters. Use the mnemonic **"LoVe HAte"** — `:link`, `:visited`, `:hover`, `:active`. Each later state overrides the earlier ones at the same specificity.

In modern designs people often skip `:link`/`:visited` and just style `a` directly:

```css
a {
  color: #2563eb;
  text-decoration: underline;
}
a:hover { color: #1d4ed8; }
```

---

## Privacy Restrictions on `:visited`

Browsers limit which properties you can change on `:visited`:

- `color`, `background-color`, `border-color`, `outline-color` — allowed.
- Almost everything else (size, font, position) — silently ignored.

This prevents websites from probing your browsing history via getComputedStyle. So:

```css
a:visited { color: purple; }      /* ✅ works */
a:visited { font-weight: bold; }  /* ❌ ignored */
```

---

## Removing the Underline (Carefully)

```css
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

Two warnings:
1. **Removing underlines hurts accessibility** for users with low color vision who can't perceive the color difference. If you remove them, ensure links are obviously distinct in some other way (background, weight, icon).
2. Users **expect** in-text links to be underlined. Saving the underline for hover only is fine for navigation menus, not for body prose.

---

## Modern Underline Styling

```css
a {
  color: #2563eb;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: rgb(37 99 235 / 0.4);
  transition: text-decoration-color 0.15s;
}

a:hover {
  text-decoration-color: rgb(37 99 235 / 1);
}
```

Subtle, professional, accessible.

---

## Focus Rings

**Always** keep a visible focus indicator. The cleanest pattern:

```css
a:focus { outline: none; }   /* hide for mouse */
a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
  border-radius: 2px;
}
```

---

## Styling Specific Kinds of Links

```css
/* External links — add a small arrow */
a[href^="http"]::after {
  content: " ↗";
  font-size: 0.85em;
}

/* Email links */
a[href^="mailto:"]::before {
  content: "✉ ";
}

/* Download links */
a[download]::before {
  content: "⤓ ";
}
```

---

## Buttons That Look Like Links — and Vice Versa

Use the **right HTML** first:
- A link **navigates** (changes URL or jumps within the page) — use `<a>`.
- A button **performs an action** (submits, toggles, opens a modal) — use `<button>`.

Then style. A "button-shaped link" is fine:

```html
<a class="button" href="/signup">Sign up</a>
```

```css
.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}
```

---

## Up Next

Links done. Time to format **lists** — bullets, numbers, custom markers.
