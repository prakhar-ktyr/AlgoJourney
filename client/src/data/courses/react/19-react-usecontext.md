---
title: React useContext Hook
---

# React useContext Hook

React Context is a way to manage state globally.

It can be used together with the `useState` Hook to share state between deeply nested components more easily than with `useState` alone.

## The Problem: Prop Drilling

State should be held by the highest parent component in the stack that requires access to the state.

To pass state down to a child component, you pass it as a prop. But what if you have a deeply nested tree, and a component 5 levels down needs that state? 

You would have to pass the prop through all the intermediate components, even if they don't need it. This is called **"prop drilling"**.

```jsx
// Prop Drilling Example
function Component1() {
  const [user, setUser] = useState("Jesse Hall");
  return <Component2 user={user} />;
}

function Component2({ user }) {
  return <Component3 user={user} />;
}

// ...Component 3 and 4...

function Component5({ user }) {
  return <h2>Hello {user} again!</h2>;
}
```

## The Solution: `useContext`

`useContext` allows you to skip the intermediate components and provide data directly to the components that need it.

### 1. Create Context

To create context, you must Import `createContext` and initialize it.

```jsx
import { useState, createContext, useContext } from "react";

// 1. Create the Context
const UserContext = createContext();
```

### 2. Context Provider

Next, we need to use the Context Provider to wrap the tree of components that need the state Context. Wrap child components in the Provider and supply the state value.

```jsx
function Component1() {
  const [user, setUser] = useState("Jesse Hall");

  return (
    // 2. Wrap components in Provider and pass value
    <UserContext.Provider value={user}>
      <h1>Hello {user}!</h1>
      <Component2 />
    </UserContext.Provider>
  );
}
```
Notice that we are no longer passing `user` as a prop to `Component2`!

### 3. Use the `useContext` Hook

Finally, in order to access the Context in a child component, we import the `useContext` Hook and the Context we created.

```jsx
function Component5() {
  // 3. Access the value directly
  const user = useContext(UserContext);

  return (
    <>
      <h1>Component 5</h1>
      <h2>Hello {user} again!</h2>
    </>
  );
}
```

With `useContext`, Component 5 was able to get the `user` value without Component 2, 3, or 4 ever having to know about it.
