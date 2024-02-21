import { test } from "@playwright/test";

test("send to pm test", async ({ page }) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.locator("a").filter({ hasText: "Send to PM" }).click();
  await page.waitForLoadState("domcontentloaded");
  await page.getByLabel("Brand").click();
  await page.getByLabel("Brand").fill("Testing");
  await page.getByLabel("Purchase Order #").click();
  await page.getByLabel("Purchase Order #").fill("1234");
  await page.getByLabel("Send to PM").getByRole("combobox").first().click();
  await page.getByLabel("Can/Bottle/Tube/Tin (Direct").click();
  await page.getByLabel("Product Description").click();
  await page.getByLabel("Product Description").fill("456");
  await page.getByLabel("Item Code").click();
  await page.getByLabel("Item Code").fill("444");
  await page.getByLabel("Plate ID").click();
  await page.getByLabel("Plate ID").fill("12345");
  await page
    .locator("div")
    .filter({ hasText: /^Delivery Date calendar_month$/ })
    .getByRole("combobox")
    .click();
  await page.getByText("12", { exact: true }).click();
  await page.getByLabel("Send to PM").getByRole("combobox").nth(3).click();
  await page.getByLabel("DataMatrix", { exact: true }).click();
  await page.getByLabel("Code #").click();
  await page.getByLabel("Code #").fill("123");
  await page.getByLabel("SGS Reference Number").click();
  await page.getByLabel("SGS Reference Number").fill("567");
  await page.getByRole("button", { name: "add Add Colour" }).click();
  await page.getByPlaceholder("Enter color name").click();
  await page.getByPlaceholder("Enter color name").fill("Black");
  await page.getByLabel("Select plate type").click();
  await page.getByLabel("AGFA_WS95").click();
  await page
    .getByRole("row", { name: "Enter color name AGFA_WS95" })
    .locator("button")
    .first()
    .click();
  await page.getByRole("spinbutton").dblclick();
  await page.getByLabel("Comments").click();
  await page.getByLabel("Comments").fill("Test");
  await page
    .getByRole("button", { name: "Send send" })
    .click({ timeout: 60000 });
});
