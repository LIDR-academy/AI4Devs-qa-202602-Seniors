import { test, expect, Page, Locator } from "@playwright/test";

async function dragCard(
  page: Page,
  sourceLocator: Locator,
  targetLocator: Locator,
): Promise<void> {
  const source = await sourceLocator.boundingBox();
  const target = await targetLocator.boundingBox();

  if (!source || !target)
    throw new Error("dragCard: could not get bounding boxes");

  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  // RBD necesita un micro-movimiento + delay para detectar el inicio del drag
  await page.mouse.move(
    source.x + source.width / 2 + 10,
    source.y + source.height / 2 + 10,
    { steps: 5 },
  );
  await page.waitForTimeout(250);
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 20 },
  );
  await page.waitForTimeout(250);
  await page.mouse.up();
}

const INTERVIEW_FLOW_MOCK = {
  interviewFlow: {
    positionName: "Senior Full-Stack Engineer",
    interviewFlow: {
      id: 1,
      description: "Standard development interview process",
      interviewSteps: [
        { id: 1, interviewFlowId: 1, name: "Initial Screening", orderIndex: 1 },
        {
          id: 2,
          interviewFlowId: 1,
          name: "Technical Interview",
          orderIndex: 2,
        },
        { id: 3, interviewFlowId: 1, name: "Manager Interview", orderIndex: 3 },
        { id: 4, interviewFlowId: 1, name: "Offer", orderIndex: 4 },
      ],
    },
  },
};

const CANDIDATES_MOCK = [
  {
    candidateId: 1,
    fullName: "John Doe",
    currentInterviewStep: "Initial Screening",
    averageScore: 4,
    applicationId: 10,
  },
  {
    candidateId: 2,
    fullName: "Jane Smith",
    currentInterviewStep: "Technical Interview",
    averageScore: 5,
    applicationId: 11,
  },
  {
    candidateId: 3,
    fullName: "Carlos Ruiz",
    currentInterviewStep: "Initial Screening",
    averageScore: 3,
    applicationId: 12,
  },
  {
    candidateId: 4,
    fullName: "Maria Lopez",
    currentInterviewStep: "Manager Interview",
    averageScore: 4,
    applicationId: 13,
  },
];

test.describe("Position page", () => {
  test.beforeEach(async ({ page }) => {
    // --- Given: endpoints mockeados ---
    await page.route("**/positions/1/interviewFlow", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(INTERVIEW_FLOW_MOCK),
      });
    });

    await page.route("**/positions/1/candidates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(CANDIDATES_MOCK),
      });
    });

    // --- When: navego a la página ---
    await page.goto("/positions/1");

    // Anti-flakiness: espero a que el título esté visible antes de cada test
    await expect(page.getByTestId("position-title")).toBeVisible();
  });

  test("Escenario 1: la página de Position carga correctamente", async ({
    page,
  }) => {
    // --- Then 1: el título muestra el nombre correcto ---
    await expect(page.getByTestId("position-title")).toHaveText(
      "Senior Full-Stack Engineer",
    );

    // --- Then 2: hay exactamente 4 columnas de fase ---
    const columns = page.getByTestId("stage-column");
    await expect(columns).toHaveCount(4);

    // --- Then 3: cada fase tiene su columna con el nombre correcto en el header ---
    const phases = [
      "Initial Screening",
      "Technical Interview",
      "Manager Interview",
      "Offer",
    ];
    for (const phase of phases) {
      const column = page.locator(
        `[data-testid="stage-column"][data-stage-name="${phase}"]`,
      );
      await expect(column).toBeVisible();
      await expect(column.getByTestId("stage-column-header")).toHaveText(phase);
    }

    // --- Then 4: "Initial Screening" contiene "John Doe" y "Carlos Ruiz" ---
    const initialScreeningColumn = page.locator(
      '[data-testid="stage-column"][data-stage-name="Initial Screening"]',
    );
    const initialScreeningCards =
      initialScreeningColumn.getByTestId("candidate-card");
    await expect(initialScreeningCards).toHaveCount(2);
    await expect(initialScreeningColumn.getByText("John Doe")).toBeVisible();
    await expect(initialScreeningColumn.getByText("Carlos Ruiz")).toBeVisible();

    // --- Then 5: "Technical Interview" contiene "Jane Smith" ---
    const technicalColumn = page.locator(
      '[data-testid="stage-column"][data-stage-name="Technical Interview"]',
    );
    await expect(technicalColumn.getByTestId("candidate-card")).toHaveCount(1);
    await expect(technicalColumn.getByText("Jane Smith")).toBeVisible();

    // --- Then 6: "Manager Interview" contiene "Maria Lopez" ---
    const managerColumn = page.locator(
      '[data-testid="stage-column"][data-stage-name="Manager Interview"]',
    );
    await expect(managerColumn.getByTestId("candidate-card")).toHaveCount(1);
    await expect(managerColumn.getByText("Maria Lopez")).toBeVisible();

    // --- Then 7: "Offer" no contiene ninguna tarjeta ---
    const offerColumn = page.locator(
      '[data-testid="stage-column"][data-stage-name="Offer"]',
    );
    await expect(offerColumn.getByTestId("candidate-card")).toHaveCount(0);
  });

  test("Escenario 2: mover candidato a otra fase dispara PUT /candidates/:id", async ({
    page,
  }) => {
    // --- Given: intercepción adicional para el PUT ---
    let capturedPutUrl: string | null = null;
    let capturedPutBody: Record<string, unknown> | null = null;

    await page.route("**/candidates/*", async (route) => {
      if (route.request().method() === "PUT") {
        capturedPutUrl = route.request().url();
        capturedPutBody = JSON.parse(route.request().postData() ?? "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Candidate updated successfully" }),
        });
      } else {
        await route.continue();
      }
    });

    // --- When: arrastro "John Doe" de "Initial Screening" a "Technical Interview" ---
    const sourceCard = page
      .locator(
        '[data-testid="stage-column"][data-stage-name="Initial Screening"]',
      )
      .locator('[data-candidate-id="1"]');
    const targetColumn = page.locator(
      '[data-testid="stage-column"][data-stage-name="Technical Interview"]',
    );

    // Registro la promesa ANTES de soltar el ratón para capturarla de forma fiable
    const putRequestPromise = page.waitForRequest(
      (req) => req.method() === "PUT" && req.url().includes("/candidates/1"),
    );

    await dragCard(page, sourceCard, targetColumn);

    const putRequest = await putRequestPromise;

    // --- Then: UI — "John Doe" aparece en "Technical Interview" ---
    await expect(
      page
        .locator(
          '[data-testid="stage-column"][data-stage-name="Technical Interview"]',
        )
        .getByText("John Doe"),
    ).toBeVisible();

    // --- Then: Backend — URL termina en /candidates/1 ---
    expect(putRequest.url()).toMatch(/\/candidates\/1$/);

    // --- Then: Body — campos correctos y con tipos numéricos ---
    const body = JSON.parse(putRequest.postData() ?? "{}") as Record<
      string,
      unknown
    >;
    expect(body.currentInterviewStep).toBe(2); // id numérico de "Technical Interview"
    expect(body.applicationId).toBe(10); // applicationId de John Doe
    expect(typeof body.currentInterviewStep).toBe("number");
    expect(typeof body.applicationId).toBe("number");

    // --- Then: Respuesta HTTP 200 ---
    const putResponse = await putRequest.response();
    expect(putResponse?.status()).toBe(200);
  });
});
