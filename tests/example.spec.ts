import { test, expect } from "@playwright/test";

test("has correct title on login page", async ({ page }) => {
  await page.goto("/");
  // Since unauthenticated users are redirected to /login, we assert the title of the login page.
  await expect(page).toHaveTitle(/Notion Clone/);
});

test("displays login page content", async ({ page }) => {
  await page.goto("/");

  // Expect welcome message on the login page
  await expect(page.locator("text=Welcome to Notion Clone")).toBeVisible();
});

test("should be able to navigate to login page", async ({ page }) => {
  await page.goto("/");
  // The application redirects to /login if not authenticated
  await expect(page).toHaveURL(/login/);
  await expect(page.locator("text=Welcome to Notion Clone")).toBeVisible();
});

test("should initiate Google login", async ({ page }) => {
  await page.goto("/login");

  // Click the 'Continue with Google' button
  // We use page.getByRole('button', { name: 'Continue with Google' }) to accurately target the button by its accessible name.
  await page.getByRole("button", { name: "Continue with Google" }).click();

  // After clicking, the application typically redirects to Google's authentication page.
  // We can't directly test the Google login process here, but we can assert that the URL changes away from /login
  // and ideally, it redirects to the Google authentication URL.
  // Note: The exact URL might vary based on your NextAuth.js configuration and environment.
  await expect(page).not.toHaveURL(/login/);
  // You might want to add a more specific assertion here to check if the URL contains 'accounts.google.com'
  // await expect(page).toHaveURL(/accounts\.google\.com/);
});
