
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Notion Clone/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');
  
  // Expect a heading with the name of your app.
  await expect(page.locator('h1', { hasText: 'Notion Clone' })).toBeVisible();
}); 