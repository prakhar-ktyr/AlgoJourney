---
title: Schema Design Best Practices
---

# Schema Design Best Practices

A well-designed schema makes your API intuitive, maintainable, and scalable.

---

## 1. Design for the Client

Think about what clients need, not your database structure:

```graphql
# ❌ Mirrors database tables
type User {
  id: ID!
  first_name: String    # DB column name
  avatar_url_id: Int    # Foreign key exposed
}

# ✅ Client-friendly
type User {
  id: ID!
  firstName: String!
  avatar: Image!        # Resolved object, not FK
}
```

---

## 2. Use Input Types for Mutations

```graphql
# ❌ Too many loose arguments
type Mutation {
  createUser(name: String!, email: String!, password: String!, bio: String): User!
}

# ✅ Grouped into input type
type Mutation {
  createUser(input: CreateUserInput!): User!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  bio: String
}
```

---

## 3. Return the Mutated Object

```graphql
# ❌ Returns nothing useful
type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): Boolean!
}

# ✅ Returns the updated object
type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): User!
}
```

---

## 4. Use Connections for Lists

```graphql
# ❌ Simple array (no pagination metadata)
type User {
  posts: [Post!]!
}

# ✅ Connection pattern
type User {
  posts(first: Int = 10, after: String): PostConnection!
}
```

---

## 5. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Types | PascalCase | `User`, `BlogPost` |
| Fields | camelCase | `firstName`, `createdAt` |
| Enums | PascalCase + UPPER_CASE values | `PostStatus.PUBLISHED` |
| Input types | PascalCase + "Input" suffix | `CreateUserInput` |
| Mutations | camelCase, verb + noun | `createUser`, `publishPost` |

---

## 6. Avoid Nullable Defaults

Make fields non-null unless there's a reason for null:

```graphql
type User {
  id: ID!           # Always exists
  name: String!     # Required
  bio: String       # Intentionally nullable (optional field)
  posts: [Post!]!   # Always a list (may be empty)
}
```

---

## 7. Use Enums for Fixed Sets

```graphql
# ❌ Stringly typed
type Post {
  status: String!   # "draft"? "DRAFT"? "Draft"?
}

# ✅ Enum — safe and documented
enum PostStatus { DRAFT PUBLISHED ARCHIVED }
type Post {
  status: PostStatus!
}
```

---

## 8. Separate Create and Update Inputs

```graphql
# Create — required fields
input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

# Update — all optional (partial update)
input UpdateUserInput {
  name: String
  email: String
  bio: String
}
```

---

## 9. Add Descriptions

```graphql
"""A registered user of the platform."""
type User {
  id: ID!
  """The user's display name (1-100 characters)."""
  name: String!
  """ISO 8601 timestamp of when the account was created."""
  createdAt: String!
}
```

Descriptions appear in GraphQL Playground and generated docs.

---

## Key Takeaways

- Design for **clients**, not database structure
- Use **input types** for mutations, return the **mutated object**
- Follow **naming conventions** consistently
- Make fields **non-null by default**
- Use **enums** instead of magic strings
- Add **descriptions** for self-documenting schemas

---

Next, we'll learn about **Authentication** — securing your GraphQL API →
