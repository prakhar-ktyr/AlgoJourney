---
title: React Render HTML
---

# React Render HTML

React's goal is in many ways to render HTML in a web page.

React renders HTML to the web page by using a function called `createRoot()` and its `render()` method.

## The createRoot Function

The `createRoot()` function takes one argument, an HTML element, and creates a React root.

The purpose of the function is to define the HTML element where a React component should be displayed.

## The render Method

The `render()` method is then called on the root to display the React component inside the designated HTML element.

Let's look at an example. Open the `main.jsx` (or `index.jsx`) file in your Vite/React project. You will see something like this:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Find the root element in index.html
const rootElement = document.getElementById('root');

// 2. Create a React root
const root = ReactDOM.createRoot(rootElement);

// 3. Render the App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Explanation:

1. **`document.getElementById('root')`**: This targets an element in your `index.html` file (usually `<div id="root"></div>`).
2. **`createRoot`**: This creates the foundation for your React application inside that `div`.
3. **`root.render()`**: This takes your React element (in this case, `<App />`) and inserts it into the root.

## The Root Node

If you look inside your `index.html` file in the project folder, you will see a `<div>` element with the id `"root"`.

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

This is called the **"root" DOM node** because everything inside it will be managed by React DOM.

Applications built with just React usually have a single root DOM node. If you are integrating React into an existing app, you might have as many isolated root DOM nodes as you like.

## Rendering a Simple Element

You don't always have to render a full component like `<App />`. You can render simple HTML elements directly!

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<p>Hello, this is a simple paragraph rendered by React!</p>);
```

If you change your `main.jsx` to the code above and save it, you will see a simple paragraph on your screen instead of the default React app structure.

In the next lesson, we will learn about **JSX**, the syntax that allows us to write HTML directly inside JavaScript code!
