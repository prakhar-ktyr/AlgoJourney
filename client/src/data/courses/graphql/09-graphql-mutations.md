---
title: Mutations
---

# Mutations

Mutations are how you **write** data in GraphQL — create, update, and delete operations.

---

## Basic Mutation

```graphql
mutation {
  createUser(name: "Alice", email: "alice@example.com") {
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
    "createUser": {
      "id": "42",
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

---

## Schema Definition

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  publishPost(id: ID!): Post!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  email: String
  bio: String
}
```

---

## Using Input Types

Input types group mutation arguments cleanly:

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}
```

Variables:

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

## Update Mutation

```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    bio
    updatedAt
  }
}
```

```json
{
  "id": "42",
  "input": {
    "name": "Alice Smith",
    "bio": "GraphQL developer"
  }
}
```

---

## Delete Mutation

```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

```json
{ "id": "42" }
```

---

## Mutations Return Data

Always return the affected resource so the client can update its cache:

```graphql
# ✅ Good — returns the updated post
mutation {
  publishPost(id: "1") {
    id
    status
    publishedAt
  }
}

# ❌ Bad — returns nothing useful
mutation {
  publishPost(id: "1")
}
```

---

## Multiple Mutations

Mutations in a single request execute **sequentially** (unlike queries which can be parallel):

```graphql
mutation SetupAccount {
  createUser(input: { name: "Alice", email: "alice@example.com", password: "pass" }) {
    id
  }
  createProfile(input: { bio: "Hello!", userId: "new" }) {
    id
  }
}
```

First `createUser` completes, then `createProfile` runs.

---

## Mutation Naming Conventions

Use verb + noun:

```graphql
type Mutation {
  # Create
  createUser(...): User!
  createPost(...): Post!

  # Update
  updateUser(...): User!
  publishPost(...): Post!

  # Delete
  deleteUser(...): Boolean!
  archivePost(...): Post!

  # Actions
  sendEmail(...): Boolean!
  resetPassword(...): Boolean!
  followUser(...): User!
}
```

---

## Key Takeaways

- Mutations **write** data (create, update, delete)
- Use **input types** to group arguments
- Always **return the affected resource** for cache updates
- Multiple mutations execute **sequentially**
- Name mutations with **verb + noun** pattern

---

Next, we'll learn about **Subscriptions** — real-time data with GraphQL →
