---
title: React Memo
---

# React Memo

Using `React.memo` can be a huge performance boost in your applications.

It is used to prevent a component from re-rendering if its props have not changed.

## The Problem

In React, when a parent component re-renders, **all of its child components re-render by default**.

This happens even if the props passed to the child component have not changed at all!

```jsx
import { useState } from "react";
import Todos from "./Todos";

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState(["todo 1", "todo 2"]);

  const increment = () => {
    setCount((c) => c + 1);
  };

  return (
    <>
      {/* 
        Even though 'todos' doesn't change when we click the button, 
        the Todos component will re-render!
      */}
      <Todos todos={todos} />
      <hr />
      <div>
        Count: {count}
        <button onClick={increment}>+</button>
      </div>
    </>
  );
};
```

If the `Todos` component is complex, re-rendering it every time the counter increments can cause performance issues.

## The Solution: `React.memo`

To fix this, you can wrap the child component export with `memo`. 

The `memo` function will memoize (cache) the rendered output of the component. Before the next render, it will check if the new props are the same as the old props. If they are the same, it skips rendering the component and reuses the cached result.

**Todos.jsx:**
```jsx
import { memo } from "react";

const Todos = ({ todos }) => {
  console.log("Todos render!");
  return (
    <>
      <h2>My Todos</h2>
      {todos.map((todo, index) => {
        return <p key={index}>{todo}</p>;
      })}
    </>
  );
};

// Wrap the export in memo()
export default memo(Todos);
```

Now, if you go back and click the increment button in the `App` component, you will notice that the `Todos` component no longer re-renders! It will only re-render if the `todos` array prop actually changes.

### Note on Objects and Functions as Props

Remember that if you pass a function or an object as a prop, they are recreated by reference on every parent render. This means `memo` will think the props *have* changed.

To solve this, you must use `useCallback` for functions and `useMemo` for objects before passing them to a memoized component.
