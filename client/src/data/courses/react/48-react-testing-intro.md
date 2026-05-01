---
title: React Testing Intro
---

# React Testing Introduction

Testing is a critical part of building robust React applications. It ensures your code works as expected and prevents future changes from breaking existing functionality.

There are three main types of tests you will write for a React app:

1. **Unit Tests:** Testing individual functions or isolated components.
2. **Integration Tests:** Testing how multiple components work together.
3. **End-to-End (E2E) Tests:** Testing the entire application workflow in a real browser (e.g., using Cypress or Playwright).

## Testing Tools

The standard testing stack for modern React applications consists of two tools:

1. **A Test Runner:** Executes the tests and provides the assertion framework (e.g., `describe`, `it`, `expect`). 
   - **Jest** and **Vitest** are the most common test runners.
2. **A Testing Utility:** Provides functions to render React components in a virtual DOM and interact with them.
   - **React Testing Library (RTL)** is the industry standard.

## Why React Testing Library?

In the past, developers used a tool called Enzyme, which allowed them to test the internal implementation details of a component (like checking the exact value of a state variable).

React Testing Library takes a different approach. Its guiding principle is:
> *"The more your tests resemble the way your software is used, the more confidence they can give you."*

RTL encourages you to test your components from the perspective of the user. Instead of checking a state variable, you check if a specific piece of text appeared on the screen after the user clicked a button.

## Basic Test Structure

A test file usually lives right next to the component it tests, named `ComponentName.test.jsx`.

A basic test looks like this:

```jsx
import { describe, it, expect } from 'vitest'; // Or Jest
import { render, screen } from '@testing-library/react';
import MyButton from './MyButton';

// describe() groups related tests
describe('MyButton Component', () => {
  
  // it() or test() defines a single test case
  it('renders the correct label', () => {
    
    // 1. Arrange: Render the component
    render(<MyButton label="Click Me" />);
    
    // 2. Act: Find the element on the screen
    const buttonElement = screen.getByText(/click me/i);
    
    // 3. Assert: Verify the element exists
    expect(buttonElement).toBeInTheDocument();
  });
  
});
```

In the next lesson, we will look deeper into how to use React Testing Library to simulate user interactions!
