---
title: Automated API Testing
---

# Automated API Testing

Automated tests ensure your API works correctly and catch regressions. This lesson covers testing REST APIs with **Vitest** and **Supertest**.

---

## Setup

```bash
npm install -D vitest supertest
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

---

## Testing with Supertest

Supertest makes HTTP assertions against your Express app without starting a server:

```javascript
// app.js — export the app (don't call listen)
import express from "express";
const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
```

```javascript
// __tests__/health.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
```

---

## CRUD Tests

```javascript
describe("Users API", () => {
  it("POST /api/users creates a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" })
      .expect(201);

    expect(res.body.name).toBe("Alice");
    expect(res.body.id).toBeDefined();
  });

  it("GET /api/users lists users", async () => {
    const res = await request(app).get("/api/users").expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("GET /api/users/:id returns a user", async () => {
    // Create a user first
    const created = await request(app)
      .post("/api/users")
      .send({ name: "Bob", email: "bob@example.com" });

    const res = await request(app)
      .get(`/api/users/${created.body.id}`)
      .expect(200);

    expect(res.body.name).toBe("Bob");
  });

  it("GET /api/users/:id returns 404 for unknown ID", async () => {
    await request(app).get("/api/users/nonexistent").expect(404);
  });

  it("POST /api/users returns 400 for invalid data", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "" }) // Missing email
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it("DELETE /api/users/:id removes a user", async () => {
    const created = await request(app)
      .post("/api/users")
      .send({ name: "Delete Me", email: "delete@example.com" });

    await request(app)
      .delete(`/api/users/${created.body.id}`)
      .expect(204);

    await request(app)
      .get(`/api/users/${created.body.id}`)
      .expect(404);
  });
});
```

---

## Testing Authentication

```javascript
describe("Protected routes", () => {
  let token;

  it("returns 401 without a token", async () => {
    await request(app).get("/api/profile").expect(401);
  });

  it("logs in and returns a token", async () => {
    // Register first
    await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" })
      .expect(200);

    token = res.body.token;
    expect(token).toBeDefined();
  });

  it("accesses profile with valid token", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe("test@example.com");
  });
});
```

---

## Test Organization

```
__tests__/
├── health.test.js
├── users.test.js
├── posts.test.js
├── auth.test.js
└── helpers/
    └── setup.js        ← Shared test utilities
```

```javascript
// helpers/setup.js
import request from "supertest";
import app from "../../app.js";

export async function createTestUser(data = {}) {
  const defaults = { name: "Test User", email: `test-${Date.now()}@example.com` };
  const res = await request(app)
    .post("/api/users")
    .send({ ...defaults, ...data });
  return res.body;
}

export async function loginAs(email, password) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res.body.token;
}
```

---

## Key Takeaways

- Use **Supertest** to test Express apps without starting a server
- Test the **happy path** and **error cases** for every endpoint
- Test **authentication** flows (unauthorized, login, authorized access)
- **Export your app** without calling `.listen()` for testability
- Use **helper functions** for common operations (creating users, logging in)
- Run tests in CI/CD to catch regressions

---

Next, we'll learn about **OpenAPI/Swagger** — documenting your API →
