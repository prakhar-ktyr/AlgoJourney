---
title: Object Types
---

# Object Types

Object types are the most common type in GraphQL. They represent entities with multiple fields.

---

## Defining Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  bio: String
  isActive: Boolean!
  createdAt: String!
}
```

Each field has a name and a return type.

---

## Nested Object Types

Objects can contain other objects:

```graphql
type User {
  id: ID!
  name: String!
  address: Address
  company: Company
}

type Address {
  street: String!
  city: String!
  state: String
  zip: String!
  country: String!
}

type Company {
  name: String!
  industry: String
  size: Int
}
```

Query:

```graphql
query {
  user(id: "1") {
    name
    address {
      city
      country
    }
    company {
      name
    }
  }
}
```

---

## Fields with Arguments

Object type fields can have arguments:

```graphql
type User {
  id: ID!
  name: String!
  posts(limit: Int = 10, status: PostStatus): [Post!]!
  followers(first: Int = 20): [User!]!
  avatar(size: Int = 100): String!
}
```

```graphql
query {
  user(id: "1") {
    name
    posts(limit: 3, status: PUBLISHED) {
      title
    }
    avatar(size: 200)
  }
}
```

---

## Circular References

Types can reference each other:

```graphql
type User {
  id: ID!
  name: String!
  posts: [Post!]!
  friends: [User!]!    # Self-reference
}

type Post {
  id: ID!
  title: String!
  author: User!        # Back-reference
  relatedPosts: [Post!]!  # Self-reference
}
```

GraphQL resolves these lazily — no infinite loops because the client controls depth.

---

## Root Object Types

The three special object types:

```graphql
type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}

type Subscription {
  userCreated: User!
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

---

## Key Takeaways

- Object types group **related fields** into a single entity
- Fields can return **scalars**, other **objects**, or **lists**
- Fields can have **arguments** for customization
- Types can **reference each other** (including self-references)
- Query, Mutation, Subscription are special **root** object types

---

Next, we'll learn about **Enums** — restricting fields to specific values →
