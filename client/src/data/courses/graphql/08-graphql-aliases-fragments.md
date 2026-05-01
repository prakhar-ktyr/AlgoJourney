---
title: Aliases & Fragments
---

# Aliases & Fragments

Aliases let you rename fields in the response. Fragments let you reuse field selections across queries.

---

## Aliases

When you query the same field with different arguments, use aliases to avoid conflicts:

```graphql
query {
  admin: user(id: "1") {
    name
    email
  }
  guest: user(id: "2") {
    name
    email
  }
}
```

Response:

```json
{
  "data": {
    "admin": { "name": "Alice", "email": "alice@example.com" },
    "guest": { "name": "Bob", "email": "bob@example.com" }
  }
}
```

Without aliases, both would be `user` and conflict.

---

## Fragments

Fragments define reusable sets of fields:

```graphql
fragment UserFields on User {
  id
  name
  email
  avatar
}

query {
  currentUser {
    ...UserFields
    role
  }
  user(id: "2") {
    ...UserFields
  }
}
```

The `...UserFields` spreads all fragment fields into the selection.

---

## Fragments on Different Queries

```graphql
fragment PostSummary on Post {
  id
  title
  publishedAt
  author { name }
}

query Dashboard {
  recentPosts(limit: 5) {
    ...PostSummary
  }
  popularPosts(limit: 5) {
    ...PostSummary
    viewCount
  }
}
```

---

## Inline Fragments

Use inline fragments for **type-specific fields** (with unions/interfaces):

```graphql
query {
  search(term: "graphql") {
    ... on Article {
      title
      body
    }
    ... on Video {
      title
      duration
      thumbnailUrl
    }
    ... on User {
      name
      avatar
    }
  }
}
```

---

## Fragment Variables (Newer Spec)

Some implementations support parameterized fragments:

```graphql
fragment UserCard on User @arguments(showEmail: Boolean = false) {
  name
  avatar
  email @include(if: $showEmail)
}
```

---

## Combining Aliases and Fragments

```graphql
fragment UserBasic on User {
  id
  name
  avatar
}

query Compare {
  userA: user(id: "1") {
    ...UserBasic
    posts { title }
  }
  userB: user(id: "2") {
    ...UserBasic
    posts { title }
  }
}
```

---

## Key Takeaways

- **Aliases** rename fields to avoid conflicts when querying the same field multiple times
- **Fragments** define reusable field selections (`fragment ... on Type`)
- Spread fragments with `...FragmentName`
- **Inline fragments** (`... on Type`) handle union/interface types
- Use fragments to keep queries DRY and maintainable

---

Next, we'll learn about **Mutations** — writing data with GraphQL →
