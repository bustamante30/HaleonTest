import { test, expect } from "@playwright/test";

test.describe("User Management Test", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    const origin =
      process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
    await page.goto(
      `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
    );
    // Navigate to User mgmt
    await page.getByRole("button", { name: "Manage Users" }).click();
    //await page.goto("http://localhost:3000/users?role=super");
  });

  test("User Search", async () => {
    await page.click('a.tab:has-text("Users")');

    // Validate if the user tab is selected initially
    const isSelected = await page.$eval('a.tab:has-text("Users")', (tab) =>
      tab.classList.contains("selected"),
    );
    expect(isSelected).toBeTruthy();

    const searchQuery = "Test";
    await page.fill("#search_users", searchQuery);

    await page.waitForTimeout(5000);

    const currentURL = page.url();
    expect(currentURL).toContain("users");
  });

  test.afterEach(async () => {
    await page.close();
  });
});
