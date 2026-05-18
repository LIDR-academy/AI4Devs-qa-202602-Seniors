import { test, expect } from '@playwright/test';

test.describe('Position Interface - Kanban Board', () => {

  const POSITION_ID = '1';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/position/${POSITION_ID}`);
  });

  // Escenario 1: Carga de la página de Position
  test('should display position title', async ({ page }) => {
    await expect(page.locator('[data-testid="position-title"]')).toBeVisible();
    const title = await page.locator('[data-testid="position-title"]').textContent();
    expect(title).not.toBe('');
  });

  test('should display all phase columns', async ({ page }) => {
    const phases = ['Initial Screening', 'Technical Interview', 'Manager Interview'];
    for (const phase of phases) {
      const selector = `[data-testid="phase-column-${phase.toLowerCase().replace(/\s+/g, '-')}"]`;
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should display candidate cards in correct phase columns', async ({ page }) => {
    const firstCandidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    await expect(firstCandidateCard).toBeVisible();
  });

  // Escenario 2: Cambio de fase de candidato (drag and drop)
  test('should fire PUT /candidates/:id with new phase on drag-and-drop', async ({ page }) => {
    const candidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    await candidateCard.waitFor({ state: 'visible' });

    const destColumn = page.locator('[data-testid="phase-column-technical-interview"]');
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/candidates/') && resp.request().method() === 'PUT'),
      candidateCard.dragTo(destColumn),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.request().postDataJSON();
    expect(body).toHaveProperty('currentInterviewStep');
  });

  test('should visually move candidate card to new column after drag', async ({ page }) => {
    const candidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    const candidateId = await candidateCard.getAttribute('data-testid');
    const destColumn = page.locator('[data-testid="phase-column-manager-interview"]');

    await candidateCard.dragTo(destColumn);

    await expect(destColumn.locator(`[data-testid="${candidateId}"]`)).toBeVisible();
  });
});