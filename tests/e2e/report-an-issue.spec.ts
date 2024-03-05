import { test } from "@playwright/test";

test.describe("Report an issue", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to the initial page
    await page.goto(
      `${process.env.VITE_PLAYWRIGHT_BASE_URL}/dashboard?period=last+3+months&status=4&toggle=true`,
    );

    // Open faq
    await page.getByRole("banner").nth(1).click();
    await page.getByRole("button", { name: "Help expand_more" }).click();
  });
  test("report an issue test", async () => {
    const page1Promise = page.waitForEvent("popup");
    await page.getByLabel("Report an Issue").locator("a").click();
    const page1 = await page1Promise;
    await page1.locator("html").click();
    await page1.locator("section").click();
    await page.waitForLoadState("domcontentloaded");
    await page1
      .locator(
        "#s2id_sp_formfield_which_photon_application_are_you_reporting_an_issue_on a",
      )
      .click();
    await page1.getByRole("option", { name: "Image Carrier Reorder" }).click();
    await page1
      .locator(
        "#s2id_sp_formfield_please_select_your_issue_from_the_following_options1 a",
      )
      .click();
    await page1.getByRole("option", { name: "Other" }).click();
    await page1.locator("#s2id_sp_formfield_browser a").click();
    await page1.getByRole("option", { name: "Chrome" }).click();
    await page1.getByLabel("Browser Versions").click();
    await page1.getByLabel("Browser Versions").fill("1");
    await page1.getByLabel("Briefly describe the issue").click();
    await page1.getByLabel("Briefly describe the issue").fill("test");
    await page1.getByRole("button", { name: "Submit" }).click();
  });
  test.afterEach(async () => {
    await page.close();
  });
});
