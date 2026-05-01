---
title: React Strict Mode
---

# React Strict Mode

`StrictMode` is a tool for highlighting potential problems in an application.

Like `<Fragment>`, `<StrictMode>` does not render any visible UI. It activates additional checks and warnings for its descendants.

**Note:** Strict mode checks are run in development mode only; they do not impact the production build.

## Enabling Strict Mode

You can enable Strict Mode for any part of your application by wrapping it in `<React.StrictMode>`.

Usually, this is done at the very top level in your `main.jsx` or `index.jsx` file:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## What does Strict Mode do?

Strict Mode helps you with:

### 1. Identifying Components with Unsafe Lifecycles
Some older React class component lifecycle methods (like `componentWillMount`) are unsafe for modern async rendering. Strict Mode will warn you if you use them.

### 2. Warning about Legacy String Ref API Usage
React previously allowed you to access DOM elements via a string `ref="myInput"`. This is now deprecated in favor of `React.createRef()` or the `useRef` hook. Strict Mode will throw a warning if it detects legacy string refs.

### 3. Warning about Deprecated `findDOMNode`
`findDOMNode` used to be used to search the DOM tree for a React component. It is now deprecated, and Strict Mode will warn you about it.

### 4. Detecting Unexpected Side Effects
This is the most noticeable feature of Strict Mode!

React assumes that your render phase (including `useState` initializers, `useMemo`, and the render function itself) is **pure** (it has no side effects). 

To help you find impure functions that might cause bugs, **Strict Mode automatically calls your component's render function and state updater functions TWICE** in development.

If you have a `console.log` inside your component body, you will see it printed twice! This is intentional. It helps you catch bugs where a render function accidentally mutates external state.

```jsx
function Counter() {
  // In Strict Mode, this will print twice per render!
  console.log("Rendered!"); 
  
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 5. Ensuring reusable state
In React 18, Strict Mode does something even more intense: it mounts the component, immediately *unmounts* it, and then mounts it again on the initial load. 

This ensures that your components are resilient to being unmounted and remounted (which is important for features like Fast Refresh and concurrent rendering). It forces you to write proper cleanup functions in your `useEffect` hooks!
