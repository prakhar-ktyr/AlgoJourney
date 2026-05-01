---
title: Filtering & Sorting
---

# Filtering & Sorting

Let clients narrow down results and control ordering through query arguments.

---

## Basic Filtering

```graphql
type Query {
  posts(status: PostStatus, authorId: ID, tag: String): [Post!]!
}
```

```javascript
const resolvers = {
  Query: {
    posts: async (_, { status, authorId, tag }) => {
      const filter = {};
      if (status) filter.status = status;
      if (authorId) filter.author = authorId;
      if (tag) filter.tags = tag;
      return Post.find(filter);
    },
  },
};
```

---

## Filter Input Type

For complex filtering:

```graphql
input PostFilter {
  status: PostStatus
  authorId: ID
  tags: [String!]
  search: String
  createdAfter: String
  createdBefore: String
}

type Query {
  posts(filter: PostFilter, sort: PostSort, limit: Int = 20): [Post!]!
}
```

```javascript
const resolvers = {
  Query: {
    posts: async (_, { filter = {}, sort, limit }) => {
      const query = {};

      if (filter.status) query.status = filter.status;
      if (filter.authorId) query.author = filter.authorId;
      if (filter.tags?.length) query.tags = { $in: filter.tags };
      if (filter.search) query.$text = { $search: filter.search };
      if (filter.createdAfter || filter.createdBefore) {
        query.createdAt = {};
        if (filter.createdAfter) query.createdAt.$gte = new Date(filter.createdAfter);
        if (filter.createdBefore) query.createdAt.$lte = new Date(filter.createdBefore);
      }

      let q = Post.find(query).limit(limit);
      if (sort) q = q.sort({ [sort.field]: sort.order === "ASC" ? 1 : -1 });
      return q;
    },
  },
};
```

---

## Sorting

```graphql
enum SortOrder {
  ASC
  DESC
}

enum PostSortField {
  CREATED_AT
  TITLE
  VIEWS
}

input PostSort {
  field: PostSortField!
  order: SortOrder = DESC
}

type Query {
  posts(sort: PostSort): [Post!]!
}
```

```graphql
query {
  posts(sort: { field: CREATED_AT, order: DESC }) {
    title
    createdAt
  }
}
```

---

## Combined Example

```graphql
query {
  posts(
    filter: { status: PUBLISHED, tags: ["graphql"] }
    sort: { field: CREATED_AT, order: DESC }
    limit: 10
  ) {
    title
    tags
    createdAt
    author { name }
  }
}
```

---

## Multiple Sort Fields

```graphql
input PostSort {
  field: PostSortField!
  order: SortOrder = DESC
}

type Query {
  posts(sort: [PostSort!]): [Post!]!
}
```

```javascript
// Build sort object from array
const sortObj = {};
for (const s of sort) {
  const field = s.field === "CREATED_AT" ? "createdAt" : s.field.toLowerCase();
  sortObj[field] = s.order === "ASC" ? 1 : -1;
}
```

---

## Key Takeaways

- Use **input types** for complex filters
- **Enums** for sort fields prevent invalid input
- Combine filter, sort, and pagination for flexible querying
- Build database queries **dynamically** from filter input
- Only include filter conditions when the argument is provided

---

Next, we'll learn about **Error Handling** in GraphQL →
