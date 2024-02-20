import { expect, chromium } from "playwright/test";

module.exports = async () => {
  // const browserServer = await chromium.launchServer();
  // const wsEndpoint = browserServer.wsEndpoint();
  // // Use web socket endpoint later to establish a connection.
  // const browser = await chromium.connect(wsEndpoint);
  const browser = await chromium.launch({ headless: false });
  await browser.newContext();
  const page = await browser.newPage();
  await page.goto(process.env.VITE_BASE_URL ?? "https://photondev.sgsco.com/");
  const origin = await page.evaluate(() => window.location.origin);
  await page.goto(`${origin}/dashboard`);
  await page.getByRole("button", { name: "Login As A Client" }).click();
  await page.getByRole("link", { name: "Google" }).click();
  await page
    .getByLabel("Email or phone")
    .fill(process.env.VITE_PLAYWRIGHT_GMAIL_USERNAME ?? "test");
  await page.getByRole("button", { name: "Next" }).click();
  await page.screenshot({ path: "test-screenshot.png" });
  await page
    .getByLabel("Enter your password")
    .fill(process.env.VITE_PLAYWRIGHT_GMAIL_PASSWORD ?? "test@123");
  await page
    .locator("#passwordNext")
    .getByRole("button", { name: "Next" })
    .click();
  await page.waitForURL(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  expect(page).toHaveURL(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.goto(
    `${origin}/b2clogin#state=eyJpZCI6IjY4MGRkOTk4LTY2YzAtNDM0NS04ZjM1LTliY2QxYmFhMWI4YSIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3d&client_info=eyJ1aWQiOiJjZmU2ZjkxYy01NGJiLTQwNWItYmEwOS1iOTc4ZWQxZTljYWQtYjJjXzFhX3NpZ251cF9zaWduaW4iLCJ1dGlkIjoiNTU1ODVjYzgtYTIyZS00YjJkLWE4NTktMjZkODRlMTEwZjU5In0&code=eyJraWQiOiJuYWdHUVI3QkstVVVSUGJ4THFfdzhIdFUwc0E4QkZSXy13TFg5R3ltT01ZIiwidmVyIjoiMS4wIiwiemlwIjoiRGVmbGF0ZSIsInNlciI6IjEuMCJ9.0FnH9MV_aguQR0VhX4qw4Cw0Mmxmy01kCaXCvxAfwRBuxmAm_-EDlSBctD_BVPqh32QF8QOQx4mjUnoJfT2idMcCJBC5SDNxkLVQfXscqUQDgTeWv-f5qPkimP7Dj6riX0cPb80baOPZe2-ZKck0Gu75v0uNc1_09s5IFlqtlPhpW9HpViVDSUm_oLguZ3wD4esSeabP3pGbhsSD9V57fqmFE9xAFTfqdJMzM-mQMLcxbOP0j4x6Sc65RIenzXZJYWZNqp5D6Yz4uih9TCgSmlxdhggwBsRMtH6I6HT1dUASDu04TDPMtoS7-rEnb0M8slnuMwOESokv1xlV9TnryA.sLZzN3_hOZdgikVY.yYnak7M2zf2tVALEhKzz0kk00I-WEoYBk9wTaOtR8ISTbuZWnXvDhr_0p1MolzaZbmO0RNtVG4LGrlIYxDwEYIEGGW3Pv7CoXZOQoQyGtF8beGLPBbcXoYMEiDdNWorcXpszK9YyzisGuRuhHDeUQ-_Kueh3VUDz3F_fbYVWI2nQwwVGfglXEzU9RFVNl-vamxzVgHlDv81SgcLckitYcBR7m23_lyc0GNjIhluuH6pFVrBuNIs3KSOdulaND3WhU2GCBnqv0PCSAwhtsR49AHSDyP6OIoslgaBvVCotmZylcwuinesKmeJN9_YVXNk7cTayWSx3-_YrFs9vZU595ZiGC-o_kzTtA8FOaOFo5Ys1WLJi2ljm-h1zlqlxZ_s8OpaaoXjfkUVzzV2RmYotU870TFIeSAAQQIQ9pFW3zDfpNnegrw6VdghThnRgU-dJtBAhAFgCIPfcnYcf-fMpyOeDW-2P_bCYt-rz8qm6qCpBeT1ltIwWBhZlQW4imXhHoEpgU2m8vKZYBEVptsRSYQ7JKfS-moTO-29vwOcR7fdwK248nJHNnvH7NuUDTTZh8SpfSWwHjWxb8akBwzQcxE6w0DFIvJyNex11b9DnULU8A9L7p2G1gfejfnM2-yGYgPeyOvF-oXXNKhp-Z7pZlN1BKpGwGnjfL9zAGRvDYr3LUMOEDmsK3beNnBEAgbuZLPcVwG_qHhumf4PvwPIhLdqUeYwYnvuwWpN0QcOK-gjLbRKXKXa-wVpvAgjOmU4cSr7fDtXdqf1S3rbfMt_k2eMEShrSVNJoNG9RUpAjC3Sk91ecVlqTqdZRbjhIWrg69sxdyHUEKCOwaqDKKVKJPgXM3OLSMgMgIMKewnAzncC_TNJhT1PK-oQcWc5KiHY.esYp8hdj0wEnCme0aHvvJw`,
  );
  await page.goto(`${origin}/b2clogin#`);
  await page.goto(`${origin}/b2clogin`);
  await page.goto(`${origin}/dashboard`);
  await page.goto(
    `${origin}/dashboard?period=last+3+months&status=4&toggle=true`,
  );
  await page.context().storageState({ path: "state.json" });
  await browser.close();
};
