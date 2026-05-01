---
title: React useEffect Hook
---

# React useEffect Hook

The `useEffect` Hook allows you to perform side effects in your components.

Some examples of side effects are: fetching data from an API, directly updating the DOM, setting up subscriptions, or running timers (like `setTimeout`).

## `useEffect` Syntax

`useEffect` accepts two arguments. The second argument is optional.

`useEffect(<function>, <dependency array>)`

### Example: Running on every render

If you don't provide a dependency array, the effect runs after **every single render**.

```jsx
import { useState, useEffect } from "react";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);
  }); // No dependency array!

  return <h1>I've rendered {count} times!</h1>;
}
```
*Warning: The code above will cause an infinite loop because `setCount` triggers a re-render, and every render triggers the `useEffect`, which calls `setCount` again!*

To control when `useEffect` runs, we use the dependency array.

## The Dependency Array

You can control when an effect runs by passing an array as the second argument.

### 1. Empty Array `[]`
If you pass an empty array, the effect will only run **once**, when the component mounts (is first rendered). This is perfect for fetching initial data.

```jsx
useEffect(() => {
  // This only runs ONCE
  console.log("Component mounted!");
}, []);
```

### 2. Array with values `[prop, state]`
If you pass values into the array, the effect will run on the first render, AND anytime any of the values in the array change.

```jsx
import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [calculation, setCalculation] = useState(0);

  useEffect(() => {
    setCalculation(() => count * 2);
  }, [count]); // Only run when "count" changes

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <p>Calculation: {calculation}</p>
    </>
  );
}
```

## Effect Cleanup

Some effects require cleanup to reduce memory leaks. 

For example, if you set up an interval with `setInterval`, or attach an event listener to the window, you need to remove it when the component unmounts.

To do this, return a cleanup function from inside the `useEffect`.

```jsx
import { useState, useEffect } from "react";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer = setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);

    // This cleanup function runs right before the component unmounts,
    // OR before the effect runs again.
    return () => clearTimeout(timer);
  }, []);

  return <h1>I've rendered {count} times!</h1>;
}
```
