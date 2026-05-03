---
title: Cypress & Playwright
---

## Introduction

Cypress and Playwright are modern end-to-end testing frameworks that address Selenium's limitations with faster execution, automatic waiting, built-in network interception, and visual debugging.

---

## Cypress

Cypress runs directly inside the browser alongside your application, giving it unique capabilities.

### Architecture

```
┌─────────────────────────────────────────┐
│              Browser                     │
│  ┌───────────────┐  ┌───────────────┐  │
│  │  Application  │◀▶│  Cypress Test  │  │
│  │  Under Test   │  │  Runner        │  │
│  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────┘
         ▲ Node.js process (plugins, tasks)
         ▼
┌─────────────────────────────────────────┐
│        Cypress Server (Node.js)          │
└─────────────────────────────────────────┘
```

### Key Features

- **Automatic waiting**: Commands retry until assertions pass
- **Time travel debugging**: Hover over steps to see DOM snapshots
- **Network stubbing**: Intercept and mock API calls with `cy.intercept`
- **Real-time reloads**: Tests re-run on file changes
- **Screenshots & videos**: Captured automatically on failure

### Login Test + API Intercept

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: { runMode: 2, openMode: 0 },
  },
});
```

```javascript
// cypress/e2e/login.cy.js
describe("Login Flow", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: { id: 1, name: "Test User", role: "admin" },
      },
    }).as("loginRequest");

    cy.intercept("GET", "/api/dashboard/stats", {
      statusCode: 200,
      body: { totalUsers: 1500, activeToday: 342 },
    }).as("statsRequest");

    cy.visit("/login");
  });

  it("logs in and displays dashboard with mocked data", () => {
    cy.get("#username").type("testuser");
    cy.get("#password").type("password123");
    cy.get("button[type='submit']").click();

    cy.wait("@loginRequest").its("request.body").should("deep.equal", {
      username: "testuser",
      password: "password123",
    });

    cy.url().should("include", "/dashboard");
    cy.wait("@statsRequest");
    cy.get("[data-testid='total-users']").should("contain", "1,500");
    cy.get("[data-testid='active-today']").should("contain", "342");
  });

  it("shows error on invalid credentials", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: { error: "Invalid credentials" },
    }).as("failedLogin");

    cy.get("#username").type("wrong");
    cy.get("#password").type("wrong");
    cy.get("button[type='submit']").click();

    cy.wait("@failedLogin");
    cy.get(".error-message")
      .should("be.visible")
      .and("contain", "Invalid credentials");
  });

  it("handles server errors gracefully", () => {
    cy.intercept("POST", "/api/auth/login", { statusCode: 500 }).as("serverError");
    cy.get("#username").type("testuser");
    cy.get("#password").type("password123");
    cy.get("button[type='submit']").click();
    cy.wait("@serverError");
    cy.get("[data-testid='error-banner']").should("be.visible");
  });
});
```

---

## Playwright

Playwright by Microsoft supports Chromium, Firefox, and WebKit with auto-waiting, browser contexts for isolation, and built-in tracing.

### Architecture

```
┌─────────────────┐     ┌────────────────────────┐
│  Test Script    │────▶│  Browser Contexts       │
│  (Node/Python/  │     │  ┌────────┐ ┌────────┐ │
│   C#/Java)      │◀────│  │Context1│ │Context2│ │
└─────────────────┘     │  │ Page1  │ │ Page1  │ │
  WebSocket/CDP         │  └────────┘ └────────┘ │
                        └────────────────────────┘
```

### Key Features

- **Multi-browser**: Chromium, Firefox, WebKit (Safari engine)
- **Auto-wait**: Actions wait for elements to be actionable
- **Browser contexts**: Isolated sessions without separate processes
- **Tracing**: Record full trace for post-mortem debugging
- **API testing**: Built-in `request` fixture
- **Code generation**: `npx playwright codegen` records interactions

### Login Test + API Intercept (JavaScript)

```javascript
// playwright.config.js
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

```javascript
// tests/login.spec.js
const { test, expect } = require("@playwright/test");

test.describe("Login Flow", () => {
  test("logs in with mocked API", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: "fake-jwt", user: { name: "Test User" } }),
      });
    });

    await page.route("**/api/dashboard/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ totalUsers: 1500, activeToday: 342 }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId("total-users")).toContainText("1,500");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ error: "Invalid credentials" }) })
    );

    await page.goto("/login");
    await page.getByLabel("Username").fill("wrong");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("handles network failure", async ({ page }) => {
    await page.route("**/api/auth/login", (route) => route.abort("connectionrefused"));

    await page.goto("/login");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("pass");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByText("Network error")).toBeVisible();
  });
});
```

---

## Cypress vs Playwright vs Selenium

| Feature | Cypress | Playwright | Selenium |
|---------|---------|------------|----------|
| **Languages** | JavaScript only | JS, Python, Java, C# | All major |
| **Browsers** | Chrome, Firefox, Edge | Chromium, Firefox, WebKit | All major |
| **Auto-waiting** | Built-in | Built-in | Manual |
| **Speed** | Fast | Very fast | Moderate |
| **Network mocking** | `cy.intercept` | `page.route` | External tools |
| **Multi-tab** | Limited | Full support | Full support |
| **Mobile** | Viewport only | Device emulation | Appium |
| **Debugging** | Time travel UI | Trace viewer | Screenshots |
| **Community** | Large | Growing fast | Largest |

### When to Use Which

- **Cypress**: JS-only team, easy setup, component testing, time-travel debugging
- **Playwright**: Cross-browser (incl. WebKit), multi-language, multi-tab, API testing
- **Selenium**: Existing suites, real mobile devices (Appium), niche languages

---

## Python Playwright

```python
# pip install playwright && playwright install
from playwright.sync_api import Page, expect


def test_login(page: Page):
    page.route(
        "**/api/auth/login",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"token":"t","user":{"name":"Test"}}',
        ),
    )

    page.goto("/login")
    page.get_by_label("Username").fill("testuser")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Log In").click()

    expect(page).to_have_url(r".*dashboard")
    expect(page.get_by_text("Welcome")).to_be_visible()


def test_api_intercept(page: Page):
    page.route(
        "**/api/users",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id":1,"name":"Mock User"}]',
        ),
    )
    page.goto("/users")
    expect(page.get_by_text("Mock User")).to_be_visible()
```

## C# Playwright

```csharp
// dotnet add package Microsoft.Playwright
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync();
var page = await browser.NewPageAsync();

await page.RouteAsync("**/api/auth/login", async route =>
{
    await route.FulfillAsync(new RouteFulfillOptions
    {
        Status = 200,
        ContentType = "application/json",
        Body = "{\"token\":\"t\",\"user\":{\"name\":\"Test\"}}"
    });
});

await page.GotoAsync("http://localhost:3000/login");
await page.GetByLabel("Username").FillAsync("testuser");
await page.GetByLabel("Password").FillAsync("password123");
await page.GetByRole(AriaRole.Button, new() { Name = "Log In" }).ClickAsync();

await Assertions.Expect(page).ToHaveURLAsync(new Regex(".*dashboard"));
await Assertions.Expect(page.GetByText("Welcome")).ToBeVisibleAsync();
```

---

## Advanced Patterns

### Cypress Custom Commands and Session Caching

```javascript
// cypress/support/commands.js
Cypress.Commands.add("login", (username, password) => {
  cy.session([username, password], () => {
    cy.visit("/login");
    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get("button[type='submit']").click();
    cy.url().should("include", "/dashboard");
  });
});

Cypress.Commands.add("apiLogin", (username, password) => {
  cy.request("POST", "/api/auth/login", { username, password }).then((res) => {
    window.localStorage.setItem("token", res.body.token);
  });
});
```

### Playwright Fixtures and Page Objects

```javascript
// tests/fixtures.js
const { test: base } = require("@playwright/test");

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Log In" });
  }

  async goto() { await this.page.goto("/login"); }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

module.exports = { test };

// Usage in test files
const { test } = require("./fixtures");
const { expect } = require("@playwright/test");

test("authenticated user sees dashboard", async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login("admin", "pass123");
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Visual Regression Testing with Playwright

```javascript
const { test, expect } = require("@playwright/test");

test("visual regression - homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });
});

