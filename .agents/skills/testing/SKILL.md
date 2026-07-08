---
name: Testing
description: Testing conventions, patterns, and commands for server tests, client tests, and E2E tests
---

# Testing Guide

## Test Runners & Commands

| Scope                   | Runner                         | Command                         |
| ----------------------- | ------------------------------ | ------------------------------- |
| Server unit/integration | Vitest + supertest             | `npm run test:server`           |
| Client unit/integration | Vitest + React Testing Library | `npm run test:client`           |
| Both                    | Vitest                         | `npm test`                      |
| E2E (browser)           | Playwright (Chromium)          | `cd client && npm run test:e2e` |
| Coverage                | Vitest + v8                    | `npm run test:coverage`         |
| Watch mode              | Vitest                         | `npm run test:watch`            |

## Server Tests

Location: `server/__tests__/*.test.js`

### Setup

- Tests run with `NODE_ENV=test` automatically (`server/vitest.config.js`)
- The `app` is imported directly from `server/index.js` — no real DB connection or listen call
- Use `mongodb-memory-server` for model validation tests (see existing model tests)

### Patterns

```js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index.js";

describe("GET /api/<route>", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/api/<route>");
    expect(res.status).toBe(200);
  });
});
```

### What to Test

- **Route tests**: HTTP status codes, response shapes, error cases, auth failures
- **Model tests**: Required fields (expect `ValidationError`), enum validation, defaults
- Reference: `server/__tests__/auth.test.js`, `server/__tests__/user.model.test.js`

## Client Tests

Location: Co-located as `*.test.jsx` next to the component

### Setup

- `@testing-library/react` + `jest-dom` matchers from `client/src/test/setup.js`
- `jsdom` environment (configured in `vite.config.js`)
- Wrap components with `MemoryRouter` when they use React Router

### Patterns

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders heading", () => {
    render(
      <MemoryRouter>
        <MyComponent />
      </MemoryRouter>,
    );
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### What to Test

- Component renders without crashing
- Key UI elements are present
- User interactions (clicks, form inputs) produce expected outcomes
- Data-driven rendering (lists, conditional content)

## E2E Tests (Playwright)

Location: `client/e2e/*.spec.js`

### When to Write E2E Tests

E2E tests are required when unit tests cannot verify the behavior:

- Theme rendering and CSS styling
- Responsive layout behavior
- Complex user interaction flows
- Navigation sequences
- Computed styles and CSS specificity

### Setup

```bash
npx playwright install --with-deps chromium   # first time only
cd client && npm run test:e2e                  # headless
cd client && npm run test:e2e:ui              # interactive UI (local dev)
```

### Reference Specs

- `client/e2e/reader-mode.spec.js` — tests theme switching, toolbar interactions
- `client/e2e/tooltip-term.spec.js` — tests hover/click popover behavior
- `client/e2e/os-course.spec.js` — tests course navigation flow

## Constraints

- Never ship code without a test that exercises the changed behavior
- Never skip writing tests because "it's just a small change"
- Server tests must not connect to a real database
- E2E tests are mandatory for visual/interactive features — unit tests alone cannot catch CSS bugs
