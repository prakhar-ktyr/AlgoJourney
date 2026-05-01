---
title: JavaScript Events
---

# JavaScript Events

An **event** is a notification that something happened — a click, a key press, a form submission, a network response. JavaScript attaches functions ("listeners") to react.

## Adding a listener

```javascript
const button = document.querySelector("button");

button.addEventListener("click", (event) => {
  console.log("clicked!", event);
});
```

`addEventListener(type, callback, options?)` is the standard API. Use it instead of the legacy `onclick = ...` form because:

- Multiple listeners can stack on one element.
- Removal is explicit.
- `options` give you fine control.

## Removing a listener

You must pass the **same function reference** you added:

```javascript
function handle(e) { /* ... */ }

button.addEventListener("click", handle);
button.removeEventListener("click", handle);
```

A common pitfall: passing an arrow function inline means you can never remove it.

```javascript
button.addEventListener("click", () => doStuff());
// no way to remove this listener — the function reference is gone
```

## The event object

Every listener receives an `Event` (or a subclass). Useful properties:

```javascript
event.type;            // "click", "keydown", ...
event.target;          // the element that triggered the event
event.currentTarget;   // the element the listener is attached to (often the same)
event.preventDefault();// cancel the default action (e.g. form submit, link nav)
event.stopPropagation(); // stop bubbling up (use sparingly)
```

For specific events you get extra fields:

```javascript
// Mouse
event.clientX; event.clientY;       // viewport coords
event.button;                       // 0 = left, 1 = middle, 2 = right
event.shiftKey; event.ctrlKey; event.metaKey; event.altKey;

// Keyboard
event.key;        // "a", "Enter", "ArrowLeft", " " (space)
event.code;       // "KeyA", "Enter", "ArrowLeft", "Space" (physical key)
event.repeat;     // held down

// Form / input
event.target.value;
new FormData(event.target);
```

## Common events

| Category   | Events                                                        |
| ---------- | ------------------------------------------------------------- |
| Mouse      | `click`, `dblclick`, `mousedown`/`up`/`move`, `contextmenu`   |
| Keyboard   | `keydown`, `keyup`                                            |
| Form       | `submit`, `reset`, `input`, `change`, `focus`, `blur`         |
| Touch      | `touchstart`, `touchmove`, `touchend`                         |
| Pointer    | `pointerdown`/`up`/`move` — unifies mouse, touch, pen         |
| Window     | `load`, `DOMContentLoaded`, `resize`, `scroll`, `beforeunload`|
| Media      | `play`, `pause`, `ended`, `timeupdate`                        |
| Network    | `online`, `offline`                                           |

## Bubbling and capturing

Events fire in three phases:

1. **Capture** — from `window` down to the target.
2. **Target** — at the element itself.
3. **Bubble** — back up to `window`.

By default, listeners run in the bubble phase. Pass `{ capture: true }` to listen earlier:

```javascript
parent.addEventListener("click", (e) => console.log("parent"), { capture: true });
child.addEventListener("click", (e) => console.log("child"));

// Output when you click child: "parent" then "child"
```

`event.stopPropagation()` cancels further travel. Use it carefully — other listeners (analytics, modals, frameworks) may rely on bubbling.

## Event delegation

Instead of attaching a listener to every list item, attach **one** to the parent. Use `event.target.closest(...)` to find what matched:

```javascript
list.addEventListener("click", (e) => {
  const item = e.target.closest("li.item");
  if (!item) return;
  console.log("clicked item", item.dataset.id);
});
```

Benefits:

- Works for items added later.
- Far less memory for large lists.
- One handler to update.

## Once-only listeners

```javascript
button.addEventListener("click", handle, { once: true });
```

The listener is removed automatically after it fires. Cleaner than calling `removeEventListener` from inside the handler.

## Passive listeners

For `scroll`, `wheel`, `touchstart`, `touchmove` — telling the browser you won't `preventDefault()` lets it scroll smoothly without waiting for your code:

```javascript
window.addEventListener("scroll", onScroll, { passive: true });
```

Modern browsers default to passive for these events, but it's good to be explicit.

## `AbortController` for cleanup

Pass a `signal` to remove a listener (and many others) at once — perfect for component unmount:

```javascript
const ctrl = new AbortController();
const { signal } = ctrl;

button.addEventListener("click", h1, { signal });
window.addEventListener("resize", h2, { signal });

ctrl.abort(); // both listeners gone
```

## Custom events

Create your own events to communicate between components:

```javascript
const evt = new CustomEvent("user:login", { detail: { id: 42 } });
window.dispatchEvent(evt);

window.addEventListener("user:login", (e) => {
  console.log("user", e.detail.id, "logged in");
});
```

This is how lightweight "pub/sub" communication works without a framework.

## Throttling and debouncing

Some events fire dozens of times per second (`scroll`, `mousemove`, `input`). Don't run heavy logic each time.

```javascript
function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

input.addEventListener("input", debounce((e) => search(e.target.value), 300));

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

window.addEventListener("scroll", throttle(updateNav, 100));
```

## A real example: a delegated todo list

```javascript
list.addEventListener("click", (e) => {
  const item = e.target.closest("li[data-id]");
  if (!item) return;

  if (e.target.matches(".delete")) {
    item.remove();
  } else if (e.target.matches(".toggle")) {
    item.classList.toggle("done");
  }
});
```

One listener handles every button in every row, even rows added later.

## Next step

Browser apps often need to remember things across page loads. Up next: storage APIs.
