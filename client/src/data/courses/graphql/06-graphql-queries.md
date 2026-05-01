---
title: Queries
---

# Queries

Queries are how clients **read** data from a GraphQL API. They define exactly what fields to fetch.

---

## Basic Query

```graphql
query {
  users {
    id
    name
    email
  }
}
```

Response:

```json
{
  "data": {
    "users": [
      { "id": "1", "name": "Alice", "email": "alice@example.com" },
      { "id": "2", "name": "Bob", "email": "bob@example.com" }
    ]
  }
}
```

---

## Named Queries

Give queries names for clarity and debugging:

```graphql
query GetAllUsers {
  users {
    id
    name
  }
}

query GetUserProfile {
  user(id: "1") {
    name
    email
    posts { title }
  }
}
```

---

## Nested Queries

Fetch related data in one request:

```graphql
query {
  user(id: "1") {
    name
    posts {
      title
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
```

---

## Multiple Root Fields

Query multiple things at once:

```graphql
query DashboardData {
  currentUser {
    name
    notifications { message }
  }
  recentPosts {
    title
    author { name }
  }
  stats {
    totalUsers
    totalPosts
  }
}
```

All resolved in a **single request**.

---

## Query with Arguments

```graphql
query {
  # Get a specific user
  user(id: "123") {
    name
  }

  # Get filtered posts
  posts(limit: 5, status: PUBLISHED) {
    title
    publishedAt
  }
}
```

---

## The `query` Keyword is Optional

For simple queries, you can omit it:

```graphql
# These are equivalent:
query {
  users { name }
}

{
  users { name }
}
```

But named queries require the keyword:

```graphql
query GetUsers {
  users { name }
}
```

---

## How Queries Execute

```
query {                    ← Start at Query root type
  user(id: "1") {         ← Call user resolver with arg
    name                   ← Resolve name field on User
    posts {                ← Call posts resolver on User
      title                ← Resolve title on each Post
    }
  }
}
```

The server resolves each field by calling its **resolver function** (we'll cover these when building the server).

---

## Response Format

Responses always have this structure:

```json
{
  "data": { ... },     // The requested data (null if all errors)
  "errors": [ ... ]    // Optional: any errors that occurred
}
```

- `data` matches the query shape exactly
- `errors` is only present if something went wrong
- Partial responses are possible (some data + some errors)

---

## Key Takeaways

- Queries define **exactly** which fields to fetch
- Responses **mirror** the query structure
- Nest fields to fetch **related data** in one request
- Query **multiple root fields** in a single request
- Named queries aid debugging and tooling

---

Next, we'll learn about **Arguments & Variables** — making queries dynamic →
