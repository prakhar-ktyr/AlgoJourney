---
title: Interfaces
---

# Interfaces

Interfaces define a set of fields that multiple types must implement — enabling polymorphism in GraphQL.

---

## Defining an Interface

```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: String!
  updatedAt: String!
}

type User implements Node & Timestamped {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
  updatedAt: String!
}

type Post implements Node & Timestamped {
  id: ID!
  title: String!
  body: String!
  createdAt: String!
  updatedAt: String!
}
```

Types that implement an interface **must** include all interface fields.

---

## Querying Interfaces

```graphql
interface SearchResult {
  id: ID!
  title: String!
  url: String!
}

type Article implements SearchResult {
  id: ID!
  title: String!
  url: String!
  body: String!
  author: User!
}

type Video implements SearchResult {
  id: ID!
  title: String!
  url: String!
  duration: Int!
  thumbnailUrl: String!
}

type Query {
  search(term: String!): [SearchResult!]!
}
```

Query:

```graphql
query {
  search(term: "graphql") {
    # Fields from the interface (always available)
    id
    title
    url

    # Type-specific fields (use inline fragments)
    ... on Article {
      body
      author { name }
    }
    ... on Video {
      duration
      thumbnailUrl
    }
  }
}
```

---

## The `__typename` Field

Every type has a built-in `__typename` field:

```graphql
query {
  search(term: "graphql") {
    __typename
    title
  }
}
```

```json
{
  "data": {
    "search": [
      { "__typename": "Article", "title": "Intro to GraphQL" },
      { "__typename": "Video", "title": "GraphQL Tutorial" }
    ]
  }
}
```

---

## Resolving Interface Types

The server must tell GraphQL which concrete type each result is:

```javascript
const resolvers = {
  SearchResult: {
    __resolveType(obj) {
      if (obj.duration !== undefined) return "Video";
      if (obj.body !== undefined) return "Article";
      return null;
    },
  },
};
```

---

## Common Interface Patterns

```graphql
# Relay-style Node interface
interface Node {
  id: ID!
}

# Auditable entities
interface Auditable {
  createdAt: String!
  createdBy: User!
  updatedAt: String!
  updatedBy: User
}

# Error interface
interface Error {
  message: String!
  code: String!
}
```

---

## Key Takeaways

- Interfaces define **shared fields** that types must implement
- Types can implement **multiple** interfaces
- Use **inline fragments** (`... on Type`) for type-specific fields
- Implement `__resolveType` on the server to identify concrete types
- Common patterns: `Node` (ID), `Timestamped`, `Error`

---

Next, we'll learn about **Union Types** — returning different types from a field →
