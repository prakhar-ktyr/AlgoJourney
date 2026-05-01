---
title: Middleware & Plugins
---

# Middleware & Plugins

Apollo Server plugins hook into the request lifecycle for logging, caching, error handling, and more.

---

## Apollo Server Plugins

Plugins respond to events in the GraphQL request lifecycle:

```javascript
const myPlugin = {
  async requestDidStart(requestContext) {
    console.log("Request started:", requestContext.request.query);

    return {
      async parsingDidStart() {
        console.log("Parsing started");
      },
      async validationDidStart() {
        console.log("Validation started");
      },
      async executionDidStart() {
        return {
          async executionDidEnd() {
            console.log("Execution complete");
          },
        };
      },
      async willSendResponse({ response }) {
        console.log("Sending response");
      },
    };
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [myPlugin],
});
```

---

## Logging Plugin

```javascript
const loggingPlugin = {
  async requestDidStart({ request }) {
    const start = Date.now();
    const operationName = request.operationName || "anonymous";

    return {
      async willSendResponse({ response }) {
        const duration = Date.now() - start;
        console.log(`[GraphQL] ${operationName} - ${duration}ms`);
      },
      async didEncounterErrors({ errors }) {
        for (const err of errors) {
          console.error(`[GraphQL Error] ${operationName}:`, err.message);
        }
      },
    };
  },
};
```

---

## Resolver Middleware Pattern

Wrap resolvers with shared logic:

```javascript
// Middleware function
function withAuth(resolver) {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return resolver(parent, args, context, info);
  };
}

function withRole(role, resolver) {
  return withAuth((parent, args, context, info) => {
    if (context.user.role !== role) {
      throw new GraphQLError("Insufficient permissions", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    return resolver(parent, args, context, info);
  });
}

// Usage
const resolvers = {
  Query: {
    me: withAuth((_, __, { user }) => user),
    adminDashboard: withRole("ADMIN", () => getAdminStats()),
  },
  Mutation: {
    deleteUser: withRole("ADMIN", (_, { id }) => User.findByIdAndDelete(id)),
    updateProfile: withAuth((_, { input }, { user }) => User.findByIdAndUpdate(user.id, input)),
  },
};
```

---

## Built-in Plugins

Apollo Server includes useful plugins:

```javascript
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageProductionDefault()
      : ApolloServerPluginLandingPageLocalDefault(),
  ],
});
```

---

## Error Masking Plugin

```javascript
const errorMaskingPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        if (process.env.NODE_ENV === "production" && response.body.singleResult?.errors) {
          response.body.singleResult.errors = response.body.singleResult.errors.map((err) => {
            if (!err.extensions?.code) {
              return { message: "Internal server error", extensions: { code: "INTERNAL_ERROR" } };
            }
            return err;
          });
        }
      },
    };
  },
};
```

---

## Key Takeaways

- **Plugins** hook into Apollo Server's request lifecycle
- Use plugins for **logging**, **error tracking**, **performance monitoring**
- **Resolver middleware** wraps resolvers with auth/validation logic
- `withAuth` and `withRole` patterns keep resolvers clean
- Use built-in plugins for landing pages and defaults

---

Next, we'll learn about **Schema Design Best Practices** →
