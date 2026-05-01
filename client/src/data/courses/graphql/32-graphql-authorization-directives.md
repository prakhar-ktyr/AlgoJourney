---
title: Authorization & Directives
---

# Authorization & Directives

Authorization determines **what** an authenticated user can do. Custom directives provide a declarative way to enforce permissions.

---

## Role-Based Authorization

```javascript
function requireRole(role, resolver) {
  return (parent, args, context, info) => {
    if (!context.user) throw new GraphQLError("Not authenticated");
    if (context.user.role !== role) {
      throw new GraphQLError("Insufficient permissions", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    return resolver(parent, args, context, info);
  };
}

const resolvers = {
  Query: {
    users: requireRole("ADMIN", () => User.find({})),
  },
  Mutation: {
    deleteUser: requireRole("ADMIN", (_, { id }) => User.findByIdAndDelete(id)),
  },
};
```

---

## Schema Directives

Declare permissions in the schema:

```graphql
directive @auth on FIELD_DEFINITION
directive @hasRole(role: Role!) on FIELD_DEFINITION

type Query {
  me: User! @auth
  users: [User!]! @auth @hasRole(role: ADMIN)
  publicPosts: [Post!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post! @auth
  deleteUser(id: ID!): Boolean! @auth @hasRole(role: ADMIN)
}
```

---

## Implementing Directives

```javascript
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";

function authDirective(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDir = getDirective(schema, fieldConfig, "auth")?.[0];
      if (authDir) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = (parent, args, context, info) => {
          if (!context.user) throw new GraphQLError("Not authenticated");
          return resolve(parent, args, context, info);
        };
      }

      const roleDir = getDirective(schema, fieldConfig, "hasRole")?.[0];
      if (roleDir) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = (parent, args, context, info) => {
          if (context.user?.role !== roleDir.role) {
            throw new GraphQLError("Forbidden");
          }
          return resolve(parent, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
```

---

## Field-Level Authorization

Control access to individual fields:

```graphql
type User {
  id: ID!
  name: String!
  email: String! @auth            # Only visible to authenticated users
  role: Role! @hasRole(role: ADMIN)  # Only visible to admins
}
```

---

## Ownership-Based Authorization

```javascript
Mutation: {
  updatePost: async (_, { id, input }, { user }) => {
    if (!user) throw new GraphQLError("Not authenticated");

    const post = await Post.findById(id);
    if (!post) throw new GraphQLError("Not found");

    // Only the author or an admin can update
    if (post.author.toString() !== user.id && user.role !== "ADMIN") {
      throw new GraphQLError("You can only edit your own posts");
    }

    return Post.findByIdAndUpdate(id, input, { new: true });
  },
}
```

---

## Key Takeaways

- **Authentication** = who you are; **Authorization** = what you can do
- Use **wrapper functions** or **directives** for role checks
- **Directives** make permissions visible in the schema
- Implement **ownership checks** for resource-level authorization
- Combine role-based and ownership-based rules as needed

---

Next, we'll learn about **Rate Limiting** in GraphQL →
