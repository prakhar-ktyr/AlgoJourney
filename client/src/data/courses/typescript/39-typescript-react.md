---
title: TypeScript React
---

# TypeScript with React

TypeScript is the industry standard for writing modern React applications. It provides excellent autocomplete and catches bugs before you even run your code.

When using TypeScript with React, files containing JSX must end with a `.tsx` extension.

---

## Typing Component Props

The most common use of TypeScript in React is typing component `props`. You do this by defining an Interface or Type Alias and passing it to your component.

```tsx
import React from "react";

// Define the shape of our props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean; // Optional prop
}

// Pass the interface to the component's arguments
function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

export default Button;
```

If a developer tries to use `<Button />` without a `label` or `onClick`, TypeScript will throw an error immediately in the IDE!

---

## Typing `useState`

The `useState` hook can usually infer its type based on the initial value.

```tsx
// Inferred as number
const [count, setCount] = useState(0);

// Inferred as string
const [name, setName] = useState("Dylan");
```

However, if the state is complex (like an object or an array), or if it starts as `null`, you should explicitly provide the type using generics `<T>`.

```tsx
interface User {
  name: string;
  age: number;
}

// User starts as null, so we must explicitly tell TypeScript it can be User | null
const [user, setUser] = useState<User | null>(null);

// For arrays, provide the array type:
const [items, setItems] = useState<string[]>([]);
```

---

## Typing Events

React provides specific types for events. When using inline event handlers, TypeScript infers the type automatically.

```tsx
<button onClick={(e) => console.log(e)}>Click</button> // 'e' is inferred as MouseEvent
```

If you declare the handler function separately, you must import the event type from React.

```tsx
import React, { ChangeEvent, MouseEvent } from "react";

function Form() {
  // Type the input change event
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // Type the button click event
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <form>
      <input type="text" onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```
