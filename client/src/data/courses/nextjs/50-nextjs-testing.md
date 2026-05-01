---
title: Next.js Testing
---

# Next.js Testing

Testing ensures your Next.js application works correctly. This lesson covers unit tests, component tests, and end-to-end tests with popular tools.

## Testing setup with Vitest

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

```javascript
// vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

```javascript
// src/test/setup.js
import "@testing-library/jest-dom/vitest";
```

## Testing React components

```javascript
// src/components/Button.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## Testing pages with data

Mock the data fetching:

```javascript
// src/app/blog/page.test.jsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock the data module
vi.mock("@/lib/data", () => ({
  getPosts: vi.fn().mockResolvedValue([
    { id: "1", title: "First Post", slug: "first-post" },
    { id: "2", title: "Second Post", slug: "second-post" },
  ]),
}));

import BlogPage from "./page";

describe("BlogPage", () => {
  it("renders posts", async () => {
    const page = await BlogPage();
    render(page);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });
});
```

## Testing Server Actions

```javascript
// src/app/actions.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createPost } from "./actions";
import { db } from "@/lib/db";

describe("createPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a post with valid data", async () => {
    const formData = new FormData();
    formData.set("title", "Test Post");
    formData.set("content", "Test content");

    db.post.create.mockResolvedValue({ id: "1", title: "Test Post" });

    const result = await createPost(null, formData);
    expect(result.success).toBe(true);
    expect(db.post.create).toHaveBeenCalledWith({
      data: { title: "Test Post", content: "Test content" },
    });
  });

  it("returns errors for invalid data", async () => {
    const formData = new FormData();
    formData.set("title", "");

    const result = await createPost(null, formData);
    expect(result.errors).toBeDefined();
  });
});
```

## Testing Route Handlers

```javascript
// src/app/api/posts/route.test.js
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findMany: vi.fn().mockResolvedValue([
        { id: "1", title: "Post 1" },
      ]),
    },
  },
}));

import { GET } from "./route";

describe("GET /api/posts", () => {
  it("returns posts", async () => {
    const request = new Request("http://localhost/api/posts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });
});
```

## End-to-end testing with Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

```javascript
// playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev",
    port: 3000,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

```javascript
// e2e/blog.spec.js
import { test, expect } from "@playwright/test";

test("can view blog posts", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("h1")).toContainText("Blog");
  await expect(page.locator("article")).toHaveCount(10);
});

test("can create a blog post", async ({ page }) => {
  await page.goto("/blog/new");
  await page.fill('input[name="title"]', "Test Post");
  await page.fill('textarea[name="content"]', "This is test content.");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/blog\/test-post/);
  await expect(page.locator("h1")).toContainText("Test Post");
});
```

## Testing patterns

| What to test | Tool | Level |
|-------------|------|-------|
| Components | Vitest + RTL | Unit |
| Server Actions | Vitest | Unit |
| Route Handlers | Vitest | Integration |
| Pages (client) | Vitest + RTL | Integration |
| Full user flows | Playwright | E2E |

## Key takeaways

- Use **Vitest** + **React Testing Library** for component and unit tests.
- Mock `@/lib/db` and `next/cache` when testing Server Actions.
- Test Route Handlers by calling the exported functions directly.
- Use **Playwright** for end-to-end tests of full user flows.
- Server Components can be tested by calling them as async functions and rendering the result.
- Always mock external dependencies (database, APIs) in unit tests.
