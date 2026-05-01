---
title: Lists & Non-Null
---

# Lists & Non-Null

Type modifiers control whether fields can be null and whether they return single values or lists.

---

## Non-Null (`!`)

The `!` modifier means a field will **never** return null:

```graphql
type User {
  id: ID!          # Always has a value
  name: String!    # Always has a value
  bio: String      # Can be null
}
```

If a non-null field's resolver returns null, GraphQL propagates the error up to the nearest nullable parent.

---

## Lists (`[]`)

Square brackets indicate a list/array:

```graphql
type User {
  tags: [String]       # List of strings
  posts: [Post!]!      # Non-null list of non-null posts
}
```

---

## All Nullability Combinations

| Declaration | List null? | Items null? | Valid values |
|-------------|-----------|-------------|--------------|
| `[String]` | ✅ | ✅ | `null`, `[]`, `["a", null]` |
| `[String]!` | ❌ | ✅ | `[]`, `["a", null]` |
| `[String!]` | ✅ | ❌ | `null`, `[]`, `["a", "b"]` |
| `[String!]!` | ❌ | ❌ | `[]`, `["a", "b"]` |

---

## Common Patterns

```graphql
type User {
  # Required — user always has an ID and name
  id: ID!
  name: String!

  # Optional — user might not have these
  bio: String
  avatar: String

  # Non-null list of non-null items (most common for relationships)
  posts: [Post!]!
  friends: [User!]!

  # Nullable list — field might not be available
  recommendations: [Post!]
}

type Query {
  # Always returns a list (may be empty)
  users: [User!]!

  # Might return null (user not found)
  user(id: ID!): User
}
```

---

## Error Propagation

When a non-null field returns null, the error bubbles up:

```graphql
type Post {
  id: ID!
  title: String!     # If this is null...
  author: User!      # If this is null...
}

type Query {
  post(id: ID!): Post    # ...this becomes null
  posts: [Post!]!        # ...the item is removed from the list
}
```

---

## Best Practices

1. **Make fields non-null by default** — nullable should be intentional
2. **Root query fields** — usually nullable (returns null when not found)
3. **List items** — almost always non-null (`[Type!]!`)
4. **IDs and required fields** — always non-null
5. **Optional profile fields** — nullable (bio, avatar, website)

```graphql
# ✅ Good defaults
type Query {
  user(id: ID!): User          # Nullable (not found = null)
  users: [User!]!              # Non-null list, non-null items
}

type User {
  id: ID!                      # Always present
  name: String!                # Required
  bio: String                  # Optional
  posts: [Post!]!              # Always a list, never null items
}
```

---

## Key Takeaways

- `!` means **never null** — the field always has a value
- `[Type]` means a **list** of values
- `[Type!]!` is the most common list pattern (non-null list + non-null items)
- Make things non-null by default, nullable when intentional
- Null errors **propagate up** to the nearest nullable parent

---

Next, we'll learn about **Interfaces** — shared fields across types →
