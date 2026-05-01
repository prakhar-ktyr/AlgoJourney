---
title: Apollo Client Setup
---

# Apollo Client Setup

**Apollo Client** is the most popular GraphQL client for React. It handles data fetching, caching, and state management.

---

## Installation

```bash
npm install @apollo/client graphql
```

---

## Basic Setup

```jsx
// main.jsx
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

function Root() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}
```

---

## With Authentication

```jsx
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({ uri: "/graphql" });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

---

## With Subscriptions

```jsx
import { split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const wsLink = new GraphQLWsLink(createClient({
  url: "ws://localhost:4000/graphql",
  connectionParams: { authorization: `Bearer ${token}` },
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,    // Subscriptions → WebSocket
  authLink.concat(httpLink),  // Queries/Mutations → HTTP
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

---

## Defining Queries

```jsx
import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

export const GET_USER = gql`
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
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;
```

---

## Error Handling Link

```jsx
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === "UNAUTHENTICATED") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  }
  if (networkError) {
    console.error("Network error:", networkError);
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});
```

---

## Key Takeaways

- Wrap your app in `<ApolloProvider>` with a configured client
- Use **links** for auth, error handling, and transport splitting
- Define queries with `gql` template literals
- `InMemoryCache` provides automatic **normalized caching**
- Split links route subscriptions to WebSocket, everything else to HTTP

---

Next, we'll learn about **useQuery & useMutation** hooks →
