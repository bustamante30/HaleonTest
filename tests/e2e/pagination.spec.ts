import { test } from "@playwright/test";

test("dashboard pagination test", async ({ page }) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.locator(".p-inputswitch-slider").click();
  await page.getByLabel("Page 2").click();
  await page.getByLabel("Page 3").click();
  await page.getByLabel("Page 4").click();
  await page.getByLabel("Page 6").click();
  await page.getByLabel("Next Page").click();
  await page.getByLabel("Last Page").click();
  await page.getByLabel("Page 49").click();
  await page.getByLabel("First Page").click();
});
