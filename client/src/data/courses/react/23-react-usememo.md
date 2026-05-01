---
title: React useMemo Hook
---

# React useMemo Hook

The React `useMemo` Hook returns a memoized value.

While `useCallback` memoizes a *function*, `useMemo` memoizes the *result* of a function. 

This can improve performance by preventing expensive calculations from running on every render. The `useMemo` Hook only runs when one of its dependencies update.

## The Problem

Let's imagine we have an expensive calculation that takes a long time to run.

If we place this calculation inside a component, it will run *every time* the component re-renders.

```jsx
import { useState } from "react";

const expensiveCalculation = (num) => {
  console.log("Calculating...");
  for (let i = 0; i < 1000000000; i++) {
    num += 1;
  }
  return num;
};

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  // This will delay the render of the entire component!
  const calculation = expensiveCalculation(count);

  const addTodo = () => {
    setTodos((t) => [...t, "New Todo"]);
  };

  return (
    <div>
      <div>
        <h2>My Todos</h2>
        {todos.map((todo, index) => {
          return <p key={index}>{todo}</p>;
        })}
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <hr />
      <div>
        Count: {count}
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        <h2>Expensive Calculation</h2>
        {calculation}
      </div>
    </div>
  );
};
```

If you click "Add Todo", you will notice a severe lag. Even though adding a todo has nothing to do with the expensive calculation, the component re-renders, and the expensive calculation runs again!

## The Solution: `useMemo`

To fix this performance issue, we can use the `useMemo` Hook to memoize the calculation function.

We will wrap the expensive function call inside `useMemo` and provide `count` as a dependency. This tells React: "Only recalculate this value if `count` changes."

```jsx
import { useState, useMemo } from "react";

const expensiveCalculation = (num) => {
  console.log("Calculating...");
  for (let i = 0; i < 1000000000; i++) {
    num += 1;
  }
  return num;
};

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  // Wrap the calculation in useMemo
  const calculation = useMemo(() => expensiveCalculation(count), [count]);

  const addTodo = () => {
    setTodos((t) => [...t, "New Todo"]);
  };

  return (
    <div>
      {/* Todo list code (same as above) */}
      <button onClick={addTodo}>Add Todo</button>
      
      <hr />
      <div>
        Count: {count}
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        <h2>Expensive Calculation</h2>
        {calculation}
      </div>
    </div>
  );
};
```

Now, when you click "Add Todo", the app responds instantly. The `expensiveCalculation` is skipped because `count` has not changed!
