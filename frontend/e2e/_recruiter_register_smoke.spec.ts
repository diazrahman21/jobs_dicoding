import { expect, test } from "@playwright/test";

test("recruiter register role-specific", async ({ page }) => {
  const email = `recruiter-${Date.now()}@example.com`;
  await page.goto("/register/recruiter");
  await page.getByTestId("register-name").fill("Smoke Recruiter");
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-password").fill("password123");
  await page.getByTestId("register-password-confirmation").fill("password123");
  await page.getByTestId("register-submit").click();
  await page.waitForURL(/\/my-vacancies/);
  await expect(page.getByTestId("current-user")).toBeVisible();
});
