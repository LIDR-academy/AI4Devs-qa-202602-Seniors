import { test as base } from 'playwright-bdd';
import { PositionPipelinePage } from '../pages/PositionPipelinePage';
import {
  POSITION_ID,
  BACKEND_BASE,
  interviewFlowMock,
  DEFAULT_CANDIDATES,
  CandidateEntry,
} from '../fixtures/hiring-pipeline';

export type PutRecord = {
  url: string;
  candidateId: string;
  body: { applicationId: number; currentInterviewStep: number };
};

export type World = {
  candidates: CandidateEntry[];
  putConfig: { statusCode: number; delay?: number };
  recordedPuts: PutRecord[];
  putCountBeforeLastDrag: number;
};

export const test = base.extend<{
  world: World;
  pipelinePage: PositionPipelinePage;
}>({
  world: async ({}, use) => {
    const world: World = {
      // Deep-copy so each test starts with a clean slate
      candidates: DEFAULT_CANDIDATES.map(c => ({ ...c })),
      putConfig: { statusCode: 200 },
      recordedPuts: [],
      putCountBeforeLastDrag: 0,
    };
    await use(world);
  },

  pipelinePage: async ({ page, world }, use) => {
    // Interview flow: static — phases never change between scenarios
    await page.route(
      `${BACKEND_BASE}/positions/${POSITION_ID}/interviewFlow`,
      route => route.fulfill({ json: interviewFlowMock })
    );

    // Candidates: dynamic — reads world.candidates at request time so
    // individual Given steps can mutate the list before reloading the page.
    await page.route(
      `${BACKEND_BASE}/positions/${POSITION_ID}/candidates`,
      route => route.fulfill({ json: world.candidates })
    );

    // Phase update: record every PUT and respond according to world.putConfig
    await page.route(`${BACKEND_BASE}/candidates/**`, async route => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }

      const url = route.request().url();
      const candidateId = url.split('/candidates/')[1];
      const postData = route.request().postData();
      world.recordedPuts.push({
        url,
        candidateId,
        body: postData ? JSON.parse(postData) : {},
      });

      if (world.putConfig.delay) {
        await new Promise(resolve => setTimeout(resolve, world.putConfig.delay));
      }

      await route.fulfill({
        status: world.putConfig.statusCode,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    // Also intercept requests so we can listen without affecting routing
    page.on('request', request => {
      if (request.method() === 'PUT' && request.url().includes('/candidates/')) {
        // Captured above via page.route — no extra action needed
      }
    });

    await use(new PositionPipelinePage(page));

    // Teardown: unroute all interceptors so they don't bleed into the next scenario
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  },
});
