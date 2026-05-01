---
title: React Router Links
---

# React Router Links

In a standard HTML page, you navigate to different pages using the `<a>` (anchor) tag. 

However, in a React application using React Router, you should **never** use a standard `<a href="...">` tag to navigate between internal pages.

Why? Because an `<a>` tag triggers a full page reload, contacting the server and downloading the entire application again. This destroys the Single Page Application (SPA) experience and resets all your React state!

## The `<Link>` Component

Instead of `<a>`, React Router provides a `<Link>` component.

The `<Link>` component updates the URL and renders the new component without refreshing the browser window.

**Syntax:**
```jsx
import { Link } from "react-router-dom";

<Link to="/about">Go to About Page</Link>
```

## Creating a Navigation Bar

Let's build a simple navigation bar using `<Link>`.

**Navbar.jsx:**
```jsx
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About Us</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
```

When you render this `Navbar` inside your `App` (outside of the `<Routes>` container), it will stay visible on all pages, allowing users to navigate instantly between views.

## The `<NavLink>` Component

React Router also provides a specialized version of `<Link>` called `<NavLink>`.

`<NavLink>` is used specifically for navigation menus because it knows whether or not it is "active". This allows you to easily apply styling to the currently active link (e.g., highlighting the "Home" link when the user is on the home page).

```jsx
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      {/* In CSS, you can target the automatically added .active class */}
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        Home
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
        About
      </NavLink>
    </nav>
  );
}
```

By default, `<NavLink>` automatically adds an `active` class to the rendered `<a>` tag when its `to` prop matches the current URL!
