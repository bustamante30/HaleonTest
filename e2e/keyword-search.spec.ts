import { test } from "@playwright/test";

test("keyword search test", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page.getByPlaceholder("Search by printer, code,").click();
  await page.locator("#pv_id_20_0").click();
  await page.getByText("PET VALU CANADA INC").click();
  await page.locator("a").filter({ hasText: "close" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Clear All$/ })
    .locator("span")
    .nth(1)
    .click();
  await page.getByText("P470718E").click();
  await page
    .getByRole("row", {
      name: "Image Zoom Image Royal Canin Royal Canin VDF URINARY S/O PLATE RE ORDER 102819",
    })
    .dblclick();
  await page.getByText("P470718E").dblclick();
  await page.getByPlaceholder("Search by printer, code,").click();
  await page.getByPlaceholder("Search by printer, code,").fill("P470718E");
  await page.getByPlaceholder("Search by printer, code,").press("Enter");
  await page
    .locator("div")
    .filter({ hasText: /^Clear All$/ })
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Clear All$/ })
    .locator("span")
    .nth(1)
    .click();
});
