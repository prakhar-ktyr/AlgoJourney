---
title: React Fetching Data
---

# React Fetching Data

Most React applications need to interact with an external API to fetch or save data.

The most common way to fetch data in React is by using the native JavaScript `fetch` API inside a `useEffect` hook.

## The Fetch API

The `fetch()` method starts the process of fetching a resource from the network, returning a Promise which is fulfilled once the response is available.

## Fetching Data on Component Mount

If you want to fetch data as soon as a component loads on the screen, you place the `fetch` call inside a `useEffect` hook with an empty dependency array `[]`.

```jsx
import { useState, useEffect } from "react";

function UserList() {
  // 1. Set up state variables
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Use useEffect to run fetch on mount
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);      // Save data to state
        setLoading(false);   // Turn off loading state
      })
      .catch((error) => {
        setError(error.message); // Save error to state
        setLoading(false);
      });
  }, []); // Empty array means this runs ONCE on mount

  // 3. Conditional rendering based on state
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
}

export default UserList;
```

## Using async / await

You can also use the cleaner `async/await` syntax inside `useEffect`.

Because `useEffect` cannot accept an `async` function directly, you must define an async function *inside* the effect and then call it.

```jsx
useEffect(() => {
  // Define the async function
  const fetchData = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Call the function immediately
  fetchData();
}, []);
```

## Avoiding Race Conditions

If you fetch data based on a changing prop (e.g., `fetch(/user/${userId})`), you might encounter race conditions if a user clicks quickly between IDs. The first request might resolve *after* the second request, overwriting the correct data with stale data.

To fix this, you should use an **AbortController** to cancel pending fetch requests if the component unmounts or the effect re-runs.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`https://api.example.com/user/${userId}`, { 
    signal: controller.signal 
  })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
      }
    });

  // Cleanup function: abort the fetch if the component unmounts or userId changes
  return () => {
    controller.abort();
  };
}, [userId]);
```
