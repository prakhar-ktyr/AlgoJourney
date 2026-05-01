---
title: React Router Intro
---

# React Router Introduction

React by itself is a library for building User Interfaces. It does not include built-in routing.

If you want to build a Single Page Application (SPA) with multiple pages or views, you need a routing solution. The most popular routing library for React is **React Router**.

## What is Routing?

In traditional websites, when you click a link (like `<a href="/about">`), the browser sends a request to the server, fetches a completely new HTML page, and reloads the entire browser window.

In a React Single Page Application (SPA), the entire application is loaded once. When the user navigates to a new "page", React Router simply swaps out the current component for a different one, without refreshing the browser window.

This makes the application feel incredibly fast and seamless, like a native desktop or mobile app.

## Why React Router?

React Router allows us to:
1. Define multiple routes (URLs) for our application.
2. Render different components based on the current URL.
3. Keep the UI in sync with the URL.
4. Allow users to use browser features like the "Back" and "Forward" buttons, or bookmark specific views within the SPA.

## Getting Started

Because React Router is a third-party library, you must install it before you can use it in your React project.

In your terminal, navigate to your React project folder and run:

```bash
npm install react-router-dom
```

*(Note: `react-router-dom` is specifically built for web applications. `react-router-native` is used for React Native mobile apps.)*

In the next lesson, we will see how to set up the basic routing configuration for our application.
