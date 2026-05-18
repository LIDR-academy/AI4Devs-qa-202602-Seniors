import { expect, type Locator, type Page } from '@playwright/test';
import { createBdd, DataTable, test as base } from 'playwright-bdd';

type Stage = {
  id: number;
  title: string;
};

type Candidate = {
  candidateId: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
};

type StageUpdate = {
  method: string;
  candidateId: number;
  body: {
    applicationId?: unknown;
    currentInterviewStep?: unknown;
  };
  responseStatus: number;
};

type LastMove = {
  candidateName: string;
  candidateId: number;
  applicationId: number;
  targetStageId: number;
  targetStageTitle: string;
};

type PositionBoardContext = {
  positionId: number;
  positionTitle: string;
  stages: Stage[];
  candidates: Candidate[];
  lastMove?: LastMove;
  lastStageUpdate?: StageUpdate;
};

const defaultStageIds: Record<string, number> = {
  'Initial Screening': 1,
  'Technical Interview': 2,
  'Manager Interview': 3,
};

const defaultCandidateData: Record<string, Omit<Candidate, 'fullName' | 'currentInterviewStep'>> = {
  'Carlos Garcia': {
    candidateId: 3,
    applicationId: 4,
    averageScore: 0,
  },
  'John Doe': {
    candidateId: 1,
    applicationId: 1,
    averageScore: 5,
  },
  'Jane Smith': {
    candidateId: 2,
    applicationId: 3,
    averageScore: 4,
  },
};

const test = base.extend<{ positionBoard: PositionBoardContext }>({
  positionBoard: async ({}, use) => {
    await use({
      positionId: 1,
      positionTitle: '',
      stages: [],
      candidates: [],
    });
  },
});

const { Given, When, Then } = createBdd(test);

Given(
  'the position {string} has the following hiring stages:',
  async ({ positionBoard }, positionTitle: string, dataTable: DataTable) => {
    positionBoard.positionTitle = positionTitle;
    positionBoard.stages = dataTable.hashes().map((row, index) => {
      const stageTitle = row.stage;

      return {
        id: defaultStageIds[stageTitle] ?? index + 1,
        title: stageTitle,
      };
    });
  },
);

Given(
  'the position has the following candidates:',
  async ({ positionBoard }, dataTable: DataTable) => {
    positionBoard.candidates = dataTable.hashes().map((row, index) => {
      const defaults = defaultCandidateData[row.candidate] ?? {
        candidateId: index + 1,
        applicationId: index + 1,
        averageScore: 0,
      };

      return {
        ...defaults,
        fullName: row.candidate,
        currentInterviewStep: row.stage,
      };
    });
  },
);

Given(
  'the candidate {string} is in the {string} hiring stage',
  async ({ positionBoard }, candidateName: string, stageTitle: string) => {
    const candidate = findCandidate(positionBoard, candidateName);

    expect(candidate.currentInterviewStep).toBe(stageTitle);
  },
);

When('the recruiter opens the position hiring board', async ({ page, positionBoard }) => {
  await mockPositionBoardBackend(page, positionBoard);
  await page.goto(`http://localhost:3000/positions/${positionBoard.positionId}`);
});

When(
  'the recruiter moves {string} to the {string} hiring stage',
  async ({ page, positionBoard }, candidateName: string, targetStageTitle: string) => {
    await mockPositionBoardBackend(page, positionBoard);
    await page.goto(`http://localhost:3000/positions/${positionBoard.positionId}`);

    const candidate = findCandidate(positionBoard, candidateName);
    const targetStage = findStage(positionBoard, targetStageTitle);
    const sourceCard = getCandidateCard(page, candidate.candidateId);
    const targetColumn = getStageColumn(page, targetStage.id);
    const updateResponsePromise = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === 'PUT' &&
        response.url().endsWith(`/candidates/${candidate.candidateId}`)
      );
    });

    await dragAndDrop(sourceCard, targetColumn, page);

    const updateResponse = await updateResponsePromise;
    positionBoard.lastMove = {
      candidateName,
      candidateId: candidate.candidateId,
      applicationId: candidate.applicationId,
      targetStageId: targetStage.id,
      targetStageTitle,
    };

    if (positionBoard.lastStageUpdate) {
      positionBoard.lastStageUpdate.responseStatus = updateResponse.status();
    }
  },
);

Then(
  'the position title {string} should be shown',
  async ({ page }, expectedTitle: string) => {
    await expect(page.getByTestId('position-title')).toHaveText(expectedTitle);
  },
);

Then('the hiring stages should be shown', async ({ page, positionBoard }, dataTable: DataTable) => {
  for (const row of dataTable.hashes()) {
    const stage = findStage(positionBoard, row.stage);

    await expect(getStageColumn(page, stage.id)).toContainText(row.stage);
  }
});

