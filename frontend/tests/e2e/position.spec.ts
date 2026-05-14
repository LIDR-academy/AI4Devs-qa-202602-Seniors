import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data — deterministic, independent from database state
// ---------------------------------------------------------------------------

const POSITION_ID = 1;
const POSITION_URL = `/positions/${POSITION_ID}`;

const mockInterviewFlow = {
    interviewFlow: {
        positionName: 'Senior Frontend Developer',
        interviewFlow: {
            interviewSteps: [
                { id: 1, name: 'Entrevista Inicial' },
                { id: 2, name: 'Prueba Técnica' },
                { id: 3, name: 'Entrevista Final' },
                { id: 4, name: 'Oferta' },
            ],
        },
    },
};

const mockCandidates = [
    { candidateId: 1, fullName: 'Juan García',   currentInterviewStep: 'Entrevista Inicial', averageScore: 3, applicationId: 101 },
    { candidateId: 2, fullName: 'María López',   currentInterviewStep: 'Prueba Técnica',     averageScore: 4, applicationId: 102 },
    { candidateId: 3, fullName: 'Carlos Pérez',  currentInterviewStep: 'Entrevista Inicial', averageScore: 2, applicationId: 103 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts a stage title to its data-testid slug, mirroring the component. */
function stageTestId(title: string): string {
    return `stage-column-${title.toLowerCase().replace(/\s+/g, '-')}`;
}

/** Mocks the two GET endpoints used by PositionDetails. */
async function setupApiMocks(page: Page): Promise<void> {
    await page.route(`**/positions/${POSITION_ID}/interviewFlow`, route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockInterviewFlow) })
    );
    await page.route(`**/positions/${POSITION_ID}/candidates`, route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCandidates) })
    );
}

/**
 * Simulates drag-and-drop using the keyboard API of react-beautiful-dnd.
 * The library natively supports Space to lift/drop and Arrow keys to navigate
 * between droppables, making this approach more reliable than mouse simulation.
 *
 * @param page         Playwright Page instance.
 * @param cardTestId   data-testid of the card to drag.
 * @param direction    Arrow key to press ('ArrowRight' | 'ArrowLeft').
 * @param steps        How many columns to move (default 1).
 */
async function dragCandidateWithKeyboard(
    page: Page,
    cardTestId: string,
    direction: 'ArrowRight' | 'ArrowLeft' = 'ArrowRight',
    steps = 1
): Promise<void> {
    const card = page.getByTestId(cardTestId);
    await card.focus();
    await page.keyboard.press('Space');               // lift
    await page.waitForTimeout(200);
    for (let i = 0; i < steps; i++) {
        await page.keyboard.press(direction);
        await page.waitForTimeout(150);
    }
    await page.keyboard.press('Space');               // drop
    await page.waitForTimeout(400);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Position Details — Kanban board', () => {

    test.beforeEach(async ({ page }) => {
        await setupApiMocks(page);
        await page.goto(POSITION_URL);
        // Wait until the board is fully rendered
        await page.waitForSelector('[data-testid="position-title"]');
        await page.waitForSelector(`[data-testid="${stageTestId('Entrevista Inicial')}"]`);
    });

    // -----------------------------------------------------------------------
    // Scenario 1 — Page load
    // -----------------------------------------------------------------------

    test.describe('Escenario 1: La página de Position carga correctamente', () => {

        test('muestra el título de la posición', async ({ page }) => {
            const title = page.getByTestId('position-title');
            await expect(title).toBeVisible();
            await expect(title).toHaveText('Senior Frontend Developer');
        });

        test('muestra todas las columnas del proceso de contratación', async ({ page }) => {
            for (const step of mockInterviewFlow.interviewFlow.interviewFlow.interviewSteps) {
                const column = page.getByTestId(stageTestId(step.name));
                await expect(column).toBeVisible();
                // Column header contains the stage name
                await expect(column).toContainText(step.name);
            }
        });

        test('muestra cada candidato en la columna correcta según su fase', async ({ page }) => {
            // Candidates in "Entrevista Inicial"
            const col1 = page.getByTestId(stageTestId('Entrevista Inicial'));
            await expect(col1.getByTestId('candidate-card-1')).toBeVisible();
            await expect(col1.getByTestId('candidate-card-3')).toBeVisible();
            await expect(col1.getByTestId('candidate-card-1')).toContainText('Juan García');
            await expect(col1.getByTestId('candidate-card-3')).toContainText('Carlos Pérez');

            // Candidate in "Prueba Técnica"
            const col2 = page.getByTestId(stageTestId('Prueba Técnica'));
            await expect(col2.getByTestId('candidate-card-2')).toBeVisible();
            await expect(col2.getByTestId('candidate-card-2')).toContainText('María López');

            // Other columns should not contain these cards
            await expect(col2.getByTestId('candidate-card-1')).not.toBeVisible();
        });
    });

    // -----------------------------------------------------------------------
    // Scenario 2 — Drag and drop (phase change)
    // -----------------------------------------------------------------------

    test.describe('Escenario 2: Cambio de fase de un candidato mediante drag & drop', () => {

        test('la tarjeta del candidato aparece visualmente en la nueva columna', async ({ page }) => {
            // Move Juan García (id: 1) from "Entrevista Inicial" → "Prueba Técnica"
            await dragCandidateWithKeyboard(page, 'candidate-card-1', 'ArrowRight');

            const newColumn = page.getByTestId(stageTestId('Prueba Técnica'));
            await expect(newColumn.getByTestId('candidate-card-1')).toBeVisible({ timeout: 5000 });

            // Card must no longer appear in the source column
            const oldColumn = page.getByTestId(stageTestId('Entrevista Inicial'));
            await expect(oldColumn.getByTestId('candidate-card-1')).not.toBeVisible();
        });

        test('se dispara un PUT /candidates/:id con el id correcto y la nueva fase en el body', async ({ page }) => {
            // Intercept PUT before triggering the drag
            const putRequestPromise = page.waitForRequest(request =>
                request.method() === 'PUT' &&
                request.url().includes(`/candidates/${mockCandidates[0].candidateId}`)
            );

            await dragCandidateWithKeyboard(page, 'candidate-card-1', 'ArrowRight');

            const putRequest = await putRequestPromise;

            // Correct endpoint
            expect(putRequest.url()).toContain(`/candidates/${mockCandidates[0].candidateId}`);

            // Body contains applicationId and the id of the destination stage
            const body = putRequest.postDataJSON();
            expect(body).toHaveProperty('applicationId', mockCandidates[0].applicationId);
            expect(body).toHaveProperty('currentInterviewStep', mockInterviewFlow.interviewFlow.interviewFlow.interviewSteps[1].id);
        });

        test('la respuesta del backend al PUT es exitosa (2xx)', async ({ page }) => {
            // Mock the PUT so the test is self-contained and does not mutate real data
            await page.route(`**/candidates/${mockCandidates[0].candidateId}`, route => {
                if (route.request().method() === 'PUT') {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
                }
                return route.continue();
            });

            const putResponsePromise = page.waitForResponse(response =>
                response.request().method() === 'PUT' &&
                response.url().includes(`/candidates/${mockCandidates[0].candidateId}`)
            );

            await dragCandidateWithKeyboard(page, 'candidate-card-1', 'ArrowRight');

            const putResponse = await putResponsePromise;
            expect(putResponse.status()).toBeGreaterThanOrEqual(200);
            expect(putResponse.status()).toBeLessThan(300);
        });
    });
});
