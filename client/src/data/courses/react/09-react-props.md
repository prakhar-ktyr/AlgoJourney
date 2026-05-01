---
title: React Props
---

# React Props

React **Props** (short for "properties") are the way we pass data from one component to another.

Props are arguments passed into React components. They are passed to components via HTML attributes.

## Passing Data with Props

When a component is rendered, we can pass data to it by adding custom attributes, similar to how you add attributes to HTML elements (like `href` in `<a>` or `src` in `<img>`).

Let's pass a `brand` property from a `Garage` component to a `Car` component.

```jsx
function Car(props) {
  return <h2>I am a {props.brand}!</h2>;
}

function Garage() {
  return (
    <div>
      <h1>Who lives in my garage?</h1>
      <Car brand="Ford" />
    </div>
  );
}
```

When React renders `<Car brand="Ford" />`, it passes an object `{ brand: "Ford" }` to the `Car` function. This object is what we call `props`.

## Props are Read-Only

**Important Rule:** Whether you declare a component as a function or a class, it must never modify its own props.

Props are **read-only**. They are meant to be passed down from a parent to a child (one-way data flow). If a child needs to change the data, the parent should manage the state and pass a function down as a prop to update it.

## Passing Multiple Props

You can pass as many props as you want. You can pass strings, numbers, booleans, arrays, objects, and even functions!

```jsx
function UserProfile(props) {
  return (
    <div>
      <h2>Name: {props.name}</h2>
      <p>Age: {props.age}</p>
      <p>Is Admin: {props.isAdmin ? "Yes" : "No"}</p>
    </div>
  );
}

function App() {
  return (
    <UserProfile 
      name="Alice" 
      age={28} 
      isAdmin={true} 
    />
  );
}
```
*Notice that strings can be passed in quotes `" "`, but numbers, booleans, arrays, or objects must be passed inside curly braces `{ }`.*

## Destructuring Props

To make your code cleaner, especially when a component has many props, you can use ES6 Object Destructuring directly in the function parameters.

Instead of `function Car(props) { ... props.brand ... }`, you can do:

```jsx
function Car({ brand, color }) {
  return <h2>I am a {color} {brand}!</h2>;
}

function Garage() {
  return <Car brand="Ford" color="Red" />;
}
```

This destructuring syntax is extremely common in modern React development and makes it immediately clear what props a component expects.
