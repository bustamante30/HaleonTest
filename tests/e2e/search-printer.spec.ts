import { test, expect } from "@playwright/test";

test.describe("PrinterList", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Navigate to the initial page
    await page.goto(
      `${process.env.VITE_PLAYWRIGHT_BASE_URL}/dashboard?period=last+3+months&status=4&toggle=true`,
    );
    // Navigate to User mgmt
    await page.getByRole("button", { name: "Manage Users" }).click();
    await page.goto(`${origin}/users?role=super`);
  });

  test("Search functionality", async () => {
    // Implementing the test steps here
    const searchQuery = "PEEL";
    await page.fill("#search_printers", searchQuery);

    await page.waitForSelector(".printer");

    const searchResults = await page.$$(".printer");
    expect(searchResults.length).toBeGreaterThan(0);

    const printerNames = await Promise.all(
      searchResults.map(async (printer) => {
        return printer.innerText();
      }),
    );

    expect(printerNames).toEqual(
      expect.arrayContaining([expect.stringContaining(searchQuery)]),
    );
  });

  test.afterEach(async () => {
    await page.close();
  });
});
