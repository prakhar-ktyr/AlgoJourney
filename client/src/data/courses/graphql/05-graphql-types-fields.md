---
title: Types & Fields
---

# Types & Fields

Types are the building blocks of a GraphQL schema. Every piece of data has a type, and every type has fields.

---

## Built-in Scalar Types

GraphQL has five built-in scalar types:

| Type | Description | Example |
|------|-------------|---------|
| `Int` | 32-bit integer | `42` |
| `Float` | Double-precision float | `3.14` |
| `String` | UTF-8 text | `"hello"` |
| `Boolean` | True or false | `true` |
| `ID` | Unique identifier (serialized as String) | `"abc123"` |

---

## Object Types

Define your own types with fields:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  score: Float
  isActive: Boolean!
}
```

Each field has:
- A **name** (camelCase)
- A **type** (scalar, object, enum, etc.)
- An optional **non-null modifier** (`!`)

---

## Fields with Arguments

Fields can accept arguments:

```graphql
type Query {
  user(id: ID!): User
  users(limit: Int = 10, offset: Int = 0): [User!]!
  search(term: String!, category: String): [SearchResult!]!
}
```

Arguments can have **default values** (`limit: Int = 10`).

---

## Relationships Between Types

Types can reference each other:

```graphql
type User {
  id: ID!
  name: String!
  posts: [Post!]!        # User has many posts
  profile: Profile       # User has one profile (nullable)
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!          # Post belongs to a user
  comments: [Comment!]!  # Post has many comments
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}

type Profile {
  bio: String
  website: String
  avatar: String
}
```

---

## Query Examples with Types

Given the schema above:

```graphql
# Get a user with their posts
query {
  user(id: "1") {
    name
    posts {
      title
      comments {
        text
        author { name }
      }
    }
  }
}
```

The response mirrors the query structure:

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "posts": [
        {
          "title": "Hello World",
          "comments": [
            { "text": "Great post!", "author": { "name": "Bob" } }
          ]
        }
      ]
    }
  }
}
```

---

## Field Naming Conventions

- Use **camelCase** for field names: `firstName`, `createdAt`
- Use **PascalCase** for type names: `User`, `BlogPost`
- Use descriptive names: `publishedAt` not `date`
- Boolean fields: `isActive`, `hasPermission`, `canEdit`

---

## Key Takeaways

- GraphQL has 5 built-in scalar types: `Int`, `Float`, `String`, `Boolean`, `ID`
- **Object types** group related fields together
- Fields can have **arguments** with optional defaults
- Types reference each other to create **relationships**
- Query responses **mirror** the shape of the query

---

Next, we'll learn about **Queries** — how clients fetch data →
