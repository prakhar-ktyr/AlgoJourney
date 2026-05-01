---
title: React Router Nested
---

# React Router Nested Routes

Nested Routing allows you to map parts of your URL to a hierarchy of components.

Instead of rendering a completely new page, nested routes allow you to render components *inside* other components based on the URL. This is incredibly useful for layouts like dashboards, where the sidebar stays constant but the main content area changes.

## Defining Nested Routes

To create nested routes, you place `<Route>` elements inside another `<Route>` element.

```jsx
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import DashboardHome from "./DashboardHome";
import Settings from "./Settings";
import Profile from "./Profile";

function App() {
  return (
    <Routes>
      {/* The parent route */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Child routes */}
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
```

### The `index` Route
Notice the `<Route index />`. An index route is the default route that renders when the user hits the exact path of the parent route (`/dashboard`). It doesn't have a `path` prop.

Child routes automatically inherit the path of their parent. So `path="settings"` actually matches the URL `/dashboard/settings`.

## The `<Outlet>` Component

We have defined our nested routes, but how does the parent component (`DashboardLayout`) know *where* to render the child components?

React Router provides an `<Outlet />` component to tell the parent where to render the matched child route.

**DashboardLayout.jsx:**
```jsx
import { Link, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={{ display: "flex" }}>
      
      {/* The Sidebar (stays constant) */}
      <nav style={{ width: "200px", background: "#f0f0f0", padding: "10px" }}>
        <h2>Dashboard</h2>
        <ul>
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/dashboard/settings">Settings</Link></li>
          <li><Link to="/dashboard/profile">Profile</Link></li>
        </ul>
      </nav>

      {/* The Main Content Area (changes based on URL) */}
      <main style={{ padding: "20px" }}>
        
        {/* This is where DashboardHome, Settings, or Profile will render! */}
        <Outlet />
        
      </main>
      
    </div>
  );
}

export default DashboardLayout;
```

With `<Outlet>`, building complex UI layouts with permanent sidebars or top navigation bars becomes extremely simple!
