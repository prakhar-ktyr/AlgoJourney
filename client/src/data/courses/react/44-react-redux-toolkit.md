---
title: React Redux Toolkit
---

# React Redux Toolkit (RTK)

Redux Toolkit is the modern, standard way to write Redux logic. It eliminates the boilerplate code associated with old-school Redux.

## Setup

To start using Redux Toolkit and the React-Redux bindings, you need to install them:

```bash
npm install @reduxjs/toolkit react-redux
```

## Step 1: Create a Slice

A "slice" is a collection of Redux reducer logic and actions for a single feature in your app. RTK's `createSlice` automatically generates action creators and action types based on the reducers you provide!

**features/counter/counterSlice.js:**
```javascript
import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // Action with a payload
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

// Export the automatically generated actions!
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Export the reducer to be used in the store
export default counterSlice.reducer;
```

## Step 2: Configure the Store

Next, we create the Redux Store and add our slice reducer to it.

**store.js:**
```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

## Step 3: Provide the Store to React

Wrap your `<App>` with the `<Provider>` component from `react-redux` and pass in the store.

**main.jsx:**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

## Step 4: Use Redux State and Actions in Components

Now you can read data from the store with the `useSelector` hook, and dispatch actions with the `useDispatch` hook.

**Counter.jsx:**
```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './features/counter/counterSlice';

export function Counter() {
  // Read state from the store
  const count = useSelector((state) => state.counter.value);
  // Get the dispatch function
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        <button onClick={() => dispatch(decrement())}>-</button>
        <span> {count} </span>
        <button onClick={() => dispatch(increment())}>+</button>
      </div>
      
      <button onClick={() => dispatch(incrementByAmount(5))}>
        Add 5
      </button>
    </div>
  );
}
```

That's it! You have successfully implemented Redux state management using Redux Toolkit without the massive boilerplate of legacy Redux.
