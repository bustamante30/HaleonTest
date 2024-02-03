import { test } from "@playwright/test";

test("dashboard filter test", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page.locator(".p-inputswitch-slider").click({ timeout: 80000 });
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
  await page.getByRole("columnheader", { name: "Product Description" }).click();
  await page
    .getByRole("columnheader", { name: "Product Description" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Search by Description").fill("mars");
  await page.getByRole("button", { name: "" }).click();
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
  await page.locator(".p-inputswitch-slider").click();
});
