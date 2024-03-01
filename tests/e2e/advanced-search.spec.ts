import { test } from "@playwright/test";

test.describe("Advanced Search", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to the initial page
    await page.goto(
      `${process.env.VITE_PLAYWRIGHT_BASE_URL}/dashboard?period=last+3+months&status=4&toggle=true`,
    );

    // Open advanced search
    await page
      .getByRole("button", { name: "filter_list Advanced Search" })
      .click();

    // Wait for the page to load after opening advanced search
    await page.waitForLoadState("domcontentloaded");
  });

  test("advanced search test", async () => {
    // Choose start date
    await page.locator("#startDate").click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000);
    await page.getByText("1", { exact: true }).nth(1).click({ timeout: 80000 });
    await page.waitForLoadState("domcontentloaded");
    await page
      .getByLabel("Choose Date")
      .getByText("5", { exact: true }.nth(1))
      .click({ timeout: 80000 });
    await page.getByText("PrinterPrinter NameNo results").click();
    // Click on the Search button
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByLabel("Page 4").click();
  });

  test.afterEach(async () => {
    await page.close();
  });
});
