import { test } from "@playwright/test";

test("FAQ test", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/dashboard?period=last+3+months&status=4&toggle=true",
  );
  await page.getByRole("banner").nth(1).click();
  await page.getByRole("button", { name: "Help expand_more" }).click();
  await page.getByLabel("FAQs").locator("a").click();
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
