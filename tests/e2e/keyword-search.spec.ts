import { test } from "@playwright/test";

test("keyword search test", async ({ page }) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.getByPlaceholder("Search by printer, code,").click();
  await page.getByPlaceholder("Search by printer, code,").fill("P470718E");
  await page.getByPlaceholder("Search by printer, code,").press("Enter");
  await page.locator("#pv_id_21_0").getByText("P470718E").click();
  await page.getByText("Clear All").click();
  await page
    .locator("div")
    .filter({ hasText: /^Clear All$/ })
    .locator("span")
    .nth(1)
    .click();
});
