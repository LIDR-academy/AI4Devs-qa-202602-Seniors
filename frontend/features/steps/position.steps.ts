import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test, CANDIDATE_IDS, STAGE_IDS, E2E_POSITION_ID } from './fixtures';

const { Given, When, Then } = createBdd(test);

// ──────────────────────────────────────────────────────────────────────────────
// Given
// ──────────────────────────────────────────────────────────────────────────────

Given(
  'the position page for {string} is loaded with its candidates',
  async ({ positionPage }, _positionTitle: string) => {
    await positionPage.navigate(E2E_POSITION_ID);
  },
);

// ──────────────────────────────────────────────────────────────────────────────
// Then — page load assertions
// ──────────────────────────────────────────────────────────────────────────────

Then('the position title {string} is visible', async ({ positionPage }, title: string) => {
  await expect(positionPage.title()).toBeVisible();
  await expect(positionPage.title()).toContainText(title);
});

Then(
  'the following phase columns are displayed:',
  async ({ positionPage }, dataTable: { hashes: () => Array<{ phase: string }> }) => {
    const phases = dataTable.hashes().map((row) => row.phase);
    for (const phase of phases) {
      await expect(positionPage.column(phase)).toBeVisible();
    }
  },
);

Then(
  '{string} is in the {string} phase',
  async ({ positionPage }, candidateName: string, phaseName: string) => {
    await expect(positionPage.candidateInColumn(phaseName, CANDIDATE_IDS[candidateName])).toBeVisible();
  },
);

// ──────────────────────────────────────────────────────────────────────────────
// When — drag-and-drop
// ──────────────────────────────────────────────────────────────────────────────

When(
  'the recruiter moves {string} from {string} to {string}',
  async ({ positionPage, putResponse }, candidate: string, _sourcePhase: string, destPhase: string) => {
    putResponse.value = await positionPage.dragCandidateToColumn(CANDIDATE_IDS[candidate], destPhase);
  },
);

// ──────────────────────────────────────────────────────────────────────────────
// Then — API and UI assertions after drag
// ──────────────────────────────────────────────────────────────────────────────

Then(
  'a phase change request is sent for {string} to {string}',
  async ({ putResponse }, candidate: string, destPhase: string) => {
    expect(putResponse.value, 'Expected a PUT /candidates/:id request to have been made').not.toBeNull();
    expect(putResponse.value!.url()).toContain(`/candidates/${CANDIDATE_IDS[candidate]}`);

    const body = JSON.parse(putResponse.value!.request().postData() ?? '{}') as {
      currentInterviewStep?: number;
    };
    expect(body.currentInterviewStep).toBe(STAGE_IDS[destPhase]);
  },
);

Then(
  'the backend confirms the phase change with a successful response',
  async ({ putResponse }) => {
    expect(putResponse.value, 'PUT response was not captured').not.toBeNull();
    const status = putResponse.value!.status();
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
  },
);

Then(
  '{string} appears in the {string} column',
  async ({ positionPage }, candidateName: string, phaseName: string) => {
    await expect(positionPage.candidateInColumn(phaseName, CANDIDATE_IDS[candidateName])).toBeVisible();
  },
);
