---
title: Code Generation
---

# Code Generation

**GraphQL Code Generator** generates TypeScript types, React hooks, and resolvers from your schema — eliminating manual type maintenance.

---

## Setup

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

```yaml
# codegen.yml
schema: "http://localhost:4000/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

---

## Running Code Generation

```bash
npx graphql-codegen
```

Add to package.json:

```json
{
  "scripts": {
    "codegen": "graphql-codegen",
    "codegen:watch": "graphql-codegen --watch"
  }
}
```

---

## What Gets Generated

From your schema and queries:

```graphql
# src/queries/users.graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
```

Generated TypeScript:

```typescript
// src/generated/graphql.ts (auto-generated)
export type User = {
  __typename?: "User";
  id: string;
  name: string;
  email: string;
  posts: Post[];
};

export type GetUserQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    id: string;
    name: string;
    email: string;
    posts: { __typename?: "Post"; id: string; title: string }[];
  } | null;
};

export type GetUserQueryVariables = { id: string };

// Auto-generated React hook
export function useGetUserQuery(options: { variables: GetUserQueryVariables }) {
  return useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
}

export function useCreateUserMutation() {
  return useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument);
}
```

---

## Using Generated Hooks

```tsx
import { useGetUserQuery, useCreateUserMutation } from "./generated/graphql";

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // data.user is fully typed!
  return <h1>{data.user.name}</h1>;
}
```

---

## Server-Side Types

Generate resolver types:

```yaml
generates:
  src/generated/resolvers.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      contextType: "../context#Context"
```

```typescript
// Now resolvers are type-safe
const resolvers: Resolvers = {
  Query: {
    user: async (_, { id }, context) => {
      // TypeScript knows: id is string, context is Context
      return context.dataSources.users.getById(id);
    },
  },
};
```

---

## Key Takeaways

- **Code generation** creates TypeScript types from your GraphQL schema
- Generated **React hooks** provide type-safe data fetching
- Run codegen as part of your **dev workflow** (watch mode)
- Never write GraphQL types manually — let codegen do it
- Catches type mismatches at **compile time** instead of runtime

---

Next, we'll learn about **GraphQL with TypeScript** →
