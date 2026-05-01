---
title: Authentication
---

# Authentication

Authentication verifies **who** the user is. In GraphQL, auth is typically handled via JWT tokens in the request headers.

---

## Flow

```
1. Client sends login mutation with credentials
2. Server validates and returns JWT token
3. Client sends token in Authorization header with every request
4. Server verifies token in context setup
5. Resolvers access authenticated user from context
```

---

## Schema

```graphql
type AuthPayload {
  token: String!
  user: User!
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
}

type Query {
  me: User!
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
}
```

---

## Resolvers

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const resolvers = {
  Mutation: {
    register: async (_, { input }) => {
      const existing = await User.findOne({ email: input.email });
      if (existing) throw new GraphQLError("Email already registered");

      const hashedPassword = await bcrypt.hash(input.password, 12);
      const user = await User.create({ ...input, password: hashedPassword });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("Invalid credentials");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new GraphQLError("Invalid credentials");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },
  },

  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
      return user;
    },
  },
};
```

---

## Context Setup

```javascript
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      let user = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          user = await User.findById(decoded.userId);
        } catch {
          // Invalid token — user stays null
        }
      }

      return { user };
    },
  })
);
```

---

## Client Usage

```graphql
# Login
mutation {
  login(email: "alice@example.com", password: "password123") {
    token
    user { id, name }
  }
}

# Authenticated query (send token in header)
# Authorization: Bearer eyJhbGciOi...
query {
  me {
    name
    email
  }
}
```

---

## Protecting Resolvers

```javascript
function requireAuth(resolver) {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return resolver(parent, args, context, info);
  };
}

const resolvers = {
  Query: {
    me: requireAuth((_, __, { user }) => user),
    myPosts: requireAuth((_, __, { user }) => Post.find({ author: user.id })),
  },
  Mutation: {
    createPost: requireAuth((_, { input }, { user }) =>
      Post.create({ ...input, author: user.id })
    ),
  },
};
```

---

## Key Takeaways

- Use **JWT tokens** for GraphQL authentication
- Verify tokens in the **context function** (runs per-request)
- Expose `me` query for fetching the current user
- Use **wrapper functions** to protect resolvers
- Never expose passwords — hash with bcrypt

---

Next, we'll learn about **Authorization & Directives** →
