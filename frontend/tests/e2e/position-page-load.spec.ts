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
 * Uses the same `data-testid` hooks as the app (`position-list-card-*`, `board-column-*`, `candidate-card-*`).
 */
test.describe('Position page load', () => {
  test('recruiter sees title, hiring phases, and candidates on the hiring board', async ({ page, request }) => {
    const base = 'http://localhost:3000';

    const positionsRes = await request.get('http://localhost:3010/positions');
    expect(positionsRes.ok()).toBeTruthy();
    const positions = (await positionsRes.json()) as Array<{ id: number; title: string }>;
    const engineering = positions.find((p) => p.title === 'Senior Full-Stack Engineer');
    expect(engineering, 'seeded engineering position').toBeTruthy();

    const flowRes = await request.get(`http://localhost:3010/positions/${engineering!.id}/interviewflow`);
    expect(flowRes.ok()).toBeTruthy();
    const flowPayload = (await flowRes.json()) as {
      interviewFlow: { interviewFlow: { interviewSteps: Array<{ id: number; name: string }> } };
    };
    const steps = flowPayload.interviewFlow.interviewFlow.interviewSteps;

    const candidatesRes = await request.get(`http://localhost:3010/positions/${engineering!.id}/candidates`);
    expect(candidatesRes.ok()).toBeTruthy();
    const candidates = (await candidatesRes.json()) as Array<{ fullName: string; candidateId: number }>;
    const john = candidates.find((c) => c.fullName === 'John Doe');
    const jane = candidates.find((c) => c.fullName === 'Jane Smith');
    const carlos = candidates.find((c) => c.fullName === 'Carlos García');
    expect(john, 'John Doe in seed').toBeTruthy();
    expect(jane, 'Jane Smith in seed').toBeTruthy();
    expect(carlos, 'Carlos García in seed').toBeTruthy();

    await page.goto(`${base}/positions`);
    await expect(page.getByRole('heading', { name: 'Posiciones' })).toBeVisible();

    const engineeringCard = page.getByTestId(`position-list-card-${engineering!.id}`);
    await expect(engineeringCard).toBeVisible();
    await engineeringCard.getByRole('button', { name: 'Ver proceso' }).click();

    await expect(page).toHaveURL(`${base}/positions/${engineering!.id}`);
    await expect(page.getByRole('heading', { name: 'Senior Full-Stack Engineer' })).toBeVisible();

    expect(Array.isArray(steps) && steps!.length > 0, 'interview steps from API').toBeTruthy();

    for (const step of steps!) {
      expect(step?.id ?? null).not.toBeNull();
      await expect(page.getByTestId(`board-column-${step.id}`)).toBeVisible();
    }

    const technicalStep = steps.find((s) => s.name === 'Technical Interview');
    const initialStep = steps.find((s) => s.name === 'Initial Screening');
    expect(technicalStep).toBeTruthy();
    expect(initialStep).toBeTruthy();

    const technicalColumn = page.getByTestId(`board-column-${technicalStep!.id}`);
    const initialColumn = page.getByTestId(`board-column-${initialStep!.id}`);

    await expect(technicalColumn.getByTestId(`candidate-card-${john!.candidateId}`)).toBeVisible();
    await expect(technicalColumn.getByTestId(`candidate-card-${jane!.candidateId}`)).toBeVisible();

    await expect(initialColumn.getByTestId(`candidate-card-${carlos!.candidateId}`)).toBeVisible();
  });
});
