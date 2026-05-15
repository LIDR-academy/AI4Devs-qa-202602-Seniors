import { test, expect, Page } from '@playwright/test';

/**
 * Mock data for the Position drag-and-drop tests.
 * Mirrors the API response shapes from the backend.
 */
const POSITION_ID = 1;

const interviewFlowResponse = {
  interviewFlow: {
    positionName: 'Senior Frontend Developer',
    interviewFlow: {
      id: 1,
      description: 'Standard interview process',
      interviewSteps: [
        { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
        { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
        { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 3 },
      ],
    },
  },
};

const candidatesResponse = [
  { fullName: 'John Doe', currentInterviewStep: 'Initial Screening', candidateId: 1, applicationId: 101, averageScore: 3 },
  { fullName: 'Jane Smith', currentInterviewStep: 'Initial Screening', candidateId: 2, applicationId: 102, averageScore: 4 },
  { fullName: 'Carlos García', currentInterviewStep: 'Technical Interview', candidateId: 3, applicationId: 103, averageScore: 5 },
  { fullName: 'Ana López', currentInterviewStep: 'Manager Interview', candidateId: 4, applicationId: 104, averageScore: 2 },
];

/**
 * Performs a drag-and-drop using mouse events compatible with react-beautiful-dnd.
 * react-beautiful-dnd does not respond to native HTML5 drag events;
 * it requires a mousedown → mousemove (past threshold) → mousemove (to target) → mouseup sequence.
 */
async function dragAndDrop(page: Page, sourceLocator: any, targetLocator: any) {
  const sourceBox = await sourceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Could not get bounding box for source or target element');
  }

  const sourceCenter = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };

  const targetCenter = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height / 2,
  };

  // Start drag: mousedown on source
  await page.mouse.move(sourceCenter.x, sourceCenter.y);
  await page.mouse.down();

  // Move past the drag threshold (react-beautiful-dnd requires movement to activate)
  await page.mouse.move(sourceCenter.x, sourceCenter.y + 20, { steps: 10 });

  // Pause briefly to allow react-beautiful-dnd to recognize the drag
  await page.waitForTimeout(200);

  // Move to target position with enough steps for smooth interpolation
  await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 30 });

  // Brief pause before dropping to let the library process the position
  await page.waitForTimeout(100);

  // Drop: mouseup at target
  await page.mouse.up();
}

