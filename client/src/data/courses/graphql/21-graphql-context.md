---
title: Context
---

# Context

Context is a shared object available to **every resolver** in a request. It's perfect for authentication, database connections, and per-request data.

---

## Setting Up Context

```javascript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      // This runs for every request
      const token = req.headers.authorization?.replace("Bearer ", "");
      const user = token ? await verifyToken(token) : null;

      return {
        user,              // Current authenticated user
        db: databasePool,  // Database connection
        loaders: createLoaders(), // DataLoader instances
      };
    },
  })
);
```

---

## Using Context in Resolvers

```javascript
const resolvers = {
  Query: {
    me: (_, __, context) => {
      if (!context.user) throw new Error("Not authenticated");
      return context.user;
    },
    users: async (_, __, { db }) => {
      return await db.query("SELECT * FROM users");
    },
  },
  Mutation: {
    createPost: async (_, { input }, { user, db }) => {
      if (!user) throw new Error("Not authenticated");
      return await db.query(
        "INSERT INTO posts (title, author_id) VALUES ($1, $2)",
        [input.title, user.id]
      );
    },
  },
};
```

---

## What to Put in Context

| Item | Purpose |
|------|---------|
| `user` | Authenticated user from token |
| `db` | Database connection/pool |
| `loaders` | DataLoader instances (batching) |
| `req` | Express request object |
| `logger` | Request-scoped logger |

---

## Context is Per-Request

A new context is created for **every GraphQL request**. This is important for:

- **Authentication** — each request has its own user
- **DataLoader** — batching is per-request
- **Request ID** — tracing individual requests

```javascript
context: async ({ req }) => ({
  requestId: crypto.randomUUID(),
  user: await authenticate(req),
  loaders: {
    user: new DataLoader(batchUsers),
    post: new DataLoader(batchPosts),
  },
}),
```

---

## Authentication Pattern

```javascript
// helpers/auth.js
export async function authenticate(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.userId);
  } catch {
    return null;
  }
}

// Context
context: async ({ req }) => ({
  user: await authenticate(req),
}),

// Resolver
Query: {
  me: (_, __, { user }) => {
    if (!user) throw new GraphQLError("UNAUTHENTICATED");
    return user;
  },
},
```

---

## Key Takeaways

- Context is shared across **all resolvers** in a single request
- Set up context in the server configuration (runs per-request)
- Store **auth user**, **DB connections**, and **DataLoaders** in context
- Access via the **third argument** in resolvers: `(parent, args, context)`
- Context is **fresh for each request** — no state leaks between requests

---

Next, we'll learn about **Data Sources** — organizing data fetching →
