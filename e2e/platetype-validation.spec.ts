import { test, expect } from "@playwright/test";

test("Platetype validation", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard");
  await page.locator(".p-datatable-wrapper").click();
  await page
    .getByRole("row", {
      name: "Image Zoom Image Performatrin Prime PEEL PLASTIC PRODUCT Performatrin Prime Senior Lamb and Brown Rice Dog Food Jan 4, 2024, 11:32 PM 26lb (11.8kg) 6409784 PEEL PLASTIC PRODUCT Bag 7105732-21 unfold_more",
      exact: true,
    })
    .locator("a")
    .click();
  await page.getByRole("button", { name: "redo Re-Order" }).click();
  await page
    .locator(".p-selection-column > .p-checkbox > .p-checkbox-box")
    .first()
    .click();
  await page
    .getByRole("row", { name: "Row Collapsed Row Selected 1" })
    .getByLabel("Row Collapsed")
    .click();
  await page.getByRole("button", { name: "Add Expand All" }).click();
  await page.locator("#pv_id_224_6_expansion button").first().click();
  await page.getByRole("button", { name: "Re-Order Now" }).click();
  await page.getByRole("button", { name: "Re-Order Now" }).click();
  await expect(page.getByRole("heading", { name: "Warning" })).toBeVisible();
});
