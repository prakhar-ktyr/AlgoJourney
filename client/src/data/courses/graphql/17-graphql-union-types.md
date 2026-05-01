---
title: Union Types
---

# Union Types

Unions allow a field to return one of several **unrelated** types. Unlike interfaces, union members don't need shared fields.

---

## Defining Unions

```graphql
union SearchResult = Article | Video | User | Product

type Query {
  search(term: String!): [SearchResult!]!
}
```

---

## Querying Unions

Since union members have no guaranteed shared fields, you **must** use inline fragments:

```graphql
query {
  search(term: "graphql") {
    __typename
    ... on Article {
      title
      body
      author { name }
    }
    ... on Video {
      title
      duration
      url
    }
    ... on User {
      name
      avatar
    }
    ... on Product {
      name
      price
    }
  }
}
```

---

## Union vs Interface

| Feature | Interface | Union |
|---------|-----------|-------|
| Shared fields | Required | None |
| Types related? | Yes | Can be unrelated |
| Query without fragments | ✅ (shared fields) | ❌ (must use fragments) |
| Use case | Common fields | Heterogeneous results |

Use **interface** when types share fields. Use **union** when types are unrelated.

---

## Result Type Pattern

Unions are great for mutation results:

```graphql
union CreateUserResult = User | ValidationError | DuplicateEmailError

type ValidationError {
  message: String!
  field: String!
}

type DuplicateEmailError {
  message: String!
  existingEmail: String!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserResult!
}
```

```graphql
mutation {
  createUser(input: { name: "Alice", email: "alice@ex.com", password: "pass" }) {
    ... on User {
      id
      name
    }
    ... on ValidationError {
      message
      field
    }
    ... on DuplicateEmailError {
      message
    }
  }
}
```

---

## Resolving Unions

```javascript
const resolvers = {
  SearchResult: {
    __resolveType(obj) {
      if (obj.body) return "Article";
      if (obj.duration) return "Video";
      if (obj.email) return "User";
      if (obj.price) return "Product";
      return null;
    },
  },
};
```

---

## Feed/Timeline Pattern

```graphql
union FeedItem = Post | Photo | Link | Poll

type Query {
  feed(limit: Int = 20): [FeedItem!]!
}
```

```graphql
query {
  feed(limit: 10) {
    ... on Post { title, body }
    ... on Photo { url, caption }
    ... on Link { url, title, description }
    ... on Poll { question, options }
  }
}
```

---

## Key Takeaways

- Unions return **one of several unrelated types**
- No shared fields — must use **inline fragments** for all fields
- Great for **result types** (success or different error types)
- Use `__resolveType` to identify which type an object is
- Choose **interface** for shared fields, **union** for unrelated types

---

Next, we'll learn about **Custom Scalars** — extending the type system →
