---
title: Custom Directives
---

# Custom Directives

Directives add declarative behavior to your schema — like middleware annotations applied to fields or types.

---

## Built-in Directives

GraphQL includes three built-in directives:

```graphql
query GetUser($includeEmail: Boolean!, $skipPosts: Boolean!) {
  user(id: "1") {
    name
    email @include(if: $includeEmail)   # Include conditionally
    posts @skip(if: $skipPosts) {       # Skip conditionally
      title
    }
  }
}

type User {
  oldField: String @deprecated(reason: "Use newField instead")
  newField: String!
}
```

---

## Defining Custom Directives

```graphql
# Schema directive declarations
directive @upper on FIELD_DEFINITION
directive @auth on FIELD_DEFINITION
directive @cacheControl(maxAge: Int!) on FIELD_DEFINITION
directive @rateLimit(max: Int!, window: Int!) on FIELD_DEFINITION
directive @deprecated(reason: String = "No longer supported") on FIELD_DEFINITION | ENUM_VALUE

type Query {
  greeting: String! @upper
  me: User! @auth
  posts: [Post!]! @cacheControl(maxAge: 300) @rateLimit(max: 100, window: 60)
}
```

---

## Implementing with Schema Transforms

```javascript
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

// @upper — transforms string fields to uppercase
function upperDirective(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, "upper")?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async (parent, args, context, info) => {
          const result = await resolve(parent, args, context, info);
          return typeof result === "string" ? result.toUpperCase() : result;
        };
      }
      return fieldConfig;
    },
  });
}
```

---

## @auth Directive

```javascript
function authDirective(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, "auth")?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = (parent, args, context, info) => {
          if (!context.user) {
            throw new GraphQLError("Authentication required");
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

## @rateLimit Directive

```javascript
function rateLimitDirective(schema) {
  const limits = new Map();

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, "rateLimit")?.[0];
      if (directive) {
        const { max, window } = directive;
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = (parent, args, context, info) => {
          const key = `${context.user?.id || context.ip}:${info.fieldName}`;
          const now = Date.now();
          const record = limits.get(key) || { count: 0, resetAt: now + window * 1000 };

          if (now > record.resetAt) {
            record.count = 0;
            record.resetAt = now + window * 1000;
          }

          record.count++;
          limits.set(key, record);

          if (record.count > max) {
            throw new GraphQLError("Rate limit exceeded");
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

## Applying Directives

```javascript
import { makeExecutableSchema } from "@graphql-tools/schema";

let schema = makeExecutableSchema({ typeDefs, resolvers });
schema = authDirective(schema);
schema = upperDirective(schema);
schema = rateLimitDirective(schema);

const server = new ApolloServer({ schema });
```

---

## Key Takeaways

- Directives add **declarative behavior** to schema fields
- Built-in: `@include`, `@skip`, `@deprecated`
- Custom directives use **schema transforms** (`@graphql-tools/utils`)
- Common custom directives: `@auth`, `@hasRole`, `@rateLimit`, `@cacheControl`
- Apply transforms in order when building the schema

---

Next, we'll learn about **Code Generation** →
