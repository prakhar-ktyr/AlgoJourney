---
title: Node.js Testing
---

# Node.js Testing

Testing ensures your code works correctly now and continues to work after changes. Node.js has excellent testing tools — from built-in test runners to full-featured frameworks.

## Why test?

- **Catch bugs early** before they reach production.
- **Refactor with confidence** — tests tell you if something broke.
- **Document behavior** — tests show how code should be used.
- **Save time** — automated tests are faster than manual testing.

## Types of tests

| Type | What it tests | Speed | Example |
|------|--------------|-------|---------|
| Unit | Single function/module in isolation | Fast | `add(2, 3)` returns `5` |
| Integration | Multiple modules working together | Medium | API route + database |
| End-to-end (E2E) | Full user flow | Slow | Login → dashboard → logout |

The **testing pyramid**: many unit tests, fewer integration tests, few E2E tests.

## Node.js built-in test runner (v18+)

Node.js 18+ includes a test runner — no packages needed:

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}
```

```javascript
// math.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { add, divide } from "./math.js";

describe("add", () => {
  it("adds two positive numbers", () => {
    assert.strictEqual(add(2, 3), 5);
  });

  it("handles negative numbers", () => {
    assert.strictEqual(add(-1, -2), -3);
  });

  it("handles zero", () => {
    assert.strictEqual(add(0, 5), 5);
  });
});

describe("divide", () => {
  it("divides two numbers", () => {
    assert.strictEqual(divide(10, 2), 5);
  });

  it("throws on division by zero", () => {
    assert.throws(() => divide(10, 0), {
      message: "Division by zero",
    });
  });
});
```

Run:

```bash
node --test
# or specific file
node --test math.test.js
```

## Vitest

Vitest is a fast, modern test runner that works seamlessly with ES modules:

```bash
npm install -D vitest
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

```javascript
// math.test.js
import { describe, it, expect } from "vitest";
import { add, divide } from "./math.js";

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negatives", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});

describe("divide", () => {
  it("divides correctly", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("throws on zero divisor", () => {
    expect(() => divide(10, 0)).toThrow("Division by zero");
  });
});
```

### Vitest matchers

```javascript
// Equality
expect(value).toBe(5);                    // strict equality (===)
expect(obj).toEqual({ a: 1, b: 2 });     // deep equality
expect(value).not.toBe(3);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain("substring");

// Arrays
expect(arr).toContain("item");
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("nested.key", "value");

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("message");
expect(async () => await asyncFn()).rejects.toThrow();
```

## Testing async code

```javascript
import { describe, it, expect } from "vitest";

// Async/await
it("fetches user data", async () => {
  const user = await getUser(1);
  expect(user.name).toBe("Alice");
});

// Promises
it("resolves with user", () => {
  return expect(getUser(1)).resolves.toHaveProperty("name", "Alice");
});

// Rejections
it("rejects for invalid ID", () => {
  return expect(getUser(-1)).rejects.toThrow("Invalid ID");
});
```

## Mocking

Replace dependencies with controlled implementations:

```javascript
import { describe, it, expect, vi } from "vitest";

// Mock a function
const sendEmail = vi.fn();
sendEmail("alice@test.com", "Hello");

expect(sendEmail).toHaveBeenCalled();
expect(sendEmail).toHaveBeenCalledWith("alice@test.com", "Hello");
expect(sendEmail).toHaveBeenCalledTimes(1);

// Mock return value
const getUser = vi.fn().mockResolvedValue({ name: "Alice" });
const user = await getUser(1);
expect(user.name).toBe("Alice");
```

### Mocking modules

```javascript
import { vi } from "vitest";

// Mock an entire module
vi.mock("./database.js", () => ({
  findUser: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }),
  saveUser: vi.fn().mockResolvedValue(true),
}));

import { findUser } from "./database.js"; // uses the mock

it("uses mocked database", async () => {
  const user = await findUser(1);
  expect(user.name).toBe("Alice");
});
```

### Spying

Watch a function without replacing it:

```javascript
const obj = {
  greet(name) {
    return `Hello, ${name}`;
  },
};

const spy = vi.spyOn(obj, "greet");
obj.greet("Alice");

expect(spy).toHaveBeenCalledWith("Alice");
expect(spy).toHaveReturnedWith("Hello, Alice");

spy.mockRestore(); // restore original
```

## Testing Express APIs with supertest

```bash
npm install -D supertest
```

```javascript
// app.js
import express from "express";

const app = express();
app.use(express.json());

const users = [{ id: 1, name: "Alice" }];

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.post("/api/users", (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

export default app;
```

```javascript
// app.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("GET /api/users", () => {
  it("returns all users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/users/:id", () => {
  it("returns a user by ID", async () => {
    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Alice");
  });

  it("returns 404 for unknown ID", async () => {
    const res = await request(app).get("/api/users/999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/users", () => {
  it("creates a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Bob" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("name", "Bob");
    expect(res.body).toHaveProperty("id");
  });
});
```

## Setup and teardown

```javascript
import { describe, it, beforeEach, afterEach, beforeAll, afterAll } from "vitest";

describe("Database tests", () => {
  beforeAll(async () => {
    // Run once before all tests in this describe
    await connectTestDatabase();
  });

  afterAll(async () => {
    // Run once after all tests
    await disconnectDatabase();
  });

  beforeEach(async () => {
    // Run before each test
    await clearCollections();
  });

  afterEach(() => {
    // Run after each test
    vi.restoreAllMocks();
  });

  it("creates a user", async () => {
    // test with clean database
  });
});
```

## Code coverage

```bash
vitest run --coverage
```

```
 % Coverage report
 ----------|---------|----------|---------|---------|
 File      | % Stmts | % Branch | % Funcs | % Lines |
 ----------|---------|----------|---------|---------|
 math.js   |   100   |   100    |   100   |   100   |
 utils.js  |    85   |    75    |   100   |    85   |
 ----------|---------|----------|---------|---------|
```

Aim for high coverage on critical code, but don't chase 100% on everything.

## Testing best practices

| Practice | Why |
|----------|-----|
| Test behavior, not implementation | Tests survive refactors |
| One assertion per concept | Clear failure messages |
| Use descriptive test names | Acts as documentation |
| Keep tests independent | No shared mutable state |
| Mock external services | Tests are fast and reliable |
| Test edge cases | Empty arrays, null, boundaries |
| Run tests in CI | Catch regressions automatically |

## Key takeaways

- Use **Vitest** for fast, ESM-native testing with `expect` matchers.
- Test **async code** with `async/await` in test functions.
- Use `vi.fn()` for mocks and `vi.spyOn()` for spies.
- Test **Express APIs** with `supertest` — no server needed.
- Use `beforeEach`/`afterEach` for setup and cleanup.
- Run tests in CI and check coverage on critical paths.
