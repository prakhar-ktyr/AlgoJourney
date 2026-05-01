---
title: Error Handling
---

# Error Handling

GraphQL handles errors differently from REST. Instead of HTTP status codes, errors are returned in the response body alongside partial data.

---

## GraphQL Error Format

Errors always have this structure:

```json
{
  "data": { "user": null },
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

Note: HTTP status is **always 200** (even with errors). The `errors` array tells the client what went wrong.

---

## Throwing Errors in Resolvers

```javascript
import { GraphQLError } from "graphql";

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND", argumentName: "id" },
        });
      }
      return user;
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const existing = await User.findOne({ email: input.email });
      if (existing) {
        throw new GraphQLError("Email already registered", {
          extensions: { code: "DUPLICATE_EMAIL", field: "email" },
        });
      }
      return User.create(input);
    },
  },
};
```

---

## Common Error Codes

```javascript
// Define standard error codes
const ERRORS = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

// Usage
throw new GraphQLError("Must be logged in", {
  extensions: { code: ERRORS.UNAUTHENTICATED },
});

throw new GraphQLError("Admin access required", {
  extensions: { code: ERRORS.FORBIDDEN },
});
```

---

## Partial Responses

GraphQL can return **partial data** with errors:

```graphql
query {
  user(id: "1") {
    name
    posts { title }       # This resolver fails
    friends { name }      # This still works
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "posts": null,
      "friends": [{ "name": "Bob" }]
    }
  },
  "errors": [
    { "message": "Failed to load posts", "path": ["user", "posts"] }
  ]
}
```

---

## Validation Errors

```javascript
Mutation: {
  createPost: async (_, { input }) => {
    const errors = [];
    if (!input.title.trim()) errors.push({ field: "title", message: "Title is required" });
    if (input.title.length > 200) errors.push({ field: "title", message: "Title too long" });
    if (!input.body.trim()) errors.push({ field: "body", message: "Body is required" });

    if (errors.length > 0) {
      throw new GraphQLError("Validation failed", {
        extensions: { code: "VALIDATION_ERROR", errors },
      });
    }

    return Post.create(input);
  },
}
```

---

## Error Formatting

Customize error output in Apollo Server:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "production" && !formattedError.extensions?.code) {
      return { message: "Internal server error", extensions: { code: "INTERNAL_ERROR" } };
    }
    return formattedError;
  },
});
```

---

## Key Takeaways

- GraphQL returns errors in the **response body**, not HTTP status codes
- Use `GraphQLError` with **extension codes** for error classification
- GraphQL supports **partial responses** — some fields succeed, others fail
- Never expose internal details (stack traces) in production
- Define **standard error codes** for consistent client handling

---

Next, we'll learn about **File Uploads** in GraphQL →
