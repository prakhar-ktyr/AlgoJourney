---
title: Input Types
---

# Input Types

Input types define the shape of **arguments** passed to mutations and queries. They're like object types but for input data.

---

## Why Input Types?

Without input types, mutations get unwieldy:

```graphql
# ❌ Too many arguments
mutation {
  createUser(name: "Alice", email: "alice@ex.com", password: "pass", bio: "Hi", role: USER) {
    id
  }
}

# ✅ Clean with input type
mutation {
  createUser(input: { name: "Alice", email: "alice@ex.com", password: "pass" }) {
    id
  }
}
```

---

## Defining Input Types

```graphql
input CreateUserInput {
  name: String!
  email: String!
  password: String!
  bio: String
  role: Role = USER
}

input UpdateUserInput {
  name: String
  email: String
  bio: String
}
```

Key difference from object types:
- Use `input` keyword (not `type`)
- Fields cannot have arguments
- Fields cannot reference object types (only scalars, enums, and other input types)

---

## Using Input Types

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
}

input CreatePostInput {
  title: String!
  body: String!
  tags: [String!]
  status: PostStatus = DRAFT
}
```

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    status
  }
}
```

```json
{
  "input": {
    "title": "Learning GraphQL",
    "body": "GraphQL is amazing...",
    "tags": ["graphql", "tutorial"],
    "status": "PUBLISHED"
  }
}
```

---

## Nested Input Types

```graphql
input CreateOrderInput {
  customerId: ID!
  items: [OrderItemInput!]!
  shippingAddress: AddressInput!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
}

input AddressInput {
  street: String!
  city: String!
  zip: String!
  country: String!
}
```

---

## Input vs Object Types

| Feature | Object Type (`type`) | Input Type (`input`) |
|---------|---------------------|---------------------|
| Used for | Responses | Arguments |
| Fields with args | ✅ Yes | ❌ No |
| Can reference `type` | ✅ Yes | ❌ No |
| Can reference `input` | ❌ No | ✅ Yes |
| Resolvers | Has resolvers | No resolvers |

---

## Filter Input Pattern

```graphql
input PostFilterInput {
  status: PostStatus
  authorId: ID
  tags: [String!]
  createdAfter: String
  createdBefore: String
}

type Query {
  posts(filter: PostFilterInput, limit: Int = 20, offset: Int = 0): [Post!]!
}
```

---

## Key Takeaways

- Input types define **structured arguments** for mutations/queries
- Use `input` keyword — separate from `type`
- Input types can only contain **scalars, enums, and other inputs**
- Use separate **Create** and **Update** input types (update fields are nullable)
- Input types keep mutations **clean and organized**

---

Next, we'll learn about **Lists & Non-Null** — type modifiers →
