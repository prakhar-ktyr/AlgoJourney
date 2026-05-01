---
title: React Hooks
---

# React Hooks

Hooks were added to React in version 16.8.

Hooks allow function components to have access to state and other React features. Because of this, class components are generally no longer needed.

## What is a Hook?

Hooks allow us to "hook" into React features such as state and lifecycle methods.

Before Hooks, if you wrote a function component and realized you needed to add some state to it, you had to convert it to a class component. Now you can use a Hook inside the existing function component.

## Hook Rules

There are 3 critical rules for hooks:

1. **Hooks can only be called inside React function components.** You cannot call them inside regular JavaScript functions or Class components.
2. **Hooks can only be called at the top level of a component.**
3. **Hooks cannot be conditional.** You cannot call a hook inside an `if` statement, loop, or nested function.

Let's look at why the top-level rule exists. React relies on the order in which Hooks are called to keep track of state between renders. If a hook was inside a conditional statement and that condition changed, the order would be messed up, and React wouldn't know which state corresponds to which Hook.

## Built-in Hooks

React comes with a few built-in Hooks. Here are the most commonly used ones:

* `useState` - Returns a stateful value and a function to update it.
* `useEffect` - Perform side effects in function components (like fetching data or manually changing the DOM).
* `useContext` - Accept a context object and return the current context value.
* `useRef` - Returns a mutable ref object that persists for the full lifetime of the component.
* `useReducer` - An alternative to `useState` for more complex state logic.
* `useCallback` - Returns a memoized callback.
* `useMemo` - Returns a memoized value.

We will cover each of these hooks in depth in the upcoming lessons!

## Custom Hooks

If you have stateful logic that needs to be reused in several components, you can build your own Custom Hooks! We will learn how to do this later in the Hooks section.
