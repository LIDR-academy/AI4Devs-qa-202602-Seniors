import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

Given('the application is running', async ({ page }) => {
  await page.goto('/');
});

Then('the page title should be visible', async ({ page }) => {
  await expect(page).toHaveTitle(/.+/);
});
