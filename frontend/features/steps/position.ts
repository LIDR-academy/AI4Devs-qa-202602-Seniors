import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { PositionDetailsPage } from '../../pages/PositionDetailsPage';

const { Given, When, Then } = createBdd();

const MOCK_POSITION_ID = 1;

const MOCK_INTERVIEW_FLOW = {
  interviewFlow: {
    positionName: 'Senior Backend Engineer',
    interviewFlow: {
      interviewSteps: [
        { id: 1, name: 'Initial Screening', orderIndex: 1 },
        { id: 2, name: 'Technical Interview', orderIndex: 2 },
        { id: 3, name: 'Manager Interview', orderIndex: 3 },
      ],
    },
  },
};

const MOCK_CANDIDATES = [
  { candidateId: 101, fullName: 'Alice Johnson', currentInterviewStep: 'Initial Screening', averageScore: 4, applicationId: 201 },
  { candidateId: 102, fullName: 'Bob Smith', currentInterviewStep: 'Technical Interview', averageScore: 3, applicationId: 202 },
  { candidateId: 103, fullName: 'Carol Williams', currentInterviewStep: 'Initial Screening', averageScore: 5, applicationId: 203 },
];

let putRequestBody: Record<string, unknown> | null = null;
let putRequestUrl: string | null = null;
let putResponseStatus: number | null = null;
let sourceCandidateId: string | null = null;
let sourceColumnIndex: number | null = null;
let targetColumnIndex: number | null = null;

async function setupMocks(positionPage: PositionDetailsPage) {
  const page = positionPage.page;

  await page.route(`**/positions/${MOCK_POSITION_ID}/interviewFlow`, (route) => {
    route.fulfill({ json: MOCK_INTERVIEW_FLOW });
  });

  await page.route(`**/positions/${MOCK_POSITION_ID}/candidates`, (route) => {
    route.fulfill({ json: MOCK_CANDIDATES });
  });

  await page.route('**/candidates/*', (route) => {
    if (route.request().method() === 'PUT') {
      putRequestUrl = route.request().url();
      putRequestBody = route.request().postDataJSON();
      putResponseStatus = 200;
      route.fulfill({ status: 200, json: { success: true } });
    } else {
      route.continue();
    }
  });
}

// --- Shared Given ---

Given('the recruiter navigates to the position page', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  await setupMocks(positionPage);
  await positionPage.goto(MOCK_POSITION_ID);

  putRequestBody = null;
  putRequestUrl = null;
  putResponseStatus = null;
  sourceCandidateId = null;
  sourceColumnIndex = null;
  targetColumnIndex = null;
});

// --- Position page load steps ---

Then('the position title should be displayed', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  await expect(positionPage.title).toHaveText('Senior Backend Engineer');
});

Then('all phase columns should be visible', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  const count = await positionPage.getStageColumnCount();
  expect(count).toBe(3);
});

Then('each column should display its phase name', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  const expectedPhases = ['Initial Screening', 'Technical Interview', 'Manager Interview'];
  for (let i = 0; i < expectedPhases.length; i++) {
    await expect(positionPage.stageColumnHeader(i)).toHaveText(expectedPhases[i]);
  }
});

Then('each candidate card should be inside its corresponding phase column', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);

  // Wait for all candidate cards to render before checking placement
  await expect(positionPage.candidateCard('101')).toBeVisible();
  await expect(positionPage.candidateCard('102')).toBeVisible();
  await expect(positionPage.candidateCard('103')).toBeVisible();

  const column0Candidates = await positionPage.getCandidateIdsInColumn(0);
  expect(column0Candidates).toContain('101');
  expect(column0Candidates).toContain('103');

  const column1Candidates = await positionPage.getCandidateIdsInColumn(1);
  expect(column1Candidates).toContain('102');
});

Then('each candidate card should display the candidate name', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  await expect(positionPage.candidateName('101')).toHaveText('Alice Johnson');
  await expect(positionPage.candidateName('102')).toHaveText('Bob Smith');
  await expect(positionPage.candidateName('103')).toHaveText('Carol Williams');
});

// --- Candidate phase change steps ---

When('the recruiter drags a candidate to a different phase column', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);

  sourceCandidateId = '102';
  sourceColumnIndex = 1;
  targetColumnIndex = 2;

  const responsePromise = page.waitForResponse(
    (res) => res.request().method() === 'PUT' && res.url().includes('/candidates/'),
  );

  await positionPage.dragCandidateToColumn(sourceCandidateId, targetColumnIndex);

  const response = await responsePromise;
  putResponseStatus = response.status();
});

Then('the candidate card should appear in the destination column', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  const destCandidates = await positionPage.getCandidateIdsInColumn(targetColumnIndex!);
  expect(destCandidates).toContain(sourceCandidateId);
});

Then('the candidate card should no longer be in the source column', async ({ page }) => {
  const positionPage = new PositionDetailsPage(page);
  const srcCandidates = await positionPage.getCandidateIdsInColumn(sourceColumnIndex!);
  expect(srcCandidates).not.toContain(sourceCandidateId);
});

Then('a PUT request should be sent to the candidates endpoint', async () => {
  expect(putRequestUrl).toBeTruthy();
  expect(putRequestUrl).toContain(`/candidates/${sourceCandidateId}`);
});

Then('the request body should contain the new interview step', async () => {
  expect(putRequestBody).toBeTruthy();
  expect(putRequestBody!.currentInterviewStep).toBe(
    MOCK_INTERVIEW_FLOW.interviewFlow.interviewFlow.interviewSteps[targetColumnIndex!].id
  );
});

Then('the request body should contain the application id', async () => {
  expect(putRequestBody).toBeTruthy();
  const candidate = MOCK_CANDIDATES.find((c) => c.candidateId.toString() === sourceCandidateId);
  expect(putRequestBody!.applicationId).toBe(candidate!.applicationId);
});

Then('the backend should respond with a successful status', async () => {
  expect(putResponseStatus).toBe(200);
});
