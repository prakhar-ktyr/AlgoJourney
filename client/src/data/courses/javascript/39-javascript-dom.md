---
title: JavaScript DOM
---

# JavaScript DOM

The **Document Object Model** (DOM) is the browser's in-memory representation of a web page. JavaScript reads and changes the DOM to make pages interactive.

This lesson is browser-only. Run examples by opening any web page, pressing **F12**, and pasting into the Console.

## The big picture

When the browser loads HTML, it builds a tree of nodes:

```
document
└── html
    ├── head
    │   └── title
    └── body
        ├── h1
        └── div
            └── p
```

`document` is the root. Every tag is an **element**; text inside is a **text node**.

## Selecting elements

Modern code uses two selectors most:

```javascript
document.querySelector("h1");          // first match (or null)
document.querySelectorAll(".item");    // all matches as a NodeList

document.querySelector("#main-form input[name='email']"); // CSS selectors work
```

Older single-purpose methods still work and are slightly faster:

```javascript
document.getElementById("logo");
document.getElementsByClassName("item");
document.getElementsByTagName("p");
```

`querySelectorAll` returns a static `NodeList`. The `getElementsBy…` family returns a *live* `HTMLCollection` that updates as the DOM changes — usually surprising.

## Reading and changing content

```javascript
const h1 = document.querySelector("h1");

h1.textContent;       // current text (no HTML)
h1.textContent = "Hi"; // safe — sets text only

h1.innerHTML;         // HTML markup as a string
h1.innerHTML = "<em>Hi</em>"; // ⚠️ parses HTML — XSS risk if input is user-supplied
```

**Rule:** use `textContent` for any user-supplied or unverified data. Use `innerHTML` only for HTML you wrote yourself.

## Attributes vs properties

HTML attributes (the strings in your markup) and DOM properties (the live values) overlap but are different things.

```javascript
const link = document.querySelector("a");

link.getAttribute("href"); // exactly what's in the HTML
link.href;                  // resolved absolute URL

link.setAttribute("data-foo", "1");
link.removeAttribute("data-foo");
link.hasAttribute("data-foo");

// Boolean attributes
input.checked = true;       // property
input.hasAttribute("checked"); // false until set in HTML
```

`data-*` attributes are exposed via the `dataset` property (camel-cased):

```html
<div data-user-id="42"></div>
```

```javascript
div.dataset.userId; // "42"
div.dataset.userId = "100";
```

## Classes and styles

```javascript
el.classList.add("active");
el.classList.remove("hidden");
el.classList.toggle("open");
el.classList.contains("active");
el.classList.replace("old", "new");

el.style.color = "red";
el.style.backgroundColor = "yellow";   // camelCase JS property
el.style.setProperty("--theme", "dark"); // CSS custom property
```

Prefer **toggling classes** over inline styles — keeps styling in CSS where it belongs.

## Creating and inserting elements

```javascript
const li = document.createElement("li");
li.textContent = "New item";
li.classList.add("item");

const list = document.querySelector("ul");

list.append(li);          // at the end (best modern API)
list.prepend(li);         // at the start
list.before(li);          // sibling — before <ul>
list.after(li);           // sibling — after <ul>

li.replaceWith(otherEl);  // swap
li.remove();              // delete
```

`append`, `prepend`, `before`, `after` accept multiple arguments (elements **or strings**):

```javascript
li.append("Plain ", document.createElement("br"), "text");
```

## Building larger fragments efficiently

Manipulating the live DOM many times triggers many reflows. Build up a `DocumentFragment` first:

```javascript
const frag = document.createDocumentFragment();
for (const name of items) {
  const li = document.createElement("li");
  li.textContent = name;
  frag.append(li);
}
list.append(frag); // one paint, not N
```

For bulk HTML, `insertAdjacentHTML` is faster than `innerHTML +=`:

```javascript
list.insertAdjacentHTML("beforeend", `<li>One</li><li>Two</li>`);
```

(Same XSS warning — never with user input.)

## Traversal

```javascript
el.parentElement;
el.children;          // HTMLCollection of element children
el.childNodes;        // includes text nodes (often unwanted)
el.firstElementChild;
el.lastElementChild;
el.nextElementSibling;
el.previousElementSibling;

el.closest(".card");  // walk up until a matching ancestor
el.matches(".active"); // does THIS element match the selector?
```

`closest` and `matches` are the most useful — perfect for delegated event handlers.

## Layout, position, size

```javascript
el.getBoundingClientRect();
// { x, y, width, height, top, right, bottom, left }
// — coordinates relative to the viewport

el.offsetWidth;   // including padding + border
el.clientWidth;   // including padding, NOT border
el.scrollWidth;   // total scrollable width

window.innerWidth;
window.scrollY;
window.scrollTo({ top: 0, behavior: "smooth" });
```

For animations and layout-dependent measurements, request a frame:

```javascript
requestAnimationFrame(() => {
  // measure / mutate after the next paint
});
```

## Forms and inputs

```javascript
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  for (const [key, value] of data) console.log(key, value);
  // or:
  const obj = Object.fromEntries(data);
});

const input = document.querySelector("input[name=email]");
input.value;
input.value = "ada@b.com";
input.focus();
input.select();
```

`FormData` is the cleanest way to read every field, including files.

## Watching for changes

```javascript
// Element appears in viewport
new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) loadMore();
}).observe(sentinel);

// Element resizes
new ResizeObserver(() => relayout()).observe(card);

// DOM tree mutates
new MutationObserver(() => sync()).observe(container, { childList: true, subtree: true });
```

These are the modern, performant alternatives to `setInterval` polling.

## DOM in numbers

A short cheat sheet:

| Need                              | API                            |
| --------------------------------- | ------------------------------ |
| Find one element                  | `querySelector`                |
| Find many                         | `querySelectorAll`             |
| Find by id (fast)                 | `getElementById`               |
| Make an element                   | `document.createElement`       |
| Insert                            | `append` / `prepend` / `before` / `after` |
| Remove                            | `el.remove()`                  |
| Class                             | `classList.add/remove/toggle`  |
| Walk up                           | `el.closest(selector)`         |
| Read text safely                  | `textContent`                  |
| Read/write data attribute         | `dataset.foo`                  |

## Frameworks

Direct DOM code is fine for small apps and learning. For anything larger, **React**, **Vue**, **Svelte**, **Lit**, etc. handle the imperative bookkeeping for you. They all sit on top of these same APIs — the lessons here are the foundation.

## Next step

Pages are interactive only when JavaScript reacts to user input. On to events.
