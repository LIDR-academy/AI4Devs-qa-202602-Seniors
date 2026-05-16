import { test, expect } from '@playwright/test';

const POSITION_ID = '1';
const POSITION_TITLE = 'Senior Full-Stack Engineer';

const PHASE_COLUMNS = [
  'phase-column-initial-screening',
  'phase-column-technical-interview',
  'phase-column-manager-interview',
] as const;

test.describe('Position Kanban — carga de pantalla', () => {
  test('muestra título, tablero, columnas y candidatos según seed', async ({ page }) => {
    // Given: el backend tiene datos seed para la posición 1
    const interviewFlowResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/positions/${POSITION_ID}/interviewflow`) &&
        response.status() === 200
    );
    const candidatesResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/positions/${POSITION_ID}/candidates`) &&
        response.status() === 200
    );

    // When: el usuario abre el tablero Kanban de la posición
    await page.goto(`/positions/${POSITION_ID}`);
    await interviewFlowResponse;
    await candidatesResponse;

    // Then: se muestra el título de la posición
    await expect(page.getByTestId('position-title')).toHaveText(POSITION_TITLE);

    // Then: el tablero Kanban está visible
    await expect(page.getByTestId('kanban-board')).toBeVisible();

    // Then: las columnas de fases del proceso están presentes
    for (const columnTestId of PHASE_COLUMNS) {
      await expect(page.getByTestId(columnTestId)).toBeVisible();
    }

    // Then: Carlos García (seed) aparece en Initial Screening
    const initialScreeningColumn = page.getByTestId('phase-column-initial-screening');
    await expect(initialScreeningColumn.getByTestId('candidate-card-3')).toBeVisible();
    await expect(initialScreeningColumn.getByText('Carlos García')).toBeVisible();

    // Then: al menos una tarjeta está en Technical Interview (John Doe o Jane Smith)
    const technicalInterviewColumn = page.getByTestId('phase-column-technical-interview');
    const technicalCandidates = technicalInterviewColumn.locator('[data-testid^="candidate-card-"]');
    await expect(technicalCandidates.first()).toBeVisible();
  });
});
