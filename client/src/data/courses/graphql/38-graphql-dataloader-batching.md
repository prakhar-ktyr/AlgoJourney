---
title: DataLoader & Batching
---

# DataLoader & Batching

**DataLoader** solves the N+1 problem by batching and caching database queries within a single request.

---

## The N+1 Problem

```graphql
query {
  posts {                    # 1 query: SELECT * FROM posts
    title
    author { name }          # N queries: SELECT * FROM users WHERE id = ?
  }
}
# 10 posts = 11 database queries!
```

---

## DataLoader Solution

DataLoader collects all IDs requested in a single tick and batches them into one query:

```bash
npm install dataloader
```

```javascript
import DataLoader from "dataloader";

// Batch function — receives array of IDs, returns array of results (same order)
async function batchUsers(ids) {
  const users = await User.find({ _id: { $in: ids } });
  // Must return results in the same order as ids
  const userMap = new Map(users.map((u) => [u.id.toString(), u]));
  return ids.map((id) => userMap.get(id.toString()) || null);
}

// Create loader (per-request!)
const userLoader = new DataLoader(batchUsers);
```

---

## Integration with Context

```javascript
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: await authenticate(req),
      loaders: {
        user: new DataLoader(batchUsers),
        post: new DataLoader(batchPosts),
        comment: new DataLoader(batchComments),
      },
    }),
  })
);
```

---

## Using in Resolvers

```javascript
const resolvers = {
  Post: {
    // Before: N queries
    // author: (parent) => User.findById(parent.author),

    // After: 1 batched query for all authors
    author: (parent, _, { loaders }) => loaders.user.load(parent.author.toString()),
  },
  User: {
    posts: (parent, _, { loaders }) => loaders.post.load(parent.id),
  },
};
```

Result: 10 posts → 1 query for posts + 1 batched query for all authors = **2 queries total**.

---

## How DataLoader Works

```
Tick 1: resolver calls loader.load("1")
Tick 1: resolver calls loader.load("2")
Tick 1: resolver calls loader.load("3")
--- end of tick ---
DataLoader calls batchFn(["1", "2", "3"])  ← Single query!
Results distributed to each caller
```

---

## Caching (Per-Request)

DataLoader caches within a request:

```javascript
// Same ID → same object (no duplicate queries)
await userLoader.load("1"); // DB query
await userLoader.load("1"); // From cache (same request)
await userLoader.load("1"); // From cache
```

**Important**: Create new DataLoader instances per request (in context). Don't share across requests.

---

## Batch Function for One-to-Many

```javascript
async function batchPostsByAuthor(authorIds) {
  const posts = await Post.find({ author: { $in: authorIds } });
  const grouped = new Map();
  for (const post of posts) {
    const key = post.author.toString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(post);
  }
  return authorIds.map((id) => grouped.get(id.toString()) || []);
}
```

---

## Key Takeaways

- **DataLoader** batches multiple `.load()` calls into a single query
- Create DataLoader instances **per-request** in context
- Batch functions must return results in the **same order** as input IDs
- Solves N+1: 11 queries → 2 queries
- Also provides **per-request caching** (deduplication)

---

Next, we'll learn about **Caching** strategies for GraphQL →
