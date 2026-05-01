---
title: Resolvers
---

# Resolvers

Resolvers are functions that **fetch the data** for each field in your schema. They're the bridge between schema and data.

---

## Resolver Signature

Every resolver receives four arguments:

```javascript
const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      // parent  — result from the parent resolver
      // args    — arguments passed to the field
      // context — shared data (auth, DB connections)
      // info    — query execution details (advanced)
    },
  },
};
```

---

## Basic Resolvers

```javascript
const users = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find((u) => u.id === id),
  },
  Mutation: {
    createUser: (_, { name, email }) => {
      const user = { id: String(users.length + 1), name, email };
      users.push(user);
      return user;
    },
  },
};
```

---

## The Parent Argument

For nested types, `parent` is the result from the parent resolver:

```graphql
type User {
  id: ID!
  name: String!
  posts: [Post!]!
}
```

```javascript
const resolvers = {
  Query: {
    user: (_, { id }) => users.find((u) => u.id === id),
  },
  User: {
    // parent is the user object returned by Query.user
    posts: (parent) => posts.filter((p) => p.authorId === parent.id),
  },
};
```

---

## Default Resolvers

If a field name matches a property on the parent, GraphQL resolves it automatically:

```javascript
// You DON'T need to write this:
const resolvers = {
  User: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
    email: (parent) => parent.email,
  },
};

// Just write resolvers for fields that need custom logic
const resolvers = {
  User: {
    posts: (parent) => posts.filter((p) => p.authorId === parent.id),
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`,
  },
};
```

---

## Async Resolvers

Resolvers can be async (database queries, API calls):

```javascript
const resolvers = {
  Query: {
    users: async () => {
      return await User.find({});
    },
    user: async (_, { id }) => {
      return await User.findById(id);
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      return await User.create(input);
    },
  },
};
```

---

## Resolver Chain

GraphQL resolves fields top-down:

```graphql
query {
  user(id: "1") {    # 1. Query.user resolver
    name             # 2. Default resolver (parent.name)
    posts {          # 3. User.posts resolver
      title          # 4. Default resolver (parent.title)
      comments {     # 5. Post.comments resolver
        text         # 6. Default resolver (parent.text)
      }
    }
  }
}
```

---

## Resolver Map Structure

```javascript
const resolvers = {
  // Root types
  Query: { ... },
  Mutation: { ... },
  Subscription: { ... },

  // Object type resolvers
  User: {
    posts: (parent) => ...,
    followerCount: (parent) => ...,
  },
  Post: {
    author: (parent) => ...,
    commentCount: (parent) => ...,
  },
};
```

---

## Key Takeaways

- Resolvers fetch data for each field: `(parent, args, context, info)`
- **Default resolvers** handle simple property access automatically
- Write custom resolvers for **relationships** and **computed fields**
- Resolvers can be **async** (return Promises)
- Resolution is **top-down** — parent resolves before children

---

Next, we'll learn about **Context** — sharing data across resolvers →
