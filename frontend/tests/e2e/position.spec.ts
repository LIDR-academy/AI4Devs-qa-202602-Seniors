import { test, expect } from '@playwright/test';
import { dragCandidateToPhase } from './helpers/kanbanDrag';

const POSITION_ID = '1';
const POSITION_TITLE = 'Senior Full-Stack Engineer';
const CANDIDATE_ID = '3';
const CANDIDATE_CARD_TEST_ID = `candidate-card-${CANDIDATE_ID}`;
const SOURCE_PHASE_COLUMN = 'phase-column-initial-screening';
const TARGET_PHASE_COLUMN = 'phase-column-technical-interview';
const TARGET_STEP_NAME = 'Technical Interview';

const PHASE_COLUMNS = [
  'phase-column-initial-screening',
  'phase-column-technical-interview',
  'phase-column-manager-interview',
] as const;

type InterviewStep = {
  id: number;
  name: string;
};

type PositionCandidate = {
  candidateId: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
};

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

test.describe('Position Kanban — cambio de fase', () => {
  test('mueve candidato entre columnas y persiste en backend', async ({ page }) => {
    // Given: el tablero carga y expone los pasos del interview flow
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

    await page.goto(`/positions/${POSITION_ID}`);
    const flowResponse = await interviewFlowResponse;
    const candidatesApiResponse = await candidatesResponse;

    const flowPayload = await flowResponse.json();
    const interviewSteps: InterviewStep[] =
      flowPayload.interviewFlow.interviewFlow.interviewSteps;
    const technicalInterviewStep = interviewSteps.find((step) => step.name === TARGET_STEP_NAME);
    expect(technicalInterviewStep).toBeDefined();

    const candidates: PositionCandidate[] = await candidatesApiResponse.json();
    const carlosApplication = candidates.find(
      (candidate) => candidate.candidateId === Number(CANDIDATE_ID)
    );
    expect(carlosApplication).toBeDefined();

    // Given: Carlos García está en Initial Screening
    const sourceColumn = page.getByTestId(SOURCE_PHASE_COLUMN);
    await expect(sourceColumn.getByTestId(CANDIDATE_CARD_TEST_ID)).toBeVisible();
    await expect(sourceColumn.getByText('Carlos García')).toBeVisible();

    // When: el usuario arrastra la tarjeta a Technical Interview
    const putResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        response.url().includes(`/candidates/${CANDIDATE_ID}`) &&
        response.status() === 200
    );

    await dragCandidateToPhase(page, CANDIDATE_CARD_TEST_ID, TARGET_PHASE_COLUMN);
    const putResponse = await putResponsePromise;

    // Then: el backend recibe PUT /candidates/3 con la nueva fase
    const putBody = putResponse.request().postDataJSON() as {
      applicationId: number;
      currentInterviewStep: number;
    };

    expect(putBody).toHaveProperty('applicationId', carlosApplication!.applicationId);
    expect(putBody).toHaveProperty('currentInterviewStep', technicalInterviewStep!.id);
    expect(typeof putBody.applicationId).toBe('number');
    expect(typeof putBody.currentInterviewStep).toBe('number');

    // Then: la tarjeta aparece en la columna destino y desaparece del origen
    const targetColumn = page.getByTestId(TARGET_PHASE_COLUMN);
    await expect(targetColumn.getByTestId(CANDIDATE_CARD_TEST_ID)).toBeVisible();
    await expect(sourceColumn.getByTestId(CANDIDATE_CARD_TEST_ID)).toHaveCount(0);
  });
});
