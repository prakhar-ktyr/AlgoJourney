---
title: Pagination
---

# Pagination

Large datasets need pagination. GraphQL supports two main patterns: **offset-based** and **cursor-based**.

---

## Offset-Based Pagination

Simple and familiar:

```graphql
type Query {
  posts(limit: Int = 20, offset: Int = 0): PostConnection!
}

type PostConnection {
  data: [Post!]!
  total: Int!
  hasMore: Boolean!
}
```

```javascript
const resolvers = {
  Query: {
    posts: async (_, { limit, offset }) => {
      const [data, total] = await Promise.all([
        Post.find({}).sort({ createdAt: -1 }).skip(offset).limit(limit),
        Post.countDocuments({}),
      ]);
      return { data, total, hasMore: offset + data.length < total };
    },
  },
};
```

```graphql
query {
  posts(limit: 10, offset: 0) {
    data { id, title }
    total
    hasMore
  }
}
```

---

## Cursor-Based Pagination (Relay Style)

Better for real-time data and infinite scroll:

```graphql
type Query {
  posts(first: Int = 20, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## Implementing Cursor Pagination

```javascript
const resolvers = {
  Query: {
    posts: async (_, { first = 20, after }) => {
      const filter = {};
      if (after) {
        const decodedCursor = Buffer.from(after, "base64").toString();
        filter.createdAt = { $lt: new Date(decodedCursor) };
      }

      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(first + 1); // Fetch one extra to check hasNextPage

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map((post) => ({
        node: post,
        cursor: Buffer.from(post.createdAt.toISOString()).toString("base64"),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount: await Post.countDocuments({}),
      };
    },
  },
};
```

---

## Using Cursor Pagination

```graphql
# First page
query {
  posts(first: 10) {
    edges {
      node { id, title }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Next page
query {
  posts(first: 10, after: "MjAyNC0wMS0xNVQxMDozMDowMC4wMDBa") {
    edges {
      node { id, title }
    }
    pageInfo { hasNextPage, endCursor }
  }
}
```

---

## Offset vs Cursor

| Feature | Offset | Cursor |
|---------|--------|--------|
| Simplicity | ✅ Simple | More complex |
| Jump to page | ✅ Easy | ❌ Sequential only |
| Consistency | ❌ Skips/duplicates on changes | ✅ Stable |
| Performance | ❌ Slow for large offsets | ✅ Fast (index-based) |
| Real-time data | ❌ Breaks with inserts | ✅ Handles well |

---

## Key Takeaways

- **Offset** is simple but breaks with real-time data and large datasets
- **Cursor** is stable and performant but more complex
- Use the **Connection pattern** (edges/pageInfo) for cursor pagination
- Cursors should be **opaque** (base64-encoded)
- Always include `hasNextPage` so clients know when to stop

---

Next, we'll learn about **Filtering & Sorting** →
