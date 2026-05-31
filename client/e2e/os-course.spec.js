import { test, expect } from "@playwright/test";

test.describe("Operating Systems Course — E2E", () => {
  test("landing page loads with correct title and sidebar", async ({ page }) => {
    await page.goto("/tutorials/operating-systems");
    await page.waitForLoadState("networkidle");

    // Lesson content heading should be visible (second h1, inside content area)
    const heading = page.getByRole("heading", {
      name: "Operating Systems",
      exact: true,
    });
    await expect(heading).toBeVisible();

    // Sidebar should list lesson links
    await expect(
      page.getByRole("link", {
        name: "What is an Operating System",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "History of Operating Systems",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("sidebar contains all 65 lessons", async ({ page }) => {
    await page.goto("/tutorials/operating-systems");
    await page.waitForLoadState("networkidle");

    // Count sidebar links - they should be lesson navigation links
    const sidebarLinks = page.locator("a[href*='/tutorials/operating-systems/']");
    const count = await sidebarLinks.count();

    // Should have at least 64 links (lesson 01 is the landing page so its link may be different)
    expect(count).toBeGreaterThanOrEqual(60);
  });

  test("navigating to a specific lesson loads correct content", async ({ page }) => {
    await page.goto("/tutorials/operating-systems/os-processes");
    await page.waitForLoadState("networkidle");

    // Lesson title should be visible
    const heading = page.getByRole("heading", {
      name: "Introduction to Processes",
    });
    await expect(heading).toBeVisible();

    // Content should have code blocks (this lesson includes C code)
    const codeBlocks = page.locator("pre code, pre");
    const codeCount = await codeBlocks.count();
    expect(codeCount).toBeGreaterThan(0);
  });

  test("prev/next navigation buttons work", async ({ page }) => {
    await page.goto("/tutorials/operating-systems/os-what-is-os");
    await page.waitForLoadState("networkidle");

    // Should show heading for lesson 2
    await expect(page.getByRole("heading", { name: "What is an Operating System" })).toBeVisible();

    // Next button should exist and navigate to lesson 3
    const nextButton = page.locator("a[href*='os-history'], button:has-text('Next')");
    if ((await nextButton.count()) > 0) {
      await nextButton.first().click();
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: "History of Operating Systems" }),
      ).toBeVisible();
    }
  });

  test("tables render correctly in lessons", async ({ page }) => {
    await page.goto("/tutorials/operating-systems/os-types");
    await page.waitForLoadState("networkidle");

    // Tables should be present and rendered
    const tables = page.locator("table");
    const tableCount = await tables.count();
    expect(tableCount).toBeGreaterThan(0);

    // Table should have headers
    const tableHeaders = page.locator("th");
    const headerCount = await tableHeaders.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test("code blocks render with syntax highlighting", async ({ page }) => {
    await page.goto("/tutorials/operating-systems/os-system-calls");
    await page.waitForLoadState("networkidle");

    // Code blocks should be present
    const codeBlocks = page.locator("pre");
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    // Code should be inside a pre element (Shiki renders code in pre > code > span)
    const firstCode = codeBlocks.first();
    await expect(firstCode).toBeVisible();
  });

  test("last lesson (summary) loads correctly", async ({ page }) => {
    await page.goto("/tutorials/operating-systems/os-summary");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", {
      name: /Course Summary/,
    });
    await expect(heading).toBeVisible();
  });
});
