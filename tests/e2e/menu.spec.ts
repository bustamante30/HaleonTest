import { test } from "@playwright/test";

test.describe("Help Menu", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to the initial page
    await page.goto(
      `${process.env.VITE_PLAYWRIGHT_BASE_URL}/dashboard?period=last+3+months&status=4&toggle=true`,
    );
    await page.getByRole("button", { name: "Help expand_more" }).click();
    // Wait for the page to load after opening advanced search
    await page.waitForLoadState("domcontentloaded");
    const page1Promise = page.waitForEvent("popup");
    await page.getByLabel("Report an Issue").locator("a").click();
    const page1 = await page1Promise;
    await page1.goto(
      "https://sgsit.service-now.com/serviceportal?id=sc_cat_item&sys_id=77dae006db7fed50c473de06f4961941",
    );
  });
  test("help menu selection test", async () => {
    await page.getByRole("button", { name: "Help expand_more" }).click();
    await page.getByLabel("Watch Demo").locator("a").click();
    await page.getByRole("button", { name: "Chapters [3]" }).click();
    await page.getByRole("dialog").getByLabel("Close").click();
    await page.getByRole("button", { name: "Help expand_more" }).click();
    await page.getByLabel("FAQs").locator("a").click();
    await page.getByText("Dashboard").click();
  });

  test.afterEach(async () => {
    await page.close();
  });
});
