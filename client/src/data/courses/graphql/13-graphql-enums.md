---
title: Enums
---

# Enums

Enums restrict a field to a specific set of allowed values.

---

## Defining Enums

```graphql
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum SortOrder {
  ASC
  DESC
}
```

Convention: UPPER_CASE values.

---

## Using Enums in Types

```graphql
type Post {
  id: ID!
  title: String!
  status: PostStatus!
}

type User {
  id: ID!
  name: String!
  role: Role!
}
```

---

## Enums as Arguments

```graphql
type Query {
  posts(status: PostStatus, sort: SortOrder = DESC): [Post!]!
  users(role: Role): [User!]!
}
```

```graphql
query {
  posts(status: PUBLISHED, sort: ASC) {
    title
    status
  }
}
```

Note: Enum values are **not quoted** in queries (`PUBLISHED`, not `"PUBLISHED"`).

---

## Enums in Input Types

```graphql
input CreatePostInput {
  title: String!
  body: String!
  status: PostStatus = DRAFT
}

mutation {
  createPost(input: { title: "Hello", body: "World", status: DRAFT }) {
    id
    status
  }
}
```

---

## Enums in Variables

When passing via variables, enums are strings:

```graphql
query GetPosts($status: PostStatus!) {
  posts(status: $status) { title }
}
```

```json
{
  "status": "PUBLISHED"
}
```

---

## Common Enum Patterns

```graphql
enum Currency {
  USD
  EUR
  GBP
  JPY
}

enum NotificationType {
  EMAIL
  SMS
  PUSH
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum FileType {
  IMAGE
  VIDEO
  DOCUMENT
  AUDIO
}
```

---

## Key Takeaways

- Enums define a **fixed set** of allowed values
- Use UPPER_CASE for enum values
- Enums work in **types**, **arguments**, and **input types**
- Enum values are **unquoted** in queries, **quoted** in JSON variables
- Use enums for status, roles, categories — any fixed set

---

Next, we'll learn about **Input Types** — structured mutation arguments →
