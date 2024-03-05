import { test, expect } from "@playwright/test";

test.skip('UserForm emits "save" event on save action after mocking authentication', async ({
  page,
}) => {
  const origin =
    process.env.VITE_PLAYWRIGHT_BASE_URL ?? "https://photondev.sgsco.com/";
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );

  // Navigate to User mgmt
  await page.getByRole("button", { name: "Manage Users" }).click();

  await page.click("#add-user");
  const randomSuffix = Math.floor(Math.random() * 1000);

  await page.fill("#firstname", `TestUserFN${randomSuffix}`);
  await page.fill("#lastname", `TestUserLN${randomSuffix}`);
  await page.fill("#email", `TestUser${randomSuffix}@test.com`);

  // Click the 'Save' button
  await Promise.all([page.click("#save-user")]);

  // Validate that the "save" event was emitted
  const currentURL = page.url();
  expect(currentURL).toContain("http://localhost:3000/users/new");
});