test("visual regression - responsive", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage-mobile.png");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage-desktop.png");
});
```

### Playwright Tracing for Debugging

```javascript
const { test, expect } = require("@playwright/test");

test("complex workflow with tracing", async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });

  try {
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByText("Order confirmed")).toBeVisible();
  } finally {
    await context.tracing.stop({ path: "trace.zip" });
    // View: npx playwright show-trace trace.zip
  }
});
```

### Cypress Component Testing

```javascript
// cypress/component/Button.cy.jsx
import Button from "../../src/components/Button";

describe("Button Component", () => {
  it("renders with text and handles click", () => {
    const onClick = cy.stub().as("click");
    cy.mount(<Button label="Submit" onClick={onClick} />);
    cy.get("button").should("contain", "Submit").click();
    cy.get("@click").should("have.been.calledOnce");
  });

  it("renders disabled state", () => {
    cy.mount(<Button label="Disabled" disabled />);
    cy.get("button").should("be.disabled");
  });
});
```

---

## Summary

- **Cypress** excels with in-browser execution, time-travel debugging, and zero-config for JS projects
- **Playwright** offers broader browser/language support, browser contexts, and tracing
- Both provide automatic waiting and network interception that eliminate common Selenium pain points
- Use **custom commands** (Cypress) and **fixtures** (Playwright) for reusable test logic
- **Visual regression** and **tracing** add confidence for complex UIs
- Choose based on language stack, browser requirements, and multi-tab/context needs
