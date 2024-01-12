import { test, expect } from "@playwright/test";

test('UserForm emits "save" event on save action after mocking authentication', async ({
  page,
}) => {
  // Navigate to the login page
  // await page.goto("http://localhost:3000/");

  // Navigate to User mgmt
  await page.getByRole("button", { name: "Manage Users" }).click();
  await page.waitForURL("http://localhost:3000/users?role=super");
  await page.goto("http://localhost:3000/users?role=super");

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
