---
title: React Router Setup
---

# React Router Setup

Once you have installed `react-router-dom`, you need to set up the routing configuration in your main application file.

The standard approach uses `BrowserRouter`, `Routes`, and `Route` components.

## Basic Configuration

To add routing to your application, you must wrap your top-level component (usually `<App />` or the components inside it) with `<BrowserRouter>`.

**main.jsx:**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

## Defining Routes

Now, inside your `App` component, you can define your routes.

* `<Routes>` acts as a container that looks through all its child `<Route>` elements to find the best match for the current URL.
* `<Route>` takes a `path` (the URL string) and an `element` (the component to render).

**App.jsx:**
```jsx
import { Routes, Route } from 'react-router-dom';

// Import our page components
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <div>
      <h1>My React App</h1>
      
      {/* The Routes container */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
```

### How it works:
1. If the user navigates to `http://localhost:5173/`, React Router matches the `/` path and renders the `<Home />` component.
2. If the user goes to `/about`, it renders `<About />`.
3. If the user goes to `/contact`, it renders `<Contact />`.

The `<h1>My React App</h1>` is located outside the `<Routes>` container, so it will remain visible on *every* page! This is perfect for defining global headers or navigation bars.
