---
title: React useCallback Hook
---

# React useCallback Hook

The React `useCallback` Hook returns a memoized callback function.

Think of memoization as caching a value so that it does not need to be recalculated. This allows us to isolate resource-intensive functions so that they will not automatically run on every render.

The `useCallback` Hook only runs when one of its dependencies update.

## The Problem

One reason to use `useCallback` is to prevent a component from re-rendering unless its props have changed.

In React, every time a component re-renders, its functions get recreated. This means that if a parent component passes a function to a child component, the child will re-render every time the parent renders, *even if you wrapped the child in `React.memo`*.

```jsx
import { useState } from "react";
import Todos from "./Todos";

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  // Every time 'count' changes, App re-renders.
  // When App re-renders, 'addTodo' is completely recreated in memory.
  const addTodo = () => {
    setTodos((t) => [...t, "New Todo"]);
  };

  return (
    <>
      <Todos todos={todos} addTodo={addTodo} />
      <hr />
      <div>
        Count: {count}
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
    </>
  );
};
```
Even if `Todos` is a memoized component, it will re-render when `count` changes because the `addTodo` function is seen as a new prop.

## The Solution: `useCallback`

To fix this, we can wrap the `addTodo` function in the `useCallback` Hook. This ensures the function is only recreated if its dependencies change.

```jsx
import { useState, useCallback } from "react";
import Todos from "./Todos";

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  // By wrapping it in useCallback, the function is memoized.
  // Because the dependency array is empty [], it will never be recreated.
  const addTodo = useCallback(() => {
    setTodos((t) => [...t, "New Todo"]);
  }, []);

  return (
    <>
      <Todos todos={todos} addTodo={addTodo} />
      <hr />
      <div>
        Count: {count}
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
    </>
  );
};
```

Now, clicking the counter button will not trigger a re-render of the `Todos` component, which can vastly improve performance in large applications!
