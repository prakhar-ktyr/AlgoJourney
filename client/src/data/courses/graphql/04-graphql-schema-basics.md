---
title: Schema Basics
---

# Schema Basics

The **schema** is the contract between client and server. It defines what data is available, what queries are possible, and what shape responses take.

---

## Schema Definition Language (SDL)

GraphQL has its own language for defining schemas:

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  publishedYear: Int
  rating: Float
  isAvailable: Boolean!
}
```

---

## Root Types

Every schema has up to three root types:

```graphql
type Query {
  # Read operations (like GET in REST)
  books: [Book!]!
  book(id: ID!): Book
}

type Mutation {
  # Write operations (like POST/PUT/DELETE)
  createBook(title: String!, author: String!): Book!
  deleteBook(id: ID!): Boolean!
}

type Subscription {
  # Real-time events
  bookAdded: Book!
}
```

- **Query** — entry point for all reads (required)
- **Mutation** — entry point for all writes (optional)
- **Subscription** — entry point for real-time events (optional)

---

## Schema = Type Definitions

A complete schema:

```graphql
type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, authorId: ID!): Post!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  createdAt: String!
}
```

---

## The `!` (Non-Null) Modifier

```graphql
type User {
  id: ID!          # Never null
  name: String!    # Never null
  bio: String      # Can be null
  posts: [Post!]!  # List is never null, items are never null
}
```

| Declaration | Meaning |
|-------------|---------|
| `String` | Nullable string |
| `String!` | Non-null string |
| `[String]` | Nullable list of nullable strings |
| `[String!]!` | Non-null list of non-null strings |

---

## Schema Introspection

Clients can query the schema itself:

```graphql
query {
  __schema {
    types {
      name
      fields {
        name
        type { name }
      }
    }
  }
}
```

This is how tools like GraphQL Playground auto-generate documentation.

---

## Schema-First vs Code-First

**Schema-first**: Write SDL, then implement resolvers

```graphql
# schema.graphql
type Query {
  hello: String!
}
```

**Code-first**: Define types in code, SDL is generated

```javascript
const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: { hello: { type: GraphQLString } },
});
```

Most modern tools use **schema-first** with SDL.

---

## Key Takeaways

- The **schema** is the single source of truth for your API
- **SDL** (Schema Definition Language) defines types and operations
- Three root types: **Query**, **Mutation**, **Subscription**
- `!` means non-null — the field is guaranteed to have a value
- Schemas are **self-documenting** via introspection

---

Next, we'll dive into **Types & Fields** — the building blocks of schemas →
