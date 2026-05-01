---
title: React Render Props
---

# React Render Props

The term "render prop" refers to a technique for sharing code between React components using a prop whose value is a function.

A component with a render prop takes a function that returns a React element and calls it instead of implementing its own render logic.

## The Problem

Like Higher-Order Components (HOCs), Render Props were a popular way to share stateful logic before Custom Hooks were introduced. Custom Hooks are now the preferred method, but Render Props are still a powerful pattern, especially for building highly flexible UI components.

Imagine you have a component that tracks the mouse position on the screen.

```jsx
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div style={{ height: '100vh' }} onMouseMove={handleMouseMove}>
      <h1>The mouse position is ({position.x}, {position.y})</h1>
    </div>
  );
}
```

What if we want to use that exact same mouse tracking logic, but instead of text, we want to render a picture of a cat that follows the mouse? We would have to copy and paste the logic!

## The Render Prop Solution

Instead of hardcoding what the `MouseTracker` renders, we can tell it what to render by passing a function as a prop.

**Mouse.jsx:**
```jsx
import { useState } from 'react';

// This component ONLY handles the logic
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div style={{ height: '100vh', border: '1px solid black' }} onMouseMove={handleMouseMove}>
      {/* 
        Instead of providing a static representation of what <Mouse> renders,
        use the `render` prop to dynamically determine what to render.
      */}
      {render(position)}
    </div>
  );
}

export default Mouse;
```

## Using the Render Prop

Now, `Mouse` encapsulates all behavior associated with listening for mouse events, but it delegates the actual rendering to whatever function we pass to the `render` prop.

**App.jsx:**
```jsx
import Mouse from './Mouse';

function Cat({ mouse }) {
  return (
    <img 
      src="/cat.png" 
      style={{ position: 'absolute', left: mouse.x, top: mouse.y }} 
      alt="cat" 
    />
  );
}

function App() {
  return (
    <div>
      <h1>Move the mouse around!</h1>
      
      {/* We pass a function that receives the state, and returns UI */}
      <Mouse render={(mousePosition) => (
        <Cat mouse={mousePosition} />
      )} />
      
    </div>
  );
}

export default App;
```

### Note on "children" as a Render Prop
The name of the prop doesn't have to be `render`. You can actually use the `children` prop as a function!

```jsx
<Mouse>
  {(mousePosition) => <Cat mouse={mousePosition} />}
</Mouse>
```
This pattern is heavily used in popular libraries like Formik and React Spring.
