---
title: React Events
---

# React Events

Just like HTML DOM events, React can perform actions based on user events. React has the same events as HTML: click, change, mouseover etc.

## Adding Events

React events are written in camelCase syntax:
`onClick` instead of `onclick`.

React event handlers are written inside curly braces:
`onClick={shoot}` instead of `onclick="shoot()"`.

**React Event Example:**
```jsx
function Football() {
  const shoot = () => {
    alert("Great Shot!");
  }

  return (
    <button onClick={shoot}>Take the shot!</button>
  );
}
```

## Passing Arguments

If you want to pass an argument to an event handler, you must use an **arrow function** inside the event attribute.

**WRONG WAY:**
If you write `onClick={shoot("Goal")}`, the function will execute immediately when the component renders, instead of waiting for the click!

**CORRECT WAY:**
Use an anonymous arrow function to wrap the call.

```jsx
function Football() {
  const shoot = (message) => {
    alert(message);
  }

  return (
    <button onClick={() => shoot("Goal!")}>Take the shot!</button>
  );
}
```

## The React Event Object

Event handlers in React receive a synthetic event object. It works exactly like a regular browser event object (`e.preventDefault()`, `e.target`, etc.), but it ensures cross-browser compatibility.

```jsx
function Football() {
  const shoot = (e) => {
    // Prevent default form submission or link navigation
    e.preventDefault(); 
    
    // e.type will output "click"
    alert("Event type: " + e.type);
  }

  return (
    <button onClick={shoot}>Inspect Event</button>
  );
}
```

### Passing Both Arguments and the Event

If you need to pass an argument *and* the event object, you can pass the event object manually in the arrow function.

```jsx
function Football() {
  const shoot = (message, event) => {
    alert(message);
    console.log(event.target); // Logs the button element
  }

  return (
    <button onClick={(event) => shoot("Goal!", event)}>
      Take the shot!
    </button>
  );
}
```

In the next lesson, we will look at how to conditionally render components based on different states.
