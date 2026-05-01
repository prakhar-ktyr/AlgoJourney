---
title: JavaScript Testing
---

# JavaScript Testing

Tests are the safety net that lets you change code without fear. JavaScript has many test runners; **Vitest** is the modern default for new projects (compatible with Jest's API, much faster, native ES module support).

## What you test

A small mental model:

- **Unit tests** — one function or component, no I/O.
- **Integration tests** — several pieces working together (a route + a service + a fake DB).
- **End-to-end (E2E) tests** — a real browser driving the real app (Playwright, Cypress).

Unit tests should be the bulk of your suite — fast, focused, easy to write.

## Setup

```bash
npm install -D vitest
```

In `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Vitest auto-discovers files named `*.test.js`, `*.spec.js`, etc.

## Your first test

```javascript
// math.js
export function add(a, b) { return a + b; }
```

```javascript
// math.test.js
import { describe, it, expect } from "vitest";
import { add } from "./math.js";

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negatives", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});
```

Run:

```bash
npm test
```

You'll see green ticks for every passing test.

## Anatomy of a test

```javascript
describe("group name", () => {
  beforeAll(() => { /* once before all tests */ });
  beforeEach(() => { /* before each test */ });
  afterEach(() => { /* after each test */ });
  afterAll(() => { /* after all tests */ });

  it("does the thing", () => {
    // Arrange — set up data
    const input = [1, 2, 3];

    // Act — run the code
    const result = sum(input);

    // Assert — check the outcome
    expect(result).toBe(6);
  });
});
```

`describe` groups; `it` (or `test`) is one assertion of behavior. `beforeEach` is the most-used hook — perfect for resetting in-memory state.

## Common matchers

```javascript
expect(value).toBe(other);              // strict equality (===)
expect(value).toEqual(other);           // deep equality
expect(value).toStrictEqual(other);     // deep + ignores undefined props
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

expect(num).toBeGreaterThan(10);
expect(num).toBeCloseTo(0.3, 5);        // floating-point comparison

expect(str).toMatch(/pattern/);
expect(str).toContain("substring");

expect(arr).toHaveLength(3);
expect(arr).toContain("foo");

expect(obj).toHaveProperty("user.name", "Ada");

expect(fn).toThrow();
expect(fn).toThrow("specific message");
expect(fn).toThrow(MyError);
```

Negation: `expect(x).not.toBe(y)`.

## Async tests

Just return a promise (or use `async`/`await`):

```javascript
it("loads a user", async () => {
  const user = await getUser(1);
  expect(user.name).toBe("Ada");
});

it("rejects on missing", async () => {
  await expect(getUser(999)).rejects.toThrow("not found");
});

it("resolves with value", async () => {
  await expect(Promise.resolve(7)).resolves.toBe(7);
});
```

## Mocks and spies

Vitest's `vi` (Jest's `jest`) provides mocking utilities.

```javascript
import { vi } from "vitest";

const fn = vi.fn();
fn(1, 2);
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(1, 2);
expect(fn).toHaveBeenCalledTimes(1);

const spy = vi.fn().mockReturnValue(42);
spy();                                    // 42

vi.fn().mockResolvedValue({ ok: true });  // for async
vi.fn().mockImplementation((a) => a + 1);
```

### Mocking a module

```javascript
import { vi } from "vitest";
vi.mock("./api.js", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Mock" }),
}));
```

Use mocking sparingly — heavily mocked tests test the mocks, not the code.

## Testing the DOM

Vitest with `jsdom` lets you assert against a fake browser:

```javascript
// vitest.config.js
export default { test: { environment: "jsdom" } };
```

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Counter from "./Counter.jsx";

it("increments on click", () => {
  render(<Counter />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

`@testing-library` queries by what users see (role, label, text) — making tests resilient to refactoring.

## Snapshot tests

```javascript
expect(renderer.create(<Card user={ada} />).toJSON()).toMatchSnapshot();
```

Use sparingly — snapshots that capture huge structures become noise to update. Better for small, deliberate fragments.

## Coverage

```bash
npx vitest --coverage
```

Generates a report (and fails the build if you set thresholds). Aim for high coverage in business logic, but don't chase 100% — the last 10% is usually error branches not worth testing.

## What to test

- **Pure logic** — calculators, formatters, validators, parsers. Easiest to test, highest payoff.
- **Edge cases** — empty input, very large input, weird Unicode, leap years, time zones.
- **Bug regressions** — every fixed bug deserves a test that reproduces it.

What to skip:

- Trivial getters/setters.
- Code generated by tools.
- Third-party libraries (test your **use** of them, not them).

## Test style: small and arrange-act-assert

```javascript
// ❌ Too many things in one test
it("user flow", () => {
  const u = createUser({ name: "Ada" });
  u.login();
  u.changeEmail("a@b.com");
  expect(u.isLoggedIn).toBe(true);
  expect(u.email).toBe("a@b.com");
  // and 20 more lines...
});

// ✅ One behavior per test
describe("createUser", () => {
  it("starts logged out", () => {
    expect(createUser({ name: "Ada" }).isLoggedIn).toBe(false);
  });
});

describe("login", () => {
  it("marks the user as logged in", () => {
    const u = createUser({ name: "Ada" });
    u.login();
    expect(u.isLoggedIn).toBe(true);
  });
});
```

When a test fails, you should know *exactly* which behavior broke from the test name alone.

## Continuous integration

Run tests on every push and pull request. GitHub Actions example:

```yaml
- run: npm ci
- run: npm test
```

Tests that pass locally and fail in CI are usually caused by missing fixtures, time/timezone differences, or test order dependence — design tests to be **independent** and **deterministic** to avoid this.

## Other tools you'll meet

- **Jest** — the original; very similar API; slower but battle-tested.
- **Mocha + Chai** — older, modular.
- **Node's built-in `node:test`** — no install required, minimal API.
- **Playwright / Cypress** — real browsers for end-to-end tests.

## Next step

One last lesson: a tour of the conventions that make professional JavaScript teams productive.
