---
title: React Components
---

# React Components

Components are the building blocks of any React application. 

Think of components as independent, reusable pieces of UI. They act like custom HTML elements. Components let you split the UI into independent pieces, and think about each piece in isolation.

There are two main types of components in React:
1. **Function Components**
2. **Class Components**

In modern React, **Function Components** are the standard, but it is good to know that Class components exist.

## Function Components

A Function Component is simply a JavaScript function that returns JSX (React elements).

To create a Function Component, write a JavaScript function. 
**Important Note:** The name of a React component must ALWAYS start with a **capital letter**.

```jsx
// A valid Function Component
function Car() {
  return <h2>Hi, I am a Car!</h2>;
}
```

## Rendering a Component

Once you have defined a component, you can use it inside other components or render it directly to the DOM using `<ComponentName />`.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

function Car() {
  return <h2>Hi, I am a Car!</h2>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
// Render the Car component
root.render(<Car />);
```

## Components in Components

The real power of React comes from combining components. We can refer to components inside other components.

Let's say we want to use the `Car` component inside a `Garage` component.

```jsx
function Car() {
  return <h2>I am a Car!</h2>;
}

function Garage() {
  return (
    <div>
      <h1>Who lives in my Garage?</h1>
      <Car />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Garage />);
```

This will render:
```html
<div>
  <h1>Who lives in my Garage?</h1>
  <h2>I am a Car!</h2>
</div>
```

## Component Files

As your application grows, you won't want all your components in one file. React allows you to place components in separate files to keep your code organized.

To do this, create a new file with a `.jsx` extension, define your component, and `export` it.

**Car.jsx:**
```jsx
// We don't always need to import React in modern Vite projects, 
// but it's good practice to know it's happening under the hood.

function Car() {
  return <h2>Hi, I am a Car!</h2>;
}

export default Car; // Export the component so it can be used elsewhere
```

**App.jsx:**
Now, you can import the `Car` component in your main file.

```jsx
import Car from './Car.jsx';

function App() {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <Car />
    </div>
  );
}

export default App;
```

This modular approach makes large applications much easier to maintain and test!
