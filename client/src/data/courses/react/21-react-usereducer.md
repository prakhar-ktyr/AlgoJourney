---
title: React useReducer Hook
---

# React useReducer Hook

The `useReducer` Hook is similar to the `useState` Hook.

It allows for custom state logic. If you find yourself keeping track of multiple pieces of state that rely on complex logic, `useReducer` may be useful.

If you have used Redux before, `useReducer` works exactly the same way.

## Syntax

The `useReducer` Hook accepts two arguments:
1. A **reducer** function.
2. The **initial state**.

And it returns:
1. The **current state**.
2. A **dispatch** function to update the state.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

## The Reducer Function

The reducer function contains your custom state logic. It takes the current state and an action as arguments, and returns the new state.

```javascript
const reducer = (state, action) => {
  // Return the new state based on the action type
}
```

## Example: A Counter

Let's look at a complete example using a counter component.

```jsx
import { useReducer } from "react";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      throw new Error();
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <h2>Count: {state.count}</h2>
      {/* We use 'dispatch' to send an action to the reducer */}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </>
  );
}
```

### How it Works:
1. We initialize the state to `{ count: 0 }`.
2. When a user clicks "+", we call `dispatch({ type: 'INCREMENT' })`.
3. The `dispatch` function triggers our `reducer`.
4. The `reducer` sees the `'INCREMENT'` action type, takes the current state (`count: 0`), and returns the new state (`count: 1`).
5. React re-renders the component with the new state.

`useReducer` is often preferred over `useState` when state is complex (like objects with many nested properties) or when the next state depends heavily on the previous state.
