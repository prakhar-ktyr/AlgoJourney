---
title: Relationships & Nested Resolvers
---

# Relationships & Nested Resolvers

Real APIs have interconnected data. Nested resolvers let you traverse relationships naturally.

---

## Types of Relationships

```graphql
type User {
  id: ID!
  name: String!
  profile: Profile        # One-to-one
  posts: [Post!]!         # One-to-many
  friends: [User!]!       # Many-to-many (self-referential)
}

type Post {
  id: ID!
  title: String!
  author: User!           # Many-to-one (belongs to)
  tags: [Tag!]!           # Many-to-many
  comments: [Comment!]!   # One-to-many
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}
```

---

## Resolving One-to-Many

```javascript
// Schema: User.posts: [Post!]!
const resolvers = {
  User: {
    posts: async (parent) => {
      return await Post.find({ author: parent.id });
    },
  },
};
```

Query:

```graphql
query {
  user(id: "1") {
    name
    posts {         # Triggers User.posts resolver
      title
    }
  }
}
```

---

## Resolving Many-to-One

```javascript
// Schema: Post.author: User!
const resolvers = {
  Post: {
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },
};
```

---

## Deep Nesting

GraphQL resolves layer by layer:

```graphql
query {
  user(id: "1") {         # Query.user
    name                   # Default (parent.name)
    posts {                # User.posts
      title                # Default
      comments {           # Post.comments
        text               # Default
        author {           # Comment.author
          name             # Default
        }
      }
    }
  }
}
```

Each level calls its resolver independently.

---

## Many-to-Many

```javascript
// Models
const postSchema = new mongoose.Schema({
  title: String,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
});

const tagSchema = new mongoose.Schema({
  name: String,
});

// Resolvers
const resolvers = {
  Post: {
    tags: (parent) => Tag.find({ _id: { $in: parent.tags } }),
  },
  Tag: {
    posts: (parent) => Post.find({ tags: parent.id }),
  },
};
```

---

## Computed Fields

Resolvers can compute values, not just fetch data:

```javascript
const resolvers = {
  User: {
    postCount: (parent) => Post.countDocuments({ author: parent.id }),
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`,
    isOnline: (parent) => Date.now() - parent.lastSeen < 300000,
  },
  Post: {
    excerpt: (parent) => parent.body.slice(0, 200) + "...",
    readTime: (parent) => Math.ceil(parent.body.split(" ").length / 200),
  },
};
```

---

## The N+1 Problem

Nested resolvers cause N+1 queries:

```graphql
query {
  posts {              # 1 query: SELECT * FROM posts
    author { name }    # N queries: SELECT * FROM users WHERE id = ?
  }
}
```

10 posts = 11 queries. We'll solve this with **DataLoader** in a later lesson.

---

## Key Takeaways

- Write **field resolvers** on object types for relationships
- GraphQL resolves **layer by layer**, calling resolvers at each level
- Default resolvers handle simple property access
- Computed fields can derive values without storing them
- Nested resolvers introduce the **N+1 problem** (solved by DataLoader)

---

Next, we'll learn about **Pagination** — handling large datasets →
