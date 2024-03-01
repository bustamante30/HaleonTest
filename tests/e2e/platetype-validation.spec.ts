import { test, expect } from "@playwright/test";

test.describe("Platetype Validation", () => {
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
  test("platetype validation test in reorder flow", async () => {
    await page.locator(".p-datatable-wrapper").click();
    await page
      .getByRole("row", {
        name: "Image Zoom Image Performatrin Prime PEEL PLASTIC PRODUCT Performatrin Prime Senior Lamb and Brown Rice Dog Food Jan 4, 2024, 11:32 PM 26lb (11.8kg) 6409784 PEEL PLASTIC PRODUCT Bag 7105732-21 unfold_more",
        exact: true,
      })
      .locator("a")
      .click();
    await page.getByRole("button", { name: "redo Re-Order" }).click();
    await page.getByRole("button", { name: "Add Expand All" }).click();
    await page
      .locator(
        "tr:nth-child(17) > .p-selection-column > .p-checkbox > .p-checkbox-box",
      )
      .click();
    await page.getByRole("button", { name: "Re-Order Now" }).click();
    await page.getByRole("button", { name: "Re-Order Now" }).click();
    await expect(
      page.locator(".p-highlight > td:nth-child(8) > .table-cell > .disabled"),
    ).toBeVisible();
  });
  test.afterEach(async () => {
    await page.close();
  });
});
