---
title: React Forward Ref
---

# React Forward Ref

Ref forwarding is a technique for automatically passing a `ref` through a component to one of its children.

This is typically not necessary for most components in the application. However, it can be useful for some kinds of components, especially highly reusable "leaf" components like buttons or text inputs.

## The Problem

Normally, if you pass a `ref` to a custom component, React will complain.

```jsx
import { useRef } from 'react';

// A simple custom input component
function CustomInput(props) {
  return <input className="my-input" {...props} />;
}

function App() {
  const inputRef = useRef(null);

  // ERROR! You cannot pass 'ref' to a function component like this.
  return <CustomInput ref={inputRef} placeholder="Type here..." />;
}
```

By default, function components do not take a `ref` attribute. They only take `props`.

## The Solution: `React.forwardRef`

To allow a component to receive a `ref` and pass it down to a DOM element, you must wrap the component in `React.forwardRef()`.

`forwardRef` creates a React component that takes `props` and `ref` as its two arguments.

```jsx
import React, { useRef, forwardRef } from 'react';

// 1. Wrap the component in forwardRef
// 2. Accept 'ref' as the second argument
const CustomInput = forwardRef((props, ref) => {
  return (
    <div>
      <label>Fancy Input:</label>
      {/* 3. Pass the ref down to the actual DOM element */}
      <input ref={ref} className="my-input" {...props} />
    </div>
  );
});

function App() {
  const inputRef = useRef(null);

  const focusInput = () => {
    // We can now access the raw <input> element directly!
    inputRef.current.focus();
  };

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Type here..." />
      <button onClick={focusInput}>Focus the input</button>
    </div>
  );
}

export default App;
```

## Why do this?

If you are building a UI library (like Material UI or Bootstrap React), you want your custom `<Button>` or `<Input>` components to behave exactly like native HTML `<button>` and `<input>` elements. 

Users of your library might need to measure the button's size on the screen, or manage focus manually. `forwardRef` allows your custom component to expose the underlying DOM element to the parent component.
