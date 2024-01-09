import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/faq");
  await page.getByRole("banner").nth(1).click();
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("Report an Issue").locator("a").click();
  await page.locator("#pv_id_48").getByLabel("-- None --").click();
  await page.getByLabel("Incorrect Search List").click();
  await page.getByLabel("-- None --").click();
  await page.getByLabel("Chrome").click();
  await page
    .locator("div")
    .filter({ hasText: /^Browser Versions$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Browser Versions$/ })
    .getByRole("textbox")
    .fill("1");
  await page.locator("textarea").click();
  await page.locator("textarea").fill("test for playwright");
  await page.getByText("Drag & Drop files here").click();
  await page.locator("body").setInputFiles("MicrosoftTeams-image (3).png");
  await page.getByRole("button", { name: "Submit" }).click();
});
