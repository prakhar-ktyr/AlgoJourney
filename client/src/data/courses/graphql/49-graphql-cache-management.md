---
title: Cache Management
---

# Cache Management

Apollo Client's **InMemoryCache** is a normalized cache that stores data by type and ID. Understanding it is key to building efficient apps.

---

## How the Cache Works

Apollo normalizes responses into flat records:

```json
// Query response
{
  "user": {
    "id": "1",
    "name": "Alice",
    "posts": [
      { "id": "10", "title": "Hello" },
      { "id": "11", "title": "World" }
    ]
  }
}

// Stored in cache as:
// User:1 → { id: "1", name: "Alice", posts: [Ref(Post:10), Ref(Post:11)] }
// Post:10 → { id: "10", title: "Hello" }
// Post:11 → { id: "11", title: "World" }
```

When the same `Post:10` appears in another query, it's **the same cache entry**.

---

## Cache Configuration

```javascript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          // Merge paginated results
          keyArgs: ["filter"],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    User: {
      // Custom cache key (default is __typename + id)
      keyFields: ["id"],
    },
  },
});
```

---

## Reading from Cache

```javascript
// Read a query
const data = client.readQuery({
  query: GET_USERS,
});

// Read a specific entity
const user = client.readFragment({
  id: "User:1",
  fragment: gql`
    fragment UserFields on User {
      id
      name
      email
    }
  `,
});
```

---

## Writing to Cache

```javascript
// Write a query result
client.writeQuery({
  query: GET_USERS,
  data: { users: [...existingUsers, newUser] },
});

// Write a fragment (update one entity)
client.writeFragment({
  id: "User:1",
  fragment: gql`
    fragment UpdateUser on User {
      name
    }
  `,
  data: { name: "Alice Updated" },
});
```

---

## Cache After Mutations

```jsx
const [deletePost] = useMutation(DELETE_POST, {
  update(cache, { data: { deletePost } }) {
    // Remove from cache
    cache.evict({ id: `Post:${deletePost.id}` });
    cache.gc(); // Garbage collect orphaned references
  },
});

const [updatePost] = useMutation(UPDATE_POST, {
  // Apollo auto-updates if mutation returns id + changed fields
  // Just make sure to request `id` in the mutation response!
});
```

---

## Cache Eviction

```javascript
// Evict a specific entity
cache.evict({ id: "User:1" });

// Evict a specific field
cache.evict({ id: "User:1", fieldName: "posts" });

// Garbage collect unreferenced entities
cache.gc();

// Reset entire cache (e.g., on logout)
client.resetStore();
```

---

## Pagination with Cache

```javascript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: ["filter"], // Different filters = different cache entries
          merge(existing = { edges: [] }, incoming) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
      },
    },
  },
});
```

```jsx
// Load more
const { data, fetchMore } = useQuery(GET_POSTS, { variables: { first: 10 } });

<button onClick={() => fetchMore({
  variables: { after: data.posts.pageInfo.endCursor },
})}>
  Load More
</button>
```

---

## Key Takeaways

- Apollo normalizes data by **type + id** for efficient caching
- The cache auto-updates when mutations return **id + changed fields**
- Use `readQuery`/`writeQuery` for manual cache manipulation
- Configure **typePolicies** for pagination merging
- `evict` + `gc` for removing stale data
- `resetStore` on logout to clear all cached data

---

Next, we'll learn about **Optimistic Updates** →
