---
title: Client Error Handling
---

# Client Error Handling

Handle GraphQL errors gracefully in your React components for a great user experience.

---

## Error Types

```
1. GraphQL Errors — returned in response.errors array
2. Network Errors — request failed (offline, server down)
3. Runtime Errors — JavaScript errors in components
```

---

## Query Errors

```jsx
function UserProfile({ userId }) {
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <Spinner />;

  if (error) {
    // Check error type
    if (error.graphQLErrors.length > 0) {
      const code = error.graphQLErrors[0].extensions?.code;
      if (code === "NOT_FOUND") return <p>User not found</p>;
      if (code === "UNAUTHENTICATED") return <LoginPrompt />;
    }
    if (error.networkError) return <p>Network error. Please try again.</p>;
    return <p>Something went wrong</p>;
  }

  return <h1>{data.user.name}</h1>;
}
```

---

## Mutation Errors

```jsx
function CreatePostForm() {
  const [createPost, { loading, error }] = useMutation(CREATE_POST);

  const handleSubmit = async (formData) => {
    try {
      await createPost({ variables: { input: formData } });
      // Success!
    } catch (err) {
      // Error is also in the `error` variable above
      console.error("Mutation failed:", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error?.graphQLErrors.map((err, i) => {
        if (err.extensions?.code === "VALIDATION_ERROR") {
          return err.extensions.errors.map((ve) => (
            <p key={ve.field} className="text-red-500">{ve.field}: {ve.message}</p>
          ));
        }
        return <p key={i} className="text-red-500">{err.message}</p>;
      })}
      {error?.networkError && <p>Network error. Check your connection.</p>}
    </form>
  );
}
```

---

## Global Error Link

Handle errors globally:

```jsx
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.code) {
        case "UNAUTHENTICATED":
          // Redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case "FORBIDDEN":
          // Show toast notification
          toast.error("You don't have permission");
          break;
        default:
          console.error(`[GraphQL] ${operation.operationName}:`, err.message);
      }
    }
  }
  if (networkError) {
    console.error("[Network]", networkError);
    toast.error("Connection lost. Retrying...");
  }
});
```

---

## Error Boundary for GraphQL

```jsx
class GraphQLErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## Retry on Network Error

```jsx
import { RetryLink } from "@apollo/client/link/retry";

const retryLink = new RetryLink({
  delay: { initial: 300, max: 5000, jitter: true },
  attempts: { max: 3, retryIf: (error) => !!error },
});

const client = new ApolloClient({
  link: retryLink.concat(errorLink.concat(httpLink)),
  cache: new InMemoryCache(),
});
```

---

## Key Takeaways

- Handle **GraphQL errors** (validation, auth) and **network errors** separately
- Use the `error` object from hooks for component-level handling
- Use **error link** for global error handling (redirect on auth errors)
- **Retry link** automatically retries on network failures
- Show **user-friendly messages** — never expose raw error details

---

Next, we'll learn about **Testing GraphQL APIs** →
