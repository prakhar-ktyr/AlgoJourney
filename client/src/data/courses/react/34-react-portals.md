---
title: React Portals
---

# React Portals

Portals provide a first-class way to render children into a DOM node that exists *outside* the DOM hierarchy of the parent component.

In simple terms, a Portal allows a React component to visually "break out" of its parent container and render itself somewhere else in the actual HTML document.

## Why Use Portals?

Normally, when you return an element from a component's `render` method, it's mounted into the DOM as a child of the nearest parent node.

However, sometimes you need to insert a child into a different location in the DOM. The most common use cases for Portals are:
* Modals / Dialog boxes
* Tooltips
* Hovercards
* Dropdown menus

For example, if your application has `overflow: hidden` or `z-index` styling on a parent container, a tooltip or modal inside that container might get visually cut off. Portals solve this by appending the modal directly to `document.body` or a dedicated modal container.

## Creating a Portal

To create a portal, we use `ReactDOM.createPortal(child, container)`.

* The first argument (`child`) is any renderable React child, such as an element, string, or fragment.
* The second argument (`container`) is a DOM element where you want to render the child.

### Step 1: Add a Container in `index.html`

First, add a div in your `index.html` specifically for portals.

```html
<body>
  <div id="root"></div>
  <!-- This is where our portal will render -->
  <div id="portal-root"></div> 
  <script type="module" src="/src/main.jsx"></script>
</body>
```

### Step 2: Create the Modal Component

Now, let's create a Modal component that uses `createPortal`.

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  // We are rendering the JSX into the 'portal-root' div!
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>,
    document.getElementById('portal-root')
  );
}

export default Modal;
```

### Step 3: Use the Modal

Now we can use the Modal anywhere in our app. Even if the `App` component has complex CSS styling, the Modal will break out and render cleanly at the top level of the DOM.

```jsx
import { useState } from 'react';
import Modal from './Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '50px', overflow: 'hidden' }}>
      <h1>My App</h1>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Hello from the Portal!</h2>
        <p>I am rendered outside the React Root tree!</p>
      </Modal>
    </div>
  );
}

export default App;
```

## Event Bubbling through Portals

An interesting feature of Portals is that even though a portal can be anywhere in the actual DOM tree, it behaves like a normal React child in every other way. 

This means that an event fired from inside a portal will propagate (bubble up) to ancestors in the containing *React tree*, even if those ancestors are not ancestors in the *DOM tree*.
