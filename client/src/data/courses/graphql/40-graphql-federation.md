---
title: Federation & Microservices
---

# Federation & Microservices

**Apollo Federation** lets you split a GraphQL API across multiple services while exposing a single unified schema to clients.

---

## Why Federation?

As APIs grow, a single monolithic server becomes hard to maintain:

```
Monolith:  One server, one schema, one team
Federation: Multiple services, unified schema, multiple teams
```

---

## Architecture

```
Client
  │
  ▼
Gateway (Apollo Router)
  │
  ├── Users Service     (owns User type)
  ├── Posts Service      (owns Post type)
  ├── Comments Service   (owns Comment type)
  └── Notifications Service
```

The **gateway** composes subgraph schemas and routes queries.

---

## Subgraph: Users Service

```graphql
# users-service/schema.graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
}

type Query {
  users: [User!]!
  user(id: ID!): User
}
```

The `@key` directive marks `User` as an entity that other services can reference.

---

## Subgraph: Posts Service

```graphql
# posts-service/schema.graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  author: User!
}

# Extend User from users-service
type User @key(fields: "id") {
  id: ID!
  posts: [Post!]!
}

type Query {
  posts: [Post!]!
  post(id: ID!): Post
}
```

The Posts service **extends** User to add the `posts` field.

---

## Reference Resolver

Each service must resolve its entities by key:

```javascript
// posts-service resolvers
const resolvers = {
  User: {
    __resolveReference: (ref) => {
      // ref = { id: "123" } — just the key fields
      // Return enough data for this service's fields
      return { id: ref.id }; // posts resolver will handle the rest
    },
    posts: (user) => Post.find({ author: user.id }),
  },
  Post: {
    __resolveReference: (ref) => Post.findById(ref.id),
    author: (post) => ({ __typename: "User", id: post.authorId }),
  },
};
```

---

## Gateway Setup

```bash
npm install @apollo/gateway @apollo/server
```

```javascript
import { ApolloServer } from "@apollo/server";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:4001/graphql" },
      { name: "posts", url: "http://localhost:4002/graphql" },
      { name: "comments", url: "http://localhost:4003/graphql" },
    ],
  }),
});

const server = new ApolloServer({ gateway });
```

---

## Client Sees One Schema

```graphql
# Client doesn't know about services
query {
  user(id: "1") {
    name              # Resolved by Users service
    posts {           # Resolved by Posts service
      title
      comments {      # Resolved by Comments service
        text
      }
    }
  }
}
```

---

## Key Takeaways

- **Federation** splits a schema across multiple services
- A **gateway** composes subgraphs into a unified API
- `@key` marks entities that can be referenced across services
- `__resolveReference` resolves entities by their key
- Clients see a **single schema** — they don't know about services

---

Next, we'll learn about **Schema Stitching** →
