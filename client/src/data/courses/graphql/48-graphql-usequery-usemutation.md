---
title: useQuery & useMutation
---

# useQuery & useMutation

Apollo Client's React hooks provide a clean API for data fetching and mutations.

---

## useQuery

```jsx
import { useQuery, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    users { id, name, email }
  }
`;

function UserList() {
  const { data, loading, error } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  );
}
```

---

## useQuery with Variables

```jsx
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) { id, name, email, posts { title } }
  }
`;

function UserProfile({ userId }) {
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
      <h2>Posts</h2>
      {data.user.posts.map((post) => <p key={post.id}>{post.title}</p>)}
    </div>
  );
}
```

---

## useQuery Options

```jsx
const { data, loading, error, refetch, fetchMore } = useQuery(GET_POSTS, {
  variables: { limit: 10 },
  pollInterval: 30000,        // Re-fetch every 30 seconds
  fetchPolicy: "cache-and-network",  // Show cached, then update
  skip: !isAuthenticated,     // Skip query conditionally
  onCompleted: (data) => console.log("Data loaded:", data),
  onError: (error) => console.error("Query failed:", error),
});
```

### Fetch Policies

| Policy | Behavior |
|--------|----------|
| `cache-first` | Use cache if available (default) |
| `cache-and-network` | Show cache, then update from network |
| `network-only` | Always fetch from network |
| `cache-only` | Only use cache, never fetch |
| `no-cache` | Fetch without caching |

---

## useMutation

```jsx
import { useMutation, gql } from "@apollo/client";

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) { id, name, email }
  }
`;

function CreateUserForm() {
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await createUser({
      variables: {
        input: {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create User"}
      </button>
      {error && <p>Error: {error.message}</p>}
      {data && <p>Created: {data.createUser.name}</p>}
    </form>
  );
}
```

---

## Updating Cache After Mutation

```jsx
const [createPost] = useMutation(CREATE_POST, {
  // Option 1: Refetch queries
  refetchQueries: [{ query: GET_POSTS }],

  // Option 2: Update cache directly
  update(cache, { data: { createPost } }) {
    const existing = cache.readQuery({ query: GET_POSTS });
    cache.writeQuery({
      query: GET_POSTS,
      data: { posts: [createPost, ...existing.posts] },
    });
  },
});
```

---

## useSubscription

```jsx
import { useSubscription, gql } from "@apollo/client";

const MESSAGE_SENT = gql`
  subscription OnMessage($channel: String!) {
    messageSent(channel: $channel) { id, text, sender { name } }
  }
`;

function Chat({ channel }) {
  const { data } = useSubscription(MESSAGE_SENT, {
    variables: { channel },
  });

  // data updates whenever a new message arrives
  return data ? <p>{data.messageSent.sender.name}: {data.messageSent.text}</p> : null;
}
```

---

## Key Takeaways

- `useQuery` fetches data and returns `{ data, loading, error }`
- `useMutation` returns `[mutateFunction, { data, loading, error }]`
- Use **variables** to pass dynamic values
- **Fetch policies** control cache vs network behavior
- Update cache after mutations with `refetchQueries` or `update`

---

Next, we'll learn about **Cache Management** →
