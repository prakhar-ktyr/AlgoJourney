---
title: React Fragments
---

# React Fragments

React requires that a component must return a **single parent element**. 

This can be frustrating when you want to return multiple sibling elements, like a list of table columns or list items.

To group multiple elements, we used to have to wrap them in an extra `<div>`. But this adds unnecessary nodes to the DOM and can break HTML layouts (like CSS Grid or Flexbox, or HTML `<table>` structures).

The solution to this is **React Fragments**.

## The Problem: Extra Divs

Suppose you have a `Table` component and a `Columns` component.

```jsx
function Columns() {
  return (
    <div>
      <td>Hello</td>
      <td>World</td>
    </div>
  );
}

function Table() {
  return (
    <table>
      <tbody>
        <tr>
          <Columns />
        </tr>
      </tbody>
    </table>
  );
}
```

This will result in invalid HTML because a `<div>` cannot be a direct child of a `<tr>`:

```html
<table>
  <tbody>
    <tr>
      <!-- This div breaks the table! -->
      <div>
        <td>Hello</td>
        <td>World</td>
      </div>
    </tr>
  </tbody>
</table>
```

## The Solution: `<React.Fragment>`

A Fragment looks like an empty HTML tag: `<React.Fragment>`. It lets you group a list of children without adding an extra node to the DOM.

```jsx
import React from 'react';

function Columns() {
  return (
    <React.Fragment>
      <td>Hello</td>
      <td>World</td>
    </React.Fragment>
  );
}
```

Now the HTML output is perfectly valid:

```html
<table>
  <tbody>
    <tr>
      <td>Hello</td>
      <td>World</td>
    </tr>
  </tbody>
</table>
```

## The Short Syntax `<>`

Typing `<React.Fragment>` everywhere is tedious. React provides a new, shorter syntax for declaring fragments: empty tags `<>` and `</>`.

```jsx
function Columns() {
  return (
    <>
      <td>Hello</td>
      <td>World</td>
    </>
  );
}
```

You can use `<></>` the same way you'd use any other element except that it doesn't support keys or attributes.

## Keyed Fragments

There is one scenario where you must use the explicit `<React.Fragment>` syntax instead of the short `<></>` syntax: **when looping and returning a fragment that needs a `key` prop.**

If you are mapping over an array and returning multiple elements, React requires a `key` on the outer element.

```jsx
function Glossary(props) {
  return (
    <dl>
      {props.items.map(item => (
        // Without the 'key', React will trigger a warning
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
```

*(Note: `key` is the only attribute that can be passed to `<React.Fragment>`. Event handlers or CSS classes cannot be passed.)*
