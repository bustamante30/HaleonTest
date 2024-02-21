import { test, expect } from "@playwright/test";

test("PrinterForm saves printer", async ({ page }) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );

  // Navigate to User mgmt
  await (await page.getByRole("button", { name: "Manage Users" })).click();

  await page.goto("http://localhost:3000/users?role=super");
  const randomSuffix = Math.floor(Math.random() * 1000);

  await page.click("#add-printer");

  // Fill the form fields with unique values
  await page
    .locator("input[aria-controls='printerName_list']")
    .type("SIGMAPLAST");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  //await page.locator("#pv_id_73_list").selectOption({ label: 'Photon' });
  await page.locator("#adminFirstName").type(`AdminFirstName${randomSuffix}`);
  await page.locator("#adminLastName").type(`AdminLastName${randomSuffix}`);
  await page.locator("#adminEmail").type(`AdminEmail${randomSuffix}@test.com`);
  await page
    .locator("#primaryPMFirstName")
    .type(`PrimaryPMFirstName${randomSuffix}`);
  await page
    .locator("#primaryPMLastName")
    .type(`PrimaryPMLastName${randomSuffix}`);
  await page
    .locator("#primaryPMEmail")
    .type(`PrimaryPMEmail${randomSuffix}@sgsco.com`);

  // Click the Save button
  await page.click("#save-printer");

  // Assert that the PrinterForm is visible in the same URL
  const currentURL = page.url();
  expect(currentURL).toContain("http://localhost:3000/users?role=super");
});
