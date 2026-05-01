---
title: CSS Box Model
---

# CSS Box Model

Every element rendered by the browser is a **rectangular box**. That box has four layers, nested like Russian dolls. This is the **CSS box model** — and it underpins every layout decision you ever make.

---

## The Four Layers

From inside out:

```
+-------------------------------+
|         margin                |  <- transparent space outside
|  +-------------------------+  |
|  |       border            |  |  <- the line you can see
|  |  +-------------------+  |  |
|  |  |    padding        |  |  |  <- inside, takes background
|  |  |  +-------------+  |  |  |
|  |  |  |  content    |  |  |  |  <- text, image, child elements
|  |  |  +-------------+  |  |  |
|  |  +-------------------+  |  |
|  +-------------------------+  |
+-------------------------------+
```

| Layer | Property | Visible? | Background fills it? |
|-------|----------|----------|---------------------|
| Content | `width` / `height` | Yes (the actual content) | Yes |
| Padding | `padding` | No (transparent) | Yes |
| Border | `border` | Yes (the line) | — |
| Margin | `margin` | No (transparent) | No |

---

## Inspecting the Box Model

Open DevTools → Elements panel → the **Computed** tab has a clickable box-model diagram showing the four layers for the selected element. Get into the habit of looking at it whenever something doesn't size as expected.

---

## How Width Is Calculated

By default (`box-sizing: content-box`), the rendered width of a box is:

```
rendered_width = width + padding-left + padding-right + border-left + border-right
```

Margin sits *outside* this rendered box and pushes other elements away.

So:

```css
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid;
  margin: 10px;
}
```

| Layer | Size |
|-------|------|
| Content | 200 px |
| Rendered (with padding + border) | 244 px |
| Footprint (rendered + margin) | 264 px |

---

## `box-sizing: border-box` to the Rescue

`border-box` redefines `width` to mean the **rendered** box (content + padding + border). Way more intuitive:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

With this set globally:

```css
.box {
  width: 200px;     /* THIS IS the rendered width — no math required */
  padding: 20px;
  border: 2px solid;
}
```

Almost every modern stylesheet starts with this rule. We'll have a dedicated lesson on it next.

---

## Display and the Box Model

Different display types treat boxes differently:

- **Block** — width fills the parent, takes its own line, respects all box model properties.
- **Inline** — width is the content, sits on the line with text, **ignores `width`/`height` and vertical margins**.
- **Inline-block** — sits on the line like inline, but respects width, height, padding, and margin.
- **Flex / Grid items** — sized by the layout algorithm, not just by `width`/`height`.

```css
span { display: inline; }         /* width/height: ignored */
span { display: inline-block; }   /* width/height: respected */
span { display: block; }          /* takes full line */
```

---

## Margin Collapsing — Quick Recap

Two adjacent **vertical** margins on block elements collapse into one (the larger). This is part of the box model and a common source of confusion. Flexbox and Grid containers prevent collapsing — another reason modern layouts prefer them.

---

## A Full Worked Example

```html
<div class="card">
  <h3>Title</h3>
  <p>Some content...</p>
</div>
```

```css
* { box-sizing: border-box; }

.card {
  width: 320px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1rem;
  background: white;
}
```

The card is **exactly** 320px wide on screen, with a 1px border and 24px of padding inside. Margins push it 16px away from neighbors. No mental math, no surprises.

---

## Why The Box Model Matters

Almost every layout bug — "why is my element wider than I asked?", "why is there a gap?", "why isn't this centered?" — comes back to a box-model misunderstanding. Internalize this lesson and you've solved 80% of CSS frustration.

---

## Up Next

Let's go even deeper into `box-sizing` itself, because it's that important.
