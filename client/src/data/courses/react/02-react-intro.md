---
title: React Intro
---

# React Introduction

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".

## History of React

React was created by **Jordan Walke**, a software engineer at Facebook.

It was first deployed on Facebook's News Feed in 2011 and later on Instagram in 2012. 
React was open-sourced at JSConf US in May 2013.

## How does React Work?

React creates a **Virtual DOM** in memory.

Instead of manipulating the browser's DOM directly, React creates a virtual DOM in memory, where it does all the necessary manipulating, before making the changes in the browser DOM.

React only changes what needs to be changed!
React finds out what changes have been made, and changes **only** what needs to be changed.

You will learn the various aspects of how React does this in the rest of this tutorial.

## The DOM vs The Virtual DOM

* **The DOM (Document Object Model)**: The structure of a web page as represented by the browser. Updating the DOM is slow and expensive in terms of performance.
* **The Virtual DOM**: A lightweight copy of the actual DOM. When the state of an object changes in a React application, the Virtual DOM is updated first. React then compares the Virtual DOM with the real DOM and efficiently updates only the parts that changed. This process is called **Reconciliation**.

## React Components

At the heart of React are **components**. 

A component is a self-contained, reusable piece of code that represents a part of the user interface. Think of components as custom HTML elements. For example, a web page might have a `<Navbar>`, a `<Sidebar>`, and a `<MainContent>` component.

```jsx
// A simple React component
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

In the next chapters, we will learn how to get started with a real React environment.
