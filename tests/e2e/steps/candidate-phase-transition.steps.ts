import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../support/world';
import { PHASE_ID } from '../fixtures/hiring-pipeline';

const { Given, When, Then } = createBdd(test);

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given(
  'the hiring system is available with seeded test data',
  async ({ pipelinePage: _ }) => {
    // Accessing pipelinePage initialises the fixture, which registers all
    // page.route() interceptors before any navigation happens.
  }
);

Given(
  'a published position {string} exists in the system',
  async ({ pipelinePage: _ }, _positionName: string) => {
    // Covered by the interviewFlow route mock in world.ts
  }
);

Given(
  "the recruiter has opened that position's hiring pipeline",
  async ({ pipelinePage }) => {
    await pipelinePage.navigate();
  }
);

Given(
  "the position's hiring pipeline defines these phases in order:",
  async ({ pipelinePage }, table: DataTable) => {
    const phases = table.raw().map(([phase]) => phase.trim());
    await pipelinePage.waitForPhases(phases);
  }
);

// ---------------------------------------------------------------------------
// Preconditions — candidate placement
// ---------------------------------------------------------------------------

Given(
  '{string} is in the {string} phase',
  async ({ pipelinePage, world }, candidateName: string, phase: string) => {
    const candidate = world.candidates.find(c => c.fullName === candidateName);
    if (!candidate) throw new Error(`Candidate "${candidateName}" not in fixtures`);

    candidate.currentInterviewStep = phase;
    // Reload so the updated candidates mock is consumed by the React app
    await pipelinePage.reload();

    await expect(
      pipelinePage.getColumn(phase).getCandidateCard(candidateName)
    ).toBeVisible();
  }
);

Given(
  'the hiring system cannot accept phase updates for that candidate',
  async ({ world }) => {
    world.putConfig = { statusCode: 500 };
  }
);

Given(
  'the hiring system does not respond within the expected time when saving a phase change',
  async ({ world }) => {
    // Delay longer than any reasonable UI timeout; route will still respond
    // so Playwright itself doesn't hang — the app is expected to surface a timeout.
    world.putConfig = { statusCode: 200, delay: 30_000 };
  }
);

Given(
  'the hiring system rejects advancing a candidate directly to {string} from {string}',
  async ({ world }, _invalidTarget: string, _currentPhase: string) => {
    world.putConfig = { statusCode: 422 };
  }
);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

When(
  'the recruiter moves {string} to the {string} phase',
  async ({ pipelinePage, world }, candidateName: string, targetPhase: string) => {
    const candidate = world.candidates.find(c => c.fullName === candidateName);
    if (!candidate) throw new Error(`Phase not tracked for "${candidateName}"`);

    // Snapshot PUT count before drag so the persistence step can poll
    // for exactly ONE new PUT, even in consecutive-move scenarios.
    world.putCountBeforeLastDrag = world.recordedPuts.length;

    const source = pipelinePage.getColumn(candidate.currentInterviewStep);
    const target = pipelinePage.getColumn(targetPhase);
    await source.dragCardTo(candidateName, target);

    // Update tracked phase so subsequent steps resolve the source correctly
    candidate.currentInterviewStep = targetPhase;
  }
);

When(
  'the recruiter moves {string} within the {string} phase without changing phase',
  async ({ pipelinePage }, candidateName: string, phase: string) => {
    await pipelinePage.getColumn(phase).dragCardWithinColumn(candidateName);
  }
);

When(
  'the recruiter starts moving {string} but releases them outside any phase column',
  async ({ pipelinePage, world }, candidateName: string) => {
    const candidate = world.candidates.find(c => c.fullName === candidateName);
    if (!candidate) throw new Error(`Candidate "${candidateName}" not found`);
    await pipelinePage.getColumn(candidate.currentInterviewStep).dragCardOutsideBoard(candidateName);
  }
);

// ---------------------------------------------------------------------------
// Assertions — card visibility
// ---------------------------------------------------------------------------

Then(
  '{string} appears under the {string} phase',
  async ({ pipelinePage }, candidateName: string, phase: string) => {
    await expect(
      pipelinePage.getColumn(phase).getCandidateCard(candidateName)
    ).toBeVisible();
  }
);

Then(
  '{string} no longer appears under the {string} phase',
  async ({ pipelinePage }, candidateName: string, phase: string) => {
    await expect(
      pipelinePage.getColumn(phase).getCandidateCard(candidateName)
    ).not.toBeVisible();
  }
);

Then(
  '{string} no longer appears under the {string} or {string} phases',
  async ({ pipelinePage }, candidateName: string, phase1: string, phase2: string) => {
    await expect(
      pipelinePage.getColumn(phase1).getCandidateCard(candidateName)
    ).not.toBeVisible();
    await expect(
      pipelinePage.getColumn(phase2).getCandidateCard(candidateName)
    ).not.toBeVisible();
  }
);

