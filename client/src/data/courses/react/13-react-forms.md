---
title: React Forms
---

# React Forms

HTML form elements work differently from other DOM elements in React, because form elements naturally keep some internal state. 

For example, this HTML form in plain HTML accepts a single name and handles it internally when the user submits:

```html
<form>
  <label>
    Name:
    <input type="text" name="name" />
  </label>
  <input type="submit" value="Submit" />
</form>
```

In React, it's convenient to have a JavaScript function that handles the submission of the form and has access to the data that the user entered into the form. The standard way to achieve this is with a technique called "controlled components".

## Controlled Components

In HTML, form elements such as `<input>`, `<textarea>`, and `<select>` typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with `setState()` (or `useState` in functional components).

We can combine the two by making the React state be the "single source of truth". Then the React component that renders a form also controls what happens in that form on subsequent user input.

```jsx
import { useState } from 'react';

function MyForm() {
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`The name you entered was: ${name}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter your name:
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <input type="submit" />
    </form>
  )
}
```

Since the `value` attribute is set on our form element, the displayed value will always be `name`, making the React state the source of truth.

## Handling Multiple Inputs

When you need to handle multiple controlled `input` elements, you can add a `name` attribute to each element and let the handler function choose what to do based on the value of `event.target.name`.

Instead of creating a state variable for every input, you can use one object for the state.

```jsx
import { useState } from 'react';

function MyForm() {
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(inputs);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter your name:
        <input 
          type="text" 
          name="username" 
          value={inputs.username || ""} 
          onChange={handleChange}
        />
      </label>
      <label>Enter your age:
        <input 
          type="number" 
          name="age" 
          value={inputs.age || ""} 
          onChange={handleChange}
        />
      </label>
      <input type="submit" />
    </form>
  )
}
```

## The `<textarea>` Element

In HTML, the value of a `<textarea>` is defined by its children. In React, a `<textarea>` uses a `value` attribute instead. This way, a form using a `<textarea>` can be written very similarly to a form that uses a single-line input.

```jsx
<textarea value={description} onChange={handleChange} />
```

## The `<select>` Tag

In React, the `<select>` tag uses a `value` attribute on the root `select` tag. This is more convenient in a controlled component because you only need to update it in one place.

```jsx
<select value={myCar} onChange={handleChange}>
  <option value="Ford">Ford</option>
  <option value="Volvo">Volvo</option>
  <option value="Fiat">Fiat</option>
</select>
```