Then(
  'the candidates should be shown in their current hiring stages',
  async ({ page, positionBoard }, dataTable: DataTable) => {
    for (const row of dataTable.hashes()) {
      const candidate = findCandidate(positionBoard, row.candidate);
      const stage = findStage(positionBoard, row.stage);
      const stageColumn = getStageColumn(page, stage.id);

      await expect(stageColumn.getByTestId(`candidate-card-${candidate.candidateId}`)).toContainText(
        row.candidate,
      );
    }
  },
);

Then(
  '{string} should be shown in the {string} hiring stage',
  async ({ page, positionBoard }, candidateName: string, stageTitle: string) => {
    const candidate = findCandidate(positionBoard, candidateName);
    const stage = findStage(positionBoard, stageTitle);
    const stageColumn = getStageColumn(page, stage.id);

    await expect(stageColumn.getByTestId(`candidate-card-${candidate.candidateId}`)).toContainText(
      candidateName,
    );
  },
);

Then('the candidate stage change should be saved successfully', async ({ positionBoard }) => {
  expect(positionBoard.lastMove).toBeDefined();
  expect(positionBoard.lastStageUpdate).toBeDefined();

  const lastMove = positionBoard.lastMove as LastMove;
  const lastStageUpdate = positionBoard.lastStageUpdate as StageUpdate;

  expect(lastStageUpdate.method).toBe('PUT');
  expect(lastStageUpdate.candidateId).toBe(lastMove.candidateId);
  expect(lastStageUpdate.body.applicationId).toBe(lastMove.applicationId);
  expect(lastStageUpdate.body.currentInterviewStep).toBe(lastMove.targetStageId);
  expect(lastStageUpdate.responseStatus).toBeGreaterThanOrEqual(200);
  expect(lastStageUpdate.responseStatus).toBeLessThan(300);
});

async function mockPositionBoardBackend(page: Page, positionBoard: PositionBoardContext) {
  let resolveInterviewFlow: () => void = () => undefined;
  let interviewFlowServed = false;
  const interviewFlowServedPromise = new Promise<void>((resolve) => {
    resolveInterviewFlow = resolve;
  });

  await page.route(/\/positions\/\d+\/interviewFlow$/i, async (route) => {
    interviewFlowServed = true;
    resolveInterviewFlow();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        interviewFlow: {
          positionName: positionBoard.positionTitle,
          interviewFlow: {
            id: 1,
            description: 'Standard development interview process',
            interviewSteps: positionBoard.stages.map((stage, index) => ({
              id: stage.id,
              interviewFlowId: 1,
              interviewTypeId: stage.id,
              name: stage.title,
              orderIndex: index + 1,
            })),
          },
        },
      }),
    });
  });

  await page.route(/\/positions\/\d+\/candidates$/i, async (route) => {
    if (!interviewFlowServed) {
      await interviewFlowServedPromise;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(positionBoard.candidates),
    });
  });

  await page.route(/\/candidates\/\d+$/i, async (route) => {
    const request = route.request();
    const candidateId = Number(new URL(request.url()).pathname.split('/').pop());
    const body = request.postDataJSON() as StageUpdate['body'];

    positionBoard.lastStageUpdate = {
      method: request.method(),
      candidateId,
      body,
      responseStatus: 200,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Candidate stage updated successfully',
        data: {
          candidateId,
          applicationId: body.applicationId,
          currentInterviewStep: body.currentInterviewStep,
        },
      }),
    });
  });
}

function findStage(positionBoard: PositionBoardContext, stageTitle: string) {
  const stage = positionBoard.stages.find((item) => item.title === stageTitle);

  if (!stage) {
    throw new Error(`Unknown hiring stage: ${stageTitle}`);
  }

  return stage;
}

function findCandidate(positionBoard: PositionBoardContext, candidateName: string) {
  const candidate = positionBoard.candidates.find((item) => item.fullName === candidateName);

  if (!candidate) {
    throw new Error(`Unknown candidate: ${candidateName}`);
  }

  return candidate;
}

function getStageColumn(page: Page, stageId: number) {
  return page.getByTestId(`stage-column-${stageId}`);
}

function getCandidateCard(page: Page, candidateId: number) {
  return page.getByTestId(`candidate-card-${candidateId}`);
}

async function dragAndDrop(source: Locator, target: Locator, page: Page) {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();

  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Unable to calculate drag and drop coordinates.');
  }

  const sourceX = sourceBox.x + sourceBox.width / 2;
  const sourceY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const targetY = targetBox.y + Math.min(targetBox.height - 10, 80);

  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(sourceX + 10, sourceY + 10, { steps: 5 });
  await page.mouse.move(targetX, targetY, { steps: 20 });
  await page.mouse.up();
}
