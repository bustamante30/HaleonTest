import { test } from "@playwright/test";

test("Reorder flow testing", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page.getByPlaceholder("Search by printer, code,").click();
  await page.locator("#pv_id_21_0").click();
  await page.getByText("PET VALU CANADA INC").click();
  await page.getByRole("button", { name: "redo Re-Order" }).click();
  await page.locator("tr:nth-child(4) > td > .p-row-toggler").click();
  await page
    .getByRole("row", { name: "Row Expanded Row Unselected 2" })
    .locator("div")
    .nth(2)
    .click();
  await page
    .getByRole("cell", { name: "Plate Type Plate Thickness (1" })
    .locator("button")
    .first()
    .click();
  await page.locator("tr:nth-child(3) > td > .p-row-toggler").click();
  await page
    .getByRole("row", { name: "Row Expanded Row Unselected 1" })
    .locator("div")
    .nth(2)
    .click();
  await page.waitForLoadState("load");
  await page
    .getByRole("cell", {
      name: "Plate Type Plate Thickness (1/1000) Quantity Macdermid_RAVE_XPS_HD 67 (1.70mm)",
    })
    .locator("button")
    .first()
    .click();
  await page.getByRole("button", { name: "Re-Order Now" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Delivery Datecalendar_month$/ })
    .getByRole("combobox")
    .click();
  await page.getByText("25").click();
  await page.locator("span").filter({ hasText: "Add add" }).click();
  await page.locator("textarea").fill("1234");
  await page.locator("#confirm-order").click({ timeout: 60000 });
});
