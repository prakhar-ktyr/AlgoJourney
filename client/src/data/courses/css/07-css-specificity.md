---
title: CSS Specificity
---

# CSS Specificity

When **two rules target the same element** and set the **same property** to **different values**, the browser must decide which one wins. That decision is governed by three things, in order:

1. **Origin and importance** — where the rule comes from
2. **Specificity** — how *specific* the selector is
3. **Source order** — which rule appears later in the CSS

This lesson is about #2 — the most misunderstood part of the cascade.

---

## What Is Specificity?

Specificity is a **score** the browser calculates for every selector. Higher score wins. Score is written as four numbers: `(a, b, c, d)`.

| Position | Counts |
|----------|--------|
| **a** | Inline styles (`style="..."`) |
| **b** | IDs (`#header`) |
| **c** | Classes, attributes, pseudo-classes (`.btn`, `[type=email]`, `:hover`) |
| **d** | Elements and pseudo-elements (`p`, `::before`) |

Higher columns dominate lower ones — `(0,1,0,0)` (one ID) beats `(0,0,10,0)` (ten classes).

---

## Worked Examples

| Selector | Specificity |
|----------|-------------|
| `p` | (0, 0, 0, 1) |
| `.intro` | (0, 0, 1, 0) |
| `#main` | (0, 1, 0, 0) |
| `ul li` | (0, 0, 0, 2) |
| `nav ul.menu li a:hover` | (0, 0, 2, 4) |
| `#main .post .title` | (0, 1, 2, 0) |
| `style="..."` | (1, 0, 0, 0) |

---

## A Concrete Case

```html
<p id="lead" class="intro">Hello</p>
```

```css
p          { color: black; }   /* (0,0,0,1) */
.intro     { color: blue;  }   /* (0,0,1,0) -- wins over p */
#lead      { color: green; }   /* (0,1,0,0) -- wins over .intro */
```

The text is **green**. The ID has the highest specificity, so its `color` wins.

---

## When Specificity Ties

If two rules have the **same** specificity, the one that appears **later in the source** wins:

```css
.btn { background: blue; }
.btn { background: red; }   /* wins — same specificity, later */
```

This is also why the order of `<link>` tags in your HTML matters.

---

## The `!important` Escape Hatch

Adding `!important` to a declaration boosts it above any normal rule, regardless of specificity:

```css
p { color: red !important; }
```

> [!WARNING]
> `!important` is almost always the wrong tool. It signals you've lost control of the cascade. Once you ship one `!important`, the only way to override it is with another `!important` — and the war escalates.
>
> Legitimate uses: utility classes (`.hidden { display: none !important; }`) and overriding stubborn third-party CSS.

---

## Why You Should Avoid IDs in CSS

Look at this realistic situation:

```css
#sidebar .link { color: blue; }   /* (0,1,1,0) */

/* Now you want all links blue inside ".dark-theme":  */
.dark-theme .link { color: white; }   /* (0,0,2,0) — LOSES */
```

The first rule wins because of the ID, even though the second is more recent and arguably more important. To fix it you'd need an ID, or `!important`, or a more convoluted selector.

**Solution**: don't put IDs in your CSS in the first place. Use classes.

---

## Keep Specificity Flat

Healthy CSS keeps **most selectors at the same low specificity** — usually a single class. This makes overriding predictable.

Bad:
```css
header nav ul li a.button.primary { ... }   /* (0,0,3,5) */
```

Good:
```css
.button-primary { ... }   /* (0,0,1,0) */
```

The second is shorter, faster, and easy to override.

---

## The Cascade in One Sentence

> The browser picks the rule with the highest **origin/importance**, breaking ties with **specificity**, and final ties with **source order**.

Memorize this — it's the foundation of every "why isn't my CSS applying?" debugging session.

---

## Up Next

Now that you understand selectors and specificity, let's look at the small but useful subject of **CSS comments** — and then move into the visual properties.
