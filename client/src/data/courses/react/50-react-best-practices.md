---
title: React Best Practices
---

# React Best Practices

As you build larger applications, keeping your React codebase clean and maintainable becomes essential. Here are some industry-standard best practices.

## 1. Keep Components Small and Focused

A component should ideally do one thing (the Single Responsibility Principle).

If a component is handling API fetching, complex form validation, AND rendering a massive UI, it needs to be broken down. Extract the UI into smaller components, and move the logic into Custom Hooks.

## 2. Separate Logic from UI (Container / Presentational Pattern)

While Custom Hooks are the modern way to achieve this, the concept remains: separate "how things look" from "how things work".

* **Presentational Components:** Only care about UI. They receive data and callbacks via props and rarely have their own state.
* **Container Components (or Hooks):** Handle data fetching, state management, and business logic.

## 3. Use Absolute Imports

Instead of messy relative imports like `import Button from '../../../components/Button'`, configure your bundler (Vite/Webpack/TSConfig) to support absolute imports.

This allows you to write:
`import Button from '@/components/Button'`
This makes moving files around much easier.

## 4. Avoid Prop Drilling

If you are passing props down through multiple layers of components that don't actually use the data, you are prop drilling.

**Solutions:**
1. Use the **Context API** or a library like Redux/Zustand.
2. Use **Component Composition**. Instead of passing data down, pass the *component itself* as a child.

```jsx
// Instead of this:
<Layout user={user} theme={theme} />

// Do this (Composition):
<Layout>
  <Sidebar theme={theme} />
  <MainContent user={user} />
</Layout>
```

## 5. Don't Over-Optimize

Avoid prematurely wrapping every function in `useCallback` or every component in `React.memo`. 

Memoization has a cost. React's default rendering is incredibly fast. Only use `useMemo` and `useCallback` when you have measured a performance issue, or when a function is used as a dependency in a `useEffect`.

## 6. Use functional updates for state based on previous state

When your new state depends on the old state, always pass a function to the setter.

```jsx
// WRONG: Might lead to bugs if called multiple times rapidly
setCount(count + 1);

// RIGHT: Guarantees you have the latest state
setCount(prevCount => prevCount + 1);
```

## 7. Clean up your Effects

Always remember to return a cleanup function in `useEffect` when dealing with intervals, event listeners, or asynchronous subscriptions (like WebSockets) to prevent memory leaks.

## Conclusion

Congratulations! You have completed the comprehensive React tutorial. You have learned everything from basic JSX syntax to advanced Hooks, Routing, and Testing. 

You are now well-equipped to build robust, modern single-page applications with React!
