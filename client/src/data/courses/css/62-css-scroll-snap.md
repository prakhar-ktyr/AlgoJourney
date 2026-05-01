---
title: CSS Scroll Snap
---

# CSS Scroll Snap

Scroll snap turns a regular scrollable container into one that **snaps** to specific elements as the user scrolls — perfect for image carousels, slide decks, page-by-page reading, and product galleries.

It's two properties: one on the **container**, one on each **child**.

---

## A Minimal Carousel

```html
<div class="carousel">
  <img src="1.jpg" alt="">
  <img src="2.jpg" alt="">
  <img src="3.jpg" alt="">
</div>
```

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}

.carousel img {
  flex: 0 0 100%;
  scroll-snap-align: center;
}
```

That's it — a real, swipe-friendly carousel with no JavaScript. Works perfectly on touch.

---

## `scroll-snap-type`

Set on the **container**:

```css
scroll-snap-type: x mandatory;     /* horizontal, must snap */
scroll-snap-type: y mandatory;
scroll-snap-type: x proximity;     /* snap only when near a snap point */
scroll-snap-type: both mandatory;
scroll-snap-type: none;            /* disable */
```

- **`mandatory`** — every scroll lands on a snap point.
- **`proximity`** — gentler; snaps if the user lets go near one.

`mandatory` feels great for slideshows; `proximity` feels better for long pages with section anchors.

---

## `scroll-snap-align`

Set on **each child**:

```css
scroll-snap-align: start;     /* aligns child's start with container's start */
scroll-snap-align: center;
scroll-snap-align: end;
scroll-snap-align: none;      /* opt this child out */
```

For a full-width carousel, `center` feels most natural.

---

## `scroll-padding`

If your carousel has fixed elements at the edges (a sticky header, an inset border), `scroll-padding` adjusts the snap line:

```css
.carousel {
  scroll-padding-inline: 2rem;
}
```

Now snap points sit 2rem in from each edge — items don't get hidden under fixed UI.

---

## `scroll-snap-stop`

```css
.slide { scroll-snap-stop: always; }
```

Forces the scroll to stop at this slide rather than blowing past it. Great for important slides you don't want users to skim.

```css
.slide { scroll-snap-stop: normal; }    /* default — flicks can pass over */
```

---

## A Vertical "Page-by-Page" Reader

```css
.reader {
  height: 100dvh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.reader > section {
  height: 100dvh;
  scroll-snap-align: start;
}
```

Each section snaps fullscreen — a "magazine"-style reader.

---

## Smooth Scroll With Snap

```css
.carousel {
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
}
```

When you scroll programmatically (e.g., a "Next" button calling `element.scrollLeft += width`), the motion eases instead of jumping.

```js
nextBtn.addEventListener("click", () => {
  carousel.scrollBy({ left: carousel.clientWidth, behavior: "smooth" });
});
```

---

## A Card Carousel With Peek

A common UX trick: show **part of the next card** so users know they can scroll.

```css
.gallery {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  scroll-padding: 1rem;
  padding-inline: 1rem;
}

.gallery .card {
  flex: 0 0 80%;             /* 80% width = 20% peek */
  scroll-snap-align: start;
}
```

---

## Snap to Sections of a Long Page

```css
html {
  scroll-snap-type: y proximity;
  scroll-padding-top: 4rem;          /* offset for sticky header */
  scroll-behavior: smooth;
}

main > section {
  scroll-snap-align: start;
}
```

`proximity` is gentler — it doesn't fight users who want to scroll partway between sections.

---

## Hiding the Scrollbar (Carefully)

For carousels, you may want to hide the scrollbar:

```css
.carousel::-webkit-scrollbar { display: none; }
.carousel { scrollbar-width: none; }   /* Firefox */
```

> [!WARNING]
> Hiding the scrollbar removes a visual affordance. Make sure there's another cue (peek of next card, dots, arrows) so users know they can scroll. **Never** make the only navigation a hidden swipe — keyboard and screen-reader users need an alternative.

---

## Accessibility

Snap containers should be:
- **Keyboard-scrollable** (set `tabindex="0"` if needed)
- **Labeled** for screen readers (`aria-roledescription="carousel"`)
- **Optionally paginated** with visible buttons or dots

A sleek carousel still needs accessible controls.

---

## Up Next

Modern CSS speaks **logical properties** — `block`/`inline` instead of `top`/`left`. They make your styles RTL-friendly.
