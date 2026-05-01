---
title: Arguments & Variables
---

# Arguments & Variables

Arguments make queries dynamic. Variables separate query structure from data, enabling reuse and security.

---

## Field Arguments

Fields can accept arguments to filter or customize results:

```graphql
type Query {
  user(id: ID!): User
  posts(limit: Int = 10, offset: Int = 0, status: PostStatus): [Post!]!
  search(term: String!): [SearchResult!]!
}
```

Using arguments:

```graphql
query {
  user(id: "42") {
    name
  }
  posts(limit: 5, status: PUBLISHED) {
    title
  }
}
```

---

## Variables

Instead of hardcoding values, use **variables**:

```graphql
# Query definition with variable declarations
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
```

Variables are passed separately (as JSON):

```json
{
  "userId": "42"
}
```

---

## Why Use Variables?

1. **Reusability** — same query, different data
2. **Security** — prevents injection (values are typed)
3. **Performance** — query string can be cached/persisted
4. **Readability** — separates structure from data

```graphql
# ❌ Hardcoded (bad for production)
query {
  user(id: "42") { name }
}

# ✅ Variables (production-ready)
query GetUser($id: ID!) {
  user(id: $id) { name }
}
```

---

## Variable Types

Variables must declare their type, matching the argument type:

```graphql
query SearchPosts(
  $term: String!        # Required string
  $limit: Int = 10      # Optional with default
  $status: PostStatus   # Optional enum
  $tags: [String!]      # Optional list of non-null strings
) {
  posts(term: $term, limit: $limit, status: $status, tags: $tags) {
    title
    body
  }
}
```

Variables JSON:

```json
{
  "term": "graphql",
  "limit": 5,
  "status": "PUBLISHED",
  "tags": ["tutorial", "beginner"]
}
```

---

## Default Values

Variables can have defaults:

```graphql
query GetPosts($limit: Int = 20, $offset: Int = 0) {
  posts(limit: $limit, offset: $offset) {
    title
  }
}
```

If `$limit` isn't provided, it defaults to `20`.

---

## Using Variables in Mutations

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

```json
{
  "input": {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "securepass123"
  }
}
```

---

## Sending Variables from JavaScript

```javascript
const query = `
  query GetUser($id: ID!) {
    user(id: $id) { name, email }
  }
`;

const response = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query,
    variables: { id: "42" },
  }),
});

const { data } = await response.json();
```

---

## Key Takeaways

- **Arguments** make fields dynamic (filter, paginate, search)
- **Variables** separate query structure from data
- Variables are **typed** and validated by the server
- Use **default values** for optional parameters
- Always use variables in production — never hardcode values in queries

---

Next, we'll learn about **Aliases & Fragments** — reusing query parts →
