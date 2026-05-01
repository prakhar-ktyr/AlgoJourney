---
title: Input Validation
---

# Input Validation

GraphQL's type system provides basic validation (types, non-null), but business rules require additional validation in resolvers.

---

## Schema-Level Validation

The type system catches basic issues:

```graphql
input CreateUserInput {
  name: String!     # Must be provided, must be a string
  email: String!    # Must be provided
  age: Int          # Must be an integer if provided
  role: Role!       # Must be a valid enum value
}
```

GraphQL automatically rejects:
- Missing required fields
- Wrong types (`"hello"` for Int)
- Invalid enum values

---

## Resolver-Level Validation

For business rules, validate in resolvers:

```javascript
Mutation: {
  createUser: async (_, { input }) => {
    const errors = [];

    // String length
    if (input.name.trim().length < 2) {
      errors.push({ field: "name", message: "Name must be at least 2 characters" });
    }
    if (input.name.length > 100) {
      errors.push({ field: "name", message: "Name must be under 100 characters" });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    // Password strength
    if (input.password.length < 8) {
      errors.push({ field: "password", message: "Password must be at least 8 characters" });
    }

    if (errors.length > 0) {
      throw new GraphQLError("Validation failed", {
        extensions: { code: "VALIDATION_ERROR", errors },
      });
    }

    return User.create(input);
  },
}
```

---

## Using a Validation Library

```bash
npm install zod
```

```javascript
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  bio: z.string().max(500).optional(),
});

function validate(schema) {
  return (resolver) => async (parent, args, context, info) => {
    const result = schema.safeParse(args.input);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      throw new GraphQLError("Validation failed", {
        extensions: { code: "VALIDATION_ERROR", errors },
      });
    }
    return resolver(parent, { ...args, input: result.data }, context, info);
  };
}

// Usage
const resolvers = {
  Mutation: {
    createUser: validate(CreateUserSchema)(async (_, { input }) => {
      return User.create(input);
    }),
  },
};
```

---

## Sanitization

Always sanitize user input:

```javascript
import { escape } from "html-escaper";

Mutation: {
  createPost: async (_, { input }) => {
    return Post.create({
      title: input.title.trim(),
      body: escape(input.body), // Prevent XSS
    });
  },
}
```

---

## Custom Scalars for Validation

Use custom scalars to validate at the schema level:

```graphql
scalar Email
scalar URL
scalar PositiveInt

input CreateUserInput {
  name: String!
  email: Email!        # Validated automatically
  website: URL
  age: PositiveInt
}
```

---

## Key Takeaways

- GraphQL's type system provides **basic** validation (types, non-null, enums)
- Use **resolver validation** for business rules (length, format, uniqueness)
- Use **Zod** or similar libraries for structured validation
- **Sanitize** input to prevent XSS and injection
- **Custom scalars** can validate formats at the schema level

---

Next, we'll learn about **Persisted Queries** →
