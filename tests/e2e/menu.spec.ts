import { test, expect } from "@playwright/test";

test("menu selection test", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=false",
  );
  await page.getByRole("button", { name: "Manage Users" }).click();
  await expect(page.getByRole("heading")).toContainText("Manage Users");
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("Report an Issue").locator("a").click();
  await expect(
    page.getByRole("heading", { name: "Report an Issue - Image" }),
  ).toBeVisible();
  await page.getByLabel("Close").click();
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("Watch Demo").locator("a").click();
  await expect(page.locator("#chapters")).toContainText("Chapters [3]");
  await page.getByLabel("Close").click();
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("FAQs").locator("a").click();
  await expect(page.locator("h1")).toContainText("FAQ");
  await page.getByText("Dashboard").click();
});
