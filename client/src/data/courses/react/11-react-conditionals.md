---
title: React Conditionals
---

# React Conditional Rendering

In React, you can create distinct components that encapsulate behavior you need. Then, you can render only some of them, depending on the state of your application.

Conditional rendering in React works the same way conditions work in JavaScript. Use JavaScript operators like `if` or the conditional operator to create elements representing the current state, and let React update the UI to match them.

## Using `if` Statements

You can use standard JavaScript `if` statements to conditionally return JSX.

```jsx
function MissedGoal() {
  return <h1>MISSED!</h1>;
}

function MadeGoal() {
  return <h1>GOAL!</h1>;
}

function Goal(props) {
  const isGoal = props.isGoal;
  if (isGoal) {
    return <MadeGoal />;
  }
  return <MissedGoal />;
}

// Rendering the component
// <Goal isGoal={false} /> -> renders MISSED!
```

## Logical `&&` Operator

You may embed expressions in JSX by wrapping them in curly braces. This includes the JavaScript logical `&&` operator. It can be handy for conditionally rendering an element.

If the condition is `true`, the element right after `&&` will appear in the output. If it is `false`, React will ignore and skip it.

```jsx
function Garage(props) {
  const cars = props.cars;
  return (
    <>
      <h1>Garage</h1>
      {cars.length > 0 &&
        <h2>
          You have {cars.length} cars in your garage.
        </h2>
      }
    </>
  );
}

const cars = ['Ford', 'BMW', 'Audi'];
// <Garage cars={cars} />
```

## Ternary Operator

Another common way to conditionally render elements inline is to use the JavaScript conditional operator `condition ? true : false`.

This is generally the cleanest and most common approach in React for switching between two components.

```jsx
function Goal(props) {
  const isGoal = props.isGoal;

  return (
    <div>
      {isGoal ? <MadeGoal /> : <MissedGoal />}
    </div>
  );
}
```

## Preventing Component from Rendering

In rare cases you might want a component to hide itself even though it was rendered by another component. To do this return `null` instead of its render output.

```jsx
function WarningBanner(props) {
  if (!props.warn) {
    return null;
  }

  return (
    <div className="warning">
      Warning!
    </div>
  );
}
```

Returning `null` from a component's render method does not affect the firing of the component's lifecycle methods.
