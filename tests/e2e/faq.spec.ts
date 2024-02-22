import { test } from "@playwright/test";

test.describe("FAQ", () => {
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
    await page.getByLabel("FAQs").locator("a").click();

    // Wait for the page to load after opening advanced search
    await page.waitForLoadState("domcontentloaded");
  });
  test("faq test", async () => {
    await page
      .locator("header")
      .filter({ hasText: "Why am I being asked to" })
      .click();
    await page
      .locator("header")
      .filter({ hasText: "Why am I being asked to" })
      .click();
    await page
      .getByText(
        "Can I change the plate type for any particular colour?expand_more",
      )
      .click();
    await page
      .getByText(
        "Can I change the plate type for any particular colour?expand_less",
      )
      .click();
    await page
      .locator("header")
      .filter({ hasText: "What can I do if I cannot" })
      .click();
    await page
      .locator("header")
      .filter({ hasText: "What can I do if I cannot" })
      .click();
    await page
      .getByText("What does the image carrier reorder do?expand_more")
      .click();
    await page
      .getByText("What does the image carrier reorder do?expand_less")
      .click();
    await page
      .getByText(
        "Why does my search appear to be blank with no results?expand_more",
      )
      .click();
    await page
      .getByText(
        "Why does my search appear to be blank with no results?expand_less",
      )
      .click();
  });
  test.afterEach(async () => {
    await page.close();
  });
});
