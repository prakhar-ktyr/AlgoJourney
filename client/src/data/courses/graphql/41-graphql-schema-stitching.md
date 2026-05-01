---
title: Schema Stitching
---

# Schema Stitching

Schema stitching combines multiple GraphQL schemas into one. It's an alternative to Federation for merging schemas.

---

## Schema Stitching vs Federation

| Feature | Schema Stitching | Apollo Federation |
|---------|-----------------|-------------------|
| Gateway | Custom (graphql-tools) | Apollo Router |
| Service awareness | Services unaware of each other | Services use federation directives |
| Complexity | More manual | More automated |
| Best for | Wrapping existing APIs | Greenfield microservices |

---

## Basic Schema Stitching

```bash
npm install @graphql-tools/stitch @graphql-tools/wrap
```

```javascript
import { stitchSchemas } from "@graphql-tools/stitch";
import { buildSchema } from "graphql";

const usersSchema = buildSchema(`
  type User { id: ID!, name: String!, email: String! }
  type Query { users: [User!]!, user(id: ID!): User }
`);

const postsSchema = buildSchema(`
  type Post { id: ID!, title: String!, authorId: ID! }
  type Query { posts: [Post!]!, postsByAuthor(authorId: ID!): [Post!]! }
`);

const stitchedSchema = stitchSchemas({
  subschemas: [
    { schema: usersSchema, executor: usersExecutor },
    { schema: postsSchema, executor: postsExecutor },
  ],
});
```

---

## Type Merging

Combine types from different sources:

```javascript
const stitchedSchema = stitchSchemas({
  subschemas: [
    {
      schema: usersSchema,
      merge: {
        User: {
          selectionSet: "{ id }",
          fieldName: "user",
          args: ({ id }) => ({ id }),
        },
      },
    },
    {
      schema: postsSchema,
      merge: {
        User: {
          selectionSet: "{ id }",
          fieldName: "userWithPosts",
          args: ({ id }) => ({ id }),
        },
      },
    },
  ],
});
```

---

## Remote Schema Stitching

Stitch schemas from remote GraphQL services:

```javascript
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";

const usersExecutor = buildHTTPExecutor({ endpoint: "http://localhost:4001/graphql" });
const postsExecutor = buildHTTPExecutor({ endpoint: "http://localhost:4002/graphql" });

const usersSchema = await schemaFromExecutor(usersExecutor);
const postsSchema = await schemaFromExecutor(postsExecutor);

const gatewaySchema = stitchSchemas({
  subschemas: [
    { schema: usersSchema, executor: usersExecutor },
    { schema: postsSchema, executor: postsExecutor },
  ],
});
```

---

## When to Use Schema Stitching

- Wrapping **existing** GraphQL APIs into a unified gateway
- Combining **third-party** GraphQL APIs
- Migrating from monolith to microservices gradually
- When you **don't control** the subgraph services

---

## Key Takeaways

- Schema stitching **merges multiple schemas** into one
- Use it when combining **existing** or **third-party** GraphQL APIs
- **Federation** is preferred for new microservice architectures
- **Type merging** resolves the same type from multiple sources
- Use remote executors to stitch live services together

---

Next, we'll learn about **Real-time Subscriptions** with WebSocket →
