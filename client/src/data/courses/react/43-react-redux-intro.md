---
title: React Redux Intro
---

# React Redux Intro

Redux is a predictable state container for JavaScript apps. 

While the React Context API is great for simple global state (like a theme), Redux is designed for complex, frequently updating, enterprise-level application state.

## Core Concepts of Redux

Redux is built around three core principles:

1. **Single Source of Truth:** The state of your whole application is stored in an object tree within a single **Store**.
2. **State is Read-Only:** The only way to change the state is to emit an **Action**, an object describing what happened.
3. **Changes are made with Pure Functions:** To specify how the state tree is transformed by actions, you write pure **Reducers**.

### 1. The Store
The Store holds the entire application state. You have one store per application.

### 2. Actions
Actions are plain JavaScript objects that have a `type` property describing the event. They can optionally contain a `payload` of data.

```javascript
const addAction = {
  type: 'todos/todoAdded',
  payload: 'Learn Redux'
};
```

### 3. Reducers
A Reducer is a function that takes the `current state` and an `action`, and returns a `new state`. It acts like an event listener which handles events based on the action type.

```javascript
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}
```

## React-Redux

Redux is a standalone library. To link Redux with React, we use the official binding library called `react-redux`.

It provides two main hooks:
* `useSelector`: Allows a component to extract data from the Redux store state.
* `useDispatch`: Returns a reference to the `dispatch` function from the Redux store, allowing the component to dispatch actions.

## The Modern Approach

In the past, setting up Redux was notoriously difficult and required writing a lot of "boilerplate" code (constants, action creators, massive switch statements).

Today, the Redux team strongly recommends using **Redux Toolkit (RTK)**. RTK is the official, opinionated, batteries-included toolset for efficient Redux development. It wraps the core Redux API and vastly simplifies the setup process.

In the next lesson, we will see how to build a Redux application using Redux Toolkit!
