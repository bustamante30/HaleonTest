import { test, expect } from "@playwright/test";

test("advanced search test", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page
    .getByRole("button", { name: "filter_list Advanced Search" })
    .click();
  await page.locator("#itemNumber").click();
  await page.locator("#itemNumber").fill("1234");
  await page.locator("#startDate").click();
  await page.getByText("1", { exact: true }).nth(1).click();
  await page.getByLabel("Choose Date").getByText("4", { exact: true }).click();
  await page.getByText("PrinterPrinter NameNo results").click();
  await page.locator("#printerReference").fill("145");
  await page.locator("#poNumber").click();
  await page.locator("#poNumber").fill("345");
  await page.locator("#sgsReferenceNumberList").click();
  await page.locator("#sgsReferenceNumberList").fill("789");
  await page.locator("#printerPlateCode").click();
  await page.locator("#printerPlateCode").fill("1111");
  await page.locator("#barcodeNumber").click();
  await page.locator("#barcodeNumber").fill("555");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("button", { name: "filter_list Advanced Search" })
    .click();
  await page
    .getByRole("heading", { name: "Recent Searches [2]" })
    .click({ timeout: 60000 });
  await page.getByText("Thu, Jan 4, 2024 11:50:28 PM").click();
  await page.locator("#barcodeNumber").click();
  await page.locator("#barcodeNumber").fill("");
  await page.getByRole("button", { name: "Reset" }).click();
  await page.locator("#startDate").click();
  await page.getByText("1", { exact: true }).first().click();
  await page.getByText("4", { exact: true }).click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("Jan 3, 2024, 3:09 PM");
});
