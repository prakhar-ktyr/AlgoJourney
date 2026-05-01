---
title: React Sass
---

# React Sass

Sass stands for **Syntactically Awesome Stylesheet**.

Sass is a CSS pre-processor. It is an extension of CSS that adds power and elegance to the basic language. It allows you to use features like variables, nested rules, inline imports, mixins and more, all with a fully CSS-compatible syntax.

## What You Need

To use Sass in React, you usually need to install the Sass compiler. If you created your React project with Vite or Create React App, you can easily add Sass support.

Open your terminal and run this command:

```bash
npm install sass
```

Now you are ready to include Sass files in your project!

## Create a Sass File

Create a Sass file the same way as you create CSS files, but Sass files have the file extension `.scss` (or `.sass`).

In Sass files you can use variables and other Sass functions. Let's create a variables file.

**variables.scss:**
```scss
$primary-color: #04AA6D;
$secondary-color: DodgerBlue;
$font-stack: Helvetica, sans-serif;
```

Now let's create a stylesheet that uses these variables.

**App.scss:**
```scss
@import "variables.scss";

body {
  font: 100% $font-stack;
  color: $primary-color;
}

h1 {
  color: $secondary-color;
  
  // Nesting in Sass
  span {
    font-size: 0.8em;
    color: darken($secondary-color, 20%);
  }
}
```

## Use Sass in React

Now, simply import the `.scss` file into your React component just like you would with a regular CSS file.

**App.jsx:**
```jsx
import './App.scss';

function App() {
  return (
    <div>
      <h1>Hello <span>React</span> User!</h1>
      <p>This component is styled with Sass.</p>
    </div>
  );
}

export default App;
```

When you run your project, Vite/Webpack automatically compiles the `.scss` into standard CSS and injects it into your application.

Using Sass is a great way to write cleaner, more maintainable CSS, especially in large React projects!
