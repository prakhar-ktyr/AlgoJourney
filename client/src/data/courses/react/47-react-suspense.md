---
title: React Suspense
---

# React Suspense

`<Suspense>` lets you display a fallback UI while you wait for some code or data to load.

We saw `<Suspense>` used for Code Splitting with `React.lazy()` in the previous lesson. However, in modern React (React 18+), Suspense is becoming the standard way to handle **data fetching** as well.

## The Problem with Traditional Fetching

Usually, when you fetch data, you use `useState` to track a `loading` boolean.

```jsx
function Profile() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile().then(d => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Spinner />;
  
  return <ProfileDetails data={data} />;
}
```
If you have a complex dashboard with 5 different widgets fetching data, you have to manage 5 different loading states. This often leads to a messy UI where different parts of the screen "pop in" at different times (waterfall rendering).

## Suspense for Data Fetching

With Suspense, your component doesn't need to track a loading state. Instead, if the data is not ready, the component "suspends" rendering. React catches this suspension and renders the nearest `<Suspense fallback={...}>` higher up in the tree.

*Note: To use Suspense for data fetching, you must use a compatible library like Relay, SWR, Next.js, or React Query. Standard `fetch` in a `useEffect` does NOT trigger Suspense.*

```jsx
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query'; // Requires React Query setup

// This component assumes the data is already there! No loading state!
function UserProfile() {
  const { data } = useQuery({ 
    queryKey: ['user'], 
    queryFn: fetchUser,
    suspense: true // Tell React Query to use Suspense
  });

  return <h1>{data.name}</h1>;
}

function App() {
  return (
    <div>
      <Sidebar />
      <main>
        {/* If UserProfile suspends, React shows the Skeleton */}
        <Suspense fallback={<ProfileSkeleton />}>
          <UserProfile />
        </Suspense>
      </main>
    </div>
  );
}
```

## Coordinating Multiple Suspense Boundaries

The true power of Suspense is how it coordinates loading states.

If you place two components inside a single `<Suspense>` boundary, React will wait until *both* components have their data ready before showing the final UI.

```jsx
<Suspense fallback={<Spinner />}>
  {/* The Spinner shows until BOTH Profile and Timeline are ready */}
  <ProfileDetails />
  <ProfileTimeline />
</Suspense>
```

If you wrap them separately, they will load independently:

```jsx
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileDetails />
</Suspense>
<Suspense fallback={<TimelineSkeleton />}>
  <ProfileTimeline />
</Suspense>
```

Suspense fundamentally changes how we think about loading states in React, moving the responsibility from individual components to declarative boundaries in the component tree.
