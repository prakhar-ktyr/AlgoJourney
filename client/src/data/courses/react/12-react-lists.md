---
title: React Lists
---

# React Lists and Keys

In React, you will often want to render multiple similar components from a collection of data. You can do this by using the JavaScript `map()` function.

## Rendering Multiple Components

You can build collections of elements and include them in JSX using curly braces `{}`.

Below, we loop through the `cars` array using the JavaScript `map()` function, and return an `<li>` element for each item. Finally, we assign the resulting array of elements to `listItems`.

```jsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li>{number}</li>
);

function App() {
  return (
    <ul>{listItems}</ul>
  );
}
```

## Basic List Component

Usually, you would render lists inside a component. We can refactor the previous example into a component that accepts an array of `cars` and outputs an unordered list of elements.

```jsx
function Car(props) {
  return <li>I am a { props.brand }</li>;
}

function Garage() {
  const cars = ['Ford', 'BMW', 'Audi'];
  return (
    <>
      <h1>Who lives in my garage?</h1>
      <ul>
        {cars.map((car) => <Car brand={car} />)}
      </ul>
    </>
  );
}
```

If you run this code, you will see a warning in the console that a key should be provided for list items.

## Keys

A "key" is a special string attribute you need to include when creating lists of elements. Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity.

The best way to pick a key is to use a string that uniquely identifies a list item among its siblings. Most often you would use IDs from your data as keys.

```jsx
function Garage() {
  const cars = [
    {id: 1, brand: 'Ford'},
    {id: 2, brand: 'BMW'},
    {id: 3, brand: 'Audi'}
  ];
  
  return (
    <>
      <h1>Who lives in my garage?</h1>
      <ul>
        {cars.map((car) => <Car key={car.id} brand={car.brand} />)}
      </ul>
    </>
  );
}
```

### What if I don't have an ID?

When you don't have stable IDs for rendered items, you may use the item index as a key as a last resort:

```jsx
const todoItems = todos.map((todo, index) =>
  // Only do this if items have no stable IDs
  <li key={index}>
    {todo.text}
  </li>
);
```

We don't recommend using indexes for keys if the order of items may change. This can negatively impact performance and may cause issues with component state.
