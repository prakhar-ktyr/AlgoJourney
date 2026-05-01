---
title: React CSS
---

# React CSS Styling

There are many ways to style React with CSS. In this tutorial, we will take a closer look at three common ways:

1. Inline styling
2. CSS stylesheets
3. CSS Modules

## 1. Inline Styling

To style an element with the inline style attribute, the value must be a JavaScript object.

Since the inline CSS is written in a JavaScript object, properties with two names, like `background-color`, must be written with camel case syntax: `backgroundColor`.

```jsx
const Header = () => {
  return (
    <>
      <h1 style={{color: "red", backgroundColor: "lightblue"}}>Hello Style!</h1>
      <p>Add a little style!</p>
    </>
  );
}
```
Notice the double curly braces `{{ }}`. The first set tells JSX that it is a JavaScript expression, and the second set creates a JavaScript object.

### Creating a Style Object
You can also create an object with styling information, and refer to it in the style attribute:

```jsx
const Header = () => {
  const myStyle = {
    color: "white",
    backgroundColor: "DodgerBlue",
    padding: "10px",
    fontFamily: "Sans-Serif"
  };

  return (
    <>
      <h1 style={myStyle}>Hello Style!</h1>
      <p>Add a little style!</p>
    </>
  );
}
```

## 2. CSS Stylesheets

You can write your CSS styling in a separate file, just save the file with the `.css` file extension, and import it in your application.

**App.css:**
```css
body {
  background-color: #282c34;
  color: white;
  padding: 40px;
  font-family: Sans-Serif;
}
```

**App.jsx:**
```jsx
import './App.css'; // Import the stylesheet

const App = () => {
  return (
    <div>
      <h1>Hello Style!</h1>
      <p>Add a little style!.</p>
    </div>
  );
}
```

## 3. CSS Modules

CSS Modules are convenient for components that are placed in separate files. A CSS Module allows you to use the same CSS class name in different files without worrying about naming clashes.

To use CSS Modules, name the file `[name].module.css`.

**Car.module.css:**
```css
.bigblue {
  color: DodgerBlue;
  font-family: Sans-Serif;
  font-size: 40px;
}
```

**Car.jsx:**
Import the stylesheet as an object, and reference styles via dot notation.

```jsx
import styles from './Car.module.css';

const Car = () => {
  return <h1 className={styles.bigblue}>Hello Car!</h1>;
}

export default Car;
```

This approach automatically creates unique class names during the build process, preventing styles from leaking to other components.
