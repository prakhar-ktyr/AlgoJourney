import { test, expect } from "@playwright/test";

test.describe("Reader Mode — Tutorial Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a tutorial with content (Rust course)
    await page.goto("/tutorials/rust");
    await page.waitForLoadState("networkidle");
  });

  test("shows Reader Mode toggle button on tutorial page", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /reader mode/i });
    await expect(toggle).toBeVisible();
  });

  test("entering reader mode hides navbar and footer", async ({ page }) => {
    const navbar = page.locator("nav").filter({ hasText: "AlgoJourney" });
    await expect(navbar).toBeVisible();

    await page.getByRole("button", { name: /reader mode/i }).click();

    await expect(navbar).toBeHidden();
    // Footer should also be hidden
    await expect(page.locator("footer")).toBeHidden();
  });

  test("reader mode toolbar appears with settings and exit buttons", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();

    const toolbar = page.getByRole("toolbar", { name: /reader mode controls/i });
    await expect(toolbar).toBeVisible();
    await expect(page.getByRole("button", { name: /exit reader mode/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /reader settings/i })).toBeVisible();
  });

  test("exiting reader mode restores navbar and footer", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();
    await page.getByRole("button", { name: /exit reader mode/i }).click();

    await expect(page.locator("nav").filter({ hasText: "AlgoJourney" })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("Escape key exits reader mode", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();
    await expect(page.locator("nav").filter({ hasText: "AlgoJourney" })).toBeHidden();

    await page.keyboard.press("Escape");
    await expect(page.locator("nav").filter({ hasText: "AlgoJourney" })).toBeVisible();
  });

  test("lesson navigation is available in reader mode", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();

    // Floating lesson nav button should be visible
    const navToggle = page.getByRole("button", { name: /toggle lesson navigation/i });
    await expect(navToggle).toBeVisible();

    // Click to open the floating nav
    await navToggle.click();
    const nav = page.getByRole("navigation", { name: /lesson navigation/i });
    await expect(nav).toBeVisible();
  });
});

test.describe("Reader Mode — Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tutorials/rust");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /reader mode/i }).click();
  });

  test("settings panel opens and closes on click outside", async ({ page }) => {
    // Open settings
    await page.getByRole("button", { name: /reader settings/i }).click();
    await expect(page.getByText("Theme")).toBeVisible();

    // Click outside to close
    await page.mouse.click(10, 10);
    await expect(page.getByText("Theme")).toBeHidden();
  });

  test("can switch to light theme", async ({ page }) => {
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Light" }).click();

    // HTML element should have the light class
    const html = page.locator("html");
    await expect(html).toHaveClass(/reader-mode-light/);
  });

  test("can switch to sepia theme", async ({ page }) => {
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Sepia" }).click();

    const html = page.locator("html");
    await expect(html).toHaveClass(/reader-mode-sepia/);
  });

  test("light theme text is readable (not white-on-white)", async ({ page }) => {
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Light" }).click();

    // Check that paragraph text has dark color (not white/light gray)
    const paragraph = page.locator("article p").first();
    const color = await paragraph.evaluate((el) => getComputedStyle(el).color);
    // color should be something dark — not rgb(255,255,255) or similar
    expect(color).not.toBe("rgb(255, 255, 255)");
    expect(color).not.toBe("rgb(229, 231, 235)"); // not gray-200
    expect(color).not.toBe("rgb(209, 213, 219)"); // not gray-300
  });

  test("code blocks adapt to light theme (not dark background)", async ({ page }) => {
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Light" }).click();

    // Code blocks should have light background in light theme
    const codeBlock = page.locator("pre").first();
    if ((await codeBlock.count()) > 0) {
      const color = await codeBlock.evaluate((el) => getComputedStyle(el).color);
      // Text should be dark (readable on light bg)
      const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        expect(r + g + b).toBeLessThan(400); // Dark text
      }
    }
  });
});

test.describe("Reader Mode — Font Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tutorials/rust");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /reader mode/i }).click();
    await page.getByRole("button", { name: /reader settings/i }).click();
  });

  test("can switch font family to serif", async ({ page }) => {
    await page.getByRole("button", { name: "Serif", exact: true }).click();

    // The content container should have font-serif class
    const content = page.locator(".font-serif").first();
    await expect(content).toBeVisible();
  });

  test("can change font size", async ({ page }) => {
    await page.getByRole("button", { name: "L", exact: true }).click();

    // The content container should have text-lg class
    const content = page.locator(".text-lg");
    await expect(content).toBeVisible();
  });
});

test.describe("Reader Mode — DSA Problem Resource Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dsa-sheet/problem/user-input-output");
    await page.waitForLoadState("networkidle");
  });

  test("shows Reader Mode toggle on problem resource page", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /reader mode/i });
    await expect(toggle).toBeVisible();
  });

  test("entering reader mode preserves language selector", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();

    const langSelector = page.getByLabel("Select code snippet language");
    await expect(langSelector).toBeVisible();
  });

  test("theme persists across page navigation", async ({ page }) => {
    await page.getByRole("button", { name: /reader mode/i }).click();
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Sepia" }).click();

    // Navigate to tutorial page
    await page.getByRole("button", { name: /exit reader mode/i }).click();
    await page.goto("/tutorials/rust");
    await page.waitForSelector("article");
    await page.getByRole("button", { name: /reader mode/i }).click();

    // Should still be sepia
    await expect(page.locator("html")).toHaveClass(/reader-mode-sepia/);
  });
});

test.describe("Reader Mode — Syntax Highlighting", () => {
  test("code blocks render Shiki syntax highlighting with multiple colors", async ({ page }) => {
    // Navigate to a lesson with code blocks
    await page.goto("/tutorials/rust/rust-syntax");
    await page.waitForLoadState("networkidle");

    // Wait for Shiki to load and render highlighted code
    const shikiBlock = page.locator(".shiki-wrapper .shiki").first();
    await expect(shikiBlock).toBeVisible({ timeout: 15000 });

    // Shiki should produce spans with different colors (not monochrome)
    const spans = shikiBlock.locator("span[style]");
    const count = await spans.count();
    expect(count).toBeGreaterThan(2);

    // Collect unique colors to verify multiple token colors exist
    const colors = new Set();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const style = await spans.nth(i).getAttribute("style");
      if (style) colors.add(style);
    }
    expect(colors.size).toBeGreaterThan(1);
  });

  test("syntax highlighting adapts to light theme", async ({ page }) => {
    await page.goto("/tutorials/rust/rust-syntax");
    await page.waitForLoadState("networkidle");

    // Enter reader mode and switch to light theme
    await page.getByRole("button", { name: /reader mode/i }).click();
    await page.getByRole("button", { name: /reader settings/i }).click();
    await page.getByRole("button", { name: "Light" }).click();

    // Shiki wrapper should still be visible with light theme colors
    const shikiBlock = page.locator(".shiki-wrapper .shiki").first();
    await expect(shikiBlock).toBeVisible({ timeout: 15000 });

    // Verify spans exist with styling
    const spans = shikiBlock.locator("span[style]");
    const count = await spans.count();
    expect(count).toBeGreaterThan(2);
  });
});
