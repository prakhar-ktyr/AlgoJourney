---
title: React Context API Deep Dive
---

# React Context API

While we already looked at the `useContext` hook, it's important to understand the broader **Context API** which powers it.

The Context API is React's built-in way to share state globally across the component tree without passing props manually at every level.

## The Three Parts of Context

The Context API consists of three main pieces:
1. `createContext`
2. `<Context.Provider>`
3. `useContext` (or `<Context.Consumer>` in class components)

### 1. Creating the Context

First, we create a context object using `createContext()`. You can pass an optional default value, which is only used if a component tries to consume the context but has no matching Provider above it in the tree.

**ThemeContext.jsx:**
```jsx
import { createContext } from 'react';

// The default value is "light"
export const ThemeContext = createContext("light");
```

### 2. The Provider

Every Context object comes with a Provider React component. This component accepts a `value` prop to be passed to consuming components that are descendants of this Provider.

You should wrap the Provider around the highest component that needs the state.

**App.jsx:**
```jsx
import { useState } from 'react';
import { ThemeContext } from './ThemeContext';
import Toolbar from './Toolbar';

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  }

  return (
    // Any component inside this Provider can access the 'theme' value
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div>
        <h1>My App</h1>
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
```
*Note: We passed an object `{{ theme, toggleTheme }}` as the value so children can both read and update the theme!*

### 3. Consuming the Context

Finally, any child component (no matter how deep) can access the context values using the `useContext` hook.

**ThemedButton.jsx:**
```jsx
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function ThemedButton() {
  // Destructure the values from the context
  const { theme, toggleTheme } = useContext(ThemeContext);

  const buttonStyle = {
    backgroundColor: theme === "light" ? "#fff" : "#333",
    color: theme === "light" ? "#000" : "#fff",
    padding: "10px",
    cursor: "pointer"
  };

  return (
    <button style={buttonStyle} onClick={toggleTheme}>
      Current Theme is {theme} (Click to change)
    </button>
  );
}

export default ThemedButton;
```

## When to Use Context

Context is great for data that is considered "global" for a tree of React components, such as:
* Current authenticated user
* UI theme (light/dark mode)
* User language preferences

For more complex state management (like handling multiple interconnected pieces of global state), you might want to look into libraries like **Redux** or **Zustand**.