test.describe('Candidate stage change', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls and return mock data
    await page.route(`**/positions/${POSITION_ID}/interviewFlow`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(interviewFlowResponse),
      });
    });

    await page.route(`**/positions/${POSITION_ID}/candidates`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(candidatesResponse),
      });
    });

    await page.goto(`/positions/${POSITION_ID}`);

    // Wait until candidates are rendered
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('moves a candidate to another stage and triggers the correct PUT request', async ({ page }) => {
    // --- Setup: intercept the PUT request to /candidates/:id ---
    let putRequestCaptured: { url: string; method: string; body: any } | null = null;

    await page.route('**/candidates/**', (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        putRequestCaptured = {
          url: request.url(),
          method: request.method(),
          body: JSON.parse(request.postData() || '{}'),
        };
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate updated successfully' }),
        });
      } else {
        route.continue();
      }
    });

    // --- Identify the candidate and columns ---
    // We'll drag "John Doe" (candidateId: 1, applicationId: 101) from "Initial Screening" to "Technical Interview"
    const candidateCard = page.locator('[data-rbd-draggable-id="1"]');
    await expect(candidateCard).toBeVisible();

    // Target: the "Technical Interview" droppable area (droppableId "1" = index 1)
    const targetColumn = page.locator('[data-rbd-droppable-id="1"]');
    await expect(targetColumn).toBeVisible();

    // Verify candidate starts in "Initial Screening" column (droppableId "0")
    const sourceColumn = page.locator('[data-rbd-droppable-id="0"]');
    await expect(sourceColumn.getByText('John Doe')).toBeVisible();

    // --- Perform drag-and-drop ---
    await dragAndDrop(page, candidateCard, targetColumn);

    // --- Assert: candidate card is now visible in the destination column ---
    await expect(targetColumn.getByText('John Doe')).toBeVisible();

    // --- Assert: PUT request was triggered with correct data ---
    expect(putRequestCaptured).not.toBeNull();
    expect(putRequestCaptured!.method).toBe('PUT');
    // URL should contain /candidates/1 (candidateId of John Doe)
    expect(putRequestCaptured!.url).toContain('/candidates/1');
    // Body should contain applicationId and the new stage ID
    // "Technical Interview" stage has id: 2 in our mock data
    expect(putRequestCaptured!.body).toEqual({
      applicationId: 101,
      currentInterviewStep: 2,
    });
  });

  test('PUT request uses the correct candidate ID for the moved candidate', async ({ page }) => {
    // Intercept PUT to capture request details
    let putRequestUrl = '';

    await page.route('**/candidates/**', (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        putRequestUrl = request.url();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate updated successfully' }),
        });
      } else {
        route.continue();
      }
    });

    // Drag "Carlos García" (candidateId: 3) from "Technical Interview" to "Manager Interview"
    const candidateCard = page.locator('[data-rbd-draggable-id="3"]');
    await expect(candidateCard).toBeVisible();

    const targetColumn = page.locator('[data-rbd-droppable-id="2"]');
    await expect(targetColumn).toBeVisible();

    await dragAndDrop(page, candidateCard, targetColumn);

    // Verify the candidate moved visually
    await expect(targetColumn.getByText('Carlos García')).toBeVisible();

    // Verify the PUT URL contains the correct candidate ID
    expect(putRequestUrl).toContain('/candidates/3');
  });

  test('PUT request body contains the correct destination stage ID', async ({ page }) => {
    // Intercept PUT to capture request body
    let putBody: any = null;

    await page.route('**/candidates/**', (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        putBody = JSON.parse(request.postData() || '{}');
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate updated successfully' }),
        });
      } else {
        route.continue();
      }
    });

    // Drag "Jane Smith" (candidateId: 2, applicationId: 102) from "Initial Screening" to "Manager Interview"
    const candidateCard = page.locator('[data-rbd-draggable-id="2"]');
    await expect(candidateCard).toBeVisible();

    // "Manager Interview" is droppableId "2", stage id: 3
    const targetColumn = page.locator('[data-rbd-droppable-id="2"]');
    await expect(targetColumn).toBeVisible();

    await dragAndDrop(page, candidateCard, targetColumn);

    // Verify visual move
    await expect(targetColumn.getByText('Jane Smith')).toBeVisible();

    // Verify request body has correct stage ID (Manager Interview = stage id 3)
    expect(putBody).not.toBeNull();
    expect(putBody.applicationId).toBe(102);
    expect(putBody.currentInterviewStep).toBe(3);
  });

  test('backend responds successfully after stage change', async ({ page }) => {
    // Track the response status from our mocked PUT endpoint
    let responseStatus: number | null = null;

    await page.route('**/candidates/**', (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        responseStatus = 200;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Candidate updated successfully' }),
        });
      } else {
        route.continue();
      }
    });

    // Perform a drag and wait for the PUT response to confirm completion
    const candidateCard = page.locator('[data-rbd-draggable-id="1"]');
    const targetColumn = page.locator('[data-rbd-droppable-id="2"]');

    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/candidates/') && resp.request().method() === 'PUT'),
      dragAndDrop(page, candidateCard, targetColumn),
    ]);

    // Verify the response was successful
    expect(response.status()).toBe(200);
    expect(responseStatus).toBe(200);

    // Confirm the candidate moved visually
    await expect(targetColumn.getByText('John Doe')).toBeVisible();
  });
});
