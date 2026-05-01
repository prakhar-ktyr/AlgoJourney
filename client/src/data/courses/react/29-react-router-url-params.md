---
title: React Router URL Params
---

# React Router URL Parameters

Sometimes you need to create dynamic routes. For example, if you are building an e-commerce store, you don't want to create a separate hardcoded Route for every single product (`/product/shoes`, `/product/hats`).

Instead, you want a single dynamic route like `/product/:id`.

This is where URL Parameters come in.

## Defining Dynamic Routes

To create a dynamic route, add a colon `:` before the parameter name in the Route's `path` prop.

```jsx
import { Routes, Route } from "react-router-dom";
import ProductDetail from "./ProductDetail";

function App() {
  return (
    <Routes>
      {/* The :productId is a dynamic variable */}
      <Route path="/product/:productId" element={<ProductDetail />} />
    </Routes>
  );
}
```

This single route will match `/product/123`, `/product/abc`, and so on.

## Accessing URL Parameters

Once you navigate to a dynamic route, how does the component (`ProductDetail`) know which product ID was requested?

React Router provides a Hook called `useParams` for this exact purpose.

**ProductDetail.jsx:**
```jsx
import { useParams } from "react-router-dom";

function ProductDetail() {
  // We extract the parameter name that matches what we defined in the Route
  const { productId } = useParams();

  // In a real app, you would use this ID to fetch data from an API
  // fetch(`https://api.example.com/products/${productId}`)

  return (
    <div>
      <h1>Product Details</h1>
      <p>You are viewing the product with ID: {productId}</p>
    </div>
  );
}

export default ProductDetail;
```

## Multiple Parameters

You can define as many dynamic parameters as you need in a single path.

**Route:**
```jsx
<Route path="/blog/:year/:month" element={<BlogArchive />} />
```

**Component:**
```jsx
import { useParams } from "react-router-dom";

function BlogArchive() {
  const { year, month } = useParams();

  return (
    <h2>
      Showing blog posts for {month}, {year}
    </h2>
  );
}
```

URL Parameters are essential for building data-driven applications where views rely on IDs fetched from a backend database.
