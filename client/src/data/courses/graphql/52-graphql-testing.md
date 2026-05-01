---
title: Testing GraphQL APIs
---

# Testing GraphQL APIs

Test your GraphQL API at the resolver, integration, and component levels.

---

## Server-Side: Integration Tests

Test your full GraphQL server with `supertest`:

```javascript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index.js";

describe("GraphQL API", () => {
  it("queries users", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `query { users { id, name, email } }`,
      })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.users).toBeInstanceOf(Array);
  });

  it("creates a user", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) { id, name, email }
          }
        `,
        variables: {
          input: { name: "Test User", email: "test@example.com", password: "password123" },
        },
      })
      .expect(200);

    expect(res.body.data.createUser.name).toBe("Test User");
  });

  it("returns error for invalid input", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation { createUser(input: { name: "", email: "invalid", password: "short" }) { id } }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("VALIDATION_ERROR");
  });

  it("requires auth for protected queries", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({ query: `query { me { id, name } }` });

    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });
});
```

---

## Unit Testing Resolvers

```javascript
import { describe, it, expect, vi } from "vitest";
import { resolvers } from "../schema/resolvers.js";

describe("User resolvers", () => {
  it("Query.user returns a user by ID", async () => {
    const mockUser = { id: "1", name: "Alice", email: "alice@example.com" };
    const context = {
      dataSources: {
        users: { getById: vi.fn().mockResolvedValue(mockUser) },
      },
    };

    const result = await resolvers.Query.user(null, { id: "1" }, context);
    expect(result).toEqual(mockUser);
    expect(context.dataSources.users.getById).toHaveBeenCalledWith("1");
  });

  it("User.posts returns posts for a user", async () => {
    const mockPosts = [{ id: "10", title: "Hello" }];
    const context = {
      dataSources: {
        posts: { getByAuthor: vi.fn().mockResolvedValue(mockPosts) },
      },
    };

    const result = await resolvers.User.posts({ id: "1" }, null, context);
    expect(result).toEqual(mockPosts);
  });
});
```

---

## Client-Side: Testing Components

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import UserList from "./UserList";
import { GET_USERS } from "./queries";

const mocks = [
  {
    request: { query: GET_USERS },
    result: {
      data: {
        users: [
          { id: "1", name: "Alice", email: "alice@example.com" },
          { id: "2", name: "Bob", email: "bob@example.com" },
        ],
      },
    },
  },
];

it("renders users", async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <UserList />
    </MockedProvider>
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
```

---

## Testing Error States

```jsx
const errorMocks = [
  {
    request: { query: GET_USERS },
    error: new Error("Network error"),
  },
];

it("shows error message", async () => {
  render(
    <MockedProvider mocks={errorMocks} addTypename={false}>
      <UserList />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Key Takeaways

- **Integration tests**: send real queries to your server with `supertest`
- **Unit tests**: test resolvers in isolation with mocked data sources
- **Component tests**: use `MockedProvider` to mock Apollo Client
- Test **happy paths**, **errors**, and **auth** scenarios
- Mock at the right level — data sources for resolvers, Apollo for components

---

Next, we'll learn about **Monitoring & Observability** →
