import { test, expect } from "@playwright/test";

test.describe("Reorder", () => {
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
  test("reorder flow testing", async () => {
    await page.locator(".p-datatable-wrapper").click();
    await page.getByPlaceholder("Search by printer, code,").click();
    await page.locator("#pv_id_7_1").click();
    await page
      .getByText(
        "Royal Canin VDF URINARY S/O PLATE RE ORDER 102819 17.6lb/7.98kg",
      )
      .click();
    await page
      .getByText(
        "Royal Canin VDF URINARY S/O PLATE RE-ORDER 907340 907341 17.6lb/7.98kg",
      )
      .click();

    await page.getByRole("button", { name: "redo Re-Order" }).click();
    await page
      .locator("tr:nth-child(7) > td > .p-row-toggler")
      .click({ timeout: 60000 });
    await page.getByText("Change").click();
    await page.getByLabel("Select Plate Type...").click();
    await page.getByText("DuPont_DPL").click();
    await page
      .getByRole("cell", { name: "Plate Type Plate Thickness (1" })
      .locator("button")
      .first()
      .click();
    await page.getByRole("spinbutton").dblclick();
    await page.getByRole("button", { name: "Re-Order Now" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await page
      .locator("div")
      .filter({ hasText: /^Delivery Datecalendar_month$/ })
      .getByRole("combobox")
      .click();
    await page.getByText("7", { exact: true }).click();
    await page.waitForLoadState("domcontentloaded");
    await page.locator("#confirm-order").click({ timeout: 60000 });
    await page.goto("https://photondev.sgsco.com/dashboard/5699539-9/success");
    await page.goto(
      "https://photondev.sgsco.com/dashboard/5699539-9/success?period=last+3+months&status=4&toggle=true",
    );
  });

  test("platetype validation testing", async () => {
    await page.goto(
      "https://photondev.sgsco.com/dashboard?period=last+3+months&status=4&toggle=true",
    );
    await page.getByPlaceholder("Search by printer, code,").click();
    await page.locator("#pv_id_7_0").click();
    await page
      .getByText(
        "Royal Canin VDF URINARY S/O PLATE RE-ORDER 907340 907341 17.6lb/7.98kg",
      )
      .click();
    await page.getByRole("button", { name: "redo Re-Order" }).click();
    await page
      .locator(".p-selection-column > .p-checkbox > .p-checkbox-input")
      .first()
      .check();
    await page.getByRole("button", { name: "Re-Order Now" }).click();
    await expect(
      page.getByRole("button", { name: "Re-Order Now" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Re-Order Now" }).click();
    await expect(
      page.getByText("Please select the plate type").first(),
    ).toBeVisible();
  });
  test.afterEach(async () => {
    await page.close();
  });
});
