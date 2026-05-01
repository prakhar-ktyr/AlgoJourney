---
title: CSS Lists
---

# CSS Lists

HTML gives us three list elements:

```html
<ul> ... </ul>   <!-- unordered: bullet markers -->
<ol> ... </ol>   <!-- ordered: number markers -->
<dl> ... </dl>   <!-- description list -->
```

CSS lets you customize the markers, change their position, replace them with images, or remove them entirely.

---

## `list-style-type`

What kind of marker to show:

```css
ul { list-style-type: disc;    }   /* default for ul */
ul { list-style-type: circle;  }
ul { list-style-type: square;  }
ul { list-style-type: none;    }   /* no marker at all */

ol { list-style-type: decimal;        }   /* default for ol */
ol { list-style-type: decimal-leading-zero; }
ol { list-style-type: lower-alpha;    }   /* a, b, c */
ol { list-style-type: upper-roman;    }   /* I, II, III */
```

There are dozens more (`georgian`, `armenian`, `cjk-ideographic`...). See the [full list-style-type list](https://developer.mozilla.org/docs/Web/CSS/list-style-type).

---

## `list-style-position`

Whether the marker is inside or outside the content box:

```css
list-style-position: outside;   /* default — marker hangs outside text */
list-style-position: inside;    /* marker flows with the first line */
```

`inside` is occasionally useful when you want text to wrap *under* the marker.

---

## `list-style-image`

Use a custom image as the bullet:

```css
ul {
  list-style-image: url("check.svg");
}
```

Limited control over size and position. Most designers prefer the **pseudo-element** approach below.

---

## The `list-style` Shorthand

```css
ul {
  list-style: square inside url("dash.svg");
  /*          type   position image */
}
```

A common pattern — strip the marker entirely:

```css
ul.unstyled { list-style: none; padding: 0; }
```

---

## Custom Markers with `::marker`

`::marker` is a real pseudo-element. You can style it directly:

```css
li::marker {
  color: #2563eb;
  font-weight: bold;
}
```

You can even use `content`:

```css
ol li::marker {
  content: counter(list-item) " — ";
  color: #6b7280;
}
```

---

## Replacing Markers with Pseudo-Elements

For full design control, hide the default marker and draw your own:

```css
ul.checklist {
  list-style: none;
  padding-left: 0;
}

ul.checklist li {
  position: relative;
  padding-left: 1.75rem;
}

ul.checklist li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: bold;
}
```

A clean checklist with green check marks, in pure CSS.

---

## Removing Default Padding

Browsers add hefty `padding-left` to lists. When you remove markers, remove the padding too:

```css
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

This is the standard prep for using a `<ul>` as a navigation menu.

---

## Description Lists (`<dl>`)

Used for term/definition pairs:

```html
<dl>
  <dt>HTML</dt>
  <dd>Markup language for the web.</dd>
  <dt>CSS</dt>
  <dd>Style language for the web.</dd>
</dl>
```

```css
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; }
dt { font-weight: 600; }
dd { margin: 0; }
```

A two-column term/definition layout — perfect for glossaries, specs, settings.

---

## Lists in Navigation

Real-world example: a horizontal nav bar from a `<ul>`:

```html
<nav>
  <ul class="nav">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

```css
.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.nav a {
  display: block;
  padding: 0.5rem 1rem;
  color: #1f2937;
  text-decoration: none;
  border-radius: 4px;
}

.nav a:hover { background: #f3f4f6; }
```

---

## Up Next

Lists handled. Up next: **tables**, where CSS goes from a few rules to a whole system of layout, borders, and styling.
