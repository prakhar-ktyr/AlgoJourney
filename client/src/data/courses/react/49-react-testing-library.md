---
title: React Testing Library
---

# React Testing Library

Let's dive deeper into how to use React Testing Library (RTL) to test interactive components.

## The Component to Test

Imagine we have a simple counter component.

**Counter.jsx:**
```jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Writing the Test

To test this component, we need to:
1. Render it.
2. Verify the initial state (count is 0).
3. Simulate a user clicking the button.
4. Verify the new state (count is 1).

**Counter.test.jsx:**
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
// user-event is the recommended way to simulate interactions over fireEvent
import userEvent from '@testing-library/user-event'; 
import Counter from './Counter';

describe('Counter Component', () => {

  it('increments the count when the button is clicked', async () => {
    // 1. Render the component
    render(<Counter />);

    // 2. Check initial state
    // We use a regular expression /current count: 0/i to make it case-insensitive
    const countText = screen.getByText(/current count: 0/i);
    expect(countText).toBeInTheDocument();

    // 3. Find the button using its accessible role
    const button = screen.getByRole('button', { name: /increment/i });

    // 4. Simulate the user clicking the button
    // Note: userEvent APIs are asynchronous, so we use await
    const user = userEvent.setup();
    await user.click(button);

    // 5. Verify the UI updated correctly
    const newCountText = screen.getByText(/current count: 1/i);
    expect(newCountText).toBeInTheDocument();
  });

});
```

## How to find elements (`screen` Queries)

RTL provides different queries to find elements. They are ordered by preference (how closely they match how a user finds things on a screen).

**1. Queries Accessible to Everyone (Preferred):**
* `getByRole`: Used to find buttons, links, headings. E.g., `screen.getByRole('button', { name: 'Submit' })`
* `getByText`: Finds elements based on their text content.
* `getByLabelText`: Finds form inputs based on their associated `<label>`.

**2. Semantic Queries:**
* `getByAltText`: Used primarily for images.
* `getByTitle`: Finds elements by their `title` attribute.

**3. Test IDs (Last Resort):**
* `getByTestId`: If you cannot find an element by role or text (e.g., an animated wrapper div), you can add `data-testid="my-div"` to the HTML and query it using `screen.getByTestId('my-div')`.

## Query Types (`get` vs `query` vs `find`)

* `getBy...`: Returns the element, or **throws an error** if it isn't found. Use this for elements that *should* be there.
* `queryBy...`: Returns the element, or **null** if it isn't found. Use this to assert that an element is NOT on the screen (`expect(element).toBeNull()`).
* `findBy...`: Returns a **Promise**. Use this for elements that will appear asynchronously (e.g., after a loading spinner disappears).
