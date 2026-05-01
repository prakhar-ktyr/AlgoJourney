---
title: React Custom Hooks
---

# React Custom Hooks

Hooks are reusable functions.

When you have component logic that needs to be used by multiple components, we can extract that logic to a Custom Hook.

Custom Hooks start with "use". Example: `useFetch`.

## Why Custom Hooks?

Imagine you are fetching data from an API in several different components. Writing the `useEffect` and `useState` logic every time would be repetitive.

Let's look at how we can extract this logic into a Custom Hook.

## Building a Custom Hook

We will create a Hook called `useFetch`.

A Custom Hook is just a JavaScript function whose name starts with "use" and that may call other Hooks.

**useFetch.js:**
```jsx
import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We use a clean-up mechanism (AbortController) to handle component unmounting
    const abortCont = new AbortController();

    fetch(url, { signal: abortCont.signal })
      .then((res) => {
        if (!res.ok) {
          throw Error('Could not fetch the data');
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.log('fetch aborted');
        } else {
          setLoading(false);
          setError(err.message);
        }
      });

    return () => abortCont.abort();
  }, [url]); // The effect reruns if the URL changes

  // We return the state values so they can be used by components
  return { data, loading, error };
};

export default useFetch;
```

## Using a Custom Hook

Now we can use our custom Hook in any component!

**App.jsx:**
```jsx
import useFetch from './useFetch';

const App = () => {
  // Use the custom hook just like a built-in hook!
  const { data: users, loading, error } = useFetch('https://jsonplaceholder.typicode.com/users');

  return (
    <>
      { error && <div>{ error }</div> }
      { loading && <div>Loading...</div> }
      { users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default App;
```

We've abstracted the fetching logic into a single reusable file. If we ever need to fetch data in another component, we just import `useFetch`.
