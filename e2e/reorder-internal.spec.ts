import { test } from "@playwright/test";

test("Reorder flow testing", async ({ page }) => {
  await page.goto("https://photondev.sgsco.com/");
  await page.getByRole("button", { name: "Login As A Client" }).click();
  await page.getByRole("link", { name: "Google" }).click();
  await page.getByLabel("Email or phone").fill("imagecarriersgs");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Enter your password").fill("Ayyappa3#");
  await page.getByRole("button", { name: "Next" }).click();
  await page.goto("https://photondev.sgsco.com/b2clogin");
  await page.goto("https://photondev.sgsco.com/dashboard");
  await page.goto(
    "https://photondev.sgsco.com/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page.getByLabel("-1").click();
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
  await page.getByText("17").click();
  await page
    .locator("span")
    .filter({ hasText: "Add add" })
    .getByRole("textbox")
    .click();
  await page
    .locator("span")
    .filter({ hasText: "Add add" })
    .getByRole("textbox")
    .fill("123");
  await page.locator("textarea").click();
  await page.locator("textarea").fill("test");
  await page.locator("#confirm-order").click();
});
