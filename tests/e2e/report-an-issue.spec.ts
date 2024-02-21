import { test, expect } from "@playwright/test";

test("report an issue test", async ({ page }) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.getByRole("main").nth(2).click();
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("Report an Issue").locator("a").click();
  await page.locator("#issue").click();
  await page.getByLabel("Submission request error").click();
  await page.getByText("Briefly describe the issuehelp_outline").click();
  await page.getByLabel("-- None --").click();
  await page.getByLabel("Chrome").click();
  await page.locator("#version").click();
  await page.locator("#version").fill("3");
  await page.locator("#description").click();
  await page.locator("#description").fill("Playwright testing");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Your request has been")).toBeVisible();
});
