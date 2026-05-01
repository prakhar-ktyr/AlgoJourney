---
title: React useState Hook
---

# React useState Hook

The React `useState` Hook allows us to track state in a function component.

State generally refers to data or properties that need to be tracked in an application. When state changes, React automatically re-renders the component to reflect the new data.

## Import `useState`

To use the `useState` Hook, we first need to `import` it into our component.

```jsx
import { useState } from "react";
```

Notice that we are destructuring `useState` from `react` as it is a named export.

## Initialize `useState`

We initialize our state by calling `useState` in our function component.

`useState` accepts an initial state and returns two values:
1. The current state.
2. A function that updates the state.

```jsx
import { useState } from "react";

function FavoriteColor() {
  const [color, setColor] = useState("red");
}
```

Notice that we are using **array destructuring** to assign names to the values returned by `useState()`.
- `color` is our current state value.
- `setColor` is the function that we will use to update our state.
- `"red"` is the initial state value.

## Read State

We can now include our state anywhere in our component.

```jsx
import { useState } from "react";

function FavoriteColor() {
  const [color, setColor] = useState("red");

  return <h1>My favorite color is {color}!</h1>
}

export default FavoriteColor;
```

## Update State

To update our state, we use our state updater function (`setColor`).

**Important:** We should never update state directly (e.g., `color = "blue"` is **wrong**). We must always use the setter function so React knows the state changed and triggers a re-render.

```jsx
import { useState } from "react";

function FavoriteColor() {
  const [color, setColor] = useState("red");

  return (
    <>
      <h1>My favorite color is {color}!</h1>
      <button
        type="button"
        onClick={() => setColor("blue")}
      >Blue</button>
      <button
        type="button"
        onClick={() => setColor("green")}
      >Green</button>
    </>
  );
}
```

## Updating Objects and Arrays in State

When state is updated, the entire state gets overwritten.

If you have an object or array in state, you must be careful to copy the existing properties when updating it. You can do this by using the JavaScript spread operator `...`.

```jsx
function Car() {
  const [car, setCar] = useState({
    brand: "Ford",
    model: "Mustang",
    year: "1964",
    color: "red"
  });

  const updateColor = () => {
    // We copy the existing car object, and only overwrite color
    setCar(previousState => {
      return { ...previousState, color: "blue" }
    });
  }

  return (
    <>
      <h1>My {car.brand}</h1>
      <p>
        It is a {car.color} {car.model} from {car.year}.
      </p>
      <button onClick={updateColor}>Blue</button>
    </>
  )
}
```
Notice we passed an arrow function `previousState => { ... }` into `setCar`. This is the safest way to update state when the new state relies on the old state.
