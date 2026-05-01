---
title: React useRef Hook
---

# React useRef Hook

The `useRef` Hook allows you to persist values between renders.

It can be used to store a mutable value that does **not** cause a re-render when updated. 
It can also be used to access a DOM element directly.

## 1. Persisting Values (Without Re-rendering)

If we tried to count how many times our application renders using the `useState` Hook, we would get caught in an infinite loop (because updating state triggers a render, which updates state, etc.).

`useRef()` returns an object with a single property: `current`. We can mutate `.current` directly, and it will NOT trigger a component re-render.

```jsx
import { useState, useEffect, useRef } from "react";

function App() {
  const [inputValue, setInputValue] = useState("");
  // 1. Initialize ref
  const renderCount = useRef(0);

  useEffect(() => {
    // 2. Mutate ref.current (does not cause re-render!)
    renderCount.current = renderCount.current + 1;
  });

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <h1>Render Count: {renderCount.current}</h1>
    </>
  );
}
```

## 2. Accessing DOM Elements

In React, we usually let the framework handle all DOM manipulation (via JSX). But sometimes, you need to grab an actual HTML element to do something specific, like managing focus, text selection, or triggering animations.

You can do this using the `ref` attribute along with `useRef`.

```jsx
import { useRef } from "react";

function App() {
  // Create the ref
  const inputElement = useRef(null);

  const focusInput = () => {
    // Access the raw DOM node and call focus() on it
    inputElement.current.focus();
  };

  return (
    <>
      {/* Attach the ref to the element */}
      <input type="text" ref={inputElement} />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
```

## 3. Tracking Previous State

Because `useRef` persists data between renders and updating it doesn't trigger a render, we can use it to keep track of previous state values.

```jsx
import { useState, useEffect, useRef } from "react";

function App() {
  const [inputValue, setInputValue] = useState("");
  const previousInputValue = useRef("");

  useEffect(() => {
    // This runs AFTER the render, so it saves the current value
    // as the "previous" value for the NEXT render.
    previousInputValue.current = inputValue;
  }, [inputValue]);

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <h2>Current Value: {inputValue}</h2>
      <h2>Previous Value: {previousInputValue.current}</h2>
    </>
  );
}
```

In summary, use `useState` when you want the UI to update visually when data changes. Use `useRef` when you want to keep track of a value without causing visual updates, or when you need direct access to a DOM node.
