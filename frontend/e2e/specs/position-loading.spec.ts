import { expect, test } from '@playwright/test';
import { PositionPage } from '../pages/PositionPage';
import {
  cloneCandidates,
  cloneFlow,
  DEFAULT_POSITION_NAME,
  phaseNames,
  POSITION_ID,
  setupPositionRoutes,
  type Candidate,
} from '../fixtures/mockApi';

const PHASE_NAMES = phaseNames();

test.describe('Scenario 1 — Loading the Position Page', () => {
  test.describe('Happy path', () => {
    test('[S1-TC01] should render the position title with the value returned by interviewFlow', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page);
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert
      await positionPage.expectPositionTitle(DEFAULT_POSITION_NAME);
    });

    test('[S1-TC02] should render all six hiring-phase columns in the order returned by the backend', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page);
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert
      await positionPage.expectColumnsInOrder(PHASE_NAMES);
    });

    test('[S1-TC03] should render each candidate card under the column matching its current phase', async ({ page }) => {
      // Arrange
      const candidates = cloneCandidates();
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);
      await positionPage.expectColumnsInOrder(PHASE_NAMES);

      // Assert
      for (const candidate of candidates) {
        await positionPage.expectCardInColumn(candidate.candidateId, candidate.currentInterviewStep);
        for (const other of PHASE_NAMES.filter((p) => p !== candidate.currentInterviewStep)) {
          await positionPage.expectCardNotInColumn(candidate.candidateId, other);
        }
      }
    });

    test('[S1-TC04] should render each card with the candidate full name and one rating glyph per score point', async ({ page }) => {
      // Arrange
      const candidates = cloneCandidates();
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert — name visible and rating cardinality matches averageScore
      for (const candidate of candidates) {
        const card = positionPage.card(candidate.candidateId);
        await expect(card).toContainText(candidate.fullName);
        await expect(card.locator('span[role="img"][aria-label="rating"]')).toHaveCount(candidate.averageScore);
      }
    });
  });

  test.describe('Corner cases', () => {
    test('[S1-TC05] should render all columns empty when the position has zero candidates', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page, { candidates: { status: 200, body: [] } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);
      await positionPage.expectColumnsInOrder(PHASE_NAMES);

      // Assert
      for (const name of PHASE_NAMES) {
        await expect(positionPage.cardsIn(name)).toHaveCount(0);
      }
    });

    test('[S1-TC06] should render mixed empty and populated phases without crashing', async ({ page }) => {
      // Arrange
      const candidates: Candidate[] = [
        { candidateId: 201, fullName: 'Solo Applicant', currentInterviewStep: 'Applied', averageScore: 3, applicationId: 2001 },
        { candidateId: 202, fullName: 'Solo Offeree',   currentInterviewStep: 'Offer',   averageScore: 5, applicationId: 2002 },
      ];
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);
      await positionPage.expectColumnsInOrder(PHASE_NAMES);

      // Assert
      await expect(positionPage.cardsIn('Applied')).toHaveCount(1);
      await expect(positionPage.cardsIn('Offer')).toHaveCount(1);
      await expect(positionPage.cardsIn('Interview')).toHaveCount(0);
      await expect(positionPage.cardsIn('Technical Test')).toHaveCount(0);
      await expect(positionPage.cardsIn('Hired')).toHaveCount(0);
      await expect(positionPage.cardsIn('Rejected')).toHaveCount(0);
    });

    test('[S1-TC07] should render a large number of candidates in the same phase without losing any card', async ({ page }) => {
      // Arrange — 50 candidates in "Applied"
      const candidates: Candidate[] = Array.from({ length: 50 }, (_, i) => ({
        candidateId: 1000 + i,
        applicationId: 5000 + i,
        fullName: `Candidate ${i + 1}`,
        currentInterviewStep: 'Applied',
        averageScore: (i % 5) + 1,
      }));
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert
      await expect(positionPage.cardsIn('Applied')).toHaveCount(50);
      await expect(positionPage.card(1000)).toBeVisible();
      await expect(positionPage.card(1049)).toBeAttached();
    });

    test('[S1-TC08] should not crash when a candidate has incomplete data (empty name, zero score)', async ({ page }) => {
      // Arrange
      const candidates: Candidate[] = [
        { candidateId: 301, fullName: '', currentInterviewStep: 'Applied', averageScore: 0, applicationId: 3001 },
      ];
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Act
      await positionPage.goto(POSITION_ID);
      await positionPage.expectColumnsInOrder(PHASE_NAMES);

      // Assert
      await expect(positionPage.card(301)).toBeVisible();
      await expect(positionPage.card(301).locator('span[role="img"][aria-label="rating"]')).toHaveCount(0);
      expect(pageErrors, `Unexpected page errors: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);
    });

    test('[S1-TC09] should not render orphan candidates whose phase does not match any column', async ({ page }) => {
      // Arrange — one valid candidate + one orphan with an unknown step name
      const candidates: Candidate[] = [
        { candidateId: 401, fullName: 'Valid Person',  currentInterviewStep: 'Applied',  averageScore: 4, applicationId: 4001 },
        { candidateId: 402, fullName: 'Orphan Person', currentInterviewStep: 'Archived', averageScore: 3, applicationId: 4002 },
      ];
      await setupPositionRoutes(page, { candidates: { status: 200, body: candidates } });
      const positionPage = new PositionPage(page);

      // Act
      await positionPage.goto(POSITION_ID);
      await positionPage.expectColumnsInOrder(PHASE_NAMES);

      // Assert — orphan is not rendered anywhere; valid candidate is rendered in Applied
      await expect(positionPage.card(402)).toHaveCount(0);
      await positionPage.expectCardInColumn(401, 'Applied');
    });

    test('[S1-TC10] should not display columns before the slow interview-flow response resolves', async ({ page }) => {
      // Arrange — 1500 ms delay on interviewFlow
      await setupPositionRoutes(page, {
        interviewFlow: { status: 200, body: cloneFlow(), delayMs: 1500 },
      });
      const positionPage = new PositionPage(page);

      // Act — start navigation; do not await
      const navigation = positionPage.goto(POSITION_ID);

      // Assert — columns are absent before the response lands
      await expect(positionPage.columnHeaders()).toHaveCount(0);
      await navigation;

      // After the response resolves, columns appear
      await positionPage.expectColumnsInOrder(PHASE_NAMES);
    });
  });

  test.describe('Error cases', () => {
    test('[S1-TC11] should not render any column when the position ID does not exist (404 on both endpoints)', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page, {
        positionId: '99999',
        interviewFlow: { status: 404, body: { message: 'Not found' } },
        candidates: { status: 404, body: { message: 'Not found' } },
      });
      const positionPage = new PositionPage(page);
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Act
      await positionPage.goto('99999');

      // Assert
      await expect(positionPage.columnHeaders()).toHaveCount(0);
      expect(pageErrors).toHaveLength(0);
    });

    test('[S1-TC12] should not crash when the interview-flow endpoint returns a 5xx error', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page, {
        interviewFlow: { status: 500, body: { message: 'Internal error' } },
      });
      const positionPage = new PositionPage(page);
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert
      await expect(positionPage.columnHeaders()).toHaveCount(0);
      expect(pageErrors).toHaveLength(0);
    });

    test('[S1-TC13] should render columns but no cards when only the candidates endpoint fails (4xx)', async ({ page }) => {
      // Production bug: PositionDetails.js:40 calls `candidates.filter(...)`
      // on the response body without checking `response.ok`. When the body is
      // an error object instead of an array, the throw inside the setStages
      // updater unmounts the React tree (no error boundary above), wiping the
      // columns we expect to see. Catalog OQ-4 / OQ-8.
      test.fail(true, 'Bug: candidates.filter() is invoked on a non-array error body; the resulting TypeError crashes the component tree.');

      await setupPositionRoutes(page, {
        candidates: { status: 400, body: { message: 'Bad request' } },
      });
      const positionPage = new PositionPage(page);
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert (desired behaviour — currently fails)
      await positionPage.expectColumnsInOrder(PHASE_NAMES);
      for (const name of PHASE_NAMES) {
        await expect(positionPage.cardsIn(name)).toHaveCount(0);
      }
      expect(pageErrors).toHaveLength(0);
    });

    test('[S1-TC14] should not crash when interview-flow is aborted at network level', async ({ page }) => {
      // Arrange
      await setupPositionRoutes(page, { interviewFlow: { abort: 'failed' } });
      const positionPage = new PositionPage(page);
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Act
      await positionPage.goto(POSITION_ID);

      // Assert
      await expect(positionPage.columnHeaders()).toHaveCount(0);
      expect(pageErrors).toHaveLength(0);
    });

    test.skip('[S1-TC15] should redirect or show an unauthorised state when the user is not logged in', async () => {
      // Skipped — the frontend has no authentication layer (no login route, no
      // auth headers, no protected routes). This case is not applicable to the
      // current implementation. Re-enable when authentication lands. See open
      // question OQ-1 in docs/position-e2e-test-cases.md.
    });
  });
});
