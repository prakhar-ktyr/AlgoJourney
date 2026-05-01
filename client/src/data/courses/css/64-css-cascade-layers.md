---
title: CSS Cascade Layers
---

# CSS Cascade Layers

In a real codebase you import styles from many places — a CSS reset, a UI library, your own components, page-specific tweaks. Without organization, **specificity wars** break out: someone writes `!important` to beat a third-party selector; someone else nests four classes deep to win.

**Cascade layers** (`@layer`) solve this by giving you **explicit ordering** between groups of styles. A rule in a later layer always wins over a rule in an earlier layer — **regardless of specificity**.

---

## Defining Layers

```css
@layer reset, base, components, utilities;
```

This declares four layers in **order** — `reset` is weakest, `utilities` is strongest. **Order matters** — declare your layer order at the top of your stylesheet (or main entry).

---

## Putting Rules Into Layers

```css
@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer base {
  body { font-family: system-ui, sans-serif; line-height: 1.6; }
  a    { color: #4f46e5; }
}

@layer components {
  .button { padding: 0.5rem 1rem; border-radius: 6px; }
}

@layer utilities {
  .text-center { text-align: center; }
}
```

Now `.text-center` always wins over `.button`, even though they have the same specificity — because `utilities` was declared after `components`.

---

## The Cascade Rules (with Layers)

When two rules conflict, CSS picks the winner in this order:

1. **Importance** (`!important`)
2. **Origin** (browser, user, author)
3. **Layer order** ← *new*
4. **Specificity**
5. **Source order**

So layers are **higher priority than specificity**. A simple `.btn` in a later layer beats a deeply nested `body main .container .card .btn` in an earlier one. This is exactly the dynamic that `!important` used to enforce — except now it's clean and predictable.

> [!NOTE]
> `!important` **inverts** the layer order. Inside `@layer reset`, an `!important` rule beats `!important` rules in later layers. This sounds weird but is intentional — it lets a reset say "no, really, I mean this."

---

## Importing Stylesheets Into Layers

```css
@import url("reset.css") layer(reset);
@import url("normalize.css") layer(base);
@import url("bootstrap.css") layer(vendor);
```

Pull a third-party library into a low-priority layer, and your own styles automatically take precedence — no specificity war, no `!important`.

---

## Anonymous and Nested Layers

Layers can be unnamed (anonymous) — they get an implicit unique name:

```css
@layer { ... }
```

Useful for one-off scopes within a file.

You can also nest:

```css
@layer components {
  @layer button, card, modal;

  @layer button { .button { ... } }
  @layer card   { .card   { ... } }
}
```

The inner layers stay grouped under `components`.

---

## Unlayered Styles

Rules **not** in any layer have **higher priority** than any layered rule. So:

```css
@layer everything { .x { color: red; } }
.x { color: blue; }   /* wins — unlayered beats layered */
```

This is convenient — you can always reach in with a normal rule and override layered styles. Often you'll keep one-off page tweaks unlayered, with the bulk of your CSS in layers.

---

## A Real-World Pattern

```css
/* main.css — top of file */
@layer reset, base, components, utilities, overrides;

@import url("modern-normalize.css") layer(reset);
@import url("framework.css")        layer(components);
@import url("./tokens.css")         layer(base);
@import url("./components/*.css")   layer(components);
@import url("./utilities.css")      layer(utilities);
@import url("./overrides.css")      layer(overrides);
```

The top declaration defines the priority cascade. Each `@import` slots its file into the correct layer.

Now your project's behaviors:

- The reset never accidentally breaks your components.
- The framework can never beat your customizations.
- Utilities always win over components.
- Overrides win over everything (use sparingly).

---

## When To Reach For Layers

Consider layers when:

- You import third-party CSS and need it never to override yours.
- You have a design system + utilities + page tweaks.
- You find yourself using `!important` to win specificity battles.

For tiny projects with one stylesheet, you don't need them. For anything beyond a few hundred lines, they save real time.

---

## Browser Support

`@layer` is supported by all modern browsers. Older browsers ignore the rule entirely — which means **everything inside is also ignored**. Provide a small fallback unless you're targeting modern-only.

---

## Up Next

One more modern feature that makes CSS feel a lot more like Sass — **native nesting**.
