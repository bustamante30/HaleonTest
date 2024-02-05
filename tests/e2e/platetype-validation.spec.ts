import { test, expect } from "@playwright/test";

test("platetype validation in reorder flow", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
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
