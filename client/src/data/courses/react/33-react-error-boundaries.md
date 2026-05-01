---
title: React Error Boundaries
---

# React Error Boundaries

A JavaScript error in a part of the UI shouldn't break the whole app. To solve this problem, React introduced **Error Boundaries**.

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

## Why Do We Need Them?

If a component throws an error during rendering, React removes the *entire* component tree from the DOM. This leaves the user with a completely blank screen, which is a terrible experience. 

Error Boundaries allow you to show a friendly "Oops, something went wrong!" message while keeping the rest of the application (like the navigation bar) intact.

## Creating an Error Boundary

**Important:** Currently, Error Boundaries can *only* be written as **Class Components**. There is no Hook equivalent for creating an Error Boundary yet (though third-party libraries like `react-error-boundary` provide Hook-like abstractions).

A class component becomes an Error Boundary if it defines either (or both) of the lifecycle methods `static getDerivedStateFromError()` or `componentDidCatch()`.

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // You can also log the error to an error reporting service
  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
```

## Using the Error Boundary

You use it as a regular component and wrap it around the components you want to protect.

```jsx
import ErrorBoundary from './ErrorBoundary';
import MyWidget from './MyWidget';

function App() {
  return (
    <div>
      <nav>My Navigation Bar</nav>
      
      {/* If MyWidget throws an error, only this section shows the fallback UI */}
      <ErrorBoundary>
        <MyWidget />
      </ErrorBoundary>
    </div>
  );
}
```

## Where to place Error Boundaries?

The granularity of Error Boundaries is up to you:
* You can wrap top-level route components to display a "Something went wrong" message, similar to how server-side frameworks handle crashes.
* You can also wrap individual widgets in an error boundary to protect them from crashing the rest of the application.

## What Error Boundaries Do NOT Catch

Error boundaries do **not** catch errors for:
* Event handlers (e.g., clicking a button) - use standard `try/catch` here.
* Asynchronous code (e.g., `setTimeout` or `fetch` callbacks).
* Server side rendering.
* Errors thrown in the error boundary itself (rather than its children).
