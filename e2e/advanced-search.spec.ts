import { test } from "@playwright/test";

test("advanced search test", async ({ page }) => {
  // Navigate to the initial page
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );

  // Open advanced search
  await page
    .getByRole("button", { name: "filter_list Advanced Search" })
    .click();

  // Wait for the page to load after opening advanced search
  await page.waitForLoadState("domcontentloaded");

  // Choose start date
  await page.locator("#startDate").click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(5000);
  await page.getByText("1", { exact: true }).nth(1).click({ timeout: 80000 });
  await page.waitForLoadState("domcontentloaded");
  await page.getByText("5", { exact: true }).click();
  await page.getByText("PrinterPrinter NameNo results").click();
  // Click on the Search button
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByLabel("Page 4").click();
  await page.getByLabel("Page 1").click();
});
