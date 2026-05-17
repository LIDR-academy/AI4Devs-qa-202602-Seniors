import { test, expect } from '@playwright/test';

/**
 * Scenario 1 — Position Page Load (approved spec: `docs/specs/e2e/position-page-load.md`).
 *
 * Prerequisites:
 * - CRA dev server at `http://localhost:3000`
 * - API at `http://localhost:3010`
 * - Database migrated and seeded (`backend/prisma/seed.ts`) so "Senior Full-Stack Engineer" exists
 *
 * Navigates from the position list to the board and asserts title, columns, and candidate placement.
 */
test.describe('Position page load', () => {
  test('recruiter sees title, hiring phases, and candidates on the hiring board', async ({ page }) => {
    const base = 'http://localhost:3000';

    await page.goto(`${base}/positions`);
    await expect(page.getByRole('heading', { name: 'Posiciones' })).toBeVisible();

    const engineeringCard = page.locator('.card').filter({ hasText: 'Senior Full-Stack Engineer' });
    await expect(engineeringCard).toBeVisible();
    await engineeringCard.getByRole('button', { name: 'Ver proceso' }).click();

    await expect(page.getByRole('heading', { name: 'Senior Full-Stack Engineer' })).toBeVisible();

    const phaseTitles = ['Initial Screening', 'Technical Interview', 'Manager Interview'];
    for (const title of phaseTitles) {
      await expect(page.locator('.card-header').filter({ hasText: title })).toBeVisible();
    }

    const technicalColumn = page.locator('.card').filter({
      has: page.locator('.card-header').filter({ hasText: 'Technical Interview' }),
    });
    await expect(technicalColumn.getByText('John Doe')).toBeVisible();
    await expect(technicalColumn.getByText('Jane Smith')).toBeVisible();

    const initialColumn = page.locator('.card').filter({
      has: page.locator('.card-header').filter({ hasText: 'Initial Screening' }),
    });
    await expect(initialColumn.getByText('Carlos García')).toBeVisible();
  });
});
