---
title: Scalar Types
---

# Scalar Types

Scalars are the leaf values in a GraphQL schema — they resolve to a single value (no sub-fields).

---

## Built-in Scalars

| Type | Description | Example Values |
|------|-------------|----------------|
| `Int` | 32-bit signed integer | `42`, `-1`, `0` |
| `Float` | Double-precision float | `3.14`, `-0.5` |
| `String` | UTF-8 text | `"hello"`, `""` |
| `Boolean` | True or false | `true`, `false` |
| `ID` | Unique identifier | `"abc123"`, `"42"` |

---

## Int

```graphql
type Product {
  quantity: Int!      # 0, 1, 100, -5
  maxQuantity: Int    # Nullable
}
```

Range: -2,147,483,648 to 2,147,483,647. Use `String` or custom scalar for larger numbers.

---

## Float

```graphql
type Product {
  price: Float!       # 29.99, 0.0
  weight: Float       # 1.5 (kg)
}
```

Double-precision (64-bit). Good for prices, measurements, coordinates.

---

## String

```graphql
type User {
  name: String!       # "Alice"
  bio: String         # Nullable — user might not have a bio
  email: String!      # "alice@example.com"
}
```

UTF-8 encoded. No maximum length in the spec (validate in resolvers).

---

## Boolean

```graphql
type User {
  isActive: Boolean!
  isVerified: Boolean!
  hasNewsletter: Boolean!
}

type Query {
  users(isActive: Boolean): [User!]!
}
```

---

## ID

```graphql
type User {
  id: ID!             # Unique identifier
}

type Query {
  user(id: ID!): User
}
```

- Serialized as a `String`
- Semantically means "unique identifier"
- Can be numeric (`"42"`) or UUID (`"550e8400-e29b..."`)
- Not meant for display — use `String` for visible text

---

## When to Use ID vs String vs Int

| Data | Type | Reason |
|------|------|--------|
| Database primary key | `ID` | Unique identifier |
| User's name | `String` | Display text |
| Quantity in cart | `Int` | Numeric, countable |
| External reference | `ID` | Unique, opaque |
| URL | `String` | Display/navigable text |

---

## Scalars in Responses

Scalars are always **leaf nodes** — you can't select sub-fields:

```graphql
# ✅ Correct
query {
  user(id: "1") {
    name          # String — leaf node
    age           # Int — leaf node
  }
}

# ❌ Error — can't select fields on a scalar
query {
  user(id: "1") {
    name {
      first       # Error! String has no sub-fields
    }
  }
}
```

---

## Key Takeaways

- GraphQL has **5 built-in scalars**: Int, Float, String, Boolean, ID
- Scalars are **leaf values** — no sub-fields
- Use `ID` for unique identifiers, `String` for display text
- All scalars can be nullable or non-null (`!`)
- Custom scalars (Date, JSON, URL) are covered in a later lesson

---

Next, we'll learn about **Object Types** — composing scalars into structures →
