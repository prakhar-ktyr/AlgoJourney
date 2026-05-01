---
title: React Code Splitting
---

# React Code Splitting

By default, when you build a React application (using Vite, Webpack, or Create React App), all of your JavaScript is bundled into a single, massive file.

When a user visits your site, they have to download this entire file before they can see or interact with anything. For large applications, this can lead to very slow initial load times.

**Code Splitting** is the process of splitting that single large bundle into multiple smaller bundles which can be loaded on demand (lazily).

## `React.lazy`

The `React.lazy` function lets you render a dynamic import as a regular component.

It takes a function that must call a dynamic `import()`. This must return a `Promise` which resolves to a module with a `default` export containing a React component.

**Before:**
```jsx
import OtherComponent from './OtherComponent';

function MyComponent() {
  return (
    <div>
      <OtherComponent />
    </div>
  );
}
```

**After (with Code Splitting):**
```jsx
import React, { lazy, Suspense } from 'react';

// The component is NOT imported immediately.
// It is only loaded when MyComponent actually tries to render it.
const OtherComponent = lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      {/* 
        We MUST wrap lazy components in <Suspense> to provide 
        a fallback UI while the code is downloading. 
      */}
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

## Route-Based Code Splitting

The best place to introduce code splitting is at the route level.

If a user visits the `/home` page, they shouldn't have to download the code for the `/settings` or `/admin` pages!

You can easily combine `React.lazy` with React Router:

```jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Dynamically import the page components
const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));
const Dashboard = lazy(() => import('./routes/Dashboard'));

const App = () => (
  <BrowserRouter>
    {/* 
      Suspense wraps the Routes. When a user clicks a link, 
      they will see "Loading page..." while the chunk is downloaded.
    */}
    <Suspense fallback={<div>Loading page...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
```

Implementing route-based code splitting is one of the easiest and most impactful performance optimizations you can make in a React application.
