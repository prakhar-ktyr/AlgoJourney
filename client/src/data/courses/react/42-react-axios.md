---
title: React Axios
---

# React Axios

While the native `fetch` API is great, many React developers prefer using a third-party library called **Axios** for handling HTTP requests.

Axios is a promise-based HTTP client for the browser and Node.js.

## Why Axios over Fetch?

1. **Automatic JSON Data Transformation:** With `fetch`, you have to manually parse the response using `.json()`. Axios does this automatically.
2. **Error Handling:** `fetch` only throws an error on network failures. If an API returns a 404 or 500 error, `fetch` still resolves successfully! Axios automatically rejects the promise for status codes outside the 200-299 range.
3. **Interceptors:** You can intercept requests or responses before they are handled (great for attaching authentication tokens globally).
4. **Timeouts:** Axios makes it easy to set a timeout for a request.

## Installation

Before you can use Axios, you must install it via npm.

```bash
npm install axios
```

## Making a GET Request

Let's convert our previous `fetch` example to use Axios.

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Axios automatically parses the JSON response into `res.data`
    axios.get("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        // Axios catches 404, 500, and network errors here
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

export default UserList;
```

## Making a POST Request

Axios makes it incredibly simple to send data to a server (like when submitting a form).

```jsx
import axios from 'axios';
import { useState } from 'react';

function CreatePost() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Pass the data object as the second argument
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title: title,
        body: 'This is the post body',
        userId: 1,
      });
      
      console.log('Post created:', response.data);
      alert('Post Created!');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Enter Title"
      />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

Axios automatically stringifies the JavaScript object into JSON and sets the correct `Content-Type: application/json` headers!
