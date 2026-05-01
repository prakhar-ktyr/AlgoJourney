---
title: React Higher-Order Components
---

# React Higher-Order Components (HOCs)

A Higher-Order Component (HOC) is an advanced technique in React for reusing component logic.

HOCs are not part of the React API. They are a pattern that emerges from React's compositional nature.

**Definition:** A higher-order component is a function that takes a component and returns a new component.

```javascript
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

While components transform props into UI, a higher-order component transforms a component into another component.

## When to use HOCs?

Before Custom Hooks were introduced in React 16.8, HOCs were the primary way to share stateful logic between components. 

Today, **Custom Hooks are generally preferred over HOCs**, but you will still see HOCs in older codebases and in some popular libraries (like Redux's `connect` function or React Router's `withRouter`).

## Building a simple HOC

Let's say we want to track every time a component renders and log it to the console. Instead of adding `console.log` to every component, we can create an HOC.

HOCs usually start with the prefix `with`.

**withLogger.jsx:**
```jsx
import React, { useEffect } from 'react';

// The HOC takes a Component as an argument
const withLogger = (WrappedComponent) => {
  
  // It returns a NEW functional component
  const WithLoggerComponent = (props) => {
    
    useEffect(() => {
      console.log(`Component ${WrappedComponent.name} rendered!`);
    });

    // It renders the wrapped component, passing down ALL props
    return <WrappedComponent {...props} />;
  };

  return WithLoggerComponent;
};

export default withLogger;
```

## Using the HOC

Now we can wrap any component with our logger.

**MyButton.jsx:**
```jsx
import withLogger from './withLogger';

const MyButton = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

// Export the enhanced component, not the original!
export default withLogger(MyButton);
```

When `MyButton` renders, it will automatically log "Component MyButton rendered!" to the console.

## Important Rules for HOCs

1. **Don't Mutate the Original Component:** An HOC should be a pure function. It should not modify the input component's prototype. Instead, it should return a completely new wrapper component.
2. **Pass Unrelated Props Through:** The HOC should pass any props it doesn't care about directly through to the wrapped component (using `{...props}`). This ensures the component remains flexible.
3. **Don't use HOCs inside the `render` method:** Applying an HOC inside a component's render function forces React to unmount and remount the component entirely on every render, destroying its state. Always apply HOCs outside the component definition.
