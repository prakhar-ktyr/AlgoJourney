---
title: React JSX
---

# React JSX

JSX stands for **JavaScript XML**.

JSX allows us to write HTML directly within JavaScript, making it much easier to write and add HTML in React.

## Coding without JSX

To understand the benefits of JSX, let's look at how we would write React without it.

Without JSX, you have to use the `React.createElement()` function to create elements.

**Example without JSX:**
```javascript
const myElement = React.createElement('h1', {}, 'I do not use JSX!');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(myElement);
```

As you can see, writing complex HTML structures with `React.createElement()` would quickly become tedious and hard to read.

## Coding with JSX

JSX allows us to write standard HTML tags right inside our JavaScript code.

**Example with JSX:**
```jsx
const myElement = <h1>I Love JSX!</h1>;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(myElement);
```

JSX makes the code much simpler and more intuitive, bridging the gap between markup and logic.

## Expressions in JSX

With JSX, you can write JavaScript expressions inside curly braces `{}`.

The expression can be a React variable, property, or any other valid JavaScript expression (like operations, function calls, or ternary statements).

**Example:**
```jsx
const name = "Josh";
const myElement = <h1>React is {5 + 5} times better with {name}</h1>;
```

When React renders `myElement`, it will output:
`<h1>React is 10 times better with Josh</h1>`

## Inserting a Large Block of HTML

If you want to write multiple lines of HTML, put the HTML inside parentheses `()`.

**Example:**
```jsx
const myElement = (
  <ul>
    <li>Apples</li>
    <li>Bananas</li>
    <li>Cherries</li>
  </ul>
);
```

## JSX Rules

There are a few important rules to remember when using JSX:

### 1. Return a Single Top-Level Element
The HTML you write must be wrapped in ONE single top-level element.

**WRONG:**
```jsx
const myElement = (
  <h1>Welcome to React</h1>
  <p>This will cause an error.</p>
);
```

**CORRECT:**
```jsx
const myElement = (
  <div>
    <h1>Welcome to React</h1>
    <p>This works perfectly.</p>
  </div>
);
```

*(Note: You can also use a "Fragment" `<>` `</>` to wrap elements without adding an extra node to the DOM!)*

### 2. Elements Must be Closed
In JSX, all tags must be closed, even empty ones like `<img>` or `<input>`.

**WRONG:**
```jsx
const myElement = <input type="text">;
```

**CORRECT:**
```jsx
const myElement = <input type="text" />;
```

### 3. Attribute `class` becomes `className`
Because `class` is a reserved keyword in JavaScript (used for defining ES6 classes), you must use `className` instead when you want to add CSS classes in JSX.

```jsx
const myElement = <h1 className="myclass">Hello World</h1>;
```

React will automatically translate `className` back to `class` when it renders the DOM.