Then(
  '{string} remains under the {string} phase',
  async ({ pipelinePage }, candidateName: string, phase: string) => {
    await expect(
      pipelinePage.getColumn(phase).getCandidateCard(candidateName)
    ).toBeVisible();
  }
);

Then(
  '{string} returns to the {string} phase on the pipeline board',
  async ({ pipelinePage }, candidateName: string, phase: string) => {
    // The app currently does not implement rollback on PUT failure.
    // This assertion documents the EXPECTED behaviour and will fail
    // until the frontend implements optimistic-update rollback.
    await expect(
      pipelinePage.getColumn(phase).getCandidateCard(candidateName)
    ).toBeVisible();
  }
);

// ---------------------------------------------------------------------------
// Assertions — network persistence
// ---------------------------------------------------------------------------

Then(
  "the candidate's phase is persisted in the system as {string}",
  async ({ world }, targetPhase: string) => {
    // Poll until a NEW PUT appears after the most recent drag.
    // Required because the app fires the PUT asynchronously after updating
    // React state — in back-to-back moves there is no DOM assertion in between
    // to absorb the async gap.
    await expect
      .poll(() => world.recordedPuts.length, {
        timeout: 5000,
        message: 'No PUT /candidates/:id request was recorded after drag',
      })
      .toBeGreaterThan(world.putCountBeforeLastDrag);

    const put = world.recordedPuts.at(-1);
    const expectedStepId = PHASE_ID[targetPhase];
    expect(expectedStepId, `Unknown phase "${targetPhase}" — not in PHASE_ID map`).toBeDefined();
    expect(put!.body.currentInterviewStep).toBe(expectedStepId);
  }
);

Then(
  "the candidate's phase in the system remains {string}",
  async ({ world }, currentPhase: string) => {
    // No PUT should have been sent (drop on same column / outside board)
    // OR the PUT was sent but the app should have rolled back — either way,
    // the last recorded PUT must NOT reference the rejected target phase's id.
    const put = world.recordedPuts.at(-1);
    if (put) {
      const currentStepId = PHASE_ID[currentPhase];
      // If a PUT was recorded, it must still reference the original phase
      expect(put.body.currentInterviewStep).toBe(currentStepId);
    }
    // If no PUT was recorded, the phase is implicitly unchanged — assertion passes.
  }
);

// ---------------------------------------------------------------------------
// Assertions — user feedback
// ---------------------------------------------------------------------------

Then(
  'the recruiter is informed that the phase change could not be saved',
  async ({ pipelinePage }) => {
    // The app currently does not implement error feedback for failed PUT requests.
    // This assertion documents the EXPECTED behaviour and will fail
    // until the frontend renders an error notification.
    await expect(
      pipelinePage.page.getByRole('alert')
    ).toBeVisible();
  }
);

Then(
  'the recruiter is informed that the phase change could not be completed',
  async ({ pipelinePage }) => {
    await expect(
      pipelinePage.page.getByRole('alert')
    ).toBeVisible();
  }
);

Then(
  'the recruiter is informed that the phase change is not allowed',
  async ({ pipelinePage }) => {
    await expect(
      pipelinePage.page.getByRole('alert')
    ).toBeVisible();
  }
);

// ---------------------------------------------------------------------------
// STABILITY REPORT
//
// S-BG   · Background steps (shared across all scenarios)
//          → Not individually runnable; covered by every scenario below.
//
// S1-TC01 · "Recruiter advances a candidate to the next hiring phase"
//            Run 1: ⏳  Run 2: ⏳  Run 3: ⏳ → PENDING (requires running frontend)
//
// S1-TC02 · "Recruiter moves a candidate between non-adjacent phases" (Outline)
//            Run 1: ⏳  Run 2: ⏳  Run 3: ⏳ → PENDING
//
// S2-TC01 · "Recruiter drops a candidate back onto their current phase"
//            Run 1: ⏳  Run 2: ⏳  Run 3: ⏳ → PENDING
//
// S2-TC02 · "Recruiter releases a candidate outside any hiring phase column"
//            Run 1: ⏳  Run 2: ⏳  Run 3: ⏳ → PENDING
//
// S2-TC03 · "Recruiter advances the same candidate twice in succession"
//            Run 1: ⏳  Run 2: ⏳  Run 3: ⏳ → PENDING
//
// S3-TC01 · "Recruiter's phase change is rejected by the backend"
//            KNOWN FAILURE — app has no PUT-failure rollback or error UI.
//            Will fail on: "returns to Applied" AND "recruiter is informed".
//            Frontend work required before stability run is meaningful.
//
// S3-TC02 · "Recruiter's phase change times out due to network issues"
//            KNOWN FAILURE — same as S3-TC01.
//
// S3-TC03 · "Recruiter's invalid phase transition is rejected" (Outline)
//            KNOWN FAILURE — same as S3-TC01.
// ---------------------------------------------------------------------------
