---
title: React Class Components
---

# React Class Components

Before React 16.8 (which introduced Hooks), Class Components were the only way to track state and lifecycle methods in a React component. 

While **Function Components are the modern standard**, you will likely encounter Class Components in older codebases, so it's important to understand how they work.

## Creating a Class Component

When creating a React component, the component's name must start with an upper case letter.

The component has to include the `extends React.Component` statement. This statement creates an inheritance to `React.Component`, giving your component access to React's built-in functions.

The component also requires a `render()` method. This method is responsible for returning HTML (JSX).

**Example:**
```jsx
import React from 'react';

class Car extends React.Component {
  render() {
    return <h2>Hi, I am a Car!</h2>;
  }
}

export default Car;
```

## Component Constructor

If your Class Component needs state (data that changes over time) or needs to bind methods, you typically use a `constructor()`.

The `constructor` function is called automatically when the component is initiated.

**Important rules for constructors:**
1. It must call `super()` before anything else. This executes the parent component's (`React.Component`) constructor.
2. It's the only place where you can directly assign the initial state (`this.state = {}`).

```jsx
class Car extends React.Component {
  constructor() {
    super(); // Must call super()
    this.state = { color: "red" }; // Initialize state
  }

  render() {
    return <h2>I am a {this.state.color} Car!</h2>;
  }
}
```

## Class Components vs. Function Components

Why did React move away from Class Components towards Function Components with Hooks?

1. **Simplicity:** Function components are just plain JavaScript functions. They are shorter, easier to read, and easier to test.
2. **No `this` Keyword:** In Class Components, you have to constantly manage the context of the `this` keyword, which can be confusing (e.g., `this.setState`, `this.props`, binding methods).
3. **Reusability:** Hooks make it much easier to extract and reuse stateful logic between components.

**Class Component Example:**
```jsx
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

**Function Component Equivalent:**
```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

While you should build all *new* components using Function Components, understanding the syntax above will help you maintain legacy React code.
