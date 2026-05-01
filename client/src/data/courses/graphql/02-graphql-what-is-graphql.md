---
title: What is GraphQL
---

# What is GraphQL

**GraphQL** is a query language for APIs and a runtime for executing those queries. Created by Facebook in 2012 and open-sourced in 2015, it provides a complete and understandable description of the data in your API.

---

## Core Idea

With GraphQL, the **client** decides what data it needs — not the server:

```graphql
# Client asks for specific fields
query {
  user(id: "1") {
    name
    avatar
  }
}
```

The server responds with **exactly** those fields:

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "avatar": "https://example.com/alice.jpg"
    }
  }
}
```

---

## Key Concepts

### 1. Schema

The schema defines what data is available and how it's structured:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}
```

### 2. Queries (Read)

Fetch data:

```graphql
query {
  users {
    name
    email
  }
}
```

### 3. Mutations (Write)

Create, update, or delete data:

```graphql
mutation {
  createUser(name: "Bob", email: "bob@example.com") {
    id
    name
  }
}
```

### 4. Subscriptions (Real-time)

Listen for changes:

```graphql
subscription {
  messageAdded(channelId: "general") {
    text
    sender { name }
  }
}
```

---

## How It Works

```
Client                    Server
  │                         │
  │── GraphQL Query ──────▶│
  │                         │ Parse query
  │                         │ Validate against schema
  │                         │ Execute resolvers
  │◀── JSON Response ──────│
  │                         │
```

1. Client sends a query (always a POST to a single endpoint)
2. Server parses and validates the query against the schema
3. Server executes resolver functions to fetch data
4. Server returns JSON matching the query shape

---

## Single Endpoint

Unlike REST (many endpoints), GraphQL uses **one endpoint**:

```
REST:
  GET    /api/users
  GET    /api/users/123
  GET    /api/users/123/posts
  POST   /api/users

GraphQL:
  POST   /graphql    ← Everything goes here
```

---

## Who Uses GraphQL?

- **GitHub** — their public API is GraphQL
- **Shopify** — e-commerce APIs
- **Twitter** — internal APIs
- **Airbnb** — app data fetching
- **Netflix** — content APIs

---

## Key Takeaways

- GraphQL is a **query language** for APIs — clients ask for exactly what they need
- It uses a **typed schema** to describe available data
- Three operations: **queries** (read), **mutations** (write), **subscriptions** (real-time)
- **Single endpoint** replaces dozens of REST endpoints
- The server **validates** queries against the schema before executing

---

Next, we'll compare **GraphQL vs REST** in detail →
