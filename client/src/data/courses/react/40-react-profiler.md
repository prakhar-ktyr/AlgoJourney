---
title: React Profiler
---

# React Profiler

The `Profiler` measures how often a React application renders and what the "cost" of rendering is.

Its purpose is to help identify parts of an application that are slow and may benefit from optimizations such as memoization (`React.memo`, `useMemo`).

## Using the Profiler

A `Profiler` can be added anywhere in a React tree to measure the rendering cost of that part of the tree.

It requires two props:
1. `id`: A string identifying the part of the UI you are measuring.
2. `onRender`: An `onRender` callback function that React calls every time a component within the profiled tree commits an update.

```jsx
import React, { Profiler } from 'react';
import Navigation from './Navigation';
import MainContent from './MainContent';

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  console.log(`[${id}] rendered in ${actualDuration} ms during the ${phase} phase.`);
}

function App() {
  return (
    <div>
      <Profiler id="Navigation" onRender={onRenderCallback}>
        <Navigation />
      </Profiler>
      
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
    </div>
  );
}

export default App;
```

## The React DevTools Profiler

While the `<Profiler>` component is useful for programmatic monitoring (e.g., sending performance data to a logging service), most developers prefer the visual **Profiler tab in the React Developer Tools** browser extension.

When you install the React DevTools extension in Chrome or Firefox, a new "Profiler" tab appears in your browser's Developer Tools.

### How to use it:
1. Open the Profiler tab.
2. Click the "Record" button (a circle icon).
3. Interact with your application to trigger state changes and renders.
4. Click the "Stop" button.

The DevTools will present a Flamegraph and a Ranked chart showing every single render that occurred while recording. You can easily see which components took the longest to render and investigate why they rendered!

**Note:** Profiling adds some additional overhead, so it is disabled in the production build. Ensure you are running your app in development mode (`npm run dev`) when profiling.
