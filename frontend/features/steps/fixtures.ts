import { test as base } from 'playwright-bdd';
import type { Response } from '@playwright/test';
import { PositionPage } from '../pages/PositionPage';

const BACKEND = 'http://localhost:3010';

// ── E2E seed data ─────────────────────────────────────────────────────────────
// These IDs are stable because test:e2e always starts from a clean Docker DB
// with only the E2E seed running (seed.cjs is not invoked) — see frontend/scripts/e2e.sh.
// The E2E seed is the first and only seed, so all auto-increment sequences start at 1.

export const E2E_POSITION_ID = 1;

export const CANDIDATE_IDS: Record<string, string> = {
  'Alice Brown': '1',
  'Bob Chen':    '2',
  'Mia Tanaka':  '3',
};

export const STAGE_IDS: Record<string, number> = {
  'Initial Screening':   1,
  'Technical Interview': 2,
  'Manager Interview':   3,
};

// Application IDs for the reset PUT — each E2E candidate has one application on the E2E position.
const APPLICATION_IDS: Record<string, number> = {
  'Alice Brown': 1,
  'Bob Chen':    2,
  'Mia Tanaka':  3,
};

// Seeded starting stage for each candidate — used by resetCandidates to restore state.
const INITIAL_STAGE: Record<string, string> = {
  'Alice Brown': 'Technical Interview',
  'Bob Chen':    'Technical Interview',
  'Mia Tanaka':  'Initial Screening',
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

type PutResponseHolder = { value: Response | null };

export const test = base.extend<{
  putResponse: PutResponseHolder;
  resetCandidates: void;
  positionPage: PositionPage;
}>({
  putResponse: async ({}, use) => {
    await use({ value: null });
  },

  resetCandidates: [
    async ({ request }, use) => {
      await Promise.all(
        Object.entries(INITIAL_STAGE).map(([name, stage]) =>
          request.put(`${BACKEND}/candidates/${CANDIDATE_IDS[name]}`, {
            data: {
              applicationId:        APPLICATION_IDS[name],
              currentInterviewStep: STAGE_IDS[stage],
            },
          }),
        ),
      );
      await use();
    },
    { auto: true },
  ],

  positionPage: async ({ page }, use) => {
    await use(new PositionPage(page));
  },
});
