---
title: React Query
---

# React Query (TanStack Query)

While `useEffect` and `fetch` work for simple data fetching, they fall short for complex applications. 

You have to manually manage loading states, error states, data caching, background refetching, and pagination.

**React Query** (now known as TanStack Query) is a powerful data-fetching library that handles all of this automatically. It is often described as the missing data-fetching piece for React.

## Installation

```bash
npm install @tanstack/react-query
```

## Setup the Provider

Like Redux or Context, you need to wrap your application in a Provider.

**main.jsx:**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

## Fetching Data with `useQuery`

To fetch data, you use the `useQuery` hook. It requires two main things:
1. A unique **query key** (used for caching).
2. A **query function** that returns a promise (like a fetch or axios call).

**Todos.jsx:**
```jsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function Todos() {
  // useQuery handles loading, error, and data states automatically!
  const { isPending, error, data } = useQuery({
    queryKey: ['todosData'], // Unique key for caching
    queryFn: async () => {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
      return response.data;
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <ul>
      {data.slice(0, 10).map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

export default Todos;
```

## Why is React Query Amazing?

1. **Caching:** If you navigate to another page and come back, React Query instantly shows the cached data while secretly fetching the latest data in the background. Your UI feels incredibly fast.
2. **Window Focus Refetching:** If a user leaves the browser tab and comes back, React Query automatically refetches the data to ensure they see the latest information.
3. **Automatic Retries:** If a request fails due to a network glitch, React Query will automatically retry the request a few times before showing the error state.
4. **Mutations:** It provides a `useMutation` hook for creating/updating/deleting data, which can automatically invalidate caches and trigger refetches.

For any non-trivial React application that relies heavily on a backend API, React Query has become the industry standard over raw `useEffect` fetches.
