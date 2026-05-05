import { test, expect } from "@playwright/test";

test.describe("Tooltip Term — Learn More Popovers", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Python Introduction which has tooltip terms
    await page.goto("/tutorials/python/python-intro");
    await page.waitForLoadState("networkidle");
  });

  test("tooltip terms render with dotted underline styling", async ({ page }) => {
    const term = page.getByRole("button", { name: "high-level" });
    await expect(term).toBeVisible();
    await expect(term).toHaveCSS("cursor", "help");
    await expect(term).toHaveCSS("border-bottom-style", "dotted");
  });

  test("tooltip appears on hover (desktop)", async ({ page }) => {
    const term = page.getByRole("button", { name: "interpreted" });
    await expect(term).toBeVisible();

    // No tooltip visible initially
    await expect(page.getByRole("tooltip")).toBeHidden();

    // Hover over the term
    await term.hover();

    // Tooltip should appear
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("interpreter");
  });

  test("tooltip disappears when mouse leaves", async ({ page }) => {
    const term = page.getByRole("button", { name: "high-level" });
    await term.hover();
    await expect(page.getByRole("tooltip")).toBeVisible();

    // Move away from the term
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toBeHidden();
  });

  test("tooltip appears on click/tap (mobile-friendly)", async ({ page }) => {
    const term = page.getByRole("button", { name: "dynamically-typed" });
    await term.click();

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("runtime");
  });

  test("tooltip closes when clicking outside", async ({ page }) => {
    const term = page.getByRole("button", { name: "general-purpose" });
    await term.click();
    await expect(page.getByRole("tooltip")).toBeVisible();

    // Click elsewhere on the page
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole("tooltip")).toBeHidden();
  });

  test("tooltip is keyboard accessible", async ({ page }) => {
    const term = page.getByRole("button", { name: "high-level" });
    await term.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("tooltip")).toBeVisible();
  });

  test("all four Python intro terms have tooltips", async ({ page }) => {
    await expect(page.getByRole("button", { name: "high-level" })).toBeVisible();
    await expect(page.getByRole("button", { name: "interpreted" })).toBeVisible();
    await expect(page.getByRole("button", { name: "dynamically-typed" })).toBeVisible();
    await expect(page.getByRole("button", { name: "general-purpose" })).toBeVisible();
  });
});
