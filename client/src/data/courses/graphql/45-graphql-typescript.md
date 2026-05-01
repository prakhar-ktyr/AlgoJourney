---
title: GraphQL with TypeScript
---

# GraphQL with TypeScript

TypeScript and GraphQL are a natural fit — both are about defining types and contracts. Together they provide end-to-end type safety.

---

## Type-Safe Resolvers

```typescript
// types.ts
interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
}

interface Context {
  user: User | null;
  dataSources: {
    users: UserDataSource;
    posts: PostDataSource;
  };
}
```

```typescript
// resolvers.ts
import { Resolvers } from "./generated/graphql";

const resolvers: Resolvers<Context> = {
  Query: {
    users: (_, __, { dataSources }) => dataSources.users.getAll(),
    user: (_, { id }, { dataSources }) => dataSources.users.getById(id),
  },
  Mutation: {
    createUser: (_, { input }, { dataSources }) =>
      dataSources.users.create(input),
  },
  User: {
    posts: (parent, _, { dataSources }) =>
      dataSources.posts.getByAuthor(parent.id),
  },
};
```

---

## Type-Safe Data Sources

```typescript
class UserDataSource {
  constructor(private db: Database) {}

  async getAll(): Promise<User[]> {
    return this.db.collection<User>("users").find().toArray();
  }

  async getById(id: string): Promise<User | null> {
    return this.db.collection<User>("users").findOne({ _id: id });
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.db.collection<User>("users").insertOne(input);
    return { id: result.insertedId, ...input };
  }
}
```

---

## Type-Safe Context

```typescript
// context.ts
import { User } from "./types";

export interface Context {
  user: User | null;
  dataSources: DataSources;
}

interface DataSources {
  users: UserDataSource;
  posts: PostDataSource;
}

// Server setup
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => ({
      user: await authenticate(req),
      dataSources: {
        users: new UserDataSource(db),
        posts: new PostDataSource(db),
      },
    }),
  })
);
```

---

## Enum Mapping

Map GraphQL enums to TypeScript:

```typescript
// GraphQL enum
// enum Role { USER ADMIN MODERATOR }

// TypeScript enum
enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

// Or use union type
type Role = "USER" | "ADMIN" | "MODERATOR";
```

---

## Type Guard for Auth

```typescript
function requireAuth<T>(
  resolver: (parent: any, args: any, context: Context & { user: User }) => T
) {
  return (parent: any, args: any, context: Context) => {
    if (!context.user) {
      throw new GraphQLError("Not authenticated");
    }
    return resolver(parent, args, context as Context & { user: User });
  };
}

// Usage — context.user is guaranteed non-null inside
const resolvers = {
  Query: {
    me: requireAuth((_, __, { user }) => user),
  },
};
```

---

## Key Takeaways

- TypeScript + GraphQL provides **end-to-end type safety**
- Use **codegen** to generate resolver types from schema
- Type the **context** for safe access to auth and data sources
- Type guards (like `requireAuth`) **narrow** types in resolvers
- Catch errors at **compile time** instead of runtime

---

Next, we'll learn about **Performance Optimization** →
