import { test } from "@playwright/test";

test.describe("Dashboard", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to the initial page
    await page.goto(
      `${process.env.VITE_PLAYWRIGHT_BASE_URL}/dashboard?period=last+3+months&status=4&toggle=true`,
    );

    // Wait for the page to load after opening dashboard
    await page.waitForLoadState("domcontentloaded");
  });
  test("dashboard filter test", async () => {
    await page
      .getByRole("columnheader", { name: "Brand Name" })
      .locator("svg")
      .first()
      .click();
    await page
      .getByRole("columnheader", { name: "Brand Name" })
      .getByRole("button")
      .click();
    await page.getByPlaceholder("Search by Brand").fill("nutro");
    await page.getByRole("button", { name: "" }).click();
    await page
      .getByRole("columnheader", { name: "Item Code" })
      .locator("svg")
      .click();
    await page
      .getByRole("columnheader", { name: "Product Description" })
      .click();
    await page
      .getByRole("columnheader", { name: "Product Description" })
      .getByRole("button")
      .click();
    await page.getByPlaceholder("Search by Description").fill("mars");
    await page.getByRole("button", { name: "" }).click();
    await page
      .getByRole("columnheader", { name: "Item Code" })
      .locator("div")
      .click();
    await page
      .getByRole("columnheader", { name: "Brand Name" })
      .getByRole("button")
      .click();
    await page.waitForLoadState("domcontentloaded");
    await page.getByText("Recent Orderslast 3").click();
    await page.locator(".p-datatable-wrapper").click();
  });

  test("keyword search test", async () => {
    await page.getByText("Recent Orderslast 3").click();
    await page.getByPlaceholder("Search by printer, code,").click();
    await page.locator("#pv_id_7_0").click();
    await page.getByText("Clear All").click();
    await page
      .locator("div")
      .filter({ hasText: /^Clear All$/ })
      .locator("span")
      .nth(1)
      .click();
  });

  test("dashboard pagination test", async () => {
    await page.getByLabel("Page 2").click();
    await page.getByLabel("Page 3").click();
    await page.getByLabel("Page 4").click();
    await page.getByLabel("Next Page").click();
    await page.getByLabel("First Page").click();
  });

  test.afterEach(async () => {
    await page.close();
  });
});
