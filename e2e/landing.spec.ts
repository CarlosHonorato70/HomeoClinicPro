import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HomeoClinic/i);
    // Check for main CTA
    await expect(page.locator("text=Comece Grátis").first()).toBeVisible();
  });

  test("shows pricing section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Profissional").first()).toBeVisible();
    await expect(page.locator("text=Enterprise").first()).toBeVisible();
  });

  test("legal pages are accessible", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/privacidade");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/contato");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("security page loads", async ({ page }) => {
    await page.goto("/seguranca");
    await expect(page.locator("h1")).toBeVisible();
  });
});
